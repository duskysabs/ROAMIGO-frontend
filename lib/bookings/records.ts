import { isRecord } from "@/lib/auth/types";

export type BookingStop = {
  id: string;
  sequenceNumber: number;
  stopType: string;
  locationName: string;
  formattedAddress: string;
  activity: string | null;
  plannedStopMinutes: number | null;
};

export type BookingPayment = {
  id: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
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
  notes: string | null;
  createdAt: string;
  vehicleType: { id: string; name: string };
  tourPackage: { id: string; name: string } | null;
  stops: BookingStop[];
  assignmentStatus: string | null;
  payments: BookingPayment[];
  receivable: {
    amountDue: number;
    amountPaid: number;
    outstandingBalance: number;
    dueDate: string;
    status: string;
  } | null;
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

function optionalDateString(value: unknown): string | null {
  return value === null || value === undefined
    ? null
    : requiredDateString(value);
}

function numberValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Expected a number.");
  }

  return parsed;
}

function optionalNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : numberValue(value);
}

function parseStop(value: unknown): BookingStop {
  if (!isRecord(value)) {
    throw new Error("Invalid booking stop.");
  }

  return {
    id: requiredString(value.id),
    sequenceNumber: numberValue(value.sequenceNumber),
    stopType: requiredString(value.stopType),
    locationName: requiredString(value.locationName),
    formattedAddress: requiredString(value.formattedAddress),
    activity: optionalString(value.activity),
    plannedStopMinutes: optionalNumber(value.plannedStopMinutes),
  };
}

function parsePayment(value: unknown): BookingPayment {
  if (!isRecord(value)) {
    throw new Error("Invalid booking payment.");
  }

  return {
    id: requiredString(value.id),
    paymentStatus: requiredString(value.paymentStatus),
    paymentMethod: requiredString(value.paymentMethod),
    amount: numberValue(value.amount),
    currency:
      optionalString(value.currency)?.toUpperCase().match(/^[A-Z]{3}$/)?.[0] ??
      "PHP",
    paidAt: optionalDateString(value.paidAt),
    createdAt: requiredDateString(value.createdAt),
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
          name: requiredString(value.tourPackage.packageName),
        }
      : null;
    const assignments = Array.isArray(value.assignments)
      ? value.assignments
      : [];
    const latestAssignment = assignments.find(isRecord);
    const payments = Array.isArray(value.payments)
      ? value.payments
          .map(parsePayment)
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          )
      : [];
    const receivable = isRecord(value.receivable)
      ? {
          amountDue: numberValue(value.receivable.amountDue),
          amountPaid: numberValue(value.receivable.amountPaid),
          outstandingBalance: numberValue(
            value.receivable.outstandingBalance,
          ),
          dueDate: requiredDateString(value.receivable.dueDate),
          status: requiredString(value.receivable.receivableStatus),
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
      notes: optionalString(value.notes),
      createdAt: requiredDateString(value.createdAt),
      vehicleType: {
        id: requiredString(value.vehicleType.id),
        name: requiredString(value.vehicleType.vehicleType),
      },
      tourPackage,
      stops: Array.isArray(value.stops)
        ? value.stops.map(parseStop).sort(
            (left, right) => left.sequenceNumber - right.sequenceNumber,
          )
        : [],
      assignmentStatus: latestAssignment
        ? optionalString(latestAssignment.assignmentStatus)
        : null,
      payments,
      receivable,
    };
  } catch {
    return null;
  }
}

export function parseBookingList(value: unknown): BookingRecord[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const bookings = value.map(parseBookingRecord);
  return bookings.every((booking): booking is BookingRecord => booking !== null)
    ? bookings
    : null;
}
