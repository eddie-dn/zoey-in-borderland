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

## H · Một vòng rà UX/UI toàn trang

> Vòng rà đã chạy (17-09-2026): đọc lại trang chủ, trang bài, /posts/,
> /archive/, /about/ và khu bình luận ở hai khổ màn — 1150px và 375px. Bảy
> mục H1–H7 đầu tiên đã làm xong và xoá khỏi đây. Những gì còn lại dưới đây là
> danh sách sinh ra TỪ vòng rà ấy, xếp theo mức nặng.

### H9. Trang /about/ trên điện thoại mở đầu bằng một khối trống
Ô ảnh chân dung cao chừng 200px nằm ngay dưới thanh đầu trang, và nó đang rỗng
— một mảng chuyển sắc không có gì trong đó. Trên màn hẹp nó chiếm gần một phần
tư màn đầu tiên. Hoặc đặt ảnh thật vào (`anh` trong front matter của
`content/pages/about.md`), hoặc cho ô ấy tự ẩn khi không có ảnh.

### H10. Thanh đầu trang đổi mặt giữa các trang
/about/ và trang chủ bày dấu hiệu hình hoa; /posts/, /archive/ bày chữ "Zoey in
Borderland". Hai bộ mặt cho cùng một thanh, và người đọc dùng chính chỗ ấy để
biết mình đang ở đâu. Chọn một, hoặc nói rõ quy tắc đổi trong DESIGN-SYSTEM.

### H11. Thẻ chuyên mục ở /posts/ cao thấp so le
Ô có một bài và ô có năm bài cao bằng nhau vì lưới kéo giãn, nên ô một bài còn
lại một khoảng trống bằng nửa thẻ. Cân nhắc cho lưới `align-items:start`, hoặc
lấp khoảng trống bằng câu mô tả chuyên mục dài hơn.

### H12. Hệ màu: đặt tên theo VIỆC, không theo màu
Bảng biến trong `tokens.css` đã đi đúng hướng (`--ok`, `--warn`, `--bad`,
`--accent`), nhưng mười hai màu chữ trong bài thì đặt theo tên màu
(`--c-tim`…). Chúng phục vụ hai việc khác nhau — một bên là trạng thái giao
diện, một bên là bút màu của người viết — nên đừng gộp. Việc cần làm là ghi rõ
ranh giới ấy vào DESIGN-SYSTEM §9 để lượt sau không ai lấy `--c-do` làm màu báo
lỗi.

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
