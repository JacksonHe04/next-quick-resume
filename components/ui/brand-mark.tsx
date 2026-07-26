import Image from "next/image";
import type { CSSProperties } from "react";

type BrandMarkSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<BrandMarkSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
};

const PX: Record<BrandMarkSize, number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

const RADIUS: Record<BrandMarkSize, string> = {
  sm: "rounded-md",
  md: "rounded-md",
  lg: "rounded-lg",
};

/**
 * Sayless brand mark — wraps the S logo image in a tile that matches the
 * previous "S letter on dark square" silhouette so the layout doesn't shift.
 *
 * The image is transparent (deep-blue S + cool highlights), so use `variant="default"`
 * on light surfaces (sidebar / landing) and `variant="inverted"` on dark surfaces
 * (dark mode tiles) to keep the S legible.
 */
export function BrandMark({
  size = "sm",
  variant = "default",
  className,
  style,
  alt = "SAYLESS",
}: {
  size?: BrandMarkSize;
  variant?: "default" | "inverted";
  className?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  const inverted = variant === "inverted";
  return (
    <span
      className={[
        "grid shrink-0 place-items-center overflow-hidden",
        SIZE_CLASS[size],
        RADIUS[size],
        inverted ? "bg-background ring-1 ring-border" : "bg-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <Image
        src="/logo.png"
        alt={alt}
        width={PX[size]}
        height={PX[size]}
        // Logo has a transparent background; preserveTransparency keeps it crisp.
        priority={false}
      />
    </span>
  );
}
