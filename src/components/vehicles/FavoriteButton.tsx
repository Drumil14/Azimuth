"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "@/components/Icons";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/cn";

export function FavoriteButton({
  vehicleId,
  initial = false,
  variant = "icon",
  className,
  onChange,
}: {
  vehicleId: string;
  initial?: boolean;
  variant?: "icon" | "labeled";
  className?: string;
  onChange?: (next: boolean) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/sign-in?next=" + encodeURIComponent(location.pathname));
      return;
    }
    setBusy(true);
    const next = !fav;
    setFav(next);
    onChange?.(next);
    try {
      if (next) await api.addFavorite(vehicleId);
      else await api.removeFavorite(vehicleId);
    } catch {
      setFav(!next); // revert
      onChange?.(!next);
    } finally {
      setBusy(false);
    }
  }

  if (variant === "labeled") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className={cn(
          "inline-flex h-11 items-center gap-2 border px-5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors",
          fav
            ? "border-oxblood bg-oxblood/[0.06] text-oxblood"
            : "border-asphalt/30 text-asphalt hover:border-asphalt",
          className
        )}
      >
        <Heart
          className="h-4 w-4"
          fill={fav ? "currentColor" : "none"}
        />
        {fav ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "grid h-10 w-10 place-items-center bg-paper/90 backdrop-blur text-asphalt transition-colors hover:text-oxblood",
        fav && "text-oxblood",
        className
      )}
    >
      <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
