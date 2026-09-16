# Bản cập nhật V8.03 → V9.02

Chép đè lên đúng vị trí cũ. Không file nào bị xoá. Hai file mới:
`src/js/khoa.js`, `src/js/soan.js`. Gồm luôn mọi zip trước.

```bash
npm run build && npm run kiem
```

| Bản | Việc |
|---|---|
| V8.03 | Đăng nhập một cửa · ô soạn thảo · màu chữ `{tím: …}` |
| V8.04 | Chân trang một hàng |
| V8.05 | Logo: nấc đanh nét · một nhịp chuyển cảnh |
| V8.06 | Màn đầu điện thoại: tên blog cân giữa |
| V8.07 | "Haluuu, Zoey! — Đăng xuất" · sai khoá thì im lặng |
| V8.08 | Gỡ lối `#viet` / `#duyet` khỏi trang ngoài |
| V8.09 | Ô soạn thảo đọc được Markdown vào |
| V9.00 | Logo: xoay trước rồi nối · tám cánh mở ra từ bốn · vành đứt nét trở lại · xoáy nhoè rồi nổ · nghỉ 6,2s |
| V9.01 | Trang chủ chỉ còn màn đầu · Read on sang Posts |
| V9.02 | Chip nhỏ lại · Read next thành dòng đơn · bỏ trích dẫn khỏi trang bài · cột chữ rộng thêm · thu khoảng trống chân trang · điện thoại bỏ Profile |

## Còn xếp hàng

**Khối admin** (lưu/sửa draft → publish · quyền admin ở trang ngoài · Hide bài)
— phần nền đã xong ở V8.09, còn `/api/bai` và giao diện.

**Hai việc theme** — ngân hà phủ full màn · mưa + giọt chạm mặt nước.

**Trang Posts** — tab mục lớn, bài liệt kê nhỏ bên trong, tối đa 6 mục một
trang; kèm bộ rule phân trang dùng chung cho mọi trang danh sách.

**Mục lục trên điện thoại** — nút hamburger mở mục lục như desktop.

**Màn đầu trên điện thoại** — giữ hiệu ứng chữ → chuyển động → sắp xếp.

**Đổi chữ ↔ logo ở thanh đầu** các trang ngoài Home/About: hover, hoặc tự đổi
sau 15–30 giây, không chạy lại full animation.
