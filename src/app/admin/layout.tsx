"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { Compass, Calendar, User as UserIcon, ArrowUpRight } from "@/components/Icons";

const NAV = [
  { href: "/admin", label: "Overview", exact: true, icon: Compass },
  { href: "/admin/fleet", label: "Fleet", exact: false, icon: Compass },
  { href: "/admin/charters", label: "Charters", exact: false, icon: Calendar },
  { href: "/admin/members", label: "Members", exact: false, icon: UserIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/sign-in?next=/admin");
    else if (!isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin)
    return (
      <div className="grid min-h-screen place-items-center bg-asphalt font-mono text-sm text-slate">
        Verifying operator access…
      </div>
    );

  return (
    <div className="min-h-screen bg-fog lg:grid lg:grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className="flex flex-col gap-8 bg-asphalt p-6 text-bone lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between">
          <Logo className="text-bone" />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-oxblood">
            Console
          </span>
        </div>

        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap px-3 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-bone/[0.08] text-bone"
                    : "text-slate hover:text-bone"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-3 border-t border-line-dark pt-6 lg:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-slate hover:text-bone"
          >
            View site <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="text-left font-mono text-[0.7rem] uppercase tracking-[0.14em] text-slate hover:text-oxblood"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* content */}
      <main className="p-6 md:p-10 lg:p-12">{children}</main>
    </div>
  );
}
