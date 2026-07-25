import { Columns3, Table2 } from "lucide-react";

import { IntentLink } from "@/components/app/intent-link";
import { cn } from "@/lib/utils";

export function ResumeWorkspaceSwitch({
  mode,
  editorHref,
  compact = false,
}: {
  mode: "manage" | "edit";
  editorHref?: string;
  compact?: boolean;
}) {
  const itemClass =
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="简历视图"
      className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5"
    >
      <IntentLink
        href="/app/resumes"
        aria-current={mode === "manage" ? "page" : undefined}
        className={cn(
          itemClass,
          mode === "manage"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Table2 aria-hidden="true" />
        <span className={compact ? "hidden sm:inline" : undefined}>管理</span>
      </IntentLink>
      {editorHref ? (
        <IntentLink
          href={editorHref}
          aria-current={mode === "edit" ? "page" : undefined}
          className={cn(
            itemClass,
            mode === "edit"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Columns3 aria-hidden="true" />
          <span className={compact ? "hidden sm:inline" : undefined}>编辑</span>
        </IntentLink>
      ) : (
        <span
          aria-disabled="true"
          title="先创建一份简历"
          className={cn(itemClass, "cursor-not-allowed text-muted-foreground/45")}
        >
          <Columns3 aria-hidden="true" />
          <span className={compact ? "hidden sm:inline" : undefined}>编辑</span>
        </span>
      )}
    </nav>
  );
}
