"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface OdometerProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** group thousands with commas */
  group?: boolean;
}

/**
 * Rolling-digit figure. Each digit sits in a column; on scroll-into-view the
 * reels roll up to their target. The mechanical stagger is intentional —
 * it borrows from an instrument cluster settling.
 */
export function Odometer({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  group = false,
}: OdometerProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [rolled, setRolled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRolled(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRolled(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fixed = Math.abs(value).toFixed(decimals);
  let display = fixed;
  if (group) {
    const [int, frac] = fixed.split(".");
    display = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (frac ? "." + frac : "");
  }
  const chars = (value < 0 ? "-" : "").concat(display).split("");

  let digitIndex = 0;

  return (
    <span ref={ref} className={cn("odo tnum", className)} aria-label={`${prefix}${display}${suffix}`}>
      {prefix && <span className="odo__digit">{prefix}</span>}
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} className="odo__digit">
              {ch}
            </span>
          );
        }
        const target = Number(ch);
        const idx = digitIndex++;
        const translate = rolled ? `translateY(-${target}em)` : "translateY(0)";
        return (
          <span key={i} className="odo__col" aria-hidden>
            <span
              className="odo__reel"
              style={{
                transform: translate,
                transitionDelay: `${idx * 70}ms`,
              }}
            >
              {Array.from({ length: 10 }).map((_, d) => (
                <span key={d} className="odo__digit">
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span className="odo__digit">{suffix}</span>}
    </span>
  );
}
