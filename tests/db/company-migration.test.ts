import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function migration(name: string) {
  return readFileSync(join(process.cwd(), "drizzle", name), "utf8");
}

describe("official company migration", () => {
  it("promotes legacy private companies and rewires their submissions", () => {
    const database = new DatabaseSync(":memory:");
    database.exec("PRAGMA foreign_keys = ON");
    database.exec(migration("0000_furry_nextwave.sql"));
    database.exec(migration("0001_bumpy_johnny_blaze.sql"));
    database.exec(`
      INSERT INTO users
        (id, email, password_hash, name, email_verified_at, created_at, updated_at)
      VALUES
        ('user-a', 'a@example.com', 'hash', 'A', 0, 0, 0);
      INSERT INTO batches
        (id, user_id, name, created_at, updated_at)
      VALUES
        ('batch-a', 'user-a', '夏季探索', 0, 0);
      INSERT INTO private_companies
        (id, user_id, name, normalized_name, created_at, updated_at)
      VALUES
        ('private-a', 'user-a', '示例公司', '示例公司', 0, 0);
      INSERT INTO official_positions
        (id, name, normalized_name, created_at, updated_at)
      VALUES
        ('position-a', '产品经理', '产品经理', 0, 0);
      INSERT INTO submissions (
        id, user_id, client_mutation_id, batch_id,
        private_company_id, official_position_id, position_name,
        applied_at, status_source, direct_status, status_updated_at,
        created_at, updated_at
      ) VALUES (
        'submission-a', 'user-a', 'mutation-a', 'batch-a',
        'private-a', 'position-a', '产品经理',
        0, 'direct', 'submitted', 0, 0, 0
      );
    `);

    database.exec(migration("0002_gorgeous_corsair.sql"));

    expect(
      database
        .prepare(
          "SELECT official_company_id, private_company_id FROM submissions WHERE id = 'submission-a'",
        )
        .get(),
    ).toEqual({
      official_company_id: "promoted-private-a",
      private_company_id: null,
    });
    expect(
      database
        .prepare(
          "SELECT name, normalized_name FROM official_companies WHERE id = 'promoted-private-a'",
        )
        .get(),
    ).toEqual({
      name: "示例公司",
      normalized_name: "示例公司",
    });
    expect(
      database
        .prepare("SELECT count(*) AS count FROM private_companies")
        .get(),
    ).toEqual({ count: 0 });

    database.close();
  });
});
