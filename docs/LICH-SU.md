# SỔ PHIÊN BẢN

> **File này là NGUỒN DUY NHẤT của số phiên bản.** Build đọc dòng đầu tiên trong
> bảng dưới để lấy `Vxx.yy` và ngày, rồi in ra tem ở chân mọi trang. Không khai
> số phiên bản ở chỗ nào khác — hai chỗ là sớm muộn cũng lệch nhau.
>
> **Cách ghi.** Đừng sửa bảng bằng tay. Chạy:
>
> ```bash
> npm run ver -- "chỉnh hệ chữ · nền kính"      # thêm một bản vá  → V1.00 thành V1.01
> npm run ver -- --lon "dựng trang tag"          # mở một build mới → V1.03 thành V2.00
> ```
>
> **Quy ước cột `#`** (giữ nguyên từ design system cũ): mỗi dòng là **MỘT BUILD
> LỚN**, không phải một bản vá. Cột `#` là **số bản vá ghi lại được trong build
> đó** — `V1.03` nghĩa là 04 bản. Không biết thì ghi `thiếu info` và **giữ nguyên
> số build**.
>
> Cột **Sửa chính** chỉ ghi **loại việc**, không ghi tên biến, tên endpoint, hay
> đường dẫn nội bộ — sổ này người đọc blog mở ra xem được.

<!-- BANG-BAT-DAU · dòng ngay dưới hàng gạch là bản mới nhất, build đọc đúng dòng đó -->

| Bản | Ngày | # | Sửa chính |
|---|---|---|---|
| V1.00 | 2026-09-14 | 00 | dựng hệ chữ · nền kính · sổ phiên bản · file kiểm định |
| V0.10 | 2026-09-14 | 00 | dựng khung sườn · design system · bộ dựng Markdown |

<!-- BANG-KET-THUC -->

---

## V1.00 — 14-Sep-2026

- **Hệ chữ đo lại bằng số liệu thật.** Đếm ký tự trên dòng trong trình duyệt rồi
  mới chỉnh, không ước lượng. Giãn dòng tiêu đề nới ra cho dấu tiếng Việt có chỗ.
- **Bỏ đoạn sapo trùng lặp.** Bài có `summary` thì đoạn đầu không tự phóng to
  nữa — trước đó người đọc gặp hai khối chữ lớn nói cùng một ý.
- **Chuyển sang bộ liquid glass.** Nền kính có viền sáng và độ sâu, nút nhấn có
  nhịp nảy, header và thẻ bài dùng chung một lớp vật liệu.
- **Thêm hai công cụ.** `npm run ver` ghi sổ phiên bản; `npm run kiem` chạy bộ
  kiểm định trước khi đăng.

## V0.10 — 14-Sep-2026

- Dựng hạ tầng blog tĩnh, không framework và không dependency.
- Design system kế thừa bảng màu Sakura và Galaxy; khung đọc bài có ba làn cho
  ảnh phá rào ra ngoài cột chữ.
- Bộ dựng Markdown tự viết, tự đo kích thước ảnh để khoá tỉ lệ.
- Ba file tài liệu: hướng dẫn đăng bài, IA, design system.
