"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import {
  STAFF_BOOKING_REVIEW_PATH,
  customerName,
  formatBookingType,
  formatDateTime,
  formatMoney,
  formatVehicleType,
  parseOutsourcedDetailsInput,
  parseStaffBookingReviewDetail,
  type StaffBookingReviewDetail,
} from "@/lib/staff/booking-reviews";
import { useStaff } from "./StaffProvider";
import { Badge, Empty, Modal, PageHeading, Panel } from "./StaffUI";

type DetailState =
  | { status: "loading" }
  | { status: "ready"; review: StaffBookingReviewDetail }
  | { status: "error"; message: string }
  | { status: "resolved" };

async function responseMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { message?: unknown };
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}

export default function BookingReviewDetails({ id }: { id: string }) {
  const router = useRouter();
  const { announce } = useStaff();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [requestKey, setRequestKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${STAFF_BOOKING_REVIEW_PATH}/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          router.push(`/auth/login?next=${encodeURIComponent(`/staff/bookings/${id}`)}`);
          return;
        }
        if (!response.ok) {
          throw new Error(await responseMessage(response, "Unable to load this booking review."));
        }
        const review = parseStaffBookingReviewDetail(await response.json());
        if (!review) throw new Error("The booking review response was invalid.");
        setState({ status: "ready", review });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load this booking review.",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [id, requestKey, router]);

  function reload() {
    setState({ status: "loading" });
    setRequestKey(key => key + 1);
  }

  async function submitOutsourcedDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = parseOutsourcedDetailsInput({
      vehicleProvider: form.get("vehicleProvider"),
      vehicleModel: form.get("vehicleModel"),
      plateNumber: form.get("plateNumber"),
      driverName: form.get("driverName"),
      driverContact: form.get("driverContact"),
      agreedCost: form.get("agreedCost"),
    });
    if (!input) {
      setFormError("Complete every field and enter a valid cost with no more than two decimal places.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${STAFF_BOOKING_REVIEW_PATH}/${encodeURIComponent(id)}/outsourced-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (response.status === 401) {
        router.push(`/auth/login?next=${encodeURIComponent(`/staff/bookings/${id}`)}`);
        return;
      }
      if (!response.ok) throw new Error(await responseMessage(response, "Unable to save the outsourced transport details."));
      announce("Outsourced transport details saved. The customer can now review the option.");
      reload();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the outsourced transport details.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRejection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (!reason || reason.length > 2000) {
      setFormError("Enter a rejection reason of 2,000 characters or fewer.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${STAFF_BOOKING_REVIEW_PATH}/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (response.status === 401) {
        router.push(`/auth/login?next=${encodeURIComponent(`/staff/bookings/${id}`)}`);
        return;
      }
      if (!response.ok) throw new Error(await responseMessage(response, "Unable to reject this booking review."));
      setRejecting(false);
      setState({ status: "resolved" });
      announce("Booking review rejected. The customer has been notified.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to reject this booking review.");
    } finally {
      setSaving(false);
    }
  }

  if (state.status === "loading") {
    return <><PageHeading title="Booking review" description="Loading the live booking review..." /><Panel><p className="staff-empty" role="status">Loading booking review...</p></Panel></>;
  }

  if (state.status === "error") {
    return <><PageHeading title="Booking review unavailable" description="The live review record could not be loaded." action={<Button href="/staff/bookings" variant="outline" size="sm" className="staff-button">Back to reviews</Button>} /><Panel><div className="staff-form-pad"><p className="staff-error" role="alert">{state.message}</p><Button size="sm" className="staff-button" onClick={reload}>Try again</Button></div></Panel></>;
  }

  if (state.status === "resolved") {
    return <><PageHeading title="Review resolved" description="The booking review was rejected and removed from the pending queue." /><Panel><Empty text="No further staff action is required for this review." /><div className="staff-form-pad"><Button href="/staff/bookings" className="staff-button">Return to booking reviews</Button></div></Panel></>;
  }

  const { review } = state;
  const details = review.outsourcedDetails;
  const formKey = details?.recordedAt ?? "new-option";

  return <>
    <PageHeading
      title="Booking review"
      description="Record an outsourced transport option or reject the request if it cannot be fulfilled."
      action={<Button href="/staff/bookings" variant="outline" size="sm" className="staff-button">Back to reviews</Button>}
    />
    <div className="staff-booking-summary">
      <div><small>Booking reference</small><strong>{review.id}</strong></div>
      <div><small>Booking type</small><strong>{formatBookingType(review.bookingType)}</strong></div>
      <div><small>Status</small><strong><Badge status="Awaiting review" /></strong></div>
      <div><small>Submitted</small><strong>{formatDateTime(review.createdAt)}</strong></div>
      <div><small>Customer</small><strong>{customerName(review.customer)}</strong></div>
    </div>
    <div className="staff-review-layout">
      <div className="staff-stack">
        <Panel title="Trip details">
          <dl className="staff-fields">
            <div><dt>Start</dt><dd>{formatDateTime(review.startDatetime)}</dd></div>
            <div><dt>End</dt><dd>{formatDateTime(review.endDatetime)}</dd></div>
            <div><dt>Passengers</dt><dd>{review.passengerCount}</dd></div>
            <div><dt>Requested vehicle</dt><dd>{formatVehicleType(review.vehicleType.vehicleType)}</dd></div>
            <div><dt>Distance</dt><dd>{review.totalDistanceKm.toLocaleString("en-PH")} km</dd></div>
            <div><dt>Estimated duration</dt><dd>{review.estimatedDurationMinutes.toLocaleString("en-PH")} minutes</dd></div>
            <div><dt>Customer quote</dt><dd>{formatMoney(review.finalQuotedPrice)}</dd></div>
            {review.tourPackage ? <div><dt>Tour package</dt><dd>{review.tourPackage.packageName}</dd></div> : null}
          </dl>
        </Panel>
        <Panel title="Route">
          {review.stops.length ? <ol className="staff-review-stops">{review.stops.map(stop => <li key={stop.id}>
            <strong>{formatVehicleType(stop.stopType)}</strong>
            <span>{stop.locationName}</span>
            <small>{stop.formattedAddress}</small>
            {stop.activity ? <small>{stop.activity}</small> : null}
            {stop.plannedStopMinutes ? <small>{stop.plannedStopMinutes} minute planned stop</small> : null}
          </li>)}</ol> : <Empty text="No route stops were returned for this booking." />}
        </Panel>
        <Panel title="Customer and request notes">
          <dl className="staff-fields">
            <div><dt>Customer</dt><dd>{customerName(review.customer)}</dd></div>
            <div><dt>Phone number</dt><dd>{review.customer.phoneNumber ?? "Not provided"}</dd></div>
            <div><dt>Notes</dt><dd>{review.notes ?? "No customer notes"}</dd></div>
          </dl>
        </Panel>
      </div>
      <div className="staff-stack">
        <Panel
          title={details ? "Update outsourced transport" : "Record outsourced transport"}
          subtitle="The customer will review the vehicle and driver after these details are saved."
        >
          <form key={formKey} className="staff-form-pad staff-review-form" onSubmit={submitOutsourcedDetails}>
            <label>Vehicle provider<input name="vehicleProvider" required maxLength={150} defaultValue={details?.vehicleProvider ?? ""} /></label>
            <label>Vehicle model<input name="vehicleModel" required maxLength={150} defaultValue={details?.vehicleModel ?? ""} /></label>
            <label>Plate number<input name="plateNumber" required maxLength={30} defaultValue={details?.plateNumber ?? ""} /></label>
            <label>Driver name<input name="driverName" required maxLength={150} defaultValue={details?.driverName ?? ""} /></label>
            <label>Driver contact<input name="driverContact" required maxLength={100} defaultValue={details?.driverContact ?? ""} /></label>
            <label>Agreed outsourcing cost (PHP)<input name="agreedCost" type="number" required min="0" step="0.01" defaultValue={details?.agreedCost ?? ""} /></label>
            {details ? <p className="staff-footnote">Last recorded {formatDateTime(details.recordedAt)}. The agreed cost is visible only to staff.</p> : null}
            {formError ? <p className="staff-error" role="alert">{formError}</p> : null}
            <div className="staff-action-row">
              <Button type="submit" className="staff-button" disabled={saving}>{saving ? "Saving..." : details ? "Update details" : "Save details"}</Button>
              <Button type="button" variant="outline" className="staff-button" disabled={saving} onClick={() => { setFormError(""); setRejecting(true); }}>Reject review</Button>
            </div>
          </form>
        </Panel>
        <Panel title="What happens next">
          <div className="staff-form-pad">
            <p className="staff-footnote">After outsourced details are saved, the customer can approve the option and continue to payment, or reject it and cancel the booking.</p>
          </div>
        </Panel>
      </div>
    </div>
    {rejecting ? <Modal title="Reject booking review" onClose={() => { setRejecting(false); setFormError(""); }}>
      <form className="staff-form-pad" onSubmit={submitRejection}>
        <p>Reject this review only when a suitable outsourced vehicle and driver cannot be secured. The customer will be notified.</p>
        <label>Reason<textarea name="reason" required maxLength={2000} rows={5} placeholder="Explain why the request cannot be fulfilled." /></label>
        {formError ? <p className="staff-error" role="alert">{formError}</p> : null}
        <div className="staff-modal-actions">
          <Button type="button" variant="outline" className="staff-button" disabled={saving} onClick={() => { setRejecting(false); setFormError(""); }}>Back</Button>
          <Button type="submit" className="staff-button" disabled={saving}>{saving ? "Rejecting..." : "Reject review"}</Button>
        </div>
      </form>
    </Modal> : null}
  </>;
}
