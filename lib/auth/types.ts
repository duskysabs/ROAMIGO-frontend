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

export type AuthNextStep = "APPLICATION" | "COMPLETE_PROFILE" | "CONFIRM_EMAIL";

export type AuthenticationResponse = {
  accessToken: string | null;
  expiresIn?: number;
  user: {
    id: string;
    email?: string | null;
  };
  requiresEmailConfirmation: boolean;
  requiresProfile: boolean;
  nextStep: AuthNextStep;
};

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseNextStep(value: unknown): AuthNextStep | null {
  return value === "APPLICATION" ||
    value === "COMPLETE_PROFILE" ||
    value === "CONFIRM_EMAIL"
    ? value
    : null;
}

export function parseAuthenticationResponse(
  value: unknown,
): AuthenticationResponse | null {
  if (!isRecord(value) || !isRecord(value.user)) {
    return null;
  }

  const accessToken = optionalString(value.accessToken);
  const id = optionalString(value.user.id);
  const nextStep = parseNextStep(value.nextStep);

  if (!id || !nextStep || (nextStep !== "CONFIRM_EMAIL" && !accessToken)) {
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
    requiresEmailConfirmation: value.requiresEmailConfirmation === true,
    requiresProfile: value.requiresProfile === true,
    nextStep,
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
