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
| Nền động màn đầu | cánh hoa rơi | đĩa thiên hà | thác nước | một vòng ngày đêm trên núi |
| Favicon | `favicon.svg` | `favicon.svg` | `favicon-calm.svg` | `favicon-frost.svg` |
| Ảnh chia sẻ | `og.jpg` | `og-thien-ha.jpg` | `og-tinh-lang.jpg` | `og-suong-giang.jpg` |

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

### 1.3 · HAI HỌ MÀU, và đừng bao giờ trộn chúng

Trong `tokens.css` có hai họ biến màu trông na ná nhau mà phục vụ hai việc
không liên quan gì đến nhau. Trộn chúng là cách chắc chắn nhất để một lượt đổi
theme làm hỏng một chỗ không ai ngờ tới.

| | Họ TRẠNG THÁI | Họ BÚT MÀU |
|---|---|---|
| Biến | `--accent` · `--accent-ink` · `--ok` · `--warn` · `--bad` (+ `-wash`) | `--c-tim` · `--c-hong` · `--c-do` · `--c-cam` · `--c-vang` · `--c-luc` · `--c-lam` · `--c-xam` · `--c-nau` · `--c-ngoc` · `--c-cham` · `--c-oliu` |
| Ai quyết | **giao diện** — mã quyết, người đọc không chọn | **người viết**, gõ `{tím: chữ}` trong file `.md` |
| Nghĩa | một *trạng thái*: xong, cần chú ý, hỏng, đang được nhấn | một *màu*, đúng nghĩa đen |
| Đổi được không | đổi được, miễn giữ nguyên nghĩa | **không** — tên màu là một phần cú pháp, xem §9.2 |
| Dùng ở đâu | nút, nhãn, viền, khung nhấn `:::tip`, báo tin `.bao` | duy nhất `.c-*` trong thân bài |

**Luật:** một component báo lỗi phải đọc `--bad`, **không phải** `--c-do`. Hai
thứ ấy hôm nay cùng đỏ, nhưng `--bad` là lời hứa "màu của cái hỏng" còn
`--c-do` là lời hứa "màu đỏ" — và một lượt chỉnh bảng màu chỉ giữ được một
trong hai lời hứa. Chiều ngược lại cũng vậy: đừng lấy `--accent-ink` làm màu
bút cho người viết, vì đổi theme là chữ họ tô đổi màu theo, mà họ tô nó với ý
"cho câu này màu tím".

Dấu hiệu nhận ra đang trộn: một luật CSS **ngoài** `.prose` / `.sz-khung` mà
đọc `--c-*`. Hiện chỉ có đúng ba chỗ được phép, và cả ba đều là bảng chọn màu
của người viết: `.sz-cham`, `.sz-nut--mau .sz-cham`, `.sz-mau-cham`.

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
| Nút cỡ nhỏ | `.btn.btn--nho` | cho màn "việc đã xong", chỉ còn mở đường đi tiếp |
| Nút chỉ có hình | `.ico-btn` | **bắt buộc** `aria-label` + `.tip` |
| Chú thích nổi | `.tip` + `data-tip` | mặc định phía DƯỚI nút — xem ngoại lệ ở §3.2 |
| Tag | `.tag` | một hình duy nhất ở mọi nơi |
| Đường dẫn phân cấp | `.crumbs` | Bài viết / Mục / Mục con |
| Thẻ bài | `.card` | trang danh sách |
| Hàng meta | `.meta-row` | ngày · phút đọc · trạng thái |
| Huy hiệu trạng thái | `.badge` + `--warn` `--ok` `--bad` | biến thiên gọi theo SẮC, xem §20.1 |

### 3.2 · Chú thích nổi đi xuống dưới, trừ hai chỗ

Phía trên một cái nút gần như luôn là tiêu đề hoặc hàng meta, nên chú thích bật
lên trên là che mất chữ. Mặc định vì thế là **dưới**.

Hai ngoại lệ, và cả hai đều vì chỗ trống nằm ở nơi khác:

- **Nút "xem câu khác" trong ô trích dẫn** nằm ở góc TRÊN PHẢI của một cái ô
  nhỏ; bật xuống dưới là đè thẳng lên câu trích. Ở /about/ nó bật sang TRÁI —
  ngang hàng với dòng nhãn "QUOTE OF THE DAY", một dòng ngắn còn thừa chỗ. Ở
  màn đầu trang chủ thì bật sang PHẢI, vì bên phải ô là khoảng trống trước khối
  tên blog, còn bên trái đã là mép trang.
- **Mục cuối của thanh điều hướng** neo về mép phải, không thì chú thích tràn
  khỏi màn.

Khai bề rộng khi đẩy ngang: ô chứa của `::after` là chính cái nút (rộng 26px),
neo `right` ra ngoài 34px thì chỗ trống còn lại là âm và trình duyệt co hộp về
gần 0 — ra một mẩu 22px không đọc được chữ nào. `width:max-content` chữa đúng
chỗ đó.

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
| `soan.css` | ô soạn thảo — `.sz-*`: thanh nút, các bảng bật ra, bảng gõ trong bài, khung cắt ảnh, khung đặt cỡ bảng, thanh khổ ảnh | bảng danh sách |

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

> **Gần hết bài đang dùng `post left`** — kiểu của bài "Chiếc gương". Bài
> "Thứ bảy, không có gì" dùng `post insta`; `post full` chưa có công dụng rõ.
> `post insta` là nơi cặp lùi/tới `.rn-cap` ra đời, và khối "đọc tiếp" của mọi
> khung nay mượn lại đúng hình ấy.

> **Khối "đọc tiếp" bỏ nhãn khi nó nằm trong DÒNG BÀI.** Ở cột bên nó là một
> mục của cột, đứng cạnh mục lục, nên nó cần một dòng nhãn để nói mình là mục
> nào. Ở chân bài thì ngay trên nó đã là hàng tag kết thúc bằng một đường kẻ —
> thêm một vạch ngăn có chấm giữa rồi một dòng chữ hoa giãn ly nữa là BA lần
> ngắt mạch liên tiếp trong chừng trăm pixel, chỉ để giới thiệu hai cái liên
> kết vốn đã tự mang nhãn RELATED · NEWER · OLDER ở đầu mỗi dòng.
>
> Điều kiện là **chỗ đứng**, không phải tên khung: một bài `post left` không có
> tiêu đề mục nào thì cũng chẳng có cột bên, và nó rơi vào đúng cảnh ấy. Tham
> số `oBen` của `readNextHTML()` quyết, và lớp `.read-next--gon` là bản không
> nhãn.

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
Xám · Nâu · Ngọc · Chàm · Ô liu**, không dịch. Không phải bỏ sót.

Cú pháp màu ghi vào file `.md` là `{tím: chữ}` — tên màu tiếng Việt là **một
phần của cú pháp**, không phải một nhãn giao diện. Nút ghi "Purple" mà file ghi
`tím` thì hai thứ nói hai chuyện, và ô xem Markdown `</>` (in đúng cú pháp
ấy) lệch với nút vừa bấm. Nhãn ở đây phải nói ra **cái sắp được viết**.

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
CÓ ẢNH (khai `anh:` trong front matter)
hàng 1     [ cột trái 2 cột: ảnh ở trên · dải số 2×2 ở dưới ]
           [ giới thiệu  4 cột — cao bằng cả cột trái ]
hàng 2     [ dải cuối 6 cột: dạo này · liên hệ · cà phê ]
hàng 3     [ thân bài  6 cột ]

KHÔNG ẢNH
hàng 1     [ giới thiệu  6 cột ]
hàng 2     [ dải số  6 cột ]
hàng 3     [ dải cuối 6 cột ]
hàng 4     [ thân bài  6 cột ]
```

> **Bẫy đã vấp.** Bản đầu cho mỗi ô một `span` rồi thả cho lưới tự lấp. Hỏng vì
> số ô SỐ thay đổi theo việc tác giả khai bao nhiêu field, nên hàng nào cũng có
> thể thừa 2 cột trống — và một lưới bento có lỗ hổng đọc ra là trang bị lỗi,
> không phải trang gọn gàng.
>
> Cách chữa: nhét mọi ô số vào **một dải chiếm trọn 6 cột**, bên trong dải đó
> mới chia đều bằng `auto-fit`. Khai 2 field hay 4 field thì lưới ngoài vẫn kín.
> Hàng cuối (dạo này · liên hệ · cà phê) dùng đúng cách ấy, vì cả ba ô đều có
> thể vắng mặt tuỳ front matter.

> **Bẫy thứ hai: span qua nhiều hàng thì phần cao dư chia ĐỀU.** Ô giới thiệu
> nay chứa cả đoạn tự giới thiệu — dăm đoạn văn chứ không phải một câu. Bản
> trước xếp ảnh và dải số thành hai hàng lưới riêng rồi cho ô giới thiệu span
> qua cả hai; đoạn chữ càng dài thì mấy ô số càng bị kéo cao ra, bốn con số
> nằm lọt thỏm giữa khoảng trống 300px.
>
> Cách chữa: gom ảnh + dải số vào **một ô lưới** (`.bo--cot`) rồi xếp dọc bằng
> flex. Phần cao dư dồn hết vào tấm ảnh (`flex:1`, ảnh `object-fit:cover` nên
> cao thêm bao nhiêu cũng không méo), mấy ô số giữ đúng chiều cao nội dung.

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

Bốn hiệu ứng, tự đổi theo theme. Bảng tra `BO` ở phần ĐIỀU PHỐI của
`src/js/nen.js` là **chỗ duy nhất** biết theme nào đi với hiệu ứng nào — thêm
theme là thêm đúng một dòng ở đó, không phải đi sửa một chuỗi `if`.

| Theme | Hiệu ứng | Hàm dựng | Gốc |
|---|---|---|---|
| Sakura | cánh hoa anh đào rơi chéo | `dungHoa` | HAN-961030-a |
| Galaxy | đĩa thiên hà xoắn ốc | `dungThienHa` | HAN-961030-b |
| Tĩnh lặng | thác nước · giọt · gợn · mặt nước | `dungThac` | dựng mới cho blog |
| 霜降 | sơn thuỷ, chạy trọn một vòng ngày đêm | `dungSuongGiang` | dựng mới cho blog |

Cả bốn trả về cùng một giao kèo: `{ dung, ve(t) }` — `dung()` dựng lại mọi thứ
phụ thuộc kích thước khung (gọi lại mỗi lần đổi cỡ cửa sổ), `ve(t)` vẽ một
khung hình ở nhịp `t`. Không hàm nào được giữ trạng thái ở ngoài.

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

### 12.1 · 霜降 — sơn thuỷ trên giấy trắng, một vòng ngày đêm

Đây là hiệu ứng phức tạp nhất trong bốn cái, và cũng là cái duy nhất có **thời
gian trong ngày**. Một vòng `CHU_KY = 4200` khung hình (~70 giây ở 60fps):

| Pha `p` | Xảy ra gì |
|---|---|
| 0.00 → 0.06 | đêm tàn, chân trời đông ửng |
| 0.06 → 0.26 | mặt trời lên cao, nhỏ và nhạt dần; giấy gần như trắng |
| 0.40 → 0.58 | tà — đĩa to và đỏ lại, hạ xuống một quãng |
| 0.56 → 0.70 | chạng vạng, trời sẫm dần, sao hiện |
| 0.60 → 0.93 | **mặt trăng hiện lên ĐÚNG chỗ mặt trời** |
| 0.93 → 1.00 | trời nhạt dần, nối liền về đầu vòng |

Ba bao `dem` · `binhMinh` · `hoangHon` đều bằng 0 ở cả `p=0` lẫn `p=1`, nên
vòng khép kín mà không có một nhịp giật nào ở chỗ nối.

#### Thứ tự vẽ — và vì sao nó không được xáo

trời → trăng → sao → mặt trời → **núi xa** → **nếp gần + mặt nước** → mây →
**trời phủ lần hai** → vệt sáng trên nước → vệt sương → chim

Ba chỗ trong dãy này là bắt buộc, không phải tiện tay:

- **Thiên thể trước núi.** Chúng nằm sau núi, nên lúc mọc thì thứ hiện ra đầu
  tiên là quầng sáng dâng lên từ phía sau sống núi, rồi cái đĩa mới trồi lên.
- **Mây trước lớp trời thứ hai.** Mây là một cái *tẩy* (xem dưới). Để nó sau
  thì mỗi đám chọc một lỗ xuyên cả hai lớp trời xuống tận mặt giấy, và trên nền
  trời đêm mấy cái lỗ ấy đọc ra là **cục sáng**. Để nó trước thì lỗ nào cũng
  được phủ lại một lớp mỏng: chỗ mây đi qua vẫn sáng lên, nhưng sáng thành một
  vệt sương.
- **Nếp bờ cuối sau mặt nước.** Nó ở gần nhất, nằm *trên* nước chứ không chìm
  dưới lớp rửa nước.

#### Tám luật của bức này

Phá luật nào cũng ra một thứ trông sai mà khó chỉ tên.

1. **Trên giấy trắng, SÁNG là chỗ bớt mực đi.** Không có màu nào sáng hơn giấy.
   Nên mặt trăng, **sao**, vệt trăng dưới nước và mây đều vẽ bằng
   `globalCompositeOperation = 'destination-out'`. Từng vẽ sao bằng mực đậm:
   một chấm đậm hơn nền trời đêm không đọc ra là sao, nó đọc ra là bụi trên mặt
   giấy.
2. **Muốn xoá được thì phải có gì đó để xoá.** Lớp rửa đêm vì thế phủ tới TẬN
   ĐÁY khung chứ không dừng ở chân trời — mặt nước phản chiếu bầu trời, và
   chính nhờ nó sẫm mà vệt trăng mới hiện ra.
3. **Dãy nào cũng phải có lớp giấy đặc.** Mực rửa trong suốt không che được gì.
   Từng để ba dãy xa trong suốt, và mất cùng lúc ba thứ: đường sống dãy sau
   chạy *xuyên qua* thân dãy trước; **mặt trời với mặt trăng lọt qua núi mà
   hiện ra** (một cái đĩa còn chưa mọc khỏi sống núi mà đã thấy tròn vành vạnh
   thì mắt không đọc ra nó tròn, nó đọc ra là *mờ*); và lớp rửa các dãy cộng
   dồn vào nhau nên thang sắc độ theo chiều sâu bị phá. Cũng từng thử chừa
   6–12% cho "quầng rạng" rọi qua: 12% của một đĩa đặc vẫn là một vệt cam rõ
   mồn một nằm giữa sườn núi. **Núi che là che kín**; chặng rạng lấy từ phần
   quầng *nhô trên* sống núi, và quầng rộng gấp chín lần cái đĩa nên nó còn
   nguyên.
4. **Mực phải NHẠT, và phải TRẢI RỘNG.** Cả bảng dưới 0,20 và bốn lớp núi xa
   dưới 0,13. Từng đẩy lên gấp ba với lý do "một bức mực không có chỗ nào đậm
   thật thì không có trọng lượng" — lý do ấy đúng với tranh treo tường và sai
   với cái này. Đo trên đời trước (bản `dungMay`, bản đọc ra "hữu tình"): chỗ
   đậm nhất của nó là **201/255** và nó phủ **56%** khung. Tức là không khí của
   lối vẽ ấy hoàn toàn không đến từ một chỗ nào đậm — nó đến từ một *trường*
   mực rất nhạt trải rộng. Mực mỏng thì chỗ nào cũng còn thấy giấy dưới nó, và
   cái đọc ra là hơi nước; để trống thì đọc ra là trống.
5. **Núi đậm nhạt theo KHOẢNG CÁCH TỚI ĐƯỜNG SỐNG**, không theo độ cao trên
   khung — hai chuyện ấy chỉ trùng nhau khi đường sống nằm ngang. Núi xa: đậm
   ngay tại sống rồi nhoè xuống chân (sống cắt vào nền trời còn đọc được, chân
   núi chìm trong sương). **Nếp gần thì ngược lại**: nhạt ở đỉnh, đậm dần xuống
   chân — đỉnh tan vào giấy, vì mấy nếp gần là đồi thấp nằm *trong* sương chứ
   không phải ngọn nhô *khỏi* sương. Đánh khối cùng một kiểu cho mọi dãy là chỗ
   hỏng nặng nhất từng mắc: năm dãy xếp lên nhau ra năm nếp lụa gấp.
6. **Nét chỉ đi ở dãy gần.** Với lối tô của núi xa thì *mép trên của lớp rửa đã
   là nét* — chỗ đậm nhất của gradient nằm đúng trên đường sống. Vẽ thêm một
   nét lên đúng chỗ ấy là kẻ hai lần một đường, và đường thứ hai biến bóng núi
   thành một hình tô màu có outline. Nếp gần thì mép trên *tan* vào giấy nên
   không có gì cắt ra hình: ở đấy nét không chồng lên mảng đậm nào, nên nó
   không ra outline mà ra chính cái hình.
7. **Ban đêm núi phải SÁNG hơn trời.** Núi có lớp giấy đặc nên lớp rửa đêm ở
   bước 1 nằm hẳn *sau* núi; phải có lượt phủ thứ hai lên trên tất cả, nếu
   không thì nửa đêm trời sẫm mà núi vẫn trắng như giữa trưa. Nhưng lượt ấy
   phải **mỏng**: để 0,066 thì đo ra trời 223 và núi 227 — chênh bốn nấc, tức
   là không chênh, và đó là cả lý do "không ra tương phản núi với trời". Nay
   trời 0,255 và lượt phủ núi 0,030: đo ra trời 194, vùng núi 232. Cũng là
   chuyện thật — tuyết, đá trần, hơi nước bốc lên đều bắt sáng, bầu trời thì
   không có gì để bắt.
8. **Dải chuyển phải đơn điệu.** Lớp rửa đêm từng đi 0,150 → 0,098 → 0,034 ở
   chân trời → 0,082 ở đáy: ba chặng nhạt dần rồi chặng cuối đậm lại, tức là có
   một chỗ *lõm* đúng tại chân trời. Mắt đọc một chỗ lõm trong dải chuyển ra
   thành một vệt sáng nằm ngang, và trên nền trời đêm thì vệt ấy là một cục màu
   rõ mồn một — dù mọi trị số nhìn riêng đều hợp lý.

#### Đường sống núi: tổng ba sóng sin

Đã thử ba cách, và hai cách sau đều sai theo cùng một kiểu — chúng cố làm cho
đỉnh núi **sắc** hơn, mà sắc là thứ bức này không cần:

| cách | kết quả |
|---|---|
| tổng sin + **đường chuông** hẹp cộng vào | chuông át hẳn nền sin, ngọn lấy đúng dáng chuông → đọc ra hình **vi cá** |
| **chùm đỉnh** `(1-|t|)^n` | có góc ở đỉnh, hai sườn gần thẳng → mỗi đỉnh một cái **nón**; chỗ hai đỉnh gặp thành khe chữ V |
| **nhiễu gấp nếp** (`1-|n|` bình phương, chồng tầng) | đúng cách dựng sống núi thật, nhưng mấy chục nếp nhỏ đọc ra **răng cưa**, và mọi đỉnh nhọn đều thành một mũi chỉ vào chữ |

Nên quay về tổng ba sóng sin lệch pha — mềm, liền, không đỉnh nào nhọn. Bước
sóng đo bằng **pixel**, không theo tỉ lệ khung: tính theo `u = x / W0` thì số
ngọn luôn bằng nhau bất kể màn rộng hay hẹp, và nhét chừng ấy ngọn vào một cái
điện thoại 375px thì chúng chen nhau thành răng cưa.

`bao` (không bắt buộc) **nhân** vào biên độ, nên chỗ nào bao lớn thì dãy nhấp
nhô mạnh hơn: đó là cách cho bức một điểm nhìn mà không phải dựng một đỉnh
riêng. Bề rộng bao phải từ 0,30 trở lên — hẹp hơn thì nó lại thành cái chuông.

#### Kéo núi lại gần

Từng hạ tần số sóng (1,4–6,4 thay cho 2,2–14) vì "ít ngọn hơn, mỗi ngọn rộng
hơn thì đọc ra là gần". Sai: dưới một chu kỳ trên cả bề ngang thì dãy núi thôi
là dãy núi, nó thành một đường chân trời hơi nghiêng — và nét sống đi trên một
đường gần thẳng thì đọc ra đúng là một nét kẻ. Nên tần số giữ nguyên, "gần" dồn
vào `cao` (nhân 1,35) và vị trí (cả cụm tụt xuống ~0,06 khung). Mép nước xuống
theo: núi lại gần thì thấy ít mặt hồ hơn.

#### Thiên thể: một chỗ, một cú chuyển cảnh

Mặt trăng đặt **đúng** chỗ mặt trời. Trời sẫm dần, mặt trời nhạt đi, mặt trăng
hiện lên ngay tại đó. Lệch ra một quãng thì mắt đọc ra hai vật — một cái tắt,
một cái bật; trùng khít thì nó đọc ra *một* vật đang đổi.

Đã thử lối đi một cung qua trời, đúng như trời thật, và đã bỏ:

- một cái đĩa trôi ngang khung kéo mắt đi ngang đúng lúc đang đọc một dòng —
  cùng cái lo đã làm cánh hoa ở trang giới thiệu bị hạ xuống `.22`;
- phần lớn vòng thì đĩa nằm thấp và bị núi che, nên chẳng thấy gì, rồi đột ngột
  có một vật băng qua. Cả vòng 70 giây mà khách ở lại 20 giây thì chỉ gặp một
  mảnh của chuyến đi;
- đi qua trời là đi qua **chữ**. Đứng một chỗ thì chọn được chỗ ấy một lần cho
  xong: 0,655 ngang · 0,175–0,285 dọc, tức khoảng trống giữa dòng chữ lớn và
  cột mục lục.

Đĩa vẫn hạ xuống một quãng nhỏ lúc rạng và lúc tà — không phải để làm một cái
cung thu nhỏ, mà vì màu và độ cao phải nói cùng một chuyện: lúc ấy nó to và
**đỏ**, mà đỏ là màu của thấp. Bán kính 0,058 cạnh ngắn lúc tà (đĩa rộng chừng
11% chiều cao, đúng cỡ trong tranh gốc) và 0,042 giữa trưa; từng để 0,078 và ở
lối đứng một chỗ thì nó thành một cục màu to nằm mãi một chỗ.

**Quầng và đĩa đi hai lượt, không một.** Một gradient chỉ có một mức đậm ở tâm,
mà quầng rộng gấp mấy lần đĩa nên phải mỏng tới mức gần như không thấy, còn đĩa
phải *đặc* để đọc ra là một vật — nhét cả hai vào một gradient thì mức đậm phải
chọn theo cái rộng hơn, và đĩa bị kéo mờ theo quầng. Đuôi quầng còn phải rất
dài (`r·9,5`, bảy chặng): trên một mặt giấy trắng trơn thì không có gì che được
một chỗ gãy độ đậm, kể cả gãy một nấc trên 255 — mắt tự vẽ thêm một đường viền
ở đó, và quầng tắt hẳn ở `r·6,2` để lại một cái **vành** mờ quanh mặt trời.

#### Mây là một cái tẩy, không phải một nét vẽ

Canvas này trong suốt và nằm trên một trang giấy trắng, nên tô trắng lên nó là
tô trắng lên trắng. `destination-out` mới đúng việc: mực núi bị tẩy đi, giấy
trắng phía sau hiện ra — đúng cách mây được vẽ trong tranh thuỷ mặc, chỗ trắng
là chỗ *chừa lại* chứ không phải chỗ tô thêm.

Và **mây phải TRÔI**, không phải sương thở tại chỗ. Từng thay chỗ này bằng ba
dải sương nằm ngang dày mỏng theo một nhịp sin tại chỗ: về số thì cũng là "lúc
mờ lúc tỏ", nhưng một dải đổi độ đậm mà không đi đâu thì đọc ra là màn hình
đang nhấp nháy, còn một đám *đi qua* thì đọc ra là có gió. Cùng một lượng mực
bị lấy đi, mà một cái làm bức tranh sống và một cái làm nó chập chờn.

Về đêm mây tẩy **nhẹ tay hơn** (`0,60 - 0,22·dem`), không mạnh hơn: ban ngày
cái bị tẩy là mực núi nhạt nên chỗ tẩy chỉ mờ đi một chút; ban đêm cái bị tẩy
là cả lớp rửa trời, nên chỗ tẩy nhảy hẳn về màu giấy.

#### Mép tan dần dựng bằng chồng nét, không bằng `ctx.filter`

Đã thử `filter = 'blur()'` và đã bỏ: Chromium xé vùng lọc thành từng **ô** rồi
lọc riêng từng ô, và với một nét rộng vài trăm pixel trải hết bề ngang thì mép
các ô không khớp — trên màn điện thoại cả sườn núi hiện ra thành một bậc thang
những khối chữ nhật lệch nhau một hai nấc xám. Không chỉnh được.

Thay vào đó là `toMem`: chồng nhiều nét cùng đường mà khác bề rộng, số lớp tính
từ bề rộng thật sao cho mép hai nét cạnh nhau cách nhau dưới khoảng một điểm
ảnh — mắt bắt ra chỗ *gãy* độ đậm giỏi hơn bắt ra độ đậm nhiều lần, nên cách
nhau 5px thì đọc ra một chùm đường đồng mức, cách nhau 1px thì đọc ra một dải
chuyển liền. Thêm hai cái được: `filter` trên một nét hẹp hơn bán kính nhoè thì
dàn mỏng nét ra và **làm mất mực** (nét 3px nhoè 6px không ra nét 3px mềm mép,
nó ra nét 15px nhạt hơn năm lần), còn chồng nét thì không bao giờ mất; và
`filter` không có ở Safari trước 16.4. Cả năm dãy nướng xong dưới 20ms.

#### Một lượt mặt trời, rồi sang trăng

Từng có HAI bao ấm — `binhMinh` đỉnh ở quãng 0,10 và `hoangHon` đỉnh ở quãng
0,53 — nghĩa là trong một vòng, đĩa to-và-đỏ rồi nhỏ-và-nhạt rồi lại to-và-đỏ.
Với lối đứng một chỗ thì càng lộ: cùng một chỗ, cùng một đĩa, phình ra rồi co
lại rồi phình ra, mà lượt thứ hai không kể thêm gì.

Nay một lượt, đi một chiều: đĩa vào khung ở xa (nhỏ, vàng nhạt, cao 0,150), lớn
dần và ấm dần và hạ dần tới 0,285, rồi tắt trong quãng 0,46–0,58 để trăng lên.
Một biến `tien` (0 = xa, 1 = gần) kéo cả ba thứ ấy, nên **màu, cỡ và độ cao
luôn nói cùng một chuyện** — không bao giờ có cảnh đĩa đỏ ối mà đứng gần đỉnh
trời.

#### Mép nước cắt ngang đất

Đường sống của một dãy có chỗ trũng xuống dưới mép nước. Để nguyên thì lớp rửa
nước — phủ giấy 86–93%, không phải 100% — chỉ làm mờ phần ấy đi chứ không xoá,
và cái còn lại đọc ra là **một quả đồi đang ngập trong hồ**. Vô lý, mà khó chỉ
tên: chỗ sai không nằm ở hình nào cả, nó nằm ở chuyện hai hình cùng có mặt ở
một nơi chỉ được phép có một.

Bờ nước thật là chỗ đất DỪNG. Nên đường sống bị kẹp lại ở mép nước: chỗ nào đất
thấp hơn mặt nước thì mép của nó chính là mặt nước. Chỉ những dãy vẽ TRƯỚC mặt
nước mới kẹp — nếp bờ cuối vẽ sau, nó nằm trên nước chứ không bị nước cắt.

#### Canvas phải bằng đúng khối chứa nó

`.nen-canvas` là `position:absolute;inset:0`, nên nó lấy cỡ của **tổ định vị gần
nhất**. Trang chủ có `.shell[data-nen]{position:relative}` nên đúng; khối bọc
của trang tĩnh (`.nen-boc`) từng để `static`, và tổ định vị gần nhất hoá ra là
`body` — canvas bị căng ra bằng cả trang. Đo được: khối bọc 949×908 mà canvas
1013×1275, cao gấp 1,44 lần.

Thứ LỘ RA NGAY là mặt trời với mặt trăng: chúng vẽ bằng `arc`, tức hình tròn,
nên bị kéo thành bầu dục. Núi với nước cũng giãn theo mà không ai gọi được tên,
vì chúng vốn không có hình chuẩn để so — đó là vì sao lỗi này sống lâu.

Và cỡ khối còn đổi sau khi trang đã mở: phông vào muộn thì chữ xếp lại, ảnh tải
xong thì ô ảnh nở ra. `resize` không bắn ở những lúc ấy, nên có thêm
`ResizeObserver` — kèm hai mốc `setTimeout` (400ms · 1600ms), vì ResizeObserver
gắn vào nhịp vẽ của trình duyệt và một tab chạy nền thì không được giao quan
sát, y như `requestAnimationFrame`.

#### Mặt nước — một phần tư khung

Mép nước ở `0,750`. Lớp giấy dựng lên **nhanh** ở mấy phần trăm đầu (0 → 0,58
trong 10% dải): chân mọi dãy núi nằm dưới mép nước, và cái phải chìm hẳn là mấy
vai nối giữa hai đỉnh — nếu nước chưa kịp đặc thì chúng hiện ra thành một đường
ngang suốt khung. Mười sáu nét sóng, không chín: dải nước cao gần gấp đôi bản
trước, mà chín nét trải trên dải mới thì nửa dưới trống trơn, và một mặt nước
trống trơn đọc ra là giấy chưa vẽ.

Vệt sáng trên nước là một **cột vệt ngang**, không phải một vũng: gần bờ thì
ngắn và khít, ra xa thì dài và thưa, cả cột rung theo sóng. Vẽ một khối mờ hình
bầu dục thì nó ra một vũng dầu.

Đã thử thêm **bóng núi in xuống nước** (lật đường sống qua mép nước, tô một lớp
rất mỏng, rồi lấy mấy vệt *giấy* ngang cắt qua cho nó đứt đoạn — chỗ đứt mới là
thứ nói ra rằng mặt kia là nước, tô liền một khối thì ra một tấm gương). Không
dùng: một phần tư khung giấy gần trắng đọc ra là mặt hồ đủ rồi, và thêm bóng
thì phần dưới bức nặng lên đúng chỗ thẻ trích dẫn nằm.

#### Khung vẽ cao nhất 1,2 màn hình — và dưới nó là nước

Ba hiệu ứng kia không có bố cục dọc: cánh hoa rơi ở đâu cũng là cánh hoa. Kéo
chúng cao bao nhiêu cũng đúng. Bức này thì có **chân trời**, và mọi con số
trong nó đo theo chiều cao khung — núi xa `0,35`, mép nước `0,750`, trăng
`0,150`. Cho khung cao gấp đôi thì mặt nước tụt xuống khỏi tầm mắt và để lại
hai màn trời trắng.

Đúng chuyện đã xảy ra ở **/about/** từ V2.8.8 tới V2.9.2. Trang ấy bọc nội dung
trong một `<div class="nen-boc">` riêng; div ấy nằm trong `.page-layout`
(`position:static`), nên canvas `position:absolute` bên trong **không neo vào
nó** — nó neo lên tận `<body>`. Bề ngang ra đúng một cách tình cờ, còn chiều
cao thì bằng CẢ TRANG: 1825px so với 1002px ở trang chủ. Người đọc nhìn ra ngay
("About me hỏng"), mà không phép kiểm nào bắt được: HTML hợp lệ, CSS hợp lệ,
canvas có vẽ.

Hai việc chữa, và phải làm cả hai:

1. **Một chủ cho nền động.** `data-nen` đặt lên `.shell` ở mọi trang, đúng như
   trang chủ vẫn làm. Bỏ hẳn div trung gian. `.shell` vốn đã `position:relative`
   và đã có luật nâng `main`/`.site-foot` lên trên canvas. Trang tĩnh giữ được
   nét riêng của nó (`opacity:.5`) qua giá trị `data-nen="mo"`.
2. **Trần cho chiều cao khung vẽ**, trong chính `dungSuongGiang`:
   `H0 = min(H, innerHeight × 1,20)`. Phần khối chứa còn lại phía dưới **không
   bỏ trắng** — nó là nước kéo dài tiếp, tô đúng sắc chặng cuối của dải nước
   (giấy alpha `.93`), nên không có mép nối nào.

`1,20` chứ không phải `1,00`: trang chủ cao 1,14 màn và bố cục ở đó đã ngắm kỹ.
Trần phải đủ rộng để không chạm vào những trang chỉ hơn một màn một quãng, và
chỉ can thiệp vào những khối cao gấp đôi trở lên.

**Và nếp bờ gần nhất (`y: 0,965`) không được vẽ khi khung bị cắt trần.** Nó là
tiền cảnh — đáy bức, chỗ mắt đứng — nên nó chỉ đúng vai khi mép dưới khung cũng
là mép dưới khối chứa. Ở khối cao gấp đôi thì dưới nó còn cả một dải nước nữa,
và nó thành một vạch sẫm nằm ngang giữa trang: một cái bờ mọc giữa hồ. Đã thử
phủ giấy tan dần lên nó thay vì bỏ hẳn — không ăn: nếp này trải từ `0,91` tới
`1,0` khung, nên muốn phủ kín thì lớp giấy phải đạt trị tối đa ngay ở `0,91`,
và thế thì chính chỗ `0,91` lại thành một mép (đo ra 239 so với 248 hai bên —
chín nấc, đủ để mắt đọc ra một đường kẻ). Bỏ hẳn thì chỗ nối đo được **1,2
nấc**, tức không còn gì.

#### Trăng phải ở dưới đỉnh núi ĐO ĐƯỢC

Đường sống mỗi dãy xa là tổng ba sóng sin, không có bao, nên đỉnh tính được
thẳng: `y = y0 − h·cao`. Chạy cả ba dãy qua mọi bề ngang 340 → 1900px:

> **đỉnh cao nhất của cả khung = `0,1815 H`**, và nó không đổi theo bề ngang —
> sóng bị kéo giãn, không bị nâng lên. (Ba sóng không bao giờ cùng đạt cực đại,
> nên biên độ tổng `0,93` chỉ ra tới đấy.)

Nên mép **dưới** của đĩa phải ở trên `0,1815 H`. Trừ bán kính `0,026` và một
quãng dư `0,010`, trần cho tâm đĩa là **`0,145 H`**.

Con số ấy phơi ra một lỗi sống suốt mấy bản: trăng **vừa hiện** ở `0,215 H` —
tức nằm sau núi ở gần như mọi bề ngang — rồi mới dâng lên chỗ thấy được. Nửa
đầu đêm không có mặt trăng, và không ai gọi tên được vì cuối đêm thì nó có.
Nay `0,150 → 0,122`: thấy được từ khắc đầu, dâng đúng một quãng nhỏ (0,028
khung), mép trên lúc cao nhất còn cách nóc khung 80px nên không kịch vào thanh
đầu trang, và cả đêm trăng ở gần mặt nước hơn — bóng của nó trên nước vì thế
đọc ra là bóng của nó.

> **Luật:** chỗ đứng của thiên thể là một con số **đo từ hình học của núi**,
> không phải một con số ướm. Lần trước đã thử suy nó ra lúc chạy và sai (phép
> đo cho ra cùng một giá trị ở mọi bề ngang — dấu hiệu rõ ràng của công thức
> sai). Đo ngoài, chốt vào mã, ghi cả cách đo vào đây.

#### Sao lấp lánh theo CỤM, không theo từng sao

Mỗi sao một pha và một nhịp riêng nghe thì "tự nhiên", mà kết quả ngược lại: ở
bất cứ khoảnh khắc nào cũng có chừng một nửa số sao đang sáng, rải đều khắp
trời, nên không mảng nào nổi lên so với mảng nào. Trời đứng yên về tổng thể và
chỉ rung ở chi tiết — mắt đọc ra là **nhiễu màn hình**.

Gom sao vào 4–7 cụm, cả cụm thở cùng một nhịp, thì có lúc một **mảng** trời rực
lên rồi lịm đi trong khi mảng bên cạnh đang lịm. Ba chi tiết làm nó không thành
một bóng đèn nhấp nháy:

- **Lệch pha riêng từng sao** ±0,8 radian, và lệch nhịp ±8%.
- **Rải cụm phân tầng**: chia bề ngang thành `nCum` băng, mỗi băng một cụm,
  lệch tự do trong băng. Rải thuần ngẫu nhiên với bốn cụm thì rất hay có một
  góc trời không cụm nào — đo ra đúng thế ở khổ 446px: một phần tư khung bên
  trái có nhịp bằng 0, tức góc ấy đứng chết suốt đêm.
- **Một bệt sáng rất mờ phủ cả cụm**, thở cùng nhịp với nó, cũng vẽ bằng phép
  *lấy mực đi*. Chính nó làm "vùng chớp sáng" đọc được từ xa; mấy chấm sao chỉ
  nói chi tiết.

Biên độ của bệt phải **đo, không ướm**. Bản đầu để `0,030` và nó vô hình: trời
đêm hợp lên giấy ra chừng 197 trên thang 255, tức cách trắng 58 nấc, nên lấy đi
3% lớp rửa chỉ sáng thêm 1,7 nấc ở tâm — bình quân trên một mảng trời còn 0,3
nấc, và đo thật thì cả vòng nhịp chỉ đưa mảng ấy qua **0,11 nấc**. Ở `0,115`
thì đo ra **3–6 nấc** ở tâm mấy mảng, tức nhìn ra được mà vẫn chưa thành một
quầng có đường biên.

#### Dải mực trên mép nước phải tan SỚM hơn mép

Sau khi mép nước thôi là một đường kẻ (V2.9.1), còn một chỗ nữa. Đo độ sáng
bình quân từng hàng ở bản V2.9.1:

| hàng | 0,68 | 0,70 | 0,72 | 0,74 | 0,76 | 0,78 |
|---|---|---|---|---|---|---|
| độ sáng | 245 | 243 | **231** | 237 | 243 | 248 |

Một dải tối rộng chừng 6% khung nằm **ngay trên** mép nước. Đó là chân mấy nếp
núi gần, chỗ mực đậm nhất của chúng, mà lớp giấy phủ nước lúc ấy mới bắt đầu ở
`0,738` nên không với tới. Mắt không đọc dải ấy ra là "chân núi" — nó đọc ra là
một vạch tương phản chạy ngang bên trên bờ nước, tức đúng cái mà cả lượt làm
mềm bờ nước định bỏ đi, chỉ là nó lùi lên cao hơn vài chục pixel.

`veTanNuoc` nay bắt đầu từ `0,688` (thay cho `0,738`) và mạnh tay sớm — ở `0,72`
nó phủ chừng 0,69. Đo lại: 246 · 247 · **241** · 245 · 246 · 248, tức dải tối
còn **5 nấc** thay vì 30. Chân núi vẫn chìm dần vào nước, chỉ là chìm từ cao
hơn, đúng như một bờ nông thoải.

#### Một kỳ trăng trong một đêm

Suốt đêm trăng đi hết một kỳ: **tròn → khuyết → bán khuyết → lưỡi liềm**. Một
đêm thật thì không thế — kỳ trăng dài hai mươi chín ngày. Nhưng cả bức này vốn
nén một ngày vào bảy mươi giây, nên nén kỳ trăng theo là cùng một phép nói; và
nó cho mắt một thứ để đo thời gian trôi, thay vì một đĩa trắng đứng yên suốt
hơn nửa vòng. Cùng một đồng hồ (`tienTrang`) với đường đi chéo 15°, nên trăng
lên cao tới đâu thì khuyết tới đó.

**Phần sáng không phải một hình tuỳ ý.** Nó luôn là một nửa đường TRÒN ghép với
một nửa đường BẦU DỤC — bầu dục ấy là đường phân giới ngày/đêm trên quả cầu, mà
ta nhìn nghiêng nên nó dẹt lại. Bán trục ngang của nó là `r · cos θ`:

| θ | `cos θ` | dáng |
|---|---|---|
| 0 | 1 | bầu dục trùng đường tròn → **tròn** |
| 60° | .50 | phình sang phải → **khuyết** |
| 90° | 0 | dẹt thành đoạn thẳng → **bán khuyết** |
| 130° | −.64 | cong ngược lại → **lưỡi liềm** |

Dấu của `cos θ` quyết định bầu dục cong về bên nào, và `ellipse()` nhận điều đó
qua tham số chiều quay — nên đúng **một** công thức lo cả bốn dáng.

**Chiều quay của nửa đường tròn phải ĐO, không suy.** Đi ngược chiều kim từ −90°
tới 90° thì vòng qua 180°, ra nửa trái; đi xuôi chiều thì vòng qua 0°, ra nửa
phải — và lúc ấy hình đổ ra là phần BÓNG, tức kỳ trăng chạy ngược: lưỡi liềm
trước rồi mới tròn. Hai cách nhìn mã gần như giống nhau. Cách phân định: đổ
hình rồi **đếm điểm ảnh**, lấy tỉ lệ trên diện tích đĩa —

```
ky   =  0     0,25    0,5     0,72    1
sáng =  0,999 0,852   0,499   0,181   0
```

Dừng ở `0,72` chứ không đi hết `1,0`: qua đó phần sáng mỏng tới mức trên khung
955px chưa tới hai pixel — đọc ra một vệt xước, không ra mặt trăng.

**Và đường phân giới NGHIÊNG, nghiêng dần.** Một lưỡi liềm dựng đứng là thứ chỉ
có trong hình vẽ: ngoài đời phần sáng luôn quay về phía mặt trời, mà mặt trời
thì ở dưới chân trời và đi tiếp suốt đêm — nên lưỡi liềm **lăn** chậm quanh đĩa
từ lúc trăng lên tới lúc trăng lặn. Đó cũng là lý do một tấm ảnh chụp trăng lúc
chập tối và một tấm lúc gần sáng không bao giờ giống nhau về dáng.

Góc nghiêng chạy theo cùng cái đồng hồ đã lo đường đi chéo 15° và kỳ trăng, nên
ba chuyển động cùng kể một chuyện. Biên độ **0,62 rad ≈ 35°** cả đêm: rộng hơn
thì ở đoạn giữa đĩa lật quá nhanh và mắt bắt ra là hình đang XOAY chứ không
phải trăng đang đi; hẹp hơn thì suốt đêm nhìn như một góc nghiêng đặt cứng.

Hai hàm nhận góc theo **hai hệ khác nhau**, và đó là chỗ dễ sai: `arc()` đo góc
theo trục x của khung vẽ nên phải cộng góc nghiêng vào cả hai đầu, còn
`ellipse()` đo theo trục x của chính nó — tức sau khi đã xoay — nên hai đầu giữ
nguyên `±90°`. Cộng vào cả hai chỗ là hai nửa lệch nhau đúng bằng góc ấy và
`fill()` ra một hình méo. Đo lại sau khi nghiêng: tỉ lệ sáng vẫn đúng dãy
`0,852 · 0,499 · 0,181`, và hướng phần sáng xoay đúng `17,2°` với `n = 0,3 rad`
— xoay thì bảo toàn diện tích, nên con số không được phép đổi.

Vệt mực cho chiều sâu cũng phải lệch **dọc theo trục vừa nghiêng**; để nguyên
trục ngang thì ở góc lớn nó trượt ra khỏi phần tối và đọc ra là một cái bóng
dán lệch.

**Và một vệt mực rất mỏng cho có chiều.** Đĩa vẽ bằng phép xoá nên nó ra một
mảng giấy trắng PHẲNG. Đổ lại một bệt bầu dục alpha `0,055`, lệch về phía tối
theo `cos θ`: đủ để rìa thôi sắc lẻm và đĩa có một chiều, chưa đủ để thành một
cái bóng dán lên.

### 12.2 · Bật ở đâu

**Trang tĩnh** (`content/pages/*.md`) — thêm vào front matter:

```yaml
nen: dong     # bật
nen: tinh     # tắt (mặc định)
```

**Trang chủ** luôn bật, không khai gì cả.

`nen` **chỉ có tác dụng ở `content/pages/`**. Gõ vào một bài viết thì nó bị bỏ
qua — bộ kiểm định bắt trường hợp này và báo cảnh báo.

### 12.3 · Cỡ đĩa thiên hà

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

### 12.4 · Bốn thứ nó tự lo

1. **Đổi theme là đổi hiệu ứng ngay**, kể cả khi người đọc bấm nút giữa chừng.
2. **Tab bị ẩn thì dừng hẳn.** Trình duyệt có tiết lưu `requestAnimationFrame`
   ở tab ẩn nhưng không dừng hẳn — vẫn tốn pin của người mở mười tab.
3. **Cuộn qua khỏi thì dừng.** Nền chỉ ở màn đầu; vẽ tiếp là vẽ cho không ai xem.
4. **`prefers-reduced-motion`**: vẫn vẽ MỘT khung hình tĩnh rồi dừng, không bỏ
   trắng. Người tắt chuyển động vẫn xứng đáng được nhìn cái nền.

### 12.5 · Mật độ theo diện tích, không theo số cố định

Số cánh hoa và số sao tính từ `W × H` của khung. Để một con số cố định thì màn
1440px thấy thưa thớt mà màn 390px thấy dày đặc.

**Cùng một luật, áp cho HÌNH DẠNG chứ không chỉ cho số lượng.** Đường sống núi
của 霜降 là tổng mấy hàm sin, và bản đầu tính tần số theo `u = x / W0` — tức là
số ngọn núi trên một dãy luôn bằng nhau bất kể màn rộng hay hẹp. Trên màn
1400px thì vừa; nhét đúng chừng ấy ngọn vào một cái điện thoại 375px thì chúng
chen nhau thành hàng răng cưa lởm chởm.

Nay tần số nhân thêm `kW = W0 / 1400`, nghĩa là **bước sóng đo bằng pixel**:
màn hẹp thấy ít ngọn hơn, mỗi ngọn vẫn rộng đúng chừng ấy — giống hệt việc cắt
một khúc của cùng một bức tranh, thay vì ép cả bức vào khung hẹp.

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

### 17.0 · Năm trang, một khuôn

Năm trang dùng chung khuôn `.ds-trang` — dựng ở một chỗ duy nhất
(`tools/build.mjs`, hàm dựng trang danh sách), nên đầu trang, giãn cách và
chân trang của chúng không thể trôi xa nhau:

| Trang | Mỗi mục là | Thân | Lọc |
|---|---|---|---|
| `/posts/` | một **chuyên mục**, chở 3 bài mới nhất của nó | `.muc-luoi` → `.muc-khoi` | chip trạng thái ở `.chip-hang` |
| `/archive/` | một **bài**, gom theo năm | `.phan-trang` → `.kho-nam` → `.kho-ds` | — (cả kho, có số trang) |
| `/notes/` | một **mẩu ghi chú** | `.gc-ds` | chip loại ở `.chip-hang .gc-loc` |
| `/tags/` | một **tag** | `.may-tag` | — |
| `/tags/<t>/` | một **bài** mang tag ấy | `.ds-luoi` | — |

Khuôn chung:

```
main
  .container.ds-trang            lề trên 56px · lề dưới 40px (xem §17.3)
    .ds-dau                      đầu trang, lề dưới 24px
      .eyebrow                     vạch + viên kim cương
      h1                           tên trang
      .ds-dan                      một dòng dẫn, có con số ("9 bài · 3 năm")
      .chip-hang                   hàng chip lọc, nếu trang ấy có
    <thân>                       một trong năm khối ở bảng trên
.site-foot                       chân trang — KHÔNG cộng thêm lề ở đây
```

**Con số của cả danh sách nằm ở `.ds-dan`, không nằm trong chip.** Chip "Tất
cả" vì thế không mang số (§17.2c) — hai lần cùng một con số cách nhau vài chục
pixel thì cái nào cũng thành thừa. Trong /z-admin/ thì ngược lại: ở đó không
có dòng dẫn, nên con số về chip và về `.ad-chan` (§20.1).

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

#### Danh sách ngắn thì phải thấy ĐỦ chân trang

Một trang **bài** dài thì phải kéo, và kéo là đúng: nội dung dài thật. Một
trang **danh sách** ngắn thì không có lý do gì bắt kéo thêm một nhịp chỉ để
gặp dòng bản quyền.

Đo ở khổ 1180×900, tính từ mục cuối xuống mép trên chân trang:

```
.ds-trang   padding-bottom   96px   (--s11)
.site-foot  margin-top       56px   (--s9)
──────────────────────────────────
                            152px   KHÔNG chở gì
```

Và hệ quả đo được, ở đúng khổ ấy:

| Trang | phải kéo thêm | chân trang |
|---|---|---|
| `/posts/` | 63px | thấy đúng mép trên |
| `/archive/` | 91px | không thấy |
| `/notes/` · `/tags/` · `/tags/<t>/` | 0 | thấy đủ |

Ba trang vừa khít và hai trang thiếu vài chục pixel, trong khi giữa danh sách
với chân trang có 152px trống — con số ấy chính là chỗ thiếu.

Ba luật, và phải có cả ba:

1. `.ds-trang{padding-block:var(--s9)}` — **56px cả hai đầu**. Nội dung nằm
   giữa hai thanh cùng cỡ (luật 3), nên hai khoảng hai bên nó phải bằng nhau:
   56px từ thanh đầu xuống tiêu đề, 56px từ mục cuối xuống chân trang. Lệch
   một bậc thì cả trang đọc ra là bị đẩy lên — thấy ngay ở một trang danh sách
   ngắn, nơi chân trang nằm trong tầm mắt.
2. `main:has(> .ds-trang) + .site-foot{margin-top:0}` — chân trang thôi cộng
   khoảng của nó ở trang danh sách, vì `.ds-trang` đã có lề dưới riêng. (Trang
   chủ đã có đúng luật này từ trước, qua `.shell[data-nen] .site-foot`, chỉ là
   vì một lý do khác: ở đó chân trang phải dính liền mép dưới màn hero.)
3. **Chân trang cao đúng bằng thanh đầu trang** — xem mục ngay dưới. Chính nó
   trả lại chỗ cho luật 1.

Đo lại ở 1180×900: cả năm trang danh sách gói trong một màn, chân trang hiện
đủ (/posts/ 852px, /archive/ 864px).

Máy không hiểu `:has()` thì luật 2 rơi và khoảng cũ trở lại — mất một nhịp
gọn, không mất gì khác.

#### Chân trang cao bằng thanh đầu trang

Đo ở 1180×900: thanh đầu 64px, chân trang **95px** — gấp 1,48 lần, mà nó chở
ít hơn hẳn (một dòng ký tên với bốn đường đi, so với logo cộng cả bộ điều hướng
cộng hai nút). Một khối chở ít hơn mà cao hơn thì đọc ra là khối ấy quan trọng
hơn, và chân trang thì không.

95px ấy là `1 + 40 + 22 + 32`: hai cái lề chọn bằng tay, mỗi cái một con số,
và không con số nào liên quan tới thanh đầu trang.

Nay khai bằng **chính chiều cao ấy**:

```css
.site-foot{
  min-height:var(--header-h);
  padding-block:var(--s4);        /* lề TỐI THIỂU, chỉ dùng tới ở khổ hẹp */
  display:grid;align-content:center;
}
```

Không ướm một cặp lề cho ra đúng 64 — ướm thì đổi cỡ chữ một bậc là lệch lại,
mà lệch một hai pixel thì không ai thấy để sửa. `--header-h` đổi thì chân trang
đổi theo, mãi mãi bằng nhau. `box-sizing:border-box` toàn cục nên `min-height`
đã gồm cả viền và lề trong.

Ở khổ hẹp hai nửa chân trang gấp thành hai dòng và khối cao vượt 64px — lúc ấy
`min-height` nhường cho nội dung và lề 16px mới có tác dụng. Đo ở 375px: 85px,
đúng cho hai dòng.

> **Đây là một luật có ĐIỀU KIỆN.** Nó không hứa "mọi trang danh sách luôn vừa
> một màn": thêm bài vào là `/posts/` sẽ dài ra, và lúc ấy kéo là đúng. Luật
> chỉ nói: **đừng để một trang phải kéo vì khoảng trống.**

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
15 Sep 2026 · 6 views      [♥ 12]  [💬 3]  [chia sẻ]
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

**Thứ tự ba nút là thứ tự của VIỆC**: thích là phản ứng ngay, bình luận là ngồi
xuống viết, chia sẻ là việc làm sau khi đã đọc xong và đã thích — và nó là cái
duy nhất đưa người ta rời trang, nên nó đứng cuối.

**Cụm này đứng ở đây trong MỌI khung bài** (`post left` · `post full` ·
`post insta`). Cùng một thứ nằm ba chỗ
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

Trên **2.500 ký tự** (chữ trơn, không kể thẻ), cụm tim · bình luận · chia sẻ
rời hàng meta khi hàng ấy trôi khỏi màn hình:

| Khổ màn | Nó về đâu |
|---|---|
| ≥1080px, `post left` | **cột phải**, dưới khối "đọc tiếp" — cột dính khi cuộn |
| còn lại | một cụm **nổi ở góc dưới phải**, nút tròn 42px |

Bốn trường hợp **không** dời: bài ngắn · hàng meta vẫn trong tầm mắt · khung
bình luận đang chiếm cột phải · đã cuộn tới chân bài ở khổ hẹp (cụm nổi sẽ che
mất nút Gửi).

**Cụm nổi trốn đi trong lúc người đọc đang cuộn XUỐNG, và về lại khi tay dừng.**
Đời trước chỉ đổi trạng thái lúc HƯỚNG cuộn đảo chiều — giấu khi xuống, hiện
khi lên. Trên điện thoại đó là một cái bẫy: một cú vuốt mạnh sinh ra quán tính
chạy tiếp cả nghìn pixel rồi tắt dần, và hướng KHÔNG BAO GIỜ đảo. Cụm trượt ra
khỏi mép phải rồi nằm luôn ngoài đó cho tới khi người đọc chủ động vuốt ngược.
Nay có thêm một đường về thứ hai: hết cuộn **420ms** là nó hiện lại — đủ dài để
không chớp tắt giữa những cú vuốt nối nhau, đủ ngắn để vừa dừng mắt đã thấy nó
ở đó.

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
| mọi trang khác | dòng chữ *Zoey in Borderland*, thỉnh thoảng thở thành logo | `.brand--chu .brand--doi` |

Không bao giờ hiện cả hai cùng lúc: logo và tên viết đầy đủ nói **cùng một
điều**, đặt cạnh nhau thì thành lặp, và ở thanh đầu trang thì lặp là tốn chỗ của
mục điều hướng.

Danh sách trang ấy khai ở **một chỗ**: hằng `CHO_KE` trong phép kiểm "Logo và
dòng chữ tên blog không cùng hiện trên một trang". Phép kiểm dùng nó cho cả hai
vế — chỗ báo sai trang, và chỗ đếm tổng.

### 19.5b · Vì sao chỉ còn MỘT trang giấu tên blog

Luật gọn lại còn một câu: **thanh đầu trang giấu tên blog đúng ở nơi trang đã
tự nói tên nó rồi.** Chỉ trang chủ thoả — khối chữ "Zoey in Borderland" ở đó
cao bằng nửa màn hình.

`/about/` từng nằm chung nhóm với trang chủ, và đó là một chỗ hở thật: tiêu đề
của nó là "About me", nên khi thanh đầu chỉ bày một đoá hoa thì **trên cả trang
giới thiệu không có một chữ nào nói đây là blog nào**. Người tới thẳng /about/
từ một đường dẫn được chia sẻ chỉ thấy một cái hình. Nay nó dùng chung ô đổi
qua lại như mọi trang khác: đọc ra là chữ, và thỉnh thoảng thở thành logo.

Đổi lại, mất một chỗ kể chuyện. Chấp nhận được — vòng kể 30 giây vẫn còn
nguyên ở trang chủ, nơi người ta dừng lại lâu nhất và nơi nó KHÔNG phải cạnh
tranh với một trang kín chữ. (Đó cũng đúng lý do bản đời trước đưa ra để **tắt**
lặp ở /about/; lượt sau bật lại, rồi lượt này tắt hẳn bằng một lý do khác và
nặng hơn: khả năng nhận ra mình đang ở đâu.)

Nếu đọc thấy vướng thì chỗ chỉnh là đúng **một con số** `--lg-ck` trong
`layout.css` — nhớ sửa kèm `LG_CK` trong `tools/build.mjs`, có phép kiểm canh
hai số ấy khớp nhau.

Bật "giảm chuyển động" thì dừng hẳn ở hình đủ, không dừng ở một chặng giữa
chừng. Hình đủ của logo này là **bông tám cánh**, nên mandala được giữ lại —
dừng ở bốn cánh là dừng giữa chừng.

---

## 20 · BẢNG LÀM VIỆC `.ad-*` — MỘT KHUÔN CHO MỌI DANH SÁCH QUẢN TRỊ

`/z-admin/` có bốn ngăn — **Note · Comment · Post · Category** — và ba trong số
đó làm cùng một loại việc: bày một danh sách để **điểm danh** rồi thao tác trên
từng mục. (Ngăn Note chỉ có một ô viết, không có danh sách.)

| Ngăn | Mỗi hàng là | Nút trên hàng |
|---|---|---|
| Post | một bài đã đăng | Edit · Hide |
| Category | một chuyên mục | Edit · Delete |
| Comment | một bình luận chờ duyệt | Approve · Hide, và một ô tích để làm hàng loạt |

Thứ tự bốn ngăn đi theo TẦN SUẤT dùng, không theo thứ bậc dữ liệu: Category là
việc làm một lần rồi cả tháng không mở lại, nên nó đứng cuối.

### Thanh làm hàng loạt — và vì sao nền nó phải ĐỤC

Ngăn Comment có thêm một ô tích mỗi hàng; tích ít nhất một cái thì một thanh
`n SELECTED · APPROVE · UNAPPROVE · HIDE · CLEAR` hiện ra và **dính** ở đầu
bảng khi cuộn (tích một dòng ở cuối danh sách rồi phải cuộn ngược lên đầu mới
bấm được thì cả cơ chế này không tiết kiệm gì).

Dính thì nền phải ĐỤC. Bản đầu tô `--accent-wash` — một lớp rửa alpha `.14` —
nên mọi hàng trôi qua phía dưới đều hiện xuyên lên: chữ chồng chữ, nút chồng
nút. Đứng yên thì thanh trông hoàn toàn bình thường, nên không ai ngờ tới; chỉ
lúc cuộn nó mới lộ. Nay là một lớp mặt phẳng (`--surface-solid`) rồi mới rửa
màu nhấn lên trên.

Ở khổ hẹp, hàng có ô tích phải **khai lại lưới của nó**: `.ad-dong--chon` và
`.ad-dong` cùng một mức cụ thể, mà luật khổ hẹp đứng sau trong file nên nó
thắng và cột ô tích biến mất — ô tích rơi vào cột ngày giờ, ngày giờ bị đẩy
sang cột chữ, cột trạng thái tự tìm một hàng mới. Bốn ô vì thế được đặt chỗ
THẲNG bằng `grid-area`, không để lưới tự xếp.

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

Khai một chỗ: khối `.ad-*` trong `src/styles/admin.css`.

```
.ad-thanh                 thanh trên — MỘT hàng, không bao giờ hai
  .btn                      nút chính của ngăn (New post · New category)
  .ad-tim                   ô lọc theo chữ
  .ad-tick--het             ô tick tất cả (chỉ ngăn Comment — nó thay chỗ hai
                            thứ trên, vì ngăn ấy không có cả hai)
  .ad-loc                   hàng chip lọc, DẠT PHẢI — dùng .chip
.ad-bang                  thân danh sách
  .ad-dong                MỘT hàng — lưới 4 cột (5 cột nếu có ô tick)
    .ad-tick                cột 0 · ô tích để làm hàng loạt
    .ad-phu                 cột 1 · ngày, mã chuyên mục, tên người gửi (mono, nhạt)
    .ad-chinh               cột 2 · tiêu đề bài, tên mục, nội dung bình luận
      .ad-mo                  dòng hai trong cột 2 — chuyên mục, mô tả, đường dẫn
    .ad-cd                  cột 3 · MỘT CHỖ ĐỨNG bề rộng cố định, không phải
                            một lối vẽ. Trong nó: .badge (trạng thái) hoặc
                            .ad-dem (con số). LUÔN chiếm chỗ kể cả khi rỗng.
    .ad-lenh-hang           cột 4 · các nút của hàng
      .ad-lenh                nút chữ, không viền (.ad-lenh--chinh cho nút chính)
.ad-chan                  chân bảng — "đã tải 20 trên 63", nút tải thêm, con số
                          tổng dạt phải, và chỗ của nút ‹ › sang trang
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

#### Hai tầng, và mép phải không được di động

```
tầng 1   tên · huy hiệu · giờ ····················· REPLY  EDIT
tầng 2   nội dung, chiếm cả bề ngang
```

Đời trước cả ba mẩu nằm trên **một** hàng co giãn, nội dung tự rớt xuống dòng
khi dài. Gọn với một bình luận bốn chữ, mà sai với một cọc mười bình luận: chỗ
đứng của `Reply` phụ thuộc vào **độ dài của chữ ngay bên trái nó**. Bình luận
ngắn thì `Reply` nằm giữa hàng; bình luận dài thì nó rơi xuống dòng ba. Mười
bình luận ra mười chỗ khác nhau — mà `Reply` là thứ mắt phải tìm lại mỗi lần.

Tầng 1 luôn ngắn (tên + giờ), nên `margin-left:auto` của cụm nút luôn có chỗ để
đẩy: `Reply` thẳng cột ở mọi hàng. Và nội dung được cả bề ngang thay vì một
nửa — khu bình luận rộng rãi ra đúng bằng phần nó không còn phải nhường cho hai
cái nút.

**Thứ tự bằng `order`, không bằng cách đổi DOM.** Trong DOM nội dung vẫn đứng
trước cụm nút; `order` chỉ đổi chỗ khi vẽ, không đổi cây a11y. Đổi thứ tự trong
DOM cho nhanh thì được đúng hình ấy, mà người dùng trình đọc nghe ra "Linh, 3
giờ trước, Reply, Edit, bài này hay quá" — nút trước cả thứ nó tác động lên.

**Ở khổ hẹp thì nút về cùng hàng với NỘI DUNG.** Hai tầng trên hợp với một cột
rộng. Khối bình luận sống ở ba khổ rất khác nhau:

| chỗ đứng | bề rộng `.bl-ds` |
|---|---|
| cột bên (màn ≥1080px) | **320px** |
| tấm trượt ở điện thoại | ~343px |
| chèn giữa bài, màn rộng | ~936px |

Ở 320px thì tầng một chở không nổi: `Zoey AUTHOR 18 Sept 2026 · 15:01` đã hết
chỗ, nên cụm nút gấp xuống và nằm **một mình** trên một dòng — thành ba tầng,
đúng cái bố cục vừa bỏ, chỉ khác thứ tự. Dưới 460px vì thế đổi cách chia: tên
và giờ chiếm trọn tầng một, nội dung với cụm nút chia nhau tầng hai.

**Hỏi bề rộng của KHỐI, không hỏi màn hình.** Khổ hẹp nhất (cột bên, 320px) lại
nằm ở màn **rộng** nhất, nên một `@media` theo bề ngang màn hình nói ngược hẳn
sự thật. `.bl-ds{container-type:inline-size}` rồi `@container (max-width:460px)`
mới hỏi đúng thứ cần hỏi.

**Và ô nội dung phải `flex:1 1 0`, không phải `1 1 auto`.** Với `auto` thì bề
rộng giả định của nó là bề rộng chữ trong nó, mà flex xếp item lên dòng theo
con số ấy **trước khi co** — nên một bình luận dài đẩy cụm nút xuống dòng riêng
và `Reply` lại trôi mỗi hàng một chỗ. Với `0` thì ô nội dung không đòi chỗ
trước: nó nhận phần còn lại sau khi cụm nút đã lấy đủ, rồi chữ tự xuống dòng
bên trong. Ngắn hay dài cũng cùng một hình.

#### Duyệt thì vào /z-admin/, không duyệt ở trang công khai

Mỗi bình luận từng mang thêm hai nút `Unapprove` · `Hide`, chỉ hiện khi máy có
khoá chủ trang. Bỏ hẳn. Ba lẽ, nặng dần:

- **Một việc, một chỗ.** Duyệt nay ở đúng ngăn Comment của /z-admin/, nơi có bộ
  lọc, ô tick tất cả, thanh làm hàng loạt. Cửa nhỏ luôn là cửa thiếu: nút ở
  trang công khai không có xác nhận, không hoàn tác, không nói được còn mấy cái
  đang chờ.
- **Một cú bấm không hoàn tác được, đặt cạnh chỗ đọc.** `Hide` là vĩnh viễn, mà
  nó nằm mờ ở mép phải và rõ lên khi rê vào hàng — đúng lúc mắt đang đọc thì
  một nút xoá vĩnh viễn sáng lên dưới con trỏ. Trên màn hẹp cụm ấy đo ra chừng
  24px trong khi ngón tay phủ 45px.
- **Mép phải tầng 1 là chỗ của `Reply` và `Edit`** — thứ mọi người đọc đều
  dùng. Chen hai nút chỉ chủ trang thấy vào đó thì hàng nút đổi hình theo việc
  ai đang xem.

#### Danh sách dài: gấp · phân trang · chặn chiều cao

Ba cái chặn, mỗi cái lo một kiểu dài khác nhau — và cả ba phải có, vì cái này
không thay được cái kia:

| | ngưỡng | lo chuyện gì |
|---|---|---|
| gấp trả lời | giữ **2** cái mới nhất | một nhánh nuốt cả khu bình luận |
| phân trang | **10** bình luận gốc | khu dài hơn cả bài |
| chặn chiều cao | **50svh** | ô gõ bị đẩy khỏi tầm với |

**Ngưỡng gấp đã đi ba nhịp: 3 → 5 → 2.** Dừng ở 2 vì chỗ này không phải một hộp
thư, nó là cái đuôi dưới một bình luận gốc: hai lời đáp mới nhất đủ nói "ở đây
có trao đổi, và nó đang nói về gì", mọi thứ cũ hơn là chuyện của người muốn đọc
kỹ — và người ấy bấm một cái.

**Gấp cái CŨ, không gấp cái mới.** Đọc một mạch trò chuyện thì cái vừa nói là
cái cần thấy trước. Nên nút nằm TRÊN danh sách, và bung ra là chèn ngược lên
đầu để thứ tự thời gian vẫn đúng.

**Và nó phải gấp lại được.** Bản trước bung xong thì xoá luôn cái nút: mở nhầm
một nhánh mười lăm lời đáp là không có đường lùi, phải tải lại cả trang. Nay
nút ở lại và đổi lời (`Show n` ↔ `Hide n`), các hàng đã bung giữ trong một mảng
riêng để lúc gấp thì gỡ đúng chúng, không đụng vào hai hàng vẫn luôn hiện.

**Phân trang chỉ đếm bình luận GỐC.** Trả lời đi theo gốc của nó, không tách
sang trang khác được — không thì một mạch trò chuyện bị cắt làm đôi giữa hai
trang. Số trang giữ trong biến, KHÔNG nằm ở địa chỉ: người ta tới đây từ một
link chia sẻ, mà một link chở số trang bình luận là thứ không ai muốn gửi đi.

**Chặn chiều cao là cái quan trọng nhất ở điện thoại.** Mười bình luận mà mỗi
cái ba bốn dòng thì khu ấy vẫn dài hơn màn hình — và ở điện thoại, nơi khu bình
luận là một tấm trượt, nó đẩy chính nó dài ra khỏi tầm với: ô gõ nằm dưới đáy,
muốn tới phải cuộn qua hết. Nên danh sách tự cuộn trong lòng nó, cao tối đa nửa
màn; ô gõ và thanh `‹ ›` vì thế luôn trong tầm mắt.

`50svh` chứ không `50vh`: trên trình duyệt điện thoại `vh` tính theo màn hình
lúc thanh địa chỉ đã ẩn, nên khi thanh ấy còn hiện thì `50vh` đã tràn. `svh` là
khổ **nhỏ nhất** — chỗ chắc chắn luôn thấy được. Đo ở 375×812: đúng 0,50.

Nhánh trả lời KHÔNG tự cuộn thêm một tầng nữa (`.bl-ds--con{overflow:visible}`)
— hai thanh cuộn lồng nhau là thứ không ai gỡ được bằng ngón tay.

**Dải `‹ ›` dính đáy phải đục BẰNG MÀU CHỖ NÓ NGỒI.** Nó có chữ trôi qua phía
dưới nên nền không thể trong suốt; nhưng bản trước ghi cứng `--surface-solid`
(màu mặt thẻ, tức trắng) và ra một vệt trắng giữa nền tím nhạt, đổi theme thì
vẫn trắng. Đo ngược từ `.bl-ds` lên thì `.bl-than`, `.binh-luan`, `.post-foot`,
`.post-layout`, `main`, `.shell` đều trong suốt — thứ thật sự sơn màu ở trang
bài là `<body>`, tức `--bg`. Mà tấm trượt ở điện thoại (`.bl-than--tam`) thì
LẠI là một mặt thẻ thật. Không có một token nào đúng cả hai chỗ, nên màu ấy
thành một biến đặt ở chính khung chứa (`--bl-nen`) và dải chỉ việc đọc: biến
tuỳ chỉnh di truyền, nên nó luôn khớp với thứ đang sơn phía sau, ở mọi theme.

#### Gửi xong phải THẤY lời mình, và sửa được

Trước bản này: gửi xong hiện một dòng "đang chờ duyệt" rồi hết. Lời vừa gõ
không hiện ra ở đâu, vì danh sách công khai chỉ chở bình luận **đã** duyệt.

Cơ chế sửa thì đã đủ từ trước — mã sửa cất trong `localStorage`, máy chủ cho ba
lượt (`PUT /api/binh-luan`), nút `Edit · n` dựng sẵn. Chỉ có điều không ai dùng
được: muốn bấm `Edit` thì phải **thấy** bình luận, mà nó không hiện. Một cơ chế
hoàn chỉnh không có cửa vào.

Nay cắm thẳng một hàng vào cuối danh sách, dựng từ chính những gì vừa gửi cộng
cái mã máy chủ trả về — cùng một `veMot` với mọi hàng khác, nên nút `Edit`, ô
sửa tại chỗ và bộ đếm lượt chạy y hệt. Hàng ấy mang `.bl-item--cho`: một vạch
dọc `--warn` bên trái, và huy hiệu `.badge--warn` đúng viên thuốc `PENDING` của
ngăn Comment (§20.1).

**Chỉ trong phiên này.** Tải lại trang là nó biến mất, cho tới khi admin duyệt.
Đó là chuyện đúng chứ không phải chuyện thiếu: máy chủ không trả về bình luận
chưa duyệt, và bày ra một thứ chỉ mình mình thấy suốt nhiều phiên thì người gửi
tưởng lời mình đã lên trang. Dòng báo nói thẳng điều ấy, kèm số lượt sửa còn
lại.

#### Nút `Send` thôi đổ bóng

`.btn` mang ba lớp: viền trong, bóng đổ (`--glass-drop`) và quầng sáng
(`--glow`) — đúng cho một nút đứng trên màn hero, nơi nó là vật nổi trên nền.
Trong khung bình luận thì nó đứng trong một khung đã có nền riêng, sát một nút
viền mảnh (`Back`), ngay dưới mấy ô gõ cũng chỉ có viền: bóng cộng quầng làm nó
nổi hẳn ra khỏi bộ, và trên màn hẹp cái bóng tràn qua mép khung. Giữ viền
trong, bỏ hai lớp kia; lúc rê vào thì nhấc bằng chính viền ấy đậm lên.

### 20.1 · Chip · huy hiệu · con số — BA HÌNH, và cách chọn

Ba hình nhỏ bằng nhau, cùng một cỡ chữ, cùng chỗ đứng na ná nhau. Chúng đã bị
dùng lẫn nhiều lần, nên luật phải nằm ở một câu hỏi duy nhất — **bấm vào nó có
chuyện gì xảy ra không?**

| Hình | Lớp | Bấm được? | Nó nói gì | Ở đâu |
|---|---|---|---|---|
| **Chip** | `.chip` + `.chip-so` + `.chip--nay` | **Có** — đổi thứ đang thấy | "lọc theo cái này" / "đi tới đây" | `.chip-hang` ngoài trang · `.ad-loc` trong admin |
| **Huy hiệu** | `.badge` + `--warn` `--ok` `--bad` | Không | trạng thái của **một** mục | hàng meta dưới tiêu đề · ô `.ad-cd` của một hàng |
| **Con số** | `.ad-dem` | Không | đếm **cả** danh sách, hoặc một con số trong hàng | `.ad-chan` (dạt phải) · trong ô `.ad-cd` |

Không có hình thứ tư. Cần một hình mới thì trước hết phải trả lời được nó khác
ba cái này ở việc gì.

**Ba dấu hiệu nhận nhau.** Chip có **vòng viền** và nền trong — vòng viền là
tín hiệu "bấm được" của cả trang, nên không thứ nào khác được mang nó. Huy hiệu
có **nền rửa màu** và không viền — một khối màu đặc thì đọc ra là trạng thái,
không phải lời mời bấm. Con số là **phông máy, mờ** — không viền, không nền.

**Biến thiên của huy hiệu gọi theo SẮC, không gọi theo NGHĨA.** `--warn` chứ
không phải `--draft`, `--cho`, `--chua-duyet`. Nghĩa thì mỗi bàn một bộ — bài có
Nháp/Ẩn, bình luận có Chờ/Đã duyệt, mai thêm ngăn nữa lại thêm một bộ nữa — và
mỗi bộ tên mới là một lần phải tra lại "cái này trông thế nào". Sắc thì chỉ có
ba, và ai cũng chọn được ngay:

| Sắc | Nghĩa | Ví dụ |
|---|---|---|
| `--warn` | còn chờ người làm gì | `DRAFT` · `PENDING` |
| `--ok` | xong, không phải làm gì nữa | dành sẵn |
| `--bad` | bị gỡ khỏi chỗ của nó | `HIDDEN` |

CHỮ trong huy hiệu nói nghĩa; LỚP chỉ nói sắc.

**Chỉ đánh dấu cái LỆCH khỏi bình thường.** Một bài đang hiện không có huy
hiệu; một bình luận đã duyệt cũng không. Trước bản V2.9.2 bàn duyệt in cả hai —
`LIVE` xanh hoặc `PENDING` cam trên mọi hàng — nên mười lăm hàng là mười lăm
nhãn mà mười ba cái trong đó nói "bình thường". Cột ấy gần như chỉ còn nhiễu, và
đúng cái đáng thấy thì không nổi hơn được bao nhiêu. Chỗ của hàng đã xong đã có
hai thứ nói rồi: cả hàng mờ đi `.55`, và nút của nó đọc ra là `Unapprove`.

**Chỗ đứng KHÔNG nằm trong lối vẽ.** `.ad-dem` từng gói luôn `margin-left:auto`
vào khai báo của nó, vì chỗ duy nhất nó xuất hiện lúc ấy là góc phải một thanh.
Đem con số ấy vào một ô hàng thì nó tự dạt đi mất. Nay lối vẽ là lối vẽ, còn
dạt phải là một luật riêng theo chỗ đứng (`.ad-thanh > .ad-dem`,
`.ad-chan > .ad-dem`). Cùng một lẽ, `.ad-cd` thôi tự vẽ trạng thái: nó chỉ còn
giữ **bề rộng cố định** để mọi hàng thẳng cột, còn hình thì mượn `.badge`.

### 20.2 · Thanh trên: một hàng, và nửa trái phải có người ở

Cả ba ngăn dùng đúng một `.ad-thanh`, và hàng chip lọc `.ad-loc` **luôn dạt
phải**. Nửa trái là chỗ của những thứ điều khiển cả bảng:

| Ngăn | Nửa trái | Nửa phải |
|---|---|---|
| Post | `New post` · ô tìm | chip `All · Live · Draft · Hidden` |
| Category | `New category` · ô tìm | — |
| Comment | ô tick **tất cả** | chip `Pending · Live · All` |

Ngăn Comment không có nút New và không có ô tìm, nên nếu chỉ có chip thì nửa
trái trống trơn — mà cho chip về trái thì ba ngăn cạnh nhau có hai kiểu thanh.
Ô tick tất cả giải cả hai: nó cũng là một thứ điều khiển cả bảng, và nó vốn còn
thiếu. Nó tick những dòng **đang hiện** (trong bộ lọc hiện thời, trong trần 25
dòng một lượt) — đúng bằng tầm mà các nút làm-hàng-loạt chạy trên đó, vì "tất
cả" rộng hơn cái mắt đang thấy là một lời hứa máy không giữ. Ba trạng thái chứ
không hai: tick vài dòng bằng tay thì ô ấy phải là `indeterminate`.

**Ngăn Post bỏ ô chọn chuyên mục.** Nó dư: ô tìm ngay cạnh soi **cả** tiêu đề
lẫn tên chuyên mục, nên gõ `tarot` là ra đủ, bất kể đó là tên mục hay một chữ
trong tiêu đề. Hai thứ làm một việc đứng cạnh nhau thì người dùng phải đoán xem
chúng khác nhau chỗ nào — mà chúng không khác.

**Con số tổng của ngăn Category xuống chân bảng.** Nó vốn ngồi trên thanh, giữa
nút New và ô tìm, nên đọc ra như thứ thứ ba bấm được. Nó nói về danh sách, nên
chỗ của nó là cạnh danh sách — và đó cũng là chỗ nút `‹ ›` sang trang sẽ vào
khi danh sách dài tới mức phải chia trang. Con số với nút sang trang là một cặp:
`8 of 12  ‹ ›`.

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

---

## 22 · Ô SOẠN BÀI `.sz-*` — MỘT THANH NÚT, KHÔNG MỘT CÁI TỦ

Ô soạn ở `/z-admin/` → Post là một `contenteditable`, và mọi thứ gõ được trong
đó đều phải đi ra Markdown ở lượt lưu rồi đọc ngược lại được ở lượt sửa. Cả
chương này xoay quanh đúng ràng buộc ấy.

### 22.1 · Thanh nút hai hàng, chia theo NGHĨA

Hàng 1 đổi **CHỮ** (đậm, nghiêng, liên kết, màu, chỉ số trên dưới…). Hàng 2 đổi
**KHỐI** (tiêu đề, danh sách, căn dòng, media, khung nhấn, bảng, mã, checklist).

Chia cố định chứ không để `flex-wrap` tự xuống hàng: khi chỗ xuống hàng do bề
ngang cửa sổ quyết định thì cùng một cái nút, màn rộng hẹp khác nhau là nằm
hàng khác nhau — và người dùng nhớ nút theo VỊ TRÍ, không theo tên.

Mỗi nhóm bọc trong một `.sz-nhom`, nên nhóm xuống hàng nguyên cụm chứ không bị
xé đôi, và vạch ngăn là viền trái của nhóm chứ không phải một thẻ riêng — nhờ
vậy không bao giờ có vạch đứng lạc một mình ở đầu hàng.

**Mọi ngăn bung ra nằm NGAY DƯỚI thanh nút** — ngăn Media, bảng màu, khung đặt
cỡ bảng, bảng chọn ngôn ngữ khối mã, ô xem thử, ô Markdown. Bản đầu dựng chúng
ở cuối khối theo đúng thứ tự viết mã, nên ngăn Media rơi xuống **259px** bên
dưới ô soạn: bấm Media xong màn hình không đổi gì trong tầm mắt, phải cuộn
xuống mới thấy các lựa chọn — mà người ta thì đang nhìn cái nút vừa bấm. Thứ
tự lắp ráp nay là thanh nút → các ngăn → khung gõ, đo lại còn **0px**.

### 22.2 · Bảng Blocks đã bỏ — và vì sao

Từng có một bảng "Blocks" gom mười sáu thứ vào một chỗ: ảnh, video, bảng, mã,
bốn khung nhấn, hai lớp đoạn, cộng một khung chỉ dẫn dài ở dưới. Ai mở ra cũng
phải đọc hết mới tìm được thứ mình cần, và bốn khung nhấn trong đó trông y hệt
nhau nên bấm cái nào cũng như nhau.

Nay tách theo CÂU HỎI người viết đang hỏi:

| Nút | Mở ra | Câu hỏi nó trả lời |
|---|---|---|
| **Media** | ảnh · khổ ảnh · YouTube · video · gallery · wide · full | "đặt cái gì vào bài?" |
| **Khung nhấn** | note · tip · warn · stop, mỗi dòng một chấm màu | "nhấn câu này bằng tông nào?" |
| **Khối mã** | tám ngôn ngữ + "no colours" | "tô màu cú pháp theo ngôn ngữ nào?" |
| Bảng · checklist · chữ nhỏ · tắt sapo · căn dòng | chèn thẳng | — |

Khung chỉ dẫn cũng bỏ: nó dạy gõ tay đúng những thứ đã có nút, và hai cửa dạy
một việc thì sớm muộn chúng lệch nhau. Nay mỗi nút có một dòng chú thích khi rê
chuột, và `</>` in ra đúng đoạn Markdown sắp gửi đi.

### 22.3 · Khối `:::` — màu ngay trong ô gõ, loại đổi trên NHÃN

Khối nhấn trong ô soạn là `<div class="sz-khoi" data-khoi="note">` có một nhãn
hai phần: `note` (loại, khoá) và tiêu đề (gõ được tại chỗ).

Ba biến `--kh` · `--kh-chu` · `--kh-nen` lấy đúng bộ biến của `.callout--*` bên
`prose.css`, nên **ô soạn vẽ đúng thứ trang sẽ hiện**. Trước đó cả bốn loại vẽ
y hệt nhau ở đây — viền tím, nền chìm — nên bấm Tip mà thấy ra một cái hộp
giống hệt Note thì kết luận là hai nút làm cùng một việc.

Bấm vào chữ `note` là xoay note → tip → warn → stop. Ba khối bọc (gallery ·
wide · full) không xoay: chúng không cùng một họ với nhau.

### 22.4 · Bảng: một `<table>` thật, đổi ra Markdown lúc lưu

Đời trước chèn mấy dòng `| | |` vào một đoạn văn và để người viết gõ giữa hai
dấu gạch. Nhìn ra đúng như nó là: một mớ ký tự — không thấy được ô nào là ô
nào, thêm một cột là phải đếm tay lại cả bảng, gõ lố một dấu là bảng thôi là
bảng.

Nay trong ô soạn nó là `<table class="sz-bang-o">`: bấm ô nào gõ ô đó, **Tab**
sang ô kế, **Shift+Tab** lùi, Tab ở ô cuối thì thêm một hàng mới. Hàng đầu là
`<thead>` — đúng hàng mà bộ dựng hiểu là hàng tiêu đề.

Hai chiều đổi nằm ở `khoi()` (TABLE → mấy dòng gạch đứng) và `bangTuMD()`
(gạch đứng → TABLE). Dấu `|` người viết lỡ gõ trong một ô được thoát, không thì
nó cắt ô ấy làm đôi ở lượt đọc lại.

Cỡ bảng hỏi bằng một `<dialog>` có hai cặp nút cộng trừ và một bảng xem trước,
không phải một chuỗi `3x4` gõ vào `window.prompt`. Trần **5 × 20**: trần cột là
chuyện bề ngang thật (cột chữ rộng chừng 66 ký tự, chia sáu cột là mỗi cột mười
ký tự), trần hàng chỉ để chặn gõ nhầm.

### 22.5 · Ảnh: năm NẤC khổ, và không có tay kéo

Bấm vào một tấm ảnh trong ô soạn thì `.sz-anh-thanh` hiện ngay dưới nó với năm
nút, khổ đang dùng sáng lên. Cùng nếp với ô soạn thư (Gmail: *Small · Best fit
· Original*): chọn nấc, không kéo góc.

| nút | ghi ra file | nghĩa | khổ hẹp |
|---|---|---|---|
| Cỡ gốc | `{.goc}` | đúng khổ thật, **không bao giờ phóng to** | như nhau |
| Nhỏ | `{.rat-hep}` | 31% cột chữ — đúng một NỬA nấc hẹp | 52% |
| Hẹp | `{.hep}` | 62% cột chữ, căn giữa | 86% |
| Thường | *(không có)* | bằng cột chữ | như nhau |
| Tràn | `{.full}` | tràn hết bề ngang màn hình | như nhau |

**Và ảnh hẹp hơn cột chữ thì CĂN DÒNG được.** Ba nút icon ở nửa sau thanh nổi:
trái · giữa · phải, ghi ra `{.hep .trai}` — cùng tên lớp với căn dòng của đoạn
văn, vì cùng một ý thì cùng một tên, và bộ dựng đã đọc được chúng sẵn.

Ba nút ấy **tắt** ở nấc *Thường* và *Tràn*: một tấm rộng bằng đúng cột chữ hay
tràn cả trang thì không còn chỗ trống nào để dạt về bên nào, và bày ra một cái
nút bấm không đổi gì còn tệ hơn là không có nút. Đổi khổ thì giữ nguyên căn
dòng — trừ khi khổ mới không căn được, lúc ấy lớp căn bị gỡ luôn chứ không nằm
lại chờ trong file.

**KHÔNG bao giờ ghi `{.giua}` lên một tấm ảnh**, dù đó là cái nút ở giữa.
`.prose .giua` là bộ chọn HẬU DUỆ và nó kèm `max-width:46ch` — đúng cho một
đoạn chữ căn giữa, mà rơi lên `<figure>` thì bóp tấm ảnh lại còn 46 ký tự bề
ngang. Giữa vốn đã là mặc định của mọi nấc hẹp, nên nút Giữa nghĩa là *bỏ lớp
căn đi*, không phải *thêm một lớp*. Cùng một cái bẫy với `{.nho}` bên dưới:
bảng tên lớp phải tra TRƯỚC khi đặt thêm tên mới.

Chữ không chạy vòng quanh ảnh. `float` làm được, nhưng nó vỡ ở khổ hẹp (một
tấm 31% float trái trên màn 375px để lại một cột chữ rộng hai chữ cái) và
Markdown không chở nổi thứ để đọc lại cho đúng. Medium, Substack, Ghost đều chỉ
căn, không cho chữ chạy quanh. Ở khổ hẹp thì `.hep` nới lên 86% nên nó gần như
không dạt được nữa (đo ở 375px: lệch 46px) — đó là hệ quả thật của việc nới,
không phải lỗi; muốn thấy rõ thì dùng nấc *Nhỏ*, đo được 158px.

**Nấc *Rộng* (`{.wide}`) đã bỏ khỏi thanh.** Nó nghĩa là "rộng hơn cột chữ một
chút", mà một chút ấy không đủ để thấy khác và lại đủ để phá nhịp cột — ảnh
nào đáng phá nhịp thì đáng tràn hẳn. Lớp `.wide` vẫn còn trong `prose.css` cho
những bài cũ đã gõ tay; chỉ là không có nút nào sinh ra nó nữa.

Mỗi nút kèm một dòng giải thích trong `title`: "Hẹp" hay "Rộng" không tự nói ra
nó rộng hơn **cái gì**.

**Một việc, một cửa.** Ngăn Media từng có thêm một dòng bấm-vòng "bề ngang
ảnh" (`thường → rộng → tràn`). Nó đi vì nó là cửa THỨ HAI vào cùng một việc mà
thanh nổi làm tốt hơn — năm nấc, thấy ngay nấc đang dùng, không phải bấm vòng
để dò — và vì hai cửa ấy đã bắt đầu lệch nhau: dòng kia vẫn phát ra `{.wide}`
sau khi nấc *Rộng* đã bỏ khỏi thanh.

**Lớp `sz-anh--*` chỉ để NHÌN trong khung gõ; thứ đi vào file là `data-lop`.**
Trước bản này chúng chỉ được gắn lúc BẤM nút, nên mở một bài cũ ra thì mọi tấm
ảnh hiện rộng bằng cột chữ dù trong file ghi `{.hep}` — người viết tưởng khổ đã
mất và bấm đặt lại, ghi đè lên đúng thứ mình đã chọn lần trước. Nay `donAnh()`
dựng lại lớp xem trước từ `data-lop` sau mỗi lần nạp.

**`{.goc}` là nấc quan trọng nhất mà bản trước thiếu.** Mặc định
`.prose figure img{width:100%}` kéo mọi tấm ảnh rộng bằng cột chữ — đúng cho
ảnh chụp, sai hẳn cho ảnh chụp màn hình, sơ đồ, logo: một tấm rộng 320px bị
phóng lên 720px và mờ nhoè, mà người viết không có cách nào bảo "để yên nó
đấy".

**Và nó phải tên `{.hep}`, KHÔNG phải `{.nho}`.** `{.nho}` đã là lớp của đoạn
chữ nhỏ (`.prose .nho{font-size:var(--fs-sm);color:var(--text-faint)}`), mà bộ
chọn ấy là **hậu duệ** — nên nó ăn luôn vào `<figure class="nho">` và tấm ảnh
kéo theo cỡ chữ nhỏ, màu nhạt cho chú thích của nó. Hai thứ khác hẳn nhau thì
phải hai tên. Đã suýt trùng một lần; ghi lại đây để lần sau đặt tên lớp mới thì
tra bảng trước.

Nấc chứ không phải tay kéo. Kéo góc cho to nhỏ tuỳ ý là thứ **không viết ra
được thành Markdown**, nên một con số pixel sẽ biến mất ở lượt lưu — bày ra một
tay cầm kéo được rồi để nó mất tác dụng còn tệ hơn là không có. Và một con số
chọn trên màn 27 inch là một tấm ảnh tràn mép trên điện thoại. Medium ·
Substack · Ghost đều cho nấc, không cho kéo.

**Hai nấc thu nhỏ, vì một nấc không đủ.** Ba nấc đời đầu đều đi MỘT CHIỀU:
bằng cột chữ, rộng hơn cột chữ, tràn cả trang — không có đường nào cho ảnh
**nhỏ lại**. Thả một tấm ảnh dọc chụp từ điện thoại vào bài là nó chiếm trọn
chiều cao màn hình và không có cách nào thu. *Hẹp* `62%` lấp chỗ ấy; rồi hoá ra
`62%` vẫn to quá cho bìa sách, logo và ảnh chụp màn hình dọc, nên có thêm *Nhỏ*
`31%` — đúng một nửa, để hai nấc đứng cạnh nhau nhìn ra ngay là hai nấc chứ
không phải một nấc bị lệch. Ở khổ hẹp cả hai đều nới (86% và 52%), vì 62% của
một cột đã hẹp là một tấm ảnh bé không nhìn ra gì.

### 22.5b · Danh sách · thụt vào · ô việc — BA LUẬT, VÀ CHÚNG PHẢI ĐI VỚI NHAU

Ba nút này dùng riêng thì chạy, dùng cùng nhau thì hỏng — và hỏng im lặng.
Dưới đây là từng ca, cách xử đúng, và con số đo được của cái sai.

**Ca 1 · Gõ chữ rồi mới bấm nút danh sách.** `execCommand('insertUnorderedList')`
của Chromium tự kéo con trỏ về đầu dòng: đo được offset 8 → offset 0. Gõ tiếp
là chữ mới chui vào TRƯỚC chữ cũ. Nên mọi lệnh danh sách phải đi qua
`lamDanhSach()`: **cắm mốc giữ con trỏ trước khi gọi lệnh**, gọi lệnh, dọn cấu
trúc, rồi trả con trỏ về mốc. `npm run kiem` canh đúng luật này.

**Ca 2 · Mốc phải gỡ TRƯỚC khi đặt con trỏ.** Biên của một `Range` là cặp (nút
cha, chỉ số con). Đặt biên ngay sau cái mốc rồi mới gỡ mốc thì mọi chỉ số sau
nó tụt một bậc, biên trỏ ra ngoài phạm vi, và trình duyệt **bỏ luôn vùng chọn**
— `rangeCount` về 0, mọi phím gõ tiếp rơi vào hư không. Đếm chỉ số, gỡ, rồi mới
đặt biên vào đúng chỉ số ấy.

**Ca 3 · Ô việc là một LOẠI danh sách, không phải một thứ chèn vào.** Bản cũ
chèn thẳng một mẩu `<ul><li data-viec="0"> </li></ul><p><br></p>` cố định: nó
không đổi dòng đang đứng, nó bỏ rơi con trỏ ra ngoài ô việc vừa tạo, và bấm khi
đang ở trong một danh sách thì nó nhét `<ul>` vào giữa `<ul>`. Nay nó là nút
**đổi loại**, cùng họ với nút chấm và nút số:

| đang là | bấm nút việc thành |
|---|---|
| đoạn văn | mục việc |
| mục chấm | mục việc (giữ chữ và bậc thụt) |
| mục số | mục việc (đổi `<ol>` → `<ul>`) |
| mục việc | đoạn văn |

**Ca 4 · Quyết theo CẢ vùng chọn, không theo mỗi dòng con trỏ đứng.** Bôi đen
ba mục rồi bấm: biên đầu vùng chọn có thể rơi vào một đoạn trống ở trên, nên
hỏi "con trỏ đang ở `<li>` nào" trả về `null`, và nút tưởng "chưa có danh
sách" rồi gọi `insertUnorderedList` — mà lệnh ấy là một cái CÔNG TẮC: đang có
danh sách thì nó **bỏ** danh sách đi. Đo thật: ba mục tan thành `a<br>b<br>`.

**Ca 5 · `Tab` / `Shift+Tab` trong danh sách = thụt vào / thụt ra.** Đó là phím
tay người dùng tìm tới trước khi mắt tìm nút, và nó giống nhau ở Notion, Google
Docs, Word, GitHub. Trước bản này Tab trong một mục rơi vào hành vi mặc định
của `contenteditable`: nhảy tiêu điểm **ra khỏi cả khung soạn**.

**Ca 6 · `Enter` trên một mục rỗng = ra một bậc.** Enter thứ nhất mở mục mới;
mục ấy còn rỗng nên Enter thứ hai phải đưa ra — ra bậc ngoài nếu đang ở danh
sách con, ra hẳn đoạn văn nếu đã ở bậc ngoài cùng. Không có luật này thì Enter
mãi mãi đẻ thêm mục rỗng và cách duy nhất để thoát là bấm nút trên thanh.

Ca này **không** mượn `execCommand('outdent')`: cái mốc giữ con trỏ là một
`<span>` cắm vào chính mục ấy, nên mục thôi rỗng trong mắt trình duyệt và
`outdent` XẺ nó — mốc ở lại trong, phần rỗng đi ra. Làm thẳng tay: bỏ mục rỗng,
dựng chỗ đứng mới ở bậc ngoài. Và chỉ chạy khi mục rỗng là mục **cuối** danh
sách — mục rỗng ở giữa là chỗ người ta vừa chèn thêm dòng và sắp gõ vào.

**Ca 7 · Trong khung chỉ có KHỐI, không có chữ trần.** Ô soạn mở ra rỗng thì
chữ đầu tiên gõ vào là một nút chữ trần, con trực tiếp của khung, không `<p>`
nào bọc. Từ đó Enter không tách được đoạn (không có khối để tách), `formatBlock`
không bắt được gì, và `sangMD` xuất ra hai đoạn dính làm một. Nên: gieo sẵn
`<p><br></p>` lúc mở, và mỗi lần nội dung đổi thì gom mọi nút trần vào một
`<p>` — gom theo CỤM liền nhau, để một câu có chữ đậm ở giữa không bị xé thành
ba đoạn.

**Ca 9 · Thụt vào ở mục ĐẦU danh sách.** `execCommand('indent')` không làm gì
khi mục không có mục nào đứng trước — không có gì để lồng vào. Trước bản này
nút Thụt vào lại còn một chặn sẵn `if (li && !li.previousElementSibling) return;`
đứng TRƯỚC cả đường xử lý, nên một danh sách một dòng không sao lồng được, mà
cũng không báo gì. Google Docs và Word xử ca này bằng cách sinh một mục cha
**rỗng** bọc lấy — đó là thứ duy nhất đúng được cả về cấu trúc lẫn về Markdown,
vì `- ` một mình xuất ra rồi đọc lại vẫn là một mục rỗng có con. Nhớ chừa một
dấu cách sau `-`: bước rửa khoảng trắng cuối dòng ăn mất `-` trơ và nó quay về
thành một đoạn văn — đã thử năm cách viết, chỉ `"-  "` đi về được nguyên vẹn.

**Ca 10 · Mốc phải được CỨU trước khi khối cũ bị xoá.** `insertUnorderedList`
dựng `<ul>` mới rồi bỏ cái mốc giữ con trỏ **ở lại** trong `<p>` cũ; bước dọn
sau đó xoá `<p>` rỗng ấy đi. Con trỏ theo mốc rơi vào một nhánh đã lìa khỏi
trang: `rangeCount` vẫn là 1, vẫn gõ được, nhưng chữ gõ vào không hiện ở đâu
cả. Nên trước khi xoá bất cứ khối nào, phải soi trong nó còn mốc không — còn
thì chuyển sang mục cuối của danh sách vừa dựng.

**Ca 11 · Gõ tắt Markdown phải HOÃN một nhịp.** `# ` · `## ` · `> ` · `- ` ·
`1. ` · `[] ` ở đầu một khối trống thì đổi khối luôn, như Notion, Bear,
Obsidian, Linear. Việc này chạy trong sự kiện `input`, mà `execCommand` gọi
ngay trong một sự kiện `input` thì Chromium **lặng lẽ** bỏ qua: đo được là chữ
mồi biến mất đúng như mong, nhưng khối không đổi — `# chữ` ra `<p>chữ</p>` chứ
không ra `<h2>`. Không lỗi, không ném gì, chỉ là không xảy ra. Đẩy lệnh sang
`setTimeout(…, 0)`. `npm run kiem` canh cái hoãn này.

Và nó chỉ bắt khi cả khối chỉ có mấy ký tự mồi ấy, nên gõ `- ` giữa câu vẫn ra
dấu gạch. Riêng `- ` và `1. ` thì không bắt khi đang đứng trong một `<li>` —
ở đó người ta đang gõ nội dung mục, không phải đang xin một danh sách nữa.

**Ca 8 · Mục rỗng lọc lúc XUẤT, không xoá trong DOM.** Đã thử dọn `<li>` rỗng
ngay trong `donDanhSach`. Sai nặng: hàm ấy chạy sau mỗi lần thụt vào/thụt ra,
tức đúng lúc mục mới còn rỗng — nó xoá ngay cái mục đang chuẩn bị gõ vào, con
trỏ rơi theo, và cả bài mất sạch còn `<p><br></p>`. Mục rỗng là trạng thái
**bình thường** lúc đang soạn; chỗ đúng để lọc nó là lúc `sangMD` xuất ra.

### 22.7 · Ô xem thử — và vì sao nó chỉ đáng có sau khi bộ dựng thuần

Ô soạn đã gần giống bài thật, nhưng "gần" chưa đủ ở bốn chỗ, và cả bốn chỉ lộ
ra **sau khi đã đăng**:

| | trong ô soạn | trên trang |
|---|---|---|
| đoạn đầu bài | một đoạn thường | **sapo** — cỡ lớn hơn, màu nhạt hơn |
| `:::note` | khung có nhãn | ô nhấn có màu, có lề, có dấu |
| `:::gallery` | ảnh xếp dọc | xếp ngang thành lưới |
| bề ngang | bề ngang ô soạn | **cột chữ thật** — chỗ ngắt dòng khác |

**Điều kiện để có ô xem thử: chỉ được có MỘT bộ dựng.** Hai bộ thì sớm muộn
lệch nhau, và một ô xem thử lệch là một ô **nói dối** — tệ hơn không có, vì
người viết tin nó. Nên trước khi làm ô này, `tools/lib/markdown.mjs` được gỡ
hết phụ thuộc vào Node: nó từng `import` thẳng `node:path` và `node:fs`, nay
chỉ hỏi qua hai hàm người gọi đưa vào (`ctx.coFile`, `ctx.doAnh`). Bộ dựng
trang đưa vào hai hàm đọc đĩa thật; trình duyệt không đưa gì, và hai phép kiểm
ảnh lặng lẽ bỏ qua.

Kiểm lại cú gỡ ấy bằng cách so **thân HTML của từng bài** với bản đang chạy
thật (bản ấy dựng bằng mã cũ): 15/16 giống hệt từng byte, cái còn lại là trang
danh sách chuyên mục chứ không phải bài.

Hai file ấy gửi sang trình duyệt nguyên dạng ES module (`/assets/md.mjs` +
`/assets/md-text.mjs`, ~18KB), không gói, không rút gọn. Đuôi `.mjs` để nói
thẳng ra đây là module — và cả bước vân tay lẫn phép kiểm "mọi file JS đều
dịch được" đều đã dạy để hiểu đuôi ấy (`new Function()` dựng script cổ điển
nên `import`/`export` ném lỗi; phải cắt mấy dòng ấy đi rồi mới dịch phần thân).

**Cái ô này KHÔNG đo được:** khổ ảnh. `ctx.doAnh` cần đọc file trên đĩa, mà
trình duyệt thì không có đĩa — nên ảnh trong ô xem thử thiếu `width`/`height`
và có thể xô nhẹ lúc tải xong. Bài THẬT thì không, vì lúc dựng thật vẫn đo đủ.

Ô này còn chở **thẻ chia sẻ** — tiêu đề, tóm tắt, ảnh bìa, dựng theo đúng khuôn
Facebook/Zalo vẫn vẽ. Đó là thứ người viết không thấy được ở đâu khác, và là
thứ quyết định người ta có bấm vào bài hay không. Ba mẩu ấy nằm ở ô viết bài
chứ không ở ô soạn, nên trang chủ quản đưa vào qua một HÀM (`tuyChon.thongTin`)
— một giá trị chụp lúc gắn thì sửa tiêu đề xong mở lại vẫn thấy tiêu đề cũ.

### 22.8 · Dải ảnh — bốn dạng

Trước bản này chỉ có **một**: lưới tự xếp, và mọi tấm bị cắt vuông. Cắt vuông
đúng cho một bộ ảnh chụp lẫn lộn ngang dọc — hàng nào cũng thẳng, mắt đọc ra
một BỘ chứ không ra mấy tấm rời. Nhưng nó sai ở ba chỗ rất thường gặp:

| dạng | ghi ra file | dùng khi |
|---|---|---|
| (mặc định) | `:::gallery` | bộ ảnh chụp — cắt vuông, lưới tự xếp |
| giữ tỉ lệ | `:::gallery .giu` | bìa sách, ảnh chụp màn hình — **không cắt** |
| hai cột | `:::gallery .hai` | ảnh trước – ảnh sau |
| ba cột | `:::gallery .ba` | bộ ba, không để lẻ hàng |

Dạng là một **lớp** sau tên khối, nên nó vẫn là Markdown đọc được, không phải
một cú pháp riêng. Bốn dòng bày sẵn trong bảng Media chứ không bắt gõ tên lớp:
người không biết code không có cách nào đoán ra `.giu` nghĩa là gì.

`.hai` và `.ba` vẫn xuống một cột ở khổ hẹp — ép hai cột trên màn 375px là hai
tấm ảnh rộng 160px, nhỏ hơn cả ngón tay.

**Bấm nút dải ảnh là bảng chọn ảnh mở ra ngay.** Bản đầu chỉ dựng một khung
rỗng rồi thôi — đúng về cấu trúc, vô dụng về đường đi: không có chỗ nào trong
khung nói cho người ta biết ảnh vào bằng cách nào, nên phải tự đoán ra là đi
vòng qua nút Media rồi kéo từng tấm thả vào. Nay một cú bấm làm đủ ba việc:
dựng khung, đặt con trỏ vào TRONG khung, rồi gọi `oFile.click()`. Thứ tự ấy
quan trọng — mở bảng chọn trước khi có chỗ đặt thì ảnh về không biết rơi vào
đâu.

### 22.6 · Ba luật cứng của mọi thứ trong ô soạn

1. **Chữ và thẻ trong dòng thì `insertHTML`; KHỐI thì dựng tay.** Luật đời đầu
   là "mọi thứ đều `insertHTML`", vì lệnh ấy đi qua đúng cỗ máy hoàn tác của
   trình duyệt nên Ctrl+Z gỡ được. Nhưng với khối thì nó không giữ nổi lời:
   Chromium **làm sạch** đoạn HTML theo chỗ con trỏ đang đứng, mà con trỏ thì
   đang ở trong một `<p>` — `<pre>` không được phép nằm trong `<p>`, nên nó bị
   rút thành một thẻ rỗng và cả phần mã biến mất khỏi Markdown xuất ra. Đo
   được ở nút khối mã, nút đường kẻ, nút bảng và nút dải ảnh. Nên khối (`pre`,
   `table`, `hr`, `figure`, `:::`) dựng thẳng bằng DOM rồi chèn sau khối đang
   đứng; đổi lại phải tự lo chỗ đứng cho con trỏ, và Ctrl+Z gỡ một nhát hết cả
   khối thay vì gỡ dần.
2. **`mousedown` + `preventDefault` trên mọi nút**, không phải `click`. Bấm một
   cái nút là trình duyệt bỏ vùng chọn trong khung soạn TRƯỚC khi `click` chạy
   tới; chặn ở `mousedown` thì vùng chọn còn nguyên.
3. **Vòng đổi-đi-đổi-lại phải đứng yên từ lượt lưu thứ hai.** Mở một bài đã
   đăng ra rồi lưu lại mà file đổi là hỏng. Đây là luật **chưa có phép kiểm tự
   động nào canh** — `sangMD`/`tuMD` chạy trong trình duyệt và cần một cây DOM,
   mà bộ kiểm định thì chạy trong Node và không dùng thư viện ngoài. Nên mỗi
   lần đụng vào hai hàm ấy, phải thử tay: mở một bài có đủ khối (bảng, khung
   nhấn, ảnh, khối mã), bấm `</>` ghi lại đoạn Markdown, lưu, mở lại, bấm `</>`
   lần nữa — hai đoạn phải giống nhau từng ký tự.
