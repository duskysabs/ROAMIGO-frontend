# Booking Staff portal

Open `/staff` for the Booking Staff frontend preview built from Figma's
`Final Presentation` → `Booking Staff` section (dashboard node `1944:7128`).
The existing customer pages and authentication flow are unchanged.

Routes: `/staff`, `/staff/bookings`, `/staff/bookings/[bookingId]`,
`/staff/calendar`, `/staff/fleet`, `/staff/customers`, `/staff/reports`,
`/staff/notifications`, and `/staff/help`.

The portal uses a shared in-memory provider with explicitly labeled sample data.
Navigation preserves changes; reloading restores the original sample. Creating a
booking validates the schedule, passenger capacity, and vehicle overlap. Pricing
approval and adjustment require a reason and move a sample booking to For Payment.
Cancellation requires confirmation and a reason. CSV exports escape cells and
guard against spreadsheet formula execution.

The monthly reports reproduce Figma's separate May 2026 reporting sample; their
summary exports correspond to those charts. Booking-list exports use the current
interactive sample records. Calendar defaults to the sample period and supports
week/month navigation and Manila-local Today.

Before production, connect authenticated, role-authorized staff endpoints for
bookings, customers, fleet, pricing review, reports and notifications. Enforce all
decisions, capacity and schedule checks server-side, including concurrent
assignment changes. Do not substitute the customer `bookings/me` endpoint for a
staff booking list. Live maps, ML pricing, payments, dispatch, and staff login
routing require their respective backend contracts. This preview sends no staff
requests and exposes no real customer or vehicle data.

Design assets are downloaded under `public/images/staff/`; temporary Figma asset
URLs are not used at runtime. Staff styles and design tokens are scoped to
`.staff-portal`, and compose the existing Button, Input and Card components.
