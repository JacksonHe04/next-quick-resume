import { FilePenLine, Files } from "lucide-react";

import { IntentLink } from "@/components/app/intent-link";
import { cn } from "@/lib/utils";

export function ResumeWorkspaceSwitch({
  mode,
  editorHref,
}: {
  mode: "manage" | "edit";
  editorHref?: string;
}) {
  const itemClass =
    "inline-flex size-8 items-center justify-center rounded-md transition-colors";

  return (
    <nav
      aria-label="简历视图"
      className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5"
    >
      <IntentLink
        href="/resumes"
        aria-label="管理简历"
        title="管理简历"
        aria-current={mode === "manage" ? "page" : undefined}
        className={cn(
          itemClass,
          mode === "manage"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Files className="size-4" aria-hidden="true" />
      </IntentLink>
      {editorHref ? (
        <IntentLink
          href={editorHref}
          aria-label="编辑简历"
          title="编辑简历"
          aria-current={mode === "edit" ? "page" : undefined}
          className={cn(
            itemClass,
            mode === "edit"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <FilePenLine className="size-4" aria-hidden="true" />
        </IntentLink>
      ) : (
        <span
          aria-disabled="true"
          title="先创建一份简历"
          aria-label="编辑简历"
          className={cn(itemClass, "cursor-not-allowed text-muted-foreground/45")}
        >
          <FilePenLine className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
