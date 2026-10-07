/* Resident monthly billing, backed by the same demo invoices as the management UI. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dialog = $('billing-dialog');
  const labels = { PAID: 'Đã thanh toán', UNPAID: 'Chưa thanh toán', PENDING: 'Đang chờ thanh toán', SUCCESS: 'Thành công', FAILED: 'Thất bại', EXPIRED: 'Hết hạn' };
  let activeId = null;
  let stage = 'details';
  let busy = false;
  let previousFocus = null;
  const monthNumber = value => { const [month, year] = value.split('/').map(Number); return year * 12 + month; };
  const ownedInvoices = () => DataStore.getResidentInvoices().sort((a, b) => monthNumber(b.month) - monthNumber(a.month));
  const currentInvoice = () => ownedInvoices().find(inv => inv.id === activeId);
  const date = value => {
    if (!value) return 'Chưa có thông tin';
    const parsed = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value);
    return Number.isNaN(parsed.getTime()) ? 'Chưa có thông tin' : parsed.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
  };
  const due = inv => inv.dueDate ? inv.dueDate.split('-').reverse().join('/') : 'Theo thông báo BQL';
  const overdue = inv => inv.status === 'UNPAID' && inv.dueDate && Date.now() > new Date(`${inv.dueDate}T23:59:59+07:00`).getTime();
  const latest = inv => inv.paymentAttempts?.[0];
  const pill = (status, text) => `<span class="billing-pill ${escape(status.toLowerCase())}">${escape(text || labels[status] || status)}</span>`;
  const button = (action, text, secondary = false, extra = '') => `<button type="button" class="billing-button${secondary ? ' billing-secondary' : ''}" data-action="${action}" ${busy ? 'disabled' : ''} ${extra}>${text}</button>`;
  const total = inv => `<div class="billing-total"><span>Tổng thanh toán</span><strong>${formatVND(inv.total)}</strong></div>`;
  const metadata = inv => `<div class="billing-invoice-meta"><div><strong>${escape(inv.tenant)} · ${escape(inv.room)}</strong><span class="billing-muted">${escape(inv.building)}</span><br><span class="billing-muted">Kỳ hóa đơn: ${escape(inv.month)} · Hạn: ${due(inv)}</span></div>${pill(inv.status)}</div>`;
  const breakdown = inv => `<table class="billing-breakdown"><thead><tr><th>Khoản thu</th><th>Thành tiền</th></tr></thead><tbody>
    <tr><td>Tiền thuê phòng<small>Kỳ ${escape(inv.month)}</small></td><td>${formatVND(inv.rent)}</td></tr>
    <tr><td>Điện sinh hoạt<small>${escape(inv.elecOld)} → ${escape(inv.elecNew)} · ${escape(inv.elecUnits)} kWh × ${formatVND(inv.elecRate)}</small></td><td>${formatVND(inv.elecTotal)}</td></tr>
    <tr><td>Nước sinh hoạt<small>${escape(inv.waterOld)} → ${escape(inv.waterNew)} · ${escape(inv.waterUnits)} m³ × ${formatVND(inv.waterRate)}</small></td><td>${formatVND(inv.waterTotal)}</td></tr>
    <tr><td>Phí dịch vụ & quản lý</td><td>${formatVND(inv.serviceFee)}</td></tr></tbody></table>${total(inv)}`;
  const simulation = () => `<details class="billing-simulation"><summary>Mô phỏng kết quả thanh toán</summary><p>Dùng để trải nghiệm phản hồi của cổng thanh toán. Không xác nhận giao dịch ngân hàng thật.</p><div>${button('resolve-success', 'Thành công', true)}${button('resolve-failed', 'Thất bại', true)}${button('resolve-expired', 'Hết hạn', true)}</div></details>`;

  function renderPage() {
    const invoices = ownedInvoices();
    const unpaid = invoices.filter(inv => inv.status === 'UNPAID');
    const paid = invoices.filter(inv => inv.status === 'PAID');
    const pending = unpaid.filter(inv => latest(inv)?.status === 'PENDING');
    const user = DataStore.getUser();
    $('billing-resident').textContent = `${user.fullName} · Căn hộ ${user.room} · ${user.building}`;
    $('billing-summary').innerHTML = `<div class="billing-stat"><p>Tổng cần thanh toán</p><strong>${formatVND(unpaid.reduce((sum, inv) => sum + inv.total, 0))}</strong><span>${unpaid.length} hóa đơn chưa thanh toán</span></div><div class="billing-stat"><p>Đã thanh toán</p><strong>${formatVND(paid.reduce((sum, inv) => sum + inv.total, 0))}</strong><span>${paid.length} hóa đơn trong lịch sử</span></div><div class="billing-stat"><p>Giao dịch đang xử lý</p><strong>${pending.length.toString().padStart(2, '0')}</strong><span>${pending.length ? 'Tiếp tục phiên thanh toán đang mở' : 'Không có giao dịch chờ xác minh'}</span></div>`;
    const next = pending[0] || [...unpaid].sort((a, b) => monthNumber(a.month) - monthNumber(b.month))[0];
    $('billing-reminder').innerHTML = next ? `<div class="billing-reminder"><div><h3>${pending.length ? 'Bạn có phiên thanh toán đang mở' : `Hóa đơn tháng ${escape(next.month)} cần thanh toán`}</h3><p>${escape(next.code)} · ${formatVND(next.total)} · ${overdue(next) ? 'Đã quá hạn' : 'Hạn thanh toán'} ${due(next)}</p></div><button type="button" class="billing-button" data-open-invoice="${escape(next.id)}">${pending.length ? 'Tiếp tục thanh toán' : 'Thanh toán ngay'} →</button></div>` : `<div class="billing-reminder"><div><h3>Bạn đã thanh toán đầy đủ</h3><p>Các khoản thanh toán đã được cập nhật. Bạn có thể xem lại biên nhận bên dưới.</p></div>${pill('PAID')}</div>`;
    const selectedMonth = $('billing-month').value;
    $('billing-month').innerHTML = '<option value="ALL">Tất cả các kỳ</option>' + [...new Set(invoices.map(inv => inv.month))].map(month => `<option value="${escape(month)}">Tháng ${escape(month)}</option>`).join('');
    if ([...$('billing-month').options].some(option => option.value === selectedMonth)) $('billing-month').value = selectedMonth;
    renderList();
    renderHistory(invoices);
  }

  function renderList() {
    const invoices = ownedInvoices().filter(inv => ($('billing-month').value === 'ALL' || inv.month === $('billing-month').value) && ($('billing-status').value === 'ALL' || inv.status === $('billing-status').value));
    $('billing-count').textContent = `${invoices.length} hóa đơn`;
    $('billing-invoices').innerHTML = invoices.map(inv => {
      const attempt = latest(inv);
      return `<tr><td><strong>Tháng ${escape(inv.month)}</strong><small>${escape(inv.code)}</small></td><td>${due(inv)}${overdue(inv) ? '<small class="billing-overdue">Đã quá hạn</small>' : ''}</td><td><strong>${formatVND(inv.total)}</strong></td><td>${pill(inv.status)}${attempt?.status === 'PENDING' ? `<small>${attempt.submitted ? 'Đang chờ xác minh' : 'Đã tạo phiên QR'}</small>` : ''}</td><td><button type="button" class="billing-button ${inv.status === 'PAID' ? 'billing-secondary' : ''}" data-open-invoice="${escape(inv.id)}">${inv.status === 'PAID' ? 'Xem biên nhận' : attempt?.status === 'PENDING' ? 'Tiếp tục thanh toán' : 'Xem & thanh toán'}</button></td></tr>`;
    }).join('') || '<tr><td colspan="5" class="billing-empty">Không có hóa đơn phù hợp với bộ lọc này.</td></tr>';
  }

  function renderHistory(invoices) {
    const rows = invoices.flatMap(inv => {
      const attempts = (inv.paymentAttempts || []).map(attempt => ({ inv, ...attempt }));
      if (inv.status === 'PAID' && !attempts.some(attempt => attempt.status === 'SUCCESS')) attempts.push({ inv, id: inv.paymentReference || inv.code, status: 'SUCCESS', amount: inv.total, createdAt: inv.paymentDate, legacy: true });
      return attempts;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    $('billing-history-count').textContent = `${rows.length} giao dịch`;
    $('billing-history').innerHTML = rows.map(row => `<tr><td><strong>${escape(row.id)}</strong><small>${escape(row.inv.code)}</small></td><td>${date(row.createdAt)}${row.legacy ? '<small>Thanh toán đã ghi nhận</small>' : ''}</td><td><strong>${formatVND(row.amount)}</strong></td><td>${pill(row.status, row.status === 'PENDING' && row.submitted ? 'Chờ xác minh' : null)}</td><td><button type="button" class="billing-link" data-open-invoice="${escape(row.inv.id)}">Xem hóa đơn →</button></td></tr>`).join('') || '<tr><td colspan="5" class="billing-empty">Chưa có giao dịch thanh toán.</td></tr>';
  }

  function renderDialog(focus = false) {
    if (!dialog.open) return;
    const inv = currentInvoice();
    if (!inv) { dialog.close(); return; }
    const attempt = latest(inv);
    if (inv.status === 'PAID') stage = 'result';
    else if (attempt?.status === 'PENDING') stage = attempt.submitted ? 'verifying' : 'qr';
    else if (['qr', 'verifying'].includes(stage)) stage = 'result';
    const stepIndex = { details: 0, confirm: 1, qr: 2, verifying: 2, result: 3 }[stage];
    $('billing-dialog-title').textContent = inv.code;
    $('billing-steps').innerHTML = ['Chi tiết', 'Xác nhận', 'Thanh toán', 'Kết quả'].map((text, index) => `<li class="${index === stepIndex ? 'current' : index < stepIndex ? 'complete' : ''}" ${index === stepIndex ? 'aria-current="step"' : ''}>${index + 1}. ${text}</li>`).join('');
    let body = '';
    let actions = '';
    if (stage === 'details') {
      body = metadata(inv) + breakdown(inv) + '<p class="billing-note">Vui lòng kiểm tra kỳ hóa đơn và từng khoản phí trước khi tiếp tục thanh toán.</p>';
      actions = button('close', 'Đóng', true) + button('confirm', 'Thanh toán hóa đơn →');
    } else if (stage === 'confirm') {
      body = metadata(inv) + `<div class="billing-confirm-box"><h3>Xác nhận thanh toán</h3><p class="billing-muted">Một phiên QR sẽ được tạo cho đúng hóa đơn và số tiền bên dưới.</p>${total(inv)}<dl class="billing-definition"><dt>Phương thức</dt><dd>Chuyển khoản QR (demo)</dd><dt>Đơn vị nhận</dt><dd>STAYHUB LIVING CO LTD</dd><dt>Thời hạn phiên</dt><dd>15 phút kể từ khi tạo mã</dd></dl></div><p class="billing-note">Hóa đơn chỉ được đánh dấu đã thanh toán sau kết quả xác minh thành công. Bạn có thể đóng cửa sổ và quay lại để tiếp tục.</p>`;
      actions = button('details', 'Quay lại', true) + button('create', busy ? 'Đang tạo giao dịch…' : 'Xác nhận & tạo mã QR');
    } else if (stage === 'qr') {
      body = `<div class="billing-qr"><div><img class="billing-qr-image" src="${appPath('assets/payment-qr-demo.svg')}" alt="Mã QR minh họa, không dùng để chuyển tiền"><p class="billing-qr-caption">QR MINH HỌA · KHÔNG CHUYỂN TIỀN</p></div><div><span class="billing-countdown">Phiên hết hạn sau <strong id="billing-countdown"></strong></span><dl class="billing-definition"><dt>Số tiền thanh toán</dt><dd>${formatVND(attempt.amount)}</dd><dt>Ngân hàng / Tài khoản mẫu</dt><dd>MB Bank · 0912345678<br>STAYHUB LIVING CO LTD</dd><dt>Nội dung chuyển khoản</dt><dd>${escape(attempt.id)} ${button('copy-reference', 'Sao chép', true)}</dd></dl></div></div><p class="billing-note">1. Kiểm tra số tiền và nội dung chuyển khoản.<br>2. Trong bản demo, bấm “Tôi đã hoàn tất thanh toán”.<br>3. Chọn kết quả trong phần mô phỏng để hoàn tất trải nghiệm.</p>${simulation()}`;
      actions = button('close', 'Đóng, tiếp tục sau', true) + button('submit', 'Tôi đã hoàn tất thanh toán');
    } else if (stage === 'verifying') {
      body = `<div class="billing-result"><div class="billing-result-symbol pending">…</div><h3>Đang chờ xác minh</h3><p>Đã ghi nhận thông báo hoàn tất của bạn.<br>Hóa đơn vẫn chưa thanh toán trong khi chờ kết quả xác minh.</p></div>${total(inv)}<dl class="billing-definition"><dt>Mã giao dịch</dt><dd>${escape(attempt.id)}</dd><dt>Thời gian còn lại</dt><dd id="billing-countdown"></dd></dl>${simulation()}`;
      actions = button('close', 'Đóng, kiểm tra sau', true);
    } else {
      const paid = inv.status === 'PAID';
      const status = paid ? 'SUCCESS' : attempt?.status || 'FAILED';
      const title = paid ? 'Thanh toán thành công' : status === 'EXPIRED' ? 'Phiên thanh toán đã hết hạn' : 'Thanh toán chưa thành công';
      body = `<div class="billing-result"><div class="billing-result-symbol ${status.toLowerCase()}">${paid ? '✓' : '!'}</div><h3>${title}</h3><p>${paid ? 'Hóa đơn đã được ghi nhận thanh toán. Cảm ơn bạn!' : 'Hóa đơn vẫn chưa thanh toán. Bạn có thể tạo phiên QR mới để thử lại.'}</p></div>${metadata(inv)}${breakdown(inv)}<dl class="billing-definition"><dt>Mã giao dịch</dt><dd>${escape(inv.paymentReference || attempt?.id || 'Thanh toán đã ghi nhận')}</dd><dt>${paid ? 'Thời gian thanh toán' : 'Kết thúc phiên'}</dt><dd>${date(paid ? inv.paymentDate : attempt?.finishedAt)}</dd><dt>Phương thức</dt><dd>${escape(inv.method || 'QR demo')}</dd></dl>${paid ? '<p class="billing-note">Biên nhận trong prototype StayHub, không thay thế chứng từ ngân hàng.</p>' : ''}`;
      actions = button('close', 'Về danh sách', true) + (paid ? button('print', 'In / Lưu biên nhận PDF') : button('confirm', 'Thử lại thanh toán'));
    }
    if (inv.paymentAttempts?.length) body += `<details class="billing-timeline"><summary>Tiến trình giao dịch (${inv.paymentAttempts.length} lần thử)</summary>${inv.paymentAttempts.map(item => `<div><p class="billing-muted">${escape(item.id)} · ${escape(labels[item.status])}</p><ul>${(item.events || []).map(event => `<li>${escape(event.text)}<time>${date(event.at)}</time></li>`).join('')}</ul></div>`).join('')}</details>`;
    $('billing-dialog-body').innerHTML = body;
    $('billing-dialog-actions').innerHTML = actions;
    updateCountdown();
    if (focus) $('billing-dialog-title').focus();
  }

  function updateCountdown() {
    const counter = $('billing-countdown');
    const attempt = currentInvoice() && latest(currentInvoice());
    if (!counter || !attempt) return;
    const seconds = Math.max(0, Math.ceil((attempt.expiresAt - Date.now()) / 1000));
    counter.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function showError(message) { $('billing-error').textContent = message; $('billing-error').hidden = false; }
  async function withLock(callback) {
    if (navigator.locks) return navigator.locks.request('stayhub-invoice-payments', callback);
    return callback();
  }
  async function expireSessions() {
    if (busy || DataStore.getRole() !== 'RESIDENT') return;
    if (!ownedInvoices().some(inv => inv.paymentAttempts?.some(a => a.status === 'PENDING' && Date.now() >= a.expiresAt))) return;
    busy = true;
    try {
      await withLock(() => {
        let invoices = DataStore.getInvoices();
        let changed = false;
        for (const inv of invoices.filter(item => DataStore.isResidentInvoice(item))) {
          if (inv.paymentAttempts?.some(a => a.status === 'PENDING' && Date.now() >= a.expiresAt)) {
            invoices = InvoicePaymentState.update(invoices, inv.id, { type: 'TICK' });
            changed = true;
          }
        }
        if (changed) DataStore.saveInvoices(invoices);
      });
      renderPage();
    } catch (error) { if (dialog.open) showError(error.message || 'Không thể lưu trạng thái. Hãy thử lại.'); }
    finally { busy = false; renderDialog(); }
  }
  async function changePayment(action) {
    if (busy || !activeId) return;
    const invoiceId = activeId;
    busy = true;
    $('billing-error').hidden = true;
    renderDialog();
    try {
      await withLock(() => {
        const invoices = DataStore.getInvoices();
        const inv = invoices.find(item => item.id === invoiceId);
        if (DataStore.getRole() !== 'RESIDENT' || !DataStore.isResidentInvoice(inv)) throw Error('Bạn không có quyền thanh toán hóa đơn này.');
        const random = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
        const updated = InvoicePaymentState.update(invoices, invoiceId, action, Date.now(), `PAY-${Date.now().toString(36).toUpperCase()}-${random}`);
        DataStore.saveInvoices(updated);
      });
      stage = action.type === 'CREATE' ? 'qr' : action.type === 'SUBMIT' ? 'verifying' : 'result';
      renderPage();
    } catch (error) { showError(error.message || 'Không thể lưu giao dịch. Vui lòng thử lại.'); }
    finally { busy = false; renderDialog(true); }
  }

  async function openInvoice(id) {
    if (busy) return;
    await expireSessions();
    const inv = ownedInvoices().find(item => item.id === id);
    if (!inv) return;
    previousFocus = document.activeElement;
    activeId = id;
    stage = latest(inv) && latest(inv).status !== 'PENDING' ? 'result' : 'details';
    $('billing-error').hidden = true;
    if (!dialog.open) dialog.showModal();
    renderDialog(true);
    // Restore the same invoice after a refresh without creating another transaction.
    try { const url = new URL(location.href); url.searchParams.set('invoice', id); history.replaceState(null, '', url); } catch (_) { /* file:// may restrict history */ }
  }
  document.addEventListener('click', async event => {
    const open = event.target.closest('[data-open-invoice]');
    if (open) { await openInvoice(open.dataset.openInvoice); return; }
    const target = event.target.closest('[data-action]');
    if (!target || !dialog.contains(target) || busy) return;
    const action = target.dataset.action;
    const inv = currentInvoice();
    if (!inv) { dialog.close(); return; }
    const attempt = latest(inv);
    if (action === 'close') dialog.close();
    else if (action === 'confirm' || action === 'details') { stage = action; $('billing-error').hidden = true; renderDialog(true); }
    else if (action === 'create') await changePayment({ type: 'CREATE' });
    else if (action === 'submit') await changePayment({ type: 'SUBMIT', id: attempt?.id });
    else if (action.startsWith('resolve-')) await changePayment({ type: 'RESOLVE', id: attempt?.id, result: action.slice(8).toUpperCase() });
    else if (action === 'print') window.print();
    else if (action === 'copy-reference') {
      try { await navigator.clipboard.writeText(attempt.id); target.textContent = 'Đã sao chép'; }
      catch (_) { showError('Không thể sao chép tự động. Hãy chọn và sao chép mã giao dịch hiển thị phía trên.'); }
    }
  });
  dialog.addEventListener('close', () => {
    activeId = null;
    try { const url = new URL(location.href); url.searchParams.delete('invoice'); history.replaceState(null, '', url); } catch (_) { /* file:// */ }
    if (previousFocus?.isConnected) previousFocus.focus();
  });
  $('billing-month').addEventListener('change', renderList);
  $('billing-status').addEventListener('change', renderList);
  window.addEventListener('storage', event => {
    if (DataStore.getRole() !== 'RESIDENT') { location.href = appPath('index.html'); return; }
    if ([STORAGE_KEYS.INVOICES, STORAGE_KEYS.USER, null].includes(event.key)) { renderPage(); renderDialog(); expireSessions(); }
  });
  document.addEventListener('DOMContentLoaded', async () => {
    renderSidebar('resident-invoices.html');
    renderTopbar('Hóa đơn hàng tháng', 'Cư dân / Hóa đơn & Thanh toán');
    renderPage();
    await expireSessions();
    const invoiceId = new URL(location.href).searchParams.get('invoice');
    if (invoiceId) await openInvoice(invoiceId);
    if (location.hash === '#history') $('history').scrollIntoView();
    setInterval(() => { updateCountdown(); expireSessions(); }, 1000);
  });
})();
