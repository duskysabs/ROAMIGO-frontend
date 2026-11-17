import { NextResponse } from "next/server";
import { getStaffBookingReviews } from "@/lib/staff/booking-reviews.server";
import { bookingReviewErrorResponse } from "@/lib/staff/booking-review-route";

export async function GET() {
  try {
    const reviews = await getStaffBookingReviews();
    return NextResponse.json(reviews, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return bookingReviewErrorResponse(
      error,
      "Booking reviews are temporarily unavailable.",
    );
  }
}
