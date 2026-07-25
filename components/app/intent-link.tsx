"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type IntentLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

export function IntentLink({
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}: IntentLinkProps) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
    />
  );
}
