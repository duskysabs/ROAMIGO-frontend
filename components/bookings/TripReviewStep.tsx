import Button from "@/components/ui/button";
import type { CustomTripDraft, TripStep, VehicleTypeOption } from "@/lib/bookings/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function TripReviewStep({ draft, vehicleTypes, onEdit, disabled = false }: {
  draft: CustomTripDraft;
  vehicleTypes: readonly VehicleTypeOption[];
  onEdit: (step: Exclude<TripStep, "review">) => void;
  disabled?: boolean;
}) {
  const stops = [draft.pickup, ...draft.additionalStops, draft.dropoff];
  const category = vehicleTypes.find((type) => type.id === draft.vehicleTypeId);
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">Trip details</h3>
          <Button type="button" disabled={disabled} variant="outline" className="min-h-11 px-4 py-2 text-sm" onClick={() => onEdit("details")}>Edit details</Button>
        </div>
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
          {[
            ["Departure", formatDate(draft.startDatetime)],
            ["End", formatDate(draft.endDatetime)],
            ["Passengers", String(draft.passengerCount)],
            ["Vehicle category", category?.name ?? "Selection pending"],
          ].map(([label, value]) => (
            <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>
          ))}
        </dl>
      </section>
      <section className="rounded-xl border border-border p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">Your route</h3>
          <Button type="button" disabled={disabled} variant="outline" className="min-h-11 px-4 py-2 text-sm" onClick={() => onEdit("route")}>Edit route</Button>
        </div>
        <ol className="mt-5 space-y-5">
          {stops.map((stop, index) => (
            <li key={stop.id} className="flex gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-warm text-sm font-semibold text-primary">{index + 1}</span>
              <div className="min-w-0 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{index === 0 ? "Pickup" : index === stops.length - 1 ? "Drop-off" : `Stop ${index}`}</p>
                <p className="mt-1 break-words font-medium">{stop.location?.formattedAddress ?? stop.searchText.trim()}</p>
                {stop.activity.trim() && <p className="mt-1 break-words text-muted-foreground">{stop.activity}</p>}
                {stop.plannedStopMinutes !== null && <p className="mt-1 text-muted-foreground">{stop.plannedStopMinutes} minutes</p>}
                {!stop.location && <p className="mt-1 text-xs text-muted-foreground">Location verification pending</p>}
              </div>
            </li>
          ))}
        </ol>
        {draft.notes.trim() && <div className="mt-5 border-t border-border pt-4 text-sm"><p className="font-semibold">Notes</p><p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">{draft.notes}</p></div>}
      </section>
      <aside role="status" className="rounded-xl border border-primary/20 bg-surface-warm p-5 text-sm">
        <p className="font-semibold">Before you submit</p>
        <p className="mt-2 leading-relaxed text-muted-foreground">A quote does not reserve a vehicle or driver. Payment and final assignment are handled separately after submission.</p>
      </aside>
    </div>
  );
}
