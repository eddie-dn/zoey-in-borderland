# DESIGN SYSTEM — BLOG

> **Kế thừa từ đâu.** Bảng màu, bộ chữ và mấy quy ước nút bấm ở đây lấy nguyên
> từ `HAN-961030-A` (theme Sakura) và `HAN-961030-B` (theme Galaxy). Blog không
> đẻ ra bảng màu mới — nó là **cùng một trang**, chỉ khác việc: bên kia để chơi,
> bên này để **đọc bài dài**.
>
> Vì để đọc bài dài, có ba chỗ buộc phải khác, ghi rõ ở §2.4.
>
> **Bộ liquid glass** thêm ở V1.00 — xem §2b.

---

## 1 · HAI THEME

| | Sakura (mặc định) | Galaxy |
|---|---|---|
| Nền | `#FAF6FD` + ba quầng pastel | `#120C22` → `#2B1E4C` ở giữa |
| Chữ chính | `#3E2F56` tím mực | `#F6EFFB` |
| Nhấn (trang trí) | `#E3AADD` | `#E3AADD` |
| Nhấn (chữ đọc được) | `#7A52B8` | `#EFC2E9` |

Người đọc bấm nút ở góc phải header để đổi; lựa chọn được nhớ lại.

### 1.1 · Ba trạng thái, phải viết đủ cả ba

```css
:root{ … }                                    /* 1. SÁNG — khai ĐỦ mọi biến */
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){ … }        /* 2. máy để tối, chưa ai chọn  */
}
:root[data-theme="dark"]{ … }                 /* 3. người đọc tự bấm chọn tối */
```

Khối (2) và (3) **phải lặp lại y hệt nhau** — media query và attribute selector
không giao nhau nên không kế thừa được của nhau.

> **Luật cứng.** Không bao giờ để một màu CHỈ tồn tại trong khối (2) hoặc (3).
> Máy để sáng mà người đọc bấm chọn tối là màu đó biến mất — và lỗi này chỉ lộ
> ra đúng ở một tổ hợp, nên rất dễ lọt qua lúc kiểm thử.

### 1.2 · Vì sao màu nhấn tách làm HAI

Đây là chỗ dễ làm sai nhất khi mang bảng màu pastel sang trang đọc bài.

`--raw-orchid #E3AADD` trên nền sáng chỉ đạt **1.78:1** — đẹp, nhưng đọc không
nổi. Nên bảng màu tách bạch:

- `--accent` → **trang trí**: viền, chấm, gradient, vạch phân cách. Đẹp là đủ.
- `--accent-ink` → **chữ**: link, nhãn, tiêu đề nhỏ. **5.27:1**, đạt WCAG AA.

Bên theme tối thì orchid đạt 9.4:1, nên hai biến về chung một màu.

**Component không bao giờ đọc `--raw-*`.** Chỉ đọc lớp ngữ nghĩa (`--text`,
`--accent-ink`, `--surface`…). Nhờ vậy đổi theme là đổi đúng một chỗ.

---

## 2 · CHỮ

| Phông | Dùng cho | Không dùng cho |
|---|---|---|
| **Oswald** | nhãn VIẾT HOA giãn rộng: eyebrow, tem, nút, chú thích ảnh nhỏ | thân bài |
| **Cormorant Garamond** | tiêu đề, trích dẫn, sapo — *nghiêng* là chất riêng của trang | đoạn văn dài |
| **Be Vietnam Pro** | **thân bài, mọi thứ đọc lâu** | nhãn viết hoa |

**Be Vietnam Pro là bắt buộc cho thân bài.** Phông này vẽ đủ dấu tiếng Việt
chồng hai tầng — `ộ`, `ẫ`, `ự`, `ế`. Phông Latin thường thì dấu bị lệch hoặc
chồng lên nhau, đọc một bài dài là mỏi mắt thấy rõ.

### 2.1 · Thang cỡ chữ

Toàn bộ bằng `clamp()`, **không có một media query nào cho cỡ chữ**. Chữ co giãn
mượt từ 320px tới 1440px, không có "điểm gãy" nào mà cỡ chữ nhảy đột ngột.

| Token | Cỡ | Dùng cho |
|---|---|---|
| `--fs-base` | 16.5 → 18.5px | **thân bài** |
| `--fs-md` | 18 → 20.5px | sapo, trích dẫn |
| `--fs-h2` | 24 → 32px | tiêu đề mục |
| `--fs-h1` | 30 → 50px | tiêu đề bài |
| `--fs-xs` | 11.5 → 12.5px | nhãn Oswald |

### 2.2 · Dòng và đo dòng — SỐ LIỆU ĐO THẬT

Mấy con số dưới đây **đếm trong trình duyệt**, không ước lượng: dùng
`canvas.measureText` lấy bề rộng ký tự trung bình thật của bài rồi chia cho bề
rộng cột. Bản đầu ước lượng, và lệch hẳn 10 ký tự.

| Khổ màn | Cột chữ | Cỡ chữ | Ký tự/dòng | Chuẩn |
|---|---|---|---|---|
| 1440px | 683px | 18.5px | **71** | 65–75 ✓ |
| 820px | 680px | 18.5px | **71** | ✓ |
| 390px | 351px | 17.2px | **40** | 35–45 ✓ |

```css
--lh-body: 1.78     /* thân bài */
--measure: 58ch     /* KHÔNG phải 66ch — xem dưới */
```

**`ch` không phải là "ký tự".** `1ch` là bề rộng chữ **`0`**, rộng hơn ký tự
trung bình của một bài văn xuôi. Ở phông này, `66ch` cho ra **80 ký tự/dòng** —
vượt hẳn khoảng 65–75 mà các trang đọc-bài-dài dùng, và ở mức đó mắt hay lạc
hàng lúc quay về đầu dòng sau. `58ch` mới ra 71.

**1.78 chứ không phải 1.6.** Tiếng Việt có dấu chồng hai tầng; để 1.6 là dấu của
dòng dưới chạm chân chữ dòng trên. Cao hơn tiếng Anh khoảng 0.1 đơn vị.

### 2.2b · Thang tiêu đề và nhịp dọc

| | Cỡ ở 1440px | So với thân bài | Chuẩn |
|---|---|---|---|
| h1 | 50px | 2.70× | 2.2–3.0 ✓ |
| h2 | 32px | 1.73× | 1.5–1.8 ✓ |
| h3 | 25px | 1.35× | 1.25–1.45 ✓ |
| chú thích ảnh | 14.5px | 0.78× | ✓ |

Nhịp dọc quy hết về **một biến**, và biến đó tính từ **cỡ chữ thân bài**:

```css
.prose{ --flow: calc(var(--fs-base) * 1.5) }   /* ≈ 0.85× chiều cao dòng */
.prose > * + *  { margin-top: var(--flow) }
.prose > * + h2 { margin-top: calc(var(--flow) * 2.4) }
```

Hai cái bẫy ở đây, cả hai đều đã vấp:

- **Không dùng px cứng.** Cỡ chữ co giãn theo bề ngang màn hình; khoảng cách
  đứng yên thì nhịp vỡ ở hai đầu thang. Bản đầu để 20px cố định, ra
  **0.59× chiều cao dòng** — các đoạn dính vào nhau thành một khối.
- **Không dùng `em`.** `margin-top` tính bằng `em` đọc theo cỡ chữ của **chính
  phần tử đó**, nên "2.4em phía trên h2" ra 2.4 × 32px chứ không phải
  2.4 × 18.5px — sai gấp rưỡi. `calc()` từ `--fs-base` thì luôn đo theo thân bài.

### 2.2c · Một bài chỉ có MỘT chỗ mở

Bài có `summary` thì đoạn đầu **không** tự phóng to thành sapo nữa. Để cả hai
thì người đọc gặp liền hai khối chữ lớn cùng cỡ nói cùng một ý — đo ra đúng
20.5px cho cả hai, nhìn như bài bị lặp. Build tự lo việc này
(`khongSapo: !!fm.summary`), không phải nhớ.

### 2.3 · Ba quy tắc dàn chữ

```css
p, li  { text-wrap: pretty }    /* không để rớt một chữ lẻ xuống dòng cuối */
h1..h4 { text-wrap: balance }   /* tiêu đề chia đều các dòng */
p      { hyphens: none }        /* ← quan trọng */
```

**`hyphens: none` là bắt buộc.** Tiếng Việt đơn âm, không có luật cắt âm tiết
như tiếng Anh. Bật `hyphens:auto` là trình duyệt cắt `nghiêng` thành `ngh-iêng`.

### 2.4 · Ba chỗ blog khác hẳn hai trang cũ

| | `HAN-961030-*` | Blog | Vì sao |
|---|---|---|---|
| Khổ khung | `max-width:460px`, một màn cố định | cột chữ 58ch, co theo màn | Bên kia là màn hình máy để chơi; bên này phải đọc được trên cả màn 27" |
| Cuộn | `overflow:hidden`, không cuộn | cuộn tự nhiên cả trang | Bài dài |
| Bôi đen chữ | `user-select:none` gần như khắp nơi | **chỉ cấm ở header, chân trang, tem, mục lục** | Thân bài là thứ người đọc có quyền bôi để chép |

> **Tuyệt đối không đặt `user-select:none` cho `.prose`.** Đây là lỗi mang thói
> quen từ trang trò chơi sang mà không nghĩ lại.

---

## 2b · LIQUID GLASS

Toàn bộ nằm ở `src/styles/glass.css`.

### 2b.1 · Bốn tầng — thiếu tầng nào cũng ra nhựa mờ

| Tầng | Làm gì | Token |
|---|---|---|
| 1 · Ruột | nền bán trong, đậm dần từ trên xuống | `--glass-fill` |
| 2 · Nhoè nền | `backdrop-filter` **có nâng bão hoà** | `--glass-blur` `--glass-sat` |
| 3 · Viền sáng | vệt sáng ở mép, chỗ ánh sáng bẻ qua rìa | `--glass-spec` |
| 4 · Bóng đổ | tách tấm kính khỏi nền phía sau | `--glass-drop` |

Tầng 2 phải có `saturate()`, không chỉ `blur()`: chỉ nhoè thôi thì màu sau kính
ra xám bệch, không ánh qua được.

Tầng 3 làm bằng **viền gradient thật** — tô nền gradient rồi khoét ruột bằng
`mask-composite`, chỉ chừa 1px ở rìa, sáng nhất ở mép trên-trái. Không thay
được bằng `border: 1px solid`: viền đặc thì bốn cạnh sáng như nhau, và mắt đọc
ra ngay là một cái khung chứ không phải một tấm kính.

### 2b.2 · HAI viền, hai việc — chỗ dễ làm sai nhất

```css
--glass-edge  /* viền CẤU TRÚC, tối nhẹ — tách tấm kính khỏi nền */
--glass-spec  /* vệt SÁNG ở mép — nơi ánh sáng bẻ qua rìa */
```

> **Bẫy đã vấp.** Bản đầu để cả hai là màu trắng. Trên nền pastel sáng thì tấm
> kính mất hẳn đường bao — header trôi lẫn vào trang, không còn vạch ngăn nào.
> Trên nền tối không lộ ra, nên lỗi này chỉ thấy ở đúng một theme.

Cũng vì vậy ruột kính bản sáng để `.55 → .26`, không phải `.78 → .44`: đục quá
thì đọc ra là "một thanh trắng đặc", mất hẳn cảm giác nhìn xuyên qua.

### 2b.3 · Áp bằng DANH SÁCH, không bằng utility class

```css
.glass, .site-head, .card, .btn, .ovp, .prose pre .copy-btn { … }
```

Thêm mảnh mới thì thêm tên nó vào danh sách ở §1 của `glass.css`. HTML vẫn viết
`<button class="btn">`, không phải `class="btn glass glass--tint press sheen"`.

Bản đầu làm kiểu utility. Bỏ, vì hai lý do: HTML thành một mớ class, và quan
trọng hơn — quên một class thì mảnh đó **lặng lẽ** khác mọi mảnh còn lại mà
không ai nhận ra ngay.

### 2b.4 · Chuyển động — hai nhịp, dùng đúng chỗ

| Nhịp | Khi nào | Hàm |
|---|---|---|
| `.lift` nhấc lên | rê vào thẻ, thứ **mở ra được** | `--ease-glass` mượt, chậm dần |
| `.press` lún xuống | bấm nút, thứ **thực thi một việc** | `--spring` vọt qua đích rồi lùi |
| `.sheen` vệt sáng chạy ngang | rê vào nút, chỉ trên máy có con trỏ | |

`--spring` vọt qua đích rồi lùi lại — đó là cái làm nút có cảm giác vật thể
thật. **Chỉ dùng cho nút và thẻ**; không dùng cho panel đang mở ra đóng vào,
vì vọt quá đích trên một tấm panel nhìn ra là giật chứ không phải nảy.

Cả ba chỉ động tới `transform`, `box-shadow`, `filter` — ba thuộc tính trình
duyệt chạy trên luồng vẽ riêng, không phải tính lại bố cục.

**`prefers-reduced-motion`**: bỏ hẳn phần nhấc lên, lún xuống, vệt sáng. Giữ
đổi màu và bóng đổ — đó là tín hiệu báo nút đang được nhắm tới, bỏ luôn thì
không còn gì báo.

### 2b.5 · Cố ý KHÔNG làm: khúc xạ thật bằng SVG

Liquid Glass của Apple bẻ cong ảnh phía sau bằng `feTurbulence` +
`feDisplacementMap`. Làm được trong CSS qua `backdrop-filter: url(#filter)`,
nhưng bỏ, vì ba lý do:

- Safari không chạy SVG filter trong `backdrop-filter` — đúng nửa số người đọc
  trên điện thoại sẽ thấy một phiên bản khác hẳn.
- Trên trang cuộn dài, nó buộc vẽ lại vùng khúc xạ ở mỗi khung hình.
- Ở khổ một thanh header cao 60px, phần nhìn thấy được gần như bằng không.

Vệt sáng ở mép (tầng 3) đã cho ra đúng cảm giác đó với chi phí bằng không.

---

## 3 · BẢNG TRA COMPONENT

Thêm mảnh mới thì **tra bảng này trước khi vẽ**. Cùng một việc phải cùng một hình.

| Việc | Lớp | Ở đâu |
|---|---|---|
| Mở đầu một khu | `.eyebrow` | vạch + viên kim cương giữa |
| Nhãn nhỏ viết hoa | `.label` | Oswald, giãn `.22em` |
| Nút chính của màn | `.btn` | **mỗi màn đúng MỘT nút chính** |
| Nút phụ | `.btn.btn--ghost` | viền mảnh, nền trong |
| Nút chỉ có hình | `.ico-btn` | **bắt buộc** `aria-label` + `.tip` |
| Chú thích nổi | `.tip` + `data-tip` | **luôn đặt phía DƯỚI nút** |
| Tag | `.tag` | một hình duy nhất ở mọi nơi |
| Đường dẫn phân cấp | `.crumbs` | Bài viết / Mục / Mục con |
| Thẻ bài | `.card` | trang danh sách |
| Hàng meta | `.meta-row` | ngày · phút đọc · trạng thái |
| Huy hiệu | `.badge--draft` `--new` `--pin` | |

### 3.1 · Nút chỉ có hình: ba luật cứng

Kế thừa §1 của design system cũ.

**1. Bắt buộc SVG, không gõ ký tự.** Đừng viết `↺` `⟳` `✕` thẳng vào HTML — mỗi
máy lấy một phông khác nhau nên nét lúc dày lúc mảnh, và trên vài máy Android thì
ra ô vuông rỗng.

*Ngoại lệ:* nút **có chữ đi kèm** (`↻ Reset`) thì được — chữ đã nói rõ việc rồi,
ký tự chỉ là trang trí.

**2. Bắt buộc `aria-label` và chú thích nổi.** Nút chỉ có hình mà không có chú
thích thì người đọc phải bấm thử mới biết nó làm gì.

**3. Hình đặc và hình viền không trộn thuộc tính được.** Mặc định để **nét viền**
(`fill:none; stroke:currentColor`), rồi cho riêng hình đặc một lớp `.fill` đảo lại:

```css
.ico-btn svg      { fill:none; stroke:currentColor; stroke-width:1.7 }
.ico-btn svg.fill { fill:currentColor; stroke:none }
```

> **Bẫy đã vấp:** để `fill:currentColor` cho cả ba hình thì con mắt biến thành
> một quả trứng đen; để `fill:none` cho cả ba thì cuộn phim và mũi tên biến mất sạch.

### 3.2 · Ba việc, ba hình — không dùng lẫn

| Việc | Hình | Nhãn mẫu |
|---|---|---|
| Xem lại **hiệu ứng** | cuộn phim | `Xem lại hiệu ứng` |
| Xem lại **nội dung** | con mắt | `Xem lại câu trả lời` |
| **Chơi lại / Reset** | mũi tên quay vòng | `Chơi lại từ đầu` |

Mã SVG chuẩn của ba hình này nằm ở design system gốc — chép nguyên, đừng vẽ lại.

---

## 4 · KHUNG ĐỌC BÀI

Toàn bộ nằm trong `src/styles/prose.css`.

### 4.1 · Ba làn, để ảnh phá rào ra khỏi cột chữ

```css
.prose{
  display:grid;
  grid-template-columns:
    [full-start] minmax(var(--gutter),1fr)
    [wide-start]  minmax(0,7rem)
    [text-start]  min(var(--measure), 100% - var(--gutter)*2) [text-end]
                  minmax(0,7rem) [wide-end]
    minmax(var(--gutter),1fr) [full-end];
}
.prose > *      { grid-column: text }   /* mặc định */
.prose > .wide  { grid-column: wide }   /* rộng hơn cột chữ, vẫn còn lề */
.prose > .full  { grid-column: full }   /* tràn hết bề ngang */
```

**Dùng grid có làn đặt tên chứ không dùng margin âm.** Margin âm vỡ ngay khi đổi
bề ngang khung cha, và phải tính lại bằng tay ở mọi điểm gãy. Grid thì tự lo.

Dưới 640px, `.wide` **tự động thành `.full`** — giữ lề hai bên cho ảnh ở màn hẹp
chỉ làm ảnh bé lại chứ không giúp gì cho việc đọc.

### 4.2 · Nhịp dọc là thuộc tính của CẶP

```css
.prose > * + *     { margin-top: var(--s5) }
.prose > * + h2    { margin-top: var(--s10) }
.prose > h2 + *    { margin-top: var(--s4) }
```

Chỉ dùng `margin-top`, không bao giờ `margin-bottom`. Nhờ vậy không phải đi trừ
margin chồng nhau giữa hai khối cạnh nhau — khoảng cách luôn do đúng một quy tắc quyết định.

### 4.3 · Ảnh: `aspect-ratio` là bắt buộc

Build đọc kích thước thật từ file rồi ghi `style="--ar:16 / 9"` vào từng ảnh.

> **Vì sao.** Ảnh không khai tỉ lệ thì lúc chưa tải xong nó cao 0px; tải xong bật
> ra chiều cao thật, đẩy toàn bộ chữ phía dưới nhảy xuống một phát. Người đang
> đọc mất dòng. Trên 4G yếu thì nhảy liên tục suốt bài.

Chi tiết bộ đọc kích thước: `tools/lib/imgsize.mjs` (PNG · JPEG · GIF · WebP · SVG).

### 4.4 · Video YouTube: ảnh bìa trước, iframe sau

Nhúng `<iframe>` YouTube sẵn thì mở bài ra là kéo về hơn 1MB script của Google
và bị đặt cookie theo dõi, **dù người đọc chưa bấm gì**. Bài có ba video thì ba lần như vậy.

Ở đây chỉ đặt ảnh bìa từ `i.ytimg.com` (CDN ảnh tĩnh, không cookie, không script)
cộng một nút play. Bấm rồi mới dựng iframe, và dựng bản `youtube-nocookie.com`.

### 4.5 · Gạch chân link — 3px, không phải mặc định

```css
text-underline-offset: 3px;
text-decoration-thickness: 1px;
```

Gạch chân mặc định của trình duyệt **cắt ngang dấu tiếng Việt nằm dưới chữ** —
`ạ`, `ọ`, `ụ`, `ợ`. Đẩy xuống 3px thì dấu còn nguyên mà vẫn rõ là link.

---

## 5 · TEM PHIÊN BẢN

Giữ nguyên quy ước §4 của design system cũ — hai dòng, **ký tên trên, phiên bản dưới**:

```
@Designed by Honghandangiu
Last updated 14-Sep-2026 · V0.10
```

Oswald, 8.5px, giãn `.18em`, VIẾT HOA, màu mờ.

**Ngày và số phiên bản do build tự điền từ `docs/LICH-SU.md`** — không sửa tay,
và **không khai ở `site.config.json`**. Sổ phiên bản là nguồn duy nhất; khai ở
hai chỗ thì sớm muộn cũng lệch, và lúc lệch không biết chỗ nào đúng.

Ghi thêm một bản: `npm run ver -- "mô tả loại việc"`.

---

## 6 · BA THỨ KHÔNG ĐƯỢC QUÊN

**Vòng focus.** Chỉ hiện khi đi bằng bàn phím:

```css
:focus-visible        { outline: 2px solid var(--accent-ink); outline-offset: 3px }
:focus:not(:focus-visible) { outline: none }
```

Dùng `:focus` thường thì mọi cú bấm chuột đều để lại viền, người dùng tưởng hỏng.
Bỏ hẳn `outline` thì người đi bằng Tab mất dấu hoàn toàn.

**Màu một mình không đủ.** Bốn khối callout khác nhau ở màu, nhưng mỗi khối **còn
có nhãn chữ** (`Ghi chú` · `Mẹo` · `Lưu ý` · `Đừng làm`) — người mù màu vẫn phân biệt được.

**Chỉ ba thứ được phép trượt ngang:** khối mã, bảng, và sơ đồ — mỗi thứ trong
khung `overflow-x:auto` của riêng nó. `body` có `overflow-x:hidden` để một phần
tử tràn cũng không kéo cả trang trượt theo.

---

## 7 · FILE NÀO CHỨA GÌ

| File | Chứa | Không chứa |
|---|---|---|
| `tokens.css` | mọi biến màu, chữ, nhịp, bóng đổ · cả hai theme | bất kỳ selector nào khác `:root` |
| `base.css` | reset, nền trang, chữ gốc, focus | component |
| `layout.css` | header, chân trang, cột bài + mục lục | style của thân bài |
| `components.css` | nút, chip, thẻ, huy hiệu, tooltip | khung đọc bài |
| `glass.css` | vật liệu kính + hai nhịp chuyển động | màu (đọc từ tokens) · bố cục |
| `prose.css` | **toàn bộ khung đọc bài** | mọi thứ ngoài `<article>` |

Build gộp thành `dist/assets/style.css` theo thứ tự:

```
tokens → base → glass → layout → components → prose
```

Thứ tự này không đổi được:
- `tokens` trước mọi thứ, vì mọi file còn lại đọc biến của nó
- `glass` trước `components`, để component ghi đè được vật liệu khi cần
- `prose` sau `components`, để khung đọc bài ghi đè được component

> **Hệ quả phải nhớ.** Luật trong `prose.css` thắng luật cùng độ ưu tiên ở
> `layout.css`. Đã vấp: `.khung-b .post-cover{grid-column:full}` bị
> `.prose > .wide{grid-column:wide}` đè, nên ảnh bìa không tràn hết. Cách xử:
> thêm một bậc — `.khung-b .prose > .post-cover`.

---

## 8 · BA KHUNG TRÌNH BÀY BÀI

Chọn bằng `khung: A | B | C` trong front matter. Cả ba dùng **chung một HTML**,
chỉ đổi cách xếp bằng grid — nên đổi khung không phải viết lại template nào, và
ba khung không bao giờ lệch nhau về nội dung.

| | Dáng | Hợp với | Ký tự/dòng |
|---|---|---|---|
| **A** | cột đọc + mục lục dính phải | bài phân tích nhiều mục | 71 |
| **B** | bìa tràn màn, tiêu đề giữa, không cột phụ | bài kể chuyện, nhiều ảnh | 74 |
| **C** | mục lục dính lề trái, cột đọc phải | bài rất dài | 72 |

Dưới 1080px cả ba tự về **một cột** — màn hẹp không đủ chỗ cho cột phụ, ép vào
thì cột chữ hẹp tới mức mỗi dòng còn vài chữ.

Ở khung C, mục lục nằm **cột đầu** trong lưới nhưng vẫn nằm **sau bài** trong
HTML (đặt chỗ bằng `grid-column`/`grid-row`). Mắt thấy mục lục trước, trình đọc
màn hình vẫn nghe bài trước — hai thứ đó không nhất thiết phải trùng nhau.
