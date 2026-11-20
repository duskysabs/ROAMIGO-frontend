import { NextResponse } from "next/server";
import { backendRequest, BackendRequestError } from "@/lib/api/backend";
import { getAccessToken, getSessionState } from "@/lib/auth/session";
import { adminResources, isAdminResource, isAdministrator, isRecord, stopFields } from "@/lib/admin/config";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function credentials() {
  const session = await getSessionState();
  if (session.status === "unavailable") throw new BackendRequestError("Unable to verify administrator access.", 503, null);
  if (session.status !== "authenticated") throw new BackendRequestError("Please log in as an administrator.", 401, null);
  if (!isAdministrator(session.user.role)) throw new BackendRequestError("Administrator access is required.", 403, null);
  const token = await getAccessToken();
  if (!token) throw new BackendRequestError("Please log in as an administrator.", 401, null);
  return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
}
function failure(error: unknown) {
  if (error instanceof BackendRequestError) {
    const status = [400, 401, 403, 404, 409, 422, 429, 502, 503].includes(error.status) ? error.status : 500;
    const message = isRecord(error.body) ? error.body.message : undefined;
    return json({ message: status >= 500 ? "The administration service is unavailable. Refresh before retrying a change." : typeof message === "string" ? message : Array.isArray(message) && message.every(item => typeof item === "string") ? message.join(" ") : error.message }, status);
  }
  return json({ message: "The administration request could not be completed." }, 500);
}
export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const headers = await credentials();
    const { resource } = await params;
    if (resource === "vehicle-types") return json(await backendRequest("booking-options/vehicle-types", { headers }));
    if (!isAdminResource(resource)) return json({ message: "Unknown administration section." }, 404);
    const definition = adminResources[resource];
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
    if (!Number.isSafeInteger(page) || page < 1) return json({ message: "Invalid page." }, 400);
    const path = definition.listPath + (definition.paginated ? "?limit=20&page=" + page : "");
    return json(await backendRequest(path, { headers }));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) return json({ message: "The request origin is not allowed." }, 403);
    const headers = await credentials();
    const { resource } = await params;
    if (!isAdminResource(resource)) return json({ message: "Unknown administration section." }, 404);
    let body: unknown;
    try { body = await request.json(); } catch { return json({ message: "Invalid request body." }, 400); }
    if (!isRecord(body) || !isRecord(body.values) || Object.keys(body).some(key => !["operation", "id", "values", "confirmed"].includes(key))) return json({ message: "Invalid administration command." }, 400);
    const command = body;
    const values = body.values;
    const action = adminResources[resource].actions.find(item => item.id === command.operation);
    if (!action || (action.record && (typeof body.id !== "string" || !uuid.test(body.id)))) return json({ message: "Invalid operation or record ID." }, 400);
    if (action.confirmation && body.confirmed !== true) return json({ message: "Confirm this change before submitting." }, 400);
    const allowed = new Set([...action.fields.map(field => field.name), ...(action.stops ? ["stops"] : [])]);
    if (Object.keys(values).some(key => !allowed.has(key))) return json({ message: "Unexpected form field." }, 400);
    if (action.stops && (!Array.isArray(values.stops) || values.stops.length < 2 || values.stops.length > 30 || values.stops.some(stop => !isRecord(stop) || Object.keys(stop).some(key => ![...stopFields.map(field => field.name), "stopType"].includes(key))))) return json({ message: "Use a route with 2 to 30 valid stops." }, 400);
    const path = action.path.replace(":id", encodeURIComponent(typeof body.id === "string" ? body.id : ""));
    const hasBody = Object.keys(values).length > 0;
    const result = await backendRequest<unknown>(path, { method: action.method, headers, ...(hasBody ? { body: JSON.stringify(values) } : {}) });
    return json(result, action.method === "POST" ? 201 : 200);
  } catch (error) { return failure(error); }
}
