"use client";

import { type FormEvent, startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import { buildTripRequest, isRoutePreview, isTripQuote, isSubmittedTrip, tripPlaceIds, tripRequest, TripRequestError, type RoutePreview, type TripQuote } from "@/lib/bookings/integration";
import { saveLoginDraft, takeLoginDraft } from "@/lib/bookings/draft-storage";
import { createEmptyTripDraft, type CustomTripDraft, type TripErrors, type TripStep, type VehicleTypeOption } from "@/lib/bookings/types";
import { validateTripDetails, validateTripRoute } from "@/lib/bookings/validation";
import TripDetailsStep from "./TripDetailsStep";
import TripRouteStep from "./TripRouteStep";
import TripReviewStep from "./TripReviewStep";
import TripQuoteSummary from "./TripQuoteSummary";

const steps = [
  { id: "details", label: "Trip details", description: "Choose your schedule and group size." },
  { id: "route", label: "Route and stops", description: "Tell us where you would like to go." },
  { id: "review", label: "Review your trip", description: "Check your route and request a quotation before submitting." },
] as const;

export default function CustomTripForm({ vehicleTypes = [] }: { vehicleTypes?: readonly VehicleTypeOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState<TripStep>("details");
  const [draft, setDraft] = useState<CustomTripDraft>(createEmptyTripDraft);
  const [errors, setErrors] = useState<TripErrors>({});
  const [route, setRoute] = useState<RoutePreview | null>(null);
  const [quote, setQuote] = useState<TripQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; bookingStatus: string } | null>(null);
  const inFlight = useRef(false);
  const command = useRef<{ quoteId: string; idempotencyKey: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const currentIndex = steps.findIndex((item) => item.id === step);
  const currentStep = steps[currentIndex];

  useEffect(() => {
    const saved = takeLoginDraft();
    if (saved) startTransition(() => setDraft(saved));
  }, []);

  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  function changeStep(next: TripStep) {
    if (inFlight.current || uncertain) return;
    setErrors({}); setRequestError(null); setNeedsLogin(false);
    setQuote(null); command.current = null; setStep(next);
  }

  function beginRequest() {
    if (inFlight.current) return false;
    inFlight.current = true; setBusy(true); setRequestError(null); setNeedsLogin(false);
    return true;
  }

  function finishRequest() { inFlight.current = false; setBusy(false); }

  function reportError(error: unknown) {
    if (error instanceof TripRequestError && error.status === 401) {
      setNeedsLogin(true);
      setRequestError("Log in to continue with your booking.");
    } else {
      setRequestError(error instanceof TypeError || (error instanceof DOMException && error.name === "TimeoutError")
        ? "Unable to reach the booking service. Please try again."
        : error instanceof Error ? error.message : "Unable to reach the booking service. Please try again.");
    }
  }

  async function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || step === "review") return;
    const detailErrors = validateTripDetails(draft, vehicleTypes);
    if (step === "details" || Object.keys(detailErrors).length) {
      setErrors(detailErrors);
      if (Object.keys(detailErrors).length) { setStep("details"); return; }
      if (step === "details") { changeStep("route"); return; }
    }
    const routeErrors = validateTripRoute(draft);
    setErrors(routeErrors);
    if (Object.keys(routeErrors).length || !beginRequest()) return;
    try {
      const body = await tripRequest("/api/routes/preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: tripPlaceIds(draft) }),
      });
      if (!isRoutePreview(body)) throw new Error("The route estimate could not be read. Please try again.");
      setRoute(body); setQuote(null); command.current = null; setStep("review");
    } catch (error) { reportError(error); }
    finally { finishRequest(); }
  }

  async function requestQuote() {
    if (uncertain) return;
    const detailErrors = validateTripDetails(draft, vehicleTypes);
    const routeErrors = validateTripRoute(draft);
    if (Object.keys(detailErrors).length || Object.keys(routeErrors).length) {
      setErrors({ ...detailErrors, ...routeErrors });
      setStep(Object.keys(detailErrors).length ? "details" : "route");
      setQuote(null); command.current = null;
      return;
    }
    if (!beginRequest()) return;
    setQuote(null); command.current = null;
    try {
      const body = await tripRequest("/api/bookings/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildTripRequest(draft)),
      });
      if (!isTripQuote(body)) throw new Error("The quotation could not be read. Please request a new quote.");
      setQuote(body);
    } catch (error) { reportError(error); }
    finally { finishRequest(); }
  }

  async function submitBooking() {
    if (!quote || submitted) return;
    if (!uncertain && Date.parse(quote.expiresAt) <= Date.now()) {
      setRequestError("This quote has expired. Request a fresh quote."); return;
    }
    if (!beginRequest()) return;
    let sent = false;
    try {
      if (command.current?.quoteId !== quote.quoteId) command.current = { quoteId: quote.quoteId, idempotencyKey: crypto.randomUUID() };
      sent = true;
      const body = await tripRequest("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command.current),
      });
      if (!isSubmittedTrip(body)) throw new Error("We could not read the submission result.");
      setSubmitted(body); setUncertain(false);
      router.push(`/my-bookings/${body.id}`);
    } catch (error) {
      // A lost or malformed response can follow a committed booking. Keep its quote and key for recovery.
      if (sent && (!(error instanceof TripRequestError) || error.status >= 500)) setUncertain(true);
      else if (error instanceof TripRequestError && error.status === 400) {
        setUncertain(false); setQuote(null); command.current = null;
      }
      reportError(error);
    } finally { finishRequest(); }
  }

  function logIn() {
    if (uncertain) {
      setRequestError("Open Log in in another tab, then retry here to recover this submission.");
      return;
    }
    if (!saveLoginDraft(draft)) {
      setRequestError("Your browser could not save this draft. Open Log in in another tab, then return here to retry.");
      return;
    }
    router.push("/auth/login?next=%2Fplan-a-trip");
  }

  if (submitted) return <div className="mx-auto max-w-3xl space-y-4">
    <Alert variant="success" title="Booking request received">Status: {submitted.bookingStatus.replaceAll("_", " ")}. Payment and assignment are separate.</Alert>
    <Button href={`/my-bookings/${submitted.id}`}>View booking</Button>
  </div>;

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
          <fieldset disabled={busy} className="min-w-0">
            <legend className="sr-only">{currentStep.label}</legend>
            {step === "details" && <TripDetailsStep draft={draft} errors={errors} vehicleTypes={vehicleTypes} onChange={setDraft} />}
            {step === "route" && <TripRouteStep draft={draft} errors={errors} onChange={setDraft} />}
            {step === "review" && <TripReviewStep draft={draft} vehicleTypes={vehicleTypes} onEdit={changeStep} disabled={busy || uncertain} />}
          </fieldset>
          {step === "review" && route && <TripQuoteSummary route={route} quote={quote} busy={busy} uncertain={uncertain} onQuote={requestQuote} onSubmit={submitBooking} />}
          {requestError && <Alert variant="danger" className="mt-5">{requestError}</Alert>}
          {needsLogin && <div className="mt-3 flex flex-wrap gap-3">
            <Button type="button" onClick={logIn}>Log in and continue</Button>
            <Button href="/auth/login" target="_blank" rel="noopener noreferrer" variant="outline">Log in in another tab</Button>
          </div>}
          <div className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${currentIndex > 0 ? "sm:justify-between" : "sm:justify-end"}`}>
            {currentIndex > 0 && <Button type="button" disabled={busy || uncertain} variant="outline" className="min-h-12 w-full px-6 py-3 text-sm sm:w-auto" onClick={() => changeStep(steps[currentIndex - 1].id)}>Back</Button>}
            {step !== "review" && <Button type="submit" disabled={busy || vehicleTypes.length === 0} className="min-h-12 w-full px-7 py-3 text-sm sm:w-52">{busy ? "Checking route..." : step === "details" ? "Continue" : "Review trip"}</Button>}
          </div>
      </form>
    </div>
  );
}
