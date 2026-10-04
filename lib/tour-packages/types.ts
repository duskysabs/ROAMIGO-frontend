export type TourPackage = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  heroImage: { path: string; alt: string };
  itinerary: string[];
  inclusions: string[];
  duration: string;
  pricePerPerson: number;
  maxPassengers: number;
};

export type TourPackageBookingDraft = {
  startDatetime: string;
  passengerCount: number | null;
};

export type TourPackageBookingErrors = Record<string, string>;
export type TourPackageBookingStep = "details" | "review" | "confirmation";

export function createEmptyBookingDraft(): TourPackageBookingDraft {
  return { startDatetime: "", passengerCount: 1 };
}
