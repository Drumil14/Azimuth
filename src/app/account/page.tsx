"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui";
import { StatusTag } from "@/components/StatusTag";
import { Odometer } from "@/components/ui/Odometer";
import { dateLong } from "@/lib/format";
import { ArrowRight } from "@/components/Icons";

export default function AccountPage() {
  const { data, loading } = useAsync(() => api.bookings(), []);
  const bookings = data?.bookings ?? [];

  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.endDate) >= new Date()
  ).length;
  const totalNights = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + b.nights, 0);

  return (
    <div>
      {/* summary */}
      <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
        <Summary label="Charters" value={bookings.length} loading={loading} />
        <Summary label="Upcoming" value={upcoming} loading={loading} />
        <Summary
          label="Days on the road"
          value={totalNights}
          loading={loading}
          className="col-span-2 md:col-span-1"
        />
      </div>

      <h2 className="mt-12 eyebrow">Your charters</h2>

      {loading ? (
        <div className="mt-5 space-y-px bg-line">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-paper" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-4 border border-line bg-paper p-10">
          <p className="font-display text-2xl">No charters yet.</p>
          <p className="max-w-sm text-graphite">
            When you reserve a car it&apos;ll appear here, with everything you need
            for the handover.
          </p>
          <Button href="/collection" variant="solid">
            Browse the fleet
          </Button>
        </div>
      ) : (
        <ul className="mt-5 space-y-px bg-line">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const v = booking.vehicle;
  return (
    <li>
      <Link
        href={`/account/charters/${booking.id}`}
        className="group flex items-center gap-5 bg-paper p-4 transition-colors hover:bg-bone"
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-asphalt/5">
          {v?.images[0] && (
            <Image
              src={v.images[0]}
              alt={`${v.make} ${v.model}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.68rem] tracking-[0.14em] text-graphite">
              {booking.ref}
            </span>
            <StatusTag status={booking.status} />
          </div>
          <p className="mt-1 truncate font-display text-lg">
            {v ? `${v.make} ${v.model}` : "Vehicle"}
          </p>
          <p className="mt-0.5 font-mono text-[0.74rem] text-slate">
            {dateLong(booking.startDate)} → {dateLong(booking.endDate)}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-display text-xl">
            <Odometer value={booking.total} prefix="$" group />
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate">
            {booking.nights} {booking.nights === 1 ? "day" : "days"}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate transition-transform group-hover:translate-x-1 group-hover:text-asphalt" />
      </Link>
    </li>
  );
}

function Summary({
  label,
  value,
  loading,
  className,
}: {
  label: string;
  value: number;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={"bg-fog px-6 py-6 " + (className ?? "")}>
      <p className="font-display text-3xl tracking-tightish">
        {loading ? <span className="text-slate">—</span> : <Odometer value={value} />}
      </p>
      <p className="mt-1 eyebrow">{label}</p>
    </div>
  );
}
