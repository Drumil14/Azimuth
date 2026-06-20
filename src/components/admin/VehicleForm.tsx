"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Vehicle, VehicleCategory } from "@/lib/types";
import { Button, Field, Input, Select, Textarea, FieldLabel } from "@/components/ui";
import { Plus, Trash, Check } from "@/components/Icons";

const CATEGORIES: VehicleCategory[] = [
  "SPORT",
  "GRAND_TOURER",
  "ROADSTER",
  "SALOON",
  "ELECTRIC",
  "TERRAIN",
];

type Mode = "create" | "edit";

export function VehicleForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: Vehicle;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    make: initial?.make ?? "",
    model: initial?.model ?? "",
    year: String(initial?.year ?? new Date().getFullYear()),
    category: initial?.category ?? "SPORT",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    dailyRate: String(initial?.dailyRate ?? ""),
    seats: String(initial?.seats ?? "2"),
    doors: String(initial?.doors ?? "2"),
    transmission: initial?.transmission ?? "AUTOMATIC",
    drivetrain: initial?.drivetrain ?? "RWD",
    fuelType: initial?.fuelType ?? "PETROL",
    powerHp: String(initial?.powerHp ?? ""),
    zeroToSixty: String(initial?.zeroToSixty ?? ""),
    topSpeed: String(initial?.topSpeed ?? ""),
    rangeOrTank: initial?.rangeOrTank ?? "",
    engine: initial?.engine ?? "",
    color: initial?.color ?? "",
    location: initial?.location ?? "",
    lat: String(initial?.lat ?? ""),
    lng: String(initial?.lng ?? ""),
    available: initial?.available ?? true,
    featured: initial?.featured ?? false,
  });
  const [featuresText, setFeaturesText] = useState(
    (initial?.features ?? []).join("\n")
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadPhoto(file);
      setImages((cur) => [...cur, url]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((cur) => [...cur, url]);
    setImageUrl("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      slug: f.slug.trim(),
      make: f.make.trim(),
      model: f.model.trim(),
      year: Number(f.year),
      category: f.category,
      tagline: f.tagline.trim(),
      description: f.description.trim(),
      dailyRate: Number(f.dailyRate),
      seats: Number(f.seats),
      doors: Number(f.doors),
      transmission: f.transmission,
      drivetrain: f.drivetrain,
      fuelType: f.fuelType,
      powerHp: Number(f.powerHp),
      zeroToSixty: Number(f.zeroToSixty),
      topSpeed: Number(f.topSpeed),
      rangeOrTank: f.rangeOrTank.trim(),
      engine: f.engine.trim(),
      color: f.color.trim(),
      location: f.location.trim(),
      lat: Number(f.lat),
      lng: Number(f.lng),
      available: f.available,
      featured: f.featured,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      images,
    };

    try {
      if (mode === "create") await api.createVehicle(payload);
      else if (initial) await api.updateVehicle(initial.id, payload);
      router.push("/admin/fleet");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.message}${
              err.details ? " — check the highlighted fields." : ""
            }`
          : "Couldn't save the vehicle."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-12">
      {error && (
        <p className="border border-oxblood/40 bg-oxblood/[0.05] px-4 py-3 font-mono text-[0.78rem] text-oxblood">
          {error}
        </p>
      )}

      {/* identity */}
      <Section title="Identity">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Make"><Input value={f.make} onChange={set("make")} required /></Field>
          <Field label="Model"><Input value={f.model} onChange={set("model")} required /></Field>
          <Field label="Slug" hint="lowercase-with-dashes, unique">
            <Input value={f.slug} onChange={set("slug")} required pattern="[a-z0-9-]+" />
          </Field>
          <Field label="Year"><Input type="number" value={f.year} onChange={set("year")} required /></Field>
          <Field label="Category">
            <Select value={f.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Finish / colour"><Input value={f.color} onChange={set("color")} required /></Field>
        </div>
        <Field label="Tagline">
          <Input value={f.tagline} onChange={set("tagline")} required maxLength={90} />
        </Field>
        <Field label="Description">
          <Textarea rows={5} value={f.description} onChange={set("description")} required />
        </Field>
      </Section>

      {/* performance */}
      <Section title="Performance & spec">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Power (hp)"><Input type="number" value={f.powerHp} onChange={set("powerHp")} required /></Field>
          <Field label="0–60 (s)"><Input type="number" step="0.1" value={f.zeroToSixty} onChange={set("zeroToSixty")} required /></Field>
          <Field label="Top speed (mph)"><Input type="number" value={f.topSpeed} onChange={set("topSpeed")} required /></Field>
          <Field label="Seats"><Input type="number" value={f.seats} onChange={set("seats")} required /></Field>
          <Field label="Doors"><Input type="number" value={f.doors} onChange={set("doors")} required /></Field>
          <Field label="Range / tank"><Input value={f.rangeOrTank} onChange={set("rangeOrTank")} required /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Transmission">
            <Select value={f.transmission} onChange={set("transmission")}>
              {["AUTOMATIC", "DUAL_CLUTCH", "MANUAL", "SINGLE_SPEED"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Field label="Drivetrain">
            <Select value={f.drivetrain} onChange={set("drivetrain")}>
              {["RWD", "AWD", "FWD"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Field label="Power source">
            <Select value={f.fuelType} onChange={set("fuelType")}>
              {["PETROL", "ELECTRIC", "HYBRID", "DIESEL"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Engine"><Input value={f.engine} onChange={set("engine")} required /></Field>
      </Section>

      {/* commercial + location */}
      <Section title="Charter & location">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Daily rate (USD)"><Input type="number" value={f.dailyRate} onChange={set("dailyRate")} required /></Field>
          <Field label="Latitude"><Input type="number" step="any" value={f.lat} onChange={set("lat")} required /></Field>
          <Field label="Longitude"><Input type="number" step="any" value={f.lng} onChange={set("lng")} required /></Field>
        </div>
        <Field label="Home base (city)"><Input value={f.location} onChange={set("location")} required /></Field>
        <div className="flex flex-wrap gap-6">
          <Toggle
            label="Available to charter"
            checked={f.available}
            onChange={(v) => setF((s) => ({ ...s, available: v }))}
          />
          <Toggle
            label="Featured on homepage"
            checked={f.featured}
            onChange={(v) => setF((s) => ({ ...s, featured: v }))}
          />
        </div>
      </Section>

      {/* features */}
      <Section title="Fitted with">
        <Field label="Features" hint="One per line.">
          <Textarea
            rows={6}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"Carbon-ceramic brakes\nHeated seats\nApple CarPlay"}
          />
        </Field>
      </Section>

      {/* images */}
      <Section title="Photography">
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((src, i) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden bg-asphalt/5">
                <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((cur) => cur.filter((_, k) => k !== i))}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-asphalt/80 text-bone opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash className="h-4 w-4" />
                </button>
                {i === 0 && (
                  <span className="absolute left-2 top-2 bg-oxblood px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-bone">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste an image URL"
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              Upload photo
            </Button>
          </div>
        </div>
        <p className="font-mono text-[0.7rem] text-slate">
          The first image is used as the cover. Uploads are stored locally by the API.
        </p>
      </Section>

      <div className="flex items-center gap-4 border-t border-line pt-8">
        <Button type="submit" size="lg" variant="oxblood" loading={busy}>
          <Check className="h-4 w-4" />
          {mode === "create" ? "Add to fleet" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" href="/admin/fleet">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="eyebrow border-b border-line pb-3">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span
        className={
          "grid h-5 w-5 place-items-center border " +
          (checked ? "border-oxblood bg-oxblood text-bone" : "border-slate")
        }
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="text-[0.95rem]">{label}</span>
    </button>
  );
}
