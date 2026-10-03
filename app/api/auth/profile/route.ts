import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken, getAccessToken } from "@/lib/auth/session";
import { isRecord } from "@/lib/auth/types";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isCrossOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== new URL(request.url).origin);
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return errorResponse("The request origin is not allowed.", 403);
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return errorResponse("Please log in to complete your profile.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Enter valid profile information.", 400);
  }

  if (!isRecord(body)) {
    return errorResponse("Enter valid profile information.", 400);
  }

  const firstName = optionalText(body.firstName);
  const lastName = optionalText(body.lastName);
  const birthDate = optionalText(body.birthDate);
  const homeAddress = optionalText(body.homeAddress);

  if (
    !firstName ||
    !lastName ||
    firstName.length > 100 ||
    lastName.length > 100 ||
    (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) ||
    (homeAddress && homeAddress.length > 255)
  ) {
    return errorResponse("Enter valid profile information.", 400);
  }

  try {
    const profile = await backendRequest<unknown>("user-profiles/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        ...(birthDate ? { birthDate } : {}),
        ...(homeAddress ? { homeAddress } : {}),
      }),
    });

    return NextResponse.json(
      { completed: true, profile },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401 || error.status === 403) {
        await clearAccessToken();
        return errorResponse("Your session expired. Please log in again.", 401);
      }

      if (error.status === 409) {
        return NextResponse.json(
          { completed: true },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      if (error.status === 400) {
        return errorResponse("Review your profile information and try again.", 400);
      }
    }

    return errorResponse(
      "Profile setup is temporarily unavailable. Please try again.",
      503,
    );
  }
}
