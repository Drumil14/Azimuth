"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Vehicle } from "@/lib/types";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { DateRange } from "@/components/booking/DateRange";
import { Button, Reveal } from "@/components/ui";
import { Odometer } from "@/components/ui/Odometer";
import { ChevronLeft, Check, Pin } from "@/components/Icons";
import {
  CATEGORY_SHORT,
  DRIVETRAIN_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  coordTag,
  nightsBetween,
} from "@/lib/format";
import { computeQuote } from "@/lib/pricing";

export default function VehicleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { data, loading, error } = useAsync(
    () => api.vehicle(params.slug),
    [params.slug]
  );
  const vehicle = data?.vehicle;

  if (loading) return <DetailSkeleton />;
  if (error || !vehicle)
    return (
      <div className="shell py-32 text-center">
        <p className="font-display text-3xl">We couldn&apos;t find that car.</p>
        <Button href="/collection" variant="outline" className="mt-8">
          Back to the collection
        </Button>
      </div>
    );

  return (
    <article className="shell pt-8 pb-24">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-graphite hover:text-asphalt"
      >
        <ChevronLeft className="h-4 w-4" /> The collection
      </Link>

      {/* masthead */}
      <header className="mt-8 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.72rem] tracking-[0.14em] text-graphite">
          <span className="text-oxblood">{CATEGORY_SHORT[vehicle.category]}</span>
          <span>·</span>
          <span>{vehicle.year}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Pin className="h-3.5 w-3.5" /> {vehicle.location} · {coordTag(vehicle.lat, vehicle.lng)}
          </span>
        </div>
        <h1 className="mt-4 font-display text-display-md tracking-tighter2">
          {vehicle.make} {vehicle.model}
        </h1>
        <p className="mt-3 max-w-prose2 text-[1.1rem] text-graphite">
          {vehicle.tagline}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* left — gallery + specs + features */}
        <div>
          <VehicleGallery
            images={vehicle.images}
            alt={`${vehicle.make} ${vehicle.model}`}
          />

          {/* spec instrument table */}
          <section className="mt-14">
            <h2 className="eyebrow mb-5">Instrumentation</h2>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
              <SpecCell label="Power" value={vehicle.powerHp} suffix=" hp" />
              <SpecCell label="0–60 mph" value={vehicle.zeroToSixty} decimals={1} suffix="s" />
              <SpecCell label="Top speed" value={vehicle.topSpeed} suffix=" mph" />
              <SpecCell label="Seats" value={vehicle.seats} />
              <SpecCell label="Doors" value={vehicle.doors} />
              <SpecText label="Drivetrain" value={vehicle.drivetrain} />
              <SpecText label="Gearbox" value={TRANSMISSION_LABELS[vehicle.transmission]} />
              <SpecText label="Power source" value={FUEL_LABELS[vehicle.fuelType]} />
              <SpecText label="Range / tank" value={vehicle.rangeOrTank} />
            </div>
            <dl className="mt-px grid gap-px bg-line sm:grid-cols-2">
              <SpecText label="Engine" value={vehicle.engine} wide />
              <SpecText label="Finish" value={vehicle.color} wide />
            </dl>
          </section>

          {/* description */}
          <section className="mt-14 max-w-prose2">
            <h2 className="eyebrow mb-5">The brief</h2>
            <p className="whitespace-pre-line text-[1.05rem] leading-relaxed text-asphalt/90">
              {vehicle.description}
            </p>
          </section>

          {/* features */}
          {vehicle.features.length > 0 && (
            <section className="mt-14">
              <h2 className="eyebrow mb-5">Fitted with</h2>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-asphalt/90">
                    <Check className="h-4 w-4 shrink-0 text-oxblood" />
                    <span className="text-[0.98rem]">{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* right — charter panel */}
        <CharterPanel
          vehicle={vehicle}
          onContinue={(start, end) =>
            router.push(
              `/booking/${vehicle.slug}?start=${start}&end=${end}`
            )
          }
        />
      </div>

      {/* related */}
      <RelatedVehicles vehicle={vehicle} />
    </article>
  );
}

function CharterPanel({
  vehicle,
  onContinue,
}: {
  vehicle: Vehicle;
  onContinue: (start: string, end: string) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "unavailable" | "offline"
  >("idle");

  const nights = start && end ? nightsBetween(start, end) : 0;
  const quote = computeQuote(vehicle.dailyRate, nights);

  useEffect(() => {
    if (!start || !end) {
      setStatus("idle");
      return;
    }
    let active = true;
    setStatus("checking");
    api
      .availability(vehicle.slug, start, end)
      .then((res) => {
        if (!active) return;
        setStatus(res.offline ? "offline" : res.available ? "available" : "unavailable");
      })
      .catch(() => active && setStatus("idle"));
    return () => {
      active = false;
    };
  }, [start, end, vehicle.slug]);

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="border border-line bg-paper p-7">
        <div className="flex items-end justify-between border-b border-line pb-5">
          <div>
            <p className="eyebrow">From</p>
            <p className="mt-1 font-display text-3xl tracking-tightish">
              <Odometer value={vehicle.dailyRate} prefix="$" group />
              <span className="text-base text-slate"> / day</span>
            </p>
          </div>
          <FavoriteButton vehicleId={vehicle.id} initial={vehicle.isFavorite} />
        </div>

        <div className="mt-6">
          <DateRange start={start} end={end} onStart={setStart} onEnd={setEnd} />
        </div>

        {/* availability + price */}
        <div className="mt-5 min-h-[1.5rem]">
          {status === "checking" && (
            <p className="font-mono text-[0.72rem] tracking-[0.1em] text-slate">
              Checking the calendar…
            </p>
          )}
          {status === "available" && (
            <p className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-oxblood">
              <Check className="h-4 w-4" /> Available for these dates
            </p>
          )}
          {status === "unavailable" && (
            <p className="font-mono text-[0.72rem] tracking-[0.1em] text-oxblood">
              Already chartered for part of that window.
            </p>
          )}
          {status === "offline" && (
            <p className="font-mono text-[0.72rem] tracking-[0.1em] text-slate">
              This car is resting — not currently bookable.
            </p>
          )}
        </div>

        {nights > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 font-mono text-sm">
            <span className="text-graphite">
              {vehicle.dailyRate.toLocaleString()} × {nights}{" "}
              {nights === 1 ? "day" : "days"}
            </span>
            <span className="font-display text-xl">
              <Odometer value={quote.total} prefix="$" group />
            </span>
          </div>
        )}

        <Button
          block
          size="lg"
          variant="oxblood"
          className="mt-6"
          disabled={status !== "available"}
          onClick={() => onContinue(start, end)}
        >
          Continue to charter
        </Button>
        <p className="mt-4 text-center text-[0.72rem] leading-relaxed text-slate">
          Delivery, collection and concierge options are arranged at the next step.
        </p>
      </div>
    </aside>
  );
}

function RelatedVehicles({ vehicle }: { vehicle: Vehicle }) {
  const { data } = useAsync(
    () => api.vehicles({ category: vehicle.category, pageSize: 4 }),
    [vehicle.category]
  );
  const others = (data?.vehicles ?? []).filter((v) => v.id !== vehicle.id).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section className="mt-24 border-t border-line pt-14">
      <h2 className="font-display text-display-md mb-10">In the same spirit</h2>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((v, i) => (
          <Reveal key={v.id} delay={i * 80}>
            <VehicleCard vehicle={v} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SpecCell({
  label,
  value,
  decimals,
  suffix,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <div className="bg-fog px-5 py-5">
      <p className="font-display text-2xl tracking-tightish">
        <Odometer value={value} decimals={decimals} suffix={suffix} group />
      </p>
      <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate">
        {label}
      </p>
    </div>
  );
}

function SpecText({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-fog px-5 py-5 ${wide ? "" : ""}`}>
      <p className="text-[1.05rem] text-asphalt">{value}</p>
      <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate">
        {label}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="shell py-16">
      <div className="h-4 w-40 animate-pulse bg-asphalt/5" />
      <div className="mt-8 h-12 w-2/3 animate-pulse bg-asphalt/5" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="aspect-[16/10] animate-pulse bg-asphalt/5" />
        <div className="h-96 animate-pulse bg-asphalt/5" />
      </div>
    </div>
  );
}
