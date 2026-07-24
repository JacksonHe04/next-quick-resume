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
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ResumeErrorCode =
  | "RESUME_NOT_FOUND"
  | "VERSION_CONFLICT";

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
  insert(record: ResumeRecord): Promise<void>;
  updateIfVersion(
    userId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<ResumeRecord>,
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
  return {
    id: parsed.id,
    userId,
    name: parsed.name,
    document: parsed.document,
    version,
    createdAt: (await requireResume(repository, userId, parsed.id))
      .createdAt,
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

export async function deleteResume(
  repository: ResumeRepository,
  userId: string,
  id: string,
): Promise<void> {
  await requireResume(repository, userId, id);
  await repository.delete(userId, id);
}
