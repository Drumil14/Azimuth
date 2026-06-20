import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The wordmark. The trailing bearing notation (°) nods to the navigational
 * meaning of "azimuth" — a heading. Kept small and quiet.
 */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };
  return (
    <Link href="/" className={cn("group inline-flex items-baseline gap-1", className)}>
      <span
        className={cn(
          "font-display font-extrabold tracking-[-0.04em] leading-none",
          sizes[size]
        )}
      >
        AZIMUTH
      </span>
      <span className="font-mono text-oxblood text-[0.7em] leading-none transition-transform duration-500 ease-instrument group-hover:rotate-90 inline-block">
        °
      </span>
    </Link>
  );
}
