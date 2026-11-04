# Staff workspaces

The frontend follows the backend's existing `UserRole.STAFF` role. There are two
UI sections, not two permission roles:

- `/staff`: booking dashboard, bookings and quotation review, calendar, fleet,
  customer records, booking reports, notifications, and help.
- `/accounting`: accounting dashboard, payments, receivables, refunds, customer
  accounts, accounting reports, notifications, and help.

An authenticated STAFF account can switch between sections using the sidebar.
Customers, drivers, administrators, and unknown roles are not implicitly granted
STAFF access. Both layouts and every page verify the server session through
`auth/me`. Unauthenticated visitors are sent to login, unauthorized roles receive
404, and backend verification failures fail closed. After login, STAFF defaults to
`/staff`; an accounting deep link is retained. No browser role selector or local
role override exists. No backend schema or role changes are needed.

Backend contract reviewed: `duskysabs/ROAMIGO-backend`, `dev` branch,
`prisma/schema.prisma` (`UserRole`: ADMIN, CUSTOMER, STAFF, DRIVER) and
`src/auth/auth.service.ts`. The frontend reads `user.profile.role` from `auth/me`
and uses the existing HTTP-only access-token cookie. Backend endpoints remain
responsible for their own authorization when live staff data is connected.

## Design and sample behavior

Figma: `esuHVbknrtZtJ94Q6UV4uM`, Final Presentation (`1290:1346`). Booking uses the
Booking Staff section (dashboard `1944:7128`). Accounting uses the Accounting
Staff section (`1856:11630`), including dashboard `1856:12201`, payments
`1856:12458`, receivables `1856:11631`, refunds `1856:14879`, customer accounts
`1856:13235`, reports `1856:14049`, and notifications `1856:14403`.

Both sections use standard operational UI copy without sample-data banners.
This is a presentation change only. Staff login is real;
operational and financial data are previews. No live collections, refunds,
verification, or staff mutations are sent. Booking and accounting each have their
own in-memory provider; leaving a section or reloading resets its changes.

Accounting supports search/filtering, payment review with required notes, manual
sample entries, refund transitions (Requested -> Processing -> Refunded, or
Requested -> Rejected), record detail dialogs, notification read state, and CSV
exports. Manual samples start in Needs Review. Dashboard summaries derive from
interactive records rather than copying inconsistent Figma totals. Receivables
and customer account tables remain separate Figma samples; they do not reconcile
with interactive payment entries. Aging uses the design's July 22, 2026 reference.
Reports use operational labels and protect exported cells against formula
execution. Integration limitations remain documented here. Revenue exports contain verified collections by booking; vehicle/tour
aggregation awaits live data.

Booking creation validates capacity and overlapping assignments. Pricing decisions
require a reason; cancellation requires confirmation. Monthly booking reports
remain a separate May 2026 design sample. Live maps, ML pricing, dispatch,
accounting reconciliation, provider verification, and persistent staff endpoints
remain integration work. No real customer or vehicle data is bundled.

Design assets live in `public/images/staff/` and `public/images/accounting/`.
Accounting composes the existing UI components and scoped staff styles.

## Verification

- `node --test tests/staff-access.test.mjs`: backend role and redirect policy.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- With a local mock backend, verify anonymous redirects, CUSTOMER/DRIVER/ADMIN
  denials, STAFF access to every route, and unavailable/invalid sessions.
- Sign in as STAFF, switch sections, review a sample payment, and verify mobile
  navigation and sample CSV exports.

## Responsive presentation

Both sections share the warm Figma palette, compact navigation and panel styling.
The booking dashboard places metrics above its list alongside the task/fleet
column on wide screens; narrower desktops stack the supporting panels. Below
761px, booking lists and accounting tables become labeled record cards with
full-width actions. Inputs use 16px text and primary touch controls are at least
44px tall. Dialogs have sticky headings and scroll within the viewport.

The mobile drawer makes the background inert, traps keyboard focus, closes with
Escape, restores focus to its trigger, and locks background scrolling. Closed
drawers are excluded from keyboard navigation. Desktop tables are preserved.

## Fixture locations

- `lib/staff/data.ts`: booking, customer, and vehicle seed records.
- `lib/staff/fixtures.ts`: monthly report figures, chart scales, dashboard tasks,
  fleet presentation figures, notifications, pricing charges, tour options, and
  default dates/form values.
- `lib/accounting/data.ts`: payment, refund, receivable, and customer account
  records, the aging reference date, and derived receivable summaries.

UI components import these fixtures; interaction state remains in the existing
providers. This organization does not add persistence or backend integration.
