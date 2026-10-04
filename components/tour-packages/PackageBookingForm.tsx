"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import PassengerCounter from "@/components/bookings/PassengerCounter";
import TripDateTimeRow from "@/components/bookings/TripDateTimeRow";
import Button from "@/components/ui/button";
import { formatBookingDateTime, formatCurrency } from "@/lib/bookings/display";
import {
  createEmptyBookingDraft,
  type TourPackage,
  type TourPackageBookingDraft,
  type TourPackageBookingErrors,
  type TourPackageBookingStep,
} from "@/lib/tour-packages/types";
import { validateTourPackageBooking } from "@/lib/tour-packages/validation";

const steps = [
  { id: "details", label: "Trip details", description: "Choose your date and group size." },
  { id: "review", label: "Review", description: "Check your booking before you send the request." },
] as const;

export default function PackageBookingForm({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  const [step, setStep] = useState<TourPackageBookingStep>("details");
  const [draft, setDraft] = useState<TourPackageBookingDraft>(createEmptyBookingDraft);
  const [errors, setErrors] = useState<TourPackageBookingErrors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const currentIndex = steps.findIndex((item) => item.id === step);
  const total = (draft.passengerCount ?? 0) * tourPackage.pricePerPerson;

  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detailErrors = validateTourPackageBooking(draft, tourPackage);
    setErrors(detailErrors);
    if (!Object.keys(detailErrors).length) setStep("review");
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("confirmation");
  }

  const summaryRows: Array<[string, string]> = [
    ["Package", tourPackage.title],
    ["Departure", draft.startDatetime ? formatBookingDateTime(draft.startDatetime) : ""],
    ["Passengers", String(draft.passengerCount ?? "")],
    ["Estimated total", formatCurrency(total)],
  ];

  if (step === "confirmation") {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-success-border bg-success-surface p-6 sm:p-8">
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold text-success outline-none">
          Booking request received
        </h2>
        <p className="mt-2 text-success">
          This is a request summary only — nothing has been charged or
          confirmed with a driver yet.
        </p>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          {summaryRows.map(([label, value]) => (
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

  const currentStep = steps[currentIndex];

  return (
    <div className="mx-auto max-w-3xl">
      <ol aria-label="Booking steps" className="mb-7 flex items-start">
        {steps.map((item, index) => (
          <li
            key={item.id}
            aria-current={step === item.id ? "step" : undefined}
            className="flex min-w-0 flex-1 items-start last:flex-none"
          >
            <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  index <= currentIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {index < currentIndex ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-sm font-semibold sm:block ${
                  step === item.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`mt-4 h-px min-w-4 flex-1 sm:mx-4 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        ))}
      </ol>
      <form
        noValidate
        onSubmit={step === "details" ? handleDetailsSubmit : handleReviewSubmit}
        className="rounded-3xl border border-primary/15 bg-background p-6 sm:p-8"
      >
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          {currentStep.label}
        </h2>
        <p className="mt-2 mb-7 text-muted-foreground">{currentStep.description}</p>
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummary}
            tabIndex={-1}
            role="alert"
            className="mb-6 rounded-lg border border-danger-border bg-danger-surface p-4 text-sm text-danger focus:outline-2 focus:outline-danger"
          >
            Please correct the marked fields before continuing.
          </div>
        )}
        {step === "details" && (
          <div className="space-y-6">
            <TripDateTimeRow
              id="startDatetime"
              label="Departure"
              value={draft.startDatetime}
              error={errors.startDatetime}
              onChange={(startDatetime) => setDraft({ ...draft, startDatetime })}
            />
            <PassengerCounter
              value={draft.passengerCount ?? 1}
              error={errors.passengerCount}
              onChange={(passengerCount) => setDraft({ ...draft, passengerCount })}
            />
            <p className="text-sm text-muted-foreground">
              This package allows up to {tourPackage.maxPassengers} passengers.
              A professional driver is included.
            </p>
          </div>
        )}
        {step === "review" && (
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            {summaryRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div
          className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${
            step === "review" ? "sm:justify-between" : "sm:justify-end"
          }`}
        >
          {step === "review" && (
            <Button
              type="button"
              variant="outline"
              className="min-h-12 w-full px-6 py-3 text-sm sm:w-auto"
              onClick={() => setStep("details")}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="min-h-12 w-full px-7 py-3 text-sm sm:w-52">
            {step === "details" ? "Review booking" : "Send booking request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
