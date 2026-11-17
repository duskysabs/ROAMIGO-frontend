"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import {
  STAFF_BOOKING_REVIEW_PATH,
  customerName,
  formatBookingType,
  formatDateTime,
  formatMoney,
  formatVehicleType,
  parseStaffBookingReviewList,
  type StaffBookingReviewSummary,
} from "@/lib/staff/booking-reviews";
import { useStaff } from "./StaffProvider";
import { Badge, Empty, PageHeading, Pagination, Panel, Stats } from "./StaffUI";

const PAGE_SIZE = 10;

type ListState =
  | { status: "loading" }
  | { status: "ready"; reviews: StaffBookingReviewSummary[] }
  | { status: "error"; message: string };

async function responseMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { message?: unknown };
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}

export default function BookingReviewsView() {
  const router = useRouter();
  const { query } = useStaff();
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [requestKey, setRequestKey] = useState(0);
  const [search, setSearch] = useState("");
  const [bookingType, setBookingType] = useState("ALL");
  const [fulfillment, setFulfillment] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(STAFF_BOOKING_REVIEW_PATH, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          router.push("/auth/login?next=/staff/bookings");
          return;
        }
        if (!response.ok) {
          throw new Error(await responseMessage(response, "Unable to load booking reviews."));
        }
        const reviews = parseStaffBookingReviewList(await response.json());
        if (!reviews) throw new Error("The booking review response was invalid.");
        setState({ status: "ready", reviews });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load booking reviews.",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [requestKey, router]);

  const reviews = useMemo(
    () => state.status === "ready" ? state.reviews : [],
    [state],
  );
  const filtered = useMemo(() => {
    const term = `${query} ${search}`.trim().toLowerCase();
    return reviews.filter(review => {
      const matchesTerm = !term || `${review.id} ${customerName(review.customer)} ${review.customer.phoneNumber ?? ""} ${review.vehicleType.vehicleType}`.toLowerCase().includes(term);
      const matchesType = bookingType === "ALL" || review.bookingType === bookingType;
      const matchesFulfillment = fulfillment === "ALL" || (fulfillment === "RECORDED") === Boolean(review.outsourcedDetails);
      return matchesTerm && matchesType && matchesFulfillment;
    });
  }, [bookingType, fulfillment, query, reviews, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const recorded = reviews.filter(review => review.outsourcedDetails).length;

  function retry() {
    setState({ status: "loading" });
    setRequestKey(key => key + 1);
  }

  return <>
    <PageHeading
      title="Booking reviews"
      description="Review customer requests that need an outsourced vehicle and driver."
      action={<Button size="sm" variant="outline" className="staff-button" onClick={retry} disabled={state.status === "loading"}>Refresh</Button>}
    />
    <Stats items={[
      { label: "Pending reviews", value: reviews.length, note: "awaiting resolution", tone: "amber" },
      { label: "Details recorded", value: recorded, note: "awaiting customer decision", tone: "green" },
      { label: "Resources needed", value: reviews.length - recorded, note: "external option not recorded", tone: "red" },
    ]} />
    <div className="staff-stack">
    <div className="staff-filter-bar">
      <input
        aria-label="Search booking reviews"
        placeholder="Search booking, customer, phone, or vehicle type..."
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      <select aria-label="Booking type" value={bookingType} onChange={event => setBookingType(event.target.value)}>
        <option value="ALL">All booking types</option>
        <option value="CUSTOM_TRIP">Custom Trip</option>
        <option value="TOUR_PACKAGE">Tour Package</option>
      </select>
      <select aria-label="Outsourced details status" value={fulfillment} onChange={event => setFulfillment(event.target.value)}>
        <option value="ALL">All fulfillment states</option>
        <option value="NEEDED">Resources needed</option>
        <option value="RECORDED">Details recorded</option>
      </select>
    </div>
    <Panel title="Pending booking reviews" subtitle={state.status === "ready" ? `${filtered.length} matching requests` : "Live booking review queue"}>
      {state.status === "loading" ? <p className="staff-empty" role="status">Loading booking reviews...</p> : null}
      {state.status === "error" ? <div className="staff-form-pad"><p className="staff-error" role="alert">{state.message}</p><Button size="sm" className="staff-button" onClick={retry}>Try again</Button></div> : null}
      {state.status === "ready" ? <>
        <div className="staff-table-wrap staff-responsive-table">
          <table className="staff-table booking-table">
            <thead><tr>{["Booking ID", "Customer", "Booking Type", "Schedule", "Passengers", "Requested Vehicle", "Fulfillment", "Action"].map(title => <th key={title}>{title}</th>)}</tr></thead>
            <tbody>{visible.map(review => <tr key={review.id}>
              <td data-label="Booking ID"><strong>{review.id}</strong><small>{formatMoney(review.finalQuotedPrice)}</small></td>
              <td data-label="Customer"><strong>{customerName(review.customer)}</strong><small>{review.customer.phoneNumber ?? "No phone number"}</small></td>
              <td data-label="Booking Type">{formatBookingType(review.bookingType)}</td>
              <td data-label="Schedule">{formatDateTime(review.startDatetime)}<small>to {formatDateTime(review.endDatetime)}</small></td>
              <td data-label="Passengers">{review.passengerCount}</td>
              <td data-label="Requested Vehicle">{formatVehicleType(review.vehicleType.vehicleType)}</td>
              <td data-label="Fulfillment"><Badge status={review.outsourcedDetails ? "Details recorded" : "Resources needed"} /></td>
              <td data-label="Action"><Button href={`/staff/bookings/${review.id}`} size="sm" variant="outline" className="staff-button">Review</Button></td>
            </tr>)}</tbody>
          </table>
          {!filtered.length ? <Empty text="No pending booking reviews match the current filters." /> : null}
        </div>
        <Pagination page={currentPage} count={filtered.length} size={PAGE_SIZE} onChange={setPage} />
      </> : null}
    </Panel>
    </div>
  </>;
}
