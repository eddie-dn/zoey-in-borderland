# ĐƯA LÊN MẠNG & XEM THỬ

> Ba cách xem trang: **mở file trên máy**, **xem qua WiFi từ điện thoại**, và
> **đưa lên mạng thật trên Cloudflare Pages**. §3 giải thích vì sao lần đầu hay
> ra 404, và chỗ nào của mã phải viết khác đi so với Vercel.

---

## 0 · Hiểu một chuyện trước: `dist/` mới là trang web

Repo có hai thứ dễ nhầm:

| Thư mục | Là gì | Có lên mạng không |
|---|---|---|
| `content/`, `src/`, `tools/` | **nguyên liệu** — file `.md`, CSS, script dựng | không |
| `public/` | ảnh và video, sẽ được chép vào bản dựng | không, chỉ là nguyên liệu |
| **`dist/`** | **trang web thật** — HTML, CSS đã gộp, ảnh đã chép | **có, đúng cái này** |

`dist/` không có sẵn trong repo (nó nằm trong `.gitignore`). Nó được **sinh ra**
khi chạy `npm run build`. Đây là chỗ gây ra gần như mọi trục trặc khi deploy:
máy chủ trỏ nhầm vào `public/` hoặc vào gốc repo, và ở đó không có `index.html`.

---

## 1 · Xem trên chính máy tính

```bash
npm run build
npm run dev
```

Mở `http://localhost:4321`. Lưu file là trang tự tải lại.

:::warn Đừng mở file bằng cách bấm đúp vào dist/index.html
Mở kiểu đó, trình duyệt dùng giao thức `file://`. Đường dẫn của trang bắt đầu
bằng `/` (ví dụ `/assets/style.css`), mà với `file://` thì dấu `/` trỏ về **gốc
ổ cứng**, không phải gốc trang. Kết quả: trang ra trắng trơn không có định dạng.
Luôn dùng `npm run dev`.
:::

---

## 2 · Xem trên điện thoại — cùng WiFi, chưa cần lên mạng

Chạy `npm run dev`. Nó in ra hai địa chỉ:

```
  ▸ http://localhost:4321      máy này
  ▸ http://192.168.1.12:4321   điện thoại — cùng WiFi, gõ nguyên địa chỉ này
```

Gõ **địa chỉ thứ hai** vào trình duyệt điện thoại.

:::stop Đừng gõ localhost trên điện thoại
`localhost` nghĩa là "chính cái máy đang hỏi". Gõ nó trên điện thoại thì điện
thoại đi tìm chính nó, không ra gì cả. Phải là địa chỉ IP của laptop.
:::

Ba điều kiện: máy tính và điện thoại **chung một WiFi**, `npm run dev` **đang
chạy**, và tường lửa của máy không chặn cổng 4321 (macOS/Windows lần đầu sẽ hỏi
"cho phép Node nhận kết nối?" — bấm Cho phép).

---

## 3 · Đưa lên mạng thật — Cloudflare Pages

### 3.1 · Mười phút đầu

1. Đẩy repo lên GitHub (xem §5 nếu upload tay).
2. Vào **dash.cloudflare.com** → **Workers & Pages** → **Create** →
   tab **Pages** → **Connect to Git**.
3. Chọn repo `zoey-in-borderland`. Cloudflare hỏi quyền GitHub lần đầu — cho.
4. Ở màn hình **Set up builds and deployments**, điền đúng ba ô:

   | Ô | Điền |
   |---|---|
   | Framework preset | **None** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. **Save and Deploy**. Khoảng một phút sau ra địa chỉ
   `https://<tên-dự-án>.pages.dev`.
6. Mở `site.config.json`, sửa `url` thành đúng địa chỉ đó, rồi đẩy lên lại.
   Không sửa thì thẻ canonical, ảnh chia sẻ và sitemap đều trỏ sai chỗ.

### 3.2 · Ba ô đó sai là hỏng kiểu gì

**Build output directory để trống hoặc để `/`** → Cloudflare phục vụ gốc repo.
Ở đó không có `index.html` nào cả, nên ra **404** — mà log build thì xanh
hoàn toàn, không có dòng lỗi nào để lần. Đây là cái bẫy số một.

**Để `public`** → cũng 404, và khó đoán hơn nữa: thư mục `public/` CÓ tồn tại,
trong đó có ảnh, nên Cloudflare không báo gì. Chỉ là nó không có `index.html`.

**Framework preset chọn nhầm** → preset ghi đè build command bằng lệnh của
framework đó (`next build`, `astro build`…), và lệnh đó không có ở đây.

`npm run kiem` có một phép kiểm cho `dist/_headers`, nhưng KHÔNG kiểm được ba ô
này — chúng nằm trong bảng điều khiển Cloudflare, không nằm trong repo.

### 3.3 · Không cần cài gì cả

Dự án này **không có dependency nào**. `package.json` không có khoá
`dependencies`, nên `npm install` chạy xong trong một giây và không tải gì.
Cloudflare vẫn chạy nó, và đó là chuyện bình thường.

### 3.4 · `_headers` — luật cache

Cloudflare không đọc `vercel.json` hay bất kỳ file cấu hình nào ở gốc repo. Nó
đọc đúng một file tên **`_headers`**, và file đó phải nằm **trong thư mục xuất
bản** (`dist/`), không phải gốc repo.

Ở đây nó nằm ở `public/_headers`; build chép trọn `public/` sang `dist/` nên nó
tự đi theo. Đặt nhầm chỗ thì nó im lặng vô tác dụng — trang vẫn lên, ảnh vẫn
hiện, chỉ là mỗi lần vào lại tải lại từ đầu, và không có lỗi nào để thấy.

### 3.5 · Hàm `/api/quote` — chỗ khác Vercel nhiều nhất

Ô "Quote of the day" chạy được **không cần** hàm này (kho câu nhúng sẵn trong
HTML). Hàm chỉ là lớp thêm nếm, bật lên thì mỗi ngày có một câu Gemini viết mới.

Nếu bật, nhớ ba điều — đây là chỗ mã viết cho Vercel **không chạy** trên
Cloudflare:

| | Vercel | Cloudflare Pages |
|---|---|---|
| Thư mục | `api/quote.js` | **`functions/api/quote.js`** |
| Tên hàm | `export default (req, res)` | **`export async function onRequest({ request, env })`** |
| Trả về | `res.status(200).end(...)` | **`return new Response(...)`** |
| Biến môi trường | `process.env.X` | **`env.X`** (tham số của `onRequest`) |
| Đọc file | `fs.readFileSync` chạy được | **không có đĩa** — phải nướng sẵn lúc build |

Chỗ cuối là chỗ nặng nhất. Workers không phải Node: không `fs`, không
`process`, không `__dirname`. Nên nguồn câu ở `content/quote-nguon.md` được
build đọc một lần rồi ghi ra `functions/api/_nguon.js`, và hàm `import` file
đó. File sinh ra ấy **được commit**, không gitignore.

`npm run kiem` có một phép kiểm quét cả `functions/` để bắt bốn lỗi trên.

Cách khai khoá Gemini: xem `docs/CAI-DAT.md` §2.

---

## 4 · Các chỗ khác

| Chỗ | Cách làm |
|---|---|
| **Netlify** | build `npm run build`, xuất `dist`. Cũng đọc `_headers`. Hàm phải viết lại theo `netlify/functions/`. |
| **Vercel** | build `npm run build`, xuất `dist`. Cần `vercel.json` trỏ `outputDirectory: "dist"`, không thì 404. Hàm phải chuyển về `api/` và viết lại kiểu `(req, res)`. |
| **GitHub Pages** | được, nhưng không chạy được hàm `/api/quote` — GitHub Pages chỉ phục vụ file tĩnh. Ô trích dẫn vẫn chạy bằng kho câu sẵn. |
| **Tên miền riêng** | Cloudflare → dự án → **Custom domains** → **Set up a domain**. Nhớ sửa `url` trong `site.config.json` cho khớp. |

---

## 5 · Upload tay lên GitHub — cái bẫy `.gitignore`

Kéo thả cả thư mục vào GitHub thì trình duyệt **bỏ qua mọi file bắt đầu bằng
dấu chấm**, kể cả `.gitignore`.

Hậu quả: lần sau chạy `npm run build` rồi commit, thư mục `dist/` và
`node_modules/` bị đẩy hết lên repo.

**Kiểm:** mở repo trên GitHub, nhìn danh sách file ở trang chủ repo. Không thấy
`.gitignore` là đang thiếu.

**Sửa:** trên GitHub bấm **Add file → Create new file**, gõ tên file đúng là
`.gitignore` (có dấu chấm đầu), dán nội dung này vào, Commit:

```gitignore
/dist/
node_modules/
npm-debug.log*
.DS_Store
Thumbs.db
*.swp
.vscode/
.idea/
/content/_scratch/
/_anh/*
!/_anh/README.md
```

Cách tránh hẳn: dùng dòng lệnh `git push` thay vì kéo thả — git đẩy đủ mọi file,
không phân biệt dấu chấm.

---

## 6 · Khi có chuyện

| Hiện tượng | Nguyên nhân |
|---|---|
| Deploy xong ra **404** | Build output directory chưa đặt là `dist` — xem §3.2 |
| Trang lên nhưng **trắng trơn, không màu mè** | Đang mở bằng `file://`; hoặc deploy lên GitHub Pages mà chưa đặt `base` |
| Cloudflare **không thấy repo** | Chưa cấp quyền GitHub App — dự án → Settings → Build → Manage GitHub app |
| Ảnh chia sẻ Facebook ra **ô trắng** | `url` trong `site.config.json` còn là địa chỉ tạm |
| Ảnh **tải lại mỗi lần vào** | `dist/_headers` không có — kiểm bằng `npm run kiem` |
| `/api/quote` trả **500** | Hàm còn dùng `process.env` / `fs` / `module.exports` — `npm run kiem` bắt được; log ở Cloudflare → dự án → **Functions** → **Real-time Logs** |
| `/api/quote` trả **404** | Hàm để nhầm thư mục. Phải là `functions/api/quote.js`, không phải `api/quote.js` |
| Điện thoại **không vào được** `192.168.x.x` | Khác WiFi, `npm run dev` đã tắt, hoặc tường lửa chặn cổng 4321 |
| Build **hỏng** | Xem log — thường là Node dưới 18. Cloudflare → Settings → Variables → thêm `NODE_VERSION` = `20` |

---

## 7 · SEO — trang đã có sẵn những gì

Không phải cài plugin nào. Build tự sinh hết.

### 7.1 · Mỗi bài tự có

| Thứ | Quyết định điều gì |
|---|---|
| `<title>` · `<meta description>` | Dòng tiêu đề và đoạn mô tả trong kết quả Google |
| `rel="canonical"` | Chặn Google coi hai đường dẫn là hai bài trùng nhau |
| `og:*` + `twitter:card` | Thẻ xem trước khi chia sẻ lên Facebook, Zalo, Twitter |
| **`max-image-preview:large`** | Google hiện ảnh bìa **cỡ lớn** thay vì một ô nhỏ xíu cạnh tiêu đề |
| **JSON-LD `BlogPosting`** | Google biết đây là bài viết, của ai, ngày nào, ảnh nào |
| **JSON-LD `BreadcrumbList`** | Dòng `Zoey in Borderland › Psychology › …` hiện dưới tiêu đề, thay cho đường dẫn thô |
| `lang="vi"` | Google biết bài tiếng Việt, đem cho người tìm bằng tiếng Việt |
| `sitemap.xml` có `lastmod` | Google biết bài nào vừa sửa mà quay lại đọc, không phải bò đều khắp trang |
| `feed.xml` | Người đọc theo dõi bằng RSS; vài công cụ cũng dùng nó để phát hiện bài mới |

### 7.2 · Ba thứ tác giả phải tự lo

**`summary` cho từng bài.** Đây là đoạn mô tả Google hiện dưới tiêu đề. Không
khai thì máy cắt 170 chữ đầu bài — thường ra một câu dở dang. Gói trong 160 ký tự.

**Tiêu đề dưới 60 ký tự.** Google cắt ở khoảng đó. Dài hơn thì phần đuôi thành
`…`, mà phần đuôi là tên blog nên mất luôn. `npm run kiem` cảnh báo.

**Ảnh bìa `.jpg` hoặc `.png`, KHÔNG phải `.svg`.** Facebook, Zalo và Twitter
không đọc được SVG — link chia sẻ ra ô trắng. Trang vẫn hiện đẹp nên rất dễ lọt.
`npm run kiem` bắt lỗi này (mức đỏ).

### 7.3 · Sau khi lên sóng — hai việc làm một lần

1. **Đổi `url` trong `site.config.json`** thành tên miền thật. Không đổi thì
   canonical, ảnh chia sẻ và sitemap đều trỏ về địa chỉ cũ.
2. **Khai sitemap với Google.** Vào
   [Google Search Console](https://search.google.com/search-console), thêm trang,
   rồi ở mục *Sitemaps* gõ `sitemap.xml`. Không làm thì Google vẫn tìm ra, chỉ
   chậm hơn vài tuần.

### 7.4 · `og.png` — ảnh chia sẻ mặc định

`public/og.jpg` (1200×630) là ảnh dùng cho trang chủ và cho bài không khai
`cover`. Đây là ảnh nền chuyển màu, không có chữ — thay được bằng bất kỳ ảnh
nào cùng khổ, chỉ cần ghi đè file đó.

---

## 8 · Hệ sinh thái Cloudflare — cái nào nên dùng, cái nào không

Cloudflare bán R2, D1, KV, Workers, Images, Queues… và mọi bài hướng dẫn
"blog cá nhân trên Cloudflare" đều khuyên dùng gần hết. Phần lớn lời khuyên ấy
viết cho người đang chạy WordPress. Trang này không phải WordPress, nên bảng
dưới đây là câu trả lời riêng cho nó.

| Dịch vụ | Dùng ở đây? | Vì sao |
|---|---|---|
| **Pages** | **Có, đang dùng** | Đây là chỗ trang ở |
| **Workers / Pages Functions** | **Có, một hàm** | `/api/quote`. Không có gì khác cần máy chủ |
| **R2** (lưu ảnh) | **Chưa cần** | Toàn bộ ảnh của trang chưa tới 1 MB. R2 miễn phí 10 GB — dư hơn mười nghìn lần. Đổi sang R2 là thêm một hệ thống, thêm một đường deploy, và mất tính chất "clone repo về là có đủ mọi thứ" |
| **D1** (cơ sở dữ liệu) | **Chưa, nhưng có lý** | Xem §8.1 |
| **KV** (kho khoá–giá trị) | **Không** | Người ta khuyên dùng KV để cache danh sách bài. Trang tĩnh đã nướng sẵn danh sách vào HTML và CDN trả từ máy gần nhất — đọc KV còn CHẬM HƠN đọc file tĩnh. Lời khuyên ấy viết cho trang động |
| **Images** | **Không** | Ảnh bìa tự sinh bằng `npm run bia`, đã nén bằng `npm run nen` |

### 8.1 · D1 cho bình luận — đúng mà chưa tới lúc

Bình luận đang chạy Google Apps Script + Google Sheet. D1 sẽ nhanh hơn thật:
Apps Script khởi động nguội mất một tới ba giây, D1 đọc trong vài mili-giây, và
chuyển sang D1 thì bỏ được luôn cái mẹo gửi bằng `text/plain` để né kiểm tra
CORS.

Nhưng **cái Sheet không phải điểm yếu, nó là màn hình kiểm duyệt**. Muốn xoá
một bình luận rác thì mở Sheet, xoá dòng, xong. D1 không có màn hình nào cả —
chuyển sang D1 là phải viết thêm một trang quản trị, hoặc gõ lệnh mỗi lần.

**Mốc để đổi:** khi bình luận đủ nhiều để độ trễ Apps Script thành phiền, hoặc
khi chạm hạn ngạch của nó. Chưa tới thì giữ nguyên.

### 8.2 · Nút ở bảng điều khiển: nên và không nên

| Nút | Nên? |
|---|---|
| **Always Use HTTPS** | Bật |
| **Minimum TLS Version 1.2** | Bật |
| **Early Hints** | Bật, vô hại |
| **HTTP/3 (QUIC)** | Đã bật sẵn |
| **Brotli** | Đã bật sẵn, không phải nút cần gạt |
| **Auto Minify** | Cloudflare đã bỏ nút này từ 8/2024. Bộ dựng cũng tự nén rồi |
| **Bot Fight Mode** | **Cẩn thận.** Nó chèn một thử thách JavaScript, có thể chặn cả trình đọc RSS lẫn bot của Google — mà blog thì MUỐN được đánh chỉ mục. Nếu bật, chọn Super Bot Fight Mode mức "block definitely automated" |
| **Email Obfuscation** | Bỏ qua. Nó chèn một script của Cloudflare vào MỌI trang, mà trang này đang không có script ngoài nào |

### 8.3 · Chỗ dễ làm hỏng nhất: cache cho `/assets/`

Mọi bài hướng dẫn đều khuyên đặt `Cache-Control: max-age=31536000` cho tài
nguyên tĩnh. Làm đúng nguyên văn ở đây là **hỏng trang**.

File `public/_headers` cố ý chia làm hai:

```
/media/*     max-age=31536000, immutable   ← đúng: tên file không đổi thì nội dung không đổi
/assets/*    max-age=0, must-revalidate    ← CỐ Ý
```

Vì `style.css` và `nen.js` **không có vân tay nội dung trong tên**. Đặt cache
một năm thì sửa giao diện xong, người đọc cũ vẫn thấy bản cũ suốt một năm —
trừ khi họ tự xoá cache, mà không ai làm thế.

**Việc đúng phải làm** không phải tăng `max-age`, mà là **gắn vân tay vào tên
file** (`style.a3f19c.css`) rồi mới cache dài. Lúc đó sửa CSS thì tên đổi,
trình duyệt tải bản mới ngay, còn bản cũ cache vĩnh viễn cũng không sao. Việc
này nằm trong bộ dựng, không nằm ở bảng điều khiển. Xem `docs/IA.md` §6.0b.

### 8.4 · Đường thoát nếu Gemini chạm hạn ngạch

Hàm `/api/quote` gieo theo NGÀY nên mỗi ngày chỉ có một câu, và cache HTTP của
Cloudflare giữ lại. Nhưng cache ấy **riêng từng trung tâm dữ liệu**, nên thực
tế mỗi ngày gọi vài lần chứ không phải một. Nếu tới lúc con số ấy thành vấn
đề, KV là chỗ đúng để giữ câu trong ngày — đây là công dụng duy nhất của KV ở
trang này.

---

## 9 · Đo lượt xem và tốc độ

### 9.1 · Vì sao Cloudflare Web Analytics, không phải Google Analytics

| | Cloudflare Web Analytics | Google Analytics 4 |
|---|---|---|
| Cookie | **không có** | có |
| Banner xin phép | **không cần** | cần ở EU, và nên có ở mọi nơi |
| Theo dấu sang trang khác | không | có |
| Core Web Vitals của người đọc thật | **có sẵn** | phải nối thêm |
| Nặng thêm | một file ~6 KB, tải sau | ~50 KB, và chạy sớm |
| Giá | miễn phí, không giới hạn | miễn phí tới hạn ngạch |

Với một blog cá nhân, thứ cần biết là *bài nào có người đọc* và *trang có chậm
với người dùng 4G không*. Cả hai đều nằm trong bản miễn phí, mà không phải dựng
banner cookie — banner ấy là thứ đầu tiên người đọc gặp, và nó nói rằng trang
này đang lấy gì đó của họ.

### 9.2 · Bật lên

1. Cloudflare Dashboard → **Web Analytics** → **Add a site** → gõ tên miền.
2. Nó đưa một đoạn mã có `token: "…"`. **Chỉ cần token**, không cần cả đoạn.
3. Dán vào `site.config.json`:

```json
"phanTich": { "bat": true, "token": "dán-token-vào-đây" }
```

4. `npm run kiem` — có một phép kiểm canh đúng chuyện này: bật mà quên token thì
   script vẫn được chèn và lặng lẽ không ghi được lượt nào.

**Token này công khai.** Nó nằm nguyên văn trong HTML mọi trang, ai xem mã nguồn
cũng thấy — nên để trong repo là đúng chỗ. Đây là chỗ **khác hẳn** `GEMINI_KEY`:
khoá ấy không bao giờ được rời khỏi Cloudflare (xem `docs/QUOTE.md`).

> Cloudflare cũng có nút tự chèn đoạn mã này từ dashboard. Đừng dùng cả hai —
> hai đoạn beacon trên một trang thì mỗi lượt xem đếm thành hai.

### 9.3 · Đoán trước trang kế — đã bật sẵn

Mỗi trang có một khối `speculationrules`: trình duyệt tải sẵn trang mà người đọc
có vẻ sắp bấm, nên bấm xong trang hiện gần như tức thì.

Hai lựa chọn có chủ đích trong đó:

- **`prefetch`, không phải `prerender`.** prerender dựng hẳn trang trong nền,
  tức là CHẠY script của trang đó — kể cả beacon đếm lượt xem. Thành ra mỗi link
  người đọc rê chuột qua đều bị tính một lượt, và số liệu thành rác. prefetch
  chỉ tải file về nằm sẵn.
- **`eagerness: moderate`.** Đoán khi người đọc rê chuột vào link, không đoán mọi
  link trong tầm nhìn. Trên trang danh sách 12 bài thì `eager` nghĩa là tải 12
  trang cho một lượt đọc — tốn 4G của người ta để tiết kiệm 200ms của mình.

Tắt bằng `"doanTruoc": false` trong `site.config.json`. Trình duyệt chưa hỗ trợ
thì bỏ qua khối này, không lỗi gì.

Cloudflare có tính năng **Speed Brain** làm việc tương tự ở phía máy chủ. Bật cả
hai không hỏng gì, nhưng cũng không nhanh gấp đôi — chọn một.

### 9.4 · Tốc độ: trang này đã có sẵn những gì

| | Đã có |
|---|---|
| HTML tĩnh, không dựng lại khi có người vào | ✓ |
| Không framework, không dependency | ✓ CSS ~57 KB, JS chia nhỏ theo trang |
| Chú thích CSS cắt khi xuất bản | ✓ 91 KB → 57 KB |
| Ảnh nén lại không mất chất lượng | ✓ `npm run nen` |
| Ảnh khoá sẵn tỉ lệ, chữ không nhảy khi ảnh về | ✓ có phép kiểm canh |
| Cache một năm cho ảnh | ✓ `_headers` |
| Font hệ thống làm lớp dự phòng ngay | ✓ |

Việc chưa làm: **gắn vân tay nội dung vào tên tệp CSS/JS**, để cache chúng dài
như ảnh. Xem §8.3.
