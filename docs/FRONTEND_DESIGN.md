# ROAMIGO Frontend Design Guide

This guide defines the shared visual and interaction rules for customer-facing ROAMIGO pages. The live reference is available at `/component-showcase` while the application is running.

## Working agreement

1. Search `components/ui/` and `/component-showcase` before creating interface code.
2. Reuse an existing shared component when it already owns the same behavior and appearance.
3. Extend a shared component with an optional variant when the need is reusable.
4. Keep one-off page composition close to its page or feature.
5. Discuss broad visual changes before changing global tokens, navigation, page widths, or shared components.

## Visual foundations

- Use the semantic colors declared in `app/globals.css`. Do not add arbitrary brand, feedback, or surface colors inside pages.
- Use `rounded-lg` for controls, `rounded-xl` for fields and alerts, and `rounded-2xl` for content cards.
- Use the shared `Button`, `Input`, `Textarea`, `FormField`, `Alert`, `Card`, `PageHeader`, and `EmptyState` components.
- Keep page content inside an appropriate centered maximum width. Existing public pages use `max-w-7xl`; forms and customer content use narrower containers.
- Use one primary action per section. Secondary actions should use the outline or quiet button variant.
- Preserve visible focus styles, labels, error messages, disabled states, and touch targets.

## Responsive expectations

- Design mobile-first and check the smallest supported viewport before requesting review.
- Avoid fixed content widths that overflow narrow screens.
- Allow action groups to wrap or stack when space is limited.
- Keep essential content and actions available without hover.

## Shared component changes

When adding or materially changing a shared component:

1. Keep the API typed and focused.
2. Add every meaningful variant and state to `/component-showcase`.
3. Update this guide when the change introduces a new convention.
4. Check keyboard focus, labels, disabled behavior, errors, and mobile layout.
5. Include screenshots in the pull request.

## Booking location field

- Reuse `components/bookings/LocationField.tsx` for pickup, intermediate stops, and drop-off. It composes the shared `Input` and `Button` controls with the existing booking field wrapper.
- Search begins after 3 characters and a 450 ms delay. Requests are cancelled when input changes or the field closes. Editing a selected address clears the selected place ID.
- Arrow keys navigate suggestions, Enter selects, Escape closes, and Tab leaves the field. Loading, empty, selected, unavailable, and rate-limit messages are announced through a status region.
- Production search uses `/api/locations/autocomplete`, which forwards to the backend. Provider credentials stay on the backend.
- `/component-showcase` includes a working example with a local search adapter for suggestions, a slow response, no results, service errors, and rate limits. Example place IDs are never used in the booking flow.
- `TripQuoteSummary` is specific to the Custom Trip flow. Shared buttons, alerts, inputs, and cards retain their existing APIs.

## Pull request expectations

- Explain which shared components were reused or extended.
- Include desktop and mobile screenshots for visible changes.
- Call out intentional deviations from this guide.
- Run the repository lint and build commands before merge.
- Avoid mixing a broad redesign with unrelated feature work.
