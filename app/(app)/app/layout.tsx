import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getAuthRepository } from "@/modules/auth/server";
import {
  resolveSession,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const repository = await getAuthRepository();
  const session = await resolveSession(repository, token);
  if (!session) redirect("/login");

  const user = await repository.findUserById(session.userId);
  if (!user || user.disabledAt) redirect("/login");

  return (
    <AppShell user={{ name: user.name, email: user.email }}>
      {children}
    </AppShell>
  );
}
