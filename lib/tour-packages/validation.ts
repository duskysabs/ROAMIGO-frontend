import type { BookingDraft, BookingErrors } from "./types";
import type { VehicleType } from "./types";
import { earliestBookingDate } from "@/lib/bookings/schedule";

// Parses a "YYYY-MM-DD" value as local midnight, matching TripDatePicker's
// own parsing. `new Date("YYYY-MM-DD")` would parse it as UTC midnight
// instead, which drifts by a timezone offset from what the picker displays.
function parseLocalDate(value: string): number | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function validateBookingDetails(
  draft: BookingDraft,
  vehicleTypes: VehicleType[],
  now = Date.now(),
): BookingErrors {
  const errors: BookingErrors = {};
  const travelDate = parseLocalDate(draft.travelDate);
  const minimumBookingDate = earliestBookingDate(now).getTime();

  if (travelDate === null) {
    errors.travelDate = "Choose a travel date.";
  } else if (travelDate < minimumBookingDate) {
    errors.travelDate = "Same-day bookings are unavailable. Choose tomorrow or a later date.";
  }

  if (!draft.preferredStartTime) {
    errors.preferredStartTime = "Choose a preferred start time.";
  }

  const selectedVehicle = vehicleTypes.find(
    (vehicleType) => vehicleType.id === draft.vehicleTypeId,
  );

  if (
    draft.passengerCount === null ||
    !Number.isSafeInteger(draft.passengerCount) ||
    draft.passengerCount < 1
  ) {
    errors.passengerCount = "Enter a whole number of passengers, at least 1.";
  } else if (
    selectedVehicle &&
    draft.passengerCount > selectedVehicle.maximumPassengerCapacity
  ) {
    errors.passengerCount = "The selected vehicle cannot accommodate this group.";
  }

  if (!selectedVehicle) {
    errors.vehicleTypeId = "Choose a vehicle preference.";
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
