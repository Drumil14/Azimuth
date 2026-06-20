"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { VehicleListResponse } from "@/lib/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Filters, EMPTY_FILTERS, type FilterState } from "@/components/vehicles/Filters";
import { Select } from "@/components/ui";
import { Compass } from "@/components/Icons";

function CollectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo<FilterState>(
    () => ({
      ...EMPTY_FILTERS,
      q: searchParams.get("q") ?? "",
      category: searchParams.get("category") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      seats: searchParams.get("seats") ?? "",
      transmission: searchParams.get("transmission") ?? "",
      fuelType: searchParams.get("fuelType") ?? "",
      sort: searchParams.get("sort") ?? "recommended",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [filters, setFilters] = useState<FilterState>(initial);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<VehicleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync filters → URL (shallow) so links and refreshes are stable.
  useEffect(() => {
    const sp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && !(k === "sort" && v === "recommended")) sp.set(k, v);
    });
    const qs = sp.toString();
    router.replace(qs ? `/collection?${qs}` : "/collection", { scroll: false });
  }, [filters, router]);

  // Fetch (debounced for the text query).
  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => {
        api
          .vehicles({
            q: filters.q || undefined,
            category: filters.category || undefined,
            minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
            seats: filters.seats ? Number(filters.seats) : undefined,
            transmission: filters.transmission || undefined,
            fuelType: filters.fuelType || undefined,
            sort: filters.sort,
            page,
            pageSize: 9,
          })
          .then((res) => setData(res))
          .catch(() => setData(null))
          .finally(() => setLoading(false));
      },
      filters.q ? 280 : 0
    );
    return () => clearTimeout(debounceRef.current);
  }, [filters, page]);

  const patch = (p: Partial<FilterState>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...p }));
  };
  const clear = () => {
    setPage(1);
    setFilters({ ...EMPTY_FILTERS });
  };

  const vehicles = data?.vehicles ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;

  return (
    <div className="shell pt-12 pb-24">
      {/* page masthead */}
      <header className="border-b border-line pb-10">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.7rem] text-oxblood tracking-[0.1em]">
            01 /
          </span>
          <span className="eyebrow">The Collection</span>
        </div>
        <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="font-display text-display-md max-w-[16ch]">
            Every car we keep, in one place.
          </h1>
          <p className="max-w-sm text-graphite leading-relaxed">
            Filter by character, not just price. Each vehicle is delivered to you
            and collected when you&apos;re done.
          </p>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[260px_1fr]">
        {/* filter rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {data && (
            <Filters
              filters={filters}
              facets={data.facets.categories}
              total={total}
              onChange={patch}
              onClear={clear}
            />
          )}
        </aside>

        {/* results */}
        <div>
          <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
            <p className="font-mono text-[0.72rem] tracking-[0.12em] text-graphite tnum">
              {loading ? "SCANNING…" : `${total} VEHICLE${total === 1 ? "" : "S"}`}
            </p>
            <label className="flex items-center gap-3">
              <span className="eyebrow hidden sm:inline">Sort</span>
              <div className="relative">
                <Select
                  value={filters.sort}
                  onChange={(e) => patch({ sort: e.target.value })}
                  className="h-10 w-48 pr-9 text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Rate · low to high</option>
                  <option value="price-desc">Rate · high to low</option>
                  <option value="power">Most powerful</option>
                  <option value="fastest">Quickest 0–60</option>
                </Select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </label>
          </div>

          {loading ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-asphalt/5" />
                  <div className="mt-5 h-5 w-2/3 bg-asphalt/5" />
                  <div className="mt-2 h-4 w-1/2 bg-asphalt/5" />
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <Compass className="h-8 w-8 text-slate" />
              <p className="font-display text-2xl">No vehicles match that.</p>
              <p className="max-w-sm text-graphite">
                Try widening your filters — the fleet is small but varied.
              </p>
              <button
                onClick={clear}
                className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-oxblood hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  index={(page - 1) * 9 + i + 1}
                />
              ))}
            </div>
          )}

          {/* pagination */}
          {pageCount > 1 && !loading && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={
                    "h-10 w-10 font-mono text-sm tnum transition-colors " +
                    (page === i + 1
                      ? "bg-asphalt text-bone"
                      : "border border-line text-asphalt hover:border-asphalt")
                  }
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="shell py-24 font-mono text-slate">Loading…</div>}>
      <CollectionInner />
    </Suspense>
  );
}
