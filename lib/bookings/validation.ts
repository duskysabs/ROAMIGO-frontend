import type { CustomTripDraft, TripErrors, VehicleTypeOption } from "./types";

export function validateTripDetails(
  draft: CustomTripDraft,
  vehicleTypes: readonly VehicleTypeOption[],
  now = Date.now(),
): TripErrors {
  const errors: TripErrors = {};
  const start = new Date(draft.startDatetime).getTime();
  const end = new Date(draft.endDatetime).getTime();

  if (!Number.isFinite(start)) errors.startDatetime = "Choose a departure date and time.";
  else if (start <= now) errors.startDatetime = "Departure must be in the future.";
  if (!Number.isFinite(end)) errors.endDatetime = "Choose an end date and time.";
  else if (Number.isFinite(start) && end <= start) {
    errors.endDatetime = "The trip must end after departure.";
  }
  if (draft.passengerCount === null || !Number.isSafeInteger(draft.passengerCount) || draft.passengerCount < 1) {
    errors.passengerCount = "Enter a whole number of passengers, at least 1.";
  }
  if (vehicleTypes.length && !vehicleTypes.some((type) => type.id === draft.vehicleTypeId)) {
    errors.vehicleTypeId = "Choose a vehicle category.";
  }
  return errors;
}

export function validateTripRoute(draft: CustomTripDraft): TripErrors {
  const errors: TripErrors = {};
  const stops = [draft.pickup, ...draft.additionalStops, draft.dropoff];
  for (const stop of stops) {
    if (!stop.searchText.trim()) errors[stop.id] = "Enter a location or address.";
    else if (stop.searchText.trim().length > 255) errors[stop.id] = "Use 255 characters or fewer.";
    if (stop.activity.length > 255) errors[`${stop.id}-activity`] = "Use 255 characters or fewer.";
    if (stop.plannedStopMinutes !== null && (!Number.isSafeInteger(stop.plannedStopMinutes) || stop.plannedStopMinutes < 0)) {
      errors[`${stop.id}-minutes`] = "Enter a whole number of minutes, at least 0.";
    }
  }
  if (draft.notes.length > 2000) errors.notes = "Use 2,000 characters or fewer.";
  return errors;
}
