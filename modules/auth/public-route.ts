import { getInonProjectSso } from "@/modules/auth/inon-sso";

export function handleSaylessPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Response {
  const sso = getInonProjectSso();
  return sso.transition(request, action);
}
