"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button, Field, Input } from "@/components/ui";
import { Check } from "@/components/Icons";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const { user: updated } = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl tracking-tightish">Your details</h2>
      <p className="mt-2 text-graphite">
        Used to make handovers smooth. Your email is your sign-in and can&apos;t be
        changed here.
      </p>

      <form onSubmit={save} className="mt-8 space-y-5">
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input value={user.email} disabled className="opacity-60" />
        </Field>
        <Field label="Phone">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Home city">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Optional"
          />
        </Field>

        {error && (
          <p className="border border-oxblood/40 bg-oxblood/[0.05] px-4 py-3 font-mono text-[0.78rem] text-oxblood">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-oxblood">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
