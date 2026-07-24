import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

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
  archived: { label: "已归档", tone: "neutral" },
} as const satisfies Record<
  string,
  { label: string; tone: StatusTone }
>;

const TONE_CLASS_NAMES: Record<StatusTone, string> = {
  neutral: "border-[#dce5dd] bg-[#f3f5f1] text-[#687269]",
  info: "border-[#cae2d1] bg-[#eaf6ee] text-[#27764b]",
  warning: "border-[#ead2ad] bg-[#fbf3e6] text-[#965f1d]",
  positive: "border-[#baddc6] bg-[#e7f6ec] text-[#27764b]",
  negative: "border-[#ebc3c8] bg-[#fbecef] text-[#9d4450]",
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
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS_NAMES[presentation.tone],
        className,
      )}
      {...props}
    >
      {presentation.label}
    </span>
  );
}
