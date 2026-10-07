let activeAcceptId = 'req-02';
let activeInspectionId = 'req-01';
let activeApprovalId = 'req-01';
let activeDisputeId = 'req-05';
let activeRefundId = 'req-04';
let activeKeyId = 'req-04';
let currentManagerTab = 'INSPECTED'; // 'INSPECTED' (default) or 'INSPECTING'

function switchManagerTab(tab) {
  currentManagerTab = tab;
  const btnInspected = document.getElementById('btn-tab-inspected');
  const btnInspecting = document.getElementById('btn-tab-inspecting');
  const notice = document.getElementById('manager-scope-notice');

  if (tab === 'INSPECTED') {
    btnInspected.className = 'px-2.5 py-1 rounded-md bg-white text-teal-900 shadow-xs transition-all font-bold';
    btnInspecting.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-all font-medium';
    notice.classList.add('hidden');
  } else {
    btnInspecting.className = 'px-2.5 py-1 rounded-md bg-white text-teal-900 shadow-xs transition-all font-bold';
    btnInspected.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-all font-medium';
    notice.classList.remove('hidden');
  }

  renderCheckoutTable();
}

let currentResidentStep = 2;

function checkoutToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function checkoutDateLabel(value) {
  return value ? value.split('-').reverse().join('/') : 'Chưa có thông tin';
}

function getResidentContract() {
  const user = DataStore.getUser();
  const contracts = [...DataStore.getContracts(), ...INITIAL_CONTRACTS];
  return contracts.find(contract => contract.room === user.room && contract.building === user.building && contract.tenant === user.fullName && contract.status !== 'TERMINATED') || null;
}

function getRequestContractEndDate(request) {
  if (request?.contractEndDate) return request.contractEndDate;
  const contracts = [...DataStore.getContracts(), ...INITIAL_CONTRACTS];
  const contract = contracts.find(item => item.code === request?.contractCode && item.endDate)
    || contracts.find(item => item.room === request?.room && item.building === request?.building && item.tenant === request?.tenant && item.endDate)
    || contracts.find(item => item.room === request?.room && item.tenant === request?.tenant && item.endDate);
  return contract?.endDate || null;
}

function getPaidRentAdvance(request, actualCheckoutDate = request?.actualCheckoutDate || request?.expectedDate) {
  if (request?.prepaidRentSettlement) return request.prepaidRentSettlement;
  if (!request || !actualCheckoutDate) return { grossUnusedRent: 0, chargesOffset: 0, refundAmount: 0, periods: [] };

  const checkoutTime = Date.parse(`${actualCheckoutDate}T00:00:00Z`);
  if (!Number.isFinite(checkoutTime)) return { grossUnusedRent: 0, chargesOffset: 0, refundAmount: 0, periods: [] };
  const invoices = DataStore.getInvoices().filter(invoice =>
    invoice.status === 'PAID' && Number(invoice.rent) > 0 && invoice.room === request.room
    && (!request.building || invoice.building === request.building)
    && (request.residentId && invoice.residentId
      ? invoice.residentId === request.residentId
      : !request.tenant || invoice.tenant === request.tenant)
  );

  const periods = [];
  let grossUnusedRent = 0;
  for (const invoice of invoices) {
    const match = String(invoice.month || '').match(/^(\d{1,2})\/(\d{4})$/);
    if (!match) continue;
    const month = Number(match[1]);
    const year = Number(match[2]);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const periodStart = Date.UTC(year, month - 1, 1);
    const periodEnd = Date.UTC(year, month - 1, daysInMonth);
    let unusedDays = 0;
    if (checkoutTime < periodStart) unusedDays = daysInMonth;
    else if (checkoutTime < periodEnd) {
      const checkoutDay = new Date(checkoutTime).getUTCDate();
      unusedDays = daysInMonth - checkoutDay;
    }
    if (!unusedDays) continue;
    const amount = Math.round(Number(invoice.rent) * unusedDays / daysInMonth);
    grossUnusedRent += amount;
    periods.push({ month: invoice.month, unusedDays, daysInMonth, amount, invoiceCode: invoice.code });
  }

  const electric = Math.max(0, Number(request.meterElectricCurr || 0) - Number(request.meterElectricPrev || 0)) * Number(request.electricRate || 0);
  const water = Math.max(0, Number(request.meterWaterCurr || 0) - Number(request.meterWaterPrev || 0)) * Number(request.waterRate || 0);
  const damage = (request.damages || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const charges = electric + water + damage + Number(request.cleaningFee || 0);
  const endDate = getRequestContractEndDate(request);
  const checkoutDate = request.actualCheckoutDate || actualCheckoutDate;
  const isEarly = !!(endDate && checkoutDate && checkoutDate < endDate);
  const chargesOffset = isEarly ? Math.min(grossUnusedRent, charges) : 0;
  return { grossUnusedRent, chargesOffset, refundAmount: Math.max(0, grossUnusedRent - chargesOffset), periods };
}

function syncCheckoutContractMetadata() {
  const requests = DataStore.getCheckoutRequests();
  let changed = false;
  requests.forEach(request => {
    const endDate = getRequestContractEndDate(request);
    if (!endDate) return;

    if (request.contractEndDate !== endDate) {
      request.contractEndDate = endDate;
      changed = true;
    }
    const checkoutDate = request.actualCheckoutDate || request.expectedDate;
    const isEarlyCheckout = !!(checkoutDate && checkoutDate < endDate);
    if (request.isEarlyCheckout !== isEarlyCheckout) {
      request.isEarlyCheckout = isEarlyCheckout;
      changed = true;
    }
    if (isEarlyCheckout && Number(request.depositRefundAmount || 0) !== 0) {
      request.depositRefundAmount = 0;
      changed = true;
    }
    if (isEarlyCheckout && !request.refundAmountIsTotal && Number(request.refundAmount || 0) !== 0) {
      request.refundAmount = 0;
      changed = true;
    }
    if (isEarlyCheckout && request.status === 'CLOSED' && request.depositSettlementStatus !== 'FORFEITED') {
      request.depositSettlementStatus = 'FORFEITED';
      changed = true;
    }
    if (isEarlyCheckout && request.status === 'CLOSED') {
      const rentSettlement = getPaidRentAdvance(request);
      const rentRefund = rentSettlement.refundAmount;
      if (rentRefund > 0 && request.prepaidRentSettlementStatus !== 'PAID') {
        request.prepaidRentSettlementStatus = 'PENDING';
        request.prepaidRentSettlement = rentSettlement;
        request.refundAmount = rentRefund;
        request.refundAmountIsTotal = true;
        request.status = 'REFUND_PENDING';
        changed = true;
      }
    }
  });
  if (changed) DataStore.saveCheckoutRequests(requests);
}

function getCheckoutCase(request) {
  const contractEndDate = getRequestContractEndDate(request);
  const checkoutDate = request?.actualCheckoutDate || request?.expectedDate;
  const isEarlyCheckout = !!(contractEndDate && checkoutDate && checkoutDate < contractEndDate);
  const contractExpiredAtRequest = !!(contractEndDate && request?.requestDate && contractEndDate < request.requestDate);
  const rentAdvance = getPaidRentAdvance(request);
  const depositRefundAmount = Number.isFinite(request?.depositRefundAmount)
    ? request.depositRefundAmount
    : isEarlyCheckout ? 0 : Number.isFinite(request?.refundAmount) ? request.refundAmount : Number(request?.deposit || 0);
  const refundAmount = request?.refundAmountIsTotal
    ? Number(request.refundAmount || 0)
    : Math.max(0, depositRefundAmount) + rentAdvance.refundAmount;
  const depositPending = !isEarlyCheckout && request?.status !== 'CLOSED' && depositRefundAmount > 0 && request?.depositSettlementStatus !== 'PAID';
  return { contractEndDate, isEarlyCheckout, contractExpiredAtRequest, refundAmount, depositRefundAmount, rentAdvance, depositPending };
}

function openCreateCheckoutModal() {
  const contract = getResidentContract();
  const endDate = document.getElementById('req-contract-end-date');
  const contractCode = document.getElementById('req-contract-code');
  if (endDate) endDate.value = contract?.endDate || '';
  if (contractCode) contractCode.textContent = contract ? `Hợp đồng ${contract.code} · Tiền cọc ${formatVND(contract.deposit || 0)}` : 'Chưa tìm thấy hợp đồng còn hiệu lực cho cư dân này.';
  updateCheckoutContractNotice();
  openModal('createCheckoutModal');
}

function updateCheckoutContractNotice() {
  const notice = document.getElementById('req-contract-notice');
  const endDate = document.getElementById('req-contract-end-date')?.value;
  const moveOutDate = document.getElementById('req-date')?.value;
  if (!notice) return;
  if (!endDate || !moveOutDate) {
    notice.className = 'hidden';
    notice.textContent = '';
    return;
  }
  const today = checkoutToday();
  notice.className = 'p-3 rounded-lg border text-xs leading-relaxed';
  if (moveOutDate < endDate) {
    notice.classList.add('bg-amber-50', 'border-amber-200', 'text-amber-900');
    notice.textContent = `Bạn dự kiến trả phòng trước hạn hợp đồng (${checkoutDateLabel(endDate)}). Tiền cọc không được hoàn; yêu cầu vẫn được Ban Quản lý xem xét.`;
  } else if (endDate < today) {
    notice.classList.add('bg-teal-50', 'border-teal-200', 'text-teal-900');
    notice.textContent = `Hợp đồng đã hết hạn ngày ${checkoutDateLabel(endDate)}. Bạn vẫn có thể gửi yêu cầu; khoản cọc còn lại sẽ tiếp tục chờ đối soát và duyệt hoàn.`;
  } else if (moveOutDate > endDate) {
    notice.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-900');
    notice.textContent = `Ngày trả dự kiến sau hạn hợp đồng ${checkoutDateLabel(endDate)}. Yêu cầu không bị xem là trả trước hạn; khoản cọc vẫn cần được đối soát riêng.`;
  } else {
    notice.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-900');
    notice.textContent = `Ngày trả dự kiến không trước hạn hợp đồng (${checkoutDateLabel(endDate)}). Tiền cọc vẫn được quyết toán sau khi nghiệm thu.`;
  }
}

function getResidentRequest() {
  const requests = DataStore.getCheckoutRequests();
  const user = DataStore.getUser();
  if (user.role !== 'RESIDENT') return null;
  return requests.find(r => r.residentId ? r.residentId === user.id
    : r.room === user.room && r.building === user.building && r.tenant === user.fullName) || null;
}

function getReqActualStep(req) {
  if (!req) return 1;
  if (req.status === 'SUBMITTED') return 1;
  if (req.status === 'SCHEDULED') return 2;
  if (req.status === 'PENDING_APPROVAL' || req.status === 'DISPUTED' || req.status === 'WAITING_RESIDENT_SIGN') {
    return req.isSigned ? 4 : 3;
  }
  if (['REFUND_PENDING', 'REFUND_TRANSFERRED'].includes(req.status)) return 4;
  if (req.status === 'CLOSED') return 4;
  return 2;
}

function initCheckoutPage() {
  syncCheckoutContractMetadata();
  const role = DataStore.getRole();
  const residentView = document.getElementById('view-resident');
  const managementView = document.getElementById('view-management');

  if (role === 'RESIDENT') {
    residentView.classList.remove('hidden');
    managementView.classList.add('hidden');
    renderResidentView();
  } else {
    residentView.classList.add('hidden');
    managementView.classList.remove('hidden');
    renderManagementView();
  }

  // Set the resident contract and enforce the 15-day notice window.
  const reqDateInput = document.getElementById('req-date');
  if (reqDateInput) {
    const earliest = new Date();
    earliest.setHours(0, 0, 0, 0);
    earliest.setDate(earliest.getDate() + 15);
    const minDate = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, '0')}-${String(earliest.getDate()).padStart(2, '0')}`;
    reqDateInput.min = minDate;
    if (!reqDateInput.value || reqDateInput.value < minDate) reqDateInput.value = minDate;
    const contract = getResidentContract();
    const endDate = document.getElementById('req-contract-end-date');
    const contractCode = document.getElementById('req-contract-code');
    const room = document.getElementById('req-room');
    const tenant = document.getElementById('req-tenant');
    if (endDate) endDate.value = contract?.endDate || '';
    if (contractCode) contractCode.textContent = contract ? `Hợp đồng ${contract.code} · Tiền cọc ${formatVND(contract.deposit || 0)}` : 'Chưa tìm thấy hợp đồng còn hiệu lực cho cư dân này.';
    if (room) room.value = DataStore.getUser().room || '';
    if (tenant) tenant.value = DataStore.getUser().fullName || '';
    updateCheckoutContractNotice();
  }
}

function renderResidentView() {
  const req = getResidentRequest();
  if (!req) return;
  renderResidentStepper();
  renderResidentStepContent();
}

function selectResidentStep(stepNum) {
  currentResidentStep = stepNum;
  renderResidentStepper();
  renderResidentStepContent();
}

function renderResidentStepper() {
  const req = getResidentRequest();
  const actualStep = getReqActualStep(req);
  const grid = document.getElementById('resident-stepper-grid');
  if (!grid) return;

  const steps = [
    { num: 1, title: '1. Gửi Yêu Cầu', sub: req?.requestDate ? `Đã gửi ${req.requestDate.slice(5).replace('-', '/')}` : 'Đã gửi 05/10' },
    { num: 2, title: '2. Hẹn Khảo Sát', sub: `${req?.expectedDate ? req.expectedDate.slice(5).replace('-', '/') : '20/10'} • ${req?.timeslot || '14:30'}` },
    { num: 3, title: '3. Duyệt Quyết Toán', sub: req?.isSigned ? '✓ Đã ký biên bản' : (req?.status === 'DISPUTED' ? 'Đang khiếu nại' : 'Chốt điện nước & cọc') },
    { num: 4, title: req && getCheckoutCase(req).isEarlyCheckout ? '4. Quyết Toán Cọc' : '4. Hoàn Cọc', sub: req?.status === 'REFUND_TRANSFERRED' ? 'Chờ xác nhận đã nhận tiền' : req?.depositSettlementStatus === 'FORFEITED' ? (getCheckoutCase(req).refundAmount > 0 ? 'Giữ cọc · hoàn thuê dư' : 'Cọc đã giữ lại') : req && getCheckoutCase(req).isEarlyCheckout ? (getCheckoutCase(req).refundAmount > 0 ? 'Hoàn tiền thuê dư' : 'Không hoàn do trả trước hạn') : req?.status === 'CLOSED' ? '✓ Đã hoàn tất' : 'Cọc chờ duyệt hoàn' }
  ];

  grid.innerHTML = steps.map(s => {
    const isCurrentView = (s.num === currentResidentStep);
    const isDone = (s.num < actualStep || (s.num === 3 && req?.isSigned) || (s.num === 4 && req?.status === 'CLOSED'));

    let cardClass = '';
    let badgeContent = '';

    if (isCurrentView) {
      cardClass = 'border-2 border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-600/20';
      badgeContent = `<span class="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs">${s.num}</span>`;
    } else if (isDone) {
      cardClass = 'border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/50 hover:border-emerald-400';
      badgeContent = `<span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</span>`;
    } else {
      cardClass = 'border border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/70';
      badgeContent = `<span class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs">${s.num}</span>`;
    }

    return `
      <div onclick="selectResidentStep(${s.num})" role="button" tabindex="0" class="p-3.5 rounded-xl cursor-pointer transition-all ${cardClass} flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1.5">
          ${badgeContent}
          ${isCurrentView ? '<span class="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Đang xem</span>' : ''}
        </div>
        <div>
          <p class="font-bold text-xs ${isCurrentView ? 'text-teal-900' : 'text-slate-800'}">${s.title}</p>
          <p class="text-[11px] mt-0.5 ${isCurrentView ? 'text-teal-700 font-medium' : (isDone ? 'text-emerald-700 font-medium' : 'text-slate-400')}">${s.sub}</p>
        </div>
      </div>
    `;
  }).join('');

  for (let i = 1; i <= 5; i++) {
    const pill = document.getElementById(`pill-step-${i}`);
    if (pill) {
      if (i === currentResidentStep) {
        pill.className = 'res-step-pill px-2.5 py-1 rounded text-xs transition-all bg-teal-700 text-white font-bold shadow-xs';
      } else {
        pill.className = 'res-step-pill px-2.5 py-1 rounded text-xs transition-all text-slate-600 hover:text-slate-900 font-medium';
      }
    }
  }
}

function renderResidentStepContent() {
  const container = document.getElementById('resident-step-content-container');
  if (!container) return;
  const req = getResidentRequest();
  if (!req) return;

  const totalDamage = (req.damages || []).reduce((sum, d) => sum + d.cost, 0);
  const elecDiff = Math.max(0, (req.meterElectricCurr || 1580) - (req.meterElectricPrev || 1450));
  const elecCost = elecDiff * (req.electricRate || 3000);
  const waterDiff = Math.max(0, (req.meterWaterCurr || 65) - (req.meterWaterPrev || 60));
  const waterCost = waterDiff * (req.waterRate || 12000);
  const checkoutCase = getCheckoutCase(req);
  const refundAmount = checkoutCase.refundAmount;
  const contractEndDateLabel = checkoutDateLabel(checkoutCase.contractEndDate);
  const contractNotice = checkoutCase.isEarlyCheckout
    ? `<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900"><strong>Trả phòng trước hạn hợp đồng.</strong> Hợp đồng đến ${contractEndDateLabel}; tiền cọc không được hoàn. Tiền thuê đã trả trước cho thời gian chưa sử dụng được quyết toán riêng, trừ chi phí còn nợ nếu có.</div>`
    : checkoutCase.contractExpiredAtRequest
      ? `<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900"><strong>Hợp đồng đã hết hạn ngày ${contractEndDateLabel}.</strong> Yêu cầu trả phòng vẫn được tiếp nhận; khoản cọc ${formatVND(refundAmount)} đang chờ đối soát và duyệt hoàn.</div>`
      : `<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900"><strong>Hạn hợp đồng: ${contractEndDateLabel}.</strong> Tiền cọc sẽ được quyết toán sau nghiệm thu.</div>`;

  let html = '';

  if (currentResidentStep === 1) {
    html = `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">BƯỚC 1: ĐƠN ĐĂNG KÝ TRẢ PHÒNG</span>
              <span class="text-xs text-slate-400 font-mono">• Mã phiếu: ${req.code}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Chi Tiết Đơn Đăng Ký Trả Căn Hộ & Thông Tin Hợp Đồng</h3>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Đã tiếp nhận hợp lệ
          </span>
        </div>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-3.5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                Thông tin đơn trả phòng
              </h4>
              <div class="divide-y divide-slate-200/70 text-xs">
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Căn hộ:</span>
                  <strong class="text-slate-900 font-bold">${req.room} • ${req.building}</strong>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Người thuê / Cư dân:</span>
                  <strong class="text-slate-900">${req.tenant} (${req.phone})</strong>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Hợp đồng thuê số:</span>
                  <span class="font-mono font-semibold text-teal-700">${req.contractCode}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Hạn hết hợp đồng:</span>
                  <strong class="text-slate-900">${contractEndDateLabel}</strong>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Tiền cọc ban đầu:</span>
                  <strong class="font-mono text-slate-900 font-bold">${formatVND(req.deposit)}</strong>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Ngày gửi đơn:</span>
                  <span class="font-medium text-slate-800">${req.requestDate} (Trước 15 ngày theo quy định)</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Ngày đề xuất trả phòng:</span>
                  <strong class="text-teal-700 font-bold">${req.expectedDate} (Khung giờ: ${req.timeslot})</strong>
                </div>
                ${req.actualCheckoutDate ? `<div class="flex justify-between py-2"><span class="text-slate-500">Ngày bàn giao thực tế:</span><strong class="text-slate-900">${req.actualCheckoutDate}</strong></div>` : ''}
                ${contractNotice}
                <div class="flex justify-between py-2">
                  <span class="text-slate-500">Lý do trả phòng:</span>
                  <span class="text-slate-700 italic">${req.notes || 'Hết hạn hợp đồng, chuyển công tác'}</span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-teal-50/60 p-5 rounded-xl border border-teal-200 space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                  Tài khoản ngân hàng nhận khoản hoàn
                </h4>
                <div class="p-3.5 bg-white rounded-lg border border-teal-200 space-y-1.5 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Ngân hàng:</span>
                    <strong class="text-slate-900">${req.bankAccount?.bank || 'MB Bank'}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Số tài khoản:</span>
                    <strong class="font-mono text-teal-800 text-sm font-bold">${req.bankAccount?.accountNumber || '0904445566'}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Chủ tài khoản:</span>
                    <strong class="text-slate-900 uppercase">${req.bankAccount?.accountName || 'LE VAN AN'}</strong>
                  </div>
                </div>
                <p class="text-[11px] text-teal-800">
                  ${checkoutCase.isEarlyCheckout ? 'Tiền cọc không được hoàn khi trả phòng trước hạn; tiền thuê trả trước chưa sử dụng (nếu có) sẽ được quyết toán vào tài khoản trên.' : 'Khoản tiền được hoàn sẽ được Ban Quản Lý chuyển vào số tài khoản trên sau khi hoàn tất đối soát và ký biên bản.'}
                </p>
              </div>

              <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong class="font-bold">Nhân viên phụ trách đã tiếp nhận:</strong>
                <p class="text-slate-700">Kỹ thuật viên <strong>${req.assignedStaff || 'Phạm Tuấn Anh'}</strong> đã xác nhận lịch hẹn khảo sát hiện trường vào <strong>${req.timeslot} ngày ${req.expectedDate}</strong>.</p>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span class="text-xs text-slate-500">Bước 1 trên tổng số 4 bước check-out</span>
            <button type="button" onclick="selectResidentStep(2)" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
              <span>Xem Lịch Hẹn Khảo Sát Hiện Trường (Bước 2)</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (currentResidentStep === 2) {
    html = `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">BƯỚC 2: HẸN KHẢO SÁT & NGHIỆM THU</span>
              <span class="text-xs text-slate-400 font-mono">• Phiếu: ${req.code}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Lịch Hẹn Khảo Sát Hiện Trường Căn Hộ ${req.room}</h3>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 block">Kỹ thuật viên phụ trách:</span>
            <strong class="text-slate-900 text-xs font-bold">${req.assignedStaff || 'Phạm Tuấn Anh (Kỹ thuật)'}</strong>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="p-5 bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl border border-teal-200 space-y-3">
                <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  Thông tin buổi khảo sát căn hộ
                </h4>
                <div class="space-y-2 text-xs text-slate-700">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 w-24">Thời gian hẹn:</span>
                    <strong class="text-teal-800 text-sm">${req.timeslot}, Ngày ${req.expectedDate}</strong>
                    <span class="text-slate-400 text-[11px]">(Khung 14:00 – 15:30)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 w-24">Địa điểm:</span>
                    <strong class="text-slate-900">Phòng ${req.room}, Tầng 2, StayHub Central</strong>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 w-24">Kỹ thuật viên:</span>
                    <strong class="text-slate-800">${req.assignedStaff || 'Phạm Tuấn Anh'}</strong>
                    <span class="text-slate-500">(Hotline hỗ trợ: 0912.345.678)</span>
                  </div>
                </div>
                <div class="p-3 bg-white rounded-lg border border-teal-200 text-xs text-slate-600">
                  <strong>Lưu ý quan trọng:</strong> Quý khách vui lòng có mặt tại phòng đúng giờ hẹn, thu dọn đồ đạc cá nhân và chuẩn bị để nhân viên nghiệm thu căn hộ.
                </div>
              </div>

              <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-900">
                <strong>Tài khoản nhận khoản hoàn:</strong>
                <p class="text-slate-700">${req.bankAccount?.bank || 'MB Bank'} • STK: <strong>${req.bankAccount?.accountNumber || '0904445566'}</strong> • Chủ TK: <strong>${req.bankAccount?.accountName || 'LE VAN AN'}</strong></p>
                <span class="text-[11px] text-slate-500 block">${checkoutCase.isEarlyCheckout ? 'Tiền cọc không được hoàn do trả trước hạn; tiền thuê đã trả trước được quyết toán riêng.' : 'Tiền cọc và tiền thuê trả trước (nếu có) sẽ được quyết toán sau khi chốt điện nước.'}</span>
              </div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                Danh mục Cư dân cần chuẩn bị & Bàn giao
              </h4>
              <div class="space-y-3 text-xs">
                <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong class="text-slate-900 block">Dọn dẹp đồ đạc cá nhân</strong>
                    <span class="text-slate-500 text-[11px]">Bàn giao lại phòng gọn gàng, sạch sẽ để tránh phát sinh chi phí vệ sinh phụ trội.</span>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong class="text-slate-900 block">Cùng Kỹ thuật chốt chỉ số công tơ</strong>
                    <span class="text-slate-500 text-[11px]">Chụp ảnh công tơ điện và đồng hồ nước tại thời điểm khảo sát để làm căn cứ lập bảng quyết toán.</span>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong class="text-slate-900 block">Xem dự thảo quyết toán & Ký online</strong>
                    <span class="text-slate-500 text-[11px]">Kỹ thuật gửi biên bản lên hệ thống, Quản lý duyệt và Cư dân ký xác nhận ngay trên ứng dụng.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button type="button" onclick="selectResidentStep(1)" class="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
              &larr; Quay lại Đơn đăng ký (Bước 1)
            </button>
            <button type="button" onclick="selectResidentStep(3)" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
              <span>Tiến Hành Đối Soát Quyết Toán (Bước 3)</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (currentResidentStep === 3) {
    const isDisputed = (req.status === 'DISPUTED');
    const isSigned = !!req.isSigned;

    html = `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">BƯỚC 3: DUYỆT QUYẾT TOÁN CỌC</span>
              <span class="text-xs text-slate-400 font-mono">• Phiếu: ${req.code}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Biên Bản Nghiệm Thu & Dự Thảo Quyết Toán Hoàn Cọc</h3>
          </div>
          <div>
            ${isSigned
              ? '<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Cư dân đã ký biên bản</span>'
              : (isDisputed
                ? '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Đang thẩm định khiếu nại</span>'
                : '<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Chờ Cư dân đối soát & Ký</span>')}
          </div>
        </div>

        <div class="p-6 space-y-6">
          ${isDisputed ? `
            <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900">
              <div class="flex items-center justify-between">
                <strong class="font-bold flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Quý khách đã gửi khiếu nại bồi hoàn tài sản
                </strong>
                <span class="text-[11px] font-semibold text-amber-700">Trạng thái: BQL đang thụ lý</span>
              </div>
              <p class="text-slate-700"><strong>Nội dung giải trình:</strong> "${req.disputeReason || 'Cư dân giải trình rèm cửa đã có dấu hiệu sờn từ khi nhận nhà, đề nghị xem xét giảm trừ.'}"</p>
              <p class="text-slate-500 text-[11px]">Quản lý Trần Minh Đức đang đối chiếu ảnh biên bản bàn giao đầu vào để phán quyết miễn giảm. Quý khách sẽ nhận thông báo khi có kết quả.</p>
            </div>
          ` : ''}

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4 text-xs">
              <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                Biên bản khảo sát hiện trường (${req.assignedStaff || 'Phạm Tuấn Anh'} lập)
              </h4>

              <div class="space-y-2.5">
                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div class="flex justify-between font-semibold text-slate-800">
                    <span>Chỉ số điện sinh hoạt:</span>
                    <span class="font-mono text-teal-800">${req.meterElectricPrev || 1450} &rarr; ${req.meterElectricCurr || 1580} kWh</span>
                  </div>
                  <p class="text-[11px] text-slate-500">Tiêu thụ: <strong>${elecDiff} kWh</strong> &times; ${formatVND(req.electricRate || 3000)}/kWh = <strong class="text-red-600">${formatVND(elecCost)}</strong></p>
                </div>

                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div class="flex justify-between font-semibold text-slate-800">
                    <span>Chỉ số nước sinh hoạt:</span>
                    <span class="font-mono text-teal-800">${req.meterWaterPrev || 60} &rarr; ${req.meterWaterCurr || 65} m³</span>
                  </div>
                  <p class="text-[11px] text-slate-500">Tiêu thụ: <strong>${waterDiff} m³</strong> &times; ${formatVND(req.waterRate || 12000)}/m³ = <strong class="text-red-600">${formatVND(waterCost)}</strong></p>
                </div>

                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div class="flex justify-between font-semibold text-slate-800">
                    <span>Kiểm kê tài sản & nội thất:</span>
                    <span class="font-mono text-red-600 font-bold">-${formatVND(totalDamage)}</span>
                  </div>
                  <p class="text-[11px] text-slate-600">Rèm cửa chống nắng: <em>Hư hỏng nhẹ (rách mép vải)</em>. Chi phí khắc phục: 350.000 ₫.</p>
                </div>

                <div class="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <span class="font-semibold text-slate-800">Vệ sinh căn hộ:</span>
                  <span class="text-emerald-700 font-bold">0 ₫ (Sạch sẽ, đạt tiêu chuẩn)</span>
                </div>
              </div>
            </div>

            <div class="p-5 bg-gradient-to-br from-teal-50/60 to-white rounded-xl border border-teal-200 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-teal-200">
                <h4 class="font-bold text-teal-900 text-xs uppercase tracking-wider">Dự thảo Quyết toán Cọc</h4>
                <span class="text-[11px] text-teal-700 font-semibold">Tạm tính thanh lý HĐ</span>
              </div>

              <div class="space-y-2 text-xs divide-y divide-slate-100">
                <div class="flex justify-between py-1 text-slate-700">
                  <span>${checkoutCase.isEarlyCheckout ? 'Tiền cọc ban đầu (không hoàn do trả trước hạn):' : 'Tiền cọc ban đầu theo HĐ:'}</span>
                  <strong class="font-mono text-slate-900">${formatVND(req.deposit)}</strong>
                </div>
                <div class="flex justify-between py-1 text-slate-700">
                  <span>Tiền thuê trả trước chưa sử dụng:</span>
                  <strong class="font-mono text-blue-700">${formatVND(checkoutCase.rentAdvance.grossUnusedRent)}</strong>
                </div>
                <div class="flex justify-between py-1 text-slate-700">
                  <span>Tiền điện tiêu thụ (${elecDiff} kWh):</span>
                  <span class="font-mono text-red-600 font-semibold">-${formatVND(elecCost)}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-700">
                  <span>Tiền nước tiêu thụ (${waterDiff} m³):</span>
                  <span class="font-mono text-red-600 font-semibold">-${formatVND(waterCost)}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-700">
                  <span>Bồi hoàn tài sản (Rèm cửa):</span>
                  <span class="font-mono text-red-600 font-semibold">-${formatVND(totalDamage)}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-700">
                  <span>Phí vệ sinh căn hộ:</span>
                  <span class="font-mono text-slate-500">0 ₫ (Sạch sẽ)</span>
                </div>
                ${checkoutCase.rentAdvance.chargesOffset ? `<div class="flex justify-between py-1 text-slate-700"><span>Chi phí còn nợ đối trừ vào tiền thuê trả trước:</span><span class="font-mono text-red-600">-${formatVND(checkoutCase.rentAdvance.chargesOffset)}</span></div>` : ''}
                <div class="flex justify-between pt-3 text-sm font-extrabold text-teal-950">
                  <span class="uppercase">${checkoutCase.isEarlyCheckout ? 'TIỀN THUÊ TRẢ TRƯỚC CÒN DƯ ĐƯỢC HOÀN:' : 'TỔNG SỐ TIỀN ĐƯỢC HOÀN:'}</span>
                  <strong class="font-mono text-2xl ${checkoutCase.isEarlyCheckout ? 'text-amber-700' : 'text-teal-700'}">${formatVND(refundAmount)}</strong>
                </div>
              </div>

              <div class="p-3 bg-white rounded-lg border border-teal-200 text-xs space-y-1">
                <span class="text-slate-500 block text-[11px]">Tài khoản nhận khoản hoàn:</span>
                <strong class="text-slate-900 font-bold">${req.bankAccount?.bank || 'MB Bank'} • STK: ${req.bankAccount?.accountNumber || '0904445566'}</strong>
                <span class="text-slate-500 text-[11px] block">Chủ tài khoản: ${req.bankAccount?.accountName || 'LE VAN AN'}</span>
              </div>

              <div class="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                ${!isSigned ? `
                  <button type="button" onclick="openModal('residentDisputeModal')" class="w-full sm:w-auto px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors">
                    Khiếu Nại Bồi Thường
                  </button>
                  <button type="button" onclick="openModal('residentSignModal')" class="w-full sm:flex-1 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors text-center">
                    Xác Nhận Biên Bản & Ký Online &rarr;
                  </button>
                ` : `
                  <div class="w-full p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center justify-between">
                    <span>✓ Quý khách đã ký xác nhận biên bản này lúc 14:45 ngày 20/10/2026.</span>
                    <button type="button" onclick="selectResidentStep(4)" class="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs">Sang Bước 4 &rarr;</button>
                  </div>
                `}
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button type="button" onclick="selectResidentStep(2)" class="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
              &larr; Quay lại Lịch hẹn (Bước 2)
            </button>
            <button type="button" onclick="selectResidentStep(4)" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
              <span>Sang Bước 4: Xem hoàn cọc</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;

  } else if (currentResidentStep === 4) {
    const isClosed = (req.status === 'CLOSED');
    const awaitingReceipt = req.status === 'REFUND_TRANSFERRED';
    const isForfeited = req.depositSettlementStatus === 'FORFEITED';
    const noRefund = checkoutCase.isEarlyCheckout && checkoutCase.refundAmount <= 0;

    html = `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${checkoutCase.isEarlyCheckout ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}">${checkoutCase.isEarlyCheckout ? (noRefund ? 'BƯỚC 4: QUYẾT TOÁN CỌC' : 'BƯỚC 4: HOÀN TIỀN THUÊ DƯ') : 'BƯỚC 4: NHẬN TIỀN HOÀN CỌC QUA NGÂN HÀNG'}</span>
              ${noRefund ? '' : `<span class="text-xs text-slate-400 font-mono">• Mã UNC: UNC-${req.code.replace('REQ-OUT-', '')}</span>`}
            </div>
            <h3 class="text-lg font-bold text-slate-900">${checkoutCase.isEarlyCheckout ? (noRefund ? 'Khoản cọc không được hoàn do trả phòng trước hạn' : 'Hoàn tiền thuê trả trước chưa sử dụng; tiền cọc không hoàn') : 'Ủy Nhiệm Chi Hoàn Trả Tiền Cọc Cho Cư Dân'}</h3>
          </div>
          <div>
            ${awaitingReceipt ? '<span class="text-blue-800 font-bold text-xs">ĐÃ CHUYỂN TIỀN · CHỜ CƯ DÂN XÁC NHẬN</span>' : isForfeited
              ? (isClosed
                ? `<span class="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">${req.prepaidRentSettlementStatus === 'PAID' ? 'ĐÃ HOÀN TIỀN THUÊ DƯ · CỌC GIỮ LẠI' : 'ĐÃ TẤT TOÁN · CỌC GIỮ LẠI'}</span>`
                : '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">CỌC GIỮ LẠI · CHỜ HOÀN TIỀN THUÊ DƯ</span>')
              : noRefund
                ? '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">KHÔNG PHÁT SINH HOÀN CỌC</span>'
                : isClosed
              ? '<span class="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">✓ ĐÃ GIẢI NGÂN HOÀN CỌC THÀNH CÔNG</span>'
              : '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">⏳ Đang xử lý lệnh chi UNC</span>'}
          </div>
        </div>

        <div class="p-6 space-y-6">
          ${checkoutCase.isEarlyCheckout ? `<div class="max-w-3xl mx-auto p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs"><strong>Hạn hợp đồng: ${contractEndDateLabel}.</strong> Tiền cọc không được hoàn. Tiền thuê trả trước chưa sử dụng: ${formatVND(checkoutCase.rentAdvance.grossUnusedRent)}; đối trừ chi phí còn nợ ${formatVND(checkoutCase.rentAdvance.chargesOffset)}; còn được hoàn ${formatVND(checkoutCase.rentAdvance.refundAmount)}.</div>` : `<div class="max-w-3xl mx-auto p-4 rounded-xl border ${checkoutCase.contractExpiredAtRequest ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700'} text-xs">
            <strong>Hạn hợp đồng: ${contractEndDateLabel}.</strong>
            ${checkoutCase.contractExpiredAtRequest
              ? `Hợp đồng đã hết hạn; khoản hoàn sau quyết toán là ${formatVND(refundAmount)}. Hồ sơ hoàn tất khi cư dân xác nhận đã nhận tiền.`
              : 'Sau khi quản lý chuyển tiền, cư dân xác nhận đã nhận đủ khoản hoàn để hoàn tất quyết toán.'}
          </div>`}
          <div class="max-w-3xl mx-auto bg-gradient-to-b from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 relative overflow-hidden ${noRefund ? 'hidden' : ''}">
            ${isClosed ? `
              <div class="absolute right-6 top-6 transform rotate-12 border-4 border-emerald-600 text-emerald-700 px-4 py-1.5 rounded-xl text-sm font-extrabold tracking-widest uppercase opacity-80 pointer-events-none shadow-sm">
                PAID • ĐÃ TẤT TOÁN
              </div>
            ` : `
              <div class="absolute right-6 top-6 transform rotate-6 border-2 border-amber-500 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase opacity-80 pointer-events-none">
                ${awaitingReceipt ? 'ĐÃ CHUYỂN TIỀN' : 'CHỜ DUYỆT LỆNH CHI'}
              </div>
            `}

            <div class="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h4 class="font-extrabold text-slate-900 text-base uppercase tracking-wider">${checkoutCase.isEarlyCheckout ? 'LỆNH HOÀN TIỀN THUÊ TRẢ TRƯỚC' : 'ỦY NHIỆM CHI ĐIỆN TỬ (BANK PAYMENT ORDER)'}</h4>
                <p class="text-xs text-slate-500 mt-0.5">Hệ thống Thanh toán Tự động StayHub x MB Bank</p>
              </div>
              <div class="text-right text-xs text-slate-500">
                <span>Số tham chiếu: <strong class="font-mono text-slate-900 font-bold">UNC-${req.code.replace('REQ-OUT-', '')}</strong></span>
                <span class="block text-[11px]">${req.actualCheckoutDate || req.expectedDate || 'Ngày bàn giao'}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ĐƠN VỊ CHI TRẢ (BÊN A)</span>
                <strong class="block text-slate-900 font-bold text-xs">CÔNG TY CỔ PHẦN QUẢN LÝ VẬN HÀNH STAYHUB</strong>
                <div class="space-y-1 text-slate-600 text-[11px]">
                  <div>Tài khoản: <strong class="font-mono text-slate-800">1900888999</strong></div>
                  <div>Tại ngân hàng: <strong>Techcombank Hội Sở Hà Nội</strong></div>
                  <div>Người ký duyệt: <strong>Trần Minh Đức (Quản lý)</strong></div>
                </div>
              </div>

              <div class="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                <span class="text-[10px] uppercase font-bold text-teal-700 tracking-wider">ĐƠN VỊ THỤ HƯỞNG (BÊN B - CƯ DÂN)</span>
                <strong class="block text-slate-900 font-bold text-xs uppercase">${req.bankAccount?.accountName || 'LE VAN AN'}</strong>
                <div class="space-y-1 text-slate-600 text-[11px]">
                  <div>Số tài khoản: <strong class="font-mono text-teal-800 font-bold text-xs">${req.bankAccount?.accountNumber || '0904445566'}</strong></div>
                  <div>Tại ngân hàng: <strong>${req.bankAccount?.bank || 'MB Bank (Ngân hàng Quân Đội)'}</strong></div>
                  <div>Căn hộ thanh lý: <strong>${req.room} • ${req.building}</strong></div>
                </div>
              </div>
            </div>

            <div class="p-5 bg-teal-900 text-white rounded-xl space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span class="text-teal-200 text-xs uppercase tracking-wider font-semibold">${checkoutCase.isEarlyCheckout ? 'TIỀN THUÊ TRẢ TRƯỚC CÒN DƯ ĐƯỢC HOÀN:' : 'SỐ TIỀN THỰC HOÀN TRẢ CỌC:'}</span>
                <strong class="font-mono text-3xl font-extrabold text-teal-300">${formatVND(refundAmount)}</strong>
              </div>
              <p class="text-xs text-teal-100 italic">${checkoutCase.isEarlyCheckout ? 'Tiền thuê trả trước chưa sử dụng được hoàn sau đối soát.' : 'Khoản hoàn gồm tiền cọc sau quyết toán và tiền thuê trả trước chưa sử dụng (nếu có).'}</p>
              <div class="pt-2 border-t border-teal-800 text-[11px] text-teal-200">
                Nội dung: <strong>STAYHUB HOAN TIEN ${req.contractCode || ''} CAN ${req.room} ${req.tenant.toUpperCase()}</strong>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-lg text-slate-700 text-sm space-y-3">
              ${isClosed ? `
                <p class="text-emerald-800 font-semibold">✓ ${req.refundReceivedAt ? 'Bạn đã xác nhận nhận đủ khoản hoàn lúc ' + new Date(req.refundReceivedAt).toLocaleString('vi-VN') : 'Hồ sơ đã hoàn tất.'}</p>
              ` : awaitingReceipt ? `
                <p>Quản lý đã xác nhận chuyển <strong>${formatVND(refundAmount)}</strong> vào tài khoản nhận khoản hoàn. Vui lòng kiểm tra tài khoản và chỉ xác nhận khi đã nhận đủ tiền.</p>
                <button type="button" onclick="confirmResidentRefundReceived()" class="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold">
                  ${checkoutCase.isEarlyCheckout ? 'Xác nhận đã nhận tiền thuê dư' : 'Xác nhận đã nhận tiền cọc'}
                </button>
              ` : '<p>Đang chờ quản lý xác nhận chuyển khoản hoàn. Bạn có thể xác nhận nhận tiền sau khi quản lý đã chuyển.</p>'}
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button type="button" onclick="downloadSettlementPDF()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>📄 Tải Biên Bản Thanh Lý & Quyết Toán (PDF)</span>
            </button>
            <button type="button" onclick="downloadUNCPDF()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${noRefund ? 'hidden' : ''}">
              <span>${checkoutCase.isEarlyCheckout ? '📑 Tải lệnh hoàn tiền thuê dư' : '📑 Tải Ủy Nhiệm Chi Hoàn Cọc (UNC PDF)'}</span>
            </button>
            <button type="button" onclick="selectResidentStep(1)" class="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors">
              ↺ Xem Lại Từ Bước 1
            </button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  lucide.createIcons();
}

function renderManagementView() {
  const role = DataStore.getRole();
  const isManager = (role === 'MANAGER' || role === 'ADMIN');
  const requests = DataStore.getCheckoutRequests();

  // 1. Render Top Stats Cards
  const statsContainer = document.getElementById('mgmt-stats-grid');
  if (statsContainer) {
    if (isManager) {
      const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL').length;
      const disputeCount = requests.filter(r => r.status === 'DISPUTED').length;
      const refundCount = requests.filter(r => r.status === 'REFUND_PENDING' && getCheckoutCase(r).refundAmount > 0).length;
      const closedCount = requests.filter(r => r.status === 'CLOSED').length;

      statsContainer.innerHTML = `
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ duyệt quyết toán</p>
          <h3 class="text-2xl font-extrabold text-teal-700 mt-2">${String(pendingCount).padStart(2, '0')} hồ sơ</h3>
          <p class="text-xs text-slate-500 mt-1">Staff đã nghiệm thu xong · Chờ duyệt</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khiếu nại cần thẩm định</p>
          <h3 class="text-2xl font-extrabold text-amber-600 mt-2">${String(disputeCount).padStart(2, '0')} hồ sơ</h3>
          <p class="text-xs text-slate-500 mt-1">Cư dân phản hồi đền bù tài sản</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lệnh chi cọc chờ duyệt</p>
          <h3 class="text-2xl font-extrabold text-emerald-600 mt-2">${String(refundCount).padStart(2, '0')} lệnh chi</h3>
          <p class="text-xs text-slate-500 mt-1">Cư dân đã ký · Chờ duyệt hoàn cọc</p>
          <p class="text-xs text-blue-700 mt-1">${requests.filter(r => r.status === 'REFUND_TRANSFERRED').length} hồ sơ đã chuyển tiền · Chờ cư dân xác nhận</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hồ sơ đã tất toán</p>
          <h3 class="text-2xl font-extrabold text-slate-800 mt-2">${String(closedCount).padStart(2, '0')} hồ sơ</h3>
          <p class="text-xs text-slate-500 mt-1">Đã giải ngân UNC & hoàn tất lưu trữ</p>
        </div>
      `;
    } else {
      const submittedCount = requests.filter(r => r.status === 'SUBMITTED').length;
      const scheduledCount = requests.filter(r => r.status === 'SCHEDULED').length;
      const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL').length;

      statsContainer.innerHTML = `
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn mới cần xếp lịch</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <i data-lucide="inbox" class="w-5 h-5"></i>
            </div>
          </div>
          <h3 class="text-2xl font-extrabold text-amber-600 mt-2">${String(submittedCount).padStart(2, '0')} đơn</h3>
          <p class="text-xs text-slate-500 mt-1">Cư dân gửi đơn · Chờ gọi xác nhận</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lịch hẹn nghiệm thu</p>
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </div>
          </div>
          <h3 class="text-2xl font-extrabold text-blue-600 mt-2">${String(scheduledCount).padStart(2, '0')} lịch</h3>
          <p class="text-xs text-slate-500 mt-1">Khảo sát chốt điện nước tại phòng</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biên bản đã gửi Quản lý</p>
            <div class="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <i data-lucide="send" class="w-5 h-5"></i>
            </div>
          </div>
          <h3 class="text-2xl font-extrabold text-teal-700 mt-2">${String(pendingCount).padStart(2, '0')} biên bản</h3>
          <p class="text-xs text-slate-500 mt-1">Đang chờ Quản lý duyệt quyết toán cọc</p>
        </div>
      `;
    }
  }

  // 3. Render Table Title, Filters, and Action Buttons
  const tableTitle = document.getElementById('mgmt-table-title');
  const managerTabs = document.getElementById('manager-scope-tabs');
  const btnStaffNewReq = document.getElementById('btn-staff-new-req');
  const filterSelect = document.getElementById('checkout-status-filter');

  if (isManager) {
    tableTitle.textContent = 'Hồ Sơ Đã Nghiệm Thu Chờ Quản Lý Phê Duyệt';
    managerTabs.classList.remove('hidden');
    managerTabs.classList.add('inline-flex');
    btnStaffNewReq.classList.add('hidden');
    btnStaffNewReq.classList.remove('flex');

    filterSelect.innerHTML = `
      <option value="ALL">Tất cả hồ sơ quản lý</option>
      <option value="PENDING_APPROVAL">Chờ duyệt quyết toán (PENDING_APPROVAL)</option>
      <option value="DISPUTED">Khiếu nại cần thẩm định (DISPUTED)</option>
      <option value="REFUND_PENDING">Chờ duyệt lệnh chi (REFUND_PENDING)</option>
      <option value="REFUND_TRANSFERRED">Đã chuyển tiền · Chờ cư dân xác nhận</option>
      <option value="CLOSED">Đã hoàn tất (CLOSED)</option>
    `;
  } else {
    tableTitle.textContent = 'Danh Sách Công Việc Tiếp Nhận & Nghiệm Thu Căn Hộ';
    managerTabs.classList.add('hidden');
    managerTabs.classList.remove('inline-flex');
    btnStaffNewReq.classList.remove('hidden');
    btnStaffNewReq.classList.add('flex');

    filterSelect.innerHTML = `
      <option value="ALL">Tất cả trạng thái công việc</option>
      <option value="SUBMITTED">Mới tiếp nhận (SUBMITTED)</option>
      <option value="SCHEDULED">Đã hẹn lịch (SCHEDULED)</option>
      <option value="PENDING_APPROVAL">Đã nghiệm thu (PENDING_APPROVAL)</option>
      <option value="REFUND_PENDING">Cọc chờ duyệt hoàn (REFUND_PENDING)</option>
      <option value="REFUND_TRANSFERRED">Đã chuyển tiền · Chờ cư dân xác nhận</option>
      <option value="CLOSED">Đã hoàn tất (CLOSED)</option>
    `;
  }

  // 4. Render Guidelines Grid
  const guidelinesContainer = document.getElementById('mgmt-guidelines-grid');
  if (guidelinesContainer) {
    if (isManager) {
      guidelinesContainer.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">1. Soát xét & Duyệt quyết toán cọc</h4>
            <p class="text-slate-500">Đối chiếu số liệu điện nước, tình trạng hư hại và ảnh hiện trường do Kỹ thuật gửi lên trước khi chuyển Cư dân ký.</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">2. Thẩm định giải quyết khiếu nại</h4>
            <p class="text-slate-500">Khi cư dân phản hồi, Quản lý đối chiếu biên bản bàn giao đầu vào và phán quyết miễn giảm hoặc giữ nguyên.</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">3. Duyệt lệnh chi hoàn cọc (UNC)</h4>
            <p class="text-slate-500">Sau khi cư dân ký biên bản quyết toán, Quản lý xem xét và ký duyệt lệnh hoàn tiền qua ngân hàng.</p>
          </div>
        </div>
      `;
    } else {
      guidelinesContainer.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <i data-lucide="inbox" class="w-4 h-4"></i>
          </div>
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">1. Tiếp nhận đơn & Xếp lịch</h4>
            <p class="text-slate-500">Liên hệ cư dân xác nhận thời gian, phân công kỹ thuật viên phụ trách và gửi hướng dẫn chuẩn bị bàn giao.</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <i data-lucide="clipboard-check" class="w-4 h-4"></i>
          </div>
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">2. Khảo sát & Nghiệm thu tại phòng</h4>
            <p class="text-slate-500">Trực tiếp đến căn hộ chốt công tơ điện nước, kiểm kê phụ lục tài sản, lập biên bản gửi Quản lý phê duyệt.</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <i data-lucide="key" class="w-4 h-4"></i>
          </div>
          <div class="text-xs">
            <h4 class="font-bold text-slate-900 mb-0.5">3. Duyệt hoàn cọc</h4>
            <p class="text-slate-500">Sau khi cư dân ký biên bản, quản lý duyệt lệnh chi hoàn cọc và hoàn tất hồ sơ check-out.</p>
          </div>
        </div>
      `;
    }
  }

  renderCheckoutTable();
}

function renderCheckoutTable() {
  const role = DataStore.getRole();
  const isManager = (role === 'MANAGER' || role === 'ADMIN');
  const search = (document.getElementById('checkout-search')?.value || '').toLowerCase();
  const filter = document.getElementById('checkout-status-filter')?.value || 'ALL';
  const requests = DataStore.getCheckoutRequests();
  const tbody = document.getElementById('checkout-tbody');
  const theadRow = document.getElementById('mgmt-table-thead-row');
  if (!tbody || !theadRow) return;

  // Dynamic table header
  if (isManager) {
    theadRow.innerHTML = `
      <th class="p-3.5">Mã Phiếu</th>
      <th class="p-3.5">Căn Hộ</th>
      <th class="p-3.5">Cư Dân</th>
      <th class="p-3.5">Kỹ Thuật Lập</th>
      <th class="p-3.5">Khấu Trừ / Hoàn Cọc</th>
      <th class="p-3.5">Trạng Thái (Sau nghiệm thu)</th>
      <th class="p-3.5 text-right">Thao Tác Quản Lý</th>
    `;
  } else {
    theadRow.innerHTML = `
      <th class="p-3.5">Mã Phiếu</th>
      <th class="p-3.5">Căn Hộ</th>
      <th class="p-3.5">Cư Dân</th>
      <th class="p-3.5">Ngày Gửi</th>
      <th class="p-3.5">Ngày Hẹn / Khung Giờ</th>
      <th class="p-3.5">Trạng Thái</th>
      <th class="p-3.5 text-right">Thao Tác Kỹ Thuật</th>
    `;
  }

  // Filtering logic
  const filtered = requests.filter(r => {
    const matchSearch = r.room.toLowerCase().includes(search) || r.tenant.toLowerCase().includes(search) || r.code.toLowerCase().includes(search);

    let matchScope = true;
    if (isManager) {
      if (currentManagerTab === 'INSPECTED') {
        // QUẢN LÝ CHỈ QUẢN LÝ CÁC HỒ SƠ ĐÃ NGHIỆM THU
        matchScope = (r.status === 'PENDING_APPROVAL' || r.status === 'DISPUTED' || r.status === 'REFUND_PENDING' || r.status === 'REFUND_TRANSFERRED' || r.status === 'CLOSED');
      } else {
        // Tab giám sát Staff đang khảo sát (chưa nghiệm thu)
        matchScope = (r.status === 'SUBMITTED' || r.status === 'SCHEDULED');
      }
    }

    const matchStatus = filter === 'ALL' || r.status === filter;
    return matchSearch && matchScope && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium text-xs">Không tìm thấy hồ sơ nào phù hợp.</p>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    let statusBadge = '';
    let actionButtons = '';

    if (isManager) {
      // GÓC NHÌN QUẢN LÝ (MANAGER)
      if (r.status === 'PENDING_APPROVAL') {
        statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Staff đã nghiệm thu · Chờ duyệt</span>';
        actionButtons = `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <button onclick="openManagerApprovalModal('${r.id}')" class="px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors" title="Quản lý phê duyệt quyết toán cọc">
              <span>Duyệt quyết toán &rarr;</span>
            </button>
          </div>
        `;
      } else if (r.status === 'DISPUTED') {
        statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Cư dân khiếu nại bồi thường</span>';
        actionButtons = `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <button onclick="openManagerDisputeModal('${r.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors" title="Quản lý thẩm định giải quyết khiếu nại">
              <span>Thẩm định khiếu nại &rarr;</span>
            </button>
          </div>
        `;
      } else if (r.status === 'REFUND_TRANSFERRED') {
        statusBadge = '<span class="badge bg-blue-100 text-blue-800">Chờ cư dân xác nhận đã nhận tiền</span>';
        actionButtons = '<span class="text-xs text-slate-500">Đã chuyển khoản hoàn</span>';
      } else if (r.status === 'REFUND_PENDING') {
        statusBadge = getCheckoutCase(r).isEarlyCheckout
          ? '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">Cọc không hoàn · chờ hoàn tiền thuê dư</span>'
          : '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">Cọc chờ xác nhận chuyển hoàn</span>';
        actionButtons = getCheckoutCase(r).isEarlyCheckout && getCheckoutCase(r).refundAmount <= 0 ? '<span class="text-xs text-amber-800 font-medium">Không phát sinh khoản hoàn</span>' : `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <button onclick="openManagerRefundModal('${r.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors" title="Xác nhận lệnh chuyển hoàn">
              <span>${getCheckoutCase(r).isEarlyCheckout ? 'Duyệt hoàn tiền thuê dư' : 'Duyệt lệnh chi UNC'} &rarr;</span>
            </button>
          </div>
        `;
      } else if (r.status === 'CLOSED') {
        statusBadge = r.depositSettlementStatus === 'FORFEITED'
          ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">${r.prepaidRentSettlementStatus === 'PAID' ? 'Đã tất toán · cọc giữ lại, thuê dư đã hoàn' : 'Đã tất toán · cọc không hoàn'}</span>`
          : '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Đã tất toán hoàn tất</span>';
        actionButtons = r.depositSettlementStatus === 'FORFEITED' ? `<span class="text-xs text-amber-800 font-medium">${r.prepaidRentSettlementStatus === 'PAID' ? 'Đã hoàn tiền thuê dư; cọc được giữ lại' : 'Đã giữ lại tiền cọc theo điều kiện hợp đồng'}</span>` : `
          <span class="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded border border-slate-200">Đã hoàn cọc & lưu trữ</span>
        `;
      } else {
        // Khi Quản lý xem tab "Staff đang khảo sát"
        statusBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">${r.status === 'SUBMITTED' ? 'Mới tiếp nhận' : 'Đang hẹn lịch khảo sát'}</span>`;
        actionButtons = `
          <span class="text-xs text-slate-500 italic">Staff đang khảo sát phòng</span>
        `;
      }

      const checkoutCase = getCheckoutCase(r);
      const electricCost = Math.max(0, Number(r.meterElectricCurr || 0) - Number(r.meterElectricPrev || 0)) * Number(r.electricRate || 0);
      const waterCost = Math.max(0, Number(r.meterWaterCurr || 0) - Number(r.meterWaterPrev || 0)) * Number(r.waterRate || 0);
      const damageCost = (r.damages || []).reduce((sum, damage) => sum + Number(damage.cost || 0), 0);
      const totalDeductions = electricCost + waterCost + damageCost + Number(r.cleaningFee || 0);
      const contractReviewLabel = checkoutCase.isEarlyCheckout
        ? `<span class="block text-[10px] font-bold text-amber-700">${r.status === 'CLOSED' ? 'Trả trước hạn · cọc giữ lại' : 'Trả trước hạn · cần xem xét'}</span>`
        : checkoutCase.contractExpiredAtRequest
          ? '<span class="block text-[10px] font-bold text-blue-700">Hợp đồng đã hết · cọc chờ hoàn</span>'
          : '';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="p-3.5 font-mono font-bold text-slate-900">${r.code}</td>
          <td class="p-3.5">
            <strong class="text-teal-700 font-bold text-sm">${r.room}</strong>
            <span class="block text-[11px] text-slate-400">${r.building}</span>
          </td>
          <td class="p-3.5">
            <span class="font-bold text-slate-900">${r.tenant}</span>
            <span class="block text-[11px] text-slate-400">${r.phone}</span>
          </td>
          <td class="p-3.5">
            <span class="font-medium text-slate-800">${r.assignedStaff || 'Phạm Tuấn Anh'}</span>
            <span class="block text-[10px] text-slate-400">${r.actualCheckoutDate || r.expectedDate} (${r.timeslot})</span>
            <span class="block text-[10px] text-slate-500">Hạn HĐ: ${checkoutDateLabel(checkoutCase.contractEndDate)}</span>
            ${contractReviewLabel}
          </td>
          <td class="p-3.5">
            <div class="font-mono text-xs">
              <span class="text-slate-500">Đối soát điện nước & chi phí: <strong class="text-red-600">${formatVND(totalDeductions)}</strong></span>
              <span class="block ${getCheckoutCase(r).isEarlyCheckout ? 'text-amber-700' : 'text-emerald-700'} font-bold">${getCheckoutCase(r).isEarlyCheckout ? (getCheckoutCase(r).refundAmount > 0 ? 'Hoàn thuê dư' : 'Cọc không hoàn') : 'Hoàn'}: ${formatVND(getCheckoutCase(r).refundAmount)}</span>
            </div>
          </td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right">${actionButtons}</td>
        </tr>
      `;
    } else {
      // GÓC NHÌN NHÂN VIÊN VẬN HÀNH (STAFF)
      if (r.status === 'SUBMITTED') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><i data-lucide="clock" class="w-3 h-3"></i>Mới gửi đơn check-out</span>';
        actionButtons = `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <button onclick="openAcceptModal('${r.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1" title="Tiếp nhận đơn và chốt lịch khảo sát">
              <i data-lucide="calendar-check" class="w-3.5 h-3.5"></i>
              <span>Tiếp nhận & Xếp lịch &rarr;</span>
            </button>
          </div>
        `;
      } else if (r.status === 'SCHEDULED') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><i data-lucide="calendar" class="w-3 h-3"></i>Đã hẹn lịch khảo sát</span>';
        actionButtons = `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <button onclick="openInspectionModal('${r.id}')" class="px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1" title="Khảo sát chốt điện nước tại phòng">
              <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>
              <span>Nghiệm thu tại phòng &rarr;</span>
            </button>
          </div>
        `;
      } else if (r.status === 'PENDING_APPROVAL') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800"><i data-lucide="check" class="w-3 h-3"></i>Đã nghiệm thu xong</span>';
        actionButtons = `
          <span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">Đã gửi Quản lý duyệt</span>
        `;
      } else if (r.status === 'DISPUTED') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Cư dân khiếu nại</span>';
        actionButtons = `
          <span class="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">Quản lý đang thẩm định</span>
        `;
      } else if (r.status === 'WAITING_RESIDENT_SIGN') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Chờ cư dân ký biên bản</span>';
        actionButtons = '<span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">Quản lý đã duyệt quyết toán</span>';
      } else if (r.status === 'REFUND_TRANSFERRED') {
        statusBadge = '<span class="badge bg-blue-100 text-blue-800">Chờ cư dân xác nhận đã nhận tiền</span>';
        actionButtons = '<span class="text-xs text-slate-500">Đã chuyển khoản hoàn</span>';
      } else if (r.status === 'REFUND_PENDING') {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Cư dân đã đồng ý biên bản</span>';
        actionButtons = `
          <div class="inline-flex items-center gap-1.5 justify-end">
            <span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">Chờ Quản lý duyệt hoàn cọc</span>
          </div>
        `;
      } else {
        statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Đã hoàn tất</span>';
        actionButtons = `<span class="text-xs text-slate-400">Đã bàn giao</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="p-3.5 font-mono font-bold text-slate-900">${r.code}</td>
          <td class="p-3.5">
            <strong class="text-slate-900 font-bold">${r.room}</strong>
            <span class="block text-[11px] text-slate-400">${r.building}</span>
          </td>
          <td class="p-3.5">
            <span class="font-bold text-slate-900">${r.tenant}</span>
            <span class="block text-[11px] text-slate-400">${r.phone}</span>
          </td>
          <td class="p-3.5">${r.requestDate}</td>
          <td class="p-3.5">
            <strong class="text-slate-900 font-semibold">${r.expectedDate}</strong>
            <span class="block text-[10px] text-slate-500">${r.timeslot}</span>
          </td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right">${actionButtons}</td>
        </tr>
      `;
    }
  }).join('');

  lucide.createIcons();
}

function openAcceptModal(reqId) {
  const requests = DataStore.getCheckoutRequests();
  const item = reqId
    ? requests.find(r => r.id === reqId)
    : (requests.find(r => r.status === 'SUBMITTED') || requests[0]);

  if (!item) {
    showToast('Hiện không có đơn nào đang chờ tiếp nhận!');
    return;
  }

  activeAcceptId = item.id;
  document.getElementById('acc-modal-code').textContent = item.code;
  document.getElementById('acc-modal-room').textContent = item.room;
  document.getElementById('acc-modal-tenant').textContent = item.tenant;
  document.getElementById('acc-modal-phone').textContent = item.phone;
  document.getElementById('acc-modal-reqdate').textContent = item.requestDate;
  document.getElementById('acc-modal-expdate').textContent = item.expectedDate;
  document.getElementById('acc-modal-notes').textContent = item.notes || 'Không có ghi chú thêm.';

  const badge = document.getElementById('acc-modal-badge');
  if (item.status === 'SUBMITTED') {
    badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800';
    badge.textContent = 'SUBMITTED (Mới tiếp nhận)';
  } else {
    badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800';
    badge.textContent = item.status + ' (Đã lên lịch)';
  }

  openModal('acceptRequestModal');
}

function confirmAcceptRequest() {
  const contacted = document.getElementById('chk-acc-contacted')?.checked;
  if (!contacted) {
    showToast('Vui lòng tích xác nhận đã liên hệ và thống nhất giờ với cư dân!', 'error');
    return;
  }

  const slot = document.getElementById('acc-slot')?.value || '09:30';
  const staff = document.getElementById('acc-staff')?.value || 'Phạm Tuấn Anh';

  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === activeAcceptId);
  if (target) {
    target.status = 'SCHEDULED';
    target.timeslot = slot;
    target.assignedStaff = staff;
    DataStore.saveCheckoutRequests(requests);
    showToast('Đã tiếp nhận đơn ' + target.code + ' (Phòng ' + target.room + ') thành công! Lịch hẹn đã chuyển sang SCHEDULED.');
  }

  closeModal('acceptRequestModal');
  renderManagementView();
}

function openInspectionModal(reqId) {
  activeInspectionId = reqId;
  const requests = DataStore.getCheckoutRequests();
  const item = requests.find(r => r.id === reqId) || requests[0];

  document.getElementById('insp-modal-code').textContent = item.code;
  document.getElementById('insp-modal-room').textContent = item.room;
  document.getElementById('insp-modal-tenant').textContent = item.tenant;
  document.getElementById('inp-checkout-actual-date').value = item.actualCheckoutDate || item.expectedDate || checkoutToday();
  document.getElementById('chk-cleaning').checked = Number(item.cleaningFee || 0) > 0;
  document.getElementById('inp-damage-curtain').value = item.damages?.[0]?.cost || 0;

  if (item.meterElectricPrev) document.getElementById('inp-elec-prev').value = item.meterElectricPrev;
  if (item.meterElectricCurr) document.getElementById('inp-elec-curr').value = item.meterElectricCurr;
  if (item.meterWaterPrev) document.getElementById('inp-water-prev').value = item.meterWaterPrev;
  if (item.meterWaterCurr) document.getElementById('inp-water-curr').value = item.meterWaterCurr;

  calcInspectionTotals();
  openModal('inspectionModal');
}

function calcInspectionTotals() {
  const elecPrev = parseInt(document.getElementById('inp-elec-prev')?.value || 1450);
  const elecCurr = parseInt(document.getElementById('inp-elec-curr')?.value || 1580);
  const elecDiff = Math.max(0, elecCurr - elecPrev);
  const elecCost = elecDiff * 3000;
  document.getElementById('lbl-elec-diff').textContent = `${elecDiff} kWh`;
  document.getElementById('lbl-elec-cost').textContent = formatVND(elecCost);

  const waterPrev = parseInt(document.getElementById('inp-water-prev')?.value || 60);
  const waterCurr = parseInt(document.getElementById('inp-water-curr')?.value || 65);
  const waterDiff = Math.max(0, waterCurr - waterPrev);
  const waterCost = waterDiff * 12000;
  document.getElementById('lbl-water-diff').textContent = `${waterDiff} m³`;
  document.getElementById('lbl-water-cost').textContent = formatVND(waterCost);

  const curtainDamage = parseInt(document.getElementById('inp-damage-curtain')?.value || 0);
  const cleaningFee = document.getElementById('chk-cleaning')?.checked ? 300000 : 0;

  const inspectionRequest = DataStore.getCheckoutRequests().find(r => r.id === activeInspectionId);
  const actualCheckoutDate = document.getElementById('inp-checkout-actual-date')?.value || inspectionRequest?.expectedDate;
  const draftRequest = inspectionRequest ? {
    ...inspectionRequest,
    actualCheckoutDate,
    meterElectricPrev: elecPrev,
    meterElectricCurr: elecCurr,
    meterWaterPrev: waterPrev,
    meterWaterCurr: waterCurr,
    damages: (inspectionRequest.damages || []).map((damage, index) => index === 0 ? { ...damage, cost: curtainDamage } : damage),
    cleaningFee,
    prepaidRentSettlement: null
  } : null;
  const caseInfo = getCheckoutCase(draftRequest);
  const totalDeductions = elecCost + waterCost + curtainDamage + cleaningFee;
  const depositRefund = caseInfo.isEarlyCheckout ? 0 : Math.max(0, Number(draftRequest?.deposit || 0) - totalDeductions);
  const rentAdvance = getPaidRentAdvance(draftRequest, actualCheckoutDate);
  const finalRefund = depositRefund + rentAdvance.refundAmount;

  document.getElementById('lbl-final-refund').textContent = formatVND(finalRefund);
  document.getElementById('lbl-rent-advance-refund').textContent = `Tiền thuê trả trước chưa sử dụng: ${formatVND(rentAdvance.grossUnusedRent)}${rentAdvance.chargesOffset ? ` · đối trừ ${formatVND(rentAdvance.chargesOffset)} chi phí còn nợ` : ''}; cọc ${caseInfo.isEarlyCheckout ? 'không hoàn' : `dự kiến hoàn ${formatVND(depositRefund)}`}.`;
}

function submitInspectionReport() {
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === activeInspectionId) || requests[0];
  if (target) {
    target.status = 'PENDING_APPROVAL';
    target.actualCheckoutDate = document.getElementById('inp-checkout-actual-date')?.value || target.expectedDate;
    target.isEarlyCheckout = !!(getRequestContractEndDate(target) && target.actualCheckoutDate < getRequestContractEndDate(target));
    target.meterElectricCurr = parseInt(document.getElementById('inp-elec-curr')?.value || 1580);
    target.meterWaterCurr = parseInt(document.getElementById('inp-water-curr')?.value || 65);
    target.cleaningFee = document.getElementById('chk-cleaning')?.checked ? 300000 : 0;
    const curtainDamage = parseInt(document.getElementById('inp-damage-curtain')?.value || 0);
    if (target.damages?.[0]) target.damages[0].cost = curtainDamage;
    const elecCost = Math.max(0, target.meterElectricCurr - (target.meterElectricPrev || 1450)) * (target.electricRate || 3000);
    const waterCost = Math.max(0, target.meterWaterCurr - (target.meterWaterPrev || 60)) * (target.waterRate || 12000);
    const damageCost = (target.damages || []).reduce((sum, damage) => sum + Number(damage.cost || 0), 0);
    const totalCharges = elecCost + waterCost + damageCost + (target.cleaningFee || 0);
    const caseInfo = getCheckoutCase(target);
    target.depositRefundAmount = caseInfo.isEarlyCheckout ? 0 : Math.max(0, (target.deposit || 0) - totalCharges);
    target.prepaidRentSettlement = getPaidRentAdvance({ ...target, prepaidRentSettlement: null }, target.actualCheckoutDate);
    target.refundAmount = target.depositRefundAmount + target.prepaidRentSettlement.refundAmount;
    target.refundAmountIsTotal = true;
    DataStore.saveCheckoutRequests(requests);
    showToast('Kỹ thuật viên đã hoàn tất nghiệm thu phòng ' + target.room + '! Biên bản đã chuyển sang Quản lý duyệt quyết toán.');
  }
  closeModal('inspectionModal');
  renderManagementView();
}
function showManagerRejectBox() {
  document.getElementById('manager-approval-reject-box')?.classList.remove('hidden');
  document.getElementById('manager-approval-actions')?.classList.add('hidden');
  lucide.createIcons();
}

function hideManagerRejectBox() {
  document.getElementById('manager-approval-reject-box')?.classList.add('hidden');
  document.getElementById('manager-approval-actions')?.classList.remove('hidden');
}

function submitManagerRejection() {
  const reason = document.getElementById('manager-reject-reason')?.value.trim();
  if (!reason) {
    showToast('Vui lòng nhập lý do yêu cầu Kỹ thuật kiểm tra lại!', 'error');
    return;
  }
  showToast('Đã từ chối xác nhận & gửi yêu cầu kiểm tra lại cho Kỹ thuật viên: ' + reason);
  hideManagerRejectBox();
  closeModal('managerApprovalModal');
  renderManagementView();
}

function openManagerApprovalModal(reqId) {
  activeApprovalId = reqId;
  hideManagerRejectBox();
  const requests = DataStore.getCheckoutRequests();
  const item = requests.find(r => r.id === reqId) || requests[0];

  if (item) {
    document.getElementById('mgr-appr-code').textContent = 'Phiếu: ' + item.code;
    document.getElementById('mgr-appr-room').textContent = item.room + ' • ' + item.building;
    document.getElementById('mgr-appr-tenant').textContent = item.tenant;
    document.getElementById('mgr-appr-staff').textContent = item.assignedStaff || 'Phạm Tuấn Anh';
    document.getElementById('mgr-appr-deposit').textContent = formatVND(item.deposit);
    const caseInfo = getCheckoutCase(item);
    document.getElementById('mgr-appr-deposit-settlement-label').textContent = caseInfo.isEarlyCheckout ? 'Tiền cọc giữ lại do trả trước hạn:' : 'Tiền cọc dự kiến hoàn:';
    document.getElementById('mgr-appr-deposit-settlement').textContent = formatVND(caseInfo.isEarlyCheckout ? item.deposit : caseInfo.depositRefundAmount);
    document.getElementById('mgr-appr-rent-advance').textContent = formatVND(caseInfo.rentAdvance.grossUnusedRent);
    document.getElementById('mgr-appr-rent-periods').textContent = caseInfo.rentAdvance.periods.map(period => `${period.month}: ${period.unusedDays}/${period.daysInMonth} ngày`).join(' · ');
    const contractNotice = document.getElementById('mgr-appr-contract-notice');
    if (contractNotice) {
      contractNotice.className = `rounded-lg border p-3 text-xs ${caseInfo.isEarlyCheckout ? 'bg-amber-50 border-amber-200 text-amber-900' : caseInfo.contractExpiredAtRequest ? 'bg-blue-50 border-blue-200 text-blue-900' : 'hidden'}`;
      contractNotice.textContent = caseInfo.isEarlyCheckout
        ? `Trả phòng trước hạn hợp đồng (${checkoutDateLabel(caseInfo.contractEndDate)}). Tiền cọc không được hoàn; tiền thuê trả trước được quyết toán riêng.`
        : caseInfo.contractExpiredAtRequest
          ? `Hợp đồng đã hết hạn ngày ${checkoutDateLabel(caseInfo.contractEndDate)}. Cọc ${formatVND(item.refundAmount || 0)} vẫn chờ đối soát và duyệt hoàn.`
          : '';
    }

    const elecDiff = Math.max(0, (item.meterElectricCurr || 1580) - (item.meterElectricPrev || 1450));
    const elecCost = elecDiff * (item.electricRate || 3000);
    document.getElementById('mgr-appr-elec-label').textContent = `Điện tiêu thụ (${item.meterElectricPrev || 1450} → ${item.meterElectricCurr || 1580} kWh):`;
    document.getElementById('mgr-appr-elec').textContent = '-' + formatVND(elecCost);

    const waterDiff = Math.max(0, (item.meterWaterCurr || 65) - (item.meterWaterPrev || 60));
    const waterCost = waterDiff * (item.waterRate || 12000);
    document.getElementById('mgr-appr-water-label').textContent = `Nước tiêu thụ (${item.meterWaterPrev || 60} → ${item.meterWaterCurr || 65} m³):`;
    document.getElementById('mgr-appr-water').textContent = '-' + formatVND(waterCost);

    const damageCost = (item.damages || []).reduce((sum, d) => sum + d.cost, 0);
    document.getElementById('mgr-appr-damage-label').textContent = damageCost > 0 ? `Thiệt hại tài sản (${item.damages[0].item}):` : 'Thiệt hại tài sản:';
    document.getElementById('mgr-appr-damage').textContent = damageCost > 0 ? '-' + formatVND(damageCost) : '0 ₫ (Không hư hại)';

    document.getElementById('mgr-appr-cleaning').textContent = formatVND(item.cleaningFee || 0);
    document.getElementById('mgr-appr-refund').textContent = formatVND(getCheckoutCase(item).refundAmount);
    document.getElementById('mgr-appr-refund-label').textContent = caseInfo.isEarlyCheckout
      ? 'TIỀN THUÊ TRẢ TRƯỚC CÒN DƯ ĐƯỢC HOÀN:'
      : 'TỔNG SỐ TIỀN ĐƯỢC HOÀN:';
  }

  openModal('managerApprovalModal');
}

function confirmManagerApproval() {
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === activeApprovalId) || requests[0];
  if (target) {
    target.status = 'WAITING_RESIDENT_SIGN';
    target.isSigned = false;
    target.depositSettlementStatus = 'PENDING_SETTLEMENT';
    DataStore.saveCheckoutRequests(requests);
    showToast('Quản lý đã phê duyệt quyết toán cho căn hộ ' + target.room + '! Đã gửi biên bản sang Cư dân ký.');
  }
  closeModal('managerApprovalModal');
  renderManagementView();
}

function openManagerDisputeModal(reqId) {
  activeDisputeId = reqId;
  const requests = DataStore.getCheckoutRequests();
  const item = requests.find(r => r.id === reqId) || requests[0];

  if (item) {
    document.getElementById('disp-mgr-code').textContent = item.code;
    document.getElementById('disp-mgr-room').textContent = item.room;
    document.getElementById('disp-mgr-tenant').textContent = item.tenant;
    document.getElementById('disp-mgr-phone').textContent = item.phone;
    document.getElementById('disp-mgr-staff').textContent = item.assignedStaff || 'Phạm Tuấn Anh';
    if (item.damages && item.damages[0]) {
      document.getElementById('disp-mgr-item').textContent = item.damages[0].item;
      document.getElementById('disp-mgr-cost').textContent = formatVND(item.damages[0].cost);
    }
    document.getElementById('disp-mgr-reason').textContent = item.disputeReason || 'Cư dân giải trình tài sản đã có dấu hiệu hao mòn từ khi nhận nhà.';
  }

  openModal('managerDisputeModal');
}

function submitManagerDisputeResolution() {
  const decision = document.querySelector('input[name="disp-mgr-decision"]:checked')?.value || 'accept';
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === activeDisputeId);

  if (target) {
    if (decision === 'accept') {
      if (target.damages && target.damages[0]) target.damages[0].cost = 0;
      target.refundAmount = getCheckoutCase(target).isEarlyCheckout ? 0 : target.deposit - 450000;
      target.status = 'PENDING_APPROVAL';
      showToast('Quản lý đã chấp nhận khiếu nại (Miễn trừ đền bù 0 ₫). Hồ sơ chuyển sang duyệt quyết toán!');
    } else if (decision === 'reduce') {
      if (target.damages && target.damages[0]) target.damages[0].cost = Math.round(target.damages[0].cost / 2);
      target.refundAmount = getCheckoutCase(target).isEarlyCheckout ? 0 : target.deposit - 450000 - (target.damages ? target.damages[0].cost : 0);
      target.status = 'PENDING_APPROVAL';
      showToast('Quản lý đã hỗ trợ giảm 50% chi phí đền bù. Hồ sơ chuyển sang duyệt quyết toán!');
    } else {
      target.status = 'PENDING_APPROVAL';
      showToast('Quản lý đã bác bỏ khiếu nại (Giữ nguyên theo biên bản kỹ thuật).');
    }
    delete target.prepaidRentSettlement;
    delete target.refundAmountIsTotal;
    delete target.depositRefundAmount;
    const caseInfo = getCheckoutCase(target);
    const electric = Math.max(0, Number(target.meterElectricCurr || 0) - Number(target.meterElectricPrev || 0)) * Number(target.electricRate || 0);
    const water = Math.max(0, Number(target.meterWaterCurr || 0) - Number(target.meterWaterPrev || 0)) * Number(target.waterRate || 0);
    const damage = (target.damages || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const charges = electric + water + damage + Number(target.cleaningFee || 0);
    target.depositRefundAmount = caseInfo.isEarlyCheckout ? 0 : Math.max(0, Number(target.deposit || 0) - charges);
    target.prepaidRentSettlement = getPaidRentAdvance({ ...target, prepaidRentSettlement: null }, target.actualCheckoutDate || target.expectedDate);
    target.refundAmount = target.depositRefundAmount + target.prepaidRentSettlement.refundAmount;
    target.refundAmountIsTotal = true;
    DataStore.saveCheckoutRequests(requests);
  }

  closeModal('managerDisputeModal');
  renderManagementView();
}

function showRefundRejectBox() {
  document.getElementById('refund-reject-box')?.classList.remove('hidden');
  document.getElementById('refund-actions')?.classList.add('hidden');
  lucide.createIcons();
}

function hideRefundRejectBox() {
  document.getElementById('refund-reject-box')?.classList.add('hidden');
  document.getElementById('refund-actions')?.classList.remove('hidden');
}

function submitRefundRejection() {
  const reason = document.getElementById('refund-reject-reason')?.value.trim();
  if (!reason) {
    showToast('Vui lòng nhập lý do chưa xác nhận chi hoàn cọc!', 'error');
    return;
  }
  showToast('Đã tạm hoãn lệnh chi & gửi lý do: ' + reason);
  hideRefundRejectBox();
  closeModal('managerRefundModal');
  renderManagementView();
}

function openManagerRefundModal(reqId) {
  activeRefundId = reqId;
  hideRefundRejectBox();
  const requests = DataStore.getCheckoutRequests();
  const item = requests.find(r => r.id === reqId) || requests[0];

  if (item && getCheckoutCase(item).refundAmount <= 0) {
    showToast('Hồ sơ không có khoản cần chuyển hoàn.', 'error');
    return;
  }

  if (item) {
    document.getElementById('mgr-ref-unc').textContent = 'UNC-' + item.code.replace('REQ-OUT-', '');
    document.getElementById('mgr-ref-room').textContent = item.room + ' • ' + item.building;
    document.getElementById('mgr-ref-bank').textContent = item.bankAccount?.bank || 'MB Bank';
    document.getElementById('mgr-ref-account').textContent = item.bankAccount?.accountNumber || '0904445566';
    document.getElementById('mgr-ref-name').textContent = item.bankAccount?.accountName || item.tenant.toUpperCase();
    document.getElementById('mgr-ref-amount').textContent = formatVND(getCheckoutCase(item).refundAmount);
    document.getElementById('mgr-ref-amount-label').textContent = getCheckoutCase(item).isEarlyCheckout ? 'Tiền thuê trả trước còn dư:' : 'Số tiền hoàn chi:';
    document.getElementById('mgr-ref-title').textContent = getCheckoutCase(item).isEarlyCheckout ? 'Xác Nhận Hoàn Tiền Thuê Trả Trước Còn Dư' : 'Xác Nhận Khoản Hoàn Qua Ngân Hàng';
    document.getElementById('mgr-ref-doc-label').textContent = getCheckoutCase(item).isEarlyCheckout ? 'Lệnh hoàn tiền thuê trả trước' : 'Ủy Nhiệm Chi (UNC) Ngân Hàng';
  }

  openModal('managerRefundModal');
}

function confirmManagerRefund() {
  if (!['MANAGER', 'ADMIN'].includes(DataStore.getRole())) return;
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === activeRefundId);
  if (!target || target.status !== 'REFUND_PENDING' || !target.isSigned) {
    showToast('Hồ sơ chưa sẵn sàng chuyển hoàn hoặc đã chuyển tiền.', 'error');
    return;
  }
  if (target) {
    const caseInfo = getCheckoutCase(target);
    if (caseInfo.refundAmount <= 0) {
      closeModal('managerRefundModal');
      showToast('Hồ sơ không có khoản cần chuyển hoàn.', 'error');
      return;
    }
    target.depositRefundAmount = caseInfo.depositRefundAmount;
    target.prepaidRentSettlement = caseInfo.rentAdvance;
    target.refundAmount = caseInfo.refundAmount;
    target.refundAmountIsTotal = true;
    target.status = 'REFUND_TRANSFERRED';
    target.refundTransferredAt = new Date().toISOString();
    target.depositSettlementStatus = caseInfo.isEarlyCheckout ? 'FORFEITED' : 'TRANSFERRED';
    if (caseInfo.rentAdvance.refundAmount > 0) {
      target.prepaidRentSettlementStatus = 'TRANSFERRED';
      target.rentRefundTransferredAt = new Date().toISOString();
    }
    if (!caseInfo.isEarlyCheckout) target.depositTransferredAt = new Date().toISOString();
    const contracts = DataStore.getContracts();
    const contract = contracts.find(c => c.code === target.contractCode)
      || contracts.find(c => c.room === target.room && c.tenant === target.tenant);
    if (contract) {
      contract.status = 'TERMINATED';
      contract.terminatedAt = new Date().toISOString();
      DataStore.saveContracts(contracts);
    }
    DataStore.saveCheckoutRequests(requests);
    showToast('Đã ghi nhận chuyển khoản hoàn. Hồ sơ chờ cư dân xác nhận đã nhận tiền.');
  }
  closeModal('managerRefundModal');
  renderManagementView();
}

function confirmResidentSign() {
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.room === 'P201' || r.id === 'req-01') || requests[0];
  if (target) {
    target.isSigned = true;
    const isEarlyCheckout = getCheckoutCase(target).isEarlyCheckout;
    const settlement = getCheckoutCase(target);
    target.depositRefundAmount = settlement.depositRefundAmount;
    target.prepaidRentSettlement = settlement.rentAdvance;
    target.refundAmount = settlement.refundAmount;
    target.refundAmountIsTotal = true;
    target.status = isEarlyCheckout && settlement.refundAmount <= 0 ? 'CLOSED' : 'REFUND_PENDING';
    target.depositSettlementStatus = isEarlyCheckout ? 'FORFEITED' : 'REFUND_PENDING';
    if (settlement.rentAdvance.refundAmount > 0) target.prepaidRentSettlementStatus = 'PENDING';
    if (isEarlyCheckout) {
      target.depositForfeitedAt = new Date().toISOString();
      const contracts = DataStore.getContracts();
      const contract = contracts.find(c => c.code === target.contractCode)
        || contracts.find(c => c.room === target.room && c.tenant === target.tenant);
      if (contract) {
        contract.status = 'TERMINATED';
        contract.terminatedAt = new Date().toISOString();
        DataStore.saveContracts(contracts);
      }
    }
    DataStore.saveCheckoutRequests(requests);
    showToast(isEarlyCheckout
      ? settlement.refundAmount > 0
        ? 'Cư dân đã ký thanh lý. Tiền cọc được giữ lại; tiền thuê trả trước chưa sử dụng đã chuyển sang chờ duyệt hoàn.'
        : 'Cư dân đã ký thanh lý trả trước hạn. Tiền cọc được giữ lại, không phát sinh khoản hoàn.'
      : 'Cư dân đã ký biên bản thanh lý. Hồ sơ đã chuyển sang Quản lý duyệt hoàn cọc.');
  }
  closeModal('residentSignModal');
  selectResidentStep(4);
}

function submitResidentDispute() {
  const reason = document.getElementById('disp-reason')?.value.trim();
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.room === 'P201' || r.id === 'req-01') || requests[0];
  if (target) {
    target.status = 'DISPUTED';
    target.disputeReason = reason || 'Cư dân giải trình rèm cửa đã có dấu hiệu hao mòn từ khi nhận nhà.';
    DataStore.saveCheckoutRequests(requests);
    showToast('Đã gửi nội dung khiếu nại tới Ban Quản Lý (Trần Minh Đức) để thẩm định!');
  }
  closeModal('residentDisputeModal');
  selectResidentStep(3);
}
function confirmResidentRefundReceived() {
  if (DataStore.getRole() !== 'RESIDENT') return;
  const residentRequest = getResidentRequest();
  const requests = DataStore.getCheckoutRequests();
  const target = requests.find(r => r.id === residentRequest?.id);
  if (!target || target.status !== 'REFUND_TRANSFERRED' || !target.refundTransferredAt || !target.isSigned || Number(target.refundAmount) <= 0) {
    showToast('Chưa có khoản hoàn đang chờ xác nhận.', 'error');
    return;
  }
  const now = new Date().toISOString();
  target.status = 'CLOSED';
  target.refundReceivedAt = now;
  target.refundReceivedBy = DataStore.getUser().id;
  if (target.depositSettlementStatus === 'TRANSFERRED') {
    target.depositSettlementStatus = 'PAID';
    target.depositPaidAt = now;
  }
  if (target.prepaidRentSettlementStatus === 'TRANSFERRED') {
    target.prepaidRentSettlementStatus = 'PAID';
    target.rentRefundPaidAt = now;
  }
  DataStore.saveCheckoutRequests(requests);
  showToast('Đã xác nhận nhận đủ khoản hoàn. Hồ sơ quyết toán đã hoàn tất.');
  selectResidentStep(4);
}

function downloadSettlementPDF() {
  showToast('Đang tải Biên bản Thanh lý & Quyết toán cọc P201 (PDF)...');
}

function downloadUNCPDF() {
  showToast('Đang tải chứng từ chuyển khoản cho phiếu ' + (getResidentRequest()?.code || 'check-out') + '...');
}

function handleCreateCheckoutRequest(event) {
  event.preventDefault();
  const date = document.getElementById('req-date')?.value;
  const slot = document.getElementById('req-slot')?.value;
  const bank = document.getElementById('req-bank')?.value;
  const account = document.getElementById('req-account')?.value;
  const notes = document.getElementById('req-notes')?.value;
  const contract = getResidentContract();
  const contractEndDate = contract?.endDate;
  const resident = DataStore.getUser();
  const earliest = new Date();
  earliest.setHours(0, 0, 0, 0);
  earliest.setDate(earliest.getDate() + 15);
  const earliestDate = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, '0')}-${String(earliest.getDate()).padStart(2, '0')}`;

  if (!contract || !contractEndDate) {
    showToast('Không tìm thấy hợp đồng và hạn thuê của căn hộ. Vui lòng liên hệ Ban Quản lý.', 'error');
    return;
  }
  if (!date || date < earliestDate) {
    showToast('Ngày dự kiến trả phòng cần báo trước ít nhất 15 ngày.', 'error');
    return;
  }

  const requestDate = checkoutToday();
  const isEarlyCheckout = date < contractEndDate;
  const contractStatusAtRequest = contractEndDate < requestDate ? 'EXPIRED' : 'ACTIVE';

  const requests = DataStore.getCheckoutRequests();
  const newReq = {
    id: 'req-' + Date.now(),
    code: 'REQ-OUT-2026-00' + (requests.length + 50),
    residentId: resident.id,
    room: contract.room,
    building: contract.building,
    tenant: contract.tenant,
    phone: contract.phone,
    contractCode: contract.code,
    contractEndDate,
    contractStatusAtRequest,
    isEarlyCheckout,
    depositSettlementStatus: 'PENDING_SETTLEMENT',
    deposit: contract.deposit,
    requestDate,
    expectedDate: date,
    timeslot: slot,
    status: 'SUBMITTED',
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 1450,
    meterElectricCurr: null,
    electricRate: 3000,
    meterWaterPrev: 60,
    meterWaterCurr: null,
    waterRate: 12000,
    damages: [],
    cleaningFee: 0,
    notes: notes || 'Yêu cầu trả phòng mới từ cư dân.',
    bankAccount: { bank, accountNumber: account, accountName: contract.tenant.toUpperCase() },
    refundAmount: isEarlyCheckout ? 0 : contract.deposit,
    isSigned: false,
    disputeReason: null,
  };

  requests.unshift(newReq);
  DataStore.saveCheckoutRequests(requests);
  closeModal('createCheckoutModal');
  showToast(isEarlyCheckout
    ? `Đã gửi phiếu ${newReq.code}. Yêu cầu trả trước hạn đang chờ Ban Quản lý xem xét.`
    : `Đã gửi phiếu ${newReq.code}. Yêu cầu đang chờ Kỹ thuật tiếp nhận & xếp lịch.`);
  initCheckoutPage();
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('checkout.html');
  renderTopbar('Quản lý Trả căn hộ & Bàn giao', 'Vận hành / Check-out');
  initCheckoutPage();
});
