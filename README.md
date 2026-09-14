# Zoey in Borderland

Blog cá nhân. Static site, **không framework, không dependency** — chỉ cần Node ≥ 18.

```bash
npm run new "Tên bài"   # tạo bài mới
npm run dev             # xem thử ở http://localhost:4321, tự tải lại khi lưu
npm run check           # kiểm bài, không ghi file
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

---

## Cây thư mục

```
content/posts/<mục>/<mục-con>/YYYY-MM-DD-slug.md   ← bài viết; thư mục = chuyên mục
content/pages/                                      trang tĩnh
public/media/<năm>/<slug>/                          ảnh, video của từng bài
src/styles/     tokens · base · layout · components · prose
src/js/         theme · toc · media
src/templates/  shell.html · post.html
tools/          build.mjs · new-post.mjs · dev.mjs · lib/
docs/           ba file tài liệu ở bảng trên
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

---

## Trạng thái

Lượt này dựng **khung sườn**: design system, khung đọc bài, bộ dựng Markdown,
bảng kiểm, tài liệu, hai bài mẫu.

Trang chủ hiện tại là **bản tạm**. Các trang `/posts/`, `/tags/`, `/search/`,
`/archive/`, `/about/` chưa dựng — dữ liệu cho chúng đã sinh sẵn
(`search-index.json`, `tags.json`). Danh sách việc còn lại: `docs/IA.md` §6.

---

## Đưa lên mạng

`dist/` là thư mục tĩnh thuần, đâu nhận file tĩnh cũng chạy.

- **Vercel / Netlify** — build `npm run build`, thư mục xuất `dist`
- **GitHub Pages** — đẩy `dist/` lên nhánh `gh-pages`, và **nhớ đặt
  `"base": "/ten-repo"`** trong `site.config.json`
