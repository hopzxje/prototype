const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../pages/property/assets.html');

// Read existing HTML template or build it cleanly
const html = `<!DOCTYPE html>
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
    /* Smooth transitions for accordion and drawer */
    .accordion-content {
      transition: max-height 0.25s ease-out, opacity 0.2s ease-out;
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

      <div class="p-6 max-w-7xl w-full mx-auto space-y-5">

        <!-- 1. Header Section matching user mockup -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Quản lý Thiết bị & Tài sản Căn hộ</span>
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Cơ sở: <span id="current-building-display" class="font-medium text-slate-700">StayHub Central - Quận 1</span> • Nhấp vào từng thiết bị để mở rộng danh sách chi tiết các phòng
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Nút Thêm thiết bị vào các phòng (Primary CTA Teal) -->
            <button onclick="openAssignAssetModal()"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Phân bổ thiết bị vào căn hộ">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Thêm thiết bị vào các phòng</span>
            </button>

            <!-- Nút Nhập Thêm Số Lượng (Secondary) -->
            <button onclick="openRestockModal()"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Nhập thêm số lượng tài sản vào kho">
              <i data-lucide="package-plus" class="w-4 h-4 text-slate-500"></i>
              <span>Nhập Thêm Số Lượng</span>
            </button>

            <!-- Nút Khai báo loại mới -->
            <button onclick="openCreateAssetModal()"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Khai báo loại thiết bị mới">
              <i data-lucide="folder-plus" class="w-4 h-4 text-slate-500"></i>
              <span>Tạo Loại Thiết Bị</span>
            </button>

            <!-- Quick Stats pill -->
            <div class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 shadow-xs">
              <span>Tổng thiết bị: <strong class="text-slate-900" id="header-stat-total">0</strong></span>
              <span class="text-slate-300">|</span>
              <span class="text-emerald-700 font-semibold" id="header-stat-good">Tốt: 0</span>
              <span class="text-slate-300">|</span>
              <span class="text-rose-600 font-semibold" id="header-stat-issue">Sự cố: 0</span>
            </div>
          </div>
        </div>

        <!-- 2. Filter & View Switcher Bar (Mockup Style) -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-3">
          <!-- Row 1: Search Input + Segmented View Switcher -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div class="relative flex-1">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <input type="text" id="asset-search" oninput="onFilterChange()"
                placeholder="Tìm theo tên thiết bị, phòng, mã tài sản, số serial..."
                class="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-[#0F766E] focus:bg-white transition-all">
            </div>

            <!-- View Switcher -->
            <div class="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs shrink-0">
              <button id="view-btn-types" onclick="switchViewMode('types')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-[#0F766E] text-white shadow-xs transition-all cursor-pointer">
                <i data-lucide="package" class="w-3.5 h-3.5"></i>
                <span>Theo Loại Thiết Bị</span>
              </button>
              <button id="view-btn-rooms" onclick="switchViewMode('rooms')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
                <i data-lucide="home" class="w-3.5 h-3.5"></i>
                <span>Theo Phòng</span>
              </button>
              <button id="view-btn-flat" onclick="switchViewMode('flat')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
                <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
                <span>Bảng phẳng</span>
              </button>
            </div>
          </div>

          <!-- Row 2: Status Filters + Expand/Collapse All -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-slate-500 font-medium mr-1">Tình trạng:</span>
              <button onclick="setStatusFilter('ALL')" id="filter-status-ALL"
                class="px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer transition-colors">Tất cả</button>
              <button onclick="setStatusFilter('GOOD')" id="filter-status-GOOD"
                class="px-2.5 py-1 rounded-md font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Tốt</button>
              <button onclick="setStatusFilter('DAMAGED')" id="filter-status-DAMAGED"
                class="px-2.5 py-1 rounded-md font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Hư hỏng</button>
              <button onclick="setStatusFilter('REPAIRING')" id="filter-status-REPAIRING"
                class="px-2.5 py-1 rounded-md font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Đang sửa</button>
              <button onclick="setStatusFilter('INACTIVE')" id="filter-status-INACTIVE"
                class="px-2.5 py-1 rounded-md font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Ngừng sử dụng</button>
            </div>

            <div class="flex items-center gap-2 text-slate-500">
              <button onclick="expandAllTypeCards()" class="hover:text-[#0F766E] font-medium transition-colors cursor-pointer">Mở rộng tất cả</button>
              <span>•</span>
              <button onclick="collapseAllTypeCards()" class="hover:text-[#0F766E] font-medium transition-colors cursor-pointer">Thu gọn tất cả</button>
            </div>
          </div>
        </div>

        <!-- 3. VIEW MODE 1: THEO LOẠI THIẾT BỊ (CARD LIST WITH ACCORDION DETAILS) -->
        <div id="view-content-types" class="space-y-3">
          <!-- Dynamically Rendered Category Cards -->
          <div id="asset-type-cards-container" class="space-y-3">
            <!-- Cards will be rendered by renderAssetTypeCards() -->
          </div>
        </div>

        <!-- 4. VIEW MODE 2: THEO PHÒNG (APARTMENT ROOMS GRID) -->
        <div id="view-content-rooms" class="hidden space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-500 font-medium">Bộ lọc phòng:</span>
              <button onclick="setApartmentEquipFilter('ALL')" id="filter-room-equip-all"
                class="px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer">Tất cả phòng</button>
              <button onclick="setApartmentEquipFilter('EQUIPPED')" id="filter-room-equip-equipped"
                class="px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer">Đã có đồ</button>
              <button onclick="setApartmentEquipFilter('EMPTY')" id="filter-room-equip-empty"
                class="px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer">Chưa có đồ (Cần trang bị)</button>
            </div>
            <span class="text-xs text-slate-400">Bấm vào từng phòng để xem danh sách hoặc gán thêm thiết bị</span>
          </div>

          <div id="apartment-rooms-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Rendered by renderApartmentRoomsGrid() -->
          </div>
        </div>

        <!-- 5. VIEW MODE 3: BẢNG PHẲNG (FLAT MASTER INVENTORY TABLE) -->
        <div id="view-content-flat" class="hidden space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700">Danh sách tài sản chi tiết từng mã serial</span>
              <span class="text-xs text-slate-400" id="flat-table-count">0 tài sản</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <th class="py-3 px-4">Mã & Loại tài sản</th>
                    <th class="py-3 px-4">Tên thiết bị & Model</th>
                    <th class="py-3 px-4">Vị trí hiện tại</th>
                    <th class="py-3 px-4">Nguyên giá mua</th>
                    <th class="py-3 px-4">Bảo hành & Hiện trạng</th>
                    <th class="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody id="assets-table-body" class="divide-y divide-slate-100">
                  <!-- Rendered by renderAssetsTable() -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- SLIDE-OVER DRAWER: HỒ SƠ CHI TIẾT TÀI SẢN -->
  <div id="asset-detail-drawer" class="fixed inset-0 z-50 pointer-events-none transition-all duration-300">
    <div id="drawer-backdrop" onclick="closeAssetDrawer()"
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 transition-opacity duration-300 pointer-events-none"></div>

    <div id="drawer-panel"
      class="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out pointer-events-auto">
      <!-- Drawer Header -->
      <div class="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span id="drawer-asset-code" class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">AC-001</span>
            <span id="drawer-asset-type" class="text-xs text-slate-500 font-medium">Điều hòa</span>
          </div>
          <h3 id="drawer-asset-name" class="text-base font-bold text-slate-900 leading-snug">Điều hòa Inverter Daikin 1.5 HP</h3>
          <p id="drawer-asset-model" class="text-xs text-slate-500 mt-0.5">Daikin • Model: FTKQ35SVMV</p>
        </div>
        <button onclick="closeAssetDrawer()"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Drawer Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        <!-- Vị trí hiện tại -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vị trí hiện tại</span>
              <span id="drawer-location-name" class="text-sm font-bold text-slate-900 block mt-0.5">Phòng P201</span>
              <span id="drawer-building-name" class="text-xs text-slate-500">StayHub Central - Quận 1</span>
            </div>
            <span id="drawer-location-badge" class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đang trong phòng
            </span>
          </div>
        </div>

        <!-- Thông số kỹ thuật & Nguyên giá -->
        <div>
          <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">Thông số & Nguyên giá</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-slate-400 text-[11px] block">Nguyên giá mua:</span>
              <span id="drawer-asset-price" class="font-extrabold text-sm text-slate-900 block mt-0.5">11.500.000 đ</span>
              <span id="drawer-asset-date" class="text-[10px] text-slate-400 block mt-0.5">Ngày mua: 10/01/2025</span>
            </div>
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-slate-400 text-[11px] block">Thời hạn bảo hành:</span>
              <span id="drawer-asset-warranty" class="font-bold text-slate-800 block mt-0.5">24 tháng</span>
              <span class="text-[10px] text-emerald-600 font-medium block mt-0.5">Bảo hành chính hãng</span>
            </div>
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-slate-400 text-[11px] block">Tình trạng vật lý:</span>
              <span id="drawer-asset-condition" class="font-bold text-slate-800 block mt-0.5">Tốt</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">Đã qua kiểm định</span>
            </div>
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-slate-400 text-[11px] block">Lần gán gần nhất:</span>
              <span id="drawer-assigned-at" class="font-bold text-slate-800 block mt-0.5">15/01/2025</span>
              <span id="drawer-assigned-by" class="text-[10px] text-slate-400 block mt-0.5">Bởi: Phạm Tuấn Anh</span>
            </div>
          </div>
        </div>

        <!-- Lịch sử điều chuyển -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i data-lucide="history" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>Lịch sử điều chuyển</span>
            </h4>
            <span id="drawer-history-count" class="text-slate-400 text-[11px]">1 lần</span>
          </div>
          <div id="drawer-history-timeline" class="space-y-2 border-l-2 border-teal-500/40 ml-2 pl-4">
            <!-- Timeline items rendered here -->
          </div>
        </div>
      </div>

      <!-- Drawer Footer Actions -->
      <div id="drawer-footer-actions" class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
        <!-- Dynamic Action buttons -->
      </div>
    </div>
  </div>

  <!-- MODAL 1: BÀN GIAO / GÁN THIẾT BỊ VÀO PHÒNG -->
  <div id="assignAssetModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900">Bàn Giao Thiết Bị Vào Căn Hộ</h3>
          <p class="text-xs text-slate-500">Chọn thiết bị trong kho và căn hộ nhận bàn giao</p>
        </div>
        <button onclick="closeModal('assignAssetModal')"
          class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="assignAssetForm" onsubmit="handleAssignSubmit(event)" class="mt-4 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Cơ sở bàn giao <span class="text-rose-500">*</span></label>
          <select id="modal-assign-building" onchange="onAssignBuildingChange()"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            <!-- Options populated by JS -->
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Thiết bị sẵn sàng trong kho <span class="text-rose-500">*</span></label>
          <select id="modal-assign-asset"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            <!-- Options populated by JS -->
          </select>
          <p class="text-[11px] text-slate-400 mt-1">Chỉ hiển thị các tài sản đang ở trạng thái Tồn Kho tại cơ sở đã chọn</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="font-semibold text-slate-700">Căn hộ / Phòng nhận thiết bị <span class="text-rose-500">*</span></label>
            <label class="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[#0F766E]">
              <input type="checkbox" id="modal-filter-only-empty-rooms" onchange="loadRoomsForAssignModal()"
                class="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]">
              <span>Chỉ hiện phòng chưa có đồ</span>
            </label>
          </div>
          <select id="modal-assign-room"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            <!-- Options populated by JS with 'Chưa có đồ (Sẵn sàng nhận thiết bị)' -->
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ghi chú bàn giao / Tình trạng khi gán</label>
          <textarea id="modal-assign-notes" rows="2"
            placeholder="Ví dụ: Thiết bị mới 100%, kèm điều khiển từ xa, tem niêm phong nguyên vẹn..."
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] resize-none">Bàn giao trang bị vào phòng đầy đủ phụ kiện, hoạt động bình thường</textarea>
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

  <!-- MODAL 2: NHẬP THÊM SỐ LƯỢNG (RESTOCK ASSET MODAL) -->
  <div id="restockAssetModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900">Nhập Thêm Số Lượng</h3>
          <p class="text-xs text-slate-500">Tăng số lượng thiết bị có sẵn vào kho lưu trữ</p>
        </div>
        <button onclick="closeModal('restockAssetModal')"
          class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="restockAssetForm" onsubmit="handleRestockSubmit(event)" class="mt-4 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Chọn mẫu tài sản gốc <span class="text-rose-500">*</span></label>
          <select id="modal-restock-target-asset"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            <!-- Options populated by JS -->
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Số lượng nhập thêm (chiếc) <span class="text-rose-500">*</span></label>
          <input type="number" id="modal-asset-quantity" min="1" max="100" value="5"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-bold text-slate-900" required>
          <p class="text-[11px] text-slate-400 mt-1">Hệ thống sẽ tự động sinh mã định danh và lưu trữ vào kho của cơ sở</p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Đơn giá nhập mới (VNĐ) <span class="text-rose-500">*</span></label>
          <input type="number" id="modal-restock-price" min="0" step="50000" value="11500000"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ghi chú đợt nhập hàng</label>
          <textarea id="modal-restock-notes" rows="2"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] resize-none">Nhập bổ sung đợt mới</textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeModal('restockAssetModal')"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer">
            Hủy Bỏ
          </button>
          <button type="submit"
            class="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="package-plus" class="w-4 h-4"></i>
            <span>Nhập Thêm Số Lượng</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 3: TẠO MỚI LOẠI THIẾT BỊ THEO LÔ -->
  <div id="createAssetModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900">Khai Báo Thiết Bị Mới</h3>
          <p class="text-xs text-slate-500">Tạo tài sản theo danh mục chuẩn và sinh mã tự động</p>
        </div>
        <button onclick="closeModal('createAssetModal')"
          class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="createAssetForm" onsubmit="handleCreateAssetSubmit(event)" class="mt-4 space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Cơ sở lưu trữ <span class="text-rose-500">*</span></label>
            <select id="modal-create-building"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nhóm danh mục chuẩn <span class="text-rose-500">*</span></label>
            <select id="modal-create-type" onchange="onAssetTypeSelected()"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium" required>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tiền tố mã quản lý (Prefix) <span class="text-rose-500">*</span></label>
            <input type="text" id="modal-create-code" value="AC-NEW"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-mono font-bold uppercase" required>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Số lượng nhập ban đầu (chiếc) <span class="text-rose-500">*</span></label>
            <input type="number" id="modal-create-quantity" min="1" max="100" value="1"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-bold text-slate-900" required>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Tên thiết bị hiển thị <span class="text-rose-500">*</span></label>
          <input type="text" id="modal-create-name" placeholder="Ví dụ: Điều hòa Inverter Daikin 1.5 HP"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E]" required>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Hãng sản xuất (Brand)</label>
            <input type="text" id="modal-create-brand" placeholder="Ví dụ: Daikin, Toshiba, Panasonic..."
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E]">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Model / Thông số</label>
            <input type="text" id="modal-create-model" placeholder="Ví dụ: FTKQ35SVMV, GR-B22VU..."
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E]">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nguyên giá mua (VNĐ)</label>
            <input type="number" id="modal-create-price" value="8500000" step="50000"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E] font-medium">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Thời hạn bảo hành (tháng)</label>
            <input type="number" id="modal-create-warranty" value="24"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-[#0F766E]">
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeModal('createAssetModal')"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer">
            Hủy Bỏ
          </button>
          <button type="submit"
            class="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Tạo & Lưu Vào Kho</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MAIN SCRIPT LOGIC -->
  <script data-stayhub-page="assets.html">
    let currentViewMode = 'types'; // 'types' | 'rooms' | 'flat'
    let currentStatusFilter = 'ALL'; // 'ALL' | 'GOOD' | 'DAMAGED' | 'REPAIRING' | 'INACTIVE'
    let aptEquipFilter = 'ALL'; // 'ALL' | 'EQUIPPED' | 'EMPTY'
    let openedAccordionTypes = new Set(); // Stores expanded type codes

    // Map Category Icon
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

    // Format Currency
    function formatVND(num) {
      return (num || 0).toLocaleString('vi-VN') + ' đ';
    }

    // Modal Helpers
    function openModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    }
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    }

    // =========================================================================
    // 1. Chuyển đổi View Mode ('types' | 'rooms' | 'flat')
    // =========================================================================
    function switchViewMode(mode) {
      currentViewMode = mode;
      const modes = ['types', 'rooms', 'flat'];

      modes.forEach(m => {
        const btn = document.getElementById('view-btn-' + m);
        const content = document.getElementById('view-content-' + m);
        if (btn && content) {
          if (m === mode) {
            btn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-[#0F766E] text-white shadow-xs transition-all cursor-pointer';
            content.classList.remove('hidden');
          } else {
            btn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
            content.classList.add('hidden');
          }
        }
      });

      if (mode === 'types') renderAssetTypeCards();
      if (mode === 'rooms') renderApartmentRoomsGrid();
      if (mode === 'flat') renderAssetsTable();
    }

    // Status filter
    function setStatusFilter(filter) {
      currentStatusFilter = filter;
      const filters = ['ALL', 'GOOD', 'DAMAGED', 'REPAIRING', 'INACTIVE'];
      filters.forEach(f => {
        const btn = document.getElementById('filter-status-' + f);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer transition-colors';
          } else {
            btn.className = 'px-2.5 py-1 rounded-md font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors';
          }
        }
      });
      renderCurrentView();
    }

    function onFilterChange() {
      renderCurrentView();
    }

    function renderCurrentView() {
      updateMetrics();
      if (currentViewMode === 'types') renderAssetTypeCards();
      else if (currentViewMode === 'rooms') renderApartmentRoomsGrid();
      else if (currentViewMode === 'flat') renderAssetsTable();
    }

    // Expand / Collapse all accordions
    function expandAllTypeCards() {
      const allTypes = getAggregatedAssetTypes();
      allTypes.forEach(t => openedAccordionTypes.add(t.typeCode));
      renderAssetTypeCards();
    }

    function collapseAllTypeCards() {
      openedAccordionTypes.clear();
      renderAssetTypeCards();
    }

    function toggleTypeAccordion(typeCode) {
      if (openedAccordionTypes.has(typeCode)) {
        openedAccordionTypes.delete(typeCode);
      } else {
        openedAccordionTypes.add(typeCode);
      }
      renderAssetTypeCards();
    }

    // =========================================================================
    // 2. TỔNG HỢP & GOM NHÓM THEO LOẠI THIẾT BỊ (THEO ẢNH MẪU CỦA USER)
    // =========================================================================
    function getAggregatedAssetTypes() {
      const currentBldId = DataStore.getCurrentBuilding();
      const allAssets = DataStore.getAssets();
      const search = (document.getElementById('asset-search')?.value || '').toLowerCase().trim();

      // Lọc theo cơ sở hiện tại
      let filteredAssets = allAssets;
      if (currentBldId !== 'ALL') {
        filteredAssets = filteredAssets.filter(a => a.buildingId === currentBldId);
      }

      // Lấy danh mục chuẩn từ DataStore.getAssetTypes()
      const registeredTypes = DataStore.getAssetTypes ? DataStore.getAssetTypes() : [];
      const typeMap = new Map();

      // Khởi tạo type map từ registered types
      registeredTypes.forEach(rt => {
        typeMap.set(rt.code, {
          typeCode: rt.code,
          typeName: rt.name,
          defaultBrand: rt.defaultBrand || '',
          icon: rt.icon || getAssetTypeIcon(rt.code),
          items: []
        });
      });

      // Bổ sung assets vào từng nhóm
      filteredAssets.forEach(asset => {
        const code = asset.typeCode || 'OTHER';
        if (!typeMap.has(code)) {
          typeMap.set(code, {
            typeCode: code,
            typeName: asset.typeName || code,
            defaultBrand: asset.brand || '',
            icon: getAssetTypeIcon(code),
            items: []
          });
        }
        typeMap.get(code).items.push(asset);
      });

      // Chuyển sang array
      let result = Array.from(typeMap.values());

      // Lọc theo Status nếu khác ALL
      if (currentStatusFilter !== 'ALL') {
        result = result.filter(group => {
          return group.items.some(item => {
            const isGood = item.condition === 'Tốt' || item.condition === 'Mới 100%' || !item.condition;
            if (currentStatusFilter === 'GOOD') return isGood;
            if (currentStatusFilter === 'DAMAGED') return item.condition === 'Hỏng';
            if (currentStatusFilter === 'REPAIRING') return item.status === 'MAINTENANCE' || item.condition === 'Đang sửa';
            if (currentStatusFilter === 'INACTIVE') return item.status === 'INACTIVE';
            return true;
          });
        });
      }

      // Lọc theo Search keyword
      if (search) {
        result = result.filter(group => {
          const matchTypeName = (group.typeName || '').toLowerCase().includes(search);
          const matchItems = group.items.some(item =>
            (item.name || '').toLowerCase().includes(search) ||
            (item.code || '').toLowerCase().includes(search) ||
            (item.roomNumber || '').toLowerCase().includes(search) ||
            (item.model || '').toLowerCase().includes(search)
          );
          return matchTypeName || matchItems;
        });
      }

      return result;
    }

    // =========================================================================
    // 3. RENDER THẺ LOẠI THIẾT BỊ (THEO ĐÚNG ẢNH MẪU CỦA USER)
    // =========================================================================
    function renderAssetTypeCards() {
      const container = document.getElementById('asset-type-cards-container');
      if (!container) return;

      const groups = getAggregatedAssetTypes();

      if (groups.length === 0) {
        container.innerHTML = \`
          <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <i data-lucide="package-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            <p class="font-medium">Không tìm thấy loại thiết bị nào phù hợp với bộ lọc.</p>
          </div>
        \`;
        if (window.lucide) lucide.createIcons();
        return;
      }

      container.innerHTML = groups.map(group => {
        const items = group.items;
        const totalCount = items.length;
        const assignedItems = items.filter(i => i.allocationStatus === 'ASSIGNED');
        const assignedRoomsCount = new Set(assignedItems.map(i => i.roomNumber)).size;

        const goodCount = items.filter(i => (i.condition === 'Tốt' || i.condition === 'Mới 100%' || !i.condition) && i.status !== 'MAINTENANCE').length;
        const issueCount = totalCount - goodCount;

        const isExpanded = openedAccordionTypes.has(group.typeCode);
        const iconName = getAssetTypeIcon(group.typeCode);

        // Subtext description: Chỉ hiển thị tên / số phòng ở ngoài
        const stockCount = totalCount - assignedItems.length;
        const subtext = totalCount > 0
          ? \`Trang bị tại \${assignedRoomsCount} phòng trong cơ sở\${stockCount > 0 ? \` • \${stockCount} chiếc trong kho\` : ''}\`
          : \`Chưa có thiết bị nào được lưu kho hoặc phân bổ\`;

        // Render accordion expanded table
        let expandedHtml = '';
        if (isExpanded) {
          if (items.length === 0) {
            expandedHtml = \`
              <div class="px-5 py-4 border-t border-slate-100 bg-slate-50/50 text-slate-400 text-center">
                <p>Chưa có dữ liệu chi tiết cho loại thiết bị này.</p>
                <div class="mt-2.5 flex items-center justify-center gap-2">
                  <button onclick="quickRestockType('\${group.typeCode}')"
                    class="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg font-bold text-xs hover:bg-[#115E59] cursor-pointer">
                    + Nhập Thêm Số Lượng
                  </button>
                </div>
              </div>
            \`;
          } else {
            expandedHtml = \`
              <div class="border-t border-slate-100 bg-slate-50/40 p-4 space-y-3">
                <div class="flex items-center justify-between text-xs pb-1">
                  <span class="font-bold text-slate-700">Chi tiết phân bổ các căn hộ đang có thiết bị này:</span>
                  <div class="flex items-center gap-2">
                    <button onclick="quickAssignType('\${group.typeCode}')"
                      class="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1">
                      <i data-lucide="plus" class="w-3.5 h-3.5 text-slate-500"></i>
                      <span>Gán vào phòng khác</span>
                    </button>
                    <button onclick="quickRestockType('\${group.typeCode}')"
                      class="px-3 py-1 bg-white hover:bg-slate-50 text-[#0F766E] border border-teal-200 rounded-lg font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1">
                      <i data-lucide="package-plus" class="w-3.5 h-3.5"></i>
                      <span>Nhập Thêm Số Lượng</span>
                    </button>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100">
                        <th class="py-2.5 px-3.5">Vị trí phòng</th>
                        <th class="py-2.5 px-3.5">Mã thiết bị</th>
                        <th class="py-2.5 px-3.5">Model / Thông số</th>
                        <th class="py-2.5 px-3.5">Ngày kiểm tra</th>
                        <th class="py-2.5 px-3.5">Hiện trạng</th>
                        <th class="py-2.5 px-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      \${items.map(a => {
                        const isAssigned = a.allocationStatus === 'ASSIGNED';
                        const isGood = (a.condition === 'Tốt' || a.condition === 'Mới 100%' || !a.condition) && a.status !== 'MAINTENANCE';

                        const locBadge = isAssigned
                          ? \`<span class="inline-flex items-center gap-1 font-bold text-slate-900 bg-teal-50/70 border border-teal-200/60 px-2 py-0.5 rounded text-xs"><i data-lucide="home" class="w-3 h-3 text-[#0F766E]"></i> Phòng \${a.roomNumber}</span>\`
                          : \`<span class="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs"><i data-lucide="warehouse" class="w-3 h-3"></i> Tồn kho lưu trữ</span>\`;

                        const condBadge = isGood
                          ? \`<span class="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded text-[11px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Tốt</span>\`
                          : \`<span class="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded text-[11px]"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Sự cố</span>\`;

                        return \`
                          <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-2.5 px-3.5">\${locBadge}</td>
                            <td class="py-2.5 px-3.5 font-mono font-bold text-slate-800">\${a.code}</td>
                            <td class="py-2.5 px-3.5 text-slate-700 font-medium">\${a.name} <span class="text-slate-400 font-mono text-[11px]">• Model: \${a.model || 'Tiêu chuẩn'}</span></td>
                            <td class="py-2.5 px-3.5">
                              <span class="font-medium text-slate-700 block">\${a.lastChecked || '27/09/2026'}</span>
                              <span class="text-[10px] text-slate-400 block">\${isAssigned ? 'Bàn giao: ' + (a.assignedAt || '15/01/2025') : 'Tồn kho'}</span>
                            </td>
                            <td class="py-2.5 px-3.5">\${condBadge}</td>
                            <td class="py-2.5 px-3.5 text-right">
                              <div class="flex items-center justify-end gap-1.5">
                                <button onclick="openAssetDrawer('\${a.id}')"
                                  class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer">
                                  Hồ sơ
                                </button>
                                \${isAssigned ? \`
                                  <button onclick="handleUnassignAsset('\${a.id}')" title="Thu hồi về kho"
                                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer">
                                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                                  </button>
                                \` : \`
                                  <button onclick="quickAssignAsset('\${a.id}')" title="Gán vào phòng"
                                    class="p-1 rounded text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer">
                                    <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
                                  </button>
                                \`}
                              </div>
                            </td>
                          </tr>
                        \`;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            \`;
          }
        }

        return \`
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all overflow-hidden">
            <!-- Card Header matching user mockup -->
            <div onclick="toggleTypeAccordion('\${group.typeCode}')"
              class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none">

              <!-- Left Info -->
              <div class="flex items-center gap-3.5 min-w-0">
                <!-- Mint Round Icon -->
                <div class="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shrink-0">
                  <i data-lucide="\${iconName}" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-900 text-sm tracking-tight">\${group.typeName}</span>
                    <span class="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-full">
                      \${totalCount} chiếc
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">\${subtext}</p>
                </div>
              </div>

              <!-- Right Actions & Badges -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center" onclick="event.stopPropagation()">
                <!-- Badges -->
                <div class="flex items-center gap-1.5">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    \${goodCount} Tốt
                  </span>
                  \${issueCount > 0 ? \`
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                      \${issueCount} Sự cố
                    </span>
                  \` : ''}
                </div>

                <!-- Action Button 1: Thêm vào phòng khác -->
                <button onclick="quickAssignType('\${group.typeCode}')"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer shadow-2xs transition-colors">
                  <i data-lucide="plus" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>Thêm vào phòng khác</span>
                </button>

                <!-- Action Button 2: Xem chi tiết > -->
                <button onclick="toggleTypeAccordion('\${group.typeCode}')"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50/60 hover:bg-teal-50 border border-teal-200/80 rounded-lg cursor-pointer shadow-2xs transition-colors">
                  <span>\${isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
                  <i data-lucide="\${isExpanded ? 'chevron-up' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                </button>
              </div>

            </div>

            <!-- Accordion Content -->
            \${expandedHtml}
          </div>
        \`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    // Quick helpers from type card
    function quickAssignType(typeCode) {
      openAssignAssetModal(typeCode);
    }

    function quickRestockType(typeCode) {
      openRestockModal(typeCode);
    }

    // =========================================================================
    // 4. VIEW MODE 2: LƯỚI PHÒNG (THEO PHÒNG)
    // =========================================================================
    function setApartmentEquipFilter(filter) {
      aptEquipFilter = filter;
      ['all', 'empty', 'equipped'].forEach(f => {
        const btn = document.getElementById('filter-room-equip-' + f);
        if (btn) {
          if (f.toUpperCase() === filter) {
            btn.className = 'px-2.5 py-1 rounded-md font-bold bg-[#0F766E] text-white cursor-pointer';
          } else {
            btn.className = 'px-2.5 py-1 rounded-md font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer';
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
        container.innerHTML = \`
          <div class="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <i data-lucide="home" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
            <p class="font-medium text-xs">Không tìm thấy căn hộ nào phù hợp với bộ lọc.</p>
          </div>
        \`;
        if (window.lucide) lucide.createIcons();
        return;
      }

      container.innerHTML = rooms.map(room => {
        const roomAssets = assets.filter(a => a.roomId === room.id || a.roomNumber === room.roomNumber);
        const hasEquip = roomAssets.length > 0;
        const isOccupied = room.status === 'OCCUPIED';

        const statusBadge = isOccupied
          ? \`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đang thuê</span>\`
          : \`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Trống</span>\`;

        let equipListHtml = '';
        if (hasEquip) {
          equipListHtml = \`
            <div class="space-y-1.5 my-3">
              \${roomAssets.map(a => \`
                <div onclick="openAssetDrawer('\${a.id}')"
                  class="p-2 rounded-lg bg-slate-50 hover:bg-teal-50/60 border border-slate-100 hover:border-teal-200/70 flex items-center justify-between text-xs transition-colors cursor-pointer">
                  <div class="flex items-center gap-2 min-w-0">
                    <i data-lucide="\${getAssetTypeIcon(a.typeCode)}" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                    <span class="font-medium text-slate-800 truncate">\${a.name}</span>
                  </div>
                  <span class="font-mono text-[10px] text-slate-400 shrink-0 ml-1.5">\${a.code}</span>
                </div>
              \`).join('')}
            </div>
          \`;
        } else {
          equipListHtml = \`
            <div class="my-4 p-3 rounded-xl bg-amber-50/50 border border-dashed border-amber-200 text-center">
              <i data-lucide="package-open" class="w-5 h-5 mx-auto text-amber-500 mb-1"></i>
              <p class="text-[11px] font-semibold text-amber-800">Chưa có đồ (Sẵn sàng nhận thiết bị)</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Cần bổ sung điều hòa, tủ lạnh, giường...</p>
            </div>
          \`;
        }

        const roomDisplay = room.roomNumber.startsWith('P') ? room.roomNumber : 'P' + room.roomNumber;

        return \`
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-md transition-all duration-200">
            <div>
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-bold text-slate-900 tracking-tight">\${roomDisplay}</span>
                    <span class="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">Tầng \${room.floor}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">\${room.type} · \${room.area} m²</p>
                </div>
                <div>\${statusBadge}</div>
              </div>

              <div class="flex items-center justify-between pt-2 pb-1 border-t border-slate-100 text-xs">
                <span class="text-slate-400 font-medium">Trang thiết bị:</span>
                <span class="font-bold \${hasEquip ? 'text-teal-800' : 'text-amber-700'}">
                  \${hasEquip ? \`\${roomAssets.length} thiết bị\` : 'Trống 0/4'}
                </span>
              </div>

              \${equipListHtml}
            </div>

            <div class="pt-3 border-t border-slate-100 mt-2">
              <button onclick="openAssignAssetModalForRoom('\${room.id}')"
                class="w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50 text-slate-700 hover:text-[#0F766E] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                <span>Gán thiết bị nhanh</span>
              </button>
            </div>
          </div>
        \`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    // =========================================================================
    // 5. VIEW MODE 3: BẢNG PHẲNG TẤT CẢ TÀI SẢN (FLAT TABLE)
    // =========================================================================
    function renderAssetsTable() {
      const tbody = document.getElementById('assets-table-body');
      if (!tbody) return;

      const currentBldId = DataStore.getCurrentBuilding();
      const q = (document.getElementById('asset-search')?.value || '').toLowerCase().trim();
      let assets = DataStore.getAssets();

      if (currentBldId !== 'ALL') {
        assets = assets.filter(a => a.buildingId === currentBldId);
      }

      if (q) {
        assets = assets.filter(a =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.model && a.model.toLowerCase().includes(q)) ||
          (a.roomNumber && a.roomNumber.toLowerCase().includes(q))
        );
      }

      const countEl = document.getElementById('flat-table-count');
      if (countEl) countEl.textContent = assets.length + ' tài sản';

      if (assets.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="6" class="p-8 text-center text-slate-400">
              <i data-lucide="package-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p class="font-medium">Không tìm thấy tài sản nào phù hợp với bộ lọc.</p>
            </td>
          </tr>
        \`;
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
          ? \`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
               <i data-lucide="home" class="w-3.5 h-3.5"></i>
               <span>Phòng \${a.roomNumber}</span>
             </span>\`
          : \`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
               <i data-lucide="warehouse" class="w-3.5 h-3.5"></i>
               <span>Kho thiết bị</span>
             </span>\`;

        return \`
          <tr onclick="openAssetDrawer('\${a.id}')"
            class="table-row-hover cursor-pointer border-b border-slate-100/90 transition-colors">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shrink-0">
                  <i data-lucide="\${iconName}" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="font-mono font-bold text-slate-900 block">\${a.code}</span>
                  <span class="text-[10px] text-slate-400 font-medium">\${a.typeName || a.typeCode} • \${bldName}</span>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="font-bold text-slate-900 block">\${a.name}</span>
              <span class="text-[11px] text-slate-500">\${a.brand || '---'} • Model: \${a.model || 'Tiêu chuẩn'}</span>
            </td>
            <td class="py-3.5 px-4">
              \${locationBadge}
            </td>
            <td class="py-3.5 px-4 font-mono">
              <span class="font-extrabold text-slate-900 block">\${formatVND(a.price || 0)}</span>
              <span class="text-[10px] text-slate-400 font-sans">Ngày mua: \${a.purchaseDate || '---'}</span>
            </td>
            <td class="py-3.5 px-4">
              <span class="font-semibold text-slate-700 block">\${a.warrantyMonths || 24} tháng BH</span>
              <span class="text-[11px] text-slate-500 font-medium">Tình trạng: \${a.condition || 'Mới 100%'}</span>
            </td>
            <td class="py-3.5 px-4 text-right" onclick="event.stopPropagation()">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="openAssetDrawer('\${a.id}')" title="Xem hồ sơ chi tiết"
                  class="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                  Chi tiết
                </button>
                \${!isAssigned ? \`
                  <button onclick="quickAssignAsset('\${a.id}')" title="Gán vào phòng"
                    class="p-1.5 rounded-md text-amber-700 hover:bg-amber-50 border border-amber-200/80 transition-colors cursor-pointer">
                    <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
                  </button>
                \` : \`
                  <button onclick="handleUnassignAsset('\${a.id}')" title="Thu hồi về kho"
                    class="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  </button>
                \`}
                <button onclick="handleDeleteAsset('\${a.id}')" title="Xóa tài sản này"
                  class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    }

    // =========================================================================
    // 6. THỐNG KÊ METRICS KPI TỔNG HỢP
    // =========================================================================
    function updateMetrics() {
      const currentBldId = DataStore.getCurrentBuilding();
      let assets = DataStore.getAssets();
      if (currentBldId !== 'ALL') {
        assets = assets.filter(a => a.buildingId === currentBldId);
      }

      const total = assets.length;
      const goodCount = assets.filter(a => (a.condition === 'Tốt' || a.condition === 'Mới 100%' || !a.condition) && a.status !== 'MAINTENANCE').length;
      const issueCount = total - goodCount;

      const elTotal = document.getElementById('header-stat-total');
      const elGood = document.getElementById('header-stat-good');
      const elIssue = document.getElementById('header-stat-issue');

      if (elTotal) elTotal.textContent = total;
      if (elGood) elGood.textContent = 'Tốt: ' + goodCount;
      if (elIssue) elIssue.textContent = 'Sự cố: ' + issueCount;

      // Update building name subtitle
      const bldDisplay = document.getElementById('current-building-display');
      if (bldDisplay) {
        if (currentBldId === 'ALL') {
          bldDisplay.textContent = 'Tất cả cơ sở StayHub';
        } else {
          const b = DataStore.getBuildings().find(x => x.id === currentBldId);
          bldDisplay.textContent = b ? b.name : 'StayHub Central - Quận 1';
        }
      }
    }

    // =========================================================================
    // 7. SLIDE-OVER DRAWER CHI TIẾT TÀI SẢN
    // =========================================================================
    function openAssetDrawer(assetId) {
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      const isAssigned = asset.allocationStatus === 'ASSIGNED';
      const building = DataStore.getBuildings().find(b => b.id === asset.buildingId);

      document.getElementById('drawer-asset-code').textContent = asset.code;
      document.getElementById('drawer-asset-type').textContent = asset.typeName || asset.typeCode;
      document.getElementById('drawer-asset-name').textContent = asset.name;
      document.getElementById('drawer-asset-model').textContent = (asset.brand || 'StayHub') + ' • Model: ' + (asset.model || 'Tiêu chuẩn');

      const locNameEl = document.getElementById('drawer-location-name');
      const bldNameEl = document.getElementById('drawer-building-name');
      const locBadgeEl = document.getElementById('drawer-location-badge');

      if (isAssigned) {
        locNameEl.textContent = 'Phòng ' + asset.roomNumber;
        bldNameEl.textContent = building ? building.name : 'StayHub';
        locBadgeEl.className = 'px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
        locBadgeEl.textContent = 'Đang trong phòng';
      } else {
        locNameEl.textContent = 'Kho lưu trữ thiết bị';
        bldNameEl.textContent = building ? building.name : 'StayHub';
        locBadgeEl.className = 'px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200';
        locBadgeEl.textContent = 'Sẵn sàng trong kho';
      }

      document.getElementById('drawer-asset-price').textContent = formatVND(asset.price || 0);
      document.getElementById('drawer-asset-date').textContent = 'Ngày mua: ' + (asset.purchaseDate || '---');
      document.getElementById('drawer-asset-warranty').textContent = (asset.warrantyMonths || 24) + ' tháng';
      document.getElementById('drawer-asset-condition').textContent = asset.condition || 'Tốt';
      document.getElementById('drawer-assigned-at').textContent = asset.assignedAt || '---';
      document.getElementById('drawer-assigned-by').textContent = 'Bởi: ' + (asset.assignedBy || 'Quản lý cơ sở');

      // Timeline lịch sử
      const timeline = document.getElementById('drawer-history-timeline');
      const assignments = DataStore.getAssetAssignments ? DataStore.getAssetAssignments().filter(h => h.assetId === asset.id || h.assetCode === asset.code) : [];
      document.getElementById('drawer-history-count').textContent = (assignments.length || 1) + ' lần';

      if (assignments.length === 0) {
        timeline.innerHTML = \`
          <div class="relative pb-2">
            <span class="font-bold text-slate-800 block text-xs">Khai báo thiết bị vào hệ thống</span>
            <span class="text-[11px] text-slate-400 block mt-0.5">\${asset.purchaseDate || '10/01/2025'}</span>
            <p class="text-[11px] text-slate-500 mt-1">Khởi tạo dữ liệu kiểm kê ban đầu</p>
          </div>
        \`;
      } else {
        timeline.innerHTML = assignments.map(h => \`
          <div class="relative pb-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-teal-900 text-xs">Bàn giao vào \${h.roomNumber}</span>
              <span class="text-[10px] text-slate-400">\${h.assignedAt}</span>
            </div>
            <p class="text-[11px] text-slate-600 mt-0.5">\${h.notes || 'Bàn giao nguyên vẹn'}</p>
            <span class="text-[10px] text-slate-400 block mt-0.5">Thực hiện: \${h.assignedBy}</span>
          </div>
        \`).join('');
      }

      // Footer Actions
      const footer = document.getElementById('drawer-footer-actions');
      if (isAssigned) {
        footer.innerHTML = \`
          <button onclick="handleUnassignAsset('\${asset.id}'); closeAssetDrawer();"
            class="px-4 py-2 border border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            <span>Thu Hồi Về Kho</span>
          </button>
          <button onclick="openRestockModal(); closeAssetDrawer();"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="package-plus" class="w-3.5 h-3.5"></i>
            <span>Nhập thêm</span>
          </button>
        \`;
      } else {
        footer.innerHTML = \`
          <button onclick="quickAssignAsset('\${asset.id}'); closeAssetDrawer();"
            class="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
            <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
            <span>Bàn Giao Vào Phòng</span>
          </button>
          <button onclick="openRestockModal(); closeAssetDrawer();"
            class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5">
            <i data-lucide="package-plus" class="w-3.5 h-3.5"></i>
            <span>Nhập thêm</span>
          </button>
        \`;
      }

      if (window.lucide) lucide.createIcons();

      // Open drawer
      document.getElementById('drawer-backdrop').classList.add('drawer-backdrop-open');
      document.getElementById('drawer-panel').classList.add('drawer-panel-open');
    }

    function closeAssetDrawer() {
      document.getElementById('drawer-backdrop').classList.remove('drawer-backdrop-open');
      document.getElementById('drawer-panel').classList.remove('drawer-panel-open');
    }

    // =========================================================================
    // 8. MODAL HANDLERS (ASSIGN, RESTOCK, CREATE)
    // =========================================================================
    function openAssignAssetModal(filterTypeCode) {
      const bldSelect = document.getElementById('modal-assign-building');
      const buildings = DataStore.getBuildings();
      const currentBldId = DataStore.getCurrentBuilding();

      bldSelect.innerHTML = buildings.map(b =>
        \`<option value="\${b.id}" \${(currentBldId !== 'ALL' && b.id === currentBldId) ? 'selected' : ''}>\${b.name}</option>\`
      ).join('');

      onAssignBuildingChange(filterTypeCode);
      openModal('assignAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function openAssignAssetModalForRoom(roomId) {
      openAssignAssetModal();
      setTimeout(() => {
        const roomSelect = document.getElementById('modal-assign-room');
        if (roomSelect) roomSelect.value = roomId;
      }, 50);
    }

    function quickAssignAsset(assetId) {
      openAssignAssetModal();
      setTimeout(() => {
        const assetSelect = document.getElementById('modal-assign-asset');
        if (assetSelect) assetSelect.value = assetId;
      }, 50);
    }

    function onAssignBuildingChange(filterTypeCode) {
      const bldId = document.getElementById('modal-assign-building').value;
      const inStock = DataStore.getAvailableAssetsForBuilding ? DataStore.getAvailableAssetsForBuilding(bldId) : [];
      const assetSelect = document.getElementById('modal-assign-asset');

      let filteredStock = inStock;
      if (filterTypeCode) {
        const matched = inStock.filter(a => a.typeCode === filterTypeCode);
        if (matched.length > 0) filteredStock = matched;
      }

      if (filteredStock.length === 0) {
        assetSelect.innerHTML = '<option value="">(Kho của cơ sở này hiện đã hết thiết bị sẵn sàng)</option>';
      } else {
        assetSelect.innerHTML = filteredStock.map(a =>
          \`<option value="\${a.id}">[\${a.code}] \${a.name} (\${formatVND(a.price || 0)})</option>\`
        ).join('');
      }

      loadRoomsForAssignModal();
    }

    function loadRoomsForAssignModal() {
      const bldId = document.getElementById('modal-assign-building').value;
      const roomSelect = document.getElementById('modal-assign-room');
      const onlyEmpty = document.getElementById('modal-filter-only-empty-rooms')?.checked || false;

      let rooms = DataStore.getRooms().filter(r => r.buildingId === bldId);
      const allAssets = DataStore.getAssets();

      if (onlyEmpty) {
        rooms = rooms.filter(r => allAssets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber).length === 0);
      }

      if (rooms.length === 0) {
        roomSelect.innerHTML = '<option value="">(Không có phòng nào phù hợp)</option>';
      } else {
        roomSelect.innerHTML = rooms.map(r => {
          const count = allAssets.filter(a => a.roomId === r.id || a.roomNumber === r.roomNumber).length;
          const statusText = count === 0 ? ' - Chưa có đồ (Sẵn sàng nhận thiết bị)' : \` - Đã có \${count} thiết bị\`;
          return \`<option value="\${r.id}">Phòng \${r.roomNumber} (Tầng \${r.floor})\${statusText}</option>\`;
        }).join('');
      }
    }

    function handleAssignSubmit(e) {
      e.preventDefault();
      const assetId = document.getElementById('modal-assign-asset').value;
      const roomId = document.getElementById('modal-assign-room').value;
      const notes = document.getElementById('modal-assign-notes').value;
      const bldId = document.getElementById('modal-assign-building').value;

      if (!assetId || !roomId) {
        alert('Vui lòng chọn đầy đủ thiết bị trong kho và căn hộ nhận bàn giao!');
        return;
      }

      const room = DataStore.getRooms().find(r => r.id === roomId);
      if (!room) return;

      const result = DataStore.assignAssetToRoom({
        assetId,
        buildingId: bldId,
        roomId: room.id,
        roomNumber: room.roomNumber,
        notes: notes || 'Bàn giao thiết bị vào phòng'
      });

      if (result.success) {
        closeModal('assignAssetModal');
        showToast(\`Đã bàn giao thành công [\${result.asset.code}] vào phòng \${result.asset.roomNumber}!\`);
        renderCurrentView();
      } else {
        alert(result.error || 'Có lỗi khi bàn giao thiết bị!');
      }
    }

    // Restock modal
    function openRestockModal(targetTypeCode) {
      const targetSelect = document.getElementById('modal-restock-target-asset');
      const assets = DataStore.getAssets();

      const uniqueAssets = [];
      const seen = new Set();
      assets.forEach(a => {
        const key = a.typeCode + '_' + a.name;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueAssets.push(a);
        }
      });

      targetSelect.innerHTML = uniqueAssets.map(a => {
        const isMatch = targetTypeCode && a.typeCode === targetTypeCode;
        return \`<option value="\${a.id}" \${isMatch ? 'selected' : ''}>[\${a.typeCode}] \${a.name} - Giá: \${formatVND(a.price || 0)}</option>\`;
      }).join('');

      targetSelect.onchange = function () {
        const selected = assets.find(a => a.id === targetSelect.value);
        if (selected) {
          document.getElementById('modal-restock-price').value = selected.price || 10000000;
        }
      };

      openModal('restockAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function handleRestockSubmit(e) {
      e.preventDefault();
      const assetId = document.getElementById('modal-restock-target-asset').value;
      const quantity = parseInt(document.getElementById('modal-asset-quantity').value, 10) || 1;
      const price = parseFloat(document.getElementById('modal-restock-price').value) || 0;
      const notes = document.getElementById('modal-restock-notes').value;

      if (!assetId || quantity <= 0) {
        alert('Vui lòng chọn tài sản và số lượng hợp lệ!');
        return;
      }

      const res = DataStore.restockAsset(assetId, quantity, price, notes);
      if (res.success) {
        closeModal('restockAssetModal');
        showToast(\`Đã nhập thêm thành công \${res.count} thiết bị vào kho lưu trữ!\`);
        renderCurrentView();
      } else {
        alert(res.error || 'Có lỗi khi nhập thêm số lượng!');
      }
    }

    // Create modal
    function openCreateAssetModal() {
      const bldSelect = document.getElementById('modal-create-building');
      bldSelect.innerHTML = DataStore.getBuildings().map(b =>
        \`<option value="\${b.id}">\${b.name}</option>\`
      ).join('');

      const typeSelect = document.getElementById('modal-create-type');
      const types = DataStore.getAssetTypes ? DataStore.getAssetTypes() : [];
      typeSelect.innerHTML = types.map(t =>
        \`<option value="\${t.code}">\${t.name} (\${t.defaultBrand || t.unit})</option>\`
      ).join('');

      onAssetTypeSelected();
      openModal('createAssetModal');
      if (window.lucide) lucide.createIcons();
    }

    function onAssetTypeSelected() {
      const typeCode = document.getElementById('modal-create-type').value;
      const types = DataStore.getAssetTypes ? DataStore.getAssetTypes() : [];
      const t = types.find(x => x.code === typeCode);
      if (t) {
        document.getElementById('modal-create-code').value = t.code + '-NEW';
        document.getElementById('modal-create-name').value = t.name;
        document.getElementById('modal-create-brand').value = (t.defaultBrand || '').split(' ')[0] || '';
      }
    }

    function handleCreateAssetSubmit(e) {
      e.preventDefault();
      const bldId = document.getElementById('modal-create-building').value;
      const typeCode = document.getElementById('modal-create-type').value;
      const code = document.getElementById('modal-create-code').value.trim();
      const quantity = parseInt(document.getElementById('modal-create-quantity').value, 10) || 1;
      const name = document.getElementById('modal-create-name').value.trim();
      const brand = document.getElementById('modal-create-brand').value.trim();
      const model = document.getElementById('modal-create-model').value.trim();
      const price = parseFloat(document.getElementById('modal-create-price').value) || 0;
      const warranty = parseInt(document.getElementById('modal-create-warranty').value, 10) || 24;

      const types = DataStore.getAssetTypes ? DataStore.getAssetTypes() : [];
      const typeObj = types.find(x => x.code === typeCode);

      const res = DataStore.createAsset({
        code,
        quantity,
        typeCode,
        typeName: typeObj ? typeObj.name : typeCode,
        name,
        brand,
        model,
        price,
        warrantyMonths: warranty,
        buildingId: bldId
      });

      if (res.success) {
        closeModal('createAssetModal');
        showToast(\`Đã tạo mới thành công \${res.totalCreated} thiết bị vào kho!\`);
        renderCurrentView();
      } else {
        alert(res.error || 'Có lỗi khi tạo thiết bị!');
      }
    }

    // Unassign & Delete
    function handleUnassignAsset(assetId) {
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      if (!confirm(\`Bạn có chắc chắn muốn thu hồi thiết bị [\${asset.code}] (\${asset.name}) từ phòng \${asset.roomNumber} về kho lưu trữ?\`)) {
        return;
      }

      const result = DataStore.unassignAsset(assetId);
      if (result.success) {
        showToast(\`Đã thu hồi tài sản \${asset.code} về kho thiết bị!\`);
        renderCurrentView();
      }
    }

    function handleDeleteAsset(assetId) {
      const asset = DataStore.getAssets().find(a => a.id === assetId);
      if (!asset) return;

      if (asset.allocationStatus === 'ASSIGNED') {
        alert(\`Không thể xóa thiết bị [\${asset.code}] vì đang được trang bị tại phòng \${asset.roomNumber}. Vui lòng thu hồi về kho trước khi xóa!\`);
        return;
      }

      if (!confirm(\`Bạn có chắc chắn muốn xóa vĩnh viễn thiết bị [\${asset.code}] khỏi hệ thống?\`)) {
        return;
      }

      const result = DataStore.deleteAsset(assetId);
      if (result && result.success) {
        showToast(\`Đã xóa thiết bị \${asset.code}!\`);
        renderCurrentView();
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

      renderCurrentView();

      window.onFilterBuilding = function () {
        renderCurrentView();
      };
    });
  </script>
</body>

</html>
`;

fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully written redesigned grouped assets.html! Size: ' + fs.statSync(targetPath).size);
