import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { users } from "@/db/schema/auth";
import { timestampColumns } from "@/db/schema/columns";

export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dataJson: text("data_json").notNull(),
    displayConfigJson: text("display_config_json").notNull(),
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(false),
    version: integer("version").notNull().default(1),
    ...timestampColumns(),
  },
  (table) => [
    check("resumes_positive_version", sql`${table.version} > 0`),
    index("resumes_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

// 照片单独存放：避免 base64 数据混入简历 JSON，导致保存体量超限、刷新丢失
export const resumePhotos = sqliteTable(
  "resume_photos",
  {
    resumeId: text("resume_id")
      .primaryKey()
      .references(() => resumes.id, { onDelete: "cascade" }),
    photoData: text("photo_data").notNull(),
    ...timestampColumns(),
  },
  (table) => [index("resume_photos_resume_idx").on(table.resumeId)],
);
