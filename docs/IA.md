# IA — KIẾN TRÚC THÔNG TIN & HẠ TẦNG

> Sơ đồ trang, đường dẫn, cách nội dung nằm trên đĩa, và cách một file `.md`
> biến thành một trang HTML.

---

## 1 · SƠ ĐỒ ĐƯỜNG DẪN

```
/                                    Trang chủ — MỘT màn: tên blog, câu trích
                                     dẫn, ba bài mới nhất
/posts/                              Thư mục CHUYÊN MỤC (không phải danh sách
                                     theo ngày) — tối đa 6 mục một trang
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

_anh/                                chỗ quăng ảnh tạm (KHÔNG theo git)
```

### Đưa ảnh vào bài

Không copy tay. Quăng ảnh vào `_anh/` rồi:

```bash
npm run anh <slug-bài>          # chuyển vào đúng thư mục của bài
npm run anh <slug-bài> --bia    # kèm đặt ảnh ngang đầu tiên làm bìa
npm run anh                      # xem bài nào đang có ảnh gì
```

`tools/anh.mjs` lo: đổi tên sang slug sạch (tên tiếng Việt có dấu sang URL là
một chuỗi `%20%C3%A1` dài loằng ngoằng, vài máy chủ còn từ chối hẳn), xếp vào
`public/media/<năm>/<slug>/`, đo kích thước, cảnh báo ảnh trên 400 KB, và in
sẵn dòng Markdown kèm `{.wide}` nếu ảnh ngang.

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
`sitemap.xml`, `robots.txt`, `llms.txt`, `version.json`, `so-tay.json`, và gộp
**13** file CSS thành **6 gói** — mỗi loại trang chỉ tải gói của nó. Bảng đầy
đủ ở `docs/DESIGN-SYSTEM.md` §7.

Tên file assets mang **vân tay nội dung** (`nen.b92c6bac.css`), nên đừng gõ
cứng tên nào trong mã hay trong tài liệu: đọc từ `<link>` của trang đã dựng.
Một script trong `docs/logo/` từng gõ cứng `dist/assets/style.css` và hỏng
lặng suốt từ lượt chia gói cho tới khi có người chạy lại nó.

**Trước khi ghi ra `dist/`, CSS và JS đều bị cắt hết chú thích.** Chú thích
trong `src/` là chủ ý — chúng ghi lại vì sao từng chỗ viết như vậy — nhưng
người đọc blog không cần chúng mà vẫn phải tải về. Đo trên bản thật:
CSS **402 → 142 KB**, JS **469 → 211 KB**. Bản trong `src/` không đổi một chữ.

Hai con số ấy là TỔNG cả sáu gói. Một trang cụ thể tải ít hơn hẳn: trang bài
84 KB, trang danh sách 83 KB, `/z-admin/` 110 KB.

> Cắt chú thích của JS khó hơn của CSS: dấu `/` trong JS vừa là phép chia,
> vừa mở chú thích, vừa mở một mẫu tìm kiếm. `boChuThichJS` phải đọc từng ký
> tự, và bộ dựng còn thử **dịch lại** bản đã cắt trước khi ghi — hỏng thì gửi
> nguyên bản gốc và kêu lên. `npm run kiem` soi lại lần nữa trên chính file
> nằm trong `dist/`.

**`so-tay.json` là sổ phiên bản, để RIÊNG chứ không nhúng vào trang.** Nó nặng
77 KB; nhúng vào mọi trang thì một trang bài 9 KB phình thành 100 KB và cả bản
dựng lặp lại 3,5 MB — tất cả để phục vụ một cửa hậu phải bấm năm nhịp mới mở.
Nay `so-tay.js` xin về đúng lúc mở.

> **Danh sách file CSS phải phủ hết `src/styles/`.** Thiếu một file thì không
> có lỗi nào cả — trang vẫn dựng, chỉ là một mảng giao diện lặng lẽ biến mất.
> Đã vấp: cả bộ liquid glass nằm ngoài bundle suốt một phiên bản. `npm run kiem`
> nay có một phép so lại.

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
| **Cloudflare Workers** ← đang dùng | build `npm run build`, deploy `npx wrangler deploy`, hàm ở `functions/` định tuyến qua `worker.js` |
| **Cloudflare Pages** | build `npm run build`, thư mục xuất `dist`, hàm ở `functions/` — nhưng **cron không chạy ở Pages**, nên ba việc theo lịch sẽ im |
| **GitHub Pages** | đẩy `dist/` lên nhánh `gh-pages` — chỉ phần tĩnh, mọi `/api/*` mất |
| **Máy chủ riêng** | `rsync -a dist/ may-chu:/var/www/blog/` — cũng chỉ phần tĩnh |

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
| `chuaDung` | danh sách đường dẫn CHƯA DỰNG — mọi chỗ trỏ tới chúng hiện mờ thay vì thành link chết |
| `binhLuan` | `bat` bật/tắt khung bình luận · `api` đường dẫn hàm nhận bình luận (mặc định `/api/binh-luan`, cùng tên miền — KHÔNG còn là địa chỉ Apps Script) · `loiMoi` câu mời |
| `luotXem` `ghiChu` `dangBai` `quoteAI` | mỗi khoá một tính năng chạy trên máy chủ, đều có `bat`/`online` và `api` riêng |
| `phanTich` `doanTruoc` `baoVeChu` `soLuong` `logo` `nhan` | xem chú thích trong chính `site.config.json` — mỗi khoá có một dòng `_ghichu` kể vì sao nó tồn tại |

Phiên bản **không** khai ở đây. Nguồn duy nhất là dòng đầu bảng trong
`docs/LICH-SU.md`.

---

## 6 · VIỆC CÒN LẠI

Mục này từng là bảng kê mười việc của lượt dựng khung sườn. Gần hết đã làm —
giữ nguyên bảng cũ thì tài liệu nói dối, nên nó được thay bằng hiện trạng.

### 6.0 · Đã dựng

| Trang | Dựa vào |
|---|---|
| `/` MỘT màn cao trọn màn hình: tên blog · trích dẫn · 3 bài mới nhất. Khổ dọc thì ba bài ấy chờ bấm "Read on" | `trangChu()` · `man-dau.js` |
| Số trang cho Posts · Tags · Archive, người đọc chọn được số bài mỗi trang | `trang-so.js` |
| `/posts/` — thư mục theo MỤC: mỗi mục **5 bài** dạng dòng đơn rồi "See all →", tối đa **6 mục** một trang | `congKhai` + `_muc.json` |
| `/posts/<mục>/` — danh sách đầy đủ của một mục | `congKhai` + `_muc.json` |
| `/notes/` — ghi chú ngắn, lọc theo loại. Thay Tags trên thanh đầu trang | `content/ghi-chu.md` |
| `/tags/` và `/tags/<tag>/` — vẫn còn, đường vào ở chân trang | `tags.json` |
| `/search/` — tìm ngay trên máy người đọc, không gọi máy chủ | `search-index.json` + trường `kd` |
| `/archive/` gom theo năm | `congKhai` |
| `/about/` khung bento | `content/pages/` |
| `/z-admin/` — bàn làm việc của chủ trang: ba ngăn **Note · Comment · Post**, mỗi lúc một ngăn | `admin.js` + `ghi-chu.js` · `duyet.js` · `viet-bai.js` |
| Ảnh chia sẻ mặc định — một bản cho mỗi theme: `og.jpg` · `og-thien-ha.jpg` · `og-tinh-lang.jpg` · `og-suong-giang.jpg` | bài không có `cover` rơi về một trong bốn, chọn theo tên bài. Sinh bằng `npm run og` |
| `/404` — trang không tìm thấy, dựng cùng bộ khung với mọi trang khác | `trang404()` |
| Menu thả xuống cho màn hẹp — bốn mục điều hướng gấp vào sau nút ☰ | `menu.js` |

### 6.0b · Chưa làm

Bốn việc từng nằm ở đây — trang 404, menu cho màn hẹp, đưa ảnh vào bài ngay từ
`/z-admin/`, và vân tay nội dung cho tên file CSS/JS — **đều đã làm xong**.
Ảnh nay thả thẳng vào ô soạn: trình duyệt thu nhỏ rồi `functions/api/anh.js`
ghi vào kho mã, và ô soạn giữ bản xem tại chỗ cho tới khi Cloudflare dựng xong.

Sổ hàng đợi thật nằm ở [`VIEC-DANG-CHO.md`](VIEC-DANG-CHO.md) — mục này không
chép lại nó.
### 6.1 · Bình luận — chạy trên Cloudflare D1

Cùng nhà với trang: một hàm Worker và một cơ sở dữ liệu D1, không dịch vụ bên
thứ ba nào. Cài đặt từng bước: [`docs/BINH-LUAN.md`](BINH-LUAN.md).

```
Người đọc gõ ──POST──► /api/binh-luan ──ghi──► D1 (cột duyet = 0)
Trang web   ◄──GET──── /api/binh-luan ◄─chỉ dòng đã duyệt─┘
Chủ trang   ──PATCH──► /api/binh-luan          duyệt · ẩn · gỡ
```

Hai luật cứng: **không bình luận nào tự lên trang**, và **email không bao giờ
rời máy chủ** — câu truy vấn công khai không chọn cột ấy.

> Đời đầu (V1.1.1) dùng Google Apps Script và một Google Sheet. Vì sao đổi:
> `docs/BINH-LUAN.md`, mục "Vì sao KHÔNG còn Google Apps Script".

### 6.1b · Ba việc chạy theo lịch

Không có trang nào cả — chúng chạy lúc không có ai ngồi đó, và chỉ nói ra khi
có chuyện. Tất cả nằm trong `functions/api/thu-bao.js`, gọi từ `scheduled` của
`worker.js`.

```
mỗi ngày 20:00 ─┬─► bình luận đang chờ duyệt ──► một lá thư gom
                └─► tự kiểm 5 chỗ hay hỏng lặng lẽ
Chủ nhật 21:00 ───► D1 ──POST──► Apps Script ──► Google Sheet trong Drive
```

Luật chung của cả ba: **im lặng khi không có tin**. Thư báo chỉ gửi khi có bình
luận mới trong 25 giờ; tự kiểm chỉ gửi khi bức tranh khác lần trước; sao lưu
chỉ gửi khi HỎNG. Cái chuông chỉ đáng tin khi nó chỉ kêu lúc có chuyện.

Cron **chỉ chạy ở Worker**, không chạy ở Pages — xem §5. Từng bước:
[`docs/THU-BAO.md`](THU-BAO.md) và [`docs/SAO-LUU.md`](SAO-LUU.md).

### 6.2 · Cố ý chưa làm

- **Đo lượt xem.** Đã có chỗ cắm: Cloudflare Web Analytics, khai ở
  `site.config.json` → `phanTich`. **Mặc định TẮT** — bật hay không là quyết
  định của chủ trang, không phải mặc định của bộ dựng. Nó không đặt cookie nên
  không phải dựng banner xin phép. Cách bật: `docs/DUA-LEN-MANG.md` §9.
  Bật rồi thì gợi ý "đọc tiếp" xếp hạng được theo lượt đọc: cộng thêm một số
  hạng vào hàm `goiY()` trong `build.mjs`, phần còn lại không phải sửa.
