import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  batches,
  companyCities,
  officialCities,
  officialCompanies,
  officialPositions,
  submissions,
  users,
} from "@/db/schema";
import {
  createCatalogRepository,
  listOfficialCompanies,
} from "@/modules/catalog/repository";
import { createPrivateCatalogEntry } from "@/modules/catalog/service";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

function limitStatementParameters(
  binding: D1Database,
  maximum: number,
): D1Database {
  function wrap(statement: D1PreparedStatement): D1PreparedStatement {
    return {
      bind(...values: unknown[]) {
        if (values.length > maximum) {
          throw new Error(
            `statement has ${values.length} parameters; maximum is ${maximum}`,
          );
        }
        return wrap(statement.bind(...values));
      },
      run: () => statement.run(),
      all: () => statement.all(),
      first: (column?: string) => statement.first(column),
      raw: (options?: { columnNames?: boolean }) =>
        statement.raw(options),
    } as D1PreparedStatement;
  }

  return {
    prepare: (sql: string) => wrap(binding.prepare(sql)),
    batch: (statements: D1PreparedStatement[]) =>
      binding.batch(statements),
  } as D1Database;
}

describe("D1 catalog repository", () => {
  const now = new Date("2026-07-25T00:00:00.000Z");
  let close: () => void;
  let database: ReturnType<typeof drizzle<typeof schema>>;
  let repository: ReturnType<typeof createCatalogRepository>;

  beforeEach(async () => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    database = drizzle(testDatabase.binding, { schema });
    repository = createCatalogRepository(database);
    await database.insert(users).values([
      {
        id: "user-a",
        email: "a@example.com",
        passwordHash: "hash",
        name: "A",
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-b",
        email: "b@example.com",
        passwordHash: "hash",
        name: "B",
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    await database.insert(officialCompanies).values({
      id: "official-a",
      name: "OpenAI",
      normalizedName: "openai",
      careersUrl: "https://openai.com/careers",
      processUrl: "https://openai.com/careers/applications",
      priority: "Top",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(() => close());

  it("returns official companies and isolates private positions by user", async () => {
    await createPrivateCatalogEntry(
      repository,
      "user-a",
      "position",
      { name: "产品运营" },
    );

    await expect(
      repository.searchOfficial("company", "openai"),
    ).resolves.toHaveLength(1);
    await expect(
      repository.searchPrivate("position", "user-a", "产品"),
    ).resolves.toHaveLength(1);
    await expect(
      repository.searchPrivate("position", "user-b", "产品"),
    ).resolves.toEqual([]);
  });

  it("returns the full personal position directory", async () => {
    for (let index = 0; index < 25; index += 1) {
      await createPrivateCatalogEntry(
        repository,
        "user-a",
        "position",
        { name: `Position ${String(index).padStart(2, "0")}` },
      );
    }

    await expect(
      repository.searchPrivate("position", "user-a", ""),
    ).resolves.toHaveLength(25);
  });

  it("lists official companies with cities and related submission counts", async () => {
    await database.insert(officialCities).values({
      id: "city-sf",
      name: "San Francisco",
      normalizedName: "san francisco",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(companyCities).values({
      companyId: "official-a",
      cityId: "city-sf",
      createdAt: now,
    });
    await database.insert(officialPositions).values({
      id: "position-pm",
      name: "产品经理",
      normalizedName: "产品经理",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(batches).values({
      id: "batch-a",
      userId: "user-a",
      name: "夏季探索",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(submissions).values({
      id: "submission-a",
      userId: "user-a",
      clientMutationId: "mutation-a",
      batchId: "batch-a",
      officialCompanyId: "official-a",
      officialPositionId: "position-pm",
      positionName: "产品经理",
      appliedAt: now,
      statusSource: "direct",
      directStatus: "submitted",
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await expect(listOfficialCompanies(database)).resolves.toEqual([
      expect.objectContaining({
        id: "official-a",
        careersUrl: "https://openai.com/careers",
        processUrl: "https://openai.com/careers/applications",
        priority: "Top",
        cities: ["San Francisco"],
        submissionCount: 1,
      }),
    ]);
  });

  it("lists a large official directory without exceeding the D1 statement parameter limit", async () => {
    await database.insert(officialCompanies).values(
      Array.from({ length: 100 }, (_, index) => ({
        id: `official-${index}`,
        name: `Company ${index}`,
        normalizedName: `company ${index}`,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
    );

    const limitedDatabase = drizzle(
      limitStatementParameters(
        (database as unknown as { session: { client: D1Database } })
          .session.client,
        100,
      ),
      { schema },
    );

    await expect(listOfficialCompanies(limitedDatabase)).resolves.toHaveLength(
      101,
    );
  });
});
