import TripField, { tripInputClass } from "./TripField";
import TripDateTimeRow from "./TripDateTimeRow";
import PassengerCounter from "./PassengerCounter";
import type { CustomTripDraft, TripErrors, VehicleTypeOption } from "@/lib/bookings/types";

export default function TripDetailsStep({ draft, errors, vehicleTypes, onChange }: {
  draft: CustomTripDraft;
  errors: TripErrors;
  vehicleTypes: readonly VehicleTypeOption[];
  onChange: (draft: CustomTripDraft) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <TripDateTimeRow
          id="startDatetime"
          label="Departure"
          value={draft.startDatetime}
          error={errors.startDatetime}
          onChange={(startDatetime) => onChange({ ...draft, startDatetime })}
        />
        <TripDateTimeRow
          id="endDatetime"
          label="Return"
          value={draft.endDatetime}
          minDate={draft.startDatetime.split("T")[0]}
          error={errors.endDatetime}
          onChange={(endDatetime) => onChange({ ...draft, endDatetime })}
        />
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-2">
        <PassengerCounter value={draft.passengerCount ?? 1} error={errors.passengerCount}
          onChange={(passengerCount) => onChange({ ...draft, passengerCount })} />
        {vehicleTypes.length ? (
          <TripField id="vehicleTypeId" label="Vehicle category" error={errors.vehicleTypeId}>
            <select id="vehicleTypeId" value={draft.vehicleTypeId}
              aria-invalid={Boolean(errors.vehicleTypeId)}
              aria-describedby={errors.vehicleTypeId ? "vehicleTypeId-error" : undefined}
              onChange={(event) => onChange({ ...draft, vehicleTypeId: event.target.value })} className={tripInputClass}>
              <option value="">Select a category</option>
              {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </TripField>
        ) : (
          <div>
            <p className="text-sm font-semibold text-foreground">Vehicle category</p>
            <p id="vehicle-unavailable" role="status" className="mt-2 flex min-h-12 items-center rounded-xl border border-primary/15 bg-surface-warm px-4 text-sm text-muted-foreground">Vehicle selection coming soon</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">Times use your device&apos;s local time zone. A professional driver is included.</p>
    </div>
  );
}
