import { createEmptyTripDraft, type CustomTripDraft, type TripStopDraft } from "./types";
import { parseLocation } from "./integration";

const key = "roamigo.custom-trip.login-draft";
const maxAge = 30 * 60 * 1000;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStop(value: unknown, id: string): TripStopDraft | null {
  if (!record(value) || typeof value.searchText !== "string" || value.searchText.length > 255 ||
    typeof value.activity !== "string" || value.activity.length > 255 ||
    (value.plannedStopMinutes !== null && (typeof value.plannedStopMinutes !== "number" || !Number.isSafeInteger(value.plannedStopMinutes) || value.plannedStopMinutes < 0))) return null;
  return { id, searchText: value.searchText, activity: value.activity, plannedStopMinutes: value.plannedStopMinutes, location: parseLocation(value.location) };
}

export function saveLoginDraft(draft: CustomTripDraft): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), draft }));
    return true;
  } catch {
    return false;
  }
}

export function takeLoginDraft(): CustomTripDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || typeof saved.savedAt !== "number" || !Number.isFinite(saved.savedAt) || saved.savedAt > Date.now() || Date.now() - saved.savedAt > maxAge || !record(saved.draft)) return null;
    const draft = saved.draft;
    if (typeof draft.startDatetime !== "string" || !Number.isFinite(Date.parse(draft.startDatetime)) ||
      typeof draft.endDatetime !== "string" || !Number.isFinite(Date.parse(draft.endDatetime)) ||
      typeof draft.vehicleTypeId !== "string" || typeof draft.passengerCount !== "number" || !Number.isSafeInteger(draft.passengerCount) || draft.passengerCount < 1 ||
      typeof draft.notes !== "string" || draft.notes.length > 2000 || !Array.isArray(draft.additionalStops) || draft.additionalStops.length > 8) return null;
    const pickup = readStop(draft.pickup, "pickup");
    const dropoff = readStop(draft.dropoff, "dropoff");
    const stops = draft.additionalStops.map((stop, index) => readStop(stop, `restored-stop-${index}`));
    if (!pickup || !dropoff || stops.some((stop) => !stop)) return null;
    return { ...createEmptyTripDraft(), startDatetime: draft.startDatetime, endDatetime: draft.endDatetime,
      vehicleTypeId: draft.vehicleTypeId, passengerCount: draft.passengerCount, notes: draft.notes,
      pickup, dropoff, additionalStops: stops as TripStopDraft[] };
  } catch {
    return null;
  }
}
