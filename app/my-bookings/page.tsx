import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BookingCard from "@/components/bookings/BookingCard";
import BookingsUnavailable from "@/components/bookings/BookingsUnavailable";
import { BackendRequestError } from "@/lib/api/backend";
import { getSessionState } from "@/lib/auth/session";
import { isPastBooking } from "@/lib/bookings/display";
import type { BookingRecord } from "@/lib/bookings/records";
import { getMyBookings } from "@/lib/bookings/server";

export const metadata: Metadata = {
  title: "My Bookings | ROAMIGO",
  description: "Review your upcoming and previous Planet J trips.",
};

type BookingLoadResult =
  | { status: "ready"; bookings: BookingRecord[] }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

async function loadBookings(): Promise<BookingLoadResult> {
  try {
    return { status: "ready", bookings: await getMyBookings() };
  } catch (error) {
    if (
      error instanceof BackendRequestError &&
      (error.status === 401 || error.status === 403)
    ) {
      return { status: "unauthenticated" };
    }

    return { status: "unavailable" };
  }
}

export default async function MyBookingsPage() {
  const session = await getSessionState();

  if (session.status === "unauthenticated") {
    redirect("/auth/login?next=/my-bookings");
  }

  const result =
    session.status === "authenticated"
      ? await loadBookings()
      : ({ status: "unavailable" } as const);

  if (result.status === "unauthenticated") {
    redirect("/auth/login?next=/my-bookings");
  }

  const bookings = result.status === "ready" ? result.bookings : [];
  const now = new Date();
  const upcoming = bookings
    .filter((booking) => !isPastBooking(booking, now))
    .sort(
      (left, right) =>
        new Date(left.startDatetime).getTime() -
        new Date(right.startDatetime).getTime(),
    );
  const past = bookings
    .filter((booking) => isPastBooking(booking, now))
    .sort(
      (left, right) =>
        new Date(right.startDatetime).getTime() -
        new Date(left.startDatetime).getTime(),
    );

  return (
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Customer Portal
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Bookings
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Review your trip schedule, route, booking status, and payment
                information.
              </p>
            </div>
            <Link
              href="/plan-a-trip"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Plan another trip
            </Link>
          </header>

          <div className="mt-8">
            {result.status === "unavailable" ? (
              <BookingsUnavailable />
            ) : bookings.length === 0 ? (
              <section className="rounded-2xl border border-primary/15 bg-background p-7 text-center sm:p-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-warm text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M5 4h14v16H5zM8 2v4m8-4v4M8 10h8m-8 4h5" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight">
                  No Bookings Yet
                </h2>
                <p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">
                  Your confirmed trip requests will appear here. Start by
                  planning a custom Cebu trip.
                </p>
                <Link
                  href="/plan-a-trip"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Plan a custom trip
                </Link>
              </section>
            ) : (
              <div className="space-y-10">
                <section aria-labelledby="upcoming-bookings-heading">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2
                      id="upcoming-bookings-heading"
                      className="text-xl font-bold tracking-tight"
                    >
                      Upcoming and Active
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {upcoming.length} {upcoming.length === 1 ? "trip" : "trips"}
                    </p>
                  </div>
                  {upcoming.length ? (
                    <div className="mt-4 grid gap-4">
                      {upcoming.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-2xl border border-border bg-background p-6 text-muted-foreground">
                      You have no upcoming trips.
                    </p>
                  )}
                </section>

                {past.length > 0 && (
                  <section aria-labelledby="past-bookings-heading">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2
                        id="past-bookings-heading"
                        className="text-xl font-bold tracking-tight"
                      >
                        Previous Trips
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {past.length} {past.length === 1 ? "trip" : "trips"}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {past.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
