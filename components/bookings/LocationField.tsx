import type { TripStopDraft } from "@/lib/bookings/types";
import TripField, { tripInputClass } from "./TripField";

export default function LocationField({ stop, label, placeholder = "Search for a place or enter an address", error, onChange }: {
  stop: TripStopDraft;
  label: string;
  placeholder?: string;
  error?: string;
  onChange: (stop: TripStopDraft) => void;
}) {
  return (
    <TripField id={stop.id} label={label} error={error}>
      <input id={stop.id} type="text" required maxLength={255} value={stop.searchText}
        placeholder={placeholder} aria-invalid={Boolean(error)}
        aria-describedby={error ? `${stop.id}-error` : undefined}
        onChange={(event) => onChange({ ...stop, searchText: event.target.value, location: null })}
        className={tripInputClass} />
    </TripField>
  );
}
