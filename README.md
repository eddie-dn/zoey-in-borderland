# Zoey in Borderland

Blog cá nhân. Static site, **không framework, không dependency** — chỉ cần Node ≥ 18.

```bash
npm run new "Tên bài"   # tạo bài mới
npm run nhap -- <file>  # nhập bài cũ từ bản xuất WordPress
npm run anh <slug-bài>  # đưa ảnh từ _anh/ vào đúng thư mục của bài
npm run bia -- <slug>   # sinh ảnh bìa từ tiêu đề (--tat-ca cho mọi bài thiếu)
npm run nen             # nén lại mọi PNG, không mất chất lượng
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
| **Cài Cloudflare · D1 · Gemini — từng bước** | [`docs/CAI-DAT.md`](docs/CAI-DAT.md) |
| Khung bình luận chạy thế nào, cách trả lời | [`docs/BINH-LUAN.md`](docs/BINH-LUAN.md) |
| Bản lưu từng trạng thái của logo | [`docs/logo/README.md`](docs/logo/README.md) |
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
src/styles/     …· list (chưa kể ở dòng trên)
src/js/         theme · nen · toc · media · comments · duyet · copy-guard
                reveal · so-tay · quote · search · trang-so · moc · bang-anh
                xem · ghi-chu
src/templates/  shell.html · post.html · page.html
tools/          build · new-post · anh · bia · nen · dev · version · kiem-dinh
                ghi-chu-keo · lib/
worker.js       cửa vào khi trang chạy dạng Worker — định tuyến /api/*
wrangler.jsonc  cấu hình Worker: tệp tĩnh, binding D1
docs/logo/      bản lưu 12 trạng thái của logo + một file chạy trọn vòng
functions/api/  binh-luan.js — nhận · đọc · duyệt bình luận, chạy trên D1
                ghi-chu.js — đăng ghi chú thẳng lên /notes/, không phải dựng lại
                xem.js — đếm lượt xem thật
                quote.js — xin câu trích dẫn từ Gemini (tuỳ chọn)
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

**Ba khung trình bày bài,** chọn bằng một chữ trong front matter (`khung: A|B|C`).
Cả ba dùng chung một HTML, chỉ khác cách xếp bằng grid.

**Ba theme, một vòng xoay.** Sáng (Sakura) → tối (Galaxy) → **Tĩnh lặng** —
thác nước, suối, thiền, tông xanh pastel. Bấm cái nút ở góc phải thanh đầu
trang; lựa chọn được nhớ lại. Màn đầu trang chủ có nền động riêng cho từng
theme: cánh hoa rơi · đĩa thiên hà · thác nước đổ xuống mặt nước có gợn sóng.
Cả ba dùng chung một bộ token, nên thêm theme không phải sửa component nào
(`docs/DESIGN-SYSTEM.md` §1).

**Logo tự kể chuyện.** Ở trang chủ và trang giới thiệu, logo kể lại đúng trình
tự đã dựng ra nó: dòng chữ bóp lại → chữ Z → nét nối khép thành nút thắt vô cực
→ vô cực thứ nhất → chữ B vặn bụng → vô cực thứ hai → mandala tám cánh → xoay
chậm rồi nhanh → vỡ thành bụi rơi → tụ lại, kể lại. Vòng 30 giây, không dùng
ảnh, không phụ thuộc phông (`docs/DESIGN-SYSTEM.md` §19).

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

**Khung bình luận chạy trên Cloudflare D1**, cùng nhà với trang — người đọc
không phải đợi một dịch vụ bên thứ ba nào. Không bình luận nào tự lên trang:
mọi dòng chờ duyệt, và bạn duyệt ngay trên chính trang web — mở `/z-admin/`
là có cả ô viết ghi chú lẫn hàng chờ duyệt. Làm được từ điện thoại, không cần
mở máy, không cần dựng lại trang.

**Số phiên bản có đúng một nguồn.** `docs/LICH-SU.md` là sổ; build đọc dòng đầu
bảng rồi in ra tem chân trang, và báo nổi bật mỗi khi lên bản mới.

**Bộ kiểm định 42 phép, thêm dần được.** `npm run kiem` soi HTML đã dựng xong —
link gãy, ảnh mồ côi, tag viết lệch, bản nháp lọt vào bản dựng, thẻ meta thiếu,
file CSS/JS quên đăng ký, hàm dùng thứ Cloudflare Workers không có. Mỗi phép
kiểm đều phải cắm lỗi vào thử xem nó có bắt thật không trước khi tính là xong.

---

## Trạng thái

Bản hiện tại: xem tem `Vxx.yy` ở chân mọi trang, hoặc dòng đầu bảng trong
`docs/LICH-SU.md` — đó là nguồn duy nhất, mục này không nhắc lại số.

**Đã dựng xong:** trang chủ hai màn (màn đầu cao trọn màn hình, cuộn xuống ra
danh sách), `/posts/` với thư mục con theo chuyên mục, `/tags/`, `/archive/`,
`/search/` tìm ngay trên máy người đọc, `/about/` khung bento.

**Chạy trên máy chủ:** bốn hàm Cloudflare — `/api/binh-luan`, `/api/ghi-chu`,
`/api/xem` và `/api/quote`. Ba cái đầu dùng chung một cơ sở dữ liệu D1 và chung
một cặp khoá chủ trang. Ngoài chúng ra, trang là file tĩnh thuần.

**Còn treo:** `site.config.json` vẫn để địa chỉ `.pages.dev` — đổi sang tên
miền thật trước khi công bố, không thì thẻ canonical, ảnh chia sẻ và sitemap
đều trỏ sai. Danh sách việc còn lại: `docs/IA.md` §6.

---
## Đưa lên mạng

`dist/` là thư mục tĩnh thuần, đâu nhận file tĩnh cũng chạy.

- **Cloudflare Pages** — build `npm run build`, thư mục xuất `dist`
  (xem `docs/DUA-LEN-MANG.md`; hàm `/api/quote` nằm ở `functions/`)
- **GitHub Pages** — đẩy `dist/` lên nhánh `gh-pages`, và **nhớ đặt
  `"base": "/ten-repo"`** trong `site.config.json`
