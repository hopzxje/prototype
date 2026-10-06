/** Optional authoring helper. Outputs plain HTML; never loaded by a browser. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = new Set();
const icons = {
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-8h6v8"/>',
  invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
  building: '<path d="M5 21V3h14v18M3 21h18M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
  bell: '<path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4Zm5 3h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  exit: '<path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5"/>',
  chart: '<path d="M4 3v18h17M8 16v-5m5 5V7m5 9V4"/>',
  settings: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-5 5h5M6 5V3h12v2"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.invoice}</svg>`;
const badge = state => `<span class="badge ${state.toLowerCase()}">${state}</span>`;
const btn = (text, href, type = '') => `<a class="btn ${type}" href="${href}">${text}</a>`;
const link = (text, href) => `<a class="text-link" href="${href}">${text}</a>`;
const info = rows => `<dl class="info-list">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const card = (title, body, action = '') => `<section class="card"><header class="card-header"><h2>${title}</h2>${action}</header><div class="card-body">${body}</div></section>`;
const notice = (text, type = '') => `<div class="notice ${type}">${text}</div>`;
const table = (heads, rows) => `<div class="table-scroll"><table><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.join('\n')}</tbody></table></div>`;
const tr = (cells, state = '') => `<tr${state ? ` data-state="${state}"` : ''}>${cells.map(x=>`<td>${x}</td>`).join('')}</tr>`;
function filters(states, label = 'Trạng thái') {
  const options = [['all','Tất cả'], ...states];
  return `<div role="group" aria-label="${label}">${options.map(([s])=>`<input class="filter-radio" type="radio" id="filter-${s}" name="status"${s==='all'?' checked':''}>`).join('')}<div class="filter-tabs">${options.map(([s,t])=>`<label for="filter-${s}">${t}</label>`).join('')}</div></div>`;
}
function write(file, title, body) {
  pages.add(file);
  fs.writeFileSync(path.join(root,file), `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="StayHub — Prototype HTML/CSS luồng thanh toán hóa đơn hàng tháng. Dữ liệu minh họa, không thực hiện thanh toán.">
  <title>${title} · StayHub</title>
  <link rel="stylesheet" href="css/payment.css">
</head>
<body>
${body}
</body>
</html>
`, 'utf8');
}
function shell(file, title, subtitle, content, opt={}) {
  const role = opt.role || 'resident';
  const staff = role !== 'resident';
  const paid = opt.paid || false;
  const suffix = paid ? '-paid' : '';
  const dashboard = staff ? `${role}-dashboard.html` : `resident-dashboard${suffix}.html`;
  const invoicePage = `invoices${suffix}.html`;
  const historyPage = paid ? 'payment-history.html' : 'payment-history-unpaid.html';
  const notificationPage = paid ? 'resident-notifications-paid.html' : 'resident-notifications.html';
  const items = staff ? [
    ['home','Tổng quan',dashboard,'dashboard'], ['user','Cư dân',`${role}-residents.html`,'residents'],
    ['building','Căn hộ',`${role}-apartments.html`,'apartments'], ['invoice','Hóa đơn',`${role}-invoices.html`,'invoices'],
    ['wallet','Giao dịch thanh toán',`${role}-payment-monitoring.html`,'payments'], ['chart','Báo cáo',`${role}-reports.html`,'reports'],
    ['bell','Thông báo',`${role}-notifications.html`,'notifications'], ['settings','Cài đặt',`${role}-settings.html`,'settings'],
  ] : [
    ['home','Tổng quan',dashboard,'dashboard'], ['building','Căn hộ của tôi',`resident-apartment${suffix}.html`,'apartment'],
    ['invoice','Hóa đơn hàng tháng',invoicePage,'invoices'], ['history','Lịch sử thanh toán',historyPage,'history'],
    ['bell','Thông báo',notificationPage,'notifications'], ['user','Hồ sơ cá nhân',`resident-profile${suffix}.html`,'profile'],
  ];
  const nav = items.map(([i,t,h,k])=>`<a href="${h}"${(opt.active || 'invoices')===k?' class="active" aria-current="page"':''}>${icon(i)}${t}</a>`).join('\n');
  const name = staff ? (role==='manager'?'Trần Minh Đức':'Phạm Tuấn Anh') : 'Nguyễn Văn An';
  const roleName = staff ? (role==='manager'?'Quản lý tòa nhà':'Nhân viên vận hành') : 'Cư dân · A-1205';
  write(file,title,`<a class="skip-link" href="#main">Đến nội dung chính</a>
<div class="app">
  <aside class="sidebar">
    <a class="brand" href="index.html"><span class="brand-mark">${icon('building')}</span><span>stayhub<small>LIVING, CONNECTED</small></span></a>
    <div class="property"><strong>Sunrise Residence</strong>${staff?'Ban quản lý · Tòa A, B & C':'Tòa A · Căn hộ A-1205'}</div>
    <div class="nav-label">${staff?'KHÔNG GIAN VẬN HÀNH':'KHÔNG GIAN CƯ DÂN'}</div>
    <nav class="nav" aria-label="Điều hướng chính">${nav}</nav>
    <div class="sidebar-footer"><div class="support"><strong>Cần hỗ trợ?</strong>Ban quản lý luôn sẵn sàng hỗ trợ.<br>028 3822 1205 · 08:00–18:00</div><a href="index.html">${icon('arrow')}Trung tâm prototype</a><a href="login.html">${icon('exit')}Đăng xuất</a></div>
  </aside>
  <div class="workspace">
    <header class="topbar">
      <div class="breadcrumb">Sunrise Residence<span>/</span><strong>${staff?'Vận hành':'Cổng cư dân'}</strong></div>
      <details class="mobile-menu"><summary>☰ Menu</summary><nav class="nav" aria-label="Điều hướng di động">${nav}<a href="index.html">Trung tâm prototype</a><a href="login.html">Đăng xuất</a></nav></details>
      <div class="row"><span class="small muted date-label">Tháng 10, 2026</span><a class="icon-button" href="${staff?`${role}-notifications.html`:notificationPage}" aria-label="Xem thông báo">${icon('bell')}</a><span class="avatar">${staff?(role==='manager'?'MĐ':'TA'):'VA'}</span><div><div class="user-name">${name}</div><div class="user-role">${roleName}</div></div></div>
    </header>
    <main class="main" id="main">
      <div class="page-heading"><div><p class="eyebrow">${opt.eyebrow || (staff?'Quản lý thanh toán':'Sunrise Residence')}</p><h1>${title}</h1><p class="subheading">${subtitle}</p></div>${opt.action || ''}</div>
      ${content}
      <footer class="footer"><span>© 2026 StayHub · Sunrise Residence</span><span>Prototype HTML/CSS · Dữ liệu minh họa · Không thực hiện giao dịch</span></footer>
    </main>
  </div>
</div>`);
}
function steps(n) {
  return `<ol class="steps" aria-label="Tiến trình thanh toán">${['Xác nhận','Quét mã QR','Xác minh','Kết quả'].map((s,i)=>`<li class="${i<n?'done':i===n?'current':''}"${i===n?' aria-current="step"':''}><span class="step-number">${i<n?'✓':i+1}</span>${s}</li>`).join('')}</ol>`;
}
function demo(body, open=false) { return `<details class="demo-controls"${open?' open':''}><summary>Prototype Demo Controls</summary><p class="section-space small">Các liên kết dưới đây mở trạng thái mẫu để đánh giá luồng, không thực hiện giao dịch thật.</p><div class="actions">${body}</div></details>`; }
function stat(label,value,foot,i='invoice') { return `<section class="card stat"><div class="row between"><div class="stat-icon">${icon(i)}</div></div><p class="stat-label">${label}</p><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></section>`; }
const amount = '2.450.000 ₫';
const invoice = 'INV-2026-10';
const ref = 'PAY-202610-00125';
const time = '04/10/2026 14:32';
const paymentRows = (reference=ref) => [['Hóa đơn',invoice],['Căn hộ','A-1205 · Tòa A'],['Số tiền',amount],['Mã thanh toán',`<span class="mono">${reference}</span>`]];
function invoiceRows(paid=false) {
  return [
    tr([`<strong>${invoice}</strong>`,'10/2026','01/10/2026','10/10/2026',`<strong>${amount}</strong>`,badge(paid?'PAID':'UNPAID'),`${link('Chi tiết',paid?'invoice-paid.html':'invoice-detail.html')} ${!paid?btn('Thanh toán','payment.html','compact'):''}`],paid?'paid':'unpaid'),
    tr(['<strong>INV-2026-09</strong>','09/2026','01/09/2026','10/09/2026','2.300.000 ₫',badge('PAID'),link('Chi tiết','invoice-september.html')],'paid'),
    tr(['<strong>INV-2026-08</strong>','08/2026','01/08/2026','10/08/2026','2.280.000 ₫',badge('PAID'),link('Chi tiết','invoice-august.html')],'paid'),
  ];
}
const invoiceHeads = ['Mã hóa đơn','Kỳ thu','Ngày lập','Hạn thanh toán','Số tiền','Hóa đơn','Thao tác'];

// Central navigation hub.
const hubLinks = entries => `<div class="hub-links">${entries.map(([t,h])=>`<a href="${h}">${t}<span aria-hidden="true">↗</span></a>`).join('')}</div>`;
write('index.html','Payment Prototype',`<main class="hub" id="main"><header class="hub-header"><a class="brand" href="index.html"><span class="brand-mark">${icon('building')}</span>stayhub</a><span class="badge pending">HTML / CSS PROTOTYPE</span></header>
<section class="hub-intro"><p class="eyebrow">Apartment Management System</p><h1>Một trải nghiệm thanh toán.<br>Đầy đủ mọi trạng thái.</h1><p>Payment Prototype · Khám phá luồng thanh toán hóa đơn hàng tháng tại Sunrise Residence, từ góc nhìn cư dân đến ban quản lý.</p></section>
<div class="grid equal">
${card('01 · Không gian cư dân',`<p class="muted">Xem hóa đơn, thanh toán bằng QR và nhận xác nhận.</p><div class="actions">${btn('Bắt đầu với vai trò cư dân →','login.html')}</div>${hubLinks([['Tổng quan cư dân','resident-dashboard.html'],['Hóa đơn hàng tháng','invoices.html'],['Chi tiết hóa đơn','invoice-detail.html'],['Xác nhận thanh toán','payment.html'],['Quét mã QR','payment-qr.html'],['Đang xác minh','payment-processing.html'],['Thanh toán thành công','payment-success.html'],['Thanh toán thất bại','payment-failed.html'],['Phiên đã hết hạn','payment-expired.html'],['Lịch sử thanh toán','payment-history.html']])}`)}
${card('02 · Nhân viên & quản lý',`<p class="muted">Theo dõi trạng thái đã cập nhật và lịch sử đối soát.</p><div class="actions">${btn('Nhân viên →','staff-login.html')}${btn('Quản lý →','manager-login.html','secondary')}</div>${hubLinks([['Tổng quan nhân viên','staff-dashboard.html'],['Theo dõi giao dịch','staff-payment-monitoring.html'],['Chi tiết giao dịch','staff-payment-detail.html'],['Tổng quan quản lý','manager-dashboard.html'],['Giao dịch của quản lý','manager-payment-monitoring.html'],['Chi tiết cho quản lý','manager-payment-detail.html']])}<div class="section-space">${notice('Nhân viên và quản lý cùng quyền xem kết quả trong luồng này. Trạng thái thanh toán chỉ được ghi nhận sau bước xác minh.')}</div>`)}
</div>
<section class="card section-space"><div class="card-body"><p class="eyebrow">Business flow</p><h2>Từ hóa đơn đến xác nhận thanh toán</h2><div class="flow"><b>Hóa đơn</b>→<b>Kiểm tra hợp lệ</b>→<b>Tạo giao dịch & QR</b>→<b>Xác minh</b>→<b>SUCCESS / FAILED / EXPIRED</b>→<b>Cập nhật trạng thái</b></div><div class="actions">${link('Nhánh hóa đơn không hợp lệ →','invoice-invalid.html')}${link('Nhánh hóa đơn đã thanh toán →','payment-already-paid.html')}${link('Hóa đơn sau thanh toán →','invoice-paid.html')}</div></div></section>
<footer class="footer"><span>HTML5 + CSS3 · Không thư viện · Mở trực tiếp index.html</span><span>Các trang là trạng thái mẫu độc lập; không có dữ liệu giao dịch thật.</span></footer></main>`);

// Login is intentionally a native HTML form with no authentication.
for (const role of ['resident','staff','manager']) {
  const file=role==='resident'?'login.html':`${role}-login.html`;
  const label=role==='resident'?'Cư dân':role==='staff'?'Nhân viên':'Quản lý';
  write(file,`Đăng nhập ${label}`,`<main class="login"><section class="login-art"><a class="brand" href="index.html"><span class="brand-mark">${icon('building')}</span>stayhub</a><div><p class="eyebrow">SUNRISE RESIDENCE</p><h1>Không gian sống tốt hơn.<br>Kết nối dễ dàng hơn.</h1><p>Quản lý hóa đơn, theo dõi thanh toán và kết nối với ban quản lý trong một không gian.</p><div class="buildings-art" aria-hidden="true"><div class="tower"></div><div class="tower"></div><div class="tower"></div></div></div><p class="small">Một phần của cuộc sống tiện nghi, mỗi ngày.</p></section><section class="login-form"><div class="login-content"><p class="eyebrow">Chào mừng trở lại</p><h2>Đăng nhập StayHub</h2><p class="subheading">Truy cập không gian ${label.toLowerCase()} của bạn.</p><nav class="role-options" aria-label="Chọn vai trò">${[['resident','Cư dân'],['staff','Nhân viên'],['manager','Quản lý']].map(([r,t])=>`<a href="${r==='resident'?'login.html':`${r}-login.html`}"${r===role?' class="selected" aria-current="page"':''}>${t}</a>`).join('')}</nav><form action="${role}-dashboard.html" method="get"><div class="field"><label for="email">Email / Tên đăng nhập</label><input id="email" type="text" autocomplete="username" placeholder="Nhập email hoặc tên đăng nhập"></div><div class="field"><label for="password">Mật khẩu</label><input id="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu"></div><div class="row between"><label class="check-label"><input type="checkbox">Ghi nhớ đăng nhập</label>${link('Quên mật khẩu?','forgot-password.html')}</div><button class="btn full section-space" type="submit">Đăng nhập ${label.toLowerCase()} ${icon('arrow')}</button></form><div class="section-space">${notice('Đây là giao diện mẫu. Không nhập tài khoản thật; nút đăng nhập mở trực tiếp trang theo vai trò đã chọn.')}</div><div class="section-space small">${link('← Về trung tâm prototype','index.html')}</div></div></section></main>`);
}
write('forgot-password.html','Hỗ trợ đăng nhập',`<main class="hub"><section class="result card"><div class="card-body"><div class="result-icon">?</div><h1>Hỗ trợ đăng nhập</h1><p class="subheading">Liên hệ ban quản lý Sunrise Residence để được hỗ trợ tài khoản.</p>${info([['Điện thoại','028 3822 1205'],['Giờ làm việc','08:00–18:00'],['Bộ phận','Lễ tân · Sảnh tòa A']])}${notice('Prototype không gửi email hoặc thay đổi mật khẩu.')}<div class="actions">${btn('Về đăng nhập','login.html')}${btn('Trung tâm prototype','index.html','secondary')}</div></div></section></main>`);

// Resident dashboard and a distinct snapshot after a successful payment.
for (const paid of [false,true]) {
  const suffix=paid?'-paid':'';
  const content=`<section class="hero"><div><p class="eyebrow">Căn hộ A-1205 · Tòa A</p><h2>${paid?'Mọi khoản phí đã được thanh toán.':'Chào buổi sáng, anh An.'}</h2><p>${paid?'Cảm ơn anh đã hoàn tất hóa đơn tháng 10. Xác nhận đã có trong thông báo.':'Hóa đơn tháng 10 đã sẵn sàng. Thanh toán trước ngày 10/10 để an tâm tận hưởng cuộc sống.'}</p></div>${btn(paid?'Xem xác nhận →':'Xem hóa đơn →',paid?'payment-success.html':'invoice-detail.html')}</section>
  <div class="stats">${stat('Hóa đơn tháng 10',amount,badge(paid?'PAID':'UNPAID'))}${stat('Trạng thái thanh toán',paid?'Đã hoàn tất':'Cần thanh toán',paid?'Ghi nhận lúc 14:32 · 04/10/2026':'Đến hạn: 10/10/2026','wallet')}${stat('Căn hộ của tôi','A-1205','Sunrise Residence · Tòa A','building')}${stat('Thanh toán gần nhất',paid?amount:'2.300.000 ₫',paid?'Tháng 10/2026 · QR Payment':'Tháng 09/2026 · Đã thanh toán','check')}</div>
  <section class="card"><header class="card-header"><div><h2>Hóa đơn gần đây</h2><p class="muted small">Các khoản phí dịch vụ căn hộ của bạn</p></div>${link('Xem tất cả →',`invoices${suffix}.html`)}</header>${table(invoiceHeads,invoiceRows(paid))}<div class="table-footer"><span>3 hóa đơn · Năm 2026</span><span>Đơn vị: VND</span></div></section>
  <div class="grid equal section-space">${card('Thanh toán dễ dàng, minh bạch',`<p class="muted small">Kiểm tra các khoản phí, quét QR trên ứng dụng ngân hàng và theo dõi xác nhận ngay trong tài khoản.</p><div class="actions">${link('Xem lịch sử thanh toán →',paid?'payment-history.html':'payment-history-unpaid.html')}</div>`)}${card('Thông báo từ ban quản lý',`<p class="strong">${paid?'Đã nhận thanh toán tháng 10/2026':'Hóa đơn dịch vụ tháng 10/2026'}</p><p class="muted small subheading">${paid?'2.450.000 ₫ · Xác nhận lúc 14:32, ngày 04/10/2026':'Phát hành ngày 01/10/2026 · Hạn thanh toán 10/10/2026'}</p><div class="actions">${link('Đọc thông báo →',paid?'resident-notifications-paid.html':'resident-notifications.html')}</div>`)}</div>`;
  shell(`resident-dashboard${suffix}.html`,'Tổng quan cư dân','Mọi thông tin về căn hộ và thanh toán, trong tầm tay.',content,{paid,active:'dashboard'});
  shell(`invoices${suffix}.html`,'Hóa đơn hàng tháng','Xem và quản lý hóa đơn dịch vụ căn hộ A-1205.',`<div class="stats">${stat('Tổng hóa đơn','3','Kỳ tháng 08–10/2026')}${stat('Chưa thanh toán',paid?'0 ₫':amount,paid?'Không có công nợ':'01 hóa đơn đến hạn','wallet')}${stat('Đã thanh toán',paid?'3':'2','Hóa đơn được ghi nhận PAID','check')}${stat('Hạn tháng 10','10/10','Năm 2026','history')}</div><section class="card filter-card"><header class="card-header"><h2>Danh sách hóa đơn</h2><span class="small muted">03 hóa đơn</span></header><div class="filters"><div class="field"><label for="month">Tháng · bộ lọc minh họa</label><select id="month"><option>Tất cả các tháng</option><option>Tháng 10</option><option>Tháng 09</option><option>Tháng 08</option></select></div><div class="field"><label for="year">Năm</label><select id="year"><option>2026</option></select></div><p class="small muted">Các tab trạng thái bên dưới lọc bằng CSS.</p></div>${filters([['unpaid','Chưa thanh toán'],['paid','Đã thanh toán']])}${table(invoiceHeads,invoiceRows(paid))}<div class="table-footer"><span>Hóa đơn chỉ có trạng thái PAID / UNPAID</span><span>Năm 2026</span></div></section><div class="section-space">${notice(`Giao dịch thất bại (FAILED) hoặc hết hạn (EXPIRED) không làm hóa đơn được thanh toán. Xem trạng thái các lần thử trong ${link('Lịch sử thanh toán',paid?'payment-history.html':'payment-history-unpaid.html')}.`)}</div>`,{paid,active:'invoices'});
}

// Invoice details, paid versions and download-only HTML receipts.
function invoiceDetail(file, cfg={}) {
  const paid=!!cfg.paid;
  const month=cfg.month||'10';
  const value=cfg.value||amount;
  const reference=cfg.reference||ref;
  const id=`INV-2026-${month}`;
  const old=month!=='10';
  const charges=old?(month==='09'?[800000,550000,200000,300000,450000]:[800000,530000,200000,300000,450000]):[800000,650000,250000,300000,450000];
  const currency=n=>new Intl.NumberFormat('vi-VN').format(n)+' ₫';
  const breakdown=table(['Khoản phí','Diễn giải','Thành tiền'],charges.map((n,i)=>tr([[ 'Phí quản lý','Tiền điện','Tiền nước','Phí gửi xe','Dịch vụ khác'][i],['Dịch vụ quản lý căn hộ','Theo chỉ số công tơ đã chốt','Theo chỉ số đồng hồ đã chốt','02 phương tiện đăng ký','Internet & dịch vụ tiện ích'][i],currency(n)])));
  const receipt=`<section class="card"><div class="card-body"><div class="receipt-heading"><div><div class="receipt-brand">${icon('building')} StayHub</div><p class="muted small">Sunrise Residence · Ban quản lý tòa A</p></div><div><p class="eyebrow">Hóa đơn hàng tháng</p><h2>${id}</h2><p class="muted small">Kỳ thu: Tháng ${month}/2026</p></div></div><div class="receipt-meta"><div><p class="muted small">THÔNG TIN CƯ DÂN</p><p class="strong">Nguyễn Văn An</p><p class="small">Căn hộ A-1205 · Tòa A</p></div><div><p class="muted small">THÔNG TIN HÓA ĐƠN</p><p class="small">Ngày lập: 01/${month}/2026</p><p class="small">Hạn thanh toán: 10/${month}/2026</p></div></div></div><div class="breakdown">${breakdown}</div><div class="total"><div><strong class="small">Tổng thanh toán</strong><p class="muted small">Đơn vị tiền tệ: VND</p></div><strong>${value}</strong></div><div class="card-body"><p class="small muted">Vui lòng kiểm tra các khoản phí. Nếu cần điều chỉnh, liên hệ ban quản lý trước khi thanh toán.</p></div></section>`;
  const download=`invoice-${month}-download.html`;
  write(download,`Bản tải hóa đơn ${id}`,`<main class="hub"><div class="payment-width">${receipt}<section class="card section-space"><div class="card-body">${info([['Trạng thái tại thời điểm xuất mẫu',badge(paid?'PAID':'UNPAID')],...(paid?[['Tham chiếu',reference],['Thời gian',old?`04/${month}/2026 09:20`:time]]:[])])}<p class="small muted">Bản hóa đơn HTML mẫu · Có thể dùng Ctrl+P để in hoặc lưu PDF.</p><div class="actions">${btn('Về chi tiết hóa đơn',file,'secondary')}${btn('Trung tâm prototype','index.html','secondary')}</div></div></section></div></main>`);
  // Separate paid October download avoids the unpaid receipt being overwritten.
  const actualDownload=paid&&!old?'invoice-paid-download.html':download;
  if(actualDownload!==download) {fs.renameSync(path.join(root,download),path.join(root,actualDownload));pages.delete(download);pages.add(actualDownload);}
  const summary=card('Thông tin thanh toán',`${info([['Trạng thái hóa đơn',badge(paid?'PAID':'UNPAID')],['Số tiền',value],['Hạn thanh toán',`10/${month}/2026`],...(paid?[['Giao dịch',badge('SUCCESS')],['Mã tham chiếu',`<span class="mono">${reference}</span>`],['Ghi nhận lúc',old?`04/${month}/2026 09:20`:time]]:[])])}<div class="section-space">${notice(paid?'Hóa đơn đã thanh toán. Không cần thực hiện thêm giao dịch.':'Hóa đơn đang chờ thanh toán. Hệ thống kiểm tra tính hợp lệ trước khi cấp mã QR.',paid?'success':'warning')}</div><div class="actions">${paid?'<span class="btn full" aria-disabled="true">✓ Đã thanh toán</span>':btn('Thanh toán hóa đơn →','payment.html','full')}<a class="btn secondary full" href="${actualDownload}" download="${id}.html">↓ Tải hóa đơn (.html)</a></div>`);
  shell(file,paid?'Hóa đơn đã thanh toán':'Chi tiết hóa đơn',`${id} · Tháng ${month}/2026 · Căn hộ A-1205`,`<div class="grid grid-2">${receipt}<div class="stack">${summary}${paid?notice(`Xác nhận thanh toán đã được lưu. ${link('Xem lịch sử →',old?'payment-history-unpaid.html':'payment-history.html')}`,'success'):card('Bạn cần hỗ trợ?',`<p class="small muted">Liên hệ ban quản lý Sunrise Residence:<br><strong>028 3822 1205</strong> · 08:00–18:00</p>`)}</div></div>`,{paid:paid&&!old,action:btn('← Danh sách hóa đơn',paid&&!old?'invoices-paid.html':'invoices.html','secondary')});
}
invoiceDetail('invoice-paid.html',{paid:true});
invoiceDetail('invoice-detail.html');
invoiceDetail('invoice-september.html',{paid:true,month:'09',value:'2.300.000 ₫',reference:'PAY-202609-00102'});
invoiceDetail('invoice-august.html',{paid:true,month:'08',value:'2.280.000 ₫',reference:'PAY-202608-00089'});

// Payment states. A retry has its own reference and its own static QR/result pages.
function paymentFlow(retry=false) {
  const s=retry?'-retry':'';
  const reference=retry?'PAY-202610-00126':ref;
  shell(`payment${s}.html`,'Xác nhận thanh toán','Kiểm tra hóa đơn và phương thức trước khi tiếp tục.',`<div class="payment-width">${steps(0)}<div class="grid grid-2">${card('Phương thức thanh toán',`<label class="method selected"><input type="radio" name="method" checked>Thanh toán QR<small>Quét mã bằng ứng dụng ngân hàng hỗ trợ VietQR.</small></label><label class="method"><input type="radio" name="method" disabled>Chuyển khoản thủ công<small>Chưa hỗ trợ trong luồng prototype này.</small></label><div class="section-space">${notice('Bạn sẽ nhận được mã QR để hoàn tất thanh toán. Chỉ hóa đơn hợp lệ và chưa thanh toán mới được tiếp tục.')}</div><div class="actions">${btn('Tiếp tục thanh toán →',`payment-qr${s}.html`)}${btn('Về hóa đơn','invoice-detail.html','secondary')}</div>`)}${card('Tóm tắt hóa đơn',`${info([['Hóa đơn',invoice],['Cư dân','Nguyễn Văn An'],['Căn hộ','A-1205'],['Kỳ thu','Tháng 10/2026'],['Hạn thanh toán','10/10/2026'],['Trạng thái',badge('UNPAID')]])}<div class="total"><span>Tổng cộng</span><strong>${amount}</strong></div>${retry?'<p class="small muted section-space">Lần thử mới sẽ sử dụng mã tham chiếu khác. Giao dịch cũ được giữ trong lịch sử.</p>':''}`)}</div>${demo(`${btn('Hóa đơn không hợp lệ','invoice-invalid.html','secondary compact')}${btn('Hóa đơn đã thanh toán','payment-already-paid.html','secondary compact')}`)}</div>`);
  shell(`payment-qr${s}.html`,'Quét mã để thanh toán','Mở ứng dụng ngân hàng và quét mã QR bên dưới.',`<div class="payment-width">${steps(1)}<div class="grid equal"><section class="card qr-panel"><p class="muted small">Số tiền thanh toán</p><p class="amount">${amount}</p><span class="badge pending">PENDING · CHỜ THANH TOÁN</span><div class="qr-frame" role="img" aria-label="QR minh họa, không thể dùng để thanh toán"><div class="qr"><span class="finder one"></span><span class="finder two"></span><span class="finder three"></span><span class="qr-caption">QR DEMO</span></div></div><p class="small muted">Mã minh họa · Không dùng để chuyển tiền</p><p class="section-space"><span class="countdown">◷ Mã QR hết hạn sau <strong>14:52</strong></span></p><p class="muted small subheading">Thời gian mẫu, không đếm ngược thực tế.</p></section><div class="stack">${card('Chi tiết thanh toán',`${info(paymentRows(reference))}<div class="section-space">${notice('<strong>Hóa đơn hợp lệ · UNPAID</strong>Đã tạo yêu cầu thanh toán và nhận mã QR. Đang chờ kết quả thanh toán.')}</div><ol class="instruction-list"><li>Mở ứng dụng ngân hàng của bạn.</li><li>Quét mã QR và kiểm tra số tiền, nội dung.</li><li>Xác nhận thanh toán trên ứng dụng ngân hàng.</li></ol><div class="actions">${btn('Tôi đã hoàn tất thanh toán →',`payment-processing${s}.html`,'full')}${btn('Hủy thanh toán',`payment-cancel${s}.html`,'secondary full')}</div>`)}${notice('Không đóng ứng dụng ngân hàng trước khi hoàn tất. Nhấn “Tôi đã hoàn tất” chỉ chuyển đến bước chờ xác minh, không đánh dấu hóa đơn đã trả.')}</div></div>${demo(btn('Xem phiên hết hạn',`payment-expired${s}.html`,'secondary compact'))}</div>`);
  shell(`payment-processing${s}.html`,'Đang xác minh thanh toán','Kết quả sẽ được ghi nhận sau khi thông tin thanh toán được xác minh.',`<div class="payment-width">${steps(2)}<div class="grid equal"><section class="card"><div class="qr-panel"><div class="spinner" role="img" aria-label="Đang xử lý"></div><h2>Đang xử lý thanh toán</h2><p class="subheading">Đang xác minh giao dịch của bạn…</p><div class="section-space">${badge('PENDING')}</div>${info(paymentRows(reference))}${notice('Hóa đơn hiện vẫn là UNPAID. Vui lòng không tạo thêm giao dịch trong khi chờ xác minh.','warning')}</div></section>${card('Tiến trình thanh toán',`<ol class="timeline"><li><strong>Đã tạo giao dịch</strong><small>${reference}</small></li><li><strong>Đã cấp mã QR</strong><small>Yêu cầu thanh toán đã sẵn sàng</small></li><li><strong>Đã gửi yêu cầu kiểm tra</strong><small>Cư dân thông báo đã hoàn tất thanh toán</small></li><li class="waiting"><strong>Đang xác minh thanh toán</strong><small>Chờ kết quả từ đơn vị thanh toán</small></li><li class="future"><strong>Hoàn tất và gửi xác nhận</strong><small>Chỉ thực hiện khi xác minh thành công</small></li></ol>`)}</div>${demo(`${btn('Mô phỏng thành công',`payment-success${s}.html`,'success compact')}${btn('Mô phỏng thất bại',`payment-failed${s}.html`,'danger compact')}${btn('Mô phỏng hết hạn',`payment-expired${s}.html`,'secondary compact')}`,true)}<div class="actions">${btn('← Về mã QR',`payment-qr${s}.html`,'secondary')}</div></div>`);
  for (const state of ['success','failed','expired']) {
    const ok=state==='success';
    const title=ok?'Thanh toán thành công':state==='failed'?'Thanh toán thất bại':'Phiên thanh toán đã hết hạn';
    const desc=ok?'Hóa đơn của bạn đã được thanh toán thành công.':state==='failed'?'Chúng tôi chưa thể hoàn tất giao dịch của bạn.':'Mã QR đã hết hiệu lực. Vui lòng tạo một phiên thanh toán mới.';
    const follow=ok?(retry?`invoice-paid-retry.html`:'invoice-paid.html'):'invoice-detail.html';
    const history=ok?(retry?'payment-history-retry.html':'payment-history.html'):`payment-history-${state}${s}.html`;
    shell(`payment-${state}${s}.html`,title,'Thanh toán hóa đơn tháng 10/2026',`<div class="payment-width">${steps(3)}<section class="result card"><div class="card-body"><div class="result-icon ${state}" aria-hidden="true">${ok?'✓':state==='failed'?'×':'◷'}</div><h2>${title}</h2><p class="muted">${desc}</p>${info([['Số tiền thanh toán',amount],['Hóa đơn',invoice],['Mã thanh toán',`<span class="mono">${reference}</span>`],...(ok?[['Thời gian thanh toán',retry?'04/10/2026 14:42':time]]:[['Thời điểm ghi nhận',state==='expired'?'04/10/2026 14:45':'04/10/2026 14:32']]),['Trạng thái giao dịch',badge(state.toUpperCase())],['Trạng thái hóa đơn',badge(ok?'PAID':'UNPAID')]])}${notice(ok?'Xác nhận thanh toán đã được gửi đến tài khoản của bạn. Mã tham chiếu và thời gian thanh toán đã được lưu.':'Hóa đơn chưa được thanh toán. Lần thử này đã kết thúc; bạn có thể kiểm tra hóa đơn và tạo một lần thanh toán mới.',ok?'success':state==='failed'?'danger':'warning')}<div class="actions">${btn(ok?'Xem hóa đơn':'Thử lại',ok?follow:'payment-retry.html')}${btn(ok?'Lịch sử thanh toán':'Về hóa đơn',ok?history:follow,'secondary')}</div><div class="section-space small">${link(ok?'Về tổng quan cư dân →':'Xem lần thử trong lịch sử →',ok?(retry?'resident-dashboard-retry.html':'resident-dashboard-paid.html'):history)}</div></div></section>${ok?demo(`${btn('Nhân viên xem kết quả',retry?'staff-payment-detail-retry.html':'staff-payment-detail.html','secondary compact')}${btn('Quản lý xem kết quả',retry?'manager-payment-detail-retry.html':'manager-payment-detail.html','secondary compact')}`):''}</div>`,{paid:ok});
  }
  shell(`payment-cancel${s}.html`,'Dừng thao tác thanh toán','Giao dịch đang chờ chưa được xác nhận thành công.',`<section class="result card"><div class="card-body"><div class="result-icon expired">!</div><h2>Bạn muốn rời màn hình QR?</h2><p class="muted">Việc rời màn hình không hủy được giao dịch trên ứng dụng ngân hàng.</p>${info([['Mã thanh toán',reference],['Giao dịch',badge('PENDING')],['Hóa đơn',badge('UNPAID')]])}${notice('Nếu đã chuyển tiền, hãy tiếp tục theo dõi xác minh. Nếu chưa chuyển, bạn có thể trở về hóa đơn; phiên sẽ chờ kết quả hoặc hết hạn.','warning')}<div class="actions">${btn('Tiếp tục theo dõi',`payment-processing${s}.html`)}${btn('Về hóa đơn','invoice-detail.html','secondary')}</div><div class="section-space small">${link('← Quay lại mã QR',`payment-qr${s}.html`)}</div></div></section>`);
}
paymentFlow(); paymentFlow(true);

for(const paid of [false,true]) {
  const file=paid?'payment-already-paid.html':'invoice-invalid.html';
  shell(file,paid?'Hóa đơn đã được thanh toán':'Không thể thanh toán hóa đơn','Kết quả kiểm tra hóa đơn trước khi tạo giao dịch.',`<section class="result card"><div class="card-body"><div class="result-icon ${paid?'':'invalid'}">${paid?'✓':'!'}</div><h2>${paid?'Không cần thanh toán lại':'Hóa đơn không hợp lệ'}</h2><p class="muted">${paid?'Hóa đơn này đã được ghi nhận thanh toán thành công.':'Hóa đơn đang được ban quản lý điều chỉnh. Vui lòng kiểm tra lại thông tin.'}</p>${info([['Hóa đơn',invoice],['Trạng thái hóa đơn',badge(paid?'PAID':'UNPAID')],['Kiểm tra thanh toán',paid?'Đã thanh toán':'Không hợp lệ · Đang điều chỉnh'],...(paid?[['Mã thanh toán',ref],['Thời gian ghi nhận',time]]:[])])}${notice('Quy trình thanh toán dừng tại đây. Không tạo giao dịch mới và không cấp mã QR.',paid?'success':'danger')}<div class="actions">${btn(paid?'Xem hóa đơn đã trả':'Về danh sách hóa đơn',paid?'invoice-paid.html':'invoices.html')}${btn('Trung tâm prototype','index.html','secondary')}</div>${!paid?'<p class="small muted section-space">Liên hệ ban quản lý: 028 3822 1205 · 08:00–18:00</p>':''}</div></section>`,{paid});
}

function history(file,current='success',retry=false) {
  const paid=current==='success';
  const s=retry?'-retry':'';
  const entries=[];
  if(current!=='none') entries.push(tr([`<strong class="mono">${retry?'PAY-202610-00126':ref}</strong>`,invoice,current==='expired'?'04/10/2026 14:45':retry?'04/10/2026 14:42':time,amount,'QR Payment',badge(current.toUpperCase()),link('Chi tiết',`payment-${current}${s}.html`)],current));
  entries.push(tr(['<span class="mono">PAY-202610-00124</span>',invoice,'04/10/2026 14:10',amount,'QR Payment',badge('EXPIRED'),link('Chi tiết','payment-attempt-124.html')],'expired'));
  entries.push(tr(['<span class="mono">PAY-202610-00123</span>',invoice,'04/10/2026 13:50',amount,'QR Payment',badge('FAILED'),link('Chi tiết','payment-attempt-123.html')],'failed'));
  entries.push(tr(['<span class="mono">PAY-202609-00102</span>','INV-2026-09','04/09/2026 09:20','2.300.000 ₫','QR Payment',badge('SUCCESS'),link('Hóa đơn','invoice-september.html')],'success'));
  entries.push(tr(['<span class="mono">PAY-202608-00089</span>','INV-2026-08','04/08/2026 09:20','2.280.000 ₫','QR Payment',badge('SUCCESS'),link('Hóa đơn','invoice-august.html')],'success'));
  shell(file,'Lịch sử thanh toán','Mỗi lần thanh toán có một mã tham chiếu và kết quả riêng.',`<div class="notice ${paid?'success':'warning'}"><strong>Hóa đơn tháng 10: ${paid?'ĐÃ THANH TOÁN · PAID':'CHƯA THANH TOÁN · UNPAID'}</strong>${paid?'Các lần thử thất bại trước đó vẫn được lưu; không ảnh hưởng đến kết quả thanh toán thành công.':'Giao dịch thất bại hoặc hết hạn chưa thanh toán được hóa đơn.'}</div><section class="card filter-card section-space"><header class="card-header"><h2>Các lần thanh toán tiêu biểu</h2><span class="muted small">Căn hộ A-1205</span></header>${filters([['success','Success'],['failed','Failed'],['expired','Expired']])}${table(['Mã thanh toán','Hóa đơn','Thời điểm','Số tiền','Phương thức','Giao dịch','Thao tác'],entries)}<div class="table-footer"><span>${entries.length} giao dịch mẫu · Bộ lọc trạng thái hoạt động bằng CSS</span></div></section><div class="actions">${btn('Về hóa đơn tháng 10',paid?(retry?'invoice-paid-retry.html':'invoice-paid.html'):'invoice-detail.html','secondary')}</div>`,{paid,active:'history'});
}
history('payment-history.html'); history('payment-history-unpaid.html','none'); history('payment-history-retry.html','success',true);
for(const state of ['failed','expired']) {history(`payment-history-${state}.html`,state);history(`payment-history-${state}-retry.html`,state,true);}
for(const [id,state,at] of [['123','FAILED','13:50'],['124','EXPIRED','14:10']]) {
  shell(`payment-attempt-${id}.html`,'Chi tiết lần thanh toán','Lịch sử kết quả tại thời điểm xử lý giao dịch.',`<section class="result card"><div class="card-body"><div class="result-icon ${state.toLowerCase()}">${state==='FAILED'?'×':'◷'}</div><h2>${state==='FAILED'?'Giao dịch không thành công':'Phiên thanh toán đã hết hạn'}</h2>${info([['Mã giao dịch',`PAY-202610-00${id}`],['Hóa đơn',invoice],['Số tiền',amount],['Ghi nhận lúc',`04/10/2026 ${at}`],['Kết quả',badge(state)],['Hóa đơn tại thời điểm này',badge('UNPAID')]])}${notice('Đây là kết quả của một lần thử trước đó. Trạng thái hóa đơn hiện tại có thể thay đổi khi một lần thanh toán sau thành công.','warning')}<div class="actions">${btn('Lịch sử sau thanh toán','payment-history.html')}${btn('Lịch sử trước thanh toán','payment-history-unpaid.html','secondary')}</div></div></section>`,{active:'history'});
}

// Resident supporting navigation, each with pre-/post-payment snapshots.
for(const paid of [false,true]) {
  const s=paid?'-paid':'';
  shell(`resident-apartment${s}.html`,'Căn hộ của tôi','Thông tin cư trú tại Sunrise Residence.',`<div class="grid equal">${card('A-1205 · Tòa A',`${info([['Cư dân','Nguyễn Văn An'],['Tầng','12'],['Diện tích','72 m²'],['Loại căn hộ','02 phòng ngủ'],['Địa chỉ','Sunrise Residence · TP. Hồ Chí Minh']])}`)}${card('Dịch vụ căn hộ',`${info([['Phí quản lý tháng 10','800.000 ₫'],['Phương tiện đăng ký','02 phương tiện'],['Hóa đơn tháng 10',badge(paid?'PAID':'UNPAID')]])}<div class="actions">${btn('Xem hóa đơn',paid?'invoice-paid.html':'invoice-detail.html')}</div>`)}</div>`,{paid,active:'apartment'});
  shell(`resident-profile${s}.html`,'Hồ sơ cá nhân','Thông tin tài khoản cư dân đang đăng nhập.',`<div class="grid equal">${card('Nguyễn Văn An',`${info([['Vai trò','Cư dân'],['Căn hộ','A-1205 · Tòa A'],['Email minh họa','an.nguyen@example.com'],['Số điện thoại','090 ••• •205']])}`)}${card('Hỗ trợ tài khoản',`<p class="muted">Để điều chỉnh thông tin cư trú hoặc tài khoản, vui lòng liên hệ ban quản lý tại sảnh tòa A.</p><div class="actions">${btn('Thông tin hỗ trợ','forgot-password.html','secondary')}</div>`)}</div>`,{paid,active:'profile'});
  shell(`resident-notifications${s}.html`,'Thông báo','Thông tin từ ban quản lý và xác nhận thanh toán.',`<div class="stack">${paid?card('✓ Xác nhận thanh toán tháng 10/2026',`<p>Đã ghi nhận thanh toán <strong>${amount}</strong> cho hóa đơn <strong>${invoice}</strong>.</p>${info([['Mã tham chiếu',ref],['Thời gian',time],['Giao dịch',badge('SUCCESS')],['Hóa đơn',badge('PAID')]])}<div class="actions">${btn('Xem xác nhận','payment-success.html')}</div>`):''}${card('Hóa đơn tháng 10 đã được phát hành',`<p class="muted small">01/10/2026 · Ban quản lý Sunrise Residence</p><p class="section-space">Hóa đơn dịch vụ tháng 10/2026 của căn hộ A-1205 có tổng phí <strong>${amount}</strong>. Hạn thanh toán ngày 10/10/2026.</p><div class="actions">${btn('Xem hóa đơn',paid?'invoice-paid.html':'invoice-detail.html','secondary')}</div>`)}</div>`,{paid,active:'notifications'});
}

// Staff and manager have read-only payment monitoring, per the supplied actor flow.
function staffRows(role) {
  return [
    tr([`<strong class="mono">${ref}</strong>`,invoice,'Nguyễn Văn An','A-1205',amount,time,badge('SUCCESS'),link('Chi tiết',`${role}-payment-detail.html`)],'success'),
    tr(['<span class="mono">PAY-202610-00124</span>',invoice,'Nguyễn Văn An','A-1205',amount,'—<small>Kết quả: 04/10/2026 14:10</small>',badge('EXPIRED'),link('Chi tiết',`${role}-payment-expired.html`)],'expired'),
    tr(['<span class="mono">PAY-202610-00123</span>',invoice,'Nguyễn Văn An','A-1205',amount,'—<small>Kết quả: 04/10/2026 13:50</small>',badge('FAILED'),link('Chi tiết',`${role}-payment-failed.html`)],'failed'),
    tr(['<span class="mono">PAY-202610-00127</span>','INV-B0802-10','Trần Thị Mai','B-0802','2.150.000 ₫','Chưa ghi nhận',badge('PENDING'),link('Chi tiết',`${role}-payment-pending.html`)],'pending'),
  ];
}
const staffHeads=['Mã thanh toán','Hóa đơn','Cư dân','Căn hộ','Số tiền','Thời gian thanh toán','Giao dịch','Thao tác'];
for(const role of ['staff','manager']) {
  const opts=active=>({role,active});
  shell(`${role}-dashboard.html`,role==='manager'?'Tổng quan quản lý':'Tổng quan vận hành','Theo dõi thu phí tháng 10/2026 · Sunrise Residence',`<div class="stats">${stat('Tổng hóa đơn','1.245','Đã phát hành tháng 10/2026')}${stat('Đã thanh toán','982',badge('PAID'),'check')}${stat('Chưa thanh toán','263','214 chưa trả + 49 có lần thử lỗi','wallet')}${stat('Hóa đơn có lần thử lỗi','49','FAILED / EXPIRED · Vẫn UNPAID','history')}</div><div class="grid grid-2">${card('Tiến độ thu phí tháng 10',`<div class="row between"><div><p class="muted small">Tỷ lệ hóa đơn đã thanh toán</p><p class="amount">78,9<small>%</small></p></div>${badge('PAID')}</div><div class="progress-bar" role="img" aria-label="982 trong 1245 hóa đơn đã thanh toán, tương đương 78,9 phần trăm"><span class="collected"></span><span class="outstanding"></span></div><div class="row between small"><span>982 đã thanh toán</span><span class="muted">263 chưa thanh toán</span></div><p class="small muted section-space">214 hóa đơn chưa trả không có lần thử lỗi; 49 hóa đơn chưa trả có giao dịch thất bại hoặc hết hạn. Tổng: 1.245.</p>`)}${card('Thanh toán ngày 04/10',`<p class="muted small">Số tiền đã xác minh</p><p class="amount">68.450.000 <small>₫</small></p><div class="section-space">${badge('SUCCESS')} <span class="small muted">28 giao dịch thành công</span></div><div class="actions">${link('Theo dõi giao dịch →',`${role}-payment-monitoring.html`)}</div>`)}</div><section class="card section-space"><header class="card-header"><div><h2>Giao dịch gần đây</h2><p class="muted small">Kết quả sau xác minh · Snapshot ngày 04/10/2026</p></div>${link('Xem tất cả →',`${role}-payment-monitoring.html`)}</header>${table(staffHeads,staffRows(role))}</section><div class="section-space">${notice('Hóa đơn INV-2026-10 của Nguyễn Văn An đã chuyển sang PAID. Mã tham chiếu và thời gian thanh toán đã được ghi nhận.','success')}</div>`,opts('dashboard'));
  shell(`${role}-payment-monitoring.html`,'Giao dịch thanh toán','Tra cứu kết quả giao dịch và trạng thái hóa đơn liên quan.',`<section class="card filter-card"><header class="card-header"><h2>Theo dõi giao dịch</h2><span class="small muted">Tháng 10/2026 · Tất cả tòa nhà</span></header><div class="filters"><div class="field"><label for="search">Tìm mã thanh toán · ô nhập minh họa</label><input id="search" type="search" placeholder="Nhập mã tham chiếu thanh toán…"></div><div class="field"><label for="building">Tòa nhà · lựa chọn minh họa</label><select id="building"><option>Tất cả tòa nhà</option><option>Tòa A</option><option>Tòa B</option><option>Tòa C</option></select></div></div><p class="small muted card-body">Bộ lọc trạng thái bên dưới hoạt động bằng CSS. Ô tìm kiếm và chọn tòa nhà minh họa bố cục, chưa xử lý dữ liệu.</p>${filters([['success','Success'],['failed','Failed'],['expired','Expired'],['pending','Pending']])}${table(staffHeads,staffRows(role))}<div class="table-footer"><span>4 giao dịch mẫu</span><span>Dữ liệu tĩnh · Không tự làm mới</span></div></section><div class="section-space">${notice('SUCCESS là trạng thái giao dịch. PAID là trạng thái hóa đơn. Giao dịch FAILED / EXPIRED chỉ ghi lại lần thử, không tự gạch nợ.')}</div>`,opts('payments'));
  for(const state of ['success','failed','expired','pending']) {
    const ok=state==='success';
    const pending=state==='pending';
    const reference=ok?ref:state==='failed'?'PAY-202610-00123':state==='expired'?'PAY-202610-00124':'PAY-202610-00127';
    const at=ok?time:state==='failed'?'04/10/2026 13:50':state==='expired'?'04/10/2026 14:10':'Chưa ghi nhận';
    const file=ok?`${role}-payment-detail.html`:`${role}-payment-${state}.html`;
    const timeline=ok?[['Giao dịch được tạo','14:30:00 · Tạo mã tham chiếu'],['Đã cấp mã QR','14:30:02 · Nhận QR / payment link'],['Đã gửi thanh toán','14:31:42 · Đơn vị thanh toán xử lý'],['Nhận payment webhook','14:32:00 · Nhận kết quả từ đơn vị thanh toán'],['Đã xác minh thông tin','14:32:01 · Mã tham chiếu, hóa đơn, số tiền khớp'],['Giao dịch → SUCCESS','14:32:01 · Ghi nhận kết quả thành công'],['Hóa đơn → PAID','14:32:01 · Lưu thời gian và mã thanh toán'],['Đã gửi xác nhận','14:32:02 · Thông báo vào tài khoản cư dân']]:[['Giao dịch được tạo','Đã khởi tạo một lần thanh toán'],['Đã cấp mã QR','Phiên thanh toán đã được cấp'],[pending?'Chờ kết quả thanh toán':`Nhận kết quả ${state.toUpperCase()}`,pending?'Chưa nhận kết quả để xác minh':'Ghi nhận kết quả từ đơn vị thanh toán'],[pending?'Hóa đơn vẫn UNPAID':'Không gạch nợ tại lần thử này',pending?'Chỉ cập nhật PAID sau xác minh thành công':'Hóa đơn giữ trạng thái UNPAID tại thời điểm xử lý']];
    shell(file,'Chi tiết giao dịch',reference,`<div class="grid grid-2"><div class="stack">${card('Thông tin cư dân',`${info([['Cư dân',pending?'Trần Thị Mai':'Nguyễn Văn An'],['Căn hộ',pending?'B-0802 · Tòa B':'A-1205 · Tòa A'],['Hóa đơn',pending?'INV-B0802-10':invoice],['Kỳ thu','Tháng 10/2026'],['Số tiền',pending?'2.150.000 ₫':amount]])}`)}${card('Thông tin thanh toán',`${info([['Mã thanh toán',`<span class="mono">${reference}</span>`],['Trạng thái giao dịch',badge(state.toUpperCase())],['Thời gian thanh toán',ok?at:'—'],['Thời điểm nhận kết quả',at],['Phương thức','QR Payment'],['Hóa đơn tại thời điểm kết quả',badge(ok?'PAID':'UNPAID')],...(!ok&&!pending?[['Hóa đơn hiện tại',`${badge('PAID')} <span class="small">Qua giao dịch 00125</span>`]]:[])])}<div class="section-space">${notice(ok?'Đã đối chiếu đúng hóa đơn, đúng số tiền và đúng mã tham chiếu. Cư dân đã nhận xác nhận.':pending?'Đang chờ kết quả. Chưa ghi nhận thời gian thanh toán, chưa đánh dấu hóa đơn PAID.':'Lần thử này không thanh toán được hóa đơn. Sau đó giao dịch PAY-202610-00125 thành công; xem riêng giao dịch thành công để đối chiếu.',ok?'success':'warning')}</div>`)}</div>${card('Dòng thời gian giao dịch',`<ol class="timeline">${timeline.map(([t,d],i)=>`<li${!ok&&i>=2?` class="${pending?'waiting':'error'}"`:''}><strong>${t}</strong><small>${d}</small></li>`).join('')}</ol>`)}</div><div class="actions">${btn('← Về danh sách giao dịch',`${role}-payment-monitoring.html`,'secondary')}${btn('Xem hóa đơn trong hệ thống',`${role}-invoices.html`,'secondary')}</div>`,opts('payments'));
  }
  shell(`${role}-invoices.html`,'Hóa đơn cư dân','Trạng thái công nợ sau khi đối chiếu kết quả thanh toán.',`<section class="card"><header class="card-header"><h2>Hóa đơn tháng 10/2026</h2><span class="small muted">02 hóa đơn tiêu biểu</span></header>${table(['Hóa đơn','Cư dân','Căn hộ','Số tiền','Hóa đơn','Thao tác'],[tr([invoice,'Nguyễn Văn An','A-1205',amount,badge('PAID'),link('Xem giao dịch',`${role}-payment-detail.html`)]),tr(['INV-B0802-10','Trần Thị Mai','B-0802','2.150.000 ₫',badge('UNPAID'),link('Giao dịch đang chờ',`${role}-payment-pending.html`)])])}</section>`,opts('invoices'));
  shell(`${role}-residents.html`,'Cư dân','Thông tin cư dân liên quan đến các giao dịch minh họa.',`<section class="card">${table(['Cư dân','Căn hộ','Liên hệ','Hóa đơn tháng 10','Thao tác'],[tr(['Nguyễn Văn An','A-1205','an.nguyen@example.com',badge('PAID'),link('Xem thanh toán',`${role}-payment-detail.html`)]),tr(['Trần Thị Mai','B-0802','mai.tran@example.com',badge('UNPAID'),link('Xem giao dịch',`${role}-payment-pending.html`)])])}</section>`,opts('residents'));
  shell(`${role}-apartments.html`,'Căn hộ','Các căn hộ trong dữ liệu thanh toán minh họa.',`<div class="grid equal">${card('A-1205 · Tòa A',`${info([['Cư dân','Nguyễn Văn An'],['Hóa đơn tháng 10',amount],['Trạng thái',badge('PAID')]])}<div class="actions">${btn('Xem kết quả thanh toán',`${role}-payment-detail.html`,'secondary')}</div>`)}${card('B-0802 · Tòa B',`${info([['Cư dân','Trần Thị Mai'],['Hóa đơn tháng 10','2.150.000 ₫'],['Trạng thái',badge('UNPAID')]])}<div class="actions">${btn('Xem giao dịch đang chờ',`${role}-payment-pending.html`,'secondary')}</div>`)}</div>`,opts('apartments'));
  shell(`${role}-reports.html`,'Báo cáo thu phí','Tổng hợp snapshot tháng 10/2026 · Dữ liệu minh họa.',`<div class="stats">${stat('Tổng hóa đơn','1.245','Trong kỳ')}${stat('Đã thanh toán','982','78,9%','check')}${stat('Chưa thanh toán','263','21,1%','wallet')}${stat('Có lần thử lỗi','49','Nằm trong 263 hóa đơn chưa trả','history')}</div>${card('Đối chiếu trạng thái hóa đơn',`${info([['Đã trả · PAID','982'],['Chưa trả, chưa có lần thử lỗi','214'],['Chưa trả, có lần thử FAILED / EXPIRED','49'],['Tổng cộng','1.245']])}<div class="actions">${btn('Xem giao dịch',`${role}-payment-monitoring.html`)}</div>`)}`,opts('reports'));
  shell(`${role}-notifications.html`,'Thông báo thanh toán','Các cập nhật dành cho ban quản lý.',card('✓ Đã xác minh thanh toán A-1205',`<p>Hóa đơn <strong>${invoice}</strong> của Nguyễn Văn An đã chuyển sang <strong>PAID</strong>.</p>${info([['Mã tham chiếu',ref],['Số tiền',amount],['Thời gian',time],['Xác nhận cư dân','Đã gửi vào tài khoản']])}<div class="actions">${btn('Xem giao dịch',`${role}-payment-detail.html`)}</div>`),opts('notifications'));
  shell(`${role}-settings.html`,'Cài đặt tài khoản','Thông tin quyền truy cập trong luồng thanh toán.',card('Quyền theo vai trò',`${info([['Vai trò',role==='manager'?'Quản lý tòa nhà':'Nhân viên vận hành'],['Theo dõi giao dịch','Được xem'],['Xem kết quả xác minh','Được xem'],['Tự đánh dấu thanh toán','Không thuộc luồng nghiệp vụ'],['Phạm vi','Sunrise Residence']])}${notice('Các trang prototype thể hiện quyền xem kết quả. Không có cấu hình cổng thanh toán hoặc xử lý webhook thật.')}<div class="actions">${btn('Về tổng quan',`${role}-dashboard.html`,'secondary')}</div>`),opts('settings'));
}

// Preserve coherent paid snapshots for the separate retry branch without browser state.
const retrySources=[
  ['invoice-paid.html','invoice-paid-retry.html'],['invoice-paid-download.html','invoice-paid-download-retry.html'],
  ['resident-dashboard-paid.html','resident-dashboard-retry.html'],['invoices-paid.html','invoices-paid-retry.html'],
  ['resident-notifications-paid.html','resident-notifications-retry.html'],['resident-apartment-paid.html','resident-apartment-retry.html'],
  ['resident-profile-paid.html','resident-profile-retry.html'],['staff-payment-detail.html','staff-payment-detail-retry.html'],
  ['manager-payment-detail.html','manager-payment-detail-retry.html'],['staff-payment-monitoring.html','staff-payment-monitoring-retry.html'],
  ['manager-payment-monitoring.html','manager-payment-monitoring-retry.html'],
];
const retryMapping=Object.fromEntries([...retrySources,['payment-success.html','payment-success-retry.html'],['payment-history.html','payment-history-retry.html']]);
for(const role of ['staff','manager']) for(const section of ['dashboard','invoices','residents','apartments','reports','notifications','settings','payment-pending','payment-failed','payment-expired']) {
  const source=`${role}-${section}.html`, dest=`${role}-${section}-retry.html`;
  retrySources.push([source,dest]); retryMapping[source]=dest;
}
function toRetry(html) {
  return html.replaceAll(ref,'PAY-202610-00126').replaceAll('00125','00126').replaceAll('14:32','14:42').replaceAll('14:30','14:40').replaceAll('14:31','14:41').replace(/href="([^"]+)"/g,(full,url)=>retryMapping[url]?`href="${retryMapping[url]}"`:full);
}
for(const [source,dest] of retrySources) {fs.writeFileSync(path.join(root,dest),toRetry(fs.readFileSync(path.join(root,source),'utf8')));pages.add(dest);}
for(const file of ['payment-success-retry.html','payment-history-retry.html']) {
  let html=fs.readFileSync(path.join(root,file),'utf8');
  // Only rewrite navigation; the history intentionally keeps previous attempt 00125.
  html=html.replace(/href="([^"]+)"/g,(full,url)=>retryMapping[url]?`href="${retryMapping[url]}"`:full);
  fs.writeFileSync(path.join(root,file),html);
}
// Format emitted HTML for direct editing. This is an authoring step only.
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function formatHtml(source) {
  const tokens = source.match(/<!--[^]*?-->|<![^>]*>|<\/?[a-zA-Z][\w-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g) || [];
  let depth=0;
  return tokens.flatMap(token=>{
    token=token.trim();
    if(!token) return [];
    const tag=token.match(/^<\/?([a-zA-Z][\w-]*)/);
    const closing=token.startsWith('</');
    if(closing) depth=Math.max(0,depth-1);
    const line='  '.repeat(depth)+token;
    if(tag&&!closing&&!voidTags.has(tag[1].toLowerCase())&&!token.endsWith('/>')) depth++;
    return [line];
  }).join('\n')+'\n';
}
for(const file of pages) fs.writeFileSync(path.join(root,file),formatHtml(fs.readFileSync(path.join(root,file),'utf8')));
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs','payment-pages.json'),JSON.stringify([...pages].sort(),null,2)+'\n');
console.log(`Generated ${pages.size} standalone HTML pages. Open index.html directly; no runtime JavaScript or server required.`);
