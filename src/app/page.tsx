"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Button, Reveal, SectionHeader, Tag, Hairline } from "@/components/ui";
import { Odometer } from "@/components/ui/Odometer";
import { ArrowRight, ArrowUpRight, Compass } from "@/components/Icons";
import { journeys } from "@/lib/journeys";
import { coordTag, usd } from "@/lib/format";

export default function HomePage() {
  const { data, loading } = useAsync(
    () => api.vehicles({ pageSize: 48, sort: "recommended" }),
    []
  );

  const vehicles = data?.vehicles ?? [];
  const featured = vehicles.filter((v) => v.featured);
  const hero = featured[0] ?? vehicles[0];

  const stats = {
    count: data?.total ?? 0,
    cities: new Set(vehicles.map((v) => v.location)).size,
    quickest: vehicles.length
      ? Math.min(...vehicles.map((v) => v.zeroToSixty))
      : 0,
    power: vehicles.reduce((s, v) => s + v.powerHp, 0),
  };

  return (
    <>
      {/* ── 01 · Opening ─────────────────────────────────────────────── */}
      <section className="shell pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="eyebrow animate-fade-up">
              Chartered drives · Six cities · By appointment
            </p>
            <h1 className="mt-6 font-display text-display-xl font-extrabold tracking-tighter2 animate-fade-up">
              Set your
              <br />
              bearing<span className="text-oxblood">.</span>
            </h1>
            <p className="mt-8 max-w-prose2 text-[1.15rem] leading-relaxed text-graphite animate-fade-up">
              AZIMUTH keeps a small fleet of exceptional cars — the kind you plan
              a trip around. No counters, no queues. Choose your machine, name
              your dates, and we deliver it to the road that deserves it.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up">
              <Button href="/collection" size="lg" variant="solid">
                Browse the fleet
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                href="/journeys"
                className="link-underline inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em]"
              >
                See the journeys
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* featured plate */}
          <div className="lg:col-span-5">
            {hero ? (
              <Reveal className="group">
                <Link href={`/collection/${hero.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-asphalt/5">
                    <Image
                      src={hero.images[0]}
                      alt={`${hero.make} ${hero.model}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-[1.4s] ease-instrument group-hover:scale-[1.05]"
                    />
                    <div className="absolute left-4 top-4">
                      <Tag tone="oxblood">In the spotlight</Tag>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <div>
                      <p className="font-mono text-[0.66rem] tracking-[0.14em] text-graphite">
                        AZ·001 — {coordTag(hero.lat, hero.lng)}
                      </p>
                      <p className="mt-1 font-display text-lg">
                        {hero.make} {hero.model}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-asphalt">
                      <Odometer value={hero.dailyRate} prefix="$" group />
                      <span className="text-slate"> /day</span>
                    </p>
                  </div>
                </Link>
              </Reveal>
            ) : (
              <div className="aspect-[4/5] animate-pulse bg-asphalt/5" />
            )}
          </div>
        </div>

        {/* instrument bar */}
        <div className="mt-16 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <Stat label="In the fleet" value={stats.count} loading={loading} />
          <Stat label="Cities served" value={stats.cities} loading={loading} />
          <Stat
            label="Quickest 0–60"
            value={stats.quickest}
            decimals={1}
            suffix="s"
            loading={loading}
          />
          <Stat
            label="Combined output"
            value={stats.power}
            suffix=" hp"
            group
            loading={loading}
          />
        </div>
      </section>

      {/* ── 02 · The Fleet ───────────────────────────────────────────── */}
      <section className="shell py-16 md:py-24">
        <SectionHeader
          index="02 /"
          label="The Collection"
          title="Twelve machines, chosen with care."
          intro="We don't stock a lot. We stock the right things — each one kept to a standard, photographed honestly, and ready for a road that suits it."
          action={
            <Button href="/collection" variant="outline" size="sm">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />

        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : vehicles.slice(0, 6).map((v, i) => (
                <Reveal key={v.id} delay={(i % 3) * 80}>
                  <VehicleCard vehicle={v} index={i + 1} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* ── 03 · Journeys ────────────────────────────────────────────── */}
      <section className="bg-bone">
        <div className="shell py-20 md:py-28">
          <SectionHeader
            index="03 /"
            label="Journeys"
            title="A car is only half the story."
            intro="Three routes we keep coming back to, each paired with the machine that earns its keep on it. Borrow the route, or just borrow the idea."
          />

          <div className="mt-14 space-y-px bg-line">
            {journeys.map((j, i) => (
              <Reveal key={j.slug}>
                <Link
                  href={`/journeys#${j.slug}`}
                  className="group grid items-stretch gap-0 bg-bone md:grid-cols-[1fr_1.1fr]"
                >
                  <div
                    className={`relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[300px] ${
                      i % 2 ? "md:order-2" : ""
                    }`}
                  >
                    <Image
                      src={j.image}
                      alt={j.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover transition-transform duration-[1.4s] ease-instrument group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
                    <p className="font-mono text-[0.68rem] tracking-[0.16em] text-graphite">
                      {String(i + 1).padStart(2, "0")} — {j.region}
                    </p>
                    <h3 className="font-display text-display-md">{j.title}</h3>
                    <p className="max-w-prose2 text-graphite leading-relaxed">
                      {j.blurb}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.72rem] tracking-[0.1em] text-asphalt">
                      <span>{j.from} → {j.to}</span>
                      <span className="text-slate">{j.distance}</span>
                      <span className="text-slate">{j.bearing}</span>
                    </div>
                    <span className="link-underline mt-2 inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.08em]">
                      In a {j.vehicleName} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · Manifesto ───────────────────────────────────────────── */}
      <section className="bg-asphalt text-bone">
        <div className="shell py-24 md:py-32">
          <div className="flex items-center gap-4">
            <Compass className="h-5 w-5 text-oxblood" />
            <span className="eyebrow text-slate">04 / The idea</span>
          </div>
          <p className="mt-10 max-w-4xl font-display text-display-lg leading-[1.05]">
            We think renting a car should feel less like a transaction and more
            like being handed the keys by a friend with very good taste.
          </p>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <Principle
              n="i"
              title="Curation over inventory"
              body="A short list, kept impeccably, beats an endless lot of compromises. Every car here is one we'd drive ourselves."
            />
            <Principle
              n="ii"
              title="Delivered, not collected"
              body="No fluorescent counters. We bring the car to your hotel, your home, or the trailhead — and collect it when you're done."
            />
            <Principle
              n="iii"
              title="Quiet confidence"
              body="The best service is the kind you barely notice. Clear pricing, honest photography, and no surprises at the desk."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="shell py-24 text-center">
        <Reveal>
          <p className="eyebrow">Membership</p>
          <h2 className="mx-auto mt-6 max-w-[20ch] font-display text-display-lg">
            The first drive is the hardest to forget.
          </h2>
          <div className="mt-10 flex justify-center gap-4">
            <Button href="/sign-up" size="lg" variant="oxblood">
              Become a member
            </Button>
            <Button href="/collection" size="lg" variant="outline">
              Just browse
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  decimals,
  suffix,
  group,
  loading,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  group?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="bg-fog px-6 py-7">
      <p className="font-display text-3xl md:text-4xl tracking-tightish">
        {loading ? (
          <span className="text-slate">—</span>
        ) : (
          <Odometer value={value} decimals={decimals} suffix={suffix} group={group} />
        )}
      </p>
      <p className="mt-2 eyebrow">{label}</p>
    </div>
  );
}

function Principle({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t border-line-dark pt-6">
      <span className="font-mono text-oxblood text-sm">{n}.</span>
      <h3 className="mt-3 font-display text-xl text-bone">{title}</h3>
      <p className="mt-3 text-slate leading-relaxed text-[0.95rem]">{body}</p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-asphalt/5" />
      <div className="mt-5 h-5 w-2/3 bg-asphalt/5" />
      <div className="mt-2 h-4 w-1/2 bg-asphalt/5" />
    </div>
  );
}
