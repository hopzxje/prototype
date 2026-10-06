const HANDOVER_CONDITIONS = [
  ['walls', 'Tường & sàn'],
  ['doors', 'Cửa & khóa'],
  ['bathroom', 'Thiết bị vệ sinh'],
  ['furniture', 'Nội thất & thiết bị']
];

function handoverEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

function handoverDate(value) {
  if (!value) return 'Chưa chọn ngày';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function handoverTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function handoverContext() {
  const user = DataStore.getUser();
  const state = DataStore.getHandover();
  const room = DataStore.getRooms().find(item => item.roomNumber === user.room) || {};
  const building = DataStore.getBuildings().find(item => item.id === room.buildingId) || {};
  return { user, state, room, building };
}

function renderHandoverWorkspace() {
  const root = document.getElementById('handover-workspace');
  if (!root) return;
  const role = DataStore.getRole();
  const { user, state } = handoverContext();
  renderSidebar('handover.html');

  if (role === 'RESIDENT') root.innerHTML = renderResidentHandover(user, state);
  else if (role === 'STAFF') root.innerHTML = renderStaffHandover(user, state);
  else if (role === 'MANAGER') root.innerHTML = renderManagerHandover(user, state);
  else root.innerHTML = '<section class="handover-empty"><h2>Trang này dành cho đội ngũ vận hành</h2><p>Hãy chuyển sang vai trò Quản lý, Nhân viên hoặc Cư dân để tiếp tục luồng bàn giao.</p></section>';
  lucide.createIcons();
}

function handoverAppointmentCard(state, user, opensDetails = false) {
  const statusLabel = state.status === 'APPOINTMENT_PENDING' ? 'Chờ xác nhận' : state.status === 'SCHEDULED' ? 'Đã xác nhận' : state.status === 'IN_PROGRESS' ? 'Đang check-in' : 'Đang xử lý';
  const staffAction = DataStore.getRole() !== 'STAFF' ? ''
    : state.status === 'APPOINTMENT_PENDING'
      ? `<button class="handover-button handover-appointment-accept" onclick="acceptCheckinAppointment('${handoverEscape(state.appointmentId)}')">Xác nhận lịch<i data-lucide="check" class="w-4 h-4"></i></button>`
      : state.status === 'SCHEDULED'
        ? `<button class="handover-button handover-appointment-accept" onclick="startHandoverInspection('${handoverEscape(state.appointmentId)}')">Check-in<i data-lucide="arrow-right" class="w-4 h-4"></i></button>`
        : '';
  const parentAttributes = opensDetails
    ? 'id="handover-appointment-parent" class="handover-appointment-card handover-expandable-parent" role="button" tabindex="0" aria-haspopup="dialog" aria-controls="handoverDetailsModal" onclick="openHandoverDetails()" onkeydown="handleHandoverParentKeydown(event)"'
    : 'class="handover-appointment-card"';
  const expandControl = opensDetails
    ? '<span class="handover-parent-expand"><span>Xem các bước</span><i data-lucide="external-link" class="w-4 h-4"></i></span>'
    : '';
  return `<section ${parentAttributes}><div class="handover-appointment-symbol"><i data-lucide="key-round" class="w-6 h-6"></i></div><div class="handover-appointment-info"><span>LỊCH NHẬN CĂN HỘ · ${handoverEscape(user.room || 'P201')}</span><h2>${handoverDate(state.appointmentDate)}</h2><p>${handoverEscape(state.appointmentTime || 'Chưa chọn khung giờ')} · ${handoverEscape(user.building || 'StayHub Central - Ba Đình')}</p></div><div class="handover-appointment-actions"><b class="handover-status-pill">${statusLabel}</b>${staffAction}${expandControl}</div></section>`;
}

function renderHandoverProcessGroup(state, user, childSteps) {
  return `<div class="handover-parent-group">${handoverAppointmentCard(state, user, true)}<div id="handoverDetailsModal" class="modal-backdrop handover-details-modal" onclick="closeHandoverDetailsFromBackdrop(event)"><section class="modal-content" role="dialog" aria-modal="true" aria-labelledby="handover-details-title"><header class="handover-details-header"><div><span>CHI TIẾT LỊCH CHECK-IN · ${handoverEscape(user.room || 'P201')}</span><h2 id="handover-details-title">${handoverDate(state.appointmentDate)} · ${handoverEscape(state.appointmentTime || 'Chưa chọn khung giờ')}</h2></div><button type="button" class="handover-modal-close" onclick="closeHandoverDetails()" aria-label="Đóng"><i data-lucide="x" class="w-5 h-5"></i></button></header><div class="handover-details-content">${childSteps}</div></section></div></div>`;
}

function openHandoverDetails() {
  openModal('handoverDetailsModal');
  document.querySelector('#handoverDetailsModal .handover-modal-close')?.focus();
}

function closeHandoverDetails() {
  closeModal('handoverDetailsModal');
  document.getElementById('handover-appointment-parent')?.focus();
}

function closeHandoverDetailsFromBackdrop(event) {
  if (event.target.id === 'handoverDetailsModal') closeHandoverDetails();
}

function handleHandoverParentKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openHandoverDetails();
}

function handleHandoverDetailsEscape(event) {
  const modal = document.getElementById('handoverDetailsModal');
  if (event.key !== 'Escape' || !modal?.classList.contains('active')) return;
  const nestedModal = [...modal.querySelectorAll('.modal-backdrop.active')].at(-1);
  if (nestedModal) {
    nestedModal.classList.remove('active');
    return;
  }
  closeHandoverDetails();
}

function renderHandoverAssetRow(asset, index, isNew = false, key = `asset-${index}`) {
  const photoPreview = asset.photo?.dataUrl
    ? `<img src="${handoverEscape(asset.photo.dataUrl)}" alt="Ảnh ${handoverEscape(asset.name || 'tài sản')}" loading="lazy"><span>${handoverEscape(asset.photo.name || 'Ảnh đã lưu')}</span>`
    : '<div class="handover-asset-photo-empty"><i data-lucide="image-plus" class="w-5 h-5"></i><span>Chưa có ảnh cho tài sản này</span></div>';
  const removeButton = isNew || asset.custom
    ? `<button type="button" class="handover-asset-remove" onclick="removeHandoverAsset('${handoverEscape(key)}')" aria-label="Xóa tài sản"><i data-lucide="x" class="w-4 h-4"></i></button>`
    : '';
  return `<article class="handover-asset-item" data-asset-key="${handoverEscape(key)}" data-source-index="${isNew ? '' : index}"><div class="handover-asset-item-heading"><label class="handover-asset-check"><input type="checkbox" data-asset-check ${asset.checked ? 'checked' : ''}><span>Đã kiểm kê</span></label><label class="handover-asset-name"><span>Tên tài sản</span><input type="text" data-asset-name value="${handoverEscape(asset.name || '')}" placeholder="Ví dụ: Điều hòa" required></label>${removeButton}</div><label class="handover-asset-photo-trigger"><i data-lucide="camera" class="w-4 h-4"></i><span>Chụp / tải ảnh tài sản</span><input type="file" accept="image/*" capture="environment" data-asset-photo onchange="previewHandoverAssetPhoto(event, '${handoverEscape(key)}')"></label><div class="handover-asset-photo-preview" id="handover-asset-photo-preview-${handoverEscape(key)}">${photoPreview}</div></article>`;
}

function renderConditionPhotoGallery(photos = []) {
  if (!photos.length) return '<p class="handover-condition-photo-empty">Chưa có ảnh tình trạng căn hộ.</p>';
  return `<div class="handover-condition-photo-gallery">${photos.map((photo, index) => `<figure><img src="${handoverEscape(photo.dataUrl)}" alt="Ảnh tình trạng căn hộ ${index + 1}" loading="lazy"><figcaption>${handoverEscape(photo.name || `Ảnh tình trạng ${index + 1}`)}</figcaption></figure>`).join('')}</div>`;
}

function renderApprovalPacket(state) {
  const conditionRows = HANDOVER_CONDITIONS.map(([key, label]) => `<div class="handover-review-row"><i data-lucide="${state.condition?.[key] === false ? 'triangle-alert' : 'circle-check'}" class="w-4 h-4 ${state.condition?.[key] === false ? 'is-warning' : ''}"></i><span>${label}</span><b>${state.condition?.[key] === false ? 'Cần xem lại' : 'Đạt'}</b></div>`).join('');
  const assetRows = (state.assets || []).map((asset, index) => `<article class="handover-review-asset">${asset.photo?.dataUrl ? `<img src="${handoverEscape(asset.photo.dataUrl)}" alt="Ảnh ${handoverEscape(asset.name)}" loading="lazy">` : '<div class="handover-review-asset-empty"><i data-lucide="image-off" class="w-5 h-5"></i></div>'}<div><strong>${handoverEscape(asset.name || `Tài sản ${index + 1}`)}</strong><span>${asset.checked ? 'Đã kiểm kê · Đầy đủ' : 'Cần xem lại · Thiếu / sai lệch'}</span>${asset.photo?.name ? `<small>${handoverEscape(asset.photo.name)}</small>` : '<small>Chưa có ảnh tài sản</small>'}</div></article>`).join('');
  return `<section class="handover-review-card"><div class="handover-section-heading"><div><span>HỒ SƠ GỬI ĐỒNG THỜI CHO HAI BÊN</span><h2>Kiểm tra cùng một bộ thông tin</h2></div><span class="handover-progress-label">Ảnh, checklist & chỉ số</span></div><div class="handover-review-grid"><div><h3><i data-lucide="scan-line" class="w-4 h-4"></i>Tình trạng căn hộ</h3>${conditionRows}<h3 class="handover-review-subhead"><i data-lucide="images" class="w-4 h-4"></i>Ảnh tình trạng căn hộ</h3>${renderConditionPhotoGallery(state.photos || [])}<div class="handover-review-row"><i data-lucide="zap" class="w-4 h-4"></i><span>Điện / nước ban đầu</span><b>${handoverEscape(state.electricity || '—')} kWh · ${handoverEscape(state.water || '—')} m³</b></div><h3 class="handover-review-subhead"><i data-lucide="boxes" class="w-4 h-4"></i>Kiểm kê tài sản</h3><div class="handover-review-assets">${assetRows}</div></div><aside class="handover-minute-preview"><span>GHI CHÚ BÀN GIAO</span><p>${handoverEscape(state.issueNote || 'Không ghi nhận vấn đề cần xử lý.')}</p><small>Lịch hẹn: ${handoverDate(state.appointmentDate)} · ${handoverEscape(state.appointmentTime)}</small><small>Ảnh kiểm kê được đính kèm theo từng tài sản. Quản lý và cư dân cùng duyệt bộ hồ sơ này.</small></aside></div></section>`;
}

function approvalStateLine(state) {
  const manager = state.managerApproved ? `Đã đồng ý · ${handoverEscape(state.managerApprovalName || 'Quản lý')} · ${handoverEscape(handoverTimestamp(state.managerApprovedAt))}` : 'Chờ quản lý duyệt';
  const resident = state.residentApproved ? `Đã đồng ý · ${handoverEscape(state.residentSignature || 'Cư dân')} · ${handoverEscape(handoverTimestamp(state.residentApprovedAt))}` : 'Chờ cư dân duyệt';
  return `<div class="handover-dual-approval-status"><div class="${state.managerApproved ? 'is-approved' : ''}"><i data-lucide="${state.managerApproved ? 'circle-check' : 'clock-3'}" class="w-4 h-4"></i><span>Quản lý</span><b>${manager}</b></div><div class="${state.residentApproved ? 'is-approved' : ''}"><i data-lucide="${state.residentApproved ? 'circle-check' : 'clock-3'}" class="w-4 h-4"></i><span>Cư dân</span><b>${resident}</b></div></div>`;
}

function renderStaffHandover(user, state) {
  const header = '';
  if (state.status === 'NOT_SCHEDULED') return `${header}<section class="handover-empty"><div class="handover-empty-icon"><i data-lucide="calendar-clock" class="w-7 h-7"></i></div><h2>Chưa có lịch bàn giao mới</h2><p>Khi cư dân đặt lịch check-in, lịch hẹn sẽ xuất hiện tại đây.</p></section>`;
  if (state.status === 'APPOINTMENT_PENDING') return `${header}${handoverAppointmentCard(state, user)}`;
  if (state.status === 'SCHEDULED') return `${header}${handoverAppointmentCard(state, user)}`;
  if (state.status === 'IN_PROGRESS') return `${header}${handoverAppointmentCard(state, user)}${renderInspectionForm(state)}`;
  if (state.status === 'NEEDS_REPAIR') {
    const child = `<section class="handover-repair-card"><div class="handover-warning-icon"><i data-lucide="wrench" class="w-5 h-5"></i></div><div><span>YÊU CẦU CẬP NHẬT HỒ SƠ · ${handoverEscape(state.rejectedBy || 'Người duyệt')}</span><h2>Điều chỉnh trước khi gửi duyệt lại</h2><p>${handoverEscape(state.revisionComment || 'Người duyệt yêu cầu làm rõ thông tin bàn giao.')}</p><small>Khi gửi lại, cả hai bên sẽ nhận hồ sơ mới và cần duyệt lại.</small></div><button class="handover-button" onclick="reopenHandoverInspection()">Cập nhật hồ sơ</button></section>`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'DUAL_REVIEW') {
    const child = `${approvalStateLine(state)}<section class="handover-wait-card"><i data-lucide="send" class="w-6 h-6"></i><div><h2>Hồ sơ đã gửi cho cả hai bên</h2><p>Quản lý và cư dân đang xem cùng bộ ảnh, checklist và chỉ số. Chỉ cần một bên yêu cầu chỉnh sửa là hồ sơ quay lại nhân viên.</p></div></section>${renderApprovalPacket(state)}`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'BOTH_APPROVED') return `${header}${renderHandoverProcessGroup(state, user, `${approvalStateLine(state)}${renderStaffSigning(state)}`)}`;
  if (state.status === 'MANAGER_FINAL_REVIEW') {
    const child = `${approvalStateLine(state)}<section class="handover-wait-card"><i data-lucide="file-check-2" class="w-6 h-6"></i><div><h2>Biên bản đã ký, chờ quản lý hoàn tất</h2><p>Hai bên đã đồng ý hồ sơ bàn giao. Nhân viên đã ký và gửi biên bản cuối cùng.</p></div></section>`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  const child = '<section class="handover-complete-card"><i data-lucide="circle-check" class="w-7 h-7"></i><div><h2>Đã hoàn tất bàn giao</h2><p>Quản lý đã xác nhận; hồ sơ đã được chia sẻ với cư dân.</p></div></section>';
  return `${header}${renderHandoverProcessGroup(state, user, child)}`;
}

function renderInspectionForm(state) {
  const assetRows = (state.assets || []).map((asset, index) => renderHandoverAssetRow(asset, index)).join('');
  return `<form class="handover-inspection" onsubmit="saveHandoverInspection(event)"><div class="handover-section-heading"><div><span>BƯỚC 2 · TẠI CĂN HỘ</span><h2>Checklist kiểm tra & bàn giao</h2></div><span class="handover-progress-label">Đang thực hiện</span></div>${state.revisionComment ? `<div class="handover-revision-note"><strong>Yêu cầu cập nhật:</strong> ${handoverEscape(state.revisionComment)}</div>` : ''}<div class="handover-inspection-grid"><section class="handover-form-card"><h3><i data-lucide="scan-line" class="w-4 h-4"></i>Tình trạng căn hộ</h3><div class="handover-checklist">${HANDOVER_CONDITIONS.map(([key, label]) => `<label><input type="checkbox" name="condition-${key}" ${state.condition?.[key] !== false ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div><label class="handover-field-label">Ghi nhận hư hỏng / vấn đề<textarea name="issueNote" rows="3" placeholder="Mô tả tình trạng và vị trí cần lưu ý">${handoverEscape(state.issueNote)}</textarea></label><label class="handover-upload handover-condition-upload"><i data-lucide="camera" class="w-5 h-5"></i><span><strong>Chụp / tải ảnh tình trạng căn hộ</strong><small>Tối đa 5 ảnh; ảnh được gửi cùng hồ sơ cho quản lý và cư dân</small></span><input type="file" name="conditionEvidence" accept="image/*" capture="environment" multiple onchange="previewConditionPhotos(event)"></label><div id="handover-condition-photo-selection">${state.photos?.length ? renderConditionPhotoGallery(state.photos) : ''}</div></section><section class="handover-form-card"><h3><i data-lucide="zap" class="w-4 h-4"></i>Chỉ số ban đầu</h3><div class="handover-meter-fields"><label>Điện (kWh)<input type="number" min="0" step="0.1" name="electricity" required value="${handoverEscape(state.electricity)}" placeholder="Nhập chỉ số"></label><label>Nước (m³)<input type="number" min="0" step="0.1" name="water" required value="${handoverEscape(state.water)}" placeholder="Nhập chỉ số"></label></div><h3 class="handover-assets-heading"><i data-lucide="boxes" class="w-4 h-4"></i>Kiểm kê tài sản</h3><div class="handover-asset-list" id="handover-asset-list">${assetRows}</div><button type="button" class="handover-add-asset" onclick="addHandoverAsset()"><i data-lucide="plus" class="w-4 h-4"></i>Thêm tài sản</button></section></div><div class="handover-form-footer"><span><i data-lucide="shield-check" class="w-4 h-4"></i>Ảnh theo từng tài sản được gửi đồng thời cho quản lý và cư dân</span><button class="handover-button" type="submit">Gửi hai bên duyệt<i data-lucide="send" class="w-4 h-4"></i></button></div></form>`;
}

function renderResidentHandover(user, state) {
  const header = '';
  if (state.status === 'NOT_SCHEDULED') return `${header}<section class="handover-empty"><div class="handover-empty-icon"><i data-lucide="calendar-plus-2" class="w-7 h-7"></i></div><h2>Bạn chưa đặt lịch check-in</h2><p>Vào trang Căn hộ của tôi để chọn thời gian nhận bàn giao.</p><a class="handover-button" href="${appPath('profile.html')}">Đến Căn hộ của tôi<i data-lucide="arrow-right" class="w-4 h-4"></i></a></section>`;
  if (state.status === 'APPOINTMENT_PENDING') {
    const child = '<section class="handover-wait-card"><i data-lucide="clock-3" class="w-6 h-6"></i><div><h2>Đang chờ nhân viên xác nhận lịch</h2><p>Lịch check-in đã được gửi. Checklist bàn giao sẽ bắt đầu sau khi nhân viên chấp nhận lịch.</p></div></section>';
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'DUAL_REVIEW') return `${header}${renderHandoverProcessGroup(state, user, `${approvalStateLine(state)}${renderResidentApproval(state, user)}${renderApprovalPacket(state)}`)}`;
  if (state.status === 'NEEDS_REPAIR') {
    const child = `<section class="handover-wait-card"><i data-lucide="wrench" class="w-6 h-6"></i><div><h2>Hồ sơ đang được cập nhật</h2><p>${handoverEscape(state.revisionComment || 'Quản lý hoặc cư dân đã yêu cầu làm rõ thông tin. Nhân viên sẽ gửi lại hồ sơ mới để cả hai bên duyệt.')}</p></div></section>`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'BOTH_APPROVED') {
    const child = `${approvalStateLine(state)}<section class="handover-wait-card"><i data-lucide="circle-check" class="w-6 h-6"></i><div><h2>Bạn và quản lý đã đồng ý</h2><p>Nhân viên đang ký và hoàn tất biên bản bàn giao.</p></div></section>${renderApprovalPacket(state)}`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'MANAGER_FINAL_REVIEW') {
    const child = `${approvalStateLine(state)}<section class="handover-wait-card"><i data-lucide="file-check-2" class="w-6 h-6"></i><div><h2>Hai bên đã duyệt hồ sơ</h2><p>Biên bản cuối đang chờ quản lý xác nhận hoàn tất.</p></div></section>${renderApprovalPacket(state)}`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'COMPLETED') {
    const child = `<section class="handover-complete-card"><i data-lucide="circle-check" class="w-7 h-7"></i><div><h2>Bàn giao đã hoàn tất</h2><p>Hồ sơ đã được hai bên duyệt và quản lý xác nhận.</p><a href="${appPath('profile.html')}">Mở thông tin căn hộ →</a></div></section>${renderApprovalPacket(state)}`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  const statusText = { SCHEDULED: ['Lịch check-in đã được xác nhận', 'Nhân viên sẽ bắt đầu checklist tại buổi bàn giao.'], IN_PROGRESS: ['Nhân viên đang kiểm tra căn hộ', 'Sau khi hoàn tất, ảnh và checklist sẽ được gửi đồng thời cho bạn và quản lý.'] }[state.status] || ['Đang xử lý bàn giao', ''];
  return `${header}${renderHandoverProcessGroup(state, user, `<section class="handover-wait-card"><i data-lucide="clock-3" class="w-6 h-6"></i><div><h2>${statusText[0]}</h2><p>${statusText[1]}</p></div></section>`)}`;
}

function renderResidentApproval(state, user) {
  if (state.residentApproved) return `<section class="handover-wait-card"><i data-lucide="circle-check" class="w-6 h-6"></i><div><h2>Bạn đã đồng ý hồ sơ</h2><p>Đang chờ quản lý duyệt cùng bộ ảnh và thông tin này.</p></div></section>`;
  return `<section class="handover-resident-approval"><div class="handover-section-heading"><div><span>PHẦN DUYỆT CỦA CƯ DÂN</span><h2>Bạn xác nhận hồ sơ này chính xác?</h2></div><span class="handover-progress-label">Chờ bạn duyệt</span></div><p>Việc đồng ý xác nhận bạn đã xem ảnh, hiện trạng và chỉ số được ghi nhận.</p><form onsubmit="approveHandoverAsResident(event)"><label class="handover-field-label">Họ tên xác nhận<input name="signature" required value="${handoverEscape(user.fullName)}"></label><label class="handover-consent"><input type="checkbox" required><span>Tôi đã xem ảnh và nội dung bàn giao; thông tin phản ánh đúng hiện trạng căn hộ.</span></label><div class="handover-form-footer"><button type="button" class="handover-secondary-button" onclick="openHandoverIssueModal()">Yêu cầu chỉnh sửa</button><button class="handover-button" type="submit">Tôi đồng ý hồ sơ<i data-lucide="circle-check" class="w-4 h-4"></i></button></div></form><div id="handoverIssueModal" class="modal-backdrop"><div class="modal-content p-6"><div class="handover-section-heading"><div><span>PHẢN HỒI HỒ SƠ</span><h2>Yêu cầu chỉnh sửa</h2></div><button type="button" class="handover-modal-close" onclick="closeModal('handoverIssueModal')" aria-label="Đóng"><i data-lucide="x" class="w-5 h-5"></i></button></div><form onsubmit="requestHandoverRevision(event, 'RESIDENT')"><label class="handover-field-label">Nội dung cần làm rõ<textarea name="revisionComment" rows="4" required placeholder="Mô tả điểm chưa đúng hoặc ảnh cần bổ sung"></textarea></label><div class="handover-form-footer"><button type="button" class="handover-secondary-button" onclick="closeModal('handoverIssueModal')">Quay lại</button><button class="handover-button" type="submit">Gửi yêu cầu</button></div></form></div></div></section>`;
}

function renderManagerHandover(user, state) {
  const header = '';
  if (state.status === 'DUAL_REVIEW') return `${header}${renderHandoverProcessGroup(state, user, `${approvalStateLine(state)}${renderManagerApproval(state)}${renderApprovalPacket(state)}`)}`;
  if (state.status === 'NEEDS_REPAIR') {
    const child = `<section class="handover-wait-card"><i data-lucide="rotate-ccw" class="w-6 h-6"></i><div><h2>Nhân viên đang cập nhật hồ sơ</h2><p>${handoverEscape(state.revisionComment || 'Quản lý hoặc cư dân đã yêu cầu chỉnh sửa. Sau khi gửi lại, cả hai bên sẽ duyệt lại.')}</p></div></section>`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'BOTH_APPROVED') {
    const child = `${approvalStateLine(state)}<section class="handover-wait-card"><i data-lucide="circle-check" class="w-6 h-6"></i><div><h2>Cả hai bên đã đồng ý</h2><p>Đang chờ nhân viên ký và tải biên bản cuối.</p></div></section>${renderApprovalPacket(state)}`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  if (state.status === 'MANAGER_FINAL_REVIEW') return `${header}${renderHandoverProcessGroup(state, user, `${approvalStateLine(state)}${renderManagerFinalReview(state, user)}${renderApprovalPacket(state)}`)}`;
  if (state.status === 'COMPLETED') {
    const child = `<section class="handover-complete-card"><i data-lucide="circle-check" class="w-7 h-7"></i><div><h2>Đã hoàn tất bàn giao</h2><p>Quản lý đã xác nhận; cư dân có thể xem thông tin căn hộ.</p></div></section>`;
    return `${header}${renderHandoverProcessGroup(state, user, child)}`;
  }
  return `${header}${renderReadinessControl(user, state)}<section class="handover-empty handover-manager-empty"><div class="handover-empty-icon"><i data-lucide="file-check-2" class="w-7 h-7"></i></div><h2>Chưa có hồ sơ chờ duyệt</h2><p>Hồ sơ sẽ xuất hiện tại đây sau khi nhân viên tải ảnh và gửi đồng thời cho quản lý, cư dân.</p></section>`;
}

function renderReadinessControl(user, state) {
  return `<section class="handover-readiness-card"><div class="handover-readiness-icon"><i data-lucide="home" class="w-5 h-5"></i></div><div><span>TRẠNG THÁI CĂN HỘ · ${handoverEscape(user.room || 'P201')}</span><h2>${state.apartmentReady ? 'Sẵn sàng bàn giao' : 'Chưa sẵn sàng bàn giao'}</h2><p>${state.apartmentReady ? 'Cư dân có thể chọn lịch check-in.' : 'Hệ thống sẽ báo căn hộ chưa sẵn sàng khi cư dân đặt lịch.'}</p></div><button class="${state.apartmentReady ? 'handover-secondary-button' : 'handover-button'}" onclick="toggleApartmentReadiness()">${state.apartmentReady ? 'Đánh dấu chưa sẵn sàng' : 'Đánh dấu đã sẵn sàng'}</button></section>`;
}

function renderManagerApproval(state) {
  if (state.managerApproved) return `<section class="handover-wait-card"><i data-lucide="circle-check" class="w-6 h-6"></i><div><h2>Quản lý đã đồng ý hồ sơ</h2><p>Đang chờ cư dân duyệt cùng bộ ảnh và thông tin này.</p></div></section>`;
  return `<section class="handover-manager-approval"><div class="handover-section-heading"><div><span>PHẦN DUYỆT CỦA QUẢN LÝ</span><h2>Duyệt hiện trạng và bằng chứng ảnh</h2></div><span class="handover-progress-label">Chờ quản lý duyệt</span></div><p>Quản lý và cư dân đang xem cùng một hồ sơ. Nếu yêu cầu chỉnh sửa, cả hai sẽ nhận lại phiên bản cập nhật.</p><div class="handover-form-footer"><button class="handover-secondary-button" onclick="openManagerRevisionModal()">Yêu cầu chỉnh sửa</button><button class="handover-button" onclick="approveHandoverAsManager()">Đồng ý hồ sơ<i data-lucide="circle-check" class="w-4 h-4"></i></button></div><div id="managerRevisionModal" class="modal-backdrop"><div class="modal-content p-6"><div class="handover-section-heading"><div><span>PHẢN HỒI CHO NHÂN VIÊN</span><h2>Yêu cầu chỉnh sửa hồ sơ</h2></div><button type="button" class="handover-modal-close" onclick="closeModal('managerRevisionModal')" aria-label="Đóng"><i data-lucide="x" class="w-5 h-5"></i></button></div><form onsubmit="requestHandoverRevision(event, 'MANAGER')"><label class="handover-field-label">Nội dung cần bổ sung<textarea name="revisionComment" rows="4" required placeholder="Mô tả thông tin hoặc ảnh cần chỉnh sửa"></textarea></label><div class="handover-form-footer"><button type="button" class="handover-secondary-button" onclick="closeModal('managerRevisionModal')">Quay lại</button><button class="handover-button" type="submit">Gửi yêu cầu</button></div></form></div></div></section>`;
}

function renderStaffSigning(state) {
  return `<form class="handover-signing-card" onsubmit="submitStaffSignature(event)"><div class="handover-section-heading"><div><span>BƯỚC CUỐI · BIÊN BẢN</span><h2>Cả quản lý và cư dân đã đồng ý</h2></div><span class="handover-progress-label">Hai bên đã duyệt</span></div><p>Nhân viên ký biên bản cuối và tải file lên để quản lý xác nhận hoàn tất.</p><div class="handover-signature-grid"><div><span>CƯ DÂN</span><strong>${handoverEscape(state.residentSignature)}</strong><small>Đã đồng ý hồ sơ và ảnh hiện trạng</small></div><div><span>QUẢN LÝ</span><strong>${handoverEscape(state.managerApprovalName)}</strong><small>Đã duyệt cùng hồ sơ</small></div></div><label class="handover-field-label">Họ tên nhân viên<input name="staffSignature" required value="${handoverEscape(DataStore.getUser().fullName)}"></label><label class="handover-upload"><i data-lucide="file-up" class="w-5 h-5"></i><span><strong>Tải biên bản bàn giao đã ký</strong><small>PDF hoặc ảnh biên bản</small></span><input type="file" name="minutesFile" accept=".pdf,image/*" required></label><div class="handover-form-footer"><span>Quản lý sẽ xác nhận hoàn tất sau khi nhận biên bản</span><button class="handover-button" type="submit">Ký & gửi biên bản<i data-lucide="send" class="w-4 h-4"></i></button></div></form>`;
}

function renderManagerFinalReview(state, user) {
  return `<section class="handover-manager-review"><div class="handover-section-heading"><div><span>BIÊN BẢN CUỐI</span><h2>Xác nhận hoàn tất bàn giao</h2></div><span class="handover-progress-label">Hai bên đã đồng ý</span></div><div class="handover-signature-grid"><div><span>CƯ DÂN</span><strong>${handoverEscape(state.residentSignature)}</strong><small>Đã duyệt hồ sơ</small></div><div><span>QUẢN LÝ</span><strong>${handoverEscape(state.managerApprovalName)}</strong><small>Đã duyệt hồ sơ</small></div><div><span>NHÂN VIÊN</span><strong>${handoverEscape(state.staffSignature)}</strong><small>Đã ký biên bản</small></div></div><div class="handover-minute-preview"><span>BIÊN BẢN ĐÃ TẢI</span><p>${handoverEscape(state.minuteFileName || 'Biên bản bàn giao')}</p><small>Căn hộ ${handoverEscape(user.room || 'P201')} · Điện ${handoverEscape(state.electricity || '—')} kWh · Nước ${handoverEscape(state.water || '—')} m³</small></div><button class="handover-button" onclick="confirmHandoverCompletion()">Xác nhận hoàn tất bàn giao<i data-lucide="circle-check" class="w-4 h-4"></i></button></section>`;
}

function renderPhotoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Không đọc được ảnh ${file.name}`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(`Ảnh ${file.name} không hợp lệ`));
      image.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, dataUrl: canvas.toDataURL('image/jpeg', 0.72) });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function previewHandoverAssetPhoto(event, key) {
  const file = event.currentTarget.files?.[0];
  const preview = document.getElementById(`handover-asset-photo-preview-${key}`);
  if (!preview) return;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${handoverEscape(reader.result)}" alt="Ảnh ${handoverEscape(file.name)}"><span>${handoverEscape(file.name)}</span>`;
  };
  reader.onerror = () => showToast(`Không xem trước được ảnh ${file.name}.`, 'error');
  reader.readAsDataURL(file);
}

function previewConditionPhotos(event) {
  const input = event.currentTarget;
  const preview = document.getElementById('handover-condition-photo-selection');
  const files = [...(input.files || [])];
  if (!preview) return;
  if (files.length > 5) {
    input.value = '';
    preview.innerHTML = '<p class="handover-condition-photo-error">Chọn tối đa 5 ảnh tình trạng căn hộ.</p>';
    return;
  }
  if (!files.length) {
    preview.innerHTML = '';
    return;
  }
  Promise.all(files.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  }))).then(photos => {
    const readablePhotos = photos.filter(Boolean);
    preview.innerHTML = readablePhotos.length
      ? renderConditionPhotoGallery(readablePhotos)
      : '<p class="handover-condition-photo-error">Không đọc được ảnh đã chọn. Hãy thử chọn ảnh khác.</p>';
  });
}

function addHandoverAsset() {
  const list = document.getElementById('handover-asset-list');
  if (!list) return;
  const key = `extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  list.insertAdjacentHTML('beforeend', renderHandoverAssetRow({ name: '', checked: false, photo: null, custom: true }, '', true, key));
  lucide.createIcons();
  list.lastElementChild?.querySelector('[data-asset-name]')?.focus();
}

function removeHandoverAsset(key) {
  const list = document.getElementById('handover-asset-list');
  const row = [...(list?.querySelectorAll('.handover-asset-item') || [])].find(item => item.dataset.assetKey === key);
  row?.remove();
}

function acceptCheckinAppointment(appointmentId) {
  if (DataStore.getRole() !== 'STAFF') return;
  const state = DataStore.getHandover();
  if (state.status !== 'APPOINTMENT_PENDING' || state.appointmentId !== appointmentId) return;
  DataStore.saveHandover({
    ...state,
    status: 'SCHEDULED',
    appointmentAcceptedBy: DataStore.getUser().fullName,
    appointmentAcceptedAt: new Date().toISOString()
  });
  renderHandoverWorkspace();
  showToast('Đã xác nhận lịch check-in. Nhấn Check-in để mở biểu mẫu bàn giao.');
}

function startHandoverInspection(appointmentId) {
  if (DataStore.getRole() !== 'STAFF') return;
  const state = DataStore.getHandover();
  if (state.status !== 'SCHEDULED' || state.appointmentId !== appointmentId) return;
  DataStore.saveHandover({ ...state, status: 'IN_PROGRESS', checkinStartedBy: DataStore.getUser().fullName, checkinStartedAt: new Date().toISOString() });
  renderHandoverWorkspace();
  showToast('Đã bắt đầu check-in. Biểu mẫu kiểm tra căn hộ đã mở.');
}

async function saveHandoverInspection(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const state = DataStore.getHandover();
  const assetCards = [...form.querySelectorAll('.handover-asset-item')];
  const conditionPhotoFiles = [...(form.querySelector('[name="conditionEvidence"]')?.files || [])];
  if (!assetCards.length) {
    showToast('Thêm ít nhất một tài sản để kiểm kê trước khi gửi.', 'error');
    return;
  }
  if (conditionPhotoFiles.length > 5) {
    showToast('Chọn tối đa 5 ảnh tình trạng căn hộ.', 'error');
    return;
  }
  try {
    const condition = Object.fromEntries(HANDOVER_CONDITIONS.map(([key]) => [key, form.elements[`condition-${key}`].checked]));
    const conditionPhotos = conditionPhotoFiles.length
      ? await Promise.all(conditionPhotoFiles.map(renderPhotoDataUrl))
      : (state.photos || []);
    const assets = await Promise.all(assetCards.map(async card => {
      const sourceIndex = card.dataset.sourceIndex;
      const previous = sourceIndex === '' ? {} : (state.assets[Number(sourceIndex)] || {});
      const name = card.querySelector('[data-asset-name]')?.value.trim() || '';
      const photoFile = card.querySelector('[data-asset-photo]')?.files?.[0];
      if (!name) throw new Error('Nhập tên cho tất cả tài sản trong danh sách.');
      return {
        ...previous,
        name,
        checked: Boolean(card.querySelector('[data-asset-check]')?.checked),
        photo: photoFile ? await renderPhotoDataUrl(photoFile) : (previous.photo || null),
        custom: sourceIndex === '' ? true : Boolean(previous.custom)
      };
    }));
    let issueNote = form.elements.issueNote.value.trim();
    const hasIssue = Object.values(condition).some(value => !value) || assets.some(asset => !asset.checked) || Boolean(issueNote);
    if (hasIssue && !issueNote) issueNote = 'Có điểm cần kiểm tra lại theo checklist hiện trạng hoặc tài sản bàn giao.';
    const next = {
      ...state,
      status: 'DUAL_REVIEW',
      condition,
      assets,
      electricity: form.elements.electricity.value,
      water: form.elements.water.value,
      issueNote,
      photos: conditionPhotos,
      hasIssue,
      managerApproved: false,
      residentApproved: false,
      managerApprovalName: '',
      residentSignature: '',
      managerApprovedAt: '',
      residentApprovedAt: '',
      revisionComment: '',
      rejectedBy: ''
    };
    DataStore.saveHandover(next);
    renderHandoverWorkspace();
    showToast('Đã gửi cùng bộ ảnh và hồ sơ cho quản lý, cư dân.');
  } catch (error) {
    showToast(error.message || 'Không thể lưu ảnh. Bạn thử chọn ảnh khác nhé.', 'error');
  }
}

function refreshApprovalStatus(state) {
  const bothApproved = state.managerApproved && state.residentApproved;
  return { ...state, status: bothApproved ? 'BOTH_APPROVED' : 'DUAL_REVIEW' };
}

function approveHandoverAsManager() {
  const state = DataStore.getHandover();
  if (state.status !== 'DUAL_REVIEW') return;
  const next = refreshApprovalStatus({ ...state, managerApproved: true, managerApprovalName: DataStore.getUser().fullName, managerApprovedAt: new Date().toISOString() });
  DataStore.saveHandover(next);
  renderHandoverWorkspace();
  showToast(next.status === 'BOTH_APPROVED' ? 'Quản lý và cư dân đã đồng ý. Chuyển sang lập biên bản.' : 'Đã duyệt hồ sơ; đang chờ cư dân đồng ý.');
}

function approveHandoverAsResident(event) {
  event.preventDefault();
  const state = DataStore.getHandover();
  if (state.status !== 'DUAL_REVIEW') return;
  const signature = event.currentTarget.elements.signature.value.trim();
  const next = refreshApprovalStatus({ ...state, residentApproved: true, residentSignature: signature, residentApprovedAt: new Date().toISOString() });
  DataStore.saveHandover(next);
  renderHandoverWorkspace();
  showToast(next.status === 'BOTH_APPROVED' ? 'Cả cư dân và quản lý đã đồng ý. Chuyển sang lập biên bản.' : 'Đã ghi nhận đồng ý; đang chờ quản lý duyệt.');
}

function requestHandoverRevision(event, role) {
  event.preventDefault();
  const state = DataStore.getHandover();
  const revisionComment = event.currentTarget.elements.revisionComment.value.trim();
  const rejectedBy = role === 'MANAGER' ? 'Quản lý' : 'Cư dân';
  DataStore.saveHandover({ ...state, status: 'NEEDS_REPAIR', revisionComment, rejectedBy });
  renderHandoverWorkspace();
  showToast(`Đã gửi yêu cầu cập nhật cho nhân viên (${rejectedBy}).`);
}

function openHandoverIssueModal() { openModal('handoverIssueModal'); }
function openManagerRevisionModal() { openModal('managerRevisionModal'); }

function reopenHandoverInspection() {
  const state = DataStore.getHandover();
  DataStore.saveHandover({ ...state, status: 'IN_PROGRESS', issueNote: '', photos: [], managerApproved: false, residentApproved: false, managerApprovalName: '', residentSignature: '', managerApprovedAt: '', residentApprovedAt: '' });
  renderHandoverWorkspace();
}

function submitStaffSignature(event) {
  event.preventDefault();
  const state = DataStore.getHandover();
  if (!(state.managerApproved && state.residentApproved)) {
    showToast('Cần có đồng ý của cả quản lý và cư dân trước khi ký biên bản.', 'error');
    return;
  }
  const staffSignature = event.currentTarget.elements.staffSignature.value.trim();
  const minuteFile = event.currentTarget.elements.minutesFile.files?.[0];
  if (!minuteFile) {
    showToast('Tải biên bản đã ký lên trước khi gửi quản lý.', 'error');
    return;
  }
  DataStore.saveHandover({ ...state, staffSignature, minuteFileName: minuteFile.name, status: 'MANAGER_FINAL_REVIEW' });
  renderHandoverWorkspace();
  showToast('Biên bản cuối đã gửi quản lý xác nhận hoàn tất.');
}

function renderManagerFinalReviewAction() {
  const state = DataStore.getHandover();
  if (!(state.managerApproved && state.residentApproved)) {
    showToast('Chưa thể hoàn tất: cần đủ xác nhận của quản lý và cư dân.', 'error');
    return;
  }
  DataStore.saveHandover({ ...state, managerConfirmed: true, status: 'COMPLETED' });
  renderHandoverWorkspace();
  showToast('Đã xác nhận hoàn tất bàn giao cho cả hai bên.');
}

function confirmHandoverCompletion() { renderManagerFinalReviewAction(); }

function toggleApartmentReadiness() {
  const state = DataStore.getHandover();
  DataStore.saveHandover({ ...state, apartmentReady: !state.apartmentReady });
  renderHandoverWorkspace();
  showToast(state.apartmentReady ? 'Căn hộ được chuyển sang trạng thái chưa sẵn sàng.' : 'Căn hộ đã được đánh dấu sẵn sàng bàn giao.');
}

document.addEventListener('DOMContentLoaded', renderHandoverWorkspace);
document.addEventListener('keydown', handleHandoverDetailsEscape);
