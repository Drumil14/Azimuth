"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Booking, Vehicle } from "@/lib/types";
import { DateRange } from "@/components/booking/DateRange";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { Odometer } from "@/components/ui/Odometer";
import { Check, Pin, ChevronLeft } from "@/components/Icons";
import { coordTag, dateLong, nightsBetween } from "@/lib/format";
import { computeQuote } from "@/lib/pricing";
import { cn } from "@/lib/cn";

const STEPS = ["Itinerary", "Details", "Review"];

function BookingInner({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const { data, loading } = useAsync(() => api.vehicle(slug), [slug]);
  const vehicle = data?.vehicle;

  const [step, setStep] = useState(0);
  const [start, setStart] = useState(searchParams.get("start") ?? "");
  const [end, setEnd] = useState(searchParams.get("end") ?? "");
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [concierge, setConcierge] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  // default pickup to the vehicle's home base
  useEffect(() => {
    if (vehicle && !pickup) setPickup(vehicle.location);
  }, [vehicle, pickup]);

  // guard: must be signed in
  useEffect(() => {
    if (!authLoading && !user) {
      const next = `/booking/${slug}?start=${start}&end=${end}`;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }
  }, [authLoading, user, router, slug, start, end]);

  const nights = useMemo(
    () => (start && end ? nightsBetween(start, end) : 0),
    [start, end]
  );
  const quote = useMemo(
    () => (vehicle ? computeQuote(vehicle.dailyRate, nights, { delivery, concierge }) : null),
    [vehicle, nights, delivery, concierge]
  );

  if (loading || authLoading)
    return <div className="shell py-32 font-mono text-slate">Preparing your charter…</div>;
  if (!vehicle)
    return (
      <div className="shell py-32 text-center">
        <p className="font-display text-3xl">That vehicle isn&apos;t available.</p>
        <Button href="/collection" variant="outline" className="mt-8">
          Back to the collection
        </Button>
      </div>
    );
  if (!user) return null; // redirecting

  async function confirm() {
    if (!vehicle) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { booking } = await api.createBooking({
        vehicleId: vehicle.id,
        startDate: start,
        endDate: end,
        pickupLocation: pickup,
        delivery,
        concierge,
        notes: notes || undefined,
      });
      setConfirmed(booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : "We couldn't confirm that charter."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── confirmation screen ──
  if (confirmed) {
    return (
      <div className="shell py-20">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 text-oxblood">
            <span className="grid h-10 w-10 place-items-center border border-oxblood">
              <Check className="h-5 w-5" />
            </span>
            <span className="eyebrow text-oxblood">Charter confirmed</span>
          </div>
          <h1 className="mt-8 font-display text-display-md tracking-tighter2">
            You&apos;re set, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-prose2 text-graphite leading-relaxed">
            Your {vehicle.make} {vehicle.model} is reserved. We&apos;ve noted
            everything below — no payment is collected in this demonstration.
          </p>

          <div className="mt-10 border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="eyebrow">Reference</span>
              <span className="font-mono text-lg tracking-[0.1em]">{confirmed.ref}</span>
            </div>
            <dl className="grid gap-px bg-line sm:grid-cols-2">
              <Cell label="Vehicle" value={`${vehicle.make} ${vehicle.model}`} />
              <Cell label="Pickup" value={confirmed.pickupLocation} />
              <Cell label="Collect" value={dateLong(confirmed.startDate)} />
              <Cell label="Return" value={dateLong(confirmed.endDate)} />
            </dl>
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-base">Total (unpaid)</span>
              <span className="font-display text-2xl">
                <Odometer value={confirmed.total} prefix="$" group />
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`/account/charters/${confirmed.id}`} variant="solid">
              View this charter
            </Button>
            <Button href="/collection" variant="outline">
              Browse the fleet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canProceedItinerary = start && end && nights > 0 && pickup.trim();

  return (
    <div className="shell py-12">
      <Link
        href={`/collection/${vehicle.slug}`}
        className="inline-flex items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-graphite hover:text-asphalt"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {vehicle.model}
      </Link>

      {/* stepper */}
      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em]",
                i === step ? "text-asphalt" : i < step ? "text-oxblood" : "text-slate"
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center border text-[0.65rem]",
                  i === step
                    ? "border-asphalt"
                    : i < step
                    ? "border-oxblood text-oxblood"
                    : "border-line"
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-line sm:w-12" />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        {/* step content */}
        <div className="min-h-[360px]">
          {step === 0 && (
            <section>
              <h1 className="font-display text-display-md tracking-tighter2">
                Your itinerary
              </h1>
              <p className="mt-3 max-w-prose2 text-graphite">
                Confirm when you&apos;d like the car and where you&apos;d like to
                begin. Dates can still change later.
              </p>
              <div className="mt-8 max-w-lg">
                <DateRange start={start} end={end} onStart={setStart} onEnd={setEnd} />
                <div className="mt-5">
                  <Field label="Pickup location">
                    <Input
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="City or address"
                    />
                  </Field>
                  <p className="mt-2 font-mono text-[0.7rem] tracking-[0.1em] text-slate">
                    Home base — {vehicle.location} · {coordTag(vehicle.lat, vehicle.lng)}
                  </p>
                </div>
              </div>
              <Button
                className="mt-10"
                size="lg"
                disabled={!canProceedItinerary}
                onClick={() => setStep(1)}
              >
                Continue
              </Button>
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="font-display text-display-md tracking-tighter2">
                The details
              </h1>
              <p className="mt-3 max-w-prose2 text-graphite">
                Optional touches that make the handover effortless.
              </p>
              <div className="mt-8 max-w-lg space-y-4">
                <AddOn
                  active={delivery}
                  onToggle={() => setDelivery((v) => !v)}
                  title="Delivery & collection"
                  price="$250"
                  body="We bring the car to your door and collect it when you're done."
                />
                <AddOn
                  active={concierge}
                  onToggle={() => setConcierge((v) => !v)}
                  title="Concierge service"
                  price="$180"
                  body="A dedicated point of contact for the length of your charter."
                />
                <Field label="Notes for the team">
                  <Textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Flight numbers, preferred handover time, anything else…"
                  />
                </Field>
              </div>
              <div className="mt-10 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)}>
                  Review charter
                </Button>
              </div>
            </section>
          )}

          {step === 2 && quote && (
            <section>
              <h1 className="font-display text-display-md tracking-tighter2">
                Review &amp; confirm
              </h1>
              <p className="mt-3 max-w-prose2 text-graphite">
                One last look. Confirming reserves the car — no charge is taken in
                this demo.
              </p>

              <dl className="mt-8 max-w-lg divide-y divide-line border-y border-line">
                <ReviewRow label="Vehicle" value={`${vehicle.make} ${vehicle.model}`} />
                <ReviewRow label="Collect" value={dateLong(start)} />
                <ReviewRow label="Return" value={dateLong(end)} />
                <ReviewRow label="Pickup" value={pickup} />
                <ReviewRow
                  label="Add-ons"
                  value={
                    [delivery && "Delivery", concierge && "Concierge"]
                      .filter(Boolean)
                      .join(", ") || "None"
                  }
                />
                {notes && <ReviewRow label="Notes" value={notes} />}
              </dl>

              {errorMsg && (
                <p className="mt-6 border border-oxblood/40 bg-oxblood/[0.05] px-4 py-3 font-mono text-[0.78rem] text-oxblood">
                  {errorMsg}
                </p>
              )}

              <div className="mt-10 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  variant="oxblood"
                  loading={submitting}
                  onClick={confirm}
                >
                  Confirm charter
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* order summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-paper">
            <div className="relative aspect-[16/10] overflow-hidden bg-asphalt/5">
              {vehicle.images[0] && (
                <Image
                  src={vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  sizes="40vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-6">
              <p className="font-mono text-[0.66rem] tracking-[0.14em] text-graphite">
                {vehicle.year} · {vehicle.location}
              </p>
              <h2 className="mt-1 font-display text-xl">
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="mt-4 flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-graphite">
                <Pin className="h-3.5 w-3.5" />
                {start && end ? `${dateLong(start)} → ${dateLong(end)}` : "Dates not set"}
              </div>
              <div className="mt-6 border-t border-line pt-6">
                {quote && (
                  <PriceSummary
                    quote={quote}
                    delivery={delivery}
                    concierge={concierge}
                  />
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AddOn({
  active,
  onToggle,
  title,
  price,
  body,
}: {
  active: boolean;
  onToggle: () => void;
  title: string;
  price: string;
  body: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-4 border p-5 text-left transition-colors",
        active ? "border-oxblood bg-oxblood/[0.04]" : "border-line hover:border-asphalt/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border",
          active ? "border-oxblood bg-oxblood text-bone" : "border-slate"
        )}
      >
        {active && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between">
          <span className="font-display text-base">{title}</span>
          <span className="font-mono text-sm">{price}</span>
        </span>
        <span className="mt-1 block text-[0.9rem] text-graphite">{body}</span>
      </span>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-3">
      <dt className="eyebrow shrink-0 pt-0.5">{label}</dt>
      <dd className="text-right text-[0.98rem] text-asphalt">{value}</dd>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-fog px-6 py-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate">
        {label}
      </p>
      <p className="mt-1 text-[1rem] text-asphalt">{value}</p>
    </div>
  );
}

export default function BookingPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="shell py-32 font-mono text-slate">Loading…</div>}>
      <BookingInner slug={params.slug} />
    </Suspense>
  );
}
