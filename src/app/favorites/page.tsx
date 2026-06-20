"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Button } from "@/components/ui";
import { Heart } from "@/components/Icons";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .favorites()
      .then((res) => setVehicles(res.favorites))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <div className="shell pt-12 pb-24">
      <header className="border-b border-line pb-8">
        <div className="flex items-center gap-4">
          <Heart className="h-5 w-5 text-oxblood" fill="currentColor" />
          <span className="eyebrow">Saved</span>
        </div>
        <h1 className="mt-5 font-display text-display-md tracking-tighter2">
          Your shortlist.
        </h1>
      </header>

      {loading || authLoading ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-asphalt/5" />
              <div className="mt-5 h-5 w-2/3 bg-asphalt/5" />
            </div>
          ))}
        </div>
      ) : !user ? (
        <Empty
          title="Sign in to save vehicles"
          body="Keep a shortlist of the cars you're considering — it follows you across devices."
          cta={<Button href="/sign-in?next=/favorites" variant="solid">Sign in</Button>}
        />
      ) : vehicles && vehicles.length > 0 ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i + 1} />
          ))}
        </div>
      ) : (
        <Empty
          title="Nothing saved yet"
          body="Tap the heart on any vehicle to keep it here for later."
          cta={<Button href="/collection" variant="solid">Browse the fleet</Button>}
        />
      )}
    </div>
  );
}

function Empty({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-28 text-center">
      <Heart className="h-8 w-8 text-slate" />
      <p className="font-display text-2xl">{title}</p>
      <p className="max-w-sm text-graphite">{body}</p>
      <div className="mt-2">{cta}</div>
    </div>
  );
}
