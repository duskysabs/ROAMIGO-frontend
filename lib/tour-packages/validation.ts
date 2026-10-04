import type { BookingDraft, BookingErrors, TourPackage } from "./types";

// Parses a "YYYY-MM-DD" value as local midnight, matching TripDatePicker's
// own parsing — `new Date("YYYY-MM-DD")` would parse it as UTC midnight
// instead, which drifts by a timezone offset from what the picker displays.
function parseLocalDate(value: string): number | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function validateBookingDetails(
  draft: BookingDraft,
  tourPackage: TourPackage,
  now = Date.now(),
): BookingErrors {
  const errors: BookingErrors = {};
  const travelDate = parseLocalDate(draft.travelDate);
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);

  if (travelDate === null) {
    errors.travelDate = "Choose a travel date.";
  } else if (travelDate < startOfToday) {
    errors.travelDate = "Travel date must be in the future.";
  }

  if (
    draft.passengerCount === null ||
    !Number.isSafeInteger(draft.passengerCount) ||
    draft.passengerCount < 1
  ) {
    errors.passengerCount = "Enter a whole number of passengers, at least 1.";
  } else if (draft.passengerCount > tourPackage.maxPassengers) {
    errors.passengerCount = `This package allows up to ${tourPackage.maxPassengers} passengers.`;
  }

  if (!draft.pickupLocation.trim()) {
    errors.pickupLocation = "Enter a pickup location.";
  } else if (draft.pickupLocation.trim().length > 255) {
    errors.pickupLocation = "Use 255 characters or fewer.";
  }

  if (draft.specialRequests.length > 2000) {
    errors.specialRequests = "Use 2,000 characters or fewer.";
  }

  return errors;
}
