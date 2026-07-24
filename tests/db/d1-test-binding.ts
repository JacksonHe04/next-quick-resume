import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DatabaseSync,
  type SQLInputValue,
  type StatementSync,
} from "node:sqlite";

const migrationDirectory = join(process.cwd(), "drizzle");

class TestD1Statement {
  private parameters: SQLInputValue[] = [];

  constructor(
    private readonly database: DatabaseSync,
    private readonly sql: string,
  ) {}

  bind(...parameters: unknown[]) {
    this.parameters = parameters as SQLInputValue[];
    return this;
  }

  private prepare(): StatementSync {
    return this.database.prepare(this.sql);
  }

  async run() {
    const result = this.prepare().run(...this.parameters);
    return {
      success: true,
      results: [],
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }

  async all() {
    return {
      success: true,
      results: this.prepare().all(...this.parameters),
      meta: {},
    };
  }

  async first(column?: string) {
    const row = this.prepare().get(...this.parameters) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return column ? (row[column] ?? null) : row;
  }

  async raw(options?: { columnNames?: boolean }) {
    const statement = this.prepare();
    const columns = statement.columns().map(({ name }) => name);
    const rows = statement.all(...this.parameters) as Array<
      Record<string, unknown>
    >;
    const values = rows.map((row) => columns.map((column) => row[column]));

    return options?.columnNames ? [columns, ...values] : values;
  }
}

export function createTestD1Binding() {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");

  for (const file of readdirSync(migrationDirectory)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    database.exec(readFileSync(join(migrationDirectory, file), "utf8"));
  }

  const binding = {
    prepare(sql: string) {
      return new TestD1Statement(database, sql);
    },
    async batch(statements: TestD1Statement[]) {
      database.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) {
          results.push(await statement.run());
        }
        database.exec("COMMIT");
        return results;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    },
  } as unknown as D1Database;

  return {
    binding,
    close: () => database.close(),
  };
}
