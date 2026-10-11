const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const dataJs = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
const assetsHtml = fs.readFileSync(path.join(root, 'pages/property/assets.html'), 'utf8');

// 1. Verify HTML elements exist
assert.ok(assetsHtml.includes('id="modal-asset-quantity"'), 'modal-asset-quantity input exists');
assert.ok(assetsHtml.includes('id="restockAssetModal"'), 'restockAssetModal exists');
assert.ok(assetsHtml.includes('openRestockModal('), 'openRestockModal function hook exists');
assert.ok(assetsHtml.includes('handleRestockSubmit('), 'handleRestockSubmit exists');
assert.ok(assetsHtml.includes('Nhập Thêm Số Lượng'), 'Nhập Thêm Số Lượng button exists');

// 2. Test DataStore asset batch creation & restocking
const values = new Map();
const ctx = {
  localStorage: {
    getItem: k => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, String(v)),
    clear: () => values.clear()
  },
  console
};
vm.createContext(ctx);
const DS = vm.runInContext(dataJs + '\n; DataStore.init(); DataStore;', ctx);

// Test createAsset with quantity = 4
const batch = DS.createAsset({
  code: 'AC-TEST',
  quantity: 4,
  typeCode: 'AC',
  name: 'Điều hòa Daikin 1.5HP Test',
  buildingId: 'bld-1',
  price: 11000000
});
assert.strictEqual(batch.success, true);
assert.strictEqual(batch.totalCreated, 4);
assert.strictEqual(batch.assets.length, 4);
assert.strictEqual(batch.assets[0].code, 'AC-TEST-01');
assert.strictEqual(batch.assets[1].code, 'AC-TEST-02');
assert.strictEqual(batch.assets[2].code, 'AC-TEST-03');
assert.strictEqual(batch.assets[3].code, 'AC-TEST-04');

// Test restockAsset for AC-TEST
const restockRes = DS.restockAsset(batch.assets[0].id, 3, 10500000, 'Nhập bổ sung đợt 2');
assert.strictEqual(restockRes.success, true);
assert.strictEqual(restockRes.count, 3);
assert.strictEqual(restockRes.items.length, 3);
assert.strictEqual(restockRes.items[0].code, 'AC-TEST-05');
assert.strictEqual(restockRes.items[1].code, 'AC-TEST-06');
assert.strictEqual(restockRes.items[2].code, 'AC-TEST-07');
assert.strictEqual(restockRes.items[0].price, 10500000);

// Test audit log recording
const logs = DS.getAuditLogs();
assert.ok(logs.some(l => l.action === 'NHẬP_KHO_TÀI_SẢN'));
assert.ok(logs.some(l => l.action === 'NHẬP_THÊM_SỐ_LƯỢNG'));

console.log('PASS: ALL ASSET QUANTITY & RESTOCK TESTS PASSED SUCCESSFULLY!');
