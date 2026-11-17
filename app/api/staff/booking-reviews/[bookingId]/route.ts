import { NextResponse } from "next/server";
import { getStaffBookingReview } from "@/lib/staff/booking-reviews.server";
import {
  bookingReviewErrorResponse,
  isBookingReviewId,
} from "@/lib/staff/booking-review-route";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  if (!isBookingReviewId(bookingId)) {
    return NextResponse.json(
      { message: "Booking review not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const review = await getStaffBookingReview(bookingId);
    return NextResponse.json(review, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return bookingReviewErrorResponse(
      error,
      "This booking review is temporarily unavailable.",
    );
  }
}
