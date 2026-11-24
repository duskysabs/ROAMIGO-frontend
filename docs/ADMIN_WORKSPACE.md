# Administration workspace design

Administration uses the same portal foundation as Booking and Accounting:
`app/staff/staff.css`, `app/staff/polish.css`, the mobile navigation hook,
StaffIcon and PageHeading. Its fixed sidebar, active navigation, topbar,
workspace links, account summary and compact content follow those existing
patterns. AdminShell supplies Admin-specific navigation and identity labels.

All Admin routes remain protected by requireAdmin. This visual change does not
change API commands or permissions. Pricing retains its confirmation, active
and history tables, stale-confirmation handling and uncertain-result recovery.

Admin-specific CSS is scoped to .admin-portal. Booking, Accounting and customer
surfaces are not restyled by these rules. Existing shared components are reused
without new variants or changes to their public APIs. No new globally shared
component or showcase entry is introduced.

The sidebar reuses useMobileNavigation for off-canvas behavior, focus containment,
Escape dismissal, inert content and scroll locking. Workspace switching and
logout remain available in the sidebar. Overview and resource pages reuse
PageHeading instead of the customer-facing PageHeader.

The user ran lint and the production build successfully for this visual
follow-up, including TypeScript compilation. Browser verification covered
Overview, Packages and Pricing, plus the 390px navigation drawer, Escape
dismissal and focus restoration. Test suites were not rerun for this visual
change. Pricing-switch behavior was verified separately before this follow-up.
