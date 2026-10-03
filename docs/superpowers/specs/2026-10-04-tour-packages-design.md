# Tour Packages — Design Spec

Date: 2026-10-04
Status: Approved for implementation
Target: demo-ready for Tuesday presentation

## Problem

The homepage and nav (`config/site.ts`) already link to `/tour-packages`
in two places (header menu "Browse Tour Packages", and the "Tour
Packages" card in `TravelOptionsSection`), but the route doesn't
exist — it's a 404. The booking data model
(`lib/bookings/records.ts`) already anticipates tour-package bookings
via a `tourPackage: { id, name } | null` field, but there is no
catalog of packages anywhere in the repo, and no backend endpoint for
them (`app/api/` only has `auth` and `bookings`).

## Decisions from brainstorming

- **No real backend dependency.** There is no backend reachable for
  this feature yet (confirmed: no `.env`, only `.env.example`). The
  entire feature is frontend-only, built on static mock data, so it's
  demoable Tuesday regardless of backend state.
- **Mock package content** drafted from Cebu's most-visited tourist
  spots, reusing images already committed under
  `public/images/home/` (no new image assets).
- **Booking submission is client-side only.** On submit, show an
  in-page confirmation summary. No network call, no persistence
  (matches the existing custom-trip flow's "this is a draft, nothing
  is booked yet" honesty — see `TripReviewStep.tsx`). Explicitly
  rejected: localStorage-backed fake persistence (adds scope/risk of
  conflating mock and real `BookingRecord` data in `/my-bookings`).
- **Booking form lives on its own page** (`/tour-packages/[slug]/book`),
  mirroring the existing `/plan-a-trip` pattern — a full-page focused
  form — rather than inline on the detail page. Keeps the detail page
  a pure read/showcase.
- **No nav changes needed** — `config/site.ts` already points at
  `/tour-packages`.
- **No auth gating** — consistent with `/plan-a-trip`, which is also
  public.

## Packages (mock content)

Three packages, each mapped to an existing image so no new assets are
needed:

1. **South Cebu Waterfalls & Canyoneering** (Kawasan Falls / Badian
   area) — `public/images/home/custom-trip-mantayupan-falls.jpg`
2. **Cebu Coastal & Island Hopping** —
   `public/images/home/tour-package-cebu-coast-enhanced.png`
3. **Moalboal Seaside & Sardine Run** —
   `public/images/home/tour-package-seaside-pool.jpg`

Each package record includes: id/slug, title, short description (for
the catalog card), hero image, longer description + itinerary bullets
+ inclusions list (for the detail page), duration (e.g. "Full day,
~10 hours"), price per person (PHP), and `maxPassengers`.

## File structure

Mirrors the existing `lib/bookings/` + `components/bookings/`
conventions so it reads consistently with the rest of the codebase.

```
lib/tour-packages/
  types.ts        # TourPackage, TourPackageBookingDraft, TourPackageErrors
  data.ts         # static array of the 3 packages + getTourPackage(slug) helper
  validation.ts   # date-in-future + passengerCount <= maxPassengers

components/tour-packages/
  PackageCard.tsx          # catalog grid card (image, title, short desc, price, "View details" link)
  PackageBookingForm.tsx   # 3-step: details -> review -> confirmation (mirrors CustomTripForm.tsx)

app/tour-packages/
  page.tsx                  # catalog grid (server component, reads lib/tour-packages/data.ts directly)
  [slug]/page.tsx            # package detail: gallery/hero image, itinerary, inclusions, price, "Book this package" CTA
  [slug]/not-found.tsx       # unknown slug (mirrors app/my-bookings/[bookingId]/not-found.tsx)
  [slug]/book/page.tsx       # booking form page (mirrors app/plan-a-trip/page.tsx structure: Navbar + header + form + Footer)
```

## Data flow

- `app/tour-packages/page.tsx` and the `[slug]` pages are server
  components that import directly from `lib/tour-packages/data.ts` —
  no fetch, no API route, since this is static mock data.
- `PackageBookingForm` is a client component (`"use client"`), state
  machine identical in shape to `CustomTripForm.tsx`:
  `step: "details" | "review" | "confirmation"`, local `useState` for
  the draft and validation errors, focus management on step change
  (reuse the same `heading`/`errorSummary` ref pattern).
- Step 1 ("Trip details"): date/time picker + passenger count input,
  capped by the package's `maxPassengers`.
- Step 2 ("Review"): package summary (title, image, duration),
  chosen date, passenger count, estimated total = `price *
  passengerCount`.
- On submit from review: move to `step: "confirmation"` (no network
  call) and render a "Booking request received" panel with a
  summary of what was entered. No reference ID, no persistence —
  explicitly a mock confirmation.

## Validation

Reuses the same rules as `lib/bookings/validation.ts`:
- `startDatetime` must parse and be in the future.
- `passengerCount` must be a positive integer, and must not exceed
  the selected package's `maxPassengers` (new rule, since custom
  trips have no such cap).

## Error handling

- Unknown `[slug]` → Next.js `notFound()` → the package's
  `not-found.tsx`, same pattern as `app/my-bookings/[bookingId]/not-found.tsx`.
- No network/backend error handling needed anywhere in this feature
  (nothing calls the network).

## Testing

- Manual verification via the dev server (`npm run dev`): catalog
  page renders 3 cards with correct images/links, each detail page
  renders itinerary + working "Book this package" CTA, booking form
  validates (date in past, passenger count 0 / over cap) and reaches
  the confirmation screen on valid input.
- No automated test infra exists yet in this repo (no test runner in
  `package.json`), so this spec does not introduce one — out of
  scope for Tuesday's demo.

## Out of scope (explicitly deferred)

- Real backend integration (listing packages from the NestJS API,
  creating real bookings).
- localStorage-backed mock persistence / showing up in `/my-bookings`.
- Search/filtering on the catalog page.
- Auth gating on any of these routes.
