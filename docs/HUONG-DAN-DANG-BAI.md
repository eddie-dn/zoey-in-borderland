# HƯỚNG DẪN VIẾT & ĐĂNG BÀI

> Mở file này ra mỗi khi đăng bài mới. Ba phần: **làm theo thứ tự** (§1),
> **bảng kiểm trước khi đăng** (§2), **bảng cú pháp** (§3).
>
> Không cần nhớ gì cả — `npm run check` và `npm run kiem` sẽ nhắc lại hết
> những gì thiếu.

---

## 1 · NĂM BƯỚC ĐĂNG MỘT BÀI

### Bước 1 — Tạo khung bài

```bash
npm run new "Tên bài viết của mình"
```

Muốn bài nằm trong một chuyên mục thì thêm tên thư mục vào sau:

```bash
npm run new "Tên bài"  tam-ly                 # → /posts/tam-ly/ten-bai/
npm run new "Tên bài"  doi-thuong/ha-noi      # → /posts/doi-thuong/ha-noi/ten-bai/
npm run new "Tên bài"  tam-ly --tags "jung, ghi chép"
```

Chuyên mục chưa có thì **gõ tên mới là nó tự tạo** — không phải khai báo ở đâu cả.

Lệnh này làm ba việc: tạo file `.md` đặt đúng chỗ, đặt tên file theo dạng
`YYYY-MM-DD-slug` để thư mục tự sắp theo ngày, và tạo sẵn thư mục ảnh riêng cho
bài đó trong `public/media/<năm>/<slug>/`.

### Bước 2 — Viết, và đưa ảnh vào

Mở file vừa tạo.

> **Viết ở `/z-admin/` thì không cần bước nào trong mục này.** Kéo thẳng tấm
> ảnh vào khung soạn thảo, hoặc chụp màn hình rồi `⌘V`, hoặc bấm nút ảnh. Trình
> duyệt tự thu nhỏ còn 1800px, đổi sang WebP, xếp vào
> `public/media/<năm>/<slug-bài>/` và dán sẵn dòng Markdown. Ảnh bìa cũng thả
> vào ô **Cover image** ngay trên khung gõ.
>
> Phần dưới đây là đường của người ngồi gõ file `.md` ở máy.

**Ảnh thì không phải tự đi copy vào đúng thư mục.** Quăng hết vào `_anh/` ở gốc
dự án — tên gì cũng được, tiếng Việt có dấu cũng được — rồi chạy:

```bash
npm run anh <slug-bài>          # chuyển ảnh vào bài
npm run anh <slug-bài> --bia    # kèm đặt luôn ảnh ngang đầu tiên làm bìa
npm run anh                      # xem bài nào đang có ảnh gì
```

Lệnh đó làm năm việc:

1. Đổi tên cho sạch — `Ảnh chụp Màn hình 2026-09-14 lúc 10.23.45.png` thành
   `anh-chup-man-hinh-2026-09-14-luc-10-23-45.png`. Tên có dấu và khoảng trắng
   sang URL là một chuỗi `%20%C3%A1` dài loằng ngoằng, vài máy chủ còn từ chối hẳn.
2. Xếp vào `public/media/<năm>/<slug-bài>/`.
3. Đo kích thước thật, tính tỉ lệ.
4. **Cảnh báo ảnh nặng** trên 400 KB, kèm chỗ nén.
5. **In sẵn dòng Markdown để dán vào bài** — có sẵn `{.wide}` nếu ảnh ngang.

`_anh/` nằm trong `.gitignore`, nên ảnh chưa dùng không lọt lên git.

Vừa viết vừa xem:

```bash
npm run dev        # rồi mở http://localhost:4321
```

Lưu file là trang tự tải lại. Cứ để cửa sổ đó mở suốt lúc viết.

### Bước 3 — Kiểm

```bash
npm run check
```

- **Lỗi đỏ** → bài không dựng được, phải sửa.
- **Cảnh báo vàng** → bài vẫn ra, nhưng thiếu thứ nên có. Đọc §2 rồi tự quyết.

### Bước 4 — Kiểm định trước khi đăng

```bash
npm run kiem
```

`check` ở bước 3 chỉ soi file `.md` nguồn. `kiem` soi **HTML đã dựng xong** —
đúng thứ người đọc nhận được. Nó bắt những thứ file nguồn không lộ ra: link nội
bộ gãy, ảnh mồ côi, tag viết lệch nhau, bản nháp lọt vào RSS, thẻ meta thiếu.

### Bước 5 — Đăng

> **Không mở máy cũng đăng được.** Vào `/z-admin/`, đăng nhập một lần, sang
> ngăn **Post**. Ô soạn thảo ở đó gõ như gõ văn bản thường — bôi đen rồi bấm
> nút, không phải nhớ cú pháp — và lúc bấm Đăng nó tự đổi ra Markdown rồi ghi
> thẳng một file `.md` vào kho mã. Bấm nút `i` trên thanh nút để xem cách
> dùng, bấm `</>` để xem đúng đoạn Markdown sắp gửi đi.
>
> Bài gõ ở đó **tự lưu nháp trên máy**, nên đóng nhầm tab vẫn còn. Nhưng nó
> chỉ **tạo bài mới**, không sửa được bài cũ — sửa thì vẫn phải mở file ra.
>
> Đăng xong đợi khoảng một phút: Cloudflare phải dựng lại trang.

Phần dưới đây là đường **gõ tay ở máy**.

Xoá dòng `draft: true` trong front matter. Nếu lần này có sửa giao diện hay
công cụ thì ghi một dòng vào sổ phiên bản:

```bash
npm run ver -- "thêm bài · chỉnh khung ảnh"
```

Rồi:

```bash
npm run build
git add -A && git commit -m "bài: tên bài" && git push
```

> **`draft: true` làm gì.** Bài nháp **vẫn dựng ra file** để xem thử, nhưng không
> lên trang chủ, không vào RSS, không vào sitemap, và được gắn `noindex` để
> Google không đánh chỉ mục. Nghĩa là viết dở vẫn commit được mà không sợ lộ.

---

## 2 · BẢNG KIỂM — MỘT BÀI ĐĂNG CẦN GÌ

### 2.1 · Bắt buộc — thiếu là build dừng

| Field | Ghi thế nào | Vì sao bắt buộc |
|---|---|---|
| `title` | Câu hoàn chỉnh, viết hoa đầu câu | Là thẻ `<h1>`, là tiêu đề trên Google, là tên trên link chia sẻ |
| `date` | `YYYY-MM-DD` | Quyết định thứ tự bài và nội dung RSS |

### 2.2 · Nên có — thiếu thì cảnh báo vàng

| Field | Ghi thế nào | Thiếu thì sao |
|---|---|---|
| `summary` | **Một câu hoàn chỉnh**, ≤ 160 ký tự | Máy tự cắt 170 chữ đầu bài — thường ra một câu dở dang trên Facebook |
| `tags` | 2–5 tag, **viết có dấu, viết thường** | Bài không xuất hiện ở bất kỳ trang tag nào, sau này gần như không tìm lại được |
| `cover` | `/media/<năm>/<slug>/bia.jpg` hoặc `.png`, khổ 1600×900 — **đừng dùng `.svg`** | Link chia sẻ lên Facebook/Zalo ra một ô trắng trơn |
| `coverAlt` | **Tả ảnh**, không phải chú thích ảnh | Người dùng trình đọc màn hình nghe thấy một khoảng lặng |

### 2.3 · Tuỳ chọn

| Field | Dùng khi |
|---|---|
| `khung` | Chọn khung trình bày: `A` (mặc định), `B` hoặc `C` — xem §2.4 |
| `slug` | Muốn đường dẫn khác với tiêu đề. Không khai thì lấy tên file (bỏ phần ngày) |
| `updated` | Sửa bài cũ đáng kể — ngày sửa hiện cạnh ngày đăng |
| `draft` | Đang viết dở |
| `pinned` | Ghim bài lên đầu danh sách |
| `lang` | Bài viết bằng thứ tiếng khác `vi` |

### 2.4 · Ba khung trình bày — chọn khung nào

Khai `khung: A`, `B` hoặc `C` trong front matter. Không khai thì dùng A.
Cả ba tự về một cột ở màn dưới 1080px.

| | Dáng | Hợp với | Ký tự/dòng |
|---|---|---|---|
| **A** | cột đọc + mục lục dính bên phải | bài phân tích nhiều mục, bài hướng dẫn | 71 |
| **B** | ảnh bìa tràn hết màn, tiêu đề căn giữa, không cột phụ | bài kể chuyện, bài nhiều ảnh, bài ngắn | 74 |
| **C** | băng ảnh dính bên trái, chữ bên phải | vài tấm ảnh kỉ niệm + mấy dòng tản mạn — xem §6b | 66 |

**A** là mặc định vì hợp với đa số bài. Đổi sang **B** khi bài có ảnh bìa đẹp và
ít mục — mục lục lúc đó chỉ tổ chiếm chỗ. **C** là khung ngắn: nó không có mục
lục, và nếu bài dài hơn một màn thì bạn đang cần khung A chứ không phải C.

:::tip Thử trước khi chốt
Đổi một chữ trong front matter rồi `npm run dev` là thấy ngay. Không phải sửa
template gì cả — cả ba khung dùng chung một HTML, chỉ khác cách xếp.
:::

### 2.5 · Ba cái bẫy hay vấp

**Tag viết lệch nhau.** `tâm lý` và `tam ly` là **hai tag khác nhau**, gom ra hai
trang riêng. Trước khi gõ tag mới, mở `dist/tags.json` xem đã có tag nào gần
giống chưa. Quy ước: **viết thường, có dấu, số ít** — `sách`, không phải
`Sách` hay `Những cuốn sách`.

**Ảnh bìa để định dạng `.svg`.** Trang vẫn hiện đẹp, nhưng Facebook, Zalo và
Twitter **không đọc được SVG** làm ảnh chia sẻ — link gửi đi ra một ô trắng, và
thường chỉ phát hiện sau khi đã gửi cho ai đó rồi. Bìa dùng `.jpg` hoặc `.png`.
`npm run kiem` bắt lỗi này.

**Ảnh quên chữ alt.** `![](anh.jpg)` thì build cảnh báo ngay. Alt là **tả ảnh cho
người không nhìn thấy nó**, khác với chú thích — chú thích là phần trong dấu
nháy kép đứng sau đường dẫn.

**Hai bài trùng slug.** Hai bài cùng tiêu đề trong cùng chuyên mục sẽ ra cùng một
đường dẫn, và bài sau ghi đè bài trước. Build **bắt lỗi này và dừng hẳn** — lúc
đó khai `slug` khác cho một trong hai bài.

---

## 3 · BẢNG CÚ PHÁP

Markdown ở đây là **một tập con** có chọn lọc, không phải bản đầy đủ. Những gì
không nằm trong bảng này thì không dùng được.

### 3.1 · Chữ

| Gõ | Ra |
|---|---|
| `**đậm**` | **đậm** |
| `*nghiêng*` hoặc `_nghiêng_` | *nghiêng* |
| `~~gạch ngang~~` | ~~gạch ngang~~ |
| `==tô sáng==` | chữ được tô nền tím nhạt |
| `` `mã` `` | `mã` |
| `[chữ](https://...)` | link — link ra ngoài tự có mũi tên ↗ và tự mở tab mới |
| Hai dấu cách cuối dòng | xuống dòng mà không sang đoạn mới |
| `{tím: chữ}` | chữ đổi màu — xem bảng màu ngay dưới |
| `m^2^` | chỉ số trên — m² |
| `H~2~O` | chỉ số dưới — H₂O |
| `[[⌘K]]` | một phím, vẽ ra như phím bấm thật |
| `\*` `\[` `` \` `` `\{` `\^` `\~` | in ra đúng ký tự ấy, không coi là cú pháp |

Ba dòng giữa **không cho khoảng trắng bên trong**: `^2^` được, `^hai chữ^` thì
không. Chỉ số và tên phím vốn là mẩu ngắn dính liền, và nới ra thì một câu có
hai dấu mũ cách nhau nửa dòng lập tức bị nuốt vào giữa.

`~~gạch ngang~~` và `~dưới~` không đụng nhau — cặp dấu ngã đôi luôn thắng.

### 3.1b · Lớp của cả đoạn

Gõ ở **cuối đoạn**, sau dấu cách:

| Gõ | Ra |
|---|---|
| `{.nho}` | cả đoạn thành chữ nhỏ, màu nhạt — cho ghi chú bên lề, dòng nguồn |
| `{.giua}` | cả đoạn căn giữa, cột hẹp lại — cho một câu đứng riêng |
| `{.thuong}` | tắt cỡ chữ lớn ở đoạn ĐẦU bài (mặc định đoạn đầu là sapo) |

Ba cái này cũng có nút trong ô soạn thảo ở `/z-admin/` — bảng **Blocks**.

**Tám tên màu**, gõ có dấu hay không dấu đều được (`{tim: …}` = `{tím: …}`):

`tím` · `hồng` · `đỏ` · `cam` · `vàng` · `lục` · `lam` · `xám`

Màu thật khai ở `src/styles/tokens.css` và **có bản riêng cho từng theme**, nên
một bài tô màu hồi theme Sakura vẫn đọc được khi người đọc bật Galaxy. Đừng gõ
mã màu thẳng (`<span style="color:#f00">`): bộ dựng thoát hết HTML viết trong
dòng, nên nó hiện ra thành chữ trần.

> Một bài dùng quá **ba** màu là bài hết nhấn mạnh được gì — nó chỉ còn ồn.

**Đoạn đầu tiên của bài tự thành sapo** — chữ to hơn, màu nhạt hơn. Không muốn
thì thêm `{.thuong}` vào cuối đoạn đó.

### 3.2 · Cấu trúc

```markdown
## Tiêu đề cấp 2        ← vào mục lục
### Tiêu đề cấp 3       ← vào mục lục
#### Tiêu đề cấp 4      ← không vào mục lục

- gạch đầu dòng
  - lồng vào trong
1. đánh số

- [x] việc đã xong
- [ ] việc chưa xong

> Câu trích dẫn.

---                     ← vạch ngang ✦ ✦ ✦

| Cột A | Cột B |
|---|---:|             ← `---:` căn phải, `:---:` căn giữa
| 1 | 2 |
```

Mục lục tự sinh từ `##` và `###`. **Bài dưới 2 mục thì không có mục lục** — bài
ngắn không cần bản đồ.

### 3.3 · Ảnh

```markdown
![tả ảnh](/media/2026/ten-bai/anh.jpg)                          ← vừa cột chữ
![tả ảnh](/media/2026/ten-bai/anh.jpg "Chú thích"){.wide}       ← rộng hơn cột chữ
![tả ảnh](/media/2026/ten-bai/anh.jpg){.full}                   ← tràn hết màn hình
![tả ảnh](/media/2026/ten-bai/so-do.png){.plain}                ← không cắt xén, không nền
```

Xếp nhiều ảnh cạnh nhau:

```markdown
:::gallery wide
![ảnh một](/media/2026/ten-bai/1.jpg)
![ảnh hai](/media/2026/ten-bai/2.jpg)
:::
```

**Đừng copy ảnh bằng tay.** Hai đường, chọn một:

- **Ở `/z-admin/`** — kéo tấm ảnh vào khung soạn thảo, hoặc `⌘V` sau khi chụp
  màn hình, hoặc bấm nút ảnh. Bấm đúp vào tấm ảnh đã chèn để gõ dòng tả.
- **Ở máy** — `npm run anh <slug-bài>` (xem §1 Bước 2): đổi tên, xếp đúng chỗ
  và in sẵn dòng chèn.

Cả hai đều xếp vào `public/media/<năm>/<slug-bài>/` và đều cảnh báo ảnh nặng.

**Ba điều build tự lo, không phải gõ:**

1. **Tỉ lệ ảnh** — build đọc kích thước thật từ file rồi khoá sẵn chỗ. Nhờ vậy
   ảnh chưa tải xong cũng không làm chữ phía dưới nhảy. Đây là lý do đường dẫn
   ảnh **phải bắt đầu bằng `/`** (tính từ `public/`), không phải đường dẫn tương đối.
2. **Tải trễ** — ảnh dưới màn hình chỉ tải khi cuộn tới. Riêng ảnh bìa thì tải ngay.
3. **Ảnh gãy link** — build cảnh báo ngay lúc dựng, không để ra ô ảnh vỡ.

:::tip Chỗ để ảnh
Mỗi bài một thư mục riêng: `public/media/<năm>/<slug-bài>/`. Sau này xoá bài là
xoá gọn cả ảnh, không còn ảnh mồ côi nằm lại.
:::

### 3.4 · Video

```markdown
@youtube[ID_VIDEO](Chú thích){.wide}
@video[/media/2026/ten-bai/clip.mp4](Chú thích){.full poster=/media/2026/ten-bai/bia.jpg}
```

`ID_VIDEO` là đoạn sau `v=` trong link YouTube.

> **Video YouTube chỉ tải khi bấm play.** Mở bài ra thì chỉ có ảnh bìa — không
> script nào của Google chạy, không cookie theo dõi nào được đặt lên người đọc.
> Bấm play rồi mới nhúng thật.

Video tự chứa (`.mp4`, `.webm`) thì chỉ tải phần đầu để vẽ thanh tua, không tải
cả file lúc mở trang.

### 3.4b · Thẻ chia sẻ khi dán link

Tiêu đề, tóm tắt và **ảnh bìa** là ba thứ hiện ra trong ô xem trước khi dán
link vào Messenger, Facebook hay Zalo. Bảng **Search & sharing** ở `/z-admin/`
đo cả ba ngay lúc gõ.

Dán link mà ra một ô trắng thì **thường không phải lỗi của trang** — mấy ứng
dụng ấy nhớ kết quả quét cũ hàng tuần. Cách bắt quét lại, và chỗ kiểm xem trang
đang trả về gì: `docs/SEO.md`.

### 3.5 · Khung nhấn

```markdown
:::note Nhãn tuỳ chọn
Nội dung.
:::
```

| Khối | Màu | Dùng khi |
|---|---|---|
| `:::note` | tím | thông tin thêm, đọc thêm |
| `:::tip` | xanh | mẹo, cách làm nhanh hơn |
| `:::warn` | vàng | điều cần biết trước khi làm |
| `:::stop` | đỏ | điều **đừng** làm |

Không ghi nhãn thì lấy nhãn mặc định (`Ghi chú` · `Mẹo` · `Lưu ý` · `Đừng làm`).

### 3.6 · Khối mã

````markdown
```javascript
const x = 1;
```
````

Tên ngôn ngữ hiện ở góc khối. Người đọc có nút **Chép** ở góc phải.

### 3.7 · Chú thích cho riêng mình

```markdown
<!-- Chỗ này cần kiểm lại số liệu -->
```

Chú thích `<!-- -->` **bị bỏ hẳn khi dựng**, không lọt ra HTML. Ghi chú riêng
viết thoải mái, bạn đọc bấm "Xem mã nguồn" cũng không thấy.

---

## 4 · THÊM CHUYÊN MỤC

Chuyên mục **chính là thư mục**. Tạo thư mục trong `content/posts/` là xong:

```
content/posts/
├── tam-ly/                    → /posts/tam-ly/
│   └── 2026-09-14-bai.md      → /posts/tam-ly/bai/
└── doi-thuong/
    └── ha-noi/                → /posts/doi-thuong/ha-noi/
        └── 2026-08-02-bai.md  → /posts/doi-thuong/ha-noi/bai/
```

Tên thư mục phải **không dấu, dùng gạch nối** (`tam-ly`), vì nó đi thẳng vào URL.
Muốn tên hiển thị có dấu thì thêm `_muc.json` vào chính thư mục đó:

```json
{
  "title": "Tâm lý",
  "description": "Một dòng mô tả chuyên mục"
}
```

Không có file đó thì tên thư mục được dùng luôn làm tên hiển thị.

**Thư mục và file mở đầu bằng `_` không được quét.** Dùng dấu gạch dưới để cất
bài nháp hoặc file ghi chú mà không sợ nó bị đăng.

---

## 5 · KHI CÓ CHUYỆN

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| `không tìm thấy khối front matter` | Có dòng trống hoặc khoảng trắng phía trên dấu `---` đầu file |
| `hai bài cùng đường dẫn` | Hai bài trùng slug trong cùng chuyên mục → khai `slug` khác cho một bài |
| `ảnh không tồn tại` | Sai đường dẫn, hoặc quên dấu `/` ở đầu, hoặc sai chữ hoa/thường trong tên file |
| Ảnh hiện nhưng chữ dưới ảnh nhảy | Ảnh nằm ngoài `public/` nên build không đo được tỉ lệ |
| Bài không lên trang chủ | Còn `draft: true` |
| Sửa xong mà trang không đổi | `npm run dev` chưa chạy, hoặc đang xem file trong `dist/` cũ |

---

## 6 · SỬA TRANG GIỚI THIỆU

Mọi chữ trên trang `/about/` nằm ở **một file duy nhất**:
`content/pages/about.md`. Không phải sửa mã, không phải đụng vào CSS.

File có hai phần. Phần trên giữa hai dòng `---` là **front matter** — mỗi dòng
điền vào một ô trên trang. Phần dưới là **thân bài**, viết Markdown như một bài
thường.

### 6.1 · Field nào hiện ở đâu

| Field | Hiện ở đâu trên trang |
|---|---|
| `title` | tiêu đề lớn trong ô giới thiệu |
| `gioiThieu` | câu mở, ngay dưới tiêu đề. Viết một dòng, hoặc một danh sách gạch đầu dòng — mỗi gạch là một đoạn |
| `anh` · `anhAlt` | ô ảnh chân dung bên trái |
| `viTri` | ô số `BASED IN` |
| `tuNam` | ô số `WRITING SINCE` |
| `nghe` | dòng nghiêng ở đáy ô `LATELY` |
| `dangLam` | danh sách trong ô `LATELY` |
| `lienHe` | danh sách trong ô `FIND ME` |
| phần dưới `---` | khối chữ dài bên dưới lưới |

**`POSTS` và `TOPICS` không khai ở đâu cả** — máy tự đếm mỗi lần build: số bài
công khai, và số tag khác nhau. Viết thêm bài là hai con số đó tự lên.

### 6.2 · Khuôn `Nhãn · Nội dung`

`dangLam` và `lienHe` dùng dấu chấm giữa `·` để tách nhãn khỏi nội dung:

```yaml
dangLam:
  - Đọc · Sách Đỏ, bản in màu
  - Học · dựng trang web không cần framework

lienHe:
  - Email · zoey@borderland.in
  - Instagram · @zoeyinborderland
```

Không có dấu `·` thì cả dòng là nội dung, nhãn để trống — vẫn hiện được.

Dòng nào có nhãn chứa chữ "mail" và nội dung có `@` thì tự thành link `mailto:`.
Dòng nào bắt đầu bằng `http` thì tự thành link.

### 6.3 · Ảnh chân dung

```yaml
anh: /media/chan-dung.png
anhAlt: Ảnh chân dung
```

Bỏ ảnh vào `public/media/`, đường dẫn tính **từ `public/`** (nên bắt đầu bằng
`/media/`).

Có ảnh thì hàng đầu chia hai: ảnh 2 cột · giới thiệu 4 cột. Không có ảnh thì
ô giới thiệu chiếm trọn 6 cột. Cả hai đường đều kín lưới, không để lỗ hổng.

(Ô trích dẫn mỗi ngày từng nằm ở hàng này, chiếm hai cột bên phải. Nó đã
chuyển ra màn đầu trang chủ — xem `docs/DESIGN-SYSTEM.md` §16.3.)

Ảnh dọc hay ngang đều được: nó phủ kín ô bằng `object-fit:cover`, không kéo
giãn, không để băng trống. Ảnh chân dung thì căn ở 38% chiều cao chứ không phải
giữa — căn giữa thì cắt mất trán trước khi cắt tới cằm.

### 6.4 · Hai khung

Dòng `khung:` trong front matter đổi cả cách bày trang, cùng một nội dung:

| `khung:` | Ra cái gì |
|---|---|
| `bento` | lưới ô kính, đọc lướt được ngay như tấm danh thiếp |
| `chuong` | các chương chữ lớn, hiện dần khi cuộn — yên hơn, giống một bài viết |

### 6.5 · Chữ trên giao diện thì sao

`BASED IN`, `LATELY`, `FIND ME`, `AUTHOR`, `Reply`… — mấy chữ đó **không nằm ở
đây**. Chúng ở bảng `NHAN` đầu file `tools/build.mjs`, và đều là tiếng Anh.

Cố ý tách như vậy: nội dung tiếng Việt do bạn gõ, phần khung tiếng Anh cho đồng
bộ. Nửa nọ nửa kia thì mỗi khối một giọng, đọc rất chắp vá.

Muốn đổi thì mở `tools/build.mjs`, sửa trong bảng đó — một chỗ, mọi trang đổi
theo.

### 6.6 · Thêm trang tĩnh khác

Bỏ một file `.md` mới vào `content/pages/`. Tên file thành đường dẫn:
`content/pages/lien-he.md` → `/lien-he/`.

Nhớ thêm vào `nav` trong `site.config.json` nếu muốn nó lên thanh menu, và bỏ
đường dẫn đó khỏi `chuaDung` nếu nó đang nằm trong danh sách "chưa dựng".

---

## 6b · KHUNG C — BÀI ẢNH NGẮN

Vài tấm ảnh kỉ niệm, mấy dòng tản mạn. Không phải bài đọc dài — bài đọc dài thì
dùng khung A như bình thường.

```yaml
---
title: Thứ bảy, không có gì
date: 2026-09-15
khung: C
summary: Một buổi sáng không có việc gì phải làm.
tags:
  - tản mạn
anh:
  - /media/2026/thu-bay/1.jpg | Cái ghế ngoài ban công, chín giờ sáng
  - /media/2026/thu-bay/2.jpg | Ly trà nguội từ lúc nào không hay
  - https://i.imgur.com/abc.jpg
---

Sáng thứ bảy, không hẹn ai, không phải đi đâu.
```

| Chỗ | Ghi gì |
|---|---|
| `khung: C` | bắt buộc, không có dòng này thì ra khung đọc dài |
| `anh:` | mỗi dòng một tấm: `- <đường dẫn> \| <chú thích>` |
| chú thích | không bắt buộc — bỏ luôn cả dấu `\|` nếu không cần |
| đường dẫn | ảnh trong `public/media/`, **hoặc** địa chỉ `https://` ngoài |

#### Khung ảnh lấy tỉ lệ theo tấm ĐẦU TIÊN

Cả băng dùng chung một khung, và khung ấy lấy tỉ lệ của tấm đầu — đúng cách
Instagram và Facebook làm. Mỗi tấm một khung thì cả khối cao thấp nhảy loạn mỗi
lần trượt, chú thích và hàng chấm chạy theo, mắt mất điểm tựa.

Tỉ lệ bị **kẹp** trong khoảng hai nền tảng ấy cho phép:

| | Tỉ lệ | Cỡ hay dùng |
|---|---|---|
| dọc nhất | 4:5 | 1080×1350 |
| vuông | 1:1 | 1080×1080 |
| ngang nhất | 1.91:1 | 1080×566 |

Tấm đầu dọc hơn 4:5 (ảnh chụp dọc bằng điện thoại chẳng hạn) thì khung lấy 4:5.
Ngang hơn 1.91:1 thì lấy 1.91:1. Ảnh nào lệch khỏi khung vẫn vào **trọn** — hai
bên có dải nền, chứ không bị xén. Đo không ra tỉ lệ (ảnh ở địa chỉ ngoài) thì
khung về 4:5.

Muốn khung dọc thì để một tấm dọc lên đầu. Đơn giản vậy thôi.

#### Chưa có ảnh thật thì sinh tạm

```bash
npm run bia -- <slug> --doc
```

Sinh ảnh dọc 1080×1350 cho đúng số dòng trong `anh:`, đặt vào
`public/media/<năm>/<slug>/anh-1.png`, `anh-2.png`… Hạt giống lấy theo **chú
thích** từng dòng nên mỗi tấm ra một hình khác nhau, và cùng một chú thích thì
luôn ra cùng một tấm. Thêm `--de` để ghi đè ảnh đã có.
| `cover:` | vẫn khai như thường — nó là ảnh trên thẻ bài và ảnh khi chia sẻ link, **không** in vào thân bài ở khung C |

**Hai đến bốn tấm là vừa.** Một tấm thì không cần băng ảnh (đặt thẳng vào thân
bài); quá năm tấm thì người đọc vuốt mỏi tay mà không biết còn bao nhiêu.

**Không cần tiêu đề mục.** Khung C không có mục lục — bài ngắn thì mục lục là
thừa, và cột bên phải đã dành cho chữ.

**Ảnh up ở chỗ khác cũng được.** Dán thẳng địa chỉ. Đổi lại: hôm nào chỗ ấy sập
hoặc đổi đường dẫn thì ảnh mất, mà mình không biết — ảnh trong `public/media/`
thì nằm cùng repo, không bao giờ mất.

---

## 7 · NHẬP BÀI CŨ TỪ BLOG KHÁC

Có bản xuất WordPress (hoặc bất kỳ `.md` nào có front matter khác)?

```bash
npm run nhap -- bai-1.md bai-2.md      # vài file
npm run nhap -- ~/wordpress-export/    # cả thư mục
```

Nó đổi những thứ này:

| Bản xuất WordPress | Thành |
|---|---|
| `date: "2017-04-04 12:43:26"` | `date: 2017-04-04` |
| `categories: ["Review Sách"]` | thư mục `content/posts/review-sach/`, tự lập `_muc.json` |
| `status: "publish"` | tag `published` |
| (không có) | `updated:` = ngày đưa về đây |
| `# Tiêu đề` trùng front matter | bỏ — bộ dựng đã in tiêu đề rồi, để lại là trang có hai thẻ `h1` |
| `original_url`, `source`, `author` | bỏ |

**Thân bài giữ nguyên văn**, kể cả lỗi chính tả và emoji. Bài cũ là bài cũ;
sửa lại là làm giả lịch sử.

### 7.1 · Ba việc phải làm bằng tay sau khi nhập

**Tỉa tag.** Tag WordPress là kiểu rải từ khoá cho máy tìm kiếm — một bài có
thể mang mười bốn tag, trong đó bốn cái cùng một ý. Ở đây **mỗi tag sinh một
trang**, nên giữ nguyên là được mười bốn trang mỗi trang đúng một bài, và trang
`/tags/` loãng hẳn. Tỉa còn bốn–năm cái thật sự gom được bài với nhau.

**Sinh ảnh bìa.**

```bash
npm run bia -- --tat-ca      # mọi bài đang thiếu ảnh bìa
npm run bia -- <slug>        # một bài
```

Ảnh sinh ra từ chính tiêu đề nên cùng một tiêu đề luôn ra cùng một ảnh. Công cụ
in sẵn hai dòng `cover:` và `coverAlt:` để dán vào front matter — **phải dán
vào**, nó không tự sửa file bài.

**Tiêu đề quá dài.** Google cắt tiêu đề ở khoảng 60 ký tự, mà phần bị cắt là
phần đuôi — tức tên blog. Bài nào tiêu đề dài thì khai thêm:

```yaml
titleNgan: Tarot for Dummies — 10 điều ai cũng nhầm
```

`titleNgan` dùng cho hai chỗ: dòng tiêu đề một hàng ở màn đầu trang chủ, và
thẻ tiêu đề gửi cho Google khi tiêu đề đầy đủ quá dài. Tiêu đề in trên chính
trang bài thì **luôn giữ nguyên bản đầy đủ**.

---

## 8 · TRA NHANH

```bash
npm run new "Tên bài" <chuyên-mục>    # tạo bài mới
npm run nhap -- <file.md ...>          # nhập bài cũ từ bản xuất WordPress
npm run anh <slug-bài>                 # đưa ảnh từ _anh/ vào bài
npm run bia -- --tat-ca                # sinh ảnh bìa cho mọi bài còn thiếu
npm run nen                            # nén lại mọi PNG, không mất chất lượng
npm run dev                            # xem thử, tự tải lại
npm run check                          # kiểm file .md nguồn
npm run kiem                           # KIỂM ĐỊNH dist/ trước khi đăng
npm run build                          # dựng ra dist/
npm run ver                            # xem sổ phiên bản
npm run ver -- "mô tả"                 # ghi một bản vá vào sổ
npm run ver -- --lon "mô tả"           # mở một build mới
npm run clean                          # xoá dist/
```

Khung bình luận: `docs/BINH-LUAN.md`.
Bảng màu, bộ chữ, quy ước nút: `docs/DESIGN-SYSTEM.md`.
Sơ đồ trang và đường dẫn: `docs/IA.md`.
Lịch sử phiên bản: `docs/LICH-SU.md`.
