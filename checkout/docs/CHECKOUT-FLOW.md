# ARMS · Check-out & Room Handover

## Cách mở

Mở [`../index.html`](../index.html) để xem Hub check-out, hoặc chọn **Trả căn hộ & bàn giao** trong menu StayHub. Các màn theo vai trò dùng chung giao diện StayHub gốc với thanh chuyển vai trò, sidebar trắng, topbar trắng và màu nhấn xanh ngọc. Nội dung, trạng thái và số liệu nghiệp vụ bám theo đặc tả check-out. JavaScript cục bộ kiểm tra ngày báo trước, tính quyết toán và mô phỏng xác nhận biểu mẫu; không có backend hoặc kết nối thanh toán thật.

## 4 giai đoạn · 10 bước

1. Cư dân gửi form check-out. Hệ thống yêu cầu ngày dọn ra trước ít nhất 15 ngày, ghi log và validate thông tin.
2. Nhân viên tiếp nhận yêu cầu, liên hệ cư dân, xác nhận timeslot và phân công người khảo sát.
3. Hệ thống gửi lịch đã xác nhận cùng hướng dẫn chuẩn bị cho cư dân.
4. Nhân viên khảo sát căn hộ, chốt đồng hồ điện/nước, đối chiếu tình trạng tài sản và vệ sinh.
5. Nhân viên lập bằng chứng hư hại và dự thảo báo cáo, hệ thống tính chênh lệch tiền cọc.
6. Quản lý soát xét ảnh, chỉ số, phụ lục và phê duyệt quyết toán trước khi gửi cư dân.
7. Cư dân xem quyết toán: đồng ý để ký, hoặc gửi khiếu nại kèm giải trình và ảnh/video.
8. Quản lý chấp thuận toàn bộ/một phần hoặc bác bỏ khiếu nại. Nếu chấp thuận, nhân viên sửa biên bản và trình quản lý duyệt lại; nếu bác bỏ, cư dân xem lý do và quyết định lại.
9. Sau khi ký biên bản thanh lý, nhân viên thu hồi đủ chìa khóa, thẻ từ và thiết bị; hệ thống lập tức khóa quyền truy cập căn hộ (chấm dứt quyền sử dụng phòng). Trường hợp cọc âm: cư dân thanh toán bổ sung qua VietQR SePay trước khi bàn giao khóa.
10. Quản lý/kế toán phê duyệt lệnh chi hoàn cọc (nếu cọc dư), ngân hàng thực hiện chuyển khoản kèm chứng từ UNC; hệ thống chuyển trạng thái hợp đồng TERMINATED, căn hộ AVAILABLE, lưu trữ hồ sơ và đóng quy trình (CLOSED).

## Vai trò và quyền chính

- **Resident:** tạo/sửa yêu cầu, xem lịch và biên bản, gửi khiếu nại kèm chứng cứ, ký xác nhận, nhận hoàn tiền hoặc thanh toán phát sinh.
- **Staff:** phân lịch, nhập nghiệm thu, chụp bằng chứng, đề xuất thiệt hại, điều chỉnh theo phán quyết và thu hồi chìa khóa/thẻ.
- **Manager:** giám sát tiến độ, duyệt quyết toán trước khi cư dân ký, thẩm định khiếu nại, duyệt lại biên bản sửa và phê duyệt lệnh chi.
- **System:** kiểm tra hạn báo trước, gửi nhắc lịch, tính công nợ, khớp webhook (mô phỏng), khóa quyền phòng, lưu nhật ký và tài liệu.

## Trạng thái

`SUBMITTED → SCHEDULED → INSPECTING → PENDING_APPROVAL → WAITING_RESIDENT_SIGN → DISPUTED → PAYMENT_PENDING / REFUND_PENDING → COMPLETED → CLOSED`.

`DISPUTED` là nhánh tùy chọn: nếu được chấp thuận, quay lại `PENDING_APPROVAL` sau khi nhân viên điều chỉnh; nếu bị bác bỏ, cư dân trở lại `WAITING_RESIDENT_SIGN`. `PAYMENT_PENDING` và `REFUND_PENDING` là hai nhánh quyết toán thay thế nhau.

## Dữ liệu wireframe

- Phiếu `REQ-OUT-2026-0045`; hợp đồng `HD-2025-089`; căn hộ A-1205, Ruby Tower.
- Nguyễn Văn An · nhân viên Trần Kỹ Thuật · quản lý Trần Minh Đức.
- Lịch hẹn 20/10/2026 lúc 14:30, trong khung cư dân chọn 14:00–15:30. Tiền cọc 10.000.000 ₫.
- **Cọc dư:** điện 130 kWh × 3.000 ₫ = 390.000 ₫; nước 5 m³ × 12.000 ₫ = 60.000 ₫; đền bù rèm 350.000 ₫; vệ sinh 0 ₫. Tổng khấu trừ 800.000 ₫, hoàn 9.200.000 ₫.
- **Cọc thiếu:** thiết bị hư hỏng 12.000.000 ₫ + điện nước 450.000 ₫ − cọc 10.000.000 ₫ = cư dân nộp 2.450.000 ₫. Nội dung SePay: `SEPAY ARMS1205OUT`.
- **Khiếu nại rèm:** bác bỏ = phí 350.000 ₫, hoàn 9.200.000 ₫; giảm 50% = phí 175.000 ₫, hoàn 9.375.000 ₫; chấp thuận toàn bộ = phí 0 ₫, hoàn 9.550.000 ₫.

## Lưu ý prototype

Hiện có 66 trang HTML tĩnh. Ngày báo trước, trường bắt buộc và bảng tính quyết toán hoạt động cục bộ trên trình duyệt. Upload, chữ ký/OTP, thông báo, duyệt, giao dịch SePay, chuyển khoản ngân hàng, lưu file, phân quyền và nhật ký chỉ là mô phỏng; không truyền dữ liệu hoặc thực hiện nghiệp vụ thật.
