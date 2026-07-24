import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { users } from "@/db/schema/auth";
import { batches } from "@/db/schema/batches";
import {
  officialCompanies,
  officialPositions,
  privateCompanies,
  privatePositions,
  stages,
} from "@/db/schema/catalog";
import { timestampColumns } from "@/db/schema/columns";

export const DIRECT_SUBMISSION_STATUSES = [
  "submitted",
  "screening",
  "resume_passed",
  "resume_failed",
  "offer",
  "cancelled",
  "closed",
  "expired",
] as const;

export const SUBMISSION_STATUS_SOURCES = ["direct", "interview"] as const;

export const INTERVIEW_STATUSES = [
  "pending_interview",
  "pending_result",
  "passed",
  "failed",
] as const;

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientMutationId: text("client_mutation_id").notNull(),
    batchId: text("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "restrict" }),
    officialCompanyId: text("official_company_id").references(
      () => officialCompanies.id,
      { onDelete: "restrict" },
    ),
    privateCompanyId: text("private_company_id").references(
      () => privateCompanies.id,
      { onDelete: "restrict" },
    ),
    officialPositionId: text("official_position_id").references(
      () => officialPositions.id,
      { onDelete: "restrict" },
    ),
    privatePositionId: text("private_position_id").references(
      () => privatePositions.id,
      { onDelete: "restrict" },
    ),
    positionName: text("position_name").notNull(),
    jdUrl: text("jd_url"),
    location: text("location"),
    channel: text("channel"),
    appliedAt: integer("applied_at", { mode: "timestamp_ms" }).notNull(),
    notesMarkdown: text("notes_markdown"),
    statusSource: text("status_source", {
      enum: SUBMISSION_STATUS_SOURCES,
    }).notNull(),
    directStatus: text("direct_status", {
      enum: DIRECT_SUBMISSION_STATUSES,
    }).notNull(),
    currentInterviewId: text("current_interview_id").references(
      (): AnySQLiteColumn => interviews.id,
      { onDelete: "set null" },
    ),
    statusUpdatedAt: integer("status_updated_at", {
      mode: "timestamp_ms",
    }).notNull(),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("submissions_user_mutation_unique").on(
      table.userId,
      table.clientMutationId,
    ),
    check(
      "submissions_company_xor",
      sql`(${table.officialCompanyId} IS NULL) != (${table.privateCompanyId} IS NULL)`,
    ),
    check(
      "submissions_position_xor",
      sql`(${table.officialPositionId} IS NULL) != (${table.privatePositionId} IS NULL)`,
    ),
    check(
      "submissions_status_source_check",
      sql`${table.statusSource} IN ('direct', 'interview')`,
    ),
    check(
      "submissions_direct_status_check",
      sql`${table.directStatus} IN ('submitted', 'screening', 'resume_passed', 'resume_failed', 'offer', 'cancelled', 'closed', 'expired')`,
    ),
    index("submissions_user_applied_idx").on(table.userId, table.appliedAt),
    index("submissions_user_batch_idx").on(table.userId, table.batchId),
  ],
);

export const interviews = sqliteTable(
  "interviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    submissionId: text("submission_id")
      .notNull()
      .references((): AnySQLiteColumn => submissions.id, {
        onDelete: "cascade",
      }),
    stageId: text("stage_id")
      .notNull()
      .references(() => stages.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }),
    durationMinutes: integer("duration_minutes"),
    meetingUrl: text("meeting_url"),
    status: text("status", { enum: INTERVIEW_STATUSES }).notNull(),
    reviewMarkdown: text("review_markdown"),
    ...timestampColumns(),
  },
  (table) => [
    check(
      "interviews_status_check",
      sql`${table.status} IN ('pending_interview', 'pending_result', 'passed', 'failed')`,
    ),
    check(
      "interviews_duration_positive",
      sql`${table.durationMinutes} IS NULL OR ${table.durationMinutes} > 0`,
    ),
    index("interviews_user_scheduled_idx").on(
      table.userId,
      table.scheduledAt,
    ),
    index("interviews_submission_idx").on(table.submissionId),
  ],
);
