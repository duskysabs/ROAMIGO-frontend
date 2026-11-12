export type ApplicationRole = "ADMIN" | "CUSTOMER" | "DRIVER" | "STAFF";

export function parseApplicationRole(value: unknown): ApplicationRole | null {
  if (
    value === "ADMIN" ||
    value === "CUSTOMER" ||
    value === "DRIVER" ||
    value === "STAFF"
  ) {
    return value;
  }

  return null;
}

function safeInternalPathname(value?: string): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x20]/.test(value)
  ) {
    return null;
  }

  return new URL(value, "https://roamigo.local").pathname;
}

export function isStaffRole(role: ApplicationRole | null): boolean {
  return role === "ADMIN" || role === "STAFF";
}

export function isStaffWorkspacePath(value?: string): boolean {
  const path = safeInternalPathname(value);

  return Boolean(
    path &&
      (path === "/staff" ||
        path.startsWith("/staff/") ||
        path === "/accounting" ||
        path.startsWith("/accounting/")),
  );
}

export function roleHome(role: ApplicationRole | null): string {
  if (role === "ADMIN") return "/accounting";
  if (role === "STAFF") return "/staff";
  if (role === "DRIVER") return "/";
  return "/customer";
}

export function loginDestination(
  role: ApplicationRole | null,
  next?: string,
): string {
  const home = roleHome(role);
  const path = safeInternalPathname(next);

  if (
    !next ||
    !path ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/")
  ) {
    return home;
  }

  const staffPath = isStaffWorkspacePath(next);
  if (isStaffRole(role)) return staffPath ? next : home;
  return staffPath ? home : next;
}
