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

## D · Theme 霜降 và bộ hình theo theme

### D1. Điểm chút màu vào 霜降, và mây lềnh bềnh hơn
Theme đang thuần xám — đúng chủ ý "không màu để nhìn ảnh cho thật", nhưng hơi
lạnh. Điểm **một chút** màu vào (một sắc lam bạc rất nhạt ở quầng nền, hoặc ở
màu nhấn) mà vẫn giữ được chất giấy.

Mây thì cho **lềnh bềnh** hơn: hiện chúng trôi thuần ngang với tốc độ đều
(`v: 0.05 + lop * 0.16` trong `dungMay`, src/js/nen.js). Thêm một nhịp dập
dềnh rất chậm theo chiều dọc, và cho tốc độ thở ra thở vào một chút, thì nó
ra "bồng bềnh" thay vì "trượt ngang".

> Cẩn thận hai chỗ: mây ở đây màu TRẮNG nên nó chỉ hiện ra được ở chỗ có mực
> núi để xoá; và đây là nền của một trang để ĐỌC — mọi alpha đang dưới .2 là
> cố ý.

### D2. Bộ favicon và ảnh chia sẻ đi theo theme
- **Favicon**: hiện chỉ `calm` có bản riêng (`favicon-calm.svg`) — xem `ICON`
  trong src/js/theme.js và khối FAVICON trong tools/build.mjs. 霜降 nền trắng
  thì đoá hoa tím nằm trên thanh tab đọc ra là icon của một trang khác. Cần
  một bản cho nó, và rà lại xem `dark` có nên có bản riêng không.
- **Ảnh chia sẻ** (`npm run og`): sinh theo ba theme. Cần thêm 霜降.
- **Ảnh bìa tự sinh** (`npm run bia`): mandala đổi màu theo theme — kiểm xem
  nó ra gì trên bảng màu không-màu này.

---

## C · Bình luận

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
