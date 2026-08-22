import {
  createResumeInputSchema,
  saveResumeInputSchema,
} from "@/modules/resumes/schema";
import type { ResumeDocumentV1 } from "@/types";

// 设备作用域（与 repository 的 ResumeDeviceScope 同构，避免循环依赖）：
// 字符串 = 访客设备的匿名 UUID；null = 登录用户本人。
export type ResumeGuestScope = { guestDeviceId: string } | null;

export type ResumeRecord = {
  id: string;
  userId: string;
  guestDeviceId: string | null;
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
  | "RESUME_NOT_PUBLIC"
  | "INVALID_PHOTO";

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
  find(
    userId: string,
    id: string,
    scope?: ResumeGuestScope,
  ): Promise<ResumeRecord | null>;
  findPublicById(id: string): Promise<ResumeRecord | null>;
  insert(record: ResumeRecord): Promise<void>;
  savePhoto(
    resumeId: string,
    photoData: string,
    now: Date,
  ): Promise<void>;
  updateIfVersion(
    userId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<ResumeRecord>,
    scope?: ResumeGuestScope,
  ): Promise<boolean>;
  setShareEnabled(
    userId: string,
    id: string,
    isPublic: boolean,
    now: Date,
    scope?: ResumeGuestScope,
  ): Promise<boolean>;
  delete(
    userId: string,
    id: string,
    scope?: ResumeGuestScope,
  ): Promise<void>;
}

async function requireResume(
  repository: ResumeRepository,
  userId: string,
  id: string,
  scope?: ResumeGuestScope,
) {
  const record = await repository.find(userId, id, scope);
  if (!record) {
    throw new ResumeError("RESUME_NOT_FOUND", "简历不存在");
  }
  return record;
}

// photoData 只出现在内存/上传端点中；文档保存时由客户端剥离，
// 若服务端仍收到（旧客户端或旧数据），则落库到 resume_photos 并剥离。
function photoDataOf(document: ResumeDocumentV1): string | undefined {
  const value = document.displayConfig.photo?.photoData;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function withoutPhotoData(document: ResumeDocumentV1): ResumeDocumentV1 {
  const { photo, ...rest } = document.displayConfig;
  return {
    ...document,
    displayConfig: {
      ...rest,
      photo: { ...photo, photoData: undefined },
    },
  };
}

export async function createResume(
  repository: ResumeRepository,
  userId: string,
  input: unknown,
  now = new Date(),
  guestDeviceId: string | null = null,
): Promise<ResumeRecord> {
  const parsed = createResumeInputSchema.parse(input);
  const record: ResumeRecord = {
    id: crypto.randomUUID(),
    userId,
    guestDeviceId,
    name: parsed.name,
    document: parsed.document,
    isPublic: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  const photoData = photoDataOf(parsed.document);
  record.document = withoutPhotoData(record.document);
  await repository.insert(record);
  if (photoData) {
    await repository.savePhoto(record.id, photoData, now);
  }
  return record;
}

export async function saveResume(
  repository: ResumeRepository,
  userId: string,
  input: unknown,
  now = new Date(),
  scope?: ResumeGuestScope,
): Promise<ResumeRecord> {
  const parsed = saveResumeInputSchema.parse(input);
  await requireResume(repository, userId, parsed.id, scope);
  const photoData = photoDataOf(parsed.document);
  const document = withoutPhotoData(parsed.document);
  if (photoData) {
    await repository.savePhoto(parsed.id, photoData, now);
  }
  const version = parsed.version + 1;
  const saved = await repository.updateIfVersion(
    userId,
    parsed.id,
    parsed.version,
    {
      name: parsed.name,
      document,
      version,
      updatedAt: now,
    },
    scope,
  );
  if (!saved) {
    throw new ResumeError(
      "VERSION_CONFLICT",
      "这份简历已在其他位置更新，请刷新后重试",
    );
  }
  const record = await requireResume(repository, userId, parsed.id, scope);
  return {
    id: parsed.id,
    userId,
    guestDeviceId: record.guestDeviceId,
    name: parsed.name,
    document,
    isPublic: record.isPublic,
    version,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

// 云端照片最大 800KB（data URL 字符数），避免触发 D1 cell / 网关体积限制
export const MAX_RESUME_PHOTO_DATA_URL_LENGTH = 800_000;

export async function uploadResumePhoto(
  repository: ResumeRepository,
  userId: string,
  id: string,
  photoData: string,
  now = new Date(),
  scope?: ResumeGuestScope,
): Promise<void> {
  await requireResume(repository, userId, id, scope);
  if (
    typeof photoData !== "string" ||
    photoData.length === 0 ||
    photoData.length > MAX_RESUME_PHOTO_DATA_URL_LENGTH
  ) {
    throw new ResumeError(
      "INVALID_PHOTO",
      "照片数据无效或超过大小限制，请换一张更小的图片",
    );
  }
  await repository.savePhoto(id, photoData, now);
}

export async function setResumePublic(
  repository: ResumeRepository,
  userId: string,
  id: string,
  isPublic: boolean,
  now = new Date(),
  scope?: ResumeGuestScope,
): Promise<ResumeRecord> {
  const record = await requireResume(repository, userId, id, scope);
  await repository.setShareEnabled(userId, id, isPublic, now, scope);
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
  scope?: ResumeGuestScope,
): Promise<void> {
  await requireResume(repository, userId, id, scope);
  await repository.delete(userId, id, scope);
}
