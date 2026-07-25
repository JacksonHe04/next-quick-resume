import { redirect } from "next/navigation";

import { getInonProjectSso } from "@/modules/auth/inon-sso";
import { safePostAuthPath } from "@/modules/auth/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safePostAuthPath((await searchParams).next);
  redirect(getInonProjectSso().loginUrl(nextPath));
}
