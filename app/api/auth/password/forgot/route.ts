import { centralAccountManagedResponse } from "@/modules/auth/managed-response";

export async function POST() {
  return centralAccountManagedResponse();
}
