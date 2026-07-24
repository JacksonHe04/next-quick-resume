import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#202620] shadow-[0_1px_0_rgb(32_38_32/0.02)] transition placeholder:text-[#98a099]",
        "border-[#dce5dd] hover:border-[#bdcabe] focus:border-[#55b97a] focus:outline-none focus:ring-3 focus:ring-[#55b97a]/15",
        error &&
          "border-[#c45a67] focus:border-[#c45a67] focus:ring-[#c45a67]/15",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
