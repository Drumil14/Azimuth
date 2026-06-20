type ClassValue = string | number | false | null | undefined;

/** Minimal class joiner — no dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
