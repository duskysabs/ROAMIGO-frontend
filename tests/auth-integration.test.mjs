import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

function moduleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}

async function sourceModule(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  });
  return moduleUrl(outputText.replace(/from (["'])([^"']+)\1/g, (match, quote, name) => {
    return imports[name] ? `from ${JSON.stringify(imports[name])}` : match;
  }));
}

const rolesUrl = await sourceModule('../lib/auth/roles.ts');
const typesUrl = await sourceModule('../lib/auth/types.ts', {
  '@/lib/auth/roles': rolesUrl,
});
const { parseSessionUser } = await import(typesUrl);
const { isStaffRole } = await import(rolesUrl);

function identity(role, isDriver = false) {
  return { user: { id: 'customer-1', isDriver, profile: { role } } };
}

test('driver linkage overrides every stored role for workspace access', () => {
  for (const role of ['STAFF', 'ADMIN', 'CUSTOMER', 'DRIVER']) {
    const user = parseSessionUser(identity(role, true));
    assert.equal(user.role, 'DRIVER');
    assert.equal(isStaffRole(user.role), false);
  }
  assert.equal(parseSessionUser(identity('STAFF')).role, 'STAFF');
  assert.equal(parseSessionUser(identity('ADMIN')).role, 'ADMIN');
});

let harnessId = 0;
async function loginHarness(login, profile) {
  const mockUrl = moduleUrl(`
    export const state = { calls: [], cookies: [], login: ${JSON.stringify(login)}, profile: ${JSON.stringify(profile)} };
    export class BackendRequestError extends Error {}
    export async function backendRequest(path) {
      state.calls.push(path);
      if (path === 'auth/login') return state.login;
      if (path === 'auth/me') return state.profile;
      throw new Error('Unexpected backend request');
    }
    export async function setAccessToken(...args) { state.cookies.push(args); }
    export const NextResponse = { json: (...args) => Response.json(...args) };
    // Isolate each route's mocked dependencies.
    export const harnessId = ${++harnessId};
  `);
  const routeUrl = await sourceModule('../app/api/auth/login/route.ts', {
    '@/lib/auth/roles': rolesUrl,
    '@/lib/auth/types': typesUrl,
    '@/lib/api/backend': mockUrl,
    '@/lib/auth/session': mockUrl,
    'next/server': mockUrl,
  });
  const { POST } = await import(routeUrl);
  const { state } = await import(mockUrl);
  const response = await POST(new Request('https://roamigo.example/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://roamigo.example' },
    body: JSON.stringify({ email: 'customer@example.test', password: 'test-password', next: '/staff' }),
  }));
  return { response, state, body: await response.json() };
}

const login = {
  accessToken: 'synthetic-token', expiresIn: 3600, user: { id: 'customer-1' },
  requiresProfile: false, nextStep: 'APPLICATION',
};

test('profile-incomplete login saves a token without requesting auth/me', async () => {
  const { response, state, body } = await loginHarness({
    ...login, requiresProfile: true, nextStep: 'COMPLETE_PROFILE',
  }, null);
  assert.equal(response.status, 200);
  assert.equal(body.nextStep, 'COMPLETE_PROFILE');
  assert.deepEqual(state.calls, ['auth/login']);
  assert.deepEqual(state.cookies, [['synthetic-token', 3600]]);
  assert.equal('accessToken' in body, false);
});

test('driver-linked STAFF login cannot enter a staff deep link', async () => {
  const { response, state } = await loginHarness(login, identity('STAFF', true));
  assert.equal(response.status, 403);
  assert.deepEqual(state.calls, ['auth/login', 'auth/me']);
  assert.deepEqual(state.cookies, []);
});

test('completed staff login verifies identity before saving the session', async () => {
  const { response, state, body } = await loginHarness(login, identity('STAFF'));
  assert.equal(response.status, 200);
  assert.equal(body.redirectTo, '/staff');
  assert.deepEqual(state.calls, ['auth/login', 'auth/me']);
  assert.equal(state.cookies.length, 1);
});

test('mismatched identity does not establish a session', async () => {
  const profile = identity('STAFF');
  profile.user.id = 'different-user';
  const { response, state } = await loginHarness(login, profile);
  assert.equal(response.status, 502);
  assert.deepEqual(state.cookies, []);
});
