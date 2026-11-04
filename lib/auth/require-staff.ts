import { notFound, redirect } from "next/navigation";
import { getSessionState } from "./session";
import { isStaffRole } from "./roles";

// Check pages too: layouts can be reused during client navigation.
export async function requireStaff(section: "booking" | "accounting") {
  const session = await getSessionState();
  if (session.status === "unauthenticated") redirect(`/auth/login?next=${section === "booking" ? "/staff" : "/accounting"}`);
  if (session.status === "unavailable") throw new Error("Unable to verify staff access. Please try again.");
  if (!isStaffRole(session.user.role)) notFound();
  return session.user;
}
