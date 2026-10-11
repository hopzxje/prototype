const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dataJs = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
const buildingsHtml = fs.readFileSync(path.join(root, 'pages/property/buildings.html'), 'utf8');

// Mock localStorage and DOM environment
const store = new Map();
let alertMsg = null;
let toastMsg = null;

const ctx = {
  localStorage: {
    getItem: k => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    clear: () => store.clear()
  },
  alert: msg => { alertMsg = msg; },
  confirm: msg => true,
  console
};

vm.createContext(ctx);
const DataStore = vm.runInContext(dataJs + '\n; DataStore.init(); DataStore;', ctx);

// Test 1: DataStore.deleteRoom safety check
const occupiedRoom = DataStore.getRooms().find(r => r.status === 'OCCUPIED');
console.log('Testing DataStore.deleteRoom on OCCUPIED room:', occupiedRoom.roomNumber);
const delRes1 = DataStore.deleteRoom(occupiedRoom.id);
if (delRes1.success) throw new Error('DataStore allowed deleting an OCCUPIED room!');
console.log('Result 1 (OCCUPIED blocked):', delRes1.error);

// Create a mock RESERVED room
const rooms = DataStore.getRooms();
const mockReserved = { ...rooms[rooms.length - 1], id: 'rm-test-reserved', roomNumber: 'P999', status: 'RESERVED' };
rooms.push(mockReserved);
DataStore.saveRooms(rooms);

console.log('Testing DataStore.deleteRoom on RESERVED room: P999');
const delRes2 = DataStore.deleteRoom('rm-test-reserved');
if (delRes2.success) throw new Error('DataStore allowed deleting a RESERVED room!');
console.log('Result 2 (RESERVED blocked):', delRes2.error);

// Test 2: HTML checks
// Check 1: Card generation in HTML has lock logic
if (!buildingsHtml.includes("(room.status === 'OCCUPIED' || room.status === 'RESERVED') ? `")) {
  throw new Error('Missing card template check for OCCUPIED and RESERVED rooms!');
}

const cleanHtml = buildingsHtml.replace(/\r\n/g, '\n');

// Check 2: openEditRoomModal guards
if (!cleanHtml.includes("if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {\n        alert(`Không thể chỉnh sửa phòng!")) {
  throw new Error('openEditRoomModal does not guard against OCCUPIED and RESERVED rooms!');
}

// Check 3: handleDeleteRoom guards
if (!cleanHtml.includes("if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {\n        alert(`Không thể xóa phòng!")) {
  throw new Error('handleDeleteRoom does not guard against OCCUPIED and RESERVED rooms!');
}

// Check 4: edit-room-status only has AVAILABLE and MAINTENANCE
const editSelect = buildingsHtml.match(/<select id="edit-room-status"[\s\S]*?<\/select>/)[0];
if (editSelect.includes('OCCUPIED') || editSelect.includes('RESERVED')) {
  throw new Error('edit-room-status dropdown still contains OCCUPIED or RESERVED!');
}
if (!editSelect.includes('AVAILABLE') || !editSelect.includes('MAINTENANCE')) {
  throw new Error('edit-room-status dropdown missing AVAILABLE or MAINTENANCE!');
}

// Check 5: detail-quick-status-select only has AVAILABLE and MAINTENANCE
const quickSelect = buildingsHtml.match(/<select id="detail-quick-status-select"[\s\S]*?<\/select>/)[0];
if (quickSelect.includes('OCCUPIED') || quickSelect.includes('RESERVED')) {
  throw new Error('detail-quick-status-select default options still contain OCCUPIED or RESERVED!');
}

console.log('\n--- ALL COMPREHENSIVE STATUS LOCK VERIFICATIONS PASSED SUCCESSFULLY! ---');
