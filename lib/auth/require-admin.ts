import "server-only";
import { notFound, redirect } from "next/navigation";
import { getSessionState } from "./session";
import { isAdministrator } from "@/lib/admin/config";

export async function requireAdmin() {
  const session = await getSessionState();
  if (session.status === "unauthenticated") redirect("/auth/login?next=/admin");
  if (session.status === "unavailable") throw new Error("Unable to verify administrator access. Please try again.");
  if (!isAdministrator(session.user.role)) notFound();
  return session.user;
}
