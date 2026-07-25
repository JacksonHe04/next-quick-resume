import { legacyAuthDisabledResponse } from "@/modules/auth/managed-response";

export async function POST() {
  return legacyAuthDisabledResponse();
}
