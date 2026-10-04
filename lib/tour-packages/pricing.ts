import type { TourPackage, VehicleType } from "./types";

export type TripCost = {
  base: number;
  vehicleModifier: number;
  total: number;
};

export function calculateTripCost(
  tourPackage: TourPackage,
  passengerCount: number,
  vehicle: VehicleType,
): TripCost {
  const base = tourPackage.pricePerPerson * passengerCount;
  const vehicleModifier = vehicle.priceModifier;

  return { base, vehicleModifier, total: base + vehicleModifier };
}
