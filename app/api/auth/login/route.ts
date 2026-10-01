import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { setAccessToken } from "@/lib/auth/session";
import { isRecord, parseLoginResponse } from "@/lib/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return errorResponse("The request origin is not allowed.", 403);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Enter a valid email address and password.", 400);
  }

  if (!isRecord(body)) {
    return errorResponse("Enter a valid email address and password.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_PATTERN.test(email) || !password || password.length > 1024) {
    return errorResponse("Enter a valid email address and password.", 400);
  }

  try {
    const backendResponse = await backendRequest<unknown>("auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const login = parseLoginResponse(backendResponse);

    if (!login) {
      return errorResponse("The login service returned an invalid response.", 502);
    }

    await setAccessToken(login.accessToken, login.expiresIn);

    return NextResponse.json(
      { user: login.user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401) {
        return errorResponse("Incorrect email address or password.", 401);
      }

      if (error.status === 403) {
        return errorResponse(
          "This account is not available. Please contact Planet J staff.",
          403,
        );
      }

      if (error.status === 429) {
        return errorResponse(
          "Too many login attempts. Please wait and try again.",
          429,
        );
      }
    }

    return errorResponse(
      "The login service is temporarily unavailable. Please try again.",
      503,
    );
  }
}
