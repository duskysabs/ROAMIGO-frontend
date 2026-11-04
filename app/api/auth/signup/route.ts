import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { setAccessToken } from "@/lib/auth/session";
import { isRecord, parseAuthenticationResponse } from "@/lib/auth/types";

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

  if (
    !EMAIL_PATTERN.test(email) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return errorResponse(
      "Use a valid email address and a password between 8 and 128 characters.",
      400,
    );
  }

  try {
    const backendResponse = await backendRequest<unknown>("auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const signup = parseAuthenticationResponse(backendResponse);

    if (!signup) {
      return errorResponse(
        "The signup service returned an invalid response.",
        502,
      );
    }

    if (signup.accessToken) {
      await setAccessToken(signup.accessToken, signup.expiresIn);
    }

    return NextResponse.json(
      {
        user: signup.user,
        requiresEmailConfirmation: signup.requiresEmailConfirmation,
        requiresProfile: signup.requiresProfile,
        nextStep: signup.nextStep,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 400 || error.status === 409) {
        return errorResponse(
          "We could not create this account. Try logging in if you already registered.",
          400,
        );
      }

      if (error.status === 429) {
        return errorResponse(
          "Too many signup attempts. Please wait and try again.",
          429,
        );
      }
    }

    return errorResponse(
      "The signup service is temporarily unavailable. Please try again.",
      503,
    );
  }
}
