"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button";
import { createEmptyTripDraft, type CustomTripDraft, type TripErrors, type TripStep, type VehicleTypeOption } from "@/lib/bookings/types";
import { validateTripDetails, validateTripRoute } from "@/lib/bookings/validation";
import TripDetailsStep from "./TripDetailsStep";
import TripRouteStep from "./TripRouteStep";
import TripReviewStep from "./TripReviewStep";

const steps = [
  { id: "details", label: "Trip details", description: "Choose your schedule and group size." },
  { id: "route", label: "Route and stops", description: "Tell us where you would like to go." },
  { id: "review", label: "Review your trip", description: "Check your draft and make any changes." },
] as const;

export default function CustomTripForm({ vehicleTypes = [] }: { vehicleTypes?: readonly VehicleTypeOption[] }) {
  const [step, setStep] = useState<TripStep>("details");
  const [draft, setDraft] = useState<CustomTripDraft>(createEmptyTripDraft);
  const [errors, setErrors] = useState<TripErrors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const currentIndex = steps.findIndex((item) => item.id === step);
  const currentStep = steps[currentIndex];

  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  function changeStep(next: TripStep) { setErrors({}); setStep(next); }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detailErrors = validateTripDetails(draft, vehicleTypes);
    if (step === "details" || Object.keys(detailErrors).length) {
      setErrors(detailErrors);
      if (Object.keys(detailErrors).length) { setStep("details"); return; }
      if (step === "details") { changeStep("route"); return; }
    }
    const routeErrors = validateTripRoute(draft);
    setErrors(routeErrors);
    if (!Object.keys(routeErrors).length) changeStep("review");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol aria-label="Trip planning steps" className="mb-7 flex items-start">
        {steps.map((item, index) => (
          <li key={item.id} aria-current={step === item.id ? "step" : undefined}
            className="flex min-w-0 flex-1 items-start last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${index <= currentIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                {index < currentIndex ? "✓" : index + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:block ${step === item.id ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
            </div>
            {index < steps.length - 1 && <span aria-hidden="true" className={`mt-4 h-px min-w-4 flex-1 sm:mx-4 ${index < currentIndex ? "bg-primary" : "bg-border"}`} />}
          </li>
        ))}
      </ol>
      <form noValidate onSubmit={handleContinue} className="rounded-3xl border border-primary/15 bg-background p-6 sm:p-8">
          <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">{currentStep.label}</h2>
          <p className="mt-2 mb-7 text-muted-foreground">{currentStep.description}</p>
          {Object.keys(errors).length > 0 && (
            <div ref={errorSummary} tabIndex={-1} role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 focus:outline-2 focus:outline-red-800">
              Please correct the marked fields before continuing.
            </div>
          )}
          {step === "details" && <TripDetailsStep draft={draft} errors={errors} vehicleTypes={vehicleTypes} onChange={setDraft} />}
          {step === "route" && <TripRouteStep draft={draft} errors={errors} onChange={setDraft} />}
          {step === "review" && <TripReviewStep draft={draft} vehicleTypes={vehicleTypes} onEdit={changeStep} />}
          <div className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${currentIndex > 0 ? "sm:justify-between" : "sm:justify-end"}`}>
            {currentIndex > 0 && <Button type="button" variant="outline" className="min-h-12 w-full px-6 py-3 text-sm sm:w-auto" onClick={() => changeStep(steps[currentIndex - 1].id)}>Back</Button>}
            {step !== "review" && <Button type="submit" className="min-h-12 w-full px-7 py-3 text-sm sm:w-52">{step === "details" ? "Continue" : "Review trip"}</Button>}
          </div>
      </form>
    </div>
  );
}
