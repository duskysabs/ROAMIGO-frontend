import VehicleIcon from "./VehicleIcon";
import type { VehicleType } from "@/lib/tour-packages/types";

export default function AssignedVehicle({ vehicle }: { vehicle: VehicleType }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Assigned Vehicle</p>
      <div className="mt-3 flex items-start gap-4 rounded-xl border border-primary/20 bg-surface-warm p-4">
        <VehicleIcon className="h-10 w-10 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{vehicle.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatically assigned based on your passenger count and route
            requirements. Seats up to {vehicle.capacity}.
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
        Vehicles are assigned for capacity, route suitability, and
        availability — no manual selection needed.
      </p>
    </div>
  );
}
