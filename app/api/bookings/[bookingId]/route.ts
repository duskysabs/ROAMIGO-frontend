import { NextResponse } from "next/server";
import { BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken } from "@/lib/auth/session";
import { getMyBooking } from "@/lib/bookings/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  if (!UUID_PATTERN.test(bookingId)) {
    return NextResponse.json(
      { message: "Booking not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const booking = await getMyBooking(bookingId);
    return NextResponse.json(booking, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401 || error.status === 403) {
        await clearAccessToken();
        return NextResponse.json(
          { message: "Please log in to view this booking." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }

      if (error.status === 404) {
        return NextResponse.json(
          { message: "Booking not found." },
          { status: 404, headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    return NextResponse.json(
      { message: "This booking is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
