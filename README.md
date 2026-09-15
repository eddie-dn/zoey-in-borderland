# Zoey in Borderland

Blog cá nhân. Static site, **không framework, không dependency** — chỉ cần Node ≥ 18.

```bash
npm run new "Tên bài"   # tạo bài mới
npm run anh <slug-bài>  # đưa ảnh từ _anh/ vào đúng thư mục của bài
npm run dev             # xem thử ở http://localhost:4321, tự tải lại khi lưu
npm run check           # kiểm file .md nguồn
npm run kiem            # kiểm định dist/ — chạy trước khi đăng
npm run ver -- "mô tả"  # ghi một dòng vào sổ phiên bản
npm run build           # dựng ra dist/
```

Không phải chạy `npm install` — `package.json` không có `dependencies`.

---

## Đọc gì trước

| Việc bạn định làm | File |
|---|---|
| **Viết và đăng một bài** | [`docs/HUONG-DAN-DANG-BAI.md`](docs/HUONG-DAN-DANG-BAI.md) |
| Hiểu sơ đồ trang, đường dẫn, cách build chạy | [`docs/IA.md`](docs/IA.md) |
| Sửa giao diện, thêm component | [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) |
| **Đưa lên mạng · xem trên điện thoại** | [`docs/DUA-LEN-MANG.md`](docs/DUA-LEN-MANG.md) |
| Giấu mã nguồn · chặn chép nội dung | [`docs/RIENG-TU.md`](docs/RIENG-TU.md) |
| **Cài Apps Script · Gemini · Cloudflare — từng bước** | [`docs/CAI-DAT.md`](docs/CAI-DAT.md) |
| Khung bình luận chạy thế nào, cách trả lời | [`docs/BINH-LUAN.md`](docs/BINH-LUAN.md) |
| Ô trích dẫn mỗi ngày | [`docs/QUOTE.md`](docs/QUOTE.md) |
| Xem lịch sử phiên bản | [`docs/LICH-SU.md`](docs/LICH-SU.md) |

---

## Cây thư mục

```
content/posts/<mục>/<mục-con>/YYYY-MM-DD-slug.md   ← bài viết; thư mục = chuyên mục
content/pages/                                      trang tĩnh (about…)
content/quote-nguon.md                              nguồn + kho câu trích dẫn
public/media/<năm>/<slug>/                          ảnh, video của từng bài
public/_headers                                     luật cache cho Cloudflare
_anh/           chỗ quăng ảnh tạm; `npm run anh` xếp chúng vào bài
src/styles/     tokens · base · glass · layout · components · prose
src/js/         theme · toc · media · comments · copy-guard · reveal · so-tay
src/templates/  shell.html · post.html · page.html
tools/          build · new-post · anh · dev · version · kiem-dinh · lib/
tools/apps-script/  Code.gs — máy chủ bình luận, dán vào script.google.com
functions/api/  quote.js — hàm Cloudflare xin câu trích dẫn từ Gemini (tuỳ chọn)
                _nguon.js — SINH TỰ ĐỘNG lúc build, đừng sửa tay
docs/           chín file tài liệu ở bảng trên
site.config.json
dist/           ← build sinh ra, không commit
```

File và thư mục mở đầu bằng `_` không được quét — dùng để cất bài nháp.

---

## Bốn thứ đáng biết

**Build kiểm bài trước khi dựng.** Thiếu `title` hoặc `date`, hai bài trùng đường
dẫn, `date` sai định dạng → **dừng hẳn**, không ra file nào. Thiếu `summary`,
`tags`, `cover`, ảnh gãy link, ảnh quên chữ `alt` → cảnh báo vàng, vẫn dựng.

**Ảnh không bao giờ làm nhảy layout.** Build đọc kích thước thật từ file
(PNG · JPEG · GIF · WebP · SVG) rồi khoá `aspect-ratio` sẵn cho từng ảnh.

**Video YouTube chỉ tải khi bấm play.** Mở bài ra chỉ có ảnh bìa — không script
của Google, không cookie theo dõi đặt lên người đọc.

**Tìm kiếm chạy hẳn trong trình duyệt.** Build sinh `search-index.json` có sẵn
bản bỏ dấu, nên gõ `tam ly` cũng tìm ra *tâm lý*. Không máy chủ, không API.

**Hai khung trình bày bài,** chọn bằng một chữ trong front matter (`khung: A|B`).
Cả hai dùng chung một HTML, chỉ khác cách xếp bằng grid.

**Ảnh không phải copy tay.** Quăng vào `_anh/` rồi `npm run anh <slug-bài>` —
nó đổi tên cho sạch, xếp đúng chỗ, đo tỉ lệ, cảnh báo ảnh nặng, và in sẵn dòng
Markdown để dán.

**Bản nháp không bao giờ lên mạng.** `npm run build` không ghi bài `draft: true`
ra `dist/`. Xem thử ở máy mình thì `npm run dev`.

**Chép cả bài thì clipboard tự kèm dòng nguồn.** Trích một câu vẫn nguyên vẹn;
khối mã chép được bình thường. Đây là gờ giảm tốc, không phải ổ khoá — không có
cách nào chặn được sao chép trên web (`docs/RIENG-TU.md` §2.1).

**SEO sinh sẵn, không cài plugin nào.** Thẻ meta, `og:*`, JSON-LD `BlogPosting`
+ `BreadcrumbList`, sitemap có `lastmod`, RSS, `max-image-preview:large`.
Repo để private **không ảnh hưởng gì tới SEO** — Google đọc trang đã dựng, không
đọc repo (`docs/RIENG-TU.md` §1.5).

**Trang giới thiệu có hai khung** — `bento` (lưới ô kính) và `chuong` (các chương
hiện dần khi cuộn). Đổi bằng một chữ trong front matter.

**Ô trích dẫn mỗi ngày.** Cả ngày một câu, sang ngày mới đổi — chọn bằng cách
chia bài nên mỗi câu xuất hiện đúng một lần trong mỗi vòng, không bao giờ trùng
hai ngày liền. Không cần mạng. Bật thêm lớp Gemini thì mỗi ngày có một câu viết
mới (`docs/QUOTE.md`).

**Khung bình luận không cần máy chủ.** Google Apps Script + Google Sheet, miễn
phí, dữ liệu nằm trong Drive của bạn. Không bình luận nào tự lên trang — mọi
dòng chờ bạn duyệt bằng một chữ `x` trong Sheet.

**Số phiên bản có đúng một nguồn.** `docs/LICH-SU.md` là sổ; build đọc dòng đầu
bảng rồi in ra tem chân trang, và báo nổi bật mỗi khi lên bản mới.

**Bộ kiểm định 25 phép, thêm dần được.** `npm run kiem` soi HTML đã dựng xong —
link gãy, ảnh mồ côi, tag viết lệch, bản nháp lọt RSS, thẻ meta thiếu.

---

## Trạng thái

V1.01 thêm: xếp lại đầu bài, tag xuống chân bài, gợi ý đọc tiếp, khung bình
luận, công cụ đưa ảnh vào bài, chữ giao diện tiếng Anh.

V1.00: hệ chữ đo lại bằng số liệu thật, bộ liquid glass, sổ phiên bản, bộ kiểm
định trước khi đăng.

Nền tảng (V0.10): design system, khung đọc bài, bộ dựng Markdown, bảng kiểm,
tài liệu, hai bài mẫu.

Trang chủ hiện tại là **bản tạm**. Các trang `/posts/`, `/tags/`, `/search/`,
`/archive/`, `/about/` chưa dựng — dữ liệu cho chúng đã sinh sẵn
(`search-index.json`, `tags.json`). Danh sách việc còn lại: `docs/IA.md` §6.

---

## Đưa lên mạng

`dist/` là thư mục tĩnh thuần, đâu nhận file tĩnh cũng chạy.

- **Cloudflare Pages** — build `npm run build`, thư mục xuất `dist`
  (xem `docs/DUA-LEN-MANG.md`; hàm `/api/quote` nằm ở `functions/`)
- **GitHub Pages** — đẩy `dist/` lên nhánh `gh-pages`, và **nhớ đặt
  `"base": "/ten-repo"`** trong `site.config.json`
