"use client";

import type { VehicleCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/format";
import { Input, Select, FieldLabel } from "@/components/ui";
import { Search } from "@/components/Icons";
import { cn } from "@/lib/cn";

export interface FilterState {
  q: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  seats: string;
  transmission: string;
  fuelType: string;
  sort: string;
}

export const EMPTY_FILTERS: FilterState = {
  q: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  seats: "",
  transmission: "",
  fuelType: "",
  sort: "recommended",
};

const CATEGORY_ORDER: VehicleCategory[] = [
  "SPORT",
  "GRAND_TOURER",
  "ROADSTER",
  "SALOON",
  "ELECTRIC",
  "TERRAIN",
];

export function Filters({
  filters,
  facets,
  total,
  onChange,
  onClear,
}: {
  filters: FilterState;
  facets: { category: VehicleCategory; count: number }[];
  total: number;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
}) {
  const countFor = (c: VehicleCategory) =>
    facets.find((f) => f.category === c)?.count ?? 0;
  const allCount = facets.reduce((s, f) => s + f.count, 0);

  const hasActive =
    filters.q ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.seats ||
    filters.transmission ||
    filters.fuelType;

  return (
    <div className="flex flex-col gap-9">
      {/* search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search make, model, city…"
          className="pl-11"
          aria-label="Search the fleet"
        />
      </div>

      {/* category index */}
      <div>
        <FieldLabel>Category</FieldLabel>
        <ul className="mt-1 border-t border-line">
          <CatRow
            active={!filters.category}
            label="Everything"
            count={allCount}
            onClick={() => onChange({ category: "" })}
          />
          {CATEGORY_ORDER.filter((c) => countFor(c) > 0).map((c) => (
            <CatRow
              key={c}
              active={filters.category === c}
              label={CATEGORY_LABELS[c]}
              count={countFor(c)}
              onClick={() => onChange({ category: c })}
            />
          ))}
        </ul>
      </div>

      {/* daily rate */}
      <div>
        <FieldLabel>Daily rate (USD)</FieldLabel>
        <div className="mt-1 flex items-center gap-3">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="h-11"
          />
          <span className="font-mono text-slate">—</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <FieldLabel>Seats</FieldLabel>
          <SelectWrap>
            <Select
              value={filters.seats}
              onChange={(e) => onChange({ seats: e.target.value })}
            >
              <option value="">Any</option>
              <option value="2">2 or more</option>
              <option value="4">4 or more</option>
              <option value="5">5 or more</option>
            </Select>
          </SelectWrap>
        </div>
        <div>
          <FieldLabel>Transmission</FieldLabel>
          <SelectWrap>
            <Select
              value={filters.transmission}
              onChange={(e) => onChange({ transmission: e.target.value })}
            >
              <option value="">Any</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="DUAL_CLUTCH">Dual-clutch</option>
              <option value="MANUAL">Manual</option>
              <option value="SINGLE_SPEED">Single-speed</option>
            </Select>
          </SelectWrap>
        </div>
        <div>
          <FieldLabel>Powertrain</FieldLabel>
          <SelectWrap>
            <Select
              value={filters.fuelType}
              onChange={(e) => onChange({ fuelType: e.target.value })}
            >
              <option value="">Any</option>
              <option value="PETROL">Petrol</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </SelectWrap>
        </div>
      </div>

      {hasActive && (
        <button
          onClick={onClear}
          className="self-start font-mono text-[0.7rem] uppercase tracking-[0.14em] text-oxblood hover:underline"
        >
          Clear all ({total})
        </button>
      )}
    </div>
  );
}

function CatRow({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between border-b border-line py-2.5 text-left transition-colors",
          active ? "text-oxblood" : "text-asphalt hover:text-graphite"
        )}
      >
        <span className={cn("text-[0.95rem]", active && "font-medium")}>
          {label}
        </span>
        <span className="font-mono text-[0.7rem] text-slate tnum">
          {String(count).padStart(2, "0")}
        </span>
      </button>
    </li>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-1">
      {children}
      <svg
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
