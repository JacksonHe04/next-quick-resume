import {
  readdirSync,
  readFileSync,
} from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { join } from "node:path";

class NodeD1Statement {
  private parameters: SQLInputValue[] = [];

  constructor(
    private readonly database: DatabaseSync,
    private readonly statementSql: string,
  ) {}

  bind(...parameters: unknown[]) {
    this.parameters = parameters as SQLInputValue[];
    return this;
  }

  private prepare() {
    return this.database.prepare(this.statementSql);
  }

  async run() {
    const statement = this.prepare();
    if (statement.columns().length > 0) {
      return {
        success: true,
        results: statement.all(...this.parameters),
        meta: { changes: 0 },
      };
    }
    const result = statement.run(...this.parameters);
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
    const values = rows.map((row) =>
      columns.map((column) => row[column]),
    );
    return options?.columnNames ? [columns, ...values] : values;
  }
}

export function createNodeD1Binding({
  filename = ":memory:",
  migrate = false,
}: {
  filename?: string;
  migrate?: boolean;
} = {}) {
  const database = new DatabaseSync(filename);
  database.exec("PRAGMA foreign_keys = ON");

  if (migrate) {
    const migrationDirectory = join(process.cwd(), "drizzle");
    for (const file of readdirSync(migrationDirectory)
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      database.exec(
        readFileSync(join(migrationDirectory, file), "utf8"),
      );
    }
  }

  const binding = {
    prepare(statementSql: string) {
      return new NodeD1Statement(database, statementSql);
    },
    async batch(statements: NodeD1Statement[]) {
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
