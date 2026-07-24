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
    version: integer("version").notNull().default(1),
    ...timestampColumns(),
  },
  (table) => [
    check("resumes_positive_version", sql`${table.version} > 0`),
    index("resumes_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);
