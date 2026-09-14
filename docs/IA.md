# IA — KIẾN TRÚC THÔNG TIN & HẠ TẦNG

> Sơ đồ trang, đường dẫn, cách nội dung nằm trên đĩa, và cách một file `.md`
> biến thành một trang HTML.

---

## 1 · SƠ ĐỒ ĐƯỜNG DẪN

```
/                                    Trang chủ — bài mới nhất, tag nổi bật
/posts/                              Tất cả bài, sắp theo ngày
/posts/<mục>/                        Bài trong một chuyên mục
/posts/<mục>/<mục-con>/              Chuyên mục con — lồng bao nhiêu tầng cũng được
/posts/<mục>/<slug>/                 ▸ MỘT BÀI VIẾT
/tags/                               Tất cả tag, kèm số bài
/tags/<tag>/                         Bài mang tag đó
/archive/                            Theo năm → theo tháng
/search/                             Tìm kiếm, chạy hẳn trong trình duyệt
/about/                              Trang tĩnh, lấy từ content/pages/

/feed.xml    /sitemap.xml    /robots.txt
/search-index.json    /tags.json     ← dữ liệu cho trang tìm kiếm và trang tag
```

**Đường dẫn bài luôn có dấu `/` ở cuối**, và mỗi bài là một thư mục chứa
`index.html`. Nhờ vậy đường dẫn không dính đuôi `.html`, và đổi máy chủ lúc nào
cũng được mà link cũ không gãy.

**Đường dẫn bài không có ngày tháng.** `/posts/tam-ly/vo-thuc-tap-the/` chứ không
phải `/2026/09/14/vo-thuc-tap-the/`. Lý do: viết lại bài cũ sau hai năm thì đường
dẫn có năm trở thành lời nói dối, mà đổi đường dẫn thì gãy hết link cũ.

---

## 2 · NỘI DUNG NẰM Ở ĐÂU

```
content/
├── posts/
│   ├── _TEMPLATE.md                 khung bài mới (dấu _ ⇒ không được quét)
│   ├── tam-ly/
│   │   ├── _muc.json                tên hiển thị của chuyên mục
│   │   └── 2026-09-14-vo-thuc-tap-the.md
│   └── doi-thuong/
│       ├── _muc.json
│       └── ha-noi/
│           ├── _muc.json
│           └── 2026-08-02-quan-ca-phe-goc-pho.md
└── pages/
    └── about.md                     trang tĩnh

public/                              chép nguyên xi sang dist/
└── media/<năm>/<slug-bài>/          ảnh và video của từng bài
```

### Ba quy ước cứng

**Thư mục = chuyên mục.** Không có file nào khai báo danh sách chuyên mục. Tạo
thư mục là có chuyên mục, xoá thư mục là mất. Không bao giờ lệch giữa "danh sách
khai báo" và "thư mục có thật", vì chỉ có một nguồn duy nhất.

**Tên file mang ngày, đường dẫn thì không.** `2026-09-14-ten-bai.md` → `/…/ten-bai/`.
Ngày ở tên file chỉ để thư mục tự sắp theo thứ tự khi mở ra xem; ngày thật lấy
từ `date` trong front matter.

**Dấu `_` ở đầu tên ⇒ bỏ qua.** Dùng cho khung mẫu, ghi chú, bài cất tạm.

---

## 3 · MỘT BÀI ĐI QUA NHỮNG BƯỚC NÀO

```
content/posts/tam-ly/2026-09-14-vo-thuc.md
        │
        ├─ 1. quét      tools/build.mjs      đi hết cây thư mục, bỏ file/thư mục _*
        ├─ 2. tách      lib/frontmatter.mjs  cắt khối --- ra khỏi thân bài
        ├─ 3. KIỂM      lib/frontmatter.mjs  thiếu field bắt buộc ⇒ DỪNG HẲN
        ├─ 4. dựng      lib/markdown.mjs     .md → HTML
        │                  └─ lib/imgsize.mjs  đo ảnh thật ⇒ khoá aspect-ratio
        ├─ 5. đổ khuôn  src/templates/*.html  post.html lồng vào shell.html
        └─ 6. ghi       dist/posts/tam-ly/vo-thuc/index.html
```

Cùng lượt đó build còn sinh: `search-index.json`, `tags.json`, `feed.xml`,
`sitemap.xml`, `robots.txt`, và gộp 5 file CSS thành một `assets/style.css`.

### Vì sao KIỂM đứng trước DỰNG

Bài thiếu `title` hay sai `date` thì build **dừng hẳn**, không ra file nào. Nếu
để nó dựng rồi mới cảnh báo, bài lỗi vẫn lên sóng và chỉ phát hiện khi có người
đọc báo lại. Còn những thứ chỉ "nên có" — `summary`, `tags`, `cover` — thì cảnh
báo vàng rồi vẫn dựng: đó là chuyện tác giả tự quyết, không phải lỗi.

---

## 4 · TÌM KIẾM & TAG

Không có máy chủ, không có API, không có dịch vụ ngoài. Build sinh sẵn hai file
JSON, trang tìm kiếm tải về rồi lọc ngay trong trình duyệt.

**`search-index.json`** — mỗi bài một bản ghi:

| Trường | Để làm gì |
|---|---|
| `url` `title` `summary` `tags` `muc` `date` `phut` `cover` | dựng thẻ kết quả |
| `kd` | tiêu đề + tóm tắt + tag, **đã bỏ dấu**, viết thường |
| `tho` | 1200 ký tự đầu của thân bài |

Trường `kd` là lý do gõ **`tam ly`** cũng tìm ra **"tâm lý"**. Bỏ dấu sẵn từ lúc
build thì lúc gõ không phải xử lý gì, và không lệ thuộc trình duyệt có hỗ trợ
`Intl.Collator` hay không.

Cắt `tho` ở 1200 ký tự là chỗ cân bằng: đủ để tìm trúng ý chính của bài, mà file
không phình theo số bài đến mức tải chậm. Khi blog vượt ~300 bài thì nên cắt
`tho` hẳn ra file riêng, tải sau — ghi lại ở đây để sau này khỏi phải nghĩ lại.

**`tags.json`** — `{ slug, ten, so, bai[] }`. Có cả `slug` (`tam-ly`, đi vào URL)
lẫn `ten` (`tâm lý`, để hiển thị), vì một chiều không suy ra được chiều kia.

---

## 5 · HẠ TẦNG

**Không framework, không dependency.** `package.json` không có mục `dependencies`.
`npm install` không cần chạy. Chỉ cần Node ≥ 18 là `node tools/build.mjs` chạy được.

Đổi lại: bộ dựng Markdown là **một tập con** tự viết, không phải bản đầy đủ
(§3 của `HUONG-DAN-DANG-BAI.md` liệt kê đủ những gì dùng được). Đây là đánh đổi
có chủ ý — blog cá nhân cần chạy được sau năm năm không ai bảo trì, hơn là cần
đủ mọi cú pháp Markdown.

### Đưa lên mạng

`dist/` là một thư mục tĩnh thuần. Bất kỳ chỗ nào nhận file tĩnh đều chạy được.

| Nơi | Cách |
|---|---|
| **Vercel** / **Netlify** | build `npm run build`, thư mục xuất `dist` |
| **GitHub Pages** | đẩy `dist/` lên nhánh `gh-pages` |
| **Máy chủ riêng** | `rsync -a dist/ may-chu:/var/www/blog/` |

:::warn Deploy lên GitHub Pages dạng user.github.io/ten-repo
Phải đặt `"base": "/ten-repo"` trong `site.config.json`. Để rỗng thì mọi đường
dẫn CSS và ảnh đều trỏ về gốc tên miền — trang ra trắng trơn không có định dạng.
:::

### `site.config.json`

| Khoá | Ảnh hưởng tới |
|---|---|
| `title` `tagline` `description` `author` | header, chân trang, thẻ meta, RSS |
| `url` | canonical, ảnh OG, sitemap — **phải là địa chỉ thật khi lên sóng** |
| `base` | tiền tố mọi đường dẫn (xem khối cảnh báo trên) |
| `nav` | các mục trên thanh điều hướng |
| `version` | tem phiên bản ở chân trang |

---

## 6 · VIỆC CÒN LẠI

Lượt này dựng **khung sườn**: design system, khung đọc bài, bộ dựng, bảng kiểm,
tài liệu. Trang chủ hiện tại là **bản tạm** có chủ đích.

Dữ liệu cho phần còn lại đã sinh sẵn rồi, nên mỗi việc dưới đây chỉ là viết thêm
một template và một hàm trong `build.mjs`:

| Việc | Dựa vào cái đã có | Ước lượng |
|---|---|---|
| `/posts/` danh sách + phân trang | mảng `congKhai` trong `build.mjs` | nhỏ |
| `/posts/<mục>/` trang chuyên mục | `_muc.json` + trường `muc` của mỗi bài | nhỏ |
| `/tags/` và `/tags/<tag>/` | `tags.json` | nhỏ |
| `/search/` | `search-index.json` + trường `kd` | vừa |
| `/archive/` | gom `congKhai` theo năm | nhỏ |
| `/about/` và `content/pages/` | dùng lại `docBai()`, bỏ phần chuyên mục | nhỏ |
| Trang chủ thật | thay `trangChuTam()` | vừa |
| `og.png` mặc định | ảnh tĩnh, hoặc sinh theo bài | vừa |
| Trang 404 | template riêng | nhỏ |

Hai thứ **cố ý chưa làm**, không phải quên:

- **Bình luận.** Blog cá nhân không có bình luận thì không phải kiểm duyệt spam,
  và không phải nhúng script của bên thứ ba lên mọi trang bài.
- **Đo lượt xem.** Chưa gắn gì. Khi cần thì chọn loại không đặt cookie
  (Plausible, GoatCounter) — một dòng `<script>` trong `shell.html` là xong.
