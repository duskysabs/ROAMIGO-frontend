import type { VehicleType } from "./types";

export const vehicleTypes: VehicleType[] = [
  { id: "sedan", name: "Sedan", capacity: 4, priceModifier: 0 },
  { id: "mpv", name: "MPV", capacity: 7, priceModifier: 500 },
  { id: "van", name: "Hiace Van", capacity: 12, priceModifier: 1000 },
  { id: "coaster", name: "Coaster", capacity: 28, priceModifier: 2500 },
];

export function getEligibleVehicles(
  passengerCount: number,
  vehicles: readonly VehicleType[] = vehicleTypes,
): VehicleType[] {
  const eligible = vehicles.filter(
    (vehicle) => vehicle.capacity >= passengerCount,
  );

  return eligible.length
    ? eligible.sort((left, right) => left.priceModifier - right.priceModifier)
    : [...vehicles].sort((left, right) => right.capacity - left.capacity);
}

export function getRecommendedVehicle(
  passengerCount: number,
  vehicles: readonly VehicleType[] = vehicleTypes,
): VehicleType {
  return getEligibleVehicles(passengerCount, vehicles)[0];
}

export function getVehicleType(
  id: string,
  vehicles: readonly VehicleType[] = vehicleTypes,
): VehicleType | undefined {
  return vehicles.find((vehicle) => vehicle.id === id);
}
