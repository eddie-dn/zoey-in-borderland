# Ô TRÍCH DẪN MỖI NGÀY

> Hai lớp chồng nhau. Lớp dưới **luôn chạy**, không cần mạng, không cần khoá.
> Lớp trên là tuỳ chọn, bật lên thì mỗi ngày có thêm một câu do Gemini viết mới.

---

## 1 · Lớp nền — kho câu tự viết

Sửa `content/quotes.md`. Mỗi gạch đầu dòng một câu:

```markdown
- Ai nhìn ra ngoài thì mơ. Ai nhìn vào trong thì tỉnh. — Carl Jung
- Đi chậm lại không làm mất thời gian, nó làm mình thấy thời gian. —
```

Dấu `—` cuối câu tách phần tên người nói. Không có tên thì để trống sau dấu đó,
hoặc bỏ hẳn dấu — câu vẫn hiện bình thường.

Build nhúng cả kho vào trang. Không gọi mạng, không cần máy chủ.

### Cách chọn câu: CHIA BÀI, không phải chia dư

Bản đầu băm chuỗi ngày rồi lấy dư theo số câu. Đo ra hỏng: 7 ngày liên tiếp cho
`[1, 2, 3, 4, 1, 2, 10]` — vừa đi gần như tuần tự, vừa **trùng câu hai lần trong
một tuần**. Lý do: hai ngày liền nhau chỉ khác một ký tự, và phần bit thấp của
hàm băm không xáo đủ mạnh để giấu điều đó sau phép chia dư.

Cách đang dùng: coi kho câu như một **cỗ bài**. Mỗi vòng N ngày xáo lại một lần,
rồi mỗi ngày rút một lá theo thứ tự.

| | Kết quả đo |
|---|---|
| Mỗi câu trong mỗi vòng N ngày | đúng **một lần**, không bao giờ trùng |
| Khoảng cách gần nhất giữa hai lần trùng | **2 ngày** |
| Phân bố qua 400 ngày | lệch nhiều nhất **2 lượt** giữa câu nhiều nhất và ít nhất |
| Cùng một ngày, hai máy khác nhau | **cùng một câu** |

Đã kiểm với kho 5 · 8 · 12 · 20 · 40 câu, tất cả đều đạt.

:::note Chỗ nối giữa hai vòng
Cái bẫy kinh điển của kiểu xáo bài: lá **cuối** vòng này và lá **đầu** vòng sau
được xáo độc lập nên có thể trùng nhau — người đọc thấy một câu hai ngày liền,
tức là thấy đúng cái mà cả cơ chế sinh ra để tránh. Code kiểm việc đó và đổi chỗ
lá đầu với lá thứ hai nếu trùng.
:::

Ngày tính theo **giờ máy người đọc**: người ở Hà Nội sang ngày mới lúc 0h Hà Nội,
không phải 7h sáng như nếu tính theo UTC.

---

## 2 · Lớp Gemini — tuỳ chọn

Mặc định **tắt**. Bật lên thì mỗi ngày trang xin thêm một câu viết mới qua
`/api/quote`, đè lên câu lấy từ kho.

Cách làm học từ `api/quote.js` bên **dongchiBinh-33** (nhánh
`feature/v2-birthday-surprise`), giữ nguyên mấy nguyên tắc của bản đó.

### 2.1 · Bật

```json
"quoteAI": { "bat": true, "api": "/api/quote" }
```

Rồi trên Vercel: **Settings → Environment Variables** thêm `GEMINI_KEY`, và
**Redeploy** — biến môi trường chỉ ăn từ lần deploy sau.

Lấy khoá ở [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

| Biến | Bắt buộc | Mặc định |
|---|---|---|
| `GEMINI_KEY` | có | — |
| `GEMINI_MODEL_QUOTE` | không | `gemini-flash-lite-latest` |
| `GEMINI_MODEL` | không | `gemini-2.0-flash` (chỉ dùng khi model trên lỗi) |

### 2.2 · Bốn nguyên tắc của lớp này

**Khoá không bao giờ xuống trình duyệt.** Nó nằm ở biến môi trường trên Vercel;
`api/quote.js` chạy phía máy chủ, trang chỉ nhận về một câu chữ.

**Hỏng kiểu gì cũng không ai thấy.** Chưa deploy, chưa khai khoá, mất mạng,
Gemini chậm hay trả câu không dùng được — câu từ kho sẵn vẫn đang nằm đó, người
đọc không thấy gì khác thường. Không có thông báo lỗi nào hiện ra.

**Mỗi ngày gọi đúng một lần.** Câu được cất vào `localStorage` theo ngày; tải
lại trang là lấy từ đó. Vercel cũng cache câu trả lời tới hết ngày, nên nhiều
người đọc cùng ngày chỉ tốn một lượt gọi Gemini.

**Bỏ cuộc sau 3 giây.** Máy chủ tự ngắt ở 2,6 giây, trang ngắt ở 3 giây. Không
ai chờ một ô trích dẫn.

### 2.3 · Đổi giọng câu

Lời dặn gửi cho Gemini nằm trong biến `NHAC` ở đầu `api/quote.js`. Sửa ở đó.

---

## 3 · Nút đổi câu

Góc dưới phải ô trích dẫn. Bấm thì đi **vòng tròn** qua kho, không bốc ngẫu
nhiên — bốc ngẫu nhiên thì bấm ba lần có khi trúng lại câu cũ, người bấm tưởng
nút hỏng. Nhãn ô đổi thành `QUOTE OF THE DAY · thêm` để người đọc biết mình
đang xem thêm chứ không phải câu của ngày.

---

## 4 · Tắt hẳn

Xoá hết câu trong `content/quotes.md` và đặt `"quoteAI": { "bat": false }` — ô
trích dẫn biến mất khỏi cả hai khung.
