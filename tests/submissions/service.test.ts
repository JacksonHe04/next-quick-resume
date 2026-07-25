import { describe, expect, it } from "vitest";

import {
  createSubmission,
  type SubmissionRecord,
  type SubmissionRepository,
  updateSubmission,
} from "@/modules/submissions/service";

class MemorySubmissionRepository implements SubmissionRepository {
  submissions: SubmissionRecord[] = [];
  validBatches = new Set(["user-a:batch-a"]);
  validReferences = new Set([
    "user-a:company:official:company-a",
    "user-a:company:private:private-company-a",
    "user-a:position:official:position-a",
    "user-a:position:private:private-position-a",
  ]);

  async findByMutationId(userId: string, mutationId: string) {
    return (
      this.submissions.find(
        (submission) =>
          submission.userId === userId &&
          submission.clientMutationId === mutationId,
      ) ?? null
    );
  }

  async findById(userId: string, id: string) {
    return (
      this.submissions.find(
        (submission) =>
          submission.userId === userId && submission.id === id,
      ) ?? null
    );
  }

  async list(userId: string) {
    return this.submissions.filter(
      (submission) => submission.userId === userId,
    );
  }

  async batchBelongsToUser(userId: string, batchId: string) {
    return this.validBatches.has(`${userId}:${batchId}`);
  }

  async catalogReferenceExists(
    userId: string,
    entity: "company" | "position",
    source: "official" | "private",
    id: string,
  ) {
    return this.validReferences.has(
      `${userId}:${entity}:${source}:${id}`,
    );
  }

  async insert(record: SubmissionRecord) {
    this.submissions.push(record);
  }

  async update(
    userId: string,
    id: string,
    changes: Partial<SubmissionRecord>,
  ) {
    const submission = await this.findById(userId, id);
    if (submission) Object.assign(submission, changes);
  }

  async delete(userId: string, id: string) {
    this.submissions = this.submissions.filter(
      (submission) =>
        !(submission.userId === userId && submission.id === id),
    );
  }
}

const input = {
  clientMutationId: "mutation-a",
  batchId: "batch-a",
  company: { source: "official" as const, id: "company-a" },
  position: { source: "official" as const, id: "position-a" },
  positionName: "Agent 平台产品经理",
  appliedAt: "2026-07-25T00:00:00.000Z",
  channel: "官网",
};

describe("submission service", () => {
  it("returns the same submission for a retried mutation id", async () => {
    const repository = new MemorySubmissionRepository();

    const first = await createSubmission(
      repository,
      "user-a",
      input,
    );
    const retry = await createSubmission(
      repository,
      "user-a",
      input,
    );

    expect(retry.id).toBe(first.id);
    expect(repository.submissions).toHaveLength(1);
  });

  it("stores the position concept separately from the submitted position name", async () => {
    const repository = new MemorySubmissionRepository();

    const submission = await createSubmission(
      repository,
      "user-a",
      input,
    );

    expect(submission).toMatchObject({
      officialPositionId: "position-a",
      privatePositionId: null,
      positionName: "Agent 平台产品经理",
    });
  });

  it("rejects private companies even when the legacy row belongs to the user", async () => {
    const repository = new MemorySubmissionRepository();

    await expect(
      createSubmission(repository, "user-a", {
        ...input,
        company: {
          source: "private",
          id: "private-company-a",
        },
      }),
    ).rejects.toMatchObject({ name: "ZodError" });
  });

  it("lets a manual status update override interview-derived progress", async () => {
    const repository = new MemorySubmissionRepository();
    const submission = await createSubmission(
      repository,
      "user-a",
      input,
      new Date("2026-07-25T00:00:00.000Z"),
    );
    submission.statusSource = "interview";
    submission.currentInterviewId = "interview-a";

    await updateSubmission(
      repository,
      "user-a",
      submission.id,
      { directStatus: "offer" },
      new Date("2026-07-25T01:00:00.000Z"),
    );

    expect(submission).toMatchObject({
      directStatus: "offer",
      statusSource: "direct",
      currentInterviewId: null,
    });
  });
});
