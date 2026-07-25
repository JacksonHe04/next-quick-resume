import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  batches,
  officialCompanies,
  officialPositions,
  submissions,
  users,
} from "@/db/schema";
import { listSubmissionViews } from "@/modules/submissions/repository";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("D1 submission views", () => {
  const now = new Date("2026-07-25T00:00:00.000Z");
  let close: () => void;
  let database: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(async () => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    database = drizzle(testDatabase.binding, { schema });
    await database.insert(users).values({
      id: "user-a",
      email: "a@example.com",
      passwordHash: "hash",
      name: "A",
      emailVerifiedAt: now,
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
    await database.insert(officialCompanies).values({
      id: "company-a",
      name: "OpenAI",
      normalizedName: "openai",
      careersUrl: "https://openai.com/careers",
      processUrl: "https://openai.com/careers/applications",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(officialPositions).values({
      id: "position-a",
      name: "产品经理",
      normalizedName: "产品经理",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(submissions).values({
      id: "submission-a",
      userId: "user-a",
      clientMutationId: "mutation-a",
      batchId: "batch-a",
      officialCompanyId: "company-a",
      officialPositionId: "position-a",
      positionName: "平台产品经理",
      appliedAt: now,
      statusSource: "direct",
      directStatus: "submitted",
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(() => close());

  it("includes the related company recruitment and process URLs", async () => {
    await expect(
      listSubmissionViews(database, "user-a"),
    ).resolves.toEqual([
      expect.objectContaining({
        id: "submission-a",
        companyCareersUrl: "https://openai.com/careers",
        companyProcessUrl:
          "https://openai.com/careers/applications",
      }),
    ]);
  });
});
