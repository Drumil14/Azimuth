"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { Compass } from "@/components/Icons";

function SignInInner() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* brand side */}
      <div className="relative hidden flex-col justify-between bg-asphalt p-12 text-bone lg:flex">
        <Logo size="lg" className="text-bone" />
        <div>
          <Compass className="h-6 w-6 text-oxblood" />
          <p className="mt-6 max-w-md font-display text-3xl leading-tight">
            &ldquo;The best journeys begin the moment you decide where you&apos;re
            pointing.&rdquo;
          </p>
          <p className="mt-6 font-mono text-[0.7rem] tracking-[0.16em] text-slate">
            AZIMUTH — MEMBER ACCESS
          </p>
        </div>
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-slate">
          40.71°N 74.01°W
        </p>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="lg" />
          </div>
          <p className="eyebrow mt-8 lg:mt-0">Welcome back</p>
          <h1 className="mt-3 font-display text-display-md tracking-tighter2">
            Sign in
          </h1>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="border border-oxblood/40 bg-oxblood/[0.05] px-4 py-3 font-mono text-[0.78rem] text-oxblood">
                {error}
              </p>
            )}

            <Button type="submit" block size="lg" loading={busy}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-sm text-graphite">
            New to AZIMUTH?{" "}
            <Link href="/sign-up" className="link-underline text-asphalt">
              Become a member
            </Link>
          </p>

          <div className="mt-10 border-t border-line pt-6">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate">
              Demo accounts
            </p>
            <div className="mt-3 space-y-1 font-mono text-[0.78rem] text-graphite">
              <p>member@azimuth.travel · azimuth-member</p>
              <p>admin@azimuth.travel · azimuth-admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="shell py-32 font-mono text-slate">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
