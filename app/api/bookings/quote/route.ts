import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { clearAccessToken, getAccessToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: "Please log in to request a quotation." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const quote = await backendRequest<unknown>("bookings/quote", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401 || error.status === 403) {
        await clearAccessToken();
      }
      const backendBody =
        error.body && typeof error.body === "object"
          ? (error.body as { message?: unknown })
          : null;
      const rawMessage = backendBody?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.filter((item): item is string => typeof item === "string").join(" ")
        : typeof rawMessage === "string"
          ? rawMessage
          : "Unable to prepare a quotation.";
      return NextResponse.json({ message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unable to prepare a quotation." },
      { status: 500 },
    );
  }
}
