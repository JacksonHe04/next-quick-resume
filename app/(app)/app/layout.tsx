import { Suspense } from "react";

import { AppShell } from "@/components/app/app-shell";
import {
  SidebarAccount,
  SidebarAccountSkeleton,
} from "@/components/app/sidebar-account";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      account={
        <Suspense fallback={<SidebarAccountSkeleton />}>
          <SidebarAccount />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
