# SỔ PHIÊN BẢN

> **File này là NGUỒN DUY NHẤT của số phiên bản.** Build đọc dòng đầu tiên trong
> bảng dưới để lấy `Vxx.yy` và ngày, rồi in ra tem ở chân mọi trang. Không khai
> số phiên bản ở chỗ nào khác — hai chỗ là sớm muộn cũng lệch nhau.
>
> **Cách ghi.** Đừng sửa bảng bằng tay. Chạy:
>
> ```bash
> npm run ver -- "chỉnh hệ chữ · nền kính"    # bản vá    → V2.4.9 thành V2.5.0
> npm run ver -- --vua "dựng trang tag"        # đợt mới   → V2.4.x thành V2.5.0
> npm run ver -- --lon "đổi hẳn bộ khung"      # build mới → V2.x.x thành V3.0.0
> ```
>
> **BA TẦNG, mỗi tầng chạy 0 → 9.**
>
> | | Là gì | Lên khi nào |
> |---|---|---|
> | `z` | một bản vá | mỗi lượt `npm run ver` |
> | `y` | một đợt | `z` chạm 9 |
> | `x` | một build | `y` **và** `z` cùng 9 |
>
> Không có `V1.0.10`. Chạm 9 thì tầng trên tự lên và tầng dưới về 0 —
> `npm run ver` lo, không phải nhớ gõ cờ. Bộ kiểm định có phép kiểm canh.
>
> **Không đệm số 0.** `V2.4.9`, không phải `V2.04.09`. Riêng vế BUILD thì bao
> nhiêu chữ số cũng được: `V10.9.1` hoàn toàn hợp lệ.
>
> **Vì sao ba tầng.** Đời trước chỉ có hai (`Vxx.yy`), nên mỗi build chỉ chở
> được MƯỜI bản: làm một ngày là hết ba build, và con số đầu nở nhanh tới mức
> nó thôi nói lên điều gì. Một build nay chở 100 bản, nên nó lại đánh dấu được
> một chặng thay vì một buổi chiều.
>
> **Đợt đổi số (17-Sep-2026).** 137 bản cũ đã đánh lại theo đúng thứ tự: mỗi
> BUILD cũ thành một ĐỢT mới, gói mười build cũ vào một build mới.
> `V0.xx → V1.0.xx`, `V9.xx → V1.9.xx`, `V10.xx → V2.0.xx`, `V16.xx → V2.4.xx`.
> Không dòng nào mất, không dòng nào đổi chỗ — chỉ đổi cách gọi tên.
>
> **Vài số build bị bỏ qua: 13 · 14 · 23 · 38 · 39 · 40 · 41.** Chủ trang kiêng
> mấy số ấy. Luật nằm trong `tools/lib/lichsu.mjs` (`BUILD_BO`), không nằm
> trong trí nhớ ai. Chỉ áp cho vế BUILD — hai vế sau chạy 0..9 nên không bao
> giờ chạm tới.
>
> **Quy ước cột `#`**: số bản vá (`z`) của dòng đó, ghi hai chữ số cho thẳng
> cột. Không biết thì ghi `thiếu info`.
>
> Cột **Sửa chính** chỉ ghi **loại việc**, tối đa **4 việc** một dòng — sổ này
> người đọc blog mở ra xem được.
>
> **Phần diễn giải dưới bảng: tối đa 3 gạch đầu dòng mỗi bản.** Ngăn phiên bản
> ở chân trang đọc thẳng mấy gạch ấy ra màn hình; sáu bảy gạch thì nó phải
> cuộn, và người bấm vào để xem "bản này đổi gì" nhận về một bài đọc. Nhiều
> việc quá thì tách sang một bản vá nữa — đuôi chạy tới 9, chỗ thì có thừa.
> Hai luật này đều có phép kiểm canh, và cả hai chỉ soi BẢN MỚI NHẤT: mấy trăm
> mục cũ viết trước luật, sửa lại là sửa lịch sử.

<!-- BANG-BAT-DAU · dòng ngay dưới hàng gạch là bản mới nhất, build đọc đúng dòng đó -->

| Bản | Ngày | # | Sửa chính |
|---|---|---|---|
| V3.0.7 | 2026-09-19 | 07 | tự kiểm hệ thống · sao lưu D1 sang Google Sheet |
| V3.0.6 | 2026-09-19 | 06 | thư báo bình luận gom trong ngày · lịch cron + Resend |
| V3.0.5 | 2026-09-18 | 05 | nền 霜降: trăng khuyết nghiêng dần theo đêm |
| V3.0.4 | 2026-09-18 | 04 | bỏ dấu trang chìm ở trang bài; dải sang trang ăn màu nền; gấp trả lời giữ 2 cái và gấp lại được |
| V3.0.3 | 2026-09-18 | 03 | ô soạn: căn dòng cho ảnh; ảnh giữ khổ khi mở lại bài; bỏ cửa thứ hai đổi bề ngang ảnh |
| V3.0.2 | 2026-09-18 | 02 | ô soạn: thụt vào được ở mục đầu danh sách; con trỏ không nhảy khi đổi khối; gõ tắt Markdown |
| V3.0.1 | 2026-09-18 | 01 | ô soạn: dải ảnh mở bảng chọn ảnh; ngăn Media lên ngay dưới thanh nút; thêm khổ nhỏ, bỏ khổ rộng |
| V3.0.0 | 2026-09-18 | 00 | bình luận: ẩn bớt reply · ngăn cao tối đa nửa trang · hơn 10 thì có trang; trăng chạy trọn một kỳ |
| V2.9.9 | 2026-09-18 | 09 | ô soạn: năm nấc khổ ảnh có cỡ gốc; tooltip cho khổ ảnh và dạng dải ảnh; sửa khối mã |
| V2.9.8 | 2026-09-18 | 08 | ô soạn có xem thử dựng bằng chính bộ dựng trang; dải ảnh bốn dạng; sửa thứ tự thẻ og:image |
| V2.9.7 | 2026-09-18 | 07 | ô soạn: sửa danh sách · thụt vào · ô việc dùng cùng nhau; thêm khổ ảnh nhỏ |
| V2.9.6 | 2026-09-18 | 06 | bình luận ở cột bên: Reply và Edit về cùng hàng với nội dung |
| V2.9.5 | 2026-09-18 | 05 | chân trang cao bằng thanh đầu trang; khoảng trên dưới nội dung trang danh sách đều nhau |
| V2.9.4 | 2026-09-18 | 04 | khu bình luận hai tầng, gửi xong thấy và sửa được; duyệt về hết trong admin; trang danh sách thấy đủ chân trang |
| V2.9.3 | 2026-09-18 | 03 | nền About hết méo: nền động về .shell, khung vẽ 霜降 có trần; trăng xuống dưới đỉnh núi đo được; sao lấp lánh theo cụm |
| V2.9.2 | 2026-09-18 | 02 | một design system cho chip · huy hiệu · con số; tick tất cả ở bàn duyệt; bỏ ô chọn mục dư ở ngăn Post |
| V2.9.1 | 2026-09-18 | 01 | bờ nước tan mềm · trăng lên cao · cỡ đĩa ở khổ dọc |
| V2.9.0 | 2026-09-18 | 00 | index theo lượt xem · nền 霜降 một lượt mặt trời · sửa méo đĩa |
| V2.8.9 | 2026-09-18 | 09 | nền 霜降 — sơn thuỷ nhạt, thiên thể chuyển cảnh |
| V2.8.8 | 2026-09-18 | 08 | vẽ lại nền 霜降 — nét, lớp mực, chiều sâu |
| V2.8.7 | 2026-09-18 | 07 | rà lại toàn bộ tài liệu cho khớp mã: nền động bốn hiệu ứng, ô soạn bài có chương riêng, bàn duyệt bốn ngăn, và mọi con số lạc hậu |
| V2.8.6 | 2026-09-18 | 06 | ô soạn: bấm vào ảnh là hiện thanh ba khổ; màn hình sau khi đăng gom lại một khối gọn; bảng trên trang có hàng kẻ xen kẽ |
| V2.8.5 | 2026-09-18 | 05 | ô soạn: bảng nay là bảng thật gõ thẳng vào ô, có khung đặt cỡ và Tab sang ô kế; khối mã và khung nhấn đều có bảng chọn |
| V2.8.4 | 2026-09-18 | 04 | khối đọc tiếp ở chân bài bỏ nhãn và vạch ngăn; cụm cuối hàng meta đổi thứ tự thành tim, bình luận, chia sẻ; nút chính theme Tĩnh lặng thôi loang hai hệ màu |
| V2.8.3 | 2026-09-18 | 03 | nền 霜降 xếp lại dãy núi và tính bước sóng theo bề ngang thật nên khổ điện thoại thôi lởm chởm; vòng ngày đêm nhanh hơn; nền động ở trang tĩnh hiện rõ hơn |
| V2.8.2 | 2026-09-18 | 02 | nền 霜降: mặt trời mọc từ sau dãy núi xa, đĩa sáng vẽ lại mượt như mặt trăng, bỏ mây và cho sương thở rõ hơn |
| V2.8.1 | 2026-09-18 | 01 | trang giới thiệu hiện tên blog trên thanh đầu như mọi trang khác; thẻ chuyên mục thôi bị kéo cao theo hàng trên; bộ dựng nhắc khi ảnh chân dung gần như trống |
| V2.8.0 | 2026-09-17 | 00 | phép kiểm mới: bắt một lớp CSS bị khai hai lần cùng một thuộc tính trong một file |
| V2.7.9 | 2026-09-17 | 09 | nền động bốn theme hiện rõ hơn; nền 霜降 vẽ lại trăng và cho bầu trời đổi màu trọn một vòng ngày đêm |
| V2.7.8 | 2026-09-17 | 08 | điện thoại: khung bình luận giữa bài nay là tấm nổi, bài phía sau đứng yên; khu trả lời gộp hai nhãn về một hàng; trang bài có dấu trang nhỏ cho ảnh chụp màn hình |
| V2.7.7 | 2026-09-17 | 07 | bàn duyệt: thanh chọn hàng loạt thôi để bảng xuyên qua, hàng có ô tích thẳng cột lại ở khổ hẹp; điện thoại nới lề hai bên; cụm ba nút nổi hiện lại ngay khi ngừng cuộn |
| V2.7.6 | 2026-09-17 | 06 | màn đầu bỏ dòng Profile; chú thích nút đổi câu sang bên phải, thôi đè lên ô trích dẫn; dãy núi 霜降 trở lại đường thoải |
| V2.7.5 | 2026-09-17 | 05 | nền 霜降 chốt một bản: mặt trời lặn sau núi gần mặt nước, sương dâng, trăng lên và sao lấp lánh; bỏ hai bản demo và đường ?nen= |
| V2.7.4 | 2026-09-17 | 04 | màu chữ trong bài lên mười hai màu, mỗi màu có bản cho cả bốn theme; phép kiểm cùng bộ biến so cả 霜降 |
| V2.7.3 | 2026-09-17 | 03 | ô soạn thảo: bảng Blocks thay bằng nút Media và nút khung nhấn đổi loại ngay trên nhãn; ba nút căn dòng; mũi tên quay lại lên đầu trang viết bài |
| V2.7.2 | 2026-09-17 | 02 | chọn bản nền 霜降 bằng địa chỉ ?nen=thac hoặc ?nen=mattroi, khỏi phải mở Console |
| V2.7.1 | 2026-09-17 | 01 | logo kể lại từ đầu khi người đọc quay lại tab sau hơn tám giây |
| V2.7.0 | 2026-09-17 | 00 | nền 霜降 vẽ lại thành bức sơn thuỷ: thác đổ làm phần động, sương vẽ tĩnh, điểm một sắc lục trúc; kèm bản thứ hai mặt trời và đàn chim để chọn |
| V2.6.9 | 2026-09-17 | 09 | thanh nút ô soạn chia hai hàng cố định theo nghĩa; đường kẻ đọc tiếp ở cột bên thôi thò thụt; khung trả lời gấp hai ô tên email thành một dòng |
| V2.6.8 | 2026-09-17 | 08 | nền 霜降: thêm hai ngọn núi cao xa, và sương nay XOÁ mực thay vì tô trắng nên mới thấy được |
| V2.6.7 | 2026-09-17 | 07 | sửa lỗi bàn duyệt báo rỗng: câu truy vấn chọn cột soSua trước khi cột ấy được thêm; và thôi biến mọi lỗi truy vấn thành không có gì |
| V2.6.6 | 2026-09-17 | 06 | khối đọc tiếp ở cột bên có lại đường kẻ giữa các dòng |
| V2.6.5 | 2026-09-17 | 05 | 霜降 có favicon và ảnh chia sẻ riêng; ảnh bìa tự sinh thêm hai cặp màu giấy-mực; ảnh chia sẻ Tĩnh lặng theo nền mới |
| V2.6.4 | 2026-09-17 | 04 | ô trích dẫn còn hai phông, tên tác giả mặc cùng bộ đồ với nhãn; 霜降 điểm lam bạc và mây lềnh bềnh thay vì trượt ngang đều |
| V2.6.3 | 2026-09-17 | 03 | thẻ bài dùng h2 nên dàn tiêu đề thôi nhảy cóc ở 30 trang; hai phép kiểm mới cho dàn tiêu đề và cân nặng chữ |
| V2.6.2 | 2026-09-17 | 02 | ô soạn thảo: thêm căn dòng bốn chế độ, thanh nút gom nhóm không bị xé khi xuống hàng, sửa nút Blocks tràn chữ; bảng cho tới 5x20 và chỉnh được bề rộng cột |
| V2.6.1 | 2026-09-17 | 01 | bàn duyệt thẳng cột ở bộ lọc All; nút Reply có ở mọi thẻ; bấm khu bình luận là xổ full khung; cho sửa bình luận tối đa 3 lần |
| V2.6.0 | 2026-09-17 | 00 | thêm theme thứ tư 霜降: nền trắng, mực đen, nền động là mây trôi qua núi thuỷ mặc; bảng lịch sử đổi sang thẻ dialog; trích dẫn AI đệm trong D1 nên một lượt gọi đủ cho cả khung giờ |
| V2.5.9 | 2026-09-17 | 09 | theme Tĩnh lặng: nền hạ hai nấc cho thẻ trắng nổi lên, bóng đổ đậm thêm, nét chữ thân bài dày một bậc; trang About bật lại nền động ở độ mờ .22 |
| V2.5.8 | 2026-09-17 | 08 | tooltip nút xem câu khác sang trái, thôi đè lên câu trích dẫn; giờ bình luận về liền sau tên người viết; nhớ tên và email người đã bình luận; trần 12 trả lời mỗi nhánh rồi mở nhánh mới |
| V2.5.7 | 2026-09-17 | 07 | ba khung đổi tên thành post left · post full · post insta, mọi bài hiện dùng post left; khối đọc tiếp bày như cặp lùi/tới của post insta ở mọi khổ màn, 116px còn 73px |
| V2.5.6 | 2026-09-17 | 06 | chữ đậm trong bài về cân nặng thật 600 thay vì nét đậm trình duyệt tự bịa; ghi luật ba họ phông vào Design System; thêm phép kiểm chặn cân nặng không có face đỡ |
| V2.5.5 | 2026-09-17 | 05 | rà lại tài liệu: §7 FILE NÀO CHỨA GÌ viết lại cho đúng 13 file và 6 gói; sửa script dựng logo động đang hỏng lặng vì gõ cứng tên file assets; hồi sinh một phép kiểm đã chết âm thầm |
| V2.5.4 | 2026-09-17 | 04 | gom bảy bộ luật báo tin và bốn bộ trạng thái rỗng thành hai cụm dùng chung .bao và .trong; sửa hai lỗi màu lộ ra lúc xếp cạnh nhau; chuyển 74 dòng CSS khung cắt ảnh từ list.css về soan.css |
| V2.5.3 | 2026-09-17 | 03 | bảng lịch sử ba tầng Vx → Vx.y → Vx.y.z, ngày in gọn; đọc tiếp ở khổ hẹp thành cặp lùi/tới một dải; tên blog ở khổ hẹp nghỉ thì mờ và sáng khi chạm, như khổ ngang |
| V2.5.2 | 2026-09-17 | 02 | thẻ bình luận: giờ GMT+7, nút duyệt lên góc phải và thôi trùng đôi ở nhánh trả lời; ô soạn dời vào thẻ nay bung hết bề ngang; khổ hẹp mở khung bình luận ngay tại đoạn đang đọc thay vì rơi xuống chân trang |
| V2.5.1 | 2026-09-17 | 01 | hai lỗi cú pháp CSS nuốt mất luật: thanh công cụ ở /z-admin/ và nút màu trong ô soạn; ô trích dẫn tách thành file riêng, trả lại phông nghiêng và cặp dấu ngoặc ở trang chủ; thêm hai phép kiểm chặn đúng hai lỗi đó |
| V2.5.0 | 2026-09-17 | 00 | CSS chia theo loại trang, mỗi trang chỉ tải phần của nó; số phiên bản đổi sang ba tầng Vx.y.z; bỏ mấy tên lớp không tạo ra luật nào |
| V2.4.9 | 2026-09-17 | 09 | cắt ảnh ngay trước khi gửi đi: kéo bốn góc hoặc chọn tỉ lệ có sẵn |
| V2.4.8 | 2026-09-17 | 08 | tiêu đề khối gõ thẳng tại chỗ, bỏ hộp thoại nhảy lên đỉnh màn; thanh nút về một khổ duy nhất; vạch ngăn trong khung gõ vẽ đúng thứ trang sẽ hiện |
| V2.4.7 | 2026-09-17 | 07 | bàn duyệt tick chọn nhiều rồi làm một lượt; hàng ở cả ba ngăn quản trị gọn lại từ 62px còn 42px |
| V2.4.6 | 2026-09-17 | 06 | sửa ba lỗi nút danh sách làm mất dòng và mất chữ; thụt vào và thụt ra chỉ chạy trong danh sách; ảnh thả vào rơi đúng chỗ thả |
| V2.4.5 | 2026-09-17 | 05 | phông tự host, trang không còn gọi tài nguyên nào ngoài tên miền; bấm ảnh trong bài để xem to; bài khai ngày tương lai nay đợi tới ngày mới lên |
| V2.4.4 | 2026-09-17 | 04 | bỏ 86 luật CSS không tên lớp nào tồn tại; ảnh bìa nhẹ đi 28%; ghi rõ trần lượt gọi GitHub của trang quản trị |
| V2.4.3 | 2026-09-17 | 03 | tên file assets mang vân tay nội dung; cache assets một năm thay cho 14 vòng hỏi lại mỗi lượt xem trang; phép kiểm cache đảo chiều theo |
| V2.4.2 | 2026-09-17 | 02 | chủ trang đã đăng nhập thì thôi phải gõ tên và email khi bình luận |
| V2.4.1 | 2026-09-17 | 01 | có trang 404 thật thay cho trang trắng; phép kiểm bản nháp từ nay đỏ được; Cloudflare trỏ vào đúng trang ấy |
| V2.4.0 | 2026-09-17 | 00 | trang chủ thôi trượt ngang 6px; ô trích dẫn cho ba lượt xin câu mới mỗi ngày; thêm CSP, Permissions-Policy và HSTS |
| V2.3.9 | 2026-09-17 | 09 | thanh soạn thảo xếp lại chính trước phụ sau và bỏ nút chỉ dẫn; bảng Blocks chia bốn nhóm, bốn khung nhấn có chấm màu riêng; nút dọn nay gỡ được cả liên kết |
| V2.3.8 | 2026-09-17 | 08 | thẻ bình luận gọn lại còn một dòng; bàn duyệt căn cột cố định, nhãn đổi cũng không so le; ngăn Category có ô lọc y như ngăn Post |
| V2.3.7 | 2026-09-17 | 07 | ảnh bìa mang hoạ tiết mandala của logo; nét hoa văn tự đổi theo nền sáng hay tối; bớt tối bốn góc để giữ đúng bảng màu |
| V2.3.6 | 2026-09-17 | 06 | ô trích dẫn xin cả chùm câu, F5 là có câu mới; sửa ba hằng số đọc trước lúc gán làm lớp AI chưa từng chạy; thêm tác giả Việt vào kho nguồn |
| V2.3.5 | 2026-09-17 | 05 | thẻ bình luận gọn lại thành hàng có kẻ ngăn; sửa hai tên lớp trùng nhau làm bàn duyệt mọc khung hộp |
| V2.3.4 | 2026-09-17 | 04 | ba ngăn quản trị dùng chung một khuôn hàng; bàn duyệt bày theo dòng, hết cọc thẻ có viền; bảng bài lọc được theo chuyên mục |
| V2.3.3 | 2026-09-17 | 03 | ô ảnh bìa ngay trong trang viết bài; bảng đo tiêu đề · tóm tắt · ảnh lúc đang gõ; thẻ chia sẻ khai đủ khổ ảnh để Messenger và Zalo vẽ được ô xem trước |
| V2.3.2 | 2026-09-17 | 02 | mọi khối viết được đều có nút, không còn gì phải gõ tay; cú pháp hiện ngay cạnh từng nút; thêm khối tràn hết bề ngang màn hình |
| V2.3.1 | 2026-09-17 | 01 | kéo thả ảnh thẳng vào khung soạn thảo; ảnh tự thu nhỏ và đổi định dạng ngay trên máy; bấm đúp vào ảnh để gõ dòng tả |
| V2.3.0 | 2026-09-17 | 00 | nút cho chỉ số trên·dưới·phím và ba lớp đoạn; bài không có mục lục thôi chừa cột trống; bàn duyệt có chip lọc |
| V2.2.9 | 2026-09-17 | 09 | cụm nút đi theo người đọc ở bài dài; sửa được đường dẫn và chuyên mục của bài đã đăng; nút cho mọi khối trong ô soạn thảo |
| V2.2.8 | 2026-09-17 | 08 | một hàng meta cho cả tim · chia sẻ · bình luận; khung ảnh có cặp lùi/tới; điện thoại đưa Search vào menu ☰ |
| V2.2.7 | 2026-09-16 | 07 | ô trích dẫn: ba câu mới mỗi ngày theo sáng · chiều · tối; bật lại lớp AI đang tắt lặng |
| V2.2.6 | 2026-09-17 | 06 | Posts thành lưới bento; một khuôn dòng cho bốn danh sách; favicon dùng logo thật |
| V2.2.5 | 2026-09-17 | 05 | cột bên một thang chữ; nút Back đứng cạnh Send có viền; khung ảnh đưa cụm nút lên đầu bài |
| V2.2.4 | 2026-09-17 | 04 | điện thoại: có menu ☰; tên blog thôi kẹt nửa vời ở lần mở thứ hai |
| V2.2.3 | 2026-09-17 | 03 | ảnh chia sẻ mới: logo, tên blog, ba theme; sinh bằng npm run og |
| V2.2.2 | 2026-09-17 | 02 | rà soát tài liệu: sửa chỗ nói sai, bỏ file thừa, thêm ba phép kiểm chống lệch |
| V2.2.1 | 2026-09-17 | 01 | cụm tương tác xuống cột phải dưới Read next; cột bên thôi kẹp cuộn; nội dung bám mép logo |
| V2.2.0 | 2026-09-17 | 00 | chip ở Notes và Search về đúng cỡ chip ở Posts |
| V2.1.9 | 2026-09-17 | 09 | cột chữ trang bài căng tới mép logo |
| V2.1.8 | 2026-09-17 | 08 | Leave a note xuống sau phần gợi ý bài; khung bình luận có nút Back và thôi giữ cú cuộn |
| V2.1.7 | 2026-09-16 | 07 | đồng bộ đầu bài mọi khung: ba con số một hàng, cụm nút một chỗ; bỏ vạch trang trí thừa cuối bài |
| V2.1.6 | 2026-09-16 | 06 | dọn: luật CSS chết và trùng, nhãn thừa, script chỉ nạp ở trang cần |
| V2.1.5 | 2026-09-16 | 05 | ô quản trị sang tiếng Anh; nút Back đứng cạnh Save |
| V2.1.4 | 2026-09-16 | 04 | bình luận nở ra cột phải ở khổ rộng; ô tìm kiếm thôi khựng ở phím gõ đầu |
| V2.1.3 | 2026-09-16 | 03 | điện thoại: mục lục thành nút hamburger; tên blog mở ra thì dòng dưới nở theo |
| V2.1.2 | 2026-09-16 | 02 | logo: giữ nhịp khi quay lại trang; thanh đầu trang đổi qua lại giữa tên blog và logo |
| V2.1.1 | 2026-09-16 | 01 | Tĩnh lặng: bỏ nốt đường kẻ mặt nước trên màn đầu |
| V2.1.0 | 2026-09-16 | 00 | trang Posts thành bảng mục lục gọn: mỗi chuyên mục một danh sách dòng, tối đa 6 mục một trang |
| V2.0.9 | 2026-09-16 | 09 | tim · chia sẻ · bình luận gom thành một cụm ở cột phải; thêm nút chia sẻ / chép đường dẫn |
| V2.0.8 | 2026-09-16 | 08 | Tĩnh lặng: trả nền về bản cũ, giữ phần mép; bỏ lằn nước, toé mềm hơn, mưa chạm sớm hơn |
| V2.0.7 | 2026-09-16 | 07 | theme Tĩnh lặng: hạ nền một bậc, đậm màu trang trí và đường kẻ cho thẻ ra thẻ |
| V2.0.6 | 2026-09-16 | 06 | điện thoại: màn đầu giữ trọn một màn sau khi mở danh sách; tên blog chạm để mở, hai dòng thẳng cột |
| V2.0.5 | 2026-09-16 | 05 | bộ khung logo: dựng lại tấm lát cắt 14 chặng, đồng bộ trọn thư mục sang zoey-blog-logo |
| V2.0.4 | 2026-09-16 | 04 | nền theme: mưa chạm mặt nước có nước hắt lên; ngân hà phủ trọn màn hình |
| V2.0.3 | 2026-09-16 | 03 | chữa header dính ở trang chủ; cột chữ ôm làn chữ; đọc tiếp theo khung bài |
| V2.0.2 | 2026-09-16 | 02 | bình luận thành nút tim + icon; đếm tim đặt cạnh lượt xem ở đầu bài |
| V2.0.1 | 2026-09-16 | 01 | logo: nét nối đứng thẳng rồi mới ngả vào nối; xuất lại bộ khung 14 chặng |
| V2.0.0 | 2026-09-16 | 00 | cỡ chữ thân bài nhỏ một bậc; khối tag bỏ khung bao |
| V1.9.9 | 2026-09-16 | 09 | điện thoại: danh sách bài chờ bấm Read on; tên blog nhỏ một bậc và có hiệu ứng mở màn |
| V1.9.8 | 2026-09-16 | 08 | trang chủ: nền phủ trọn trang kể cả chân trang, bỏ tem phiên bản lặp |
| V1.9.7 | 2026-09-16 | 07 | bảng bài đã đăng ở ngăn Post: sửa lại bài, ẩn và bỏ ẩn |
| V1.9.6 | 2026-09-16 | 06 | logo: giữ hình nơ một nhịp rồi mới bo tròn |
| V1.9.5 | 2026-09-16 | 05 | Đọc tiếp chuyển lên cột bên, dưới mục lục |
| V1.9.4 | 2026-09-16 | 04 | tag thành một hàng chữ thường, bỏ viền và nền |
| V1.9.3 | 2026-09-16 | 03 | nền cho sửa bài: trạng thái ẩn trong bộ dựng, và API đọc/ghi bài đã đăng |
| V1.9.2 | 2026-09-16 | 02 | siết lại hệ thống: chip nhỏ lại, Read next thành dòng đơn, bỏ ô trích dẫn khỏi trang bài, cột chữ rộng thêm, thu khoảng trống trên chân trang |
| V1.9.1 | 2026-09-16 | 01 | trang chủ chỉ còn màn đầu; Read on đi thẳng sang Posts |
| V1.9.0 | 2026-09-16 | 00 | logo: xoay trước rồi mới nối; tám cánh mở ra từ bốn; xoáy nhoè rồi nổ |
| V1.8.9 | 2026-09-16 | 09 | ô soạn thảo đọc được Markdown vào — nền cho việc sửa bài đã đăng |
| V1.8.8 | 2026-09-16 | 08 | gỡ hẳn lối #viet và #duyet cũ: trang ngoài thôi bị chèn ô đăng nhập |
| V1.8.7 | 2026-09-16 | 07 | admin: lời chào thay dòng phụ đề, lối ra thành chữ; sai khoá thì im lặng; ngăn Note thôi kèm danh sách |
| V1.8.6 | 2026-09-16 | 06 | màn đầu ở khổ dọc: tên blog cân giữa thay vì bám mép trái |
| V1.8.5 | 2026-09-16 | 05 | logo: thêm nấc đanh nét trước khi xoay; vành ngoài thành đường sóng; một nhịp cho mọi cú chuyển cảnh |
| V1.8.4 | 2026-09-16 | 04 | chân trang gọn còn một hàng; chữ chân trang khớp chữ đầu trang |
| V1.8.3 | 2026-09-16 | 03 | đăng nhập gom về một cửa; ô soạn thảo gõ như văn bản; màu chữ trong bài |
| V1.8.2 | 2026-09-16 | 02 | điền kho mã thật; canh chỗ trống mẫu trong cấu hình Worker |
| V1.8.1 | 2026-09-16 | 01 | trang quản lý gom thành ba ngăn; đăng bài thẳng từ đó; núm vặn gom về một chỗ |
| V1.8.0 | 2026-09-16 | 00 | trang bài nhẹ đi mười lần; ghi chú kỹ thuật thôi đi theo người đọc |
| V1.7.9 | 2026-09-16 | 09 | dọn file chết, dựng lại bản lưu logo, tài liệu khớp lại với mã |
| V1.7.8 | 2026-09-16 | 08 | đổi đường dẫn trang quản lý |
| V1.7.7 | 2026-09-16 | 07 | trang quản lý riêng; theme Tĩnh lặng sâu màu hơn; ghi chú có phân trang |
| V1.7.6 | 2026-09-16 | 06 | bàn duyệt gom về một chỗ, tự làm mới; gỡ bình luận ngay tại chỗ đang đọc |
| V1.7.5 | 2026-09-16 | 05 | model dự phòng cho ô trích dẫn đổi sang bí danh tự cập nhật |
| V1.7.4 | 2026-09-16 | 04 | bật lớp trích dẫn viết mới mỗi ngày |
| V1.7.3 | 2026-09-16 | 03 | mở bàn duyệt và ô viết là cuộn tới nơi; bỏ được dòng mời bình luận |
| V1.7.2 | 2026-09-16 | 02 | bảng lượt xem tự tạo, không bắt chạy SQL tay |
| V1.7.1 | 2026-09-16 | 01 | chạy được cả dưới dạng Worker, không riêng Pages |
| V1.7.0 | 2026-09-16 | 00 | bình luận chuyển sang Cloudflare, duyệt ngay trên trang thay vì trong bảng tính |
| V1.6.5 | 2026-09-16 | 05 | khối chữ màn đầu bị khuôn xén ở CẢ hai đầu, không riêng đầu trái |
| V1.6.4 | 2026-09-16 | 04 | mục lục bám theo bài dài; thanh cuộn thấy được; cỡ chữ thân bài nhỏ một nhịp |
| V1.6.3 | 2026-09-16 | 03 | logo lấy lại đoá mandala làm hình nghỉ; vòng kể ngắn lại, chặng xoay rõ hơn; tên blog ở khổ dọc cân hai dòng |
| V1.6.2 | 2026-09-16 | 02 | ghi chú đăng thẳng từ điện thoại, không phải dựng lại trang; theme Tĩnh lặng ngả xanh trời |
| V1.6.1 | 2026-09-16 | 01 | tên blog đúng phông; cột chữ hẹp lại còn 70 ký tự; bài cũ về cùng một khung |
| V1.6.0 | 2026-09-16 | 00 | hoa Sakura nhỏ và mỏng lại, đông hơn; bỏ viền ở cánh xa |
| V1.5.9 | 2026-09-16 | 09 | logo: nút thắt vô cực, chữ B vặn bụng, mandala xoay rồi vỡ thành bụi |
| V1.5.8 | 2026-09-16 | 08 | theme thứ ba Tĩnh lặng: bảng màu xanh pastel, nền thác nước ở màn đầu |
| V1.5.7 | 2026-09-16 | 07 | rà docs: ba khung, trang ghi chú, chương logo; thêm 4 phép kiểm |
| V1.5.6 | 2026-09-16 | 06 | logo kể chuyện bằng nét biến hình, bỏ hẳn con chữ |
| V1.5.5 | 2026-09-16 | 05 | băng ảnh lấy tỉ lệ theo tấm đầu, kẹp trong khoảng Instagram cho phép |
| V1.5.4 | 2026-09-16 | 04 | màn đầu: Borderland to hơn, xén nửa chữ cuối, nhấc lên giữa khung |
| V1.5.3 | 2026-09-16 | 03 | logo tự kể lại trình tự dựng hình, lặp ở trang chủ |
| V1.5.2 | 2026-09-15 | 02 | logo đứng một mình to lên; ghi chú có đường vào từ chân trang |
| V1.5.1 | 2026-09-15 | 01 | từ Borderland vừa đúng bề ngang cột, thêm phép kiểm canh việc đó |
| V1.5.0 | 2026-09-15 | 00 | chân trang khổ dọc canh về cùng một mép trái |
| V1.4.9 | 2026-09-15 | 09 | trang giới thiệu bỏ hiệu ứng nền cho đỡ rối |
| V1.4.8 | 2026-09-15 | 08 | màn đầu: chữ Z che đúng một phần ba, in sát lại, Borderland giãn ra |
| V1.4.7 | 2026-09-15 | 07 | dải ngân hà dày và sáng hơn, đậm trong loang ra ngoài |
| V1.4.6 | 2026-09-15 | 06 | logo hai vòng vô cực; chỉ hiện ở trang chủ và giới thiệu |
| V1.4.5 | 2026-09-15 | 05 | trang ghi chú ngắn thay Tags trên thanh điều hướng |
| V1.4.4 | 2026-09-15 | 04 | khung xem ảnh cố định · khối chữ lùi vào trong khung |
| V1.4.3 | 2026-09-15 | 03 | đếm lượt xem thật bằng cơ sở dữ liệu D1 |
| V1.4.2 | 2026-09-15 | 02 | trích dẫn thành tab bên lề bài, đổi sau mỗi hai trang · nền động nhạt ở trang tĩnh |
| V1.4.1 | 2026-09-15 | 01 | trang Posts thành thư mục chuyên mục, thôi trùng với Archive |
| V1.4.0 | 2026-09-15 | 00 | dải ngân hà dựng lại có nền sao và nhánh thật · cân lại khối chữ |
| V1.3.9 | 2026-09-15 | 09 | thẻ bài: kính trong hơn · cao bằng nhau · trang chủ giữ 3 bài |
| V1.3.8 | 2026-09-15 | 08 | logo hình vô cực · tên blog sắp lại khi rê chuột |
| V1.3.7 | 2026-09-15 | 07 | khung bài ảnh ngắn: băng ảnh bên trái, tản mạn bên phải |
| V1.3.6 | 2026-09-15 | 06 | chữ thân bài đo lại · căn đều hai bên · đầu bài rộng hơn cột chữ |
| V1.3.5 | 2026-09-15 | 05 | ngày đăng gốc kèm mốc cập nhật tự động · bỏ phút đọc |
| V1.3.4 | 2026-09-15 | 04 | khổ dọc: màn đầu trọn một màn · bỏ danh sách ba bài · thẻ bài gọn lại |
| V1.3.3 | 2026-09-15 | 03 | cánh hoa nét hơn có chiều sâu · thiên hà tràn cả hai mép màn hình |
| V1.3.2 | 2026-09-15 | 02 | chữ giữa tách khỏi chữ đầu · hai dòng thôi đè nhau khi co lại |
| V1.3.1 | 2026-09-15 | 01 | phân trang có số cho Posts và Archive · người đọc chọn số bài mỗi trang |
| V1.3.0 | 2026-09-15 | 00 | trang chủ giữ tối đa 6 bài · hai lối đi sang Posts và Archive |
| V1.2.9 | 2026-09-15 | 09 | khối chữ lớn căn giữa không mất chữ · gộp Zoey in cùng hàng khi co lại |
| V1.2.8 | 2026-09-15 | 08 | hướng dẫn bật đo lượt xem từng bước |
| V1.2.7 | 2026-09-15 | 07 | khối chữ lớn xén theo đường kẻ lưới · dựng lại bố cục khổ dọc |
| V1.2.6 | 2026-09-15 | 06 | đo lượt xem không cookie · đoán trước trang kế |
| V1.2.5 | 2026-09-15 | 05 | luật số phiên bản: đuôi chỉ chạy 00 đến 09 |
| V1.2.4 | 2026-09-15 | 04 | khối chữ lớn ở màn đầu · cửa vào trang giới thiệu · trích dẫn chuyển ra trang chủ |
| V1.2.3 | 2026-09-15 | 03 | soát lại toàn bộ tài liệu · viết mục hệ sinh thái Cloudflare · hướng dẫn nhập bài cũ |
| V1.2.2 | 2026-09-15 | 02 | rà lại bộ kiểm định · gộp phép kiểm trùng · thêm phép kiểm cho JS và nhãn giao diện |
| V1.2.1 | 2026-09-15 | 01 | phóng to nền thiên hà cho cân khung |
| V1.2.0 | 2026-09-15 | 00 | nhập bài cũ từ bản xuất WordPress |
| V1.1.9 | 2026-09-15 | 09 | trang chủ hai màn · nền động · quầng sáng theme tối · sửa tương phản chữ mờ |
| V1.1.8 | 2026-09-15 | 08 | nhẹ đi 63% · nén ảnh · cắt chú thích CSS khi dựng · dọn nhãn và cấu hình chết |
| V1.1.7 | 2026-09-15 | 07 | dựng trang Posts · Tags · Archive · Search · bài Chiếc gương · sổ lịch sử gom theo build |
| V1.1.6 | 2026-09-15 | 06 | chuyển sang Cloudflare · bình luận có trả lời · quote lấy từ file nguồn · sổ lịch sử ở chân trang |
| V1.1.5 | 2026-09-14 | 05 | trang giới thiệu hai khung · ô trích dẫn mỗi ngày |
| V1.1.4 | 2026-09-14 | 04 | bổ sung dữ liệu có cấu trúc · ảnh chia sẻ mặc định |
| V1.1.3 | 2026-09-14 | 03 | nháp không lên mạng · chép dài kèm nguồn · tài liệu riêng tư |
| V1.1.2 | 2026-09-14 | 02 | cấu hình Vercel · xem thử qua WiFi · tài liệu đưa lên mạng |
| V1.1.1 | 2026-09-14 | 01 | xếp lại đầu bài · khung bình luận · công cụ đưa ảnh |
| V1.1.0 | 2026-09-14 | 00 | dựng hệ chữ · nền kính · sổ phiên bản · file kiểm định |
| V1.0.0 | 2026-09-14 | 00 | dựng khung sườn · design system · bộ dựng Markdown |

<!-- BANG-KET-THUC -->

---

## V3.0.5 — 18-Sep-2026

- **Trăng khuyết nghiêng dần.** Lưỡi liềm dựng đứng là thứ chỉ có trong hình
  vẽ. Ngoài đời phần sáng luôn quay về phía mặt trời, mà mặt trời thì ở dưới
  chân trời và đi tiếp suốt đêm — nên lưỡi liềm lăn chậm quanh đĩa từ lúc trăng
  lên tới lúc trăng lặn. Đó cũng là lý do một tấm ảnh chụp trăng lúc chập tối
  và một tấm lúc gần sáng không bao giờ giống nhau về dáng.
- **Nghiêng theo cùng cái đồng hồ** đã lo đường đi chéo 15° và kỳ trăng, nên ba
  chuyển động cùng kể một chuyện. Biên độ 35° cả đêm: rộng hơn thì đĩa lật quá
  nhanh và mắt bắt ra là hình đang xoay, hẹp hơn thì như một góc đặt cứng.
- **Đo lại sau khi nghiêng** để chắc không vỡ thứ đã đúng: tỉ lệ sáng vẫn
  `0,852 · 0,499 · 0,181` đúng như trước, hướng phần sáng xoay đúng 17,2° với
  0,3 rad. Xoay thì bảo toàn diện tích, nên con số không được phép đổi.

## V3.0.4 — 18-Sep-2026

- **Bỏ dấu trang chìm ở trang bài.** Dòng `z-in-borderland.com · <tên bài>` bám
  cố định góc dưới trái đã đi, ở cả máy tính lẫn điện thoại. Nó sinh ra để ảnh
  chụp màn hình nào cũng mang theo nguồn, nhưng cái giá là một dòng chữ nằm đè
  lên bài suốt lúc đọc, ở mọi khổ màn, để phòng một việc thỉnh thoảng mới xảy
  ra. Nguồn bài vẫn còn ở chân trang và trong thẻ chia sẻ.
- **Dải `‹ ›` ở khu bình luận thôi trắng bệch.** Nó ghi cứng màu mặt thẻ, mà
  khu bình luận ở trang bài không nằm trên thẻ nào — thứ sơn màu phía sau là
  nền trang. Nay màu ấy là một biến đặt ở chính khung chứa, nên nó khớp ở cả
  trang bài lẫn tấm trượt điện thoại, và ở cả năm theme.
- **Gấp trả lời còn giữ 2 cái mới nhất, và gấp lại được.** Bản trước bung xong
  thì xoá luôn cái nút: mở nhầm một nhánh mười lăm lời đáp là không có đường
  lùi, phải tải lại cả trang.

## V3.0.3 — 18-Sep-2026

- **Ảnh căn dòng được.** Ba nút trái · giữa · phải trên thanh nổi dưới tấm ảnh,
  ghi ra `{.hep .phai}`. Chỉ bật cho ảnh HẸP HƠN cột chữ — một tấm rộng bằng
  đúng cột chữ hay tràn cả trang thì không còn chỗ trống nào để dạt về bên nào,
  nên ở hai nấc ấy ba nút tắt hẳn thay vì bấm không đổi gì. Đổi khổ thì giữ
  nguyên căn dòng.
- **Mở bài cũ ra, ảnh còn đúng khổ đã chọn.** Lớp xem trước trong khung gõ
  trước đây chỉ gắn lúc BẤM nút, nên một bài ghi `{.hep}` mở lại hiện rộng bằng
  cột chữ — người viết tưởng khổ đã mất và bấm đặt lại, ghi đè lên đúng thứ
  mình chọn lần trước.
- **Một việc, một cửa.** Ngăn Media bỏ dòng bấm-vòng "bề ngang ảnh": nó là cửa
  thứ hai vào cùng một việc, và đã bắt đầu lệch — vẫn phát ra `{.wide}` sau khi
  nấc *Rộng* bỏ khỏi thanh.

## V3.0.2 — 18-Sep-2026

- **Gõ tắt như Notion.** `# ` thành tiêu đề, `## ` thành tiêu đề con, `> `
  thành trích dẫn, `- ` thành gạch đầu dòng, `1. ` thành danh sách đánh số,
  `[] ` thành ô việc — chỉ ở đầu một khối trống, nên gõ dấu gạch giữa câu vẫn
  là dấu gạch. Lệnh phải hoãn một nhịp: gọi thẳng trong sự kiện gõ thì
  Chromium lặng lẽ bỏ qua, chữ mồi biến mất mà khối không đổi.
- **Thụt vào được ở mục ĐẦU danh sách.** Trước đây một nút chặn sẵn trả về
  ngay khi mục không có mục nào đứng trước, nên danh sách một dòng không sao
  lồng được. Nay nó tự sinh một mục cha rỗng bọc lấy — cùng cách Google Docs
  và Word làm. Phím Tab cũng đi đúng đường ấy.
- **Con trỏ hết nhảy khi đổi khối.** Đổi một đoạn thành gạch đầu dòng thì
  trình duyệt để lại cái mốc giữ con trỏ ở đoạn CŨ, rồi bước dọn dẹp xoá đoạn
  ấy — con trỏ rơi vào một nhánh đã lìa khỏi trang, gõ tiếp là mất chữ. Nay
  mốc được cứu sang mục mới trước khi đoạn cũ bị xoá.

## V3.0.1 — 18-Sep-2026

- **Dải ảnh nay cho chọn ảnh.** Bấm nút dải ảnh trước đây chỉ ra một khung
  rỗng, không có đường nào nạp ảnh vào — phải đi vòng qua nút Media rồi kéo
  từng tấm. Nay bấm một cái là khung dựng xong, con trỏ vào đúng trong khung,
  và bảng chọn ảnh của máy mở ngay.
- **Ngăn Media không còn ở đáy.** Nó vốn dựng ở cuối khối nên rơi xuống 259px
  dưới ô soạn — bấm Media xong phải cuộn lên mới thấy các lựa chọn. Nay mọi
  ngăn nằm ngay dưới thanh nút, đo được là 0px.
- **Khổ ảnh: thêm *nhỏ*, bỏ *rộng*.** *Nhỏ* bằng một nửa *hẹp*, dành cho ảnh
  chụp màn hình và icon. *Rộng* đi vì nó tràn khỏi cột chữ mà chẳng bao giờ
  đẹp; còn lại năm nấc gọn: cỡ gốc · nhỏ · vừa · hẹp · tràn.

## V3.0.0 — 18-Sep-2026

- **Khu bình luận thôi dài vô tận.** Quá bốn lời đáp thì gập lại còn một dòng
  *Xem thêm n lời đáp* — đủ để biết có gì bên dưới mà không phải cuộn qua.
  Bản thân khu bình luận cũng không cao quá nửa màn hình nữa, phần dư cuộn bên
  trong; và quá 10 bình luận một trang thì có `‹ ›` để sang trang. Giống hệt
  nhau ở máy tính và điện thoại — cột bên hẹp 320px là chỗ chật nhất, mà nó
  lại xuất hiện ở màn hình RỘNG nhất, nên đo bề ngang màn hình là đo nhầm;
  chỗ này đo bề ngang của chính cột.
- **Trăng chạy trọn một kỳ.** Trước nó là một đĩa tròn suốt đêm. Nay tròn →
  khuyết → bán khuyết → lưỡi liềm theo đúng đường đi, dựng bằng nửa hình tròn
  ghép nửa hình elip — bán trục đúng bằng `r·cos θ`, nên vệt tối cong đúng như
  trăng thật chứ không phải một nhát cắt thẳng.
- **Trăng sâu và mềm hơn.** Thêm một lớp sáng nhoè ở rìa và một chút vân đĩa,
  bớt độ gắt của mép.

## V2.9.9 — 18-Sep-2026

- **Khổ ảnh có năm nấc, thêm "cỡ gốc".** Cùng nếp với ô soạn thư: chọn nấc chứ
  không kéo góc. Nấc *cỡ gốc* là thứ trước đây không có — mặc định mọi ảnh bị
  kéo rộng bằng cột chữ, nên một tấm chụp màn hình rộng 320px bị phóng lên
  720px và mờ nhoè mà không có cách nào bảo "để yên". Mỗi nấc nay kèm một dòng
  giải thích khi rê vào, và mỗi dạng dải ảnh cũng vậy.
- **Khối mã chèn được.** Bấm nút khối mã rồi chọn ngôn ngữ chỉ ra một khoảng
  trắng — trình duyệt đổi `<pre>` thành một thẻ rỗng nằm trong đoạn văn, và
  Markdown xuất ra mất sạch phần mã. Nay dựng thẳng tay, không nhờ trình duyệt.
  Nút đường kẻ cũng thôi để lại một thuộc tính rác.
- **Rà nốt thanh nút.** Đã thử từng cái như người dùng: tiêu đề, trích dẫn,
  đậm nghiêng, gạch, mã giữa dòng, tô sáng, mũ trên dưới, căn dòng, xoá định
  dạng, khối `:::`, bảng, và dán từ Word — chỗ dán rửa sạch `MsoNormal`, thẻ
  `<style>` và mọi kiểu dáng của Word mà vẫn giữ chữ đậm.

## V2.9.8 — 18-Sep-2026

- **Thẻ chia sẻ hết trơ.** `og:image:width/height/type/secure_url/alt` là thẻ
  CON của `og:image` và phải nằm liền ngay sau nó, mà `og:locale` với
  `twitter:card` lại chen vào giữa. Bộ quét dễ tính (Facebook, kể cả công cụ
  debug của họ) tự nối lại nên mở ra thấy đủ ảnh đủ chữ; bộ quét chặt (Zalo,
  LinkedIn, iMessage) thì bỏ cả thẻ, ra đúng một dòng link trơ. Đó là lý do
  "debugger đủ info mà share vẫn trơ".
- **Ô soạn có nút Xem thử.** Dựng bằng CHÍNH bộ dựng của trang chứ không phải
  một bản viết lại — nên nó không thể nói lệch với bài thật. Thấy được ba thứ
  ô soạn không cho thấy: đoạn đầu thành sapo, khối `:::` thành ô nhấn có màu,
  và bề ngang cột chữ thật. Kèm thẻ chia sẻ đúng khuôn Facebook/Zalo vẫn vẽ.
- **Dải ảnh có bốn dạng.** Trước chỉ một, và mọi tấm bị cắt vuông — sai cho
  bìa sách và ảnh chụp màn hình. Nay thêm *giữ tỉ lệ* (không cắt), *hai cột*
  (ảnh trước–sau) và *ba cột*.

## V2.9.7 — 18-Sep-2026

- **Ô việc thành một loại danh sách thật.** Nút cũ chỉ thả một ô rỗng rồi bỏ
  rơi con trỏ ra ngoài, nên gõ tiếp là chữ rơi ra khỏi ô vừa tạo. Nay nó đổi
  chính dòng đang đứng — đoạn văn, mục chấm hay mục số đều thành ô việc và giữ
  nguyên chữ lẫn bậc thụt; bấm lần nữa thì trả về đoạn văn.
- **Danh sách và thụt vào thôi ăn nhau.** Lệnh danh sách của trình duyệt kéo
  con trỏ về đầu dòng (đo được: từ ký tự thứ 8 về 0), còn lượt dọn cấu trúc thì
  làm mất luôn vùng chọn — hai cái cộng lại là chữ gõ tiếp rơi vào mục cũ và
  danh sách còn lại mục rỗng. Nay `Tab`/`Shift+Tab` thụt vào ra như mọi trình
  soạn thảo, và `Enter` trên một mục rỗng đưa ra một bậc rồi ra hẳn khỏi danh
  sách.
- **Ảnh có khổ nhỏ.** Ba khổ cũ chỉ đi một chiều — bằng cột chữ, rộng hơn,
  tràn trang — nên ảnh dọc chụp từ điện thoại thả vào bài là chiếm trọn màn
  hình mà không thu lại được. Thêm nấc **nhỏ** (62% cột chữ, căn giữa).

## V2.9.6 — 18-Sep-2026

- **Bình luận ở cột bên đọc lại được.** Khối bình luận khi dời sang cột phải
  chỉ rộng 320px — tên cộng ngày giờ đã hết chỗ, nên Reply và Edit gấp xuống
  nằm một mình một dòng, thành ba tầng. Nay dưới 460px thì hai nút ấy về cùng
  hàng với nội dung và bám mép phải; bình luận ngắn hay dài cũng cùng một
  hình. Bề rộng hỏi từ chính khối bình luận chứ không hỏi màn hình — khổ hẹp
  nhất lại nằm ở màn rộng nhất.

## V2.9.5 — 18-Sep-2026

- **Chân trang cao bằng thanh đầu trang.** Đo ra 95px so với 64px — gấp 1,48
  lần, mà nó chở ít hơn hẳn. Nay khai bằng chính `--header-h` chứ không ướm
  một cặp lề, nên hai thanh bằng nhau mãi mãi. Khoảng trên và dưới nội dung
  trang danh sách cũng về đều nhau: 56px cả hai, thay vì 56 trên và 40 dưới.
- **Trăng đi một đường chéo 15°.** Trước đây nó chỉ dâng thẳng 21px suốt hơn
  nửa vòng — không ai thấy được. Nay đi 134px ngang và 36px lên ở khổ 1169,
  đúng góc 15° ở mọi khổ màn. Mặt trời cũng hạ nhanh hơn 25%.
- **Nắng trên mặt nước bớt gắt.** Bóng mặt trời dưới nước từng tô mười ba lớp
  gradient cam chồng nhau trên một dải nước gần trắng, ra mấy cái đốm đặc.
  Hạ gần một nửa và thu cột hẹp lại.

## V2.9.4 — 18-Sep-2026

- **Khu bình luận còn hai tầng.** Tên · giờ · (Reply · Edit dạt phải) ở tầng
  một, nội dung chiếm cả bề ngang ở tầng dưới. Trước đây cả ba nằm chung một
  hàng, nên chỗ đứng của Reply phụ thuộc độ dài chữ bên trái nó: mười bình
  luận ra mười chỗ khác nhau. Nay Reply thẳng cột ở mọi hàng, và nội dung
  được cả bề ngang. Nút Send cũng thôi đổ bóng — bóng ấy tràn qua mép khung
  trên màn hẹp.
- **Gửi xong là thấy lời mình.** Trước đây bấm Send chỉ hiện một dòng "đang
  chờ duyệt", còn bình luận thì không hiện ở đâu — nên ba lượt sửa vốn đã có
  sẵn chẳng ai dùng được, vì muốn bấm Edit thì phải thấy nó. Nay nó hiện ngay
  với một huy hiệu PENDING, sửa được ba lần trong phiên ấy. Đổi lại, hai nút
  duyệt ở trang công khai gỡ đi: duyệt về hết một chỗ trong /z-admin/.
- **Trang danh sách thấy đủ chân trang.** Giữa mục cuối và chân trang từng có
  152px trống, nên /posts/ phải kéo thêm 63px và /archive/ 91px mới đọc được
  dòng bản quyền — trong khi /notes/ và mấy trang tag thì vừa khít. Còn 40px,
  và cả năm trang danh sách nay gói trong một màn.

## V2.9.3 — 18-Sep-2026

- **Nền trang About hết méo.** Từ V2.8.8 tới nay bức sơn thuỷ ở /about/ bị kéo
  cao bằng CẢ trang — 1825px so với 1002px ở trang chủ — nên mặt nước tụt khỏi
  tầm mắt và chỉ còn hai màn trời trắng. Nền động nay bám vào `.shell` ở mọi
  trang (một chỗ duy nhất, đúng như trang chủ), và khung vẽ có trần một màn
  hình rưỡi; phần trang còn lại phía dưới là mặt nước kéo dài tiếp, không có
  mép nối nào.
- **Mặt trăng hạ xuống chỗ thấy được.** Đỉnh núi xa cao nhất đo ra `0,1815`
  khung ở mọi bề ngang, nên trăng vừa hiện ở `0,215` là nằm SAU núi — nửa đầu
  đêm vốn không có mặt trăng, và không ai gọi tên được vì cuối đêm thì nó có.
  Nay nó thấy được từ khắc đầu, dâng nhẹ một quãng nhỏ, không còn kịch vào
  thanh đầu trang, và ở gần mặt nước hơn nên bóng trên nước đọc ra là bóng của
  nó.
- **Trời sao lấp lánh theo mảng.** Trước đây mỗi sao nhấp nháy một nhịp riêng,
  nên lúc nào cũng có một nửa số sao đang sáng ở khắp nơi — đọc ra là nhiễu.
  Nay sao gom thành mấy cụm thở cùng nhịp, mỗi cụm kèm một mảng sáng rất mờ:
  có lúc một vùng trời rực lên rồi lịm đi trong khi vùng bên cạnh đang lịm.
  Kèm theo, dải mực sẫm còn sót ngay trên bờ nước tan bớt (30 nấc còn 5).

## V2.9.2 — 18-Sep-2026

- **Một ý, một hình.** Trạng thái của một mục từng được vẽ ba kiểu khác nhau:
  viên thuốc `.badge` ngoài trang danh sách, chữ trần tô màu trong /z-admin/, và
  ở bàn duyệt lại thêm một kiểu nữa. Nay cả ba chỗ dùng đúng một huy hiệu, và
  biến thiên của nó gọi theo SẮC (`--warn · --ok · --bad`) chứ không theo nghĩa
  của từng bàn. Kèm theo một luật mới: chỉ đánh dấu cái LỆCH khỏi bình thường,
  nên hàng đã duyệt và bài đang hiện không còn nhãn nào.
- **Bàn duyệt có ô tick tất cả.** Mở bàn duyệt ra thường là mươi cái spam giống
  hệt nhau; trước bản này vẫn phải tick từng dòng cho một quyết định duy nhất.
  Ô ấy cũng lấp nửa trái thanh công cụ, nên hàng chip lọc ở ba ngăn Post ·
  Comment · Category nay dạt phải đều nhau thay vì mỗi ngăn một kiểu.
- **Bớt một thứ, dọn một thứ.** Ngăn Post bỏ ô chọn chuyên mục — ô tìm ngay
  cạnh vốn đã soi cả tiêu đề lẫn tên mục. Con số tổng của ngăn Category xuống
  góc phải chân bảng, nơi nút `‹ ›` sang trang sẽ vào khi danh sách dài ra.

## V2.9.1 — 18-Sep-2026

- **Bờ nước thôi là một đường kẻ.** Bản trước cắt đất phẳng ngang ở mép nước để
  khỏi có quả đồi ngập trong hồ; nó chữa được chuyện ấy mà tạo ra một đường
  ngang tuyệt đối chạy suốt khung — thứ duy nhất trong bức có một đoạn thẳng,
  và đọc ra là "đây là bờ nè". Nay mực TAN dần qua mép nước, nên ranh giới của
  đất vẫn là chính đường sống uốn lượn của nó.
- **Mặt trăng hiện ra trên điện thoại.** Cỡ hai thiên thể trước đây tính theo
  cạnh NGẮN của khung. Ở khổ ngang cạnh ngắn là chiều cao, hợp lý; ở khổ dọc nó
  là bề ngang, nên đĩa co lại hơn một nửa và mặt trăng thành một điểm 20px mờ
  trên một khoảng trời rộng — trên điện thoại thì đọc ra là không có mặt trăng.
  Trăng cũng dâng nhẹ suốt đêm thay vì đứng một chỗ, và đêm nay dài gần gấp đôi
  chặng ngày.
- **Sửa méo mặt trời/mặt trăng mà không đụng bố cục.** Bản trước chữa bằng một
  luật CSS, và luật ấy làm nền thôi phủ cả trang mà co về một khối có mép vuông
  ngay giữa trang giới thiệu. Nay chữa ở chỗ đúng: bộ đệm đo theo chính canvas
  chứ theo khối bọc — hình tròn là hình tròn, còn độ phủ để CSS quyết.

## V2.9.0 — 18-Sep-2026

- **Mục lục trang chủ xếp theo lượt xem.** Ô đầu là bài mới nhất, hai ô sau là
  hai bài được xem nhiều nhất mọi thời điểm, và không ô nào trùng ô nào — bài
  mới nhất mà cũng là bài nhiều lượt xem nhất thì hai ô sau tự lấy bài kế tiếp.
  Lượt xem nằm trong cơ sở dữ liệu nên chỉ đọc được lúc chạy, còn trang chủ thì
  dựng sẵn; vậy nên trang mở ra có ngay ba bài mới nhất rồi hai ô sau đổi chữ
  một nhịp. Không có mạng thì nó giữ nguyên ba bài mới — vẫn là một mục lục
  đúng nghĩa.
- **Sửa méo mặt trời và mặt trăng ở trang giới thiệu.** Nền động của trang tĩnh
  bị căng ra bằng cả trang thay vì bằng khối chứa nó — cao gấp 1,44 lần — nên
  hai cái đĩa tròn bị kéo thành bầu dục. Nền cũng tự dựng lại khi khối đổi cỡ
  vì phông hay ảnh vào muộn, thay vì chỉ dựng lúc mở trang.
- **Nền 霜降 và bàn duyệt.** Mặt trời trước đây to-và-đỏ hai lần một vòng, nên
  cú lại gần xảy ra hai lượt mà lượt sau không kể thêm gì; nay đúng một lượt
  rồi sang mặt trăng. Sườn núi cũng thôi chạy tiếp xuống dưới mặt nước — chỗ ấy
  trước đọc ra như một quả đồi đang ngập trong hồ. Ở trang quản trị, bỏ dòng
  "Waiting for review (n)" vì nó nói lại đúng con số mà chip "Pending n" ngay
  dưới đã nói, và nhãn ba ngăn về thẳng mép trái của trang.

## V2.8.9 — 18-Sep-2026

- **Nền 霜降 vẽ lại lần nữa, theo hướng khác V2.8.8.** Bản kia đi tìm trọng
  lượng: mực đậm, nét sống rõ, mỗi dãy một sắc riêng. Đo lại đời nền cũ mới thấy
  hướng ấy sai — chỗ đậm nhất của bản được yêu thích chỉ tới 201 trên thang 255,
  mà nó phủ tới 56% khung. Không khí của lối vẽ này không đến từ chỗ nào đậm, nó
  đến từ một trường mực rất nhạt trải rộng. Nay mực nhạt hẳn, núi kéo lại gần,
  mặt nước chiếm một phần tư khung, và đường sống quay về kiểu cong mềm (đã thử
  ba kiểu sắc hơn — đỉnh nhọn nào cũng thành một mũi chỉ vào chữ).
- **Mặt trời không đi qua trời nữa.** Thay vì mỗi thiên thể đi một cung rồi
  lặn, cả hai đứng một chỗ trong khoảng trống bên phải: trời sẫm dần, mặt trời
  nhạt đi, mặt trăng hiện lên đúng tại đó. Một cái đĩa trôi ngang khung kéo mắt
  đi ngang đúng lúc đang đọc một dòng — và phần lớn vòng bảy mươi giây thì nó
  nằm thấp sau núi, chẳng ai thấy gì.
- **Trời đêm hết lấm tấm, và núi nổi lên khỏi trời.** Ba chỗ hỏng: dải chuyển
  trời đêm có một quãng lõm ở chân trời nên mắt đọc ra một vệt sáng ngang; mây
  vẽ sau lớp trời nên mỗi đám chọc một lỗ xuống tận mặt giấy thành một cục sáng;
  và lớp phủ lên núi dày quá nên trời với núi chỉ chênh nhau bốn nấc xám. Nay
  chênh 38 nấc, và sao chuyển sang vẽ bằng cách lấy mực đi thay vì đổ mực vào —
  một chấm đậm hơn nền trời đêm thì đọc ra là bụi trên giấy, không ra là sao.

## V2.8.8 — 18-Sep-2026

- **Vẽ lại nền 霜降.** Năm dãy núi giữ nguyên đường cong, đổi hết cách đi mực:
  mỗi dãy một sắc mực riêng theo khoảng cách (xa thì nhạt sắc và ngả lạnh, gần
  thì dồn về mực đen), và mực đậm nay **áp theo đường sống** thay vì theo độ
  cao trên khung — nên đỉnh núi đậm hơn khe núi, và hai dãy gần thôi đọc ra là
  hai thanh xám nằm ngang. Mỗi mảng còn thêm vệt rửa và vẩy cho lớp mực thôi
  phẳng đều, chân dãy nào cũng tan vào sương trước khi dãy trước nó dựng lên.
- **Nét sống núi đi bằng bút, không bằng thước.** Bề dày và độ mờ thay đổi
  theo chỗ sống cao hay thấp, sườn dốc hay thoải, cộng hai nhịp lệch tần cho
  bút có chỗ thở. Nét cũng đi bằng mực đặc hơn lớp rửa — trước đây nó nhạt hơn
  chính vệt mực nằm dưới nó, nên nhìn không ra.
- **Mặt trời và mặt trăng hết mờ, sương thì đi thành đám.** Thiên thể mờ vì
  hai lẽ: dãy núi trước đây trong suốt nên cái đĩa nằm sau núi vẫn lọt qua mà
  hiện ra, và quầng với đĩa dùng chung một dải chuyển nên đĩa bị kéo mờ theo
  quầng — nay dãy nào cũng che được (chừa 6–12% cho quầng sáng rọi qua lúc
  rạng) và quầng với đĩa đi hai lượt riêng. Sương trước là ba thanh ngang phủ
  đều suốt bề ngang, nay là mấy bệt rời trôi qua, nên núi và mặt trời **lúc mờ
  lúc tỏ** thay vì mờ đều; lớp trời ấm buổi chiều cũng dồn về quanh mặt trời
  thay vì nhuộm phẳng cả bức, và đêm nay phủ lên cả núi chứ không chỉ phủ trời.

## V2.8.7 — 18-Sep-2026

- **Tài liệu rà lại cho khớp mã.** Mỗi lượt sửa đều ghi sổ phiên bản, nhưng tài
  liệu MÔ TẢ HIỆN TRẠNG thì trôi dần: README vẫn nói "ba theme", "42 phép
  kiểm", "bốn hàm Cloudflare", `khung: A|B|C`; IA vẫn kê trang 404 và menu màn
  hẹp vào mục CHƯA LÀM, và vẫn tả bình luận chạy trên Google Apps Script;
  BINH-LUAN vẫn tả cụm nút nằm ở cuối cột phải. Đã sửa hết.
- **Hai chương mới trong DESIGN-SYSTEM.** §12.1 tả nền 霜降 — vòng ngày đêm,
  thứ tự vẽ, và bốn luật của việc vẽ bằng mực trên giấy trắng (sáng là chỗ bớt
  mực đi; muốn xoá được thì phải có gì để xoá). §22 tả ô soạn bài `.sz-*`:
  thanh nút hai hàng, ba bảng bật ra, khối `:::`, bảng thật, thanh khổ ảnh.
- **Sửa một chỗ tài liệu nói dối.** §22 bản đầu ghi "có phép kiểm canh vòng
  đổi-đi-đổi-lại của ô soạn" — không có. `sangMD`/`tuMD` cần một cây DOM mà bộ
  kiểm định chạy trong Node không dùng thư viện ngoài, nên đó vẫn là việc thử
  tay; tài liệu nay nói đúng thế và ghi rõ các bước thử.

## V2.8.6 — 18-Sep-2026

- **Bấm vào ảnh trong ô soạn là hiện thanh ba khổ** — thường · rộng · tràn —
  và khổ đang dùng sáng lên. Trước đó đổi khổ nằm sau một dòng trong bảng
  Media và bắt phải đặt con trỏ đúng cạnh tấm ảnh, mà ảnh vừa cắt xong thì con
  trỏ chẳng ở đâu cả. (Ba khổ là đúng ba khổ bộ dựng hiểu; một con số pixel
  tuỳ ý không viết ra được thành Markdown nên nó sẽ mất ở lượt lưu.)
- **Màn hình sau khi đăng gom lại một khối gọn.** Việc đã xong rồi, màn ấy chỉ
  còn trả lời hai câu và mở hai đường đi tiếp — nhưng nó đang trải năm mảnh
  rời hết bề ngang cột, với một cái nút to bằng nút Đăng. Nay là một thẻ hẹp
  có nền: dấu tích, tên bài, hai dòng nhãn–giá trị, hai nút cùng cỡ vừa.
- **Bảng trên trang có hàng kẻ xen kẽ.** Bảng bốn cột trở lên thì đọc một hàng
  là mắt đi ngang cả trăm pixel rồi quay về, và đúng chỗ quay về là chỗ nhảy
  nhầm dòng.

## V2.8.5 — 18-Sep-2026

- **Bảng trong ô soạn nay là BẢNG THẬT.** Trước đó nó chèn mấy dòng `| | |`
  vào một đoạn văn và để người viết gõ giữa hai dấu gạch — nhìn ra đúng như nó
  là: một mớ ký tự, không thấy được ô nào là ô nào, thêm một cột là phải đếm
  tay lại cả bảng. Nay bấm vào ô nào gõ ô đó, **Tab** sang ô kế, Tab ở ô cuối
  thì thêm một hàng; tới lúc lưu mới đổi ra cú pháp Markdown.
- **Khung đặt cỡ bảng thay cho câu hỏi "3x4".** Hai cặp nút cộng trừ và một
  bảng xem trước vẽ đúng cỡ đang chọn. Không còn phải dịch ý mình ra một chuỗi,
  và không còn hộp thoại của trình duyệt nhảy lên đỉnh màn hình.
- **Khối mã và khung nhấn đều có bảng chọn.** Khối mã: một bảng nói thẳng
  ngôn ngữ dùng để TÔ MÀU CÚ PHÁP, bày sẵn tám thứ hay dùng và một dòng "no
  colours". Khung nhấn: bốn loại, mỗi dòng một chấm đúng màu nó sẽ hiện ra —
  chọn màu là việc lúc chèn, nên chỗ chọn phải ở ngay chỗ chèn.

## V2.8.4 — 18-Sep-2026

- **Khối đọc tiếp ở chân bài bỏ nhãn và vạch ngăn.** Ngay trên nó đã là hàng
  tag, mà hàng tag kết thúc bằng một đường kẻ; thêm một vạch có chấm giữa rồi
  một dòng chữ hoa nữa là ba lần ngắt mạch liên tiếp trong chừng trăm pixel,
  chỉ để giới thiệu hai cái liên kết vốn đã tự mang nhãn RELATED · NEWER ·
  OLDER. Ở cột bên thì giữ nhãn — ở đó nó là tên của một mục trong cột.
- **Cụm cuối hàng meta đổi thứ tự: tim · bình luận · chia sẻ.** Chia sẻ lùi về
  cuối vì nó là việc làm SAU khi đã đọc xong và đã thích.
- **Nút chính theme Tĩnh lặng thôi loang hai hệ màu.** Dải nền nút đi từ một
  nốt lục rêu sang lam trời — trên một cái nút bo tròn cỡ nút Send thì nó đọc
  ra là một mảng loang. Nốt ấy kéo về cùng họ với lam, vẫn còn đủ ngả lục để
  dải gradient có chỗ đổi.

## V2.8.3 — 18-Sep-2026

- **Dãy núi 霜降 xếp lại, và thôi lởm chởm trên điện thoại.** Bước sóng của
  đường sống núi trước nay tính theo TỈ LỆ bề ngang, nên màn nào cũng chừng ấy
  ngọn — nhét đủ số ngọn của một màn 1400px vào một cái điện thoại 375px thì
  chúng chen nhau thành hàng răng cưa. Nay bước sóng đo bằng pixel: màn hẹp
  thấy ít ngọn hơn, mỗi ngọn vẫn rộng đúng chừng ấy.
- **Mỗi dãy có thêm một nét sống núi.** Sương xoá mực, nên một dãy chìm trong
  sương thì tan biến hoàn toàn và bức tranh mất khung. Nét mảnh chạy dọc đường
  sống giữ lại cái khung ấy: sương mỏng đi là viền hiện ra trước tiên.
- **Vòng ngày đêm nhanh hơn** (100 giây còn 70), và **nền động ở trang tĩnh
  hiện rõ hơn** — .30 lên .50. Trang giới thiệu là một lưới THẺ, mỗi thẻ có
  mặt nền riêng, nên hạ độ hiện của nền không làm chữ dễ đọc hơn chút nào; chỉ
  làm mấy cái khe giữa thẻ trống trơn.

## V2.8.2 — 18-Sep-2026

- **Mặt trời mọc từ sau dãy núi xa.** Nó nay được vẽ TRƯỚC cả dãy xa nhất, nên
  thứ hiện ra đầu tiên lúc rạng là một quầng sáng dâng lên từ phía sau cụm núi
  cao, rồi cái đĩa mới từ từ trồi khỏi đường sống. Bản trước vẽ nó sau dãy xa:
  mặt trời nhảy ra nguyên vẹn ngay từ nhịp đầu, không có chặng "rạng" nào.
- **Đĩa mặt trời vẽ lại theo đúng cách mặt trăng được vẽ** — cùng một dải
  chuyển tám chặng, khác nhau đúng ở chỗ đổ mực hay lấy mực. Ba chặng thì mắt
  bắt ra chỗ gãy ngay cả khi rất mờ, và đó là cái làm nó trông như một miếng
  dán tròn.
- **Bỏ mây, cho sương thở.** Mấy đám mây trôi ngang là ba bọng mờ chồng nhau,
  và ở độ đậm nào chúng cũng đọc ra là vệt bẩn trên giấy. Phần chuyển động nay
  dồn hết vào sương: ba dải, ba nhịp lệch nhau, lúc dày tan cả một tầng núi
  vào giấy, lúc mỏng thì nét sống núi hiện lại. Vệt sáng dưới nước cũng vẽ lại
  thành một cột những vệt ngang rời nhau, và **mặt trăng nay có bóng** — trước
  nó xoá vào chỗ không có gì để xoá nên không bao giờ hiện ra.

## V2.8.1 — 18-Sep-2026

- **Trang giới thiệu hiện tên blog trên thanh đầu.** Nó từng nằm chung nhóm
  với trang chủ — chỉ bày một đoá hoa, không có chữ. Trang chủ làm vậy được vì
  khối chữ "Zoey in Borderland" cao bằng nửa màn nằm ngay dưới; /about/ thì
  tiêu đề là "About me", nên trên cả trang không còn một chữ nào nói đây là
  blog nào. Luật nay gọn lại một câu: **thanh đầu trang chỉ giấu tên blog ở
  nơi trang đã tự nói tên nó rồi**, và đúng một trang thoả.
- **Thẻ chuyên mục thôi bị kéo cao theo hàng trên.** Sáu chuyên mục, bốn mục
  một bài, và cả bốn bỏ trống 116px dưới danh sách — gần nửa chiều cao thẻ —
  chỉ vì ở hàng TRÊN có một mục ba bài. Nay các ô vẫn khớp mép trong CÙNG một
  hàng (phần thật sự cần), còn hàng toàn mục ít bài thì được thấp lại: 245px
  xuống 155px.
- **Bộ dựng nhắc khi ảnh chân dung gần như trống.** Ô ấy chiếm gần một phần tư
  màn đầu trên điện thoại, mà một tấm chuyển sắc rỗng đi qua được mọi cửa: file
  có thật, kích thước đúng, build vẫn xanh. Nay đo số byte trên mỗi điểm ảnh;
  dưới 0,12 là nhắc, kèm hai đường ra — thay ảnh, hoặc bỏ dòng `anh:` để trang
  tự xếp lại không còn ô trống.

## V2.8.0 — 17-Sep-2026

- **Phép kiểm mới: một lớp CSS khai hai lần trong cùng một file.** `.bl-vaitro`
  được khai ở hai chỗ cách nhau bốn trăm dòng của `prose.css`; bản sau lặng lẽ
  đè bản trước, nên sửa ở bản đầu là sửa vào chỗ không ai đọc — và nó vừa ăn
  mất một lượt sửa thật. Phép kiểm chỉ báo khi hai khối cùng đặt MỘT thuộc
  tính (khai lại để thêm thuộc tính khác là chuyện bình thường), và bỏ qua mọi
  thứ trong `@media` vì ở đó đè là cố ý. Cắm lỗi thử cả hai chiều: một cặp
  trùng `position` thì đỏ, cùng cặp ấy đặt trong `@media` thì im.

## V2.7.9 — 17-Sep-2026

- **Nền động bốn theme thôi chìm.** Cánh hoa Sakura và dòng nước Tĩnh lặng vẽ
  bằng những alpha rất dè dặt, cộng thêm lớp `opacity:.9` phủ ngoài — kết quả
  là trên một màn hình sáng thường thì gần như không thấy gì. Một cái nền
  không ai thấy thì nó không phải một cái nền. Nay lớp ngoài mở hết và alpha
  bên trong nhích lên một nấc; trang giới thiệu lên .30.
- **Nền 霜降 chạy trọn một vòng ngày đêm.** Mặt trời mọc sau dãy núi bên trái,
  đi một cung lên đỉnh rồi lặn bên phải; bầu trời đổi màu theo — ửng hồng lúc
  bình minh, giấy trắng giữa trưa, một dải ấm lúc hoàng hôn, mực lạnh về đêm.
  Trăng lên khi trời tối, mây trôi hiu hiu suốt cả vòng, mặt nước nâng lên một
  nấc để hứng bóng. Một vòng chừng một trăm giây, rồi lặp.
- **Mặt trăng vẽ lại bằng phép XOÁ.** Bản trước là một đĩa trắng có viền mực
  và một quầng cũng bằng mực — tức là một quầng TỐI quanh mặt trăng, trên giấy
  trắng đọc ra đúng như một cái đĩa dán lên. Trên giấy, sáng chỉ có một nghĩa:
  bớt mực đi. Nay đĩa và quầng là một dải xoá tám chặng, không một nét viền.
## V2.7.8 — 17-Sep-2026

- **Điện thoại: khung bình luận giữa bài nay NỔI LÊN, không chèn vào bài.**
  Bản trước nhét khung vào giữa hai đoạn văn, ngay dưới đoạn đang đọc. Nó giải
  quyết đúng chuyện bị ném xuống chân trang, nhưng cắt bài làm đôi bằng một cái
  hộp cao gần bằng màn hình, và mỗi lần mở đóng là cả bài nhảy lên nhảy xuống.
  Nay là một tấm trượt lên từ mép dưới, có màn mờ phía sau; bấm ra ngoài hoặc
  Esc là đóng, và bài phía sau không suy suyển một pixel.
- **Khu trả lời gộp hai nhãn về một hàng.** "POSTING AS ZOEY" và "YOUR NOTE"
  từng là hai dòng chữ hoa giãn ly xếp chồng — đọc lướt xuống thì ra một cặp
  tiêu đề giống hệt nhau. Nay chúng đứng hai đầu cùng một hàng và nói bằng hai
  giọng khác nhau: trái là nhãn, phải là một câu báo tin thường. Ô gõ hạ từ
  104px xuống 88px.
- **Trang bài có dấu trang cho ảnh chụp màn hình.** Một dòng rất nhỏ, rất nhạt
  ở góc dưới trái: địa chỉ trang và tên bài. Trình duyệt không xen được vào
  lúc máy chụp màn hình, nên cách duy nhất để mọi tấm ảnh mang theo nguồn là
  một dòng luôn nằm trong khung hình. Không bấm được, và biến mất khi in.

## V2.7.7 — 17-Sep-2026

- **Bàn duyệt: thanh chọn hàng loạt thôi để bảng xuyên qua.** Thanh "2
  SELECTED · APPROVE · …" dính ở đầu bảng khi cuộn, mà nền nó chỉ đục 14% —
  nên mọi hàng bình luận trôi qua phía dưới đều hiện xuyên lên, chữ chồng chữ,
  nút chồng nút. Đứng yên thì thanh trông hoàn toàn bình thường, nên không ai
  ngờ tới. Nay nền đục hẳn.
- **Và hàng có ô tích thẳng cột lại ở khổ hẹp.** Luật lưới cho màn nhỏ đứng
  sau trong file nên nó đè mất cột ô tích: ô tích rơi vào cột ngày giờ, ngày
  giờ bị đẩy sang cột chữ, cột trạng thái tự tìm một hàng mới cho mình. Nay
  bốn ô được đặt chỗ thẳng, không để lưới tự xếp.
- **Điện thoại nới lề hai bên.** 19px trên một cái iPhone 375px là chữ gần
  chạm mép kính. Nay 23px ở 375px, 27px ở 430px; từ 516px trở lên vẫn 32px
  như cũ.
- **Cụm ba nút nổi hiện lại ngay khi ngừng cuộn.** Nó chỉ đổi trạng thái lúc
  HƯỚNG cuộn đảo chiều — mà một cú vuốt mạnh trên điện thoại sinh ra quán tính
  chạy tiếp rồi tắt dần, hướng không bao giờ đảo. Cụm trượt ra khỏi mép phải
  và nằm luôn ngoài đó. Nay hết cuộn 420ms là nó về.

## V2.7.6 — 17-Sep-2026

- **Màn đầu bỏ dòng "PROFILE →".** Thanh đầu trang đã có ABOUT; ở màn đầu nó
  là một mục điều hướng thứ hai cho cùng một chỗ.
- **Chú thích nút đổi câu sang bên phải.** Trước nó bật sang trái, tức là vào
  trong ô, đè lên nhãn và câu trích. Bên phải ô ở màn đầu là khoảng trống.
- **Dãy núi 霜降 thoải lại** — bỏ mấy đỉnh nhọn thêm ở V2.6.8.

## V2.7.5 — 17-Sep-2026

- **Nền 霜降 chốt một bản.** Một vòng chừng hai phút rưỡi: mặt trời nhỏ ở
  trên cao, hạ dần về chân dãy núi gần mặt nước, to và đỏ dần rồi khuất; sương
  ở các thung dâng lên; trăng lên bên trái, sao hiện dần và lấp lánh; rồi đêm
  nhạt đi, quay về đầu vòng. Đàn chim thưa dần khi chiều xuống.
- **Núi gần nay là vật thật.** Mực rửa trong suốt không che được gì — bản đầu
  vẽ mặt trời "sau" núi mà vẫn thấy nguyên vầng đỏ xuyên qua, và mặt nước xoá
  mực thành lỗ thủng cho mặt trời lộ ra như đang lặn xuống dưới nước. Nay tô
  một lớp GIẤY dưới mực núi gần và phủ giấy lên vùng nước: khuất là khuất.
- **Bỏ hai bản demo và đường `?nen=`.** Không còn `localStorage`, không còn
  tham số địa chỉ; nen.js ngắn đi hơn trăm dòng.

## V2.7.4 — 17-Sep-2026

- **Mười hai màu chữ.** Thêm nâu · ngọc · chàm · ô liu. Mỗi màu có bản riêng
  cho cả bốn theme, tương phản trên nền từng theme đều trên 5:1. Gõ
  `{nâu: chữ}` hay `{nau: chữ}` đều được; `ô liu` không dấu viết liền `oliu`.
- **Phép kiểm cùng bộ biến so cả 霜降.** Trước chỉ so Galaxy với Tĩnh lặng;
  thiếu một biến ở 霜降 thì chữ tô màu ấy lặng lẽ rơi về màu mặc định. Cắm lỗi
  thử — bỏ một màu khỏi khối 霜降 — là đỏ ngay.

## V2.7.3 — 17-Sep-2026

- **Bảng Blocks không còn.** Mười sáu dòng trộn ảnh, video, bảng, mã, khung
  nhấn và lớp đoạn — kèm cả một khung chỉ dẫn dài — nay tách ra: nút **Media**
  mở đúng bảy thứ về hình và video; bảng · mã · checklist · chữ nhỏ · tắt sapo
  thành nút riêng ở hàng hai. Thanh nút giờ phủ hết mọi cú pháp bộ dựng hiểu.
- **Khung nhấn: một nút, đổi loại ngay trên nhãn.** Bấm là có khối `note`; bấm
  vào chữ `note` trong khối là xoay sang tip → warn → stop, và khối đổi màu
  ngay trong khung gõ — trước đây cả bốn vẽ y hệt nhau nên bấm cái nào cũng
  như nhau.
- **Căn dòng là ba nút** trái · giữa · phải, nút của lớp đang bật sáng theo con
  trỏ. **Mũi tên quay lại** lên đầu trang viết bài, ngay trước "Write a post",
  có ở cả lúc viết mới lẫn lúc sửa; nút Back ở đáy biểu mẫu bỏ.

## V2.7.2 — 17-Sep-2026

- **Chọn bản nền 霜降 bằng địa chỉ.** `?nen=thac` hoặc `?nen=mattroi`, bấm một
  lần là nhớ luôn. Bản trước bảo mở Console gõ `localStorage.setItem(...)` —
  và đúng lần đầu tiên thì câu lệnh ấy bị dán nhầm vào terminal. Một đường dẫn
  bấm được thì không nhầm vào đâu được. (Tạm thời, cùng số phận với `nenFrost`:
  chọn xong thì xoá cả hai.)

## V2.7.1 — 17-Sep-2026

- **Logo kể lại từ đầu khi quay lại tab.** Vòng logo là một câu chuyện 27 giây
  có mở có kết. Đi tab khác mươi phút rồi quay về thì đồng hồ đã chạy qua ba
  bốn vòng, và cái đập vào mắt là một mẩu giữa chuyện — hình đang nổ tung, hay
  đang nằm im ở chặng nghỉ. Nay vắng quá **8 giây** thì kéo cả hai đồng hồ
  (CSS và SMIL) về 0. Dưới ngưỡng ấy thì chỉ chỉnh cho khớp như cũ: liếc sang
  cửa sổ khác hai giây là chuyện xảy ra suốt trong lúc đọc, và reset ở đó thì
  cú giật còn phá hơn hẳn việc bắt gặp giữa chuyện.

## V2.7.0 — 17-Sep-2026

- **Nền 霜降 vẽ lại thành một bức sơn thuỷ.** Núi đá dựng đứng, một dòng THÁC
  đổ xuống mặt nước, sương mờ nằm giữa các lớp núi xa, mấy đốt trúc ở tiền
  cảnh. Sắc lục trúc là chỗ duy nhất có màu, và rất trầm.
- **Phần chuyển động đổi từ sương sang thác.** Sương trôi ngang gần như không
  thấy được, và lý do không nằm ở chỗ vẽ sai: một MẢNG mờ trôi ngang buộc mắt
  so sánh hai vùng gần như cùng màu ở hai thời điểm — thứ mắt người rất kém.
  Nước rơi là những NÉT DỌC mảnh trong một dải hẹp, và mắt bắt chuyển động dọc
  ở độ tương phản thấp hơn hẳn (cùng cơ chế giúp ta thấy mưa qua cửa kính lúc
  trời xám). Sương nay vẽ MỘT LẦN vào tấm nền — nó là thứ tách các lớp núi ra,
  đứng yên cũng không ai thấy thiếu.
- **Kèm một bản thứ hai để chọn: mặt trời và đàn chim.** Cùng bộ núi và sương,
  đổi phần động thành một đàn chim bay ngang rất chậm, và chỗ điểm màu thành
  một vầng mặt trời thấp. Đổi qua lại bằng `localStorage` — xem `nenFrost`
  trong src/js/nen.js. **Chọn xong thì xoá bản không dùng.**

## V2.6.9 — 17-Sep-2026

- **Thanh nút ô soạn chia hai hàng CỐ ĐỊNH, theo nghĩa.** Bản trước để một
  hàng dài rồi cho nó tự rớt khi hết chỗ — nghĩa là chỗ rớt do BỀ NGANG CỬA SỔ
  quyết định: cùng một thanh, màn rộng thì `x² x₂ ⌨` nằm hàng trên, hẹp hơn
  một chút thì nó xuống hàng dưới, và không ai nhớ được nút ở đâu. Nay hàng 1
  đổi CHỮ (việc làm với phần đang bôi đen), hàng 2 đổi KHỐI (việc làm với cả
  đoạn con trỏ đang đứng) — bốn nhóm mỗi hàng.
- **Đường kẻ đọc tiếp ở cột bên thôi thò thụt.** Luật gốc đặt
  `align-items:flex-start` cho dải hai đầu, mà bản cột bên chỉ đổi chiều thành
  cột chứ không đổi cái đó — nên mỗi dòng rộng đúng bằng tên bài trong nó, và
  sợi kẻ dài ngắn theo. Đây là lần thứ hai cùng một kiểu lỗi (lần trước là
  `align-items:baseline` ở cùng khối này).
- **Khung trả lời gọn lại.** Hai ô Tên và Email chiếm gần một nửa chiều cao
  khung soạn, mà chúng hỏi đúng một câu máy đã biết câu trả lời — tên lần
  trước đã lưu ở `localStorage`. Nay gấp thành một dòng "Posting as Mai ·
  change"; khung từ chừng 400px còn **298px**. Ai chưa từng bình luận thì vẫn
  thấy hai ô như cũ.

## V2.6.8 — 17-Sep-2026

- **Sương trên nền 霜降 nay mới thật sự thấy được.** Bản trước vẽ mây bằng màu
  TRẮNG chồng lên, và nó không bao giờ hiện ra — lý do hiển nhiên khi nói
  thành lời: canvas nền trong suốt nằm trên một trang GIẤY TRẮNG, nên tô trắng
  lên nó là tô trắng lên trắng. Nay dùng `destination-out`: sương XOÁ mực núi
  đi, giấy trắng phía sau hiện ra. Đó đúng là cách mây được vẽ trong tranh
  thuỷ mặc — chỗ trắng là chỗ CHỪA LẠI, không phải chỗ tô thêm.
- **Thêm hai ngọn núi cao ở xa.** Nếp núi dựng bằng tổng sin thì ra một dải
  đồi trải đều — làm nền thì được, nhưng không có gì để mắt đậu. Hai ngọn cao
  cho cả bức một điểm nhìn, và mây che ngang lưng một ngọn núi mới là hình ảnh
  làm nên bức tranh.
- **Núi xa tô NGƯỢC với núi gần.** Núi gần nhạt ở đỉnh, đậm xuống chân. Núi xa
  thì đậm nhất ngay tại đường sống rồi nhoè xuống — tô như núi gần thì cái
  đỉnh, thứ duy nhất làm nó ra một NGỌN NÚI, lại là chỗ mờ nhất và cả hình tan
  thành một vệt loang không có dáng. Kèm theo, vài vệt sương mỏng vẽ thật ở
  nửa trên màn, nơi không có mực để mà xoá.

## V2.6.7 — 17-Sep-2026

- **Bàn duyệt báo "Nothing waiting" trong khi bình luận vẫn còn nguyên.** Lượt
  thêm tính năng sửa bình luận (V2.6.1) đưa cột `soSua` vào câu truy vấn hàng
  chờ, nhưng cột ấy chỉ được `ALTER TABLE` thêm vào ở lượt POST/PUT. Trên một
  kho đã có dữ liệu mà chưa ai gửi bình luận mới kể từ lượt deploy, cột chưa
  tồn tại — SQLite ném `no such column`, và cái `catch` nuốt mất. **Không mất
  dữ liệu**, nhưng nhìn thì y như mất sạch.
- **Và đây mới là lỗi nặng hơn: `catch` biến MỌI lỗi thành "không có gì".**
  Một câu truy vấn hỏng trả về đúng cái trạng thái của một hàng chờ rỗng —
  trông y hệt lúc mọi thứ đang chạy đúng, nên không ai đi tìm nguyên nhân.
  Nay chỉ "bảng chưa tồn tại" mới im lặng; mọi lỗi khác trả về `ok:false` kèm
  lời báo thật.
- Hai câu `ALTER TABLE` nay nhớ trong isolate, thôi chạy lại mỗi lượt tải.

## V2.6.6 — 17-Sep-2026

- **Đọc tiếp ở cột bên có lại đường kẻ.** Lúc đổi khối này sang dải hai đầu
  (V2.5.7) thì bỏ hết đường kẻ — đúng ở cột chữ, nơi hai gợi ý nằm CẠNH nhau
  nên khoảng trống đã nói ra là hai thứ. Nhưng ở cột bên chúng xếp DỌC, và hai
  khối chữ chồng lên nhau mà không có gì ngăn thì đọc ra như một khối bốn
  dòng — nhất là khi cả hai đều mở đầu bằng một nhãn viết hoa trông giống hệt.

## V2.6.5 — 17-Sep-2026

- **霜降 có favicon riêng.** Đoá hoa tím trên một trang giấy trắng đọc ra là
  thứ DUY NHẤT có màu trong cả cái tab. Nền xám sương, nét mực. Không dùng nền
  trắng: thanh tab chế độ sáng vốn đã gần trắng, icon nền trắng thì mất luôn
  mép bo góc và trôi vào nền tab.
- **Ảnh chia sẻ thêm tấm thứ tư.** Cùng lý do và cùng cách dựng với ba tấm
  kia — `npm run og`. Kèm theo, tấm Tĩnh lặng đổi nền theo bảng màu mới của
  theme ấy (V2.5.9).
- **Ảnh bìa tự sinh thêm hai cặp màu giấy–mực.** Tỉ lệ nay 6/3/3/2: 霜降 chỉ
  hai cặp vì nó gần như không có màu, mà bốn tấm giấy trắng liền nhau trong
  một feed thì lại đúng cái "trùng nhau" mà bảng cặp này sinh ra để tránh.

## V2.6.4 — 17-Sep-2026

- **Ô trích dẫn còn hai phông.** Nó từng dùng ba: Oswald cho nhãn, Cormorant
  nghiêng cho câu, và phông thân bài cho tên tác giả — ba giọng trong một ô
  cao chưa tới hai trăm pixel. Tên tác giả không phải chữ ĐỂ ĐỌC; người ta
  liếc nó để biết câu kia của ai, đúng việc của một cái nhãn. Nay nó mặc cùng
  bộ đồ với "QUOTE OF THE DAY" ngay trên và "READ ON" ngay dưới.
- **霜降 điểm một chút màu.** Hai quầng nền thuần xám đổi thành một ngả lam
  bạc, một ngả ấm rất nhẹ — hai đầu một trục, nên mặt giấy có chiều thay vì
  phẳng đều. Cả hai đều dưới bốn điểm bão hoà: nhìn riêng không ai gọi được
  tên màu, mà bỏ đi thì thấy ngay là thiếu.
- **Mây lềnh bềnh thay vì trượt ngang đều.** Mỗi dải nay có pha riêng, một
  biên độ dập dềnh dọc tính theo cỡ dải, và tốc độ ngang thở theo cùng nhịp
  ấy. Dùng CHUNG một sóng cho cả hai chuyển động — hai sóng lệch nhau thì dải
  mây bò thành hình số tám.

## V2.6.3 — 17-Sep-2026

- **Dàn tiêu đề thôi nhảy cóc — 30 trang cùng lúc.** Tiêu đề trên thẻ bài để
  `<h3>` trong khi trên nó chỉ có đúng một `<h1>`, nên mọi trang chuyên mục và
  trang tag đều nhảy h1 → h3. Không ai thấy, vì trên màn hình nó vẫn là chữ to
  chữ nhỏ đúng thứ tự — chỉ cái DÀN Ý là sai, và người đi bằng phím tắt tiêu
  đề của trình đọc màn hình gặp một bậc trống. Nay `<h2>`; cỡ chữ không đổi.
- **Rà lại toàn bộ liên kết và cấu trúc SEO.** 888 liên kết trên 48 trang: **0
  liên kết nội bộ gãy**, mọi ảnh có `alt`, mọi trang đủ title · description ·
  canonical · og:image · một `<h1>` · `lang`.
- **Hai phép kiểm mới** (#65 cân nặng chữ, #66 dàn tiêu đề), đều đã tiêm lỗi.
  Một phép kiểm thứ ba viết ra rồi gỡ đi — bộ kiểm đã có "Không có liên kết
  nội bộ gãy" làm đúng việc ấy.

## V2.6.2 — 17-Sep-2026

- **Ô soạn thảo có căn dòng.** Một nút xổ ra bốn chế độ: đều hai bên (mặc
  định), trái, giữa, phải. `{.trai}` và `{.phai}` là hai lớp mới ở khung đọc
  bài; `{.giua}` vốn đã có.
- **Thanh nút gom nhóm, xuống hàng nguyên cụm.** Thanh vốn đã tự rớt xuống
  hàng hai, nhưng mỗi nút là một ô rời nên chỗ rớt rơi vào GIỮA một nhóm —
  "B I 🔗" thành "B I" ở hàng trên và "🔗" ở hàng dưới, còn vạch ngăn thì
  đứng lạc một mình. Kèm theo, sửa hai lỗi của lượt tách CSS:
  `.sz-nut--khoi{width:auto}` nằm ở `admin.css` mà `.sz-nut{width:28px}` ở
  `soan.css` — gói nạp admin trước nên luật gốc đè luật phụ, và chữ "BLOCKS"
  tràn khỏi nút đè lên vạch bên cạnh. `.sz-khoi-ma` thì chưa từng có luật nào.
- **Bảng tới 5×20, và chỉnh được bề rộng cột.** Bảng vốn luôn chèn đúng 2×2.
  Nay hỏi cỡ. Bề rộng cột đọc từ SỐ DẤU GẠCH ở hàng ngăn (`|---|------|` →
  cột hai rộng gấp đôi) — không phải cú pháp mới phải học, và bảng nào gạch
  đều thì không sinh `<colgroup>` nên mọi bảng cũ không đổi một pixel.

## V2.6.1 — 17-Sep-2026

- **Bàn duyệt thẳng cột ở bộ lọc All.** Mỗi hàng là một LƯỚI RIÊNG, nên hai
  cột cuối để `auto` thì mỗi hàng tự tính bề rộng theo chữ của chính nó:
  "PENDING" rộng hơn "LIVE" nên cả cột nút phía sau lệch theo. Chỉ lộ ra ở
  **All**, vì hai bộ lọc kia mỗi cái chỉ có một loại trạng thái. Nay cột trạng
  thái rộng cố định, và ruột thanh gộp thẳng mép với hàng bên dưới.
- **Nút Reply có ở MỌI thẻ.** Trước chỉ ở bình luận gốc, nên trả lời của một
  trả lời thì không bấm được vào đâu — muốn nói tiếp với người vừa trả lời
  mình thì phải cuộn ngược lên và tự gõ tên họ vào. Cây vẫn hai tầng như cũ.
- **Bấm khu bình luận là xổ full khung, và sửa được lời đã gửi.** Khi đóng thì
  cả dòng "NOTES 2" cũng biến mất, nên cuối bài không còn gì nói rằng bài này
  có bình luận — lối vào duy nhất là một icon 24px ở đầu bài. Nay dòng ấy ra
  ngoài và chính nó là nút. Kèm theo: sửa được lời mình **tối đa 3 lần**, xác
  thực bằng một mã ngẫu nhiên lưu ở máy người gõ (máy chủ chỉ giữ bản băm), và
  sửa xong thì bình luận về lại hàng chờ duyệt.

## V2.6.0 — 17-Sep-2026

- **Theme thứ tư: 霜降.** Nền trắng, mực đen, không một màu nào — ba theme kia
  đều nhuộm ảnh trong bài, mà một tấm ảnh nằm trên nền hồng đọc ra khác hẳn
  khi nó nằm trên nền trắng. Đây là theme để **nhìn ảnh và đọc lâu**. Nền động
  là mây trôi ngang qua ba nếp núi thuỷ mặc: núi vẽ một lần vào canvas phụ rồi
  dán mỗi khung, chỉ mây là vẽ lại thật. Mây màu TRẮNG — trên giấy trắng nó
  không tự hiện ra mà chỉ xoá bớt mực của núi, đúng cách mây được vẽ trong
  tranh thuỷ mặc.
- **Bảng lịch sử đổi sang `<dialog>`.** Nó là hộp thoại cuối cùng còn tự dựng
  lớp phủ bằng `div` + `position:fixed`, kèm ba đoạn mã viết tay cho ba việc
  trình duyệt vốn làm sẵn: nghe Escape, giam tiêu điểm trong hộp, che phần còn
  lại khỏi trình đọc màn hình. `showModal()` cho cả ba, không phải viết dòng
  nào.
- **Trích dẫn AI đệm trong D1.** Cache HTTP nằm ở từng điểm biên, mà Gemini
  **chặn theo vùng** — từ điểm biên Hong Kong nó trả `FAILED_PRECONDITION`,
  nên phần lớn lượt gọi từ Việt Nam rơi thẳng về kho câu viết sẵn. D1 thì chung
  cho mọi điểm biên: một lượt gọi thành công từ bất kỳ đâu là cất lại được, và
  cả khung giờ đọc từ đệm. Chỉ cần MỘT điểm biên không bị chặn.

## V2.5.9 — 17-Sep-2026

- **Tĩnh lặng thôi phẳng lì.** Ở nền cũ, mặt thẻ trắng chỉ nổi **1,14:1** —
  thẻ không đọc ra là thẻ và cả trang thành một mảng phẳng. Bản trước từng thử
  hạ nền rồi trả lại vì sợ mất cái "sáng mỏng"; nhưng "sáng mỏng" với "phẳng
  lì" chỉ cách nhau ở chỗ có hay không có ranh giới. Nay nền `#E9F1FA` →
  `#DCE8F5` (thẻ nổi **1,24:1**), bóng đổ đậm từ .13 lên .20 kèm một tầng bóng
  gần, và mép kính .18 → .26.
- **Nét chữ thân bài dày một bậc ở Tĩnh lặng.** Chữ đo 11:1 — thừa tiêu chuẩn —
  nhưng nét mảnh nằm trên nền sáng đều thì mắt vẫn đọc ra là "chữ tiệp vào
  nền". Đi qua một token `--w-doc` (400 ở ba theme kia, 500 ở Tĩnh lặng) chứ
  không viết một luật theme lẫn trong `prose.css`.
- **Trang About bật lại nền động, ở `.22`.** Bản trước tắt hẳn vì cánh hoa rơi
  qua sau chữ kéo mắt đi liên tục. Đúng ở độ đậm của màn hero, nhưng tắt sạch
  thì About thành trang DUY NHẤT không có chất riêng của blog. Ở `.22` thì phải
  nhìn vào khoảng trống mới thấy — tức nó chỉ hiện ra đúng lúc người ta rời mắt
  khỏi chữ.

## V2.5.8 — 17-Sep-2026

- **Tooltip nút "xem câu khác" thôi đè lên câu trích dẫn.** Nút nằm góc trên
  phải của ô, mà tooltip mặc định rơi xuống DƯỚI — tức phủ lên hai ba chữ đầu
  của chính câu đang đọc, đúng lúc người ta vừa đưa chuột tới. Nay nó sang
  TRÁI, ngang hàng với dòng nhãn. Lúc sửa mới lộ ra một lỗi nặng hơn: chấm
  "còn lượt" thêm ở V2.5.1 vẽ bằng `::after`, mà tooltip cũng dựng chữ bằng
  `::after` — một phần tử chỉ có MỘT `::after`, nên **tooltip trống chữ suốt
  từ đó**. Chấm chuyển sang `::before`.
- **Giờ bình luận về liền sau tên người viết.** Trước nó nằm trong cụm dạt
  phải cùng nút Reply — mà mép phải là chỗ di động: bình luận ngắn thì giờ nằm
  giữa hàng, bình luận dài thì nó rớt xuống dòng dưới. Mười bình luận là mười
  cái giờ ở mười chỗ. "Ai nói" và "nói lúc nào" là một cặp, nay đứng liền nhau
  và thẳng cột qua mọi thẻ.
- **Nhớ tên người đã bình luận, và trần 12 trả lời mỗi nhánh.** Tên với email
  lưu ở `localStorage` trên máy người đọc — không gửi thêm gì lên máy chủ, và
  chỉ điền khi ô đang trống. Nhánh chạm 12 trả lời thì nút Reply đổi thành
  "Start a new thread" và đưa về khung soạn chính: không khoá ai nói, chỉ cho
  cuộc trao đổi dài thở ở chỗ khác thay vì nhồi tiếp vào một cột đã hẹp.

## V2.5.7 — 17-Sep-2026

- **Ba khung đổi tên: `post left` · `post full` · `post insta`.** Trước gọi là
  `A` · `B` · `C` — ba chữ cái không nói gì, muốn biết `B` là gì thì phải mở
  tài liệu ra tra, mỗi lần viết bài lại tra một lần. Tên cũ vẫn nhận để bài cũ
  khỏi sửa. Lớp CSS đổi theo: `.khung-a` thành `.post-left`.
- **Mọi bài hiện dùng `post left`.** Bài "Thứ bảy, không có gì" vốn là khung
  băng ảnh; ba tấm ảnh của nó không mất mà chuyển vào một dải ảnh trong thân
  bài — bộ kiểm định bắt ngay ba tấm thành ảnh mồ côi lúc đổi khung.
- **Khối đọc tiếp bày như cặp lùi/tới, ở mọi khổ màn.** Trước là hai dòng xếp
  dọc, mỗi dòng có cột nhãn rộng 120px chở đúng một chữ — và chữ ấy LẶP LẠI ở
  cả hai dòng. Mà `docTiep` luôn đúng bằng 2, còn `post insta` đã có sẵn hình
  cho đúng tình huống ấy. Nay mượn lại, không dựng khung mới: **116px còn
  73px**, mũi tên khoá theo VỊ TRÍ chứ không theo nhãn (hai bài cùng "related"
  thì khoá theo nhãn sẽ cho hai mũi tên cùng chiều).

## V2.5.6 — 17-Sep-2026

- **Chữ đậm trong bài thôi là nét bịa.** Bộ phông tự host chỉ có cân nặng
  400 · 500 · 600 — không có face 700 nào. Mà trình duyệt cho `<strong>` và
  `<b>` cân nặng 700 theo **mặc định**, và `prose.css` không đặt lại. Nên mọi
  cụm chữ đậm trong mọi bài đều là nét trình duyệt tự bịa: vẽ đè chính chữ ấy
  lệch đi vài phần pixel. Nét bịa nhoè nhất đúng ở chỗ tiếng Việt cần rõ nhất —
  dấu mũ, dấu móc, dấu thanh chồng lên nhau. Đo được 30 cụm trên một bài.
  Nay lấy 600, tức nét đậm THẬT mà 84 luật CSS khác đang dùng.
- **Luật ba họ phông ghi thành văn.** `docs/DESIGN-SYSTEM.md` §2.0: ba họ tải
  về (Oswald · Cormorant Garamond · Be Vietnam Pro) cộng một họ máy chữ của
  máy, cố ý không tải file nào — đó là lý do bảng lịch sử trông như dùng phông
  thứ tư. Kèm ba luật phải giữ, và câu trả lời cho "có cần xoá gì khỏi kho mã
  không": **không** — 33 file thuộc đúng ba họ, mọi cân nặng đều có chỗ dùng.
- **Phép kiểm #65** đọc thẳng `fonts.css` để biết có những face nào, rồi chặn
  mọi luật xin một cân nặng không face nào đỡ. Tải thêm cân nặng thì nó tự nới
  theo, không phải sửa phép kiểm.

## V2.5.5 — 17-Sep-2026

- **Một script đang hỏng lặng, không ai biết.** `docs/logo/dung-logo-dong.mjs`
  đọc `dist/assets/style.css` — cái tên của thời mọi trang tải chung một file.
  Từ lượt chia CSS theo loại trang thì không còn file nào tên thế, và script
  ném ENOENT. Nó không nằm trong `npm run build` cũng không nằm trong
  `npm run kiem`, nên phải có người chạy tay mới thấy. Nay nó đọc `<link>` của
  trang đã dựng, và **phép kiểm #63** cấm mọi chỗ gõ cứng tên file trong
  `dist/assets/` — tên ấy mang vân tay nội dung, đổi mỗi lượt build.
- **Một phép kiểm đã chết âm thầm.** Phép kiểm "hai nửa hoạt hình logo chạy
  cùng nhịp" cũng tìm `style.css`, không thấy, rồi `return []` — tức là nó
  xanh mãi mãi, không đỏ được nữa. Nay nó đọc đúng gói `nen`, và thiếu gói thì
  BÁO LỖI chứ không bỏ qua: một phép kiểm không chạy được phải nói ra, không
  thì nó chỉ là một dòng xanh dối.
- **§7 FILE NÀO CHỨA GÌ viết lại.** Bảng vẫn liệt kê 8 file và vẫn nói build
  gộp tất cả thành một `assets/style.css`; năm file mới không có tên trong đó.
  Nay đủ 13 file, 6 gói, và bảng "trang nào lấy gói nào" kèm số KB thật.
  **Phép kiểm #64** buộc bảng ấy khớp với `src/styles/` và với `GOI_CSS`.
  Kèm theo: `VIEC-DANG-CHO.md` bỏ bảng "đã xong" chép lại sổ phiên bản, và
  năm chỗ trong tài liệu còn ghi số hai tầng cũ đã đổi sang ba tầng.

## V2.5.4 — 17-Sep-2026

- **Bảy bộ luật cho một dòng báo tin, gom về một.** Mỗi chỗ cần nói một câu
  với người dùng đều tự dựng lấy một bộ riêng — bốn cỡ chữ, ba màu nghỉ, hai
  chữ cho cùng một nghĩa (`--loi` một chỗ, `--hong` sáu chỗ), hai tên gốc.
  Xếp cạnh nhau mới lộ **hai chỗ hỏng thật**: `.vb-noi--hong` tô màu nhấn chứ
  không phải màu lỗi, nên báo lỗi ở ô viết bài hiện **màu tím**; còn
  `.bl-duyet-bao--hong` không có luật nào, nên báo lỗi ở bàn duyệt không đổi
  màu gì cả. Nay một cụm `.bao` lo mọi trạng thái.
- **Bốn bộ cho câu "chỗ này không có gì", gom về một.** `.ds-trong` và
  `.bl-trong` giống nhau tới từng thuộc tính, chỉ khác lề — một bản sao chép
  nguyên xi mà không ai nhớ. Nay `.trong` và `.trong--cho`: "rỗng" là câu kết
  nên viết nghiêng, "đang chờ" là câu tạm nên viết thẳng và nhỏ hơn.
- **Khung cắt ảnh nằm nhầm file.** 74 dòng `.sz-cat-*` ngồi trong `list.css` —
  file của trang danh sách công khai — nên mọi trang danh sách tải CSS cắt ảnh
  mà không bao giờ dùng. Chuyển về `soan.css`; trang chủ nhẹ đi 2 KB. Cả hai
  cụm ghi ở `docs/DESIGN-SYSTEM.md` §21, và **phép kiểm #62** chặn việc lớp phụ
  tự khai trạng thái hay quên gắn lớp gốc.

## V2.5.3 — 17-Sep-2026

- **Bảng lịch sử đủ ba tầng `Vx → Vx.y → Vx.y.z`.** Tầng đầu trước đây bày
  thẳng mười sáu ĐỢT ngang hàng nhau — mắt phải đọc hết rồi tự ghép lại thành
  hai nhóm. Nay tầng đầu đúng hai dòng, `V2` và `V1`, mỗi dòng nói luôn nó chở
  mấy đợt và mấy bản. Ngày cũng in gọn lại: `15–16 Sep 2026` thay cho
  `2026-09-15 → 2026-09-16`, nên cột mô tả thôi bị bóp còn hai ba dòng.
- **Đọc tiếp ở khổ hẹp thành một dải hai đầu.** Hai gợi ý vốn xếp dọc, mỗi cái
  ba dòng cộng sợi kẻ — một khối cao gần bằng màn hình chỉ để chở hai cái tên.
  Mà `docTiep` luôn đúng bằng 2, nên nay bày như cặp lùi/tới của khung ảnh:
  một dải 68px, mũi tên quay ra hai bên, tên bài cắt bằng dấu ba chấm.
- **Tên blog ở khổ hẹp nghỉ thì mờ, chạm mới sáng.** Khổ ngang để khối chữ ở
  `.17` làm nền rồi sáng lên `.96` khi rê vào; khổ hẹp trước đây khoá cứng ở
  `1`, nên không còn cú chuyển nào và khối chữ đè lên mọi thứ khác trên màn
  đầu. Nay cùng một nếp, và có đủ ba đường thu lại: chạm ra ngoài, cuộn khỏi
  màn đầu, hoặc kéo cửa sổ rộng quá ngưỡng.

## V2.5.2 — 17-Sep-2026

- **Thẻ bình luận: giờ GMT+7, và hết nút trùng.** Ngày nay kèm giờ:phút, luôn
  tính theo giờ Việt Nam bằng `Intl` — một bình luận gõ lúc 23:30 mà người đọc
  ở châu Âu thấy đề hôm trước thì hai người đang nói về hai buổi tối khác nhau.
  Nút duyệt của chủ trang chuyển lên cụm bên phải hàng đầu; trước đó chúng treo
  ở cuối thẻ, tức là DƯỚI cả nhánh trả lời, nên rê vào một trả lời là hiện ra
  `Unapprove Hide Unapprove Hide` trên một dòng, không biết cặp nào của ai.
- **Ô soạn dời vào thẻ nay bung hết bề ngang.** Bấm Reply thì ô soạn được dời
  vào trong thẻ ấy, mà thẻ là một hàng flex — nên ô soạn co lại vừa bằng bề
  ngang nội dung và ngồi chen bên phải tên người gõ, hẹp hơn cả lúc nó nằm ở
  chân trang.
- **Khổ hẹp mở khung bình luận ngay tại đoạn đang đọc.** Không có cột bên để
  mượn, nên khung vốn ở lại chân bài, và bấm nút giữa một bài ba nghìn chữ là
  bị ném xuống tận đáy trang. Nay khung chèn thẳng vào bài, ngay dưới đoạn đang
  đọc; đóng lại là bài liền mạch như cũ.

## V2.5.1 — 17-Sep-2026

- **Hai lỗi cú pháp CSS nuốt mất luật.** Lúc tách `list.css` ra bốn file,
  `admin.css` mất dòng mở của một khối chú thích — dấu đóng còn lại thành rác,
  và trình duyệt bỏ luôn khối luật ngay sau nó, đúng `.ad-thanh`. Thanh công cụ
  ở /z-admin/ thôi là flex: ô tìm giãn hết bề ngang, hàng chip lọc rơi về bên
  trái. `soan.css` thì đứt hẳn phần đuôi, để lại một chú thích mở lơ lửng và
  hai lớp của nút màu mất sạch hình dạng. Build vẫn chạy, không cảnh báo gì.
- **Ô trích dẫn tách thành file riêng.** Nó khai trong `about.css` từ hồi mọi
  trang tải chung một file CSS, mà nó còn ở màn hero TRANG CHỦ — nơi không tải
  file ấy nữa. Câu trích dẫn mất phông nghiêng Cormorant, mất cặp dấu ngoặc kép
  hai đầu, nút xem câu khác rơi xuống đáy ô. Nay nút ấy nằm góc TRÊN phải (câu
  dài ngắn không đều, góc dưới thì nút nhảy chỗ theo từng câu), viền ô lấy mép
  kính như mọi khối khác, và câu vừa xin về mang nhãn `· mới` thay cho `· thêm`.
- **Hai phép kiểm chặn đúng hai lỗi đó.** Một phép quét cú pháp mọi file CSS —
  chú thích mở không đóng, dấu đóng thừa, ngoặc lệch. Một phép soi LUẬT TRẦN
  `.C{…}`: trang nào dùng một cụm thì gói CSS của trang phải có luật gốc của
  cụm ấy. Soi bằng tên lớp không bắt được, vì `list.css` vẫn nhắc `.q-chu` ở
  luật `.hero-quote .q-chu{font-size}` nên tên lớp coi như có đủ.

## V2.5.0 — 17-Sep-2026

- **CSS chia theo loại trang.** Trước đó mọi trang tải một file 122 KB, mà đo
  bằng cách thử từng bộ chọn trên từng trang thì **64–79% số luật không khớp
  được gì** — luật của ô soạn thảo gửi tới người đọc bài, luật của màn hero gửi
  tới trang quản trị. Nay năm gói: nền · danh sách · bài · giới thiệu · quản
  trị. Trung bình **122 → 89 KB**, trang bài còn **84 KB**. Kèm theo,
  `list.css` 2457 dòng tách làm bốn file theo việc, vì phần quản trị vốn nằm
  XEN KẼ giữa phần công khai.
- **Số phiên bản đổi sang ba tầng `Vx.y.z`.** Hai tầng thì mỗi build chỉ chở
  được mười bản — làm một ngày là hết ba build, và con số đầu nở tới mức thôi
  nói lên điều gì. 137 bản cũ đã đánh lại đúng thứ tự: mỗi BUILD cũ thành một
  ĐỢT mới (`V16.xx → V2.4.xx`). Không đệm số 0.
- **Bỏ mấy tên lớp không tạo ra luật nào.** `btn--chinh` và `hd-dau` nằm trong
  markup mà không có một dòng CSS nào — đọc mã thì tưởng có một biến thể nút
  "chính", thật ra `.btn` đã là nó. (Thử gỡ luôn `brand--dong` và `bl-chia`
  thì phép kiểm đỏ ngay: hai tên ấy không vẽ gì, nhưng là DẤU HIỆU mà bộ kiểm
  định đếm. Đã trả lại.)

## V2.4.9 — 17-Sep-2026

- **Cắt ảnh ngay trong ô soạn thảo.** Thả một tấm ảnh vào thì khung cắt mở ra
  trước khi gửi đi: kéo trong lòng để dời, kéo bốn góc để co giãn, hoặc bấm
  một tỉ lệ có sẵn (16:9 · 3:2 · 1:1 · 4:5). Thử: ảnh 1400×600 chọn 1:1 ra
  đúng 600×600 lấy ở giữa.
- **Cắt TRƯỚC khi gửi, không phải sau khi đăng.** Cú pháp Markdown của trang
  không có chỗ nào diễn đạt "cắt" — `{.wide}` và `{.full}` chỉ nói bề ngang.
  Cắt sau thì phải sinh ra một file ảnh thứ hai rồi sửa đường dẫn trong bài;
  cắt trước thì file lên kho mã đã là tấm đã cắt, bài chỉ có một đường dẫn, và
  không có tấm gốc nào nằm lại làm ảnh mồ côi.
- **Chỉ hỏi khi thả ĐÚNG MỘT tấm.** Thả năm tấm là "đưa hết vào bài": hỏi năm
  lần liên tiếp thì bốn lần sau người ta bấm bỏ qua cho xong, và cái khung ấy
  thành một cửa phải đóng chứ không phải một công cụ.

## V2.4.8 — 17-Sep-2026

- **Tiêu đề khối gõ thẳng tại chỗ.** Trước đó nó hỏi bằng `window.prompt` —
  một hộp thoại nhảy lên ĐỈNH MÀN HÌNH, cách chỗ đang gõ cả một chiều dài
  trang, và CHẶN cả trang cho tới khi trả lời. Phải quyết một cái tiêu đề
  trước cả khi viết một chữ nào trong khối, mà lúc đó thì chưa biết khối ấy sẽ
  nói gì; bấm Cancel thì khối ra không có tiêu đề và không có đường thêm vào
  sau. Nay là một ô gõ được có sẵn dòng mờ *sửa ở đây*, sửa lúc nào cũng được.
- **Thanh nút về một khổ duy nhất.** Đo được: 25 nút với **bảy** bề rộng khác
  nhau — `¶` 20px, `x₂` 24px, `H2` 27px, `B` 28px, `</>` 36px — vì hai lớp nút
  chữ khai `width:auto`. Mắt đọc ra một hàng lởm chởm chứ không phải một dãy
  nút. Nay mọi nút cùng ô 28×28; chỉ nút Blocks rộng hơn vì nó mang cả chữ.
- **Vạch ngăn trong khung gõ vẽ đúng thứ trang sẽ hiện.** Nút ấy in ra `---`,
  mà trên trang `---` KHÔNG ra một đường kẻ — nó ra ba dấu sao ✦ ✦ ✦. Khung gõ
  thì vẽ một đường kẻ ngang, nên gõ xong thấy một thứ mà đăng lên ra thứ khác.

## V2.4.7 — 17-Sep-2026

- **Bàn duyệt: tick nhiều dòng rồi làm một lượt.** Mở bàn duyệt ra thường có
  mươi cái spam giống hệt nhau và vài cái thật — bấm Approve từng dòng là mươi
  cú bấm cho một quyết định. Thanh làm-hàng-loạt dính ở đầu bảng, hiện ra khi
  có ít nhất một dòng được tick, và câu hỏi xác nhận in RA SỐ ("duyệt 12 bình
  luận?") — con số ấy là thứ duy nhất chặn được một cú tick nhầm cả trang.
- **Gửi từng cái, không gửi một gói.** Máy chủ nhận mỗi lượt một bình luận;
  dựng thêm cửa nhận cả mảng thì phải viết cả đường xử lý lỗi một-phần, mà
  "ba cái xong, hai cái hỏng" là trạng thái khó báo và khó sửa.
- **Hàng ở cả ba ngăn gọn lại: 62px → 42px.** Một màn 900px nay chứa 21 hàng
  thay vì 9. Đây là bảng để ĐIỂM DANH, mật độ quan trọng hơn dáng vẻ.

## V2.4.6 — 17-Sep-2026

- **Ba lỗi nút danh sách, cả ba đều mất chữ mà không báo.** Trình duyệt trả về
  HTML sai ở ba hình dạng khác nhau, và mỗi hình mất một thứ khi đổi ra
  Markdown: `<p><ul>…</ul></p>` nuốt cả danh sách (nút trông như hỏng);
  `<li>một<li>hai</li></li>` dính hai mục thành một dòng;
  `<ul><li>…</li><ul>…</ul></ul>` **mất hẳn mục con khỏi bài**.
- **Vì sao chúng sống lâu:** cả ba chỉ hiện ra khi SỬA BÀI ĐÃ ĐĂNG. Gõ mới thì
  chữ nằm trần trong khung, lệnh của trình duyệt dựng đúng — ai thử nút trên
  một khung trống đều thấy nó chạy.
- **Thụt vào / thụt ra chỉ chạy trong danh sách.** `indent` gọi trên một đoạn
  thường biến nó thành khối TRÍCH DẪN, trong khi cạnh đó đã có nút Trích dẫn
  thật. Hai nút ra cùng một thứ, một trong hai do nhầm.
- **Ảnh thả vào rơi đúng chỗ thả.** Trước đó nó chèn ở vị trí CON TRỎ, mà con
  trỏ đang ở đâu là chuyện của lần gõ trước — thả ảnh xuống cuối bài thì nó
  nhảy lên nối vào một dòng danh sách ở trên.

## V2.4.5 — 17-Sep-2026

- **Phông tự host.** Đo được: 27 file, 421 KB, từ hai tên miền của Google — và
  file CSS của họ nằm CHẮN NGANG, phải tải xong nó trình duyệt mới biết đường
  dẫn của từng file phông. Nay 33 file nằm trong kho, cache vĩnh viễn, và một
  trang bài **không còn gọi tài nguyên nào ngoài tên miền**. Bỏ luôn hai tên
  miền của Google khỏi CSP. Tải lại: `npm run phong`.
- **Bấm ảnh trong bài để xem to.** Ảnh nằm gọn trong cột chữ 700px; trên điện
  thoại còn 350px. Người đọc làm đúng cái phản xạ mọi ứng dụng ảnh dạy họ —
  chạm vào tấm ảnh — và trước bản này chạm vào không có gì xảy ra.
- **Bài khai ngày tương lai nay đợi tới ngày.** Trước đó `date: 2027-06-01` lên
  sóng NGAY, và vào luôn RSS với sitemap mang cái ngày ở tương lai. Viết trước
  một loạt bài cho cả tháng thì cả loạt hiện ra cùng lúc.
- **`llms.txt`** — bản đồ trang cho máy đọc: giới thiệu, rồi danh sách bài kèm
  một câu tóm tắt cho từng bài.

## V2.4.4 — 17-Sep-2026

- **86 luật CSS trỏ vào tên lớp không tồn tại ở đâu cả.** Cả một khuôn thẻ bài
  cũ (`.chu-the`), mấy tiện ích kính chưa bao giờ ai gọi (`.sheen`, `.lift`,
  `.ovp`, bốn biến thể `.glass--*`), và phần còn lại của bàn duyệt đời trước.
  Máy dò tự viết báo nhầm hai ca — `khung-b` và mấy lớp trạng thái dựng bằng
  ghép chuỗi — nên mỗi cái đều phải soi tay trước khi xoá.
- **Ảnh bìa nhẹ đi 28%.** Hoạ tiết mandala thêm ở V2.3.7 làm ảnh nặng gấp ba
  (74 KB → 212 KB): rìa nét mềm sinh ra hàng trăm nghìn sắc độ, mà zlib thì
  không nén được thứ không lặp lại. Bỏ bit cuối của mỗi kênh cắt 28% mà không
  tấm nào lộ vệt dải. Thử tiếp bước 3 và 4 thì dải màu bắt đầu gãy — dừng ở 2.
- **`npm run bia --tat-ca` thôi sinh ảnh mồ côi.** Nó dựng bìa cho MỌI bài, kể
  cả bài đang cố ý mượn bìa của bài khác và bài còn nháp — hai tấm nằm đó
  không ai dùng, và `npm run kiem` báo đúng chuyện ấy.
- **Ghi rõ trần lượt gọi GitHub.** Bảng bài ở /z-admin/ tốn 1 lượt đọc cây +
  1 lượt cho MỖI bài trong trang. Gói miễn phí của Workers cho 50 lượt gọi ra
  ngoài mỗi request, nên 20 bài/trang là an toàn còn 50 thì hỏng — và hỏng theo
  kiểu nửa bảng hiện ra không một dòng báo.

## V2.4.3 — 17-Sep-2026

- **Tên file assets nay mang vân tay nội dung** — `comments.afa8a87e.js`.
- **Mỗi lượt xem trang từng tốn 14 vòng hỏi lại máy chủ.** Một trang bài nạp
  13 file js cộng một file css; vì tên file cố định, `_headers` buộc phải khai
  `max-age=0, must-revalidate`, nên người đọc đã có sẵn mọi thứ trong máy vẫn
  phải hỏi 14 lần "đổi chưa?" và nhận 14 câu "chưa". Trên 4G độ trễ 100ms là
  hơn một giây chờ, mỗi trang. Nay cache một năm, **0 vòng hỏi lại**.
- **Làm bằng một lượt hậu kỳ, không sửa 25 chỗ gọi.** Đường dẫn assets nằm rải
  rác trong khoảng 25 chuỗi ở `tools/build.mjs` cộng ba chỗ trong `shell.html`.
  Dựng xong hết rồi mới đi một lượt trên `dist/`: đổi tên file, thay mọi chỗ
  nhắc tới. Thêm một file js mới cũng không phải nhớ gì thêm.
- **Phép kiểm cache đảo chiều theo.** Trước đó nó bắt lỗi khi `/assets/*` đặt
  cache DÀI; nay cache ngắn mới là lỗi. Kiểm cả hai vế để tên file và header
  không bên nào đổi một mình.

## V2.4.2 — 17-Sep-2026

- **Chủ trang thôi phải tự khai mình là ai.** Máy chủ nhận ra chủ trang từ lâu
  — nó đọc cặp khoá trong header rồi đóng dấu huy hiệu và cho bình luận vào
  thẳng không qua duyệt. Nhưng cái form vẫn hỏi tên và email như hỏi người lạ,
  nên phải tự gõ tên mình mỗi lần trả lời trên chính blog của mình, và gõ sai
  một chữ thì huy hiệu AUTHOR đứng cạnh một cái tên khác. Nay hai ô ấy ẩn đi,
  thay bằng một dòng *Posting as Zoey*, và tên lấy thẳng từ `site.config.json`.

## V2.4.1 — 17-Sep-2026

- **Gõ sai một đường dẫn: trước đây ra một trang TRẮNG HOÀN TOÀN.** Không tên
  blog, không menu, không một đường nào quay về — kiểm bằng `curl` trên trang
  đang chạy thì thân phản hồi rỗng. Chuyện ấy vốn hiếm, nhưng nó vừa thôi hiếm
  từ V2.3.0: chủ trang **sửa được đường dẫn bài đã đăng**, và mỗi lần sửa là
  mọi link cũ dẫn tới đó. Nay là một trang thật, và nó bày Ô TÌM KIẾM trước —
  người tới đây đang tìm một bài cụ thể, không cần một lời xin lỗi.
- **Một phép kiểm chưa bao giờ đỏ được.** "Bản nháp không lọt vào bản dựng" soi
  `noindex` trên mấy trang đã dựng — nhưng `npm run kiem` tự dựng lại một bản
  SẠCH trước khi soi, nên tới lúc nó nhìn thì nháp đã bị dọn. Nay nó đi từ
  NGUỒN: đọc front matter, lấy bài `draft: true`, rồi soi dist · sitemap · feed.
  Cắm lỗi thử (cho bộ dựng thôi loại nháp) thì nó đỏ và gọi đúng tên file.

## V2.4.0 — 17-Sep-2026

- **Trang chủ trượt ngang được 6px, ở mọi khổ màn.** Khối hero tràn lề bằng
  mẹo `calc(50% - 50vw)`, mà `vw` đo cả thanh cuộn còn `%` chỉ đo phần nội
  dung. Chữa bằng cách bỏ hẳn mẹo ấy: thẻ `<main>` ở trang chủ vốn đã rộng
  đúng bề ngang cần thiết. Đo lại chín khổ từ 320 tới 1440 trên mười trang:
  **90 lượt đo, không trang nào trượt**. (Dòng `overflow-x:hidden` trên
  `<body>` mang tên "khung an toàn" suốt nhiều bản — nó chưa bao giờ chặn
  được gì, vì `overflow` khai trên body bị đẩy lên cho khung nhìn.)
- **Ba lượt xin câu mới mỗi ngày.** Bấm "câu khác" gọi thẳng Gemini; không
  chặn thì một người bấm liên tục làm cạn hạn mức của khoá, và cạn rồi thì MỌI
  người đọc mất lớp ấy tới hết ngày. Hết ba lượt thì nút không tắt — nó lật
  sang câu kế trong kho, và nhãn đổi theo để người bấm biết mình đang làm việc
  nào. Số lượt còn lại in ngay trong lời nhắc.
- **Ba header an toàn còn thiếu**: `Content-Security-Policy` (danh sách rút từ
  chính bản dựng, không đoán), `Permissions-Policy` tắt camera · micro · vị
  trí, và `Strict-Transport-Security`.
- **Ảnh bìa bị kẹt trong cache một năm.** Luật `/media/*` khai
  `immutable, max-age=1 năm` với lý do "tên file không đổi thì nội dung cũng
  không đổi" — không đúng với `bia.png`, thứ `npm run bia --de` vẽ lại mà giữ
  nguyên tên. Nay ảnh bìa có luật riêng một ngày.

## V2.3.9 — 17-Sep-2026

- **Thanh soạn thảo xếp theo TẦN SUẤT, không theo loại kỹ thuật.** Bản trước
  gom "nét trong dòng" lại một chỗ, nên `Gạch ngang chữ` và `Mã` ngồi ngay
  cạnh `Đậm` còn `Link` bị đẩy xuống quá nửa thanh. Nay cắt làm hai nửa rõ
  rệt: chính (hoàn tác · đậm nghiêng link · dàn bài · ảnh và Blocks) rồi phụ.
- **Bỏ nút chỉ dẫn `i`.** Ô soạn thảo có hai cửa dạy cùng một việc, và chúng
  đã lệch nhau thật. Phần chỉ dẫn nay nằm ở cuối bảng Blocks, ngay dưới danh
  sách nó nói về.
- **Bảng Blocks chia bốn nhóm** — khung nhấn · ảnh và video · cấu trúc · cả
  đoạn — và bốn khung nhấn có **chấm màu** đúng bằng màu chúng hiện trên
  trang. Trước đó cả bốn đều tả là "same box, …", đọc hết vẫn không chọn được
  cái nào; thứ khác nhau thật giữa chúng là màu chứ không phải chữ.
- **Nút dọn nay gỡ được cả liên kết.** `removeFormat` của trình duyệt không
  đụng tới thẻ `<a>`, nên đặt nhầm một liên kết rồi thì không có đường nào gỡ
  ngoài hoàn tác — mà hoàn tác cuốn theo cả mấy thứ vừa gõ sau đó.

## V2.3.8 — 17-Sep-2026

- **Thẻ bình luận: ba dòng xuống còn một.** "love u chị iu~" dài bốn chữ mà
  chiếm ba dòng. Nay tên · nội dung · (ngày và Reply) là ba ô trên một hàng co
  giãn: ngắn thì một dòng, dài thì tự rớt xuống. Đo được: **31px thay vì ~100px**.
- **Bàn duyệt căn cột cố định.** `Approve` và `Unapprove` dài khác nhau, nên
  mép cột nút nhảy vài chục pixel giữa hai hàng liền nhau và cả bảng đọc ra là
  so le. Lưới cột cố định, chữ dồn phải.
- **Ngăn Category có ô lọc y như ngăn Post.** Trước đó đổi tab một cái là nửa
  thanh công cụ biến mất. Lọc theo mã, tên hiển thị hoặc câu mô tả.

## V2.3.7 — 17-Sep-2026

- **Ảnh bìa mang hoạ tiết mandala của logo.** Trước bản này nó là một dải màu
  pastel với mấy vệt sáng — đẹp như một tấm vải, nhưng dán lên Facebook thì là
  một hình chữ nhật trống, và ba bài cạnh nhau trông như ba lần cùng một tấm.
  Hoa văn dựng bằng toạ độ cực (`r = |cos 2θ|`, ba lớp lệch nhau) chứ không
  chép đường bezier của logo: file này ghi PNG từng điểm ảnh một.
- **Nét hoa văn tự đổi theo nền.** Ba trong mười hai bảng màu là nền đêm, và
  một nét ngả đen trên nền đêm thì biến mất hẳn. Nay nét nhắm một độ sáng cách
  nền một khoảng cố định — mọi bảng màu ra cùng một mức tương phản. (Bản đầu
  dùng ngưỡng cứng `sáng > .5`, để lại một vệt gãy vuông ngay chỗ một vệt sáng
  vắt ngang đoá hoa.)
- **Bốn góc bớt tối.** Công thức cũ kéo góc phải dưới xuống gần đen tím; cả
  tấm đọc ra xám đục và lạc khỏi bảng màu pastel của trang.

## V2.3.6 — 17-Sep-2026

- **Ba hằng số đọc trước lúc được gán — lớp AI của ô trích dẫn chưa từng chạy
  một lần nào.** `var` được cất chỗ trước nhưng chưa gán giá trị, mà cả ba đều
  khai BÊN DƯỚI dòng gọi. Hậu quả chia làm hai kiểu, và kiểu thứ hai mới đáng
  sợ: một cái ném lỗi ngay (`undefined[3]`), hai cái kia **không ném gì cả** —
  khoá kho đệm thành `undefined` nên kho không bao giờ được đọc, và địa chỉ gửi
  đi thành `so=undefined` nên mỗi lượt chỉ xin được một câu. Ô trích dẫn vẫn có
  chữ suốt thời gian đó, vì kho câu nhúng sẵn đã vẽ xong từ trước.
- **F5 là có câu mới.** Lượt gọi đầu xin cả chùm năm câu rồi cất vào máy người
  đọc; mỗi lần tải trang rút ra câu kế tiếp, hết chùm thì quay vòng. Đo bốn
  lượt tải liên tiếp: một lượt gọi mạng, bốn câu khác nhau.
- **Kho nguồn thêm tác giả Việt** — Trần Hưng Đạo, Phan Châu Trinh, Quang
  Trung… kèm một dòng dặn riêng: nhân vật Việt thì chỉ trích câu có nguồn rõ,
  không chắc thì bỏ qua người đó. Lời dặn cũng đổi để xin nhiều câu một lượt,
  và `npm run kiem` có phép kiểm bắt lúc nó thiếu chỗ điền số câu.

## V2.3.5 — 17-Sep-2026

- **Một tên lớp đè lên một tên lớp khác, và không có gì báo.** Bàn duyệt gọi
  mỗi hàng bình luận là `.bl-dong` — *dòng*. Nút Back của khung bình luận cũng
  tên `.bl-dong` — *đóng*. Bỏ dấu thì hai từ ấy là một, nên mọi hàng ở bàn duyệt
  nhận trọn bộ luật của một cái nút: viền quanh người, lề trong 12px, hover thì
  sáng lên như sắp bấm được. **Mấy cái khung hộp bao quanh từng bình luận là
  như thế mà ra** — không ai cố ý vẽ chúng. Luật rút ra, ghi vào tài liệu: tên
  lớp tiếng Việt không dấu phải đọc to lên trước khi đặt.
- **Thẻ bình luận thành hàng có kẻ ngăn.** Bình luận ở đây phần lớn dài một
  dòng; một dòng chữ trong tấm thẻ kính lề trong 24px là một cái hộp gần trống.
  Thêm nữa, thẻ kính là khuôn của thứ BẤM ĐƯỢC trên trang này — bình luận thì
  không, nên nó đang mượn một tín hiệu không thuộc về mình.
- **Bình luận của chủ trang: một vạch dọc bên trái**, thôi tô nền cả khối. Nền
  tô làm khối ấy đọc ra như một ô nhấn — tức là "đọc cái này trước", trong khi
  ý thật chỉ là "người này là chủ nhà". Huy hiệu AUTHOR cũng thôi làm viên
  thuốc: nó đứng cạnh một cái tên cỡ 14px mà nặng hơn chính cái tên ấy.

## V2.3.4 — 17-Sep-2026

- **Ba ngăn quản trị, ba bộ luật CSS riêng — nay còn một.** Post, Category và
  Comment đều bày một danh sách để điểm danh rồi thao tác, nhưng chúng được
  viết ở hai file khác nhau và đã trôi xa nhau: hai ngăn ra danh sách dòng
  **mười lăm mục một màn**, ngăn Comment ra một cọc thẻ có viền **bốn mục một
  màn**. Khuôn chung `.ad-*` khai một chỗ; thêm ngăn mới thì dùng lại, cần khác
  thì thêm một lớp phụ.
- **Bàn duyệt duyệt theo dòng.** Tên người gửi · nội dung và đường dẫn · trạng
  thái · Approve và Hide, tất cả trên một hàng. Approve thôi là nút tô đầy —
  mười lăm hàng là mười lăm viên thuốc, và lúc ấy bảng đọc ra là một cái lưới
  nút chứ không phải một danh sách. Nó vẫn nổi hơn Hide, bằng màu.
- **Bảng bài lọc được theo chuyên mục.** Ô gõ cũ chỉ soi tiêu đề, nên câu hỏi
  "mục tản mạn có những bài nào" không trả lời được — chuyên mục không nằm
  trong tiêu đề. Nay có ô chọn kèm số bài từng mục, và mỗi hàng bày luôn bài đó
  nằm ở mục nào (trước đây bảng không hề nói ra điều ấy).
- **Luật này nay có phép kiểm canh.** `npm run kiem` bắt ngăn nào dựng danh
  sách mà không đi qua khuôn chung, còn dùng tên đã bỏ, hay gõ một tên lớp
  không có luật CSS nào. Đầy đủ ở `docs/DESIGN-SYSTEM.md` §20.

## V2.3.3 — 17-Sep-2026

- **Ô ảnh bìa, ngay trong trang viết bài.** `cover` và `coverAlt` đã nằm trong
  front matter từ lâu, máy chủ đã nhận từ lâu, bộ dựng đã dùng chúng cho thẻ
  chia sẻ và ảnh đầu bài — nhưng ô viết bài **chưa bao giờ gửi chúng lên**. Tức
  là mọi bài đăng từ trang quản trị đều không có bìa, và dán link đi thì ra một
  thẻ trắng. Nay thả ảnh vào ô là xong; bài cũ mở ra cũng sửa bìa được.
- **Bảng Search & sharing, đo lúc đang gõ.** Chín phép đo — tiêu đề, tóm tắt,
  đường dẫn, bìa, mô tả bìa, ảnh trong bài thiếu mô tả, tiêu đề mục, độ dài,
  tag — cộng một khối xem trước cắt đúng chỗ Google cắt. Ba mức: hỏng · nên hơn
  · ổn. Gộp hai mức đầu làm một thì bài nào cũng đỏ, và màu đỏ hết nghĩa.
- **Thẻ chia sẻ khai đủ khổ ảnh.** Dán link mà ra một ô chỉ có tên miền thường
  không phải vì thiếu `og:image` — nó có sẵn và đúng. Bộ quét của mấy ứng dụng
  nhắn tin không biết trước khổ ảnh thì phải tải nguyên tấm về để đo, và phần
  lớn bỏ luôn tấm ảnh thay vì chờ. Nay có `og:image:width/height`, cùng bộ thẻ
  `twitter:*` và `article:*` đầy đủ. Cách bắt Facebook · Zalo quét lại: `docs/SEO.md`.

## V2.3.2 — 17-Sep-2026

- **Mục "gõ tay — không có nút" biến mất, vì nó đã sai.** Danh sách ấy ra đời
  trước bảng Blocks; bảng Blocks sau đó nhận hết mười lăm thứ trong đó, nhưng
  câu đầu đề thì ở lại. Ai mở bảng chỉ dẫn ra cũng được dạy gõ tay đúng những
  thứ chỉ cần bấm một cái — và kết luận rất hợp lý là ô soạn thảo chẳng khác gì
  bản cũ.
- **Cú pháp về đứng cạnh chính cái nút làm ra nó.** Mỗi dòng trong bảng Blocks
  nay bày luôn thứ nó ghi vào file: `:::note`, `| a | b |`, `{.nho}`. Một chỗ,
  không hai — chép sang hai chỗ thì sớm muộn lại lệch nhau đúng như lần này.
- **Thêm khối tràn hết bề ngang, và nút Blocks mang cả chữ.** `:::full` là khối
  duy nhất bộ dựng hiểu mà bảng chưa có nút — thêm nốt thì không còn gì phải gõ.
  Nút mở bảng trước đây chỉ có một hình chữ nhật: nó là cửa vào mười sáu thứ,
  mà không ai rê chuột lên đợi dòng chú thích thì không biết bên trong có gì.

## V2.3.1 — 17-Sep-2026

- **Kéo tấm ảnh vào khung soạn thảo là xong.** Hoặc `⌘V` sau khi chụp màn hình,
  hoặc bấm nút ảnh rồi chọn file. Trước bản này, viết bài thì không cần mở máy
  — nhưng **chèn một tấm ảnh thì cần**: chép file vào đúng thư mục, commit, rồi
  quay lại gõ tay đường dẫn ấy vào một ô hỏi. Gõ sai một ký tự là bài lên với
  một ô ảnh vỡ.
- **Ảnh tự nhẹ đi ngay trên máy.** Một tấm chụp bằng điện thoại nặng 3–6 MB và
  rộng 4000px; cột chữ rộng 700px, nên phần lớn số byte ấy không bao giờ hiện
  lên màn hình của ai — chúng chỉ làm bài tải chậm. Thử thật: 2400×1350 PNG
  xuống còn 1800px WebP, **nhẹ hơn 81%**. Ảnh động `.gif` thì đi thẳng, không
  qua bước này — qua là mất hoạt hình.
- **Bấm đúp vào tấm ảnh để gõ dòng tả.** Hỏi ngay lúc thả thì kéo bốn tấm vào là
  bốn hộp thoại liên tiếp, và phần lớn người ta bấm OK cho xong. Nên không hỏi:
  đếm số ảnh còn thiếu rồi nói ra ở dòng trạng thái.
- **Ảnh vừa thả chưa có ở địa chỉ thật** cho tới khi Cloudflare dựng xong,
  khoảng một phút. Trong khung thì thấy ngay: khung giữ bản xem tại chỗ, còn
  file `.md` mang đường dẫn thật.

## V2.3.0 — 17-Sep-2026

> Nhảy từ V2.2.9 lên đây là đúng luật, không phải sót: sổ bỏ qua build
> 13 · 14 · 23 · 38 · 39 · 40 · 41. Xem phần đầu file.

- **Chỉ số trên, chỉ số dưới, và phím — gõ được và có nút.** `m^2^` ra m²,
  `H~2~O` ra H₂O, `[[⌘K]]` ra một cái phím vẽ như phím thật. Ba thứ này có CSS
  nằm sẵn trong trang từ lâu mà **chưa từng có đường nào sinh ra chúng** — tức
  là ba luật trang trí không ai dùng được, nằm im nhiều tháng.
- **Ba lớp cho cả đoạn.** `{.nho}` chữ nhỏ màu nhạt cho ghi chú bên lề hoặc
  dòng nguồn; `{.giua}` căn giữa cho một câu đứng riêng; `{.thuong}` tắt cỡ chữ
  lớn ở đoạn đầu. `{.giua}` là ca ngược lại của mấy cái trên: bộ dựng nhận nó
  từ lâu và in ra đúng cái lớp, nhưng **không có luật CSS nào** — gõ vào thì
  đoạn ấy trông y hệt đoạn thường, và không ai biết vì sao.
- **Thanh soạn thảo: 12 nút → 26.** Thêm hoàn tác · làm lại (⌘Z chỉ có trên
  bàn phím, mà phần lớn bài thì gõ trên điện thoại), thụt vào · thụt ra để có
  danh sách lồng nhau, một nút trả tiêu đề về đoạn thường, và ba nút vừa kể.
  Bảng **Blocks** lên 15 khối: thêm YouTube, video, bề ngang ảnh, và ba lớp
  đoạn.
- **Bài "Vô thức tập thể" cấu trúc lại.** Nó đang là hai thứ giả vờ làm một:
  một bài viết về Jung, và một bản demo. Câu "đây là bản demo" nằm ở đoạn thứ
  hai — giết giọng bài ngay từ đầu; rồi giữa mạch lập luận là một đoạn mã
  JavaScript và nguyên một mục hướng dẫn chèn ảnh. Nay phần demo xuống thành
  **phụ lục sau vạch cuối bài**, và bài đọc một mạch từ đầu tới cuối.
- **Bài không có tiêu đề mục thôi chừa một cột trống.** Cột bên của chúng dựng
  ra rỗng, mà lưới vẫn giữ nguyên 320px — cột chữ nép hẳn về trái giữa một
  khoảng trống rộng bằng một phần tư màn hình. Nay không có gì để chở thì không
  dựng cột, và bài canh giữa như khung B.
- **Bàn duyệt bình luận: có chip lọc.** Đo trên 34 bình luận: 22 dòng cần bấm
  nằm rải giữa 12 dòng đã xong, phải cuộn 4.700px cho một việc. Nay mặc định
  chỉ hiện việc chưa làm, và bấm Duyệt thì đổi ngay tại dòng thay vì dựng lại
  cả bảng — trước đây mỗi cú bấm là trang nhảy về đầu danh sách.
- **Nút "Hide" trên điện thoại to bằng ngón tay.** Nó đang là 24×18px, nằm sát
  một nút Approve rộng 106px — và cái dễ bấm nhầm lại là cái giấu hẳn một bình
  luận.
- **Thêm một phép kiểm canh đúng cái bẫy trên:** mỗi nét có nút phải vừa dựng
  ra thẻ thật, vừa có luật CSS đi kèm. Cắm lỗi vào thử hai lần — lần đầu phép
  kiểm vẫn xanh vì nó so chuỗi con, lần hai vẫn xanh vì tên lớp còn nằm trong
  một chú thích. Sửa xong mới bắt được cả hai.

## V2.2.9 — 17-Sep-2026

- **Bài dài: cụm tim · chia sẻ · bình luận đi theo người đọc.** Ở một bài ba
  nghìn chữ, hàng meta trôi khỏi màn hình sau một cú vuốt — ai đọc tới đoạn hay
  nhất mà muốn thả tim thì phải cuộn ngược lên đầu bài, và phần lớn thì không
  cuộn. Nay cuộn qua khỏi đầu bài là cụm hiện lại: ở cột phải trên máy bàn
  (ngay dưới phần gợi ý đọc tiếp), ở góc dưới phải trên điện thoại. Tới chân
  bài thì nó lui đi, để không che nút Gửi. Bài dưới 2.500 chữ không có — cả bài
  gọn trong một hai màn, và một cụm nút nổi lên ở đó chỉ che mất chữ.
- **Menu ☰ trên điện thoại thành kính thật.** Nó vốn là một tấm nhựa đục, dán
  ngay dưới một thanh đầu trang trong suốt — hai vật liệu khác nhau cách nhau
  8px. Nay nó mượn đúng công thức kính của thanh đầu trang: vệt sáng chạy quanh
  mép, bóng đổ, bung ra từ góc trên phải đúng chỗ ngón tay vừa chạm.
  Dòng "Search" trong menu bỏ cái kính lúp — bốn mục quanh nó đều là chữ trơn.
- **Mục lục trên điện thoại thôi đứng chơ vơ.** Nó là một viên thuốc rộng 120px
  nằm giữa một khoảng trắng, không neo vào mép nào. Nay là một hàng của trang:
  căng hết bề ngang, một sợi kẻ trên dưới, mũi nhọn ở mép phải — và cả hàng bấm
  được thay vì đúng 120px.
- **Chữ trên điện thoại căn đều hai bên như trên máy bàn.** Luật cũ tắt căn đều
  dưới 560px vì "chỉ còn 30–40 ký tự một dòng". Đo lại bằng chính chữ tiếng
  Việt trên màn 375px thì ra 45 ký tự — con số cũ đếm bằng bề ngang chữ số 0,
  chữ rộng nhất trong phông. 45 ký tự là đủ để mép phải thẳng mà không hở.
- **Khoảng trống cuối bài co lại, và khung bình luận có tên.** Từ dòng cuối bài
  xuống tới hàng tag là gần một phần tư màn hình trắng trơn — cuộn tới đó thì
  tưởng bài đã hết. Và khi mở khung bình luận ra, phía trên nó là một mảng
  trống không nói gì; nay có một dòng **NOTES** kèm số lời nhắn.
- **Đường dẫn bài sửa được, ngay trên dòng xem trước.** Tiêu đề hay cho người
  đọc thường ra một đường dẫn dài 46 ký tự, mà đường dẫn tốt cho tìm kiếm thì
  ngắn. Nay phần giữa đường dẫn là một ô gõ; hai đầu vẫn là chữ chết, nên nhìn
  thấy nguyên cái link thật trong lúc sửa.
- **Chuyên mục của một bài đã đăng đổi được.** Trước đây ô ấy khoá hẳn. Nay đổi
  được, và máy chủ ghi bản mới TRƯỚC rồi mới xoá bản cũ — hỏng ở bước nào cũng
  còn ít nhất một bản. Cái giá là link cũ gãy, và ô soạn nói thẳng ra điều đó
  kèm đúng cái link sắp gãy, trước khi bấm Lưu.
- **Có ngăn Category ở /z-admin/.** Đặt tên hiện ra trên trang cho từng chuyên
  mục, viết câu mô tả nằm dưới tên ấy ở trang Posts, sắp thứ tự, thêm mục mới,
  bỏ mục rỗng. Trước đây muốn sửa một câu mô tả thì phải mở kho mã trên GitHub.
- **Ô soạn thảo có nút cho mọi khối.** Khung ghi chú bốn tông, dải ảnh, khối
  tràn lề, bảng, khối mã, danh sách việc — sáu thứ trước đây chỉ có cách gõ tay
  `:::note`. Khung ghi chú nay hiện ra trong lúc gõ đúng như một cái ô, không
  phải ba dòng dấu hai chấm.
- **Và một lỗi mất chữ đã chữa: bảng trong bài cũ.** Mở một bài có bảng ra sửa
  rồi lưu lại thì mọi hàng của bảng bị nối thành một đoạn văn đầy gạch đứng —
  bảng hỏng thật, không chỉ hiện xấu. Dải ảnh cũng vậy: hai tấm ảnh dồn về một
  dòng là dải ảnh thành một đoạn có hai ảnh nằm ngang. Nay cả hai đi qua nguyên
  vẹn, và vòng đổi-đi-đổi-lại đứng yên từ lượt lưu thứ hai.
- **Google có đủ dữ liệu để biết ai đứng sau trang.** Trước đây mỗi trang tự
  khai một nút "Person" riêng — chín bài là hai chục nút rời rạc cùng tên mà
  không cái nào nói nó là cùng một người. Nay cả trang là một đồ thị liền, và
  trang giới thiệu được khai đúng là trang hồ sơ của chính người ấy. Điền thêm
  `mangXaHoi` trong `site.config.json` thì mạnh hơn nữa.

## V2.2.8 — 17-Sep-2026

- **Tim · chia sẻ · bình luận về chung MỘT hàng với ngày đăng.** Trước là hai
  hàng, và hai hàng ấy còn nói lặp nhau: một trái tim ở hàng meta để ĐỌC số,
  một trái tim ở hàng dưới để BẤM. Người đọc thấy tim là bấm — mà cái họ thấy
  trước lại đúng là cái không bấm được. Nay một trái tim duy nhất, số in ngay
  trên nút, bấm phát là nhảy tại chỗ. Nhãn "Leave a note" bỏ luôn: ba cái icon
  đã nói đúng thứ nó nói.
- **Và nó đứng đúng một chỗ ở mọi kiểu bài.** Trước cụm đi ba đường tuỳ khung
  bài — đầu bài, cột phải, hay cuối bài — nên mở một bài khác kiểu là phải đi
  tìm lại nó. Nay luôn ở dưới tiêu đề. Chỉ ĐÍCH ĐẾN của nút bình luận là khác:
  bài ảnh thì nhảy thẳng tới ô viết ngay dưới hàng tag, bài dài thì mở ra ở cột
  phải như cũ.
- **Cột phải thôi giật ra khi mở bình luận.** Nó vốn rộng 280px rồi bị kéo lên
  400px ngay lúc bấm — cả trang xô lại một nhịp, đúng lúc người ta đang nhìn.
  Nay rộng sẵn 320px cho cả hai trạng thái: đủ chỗ gõ, mục lục cũng dễ đọc hơn,
  và bấm nút thì bề ngang không nhúc nhích.
- **Bài ảnh có cặp lùi / tới thay cho danh sách gợi ý.** Một trang ảnh chỉ có
  một khối chữ ngắn; dán vào cuối nó ba dòng gợi ý có nhãn loại và ngày tháng
  là thêm một khối chữ nặng bằng cả bài. Nay hai đường đi, chữ nhỏ, một dòng:
  bài cũ hơn ở mép trái, bài mới hơn ở mép phải — cùng cử chỉ với việc lật ảnh
  ngay phía trên.
- **Khoảng trống chết cuối bài ảnh đã hết.** Khung bình luận lúc đóng cao đúng
  0 nhưng vẫn ăn khoảng cách ở cả hai phía, để lại 112px trắng giữa hàng tag và
  phần đọc tiếp — trên điện thoại là một phần bảy màn hình, và cuộn tới đó thì
  tưởng bài đã hết.
- **Chữ trong bài ảnh thẳng mép với ảnh.** Có hai đường lề cùng nói một chuyện
  chồng lên nhau, nên cột chữ thụt vào 37px mỗi bên trên màn 375px — một phần
  năm bề ngang màn hình để vẽ lề. Nay một lề, mỗi dòng dài thêm 13%.
- **Trang Posts: bỏ sáu sợi kẻ cụt, đổi phông tên chuyên mục, các ô bằng nhau.**
  Tên chuyên mục vốn dùng đúng bộ chữ và gần đúng cỡ chữ của tiêu đề "All posts"
  ngay trên đầu trang, nên sáu cái tên đọc ngang hàng với tiêu đề của cả trang
  và trang mất thứ bậc. Ô cũng cao thấp so le nhau — một lưới bento không khớp
  mép thì thôi là lưới. Nay ô nào cũng căng bằng nhau và kết thúc bằng một chân
  ô giống nhau; mục chưa đủ bài thì chừa sẵn chỗ, có bài là lấp vào.
- **Kho lưu gọn lại theo cùng một phép.** Con số năm thôi to bằng tiêu đề
  trang, hai sợi kẻ sát nhau dưới mỗi năm còn một, và tên bài đổi sang phông
  thân bài — kho lưu là chỗ đi TÌM một bài đã biết tên, mà một bảng tra thì
  quét mắt nhanh hơn ở cỡ chữ nhỏ.
- **Điện thoại: nút ☰ ra sát góc phải, kính lúp vào trong menu.** Ba nút hình
  cạnh nhau trên một thanh 375px thì tên blog chỉ còn hơn trăm pixel. Nay
  "Search" là một dòng trong chính tấm menu ☰ — cùng chỗ với bốn mục điều
  hướng kia, tức đúng chỗ người ta mở ra để đi tới một trang.
- **Ô soạn thảo: bấm đổi màu chữ nay thật sự đổi màu.** Tô lại một cụm đã có
  màu thì màu cũ biến mất mà màu mới không lên — phép gỡ lớp cũ huỷ luôn vùng
  chọn, nên lượt tô ngay sau đó không còn gì để tô. Bôi đen qua hai đoạn văn
  còn tệ hơn: nó cắt đôi cả hai đoạn. Cả hai đã chữa, và viết lại theo cách
  không đụng tới cấu trúc đoạn.
- **Bảng chỉ dẫn trong ô soạn thảo nói cả những thứ KHÔNG có nút.** Khối ghi
  chú, dải ảnh, bảng, khối mã, ảnh tràn lề — mười cú pháp mà bộ dựng hiểu và
  đang được dùng trong bài, nhưng thanh nút không có chỗ cho, nên người viết
  bài sau chỉ biết những gì có nút.
- **Bảng bài ở /z-admin/ tải theo trang.** Nó vốn dừng ở 40 bài mới nhất và
  không có đường nào đi tiếp — với một blog viết đều thì đó là hạn dùng, không
  phải giới hạn kỹ thuật. Nay mỗi lượt 20 bài, có nút tải thêm, có dòng "đã tải
  20 trên 63", và có ô lọc theo tên gõ không dấu cũng ra.

## V2.2.7 — 16-Sep-2026

- **Ô trích dẫn đổi câu ba lần một ngày.** Trước là một câu duy nhất từ 0h tới
  24h — đúng với cái tên "câu của hôm nay", nhưng người đọc quay lại buổi chiều
  gặp đúng câu ban sáng, và ô ấy thành một mảng trang trí chết. Nay ngày chia
  làm ba khung: sáng · chiều · tối, mỗi khung một câu viết mới. Quãng nửa đêm
  tới 5h sáng vẫn tính là buổi tối hôm trước, để đọc khuya không bị nhảy câu
  giữa chừng.
- **Lớp AI của ô trích dẫn từng chết lặng, nay bật lại và có chuông báo.** Một
  lượt sửa cấu hình trước đây xoá mất công tắc của lớp này. Không có gì báo:
  trang vẫn chạy, ô vẫn có câu — vì kho câu viết sẵn vẫn hoạt động — nên nhìn
  ngoài không ai thấy khác, mà thật ra chưa một câu nào do AI viết từng lên
  trang. Nay bộ kiểm định có hai phép kiểm riêng cho đúng khoảng cách ấy: giữa
  "đã chuẩn bị đủ" và "có thật sự nối dây không".
- **Mỗi buổi một chủ đề khác hẳn, không phải đổi cho có.** Bốc chủ đề rời cho
  từng khung thì khoảng 30% số ngày có hai khung trùng chủ đề — quay lại buổi
  tối để gặp lại chuyện ban chiều thì đổi câu cũng bằng thừa. Nay xáo cả danh
  sách một lần mỗi ngày rồi mỗi khung rút một chủ đề theo thứ tự: quét 365 ngày
  không ngày nào trùng.
- **Bấm "xem câu khác" thì câu ấy được giữ lại.** Trước bấm ra câu ưng ý, tải
  lại trang một cái là mất. Nay nó ở lại tới hết khung giờ.
- **Icon trang trở lại trọn hình logo.** Bản trước rút gọn còn hai nét chính,
  và đoá mandala tám cánh tụt xuống thành một hình bốn cánh trông như cỏ ba lá
  — nhìn ở tab thì không còn nhận ra là logo nữa. Nay là đúng hình nghỉ: ba
  vành đồng tâm, tám cánh. Dựng ảnh thật ở năm cỡ để so trước khi đổi.
- **Icon tab đi theo theme Tĩnh lặng.** Theme đó đổi cả bảng màu sang xanh
  lạnh, nên một đoá hoa tím nằm trong tab đọc ra như icon của trang khác. Nay
  Tĩnh lặng có icon xanh riêng, còn Sakura và Galaxy dùng chung bản lavender —
  dựng thử bản nền tối cho Galaxy thì nó lẫn vào thanh tab chế độ đêm, tệ hơn
  chính bản không khớp theme, nên không làm ba bản.
- **Lưới đỡ khi nhà cung cấp AI từ chối nay thật sự bung ra.** Nó chỉ dựng cho
  hai kiểu từ chối, mà kiểu đang gặp trên trang lại là kiểu thứ ba — nên cái
  lưới nằm im đúng lúc cần nhất. Nay đỡ cả ba, và khi vẫn hỏng thì lời báo nêu
  đủ tên từng model cùng chỗ sai cụ thể, thay vì một câu chung chung không lần
  ra được.

## V2.2.6 — 17-Sep-2026

- **Trang Posts thành lưới bento.** Sáu chuyên mục xếp dọc là một trang phải
  cuộn ba bốn màn, và phải đi qua mục 1 mới thấy mục 4 — trong khi việc của
  trang này là cho người đọc CHỌN, mà chọn thì cần thấy hết cùng lúc. Nay mỗi
  chuyên mục là một ô: tên · số bài · một dòng mô tả · ba bài mới nhất bấm được
  ngay · "See all". Ba cột ở màn rộng, tối đa sáu ô một trang.
- **Một khuôn dòng cho bốn danh sách.** Màn đầu, ô bento, Archive và "đọc tiếp"
  đều liệt kê bài theo cùng một kiểu, nhưng mỗi chỗ tự khai cỡ chữ và kiểu rê
  chuột lấy: Archive dùng phông thân bài và đổi NỀN, ba chỗ kia dùng phông tiêu
  đề nghiêng và đổi MÀU. Đi từ Posts sang Archive là gặp hai danh sách trông
  như của hai trang web khác nhau. Luật chung ghi vào
  docs/DESIGN-SYSTEM.md §17.5, kèm bảng bốn lớp và ngoại lệ đã biết.
- **Favicon dùng đúng logo.** Trước đây là một bông hoa vẽ tay không liên quan,
  di sản từ lúc logo chưa có. Nay là hai nét của logo ở trạng thái nghỉ, bỏ ba
  vòng nét đứt và hai cánh mờ — ở 16px một nét dày 0,9 đơn vị chưa tới một phần
  ba pixel, nó không mảnh đi mà thành vệt bùn làm nhoè cả hình.

## V2.2.5 — 17-Sep-2026

- **Cột bên chỉ còn MỘT thang chữ.** Ba khối trong đó sinh ra ở ba chỗ khác
  nhau trong mã, nên "ON THIS PAGE" 11px xám, "READ NEXT" 12px TÍM và
  "LEAVE A NOTE" 10px xám — ba dòng cùng một vai mà mỗi cái một hình. Nay ba
  bậc, không hơn: tên khối · nhãn dòng · chữ để đọc.
- **Nút Back đứng cạnh Send, có viền đàng hoàng.** Trước nó lẻ một mình ở góc
  trên khung, dạng chữ trơn — ở đó nó không đọc ra là một cái nút, và không ở
  cạnh thứ nó đối lập. Hai cái là hai ngã của một quyết định: gửi, hay thôi.
  Cùng hàng, cùng cỡ, khác đúng ở sức nặng.
- **Khung ảnh đưa cụm nút lên đầu bài.** Khung C bày bài như một trang ảnh, và
  ở đó thói quen giống mạng ảnh hơn giống blog — xem xong thả tim ngay, không
  cuộn xuống đáy tìm nút. Bấm bình luận thì nhảy xuống khung viết. Hai khung
  kia là bài ĐỌC nên giữ cụm ở cuối hoặc trong cột bên.

## V2.2.4 — 17-Sep-2026

- **Điện thoại có menu.** Bốn mục Posts · Notes · Archive · About bị giấu từ
  lâu để chừa chỗ cho tên blog, còn cái nút mở chúng ra thì chưa bao giờ được
  dựng — nên trên điện thoại blog này KHÔNG có đường nào tới bốn trang chính
  ngoài mấy dòng ở chân trang. Nay có nút ☰ thả xuống một tấm nhỏ ngay dưới
  thanh đầu trang; đóng bằng bấm lại, bấm ra ngoài, hoặc Esc.
- **Tên blog thôi kẹt nửa vời ở lần mở thứ hai.** Màn cảm ứng cũng nổ `:hover`
  và nó DÍNH lại sau cú chạm: chạm lần một mở chữ ra, chạm lần hai gỡ lớp mở —
  nhưng `:hover` còn dính nên "oey" vẫn hiện, trong khi "Borderland" (chỉ nghe
  theo lớp kia) co lại. Cụm kẹt ở một trạng thái không luật nào tả. Nay khối
  `:hover` chỉ tồn tại trên máy có con trỏ rê được.

## V2.2.3 — 17-Sep-2026

- **Ảnh chia sẻ có logo và tên blog.** Tấm cũ là một gradient trơn với hai vòng
  nét đứt rất mờ — không logo, không tên, không địa chỉ. Dán một đường dẫn lên
  Facebook hay Zalo thì thẻ hiện ra gần như một ô trống. Tấm mới mang đúng ba
  thứ người lướt feed cần để nhận ra đây là ai.
- **Ba bản, một cho mỗi theme.** Bài không có ảnh bìa riêng thì lấy một trong
  ba, chọn theo TÊN BÀI — tất định, nên một bài luôn là một tấm cố định.
  "Ngẫu nhiên mỗi lần chia sẻ" thì không làm được: máy quét của Facebook, Zalo,
  X… đọc `og:image` một lần cho mỗi đường dẫn rồi nhớ lại hàng tuần, nên ai
  chia sẻ cũng nhận đúng tấm đã nhớ. Ngẫu nhiên theo BÀI cho ra đúng thứ muốn
  có: một feed vài đường dẫn của blog này hiện ba sắc khác nhau.
- **Ảnh bìa tự sinh cũng trải khắp ba theme.** Trước đây mười hai cặp màu đều
  nằm trong họ hồng-tím: nhìn từng tấm thì đẹp, nhưng bốn năm đường dẫn cạnh
  nhau trong một feed thì gần như trùng nhau. Nay 6 cặp Sakura · 3 Thiên hà ·
  3 Tĩnh lặng. Chỉ áp cho bài MỚI — bài đã có bìa giữ nguyên, vì đổi ảnh sau
  khi đã chia sẻ chỉ làm hỏng mấy thẻ cũ.
- **`npm run og`** dựng lại cả ba tấm. Nó nhúng thẳng hai phông của trang vào
  SVG rồi raster hoá bằng công cụ có sẵn của macOS — chữ đúng phông ở bất kỳ
  máy nào, không cần cài phông, không thêm một thư viện nào.
- Ảnh xuất ra **JPEG thay vì PNG**: gần như toàn gradient mềm, đúng thứ PNG nén
  tệ nhất — 670KB xuống còn 72KB mà mắt không thấy khác.

## V2.2.2 — 17-Sep-2026

- **Tài liệu nói đúng lại.** `IA.md` còn tả `/posts/` là "tất cả bài, sắp theo
  ngày" và trang chủ là "hai màn" — cả hai đã đổi từ mấy bản trước. `CAI-DAT.md`
  còn bảo bấm **Đăng xuất** và **Duyệt**, mà ô quản trị nay nói tiếng Anh.
  README thì thiếu năm file trong `src/js/` và một cửa API.
- **Bỏ `DOC-TRUOC.md`.** Nó là tờ ghi chú kèm gói cập nhật V1.8.3 → V2.0.0: hàng
  đợi bốn việc trong đó nay xong cả bốn, và lời khuyên về `GC_ID` đã bị chính
  `wrangler.jsonc` thay thế. Hàng đợi việc nay sống ở `docs/VIEC-DANG-CHO.md`.
- **Ba phép kiểm mới** — cả ba đều canh đúng loại lệch vừa xảy ra:
  · README phải kể đủ mọi file trong `src/js/` và `functions/api/`
  · mọi đường dẫn file nêu trong tài liệu phải có thật
  · mỗi trang bài đúng MỘT cụm tương tác, đặt sau khối "đọc tiếp", số bình luận
  ở hàng meta chứ không trên nút, có nút chia sẻ và nút Back
- **`quoteAI` thiếu trong `site.config.json` của bản chính** — phần chú thích tả
  nó đầy đủ mà khoá thật thì không có, nên tính năng im lặng tắt. Đã thêm lại.

## V2.2.1 — 17-Sep-2026

- **"Leave a note" xuống cột phải, dưới "Read next".** Thứ tự cột bên nay là:
  mục lục → gợi ý đọc tiếp → cụm tim · chia sẻ · bình luận. Đúng thứ tự câu hỏi
  trong đầu người đọc.
- **Cột bên thôi kẹp cú cuộn.** Lúc mở khung bình luận, cột bên từng bị kẹp
  trong một màn rồi cho cuộn riêng — một hộp cuộn lồng trong trang, ngay cạnh
  bài đang đọc. Con lăn đi qua nó là cả trang đứng im; kéo thanh cuộn của trang
  thì nội dung trong hộp không nhúc nhích; cuộn hết hộp mới lan ra trang, tức
  phải cuộn hai lần cho một quãng. Nay chỉ còn một mặt phẳng cuộn duy nhất.
- **Nội dung bài bám đúng mép trái của logo.** Bản trước mới đưa Ô LƯỚI về
  162px, nhưng phần nhìn thấy — tiêu đề, hàng meta, từng đoạn chữ — vẫn nằm
  giữa ô ấy nên mép trái người ta THẤY vẫn ở 243px. Nay cả khối bắt đầu tại
  162px, thẳng cột với logo; hai cột đệm dồn hết sang phải làm chỗ cho ảnh
  `{.wide}` và `{.full}` thò ra một bên.

## V2.2.0 — 17-Sep-2026

- **Chip ở Notes và Search về đúng cỡ chip ở Posts.** Chúng đã dùng chung một
  bộ luật từ V2.1.0, nhưng trang Notes còn một dòng cũ đặt `font:inherit` cho
  `<button>` — và `font` là shorthand, nó đặt lại cả phông, cỡ và độ đậm. Dòng
  ấy thắng luật chung (0,1,1 so với 0,1,0), nên chip ở Notes lấy phông thân bài
  15px thay vì phông nhãn 10px: cùng viền, cùng bo tròn, cùng chữ hoa giãn —
  mà to gấp rưỡi. Không đặt hai trang cạnh nhau thì không ai thấy.
- Dòng ấy vốn để gỡ phông mặc định trình duyệt gán cho `<button>`; nhưng luật
  chung đã khai đủ cả ba thuộc tính, nên không còn chỗ nào cho phông mặc định
  lọt qua.

## V2.1.9 — 17-Sep-2026

- **Cột chữ trang bài căng tới mép logo.** Lưới vốn khoá cột chữ đúng bằng làn
  chữ rồi đưa cả khối về giữa — đúng về lý thuyết đọc, nhưng nó đẩy mép trái
  cột chữ vào trong 61px so với logo trên thanh đầu trang, mà mắt thì đọc hai
  mép ấy chung với nhau. Nay cột chữ bắt đầu đúng tại một cột dọc với logo, với
  dòng phân cấp, với mọi thứ khác: 223px → 162px, cột rộng 658 → 780px.
- **Đánh đổi, nói thẳng:** ở màn 1440px một dòng nay chừng 90 ký tự, dài hơn
  khoảng 60–75 mà sách vở khuyên. Mép thẳng hàng đổi lấy dòng dài hơn — cách
  quay lại ghi ngay trong chú thích của luật ấy.

## V2.1.8 — 17-Sep-2026

- **"Leave a note" xuống SAU phần gợi ý bài.** Đọc xong một bài thì câu hỏi đầu
  tiên là "đọc gì nữa", không phải "viết gì" — đặt ô viết trước danh sách gợi ý
  là chen một việc nặng vào giữa lúc người ta đang muốn đi tiếp, và vì thế phần
  lớn sẽ lướt qua nó. Sau danh sách thì ai còn ở lại là người thật sự có gì để
  nói. Ba con số vẫn ở hàng meta đầu bài: chúng để đọc lướt, không phải việc
  để làm.
- **Khung bình luận có nút "Back".** Khung mở bằng cú bấm ở cụm nút; nhưng khi
  nó đã chiếm cột bên ở khổ rộng thì cái nút ấy có thể nằm ngoài tầm mắt, và
  người đổi ý giữa chừng không thấy đường nào lùi. Đóng lại thì trang tự đưa
  mắt về chỗ cái nút.
- **Thôi giữ cú cuộn của cả trang.** Khung bình luận ở cột bên khai
  `overscroll-behavior:contain` — chặn cú cuộn lan ra ngoài. Đúng cho một hộp
  thoại phủ lên trang, sai hẳn ở đây: phía sau là bài đang đọc, và con lăn đi
  qua khung là cả trang đứng im. Người đọc không biết mình bị cái gì giữ lại,
  họ chỉ thấy trang đơ.


## V2.1.7 — 16-Sep-2026

- **Ba con số của một bài về cùng một hàng.** Lượt xem và lượt thích vốn ở hàng
  meta đầu bài, còn số bình luận thì in ngay trên cái NÚT — nên hai cái đầu là
  chữ để đọc, cái thứ ba là một phần của nút bấm, và không cái nào so được với
  cái nào. Nay cả ba cùng một hàng, cùng khuôn "icon + số", và nút thôi mang
  số: nút là chỗ bấm, hàng meta là chỗ đọc. Con số nào cũng chỉ xuất hiện đúng
  một lần, nên không có hai bản để trôi lệch nhau.
- **Cụm tim · chia sẻ · bình luận chỉ còn MỘT chỗ đứng, mọi khung.** Bản trước
  nó đi hai đường: khung A vào cột bên, khung B và C lên đầu bài. Ba khung ấy
  chỉ khác nhau ở cách bày ẢNH, không khác nhau ở chuyện thả tim hay viết một
  dòng — mà người đọc thì phải đi tìm lại cái nút mỗi lần mở một bài khác kiểu.
- **Bấm bình luận ở khổ rộng nay luôn thấy khung mở ra.** Chỉ khung A có cột
  bên thật để dời khung sang; khung B và C ở khổ rộng thì khung vẫn mở ở cuối
  bài — cách chỗ vừa bấm cả nghìn pixel, và màn hình không đổi gì. Trông y như
  nút hỏng. Nay chỗ nào không dời được thì cuộn tới, kể cả ở khổ rộng.
- **Bỏ hai vạch trang trí thừa ở cuối bài.** Khối bình luận lúc đóng không còn
  gì để hiện, nên vạch kẻ có hạt kim cương mở đầu nó thành một nét trôi giữa
  hàng tag và khối "đọc tiếp" — mà khối ấy có vạch của riêng nó. Hai vạch giống
  hệt nhau cách nhau 80px thì cái nào cũng thôi làm dấu mở đầu.
- **Thẻ bài trong danh sách thôi mang hai ô số rỗng.** Ô lượt thích và ô số
  bình luận do comments.js đổ số vào, mà file ấy chỉ chạy trên trang bài — trên
  trang danh sách chúng nằm đó rỗng và ẩn vĩnh viễn, nhân với số bài mỗi trang.

## V2.1.6 — 16-Sep-2026

- **Một luật CSS trùng đã chặn một tính năng.** `.post-layout.khung-a` được
  khai HAI lần, cùng chọn lọc, cùng giá trị — im lặng suốt cho tới lúc thêm
  luật nới cột phải khi mở bình luận: luật mới nằm ngay dưới bản đầu, còn bản
  sao thì ở tận cuối file và bằng điểm, nên bản sao thắng và cột không chịu
  nới. Không lỗi nào nổ ra, chỉ là một tính năng không xảy ra. Đã gộp, cùng ba
  chỗ khác có cùng bệnh (`.vb-khoi`, `.vb-o > span`, nhãn ngôn ngữ trong khối mã).
- **Bỏ mười lăm lớp CSS không HTML nào nhả ra** — dấu vết của trang chủ đời cũ,
  ô trích dẫn ở lề bài, tem phiên bản ở màn đầu, và ô quản trị hồi còn xếp dọc
  một trang. Cùng với đó là năm nhãn không ai gọi trong bảng chữ.
- **Script chỉ nạp ở trang thật sự cần.** Bộ số trang trước đây nạp trên MỌI
  trang danh sách, kể cả `/search/` — nơi không bao giờ phân trang. Nay nó chỉ
  đi kèm những trang có một danh sách bị cắt thật.

## V2.1.5 — 16-Sep-2026

- **Ô quản trị nói tiếng Anh.** 101 nhãn trong bảng chữ cộng 115 chuỗi dự phòng
  trong mã chạy ở trình duyệt. Ngoại lệ tiếng Việt trước đây có lý do của nó —
  chỉ chủ trang đọc — nhưng ô quản trị không phải một ứng dụng riêng, nó là
  cùng một trang: đi từ bài sang ngăn Post là đi qua hai thứ tiếng trong hai cú
  bấm, và mọi thành phần dùng chung phải mang hai bộ nhãn cho cùng một hình.
- **Tên màu chữ vẫn là tiếng Việt, và đó là cố ý**: cú pháp ghi vào file `.md`
  là `{tím: chữ}`, nên tên màu là một phần của cú pháp chứ không phải một nhãn.
  Nút ghi "Purple" mà file ghi `tím` thì hai thứ nói hai chuyện.
- **Back đứng cạnh Save.** Trước đây mỗi nút tự đẩy mình sang phải, nên ô đánh
  dấu nháp ở mép trái, Back trôi ra giữa, Save ra tận mép phải. Hai nút ấy là
  hai ngã của cùng một quyết định — cách nhau cả bề ngang màn thì mắt phải đi
  một vòng mới thấy được ngã thứ hai.

## V2.1.4 — 16-Sep-2026

- **Khổ rộng: bấm bình luận thì khung viết chiếm luôn cột phải**, mục lục và
  "đọc tiếp" nhường chỗ, cột nới từ 280 lên 400px. Mở ở cuối bài nghĩa là phải
  cuộn xuống đáy để viết, và lúc viết thì bài không còn trong tầm mắt — muốn
  trích một câu phải cuộn lên đọc, nhớ lấy, cuộn xuống gõ.
- **Ô tìm kiếm thôi khựng ở phím đầu.** Hai chỗ: chỉ mục chờ tới lúc ô được bấm
  vào mới tải, nên vòng mạng ấy rơi đúng vào giữa phím đầu tiên; và phép bỏ dấu
  tiếng Việt chạy lại SÁU lần cho MỖI bài trong MỖI lượt lọc, kể cả trên toàn
  văn thân bài. Nay tải ngay lúc mở trang, và bỏ dấu đúng một lần lúc tải xong.

## V2.1.3 — 16-Sep-2026

- **Mục lục trên điện thoại thành một nút hamburger.** Trước đây nó mở sẵn:
  sáu mục là chừng 240px chen giữa dòng tóm tắt và câu đầu tiên của bài — gần
  một phần ba màn đầu tiêu vào thứ người đọc chưa cần. Nay đóng sẵn, cao 31px,
  bấm thì mở tại chỗ. Vạch giữa của hamburger ngắn lại khi mở.
- **Tên blog mở ra thì dòng "Borderland" nở theo.** Lúc rút gọn, dòng trên chỉ
  có "Z in" còn dòng dưới dài gấp bốn, nên cả cụm tựa hẳn vào mép trái. Cho
  dòng dưới to thêm một nhịp và giãn chữ ra thì phần dôi chạy sang phải, kéo
  trọng tâm về giữa: lề phải từ 108px xuống 62px.

## V2.1.2 — 16-Sep-2026

- **Logo thôi chạy sai thứ tự sau khi đi đâu đó rồi quay lại.** Vòng kể do HAI
  đồng hồ kéo: thẻ `<animate>` của SVG lo phần biến hình, `@keyframes` của CSS
  lo phần xoay và mờ. Chúng khớp nhau tới từng mili-giây lúc chạy liền một
  mạch, nhưng KHÔNG cùng một gốc thời gian khi trang bị cất vào bộ nhớ đệm hay
  bị ẩn đi — và lệch bao nhiêu thì bông hoa xoay trong lúc nét chữ còn đang ở
  chặng chữ Z. Nay mỗi lần trang được nhìn thấy trở lại, đồng hồ SVG kéo về
  theo đồng hồ CSS; đã khớp sẵn thì không đụng vào.
- **Thanh đầu trang ở các trang trong đổi qua lại giữa tên blog và logo.** Rê
  chuột vào thì đổi ngay; không rê thì cứ 20 giây tự đổi một lần. Chỉ mờ dần
  chứ không chạy lại vòng kể 27 giây — vòng kể là chuyện của màn đầu. Hai lớp
  chồng lên nhau nên bề rộng đứng yên: nếu co giãn theo thì cả hàng điều hướng
  bên phải nhích một cái mỗi hai mươi giây.

## V2.1.1 — 16-Sep-2026

- **Bỏ nốt đường kẻ mặt nước ở theme Tĩnh lặng.** Nó làm đúng việc nó sinh ra —
  nói rằng "từ đây trở xuống là nước" — và đó chính là vấn đề: nó nói bằng một
  ĐƯỜNG KẺ. Trên một màn đầu vốn đã có hai đường kẻ dọc của lưới, thêm một nét
  ngang chạy suốt bề rộng là thêm một cạnh hình học, và mặt nước đọc ra như một
  ô nữa của bố cục. Mặt nước giờ nói bằng dải màu, vòng sóng và mấy hạt bắn
  lên — không cái nào là một đường thẳng.

## V2.1.0 — 16-Sep-2026

- **Trang Posts gọn lại gần bốn lần.** Mỗi bài trong một chuyên mục trước đây
  là một tấm thẻ chở tiêu đề, ngày, tóm tắt và hai tag — chiếm chỗ bằng bốn
  dòng chữ. Trên một trang mà việc duy nhất là ĐIỂM DANH bài thì tóm tắt và tag
  không giúp chọn: người ta chọn theo tiêu đề. Nay mỗi bài là một dòng, và mỗi
  chuyên mục khoe được 5 bài thay vì 3 mà vẫn thấp hơn trước.
- **Cùng khuôn với ba dòng bài ở màn đầu trang chủ.** Hai chỗ làm cùng một việc
  thì phải trông như nhau — đi từ trang chủ sang Posts mà gặp hai kiểu danh
  sách là phải học lại cách đọc một thứ vừa đọc xong.
- **Tối đa 6 chuyên mục một trang**, cắt bằng chính bộ số trang đang dùng cho
  danh sách bài. Sáu là con số liếc hết được trong một hai màn.
- **Hàng chip ở Posts, Notes và Search nay là một thành phần.** Ba nơi từng có
  ba khoảng cách khác nhau vì mỗi nơi tự khai lấy — nhìn từng trang thì không
  ai thấy, mà chuyển qua lại giữa ba trang thì thấy hàng chip nhảy một cái.
  Luật đầy đủ ghi vào docs/DESIGN-SYSTEM.md §17.2b–c, kèm bảng "trang nào cắt
  gì, mỗi trang bao nhiêu".

## V2.0.9 — 16-Sep-2026

- **Tim, chia sẻ và bình luận gom thành MỘT cụm ở cột phải.** Chân bài không
  còn nút nào. Chân bài là chỗ người đọc vừa đọc xong và đang đi tiếp — ai đổi
  ý lúc đang đọc dở phải cuộn xuống tận cuối mới bấm được, mà phần lớn thì
  không cuộn. Cột phải đi theo suốt bài, nên cụm có mặt đúng lúc người ta còn
  đang có cảm xúc về bài.
- **Khung không có cột phải thì cụm lên ĐẦU bài**, bám ngay dưới hàng ngày
  tháng và lượt xem — tức là dán vào đúng chỗ con số đếm tim đang hiện. Chỉ
  khung A có cột bên thật; đặt cụm vào cột bên của khung B và C thì nó lại rơi
  xuống sau bài, đúng cái chỗ vừa dọn đi.
- **Nút chia sẻ mới.** Điện thoại mở bảng chia sẻ của hệ điều hành; máy bàn chép
  đường dẫn rồi báo "đã chép". Một nút chứ không phải một hàng icon mạng xã
  hội: hàng icon nói rằng trang này quan tâm tới bốn nền tảng cụ thể (nó không),
  và mỗi icon là một lượt gọi ra miền ngoài, tức một điểm theo dấu người đọc.
- **Thêm một phép kiểm**: mọi thẻ `script` phải trỏ tới một file có thật. Chính
  lỗi ấy vừa xảy ra khi thêm file chia sẻ — thẻ có, file không, nút bấm không
  ra gì, và không có gì báo.

## V2.0.8 — 16-Sep-2026

- **Nền Tĩnh lặng trở lại bản cũ.** Bản V2.0.7 hạ nền một bậc cho mọi chênh
  lệch cấu trúc tăng cùng lúc. Nó chữa đúng con số nhưng đổi luôn CHẤT của
  theme — thứ làm nên Tĩnh lặng là cái sáng mỏng, gần như trắng ra nước, và hạ
  một bậc là mất đúng cái ấy để đổi lấy 0,11 điểm tương phản.
- **Phần mép giữ lại, vì nó không đụng tới độ sáng của trang.** Đường kẻ đậm
  hơn (1,52 → 1,96), nền lõm tách hẳn khỏi mặt thẻ (1,09 → 1,41), màu trang trí
  lên đúng bằng Sakura (1,42 → 1,78). Ba thứ ấy đều là màu nhạt nằm trên nền
  nhạt: chúng làm rõ ranh giới mà không kéo cả trang tối đi.
- **Bỏ năm lằn nước.** Chúng là năm đường kẻ song song, và năm đường kẻ song
  song thì mắt đọc ra một cái lưới chứ không ra mặt nước. Chiều sâu đã có sẵn
  trong dải màu chuyển và trong cỡ vòng sóng to dần xuống dưới.
- **Nước hắt lên mềm hơn và mưa chạm mặt nước sớm hơn.** Hạt bật chậm lại dưới
  trọng lực nhẹ hơn một nửa — lên tới độ cao xấp xỉ cũ nhưng mất nhiều khung
  hình hơn, và đó là chỗ "mềm" nằm. Giọt nay sinh ngay trên mép màn thay vì từ
  440px phía trên, nên không còn quãng lặng dài lúc mới mở trang.

## V2.0.7 — 16-Sep-2026

- **Theme Tĩnh lặng: thẻ ra thẻ, mép ra mép.** Chữ ở theme này chưa bao giờ
  thiếu tương phản — đo được 12:1, hơn cả Sakura. Thứ hỏng là lớp cấu trúc:
  mặt thẻ chỉ nổi 1,12:1 so với nền, nền lõm 1,09:1, đường kẻ 1,51:1. Nghĩa là
  thẻ, khối code và bảng đều không có mép, cả trang đọc ra một mảng xanh nhạt
  liền và chữ nổi trôi trên đó.
- **Chỗ sửa là NỀN, không phải mặt thẻ.** Mặt thẻ đã .86 trắng, gần chạm trần,
  nên nới thêm cũng chẳng được bao nhiêu. Hạ nền một bậc (#E9F1FA → #D8E7F2)
  thì mọi chênh lệch tăng cùng lúc: thẻ/nền 1,12 → 1,23 (Sakura là 1,05), nền
  lõm 1,02 → 1,39 so với mặt thẻ, đường kẻ 1,51 → 1,93. Chữ vẫn còn 10,9:1.
- **Màu trang trí đậm thêm một bậc.** Ở màu cũ nó nổi 1,32:1 — nhạt hơn cả màu
  trang trí của Sakura — nên viền, chấm và gạch chân biến mất sạch. Nay 1,88:1,
  ngang Sakura, mà vẫn là một màu nước nhạt.
- **Quầng nền thôi kéo cả trang đi.** Bản trước đỉnh trang gần trắng còn chân
  trang xanh lục, nên nền dưới một tấm thẻ đổi hẳn theo chỗ thẻ đang nằm. Nay
  ba quầng dao động quanh nền chứ không lôi nó lệch đi.

## V2.0.6 — 16-Sep-2026

- **Màn đầu trên điện thoại giữ đủ một màn, kể cả sau khi đã bấm "Read on".**
  Trước đây bấm một cái là danh sách bài hiện ra, tổng nội dung vượt một màn,
  và khối chữ lớn — vốn nhận phần chiều cao dôi ra — không còn gì để nhận. Nó
  co về đúng chiều cao chữ, nên cuộn ngược lên trên cùng cũng không về được
  màn đầu ban đầu nữa: thứ hiện ra là một màn đầu teo lại còn nửa, với danh
  sách thò lên ngay dưới cái nút. Nay ba khối của màn đầu có sàn riêng một
  màn, và danh sách nở ra bên ngoài sàn ấy.
- **Tên blog trên điện thoại bắt đầu ở "Z in", chạm vào mới mở ra đủ.** Giống
  hệt cách khổ ngang mở bằng cú rê chuột. Đời trước cho hoạt hình ấy tự chạy
  một lần lúc mở trang — tức là nó diễn ra khi người ta còn chưa kịp nhìn, và
  xong là hết.
- **"in" về cùng hàng với "Zoey", và hai dòng thẳng chung một mép trái.** Chữ
  "Z" đứng đúng cột với chữ "B" ngay dưới, thành một cạnh dọc chạy suốt màn
  đầu — và mép ấy chính là mép của ô trích dẫn, của nhãn, của mọi thứ còn lại.
  Cân giữa như đời trước thì riêng tiêu đề neo vào một trục không có gì khác
  dùng chung.

## V2.0.5 — 16-Sep-2026

- **`docs/logo/` có lại tấm lát cắt cả vòng kể.** 14 chặng trên một lưới 5 cột,
  mỗi ô ghi mốc phần trăm và tên chặng. Bản cũ đã xoá vì nó dựng từ 25 mốc của
  vòng kể đời trước — kể một chuyện khác hẳn thứ đang chạy trên trang.
- **Bộ dựng tấm lát cắt thôi cần trình duyệt.** Nó đọc thẳng 14 file khung nằm
  cạnh nó, thay vì 25 file trong một thư mục tạm phải tự tay dựng lấy. Một câu
  lệnh là xong.
- **Thư mục `zoey-blog-logo/logo/` đồng bộ trọn vẹn với `docs/logo/`.** Lượt
  trước mới chép mấy file khung; bộ trích, hai bộ dựng và README vẫn là bản cũ
  từ đầu chiều. Nay cả hai bên khớp từng byte.

## V2.0.4 — 16-Sep-2026

- **Ngân hà phủ trọn màn hình.** Ở khổ dọc, đĩa sao trước đây lấy bề NGANG làm
  mốc — màn hẹp thì đĩa co lại thành một dải nằm giữa, trên và dưới trống
  hoác. Nay nó lấy cạnh nào lớn hơn, nên khổ dọc được phủ kín mà khổ ngang
  không đổi gì. Quầng lõi bị kẹp lại theo khung để đĩa to ra không kéo theo
  một vầng sáng chiếm nửa màn.
- **Giọt mưa chạm mặt nước có nước hắt lên.** Vài hạt bật ngược lên rồi rơi
  lại theo đúng đường parabol. Chỉ chừng ba phần năm số giọt toé, và số hạt
  mỗi lần mỗi khác — giọt nào cũng toé đều thì mắt bắt ra ngay cái đều ấy.
- **Mặt nước nhìn ra mặt nước.** Đường nước đổi sang màu nước sâu thay vì màu
  sáng (sáng trên nền sáng thì tăng độ đục bao nhiêu cũng vô ích), và nó nhấp
  nhô theo hai sóng sin chồng nhau có chu kỳ không chia hết cho nhau, nên chỗ
  gợn chỗ phẳng chứ không lượn đều.
- **Mưa chậm thêm một nhịp nữa**, còn khoảng 40% tốc độ bản đầu.

## V2.0.3 — 16-Sep-2026

- **Thanh đầu trang dính lại ở trang chủ.** Luật đưa nền động phủ trọn trang
  (V1.9.8) đè `position:sticky` của thanh đầu thành `relative` — hỏng lặng lẽ,
  và chỉ ở đúng một trang. Nó vốn đã có `z-index` riêng nên chẳng cần nâng.
- **Chân trang trang chủ dính liền màn hero**, bỏ 56px trống ở giữa. Ở mọi
  trang khác quãng ấy là chỗ thở; ở trang chủ, hero đã cao đúng một màn và kết
  thúc bằng một mép ngang, nên thêm một dải trống dưới mép ấy là dựng ra đúng
  cái "hai cục" vừa chữa xong ở nửa trên.
- **Cột chữ ôm lấy làn chữ.** Cột trái vốn để `1fr` — nhận hết phần còn lại,
  thành 780px ở màn 1440 trong khi làn chữ chỉ 594px. Hơn 160px trống nằm ngay
  trong cột, và làn chữ trôi giữa khoảng ấy. Nới làn chữ để lấp thì sai hướng
  (780px là chừng 90 ký tự mỗi dòng). Nay cột rộng đúng bằng làn chữ cộng một
  quãng thở, chỗ thừa chuyển hết ra hai bên trang: lề 223px mỗi bên thay vì 130.
- **"Đọc tiếp" về đúng chỗ theo từng khung bài.** Khung A có cột bên thật nên
  nó ở đó; khung B và C không có, và nhét vào `.ben` làm nó nằm CHỒNG LÊN băng
  ảnh. Ở hai khung ấy nó về lại dòng chảy, đứng sau khối bình luận.

## V2.0.2 — 16-Sep-2026

- **Cuối bài chỉ còn hai cái nút.** Trước đây là cả một khung bình luận bày
  sẵn: nhãn, danh sách, rồi một form ba ô to bằng nửa màn hình — mà chín phần
  mười người đọc không định gõ gì. Nay là một trái tim và một icon bình luận;
  bấm icon mới xổ khung ra.
- **Trái tim cho nhóm ở giữa.** Bình luận đòi người đọc nghĩ ra một câu; phần
  lớn người thích một bài thì không có câu nào để nói. Bắt họ hoặc viết một
  đoạn hoặc im lặng là bỏ sót đúng nhóm đông nhất.
- **Số đếm đặt cạnh lượt xem ở đầu bài**, mỗi con số một ký hiệu — con mắt và
  trái tim. Nút là chỗ BẤM, hàng meta là chỗ ĐỌC; tách hai việc thì không chỗ
  nào phải vừa đủ to để bấm vừa đủ nhỏ để không tranh chỗ.
- Con số này GẦN ĐÚNG, đúng như lượt xem: chỗ nhớ "máy này đã bấm chưa" nằm ở
  trình duyệt. Chặn chặt hơn thì phải theo dấu người đọc, mà một con số đếm
  tim không đáng cái giá ấy.

## V2.0.1 — 16-Sep-2026

- **Nét nối đứng thẳng giữa khung trước, rồi mới ngả vào nối.** Đây là chữ "i"
  của *in* — một nét thẳng. Bản trước nó trượt vào từ góc và ĐÃ nằm sẵn ở
  phương chéo, nên mắt chỉ thấy "có một gạch bay tới", không thấy nó là một
  con chữ. Cú ngả xuống là động tác NỐI, và nó chỉ đọc được là nối khi trước
  đó nét đã đứng ở một tư thế khác.
- **Xuất lại bộ khung lưu: mười bốn chặng** thay cho mười hai. Vòng kể đã đổi
  hẳn — bốn nấc mới (xoay trước rồi nối · giữ hình nơ · mở tám cánh ra từ bốn ·
  đanh nét) là bốn khoảnh khắc riêng, gộp vào mốc cũ thì mất đúng chỗ vừa thêm.
  `logo-dong.svg` dựng lại theo. `lat-cat.svg` xoá hẳn: nó dựng từ 25 khung của
  vòng kể cũ, và một bản lưu sai còn tệ hơn không có bản lưu nào.

## V2.0.0 — 16-Sep-2026

- **Cỡ chữ thân bài nhỏ một bậc** (16,5 → 15,5px ở màn rộng). Be Vietnam Pro
  có chiều cao chữ x lớn, nên cùng một con số px nó nhìn to hơn hẳn phông
  serif quen thuộc — ở cỡ cũ cột chữ đọc ra như cỡ chữ của một trang cài đặt.
  Không hạ sâu hơn: dưới 14,5px thì dấu tiếng Việt, vốn xếp chồng hai tầng ở
  ẫ ộ ự, bắt đầu dính vào nhau. Cột chữ tự hẹp theo vì `--measure` đo bằng
  `ch` — số ký tự mỗi dòng không đổi, và đó mới là thứ quyết định dễ đọc.
- **Khối tag bỏ khung bao.** Tag đã thôi là mấy viên thuốc từ bản trước; giữ
  lại một tấm nền bo tròn quanh chúng thì cả khối vẫn là một mảng đặc cuối
  bài — chỉ đổi từ năm mảng nhỏ thành một mảng to. Nay nó là một dòng chữ,
  ngăn với phần trên bằng một sợi kẻ.

## V1.9.9 — 16-Sep-2026

- **Điện thoại: danh sách bài chờ bấm "Read on" mới hiện.** Bày sẵn thì màn
  đầu thôi là một màn — cuộn một nhịp là gặp ngay danh sách, và khoảng lặng
  giữa tên blog với nội dung mất hẳn. Lần bấm đầu mở danh sách; từ lần sau nút
  ấy lại là đường dẫn sang /posts/ như ở khổ ngang.
- **Tên blog có hiệu ứng mở màn.** Khổ ngang, khối chữ nằm mờ tới khi rê chuột
  vào thì đậm lên và phần còn lại của "Zoey" đẩy ra từ sau chữ Z. Điện thoại
  không có cú rê chuột nào, nên bản trước đành bày sẵn trạng thái cuối — mất
  hẳn cái chuyển động. Nay cùng quãng đường ấy chạy một lần lúc mở trang.
- **Nhỏ một bậc** (17 → 15,5vw): cân giữa rồi thì cụm chữ tự đầy đặn hơn hẳn
  so với lúc bám mép trái, và ở cỡ cũ nó chạm gần sát hai lề.

## V1.9.8 — 16-Sep-2026

- **Nền động phủ TRỌN trang chủ, kể cả chân trang.** Trước đây nó bám vào
  riêng màn hero, nên cánh hoa rơi dừng đúng ở mép dưới hero. Hồi còn khối bài
  ở dưới thì mép ấy là ranh giới thật; nay trang chủ chỉ còn hero và chân
  trang, và cái mép biến thành một đường cắt ngang — hai mảng nền dán lại,
  đọc ra là hai cục.
- **Bỏ tem phiên bản ở góc hero.** Chân trang đã in sẵn số ấy, và hai lần cùng
  một con số cách nhau vài chục pixel thì cái nào cũng thành thừa. Chân trang
  giữ lại vì ở đó nó còn là cửa vào sổ lịch sử.

## V1.9.7 — 16-Sep-2026

- **Ngăn Post mở ra là một BẢNG BÀI, không phải ô viết trống.** Mỗi bài một
  dòng: ngày · tiêu đề · trạng thái · Sửa / Ẩn. Hàng chip trên đầu lọc theo
  trạng thái và in sẵn số, nên biết ngay có gì đang nằm trong Nháp hay Đã ẩn
  mà không phải bấm thử.
- **Sửa lại một bài đã đăng.** Bấm Sửa là bài cũ nạp thẳng vào khung soạn
  thảo — chữ, tiêu đề, ngày, tag, tóm tắt. Sửa xong bấm Lưu. Ô chuyên mục
  khoá lại: đổi chuyên mục là dời file, mà dời file thì mọi link đã chia sẻ
  gãy hết.
- **Ẩn và bỏ ẩn bằng một cú bấm**, ngay trên dòng. Không có nút Xoá, và đó là
  chủ ý: "ẩn" làm được mọi điều người ta thật sự cần khi muốn xoá (bài biến
  khỏi trang, không ai đọc được nữa) mà vẫn lấy lại được — còn xoá file thì
  khôi phục là việc của dòng lệnh.
- **Sửa cùng lúc ở hai máy thì máy sau bị từ chối**, không lặng lẽ đè mất bản
  kia. Câu báo nói rõ phải mở lại để lấy bản mới.

## V1.9.6 — 16-Sep-2026

- **Cái nơ được là chính nó một nhịp trước khi bo tròn.** Nét nối tới ở 30%, và
  tới đó thì chữ Z cộng nét nối đã khép thành một cái nơ bốn cạnh thẳng. Bản
  trước không dừng ở đấy: vừa khép xong là phép biến hình kéo luôn sang vô
  cực, nên mắt đọc ra một cú GIẬT từ hình chữ sang hình cong. Nay nó đứng im
  một nhịp, rồi mới bo.
- **Nét nối tan dần TRONG lúc bo**, không tắt phụt trước đó — nó hoà vào chỗ
  giao nhau ở giữa thay vì biến mất khỏi hình.
- **Riêng đoạn bo tròn đi theo một đường cong khác.** Sáu đoạn kia rời đi
  nhanh rồi hạ xuống chậm; ở đường ấy mới đi được nửa thời gian thì hình đã
  đổi xong tám phần mười, nên cái nơ vừa kịp khép là đã thành vô cực. Đoạn bo
  nay dùng đường đối xứng: nửa thời gian thì nửa đường.

## V1.9.5 — 16-Sep-2026

- **"Đọc tiếp" rời chân bài, lên cột bên dưới mục lục.** Dưới chân bài nó đứng
  sau hàng tag và khung bình luận — tức là sau hai thứ đã kết thúc bài rồi, và
  người đọc tới đó là đã đóng bài trong đầu. Cột bên thì nằm ngang tầm thân
  bài và đi theo suốt lúc cuộn, nên gợi ý có mặt đúng lúc người ta còn đang
  đọc. Khổ hẹp không có cột bên thì nó rơi xuống sau chân bài, đúng chỗ cũ.

## V1.9.4 — 16-Sep-2026

- **Tag thành một hàng chữ, không còn là dãy viên thuốc.** Năm cái viền bo
  tròn xếp cạnh nhau thành một dãy nút to ngang một khối nội dung — trong khi
  việc chúng làm chỉ là nói bài này thuộc mấy chủ đề. Nay chúng cách nhau bằng
  khoảng trắng như các từ trong một câu; dấu hiệu duy nhất nói "đây là tag" là
  dấu thăng và màu sáng hơn chữ xung quanh. Khối tag cuối bài cao bớt một nửa.

## V1.9.3 — 16-Sep-2026

- **Bài ẩn — trạng thái thứ ba, dùng được ngay.** Thêm `hidden: true` vào front
  matter là bài KHÔNG dựng ra file nào cả: đường dẫn cũ trả 404, không có trong
  sitemap, không có trong feed, không có trong danh sách nào. Khác `draft` ở
  chỗ bài nháp vẫn dựng ra trang để xem thử. File `.md` còn nguyên trong kho —
  bỏ cờ đi là bài trở lại y như cũ, kể cả đường dẫn. Dòng kết quả lúc dựng in
  ra số bài đang ẩn, để một bài biến mất không bao giờ là chuyện im lặng.
- **`/api/bai` đọc và ghi được bài đã đăng.** Ba việc mới: liệt kê bài kèm
  trạng thái, đọc một bài ra, và ghi đè một bài (có `sha` chống ghi đè nhầm —
  sửa cùng lúc ở hai máy thì máy sau bị từ chối chứ không lặng lẽ đè mất).
- **Mở một bài ra rồi lưu lại KHÔNG sinh ra diff nào** — thử trên cả chín bài
  thật: 9/9 giống hệt từng byte. Ba chỗ suýt làm hỏng, bắt được nhờ phép thử
  ấy: tag viết kiểu nhiều dòng bị đọc rỗng (tức là **mất sạch tag**), thứ tự
  khoá bị xáo lại, và tiêu đề đang viết trần bị bọc nháy. Khoá front matter
  giao diện không biết tới (`khung`, `pinned`, `updated`, `titleNgan`…) đi qua
  nguyên vẹn.

> Giao diện cho ba việc ấy — bảng bài, nút Sửa, nút Ẩn — là bước kế tiếp. Bản
> này là phần nền, và phần `hidden` thì dùng được ngay bằng cách sửa front
> matter.

## V1.9.2 — 16-Sep-2026

- **Chip lọc nhỏ lại đúng cỡ của nó.** Ba thứ cùng phóng to một lúc: cỡ chữ
  11px, giãn chữ .22em và lề trong 13px. Giãn .22em là gần một phần tư bề
  ngang mỗi chữ cái — nhãn mười ký tự dôi ra thêm hai ký tự rưỡi chỉ vì khoảng
  cách. Trên điện thoại sáu chip xếp thành ba hàng cao hơn cả danh sách chúng
  đang lọc; nay còn một hàng.
- **"Read next" thành dòng đơn.** Hai tấm thẻ kính to ngang một khối nội dung
  thật, mà chỉ chở một tiêu đề và một ngày. Nay mỗi gợi ý là một dòng: loại
  bên trái, tiêu đề ở giữa, ngày bên phải. Cùng chừng ấy chữ, một phần tư chỗ.
- **Bỏ ô trích dẫn khỏi trang bài.** Một câu trích của người khác đặt cạnh bài
  của mình thì nó tranh chỗ với chính bài ấy. Ô trích dẫn ở lại đúng hai nơi
  nó thuộc về: màn đầu trang chủ và trang giới thiệu.
- **Cột chữ rộng thêm** (54ch → 59ch) để lấp đúng chỗ vừa dôi ra bên phải,
  thay vì kéo giãn khoảng cách cho đầy.
- **Thu khoảng trống trên chân trang** từ 168px xuống 112px. Con số cũ là lề
  dưới của trang CỘNG lề trên của chân trang — hai chỗ cùng chừa một khoảng
  cho cùng một mối nối.
- **Điện thoại bỏ nút Profile** ở màn đầu: thanh đầu trang đã có "ABOUT".

## V1.9.1 — 16-Sep-2026

- **Trang chủ chỉ còn màn đầu.** Dưới hero từng có thêm một khối: bài nổi bật
  in to, lưới mấy bài còn lại, rồi hai đường dẫn sang Posts và Archive. Bỏ vì
  nó kể lại thứ vừa nói — cột phải của hero đã liệt kê đúng ba bài ấy kèm
  ngày. Người đọc không nhận thêm gì, chỉ nhận thêm một màn phải lướt qua.
- **"Read on" đi thẳng sang /posts/** thay vì cuộn xuống khối vừa bỏ.
- **Điện thoại nay THẤY ba bài ấy.** Trước đây danh sách bị giấu ở khổ dọc cho
  hero vừa đúng một màn — được, vì cuộn xuống là gặp khối bài ở dưới. Bỏ khối
  ấy mà vẫn giấu thì trang chủ trên điện thoại không còn một bài nào. Nay hero
  cao tối thiểu một màn rồi nở theo nội dung: mở lên vẫn đúng một màn tên
  blog, cuộn một nhịp là tới ba bài mới nhất.

## V1.9.0 — 16-Sep-2026

- **Xoay TRƯỚC rồi mới nối.** Bản trước nét nối quét vào lúc chữ Z còn đang
  đứng, rồi cả cụm mới xoay ngang — thứ tự ấy kể sai: cái nút thắt thành hình
  ở một tư thế rồi bị xoay đi, nên cú xoay đọc ra là chuyển cảnh chứ không
  phải một bước dựng hình. Nay chữ Z tự xoay ngang một mình, đứng hở hai đầu
  một nhịp, rồi nét nối mới tới khép chúng lại.
- **Tám cánh MỞ RA từ bốn, không phải áp vào.** Cụm cánh sao nay nằm chồng
  khít lên hai vô cực gốc suốt chặng kể chuyện, tới chặng mandala mới xoay
  tách ra. Cùng chừng ấy cánh hiện lên, nhưng đường đi của chúng nói câu khác:
  không phải "có thêm bốn cánh" mà "bốn cánh này vẫn ở đó, giờ mới xoè".
- **Vành đứt nét trở lại.** Đường sóng thử ở bản trước nhìn riêng thì mượt
  hơn, nhưng đặt cạnh tám cánh nhọn thì nó mềm quá và kéo mắt ra khỏi bông
  hoa. Hai vòng đan nhau tuy thô hơn nhưng đứng đúng vai trò một cái nền.
- **Xoáy nhoè rồi nổ.** Quãng cuối chạy tới 320°/% và thêm một lớp nhoè thật
  (`filter:blur`) — trình duyệt vẽ từng khung sắc nét nên chỉ tăng tốc thôi
  thì mắt vẫn bám được từng cánh. Nay cú vỡ đọc ra là bị xé, không phải là
  một tấm hình quay rồi mờ đi.
- **Dừng ở hình cuối 6,2 giây** (bản trước 4,3; bản đầu 2,2).

## V1.8.9 — 16-Sep-2026

- **Ô soạn thảo nay ĐỌC được Markdown vào**, không chỉ nhả ra. Đây là nền móng
  cho việc sửa một bài đã đăng: không nạp lại được bài cũ vào khung thì không
  có cách nào sửa nó bằng chuột.
- **Vòng tròn khép kín và bền vững.** Thử trên cả chín bài thật trong kho: mở
  ra rồi lưu lại hai lần thì lần thứ hai ra file y hệt lần thứ nhất, cả chín
  bài. Nghĩa là sửa một bài không còn làm cả bài xáo trộn trong lịch sử.
- **Ngắt dòng lại ở 80 cột** như bài gõ tay, để `git diff` đọc được theo từng
  dòng thay vì hiện "cả đoạn thay đổi" cho một lượt sửa ba chữ. Lượt lưu đầu
  tiên của một bài cũ vẫn xê dịch vài chỗ ngắt — đó là cái giá một lần.
- Ba chỗ từng làm hỏng bài lúc thử đã sửa: tên ngôn ngữ của khối mã (```json)
  không còn bị nuốt; dấu câu ngay sau `ô mã` không còn mọc thêm dấu cách; và
  chú thích ảnh có `mã` lồng trong không còn biến thành chữ "undefined".

## V1.8.8 — 16-Sep-2026

- **Gỡ hẳn hai lối tắt cũ `#viet` và `#duyet`.** Chúng cho ô viết ghi chú và
  bàn duyệt mọc ra ở bất kỳ trang bài nào, và lúc chưa có khoá thì chèn một ô
  XIN MẬT KHẨU vào giữa một trang người ta đang đọc — đúng hình dạng của một
  trò lừa, nằm trên chính tên miền thật. Nay chỉ còn một cửa: `/z-admin/`.
- **Trang bài và `/notes/` nhẹ đi.** Trang bài thôi tải `duyet.js`, `/notes/`
  thôi tải cả `duyet.js` lẫn `khoa.js` — người đọc thôi phải tải những file mà
  chỉ một người trên đời dùng tới.
- Tài liệu (`CAI-DAT.md`, `BINH-LUAN.md`) sửa theo: mọi chỗ còn chỉ đường bằng
  dấu thăng nay chỉ về `/z-admin/`.

## V1.8.7 — 16-Sep-2026

- **"Haluuu, Zoey! — Đăng xuất" thay dòng phụ đề.** Câu cũ tả lại đúng thứ
  người ta đang nhìn thấy, tức là không nói thêm gì. Dòng mới nói hai điều
  đáng nói: đang là ai, và đi ra lối nào. Lối ra là chữ trong câu, không phải
  một cái nút có viền — bấm vào là về thẳng màn đăng nhập.
- **Gõ sai khoá thì màn hình không nói gì.** Trang này ai gõ đúng đường dẫn
  cũng mở được, nên câu "mã chủ hoặc khoá sai" là nói với người lạ rằng cửa
  có thật và họ sai ở vế nào. Nay ô khoá chỉ tự xoá trắng và con trỏ nhảy về
  đó. Riêng "máy chủ chưa đặt khoá" thì vẫn nói — lúc ấy không ai vào được,
  chẳng có gì để giấu.
- **Ngăn Note thôi kèm một danh sách ghi chú ở dưới.** Đăng xong là dưới ô
  viết mọc ra một khối dài chép lại đúng thứ trang /notes/ đã bày đầy đủ hơn.
  Tiêu đề "Viết ghi chú" cũng thôi in hai lần chồng nhau.

## V1.8.6 — 16-Sep-2026

- **Tên blog ở màn đầu điện thoại nay cân giữa.** Trước đây ba dòng bám mép
  trái rồi đẩy dần sang phải — cách ấy đúng ở khổ ngang, nơi hai đường kẻ dọc
  của lưới làm khung để neo vào. Khổ dọc không có đường kẻ nào, mà dòng đầu
  ("Zoey") chỉ dài bằng một phần ba dòng dưới, nên bên phải nó bỏ trống hẳn
  một mảng và cả cụm đọc ra là bị dồn về góc. Nay dòng ngắn nằm giữa dòng dài,
  bậc thang còn lại thành hai cú nghiêng rất nhẹ quanh trục giữa.
- Dòng "Borderland" to thêm một bậc để lấp chỗ vừa dôi ra, và ba dòng hở nhau
  hơn — đuôi chữ "y" thôi đè lên chữ "in" ngay dưới nó.

## V1.8.5 — 16-Sep-2026

- **Đoá hoa đanh nét lại trước khi xoay.** Thêm một nhịp vào cuối đường dựng
  hình: hoa nở ra với đầu cánh TRÒN, đứng yên một nhịp rồi các đầu cánh nhọn
  lên, xong mới bắt đầu quay. Cú đanh lại rơi đúng lúc hình bất động nên mắt
  bắt được — nhét vào giữa chuyển động thì nó trôi mất. Hình nghỉ của logo từ
  nay là bản đầu cánh nhọn.
- **Vành ngoài thành một đường sóng.** Hai vòng nét đứt lồng nhau đổi thành
  một đường cong khép kín, bán kính dao động theo một đường bao ba đỉnh — có
  quãng dội lên, có quãng gần phẳng, như một dạng sóng âm uốn thành vòng. Nó
  còn co dãn nhẹ, bốn nhịp thở gọn trong một vòng kể.
- **Mọi cú chuyển cảnh nay cùng một nhịp.** Trước đây trên cùng một khung hình
  có tới bốn đường cong thời gian chạy song song, và hai trong số đó chạy trên
  CÙNG một nét cùng lúc — độ mờ đi theo một đường, hình đi theo đường khác.
  Xem một vòng thì không rõ; xem tới vòng thứ ba thì thành cái gợn.
- **Dừng ở hình cuối lâu gấp đôi, kể chuyện nhanh hơn một phần ba.** Đoạn dựng
  hình gọn lại còn hai phần ba thời lượng cũ, và chỗ tiết kiệm được dồn hết
  sang quãng đứng yên ở hình đủ — từ 2,2 giây lên 4,3 giây.

## V1.8.4 — 16-Sep-2026

- **Chân trang còn một hàng.** Dòng ký tên `© 2026 Zoey` rời khỏi tem bên phải
  về đứng đầu hàng trái, ngay trước RSS — nó là chủ của mấy đường ấy, đứng
  trước là đúng thứ tự đọc. Tem bên phải còn một dòng, và cả chân trang cao
  bớt đúng một hàng.
- **Chữ chân trang khớp chữ đầu trang.** Trước đây hàng đường đi viết thường
  bằng phông thân bài, còn tem viết hoa bằng phông nhãn cỡ riêng 10.5px — ba
  kiểu chữ trong một dải cao 40px, mà không kiểu nào khớp thanh đầu trang. Nay
  cả hàng dùng đúng một bộ; phân biệt giữa chúng nằm ở màu, không ở phông.

## V1.8.3 — 16-Sep-2026

- **Một cửa đăng nhập cho cả ba ngăn, và một nút ra.** Trước đây mỗi ngăn tự
  hỏi khoá, nên trang hỏi cùng một câu ba lần — và bấm "Quên khoá" ở ngăn này
  thì hai ngăn kia vẫn bày việc ra đó cho tới lúc chúng tình cờ hỏi lại máy
  chủ. Nay `/z-admin/` hỏi đúng một lần ở cửa vào, thử khoá thật với máy chủ
  trước khi nhận, và bấm **Đăng xuất** là cả ba cùng đóng ngay — kể cả ở tab
  khác đang mở.
- **Ô viết bài gõ như gõ văn bản.** Bôi đen rồi bấm nút: đậm, nghiêng, gạch,
  tiêu đề, trích dẫn, danh sách, link, ảnh, tô nền, **màu chữ**. Lúc bấm Đăng
  nó tự đổi ra Markdown — thứ đi lên GitHub vẫn là file `.md` đọc được bằng
  mắt, y hệt bản gõ tay. Nút `i` mở bảng chỉ dẫn, nút `</>` xem trước đúng
  đoạn Markdown sắp gửi. Bài tự lưu nháp trên máy.
- **Màu chữ trong bài:** `{tím: chữ}`, tám tên màu, mỗi theme một bảng màu
  riêng nên bài tô màu hồi Sakura vẫn đọc được trên Galaxy. Kèm theo đó bộ
  dựng nay hiểu dấu chéo ngược (`\*` ra dấu sao thật) — trước bản này nó in ra
  nguyên cả dấu chéo.
- **"Sai khoá" và "máy chủ chưa có khoá" nay là hai câu khác nhau.** Chúng
  từng ra cùng một dòng chữ, và đó là cách nhanh nhất để mất một buổi đi tìm
  lỗi ở chỗ không có lỗi.
## V1.8.2 — 16-Sep-2026

- **Điền kho mã thật vào cấu hình Worker**, thay chỗ trống mẫu. Không có nó thì
  ngăn Post không biết ghi bài vào đâu.
- **Thêm một phép kiểm canh đúng chỗ trống ấy.** Để nguyên mẫu thì mọi thứ vẫn
  dựng, vẫn đưa lên được, ngăn Post vẫn mở ra bình thường — chỉ tới lúc bấm
  Đăng mới nhận một câu báo lỗi của GitHub, mà câu ấy đọc ra như "khoá hỏng"
  chứ không như "bạn quên điền tên kho mã".

## V1.8.1 — 16-Sep-2026

- **Trang quản lý gom thành ba ngăn.** Trước đây ô viết ghi chú và hàng chờ
  duyệt bình luận đổ chung xuống một cột dọc. Với hai khối thì còn chịu được;
  thêm ô viết bài — vốn cao gấp mấy lần vì có cả khung soạn thảo — là thành một
  trang cuộn mãi không hết, mà muốn duyệt một bình luận thì phải lướt qua trọn
  một bài đang gõ dở. Nay là một cột chọn việc bên trái, nội dung bên phải, mỗi
  lúc một ngăn. Trang cũng đổi tên thành **Admin**.
- **Đăng bài thẳng từ trang quản lý, không cần mở máy.** Gõ tiêu đề, chọn
  chuyên mục, viết, bấm Đăng. Bài đi vào kho mã rồi tự dựng lại — khoảng một
  phút sau là lên sóng. Khác ghi chú ở chỗ đó, và màn hình nói thẳng ra như
  vậy: bài cần đường dẫn riêng, cần có mặt trong RSS, trong sitemap, trong ô
  tìm kiếm và trong thẻ chia sẻ — những thứ chỉ có được khi trang dựng lại.
- **Mấy con số hay phải chỉnh nay nằm trong một file cấu hình**, không còn rải
  rác trong mã: đọc tiếp mấy bài, thẻ bài hiện mấy tag, màn đầu mấy bài, RSS
  giữ mấy bài, logo quay bao lâu và vỡ thành mấy hạt. Gõ sai thì bộ dựng kêu
  lên rồi dùng số mặc định, không im lặng bỏ qua. Đổi được cả từng chữ trên
  giao diện mà không mở tới mã.
- **Thời lượng vòng kể của logo từ hai chỗ khai còn một.** Trước đây con số ấy
  viết ở cả CSS lẫn mã dựng, và có một phép kiểm canh cho chúng khớp nhau —
  canh được, nhưng vẫn là hai chỗ phải sửa.

## V1.8.0 — 16-Sep-2026

- **Một trang bài nặng 100 KB, nay còn 9 KB.** Sổ phiên bản — cái bảng mở ra khi
  bấm năm nhịp vào dòng chữ nhỏ ở chân trang — được nhét sẵn vào MỌI trang, dù
  chín mươi chín phần trăm người đọc không bao giờ mở nó. Nó nặng 77 KB, trong
  khi bài dài nhất chỉ có 6 KB chữ. Nay nó nằm riêng một chỗ và chỉ được lấy về
  đúng lúc có người mở. Cả bản dựng từ 5,6 MB xuống 2,1 MB.
- **Ghi chú trong mã thôi đi theo người đọc.** Các file JavaScript của trang có
  rất nhiều ghi chú, và đó là chủ ý — chúng kể lại vì sao từng chỗ viết như vậy.
  Nhưng người đọc blog không cần chúng mà vẫn phải tải về: một nửa số byte. Nay
  bản gửi đi được cắt sạch ghi chú, bản trong kho mã giữ nguyên từng chữ. Phần
  JavaScript tải về giảm từ 52 KB xuống 23 KB.
- **Bộ dựng bản lưu logo chạy được ở máy khác.** Ba file công cụ ghi cứng đường
  dẫn trên máy người viết, nên ai tải kho mã về cũng không chạy nổi. Tệ hơn: bộ
  trích khung gửi từng tấm về một địa chỉ không tồn tại, nhận lỗi rồi im lặng
  bỏ qua — bảng kết quả vẫn in đủ mười hai dòng còn trên đĩa không có file nào.
- **Hai phép kiểm mới canh đúng hai chỗ vừa sửa**, vì cả hai đều hỏng không
  tiếng động: trang nặng trở lại thì nhìn vẫn y hệt, còn một file JavaScript bị
  cắt hỏng thì trang vẫn hiện đủ, chỉ là bấm vào đâu cũng không có gì xảy ra.

## V1.7.9 — 16-Sep-2026

- **Dọn ba thứ đã chết mà vẫn nằm trong kho mã.** Máy chủ bình luận đời cũ chạy
  trên Google; một bản sao thừa của hàm trích dẫn nằm sai chỗ, không ai gọi tới
  mà lại còn ghi tên một model Google đã ngừng chạy; và một file kho câu cũ mà
  bộ dựng không đọc bao giờ. Cả ba đều vô hại cho tới lúc có người mở nhầm ra
  sửa — rồi sửa vào chỗ không chạy, hoặc chép lại một cái tên đã chết.
- **File khai báo bỏ qua đã mất khỏi kho mã, nay trả lại.** Thiếu nó thì thư
  mục bản dựng và thư viện tải về sẽ theo nhau vào kho — vài nghìn file rác mỗi
  lần đẩy lên.
- **Bản lưu trạng thái logo dựng lại cho đúng.** Bộ trích cũ dời tâm phép xoay
  hai lần ở hai cánh hoa văn, nên mười hai khung đều mang một vòng thừa nằm
  lệch ra ngoài. Thêm một tấm gộp cả vòng kể vào một chỗ.
- **Tài liệu khớp lại với mã.** Ba chỗ gọi sai tên file kho câu, một chỗ chỉ sai
  nơi đặt khoá bí mật, số mục nhảy cóc, và bản mô tả cây thư mục còn thiếu mấy
  file mới.

## V1.7.8 — 16-Sep-2026

- **Trang quản lý đổi đường dẫn thành `/z-admin/`.** Tên cũ đọc ra là một trang
  nội dung bình thường; tên mới nói thẳng đó là chỗ làm việc, và gõ nhanh hơn
  trên bàn phím điện thoại. Cửa sau bấm năm nhịp ở trang giới thiệu vẫn trỏ
  đúng chỗ.

## V1.7.7 — 16-Sep-2026

- **Có một trang riêng để chủ trang làm việc.** Trước đó phải nhớ hai địa chỉ
  có dấu thăng — cái đó không phải đăng nhập, nó là bắt người ta học thuộc
  đường đi. Nay một trang thật, lưu được vào màn hình chính điện thoại: viết
  ghi chú ở trên, hàng chờ duyệt bình luận ở dưới, không tranh chỗ nhau. Vào
  được bằng đường dẫn, hoặc bấm năm nhịp vào tiêu đề trang giới thiệu.
- **Theme Tĩnh lặng sâu màu hơn, và lý do đáng ghi lại.** Đo ra thì cả 36 chỗ
  chữ đều đạt chuẩn tương phản, chỗ thấp nhất vẫn trên ngưỡng — trên giấy là
  xong, nhìn thật vẫn nhạt. Vì ngưỡng ấy là SÀN chứ không phải đích, mà cả một
  tầng chữ phụ đều nằm sát sàn thì trang mất tầng bậc; vì nhãn chữ hoa nhỏ và
  giãn rộng thì mắt đọc ra nhạt hơn con số đo được; và vì thẻ trắng trên nền
  gần trắng gần như không còn mép, mất luôn phần tương phản của cấu trúc. Nay
  nền đậm thêm một nhịp cho ra xanh thật, mực sâu hơn ở cả ba mức, thẻ đục hơn
  và đường kẻ rõ hơn.
- **Trang ghi chú có phân trang.** Bộ chia trang vốn đã có nhưng chưa dùng cho
  trang này. Và chia trang với lọc theo loại từng giành nhau một cách giấu mục,
  nên lọc xong là mấy mục vừa bị giấu lại bật ra — nay mỗi bên một cách.
- **Bộ ảnh lưu mười hai trạng thái của logo**, cộng một file chạy được trọn
  vòng, đứng một mình không cần trang web. Trích từ chính hoạt hình đang chạy
  chứ không vẽ lại, nên bản lưu khớp đúng cái người đọc thấy.
- **Dải sáng của theme Galaxy dày gấp đôi**, và mưa ở theme Tĩnh lặng chậm
  thêm một nhịp nữa.

## V1.7.6 — 16-Sep-2026

- **Bàn duyệt gom về một chỗ, và mở được ngay ở trang ghi chú.** Trước đó nó
  sống trong khối bình luận, mà khối ấy chỉ có ở trang bài — muốn duyệt thì
  phải mở một bài viết nào đó ra trước, và phải nhớ đường dẫn của đúng một bài
  cụ thể. Duyệt là việc của chủ trang, chẳng dính tới bài nào, nên nó không
  nên phải đi nhờ chỗ của bài khác mới có chỗ đứng. Nay nhớ một lối tắt là đủ:
  cùng một trang, thêm dấu thăng này thì viết ghi chú, thêm dấu thăng kia thì
  duyệt bình luận.
- **Và nó tự làm mới.** Bàn duyệt hay bị mở rồi để đó; không tự xin lại thì
  con số đứng im và chủ trang tưởng không có gì mới trong khi hàng chờ đã dài
  ra. Cứ hai mươi giây một lượt, và chỉ khi cửa sổ đang hiện — nằm dưới thì
  không ai nhìn, gọi tiếp là vẽ cho cái không ai xem.
- **Gỡ một bình luận ngay tại chỗ đang đọc.** Đang đọc trong ngữ cảnh bài viết
  rồi mới thấy cần gỡ, mà phải nhớ tên người gõ, mở bàn duyệt, dò lại trong
  danh sách — đọc ở đây, bấm ở kia. Nay mỗi bình luận mang thêm hai nút nhỏ,
  và chỉ hiện khi máy ấy có khoá.

## V1.7.5 — 16-Sep-2026

- **Model dự phòng của ô trích dẫn đã chết từ lúc nào không hay.** Nó ghim cứng
  vào một số hiệu cụ thể, với ý là "cái tên chắc chắn còn tồn tại". Tra lại
  danh sách của Google thì chính cái tên ấy đã nằm trong mục model cũ, dán nhãn
  đã ngừng chạy. Cái lưới rách trước cả thứ nó đỡ.
- **Và nó rách im lặng.** Cả model chính lẫn model dự phòng cùng trả về "không
  có" thì ô trích dẫn chỉ lặng lẽ dùng câu từ kho sẵn — đúng như thiết kế, và
  cũng vì thế mà không ai biết lớp viết mới đã ngừng hoạt động.
- **Nay cả hai đều là bí danh tự cập nhật**, và là hai bí danh khác nhau: một
  bản gọn nhẹ, một bản đầy đủ. Google ra bản mới thì chúng tự trỏ theo. Ghim
  vào một số hiệu là hẹn trước một ngày phải quay lại sửa.

## V1.7.4 — 16-Sep-2026

- **Bật lớp trích dẫn viết mới mỗi ngày.** Ô trích dẫn vẫn chạy được không cần
  gì cả — nó xoay vòng kho câu sẵn trong `content/quote-nguon.md`. Nay có thêm
  lớp trên: mỗi ngày một câu viết mới, theo tám chủ đề và ba mươi tám tác giả
  khai sẵn trong chính file ấy. Hỏng hay chậm quá ba giây thì lặng lẽ giữ câu
  từ kho — người đọc không phân biệt được, và đó là chủ ý.

## V1.7.3 — 16-Sep-2026

- **Mở bàn duyệt hay ô viết là được đưa tới tận nơi.** Hai khối ấy nằm cuối
  trang — trên một bài dài, bàn duyệt rơi vào khoảng 4700px của một trang cao
  6200px, hơn năm màn hình. Mà dấu thăng trong địa chỉ không trỏ tới phần tử
  nào nên trình duyệt không tự cuộn: gõ địa chỉ xong thấy y hệt một bài viết
  bình thường, và không có cách nào đoán ra là nó đã mở rồi, chỉ nằm dưới xa.
- **Và phải nhảy thẳng, không cuộn mượt.** Bản chữa đầu dùng cuộn mượt, nhưng
  trang khai kiểu cuộn ấy ở cấp cao nhất nên nó thành một hoạt hình dài, rồi
  ảnh trong bài tải xong giữa chừng làm đích trôi đi — đo ra: bốn giây sau khi
  mở trang vẫn còn đứng nguyên ở đầu. Đây là bàn làm việc chứ không phải một
  chặng đọc, tới nơi ngay là đúng.
- **Dòng mời ở khung bình luận bỏ được.** Để trống trong cấu hình là nó biến
  mất hẳn; bản trước để trống thì rơi về một câu mặc định khác, tức là không có
  cách nào tắt.

## V1.7.2 — 16-Sep-2026

- **Bảng đếm lượt xem tự tạo.** Trước đó tài liệu bắt chủ trang tự chạy một câu
  `CREATE TABLE` trong Console của cơ sở dữ liệu. Quên bước ấy thì `/api/xem`
  trả lỗi máy chủ ở **mọi lượt mở bài** — mà lỗi ấy im lặng, vì phía trình
  duyệt cố ý nuốt mọi lỗi để không làm phiền người đang đọc. Trang nhìn vẫn
  bình thường, chỉ thiếu con số lượt xem.
- **Một bước tay trong tài liệu là một bước sẽ có người quên.** Hai phần thêm
  sau đó — ghi chú và bình luận — đã tự tạo bảng từ đầu; riêng phần lượt xem là
  phần cũ nhất nên còn sót lại kiểu làm cũ. Nay cả ba giống nhau: cắm cơ sở dữ
  liệu vào là chạy, không có bước nào phải nhớ.

## V1.7.1 — 16-Sep-2026

- **Trang chạy được cả dưới dạng Worker, không riêng Pages.** Thư mục
  `functions/` là quy ước của RIÊNG Cloudflare Pages; dự án kiểu Worker
  (`…workers.dev`) không đọc nó. Hậu quả im lặng tới mức nguy hiểm: trang tĩnh
  mở bình thường, bài đọc được, giao diện đủ cả — nhưng mọi đường `/api/...`
  trả 404, và log không có gì để báo, vì với Worker thì mấy đường ấy chưa từng
  tồn tại. Bình luận không gửi được, lượt xem không đếm.
- **Một bộ hàm cho cả hai kiểu.** `worker.js` chỉ ĐỊNH TUYẾN, rồi gọi đúng mấy
  hàm trong `functions/`. Chép logic sang chỗ thứ hai là sớm muộn hai bản trôi
  lệch nhau, mà lệch ở lớp máy chủ thì không ai thấy cho tới lúc có người thật
  gửi bình luận.
- **Và một phép kiểm canh chỗ ấy.** Thêm một hàm vào `functions/api/` mà quên
  thêm dòng tương ứng vào `worker.js` là `npm run kiem` báo đỏ — vì nếu không
  báo thì đường mới 404 lặng lẽ, đúng cái bẫy vừa sập một lần.

## V1.7.0 — 16-Sep-2026

- **Bình luận rời khỏi Google, về chạy trên Cloudflare.** Bản cũ để Google Apps
  Script lo hết, nghĩa là mỗi người mở một bài đều phải đợi một lượt gọi sang
  Google — khởi động nguội một tới ba giây, và không cache được — chỉ để lấy về
  mấy dòng bình luận. Đổi lại được đúng một thứ: chủ trang tick một ô trong
  bảng tính. Người ghé đọc bài không nên trả giá cho sự tiện tay của chủ nhà.
- **Duyệt ngay trên trang, làm được từ điện thoại.** Thêm `#duyet` vào địa chỉ
  bất kỳ bài nào là ra hàng chờ của CẢ blog, mỗi dòng ghi rõ nó thuộc bài nào —
  không phải mở từng bài xem bài nào có gì đang chờ. Duyệt, bỏ duyệt, ẩn, tất
  cả tại chỗ. Không còn bảng tính nào ở giữa.
- **Lời của chủ trang lên thẳng, có huy hiệu.** Chủ nhà không phải tự duyệt lời
  của chính mình. Huy hiệu ấy chỉ gắn được từ phía máy chủ sau khi khoá đã
  khớp — gõ đúng tên chủ trang vào ô tên thì không có.
- **Một cặp khoá cho mọi quyền của chủ trang.** Viết ghi chú và duyệt bình luận
  dùng chung hai biến bí mật; nhập ở một chỗ là mở được cả hai. Ba tính năng —
  bình luận, lượt xem, ghi chú — nay cùng một cơ sở dữ liệu, cài một lần.
- **Email vẫn không bao giờ ra khỏi cơ sở dữ liệu.** Không câu lệnh nào đọc tới
  cột ấy, kể cả lượt gọi của chủ trang.

## V1.6.5 — 16-Sep-2026

- **Khối chữ ở màn đầu bị khuôn xén ở CẢ hai đầu.** Chữ "Z" vốn đã lấn qua
  đường kẻ trái và bị cắt mất một mảng — cố ý, để cả khối đọc ra là được đặt
  vào khuôn rồi khuôn cắt bớt. Nhưng chữ "B" của dòng dưới thì đứng trọn vẹn,
  nên một bên bị cắt còn một bên thụt vào, và dòng dưới trông như bị lùi lề chứ
  không phải cùng một khuôn. Nay "B" khuất khoảng một phần tư — ít hơn "Z" (hai
  phần năm), vì dòng trên vẫn là dòng nhấn. Cỡ chữ dòng dưới phải giải lại theo
  để mép phải vẫn cắt đúng giữa chữ "d".

## V1.6.4 — 16-Sep-2026

- **Mục lục và ô trích dẫn bám theo bài dài.** Chúng vẫn được khai là "dính khi
  cuộn" từ lâu, nhưng ô lưới chứa chúng bị kéo cao đúng bằng cả bài — đo thật:
  nội dung 406px, ô 5091px. Một khối dính chỉ trượt được trong ô của chính nó,
  mà ô đã cao bằng cả trang thì không còn quãng nào để trượt. Đúng cú pháp, và
  không làm gì cả.
- **Thanh cuộn thấy được, và theo màu theme.** Trước đó trang nhận thanh cuộn
  mặc định của máy, mà trên macOS mặc định ấy tự ẩn: muốn biết bài còn dài bao
  nhiêu thì phải cuộn một nhát cho nó ló ra. Bài dài là chỗ cái thước ấy có ích
  nhất.
- **Cỡ chữ thân bài nhỏ lại một nhịp** (17,5 → 16,5px). Cỡ cũ bắt đầu ngả sang
  cỡ chữ sách điện tử. Số ký tự mỗi dòng giữ nguyên ~70 vì cột chữ đo bằng đơn
  vị co theo cỡ chữ.
- **Đọc tiếp còn hai bài, và mưa ở theme Tĩnh lặng chảy chậm lại một phần tư.**
  Ba thẻ gợi ý rớt xuống hai hàng trong cột chữ hẹp, để lại một hàng lẻ. Và
  thác chảy xiết thì đọc ra là thác lũ, mà theme này tên là Tĩnh lặng.

## V1.6.3 — 16-Sep-2026

- **Logo lấy lại đoá mandala làm hình nghỉ.** Trước đó mandala chỉ thoáng qua ở
  chặng cuối rồi tan, nên chín phần mười thời gian — kể cả lúc vừa mở trang —
  cái hiện ra là bốn cánh của hai vô cực. Ngược đời: hai vô cực là một CHẶNG
  trên đường dựng ra đoá hoa, không phải cái đích. Nay vòng lặp mở và đóng bằng
  mandala, và bản logo đứng yên cũng vẽ đủ tám cánh thay vì bốn.
- **Vòng kể ngắn lại 30 → 27 giây, riêng chặng xoay thì không.** Mọi chặng khác
  gọn đi 10%; chặng xoay được nới phần chia nên tính ra giây còn dài hơn bản cũ
  một chút. Đó là chỗ người xem nhìn lâu nhất.
- **Chữa chỗ mandala trông như đứng im.** Hai lỗi chồng lên nhau: chặng nhấp
  nháy ép một nhóm cánh xuống quá sâu nên tám cánh rút còn bốn, mà bốn cánh thì
  xoay hay không nhìn cũng gần như nhau; và cụm cánh hoa văn đi ngang qua đúng
  chỗ nó chồng khít lên cụm cánh chính. Nay sàn nhấp nháy nâng lên, còn cụm hoa
  văn chỉ đảo qua lại quanh chỗ đứng chứ không bao giờ đi tới chỗ chồng.
- **Tên blog ở khổ dọc cân hai dòng.** "Borderland" từ 11vw lên 14vw — ở cỡ cũ
  nó đọc ra như dòng phụ chú dưới chữ "Zoey" chứ không phải nửa còn lại của
  cùng cái tên.

## V1.6.2 — 16-Sep-2026

- **Ghi chú đăng thẳng từ điện thoại.** Bắt gặp một quyển sách hay một ý thoáng
  qua thì mở `/notes/#viet`, gõ, xong — không phải mở máy, sửa file, dựng lại
  trang rồi đẩy lên. Bốn bước cho ba dòng chữ là đủ để lần sau người ta không
  ghi nữa. Khoá gồm hai mẩu, đặt ở phía máy chủ; chỗ viết cất sau dấu `#viet`
  nên người đọc không bao giờ gặp.
- **Và có đường về nhà.** Ghi chú đăng kiểu ấy sống trong cơ sở dữ liệu: không
  vào RSS, không vào tìm kiếm, tắt JavaScript là không thấy. Nên nó chỉ là chỗ
  đứng tạm — một lệnh kéo chúng về đúng file Markdown, và từ đó chúng thành ghi
  chú bình thường. Không mở một cái cửa mà quên làm lối quay lại.
- **Theme Tĩnh lặng ngả sang xanh trời.** Bảng cũ đi trọn trên trục lam-lục nên
  nhìn lâu thì lạnh và hơi xỉn — cái xanh của nước đứng, không phải của trời.
  Nay nền, quầng nền và mọi sắc mực đều cộng thêm phần lam, chỉ chừa lại một
  nốt lục để bảng màu còn chỗ đổi màu. Chữ đọc rõ hơn bản cũ ở cả bốn mức.

## V1.6.1 — 16-Sep-2026

- **Tên blog ở thanh đầu trang về đúng phông của nó.** Một dấu ngoặc thừa sót
  lại giữa file kiểu dáng đã nuốt mất cả khối luật ngay sau nó, nên dòng tên
  rơi về phông thân bài — đứng, đậm, không ăn nhập gì với chữ *Archive* ngay
  dưới. Một ký tự, và nó im lặng suốt mấy bản.
- **Cột chữ hẹp lại còn 70 ký tự một dòng.** Trước đó là 85 — quá thang đọc êm
  (45–75) khá xa, và mỗi lần hết dòng mắt phải quét ngược một quãng dài mới bắt
  được đầu dòng sau. Khung trang cũng thu lại để hai bên có lề thật, cột bên
  rộng ra cho mục lục thôi gãy dòng.
- **Mấy khoảng trống quá cỡ thu lại.** Chỗ giữa câu tóm tắt và ảnh bìa hở gấp
  đôi ý định vì hai luật cộng dồn lên nhau; vạch đổi cảnh ✦✦✦ chiếm hơn trăm
  pixel, đủ để người đọc tưởng bài đã hết.
- **Bài cũ về cùng một khung với bài mới.** Mấy bài từ 2017 dùng tiêu đề mục
  như cách tô chữ — cả một câu văn nằm ở cỡ chữ tiêu đề, và mục lục thì đầy
  những dòng không dẫn đi đâu. Nay tiêu đề là tiêu đề, câu văn là câu văn. Bài
  không có mục nào cũng không còn để trống một khoảng rộng bên phải.

## V1.6.0 — 16-Sep-2026

- **Hoa Sakura thôi thô.** Cánh từ 5–19px xuống 3,2–11,4px, độ đậm từ 0,46–0,96
  xuống 0,22–0,70, và số cánh tăng gần gấp rưỡi để bù diện tích. Cánh hoa là
  vật MỎNG — ánh sáng xuyên qua được, nên nó không bao giờ đặc như mảnh giấy
  màu; cái làm nên vẻ đẹp là số lượng và cách chúng lượn, không phải cỡ từng
  cánh.
- **Viền cánh nhẹ đi ba lần, và cánh nhỏ thì bỏ hẳn viền.** Đây là chỗ làm cả
  màn thành thô nhất: trên một cánh rộng mươi pixel, nét viền 1,7px chiếm tới
  một phần sáu bề ngang — đọc ra là hình CÓ ĐƯỜNG BAO, tức một cái nhãn dán,
  không phải vật mỏng đang lượn trong không khí. Gân giữa cũng chỉ còn vẽ cho
  lớp gần nhất: chi tiết bên trong chỉ đọc được ở vật gần.
- **Mảng màu đậm co về đúng cái mũi cánh.** Chặng chuyển màu đổi từ 0/0,55/1
  sang 0/0,62/0,88 nên phần trắng chiếm hơn nửa cánh — cánh hoa thật nhạt dần
  về phía gốc và chỉ ngả hồng ở rìa ngoài.

## V1.5.9 — 16-Sep-2026

- **Logo kể một câu chuyện dài hơn, và có kết.** Nét nối (chữ i) nay chạm đúng
  HAI ĐẦU TỰ DO của chữ Z nên nó *khép* hình lại thành một nút thắt vô cực dạng
  đa giác — bản trước để một vạch dựng giữa khung, quét vào rồi xoay, nhìn thì
  có động nhưng nó không nối vào đâu cả. Chặng vòng tròn đổi thành **chữ B**,
  xếp nút trùng khít vô cực đứng nên phép biến hình đọc ra là bụng dưới đang
  vòng ra. Xong hai vô cực thì bốn cánh nở thành **mandala tám cánh**, xoay
  chậm → nhanh → vỡ thành mười tám hạt bụi rơi, rồi tụ lại kể tiếp.
- **Trang giới thiệu nay cũng kể chuyện.** Trước chỉ trang chủ. Bù lại, vòng
  lặp kéo từ 20 lên 30 giây — phần mandala chiếm mất quãng nghỉ cũ, giữ 20 giây
  thì thanh đầu trang gần như không lúc nào đứng yên.
- **"Borderland" hết bị bó giữa cột.** Trò xén hai đầu ở màn đầu dựa trên hai
  con số đo bề ngang con chữ, mà hai số ấy đã lệch 17% so với nét chữ đang thật
  sự hiện ra — nên chữ "d" dừng cách đường kẻ phải 45px, không hề bị xén. Đo
  lại bằng Range ở bốn cỡ chữ, giải lại phương trình, `--s3` từ 20,35 lên
  23,74cqw. Phép kiểm canh việc này trước đây **chỉ canh một chiều** (xén quá
  tay) nên nó im suốt; nay canh cả hai đầu, và đã cắm lại đúng lỗi cũ vào để
  thử xem nó có bắt không.

## V1.5.8 — 16-Sep-2026

- **Theme thứ ba: Tĩnh lặng.** Thác nước, suối, thiền — nền xanh pastel, nút
  chuyển theme thành vòng xoay ba nhịp (sáng → tối → tĩnh lặng) thay vì bập
  bênh hai nhịp. Màn đầu trang chủ có nền động riêng: màn nước rơi, giọt rơi
  tới mặt nước rồi loang thành gợn sóng, bụi nước dâng lên ở chân thác.
- **Hai lỗi cũ lộ ra nhờ phép kiểm mới.** `--text-faint` ở theme tối bị lệch
  giữa hai khối: khối `@media` đã sửa lên `.62` cho đủ tương phản, khối
  `[data-theme="dark"]` còn nằm ở `.50` (3,9:1). Nghĩa là ai để máy ở chế độ
  tối thì đọc được ngày tháng và tem chân trang, ai tự bấm nút chọn tối thì
  không — mà hai khối không bao giờ hiện cùng lúc nên không ai bắt bằng mắt
  được. Lỗi thứ hai: `theme.js` ghi lựa chọn vào localStorage ngay từ lần mở
  trang đầu, nên sau đó trang không còn đi theo cài đặt sáng/tối của máy nữa.
- **Bộ kiểm định lên 42 phép, và một phép cũ được viết lại.** Phép "quầng sáng
  khai đủ ở mọi khối theme" trước đây **xanh mà không kiểm gì cả**: nó dò khối
  bằng `/prefers-color-scheme: dark/` có dấu cách, trong khi tokens.css viết
  liền — thứ khớp được lại là dòng chú thích ở đầu file, và từ đó nó cắt trúng
  trọn khối `:root` sáng vốn khai đủ. Xoá sạch `--glow` khỏi cả hai khối tối
  thì nó vẫn xanh. Nay dò bằng chính dòng mở khối rồi đếm ngoặc. Phép mới canh
  luật tổng quát: Galaxy và Tĩnh lặng phải khai cùng một bộ biến, và hai khối
  Galaxy phải giống nhau từng giá trị.

## V1.5.7 — 16-Sep-2026

- **Rà lại tài liệu.** Ba chỗ đang nói dối: hướng dẫn đăng bài và design system
  đều ghi "hai khung trình bày" trong khi khung C đã có từ V1.3.7; bản đồ trang
  ghi trang chủ hiện "tối đa 6 bài" trong khi cấu hình để 3, và không nhắc trang
  ghi chú. Sửa hết, thêm chương **§19 · LOGO** vào design system.
- **Bộ kiểm định lên 41 phép,** thêm bốn phép cho bốn kiểu hỏng-im-lặng mới:
  bốn đường logo phải cùng cấu trúc `M + 4C` (không thì thôi biến hình được);
  thời lượng vòng lặp khai ở CSS và ở SVG phải khớp; logo và dòng chữ tên blog
  không được cùng hiện; tỉ lệ khung băng ảnh phải nằm trong khoảng Instagram
  cho phép. Cả bốn đều đã thử ngược — cố tình làm sai để xem nó có báo không.

## V1.5.6 — 16-Sep-2026

- **Bỏ hẳn con chữ khỏi logo.** Bản trước dựng chặng chữ bằng `<text>` thật, lấy
  đúng con chữ Z, i, B cùng phông nghiêng. Nhìn thì hỏng: một chữ serif có chân,
  có nét thanh nét đậm, dán vào giữa một hình toàn nét tròn đều đọc ra là *chữ
  bị dán vào*, không đọc ra là hình đang biến.
- **Giờ mọi chặng đều vẽ bằng nét,** cùng bề dày, cùng đầu bo tròn như hai vòng
  vô cực. Và nét **cong dần** ra thành hình chứ không mờ đi rồi hiện cái khác:
  nét gấp khúc chữ Z cong ra thành vô cực thứ nhất, vòng tròn vặn thành vô cực
  thứ hai. Cả bốn đường cùng cấu trúc `M + 4C` nên trình duyệt nội suy được.
- **Không còn phụ thuộc phông chữ** — Google Fonts tải chậm hay hỏng cũng không
  ảnh hưởng gì tới logo.

## V1.5.5 — 16-Sep-2026

- **Băng ảnh nhận ảnh dọc cho ra hồn.** Khung trước đây cao cố định và nằm
  ngang, nên ảnh dọc tuy vẫn vào trọn nhưng bé tí giữa hai dải nền. Nay khung
  lấy tỉ lệ theo **tấm đầu tiên**, kẹp trong khoảng Instagram và Facebook cho
  phép (4:5 dọc nhất … 1.91:1 ngang nhất) — đúng cách hai nền tảng ấy làm, và
  cả băng dùng chung một khung nên trượt qua lại không nhảy cao thấp.
- **Vẫn không cắt ảnh.** `contain` chứ không `cover`: ảnh lệch khỏi khung thì
  có dải nền ở hai bên, chứ không bị xén mất phần rìa — mà ảnh kỉ niệm thì phần
  rìa hay lại là phần có người.
- **`npm run bia -- <slug> --doc`** sinh ảnh dọc 1080×1350 cho băng ảnh, một tấm
  cho mỗi dòng trong `anh:`, hạt giống lấy theo chú thích nên mỗi tấm một hình.

## V1.5.4 — 16-Sep-2026

- **Hai đầu dòng chữ đều bị xén, và xén có con số.** Chữ đầu khuất một phần ba
  sau đường kẻ trái, chữ "d" cuối khuất một nửa sau đường kẻ phải. Xén đều hai
  bên thì cả khối đọc ra là được đặt vào khuôn rồi khuôn cắt bớt — cố ý. Xén
  một bên thì đọc ra là tràn lề.
- **Chữ to hơn.** Cỡ không ướm mà giải ra từ hai con số đo được (cả từ chiếm
  5,117 lần cỡ chữ, riêng chữ "d" chiếm 0,538) — ra 20,35cqw.
- **Khối chữ nhấc lên giữa khung.** Đáy cột có hàng nút chiếm một dải; căn giữa
  cả cột thì khối chữ bị đẩy xuống nằm đè lên dải ấy. Chừa dải ra rồi mới căn,
  và chừa dư một nhịp vì khối này nặng đáy.

## V1.5.3 — 16-Sep-2026

- **Logo tự kể lại trình tự dựng hình, và lặp.** Ở trang chủ, cứ 20 giây một
  vòng: bốn cánh xoay rồi vỡ ra → *Zoey in Borderland* hiện lên → cả dòng bóp
  lại còn một điểm → chữ Z → Z xoay ngang → chữ i trượt vào, xoay ngang, nối
  hai đầu → **vô cực thứ nhất** → chữ B → B vặn thành vòng → **vô cực thứ hai**
  → bốn cánh đủ hình.
- **Chữ trong logo là chữ THẬT.** Z, i, B lấy đúng con chữ trong tên blog, cùng
  phông nghiêng — vẽ tay thì thành ba hình hao hao chữ và câu chuyện "cái tên co
  lại thành logo" mất nghĩa ngay ở bước đầu.
- **Nghỉ chiếm 42% vòng.** Kể xong thì đứng yên 8 giây. Một hình động lặp liên
  tục ở thanh đầu trang là thứ mắt không bỏ qua được, mà người ta tới đây để
  đọc. Trang giới thiệu giữ logo tĩnh, vẽ một lần rồi thôi. Bật "giảm chuyển
  động" thì dừng hẳn ở hình đủ.

## V1.5.2 — 15-Sep-2026

- **Logo đứng một mình thì to lên.** Ở trang chủ và trang giới thiệu, ô thương
  hiệu không còn dòng chữ nên logo nới từ 30px lên 36px — vẫn thấp hơn thanh
  đầu trang nên không đẩy gì, mà bốn cánh mới đọc ra được hình.
- **Ghi chú có đường vào từ chân trang.** Nó đã thế chỗ Tags ở thanh trên; chân
  trang nay có cả hai, nên mấy chục trang tag không thành trang mồ côi.

## V1.5.1 — 15-Sep-2026

- **Từ "Borderland" không còn bị cắt cụt.** Cỡ chữ ở màn đầu tính theo bề ngang
  khung, và bản trước đặt quá tay: từ dài 914px trong cột rộng 712px, thò ra
  266px rồi chui xuống dưới khung danh sách bên phải — trên màn hình đọc ra là
  "Borderl". Nay từ trải đúng hết bề ngang cột, mép phải dừng ở đường kẻ.
  Chữ đầu vẫn lấn qua đường kẻ TRÁI như cũ: bên trái là khoảng trống nên lấn
  sang là cố ý, bên phải có khung chữ nên lấn sang là đè lên.
- **Thêm một phép kiểm canh đúng chỗ ấy.** Nó đọc thẳng file CSS, tính bề ngang
  từ ra rồi so với bề ngang cột — bắt được ngay lúc build thay vì phải mở trình
  duyệt nhìn. Bộ kiểm định lên 37 phép.

## V1.5.0 — 15-Sep-2026

- **Chân trang khổ dọc canh về một mép.** Trên điện thoại, khối liên kết và
  khối tem phiên bản trước đó mỗi khối canh một kiểu — một bên trái, một bên
  giữa — nên nhìn như hai mảnh rời. Nay cả hai bắt đầu ở đúng cùng một mép
  trái với cột chữ phía trên. Đo lại: bốn khối đều mở ở x=20px.

## V1.4.9 — 15-Sep-2026

- **Trang giới thiệu bỏ hiệu ứng nền.** Trang ấy nhiều chữ nhất trong cả blog;
  thêm một lớp hạt bay phía sau thì mắt phải tự lọc hai thứ cùng lúc. Nền tĩnh,
  chữ đọc dễ hơn. Muốn bật lại thì sửa một dòng `nen:` trong front matter.

## V1.4.8 — 15-Sep-2026

- **Chữ Z che đúng một phần ba.** Che ở VIỀN CỘT chứ không phải viền ngoài màn
  hình — mép trái chữ dừng ở 270px so với mép cột 339px, tức 69/190px = 36%.
- **Chữ "in" sát lại chữ Z.** Khoảng hở còn 6px thay vì một khoảng trắng lửng
  lơ; lúc chữ sắp lại thì không đè lên nhau.
- **"Borderland" giãn thêm.** Dòng dưới nay trải gần hết bề ngang cột, cân với
  khối chữ Z ở trên thay vì thụt vào giữa.

## V1.4.7 — 15-Sep-2026

- **Dải ngân hà dày và sáng hơn.** Gấp đôi số sao, thêm một lớp bụi, và quan
  trọng nhất: độ sáng giảm dần theo bán kính — đậm đặc ở lõi rồi loang nhạt ra
  ngoài, như ảnh thật. Trước đó sao sáng đều nhau nên nhìn ra một đám chấm chứ
  không ra một dải. Vẫn quay, vẫn một vòng ~2,5 phút.

## V1.4.6 — 15-Sep-2026

- **Logo hai vòng vô cực.** Dựng theo đúng thứ tự trong ý tưởng gốc: *Zoey in
  Borderland* thu lại còn chữ Z, Z xoay ngang, chữ *i* xoay ngang nối hai đầu —
  ra vòng vô cực thứ nhất; chữ B vặn thành vòng thứ hai. Hai vòng bắt chéo nhau
  90° thành một hoa thị bốn cánh. Nét vẽ chạy từ từ khi trang mở, kể lại đúng
  trình tự ấy.
- **Logo chỉ ở trang chủ và trang giới thiệu.** Các trang khác giữ nguyên dòng
  chữ *Zoey in Borderland*. Không bao giờ hiện cả hai cùng lúc — logo là chữ
  ấy viết lại, đặt cạnh nhau thì thành nói hai lần.

## V1.4.5 — 15-Sep-2026

- **Trang ghi chú ngắn.** Bắt gặp một quyển sách, một bản nhạc, một ý thoáng
  qua thì mở `content/ghi-chu.md` gõ vài dòng — không tiêu đề, không ảnh bìa,
  không chuyên mục. Một file duy nhất chứ không mỗi ghi chú một file: ba dòng
  mà phải tạo file, đặt tên, khai front matter thì lần sau không ai ghi nữa.
  Loại (sách · nhạc · ý · …) muốn đặt gì cũng được, trang tự gom thành bộ lọc.
  Nó thay Tags trên thanh điều hướng; trang tag từng bài vẫn còn nguyên.

## V1.4.4 — 15-Sep-2026

- **Khung xem ảnh cố định.** Ảnh dùng `contain` chứ không `cover`: `cover`
  phóng ảnh cho lấp kín khung rồi CẮT phần thừa, mà với ảnh kỉ niệm thì phần bị
  cắt hay lại là phần có người. Nay dọc hay ngang đều vào trọn. Chiều cao khoá
  theo màn chứ không theo tỉ lệ ảnh — khối này dính khi cuộn, nên cả cụm ảnh +
  chú thích + hàng chấm phải lọt trong một màn; cao theo tỉ lệ ảnh thì một tấm
  dọc đẩy hàng chấm xuống dưới nếp gấp và người đọc không biết là còn ảnh.

- **Khối chữ lùi vào trong khung khi hiện đủ.** Lúc mờ, chữ lấn qua đường kẻ là
  cố ý — đó là trò xén. Nhưng khi chữ đã rõ thì nó là chữ ĐỂ ĐỌC, và chữ để đọc
  dính vào đường kẻ thì đọc ra là tràn lề. Chữ đầu cũng bị xén sâu hơn, và chữ
  giữa kéo lại gần.

- **Lại là cái tooltip.** Một nút mới nằm sát mép phải, tooltip của nó đẩy trang
  tràn ngang 24px — và không phần tử nào lộ ra khi quét, vì pseudo-element không
  nằm trong danh sách phần tử. Lần thứ hai vấp đúng chỗ này.

## V1.4.3 — 15-Sep-2026

- **Đếm lượt xem thật.** Cloudflare Web Analytics đếm rất tốt nhưng KHÔNG có
  API đọc ngược — số liệu chỉ xem được trên bảng điều khiển, không in lên bài
  được. Nên con số này giữ trong D1. Chọn D1 chứ không KV vì KV giới hạn mỗi
  khoá một lượt ghi mỗi giây, mà bộ đếm đúng là cái kiểu ghi ấy.

- **Nói thẳng nó gần đúng.** Bot biết chạy JavaScript vẫn lọt; tải lại trong
  cùng phiên không cộng thêm nhưng mở tab mới thì tính lại; và không biết ai là
  ai — cố ý không biết. Mặc định TẮT, chưa gắn D1 thì trang lặng lẽ bỏ qua.

## V1.4.2 — 15-Sep-2026

- **Trích dẫn thành tab bên lề bài**, ngay dưới mục lục, cùng một khối dính khi
  cuộn. Đổi câu sau mỗi HAI trang: giữ nguyên cả phiên thì nó thành mảng trang
  trí chết, đổi mỗi lần tải trang thì thành nhấp nháy và người quay lại tab cũ
  thấy câu khác.

- **Nền động nhạt hẳn ở trang tĩnh.** Màn hero chỉ có mấy nhãn nhỏ nên nền động
  là nhân vật chính; trang giới thiệu thì kín chữ, và cánh hoa rơi sau chữ ở độ
  đậm của màn hero làm mắt bị kéo đi liên tục.

## V1.4.1 — 15-Sep-2026

- **Trang Posts thành thư mục chuyên mục.** Đo ra thì nó đang liệt kê ĐÚNG cùng
  9 bài với Archive, chỉ khác là có tóm tắt và tag — hai trang cùng trả lời một
  câu hỏi thì một cái là thừa. Nay ba trang trả lời ba câu khác nhau: Posts =
  blog này viết về những gì, Archive = viết vào lúc nào, tag = sợi chỉ nào xuyên
  qua. Mỗi mục khoe ba bài mới nhất rồi dẫn vào trang mục.

- **Thẻ bài giữ hai tag.** Ba cái thì ở bề ngang một cột lưới thường không đủ
  chỗ, và luật giữ cho thẻ cao bằng nhau cắt cái thứ ba làm đôi — một chữ bị
  cắt giữa chừng đọc ra là trang hỏng.
## V1.4.0 — 15-Sep-2026

- **Dải ngân hà dựng lại từ đầu.** Bản trước cho ra một SỢI sao mảnh vắt chéo
  màn hình. Sai ở mô hình: nó rải sao dọc đường xoắn rồi thêm nhiễu vào GÓC —
  mà cùng một góc ở vòng ngoài cho ra khoảng cách lớn hơn nhiều so với vòng
  trong, nên nhánh bó chặt ở trong và loe ra ở ngoài. Nay bề dày dải tính bằng
  khoảng cách thật rồi mới đổi ra góc, nên dải đều từ trong ra ngoài.

- **Thêm nền sao.** Sao rải khắp khung và KHÔNG quay theo đĩa — đây là tầng nói
  "đây là bầu trời", và là thứ bản trước thiếu hẳn. Cộng thêm bụi khí bám đúng
  theo nhánh, và lõi nhỏ lại có mấy cục sáng lệch tâm cho đỡ phẳng.

- **Vẫn quay.** Khoảng hai phút rưỡi một vòng, vòng trong nhanh hơn vòng ngoài
  một chút — chính chênh lệch ấy làm nhánh xoắn "chảy". Chỉ một chút thôi: chênh
  nhiều thì sau vài phút nhánh tự cuốn chặt và hình xoắn biến mất.

- **Khối chữ cân lại.** Chữ đầu từ 58 xuống 44 phần trăm bề ngang ô: ở cỡ cũ nó
  cao gấp hai lần rưỡi từ cuối và thôi làm một phần của khối chữ, thành một vật
  riêng đứng cạnh. Từ cuối lùi vào một bậc để hai dòng cài vào nhau, và khi co
  lại thì giãn chữ ra bù cho phần cỡ vừa mất.

## V1.3.9 — 15-Sep-2026

- **Kính trong hơn.** Ruột kính ở theme tối đang dày gần gấp đôi mức cần, cộng
  với mức nâng bão hoà 1,9 — nên thẻ bài đọc ra là những khối tím đặc chứ không
  phải kính. Nay ruột mỏng đi và bão hoà về 1,25: thấy được nền phía sau, và
  cái làm nên chữ "liquid" là vệt sáng ở mép chứ không phải mảng màu.

- **Thẻ trong cùng một hàng cao bằng nhau.** Đáy hàng răng cưa là thứ đầu tiên
  mắt bắt được khi nhìn một lưới, trước cả khi đọc chữ. Kèm theo: tóm tắt kẹp ba
  dòng, hàng tag kẹp một hàng, và mốc cập nhật không hiện trên thẻ nhỏ — ba thứ
  ấy mới là cái giữ cho chiều cao đoán trước được.

- **Trang chủ giữ 3 bài** thay vì 6. Sáu thẻ dưới màn hero là một bức tường,
  không phải một lời mời.

## V1.3.8 — 15-Sep-2026

- **Có logo.** Chữ Z xoay ngang thì ba nét của nó thành vạch trái · chéo · vạch
  phải; nối hai đầu còn lại bằng một đường chéo nữa là ra một hình vô cực vẽ
  bằng nét thẳng. Chấm giữa là dấu chấm của chữ "i" trong "in", đặt đúng chỗ hai
  đường chéo gặp nhau. Nét tự vẽ ra khi mở trang.

- **Vẽ đơn, không vẽ dày như hình mẫu.** Hình mẫu có bốn đường chéo và một hình
  thoi ở giữa — đẹp ở cỡ lớn, nhưng logo này sống ở thanh đầu trang cao 26px, và
  ở cỡ đó bốn nét cách nhau vài pixel sẽ dính thành một vệt xám.

- **Tên blog sắp lại khi rê chuột.** Mặc định để mờ và các chữ nép sát nhau; rê
  vào thì giãn ra và rõ hẳn. Ở trang chủ thì ẩn hẳn — màn hero ngay dưới đã in
  cái tên ấy ở cỡ khổng lồ. Tên vẫn nằm trong `aria-label` nên trình đọc màn
  hình luôn đọc được, kể cả ở trang chủ.
## V1.3.7 — 15-Sep-2026

- **Khung C — bài ảnh ngắn.** Vài tấm kỉ niệm bên trái, mấy dòng tản mạn bên
  phải. Kiểu bài này không hợp khung đọc dài: bốn dòng chữ bày ra giữa cột 66
  ký tự thì trông như bài bị cụt giữa chừng. Ở khổ rộng, băng ảnh DÍNH lại khi
  cuộn — chữ trôi qua bên cạnh trong khi ảnh đứng yên; khổ hẹp thì ảnh trước,
  chữ sau.

- **Băng ảnh trượt bằng chính trình duyệt.** Vuốt trên điện thoại, lăn chuột
  ngang, kéo thanh cuộn, đi bằng phím mũi tên — tất cả đều chạy kể cả khi
  JavaScript không chạy, vì đó là hành vi có sẵn. JavaScript chỉ thêm hàng chấm
  và hai nút. Thư viện carousel làm ngược lại: chặn cuộn thật rồi dựng lại bằng
  mã, sau đó phải tự vá lại từng thứ vừa phá.

- **Ảnh nhận cả đường dẫn ngoài.** Ảnh đã up ở chỗ khác thì dán thẳng địa chỉ,
  không phải tải về bỏ vào kho chỉ để đăng một lần.
## V1.3.6 — 15-Sep-2026

- **Chữ thân bài đo lại.** Cảm giác "chữ to quá" hoá ra không phải lỗi của cỡ
  chữ: nó đến từ khoảng dòng 1,78 cộng cột chữ chỉ 58 ký tự — khối chữ nở ra,
  mỗi dòng ít chữ, mắt phải xuống dòng liên tục. Nay khoảng dòng 1,65 (vẫn dư
  chỗ cho dấu tiếng Việt chồng trên chồng dưới), cột chữ 66 ký tự, và cỡ chữ
  chỉ hạ một bậc nhỏ. Khoảng cách hai đoạn siết từ 1,5 xuống 1,25 lần cỡ chữ —
  lớn hơn một chiều cao dòng thì mỗi đoạn thành một hòn đảo và mắt phải nhảy.
  Khoảng quanh ảnh từ 1,9 xuống 1,45.

- **Căn đều hai bên.** Sách vở bảo đừng căn đều khi không ngắt được âm tiết —
  luật ấy viết cho tiếng Anh. Đo trên chính kho bài: 5.888 từ, dài trung bình
  3,5 ký tự, chỉ 0,1% dài quá 8 ký tự. Khoảng trắng chỉ phải giãn nhiều khi có
  từ dài không xuống dòng được, mà tiếng Việt gần như không có từ nào như thế.
  Nên ở đây căn đều cho mép phải thẳng mà hầu như không phải trả giá. Dưới
  560px thì tự tắt: cột hẹp quá, mỗi dòng chỉ còn 8–10 khe để chia.

- **Một khung duy nhất cho trang bài, và bài nào cũng có mục lục.** Tiêu đề
  từng bị bóp lại còn hơn nửa bề ngang — không phải vì khung hẹp, mà vì bài
  thiếu mục lục trong khi lưới vẫn giữ chỗ cho cột mục lục. Đã thử cho đầu bài
  rộng hơn thân bài: tiêu đề dàn ra đẹp, nhưng ba khối xếp chồng mà lệch mép
  thì đọc ra là hai khung chồng nhau. Nay mục lục dựng từ một mục trở lên, và
  có phép kiểm canh bài không có tiêu đề mục nào.

- **Một câu dẫn, một khuôn.** Ô tóm tắt dưới tiêu đề và câu dẫn trong thân bài
  giờ cùng một kiểu. Bài nhập từ blog cũ mở đầu bằng khối trích dẫn — chính là
  câu dẫn — nay được bỏ khỏi thân bài sau khi đã lấy làm tóm tắt, thay vì bắt
  người đọc đọc một đoạn hai lần cách nhau chưa tới một màn.
## V1.3.5 — 15-Sep-2026

- **Ngày đăng gốc, và mốc cập nhật riêng.** Bài 2017 mãi là 2017 — ngày đăng
  không bao giờ đổi. Bên cạnh nó là mốc sửa gần nhất, ghi theo lối tương đối:
  "Updated 3 days ago", "Updated 6 months ago". Chữ tương đối do trình duyệt
  tính chứ không nướng sẵn vào trang: trang tĩnh nằm trên máy chủ hàng tháng,
  nướng sẵn "15 phút trước" thì dòng ấy đứng đó mãi mãi và thành sai.

- **Mốc tự cập nhật, không phải gõ tay.** Một cuốn sổ nhỏ ghi vân tay nội dung
  từng bài; sửa bài thì vân tay đổi và mốc tự ghi mới. Vân tay cố ý KHÔNG tính
  front matter — thêm một cái tag hay dán dòng ảnh bìa không phải là sửa bài,
  mà tính cả thì mỗi lần sinh ảnh bìa là mọi bài đều thành "vừa cập nhật".

- **Bỏ "phút đọc".** Nó là con số máy ĐOÁN từ số chữ, và với văn xuôi tiếng
  Việt có cả thơ trích lẫn danh sách thì nó sai đều. Chỗ ấy để dành cho lượt
  xem — con số thật.

## V1.3.4 — 15-Sep-2026

- **Màn đầu ở khổ dọc trở lại đúng một màn.** Bản trước xếp dọc đủ bốn khối nên
  màn đầu dài hơn màn hình, chữ chen nhau, và nền động gần như không thấy đâu —
  mà nền động mới là thứ người đọc gặp đầu tiên, chữ tên blog cố ý làm mờ cũng
  là để nhường chỗ cho nó. Nay bỏ hẳn danh sách ba bài ở màn đầu (cuộn xuống
  một nhịp đã có trọn danh sách rồi), ba khối còn lại giãn ra cho vừa khít, và
  khoảng trống giữa chúng để hiệu ứng thở.

- **Thẻ bài gọn lại ở khổ dọc.** Tóm tắt kẹp hai dòng, tag giữ hai cái, lề trong
  siết lại. Một màn điện thoại trước chứa nổi hai bài, giờ là ba — và người đọc
  lấy lại được khả năng lướt.

## V1.3.3 — 15-Sep-2026

- **Cánh hoa có chiều sâu.** Mỗi cánh mang một "lớp xa gần", và cỡ, độ đậm, tốc
  độ rơi, độ dày viền đều suy ra từ đó: cánh gần thì to, rõ, rơi nhanh; cánh xa
  thì nhỏ, mờ, trôi chậm. Thêm gân giữa cho cánh đủ lớn. Cánh to gần gấp đôi nên
  số cánh phải BỚT đi — giữ nguyên số mà phóng to là màn hình kín đặc.

- **Thiên hà tràn cả hai mép.** Bản trước chỉ vươn khỏi mép phải, nửa trái màn
  trống trơn, nên cái đang thấy đọc ra là một đốm sáng lệch chứ không phải một
  dải ngân hà. Nay đĩa rộng hơn nửa màn, sao dày gấp đôi, nhánh xoắn thu gọn lại
  cho ra dải rõ ràng, và lõi sáng nhỏ đi để nhánh làm chủ.

## V1.3.2 — 15-Sep-2026

- **Chữ giữa tách khỏi chữ đầu.** Nó đang nép sát quá, đọc ra như một dấu phụ
  của chữ Z chứ không phải một từ.

- **Hai dòng thôi đè nhau lúc co lại.** Đuôi chữ "y" của dòng trên thò xuống
  đúng thân chữ "d" của dòng dưới — hai nét chồng nhau và mắt đọc ra là lỗi in.
  Chữ nghiêng kiểu Cormorant có đuôi rất dài nên khoảng dòng cũ không đủ; mở
  thêm một chút là vừa hở mà vẫn chưa thành hai dòng rời rạc.
## V1.3.1 — 15-Sep-2026

- **Posts và Archive có số trang.** Danh sách dài hơn 10 bài thì tự có bộ số
  ‹ 1 2 3 › ở cuối, và **người đọc chọn được số bài mỗi trang** — 10, 20, 50
  hay tất cả. Trình duyệt nhớ lựa chọn đó cho lần sau. Cắt trang làm ở trình
  duyệt chứ không cắt lúc dựng: cắt lúc dựng thì mỗi lựa chọn là một bộ file
  riêng, nhân lên theo từng chuyên mục và từng tag. Người tắt JavaScript thấy
  trọn danh sách — dài hơn, nhưng không thiếu bài nào.

- **Giãn cách vừa lại.** Trang danh sách trước dùng khoảng cách của trang BÀI,
  nơi tiêu đề phải tách hẳn khỏi thân bài. Ở danh sách thì tiêu đề và danh sách
  là một khối việc, nên khoảng cách rút lại — và trên laptop 13" giờ thấy được
  bài đầu tiên ngay khi mở, không phải cuộn.

- **Sửa một lỗi giấu mặt.** Trình duyệt cài sẵn `hidden` ở mức yếu hơn mọi luật
  CSS mình viết, nên thẻ bài vẫn hiện nguyên dù đã bị đánh dấu ẩn. Không lỗi
  nào cả — bộ số trang chạy đúng, đếm đúng, mà trang vẫn ra đủ tám bài. Chỉ lộ
  ra khi đo màu sắc thật của phần tử thay vì tin vào thuộc tính.

## V1.3.0 — 15-Sep-2026

- **Trang chủ giữ tối đa 6 bài**, không kể bài nổi bật. Trang chủ là chỗ mời
  vào, không phải chỗ liệt kê kho bài: đổ hết bài ra đây thì cuộn mãi không hết
  mà vẫn không có cách nào lọc.

- **Hai lối đi dưới lưới bài.** Posts xếp theo chuyên mục, Archive xếp theo
  năm — hai cách tìm khác nhau, nên để cả hai thay vì bắt người đọc đoán.

## V1.2.9 — 15-Sep-2026

- **Chữ Z thôi bay lên và thôi bị cắt.** Bản trước cho mỗi dòng một toạ độ
  riêng, và dòng đầu lấy toạ độ âm để bị viền trên xén — kết quả là chữ Z bay
  quá cao và mất mất một phần. Nay hai dòng nằm trong dòng chảy bình thường và
  cả cụm căn giữa theo chiều dọc: không mất chữ nào, mà từ cuối vẫn chạy khỏi
  đường kẻ phải như cũ.

- **Từ cuối chỉ co nhẹ khi rê chuột.** Cỡ lúc mờ đã đúng rồi; co mạnh là mất
  luôn sức nặng của nó.

- **"Zoey in" về cùng một hàng khi co lại.** Muốn thế thì "in" phải là chữ nằm
  CÙNG DÒNG chứ không phải một khối riêng — ba khối tách rời thì CSS phải biết
  trước bề rộng chữ "Zoey" mới xếp được "in" ngay sau, mà bề rộng ấy đổi theo
  font và theo cỡ. Lúc nghỉ nó bị đẩy lệch sang phải bằng phép dịch hình, tức
  là dịch chỗ NHÌN mà không dịch chỗ NẰM, nên lúc co lại chỉ cần trả phép dịch
  về 0 là nó tự về hàng.
## V1.2.8 — 15-Sep-2026

- **File cài đặt có mục đo lượt xem.** Bốn bước, kèm hai chỗ dễ sai: bật ở cả
  `site.config.json` lẫn nút trên bảng điều khiển Cloudflare thì một trang có
  hai đoạn beacon và mỗi lượt xem đếm thành hai; và token đo lượt xem là thứ
  CÔNG KHAI, khác hẳn khoá Gemini — nó nằm nguyên văn trong HTML mọi trang nên
  để trong repo là đúng chỗ.
## V1.2.7 — 15-Sep-2026

- **Chữ lớn bị đường kẻ của lưới xén, không phải bị mép cửa sổ xén.** Bản trước
  phủ khối chữ lên cả màn nên chữ Z bị cắt ở mép cửa sổ — mà mép cửa sổ không
  phải một đường nét của trang, nó chỉ là chỗ màn hình hết. Xén ở đó trông như
  chữ tràn ra ngoài chứ không như chữ được đặt vào khuôn. Nay khối chữ chiếm
  đúng một ô của lưới: chữ đầu chạm và bị xén ở đường kẻ trái, từ cuối chạy
  khỏi đường kẻ phải.

- **Khổ dọc dựng lại hẳn.** Trước là lưới ba cột bị bóp lại, và nó xấu thật:
  nút cuộn-xuống nhảy lên đầu trang, còn tên blog nằm mờ phía sau đè lên chữ.
  Nay là một bố cục riêng, đọc từ trên xuống: tên blog cỡ lớn đọc được, rồi ba
  bài mới nhất, rồi trích dẫn và lối sang trang giới thiệu, rồi nút cuộn xuống.

- **Bớt hai thứ ở màn đầu.** Ô đếm số bài đặc màu ở cột giữa bỏ hẳn, và cửa vào
  trang giới thiệu rút còn một dòng. Màn đầu chỉ nên có MỘT thứ có khối lượng;
  hai thứ thì chúng tranh nhau và không thứ nào thắng.

## V1.2.6 — 15-Sep-2026

- **Đo lượt xem, không đặt cookie.** Cloudflare Web Analytics, khai một dòng
  trong file cấu hình, **mặc định tắt**. Không cookie nghĩa là không phải dựng
  banner xin phép — mà banner ấy là thứ đầu tiên người đọc gặp, và nó nói rằng
  trang này đang lấy gì đó của họ. Nó đo luôn tốc độ thật của người đọc chứ
  không phải điểm giả lập trên máy mình.

- **Đoán trước trang kế.** Trình duyệt tải sẵn trang mà người đọc rê chuột vào,
  nên bấm xong hiện gần như tức thì. Chỉ TẢI trước chứ không CHẠY trước — chạy
  trước thì mỗi link rê chuột qua đều bị tính một lượt xem và số liệu thành rác.

## V1.2.5 — 15-Sep-2026

- **Số phiên bản có luật, và có chỗ canh luật.** Đuôi bản vá chỉ chạy 00 tới 09
  — không có V1.1.10. Bộ ghi sổ bản đầu không có cái chặn ấy nên cứ cộng dồn: sổ
  đã đi tới V1.1.14 rồi mới có người nhận ra. Nay chạm 09 thì bản kế tự mở build
  mới, và có một phép kiểm canh cả sổ chứ không riêng dòng mới. Năm dòng lỡ ghi
  sai đã đánh số lại thành V1.2.0–V1.2.4.
## V1.2.4 — 15-Sep-2026

- **Tên blog thành khối đồ hoạ ở màn đầu.** Lúc nghỉ: chữ Z nhô lên góc trái và
  bị viền trên cắt mất một phần, rồi "in" nhỏ đứng lệch, rồi "Borderland" tụt
  xuống một tầng và chạy khỏi mép phải — đọc ra là một khối bị khung xén chứ
  không phải một dòng tiêu đề. Rê chuột vào khung thì cả khối co lại, phần chữ
  còn thiếu chạy vào, và tên hiện đủ trong khung; rời chuột thì về lại như cũ.
  Màn cảm ứng lấy luôn trạng thái hiện đủ làm mặc định — không có chuột thì
  không bao giờ rê được.

- **Góc trái màn đầu là cửa vào trang giới thiệu.** Trước đó chỗ ấy chỉ có một
  dòng mô tả lặp lại điều thẻ meta đã nói. Nay là tên người viết và một lối đi
  sang trang giới thiệu — thứ người lạ muốn biết sau câu "trang này là gì".

- **Trích dẫn mỗi ngày chuyển từ trang giới thiệu ra màn đầu.** Ở màn đầu nó là
  thứ người đọc gặp đầu tiên mỗi ngày; ở trang giới thiệu nó chen vào giữa lúc
  người ta đang đọc về chủ trang mà lại chêm lời của người khác. Ô giới thiệu
  lấy luôn hai cột trống đó và nhận được nhiều đoạn văn, không chỉ một câu.
## V1.2.3 — 15-Sep-2026

- **Tài liệu thôi nói dối.** Mục "Trạng thái" trong README và mục "Việc còn
  lại" trong sơ đồ trang vẫn viết rằng trang chủ là bản tạm và các trang
  Posts · Tags · Search · Archive · About chưa dựng — cả năm trang ấy dựng xong
  từ mấy bản trước. Bảng lệnh cũng thiếu ba công cụ mới. Viết lại theo hiện
  trạng, và bỏ luôn số phiên bản khỏi README: sổ lịch sử là nguồn duy nhất,
  nhắc lại ở chỗ thứ hai là sớm muộn cũng lệch.

- **Có mục trả lời câu "nên dùng thêm gì của Cloudflare".** R2, D1, KV, Workers
  — cái nào hợp, cái nào là lời khuyên viết cho trang động đem áp nhầm vào
  trang tĩnh, và mốc nào thì nên đổi. Kèm chỗ dễ làm hỏng nhất: đặt cache một
  năm cho tệp giao diện khi tên tệp chưa có vân tay nội dung — sửa giao diện
  xong người đọc cũ vẫn thấy bản cũ suốt một năm.

- **Hướng dẫn nhập bài cũ.** Cách chạy công cụ, bảng đổi trường, và ba việc
  phải làm bằng tay sau khi nhập: tỉa tag, sinh ảnh bìa, khai tiêu đề ngắn cho
  bài tiêu đề dài.
## V1.2.2 — 15-Sep-2026

- **Bỏ một phép kiểm không bao giờ chạy được.** Có hai phép kiểm canh bản
  nháp: một soi thư mục xuất bản, một soi sitemap và RSS. Cái thứ hai vô
  dụng — sitemap dựng ra từ chính danh sách trang trong thư mục xuất bản, nên
  nháp chỉ lọt vào sitemap khi nó đã lọt vào bản dựng, mà lúc đó cái thứ nhất
  đã báo đỏ rồi. Hai dòng xanh cho một việc là tự dối mình. Gộp làm một.

- **Thêm hai phép kiểm cho hạng lỗi không bao giờ kêu.** Mọi file JavaScript
  phải thật sự lên bản dựng và phải đọc được cú pháp — trước đây quên đăng ký
  một file là tính năng đó lặng lẽ không chạy, y hệt lần vấp với bộ CSS. Và
  mọi nhãn giao diện nhúng trong HTML phải là JSON hợp lệ — sai một dấu nháy
  là cả khung bình luận trắng trơn mà không báo gì.

- **Phép kiểm nền động soi cả bài viết.** Trước chỉ soi trang tĩnh, nên gõ
  `nen: dong` vào một bài viết là nó im lặng không có tác dụng. Phép kiểm chỉ
  soi đúng chỗ mình đã nghĩ tới thì nó canh cho chính mình, không canh cho
  người dùng.

- **Tiêu đề dài có đường thoát.** Bài nào khai tiêu đề ngắn thì thẻ tiêu đề
  gửi cho Google dùng bản ngắn, còn tiêu đề in trên trang vẫn nguyên vẹn.
  Bốn phép kiểm mới đều đã thử cắm lỗi vào để xem nó có bắt thật không.
## V1.2.1 — 15-Sep-2026

- **Thiên hà to bằng khung.** Đĩa ngân hà ở theme tối trước đây lấy cỡ theo
  cạnh NGẮN của màn. Đĩa lại bị ép dẹt còn một phần ba chiều cao, nên cạnh
  ngắn chưa bao giờ là thứ chạm mép trước — kết quả là trên màn ngang nó co
  lại thành một cái huy hiệu nhỏ dán ở góc. Giờ cỡ đĩa đo theo chiều ngang và
  đường kính hơi tràn mép, nên nhánh xoắn chạy ra khỏi khung; số sao cũng tăng
  theo để nhánh không bị thủng lỗ chỗ. Quầng lõi chỉ nhỉnh lên một chút —
  phần to ra phải là nhánh xoắn, không phải cục sáng giữa màn.

## V1.2.0 — 15-Sep-2026

- **Năm bài năm 2017.** Nhập từ bản xuất WordPress của blog cũ, vào bốn mục:
  Musings, Books, Food, Tarot. Thân bài giữ nguyên văn, kể cả emoji và giọng
  văn thời ấy — sửa lại là làm giả lịch sử. Mỗi bài mang thêm nhãn `published`
  (đã từng đăng ở nơi khác) và ngày cập nhật là ngày đưa về đây, nên trang bài
  in cả hai mốc: viết năm 2017, dựng lại hôm nay.

- **Có công cụ nhập.** `npm run nhap` đổi front matter kiểu WordPress sang
  khuôn của blog, tự xếp bài vào thư mục chuyên mục và tự lập tên hiển thị cho
  chuyên mục mới. Sửa tay năm bài thì nhanh hơn viết công cụ, nhưng bản xuất
  WordPress thường có hàng trăm bài, và công cụ làm sai thì sai đều — sửa một
  chỗ là xong.

- **Tag thì tỉa, chữ thì không.** Tag WordPress 2017 là kiểu rải từ khoá cho
  máy tìm kiếm: một bài có tới bốn tag cho cùng một ý. Ở đây mỗi tag sinh một
  trang, nên giữ nguyên là được mười bốn trang mỗi trang đúng một bài. Tag là
  đường đi nên tỉa còn bốn–năm; thân bài là chữ của người viết nên không đụng.
## V1.1.9 — 15-Sep-2026

- **Trang chủ hai màn.** Màn đầu cao trọn màn hình: tên trang cỡ lớn và 1–3 bài
  mới nhất, mỗi bài đúng một dòng tiêu đề ngắn. Cuộn xuống (hoặc bấm mũi tên)
  thì ra đúng trang danh sách như cũ. Phần dưới KHÔNG bị giấu bằng `hidden` —
  giấu đi thì Google chỉ thấy một màn hero trống, người tắt JavaScript không
  bao giờ mở được, và trình đọc màn hình mất luôn nội dung.
  Dựng lại theo khuôn tạp chí sau khi bản đầu bị chê đúng: nó chỉ là một khối
  chữ căn giữa, không phải một trang được thiết kế. Sáu thứ làm nên bản mới —
  lưới có đường kẻ nhìn thấy được, một chữ khổng lồ bị khung cắt làm nền đồ
  hoạ, bất đối xứng ba tầng, một khối đậm neo góc, nhãn 9px in hoa ở mép panel,
  và dấu + làm mốc căn. Có thêm khe cắm ảnh (`heroAnh`) để ảnh đè lên chữ lớn.

- **Nền động.** Hoa anh đào rơi ở theme sáng, đĩa thiên hà xoắn ốc ở theme tối,
  port từ HAN-961030-a và -b. Tự đổi khi người đọc bấm nút theme. Dừng hẳn khi
  tab bị ẩn hoặc khi cuộn qua khỏi. Bật bằng `nen: dong` trong front matter —
  trang chủ luôn bật, mặc định các trang khác là tắt.
- **Theme tối có chiều sâu trở lại.** Nền trang vốn đã đúng bản gốc; chỗ thiếu
  là **quầng sáng tím** dưới nút và bóng chữ ở tiêu đề lớn. Bóng đổ nói "vật
  này nằm trên nền", quầng sáng nói "vật này phát sáng" — chỉ có bóng đen thì
  cả trang trông lún xuống và tối. Lấy thẳng số từ HAN-961030-b.
- **Trang chủ mặc định theme sáng** kể cả khi máy đang để tối. Nhưng nếu người
  đọc đã tự bấm chọn thì theo họ — ép đè lên lựa chọn của người dùng là kiểu
  trang web cãi lại chính người dùng.
- **Ảnh trên thẻ bài.** Lưới nhiều bài: bỏ ảnh. Một bài nổi bật: có ảnh, dựng
  ảnh-trái-chữ-phải như Medium và Substack. Sáu tấm gradient cạnh nhau thì
  không tấm nào nói được gì, mà trang nặng thêm nửa MB.
- **Sửa một lỗi tương phản có sẵn.** `--text-faint` chỉ đạt 3.60:1, kèm chú
  thích "chỉ dùng cho chữ ≥12px" — chú thích đó sai, ngưỡng được miễn của WCAG
  là 18.66px in đậm hoặc 24px thường. Mà màu đó lại đang dùng cho đúng loại chữ
  nhỏ nhất trên trang: ngày tháng 11px, nhãn 12.5px. Nay 4.72:1 ở theme sáng và
  4.9:1 ở theme tối.
- Thêm hai phép kiểm: quầng sáng phải khai đủ ở cả ba trạng thái theme, và
  `nen` chỉ nhận `tinh` hoặc `dong`.

## V1.1.8 — 15-Sep-2026

Lượt này không thêm tính năng nào, chỉ soát lại và dọn. Trang nhẹ đi **63%**:
2.10MB còn 0.78MB.

- **Ảnh bìa 391KB xuống 84KB.** Ba chỗ cộng lại: hạ từ 1600×900 về 1200×675
  (cột chữ rộng nhất cũng chỉ 1100px, ảnh chia sẻ chuẩn là 1200×630 — 1600 là
  thừa); thêm bước lọc Sub trước khi nén (bộ ghi PNG cũ ghi filter 0, tức là
  không lọc gì); và bỏ hạt nhiễu chống vệt dải. Riêng hạt nhiễu tốn hơn nửa
  dung lượng file, mà soi kỹ thì không có vệt dải nào để mà chống — bảng màu ở
  đây toàn pastel nằm sát nhau.
- **Thêm `npm run nen`** — nén lại mọi PNG trong `public/` mà không mất một
  pixel nào. Thử cả năm kiểu lọc cho từng dòng, giữ kiểu nhỏ nhất. Ảnh demo
  trong bài giảm 82%. Chạy được cho mọi ảnh bỏ vào sau này.
- **Chú thích CSS không còn gửi ra mạng.** Bundle 91KB còn 56KB, qua dây là
  25.8KB còn 10.7KB. Chú thích vẫn nằm nguyên trong `src/styles/` — chỉ cắt ở
  bước cuối trước khi ghi ra `dist/`.
- **Bảng nhãn giao diện từng nói dối 8 chỗ.** Nó khai "mọi chữ nằm ở đây" nhưng
  tám nhãn khai rồi mà chữ thật lại gõ cứng trong `shell.html`, `theme.js` và
  `search.js` — sửa bảng không có tác dụng. Nay nối lại hết.
- **Dọn đồ chết:** một khoá cấu hình không ai đọc, một nhãn cho tính năng chưa
  bao giờ dựng, ba class CSS không dùng và không nằm trong design system, và
  một khối chú thích bị dán hai lần.
- **Sửa một phép kiểm dò sai.** Phép kiểm "bundle CSS đủ file" dò bằng chính
  dòng chú thích mốc — tới lúc build bắt đầu cắt chú thích thì nó báo đỏ cả tám
  file dù CSS vẫn đủ. Sửa xong lại dò quá lỏng (bắt trúng một dòng khai báo
  chung của file khác) nên vẫn báo xanh khi thiếu file thật. Nay dò bằng dòng
  selector, và đã thử ngược để chắc là nó bắt được.

## V1.1.7 — 15-Sep-2026

- **Dựng xong bốn trang còn thiếu.** `/posts/` có hàng chip lọc theo chuyên
  mục, `/tags/` là mây chủ đề cỡ chữ theo số bài, `/archive/` xếp theo năm dạng
  danh sách dày cho dễ dò, `/search/` tìm ngay trên trình duyệt. Menu Posts và
  mấy cái tag nay bấm được — trước chúng chỉ là chữ mờ kèm tooltip "sắp có".
- **Tìm kiếm gõ không dấu vẫn ra.** "tam ly" ra "tâm lý". Xếp hạng theo chỗ
  trùng chứ không theo ngày: trúng ở tiêu đề đáng giá hơn trúng ở thân bài, nên
  bài viết hẳn về từ khoá luôn đứng trên bài chỉ nhắc thoáng qua. Lọc thêm được
  bằng chip chủ đề. Không có máy chủ nào cả, chạy offline sau lần tải đầu.
- **Chuyên mục lấy thẳng từ thư mục.** Bỏ bài vào `content/posts/<tên mục>/` là
  chuyên mục đó tự có trang riêng và tự lên hàng chip — không phải khai thêm ở
  đâu. Đặt tên hiển thị bằng một file `_muc.json` nhỏ trong chính thư mục ấy.
- **Thêm `npm run bia`** — sinh ảnh đại diện cho bài. Không đi tải ảnh trên
  mạng: mỗi tấm một giấy phép, và tông màu lạ phá bảng màu của trang. Ảnh được
  vẽ ra từ chính tên bài nên cùng tên luôn ra cùng tấm, và luôn đúng bảng màu.
- **Sổ lịch sử gom theo build.** V1 là một dòng, bấm mới sổ ra bảy bản vá bên
  trong, bấm tiếp mới tới chi tiết. Nền hộp làm lại: tối và trung tính hơn để
  tấm kính nổi lên, thay vì cả màn hình thành một vũng tím.
- **Sửa hai lỗi.** Rê chuột vào khối chữ trang About thì cả đoạn văn nhấc lên
  kèm một cái viền ma — luật `.bo:hover` cấp bóng đổ cho một khối cố ý không có
  tấm kính. Và dấu `·` trong hàng ngày tháng đứng lại cuối dòng khi hàng gãy,
  vì nó là một thẻ riêng; nay nó là `::before` của mục phía sau nên đi theo chữ.
- **Bài mới:** *Chiếc gương*, trong chuyên mục Musings.

## V1.1.6 — 15-Sep-2026

- **Chuyển nhà sang Cloudflare Pages.** Hàm `/api/quote` phải viết lại hẳn:
  Cloudflare chạy trên Workers chứ không phải Node, nên không có `fs`, không có
  `process.env`, không có `req`/`res`. Nguồn câu nay được nướng sẵn lúc dựng
  trang thay vì đọc file lúc chạy. Luật cache chuyển từ `vercel.json` sang
  `_headers`. Thêm bốn phép kiểm tự động bắt đúng mấy lỗi đó.
- **Bình luận có trả lời, đóng mở gọn như một post Facebook.** Cây hai tầng,
  nhánh quá hai trả lời thì gấp lại, chủ trang trả lời có huy hiệu riêng. Cả
  khối cũng gấp được. Sheet cũ tự thêm cột mới, không phải sửa tay.
- **Ô trích dẫn nay lấy từ một file tả NGUỒN**, không chỉ xoay vòng trong kho:
  mỗi ngày bốc ngẫu nhiên một chủ đề và mười hai tác giả rồi mới hỏi Gemini.
  Đo 20 ngày liên tiếp thì cả 8 chủ đề và cả 38 tác giả đều được dùng tới.
- **Trang giới thiệu thêm ô ảnh chân dung**, và dòng phiên bản ở chân trang nay
  đọc được (cũ 8.5px, không ai thấy). Bấm năm nhịp vào dòng đó thì mở sổ lịch
  sử phiên bản, đọc thẳng từ chính file này.
- **Mọi chữ trên giao diện chuyển hết sang tiếng Anh** và gom về một bảng duy
  nhất — `AUTHOR`, `Anonymous`, `Reply`, `Another one`…
- **Sửa ba lỗi bố cục:** thêm ô ảnh làm trang tràn ngang 402px trên màn 390px;
  tooltip của nút đổi theme thò ra ngoài mép phải ở khổ điện thoại (lỗi có sẵn
  từ trước, mấy lượt kiểm cũ không thấy vì nó là pseudo-element); ô số vỡ hai
  dòng khi giá trị dài như "TP. Hồ Chí Minh".

## V1.1.5 — 14-Sep-2026

- **Trang giới thiệu, hai khung.** `bento` là lưới ô kính đọc như tấm danh
  thiếp; `chuong` là các chương chữ lớn hiện dần khi cuộn. Đổi bằng một chữ
  trong front matter, cùng dữ liệu, khác cách bày.
- **Ô trích dẫn mỗi ngày.** Cả ngày một câu, chọn bằng cách chia bài nên mỗi câu
  ra đúng một lần trong mỗi vòng và không bao giờ trùng hai ngày liền. Chạy
  offline. Bật thêm lớp Gemini thì mỗi ngày có một câu viết mới.
- **Dựng được trang tĩnh** từ `content/pages/` — `/about/` ra khỏi danh sách
  chưa dựng.

## V1.1.4 — 14-Sep-2026

- **Thêm ảnh chia sẻ mặc định.** `public/og.png` trước đây được khai trong thẻ
  meta nhưng file không tồn tại — mọi link chia sẻ ra ô trắng.
- **Bổ sung dữ liệu có cấu trúc.** `BreadcrumbList` cho dòng phân cấp hiện dưới
  tiêu đề trong kết quả Google, `max-image-preview:large` cho ảnh bìa hiện cỡ
  lớn thay vì ô nhỏ, `lastmod` trong sitemap.
- **Bốn phép kiểm SEO mới,** trong đó một cái bắt lỗi ảnh bìa để `.svg` —
  Facebook và Zalo không đọc được định dạng đó.
- Ghi rõ trong tài liệu: **repo riêng tư không ảnh hưởng SEO**, vì Google đọc
  trang đã dựng chứ không đọc repo.

## V1.1.3 — 14-Sep-2026

- **Bản nháp không còn lên mạng.** Trước đây bài `draft: true` vẫn được đẩy lên
  máy chủ, chỉ gắn `noindex` — mà `noindex` chỉ bảo Google đừng đánh chỉ mục,
  ai đoán trúng đường dẫn vẫn đọc được. Nay `npm run build` không ghi chúng ra.
- **Chép cả bài thì clipboard tự kèm dòng nguồn.** Trích ngắn dưới 220 ký tự và
  khối mã vẫn chép nguyên vẹn. Dán vào Word thì dòng nguồn là liên kết bấm được.
- **Thêm `docs/RIENG-TU.md`** — cách đặt repo riêng tư, và nói thẳng vì sao
  không thể chặn việc sao chép trên web.

## V1.1.2 — 14-Sep-2026

- **Sửa chỗ Vercel deploy ra 404.** Thêm `vercel.json` trỏ thẳng vào `dist/`.
  Không có nó, Vercel lấy nhầm thư mục `public/` — trong đó chỉ có ảnh, không
  có trang chủ.
- **Xem thử trên điện thoại.** `npm run dev` nay in luôn địa chỉ của máy trong
  mạng WiFi, gõ vào trình duyệt điện thoại là mở được.
- **Thêm `docs/DUA-LEN-MANG.md`** — ba cách xem trang, cách gỡ mấy lỗi hay gặp,
  và cái bẫy `.gitignore` biến mất khi upload tay lên GitHub.

## V1.1.1 — 14-Sep-2026

- **Xếp lại đầu bài.** Ngày và phút đọc lên ngay dưới tiêu đề; tóm tắt xuống
  sau, in nghiêng và nhỏ lại. Tag rời khỏi đầu bài, xuống hẳn khung riêng ở chân.
- **Mọi thứ thẳng một mép.** Ảnh bìa, ảnh trong bài, bảng, đầu bài, chân bài —
  cùng một lề trái với cột chữ. Đo lại: lệch 0px ở cả hai khung, cả hai khổ màn.
- **Khung bình luận.** Google Apps Script + Google Sheet, không tốn tiền, không
  bình luận nào tự lên trang. Thêm khối gợi ý đọc tiếp xếp theo tag trùng.
- **Hai công cụ mới.** `npm run anh` đưa ảnh từ `_anh/` vào đúng thư mục bài và
  in sẵn dòng chèn. Chữ giao diện chuyển hết sang tiếng Anh; bỏ khung C.

## V1.1.0 — 14-Sep-2026

- **Hệ chữ đo lại bằng số liệu thật.** Đếm ký tự trên dòng trong trình duyệt rồi
  mới chỉnh, không ước lượng. Giãn dòng tiêu đề nới ra cho dấu tiếng Việt có chỗ.
- **Bỏ đoạn sapo trùng lặp.** Bài có `summary` thì đoạn đầu không tự phóng to
  nữa — trước đó người đọc gặp hai khối chữ lớn nói cùng một ý.
- **Chuyển sang bộ liquid glass.** Nền kính có viền sáng và độ sâu, nút nhấn có
  nhịp nảy, header và thẻ bài dùng chung một lớp vật liệu.
- **Thêm hai công cụ.** `npm run ver` ghi sổ phiên bản; `npm run kiem` chạy bộ
  kiểm định trước khi đăng.

## V1.0.0 — 14-Sep-2026

- Dựng hạ tầng blog tĩnh, không framework và không dependency.
- Design system kế thừa bảng màu Sakura và Galaxy; khung đọc bài có ba làn cho
  ảnh phá rào ra ngoài cột chữ.
- Bộ dựng Markdown tự viết, tự đo kích thước ảnh để khoá tỉ lệ.
- Ba file tài liệu: hướng dẫn đăng bài, IA, design system.
