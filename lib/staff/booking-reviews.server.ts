import "server-only";

import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";
import {
  parseStaffBookingReviewDetail,
  parseStaffBookingReviewList,
  type OutsourcedDetailsInput,
  type StaffBookingReviewDetail,
  type StaffBookingReviewSummary,
} from "@/lib/staff/booking-reviews";

async function authenticatedStaffRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new BackendRequestError("Authentication is required.", 401, null);
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body) headers.set("Content-Type", "application/json");

  return backendRequest<unknown>(path, {
    ...init,
    headers,
  });
}

export async function getStaffBookingReviews(): Promise<StaffBookingReviewSummary[]> {
  const response = await authenticatedStaffRequest("staff/booking-reviews");
  const reviews = parseStaffBookingReviewList(response);

  if (!reviews) {
    throw new BackendRequestError("The booking review service returned an invalid response.", 502, response);
  }

  return reviews;
}

export async function getStaffBookingReview(bookingId: string): Promise<StaffBookingReviewDetail> {
  const response = await authenticatedStaffRequest(
    `staff/booking-reviews/${encodeURIComponent(bookingId)}`,
  );
  const review = parseStaffBookingReviewDetail(response);

  if (!review) {
    throw new BackendRequestError("The booking review service returned an invalid response.", 502, response);
  }

  return review;
}

export async function saveOutsourcedDetails(
  bookingId: string,
  input: OutsourcedDetailsInput,
): Promise<void> {
  await authenticatedStaffRequest(
    `staff/booking-reviews/${encodeURIComponent(bookingId)}/outsourced-details`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}

export async function rejectStaffBookingReview(bookingId: string, reason: string): Promise<void> {
  await authenticatedStaffRequest(
    `staff/booking-reviews/${encodeURIComponent(bookingId)}/reject`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}
