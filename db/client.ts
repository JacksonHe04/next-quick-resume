import { drizzle } from "drizzle-orm/d1";

import { createRemoteD1Binding } from "@/db/remote-d1-binding";
import * as schema from "@/db/schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function requireEnvironmentValue(key: "D1_GATEWAY_URL" | "D1_GATEWAY_TOKEN") {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required runtime variable: ${key}`);
  return value;
}

export async function getDb() {
  if (database) return database;

  database = drizzle(
    createRemoteD1Binding({
      url: requireEnvironmentValue("D1_GATEWAY_URL"),
      token: requireEnvironmentValue("D1_GATEWAY_TOKEN"),
    }),
    { schema },
  );
  return database;
}
