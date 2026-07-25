import { redirect } from "next/navigation";

import { safePostAuthPath } from "@/modules/auth/navigation";
import { saylessLoginPath } from "@/modules/auth/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safePostAuthPath((await searchParams).next);
  redirect(saylessLoginPath(nextPath));
}
