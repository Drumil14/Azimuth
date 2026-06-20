"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Analytics } from "@/lib/types";
import { Odometer } from "@/components/ui/Odometer";
import { usd, dateShort, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function AdminOverview() {
  const { data, loading } = useAsync(() => api.analytics(), []);

  return (
    <div>
      <header className="mb-10">
        <span className="eyebrow">Operator console</span>
        <h1 className="mt-3 font-display text-display-md tracking-tighter2">
          Overview
        </h1>
      </header>

      {loading || !data ? (
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-paper" />
          ))}
        </div>
      ) : (
        <Dashboard data={data} />
      )}
    </div>
  );
}

function Dashboard({ data }: { data: Analytics }) {
  const { totals } = data;
  return (
    <div className="space-y-10">
      {/* headline figures */}
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <Figure label="Confirmed revenue" prefix="$" value={totals.revenue} group />
        <Figure label="Charters" value={totals.charters} />
        <Figure label="Vehicles" value={totals.vehicles} sub={`${totals.activeVehicles} active`} />
        <Figure label="Members" value={totals.members} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* bookings chart */}
        <section className="border border-line bg-paper p-7">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Charters · last 8 weeks</h2>
            <span className="font-mono text-[0.68rem] text-slate">
              {data.series.reduce((s, w) => s + w.count, 0)} total
            </span>
          </div>
          <BarChart series={data.series} />
        </section>

        {/* status breakdown */}
        <section className="border border-line bg-paper p-7">
          <h2 className="eyebrow">By status</h2>
          <ul className="mt-6 space-y-4">
            {(["CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => {
              const found = data.byStatus.find((x) => x.status === s);
              const count = found?.count ?? 0;
              const max = Math.max(1, ...data.byStatus.map((x) => x.count));
              return (
                <li key={s}>
                  <div className="flex items-center justify-between font-mono text-[0.78rem]">
                    <span className="text-graphite">{STATUS_LABELS[s]}</span>
                    <span className="tnum text-asphalt">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-line">
                    <div
                      className={cn(
                        "h-full",
                        s === "CONFIRMED"
                          ? "bg-oxblood"
                          : s === "COMPLETED"
                          ? "bg-asphalt"
                          : "bg-slate"
                      )}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* top vehicles */}
        <section className="border border-line bg-paper p-7">
          <h2 className="eyebrow">Most chartered</h2>
          <ul className="mt-5 divide-y divide-line">
            {data.topVehicles.map((v, i) => (
              <li key={v.id} className="flex items-center gap-4 py-3">
                <span className="font-mono text-[0.7rem] text-slate">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/collection/${v.slug}`}
                  className="flex-1 truncate text-[0.95rem] hover:text-oxblood"
                >
                  {v.name}
                </Link>
                <span className="font-mono text-[0.78rem] text-graphite">
                  {usd(v.dailyRate)}/d
                </span>
                <span className="w-10 text-right font-mono text-[0.85rem] tnum">
                  {v.bookings}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* recent */}
        <section className="border border-line bg-paper p-7">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Recent charters</h2>
            <Link
              href="/admin/charters"
              className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-oxblood hover:underline"
            >
              All
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {data.recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className="font-mono text-[0.7rem] text-graphite">{r.ref}</span>
                <span className="min-w-0 flex-1 truncate text-[0.9rem]">
                  {r.vehicle}
                </span>
                <span className="hidden font-mono text-[0.72rem] text-slate sm:inline">
                  {dateShort(r.startDate)}
                </span>
                <span className="font-mono text-[0.82rem] tnum">{usd(r.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function BarChart({ series }: { series: { week: number; count: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const W = 520;
  const H = 180;
  const gap = 14;
  const barW = (W - gap * (series.length - 1)) / series.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 28}`}
      className="mt-6 w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Charters per week"
    >
      {series.map((s, i) => {
        const h = (s.count / max) * H;
        const x = i * (barW + gap);
        const isLast = i === series.length - 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - h}
              width={barW}
              height={Math.max(h, 2)}
              className={isLast ? "fill-oxblood" : "fill-asphalt"}
            />
            <text
              x={x + barW / 2}
              y={H + 18}
              textAnchor="middle"
              className="fill-slate"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
            >
              W{s.week}
            </text>
            {s.count > 0 && (
              <text
                x={x + barW / 2}
                y={H - h - 6}
                textAnchor="middle"
                className="fill-graphite"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
              >
                {s.count}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Figure({
  label,
  value,
  prefix,
  group,
  sub,
}: {
  label: string;
  value: number;
  prefix?: string;
  group?: boolean;
  sub?: string;
}) {
  return (
    <div className="bg-paper px-6 py-7">
      <p className="font-display text-3xl tracking-tightish md:text-4xl">
        <Odometer value={value} prefix={prefix} group={group} />
      </p>
      <p className="mt-2 eyebrow">{label}</p>
      {sub && <p className="mt-1 font-mono text-[0.68rem] text-slate">{sub}</p>}
    </div>
  );
}
