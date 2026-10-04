export type TourPackage = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  heroImage: { path: string; alt: string };
  gallery: { path: string; alt: string }[];
  routeStops: string[];
  inclusions: string[];
  duration: string;
  pricePerPerson: number;
  maxPassengers: number;
};

export type VehicleType = {
  id: string;
  name: string;
  capacity: number;
  priceModifier: number;
};

export type BookingDraft = {
  travelDate: string;
  preferredStartTime: string;
  pickupLocation: string;
  specialRequests: string;
  passengerCount: number | null;
  vehicleId: string;
};

export type BookingErrors = Record<string, string>;

export type BookingWizardStep =
  | "customize"
  | "review"
  | "payment-select"
  | "payment-qr"
  | "verifying"
  | "verified";

export function createEmptyBookingDraft(): BookingDraft {
  return {
    travelDate: "",
    preferredStartTime: "",
    pickupLocation: "",
    specialRequests: "",
    passengerCount: 1,
    vehicleId: "",
  };
}
