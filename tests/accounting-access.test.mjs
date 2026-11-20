import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const url = source => "data:text/javascript;base64," + Buffer.from(source).toString("base64");
async function moduleSource(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return url(outputText.replace(/from (["'])([^"']+)\1/g, (match, quote, name) => imports[name] ? "from " + JSON.stringify(imports[name]) : match));
}
const liveUrl = await moduleSource("../lib/accounting/live.ts");
const { commandPath, parseQueue, assignmentMessage } = await import(liveUrl);
const id = "f491beab-3e49-4099-9ed0-11a4446b47ee";
const receipt = { operation: "record", id, values: { method: "CASH", reference: "receipt-001", amount: "1200.00", reason: "Synthetic receipt evidence" }, confirmed: true };
test("manual receipt commands preserve exact decimal evidence and normalize references", () => {
  assert.deepEqual(commandPath("payments", receipt), { path: "staff/bookings/" + id + "/payments/manual", values: { ...receipt.values, reference: "RECEIPT-001" } });
  for (const change of [{ amount: "0.00" }, { amount: "1200" }, { method: "PAYMONGO" }, { paymentStatus: "PAID" }, { reference: "../bad?" }]) {
    assert.equal(commandPath("payments", { ...receipt, values: { ...receipt.values, ...change } }), null);
  }
});
test("only confirmed, known commands with UUIDs and allowed fields are accepted", () => {
  for (const body of [{ ...receipt, confirmed: false }, { ...receipt, role: "ADMIN" }, { ...receipt, id: "../bookings" }, { ...receipt, operation: "delete" }]) assert.equal(commandPath("payments", body), null);
  assert.equal(commandPath("__proto__", receipt), null);
  assert.equal(commandPath("assignments", { operation: "retry", id, values: { reason: "extra" }, confirmed: true }), null);
  assert.equal(commandPath("assignments", { operation: "retry", id, values: {}, confirmed: true }).path, "staff/assignment-requests/" + id + "/retry");
  for (const operation of ["approve", "reject"]) assert.equal(commandPath("payments", { operation, id, values: { reason: "Verified evidence" }, confirmed: true }).path, "staff/payment-reviews/" + id + "/" + operation);
});
test("queue parsing rejects malformed results and assignment failures remain pending", () => {
  assert.deepEqual(parseQueue("payments", { items: [], nextCursor: null }).payments, []);
  assert.throws(() => parseQueue("payments", { items: [{}], nextCursor: null }));
  assert.throws(() => parseQueue("assignments", { items: [], nextCursor: "../bad" }));
  assert.match(assignmentMessage({ status: "PENDING", reason: "NO_ELIGIBLE_PAIR" }), /remains pending/);
  assert.match(assignmentMessage({ status: "ASSIGNED" }), /assigned and dispatched/);
});
let instance = 0;
async function harness(role, body, origin = "https://roamigo.example", resource = "payments", query = "") {
  const mockUrl = url([
    "export const state = { calls: [] };",
    "export class BackendRequestError extends Error { constructor(message,status,body){super(message);this.status=status;this.body=body;} }",
    "export const getSessionState = async () => (" + JSON.stringify(role ? { status: "authenticated", user: { role } } : { status: "unauthenticated" }) + ");",
    "export const getAccessToken = async () => 'synthetic-token';",
    "export const isStaffRole = role => role === 'ADMIN' || role === 'STAFF';",
    "export const backendRequest = async (...args) => { state.calls.push(args); return { items: [], nextCursor: null }; };",
    "export const NextResponse = { json: (...args) => Response.json(...args) };",
    "export const instance = " + (++instance) + ";",
  ].join("\n"));
  const routeUrl = await moduleSource("../app/api/accounting/[resource]/route.ts", {
    "next/server": mockUrl, "@/lib/api/backend": mockUrl, "@/lib/auth/session": mockUrl,
    "@/lib/auth/roles": mockUrl, "@/lib/accounting/live": liveUrl,
  });
  const route = await import(routeUrl);
  const mock = await import(mockUrl);
  const request = new Request("https://roamigo.example/api/accounting/" + resource + query, {
    method: body ? "POST" : "GET", headers: { Origin: origin, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const response = await route[body ? "POST" : "GET"](request, { params: Promise.resolve({ resource }) });
  return { response, calls: mock.state.calls };
}
test("customer, driver and anonymous accounting requests never reach backend", async () => {
  for (const role of ["CUSTOMER", "DRIVER", null]) {
    for (const body of [undefined, receipt]) {
      const result = await harness(role, body);
      assert.equal(result.response.status, role ? 403 : 401);
      assert.equal(result.calls.length, 0);
    }
  }
});
test("accounting proxy rejects foreign origins, privilege injection and invalid queues", async () => {
  for (const [body, origin, resource, query, status] of [
    [receipt, "https://foreign.example", "payments", "", 403],
    [{ ...receipt, values: { ...receipt.values, paymentStatus: "PAID" } }, "https://roamigo.example", "payments", "", 400],
    [undefined, "https://roamigo.example", "unknown", "", 404],
    [undefined, "https://roamigo.example", "payments", "?cursor=../bad", 400],
    [undefined, "https://roamigo.example", "payments", "?path=admin/staff", 400],
    [undefined, "https://roamigo.example", "payments", "?cursor=", 400],
    [undefined, "https://roamigo.example", "payments", `?cursor=${id}&cursor=${id}`, 400],
  ]) {
    const result = await harness("ADMIN", body, origin, resource, query);
    assert.equal(result.response.status, status, `${resource}${query} (${body?.operation ?? "GET"}) from ${origin}`);
    assert.equal(result.calls.length, 0);
  }
});
test("active staff roles forward only known queues and server token", async () => {
  for (const role of ["STAFF", "ADMIN"]) {
    const result = await harness(role);
    assert.equal(result.response.status, 200);
    assert.equal(result.calls[0][0], "staff/payment-reviews?limit=20");
    assert.equal(result.calls[0][1].headers.Authorization, "Bearer synthetic-token");
    const saved = await harness(role, receipt);
    assert.equal(saved.response.status, 201);
    assert.equal(saved.calls[0][0], "staff/bookings/" + id + "/payments/manual");
    assert.equal(JSON.parse(saved.calls[0][1].body).reference, "RECEIPT-001");
  }
});


test("backend requests preserve an explicit response deadline and supply a default otherwise", async () => {
  const { backendRequest } = await import(await moduleSource("../lib/api/backend.ts"));
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.BACKEND_API_URL;
  const calls = [];
  process.env.BACKEND_API_URL = "https://backend.example";
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return Response.json({ ok: true }); };
  try {
    const deadline = AbortSignal.timeout(25_000);
    await backendRequest("staff/payment-reviews", { signal: deadline });
    assert.equal(calls[0].init.signal, deadline);
    await backendRequest("staff/payment-reviews");
    assert.ok(calls[1].init.signal instanceof AbortSignal);
    assert.notEqual(calls[1].init.signal, deadline);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.BACKEND_API_URL;
    else process.env.BACKEND_API_URL = previousUrl;
  }
});
