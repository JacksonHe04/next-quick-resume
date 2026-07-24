import {
  and,
  count,
  desc,
  eq,
  isNull,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  batches,
  submissions,
  userPreferences,
} from "@/db/schema";
import type {
  BatchRecord,
  BatchRepository,
} from "@/modules/batches/service";

type Database = DrizzleD1Database<typeof schema>;

export function createBatchRepository(
  database: Database,
): BatchRepository {
  return {
    async listAll(userId) {
      return (await database
        .select()
        .from(batches)
        .where(eq(batches.userId, userId))
        .orderBy(desc(batches.updatedAt))) as BatchRecord[];
    },

    async listActive(userId) {
      return (await database
        .select()
        .from(batches)
        .where(
          and(eq(batches.userId, userId), isNull(batches.archivedAt)),
        )
        .orderBy(desc(batches.updatedAt))) as BatchRecord[];
    },

    async findById(userId, id) {
      const [batch] = await database
        .select()
        .from(batches)
        .where(and(eq(batches.userId, userId), eq(batches.id, id)))
        .limit(1);
      return (batch as BatchRecord | undefined) ?? null;
    },

    async insertAndSelectIfEmpty(record) {
      await database.batch([
        database.insert(batches).values(record),
        database
          .update(userPreferences)
          .set({ currentBatchId: record.id, updatedAt: record.updatedAt })
          .where(
            and(
              eq(userPreferences.userId, record.userId),
              isNull(userPreferences.currentBatchId),
            ),
          ),
      ]);
    },

    async update(userId, batchId, changes) {
      await database
        .update(batches)
        .set(changes)
        .where(
          and(eq(batches.userId, userId), eq(batches.id, batchId)),
        )
        .run();
    },

    async setCurrent(userId, batchId) {
      await database
        .update(userPreferences)
        .set({ currentBatchId: batchId, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .run();
    },

    async getCurrentId(userId) {
      const [preference] = await database
        .select({ currentBatchId: userPreferences.currentBatchId })
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);
      return preference?.currentBatchId ?? null;
    },

    async setArchived(userId, batchId, archivedAt, updatedAt) {
      await database
        .update(batches)
        .set({ archivedAt, updatedAt })
        .where(
          and(eq(batches.userId, userId), eq(batches.id, batchId)),
        )
        .run();
    },

    async countSubmissions(userId, batchId) {
      const [result] = await database
        .select({ value: count() })
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, userId),
            eq(submissions.batchId, batchId),
          ),
        );
      return result?.value ?? 0;
    },

    async deleteAndSelect(userId, batchId, nextBatchId) {
      await database.batch([
        database
          .delete(batches)
          .where(
            and(eq(batches.userId, userId), eq(batches.id, batchId)),
          ),
        database
          .update(userPreferences)
          .set({ currentBatchId: nextBatchId, updatedAt: new Date() })
          .where(eq(userPreferences.userId, userId)),
      ]);
    },
  };
}
