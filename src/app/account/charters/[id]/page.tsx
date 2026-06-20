"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui";
import { Odometer } from "@/components/ui/Odometer";
import { StatusTag } from "@/components/StatusTag";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { ChevronLeft, Pin, Check } from "@/components/Icons";
import { coordTag, dateLong } from "@/lib/format";

export default function CharterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(
    () => api.booking(params.id),
    [params.id]
  );
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (loading)
    return <div className="font-mono text-slate">Loading charter…</div>;
  if (error || !data)
    return (
      <div>
        <p className="font-display text-2xl">We couldn&apos;t find that charter.</p>
        <Button href="/account" variant="outline" className="mt-6">
          Back to your charters
        </Button>
      </div>
    );

  const b: Booking = data.booking;
  const v = b.vehicle;
  const isUpcoming = new Date(b.endDate) >= new Date();
  const canCancel = b.status === "CONFIRMED" && isUpcoming;

  async function cancel() {
    setCancelling(true);
    setMsg(null);
    try {
      await api.cancelBooking(b.id);
      reload();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Couldn't cancel.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <Link
        href="/account"
        className="inline-flex items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-graphite hover:text-asphalt"
      >
        <ChevronLeft className="h-4 w-4" /> All charters
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="font-mono text-lg tracking-[0.1em]">{b.ref}</span>
        <StatusTag status={b.status} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {v && (
            <Link href={`/collection/${v.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-asphalt/5">
                {v.images[0] && (
                  <Image
                    src={v.images[0]}
                    alt={`${v.make} ${v.model}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[1.2s] ease-instrument group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <h1 className="mt-5 font-display text-display-md tracking-tighter2">
                {v.make} {v.model}
              </h1>
            </Link>
          )}

          <dl className="mt-8 grid gap-px bg-line sm:grid-cols-2">
            <Cell label="Collect" value={dateLong(b.startDate)} />
            <Cell label="Return" value={dateLong(b.endDate)} />
            <Cell label="Duration" value={`${b.nights} ${b.nights === 1 ? "day" : "days"}`} />
            <Cell
              label="Pickup"
              value={b.pickupLocation}
              icon={<Pin className="h-3.5 w-3.5" />}
            />
            <Cell label="Delivery" value={b.delivery ? "Included" : "—"} />
            <Cell label="Concierge" value={b.concierge ? "Included" : "—"} />
          </dl>

          {b.notes && (
            <div className="mt-8">
              <p className="eyebrow">Your notes</p>
              <p className="mt-2 max-w-prose2 text-asphalt/90">{b.notes}</p>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-paper p-7">
            <p className="eyebrow">Charter total</p>
            <p className="mt-2 font-display text-4xl tracking-tightish">
              <Odometer value={b.total} prefix="$" group />
            </p>
            <div className="mt-6 border-t border-line pt-6">
              <PriceSummary
                quote={{
                  nights: b.nights,
                  dailyRate: b.dailyRate,
                  subtotal: b.subtotal,
                  careFee: b.careFee,
                  addOnsFee: b.addOnsFee,
                  total: b.total,
                }}
                delivery={b.delivery}
                concierge={b.concierge}
                showZero
              />
            </div>

            {canCancel ? (
              <>
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="mt-6 w-full border border-oxblood/40 py-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-oxblood transition-colors hover:bg-oxblood/[0.05] disabled:opacity-50"
                >
                  {cancelling ? "Cancelling…" : "Cancel charter"}
                </button>
                {msg && (
                  <p className="mt-3 font-mono text-[0.72rem] text-oxblood">{msg}</p>
                )}
              </>
            ) : (
              <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-slate">
                <Check className="h-4 w-4" />
                {b.status === "CANCELLED"
                  ? "This charter was cancelled."
                  : b.status === "COMPLETED"
                  ? "This charter is complete."
                  : "This charter has passed."}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-fog px-5 py-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate">
        {label}
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-[1rem] text-asphalt">
        {icon}
        {value}
      </p>
    </div>
  );
}
