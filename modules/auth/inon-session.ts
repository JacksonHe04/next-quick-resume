import type { InonProjectSession } from "@inon-ai/inon-sso";
import { headers } from "next/headers";

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

export async function getInonProjectSession(): Promise<InonProjectSession | null> {
  return getInonProjectSso().getSession(await currentInonRequest());
}
