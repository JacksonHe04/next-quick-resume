import {
  createBatchInputSchema,
  updateBatchInputSchema,
} from "@/modules/batches/schemas";

export type BatchRecord = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  strategyMarkdown: string | null;
  startDate: Date | null;
  endDate: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BatchErrorCode =
  | "BATCH_NOT_FOUND"
  | "BATCH_ARCHIVED"
  | "BATCH_IN_USE";

export class BatchError extends Error {
  constructor(
    public readonly code: BatchErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BatchError";
  }
}

export interface BatchRepository {
  listAll(userId: string): Promise<BatchRecord[]>;
  listActive(userId: string): Promise<BatchRecord[]>;
  findById(userId: string, id: string): Promise<BatchRecord | null>;
  insertAndSelectIfEmpty(record: BatchRecord): Promise<void>;
  update(
    userId: string,
    batchId: string,
    changes: Partial<
      Pick<
        BatchRecord,
        | "name"
        | "description"
        | "strategyMarkdown"
        | "startDate"
        | "endDate"
      >
    > & { updatedAt: Date },
  ): Promise<void>;
  setCurrent(userId: string, batchId: string | null): Promise<void>;
  getCurrentId(userId: string): Promise<string | null>;
  setArchived(
    userId: string,
    batchId: string,
    archivedAt: Date | null,
    updatedAt: Date,
  ): Promise<void>;
  countSubmissions(userId: string, batchId: string): Promise<number>;
  deleteAndSelect(
    userId: string,
    batchId: string,
    nextBatchId: string | null,
  ): Promise<void>;
}

export async function listBatches(
  repository: BatchRepository,
  userId: string,
): Promise<{ batches: BatchRecord[]; currentBatchId: string | null }> {
  const [items, currentBatchId] = await Promise.all([
    repository.listAll(userId),
    resolveDefaultBatch(repository, userId),
  ]);
  return { batches: items, currentBatchId };
}

async function requireBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
) {
  const batch = await repository.findById(userId, batchId);
  if (!batch) {
    throw new BatchError("BATCH_NOT_FOUND", "批次不存在");
  }
  return batch;
}

export async function createBatch(
  repository: BatchRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<BatchRecord> {
  const parsed = createBatchInputSchema.parse(input);
  const batch: BatchRecord = {
    id: crypto.randomUUID(),
    userId,
    name: parsed.name,
    description: parsed.description ?? null,
    strategyMarkdown: parsed.strategyMarkdown ?? null,
    startDate: parsed.startDate ?? null,
    endDate: parsed.endDate ?? null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await repository.insertAndSelectIfEmpty(batch);
  return batch;
}

export async function updateBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  await requireBatch(repository, userId, batchId);
  const parsed = updateBatchInputSchema.parse(input);
  await repository.update(userId, batchId, {
    ...parsed,
    updatedAt: now,
  });
}

export async function setCurrentBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
): Promise<void> {
  const batch = await requireBatch(repository, userId, batchId);
  if (batch.archivedAt) {
    throw new BatchError(
      "BATCH_ARCHIVED",
      "已归档批次不能设为当前批次",
    );
  }
  await repository.setCurrent(userId, batchId);
}

export async function resolveDefaultBatch(
  repository: BatchRepository,
  userId: string,
): Promise<string | null> {
  const [currentId, active] = await Promise.all([
    repository.getCurrentId(userId),
    repository.listActive(userId),
  ]);
  if (currentId && active.some((batch) => batch.id === currentId)) {
    return currentId;
  }
  const fallback = active[0]?.id ?? null;
  if (fallback !== currentId) {
    await repository.setCurrent(userId, fallback);
  }
  return fallback;
}

export async function archiveBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
  now = new Date(),
): Promise<void> {
  await requireBatch(repository, userId, batchId);
  await repository.setArchived(userId, batchId, now, now);
  const currentId = await repository.getCurrentId(userId);
  if (currentId === batchId) {
    const active = await repository.listActive(userId);
    await repository.setCurrent(userId, active[0]?.id ?? null);
  }
}

export async function restoreBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
  now = new Date(),
): Promise<void> {
  await requireBatch(repository, userId, batchId);
  await repository.setArchived(userId, batchId, null, now);
}

export async function deleteBatch(
  repository: BatchRepository,
  userId: string,
  batchId: string,
): Promise<void> {
  await requireBatch(repository, userId, batchId);
  if ((await repository.countSubmissions(userId, batchId)) > 0) {
    throw new BatchError(
      "BATCH_IN_USE",
      "该批次已有投递，请先归档而不是删除",
    );
  }
  const [currentId, active] = await Promise.all([
    repository.getCurrentId(userId),
    repository.listActive(userId),
  ]);
  const nextBatchId =
    currentId === batchId
      ? (active.find((batch) => batch.id !== batchId)?.id ?? null)
      : currentId;
  await repository.deleteAndSelect(userId, batchId, nextBatchId);
}
