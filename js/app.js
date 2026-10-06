/**
 * StayHub - Shared Application Logic, Routing & Layout Component Renderers
 */

// Route mapping for multi-folder structure
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

function getAppRoot() {
  return window.location.pathname.includes('/pages/') ? '../../' : './';
}

function appPath(page) {
  const route = PAGE_PATHS[page] || page;
  return `${getAppRoot()}${route}`;
}

function currentPageKey() {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/pages/residents/invoices.html')) return 'resident-invoices.html';
  if (path.endsWith('/pages/residents/contract.html')) return 'resident-contract.html';
  if (path.endsWith('/pages/residents/visitor-registration.html')) return 'resident-visitors.html';
  return path.split('/').pop() || 'index.html';
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
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    const firstInput = modal.querySelector('input:not([readonly]), select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Render Top Demo Role Switcher Bar
function renderDemoRoleBar() {
  const currentRole = DataStore.getRole();
  const currentUser = DataStore.getUser();

  const roleBar = document.getElementById('demo-role-bar');
  if (!roleBar) return;

  if (roleBar.dataset.renderedRole === currentRole && roleBar.firstElementChild) {
    return;
  }

  const roles = [
    { key: 'ADMIN', label: 'Admin (Nam)', icon: 'shield' },
    { key: 'MANAGER', label: 'Quản lý (Đức)', icon: 'user-check' },
    { key: 'STAFF', label: 'Kỹ thuật (Tuấn Anh)', icon: 'wrench' },
    { key: 'RESIDENT', label: 'Cư dân P201 (An)', icon: 'home' }
  ];

  roleBar.innerHTML = `
    <div class="no-print bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider text-[10px] border border-amber-500/30">
          <i data-lucide="database" class="w-3.5 h-3.5"></i>
          <span>Prototype HTML Thuần (Độc Lập 100%)</span>
        </div>
        <span class="text-slate-500 hidden sm:inline">|</span>
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
  roleBar.dataset.renderedRole = currentRole;
  if (window.lucide) lucide.createIcons();
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
  } catch (error) {}
  syncSidebarToggleButton();
  if (window.lucide) lucide.createIcons();
}

function restoreSidebarPreference() {
  try {
    document.body.classList.toggle('sidebar-collapsed', localStorage.getItem('stayhub_sidebar_collapsed') === 'true');
  } catch (error) {}
}

function updateSidebarActiveState(sidebar, activePage) {
  sidebar.querySelectorAll('[data-nav-page]').forEach(link => {
    const isActive = link.dataset.navPage === activePage;

    link.classList.toggle('bg-[#E6F4F1]', isActive);
    link.classList.toggle('text-[#0F766E]', isActive);
    link.classList.toggle('font-bold', isActive);
    link.classList.toggle('text-slate-600', !isActive);
    link.classList.toggle('hover:bg-slate-100', !isActive);
    link.classList.toggle('hover:text-slate-900', !isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
      if (!link.querySelector('.active-dot')) {
        const dot = document.createElement('span');
        dot.className = 'w-2 h-2 rounded-full bg-[#0F766E] active-dot';
        link.appendChild(dot);
      }
    } else {
      link.removeAttribute('aria-current');
      const dot = link.querySelector('.active-dot');
      if (dot) dot.remove();
    }

    const icon = link.querySelector('svg, i');
    if (icon) {
      icon.classList.toggle('text-[#0F766E]', isActive);
      icon.classList.toggle('text-slate-500', !isActive);
    }
  });
}

// Render Sidebar according to current page and role
function renderSidebar(activePage = 'index.html') {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  restoreSidebarPreference();

  const role = DataStore.getRole();
  const user = DataStore.getUser();

  if (sidebar.dataset.renderedRole === role && sidebar.dataset.activePage === activePage && sidebar.querySelector('#sidebar-nav')) {
    return;
  }

  if (sidebar.dataset.renderedRole === role && sidebar.querySelector('#sidebar-nav')) {
    updateSidebarActiveState(sidebar, activePage);
    sidebar.dataset.activePage = activePage;
    return;
  }

  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { href: 'index.html', icon: 'layout-grid', label: 'Tổng quan Hệ thống' },
      { href: 'users.html', icon: 'users', label: 'Quản trị Tài khoản' },
      { href: 'audit-logs.html', icon: 'scroll-text', label: 'Giám sát & Nhật ký' },
      { href: 'system-settings.html', icon: 'sliders-horizontal', label: 'Cấu hình Hệ thống' },
      { href: 'sepay.html', icon: 'qr-code', label: 'Cổng SePay Đối soát' },
      { href: 'reports.html', icon: 'bar-chart-3', label: 'Báo cáo Toàn chuỗi' }
    ];
  } else if (role === 'RESIDENT') {
    navItems = [
      { href: 'index.html', icon: 'home', label: 'Căn hộ P201 của tôi' },
      { href: 'profile.html', icon: 'user', label: 'Hồ sơ Cư dân' },
      { href: 'resident-invoices.html', icon: 'receipt', label: 'Hóa đơn & Tiền phòng' },
      { href: 'resident-contract.html', icon: 'file-text', label: 'Hợp đồng thuê' },
      { href: 'requests.html', icon: 'clipboard-list', label: 'Yêu cầu & Báo hỏng' },
      { href: 'resident-visitors.html', icon: 'user-check', label: 'Đăng ký Khách thăm' },
      { href: 'account.html', icon: 'settings', label: 'Tài khoản của tôi' }
    ];
  } else if (role === 'STAFF') {
    navItems = [
      { href: 'index.html', icon: 'layout-dashboard', label: 'Tổng quan Vận hành' },
      { href: 'buildings.html', icon: 'building-2', label: 'Cơ sở & Sơ đồ phòng' },
      { href: 'utilities.html', icon: 'zap', label: 'Chỉ số Điện Nước' },
      { href: 'maintenance.html', icon: 'wrench', label: 'Quản lý Sửa chữa' },
      { href: 'visitors.html', icon: 'user-check', label: 'Khách đến thăm' },
      { href: 'assets.html', icon: 'boxes', label: 'Tài sản thiết bị' },
      { href: 'handover.html', icon: 'key', label: 'Bàn giao Căn hộ' }
    ];
  } else {
    // MANAGER
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
      { href: 'handover.html', icon: 'key', label: 'Bàn giao Căn hộ' }
    ];
  }

  sidebar.innerHTML = `
    <!-- Brand -->
    <div class="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
      <a href="${appPath('index.html')}" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          S
        </div>
        <div>
          <span class="font-bold text-base text-slate-900 tracking-tight">StayHub</span>
          <span class="text-[10px] block text-slate-500 font-medium -mt-0.5">${role === 'ADMIN' ? 'Quản trị Hệ thống Chuỗi' : 'Living Management'}</span>
        </div>
      </a>
    </div>

    <!-- Navigation Links -->
    <div id="sidebar-nav" class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <div class="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        ${role === 'RESIDENT' ? 'Dành Cho Cư Dân' : role === 'ADMIN' ? 'Hệ Thống Quản Trị' : role === 'STAFF' ? 'Kỹ Thuật Vận Hành' : 'Quản Lý Vận Hành'}
      </div>
      ${navItems.map(item => {
        const isActive = activePage === item.href;
        return `
          <a href="${appPath(item.href)}" data-nav-page="${item.href}" ${isActive ? 'aria-current="page"' : ''} class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-[#E6F4F1] text-[#0F766E] font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
            <div class="flex items-center gap-3">
              <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-[#0F766E]' : 'text-slate-500'}"></i>
              <span>${item.label}</span>
            </div>
            ${isActive ? '<span class="w-2 h-2 rounded-full bg-[#0F766E]"></span>' : ''}
          </a>
        `;
      }).join('')}
    </div>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
      <div class="flex items-center gap-3">
        <img src="${user.avatar}" class="w-9 h-9 rounded-full object-cover border border-slate-200" alt="Avatar">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 truncate">${user.fullName}</p>
          <p class="text-xs text-slate-500 truncate">${user.title || user.email}</p>
        </div>
        <a href="${appPath('login.html')}" title="Đăng xuất" class="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition-colors">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  `;
  sidebar.dataset.renderedRole = role;
  sidebar.dataset.activePage = activePage;
  if (window.lucide) lucide.createIcons();

  const nav = sidebar.querySelector('#sidebar-nav');
  const scrollKey = `stayhub_sidebar_scroll_${role}`;
  try {
    const savedScrollTop = Number(sessionStorage.getItem(scrollKey));
    if (Number.isFinite(savedScrollTop)) nav.scrollTop = savedScrollTop;

    const saveScroll = () => sessionStorage.setItem(scrollKey, String(nav.scrollTop));
    nav.addEventListener('scroll', saveScroll, { passive: true });
    nav.addEventListener('click', saveScroll);
  } catch (error) {}
}

// Render Topbar
function renderTopbar(pageTitle = 'Tổng quan Vận hành', breadcrumb = 'Trang chủ') {
  const topbar = document.getElementById('app-topbar');
  if (!topbar) return;

  const role = DataStore.getRole();
  if (topbar.dataset.renderedTitle === pageTitle && topbar.dataset.renderedRole === role && topbar.firstElementChild) {
    return;
  }

  const buildings = DataStore.getBuildings();
  const currentBuildingId = DataStore.getCurrentBuilding();

  const optionsHtml = buildings.map(b => `<option value="${b.id}" ${b.id === currentBuildingId ? 'selected' : ''}>${b.name} (${b.code || 'SH'})</option>`).join('');

  const buildingSelectorHtml = role === 'ADMIN' || role === 'RESIDENT'
    ? ''
    : `
        <!-- Building selector (Dành cho Quản lý & Nhân viên) -->
        <div class="hidden sm:flex items-center gap-2">
          <i data-lucide="building-2" class="w-4 h-4 text-[#0F766E]"></i>
          <span class="text-xs font-semibold text-slate-700">Cơ sở:</span>
          <div class="relative">
            <select id="building-filter" onchange="handleBuildingChange(this.value)" class="appearance-none bg-white border border-teal-400 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer shadow-sm">
              ${optionsHtml}
            </select>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-teal-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
          </div>
        </div>
      `;

  const notifLink = role === 'RESIDENT' ? appPath('requests.html') : appPath('notifications.html');

  topbar.innerHTML = `
    <div class="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 leading-tight">${pageTitle}</h1>
        <p class="text-xs text-slate-400">${breadcrumb}</p>
      </div>

      <div class="flex items-center gap-4">
        ${buildingSelectorHtml}

        <!-- Notification bell -->
        <a href="${notifLink}" class="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title="Thông báo">
          <i data-lucide="bell" class="w-5 h-5"></i>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </a>
      </div>
    </div>
  `;
  topbar.dataset.renderedTitle = pageTitle;
  topbar.dataset.renderedRole = role;
  if (window.lucide) lucide.createIcons();
}

// Synchronous shell initialization helper for immediate first paint
function initStayHubShell(pageName, pageTitle = null, breadcrumb = null) {
  renderDemoRoleBar();
  renderSidebar(pageName);
  if (pageTitle) {
    renderTopbar(pageTitle, breadcrumb);
  }
}

function handleBuildingChange(buildingId) {
  DataStore.setCurrentBuilding(buildingId);
  if (buildingId === 'ALL') {
    showToast('Đang xem dữ liệu: Toàn bộ Chuỗi (3 cơ sở)');
  } else {
    const buildings = DataStore.getBuildings();
    const b = buildings.find(x => x.id === buildingId);
    showToast(`Đang xem cơ sở: ${b ? b.name : buildingId}`);
  }
  if (typeof onFilterBuilding === 'function') {
    onFilterBuilding(buildingId);
  }
}

// Helper to export Audit Logs to CSV with UTF-8 BOM
function exportAuditLogsCSV(filteredLogs = null) {
  const logs = filteredLogs || DataStore.getAuditLogs();
  if (!logs || logs.length === 0) {
    showToast('Không có dữ liệu nhật ký để xuất CSV', 'error');
    return;
  }
  const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Thực thể', 'Chi tiết thao tác', 'Địa chỉ IP'];
  const rows = logs.map(l => [
    `"${(l.time || '').replace(/"/g, '""')}"`,
    `"${(l.user || '').replace(/"/g, '""')}"`,
    `"${(l.role || '').replace(/"/g, '""')}"`,
    `"${(l.action || '').replace(/"/g, '""')}"`,
    `"${(l.entity || '').replace(/"/g, '""')}"`,
    `"${(l.detail || '').replace(/"/g, '""')}"`,
    `"${(l.ip || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  a.download = `stayhub_audit_logs_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Đã xuất thành công ${logs.length} bản ghi nhật ký kiểm toán sang CSV`);
}

// ===================================================================
// Client-side SPA Routing & Controller Lifecycle Engine
// ===================================================================
const stayHubPages = new Map();
const loadedExternalScripts = new Set();
const loadingExternalScripts = new Map();

function getPageName(pageOrUrl) {
  try {
    const url = new URL(pageOrUrl || window.location.href, window.location.href);
    const path = url.pathname.toLowerCase();
    if (path.endsWith('/pages/residents/invoices.html')) return 'resident-invoices.html';
    if (path.endsWith('/pages/residents/contract.html')) return 'resident-contract.html';
    if (path.endsWith('/pages/residents/visitor-registration.html')) return 'resident-visitors.html';
    return (url.pathname.split('/').pop() || 'index.html').toLowerCase();
  } catch (error) {
    return String(pageOrUrl || 'index.html').split(/[?#]/)[0].split('/').pop().toLowerCase();
  }
}

function getRouteKey(pageOrUrl) {
  const url = new URL(pageOrUrl || window.location.href, window.location.href);
  return `${url.pathname.toLowerCase()}${url.search}`;
}

function supportsClientNavigation() {
  return /^https?:$/.test(window.location.protocol)
    && typeof window.fetch === 'function'
    && typeof window.AbortController === 'function'
    && typeof window.DOMParser === 'function'
    && typeof window.history.pushState === 'function';
}

function registerPage(pageName, init, cleanup = null) {
  if (typeof init !== 'function') {
    throw new TypeError(`Trang ${pageName} cần một hàm khởi tạo hợp lệ.`);
  }
  stayHubPages.set(getPageName(pageName), { init, cleanup });
}

function runPage(pageName) {
  const normalizedPage = getPageName(pageName);
  const page = stayHubPages.get(normalizedPage);
  if (!page) {
    throw new Error(`Không tìm thấy bộ khởi tạo cho ${normalizedPage}.`);
  }
  page.init();
  if (window.lucide) lucide.createIcons();
}

function cleanupCurrentPage() {
  const page = stayHubPages.get(currentPageName);
  if (page && typeof page.cleanup === 'function') {
    page.cleanup();
  }

  if (window.Chart && typeof window.Chart.getChart === 'function') {
    document.querySelectorAll('main canvas').forEach(canvas => {
      const chart = window.Chart.getChart(canvas);
      if (chart) chart.destroy();
    });
  }
}

function loadExternalScript(src) {
  if (loadedExternalScripts.has(src)) return Promise.resolve();
  if (loadingExternalScripts.has(src)) return loadingExternalScripts.get(src);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
      loadedExternalScripts.add(src);
      loadingExternalScripts.delete(src);
      resolve();
    };
    script.onerror = () => {
      loadingExternalScripts.delete(src);
      reject(new Error(`Không thể tải tài nguyên ${src}.`));
    };
    document.head.appendChild(script);
  });

  loadingExternalScripts.set(src, promise);
  return promise;
}

async function ensurePageDependencies(nextDocument, targetUrl) {
  const needsChart = nextDocument.querySelector('script[src*="chart.js"]');
  if (needsChart && !window.Chart) {
    await loadExternalScript('https://cdn.jsdelivr.net/npm/chart.js');
  }
}

function ensurePageController(nextDocument, pageName, targetUrl) {
  if (stayHubPages.has(pageName)) return;

  const pageScript = Array.from(nextDocument.querySelectorAll('script[data-stayhub-page]'))
    .find(script => getPageName(script.dataset.stayhubPage) === pageName);

  if (!pageScript) {
    throw new Error(`Trang ${pageName} không có bộ khởi tạo.`);
  }

  const executable = document.createElement('script');
  executable.dataset.stayhubRuntimePage = pageName;
  executable.textContent = `${pageScript.textContent}\n//# sourceURL=${targetUrl.href}#${pageName}`;
  document.head.appendChild(executable);
  executable.remove();

  if (!stayHubPages.has(pageName)) {
    throw new Error(`Không thể đăng ký bộ khởi tạo cho ${pageName}.`);
  }
}

function replacePageModals(nextDocument) {
  document.querySelectorAll('body > .modal-backdrop').forEach(modal => modal.remove());
  nextDocument.querySelectorAll('body > .modal-backdrop').forEach(modal => {
    document.body.appendChild(document.importNode(modal, true));
  });
}

let currentPageName = getPageName(window.location.href);
let currentRouteKey = getRouteKey(window.location.href);
let navigationController = null;
let navigationSequence = 0;
let activeViewTransition = null;
let scrollSaveFrame = null;

function saveCurrentScrollPosition() {
  const main = document.querySelector('main');
  if (!main || !window.history.replaceState) return;

  const state = {
    ...(window.history.state || {}),
    stayHubNavigation: true,
    page: currentPageName,
    mainScrollTop: main.scrollTop
  };

  try {
    window.history.replaceState(state, '', window.location.href);
  } catch (error) {}
}

function commitPage(nextDocument, targetUrl, pageName, historyMode, restoreScrollTop) {
  const currentMain = document.querySelector('main');
  const nextMain = nextDocument.querySelector('main');
  if (!currentMain || !nextMain) {
    throw new Error('Trang đích không có vùng nội dung chính hợp lệ.');
  }

  cleanupCurrentPage();

  currentMain.replaceWith(document.importNode(nextMain, true));
  replacePageModals(nextDocument);
  document.title = nextDocument.title || document.title;

  const shellCall = nextDocument.documentElement.innerHTML.match(/initStayHubShell\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
  if (shellCall) {
    renderTopbar(shellCall[2], shellCall[3]);
  }
  renderSidebar(pageName);

  if (historyMode === 'push') {
    window.history.pushState({
      stayHubNavigation: true,
      page: pageName,
      mainScrollTop: 0
    }, '', targetUrl.href);
  }

  currentPageName = pageName;
  currentRouteKey = getRouteKey(targetUrl.href);
  runPage(pageName);

  const newMain = document.querySelector('main');
  if (newMain) {
    newMain.scrollTop = Number.isFinite(restoreScrollTop) ? restoreScrollTop : 0;
    newMain.removeAttribute('aria-busy');
  }
}

async function navigateTo(targetHref, { historyMode = 'push', restoreScrollTop = 0 } = {}) {
  const targetUrl = new URL(targetHref, window.location.href);
  const targetPageName = getPageName(targetUrl.href);
  const targetRouteKey = getRouteKey(targetUrl.href);

  if (targetRouteKey === currentRouteKey) {
    cancelPendingNavigation();
    return;
  }

  if (navigationController) navigationController.abort();
  navigationController = new AbortController();
  const navigationId = ++navigationSequence;
  const currentMain = document.querySelector('main');

  document.body.classList.add('is-app-navigating');
  if (currentMain) currentMain.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(targetUrl.href, {
      headers: { 'X-Requested-With': 'StayHub-Navigation' },
      signal: navigationController.signal
    });

    if (!response.ok) {
      throw new Error(`Không thể mở trang (${response.status}).`);
    }

    const html = await response.text();
    if (navigationId !== navigationSequence) return;

    const nextDocument = new DOMParser().parseFromString(html, 'text/html');
    if (!nextDocument.querySelector('#app-sidebar') || !nextDocument.querySelector('main')) {
      throw new Error('Trang đích không thuộc khung ứng dụng StayHub.');
    }

    await ensurePageDependencies(nextDocument, targetUrl);
    if (navigationId !== navigationSequence) return;

    ensurePageController(nextDocument, targetPageName, targetUrl);

    const commit = () => {
      commitPage(nextDocument, targetUrl, targetPageName, historyMode, restoreScrollTop);
    };

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && sidebar.querySelector('#sidebar-nav')) {
      updateSidebarActiveState(sidebar, targetPageName);
      sidebar.dataset.activePage = targetPageName;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduceMotion) {
      if (activeViewTransition) activeViewTransition.skipTransition();
      const transition = document.startViewTransition(commit);
      activeViewTransition = transition;
      transition.finished.finally(() => {
        if (activeViewTransition === transition) activeViewTransition = null;
      });
      await transition.updateCallbackDone;
    } else {
      commit();
    }
  } catch (error) {
    if (error.name === 'AbortError') return;

    console.error('StayHub navigation failed:', error);
    window.location.assign(targetUrl.href);
  } finally {
    if (navigationId === navigationSequence) {
      navigationController = null;
      document.body.classList.remove('is-app-navigating');
      const main = document.querySelector('main');
      if (main) main.removeAttribute('aria-busy');
    }
  }
}

function cancelPendingNavigation() {
  if (navigationController) {
    navigationController.abort();
    navigationController = null;
  }
  navigationSequence += 1;

  if (activeViewTransition) activeViewTransition.skipTransition();
  document.body.classList.remove('is-app-navigating');
  const main = document.querySelector('main');
  if (main) main.removeAttribute('aria-busy');
}

function isClientNavigationClick(event, anchor) {
  if (!anchor || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  const targetUrl = new URL(anchor.href, window.location.href);
  if (targetUrl.origin !== window.location.origin) return false;
  if (!targetUrl.pathname.toLowerCase().endsWith('.html')) return false;
  if (getPageName(targetUrl.href) === 'login.html') return false;

  return true;
}

function setupClientNavigation() {
  if (window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
  }

  saveCurrentScrollPosition();

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!isClientNavigationClick(event, anchor)) return;

    const targetUrl = new URL(anchor.href, window.location.href);
    const currentUrl = new URL(window.location.href);
    const isCurrentPage = targetUrl.pathname === currentUrl.pathname
      && targetUrl.search === currentUrl.search;

    if (isCurrentPage && targetUrl.hash !== currentUrl.hash) return;

    if (isCurrentPage) {
      event.preventDefault();
      cancelPendingNavigation();
      return;
    }

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && anchor.closest('#sidebar-nav')) {
      updateSidebarActiveState(sidebar, getPageName(targetUrl.href));
    }

    if (!supportsClientNavigation()) return;

    event.preventDefault();
    saveCurrentScrollPosition();
    navigateTo(targetUrl.href);
  });

  window.addEventListener('popstate', event => {
    if (!supportsClientNavigation()) return;
    navigateTo(window.location.href, {
      historyMode: 'pop',
      restoreScrollTop: Number(event.state?.mainScrollTop) || 0
    });
  });

  document.addEventListener('scroll', event => {
    if (event.target !== document.querySelector('main')) return;
    if (scrollSaveFrame) cancelAnimationFrame(scrollSaveFrame);
    scrollSaveFrame = requestAnimationFrame(saveCurrentScrollPosition);
  }, true);
}

document.addEventListener('DOMContentLoaded', () => {
  renderDemoRoleBar();

  try {
    runPage(currentPageName);
  } catch (error) {
    console.error('StayHub page initialization failed:', error);
  }

  setupClientNavigation();
  if (window.lucide) lucide.createIcons();
});
