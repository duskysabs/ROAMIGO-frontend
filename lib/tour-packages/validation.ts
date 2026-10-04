import type {
  TourPackage,
  TourPackageBookingDraft,
  TourPackageBookingErrors,
} from "./types";

export function validateTourPackageBooking(
  draft: TourPackageBookingDraft,
  tourPackage: TourPackage,
  now = Date.now(),
): TourPackageBookingErrors {
  const errors: TourPackageBookingErrors = {};
  const start = new Date(draft.startDatetime).getTime();

  if (!Number.isFinite(start)) {
    errors.startDatetime = "Choose a departure date and time.";
  } else if (start <= now) {
    errors.startDatetime = "Departure must be in the future.";
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

  return errors;
}
