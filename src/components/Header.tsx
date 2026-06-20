"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/features/auth/AuthProvider";
import { Heart, Menu, Close, User as UserIcon } from "./Icons";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/collection", label: "The Fleet" },
  { href: "/journeys", label: "Journeys" },
];

function LiveBearing() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden lg:inline font-mono text-[0.7rem] tracking-[0.14em] text-slate tnum">
      {time} · BEARING 047°
    </span>
  );
}

export function Header() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // The header is hidden inside the admin console (it has its own chrome).
  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-fog/90 backdrop-blur-md border-b border-line" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-underline text-sm tracking-wide",
                  pathname.startsWith(item.href) ? "text-asphalt" : "text-graphite"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <LiveBearing />
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="hidden sm:inline-flex text-graphite hover:text-oxblood transition-colors"
          >
            <Heart className="h-5 w-5" />
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex font-mono text-[0.7rem] uppercase tracking-[0.16em] text-graphite hover:text-asphalt"
            >
              Console
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm hover:text-oxblood transition-colors"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex font-mono text-[0.7rem] uppercase tracking-[0.16em] border border-asphalt/30 hover:border-asphalt px-4 py-2 transition-colors"
            >
              Sign in
            </Link>
          )}
          <button
            className="md:hidden text-asphalt"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <Menu className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* mobile panel */}
      {open && (
        <div className="md:hidden border-t border-line bg-fog">
          <div className="shell py-6 flex flex-col gap-5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="font-display text-2xl">
                {item.label}
              </Link>
            ))}
            <Link href="/favorites" className="font-display text-2xl">
              Favorites
            </Link>
            {user ? (
              <Link href="/account" className="font-display text-2xl">
                Account
              </Link>
            ) : (
              <Link href="/sign-in" className="font-display text-2xl">
                Sign in
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="font-display text-2xl text-oxblood">
                Operator console
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
