"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthProvider";
import type { AdminUser } from "@/lib/types";
import { dateShort } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function AdminMembersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    const res = await api.adminUsers();
    setUsers(res.users);
  }
  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, role: "USER" | "ADMIN") {
    setSavingId(id);
    try {
      await api.adminUpdateUserRole(id, role);
      setUsers((cur) => (cur ? cur.map((u) => (u.id === id ? { ...u, role } : u)) : cur));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Operator console</span>
        <h1 className="mt-3 font-display text-display-md tracking-tighter2">Members</h1>
      </header>

      <div className="border border-line bg-paper">
        <div className="hidden grid-cols-[1fr_1fr_90px_90px_120px_140px] gap-4 border-b border-line px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate md:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Charters</span>
          <span>Saved</span>
          <span>Joined</span>
          <span>Role</span>
        </div>

        {users === null ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-paper" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {users.map((u) => {
              const isMe = u.id === me?.id;
              return (
                <li
                  key={u.id}
                  className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_90px_90px_120px_140px] md:items-center"
                >
                  <span className="truncate text-[0.92rem]">
                    {u.name}
                    {isMe && <span className="ml-2 font-mono text-[0.6rem] text-oxblood">YOU</span>}
                  </span>
                  <span className="truncate font-mono text-[0.74rem] text-graphite">
                    {u.email}
                  </span>
                  <span className="font-mono text-[0.82rem] tnum">{u.bookings}</span>
                  <span className="font-mono text-[0.82rem] tnum">{u.favorites}</span>
                  <span className="font-mono text-[0.74rem] text-slate">
                    {dateShort(u.createdAt)}
                  </span>
                  <div>
                    {isMe ? (
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-slate">
                        Admin
                      </span>
                    ) : (
                      <div className="inline-flex border border-line">
                        {(["USER", "ADMIN"] as const).map((r) => (
                          <button
                            key={r}
                            disabled={savingId === u.id}
                            onClick={() => setRole(u.id, r)}
                            className={cn(
                              "px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] transition-colors",
                              u.role === r
                                ? "bg-asphalt text-bone"
                                : "text-graphite hover:bg-asphalt/[0.05]"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
