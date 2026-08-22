import {
  createResumeInputSchema,
  resumeDocumentV1Schema,
  saveResumeInputSchema,
} from "@/modules/resumes/schema";
import type { ResumeDocumentV1 } from "@/types";

export type ResumeRecord = {
  id: string;
  userId: string;
  name: string;
  document: ResumeDocumentV1;
  isPublic: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ResumeErrorCode =
  | "RESUME_NOT_FOUND"
  | "VERSION_CONFLICT"
  | "RESUME_NOT_PUBLIC";

export class ResumeError extends Error {
  constructor(
    public readonly code: ResumeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResumeError";
  }
}

export interface ResumeRepository {
  find(userId: string, id: string): Promise<ResumeRecord | null>;
  findPublicById(id: string): Promise<ResumeRecord | null>;
  insert(record: ResumeRecord): Promise<void>;
  updateIfVersion(
    userId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<ResumeRecord>,
  ): Promise<boolean>;
  setShareEnabled(
    userId: string,
    id: string,
    isPublic: boolean,
    now: Date,
  ): Promise<boolean>;
  delete(userId: string, id: string): Promise<void>;
}

async function requireResume(
  repository: ResumeRepository,
  userId: string,
  id: string,
) {
  const record = await repository.find(userId, id);
  if (!record) {
    throw new ResumeError("RESUME_NOT_FOUND", "简历不存在");
  }
  return record;
}

export async function createResume(
  repository: ResumeRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<ResumeRecord> {
  const parsed = createResumeInputSchema.parse(input);
  const record: ResumeRecord = {
    id: crypto.randomUUID(),
    userId,
    name: parsed.name,
    document: parsed.document,
    isPublic: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  await repository.insert(record);
  return record;
}

export async function saveResume(
  repository: ResumeRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<ResumeRecord> {
  const parsed = saveResumeInputSchema.parse(input);
  await requireResume(repository, userId, parsed.id);
  const version = parsed.version + 1;
  const saved = await repository.updateIfVersion(
    userId,
    parsed.id,
    parsed.version,
    {
      name: parsed.name,
      document: parsed.document,
      version,
      updatedAt: now,
    },
  );
  if (!saved) {
    throw new ResumeError(
      "VERSION_CONFLICT",
      "这份简历已在其他位置更新，请刷新后重试",
    );
  }
  const record = await requireResume(repository, userId, parsed.id);
  return {
    id: parsed.id,
    userId,
    name: parsed.name,
    document: parsed.document,
    isPublic: record.isPublic,
    version,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

export async function cloneResume(
  repository: ResumeRepository,
  userId: string,
  id: string,
  now = new Date(),
): Promise<ResumeRecord> {
  const source = await requireResume(repository, userId, id);
  return createResume(
    repository,
    userId,
    {
      name: `${source.name}（副本）`,
      document: resumeDocumentV1Schema.parse(
        structuredClone(source.document),
      ),
    },
    now,
  );
}

export async function setResumePublic(
  repository: ResumeRepository,
  userId: string,
  id: string,
  isPublic: boolean,
  now = new Date(),
): Promise<ResumeRecord> {
  const record = await requireResume(repository, userId, id);
  await repository.setShareEnabled(userId, id, isPublic, now);
  return { ...record, isPublic, updatedAt: now };
}

export async function getPublicResume(
  repository: ResumeRepository,
  id: string,
): Promise<ResumeRecord | null> {
  const record = await repository.findPublicById(id);
  if (!record) {
    throw new ResumeError("RESUME_NOT_PUBLIC", "该简历未公开或不存在");
  }
  return record;
}

export async function deleteResume(
  repository: ResumeRepository,
  userId: string,
  id: string,
): Promise<void> {
  await requireResume(repository, userId, id);
  await repository.delete(userId, id);
}
