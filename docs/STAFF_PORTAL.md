# Staff workspaces

The frontend follows the backend's existing `UserRole.STAFF` role. There are two
UI sections, not two permission roles:

- `/staff`: booking dashboard, bookings and quotation review, calendar, fleet,
  customer records, booking reports, notifications, and help.
- `/accounting`: accounting dashboard, payments, receivables, refunds, customer
  accounts, accounting reports, notifications, and help.

Authenticated STAFF and ADMIN accounts can switch between sections using the sidebar.
Customers, drivers, and unknown roles are denied staff workspace access. Both layouts and every page verify the server session through
`auth/me`. Unauthenticated visitors are sent to login, unauthorized roles receive
404, and backend verification failures fail closed. After login, STAFF defaults to
`/staff`; an accounting deep link is retained. No browser role selector or local
role override exists. No backend schema or role changes are needed.

Backend contract reviewed: `duskysabs/ROAMIGO-backend`, `dev` branch,
`prisma/schema.prisma` (`UserRole`: ADMIN, CUSTOMER, STAFF, DRIVER) and
`src/auth/auth.service.ts`. The frontend reads `user.profile.role` from `auth/me`, treating server-returned
`user.isDriver: true` as DRIVER even for a legacy STAFF profile. It uses the
existing HTTP-only access-token cookie. Backend endpoints remain
responsible for their own authorization when live staff data is connected.

## Design and sample behavior

Figma: `esuHVbknrtZtJ94Q6UV4uM`, Final Presentation (`1290:1346`). Booking uses the
Booking Staff section (dashboard `1944:7128`). Accounting uses the Accounting
Staff section (`1856:11630`), including dashboard `1856:12201`, payments
`1856:12458`, receivables `1856:11631`, refunds `1856:14879`, customer accounts
`1856:13235`, reports `1856:14049`, and notifications `1856:14403`.

Accounting Payments and Assignments now connect to backend queues and mutations.
See [ACCOUNTING_INTEGRATION.md](./ACCOUNTING_INTEGRATION.md) for receipt entry,
external funds verification, approval/rejection, allocation retries and recovery.
The queues are live data, but are not a complete payment ledger or booking list.

Other Accounting sections retain in-memory preview records and show a preview
notice. Dashboard totals and CSV reports do not reconcile with live payment
reviews. Refund transitions remain sample interactions and never refund funds.
Receivables aging uses the design's July 22, 2026 reference.

Booking creation validates capacity and overlapping assignments. Pricing decisions
require a reason; cancellation requires confirmation. Monthly booking reports
remain a separate May 2026 design sample. Live maps, ML pricing, dispatch,
accounting reconciliation, provider integration, and broader persistent staff screens
remain integration work. No real customer or vehicle data is bundled.

Design assets live in `public/images/staff/` and `public/images/accounting/`.
Accounting composes the existing UI components and scoped staff styles.

## Verification

- `node --test tests/staff-access.test.mjs`: backend role and redirect policy.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- With a local mock backend, verify anonymous redirects, CUSTOMER/DRIVER
  denials, STAFF/ADMIN access to every route, and unavailable/invalid sessions.
- Sign in as STAFF, switch sections, review a synthetic receipt in Payments, and verify mobile
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

## Authentication integration

Login responses requiring COMPLETE_PROFILE save the access-token cookie and
continue to customer onboarding without calling auth/me, which requires an
existing application profile. Profile completion still uses the backend's
token-authenticated endpoint. Completed profiles are verified through auth/me
before access is granted. Driver-linked identities use DRIVER routing and cannot
enter Staff or Accounting through a legacy STAFF profile role.

Regression checks: `node --test tests/staff-access.test.mjs tests/auth-integration.test.mjs`.
These checks use mocked HTTP and cookie boundaries. They do not establish live
Supabase, database, or browser behavior. Checks for this change are not run.

Driver login returns to the public home page while no dedicated Driver portal
exists. Customer booking deep links do not override that destination.


## Administrator workspace

Administrators now default to /admin after login. The dedicated workspace uses
live Staff, fleet, package and pricing APIs. Booking and Accounting remain
available to administrators with their existing preview/integration boundaries.
See [ADMIN_PANEL.md](./ADMIN_PANEL.md) for supported operations and verification.
