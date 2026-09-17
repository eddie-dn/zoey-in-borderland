# DESIGN SYSTEM — BLOG

> **Kế thừa từ đâu.** Bảng màu, bộ chữ và mấy quy ước nút bấm ở đây lấy nguyên
> từ `HAN-961030-A` (theme Sakura) và `HAN-961030-B` (theme Galaxy). Blog không
> đẻ ra bảng màu mới — nó là **cùng một trang**, chỉ khác việc: bên kia để chơi,
> bên này để **đọc bài dài**.
>
> Vì để đọc bài dài, có ba chỗ buộc phải khác, ghi rõ ở §2.4.
>
> **Bộ liquid glass** thêm ở V1.1.0 — xem §2b.

---

## 1 · BỐN THEME

| | Sakura (mặc định) | Galaxy | Tĩnh lặng | 霜降 |
|---|---|---|---|---|
| Khoá trong mã | `light` | `dark` | `calm` | `frost` |
| Nền | `#FAF6FD` + ba quầng pastel | `#120C22` → `#2B1E4C` ở giữa | `#DCE8F5` + ba quầng xanh | `#FFFFFF` + hai quầng xám |
| Chữ chính | `#3E2F56` tím mực | `#F6EFFB` | `#15303E` mực đá ướt | `#111315` mực |
| Nhấn (trang trí) | `#E3AADD` | `#E3AADD` | `#7ABFDE` | `#9AA0A6` |
| Nhấn (chữ đọc được) | `#7A52B8` | `#EFC2E9` | `#0B5A78` | `#2B3138` |
| Nền động màn đầu | cánh hoa rơi | đĩa thiên hà | thác nước | mây trôi qua núi |

> **霜降** (Sương giáng) là tiết khí thứ mười tám, quãng cuối tháng Mười — lúc
> sương bắt đầu đọng thành giá. Ba theme kia đều có MÀU làm chất riêng; theme
> này cố ý không có màu nào, vì nó là theme để **nhìn ảnh và đọc lâu**: một
> tấm ảnh nằm trên nền hồng đọc ra khác hẳn khi nó nằm trên nền trắng.
>
> Khoá trong mã là `frost` chứ không phải chữ Hán — nó đi vào `data-theme`,
> `localStorage` và tên file favicon, ba chỗ mà ASCII không bao giờ gây chuyện.
>
> Nền trắng và mặt thẻ trắng thì chênh lệch màu bằng 0, nên ở đây **đường kẻ
> gánh toàn bộ việc nói ra mép** — đúng như mực nói ra hình trên giấy. Cùng
> bài toán với Tĩnh lặng nhưng lời giải ngược: ở kia hạ nền hai nấc để thẻ
> trắng nổi lên, ở đây nền không hạ được nên bóng và đường kẻ phải đi xa hơn.

Người đọc bấm nút ở góc phải header để đổi; lựa chọn được nhớ lại. Nút là một
**vòng xoay ba nhịp** — sáng → tối → tĩnh lặng → sáng — chứ không phải cái bập
bênh hai nhịp như trước.

**Ba là ngưỡng cuối cùng còn xoay vòng được.** Bấm quá tay một nhịp thì bấm
thêm hai nhịp nữa là về chỗ cũ. Từ bốn theme trở lên phải đổi sang menu thả
xuống: cái nút một-hình không cho người đọc nhìn thấy trước mình sắp đi đâu, và
quá ba lựa chọn thì việc mò mẫm ấy thành phiền.

**Tĩnh lặng là theme NỀN SÁNG,** không phải theme tối thứ hai. Thác nước ban
ngày; nền tối hoá ra là hang động. Nên nó để `color-scheme:light` và
`--chu-bong:none` — hai thứ ấy đi theo ĐỘ SÁNG của nền chứ không theo tên theme.

### 1.0 · Hệ điều hành không bao giờ tự chọn Tĩnh lặng

Máy chỉ báo được hai trạng thái, sáng hoặc tối. Không có `prefers-color-scheme:
calm`. Nên Tĩnh lặng **chỉ tồn tại khi người đọc tự bấm**, và trong `tokens.css`
nó chỉ có đúng MỘT khối — không có khối `@media` song sinh như Galaxy.

### 1.1 · Bốn khối, phải viết đủ cả bốn

```css
:root{ … }                                    /* 1. SAKURA — khai ĐỦ mọi biến */
@media (prefers-color-scheme:dark){
  :root:not([data-theme]){ … }                /* 2. máy để tối, chưa ai chọn  */
}
:root[data-theme="dark"]{ … }                 /* 3. GALAXY, người đọc tự chọn */
:root[data-theme="calm"]{ … }                 /* 4. TĨNH LẶNG, chỉ có khi tự chọn */
```

Khối (2) và (3) **phải lặp lại y hệt nhau** — media query và attribute selector
không giao nhau nên không kế thừa được của nhau.

> **Luật cứng.** Không bao giờ để một màu CHỈ tồn tại trong một khối. Máy để
> sáng mà người đọc bấm chọn tối là màu đó biến mất — và lỗi này chỉ lộ ra ở
> đúng một tổ hợp, nên rất dễ lọt qua lúc kiểm thử.

**Luật này đã bị vi phạm ngay trong chính file viết ra nó.** `--text-faint` ở
theme tối được sửa lên `.62` cho đủ tương phản ở khối (2), còn khối (3) nằm lại
`.50` (3,9:1). Ai để máy ở chế độ tối thì đọc được ngày tháng và tem chân trang;
ai tự bấm nút chọn tối thì không. Hai khối không bao giờ hiện cùng lúc nên
không ai bắt bằng mắt được. Nay có hai phép kiểm canh: một phép soi ba biến
quầng sáng ở **cả bốn khối**, một phép so Galaxy với Tĩnh lặng phải khai cùng
một bộ biến **và** hai khối Galaxy phải giống nhau **từng giá trị**.

### 1.1b · Vì sao khối (2) là `:not([data-theme])`

Hồi còn hai theme thì `:not([data-theme="light"])` và `:not([data-theme])` cho
ra cùng một kết quả. Thêm theme thứ ba vào thì không: `:not([data-theme="light"])`
khớp luôn cả `calm`, nên máy để tối mà người đọc chọn Tĩnh lặng là khối (2) và
khối (4) cùng nổ, **bằng điểm nhau** (0,2,0) và chỉ hơn thua ở thứ tự dòng
trong file. Một bảng màu quyết định bằng thứ tự dòng là bảng màu vỡ ngay lần
đầu có người dời khối đi chỗ khác.

`:not([data-theme])` nói đúng cái cần nói: **chưa ai chọn gì**. Đó là hai trường
hợp thật — tắt JavaScript, và `theme.js` gỡ attribute ra khi người đọc đổi cài
đặt máy mà chưa từng tự bấm chọn.

> **Bẫy đi kèm, đã vấp.** Vế thứ hai ấy chỉ đúng nếu `theme.js` **không** ghi
> localStorage ở cú gọi lúc nạp trang. Bản trước ghi, nên mở trang một lần là
> đã có "lựa chọn đã lưu", và từ đó trang thôi đi theo cài đặt sáng/tối của máy.
> Lỗi chỉ lộ ra ở lần mở trang thứ hai trở đi.

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

### 2.0 · LUẬT PHÔNG — BA HỌ, KHÔNG HƠN

> **Trang này dùng đúng BA họ phông tải về, cộng một họ hệ thống.** Thêm họ
> thứ tư là thêm 100–200 KB cho mọi người đọc, thêm một nhịp chữ nhảy lúc mở
> trang, và thêm một giọng nữa vào thứ vốn nên chỉ có một giọng.

| Token | Họ | Tải về? | Dùng khi |
|---|---|---|---|
| `--font-label` | Oswald | ✓ 400 · 500 · 600 | nhãn VIẾT HOA giãn rộng |
| `--font-display` | Cormorant Garamond | ✓ 500 · 600, cả nghiêng | tiêu đề · trích dẫn · sapo |
| `--font-body` | Be Vietnam Pro | ✓ 400 · 500 · 600 | mọi thứ đọc lâu |
| `--font-mono` | phông máy chữ của máy | ✗ **không tải** | số cần thẳng cột · khối mã · đường dẫn |

**`--font-mono` cố ý không tải file nào.** Nó chỉ gọi tên những phông máy chữ
đã có sẵn trên máy (`SF Mono`, `Cascadia Code`, `Consolas`…). Chữ máy chữ trên
trang này chỉ để **xếp thẳng cột** — ngày tháng, số bản vá, đường dẫn file —
chứ không phải để trưng bày, nên phông nào cũng xong việc, và 0 KB thì hơn
150 KB. Đây là lý do bảng lịch sử trông như dùng một phông thứ tư.

#### Ba luật phải giữ

1. **Không thêm họ thứ tư.** Cần một giọng khác thì đổi cân nặng, cỡ chữ, hay
   khoảng chữ trong ba họ đang có — đừng gọi thêm một họ.
2. **Chỉ xin những cân nặng đã tải: 400 · 500 · 600.** Không có face 700.
   Xin 700 thì trình duyệt **bịa** nét đậm — vẽ đè chính chữ ấy lệch đi vài
   phần pixel — và nét bịa nhoè nhất đúng ở chỗ tiếng Việt cần rõ nhất: dấu mũ,
   dấu móc, dấu thanh chồng lên nhau.
   > Đã vấp, và vấp ở chỗ đọc nhiều nhất: trình duyệt cho `<strong>` và `<b>`
   > cân nặng 700 theo **mặc định**, mà `prose.css` không đặt lại. Nên mọi cụm
   > chữ đậm trong mọi bài đều là nét bịa — đo được 30 cụm trên một bài. Nay
   > `.prose strong,.prose b{font-weight:600}`. **Phép kiểm #65** chặn việc này.
3. **Thêm cân nặng thì thêm ở `tools/phong.mjs`, không khai tay.** `fonts.css`
   do `npm run phong` sinh ra; sửa tay thì lượt chạy sau ghi đè mất.

**Không cần xoá gì khỏi kho mã.** 33 file trong `public/assets/fonts/` thuộc
đúng ba họ trên, và mọi cân nặng tải về đều có luật CSS dùng tới — đã đối
chiếu từng cái.

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
Last updated 17-Sep-2026 · V2.5.3
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

Mười ba file nguồn, gộp thành **sáu gói**, và mỗi trang chỉ tải gói của nó.
Trước V2.5.0 mọi trang tải chung một file 122 KB, mà đo ra **64–79% số luật
không khớp được gì** trên trang đang xem.

### Nguồn

| File | Chứa | Không chứa |
|---|---|---|
| `fonts.css` | `@font-face` cho ba họ chữ tự host (`npm run phong` sinh ra) | mọi thứ khác — đừng sửa tay |
| `tokens.css` | mọi biến màu, chữ, nhịp, bóng đổ · cả bốn theme | bất kỳ selector nào khác `:root` |
| `base.css` | reset, nền trang, chữ gốc, focus | component |
| `glass.css` | vật liệu kính + hai nhịp chuyển động | màu (đọc từ tokens) · bố cục |
| `layout.css` | header, chân trang, cột bài + mục lục, logo | style của thân bài |
| `components.css` | nút, chip, thẻ, huy hiệu, tooltip, `.bao`, `.trong`, bảng lịch sử | khung đọc bài |
| `quote.css` | ô trích dẫn — dùng ở CẢ màn hero lẫn /about/ | phần hero riêng (ở `list.css`) |
| `list.css` | trang danh sách, màn đầu, thẻ bài, ghi chú, chia trang, trang 404 | khung đọc bài · mọi thứ của /z-admin/ |
| `prose.css` | **toàn bộ khung đọc bài** + khung bình luận | mọi thứ ngoài `<article>` |
| `about.css` | riêng trang About — khung bento | mọi trang khác |
| `khoa.css` | khung đăng nhập (`/z-admin/` và `/notes/` cùng mượn) | bàn làm việc |
| `admin.css` | bàn làm việc của chủ trang — `.ad-*`, `.vb-*` | ô soạn thảo |
| `soan.css` | ô soạn thảo — `.sz-*`, kể cả khung cắt ảnh | bảng danh sách |

### Gói

| Gói | Gồm |
|---|---|
| `nen` | fonts · tokens · base · glass · layout · components |
| `ds` | quote · list |
| `bai` | prose |
| `gt` | about |
| `khoa` | khoa |
| `ql` | admin · soan |

### Trang nào lấy gói nào

Khai **thẳng** bằng `loaiCSS`, không đoán từ đường dẫn (xem `goiCuaTrang`):

| Loại | Gói | KB |
|---|---|---|
| trang bài (`bai`) | `nen + bai` | 84 |
| danh sách · kho lưu · tìm kiếm · trang chủ | `nen + ds` | 83 |
| `/about/` (`gt`) | `nen + gt + ds` | 90 |
| `/notes/` (`gc`) | `nen + ds + khoa` | 85 |
| `/z-admin/` (`ql`) | `nen + khoa + ql + ds` | 110 |

> **Đã vấp.** Bản đầu đoán loại trang bằng `duong`. Mọi trang BÀI đều truyền
> `duong: '/posts/'` (đó là mục đang mở trên thanh menu), nên cả chín bài nhận
> gói của trang danh sách và mất sạch `prose.css`. Trang vẫn dựng ra, không lỗi
> nào; chỉ là bài hiện lên trần trụi.

### Thứ tự trong một gói không đổi được

```
fonts → tokens → base → glass → layout → components → (quote → list) → prose → about
```

- `fonts` đầu tiên: `@font-face` phải khai trước luật nào dùng tới phông, không
  thì trang vẽ một nhịp bằng phông hệ thống rồi mới đổi
- `tokens` trước mọi thứ còn lại, vì chúng đọc biến của nó
- `glass` trước `components`, để component ghi đè được vật liệu khi cần
- `prose` sau `components`, để khung đọc bài ghi đè được component

> **Hệ quả phải nhớ.** Luật trong `prose.css` thắng luật cùng độ ưu tiên ở
> `layout.css`. Đã vấp: `.khung-b .post-cover{grid-column:full}` bị
> `.prose > .wide{grid-column:wide}` đè, nên ảnh bìa không tràn hết. Cách xử:
> thêm một bậc — `.khung-b .prose > .post-cover`.

> **Hệ quả thứ hai, nặng hơn.** Gói `nen` tải TRƯỚC mọi gói khác, nên một luật
> một-lớp ở `prose.css` hay `admin.css` sẽ thắng một luật một-lớp ở
> `components.css` dù cả hai cùng mức cụ thể. Cụm dùng chung nào đặt ở
> `components.css` cũng phải tính chuyện đó — xem §21.

### Hai cái bẫy của việc chia file

1. **Một cụm dùng ở hai loại trang phải nằm ở gói cả hai cùng tải.** Ô trích
   dẫn từng khai trong `about.css` mà còn ở màn hero trang chủ; trang chủ không
   tải file ấy nên câu trích dẫn mất phông nghiêng, mất cặp dấu ngoặc kép, nút
   xem câu khác rơi xuống đáy ô. **Phép kiểm #61** soi LUẬT TRẦN `.C{…}` để
   bắt đúng chuyện này — soi bằng tên lớp không bắt được, vì `list.css` vẫn
   nhắc `.q-chu` ở luật `.hero-quote .q-chu{font-size}`.

2. **Cắt file bằng tay thì cắt trúng chú thích.** Lượt tách `list.css` để
   `admin.css` mất dòng mở của một khối chú thích — dấu đóng còn lại thành rác,
   và trình duyệt bỏ luôn khối luật ngay sau nó. `soan.css` thì đứt hẳn phần
   đuôi. Build vẫn chạy, không cảnh báo gì. **Phép kiểm #60** quét cú pháp mọi
   file CSS.

---

## 8 · BA KHUNG TRÌNH BÀY BÀI

Chọn bằng `khung:` trong front matter. Cả ba dùng **chung một HTML**, chỉ đổi
cách xếp bằng grid — nên đổi khung không phải viết lại template nào.

| Khai là | Lớp CSS | Dáng | Hợp với | Ký tự/dòng |
|---|---|---|---|---|
| **`post left`** *(mặc định)* | `.post-left` | cột đọc bám trái + mục lục dính phải | bài phân tích nhiều mục | 71 |
| **`post full`** | `.post-full` | bìa tràn màn, tiêu đề giữa, không cột phụ | bài kể chuyện, nhiều ảnh | 74 |
| **`post insta`** | `.post-insta` | băng ảnh dính trái, chữ phải, không mục lục | vài tấm ảnh + mấy dòng tản mạn | 66 |

Dưới 1080px cả ba về **một cột**.

> **Trước đây ba khung gọi là `A` · `B` · `C`.** Ba chữ cái ấy không nói gì:
> muốn biết `B` là gì thì phải mở tài liệu ra tra, mỗi lần viết bài lại tra một
> lần. `khung: post left` thì đọc được ngay trong front matter. Tên cũ vẫn nhận
> để bài cũ không phải sửa, nhưng chỉ dạy tên mới.

> **Hiện toàn bộ bài đang dùng `post left`** — kiểu của bài "Chiếc gương".
> `post full` chưa có công dụng rõ. `post insta` còn đó và chạy được; nó là nơi
> cặp lùi/tới `.rn-cap` ra đời, và khối "đọc tiếp" của mọi khung nay mượn lại
> đúng hình ấy (§8.2).

**`post insta` khoá chiều cao băng ảnh theo MÀN, không theo tỉ lệ ảnh.** Băng ảnh
dính khi cuộn, nên cả cụm ảnh + chú thích + hàng chấm phải lọt trong một màn
(`max-height:min(64vh,620px)`). Cao theo tỉ lệ ảnh thì một tấm dọc đẩy hàng chấm
xuống dưới nếp gấp và người đọc không bao giờ biết là còn ảnh nữa.

Tỉ lệ khung thì lấy theo tấm **đầu tiên**, kẹp trong khoảng Instagram và
Facebook cho phép — 4:5 dọc nhất, 1.91:1 ngang nhất. Cả băng một khung, vì mỗi
tấm một khung thì khối cao thấp nhảy loạn mỗi lần trượt. Ảnh lệch khỏi khung vẫn
vào trọn (`contain`): ảnh kỉ niệm thì phần rìa hay lại là phần có người.

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

> **Bẫy đã vấp (`post full`).** `--measure` khai ở `.prose` thì chỉ thân bài rộng
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

### 9.1 · Ô quản trị cũng tiếng Anh

Từng có một ngoại lệ: `/z-admin/` viết tiếng Việt, lý do ghi trong mã là "chỉ
chủ trang đọc mấy dòng này, mà chủ trang đọc tiếng Việt nhanh hơn". Ngoại lệ ấy
**đã bỏ** — 101 nhãn trong bảng `NHAN` cộng 115 chuỗi dự phòng trong
`src/js/*.js` nay đều tiếng Anh.

Lý do bỏ: ô quản trị không phải một ứng dụng riêng, nó là **cùng một trang**.
Người viết đi từ trang bài sang ngăn Post là đi qua hai thứ tiếng trong hai cú
bấm, và mọi thành phần dùng chung — nút, chip, ô nhập, câu báo lỗi — phải mang
hai bộ nhãn cho cùng một hình dáng. Một bộ nhãn thì không có gì để trôi lệch.

### 9.2 · Một ngoại lệ còn lại: tên màu chữ

Bảng màu trong ô soạn thảo vẫn ghi **Tím · Hồng · Đỏ · Cam · Vàng · Lục · Lam ·
Xám**, không dịch. Không phải bỏ sót.

Cú pháp màu ghi vào file `.md` là `{tím: chữ}` — tên màu tiếng Việt là **một
phần của cú pháp**, không phải một nhãn giao diện. Nút ghi "Purple" mà file ghi
`tím` thì hai thứ nói hai chuyện, và bảng chỉ dẫn ở nút `i` (dạy đúng cú pháp
ấy) mất luôn chỗ bám. Nhãn ở đây phải nói ra **cái sắp được viết**.

Đổi được, nhưng phải đổi cả ba nơi cùng lúc: `TEN_MD` trong `src/js/soan.js`,
`MAU`/`RE_MAU` trong `tools/lib/markdown.mjs`, và mọi bài `.md` đã dùng màu.

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

Ba hiệu ứng, tự đổi theo theme. Bảng tra `BO` ở phần ĐIỀU PHỐI của
`src/js/nen.js` là **chỗ duy nhất** biết theme nào đi với hiệu ứng nào — thêm
theme là thêm đúng một dòng ở đó, không phải đi sửa một chuỗi `if`.

| Theme | Hiệu ứng | Gốc |
|---|---|---|
| Sakura | cánh hoa anh đào rơi chéo | HAN-961030-a |
| Galaxy | đĩa thiên hà xoắn ốc | HAN-961030-b |
| Tĩnh lặng | thác nước · giọt · gợn · mặt nước | dựng mới cho blog |

### 12.0 · Thác nước — bốn tầng, và vì sao tầng GIỌT là tầng quan trọng nhất

| Tầng | Làm gì |
|---|---|
| 1 · MÀN NƯỚC | vệt dọc rơi nhanh, **tan dần** trước khi chạm mặt nước |
| 2 · GIỌT | vài hạt rời, to và chậm hơn, rơi **tới cùng** và chạm mặt nước |
| 3 · MẶT NƯỚC | dải nước đậm dần xuống chân màn + lằn sáng + sóng lăn tăn |
| 4 · GỢN | vòng sóng loang ra từ **đúng chỗ giọt vừa chạm** |

Bản đầu chỉ có màn nước cộng vòng sóng ngẫu nhiên ở đáy. Nhìn ra ngay là sai:
vệt nước tan giữa chừng còn vòng sóng thì nổi lên ở chỗ chẳng có gì rơi xuống,
nên hai tầng đọc thành hai hiệu ứng rời nhau chạy song song. **Mắt người bắt
quan hệ nhân quả rất nhanh** — phải có một vật rơi tới nơi và vòng sóng phải nở
ra từ đúng chỗ nó chạm, thì cả màn mới thành một cảnh.

Ba chỗ dễ làm sai:

- **Vệt nước phải TAN, không được cắt cụt.** Cắt ở đúng đường nước thì mỗi vệt
  kết thúc bằng một nhát dao ngang, và cả màn có một đường kẻ thẳng mà mắt bắt
  được ngay. Nhạt dần trong 22% chiều cao cuối thì nước "đi vào" bụi sương.
- **Mặt nước là một MẶT, không phải một đường.** Nhìn xiên từ trên xuống thì chỗ
  xa nằm cao trên màn, chỗ gần nằm thấp. Giọt và gợn rải trong cả dải; dồn hết
  vào một đường thì vũng nước bẹp thành một sợi chỉ.
- **Gợn vẽ bằng ELIP, không phải hình tròn.** Vòng sóng tròn chiếu lên màn nhìn
  xiên thì thành hình bẹt. Vẽ tròn là cả vũng nước dựng đứng lên như tấm bảng.

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

Tên trang tách làm ba mảnh — chữ đầu, từ giữa, từ cuối — nhưng **chỉ có HAI
dòng**: từ giữa nằm ngay trong dòng một.

Hai dòng ấy **xếp theo dòng chảy bình thường**, và cả cụm căn giữa theo chiều dọc
bằng flex. Bản đầu cho mỗi dòng một toạ độ `top` riêng, dòng đầu lấy toạ độ âm để
bị viền trên xén — kết quả là chữ đầu bay quá cao và **mất mất một phần**. Căn
giữa bằng flex thì không mất chữ nào, mà từ cuối vẫn chạy khỏi đường kẻ phải.

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
| chữ đầu | rất lớn, khuất **một phần ba** sau đường kẻ trái | co lại còn khoảng một nửa, lùi hẳn vào trong |
| phần còn lại của từ đầu | giấu bằng `letter-spacing` âm | chạy vào, hiện đủ |
| từ giữa | nhỏ, nép sát bên phải chữ đầu (hở 6px) | **về cùng hàng** với từ đầu |
| từ cuối | trải hết bề ngang cột, chữ cuối khuất **một nửa** sau đường kẻ phải | co **nhẹ**, nằm trọn trong khung |

### 16.2b · Xén bao nhiêu là con số, không phải là ướm

Hai đầu dòng đều lấn qua đường kẻ, và mức lấn phải **đều nhau về ý**: một phần
ba ở trái, một nửa chữ cuối ở phải. Xén đều hai bên thì cả khối đọc ra là được
đặt vào khuôn rồi khuôn cắt bớt — cố ý. Xén một bên thì đọc ra là tràn lề.

Cỡ chữ của dòng dưới **giải ra** từ hai con số đo trong trình duyệt, không ướm:

```
cả từ "Borderland"  = 5,117 × cỡ chữ   (đã gồm mười nhịp letter-spacing)
riêng chữ "d" cuối  = 0,538 × cỡ chữ

339 + .0584·cỡ + 5.1168·cỡ = 1050 + .5381·cỡ ÷ 2
      └ mép trái cột          └ mép phải cột   └ nửa chữ "d" thò ra
→ cỡ × 4,906 = 711  →  cỡ ≈ 144,9px  →  20,35cqw
```

Đổi phông hay đổi tên blog là phải đo lại rồi giải lại. Có một phép kiểm canh
mức lấn không vượt quá nửa chữ cuối — nó từng bắt được bản để 26cqw, lấn 143%
cỡ chữ, mất hẳn hai chữ cuối và trên màn hình đọc ra là "Borderl".

### 16.2c · Căn giữa theo VÙNG TRỐNG, không theo cả cột

Đáy cột có hàng nút ("Read on" và nút trích dẫn) chiếm khoảng 7% chiều cao màn.
Căn giữa cả cột thì khối chữ bị đẩy xuống nằm đè lên vùng ấy, và mắt đọc ra là
"chữ nằm thấp" — dù về hình học thì nó đúng giữa.

Chừa dải ấy ra bằng `padding-bottom` rồi mới căn giữa. Chừa **dư** một nhịp là
cố ý: khối này nặng đáy (dòng dưới dài gấp ba dòng trên), mà chữ nặng đáy thì
phải đặt cao hơn tâm hình học một chút mới *nhìn* ra là ở giữa.
| độ mờ | 17% (sáng) · 22% (tối) | 96% |

Từ cuối chỉ co nhẹ (24 → 20cqw) chứ không co mạnh: cỡ lúc mờ đã đúng rồi, co
mạnh là mất luôn sức nặng của nó.

**Ba chỗ quyết định cách viết:**

- **Từ giữa nằm TRONG dòng một, không phải một khối riêng.** Chỉ khi nó là chữ
  cùng dòng thì lúc co lại nó mới về đúng hàng với từ đầu — ba khối tách rời thì
  CSS phải biết trước bề rộng chữ "Zoey" mới xếp được "in" ngay sau, mà bề rộng
  ấy đổi theo font và theo cỡ. Lúc nghỉ nó bị đẩy lệch sang phải bằng `translate`
  — dịch chỗ **nhìn** mà không dịch chỗ **nằm** — nên lúc co lại chỉ cần trả
  `translate` về 0 là nó tự về hàng.
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

---

## 17 · TRANG DANH SÁCH: SỐ TRANG VÀ GIÃN CÁCH

### 17.1 · Số trang cắt ở trình duyệt, không cắt lúc dựng

Cách quen thuộc là dựng sẵn `/posts/`, `/posts/2/`, `/posts/3/`… Không làm thế,
vì hai lẽ:

1. **Người đọc được chọn số bài mỗi trang** (10 · 20 · 50 · tất cả, nhớ lại cho
   lần sau). Cắt lúc dựng thì mỗi lựa chọn là một bộ file riêng — và số file
   nhân lên theo từng chuyên mục, từng tag.
2. **Không tải lại trang.** Bấm sang trang 2 là đổi ngay.

Cái giá: mọi bài nằm sẵn trong HTML. Với blog cá nhân vài trăm bài thì đó là
vài chục KB — rẻ hơn một vòng mạng. Tới khi kho bài lớn tới mức HTML nặng thật
thì mới phải đổi cách.

**Không có JavaScript:** thấy đủ mọi bài, không có bộ số. Đó là trạng thái đúng
chứ không phải hỏng — máy tìm kiếm cũng đọc được trọn danh sách thay vì phải mò
theo từng trang.

Mặc định khai ở `site.config.json` → `moiTrang` (10). Danh sách ngắn hơn con số
ấy thì không bọc khung phân trang — thêm một lớp div và một ô chọn chẳng để làm
gì.

### 17.2 · `[hidden]` phải thắng mọi khai báo `display`

```css
[hidden]{display:none !important}
```

Trình duyệt cài sẵn `[hidden]{display:none}` ở mức **user agent**, tức là yếu
hơn bất cứ luật nào mình viết. Nên `.the-bai{display:flex}` thắng nó, và
`el.hidden = true` trong JavaScript **không giấu được gì cả**.

Đã vấp thật khi làm bộ số trang: JavaScript đặt `hidden` cho đúng số thẻ, không
lỗi nào cả, mà trang vẫn hiện nguyên tám bài. Đọc `el.hidden` thì thấy `true` —
phải đo `getComputedStyle` mới lộ ra. Bài học cho việc kiểm thử: **đo cái mắt
thấy, đừng tin thuộc tính**.

`!important` ở đây là đúng chỗ: `hidden` mang nghĩa "không liên quan lúc này",
và không có ngoại lệ nào cho nó.

### 17.2b · Một bộ luật, mọi trang danh sách

Đây là bảng đầy đủ. Trang nào cắt gì, mỗi trang bao nhiêu, và cắt bằng cái gì —
tất cả đi qua **một** hàm (`bocPhanTrang` trong `tools/build.mjs`) và **một**
file chạy ở trình duyệt (`src/js/trang-so.js`). Không có trang nào tự dựng cơ
chế riêng.

| Trang | Cắt cái gì | Mỗi trang | Người đọc đổi được? |
|---|---|---|---|
| `/posts/` | **khối chuyên mục** | **6** | không — con số này là quyết định trình bày |
| `/posts/<mục>/` | thẻ bài | `moiTrang` (10) | có: 10 · 20 · 50 · tất cả |
| `/tags/<tag>/` | thẻ bài | `moiTrang` | có |
| `/archive/` | dòng bài | `moiTrang` | có |
| `/notes/` | ghi chú | `moiTrang` | có |
| `/search/` | — | không cắt | — |

Ba điều rút ra từ bảng:

1. **Trang mục lục cắt theo KHỐI, trang danh sách cắt theo BÀI.** `/posts/` là
   một bảng mục lục — mỗi mục ở đó là cả một chuyên mục, không phải một bài.
   Sáu là con số liếc hết được trong một hai màn; quá đó thì nó thành cuộn dài,
   mà cuộn dài đúng là thứ trang chuyên mục sinh ra để thay thế.
2. **Con số nào người đọc đổi được, con số nào không.** Số BÀI mỗi trang là
   chuyện tiện dùng — ai thích cuộn dài thì chọn 50. Số CHUYÊN MỤC mỗi trang là
   chuyện trình bày, và mở cho đổi thì có lúc mở ra một trang hai mươi khối.
3. **`/search/` không cắt trang.** Kết quả tìm kiếm đã được chính câu tìm lọc
   rồi; cắt thêm một lần nữa là bắt người đang tìm phải tìm trong kết quả tìm.

Danh sách ngắn hơn con số của nó thì **không bọc khung phân trang** — thêm một
lớp div và một ô chọn chẳng để làm gì.

### 17.2c · Chip lọc — một thành phần, ba nơi

`/posts/` lọc theo chuyên mục, `/notes/` lọc theo loại, `/search/` lọc theo chủ
đề. Ba việc khác nhau, **một** thành phần giao diện.

| | `/posts/` | `/notes/` | `/search/` |
|---|---|---|---|
| khối bọc | `.chip-hang` | `.chip-hang .gc-loc` | `.chip-hang .tk-loc` |
| thẻ HTML | `<a>` | `<button>` | `<button>` |
| số đếm | `.chip-so` | `.chip-so` | `.chip-so` |
| đang bật | `.chip--nay` | `.chip--nay` | `.chip--nay` |
| dựng ở đâu | build | build **và** `ghi-chu.js` | `search.js` |

**Hình dáng do `.chip` và `.chip-hang` quyết định, không nơi nào tự khai.** Ba
nơi từng có ba khoảng cách khác nhau (5 · 5 · 8px) vì mỗi nơi tự viết lấy — sai
lệch không ai thấy khi nhìn từng trang, mà chuyển giữa ba trang thì thấy ngay
hàng chip nhảy một cái. Nay `.gc-loc` và `.tk-loc` chỉ còn giữ phần **lề** của
riêng mình.

**Thẻ HTML khác nhau là cố ý.** `/posts/` dùng `<a>` vì mỗi chip là một trang
thật: bấm là đổi đường dẫn, mở tab mới được, máy tìm kiếm đi theo được. Hai nơi
kia dùng `<button>` vì chúng lọc tại chỗ. Cùng hình dáng, khác hành vi — và
hành vi phải nói bằng đúng thẻ của nó, không phải bằng CSS.

**Chip "Tất cả" không mang số.** Con số của nó là tổng, mà tổng đã in ở dòng
dẫn ngay trên (`6 chuyên mục · 9 bài`). Hai lần cùng một con số cách nhau vài
chục pixel thì cái nào cũng thành thừa.

### 17.5 · Một khuôn dòng, và hai vai của một danh sách

Sáu chỗ liệt kê bài theo cùng một kiểu — một dòng cho một bài, ngăn nhau bằng
sợi kẻ:

| Lớp | Ở đâu | Cột trái | Cột phải | Vai |
|---|---|---|---|---|
| `.hero-dong` | ba bài mới nhất ở màn đầu | số thứ tự | ngày | trưng bày |
| `.rn-dong` | gợi ý đọc tiếp cuối bài | loại (related/newer/older) | ngày | trưng bày |
| `.mc-dong` | bài trong một ô bento ở `/posts/` | số thứ tự | ngày | điều hướng |
| `.kho-dong` | bài trong một năm ở `/archive/` | ngày | chuyên mục | điều hướng |
| `.ben .rn-dong` | gợi ý đọc tiếp ở cột bên | loại | ngày | điều hướng |
| `.rn-p` | cặp lùi / tới ở khung ảnh | mũi tên + nhãn | — | điều hướng |

**Luật chung.** Ai lệch thì phải có lý do ghi ngay tại chỗ lệch:

- **tiêu đề** — phông tiêu đề, nghiêng, `--fs-h4`, một dòng, tràn thì cắt bằng `…`
- **nhãn và ngày** — Oswald hoa, `--fs-3xs`, `--text-faint`, số dùng bản đều bề ngang
- **ngăn cách** — một sợi kẻ `--line` giữa hai dòng, và kẻ ở hai đầu danh sách
- **rê chuột** — đổi MÀU chữ và đẩy sang phải `var(--s2)`. **Không đổi nền:**
  đổi nền thì hai sợi kẻ trên dưới phải đổi theo mới không hở, tức là ba thứ
  động cho một cú rê chuột

**Vì sao phải viết luật này ra.** Trước khi có nó, Archive dùng phông thân bài
và đổi NỀN khi rê vào, ba chỗ kia dùng phông tiêu đề nghiêng và đổi MÀU. Đi từ
`/posts/` sang `/archive/` là gặp hai danh sách trông như của hai trang web
khác nhau — dù chúng nói đúng một chuyện. Không ai thấy khi nhìn từng trang;
chỉ thấy khi đi qua lại.

**Cột "Vai" quyết định phông của tiêu đề, và đó là ngoại lệ DUY NHẤT.**

- **trưng bày** — mời người đọc dừng lại ở một bài. Giữ Cormorant nghiêng,
  `--fs-h4`.
- **điều hướng** — quét mắt tìm một cái tên đã biết. Đổi sang phông thân bài,
  `--fs-sm`, không nghiêng.

Ba chỗ điều hướng có chung một hoàn cảnh: cột hẹp (cột bên 320px, ô bento
300px) hoặc danh sách dày (kho lưu, hai ba chục dòng liền). Ở đó một cột toàn
chữ nghiêng cỡ lớn đọc ra là mấy chục khối trang trí xếp chồng, không đọc ra là
một bảng tra. Con số năm ở `/archive/` và tên chuyên mục ở `/posts/` theo cùng
một luật, vì cùng một lý do: cỡ cũ của chúng gần bằng tiêu đề của chính trang,
nên trang mất thứ bậc — cái gì cũng là tiêu đề thì không cái nào là tiêu đề.

**Thêm một danh sách mới thì thêm lớp vào bảng trên**, đừng khai lại cỡ chữ.

### 17.3 · Giãn cách: trang danh sách khác trang bài

| | Trang bài | Trang danh sách |
|---|---|---|
| dưới đầu đề | 40px | **24px** |
| giữa các thẻ | — | **12px** |
| trong thẻ | — | 20px trên, 16px dưới |
| giữa các năm (Archive) | — | **32px** |

40px dưới đầu đề là khoảng của một trang **bài**, nơi tiêu đề phải tách hẳn khỏi
thân bài. Ở danh sách thì tiêu đề và danh sách là **một khối việc** — 24px là
đủ, còn 40px đẩy bài đầu tiên xuống dưới nếp gấp trên laptop 13".

### 17.4 · Trang chủ giữ tối đa 6 bài

`site.config.json` → `baiTrangChu` (6), không kể bài nổi bật. Trang chủ là chỗ
**mời vào**, không phải chỗ liệt kê kho bài: đổ hết bài ra đây thì cuộn mãi
không hết mà vẫn không có cách nào lọc.

Dưới lưới có **hai** lối đi chứ không phải một — Posts xếp theo chuyên mục,
Archive xếp theo năm. Hai cách tìm khác nhau, nên để cả hai thay vì bắt người
đọc đoán.

---

## 18 · CHỮ ĐỂ ĐỌC — THÂN BÀI

Mục này trả lời câu "Medium làm gì mà đọc êm thế, có gì học được không".
Câu trả lời ngắn: **ba con số** — cỡ chữ, khoảng dòng, và bề ngang cột chữ —
và chúng phải được chọn **cùng nhau**, không chọn riêng.

### 18.1 · Ba con số, và vì sao chúng đi với nhau

| | Trước | Nay | Vì sao |
|---|---|---|---|
| Cỡ chữ thân bài | 16.5–18.5px | **16.5–17.5px** | xem dưới |
| Khoảng dòng | 1.78 | **1.65** | 1.78 là khoảng của thơ, không phải của văn xuôi |
| Bề ngang cột chữ | 58ch | **66ch** | khoảng đọc êm là 60–75 ký tự một dòng |
| Cách hai đoạn | 1.5 × cỡ chữ | **1.25 ×** | phải NHỎ HƠN một chiều cao dòng |
| Cách quanh ảnh | 1.9 × | **1.45 ×** | 1.9 là một khoảng trắng to bằng cả đoạn văn |

**Chữ "to" thường không phải lỗi của cỡ chữ.** Cảm giác "chữ to quá" ở bản
trước đến từ khoảng dòng 1.78 cộng cột chữ 58ch: khối chữ nở ra, mỗi dòng ít
chữ, và mắt phải xuống dòng liên tục. Hạ khoảng dòng và nới cột chữ thì cùng
một cỡ chữ đã đọc ra là vừa. Cỡ chữ chỉ hạ một bậc nhỏ.

**Vì sao vẫn 1.65 chứ không 1.5 như tiếng Anh.** Tiếng Việt có dấu chồng cả
trên (ế, ữ) lẫn dưới (ạ, ộ). Khoảng dòng của tiếng Anh làm dấu của dòng dưới
đụng dấu của dòng trên. 1.65 là chỗ vừa đủ hở.

**Vì sao khoảng cách hai đoạn phải nhỏ hơn một dòng.** Lớn hơn thì mỗi đoạn
thành một hòn đảo, và mắt phải NHẢY từ đảo này sang đảo kia thay vì trôi. Đây
là chỗ trang này từng sai rõ nhất.

### 18.2 · Căn đều hai bên — và vì sao ở đây nó được phép

Sách giáo khoa dạy: **đừng căn đều khi không có ngắt âm tiết.** Thiếu ngắt thì
trình duyệt phải kéo giãn khoảng trắng để lấp cho đủ dòng, và những khoảng
giãn ấy xếp chồng nhau thành "dòng sông" trắng chạy dọc giữa đoạn.

Luật ấy đúng — **cho tiếng Anh.** Khoảng trắng chỉ phải giãn nhiều khi một từ
DÀI không chịu xuống dòng. Nên câu hỏi thật là: *tiếng Việt có từ dài không?*

Đo trên chính kho bài này:

```
5.888 từ
dài trung bình      3,5 ký tự
phân vị 95           5  ký tự
dài nhất            11  ký tự
từ dài quá 8 ký tự  0,1%
```

**Gần như không có từ dài nào.** Tiếng Việt viết rời từng âm tiết, nên mỗi
"từ" trên trang chỉ là một âm — và một dòng 66 ký tự chứa tới ~15 từ. Giãn
chỗ hở ra 15 khe thì mỗi khe chỉ nhích vài phần mười milimét.

Nên ở đây **căn đều được phép**, và không cần ngắt âm tiết (`hyphens:auto` vẫn
phải TẮT — trình duyệt sẽ cắt "nghiêng" thành "ngh-iêng").

**Một điều kiện còn lại: cột phải đủ rộng.** Dưới khoảng 45 ký tự một dòng thì
mọi ngôn ngữ đều hở, vì mỗi dòng chỉ còn 8–10 khe để chia. Nên dưới 560px —
điện thoại đứng — căn đều tự tắt, trả về căn trái.

### 18.3 · Đầu bài rộng hơn cột chữ

Luật 60–75 ký tự viết cho **văn xuôi**. Tiêu đề, dòng phân cấp và hàng meta đều
là dòng NGẮN, chúng không phải tuân theo luật ấy.

Khoá đầu bài đúng bằng cột chữ thì tiêu đề dài gãy làm đôi trong khi nửa phải
trang bỏ trống — đọc ra là hỏng bố cục. `--measure-de` (58rem) rộng hơn
`--measure` (66ch) đúng vì thế. Riêng ô tóm tắt trong đầu bài vẫn giữ bề ngang
cột chữ: nó là văn xuôi thật.

Và khi bài **không có mục lục** (dưới hai tiêu đề), lưới phải thu về một cột.
Giữ chỗ 210px cho một cột trống là bóp đầu bài lại mà chẳng để làm gì.

### 18.4 · Một câu dẫn, một khuôn

Ô tóm tắt dưới tiêu đề và câu dẫn trong thân bài (`.lead`) làm **cùng một
việc**: nói trước bài này về cái gì. Nên chúng dùng chung một khuôn — cùng chữ
nghiêng, cùng gạch dọc bên trái, cùng màu. Trước đây mỗi chỗ một kiểu và người
đọc gặp hai thứ trông khác nhau trong cùng một trang.

Hệ quả cho bài nhập từ nơi khác: bản xuất WordPress hay mở bài bằng một khối
trích dẫn — chính là câu dẫn. Công cụ nhập lấy nó làm tóm tắt **và bỏ nó khỏi
thân bài**; giữ cả hai là bắt người đọc đọc một đoạn hai lần, cách nhau chưa
tới một màn.

### 18.5 · Hàng meta: một dòng, và mọi con số đứng trên nút của nó

Dưới tiêu đề có **đúng một hàng**:

```
15 Sep 2026 · 6 views      [♥ 12]  [chia sẻ]  [💬 3]
└── chữ để ĐỌC ───────┘    └── nút để BẤM ───────────┘
```

**Luật: một con số xuất hiện đúng một lần, và nó đứng trên thứ sinh ra nó.**
Lượt thích và số bình luận in ngay trong nút tim / nút bình luận. Lượt xem ở
lại phần chữ, vì nó **không có nút** — không ai "bấm để xem".

Bản trước tách hai việc ấy ra: số ở hàng meta để đọc, nút ở một hàng riêng bên
dưới để bấm. Lý lẽ khi đó nghe hợp lý ("nút là chỗ bấm, hàng meta là chỗ đọc"),
nhưng trên màn hình nó ra thành **hai trái tim cạnh nhau** — và người đọc bấm
vào cái họ thấy trước, đúng cái không bấm được. Gộp lại thì con số nhảy ngay
dưới ngón tay vừa bấm.

**Nhãn "Leave a note" đã bỏ.** Ba cái icon nói đúng thứ nó nói, và một nhãn
Oswald hoa đặt trước chúng chỉ thêm một dòng cho cùng một câu.

**Cụm này đứng ở đây trong MỌI khung bài** (A · B · C). Cùng một thứ nằm ba chỗ
tuỳ khung là bắt người đọc đi tìm lại nó mỗi lần mở một bài khác kiểu — mà ba
khung ấy chỉ khác nhau ở cách bày ẢNH, không khác nhau ở chuyện thả tim.

Chỉ **đích đến** của nút bình luận là khác, và `binhLuanODau()` trong
`tools/build.mjs` là chỗ duy nhất quyết định:

| Khung | Bấm nút bình luận thì… |
|---|---|
| A (có cột bên, ≥1080px) | khung viết dời sang **cột phải**, thế chỗ mục lục |
| còn lại | **nhảy tới** ô viết, nằm ngay dưới hàng tag |

Build ghi lựa chọn ấy vào `data-o` trên chính cái nút, và `src/js/comments.js`
đọc nó. Trước đây file JS tự suy ra bằng cách hỏi DOM xem lưới có mang lớp
`khung-a` không — suy ra được, nhưng đó là bản sao thứ hai của một luật đã có
nơi khác, và hai bản sao thì sớm muộn lệch nhau.

**Cột phải rộng cố định 320px**, cả lúc thường lẫn lúc đang viết bình luận. Bản
trước là 280px rồi nở ra 400px khi bấm: cả trang xô lại một nhịp đúng lúc người
đọc đang nhìn nó. Đổi một trong hai con số ấy thì đổi luôn ở chú thích đầu khối
ĐÓNG MỞ trong `src/js/comments.js`.

### 18.6 · Khung ảnh: cặp lùi / tới thay cho danh sách gợi ý

`post insta` chỉ có một băng ảnh và vài dòng chữ. Dán vào cuối nó ba dòng gợi ý —
mỗi dòng một nhãn loại, một tiêu đề nghiêng cỡ lớn và một ngày — là thêm một
khối chữ nặng bằng cả phần chữ của chính bài.

Ở đó khối "đọc tiếp" co thành hai đường đi ở hai mép: **bài cũ hơn bên trái,
bài mới hơn bên phải**, mũi tên quay ra ngoài. Nó lặp đúng cử chỉ lật ảnh của
băng ảnh ngay phía trên, nên không phải học thêm gì.

- xếp theo **ngày**, không theo tag — một trục thời gian thì phải là thời gian
- **không in ngày tháng**: tên bài đủ để quyết định, còn ngày đã có cả một
  trang kho lưu lo
- ở đầu và cuối danh sách, phía thiếu để một **ô rỗng giữ chỗ** — bỏ hẳn thì
  nút còn lại trượt về giữa và mất nghĩa "trái là lùi, phải là tới". Dưới
  520px ô rỗng co về 0, để nút duy nhất được cả hàng.

### 18.7 · Bài dài: cụm nút đi theo người đọc

Trên **2.500 ký tự** (chữ trơn, không kể thẻ), cụm tim · chia sẻ · bình luận
rời hàng meta khi hàng ấy trôi khỏi màn hình:

| Khổ màn | Nó về đâu |
|---|---|
| ≥1080px, `post left` | **cột phải**, dưới khối "đọc tiếp" — cột dính khi cuộn |
| còn lại | một cụm **nổi ở góc dưới phải**, nút tròn 42px |

Bốn trường hợp **không** dời: bài ngắn · hàng meta vẫn trong tầm mắt · khung
bình luận đang chiếm cột phải · đã cuộn tới chân bài ở khổ hẹp (cụm nổi sẽ che
mất nút Gửi).

**DỜI, không chép.** Trạng thái — đã thả tim chưa, mấy lượt thích, mấy bình
luận — nằm trong chính phần tử ấy. Dựng một cụm thứ hai là hai `aria-pressed`,
hai con số, và mọi tham chiếu của `comments.js` trỏ vào bản cũ. Cùng nguyên tắc
với cách khung bình luận dời sang cột phải (`src/js/comments.js`).

Ngưỡng đổi chỗ đặt ở **đúng mép trên màn hình**, không có `rootMargin`: thêm lề
âm thì có một quãng cả hai cùng nằm trong tầm mắt — hai cụm nút giống hệt nhau
trên một màn.

### 18.8 · Kính phủ: đừng lồng `backdrop-filter`

Tấm menu ☰ nằm **bên trong** `.site-head`, mà thanh ấy đã có `backdrop-filter`.
Theo chuẩn, một phần tử có `backdrop-filter` trở thành **gốc nền** cho mọi con
cháu: lớp nhoè của con chỉ lấy mẫu được cái nền đã gộp của cha, trong đúng
khung của cha. Tấm menu thì thò xuống dưới thanh — phần thò ra không có nền nào
để lấy mẫu, và Chrome trả về một lớp rỗng.

Hậu quả nhìn thấy: tấm menu **gần như trong suốt**, tiêu đề bài đọc xuyên qua,
chữ trong menu thì chìm. Dựng lại được: tắt một dòng `backdrop-filter` là nó
đặc lại ngay.

Nên có biến thể **`.glass--tam`** — ruột `--glass-tam` tự nó đã đủ đặc (0.985 →
0.945), giữ nguyên vệt sáng mép và bóng đổ, và **không** có `backdrop-filter`.
Vẫn là kính, chỉ là kính mờ — đúng như menu của iOS khi nó bung ra trên một
trang đầy chữ.

**Luật chung: đừng lồng `backdrop-filter` trong `backdrop-filter`.** Mảnh nào
bung ra đè lên nội dung thì dùng `.glass--tam`.

---

## 19 · LOGO

Một hình, dựng ra bằng cách kể lại chính cái tên co lại — rồi phá nó đi và kể lại:

```
Zoey in Borderland
   ↓  cả dòng bóp lại còn một điểm
nét gấp khúc hình chữ Z
   ↓  một nét thẳng nối ĐỈNH PHẢI xuống ĐÁY TRÁI     ← chữ i
VÔ CỰC DẠNG ĐA GIÁC        (nút thắt, bốn cạnh một chỗ cắt)
   ↓  xoay ngang rồi bo góc
VÔ CỰC THỨ NHẤT
   ↓  chữ B, BỤNG DƯỚI vòng ra                        ← chữ B
VÔ CỰC THỨ HAI
   ↓  bốn cánh nở thành tám
MANDALA
   ↓  xoay chậm → nhanh → VỠ, mười tám hạt bụi rơi
   ↓
tụ lại, kể lại từ đầu
```

### 19.0 · Nét nối phải chạm vào ĐÚNG hai đầu tự do

Nét chữ Z có hai đầu tự do: `(35,13)` và `(13,35)` trong toạ độ của file. Nét
nối chạy đúng giữa hai điểm ấy, nên nối nó vào là **khép hình lại**.

Và khép xong thì nó tự thắt nút: đường chéo sẵn có của chữ Z chạy
`(35,35)→(13,13)`, nét nối chạy `(35,13)→(13,35)` — hai đường **cắt nhau ngay
giữa khung**, ở đúng `(24,24)`. Bốn cạnh, một chỗ cắt: một vô cực dạng đa giác.
Từ đó chỉ cần bo góc là ra vô cực nét cong.

> **Bản trước để `M24 15V33`** — một vạch dựng giữa khung, quét vào rồi xoay
> ngang. Nhìn thì có động, nhưng nó **không nối vào đâu cả**: hai đầu chữ Z vẫn
> hở nguyên, và chặng sau chữ Z cong ra thành vô cực mà chẳng nhờ gì tới nó.
> Nét nối phải chạm vào đúng hai đầu ấy thì cả chuỗi mới đọc ra là nhân quả.

**Nét nối nằm ở nhóm khác nên nó KHÔNG tự ăn theo phép xoay của chữ Z.** Phải
lặp lại cùng giá trị `rotate` ở cùng các mốc trong `@keyframes lg-noi`. Lệch một
mốc thôi là hai đầu nó rời khỏi hai đầu chữ Z, và cái nút thắt — thứ cả chặng
này sinh ra để có — thành hai nét bắt chéo nhau hụt.

### 19.0b · Chữ B, và vì sao thứ tự nút quyết định tất cả

Chặng này trước đây là một **vòng tròn**. Vòng tròn vặn ra vô cực thì đúng về
hình học, nhưng nó đánh rơi mất con chữ: cái tên là *Borderland*, chữ B mới là
thứ đang được kể lại, còn vòng tròn thì chẳng của riêng ai.

`P_B` viết B bằng đúng một nét, theo thứ tự tay người viết: từ giữa sống lưng
xuống bụng dưới, ngược lên giữa, lên bụng trên, rồi về giữa. Sống lưng bị đi qua
hai lần — đúng như khi viết tay, và hai lượt chồng khít nhau nên nhìn ra vẫn là
một nét.

Quan trọng nhất: **thứ tự nút của nó trùng khít `P_INF2`.**

```
P_INF2 :  tâm → đáy → tâm → đỉnh → tâm
P_B    :  tâm → đáy → tâm → đỉnh → tâm
```

Đó không phải tình cờ mà là điều kiện để phép biến hình đọc ra là **bụng dưới
đang xoay**: mỗi nút bò tới đúng nút tương ứng của nó, nên bụng dưới của chữ B
là thứ vòng ra thành thuỳ dưới của vô cực. Xếp lệch thứ tự thì hai hình vẫn nội
suy được, nhưng các nút bò chéo qua nhau và mắt chỉ đọc ra một mớ nét đang quẫy.

### 19.0c · Mandala: tám cánh và hai vành

Hai vô cực đã nằm vuông góc nhau — tức là đã có bốn cánh. Thêm hai bản **sao**
của vô cực ngang, xoay 45° và 135°, là thành tám: một bông đối xứng tám hướng,
đúng cái khung mà mọi hình mandala dựng trên đó.

- **Bản sao là nét TĨNH, không mang `<animate>`.** Chúng chỉ hiện ở chặng
  mandala, mà chặng ấy nằm sau khi hai vô cực đã thành hình xong. Cho chúng
  `<animate>` nữa thì mỗi bông có thêm hai nét âm thầm chạy chữ Z ở dưới lớp
  mờ — tốn việc vẽ mà không ai nhìn thấy.
- **Nét mandala mảnh hơn nét chính** (1,5 so với 2,6). Cùng bề dày thì tám cánh
  nặng ngang nhau và hình thành một mớ rối; mảnh đi thì hai vô cực gốc vẫn là
  nét chính, sáu nét kia là hoa văn quanh nó.
- **Hai vành tròn đồng tâm** là thứ làm nó đọc ra là *mandala* chứ không phải
  một bông hoa tám cánh: mandala luôn có đường viền khép vòng ngoài và một tâm
  rõ ràng. Thiếu chúng thì tám cánh chỉ toả ra rồi hết, không có chỗ dừng.

### 19.0d · Chậm → nhanh là do KHOẢNG MỐC, không do hàm nhịp

```
64%  rotate(30deg)     ·  30° trong 12% vòng   — chậm
76%  rotate(180deg)    · 150° trong 10% vòng   — nhanh dần
86%  rotate(480deg)    · 300° trong 10% vòng   — nhanh
```

Hàm nhịp của cả cụm để `linear`, nên nhanh-chậm **hoàn toàn** do khoảng cách
giữa các mốc quyết định. Chia đều góc quay thì tốc độ không đổi và cú tăng tốc
biến mất — mà cú tăng tốc chính là thứ dẫn vào lúc vỡ.

### 19.0e · Bụi: toạ độ TÍNH RA, và hai tầng điều khiển

Mười tám hạt, toạ độ do `tools/build.mjs` tính lúc dựng chứ không gõ tay: rải
đều theo góc, bán kính so le theo một chu kỳ **không chia hết cho mười tám** nên
không hạt nào xếp thành hàng với hạt nào. Gõ tay mười tám cặp số thì kiểu gì
cũng lọt ba bốn hạt thẳng hàng, và mắt bắt được ngay cái hàng ấy.

Mỗi hạt mang sẵn `--bx` (dạt ngang), `--by` (rơi sâu), `--bt` (trễ) trong thuộc
tính `style` của nó. Nhờ vậy **cả mười tám dùng chung đúng một `@keyframes`** mà
vẫn rơi mỗi hạt một kiểu.

Hai tầng, và cần cả hai: nhóm `.lg-bui` lo *"có được phép hiện không"* (theo
vòng lớn), từng hạt lo *"rơi tới đâu rồi"* (theo đường rơi riêng, có trễ âm).
Nhét cả hai vào một bộ keyframes thì mỗi hạt phải có một bộ riêng — mười tám bộ,
và cùng một hiệu ứng phải sửa mười tám chỗ.

### 19.1 · Vì sao không phải ô vuông gạch chéo

Bản đầu vẽ đúng hình mẫu: khung vuông cộng hai đường chéo. Hình học thì chuẩn —
hai vạch đứng khép dấu ╳ thành một vô cực nằm ngang, hai vạch ngang khép nó
thành một vô cực dựng đứng, bốn vạch hợp thành khung vuông.

Dựng ra rồi nhìn thì nó đọc thành **biểu tượng "ảnh lỗi"**. Ô vuông gạch chéo là
ký hiệu phổ biến nhất của "không có gì ở đây", và một logo không được phép trùng
với ký hiệu của sự trống rỗng.

Giữ nguyên câu chuyện, đổi nét: chữ B vặn thành vòng thì hai vô cực thôi vẽ bằng
nét thẳng mà vẽ bằng nét cong. Bốn cánh mọc ra từ một tâm — và bốn cánh ấy lại
vọng đúng cánh hoa đang rơi ở nền trang.

### 19.2 · Không nhét con chữ vào

Có một bản dựng chặng chữ bằng `<text>` thật: lấy đúng con chữ Z, i, B trong tên
blog, cùng phông nghiêng. Nghe thì trung thành với ý tưởng, nhìn thì hỏng — một
chữ serif có chân, có nét thanh nét đậm, dán vào giữa một hình toàn nét tròn đều
đọc ra là **chữ bị dán vào**, không đọc ra là hình đang biến. Hai thứ khác hẳn
nhau về chất: một bên là mặt chữ, một bên là nét vẽ.

Nên chặng nào cũng vẽ bằng nét, cùng bề dày, cùng đầu bo tròn. Gợi ra chữ thì
được, mà gợi bằng chính nét của mình.

Phần thưởng kèm theo: không phụ thuộc phông chữ, nên Google Fonts tải chậm hay
hỏng cũng không ảnh hưởng gì.

### 19.3 · Bốn đường, một cấu trúc — luật phải giữ

Cả bốn đường (`P_INF1`, `P_INF2`, `P_ZZ`, `P_B` trong `tools/build.mjs`) đều
là `M` rồi **đúng bốn** `C`. Chúng nội suy vào nhau theo từng cặp —
`P_ZZ → P_INF1` và `P_B → P_INF2`.

`P_NOI` **không** nằm trong luật này: nét nối chữ i không biến hình với ai, nó
chỉ vẽ dần ra rồi tắt, nên nó được phép là một đoạn thẳng `M…L…`. Trình duyệt chỉ nội suy được giữa hai đường khi
chúng cùng chuỗi lệnh và cùng số điểm — nhờ vậy nét chữ Z **cong dần** ra thành
vô cực chứ không nhảy sang.

Sửa một đường thì phải giữ nguyên cấu trúc ấy. Thêm một khúc cong cho đẹp là
phép biến hình gãy, mà nó gãy **im lặng**: đường vẫn vẽ đúng, trang vẫn dựng,
chỉ là hình thôi biến. Bộ kiểm định có một phép canh việc này.

### 19.4 · Hai đồng hồ

| Phần | Chạy bằng | Khai ở |
|---|---|---|
| mờ · xoay · vẽ dần · rơi | hoạt hình CSS | `--lg-ck` trong `layout.css` |
| biến hình (`d`) | thẻ `<animate>` trong SVG | `LG_CK` trong `build.mjs` |

Hiện là **30 giây** (trước là 20 — xem §19.5b).

Phải dùng `<animate>` chứ không dùng thuộc tính CSS `d`: Chrome và Safari nội
suy được `d` qua CSS, Firefox thì không, và ở đó nét sẽ nhảy thay vì cong dần.

Hai con số thời lượng phải khớp nhau. Lệch thì không ai báo lỗi, chỉ là hai nửa
câu chuyện trôi dần khỏi nhau — và vì trôi *dần* nên xem mấy vòng đầu vẫn thấy
đúng. Có một phép kiểm canh việc đó.

**Đo hoạt hình thì đo bằng Web Animations API.** `element.getAnimations()` rồi
`pause()` + đặt `currentTime`; SVG thì `pauseAnimations()` + `setCurrentTime()`.
Không dùng `animation-delay` âm cộng `animation-play-state:paused`: đổi delay
trên một hoạt hình đang tạm dừng thì Chrome giữ nguyên mốc cũ, không tua lại, và
ảnh chụp ra là một trạng thái lai — dáng thì đúng mốc, hình thì đúng lúc bấm
máy. Đã vấp hai lần đúng vì chuyện này, và cả hai lần đều tưởng là logo hỏng.

### 19.5 · Logo xuất hiện ở đâu

| Trang | Thấy gì | Lớp |
|---|---|---|
| `/` | logo, tự kể chuyện, vòng 30 giây | `.brand--logo .brand--dong` |
| `/about/` | logo, tự kể chuyện, vòng 30 giây | `.brand--logo .brand--dong` |
| mọi trang khác | dòng chữ *Zoey in Borderland* | `.brand--chu` |

Không bao giờ hiện cả hai cùng lúc: logo và tên viết đầy đủ nói **cùng một
điều**, đặt cạnh nhau thì thành lặp, và ở thanh đầu trang thì lặp là tốn chỗ của
mục điều hướng.

Danh sách hai trang ấy khai ở **một chỗ**: hằng `CHO_KE` trong phép kiểm
"Logo và dòng chữ tên blog không cùng hiện trên một trang". Phép kiểm dùng nó
cho cả hai vế — chỗ báo sai trang, và chỗ đếm tổng.

### 19.5b · Trang giới thiệu nay CÓ lặp — và cái giá của nó

Trước bản này, `/about/` cố ý **không** cho logo lặp: đó là trang nhiều chữ
nhất, và một hình động lặp ở thanh đầu trang là thứ mắt không bỏ qua được.

Nay nó có lặp. Bù lại bằng hai chỗ:

- **Vòng kéo từ 20 lên 30 giây.** Phần mandala xoay và vỡ chiếm mất quãng nghỉ
  cũ (bản trước kể hết 58% rồi đứng yên 42%), nên nếu giữ 20 giây thì thanh đầu
  trang gần như không lúc nào đứng yên. Kéo dài vòng ra thì mỗi chặng vẫn đủ
  thời gian đọc, mà tần suất một chuyện được kể lại thì thưa đi.
- **Vòng vẫn mở và đóng bằng hình ĐỦ**, không bằng hình rỗng. Logo là dấu nhận
  mặt của trang; để nó biến mất thì có lúc người đọc nhìn lên góc trái và không
  thấy gì cả. Bụi rơi xong thì bông phải tụ lại.

Nếu đọc thấy vướng thì chỗ chỉnh là đúng **một con số** `--lg-ck` trong
`layout.css` — nhớ sửa kèm `LG_CK` trong `tools/build.mjs`, có phép kiểm canh
hai số ấy khớp nhau.

Bật "giảm chuyển động" thì dừng hẳn ở hình đủ, không dừng ở một chặng giữa
chừng. Hình đủ của logo này là **bông tám cánh**, nên mandala được giữ lại —
dừng ở bốn cánh là dừng giữa chừng.

---

## 20 · BẢNG LÀM VIỆC `.ad-*` — MỘT KHUÔN CHO MỌI DANH SÁCH QUẢN TRỊ

`/z-admin/` có ba ngăn, và cả ba làm cùng một loại việc: bày một danh sách để
**điểm danh** rồi thao tác trên từng mục.

| Ngăn | Mỗi hàng là | Nút trên hàng |
|---|---|---|
| Post | một bài đã đăng | Edit · Hide |
| Category | một chuyên mục | Edit · Delete |
| Comment | một bình luận chờ duyệt | Approve · Hide |

### Chuyện đã xảy ra khi không có khuôn chung

Ba ngăn ấy từng có ba bộ luật CSS riêng, viết ở hai file khác nhau. Chúng trôi
xa nhau đúng như mọi bản sao vẫn trôi:

- Post và Category ra **danh sách dòng**, mười lăm mục một màn.
- Comment ra **một cọc thẻ có viền**, mỗi thẻ một nút bấm tô đầy, bốn mục một màn.

Và một lỗi không ai nhìn ra bằng mắt thường: bàn duyệt gọi mỗi hàng là
`.bl-dong` — **dòng**. Nút Back của khung bình luận cũng tên `.bl-dong` —
**đóng**. Bỏ dấu đi thì hai từ ấy là một, nên mọi hàng ở bàn duyệt nhận trọn
bộ luật của một cái nút: viền `inset` quanh người, lề trong 12px, hover thì
sáng lên như sắp bấm được. Mấy cái khung hộp bao quanh từng bình luận là như
thế mà ra — không ai cố ý vẽ chúng.

> **Luật rút ra:** tên class tiếng Việt không dấu phải được đọc to lên trước
> khi đặt. `dòng · đóng`, `mục · mực`, `tủ · tú` là một khi bỏ dấu.

### Khuôn

Khai một chỗ: khối `.ad-*` ở cuối `src/styles/list.css`.

```
.ad-thanh                 thanh trên: nút chính · ô tìm · ô chọn · chip lọc
  .ad-tim                   ô lọc theo chữ  (.ad-tim--chon cho <select>)
  .ad-loc                   hàng chip lọc — dùng .chip, xem components.css
.ad-bang                  thân danh sách
  .ad-dong                MỘT hàng — lưới 4 cột
    .ad-phu                 cột 1 · ngày, mã chuyên mục, tên người gửi (mono, nhạt)
    .ad-chinh               cột 2 · tiêu đề bài, tên mục, nội dung bình luận
      .ad-mo                  dòng hai trong cột 2 — chuyên mục, mô tả, đường dẫn
    .ad-cd                  cột 3 · trạng thái, LUÔN chiếm chỗ kể cả khi rỗng
    .ad-nut-hang            cột 4 · các nút của hàng
      .ad-nut                 nút chữ, không viền (.ad-nut--chinh cho nút chính)
.ad-chan                  "đã tải 20 trên 63" + nút tải thêm
```

Biến thể: `.ad-dong--hai` (hàng chở hai tầng chữ), `.ad-dong--roi` (đã xử lý,
mờ đi), `.ad-dong--xong` (đang trượt ra khỏi danh sách).

### Bốn quyết định, và vì sao

**Một DÒNG một mục, không phải một THẺ một mục.** Đây là bảng làm việc; ở bảng
làm việc thì mật độ quan trọng hơn dáng vẻ. Nhìn một màn phải thấy mười lăm mục
chứ không phải bốn — vì việc ở đây là *quét qua rồi quyết*, không phải *đọc*.

**Nút trên hàng là nút CHỮ, không viền.** Hai nút mỗi hàng × mười lăm hàng =
ba mươi cái viền, và lúc ấy bảng đọc ra là một cái lưới chứ không phải một danh
sách. Nút chính (Approve) nổi hơn bằng **màu**, không bằng nền tô: một viên
thuốc tô đầy trên mỗi hàng thì mười lăm hàng ra mười lăm viên thuốc.

**Cột trạng thái luôn chiếm chỗ**, kể cả khi ô rỗng — không thì mỗi dòng một bề
rộng khác nhau và hàng nút bên phải nhảy lung tung khi cuộn.

**Khổ hẹp: gộp hai cột, nới vùng bấm.** Dưới 640px thì cột chính và hàng nút
xuống dòng riêng, và mỗi nút chữ được nới vùng bấm bằng lề trong âm. Đo trên
màn 390px: một nút chữ ra chừng 24px, mà ngón tay phủ tới 45px — và cái dễ bấm
nhầm lại là cái **giấu hẳn** một bình luận.

### Thẻ bình luận trên trang bài cũng theo nếp này

`.bl-item` thôi mang `.card`. Ba lý do, nặng dần:

1. **Mật độ** — bình luận ở blog này phần lớn dài một dòng; một dòng chữ trong
   thẻ lề trong 24px bo góc 16px là một cái hộp gần trống.
2. **Thứ bậc** — tấm thẻ kính là khuôn của thứ **bấm được** (thẻ bài, ô bento).
   Bình luận không bấm được, nên nó mượn một tín hiệu không thuộc về mình.
3. **Đồng bộ** — mọi danh sách khác trên trang đều là hàng-có-kẻ-ngăn.

Bình luận của chủ trang: một **vạch dọc bên trái**, không tô nền cả khối. Nền
tô làm khối ấy đọc ra như một ô nhấn (`:::note`) — tức là "đọc cái này trước",
trong khi ý thật chỉ là "người này là chủ nhà".

### Thêm một ngăn mới thì làm gì

Dùng lại đúng bộ tên trên. Cần khác thì thêm **một lớp phụ**, không dựng bộ
luật thứ hai. `npm run kiem` có một phép kiểm canh đúng chuyện này: mọi file
quản trị dựng ra danh sách đều phải đi qua `.ad-dong`.

---

## 21 · CỤM DÙNG CHUNG — `.bao` VÀ `.trong`

Hai câu mà mọi phần của trang đều phải nói lúc này lúc khác: **"đây, kết quả"**
và **"chỗ này không có gì"**. Cả hai từng được mỗi chỗ tự dựng lấy.

### 21.1 · Đếm ra bao nhiêu bản sao

Bảy bộ luật cho một dòng báo tin, ở năm file CSS khác nhau:

| Lớp cũ | File | Cỡ chữ | Màu nghỉ | Biến thể lỗi |
|---|---|---|---|---|
| `.bl-bao` | prose | `--fs-sm` | thừa kế | `--loi` |
| `.kh-bao` | khoa | `--fs-xs` | `--text-faint` | `--hong` |
| `.sz-bao` | admin | `--fs-2xs` | `--text-faint` | `--hong` |
| `.vb-noi` | admin | `--fs-xs` | `--text-faint` | `--hong` |
| `.gc-noi` | list | `--fs-2xs` | `--text-muted` | `--hong` |
| `.cum-bao` | prose | `--fs-3xs` | `--accent-ink` | `--hong` |
| `.bl-duyet-bao` | prose | `--fs-2xs` | `--text-muted` | `--hong` |

Bốn cỡ chữ, ba màu nghỉ, hai chữ cho cùng một nghĩa, hai tên gốc (`bao` =
báo, `noi` = nói). Và **hai chỗ hỏng thật**, chỉ lộ ra khi xếp cạnh nhau:

- `.vb-noi--hong` tô `--accent-ink` chứ không phải `--bad` — báo lỗi ở ô viết
  bài hiện **màu tím**, đọc ra như một dòng chữ thường;
- `.bl-duyet-bao--hong` **không có luật nào** — báo lỗi ở bàn duyệt không đổi
  màu gì cả.

Cùng kiểu ấy, bốn bộ cho câu "không có gì": `.ds-trong` · `.bl-trong` ·
`.vb-cho` · `.so-trong` — ba cỡ chữ, hai lối trình bày. Hai cái đầu **giống
nhau tới từng thuộc tính**, chỉ khác lề.

### 21.2 · Cách dùng

```html
<p class="bao">                    dòng báo tin mặc định
<p class="bao bao--ok">            xong việc
<p class="bao bao--hong">          hỏng
<p class="bao bao--cho">           đang chạy

<p class="trong">                  không có gì, và sẽ không có gì thêm
<p class="trong trong--cho">       chưa có gì NGAY BÂY GIỜ — đang tải, chưa mở khoá
```

Hai trạng thái rỗng ấy khác nhau thật, nên được phép trông khác: *"rỗng"* là
một câu kết, viết nghiêng như lời chú; *"đang chờ"* là câu tạm, viết thẳng và
nhỏ hơn để không đòi được đọc kỹ.

Chỗ nào cần khác thì thêm **một** lớp phụ chở đúng phần khác ấy — cỡ chữ, lề,
nền — và **không khai lại** màu trạng thái:

| Lớp phụ | Gốc | Khác ở |
|---|---|---|
| `.bl-bao` | `.bao` | cỡ chữ lớn hơn một bậc |
| `.sz-bao` | `.bao` | nền chìm + vạch ngăn dưới |
| `.cum-bao` | `.bao` | phông nhãn, chữ hoa, rỗng thì `display:none` |
| `.gc-noi` · `.bl-duyet-bao` | `.bao` | cỡ nhỏ hơn |
| `.ds-trong` · `.bl-trong` | `.trong` | lề |
| `.so-trong` | `.trong` | căn giữa |
| `.vb-cho` | `.trong` | bỏ lề |

Khung đăng nhập và hai ngăn Post · Category dùng **thẳng** `.bao`, không lớp
phụ nào — chúng không cần khác gì cả. Hai ngăn ấy móc phần tử bằng
`[data-bao]` chứ không bằng lớp, vì trong cùng một khung còn `.bao` khác.

### 21.3 · Màu đi qua một biến, không khai thẳng

```css
.bao{color:var(--bao-mau,var(--text-faint))}
.bao.bao--hong{--bao-mau:var(--bad)}
.cum-bao{--bao-mau:var(--accent-ink)}    /* màu NGHỈ của một chỗ */
```

Hai lý do, và cả hai đều là chuyện thứ tự file (§7):

1. Cụm gốc nằm ở `components.css`, tức gói `nen`, tải **trước** mọi gói khác.
   Một luật `.cum-bao{color}` bên `prose.css` sẽ thắng `.bao--hong{color}` dù
   cùng mức cụ thể. Đi qua biến thì lớp phụ đặt màu **nghỉ**, lớp trạng thái
   đặt màu **trạng thái**, và hai việc ấy không giẫm lên nhau.
2. Lớp trạng thái viết `.bao.bao--hong` (hai lớp) chứ không `.bao--hong`: như
   vậy nó luôn cụ thể hơn mọi lớp phụ một-lớp, bất kể file nào tải sau.

> **Phép kiểm #62** chặn hai việc: lớp phụ tự khai trạng thái
> (`.x-bao--hong`), và gắn lớp phụ mà quên lớp gốc.

### 21.4 · Hộp thoại — ba cái, MỘT cách dựng

| Hộp | Cách dựng | Nền mờ | Đóng · giam tiêu điểm |
|---|---|---|---|
| `.anh-to` xem ảnh to | `<dialog>` + `showModal()` | `::backdrop` | trình duyệt lo |
| `.sz-cat` cắt ảnh | `<dialog>` + `showModal()` | `::backdrop` | trình duyệt lo |
| `.so-nen` bảng lịch sử | `<dialog>` + `showModal()` | `::backdrop` | trình duyệt lo |

Bảng lịch sử từng tự dựng lớp phủ bằng `div` + `position:fixed`, kèm ba đoạn
mã viết tay cho ba việc trình duyệt vốn làm sẵn: nghe Escape, giam tiêu điểm
trong hộp, và che phần còn lại khỏi trình đọc màn hình. Đổi sang `<dialog>` ở
V2.5.9 thì bỏ được cả ba.

**Cái mới thì dùng `<dialog>`.** `showModal()` cho sẵn bốn thứ mà một lớp phủ
tự dựng phải viết tay và dễ quên: phím Esc đóng, bẫy tiêu điểm trong hộp, che
phần còn lại khỏi trình đọc màn hình, và một `::backdrop` nằm đúng lớp trên
cùng mà không phải đi tranh `z-index` với ai.

Bảng lịch sử tự dựng vì nó có sẵn từ trước và có hiệu ứng mờ dần riêng khi mở;
đổi nó sang `<dialog>` là một việc nên làm, chưa làm.
