import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend";
import { locationError } from "@/lib/api/location-errors";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const placeIds = body && typeof body === "object" && "placeIds" in body ? body.placeIds : null;
  if (!Array.isArray(placeIds) || placeIds.length < 2 || placeIds.length > 10 ||
    !placeIds.every((id) => typeof id === "string" && id.trim().length > 0 && id.length <= 500)) {
    return NextResponse.json({ message: "Choose between 2 and 10 locations." }, { status: 400 });
  }
  try {
    return NextResponse.json(await backendRequest<unknown>("routes/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeIds }),
    }));
  } catch (error) {
    return locationError(error);
  }
}
