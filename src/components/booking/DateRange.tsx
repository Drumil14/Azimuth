"use client";

import { toInputDate } from "@/lib/format";
import { FieldLabel } from "@/components/ui";

export function DateRange({
  start,
  end,
  onStart,
  onEnd,
  compact,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  compact?: boolean;
}) {
  const today = toInputDate(new Date());
  const minEnd = start
    ? toInputDate(new Date(new Date(start).getTime() + 86400000))
    : today;

  const inputCls =
    "w-full bg-paper border border-line px-4 h-12 text-[0.95rem] text-asphalt focus:border-asphalt focus:outline-none transition-colors";

  return (
    <div className={compact ? "grid grid-cols-2 gap-3" : "grid gap-4 sm:grid-cols-2"}>
      <label className="block">
        <FieldLabel>Collect</FieldLabel>
        <input
          type="date"
          value={start}
          min={today}
          onChange={(e) => {
            onStart(e.target.value);
            if (end && e.target.value && new Date(end) <= new Date(e.target.value)) {
              onEnd("");
            }
          }}
          className={inputCls}
        />
      </label>
      <label className="block">
        <FieldLabel>Return</FieldLabel>
        <input
          type="date"
          value={end}
          min={minEnd}
          disabled={!start}
          onChange={(e) => onEnd(e.target.value)}
          className={inputCls + (start ? "" : " opacity-50")}
        />
      </label>
    </div>
  );
}
