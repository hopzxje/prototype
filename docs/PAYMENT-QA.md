# Kiểm tra prototype thanh toán

## Đã kiểm tra tự động

Chạy `node scripts/check-payment-prototype.cjs` từ thư mục repository.

- Toàn bộ trang trong manifest có doctype HTML5, ngôn ngữ `vi`, viewport và main landmark.
- Cấu trúc thẻ HTML đóng/mở cân bằng, không trùng ID, nhãn form trỏ đúng trường.
- Toàn bộ class được sử dụng có định nghĩa trong CSS chung.
- Liên kết, form action, stylesheet và fragment đều tồn tại.
- Mọi trang trong manifest đi đến được từ `index.html`.
- Không script, inline event handler, tài nguyên từ xa, fetch hoặc localStorage trong prototype mới.
- SUCCESS đi cùng PAID; FAILED / EXPIRED đi cùng UNPAID trong trang kết quả cư dân.
- Nhánh không hợp lệ / đã trả không dẫn đến QR.
- Trang nhân viên/quản lý có tham chiếu, thời gian, kết quả và các bước xác minh.
- Nhánh thử lại có mã tham chiếu riêng.

`git diff --check` không phát hiện lỗi whitespace.

## Giới hạn xác minh trực quan

Chưa chạy kiểm tra hiển thị bằng trình duyệt: công cụ trình duyệt của phiên làm việc chặn giao thức `file://`. Không chuyển sang một cách truy cập khác để vượt hạn chế đó.

CSS đã được rà soát với breakpoint desktop, 1200px, 950px, 768px và 420px; menu mobile dùng `details`, bảng nằm trong vùng cuộn ngang, các card xếp dọc ở màn hình nhỏ. Đây là kiểm tra mã nguồn, chưa phải kết quả kiểm thử hiển thị thực tế.

## Checklist khi mở trên máy

1. Mở `index.html` bằng trình duyệt hiện đại.
2. Mở cư dân → hóa đơn → xác nhận → QR → xác minh; chọn từng kết quả trong Prototype Demo Controls.
3. Sau thành công, kiểm tra hóa đơn, dashboard, lịch sử, thông báo đều hiển thị PAID.
4. Sau thất bại/hết hạn, kiểm tra hóa đơn vẫn UNPAID và đường thử lại mở phiên mẫu mới.
5. Đăng nhập nhân viên/quản lý, mở chi tiết thành công và các lần thử lỗi trước đó.
6. Thử bộ lọc trạng thái, menu mobile, cuộn bảng và tải hóa đơn HTML.
7. Kiểm tra ở 1440px, 768px, 390px; điều hướng bằng Tab và kiểm tra chế độ in hóa đơn.
