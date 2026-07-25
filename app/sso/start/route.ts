import { handleSaylessPublicSsoRoute } from "@/modules/auth/public-route";

export function GET(request: Request): Promise<Response> {
  return handleSaylessPublicSsoRoute(request, "login");
}
