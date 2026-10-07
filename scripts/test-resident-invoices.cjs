const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const invoiceKey = 'stayhub_invoices';
const clone = value => JSON.parse(JSON.stringify(value));

function load(seed = {}) {
  const values = new Map(Object.entries(seed));
  const writes = [];
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem(key, value) {
      values.set(key, String(value));
      writes.push(key);
    },
    clear: () => values.clear()
  };
  const context = vm.createContext({ localStorage });
  vm.runInContext(`${source}\nglobalThis.api = { DataStore, DEFAULT_USERS };`, context);
  return { ...context.api, values, writes };
}

const fresh = load();
const store = fresh.DataStore;
const resident = clone(fresh.DEFAULT_USERS.RESIDENT);
assert.equal(store.getInvoices().length, 6);
assert.equal(store.getResidentInvoices().length, 0, 'The current manager does not own resident bills.');
store.setRole('RESIDENT');
const owned = clone(store.getResidentInvoices());
assert.deepEqual(owned.map(invoice => invoice.id), ['inv-1001', 'inv-res-2026-09', 'inv-res-2026-08']);
assert.equal(owned.find(invoice => invoice.month === '09/2026').status, 'UNPAID');
assert.equal(owned.find(invoice => invoice.month === '08/2026').status, 'PAID');
for (const invoice of owned.filter(invoice => invoice.isDemo)) {
  assert.match(invoice.dueDate, /^2026-0[89]-05$/);
  assert.equal(invoice.total, invoice.rent + invoice.elecTotal + invoice.waterTotal + invoice.serviceFee);
}

// Ownership must isolate both different tenants and identical room numbers in
// different properties; a stable resident ID wins over outdated display fields.
const legacy = {
  id: 'legacy', room: resident.room, building: resident.building, tenant: resident.fullName
};
assert.equal(store.isResidentInvoice(legacy), true);
assert.equal(store.isResidentInvoice({ ...legacy, building: 'StayHub Riverside - Tây Hồ' }), false);
assert.equal(store.isResidentInvoice({ ...legacy, room: 'P202' }), false);
assert.equal(store.isResidentInvoice({ ...legacy, tenant: 'Another resident' }), false);
assert.equal(store.isResidentInvoice({ ...legacy, building: undefined }), false);
assert.equal(store.isResidentInvoice({ ...legacy, residentId: 'someone-else' }), false);
assert.equal(store.isResidentInvoice({ residentId: resident.id }, resident), true);
assert.equal(store.isResidentInvoice({ residentId: resident.id }, { ...resident, id: null }), false);
assert.equal(store.isResidentInvoice(legacy, { ...resident, building: undefined }), false);
assert.equal(store.isResidentInvoice(legacy, { ...resident, role: 'MANAGER' }), false);
assert.equal(store.isResidentInvoice(legacy, null), false);
assert.equal(store.isResidentInvoice(null, resident), false);
const writeCount = fresh.writes.length;
store.getResidentInvoices(resident);
store.isResidentInvoice(legacy, resident);
assert.equal(fresh.writes.length, writeCount, 'Reading resident bills must not write storage.');

// Upgrade an existing browser without overwriting successful payments, custom
// charges, references, retry history, or the bank reconciliation history.
const paidLegacy = {
  ...legacy,
  id: 'inv-1001',
  total: 1234567,
  status: 'PAID',
  paymentDate: '2026-10-06T01:00:00.000Z',
  paymentReference: 'PAY-SAVED',
  method: 'Existing method',
  paymentAttempts: [{ id: 'PAY-SAVED', status: 'SUCCESS', events: [{ text: 'Preserve this' }] }]
};
const savedSeptember = {
  ...owned.find(invoice => invoice.id === 'inv-res-2026-09'),
  total: 9000000,
  status: 'PAID',
  paymentDate: '2026-10-06T02:00:00.000Z',
  paymentReference: 'PAY-SEP',
  paymentAttempts: [{ id: 'PAY-SEP', status: 'SUCCESS' }]
};
const unrelated = { id: 'custom-bill', total: 111, status: 'UNPAID', tenant: 'Other resident' };
const transactions = JSON.stringify([{ id: 'bank-saved', invoiceCode: 'CUSTOM', amount: 1234567 }]);
const existing = load({
  [invoiceKey]: JSON.stringify([paidLegacy, savedSeptember, unrelated]),
  stayhub_sepay_txs: transactions
});
const migrated = clone(existing.DataStore.getInvoices());
assert.equal(migrated.length, 4);
assert.deepEqual(migrated[0], { ...paidLegacy, residentId: resident.id });
assert.deepEqual(migrated[1], savedSeptember);
assert.deepEqual(migrated[2], unrelated);
assert.equal(existing.values.get('stayhub_sepay_txs'), transactions);
const migratedJson = existing.values.get(invoiceKey);
const invoiceWrites = existing.writes.filter(key => key === invoiceKey).length;
existing.DataStore.init();
assert.equal(existing.values.get(invoiceKey), migratedJson, 'Repeated initialization is idempotent.');
assert.equal(existing.writes.filter(key => key === invoiceKey).length, invoiceWrites);
const reloaded = load(Object.fromEntries(existing.values));
assert.equal(reloaded.values.get(invoiceKey), migratedJson, 'Reload preserves the completed demo payment.');
assert.equal(reloaded.writes.filter(key => key === invoiceKey).length, 0);

for (const changedOwner of [
  { ...paidLegacy, building: 'A different property' },
  { ...paidLegacy, tenant: 'A different resident' },
  { ...paidLegacy, residentId: 'resident-other' }
]) {
  const other = load({ [invoiceKey]: JSON.stringify([changedOwner]) });
  assert.deepEqual(clone(other.DataStore.getInvoices()[0]), changedOwner,
    'Migration cannot claim a reused legacy invoice ID for the demo resident.');
}

console.log('PASS: resident invoice ownership, monthly demo data, safe migration, payment history preservation and reload idempotence');
