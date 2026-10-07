let activeInvoiceId = null;

function renderInvoicesTable() {
  const search = document.getElementById('inv-search').value.toLowerCase();
  const statusFilter = document.getElementById('inv-status-filter').value;
  const invoices = DataStore.getInvoices();
  const tbody = document.getElementById('invoices-tbody');

  let filtered = invoices.filter(inv => {
    const matchSearch = inv.room.toLowerCase().includes(search) || inv.tenant.toLowerCase().includes(search) || inv.code.toLowerCase().includes(search);
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  tbody.innerHTML = filtered.map(inv => {
    const isPaid = inv.status === 'PAID';
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3.5 font-mono text-slate-900 font-semibold">${inv.code}</td>
        <td class="p-3.5">
          <span class="font-bold text-slate-900">${inv.room}</span> - ${inv.tenant}
          <span class="block text-[11px] text-slate-400">${inv.phone}</span>
        </td>
        <td class="p-3.5 font-semibold">${formatVND(inv.rent)}</td>
        <td class="p-3.5">${inv.elecUnits} kWh <span class="text-slate-400">(${formatVND(inv.elecTotal)})</span></td>
        <td class="p-3.5">${inv.waterUnits} m³ <span class="text-slate-400">(${formatVND(inv.waterTotal)})</span></td>
        <td class="p-3.5">${formatVND(inv.serviceFee)}</td>
        <td class="p-3.5 font-extrabold text-teal-700">${formatVND(inv.total)}</td>
        <td class="p-3.5">
          ${isPaid 
            ? '<span class="badge badge-success">✓ Đã thanh toán</span>' 
            : '<span class="badge badge-warning">⏳ Chờ thu</span>'}
        </td>
        <td class="p-3.5 text-right">
          <button onclick="viewInvoiceModal('${inv.id}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg text-xs font-semibold transition-colors">
            Xem & QR &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function viewInvoiceModal(invId) {
  activeInvoiceId = invId;
  const inv = DataStore.getInvoices().find(i => i.id === invId);
  if (!inv) return;

  document.getElementById('modal-inv-code').innerText = inv.code;
  document.getElementById('inv-bld-name').innerText = inv.building;
  document.getElementById('inv-tenant-name').innerText = inv.tenant;
  document.getElementById('inv-room-number').innerText = `Phòng ${inv.room}`;
  document.getElementById('inv-grand-total').innerText = formatVND(inv.total);
  document.getElementById('inv-qr-memo').innerText = `STAYHUB ${inv.code}`;

  document.getElementById('inv-qr-code').src = appPath('assets/images/payment-qr-demo.svg');

  const isPaid = inv.status === 'PAID';
  const statusTag = document.getElementById('inv-status-tag');
  const btnMarkPaid = document.getElementById('btn-mark-paid');

  if (isPaid) {
    statusTag.className = 'badge badge-success text-xs';
    statusTag.innerText = 'ĐÃ THANH TOÁN';
    btnMarkPaid.style.display = 'none';
  } else {
    statusTag.className = 'badge badge-warning text-xs';
    statusTag.innerText = 'CHƯA THANH TOÁN';
    btnMarkPaid.style.display = 'inline-block';
  }

  // Breakdown rows
  document.getElementById('inv-breakdown-body').innerHTML = `
    <tr>
      <td class="p-2.5 font-medium">Tiền thuê phòng (${inv.month})</td>
      <td class="p-2.5 text-center text-slate-400">-</td>
      <td class="p-2.5 text-center">1 tháng</td>
      <td class="p-2.5 text-right">${formatVND(inv.rent)}</td>
      <td class="p-2.5 text-right font-bold text-slate-900">${formatVND(inv.rent)}</td>
    </tr>
    <tr>
      <td class="p-2.5 font-medium">Điện sinh hoạt</td>
      <td class="p-2.5 text-center text-slate-500">${inv.elecOld} &rarr; ${inv.elecNew}</td>
      <td class="p-2.5 text-center">${inv.elecUnits} kWh</td>
      <td class="p-2.5 text-right">${formatVND(inv.elecRate)}</td>
      <td class="p-2.5 text-right font-bold text-slate-900">${formatVND(inv.elecTotal)}</td>
    </tr>
    <tr>
      <td class="p-2.5 font-medium">Nước sinh hoạt</td>
      <td class="p-2.5 text-center text-slate-500">${inv.waterOld} &rarr; ${inv.waterNew}</td>
      <td class="p-2.5 text-center">${inv.waterUnits} m³</td>
      <td class="p-2.5 text-right">${formatVND(inv.waterRate)}</td>
      <td class="p-2.5 text-right font-bold text-slate-900">${formatVND(inv.waterTotal)}</td>
    </tr>
    <tr>
      <td class="p-2.5 font-medium">Phí dịch vụ & Quản lý tòa nhà</td>
      <td class="p-2.5 text-center text-slate-400">-</td>
      <td class="p-2.5 text-center">1 phòng</td>
      <td class="p-2.5 text-right">${formatVND(inv.serviceFee)}</td>
      <td class="p-2.5 text-right font-bold text-slate-900">${formatVND(inv.serviceFee)}</td>
    </tr>
  `;

  renderPaymentPanel();
  openModal('invoiceDetailModal');
}

function markCurrentInvoicePaid() { runInvoicePayment(); }

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('invoices.html');
  renderTopbar('Quản lý Hóa đơn & Thu tiền phòng', 'Tài chính / Hóa đơn');
  renderInvoicesTable();
});
