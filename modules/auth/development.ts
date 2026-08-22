import type { InonProjectSession } from "@inon-ai/inon-sso";

type DevelopmentEnvironment = {
  NODE_ENV?: string;
  SAYLESS_DEV_USER_ID?: string;
  SAYLESS_DEV_USER_EMAIL?: string;
  SAYLESS_DEV_USER_NAME?: string;
};

const DEFAULT_DEV_USER_ID = "8pqFCzEJpyYdXWAObnzmq8337FIVrzmZ";
const DEFAULT_DEV_USER_EMAIL = "yingyingdontkill@gmail.com";
const DEFAULT_DEV_USER_NAME = "Jackson";

/**
 * Local-only identity override. When enabled (NODE_ENV=development unless
 * SAYLESS_DEV_USER_EMAIL is explicitly empty), every request is authenticated
 * as this user without going through the iNon SSO redirect. The defaults match
 * the real iNon account so existing SAYLESS data is mounted as-is.
 */
export function isDevelopmentAuthEnabled(
  environment: DevelopmentEnvironment = process.env,
): boolean {
  return (
    environment.NODE_ENV === "development" &&
    (environment.SAYLESS_DEV_USER_EMAIL ?? DEFAULT_DEV_USER_EMAIL).trim().length >
      0
  );
}

export function getDevelopmentSession(
  environment: DevelopmentEnvironment = process.env,
): InonProjectSession | null {
  if (!isDevelopmentAuthEnabled(environment)) return null;

  const email = (
    environment.SAYLESS_DEV_USER_EMAIL ?? DEFAULT_DEV_USER_EMAIL
  )
    .trim()
    .toLowerCase();
  if (!email) return null;

  const now = Date.now();
  return {
    id:
      environment.SAYLESS_DEV_USER_ID?.trim() ||
      DEFAULT_DEV_USER_ID,
    email,
    emailVerified: true,
    username:
      environment.SAYLESS_DEV_USER_NAME?.trim() ||
      DEFAULT_DEV_USER_NAME,
    project: "sayless",
    projectRole: "admin",
    issuedAt: now,
    absoluteExpiresAt: now + 90 * 24 * 60 * 60 * 1000,
  };
}
