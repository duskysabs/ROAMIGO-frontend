import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../lib/auth/roles.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { isStaffRole, loginDestination } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('backend STAFF and ADMIN roles can access either section', () => {
  assert.equal(isStaffRole('STAFF'), true);
  assert.equal(isStaffRole('ADMIN'), true);
  for (const role of ['CUSTOMER', 'DRIVER', 'booking_staff', 'accounting_staff', null, '']) assert.equal(isStaffRole(role), false);
});
test('staff login defaults to booking and preserves accounting deep links', () => {
  assert.equal(loginDestination('STAFF'), '/staff');
  assert.equal(loginDestination('STAFF', '/accounting/payments?tab=review'), '/accounting/payments?tab=review');
  assert.equal(loginDestination('STAFF', '/staff/bookings/BKG-1'), '/staff/bookings/BKG-1');
  assert.equal(loginDestination('STAFF', '/customer'), '/staff');
});
test('customers cannot be redirected into protected staff sections', () => {
  for (const path of ['/staff', '/staff/bookings/123', '/accounting', '/accounting/refunds']) assert.equal(loginDestination('CUSTOMER', path), '/customer');
  assert.equal(loginDestination('CUSTOMER', '/my-bookings?status=confirmed'), '/my-bookings?status=confirmed');
});
test('unsafe redirects and login loops are rejected', () => {
  for (const path of ['https://evil.example', '//evil.example', '/\\evil.example', '/\nevil.example', '/auth/login', '/api/auth/logout']) assert.equal(loginDestination('STAFF', path), '/staff');
});


test('drivers return home instead of customer-only booking routes', () => {
  for (const path of [undefined, '/my-bookings', '/my-bookings/123', '/customer', '/staff', '/accounting']) {
    assert.equal(loginDestination('DRIVER', path), '/');
  }
});


test('Admin login defaults to administration and protects Admin deep links', () => {
  assert.equal(loginDestination('ADMIN'), '/admin');
  assert.equal(loginDestination('ADMIN', '/admin/staff'), '/admin/staff');
  assert.equal(loginDestination('ADMIN', '/accounting/payments'), '/accounting/payments');
  for (const [role, home] of [['STAFF', '/staff'], ['CUSTOMER', '/customer'], ['DRIVER', '/']]) {
    assert.equal(loginDestination(role, '/admin'), home);
    assert.equal(loginDestination(role, '/admin/staff'), home);
  }
});
