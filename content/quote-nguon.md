# NGUỒN TRÍCH DẪN

> **File này tả CHỖ LẤY CÂU, không phải chỉ chứa câu.** Ô "Quote of the day"
> đọc nó theo hai đường:
>
> | Đường | Ai đọc | Lúc nào | Lấy mục nào |
> |---|---|---|---|
> | Ngoại tuyến | `tools/build.mjs` | lúc dựng trang | `### Câu sẵn` |
> | Có Gemini | `api/quote.js` | mỗi khung giờ một lần | `### Chủ đề` · `### Nguồn` · `### Lời dặn` |
>
> Đường ngoại tuyến LUÔN CHẠY, không cần mạng, không cần khoá. Đường Gemini chỉ
> là lớp thêm nếm: bật nó thì mỗi khung giờ có một câu viết mới thay vì xoay
> vòng trong kho — mặc định ba khung một ngày (sáng · chiều · tối). Tắt, hỏng,
> hay chưa deploy thì ô vẫn có câu — người đọc không bao giờ thấy lỗi cấu hình.
>
> **Sửa thế nào:** gõ như gõ văn bản thường, lưu, rồi chạy `npm run build`.
> Bước build là bắt buộc nếu bật Gemini: hàm chạy trên Cloudflare Workers không
> đọc được file này lúc chạy (Workers không có đĩa), nó dùng bản nướng sẵn ở
> `functions/api/_nguon.js` mà build sinh ra. Đẩy lên GitHub thì Cloudflare tự
> chạy build nên cũng xong.
>
> Đây là markdown thuần, gõ sai cũng không làm sập trang — mục nào đọc không ra
> thì phần đó lặng lẽ dùng bản dự phòng. Chính vì lặng lẽ nên có một phép kiểm
> riêng cho chuyện đó: `npm run kiem` báo ngay nếu một mục đọc không ra.
>
> **Đừng đổi tên bốn dòng `###`.** Bộ đọc chỉ bám vào đúng bốn chữ đó; chữ nghĩa
> xung quanh gõ kiểu gì cũng được. Mọi dòng bắt đầu bằng `>` là nói với NGƯỜI
> đọc file, bộ đọc bỏ hết.
>
> **Gạch đầu dòng phải là dấu `-`, không phải dấu `*`.** Đây là chỗ bản gốc bên
> dongchibinh-33 đã vấp: bộ đọc bên đó nhận cả `-` lẫn `*`, nên một dòng tiêu đề
> in đậm `**Tự biết mình**` bị hiểu thành một câu trích dẫn tên là
> "*Tự biết mình**". Bộ đọc ở đây chỉ nhận `-`, nên viết `**đậm**` ở đâu cũng
> được. Tiêu đề phụ trong kho câu thì dùng `####`.

## quote

### Chủ đề

> Mỗi khung giờ lấy MỘT chủ đề trong danh sách này rồi mới hỏi Gemini. Đây là
> điểm khác quan trọng nhất so với bản gốc: bản kia nhét cả bốn chủ đề vào một
> lời dặn, và Gemini gần như lúc nào cũng rơi vào chủ đề đầu tiên. Lấy một chủ
> đề rồi mới hỏi thì cả danh sách mới thật sự được dùng tới.
>
> Cách lấy là CHIA BÀI, không phải bốc rời từng khung: mỗi ngày xáo cả danh
> sách một lần rồi mỗi khung rút một lá theo thứ tự. Bốc rời thì hai khung
> trong cùng một ngày trùng chủ đề khoảng 30% số ngày — đo ra thật, và người
> đọc quay lại buổi tối gặp lại chủ đề ban chiều thì cả cơ chế thành công cốc.
>
> Nên danh sách này phải có ÍT NHẤT bằng số khung (`quoteAI.khung`). Ít hơn thì
> đành có khung trùng nhau.
>
> Thêm bớt thoải mái. Mỗi dòng một chủ đề, dạng  Tên · mô tả.

- Tự biết mình · nhìn ra cái đang chạy trong đầu mình rồi gọi đúng tên nó
- Tự trọng · giá trị của mình không nằm ở lời khen chê của người khác
- Tự soi lại · ngồi xét việc mình đã làm, sửa mình trước khi trách người
- Khiêm nhường · biết chỗ mình chưa biết, biết mình nhỏ trong một thứ lớn hơn
- Sự chú ý · để tâm vào đâu thì đời mình thành ra ở đó
- Thói quen · cái làm mỗi ngày quyết định mình là ai, không phải cái định làm
- Cái đẹp của thứ bình thường · buổi sáng, ấm trà, một quãng đường quen
- Chịu đựng · đi qua chuyện khó mà không hoá thành người khác

### Nguồn

> Danh sách tác giả được phép trích. Mỗi khung giờ bốc NGẪU NHIÊN một nhóm nhỏ
> (khoảng 12 người) chứ không gửi cả danh sách: gửi hết thì Gemini bám vào mấy
> cái tên quen nhất — Jung, Seneca, Lão Tử — và tháng nào cũng ra mấy câu đó.
>
> Mỗi dòng một người. Xoá ai thì người đó không bao giờ được trích nữa.

- Carl Jung
- Marcus Aurelius
- Seneca
- Epictetus
- Socrates
- Montaigne
- Blaise Pascal
- Kierkegaard
- Nietzsche
- Simone Weil
- Viktor Frankl
- Carl Rogers
- Erich Fromm
- Gabor Maté
- Krishnamurti
- Rumi
- Lão Tử
- Trang Tử
- Khổng Tử
- Tôn Tử
- Đức Phật
- Thích Nhất Hạnh
- Ajahn Chah
- Nguyễn Trãi
- Nguyễn Bỉnh Khiêm
- Trần Nhân Tông
- Leo Tolstoy
- Fyodor Dostoevsky
- Anton Chekhov
- Richard Feynman
- Albert Einstein
- Maya Angelou
- James Baldwin
- Toni Morrison
- Annie Dillard
- Mary Oliver
- John Berger
- Susan Sontag

### Lời dặn

> Phần gửi thẳng cho Gemini. Hai chỗ `{{chuDe}}` và `{{nguon}}` được thay bằng
> chủ đề và nhóm tác giả bốc được của ngày hôm đó.

Chọn MỘT câu nói CÓ THẬT về chủ đề: {{chuDe}}.

Chỉ lấy của một trong những người sau: {{nguon}}.

Dịch sang tiếng Việt gọn gàng, TRỌN VẸN một ý, dài 60 đến 115 ký tự — kể cả
phần tên tác giả thì đừng vượt 150. Ưu tiên câu có hai vế: câu quá ngắn thì ô
trích dẫn chừa một mảng trống bên phải, nhìn như bị cắt.

Trả về đúng một dòng theo khuôn: Nội dung câu nói — Tên tác giả

Chỉ dùng câu CÓ THẬT, KHÔNG bịa, không gán nhầm tác giả — không chắc ai nói thì
chọn câu khác. Không emoji, không dấu ngoặc kép, không lời dẫn, không giải
thích, không xuống dòng.

### Câu sẵn

> Kho ngoại tuyến. Đây mới là bộ câu CHÍNH THỨC: nó nhúng thẳng vào trang lúc
> dựng nên hiện ra tức thì, không cần mạng, không tốn một đồng nào. Gemini chỉ
> là lớp phủ lên trên.
>
> Mỗi câu một dòng, khuôn  `- Nội dung — Tác giả`  (gạch ngang DÀI `—`). Không
> có tác giả thì bỏ luôn phần sau dấu gạch.
>
> Cơ chế chọn là CHIA BÀI chứ không phải bốc ngẫu nhiên: mỗi câu ra đúng một
> lần trong mỗi vòng, không bao giờ trùng hai ngày liền. Thêm càng nhiều câu
> thì vòng càng dài — xem docs/QUOTE.md.

#### Tự biết mình

- Chừng nào vô thức chưa thành ý thức, nó sẽ dẫn đường đời ta và ta gọi đó là số phận — Carl Jung
- Ai nhìn ra ngoài thì mơ, ai nhìn vào trong mới thật sự tỉnh ra — Carl Jung
- Ta chịu khổ vì tưởng tượng nhiều hơn là vì hiện thực — Seneca
- Biết người là khôn, biết được chính mình mới gọi là sáng — Lão Tử
- Người ta không bị làm khổ bởi sự việc, mà bởi cách mình nghĩ về sự việc đó — Epictetus
- Giữa kích thích và phản ứng có một khoảng trống, tự do của ta nằm trong khoảng đó — Viktor Frankl
- Quan sát mà không kèm phán xét là hình thức cao nhất của trí tuệ con người — Krishnamurti

#### Tự soi lại

- Một đời sống không được đem ra xét lại thì không đáng sống — Socrates
- Mỗi tối hãy tự hỏi: hôm nay ta chữa được tật nào, cưỡng lại được lỗi nào — Seneca
- Ai cũng nghĩ tới chuyện đổi thế giới, chẳng ai nghĩ tới chuyện đổi chính mình — Leo Tolstoy
- Mọi bất hạnh của con người đến từ chỗ không ngồi yên một mình trong phòng được — Blaise Pascal
- Vết thương chính là chỗ ánh sáng đi được vào trong con người bạn — Rumi

#### Khiêm nhường

- Tôi chỉ biết đúng một điều, ấy là tôi không biết gì cả — Socrates
- Biết thì nhận là biết, không biết thì nhận là không biết, thế mới là biết — Khổng Tử
- Biển sở dĩ làm vua trăm khe suối là vì nó biết nằm ở chỗ thấp hơn — Lão Tử
- Việc đầu tiên là đừng tự lừa mình, mà mình lại là kẻ dễ lừa nhất trên đời — Richard Feynman
- Đời người thì có hạn mà cái biết thì vô hạn, lấy cái có hạn đuổi cái vô hạn là mệt — Trang Tử

#### Chú ý và thói quen

- Ta để tâm vào đâu thì đời ta thành ra ở đó — Annie Dillard
- Hiện tại là khoảnh khắc duy nhất mà ta thật sự đang có trong tay — Thích Nhất Hạnh
- Kể tôi nghe, bạn định làm gì với cuộc đời hoang dại và quý giá này của mình — Mary Oliver
- Cách ta tiêu một ngày chính là cách ta tiêu cả một đời — Annie Dillard
- Chất lượng của đời sống nằm ở chất lượng của sự chú ý — Krishnamurti
