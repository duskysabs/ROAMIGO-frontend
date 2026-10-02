import { NextResponse } from "next/server";
import { BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken } from "@/lib/auth/session";
import { getMyBookings } from "@/lib/bookings/server";

export async function GET() {
  try {
    const bookings = await getMyBookings();
    return NextResponse.json(bookings, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (
      error instanceof BackendRequestError &&
      (error.status === 401 || error.status === 403)
    ) {
      await clearAccessToken();
      return NextResponse.json(
        { message: "Please log in to view your bookings." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { message: "Your bookings are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
