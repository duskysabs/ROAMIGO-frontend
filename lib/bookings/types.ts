export type TripLocation = {
  placeId: string;
  locationName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export type TripStopDraft = {
  id: string;
  searchText: string;
  location: TripLocation | null;
  activity: string;
  plannedStopMinutes: number | null;
};

export type CustomTripDraft = {
  startDatetime: string;
  endDatetime: string;
  passengerCount: number | null;
  vehicleTypeId: string;
  pickup: TripStopDraft;
  additionalStops: TripStopDraft[];
  dropoff: TripStopDraft;
  notes: string;
};

export type VehicleTypeOption = { id: string; name: string; maximumPassengerCapacity: number };
export type TripStep = "details" | "route" | "review";
export type TripErrors = Record<string, string>;

export function createTripStop(id: string): TripStopDraft {
  return { id, searchText: "", location: null, activity: "", plannedStopMinutes: null };
}

export function createEmptyTripDraft(): CustomTripDraft {
  return {
    startDatetime: "",
    endDatetime: "",
    passengerCount: 1,
    vehicleTypeId: "",
    pickup: createTripStop("pickup"),
    additionalStops: [],
    dropoff: createTripStop("dropoff"),
    notes: "",
  };
}
