"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import PassengerCounter from "@/components/bookings/PassengerCounter";
import TripDatePicker from "@/components/bookings/TripDatePicker";
import TripTimePicker from "@/components/bookings/TripTimePicker";
import AssignedVehicle from "@/components/tour-packages/AssignedVehicle";
import BookingStepper from "@/components/tour-packages/BookingStepper";
import TripCostSummary from "@/components/tour-packages/TripCostSummary";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/bookings/display";
import { calculateTripCost } from "@/lib/tour-packages/pricing";
import {
  createEmptyBookingDraft,
  type BookingDraft,
  type BookingErrors,
  type BookingWizardStep,
  type TourPackage,
} from "@/lib/tour-packages/types";
import { validateBookingDetails } from "@/lib/tour-packages/validation";
import { getRecommendedVehicle } from "@/lib/tour-packages/vehicles";

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
  // The vehicle is always derived from passenger count — there is no
  // user-facing "choose a vehicle" step, so nothing needs to be stored.
  const assignedVehicle = getRecommendedVehicle(draft.passengerCount ?? 1);
  const cost = calculateTripCost(tourPackage, draft.passengerCount ?? 1, assignedVehicle);
  const [bookingReference] = useState(
    () => `TP-${Date.now().toString(36).toUpperCase()}`,
  );

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
              <AssignedVehicle vehicle={assignedVehicle} />
            </div>

            <TripCostSummary
              tourPackage={tourPackage}
              passengerCount={draft.passengerCount}
              vehicle={assignedVehicle}
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

  if (step === "review") {
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
            <AssignedVehicle vehicle={assignedVehicle} />
          </div>
          <TripCostSummary
            tourPackage={tourPackage}
            passengerCount={draft.passengerCount}
            vehicle={assignedVehicle}
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

  if (step === "payment-select") {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          Payment
        </h1>
        <p className="mt-2 text-muted-foreground">Complete your payment securely.</p>
        <div className="mt-5 rounded-lg border border-success-border bg-success-surface px-4 py-3 text-sm text-success">
          Quotation approved — payment is available for this booking.
        </div>
        <div className="mt-6">
          <BookingStepper currentIndex={3} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Payment amount</h2>
              <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-primary bg-surface-warm p-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Full approved amount</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Full online payment is required for this booking.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Payment method</h2>
              <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-primary bg-surface-warm p-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Pay with QR Ph / E-Wallet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Continue to secure QR or e-wallet payment.
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
                No screenshot or receipt upload is required. ROAMIGO verifies
                the transaction automatically.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Payment Details
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Merchant", "Planet J Rent A Car"],
                  ["Booking reference", bookingReference],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-surface-warm px-4 py-3">
                <p className="font-bold text-foreground">Total Price</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(cost.total)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Before You Pay
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Confirm the amount</li>
                <li>Complete payment only through this secure page</li>
                <li>Do not share verification codes</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => setStep("review")}>
            ← Cancel and Return
          </Button>
          <Button type="button" size="lg" onClick={() => setStep("payment-qr")}>
            Open Supported E-Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (step === "payment-qr") {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          Pay with QR Ph / E-Wallet
        </h1>
        <p className="mt-2 text-muted-foreground">Complete your payment securely.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-background p-6 text-center">
            <h2 className="text-lg font-bold tracking-tight">Scan to pay</h2>
            <div
              aria-hidden="true"
              className="mx-auto mt-5 grid aspect-square w-48 grid-cols-6 gap-1 rounded-xl border border-border bg-background p-4"
            >
              {Array.from({ length: 36 }, (_, index) => (
                <span
                  key={index}
                  className={(index * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              [Dynamic QR Ph code]
            </p>
            <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
              Scan the QR Ph code using a supported banking or e-wallet
              application. The booking status will update after the payment
              provider confirms the transaction.
            </p>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Payment Details
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Merchant", "Planet J Rent A Car"],
                  ["Booking reference", bookingReference],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-surface-warm px-4 py-3">
                <p className="font-bold text-foreground">Total Price</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(cost.total)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Before You Pay
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Confirm the amount</li>
                <li>Complete payment only through this secure page</li>
                <li>Do not share verification codes</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => setStep("review")}>
            ← Cancel and Return
          </Button>
          <Button type="button" size="lg" onClick={() => setStep("verifying")}>
            Open Supported E-Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (step === "verifying") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          Verifying Payment
        </h1>
        <div className="mt-8 rounded-2xl border border-border bg-background p-8">
          <span
            aria-hidden="true"
            className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
          />
          <p className="mt-5 font-semibold text-foreground">
            Your payment was received and is being verified automatically.
          </p>
          <dl className="mt-6 grid gap-4 text-left text-sm sm:grid-cols-2">
            {[
              ["Booking status", "Awaiting Payment"],
              ["Payment status", "Processing"],
              ["Booking reference", bookingReference],
              ["Amount submitted", formatCurrency(cost.total)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
            Please do not resubmit another payment. This page will update
            after the payment provider confirms the transaction.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            You may safely return to My Bookings while verification continues.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button href="/my-bookings" variant="outline" size="lg">
              ← Back to My Bookings
            </Button>
            <Button type="button" size="lg" onClick={() => setStep("verified")}>
              Check Payment Status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // step === "verified"
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-success-border bg-success-surface p-6 sm:p-8">
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold text-success outline-none">
        Booking confirmed
      </h1>
      <p className="mt-2 text-success">
        Your payment was verified and your tour package booking is confirmed.
      </p>
      <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
        {[
          ["Package", tourPackage.title],
          ["Booking reference", bookingReference],
          ["Travel date", formatTravelDate(draft.travelDate)],
          ["Passengers", String(draft.passengerCount ?? "")],
          ["Vehicle", assignedVehicle.name],
          ["Total paid", formatCurrency(cost.total)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <Button href="/tour-packages" variant="outline" className="mt-7">
        Browse more packages
      </Button>
    </div>
  );
}
