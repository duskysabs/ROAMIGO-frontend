import "server-only";

import { NextResponse } from "next/server";
import { BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken } from "@/lib/auth/session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBookingReviewId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function backendMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const message = (body as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every(item => typeof item === "string")) {
    return message.join(" ");
  }
  return null;
}

export async function bookingReviewErrorResponse(
  error: unknown,
  fallbackMessage: string,
): Promise<NextResponse> {
  if (!(error instanceof BackendRequestError)) {
    return NextResponse.json(
      { message: fallbackMessage },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (error.status === 401) {
    await clearAccessToken();
  }

  const status = [400, 401, 403, 404, 409, 422, 502, 503].includes(error.status)
    ? error.status
    : 500;
  const message = status === 401
    ? "Please log in with a staff account."
    : status === 403
      ? "Your account does not have permission to manage booking reviews."
      : status === 404
        ? "Booking review not found."
        : backendMessage(error.body) ?? fallbackMessage;

  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
