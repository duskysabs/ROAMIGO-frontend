import "server-only";

import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { getPackageImages } from "@/lib/tour-packages/data";
import type {
  TourPackage,
  TourPackageStop,
  VehicleType,
} from "@/lib/tour-packages/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function parseStop(value: unknown): TourPackageStop | null {
  const record = asRecord(value);
  if (!record) return null;

  const sequenceNumber = Number(record.sequenceNumber);
  const plannedStopMinutes = Number(record.plannedStopMinutes);
  if (
    !Number.isFinite(sequenceNumber) ||
    typeof record.stopType !== "string" ||
    typeof record.locationName !== "string" ||
    typeof record.formattedAddress !== "string" ||
    typeof record.latitude !== "string" ||
    typeof record.longitude !== "string"
  ) {
    return null;
  }

  return {
    sequenceNumber,
    stopType: record.stopType,
    locationName: record.locationName,
    activity: typeof record.activity === "string" ? record.activity : null,
    formattedAddress: record.formattedAddress,
    latitude: record.latitude,
    longitude: record.longitude,
    plannedStopMinutes: Number.isFinite(plannedStopMinutes)
      ? plannedStopMinutes
      : 0,
  };
}

function parseTourPackage(value: unknown): TourPackage | null {
  const record = asRecord(value);
  if (!record || !Array.isArray(record.stops)) return null;

  const basePrice = Number(record.basePrice);
  const estimatedDurationMinutes = Number(record.estimatedDurationMinutes);
  const stops = record.stops.map(parseStop);
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.description !== "string" ||
    !Number.isFinite(basePrice) ||
    !Number.isFinite(estimatedDurationMinutes) ||
    stops.some((stop) => !stop)
  ) {
    return null;
  }

  const imageIndex = [...record.id].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const gallery = getPackageImages(imageIndex);
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    basePrice,
    estimatedDurationMinutes,
    stops: stops as TourPackageStop[],
    heroImage: gallery[0],
    gallery: [...gallery],
  };
}

function parseVehicleType(value: unknown): VehicleType | null {
  const record = asRecord(value);
  if (!record) return null;

  const maximumPassengerCapacity = Number(record.maximumPassengerCapacity);
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    !Number.isFinite(maximumPassengerCapacity)
  ) {
    return null;
  }

  return { id: record.id, name: record.name, maximumPassengerCapacity };
}

export async function getTourPackages(): Promise<TourPackage[]> {
  const response = await backendRequest<unknown>("tour-packages");
  if (!Array.isArray(response)) {
    throw new BackendRequestError("Invalid tour package response.", 502, response);
  }

  const packages = response.map(parseTourPackage);
  if (packages.some((tourPackage) => !tourPackage)) {
    throw new BackendRequestError("Invalid tour package response.", 502, response);
  }

  return packages as TourPackage[];
}

export async function getTourPackage(id: string): Promise<TourPackage> {
  const response = await backendRequest<unknown>(
    "tour-packages/" + encodeURIComponent(id),
  );
  const tourPackage = parseTourPackage(response);
  if (!tourPackage) {
    throw new BackendRequestError("Invalid tour package response.", 502, response);
  }
  return tourPackage;
}

export async function getVehicleTypes(): Promise<VehicleType[]> {
  const response = await backendRequest<unknown>("booking-options/vehicle-types");
  if (!Array.isArray(response)) {
    throw new BackendRequestError("Invalid vehicle type response.", 502, response);
  }

  const vehicleTypes = response.map(parseVehicleType);
  if (vehicleTypes.some((vehicleType) => !vehicleType)) {
    throw new BackendRequestError("Invalid vehicle type response.", 502, response);
  }

  return vehicleTypes as VehicleType[];
}
