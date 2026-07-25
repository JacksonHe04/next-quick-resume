import { AppShell } from "@/components/app/app-shell";
import { getOptionalCurrentUser } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOptionalCurrentUser();

  return (
    <AppShell
      user={user ? { name: user.name, email: user.email } : null}
    >
      {children}
    </AppShell>
  );
}
