/** Static, dependency-free QA for the standalone payment prototype. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'docs/payment-pages.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'css/payment.css'), 'utf8');
const classes = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(m => m[1]));
const errors = [];
const graph = new Map();
let linkCount = 0;
const html = file => fs.readFileSync(path.join(root,file),'utf8').replace(/>\s+</g,'><').replace(/>\s+([^<]*?)\s+</g,'>$1<');
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
for (const file of pages) {
  const source = html(file);
  const fail = message => errors.push(`${file}: ${message}`);
  if (!/^<!doctype html>/i.test(source)) fail('Missing HTML5 doctype');
  if (!source.includes('<html lang="vi">')) fail('Missing document language');
  if (!source.includes('name="viewport"')) fail('Missing responsive viewport');
  if (!source.includes('<main')) fail('Missing main landmark');
  if (/<script\b|\son\w+\s*=|javascript:|https?:\/\//i.test(source)) fail('Runtime JS or remote dependency found');
  const styles = [...source.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m=>m[1]);
  if(styles.length!==1 || styles[0]!=='css/payment.css') fail('Shared CSS missing or inconsistent');
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length) fail('Duplicate HTML IDs');
  for (const [,id] of source.matchAll(/\bfor="([^"]+)"/g)) if(!ids.includes(id)) fail(`Label target missing: ${id}`);
  for(const [,list] of source.matchAll(/\bclass="([^"]*)"/g)) for(const c of list.split(/\s+/).filter(Boolean)) if(!classes.has(c)) fail(`Undefined CSS class: ${c}`);
  const links=[];
  for(const [,url] of source.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
    linkCount++;
    if(url.startsWith('#')) { if(!ids.includes(url.slice(1))) fail(`Missing fragment: ${url}`); continue; }
    const target=url.split(/[?#]/)[0];
    if(!fs.existsSync(path.resolve(root,target))) fail(`Missing path: ${url}`);
    if(target.endsWith('.html')) links.push(target);
  }
  graph.set(file,links);
  const stack=[];
  for(const match of source.matchAll(/<!--[^]*?-->|<![^>]*>|<\/?([a-zA-Z][\w-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)) {
    if(!match[1]) continue;
    const tag=match[1].toLowerCase();
    if(match[0].startsWith('</')) {
      const open=stack.pop();
      if(open!==tag) fail(`Unbalanced HTML: closed ${tag}, expected ${open}`);
    } else if(!voidTags.has(tag) && !match[0].endsWith('/>')) stack.push(tag);
  }
  if(stack.length) fail(`Unclosed elements: ${stack.join(', ')}`);
}
// Verify all generated pages are reachable through normal links from the hub.
const visited=new Set();
function visit(file) { if(visited.has(file)) return; visited.add(file); for(const next of graph.get(file)||[]) visit(next); }
visit('index.html');
for(const file of pages) if(!visited.has(file)) errors.push(`${file}: Unreachable from index.html`);
// Critical business invariants, across both initial and retry attempts.
for(const suffix of ['', '-retry']) {
  const reference=suffix?'PAY-202610-00126':'PAY-202610-00125';
  for(const state of ['success','failed','expired']) {
    const source=html(`payment-${state}${suffix}.html`);
    assert(source.includes(reference), `Wrong reference in ${state}${suffix}`);
    assert(source.includes(`>${state.toUpperCase()}</span>`));
    assert(source.includes(`<dd><span class="badge ${state==='success'?'paid':'unpaid'}">${state==='success'?'PAID':'UNPAID'}</span></dd>`));
    if(state!=='success') assert(!/<span class="badge paid">/.test(source),'Failed transaction must not mark invoice paid');
  }
  assert(!html(`payment-processing${suffix}.html`).includes('href="invoice-paid.html"'),'Pending must not bypass verification');
}
for(const file of ['invoice-invalid.html','payment-already-paid.html']) assert(!/href="payment-qr/.test(html(file)),'Validation stop must not create QR');
for(const role of ['staff','manager']) {
  const detail=html(`${role}-payment-detail.html`);
  for(const expected of ['PAY-202610-00125','14:32','SUCCESS','PAID','webhook','xác minh','xác nhận']) assert(detail.includes(expected),`Missing staff verification evidence: ${expected}`);
}
assert(!/fetch\(|localStorage|setInterval/.test(pages.map(html).join('')),'No backend simulation allowed');
if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(`PASS: ${pages.length} HTML pages, ${linkCount} paths, valid tag nesting, CSS classes, reachability, and payment-state invariants. No runtime JavaScript or external assets.`);
