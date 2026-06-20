"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { ChevronLeft } from "@/components/Icons";

export default function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const { data, loading, error } = useAsync(() => api.vehicle(params.id), [params.id]);

  return (
    <div>
      <Link
        href="/admin/fleet"
        className="inline-flex items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-graphite hover:text-asphalt"
      >
        <ChevronLeft className="h-4 w-4" /> Fleet
      </Link>
      <header className="mb-10 mt-6">
        <span className="eyebrow">Operator console</span>
        <h1 className="mt-3 font-display text-display-md tracking-tighter2">
          {data?.vehicle ? `${data.vehicle.make} ${data.vehicle.model}` : "Edit vehicle"}
        </h1>
      </header>

      {loading ? (
        <p className="font-mono text-slate">Loading…</p>
      ) : error || !data ? (
        <p className="font-mono text-oxblood">Couldn&apos;t load that vehicle.</p>
      ) : (
        <VehicleForm mode="edit" initial={data.vehicle} />
      )}
    </div>
  );
}
