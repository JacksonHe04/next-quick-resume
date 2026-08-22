import type { InonProjectSession } from "@inon-ai/inon-sso";
import { headers } from "next/headers";

import { getDevelopmentSession } from "@/modules/auth/development";
import { getInonProjectSso } from "@/modules/auth/inon-sso";

function publicOrigin(): string {
  return (
    process.env.INON_SSO_PUBLIC_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://sayless.inon.space"
      : "http://localhost:3000")
  );
}

export async function currentInonRequest(): Promise<Request> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  return new Request(
    publicOrigin(),
    cookie ? { headers: { cookie } } : undefined,
  );
}

/**
 * Resolve the iNon project session. In development this is short-circuited by
 * the local identity override (modules/auth/development.ts), otherwise it reads
 * the encrypted session cookie issued by the OAuth callback. Pass the incoming
 * Request from route handlers so its cookie is used; React Server Components
 * call without arguments and the request is reconstructed from headers().
 */
export async function getInonProjectSession(
  request?: Request,
): Promise<InonProjectSession | null> {
  const development = getDevelopmentSession();
  if (development) return development;
  return getInonProjectSso().getSession(request ?? (await currentInonRequest()));
}
