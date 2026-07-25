import { cache } from "react";

import { getDb } from "@/db/client";
import { createTransactionalEmail } from "@/modules/auth/email";
import { getInonProjectSession } from "@/modules/auth/inon-session";
import { resolveInonProjectUser } from "@/modules/auth/inon-user";
import { createAuthRepository } from "@/modules/auth/repository";

function requireEnvironmentValue(
  key: "RESEND_API_KEY" | "RESEND_FROM_EMAIL" | "SESSION_SECRET",
): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required runtime variable: ${key}`);
  }
  return value;
}

export async function getAuthRuntime() {
  const repository = await getAuthRepository();

  return {
    repository,
    email: createTransactionalEmail(
      requireEnvironmentValue("RESEND_API_KEY"),
      requireEnvironmentValue("RESEND_FROM_EMAIL"),
    ),
    secret: requireEnvironmentValue("SESSION_SECRET"),
  };
}

export async function getAuthRepository() {
  return createAuthRepository(await getDb());
}

export const getOptionalCurrentUser = cache(async function getOptionalCurrentUser() {
  const session = await getInonProjectSession();
  if (!session) return null;

  const user = await resolveInonProjectUser(await getDb(), session);
  return user && !user.disabledAt ? user : null;
});
