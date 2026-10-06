# StayHub — Monthly Invoice Payment Prototype

## Thanh toán trên giao diện StayHub gốc

Mở `invoices.html` từ menu **Hóa đơn & Thu phí**. Giao diện dùng lại nguyên sidebar trắng, topbar, màu xanh ngọc, bảng hóa đơn và modal **Xem & QR** của dự án gốc (`css/style.css`, `js/app.js`). Trang `index.html` là dashboard gốc.

Trong hóa đơn chưa thanh toán: **Xác nhận & tạo giao dịch** → **Tôi đã hoàn tất thanh toán** → mở **Mô phỏng kết quả thanh toán** để chọn thành công, thất bại hoặc hết hạn. Lịch sử nằm ngay trong modal. Đóng modal không hủy giao dịch; mở lại vẫn tiếp tục phiên cũ. QR là minh họa, không chuyển tiền thật. Giao dịch và hóa đơn được lưu cùng dữ liệu gốc trong localStorage; chỉ SUCCESS cập nhật PAID.

Kiểm tra logic: `node scripts/test-invoice-payment.cjs`. Không chạy `build-payment-prototype.cjs` trên giao diện gốc: đó là helper cũ sinh các snapshot giao diện khác. Bản snapshot index/invoices trước khi khôi phục được giữ tại `docs/previous-payment-snapshots/` để tham khảo mã nguồn.

Phần tài liệu dưới đây mô tả bộ snapshot HTML/CSS cũ, không phải luồng tương tác trên giao diện gốc.

Prototype giao diện thanh toán hóa đơn hàng tháng bằng **HTML5 + CSS3**, theo luồng cư dân, nhân viên và quản lý.

## Mở prototype

Double-click **`index.html`**. Không cần server, npm, cài thư viện hoặc kết nối Internet.

Trang đầu có liên kết đến toàn bộ màn hình chính và các nhánh kết quả. Giao diện hỗ trợ desktop, tablet và mobile.

## Luồng thanh toán chính

1. Cư dân xem hóa đơn → xác nhận thanh toán → QR → chờ xác minh.
2. Chọn kết quả trong **Prototype Demo Controls**: thành công, thất bại hoặc hết hạn.
3. Thành công: giao dịch **SUCCESS**, hóa đơn **PAID**, lưu mã/thời gian mẫu và hiển thị xác nhận.
4. Thất bại/hết hạn: giao dịch **FAILED / EXPIRED**, hóa đơn **UNPAID**; có thể thử lại với mã mới.
5. Nhân viên/quản lý xem kết quả và timeline xác minh trong màn hình riêng.

Nhánh hóa đơn không hợp lệ hoặc đã trả dừng trước khi tạo giao dịch.

Đây là các snapshot HTML liên kết, **không thực hiện đăng nhập hay thanh toán thật**. QR và thời gian đếm ngược chỉ là minh họa. Các bộ lọc trạng thái dùng CSS; những điều khiển chưa xử lý dữ liệu được ghi rõ ngay trên giao diện.

## Luồng check-out và trả căn hộ trên giao diện StayHub gốc

Mở checkout.html từ menu **Trả căn hộ & bàn giao** trên thanh Sidebar. Giao diện dùng 100% bộ khung StayHub gốc (sidebar trắng, topbar, màu xanh ngọc #0F766E, Tailwind CSS, Lucide icons, thanh chuyển vai trò trên cùng):
- **Cư dân (RESIDENT):** Xem tiến độ 5 bước (Stepper), xem dự thảo quyết toán điện nước và cọc, ký biên bản nghiệm thu điện tử, gửi khiếu nại bồi thường, hoặc tạo yêu cầu check-out mới (tự động kiểm tra quy định báo trước 15 ngày).
- **Nhân viên (STAFF):** Danh sách yêu cầu trả phòng (bộ lọc cơ sở & trạng thái), nút **Nghiệm thu ngay →** mở Modal chốt điện nước & kiểm kê tài sản (tự động tính cọc), nút **Khóa & Thẻ** thu hồi chìa khóa.
- **Quản lý (MANAGER / ADMIN):** Phê duyệt biên bản quyết toán, thẩm định giải quyết khiếu nại 3 mức (Bác bỏ / Giảm 50% / Miễn 100%), duyệt lệnh chi hoàn cọc (UNC ngân hàng).

Ngoài ra, bộ snapshot mở rộng 66 trang độc lập vẫn được lưu trữ tại checkout/index.html để tham khảo chi tiết.

## File chính

- `index.html`: trung tâm điều hướng.
- `resident-dashboard.html`, `invoices.html`, `invoice-detail.html`: không gian cư dân.
- `payment*.html`: các bước và kết quả giao dịch.
- `staff-*.html`, `manager-*.html`: không gian nhân viên/quản lý.
- `css/payment.css`: design system chung, không phụ thuộc thư viện ngoài.
- `docs/PAYMENT-FLOW.md`: bản đồ nghiệp vụ, trạng thái và các giới hạn.
- `docs/payment-pages.json`: danh sách trang thuộc prototype mới.

Các file giao diện cũ ngoài danh sách vẫn được giữ trong repository. `server.js` và `package.json` có sẵn ở workspace không cần thiết để mở prototype này.

## Dành cho người sửa code (tùy chọn)

Các file HTML có thể chỉnh trực tiếp. Nếu muốn dựng lại đồng bộ bằng helper có sẵn, chạy:

```sh
node scripts/build-payment-prototype.cjs
node scripts/check-payment-prototype.cjs
```

**Lưu ý:** dựng lại sẽ ghi đè các trang HTML được liệt kê trong manifest. Chỉnh `scripts/build-payment-prototype.cjs` khi muốn giữ thay đổi qua lần dựng tiếp theo. Đây là công cụ phát triển, không phải yêu cầu để sử dụng prototype.
