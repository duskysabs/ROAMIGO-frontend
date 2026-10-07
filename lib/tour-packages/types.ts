export type TourPackageStop = {
  sequenceNumber: number;
  stopType: string;
  locationName: string;
  activity: string | null;
  formattedAddress: string;
  latitude: string;
  longitude: string;
  plannedStopMinutes: number;
};

export type TourPackage = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  stops: TourPackageStop[];
  heroImage: { path: string; alt: string };
  gallery: { path: string; alt: string }[];
};

export type VehicleType = {
  id: string;
  name: string;
  maximumPassengerCapacity: number;
};

export type BookingDraft = {
  travelDate: string;
  preferredStartTime: string;
  pickupLocation: string;
  specialRequests: string;
  passengerCount: number | null;
  vehicleTypeId: string;
};

export type BookingErrors = Record<string, string>;
export type BookingWizardStep = "customize" | "review" | "submitted";

export type BookingQuote = {
  quoteId: string;
  currency: string;
  totalDistanceKm: string;
  estimatedDurationMinutes: number;
  finalQuotedPrice: string;
  expiresAt: string;
};

export type SubmittedBooking = {
  id: string;
  bookingStatus: string;
};

export function createEmptyBookingDraft(): BookingDraft {
  return {
    travelDate: "",
    preferredStartTime: "",
    pickupLocation: "",
    specialRequests: "",
    passengerCount: 1,
    vehicleTypeId: "",
  };
}
