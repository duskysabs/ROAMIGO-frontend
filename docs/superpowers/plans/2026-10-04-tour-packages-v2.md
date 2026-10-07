# Tour Packages v2 (4-step Figma flow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first version's 2-step booking flow with the full 4-step Figma flow (Package Details → Customize & Choose Vehicle → Review & Submit → Payment), entirely mocked, no backend.

**Architecture:** Extend the existing `lib/tour-packages/` data layer with vehicle types and pricing. Redesign the detail page to match the Figma. Replace `PackageBookingForm.tsx` with a single client component `BookingWizard.tsx` whose internal state drives 5 sub-states (customize, review, payment-select, payment-qr, verifying, verified).

**Tech Stack:** Same as v1 — Next.js 16 App Router, TypeScript, Tailwind v4 semantic tokens.

**Spec:** `docs/superpowers/specs/2026-10-04-tour-packages-design.md` (revised version)
**Supersedes:** `docs/superpowers/plans/2026-10-04-tour-packages.md` (v1 plan; Tasks 1-2 of that plan — data layer basics and catalog page — still stand unchanged; Tasks 3-5 — old detail page and `PackageBookingForm.tsx` — are replaced here)

## Global Constraints

(Same as v1's Global Constraints, plus:)
- Payment is simulated: static QR placeholder, no polling, "Check Payment Status" instantly resolves.
- Vehicle cards use one shared inline SVG icon, no per-vehicle photography.
- Gallery images reuse existing `public/images/home/*` photos — no new assets.
- No per-step URL routing for the wizard — one page, client state machine.
- Verify with: `npx tsc --noEmit`, `node --experimental-strip-types --input-type=module -e '...'` for pure logic, `curl` for pages, `npm run build` + `npm run lint` at the end, manual browser QA for the full wizard (can't curl-verify client-state transitions).

---

### Task 1: Extend data layer — vehicles, pricing, richer package records

**Files:**
- Modify: `lib/tour-packages/types.ts`
- Modify: `lib/tour-packages/data.ts`
- Create: `lib/tour-packages/vehicles.ts`
- Create: `lib/tour-packages/pricing.ts`
- Modify: `lib/tour-packages/validation.ts`

**Interfaces to produce:**
- `TourPackage` gains `routeStops: string[]` and `gallery: { path: string; alt: string }[]` (4 entries); `heroImage` unchanged.
- `VehicleType = { id: string; name: string; capacity: number; priceModifier: number }` — 4 entries (sedan/mpv/van/coaster) per spec table.
- `getRecommendedVehicle(passengerCount: number, vehicles?: readonly VehicleType[]): VehicleType` — cheapest vehicle with `capacity >= passengerCount`, falling back to the highest-capacity vehicle.
- `getEligibleVehicles(passengerCount: number, vehicles?: readonly VehicleType[]): VehicleType[]` — all vehicles with sufficient capacity, sorted by `priceModifier` ascending.
- `calculateTripCost(pkg: TourPackage, passengerCount: number, vehicle: VehicleType): { base: number; vehicleModifier: number; total: number }`.
- New booking draft shape replacing the old one:
  `BookingDraft = { travelDate: string; preferredStartTime: string; pickupLocation: string; specialRequests: string; passengerCount: number | null; vehicleId: string }`,
  `createEmptyBookingDraft(): BookingDraft`,
  `BookingErrors = Record<string, string>`,
  `BookingWizardStep = "customize" | "review" | "payment-select" | "payment-qr" | "verifying" | "verified"`.
- `validateBookingDetails(draft: BookingDraft, pkg: TourPackage, now?: number): BookingErrors` — date-in-future, passenger count 1..maxPassengers, pickupLocation required (≤255 chars), specialRequests ≤2000 chars.

**Verification:**
- [ ] `npx tsc --noEmit` clean.
- [ ] `node --experimental-strip-types --input-type=module -e '...'` asserting: 3 packages each have 4-entry `gallery` and non-empty `routeStops`; `getRecommendedVehicle(2)` returns `sedan`; `getRecommendedVehicle(10)` returns `van`; `getEligibleVehicles(2)` excludes nothing (all 4 qualify, sorted sedan/mpv/van/coaster); `calculateTripCost` math matches `price*count + modifier`; `validateBookingDetails` rejects empty pickup location and over-cap passenger count, accepts a valid draft.
- [ ] Commit: `feat(tour-packages): add vehicle types, pricing, and extend package data`

---

### Task 2: `BookingStepper` — shared 4-step header

**Files:**
- Create: `components/tour-packages/BookingStepper.tsx`

**Interfaces:**
- `export default function BookingStepper({ currentIndex }: { currentIndex: 0 | 1 | 2 | 3 })`.
- Renders the 4 fixed steps (Package Details / Customize & Choose Vehicle / Review & Submit / Payment) each with a numbered circle, label, and one-line description, horizontal layout with connecting lines — matches the Figma's stepper exactly (title + subtitle under each step, not just a compact label like the old `CustomTripForm` stepper). Steps with index `<= currentIndex` render filled/red; later steps render muted. No interactivity (not clickable) — purely a progress indicator, same as the Figma.

**Verification:**
- [ ] `npx tsc --noEmit` clean. (Not wired into a route yet — visual check deferred to Tasks 3 and 5.)
- [ ] Commit: `feat(tour-packages): add shared booking stepper component`

---

### Task 3: Redesign Package Details page

**Files:**
- Modify: `app/tour-packages/[slug]/page.tsx` (full rewrite of the body; keep `generateStaticParams`/`generateMetadata` shape)

**Interfaces:**
- Consumes `BookingStepper` (Task 2), `tourPackage.gallery`/`routeStops` (Task 1).
- Produces the link target `/tour-packages/[slug]/book` (unchanged target, now goes to `BookingWizard` once Task 6 lands).

**Content, matching the Figma frame:**
- Breadcrumb "Tour Packages / Package Details".
- Title = package title, subtitle = `shortDescription`.
- `<BookingStepper currentIndex={0} />`.
- 4-image gallery grid (`tourPackage.gallery`).
- "Established Package Route" — numbered list from `routeStops`, plus the info note ("The package route is fixed. Trip details and vehicle preference are entered in the next step.").
- "Package Description and Inclusions" — `description` + `inclusions` list.
- Sidebar: "Package at a Glance" (duration, `formatCurrency(pricePerPerson)` as base price, static "Approved" status label), "Before You Continue" (two static bullets: "Driver-included service", "Established route and inclusions preserved").
- Bottom bar: "← Back to Tour Packages" (outline, links `/tour-packages`) and "Enter Trip Details & Choose Vehicle →" (primary, links `/tour-packages/[slug]/book`).

**Verification:**
- [ ] `npx tsc --noEmit` clean.
- [ ] `curl` all 3 slugs still 200; `curl -s .../south-cebu-waterfalls-canyoneering | grep -c "Enter Trip Details"` → 1.
- [ ] Commit: `feat(tour-packages): redesign package details page to match Figma`

---

### Task 4: Vehicle picker + trip cost components

**Files:**
- Create: `components/tour-packages/VehicleIcon.tsx` — one shared inline SVG (simple car/van silhouette), accepts `className` for sizing.
- Create: `components/tour-packages/VehiclePicker.tsx` — props `{ passengerCount: number; selectedVehicleId: string; onSelect: (id: string) => void }`. Internally calls `getRecommendedVehicle`/`getEligibleVehicles` (Task 1). Renders the recommended vehicle in a highlighted card ("Recommended" + "Selected" badges when it's also the current selection) and the remaining eligible vehicles as a small grid of selectable cards ("Other Eligible Vehicles"), each using `VehicleIcon`.
- Create: `components/tour-packages/TripCostSummary.tsx` — props `{ pkg: TourPackage; passengerCount: number | null; vehicle: VehicleType | null }`. Renders "Base Package" / "Selected Vehicle" / "Total Price" rows using `calculateTripCost` (Task 1) and `formatCurrency`; shows `"-"` placeholders when `passengerCount`/`vehicle` aren't set yet (matches the Figma's empty state).

**Verification:**
- [ ] `npx tsc --noEmit` clean. (Visual/interaction check deferred to Task 5, once wired into the wizard.)
- [ ] Commit: `feat(tour-packages): add vehicle picker and trip cost components`

---

### Task 5: `BookingWizard` — Customize and Review steps

**Files:**
- Create: `components/tour-packages/BookingWizard.tsx` (new file; starts with just the `customize` and `review` states working — Task 6 adds the payment states to this same file)

**Interfaces:**
- `export default function BookingWizard({ tourPackage }: { tourPackage: TourPackage })`.
- Internal state: `step: BookingWizardStep` (starts `"customize"`), `draft: BookingDraft`, `errors: BookingErrors`.
- Renders `<BookingStepper currentIndex={1} />` while on `customize`, `currentIndex={2}` while on `review` (steps map: customize→index 1, review→index 2 — matches Package Details already being index 0 behind this page).
- **Customize:** "Your Preferences" (travel date via `TripDatePicker`, start time via `TripTimePicker`, `PassengerCounter`, pickup location via `Input`+`FormField`, special requests via `Textarea`+`FormField`), read-only route-stop recap, `VehiclePicker` (reacting to `draft.passengerCount`), `TripCostSummary`. "Continue to Review" runs `validateBookingDetails`; on success, if `draft.vehicleId` is empty, default it to the recommended vehicle for the entered passenger count before advancing.
- **Review:** read-only recap (package, all preference fields, chosen vehicle, `TripCostSummary`). "Edit Preferences" button returns to `customize` (values retained). "Proceed to Payment" — for Task 5, just `console.log` or a disabled/no-op placeholder is NOT acceptable per the no-placeholder rule, so Task 5 instead renders the button but Task 6 is what makes it functional; to keep Task 5 independently testable without a dangling button, implement `step` as already including the payment values in its type (from Task 1) and have "Proceed to Payment" call `setStep("payment-select")`, rendering nothing for that step yet — Task 6 adds the payment-select render branch immediately after, so this is a same-session, two-commit continuation of one file, not a shipped gap.

**Verification:**
- [ ] `npx tsc --noEmit` clean.
- [ ] Commit: `feat(tour-packages): add booking wizard customize and review steps`

---

### Task 6: `BookingWizard` — Payment states, delete old form, wire up the route

**Files:**
- Modify: `components/tour-packages/BookingWizard.tsx` (add `payment-select`, `payment-qr`, `verifying`, `verified` render branches)
- Modify: `app/tour-packages/[slug]/book/page.tsx` (swap `PackageBookingForm` for `BookingWizard`)
- Delete: `components/tour-packages/PackageBookingForm.tsx`

**Interfaces:**
- **Payment-select:** `<BookingStepper currentIndex={3} />`. Shows "Full approved amount" (the computed total from `calculateTripCost`), a single pre-selected "Pay with QR Ph / E-Wallet" method card, "Before You Pay" bullets (static text from the Figma), "Open Supported E-Wallet" → `setStep("payment-qr")`, "Cancel and Return" (outline) → back to `review`.
- **Payment-qr:** same `currentIndex={3}`. A bordered box with a placeholder QR pattern (a simple inline SVG grid, not a real QR encoder — no new dependency), "Payment Details" (merchant = "Planet J Rent A Car", booking reference = a fixed placeholder string like `"[Pending]"`, total price), "Before You Pay" bullets, "Open Supported E-Wallet" → `setStep("verifying")`, "Cancel and Return" → `review`.
- **Verifying:** breadcrumb-equivalent heading "Verifying Payment" (no stepper shown here, matching the Figma, which drops the 4-step header on this screen), spinner (a simple CSS-animated circle, no new dependency), the Figma's copy, "Check Payment Status" (primary) → `setStep("verified")` immediately, "Back to My Bookings" (outline, links `/my-bookings`).
- **Verified:** success panel (semantic `success` tokens, same visual language as v1's confirmation card) summarizing package/date/time/pickup/passengers/vehicle/total; "Browse more packages" link to `/tour-packages`.

**Verification:**
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds.
- [ ] `curl` `/tour-packages/[slug]/book` for all 3 slugs → 200.
- [ ] Manual browser QA (dev server) — walk the full wizard end to end for one package:
  - [ ] Customize validates (empty date, passenger count 0, passenger count over cap, empty pickup location each block advancing with the right error).
  - [ ] Entering passenger count updates the recommended vehicle and `TripCostSummary` live.
  - [ ] Review shows exactly what was entered; "Edit Preferences" preserves it.
  - [ ] Payment-select → Payment-qr → Verifying → clicking "Check Payment Status" → Verified, each showing correct running totals.
  - [ ] "Cancel and Return" from both payment screens returns to Review.
  - [ ] 375px viewport: no horizontal scroll anywhere in the wizard or the redesigned detail page.
- [ ] `npm run lint` — no new errors.
- [ ] Commit: `feat(tour-packages): add payment states, complete booking wizard

Completes the full 4-step Figma flow: Package Details -> Customize &
Choose Vehicle -> Review & Submit -> Payment (fully mocked, no real
gateway). Replaces the v1 2-step flow.`
