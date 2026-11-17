export const STAFF_BOOKING_REVIEW_PATH = "/api/staff/booking-reviews";

export type StaffBookingReviewCustomer = {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
};

export type StaffBookingReviewVehicleType = {
  id: string;
  vehicleType: string;
};

export type OutsourcedDetails = {
  id: string;
  vehicleProvider: string;
  vehicleModel: string;
  plateNumber: string;
  driverName: string;
  driverContact: string;
  agreedCost: number;
  recordedAt: string;
};

export type StaffBookingReviewSummary = {
  id: string;
  bookingType: string;
  startDatetime: string;
  endDatetime: string;
  passengerCount: number;
  finalQuotedPrice: number;
  createdAt: string;
  customer: StaffBookingReviewCustomer;
  vehicleType: StaffBookingReviewVehicleType;
  outsourcedDetails: OutsourcedDetails | null;
};

export type StaffBookingReviewStop = {
  id: string;
  sequenceNumber: number;
  stopType: string;
  locationName: string;
  formattedAddress: string;
  activity: string | null;
  plannedStopMinutes: number | null;
};

export type StaffBookingReviewDetail = StaffBookingReviewSummary & {
  bookingStatus: string;
  notes: string | null;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  tourPackage: { id: string; packageName: string } | null;
  stops: StaffBookingReviewStop[];
};

export type OutsourcedDetailsInput = {
  vehicleProvider: string;
  vehicleModel: string;
  plateNumber: string;
  driverName: string;
  driverContact: string;
  agreedCost: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNullableString(value: unknown): string | null {
  return value === null || value === undefined
    ? null
    : typeof value === "string"
      ? value
      : null;
}

function readNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) ? number : null;
}

function readDateString(value: unknown): string | null {
  const string = readString(value);
  return string && Number.isFinite(Date.parse(string)) ? string : null;
}

function parseCustomer(value: unknown): StaffBookingReviewCustomer | null {
  if (!isRecord(value)) return null;
  const userId = readString(value.userId);
  const firstName = readString(value.firstName);
  const lastName = readString(value.lastName);
  const phoneNumber = readNullableString(value.phoneNumber);

  return userId && firstName && lastName
    ? { userId, firstName, lastName, phoneNumber }
    : null;
}

function parseVehicleType(value: unknown): StaffBookingReviewVehicleType | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const vehicleType = readString(value.vehicleType);
  return id && vehicleType ? { id, vehicleType } : null;
}

export function parseOutsourcedDetails(value: unknown): OutsourcedDetails | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const vehicleProvider = readString(value.vehicleProvider);
  const vehicleModel = readString(value.vehicleModel);
  const plateNumber = readString(value.plateNumber);
  const driverName = readString(value.driverName);
  const driverContact = readString(value.driverContact);
  const agreedCost = readNumber(value.agreedCost);
  const recordedAt = readDateString(value.recordedAt);

  return id && vehicleProvider && vehicleModel && plateNumber && driverName && driverContact && agreedCost !== null && recordedAt
    ? { id, vehicleProvider, vehicleModel, plateNumber, driverName, driverContact, agreedCost, recordedAt }
    : null;
}

function parseSummary(value: unknown): StaffBookingReviewSummary | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const bookingType = readString(value.bookingType);
  const startDatetime = readDateString(value.startDatetime);
  const endDatetime = readDateString(value.endDatetime);
  const passengerCount = readNumber(value.passengerCount);
  const finalQuotedPrice = readNumber(value.finalQuotedPrice);
  const createdAt = readDateString(value.createdAt);
  const customer = parseCustomer(value.customer);
  const vehicleType = parseVehicleType(value.vehicleType);
  const outsourcedDetails = value.outsourcedDetails === null
    ? null
    : parseOutsourcedDetails(value.outsourcedDetails);

  if (
    !id ||
    !bookingType ||
    !startDatetime ||
    !endDatetime ||
    passengerCount === null ||
    finalQuotedPrice === null ||
    !createdAt ||
    !customer ||
    !vehicleType ||
    (value.outsourcedDetails !== null && !outsourcedDetails)
  ) {
    return null;
  }

  return {
    id,
    bookingType,
    startDatetime,
    endDatetime,
    passengerCount,
    finalQuotedPrice,
    createdAt,
    customer,
    vehicleType,
    outsourcedDetails,
  };
}

function parseStop(value: unknown): StaffBookingReviewStop | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const sequenceNumber = readNumber(value.sequenceNumber);
  const stopType = readString(value.stopType);
  const locationName = readString(value.locationName);
  const formattedAddress = readString(value.formattedAddress);
  const activity = readNullableString(value.activity);
  const plannedStopMinutes = value.plannedStopMinutes === null
    ? null
    : readNumber(value.plannedStopMinutes);

  return id && sequenceNumber !== null && stopType && locationName && formattedAddress
    ? { id, sequenceNumber, stopType, locationName, formattedAddress, activity, plannedStopMinutes }
    : null;
}

export function parseStaffBookingReviewList(value: unknown): StaffBookingReviewSummary[] | null {
  if (!Array.isArray(value)) return null;
  const reviews = value.map(parseSummary);
  return reviews.every((review): review is StaffBookingReviewSummary => review !== null)
    ? reviews
    : null;
}

export function parseStaffBookingReviewDetail(value: unknown): StaffBookingReviewDetail | null {
  const summary = parseSummary(value);
  if (!summary || !isRecord(value)) return null;

  const bookingStatus = readString(value.bookingStatus);
  const notes = readNullableString(value.notes);
  const totalDistanceKm = readNumber(value.totalDistanceKm);
  const estimatedDurationMinutes = readNumber(value.estimatedDurationMinutes);
  const stops = Array.isArray(value.stops) ? value.stops.map(parseStop) : null;
  const tourPackageRecord = isRecord(value.tourPackage) ? value.tourPackage : null;
  const tourPackageId = tourPackageRecord ? readString(tourPackageRecord.id) : null;
  const packageName = tourPackageRecord ? readString(tourPackageRecord.packageName) : null;
  const tourPackage = tourPackageRecord && tourPackageId && packageName
    ? { id: tourPackageId, packageName }
    : null;

  if (
    !bookingStatus ||
    totalDistanceKm === null ||
    estimatedDurationMinutes === null ||
    !stops ||
    !stops.every((stop): stop is StaffBookingReviewStop => stop !== null) ||
    (value.tourPackage !== null && !tourPackage)
  ) {
    return null;
  }

  return {
    ...summary,
    bookingStatus,
    notes,
    totalDistanceKm,
    estimatedDurationMinutes,
    tourPackage,
    stops,
  };
}

export function parseOutsourcedDetailsInput(value: unknown): OutsourcedDetailsInput | null {
  if (!isRecord(value)) return null;
  const vehicleProvider = typeof value.vehicleProvider === "string" ? value.vehicleProvider.trim() : "";
  const vehicleModel = typeof value.vehicleModel === "string" ? value.vehicleModel.trim() : "";
  const plateNumber = typeof value.plateNumber === "string" ? value.plateNumber.trim() : "";
  const driverName = typeof value.driverName === "string" ? value.driverName.trim() : "";
  const driverContact = typeof value.driverContact === "string" ? value.driverContact.trim() : "";
  const agreedCost = readNumber(value.agreedCost);

  if (
    !vehicleProvider || vehicleProvider.length > 150 ||
    !vehicleModel || vehicleModel.length > 150 ||
    !plateNumber || plateNumber.length > 30 ||
    !driverName || driverName.length > 150 ||
    !driverContact || driverContact.length > 100 ||
    agreedCost === null || agreedCost < 0 || Math.abs(Math.round(agreedCost * 100) - agreedCost * 100) > 1e-8
  ) {
    return null;
  }

  return { vehicleProvider, vehicleModel, plateNumber, driverName, driverContact, agreedCost };
}

export function formatBookingType(value: string): string {
  return value === "TOUR_PACKAGE" ? "Tour Package" : value === "CUSTOM_TRIP" ? "Custom Trip" : value.replaceAll("_", " ");
}

export function formatVehicleType(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

export function customerName(customer: StaffBookingReviewCustomer): string {
  return `${customer.firstName} ${customer.lastName}`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}
