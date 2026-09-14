# ĐƯA LÊN MẠNG & XEM THỬ

> Ba cách xem trang: **mở file trên máy**, **xem qua WiFi từ điện thoại**, và
> **đưa lên mạng thật**. Phần cuối giải thích vì sao Vercel hay báo 404 ở lần
> đầu, và sửa thế nào.

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

## 3 · Đưa lên mạng thật — Vercel

### 3.1 · Vì sao lần đầu hay ra 404

Vercel không tự biết trang web nằm ở `dist/`. Khi không nhận ra framework nào,
nó dùng preset **"Other"**, và preset đó **mặc định lấy thư mục `public/`** làm
nơi chứa trang — nếu thư mục đó tồn tại.

Repo này **có** `public/`, nhưng trong đó chỉ có ảnh, không có `index.html`.
Nên Vercel dựng xong, đi lấy `public/`, không thấy trang chủ, và trả về 404.

### 3.2 · Cách sửa — đã có sẵn `vercel.json`

File `vercel.json` ở gốc repo nói rõ cho Vercel biết:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Chỉ cần file này có mặt trong repo là Vercel làm đúng.** Không phải cài gì
trong giao diện Vercel cả.

Nếu anh đã lỡ import project trước khi có file này, vào
**Project → Settings → General**, xoá mọi giá trị đã gõ tay ở *Build Command*
và *Output Directory* (để trống, nút Override tắt) rồi **Deployments → … →
Redeploy**. Giá trị gõ tay trong giao diện **thắng** `vercel.json`, nên còn sót
là còn sai.

### 3.3 · Nếu Vercel không thấy repo trong danh sách

Đây là chuyện quyền, không phải chuyện mã:

1. Vào [vercel.com/new](https://vercel.com/new)
2. Ở khung chọn repo, bấm **Adjust GitHub App Permissions** (hoặc
   **Configure GitHub App**)
3. Chọn **All repositories**, hoặc thêm riêng `zoey-in-borderland` vào danh sách
4. Lưu, quay lại Vercel, danh sách repo sẽ có nó

Repo tạo **sau** lúc nối Vercel với GitHub thì gần như chắc chắn rơi vào trường
hợp này — Vercel chỉ thấy những repo đã được cấp quyền tại thời điểm cài.

### 3.4 · Sau khi deploy xong

Sửa `site.config.json`, đổi `url` thành địa chỉ thật Vercel cấp:

```json
"url": "https://zoey-in-borderland.vercel.app"
```

Không đổi thì thẻ canonical, ảnh chia sẻ lên Facebook và sitemap đều trỏ sai.
`npm run kiem` sẽ nhắc việc này.

---

## 4 · Các chỗ khác

| Nơi | Build Command | Output |
|---|---|---|
| **Netlify** | `npm run build` | `dist` |
| **Cloudflare Pages** | `npm run build` | `dist` |
| **GitHub Pages** | đẩy riêng `dist/` lên nhánh `gh-pages` | — |
| **Máy chủ riêng** | `rsync -a dist/ may-chu:/var/www/blog/` | — |

:::warn GitHub Pages dạng user.github.io/ten-repo
Phải đặt `"base": "/zoey-in-borderland"` trong `site.config.json`. Để rỗng thì
mọi đường dẫn CSS và ảnh trỏ về gốc tên miền — trang ra trắng trơn.
Vercel và Netlify chạy ở gốc tên miền nên **để `base` rỗng**.
:::

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
| Vercel deploy xong ra **404** | Thiếu `vercel.json`, hoặc Output Directory gõ tay trong Settings đang đè lên nó |
| Trang lên nhưng **trắng trơn, không màu mè** | Deploy lên GitHub Pages mà chưa đặt `base`; hoặc đang mở bằng `file://` |
| Vercel **không thấy repo** | Chưa cấp quyền cho GitHub App — xem §3.3 |
| Ảnh chia sẻ Facebook ra **ô trắng** | `url` trong `site.config.json` còn là địa chỉ tạm |
| Điện thoại **không vào được** `192.168.x.x` | Khác WiFi, `npm run dev` đã tắt, hoặc tường lửa chặn cổng 4321 |
| Build trên Vercel **hỏng** | Xem log — thường là Node dưới 18. Vercel Settings → Node.js Version → 20.x |

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

`public/og.png` (1200×630) là ảnh dùng cho trang chủ và cho bài không khai
`cover`. Đây là ảnh nền chuyển màu, không có chữ — thay được bằng bất kỳ ảnh
nào cùng khổ, chỉ cần ghi đè file đó.
