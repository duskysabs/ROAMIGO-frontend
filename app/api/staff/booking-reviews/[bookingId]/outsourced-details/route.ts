import { NextResponse } from "next/server";
import { parseOutsourcedDetailsInput } from "@/lib/staff/booking-reviews";
import { saveOutsourcedDetails } from "@/lib/staff/booking-reviews.server";
import {
  bookingReviewErrorResponse,
  isBookingReviewId,
} from "@/lib/staff/booking-review-route";

export async function PUT(
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
    return NextResponse.json({ message: "Enter valid outsourced transport details." }, { status: 400 });
  }

  const input = parseOutsourcedDetailsInput(body);
  if (!input) {
    return NextResponse.json(
      { message: "Complete every field and enter a valid cost with no more than two decimal places." },
      { status: 400 },
    );
  }

  try {
    await saveOutsourcedDetails(bookingId, input);
    return NextResponse.json({ success: true });
  } catch (error) {
    return bookingReviewErrorResponse(
      error,
      "Unable to save the outsourced transport details.",
    );
  }
}
