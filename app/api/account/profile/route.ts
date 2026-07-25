import { centralAccountManagedResponse } from "@/modules/auth/managed-response";

export async function PATCH() {
  return centralAccountManagedResponse();
}
