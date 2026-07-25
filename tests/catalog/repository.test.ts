import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { officialCompanies, users } from "@/db/schema";
import { createCatalogRepository } from "@/modules/catalog/repository";
import { createPrivateCatalogEntry } from "@/modules/catalog/service";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("D1 catalog repository", () => {
  let close: () => void;
  let database: ReturnType<typeof drizzle<typeof schema>>;
  let repository: ReturnType<typeof createCatalogRepository>;

  beforeEach(async () => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    database = drizzle(testDatabase.binding, { schema });
    repository = createCatalogRepository(database);
    const now = new Date("2026-07-25T00:00:00.000Z");
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
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(() => close());

  it("returns official rows to everyone but isolates private rows by user", async () => {
    await createPrivateCatalogEntry(
      repository,
      "user-a",
      "company",
      { name: "OpenAI APAC" },
    );

    await expect(
      repository.searchOfficial("company", "openai"),
    ).resolves.toHaveLength(1);
    await expect(
      repository.searchPrivate("company", "user-a", "openai"),
    ).resolves.toHaveLength(1);
    await expect(
      repository.searchPrivate("company", "user-b", "openai"),
    ).resolves.toEqual([]);
  });

  it("returns the full personal company directory", async () => {
    for (let index = 0; index < 25; index += 1) {
      await createPrivateCatalogEntry(
        repository,
        "user-a",
        "company",
        { name: `Company ${String(index).padStart(2, "0")}` },
      );
    }

    await expect(
      repository.searchPrivate("company", "user-a", ""),
    ).resolves.toHaveLength(25);
  });
});
