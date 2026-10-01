import { cache } from "react";
import { cookies } from "next/headers";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { parseSessionUser, type SessionState } from "@/lib/auth/types";

const ACCESS_TOKEN_COOKIE = "roamigo_access_token";

export async function setAccessToken(
  accessToken: string,
  expiresIn?: number,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    ...(expiresIn ? { maxAge: Math.floor(expiresIn) } : {}),
  });
}

export async function clearAccessToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export const getSessionState = cache(async (): Promise<SessionState> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  try {
    const response = await backendRequest<unknown>("auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = parseSessionUser(response);

    return user
      ? { status: "authenticated", user }
      : { status: "unavailable" };
  } catch (error) {
    if (
      error instanceof BackendRequestError &&
      (error.status === 401 || error.status === 403)
    ) {
      return { status: "unauthenticated" };
    }

    return { status: "unavailable" };
  }
});
