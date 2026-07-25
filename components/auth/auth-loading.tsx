import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <p role="status" className="sr-only">
        账户页面加载中
      </p>
      <div className="w-full max-w-[420px]" aria-hidden="true">
        <Skeleton className="mb-6 h-5 w-24" />
        <section className="rounded-xl border border-border bg-background p-6 shadow-xl shadow-black/[0.04] sm:p-8">
          <Skeleton className="size-8" />
          <Skeleton className="mt-6 h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-64 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <div className="mt-7 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-7 border-t border-border pt-5">
            <Skeleton className="mx-auto h-4 w-40" />
          </div>
        </section>
      </div>
    </main>
  );
}
