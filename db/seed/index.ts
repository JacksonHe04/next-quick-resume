import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { seedOfficialCatalog } from "@/db/seed/catalog";
import { seedDemoUserData } from "@/db/seed/demo";

type Database = DrizzleD1Database<typeof schema>;

export async function seed(
  database: Database,
  options: {
    demo?: { email: string; passwordHash: string };
    now?: Date;
  } = {},
) {
  const now = options.now ?? new Date();
  await seedOfficialCatalog(database, now);
  if (options.demo) {
    await seedDemoUserData(database, { ...options.demo, now });
  }
}

export { seedDemoUserData, seedOfficialCatalog };
