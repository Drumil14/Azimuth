import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { journeys } from "@/lib/journeys";
import { Reveal, Button } from "@/components/ui";
import { ArrowUpRight, Compass } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "Three routes we keep coming back to, each paired with the machine that earns its keep on it.",
};

export default function JourneysPage() {
  return (
    <div className="pb-24">
      {/* masthead */}
      <header className="shell pt-12 pb-16">
        <div className="flex items-center gap-4">
          <Compass className="h-5 w-5 text-oxblood" />
          <span className="eyebrow">Journeys</span>
        </div>
        <h1 className="mt-6 max-w-[14ch] font-display text-display-lg tracking-tighter2">
          The road is the point.
        </h1>
        <p className="mt-6 max-w-prose2 text-[1.15rem] leading-relaxed text-graphite">
          We don&apos;t just hand over keys — we hand over an idea of where to
          take them. Three routes we love, each matched to the car that suits its
          rhythm. Borrow them outright or use them as a starting line.
        </p>
      </header>

      {/* journeys */}
      <div className="space-y-0">
        {journeys.map((j, i) => (
          <section
            key={j.slug}
            id={j.slug}
            className="scroll-mt-24 border-t border-line"
          >
            <div className="shell grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              <Reveal className={i % 2 ? "lg:order-2" : ""}>
                <div className="relative aspect-[4/3] overflow-hidden bg-asphalt/5">
                  <Image
                    src={j.image}
                    alt={j.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 bg-paper/90 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                    {j.bearing}
                  </span>
                </div>
              </Reveal>

              <div className="flex flex-col justify-center">
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-graphite">
                  {String(i + 1).padStart(2, "0")} — {j.region}
                </p>
                <h2 className="mt-4 font-display text-display-md tracking-tighter2">
                  {j.title}
                </h2>
                <p className="mt-5 max-w-prose2 leading-relaxed text-graphite">
                  {j.blurb}
                </p>

                {/* route instrument strip */}
                <dl className="mt-8 grid grid-cols-3 border-y border-line">
                  <RouteStat label="Route" value={`${j.from} → ${j.to}`} wide />
                  <RouteStat label="Distance" value={j.distance} />
                  <RouteStat label="Drive" value={j.driveTime} />
                </dl>

                {/* notes */}
                <ul className="mt-8 space-y-2">
                  {j.notes.map((n, k) => (
                    <li
                      key={n}
                      className="flex items-baseline gap-3 text-[0.98rem] text-asphalt/90"
                    >
                      <span className="font-mono text-[0.7rem] text-oxblood">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      {n}
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Button href={`/collection/${j.vehicleSlug}`} variant="outline">
                    Charter the {j.vehicleName}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* close */}
      <section className="shell pt-20 text-center">
        <p className="mx-auto max-w-[24ch] font-display text-display-md">
          Have a route of your own in mind?
        </p>
        <Button href="/collection" size="lg" variant="oxblood" className="mt-8">
          Choose your car
        </Button>
      </section>
    </div>
  );
}

function RouteStat({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-1 py-4 pr-4" : "py-4 pl-4 text-right"}>
      <p className="font-mono text-[0.95rem] text-asphalt">{value}</p>
      <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate">
        {label}
      </p>
    </div>
  );
}
