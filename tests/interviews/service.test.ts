import { describe, expect, it } from "vitest";

import {
  createInterview,
  deleteInterview,
  updateInterview,
  type InterviewRecord,
  type InterviewRepository,
  type InterviewSubmission,
} from "@/modules/interviews/service";

class MemoryInterviewRepository implements InterviewRepository {
  submissions = new Map<string, InterviewSubmission>();
  interviews = new Map<string, InterviewRecord>();
  validStages = new Set(["stage-first"]);

  async findSubmission(userId: string, id: string) {
    const submission = this.submissions.get(id);
    return submission?.userId === userId ? submission : null;
  }

  async findInterview(userId: string, id: string) {
    const interview = this.interviews.get(id);
    return interview?.userId === userId ? interview : null;
  }

  async stageExists(id: string) {
    return this.validStages.has(id);
  }

  async insert(record: InterviewRecord) {
    this.interviews.set(record.id, record);
  }

  async insertAndAdvance(record: InterviewRecord) {
    this.interviews.set(record.id, record);
    const submission = this.submissions.get(record.submissionId)!;
    submission.statusSource = "interview";
    submission.currentInterviewId = record.id;
  }

  async updateOnly(
    id: string,
    changes: Partial<InterviewRecord>,
  ) {
    Object.assign(this.interviews.get(id)!, changes);
  }

  async updateAndAdvance(
    record: InterviewRecord,
    changes: Partial<InterviewRecord>,
  ) {
    Object.assign(record, changes);
    const submission = this.submissions.get(record.submissionId)!;
    submission.statusSource = "interview";
    submission.currentInterviewId = record.id;
  }

  async findLatestOther(
    userId: string,
    submissionId: string,
    excludedId: string,
  ) {
    return (
      [...this.interviews.values()]
        .filter(
          (interview) =>
            interview.userId === userId &&
            interview.submissionId === submissionId &&
            interview.id !== excludedId,
        )
        .sort(
          (left, right) =>
            right.updatedAt.getTime() - left.updatedAt.getTime(),
        )[0] ?? null
    );
  }

  async deleteAndRewind(
    interview: InterviewRecord,
    fallbackId: string | null,
  ) {
    this.interviews.delete(interview.id);
    const submission = this.submissions.get(interview.submissionId)!;
    if (submission.currentInterviewId === interview.id) {
      submission.currentInterviewId = fallbackId;
      submission.statusSource = fallbackId ? "interview" : "direct";
    }
  }
}

function submission(
  directStatus: InterviewSubmission["directStatus"] = "submitted",
): InterviewSubmission {
  return {
    id: "submission-a",
    userId: "user-a",
    directStatus,
    statusSource: "direct",
    currentInterviewId: null,
  };
}

const now = new Date("2026-07-25T00:00:00.000Z");

describe("interview service", () => {
  it("advances the submission to the updated interview", async () => {
    const repository = new MemoryInterviewRepository();
    repository.submissions.set("submission-a", submission());
    const interview = await createInterview(
      repository,
      "user-a",
      {
        submissionId: "submission-a",
        stageId: "stage-first",
        name: "产品一面",
        status: "pending_interview",
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

    expect(repository.interviews.get(interview.id)?.status).toBe("passed");
    expect(repository.submissions.get("submission-a")).toMatchObject({
      statusSource: "interview",
      currentInterviewId: interview.id,
    });
  });

  it("does not overwrite an offer terminal status", async () => {
    const repository = new MemoryInterviewRepository();
    repository.submissions.set("submission-a", submission("offer"));

    const interview = await createInterview(
      repository,
      "user-a",
      {
        submissionId: "submission-a",
        stageId: "stage-first",
        name: "HR 面",
        status: "failed",
      },
      now,
    );

    expect(repository.interviews.has(interview.id)).toBe(true);
    expect(repository.submissions.get("submission-a")).toMatchObject({
      directStatus: "offer",
      statusSource: "direct",
      currentInterviewId: null,
    });
  });

  it("rewinds to the latest remaining interview when deleting the current one", async () => {
    const repository = new MemoryInterviewRepository();
    repository.submissions.set("submission-a", submission());
    const first = await createInterview(
      repository,
      "user-a",
      {
        submissionId: "submission-a",
        stageId: "stage-first",
        name: "一面",
        status: "passed",
      },
      new Date(now.getTime() - 1_000),
    );
    const second = await createInterview(
      repository,
      "user-a",
      {
        submissionId: "submission-a",
        stageId: "stage-first",
        name: "加面",
        status: "pending_result",
      },
      now,
    );

    await deleteInterview(repository, "user-a", second.id);

    expect(repository.submissions.get("submission-a")).toMatchObject({
      statusSource: "interview",
      currentInterviewId: first.id,
    });
  });
});
