# Ô TRÍCH DẪN MỖI NGÀY

> Hai lớp chồng nhau. Lớp dưới **luôn chạy**, không cần mạng, không cần khoá.
> Lớp trên là tuỳ chọn, bật lên thì mỗi **khung giờ** có thêm một câu do Gemini
> viết mới — mặc định ba khung một ngày.

---

## 1 · Một file tả NGUỒN, không phải một file chứa câu

Mọi thứ của ô này nằm ở **`content/quote-nguon.md`**. File đó có bốn mục, và
hai bên đọc hai phần khác nhau:

| Mục | Ai đọc | Lúc nào | Để làm gì |
|---|---|---|---|
| `### Chủ đề` | hàm `/api/quote` | mỗi khung giờ | chia bài, rút MỘT chủ đề |
| `### Nguồn` | hàm `/api/quote` | mỗi khung giờ | bốc ngẫu nhiên ~12 tác giả |
| `### Lời dặn` | hàm `/api/quote` | mỗi khung giờ | khuôn câu hỏi gửi Gemini |
| `### Câu sẵn` | `npm run build` | lúc dựng trang | kho nhúng thẳng vào HTML |

Sửa cái gì cũng chỉ mở đúng file đó, gõ như gõ văn bản thường.

### 1.1 · Vì sao bốc ngẫu nhiên nguồn, không gửi cả danh sách

Bản gốc bên dongchibinh-33 nhét cả bốn chủ đề và 46 cái tên vào một lời dặn.
Kết quả đo được: Gemini bám vào mấy cái tên quen nhất — Jung, Seneca, Lão Tử —
và gần như lúc nào cũng rơi vào chủ đề đứng đầu danh sách. Danh sách dài ra
cũng không làm câu đa dạng hơn.

Ở đây mỗi khung giờ lấy **một** chủ đề và **mười hai** tác giả rồi mới hỏi. Đo
trên 20 ngày liên tiếp: cả 8 chủ đề đều được dùng tới, cả 38 tác giả đều được
nhắc tên ít nhất một lần.

Số 12 là chỗ vừa: ít quá thì mấy hôm liền trùng người, nhiều quá thì lại quay
về đúng cái bệnh cũ — Gemini bám vào cái tên quen nhất trong nhóm.

### 1.2 · Cùng một khung giờ thì luôn ra cùng một chủ đề

Hạt giống của bộ bốc là **chuỗi ngày + số khung**, không phải `Math.random()`.
Nên gọi `/api/quote?ngay=2026-09-15&khung=1&sokhung=3` bao nhiêu lần cũng ra
cùng chủ đề và cùng nhóm tác giả. Bắt buộc phải vậy: Cloudflare cache câu trả
lời tới hết khung, mà cache chỉ khớp khi cùng đầu vào cho cùng đầu ra.

**Chủ đề thì chia bài, không bốc rời.** Bản đầu bốc chủ đề bằng chính hạt
giống ngày+khung ấy, mỗi khung bốc độc lập. Đo ra hỏng ngay: ngày 17/09 khung
1 và khung 2 cùng rơi vào "Cái đẹp của thứ bình thường". Không phải xui — 8
chủ đề, 3 khung thì xác suất có hai khung trùng nhau trong một ngày khoảng
30%, mà người đọc quay lại buổi tối gặp lại chủ đề ban chiều thì cả cơ chế
khung giờ thành công cốc.

Chữa bằng đúng cách kho câu sẵn đã dùng (§1.3): **xáo cả danh sách chủ đề một
lần theo ngày, rồi mỗi khung rút một lá theo thứ tự.** Quét 365 ngày × 3 khung:
**0/365 ngày** có hai khung trùng chủ đề, phân bố 125–151 lần quanh mức đều
136,9.

Hai ngày liền vẫn có thể chạm lại một chủ đề ở chỗ nối giữa hai cỗ bài (đo
được 42/364 lần, sát mức ngẫu nhiên 12,5%). Chỗ nối ấy bên kho câu sẵn phải
chữa vì nó lặp lại nguyên một **câu**; ở đây chỉ lặp **chủ đề**, mà chủ đề lặp
thì Gemini vẫn viết ra câu khác với nhóm tác giả khác. Không đáng thêm một lớp
cơ chế nữa.

### 1.3 · Kho `### Câu sẵn` — lớp nền luôn chạy

Kho này nhúng thẳng vào HTML lúc build, nên hiện ra tức thì: không cần mạng,
không cần khoá, không tốn đồng nào. Gemini chỉ là lớp phủ lên trên.

Cơ chế chọn là **chia bài**, không phải bốc ngẫu nhiên:

- mỗi câu ra **đúng một lần** trong mỗi vòng N ngày (N = số câu trong kho)
- không bao giờ trùng hai ngày liền, kể cả ở chỗ nối giữa hai vòng
- tất định: cùng ngày, mọi máy ra cùng câu, không cần lưu gì
- ngày tính theo **giờ máy người đọc**, không phải UTC

Đo trên kho 5 / 8 / 12 / 20 / 40 câu, 400 ngày: mỗi vòng đủ cả N câu, khoảng
cách gần nhất giữa hai lần trùng là 2 ngày, độ lệch phân bố ≤ 2.

:::note Vì sao không dùng chia dư
Bản đầu băm chuỗi ngày rồi lấy dư theo số câu. Đo 7 ngày liên tiếp ra
`[1,2,3,4,1,2,10]` — vừa gần như tuần tự, vừa trùng câu hai lần trong một tuần.
Hai ngày liền nhau chỉ khác một ký tự, và phần bit thấp của hàm băm không xáo
đủ mạnh để giấu điều đó sau phép chia dư.
:::

Thêm câu thì thêm vào `### Câu sẵn`, khuôn `- Nội dung — Tác giả` (gạch ngang
DÀI `—`). Càng nhiều câu thì vòng càng dài.

:::warn Tiêu đề phụ trong kho phải dùng `####`, đừng dùng `**đậm**`
Đây là chỗ bản gốc đã vấp: bộ đọc bên đó nhận cả `-` lẫn `*` làm gạch đầu dòng,
nên một dòng `**Tự biết mình**` bị hiểu thành một câu trích dẫn tên là
`*Tự biết mình**`. Bộ đọc ở đây **chỉ nhận `-`**, nên viết đậm ở đâu cũng an
toàn — nhưng cứ dùng `####` cho đúng ý.
:::

---

## 2 · Lớp Gemini — tuỳ chọn, mặc định TẮT

Cách bật, cách lấy khoá, cách khai biến môi trường: xem **`docs/CAI-DAT.md` §2**.

### 2.1 · Ba luật của lớp này

1. **Mỗi khung giờ gọi đúng một lần.** Cloudflare cache tới hết khung; trình
   duyệt còn cất thêm một bản trong `localStorage` theo cặp ngày+khung. Tải lại
   trang không gọi mạng lần nữa.
2. **Hỏng thì im.** Không mạng, chưa deploy, chưa khai khoá, Gemini chậm — câu
   từ kho sẵn vẫn đang nằm đó, người đọc không thấy gì khác thường.
3. **Bỏ cuộc sau 3 giây.** Lâu hơn thì thà giữ câu sẵn: không ai đứng chờ một ô
   trích dẫn.

### 2.1b · Khung giờ — mỗi ngày mấy câu

Đặt ở `site.config.json`, khoá `quoteAI.khung`:

| `khung` | Mốc giờ | Người đọc gặp mấy câu mới mỗi ngày |
|---|---|---|
| `1` | — | 1 (nếp cũ, cả ngày một câu) |
| `2` | 5h · 17h | 2 — sáng · tối |
| `3` | 5h · 12h · 18h | **3 — sáng · chiều · tối (mặc định)** |
| `4` | 5h · 11h · 15h · 20h | 4 — thêm khung trưa |

**Quãng 0h tới trước mốc đầu tính là khung CUỐI của hôm trước.** Người đọc lúc
1h sáng vẫn đang ở "buổi tối" theo cảm nhận, nhưng `getDate()` thì đã sang ngày
mới. Tính thẳng thì họ nhảy sang câu khác lúc nửa đêm rồi 5h sáng lại nhảy tiếp
— hai câu trong năm tiếng, đúng cái nhấp nháy mà cơ chế này sinh ra để tránh.

Bảng mốc giờ nằm ở **`src/js/quote.js`**, chỗ duy nhất biết đang mấy giờ ở nhà
người đọc. Hàm trên Cloudflare không tự tính được: nó chạy ở điểm biên nào thì
mang giờ chỗ đó, nên cặp `ngay` + `khung` phải do **trang gửi lên**.

Con số này đi xuống cả ba nơi — thẻ `data-khung` trong HTML, `src/js/quote.js`
và `functions/api/quote.js` — vì khoá cache của hàm là cặp ngày+khung. Hai bên
hiểu khác số khung thì trang xin một khoá mà hàm trả về theo khoá khác, và câu
đổi lung tung giữa buổi. `npm run kiem` có phép kiểm riêng cho chuyện đó.

:::warn Danh sách `### Chủ đề` phải dài ít nhất bằng số khung
Chia bài mà cỗ ít lá hơn số lần rút thì đành có khung trùng nhau. Tám chủ đề
hiện tại thừa sức cho tối đa bốn khung.
:::

Trần là 4. Dày hơn thì ô "câu của hôm nay" lại thành cái máy xổ số — đúng thứ
cơ chế này sinh ra để tránh. Build kêu lên và tạm dùng 4 nếu khai quá.

### 2.2 · Sàn và trần độ dài

Câu nhận được phải dài **40 đến 150 ký tự**, ngoài khoảng đó thì vứt.

Trần thì dễ hiểu. **Sàn cũng cần**: câu 30 ký tự làm ô chừa hẳn một mảng trống
bên phải, nhìn như bị cắt cụt — bản gốc đã vấp đúng chỗ này và phải nới trần
lên sau khi bỏ `text-wrap:balance`.

### 2.3 · Chạy trên Cloudflare Workers, không phải Node

Workers **không có đĩa**. Hàm không thể tự đọc `content/quote-nguon.md` lúc
chạy. Nên build đọc file đó một lần rồi ghi ra `functions/api/_nguon.js`, và
hàm `import` file ấy.

Nghĩa là: **sửa `content/quote-nguon.md` xong phải chạy `npm run build`.** Đẩy
lên GitHub thì Cloudflare tự chạy build nên cũng xong.

File `_nguon.js` **được commit**, không gitignore — thiếu nó là hàm không build
được.

### 2.4 · Một chỗ cố ý khác bản gốc

Bản gốc là "lời chào", mỗi lần tải là một câu mới. Ô này là "câu **của buổi
này**" nên trong một khung giờ phải một câu. Đổi mỗi lần bấm F5 thì nó không
còn là câu của buổi nữa, chỉ là một cái máy xổ số.

Bản đầu đóng theo **ngày**, một câu duy nhất từ 0h tới 24h. Đúng chữ "câu của
hôm nay" nhưng hỏng việc: người đọc quay lại buổi chiều gặp đúng câu ban sáng,
và ô trích dẫn thành một mảng trang trí chết. Khung giờ là chỗ ở giữa hai cái
dở ấy.

### 2.5 · Tắt phần "nghĩ" của model

`generationConfig` gửi kèm `thinkingConfig: { thinkingBudget: 0 }`.

Bản đầu để `maxOutputTokens: 220` và không khai gì về phần nghĩ. Đủ chỗ cho
câu, nhưng **không** đủ chỗ cho phần suy nghĩ của mấy model đời mới: token nghĩ
ăn hết hạn mức rồi `parts` trả về rỗng, và lỗi hiện ra là `câu không dùng được
(0 ký tự)` — nghe như Gemini viết câu dở, chứ không ai đoán ra là thiếu chỗ.

Nay tắt hẳn phần nghĩ, **và** nới trần lên 512 làm lưới đỡ phòng khi cái đứng
sau bí danh `-latest` lại không nhận `thinkingConfig`. Model nào không biết
khoá ấy thì trả 400 kèm chữ "thinking", và hàm tự gọi lại một lượt không kèm —
không đoán theo số hiệu model, vì Google hoán cái đứng sau bí danh lúc nào
không báo.

Lỗi "câu không dùng được" giờ kèm luôn `finishReason`: rỗng vì bị chặn nội dung
(`SAFETY`), vì hết token (`MAX_TOKENS`) hay vì lý do khác là ba chuyện sửa ở ba
chỗ khác hẳn nhau, mà nhìn "0 ký tự" thì không phân biệt nổi.

### 2.6 · Lưới đỡ model bung cả ở 400, không chỉ 404/403

Bản trước chỉ lùi sang model dự phòng khi gặp 404 hoặc 403. Đo trên trang đang
chạy thì model chính trả về:

```
400 INVALID_ARGUMENT — Request contains an invalid argument.
```

Lưới dựng ở 404/403 không bung, và ô trích dẫn chết lặng y như lúc chưa có lưới.

**Cách khoanh vùng — Google kiểm KHOÁ trước thân yêu cầu.** Khoá sai thì mọi
lượt gọi đều trả đúng một câu `API key not valid. Please pass a valid API key.`,
kể cả khi cố tình gửi thân rỗng hay tên model bịa (đã thử cả bốn ca). Nhận được
câu **khác** nghĩa là khoá hợp lệ, và chỗ Google chê nằm ở thân yêu cầu. Mà
thân ấy đúng chuẩn: một phần `text` 710 ký tự, `temperature`, `maxOutputTokens`
— không có gì để chê. Còn lại đúng một biến: chính cái bí danh model.

Nay lùi ở cả ba mã `400 · 403 · 404`. Cái giá là một lượt gọi thừa khi thân
yêu cầu hỏng thật — rẻ, vì đó là nhánh lỗi.

Hai chỗ nữa để lần sau đỡ mò:

- **Lời báo nêu tên cả hai model.** Chỉ kể lỗi của model sau thì người đọc log
  tưởng model chính vẫn ổn, rồi đi sửa nhầm chỗ.
- **`details[].fieldViolations[]` được đưa ra.** Với `INVALID_ARGUMENT`, trường
  `message` chỉ là một câu vô hồn — "Request contains an invalid argument." —
  không nói trường nào. Chỗ có thông tin thật là mảng `details`, nơi Google chỉ
  đích danh `field` và `description`. Bản trước bỏ qua hẳn mảng ấy.

:::note Muốn thử thẳng một model cụ thể mà không sửa mã
Khai `GEMINI_MODEL_QUOTE` (model chính) hoặc `GEMINI_MODEL` (model dự phòng)
dạng **Text** ở Cloudflare → Settings → Runtime → Variables and Secrets. Hai
biến trỏ cùng một tên thì hàm không lùi, chỉ gọi một lượt.
:::

---

## 3 · Nút "Another one"

Góc dưới phải ô trích dẫn.

**Chưa bật Gemini:** bấm thì đi **vòng tròn** qua kho, không bốc ngẫu nhiên —
bốc ngẫu nhiên thì bấm ba lần có khi trúng lại câu cũ, người bấm tưởng nút hỏng.

**Đã bật Gemini:** bấm là xin một câu **viết mới** (`?moi=1`, không cache), bốc
lại chủ đề và nhóm tác giả thật ngẫu nhiên. Đây mới là chỗ "random đổi mới"
đúng nghĩa.

Nhưng mạng có thể chậm, mà không ai đứng chờ một ô trích dẫn. Nên nó chạy song
song một cái hẹn **700ms**:

- Gemini về trước → hiện câu của Gemini
- hẹn tới trước → lật sang câu kế trong kho, và nếu Gemini về muộn thì chỉ
  **nhét thêm** vào kho chứ không giật lại màn hình

Chữ đang đọc dở mà tự đổi là thứ khó chịu hơn cả phải chờ.

Nhãn ô đổi thành `QUOTE OF THE DAY · thêm` để người đọc biết mình đang xem thêm
chứ không phải câu của ngày.

**Câu xin được có cất lại.** Bấm nút xong, câu ấy được ghi vào `localStorage`
đè lên câu của khung giờ đang chạy. Bản đầu không cất: bấm xin được câu ưng ý,
F5 một cái là mất, và lần tải sau còn gọi mạng thêm một lượt nữa cho đúng cái
khung vừa xin xong. Người bấm nút là người đang muốn câu **đó** — giữ lấy nó
mới phải.

---

## 4 · Tắt hẳn

Đặt `"quoteAI": { "bat": false }`, hoặc **xoá hẳn khối `quoteAI`** — cả hai đều
tắt lớp Gemini, ô trích dẫn quay về xoay vòng trong kho sẵn. Muốn ô biến mất
khỏi cả hai khung thì xoá hết câu trong `### Câu sẵn`.

:::warn Xoá khối `quoteAI` là cách lớp này đã chết lặng một lần
Khối ấy từng bị xoá khỏi `site.config.json` trong một lượt sửa cấu hình, và
**không có gì báo**. Build vẫn xanh. `_nguon.js` vẫn nướng ra đủ bốn mục. Hàm
`/api/quote` vẫn nằm đó, khoá Gemini vẫn khai đúng. Chỉ có thẻ `data-api` là
không được in ra nữa — nên trang không bao giờ gọi tới hàm, và Gemini chưa từng
viết được một câu nào.

Nhìn ngoài không thấy gì khác, vì ô trích dẫn vẫn có câu: kho sẵn vẫn chạy.
Đúng cái tính "hỏng thì im" đã giữ cho trang không bao giờ sập, cũng là cái
giấu luôn chuyện nó tắt.

`npm run kiem` nay có hai phép kiểm cho đúng khoảng cách ấy — giữa "đã chuẩn bị
đủ" và "có thật sự nối dây không":

- **cảnh báo** khi trang có ô trích dẫn mà `quoteAI` không bật
- **lỗi** khi bật rồi mà HTML dựng ra thiếu `data-api` hoặc `data-khung`
:::

---

## 5 · Xem lớp Gemini có sống không

Gọi thẳng hàm, không qua trang:

```
curl -s 'https://z-in-borderland.com/api/quote?ngay=2026-09-17&khung=0&sokhung=3&moi=1'
```

| Trả về | Nghĩa là |
|---|---|
| `{"ok":true,…}` | sống — hàm, khoá và model đều ổn |
| `{"ok":false,"ly_do":"chua-khai-khoa"}` | thiếu `GEMINI_KEY` ở Cloudflare (xem `docs/CAI-DAT.md` §2) |
| `{"ok":false,"ly_do":"thieu-loi-dan"}` | `### Lời dặn` đọc không ra — chạy `npm run kiem` |
| `{"ok":false,"ly_do":"gemini 400 · …"}` | lời báo thật của Google, đọc thẳng được |

Hàm **luôn trả 200**, kể cả lúc hỏng: người đọc không bao giờ được thấy lỗi cấu
hình. Nên chỗ để nhìn là `ly_do`, không phải mã HTTP.
