const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../pages/property/assets.html');

const htmlContent = `<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StayHub - Quản lý Tài sản thiết bị</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="../../css/style.css">
  <script src="../../js/data.js"></script>
  <script src="../../js/app.js"></script>
  <style>
    /* Micro styles for refined table rows and drawer animations */
    .table-row-hover {
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .table-row-hover:hover {
      background-color: rgba(248, 250, 252, 0.95);
    }
    .drawer-backdrop-open {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .drawer-panel-open {
      transform: translateX(0) !important;
    }
  </style>
</head>

<body class="bg-slate-50 min-h-screen flex flex-col font-sans">

  <!-- Demo Role Bar -->
  <div id="demo-role-bar"></div>

  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar -->
    <aside id="app-sidebar"
      class="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-41px)]"></aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <header id="app-topbar"></header>
      <script>initStayHubShell('assets.html', 'Quản lý Tài sản thiết bị', 'Cơ sở / Trang thiết bị');</script>

      <div class="p-6 max-w-7xl w-full mx-auto space-y-6">

        <!-- Top Header & Primary Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shrink-0">
                <i data-lucide="package" class="w-4.5 h-4.5"></i>
              </span>
              <span>Quản Lý Tài Sản & Trang Thiết Bị</span>
            </h2>
            <p class="text-xs text-slate-500 mt-1">Theo dõi hiện trạng phân bổ căn hộ, định giá nguyên giá, bảo hành và luân chuyển tài sản</p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- 1. Nút Nhập Thêm Số Lượng (Secondary) -->
            <button onclick="openRestockModal()"
              class="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Nhập thêm số lượng thiết bị có sẵn vào kho">
              <i data-lucide="package-plus" class="w-4 h-4 text-slate-500"></i>
              <span>Nhập Thêm Số Lượng</span>
            </button>

            <!-- 2. Nút Bàn Giao Vào Phòng (Secondary) -->
            <button onclick="openAssignAssetModal()"
              class="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Phân bổ thiết bị từ kho lưu trữ vào căn hộ">
              <i data-lucide="corner-down-right" class="w-4 h-4 text-slate-500"></i>
              <span>Bàn Giao Vào Phòng</span>
            </button>

            <!-- 3. Nút Thêm Mới Tài Sản (Primary CTA) -->
            <button onclick="openCreateAssetModal()"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Khai báo thiết bị mới vào hệ thống">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Thêm Tài Sản Mới</span>
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Tổng tài sản -->
          <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng tài sản quản lý</span>
              <span class="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <i data-lucide="boxes" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-2xl font-black text-slate-900 tracking-tight" id="stat-total-assets">0</span>
              <span class="text-xs font-semibold text-slate-400">thiết bị</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <span>Nguyên giá:</span>
              <strong class="text-slate-700 font-bold" id="stat-total-value">0 ₫</strong>
            </p>
          </div>

          <!-- Card 2: Đang trang bị trong phòng -->
          <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang trang bị tại phòng</span>
              <span class="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <i data-lucide="home" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-2xl font-black text-emerald-600 tracking-tight" id="stat-assigned-assets">0</span>
              <span class="text-xs font-semibold text-emerald-700" id="stat-assigned-pct">(0%)</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Đang phục vụ cư dân tại căn hộ</p>
          </div>

          <!-- Card 3: Tồn kho sẵn sàng -->
          <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tồn kho sẵn sàng</span>
              <span class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <i data-lucide="warehouse" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-2xl font-black text-amber-600 tracking-tight" id="stat-instock-assets">0</span>
              <span class="text-xs font-semibold text-slate-400">thiết bị</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Sẵn sàng bàn giao khi có phòng mới</p>
          </div>

          <!-- Card 4: Lịch sử & Bàn giao -->
          <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lịch sử bàn giao</span>
              <span class="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <i data-lucide="clipboard-check" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-2xl font-black text-blue-600 tracking-tight" id="stat-total-assignments">0</span>
              <span class="text-xs font-semibold text-slate-400">lượt gán</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Hồ sơ nghiệm thu thiết bị căn hộ</p>
          </div>
        </div>

        <!-- Navigation Tabs & View Mode Switcher -->
        <div class="flex items-center justify-between border-b border-slate-200/90 gap-4 flex-wrap">
          <div class="flex items-center gap-1 sm:gap-4 text-xs font-bold">
            <button onclick="switchAssetTab('inventory')" id="tab-btn-inventory"
              class="pb-3 border-b-2 border-[#0F766E] text-[#0F766E] flex items-center gap-2 transition-all cursor-pointer">
              <i data-lucide="layers" class="w-4 h-4"></i>
              <span>Danh Mục Tài Sản (Master)</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-800 border border-teal-200/60 font-mono" id="badge-tab-inventory-count">0</span>
            </button>
            <button onclick="switchAssetTab('apartments')" id="tab-btn-apartments"
              class="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-all cursor-pointer">
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
              <span>Trang Bị Theo Căn Hộ (Phòng)</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono" id="badge-tab-apartments-count">0</span>
            </button>
            <button onclick="switchAssetTab('history')" id="tab-btn-history"
              class="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-all cursor-pointer">
              <i data-lucide="history" class="w-4 h-4"></i>
              <span>Nhật Ký Điều Chuyển</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono" id="badge-tab-history-count">0</span>
            </button>
          </div>
        </div>

        <!-- Single-Row Unified Filter Bar -->
        <div class="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
            <!-- Search Input -->
            <div class="relative flex-1 min-w-[220px]">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input type="text" id="asset-search" oninput="handleFilterChange()"
                placeholder="Tìm mã tài sản, tên thiết bị, model, số phòng..."
                class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:bg-white transition-colors">
            </div>

            <!-- Asset Type Filter -->
            <select id="filter-asset-type" onchange="handleFilterChange()"
              class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-600 text-slate-700 font-medium">
              <option value="ALL">Tất cả loại tài sản</option>
              <!-- Populated dynamically -->
            </select>

            <!-- Status Filter -->
            <select id="filter-asset-status" onchange="handleFilterChange()"
              class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-600 text-slate-700 font-medium">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="IN_STOCK">📦 Tồn kho sẵn sàng</option>
              <option value="ASSIGNED">🏠 Đang dùng trong phòng</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200" id="assets-count-badge">0 tài sản</span>
          </div>
        </div>

        <!-- ===================================================================
             TAB 1: TOÀN BỘ DANH MỤC TÀI SẢN (FULL-WIDTH MODERN MASTER TABLE)
             =================================================================== -->
        <div id="tab-content-inventory" class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50/80 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200/90">
                  <tr>
                    <th class="py-3 px-4">Mã & Loại Tài Sản</th>
                    <th class="py-3 px-4">Tên Thiết Bị & Model</th>
                    <th class="py-3 px-4">Vị Trí Hiện Tại</th>
                    <th class="py-3 px-4">Nguyên Giá Mua</th>
                    <th class="py-3 px-4">Bảo Hành & Hiện Trạng</th>
                    <th class="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody id="assets-tbody" class="divide-y divide-slate-100 font-medium">
                  <!-- Rendered dynamically by renderAssetsTable() -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 2: TRANG BỊ THEO CĂN HỘ (ROOM ALLOCATION 4-COLUMN CARDS)
             =================================================================== -->
        <div id="tab-content-apartments" class="space-y-4 hidden">
          <!-- Sub filter for room equipped status -->
          <div class="flex items-center justify-between pb-1 flex-wrap gap-2">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-slate-500 font-medium mr-1">Bộ lọc phòng:</span>
              <button type="button" onclick="setApartmentEquipFilter('ALL')" id="filter-room-equip-all"
                class="px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer text-xs">Tất cả phòng</button>
              <button type="button" onclick="setApartmentEquipFilter('EQUIPPED')" id="filter-room-equip-equipped"
                class="px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer text-xs">Đã có đồ</button>
              <button type="button" onclick="setApartmentEquipFilter('EMPTY')" id="filter-room-equip-empty"
                class="px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer text-xs">Chưa có đồ (Cần trang bị)</button>
            </div>
            <div class="text-xs text-slate-400">
              Bấm vào từng phòng để xem danh sách hoặc gán thêm thiết bị
            </div>
          </div>

          <!-- Grid of Room Equipment Cards -->
          <div id="apartment-rooms-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
            <!-- Rendered dynamically by renderApartmentRoomsGrid() -->
          </div>
        </div>

        <!-- ===================================================================
             TAB 3: NHẬT KÝ ĐIỀU CHUYỂN (ASSET ASSIGNMENT AUDIT LOG)
             =================================================================== -->
        <div id="tab-content-history" class="space-y-4 hidden">
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 class="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <i data-lucide="history" class="w-4 h-4 text-teal-700"></i>
                  <span>Lịch Sử Phân Bổ & Gán Tài Sản</span>
                </h3>
                <p class="text-[11px] text-slate-500 mt-0.5">Lưu vết toàn bộ quá trình bàn giao thiết bị vào căn hộ</p>
              </div>
              <span class="text-xs font-semibold text-slate-500" id="assignments-count-badge">0 bản ghi</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50/80 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200/90">
                  <tr>
                    <th class="p-3.5">Mã Bản Ghi</th>
                    <th class="p-3.5">Mã Tài Sản</th>
                    <th class="p-3.5">Tên Thiết Bị</th>
                    <th class="p-3.5">Căn Hộ Nhận</th>
                    <th class="p-3.5">Ngày Bàn Giao</th>
                    <th class="p-3.5">Người Thực Hiện</th>
                    <th class="p-3.5">Ghi Chú Bàn Giao</th>
                    <th class="p-3.5 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody id="assignments-tbody" class="divide-y divide-slate-100 font-medium">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- ===================================================================
       SLIDE-OVER DRAWER: CHI TIẾT TÀI SẢN & ĐIỀU CHUYỂN (OFF-CANVAS PANEL)
       =================================================================== -->
  <div id="asset-drawer" class="fixed inset-0 z-50 overflow-hidden hidden" aria-labelledby="drawer-title" role="dialog" aria-modal="true">
    <div id="asset-drawer-backdrop" onclick="closeAssetDrawer()"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300"></div>
    <div class="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out translate-x-full"
      id="asset-drawer-panel">
      <!-- Drawer Header -->
      <div class="p-5 border-b border-slate-200/80 flex items-start justify-between bg-slate-50/80">
        <div>
          <div class="flex items-center gap-2">
            <span id="drawer-code" class="font-mono text-xs font-bold text-[#0F766E] px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200/70">AC-201</span>
            <span id="drawer-type-badge" class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Điều hòa</span>
          </div>
          <h3 id="drawer-name" class="text-base font-bold text-slate-900 mt-1.5">Tên thiết bị</h3>
          <p id="drawer-brand-model" class="text-xs text-slate-500 mt-0.5">Daikin • FTKQ35SVMV</p>
        </div>
        <button type="button" onclick="closeAssetDrawer()" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Drawer Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5">
        <!-- Location Hero Card -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Vị trí hiện tại</span>
            <span id="drawer-location" class="text-sm font-bold text-slate-900 block mt-0.5">Phòng P201</span>
            <span id="drawer-building" class="text-xs text-slate-500">StayHub Central - Quận 1</span>
          </div>
          <div id="drawer-status-pill">
            <span class="badge badge-success">Đang dùng trong phòng</span>
          </div>
        </div>

        <!-- Specifications & Financials -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Thông số & Nguyên giá</h4>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="p-3 rounded-lg border border-slate-200 bg-white">
              <span class="text-slate-400 text-[11px] block">Nguyên giá mua:</span>
              <span id="drawer-price" class="text-sm font-extrabold text-slate-900 font-mono block mt-0.5">0 ₫</span>
              <span id="drawer-purchasedate" class="text-[10px] text-slate-400 block mt-0.5">Ngày mua: ---</span>
            </div>
            <div class="p-3 rounded-lg border border-slate-200 bg-white">
              <span class="text-slate-400 text-[11px] block">Thời hạn bảo hành:</span>
              <span id="drawer-warranty" class="text-sm font-bold text-slate-900 block mt-0.5">24 tháng</span>
              <span class="text-[10px] text-emerald-600 font-medium block mt-0.5">Bảo hành chính hãng</span>
            </div>
            <div class="p-3 rounded-lg border border-slate-200 bg-white">
              <span class="text-slate-400 text-[11px] block">Tình trạng vật lý:</span>
              <span id="drawer-condition" class="text-xs font-bold text-slate-800 block mt-0.5">Tốt</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">Đã qua kiểm định</span>
            </div>
            <div class="p-3 rounded-lg border border-slate-200 bg-white">
              <span class="text-slate-400 text-[11px] block">Lần gán gần nhất:</span>
              <span id="drawer-assigned-at" class="text-xs font-bold text-slate-800 block mt-0.5">---</span>
              <span id="drawer-assigned-by" class="text-[10px] text-slate-400 block mt-0.5">Bởi: ---</span>
            </div>
          </div>
        </div>

        <!-- Assignment History -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <i data-lucide="history" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>Lịch sử điều chuyển</span>
            </h4>
            <span id="drawer-history-count" class="text-[10.5px] font-semibold text-slate-400">0 lần</span>
          </div>
          <div id="drawer-history-list" class="space-y-2">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

      <!-- Drawer Footer Actions -->
      <div class="p-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2.5">
        <div id="drawer-primary-action" class="flex-1">
          <!-- Button: Gán vào phòng hoặc Thu hồi về kho -->
        </div>
        <button id="drawer-btn-restock" onclick="openRestockFromDrawer()" title="Nhập thêm số lượng thiết bị này"
          class="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="package-plus" class="w-4 h-4 text-slate-500"></i>
          <span>Nhập thêm</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ===================================================================
       MODAL 1: TẠO MỚI TÀI SẢN (CREATE ASSET)
       =================================================================== -->
  <div id="createAssetModal" class="modal-backdrop">
    <div class="modal-content max-w-xl w-full p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200/80 flex items-center justify-center text-xs font-extrabold">1</span>
            <span>Tạo Mới Tài Sản Thiết Bị</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Khởi tạo thiết bị vào hệ thống và kiểm tra trùng lặp mã tự động</p>
        </div>
        <button type="button" onclick="closeModal('createAssetModal')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Alert Box hiển thị khi có lỗi Validate hoặc Duplicate data -->
      <div id="create-asset-error-box"
        class="hidden p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 space-y-1">
        <div class="flex items-start gap-2">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 shrink-0 mt-0.5"></i>
          <div>
            <p class="font-bold text-rose-900" id="create-asset-error-title">Lỗi kiểm tra dữ liệu</p>
            <p class="text-rose-700 mt-0.5" id="create-asset-error-desc">Vui lòng kiểm tra lại thông tin.</p>
          </div>
        </div>
      </div>

      <form onsubmit="handleCreateAssetSubmit(event)" class="space-y-3.5 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Loại tài sản <span class="text-red-500">*</span></label>
            <select id="modal-asset-type" onchange="onAssetTypeSelected()" required
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-teal-800 focus:outline-teal-600">
              <option value="">-- Chọn loại tài sản --</option>
              <!-- Loaded dynamically -->
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Mã tài sản định danh <span class="text-red-500">*</span></label>
            <div class="flex gap-1.5">
              <input type="text" id="modal-asset-code" placeholder="VD: AC-CENTRAL-301" required
                class="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono uppercase font-bold focus:outline-teal-600">
              <button type="button" onclick="generateRandomAssetCode()" title="Tạo mã ngẫu nhiên"
                class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 cursor-pointer">
                Tạo mã
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Tên thiết bị / tài sản <span class="text-red-500">*</span></label>
            <input type="text" id="modal-asset-name" placeholder="VD: Điều hòa Daikin Inverter 1.5 HP" required
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600 font-semibold">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Thương hiệu / Hãng</label>
            <input type="text" id="modal-asset-brand" placeholder="VD: Daikin, Panasonic, Toshiba..."
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Model / Số hiệu</label>
            <input type="text" id="modal-asset-model" placeholder="VD: FTKQ35SVMV"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Cơ sở lưu trữ <span class="text-red-500">*</span></label>
            <select id="modal-asset-building" required
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
              <!-- Loaded dynamically -->
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Số lượng nhập kho <span class="text-[#0F766E] font-bold">*</span></label>
            <input type="number" id="modal-asset-quantity" min="1" max="100" value="1" oninput="onAssetQuantityChange()"
              class="w-full bg-slate-50 border border-teal-300 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-teal-600">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nguyên giá mua (VNĐ)</label>
            <input type="number" id="modal-asset-price" placeholder="11500000"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Bảo hành (tháng)</label>
            <input type="number" id="modal-asset-warranty" value="24"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ngày mua / nhập</label>
            <input type="date" id="modal-asset-date"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tình trạng vật lý</label>
            <select id="modal-asset-condition"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600">
              <option value="Mới 100%">Mới 100% (Nguyên seal)</option>
              <option value="Tốt">Tốt (Đã kiểm định)</option>
              <option value="Khá">Khá (Đã qua sử dụng)</option>
            </select>
          </div>
        </div>

        <div id="modal-asset-quantity-note"
          class="hidden p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 flex items-center gap-2">
          <i data-lucide="info" class="w-4 h-4 shrink-0 text-teal-600"></i>
          <span>Khi nhập số lượng > 1, hệ thống sẽ tự động tạo chuỗi mã tuần tự (vd: <strong
              id="preview-qty-codes">AST-01, AST-02...</strong>) vào kho sẵn sàng để gán phòng.</span>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeModal('createAssetModal')"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer">
            Hủy Bỏ
          </button>
          <button type="submit"
            class="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Lưu Tài Sản Vào Kho</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===================================================================
       MODAL 2: NHẬP THÊM SỐ LƯỢNG (RESTOCK ASSET)
       =================================================================== -->
  <div id="restockAssetModal" class="modal-backdrop">
    <div class="modal-content max-w-lg w-full p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center text-xs font-extrabold">
              <i data-lucide="package-plus" class="w-3.5 h-3.5"></i>
            </span>
            <span>Nhập Thêm Số Lượng</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Bổ sung số lượng thiết bị có sẵn vào kho lưu trữ</p>
        </div>
        <button type="button" onclick="closeModal('restockAssetModal')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form onsubmit="handleRestockSubmit(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Chọn mẫu tài sản cần nhập thêm <span class="text-red-500">*</span></label>
          <select id="modal-restock-asset-id" onchange="onRestockAssetSelected()" required
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-indigo-600">
            <!-- Loaded dynamically -->
          </select>
        </div>

        <!-- Preview Card -->
        <div id="restock-item-preview" class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900" id="restock-preview-name">Điều hòa</span>
            <span class="font-mono text-[11px] text-teal-800 font-bold px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200" id="restock-preview-code">AC-201</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div>Hãng/Model: <span class="font-medium text-slate-700" id="restock-preview-brand-model">Daikin</span></div>
            <div>Cơ sở lưu trữ: <span class="font-medium text-slate-700" id="restock-preview-building">Cơ sở 1</span></div>
            <div>Đơn giá gốc: <span class="font-medium text-slate-700" id="restock-preview-unitprice">11.500.000 ₫</span></div>
            <div>Tồn kho hiện có: <span class="font-medium text-teal-700" id="restock-preview-current-stock">2 cái</span></div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Số lượng nhập thêm <span class="text-indigo-600 font-bold">*</span></label>
            <input type="number" id="modal-restock-qty" min="1" max="100" value="1" required
              oninput="calculateRestockPreview()"
              class="w-full bg-slate-50 border border-indigo-300 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-indigo-600">
            <div class="flex items-center gap-1.5 mt-1.5">
              <button type="button" onclick="setRestockQty(1)" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-600 cursor-pointer">+1</button>
              <button type="button" onclick="setRestockQty(5)" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-600 cursor-pointer">+5</button>
              <button type="button" onclick="setRestockQty(10)" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-600 cursor-pointer">+10</button>
              <button type="button" onclick="setRestockQty(20)" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-600 cursor-pointer">+20</button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Đơn giá nhập mới (VNĐ)</label>
            <input type="number" id="modal-restock-price" placeholder="Để trống nếu giữ giá cũ"
              oninput="calculateRestockPreview()"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-600">
            <p class="text-[10.5px] text-slate-400 mt-1">Mặc định lấy theo nguyên giá ban đầu</p>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ghi chú đợt nhập hàng</label>
          <input type="text" id="modal-restock-notes" placeholder="VD: Nhập bổ sung đợt 2 - Quản lý duyệt"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-600">
        </div>

        <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-indigo-900">
          <div class="flex items-center justify-between font-semibold">
            <span>Dự kiến sinh mã tự động:</span>
            <span class="text-xs font-mono font-bold text-indigo-700" id="restock-summary-codes">...</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-indigo-700">
            <span>Tổng giá trị nhập kho:</span>
            <span class="font-bold text-slate-900 text-xs" id="restock-summary-total">0 ₫</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeModal('restockAssetModal')"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer">
            Hủy Bỏ
          </button>
          <button type="submit"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="package-plus" class="w-4 h-4"></i>
            <span>Xác Nhận Nhập Kho</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===================================================================
       MODAL 3: GÁN TÀI SẢN VÀO CĂN HỘ (ASSIGN ASSET)
       =================================================================== -->
  <div id="assignAssetModal" class="modal-backdrop">
    <div class="modal-content max-w-lg w-full p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center text-xs font-extrabold">
              <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
            </span>
            <span>Bàn Giao Thiết Bị Vào Căn Hộ</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Phân bổ trang thiết bị từ kho lưu trữ vào phòng</p>
        </div>
        <button type="button" onclick="closeModal('assignAssetModal')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form onsubmit="handleAssignAssetSubmit(event)" class="space-y-3.5 text-xs">
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-semibold text-slate-700">Căn hộ nhận thiết bị <span class="text-red-500">*</span></label>
            <label class="inline-flex items-center gap-1.5 text-[11px] text-teal-700 font-semibold cursor-pointer select-none">
              <input type="checkbox" id="modal-filter-only-empty-rooms" checked onchange="loadAssignRoomDropdown()"
                class="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer">
              <span>Chỉ hiện phòng chưa có đồ</span>
            </label>
          </div>
          <select id="modal-assign-room" required onchange="onAssignRoomChanged()"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-teal-600">
            <option value="">-- Chọn căn hộ / phòng (chưa có đồ) --</option>
            <!-- Loaded dynamically -->
          </select>
          <p class="text-[11px] text-teal-700 mt-0.5 font-medium" id="modal-assign-room-info">
            💡 Đang lọc chỉ hiển thị các phòng chưa có trang thiết bị để gán đồ
          </p>
        </div>

        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900 text-xs">Chọn Thiết Bị Khả Dụng Trong Kho</span>
            <span class="text-[10.5px] text-amber-700 font-semibold" id="modal-stock-count-info">Đang tải kho...</span>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">1. Lọc theo Loại thiết bị</label>
            <select id="modal-assign-filter-type" onchange="filterAvailableAssetsForAssign()"
              class="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-teal-600">
              <option value="ALL">-- Tất cả loại tài sản có trong kho --</option>
              <!-- Loaded dynamically -->
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">2. Chọn thiết bị cụ thể <span class="text-red-500">*</span></label>
            <select id="modal-assign-asset-select" required
              class="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono font-semibold text-teal-900 focus:outline-teal-600">
              <option value="">-- Chọn thiết bị khả dụng trong kho --</option>
              <!-- Loaded dynamically -->
            </select>
            <p class="text-[10.5px] text-slate-500 mt-1" id="modal-assign-asset-detail">Mã tài sản, hãng sản xuất và tình trạng vật lý</p>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ghi chú bàn giao / Tình trạng khi gán</label>
          <textarea id="modal-assign-notes" rows="2"
            placeholder="Ví dụ: Thiết bị mới 100%, kèm điều khiển từ xa, tem niêm phong nguyên vẹn..."
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-teal-600 resize-none">Bàn giao trang bị vào phòng đầy đủ phụ kiện, hoạt động bình thường</textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeModal('assignAssetModal')"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer">
            Hủy Bỏ
          </button>
          <button type="submit"
            class="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="check-check" class="w-4 h-4"></i>
            <span>Xác Nhận Bàn Giao</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- SCRIPT LOGIC -->
  <script data-stayhub-page="assets.html">
    let currentTab = 'inventory';
    let aptEquipFilter = 'ALL';
    let selectedDrawerAssetId = null;

    // Helper: Map icon cho loại tài sản
    function getAssetTypeIcon(typeCode) {
      const code = (typeCode || '').toUpperCase();
      if (code === 'AC') return 'wind';
      if (code === 'FRIDGE') return 'snowflake';
      if (code === 'WATER_HEATER') return 'flame';
      if (code === 'BED') return 'bed';
      if (code === 'WARDROBE') return 'archive';
      if (code === 'DESK_CHAIR' || code === 'DESK') return 'briefcase';
      if (code === 'WASHING_MACHINE' || code === 'WM') return 'disc';
      if (code === 'SMART_LOCK' || code === 'LOCK') return 'key';
      return 'package';
    }

    // =========================================================================
    // 1. Quản lý Chuyển Tab (Inventory / Apartments / History)
    // =========================================================================
    function switchAssetTab(tab) {
      currentTab = tab;
      const tabs = ['inventory', 'apartments', 'history'];
      tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (btn && content) {
          if (t === tab) {
            btn.className = 'pb-3 border-b-2 border-[#0F766E] text-[#0F766E] flex items-center gap-2 transition-all font-bold cursor-pointer';
            content.classList.remove('hidden');
          } else {
            btn.className = 'pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-all font-semibold cursor-pointer';
            content.classList.add('hidden');
          }
        }
      });

      if (tab === 'inventory') renderAssetsTable();
      if (tab === 'apartments') renderApartmentRoomsGrid();
      if (tab === 'history') renderAssignmentsTable();
      if (window.lucide) lucide.createIcons();
    }

    function handleFilterChange() {
      if (currentTab === 'inventory') renderAssetsTable();
      if (currentTab === 'apartments') renderApartmentRoomsGrid();
    }

    // =========================================================================
    // 2. Thống Kê & Cập Nhật Số Liệu KPI
    // =========================================================================
    function updateMetrics() {
      const currentBldId = DataStore.getCurrentBuilding();
      let assets = DataStore.getAssets();
      let assignments = DataStore.getAssetAssignments();
      let rooms = DataStore.getRooms();

      if (currentBldId !== 'ALL') {
        assets = assets.filter(a => a.buildingId === currentBldId);
        assignments = assignments.filter(a => a.buildingId === currentBldId);
        rooms = rooms.filter(r => r.buildingId === currentBldId);
      }

      const total = assets.length;
      const assigned = assets.filter(a => a.allocationStatus === 'ASSIGNED').length;
      const inStock = assets.filter(a => a.allocationStatus === 'IN_STOCK').length;
      const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const assignedPct = total > 0 ? Math.round((assigned / total) * 100) : 0;

      document.getElementById('stat-total-assets').textContent = total;
      document.getElementById('stat-total-value').textContent = formatVND(totalValue);
      document.getElementById('stat-assigned-assets').textContent = assigned;
      document.getElementById('stat-assigned-pct').textContent = `(${assignedPct}%)`;
      document.getElementById('stat-instock-assets').textContent = inStock;
      document.getElementById('stat-total-assignments').textContent = assignments.length;

      // Tab badges
      const badgeInv = document.getElementById('badge-tab-inventory-count');
      const badgeApt = document.getElementById('badge-tab-apartments-count');
      const badgeHis = document.getElementById('badge-tab-history-count');
      if (badgeInv) badgeInv.textContent = total;
      if (badgeApt) badgeApt.textContent = rooms.length;
      if (badgeHis) badgeHis.textContent = assignments.length;
    }

    // =========================================================================
    // 3. Tab 1: Render Master Inventory Table (Full-Width SaaS View)
    // =========================================================================
    function renderAssetsTable() {
      updateMetrics();
      const tbody = document.getElementById('assets-tbody');
      if (!tbody) return;

      const currentBldId = DataStore.getCurrentBuilding();
      const q = (document.getElementById('asset-search')?.value || '').toLowerCase().trim();
      const typeFilter = document.getElementById('filter-asset-type')?.value || 'ALL';
      const statusFilter = document.getElementById('filter-asset-status')?.value || 'ALL';

      let assets = DataStore.getAssets();

      if (currentBldId !== 'ALL') {
        assets = assets.filter(a => a.buildingId === currentBldId);
      }
      if (typeFilter !== 'ALL') {
        assets = assets.filter(a => a.typeCode === typeFilter);
      }
      if (statusFilter !== 'ALL') {
        assets = assets.filter(a => a.allocationStatus === statusFilter);
      }
      if (q) {
        assets = assets.filter(a =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.brand && a.brand.toLowerCase().includes(q)) ||
          (a.model && a.model.toLowerCase().includes(q)) ||
          (a.roomNumber && a.roomNumber.toLowerCase().includes(q))
        );
      }

      document.getElementById('assets-count-badge').textContent = `${assets.length} tài sản`;

      if (assets.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="p-8 text-center text-slate-400">
              <i data-lucide="package-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p class="font-medium">Không tìm thấy tài sản nào phù hợp với bộ lọc.</p>
            </td>
          </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const buildings = DataStore.getBuildings();

      tbody.innerHTML = assets.map(a => {
        const isAssigned = a.allocationStatus === 'ASSIGNED';
        const bld = buildings.find(b => b.id === a.buildingId);
        const bldName = bld ? bld.name.split(' - ')[0] : 'Cơ sở';
        const iconName = getAssetTypeIcon(a.typeCode);

        const locationBadge = isAssigned
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
               <i data-lucide="home" class="w-3.5 h-3.5"></i>
               <span>Phòng ${a.roomNumber}</span>
             </span>`
          : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
               <i data-lucide="warehouse" class="w-3.5 h-3.5"></i>
               <span>Kho thiết bị</span>
             </span>`;

        return `
          <tr onclick="openAssetDrawer('${a.id}')"
            class="table-row-hover cursor-pointer border-b border-slate-100/90 transition-colors">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shrink-0">
                  <i data-lucide="${iconName}" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="font-mono font-bold text-slate-900 block">${a.code}</span>
                  <span class="text-[10px] text-slate-400 font-medium">${a.typeName || a.typeCode} • ${bldName}</span>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="font-bold text-slate-900 block">${a.name}</span>
              <span class="text-[11px] text-slate-500">${a.brand || '---'} • Model: ${a.model || 'Tiêu chuẩn'}</span>
            </td>
            <td class="py-3.5 px-4">
              ${locationBadge}
            </td>
            <td class="py-3.5 px-4 font-mono">
              <span class="font-extrabold text-slate-900 block">${formatVND(a.price || 0)}</span>
              <span class="text-[10px] text-slate-400 font-sans">Ngày mua: ${a.purchaseDate || '---'}</span>
            </td>
            <td class="py-3.5 px-4">
              <span class="font-semibold text-slate-700 block">${a.warrantyMonths || 24} tháng BH</span>
              <span class="text-[11px] text-slate-500 font-medium">Tình trạng: ${a.condition || 'Mới 100%'}</span>
            </td>
            <td class="py-3.5 px-4 text-right" onclick="event.stopPropagation()">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="openAssetDrawer('${a.id}')" title="Xem hồ sơ chi tiết"
                  class="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                  Chi tiết
                </button>
                ${!isAssigned ? `
                  <button onclick="quickAssignAsset('${a.id}')" title="Gán vào phòng"
                    class="p-1.5 rounded-md text-amber-700 hover:bg-amber-50 border border-amber-200/80 transition-colors cursor-pointer">
                    <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
                  </button>
                ` : `
                  <button onclick="handleUnassignAsset('${a.id}')" title="Thu hồi về kho"
                    class="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  </button>
                `}
                <button onclick="handleDeleteAsset('${a.id}')" title="Xóa tài sản này"
                  class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    // =========================================================================
    // 4. Tab 2: Render Room Allocation (Trang Bị Theo Căn Hộ)
    // =========================================================================
    function setApartmentEquipFilter(filter) {
      aptEquipFilter = filter;
      ['all', 'empty', 'equipped'].forEach(f => {
        const btn = document.getElementById(`filter-room-equip-${f}`);
        if (btn) {
          if (f.toUpperCase() === filter) {
            btn.className = 'px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer text-xs';
          } else {
            btn.className = 'px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer text-xs';
          }
        }
      });
      renderApartmentRoomsGrid();
    }

    function renderApartmentRoomsGrid() {
      const container = document.getElementById('apartment-rooms-grid');
      if (!container) return;

      const currentBldId = DataStore.getCurrentBuilding();
      const q = (document.getElementById('asset-search')?.value || '').toLowerCase().trim();
      let rooms = DataStore.getRooms();
      const assets = DataStore.getAssets();

      if (currentBldId !== 'ALL') {
        rooms = rooms.filter(r => r.buildingId === currentBldId);
      }

      if (q) {
        rooms = rooms.filter(r =>
          r.roomNumber.toLowerCase().includes(q) ||
          (r.tenant && r.tenant.toLowerCase().includes(q)) ||
          r.type.toLowerCase().includes(q)
        );
      }

      if (aptEquipFilter === 'EMPTY') {
        rooms = rooms.filter(r => assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber).length === 0);
      } else if (aptEquipFilter === 'EQUIPPED') {
        rooms = rooms.filter(r => assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber).length > 0);
      }

      if (rooms.length === 0) {
        container.innerHTML = `
          <div class="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <i data-lucide="home" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
            <p class="font-medium text-xs">Không tìm thấy căn hộ nào phù hợp với bộ lọc.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      container.innerHTML = rooms.map(room => {
        const roomAssets = assets.filter(a => a.roomId === room.id || a.roomNumber === room.roomNumber);
        const hasEquip = roomAssets.length > 0;
        const isOccupied = room.status === 'OCCUPIED';

        const statusBadge = isOccupied
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đang thuê</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Trống</span>`;

        let equipListHtml = '';
        if (hasEquip) {
          equipListHtml = `
            <div class="space-y-1.5 my-3">
              ${roomAssets.map(a => `
                <div onclick="openAssetDrawer('${a.id}')"
                  class="p-2 rounded-lg bg-slate-50 hover:bg-teal-50/60 border border-slate-100 hover:border-teal-200/70 flex items-center justify-between text-xs transition-colors cursor-pointer">
                  <div class="flex items-center gap-2 min-w-0">
                    <i data-lucide="${getAssetTypeIcon(a.typeCode)}" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                    <span class="font-medium text-slate-800 truncate">${a.name}</span>
                  </div>
                  <span class="font-mono text-[10px] text-slate-400 shrink-0 ml-1.5">${a.code}</span>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          equipListHtml = `
            <div class="my-4 p-3 rounded-xl bg-amber-50/50 border border-dashed border-amber-200 text-center">
              <i data-lucide="package-open" class="w-5 h-5 mx-auto text-amber-500 mb-1"></i>
              <p class="text-[11px] font-semibold text-amber-800">Chưa có trang thiết bị</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Cần bổ sung điều hòa, tủ lạnh, giường...</p>
            </div>
          `;
        }

        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-md transition-all duration-200">
            <div>
              <!-- Header: Room Number, Floor, Status -->
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-bold text-slate-900 tracking-tight">P${room.roomNumber}</span>
                    <span class="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">Tầng ${room.floor}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">${room.type} · ${room.area} m²</p>
                </div>
                <div>${statusBadge}</div>
              </div>

              <!-- Equipment Count Summary -->
              <div class="flex items-center justify-between pt-2 pb-1 border-t border-slate-100 text-xs">
                <span class="text-slate-400 font-medium">Trang thiết bị:</span>
                <span class="font-bold ${hasEquip ? 'text-teal-800' : 'text-amber-700'}">
                  ${hasEquip ? `${roomAssets.length} thiết bị` : 'Trống 0/4'}
                </span>
              </div>

              <!-- Equipment Items List -->
              ${equipListHtml}
            </div>

            <!-- Footer Action Button -->
            <div class="pt-3 border-t border-slate-100 mt-2">
              <button onclick="openAssignAssetModal('${room.id}')"
                class="w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${hasEquip ? 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800' : 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs'}">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>${hasEquip ? 'Gán Thêm Thiết Bị' : 'Gán Thiết Bị Vào Phòng'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    // =========================================================================
    // 5. Tab 3: Render Lịch Sử Điều Chuyển (Audit Log)
    // =========================================================================
    function renderAssignmentsTable() {
      const tbody = document.getElementById('assignments-tbody');
      if (!tbody) return;

      const currentBldId = DataStore.getCurrentBuilding();
      let list = DataStore.getAssetAssignments();

      if (currentBldId !== 'ALL') {
        list = list.filter(a => a.buildingId === currentBldId);
      }

      document.getElementById('assignments-count-badge').textContent = `${list.length} bản ghi`;

      if (list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="p-8 text-center text-slate-400">
              <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>Chưa có bản ghi phân bổ tài sản nào.</p>
            </td>
          </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      tbody.innerHTML = list.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-slate-900">${item.id}</td>
          <td class="p-3.5 font-mono text-teal-800 font-bold">${item.assetCode}</td>
          <td class="p-3.5 font-bold text-slate-900">${item.assetName}</td>
          <td class="p-3.5">
            <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${item.roomNumber}
            </span>
          </td>
          <td class="p-3.5 font-mono">${item.assignedDate}</td>
          <td class="p-3.5">${item.assignedBy || 'Nhân sự StayHub'}</td>
          <td class="p-3.5 text-slate-500 max-w-xs truncate">${item.notes || '---'}</td>
          <td class="p-3.5 text-right">
            <span class="badge badge-success">Thành công</span>
          </td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    }

    // =========================================================================
    // 6. Slide-Over Drawer: Mở & Đóng Hồ Sơ Chi Tiết
    // =========================================================================
    function openAssetDrawer(assetId) {
      selectedDrawerAssetId = assetId;
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      const buildings = DataStore.getBuildings();
      const bld = buildings.find(b => b.id === asset.buildingId);
      const bldName = bld ? bld.name : 'StayHub Central';
      const isAssigned = asset.allocationStatus === 'ASSIGNED';

      // Header
      document.getElementById('drawer-code').textContent = asset.code;
      document.getElementById('drawer-type-badge').textContent = asset.typeName || asset.typeCode;
      document.getElementById('drawer-name').textContent = asset.name;
      document.getElementById('drawer-brand-model').textContent = `${asset.brand || '---'} • Model: ${asset.model || 'Tiêu chuẩn'}`;

      // Location & Status
      document.getElementById('drawer-location').textContent = isAssigned ? `Phòng ${asset.roomNumber}` : '📦 Kho thiết bị sẵn sàng';
      document.getElementById('drawer-location').className = `text-sm font-bold block mt-0.5 ${isAssigned ? 'text-emerald-700' : 'text-amber-700'}`;
      document.getElementById('drawer-building').textContent = bldName;
      document.getElementById('drawer-status-pill').innerHTML = isAssigned
        ? `<span class="badge badge-success flex items-center gap-1 font-bold"><i data-lucide="home" class="w-3.5 h-3.5"></i>Đang trong phòng</span>`
        : `<span class="badge badge-warning flex items-center gap-1 font-bold"><i data-lucide="warehouse" class="w-3.5 h-3.5"></i>Tồn kho</span>`;

      // Financials
      document.getElementById('drawer-price').textContent = formatVND(asset.price || 0);
      document.getElementById('drawer-purchasedate').textContent = `Ngày mua: ${asset.purchaseDate || '---'}`;
      document.getElementById('drawer-warranty').textContent = `${asset.warrantyMonths || 24} tháng`;
      document.getElementById('drawer-condition').textContent = asset.condition || 'Mới 100%';
      document.getElementById('drawer-assigned-at').textContent = asset.assignedAt || (isAssigned ? 'Trước đây' : 'Chưa gán');
      document.getElementById('drawer-assigned-by').textContent = `Bởi: ${asset.assignedBy || '---'}`;

      // History
      const assignments = DataStore.getAssetAssignments().filter(item =>
        item.assetId === asset.id || item.assetCode === asset.code
      );
      document.getElementById('drawer-history-count').textContent = `${assignments.length} lần`;

      const historyListEl = document.getElementById('drawer-history-list');
      if (assignments.length === 0) {
        historyListEl.innerHTML = `
          <div class="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-[11px] text-slate-400">
            Chưa có lịch sử bàn giao (Thiết bị đang lưu kho sẵn sàng).
          </div>
        `;
      } else {
        historyListEl.innerHTML = assignments.map(item => `
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
            <div class="flex items-center justify-between font-semibold">
              <span class="text-emerald-700 font-bold">Bàn giao vào ${item.roomNumber}</span>
              <span class="text-[10.5px] font-mono text-slate-500">${item.assignedDate}</span>
            </div>
            <p class="text-[11px] text-slate-500">${item.notes || 'Bàn giao thiết bị cho căn hộ'}</p>
            <span class="text-[10px] text-slate-400 block">Thực hiện: ${item.assignedBy || 'Nhân sự StayHub'}</span>
          </div>
        `).join('');
      }

      // Action Button in Drawer
      const primaryActionEl = document.getElementById('drawer-primary-action');
      if (!isAssigned) {
        primaryActionEl.innerHTML = `
          <button onclick="closeAssetDrawer(); quickAssignAsset('${asset.id}')"
            class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            <i data-lucide="corner-down-right" class="w-4 h-4"></i>
            <span>Gán Vào Căn Hộ</span>
          </button>
        `;
      } else {
        primaryActionEl.innerHTML = `
          <button onclick="closeAssetDrawer(); handleUnassignAsset('${asset.id}')"
            class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            <i data-lucide="rotate-ccw" class="w-4 h-4 text-slate-500"></i>
            <span>Thu Hồi Về Kho</span>
          </button>
        `;
      }

      // Show Drawer
      const drawer = document.getElementById('asset-drawer');
      const backdrop = document.getElementById('asset-drawer-backdrop');
      const panel = document.getElementById('asset-drawer-panel');

      drawer.classList.remove('hidden');
      setTimeout(() => {
        backdrop.classList.add('drawer-backdrop-open');
        panel.classList.add('drawer-panel-open');
      }, 10);

      if (window.lucide) lucide.createIcons();
    }

    function closeAssetDrawer() {
      const drawer = document.getElementById('asset-drawer');
      const backdrop = document.getElementById('asset-drawer-backdrop');
      const panel = document.getElementById('asset-drawer-panel');

      backdrop.classList.remove('drawer-backdrop-open');
      panel.classList.remove('drawer-panel-open');

      setTimeout(() => {
        drawer.classList.add('hidden');
        selectedDrawerAssetId = null;
      }, 300);
    }

    function openRestockFromDrawer() {
      if (!selectedDrawerAssetId) return;
      const id = selectedDrawerAssetId;
      closeAssetDrawer();
      openRestockModal(id);
    }

    // =========================================================================
    // 7. MODAL 1: TẠO MỚI TÀI SẢN (CREATE ASSET)
    // =========================================================================
    function openCreateAssetModal() {
      loadAssetTypeDropdown();
      loadBuildingDropdown('modal-asset-building');

      document.getElementById('create-asset-error-box').classList.add('hidden');
      document.getElementById('modal-asset-code').value = '';
      document.getElementById('modal-asset-name').value = '';
      document.getElementById('modal-asset-brand').value = '';
      document.getElementById('modal-asset-model').value = '';
      document.getElementById('modal-asset-price').value = '';
      document.getElementById('modal-asset-warranty').value = '24';
      document.getElementById('modal-asset-date').value = new Date().toISOString().split('T')[0];

      const qtyInput = document.getElementById('modal-asset-quantity');
      if (qtyInput) qtyInput.value = '1';
      const qtyNote = document.getElementById('modal-asset-quantity-note');
      if (qtyNote) qtyNote.classList.add('hidden');

      openModal('createAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function onAssetQuantityChange() {
      const qty = parseInt(document.getElementById('modal-asset-quantity')?.value) || 1;
      const noteEl = document.getElementById('modal-asset-quantity-note');
      const code = (document.getElementById('modal-asset-code')?.value || 'AST-01').trim();
      if (noteEl) {
        if (qty > 1) {
          noteEl.classList.remove('hidden');
          const previewEl = document.getElementById('preview-qty-codes');
          if (previewEl) {
            previewEl.textContent = `${code}-01, ${code}-02 ... ${code}-${String(qty).padStart(2, '0')}`;
          }
        } else {
          noteEl.classList.add('hidden');
        }
      }
    }

    function loadAssetTypeDropdown() {
      const select = document.getElementById('modal-asset-type');
      const filterSelect = document.getElementById('filter-asset-type');
      const types = DataStore.getAssetTypes();

      const optionsHtml = types.map(t => `<option value="${t.code}">${t.name} (${t.code})</option>`).join('');

      if (select) {
        select.innerHTML = `<option value="">-- Chọn loại tài sản --</option>` + optionsHtml;
      }
      if (filterSelect) {
        filterSelect.innerHTML = `<option value="ALL">Tất cả loại tài sản</option>` + optionsHtml;
      }
    }

    function loadBuildingDropdown(elementId) {
      const select = document.getElementById(elementId);
      if (!select) return;
      const buildings = DataStore.getBuildings();
      const currentBldId = DataStore.getCurrentBuilding();

      select.innerHTML = buildings.map(b => `
        <option value="${b.id}" ${b.id === currentBldId ? 'selected' : ''}>${b.name}</option>
      `).join('');
    }

    function onAssetTypeSelected() {
      const typeCode = document.getElementById('modal-asset-type').value;
      const types = DataStore.getAssetTypes();
      const targetType = types.find(t => t.code === typeCode);

      if (targetType) {
        if (!document.getElementById('modal-asset-name').value) {
          document.getElementById('modal-asset-name').value = targetType.name;
        }
        if (!document.getElementById('modal-asset-brand').value) {
          document.getElementById('modal-asset-brand').value = targetType.defaultBrand.split(' / ')[0];
        }
        generateRandomAssetCode(typeCode);
      }
    }

    function generateRandomAssetCode(pref) {
      const typeCode = pref || document.getElementById('modal-asset-type').value || 'AST';
      const randNum = Math.floor(100 + Math.random() * 900);
      document.getElementById('modal-asset-code').value = `${typeCode}-STOCK-${randNum}`;
      onAssetQuantityChange();
    }

    function handleCreateAssetSubmit(e) {
      e.preventDefault();
      const errorBox = document.getElementById('create-asset-error-box');
      errorBox.classList.add('hidden');

      const qty = parseInt(document.getElementById('modal-asset-quantity')?.value) || 1;
      const assetData = {
        code: document.getElementById('modal-asset-code').value.trim(),
        quantity: qty,
        typeCode: document.getElementById('modal-asset-type').value,
        name: document.getElementById('modal-asset-name').value.trim(),
        brand: document.getElementById('modal-asset-brand').value.trim(),
        model: document.getElementById('modal-asset-model').value.trim(),
        buildingId: document.getElementById('modal-asset-building').value,
        price: document.getElementById('modal-asset-price').value,
        warrantyMonths: document.getElementById('modal-asset-warranty').value,
        purchaseDate: document.getElementById('modal-asset-date').value,
        condition: document.getElementById('modal-asset-condition').value
      };

      const result = DataStore.createAsset(assetData);

      if (!result.success) {
        errorBox.classList.remove('hidden');
        document.getElementById('create-asset-error-title').textContent = result.isDuplicate ? '❌ Trùng lặp mã tài sản!' : '⚠️ Dữ liệu không hợp lệ!';
        document.getElementById('create-asset-error-desc').textContent = result.error;
        if (result.field === 'code') {
          const codeInput = document.getElementById('modal-asset-code');
          codeInput.focus();
          codeInput.select();
        }
        if (window.lucide) lucide.createIcons();
        return;
      }

      closeModal('createAssetModal');
      const toastMsg = (result.totalCreated && result.totalCreated > 1)
        ? `🎉 Đã nhập ${result.totalCreated} thiết bị [${result.asset.name}] vào kho!`
        : `🎉 Tạo thành công tài sản ${result.asset.code} (${result.asset.name}) vào kho!`;
      showToast(toastMsg);
      renderAssetsTable();
      renderApartmentRoomsGrid();
      updateMetrics();

      setTimeout(() => {
        const confirmMsg = (result.totalCreated && result.totalCreated > 1)
          ? `Đã tạo ${result.totalCreated} tài sản [${result.asset.name}] vào kho lưu trữ thành công!\n\nBạn có muốn chuyển sang bước GÁN THIẾT BỊ VÀO CĂN HỘ ngay bây giờ không?`
          : `Tài sản [${result.asset.code}] đã được lưu vào kho thành công!\n\nBạn có muốn chuyển sang bước GÁN TÀI SẢN NÀY VÀO MỘT CĂN HỘ ngay bây giờ không?`;
        if (confirm(confirmMsg)) {
          openAssignAssetModal(null, result.asset.id);
        }
      }, 350);
    }

    // =========================================================================
    // 8. MODAL 2: NHẬP THÊM SỐ LƯỢNG (RESTOCK ASSET)
    // =========================================================================
    function openRestockModal(preSelectedAssetId = null) {
      const select = document.getElementById('modal-restock-asset-id');
      if (!select) return;

      const currentBldId = DataStore.getCurrentBuilding();
      let assets = DataStore.getAssets();
      if (currentBldId !== 'ALL') {
        assets = assets.filter(a => a.buildingId === currentBldId);
      }

      if (assets.length === 0) {
        alert('Chưa có thiết bị nào trong cơ sở này để nhập thêm. Vui lòng tạo mới tài sản trước!');
        return;
      }

      const buildings = DataStore.getBuildings();
      select.innerHTML = assets.map(a => {
        const bld = buildings.find(b => b.id === a.buildingId);
        const bldName = bld ? bld.name.split(' - ')[0] : '';
        return `<option value="${a.id}" ${a.id === preSelectedAssetId ? 'selected' : ''}>[${a.code}] ${a.name} (${a.brand || '---'}) - ${bldName}</option>`;
      }).join('');

      if (preSelectedAssetId) {
        select.value = preSelectedAssetId;
      } else if (assets.length > 0) {
        select.value = assets[0].id;
      }

      document.getElementById('modal-restock-qty').value = '1';
      document.getElementById('modal-restock-notes').value = '';
      document.getElementById('modal-restock-price').value = '';

      onRestockAssetSelected();
      openModal('restockAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function onRestockAssetSelected() {
      const assetId = document.getElementById('modal-restock-asset-id')?.value;
      const previewBox = document.getElementById('restock-item-preview');
      if (!assetId) {
        if (previewBox) previewBox.classList.add('hidden');
        return;
      }

      const assets = DataStore.getAssets();
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;

      if (previewBox) previewBox.classList.remove('hidden');

      const buildings = DataStore.getBuildings();
      const bld = buildings.find(b => b.id === asset.buildingId);
      const inStockCount = assets.filter(a => a.name === asset.name && a.allocationStatus === 'IN_STOCK' && a.buildingId === asset.buildingId).length;

      document.getElementById('restock-preview-name').textContent = asset.name;
      document.getElementById('restock-preview-code').textContent = asset.code;
      document.getElementById('restock-preview-brand-model').textContent = `${asset.brand || '---'} / ${asset.model || 'Tiêu chuẩn'}`;
      document.getElementById('restock-preview-building').textContent = bld ? bld.name.split(' - ')[0] : 'Cơ sở';
      document.getElementById('restock-preview-unitprice').textContent = formatVND(asset.price || 0);
      document.getElementById('restock-preview-current-stock').textContent = `${inStockCount} cái trong kho`;

      const priceInput = document.getElementById('modal-restock-price');
      if (priceInput && !priceInput.value) {
        priceInput.placeholder = asset.price ? String(asset.price) : '0';
      }

      calculateRestockPreview();
    }

    function setRestockQty(num) {
      const input = document.getElementById('modal-restock-qty');
      if (input) {
        input.value = num;
        calculateRestockPreview();
      }
    }

    function calculateRestockPreview() {
      const assetId = document.getElementById('modal-restock-asset-id')?.value;
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      const qty = Math.max(1, parseInt(document.getElementById('modal-restock-qty')?.value) || 1);
      const customPriceVal = document.getElementById('modal-restock-price')?.value;
      const unitPrice = (customPriceVal && !isNaN(customPriceVal)) ? parseInt(customPriceVal) : (asset.price || 0);
      const totalPrice = qty * unitPrice;

      const rawCode = asset.code.replace(/-\\d+$/, '');
      const codePreview = qty === 1 ? `${rawCode}-01` : `${rawCode}-01 ... ${rawCode}-${String(qty).padStart(2, '0')}`;

      document.getElementById('restock-summary-codes').textContent = codePreview;
      document.getElementById('restock-summary-total').textContent = formatVND(totalPrice);
    }

    function handleRestockSubmit(e) {
      e.preventDefault();
      const assetId = document.getElementById('modal-restock-asset-id').value;
      const qty = parseInt(document.getElementById('modal-restock-qty').value) || 1;
      const customPrice = document.getElementById('modal-restock-price').value;
      const notes = document.getElementById('modal-restock-notes').value.trim();

      const result = DataStore.restockAsset(assetId, qty, customPrice ? parseInt(customPrice) : null, notes);

      if (!result.success) {
        alert(result.error || 'Có lỗi khi nhập thêm số lượng!');
        return;
      }

      closeModal('restockAssetModal');
      showToast(`🎉 Đã nhập bổ sung ${result.count} sản phẩm [${result.source.name}] vào kho lưu trữ!`);
      renderAssetsTable();
      renderApartmentRoomsGrid();
      updateMetrics();
    }

    // =========================================================================
    // 9. MODAL 3: GÁN TÀI SẢN VÀO CĂN HỘ (ASSIGN ASSET)
    // =========================================================================
    function openAssignAssetModal(preSelectedRoomId = null, preSelectedAssetId = null) {
      loadAssignRoomDropdown(preSelectedRoomId);
      loadAssignAssetTypeFilter();
      filterAvailableAssetsForAssign(preSelectedAssetId);

      openModal('assignAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function quickAssignAsset(assetId) {
      openAssignAssetModal(null, assetId);
    }

    function loadAssignRoomDropdown(preSelectedRoomId) {
      const select = document.getElementById('modal-assign-room');
      if (!select) return;

      const currentBldId = DataStore.getCurrentBuilding();
      let rooms = DataStore.getRooms();
      const assets = DataStore.getAssets();

      if (currentBldId !== 'ALL') {
        rooms = rooms.filter(r => r.buildingId === currentBldId);
      }

      const chkOnlyEmpty = document.getElementById('modal-filter-only-empty-rooms');
      const filterOnlyEmpty = chkOnlyEmpty ? chkOnlyEmpty.checked : true;

      const emptyRooms = rooms.filter(r => {
        const roomAssets = assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber);
        return roomAssets.length === 0;
      });

      let displayRooms = filterOnlyEmpty ? emptyRooms : rooms;

      if (preSelectedRoomId && !displayRooms.some(r => r.id === preSelectedRoomId)) {
        const preRoom = rooms.find(r => r.id === preSelectedRoomId);
        if (preRoom) displayRooms = [preRoom, ...displayRooms];
      }

      if (displayRooms.length === 0) {
        select.innerHTML = '<option value="" disabled selected>-- Không có phòng nào chưa có thiết bị trong cơ sở này --</option>';
        const infoEl = document.getElementById('modal-assign-room-info');
        if (infoEl) {
          infoEl.innerHTML = '<span class="text-amber-600 font-semibold">⚠️ Tất cả phòng trong cơ sở đã có đồ. Bỏ chọn "Chỉ hiện phòng chưa có đồ" nếu muốn gán bổ sung.</span>';
        }
        return;
      }

      select.innerHTML = '<option value="">-- Chọn căn hộ / phòng (chưa có đồ) --</option>' + displayRooms.map(r => {
        const roomAssets = assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber);
        const hasItems = roomAssets.length > 0;
        return `
          <option value="${r.id}" ${preSelectedRoomId === r.id ? 'selected' : ''}>
            Phòng ${r.roomNumber} (${r.type} • Tầng ${r.floor}) - ${hasItems ? `Đã có ${roomAssets.length} thiết bị` : 'Chưa có đồ'} • ${r.status === 'OCCUPIED' ? `Đang thuê [${r.tenant}]` : 'Phòng trống'}
          </option>
        `;
      }).join('');

      if (preSelectedRoomId) {
        select.value = preSelectedRoomId;
      }

      onAssignRoomChanged();
    }

    function onAssignRoomChanged() {
      const roomId = document.getElementById('modal-assign-room')?.value;
      const room = DataStore.getRooms().find(r => r.id === roomId);
      const infoEl = document.getElementById('modal-assign-room-info');
      if (!infoEl) return;

      if (room) {
        const assets = DataStore.getAssets().filter(a => a.roomId === room.id || a.roomNumber === room.roomNumber);
        if (assets.length === 0) {
          infoEl.innerHTML = `✓ Đã chọn phòng <b>${room.roomNumber}</b> (${room.type} • Tầng ${room.floor}) • <span class="text-emerald-700 font-bold">Chưa có đồ (Sẵn sàng nhận thiết bị)</span> • ${room.status === 'OCCUPIED' ? 'Đang thuê: ' + room.tenant : 'Phòng trống'}`;
          infoEl.className = 'text-[11px] text-teal-700 font-medium mt-0.5';
        } else {
          infoEl.innerHTML = `⚠️ Lưu ý: Phòng <b>${room.roomNumber}</b> hiện đã có <b>${assets.length} thiết bị</b>!`;
          infoEl.className = 'text-[11px] text-amber-600 font-medium mt-0.5';
        }
      } else {
        const currentBldId = DataStore.getCurrentBuilding();
        let rooms = DataStore.getRooms();
        if (currentBldId !== 'ALL') rooms = rooms.filter(r => r.buildingId === currentBldId);
        const assets = DataStore.getAssets();
        const emptyCount = rooms.filter(r => assets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber).length === 0).length;
        const chkOnlyEmpty = document.getElementById('modal-filter-only-empty-rooms');
        const onlyEmpty = chkOnlyEmpty ? chkOnlyEmpty.checked : true;

        if (onlyEmpty) {
          infoEl.innerHTML = `💡 Đang lọc chỉ hiển thị <b>${emptyCount} phòng chưa có đồ</b> để gán thiết bị`;
          infoEl.className = 'text-[11px] text-teal-700 mt-0.5';
        } else {
          infoEl.innerHTML = `Chọn phòng cần trang bị tài sản (${emptyCount} phòng chưa có đồ)`;
          infoEl.className = 'text-[11px] text-slate-500 mt-0.5';
        }
      }
    }

    function loadAssignAssetTypeFilter() {
      const select = document.getElementById('modal-assign-filter-type');
      const types = DataStore.getAssetTypes();
      select.innerHTML = '<option value="ALL">-- Tất cả loại tài sản có trong kho --</option>' + types.map(t => `
        <option value="${t.code}">${t.name} (${t.code})</option>
      `).join('');
    }

    function filterAvailableAssetsForAssign(preSelectedAssetId = null) {
      const typeFilter = document.getElementById('modal-assign-filter-type').value;
      const assetSelect = document.getElementById('modal-assign-asset-select');
      const currentBldId = DataStore.getCurrentBuilding();

      let availableAssets = DataStore.getAssets().filter(a => a.allocationStatus === 'IN_STOCK');

      if (currentBldId !== 'ALL') {
        availableAssets = availableAssets.filter(a => a.buildingId === currentBldId);
      }

      if (typeFilter !== 'ALL') {
        availableAssets = availableAssets.filter(a => a.typeCode === typeFilter);
      }

      document.getElementById('modal-stock-count-info').textContent = `${availableAssets.length} thiết bị sẵn sàng`;

      if (availableAssets.length === 0) {
        assetSelect.innerHTML = '<option value="">-- Kho hiện không còn thiết bị thuộc loại này --</option>';
        document.getElementById('modal-assign-asset-detail').textContent = 'Vui lòng chọn loại khác hoặc bấm "Thêm Tài Sản Mới" để nhập thêm.';
        return;
      }

      assetSelect.innerHTML = '<option value="">-- Chọn thiết bị cụ thể cần gán --</option>' + availableAssets.map(a => `
        <option value="${a.id}" ${preSelectedAssetId === a.id ? 'selected' : ''}>
          [${a.code}] ${a.name} (${a.brand || '---'}) - Tình trạng: ${a.condition || 'Mới'}
        </option>
      `).join('');

      assetSelect.onchange = function () {
        const selectedId = this.value;
        const item = availableAssets.find(a => a.id === selectedId);
        if (item) {
          document.getElementById('modal-assign-asset-detail').textContent = `Mã: ${item.code} • Giá: ${formatVND(item.price)} • Bảo hành: ${item.warrantyMonths}T • Tình trạng: ${item.condition}`;
        }
      };

      if (preSelectedAssetId) {
        assetSelect.value = preSelectedAssetId;
        assetSelect.dispatchEvent(new Event('change'));
      }
    }

    function handleAssignAssetSubmit(e) {
      e.preventDefault();
      const roomId = document.getElementById('modal-assign-room').value;
      const assetId = document.getElementById('modal-assign-asset-select').value;
      const notes = document.getElementById('modal-assign-notes').value.trim();

      if (!roomId) {
        alert('Vui lòng chọn căn hộ nhận thiết bị!');
        return;
      }
      if (!assetId) {
        alert('Vui lòng chọn thiết bị trong kho cần gán!');
        return;
      }

      const room = DataStore.getRooms().find(r => r.id === roomId);
      if (!room) {
        alert('Không tìm thấy thông tin căn hộ đã chọn!');
        return;
      }

      const chkOnlyEmpty = document.getElementById('modal-filter-only-empty-rooms');
      const filterOnlyEmpty = chkOnlyEmpty ? chkOnlyEmpty.checked : true;
      const roomAssets = DataStore.getAssets().filter(a => a.roomId === room.id || a.roomNumber === room.roomNumber);

      if (filterOnlyEmpty && roomAssets.length > 0) {
        alert(\`Phòng \${room.roomNumber} hiện đã có \${roomAssets.length} thiết bị! Vui lòng chỉ chọn phòng chưa có đồ để gán.\`);
        return;
      }

      const result = DataStore.assignAssetToRoom({
        assetId: assetId,
        buildingId: room.buildingId,
        roomId: room.id,
        roomNumber: room.roomNumber,
        notes: notes
      });

      if (!result.success) {
        alert(result.error);
        return;
      }

      closeModal('assignAssetModal');
      showToast(\`🎉 Gán thành công tài sản \${result.asset.code} vào căn hộ \${room.roomNumber}!\`);

      renderAssetsTable();
      renderApartmentRoomsGrid();
      renderAssignmentsTable();
      updateMetrics();
    }

    // =========================================================================
    // 10. THAO TÁC THU HỒI & XÓA TÀI SẢN
    // =========================================================================
    function handleUnassignAsset(assetId) {
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      if (!confirm(\`Bạn có chắc chắn muốn thu hồi tài sản [\${asset.code}] (\${asset.name}) từ phòng \${asset.roomNumber} về kho lưu trữ?\`)) {
        return;
      }

      const result = DataStore.unassignAsset(assetId);
      if (result.success) {
        showToast(\`Đã thu hồi tài sản \${asset.code} về kho thiết bị!\`);
        renderAssetsTable();
        renderApartmentRoomsGrid();
        updateMetrics();
      }
    }

    function handleDeleteAsset(assetId) {
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      if (asset.allocationStatus === 'ASSIGNED') {
        alert(\`Không thể xóa tài sản [\${asset.code}] vì đang được trang bị tại phòng \${asset.roomNumber}. Vui lòng thu hồi về kho trước khi xóa!\`);
        return;
      }

      if (!confirm(\`Bạn có chắc chắn muốn xóa vĩnh viễn tài sản [\${asset.code}] (\${asset.name}) khỏi hệ thống?\`)) {
        return;
      }

      const result = DataStore.deleteAsset(assetId);
      if (result && result.success) {
        showToast(\`Đã xóa tài sản \${asset.code}!\`);
        renderAssetsTable();
        renderApartmentRoomsGrid();
        updateMetrics();
      } else {
        alert(result?.error || 'Có lỗi khi xóa tài sản!');
      }
    }

    // =========================================================================
    // KHỞI TẠO TRANG
    // =========================================================================
    registerPage('assets.html', () => {
      renderSidebar('assets.html');
      renderTopbar('Quản lý Tài sản thiết bị', 'Cơ sở / Trang thiết bị');
      loadAssetTypeDropdown();
      renderAssetsTable();
      updateMetrics();

      window.onFilterBuilding = function () {
        renderAssetsTable();
        if (currentTab === 'apartments') renderApartmentRoomsGrid();
        if (currentTab === 'history') renderAssignmentsTable();
        updateMetrics();
      };
    });
  </script>
</body>

</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('Successfully wrote redesigned assets.html! Size: ' + fs.statSync(targetPath).size);
