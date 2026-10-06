/* Local-only wireframe interactions. Forms do not submit data or contact services. */
(() => {
  const byId = (id) => document.getElementById(id);
  const money = (value) => new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' ₫';
  const requestedAdjustment = new URLSearchParams(window.location.search).get('case');
  const refundStatus = new URLSearchParams(window.location.search).get('status') || 'pending';
  const adjustmentCases = {
    original: {fee: 350000, refund: 9200000, total: 800000},
    reduced: {fee: 175000, refund: 9375000, total: 625000},
    removed: {fee: 0, refund: 9550000, total: 450000},
    negative: {fee: 12000000, refund: -2450000, total: 12450000}
  };
  const adjustment = adjustmentCases[requestedAdjustment] ? requestedAdjustment : 'original';
  {
    const item = adjustmentCases[adjustment];
    const negative = adjustment === 'negative';
    const summary = byId('signature-settlement');
    if (summary) summary.textContent = negative
      ? `Tiền cọc 10.000.000 ₫, tổng chi phí 12.450.000 ₫, số tiền cần thanh toán thêm ${money(Math.abs(item.refund))}.`
      : `Tiền cọc 10.000.000 ₫, khấu trừ ${money(item.total)} (bao gồm hạng mục khiếu nại ${money(item.fee)}), số tiền hoàn ${money(item.refund)}.`;
    const agreementUtilities = byId('agreement-utilities');
    if (agreementUtilities) agreementUtilities.textContent = `−${money(450000)}`;
    const agreementDamage = byId('agreement-damage');
    if (agreementDamage) agreementDamage.textContent = `−${money(item.fee)}`;
    const agreementBalance = byId('agreement-balance');
    if (agreementBalance) agreementBalance.textContent = negative ? `−${money(Math.abs(item.refund))}` : `=${money(item.refund)}`;
    const agreementLabel = byId('agreement-balance-label');
    if (agreementLabel) agreementLabel.textContent = negative ? 'Số tiền cư dân cần nộp thêm' : 'Số tiền hoàn cọc thực nhận';
    const agreementAccept = byId('agreement-accept');
    if (agreementAccept && adjustment !== 'original') agreementAccept.href = `checkout-sign.html?case=${adjustment}`;
    const agreementHelp = byId('agreement-decision-help');
    if (agreementHelp && negative) agreementHelp.textContent = 'Đồng ý: ký biên bản rồi thanh toán bổ sung 2.450.000 ₫ qua SePay. Không đồng ý: gửi khiếu nại để quản lý thẩm định.';
    const caseSwitch = byId('agreement-case-switch');
    if (caseSwitch && negative) {
      caseSwitch.href = 'checkout-agreement.html';
      caseSwitch.textContent = 'Quay lại nhánh hoàn cọc 9.200.000 ₫';
    }
    const branch = byId('refund-branch');
    const paymentBranch = byId('payment-branch');
    if (branch) {
      if (negative) branch.classList.add('hidden');
      else {
        branch.classList.remove('hidden');
        branch.href = `../staff/key-return.html?case=${adjustment}`;
        branch.textContent = `Bàn giao chìa khóa & thẻ phòng →`;
      }
    }
    if (paymentBranch) {
      if (negative) {
        paymentBranch.classList.remove('hidden');
        paymentBranch.href = 'additional-payment.html';
        paymentBranch.textContent = `Cọc thiếu · nộp bổ sung ${money(Math.abs(item.refund))} qua SePay`;
      } else paymentBranch.classList.add('hidden');
    }
    const signReturn = byId('sign-agreement-return');
    if (signReturn && negative) signReturn.href = 'checkout-agreement.html?case=negative';
    const refundShortcut = byId('sign-refund-shortcut');
    if (refundShortcut) {
      if (negative) refundShortcut.classList.add('hidden');
      else {
        refundShortcut.classList.remove('hidden');
        refundShortcut.href = `deposit-refund.html?case=${adjustment}`;
      }
    }
    const refund = byId('refund-amount');
    if (refund) refund.textContent = negative ? `Không hoàn cọc · cần nộp thêm ${money(Math.abs(item.refund))}` : money(item.refund);
    const receipt = byId('refund-receipt-amount');
    if (receipt) receipt.textContent = negative ? 'Không phát sinh lệnh hoàn' : money(item.refund);
    const completeLink = byId('checkout-complete-link');
    if (completeLink) {
      completeLink.href = negative ? 'checkout-complete-additional.html' : `checkout-complete.html?case=${adjustment}`;
      if (refundStatus === 'transferred' && !negative) completeLink.classList.remove('hidden');
      else if (!negative) completeLink.classList.add('hidden');
    }
    const completeRefund = byId('complete-refund');
    if (completeRefund) completeRefund.textContent = negative ? `Đã thanh toán bổ sung ${money(Math.abs(item.refund))}` : `Đã lập lệnh hoàn ${money(item.refund)}`;
    const approvalStatus = byId('refund-approval-status');
    if (approvalStatus) approvalStatus.textContent = refundStatus === 'pending' ? 'PENDING APPROVAL' : 'APPROVED';
    const transferStatus = byId('refund-transfer-status');
    if (transferStatus) transferStatus.textContent = refundStatus === 'transferred' ? 'TRANSFERRED' : 'PENDING TRANSFER';
    const transferTitle = byId('refund-transfer-title');
    if (transferTitle && refundStatus === 'transferred') transferTitle.textContent = '3 · NGÂN HÀNG ĐÃ CHUYỂN';
    const transferNote = byId('refund-transfer-note');
    if (transferNote && refundStatus === 'transferred') transferNote.textContent = 'Ngân hàng đã chuyển tiền; hệ thống đã đối soát giao dịch.';
    const receiptNote = byId('refund-receipt-note');
    if (receiptNote && refundStatus === 'transferred') receiptNote.textContent = 'UNC đã lưu';
    const transferButton = byId('refund-transfer-button');
    const keyReturn = byId('refund-key-return');
    const managerApproval = byId('refund-manager-approval');
    const managerAmount = byId('manager-refund-amount');
    const managerAction = byId('approve-refund-action');
    if (managerAmount) managerAmount.textContent = money(item.refund);
    if (managerAction) managerAction.href = `../resident/deposit-refund.html?status=approved&case=${adjustment}`;
    if (managerApproval) {
      managerApproval.href = `../manager/refund-approval.html?case=${adjustment}`;
      if (refundStatus === 'pending') managerApproval.classList.remove('hidden');
      else managerApproval.classList.add('hidden');
    }
    if (transferButton) {
      transferButton.href = `deposit-refund.html?status=transferred&case=${adjustment}`;
      if (refundStatus === 'approved') transferButton.classList.remove('hidden');
      else transferButton.classList.add('hidden');
    }
    if (keyReturn) {
      keyReturn.classList.add('hidden');
    }
  }
  const show = (node, message) => {
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    node.setAttribute('role', 'status');
  };

  const requestDate = byId('move-out-date');
  if (requestDate) {
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + 15);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    requestDate.min = iso(min);
    if (!requestDate.value || requestDate.value < requestDate.min) requestDate.value = requestDate.min;
    requestDate.addEventListener('change', () => {
      const error = byId('request-error');
      if (requestDate.value && requestDate.value < requestDate.min) show(error, 'Ngày dự kiến cần báo trước ít nhất 15 ngày. Hãy chọn ngày muộn hơn.');
      else if (error) error.classList.remove('show');
    });
  }

  const requestForm = byId('checkout-request-form');
  requestForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = byId('request-error');
    const date = requestDate?.value ? new Date(`${requestDate.value}T00:00:00`) : null;
    const earliest = new Date();
    earliest.setHours(0, 0, 0, 0);
    earliest.setDate(earliest.getDate() + 15);
    if (!date || date < earliest || !requestForm.reportValidity()) {
      show(error, 'Ngày dự kiến cần báo trước ít nhất 15 ngày. Hãy chọn ngày hợp lệ và hoàn thành các mục bắt buộc.');
      requestDate?.focus();
      return;
    }
    byId('request-confirmation')?.classList.remove('hidden');
    byId('request-form-fields')?.classList.add('hidden');
    byId('request-code')?.replaceChildren(document.createTextNode('REQ-OUT-2026-0045'));
  });

  const inspect = byId('inspection-form');
  if (inspect) {
    const num = (id) => Number(byId(id)?.value || 0);
    const recalc = () => {
      const electric = Math.max(0, num('electric-current') - num('electric-previous')) * num('electric-rate');
      const water = Math.max(0, num('water-current') - num('water-previous')) * num('water-rate');
      const damage = [...inspect.querySelectorAll('[data-damage-cost]')].reduce((sum, el) => sum + Math.max(0, Number(el.value || 0)), 0);
      const cleaning = byId('cleaning-toggle')?.checked ? 300000 : 0;
      const utility = electric + water;
      const refund = 10000000 - utility - damage - cleaning;
      if (byId('electric-usage')) byId('electric-usage').textContent = `${Math.max(0, num('electric-current') - num('electric-previous'))} kWh · ${money(electric)}`;
      if (byId('water-usage')) byId('water-usage').textContent = `${Math.max(0, num('water-current') - num('water-previous'))} m³ · ${money(water)}`;
      if (byId('utility-total')) byId('utility-total').textContent = money(utility);
      if (byId('damage-total')) byId('damage-total').textContent = money(damage);
      if (byId('cleaning-total')) byId('cleaning-total').textContent = money(cleaning);
      if (byId('deposit-balance')) byId('deposit-balance').textContent = refund >= 0 ? money(refund) : `Cần thu thêm ${money(-refund)}`;
      if (byId('settlement-direction')) byId('settlement-direction').textContent = refund >= 0 ? 'DỰ KIẾN HOÀN CỌC' : 'DỰ KIẾN CƯ DÂN THANH TOÁN THÊM';
    };
    inspect.addEventListener('input', recalc);
    inspect.addEventListener('change', recalc);
    byId('add-asset-row')?.addEventListener('click', () => {
      const row = document.createElement('tr');
      row.innerHTML = '<td>+</td><td><input aria-label="Tên tài sản phát sinh" placeholder="Tên tài sản phát sinh"></td><td>—</td><td><select aria-label="Tình trạng tài sản"><option>Bình thường</option><option>Hư hỏng nhẹ</option><option>Hư hỏng nặng</option><option>Mất đồ</option></select></td><td><input data-damage-cost inputmode="numeric" type="number" min="0" value="0" aria-label="Chi phí đền bù"></td><td><button type="button" class="btn secondary small-btn" data-remove-row>Xóa dòng</button></td>';
      byId('asset-rows')?.append(row);
      recalc();
    });
    inspect.addEventListener('click', (event) => {
      if (event.target.matches('[data-remove-row]')) {
        event.target.closest('tr')?.remove();
        recalc();
      }
    });
    inspect.addEventListener('submit', (event) => {
      event.preventDefault();
      show(byId('inspection-saved'), event.submitter?.value === 'draft' ? 'Đã lưu tạm nháp minh họa.' : 'Dự thảo nghiệm thu đã sẵn sàng trình quản lý phê duyệt.');
    });
    recalc();
  }

  byId('evidence-files')?.addEventListener('change', (event) => {
    const names = [...event.target.files].map((file) => file.name);
    show(byId('evidence-list'), names.length ? `Tệp minh họa đã chọn: ${names.join(', ')}` : 'Chưa chọn tệp.');
  });
  byId('complaint-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const chosen = event.currentTarget.querySelectorAll('[name="complaint-item"]:checked').length;
    if (!chosen) {
      show(byId('complaint-result'), 'Hãy chọn ít nhất một hạng mục cần quản lý xem xét.');
      byId('complaint-result')?.classList.remove('hidden');
      return;
    }
    if (!event.currentTarget.reportValidity()) return;
    byId('complaint-result')?.classList.remove('hidden');
    show(byId('complaint-result'), 'Khiếu nại đã ghi nhận trong bản demo · DISPUTED. Quản lý sẽ thẩm định nội dung và bằng chứng.');
  });

  byId('resident-sign-name')?.addEventListener('input', (event) => {
    const signature = byId('typed-signature');
    if (signature) signature.textContent = event.target.value || 'Khu vực chữ ký';
  });
  byId('checkout-sign-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    show(byId('signature-result'), adjustment === 'negative'
      ? 'Đã ghi nhận chữ ký mẫu. Hồ sơ chuyển sang PAYMENT_PENDING; cư dân cần thanh toán qua SePay trước khi bàn giao chìa khóa. Đây không phải chữ ký điện tử có giá trị pháp lý.'
      : 'Đã ghi nhận chữ ký mẫu. Cư dân tiến hành bàn giao chìa khóa & thẻ từ cho nhân viên để hoàn tất thu hồi mặt bằng.');
  });

  const paymentForm = byId('sepay-demo-form');
  paymentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = byId('payment-result');
    show(result, 'Mô phỏng: webhook SePay xác nhận khoản 2.450.000 ₫. Không có giao dịch thật. ');
    const next = document.createElement('a');
    next.className = 'btn secondary section-gap';
    next.href = 'payment-recorded.html';
    next.textContent = 'Mở xác nhận giao dịch →';
    result?.append(next);
  });
  const countdown = byId('payment-countdown');
  if (countdown) {
    let seconds = 15 * 60;
    const render = () => { countdown.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
    render();
    window.setInterval(() => { if (seconds > 0) seconds -= 1; render(); }, 1000);
  }

  const keys = byId('key-return-form');
  if (keys) {
    const recalcKeys = () => {
      const missing = [...keys.querySelectorAll('[data-key-item]:not(:checked)')].length;
      if (byId('key-fee')) byId('key-fee').textContent = money(missing * 100000);
      if (byId('key-status')) byId('key-status').textContent = missing ? `Thiếu ${missing} thẻ/thiết bị · cần ghi nhận phí thay thế` : 'Đã kiểm đủ chìa khóa, thẻ và thiết bị';
    };
    keys.addEventListener('change', recalcKeys);
    keys.addEventListener('submit', (event) => {
      event.preventDefault();
      const missing = [...keys.querySelectorAll('[data-key-item]:not(:checked)')].length;
      const caseName = new URLSearchParams(window.location.search).get('case');
      const isNegative = caseName === 'negative';
      show(byId('key-result'), missing
        ? `Đã ghi nhận biên nhận mẫu. Phụ thu thay thế ${missing} mục: ${money(missing * 100000)}. Hệ thống đã khóa quyền phòng. ${isNegative ? 'Đóng hồ sơ.' : 'Chuyển sang bước giải ngân hoàn cọc.'}`
        : `Đã thu hồi đủ chìa khóa, thẻ từ và thiết bị. Hệ thống đã khóa quyền truy cập căn hộ. ${isNegative ? 'Đóng hồ sơ.' : 'Chuyển sang bước giải ngân hoàn cọc.'}`);
      const completion = document.createElement('a');
      completion.className = 'btn secondary section-gap';
      completion.href = isNegative
        ? '../resident/checkout-complete-additional.html'
        : `../resident/deposit-refund.html?case=${caseName || 'original'}`;
      completion.textContent = isNegative ? 'Mở trạng thái hoàn tất →' : 'Tiếp tục quy trình hoàn tiền cọc →';
      byId('key-result')?.append(completion);
    });
    recalcKeys();
  }

  // Reuse the original StayHub role switcher and application header on every
  // checkout screen while leaving the workflow-specific forms and routes intact.
  const sidebar = document.querySelector('.sidebar');
  const workspace = document.querySelector('.workspace');
  if (sidebar && workspace) {
    const checkoutRoot = new URL('../', document.currentScript.src);
    const routeMatch = window.location.pathname.match(/\/checkout\/(resident|staff|manager|system)\//);
    const actor = routeMatch?.[1] || document.body.dataset.checkoutRole || 'resident';
    const actorNames = {
      resident: 'Nguyễn Văn An',
      staff: 'Trần Kỹ Thuật',
      manager: 'Trần Minh Đức',
      system: 'Hệ thống StayHub'
    };
    const roleOptions = [
      {key: 'ADMIN', label: 'Admin (Nam)', target: 'manager/manager-dashboard.html'},
      {key: 'MANAGER', label: 'Quản lý (Đức)', target: 'manager/manager-dashboard.html'},
      {key: 'STAFF', label: 'Kỹ thuật (Tuấn Anh)', target: 'staff/staff-dashboard.html'},
      {key: 'RESIDENT', label: 'Cư dân P201 (An)', target: 'resident/resident-dashboard.html'}
    ];
    const roleBar = document.createElement('section');
    roleBar.className = 'checkout-demo-bar no-print';
    roleBar.setAttribute('aria-label', 'Điều khiển vai trò thử nghiệm');
    roleBar.innerHTML = `
      <div class="checkout-demo-meta">
        <span class="checkout-demo-current">Đang xem với vai trò: <strong>${actorNames[actor] || actorNames.resident}</strong> (${actor.toUpperCase()})</span>
      </div>
      <div class="checkout-demo-controls">
        <span class="checkout-demo-hint">Chuyển vai trò thử nghiệm:</span>
        <div class="checkout-demo-roles" role="group" aria-label="Chọn vai trò">
          ${roleOptions.map((role) => `<button type="button" data-target="${role.target}" class="${(actor === 'resident' && role.key === 'RESIDENT') || (actor === 'staff' && role.key === 'STAFF') || (actor === 'manager' && role.key === 'MANAGER') ? 'active' : ''}" aria-pressed="${(actor === 'resident' && role.key === 'RESIDENT') || (actor === 'staff' && role.key === 'STAFF') || (actor === 'manager' && role.key === 'MANAGER')}">${role.label}</button>`).join('')}
        </div>
        <button class="checkout-demo-action" type="button" data-reset>↺ <span>Đặt lại Demo</span></button>
        <a class="checkout-demo-action login" href="${new URL('../login.html', checkoutRoot).href}">↪ <span>Đăng nhập</span></a>
      </div>`;
    const skip = document.querySelector('.skip');
    if (skip) skip.insertAdjacentElement('afterend', roleBar);
    else document.body.prepend(roleBar);

    roleBar.querySelectorAll('[data-target]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = new URL(button.dataset.target, checkoutRoot).href;
      });
    });
    roleBar.querySelector('[data-reset]')?.addEventListener('click', () => window.location.reload());

    const topbar = workspace.querySelector('.topbar');
    const crumb = topbar?.querySelector('.crumb');
    if (topbar && crumb) {
      const heading = document.createElement('div');
      heading.className = 'shell-page-title';
      const title = document.createElement('h1');
      title.textContent = 'Check-out & bàn giao căn hộ';
      heading.append(title, crumb);
      topbar.insertBefore(heading, topbar.firstChild);
    }

    const wordmark = sidebar.querySelector('.wordmark');
    if (wordmark) {
      wordmark.href = new URL('../index.html', checkoutRoot).href;
      wordmark.setAttribute('aria-label', 'StayHub · Quản lý căn hộ');
      const mark = wordmark.querySelector('.logo-mark');
      const brand = wordmark.querySelector('span > span, span:not(.logo-mark)');
      if (mark) mark.textContent = 'S';
      if (brand) {
        brand.childNodes[0].textContent = 'StayHub';
        const small = brand.querySelector('small');
        if (small) small.textContent = 'LIVING MANAGEMENT';
      }
    }
    const caption = sidebar.querySelector('.nav-caption');
    if (caption) {
      const labels = {resident: 'DÀNH CHO CƯ DÂN', staff: 'QUẢN LÝ VẬN HÀNH', manager: 'QUẢN LÝ VẬN HÀNH', system: 'HỆ THỐNG'};
      caption.textContent = labels[actor] || labels.resident;
    }
  }
})();
