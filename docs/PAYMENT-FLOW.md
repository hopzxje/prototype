# Monthly Invoice Payment — bản đồ màn hình

## Cư dân

`login.html` → `resident-dashboard.html` → `invoices.html` → `invoice-detail.html` → `payment.html`.

Tại bước kiểm tra hóa đơn, mở **Prototype Demo Controls** để chọn kết quả:

- Hợp lệ, chưa thanh toán: tiếp tục đến `payment-qr.html`.
- Không hợp lệ: `invoice-invalid.html`, dừng, không tạo QR.
- Đã thanh toán: `payment-already-paid.html`, dừng, không cho trả lần nữa.

`payment-qr.html` → `payment-processing.html`. Nút “Tôi đã hoàn tất” chỉ mở trạng thái chờ xác minh.

| Kết quả | Trang | Giao dịch | Hóa đơn |
|---|---|---|---|
| Thành công | payment-success.html | SUCCESS | PAID |
| Thất bại | payment-failed.html | FAILED | UNPAID |
| Hết hạn | payment-expired.html | EXPIRED | UNPAID |

Trang xử lý có ba liên kết minh họa để chọn kết quả; không có bộ hẹn giờ hay xử lý thanh toán thật.

Nhánh thành công nối đến `invoice-paid.html`, `invoices-paid.html`, `resident-dashboard-paid.html`, `payment-history.html` và `resident-notifications-paid.html`. Các trang này thể hiện cùng số tiền 2.450.000 ₫, mã PAY-202610-00125 và thời gian 04/10/2026 14:32.

Nhánh thử lại bắt đầu tại `payment-retry.html`, dùng mã mới PAY-202610-00126. Các trang có hậu tố `retry` là snapshot riêng cho lần thử này, không cần JavaScript hoặc lưu trạng thái trình duyệt. Bảng lịch sử hiển thị giao dịch tiêu biểu, gồm lần thử hiện tại và các lần thử cũ 00123/00124; không suy đoán kết quả của 00125 từ đường đi của người xem. Chọn “Thử lại” lần nữa mở lại cùng kịch bản mẫu, không tạo mã động.

Hủy thao tác QR chỉ rời màn hình; không khẳng định hủy được một giao dịch ngân hàng. Hóa đơn giữ UNPAID trong lúc giao dịch còn PENDING.

## Nhân viên và quản lý

- Nhân viên: `staff-login.html` → `staff-dashboard.html` → `staff-payment-monitoring.html` → `staff-payment-detail.html`.
- Quản lý: `manager-login.html` → `manager-dashboard.html` → `manager-payment-monitoring.html` → `manager-payment-detail.html`.
- Hai vai trò chỉ xem trạng thái, hóa đơn và timeline trong phạm vi luồng được cung cấp. Không có nút tự đánh dấu đã thanh toán.
- Timeline thành công gồm tạo giao dịch, cấp QR, gửi thanh toán, nhận webhook, xác minh, SUCCESS, PAID, gửi xác nhận.
- Các giao dịch FAILED / EXPIRED cũ hiển thị hóa đơn UNPAID **tại thời điểm của lần thử đó**. Nếu hóa đơn đã được trả ở lần thử sau, trạng thái hiện tại được ghi riêng cùng mã giao dịch thành công.

## Số liệu mẫu

Tổng 1.245 hóa đơn = 982 đã trả + 263 chưa trả. Trong 263 chưa trả có 214 chưa trả không có lần thử lỗi và 49 có lần thử FAILED / EXPIRED. Cách tách này tránh xem FAILED / EXPIRED như trạng thái thứ ba của hóa đơn.

Biểu đồ và chỉ số tổng hợp là snapshot minh họa, không được tính lại từ bảng giao dịch tiêu biểu.

## Giới hạn tương tác

- Tab trạng thái lọc hàng bằng CSS `:has()` trên trình duyệt hiện đại.
- Menu mobile dùng `details`; điều khiển luồng dùng liên kết HTML.
- Tìm kiếm và lựa chọn tháng/tòa nhà được ghi rõ là phần minh họa bố cục.
- QR là họa tiết CSS không thanh toán được; thời gian 14:52 là mẫu cố định.
- Tải hóa đơn cung cấp bản HTML cục bộ. Có thể dùng Ctrl+P để in/lưu PDF.
- Đăng nhập không xác thực và không gửi giá trị tài khoản: trường nhập không có thuộc tính `name`.
- Không API, database, webhook thật, JavaScript trên giao diện, CDN, thư viện UI hay tài nguyên ngoài.
- Các liên kết ở trung tâm prototype cho phép chuyển giữa snapshot, không phải trạng thái được lưu của một ứng dụng thật.

## Phạm vi file

Danh sách chính xác các trang mới nằm trong `payment-pages.json`. Mọi trang trong danh sách dùng `css/payment.css`. Những màn hình quản lý cũ không thuộc luồng thanh toán vẫn nằm trong repository và không được đưa vào menu của prototype mới.

Hai helper trong `scripts/` chỉ phục vụ viết/kiểm tra mã khi phát triển. Browser không tải chúng. Người xem không phải cài Node hoặc chạy npm.
