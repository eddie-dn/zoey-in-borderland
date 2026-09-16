# CÀI ĐẶT CÁC DỊCH VỤ BÊN NGOÀI

> Blog này chạy được **mà không cần cài gì cả**. Mở ra là có bài, có trang giới
> thiệu, có ô trích dẫn. Ba thứ dưới đây đều là **tuỳ chọn** — mỗi cái thêm một
> tính năng, và cái nào chưa cài thì phần đó lặng lẽ không xuất hiện, không bao
> giờ hiện lỗi cho người đọc thấy.
>
> | # | Cần gì | Thêm được gì | Chưa cài thì sao | Mất bao lâu |
> |---|---|---|---|---|
> | 3 | Cloudflare Pages | trang lên mạng thật | chỉ xem được ở máy mình | ~10 phút |
> | 5 | Cloudflare D1 + hai biến khoá | **bình luận · đếm lượt xem · ghi chú đăng thẳng** | ba phần đó lặng lẽ không xuất hiện | ~10 phút |
> | 2 | Gemini API | mỗi ngày một câu trích dẫn viết mới | dùng kho câu trong `content/quote-nguon.md` | ~10 phút |
>
> **Ba tính năng dùng CHUNG một cơ sở dữ liệu D1 và CHUNG một cặp khoá.** Làm
> mục 5 một lần là xong cả ba: bình luận (§1), đếm lượt xem (§5) và ghi chú
> đăng thẳng (§6). Không phải cài ba lần, không phải nhớ ba cặp khoá.
>
> Thứ tự gọn nhất: **3 → 5 → 2**. Có địa chỉ trang rồi mới gắn cơ sở dữ liệu.

---

## 0 · Trước khi bắt đầu

Cần sẵn: một tài khoản **Cloudflare** (miễn phí, đăng ký bằng email) và — chỉ
nếu muốn trích dẫn viết mới mỗi ngày — một tài khoản **Google**. Không cần thẻ
tín dụng cho bất kỳ bước nào ở đây.

Mức miễn phí của cả hai rộng hơn nhiều so với nhu cầu của một blog cá nhân.
Đừng lo chuyện hết hạn mức.

---

## 1 · Bình luận — Cloudflare D1

Không cần dịch vụ nào ngoài Cloudflare. Bình luận đi vào cùng cơ sở dữ liệu D1
với lượt xem và ghi chú, và **bạn duyệt ngay trên chính trang web** — không có
bảng tính nào ở giữa.

> **Bản trước dùng Google Apps Script + Google Sheet.** Cái sai không nằm ở
> Apps Script mà ở chỗ nó ĐỨNG TRÊN ĐƯỜNG ĐỌC: mỗi người mở một bài đều phải
> đợi một lượt gọi sang Google (khởi động nguội 1–3 giây, không cache được ở
> biên) chỉ để lấy về mấy dòng bình luận. Đổi lại được đúng một thứ — bạn tick
> một ô trong bảng tính. Nay việc tick ấy chuyển lên trang web, và người đọc
> không phải trả giá cho nó nữa.

### 1.1 · Gắn D1 và đặt khoá

Làm **§5.1**, **§5.2** và **§6.2** — tạo cơ sở dữ liệu, gắn vào dự án với tên
biến `DB`, đặt hai biến bí mật `GC_ID` và `GC_KEY`. Cả ba tính năng dùng chung
đúng bấy nhiêu.

Bảng `binh_luan` **không phải tạo tay**: bình luận đầu tiên tự tạo.

### 1.2 · Bật trong cấu hình

```json
"binhLuan": { "bat": true, "api": "/api/binh-luan" }
```

Đã là mặc định. `bat: false` thì tắt hẳn khung bình luận trên mọi bài.

### 1.3 · Duyệt — mở trang `/z-admin/`

```
tên-miền-của-bạn/z-admin/
```

**Một trang, hai việc:** ô viết ghi chú ở trên, hàng chờ duyệt bình luận ở
dưới. Lưu vào màn hình chính điện thoại là một chạm vào thẳng.

Cửa sau: ở trang giới thiệu, **bấm 5 nhịp vào tiêu đề** cũng tới đây — tiện khi
đang đọc mà không muốn gõ địa chỉ.

> Trang này `noindex`, không nằm trong sitemap, không có trong thanh điều
> hướng. Nhưng ai gõ đúng đường dẫn vẫn mở được, và chỉ thấy một ô xin khoá.
> Chỗ giấu đường dẫn **không phải** lớp bảo mật — hai vế khoá ở máy chủ mới là.

### 1.4 · Hoặc mở `#duyet` ở bất kỳ bài nào

Thêm `#duyet` vào địa chỉ một bài bất kỳ:

```
tên-miền-của-bạn/posts/tan-man/chiec-guong/#duyet
```

Lần đầu nó hỏi mã chủ và khoá — **cùng một cặp với ô viết ghi chú**, nhập ở đâu
cũng mở được cả hai. Trình duyệt nhớ trên máy đó.

Hàng chờ là của **CẢ BLOG**, không riêng bài đang mở: mỗi dòng ghi rõ nó thuộc
bài nào. Duyệt từ điện thoại mà phải mở từng bài xem bài nào có gì đang chờ thì
không ai duyệt nữa.

| Nút | Làm gì |
|---|---|
| **Duyệt** | bình luận hiện ra với mọi người |
| **Bỏ duyệt** | rút xuống, không xoá |
| **Ẩn** | xoá mềm — biến khỏi trang và khỏi hàng chờ, dòng vẫn còn trong D1 |

Bình luận **của chính bạn** (gửi lúc máy có khoá) lên thẳng, có huy hiệu
`AUTHOR`, không phải chờ duyệt. Chủ nhà không phải tự duyệt lời của mình.

### 1.5 · Những gì nó tự lo

- **Không bình luận nào tự lên trang.** Mọi dòng vào bảng đều chờ duyệt. Đây là
  lớp chặn spam thật sự; mấy phép kiểm dưới đây chỉ lọc bớt cho đỡ rác.
- **Bẫy bot:** một ô ẩn mà người không thấy nhưng bot điền vào, và mốc "mở form
  chưa tới 3 giây đã gửi xong". Dính bẫy thì máy chủ trả về *thành công* — nói
  thẳng "mày là bot" là chỉ cho người viết bot biết cần sửa gì.
- **Email không bao giờ ra khỏi cơ sở dữ liệu.** Không câu lệnh nào đọc cột
  email, kể cả lượt gọi của bạn. Muốn xem thì mở Console của D1.
- **Trả lời chỉ hai tầng**, y như Facebook. Trả lời của trả lời gắn vào bình
  luận gốc của nhánh đó.

### 1.6 · Đổi khoá, và khi mất khoá

Đổi `GC_KEY` trên Cloudflare rồi bấm **Quên khoá** ở cuối bàn duyệt để nhập
lại. Mọi máy đã nhớ khoá cũ sẽ mất quyền — đó là cách thu hồi.

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
| `GEMINI_MODEL` | model lùi về khi tên trên bị 404/403 | `gemini-flash-latest` |

> **Đừng đặt hai biến này.** Cả hai mặc định đều là bí danh `-latest`, thứ
> Google tự hoán đổi sang bản mới nhất của dòng đó (đổi lớn thì báo trước hai
> tuần). Đặt một số hiệu cụ thể — `gemini-3.6-flash` chẳng hạn — là hẹn trước
> một ngày phải quay lại sửa: tháng 9/2026, `gemini-2.0-flash` mà bản trước
> dùng làm lưới dự phòng đã nằm trong mục *Previous models* với nhãn
> *(Shut down)*.
>
> Hai bí danh KHÁC NHAU là chỗ an toàn: bản lite hỏng thì còn bản flash đầy
> đủ. Chỉ đặt tay khi bạn thật sự muốn một model khác hẳn.

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

## 3 · Đưa lên Cloudflare — **Worker** hay **Pages**?

Cloudflare có hai kiểu dự án, và **chọn nhầm thì mấy hàm trong `functions/`
lặng lẽ không chạy**. Nhìn tên miền là biết mình đang ở kiểu nào:

| Tên miền | Kiểu | `functions/` | Cần gì thêm |
|---|---|---|---|
| `…pages.dev` | **Pages** | Cloudflare tự đọc | không |
| `…workers.dev` | **Worker** | **KHÔNG tự đọc** | `worker.js` + `wrangler.jsonc` (repo có sẵn) |

> **Triệu chứng khi chạy dưới Worker mà thiếu định tuyến:** trang tĩnh mở bình
> thường, bài đọc được, giao diện đủ cả — nhưng `/api/...` trả 404 hết. Không
> có lỗi nào trong log, vì với Worker thì mấy đường ấy chưa từng tồn tại. Bình
> luận không gửi được, lượt xem không đếm, ô viết ghi chú báo lỗi mạng.
>
> Thử nhanh: mở `tên-miền/api/xem?u=/` trên trình duyệt. Ra JSON là xong; ra
> 404 là đang dính đúng chuyện này.

### 3.1 · Nếu là Worker (…workers.dev)

Repo đã có sẵn `worker.js` và `wrangler.jsonc` — `worker.js` định tuyến bốn
đường `/api/...` về đúng mấy hàm trong `functions/`, còn lại giao cho trang
tĩnh. Không chép lại logic, nên sửa hàm chỉ sửa một chỗ.

Trên dashboard, dự án → **Settings** → **Build**:

| Ô | Điền |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Rồi mở `wrangler.jsonc`, sửa `"name"` cho trùng tên dự án.

> **Mỗi lần thêm một hàm vào `functions/api/` là phải thêm một dòng vào bảng
> `CUA` trong `worker.js`.** `npm run kiem` có phép kiểm canh việc này — thiếu
> một đường là báo đỏ, vì thiếu thì nó 404 mà không ai báo.

### 3.2 · Nếu là Pages (…pages.dev)

Không phải làm gì. Cloudflare đọc `functions/` và tự dựng đường đi. `worker.js`
với `wrangler.jsonc` nằm im, không ảnh hưởng.

Tạo dự án: **Workers & Pages** → **Create** → **Pages** → nối vào repo GitHub,
build command `npm run build`, output directory `dist`.

---

### 3.3 · Các bước tạo dự án, từng ô một

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

Thanh trái → **Storage & databases** → **D1 SQL Database** → **Create**.
Đặt tên gì cũng được, ví dụ `zoey-blog`.

> D1 **không** nằm trong mục Workers & Pages nữa — tài liệu cũ hay chỉ sai chỗ
> này.

**Không phải tạo bảng nào.** Cả ba bảng — `xem`, `ghi_chu`, `binh_luan` — tự
tạo ở lượt dùng đầu tiên. Chép ra đây để đọc code là biết trong đó có gì:

```sql
CREATE TABLE IF NOT EXISTS xem (
  u   TEXT PRIMARY KEY,
  so  INTEGER NOT NULL DEFAULT 0,
  sua TEXT
);
```

> Bản trước bắt chạy câu ấy bằng tay, và quên bước đó thì `/api/xem` nổ **500**
> ở mọi lượt mở bài — nổ lặng lẽ, vì phía trình duyệt nuốt mọi lỗi để không làm
> đỏ console của người đọc. Trang nhìn vẫn bình thường, chỉ thiếu con số, còn
> log Worker thì đầy 500. Một bước tay trong tài liệu là một bước sẽ có người
> quên.

### 5.2 · Gắn vào dự án

**Nếu là Pages** (`…pages.dev`): project → **Settings** → **Bindings** →
**Add** → **D1 database**.

**Nếu là Worker** (`…workers.dev`): tab **Bindings** ở đầu trang dự án →
**Add a binding** → **D1 database**.

| Ô | Điền |
|---|---|
| Variable name | **`DB`** — đúng hai chữ này, hàm tìm đúng tên đó |
| D1 database | chọn cơ sở dữ liệu vừa tạo |

Nhớ thêm cho **cả hai** môi trường (Production và Preview), không thì bản xem
thử im lặng không đếm.

> ⚠️ **Worker deploy bằng wrangler thì DASHBOARD KHÔNG PHẢI NGUỒN ĐÚNG.**
> `npx wrangler deploy` lấy `wrangler.jsonc` làm nguồn và **gỡ mọi binding
> không có trong đó**. Gắn D1 bằng tay trên dashboard rồi đẩy một commit mới
> là nó biến mất — lặng lẽ, và triệu chứng y hệt lúc chưa gắn bao giờ.
>
> Nên với Worker thì khai luôn trong `wrangler.jsonc` (cuối file có sẵn khối
> chú thích, bỏ dấu chú thích rồi dán `database_id` vào):
>
> ```jsonc
> "d1_databases": [
>   { "binding": "DB", "database_name": "zoey-blog", "database_id": "…" }
> ]
> ```
>
> `database_id` lấy ở trang cơ sở dữ liệu D1, mục **Database ID**.
>
> Hai khoá `GC_ID`/`GC_KEY` thì **ngược lại**: chúng là Secret, đặt trên
> dashboard và sống sót qua mọi lượt deploy. Đừng đưa vào `wrangler.jsonc` —
> file ấy đi theo repo.

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
| `binhLuan.bat` = false, hoặc chưa gắn D1 | Khung bình luận ẩn (hoặc rỗng). Bài đọc bình thường. |
| Sai `GC_ID` / `GC_KEY` | Người đọc gửi bình luận bình thường. Chỉ bàn duyệt `#duyet` báo sai khoá. |
| Chưa khai `GEMINI_KEY` | Ô trích dẫn dùng kho câu sẵn. Không phân biệt được. |
| Gemini chậm quá 3 giây | Giữ nguyên câu từ kho sẵn. Không chớp, không nhảy. |
| `ghiChu.online` = false, hoặc chưa gắn D1 | `/notes/` hiện đúng những ghi chú đã dựng sẵn. Không ai biết là có cửa `#viet`. |
| Sai `GC_ID` / `GC_KEY` | Người đọc không thấy gì cả. Chủ trang mở `#viet` thì ô viết báo "Không gửi được". |
| Tắt JavaScript | `/notes/` mất hàng nút lọc và mất những ghi chú chưa kéo về Markdown. Ghi chú dựng sẵn đọc đủ. |
| Mất mạng hoàn toàn | Cả trang vẫn đọc được, trừ bình luận. Ô trích dẫn vẫn chạy. |

Đây là chủ ý xuyên suốt: **không dịch vụ bên ngoài nào được phép làm hỏng việc
đọc một bài viết.**
