import { and, desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { resumePhotos, resumes } from "@/db/schema";
import { orderDataBySections } from "@/modules/resumes/section-order";
import { resumeDocumentV1Schema } from "@/modules/resumes/schema";
import type {
  ResumeRecord,
  ResumeRepository,
} from "@/modules/resumes/service";

type Database = DrizzleD1Database<typeof schema>;

type ResumeRow = typeof resumes.$inferSelect;

// photoData 是读取时的回填值（来自 resume_photos），绝不落进 displayConfigJson
function displayConfigJsonOf(document: ResumeRecord["document"]) {
  const { photo, ...rest } = document.displayConfig;
  return JSON.stringify({
    ...rest,
    photo: { ...photo, photoData: undefined },
  });
}

function deserialize(
  row: ResumeRow,
  photoData: string | null,
): ResumeRecord {
  const document = resumeDocumentV1Schema.parse({
    schemaVersion: 1,
    data: JSON.parse(row.dataJson),
    displayConfig: JSON.parse(row.displayConfigJson),
  });
  // 照片 blob 单独存放在 resume_photos，读取时回填到展示配置；
  // 旧数据若把 photoData 写进了 displayConfigJson 且尚无照片记录，则沿用旧值。
  if (photoData) {
    document.displayConfig.photo = {
      ...document.displayConfig.photo,
      photoData,
    };
  }
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    document,
    isPublic: row.isPublic,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function dataJsonOf(document: ResumeRecord["document"]) {
  // 持久化时按 sectionOrder 重排 data 字段，保证 JSON 输出顺序与简历一致
  return JSON.stringify(
    orderDataBySections(document.data, document.displayConfig.sectionOrder),
  );
}

export function createResumeRepository(
  database: Database,
): ResumeRepository {
  return {
    async find(userId, id) {
      const [row] = await database
        .select({ row: resumes, photoData: resumePhotos.photoData })
        .from(resumes)
        .leftJoin(resumePhotos, eq(resumePhotos.resumeId, resumes.id))
        .where(and(eq(resumes.userId, userId), eq(resumes.id, id)))
        .limit(1);
      return row ? deserialize(row.row, row.photoData) : null;
    },

    async findPublicById(id) {
      const [row] = await database
        .select({ row: resumes, photoData: resumePhotos.photoData })
        .from(resumes)
        .leftJoin(resumePhotos, eq(resumePhotos.resumeId, resumes.id))
        .where(and(eq(resumes.id, id), eq(resumes.isPublic, true)))
        .limit(1);
      return row ? deserialize(row.row, row.photoData) : null;
    },

    async insert(record) {
      await database
        .insert(resumes)
        .values({
          id: record.id,
          userId: record.userId,
          name: record.name,
          dataJson: dataJsonOf(record.document),
          displayConfigJson: displayConfigJsonOf(record.document),
          isPublic: record.isPublic,
          version: record.version,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })
        .run();
    },

    async savePhoto(resumeId, photoData, now) {
      await database
        .insert(resumePhotos)
        .values({
          resumeId,
          photoData,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: resumePhotos.resumeId,
          set: { photoData, updatedAt: now },
        })
        .run();
    },

    async updateIfVersion(userId, id, expectedVersion, changes) {
      const result = await database
        .update(resumes)
        .set({
          name: changes.name,
          dataJson: changes.document
            ? dataJsonOf(changes.document)
            : undefined,
          displayConfigJson: changes.document
            ? displayConfigJsonOf(changes.document)
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

    async setShareEnabled(userId, id, isPublic, now) {
      const result = await database
        .update(resumes)
        .set({ isPublic, updatedAt: now })
        .where(and(eq(resumes.userId, userId), eq(resumes.id, id)))
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
    .select({ row: resumes, photoData: resumePhotos.photoData })
    .from(resumes)
    .leftJoin(resumePhotos, eq(resumePhotos.resumeId, resumes.id))
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
  return rows.map((item) => deserialize(item.row, item.photoData));
}
