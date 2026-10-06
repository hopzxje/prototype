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
    building: 'StayHub Central - Ba Đình',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    title: 'Cư dân Căn hộ P201'
  }
};

const INITIAL_BUILDINGS = [
  { id: 'bld-1', code: 'SH-CENTRAL', name: 'StayHub Central - Ba Đình', address: '95 Kim Mã, Quận Ba Đình, Hà Nội', floors: 3, totalRooms: 12, manager: 'Trần Minh Đức', phone: '0912345678' },
  { id: 'bld-2', code: 'SH-RIVERSIDE', name: 'StayHub Riverside - Tây Hồ', address: '18 Quảng Khánh, Quận Tây Hồ, Hà Nội', floors: 3, totalRooms: 12, manager: 'Lê Hải Yến', phone: '0918765432' },
  { id: 'bld-3', code: 'SH-ECO', name: 'StayHub Eco - Cầu Giấy', address: '45 Duy Tân, Quận Cầu Giấy, Hà Nội', floors: 3, totalRooms: 12, manager: 'Trần Minh Đức', phone: '0912345678' }
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
  {
    id: 'inv-1001',
    code: 'INV-2026-10-P201',
    month: '10/2026',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
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
    code: 'INV-2026-10-P101',
    month: '10/2026',
    room: 'P101',
    building: 'StayHub Central - Ba Đình',
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
    code: 'INV-2026-10-P102',
    month: '10/2026',
    room: 'P102',
    building: 'StayHub Central - Ba Đình',
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
    code: 'INV-2026-10-P301',
    month: '10/2026',
    room: 'P301',
    building: 'StayHub Central - Ba Đình',
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
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: 'mnt-001',
    code: 'REQ-2026-091',
    room: 'P202',
    building: 'StayHub Central - Ba Đình',
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
    code: 'REQ-2026-092',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
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
    code: 'REQ-2026-088',
    room: 'P104',
    building: 'StayHub Central - Ba Đình',
    title: 'Khóa cửa vân tay báo pin yếu',
    description: 'Khóa cửa nhấp nháy đèn đỏ báo cần thay 4 viên pin AA.',
    priority: 'LOW',
    status: 'RESOLVED',
    requester: 'Hoàng Kim Long',
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
    code: 'REQ-OUT-2026-0045',
    room: 'P201',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Lê Văn An',
    phone: '0904445566',
    contractCode: 'HD-2026-001',
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
    notes: 'Kỹ thuật viên Phạm Tuấn Anh đã kiểm tra phòng lúc 14:30 ngày 20/10. Đã chốt số điện nước, lập biên bản hư hại rèm cửa và gửi dự thảo quyết toán hoàn cọc 7.700.000 ₫ trình Quản lý phê duyệt.',
    bankAccount: { bank: 'MB Bank', accountNumber: '0904445566', accountName: 'LE VAN AN' },
    refundAmount: 7700000,
    isSigned: false,
    disputeReason: null,
    isKeyReturned: false
  },
  {
    id: 'req-04',
    code: 'REQ-OUT-2026-0049',
    room: 'P402',
    building: 'StayHub Central - Ba Đình',
    tenant: 'Trần Thu Trang',
    phone: '0908889900',
    contractCode: 'HD-2025-112',
    deposit: 10000000,
    requestDate: '2026-10-01',
    expectedDate: '2026-10-18',
    timeslot: '10:00',
    status: 'REFUND_PENDING', // Staff đã nghiệm thu, cư dân đã ký, Staff đã thu đủ chìa khóa -> Chờ Quản lý duyệt lệnh chi UNC hoàn cọc
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
    notes: 'Staff đã nghiệm thu, cư dân đã ký biên bản thanh lý và Staff đã thu đủ 02 chìa khóa cơ, 02 thẻ từ, khóa mã phòng. Chờ Quản lý phê duyệt lệnh chi hoàn cọc 9.200.000 ₫.',
    bankAccount: { bank: 'Techcombank', accountNumber: '1903332211', accountName: 'TRAN THU TRANG' },
    refundAmount: 9200000,
    isSigned: true,
    disputeReason: null,
    isKeyReturned: true
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
    isKeyReturned: false
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
    isKeyReturned: false
  },
  {
    id: 'req-03',
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
    isKeyReturned: true
  }
];

// Initialize Data Store in localStorage
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
    const currentCheckout = localStorage.getItem(STORAGE_KEYS.CHECKOUT);
    if (!currentCheckout || JSON.parse(currentCheckout).length < 5) {
      localStorage.setItem(STORAGE_KEYS.CHECKOUT, JSON.stringify(INITIAL_CHECKOUT_REQUESTS));
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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUILDINGS) || '[]');
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
  }
};

// Auto initialize on script load
DataStore.init();
