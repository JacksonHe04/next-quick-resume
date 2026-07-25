import { cookies } from "next/headers";

import { getDb } from "@/db/client";
import { createTransactionalEmail } from "@/modules/auth/email";
import { createAuthRepository } from "@/modules/auth/repository";
import {
  resolveSession,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/session";

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

export async function getOptionalCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const repository = await getAuthRepository();
  const session = await resolveSession(repository, token);
  if (!session) return null;
  const user = await repository.findUserById(session.userId);
  return user && !user.disabledAt ? user : null;
}
