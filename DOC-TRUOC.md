# Bản cập nhật V8.03 → V8.09

24 file. **Chép đè lên đúng vị trí cũ** — đường dẫn trong zip đã đúng sẵn, giải
nén ngay tại gốc dự án là xong. Không file nào bị xoá.

Hai file **mới hoàn toàn**: `src/js/khoa.js` và `src/js/soan.js`.

Bản này **gồm luôn** hai zip gửi trước (V8.04, V8.07) — chỉ cần chép bản này.

```bash
npm run build && npm run kiem
```

## Bảy bản, bảy việc

| Bản | Việc |
|---|---|
| V8.03 | Đăng nhập một cửa · ô soạn thảo gõ như văn bản · màu chữ `{tím: …}` · tách "sai khoá" khỏi "máy chủ chưa có khoá" |
| V8.04 | Chân trang gọn còn một hàng, chữ khớp đầu trang |
| V8.05 | Logo: nấc đanh nét trước khi xoay · vành ngoài thành đường sóng · một nhịp cho mọi chuyển cảnh · dừng hình cuối lâu gấp đôi |
| V8.06 | Màn đầu điện thoại: tên blog cân giữa |
| V8.07 | "Haluuu, Zoey! — Đăng xuất" · sai khoá thì im lặng · ngăn Note thôi kèm danh sách |
| V8.08 | Gỡ hẳn lối `#viet` / `#duyet` cũ khỏi trang ngoài |
| V8.09 | Ô soạn thảo đọc được Markdown vào — nền cho việc sửa bài đã đăng |

## V8.09 đáng chú ý

Thử trên **cả chín bài thật** trong kho: mở ra rồi lưu lại hai lần thì lần thứ
hai ra file y hệt lần thứ nhất — **9/9**. Nghĩa là sửa một bài không làm cả bài
xáo trộn trong lịch sử kho mã.

Lượt lưu **đầu tiên** của một bài cũ vẫn xê dịch vài chỗ ngắt dòng, vì bài ấy
ngắt theo tay người còn máy ngắt theo thước 80 cột. Chữ không đổi, chỉ chỗ
xuống dòng đổi. Từ lượt thứ hai trở đi thì đứng yên.

Ba lỗi bắt được lúc thử và đã sửa: khối mã mất tên ngôn ngữ (```json → ```),
dấu câu sau `ô mã` mọc thêm dấu cách, và chú thích ảnh có `mã` lồng trong biến
thành chữ "undefined".

## Chưa làm — đang xếp hàng

1. **Khối admin còn lại**: lưu/sửa draft rồi publish · quyền admin hiện ra ở
   trang ngoài · Hide bài vào sub-tab riêng. (V8.09 vừa xong phần nền.)
2. Ngân hà theme tối chưa phủ hết màn · mưa theme Tĩnh lặng + giọt chạm nước.
3. Khung bài: lấy thêm lề phải cho cột chữ, ô trích dẫn và mục lục dễ thở hơn.
4. Trang Posts: tab mục lớn, bài liệt kê bên trong, tối đa 6 mục một trang.
