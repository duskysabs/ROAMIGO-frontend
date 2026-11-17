import { NextResponse } from "next/server";
import { rejectStaffBookingReview } from "@/lib/staff/booking-reviews.server";
import {
  bookingReviewErrorResponse,
  isBookingReviewId,
} from "@/lib/staff/booking-review-route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  if (!isBookingReviewId(bookingId)) {
    return NextResponse.json({ message: "Booking review not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Enter a rejection reason." }, { status: 400 });
  }

  const reason = body && typeof body === "object" && typeof (body as { reason?: unknown }).reason === "string"
    ? (body as { reason: string }).reason.trim()
    : "";

  if (!reason || reason.length > 2000) {
    return NextResponse.json(
      { message: "Enter a rejection reason of 2,000 characters or fewer." },
      { status: 400 },
    );
  }

  try {
    await rejectStaffBookingReview(bookingId, reason);
    return NextResponse.json({ success: true });
  } catch (error) {
    return bookingReviewErrorResponse(error, "Unable to reject this booking review.");
  }
}
