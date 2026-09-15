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
@Designed by Zoey
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

## 8 · HAI KHUNG TRÌNH BÀY BÀI

Chọn bằng `khung: A | B` trong front matter. Cả hai dùng **chung một HTML**,
chỉ đổi cách xếp bằng grid — nên đổi khung không phải viết lại template nào.

| | Dáng | Hợp với | Ký tự/dòng |
|---|---|---|---|
| **A** | cột đọc + mục lục dính phải | bài phân tích nhiều mục | 71 |
| **B** | bìa tràn màn, tiêu đề giữa, không cột phụ | bài kể chuyện, nhiều ảnh | 74 |

Dưới 1080px cả hai về **một cột**.

### 8.1 · Bốn khối con, đặt chỗ TƯỜNG MINH

```
.post-layout
├── .post-head    đường dẫn · TIÊU ĐỀ · ngày+phút đọc · tóm tắt
├── .toc-box      mục lục
├── .prose        ảnh bìa + thân bài
└── .post-foot    khối tag · khung bình luận · gợi ý đọc tiếp
```

Bốn khối là **con trực tiếp** của lưới, không lồng vào nhau. Bản trước để đầu
bài nằm TRONG `<article>`, nên mục lục — vốn là anh em của `<article>` — không
chen được vào giữa đầu bài và thân bài, và ở màn hẹp nó rơi xuống tận cuối
trang: đọc xong hết rồi mới thấy mục lục.

Ở ≥1080px phải đặt chỗ tường minh:

```css
.khung-a .post-head{grid-column:1;grid-row:1}
.khung-a .prose    {grid-column:1;grid-row:2}
.khung-a .post-foot{grid-column:1;grid-row:3}
.khung-a .toc-box  {grid-column:2;grid-row:2}
```

> **Bẫy đã vấp.** Để lưới tự xếp thì nó lấp theo hàng: đầu bài (1,1) → mục lục
> (1,2) → thân bài (2,1) → **chân bài (2,2)**, tức là chân bài nhảy sang cột
> mục lục.

### 8.2 · Mọi thứ THẲNG MỘT MÉP

Ảnh, bảng, khối mã, callout, đầu bài, chân bài — tất cả cùng một lề trái.
`.wide` và `.full` vẫn còn, nhưng là thứ tác giả **phải tự gõ** cho từng ảnh.

Đầu bài và chân bài không nằm trong `.prose` nên không ăn theo lưới của nó.
Chúng phải **chép lại đúng công thức** của làn chữ:

```css
.post-head, .post-foot{
  width: min(var(--measure), 100% - var(--gutter) * 2);
  margin-inline: auto;
}
```

Chép công thức, không áng chừng một con số: áng chừng thì lệch vài px, và mắt
bắt được ngay vì ba khối nằm chồng dọc nhau.

> **Bẫy đã vấp (khung B).** `--measure` khai ở `.prose` thì chỉ thân bài rộng
> 60ch; đầu bài và chân bài vẫn đọc 58ch của `:root`. Lệch 12px. Phải khai ở
> chính `.post-layout.khung-b` để cả bốn khối con cùng thừa kế.

### 8.3 · Thứ tự đầu bài

```
đường dẫn → TIÊU ĐỀ → ngày · phút đọc → tóm tắt
```

Ngày và phút đọc bám **ngay dưới tiêu đề**: đó là hai thứ người đọc liếc để
quyết định có đọc tiếp không. Tóm tắt đứng sau chúng — nó đã là nội dung rồi.

Tag **không** nằm ở đầu bài nữa. Ở đó chúng chen giữa tiêu đề và câu mở, làm
chậm đúng lúc người đọc đang muốn vào bài.

### 8.4 · Tiêu đề: nối chữ tiếng Việt

`text-wrap: balance` chia đều độ dài các dòng nhưng **không biết đâu là ranh
giới ý**. Tiêu đề "…và cái cớ để tin…" bị bẻ thành "…và cái" / "cớ để tin…".

Cách chữa: build dán từ **công cụ** vào từ ngay sau nó bằng khoảng trắng cứng
(`tools/lib/text.mjs`, hàm `noiChu`). Hai nhóm không bao giờ nên đứng cuối dòng
trong tiếng Việt:

- **Loại từ** — cái, con, chiếc, người, việc, điều, thứ…
- **Từ nối** — và, của, là, với, cho, từ, về, trong, như, mà, thì…

Chỉ áp cho tiêu đề. Thân bài dòng nào cũng dài, dán thêm khoảng trắng cứng chỉ
làm trình duyệt khó xuống dòng hơn mà mắt không nhận ra khác biệt.

---

## 9 · CHỮ GIAO DIỆN — TIẾNG ANH

Mọi chữ **không phải nội dung bài** đều tiếng Anh: nav, đường dẫn phân cấp,
nhãn, ngày tháng, nút. Phần khung trang đọc ra đồng bộ, và tách bạch hẳn khỏi
nội dung tiếng Việt.

Tất cả gom về **một khối** — biến `NHAN` ở đầu `tools/build.mjs`. Đổi ngôn ngữ
giao diện là sửa đúng khối đó, không phải đi lùng từng chuỗi rải trong code.

Tên chuyên mục cũng tiếng Anh, khai trong `_muc.json` của từng thư mục.

---

## 10 · MỘT LỖI ĐÁNG NHỚ

`glass.css` **nằm ngoài bundle suốt một phiên bản** mà không ai biết: mảng
`thuTu` trong `gopCSS()` thiếu tên nó. Thiếu một file CSS thì không có lỗi nào
cả — trang vẫn dựng, vẫn mở được, chỉ là cả một mảng giao diện lặng lẽ biến mất.

Bộ kiểm định nay có một phép so `src/styles/*.css` với bundle đã gộp. Thêm file
CSS mới mà quên khai vào `thuTu` là `npm run kiem` báo đỏ ngay.

Hai phép kiểm khác sinh ra từ cùng lượt đó:

- **Nút chính không dùng chữ trắng.** Nền gradient pastel + chữ trắng chỉ đạt
  ~2:1. Dùng `--btn-ink` (`#3A2A52`) — 5.8:1 ở đoạn tối nhất của gradient,
  7.2:1 ở đoạn sáng nhất. Giữ nguyên ở cả hai theme vì gradient của nút không
  đổi theo theme.
- **Luật ẩn nav bắt cả `<span>`.** Mục trỏ tới trang chưa dựng render thành
  `<span>`, không phải `<a>`. Luật `.nav a.nav-text{display:none}` bỏ sót
  chúng, và ở 390px bốn mục nav không ẩn được đã ép tên trang co về 0.


---

## 11 · TRANG GIỚI THIỆU — HAI KHUNG

Chọn bằng `khung: bento | chuong` trong `content/pages/about.md`. Cả hai dựng
từ **cùng dữ liệu** trong front matter, chỉ khác cách bày.

| | Dáng | Hợp khi |
|---|---|---|
| **bento** | lưới ô kính, mỗi ô một mẩu thông tin | muốn trang đọc như một tấm danh thiếp — liếc một cái nắm hết |
| **chuong** | các chương chữ lớn, hiện dần khi cuộn | muốn kể hơn là liệt kê |

### 11.1 · Lưới bento KHOÁ CỨNG, không để tự xếp

```
hàng 1–2   [ giới thiệu  4 cột × 2 hàng ]  [ trích dẫn 2 cột × 2 hàng ]
hàng 3     [ dải số  6 cột — bên trong tự chia đều ]
hàng 4     [ dạo này  3 cột ]              [ liên hệ  3 cột ]
hàng 5     [ thân bài  6 cột ]
```

> **Bẫy đã vấp.** Bản đầu cho mỗi ô một `span` rồi thả cho lưới tự lấp. Hỏng vì
> số ô SỐ thay đổi theo việc tác giả khai bao nhiêu field, nên hàng nào cũng có
> thể thừa 2 cột trống — và một lưới bento có lỗ hổng đọc ra là trang bị lỗi,
> không phải trang gọn gàng.
>
> Cách chữa: nhét mọi ô số vào **một dải chiếm trọn 6 cột**, bên trong dải đó
> mới chia đều bằng `auto-fit`. Khai 2 field hay 4 field thì lưới ngoài vẫn kín.

### 11.2 · Thân bài phải thẳng mép với các ô kính

```css
.bo--chu .prose{ --measure:100%; --gutter:0 }
```

**Phải đặt cả hai biến.** Làn chữ của `.prose` tính bằng
`min(--measure, 100% - --gutter*2)`, nên chỉ đặt `--measure` thì chữ vẫn thụt
vào đúng bằng `--gutter` — đo ra 32px ở khổ 1440px.

> **Bẫy thứ hai, chỉ lộ ở màn hẹp.** `@media (max-width:860px){ .bo{padding:20px} }`
> nằm SAU `.bo--chu{padding:0}` nên đè lên nó, và thân bài thụt 20px so với mọi
> ô kính. Phải viết `.bo:not(.bo--chu){padding:…}`.
>
> Đo lại sau khi sửa: **lệch 0px** ở cả 1440 · 820 · 390px.

### 11.3 · Hiện dần khi cuộn

Trạng thái đầu (`opacity:0; translate:0 16px`) đặt ở **CSS**, không ở JS: JS chạy
sau khi trang vẽ xong, nên đặt bằng JS thì khối loé lên một nhịp rồi mới mờ đi.

`IntersectionObserver` bỏ theo dõi ngay sau lần hiện đầu — hiện rồi thì thôi,
không cho mờ lại lúc cuộn ngược. Chữ nhấp nháy khi cuộn lên gây khó chịu rõ rệt,
và không ai cuộn ngược để xem lại hiệu ứng.

`prefers-reduced-motion` thì hiện hết ngay, không animate gì.

Ô trích dẫn mỗi ngày: xem `docs/QUOTE.md`.


---

## 12 · NỀN ĐỘNG

Hai hiệu ứng, tự đổi theo theme:

| Theme | Hiệu ứng | Gốc |
|---|---|---|
| sáng | cánh hoa anh đào rơi chéo | HAN-961030-a |
| tối | đĩa thiên hà xoắn ốc | HAN-961030-b |

### 12.1 · Bật ở đâu

**Trang tĩnh** (`content/pages/*.md`) — thêm vào front matter:

```yaml
nen: dong     # bật
nen: tinh     # tắt (mặc định)
```

**Trang chủ** luôn bật, không khai gì cả.

`nen` **chỉ có tác dụng ở `content/pages/`**. Gõ vào một bài viết thì nó bị bỏ
qua — bộ kiểm định bắt trường hợp này và báo cảnh báo.

### 12.2 · Cỡ đĩa thiên hà

Đĩa bị ép dẹt còn 0.34 chiều cao, nên **chiều dọc không bao giờ là cạnh chạm
mép trước**. Lấy cỡ theo `min(W,H)` là trói đĩa vào chiều cao: trên màn ngang
nó co lại thành một cái huy hiệu nhỏ nằm lọt thỏm giữa khung.

Luật đang dùng:

```js
R = Math.min(W * 0.52, H * 0.92)   // bán kính đĩa
Rl = R * 0.46                      // quầng lõi, bám theo R
```

- **0.52** cho đường kính ngang hơi tràn mép — thiên hà phải chạy **ra khỏi**
  khung mới ra dáng thiên hà; nằm gọn trong khung thì thành cái huy hiệu.
- **H \* 0.92** là cái *chặn* cho khung ngang-mà-thấp (1600×500): không có nó
  thì cả màn chỉ còn thấy mỗi quầng lõi.
- Quầng lõi bám theo `R` chứ không theo màn: đĩa to mà lõi giữ nguyên thì thành
  cái đèn pin giữa đám bụi. Hệ số thấp để phần to ra là **nhánh xoắn**, không
  phải cục sáng.
- Số sao đếm theo diện tích **màn**, không theo diện tích đĩa — cái mắt người
  thấy là bao nhiêu chấm trên mỗi vùng màn hình. Nhưng đĩa to ra thì trần phải
  nới theo, không thì nhánh xoắn trông thủng lỗ chỗ.

Mặc định là `tinh`. Bật ở mọi trang thì nó hết là điểm nhấn, và trang đọc bài
cần yên để đọc.

### 12.2 · Bốn thứ nó tự lo

1. **Đổi theme là đổi hiệu ứng ngay**, kể cả khi người đọc bấm nút giữa chừng.
2. **Tab bị ẩn thì dừng hẳn.** Trình duyệt có tiết lưu `requestAnimationFrame`
   ở tab ẩn nhưng không dừng hẳn — vẫn tốn pin của người mở mười tab.
3. **Cuộn qua khỏi thì dừng.** Nền chỉ ở màn đầu; vẽ tiếp là vẽ cho không ai xem.
4. **`prefers-reduced-motion`**: vẫn vẽ MỘT khung hình tĩnh rồi dừng, không bỏ
   trắng. Người tắt chuyển động vẫn xứng đáng được nhìn cái nền.

### 12.3 · Mật độ theo diện tích, không theo số cố định

Số cánh hoa và số sao tính từ `W × H` của khung. Để một con số cố định thì màn
1440px thấy thưa thớt mà màn 390px thấy dày đặc.

---

## 13 · THEME TỐI — QUẦNG SÁNG

Trên nền sáng, bóng đổ và quầng sáng gần như một thứ. Trên nền tối thì khác
hẳn: **bóng đổ nói "vật này nằm trên nền", quầng sáng nói "vật này phát sáng"**.
Chỉ có bóng đen thì mọi thứ trông như lún xuống, cả trang phẳng và tối.

```css
--glow       /* quầng dưới nút, chip đang bật */
--glow-manh  /* khi rê chuột vào */
--chu-bong   /* bóng chữ cho h1, h2 — `none` ở theme sáng */
```

Ở theme tối lấy thẳng từ HAN-961030-b: `0 12px 30px rgba(120,80,180,.50)` —
quầng **tím**, không phải bóng đen. Đó chính là chỗ "độ bóng" đến từ.

**Cả ba trạng thái theme phải khai đủ ba biến này** (`:root` · `@media dark` ·
`[data-theme="dark"]`). Thiếu ở khối nào thì bấm nút đổi theme là quầng biến mất.

---

## 14 · ẢNH TRÊN THẺ BÀI

| Chỗ | Có ảnh? | Vì sao |
|---|---|---|
| Lưới nhiều bài | **không** | sáu tấm cạnh nhau thành một mảng màu, không tấm nào nói được gì, mà trang nặng thêm nửa MB |
| Một bài nổi bật | **có** | nó là thứ duy nhất trên màn đó; ảnh cho nó sức nặng để đọc ra là "bài chính" chứ không phải "bài đầu danh sách" |
| Màn hero trang chủ | **không** | ba dòng tiêu đề, mỗi dòng một bài — ảnh ở đây phá nhịp |

Thẻ nổi bật dựng **ảnh trái · chữ phải**, tỉ lệ 5:6 — cùng khuôn với Medium,
Substack và The Verge. Dựng dọc (ảnh trên, chữ dưới) thì ảnh chiếm hết màn đầu
và tiêu đề bị đẩy xuống dưới nếp gấp.

Dưới 760px thì xuống một cột, ảnh thành băng ngang 16:9 — ô vuông trên màn hẹp
chiếm gần nửa màn hình.

---

## 15 · TIÊU ĐỀ NGẮN

Màn hero cho mỗi bài đúng **một dòng**. Tiêu đề 60 ký tự gãy làm ba dòng là
hỏng cả bố cục.

```yaml
titleNgan: Vô thức tập thể      # tuỳ chọn
```

Không khai thì cắt tạm ở dấu phẩy (hoặc gạch ngang) đầu tiên. Tiêu đề tiếng
Việt hay có dạng *"Vế chính, vế phụ"*, nên vế trước dấu phẩy gần như luôn là
phần cốt lõi — `"Vô thức tập thể, và cái cớ để tin vào giấc mơ"` ra
`"Vô thức tập thể"`.


---

## 16 · MÀN HERO TRANG CHỦ

Khuôn tạp chí / catalogue triển lãm, không phải khuôn "header blog". Sáu thứ
làm nên nó — thiếu thứ nào là nó xẹp về một khối chữ căn giữa:

1. **Lưới có đường kẻ nhìn thấy được.** Ba cột, hairline giữa các cột. Mắt đọc
   ra ngay là trang này có cấu trúc — và hai đường kẻ dọc ấy còn làm việc thứ
   hai, xem điểm 2.
2. **Tên trang thành khối chữ bị ĐƯỜNG KẺ LƯỚI xén.** Không phải một dòng tiêu
   đề, và cũng không phải một lớp phủ bị mép cửa sổ cắt — xem §16.2.
3. **Bất đối xứng.** Cột trái và cột giữa neo đáy, cột phải neo đỉnh. Cả ba
   cùng canh giữa thì ra một hàng ngay ngắn và vô vị.
4. **Khoảng trống là vật liệu.** Màn đầu cố ý để trống nhiều: khối chữ lớn là
   thứ duy nhất có khối lượng, mọi thứ khác là nhãn nhỏ nép ở mép. Từng có một
   ô đếm số bài đặc màu ở cột giữa — bỏ đi, vì hai thứ có khối lượng thì chúng
   tranh nhau và không thứ nào thắng.
5. **Nhãn 9px in hoa giãn rộng đặt ở mép panel**, không ở giữa.
6. **Dấu + làm mốc căn**, như dấu chồng màu của nhà in.

### 16.2 · Khối chữ lớn: hai trạng thái

Tên trang tách làm ba mảnh — chữ đầu, từ giữa, từ cuối — mỗi mảnh là một ô đặt
tuyệt đối, có cỡ chữ và toạ độ riêng cho từng trạng thái.

**Khối chữ là MỘT Ô CỦA LƯỚI**, chiếm chung ô thứ hai với cột giữa. Đây là chỗ
bản đầu làm sai: nó phủ `position:absolute; inset:0` lên cả khung hero, nên chữ
bị xén ở *mép cửa sổ*. Mép cửa sổ không phải một đường nét của trang, nó chỉ là
chỗ màn hình hết — xén ở đó trông như chữ tràn ra ngoài chứ không như chữ được
đặt vào khuôn. Nay hai đường kẻ dọc của lưới thành hai lưỡi dao: chữ đầu chạm và
bị xén ở đường kẻ **trái**, từ cuối chạy khỏi đường kẻ **phải**.

Cỡ chữ vì thế dùng `cqw` (phần trăm bề ngang **của ô**), không dùng `vw`: ô này
rộng khoảng một nửa cửa sổ, và tỉ lệ ấy còn đổi theo khổ màn.

| | Lúc nghỉ | Lúc rê chuột |
|---|---|---|
| chữ đầu | nhô lên góc trái, viền trên xén mất một phần | co lại, nằm gọn trong khung |
| phần còn lại của từ đầu | giấu bằng `letter-spacing` âm | chạy vào, hiện đủ |
| từ giữa | nhỏ, đứng lệch | lớn theo, thẳng hàng |
| từ cuối | tụt xuống một tầng, chạy khỏi mép phải | tụt xuống một tầng, nằm trong khung |
| độ mờ | 16% (sáng) · 20% (tối) | 96% |

**Ba chỗ quyết định cách viết:**

- **Mỗi mảnh một ô tuyệt đối.** Xếp ba mảnh trên một dòng rồi để trình duyệt tự
  dồn thì lúc hiện đủ, từ giữa phải nằm ngay sau từ đầu — mà bề rộng từ đầu thì
  CSS không biết, nó đổi theo font và theo cỡ.
- **Giấu chữ bằng `letter-spacing` âm, không bằng `width:0`.** Hai cái kia phải
  biết trước bề rộng chữ; `overflow:hidden` thì xén mất phần vươn của chữ
  nghiêng. `letter-spacing` âm co chỗ lại mà không cắt gì, và animate được.
- **Màn cảm ứng lấy trạng thái hiện đủ làm mặc định.** Không có chuột thì không
  bao giờ rê được — để nguyên thì người dùng điện thoại không đời nào thấy tên
  blog hiện đủ.

Bàn phím cũng mở được: `.hero:focus-within` dùng chung bộ số với `:hover`.

### 16.3 · Cột trái

Một dòng `PROFILE →` dẫn sang trang giới thiệu, và ô trích dẫn mỗi ngày. Cả hai
đều nhẹ: ô trích dẫn **chỉ có viền, không có nền**, còn cửa vào chỉ là một nhãn
9px như mọi nhãn khác. Màn đầu đã có khối chữ lớn làm trọng tâm — thêm một khối
có khối lượng nữa là hai thứ tranh nhau.

Màn cao dưới 720px thì ô trích dẫn ẩn đi; cửa vào trang giới thiệu thì không.

### 16.4 · Khổ dọc là một bố cục khác, không phải lưới bị bóp

Ép lưới ba cột xuống khổ dọc thì được đúng thứ xấu: nút cuộn-xuống nhảy lên đầu
trang vì cột giữa xếp trước, còn khối chữ lớn nằm mờ phía sau và đè lên chữ.

Khổ dọc đọc từ trên xuống:

```
tên blog — chữ lớn, ĐỌC ĐƯỢC, xuống thang ba bậc
──────────────────────────
INDEX — ba bài mới nhất
──────────────────────────
PROFILE →  ·  trích dẫn hôm nay
──────────────────────────
READ ON ⌄
```

Ở đây khối chữ **thôi làm hoa văn mờ** và trở lại làm tiêu đề thật: khổ dọc
không có hai đường kẻ dọc để xén chữ, nên trò xén không còn nghĩa gì. Bậc thang
làm bằng `margin-left` tính theo `em` nên nó co giãn cùng cỡ chữ.

Lưới đổi sang flex dọc ở khổ này, để `order` làm đúng việc của nó mà không phải
gỡ từng khai báo `grid-column`/`grid-row` của khổ ngang.
### 16.1 · Ảnh hero — tuỳ chọn

```json
"heroAnh": "/media/hero.png"
```

Có ảnh thì nó đè lên chữ khổng lồ và nằm dưới tiêu đề — đúng thứ tự lớp của
catalogue: nhân vật che một phần con số, chữ chạy đè lên cả hai.

**Ảnh cắt nền (PNG trong suốt) đẹp nhất.** Ảnh chữ nhật đặc cũng dùng được,
chỉ là nó che mất chữ lớn nhiều hơn.

Để trống thì chữ lớn cộng nền động tự gánh — và đó vẫn là một màn hero hoàn
chỉnh, không phải một chỗ trống chờ ảnh.

### 16.2 · Chiều cao

```css
height: calc(100svh - var(--header-h));
```

Thanh đầu trang nằm trong dòng chảy nên hero bắt đầu ở y=64px. Để `100svh`
trơn thì nó kết thúc ở 964px trên màn 900px — đúng 64px rơi xuống dưới nếp gấp
và dòng cuối cột trái bị cắt ngang. Đo ra đúng con số đó ở cả bốn khổ thử.

`min-height` cũng không cứu được: nội dung cột trái vẫn đẩy khối cao lên. Phải
khoá cứng, và cho nội dung bên trong tự co (`min-height:0` trên mỗi cột).

Dưới 1000px thì cho hero **giãn** (`height:auto`): xếp dọc thì ba khối cộng lại
luôn cao hơn một màn, mà cắt mất chữ tệ hơn nhiều so với việc phải cuộn.
