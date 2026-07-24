import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "@/db/schema/auth";
import { timestampColumns } from "@/db/schema/columns";

export const batches = sqliteTable(
  "batches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    strategyMarkdown: text("strategy_markdown"),
    startDate: integer("start_date", { mode: "timestamp_ms" }),
    endDate: integer("end_date", { mode: "timestamp_ms" }),
    archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
    ...timestampColumns(),
  },
  (table) => [
    index("batches_user_archived_updated_idx").on(
      table.userId,
      table.archivedAt,
      table.updatedAt,
    ),
  ],
);

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentBatchId: text("current_batch_id").references(() => batches.id, {
    onDelete: "set null",
  }),
  timezone: text("timezone").notNull().default("Asia/Singapore"),
  ...timestampColumns(),
});
