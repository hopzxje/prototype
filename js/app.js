/**
 * StayHub - Shared Application Logic & Layout Component Renderers
 */

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

// Render Top Demo Role Switcher Bar
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

        <a href="login.html" class="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors">
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
  setTimeout(() => window.location.href = 'index.html', 300);
}

function resetDemoData() {
  if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu demo về trạng thái ban đầu?')) {
    DataStore.resetAll();
    showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
    setTimeout(() => window.location.reload(), 400);
  }
}

// Render Sidebar according to current page and role
function renderSidebar(activePage = 'index.html') {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

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
      { href: 'index.html', icon: 'home', label: 'Căn hộ P201 của tôi' },
      { href: 'invoices.html', icon: 'receipt', label: 'Hóa đơn & Tiền phòng' },
      { href: 'maintenance.html', icon: 'wrench', label: 'Báo hỏng & Sửa chữa' },
      { href: 'visitors.html', icon: 'user-check', label: 'Đăng ký Khách thăm' },
      { href: 'notifications.html', icon: 'bell', label: 'Thông báo BQL' },
      { href: 'profile.html', icon: 'user', label: 'Hồ sơ & Hợp đồng' }
    ];
  } else {
    // MANAGER & STAFF
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
      { href: 'reports.html', icon: 'bar-chart-3', label: 'Báo cáo & Thống kê' }
    ];
  }

  sidebar.innerHTML = `
    <!-- Brand -->
    <div class="h-16 flex items-center px-6 border-b border-slate-200">
      <a href="index.html" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          S
        </div>
        <div>
          <span class="font-bold text-base text-slate-900 tracking-tight">StayHub</span>
          <span class="text-[10px] block text-slate-500 font-medium -mt-0.5">Living Management</span>
        </div>
      </a>
    </div>

    <!-- Navigation Links -->
    <div id="sidebar-nav" class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <div class="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        ${role === 'RESIDENT' ? 'Dành Cho Cư Dân' : role === 'ADMIN' ? 'Hệ Thống Quản Trị' : 'Quản Lý Vận Hành'}
      </div>
      ${navItems.map(item => {
        const isActive = activePage === item.href;
        return `
          <a href="${item.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-teal-50 text-[#0F766E] font-semibold border-r-4 border-[#0F766E]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
            <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-[#0F766E]' : 'text-slate-500'}"></i>
            <span>${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-slate-200 bg-slate-50/50">
      <div class="flex items-center gap-3">
        <img src="${user.avatar}" class="w-9 h-9 rounded-full object-cover border border-slate-200" alt="Avatar">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 truncate">${user.fullName}</p>
          <p class="text-xs text-slate-500 truncate">${user.title || user.email}</p>
        </div>
        <a href="login.html" title="Đăng xuất" class="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition-colors">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  `;
  lucide.createIcons();

  // Full-page navigation recreates the sidebar, so retain its scroll position per role.
  const nav = sidebar.querySelector('#sidebar-nav');
  const scrollKey = `stayhub_sidebar_scroll_${role}`;
  try {
    const savedScrollTop = Number(sessionStorage.getItem(scrollKey));
    if (Number.isFinite(savedScrollTop)) nav.scrollTop = savedScrollTop;

    const saveScroll = () => sessionStorage.setItem(scrollKey, String(nav.scrollTop));
    nav.addEventListener('scroll', saveScroll, { passive: true });
    nav.addEventListener('click', saveScroll);
  } catch (error) {
    // Some browser privacy settings disable session storage; navigation still works.
  }
}

// Render Topbar
function renderTopbar(pageTitle = 'Tổng quan Vận hành', breadcrumb = 'Trang chủ') {
  const topbar = document.getElementById('app-topbar');
  if (!topbar) return;

  const buildings = DataStore.getBuildings();

  topbar.innerHTML = `
    <div class="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 leading-tight">${pageTitle}</h1>
        <p class="text-xs text-slate-500">${breadcrumb}</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Building selector -->
        <div class="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <i data-lucide="map-pin" class="w-4 h-4 text-teal-600"></i>
          <select id="building-filter" onchange="handleBuildingChange(this.value)" class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
            <option value="ALL">Tất cả 3 cơ sở (36 phòng)</option>
            ${buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
          </select>
        </div>

        <!-- Notification bell -->
        <a href="notifications.html" class="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title="Thông báo">
          <i data-lucide="bell" class="w-5 h-5"></i>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </a>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function handleBuildingChange(buildingId) {
  showToast(`Đã lọc cơ sở: ${buildingId === 'ALL' ? 'Tất cả cơ sở' : buildingId}`);
  if (typeof onFilterBuilding === 'function') {
    onFilterBuilding(buildingId);
  }
}

// Helper to open/close modal
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderDemoRoleBar();
  lucide.createIcons();
});
