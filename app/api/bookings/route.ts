import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken, getAccessToken } from "@/lib/auth/session";
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

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: "Please log in to submit a booking request." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const booking = await backendRequest<unknown>("bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401 || error.status === 403) {
        await clearAccessToken();
      }
      const backendBody =
        error.body && typeof error.body === "object"
          ? (error.body as { message?: unknown })
          : null;
      const message =
        typeof backendBody?.message === "string"
          ? backendBody.message
          : "Unable to submit the booking request.";
      return NextResponse.json({ message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unable to submit the booking request." },
      { status: 500 },
    );
  }
}
