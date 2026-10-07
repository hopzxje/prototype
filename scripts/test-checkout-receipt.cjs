const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const values = new Map();
const panel = { innerHTML: '' };
const context = vm.createContext({
  localStorage: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), clear: () => values.clear() },
  document: { addEventListener() {}, getElementById: () => panel },
  window: { location: { pathname: '/pages/operations/checkout.html' } },
  lucide: { createIcons() {} }, console
});
const run = code => vm.runInContext(code,context);
for (const file of ['js/data.js','js/app.js','js/operations/checkout.js']) run(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
run('showToast = () => {}; closeModal = () => {}; renderManagementView = () => {}; selectResidentStep = () => {};');
const saved = () => values.get('stayhub_checkout_requests');
const target = () => JSON.parse(saved()).find(r => r.id === 'req-04');
const resident = () => run("DataStore.setRole('RESIDENT'); DataStore.updateUser({id:'resident-trang',fullName:'Trần Thu Trang',room:'P402',building:'StayHub Central - Ba Đình'});");
resident();
let before = saved();
run('confirmResidentRefundReceived(); confirmManagerRefund();');
assert.equal(saved(),before,'A resident cannot confirm before transfer or approve a transfer.');
run("DataStore.setRole('MANAGER'); confirmManagerRefund();");
assert.equal(target().status,'REFUND_TRANSFERRED');
assert.equal(target().depositSettlementStatus,'TRANSFERRED');
assert.ok(target().refundTransferredAt);
assert.equal(target().refundReceivedAt,undefined);
before = saved();
run('confirmManagerRefund(); confirmResidentRefundReceived();');
assert.equal(saved(),before,'Duplicate transfer and manager receipt confirmation cannot close the case.');
run("DataStore.setRole('RESIDENT'); confirmResidentRefundReceived();");
assert.equal(saved(),before,'Another resident cannot acknowledge this refund.');
resident();
run('currentResidentStep=4; renderResidentStepContent();');
assert.match(panel.innerHTML,/Xác nhận đã nhận tiền cọc/);
assert.doesNotMatch(panel.innerHTML,/Duyệt ngay \(Demo\)/);
run('DataStore.init(); confirmResidentRefundReceived();');
assert.equal(target().status,'CLOSED');
assert.equal(target().depositSettlementStatus,'PAID');
assert.equal(target().refundReceivedBy,'resident-trang');
assert.ok(target().refundReceivedAt);
before = saved();
run('confirmResidentRefundReceived(); DataStore.init();');
assert.equal(saved(),before,'Receipt persists and duplicate clicks are idempotent.');
run('renderResidentStepContent();');
assert.match(panel.innerHTML,/Bạn đã xác nhận nhận đủ khoản hoàn/);
assert.doesNotMatch(panel.innerHTML,/onclick="confirmResidentRefundReceived/);
// Early checkout refunds unused prepaid rent while keeping the deposit forfeited.
run("DataStore.resetAll(); const reqs=DataStore.getCheckoutRequests(); reqs[0].status='REFUND_PENDING'; reqs[0].isSigned=true; DataStore.saveCheckoutRequests(reqs); activeRefundId='req-01'; confirmManagerRefund();");
assert.equal(JSON.parse(saved())[0].depositSettlementStatus,'FORFEITED');
assert.equal(JSON.parse(saved())[0].status,'REFUND_TRANSFERRED');
run("DataStore.setRole('RESIDENT'); currentResidentStep=4; renderResidentStepContent();");
assert.match(panel.innerHTML,/Xác nhận đã nhận tiền thuê dư/);
run('confirmResidentRefundReceived();');
assert.equal(JSON.parse(saved())[0].status,'CLOSED');
assert.equal(JSON.parse(saved())[0].depositSettlementStatus,'FORFEITED');
assert.equal(JSON.parse(saved())[0].prepaidRentSettlementStatus,'PAID');
console.log('PASS: transfer awaits receipt, role and ownership checks, resident confirmation UI, repeat clicks, persistence and prepaid rent refund');
