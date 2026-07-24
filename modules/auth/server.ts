import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getDb } from "@/db/client";
import { createTransactionalEmail } from "@/modules/auth/email";
import { createAuthRepository } from "@/modules/auth/repository";

type AuthEnvironment = CloudflareEnv & {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  SESSION_SECRET?: string;
};

function requireEnvironmentValue(
  environment: AuthEnvironment,
  key: keyof Pick<
    AuthEnvironment,
    "RESEND_API_KEY" | "RESEND_FROM_EMAIL" | "SESSION_SECRET"
  >,
): string {
  const value = environment[key];
  if (!value) {
    throw new Error(`Missing required runtime variable: ${key}`);
  }
  return value;
}

export async function getAuthRuntime() {
  const [{ env }, database] = await Promise.all([
    getCloudflareContext({ async: true }),
    getDb(),
  ]);
  const environment = env as AuthEnvironment;

  return {
    repository: createAuthRepository(database),
    email: createTransactionalEmail(
      requireEnvironmentValue(environment, "RESEND_API_KEY"),
      requireEnvironmentValue(environment, "RESEND_FROM_EMAIL"),
    ),
    secret: requireEnvironmentValue(environment, "SESSION_SECRET"),
  };
}
