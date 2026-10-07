/* Adds behavior to the original StayHub invoice modal; no replacement layout. */
const paymentEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paymentTime = value => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
let paymentBusy = false;
function paymentStats() {
  const invoices = DataStore.getInvoices();
  for (const [name, status] of [['paid', 'PAID'], ['unpaid', 'UNPAID']]) {
    const list = invoices.filter(i => i.status === status);
    document.getElementById(`payment-total-${name}`).textContent = formatVND(list.reduce((sum, i) => sum + i.total, 0));
    document.getElementById(`payment-count-${name}`).textContent = list.length;
  }
}
function renderPaymentPanel() {
  const inv = DataStore.getInvoices().find(i => i.id === activeInvoiceId);
  if (!inv) return;
  const attempts = inv.paymentAttempts || [];
  const a = attempts[0];
  const pending = a?.status === 'PENDING';
  const btn = document.getElementById('btn-mark-paid');
  btn.disabled = paymentBusy || (pending && a.submitted);
  btn.style.display = inv.status === 'PAID' ? 'none' : 'inline-block';
  btn.textContent = pending ? (a.submitted ? 'Đang chờ xác minh…' : 'Tôi đã hoàn tất thanh toán') : attempts.length ? 'Thử lại · Tạo giao dịch mới' : 'Xác nhận & tạo giao dịch';
  const tag = document.getElementById('inv-status-tag');
  tag.className = `badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'} text-xs`;
  tag.textContent = inv.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN';
  document.getElementById('inv-qr-memo').textContent = a ? a.id : `STAYHUB ${inv.code}`;
  document.getElementById('inv-qr-code').style.opacity = pending ? '1' : '.3';
  const labels = { PENDING: a?.submitted ? 'Đang chờ xác minh' : 'Đang chờ thanh toán', SUCCESS: 'Thanh toán thành công', FAILED: 'Thanh toán thất bại · Có thể thử lại', EXPIRED: 'Phiên thanh toán hết hạn · Có thể thử lại' };
  const status = a ? `<div class="p-3 bg-slate-50 rounded-lg border border-slate-200"><p class="font-bold ${a.status === 'SUCCESS' ? 'text-emerald-700' : 'text-slate-900'}">${labels[a.status]}</p><p class="mt-1 font-mono">${paymentEscape(a.id)}</p>${pending ? '<p class="mt-1">QR demo hết hạn sau <strong id="payment-countdown"></strong></p>' : `<p class="mt-1">${paymentTime(a.finishedAt)}</p>`}</div>` : `<p class="text-slate-500">${inv.status === 'PAID' ? 'Hóa đơn đã thanh toán. Không tạo thêm giao dịch.' : 'Kiểm tra hóa đơn rồi nhấn xác nhận để tạo giao dịch và bắt đầu phiên QR 15 phút.'}</p>`;
  const history = attempts.length ? `<details class="border border-slate-200 rounded-lg p-3"><summary class="font-semibold text-slate-700 cursor-pointer">Lịch sử thanh toán (${attempts.length} lần thử)</summary><div class="overflow-x-auto mt-3"><table class="w-full text-left text-xs"><thead class="bg-slate-50"><tr><th class="p-2">Mã giao dịch</th><th class="p-2">Thời gian</th><th class="p-2">Số tiền</th><th class="p-2">Kết quả</th></tr></thead><tbody>${attempts.map(item => `<tr class="border-t border-slate-100"><td class="p-2 font-mono">${paymentEscape(item.id)}</td><td class="p-2">${paymentTime(item.createdAt)}</td><td class="p-2">${formatVND(item.amount)}</td><td class="p-2"><span class="badge ${item.status === 'SUCCESS' ? 'badge-success' : item.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}">${item.status}</span></td></tr>`).join('')}</tbody></table></div>${attempts.map(item => `<details class="mt-2"><summary class="cursor-pointer text-teal-700">Tiến trình ${paymentEscape(item.id)}</summary><ul class="mt-2 space-y-1 text-slate-500">${item.events.map(e => `<li>${paymentTime(e.at)} · ${paymentEscape(e.text)}</li>`).join('')}</ul></details>`).join('')}</details>` : '';
  const controls = pending ? `<details class="no-print border border-slate-200 rounded-lg p-3"><summary class="font-semibold text-slate-500 cursor-pointer">Mô phỏng kết quả thanh toán</summary><p class="text-slate-400 mt-2">Chỉ dùng thử luồng, không xác nhận tiền thật.</p><div class="flex flex-wrap gap-2 mt-2">${[['SUCCESS','Thành công'],['FAILED','Thất bại'],['EXPIRED','Hết hạn']].map(([value,label]) => `<button type="button" data-payment-result="${value}" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-teal-700 font-semibold">${label}</button>`).join('')}</div></details>` : '';
  document.getElementById('invoice-payment-panel').innerHTML = status + history + controls;
  updatePaymentCountdown();
}
function updatePaymentCountdown() {
  const el = document.getElementById('payment-countdown');
  if (!el) return;
  const a = DataStore.getInvoices().find(i => i.id === activeInvoiceId)?.paymentAttempts?.[0];
  if (!a) return;
  const seconds = Math.max(0, Math.ceil((a.expiresAt - Date.now()) / 1000));
  el.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
async function changeInvoicePayment(action) {
  if (paymentBusy || !activeInvoiceId) return;
  paymentBusy = true;
  const invoiceId = activeInvoiceId;
  try {
    const run = () => {
      const invoices = DataStore.getInvoices();
      const inv = invoices.find(i => i.id === invoiceId);
      if (!inv) throw Error('Không tìm thấy hóa đơn.');
      const random = Array.from(crypto.getRandomValues(new Uint8Array(4)), n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      const updated = InvoicePaymentState.update(invoices, invoiceId, action, Date.now(), `PAY-${Date.now().toString(36).toUpperCase()}-${random}`);
      DataStore.saveInvoices(updated);
    };
    if (navigator.locks) await navigator.locks.request('stayhub-invoice-payments', run); else run();
    renderInvoicesTable(); paymentStats();
  } catch (error) { showToast(error.message || 'Không thể lưu giao dịch.', 'error'); }
  finally { paymentBusy = false; renderPaymentPanel(); }
}
function runInvoicePayment() {
  const inv = DataStore.getInvoices().find(i => i.id === activeInvoiceId);
  const a = inv?.paymentAttempts?.find(item => item.status === 'PENDING');
  changeInvoicePayment(a ? { type: 'SUBMIT', id: a.id } : { type: 'CREATE' });
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-payment-result]');
  if (!button) return;
  const a = DataStore.getInvoices().find(i => i.id === activeInvoiceId)?.paymentAttempts?.find(item => item.status === 'PENDING');
  if (a) changeInvoicePayment({ type: 'RESOLVE', id: a.id, result: button.dataset.paymentResult });
});
document.addEventListener('DOMContentLoaded', paymentStats);
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEYS.INVOICES || event.key === null) { renderInvoicesTable(); paymentStats(); renderPaymentPanel(); }
});
setInterval(() => {
  if (!activeInvoiceId) return;
  const a = DataStore.getInvoices().find(i => i.id === activeInvoiceId)?.paymentAttempts?.find(item => item.status === 'PENDING');
  if (a && Date.now() >= a.expiresAt) changeInvoicePayment({ type: 'TICK' });
  else updatePaymentCountdown();
}, 1000);
