const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const values = new Map();
const context = vm.createContext({
  localStorage: {getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,String(value)), clear: () => values.clear()},
  document: {addEventListener() {}}, window: {addEventListener() {}, location: {pathname: '/pages/operations/checkout.html'}},
  setInterval() {}, setTimeout() {}, console
});
vm.runInContext(read('js/data.js'),context);
vm.runInContext(read('js/app.js'),context);
vm.runInContext(read('js/operations/checkout.js'),context);
const checkout = read('pages/operations/checkout.html');
for (const match of checkout.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(match[1])) vm.runInContext(match[2],context);
}
const run = source => vm.runInContext(source,context);
assert.equal(run('DataStore.getHandover().status'),'NOT_SCHEDULED');
assert.equal(run('DataStore.getCheckoutRequests().length'),5);
run("DataStore.saveHandover({...DataStore.getHandover(), note: 'tai saved'}); DataStore.saveCheckoutRequests([{id:'saved'}]); DataStore.init();");
assert.equal(run('DataStore.getCheckoutRequests()[0].id'),'saved');
assert.equal(run('DataStore.getHandover().note'),'tai saved');
run('DataStore.resetAll()');
const result = run("getCheckoutCase(DataStore.getCheckoutRequests().find(r => r.id === 'req-01'))");
assert.equal(result.isEarlyCheckout,true);
assert.equal(result.depositRefundAmount,0);
assert.equal(result.rentAdvance.grossUnusedRent, Math.round(8500000 * 11 / 31));
assert.equal(result.refundAmount, Math.round(8500000 * 11 / 31) - 800000);
assert.equal(run("getCheckoutCase(DataStore.getCheckoutRequests().find(r => r.id === 'req-04')).refundAmount"),9200000);
run("DataStore.saveInvoices(DataStore.getInvoices().map(i=>({...i,status:'UNPAID'})))");
assert.equal(run("getPaidRentAdvance(DataStore.getCheckoutRequests()[0]).refundAmount"),0);
for (const role of ['ADMIN','MANAGER','STAFF','RESIDENT']) assert.equal(run(`ROLE_PAGE_ACCESS.${role}.has('checkout.html')`),true);
assert.equal(run("ROLE_PAGE_ACCESS.STAFF.has('invoices.html')"),true);
assert.equal(run("appPath('resident-invoices.html')"),'../../pages/residents/invoices.html');
assert.equal(run("appPath('checkout.html')"),'../../pages/operations/checkout.html');
function inspect(dir) {
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) { inspect(file); continue; }
    if(!file.endsWith('.html') && !file.endsWith('.js')) continue;
    const source=read(file);
    if(file.endsWith('.js')) { new vm.Script(source,{filename:file}); continue; }
    for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if(!/\bsrc\s*=/.test(m[1])) new vm.Script(m[2],{filename:file});
    for(const m of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const url=m[1].split(/[?#]/)[0];
      if(!url || /^(?:[a-z]+:|\/\/)/i.test(url) || url.includes('${')) continue;
      assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),url)),`${file}: missing ${url}`);
    }
  }
}
inspect('pages'); inspect('js');
console.log('PASS: merged checkout settlement, paid-only rent refund, handover coexistence, saved data, role routes, page assets and script syntax');
