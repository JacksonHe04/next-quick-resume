import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "info"
  | "warning"
  | "positive"
  | "negative";

export const STATUS_PRESENTATIONS = {
  upcoming: { label: "待进行", tone: "neutral" },
  pending_result: { label: "待结果", tone: "warning" },
  passed: { label: "已通过", tone: "positive" },
  failed: { label: "未通过", tone: "negative" },
  active: { label: "进行中", tone: "info" },
  current: { label: "当前批次", tone: "positive" },
  archived: { label: "已归档", tone: "neutral" },
} as const satisfies Record<
  string,
  { label: string; tone: StatusTone }
>;

const TONE_CLASS_NAMES: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  negative: "border-red-200 bg-red-50 text-red-700",
};

export type KnownStatus = keyof typeof STATUS_PRESENTATIONS;

export function StatusBadge({
  value,
  className,
  ...props
}: {
  value: KnownStatus;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  const presentation = STATUS_PRESENTATIONS[value];

  return (
    <PresentationBadge
      label={presentation.label}
      tone={presentation.tone}
      className={className}
      {...props}
    />
  );
}

export function PresentationBadge({
  label,
  tone,
  className,
  ...props
}: {
  label: string;
  tone: StatusTone;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASS_NAMES[tone],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}
