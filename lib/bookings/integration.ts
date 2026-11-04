import type { CustomTripDraft, TripLocation } from "./types";

export type RoutePreview = {
  totalDistanceKm: string;
  estimatedDurationMinutes: number;
};

export type TripQuote = RoutePreview & {
  quoteId: string;
  currency: "PHP";
  finalQuotedPrice: string;
  expiresAt: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nonnegativeDecimal(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
}

export function parseLocation(value: unknown): TripLocation | null {
  if (!record(value) || typeof value.placeId !== "string" || !value.placeId || value.placeId.length > 500 ||
    typeof value.formattedAddress !== "string" || !value.formattedAddress ||
    typeof value.latitude !== "number" || !Number.isFinite(value.latitude) || Math.abs(value.latitude) > 90 ||
    typeof value.longitude !== "number" || !Number.isFinite(value.longitude) || Math.abs(value.longitude) > 180) return null;
  return {
    placeId: value.placeId,
    locationName: value.formattedAddress,
    formattedAddress: value.formattedAddress,
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

export function isRoutePreview(value: unknown): value is RoutePreview {
  return record(value) && nonnegativeDecimal(value.totalDistanceKm) &&
    typeof value.estimatedDurationMinutes === "number" && Number.isSafeInteger(value.estimatedDurationMinutes) && value.estimatedDurationMinutes >= 0;
}

export function isTripQuote(value: unknown): value is TripQuote {
  if (!record(value) || !isRoutePreview(value)) return false;
  const quote = value as Record<string, unknown>;
  return typeof quote.quoteId === "string" && Boolean(quote.quoteId) &&
    quote.currency === "PHP" && nonnegativeDecimal(quote.finalQuotedPrice) &&
    typeof quote.expiresAt === "string" && Number.isFinite(Date.parse(quote.expiresAt));
}

export function isSubmittedTrip(value: unknown): value is { id: string; bookingStatus: string } {
  return record(value) && typeof value.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id) &&
    typeof value.bookingStatus === "string";
}

export function bookingNotes(draft: CustomTripDraft): string {
  const stopNotes = draft.additionalStops.flatMap((stop, index) => {
    const details = [stop.activity.trim(), stop.plannedStopMinutes !== null ? `${stop.plannedStopMinutes} minutes requested` : ""].filter(Boolean);
    return details.length ? [`Stop ${index + 1}: ${details.join("; ")}`] : [];
  });
  return [draft.notes.trim(), ...stopNotes].filter(Boolean).join("\n");
}

export function tripPlaceIds(draft: CustomTripDraft): string[] {
  return [draft.pickup, ...draft.additionalStops, draft.dropoff].map((stop) => stop.location?.placeId ?? "");
}

export function buildTripRequest(draft: CustomTripDraft) {
  return {
    bookingType: "CUSTOM_TRIP",
    vehicleTypeId: draft.vehicleTypeId,
    startDatetime: new Date(draft.startDatetime).toISOString(),
    endDatetime: new Date(draft.endDatetime).toISOString(),
    passengerCount: draft.passengerCount,
    routePlaceIds: tripPlaceIds(draft),
    notes: bookingNotes(draft),
  };
}

export class TripRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function tripRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const timeout = AbortSignal.timeout(30_000);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  const response = await fetch(path, { ...init, signal, cache: "no-store" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 429
      ? "Too many requests. Wait a minute before trying again."
      : record(body) && typeof body.message === "string" ? body.message : "The service is unavailable. Please try again.";
    throw new TripRequestError(message, response.status);
  }
  return body;
}
