# HƯỚNG DẪN VIẾT & ĐĂNG BÀI

> Mở file này ra mỗi khi đăng bài mới. Ba phần: **làm theo thứ tự** (§1),
> **bảng kiểm trước khi đăng** (§2), **bảng cú pháp** (§3).
>
> Không cần nhớ gì cả — `npm run check` sẽ nhắc lại hết những gì thiếu.

---

## 1 · BỐN BƯỚC ĐĂNG MỘT BÀI

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

### Bước 2 — Viết

Mở file vừa tạo. Ảnh của bài thả vào thư mục ảnh mà bước 1 đã tạo sẵn.

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

### Bước 4 — Đăng

Xoá dòng `draft: true` trong front matter, rồi:

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
| `cover` | `/media/<năm>/<slug>/bia.jpg`, khổ 1600×900 | Link chia sẻ lên Facebook/Zalo ra một ô trắng trơn |
| `coverAlt` | **Tả ảnh**, không phải chú thích ảnh | Người dùng trình đọc màn hình nghe thấy một khoảng lặng |

### 2.3 · Tuỳ chọn

| Field | Dùng khi |
|---|---|
| `slug` | Muốn đường dẫn khác với tiêu đề. Không khai thì lấy tên file (bỏ phần ngày) |
| `updated` | Sửa bài cũ đáng kể — ngày sửa hiện cạnh ngày đăng |
| `draft` | Đang viết dở |
| `pinned` | Ghim bài lên đầu danh sách |
| `lang` | Bài viết bằng thứ tiếng khác `vi` |

### 2.4 · Ba cái bẫy hay vấp

**Tag viết lệch nhau.** `tâm lý` và `tam ly` là **hai tag khác nhau**, gom ra hai
trang riêng. Trước khi gõ tag mới, mở `dist/tags.json` xem đã có tag nào gần
giống chưa. Quy ước: **viết thường, có dấu, số ít** — `sách`, không phải
`Sách` hay `Những cuốn sách`.

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

## 6 · TRA NHANH

```bash
npm run new "Tên bài" <chuyên-mục>    # tạo bài mới
npm run dev                            # xem thử, tự tải lại
npm run check                          # kiểm bài, không ghi file
npm run build                          # dựng ra dist/
npm run clean                          # xoá dist/
```

Bảng màu, bộ chữ, quy ước nút: xem `docs/DESIGN-SYSTEM.md`.
Sơ đồ trang và đường dẫn: xem `docs/IA.md`.
