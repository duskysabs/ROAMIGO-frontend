import { NextResponse } from "next/server";
import { clearAccessToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "The request origin is not allowed." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  await clearAccessToken();

  return NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
