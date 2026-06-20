"use client";

import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { ChevronLeft } from "@/components/Icons";

export default function NewVehiclePage() {
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
          Add a vehicle
        </h1>
      </header>
      <VehicleForm mode="create" />
    </div>
  );
}
