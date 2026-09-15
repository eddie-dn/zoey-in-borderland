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
| V1.05 | 2026-09-14 | 05 | trang giới thiệu hai khung · ô trích dẫn mỗi ngày |
| V1.04 | 2026-09-14 | 04 | bổ sung dữ liệu có cấu trúc · ảnh chia sẻ mặc định |
| V1.03 | 2026-09-14 | 03 | nháp không lên mạng · chép dài kèm nguồn · tài liệu riêng tư |
| V1.02 | 2026-09-14 | 02 | cấu hình Vercel · xem thử qua WiFi · tài liệu đưa lên mạng |
| V1.01 | 2026-09-14 | 01 | xếp lại đầu bài · khung bình luận · công cụ đưa ảnh |
| V1.00 | 2026-09-14 | 00 | dựng hệ chữ · nền kính · sổ phiên bản · file kiểm định |
| V0.10 | 2026-09-14 | 00 | dựng khung sườn · design system · bộ dựng Markdown |

<!-- BANG-KET-THUC -->

---

## V1.05 — 14-Sep-2026

- **Trang giới thiệu, hai khung.** `bento` là lưới ô kính đọc như tấm danh
  thiếp; `chuong` là các chương chữ lớn hiện dần khi cuộn. Đổi bằng một chữ
  trong front matter, cùng dữ liệu, khác cách bày.
- **Ô trích dẫn mỗi ngày.** Cả ngày một câu, chọn bằng cách chia bài nên mỗi câu
  ra đúng một lần trong mỗi vòng và không bao giờ trùng hai ngày liền. Chạy
  offline. Bật thêm lớp Gemini thì mỗi ngày có một câu viết mới.
- **Dựng được trang tĩnh** từ `content/pages/` — `/about/` ra khỏi danh sách
  chưa dựng.

## V1.04 — 14-Sep-2026

- **Thêm ảnh chia sẻ mặc định.** `public/og.png` trước đây được khai trong thẻ
  meta nhưng file không tồn tại — mọi link chia sẻ ra ô trắng.
- **Bổ sung dữ liệu có cấu trúc.** `BreadcrumbList` cho dòng phân cấp hiện dưới
  tiêu đề trong kết quả Google, `max-image-preview:large` cho ảnh bìa hiện cỡ
  lớn thay vì ô nhỏ, `lastmod` trong sitemap.
- **Bốn phép kiểm SEO mới,** trong đó một cái bắt lỗi ảnh bìa để `.svg` —
  Facebook và Zalo không đọc được định dạng đó.
- Ghi rõ trong tài liệu: **repo riêng tư không ảnh hưởng SEO**, vì Google đọc
  trang đã dựng chứ không đọc repo.

## V1.03 — 14-Sep-2026

- **Bản nháp không còn lên mạng.** Trước đây bài `draft: true` vẫn được đẩy lên
  máy chủ, chỉ gắn `noindex` — mà `noindex` chỉ bảo Google đừng đánh chỉ mục,
  ai đoán trúng đường dẫn vẫn đọc được. Nay `npm run build` không ghi chúng ra.
- **Chép cả bài thì clipboard tự kèm dòng nguồn.** Trích ngắn dưới 220 ký tự và
  khối mã vẫn chép nguyên vẹn. Dán vào Word thì dòng nguồn là liên kết bấm được.
- **Thêm `docs/RIENG-TU.md`** — cách đặt repo riêng tư, và nói thẳng vì sao
  không thể chặn việc sao chép trên web.

## V1.02 — 14-Sep-2026

- **Sửa chỗ Vercel deploy ra 404.** Thêm `vercel.json` trỏ thẳng vào `dist/`.
  Không có nó, Vercel lấy nhầm thư mục `public/` — trong đó chỉ có ảnh, không
  có trang chủ.
- **Xem thử trên điện thoại.** `npm run dev` nay in luôn địa chỉ của máy trong
  mạng WiFi, gõ vào trình duyệt điện thoại là mở được.
- **Thêm `docs/DUA-LEN-MANG.md`** — ba cách xem trang, cách gỡ mấy lỗi hay gặp,
  và cái bẫy `.gitignore` biến mất khi upload tay lên GitHub.

## V1.01 — 14-Sep-2026

- **Xếp lại đầu bài.** Ngày và phút đọc lên ngay dưới tiêu đề; tóm tắt xuống
  sau, in nghiêng và nhỏ lại. Tag rời khỏi đầu bài, xuống hẳn khung riêng ở chân.
- **Mọi thứ thẳng một mép.** Ảnh bìa, ảnh trong bài, bảng, đầu bài, chân bài —
  cùng một lề trái với cột chữ. Đo lại: lệch 0px ở cả hai khung, cả hai khổ màn.
- **Khung bình luận.** Google Apps Script + Google Sheet, không tốn tiền, không
  bình luận nào tự lên trang. Thêm khối gợi ý đọc tiếp xếp theo tag trùng.
- **Hai công cụ mới.** `npm run anh` đưa ảnh từ `_anh/` vào đúng thư mục bài và
  in sẵn dòng chèn. Chữ giao diện chuyển hết sang tiếng Anh; bỏ khung C.

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
