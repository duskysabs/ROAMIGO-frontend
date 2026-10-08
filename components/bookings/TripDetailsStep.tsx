import TripDateTimeRow from "./TripDateTimeRow";
import PassengerCounter from "./PassengerCounter";
import type { CustomTripDraft, TripErrors, VehicleTypeOption } from "@/lib/bookings/types";
import { earliestBookingDateValue } from "@/lib/bookings/schedule";

const vehicleCategories = ["SEDAN", "SUV", "VAN", "MINIBUS"] as const;

const vehicleCategoryLabels: Record<(typeof vehicleCategories)[number], string> = {
  SEDAN: "Sedan",
  SUV: "SUV",
  VAN: "Van",
  MINIBUS: "Minibus",
};

function vehicleCategoryLabel(value: string) {
  const category = value.toUpperCase();

  if (category in vehicleCategoryLabels) {
    return vehicleCategoryLabels[category as keyof typeof vehicleCategoryLabels];
  }

  return value;
}

export default function TripDetailsStep({ draft, errors, vehicleTypes, onChange }: {
  draft: CustomTripDraft;
  errors: TripErrors;
  vehicleTypes: readonly VehicleTypeOption[];
  onChange: (draft: CustomTripDraft) => void;
}) {
  const minimumBookingDate = earliestBookingDateValue();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <TripDateTimeRow
          id="startDatetime"
          label="Departure"
          value={draft.startDatetime}
          minDate={minimumBookingDate}
          error={errors.startDatetime}
          onChange={(startDatetime) => onChange({ ...draft, startDatetime })}
        />
        <TripDateTimeRow
          id="endDatetime"
          label="Return"
          value={draft.endDatetime}
          minDate={draft.startDatetime.split("T")[0] || minimumBookingDate}
          error={errors.endDatetime}
          onChange={(endDatetime) => onChange({ ...draft, endDatetime })}
        />
      </div>
      <div className="grid items-start gap-6">
        <PassengerCounter value={draft.passengerCount ?? 1} error={errors.passengerCount}
          onChange={(passengerCount) => onChange({ ...draft, passengerCount })} />
        <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              Vehicle category
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2" role="radiogroup">
              {vehicleCategories.map((category) => {
                const type = vehicleTypes.find(
                  (option) => option.name.toUpperCase() === category,
                );
                const selected = type
                  ? draft.vehicleTypeId === type.id
                  : false;

                if (!type) {
                  return (
                    <div
                      key={category}
                      aria-disabled="true"
                      className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-border bg-surface-warm/50 p-3 text-left opacity-70"
                    >
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 64 40"
                          className="h-9 w-14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 26h44l-3-11a5 5 0 0 0-5-4H25a7 7 0 0 0-6 3l-6 9-3 3Z" />
                          <path d="M20 15h25l3 11H13" />
                          <circle cx="20" cy="29" r="5" />
                          <circle cx="46" cy="29" r="5" />
                        </svg>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">
                          {vehicleCategoryLabel(category)}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Unavailable
                        </span>
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-describedby={
                      errors.vehicleTypeId ? "vehicleTypeId-error" : undefined
                    }
                    onClick={() =>
                      onChange({ ...draft, vehicleTypeId: type.id })
                    }
                    className={`flex min-h-24 w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? "border-primary bg-surface-warm ring-2 ring-primary/15" : "border-border bg-background hover:border-primary/50"}`}
                  >
                    <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-warm text-primary">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 64 40"
                        className="h-9 w-14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 26h44l-3-11a5 5 0 0 0-5-4H25a7 7 0 0 0-6 3l-6 9-3 3Z" />
                        <path d="M20 15h25l3 11H13" />
                        <circle cx="20" cy="29" r="5" />
                        <circle cx="46" cy="29" r="5" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">
                        {vehicleCategoryLabel(type.name)}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Up to {type.maximumPassengerCapacity} passengers
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary" : "border-border"}`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.vehicleTypeId && (
              <p id="vehicleTypeId-error" className="mt-2 text-sm text-red-800">
                {errors.vehicleTypeId}
              </p>
            )}
        </fieldset>
      </div>
      <p className="text-sm text-muted-foreground">Bookings start from tomorrow and remain subject to availability and confirmation. Times use your device&apos;s local time zone.</p>
    </div>
  );
}
