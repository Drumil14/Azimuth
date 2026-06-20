"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui";
import { CATEGORY_SHORT, usd } from "@/lib/format";
import { Plus, Trash } from "@/components/Icons";

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await api.vehicles({ pageSize: 48, sort: "recommended" });
    setVehicles(res.vehicles);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(v: Vehicle) {
    if (!confirm(`Remove ${v.make} ${v.model} from the fleet?`)) return;
    setMsg(null);
    try {
      await api.deleteVehicle(v.id);
      setVehicles((cur) => (cur ? cur.filter((x) => x.id !== v.id) : cur));
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Couldn't remove that vehicle.");
    }
  }

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <span className="eyebrow">Operator console</span>
          <h1 className="mt-3 font-display text-display-md tracking-tighter2">Fleet</h1>
        </div>
        <Button href="/admin/fleet/new" variant="solid" size="sm">
          <Plus className="h-4 w-4" /> Add vehicle
        </Button>
      </header>

      {msg && (
        <p className="mb-4 border border-oxblood/40 bg-oxblood/[0.05] px-4 py-3 font-mono text-[0.78rem] text-oxblood">
          {msg}
        </p>
      )}

      <div className="border border-line bg-paper">
        {/* head */}
        <div className="hidden grid-cols-[80px_1fr_140px_120px_120px_80px] gap-4 border-b border-line px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate md:grid">
          <span />
          <span>Vehicle</span>
          <span>Category</span>
          <span>Rate</span>
          <span>Status</span>
          <span className="text-right">Edit</span>
        </div>

        {vehicles === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-paper" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-4 px-5 py-3 md:grid-cols-[80px_1fr_140px_120px_120px_80px]"
              >
                <div className="relative h-14 w-16 overflow-hidden bg-asphalt/5">
                  {v.images[0] && (
                    <Image src={v.images[0]} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base">
                    {v.make} {v.model}
                  </p>
                  <p className="font-mono text-[0.7rem] text-slate">{v.slug}</p>
                </div>
                <span className="hidden font-mono text-[0.78rem] text-graphite md:block">
                  {CATEGORY_SHORT[v.category]}
                </span>
                <span className="hidden font-mono text-[0.82rem] tnum md:block">
                  {usd(v.dailyRate)}
                </span>
                <span className="hidden md:block">
                  <span
                    className={
                      "font-mono text-[0.68rem] uppercase tracking-[0.12em] " +
                      (v.available ? "text-oxblood" : "text-slate")
                    }
                  >
                    {v.available ? "● Available" : "○ Resting"}
                    {v.featured ? " · Featured" : ""}
                  </span>
                </span>
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/fleet/${v.id}`}
                    className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-asphalt hover:text-oxblood"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(v)}
                    aria-label="Remove"
                    className="text-slate hover:text-oxblood"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
