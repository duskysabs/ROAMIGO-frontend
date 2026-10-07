import type { CustomTripDraft, TripErrors, VehicleTypeOption } from "./types";
import { bookingNotes } from "./integration";
import { earliestBookingDate } from "./schedule";

export function validateTripDetails(
  draft: CustomTripDraft,
  vehicleTypes: readonly VehicleTypeOption[],
  now = Date.now(),
): TripErrors {
  const errors: TripErrors = {};
  const start = new Date(draft.startDatetime).getTime();
  const end = new Date(draft.endDatetime).getTime();

  if (!Number.isFinite(start)) errors.startDatetime = "Choose a departure date and time.";
  else if (start < earliestBookingDate(now).getTime()) {
    errors.startDatetime = "Same-day bookings are unavailable. Choose tomorrow or a later date.";
  }
  if (!Number.isFinite(end)) errors.endDatetime = "Choose an end date and time.";
  else if (Number.isFinite(start) && end <= start) {
    errors.endDatetime = "The trip must end after departure.";
  }
  if (draft.passengerCount === null || !Number.isSafeInteger(draft.passengerCount) || draft.passengerCount < 1) {
    errors.passengerCount = "Enter a whole number of passengers, at least 1.";
  }
  const vehicle = vehicleTypes.find((type) => type.id === draft.vehicleTypeId);
  if (!vehicle) {
    errors.vehicleTypeId = "Choose a vehicle category.";
  }
  if (vehicle && draft.passengerCount !== null && draft.passengerCount > vehicle.maximumPassengerCapacity) {
    errors.passengerCount = `This category accommodates up to ${vehicle.maximumPassengerCapacity} passengers.`;
  }
  return errors;
}

export function validateTripRoute(draft: CustomTripDraft): TripErrors {
  const errors: TripErrors = {};
  const stops = [draft.pickup, ...draft.additionalStops, draft.dropoff];
  if (draft.additionalStops.length > 8) errors.notes = "Use at most 8 additional stops.";
  for (const stop of stops) {
    if (!stop.searchText.trim()) errors[stop.id] = "Enter a location or address.";
    else if (stop.searchText.trim().length > 255) errors[stop.id] = "Use 255 characters or fewer.";
    else if (!stop.location?.placeId) errors[stop.id] = "Choose a location from the suggestions.";
    if (stop.activity.length > 255) errors[`${stop.id}-activity`] = "Use 255 characters or fewer.";
    if (stop.plannedStopMinutes !== null && (!Number.isSafeInteger(stop.plannedStopMinutes) || stop.plannedStopMinutes < 0)) {
      errors[`${stop.id}-minutes`] = "Enter a whole number of minutes, at least 0.";
    }
  }
  if (draft.notes.length > 2000) errors.notes = "Use 2,000 characters or fewer.";
  if (bookingNotes(draft).length > 2000) errors.notes = "Shorten the trip notes or stop activities. Combined notes must fit within 2,000 characters.";
  return errors;
}
