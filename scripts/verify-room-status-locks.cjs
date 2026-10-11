const fs = require('fs');
const html = fs.readFileSync('pages/property/buildings.html', 'utf8');

// 1. Check edit-room-status
const editStatusBlock = html.match(/<select id="edit-room-status"[\s\S]*?<\/select>/)[0];
console.log('Edit status block:\n', editStatusBlock.trim());
if (editStatusBlock.includes('value="OCCUPIED"') || editStatusBlock.includes('value="RESERVED"')) {
  throw new Error('edit-room-status still contains OCCUPIED or RESERVED!');
}

// 2. Check detail-quick-status-select
const detailStatusBlock = html.match(/<select id="detail-quick-status-select"[\s\S]*?<\/select>/)[0];
console.log('Detail status block:\n', detailStatusBlock.trim());
if (detailStatusBlock.includes('value="OCCUPIED"') || detailStatusBlock.includes('value="RESERVED"')) {
  throw new Error('detail-quick-status-select still contains OCCUPIED or RESERVED default options!');
}

// 3. Check card lock logic
if (!html.includes("room.status === 'OCCUPIED' || room.status === 'RESERVED'")) {
  throw new Error('Missing card lock logic for OCCUPIED and RESERVED rooms!');
}

console.log('\n--- ALL STATUS AND EDIT/DELETE LOCK CHECKS PASSED! ---');
