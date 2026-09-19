# THƯ BÁO

> Mỗi ngày một lượt, nếu có bình luận mới đang chờ duyệt thì trang gửi cho chủ
> trang **một** lá thư gom tất cả. Không có gì mới thì không gửi gì.
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

## 3. Thử ngay, không đợi tới mai

Cron chạy mỗi ngày một lượt, nên sửa một dòng chữ trong thư mà phải chờ 24 giờ
mới biết đúng sai thì không ai sửa nữa. Có một cửa gọi tay:

**Thử đường gửi** — gửi một lá thư thử kể cả khi hàng chờ rỗng:

```bash
curl -X POST "https://z-in-borderland.com/api/thu-bao?ep=1" \
  -H "x-gc-id: zoey" \
  -H "x-gc-key: KHOÁ-BÍ-MẬT-CỦA-BẠN"
```

**Chạy đúng thân hàm mà lịch chạy** — dựng thư từ hàng chờ thật:

```bash
curl -X POST "https://z-in-borderland.com/api/thu-bao" \
  -H "x-gc-id: zoey" \
  -H "x-gc-key: KHOÁ-BÍ-MẬT-CỦA-BẠN"
```

Trả về JSON, đọc được ngay:

| Trả về | Nghĩa |
|---|---|
| `{"ok":true,"id":"...","moi":3,"hangCho":5}` | Đã gửi, 3 dòng mới trên tổng 5 |
| `{"ok":true,"boQua":"khong-co-gi-moi"}` | Chạy đúng, nhưng không có gì để báo |
| `{"ok":true,"boQua":"hang-cho-rong"}` | Không còn dòng nào chưa duyệt |
| `{"ok":true,"boQua":"chua-co-bang"}` | Chưa ai bình luận bao giờ |
| `{"ok":false,"loi":"thieu-RESEND_KEY"}` | Chưa đặt Secret, hoặc đặt nhầm Type |
| `{"ok":false,"loi":"resend 403", ...}` | Khoá sai, hết hạn mức, hoặc domain chưa xác minh |

---

## 4. Đổi giờ gửi

Sửa `wrangler.jsonc`:

```jsonc
"triggers": { "crons": ["0 13 * * *"] }
```

**Giờ là UTC, không phải giờ Việt Nam.** Lấy giờ Hà Nội trừ đi 7:

| Muốn nhận lúc | Viết |
|---|---|
| 08:00 sáng | `0 1 * * *` |
| 12:00 trưa | `0 5 * * *` |
| 20:00 tối *(đang dùng)* | `0 13 * * *` |
| 22:00 tối | `0 15 * * *` |

Quên đổi múi giờ thì thư tới lúc rạng sáng, và không có gì báo cho biết mình
đã quên.

---

## 5. Khi không thấy thư

Theo thứ tự, dừng ở chỗ đầu tiên sai:

1. **Có gì để báo không?** Không có bình luận mới trong 25 giờ thì im lặng là
   ĐÚNG. Gọi tay bằng `?ep=1` để tách bạch "không có tin" với "hỏng".
2. **Lịch đã gắn chưa?** Worker → Settings → **Trigger Events** phải có dòng
   cron. Trống nghĩa là lượt deploy chưa mang khối `triggers` lên.
3. **Secret còn không?** Settings → Variables and Secrets. Thấy `RESEND_KEY`
   và `THU_DEN` với Type = `Secret`. Mất, hoặc Type = `Text`, thì xem §2.2.
4. **Worker có chạy không?** Worker → **Logs**. Mỗi lượt cron in một dòng
   `[thu-bao] {...}`, kể cả lượt bỏ qua — cố ý, vì "không có tin" và "không
   chạy" nhìn từ hộp thư thì giống hệt nhau.
5. **Resend có nhận không?** Resend → **Emails**. Mỗi lá đi qua đều hiện ở đó
   kèm `Delivered` / `Bounced`. Có `Delivered` mà hộp thư không thấy thì thư
   đang nằm trong nhãn do bộ lọc Gmail archive — tìm ở đó trước khi nghi hỏng.
6. **Chạy dưới dạng Pages?** Cron **không chạy ở Pages**. Trang phải ở dạng
   Worker. Không có lỗi nào cả — với Pages thì cái lịch ấy chưa từng tồn tại.

---

## 6. Thêm một thư báo khác

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
