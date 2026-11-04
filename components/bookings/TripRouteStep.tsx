import Button from "@/components/ui/button";
import LocationField from "./LocationField";
import TripField, { tripInputClass } from "./TripField";
import { createTripStop, type CustomTripDraft, type TripErrors, type TripStopDraft } from "@/lib/bookings/types";

export default function TripRouteStep({ draft, errors, onChange }: {
  draft: CustomTripDraft;
  errors: TripErrors;
  onChange: (draft: CustomTripDraft) => void;
}) {
  function updateStop(updated: TripStopDraft) {
    onChange({ ...draft, additionalStops: draft.additionalStops.map((stop) => stop.id === updated.id ? updated : stop) });
  }

  return (
    <div className="space-y-7">
      <div className="relative space-y-5">
        <span aria-hidden="true" className="absolute bottom-6 left-4 top-6 w-px bg-border" />

        <div className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
          <span aria-hidden="true" className="mt-7 flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-4 ring-background">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
          </span>
          <LocationField stop={draft.pickup} label="Pickup" placeholder="Search pickup location"
            error={errors.pickup} onChange={(pickup) => onChange({ ...draft, pickup })} />
        </div>

        {draft.additionalStops.map((stop, index) => (
          <div key={stop.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
            <span aria-hidden="true" className="mt-7 flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-background text-xs font-bold text-primary ring-4 ring-background">{index + 1}</span>
            <fieldset className="rounded-xl border border-border bg-surface-warm/30 p-4 sm:p-5">
              <legend className="sr-only">Stop {index + 1}</legend>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-primary">Stop {index + 1}</p>
                <button type="button" className="text-sm font-semibold text-muted-foreground hover:text-primary"
                  aria-label={`Remove stop ${index + 1}`}
                  onClick={() => onChange({ ...draft, additionalStops: draft.additionalStops.filter((item) => item.id !== stop.id) })}>
                  Remove
                </button>
              </div>
              <div className="mt-3 space-y-4">
                <LocationField stop={stop} label="Location" placeholder="Search stop location"
                  error={errors[stop.id]} onChange={updateStop} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TripField id={`${stop.id}-activity`} label="Activity (optional)" error={errors[`${stop.id}-activity`]}>
                    <input id={`${stop.id}-activity`} maxLength={255} value={stop.activity} className={tripInputClass}
                      placeholder="What would you like to do?"
                      aria-invalid={Boolean(errors[`${stop.id}-activity`])}
                      aria-describedby={errors[`${stop.id}-activity`] ? `${stop.id}-activity-error` : undefined}
                      onChange={(event) => updateStop({ ...stop, activity: event.target.value })} />
                  </TripField>
                  <TripField id={`${stop.id}-minutes`} label="Duration (optional)" error={errors[`${stop.id}-minutes`]}>
                    <input id={`${stop.id}-minutes`} type="number" min={0} step={1} inputMode="numeric"
                      value={stop.plannedStopMinutes ?? ""} className={tripInputClass}
                      placeholder="Minutes"
                      aria-invalid={Boolean(errors[`${stop.id}-minutes`])}
                      aria-describedby={errors[`${stop.id}-minutes`] ? `${stop.id}-minutes-error` : undefined}
                      onChange={(event) => updateStop({ ...stop, plannedStopMinutes: event.target.value === "" ? null : Number(event.target.value) })} />
                  </TripField>
                </div>
              </div>
            </fieldset>
          </div>
        ))}

        <div className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
          <span aria-hidden="true" className="mt-5 h-8 w-8 bg-background ring-4 ring-background" />
          <Button type="button" variant="outline" className="min-h-11 w-fit px-5 py-2 text-sm"
            onClick={() => onChange({ ...draft, additionalStops: [...draft.additionalStops, createTripStop(crypto.randomUUID())] })}>
            + Add a stop
          </Button>
        </div>

        <div className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
          <span aria-hidden="true" className="mt-7 flex h-8 w-8 items-center justify-center rounded-full bg-foreground ring-4 ring-background">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-background" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21V4m0 1h10l-2.5 4L17 13H7" />
            </svg>
          </span>
          <LocationField stop={draft.dropoff} label="Drop-off" placeholder="Search destination"
            error={errors.dropoff} onChange={(dropoff) => onChange({ ...draft, dropoff })} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Locations will be verified before booking.</p>

      <TripField id="notes" label="Trip notes (optional)" error={errors.notes}>
        <textarea id="notes" rows={3} maxLength={2000} value={draft.notes} className={tripInputClass}
          placeholder="Add instructions, activities, or special requests"
          aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? "notes-error" : "notes-count"}
          onChange={(event) => onChange({ ...draft, notes: event.target.value })} />
        <p id="notes-count" className="mt-2 text-xs text-muted-foreground">{draft.notes.length}/2,000 characters</p>
      </TripField>
    </div>
  );
}
