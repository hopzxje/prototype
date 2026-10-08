function renderRoleDashboard() {
  const container = document.getElementById('role-dashboard');
  if (!container) return;

  const views = {
    ADMIN: renderAdminDashboard,
    STAFF: renderStaffDashboard,
    RESIDENT: renderResidentDashboard
  };

  const role = DataStore.getRole();
  container.innerHTML = views[role] ? views[role]() : '';
  lucide.createIcons();
}

function roleDashboardTopline(eyebrow, title, subtitle, action) {
  return `
    <div class="role-dashboard-topline">
      <div>
        <span class="role-dashboard-eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      ${action || ''}
    </div>
  `;
}

function roleDashboardMetric(label, value, detail, icon, tone = 'default') {
  return `
    <article class="role-dashboard-metric role-dashboard-metric-${tone}">
      <div class="role-dashboard-metric-head">
        <span>${label}</span>
        <i data-lucide="${icon}" class="role-dashboard-metric-icon"></i>
      </div>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function renderAdminDashboard() {
  return `
    ${roleDashboardTopline(
      'Admin / System control',
      'Tổng quan hệ thống',
      'Nắm nhanh sức khỏe toàn chuỗi, người dùng và các cảnh báo quan trọng.',
      `<a href="${appPath('users.html')}" class="role-dashboard-outline-action"><i data-lucide="users" class="w-4 h-4"></i> Quản lý tài khoản</a>`
    )}

    <section class="role-dashboard-command role-dashboard-command-admin">
      <div class="role-dashboard-command-head"><div><span>System overview</span><h2>Toàn chuỗi đang vận hành ổn định</h2></div><b class="role-dashboard-live"><i></i> Live data</b></div>
      <div class="role-dashboard-metric-grid">
        ${roleDashboardMetric('Người dùng hoạt động', '24', '4 nhóm quyền đang sử dụng', 'users', 'primary')}
        ${roleDashboardMetric('Doanh thu toàn chuỗi', '428,6 triệu', '+12,8% so với tháng trước', 'wallet')}
        ${roleDashboardMetric('Cơ sở đang vận hành', '3', '36 phòng trong hệ thống', 'building-2')}
        ${roleDashboardMetric('Cảnh báo cần xem', '7', '2 cảnh báo mức cao', 'shield-alert', 'warning')}
      </div>
    </section>

    <div class="role-dashboard-admin-grid">
      <section class="role-dashboard-card role-dashboard-activity-card">
        <div class="role-dashboard-card-head"><div><span>Activity</span><h2>Hoạt động hệ thống</h2></div><a href="${appPath('audit-logs.html')}" class="role-dashboard-card-link">Xem nhật ký <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a></div>
        <div class="role-dashboard-activity-list">
          <div class="role-dashboard-activity-item"><i data-lucide="check-circle-2" class="role-dashboard-activity-icon role-dashboard-activity-icon-green"></i><div><strong>Đã đối soát 18 giao dịch SePay</strong><span>Hôm nay, 09:42 · Tác vụ tự động</span></div></div>
          <div class="role-dashboard-activity-item"><i data-lucide="user-round-cog" class="role-dashboard-activity-icon role-dashboard-activity-icon-blue"></i><div><strong>Cập nhật quyền cho tài khoản quản lý</strong><span>Hôm nay, 08:16 · Nguyễn Hoàng Nam</span></div></div>
          <div class="role-dashboard-activity-item"><i data-lucide="triangle-alert" class="role-dashboard-activity-icon role-dashboard-activity-icon-amber"></i><div><strong>Phát hiện 2 hóa đơn quá hạn</strong><span>Hôm qua, 17:30 · Hệ thống cảnh báo</span></div></div>
        </div>
      </section>

      <section class="role-dashboard-card">
        <div class="role-dashboard-card-head"><div><span>Properties</span><h2>Tình trạng cơ sở</h2></div><a href="${appPath('buildings.html')}" class="role-dashboard-icon-action" aria-label="Mở danh sách cơ sở"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></a></div>
        <div class="role-dashboard-property-list">
          <div><span><i class="role-dashboard-status-dot is-green"></i>StayHub Central</span><b>Ổn định</b></div>
          <div><span><i class="role-dashboard-status-dot is-green"></i>StayHub Riverside</span><b>Ổn định</b></div>
          <div><span><i class="role-dashboard-status-dot is-amber"></i>StayHub Eco</span><b>Cần theo dõi</b></div>
        </div>
        <div class="role-dashboard-card-actions"><a href="${appPath('system-settings.html')}">Cấu hình hệ thống</a><a href="${appPath('audit-logs.html')}">Nhật ký hệ thống</a></div>
      </section>
    </div>
  `;
}

function renderStaffDashboard() {
  return `
    ${roleDashboardTopline(
      'Staff / Shift control',
      'Công việc trong ca',
      'Tập trung vào các yêu cầu đang chờ xử lý và lịch vận hành hôm nay.',
      `<a href="${appPath('maintenance.html')}" class="role-dashboard-outline-action"><i data-lucide="list-checks" class="w-4 h-4"></i> Mở bảng công việc</a>`
    )}

    <section class="role-dashboard-command role-dashboard-command-staff">
      <div class="role-dashboard-command-head"><div><span>Today at StayHub</span><h2>Ca vận hành đang diễn ra</h2></div><b class="role-dashboard-live"><i></i> Đang trong ca</b></div>
      <div class="role-dashboard-metric-grid">
        ${roleDashboardMetric('Đang xử lý', '6', '3 việc được giao cho bạn', 'wrench', 'primary')}
        ${roleDashboardMetric('Mức khẩn cấp', '1', 'Điều hòa phòng P202', 'triangle-alert', 'danger')}
        ${roleDashboardMetric('Chờ ghi chỉ số', '12', 'Trong 3 cơ sở', 'zap')}
        ${roleDashboardMetric('Khách chờ duyệt', '3', 'Có lịch trong hôm nay', 'user-check')}
      </div>
    </section>

    <div class="role-dashboard-staff-grid">
      <section class="role-dashboard-card role-dashboard-task-card">
        <div class="role-dashboard-card-head"><div><span>Priority queue</span><h2>Việc cần xử lý</h2></div><b class="role-dashboard-count-badge">6 việc</b></div>
        <div class="role-dashboard-task-list">
          <div class="role-dashboard-task-item"><i data-lucide="wrench" class="role-dashboard-task-icon is-danger"></i><div><strong>Sửa điều hòa Daikin P202</strong><span>Kiểm tra áp suất gas · Trước 11:00</span><a href="${appPath('maintenance.html')}">Cập nhật trạng thái <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></a></div><b class="role-dashboard-task-badge is-danger">Khẩn cấp</b></div>
          <div class="role-dashboard-task-item"><i data-lucide="droplets" class="role-dashboard-task-icon is-amber"></i><div><strong>Vòi sen rỉ nước P201</strong><span>Cư dân đã gửi yêu cầu lúc 07:15</span><a href="${appPath('maintenance.html')}">Tiếp nhận yêu cầu <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></a></div><b class="role-dashboard-task-badge is-amber">Chờ nhận</b></div>
          <div class="role-dashboard-task-item"><i data-lucide="zap" class="role-dashboard-task-icon is-blue"></i><div><strong>Ghi chỉ số điện nước tháng 10</strong><span>Còn 12 phòng tại StayHub Central</span><a href="${appPath('utilities.html')}">Mở danh sách phòng <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></a></div><b class="role-dashboard-task-badge is-blue">Đang làm</b></div>
        </div>
      </section>

      <section class="role-dashboard-card role-dashboard-shift-card">
        <div class="role-dashboard-card-head"><div><span>Schedule</span><h2>Lịch trong ca</h2></div><a href="${appPath('visitors.html')}" class="role-dashboard-icon-action" aria-label="Mở lịch khách"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></a></div>
        <div class="role-dashboard-schedule-list">
          <div><time>09:30</time><span><strong>Kiểm tra P202</strong><small>StayHub Central</small></span></div>
          <div><time>14:00</time><span><strong>Bàn giao phòng P104</strong><small>StayHub Riverside</small></span></div>
          <div><time>18:00</time><span><strong>Kiểm tra khách thăm</strong><small>Cổng chính</small></span></div>
        </div>
        <a href="${appPath('visitors.html')}" class="role-dashboard-wide-action">Xem khách đến thăm <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
      </section>
    </div>
  `;
}

function escapeDashboardValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function residentDate(value, includeTime = false) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return escapeDashboardValue(value);
  return date.toLocaleDateString('vi-VN', includeTime
    ? { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function compactResidentAmount(value) {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  if (amount >= 1000) return `${Math.round(amount / 1000).toLocaleString('vi-VN')}k`;
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function residentRequestStatus(status) {
  return {
    PENDING: 'Chờ tiếp nhận',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã hoàn tất'
  }[status] || 'Đang cập nhật';
}

function renderResidentDashboard() {
  const user = DataStore.getUser();
  const handover = DataStore.getHandover();
  if (handover.status !== 'COMPLETED') {
    return `
      ${roleDashboardTopline(
        'CƯ DÂN · STAYHUB',
        `Xin chào, ${escapeDashboardValue(user.fullName)}`,
        'Hoàn tất lịch nhận căn hộ để bắt đầu sử dụng các tiện ích dành cho cư dân.',
        `<a href="${appPath('profile.html')}" class="role-dashboard-outline-action"><i data-lucide="home" class="w-4 h-4"></i> Căn hộ của tôi</a>`
      )}
      <section class="resident-first-checkin-card">
        <div class="resident-first-checkin-icon"><i data-lucide="key-round" class="w-7 h-7"></i></div>
        <div><span>CHÀO MỪNG ĐẾN STAYHUB</span><h2>Căn hộ đang chờ bàn giao</h2><p>Đặt lịch check-in để đội ngũ chuẩn bị căn hộ, kiểm tra tài sản và cùng bạn hoàn tất biên bản nhận bàn giao.</p></div>
        <a href="${appPath('profile.html')}" class="role-dashboard-outline-action"><i data-lucide="calendar-plus-2" class="w-4 h-4"></i> Đặt lịch nhận căn hộ</a>
      </section>
    `;
  }
  const roomNumber = user.room || 'Chưa gán phòng';
  const rooms = DataStore.getRooms();
  const buildings = DataStore.getBuildings();
  const room = rooms.find(item => item.roomNumber === roomNumber && (!user.building || item.tenant === user.fullName));
  const building = buildings.find(item => item.name === user.building) || buildings.find(item => item.id === room?.buildingId);
  const contracts = DataStore.getContracts().filter(item => item.room === roomNumber && (!item.tenant || item.tenant === user.fullName));
  const contract = contracts.find(item => item.status === 'ACTIVE') || contracts[0];
  const invoices = DataStore.getInvoices()
    .filter(item => item.room === roomNumber)
    .sort((left, right) => String(right.month || right.id).localeCompare(String(left.month || left.id)));
  const latestInvoice = invoices[0];
  const unpaidTotal = invoices.filter(item => item.status === 'UNPAID').reduce((sum, item) => sum + Number(item.total || 0), 0);
  const requests = DataStore.getMaintenance()
    .filter(item => item.room === roomNumber)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  const openRequests = requests.filter(item => item.status !== 'RESOLVED');
  const latestRequest = openRequests[0] || requests[0];
  const isContractActive = contract?.status === 'ACTIVE';
  const apartmentName = `${user.building || building?.name || 'Căn hộ của bạn'} · ${roomNumber}`;
  const apartmentAddress = building?.address || 'Thông tin địa chỉ chưa cập nhật';
  const invoiceStatus = latestInvoice?.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán';
  const invoiceDetail = latestInvoice ? `${latestInvoice.month} · ${invoiceStatus}` : 'Chưa có hóa đơn mới';
  const requestTitle = latestRequest?.title || 'Chưa có yêu cầu gần đây';
  const requestMeta = latestRequest ? `${latestRequest.code} · ${residentDate(latestRequest.createdAt, true)}` : 'Bạn chưa gửi yêu cầu nào';
  const requestStatus = latestRequest ? residentRequestStatus(latestRequest.status) : 'Trống';

  return `
    <section class="role-dashboard-resident-command">
      <div class="role-dashboard-resident-command-content">
        <section class="role-dashboard-resident-hero">
          <div><span>THÔNG TIN CĂN HỘ</span><h2>Xin chào, ${escapeDashboardValue(user.fullName)} · ${escapeDashboardValue(roomNumber)}</h2><p>${escapeDashboardValue(apartmentName)} · ${escapeDashboardValue(apartmentAddress)}</p></div>
          <div class="role-dashboard-resident-status ${isContractActive ? 'is-active' : 'is-muted'}"><i data-lucide="${isContractActive ? 'circle-check' : 'circle-alert'}" class="w-4 h-4"></i> ${isContractActive ? 'Đang thuê' : 'Chưa có hợp đồng'}</div>
        </section>

        <div class="role-dashboard-resident-metrics">
          ${roleDashboardMetric('Trạng thái căn hộ', isContractActive ? 'Đang thuê' : 'Chưa có HĐ', contract ? `Kết thúc ${residentDate(contract.endDate)}` : 'Cần bổ sung hợp đồng', 'home', 'primary')}
          ${roleDashboardMetric('Dư nợ hiện tại', unpaidTotal ? formatVND(unpaidTotal) : 'Không có', invoiceDetail, 'wallet-cards', unpaidTotal ? 'warning' : 'default')}
          ${roleDashboardMetric('Yêu cầu đang xử lý', `${openRequests.length}`, openRequests.length ? 'Cần theo dõi trong mục Yêu cầu' : 'Không có yêu cầu mở', 'clipboard-list', openRequests.length ? 'warning' : 'default')}
        </div>
      </div>
    </section>

    <div class="role-dashboard-resident-grid">
      <section class="role-dashboard-card role-dashboard-invoice-card">
        <div class="role-dashboard-card-head"><div><span>Thanh toán gần đây</span><h2>Hóa đơn gần nhất</h2></div><a href="${appPath('resident-invoices.html')}" class="role-dashboard-card-link">Xem hóa đơn <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a></div>
        <div class="role-dashboard-invoice-total"><div><small>${latestInvoice ? `Kỳ thu ${escapeDashboardValue(latestInvoice.month)}` : 'Chưa có kỳ thu'}</small><strong>${latestInvoice ? formatVND(latestInvoice.total) : 'Chưa có dữ liệu'}</strong></div><b class="role-dashboard-paid-badge ${latestInvoice?.status === 'PAID' ? 'is-paid' : 'is-unpaid'}"><i data-lucide="${latestInvoice?.status === 'PAID' ? 'check' : 'clock-3'}" class="w-3 h-3"></i> ${invoiceStatus}</b></div>
        <div class="role-dashboard-invoice-breakdown"><div><strong>${latestInvoice ? compactResidentAmount(latestInvoice.rent) : '—'}</strong><span>Tiền phòng</span></div><div><strong>${latestInvoice ? compactResidentAmount(Number(latestInvoice.elecTotal || 0) + Number(latestInvoice.waterTotal || 0)) : '—'}</strong><span>Điện nước</span></div><div><strong>${latestInvoice ? compactResidentAmount(latestInvoice.serviceFee) : '—'}</strong><span>Dịch vụ</span></div></div>
      </section>

      <section class="role-dashboard-card role-dashboard-request-card">
        <div class="role-dashboard-card-head"><div><span>Yêu cầu của tôi</span><h2>Yêu cầu gần đây</h2></div><span class="role-dashboard-count-badge">${openRequests.length} đang mở</span></div>
        <div class="role-dashboard-request-preview"><i data-lucide="${latestRequest ? 'wrench' : 'inbox'}" class="role-dashboard-request-icon"></i><div><strong>${escapeDashboardValue(requestTitle)}</strong><span>${escapeDashboardValue(requestMeta)}</span></div><b class="${latestRequest?.status === 'RESOLVED' ? 'is-resolved' : ''}">${requestStatus}</b></div>
        <a href="${appPath('requests.html')}" class="role-dashboard-wide-action">Mở yêu cầu của tôi <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
      </section>
    </div>

  `;
}
