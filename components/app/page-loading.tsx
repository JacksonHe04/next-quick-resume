import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function LoadingStatus({ label = "页面加载中" }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}

function TableRows({ count = 6 }: { count?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-background"
      aria-hidden="true"
    >
      <div className="grid h-11 grid-cols-[1.2fr_1fr_1fr_0.8fr] items-center gap-5 border-b border-border bg-muted/35 px-5">
        {[36, 24, 28, 16].map((width, index) => (
          <Skeleton
            key={index}
            className="h-3"
            style={{ width: `${width}%`, minWidth: "3rem" }}
          />
        ))}
      </div>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="grid min-h-14 grid-cols-[1.2fr_1fr_1fr_0.8fr] items-center gap-5 border-b border-border px-5 last:border-b-0"
        >
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListPageLoading({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <LoadingStatus />
      <Skeleton className="h-9 w-32" aria-hidden="true" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" aria-hidden="true" />
      <div
        className="mt-7 flex items-center justify-between gap-4"
        aria-hidden="true"
      >
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-28 shrink-0" />
      </div>
      <div className={cn("mt-5", compact && "max-w-5xl")}>
        <TableRows count={compact ? 4 : 6} />
      </div>
    </div>
  );
}

export function DetailPageLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <LoadingStatus />
      <Skeleton className="h-4 w-24" aria-hidden="true" />
      <div className="mt-7 space-y-3" aria-hidden="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <div
        className="mt-8 grid gap-4 rounded-lg border border-border p-5 sm:grid-cols-3"
        aria-hidden="true"
      >
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div
        className="mt-5 space-y-4 rounded-lg border border-border p-5"
        aria-hidden="true"
      >
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="ml-auto h-10 w-28" />
      </div>
    </div>
  );
}

export function DashboardPageLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <LoadingStatus label="总览加载中" />
      <div aria-hidden="true">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-3 h-10 w-96 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ResumeEditorPageLoading() {
  return (
    <div className="min-h-screen bg-[#f4f6f1]">
      <LoadingStatus label="简历编辑器加载中" />
      <div
        className="flex h-14 items-center justify-between border-b border-border bg-background px-5"
        aria-hidden="true"
      >
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div
        className="grid min-h-[calc(100vh-3.5rem)] gap-px lg:grid-cols-[280px_minmax(0,1fr)_320px]"
        aria-hidden="true"
      >
        <div className="space-y-4 bg-background p-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="grid place-items-start p-8">
          <Skeleton className="mx-auto aspect-[210/297] w-full max-w-[760px] shadow-sm" />
        </div>
        <div className="space-y-4 bg-background p-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
