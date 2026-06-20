"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/account", label: "Charters", exact: true },
  { href: "/account/profile", label: "Profile", exact: false },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in?next=/account");
  }, [loading, user, router]);

  if (loading)
    return <div className="shell py-32 font-mono text-slate">Loading your account…</div>;
  if (!user) return null;

  return (
    <div className="shell pt-12 pb-24">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <span className="eyebrow">Member since {new Date(user.createdAt).getFullYear()}</span>
          <h1 className="mt-4 font-display text-display-md tracking-tighter2">
            {user.name}
          </h1>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="self-start font-mono text-[0.72rem] uppercase tracking-[0.14em] text-graphite hover:text-oxblood md:self-auto"
        >
          Sign out
        </button>
      </header>

      <nav className="mt-6 flex gap-8 border-b border-line">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "-mb-px border-b-2 pb-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors",
                active
                  ? "border-oxblood text-asphalt"
                  : "border-transparent text-slate hover:text-asphalt"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10">{children}</div>
    </div>
  );
}
