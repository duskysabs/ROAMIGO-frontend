import { formatCurrency } from "@/lib/bookings/display";
import { calculateTripCost } from "@/lib/tour-packages/pricing";
import type { TourPackage, VehicleType } from "@/lib/tour-packages/types";

export default function TripCostSummary({
  tourPackage,
  passengerCount,
  vehicle,
}: {
  tourPackage: TourPackage;
  passengerCount: number | null;
  vehicle: VehicleType | null;
}) {
  const cost =
    passengerCount && vehicle
      ? calculateTripCost(tourPackage, passengerCount, vehicle)
      : null;

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
        Trip Cost
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Base Package</dt>
          <dd className="font-medium text-foreground">
            {cost ? formatCurrency(cost.base) : "-"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Assigned Vehicle</dt>
          <dd className="font-medium text-foreground">
            {cost ? formatCurrency(cost.vehicleModifier) : "-"}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-surface-warm px-4 py-3">
        <p className="font-bold text-foreground">Total Price</p>
        <p className="text-lg font-bold text-foreground">
          {cost ? formatCurrency(cost.total) : "-"}
        </p>
      </div>
    </div>
  );
}
