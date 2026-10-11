const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const dataJs = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');

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
const DataStore = vm.runInContext(dataJs + '\n; DataStore.init(); DataStore;', ctx);

console.log('Testing DataStore helper methods...');

// Test 1: getRooms has photos and amenities
const rooms = DataStore.getRooms();
console.log('Total rooms:', rooms.length);
if (rooms.length === 0) throw new Error('No rooms loaded');
const sampleRoom = rooms[0];
console.log('Sample room:', sampleRoom.roomNumber, 'Photos:', sampleRoom.photos ? sampleRoom.photos.length : 0);
if (!sampleRoom.photos || sampleRoom.photos.length === 0) throw new Error('Room photos missing');

// Test 2: getAssetsByRoom
const roomAssets = DataStore.getAssetsByRoom('rm-201');
console.log('Assets for rm-201:', roomAssets.length);

// Test 3: getAvailableAssetsForBuilding
const inStock = DataStore.getAvailableAssetsForBuilding('bld-1');
console.log('In-stock assets for bld-1:', inStock.length);

// Test 4: getRoomContractSchedule
const schedule = DataStore.getRoomContractSchedule('rm-201', 'P201', 'bld-1');
console.log('Schedule for P201:', schedule.length);

// Test 5: findVacantRoomsByDateRange
const today = new Date().toISOString().split('T')[0];
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 60);
const futureStr = futureDate.toISOString().split('T')[0];

const vacantRooms = DataStore.findVacantRoomsByDateRange('bld-1', today, futureStr);
console.log(`Vacant rooms in bld-1 between ${today} and ${futureStr}:`, vacantRooms.length);

// Test 6: getUpcomingVacancies
const upcoming = DataStore.getUpcomingVacancies('bld-1', 60);
console.log('Upcoming vacancies within 60 days:', upcoming.length);

// Test 7: Assign asset to room and unassign
if (inStock.length > 0) {
  const targetAsset = inStock[0];
  console.log('Testing assign asset:', targetAsset.code, 'to P101');
  const assignRes = DataStore.assignAssetToRoom({
    assetId: targetAsset.id,
    buildingId: 'bld-1',
    roomId: 'rm-101',
    roomNumber: 'P101',
    notes: 'Test handover'
  });
  if (!assignRes.success) throw new Error('Assign failed: ' + assignRes.error);
  console.log('Assign success! Asset is now in room:', assignRes.asset.roomNumber);

  // Verify in room assets
  const p101Assets = DataStore.getAssetsByRoom('rm-101');
  if (!p101Assets.some(a => a.id === targetAsset.id)) throw new Error('Assigned asset not found in room');

  // Test unassign
  const unassignRes = DataStore.unassignAsset(targetAsset.id);
  if (!unassignRes.success) throw new Error('Unassign failed: ' + unassignRes.error);
  console.log('Unassign success! Asset is back in:', unassignRes.asset.roomNumber);
}

// Test 8: Verify all required IDs and functions in buildings.html
const html = fs.readFileSync('pages/property/buildings.html', 'utf8');

const requiredIds = [
  'rooms-grid',
  'rooms-timeline-view',
  'btn-range-30',
  'btn-range-60',
  'btn-range-90',
  'timeline-start-date',
  'timeline-end-date',
  'timeline-vacant-only',
  'timeline-stat-total',
  'timeline-stat-occupied',
  'timeline-stat-expiring',
  'timeline-stat-vacant',
  'timeline-matrix-container',
  'roomDetailModal',
  'detail-room-badge',
  'detail-room-title',
  'detail-room-status-pill',
  'detail-room-bld-address',
  'detail-quick-status-select',
  'detail-room-hero-img',
  'detail-room-sub-img-1',
  'detail-room-sub-img-2',
  'detail-room-area',
  'detail-room-type',
  'detail-room-price-display',
  'detail-room-deposit-display',
  'detail-tenant-container',
  'detail-assets-count-badge',
  'detail-assets-list-container',
  'detail-room-schedule-list',
  'assignAssetToRoomModal',
  'assign-asset-room-number',
  'tab-assign-from-stock',
  'tab-assign-create-new',
  'panel-assign-stock',
  'panel-assign-new',
  'assign-asset-stock-select',
  'selected-stock-asset-preview',
  'quickAssignTenantModal',
  'quick-tenant-room-badge',
  'changeRoomPhotoModal',
  'change-room-photo-url'
];

requiredIds.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing required DOM ID: ${id}`);
  }
});
console.log('All required DOM IDs verified in buildings.html!');

const requiredFunctions = [
  'switchViewMode',
  'initTimelineDateInputs',
  'setTimelineRangeDays',
  'onTimelineDateFilterChange',
  'onTimelineVacantOnlyToggle',
  'renderRoomsTimeline',
  'viewRoomDetail',
  'renderRoomDetailOccupantSection',
  'renderRoomDetailAssetsSection',
  'renderRoomDetailScheduleSection',
  'handleQuickChangeRoomStatus',
  'openAssignAssetModalForCurrentRoom',
  'switchAssignAssetTab',
  'onSelectStockAssetChange',
  'onDirectAssetTypeChange',
  'confirmAssignAssetFromStock',
  'handleCreateAndAssignNewAsset',
  'handleUnassignAssetFromRoom',
  'handleReportAssetIssue',
  'openQuickAssignTenantModal',
  'handleExecuteQuickAssignTenant',
  'openChangePhotoModal',
  'selectPresetPhoto',
  'handleSaveRoomPhotoCustom'
];

requiredFunctions.forEach(fn => {
  if (!html.includes(`function ${fn}`)) {
    throw new Error(`Missing required function: ${fn}`);
  }
});
console.log('All required functions verified in buildings.html!');

console.log('\n--- ALL 8 VERIFICATIONS PASSED SUCCESSFULLY! ---');
