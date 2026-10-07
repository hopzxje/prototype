/**
 * StayHub Prototype - Data Store & LocalStorage Persistence
 * Contains initial seed data and helper methods to query and update state.
 */

const STORAGE_KEYS = {
  ROLE: 'stayhub_role',
  USER: 'stayhub_user',
  BUILDINGS: 'stayhub_buildings',
  ROOMS: 'stayhub_rooms',
  CONTRACTS: 'stayhub_contracts',
  INVOICES: 'stayhub_invoices',
  UTILITIES: 'stayhub_utilities',
  RESIDENTS: 'stayhub_residents',
  MAINTENANCE: 'stayhub_maintenance',
  VISITORS: 'stayhub_visitors',
  ASSETS: 'stayhub_assets',
  ASSET_TYPES: 'stayhub_asset_types',
  ASSET_ASSIGNMENTS: 'stayhub_asset_assignments',
  SEPAY_TXS: 'stayhub_sepay_txs',
  AUDIT_LOGS: 'stayhub_audit_logs',
  SYSTEM_CONFIG: 'stayhub_system_config',
  CURRENT_BUILDING: 'stayhub_current_building',
  USERS: 'stayhub_users',
  HANDOVER: 'stayhub_handover',
  CONTRACT_TEMPLATE: 'stayhub_contract_template'
};

const DEFAULT_USERS = {
  ADMIN: {
    id: 'usr-admin-1',
    role: 'ADMIN',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'admin@stayhub.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Quản trị viên Hệ thống'
  },
  MANAGER: {
    id: 'usr-mgr-1',
    role: 'MANAGER',
    fullName: 'Trần Minh Đức',
    email: 'manager@stayhub.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Quản lý Cơ sở'
  },
  STAFF: {
    id: 'usr-staff-1',
    role: 'STAFF',
    fullName: 'Phạm Tuấn Anh',
    email: 'staff@stayhub.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Nhân viên Vận hành'
  },
  RESIDENT: {
    id: 'usr-res-1',
    role: 'RESIDENT',
    fullName: 'Lê Văn An',
    email: 'resident@stayhub.vn',
    room: 'P201',
    building: 'Tòa nhà StayHub Central - Quận 1 (SH-CENTRAL)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    title: 'Cư dân Căn hộ P201'
  }
};

const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'admin@stayhub.vn',
    phone: '0908889999',
    role: 'ADMIN',
    scope: 'Toàn bộ 3 cơ sở',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Giám đốc Vận hành & Hệ thống'
  },
  {
    id: 'usr-mgr-1',
    fullName: 'Trần Minh Đức',
    email: 'manager1@stayhub.vn',
    phone: '0912345678',
    role: 'MANAGER',
    scope: 'StayHub Central & Eco',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Quản lý Vận hành Cơ sở'
  },
  {
    id: 'usr-mgr-2',
    fullName: 'Lê Hải Yến',
    email: 'manager2@stayhub.vn',
    phone: '0918765432',
    role: 'MANAGER',
    scope: 'StayHub Riverside - Tây Hồ',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    title: 'Quản lý Cơ sở Riverside'
  },
  {
    id: 'usr-staff-1',
    fullName: 'Phạm Tuấn Anh',
    email: 'staff1@stayhub.vn',
    phone: '0933112233',
    role: 'STAFF',
    scope: 'StayHub Central',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Kỹ thuật viên Trưởng'
  },
  {
    id: 'usr-staff-2',
    fullName: 'Vũ Hoàng Long',
    email: 'staff2@stayhub.vn',
    phone: '0933224455',
    role: 'STAFF',
    scope: 'StayHub Central & Riverside',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    title: 'Nhân viên Bảo trì & An ninh'
  },
  {
    id: 'usr-staff-3',
    fullName: 'Đỗ Thị Thu Trang',
    email: 'staff3@stayhub.vn',
    phone: '0933778899',
    role: 'STAFF',
    scope: 'StayHub Riverside - Tây Hồ',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    title: 'Lễ tân & Chăm sóc Cư dân'
  },
  {
    id: 'usr-staff-4',
    fullName: 'Bùi Văn Hậu',
    email: 'staff4@stayhub.vn',
    phone: '0933556677',
    role: 'STAFF',
    scope: 'StayHub Eco - Cầu Giấy',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    title: 'Kỹ thuật viên Vận hành'
  },
  {
    id: 'usr-res-1',
    fullName: 'Lê Văn An',
    email: 'resident@stayhub.vn',
    phone: '0904445566',
    role: 'RESIDENT',
    scope: 'P201 - StayHub Central',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    title: 'Cư dân Căn hộ P201'
  }
];

const INITIAL_RESIDENTS = [
  { name: 'Lê Văn An', room: 'P201', building: 'StayHub Central', phone: '0904445566', cccd: '001201004567', startDate: '01/01/2025', registered: true },
  { name: 'Nguyễn Văn Hùng', room: 'P101', building: 'StayHub Central', phone: '0901112233', cccd: '001200001234', startDate: '01/02/2025', registered: true },
  { name: 'Trần Thị Thu Thảo', room: 'P102', building: 'StayHub Central', phone: '0902223344', cccd: '001202008899', startDate: '01/03/2025', registered: true },
  { name: 'Vũ Đức Nam', room: 'P301', building: 'StayHub Central', phone: '0907778899', cccd: '001201009988', startDate: '01/04/2025', registered: false },
  { name: 'Hà Kiều Oanh', room: 'P101', building: 'StayHub Riverside', phone: '0911223344', cccd: '001198002345', startDate: '15/03/2025', registered: true }
];

const INITIAL_ASSET_TYPES = [
  { id: 'at-ac', code: 'AC', name: 'Điều hòa không khí', defaultBrand: 'Daikin / Panasonic', unit: 'Cái', lifespanMonths: 60, icon: 'wind' },
  { id: 'at-fridge', code: 'FRIDGE', name: 'Tủ lạnh', defaultBrand: 'Toshiba / Aqua 180L', unit: 'Cái', lifespanMonths: 72, icon: 'refrigerator' },
  { id: 'at-water-heater', code: 'WATER_HEATER', name: 'Bình nóng lạnh', defaultBrand: 'Ariston 30L chống giật', unit: 'Cái', lifespanMonths: 48, icon: 'flame' },
  { id: 'at-bed', code: 'BED', name: 'Giường nệm cao cấp', defaultBrand: 'Khung gỗ sồi + Nệm cao su 1m6', unit: 'Bộ', lifespanMonths: 84, icon: 'bed' },
  { id: 'at-wardrobe', code: 'WARDROBE', name: 'Tủ quần áo', defaultBrand: 'Gỗ MDF chống ẩm 2 cánh', unit: 'Cái', lifespanMonths: 60, icon: 'archive' },
  { id: 'at-desk', code: 'DESK_CHAIR', name: 'Bàn ghế làm việc', defaultBrand: 'Bàn gỗ 1m2 + Ghế xoay', unit: 'Bộ', lifespanMonths: 36, icon: 'briefcase' },
  { id: 'at-wm', code: 'WASHING_MACHINE', name: 'Máy giặt lồng ngang', defaultBrand: 'Electrolux 8.5kg', unit: 'Cái', lifespanMonths: 60, icon: 'disc' },
  { id: 'at-lock', code: 'SMART_LOCK', name: 'Khóa cửa thông minh', defaultBrand: 'Khóa từ vân tay Kaadas', unit: 'Bộ', lifespanMonths: 48, icon: 'key' }
];

const INITIAL_ASSETS = [
  {
    id: 'ast-ac-001',
    code: 'AC-CENTRAL-201',
    typeCode: 'AC',
    typeName: 'Điều hòa không khí',
    name: 'Điều hòa Inverter Daikin 1.5 HP',
    brand: 'Daikin',
    model: 'FTKQ35SVMV',
    price: 11500000,
    purchaseDate: '2025-01-10',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    status: 'ACTIVE',
    allocationStatus: 'ASSIGNED',
    condition: 'Tốt',
    assignedAt: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh'
  },
  {
    id: 'ast-fridge-001',
    code: 'FRIDGE-CENTRAL-201',
    typeCode: 'FRIDGE',
    typeName: 'Tủ lạnh',
    name: 'Tủ lạnh Toshiba Inverter 180L',
    brand: 'Toshiba',
    model: 'GR-B22VU(UKG)',
    price: 5800000,
    purchaseDate: '2025-01-10',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    status: 'ACTIVE',
    allocationStatus: 'ASSIGNED',
    condition: 'Tốt',
    assignedAt: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh'
  },
  {
    id: 'ast-wh-001',
    code: 'WH-CENTRAL-201',
    typeCode: 'WATER_HEATER',
    typeName: 'Bình nóng lạnh',
    name: 'Bình nóng lạnh Ariston 30L chống giật',
    brand: 'Ariston',
    model: 'AN2 30 LUX',
    price: 3600000,
    purchaseDate: '2025-01-10',
    warrantyMonths: 36,
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    status: 'ACTIVE',
    allocationStatus: 'ASSIGNED',
    condition: 'Tốt',
    assignedAt: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh'
  },
  {
    id: 'ast-bed-001',
    code: 'BED-CENTRAL-201',
    typeCode: 'BED',
    typeName: 'Giường nệm cao cấp',
    name: 'Giường nệm cao su non 1m6x2m',
    brand: 'Việt Á Luxury',
    model: 'VA-1620',
    price: 7200000,
    purchaseDate: '2025-01-10',
    warrantyMonths: 36,
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    status: 'ACTIVE',
    allocationStatus: 'ASSIGNED',
    condition: 'Tốt',
    assignedAt: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh'
  },
  {
    id: 'ast-ac-stock-01',
    code: 'AC-STOCK-001',
    typeCode: 'AC',
    typeName: 'Điều hòa không khí',
    name: 'Điều hòa Panasonic Inverter 1.5 HP (Dự phòng)',
    brand: 'Panasonic',
    model: 'XPU12XKH-8',
    price: 12200000,
    purchaseDate: '2026-02-15',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: null,
    roomNumber: 'Kho thiết bị',
    status: 'ACTIVE',
    allocationStatus: 'IN_STOCK',
    condition: 'Mới 100%',
    assignedAt: null,
    assignedBy: null
  },
  {
    id: 'ast-fridge-stock-01',
    code: 'FRIDGE-STOCK-001',
    typeCode: 'FRIDGE',
    typeName: 'Tủ lạnh',
    name: 'Tủ lạnh Aqua 180L AQR-T220FA (Dự phòng)',
    brand: 'Aqua',
    model: 'AQR-T220FA',
    price: 5200000,
    purchaseDate: '2026-03-01',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: null,
    roomNumber: 'Kho thiết bị',
    status: 'ACTIVE',
    allocationStatus: 'IN_STOCK',
    condition: 'Mới 100%',
    assignedAt: null,
    assignedBy: null
  },
  {
    id: 'ast-wh-stock-01',
    code: 'WH-STOCK-001',
    typeCode: 'WATER_HEATER',
    typeName: 'Bình nóng lạnh',
    name: 'Bình nóng lạnh Rossi 30L Arte (Dự phòng)',
    brand: 'Rossi',
    model: 'Arte 30SQ',
    price: 2900000,
    purchaseDate: '2026-03-01',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: null,
    roomNumber: 'Kho thiết bị',
    status: 'ACTIVE',
    allocationStatus: 'IN_STOCK',
    condition: 'Mới 100%',
    assignedAt: null,
    assignedBy: null
  },
  {
    id: 'ast-wm-stock-01',
    code: 'WM-STOCK-001',
    typeCode: 'WASHING_MACHINE',
    typeName: 'Máy giặt lồng ngang',
    name: 'Máy giặt Electrolux UltimateCare 8.5kg',
    brand: 'Electrolux',
    model: 'EWF85743',
    price: 8900000,
    purchaseDate: '2026-03-10',
    warrantyMonths: 24,
    buildingId: 'bld-1',
    roomId: null,
    roomNumber: 'Kho thiết bị',
    status: 'ACTIVE',
    allocationStatus: 'IN_STOCK',
    condition: 'Mới 100%',
    assignedAt: null,
    assignedBy: null
  },
  {
    id: 'ast-lock-stock-01',
    code: 'LOCK-STOCK-001',
    typeCode: 'SMART_LOCK',
    typeName: 'Khóa cửa thông minh',
    name: 'Khóa từ vân tay Kaadas K9',
    brand: 'Kaadas',
    model: 'K9-5W',
    price: 6500000,
    purchaseDate: '2026-03-12',
    warrantyMonths: 36,
    buildingId: 'bld-1',
    roomId: null,
    roomNumber: 'Kho thiết bị',
    status: 'ACTIVE',
    allocationStatus: 'IN_STOCK',
    condition: 'Mới 100%',
    assignedAt: null,
    assignedBy: null
  }
];

const INITIAL_ASSET_ASSIGNMENTS = [
  {
    id: 'asg-001',
    assetId: 'ast-ac-001',
    assetCode: 'AC-CENTRAL-201',
    assetName: 'Điều hòa Inverter Daikin 1.5 HP',
    typeCode: 'AC',
    typeName: 'Điều hòa không khí',
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    assignedDate: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh',
    notes: 'Bàn giao nguyên vẹn, kèm remote và giá treo',
    status: 'ACTIVE'
  },
  {
    id: 'asg-002',
    assetId: 'ast-fridge-001',
    assetCode: 'FRIDGE-CENTRAL-201',
    assetName: 'Tủ lạnh Toshiba Inverter 180L',
    typeCode: 'FRIDGE',
    typeName: 'Tủ lạnh',
    buildingId: 'bld-1',
    roomId: 'rm-201',
    roomNumber: 'P201',
    assignedDate: '15/01/2025',
    assignedBy: 'Phạm Tuấn Anh',
    notes: 'Khay đá và ngăn rau củ đầy đủ',
    status: 'ACTIVE'
  }
];

const INITIAL_SYSTEM_CONFIG = {
  brandName: 'StayHub',
  slogan: 'Quản lý Không gian sống & Căn hộ Dịch vụ Hiện đại',
  companyName: 'Hệ thống Căn hộ Dịch vụ StayHub Việt Nam',
  hotline: '1900 8899',
  email: 'hotro@stayhub.vn',
  headquarters: 'Tòa nhà StayHub Innovation, Quận 1, TP. Hồ Chí Minh',
  currency: 'VND',
  timezone: 'Asia/Ho_Chi_Minh',
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  logRetention: 365,
  maintenanceMode: false,
  elecRate: 3500,
  waterRate: 25000,
  serviceFee: 150000,
  bankName: 'MB Bank (Quân Đội)',
  bankAccount: '0912345678',
  bankOwner: 'STAYHUB LIVING CO LTD',
  zaloAppId: '381920391823901',
  zaloSecretKey: 'zalo_sec_892109841029381',
  zaloTemplateBill: 'TMP_STAYHUB_BILL_NOTICE',
  zaloTemplatePay: 'TMP_STAYHUB_PAYMENT_SUCCESS'
};

const INITIAL_BUILDINGS = [
  { id: 'bld-1', code: 'SH-CENTRAL', name: 'StayHub Central - Quận 1', address: '95 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', floors: 5, totalRooms: 12, manager: 'Trần Minh Đức', phone: '0912345678', status: 'Active', elecRate: 3500, waterRate: 25000, serviceFee: 150000 },
  { id: 'bld-2', code: 'SH-RIVERSIDE', name: 'StayHub Riverside - Tây Hồ', address: '12 Quảng An, Phường Quảng An, Quận Tây Hồ, Hà Nội', floors: 3, totalRooms: 12, manager: 'Lê Hải Yến', phone: '0918765432', status: 'Active', elecRate: 3800, waterRate: 28000, serviceFee: 180000 },
  { id: 'bld-3', code: 'SH-ECO', name: 'StayHub Eco - Cầu Giấy', address: '45 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội', floors: 4, totalRooms: 12, manager: 'Trần Minh Đức', phone: '0912345678', status: 'Active', elecRate: 3600, waterRate: 26000, serviceFee: 160000 }
];

const INITIAL_ROOMS = [
  // Building 1
  { id: 'rm-101', buildingId: 'bld-1', roomNumber: 'P101', floor: 1, type: 'Studio', area: 28, price: 6500000, deposit: 6500000, status: 'OCCUPIED', tenant: 'Nguyễn Văn Hùng', phone: '0901112233' },
  { id: 'rm-102', buildingId: 'bld-1', roomNumber: 'P102', floor: 1, type: '1 Phòng ngủ', area: 35, price: 7500000, deposit: 7500000, status: 'OCCUPIED', tenant: 'Trần Thị Thu Thảo', phone: '0902223344' },
  { id: 'rm-103', buildingId: 'bld-1', roomNumber: 'P103', floor: 1, type: 'Studio', area: 26, price: 6000000, deposit: 6000000, status: 'AVAILABLE', tenant: null, phone: null },
  { id: 'rm-104', buildingId: 'bld-1', roomNumber: 'P104', floor: 1, type: 'Studio', area: 30, price: 6800000, deposit: 6800000, status: 'OCCUPIED', tenant: 'Hoàng Kim Long', phone: '0903334455' },
  { id: 'rm-201', buildingId: 'bld-1', roomNumber: 'P201', floor: 2, type: 'Duplex Gác xép', area: 40, price: 8500000, deposit: 8500000, status: 'OCCUPIED', tenant: 'Lê Văn An', phone: '0904445566' },
  { id: 'rm-202', buildingId: 'bld-1', roomNumber: 'P202', floor: 2, type: 'Studio Ban công', area: 32, price: 7200000, deposit: 7200000, status: 'MAINTENANCE', tenant: null, phone: null },
  { id: 'rm-203', buildingId: 'bld-1', roomNumber: 'P203', floor: 2, type: 'Studio', area: 28, price: 6500000, deposit: 6500000, status: 'OCCUPIED', tenant: 'Phan Minh Tuấn', phone: '0905556677' },
  { id: 'rm-204', buildingId: 'bld-1', roomNumber: 'P204', floor: 2, type: '1 Phòng ngủ', area: 38, price: 8000000, deposit: 8000000, status: 'OCCUPIED', tenant: 'Đỗ Thùy Trang', phone: '0906667788' },
  { id: 'rm-301', buildingId: 'bld-1', roomNumber: 'P301', floor: 3, type: 'Penthouse mini', area: 48, price: 9500000, deposit: 9500000, status: 'OCCUPIED', tenant: 'Vũ Đức Nam', phone: '0907778899' },
  { id: 'rm-302', buildingId: 'bld-1', roomNumber: 'P302', floor: 3, type: 'Studio', area: 30, price: 6800000, deposit: 6800000, status: 'RESERVED', tenant: 'Bùi Thị Hà', phone: '0908889900' },
  { id: 'rm-303', buildingId: 'bld-1', roomNumber: 'P303', floor: 3, type: '1 Phòng ngủ', area: 36, price: 7800000, deposit: 7800000, status: 'OCCUPIED', tenant: 'Ngô Quốc Bảo', phone: '0909990011' },
  { id: 'rm-304', buildingId: 'bld-1', roomNumber: 'P304', floor: 3, type: 'Studio', area: 28, price: 6500000, deposit: 6500000, status: 'AVAILABLE', tenant: null, phone: null },

  // Building 2
  { id: 'rm-b2-101', buildingId: 'bld-2', roomNumber: 'P101', floor: 1, type: 'View Hồ Tây', area: 35, price: 8500000, deposit: 8500000, status: 'OCCUPIED', tenant: 'Hà Kiều Oanh', phone: '0911223344' },
  { id: 'rm-b2-102', buildingId: 'bld-2', roomNumber: 'P102', floor: 1, type: 'Studio', area: 30, price: 7200000, deposit: 7200000, status: 'OCCUPIED', tenant: 'Lê Hoàng Hải', phone: '0912233445' },
  { id: 'rm-b2-201', buildingId: 'bld-2', roomNumber: 'P201', floor: 2, type: '1 PN View Hồ', area: 42, price: 9800000, deposit: 9800000, status: 'OCCUPIED', tenant: 'Đinh Tiến Đạt', phone: '0913344556' },
  { id: 'rm-b2-202', buildingId: 'bld-2', roomNumber: 'P202', floor: 2, type: 'Studio', area: 30, price: 7200000, deposit: 7200000, status: 'AVAILABLE', tenant: null, phone: null },

  // Building 3
  { id: 'rm-b3-101', buildingId: 'bld-3', roomNumber: 'P101', floor: 1, type: 'Studio Hiện đại', area: 28, price: 6200000, deposit: 6200000, status: 'OCCUPIED', tenant: 'Võ Minh Thắng', phone: '0922334455' },
  { id: 'rm-b3-102', buildingId: 'bld-3', roomNumber: 'P102', floor: 1, type: '1 Phòng ngủ', area: 36, price: 7200000, deposit: 7200000, status: 'OCCUPIED', tenant: 'Mai Thanh Tâm', phone: '0923344556' }
];

const DEFAULT_CONTRACT_CONTENT = `ĐIỀU 1: ĐỐI TƯỢNG VÀ MỤC ĐÍCH HỢP ĐỒNG
1.1 Bên A đồng ý cho Bên B thuê phòng {ten_phong} thuộc cơ sở {co_so} để ở và sinh hoạt cá nhân hợp pháp.
1.2 Bên B không được phép sử dụng phòng vào mục đích kinh doanh trái phép, không tàng trữ chất cấm, và không được tự ý sang nhượng cho bên thứ ba khi chưa có sự chấp thuận bằng văn bản của Bên A.

ĐIỀU 2: THỜI HẠN THUÊ VÀ GIA HẠN
2.1 Thời hạn thuê là {thoi_han}, tính từ ngày {ngay_bat_dau} đến hết ngày {ngay_ket_thuc}.
2.2 Khi hết hạn hợp đồng, nếu Bên B có nhu cầu tiếp tục thuê thì phải thông báo cho Bên A trước ít nhất 30 ngày để làm thủ tục gia hạn hợp đồng.

ĐIỀU 3: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN
3.1 Giá thuê phòng là {gia_thue} (chưa bao gồm chi phí dịch vụ phụ trợ như điện, nước, vệ sinh, wifi).
3.2 Kỳ thanh toán: Hàng tháng, từ ngày 01 đến trước ngày {ngay_thanh_toan} của mỗi kỳ thu phí.
3.3 Phương thức thanh toán: Quét mã chuyển khoản VietQR tự động tích hợp SePay hoặc nộp tiền mặt cho Ban quản lý cơ sở.

ĐIỀU 4: TIỀN ĐẶT CỌC BẢO ĐẢM VÀ HOÀN TRẢ
4.1 Tiền đặt cọc được xác định là {tien_coc}, Bên B nộp ngay khi ký hợp đồng để đảm bảo thực hiện nghĩa vụ hợp đồng và bảo quản tài sản.
4.2 Bên A sẽ hoàn trả 100% tiền cọc cho Bên B sau khi trừ các chi phí phát sinh hợp lệ (nếu có) khi hợp đồng kết thúc đúng hạn và hai bên hoàn tất biên bản bàn giao phòng.

ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
5.1 Bên A: Bàn giao phòng đúng hẹn, đảm bảo tiện ích ổn định, bảo trì sửa chữa sự cố kết cấu trong vòng 24h kể từ khi nhận phản ánh.
5.2 Bên B: Thanh toán đúng hạn, chấp hành nghiêm quy định PCCC, giữ gìn vệ sinh chung, đăng ký tạm trú theo hướng dẫn của BQL và bồi thường thiệt hại nếu làm hỏng hóc tài sản bàn giao.

ĐIỀU 6: CHẤM DỨT HỢP ĐỒNG & BỒI THƯỜNG
6.1 Trường hợp một trong hai bên đơn phương chấm dứt hợp đồng trước hạn mà không có lý do chính đáng phải thông báo trước ít nhất 30 ngày và chịu bồi thường số tiền tương đương 01 tháng tiền thuê.
6.2 Hợp đồng đương nhiên chấm dứt khi hết thời hạn thỏa thuận hoặc có yêu cầu giải tỏa từ cơ quan nhà nước có thẩm quyền.

ĐIỀU 7: HIỆU LỰC THI HÀNH
7.1 Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý ngang nhau, mỗi bên giữ 01 bản để thực hiện.
7.2 Hợp đồng có hiệu lực kể từ ngày hai bên ký kết.`;

const DEFAULT_CONTRACT_TEMPLATE = {
  version: '2.0',
  effectiveDate: '2026-10-07',
  updatedAt: '2026-10-07',
  templateName: 'Hợp Đồng Thuê Căn Hộ Dịch Vụ Chuẩn StayHub (Bản Mẫu Gộp)',
  title: 'HỢP ĐỒNG THUÊ CĂN HỘ DỊCH VỤ / PHÒNG TRỌ',
  content: DEFAULT_CONTRACT_CONTENT,
  purpose: '1.1 Bên A đồng ý cho Bên B thuê phòng để ở và sinh hoạt hợp pháp.\n1.2 Bên B không được phép sử dụng phòng vào mục đích kinh doanh trái phép hoặc tự ý sang nhượng cho bên thứ ba khi chưa có sự đồng ý bằng văn bản của Bên A.',
  duration: '2.1 Thời hạn thuê được tính từ ngày bắt đầu đến ngày kết thúc thỏa thuận.\n2.2 Khi hết hạn hợp đồng, nếu Bên B có nhu cầu tiếp tục thuê thì phải thông báo cho Bên A trước ít nhất 30 ngày để làm thủ tục gia hạn hợp đồng.',
  payment: '3.1 Giá thuê phòng chưa bao gồm chi phí dịch vụ phụ trợ (điện, nước, vệ sinh).\n3.2 Kỳ thanh toán: Hàng tháng, từ ngày 01 đến ngày đến hạn quy định. Phương thức: Quét mã chuyển khoản VietQR tự động tích hợp SePay hoặc tiền mặt.',
  deposit: '4.1 Tiền đặt cọc được dùng để đảm bảo thực hiện nghĩa vụ hợp đồng và bảo quản tài sản.\n4.2 Bên A sẽ hoàn trả 100% tiền cọc cho Bên B sau khi trừ các chi phí phát sinh (nếu có) khi hợp đồng kết thúc đúng hạn và hai bên hoàn tất biên bản bàn giao phòng.',
  responsibilities: '5.1 Bên A: Bàn giao phòng đúng hẹn, đảm bảo tiện ích ổn định, bảo trì sửa chữa sự cố kết cấu trong vòng 24h kể từ khi nhận phản ánh.\n5.2 Bên B: Thanh toán đúng hạn, chấp hành nội quy PCCC, giữ gìn vệ sinh chung, đăng ký tạm trú theo hướng dẫn của BQL và bồi thường thiệt hại nếu làm hỏng hóc tài sản bàn giao.',
  termination: '6.1 Trường hợp một trong hai bên đơn phương chấm dứt hợp đồng trước hạn mà không có lý do chính đáng phải thông báo trước ít nhất 30 ngày và chịu bồi thường số tiền tương đương 01 tháng tiền thuê.\n6.2 Hợp đồng đương nhiên chấm dứt khi hết thời hạn thỏa thuận hoặc có yêu cầu giải tỏa từ cơ quan nhà nước có thẩm quyền.',
  validity: '7.1 Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý ngang nhau, mỗi bên giữ 01 bản để thực hiện.\n7.2 Hợp đồng có hiệu lực kể từ ngày hai bên ký kết.'
};

const INITIAL_CONTRACTS = [
  { id: 'ct-001', code: 'HD-2025-001', room: 'P201', building: 'StayHub Central - Ba Đình', tenant: 'Lê Văn An', phone: '0904445566', cccd: '001201004567', startDate: '2025-01-01', endDate: '2026-12-31', rent: 8500000, deposit: 8500000, status: 'ACTIVE', templateVersion: 'v1.0 (Bản gốc)', customTerms: { ...DEFAULT_CONTRACT_TEMPLATE } },
  { id: 'ct-002', code: 'HD-2025-002', room: 'P101', building: 'StayHub Central - Ba Đình', tenant: 'Nguyễn Văn Hùng', phone: '0901112233', cccd: '001200001234', startDate: '2025-02-01', endDate: '2026-02-01', rent: 6500000, deposit: 6500000, status: 'EXPIRING_SOON', templateVersion: 'v1.0 (Bản gốc)', customTerms: { ...DEFAULT_CONTRACT_TEMPLATE } },
  { id: 'ct-003', code: 'HD-2025-003', room: 'P102', building: 'StayHub Central - Ba Đình', tenant: 'Trần Thị Thu Thảo', phone: '0902223344', cccd: '001202008899', startDate: '2025-03-01', endDate: '2026-03-01', rent: 7500000, deposit: 7500000, status: 'ACTIVE', templateVersion: 'v1.0 (Bản gốc)', customTerms: { ...DEFAULT_CONTRACT_TEMPLATE } },
  { id: 'ct-004', code: 'HD-2025-004', room: 'P301', building: 'StayHub Central - Ba Đình', tenant: 'Vũ Đức Nam', phone: '0907778899', cccd: '001201009988', startDate: '2025-04-01', endDate: '2026-10-01', rent: 9500000, deposit: 9500000, status: 'EXPIRING_SOON', templateVersion: 'v1.0 (Bản gốc)', customTerms: { ...DEFAULT_CONTRACT_TEMPLATE } }
];

const INITIAL_INVOICES = [
  {
    id: 'inv-1001',
    buildingId: 'bld-1',
    code: 'INV-2026-10-P201',
    month: '10/2026',
    room: 'P201',
    building: 'StayHub Central - Quận 1',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    rent: 8500000,
    elecOld: 1240,
    elecNew: 1410,
    elecUnits: 170,
    elecRate: 3500,
    elecTotal: 595000,
    waterOld: 85,
    waterNew: 93,
    waterUnits: 8,
    waterRate: 25000,
    waterTotal: 200000,
    serviceFee: 150000,
    total: 9445000,
    status: 'PAID',
    paymentDate: '2026-10-01 09:24',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-1002',
    buildingId: 'bld-1',
    code: 'INV-2026-10-P101',
    month: '10/2026',
    room: 'P101',
    building: 'StayHub Central - Quận 1',
    tenant: 'Nguyễn Văn Hùng',
    phone: '0901112233',
    rent: 6500000,
    elecOld: 890,
    elecNew: 1025,
    elecUnits: 135,
    elecRate: 3500,
    elecTotal: 472500,
    waterOld: 60,
    waterNew: 66,
    waterUnits: 6,
    waterRate: 25000,
    waterTotal: 150000,
    serviceFee: 150000,
    total: 7272500,
    status: 'UNPAID',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-1003',
    buildingId: 'bld-1',
    code: 'INV-2026-10-P102',
    month: '10/2026',
    room: 'P102',
    building: 'StayHub Central - Quận 1',
    tenant: 'Trần Thị Thu Thảo',
    phone: '0902223344',
    rent: 7500000,
    elecOld: 1100,
    elecNew: 1260,
    elecUnits: 160,
    elecRate: 3500,
    elecTotal: 560000,
    waterOld: 72,
    waterNew: 80,
    waterUnits: 8,
    waterRate: 25000,
    waterTotal: 200000,
    serviceFee: 150000,
    total: 8410000,
    status: 'PAID',
    paymentDate: '2026-10-02 08:15',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-1004',
    buildingId: 'bld-1',
    code: 'INV-2026-10-P301',
    month: '10/2026',
    room: 'P301',
    building: 'StayHub Central - Quận 1',
    tenant: 'Vũ Đức Nam',
    phone: '0907778899',
    rent: 9500000,
    elecOld: 1450,
    elecNew: 1680,
    elecUnits: 230,
    elecRate: 3500,
    elecTotal: 805000,
    waterOld: 110,
    waterNew: 121,
    waterUnits: 11,
    waterRate: 25000,
    waterTotal: 275000,
    serviceFee: 150000,
    total: 10730000,
    status: 'UNPAID',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-2001',
    buildingId: 'bld-2',
    code: 'INV-2026-10-RS101',
    month: '10/2026',
    room: 'P101',
    building: 'StayHub Riverside - Tây Hồ',
    tenant: 'Hà Kiều Oanh',
    phone: '0911223344',
    rent: 8500000,
    elecOld: 500,
    elecNew: 650,
    elecUnits: 150,
    elecRate: 3500,
    elecTotal: 525000,
    waterOld: 40,
    waterNew: 48,
    waterUnits: 8,
    waterRate: 25000,
    waterTotal: 200000,
    serviceFee: 150000,
    total: 9375000,
    status: 'PAID',
    paymentDate: '2026-10-02 11:30',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-3001',
    buildingId: 'bld-3',
    code: 'INV-2026-10-ECO101',
    month: '10/2026',
    room: 'P101',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Võ Minh Thắng',
    phone: '0922334455',
    rent: 6200000,
    elecOld: 300,
    elecNew: 420,
    elecUnits: 120,
    elecRate: 3500,
    elecTotal: 420000,
    waterOld: 30,
    waterNew: 36,
    waterUnits: 6,
    waterRate: 25000,
    waterTotal: 150000,
    serviceFee: 150000,
    total: 6920000,
    status: 'UNPAID',
    paymentDate: null,
    method: null
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: 'mnt-001',
    buildingId: 'bld-1',
    code: 'REQ-2026-091',
    room: 'P202',
    building: 'StayHub Central - Quận 1',
    title: 'Điều hòa Daikin không phả hơi lạnh',
    description: 'Bật 18 độ nhưng chỉ có gió thường, nghi ngờ bị rò rỉ gas làm lạnh.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    requester: 'Quản lý Đức',
    assignee: 'Phạm Tuấn Anh (Kỹ thuật)',
    createdAt: '2026-10-01 14:30'
  },
  {
    id: 'mnt-002',
    buildingId: 'bld-1',
    code: 'REQ-2026-092',
    room: 'P201',
    building: 'StayHub Central - Quận 1',
    title: 'Vòi sen tắm bị rỉ nước ở chân ren',
    description: 'Chân ren vòi tắm rỉ nước giọt giọt liên tục gây ồn vào ban đêm.',
    priority: 'MEDIUM',
    status: 'PENDING',
    requester: 'Lê Văn An (Cư dân)',
    assignee: 'Chưa phân công',
    createdAt: '2026-10-02 07:15'
  },
  {
    id: 'mnt-003',
    buildingId: 'bld-2',
    code: 'REQ-2026-088',
    room: 'P102',
    building: 'StayHub Riverside - Tây Hồ',
    title: 'Khóa cửa vân tay báo pin yếu',
    description: 'Khóa cửa nhấp nháy đèn đỏ báo cần thay 4 viên pin AA.',
    priority: 'LOW',
    status: 'RESOLVED',
    requester: 'Lê Hoàng Hải',
    assignee: 'Phạm Tuấn Anh (Kỹ thuật)',
    createdAt: '2026-09-28 10:00'
  }
];

const INITIAL_VISITORS = [
  { id: 'vis-01', guestName: 'Nguyễn Thu Huyền', cccd: '001198003421', hostRoom: 'P201', hostTenant: 'Lê Văn An', timeExpected: '2026-10-02 18:30', status: 'APPROVED', note: 'Bạn đại học ghé ăn tối' },
  { id: 'vis-02', guestName: 'Phạm Quốc Bảo', cccd: '034200008765', hostRoom: 'P102', hostTenant: 'Trần Thị Thu Thảo', timeExpected: '2026-10-02 14:00', status: 'IN_BUILDING', note: 'Giao tài liệu công ty' },
  { id: 'vis-03', guestName: 'Vũ Minh Khôi', cccd: '001201007744', hostRoom: 'P301', hostTenant: 'Vũ Đức Nam', timeExpected: '2026-10-02 20:00', status: 'PENDING', note: 'Em trai đến thăm cuối tuần' }
];

const INITIAL_SEPAY_TXS = [
  { id: 'sp-101', txCode: 'FT26275991823901', amount: 9445000, content: 'STAYHUB INV-2026-10-P201', bank: 'MB Bank', account: '0912345678', time: '2026-10-01 09:24:12', invoiceCode: 'INV-2026-10-P201', status: 'MATCHED' },
  { id: 'sp-102', txCode: 'FT26275812903411', amount: 8410000, content: 'STAYHUB INV-2026-10-P102', bank: 'Vietcombank', account: '991234567899', time: '2026-10-02 08:15:33', invoiceCode: 'INV-2026-10-P102', status: 'MATCHED' }
];

const INITIAL_AUDIT_LOGS = [
  {
    time: '27/09/2026 16:45:12',
    user: 'Trần Minh Đức',
    role: 'MANAGER',
    action: 'GIA_HAN_HOP_DONG',
    entity: 'Hợp đồng HD-2025-SH1-202',
    detail: 'Gia hạn hợp đồng HD-2025-SH1-202 thành HD-2025-SH1-202-GH đến 2026-10-31',
    ip: '14.161.22.89'
  },
  {
    time: '27/09/2026 10:15:00',
    user: 'Phạm Tuấn Anh',
    role: 'STAFF',
    action: 'PHAT_HANH_HOA_DON',
    entity: 'Hóa đơn P201',
    detail: 'Phát hành hóa đơn HD-1026-SH1-P201 trị giá 9.445.000 ₫ cho cư dân Lê Văn An',
    ip: '14.161.22.89'
  },
  {
    time: '26/09/2026 15:20:00',
    user: 'Nguyễn Hoàng Nam',
    role: 'ADMIN',
    action: 'CAP_NHAT_CAU_HINH',
    entity: 'Cấu hình bảo mật',
    detail: 'Cập nhật cấu hình bảo mật: thời gian hết hạn phiên làm việc 60 phút',
    ip: '14.161.22.89'
  },
  {
    time: '25/09/2026 09:00:00',
    user: 'Trần Minh Đức',
    role: 'MANAGER',
    action: 'THEM_CO_SO_MOI',
    entity: 'Cơ sở SH-ECO',
    detail: 'Thêm cơ sở StayHub Eco - Cầu Giấy (32 phòng) vào hệ thống vận hành chuỗi',
    ip: '14.161.22.89'
  },
  {
    time: '02/10/2026 09:24:12',
    user: 'SePay Webhook',
    role: 'SYSTEM',
    action: 'GẠCH NỢ TỰ ĐỘNG',
    entity: 'Hóa đơn INV-2026-10-P201',
    detail: 'Khớp mã chuyển khoản MB Bank +9.445.000 ₫',
    ip: '118.69.182.4'
  },
  {
    time: '02/10/2026 08:30:00',
    user: 'Trần Minh Đức',
    role: 'MANAGER',
    action: 'LẬP HÓA ĐƠN',
    entity: 'Kỳ thu tháng 10/2026',
    detail: 'Tính toán chỉ số điện nước 12 phòng tại Ba Đình',
    ip: '14.161.22.89'
  }
];

// Initialize Data Store in localStorage
const INITIAL_HANDOVER = {
  status: 'NOT_SCHEDULED',
  apartmentReady: true,
  appointmentId: '',
  appointmentDate: '',
  appointmentTime: '',
  appointmentAcceptedBy: '',
  appointmentAcceptedAt: '',
  note: '',
  condition: {},
  assets: [
    { name: 'Điều hòa', checked: true },
    { name: 'Tủ lạnh', checked: true },
    { name: 'Máy giặt', checked: true },
    { name: 'Bếp từ', checked: true },
    { name: 'Khóa cửa thẻ từ', checked: true }
  ],
  electricity: '',
  water: '',
  keysCount: 2,
  accessCardsCount: 2,
  usageGuideDone: false,
  hasIssue: false,
  issueNote: '',
  photos: [],
  managerApproved: false,
  residentApproved: false,
  managerApprovalName: '',
  managerApprovedAt: '',
  residentApprovedAt: '',
  revisionComment: '',
  rejectedBy: '',
  residentAgrees: null,
  residentSignature: '',
  staffSignature: '',
  managerConfirmed: false
};

const DataStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ROLE)) {
      localStorage.setItem(STORAGE_KEYS.ROLE, 'MANAGER');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USERS.MANAGER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUILDINGS)) {
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(INITIAL_CONTRACTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITORS)) {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(INITIAL_VISITORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEPAY_TXS)) {
      localStorage.setItem(STORAGE_KEYS.SEPAY_TXS, JSON.stringify(INITIAL_SEPAY_TXS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(INITIAL_SYSTEM_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESIDENTS)) {
      localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(INITIAL_RESIDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HANDOVER)) {
      localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(INITIAL_HANDOVER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTRACT_TEMPLATE)) {
      localStorage.setItem(STORAGE_KEYS.CONTRACT_TEMPLATE, JSON.stringify(DEFAULT_CONTRACT_TEMPLATE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSET_TYPES)) {
      localStorage.setItem(STORAGE_KEYS.ASSET_TYPES, JSON.stringify(INITIAL_ASSET_TYPES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSETS)) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSET_ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSET_ASSIGNMENTS, JSON.stringify(INITIAL_ASSET_ASSIGNMENTS));
    }
  },

  resetAll() {
    localStorage.clear();
    this.init();
  },

  getRole() {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || 'MANAGER';
  },

  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : DEFAULT_USERS.MANAGER;
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  setRole(role) {
    if (DEFAULT_USERS[role]) {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USERS[role]));
    }
  },

  getBuildings() {
    const raw = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
    let list = raw ? JSON.parse(raw) : INITIAL_BUILDINGS;
    if (list.length > 0 && (list[0].name.includes('Ba Đình') || list[0].name.startsWith('Tòa nhà') || !list[0].elecRate)) {
      list = INITIAL_BUILDINGS;
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(list));
    }
    return list.map(b => ({
      ...b,
      status: b.status || 'Active',
      elecRate: b.elecRate || (b.id === 'bld-2' ? 3800 : b.id === 'bld-3' ? 3600 : 3500),
      waterRate: b.waterRate || (b.id === 'bld-2' ? 28000 : b.id === 'bld-3' ? 26000 : 25000),
      serviceFee: b.serviceFee || (b.id === 'bld-2' ? 180000 : b.id === 'bld-3' ? 160000 : 150000)
    }));
  },

  updateBuildingTariff(buildingId, { elecRate, waterRate, serviceFee }) {
    const buildings = this.getBuildings();
    const target = buildings.find(b => b.id === buildingId);
    if (target) {
      target.elecRate = parseInt(elecRate) || target.elecRate || 3500;
      target.waterRate = parseInt(waterRate) || target.waterRate || 25000;
      target.serviceFee = parseInt(serviceFee) || target.serviceFee || 150000;
      this.saveBuildings(buildings);
      return target;
    }
    return null;
  },

  getCurrentBuilding() {
    if (this.getRole() === 'ADMIN') {
      return 'ALL';
    }
    const buildings = this.getBuildings();
    let currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_BUILDING);
    if (!currentId || currentId === 'ALL' || !buildings.some(b => b.id === currentId)) {
      currentId = buildings[0] ? buildings[0].id : 'bld-1';
      localStorage.setItem(STORAGE_KEYS.CURRENT_BUILDING, currentId);
    }
    return currentId;
  },

  setCurrentBuilding(buildingId) {
    if (buildingId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_BUILDING, buildingId);
    }
  },

  saveBuildings(buildings) {
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
  },

  getAuditLogs() {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return INITIAL_AUDIT_LOGS;
    try {
      const logs = JSON.parse(raw);
      if (!logs.some(l => l.action === 'GIA_HAN_HOP_DONG')) {
        return INITIAL_AUDIT_LOGS;
      }
      return logs;
    } catch (e) {
      return INITIAL_AUDIT_LOGS;
    }
  },

  saveAuditLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  addAuditLog(action, entity, detail) {
    const user = this.getUser();
    const logs = this.getAuditLogs();
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    logs.unshift({
      time: `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`,
      user: user.fullName || 'Trần Minh Đức',
      role: user.role || 'MANAGER',
      action: action,
      entity: entity,
      detail: detail,
      ip: '14.161.22.89'
    });
    this.saveAuditLogs(logs);
  },

  getRooms() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
  },

  saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  updateRoom(roomId, updateData) {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx !== -1) {
      const oldRoom = rooms[idx];
      rooms[idx] = { ...oldRoom, ...updateData };
      this.saveRooms(rooms);
      const user = this.getUser();
      const oldArea = oldRoom.area;
      const newArea = rooms[idx].area;
      const areaNote = (oldArea !== newArea) ? ` (Đổi diện tích: ${oldArea}m² ➔ ${newArea}m²)` : '';
      const priceFormatted = new Intl.NumberFormat('vi-VN').format(rooms[idx].price) + ' ₫';
      this.addAuditLog(
        'CẬP_NHẬT_PHÒNG',
        `Phòng ${rooms[idx].roomNumber}`,
        `Cập nhật thông tin phòng ${rooms[idx].roomNumber}${areaNote}. Giá: ${priceFormatted}, Loại: ${rooms[idx].type}. Người thực hiện: ${user.fullName || 'Quản lý'}`
      );
      return rooms[idx];
    }
    return null;
  },

  deleteRoom(roomId, force = false) {
    const rooms = this.getRooms();
    const target = rooms.find(r => r.id === roomId);
    if (!target) return { success: false, error: 'Không tìm thấy phòng trong hệ thống!' };

    // Kiểm tra an toàn: Không cho xóa nếu đang có khách thuê và chưa force
    if (target.status === 'OCCUPIED' && target.tenant && !force) {
      return {
        success: false,
        isOccupied: true,
        error: `Không thể xóa phòng ${target.roomNumber} vì đang có khách thuê (${target.tenant}). Vui lòng hoàn tất trả phòng hoặc thanh lý hợp đồng trước khi xóa!`
      };
    }

    const filtered = rooms.filter(r => r.id !== roomId);
    this.saveRooms(filtered);

    const user = this.getUser();
    this.addAuditLog(
      'XÓA_PHÒNG',
      `Phòng ${target.roomNumber}`,
      `Đã xóa phòng ${target.roomNumber} (Diện tích: ${target.area}m²) khỏi cơ sở. Người thực hiện: ${user.fullName || 'Quản lý'}`
    );

    return { success: true, room: target };
  },

  getContracts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
  },

  saveContracts(contracts) {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  },

  getContractTemplate() {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACT_TEMPLATE);
    if (!raw) return { ...DEFAULT_CONTRACT_TEMPLATE };
    try {
      const parsed = JSON.parse(raw);
      const res = { ...DEFAULT_CONTRACT_TEMPLATE, ...parsed };
      if (!res.content) {
        const legacyParts = [
          res.purpose ? `ĐIỀU 1: ĐỐI TƯỢNG VÀ MỤC ĐÍCH HỢP ĐỒNG\n${res.purpose}` : '',
          res.duration ? `ĐIỀU 2: THỜI HẠN THUÊ VÀ GIA HẠN\n${res.duration}` : '',
          res.payment ? `ĐIỀU 3: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN\n${res.payment}` : '',
          res.deposit ? `ĐIỀU 4: TIỀN ĐẶT CỌC BẢO ĐẢM VÀ HOÀN TRẢ\n${res.deposit}` : '',
          res.responsibilities ? `ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN\n${res.responsibilities}` : '',
          res.termination ? `ĐIỀU 6: CHẤM DỨT HỢP ĐỒNG & BỒI THƯỜNG\n${res.termination}` : '',
          res.validity ? `ĐIỀU 7: HIỆU LỰC THI HÀNH\n${res.validity}` : ''
        ].filter(Boolean);
        res.content = legacyParts.length > 0 ? legacyParts.join('\n\n') : DEFAULT_CONTRACT_CONTENT;
      }
      return res;
    } catch (e) {
      return { ...DEFAULT_CONTRACT_TEMPLATE };
    }
  },

  saveContractTemplate(template) {
    localStorage.setItem(STORAGE_KEYS.CONTRACT_TEMPLATE, JSON.stringify(template));
  },

  resetContractTemplate() {
    localStorage.setItem(STORAGE_KEYS.CONTRACT_TEMPLATE, JSON.stringify(DEFAULT_CONTRACT_TEMPLATE));
    return { ...DEFAULT_CONTRACT_TEMPLATE };
  },

  getInvoices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  },

  saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  getMaintenance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
  },

  saveMaintenance(mnt) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(mnt));
  },

  getVisitors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITORS) || '[]');
  },

  saveVisitors(vis) {
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(vis));
  },

  getSepayTxs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEPAY_TXS) || '[]');
  },

  saveSepayTxs(txs) {
    localStorage.setItem(STORAGE_KEYS.SEPAY_TXS, JSON.stringify(txs));
  },

  getSystemConfig() {
    const raw = localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_SYSTEM_CONFIG;
  },

  saveSystemConfig(cfg) {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(cfg));
  },

  getResidents() {
    const raw = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    if (!raw) return INITIAL_RESIDENTS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RESIDENTS;
    } catch (e) {
      return INITIAL_RESIDENTS;
    }
  },

  saveResidents(residents) {
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  },

  getAssetTypes() {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSET_TYPES);
    if (!raw) return INITIAL_ASSET_TYPES;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ASSET_TYPES;
    } catch (e) {
      return INITIAL_ASSET_TYPES;
    }
  },

  saveAssetTypes(types) {
    localStorage.setItem(STORAGE_KEYS.ASSET_TYPES, JSON.stringify(types));
  },

  getAssets() {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!raw) return INITIAL_ASSETS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ASSETS;
    } catch (e) {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets) {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  },

  getAssetAssignments() {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSET_ASSIGNMENTS);
    if (!raw) return INITIAL_ASSET_ASSIGNMENTS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ASSET_ASSIGNMENTS;
    } catch (e) {
      return INITIAL_ASSET_ASSIGNMENTS;
    }
  },

  saveAssetAssignments(assignments) {
    localStorage.setItem(STORAGE_KEYS.ASSET_ASSIGNMENTS, JSON.stringify(assignments));
  },

  createAsset(assetData) {
    // 1. Validate data (Kiểm tra dữ liệu bắt buộc)
    if (!assetData.code || !assetData.code.trim()) {
      return { success: false, field: 'code', error: 'Vui lòng nhập Mã tài sản định danh.' };
    }
    if (!assetData.typeCode) {
      return { success: false, field: 'typeCode', error: 'Vui lòng chọn Loại tài sản (Asset Type).' };
    }
    if (!assetData.name || !assetData.name.trim()) {
      return { success: false, field: 'name', error: 'Vui lòng nhập Tên tài sản/thiết bị.' };
    }
    if (!assetData.buildingId) {
      return { success: false, field: 'buildingId', error: 'Vui lòng chọn Cơ sở / Tòa nhà quản lý.' };
    }

    const cleanCode = assetData.code.trim().toUpperCase();
    const assets = this.getAssets();

    // 2. Duplicate data check (Kiểm tra trùng lặp mã tài sản)
    const duplicate = assets.find(a => a.code.toUpperCase() === cleanCode);
    if (duplicate) {
      return {
        success: false,
        isDuplicate: true,
        field: 'code',
        error: `Trùng lặp dữ liệu: Mã tài sản "${cleanCode}" đã tồn tại trong hệ thống (Tên: ${duplicate.name}, Vị trí: ${duplicate.roomNumber || 'Kho'}). Vui lòng nhập lại mã khác!`
      };
    }

    // 3. Save asset with status = Active (hoặc IN_STOCK)
    const assetTypes = this.getAssetTypes();
    const typeInfo = assetTypes.find(t => t.code === assetData.typeCode) || {};

    const newAsset = {
      id: 'ast-' + Date.now(),
      code: cleanCode,
      typeCode: assetData.typeCode,
      typeName: typeInfo.name || assetData.typeName || 'Thiết bị',
      name: assetData.name.trim(),
      brand: assetData.brand ? assetData.brand.trim() : (typeInfo.defaultBrand || 'Tiêu chuẩn'),
      model: assetData.model ? assetData.model.trim() : '',
      price: parseInt(assetData.price) || 0,
      purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyMonths: parseInt(assetData.warrantyMonths) || 24,
      buildingId: assetData.buildingId,
      roomId: null,
      roomNumber: 'Kho thiết bị',
      status: 'ACTIVE',
      allocationStatus: 'IN_STOCK',
      condition: assetData.condition || 'Mới 100%',
      createdAt: new Date().toISOString()
    };

    assets.unshift(newAsset);
    this.saveAssets(assets);

    // 4. Log activity (Ghi nhật ký kiểm toán hệ thống)
    const user = this.getUser();
    this.addAuditLog(
      'TẠO_TÀI_SẢN_MỚI',
      `Tài sản: ${newAsset.code}`,
      `Người dùng ${user.fullName || 'Nhân sự'} đã tạo mới tài sản [${newAsset.code}] - ${newAsset.name} (Loại: ${newAsset.typeName}) với trạng thái ACTIVE trong kho.`
    );

    return { success: true, asset: newAsset };
  },

  assignAssetToRoom({ assetId, buildingId, roomId, roomNumber, notes }) {
    if (!assetId) {
      return { success: false, error: 'Chưa chọn tài sản cần gán.' };
    }
    if (!roomId || !roomNumber) {
      return { success: false, error: 'Chưa chọn căn hộ / phòng để gán tài sản.' };
    }

    const assets = this.getAssets();
    const targetAsset = assets.find(a => a.id === assetId);
    if (!targetAsset) {
      return { success: false, error: 'Không tìm thấy tài sản trong kho.' };
    }

    const user = this.getUser();
    const nowStr = new Date().toLocaleDateString('vi-VN');

    // Cập nhật tài sản: chuyển sang ASSIGNED và gắn vào phòng
    targetAsset.roomId = roomId;
    targetAsset.roomNumber = roomNumber;
    targetAsset.buildingId = buildingId || targetAsset.buildingId;
    targetAsset.allocationStatus = 'ASSIGNED';
    targetAsset.status = 'ACTIVE';
    targetAsset.assignedAt = nowStr;
    targetAsset.assignedBy = user.fullName || 'Nhân sự StayHub';
    if (notes) targetAsset.conditionNotes = notes;

    this.saveAssets(assets);

    // Tạo bản ghi asset_assignment record
    const assignments = this.getAssetAssignments();
    const newAssignment = {
      id: 'asg-' + Date.now(),
      assetId: targetAsset.id,
      assetCode: targetAsset.code,
      assetName: targetAsset.name,
      typeCode: targetAsset.typeCode,
      typeName: targetAsset.typeName,
      buildingId: targetAsset.buildingId,
      roomId: roomId,
      roomNumber: roomNumber,
      assignedDate: nowStr,
      assignedBy: user.fullName || 'Nhân sự StayHub',
      notes: notes || 'Bàn giao trang bị vào phòng đầy đủ phụ kiện',
      status: 'ACTIVE'
    };

    assignments.unshift(newAssignment);
    this.saveAssetAssignments(assignments);

    // Log activity
    this.addAuditLog(
      'GÁN_TÀI_SẢN_CĂN_HỘ',
      `Phòng: ${roomNumber} - ${targetAsset.code}`,
      `Đã bàn giao và gán tài sản [${targetAsset.code}] - ${targetAsset.name} vào căn hộ ${roomNumber}. Mã bản ghi: ${newAssignment.id}.`
    );

    return { success: true, assignment: newAssignment, asset: targetAsset };
  },

  unassignAsset(assetId) {
    const assets = this.getAssets();
    const target = assets.find(a => a.id === assetId);
    if (!target) return { success: false, error: 'Không tìm thấy tài sản.' };

    const oldRoom = target.roomNumber;
    target.roomId = null;
    target.roomNumber = 'Kho thiết bị';
    target.allocationStatus = 'IN_STOCK';
    target.assignedAt = null;
    target.assignedBy = null;

    this.saveAssets(assets);

    const user = this.getUser();
    this.addAuditLog(
      'THU_HỒI_TÀI_SẢN',
      `Tài sản: ${target.code}`,
      `Đã thu hồi tài sản [${target.code}] - ${target.name} từ phòng ${oldRoom} về kho dự phòng.`
    );

    return { success: true, asset: target };
  },

  getUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'usr-' + Date.now(),
      fullName: userData.fullName || 'Người dùng mới',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'STAFF',
      scope: userData.scope || 'Toàn bộ 3 cơ sở',
      status: userData.status || 'ACTIVE',
      initialPassword: userData.initialPassword || null,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      title: userData.title || 'Nhân sự StayHub',
      cccd: userData.cccd || '',
      room: userData.room || '',
      building: userData.building || '',
      contractCode: userData.contractCode || '',
      createdAt: new Date().toISOString()
    };
    users.unshift(newUser);
    this.saveUsers(users);
    this.addAuditLog('TẠO_TÀI_KHOẢN', `Tài khoản ${newUser.fullName}`, `Tạo mới tài khoản [${newUser.role}] cho ${newUser.email || newUser.phone} (Trạng thái: ${newUser.status})`);
    return newUser;
  },

  updateUser(id, userData) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userData };
      this.saveUsers(users);
      this.addAuditLog('CẬP_NHẬT_TÀI_KHOẢN', `Tài khoản ${users[idx].fullName}`, `Cập nhật thông tin phân quyền [${users[idx].role}] - Trạng thái: ${users[idx].status}`);
      return users[idx];
    }
    return null;
  },

  activateUser(id) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      u.status = 'ACTIVE';
      u.activatedAt = new Date().toISOString();
      const currentUser = this.getUser();
      u.activatedBy = currentUser ? currentUser.fullName : 'Admin';
      this.saveUsers(users);
      this.addAuditLog('KÍCH_HOẠT_TÀI_KHOẢN', `Tài khoản ${u.fullName}`, `Admin phê duyệt cấp quyền truy cập, chuyển trạng thái tài khoản sang ACTIVE.`);
      return u;
    }
    return null;
  },

  toggleUserStatus(id) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      if (u.status === 'INACTIVE') {
        u.status = 'ACTIVE';
        u.activatedAt = new Date().toISOString();
      } else {
        u.status = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      }
      this.saveUsers(users);
      const actionText = u.status === 'LOCKED' ? 'KHÓA_TÀI_KHOẢN' : 'KÍCH_HOẠT_TÀI_KHOẢN';
      this.addAuditLog(actionText, `Tài khoản ${u.fullName}`, `Đổi trạng thái tài khoản sang ${u.status}`);
      return u;
    }
    return null;
  },

  resetUserPassword(id) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      const tempPass = 'StayHub@' + Math.floor(1000 + Math.random() * 9000);
      this.addAuditLog('CẤP_LẠI_MẬT_KHẨU', `Tài khoản ${u.fullName}`, `Cấp mật khẩu tạm mới cho email ${u.email}`);
      return tempPass;
    }
    return null;
  },

  getHandover() {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.HANDOVER) || JSON.stringify(INITIAL_HANDOVER));
    const stored = parsed && typeof parsed === 'object' ? parsed : {};
    const state = {
      ...INITIAL_HANDOVER,
      ...stored,
      assets: Array.isArray(stored.assets) ? stored.assets : INITIAL_HANDOVER.assets.map(asset => ({ ...asset })),
      condition: stored.condition && typeof stored.condition === 'object' ? stored.condition : {},
      photos: Array.isArray(stored.photos) ? stored.photos : []
    };
    state.managerApproved ??= false;
    state.residentApproved ??= false;

    let shouldPersist = false;
    if (['APPOINTMENT_PENDING', 'SCHEDULED'].includes(state.status) && !state.appointmentId) {
      state.appointmentId = `apt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      shouldPersist = true;
    }
    if (state.status === 'SCHEDULED' && !state.appointmentAcceptedBy) {
      state.status = 'APPOINTMENT_PENDING';
      state.appointmentAcceptedAt = '';
      shouldPersist = true;
    }
    if (shouldPersist) {
      localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(state));
    }

    if (['RESIDENT_REVIEW', 'SIGNED', 'MANAGER_REVIEW'].includes(state.status) && state.photos.length === 0) {
      state.status = 'NEEDS_REPAIR';
      state.rejectedBy = 'Hệ thống';
      state.revisionComment = 'Hồ sơ cũ chưa lưu ảnh hiện trạng. Nhân viên cần chụp và gửi lại hồ sơ cho cả quản lý, cư dân.';
      state.managerApproved = false;
      state.residentApproved = false;
      localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(state));
    }

    return state;
  },

  saveHandover(handover) {
    localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(handover));
  }

};

// Auto initialize on script load
DataStore.init();
