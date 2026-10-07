import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingsUnavailable from "@/components/bookings/BookingsUnavailable";
import { BackendRequestError } from "@/lib/api/backend";
import { getSessionState } from "@/lib/auth/session";
import {
  formatBookingDateTime,
  formatCurrency,
  formatDuration,
  getBookingTitle,
  humanizeBookingValue,
} from "@/lib/bookings/display";
import type { BookingRecord } from "@/lib/bookings/records";
import { getMyBooking } from "@/lib/bookings/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type BookingLoadResult =
  | { status: "ready"; booking: BookingRecord }
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "unavailable" };

async function loadBooking(bookingId: string): Promise<BookingLoadResult> {
  try {
    return { status: "ready", booking: await getMyBooking(bookingId) };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401 || error.status === 403) {
        return { status: "unauthenticated" };
      }

      if (error.status === 404) {
        return { status: "not-found" };
      }
    }

    return { status: "unavailable" };
  }
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  if (!UUID_PATTERN.test(bookingId)) {
    notFound();
  }

  const session = await getSessionState();

  if (session.status === "unauthenticated") {
    redirect(`/auth/login?next=/my-bookings/${bookingId}`);
  }

  const result =
    session.status === "authenticated"
      ? await loadBooking(bookingId)
      : ({ status: "unavailable" } as const);

  if (result.status === "unauthenticated") {
    redirect(`/auth/login?next=/my-bookings/${bookingId}`);
  }

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "unavailable") {
    return (
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <BookingsUnavailable
            title="We could not load this booking"
            description="The booking service may be temporarily unavailable. Your booking information has not been changed."
          />
        </div>
      </main>
    );
  }

  const { booking } = result;
  const latestPaymentState = booking.paymentStates.at(-1);
  const latestAssignmentState = booking.assignmentStates.at(-1);

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/my-bookings"
          className="inline-flex min-h-10 items-center text-sm font-semibold text-primary underline-offset-4 hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span aria-hidden="true" className="mr-2">
            ←
          </span>
          Back to my bookings
        </Link>

        <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Booking details
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {getBookingTitle(booking)}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference {booking.id}
            </p>
          </div>
          <BookingStatusBadge status={booking.bookingStatus} />
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-background p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight">Trip schedule</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Departure</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatBookingDateTime(booking.startDatetime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Return</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatBookingDateTime(booking.endDatetime)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight">Route</h2>
              {booking.stops.length ? (
                <ol className="relative mt-6 space-y-6">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-4 left-4 top-4 w-px bg-border"
                  />
                  {booking.stops.map((stop, index) => (
                    <li
                      key={`${stop.sequenceNumber}-${stop.locationName}`}
                      className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4"
                    >
                      <span
                        aria-hidden="true"
                        className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : index === booking.stops.length - 1
                              ? "bg-foreground text-background"
                              : "border border-primary bg-background text-primary"
                        }`}
                      >
                        <span className="text-xs font-bold">{index + 1}</span>
                      </span>
                      <div className="min-w-0 pb-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                          {humanizeBookingValue(stop.stopType)}
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {stop.locationName}
                        </p>
                        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                          {stop.formattedAddress}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-muted-foreground">
                  Route details are not available yet.
                </p>
              )}
            </section>

          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-primary/15 bg-background p-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Quoted total
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {formatCurrency(booking.finalQuotedPrice)}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Payment and final confirmation are shown separately below.
              </p>

              <dl className="mt-6 divide-y divide-border text-sm">
                <div className="flex justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-muted-foreground">Passengers</dt>
                  <dd className="font-semibold">{booking.passengerCount}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="font-semibold">
                    {humanizeBookingValue(booking.vehicleType.name)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Distance</dt>
                  <dd className="font-semibold">
                    {booking.totalDistanceKm.toLocaleString("en-PH", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    km
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-muted-foreground">Estimated drive</dt>
                  <dd className="font-semibold">
                    {formatDuration(booking.estimatedDurationMinutes)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Payment</h2>
              {latestPaymentState ? (
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-semibold">
                      {humanizeBookingValue(latestPaymentState)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  No payment has been recorded for this booking.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Trip progress</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Assignment</dt>
                  <dd className="font-semibold">{latestAssignmentState ? humanizeBookingValue(latestAssignmentState) : "Not assigned"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cancellation</dt>
                  <dd className="font-semibold">{booking.cancellationState ? humanizeBookingValue(booking.cancellationState) : "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Refund</dt>
                  <dd className="font-semibold">{booking.refundStates.length ? humanizeBookingValue(booking.refundStates.at(-1)!) : "None"}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
