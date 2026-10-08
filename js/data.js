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
  SEPAY_TXS: 'stayhub_sepay_txs',
  AUDIT_LOGS: 'stayhub_audit_logs',
  SYSTEM_CONFIG: 'stayhub_system_config',
  CURRENT_BUILDING: 'stayhub_current_building',
  USERS: 'stayhub_users',
  HANDOVER: 'stayhub_handover',
  NOTIFICATIONS: 'stayhub_notifications',
  DRAFT_INVOICES: 'stayhub_draft_invoices'
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

const INITIAL_CONTRACTS = [
  { id: 'ct-001', code: 'HD-2025-001', room: 'P201', building: 'StayHub Central - Ba Đình', tenant: 'Lê Văn An', phone: '0904445566', cccd: '001201004567', startDate: '2025-01-01', endDate: '2026-12-31', rent: 8500000, deposit: 8500000, status: 'ACTIVE' },
  { id: 'ct-002', code: 'HD-2025-002', room: 'P101', building: 'StayHub Central - Ba Đình', tenant: 'Nguyễn Văn Hùng', phone: '0901112233', cccd: '001200001234', startDate: '2025-02-01', endDate: '2026-02-01', rent: 6500000, deposit: 6500000, status: 'EXPIRING_SOON' },
  { id: 'ct-003', code: 'HD-2025-003', room: 'P102', building: 'StayHub Central - Ba Đình', tenant: 'Trần Thị Thu Thảo', phone: '0902223344', cccd: '001202008899', startDate: '2025-03-01', endDate: '2026-03-01', rent: 7500000, deposit: 7500000, status: 'ACTIVE' },
  { id: 'ct-004', code: 'HD-2025-004', room: 'P301', building: 'StayHub Central - Ba Đình', tenant: 'Vũ Đức Nam', phone: '0907778899', cccd: '001201009988', startDate: '2025-04-01', endDate: '2026-10-01', rent: 9500000, deposit: 9500000, status: 'EXPIRING_SOON' }
];

const INITIAL_INVOICES = [
  // --- KỲ THÁNG 09/2026 (ĐÃ THU XONG 100%) ---
  {
    id: 'inv-0901',
    buildingId: 'bld-1',
    code: 'INV-2026-09-P201',
    month: '09/2026',
    room: 'P201',
    building: 'StayHub Central - Quận 1',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    rent: 8500000,
    elecOld: 980,
    elecNew: 1240,
    elecUnits: 260,
    elecRate: 3500,
    elecTotal: 910000,
    waterOld: 72,
    waterNew: 84,
    waterUnits: 12,
    waterRate: 25000,
    waterTotal: 300000,
    serviceFee: 150000,
    total: 9860000,
    status: 'PAID',
    paymentDate: '2026-09-02 09:15',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0902',
    buildingId: 'bld-1',
    code: 'INV-2026-09-P101',
    month: '09/2026',
    room: 'P101',
    building: 'StayHub Central - Quận 1',
    tenant: 'Nguyễn Văn Hùng',
    phone: '0901112233',
    rent: 6500000,
    elecOld: 680,
    elecNew: 890,
    elecUnits: 210,
    elecRate: 3500,
    elecTotal: 735000,
    waterOld: 48,
    waterNew: 58,
    waterUnits: 10,
    waterRate: 25000,
    waterTotal: 250000,
    serviceFee: 150000,
    total: 7635000,
    status: 'PAID',
    paymentDate: '2026-09-03 14:20',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0903',
    buildingId: 'bld-1',
    code: 'INV-2026-09-P102',
    month: '09/2026',
    room: 'P102',
    building: 'StayHub Central - Quận 1',
    tenant: 'Trần Thị Thu Thảo',
    phone: '0902223344',
    rent: 7500000,
    elecOld: 850,
    elecNew: 1100,
    elecUnits: 250,
    elecRate: 3500,
    elecTotal: 875000,
    waterOld: 58,
    waterNew: 70,
    waterUnits: 12,
    waterRate: 25000,
    waterTotal: 300000,
    serviceFee: 150000,
    total: 8825000,
    status: 'PAID',
    paymentDate: '2026-09-02 08:30',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0904',
    buildingId: 'bld-1',
    code: 'INV-2026-09-P301',
    month: '09/2026',
    room: 'P301',
    building: 'StayHub Central - Quận 1',
    tenant: 'Vũ Đức Nam',
    phone: '0907778899',
    rent: 9500000,
    elecOld: 1120,
    elecNew: 1450,
    elecUnits: 330,
    elecRate: 3500,
    elecTotal: 1155000,
    waterOld: 92,
    waterNew: 108,
    waterUnits: 16,
    waterRate: 25000,
    waterTotal: 400000,
    serviceFee: 150000,
    total: 11205000,
    status: 'PAID',
    paymentDate: '2026-09-04 16:45',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0905',
    buildingId: 'bld-2',
    code: 'INV-2026-09-RS101',
    month: '09/2026',
    room: 'P101',
    building: 'StayHub Riverside - Tây Hồ',
    tenant: 'Hà Kiều Oanh',
    phone: '0911223344',
    rent: 8500000,
    elecOld: 290,
    elecNew: 500,
    elecUnits: 210,
    elecRate: 3800,
    elecTotal: 798000,
    waterOld: 28,
    waterNew: 39,
    waterUnits: 11,
    waterRate: 28000,
    waterTotal: 308000,
    serviceFee: 180000,
    total: 9786000,
    status: 'PAID',
    paymentDate: '2026-09-02 11:20',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0906',
    buildingId: 'bld-3',
    code: 'INV-2026-09-ECO101',
    month: '09/2026',
    room: 'P101',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Võ Minh Thắng',
    phone: '0922334455',
    rent: 6200000,
    elecOld: 120,
    elecNew: 330,
    elecUnits: 210,
    elecRate: 3600,
    elecTotal: 756000,
    waterOld: 15,
    waterNew: 26,
    waterUnits: 11,
    waterRate: 26000,
    waterTotal: 286000,
    serviceFee: 160000,
    total: 7402000,
    status: 'PAID',
    paymentDate: '2026-09-03 09:00',
    method: 'VietQR SePay'
  },
  {
    id: 'inv-0907',
    buildingId: 'bld-3',
    code: 'INV-2026-09-ECO102',
    month: '09/2026',
    room: 'P102',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Mai Thanh Tâm',
    phone: '0923344556',
    rent: 7200000,
    elecOld: 170,
    elecNew: 410,
    elecUnits: 240,
    elecRate: 3600,
    elecTotal: 864000,
    waterOld: 18,
    waterNew: 32,
    waterUnits: 14,
    waterRate: 26000,
    waterTotal: 364000,
    serviceFee: 160000,
    total: 8588000,
    status: 'PAID',
    paymentDate: '2026-09-03 10:15',
    method: 'VietQR SePay'
  },

  // --- KỲ THÁNG 10/2026 (KỲ HIỆN TẠI: ĐANG THU & ĐỐI SOÁT SEPAY) ---
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
    waterOld: 84,
    waterNew: 92,
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
    waterOld: 58,
    waterNew: 64,
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
    waterOld: 70,
    waterNew: 78,
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
    waterOld: 108,
    waterNew: 119,
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
    elecRate: 3800,
    elecTotal: 570000,
    waterOld: 39,
    waterNew: 47,
    waterUnits: 8,
    waterRate: 28000,
    waterTotal: 224000,
    serviceFee: 180000,
    total: 9474000,
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
    elecOld: 330,
    elecNew: 460,
    elecUnits: 130,
    elecRate: 3600,
    elecTotal: 468000,
    waterOld: 26,
    waterNew: 33,
    waterUnits: 7,
    waterRate: 26000,
    waterTotal: 182000,
    serviceFee: 160000,
    total: 7010000,
    status: 'UNPAID',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-3002',
    buildingId: 'bld-3',
    code: 'INV-2026-10-ECO102',
    month: '10/2026',
    room: 'P102',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Mai Thanh Tâm',
    phone: '0923344556',
    rent: 7200000,
    elecOld: 410,
    elecNew: 545,
    elecUnits: 135,
    elecRate: 3600,
    elecTotal: 486000,
    waterOld: 32,
    waterNew: 39,
    waterUnits: 7,
    waterRate: 26000,
    waterTotal: 182000,
    serviceFee: 160000,
    total: 8028000,
    status: 'PAID',
    paymentDate: '2026-10-04 15:30',
    method: 'VietQR SePay'
  },

  // --- KỲ THÁNG 11/2026 (KỲ TIẾP THEO - BẢN NHÁP/CHUẨN BỊ PHÁT HÀNH) ---
  {
    id: 'inv-1101',
    buildingId: 'bld-1',
    code: 'INV-2026-11-P201',
    month: '11/2026',
    room: 'P201',
    building: 'StayHub Central - Quận 1',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    rent: 8500000,
    elecOld: 1410,
    elecNew: 1605,
    elecUnits: 195,
    elecRate: 3500,
    elecTotal: 682500,
    waterOld: 92,
    waterNew: 101,
    waterUnits: 9,
    waterRate: 25000,
    waterTotal: 225000,
    serviceFee: 150000,
    total: 9557500,
    status: 'DRAFT',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-1102',
    buildingId: 'bld-1',
    code: 'INV-2026-11-P101',
    month: '11/2026',
    room: 'P101',
    building: 'StayHub Central - Quận 1',
    tenant: 'Nguyễn Văn Hùng',
    phone: '0901112233',
    rent: 6500000,
    elecOld: 1025,
    elecNew: 1195,
    elecUnits: 170,
    elecRate: 3500,
    elecTotal: 595000,
    waterOld: 64,
    waterNew: 72,
    waterUnits: 8,
    waterRate: 25000,
    waterTotal: 200000,
    serviceFee: 150000,
    total: 7445000,
    status: 'DRAFT',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-1103',
    buildingId: 'bld-1',
    code: 'INV-2026-11-P102',
    month: '11/2026',
    room: 'P102',
    building: 'StayHub Central - Quận 1',
    tenant: 'Trần Thị Thu Thảo',
    phone: '0902223344',
    rent: 7500000,
    elecOld: 1260,
    elecNew: 1375,
    elecUnits: 115,
    elecRate: 3500,
    elecTotal: 402500,
    waterOld: 78,
    waterNew: 83,
    waterUnits: 5,
    waterRate: 25000,
    waterTotal: 125000,
    serviceFee: 150000,
    total: 8177500,
    status: 'DRAFT',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-1104',
    buildingId: 'bld-1',
    code: 'INV-2026-11-P301',
    month: '11/2026',
    room: 'P301',
    building: 'StayHub Central - Quận 1',
    tenant: 'Vũ Đức Nam',
    phone: '0907778899',
    rent: 9500000,
    elecOld: 1680,
    elecNew: 1960,
    elecUnits: 280,
    elecRate: 3500,
    elecTotal: 980000,
    waterOld: 119,
    waterNew: 133,
    waterUnits: 14,
    waterRate: 25000,
    waterTotal: 350000,
    serviceFee: 150000,
    total: 10980000,
    status: 'DRAFT',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-3101',
    buildingId: 'bld-3',
    code: 'INV-2026-11-ECO101',
    month: '11/2026',
    room: 'P101',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Võ Minh Thắng',
    phone: '0922334455',
    rent: 6200000,
    elecOld: 460,
    elecNew: 625,
    elecUnits: 165,
    elecRate: 3600,
    elecTotal: 594000,
    waterOld: 33,
    waterNew: 42,
    waterUnits: 9,
    waterRate: 26000,
    waterTotal: 234000,
    serviceFee: 160000,
    total: 7188000,
    status: 'DRAFT',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-3102',
    buildingId: 'bld-3',
    code: 'INV-2026-11-ECO102',
    month: '11/2026',
    room: 'P102',
    building: 'StayHub Eco - Cầu Giấy',
    tenant: 'Mai Thanh Tâm',
    phone: '0923344556',
    rent: 7200000,
    elecOld: 545,
    elecNew: 660,
    elecUnits: 115,
    elecRate: 3600,
    elecTotal: 414000,
    waterOld: 39,
    waterNew: 45,
    waterUnits: 6,
    waterRate: 26000,
    waterTotal: 156000,
    serviceFee: 160000,
    total: 7930000,
    status: 'DRAFT',
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
  { id: 'vis-01', guestName: 'Nguyễn Thu Huyền', cccd: '001198003421', phone: '0988112233', hostRoom: 'P201', hostTenant: 'Lê Văn An', timeExpected: '2026-10-02 18:30', status: 'APPROVED', stayType: 'DAILY', isOvernight: false, note: 'Bạn đại học ghé ăn tối (rời trước 22:00)', reviewedBy: 'Phạm Tuấn Anh (Staff Duyệt trong ngày)' },
  { id: 'vis-02', guestName: 'Phạm Quốc Bảo', cccd: '034200008765', phone: '0977223344', hostRoom: 'P102', hostTenant: 'Trần Thị Thu Thảo', timeExpected: '2026-10-02 14:00', status: 'IN_BUILDING', stayType: 'DAILY', isOvernight: false, note: 'Giao tài liệu công ty', reviewedBy: 'Phạm Tuấn Anh (Staff Duyệt trong ngày)', checkInTime: '2026-10-02 14:05' },
  { id: 'vis-03', guestName: 'Vũ Minh Khôi', cccd: '001201007744', phone: '0966334455', hostRoom: 'P301', hostTenant: 'Vũ Đức Nam', timeExpected: '2026-10-02 20:00', status: 'PENDING', stayType: 'DAILY', isOvernight: false, note: 'Em trai đến thăm ăn cơm tối (về trước 22:30 - Staff duyệt)' },
  { id: 'vis-04', guestName: 'Hoàng Văn Bách', cccd: '001200009988', phone: '0912334455', hostRoom: 'P201', hostTenant: 'Lê Văn An', timeExpected: '2026-10-03 22:30', status: 'FORWARDED_MANAGER', stayType: 'OVERNIGHT', isOvernight: true, note: 'Khách ở lại qua đêm - Chờ Manager duyệt', reviewedBy: 'Phạm Tuấn Anh (Staff tiếp nhận & chuyển Manager)' },
  { id: 'vis-05', guestName: 'Trịnh Thanh Tùng', cccd: '034200005522', phone: '0933445566', hostRoom: 'P101', hostTenant: 'Nguyễn Văn Hùng', timeExpected: '2026-10-01 23:45', status: 'REJECTED', stayType: 'OVERNIGHT', isOvernight: true, note: 'Xin ở lại qua đêm nhưng không đủ CCCD và quá giờ giới nghiêm', reviewedBy: 'Trần Minh Đức (Manager)', rejectReason: 'Quá giờ giới nghiêm tòa nhà theo điều 5 nội quy và không đủ giấy tờ' },
  { id: 'vis-06', guestName: 'Đỗ Thùy Linh', cccd: '001199002233', phone: '0988776655', hostRoom: 'P204', hostTenant: 'Đỗ Thùy Trang', timeExpected: '2026-10-01 10:00', status: 'DEPARTED', stayType: 'DAILY', isOvernight: false, note: 'Chị gái sang chơi nấu cơm', reviewedBy: 'Phạm Tuấn Anh (Staff Duyệt trong ngày)', checkInTime: '2026-10-01 10:15', checkOutTime: '2026-10-01 16:30' },
  { id: 'vis-07', guestName: 'Lâm Bảo Châu', cccd: '079201005588', phone: '0918889922', hostRoom: 'P201', hostTenant: 'Lê Văn An', timeExpected: '2026-10-04 21:00', status: 'PENDING', stayType: 'OVERNIGHT', isOvernight: true, note: 'Bạn ở lại qua đêm thứ Bảy - Cần Manager duyệt' }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'ntf-01',
    title: 'Phát hành thông báo tiền phòng & điện nước tháng 10/2026',
    category: 'INVOICE',
    content: 'Hóa đơn kỳ thu phí tháng 10/2026 đã sẵn sàng. Quý cư dân vui lòng kiểm tra và quét mã VietQR để thanh toán trước ngày 05/10/2026.',
    scope: 'Cư dân đang thuê',
    channel: 'BOTH',
    time: '01/10/2026 08:00',
    read: false
  },
  {
    id: 'ntf-02',
    title: 'Thông báo duyệt khách đến thăm căn hộ P201',
    category: 'VISITOR',
    content: 'Ban quản lý đã phê duyệt đăng ký khách thăm: Nguyễn Thu Huyền (CCCD: 001198003421). Thời gian dự kiến: 18:30 ngày 02/10/2026.',
    scope: 'Lê Văn An (P201)',
    channel: 'BOTH',
    time: '02/10/2026 10:00',
    read: true
  },
  {
    id: 'ntf-03',
    title: 'Thông báo bảo dưỡng định kỳ hệ thống thang máy',
    category: 'MAINTENANCE',
    content: 'Ban quản lý sẽ tiến hành bảo dưỡng toàn bộ hệ thống kỹ thuật từ 13:30 - 15:30 chiều Thứ Bảy. Thang máy sẽ tạm ngưng trong khoảng 30 phút.',
    scope: 'Toàn bộ cư dân',
    channel: 'APP',
    time: '01/10/2026 09:00',
    read: true
  }
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

// Seed Utility Readings for multiple billing cycles (09/2026, 10/2026, 11/2026)
// Old index (Chỉ số cũ) inherits from previous month's new index (Chỉ số mới).
const INITIAL_UTILITIES = {
  '09/2026': {
    status: 'LOCKED',
    updatedAt: '2026-09-30 18:00',
    readings: {
      'rm-101': { eOld: 680, eNew: 890, wOld: 48, wNew: 58 },   // Tiêu thụ: 210 kWh, 10 m³
      'rm-102': { eOld: 850, eNew: 1100, wOld: 58, wNew: 70 },  // Tiêu thụ: 250 kWh, 12 m³
      'rm-104': { eOld: 740, eNew: 920, wOld: 45, wNew: 54 },   // Tiêu thụ: 180 kWh, 9 m³
      'rm-201': { eOld: 980, eNew: 1240, wOld: 72, wNew: 84 },  // Tiêu thụ: 260 kWh, 12 m³
      'rm-203': { eOld: 810, eNew: 995, wOld: 50, wNew: 59 },   // Tiêu thụ: 185 kWh, 9 m³
      'rm-204': { eOld: 710, eNew: 950, wOld: 42, wNew: 53 },   // Tiêu thụ: 240 kWh, 11 m³
      'rm-301': { eOld: 1120, eNew: 1450, wOld: 92, wNew: 108 },// Tiêu thụ: 330 kWh, 16 m³
      'rm-303': { eOld: 830, eNew: 1045, wOld: 56, wNew: 66 },  // Tiêu thụ: 215 kWh, 10 m³
      'rm-b2-101': { eOld: 290, eNew: 500, wOld: 28, wNew: 39 },// Tiêu thụ: 210 kWh, 11 m³
      'rm-b2-102': { eOld: 360, eNew: 560, wOld: 34, wNew: 44 },// Tiêu thụ: 200 kWh, 10 m³
      'rm-b2-201': { eOld: 500, eNew: 740, wOld: 38, wNew: 50 },// Tiêu thụ: 240 kWh, 12 m³
      'rm-b3-101': { eOld: 120, eNew: 330, wOld: 15, wNew: 26 },// Tiêu thụ: 210 kWh, 11 m³
      'rm-b3-102': { eOld: 170, eNew: 410, wOld: 18, wNew: 32 } // Tiêu thụ: 240 kWh, 14 m³
    }
  },
  '10/2026': {
    status: 'LOCKED',
    updatedAt: '2026-10-02 08:30',
    readings: {
      'rm-101': { eOld: 890, eNew: 1025, wOld: 58, wNew: 64 },  // Tiêu thụ: 135 kWh, 6 m³
      'rm-102': { eOld: 1100, eNew: 1260, wOld: 70, wNew: 78 }, // Tiêu thụ: 160 kWh, 8 m³
      'rm-104': { eOld: 920, eNew: 1045, wOld: 54, wNew: 60 },  // Tiêu thụ: 125 kWh, 6 m³
      'rm-201': { eOld: 1240, eNew: 1410, wOld: 84, wNew: 92 }, // Tiêu thụ: 170 kWh, 8 m³
      'rm-203': { eOld: 995, eNew: 1120, wOld: 59, wNew: 66 },  // Tiêu thụ: 125 kWh, 7 m³
      'rm-204': { eOld: 950, eNew: 1110, wOld: 53, wNew: 60 },  // Tiêu thụ: 160 kWh, 7 m³
      'rm-301': { eOld: 1450, eNew: 1680, wOld: 108, wNew: 119 },// Tiêu thụ: 230 kWh, 11 m³
      'rm-303': { eOld: 1045, eNew: 1180, wOld: 66, wNew: 73 }, // Tiêu thụ: 135 kWh, 7 m³
      'rm-b2-101': { eOld: 500, eNew: 650, wOld: 39, wNew: 47 }, // Tiêu thụ: 150 kWh, 8 m³
      'rm-b2-102': { eOld: 560, eNew: 710, wOld: 44, wNew: 52 }, // Tiêu thụ: 150 kWh, 8 m³
      'rm-b2-201': { eOld: 740, eNew: 915, wOld: 50, wNew: 59 }, // Tiêu thụ: 175 kWh, 9 m³
      'rm-b3-101': { eOld: 330, eNew: 460, wOld: 26, wNew: 33 }, // Tiêu thụ: 130 kWh, 7 m³
      'rm-b3-102': { eOld: 410, eNew: 545, wOld: 32, wNew: 39 }  // Tiêu thụ: 135 kWh, 7 m³
    }
  },
  '11/2026': {
    status: 'IN_PROGRESS',
    updatedAt: '2026-10-07 14:00',
    readings: {
      'rm-101': { eOld: 1025, eNew: 1195, wOld: 64, wNew: 72 }, // Tiêu thụ: 170 kWh, 8 m³
      'rm-102': { eOld: 1260, eNew: 1375, wOld: 78, wNew: 83 }, // Tiêu thụ: 115 kWh, 5 m³ (về quê 2 tuần)
      'rm-104': { eOld: 1045, eNew: 1190, wOld: 60, wNew: 67 }, // Tiêu thụ: 145 kWh, 7 m³
      'rm-201': { eOld: 1410, eNew: 1605, wOld: 92, wNew: 101 },// Tiêu thụ: 195 kWh, 9 m³
      'rm-203': { eOld: 1120, eNew: 1270, wOld: 66, wNew: 74 }, // Tiêu thụ: 150 kWh, 8 m³
      'rm-204': { eOld: 1110, eNew: 1245, wOld: 60, wNew: 66 }, // Tiêu thụ: 135 kWh, 6 m³
      'rm-301': { eOld: 1680, eNew: 1960, wOld: 119, wNew: 133 },// Tiêu thụ: 280 kWh, 14 m³
      'rm-303': { eOld: 1180, eNew: 1345, wOld: 73, wNew: 81 }, // Tiêu thụ: 165 kWh, 8 m³
      'rm-b2-101': { eOld: 650, eNew: 825, wOld: 47, wNew: 56 }, // Tiêu thụ: 175 kWh, 9 m³
      'rm-b2-102': { eOld: 710, eNew: 840, wOld: 52, wNew: 58 }, // Tiêu thụ: 130 kWh, 6 m³
      'rm-b2-201': { eOld: 915, eNew: 1110, wOld: 59, wNew: 69 },// Tiêu thụ: 195 kWh, 10 m³
      'rm-b3-101': { eOld: 460, eNew: 625, wOld: 33, wNew: 42 }, // Tiêu thụ: 165 kWh, 9 m³
      'rm-b3-102': { eOld: 545, eNew: 660, wOld: 39, wNew: 45 }  // Tiêu thụ: 115 kWh, 6 m³
    }
  }
};

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
    const DATA_VERSION = 'v2.2';
    const storedVersion = localStorage.getItem('stayhub_data_version');
    if (storedVersion !== DATA_VERSION) {
      localStorage.setItem('stayhub_data_version', DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(INITIAL_UTILITIES));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }

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
    if (!localStorage.getItem(STORAGE_KEYS.UTILITIES)) {
      localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(INITIAL_UTILITIES));
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
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HANDOVER)) {
      localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(INITIAL_HANDOVER));
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

  getContracts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
  },

  saveContracts(contracts) {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  },

  getInvoices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  },

  saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  getUtilitiesData() {
    const raw = localStorage.getItem(STORAGE_KEYS.UTILITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(INITIAL_UTILITIES));
      return INITIAL_UTILITIES;
    }
    try {
      const parsed = JSON.parse(raw);
      let changed = false;
      ['09/2026', '10/2026', '11/2026'].forEach(k => {
        if (!parsed[k]) {
          parsed[k] = INITIAL_UTILITIES[k];
          changed = true;
        }
      });
      // Ensure all past cycles (prior to active month 11/2026) are strictly marked LOCKED
      Object.keys(parsed).forEach(k => {
        const [m, y] = k.split('/').map(Number);
        if ((y < 2026) || (y === 2026 && m < 11)) {
          if (parsed[k].status !== 'LOCKED') {
            parsed[k].status = 'LOCKED';
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return INITIAL_UTILITIES;
    }
  },

  getAvailableUtilityCycles() {
    const all = this.getUtilitiesData();
    const cycles = Object.keys(all);
    cycles.sort((a, b) => {
      const [ma, ya] = a.split('/').map(Number);
      const [mb, yb] = b.split('/').map(Number);
      return (ya * 12 + ma) - (yb * 12 + mb);
    });
    return cycles;
  },

  getUtilityCycle(cycle) {
    const all = this.getUtilitiesData();
    if (all[cycle]) {
      const [mc, yc] = cycle.split('/').map(Number);
      if ((yc < 2026) || (yc === 2026 && mc < 11)) {
        all[cycle].status = 'LOCKED';
      }
      return all[cycle];
    }

    // Auto inherit old numbers from the most recent prior cycle
    const previousCycles = this.getAvailableUtilityCycles().filter(c => {
      const [mc, yc] = c.split('/').map(Number);
      const [mt, yt] = cycle.split('/').map(Number);
      return (yc * 12 + mc) < (yt * 12 + mt);
    });
    const lastCycleKey = previousCycles[previousCycles.length - 1] || '10/2026';
    const lastCycle = all[lastCycleKey] || all['10/2026'] || {};

    const newReadings = {};
    if (lastCycle && lastCycle.readings) {
      Object.keys(lastCycle.readings).forEach(roomId => {
        const prev = lastCycle.readings[roomId];
        newReadings[roomId] = {
          eOld: prev.eNew || 0,
          eNew: prev.eNew || 0,
          wOld: prev.wNew || 0,
          wNew: prev.wNew || 0
        };
      });
    }

    const [targetM, targetY] = cycle.split('/').map(Number);
    const isPast = (targetY < 2026) || (targetY === 2026 && targetM < 11);

    all[cycle] = {
      status: isPast ? 'LOCKED' : 'IN_PROGRESS',
      updatedAt: '',
      readings: newReadings
    };
    localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(all));
    return all[cycle];
  },

  saveUtilityCycle(cycle, readings, status = 'RECORDED', auditDetail = '') {
    const all = this.getUtilitiesData();
    all[cycle] = {
      status: status,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      readings: readings
    };
    localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(all));

    // Synchronize matching invoices for this cycle if present
    const invoices = this.getInvoices();
    let updatedInvoicesCount = 0;
    const buildings = this.getBuildings();
    const rooms = this.getRooms();

    invoices.forEach(inv => {
      if (inv.month === cycle) {
        const room = rooms.find(r => r.roomNumber === inv.room && (!inv.buildingId || r.buildingId === inv.buildingId));
        if (room && readings[room.id]) {
          const rd = readings[room.id];
          const bld = buildings.find(b => b.id === inv.buildingId) || buildings[0];
          const eRate = inv.elecRate || bld.elecRate || 3500;
          const wRate = inv.waterRate || bld.waterRate || 25000;
          const eUnits = Math.max(0, rd.eNew - rd.eOld);
          const wUnits = Math.max(0, rd.wNew - rd.wOld);
          const eMoney = eUnits * eRate;
          const wMoney = wUnits * wRate;

          inv.elecOld = rd.eOld;
          inv.elecNew = rd.eNew;
          inv.elecUnits = eUnits;
          inv.elecTotal = eMoney;
          inv.waterOld = rd.wOld;
          inv.waterNew = rd.wNew;
          inv.waterUnits = wUnits;
          inv.waterTotal = wMoney;
          inv.total = (inv.rent || 0) + eMoney + wMoney + (inv.serviceFee || bld.serviceFee || 150000) + (inv.otherFees || 0);
          updatedInvoicesCount++;
        }
      }
    });

    if (updatedInvoicesCount > 0) {
      this.saveInvoices(invoices);
    }

    this.addAuditLog(
      'CHỐT_CHỈ_SỐ_ĐIỆN_NƯỚC',
      `Kỳ ${cycle}`,
      auditDetail || `Lưu chỉ số điện nước kỳ tháng ${cycle} cho ${Object.keys(readings).length} phòng, cập nhật ${updatedInvoicesCount} hóa đơn liên quan.`
    );

    return all[cycle];
  },

  getMaintenance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
  },

  saveMaintenance(mnt) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(mnt));
  },

  getVisitors() {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITORS);
    let list = INITIAL_VISITORS;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          list = parsed;
        }
      } catch (e) {}
    }
    return list.map(v => {
      const isOvernight = v.isOvernight !== undefined
        ? Boolean(v.isOvernight)
        : (v.stayType === 'OVERNIGHT' || (v.note && (v.note.toLowerCase().includes('qua đêm') || v.note.toLowerCase().includes('sau 23h'))));
      let note = v.note || '';
      note = note.replace(/Quản lý \(Manager\)/g, 'Manager')
                 .replace(/quản lý \(manager\)/gi, 'Manager')
                 .replace(/Quản lý/g, 'Manager')
                 .replace(/quản lý/g, 'Manager');
      let reviewedBy = v.reviewedBy || '';
      reviewedBy = reviewedBy.replace(/Quản lý/g, 'Manager').replace(/quản lý/g, 'Manager');
      return {
        ...v,
        stayType: isOvernight ? 'OVERNIGHT' : 'DAILY',
        isOvernight: isOvernight,
        note: note,
        reviewedBy: reviewedBy
      };
    });
  },

  saveVisitors(vis) {
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(vis));
  },

  approveVisitorByStaff(id) {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      if (item.isOvernight) {
        // Khách ở qua đêm: Staff không duyệt thẳng được, phải chuyển tiếp Manager duyệt!
        return this.forwardVisitorToManager(id, 'Hồ sơ lưu trú qua đêm chuyển Manager phê duyệt theo quy chế');
      }
      item.status = 'APPROVED';
      item.reviewedBy = 'Phạm Tuấn Anh (Staff Duyệt trong ngày)';
      item.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('DUYET_KHACH_THAM_STAFF', `Khách ${item.guestName}`, `Nhân viên vận hành duyệt cho khách thăm trong ngày phòng ${item.hostRoom} (Không cần qua Manager)`);
      this.addNotification({
        title: `Yêu cầu khách thăm trong ngày đã được duyệt (${item.guestName})`,
        category: 'VISITOR',
        content: `Nhân viên vận hành đã duyệt đăng ký khách thăm trong ngày: ${item.guestName} đến căn hộ ${item.hostRoom}. Khách có thể vào tòa nhà theo giờ hẹn.`,
        scope: `${item.hostTenant} (${item.hostRoom})`,
        channel: 'BOTH'
      });
    }
    return item;
  },

  forwardVisitorToManager(id, note = 'Khách ở qua đêm - Cần Manager phê duyệt') {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = 'FORWARDED_MANAGER';
      item.forwardNote = note;
      item.reviewedBy = 'Phạm Tuấn Anh (Staff tiếp nhận & chuyển Manager)';
      item.forwardedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('CHUYEN_DUYET_KHACH_MANAGER', `Khách ${item.guestName}`, `Nhân viên tiếp nhận và chuyển hồ sơ khách lưu trú qua đêm phòng ${item.hostRoom} lên Manager phê duyệt`);
      this.addNotification({
        title: `Hồ sơ khách qua đêm đã chuyển Manager (${item.guestName})`,
        category: 'VISITOR',
        content: `Đăng ký khách lưu trú qua đêm ${item.guestName} tại căn hộ ${item.hostRoom} đã được nhân viên tiếp nhận và chuyển tiếp lên Manager phê duyệt.`,
        scope: `${item.hostTenant} (${item.hostRoom})`,
        channel: 'APP'
      });
    }
    return item;
  },

  approveVisitorByManager(id) {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = 'APPROVED';
      item.reviewedBy = 'Trần Minh Đức (Manager Đồng Ý Duyệt Qua Đêm)';
      item.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('DUYET_KHACH_THAM_MANAGER', `Khách ${item.guestName}`, `Quản lý (Manager) đã đồng ý phê duyệt cho khách lưu trú qua đêm tại phòng ${item.hostRoom}`);
      this.addNotification({
        title: `Manager đã phê duyệt khách lưu trú qua đêm (${item.guestName})`,
        category: 'VISITOR',
        content: `Quản lý cơ sở (Manager) đã chính thức đồng ý phê duyệt đăng ký lưu trú qua đêm: ${item.guestName} tại căn hộ ${item.hostRoom}.`,
        scope: `${item.hostTenant} (${item.hostRoom})`,
        channel: 'BOTH'
      });
    }
    return item;
  },

  rejectVisitor(id, reason, reviewerName = 'Quản lý / Nhân viên') {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = 'REJECTED';
      item.rejectReason = reason || 'Không đáp ứng quy định ra vào tòa nhà';
      item.reviewedBy = reviewerName;
      item.rejectedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('TU_CHOI_KHACH_THAM', `Khách ${item.guestName}`, `Từ chối cho phép khách thăm phòng ${item.hostRoom}. Lý do: ${item.rejectReason}`);
      this.addNotification({
        title: `Yêu cầu khách thăm bị từ chối (${item.guestName})`,
        category: 'VISITOR',
        content: `Đăng ký khách thăm ${item.guestName} phòng ${item.hostRoom} đã bị từ chối. Lý do: ${item.rejectReason}.`,
        scope: `${item.hostTenant} (${item.hostRoom})`,
        channel: 'BOTH'
      });
    }
    return item;
  },

  checkinVisitor(id) {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = 'IN_BUILDING';
      item.checkInTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('CHECKIN_KHACH_THAM', `Khách ${item.guestName}`, `Ghi nhận khách vào tòa nhà, lên phòng ${item.hostRoom} lúc ${item.checkInTime}`);
    }
    return item;
  },

  checkoutVisitor(id) {
    const list = this.getVisitors();
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = 'DEPARTED';
      item.checkOutTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveVisitors(list);
      this.addAuditLog('CHECKOUT_KHACH_THAM', `Khách ${item.guestName}`, `Ghi nhận khách rời tòa nhà lúc ${item.checkOutTime}`);
    }
    return item;
  },

  getNotifications() {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return INITIAL_NOTIFICATIONS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  addNotification(notifData) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: 'ntf-' + Date.now(),
      title: notifData.title || 'Thông báo mới',
      category: notifData.category || 'GENERAL',
      content: notifData.content || '',
      scope: notifData.scope || 'Toàn bộ cư dân',
      channel: notifData.channel || 'BOTH',
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    return newNotif;
  },

  getDraftInvoices() {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_INVOICES);
    return raw ? JSON.parse(raw) : [];
  },

  saveDraftInvoices(drafts) {
    localStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(drafts));
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
      status: 'ACTIVE',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      title: userData.title || 'Nhân sự StayHub'
    };
    users.unshift(newUser);
    this.saveUsers(users);
    this.addAuditLog('TẠO_TÀI_KHOẢN', `Tài khoản ${newUser.fullName}`, `Tạo mới tài khoản [${newUser.role}] cho ${newUser.email}`);
    return newUser;
  },

  updateUser(id, userData) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userData };
      this.saveUsers(users);
      this.addAuditLog('CẬP_NHẬT_TÀI_KHOẢN', `Tài khoản ${users[idx].fullName}`, `Cập nhật thông tin phân quyền [${users[idx].role}]`);
      return users[idx];
    }
    return null;
  },

  toggleUserStatus(id) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      u.status = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      this.saveUsers(users);
      const actionText = u.status === 'LOCKED' ? 'KHÓA_TÀI_KHOẢN' : 'MỞ_KHÓA_TÀI_KHOẢN';
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
