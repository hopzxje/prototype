(function (root) {
  'use strict';
  function assertPayableInvoice(invoice) {
    if (invoice.status === 'PAID') throw Error('Hóa đơn đã thanh toán.');
    if (invoice.status !== 'UNPAID' || !Number.isSafeInteger(invoice.total) || invoice.total <= 0) {
      throw Error('Hóa đơn không hợp lệ.');
    }
  }

  function assertMatchingAmount(invoice, attempt) {
    if (attempt.amount !== invoice.total) {
      throw Error('Số tiền hóa đơn đã thay đổi. Phiên thanh toán này không còn phù hợp.');
    }
  }

  function update(input, invoiceId, action, now = Date.now(), reference) {
    const invoices = JSON.parse(JSON.stringify(input));
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) throw Error('Không tìm thấy hóa đơn.');
    inv.paymentAttempts ||= [];
    for (const a of inv.paymentAttempts) {
      if (a.status === 'PENDING' && now >= a.expiresAt) {
        a.status = 'EXPIRED'; a.finishedAt = a.expiresAt;
        a.events.push({ at: a.expiresAt, text: 'Phiên QR hết hạn.' });
      }
    }
    const attempt = inv.paymentAttempts.find(a => a.id === action.id);
    if (action.type === 'CREATE') {
      assertPayableInvoice(inv);
      if (inv.paymentAttempts.some(a => a.status === 'PENDING')) return invoices;
      if (!reference || invoices.some(i => i.paymentAttempts?.some(a => a.id === reference))) throw Error('Mã giao dịch không hợp lệ.');
      inv.paymentAttempts.unshift({ id: reference, amount: inv.total, status: 'PENDING', submitted: false, createdAt: now, expiresAt: now + 900000, events: [{ at: now, text: 'Đã kiểm tra hóa đơn và tạo phiên QR demo.' }] });
    } else if (action.type === 'SUBMIT') {
      if (!attempt || attempt.status !== 'PENDING') throw Error('Phiên thanh toán không còn hiệu lực.');
      assertPayableInvoice(inv);
      assertMatchingAmount(inv, attempt);
      if (!attempt.submitted) { attempt.submitted = true; attempt.events.push({ at: now, text: 'Đã báo hoàn tất. Chờ xác minh demo; hóa đơn vẫn chưa thanh toán.' }); }
    } else if (action.type === 'RESOLVE') {
      if (!attempt) throw Error('Không tìm thấy giao dịch.');
      if (attempt.status !== 'PENDING') return invoices;
      if (!['SUCCESS', 'FAILED', 'EXPIRED'].includes(action.result)) throw Error('Kết quả không hợp lệ.');
      assertPayableInvoice(inv);
      assertMatchingAmount(inv, attempt);
      attempt.status = action.result; attempt.finishedAt = now;
      attempt.events.push({ at: now, text: `Kết quả xác minh mô phỏng: ${action.result}.` });
      if (attempt.status === 'SUCCESS') {
        inv.status = 'PAID'; inv.paymentDate = new Date(now).toISOString();
        inv.method = 'QR demo'; inv.paymentReference = attempt.id;
        attempt.events.push({ at: now, text: 'Đã cập nhật hóa đơn PAID và lưu xác nhận thanh toán demo.' });
      }
    } else if (action.type !== 'TICK') throw Error('Thao tác không hợp lệ.');
    return invoices;
  }
  const api = { update };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.InvoicePaymentState = api;
})(typeof window === 'undefined' ? globalThis : window);
