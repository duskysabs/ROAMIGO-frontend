"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import PassengerCounter from "@/components/bookings/PassengerCounter";
import TripDatePicker from "@/components/bookings/TripDatePicker";
import TripTimePicker from "@/components/bookings/TripTimePicker";
import BookingStepper from "@/components/tour-packages/BookingStepper";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/bookings/display";
import { earliestBookingDateValue } from "@/lib/bookings/schedule";
import {
  createEmptyBookingDraft,
  type BookingDraft,
  type BookingErrors,
  type BookingQuote,
  type BookingWizardStep,
  type SubmittedBooking,
  type TourPackage,
  type VehicleType,
} from "@/lib/tour-packages/types";
import { validateBookingDetails } from "@/lib/tour-packages/validation";

type ErrorBody = { message?: string };

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
  return (hours % 12 || 12) + ":" + String(minutes).padStart(2, "0") + " " + suffix;
}

function buildBookingRequest(tourPackage: TourPackage, draft: BookingDraft) {
  const start = new Date(draft.travelDate + "T" + draft.preferredStartTime);
  const end = new Date(start.getTime() + tourPackage.estimatedDurationMinutes * 60_000);
  const notes = [
    "Pickup location: " + draft.pickupLocation.trim(),
    draft.specialRequests.trim()
      ? "Special requests: " + draft.specialRequests.trim()
      : "",
  ].filter(Boolean).join("\n");

  return {
    bookingType: "TOUR_PACKAGE",
    tourPackageId: tourPackage.id,
    vehicleTypeId: draft.vehicleTypeId,
    startDatetime: start.toISOString(),
    endDatetime: end.toISOString(),
    passengerCount: draft.passengerCount,
    notes,
  };
}

function isBookingQuote(value: unknown): value is BookingQuote {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.quoteId === "string" &&
    typeof record.currency === "string" &&
    typeof record.finalQuotedPrice === "string" &&
    typeof record.expiresAt === "string"
  );
}

function isSubmittedBooking(value: unknown): value is SubmittedBooking {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.bookingStatus === "string";
}

export default function BookingWizard({
  tourPackage,
  vehicleTypes,
}: {
  tourPackage: TourPackage;
  vehicleTypes: VehicleType[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<BookingWizardStep>("customize");
  const [draft, setDraft] = useState<BookingDraft>(createEmptyBookingDraft);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [booking, setBooking] = useState<SubmittedBooking | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const bookingCommand = useRef<{ quoteId: string; idempotencyKey: string } | null>(null);
  const bookingRequestInFlight = useRef(false);
  const selectedVehicle = vehicleTypes.find(
    (vehicleType) => vehicleType.id === draft.vehicleTypeId,
  );

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  async function handleCustomizeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detailErrors = validateBookingDetails(draft, vehicleTypes);
    setErrors(detailErrors);
    setRequestError(null);
    if (Object.keys(detailErrors).length) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBookingRequest(tourPackage, draft)),
      });
      const body = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(
          "/auth/login?next=" + encodeURIComponent(window.location.pathname),
        );
        return;
      }
      if (!response.ok || !isBookingQuote(body)) {
        setRequestError(
          (body as ErrorBody | null)?.message ??
            "Unable to prepare a quotation. Please try again.",
        );
        return;
      }
      setQuote(body);
      setStep("review");
    } catch {
      setRequestError("Unable to reach the booking service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitBookingRequest() {
    if (!quote || bookingRequestInFlight.current) return;
    bookingRequestInFlight.current = true;
    setIsSubmitting(true);
    setRequestError(null);
    try {
      // Reuse the command after a lost response so retries recover the same booking.
      if (bookingCommand.current?.quoteId !== quote.quoteId) {
        bookingCommand.current = {
          quoteId: quote.quoteId,
          idempotencyKey: crypto.randomUUID(),
        };
      }
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingCommand.current),
      });
      const body = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(
          "/auth/login?next=" + encodeURIComponent(window.location.pathname),
        );
        return;
      }
      if (!response.ok || !isSubmittedBooking(body)) {
        setRequestError(
          (body as ErrorBody | null)?.message ??
            "Unable to submit the booking request. Please try again.",
        );
        return;
      }
      setBooking(body);
      setStep("submitted");
    } catch {
      setRequestError("Unable to reach the booking service. Please try again.");
    } finally {
      bookingRequestInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  if (step === "submitted" && booking) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-background p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Request Received
        </p>
        <h1 ref={heading} tabIndex={-1} className="mt-2 text-3xl font-bold tracking-tight text-foreground outline-none">
          Tour Request Submitted
        </h1>
        <p className="mt-3 text-muted-foreground">
          Submission is not final booking confirmation. Planet J will continue processing the request and its payment status separately.
        </p>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Request reference</dt>
            <dd className="mt-1 break-all font-medium text-foreground">{booking.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Request status</dt>
            <dd className="mt-1 font-medium text-foreground">{booking.bookingStatus.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment status</dt>
            <dd className="mt-1 font-medium text-foreground">Not started</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vehicle preference</dt>
            <dd className="mt-1 font-medium text-foreground">{selectedVehicle?.name}</dd>
          </div>
        </dl>
        <p className="mt-6 rounded-xl border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
          Your selected vehicle is a preference. Final assignment depends on capacity, schedule, maintenance, and availability.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href={"/my-bookings/" + booking.id}>View request</Button>
          <Button href="/tour-packages" variant="outline">Browse more packages</Button>
        </div>
      </div>
    );
  }

  if (step === "review" && quote) {
    return (
      <div className="mx-auto max-w-6xl">
        <BookingStepper currentIndex={2} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">Review Your Request</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Check the package and preferences before submitting. This does not confirm the booking or payment.
              </p>
              <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                {[
                  ["Package", tourPackage.name],
                  ["Travel date", formatTravelDate(draft.travelDate)],
                  ["Preferred start time", formatPreferredTime(draft.preferredStartTime)],
                  ["Passengers", String(draft.passengerCount ?? "")],
                  ["Pickup location", draft.pickupLocation],
                  ["Vehicle preference", selectedVehicle?.name ?? ""],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Fixed Package Route</h2>
              <ol className="mt-4 space-y-3">
                {tourPackage.stops.map((stop) => (
                  <li key={stop.sequenceNumber} className="flex items-start gap-3 text-sm">
                    <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary">
                      {stop.sequenceNumber}
                    </span>
                    <span className="pt-0.5 text-foreground">{stop.locationName}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Validated Quotation</h2>
              <p className="mt-4 text-2xl font-bold text-foreground">
                {formatCurrency(Number(quote.finalQuotedPrice))}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Valid until {new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(quote.expiresAt))}
              </p>
              <p className="mt-4 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
                This quotation does not confirm the booking and is not proof of payment.
              </p>
            </div>
          </aside>
          {requestError && (
            <div role="alert" className="lg:col-span-2 rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger">
              {requestError}
            </div>
          )}
          <div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={() => setStep("customize")}>
              Edit Preferences
            </Button>
            <Button type="button" size="lg" disabled={isSubmitting} onClick={submitBookingRequest}>
              {isSubmitting ? "Submitting..." : "Submit Booking Request"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <BookingStepper currentIndex={1} />
      <form noValidate onSubmit={handleCustomizeSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">Your Preferences</h2>
            {Object.keys(errors).length > 0 && (
              <div ref={errorSummary} tabIndex={-1} role="alert" className="mt-4 rounded-lg border border-danger-border bg-danger-surface p-4 text-sm text-danger">
                Please correct the marked fields before continuing.
              </div>
            )}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TripDatePicker
                id="travelDate"
                label="Travel date"
                value={draft.travelDate}
                min={earliestBookingDateValue()}
                invalid={Boolean(errors.travelDate)}
                describedBy={errors.travelDate ? "travelDate-error" : undefined}
                onChange={(travelDate) => setDraft({ ...draft, travelDate })}
              />
              <TripTimePicker
                id="preferredStartTime"
                label="Preferred start time"
                value={draft.preferredStartTime}
                invalid={Boolean(errors.preferredStartTime)}
                onChange={(preferredStartTime) => setDraft({ ...draft, preferredStartTime })}
              />
            </div>
            {errors.travelDate && <p id="travelDate-error" className="mt-2 text-sm text-danger">{errors.travelDate}</p>}
            {errors.preferredStartTime && <p className="mt-2 text-sm text-danger">{errors.preferredStartTime}</p>}
            <p className="mt-3 text-sm text-muted-foreground">Bookings start from tomorrow and remain subject to availability and confirmation.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <PassengerCounter
                value={draft.passengerCount ?? 1}
                error={errors.passengerCount}
                onChange={(passengerCount) => setDraft({ ...draft, passengerCount })}
              />
              <FormField htmlFor="pickupLocation" label="Pickup location" error={errors.pickupLocation}>
                <Input
                  id="pickupLocation"
                  value={draft.pickupLocation}
                  placeholder="Hotel name or address"
                  onChange={(event) => setDraft({ ...draft, pickupLocation: event.target.value })}
                />
              </FormField>
            </div>
            <div className="mt-5">
              <label htmlFor="vehicleTypeId" className="text-sm font-semibold text-foreground">
                Vehicle preference
              </label>
              <div className="mt-2">
                <select
                  id="vehicleTypeId"
                  aria-invalid={Boolean(errors.vehicleTypeId) || undefined}
                  aria-describedby={errors.vehicleTypeId ? "vehicleTypeId-error" : "vehicleTypeId-hint"}
                  value={draft.vehicleTypeId}
                  onChange={(event) => setDraft({ ...draft, vehicleTypeId: event.target.value })}
                  className={`min-h-12 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 ${
                    errors.vehicleTypeId
                      ? "border-danger focus:border-danger focus:ring-danger/20"
                      : "border-border focus:border-primary focus:ring-primary/20"
                  }`}
                >
                  <option value="">Choose a vehicle type</option>
                  {vehicleTypes.map((vehicleType) => (
                    <option key={vehicleType.id} value={vehicleType.id}>
                      {vehicleType.name} (up to {vehicleType.maximumPassengerCapacity})
                    </option>
                  ))}
                </select>
              </div>
              {errors.vehicleTypeId ? (
                <p id="vehicleTypeId-error" className="mt-2 text-sm text-danger">{errors.vehicleTypeId}</p>
              ) : (
                <p id="vehicleTypeId-hint" className="mt-2 text-sm text-muted-foreground">
                  This is a preference. Final assignment depends on availability and route suitability.
                </p>
              )}
            </div>
            <div className="mt-5">
              <FormField htmlFor="specialRequests" label="Special requests" optional error={errors.specialRequests}>
                <Textarea
                  id="specialRequests"
                  value={draft.specialRequests}
                  placeholder="Tell us anything else we should know"
                  onChange={(event) => setDraft({ ...draft, specialRequests: event.target.value })}
                />
              </FormField>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-bold tracking-tight">Established Package Route <span className="text-sm font-normal text-muted-foreground">(read-only)</span></h2>
            <ol className="mt-4 space-y-3">
              {tourPackage.stops.map((stop) => (
                <li key={stop.sequenceNumber} className="flex items-start gap-3 text-sm">
                  <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary">{stop.sequenceNumber}</span>
                  <span className="pt-0.5 text-foreground">{stop.locationName}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Selected Package</h2>
            <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-surface-warm">
              <Image src={tourPackage.heroImage.path} alt={tourPackage.heroImage.alt} fill sizes="320px" className="object-cover object-center" />
            </div>
            <p className="mt-3 font-bold text-foreground">{tourPackage.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Base price from {formatCurrency(tourPackage.basePrice)}. A server-validated quotation is shown on the next step.
            </p>
          </div>
        </aside>
        {requestError && (
          <div role="alert" className="lg:col-span-2 rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger">
            {requestError}
          </div>
        )}
        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting || vehicleTypes.length === 0} className="w-full sm:w-auto">
            {isSubmitting ? "Preparing quotation..." : "Continue to Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
