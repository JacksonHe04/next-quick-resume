import type {
  DIRECT_SUBMISSION_STATUSES,
  INTERVIEW_STATUSES,
} from "@/db/schema/hiring";
import {
  createSubmissionInputSchema,
  updateSubmissionInputSchema,
} from "@/modules/submissions/schemas";

export type DirectSubmissionStatus =
  (typeof DIRECT_SUBMISSION_STATUSES)[number];
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export type SubmissionRecord = {
  id: string;
  userId: string;
  clientMutationId: string;
  batchId: string;
  officialCompanyId: string | null;
  privateCompanyId: string | null;
  officialPositionId: string | null;
  privatePositionId: string | null;
  positionName: string;
  jdUrl: string | null;
  location: string | null;
  channel: string | null;
  appliedAt: Date;
  notesMarkdown: string | null;
  statusSource: "direct" | "interview";
  directStatus: DirectSubmissionStatus;
  currentInterviewId: string | null;
  statusUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SubmissionErrorCode =
  | "SUBMISSION_NOT_FOUND"
  | "INVALID_BATCH"
  | "INVALID_REFERENCE";

export class SubmissionError extends Error {
  constructor(
    public readonly code: SubmissionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SubmissionError";
  }
}

export interface SubmissionRepository {
  findByMutationId(
    userId: string,
    mutationId: string,
  ): Promise<SubmissionRecord | null>;
  findById(
    userId: string,
    id: string,
  ): Promise<SubmissionRecord | null>;
  list(userId: string): Promise<SubmissionRecord[]>;
  batchBelongsToUser(userId: string, batchId: string): Promise<boolean>;
  catalogReferenceExists(
    userId: string,
    entity: "company" | "position",
    source: "official" | "private",
    id: string,
  ): Promise<boolean>;
  insert(record: SubmissionRecord): Promise<void>;
  update(
    userId: string,
    id: string,
    changes: Partial<SubmissionRecord>,
  ): Promise<void>;
  delete(userId: string, id: string): Promise<void>;
}

async function validateReferences(
  repository: SubmissionRepository,
  userId: string,
  input: {
    batchId: string;
    company: { source: "official"; id: string };
    position: { source: "official" | "private"; id: string };
  },
) {
  if (!(await repository.batchBelongsToUser(userId, input.batchId))) {
    throw new SubmissionError(
      "INVALID_BATCH",
      "请选择属于你的有效批次",
    );
  }
  const [companyValid, positionValid] = await Promise.all([
    repository.catalogReferenceExists(
      userId,
      "company",
      input.company.source,
      input.company.id,
    ),
    repository.catalogReferenceExists(
      userId,
      "position",
      input.position.source,
      input.position.id,
    ),
  ]);
  if (!companyValid || !positionValid) {
    throw new SubmissionError(
      "INVALID_REFERENCE",
      "公司或岗位不存在",
    );
  }
}

export async function createSubmission(
  repository: SubmissionRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<SubmissionRecord> {
  const parsed = createSubmissionInputSchema.parse(input);
  const existing = await repository.findByMutationId(
    userId,
    parsed.clientMutationId,
  );
  if (existing) return existing;

  await validateReferences(repository, userId, parsed);
  const submission: SubmissionRecord = {
    id: crypto.randomUUID(),
    userId,
    clientMutationId: parsed.clientMutationId,
    batchId: parsed.batchId,
    officialCompanyId: parsed.company.id,
    privateCompanyId: null,
    officialPositionId:
      parsed.position.source === "official"
        ? parsed.position.id
        : null,
    privatePositionId:
      parsed.position.source === "private" ? parsed.position.id : null,
    positionName: parsed.positionName,
    jdUrl: parsed.jdUrl ?? null,
    location: parsed.location ?? null,
    channel: parsed.channel ?? null,
    appliedAt: parsed.appliedAt,
    notesMarkdown: parsed.notesMarkdown ?? null,
    statusSource: "direct",
    directStatus: "submitted",
    currentInterviewId: null,
    statusUpdatedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await repository.insert(submission);
  return submission;
}

export async function updateSubmission(
  repository: SubmissionRepository,
  userId: string,
  id: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const existing = await repository.findById(userId, id);
  if (!existing) {
    throw new SubmissionError(
      "SUBMISSION_NOT_FOUND",
      "投递记录不存在",
    );
  }
  const parsed = updateSubmissionInputSchema.parse(input);
  if (
    parsed.batchId &&
    !(await repository.batchBelongsToUser(userId, parsed.batchId))
  ) {
    throw new SubmissionError(
      "INVALID_BATCH",
      "请选择属于你的有效批次",
    );
  }
  await repository.update(userId, id, {
    ...parsed,
    ...(parsed.directStatus
      ? {
          statusSource: "direct" as const,
          currentInterviewId: null,
          statusUpdatedAt: now,
        }
      : {}),
    updatedAt: now,
  });
}

export async function deleteSubmission(
  repository: SubmissionRepository,
  userId: string,
  id: string,
): Promise<void> {
  if (!(await repository.findById(userId, id))) {
    throw new SubmissionError(
      "SUBMISSION_NOT_FOUND",
      "投递记录不存在",
    );
  }
  await repository.delete(userId, id);
}
