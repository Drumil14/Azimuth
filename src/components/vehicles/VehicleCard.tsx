"use client";

import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { CATEGORY_SHORT, usd } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import { Odometer } from "@/components/ui/Odometer";
import { cn } from "@/lib/cn";

export function VehicleCard({
  vehicle,
  index,
  size = "default",
}: {
  vehicle: Vehicle;
  index?: number;
  size?: "default" | "feature";
}) {
  const reg = `AZ·${String(index ?? 0).padStart(3, "0")}`;

  return (
    <Link
      href={`/collection/${vehicle.slug}`}
      className="group block"
    >
      <article className="flex flex-col">
        {/* registration line */}
        <div className="flex items-center justify-between pb-3">
          <span className="font-mono text-[0.68rem] tracking-[0.16em] text-graphite">
            {index !== undefined ? reg : CATEGORY_SHORT[vehicle.category]}
          </span>
          <span className="font-mono text-[0.68rem] tracking-[0.16em] text-graphite">
            {vehicle.location}
          </span>
        </div>

        {/* cinematic image */}
        <div
          className={cn(
            "relative overflow-hidden bg-asphalt/5",
            size === "feature" ? "aspect-[16/10]" : "aspect-[4/3]"
          )}
        >
          <Image
            src={vehicle.images[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover transition-transform duration-[1.2s] ease-instrument group-hover:scale-[1.04]"
          />
          {!vehicle.available && (
            <span className="absolute left-3 top-3 bg-asphalt/85 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bone">
              Reserved
            </span>
          )}
          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <FavoriteButton vehicleId={vehicle.id} initial={vehicle.isFavorite} />
          </div>
        </div>

        {/* meta */}
        <div className="flex items-start justify-between gap-4 pt-5">
          <div>
            <h3 className="font-display text-xl leading-tight tracking-tightish">
              <span className="link-underline">{vehicle.make} {vehicle.model}</span>
            </h3>
            <p className="mt-1 text-graphite text-[0.95rem]">{vehicle.tagline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-[0.95rem] text-asphalt tnum">
              <Odometer value={vehicle.dailyRate} prefix="$" group />
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate">
              / day
            </p>
          </div>
        </div>

        {/* instrument strip */}
        <dl className="mt-4 grid grid-cols-3 border-t border-line pt-3 text-center">
          <Spec label="Power" value={`${vehicle.powerHp} hp`} />
          <Spec
            label="0–60"
            value={`${vehicle.zeroToSixty.toFixed(1)}s`}
            divider
          />
          <Spec label="Top" value={`${vehicle.topSpeed}`} />
        </dl>
      </article>
    </Link>
  );
}

function Spec({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div className={cn(divider && "border-x border-line")}>
      <dd className="font-mono text-[0.85rem] text-asphalt tnum">{value}</dd>
      <dt className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate mt-0.5">
        {label}
      </dt>
    </div>
  );
}
