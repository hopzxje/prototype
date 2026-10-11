const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

console.log('Testing Staff role has NO contract approval functionality...');

const root = path.join(__dirname, '..');
const contractsHtml = fs.readFileSync(path.join(root, 'pages', 'finance', 'contracts.html'), 'utf8');

// 1. Verify code checks role before displaying approval buttons
assert.ok(contractsHtml.includes("isManagerOrAdmin = (role === 'MANAGER' || role === 'ADMIN')"), 'Role check must exist in viewFullContractModal');
assert.ok(contractsHtml.includes("isManagerOrAdmin = (currentRole === 'MANAGER' || currentRole === 'ADMIN')"), 'Role check must exist in renderContracts');

// 2. Verify alert banner is protected
assert.ok(contractsHtml.includes("countPending > 0 && isManagerOrAdmin"), 'Alert banner must only show for Manager / Admin');

// 3. Verify action button in table protects against Staff
assert.ok(contractsHtml.includes("Xem HĐ (Chờ duyệt)"), 'Staff button must say Xem HĐ (Chờ duyệt) instead of Kiểm tra & Duyệt');

// 4. Verify approveContract and reject modals protect against Staff
assert.ok(contractsHtml.includes("Tài khoản Nhân viên (Staff) không có quyền phê duyệt hợp đồng!"), 'approveContract must reject Staff');
assert.ok(contractsHtml.includes("Tài khoản Nhân viên (Staff) không có quyền từ chối phê duyệt hợp đồng!"), 'openRejectContractModal must reject Staff');

// 5. Verify scripts in contracts.html compile cleanly
for (const match of contractsHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(match[1])) {
    new vm.Script(match[2]);
  }
}

console.log('PASS: STAFF CONTRACT APPROVAL PERMISSION PROPERLY RESTRICTED & VERIFIED!');
