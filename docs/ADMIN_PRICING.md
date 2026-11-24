# Pricing administration

The Pricing workspace reuses Button, Card, Alert, EmptyState, FormField, Input
and the portal PageHeading. Its native confirmation dialog is feature-specific and uses
the existing semantic color, spacing and radius tokens. No globally shared
component or showcase API changed.

Active configurations and configuration history use separate tables. History
contains inactive drafts as well as previously used pricing; it is not a full
mutation audit log. Vehicle categories use readable labels rather than UUID
entry. Table overflow is contained on narrow screens.

Creating a replacement saves a new inactive version. If its effective period
includes the current time, a modal shows the new rate, adjustment, dates and
overlapping configurations to be deactivated. Confirming uses the atomic
switch endpoint. Keeping it inactive leaves the existing pricing unchanged.
Future-dated configurations remain inactive until an Admin activates them
during their effective period; there is no background activation scheduler.

The switch affects only overlapping configurations for the same category.
Existing quotes and bookings keep their stored prices. Previous configurations
do not resume automatically when a replacement expires. Conflicting concurrent
changes require a refresh and another review. Uncertain saves disable retry
until the Admin refreshes and checks the persisted records.

The dialog traps focus natively, starts focus on Close, supports Escape when
idle and prevents dismissal while a request is in progress. On close, focus
returns to the Pricing header. Loading, empty, error and recovery states are
provided by the workspace.

## Verification

Backend switch authorization remains enforced by the Admin route and the
transaction-level operator check. Authored coverage includes stale confirmations,
future-period rejection, idempotent activation, audit rollback and concurrent
replacement. The frontend proxy tests cover explicit confirmation, UUID lists,
unknown fields and the allowlisted switch endpoint.

November 24 verification: the user ran all six Admin proxy tests, lint and the
production build successfully. Backend checks passed 12 unit tests, nine HTTP
tests, lint and build. A fresh local PostgreSQL 17 database accepted all nine
migrations and passed all 20 integration cases, including switch rollback and
concurrency.

The browser confirmed a synthetic VAN switch from PHP 1200 to PHP 1300 and
restoration to PHP 1200. Active/history rows refreshed after each confirmation.
Database evidence showed activation/deactivation audits and unchanged hashes
of all stored booking and quote amounts. The PHP 1300 fixture remains inactive.
The modal, Escape dismissal, restored focus and 390px viewport fit were checked.
The PostgreSQL run emitted the existing pg concurrent-query deprecation warning.
