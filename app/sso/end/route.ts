import { handleSaylessPublicSsoRoute } from "@/modules/auth/public-route";

export function GET(request: Request): Response {
  return handleSaylessPublicSsoRoute(request, "logout");
}
