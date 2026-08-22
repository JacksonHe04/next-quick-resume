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
    // 访客设备的匿名 UUID（见 modules/auth/anon-id.ts）。非空即代表该行属于
    // 某台访客设备：userId 仍挂在 DEMO_USER_ID 下以满足外键约束，设备隔离
    // 由本列完成；登录用户的数据此列为 NULL。
    guestDeviceId: text("guest_device_id"),
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
    index("resumes_guest_device_idx").on(
      table.userId,
      table.guestDeviceId,
      table.updatedAt,
    ),
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
