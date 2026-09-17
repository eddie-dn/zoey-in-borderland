# VIỆC ĐANG CHỜ

> Sổ hàng đợi. Mỗi mục là MỘT việc đã được yêu cầu nhưng chưa xong — ghi đủ để
> người khác (hoặc chính mình tuần sau) làm được mà không cần đọc lại hội thoại.
> Làm xong thì **xoá khỏi đây** và ghi một dòng vào `docs/LICH-SU.md`.
>
> Thứ tự trong file là thứ tự làm. Việc mới thêm vào CUỐI nhóm của nó, không
> chen lên đầu — chen lên đầu thì mục nào cũng khẩn cấp và thứ tự thành vô nghĩa.
>
> **File này KHÔNG chép lại việc đã xong.** Đó là việc của `docs/LICH-SU.md`.
> Bản trước giữ một bảng "đã xong trong lượt này" dài mười một dòng, chép lại
> đúng thứ sổ phiên bản đã có — và nó lạc hậu trước: bảng ấy còn ghi số hai
> tầng (`V11.04`) sau khi cả kho đã đánh lại thành ba tầng.

---

## B · Bàn duyệt bình luận

### B1. Bấm ALL thì khung vỡ
Chọn bộ lọc **All** rồi tick vài dòng: nút xiên vẹo, và cột thao tác của
thanh gộp (`APPROVE · UNAPPROVE · HIDE · CLEAR`) KHÔNG thẳng cột với cột thao
tác của từng dòng bên dưới. Kiểm lại cả UI khu này.

---

## C · Bình luận

### C0. Reply chỉ đi được một tầng
Nút Reply chỉ hiện ở bình luận GỐC (`if (!laCon)` trong comments.js), nên trả
lời của một trả lời thì không bấm được vào đâu. Cây vẫn hai tầng như cũ — trả
lời của trả lời gắn vào gốc của nhánh — nhưng NÚT phải có ở mọi thẻ.

### C0b. Khung bình luận làm dạng toggle
Bấm vào khu bình luận, hoặc bấm icon bình luận, thì xổ ra **full khung**.
Hiện nó mở một phần và phải thao tác thêm.

### C5. Cho sửa bình luận sau khi gửi, tối đa 3 lần
Người gõ xong mới thấy lỗi chính tả thì không có đường nào sửa. Cho sửa tối đa
**3 lần**; đếm số lần sửa và khoá sau đó. Cần nghĩ cách xác thực "đúng người
đã gõ" mà không cần tài khoản — nhiều khả năng là một mã ngắn lưu ở
`localStorage` cùng lúc gửi bình luận.

---


### C3. "Notify me of follow-up comments by email"

**Làm được, nhưng cần một quyết định của chủ trang trước khi viết dòng mã nào.**

Phần LƯU thì đã có đủ: bình luận nằm trong D1 (`env.DB`), và email người gửi
đã được lưu sẵn ở đó. Thêm một bảng đăng ký theo dõi là việc nhỏ.

Phần GỬI mới là chỗ vướng. **Cloudflare Workers không mở được kết nối SMTP**,
nên phải gọi một dịch vụ gửi mail qua HTTP. MailChannels từng là đường miễn
phí cho Workers nhưng đã bỏ gói ấy — nay phải dùng một bên thứ ba (Resend,
Postmark, SendGrid…). Nghĩa là:

1. **Mở một tài khoản** ở một dịch vụ gửi mail, và xác minh tên miền
   `z-in-borderland.com` (thêm bản ghi DNS SPF/DKIM). Không xác minh thì mail
   rơi vào hộp spam gần như chắc chắn.
2. **Đặt một khoá bí mật** ở Cloudflare → Settings → Runtime → Variables and
   Secrets, giống cách `GEMINI_KEY` đang làm.
3. **Chấp nhận rằng trang sẽ gửi mail thay mình.** Kèm theo đó là một đường
   HUỶ ĐĂNG KÝ thật sự hoạt động trong mọi lá mail — thiếu nó thì đây là thư
   rác, không phải tính năng.

Chưa làm vì ba việc trên là việc của chủ trang, không phải của mã. Khi nào
quyết thì phần mã gồm: ô tích trong khung soạn · bảng `theo_doi` trong D1 ·
một tuyến `/api/huy-theo-doi?ma=…` · và một móc ở lượt DUYỆT bình luận (gửi
lúc duyệt chứ không lúc gửi, không thì spam cũng kích hoạt mail).

> Ô tích **không nên hiện ra** cho tới khi khoá được đặt — một ô tích thu địa
> chỉ email rồi không bao giờ gửi gì còn tệ hơn là không có ô nào.

---

## G · Bàn làm việc — /z-admin/

### G1. Nút New post · New category chưa cùng cỡ
Scale lại cho bằng nút bên khu bình luận.

### G2. Ô soạn thảo — rà lại toàn bộ
- **Căn dòng**: thêm nút chọn căn trái / giữa / phải / đều hai bên, kiểu các
  app soạn thảo (một icon xổ ra bốn chế độ).
- **Thanh nút rộng thêm, chứa được hàng thứ hai**, gom các nút cùng nhóm lại
  cho dễ chọn.
- **Kiểm lại từng nút và từng tính năng có chạy không**, và còn thiếu gì —
  nhất là **nhúng ảnh, nhúng video, và khối trích dẫn**.

### G3. Bảng: cho tới 5×20, và kéo được cỡ ô
Hiện giới hạn nhỏ hơn. Cho tạo tối đa **5 cột × 20 hàng**, và cho chỉnh độ
rộng cột / độ cao hàng một chút, kiểu kéo thả.

### G4. Rà liên kết và cấu trúc cho SEO
Kiểm hyperlink trong bài, các liên kết nội bộ, và cấu trúc trang đã chuẩn về
content · SEM · SEO chưa. (Có sẵn `docs/SEO.md` để đối chiếu.)

---
