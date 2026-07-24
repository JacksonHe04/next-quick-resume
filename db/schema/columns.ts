import { integer } from "drizzle-orm/sqlite-core";

export function timestampColumns() {
  return {
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  };
}
