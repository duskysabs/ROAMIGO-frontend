# Tour Packages — Design Spec

Date: 2026-10-04 (revised same day after Figma review)
Status: Approved for implementation
Target: demo-ready for Tuesday presentation

## Revision note

The first version of this spec scoped a 2-step booking flow (details →
review → mock confirmation). After implementing that version (see git
history on `feat/tour-packages`), the user shared the actual Figma
design (`ROAMIGO-UI`, node `1290-1346` and surrounding frames), which
specifies a full 4-step flow: **Package Details → Customize & Choose
Vehicle → Review & Submit → Payment** (Payment itself has 3
sub-states: method selection, QR scan, verifying). This revision
replaces the booking-flow sections of the spec to match that design.
The catalog page and data layer from the first version mostly survive,
extended with vehicle types and a richer package record.

## Problem

The homepage and nav (`config/site.ts`) already link to `/tour-packages`
in two places (header menu "Browse Tour Packages", and the "Tour
Packages" card in `TravelOptionsSection`), but the route didn't exist.
The booking data model (`lib/bookings/records.ts`) already anticipates
tour-package bookings via a `tourPackage: { id, name } | null` field,
but there was no catalog of packages anywhere in the repo, and no
backend endpoint for them (`app/api/` only has `auth` and `bookings`).

## Decisions

- **No real backend dependency**, still. No `.env` exists, only
  `.env.example`. The entire feature — including Payment — is
  frontend-only, built on static mock data and simulated state
  transitions, so it's demoable Tuesday regardless of backend state.
- **Payment is fully theater.** The Figma's Payment step assumes a
  live payment gateway (dynamic QR code, automatic transaction
  verification via polling). None of that exists. The QR code is a
  static placeholder image, and "Verifying Payment" does not poll
  anything — clicking "Check Payment Status" immediately resolves to
  a mocked success panel. This is a deliberate, disclosed
  simplification, not a bug to fix later.
- **One page hosts steps 2–4, not one route per step.** The Figma's
  breadcrumbs (`Tour Packages / Customize`, `/ Review & Submit`,
  `/ Payment`, `/ Verifying`) imply separate URLs per step. Carrying a
  booking draft across real page navigations with no backend would
  need `sessionStorage` or query-string state — meaningful added risk
  for a demo that gains nothing from real URLs. Instead,
  `/tour-packages/[slug]/book` hosts a single client component whose
  internal state drives which "step" is shown, reusing the same
  state-machine shape already proven in `CustomTripForm.tsx` and the
  first version of `PackageBookingForm.tsx`. The breadcrumb/stepper
  text is computed from component state, not the URL.
  `/tour-packages/[slug]` (Package Details) remains its own real,
  server-rendered page, since it's meant to be a browsable/shareable
  showcase independent of any booking session.
- **Vehicle cards use a generic icon, not per-vehicle photography.**
  The repo has no individual Sedan/MPV/Van/Coaster photos. Rather than
  fabricate stock photos, each vehicle card uses one shared inline SVG
  icon plus its name/capacity/description as text.
- **Package detail gallery reuses existing repo photos.** The Figma
  shows 4 gallery images per package. We only have 1 themed photo per
  package, so each package's gallery is assembled from its theme photo
  plus 3 of the existing general fleet/driver/hero photos already in
  `public/images/home/` (reused as "what's included" filler, not new
  assets).
- **Booking submission is still client-side only** at the end of the
  flow: no network call anywhere, nothing persisted (not even
  `localStorage`).
- **No nav changes needed, no auth gating** — same as before.

## Packages (mock content, extended)

Same 3 packages as the first version, same slugs, same theme photo,
same `description`/`duration`/`pricePerPerson`/`maxPassengers`, and
`heroImage` is **kept as-is** (still used unchanged by `PackageCard`
on the catalog page — no catalog changes needed). Two additions:

- **`routeStops: string[]`** — replaces the old time-stamped
  `itinerary` field for the detail page's "Established Package Route"
  list (4–6 short named stops per package, e.g. "Cebu City pickup",
  "Badian trailhead", "Kawasan Falls", "Return drop-off"). The old
  `itinerary` narrative (with clock times) is dropped — the new design
  doesn't show it.
- **`gallery: { path: string; alt: string }[]`** — 4 images per
  package: the existing theme photo first, then 3 of the existing
  general photos (`hero-planet-j-vans-enhanced.png`,
  `planet-j-fleet-enhanced.png`, `hero-cebu-driver-v2.png`, etc.),
  reused across packages where it makes sense thematically ("your
  included vehicle and driver").

## Vehicle types (new)

A small static catalog, independent of packages:

| id | name | capacity | price modifier |
|---|---|---|---|
| `sedan` | Sedan | 4 | ₱0 |
| `mpv` | MPV | 7 | ₱500 |
| `van` | Hiace Van | 12 | ₱1,000 |
| `coaster` | Coaster | 28 | ₱2,500 |

**Recommended vehicle** = the cheapest vehicle whose `capacity` is
`>=` the entered passenger count (falls back to the largest vehicle if
the count exceeds all capacities, which shouldn't happen since
passenger count is already capped at the package's `maxPassengers`,
and `coaster`'s capacity of 28 covers every package's cap).

## File structure

```
lib/tour-packages/
  types.ts        # TourPackage (extended), VehicleType, booking draft/errors/step types
  data.ts         # 3 packages (extended with routeStops + gallery) + getTourPackage(slug)
  vehicles.ts     # vehicleTypes array + getRecommendedVehicle(passengerCount)
  pricing.ts       # calculateTripCost(pkg, passengerCount, vehicle) -> { base, vehicleModifier, total }
  validation.ts   # extended: date-in-future, passengerCount <= maxPassengers, pickupLocation required, vehicleId required

components/tour-packages/
  PackageCard.tsx            # unchanged (catalog grid card)
  VehicleIcon.tsx             # shared inline SVG icon used by every vehicle card
  VehiclePicker.tsx           # recommended + "other eligible" vehicle cards, used in Customize step
  TripCostSummary.tsx         # Base Package / Selected Vehicle / Total Price box, used in Customize + Review
  BookingWizard.tsx            # replaces PackageBookingForm.tsx: the 5-internal-state flow (customize, review, payment-select, payment-qr, verifying)

app/tour-packages/
  layout.tsx                  # unchanged
  page.tsx                    # unchanged (catalog)
  [slug]/page.tsx              # redesigned: breadcrumb, 4-step header (step 1 active), 4-image gallery,
                                #   "Established Package Route" numbered stop list, "Package Description and
                                #   Inclusions", sidebar ("Package at a Glance", "Before You Continue"),
                                #   "Enter Trip Details & Choose Vehicle" CTA -> [slug]/book
  [slug]/not-found.tsx         # unchanged
  [slug]/book/page.tsx         # unchanged wrapper; now renders BookingWizard instead of PackageBookingForm
```

`PackageBookingForm.tsx` (first-version file) is deleted; `BookingWizard.tsx` replaces it.

## Data flow

- `app/tour-packages/page.tsx` and `[slug]/page.tsx` are unchanged in
  kind: server components reading directly from `lib/tour-packages/data.ts`.
- `BookingWizard` is a client component. Internal step type:
  `"customize" | "review" | "payment-select" | "payment-qr" | "verifying" | "verified"`.
  One `draft` state object carries: `travelDate`, `preferredStartTime`,
  `pickupLocation`, `specialRequests`, `passengerCount`, `vehicleId`.
  Same focus-management pattern as the first version (heading ref,
  error-summary ref).
- **Customize step:** "Your Preferences" form (travel date via
  `TripDatePicker`, preferred start time via `TripTimePicker` — used
  directly rather than the combined `TripDateTimeRow`, since the Figma
  shows them as two separate labeled fields; passenger count via the
  existing `PassengerCounter`; pickup location and special requests as
  plain `Input`/`Textarea` + `FormField`, no geocoding). Read-only
  route-stop recap. `VehiclePicker` reacts live to the entered
  passenger count to compute the recommended vehicle.
  `TripCostSummary` updates live as passengers/vehicle change.
  "Continue to Review" validates and advances.
- **Review step:** read-only recap of package, preferences, and
  vehicle, plus `TripCostSummary` again. "Proceed to Payment" advances
  (no validation needed — already validated on Customize).
- **Payment-select:** shows "Full approved amount" (the computed
  total) and a single payment method ("Pay with QR Ph / E-Wallet",
  pre-selected — there's only one method, so no real choice logic).
  "Open Supported E-Wallet" advances to `payment-qr`.
- **Payment-qr:** static QR placeholder image (a plain bordered box
  with a QR-pattern SVG — not a real scannable code), payment
  details recap, total price. "Open Supported E-Wallet" advances to
  `verifying` (simulating that the user completed payment in an
  external app).
- **Verifying:** spinner + the Figma's copy. "Check Payment Status"
  immediately (no delay, no polling) transitions to `verified`.
  "Back to My Bookings" link goes to `/my-bookings`.
- **Verified:** a success panel (styled like the first version's
  confirmation card — semantic `success` tokens) summarizing
  package, date, passengers, vehicle, and total. This state isn't in
  any shared frame but is necessary to end the demo on a clear,
  non-broken note rather than a perpetual spinner.
- Every step transition is a plain `setStep(...)` call. No network
  call anywhere in this component.

## Validation

Extends the first version's rules (`lib/tour-packages/validation.ts`):
- `travelDate` must parse and be in the future (date portion only).
- `passengerCount` must be a positive integer and not exceed the
  package's `maxPassengers`.
- `pickupLocation` must be non-empty, max 255 characters.
- `specialRequests` optional, max 2,000 characters.
- `vehicleId` must match one of `vehicleTypes` (always true in
  practice since the UI only lets you pick from that list, but
  validated defensively like the rest of this codebase's forms).
- All validated together on "Continue to Review"; Review and Payment
  steps don't re-validate (nothing new is entered there).

## Error handling

- Unknown `[slug]` → `notFound()` → `not-found.tsx`, unchanged.
- No network/backend error handling anywhere — nothing in this
  feature calls the network, including Payment.

## Testing

Same approach as the first version — no test runner in this repo:
- `npx tsc --noEmit` per task.
- `node --experimental-strip-types --input-type=module -e '...'` for
  pure logic (`validation.ts`, `vehicles.ts`, `pricing.ts`).
- `curl` against the dev server for page-level checks.
- `npm run build` once at the end.
- A manual browser click-through checklist covering the full 5-state
  wizard, written into the revised implementation plan.

## Out of scope (explicitly deferred)

- Any real payment gateway integration, QR generation, or transaction
  polling.
- Real backend integration for packages/bookings.
- `localStorage`-backed persistence / showing up in `/my-bookings`.
- Search/filtering on the catalog page.
- Auth gating on any route in this feature.
- Per-vehicle-type photography.
- Editing the vehicle/preferences after reaching Payment (no "back"
  from `payment-select` onward in the Figma either).
