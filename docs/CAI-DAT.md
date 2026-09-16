# CÀI ĐẶT CÁC DỊCH VỤ BÊN NGOÀI

> Blog này chạy được **mà không cần cài gì cả**. Mở ra là có bài, có trang giới
> thiệu, có ô trích dẫn. Ba thứ dưới đây đều là **tuỳ chọn** — mỗi cái thêm một
> tính năng, và cái nào chưa cài thì phần đó lặng lẽ không xuất hiện, không bao
> giờ hiện lỗi cho người đọc thấy.
>
> | # | Dịch vụ | Thêm được gì | Chưa cài thì sao | Mất bao lâu |
> |---|---|---|---|---|
> | 1 | Google Apps Script + Sheet | khung bình luận, trả lời | form ẩn đi, bài vẫn đọc bình thường | ~15 phút |
> | 2 | Gemini API | mỗi ngày một câu trích dẫn viết mới | dùng kho câu trong `content/quote-nguon.md` | ~10 phút |
> | 3 | Cloudflare Pages | trang lên mạng thật | chỉ xem được ở máy mình | ~10 phút |
>
> Làm theo thứ tự 3 → 1 → 2 thì gọn nhất: có địa chỉ trang rồi mới đi khai
> mấy thứ kia.

---

## 0 · Trước khi bắt đầu

Cần sẵn: một tài khoản **Google** (cho bình luận và Gemini) và một tài khoản
**Cloudflare** (miễn phí, đăng ký bằng email). Không cần thẻ tín dụng cho bất
kỳ bước nào ở đây.

Cả ba dịch vụ đều có mức miễn phí rộng hơn nhiều so với nhu cầu của một blog
cá nhân. Đừng lo chuyện hết hạn mức.

---

## 1 · Bình luận — Google Apps Script + Google Sheet

Bình luận được cất trong một **Google Sheet của riêng bạn**. Không có dịch vụ
thứ ba nào giữ dữ liệu, không có tài khoản nào phải tạo, và người đọc không
phải đăng nhập gì cả.

### 1.1 · Lập bảng tính

1. Mở **sheets.new** → một bảng tính trống hiện ra.
2. Đặt tên gì cũng được, ví dụ `Zoey — Bình luận`.
3. **Không cần tự tạo cột.** Script tự lập hàng tiêu đề ở lần chạy đầu, và tự
   thêm cột còn thiếu nếu sau này có bản mới.

### 1.2 · Dán script

1. Trong bảng tính: **Extensions** → **Apps Script**.
2. Xoá hết đoạn `function myFunction() {}` có sẵn.
3. Mở `tools/apps-script/Code.gs` trong repo, copy **toàn bộ**, dán vào.
4. Bấm biểu tượng đĩa mềm để lưu.

### 1.3 · Xuất bản

1. Góc trên bên phải: **Deploy** → **New deployment**.
2. Bấm bánh răng cạnh chữ "Select type" → chọn **Web app**.
3. Điền:

   | Ô | Chọn |
   |---|---|
   | Description | gì cũng được, ví dụ `v1` |
   | Execute as | **Me** |
   | Who has access | **Anyone** |

4. **Deploy**. Google hỏi quyền lần đầu: **Authorize access** → chọn tài khoản →
   màn hình "Google hasn't verified this app" thì bấm **Advanced** → **Go to …
   (unsafe)** → **Allow**.

   :::note Chữ "unsafe" ở đây là bình thường
   Google hiện cảnh báo đó cho MỌI script chưa qua kiểm duyệt của họ, kể cả
   script do chính bạn vừa viết. Bạn đang cấp quyền cho chính mình.
   :::

5. Copy dòng **Web app URL**. Nó có dạng
   `https://script.google.com/macros/s/AKfy…/exec`.

### 1.4 · Khai vào blog

Mở `site.config.json`, dán vào:

```json
"binhLuan": {
  "bat": true,
  "url": "https://script.google.com/macros/s/AKfy…/exec",
  "loiMoi": "Ghé ngang thì để lại một dòng cũng được — không cần đăng ký gì cả."
}
```

Chạy `npm run build`, đẩy lên. Xong.

### 1.5 · Duyệt bình luận

**Không bình luận nào tự lên trang.** Mọi dòng vào Sheet đều chờ bạn duyệt —
đây mới là lớp chặn spam thật sự, mấy lớp kiểm trong script chỉ lọc bớt cho đỡ
rác Sheet.

Mở Sheet, cột **Duyet**, gõ `x` vào dòng nào muốn cho lên. Chấp nhận cả
`x` · `v` · `1` · `yes` · `ok` · ô checkbox đã tick.

### 1.6 · Tự trả lời bình luận

Thêm một dòng mới trong Sheet, điền tay:

| Cột | Điền |
|---|---|
| `Thoi gian` | để trống cũng được, hoặc gõ ngày |
| `Trang` | copy y hệt ô `Trang` của bình luận đang trả lời |
| `Ten` | tên bạn |
| `Noi dung` | nội dung trả lời |
| `Duyet` | `x` |
| `Ma` | gõ gì cũng được, miễn không trùng — ví dụ `tl1` |
| `Tra loi cho` | copy ô `Ma` của bình luận đang trả lời |
| `Chu trang` | `x` ← cái này làm nó hiện huy hiệu **AUTHOR** |

### 1.7 · Email thì sao

Cột `Email` **không bao giờ ra khỏi Sheet**. Hàm `doGet` đọc đúng năm cột và
cột email không nằm trong đó, nên không có cách nào moi nó qua mạng. Nó chỉ để
bạn liên hệ lại riêng nếu muốn.

---

## 2 · Trích dẫn Gemini — tuỳ chọn, mặc định TẮT

Ô "Quote of the day" **luôn chạy** bằng kho câu trong `content/quote-nguon.md`,
nhúng thẳng vào HTML lúc build. Không cần mạng, không tốn đồng nào, và mỗi ngày
đổi một câu theo cơ chế chia bài (xem `docs/QUOTE.md`).

Lớp Gemini chỉ thêm một việc: mỗi ngày xin một câu **viết mới**, bốc ngẫu nhiên
một chủ đề và một nhóm tác giả trong file nguồn.

### 2.1 · Lấy khoá

1. Mở **aistudio.google.com/apikey**.
2. **Create API key** → chọn một project (hoặc để nó tự tạo).
3. Copy chuỗi khoá. Nó bắt đầu bằng `AIza…`.

:::stop Đừng dán khoá này vào bất kỳ file nào trong repo
Repo đẩy lên GitHub là khoá lộ, và bot quét GitHub tìm khoá API chạy liên tục.
Khoá chỉ được nằm ở biến môi trường trên Cloudflare — bước 2.2.
:::

### 2.2 · Khai khoá trên Cloudflare

1. **dash.cloudflare.com** → **Workers & Pages** → chọn dự án.
2. **Settings** → **Variables and Secrets** → **Add**.
3. Điền:

   | Ô | Điền |
   |---|---|
   | Type | **Secret** (không phải Plaintext — Secret thì sau này không xem lại được, đúng ý) |
   | Variable name | `GEMINI_KEY` |
   | Value | dán chuỗi `AIza…` |

4. **Save**.
5. Sang tab **Deployments** → deploy mới nhất → **⋯** → **Retry deployment**.

   :::warn Phải deploy lại
   Biến môi trường chỉ đi vào hàm lúc deploy. Thêm biến xong mà không deploy lại
   thì hàm vẫn chạy bản cũ và vẫn báo "chưa khai khoá".
   :::

### 2.3 · Bật trong cấu hình

`site.config.json`:

```json
"quoteAI": { "bat": true, "api": "/api/quote" }
```

Chạy `npm run build`, đẩy lên.

### 2.4 · Hai biến tuỳ chọn khác

| Tên | Để làm gì | Mặc định |
|---|---|---|
| `GEMINI_MODEL_QUOTE` | đổi model cho riêng ô trích dẫn | `gemini-flash-lite-latest` |
| `GEMINI_MODEL` | model lùi về khi tên trên bị 404/403 | `gemini-2.0-flash` |

### 2.5 · Kiểm xem có chạy không

Mở thẳng địa chỉ này trên trình duyệt:

```
https://<trang-của-bạn>/api/quote?ngay=2026-09-15
```

| Trả về | Nghĩa là |
|---|---|
| `{"ok":true,"q":"…","tacGia":"…"}` | chạy rồi ✓ |
| `{"ok":false,"ly_do":"chua-khai-khoa"}` | chưa khai `GEMINI_KEY`, hoặc khai rồi mà chưa deploy lại |
| `{"ok":false,"ly_do":"gemini 429"}` | vượt hạn mức miễn phí, chờ sang ngày |
| `{"ok":false,"ly_do":"câu không dùng được (…)"}` | Gemini trả câu quá ngắn hoặc quá dài, đã bị loại đúng ý |
| Trang 404 | hàm để nhầm chỗ — phải là `functions/api/quote.js` |

**Mọi trường hợp `ok:false` đều vô hại.** Trang vẫn hiện câu từ kho sẵn; người
đọc không thấy gì khác thường.

### 2.6 · Tốn bao nhiêu

Mỗi ngày đúng **một** lần gọi cho toàn bộ người đọc — kết quả được Cloudflare
cache tới nửa đêm, và trình duyệt còn cất thêm một bản trong `localStorage`.
Cộng thêm mỗi lần ai bấm nút "Another one". Với một blog cá nhân thì con số này
nằm gọn trong mức miễn phí của Gemini.

---

## 3 · Cloudflare Pages

Xem `docs/DUA-LEN-MANG.md` §3 — có đủ ba ô phải điền và mấy cái bẫy hay gặp.

---

## 4 · Đo lượt xem — tuỳ chọn, mặc định TẮT

Cloudflare Web Analytics. **Không đặt cookie**, nên không phải dựng banner xin
phép. Vì sao chọn nó chứ không phải Google Analytics: `docs/DUA-LEN-MANG.md` §9.1.

### 4.1 · Phải deploy trước

Web Analytics gắn theo **hostname**, nên chưa có trang trên mạng thì chưa lấy
được token. Làm xong mục 3 rồi hãy quay lại đây.

### 4.2 · Lấy token

1. Cloudflare Dashboard → **Analytics & Logs** → **Web Analytics**
2. **Add a site** → nhập hostname (`ten-trang.pages.dev`, hoặc tên miền thật
   nếu đã trỏ xong)
3. Nó đưa một đoạn như thế này:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "a1b2c3d4e5f6..."}'></script>
```

**Chỉ lấy phần token**, bỏ cả đoạn còn lại — bộ dựng tự sinh thẻ script.

### 4.3 · Dán vào cấu hình

```json
"phanTich": {
  "bat": true,
  "token": "a1b2c3d4e5f6..."
}
```

```bash
npm run kiem     # có phép kiểm canh: bật mà quên token là báo đỏ
npm run build
```

Commit + push → Cloudflare tự dựng lại. Số liệu hiện sau vài phút, và chỉ đếm
lượt truy cập **thật**: mở bằng `npm run dev` ở máy mình không tính.

### 4.4 · Hai chỗ dễ sai

**Đừng bật ở cả hai nơi.** Cloudflare Pages cũng có nút tự chèn đoạn beacon
(Pages project → Settings). Bật cả hai thì một trang có hai đoạn beacon, và mỗi
lượt xem đếm thành hai. Chọn một:

| Cách | Khi nào dùng |
|---|---|
| `site.config.json` | muốn cấu hình nằm trong repo, đi cùng bản dựng, có phép kiểm canh |
| Nút trên dashboard | muốn bật/tắt không cần đụng code — lúc đó giữ `"bat": false` |

**Token này CÔNG KHAI**, khác hẳn `GEMINI_KEY`. Nó nằm nguyên văn trong HTML mọi
trang, ai xem mã nguồn cũng thấy — nên để trong repo là đúng chỗ, không phải lỗ
hổng. `GEMINI_KEY` thì ngược lại: không bao giờ được rời khỏi Cloudflare.

### 4.5 · Đoán trước trang kế — đã bật sẵn, không cần cài gì

`"doanTruoc": true` trong `site.config.json`. Trình duyệt tải sẵn trang mà người
đọc rê chuột vào, nên bấm xong hiện gần như tức thì. Không gọi dịch vụ nào, không
cần token. Đặt `false` để tắt. Chi tiết: `docs/DUA-LEN-MANG.md` §9.3.

---

## 5 · Đếm lượt xem — tuỳ chọn, mặc định TẮT

Khác hẳn mục 4. **Cloudflare Web Analytics đếm rất tốt nhưng KHÔNG có API đọc
ngược**: số liệu chỉ xem được trên bảng điều khiển, không lấy ra in lên chính
bài viết được. Muốn con số hiện trong hàng meta thì phải tự giữ lấy nó — và chỗ
đúng để giữ là **D1**, cơ sở dữ liệu SQLite của Cloudflare.

> **Vì sao D1 chứ không phải KV.** KV giới hạn mỗi khoá một lượt ghi mỗi giây.
> Bộ đếm lượt xem đúng là cái kiểu ghi ấy — nhiều lượt vào cùng một khoá — nên
> KV sai việc ngay từ hình dạng. D1 thì `so = so + 1` là một phép cộng nguyên tử.

### 5.1 · Tạo cơ sở dữ liệu

Cloudflare Dashboard → **Workers & Pages** → **D1** → **Create database**.
Đặt tên gì cũng được, ví dụ `zoey-xem`.

Mở tab **Console** của nó và chạy:

```sql
CREATE TABLE IF NOT EXISTS xem (
  u   TEXT PRIMARY KEY,
  so  INTEGER NOT NULL DEFAULT 0,
  sua TEXT
);
```

### 5.2 · Gắn vào dự án

Pages project → **Settings** → **Bindings** → **Add** → **D1 database**:

| Ô | Điền |
|---|---|
| Variable name | **`DB`** — đúng ba chữ này, hàm tìm đúng tên đó |
| D1 database | chọn cơ sở dữ liệu vừa tạo |

Nhớ thêm cho **cả hai** môi trường (Production và Preview), không thì bản xem
thử im lặng không đếm.

### 5.3 · Bật trong cấu hình

```json
"luotXem": { "bat": true, "api": "/api/xem" }
```

`npm run kiem` có phép kiểm canh: bật mà thiếu hàm, hoặc trang bài không có ô
lượt xem, là báo đỏ.

### 5.4 · Con số này gần đúng, không chính xác

Nói thẳng còn hơn giả vờ:

- **Bot cào trang cũng bị tính.** Chỉ đếm khi trình duyệt chạy JavaScript nên
  chặn được phần lớn, nhưng bot biết chạy JS thì vẫn lọt.
- **Tải lại trang trong cùng phiên không cộng thêm** — nhưng mở tab mới thì
  tính lại.
- **Không biết ai là ai**, và cố ý không biết: không cookie, không dấu vết.

Chưa gắn D1 thì hàm trả về trạng thái tắt, trang lặng lẽ bỏ qua và hàng meta
chỉ ngắn đi một mục — không có dòng đỏ nào trong console của người đọc.

---

## 6 · Ghi chú đăng thẳng — tuỳ chọn, mặc định TẮT

Bắt gặp một quyển sách, một bản nhạc, một ý thoáng qua — muốn ghi ngay mà không
phải mở máy, sửa `content/ghi-chu.md`, chạy build rồi đẩy lên. Mục này mở một
cửa: vào `/notes/#viet` trên điện thoại, gõ, xong, ghi chú lên trang liền.

> **Đây là chỗ đứng tạm, không phải nhà.** Ghi chú đăng kiểu này chỉ hiện khi
> trình duyệt chạy JavaScript, không có trong RSS, sitemap hay chỉ mục tìm
> kiếm, và bản sao lưu duy nhất của nó là Cloudflare. Nhà của ghi chú vẫn là
> `content/ghi-chu.md`. Xem mục **6.5** để kéo chúng về.

### 6.1 · Dùng chung D1 với mục 5

Không cần tạo cơ sở dữ liệu thứ hai — hàm này tìm đúng biến `DB` như hàm đếm
lượt xem. Chưa làm mục 5 thì làm **5.1** và **5.2** trước, phần tạo bảng `xem`
bỏ qua cũng được.

Bảng `ghi_chu` **không phải tạo tay**: lượt đăng đầu tiên tự tạo. Chép ra đây
để biết trong đó có gì:

```sql
CREATE TABLE IF NOT EXISTS ghi_chu (
  ma   TEXT PRIMARY KEY,
  ngay TEXT NOT NULL,
  loai TEXT NOT NULL DEFAULT '',
  chu  TEXT NOT NULL,
  luc  TEXT NOT NULL,
  xoa  INTEGER NOT NULL DEFAULT 0
);
```

`xoa` là **xoá mềm**: bấm × trên trang chỉ đánh dấu `xoa = 1`, dòng vẫn nằm đó.
Muốn dọn hẳn thì vào Console của D1 mà `DELETE`.

### 6.2 · Đặt hai vế khoá

Pages project → **Settings** → **Variables and Secrets** → **Add**, kiểu
**Secret** (không phải Plaintext — Plaintext hiện nguyên văn trên dashboard):

| Variable name | Điền |
|---|---|
| **`GC_ID`** | mã chủ, ví dụ `zoey`. Biết được cũng chẳng sao |
| **`GC_KEY`** | chuỗi bí mật, càng dài càng tốt. Đây mới là cái khoá |

Sinh một chuỗi tử tế:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

Thêm cho **cả hai** môi trường (Production và Preview).

> **Thiếu một vế là chặn hết, không phải mở hết.** Hàm coi "chưa đặt đủ khoá"
> nghĩa là chưa cấu hình và từ chối mọi lượt ghi. Để trống **không** có nghĩa
> là ai cũng đăng được.

### 6.3 · Bật trong cấu hình

```json
"ghiChu": { "online": true, "api": "/api/ghi-chu" }
```

`npm run kiem` có phép kiểm canh: bật mà thiếu hàm, thiếu địa chỉ API trên
`/notes/`, hoặc khai `api` trỏ đi chỗ khác, là báo đỏ.

### 6.4 · Dùng

Mở **`/notes/#viet`**. Lần đầu nó hỏi mã chủ và khoá; nhập xong thì trình duyệt
nhớ trên **máy đó** — máy khác, trình duyệt khác, chế độ ẩn danh đều phải nhập
lại. Lưu địa chỉ ấy vào màn hình chính điện thoại là một chạm ra ô viết.

Ô viết nhận: ngày (mặc định hôm nay), loại (gõ gì cũng được, trang tự gom thành
bộ lọc) và nội dung. Nội dung hiểu `**đậm**`, `*nghiêng*`, `` `mã` ``,
`[chữ](địa-chỉ)` và ngắt đoạn bằng dòng trống — vừa đủ cho mấy dòng ghi nhanh.

> **`#viet` không phải lớp bảo mật**, chỉ là chỗ cất cho khuất mắt. Lớp bảo mật
> là hai vế khoá ở phía máy chủ: ai gõ đúng `#viet` cũng chỉ thấy một cái ô xin
> khoá.

Đăng được bằng dòng lệnh luôn, tiện cho phím tắt trên điện thoại:

```bash
curl -X POST https://ten-mien-cua-ban/api/ghi-chu \
  -H 'x-gc-id: zoey' -H 'x-gc-key: KHOA-CUA-BAN' \
  -H 'Content-Type: application/json' \
  -d '{"ngay":"2026-09-16","loai":"sách","chu":"Mấy dòng."}'
```

### 6.5 · Kéo về nhà — `npm run gc`

Chạy trước mỗi lần dựng. Nó xin ghi chú trên D1 về, ghi vào
`content/ghi-chu.md`, **rồi mới** xoá bản trên D1 — ghi trước xoá sau, để máy có
chết giữa chừng thì cùng lắm còn một bản thừa, chứ không mất trắng.

```bash
GC_ID=zoey GC_KEY=KHOA-CUA-BAN npm run gc
npm run gc -- --thu     # chỉ xem sẽ kéo về gì, không sửa gì
```

Kéo về rồi thì ghi chú thành ghi chú bình thường: vào RSS, vào tìm kiếm, đọc
được khi tắt JavaScript, và nằm trong bản sao lưu của chính thư mục dự án.

Quên khoá lúc chạy thì nó vẫn ghi vào file nhưng **không xoá được trên D1**, và
nó nói thẳng ra như vậy — bỏ qua dòng cảnh báo ấy thì lần dựng sau `/notes/` sẽ
hiện ghi chú hai lần.

## 7 · Bảng tra nhanh: cái gì hỏng thì mất gì

| Hỏng | Người đọc thấy gì |
|---|---|
| `luotXem.bat` = false, hoặc chưa gắn D1 | Hàng meta thiếu mục lượt xem. Không có gì khác đổi. |
| `phanTich.bat` = false | Không có gì thay đổi với người đọc — chỉ là chủ trang không biết bài nào có người xem. |
| Chưa khai `binhLuan.url` | Form bình luận ẩn, có một dòng nhắc nhỏ. Bài đọc bình thường. |
| Apps Script hết hạn quyền | Bình luận cũ không tải được, form vẫn gửi được. Không có thông báo lỗi to. |
| Chưa khai `GEMINI_KEY` | Ô trích dẫn dùng kho câu sẵn. Không phân biệt được. |
| Gemini chậm quá 3 giây | Giữ nguyên câu từ kho sẵn. Không chớp, không nhảy. |
| `ghiChu.online` = false, hoặc chưa gắn D1 | `/notes/` hiện đúng những ghi chú đã dựng sẵn. Không ai biết là có cửa `#viet`. |
| Sai `GC_ID` / `GC_KEY` | Người đọc không thấy gì cả. Chủ trang mở `#viet` thì ô viết báo "Không gửi được". |
| Tắt JavaScript | `/notes/` mất hàng nút lọc và mất những ghi chú chưa kéo về Markdown. Ghi chú dựng sẵn đọc đủ. |
| Mất mạng hoàn toàn | Cả trang vẫn đọc được, trừ bình luận. Ô trích dẫn vẫn chạy. |

Đây là chủ ý xuyên suốt: **không dịch vụ bên ngoài nào được phép làm hỏng việc
đọc một bài viết.**
