export type SessionUser = {
  id: string;
  email: string | null;
  role: string | null;
  displayName: string | null;
};

export type SessionState =
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export type LoginResponse = {
  accessToken: string;
  expiresIn?: number;
  user: {
    id: string;
    email?: string | null;
  };
};

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseLoginResponse(value: unknown): LoginResponse | null {
  if (!isRecord(value) || !isRecord(value.user)) {
    return null;
  }

  const accessToken = optionalString(value.accessToken);
  const id = optionalString(value.user.id);

  if (!accessToken || !id) {
    return null;
  }

  return {
    accessToken,
    expiresIn:
      typeof value.expiresIn === "number" && value.expiresIn > 0
        ? value.expiresIn
        : undefined,
    user: {
      id,
      email: optionalString(value.user.email),
    },
  };
}

export function parseSessionUser(value: unknown): SessionUser | null {
  if (!isRecord(value) || !isRecord(value.user)) {
    return null;
  }

  const id = optionalString(value.user.id);

  if (!id) {
    return null;
  }

  const profile = isRecord(value.user.profile) ? value.user.profile : null;
  const firstName = optionalString(profile?.firstName);
  const lastName = optionalString(profile?.lastName);
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

  return {
    id,
    email: optionalString(value.user.email),
    role: optionalString(profile?.role),
    displayName,
  };
}
