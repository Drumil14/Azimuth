"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useReveal } from "@/lib/hooks";
import { Spinner } from "@/components/Icons";

// ── Button ───────────────────────────────────────────────────────────────────
type Variant = "solid" | "outline" | "ghost" | "oxblood";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  solid:
    "bg-asphalt text-bone hover:bg-black border border-asphalt",
  oxblood:
    "bg-oxblood text-bone hover:bg-oxblood-bright border border-oxblood",
  outline:
    "bg-transparent text-asphalt border border-asphalt/30 hover:border-asphalt hover:bg-asphalt/[0.03]",
  ghost: "bg-transparent text-asphalt hover:bg-asphalt/[0.05] border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-[0.95rem]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", size = "md", loading, href, block, className, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.08em] transition-all duration-300 ease-instrument rounded-none disabled:opacity-50 disabled:pointer-events-none",
      variants[variant],
      sizes[size],
      block && "w-full",
      className
    );
    const content = (
      <>
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </>
    );
    if (href) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";

// ── Tag ──────────────────────────────────────────────────────────────────────
export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "oxblood" | "muted" | "outline";
  className?: string;
}) {
  const tones = {
    default: "bg-asphalt text-bone",
    oxblood: "bg-oxblood text-bone",
    muted: "bg-asphalt/[0.06] text-graphite",
    outline: "border border-asphalt/25 text-asphalt",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[0.62rem] uppercase tracking-[0.18em] px-2.5 py-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Reveal ─────────────────────────────────────────────────────────────────
export function Reveal({
  children,
  className,
  as: As = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  delay?: number;
}) {
  const ref = useReveal();
  return (
    <As
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </As>
  );
}

// ── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({
  index,
  label,
  title,
  intro,
  align = "left",
  action,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center"
      )}
    >
      <div className="flex items-center gap-4">
        {index && (
          <span className="font-mono text-[0.7rem] text-oxblood tracking-[0.1em]">
            {index}
          </span>
        )}
        <span className="eyebrow">{label}</span>
      </div>
      <div
        className={cn(
          "flex w-full items-end justify-between gap-8",
          align === "center" && "justify-center"
        )}
      >
        <h2 className="font-display text-display-md max-w-[18ch]">{title}</h2>
        {action && <div className="hidden md:block shrink-0">{action}</div>}
      </div>
      {intro && (
        <p className="max-w-prose2 text-graphite text-[1.05rem] leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}

// ── Form fields ──────────────────────────────────────────────────────────────
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow mb-2 block text-asphalt">{children}</span>
  );
}

const inputBase =
  "w-full bg-paper border border-line text-asphalt placeholder:text-slate/70 px-4 h-12 text-[0.95rem] focus:border-asphalt focus:outline-none focus:ring-0 transition-colors";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(inputBase, "h-auto py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(inputBase, "appearance-none pr-10 cursor-pointer", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint && !error && (
        <span className="mt-1.5 block text-xs text-slate">{hint}</span>
      )}
      {error && (
        <span className="mt-1.5 block text-xs text-oxblood">{error}</span>
      )}
    </label>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────
export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}
