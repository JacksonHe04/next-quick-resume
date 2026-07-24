import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const migrationDirectory = join(process.cwd(), "drizzle");

function createMigratedDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");

  for (const file of readdirSync(migrationDirectory)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    database.exec(readFileSync(join(migrationDirectory, file), "utf8"));
  }

  return database;
}

function insertSharedFixtures(database: DatabaseSync) {
  const now = Date.now();

  database
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run("user-a", "a@example.com", "hash", "A", now, now, now);
  database
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run("user-b", "b@example.com", "hash", "B", now, now, now);
  database
    .prepare(
      "INSERT INTO official_companies (id, name, normalized_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run("company-official", "SAYLESS Labs", "sayless labs", 1, now, now);
  database
    .prepare(
      "INSERT INTO official_positions (id, name, normalized_name, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run("position-official", "产品经理", "产品经理", 1, 10, now, now);
  database
    .prepare(
      "INSERT INTO stages (id, code, name, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run("stage-first", "first_interview", "一面", 10, 1, now, now);
  database
    .prepare(
      "INSERT INTO batches (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run("batch-a", "user-a", "2026 秋季", now, now);
}

describe("D1 schema constraints", () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = createMigratedDatabase();
  });

  afterEach(() => {
    database.close();
  });

  it("creates every domain table needed by the job-search lifecycle", () => {
    const rows = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all() as Array<{ name: string }>;

    expect(rows.map(({ name }) => name)).toEqual([
      "batches",
      "email_verification_codes",
      "interview_questions",
      "interviews",
      "official_companies",
      "official_positions",
      "password_reset_tokens",
      "private_companies",
      "private_positions",
      "questions",
      "resumes",
      "sessions",
      "stages",
      "submissions",
      "user_preferences",
      "users",
    ]);
  });

  it("requires exactly one company and one position source per submission", () => {
    insertSharedFixtures(database);
    const now = Date.now();
    const insert = database.prepare(
      `INSERT INTO submissions (
        id, user_id, client_mutation_id, batch_id, position_name,
        applied_at, status_source, direct_status, status_updated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    expect(() =>
      insert.run(
        "submission-invalid",
        "user-a",
        "mutation-invalid",
        "batch-a",
        "Agent 产品经理",
        now,
        "direct",
        "submitted",
        now,
        now,
        now,
      ),
    ).toThrow(/CHECK constraint failed/);
  });

  it("allows repeated stages and rejects duplicate interview-question links", () => {
    insertSharedFixtures(database);
    const now = Date.now();

    database
      .prepare(
        `INSERT INTO submissions (
          id, user_id, client_mutation_id, batch_id, official_company_id,
          official_position_id, position_name, applied_at, status_source,
          direct_status, status_updated_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "submission-a",
        "user-a",
        "mutation-a",
        "batch-a",
        "company-official",
        "position-official",
        "Agent 产品经理",
        now,
        "direct",
        "submitted",
        now,
        now,
        now,
      );

    const insertInterview = database.prepare(
      `INSERT INTO interviews (
        id, user_id, submission_id, stage_id, name, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    insertInterview.run(
      "interview-a",
      "user-a",
      "submission-a",
      "stage-first",
      "第一次一面",
      "pending_interview",
      now,
      now,
    );
    expect(() =>
      insertInterview.run(
        "interview-b",
        "user-a",
        "submission-a",
        "stage-first",
        "补充一面",
        "pending_interview",
        now,
        now,
      ),
    ).not.toThrow();

    database
      .prepare(
        "INSERT INTO questions (id, user_id, question_text, answer_markdown, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run("question-a", "user-a", "为什么选择我们？", "标准答案", now, now);
    const link = database.prepare(
      "INSERT INTO interview_questions (user_id, interview_id, question_id, created_at) VALUES (?, ?, ?, ?)",
    );
    link.run("user-a", "interview-a", "question-a", now);

    expect(() =>
      link.run("user-a", "interview-a", "question-a", now),
    ).toThrow(/UNIQUE constraint failed/);
  });

  it("cascades private user data without deleting official catalog data", () => {
    insertSharedFixtures(database);
    const now = Date.now();
    database
      .prepare(
        "INSERT INTO private_companies (id, user_id, name, normalized_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run("private-company", "user-a", "私人公司", "私人公司", now, now);

    database.prepare("DELETE FROM users WHERE id = ?").run("user-a");

    expect(
      database
        .prepare("SELECT COUNT(*) AS count FROM private_companies")
        .get(),
    ).toEqual({ count: 0 });
    expect(
      database
        .prepare("SELECT COUNT(*) AS count FROM official_companies")
        .get(),
    ).toEqual({ count: 1 });
  });
});
