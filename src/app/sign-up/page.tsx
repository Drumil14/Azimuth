"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { Compass } from "@/components/Icons";

function SignUpInner() {
  const { register } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(name, email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 lg:order-1">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="lg" />
          </div>
          <p className="eyebrow mt-8 lg:mt-0">Membership</p>
          <h1 className="mt-3 font-display text-display-md tracking-tighter2">
            Create your account
          </h1>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Full name">
              <Input
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
              />
            </Field>
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
            <Field label="Password" hint="At least 8 characters.">
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
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

            <Button type="submit" block size="lg" variant="oxblood" loading={busy}>
              Create account
            </Button>
          </form>

          <p className="mt-8 text-sm text-graphite">
            Already a member?{" "}
            <Link href="/sign-in" className="link-underline text-asphalt">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* brand side */}
      <div className="relative hidden flex-col justify-between bg-asphalt p-12 text-bone lg:flex">
        <div className="flex justify-end">
          <Logo size="lg" className="text-bone" />
        </div>
        <div>
          <Compass className="h-6 w-6 text-oxblood" />
          <p className="mt-6 max-w-md font-display text-3xl leading-tight">
            A short list of exceptional cars, delivered to the roads that deserve
            them.
          </p>
          <p className="mt-6 font-mono text-[0.7rem] tracking-[0.16em] text-slate">
            NO COUNTERS · NO QUEUES · BY APPOINTMENT
          </p>
        </div>
        <p className="text-right font-mono text-[0.68rem] tracking-[0.14em] text-slate">
          EST. 2025
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="shell py-32 font-mono text-slate">Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}
