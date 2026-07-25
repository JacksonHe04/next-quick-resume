import { centralAccountManagedResponse } from "@/modules/auth/managed-response";

export async function DELETE() {
  return centralAccountManagedResponse();
}
