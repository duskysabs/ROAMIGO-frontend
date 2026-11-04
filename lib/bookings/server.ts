import "server-only";

import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { getAccessToken } from "@/lib/auth/session";
import {
  parseBookingList,
  parseBookingRecord,
  type BookingRecord,
} from "@/lib/bookings/records";

async function authenticatedBookingRequest(path: string): Promise<unknown> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new BackendRequestError("Authentication is required.", 401, null);
  }

  return backendRequest<unknown>(path, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getMyBookings(): Promise<BookingRecord[]> {
  const response = await authenticatedBookingRequest("bookings/me");
  const bookings = parseBookingList(response);

  if (!bookings) {
    throw new BackendRequestError(
      "The booking service returned an invalid response.",
      502,
      response,
    );
  }

  return bookings;
}

export async function getMyBooking(
  bookingId: string,
): Promise<BookingRecord> {
  const response = await authenticatedBookingRequest(
    `bookings/${encodeURIComponent(bookingId)}`,
  );
  const booking = parseBookingRecord(response);

  if (!booking) {
    throw new BackendRequestError(
      "The booking service returned an invalid response.",
      502,
      response,
    );
  }

  return booking;
}
