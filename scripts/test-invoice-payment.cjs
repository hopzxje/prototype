const assert = require('node:assert/strict');
const { update } = require('../js/invoice-payment-state.js');

const base = [
  { id: 'one', total: 100, status: 'UNPAID' },
  { id: 'two', total: 200, status: 'PAID' },
];
const restore = state => JSON.parse(JSON.stringify(state));
const create = (state = base, now = 1000, reference = 'PAY-1') =>
  update(state, 'one', { type: 'CREATE' }, now, reference);
const resolve = (state, result, now = 1003, id = 'PAY-1') =>
  update(state, 'one', { type: 'RESOLVE', id, result }, now);

// Creation and duplicate clicks preserve the original state and pending session.
let state = create();
assert.equal(base[0].paymentAttempts, undefined);
assert.equal(state[0].paymentAttempts[0].amount, 100);
assert.equal(state[0].paymentAttempts[0].expiresAt, 901000);
assert.deepEqual(create(state, 1001, 'PAY-2'), state);
assert.deepEqual(create(state, 1001, 'PAY-1'), state);

// Reporting a transfer is idempotent and does not mark an invoice paid.
state = update(state, 'one', { type: 'SUBMIT', id: 'PAY-1' }, 1002);
assert.equal(state[0].status, 'UNPAID');
assert.equal(state[0].paymentAttempts[0].submitted, true);
assert.deepEqual(update(state, 'one', { type: 'SUBMIT', id: 'PAY-1' }, 1003), state);

// Failed attempts can be retried; terminal callbacks cannot change the result.
state = resolve(state, 'FAILED');
assert.equal(state[0].status, 'UNPAID');
assert.equal(state[0].paymentAttempts[0].status, 'FAILED');
assert.deepEqual(resolve(state, 'SUCCESS', 1004), state);
state = create(state, 1004, 'PAY-2');
assert.equal(state[0].paymentAttempts.length, 2);
assert.equal(state[0].paymentAttempts[0].submitted, false);
state = resolve(state, 'SUCCESS', 1005, 'PAY-2');
assert.equal(state[0].status, 'PAID');
assert.equal(state[0].paymentReference, 'PAY-2');
assert.equal(state[0].paymentDate, new Date(1005).toISOString());
assert.equal(state[0].method, 'QR demo');
assert.throws(() => create(state, 1006, 'PAY-3'), /đã thanh toán/);
assert.deepEqual(resolve(state, 'SUCCESS', 1007, 'PAY-2'), state);
assert.deepEqual(resolve(state, 'FAILED', 1007, 'PAY-2'), state);

// Browser persistence retains attempts, receipts, and callback idempotency.
assert.deepEqual(update(restore(state), 'one', { type: 'TICK' }, 1008), state);
assert.deepEqual(resolve(restore(state), 'SUCCESS', 1008, 'PAY-2'), state);
const restoredPending = restore(create());
const directSuccess = resolve(restoredPending, 'SUCCESS');
assert.equal(directSuccess[0].status, 'PAID');
assert.equal(directSuccess[0].paymentAttempts[0].submitted, false);
assert.equal(restoredPending[0].status, 'UNPAID');

// Time expiration wins over a success callback, including the exact boundary.
for (const now of [901000, 901001]) {
  const expired = resolve(restore(create()), 'SUCCESS', now);
  assert.equal(expired[0].paymentAttempts[0].status, 'EXPIRED');
  assert.equal(expired[0].paymentAttempts[0].finishedAt, 901000);
  assert.equal(expired[0].status, 'UNPAID');
  assert.equal(expired[0].paymentReference, undefined);
  assert.deepEqual(resolve(expired, 'SUCCESS', now + 1), expired);
}
assert.equal(resolve(create(), 'SUCCESS', 900999)[0].status, 'PAID');
const expiredByTick = update(create(), 'one', { type: 'TICK' }, 901000);
assert.equal(expiredByTick[0].paymentAttempts[0].status, 'EXPIRED');
assert.throws(() => update(expiredByTick, 'one', { type: 'SUBMIT', id: 'PAY-1' }, 901001), /không còn hiệu lực/);
const retriedAfterExpiration = create(expiredByTick, 901001, 'PAY-2');
assert.equal(retriedAfterExpiration[0].paymentAttempts.length, 2);
assert.equal(retriedAfterExpiration[0].paymentAttempts[0].status, 'PENDING');
const manuallyExpired = resolve(create(), 'EXPIRED');
assert.equal(manuallyExpired[0].status, 'UNPAID');
assert.equal(manuallyExpired[0].paymentAttempts[0].status, 'EXPIRED');

// Only positive integer VND amounts within the safe numeric range may be paid.
for (const total of [0, -1, 0.5, '100', null, undefined, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  const invalidInvoice = [{ id: 'one', total, status: 'UNPAID' }];
  assert.throws(() => create(invalidInvoice), /không hợp lệ/);
  const changedInvoice = create();
  changedInvoice[0].total = total;
  for (const result of ['SUCCESS', 'FAILED', 'EXPIRED']) {
    assert.throws(() => resolve(changedInvoice, result), /không hợp lệ/);
  }
  assert.equal(changedInvoice[0].status, 'UNPAID');
  assert.equal(changedInvoice[0].paymentAttempts[0].status, 'PENDING');
  assert.equal(changedInvoice[0].paymentReference, undefined);
}
for (const total of [1, Number.MAX_SAFE_INTEGER]) {
  assert.equal(resolve(create([{ id: 'one', total, status: 'UNPAID' }]), 'SUCCESS')[0].status, 'PAID');
}

// Changes to invoice status or amount after QR creation must never create a receipt.
for (const status of ['PAID', 'CANCELLED', 'DRAFT', '', undefined]) {
  assert.throws(() => create([{ id: 'one', total: 100, status }]));
  const changedInvoice = create();
  changedInvoice[0].status = status;
  assert.throws(() => resolve(changedInvoice, 'SUCCESS'));
  assert.equal(changedInvoice[0].paymentAttempts[0].status, 'PENDING');
  assert.equal(changedInvoice[0].paymentReference, undefined);
}
for (const total of [99, 101]) {
  const changedInvoice = create();
  changedInvoice[0].total = total;
  const unchanged = restore(changedInvoice);
  assert.throws(() => resolve(changedInvoice, 'SUCCESS'), /Số tiền hóa đơn đã thay đổi/);
  assert.throws(() => update(changedInvoice, 'one', { type: 'SUBMIT', id: 'PAY-1' }, 1002), /Số tiền hóa đơn đã thay đổi/);
  assert.deepEqual(changedInvoice, unchanged);
}
for (const amount of [0, -100, 99, '100', null]) {
  const changedAttempt = create();
  changedAttempt[0].paymentAttempts[0].amount = amount;
  assert.throws(() => resolve(changedAttempt, 'SUCCESS'), /Số tiền hóa đơn đã thay đổi/);
  assert.equal(changedAttempt[0].status, 'UNPAID');
}

// Reference collisions and malformed actions cannot modify stored invoices.
const collision = restore(base);
collision.push({ id: 'three', total: 300, status: 'UNPAID', paymentAttempts: [{ id: 'PAY-1', status: 'FAILED' }] });
assert.throws(() => create(collision), /Mã giao dịch không hợp lệ/);
assert.throws(() => create(base, 1000, ''), /Mã giao dịch không hợp lệ/);
assert.throws(() => update(base, 'missing', { type: 'CREATE' }, 1000, 'PAY-1'), /Không tìm thấy hóa đơn/);
assert.throws(() => resolve(create(), 'UNKNOWN'), /Kết quả không hợp lệ/);
assert.throws(() => resolve(create(), 'SUCCESS', 1003, 'missing'), /Không tìm thấy giao dịch/);
assert.throws(() => update(base, 'one', { type: 'UNKNOWN' }, 1000), /Thao tác không hợp lệ/);

console.log('PASS: payment lifecycle, idempotency, retry, persistence, expiration, invoice validation, amount changes, and reference collisions');
