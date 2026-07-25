import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { users } from "@/db/schema/auth";
import { timestampColumns } from "@/db/schema/columns";

export const officialCompanies = sqliteTable(
  "official_companies",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    careersUrl: text("careers_url"),
    processUrl: text("process_url"),
    industry: text("industry"),
    priority: text("priority"),
    sourceNotionId: text("source_notion_id"),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("official_companies_normalized_unique").on(
      table.normalizedName,
    ),
    uniqueIndex("official_companies_source_notion_unique").on(
      table.sourceNotionId,
    ),
    index("official_companies_active_name_idx").on(
      table.isActive,
      table.name,
    ),
  ],
);

export const officialCities = sqliteTable(
  "official_cities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    sourceNotionId: text("source_notion_id"),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("official_cities_normalized_unique").on(
      table.normalizedName,
    ),
    uniqueIndex("official_cities_source_notion_unique").on(
      table.sourceNotionId,
    ),
  ],
);

export const companyCities = sqliteTable(
  "company_cities",
  {
    companyId: text("company_id")
      .notNull()
      .references(() => officialCompanies.id, { onDelete: "cascade" }),
    cityId: text("city_id")
      .notNull()
      .references(() => officialCities.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.cityId] }),
    index("company_cities_city_idx").on(table.cityId),
  ],
);

export const privateCompanies = sqliteTable(
  "private_companies",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("private_companies_user_normalized_unique").on(
      table.userId,
      table.normalizedName,
    ),
  ],
);

export const officialPositions = sqliteTable(
  "official_positions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("official_positions_normalized_unique").on(
      table.normalizedName,
    ),
    index("official_positions_active_sort_idx").on(
      table.isActive,
      table.sortOrder,
    ),
  ],
);

export const privatePositions = sqliteTable(
  "private_positions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("private_positions_user_normalized_unique").on(
      table.userId,
      table.normalizedName,
    ),
  ],
);

export const stages = sqliteTable(
  "stages",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("stages_code_unique").on(table.code),
    index("stages_active_sort_idx").on(table.isActive, table.sortOrder),
  ],
);
