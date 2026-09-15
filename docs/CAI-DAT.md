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

## 5 · Bảng tra nhanh: cái gì hỏng thì mất gì

| Hỏng | Người đọc thấy gì |
|---|---|
| `phanTich.bat` = false | Không có gì thay đổi với người đọc — chỉ là chủ trang không biết bài nào có người xem. |
| Chưa khai `binhLuan.url` | Form bình luận ẩn, có một dòng nhắc nhỏ. Bài đọc bình thường. |
| Apps Script hết hạn quyền | Bình luận cũ không tải được, form vẫn gửi được. Không có thông báo lỗi to. |
| Chưa khai `GEMINI_KEY` | Ô trích dẫn dùng kho câu sẵn. Không phân biệt được. |
| Gemini chậm quá 3 giây | Giữ nguyên câu từ kho sẵn. Không chớp, không nhảy. |
| Mất mạng hoàn toàn | Cả trang vẫn đọc được, trừ bình luận. Ô trích dẫn vẫn chạy. |

Đây là chủ ý xuyên suốt: **không dịch vụ bên ngoài nào được phép làm hỏng việc
đọc một bài viết.**
