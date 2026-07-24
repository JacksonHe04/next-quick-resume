import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  batches,
  officialCompanies,
  officialPositions,
  stages,
  submissions,
  userPreferences,
  users,
} from "@/db/schema";
import { createInterviewRepository } from "@/modules/interviews/repository";
import {
  createInterview,
  updateInterview,
} from "@/modules/interviews/service";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("D1 interview advancement transaction", () => {
  let close: () => void;
  let database: ReturnType<typeof drizzle<typeof schema>>;
  let repository: ReturnType<typeof createInterviewRepository>;
  const now = new Date("2026-07-25T00:00:00.000Z");

  beforeEach(async () => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    database = drizzle(testDatabase.binding, { schema });
    repository = createInterviewRepository(database);
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
      name: "Batch",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(userPreferences).values({
      userId: "user-a",
      currentBatchId: "batch-a",
      timezone: "Asia/Singapore",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(officialCompanies).values({
      id: "company-a",
      name: "OpenAI",
      normalizedName: "openai",
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
    await database.insert(stages).values({
      id: "stage-a",
      code: "first_interview",
      name: "一面",
      sortOrder: 10,
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(submissions).values({
      id: "submission-a",
      userId: "user-a",
      clientMutationId: "mutation-a",
      batchId: "batch-a",
      officialCompanyId: "company-a",
      privateCompanyId: null,
      officialPositionId: "position-a",
      privatePositionId: null,
      positionName: "Agent 产品经理",
      appliedAt: now,
      statusSource: "direct",
      directStatus: "submitted",
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  });

  afterEach(() => close());

  it("persists the interview and advances the submission in one repository operation", async () => {
    const interview = await createInterview(
      repository,
      "user-a",
      {
        submissionId: "submission-a",
        stageId: "stage-a",
        name: "一面",
        status: "pending_result",
      },
      now,
    );
    await updateInterview(
      repository,
      "user-a",
      interview.id,
      { status: "passed" },
      now,
    );

    const [submission] = await database
      .select()
      .from(submissions)
      .where(eq(submissions.id, "submission-a"));
    await expect(
      repository.findInterview("user-a", interview.id),
    ).resolves.toMatchObject({ status: "passed" });
    expect(submission).toMatchObject({
      statusSource: "interview",
      currentInterviewId: interview.id,
    });
  });
});
