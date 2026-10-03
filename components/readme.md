# Component inventory

Reusable application components live in this directory. Check the live `/component-showcase` route and `docs/FRONTEND_DESIGN.md` before creating new interface styles.

## Shared UI

| Component | Responsibility |
| --- | --- |
| `Alert` | Information, success, warning, and error feedback |
| `Button` | Button and link actions with shared variants and sizes |
| `Card` | Bordered content grouping with consistent spacing |
| `EmptyState` | Empty results with explanation and a next action |
| `FormField` | Label, optional marker, hint, error, and control association |
| `Input` | Single-line text and native input controls |
| `PageHeader` | Page title, description, eyebrow, and actions |
| `Textarea` | Multi-line text entry |

Import shared components from `@/components/ui`.

## Feature components

- `components/auth/` contains authentication forms and controls.
- `components/bookings/` contains booking-specific interaction and display.
- `components/home/` contains homepage sections.
- `components/layout/` contains public application structure.

Promote a feature component into `components/ui/` only when its visual or interaction behavior is reusable across multiple features.
