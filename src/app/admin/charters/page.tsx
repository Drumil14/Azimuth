"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import { dateShort, usd, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function AdminChartersPage() {
  const [filter, setFilter] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load(status: string) {
    setBookings(null);
    const res = await api.adminBookings(status || undefined);
    setBookings(res.bookings);
  }
  useEffect(() => {
    load(filter);
  }, [filter]);

  async function update(id: string, status: BookingStatus) {
    setSavingId(id);
    try {
      await api.adminUpdateBooking(id, status);
      setBookings((cur) =>
        cur ? cur.map((b) => (b.id === id ? { ...b, status } : b)) : cur
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Operator console</span>
        <h1 className="mt-3 font-display text-display-md tracking-tighter2">Charters</h1>
      </header>

      {/* filter tabs */}
      <div className="mb-6 flex gap-2">
        {FILTERS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors",
              filter === t.key
                ? "bg-asphalt text-bone"
                : "border border-line text-graphite hover:border-asphalt"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="border border-line bg-paper">
        <div className="hidden grid-cols-[110px_1fr_1fr_160px_110px_150px] gap-4 border-b border-line px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate lg:grid">
          <span>Ref</span>
          <span>Member</span>
          <span>Vehicle</span>
          <span>Dates</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {bookings === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-paper" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="px-5 py-10 text-center font-mono text-sm text-slate">
            No charters in this view.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-[110px_1fr_1fr_160px_110px_150px] lg:items-center"
              >
                <span className="font-mono text-[0.74rem] text-graphite">{b.ref}</span>
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem]">{b.memberName}</p>
                  <p className="truncate font-mono text-[0.66rem] text-slate">
                    {b.memberEmail}
                  </p>
                </div>
                <span className="truncate text-[0.9rem]">
                  {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : "—"}
                </span>
                <span className="font-mono text-[0.74rem] text-graphite">
                  {dateShort(b.startDate)} → {dateShort(b.endDate)}
                </span>
                <span className="font-mono text-[0.82rem] tnum">{usd(b.total)}</span>
                <div className="relative">
                  <select
                    value={b.status}
                    disabled={savingId === b.id}
                    onChange={(e) => update(b.id, e.target.value as BookingStatus)}
                    className="w-full appearance-none border border-line bg-fog px-3 py-2 pr-8 font-mono text-[0.72rem] uppercase tracking-[0.1em] focus:border-asphalt focus:outline-none"
                  >
                    {(["CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
