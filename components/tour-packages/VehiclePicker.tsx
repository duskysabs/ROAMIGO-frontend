"use client";

import VehicleIcon from "./VehicleIcon";
import { getEligibleVehicles, getRecommendedVehicle } from "@/lib/tour-packages/vehicles";

export default function VehiclePicker({
  passengerCount,
  selectedVehicleId,
  onSelect,
}: {
  passengerCount: number;
  selectedVehicleId: string;
  onSelect: (id: string) => void;
}) {
  const eligible = getEligibleVehicles(passengerCount);
  const recommended = getRecommendedVehicle(passengerCount);
  const selected =
    eligible.find((vehicle) => vehicle.id === selectedVehicleId) ?? recommended;
  const others = eligible.filter((vehicle) => vehicle.id !== selected.id);

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Preferred Vehicle</p>
      <div className="mt-3 flex items-start gap-4 rounded-xl border-2 border-primary bg-surface-warm p-4">
        <VehicleIcon className="h-10 w-10 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {selected.id === recommended.id && (
              <span className="rounded-full bg-success-surface px-2 py-0.5 text-xs font-semibold text-success">
                Recommended
              </span>
            )}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Selected
            </span>
          </div>
          <p className="mt-1 font-bold text-foreground">{selected.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recommended for route conditions, group size, and trip duration.
            Seats up to {selected.capacity}.
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">
            Other Eligible Vehicles
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {others.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                aria-pressed={false}
                onClick={() => onSelect(vehicle.id)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <VehicleIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {vehicle.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
        Options are filtered for capacity, route suitability, and
        availability.
      </p>
    </div>
  );
}
