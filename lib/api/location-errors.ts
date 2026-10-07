import { NextResponse } from "next/server";
import { BackendRequestError } from "./backend";

export function locationError(error: unknown) {
  const status = error instanceof BackendRequestError ? error.status : 503;
  const message = status === 429 ? "Too many location searches. Wait a minute and try again."
    : status === 400 ? "The selected locations could not be resolved. Check them and try again."
    : "Location and routing services are unavailable. Please try again shortly.";
  return NextResponse.json({ message }, { status });
}
