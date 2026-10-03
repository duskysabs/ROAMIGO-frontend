# Tour Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/tour-packages` feature end-to-end (catalog → detail → booking → confirmation) against static mock data, so it's demoable without any backend dependency.

**Architecture:** A `lib/tour-packages/` data/validation layer (mirroring `lib/bookings/`) feeds three new routes under `app/tour-packages/` sharing one layout, plus two new components under `components/tour-packages/` that reuse existing design-system primitives (`components/ui/`) and existing booking-flow subcomponents (`TripDateTimeRow`, `PassengerCounter`) rather than rebuilding them.

**Tech Stack:** Next.js 16 App Router (server components by default, `"use client"` only for the booking form), TypeScript, Tailwind v4 semantic tokens from `app/globals.css`.

**Spec:** `docs/superpowers/specs/2026-10-04-tour-packages-design.md`

## Global Constraints

- Frontend-only. No network calls anywhere in this feature — no new API routes, no `fetch`, no backend dependency.
- No new image assets. Only these three, already in the repo, may be used:
  - `/images/home/custom-trip-mantayupan-falls.jpg`
  - `/images/home/tour-package-cebu-coast-enhanced.png`
  - `/images/home/tour-package-seaside-pool.jpg`
- Booking submit is client-side only: on confirm, transition to a confirmation view in local component state. No network call, no persistence (not even `localStorage`).
- The booking form lives on its own route, `/tour-packages/[slug]/book` — not inline on the detail page.
- No auth gating on any route in this feature (consistent with `/plan-a-trip`).
- No nav changes — `config/site.ts` already links to `/tour-packages` in two places.
- **No test runner is configured in this repo** (`package.json` has no `jest`/`vitest`/`playwright`). Every task's testable deliverable is verified with tools already available in the repo:
  - `npx tsc --noEmit` for type correctness.
  - `node --experimental-strip-types --input-type=module -e '...'` for running real assertions against pure logic (`lib/tour-packages/*`) — Node 24 strips TypeScript types natively, so this executes the actual source, not a reimplementation.
  - `curl` against the running dev server (`npm run dev`) for page-level checks.
  - A manual browser click-through checklist for the final task.
- Reuse, don't duplicate: `formatCurrency` and `formatBookingDateTime` come from `@/lib/bookings/display`; date/time and passenger-count inputs come from `@/components/bookings/TripDateTimeRow` and `@/components/bookings/PassengerCounter`; shared chrome comes from `@/components/ui/button` and `@/components/ui/page-header`.
- Follow `docs/FRONTEND_DESIGN.md`: semantic color tokens only (`border-danger`, `bg-danger-surface`, `text-danger` — never raw `red-800`), `rounded-2xl` for content cards, `rounded-xl` for fields/alerts, `rounded-lg` for controls.

---

### Task 1: Data and validation layer

**Files:**
- Create: `lib/tour-packages/types.ts`
- Create: `lib/tour-packages/data.ts`
- Create: `lib/tour-packages/validation.ts`

**Interfaces:**
- Consumes: nothing (base layer).
- Produces (for later tasks):
  - `type TourPackage = { slug, title, shortDescription, description, heroImage: { path, alt }, itinerary: string[], inclusions: string[], duration, pricePerPerson, maxPassengers }`
  - `type TourPackageBookingDraft = { startDatetime: string, passengerCount: number | null }`
  - `type TourPackageBookingErrors = Record<string, string>`
  - `type TourPackageBookingStep = "details" | "review" | "confirmation"`
  - `createEmptyBookingDraft(): TourPackageBookingDraft`
  - `tourPackages: TourPackage[]` (exactly 3 entries)
  - `getTourPackage(slug: string): TourPackage | undefined`
  - `validateTourPackageBooking(draft: TourPackageBookingDraft, pkg: TourPackage, now?: number): TourPackageBookingErrors`

- [ ] **Step 1: Create `lib/tour-packages/types.ts`**

```ts
export type TourPackage = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  heroImage: { path: string; alt: string };
  itinerary: string[];
  inclusions: string[];
  duration: string;
  pricePerPerson: number;
  maxPassengers: number;
};

export type TourPackageBookingDraft = {
  startDatetime: string;
  passengerCount: number | null;
};

export type TourPackageBookingErrors = Record<string, string>;
export type TourPackageBookingStep = "details" | "review" | "confirmation";

export function createEmptyBookingDraft(): TourPackageBookingDraft {
  return { startDatetime: "", passengerCount: 1 };
}
```

- [ ] **Step 2: Create `lib/tour-packages/data.ts`**

```ts
import type { TourPackage } from "./types";

export const tourPackages: TourPackage[] = [
  {
    slug: "south-cebu-waterfalls-canyoneering",
    title: "South Cebu Waterfalls & Canyoneering",
    shortDescription:
      "Chase turquoise waterfalls and canyoneer through Kawasan's famous cliffs and cascades.",
    description:
      "Head south to Badian for a full day among Cebu's most photographed waterfalls. A certified canyoneering guide leads you through a series of cliff jumps, rope slides, and swims down Kawasan's turquoise river, ending at the three-tier main falls.",
    heroImage: {
      path: "/images/home/custom-trip-mantayupan-falls.jpg",
      alt: "Turquoise waterfall in Cebu's southern mountains",
    },
    itinerary: [
      "5:00 AM — Pickup from your accommodation",
      "8:00 AM — Arrive in Badian, safety briefing and gear fitting",
      "9:00 AM to 1:00 PM — Kawasan Falls canyoneering trek",
      "1:30 PM — Lunch by the falls",
      "3:00 PM — Return drive with a stop at a local viewpoint",
      "6:00 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Certified canyoneering guide and safety gear",
      "Lunch",
      "Entrance and environmental fees",
    ],
    duration: "Full day, about 13 hours",
    pricePerPerson: 2800,
    maxPassengers: 12,
  },
  {
    slug: "cebu-coastal-island-hopping",
    title: "Cebu Coastal & Island Hopping",
    shortDescription:
      "Island-hop across Cebu's clearest coastal waters with stops for snorkeling and lunch on the sand.",
    description:
      "Board a traditional outrigger boat and hop between sandbars and reef stops off Cebu's coast. Expect calm, clear water, a floating lunch setup, and time to snorkel over coral gardens before heading back to shore.",
    heroImage: {
      path: "/images/home/tour-package-cebu-coast-enhanced.png",
      alt: "Clear coastal water and an outrigger boat in Cebu",
    },
    itinerary: [
      "7:00 AM — Pickup from your accommodation",
      "9:00 AM — Depart by boat from the pier",
      "9:30 AM to 12:00 PM — Island and sandbar hopping with snorkeling stops",
      "12:30 PM — Floating lunch",
      "2:00 PM to 4:00 PM — Final reef stop and free time",
      "5:30 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Boat, boatman, and life vests",
      "Snorkeling gear",
      "Lunch",
      "Island entrance fees",
    ],
    duration: "Full day, about 10 hours",
    pricePerPerson: 2200,
    maxPassengers: 15,
  },
  {
    slug: "moalboal-seaside-sardine-run",
    title: "Moalboal Seaside & Sardine Run",
    shortDescription:
      "Snorkel alongside Moalboal's legendary sardine run and unwind at a seaside resort pool.",
    description:
      "Drive to Moalboal on Cebu's southwest coast to swim just meters from shore into one of the world's few year-round sardine runs. The afternoon winds down at a seaside resort pool with ocean views before the drive back.",
    heroImage: {
      path: "/images/home/tour-package-seaside-pool.jpg",
      alt: "Seaside pool overlooking the ocean in Moalboal, Cebu",
    },
    itinerary: [
      "6:00 AM — Pickup from your accommodation",
      "9:00 AM — Arrive in Moalboal, gear fitting",
      "9:30 AM to 11:30 AM — Guided sardine run snorkel",
      "12:00 PM — Lunch at a seaside resort",
      "1:00 PM to 4:00 PM — Free time at the resort pool and beach",
      "7:00 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Snorkeling guide and gear",
      "Lunch",
      "Resort day-use pass",
    ],
    duration: "Full day, about 13 hours",
    pricePerPerson: 2500,
    maxPassengers: 12,
  },
];

export function getTourPackage(slug: string): TourPackage | undefined {
  return tourPackages.find((tourPackage) => tourPackage.slug === slug);
}
```

- [ ] **Step 3: Create `lib/tour-packages/validation.ts`**

```ts
import type {
  TourPackage,
  TourPackageBookingDraft,
  TourPackageBookingErrors,
} from "./types";

export function validateTourPackageBooking(
  draft: TourPackageBookingDraft,
  tourPackage: TourPackage,
  now = Date.now(),
): TourPackageBookingErrors {
  const errors: TourPackageBookingErrors = {};
  const start = new Date(draft.startDatetime).getTime();

  if (!Number.isFinite(start)) {
    errors.startDatetime = "Choose a departure date and time.";
  } else if (start <= now) {
    errors.startDatetime = "Departure must be in the future.";
  }

  if (
    draft.passengerCount === null ||
    !Number.isSafeInteger(draft.passengerCount) ||
    draft.passengerCount < 1
  ) {
    errors.passengerCount = "Enter a whole number of passengers, at least 1.";
  } else if (draft.passengerCount > tourPackage.maxPassengers) {
    errors.passengerCount = `This package allows up to ${tourPackage.maxPassengers} passengers.`;
  }

  return errors;
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Run real assertions against the validation logic**

Run:
```bash
node --experimental-strip-types --input-type=module -e '
import { validateTourPackageBooking } from "./lib/tour-packages/validation.ts";
import { tourPackages, getTourPackage } from "./lib/tour-packages/data.ts";

if (tourPackages.length !== 3) throw new Error("expected exactly 3 packages");

const pkg = tourPackages[0];
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

const valid = validateTourPackageBooking({ startDatetime: future, passengerCount: 2 }, pkg);
if (Object.keys(valid).length !== 0) throw new Error("expected a valid draft to have no errors, got " + JSON.stringify(valid));

const pastErrors = validateTourPackageBooking({ startDatetime: past, passengerCount: 2 }, pkg);
if (!pastErrors.startDatetime) throw new Error("expected a past date to error");

const emptyErrors = validateTourPackageBooking({ startDatetime: "", passengerCount: 2 }, pkg);
if (!emptyErrors.startDatetime) throw new Error("expected an empty date to error");

const overCap = validateTourPackageBooking({ startDatetime: future, passengerCount: pkg.maxPassengers + 1 }, pkg);
if (!overCap.passengerCount) throw new Error("expected over-capacity passenger count to error");

const zeroPassengers = validateTourPackageBooking({ startDatetime: future, passengerCount: 0 }, pkg);
if (!zeroPassengers.passengerCount) throw new Error("expected zero passengers to error");

if (!getTourPackage(pkg.slug)) throw new Error("getTourPackage should find an existing slug");
if (getTourPackage("not-a-real-slug") !== undefined) throw new Error("getTourPackage should return undefined for an unknown slug");

console.log("lib/tour-packages validation + data checks passed");
'
```
Expected output: `lib/tour-packages validation + data checks passed`

- [ ] **Step 6: Commit**

```bash
git add lib/tour-packages
git commit -m "feat(tour-packages): add package data and booking validation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Catalog page (`/tour-packages`)

**Files:**
- Create: `app/tour-packages/layout.tsx`
- Create: `app/tour-packages/page.tsx`
- Create: `components/tour-packages/PackageCard.tsx`

**Interfaces:**
- Consumes: `tourPackages` from `lib/tour-packages/data.ts` (Task 1), `TourPackage` type, `formatCurrency` from `@/lib/bookings/display`, `Button` from `@/components/ui/button`, `PageHeader` from `@/components/ui/page-header`.
- Produces: `PackageCard` component, taking `{ tourPackage: TourPackage }`, used again by no other task (catalog-only), and the `app/tour-packages/layout.tsx` wrapper that Tasks 3 and 4 render inside of.

- [ ] **Step 1: Create the shared layout for every `/tour-packages/*` route**

`app/tour-packages/layout.tsx`:
```tsx
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function TourPackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      {children}
      <Footer compact />
    </div>
  );
}
```

This mirrors `app/my-bookings/layout.tsx` exactly, so every page under `app/tour-packages/` renders `<main>` content only — no need to repeat `Navbar`/`Footer` in each page file.

- [ ] **Step 2: Create `components/tour-packages/PackageCard.tsx`**

Card markup matches the existing homepage "Tour Packages" card style in `components/home/TravelOptionsSection.tsx` (image header + content body), since `components/ui/card.tsx`'s single `padding` prop doesn't support an edge-to-edge media header — this keeps the catalog card visually consistent with the homepage preview card instead of fighting the shared `Card` primitive's API.

```tsx
import Image from "next/image";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import type { TourPackage } from "@/lib/tour-packages/types";

export default function PackageCard({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,transform] hover:-translate-y-1 hover:border-primary/30">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-warm">
        <Image
          src={tourPackage.heroImage.path}
          alt={tourPackage.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {tourPackage.title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {tourPackage.shortDescription}
        </p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {formatCurrency(tourPackage.pricePerPerson)} / person
          </span>
          <span className="text-muted-foreground">{tourPackage.duration}</span>
        </div>
        <Button
          href={`/tour-packages/${tourPackage.slug}`}
          variant="outline"
          className="mt-2 self-start"
        >
          View details
        </Button>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Create `app/tour-packages/page.tsx`**

```tsx
import type { Metadata } from "next";
import PackageCard from "@/components/tour-packages/PackageCard";
import PageHeader from "@/components/ui/page-header";
import { tourPackages } from "@/lib/tour-packages/data";

export const metadata: Metadata = {
  title: "Tour Packages | ROAMIGO",
  description:
    "Browse predefined Cebu tour packages with complete service details.",
};

export default function TourPackagesPage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Cebu tour packages"
          title="Browse predefined Cebu itineraries"
          description="Each package includes a professional driver and a complete, fixed itinerary — just choose your date and passenger count."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tourPackages.map((tourPackage) => (
            <PackageCard key={tourPackage.slug} tourPackage={tourPackage} />
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Verify against the running dev server**

If the dev server isn't already running:
```bash
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
npm run dev &
```
Wait for it, then check:
```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages
curl -s http://localhost:3000/tour-packages | grep -c "View details"
```
Expected: `200`, then `3` (one "View details" link per package).

- [ ] **Step 6: Commit**

```bash
git add app/tour-packages/layout.tsx app/tour-packages/page.tsx components/tour-packages/PackageCard.tsx
git commit -m "feat(tour-packages): add package catalog page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Package detail page (`/tour-packages/[slug]`)

**Files:**
- Create: `app/tour-packages/[slug]/page.tsx`
- Create: `app/tour-packages/[slug]/not-found.tsx`

**Interfaces:**
- Consumes: `getTourPackage`, `tourPackages` from `lib/tour-packages/data.ts` (Task 1), `formatCurrency` from `@/lib/bookings/display`, `Button` from `@/components/ui/button`.
- Produces: the `/tour-packages/[slug]/book` link target (Task 5) and nothing else consumes this page's output.

- [ ] **Step 1: Create `app/tour-packages/[slug]/not-found.tsx`**

Mirrors `app/my-bookings/[bookingId]/not-found.tsx`.

```tsx
import Link from "next/link";

export default function TourPackageNotFound() {
  return (
    <main className="flex flex-1 items-center bg-gradient-to-br from-surface-warm via-background to-background px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-primary/15 bg-background p-7 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Package not found
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          We could not find that tour package
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          It may have been renamed, or it is no longer offered.
        </p>
        <Link
          href="/tour-packages"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Browse tour packages
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/tour-packages/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import { getTourPackage, tourPackages } from "@/lib/tour-packages/data";

export function generateStaticParams() {
  return tourPackages.map((tourPackage) => ({ slug: tourPackage.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  if (!tourPackage) {
    return { title: "Tour Package Not Found | ROAMIGO" };
  }

  return {
    title: `${tourPackage.title} | ROAMIGO`,
    description: tourPackage.shortDescription,
  };
}

export default async function TourPackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  if (!tourPackage) {
    notFound();
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-surface-warm">
          <Image
            src={tourPackage.heroImage.path}
            alt={tourPackage.heroImage.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Cebu tour package
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tourPackage.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {tourPackage.description}
          </p>
        </header>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="text-lg font-bold tracking-tight">Itinerary</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {tourPackage.itinerary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-bold tracking-tight">
              What&apos;s included
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {tourPackage.inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {tourPackage.duration} · up to {tourPackage.maxPassengers}{" "}
              passengers
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatCurrency(tourPackage.pricePerPerson)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / person
              </span>
            </p>
          </div>
          <Button href={`/tour-packages/${tourPackage.slug}/book`} size="lg">
            Book this package
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify against the running dev server**

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages/south-cebu-waterfalls-canyoneering
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages/cebu-coastal-island-hopping
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages/moalboal-seaside-sardine-run
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages/not-a-real-slug
```
Expected: `200`, `200`, `200`, `404`.

- [ ] **Step 5: Commit**

```bash
git add app/tour-packages/\[slug\]
git commit -m "feat(tour-packages): add package detail page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Booking form component

**Files:**
- Create: `components/tour-packages/PackageBookingForm.tsx`

**Interfaces:**
- Consumes: `TourPackage`, `TourPackageBookingDraft`, `TourPackageBookingErrors`, `TourPackageBookingStep`, `createEmptyBookingDraft` from `@/lib/tour-packages/types` (Task 1); `validateTourPackageBooking` from `@/lib/tour-packages/validation` (Task 1); `formatBookingDateTime`, `formatCurrency` from `@/lib/bookings/display`; `TripDateTimeRow` from `@/components/bookings/TripDateTimeRow`; `PassengerCounter` from `@/components/bookings/PassengerCounter`; `Button` from `@/components/ui/button`.
- Produces: default export `PackageBookingForm`, props `{ tourPackage: TourPackage }`, consumed by Task 5's booking page.

- [ ] **Step 1: Create `components/tour-packages/PackageBookingForm.tsx`**

State machine and focus-management pattern mirror `components/bookings/CustomTripForm.tsx`. Error styling uses the semantic `danger`/`success` tokens from `app/globals.css` (per `docs/FRONTEND_DESIGN.md`), not the raw `red-800` used in the older `CustomTripForm`.

```tsx
"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import PassengerCounter from "@/components/bookings/PassengerCounter";
import TripDateTimeRow from "@/components/bookings/TripDateTimeRow";
import Button from "@/components/ui/button";
import { formatBookingDateTime, formatCurrency } from "@/lib/bookings/display";
import {
  createEmptyBookingDraft,
  type TourPackage,
  type TourPackageBookingDraft,
  type TourPackageBookingErrors,
  type TourPackageBookingStep,
} from "@/lib/tour-packages/types";
import { validateTourPackageBooking } from "@/lib/tour-packages/validation";

const steps = [
  { id: "details", label: "Trip details", description: "Choose your date and group size." },
  { id: "review", label: "Review", description: "Check your booking before you send the request." },
] as const;

export default function PackageBookingForm({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  const [step, setStep] = useState<TourPackageBookingStep>("details");
  const [draft, setDraft] = useState<TourPackageBookingDraft>(createEmptyBookingDraft);
  const [errors, setErrors] = useState<TourPackageBookingErrors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const currentIndex = steps.findIndex((item) => item.id === step);
  const total = (draft.passengerCount ?? 0) * tourPackage.pricePerPerson;

  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detailErrors = validateTourPackageBooking(draft, tourPackage);
    setErrors(detailErrors);
    if (!Object.keys(detailErrors).length) setStep("review");
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("confirmation");
  }

  const summaryRows: Array<[string, string]> = [
    ["Package", tourPackage.title],
    ["Departure", draft.startDatetime ? formatBookingDateTime(draft.startDatetime) : ""],
    ["Passengers", String(draft.passengerCount ?? "")],
    ["Estimated total", formatCurrency(total)],
  ];

  if (step === "confirmation") {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-success-border bg-success-surface p-6 sm:p-8">
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold text-success outline-none">
          Booking request received
        </h2>
        <p className="mt-2 text-success">
          This is a request summary only — nothing has been charged or
          confirmed with a driver yet.
        </p>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          {summaryRows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <Button href="/tour-packages" variant="outline" className="mt-7">
          Browse more packages
        </Button>
      </div>
    );
  }

  const currentStep = steps[currentIndex];

  return (
    <div className="mx-auto max-w-3xl">
      <ol aria-label="Booking steps" className="mb-7 flex items-start">
        {steps.map((item, index) => (
          <li
            key={item.id}
            aria-current={step === item.id ? "step" : undefined}
            className="flex min-w-0 flex-1 items-start last:flex-none"
          >
            <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  index <= currentIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {index < currentIndex ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-sm font-semibold sm:block ${
                  step === item.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`mt-4 h-px min-w-4 flex-1 sm:mx-4 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        ))}
      </ol>
      <form
        noValidate
        onSubmit={step === "details" ? handleDetailsSubmit : handleReviewSubmit}
        className="rounded-3xl border border-primary/15 bg-background p-6 sm:p-8"
      >
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          {currentStep.label}
        </h2>
        <p className="mt-2 mb-7 text-muted-foreground">{currentStep.description}</p>
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummary}
            tabIndex={-1}
            role="alert"
            className="mb-6 rounded-lg border border-danger-border bg-danger-surface p-4 text-sm text-danger focus:outline-2 focus:outline-danger"
          >
            Please correct the marked fields before continuing.
          </div>
        )}
        {step === "details" && (
          <div className="space-y-6">
            <TripDateTimeRow
              id="startDatetime"
              label="Departure"
              value={draft.startDatetime}
              error={errors.startDatetime}
              onChange={(startDatetime) => setDraft({ ...draft, startDatetime })}
            />
            <PassengerCounter
              value={draft.passengerCount ?? 1}
              error={errors.passengerCount}
              onChange={(passengerCount) => setDraft({ ...draft, passengerCount })}
            />
            <p className="text-sm text-muted-foreground">
              This package allows up to {tourPackage.maxPassengers} passengers.
              A professional driver is included.
            </p>
          </div>
        )}
        {step === "review" && (
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            {summaryRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div
          className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${
            step === "review" ? "sm:justify-between" : "sm:justify-end"
          }`}
        >
          {step === "review" && (
            <Button
              type="button"
              variant="outline"
              className="min-h-12 w-full px-6 py-3 text-sm sm:w-auto"
              onClick={() => setStep("details")}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="min-h-12 w-full px-7 py-3 text-sm sm:w-52">
            {step === "details" ? "Review booking" : "Send booking request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (This component isn't rendered by any route yet, so there is nothing to `curl` until Task 5 — type-checking is the full verification for this task.)

- [ ] **Step 3: Commit**

```bash
git add components/tour-packages/PackageBookingForm.tsx
git commit -m "feat(tour-packages): add package booking form component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Booking page wiring and manual QA

**Files:**
- Create: `app/tour-packages/[slug]/book/page.tsx`

**Interfaces:**
- Consumes: `getTourPackage`, `tourPackages` from `@/lib/tour-packages/data` (Task 1); `PackageBookingForm` from `@/components/tour-packages/PackageBookingForm` (Task 4).
- Produces: the final route in this feature — nothing else depends on it.

- [ ] **Step 1: Create `app/tour-packages/[slug]/book/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PackageBookingForm from "@/components/tour-packages/PackageBookingForm";
import { getTourPackage, tourPackages } from "@/lib/tour-packages/data";

export function generateStaticParams() {
  return tourPackages.map((tourPackage) => ({ slug: tourPackage.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  return {
    title: tourPackage
      ? `Book ${tourPackage.title} | ROAMIGO`
      : "Tour Package Not Found | ROAMIGO",
  };
}

export default async function TourPackageBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  if (!tourPackage) {
    notFound();
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
      <header className="mx-auto mb-7 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Tour package booking
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          {tourPackage.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Choose your date and group size. Every package includes a
          professional driver.
        </p>
      </header>
      <PackageBookingForm tourPackage={tourPackage} />
    </main>
  );
}
```

Note: `app/tour-packages/[slug]/not-found.tsx` (Task 3) also covers this nested `[slug]/book` route, since Next.js resolves the nearest `not-found.tsx` up the segment tree — no separate not-found file is needed here.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Full build**

Run: `npm run build`
Expected: build succeeds (this also statically generates all 3 `[slug]` and `[slug]/book` pages via `generateStaticParams`).

- [ ] **Step 4: Verify against the running dev server**

```bash
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
npm run dev &
timeout_seconds=30; until curl -sf http://localhost:3000 >/dev/null || [ $timeout_seconds -le 0 ]; do sleep 1; timeout_seconds=$((timeout_seconds - 1)); done

curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000/tour-packages/south-cebu-waterfalls-canyoneering/book
curl -s http://localhost:3000/tour-packages/south-cebu-waterfalls-canyoneering/book | grep -c "Review booking"
```
Expected: `200`, then `1`.

- [ ] **Step 5: Manual browser QA checklist**

Open `http://localhost:3000/tour-packages` in a browser and walk through:
- [ ] Catalog shows 3 cards with distinct images, titles, and prices.
- [ ] "View details" opens the correct detail page for each package.
- [ ] Detail page's "Book this package" opens `/tour-packages/<slug>/book`.
- [ ] On the booking form, submitting Step 1 with no date shows a "Departure must be in the future" / "Choose a departure date and time" error and does not advance.
- [ ] Entering a passenger count above the package's `maxPassengers` shows the capacity error and does not advance.
- [ ] Valid input advances to Review, showing the correct package, date, passenger count, and estimated total (`price × passengers`).
- [ ] "Back" from Review returns to Step 1 with the previously entered values retained.
- [ ] Submitting Review shows the "Booking request received" confirmation with the same summary values.
- [ ] Visiting `/tour-packages/not-a-real-slug` (and `/tour-packages/not-a-real-slug/book`) renders the not-found page.
- [ ] Resize to a narrow (375px) viewport — no horizontal scroll, buttons remain full-width and tappable, stepper still legible.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors in any file created by this plan.

- [ ] **Step 7: Commit**

```bash
git add app/tour-packages/\[slug\]/book
git commit -m "feat(tour-packages): wire up booking page

Completes the tour-packages feature: catalog -> detail -> booking ->
mock confirmation, entirely frontend-only per the design spec.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
