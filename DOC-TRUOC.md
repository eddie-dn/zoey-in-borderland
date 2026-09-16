# Bản cập nhật V8.03 → V9.04

Chép đè lên đúng vị trí cũ. Không file nào bị xoá. Hai file mới:
`src/js/khoa.js`, `src/js/soan.js`. Gồm luôn mọi zip trước.

```bash
npm run build && npm run kiem
```

## ⚠ Đọc trước: vì sao GC_ID cứ biến mất sau mỗi lượt deploy

Ô **Type** trong bảng "Variables and Secrets" của Cloudflare có hai lựa chọn,
và chúng hành xử **ngược nhau**:

| Type | Sau mỗi lượt deploy |
|---|---|
| **Secret** | được giữ lại |
| **Text** | **bị xoá** |

Wrangler coi khối `vars` trong `wrangler.jsonc` là nguồn đúng duy nhất cho biến
dạng Text, nên biến Text nào không có tên trong file ấy đều bị gỡ sau mỗi lượt
dựng. GC_ID của bạn đang để **Text** — xoá dòng đó rồi thêm lại với Type =
**Secret** là hết hẳn. (`docs/CAI-DAT.md` §6.2 đã ghi lại cái bẫy này.)

## Mười bản

| Bản | Việc |
|---|---|
| V8.03 | Đăng nhập một cửa · ô soạn thảo · màu chữ `{tím: …}` |
| V8.04 | Chân trang một hàng |
| V8.05 | Logo: nấc đanh nét · một nhịp chuyển cảnh |
| V8.06 | Màn đầu điện thoại: tên blog cân giữa |
| V8.07 | "Haluuu, Zoey! — Đăng xuất" · sai khoá thì im lặng |
| V8.08 | Gỡ lối `#viet` / `#duyet` khỏi trang ngoài |
| V8.09 | Ô soạn thảo đọc được Markdown vào |
| V9.00 | Logo: xoay trước rồi nối · tám cánh mở ra từ bốn · vành đứt nét trở lại · xoáy nhoè rồi nổ |
| V9.01 | Trang chủ chỉ còn màn đầu |
| V9.02 | Chip nhỏ lại · Read next dòng đơn · bỏ trích dẫn khỏi trang bài · cột chữ rộng thêm |
| V9.03 | **Bài ẩn** (`hidden: true`) + API đọc/ghi bài đã đăng |
| V9.04 | Tag thành một hàng chữ thường |

## Dùng được ngay từ V9.03

Thêm `hidden: true` vào front matter một bài là bài ấy **không dựng ra file
nào**: đường dẫn cũ trả 404, không có trong sitemap, không có trong feed.
File `.md` còn nguyên — bỏ cờ đi là bài trở lại y như cũ.

## Còn xếp hàng

1. **Giao diện** cho bảng bài / Sửa / Ẩn (API đã xong và đã thử: mở một bài ra
   lưu lại không sinh ra diff nào, 9/9 bài)
2. Logo: thêm nấc giữ hình **nơ** rồi mới bo tròn (đang giật từ chữ Z sang vô cực)
3. Cỡ chữ thân bài nhỏ lại
4. Bình luận: nút trái tim + icon, bấm icon mới mở khung
5. Theme tối (ngân hà) · Tĩnh lặng (mưa, giọt chạm nước)
6. Trang Posts: tab mục lớn, max 6 mục + rule phân trang dùng chung
7. Mục lục điện thoại bằng hamburger
8. Màn đầu điện thoại giữ hiệu ứng chữ → chuyển động
9. Đổi chữ ↔ logo ở thanh đầu các trang ngoài Home/About
