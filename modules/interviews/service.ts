import {
  createInterviewInputSchema,
  updateInterviewInputSchema,
} from "@/modules/interviews/schemas";
import { shouldAdvanceSubmission } from "@/modules/interviews/status";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

export type InterviewRecord = {
  id: string;
  userId: string;
  submissionId: string;
  stageId: string;
  name: string;
  scheduledAt: Date | null;
  durationMinutes: number | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  reviewMarkdown: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InterviewSubmission = {
  id: string;
  userId: string;
  directStatus: DirectSubmissionStatus;
  statusSource: "direct" | "interview";
  currentInterviewId: string | null;
};

export type InterviewErrorCode =
  | "INTERVIEW_NOT_FOUND"
  | "SUBMISSION_NOT_FOUND"
  | "STAGE_NOT_FOUND";

export class InterviewError extends Error {
  constructor(
    public readonly code: InterviewErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "InterviewError";
  }
}

export interface InterviewRepository {
  findSubmission(
    userId: string,
    id: string,
  ): Promise<InterviewSubmission | null>;
  findInterview(
    userId: string,
    id: string,
  ): Promise<InterviewRecord | null>;
  stageExists(id: string): Promise<boolean>;
  insert(record: InterviewRecord): Promise<void>;
  insertAndAdvance(record: InterviewRecord): Promise<void>;
  updateOnly(
    id: string,
    changes: Partial<InterviewRecord>,
  ): Promise<void>;
  updateAndAdvance(
    record: InterviewRecord,
    changes: Partial<InterviewRecord>,
  ): Promise<void>;
  findLatestOther(
    userId: string,
    submissionId: string,
    excludedId: string,
  ): Promise<InterviewRecord | null>;
  deleteAndRewind(
    interview: InterviewRecord,
    fallbackId: string | null,
  ): Promise<void>;
}

async function requireSubmission(
  repository: InterviewRepository,
  userId: string,
  id: string,
) {
  const submission = await repository.findSubmission(userId, id);
  if (!submission) {
    throw new InterviewError(
      "SUBMISSION_NOT_FOUND",
      "投递记录不存在",
    );
  }
  return submission;
}

async function requireInterview(
  repository: InterviewRepository,
  userId: string,
  id: string,
) {
  const interview = await repository.findInterview(userId, id);
  if (!interview) {
    throw new InterviewError(
      "INTERVIEW_NOT_FOUND",
      "选拔事件不存在",
    );
  }
  return interview;
}

async function requireStage(
  repository: InterviewRepository,
  id: string,
) {
  if (!(await repository.stageExists(id))) {
    throw new InterviewError("STAGE_NOT_FOUND", "选拔阶段不存在");
  }
}

export async function createInterview(
  repository: InterviewRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<InterviewRecord> {
  const parsed = createInterviewInputSchema.parse(input);
  const submission = await requireSubmission(
    repository,
    userId,
    parsed.submissionId,
  );
  await requireStage(repository, parsed.stageId);
  const interview: InterviewRecord = {
    id: crypto.randomUUID(),
    userId,
    submissionId: parsed.submissionId,
    stageId: parsed.stageId,
    name: parsed.name,
    scheduledAt: parsed.scheduledAt ?? null,
    durationMinutes: parsed.durationMinutes ?? null,
    meetingUrl: parsed.meetingUrl ?? null,
    status: parsed.status,
    reviewMarkdown: parsed.reviewMarkdown ?? null,
    createdAt: now,
    updatedAt: now,
  };
  if (shouldAdvanceSubmission(submission.directStatus)) {
    await repository.insertAndAdvance(interview);
  } else {
    await repository.insert(interview);
  }
  return interview;
}

export async function updateInterview(
  repository: InterviewRepository,
  userId: string,
  id: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const interview = await requireInterview(repository, userId, id);
  const parsed = updateInterviewInputSchema.parse(input);
  if (parsed.stageId) await requireStage(repository, parsed.stageId);
  const submission = await requireSubmission(
    repository,
    userId,
    interview.submissionId,
  );
  const changes: Partial<InterviewRecord> = {
    ...parsed,
    updatedAt: now,
  };
  if (shouldAdvanceSubmission(submission.directStatus)) {
    await repository.updateAndAdvance(interview, changes);
  } else {
    await repository.updateOnly(interview.id, changes);
  }
}

export async function deleteInterview(
  repository: InterviewRepository,
  userId: string,
  id: string,
): Promise<void> {
  const interview = await requireInterview(repository, userId, id);
  const fallback = await repository.findLatestOther(
    userId,
    interview.submissionId,
    interview.id,
  );
  await repository.deleteAndRewind(interview, fallback?.id ?? null);
}
