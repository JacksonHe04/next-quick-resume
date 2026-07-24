import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-[#dce5dd] bg-white shadow-[0_16px_50px_rgb(32_38_32/0.07)]",
        className,
      )}
      {...props}
    />
  );
}
