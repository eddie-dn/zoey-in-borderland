# KHUNG BÌNH LUẬN

Cách nó chạy, vì sao dựng như vậy, và chỗ nào dễ vấp.

Cài đặt từng bước nằm ở [CAI-DAT.md §1](CAI-DAT.md). File này nói phần **vì
sao** — mở ra khi cần sửa, không phải khi cần cài.

---

## Cách nó chạy

```
người đọc gõ  ──POST──→  /api/binh-luan  ──→  D1  (duyet = 0, chờ)
                                                    │
chủ trang mở  ──GET ?cho=1─→ hàng chờ  ──PATCH──→  (duyet = 1)
  #duyet                                            │
                                                    ↓
người đọc xem ──GET ?url=─→  chỉ những dòng đã duyệt
```

Ba mẩu:

| Mẩu | Ở đâu | Lo việc gì |
|---|---|---|
| Hàm | `functions/api/binh-luan.js` | nhận · lọc spam · đọc · duyệt · ẩn |
| Bảng | D1, tên `binh_luan` | chỗ chứa. Tự tạo ở lượt gửi đầu tiên |
| Giao diện | `src/js/comments.js` | dựng cây, form, bàn duyệt |

Khung HTML rỗng do `tools/build.mjs` in ra lúc dựng; phần chữ trong đó do JS đổ
vào lúc chạy. Cả hai lấy chữ từ **cùng một bảng `NHAN`** trong build.mjs — rải
chữ sang file `.js` thì sửa một nhãn phải nhớ có hai chỗ.

---

## Vì sao KHÔNG còn Google Apps Script

Bản trước để Apps Script lo hết: nhận bình luận, ghi vào Google Sheet, và trả
bình luận về cho trang.

Cái sai không nằm ở Apps Script. Nó nằm ở chỗ Apps Script **đứng trên đường
đọc**: mỗi người mở một bài đều phải đợi một lượt gọi sang Google — khởi động
nguội 1–3 giây, và không cache được ở biên. Đổi lại được đúng một thứ: chủ
trang duyệt bài bằng cách tick một ô trong bảng tính.

Một người ghé blog đọc bài không nên trả giá cho sự tiện tay của chủ nhà. Nay
D1 lo phần chạy trang — cùng nhà với hosting, cache 30 giây ở biên — còn việc
duyệt chuyển hẳn lên chính trang web.

Mất gì: bảng tính không còn là bản sao lưu nằm ngoài Cloudflare. Muốn sao lưu
thì mở Console của D1 chạy `SELECT * FROM binh_luan` rồi tải về.

---

## Bàn duyệt — `#duyet`

Thêm `#duyet` vào địa chỉ **bất kỳ bài nào**. Lần đầu nó hỏi mã chủ và khoá;
nhập xong trình duyệt nhớ trên máy đó.

**Cửa sau là một địa chỉ, không phải một cái nút.** Một cái nút "Duyệt bình
luận" bày giữa trang thì mọi người đọc đều thấy một thứ họ bấm vào cũng chẳng
để làm gì. Và đây **không phải lớp bảo mật** — lớp bảo mật là hai vế khoá ở
phía máy chủ; ai gõ đúng `#duyet` cũng chỉ thấy một cái ô xin khoá.

**Hàng chờ là của cả blog, không riêng bài đang mở.** Mỗi dòng ghi rõ nó thuộc
bài nào. Duyệt từ điện thoại mà phải mở từng bài xem bài nào có gì đang chờ thì
không ai duyệt nữa.

Dòng **đã duyệt** vẫn ở lại danh sách nhưng mờ đi — để còn bỏ duyệt lại được
nếu lỡ tay, mà không tranh chỗ với những dòng đang chờ.

Khoá dùng **chung với ô viết ghi chú** ở `/notes/#viet`: cùng hai biến trong
localStorage, cùng hai biến bí mật ở phía máy chủ. Nhập ở một chỗ là mở được cả
hai. Đặt hai cặp riêng chỉ là thêm một thứ để quên.

---

## Những chỗ đã cân nhắc

### Chỉ hai tầng, y như Facebook

Trả lời của trả lời cũng gắn vào bình luận **gốc** của nhánh đó. Cho lồng vô
hạn thì trên màn hình 390px, tới tầng thứ tư là cột chữ còn 120px — mỗi dòng ba
chữ.

Máy chủ trả về danh sách **phẳng**, mỗi dòng mang `cha` là mã của bình luận nó
trả lời. Trình duyệt tự dựng cây và tự leo ngược lên gốc nhánh.

### Gấp bớt trả lời

Một nhánh quá hai trả lời thì mấy cái cũ gấp lại sau một dòng "còn N trả lời".
Một bình luận có 15 trả lời mà bung hết thì đẩy mọi bình luận khác xuống tận
đáy trang. Bung ra thì chèn **ngược lên đầu**, để thứ tự thời gian vẫn đúng.

### Một cái form, đem đi chỗ khác

Bấm "Reply" không dựng thêm form mới mà **di chuyển** chính cái form đang có
xuống dưới bình luận được trả lời, kèm một dòng "Đang trả lời…".

Dựng mỗi bình luận một form thì mười bình luận là mười cái form, mười bộ ô nhập
trùng tên, và người dùng bàn phím phải Tab qua tất cả.

### Chèn bằng `textContent`, không bao giờ `innerHTML`

Nội dung ở đây do người lạ trên mạng gõ vào. `innerHTML` thì một dòng
`<script>` trong ô bình luận chạy được trên trang của mình.

Luật này áp cho **cả bàn duyệt** — chỗ dễ quên nhất, vì ở đó "chỉ mình đọc".
Chính chỗ chỉ-mình-đọc mới là chỗ kẻ gửi spam nhắm tới.

### Bình luận tải hỏng không làm hỏng việc đọc bài

Mọi lỗi ở `comments.js` đều nuốt vào một câu báo nhỏ. Bài vẫn nguyên vẹn, form
vẫn gửi được. Một tính năng phụ không được phép làm trang trông như hỏng.

---

## Chống spam

Bốn lớp, từ ngoài vào:

1. **Ô bẫy (`hp`)** — ẩn khỏi mắt người bằng CSS, nhưng bot đọc HTML thì thấy
   và điền vào.
2. **Mốc 3 giây** — mở form chưa tới 3 giây đã gửi xong thì không phải người gõ.
3. **Giới hạn độ dài** — tên 60, email 120, nội dung 2…2000 ký tự. Ký tự điều
   khiển vô hình bị lọc trước khi cắt.
4. **Duyệt tay.** Đây mới là lớp thật. Ba lớp trên chỉ để bảng đỡ rác.

Dính bẫy 1 hoặc 2 thì máy chủ trả về **thành công**. Nói thẳng "mày là bot" là
chỉ cho người viết bot biết cần sửa gì.

---

## Email

Cột `email` có trong bảng nhưng **không câu lệnh `SELECT` nào ở hàm đọc tới
nó** — kể cả lượt gọi của chủ trang. Không có đường nào moi nó qua mạng.

Nó ở đó để bạn mở Console của D1 ra tra khi cần trả lời riêng ai đó. Ô email
trên form ghi rõ *"optional · never shown"*, và đó là lời hứa được giữ ở tầng
câu lệnh, không phải ở tầng giao diện.

---

## Lời của chủ trang

Gửi bình luận lúc máy có khoá thì nó **vào thẳng**, mang huy hiệu `AUTHOR`,
không phải chờ duyệt. Chủ nhà không phải tự duyệt lời của chính mình.

Huy hiệu ấy là thứ người đọc cần để phân biệt ngay đâu là trả lời của chủ nhà,
đâu là của một người ghé ngang trùng tên — và nó chỉ gắn được từ phía máy chủ,
sau khi khoá đã khớp. Gõ tên "Zoey" vào ô tên thì không có huy hiệu.

---

## Khi có chuyện

| Hiện tượng | Nhiều khả năng là |
|---|---|
| Khung hiện nhưng không có bình luận nào | Chưa gắn D1, hoặc chưa ai được duyệt |
| Gửi xong báo lỗi mạng | Hàm chưa lên (thử mở `tên-miền/api/binh-luan?url=/`) |
| `#duyet` báo sai khoá | `GC_ID`/`GC_KEY` chưa đặt, hoặc đặt thiếu một môi trường (nhớ cả Production lẫn Preview) |
| Duyệt rồi mà người khác chưa thấy | Cache biên 30 giây. Đợi một chút |
| Bình luận của mình cũng phải chờ duyệt | Máy đó chưa nhớ khoá — mở `#duyet` nhập một lần |

`npm run kiem` có một phép kiểm canh bộ ba: hàm, địa chỉ trong cấu hình, và
script trên trang bài. Thiếu mẩu nào là báo đỏ — vì thiếu mẩu nào thì khung vẫn
hiện nguyên, chỉ là gửi không đi đâu cả.

---

## Tắt hẳn

```json
"binhLuan": { "bat": false }
```

Khung biến mất khỏi mọi bài. Bình luận cũ vẫn nằm trong D1, bật lại là có lại.
