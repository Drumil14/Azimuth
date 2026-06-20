"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 bg-asphalt text-bone">
      <div className="shell py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo size="lg" className="text-bone" />
            <p className="mt-6 text-slate leading-relaxed text-[0.95rem]">
              A small, chartered fleet for people who treat the drive as the
              destination. Booked by appointment, delivered with intent.
            </p>
            <p className="mt-8 font-mono text-[0.7rem] tracking-[0.16em] text-slate">
              EST. 2025 — DELIVERED IN 6 CITIES
            </p>
          </div>

          <FooterCol
            title="Fleet"
            links={[
              { href: "/collection", label: "The collection" },
              { href: "/collection?category=GRAND_TOURER", label: "Grand tourers" },
              { href: "/collection?category=ELECTRIC", label: "Electric line" },
              { href: "/collection?category=ROADSTER", label: "Open air" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { href: "/account", label: "Your charters" },
              { href: "/favorites", label: "Saved vehicles" },
              { href: "/account/profile", label: "Profile" },
              { href: "/sign-in", label: "Sign in" },
            ]}
          />
          <FooterCol
            title="Studio"
            links={[
              { href: "/journeys", label: "Journeys" },
              { href: "/collection", label: "How it works" },
              { href: "/sign-up", label: "Become a member" },
            ]}
          />
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line-dark pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-slate">
            © {year} AZIMUTH MOTORWORKS — A DEMONSTRATION PRODUCT
          </p>
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-slate">
            40.71°N 74.01°W
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow text-slate mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-[0.95rem] text-bone/80 hover:text-bone link-underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
