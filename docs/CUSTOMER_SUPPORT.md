# Customer feedback and contact pages

Routes: `/feedback` and `/contact`, available through the existing public
navigation and footer. Both use the shared customer header, footer, cards,
form fields, buttons, page header, and alerts.

These pages are frontend-only. Forms validate required fields, email format,
rating, and nonblank messages before showing an editable review. No submission
is sent, stored, or claimed to have been delivered. Entries remain in component
memory and are lost on navigation/reload. A future API integration should replace
this review-only flow with submission, pending, failure, and success states.

Editorial content, topic options, rating labels, and FAQs live in
`lib/support/content.ts`. Location and business hours reuse `config/site.ts`.
Phone and email contact details were not invented.

The backend `dev` branch was inspected at
`8e4cafb46060a7ab4d244c5aa112160913d1ff69`. No customer feedback/contact module or
Prisma model was found. `staff/booking-reviews` handles staff booking decisions,
not customer reviews. The backend has not been changed.

Manual checks: validate empty/invalid input, choose ratings with the keyboard,
review/edit without losing values, and inspect both routes at mobile and desktop
widths before release.
