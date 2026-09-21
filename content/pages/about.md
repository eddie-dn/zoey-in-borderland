---
title: About me
khung: bento

# Nền động BẬT, nhưng nhạt hơn màn hero hai nấc (opacity .42 → .22, xem
# `.nen-boc > .nen-canvas` trong src/styles/list.css).
#
# Bản trước TẮT hẳn, với lý do: trang này kín chữ từ trên xuống dưới, và cánh
# hoa rơi qua sau chữ làm mắt bị kéo đi liên tục. Lý do ấy đúng ở độ đậm của
# màn hero, nhưng nó dẫn tới một kết luận quá tay — tắt sạch thì trang About
# thành trang DUY NHẤT không có chất riêng của blog, và ai đi từ trang chủ
# sang thấy như lạc sang một site khác.
#
# Ở .22 thì cánh hoa còn thấy được khi nhìn vào khoảng trống, mà không còn đủ
# tương phản để cướp mắt khỏi một dòng chữ. Đổi lại `tinh` nếu muốn tắt.
nen: dong
summary: Ghi chép về tâm lý, đời thường, và mấy thứ chưa nghĩ xong.

# ─────────── KHUNG BENTO đọc mấy field dưới đây ───────────
# Muốn sửa chữ trên trang About thì sửa NGAY Ở ĐÂY, không phải sửa mã.
# Xem docs/HUONG-DAN-DANG-BAI.md §6 để biết field nào hiện ra chỗ nào.

# Đoạn tự giới thiệu — HIỆN Ở Ô LỚN BÊN PHẢI, cạnh ảnh chân dung.
# Mỗi gạch đầu dòng là MỘT đoạn văn. Viết bao nhiêu đoạn cũng được: ô này cao
# theo nội dung, còn cột ảnh bên trái tự giãn cho bằng.
gioiThieu:
  - 2015 khi tham gia Vườn ươm doanh nghiệp Đà Nẵng và GDG MienTrung, lúc ấy mình (vẫn còn là sinh viên) đã được có dịp tiếp xúc và mở mang rất nhiều với các anh chị lớn. Dần mình ngộ ra một điều mà đến giờ trở thành một trong những niềm tin sống của bản thân: “Cho đi là còn mãi”.
  - Đến khoảng 2016-2017 mình bắt đầu dựng website đầu tiên. Investor lớn nhất đời mình lúc ấy là… bố mẹ với $40 mua tên miền, vpn, theme wp. Vận hành website khá phức tạp nhưng cũng giúp mình học hỏi được nhiều điều. Đến khoảng 2023 thì website cũ của mình bị một lỗi khá nặng là liên quan tới maria db (thú thực đến giờ mình vẫn không hiểu là gì). 2023 cũng là thời điểm mình burn out và cần nhiều thời gian hồi sức sau hơn 5 năm đi làm, vậy là mình quyết định… dừng lại mọi thứ.
  - "2026 với mình là một năm khá đặc biệt: khép lại đại vận 10 năm tử vi, có một công việc mới và thành quả nho nhỏ ở Hà Nội, nhận được rất nhiều sự động viên từ những người thương yêu, tìm lại chính mình sau rất nhiều ngã rẽ."
  - z-in-borderland được truyền cảm hứng từ Alice in Borderland, quyển manga yêu thích của mình từ thời đại học và đã được chuyển thể thành live action những năm gần đây. Hy vọng nơi đây có thể là điểm đến kết nối những người bạn có nhiều góc nhìn, chia sẻ cùng với mình về các chủ đề mà mình yêu thích. Cũng hy vọng nơi đây là một borderland, nơi giúp bạn là chính mình và tìm được chính mình.
  - Thân mến.

# Ảnh chân dung — BỎ TRỐNG hoặc xoá hẳn hai dòng này thì lưới tự về khung cũ
# (ô giới thiệu rộng trọn 6 cột, dải số nằm thành một hàng riêng bên dưới).
# Có ảnh thì hàng đầu thành: cột trái 2 cột (ảnh ở trên, bốn ô số ở dưới) ·
# ô giới thiệu 4 cột bên phải.
# Bỏ ảnh vào public/media/ rồi trỏ đường dẫn tính từ public/.
anh: /media/chan-dung.png
anhAlt: Ảnh chân dung

# Bốn ô số ở cột trái, dưới tấm ảnh. posts và topics KHÔNG khai ở đây — máy tự
# đếm mỗi lần build. Ô số dựng cho giá trị NGẮN, viết gọn thì đẹp hơn.
viTri: Đà Nẵng
tuNam: 2014

# Ô "Dạo này" (LATELY) đang TẮT. Bỏ dấu # ở mấy dòng dưới là nó hiện lại —
# mỗi dòng một việc, dạng  Nhãn · Nội dung. `nghe` là dòng nghiêng ở đáy ô ấy
# nên chỉ hiện khi ô này có mặt.
# dangLam:
#   - Đọc · Sách Đỏ, bản in màu
#   - Viết · loạt bài về cổ mẫu
# nghe: Nhạc không lời, buổi sáng

# Ô liên hệ — dạng  Tên · địa chỉ
lienHe:
  - Email · contact@z-in-borderland.com

# Ô "Buy me a coffee" — câu mời. Xoá dòng này thì ô biến mất, hàng cuối tự khép
# lại còn hai ô.
caPhe: Nếu có bài nào ở đây giúp được bạn một chút, mời mình một ly cà phê nhé.

# Phương thức nhận — cùng khuôn  Nhãn · Nội dung  như ô liên hệ. Dòng bắt đầu
# bằng http thành link; còn lại để nguyên chữ (số tài khoản, mã ví — thứ người
# ta copy chứ không bấm). Chưa khai dòng nào thì ô hiện chữ mờ "Coming soon".
caPheCach: []
---

<!-- Phần chữ dài dưới lưới đang để TRỐNG — cả khối biến mất khỏi trang, không
     chừa khoảng trắng nào. Muốn viết thêm thì gõ Markdown ngay dưới đây như
     một bài thường; `##` thành tiêu đề mục. -->
