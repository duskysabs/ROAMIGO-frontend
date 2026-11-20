import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const url = source => "data:text/javascript;base64," + Buffer.from(source).toString("base64");
async function moduleSource(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return url(outputText.replace(/from (["'])([^"']+)\1/g, (match, quote, name) => imports[name] ? "from " + JSON.stringify(imports[name]) : match));
}
const configUrl = await moduleSource("../lib/admin/config.ts");
const { isAdministrator, isAdminResource, adminResources } = await import(configUrl);
test("only ADMIN has administrator access", () => {
  assert.equal(isAdministrator("ADMIN"), true);
  for (const role of ["STAFF", "CUSTOMER", "DRIVER", null, undefined, "admin"]) assert.equal(isAdministrator(role), false);
});
test("only known sections and relative backend paths are configured", () => {
  for (const name of ["constructor", "__proto__", "unknown", "../staff", "https://example.test"]) assert.equal(isAdminResource(name), false);
  for (const definition of Object.values(adminResources)) {
    assert.ok(!definition.listPath.includes("://"));
    for (const action of definition.actions) assert.match(action.path, /^(admin|staff)\/[a-z-]+/);
  }
});
let counter = 0;
async function harness(session, body, origin = "https://roamigo.example") {
  const mockUrl = url([
    "export const state = { calls: [] };",
    "export class BackendRequestError extends Error { constructor(message,status,body){super(message);this.status=status;this.body=body;} }",
    "export const getSessionState = async () => (" + JSON.stringify(session) + ");",
    "export const getAccessToken = async () => 'synthetic-token';",
    "export const backendRequest = async (...args) => { state.calls.push(args); return []; };",
    "export const NextResponse = { json: (...args) => Response.json(...args) };",
    "export const instance = " + (++counter) + ";",
  ].join("\n"));
  const routeUrl = await moduleSource("../app/api/admin/[resource]/route.ts", {
    "next/server": mockUrl, "@/lib/api/backend": mockUrl, "@/lib/auth/session": mockUrl, "@/lib/admin/config": configUrl,
  });
  const route = await import(routeUrl);
  const mock = await import(mockUrl);
  const request = new Request("https://roamigo.example/api/admin/staff", {
    method: body ? "POST" : "GET", headers: { Origin: origin, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const response = await route[body ? "POST" : "GET"](request, { params: Promise.resolve({ resource: "staff" }) });
  return { response, calls: mock.state.calls };
}
test("non-Admin reads and mutations never reach the backend", async () => {
  for (const role of ["STAFF", "CUSTOMER", "DRIVER"]) {
    const session = { status: "authenticated", user: { role } };
    for (const body of [undefined, { operation: "create", values: {} }]) {
      const result = await harness(session, body);
      assert.equal(result.response.status, 403);
      assert.equal(result.calls.length, 0);
    }
  }
  const anonymous = await harness({ status: "unauthenticated" });
  assert.equal(anonymous.response.status, 401);
});
test("Admin proxy rejects foreign origins, unknown operations and privilege fields", async () => {
  const session = { status: "authenticated", user: { role: "ADMIN" } };
  for (const [body, origin, status] of [
    [{ operation: "create", values: {} }, "https://other.example", 403],
    [{ operation: "delete-everything", values: {} }, "https://roamigo.example", 400],
    [{ operation: "create", values: { role: "ADMIN" } }, "https://roamigo.example", 400],
    [{ operation: "edit", id: "../staff", values: {} }, "https://roamigo.example", 400],
  ]) {
    const result = await harness(session, body, origin);
    assert.equal(result.response.status, status);
    assert.equal(result.calls.length, 0);
  }
});
test("valid Admin read forwards the server token to the known endpoint", async () => {
  const result = await harness({ status: "authenticated", user: { role: "ADMIN" } });
  assert.equal(result.response.status, 200);
  assert.equal(result.calls[0][0], "admin/staff?limit=20&page=1");
  assert.equal(result.calls[0][1].headers.Authorization, "Bearer synthetic-token");
});
