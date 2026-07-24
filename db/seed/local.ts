import { readdirSync } from "node:fs";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/d1";

import { createNodeD1Binding } from "@/db/node-d1-binding";
import { seed } from "@/db/seed";
import * as schema from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";

const directory = join(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
);
const databaseFiles = readdirSync(directory)
  .filter(
    (name) => name.endsWith(".sqlite") && name !== "metadata.sqlite",
  )
  .sort();

if (databaseFiles.length !== 1) {
  throw new Error(
    `Expected one local D1 database, found ${databaseFiles.length}. Run pnpm db:migrate:local first.`,
  );
}

async function main() {
  const email =
    process.env.SAYLESS_DEMO_EMAIL ?? "demo@local.sayless.app";
  const password =
    process.env.SAYLESS_DEMO_PASSWORD ?? "sayless-demo-2026";
  const nodeDatabase = createNodeD1Binding({
    filename: join(directory, databaseFiles[0]),
  });

  try {
    await seed(drizzle(nodeDatabase.binding, { schema }), {
      demo: {
        email,
        passwordHash: await hashPassword(password),
      },
    });
    process.stdout.write(
      `Seeded local SAYLESS data for ${email}. Demo password: ${password}\n`,
    );
  } finally {
    nodeDatabase.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
