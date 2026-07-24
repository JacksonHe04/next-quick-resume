import { and, desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { resumes } from "@/db/schema";
import { resumeDocumentV1Schema } from "@/modules/resumes/schema";
import type {
  ResumeRecord,
  ResumeRepository,
} from "@/modules/resumes/service";

type Database = DrizzleD1Database<typeof schema>;

function deserialize(row: typeof resumes.$inferSelect): ResumeRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    document: resumeDocumentV1Schema.parse({
      schemaVersion: 1,
      data: JSON.parse(row.dataJson),
      displayConfig: JSON.parse(row.displayConfigJson),
    }),
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createResumeRepository(
  database: Database,
): ResumeRepository {
  return {
    async find(userId, id) {
      const [row] = await database
        .select()
        .from(resumes)
        .where(and(eq(resumes.userId, userId), eq(resumes.id, id)))
        .limit(1);
      return row ? deserialize(row) : null;
    },

    async insert(record) {
      await database
        .insert(resumes)
        .values({
          id: record.id,
          userId: record.userId,
          name: record.name,
          dataJson: JSON.stringify(record.document.data),
          displayConfigJson: JSON.stringify(
            record.document.displayConfig,
          ),
          version: record.version,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })
        .run();
    },

    async updateIfVersion(userId, id, expectedVersion, changes) {
      const result = await database
        .update(resumes)
        .set({
          name: changes.name,
          dataJson: changes.document
            ? JSON.stringify(changes.document.data)
            : undefined,
          displayConfigJson: changes.document
            ? JSON.stringify(changes.document.displayConfig)
            : undefined,
          version: changes.version,
          updatedAt: changes.updatedAt,
        })
        .where(
          and(
            eq(resumes.userId, userId),
            eq(resumes.id, id),
            eq(resumes.version, expectedVersion),
          ),
        )
        .run();
      return result.meta.changes > 0;
    },

    async delete(userId, id) {
      await database
        .delete(resumes)
        .where(and(eq(resumes.userId, userId), eq(resumes.id, id)))
        .run();
    },
  };
}

export async function listResumes(
  database: Database,
  userId: string,
) {
  const rows = await database
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
  return rows.map(deserialize);
}
