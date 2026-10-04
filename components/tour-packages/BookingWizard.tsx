"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import PassengerCounter from "@/components/bookings/PassengerCounter";
import TripDatePicker from "@/components/bookings/TripDatePicker";
import TripTimePicker from "@/components/bookings/TripTimePicker";
import BookingStepper from "@/components/tour-packages/BookingStepper";
import TripCostSummary from "@/components/tour-packages/TripCostSummary";
import VehiclePicker from "@/components/tour-packages/VehiclePicker";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import {
  createEmptyBookingDraft,
  type BookingDraft,
  type BookingErrors,
  type BookingWizardStep,
  type TourPackage,
} from "@/lib/tour-packages/types";
import { validateBookingDetails } from "@/lib/tour-packages/validation";
import { getRecommendedVehicle, getVehicleType } from "@/lib/tour-packages/vehicles";

function formatTravelDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

function formatPreferredTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function BookingWizard({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  const [step, setStep] = useState<BookingWizardStep>("customize");
  const [draft, setDraft] = useState<BookingDraft>(createEmptyBookingDraft);
  const [errors, setErrors] = useState<BookingErrors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const selectedVehicle = draft.vehicleId ? getVehicleType(draft.vehicleId) ?? null : null;

  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  function handleCustomizeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detailErrors = validateBookingDetails(draft, tourPackage);
    setErrors(detailErrors);
    if (Object.keys(detailErrors).length) return;

    if (!draft.vehicleId) {
      const recommended = getRecommendedVehicle(draft.passengerCount ?? 1);
      setDraft({ ...draft, vehicleId: recommended.id });
    }
    setStep("review");
  }

  if (step === "customize") {
    return (
      <div className="mx-auto max-w-6xl">
        <BookingStepper currentIndex={1} />
        <form
          noValidate
          onSubmit={handleCustomizeSubmit}
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]"
        >
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
                Your Preferences
              </h2>
              {Object.keys(errors).length > 0 && (
                <div
                  ref={errorSummary}
                  tabIndex={-1}
                  role="alert"
                  className="mt-4 rounded-lg border border-danger-border bg-danger-surface p-4 text-sm text-danger focus:outline-2 focus:outline-danger"
                >
                  Please correct the marked fields before continuing.
                </div>
              )}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TripDatePicker
                  id="travelDate"
                  label="Travel date"
                  value={draft.travelDate}
                  invalid={Boolean(errors.travelDate)}
                  describedBy={errors.travelDate ? "travelDate-error" : undefined}
                  onChange={(travelDate) => setDraft({ ...draft, travelDate })}
                />
                <TripTimePicker
                  id="preferredStartTime"
                  label="Preferred start time"
                  value={draft.preferredStartTime}
                  invalid={Boolean(errors.preferredStartTime)}
                  onChange={(preferredStartTime) =>
                    setDraft({ ...draft, preferredStartTime })
                  }
                />
              </div>
              {errors.travelDate && (
                <p id="travelDate-error" className="mt-2 text-sm text-danger">
                  {errors.travelDate}
                </p>
              )}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <PassengerCounter
                  value={draft.passengerCount ?? 1}
                  error={errors.passengerCount}
                  onChange={(passengerCount) => setDraft({ ...draft, passengerCount })}
                />
                <FormField htmlFor="pickupLocation" label="Pickup location" error={errors.pickupLocation}>
                  <Input
                    value={draft.pickupLocation}
                    placeholder="Hotel name or address"
                    onChange={(event) =>
                      setDraft({ ...draft, pickupLocation: event.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="mt-5">
                <FormField
                  htmlFor="specialRequests"
                  label="Special requests"
                  optional
                  error={errors.specialRequests}
                >
                  <Textarea
                    value={draft.specialRequests}
                    placeholder="Tell us anything else we should know about your trip"
                    onChange={(event) =>
                      setDraft({ ...draft, specialRequests: event.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">
                Established Package Route{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (read-only)
                </span>
              </h2>
              <ol className="mt-4 space-y-3">
                {tourPackage.routeStops.map((stop, index) => (
                  <li key={stop} className="flex items-start gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary"
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-foreground">{stop}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
                The package route cannot be changed.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Selected Package
              </h2>
              <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-surface-warm">
                <Image
                  src={tourPackage.heroImage.path}
                  alt={tourPackage.heroImage.alt}
                  fill
                  sizes="320px"
                  className="object-cover object-center"
                />
              </div>
              <p className="mt-3 font-bold text-foreground">{tourPackage.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tourPackage.shortDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <VehiclePicker
                passengerCount={draft.passengerCount ?? 1}
                selectedVehicleId={draft.vehicleId}
                onSelect={(vehicleId) => setDraft({ ...draft, vehicleId })}
              />
            </div>

            <TripCostSummary
              tourPackage={tourPackage}
              passengerCount={draft.passengerCount}
              vehicle={selectedVehicle}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Continue to Review →
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // step === "review"
  const vehicleForReview = selectedVehicle ?? getRecommendedVehicle(draft.passengerCount ?? 1);

  return (
    <div className="mx-auto max-w-6xl">
      <BookingStepper currentIndex={2} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
              Selected Package
            </h2>
            <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-surface-warm sm:max-w-xs">
              <Image
                src={tourPackage.heroImage.path}
                alt={tourPackage.heroImage.alt}
                fill
                sizes="320px"
                className="object-cover object-center"
              />
            </div>
            <p className="mt-3 font-bold text-foreground">{tourPackage.title}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-foreground">
              Established Package Route (read-only)
            </h3>
            <ol className="mt-3 space-y-2">
              {tourPackage.routeStops.map((stop, index) => (
                <li key={stop} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-foreground">{stop}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-bold tracking-tight">Selected Preferences</h2>
            <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
              {[
                ["Travel date", formatTravelDate(draft.travelDate)],
                ["Passengers", String(draft.passengerCount ?? "")],
                ["Pickup location", draft.pickupLocation],
                ["Preferred start time", formatPreferredTime(draft.preferredStartTime) || "Any time"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Preferred Vehicle
            </h2>
            <p className="mt-3 font-bold text-foreground">{vehicleForReview.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recommended for route conditions, group size, and trip duration.
            </p>
          </div>
          <TripCostSummary
            tourPackage={tourPackage}
            passengerCount={draft.passengerCount}
            vehicle={vehicleForReview}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep("customize")}
          >
            Edit Preferences
          </Button>
          <Button type="button" size="lg" onClick={() => setStep("payment-select")}>
            Proceed to Payment →
          </Button>
        </div>
      </div>
    </div>
  );
}
