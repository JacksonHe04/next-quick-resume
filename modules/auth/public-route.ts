import { getInonProjectSso } from "@/modules/auth/inon-sso";

export function handleSaylessPublicSsoRoute(
  request: Request,
  action: "login" | "logout" | "refresh",
): Promise<Response> {
  const sso = getInonProjectSso();
  const url = new URL(request.url);
  url.pathname = `${sso.basePath}/${action}`;
  return sso.handler(new Request(url, request));
}
