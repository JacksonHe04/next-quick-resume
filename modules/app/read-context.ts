import "server-only";

import { connection } from "next/server";
import { cache } from "react";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
import { getOptionalCurrentUser } from "@/modules/auth/server";

export const getAppReadContext = cache(async function getAppReadContext() {
  await connection();
  const [database, user] = await Promise.all([
    getDb(),
    getOptionalCurrentUser(),
  ]);

  return {
    database,
    user,
    userId: user?.id ?? DEMO_USER_ID,
    isGuest: !user,
  };
});
