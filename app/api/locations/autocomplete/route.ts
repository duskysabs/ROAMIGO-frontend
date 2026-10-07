import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/api/backend";
import { locationError } from "@/lib/api/location-errors";

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim() ?? "";
  if (text.length < 3 || text.length > 200) {
    return NextResponse.json({ message: "Enter between 3 and 200 characters." }, { status: 400 });
  }
  try {
    const query = new URLSearchParams({ text });
    const result = await backendRequest<unknown>(`locations/autocomplete?${query}`);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return locationError(error);
  }
}
