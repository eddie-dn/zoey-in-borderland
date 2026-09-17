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

### H1. Rà lại như một chuyên gia UX/UI web + mobile
Một vòng nhìn tổng thể: hệ màu, bố cục các khuôn trang (template), khung trang
hiện tại. Không phải sửa lẻ từng chỗ — đây là lượt đọc lại cả trang bằng mắt
của người làm UX/UI, rồi lập danh sách việc từ đó.

### H2. Khu trả lời chưa cân đối
Khung soạn trong cột bên: ô gõ rộng hết cột, hai nút Back · Send dạt phải, dòng
"POSTING AS" và "YOUR NOTE" hai nhãn chồng nhau, và cả khối nặng hơn hẳn hai
thẻ bình luận ngay trên nó. Cần cân lại — có thể gộp hai nhãn, thu ô gõ, và
đưa hai nút về cùng một hàng với dòng báo tin.

### H3. Chụp màn hình có sẵn địa chỉ trang + tên bài
Trình duyệt không can thiệp được vào lúc máy chụp màn hình, nên "tự có" nghĩa
là: một dòng chữ mờ, nhỏ, cố định ở mép bài (địa chỉ trang · tên bài) luôn nằm
trong khung hình — hoặc thêm nút "Lưu thành ảnh" vẽ đoạn đang chọn ra canvas
kèm dòng ấy. Quyết cách nào rồi mới làm.

### H4. Điện thoại: chữ sát hai mép, thiếu khoảng thở
Bài đọc trên điện thoại chỉ cách mép chừng 16px. Nới lề trong của cột bài trên
màn hẹp (và soát lại mọi khuôn trang cho cùng một lề).

### H5. Điện thoại: ba nút nổi bên phải biến mất khi lướt nhanh
Tim · Chia sẻ · Bình luận ẩn đi khi cuộn hơi nhanh và không kịp hiện lại. Xem
lại ngưỡng ẩn theo tốc độ cuộn — hoặc chỉ ẩn khi cuộn XUỐNG, hiện ngay khi
dừng.

### H6. Điện thoại: khung bình luận giữa bài chèn vào bài thay vì nổi lên
Bấm nút bình luận giữa bài thì khung soạn chèn thẳng vào giữa hai đoạn văn và ở
lại đó. Ý muốn: nổi lên trên bài (overlay), gõ xong hoặc bấm ra ngoài thì đóng
và bài trở lại nguyên.

### H7. Nền động các theme mờ quá tay
Hoa · thiên hà · thác · núi đều chìm dưới lớp kính đến mức gần như không thấy.
Nâng độ hiện của nền lên một hai nấc ở cả bốn theme, giữ chữ vẫn đọc được
(đo lại tương phản sau khi nâng).

---

## B · Bàn duyệt

### B2. "Bị lỗi chỗ select" trong /z-admin/ → Comment — chưa tái hiện được
Chị báo ô chọn ở bảng bình luận bị lỗi. Trên bàn thử (duyet.js thật, API giả)
thì tích hai ô là thanh "2 SELECTED · APPROVE · UNAPPROVE · HIDE · CLEAR" hiện
đúng, không lỗi console. Cần thêm: máy nào (điện thoại hay máy tính), bấm vào
đâu, và thấy gì — một ảnh chụp là đủ. Có mô tả rồi mới sửa được.

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
