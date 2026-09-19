# THƯ BÁO

> Ba việc chạy khi không có ai ngồi đó, và nói ra khi có chuyện.
>
> | Việc | Lịch | Gửi thư khi |
> |---|---|---|
> | **Bình luận chờ duyệt** | mỗi ngày 20:00 | có bình luận mới trong 25 giờ |
> | **Tự kiểm** | mỗi ngày 20:00 | trạng thái hệ thống ĐỔI so với lần trước |
> | **Sao lưu** *(xem `docs/SAO-LUU.md`)* | Chủ nhật 21:00 | chỉ khi HỎNG |
>
> Cả ba đều **im lặng khi không có tin** — đó là thiết kế, không phải trục trặc.
>
> Mã: `functions/api/thu-bao.js` · lịch: khối `triggers` trong `wrangler.jsonc`
> · cửa gọi tay: `POST /api/thu-bao`

---

## 1. Nó làm gì

Bình luận vào D1 với `duyet = 0` và nằm im tới khi chủ trang mở `#duyet` ra
bấm. Trước đây không có gì nhắc — người đọc gõ một câu hỏi rồi đợi một người
chưa biết mình có gì để đọc.

Mỗi ngày **20:00 giờ Việt Nam**, trang đếm hàng chờ:

- Có ít nhất một dòng gửi trong **25 giờ** gần nhất → gửi thư.
- Không có gì mới → **im lặng**, kể cả khi hàng chờ vẫn còn dòng cũ.

Lá thư in **toàn bộ** hàng chờ, đánh dấu `●` cho phần mới và `○` cho phần đã
đợi từ trước, mỗi dòng kèm một đường bấm thẳng sang bàn duyệt của bài đó.

**Vì sao im khi không có gì mới.** Một lá thư nói đúng một chuyện mỗi ngày là
thứ người ta học cách không đọc — rồi lá thư có tin thật cũng chịu chung số
phận. Cái chuông chỉ đáng tin khi nó chỉ kêu lúc có chuyện.

**Thư không bao giờ chở email người bình luận.** `functions/api/binh-luan.js`
có lời hứa ấy ở đầu file và file này giữ nguyên: câu `SELECT` không chạm cột
`email`. Thư đi qua Resend → log của Resend → Gmail → mọi bản sao lưu của
Gmail; một địa chỉ người ta đưa cho *mình* không có lý do gì đi qua bấy nhiêu
chặng. Cần liên hệ lại thì mở Console của D1 mà tra.

---

## 2. Cài (một lần)

### 2.1 · Lấy khoá Resend

Resend → **API Keys** → `Create API Key`:

| Ô | Chọn |
|---|---|
| Name | `worker-thu-bao` |
| Permission | **Sending access** — đừng chọn Full access |
| Domain | `z-in-borderland.com` |

Chuỗi `re_...` **chỉ hiện một lần**. Copy ngay.

> Dùng khoá RIÊNG, đừng dùng chung với khoá đã cắm vào Gmail. Lộ một cái thì
> thu hồi đúng cái đó, không phải dựng lại cả hai.

### 2.2 · Đặt hai Secret ở Cloudflare

Dashboard → Worker `zoey-in-borderland` → **Settings** → **Runtime** →
**Variables and Secrets** → `+ Add`:

| Name | Type | Value |
|---|---|---|
| `RESEND_KEY` | **Secret** | chuỗi `re_...` vừa copy |
| `THU_DEN` | **Secret** | địa chỉ nhận, ví dụ `honghandn+blog@gmail.com` |

**Type phải là `Secret`, không phải `Text`.** Chọn `Text` thì mỗi lượt deploy
Wrangler xoá nó đi — vì file `wrangler.jsonc` là nguồn đúng duy nhất cho biến
dạng Text, và hai tên này không có trong đó. Triệu chứng y hệt lúc chưa từng
đặt: thư im, không lỗi. Xem chú thích dài trong `wrangler.jsonc`.

`THU_DEN` để Secret chứ không để Var vì **kho mã này công khai** — hộp thư
riêng của chủ trang không phải thứ để trong repo.

Hai biến còn lại (`THU_TU`, `TRANG_GOC`) đã khai sẵn trong `wrangler.jsonc`,
không phải làm gì.

### 2.3 · Đẩy mã lên

```bash
git push
```

Cloudflare dựng lại. Lịch chạy chỉ có hiệu lực **sau** lượt deploy đầu tiên có
khối `triggers` — kiểm bằng Worker → **Settings** → **Trigger Events**, phải
thấy dòng `0 13 * * *`.

---

## 3. Tự kiểm — cái chuông cho những thứ hỏng lặng lẽ

Trang này có nhiều đường hỏng **không kêu**, và đó là cố ý: mỗi hàm đều chọn
"trang vẫn chạy, chỉ thiếu một mục" thay vì nổ 500 vào mặt người đọc.

| Hỏng | Người đọc thấy | Chủ trang thấy |
|---|---|---|
| `GEMINI_KEY` mất | ô trích dẫn vẫn có câu | không gì cả |
| `GH_TOKEN` hết hạn | không gì cả | bấm Đăng, bài không lên, không báo lỗi |
| `DB` rớt binding | lượt xem về 0 | không gì cả |
| `GC_KEY` chưa đặt | không gì cả | gõ khoá vào không vào được |

Lựa chọn ấy đúng với người đọc, nhưng đẩy cái giá sang chủ trang: một thứ hỏng
có thể nằm im hàng tuần. Tự kiểm soi đúng năm chỗ ấy mỗi ngày.

**Chỉ gửi khi trạng thái ĐỔI.** Hỏng → báo một lần. Sửa xong → báo `✓ Đã ổn
lại` một lần nữa. Vế thứ hai quan trọng ngang vế đầu: không có nó thì sau khi
sửa, chẳng gì xác nhận là mình đã sửa đúng. Mốc trạng thái lưu trong bảng
`he_thong` của D1, tự tạo.

Gửi mỗi ngày một lá y hệt cho tới khi sửa xong là cách nhanh nhất biến cảnh
báo thành thứ bị bỏ qua — nên không làm vậy.

`GH_TOKEN` và `GEMINI_KEY` chỉ soi **khi đã được đặt**: không dùng ô đăng bài
thì thiếu token là bình thường, mà báo lỗi cho thứ cố ý không bật là dạy người
ta bỏ qua thư của mình.

---

## 4. Thử ngay, không đợi tới mai

Cron chạy mỗi ngày một lượt, nên sửa một dòng chữ trong thư mà phải chờ 24 giờ
mới biết đúng sai thì không ai sửa nữa. Cửa gọi tay chạy **đúng thân hàm mà
lịch chạy**:

```bash
K='-H "x-gc-id: zoey" -H "x-gc-key: KHOÁ-BÍ-MẬT-CỦA-BẠN"'
U=https://z-in-borderland.com/api/thu-bao

curl -X POST "$U?ep=1"          # thư THỬ — gửi kể cả khi chẳng có tin gì
curl -X POST "$U"               # bình luận chờ duyệt
curl -X POST "$U?viec=kiem"     # tự kiểm
curl -X POST "$U?viec=saoluu"   # sao lưu sang Google Sheet
```

*(thêm hai header khoá vào mỗi lệnh)*

Dùng `?ep=1` trước tiên: lúc vừa dựng xong thì hàng chờ thường rỗng và mọi thứ
đều đang chạy tốt, nên cả ba việc đều im lặng — đúng như thiết kế. Mà một cái
chuông chưa bao giờ nghe kêu thì chưa biết nó có kêu không.

`?viec=kiem` **không** bỏ qua mốc trạng thái: gọi lần đầu thì gửi thư, gọi lại
ngay thì trả `boQua:"khong-doi"`. Cố ý — thử phải thử đúng cái sẽ chạy thật,
kể cả phần nín.

### Đọc kết quả

| Trả về | Nghĩa |
|---|---|
| `{"ok":true,"id":"…","moi":3,"hangCho":5}` | Đã gửi, 3 dòng mới trên tổng 5 |
| `{"ok":true,"boQua":"khong-co-gi-moi"}` | Chạy đúng, không có gì để báo |
| `{"ok":true,"boQua":"hang-cho-rong"}` | Không còn dòng nào chưa duyệt |
| `{"ok":true,"boQua":"chua-co-bang"}` | Chưa ai bình luận bao giờ |
| `{"ok":true,"boQua":"khong-doi","hong":0}` | Tự kiểm: giống hệt lần trước |
| `{"ok":true,"doi":true,"hong":2}` | Tự kiểm: 2 thứ hỏng, đã gửi thư |
| `{"ok":false,"loi":"thieu-RESEND_KEY"}` | Chưa đặt Secret, hoặc đặt nhầm Type |
| `{"ok":false,"loi":"resend 403",…}` | Khoá sai, hết hạn mức, hoặc domain chưa xác minh |

Lỗi của phần sao lưu ở `docs/SAO-LUU.md` §5.

---

## 5. Đổi giờ gửi

Sửa `wrangler.jsonc`:

```jsonc
"triggers": { "crons": ["0 13 * * *", "0 14 * * SUN"] }
```

**Giờ là UTC, không phải giờ Việt Nam.** Lấy giờ Hà Nội trừ đi 7:

| Muốn nhận lúc | Viết |
|---|---|
| 08:00 sáng | `0 1 * * *` |
| 12:00 trưa | `0 5 * * *` |
| 20:00 tối *(đang dùng)* | `0 13 * * *` |
| 22:00 tối | `0 15 * * *` |
| Chủ nhật 21:00 *(sao lưu)* | `0 14 * * SUN` |

Quên đổi múi giờ thì thư tới lúc rạng sáng, và không có gì báo cho biết mình
đã quên.

> ### ⚠ Thứ trong tuần: viết chữ, đừng viết số
>
> Cloudflare đánh số thứ **1–7 với `1` = Chủ nhật**, và **không nhận `0`**.
> Cron Unix thì ngược lại: `0`–`6` với `0` = Chủ nhật.
>
> Hậu quả khi viết nhầm rất khó chịu: `0 14 * * 0` làm lượt deploy **hỏng ở
> bước cuối** với `invalid cron string [code: 10100]` — mà hỏng *sau khi* mã
> đã lên. Worker chạy bản mới, trang nhìn bình thường, chỉ thiếu hẳn một lịch.
> Còn `1` thì được nhận nhưng nghĩa là Chủ nhật chứ không phải thứ Hai như mọi
> nơi khác.
>
> Ghi `SUN`, `MON`, `MON-FRI` thì không có cách nào hiểu nhầm.

> **Sửa ở đây thì phải sửa cả `worker.js`.** Hàm `scheduled` phân việc bằng
> `switch (cron)` so **khớp từng chữ** với mấy chuỗi này. Đổi một bên mà quên
> bên kia thì lượt chạy rơi xuống nhánh `default`: nó vẫn chạy việc hằng ngày
> nên nhìn từ hộp thư thì y như bình thường, chỉ có sao lưu lặng lẽ thôi chạy.
> Nhánh `default` in một dòng `[lich] cron lạ` vào log để còn tìm ra.

---

## 6. Khi không thấy thư

Theo thứ tự, dừng ở chỗ đầu tiên sai:

1. **Có gì để báo không?** Không có bình luận mới trong 25 giờ, hoặc trạng thái
   tự kiểm giống hệt hôm qua, thì im lặng là ĐÚNG. Gọi tay bằng `?ep=1` để
   tách bạch "không có tin" với "hỏng".
2. **Lịch đã gắn chưa?** Worker → Settings → **Trigger Events** phải có **cả
   hai** dòng cron. Trống nghĩa là lượt deploy chưa mang khối `triggers` lên;
   thiếu một dòng nghĩa là `wrangler.jsonc` chưa lên tới nơi.
3. **Secret còn không?** Settings → Variables and Secrets. Thấy `RESEND_KEY`
   và `THU_DEN` với Type = `Secret`. Mất, hoặc Type = `Text`, thì xem §2.2.
4. **Worker có chạy không?** Worker → **Logs**. Mỗi việc in một dòng
   (`[thu-bao]`, `[tu-kiem]`, `[sao-luu]`), **kể cả lượt bỏ qua** — cố ý, vì
   "không có tin" và "không chạy" nhìn từ hộp thư thì giống hệt nhau. Thấy
   `[lich] cron lạ` nghĩa là `wrangler.jsonc` và `worker.js` đã lệch nhau
   (xem §5).
5. **Resend có nhận không?** Resend → **Emails**. Mỗi lá đi qua đều hiện ở đó
   kèm `Delivered` / `Bounced`. Có `Delivered` mà hộp thư không thấy thì thư
   đang nằm trong nhãn do bộ lọc Gmail archive — tìm ở đó trước khi nghi hỏng.
6. **Chạy dưới dạng Pages?** Cron **không chạy ở Pages**. Trang phải ở dạng
   Worker. Không có lỗi nào cả — với Pages thì cái lịch ấy chưa từng tồn tại.

---

## 7. Thêm một thư báo khác

`guiThu(env, { tieuDe, chuThuong, chuHTML })` trong `functions/api/thu-bao.js`
dùng lại được cho mọi loại thư. Thêm một việc vào lịch:

1. Viết hàm mới, gọi `guiThu` ở cuối.
2. Gọi nó trong `scheduled` của `worker.js`, **trong try/catch riêng** — một
   việc hỏng không được phép làm im việc khác.
3. Cần giờ chạy khác thì thêm một dòng vào `crons` và rẽ nhánh theo
   `controller.cron`.

Luôn giữ hai thân thư (`text` **và** `html`). Thư chỉ có HTML bị chấm điểm
spam cao hơn hẳn, và bản chữ thường là thứ hiện trong dòng xem trước trên điện
thoại — chỗ thư thật sự được đọc.
