import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { users } from "@/db/schema/auth";
import { timestampColumns } from "@/db/schema/columns";
import { interviews } from "@/db/schema/hiring";

export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    answerMarkdown: text("answer_markdown").notNull().default(""),
    category: text("category"),
    ...timestampColumns(),
  },
  (table) => [
    index("questions_user_category_updated_idx").on(
      table.userId,
      table.category,
      table.updatedAt,
    ),
  ],
);

export const interviewQuestions = sqliteTable(
  "interview_questions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    interviewId: text("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.interviewId, table.questionId] }),
    index("interview_questions_user_idx").on(table.userId),
    index("interview_questions_question_idx").on(table.questionId),
  ],
);
