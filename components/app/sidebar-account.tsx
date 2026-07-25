import { connection } from "next/server";

import { SidebarAccountClient } from "@/components/app/sidebar-account-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getOptionalCurrentUser } from "@/modules/auth/server";

export async function SidebarAccount() {
  await connection();
  const user = await getOptionalCurrentUser();

  return (
    <SidebarAccountClient
      user={user ? { name: user.name, email: user.email } : null}
    />
  );
}

export function SidebarAccountSkeleton() {
  return (
    <div
      className="flex items-center gap-2.5 px-2 py-2 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0"
      aria-hidden="true"
    >
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5 group-data-[collapsed=true]/sidebar:hidden">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
