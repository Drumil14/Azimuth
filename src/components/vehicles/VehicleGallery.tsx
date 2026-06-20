"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function VehicleGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const safe = images.length ? images : [""];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[16/10] overflow-hidden bg-asphalt/5">
        {safe[active] && (
          <Image
            src={safe[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        )}
        <span className="absolute left-4 top-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone mix-blend-difference">
          {String(active + 1).padStart(2, "0")} / {String(safe.length).padStart(2, "0")}
        </span>
      </div>

      {safe.length > 1 && (
        <div className="grid grid-cols-3 gap-4">
          {safe.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden bg-asphalt/5 transition-opacity",
                active === i ? "opacity-100" : "opacity-50 hover:opacity-80"
              )}
              aria-label={`View image ${i + 1}`}
            >
              {src && (
                <Image
                  src={src}
                  alt={`${alt} — view ${i + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              )}
              {active === i && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-oxblood" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
