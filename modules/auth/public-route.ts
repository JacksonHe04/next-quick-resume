import { getDevelopmentSession } from "@/modules/auth/development";
import { getInonProjectSso } from "@/modules/auth/inon-sso";

function safeReturnTo(value: string | null): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/resumes";
  }
  return value;
}

function developmentRedirect(request: Request): Response {
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get("returnTo"));
  return new Response(null, {
    status: 303,
    headers: {
      Location: returnTo,
      "Cache-Control": "no-store",
    },
  });
}

export function handleSaylessPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Response {
  // In development the session is synthesized locally, so the OAuth transition
  // document and redirect to inon.space are bypassed entirely.
  if (getDevelopmentSession()) {
    return developmentRedirect(request);
  }
  return getInonProjectSso().transition(request, action);
}
