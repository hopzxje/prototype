const PAGE_PATHS = {
  'index.html': 'index.html',
  'login.html': 'pages/auth/login.html',
  'buildings.html': 'pages/property/buildings.html',
  'assets.html': 'pages/property/assets.html',
  'residents.html': 'pages/residents/residents.html',
  'profile.html': 'pages/residents/profile.html',
  'handover.html': 'pages/handover/handover.html',
  'account.html': 'pages/residents/account.html',
  'visitors.html': 'pages/residents/visitors.html',
  'requests.html': 'pages/residents/requests.html',
  'maintenance.html': 'pages/operations/maintenance.html',
  'utilities.html': 'pages/operations/utilities.html',
  'contracts.html': 'pages/finance/contracts.html',
  'invoices.html': 'pages/finance/invoices.html',
  'resident-invoices.html': 'pages/residents/invoices.html',
  'resident-contract.html': 'pages/residents/contract.html',
  'sepay.html': 'pages/finance/sepay.html',
  'notifications.html': 'pages/communication/notifications.html',
  'resident-visitors.html': 'pages/residents/visitor-registration.html',
  'reports.html': 'pages/reports/reports.html',
  'users.html': 'pages/administration/users.html',
  'system-settings.html': 'pages/administration/system-settings.html',
  'audit-logs.html': 'pages/administration/audit-logs.html'
};

const ROLE_PAGE_ACCESS = {
  ADMIN: new Set(['index.html', 'users.html', 'audit-logs.html', 'system-settings.html', 'sepay.html', 'reports.html', 'login.html']),
  MANAGER: new Set(['index.html', 'buildings.html', 'contracts.html', 'invoices.html', 'utilities.html', 'residents.html', 'maintenance.html', 'visitors.html', 'assets.html', 'sepay.html', 'notifications.html', 'reports.html', 'handover.html', 'login.html']),
  STAFF: new Set(['index.html', 'buildings.html', 'utilities.html', 'maintenance.html', 'visitors.html', 'assets.html', 'handover.html', 'login.html']),
  RESIDENT: new Set(['index.html', 'resident-invoices.html', 'resident-contract.html', 'requests.html', 'resident-visitors.html', 'profile.html', 'account.html', 'handover.html', 'login.html'])
};

const APP_ROOT = window.location.pathname.includes('/pages/') ? '../../' : './';

function appPath(page) {
  const route = PAGE_PATHS[page] || page;
  return `${APP_ROOT}${route}`;
}

function currentPageKey() {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/pages/residents/invoices.html')) return 'resident-invoices.html';
  if (path.endsWith('/pages/residents/contract.html')) return 'resident-contract.html';
  if (path.endsWith('/pages/residents/visitor-registration.html')) return 'resident-visitors.html';
  return path.split('/').pop() || 'index.html';
}

function enforceRolePageAccess() {
  const role = DataStore.getRole();
  const allowedPages = ROLE_PAGE_ACCESS[role] || ROLE_PAGE_ACCESS.MANAGER;
  const page = currentPageKey();
  if (!allowedPages.has(page)) {
    window.location.replace(appPath('index.html'));
  }
}

function formatVND(amount) {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
function renderDemoRoleBar() {
  const currentRole = DataStore.getRole();
  const currentUser = DataStore.getUser();

  const roleBar = document.getElementById('demo-role-bar');
  if (!roleBar) return;

  const roles = [
    { key: 'ADMIN', label: 'Admin (Nam)', icon: 'shield' },
    { key: 'MANAGER', label: 'Quản lý (Đức)', icon: 'user-check' },
    { key: 'STAFF', label: 'Kỹ thuật (Tuấn Anh)', icon: 'wrench' },
    { key: 'RESIDENT', label: 'Cư dân P201 (An)', icon: 'home' }
  ];

  roleBar.innerHTML = `
    <div class="no-print bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div class="flex items-center gap-2">
        <span class="text-slate-300 hidden sm:inline">
          Đang xem với vai trò: <strong class="text-white">${currentUser.fullName}</strong> (${currentRole})
        </span>
      </div>

      <div class="flex items-center flex-wrap gap-2">
        <span class="text-slate-400 mr-1 hidden md:inline text-[11px]">Chuyển vai trò thử nghiệm:</span>
        <div class="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          ${roles.map(r => `
            <button onclick="switchRole('${r.key}')" 
              class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${currentRole === r.key ? 'bg-teal-700 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}">
              <i data-lucide="${r.icon}" class="w-3.5 h-3.5"></i>
              <span>${r.label}</span>
            </button>
          `).join('')}
        </div>

        <button onclick="resetDemoData()" title="Khôi phục toàn bộ dữ liệu mẫu" 
          class="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-400"></i>
          <span class="hidden sm:inline">Đặt lại Demo</span>
        </button>

        <a href="${appPath('login.html')}" class="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors">
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Đăng nhập</span>
        </a>
      </div>
    </div>
  `;
}

function switchRole(role) {
  DataStore.setRole(role);
  showToast(`Đã chuyển sang vai trò: ${role}`);
  const destination = role === 'RESIDENT' ? 'profile.html' : 'index.html';
  setTimeout(() => window.location.href = appPath(destination), 300);
}

function resetDemoData() {
  if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu demo về trạng thái ban đầu?')) {
    DataStore.resetAll();
    showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
    setTimeout(() => window.location.reload(), 400);
  }
}
function renderSidebar(activePage = 'index.html') {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  restoreSidebarPreference();

  const role = DataStore.getRole();
  const user = DataStore.getUser();

  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { href: 'index.html', icon: 'layout-dashboard', label: 'Tổng quan Hệ thống' },
      { href: 'users.html', icon: 'users', label: 'Quản trị Tài khoản' },
      { href: 'audit-logs.html', icon: 'scroll-text', label: 'Giám sát & Nhật ký' },
      { href: 'system-settings.html', icon: 'sliders', label: 'Cấu hình Hệ thống' },
      { href: 'sepay.html', icon: 'qr-code', label: 'Cổng SePay Đối soát' },
      { href: 'reports.html', icon: 'bar-chart-3', label: 'Báo cáo Toàn chuỗi' }
    ];
  } else if (role === 'RESIDENT') {
    navItems = [
      { href: 'index.html', icon: 'layout-dashboard', label: 'Tổng quan' },
      { href: 'profile.html', icon: 'home', label: 'Căn hộ của tôi' },
      { href: 'resident-invoices.html', icon: 'receipt', label: 'Hóa đơn & Tiền phòng' },
      { href: 'resident-contract.html', icon: 'file-signature', label: 'Hợp đồng thuê' },
      { href: 'requests.html', icon: 'clipboard-list', label: 'Yêu cầu của tôi' },
      { href: 'resident-visitors.html', icon: 'user-check', label: 'Đăng ký Khách thăm' },
      { href: 'account.html', icon: 'settings-2', label: 'Tài khoản của tôi' }
    ];
  } else if (role === 'STAFF') {
    navItems = [
      { href: 'index.html', icon: 'layout-dashboard', label: 'Công việc hôm nay' },
      { href: 'buildings.html', icon: 'building-2', label: 'Cơ sở & Sơ đồ phòng' },
      { href: 'utilities.html', icon: 'zap', label: 'Chỉ số Điện Nước' },
      { href: 'maintenance.html', icon: 'wrench', label: 'Xử lý Sửa chữa' },
      { href: 'visitors.html', icon: 'user-check', label: 'Khách đến thăm' },
      { href: 'assets.html', icon: 'boxes', label: 'Tài sản thiết bị' },
      { href: 'handover.html', icon: 'key-round', label: 'Bàn giao căn hộ' }
    ];
  } else {
    navItems = [
      { href: 'index.html', icon: 'layout-dashboard', label: 'Tổng quan Vận hành' },
      { href: 'buildings.html', icon: 'building-2', label: 'Cơ sở & Sơ đồ phòng' },
      { href: 'contracts.html', icon: 'file-text', label: 'Hợp đồng thuê' },
      { href: 'invoices.html', icon: 'receipt', label: 'Hóa đơn & Thu phí' },
      { href: 'utilities.html', icon: 'zap', label: 'Chỉ số Điện Nước' },
      { href: 'residents.html', icon: 'users', label: 'Cư dân & Lưu trú' },
      { href: 'maintenance.html', icon: 'wrench', label: 'Quản lý Sửa chữa' },
      { href: 'visitors.html', icon: 'user-check', label: 'Khách đến thăm' },
      { href: 'assets.html', icon: 'boxes', label: 'Tài sản thiết bị' },
      { href: 'sepay.html', icon: 'qr-code', label: 'Thanh toán VietQR' },
      { href: 'notifications.html', icon: 'bell', label: 'Thông báo & Zalo' },
      { href: 'reports.html', icon: 'bar-chart-3', label: 'Báo cáo & Thống kê' },
      { href: 'handover.html', icon: 'key-round', label: 'Bàn giao căn hộ' }
    ];
  }

  sidebar.innerHTML = `
    <!-- Brand -->
    <div class="sidebar-brand-row h-16 flex items-center justify-between px-4 border-b border-slate-200">
      <a href="${appPath('index.html')}" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#166534] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          S
        </div>
        <div class="sidebar-brand-copy">
          <span class="font-bold text-base text-slate-900 tracking-tight">StayHub</span>
          <span class="text-[10px] block text-slate-500 font-medium -mt-0.5">Living Management</span>
        </div>
      </a>
      <button id="sidebar-toggle" type="button" class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Thu gọn menu" aria-expanded="true" title="Thu gọn menu">
        <i data-lucide="panel-left-close" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Navigation Links -->
    <div id="sidebar-nav" class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <div class="sidebar-section-label px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        ${role === 'RESIDENT' ? 'Dành Cho Cư Dân' : role === 'ADMIN' ? 'Hệ Thống Quản Trị' : 'Quản Lý Vận Hành'}
      </div>
      ${navItems.map(item => {
        const isActive = activePage === item.href;
        return `
          <a href="${appPath(item.href)}" title="${item.label}" class="sidebar-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-teal-50 text-[#166534] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
            <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-[#166534]' : 'text-slate-500'}"></i>
            <span class="sidebar-nav-label">${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>

    <!-- User Profile Footer -->
    <div class="sidebar-user-footer p-4 border-t border-slate-200 bg-slate-50/50">
      <div class="sidebar-user-card flex items-center gap-3">
        <img src="${user.avatar}" class="w-9 h-9 rounded-full object-cover border border-slate-200" alt="Avatar">
        <div class="sidebar-user-meta flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 truncate">${user.fullName}</p>
          <p class="text-xs text-slate-500 truncate">${user.title || user.email}</p>
        </div>
        <a href="${appPath('login.html')}" title="Đăng xuất" aria-label="Đăng xuất" class="sidebar-logout text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition-colors">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  `;
  syncSidebarToggleButton();
  lucide.createIcons();
  const nav = sidebar.querySelector('#sidebar-nav');
  const scrollKey = `stayhub_sidebar_scroll_${role}`;
  try {
    const savedScrollTop = Number(sessionStorage.getItem(scrollKey));
    if (Number.isFinite(savedScrollTop)) nav.scrollTop = savedScrollTop;

    const saveScroll = () => sessionStorage.setItem(scrollKey, String(nav.scrollTop));
    nav.addEventListener('scroll', saveScroll, { passive: true });
    nav.addEventListener('click', saveScroll);
  } catch (error) {
  }
}

function syncSidebarToggleButton() {
  const button = document.getElementById('sidebar-toggle');
  if (!button) return;
  const collapsed = document.body.classList.contains('sidebar-collapsed');
  const label = collapsed ? 'Mở rộng menu' : 'Thu gọn menu';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-expanded', String(!collapsed));
  button.title = label;
  button.innerHTML = `<i data-lucide="${collapsed ? 'panel-left-open' : 'panel-left-close'}" class="w-4 h-4"></i>`;
}

function toggleSidebar() {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  try {
    localStorage.setItem('stayhub_sidebar_collapsed', String(collapsed));
  } catch (error) {
  }
  syncSidebarToggleButton();
  lucide.createIcons();
}

function restoreSidebarPreference() {
  try {
    document.body.classList.toggle('sidebar-collapsed', localStorage.getItem('stayhub_sidebar_collapsed') === 'true');
  } catch (error) {
  }
}
function compactPageContentHeader() {
  const topbar = document.getElementById('app-topbar');
  const content = topbar?.nextElementSibling;
  const header = content?.firstElementChild;
  if (!topbar || !content || !header) return;

  const classes = [...header.classList];
  const isLegacyHeader = classes.includes('flex') && classes.some(className => className.includes('sm:flex-row'));
  if (!isLegacyHeader) return;

  const actions = header.lastElementChild;
  const target = document.getElementById('topbar-page-actions');
  if (actions && target) {
    actions.querySelectorAll('button, a').forEach(action => target.appendChild(action));
  }

  header.remove();
  lucide.createIcons();
}

function renderTopbar(pageTitle = 'Tổng quan Vận hành', breadcrumb = 'Trang chủ') {
  const topbar = document.getElementById('app-topbar');
  if (!topbar) return;

  const role = DataStore.getRole();
  const buildings = DataStore.getBuildings();
  const showBuildingFilter = role !== 'RESIDENT';
  const notificationPage = role === 'RESIDENT' ? 'requests.html' : 'notifications.html';
  const notificationTitle = role === 'RESIDENT' ? 'Yêu cầu và thông báo' : 'Thông báo';
  const topbarAction = role === 'MANAGER' || role === 'RESIDENT' ? `
        <a href="${appPath(notificationPage)}" class="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title="${notificationTitle}">
          <i data-lucide="bell" class="w-5 h-5"></i>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </a>
  ` : '';

  topbar.innerHTML = `
    <div class="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 leading-tight">${pageTitle}</h1>
        <p class="text-xs text-slate-500">${breadcrumb}</p>
      </div>

      <div class="flex items-center gap-3">
        <div id="topbar-page-actions" class="flex items-center gap-2"></div>
        ${showBuildingFilter ? `<div class="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <i data-lucide="map-pin" class="w-4 h-4 text-teal-600"></i>
          <select id="building-filter" onchange="handleBuildingChange(this.value)" class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
            <option value="ALL">Tất cả 3 cơ sở (36 phòng)</option>
            ${buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
          </select>
        </div>` : ''}
        ${topbarAction}
      </div>
    </div>
  `;
  lucide.createIcons();
  compactPageContentHeader();
}

function handleBuildingChange(buildingId) {
  showToast(`Đã lọc cơ sở: ${buildingId === 'ALL' ? 'Tất cả cơ sở' : buildingId}`);
  if (typeof onFilterBuilding === 'function') {
    onFilterBuilding(buildingId);
  }
}
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    lucide.createIcons();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  enforceRolePageAccess();
  renderDemoRoleBar();
  lucide.createIcons();
});
