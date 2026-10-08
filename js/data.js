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
  SETTLEMENTS: 'stayhub_settlements',
  CHECKOUT: 'stayhub_checkout_requests'
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
  { id: 'ct-004', code: 'HD-2025-004', room: 'P301', building: 'StayHub Central - Ba Đình', tenant: 'Vũ Đức Nam', phone: '0907778899', cccd: '001201009988', startDate: '2025-04-01', endDate: '2026-10-01', rent: 9500000, deposit: 9500000, status: 'EXPIRING_SOON' },
  { id: 'ct-005', code: 'HD-2025-112', room: 'P402', building: 'StayHub Central - Ba Đình', tenant: 'Trần Thu Trang', phone: '0908889900', startDate: '2025-01-01', endDate: '2026-09-30', rent: 10000000, deposit: 10000000, status: 'EXPIRED' }
];

const INITIAL_INVOICES = [
  {
    id: 'inv-1001',
    residentId: 'usr-res-1',
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

// Demo monthly bills for the resident payment flow. Existing stored bills are
// never replaced by these examples, including their payment attempts/history.
const RESIDENT_DEMO_INVOICES = [
  {
    id: 'inv-res-2026-09',
    residentId: 'usr-res-1',
    isDemo: true,
    code: 'INV-2026-09-P201',
    month: '09/2026',
    dueDate: '2026-09-05',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    rent: 8500000,
    elecOld: 1080,
    elecNew: 1240,
    elecUnits: 160,
    elecRate: 3500,
    elecTotal: 560000,
    waterOld: 78,
    waterNew: 85,
    waterUnits: 7,
    waterRate: 25000,
    waterTotal: 175000,
    serviceFee: 150000,
    total: 9385000,
    status: 'UNPAID',
    paymentDate: null,
    method: null
  },
  {
    id: 'inv-res-2026-08',
    residentId: 'usr-res-1',
    isDemo: true,
    code: 'INV-2026-08-P201',
    month: '08/2026',
    dueDate: '2026-08-05',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    rent: 8500000,
    elecOld: 930,
    elecNew: 1080,
    elecUnits: 150,
    elecRate: 3500,
    elecTotal: 525000,
    waterOld: 71,
    waterNew: 78,
    waterUnits: 7,
    waterRate: 25000,
    waterTotal: 175000,
    serviceFee: 150000,
    total: 9350000,
    status: 'PAID',
    paymentDate: '2026-08-03 09:15',
    method: 'VietQR SePay (demo)'
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

const INITIAL_CHECKOUT_REQUESTS = [
  {
    id: 'req-01',
    contractCode: 'HD-2025-001',
    contractEndDate: '2026-12-31',
    contractStatusAtRequest: 'ACTIVE',
    isEarlyCheckout: true,
    depositSettlementStatus: 'PENDING_SETTLEMENT',
    code: 'REQ-OUT-2026-0045',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    deposit: 8500000,
    requestDate: '2026-10-05',
    expectedDate: '2026-10-20',
    timeslot: '14:30',
    status: 'PENDING_APPROVAL', // Staff Phạm Tuấn Anh ĐÃ NGHIỆM THU XONG lúc 14:30 -> Chờ Quản lý duyệt quyết toán
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 1450,
    meterElectricCurr: 1580,
    electricRate: 3000,
    meterWaterPrev: 60,
    meterWaterCurr: 65,
    waterRate: 12000,
    damages: [
      { item: 'Rèm cửa chống nắng', issue: 'Hư hỏng nhẹ (rách mép)', cost: 350000 }
    ],
    cleaningFee: 0,
    notes: 'Kỹ thuật viên Phạm Tuấn Anh đã kiểm tra phòng lúc 14:30 ngày 20/10. Đã chốt số điện nước, lập biên bản hư hại rèm cửa; yêu cầu trả phòng trước hạn nên tiền cọc không được hoàn, chờ Quản lý xem xét.',
    bankAccount: { bank: 'MB Bank', accountNumber: '0904445566', accountName: 'LE VAN AN' },
    refundAmount: 0,
    isSigned: false,
    disputeReason: null,
  },
  {
    id: 'req-04',
    code: 'REQ-OUT-2026-0049',
    room: 'P402',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Trần Thu Trang',
    phone: '0908889900',
    contractCode: 'HD-2025-112',
    contractEndDate: '2026-09-30',
    contractStatusAtRequest: 'EXPIRED',
    isEarlyCheckout: false,
    depositSettlementStatus: 'REFUND_PENDING',
    deposit: 10000000,
    requestDate: '2026-10-01',
    expectedDate: '2026-10-18',
    timeslot: '10:00',
    status: 'REFUND_PENDING', // Cư dân đã ký, chờ Quản lý duyệt lệnh chi UNC hoàn cọc
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 1800,
    meterElectricCurr: 1950,
    electricRate: 3000,
    meterWaterPrev: 80,
    meterWaterCurr: 85,
    waterRate: 12000,
    damages: [
      { item: 'Sơn tường phòng ngủ', issue: 'Vết ố bẩn khó tẩy', cost: 290000 }
    ],
    cleaningFee: 0,
    notes: 'Staff đã nghiệm thu, cư dân đã ký biên bản thanh lý. Chờ Quản lý phê duyệt lệnh chi hoàn cọc 9.200.000 ₫.',
    bankAccount: { bank: 'Techcombank', accountNumber: '1903332211', accountName: 'TRAN THU TRANG' },
    refundAmount: 9200000,
    isSigned: true,
    disputeReason: null,
  },
  {
    id: 'req-05',
    code: 'REQ-OUT-2026-0050',
    room: 'P503',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Đỗ Mạnh Quân',
    phone: '0901112233',
    contractCode: 'HD-2025-067',
    deposit: 9000000,
    requestDate: '2026-10-02',
    expectedDate: '2026-10-19',
    timeslot: '15:00',
    status: 'DISPUTED', // Staff đã nghiệm thu nhưng cư dân khiếu nại mức bồi thường -> Chờ Quản lý thẩm định giải quyết khiếu nại
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 2300,
    meterElectricCurr: 2420,
    electricRate: 3000,
    meterWaterPrev: 95,
    meterWaterCurr: 98,
    waterRate: 12000,
    damages: [
      { item: 'Cửa kính ban công', issue: 'Vết nứt góc dưới', cost: 1200000 }
    ],
    cleaningFee: 0,
    notes: 'Staff đã nghiệm thu hiện trường và ghi nhận nứt kính 1.200.000 ₫. Cư dân không đồng ý (khiếu nại kính rạn từ lúc nhận nhà, đính kèm ảnh bàn giao đầu vào). Chờ Quản lý thẩm định.',
    bankAccount: { bank: 'VietinBank', accountNumber: '108877665544', accountName: 'DO MANH QUAN' },
    refundAmount: 7404000,
    isSigned: false,
    disputeReason: 'Vết nứt kính góc ban công đã có từ thời điểm bàn giao nhà ban đầu tháng 10/2025; đã có ảnh chụp đối chiếu.',
  },
  {
    id: 'req-02',
    code: 'REQ-OUT-2026-0048',
    room: 'P104',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Hoàng Kim Long',
    phone: '0903334455',
    contractCode: 'HD-2026-004',
    deposit: 6800000,
    requestDate: '2026-10-06',
    expectedDate: '2026-10-22',
    timeslot: '09:30',
    status: 'SUBMITTED', // Cư dân mới nộp đơn -> Việc của STAFF tiếp nhận, xếp lịch và đi nghiệm thu (Quản lý không quản lý đơn này)
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 920,
    meterElectricCurr: null,
    electricRate: 3000,
    meterWaterPrev: 42,
    meterWaterCurr: null,
    waterRate: 12000,
    damages: [],
    cleaningFee: 0,
    notes: 'Chuyển công tác vào TP.HCM. Chờ nhân viên kỹ thuật tiếp nhận xếp lịch và đến phòng nghiệm thu.',
    bankAccount: { bank: 'Vietcombank', accountNumber: '001100432198', accountName: 'HOANG KIM LONG' },
    refundAmount: 6800000,
    isSigned: false,
    disputeReason: null,
  },
  {
    id: 'req-03',
    contractEndDate: '2026-10-01',
    contractStatusAtRequest: 'EXPIRED',
    isEarlyCheckout: false,
    depositSettlementStatus: 'PAID',
    code: 'REQ-OUT-2026-0042',
    room: 'P301',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Vũ Đức Nam',
    phone: '0907778899',
    contractCode: 'HD-2025-089',
    deposit: 9500000,
    requestDate: '2026-09-15',
    expectedDate: '2026-09-30',
    timeslot: '10:00',
    status: 'CLOSED', // Đã hoàn tất thanh lý & giải ngân cọc
    assignedStaff: 'Phạm Tuấn Anh',
    manager: 'Trần Minh Đức',
    meterElectricPrev: 2100,
    meterElectricCurr: 2250,
    electricRate: 3000,
    meterWaterPrev: 110,
    meterWaterCurr: 115,
    waterRate: 12000,
    damages: [],
    cleaningFee: 0,
    notes: 'Đã hoàn tất bàn giao phòng và hoàn trả cọc đầy đủ qua UNC ngân hàng.',
    bankAccount: { bank: 'Techcombank', accountNumber: '190324567890', accountName: 'VU DUC NAM' },
    refundAmount: 8990000,
    isSigned: true,
    disputeReason: null,
  }
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

const INITIAL_SETTLEMENTS = [
  {
    id: 'STL-2026-001',
    contractId: 'ct-001',
    contractCode: 'HD-2025-001',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    checkoutRecordId: 'CKO-2026-001',
    checkoutDate: '2026-10-02',
    deposit: 8500000,
    unpaidInvoices: 1505000,
    unpaidInvoicesList: [
      { code: 'INV-2026-09-P201', description: 'Hóa đơn dịch vụ tháng 09/2026', amount: 1505000 }
    ],
    electricity: { old: 1240, new: 1312, units: 72, rate: 3500, total: 252000 },
    water: { old: 85, new: 88, units: 3, rate: 25000, total: 75000 },
    serviceFee: 0,
    damages: [
      { id: 'dmg-1', description: 'Vệ sinh công nghiệp sau trả phòng', amount: 300000, note: 'Khách bàn giao căn hộ chưa dọn sạch theo hợp đồng' },
      { id: 'dmg-2', description: 'Thay chốt khóa cửa kính ban công', amount: 400000, note: 'Khóa bị gãy lẫy cơ khí trong thời gian sử dụng' }
    ],
    totalDue: 2532000,
    netBalance: 5968000,
    type: 'REFUND_DUE',
    status: 'READY_FOR_REFUND',
    hasPendingQuote: false,
    dispute: null,
    residentApproval: {
      status: 'ACCEPTED',
      agreedAt: '2026-10-03 10:30',
      note: 'Đã kiểm tra số điện nước và đồng ý phương án khấu trừ cọc.'
    },
    refundDetails: {
      bankName: 'Vietcombank - CN Thăng Long',
      bankAccount: '0011002345678',
      accountHolder: 'LE VAN AN',
      amount: 5968000,
      transferStatus: 'PENDING_TRANSFER',
      transferredAt: null,
      transferredBy: null,
      transferProof: null,
      failureReason: null
    },
    paymentDetails: null,
    auditLogs: [
      { time: '2026-10-02 09:15', actor: 'Phạm Tuấn Anh (Kỹ thuật)', action: 'Chốt biên bản kiểm tra phòng CKO-2026-001 và chỉ số điện nước' },
      { time: '2026-10-02 14:00', actor: 'Trần Minh Đức (Quản lý)', action: 'Lập bảng quyết toán và gửi cho Cư dân xem xét' },
      { time: '2026-10-03 10:30', actor: 'Lê Văn An (Cư dân)', action: 'Cư dân đã duyệt và đồng ý với bảng tính quyết toán' }
    ]
  },
  {
    id: 'STL-2026-002',
    contractId: 'ct-002',
    contractCode: 'HD-2025-002',
    room: 'P101',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Nguyễn Văn Hùng',
    phone: '0901112233',
    checkoutRecordId: 'CKO-2026-002',
    checkoutDate: '2026-10-01',
    deposit: 6500000,
    unpaidInvoices: 13000000,
    unpaidInvoicesList: [
      { code: 'INV-2026-08-P101', description: 'Tiền thuê căn hộ tháng 08/2026', amount: 6500000 },
      { code: 'INV-2026-09-P101', description: 'Tiền thuê căn hộ tháng 09/2026', amount: 6500000 }
    ],
    electricity: { old: 980, new: 1070, units: 90, rate: 3500, total: 315000 },
    water: { old: 62, new: 67, units: 5, rate: 25000, total: 125000 },
    serviceFee: 0,
    damages: [
      { id: 'dmg-3', description: 'Thay mặt kính bàn trà vỡ', amount: 1500000, note: 'Khách làm nứt vỡ trong thời gian thuê' },
      { id: 'dmg-4', description: 'Sơn dặm lại tường phòng khách vẽ bẩn', amount: 1800000, note: 'Vi phạm quy định giữ gìn căn hộ' },
      { id: 'dmg-5', description: 'Dọn dẹp rác thải tồn đọng', amount: 789000, note: 'Đơn vị dọn vệ sinh chuyên dụng xử lý' }
    ],
    totalDue: 17529000,
    netBalance: -11029000,
    type: 'REPAYMENT_REQUIRED',
    status: 'AWAITING_PAYMENT',
    hasPendingQuote: false,
    dispute: null,
    residentApproval: {
      status: 'ACCEPTED',
      agreedAt: '2026-10-02 16:45',
      note: 'Tôi đã xác nhận khoản nợ và cam kết chuyển khoản thanh toán đủ số dư nợ còn lại.'
    },
    refundDetails: null,
    paymentDetails: {
      amount: 11029000,
      paidAmount: 0,
      remainingAmount: 11029000,
      method: 'VIETQR',
      status: 'UNPAID',
      qrCodeData: 'DH HD2025002',
      transactions: []
    },
    auditLogs: [
      { time: '2026-10-01 11:00', actor: 'Phạm Tuấn Anh (Kỹ thuật)', action: 'Chốt biên bản kiểm tra phòng CKO-2026-002, ghi nhận thiệt hại tài sản' },
      { time: '2026-10-01 15:30', actor: 'Trần Minh Đức (Quản lý)', action: 'Lập bảng quyết toán tài chính (Truy thu ngoài cọc: 11.029.000 ₫)' },
      { time: '2026-10-02 16:45', actor: 'Nguyễn Văn Hùng (Cư dân)', action: 'Cư dân xác nhận bảng quyết toán, hệ thống tạo mã thanh toán VietQR' }
    ]
  },
  {
    id: 'STL-2026-003',
    contractId: 'ct-003',
    contractCode: 'HD-2025-003',
    room: 'P102',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Trần Thị Thu Thảo',
    phone: '0902223344',
    checkoutRecordId: 'CKO-2026-003',
    checkoutDate: '2026-10-03',
    deposit: 7500000,
    unpaidInvoices: 6500000,
    unpaidInvoicesList: [
      { code: 'INV-2026-09-P102', description: 'Tiền thuê căn hộ tháng cuối (chưa nộp)', amount: 6500000 }
    ],
    electricity: { old: 810, new: 915, units: 105, rate: 3500, total: 367500 },
    water: { old: 54, new: 59, units: 5, rate: 25000, total: 125000 },
    serviceFee: 7500,
    damages: [
      { id: 'dmg-6', description: 'Bảo dưỡng điều hòa & vệ sinh chuyên sâu', amount: 500000, note: 'Khấu trừ theo phụ lục bàn giao kết thúc hợp đồng' }
    ],
    totalDue: 7500000,
    netBalance: 0,
    type: 'EXACT_BALANCE',
    status: 'READY_TO_CLOSE',
    hasPendingQuote: false,
    dispute: null,
    residentApproval: {
      status: 'ACCEPTED',
      agreedAt: '2026-10-04 09:20',
      note: 'Đồng ý cấn trừ toàn bộ tiền cọc 7.500.000 ₫ vào tiền phòng và chi phí phát sinh.'
    },
    refundDetails: null,
    paymentDetails: null,
    auditLogs: [
      { time: '2026-10-03 10:00', actor: 'Phạm Tuấn Anh (Kỹ thuật)', action: 'Nghiệm thu căn hộ P102, bàn giao chìa khóa và thẻ từ' },
      { time: '2026-10-03 16:00', actor: 'Trần Minh Đức (Quản lý)', action: 'Lập bảng quyết toán cấn trừ vừa đủ tiền cọc (0 ₫ chênh lệch)' },
      { time: '2026-10-04 09:20', actor: 'Trần Thị Thu Thảo (Cư dân)', action: 'Cư dân đồng ý phương án cấn trừ cọc, sẵn sàng thanh lý hợp đồng' }
    ]
  },
  {
    id: 'STL-2026-004',
    contractId: 'ct-004',
    contractCode: 'HD-2025-004',
    room: 'P301',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Vũ Đức Nam',
    phone: '0907778899',
    checkoutRecordId: 'CKO-2026-004',
    checkoutDate: '2026-10-04',
    deposit: 9500000,
    unpaidInvoices: 0,
    unpaidInvoicesList: [],
    electricity: { old: 1100, new: 1220, units: 120, rate: 3500, total: 420000 },
    water: { old: 70, new: 76, units: 6, rate: 25000, total: 150000 },
    serviceFee: 0,
    damages: [
      { id: 'dmg-7', description: 'Vỡ tấm kính cường lực lan can ban công', amount: 0, pendingQuote: true, note: 'Đang liên hệ xưởng nhôm kính đo đạc và gửi báo giá chính xác' }
    ],
    totalDue: 570000,
    netBalance: null,
    type: 'PENDING_ASSESSMENT',
    status: 'PENDING_ASSESSMENT',
    hasPendingQuote: true,
    dispute: null,
    residentApproval: {
      status: 'PENDING',
      agreedAt: null,
      note: ''
    },
    refundDetails: null,
    paymentDetails: null,
    auditLogs: [
      { time: '2026-10-04 15:00', actor: 'Phạm Tuấn Anh (Kỹ thuật)', action: 'Kiểm tra phòng trả P301: Ghi nhận vỡ kính lan can, gửi yêu cầu báo giá bên ngoài' },
      { time: '2026-10-04 16:30', actor: 'Trần Minh Đức (Quản lý)', action: 'Tạm hoãn quyết toán (Pending Assessment) chờ báo giá xưởng gia công kính' }
    ]
  }
];

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
    this.migrateResidentDemoInvoices();
    if (!localStorage.getItem(STORAGE_KEYS.CHECKOUT)) {
      localStorage.setItem(STORAGE_KEYS.CHECKOUT, JSON.stringify(INITIAL_CHECKOUT_REQUESTS));
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
    localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(INITIAL_HANDOVER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HANDOVER)) {
      localStorage.setItem(STORAGE_KEYS.HANDOVER, JSON.stringify(INITIAL_HANDOVER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTLEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
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

  isResidentInvoice(invoice, user = DataStore.getUser()) {
    if (!invoice || !user || user.role !== 'RESIDENT') return false;
    if (invoice.residentId) return Boolean(user.id) && invoice.residentId === user.id;
    return Boolean(user.room && user.building && user.fullName)
      && invoice.room === user.room
      && invoice.building === user.building
      && invoice.tenant === user.fullName;
  },

  getResidentInvoices(user = DataStore.getUser()) {
    return this.getInvoices().filter(invoice => this.isResidentInvoice(invoice, user));
  },

  migrateResidentDemoInvoices() {
    const invoices = this.getInvoices();
    let changed = false;
    // Add the stable ID only to the known, unchanged owner of the legacy seed.
    const legacy = invoices.find(invoice => invoice.id === 'inv-1001');
    if (legacy && !legacy.residentId && this.isResidentInvoice(legacy, DEFAULT_USERS.RESIDENT)) {
      legacy.residentId = DEFAULT_USERS.RESIDENT.id;
      changed = true;
    }
    for (const example of RESIDENT_DEMO_INVOICES) {
      if (!invoices.some(invoice => invoice.id === example.id)) {
        invoices.push({ ...example });
        changed = true;
      }
    }
    if (changed) this.saveInvoices(invoices);
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

  getCheckoutRequests() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKOUT) || '[]');
  },

  saveCheckoutRequests(reqs) {
    localStorage.setItem(STORAGE_KEYS.CHECKOUT, JSON.stringify(reqs));
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
    if (arguments.length === 1 && id && typeof id === 'object') {
      const updatedUser = { ...this.getUser(), ...id };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
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
  },

  // =================================================================
  // 2.11 Payment & Deposit Settlement DataStore Engine
  // =================================================================
  getSettlements() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
      return INITIAL_SETTLEMENTS;
    }
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length && list[0] && list[0].netBalance !== undefined && list[0].deposit !== undefined && list[0].room) {
        return list;
      }
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
      return INITIAL_SETTLEMENTS;
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
      return INITIAL_SETTLEMENTS;
    }
  },

  getSettlementById(id) {
    const list = this.getSettlements();
    return list.find(s => s.id === id || s.contractCode === id || s.contractId === id) || null;
  },

  saveSettlement(settlement) {
    const list = this.getSettlements();
    const idx = list.findIndex(s => s.id === settlement.id);
    if (idx !== -1) {
      list[idx] = settlement;
    } else {
      list.push(settlement);
    }
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(list));
  },

  calculateSettlement(data) {
    const deposit = Number(data.deposit) || 0;
    const unpaidInvoices = Number(data.unpaidInvoices) || 0;
    const elecAmount = Number(data.electricity?.total || (data.electricity?.units * (data.electricity?.rate || 3500))) || 0;
    const waterAmount = Number(data.water?.total || (data.water?.units * (data.water?.rate || 25000))) || 0;
    const serviceFee = Number(data.serviceFee) || 0;
    const damageTotal = (data.damages || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const hasPendingQuote = (data.damages || []).some(d => d.pendingQuote);

    const totalDue = unpaidInvoices + elecAmount + waterAmount + serviceFee + damageTotal;
    const netBalance = deposit - totalDue;

    let type = 'EXACT_BALANCE';
    let status = 'READY_TO_CLOSE';

    if (hasPendingQuote) {
      type = 'PENDING_ASSESSMENT';
      status = 'PENDING_ASSESSMENT';
    } else if (netBalance > 0) {
      type = 'REFUND_DUE';
      status = 'READY_FOR_REFUND';
    } else if (netBalance < 0) {
      type = 'REPAYMENT_REQUIRED';
      status = 'AWAITING_PAYMENT';
    }

    return {
      deposit,
      unpaidInvoices,
      utilitiesTotal: elecAmount + waterAmount,
      serviceFee,
      damageTotal,
      totalDue,
      netBalance: hasPendingQuote ? null : netBalance,
      type,
      status,
      hasPendingQuote
    };
  },

  closeSettlementContract(settlementId, note = 'Đã hoàn tất thanh lý tài chính') {
    const s = this.getSettlementById(settlementId);
    if (!s) return false;

    s.status = 'COMPLETED';
    s.closedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    s.closedBy = this.getUser().fullName;
    s.auditLogs.push({
      time: s.closedAt,
      actor: `${this.getUser().fullName} (${this.getRole()})`,
      action: `Đóng hợp đồng tài chính ${s.contractCode}. Trạng thái chuyển sang COMPLETED.`
    });

    // Update contract status in contracts store as well
    const contracts = this.getContracts();
    const cIdx = contracts.findIndex(c => c.code === s.contractCode || c.id === s.contractId);
    if (cIdx !== -1) {
      contracts[cIdx].status = 'CLOSED';
      contracts[cIdx].closedDate = s.closedAt.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    }

    this.saveSettlement(s);
    this.addAuditLog('QUYẾT_TOÁN_HỢP_ĐỒNG', `Hợp đồng ${s.contractCode}`, `Hoàn tất quyết toán và đóng tài chính hợp đồng. ${note}`);
    return true;
  }
};

// Auto initialize on script load
DataStore.init();