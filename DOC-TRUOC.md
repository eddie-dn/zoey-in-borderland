# Bản cập nhật V8.03 → V10.00

Chép đè lên đúng vị trí cũ. Không file nào bị xoá. Ba file mới:
`src/js/khoa.js`, `src/js/soan.js`, `src/js/man-dau.js`. Gồm luôn mọi zip trước.

```bash
npm run build && npm run kiem
```

## ⚠ GC_ID cứ biến mất sau mỗi lượt deploy

Ô **Type** trong bảng "Variables and Secrets": **Secret** được giữ lại,
**Text** thì **bị xoá** sau mỗi lượt dựng. GC_ID của bạn đang để Text — xoá
rồi thêm lại với Type = **Secret**.

## Lượt này (V9.08 → V10.00)

- **Nền động phủ trọn trang chủ**, kể cả chân trang — hết cảnh trang bị chia
  hai cục. Bỏ luôn tem phiên bản lặp ở góc hero.
- **Điện thoại**: danh sách bài chờ bấm "Read on" mới hiện; tên blog nhỏ một
  bậc và có hiệu ứng mở màn (nhạt → đậm, "oey" đẩy ra từ sau chữ Z) thay cho
  cú rê chuột mà điện thoại không có.
- **Cỡ chữ thân bài nhỏ một bậc**; khối tag bỏ khung bao, còn một dòng chữ.

## Khối admin — đã xong, dùng được

`/z-admin/` → ngăn **Post**: bảng bài (ngày · tiêu đề · trạng thái · Sửa/Ẩn),
chip lọc **Tất cả · Hiện · Nháp · Đã ẩn**. Sửa → nạp vào khung soạn thảo →
Lưu. Ẩn/Bỏ ẩn ngay trên dòng. Bài ẩn không dựng ra file nào.

## Hàng đợi — 4 việc

1. **Bình luận**: nút trái tim + icon, bấm icon mới mở khung
2. **Theme tối** (ngân hà phủ full màn) · **Tĩnh lặng** (mưa chậm lại, giọt
   chạm mặt nước, nước hắt lên)
3. **Trang Posts**: tab mục lớn, bài liệt kê nhỏ bên trong, tối đa 6 mục một
   trang + bộ rule phân trang dùng chung cho mọi trang danh sách
4. **Mục lục trên điện thoại** bằng nút hamburger; và đổi chữ ↔ logo ở thanh
   đầu các trang ngoài Home/About (hover, hoặc tự đổi 15–30s)
