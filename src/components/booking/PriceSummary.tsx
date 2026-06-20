"use client";

import type { Quote } from "@/lib/pricing";
import { usd } from "@/lib/format";
import { Odometer } from "@/components/ui/Odometer";

export function PriceSummary({
  quote,
  delivery,
  concierge,
  showZero = false,
}: {
  quote: Quote;
  delivery?: boolean;
  concierge?: boolean;
  showZero?: boolean;
}) {
  if (quote.nights === 0 && !showZero) {
    return (
      <p className="font-mono text-[0.8rem] tracking-[0.08em] text-slate">
        Choose dates to see the total.
      </p>
    );
  }

  return (
    <dl className="space-y-3 font-mono text-sm">
      <Row
        label={`${usd(quote.dailyRate)} × ${quote.nights} ${
          quote.nights === 1 ? "day" : "days"
        }`}
        value={quote.subtotal}
      />
      {delivery && <Row label="Delivery & collection" value={250} />}
      {concierge && <Row label="Concierge service" value={180} />}
      <Row label="Care & cover" value={quote.careFee} />
      <div className="h-px bg-line" />
      <div className="flex items-center justify-between pt-1">
        <dt className="font-display text-base tracking-tightish">Total</dt>
        <dd className="font-display text-2xl tracking-tightish">
          <Odometer value={quote.total} prefix="$" group />
        </dd>
      </div>
      <p className="pt-1 text-[0.7rem] leading-relaxed text-slate">
        No charge is taken in this demo — booking ends at confirmation.
      </p>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-graphite">
      <dt>{label}</dt>
      <dd className="text-asphalt tnum">{usd(value)}</dd>
    </div>
  );
}
