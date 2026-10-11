const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const values = new Map();
const context = vm.createContext({
  localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    clear: () => values.clear()
  },
  document: { addEventListener() {} },
  window: { addEventListener() {}, location: { pathname: '/pages/property/assets.html', href: 'http://localhost/pages/property/assets.html' } },
  setInterval() {},
  setTimeout() {},
  console,
  URL
});

vm.runInContext(read('js/data.js'), context);
vm.runInContext(read('js/app.js'), context);

const run = source => vm.runInContext(source, context);

// Test DataStore logic
const rooms = run("DataStore.getRooms().filter(r => r.buildingId === 'bld-1')");
const assets = run("DataStore.getAssets()");

const room201Assets = assets.filter(a => a.roomId === 'rm-201' || a.roomNumber === 'P201');
console.log(`Room P201 currently has ${room201Assets.length} assets.`);
assert.ok(room201Assets.length > 0, 'P201 should have assets');

// Calculate empty rooms (chưa có đồ)
const emptyRooms = rooms.filter(r => {
  const ra = assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber);
  return ra.length === 0;
});

console.log(`Total rooms in bld-1: ${rooms.length}, Rooms without equipment: ${emptyRooms.length}`);
assert.ok(!emptyRooms.some(r => r.roomNumber === 'P201'), 'P201 must NOT be in emptyRooms list');
assert.ok(emptyRooms.some(r => r.roomNumber === 'P103'), 'P103 should be in emptyRooms list');

// Verify that assets.html contains the empty room filter checkbox and logic
const assetsHtml = read('pages/property/assets.html');
assert.ok(assetsHtml.includes('modal-filter-only-empty-rooms'), 'Checkbox modal-filter-only-empty-rooms must exist in assets.html');
assert.ok(assetsHtml.includes('Chỉ hiện phòng chưa có đồ'), 'Label "Chỉ hiện phòng chưa có đồ" must exist');
assert.ok(assetsHtml.includes('Chưa có đồ (Sẵn sàng nhận thiết bị)'), 'Status note must exist');

// Verify scripts in assets.html can compile without error
for (const match of assetsHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(match[1])) {
    new vm.Script(match[2]);
  }
}

console.log('PASS: ALL ASSIGN EMPTY ROOM FILTERS & LOGIC VERIFIED SUCCESSFULLY!');
