import { isRecord } from "@/lib/auth/types";

export type BookingStop = {
  sequenceNumber: number;
  stopType: string;
  locationName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export type BookingRecord = {
  id: string;
  bookingType: string;
  bookingStatus: string;
  startDatetime: string;
  endDatetime: string;
  passengerCount: number;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  finalQuotedPrice: number;
  createdAt: string;
  vehicleType: { id: string; name: string };
  tourPackage: { id: string; name: string } | null;
  stops: BookingStop[];
  paymentStates: string[];
  assignmentStates: string[];
  cancellationState: string | null;
  refundStates: string[];
};

export type BookingPage = {
  items: BookingRecord[];
  nextCursor: string | null;
};

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Expected a non-empty string.");
  }

  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function requiredDateString(value: unknown): string {
  const date = requiredString(value);

  if (!Number.isFinite(Date.parse(date))) {
    throw new Error("Expected a valid date.");
  }

  return date;
}

function numberValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Expected a number.");
  }

  return parsed;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected a string array.");
  }

  return value.map(requiredString);
}

function parseStop(value: unknown): BookingStop {
  if (!isRecord(value)) {
    throw new Error("Invalid booking stop.");
  }

  return {
    sequenceNumber: numberValue(value.sequenceNumber),
    stopType: requiredString(value.stopType),
    locationName: requiredString(value.locationName),
    formattedAddress: requiredString(value.formattedAddress),
    latitude: numberValue(value.latitude),
    longitude: numberValue(value.longitude),
  };
}

export function parseBookingRecord(value: unknown): BookingRecord | null {
  try {
    if (!isRecord(value) || !isRecord(value.vehicleType)) {
      return null;
    }

    const tourPackage = isRecord(value.tourPackage)
      ? {
          id: requiredString(value.tourPackage.id),
          name: requiredString(value.tourPackage.name),
        }
      : null;

    return {
      id: requiredString(value.id),
      bookingType: requiredString(value.bookingType),
      bookingStatus: requiredString(value.bookingStatus),
      startDatetime: requiredDateString(value.startDatetime),
      endDatetime: requiredDateString(value.endDatetime),
      passengerCount: numberValue(value.passengerCount),
      totalDistanceKm: numberValue(value.totalDistanceKm),
      estimatedDurationMinutes: numberValue(
        value.estimatedDurationMinutes,
      ),
      finalQuotedPrice: numberValue(value.finalQuotedPrice),
      createdAt: requiredDateString(value.createdAt),
      vehicleType: {
        id: requiredString(value.vehicleType.id),
        name: requiredString(value.vehicleType.name),
      },
      tourPackage,
      stops: Array.isArray(value.stops)
        ? value.stops.map(parseStop).sort(
            (left, right) => left.sequenceNumber - right.sequenceNumber,
          )
        : [],
      paymentStates: stringArray(value.paymentStates),
      assignmentStates: stringArray(value.assignmentStates),
      cancellationState: optionalString(value.cancellationState),
      refundStates: stringArray(value.refundStates),
    };
  } catch {
    return null;
  }
}

export function parseBookingPage(value: unknown): BookingPage | null {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return null;
  }

  const items = value.items.map(parseBookingRecord);
  if (!items.every((booking): booking is BookingRecord => booking !== null)) {
    return null;
  }

  try {
    return {
      items,
      nextCursor:
        value.nextCursor === null || value.nextCursor === undefined
          ? null
          : requiredString(value.nextCursor),
    };
  } catch {
    return null;
  }
}
