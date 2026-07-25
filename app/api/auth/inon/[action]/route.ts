import { getInonProjectSso } from "@/modules/auth/inon-sso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return getInonProjectSso().handler(request);
}
