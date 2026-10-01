import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken, getAccessToken } from "@/lib/auth/session";
import { parseSessionUser } from "@/lib/auth/types";

function unauthenticatedResponse() {
  return NextResponse.json(
    { authenticated: false },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return unauthenticatedResponse();
  }

  try {
    const response = await backendRequest<unknown>("auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = parseSessionUser(response);

    if (!user) {
      return NextResponse.json(
        { message: "The session service returned an invalid response." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { authenticated: true, user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      error instanceof BackendRequestError &&
      (error.status === 401 || error.status === 403)
    ) {
      await clearAccessToken();
      return unauthenticatedResponse();
    }

    return NextResponse.json(
      { message: "The session service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
