import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { getAccessToken, getSessionState } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { commandPath, isRecord, uuidPattern } from "@/lib/accounting/live";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function credentials() {
  const session = await getSessionState();
  if (session.status === "unavailable") throw new BackendRequestError("Access could not be verified.", 503, null);
  if (session.status !== "authenticated") throw new BackendRequestError("Please log in again.", 401, null);
  if (!isStaffRole(session.user.role)) throw new BackendRequestError("Staff access is required.", 403, null);
  const token = await getAccessToken();
  if (!token) throw new BackendRequestError("Please log in again.", 401, null);
  return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
}
function failure(error: unknown) {
  if (error instanceof BackendRequestError) {
    const status = [400, 401, 403, 404, 409, 422, 429].includes(error.status) ? error.status : 503;
    const message = isRecord(error.body) ? error.body.message : undefined;
    return json({ message: status >= 500 ? "The service is unavailable. A submitted change may have been saved. Retry the same action to recover its result." :
      typeof message === "string" ? message : Array.isArray(message) && message.every(item => typeof item === "string") ? message.join(" ") : error.message }, status);
  }
  return json({ message: "The request could not be completed. A submitted change may have been saved." }, 503);
}
export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const headers = await credentials();
    const { resource } = await params;
    if (resource !== "payments" && resource !== "assignments") return json({ message: "Unknown accounting queue." }, 404);
    const search = new URL(request.url).searchParams;
    if ([...search.keys()].some(key => key !== "cursor") || search.getAll("cursor").length > 1) return json({ message: "Invalid queue parameters." }, 400);
    const cursor = search.get("cursor");
    if (cursor !== null && !uuidPattern.test(cursor)) return json({ message: "Invalid queue cursor." }, 400);
    const path = resource === "payments" ? "staff/payment-reviews" : "staff/assignment-requests";
    return json(await backendRequest(path + "?limit=20" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""), { headers }));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) return json({ message: "The request origin is not allowed." }, 403);
    const headers = await credentials();
    const { resource } = await params;
    let body: unknown;
    try { body = await request.json(); } catch { return json({ message: "Invalid request body." }, 400); }
    const command = commandPath(resource, body);
    if (!command) return json({ message: "Invalid accounting command. Check the ID, fields and confirmation." }, 400);
    // Allow the bounded allocation transaction to finish before reporting an uncertain result.
    return json(await backendRequest(command.path, { method: "POST", headers, signal: AbortSignal.timeout(25_000),
      ...(Object.keys(command.values).length ? { body: JSON.stringify(command.values) } : {}) }), 201);
  } catch (error) { return failure(error); }
}
