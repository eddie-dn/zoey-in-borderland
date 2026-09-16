# Ô TRÍCH DẪN MỖI NGÀY

> Hai lớp chồng nhau. Lớp dưới **luôn chạy**, không cần mạng, không cần khoá.
> Lớp trên là tuỳ chọn, bật lên thì mỗi ngày có thêm một câu do Gemini viết mới.

---

## 1 · Một file tả NGUỒN, không phải một file chứa câu

Mọi thứ của ô này nằm ở **`content/quote-nguon.md`**. File đó có bốn mục, và
hai bên đọc hai phần khác nhau:

| Mục | Ai đọc | Lúc nào | Để làm gì |
|---|---|---|---|
| `### Chủ đề` | hàm `/api/quote` | mỗi ngày | bốc ngẫu nhiên MỘT chủ đề |
| `### Nguồn` | hàm `/api/quote` | mỗi ngày | bốc ngẫu nhiên ~12 tác giả |
| `### Lời dặn` | hàm `/api/quote` | mỗi ngày | khuôn câu hỏi gửi Gemini |
| `### Câu sẵn` | `npm run build` | lúc dựng trang | kho nhúng thẳng vào HTML |

Sửa cái gì cũng chỉ mở đúng file đó, gõ như gõ văn bản thường.

### 1.1 · Vì sao bốc ngẫu nhiên nguồn, không gửi cả danh sách

Bản gốc bên dongchibinh-33 nhét cả bốn chủ đề và 46 cái tên vào một lời dặn.
Kết quả đo được: Gemini bám vào mấy cái tên quen nhất — Jung, Seneca, Lão Tử —
và gần như lúc nào cũng rơi vào chủ đề đứng đầu danh sách. Danh sách dài ra
cũng không làm câu đa dạng hơn.

Ở đây mỗi ngày bốc **một** chủ đề và **mười hai** tác giả rồi mới hỏi. Đo trên
20 ngày liên tiếp: cả 8 chủ đề đều được dùng tới, cả 38 tác giả đều được nhắc
tên ít nhất một lần.

Số 12 là chỗ vừa: ít quá thì mấy hôm liền trùng người, nhiều quá thì lại quay
về đúng cái bệnh cũ — Gemini bám vào cái tên quen nhất trong nhóm.

### 1.2 · Cùng một ngày thì luôn ra cùng một chủ đề

Hạt giống của bộ bốc là **chuỗi ngày**, không phải `Math.random()`. Nên gọi
`/api/quote?ngay=2026-09-15` bao nhiêu lần cũng ra cùng chủ đề và cùng nhóm
tác giả. Bắt buộc phải vậy: Cloudflare cache câu trả lời tới nửa đêm, mà cache
chỉ khớp khi cùng đầu vào cho cùng đầu ra.

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

1. **Mỗi ngày gọi đúng một lần.** Cloudflare cache tới nửa đêm; trình duyệt còn
   cất thêm một bản trong `localStorage` theo ngày. Tải lại trang không gọi
   mạng lần nữa.
2. **Hỏng thì im.** Không mạng, chưa deploy, chưa khai khoá, Gemini chậm — câu
   từ kho sẵn vẫn đang nằm đó, người đọc không thấy gì khác thường.
3. **Bỏ cuộc sau 3 giây.** Lâu hơn thì thà giữ câu sẵn: không ai đứng chờ một ô
   trích dẫn.

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

Bản gốc là "lời chào", mỗi lần tải là một câu mới. Ô này là "câu **của hôm
nay**" nên cả ngày phải một câu. Đổi mỗi lần bấm F5 thì nó không còn là câu của
ngày nữa, chỉ là một cái máy xổ số.

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

---

## 4 · Tắt hẳn

Xoá hết câu trong `content/quote-nguon.md` và đặt `"quoteAI": { "bat": false }` — ô
trích dẫn biến mất khỏi cả hai khung.
