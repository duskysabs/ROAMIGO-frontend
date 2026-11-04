import Link from "next/link";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import {
  formatBookingDate,
  formatCurrency,
  getBookingRoute,
  getBookingTitle,
  humanizeBookingValue,
} from "@/lib/bookings/display";
import type { BookingRecord } from "@/lib/bookings/records";

export default function BookingCard({ booking }: { booking: BookingRecord }) {
  return (
    <article className="rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/30 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <BookingStatusBadge status={booking.bookingStatus} />
          <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
            {getBookingTitle(booking)}
          </h3>
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {getBookingRoute(booking)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-semibold text-foreground">
            {formatBookingDate(booking.startDatetime)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(booking.finalQuotedPrice)}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Passengers</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {booking.passengerCount}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Vehicle</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {humanizeBookingValue(booking.vehicleType.name)}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1 sm:text-right">
          <dt className="sr-only">Booking action</dt>
          <dd>
            <Link
              href={`/my-bookings/${booking.id}`}
              className="inline-flex min-h-10 items-center font-semibold text-primary underline-offset-4 hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              View details
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </dd>
        </div>
      </dl>
    </article>
  );
}
