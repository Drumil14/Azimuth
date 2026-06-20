// AZIMUTH — static demo data layer.
//
// This file replaces the networked API client from the full-stack build.
// Same method names and return shapes, so every page works unchanged — but
// data is baked in (see seed.ts) and "saving" persists to localStorage in the
// browser. No server, no database: deploys to any static host.

import type {
  AdminUser,
  Analytics,
  Booking,
  BookingStatus,
  User,
  Vehicle,
  VehicleListResponse,
} from "./types";
import { seedVehicles, seedUsers, seedFavorites, type SeedUser } from "./seed";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export type VehicleQuery = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

// ── pricing (mirrors the original API) ──────────────────────────────────────
const PRICING = { careFee: 95, deliveryFee: 250, conciergeFee: 180 };

function nightsBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function makeRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 5; i++)
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `AZ-${body}`;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ── persistence ─────────────────────────────────────────────────────────────
interface DB {
  users: SeedUser[];
  vehicles: Vehicle[];
  bookings: Booking[];
  favorites: { userId: string; vehicleId: string }[];
  sessionUserId: string | null;
}

const KEY = "azimuth_demo_v2";
const isBrowser = typeof window !== "undefined";
let memory: DB | null = null;

function daysFromNow(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function seedBookings(): Booking[] {
  const roma = seedVehicles.find((v) => v.slug === "ferrari-roma")!;
  const s580 = seedVehicles.find((v) => v.slug === "mercedes-benz-s580")!;

  const upStart = daysFromNow(14);
  const upEnd = daysFromNow(18);
  const upNights = nightsBetween(upStart, upEnd);

  const pastStart = daysFromNow(-32);
  const pastEnd = daysFromNow(-29);
  const pastNights = nightsBetween(pastStart, pastEnd);

  return [
    {
      id: "b_roma",
      ref: "AZ-RM7K2",
      userId: "u_member",
      vehicleId: roma.id,
      startDate: upStart.toISOString(),
      endDate: upEnd.toISOString(),
      pickupLocation: roma.location,
      nights: upNights,
      delivery: true,
      concierge: false,
      notes: "Anniversary weekend — please have it ready by noon.",
      dailyRate: roma.dailyRate,
      subtotal: roma.dailyRate * upNights,
      careFee: PRICING.careFee,
      addOnsFee: PRICING.deliveryFee,
      total: roma.dailyRate * upNights + PRICING.careFee + PRICING.deliveryFee,
      status: "CONFIRMED",
      createdAt: daysFromNow(-2).toISOString(),
    },
    {
      id: "b_s580",
      ref: "AZ-S58QP",
      userId: "u_member",
      vehicleId: s580.id,
      startDate: pastStart.toISOString(),
      endDate: pastEnd.toISOString(),
      pickupLocation: s580.location,
      nights: pastNights,
      delivery: false,
      concierge: true,
      notes: null,
      dailyRate: s580.dailyRate,
      subtotal: s580.dailyRate * pastNights,
      careFee: PRICING.careFee,
      addOnsFee: PRICING.conciergeFee,
      total: s580.dailyRate * pastNights + PRICING.careFee + PRICING.conciergeFee,
      status: "COMPLETED",
      createdAt: daysFromNow(-40).toISOString(),
    },
  ];
}

function freshDB(): DB {
  return {
    users: seedUsers.map((u) => ({ ...u })),
    vehicles: seedVehicles.map((v) => ({ ...v })),
    bookings: seedBookings(),
    favorites: seedFavorites.map((f) => ({ ...f })),
    sessionUserId: null,
  };
}

function load(): DB {
  if (!isBrowser) {
    if (!memory) memory = freshDB();
    return memory;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    /* fall through to seed */
  }
  const db = freshDB();
  save(db);
  return db;
}

function save(db: DB) {
  if (!isBrowser) {
    memory = db;
    return;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage full / unavailable — keep in memory for the session */
    memory = db;
  }
}

// Small artificial latency so loading states render like the real thing.
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), isBrowser ? 160 : 0)
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────
function publicUser(u: SeedUser): User {
  const { password, ...rest } = u;
  void password;
  return rest;
}

function currentUser(db: DB): SeedUser | null {
  if (!db.sessionUserId) return null;
  return db.users.find((u) => u.id === db.sessionUserId) ?? null;
}

function requireUser(db: DB): SeedUser {
  const u = currentUser(db);
  if (!u) throw new ApiError(401, "You need to sign in to do that.");
  return u;
}

function requireAdmin(db: DB): SeedUser {
  const u = requireUser(db);
  if (u.role !== "ADMIN") throw new ApiError(403, "Admins only.");
  return u;
}

function withFavorite(db: DB, v: Vehicle, userId: string | null): Vehicle {
  const isFavorite = userId
    ? db.favorites.some((f) => f.userId === userId && f.vehicleId === v.id)
    : false;
  return { ...v, isFavorite };
}

function findVehicle(db: DB, slugOrId: string): Vehicle | undefined {
  return db.vehicles.find((v) => v.slug === slugOrId || v.id === slugOrId);
}

function overlaps(db: DB, vehicleId: string, start: Date, end: Date): number {
  return db.bookings.filter(
    (b) =>
      b.vehicleId === vehicleId &&
      (b.status === "CONFIRMED" || b.status === "COMPLETED") &&
      new Date(b.startDate) < end &&
      new Date(b.endDate) > start
  ).length;
}

function sortVehicles(list: Vehicle[], sort?: string): Vehicle[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.dailyRate - b.dailyRate);
    case "price-desc":
      return out.sort((a, b) => b.dailyRate - a.dailyRate);
    case "power":
      return out.sort((a, b) => b.powerHp - a.powerHp);
    case "fastest":
      return out.sort((a, b) => a.zeroToSixty - b.zeroToSixty);
    default:
      return out.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      });
  }
}

function bookingWithVehicle(db: DB, b: Booking): Booking {
  const vehicle = db.vehicles.find((v) => v.id === b.vehicleId);
  return { ...b, vehicle };
}

// ── the API surface (matches the original client exactly) ────────────────────
export const api = {
  // auth
  register: async (body: { name: string; email: string; password: string }) => {
    const db = load();
    const email = body.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email))
      throw new ApiError(409, "That email is already registered.");
    if (body.password.length < 8)
      throw new ApiError(422, "Password must be at least 8 characters.");
    const user: SeedUser = {
      id: uid("u"),
      email,
      name: body.name.trim(),
      role: "USER",
      phone: null,
      city: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      password: body.password,
    };
    db.users.push(user);
    db.sessionUserId = user.id;
    save(db);
    return delay({ user: publicUser(user) });
  },

  login: async (body: { email: string; password: string }) => {
    const db = load();
    const email = body.email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.password !== body.password)
      throw new ApiError(401, "Invalid email or password.");
    db.sessionUserId = user.id;
    save(db);
    return delay({ user: publicUser(user) });
  },

  logout: async () => {
    const db = load();
    db.sessionUserId = null;
    save(db);
    return delay({ ok: true as const });
  },

  me: async () => {
    const db = load();
    const u = currentUser(db);
    return delay({ user: u ? publicUser(u) : (null as unknown as User) });
  },

  // profile
  updateProfile: async (
    body: Partial<Pick<User, "name" | "phone" | "city" | "avatarUrl">>
  ) => {
    const db = load();
    const u = requireUser(db);
    if (body.name !== undefined) u.name = body.name;
    if (body.phone !== undefined) u.phone = body.phone;
    if (body.city !== undefined) u.city = body.city;
    if (body.avatarUrl !== undefined) u.avatarUrl = body.avatarUrl;
    save(db);
    return delay({ user: publicUser(u) });
  },

  // vehicles
  vehicles: async (q: VehicleQuery = {}): Promise<VehicleListResponse> => {
    const db = load();
    const userId = db.sessionUserId;
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;

    let list = db.vehicles.filter((v) => {
      if (q.category && v.category !== q.category) return false;
      if (q.transmission && v.transmission !== q.transmission) return false;
      if (q.fuelType && v.fuelType !== q.fuelType) return false;
      if (q.seats && v.seats < q.seats) return false;
      if (q.featured !== undefined && v.featured !== q.featured) return false;
      if (q.minPrice && v.dailyRate < q.minPrice) return false;
      if (q.maxPrice && v.dailyRate > q.maxPrice) return false;
      if (q.q) {
        const needle = q.q.toLowerCase();
        const hay = `${v.make} ${v.model} ${v.tagline} ${v.location}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    list = sortVehicles(list, q.sort);
    const total = list.length;

    // facet counts across the whole fleet (unfiltered), like the API
    const categories = Object.entries(
      db.vehicles.reduce<Record<string, number>>((acc, v) => {
        acc[v.category] = (acc[v.category] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([category, count]) => ({
      category: category as Vehicle["category"],
      count,
    }));

    const start = (page - 1) * pageSize;
    const paged = list
      .slice(start, start + pageSize)
      .map((v) => withFavorite(db, v, userId));

    return delay({
      vehicles: paged,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      facets: { categories },
    });
  },

  vehicle: async (slug: string) => {
    const db = load();
    const v = findVehicle(db, slug);
    if (!v) throw new ApiError(404, "Vehicle not found.");
    return delay({ vehicle: withFavorite(db, v, db.sessionUserId) });
  },

  availability: async (slug: string, start: string, end: string) => {
    const db = load();
    const v = findVehicle(db, slug);
    if (!v) throw new ApiError(404, "Vehicle not found.");
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(+s) || isNaN(+e)) throw new ApiError(400, "Invalid dates.");
    if (e <= s) throw new ApiError(400, "End date must be after start date.");
    const conflicts = overlaps(db, v.id, s, e);
    return delay({
      available: v.available && conflicts === 0,
      offline: !v.available,
      conflicts,
    });
  },

  // favorites
  favorites: async () => {
    const db = load();
    const u = requireUser(db);
    const favs = db.favorites
      .filter((f) => f.userId === u.id)
      .map((f) => db.vehicles.find((v) => v.id === f.vehicleId))
      .filter((v): v is Vehicle => Boolean(v))
      .map((v) => ({ ...v, isFavorite: true }));
    return delay({ favorites: favs });
  },

  addFavorite: async (vehicleId: string) => {
    const db = load();
    const u = requireUser(db);
    if (!db.favorites.some((f) => f.userId === u.id && f.vehicleId === vehicleId))
      db.favorites.push({ userId: u.id, vehicleId });
    save(db);
    return delay({ ok: true as const, isFavorite: true });
  },

  removeFavorite: async (vehicleId: string) => {
    const db = load();
    const u = requireUser(db);
    db.favorites = db.favorites.filter(
      (f) => !(f.userId === u.id && f.vehicleId === vehicleId)
    );
    save(db);
    return delay({ ok: true as const, isFavorite: false });
  },

  // bookings
  createBooking: async (body: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    pickupLocation?: string;
    delivery?: boolean;
    concierge?: boolean;
    notes?: string;
  }) => {
    const db = load();
    const u = requireUser(db);
    const s = new Date(body.startDate);
    const e = new Date(body.endDate);
    if (isNaN(+s) || isNaN(+e)) throw new ApiError(400, "Invalid dates.");
    if (e <= s) throw new ApiError(400, "End date must be after start date.");
    if (s < new Date(new Date().toDateString()))
      throw new ApiError(400, "Start date cannot be in the past.");

    const v = db.vehicles.find((x) => x.id === body.vehicleId);
    if (!v) throw new ApiError(404, "Vehicle not found.");
    if (!v.available)
      throw new ApiError(400, "This vehicle is not currently available to charter.");
    if (overlaps(db, v.id, s, e) > 0)
      throw new ApiError(400, "Those dates are no longer available for this vehicle.");

    const nights = nightsBetween(s, e);
    const subtotal = v.dailyRate * nights;
    const addOnsFee =
      (body.delivery ? PRICING.deliveryFee : 0) +
      (body.concierge ? PRICING.conciergeFee : 0);
    const careFee = PRICING.careFee;

    const booking: Booking = {
      id: uid("b"),
      ref: makeRef(),
      userId: u.id,
      vehicleId: v.id,
      startDate: s.toISOString(),
      endDate: e.toISOString(),
      pickupLocation: body.pickupLocation?.trim() || v.location,
      nights,
      delivery: Boolean(body.delivery),
      concierge: Boolean(body.concierge),
      notes: body.notes?.trim() || null,
      dailyRate: v.dailyRate,
      subtotal,
      careFee,
      addOnsFee,
      total: subtotal + careFee + addOnsFee,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    save(db);
    return delay({ booking: bookingWithVehicle(db, booking) });
  },

  bookings: async () => {
    const db = load();
    const u = requireUser(db);
    const mine = db.bookings
      .filter((b) => b.userId === u.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((b) => bookingWithVehicle(db, b));
    return delay({ bookings: mine });
  },

  booking: async (id: string) => {
    const db = load();
    const u = requireUser(db);
    const b = db.bookings.find((x) => x.id === id);
    if (!b || (b.userId !== u.id && u.role !== "ADMIN"))
      throw new ApiError(404, "Charter not found.");
    return delay({ booking: bookingWithVehicle(db, b) });
  },

  cancelBooking: async (id: string) => {
    const db = load();
    const u = requireUser(db);
    const b = db.bookings.find((x) => x.id === id);
    if (!b || (b.userId !== u.id && u.role !== "ADMIN"))
      throw new ApiError(404, "Charter not found.");
    b.status = "CANCELLED";
    save(db);
    return delay({ booking: bookingWithVehicle(db, b) });
  },

  // admin
  analytics: async (): Promise<Analytics> => {
    const db = load();
    requireAdmin(db);
    const confirmed = db.bookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
    );
    const revenue = confirmed.reduce((s, b) => s + b.total, 0);
    const nights = confirmed.reduce((s, b) => s + b.nights, 0);

    const now = Date.now();
    const week = 7 * 86_400_000;
    const series = Array.from({ length: 8 }).map((_, i) => {
      const end = now - (7 - i) * week;
      const start = end - week;
      const count = confirmed.filter((b) => {
        const t = +new Date(b.createdAt);
        return t >= start && t < end;
      }).length;
      return { week: i + 1, count };
    });

    const byStatusMap = db.bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    }, {});

    const topVehicles = [...db.vehicles]
      .map((v) => ({
        id: v.id,
        slug: v.slug,
        name: `${v.make} ${v.model}`,
        image: v.images[0] ?? null,
        dailyRate: v.dailyRate,
        bookings: db.bookings.filter((b) => b.vehicleId === v.id).length,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const recent = [...db.bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)
      .map((b) => {
        const v = db.vehicles.find((x) => x.id === b.vehicleId);
        const m = db.users.find((x) => x.id === b.userId);
        return {
          id: b.id,
          ref: b.ref,
          status: b.status,
          total: b.total,
          startDate: b.startDate,
          endDate: b.endDate,
          member: m?.name ?? "—",
          vehicle: v ? `${v.make} ${v.model}` : "—",
        };
      });

    return delay({
      totals: {
        vehicles: db.vehicles.length,
        activeVehicles: db.vehicles.filter((v) => v.available).length,
        members: db.users.length,
        charters: db.bookings.length,
        revenue,
        nights,
      },
      byStatus: (Object.keys(byStatusMap) as BookingStatus[]).map((status) => ({
        status,
        count: byStatusMap[status],
      })),
      series,
      topVehicles,
      recent,
    });
  },

  adminBookings: async (status?: string) => {
    const db = load();
    requireAdmin(db);
    const list = db.bookings
      .filter((b) => !status || b.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((b) => {
        const m = db.users.find((x) => x.id === b.userId);
        return {
          ...bookingWithVehicle(db, b),
          memberName: m?.name ?? "—",
          memberEmail: m?.email ?? "—",
        };
      });
    return delay({ bookings: list });
  },

  adminUpdateBooking: async (id: string, status: string) => {
    const db = load();
    requireAdmin(db);
    const b = db.bookings.find((x) => x.id === id);
    if (!b) throw new ApiError(404, "Charter not found.");
    b.status = status as BookingStatus;
    save(db);
    return delay({ booking: bookingWithVehicle(db, b) });
  },

  adminUsers: async () => {
    const db = load();
    requireAdmin(db);
    const users: AdminUser[] = db.users.map((u) => ({
      ...publicUser(u),
      bookings: db.bookings.filter((b) => b.userId === u.id).length,
      favorites: db.favorites.filter((f) => f.userId === u.id).length,
    }));
    return delay({ users });
  },

  adminUpdateUserRole: async (id: string, role: string) => {
    const db = load();
    const me = requireAdmin(db);
    if (id === me.id)
      throw new ApiError(400, "You can't change your own role.");
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new ApiError(404, "Member not found.");
    u.role = role as "USER" | "ADMIN";
    save(db);
    return delay({ user: publicUser(u) });
  },

  createVehicle: async (body: Record<string, unknown>) => {
    const db = load();
    requireAdmin(db);
    const slug = String(body.slug ?? "");
    if (db.vehicles.some((v) => v.slug === slug))
      throw new ApiError(409, "A vehicle with that slug already exists.");
    const vehicle: Vehicle = {
      ...(body as unknown as Vehicle),
      id: uid("v"),
      createdAt: new Date().toISOString(),
    };
    db.vehicles.push(vehicle);
    save(db);
    return delay({ vehicle });
  },

  updateVehicle: async (id: string, body: Record<string, unknown>) => {
    const db = load();
    requireAdmin(db);
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new ApiError(404, "Vehicle not found.");
    db.vehicles[idx] = { ...db.vehicles[idx], ...(body as Partial<Vehicle>), id };
    save(db);
    return delay({ vehicle: db.vehicles[idx] });
  },

  deleteVehicle: async (id: string) => {
    const db = load();
    requireAdmin(db);
    if (db.bookings.some((b) => b.vehicleId === id))
      throw new ApiError(
        400,
        "This vehicle has charter history and can't be deleted. Mark it as resting (unavailable) instead."
      );
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    db.favorites = db.favorites.filter((f) => f.vehicleId !== id);
    save(db);
    return delay({ ok: true as const });
  },

  uploadPhoto: async (file: File) => {
    // No server in the static demo — embed the image as a data URL so it
    // still renders. (next/image renders data: URLs directly.)
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new ApiError(400, "Couldn't read that file."));
      reader.readAsDataURL(file);
    });
    return { url, filename: file.name };
  },
};
