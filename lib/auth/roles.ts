export function isStaffRole(role: string | null): boolean {
  return role === "STAFF";
}

export function roleHome(role: string | null): string {
  return isStaffRole(role) ? "/staff" : "/customer";
}

export function loginDestination(role: string | null, next?: string): string {
  const home = roleHome(role);
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\\\x00-\x20]/.test(next)) return home;
  const url = new URL(next, "https://roamigo.local");
  const path = url.pathname;
  if (path.startsWith("/auth/") || path.startsWith("/api/")) return home;
  const staffPath = path === "/staff" || path.startsWith("/staff/") || path === "/accounting" || path.startsWith("/accounting/");
  if (isStaffRole(role)) return staffPath ? next : home;
  return staffPath ? home : next;
}
