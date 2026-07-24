import { readdirSync } from "node:fs";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/d1";

import { createNodeD1Binding } from "@/db/node-d1-binding";
import * as schema from "@/db/schema";
import { batches, userPreferences, users } from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";

const directory = join(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
);
const files = readdirSync(directory).filter(
  (name) => name.endsWith(".sqlite") && name !== "metadata.sqlite",
);
if (files.length !== 1) throw new Error("Local D1 database not found");

async function main() {
  const nodeDatabase = createNodeD1Binding({
    filename: join(directory, files[0]),
  });
  const database = drizzle(nodeDatabase.binding, { schema });
  const now = new Date();
  try {
    await database
      .insert(users)
      .values({
        id: "e2e-isolated-user",
        email: "isolated@local.sayless.app",
        passwordHash: await hashPassword("sayless-isolated-2026"),
        name: "隔离测试用户",
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          passwordHash: await hashPassword("sayless-isolated-2026"),
          updatedAt: now,
        },
      })
      .run();
    await database
      .insert(batches)
      .values({
        id: "e2e-isolated-batch",
        userId: "e2e-isolated-user",
        name: "隔离批次",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();
    await database
      .insert(userPreferences)
      .values({
        userId: "e2e-isolated-user",
        currentBatchId: "e2e-isolated-batch",
        timezone: "Asia/Singapore",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          currentBatchId: "e2e-isolated-batch",
          updatedAt: now,
        },
      })
      .run();
  } finally {
    nodeDatabase.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
