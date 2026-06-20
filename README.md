# AZIMUTH

**Set your bearing.** A premium car-rental platform for a small, chartered fleet —
browse the collection, check availability, reserve a charter, manage your account,
and run the operator console. Built as an original, design-led showcase.

> **Static demo build.** This version has no backend or database. The fleet is
> baked into the app and anything you do (sign in, book, favourite, edit the
> fleet) is saved in your browser via `localStorage`. That makes it deploy to
> Vercel — or any static host — with zero configuration.

**Live demo:** _add your Vercel URL here after deploying_

---

## Stack

TypeScript · React · **Next.js (App Router)** · Tailwind CSS. No server — the
data layer in `src/lib/api.ts` reads baked-in seed data (`src/lib/seed.ts`) and
persists to `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo accounts

| Role   | Email                   | Password         |
| ------ | ----------------------- | ---------------- |
| Member | `member@azimuth.travel` | `azimuth-member` |
| Admin  | `admin@azimuth.travel`  | `azimuth-admin`  |

The admin account opens the operator console at **/admin** (analytics, fleet
management, charters, members). You can also register a new member account.

> To reset everything to the original seed data, clear the site's data in your
> browser (DevTools → Application → Local Storage → delete the `azimuth_demo_*`
> key) and reload.

---

## Deploy to Vercel

**Option A — GitHub + Vercel dashboard (recommended)**

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Vercel auto-detects Next.js — no settings to change. Click **Deploy**.
4. You get a live URL like `https://azimuth-yourname.vercel.app`. Put that on
   your resume.

**Option B — Vercel CLI**

```bash
npm i -g vercel
vercel        # follow the prompts; accept the detected Next.js defaults
vercel --prod # promote to a production URL
```

No environment variables, no database, nothing else to configure.

---

## What's inside

**For members:** sign up / sign in, browse with search + filters (category,
price, seats, transmission, powertrain) and sorting, vehicle detail pages with a
spec table and live availability, a three-step charter flow ending at a
confirmation reference, favourites, charter management with cancellation, and an
editable profile.

**For operators (admin):** an analytics overview (revenue, charters, an 8-week
trend chart, status breakdown, most-chartered vehicles, recent activity), full
fleet CRUD with image add (by URL or upload), charter status management, and
member role management.

## Notes

- Photography is from Unsplash (Unsplash License), one verified photo matched to
  each car's make and model.
- This is a front-end demonstration. A separate full-stack version exists with a
  real Express + Prisma + PostgreSQL backend; this build trades the server for a
  baked-in, browser-persisted data layer so it can be hosted statically.
- No payments are processed — a booking is complete at confirmation.
