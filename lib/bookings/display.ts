import type { BookingRecord } from "@/lib/bookings/records";

const terminalStatuses = new Set([
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
]);

export function humanizeBookingValue(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatBookingDate(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatBookingDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(value: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (!hours) {
    return `${minutes} min`;
  }

  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

export function getBookingTitle(booking: BookingRecord): string {
  return booking.tourPackage?.name ??
    (booking.bookingType === "CUSTOM_TRIP" ? "Custom trip" : "Cebu tour");
}

export function getBookingRoute(booking: BookingRecord): string {
  if (!booking.stops.length) {
    return "Route details pending";
  }

  const pickup = booking.stops[0].locationName;
  const dropoff = booking.stops.at(-1)?.locationName;
  return dropoff && dropoff !== pickup ? `${pickup} to ${dropoff}` : pickup;
}

export function isPastBooking(booking: BookingRecord, now = new Date()): boolean {
  return (
    terminalStatuses.has(booking.bookingStatus) ||
    new Date(booking.endDatetime).getTime() < now.getTime()
  );
}
