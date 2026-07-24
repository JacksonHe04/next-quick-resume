import { describe, expect, it } from "vitest";

import {
  archiveBatch,
  createBatch,
  deleteBatch,
  resolveDefaultBatch,
  setCurrentBatch,
  type BatchRecord,
  type BatchRepository,
} from "@/modules/batches/service";

class MemoryBatchRepository implements BatchRepository {
  batches: BatchRecord[] = [];
  current = new Map<string, string | null>();
  submissionCounts = new Map<string, number>();

  async listAll(userId: string) {
    return this.batches
      .filter((batch) => batch.userId === userId)
      .sort(
        (left, right) =>
          right.updatedAt.getTime() - left.updatedAt.getTime(),
      );
  }

  async listActive(userId: string) {
    return this.batches
      .filter((batch) => batch.userId === userId && !batch.archivedAt)
      .sort(
        (left, right) =>
          right.updatedAt.getTime() - left.updatedAt.getTime(),
      );
  }

  async findById(userId: string, id: string) {
    return (
      this.batches.find(
        (batch) => batch.userId === userId && batch.id === id,
      ) ?? null
    );
  }

  async insertAndSelectIfEmpty(record: BatchRecord) {
    this.batches.push(record);
    if (!this.current.get(record.userId)) {
      this.current.set(record.userId, record.id);
    }
  }

  async update(
    userId: string,
    batchId: string,
    changes: Partial<BatchRecord> & { updatedAt: Date },
  ) {
    const batch = await this.findById(userId, batchId);
    if (!batch) throw new Error("missing");
    Object.assign(batch, changes);
  }

  async setCurrent(userId: string, batchId: string | null) {
    this.current.set(userId, batchId);
  }

  async getCurrentId(userId: string) {
    return this.current.get(userId) ?? null;
  }

  async setArchived(
    userId: string,
    batchId: string,
    archivedAt: Date | null,
    updatedAt: Date,
  ) {
    const batch = await this.findById(userId, batchId);
    if (!batch) throw new Error("missing");
    batch.archivedAt = archivedAt;
    batch.updatedAt = updatedAt;
  }

  async countSubmissions(userId: string, batchId: string) {
    return this.submissionCounts.get(`${userId}:${batchId}`) ?? 0;
  }

  async deleteAndSelect(
    userId: string,
    batchId: string,
    nextBatchId: string | null,
  ) {
    this.batches = this.batches.filter(
      (batch) => !(batch.userId === userId && batch.id === batchId),
    );
    if (this.current.get(userId) === batchId) {
      this.current.set(userId, nextBatchId);
    }
  }
}

const now = new Date("2026-07-25T00:00:00.000Z");

describe("batch service", () => {
  it("selects the first created batch as current", async () => {
    const repository = new MemoryBatchRepository();

    const batch = await createBatch(
      repository,
      "user-a",
      { name: "2026 夏季产品岗" },
      now,
    );

    await expect(resolveDefaultBatch(repository, "user-a")).resolves.toBe(
      batch.id,
    );
  });

  it("selects another active batch after deleting the current batch", async () => {
    const repository = new MemoryBatchRepository();
    const older = await createBatch(
      repository,
      "user-a",
      { name: "第一阶段" },
      new Date(now.getTime() - 1_000),
    );
    const newer = await createBatch(
      repository,
      "user-a",
      { name: "第二阶段" },
      now,
    );
    await setCurrentBatch(repository, "user-a", older.id);

    await deleteBatch(repository, "user-a", older.id);

    await expect(resolveDefaultBatch(repository, "user-a")).resolves.toBe(
      newer.id,
    );
  });

  it("refuses to delete a batch that already owns submissions", async () => {
    const repository = new MemoryBatchRepository();
    const batch = await createBatch(
      repository,
      "user-a",
      { name: "秋招" },
      now,
    );
    repository.submissionCounts.set(`user-a:${batch.id}`, 2);

    await expect(
      deleteBatch(repository, "user-a", batch.id),
    ).rejects.toMatchObject({ code: "BATCH_IN_USE" });
  });

  it("moves current selection when the current batch is archived", async () => {
    const repository = new MemoryBatchRepository();
    const current = await createBatch(
      repository,
      "user-a",
      { name: "当前阶段" },
      new Date(now.getTime() - 1_000),
    );
    const next = await createBatch(
      repository,
      "user-a",
      { name: "下个阶段" },
      now,
    );
    await setCurrentBatch(repository, "user-a", current.id);

    await archiveBatch(repository, "user-a", current.id, now);

    await expect(resolveDefaultBatch(repository, "user-a")).resolves.toBe(
      next.id,
    );
  });
});
