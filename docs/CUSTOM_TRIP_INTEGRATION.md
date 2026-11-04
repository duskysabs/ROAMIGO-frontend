# Custom Trip integration

## Implemented flow

1. `/plan-a-trip` loads vehicle categories and capacities using the existing server catalog reader. An empty catalog or unavailable backend has a retry state.
2. Customers choose a schedule, passenger count, and vehicle category. Capacity is checked locally and again by the backend.
3. `LocationField` uses `/api/locations/autocomplete` for selected pickup, ordered intermediate stops, and drop-off. Free text alone cannot advance. The UI permits at most 8 intermediate stops.
4. `/api/routes/preview` forwards ordered `placeIds` to the backend and displays distance and driving time. Preview is not a reservation.
5. The existing `/api/bookings/quote` route receives `CUSTOM_TRIP`, schedule, passengers, vehicle type, `routePlaceIds`, and notes. Only server-returned price, currency, metrics, and expiry are displayed.
6. The existing `/api/bookings` route receives only `quoteId` and a UUID idempotency key. Retries of the same quote keep the same key within the mounted form. A lost response keeps editing and requoting blocked until recovery or a definitive rejection.
7. Successful submission opens the server-returned booking in My Bookings. The current backend creates `AWAITING_PAYMENT`; payment and final assignment are outside this implementation.

## Authentication and data handling

Planning and route preview remain public. Quote issuance and submission require the existing authenticated backend endpoints.

If login is required before submission, the customer can continue through login. The draft is temporarily saved in this tab's session storage with a 30-minute lifetime and removed when restored. It contains trip inputs, not credentials or quote identifiers. If storage is unavailable, the interface offers login in another tab. During uncertain submission recovery, use another tab for login to retain the original quote and retry key. Reloading the page does not preserve an in-progress submission; check My Bookings before starting another booking.

The existing `BACKEND_API_URL` configuration is reused. Geoapify configuration is backend-owned. No Geoapify key is needed in the frontend. The backend currently limits autocomplete by IP; requests proxied through one frontend server can share that limit, so deployed multi-user rate limiting needs backend coordination.

Custom Trip routing currently rebuilds stops from place IDs and does not persist client stop activities or requested stop durations as structured fields. The frontend preserves those entries in booking notes, subject to the combined 2,000-character limit. Requested stop durations do not modify the driving-time estimate or server price.

## User-run verification

Checks have not been run as part of this implementation.

```bash
npm run lint
npm run build
```

Lint checks code and accessibility rules. Build checks TypeScript and production compilation.

Using a non-production backend and customer account:

- Check the location field in `/component-showcase`, including keyboard selection, slow results, empty results, errors, and retry. Edit a selected address and confirm the selection is cleared.
- Test `/plan-a-trip` on desktop and mobile. Confirm that today is unavailable, tomorrow can be selected, and capacity errors appear for a group larger than the selected vehicle category.
- Select a pickup, optional stops, and drop-off. Confirm that unselected free text cannot advance and the preview follows the selected order.
- Request a quote while signed out, log in, and verify draft restoration. Confirm an authenticated customer can request a quote and see its price and expiry.
- Edit the trip after quoting and confirm a fresh quote is required. Let a quote expire and confirm refresh is available.
- Submit once and verify one `AWAITING_PAYMENT` booking appears in My Bookings with the route and notes.
- In a controlled local setup, interrupt the submission response after the request is sent. Retry and compare Network payloads: the quote ID and idempotency key must remain identical, and the recovered booking must be the same record.
- Test unavailable vehicle, unavailable routing, rate-limit, forbidden, and expired-session responses. Failures must not display successful booking or payment.

No payment collection, map renderer, driver assignment, or backend source changes are included.
