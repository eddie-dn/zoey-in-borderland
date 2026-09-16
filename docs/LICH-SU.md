# SỔ PHIÊN BẢN

> **File này là NGUỒN DUY NHẤT của số phiên bản.** Build đọc dòng đầu tiên trong
> bảng dưới để lấy `Vxx.yy` và ngày, rồi in ra tem ở chân mọi trang. Không khai
> số phiên bản ở chỗ nào khác — hai chỗ là sớm muộn cũng lệch nhau.
>
> **Cách ghi.** Đừng sửa bảng bằng tay. Chạy:
>
> ```bash
> npm run ver -- "chỉnh hệ chữ · nền kính"      # thêm một bản vá  → V1.00 thành V1.01
> npm run ver -- --lon "dựng trang tag"          # mở một build mới → V1.03 thành V2.00
> ```
>
> **Đuôi bản vá chỉ chạy 00 → 09.** Không có `V1.10`. Chạm `V1.09` rồi thì bản
> kế tự mở build mới thành `V2.00` — `npm run ver` lo việc đó, không phải nhớ gõ
> `--lon`. Bộ kiểm định có một phép kiểm canh luật này.
>
> **Quy ước cột `#`** (giữ nguyên từ design system cũ): mỗi dòng là **MỘT BUILD
> LỚN**, không phải một bản vá. Cột `#` là **số bản vá ghi lại được trong build
> đó** — `V1.03` nghĩa là 04 bản, và nó luôn bằng đúng hai chữ số sau dấu chấm.
> Không biết thì ghi `thiếu info` và **giữ nguyên số build**.
>
> Cột **Sửa chính** chỉ ghi **loại việc**, không ghi tên biến, tên endpoint, hay
> đường dẫn nội bộ — sổ này người đọc blog mở ra xem được.

<!-- BANG-BAT-DAU · dòng ngay dưới hàng gạch là bản mới nhất, build đọc đúng dòng đó -->

| Bản | Ngày | # | Sửa chính |
|---|---|---|---|
| V7.00 | 2026-09-16 | 00 | bình luận chuyển sang Cloudflare, duyệt ngay trên trang thay vì trong bảng tính |
| V6.05 | 2026-09-16 | 05 | khối chữ màn đầu bị khuôn xén ở CẢ hai đầu, không riêng đầu trái |
| V6.04 | 2026-09-16 | 04 | mục lục bám theo bài dài; thanh cuộn thấy được; cỡ chữ thân bài nhỏ một nhịp; mưa chậm lại |
| V6.03 | 2026-09-16 | 03 | logo lấy lại đoá mandala làm hình nghỉ; vòng kể ngắn lại, chặng xoay rõ hơn; tên blog ở khổ dọc cân hai dòng |
| V6.02 | 2026-09-16 | 02 | ghi chú đăng thẳng từ điện thoại, không phải dựng lại trang; theme Tĩnh lặng ngả xanh trời |
| V6.01 | 2026-09-16 | 01 | tên blog đúng phông; cột chữ hẹp lại còn 70 ký tự; bài cũ về cùng một khung |
| V6.00 | 2026-09-16 | 00 | hoa Sakura nhỏ và mỏng lại, đông hơn; bỏ viền ở cánh xa |
| V5.09 | 2026-09-16 | 09 | logo: nút thắt vô cực, chữ B vặn bụng, mandala xoay rồi vỡ thành bụi |
| V5.08 | 2026-09-16 | 08 | theme thứ ba Tĩnh lặng: bảng màu xanh pastel, nền thác nước ở màn đầu |
| V5.07 | 2026-09-16 | 07 | rà docs: ba khung, trang ghi chú, chương logo; thêm 4 phép kiểm |
| V5.06 | 2026-09-16 | 06 | logo kể chuyện bằng nét biến hình, bỏ hẳn con chữ |
| V5.05 | 2026-09-16 | 05 | băng ảnh lấy tỉ lệ theo tấm đầu, kẹp trong khoảng Instagram cho phép |
| V5.04 | 2026-09-16 | 04 | màn đầu: Borderland to hơn, xén nửa chữ cuối, nhấc lên giữa khung |
| V5.03 | 2026-09-16 | 03 | logo tự kể lại trình tự dựng hình, lặp ở trang chủ |
| V5.02 | 2026-09-15 | 02 | logo đứng một mình to lên; ghi chú có đường vào từ chân trang |
| V5.01 | 2026-09-15 | 01 | từ Borderland vừa đúng bề ngang cột, thêm phép kiểm canh việc đó |
| V5.00 | 2026-09-15 | 00 | chân trang khổ dọc canh về cùng một mép trái |
| V4.09 | 2026-09-15 | 09 | trang giới thiệu bỏ hiệu ứng nền cho đỡ rối |
| V4.08 | 2026-09-15 | 08 | màn đầu: chữ Z che đúng một phần ba, in sát lại, Borderland giãn ra |
| V4.07 | 2026-09-15 | 07 | dải ngân hà dày và sáng hơn, đậm trong loang ra ngoài |
| V4.06 | 2026-09-15 | 06 | logo hai vòng vô cực; chỉ hiện ở trang chủ và giới thiệu |
| V4.05 | 2026-09-15 | 05 | trang ghi chú ngắn thay Tags trên thanh điều hướng |
| V4.04 | 2026-09-15 | 04 | khung xem ảnh cố định · khối chữ lùi vào trong khung |
| V4.03 | 2026-09-15 | 03 | đếm lượt xem thật bằng cơ sở dữ liệu D1 |
| V4.02 | 2026-09-15 | 02 | trích dẫn thành tab bên lề bài, đổi sau mỗi hai trang · nền động nhạt ở trang tĩnh |
| V4.01 | 2026-09-15 | 01 | trang Posts thành thư mục chuyên mục, thôi trùng với Archive |
| V4.00 | 2026-09-15 | 00 | dải ngân hà dựng lại có nền sao và nhánh thật · cân lại khối chữ |
| V3.09 | 2026-09-15 | 09 | thẻ bài: kính trong hơn · cao bằng nhau · trang chủ giữ 3 bài |
| V3.08 | 2026-09-15 | 08 | logo hình vô cực · tên blog sắp lại khi rê chuột |
| V3.07 | 2026-09-15 | 07 | khung bài ảnh ngắn: băng ảnh bên trái, tản mạn bên phải |
| V3.06 | 2026-09-15 | 06 | chữ thân bài đo lại · căn đều hai bên · đầu bài rộng hơn cột chữ |
| V3.05 | 2026-09-15 | 05 | ngày đăng gốc kèm mốc cập nhật tự động · bỏ phút đọc |
| V3.04 | 2026-09-15 | 04 | khổ dọc: màn đầu trọn một màn · bỏ danh sách ba bài · thẻ bài gọn lại |
| V3.03 | 2026-09-15 | 03 | cánh hoa nét hơn có chiều sâu · thiên hà tràn cả hai mép màn hình |
| V3.02 | 2026-09-15 | 02 | chữ giữa tách khỏi chữ đầu · hai dòng thôi đè nhau khi co lại |
| V3.01 | 2026-09-15 | 01 | phân trang có số cho Posts và Archive · người đọc chọn số bài mỗi trang |
| V3.00 | 2026-09-15 | 00 | trang chủ giữ tối đa 6 bài · hai lối đi sang Posts và Archive |
| V2.09 | 2026-09-15 | 09 | khối chữ lớn căn giữa không mất chữ · gộp Zoey in cùng hàng khi co lại |
| V2.08 | 2026-09-15 | 08 | hướng dẫn bật đo lượt xem từng bước |
| V2.07 | 2026-09-15 | 07 | khối chữ lớn xén theo đường kẻ lưới · dựng lại bố cục khổ dọc |
| V2.06 | 2026-09-15 | 06 | đo lượt xem không cookie · đoán trước trang kế |
| V2.05 | 2026-09-15 | 05 | luật số phiên bản: đuôi chỉ chạy 00 đến 09 |
| V2.04 | 2026-09-15 | 04 | khối chữ lớn ở màn đầu · cửa vào trang giới thiệu · trích dẫn chuyển ra trang chủ |
| V2.03 | 2026-09-15 | 03 | soát lại toàn bộ tài liệu · viết mục hệ sinh thái Cloudflare · hướng dẫn nhập bài cũ |
| V2.02 | 2026-09-15 | 02 | rà lại bộ kiểm định · gộp phép kiểm trùng · thêm phép kiểm cho JS và nhãn giao diện |
| V2.01 | 2026-09-15 | 01 | phóng to nền thiên hà cho cân khung |
| V2.00 | 2026-09-15 | 00 | nhập bài cũ từ bản xuất WordPress |
| V1.09 | 2026-09-15 | 09 | trang chủ hai màn · nền động · quầng sáng theme tối · sửa tương phản chữ mờ |
| V1.08 | 2026-09-15 | 08 | nhẹ đi 63% · nén ảnh · cắt chú thích CSS khi dựng · dọn nhãn và cấu hình chết |
| V1.07 | 2026-09-15 | 07 | dựng trang Posts · Tags · Archive · Search · bài Chiếc gương · sổ lịch sử gom theo build |
| V1.06 | 2026-09-15 | 06 | chuyển sang Cloudflare · bình luận có trả lời · quote lấy từ file nguồn · sổ lịch sử ở chân trang |
| V1.05 | 2026-09-14 | 05 | trang giới thiệu hai khung · ô trích dẫn mỗi ngày |
| V1.04 | 2026-09-14 | 04 | bổ sung dữ liệu có cấu trúc · ảnh chia sẻ mặc định |
| V1.03 | 2026-09-14 | 03 | nháp không lên mạng · chép dài kèm nguồn · tài liệu riêng tư |
| V1.02 | 2026-09-14 | 02 | cấu hình Vercel · xem thử qua WiFi · tài liệu đưa lên mạng |
| V1.01 | 2026-09-14 | 01 | xếp lại đầu bài · khung bình luận · công cụ đưa ảnh |
| V1.00 | 2026-09-14 | 00 | dựng hệ chữ · nền kính · sổ phiên bản · file kiểm định |
| V0.00 | 2026-09-14 | 00 | dựng khung sườn · design system · bộ dựng Markdown |

<!-- BANG-KET-THUC -->

---

## V7.00 — 16-Sep-2026

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

## V6.05 — 16-Sep-2026

- **Khối chữ ở màn đầu bị khuôn xén ở CẢ hai đầu.** Chữ "Z" vốn đã lấn qua
  đường kẻ trái và bị cắt mất một mảng — cố ý, để cả khối đọc ra là được đặt
  vào khuôn rồi khuôn cắt bớt. Nhưng chữ "B" của dòng dưới thì đứng trọn vẹn,
  nên một bên bị cắt còn một bên thụt vào, và dòng dưới trông như bị lùi lề chứ
  không phải cùng một khuôn. Nay "B" khuất khoảng một phần tư — ít hơn "Z" (hai
  phần năm), vì dòng trên vẫn là dòng nhấn. Cỡ chữ dòng dưới phải giải lại theo
  để mép phải vẫn cắt đúng giữa chữ "d".

## V6.04 — 16-Sep-2026

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

## V6.03 — 16-Sep-2026

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

## V6.02 — 16-Sep-2026

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

## V6.01 — 16-Sep-2026

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

## V6.00 — 16-Sep-2026

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

## V5.09 — 16-Sep-2026

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

## V5.08 — 16-Sep-2026

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

## V5.07 — 16-Sep-2026

- **Rà lại tài liệu.** Ba chỗ đang nói dối: hướng dẫn đăng bài và design system
  đều ghi "hai khung trình bày" trong khi khung C đã có từ V3.07; bản đồ trang
  ghi trang chủ hiện "tối đa 6 bài" trong khi cấu hình để 3, và không nhắc trang
  ghi chú. Sửa hết, thêm chương **§19 · LOGO** vào design system.
- **Bộ kiểm định lên 41 phép,** thêm bốn phép cho bốn kiểu hỏng-im-lặng mới:
  bốn đường logo phải cùng cấu trúc `M + 4C` (không thì thôi biến hình được);
  thời lượng vòng lặp khai ở CSS và ở SVG phải khớp; logo và dòng chữ tên blog
  không được cùng hiện; tỉ lệ khung băng ảnh phải nằm trong khoảng Instagram
  cho phép. Cả bốn đều đã thử ngược — cố tình làm sai để xem nó có báo không.

## V5.06 — 16-Sep-2026

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

## V5.05 — 16-Sep-2026

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

## V5.04 — 16-Sep-2026

- **Hai đầu dòng chữ đều bị xén, và xén có con số.** Chữ đầu khuất một phần ba
  sau đường kẻ trái, chữ "d" cuối khuất một nửa sau đường kẻ phải. Xén đều hai
  bên thì cả khối đọc ra là được đặt vào khuôn rồi khuôn cắt bớt — cố ý. Xén
  một bên thì đọc ra là tràn lề.
- **Chữ to hơn.** Cỡ không ướm mà giải ra từ hai con số đo được (cả từ chiếm
  5,117 lần cỡ chữ, riêng chữ "d" chiếm 0,538) — ra 20,35cqw.
- **Khối chữ nhấc lên giữa khung.** Đáy cột có hàng nút chiếm một dải; căn giữa
  cả cột thì khối chữ bị đẩy xuống nằm đè lên dải ấy. Chừa dải ra rồi mới căn,
  và chừa dư một nhịp vì khối này nặng đáy.

## V5.03 — 16-Sep-2026

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

## V5.02 — 15-Sep-2026

- **Logo đứng một mình thì to lên.** Ở trang chủ và trang giới thiệu, ô thương
  hiệu không còn dòng chữ nên logo nới từ 30px lên 36px — vẫn thấp hơn thanh
  đầu trang nên không đẩy gì, mà bốn cánh mới đọc ra được hình.
- **Ghi chú có đường vào từ chân trang.** Nó đã thế chỗ Tags ở thanh trên; chân
  trang nay có cả hai, nên mấy chục trang tag không thành trang mồ côi.

## V5.01 — 15-Sep-2026

- **Từ "Borderland" không còn bị cắt cụt.** Cỡ chữ ở màn đầu tính theo bề ngang
  khung, và bản trước đặt quá tay: từ dài 914px trong cột rộng 712px, thò ra
  266px rồi chui xuống dưới khung danh sách bên phải — trên màn hình đọc ra là
  "Borderl". Nay từ trải đúng hết bề ngang cột, mép phải dừng ở đường kẻ.
  Chữ đầu vẫn lấn qua đường kẻ TRÁI như cũ: bên trái là khoảng trống nên lấn
  sang là cố ý, bên phải có khung chữ nên lấn sang là đè lên.
- **Thêm một phép kiểm canh đúng chỗ ấy.** Nó đọc thẳng file CSS, tính bề ngang
  từ ra rồi so với bề ngang cột — bắt được ngay lúc build thay vì phải mở trình
  duyệt nhìn. Bộ kiểm định lên 37 phép.

## V5.00 — 15-Sep-2026

- **Chân trang khổ dọc canh về một mép.** Trên điện thoại, khối liên kết và
  khối tem phiên bản trước đó mỗi khối canh một kiểu — một bên trái, một bên
  giữa — nên nhìn như hai mảnh rời. Nay cả hai bắt đầu ở đúng cùng một mép
  trái với cột chữ phía trên. Đo lại: bốn khối đều mở ở x=20px.

## V4.09 — 15-Sep-2026

- **Trang giới thiệu bỏ hiệu ứng nền.** Trang ấy nhiều chữ nhất trong cả blog;
  thêm một lớp hạt bay phía sau thì mắt phải tự lọc hai thứ cùng lúc. Nền tĩnh,
  chữ đọc dễ hơn. Muốn bật lại thì sửa một dòng `nen:` trong front matter.

## V4.08 — 15-Sep-2026

- **Chữ Z che đúng một phần ba.** Che ở VIỀN CỘT chứ không phải viền ngoài màn
  hình — mép trái chữ dừng ở 270px so với mép cột 339px, tức 69/190px = 36%.
- **Chữ "in" sát lại chữ Z.** Khoảng hở còn 6px thay vì một khoảng trắng lửng
  lơ; lúc chữ sắp lại thì không đè lên nhau.
- **"Borderland" giãn thêm.** Dòng dưới nay trải gần hết bề ngang cột, cân với
  khối chữ Z ở trên thay vì thụt vào giữa.

## V4.07 — 15-Sep-2026

- **Dải ngân hà dày và sáng hơn.** Gấp đôi số sao, thêm một lớp bụi, và quan
  trọng nhất: độ sáng giảm dần theo bán kính — đậm đặc ở lõi rồi loang nhạt ra
  ngoài, như ảnh thật. Trước đó sao sáng đều nhau nên nhìn ra một đám chấm chứ
  không ra một dải. Vẫn quay, vẫn một vòng ~2,5 phút.

## V4.06 — 15-Sep-2026

- **Logo hai vòng vô cực.** Dựng theo đúng thứ tự trong ý tưởng gốc: *Zoey in
  Borderland* thu lại còn chữ Z, Z xoay ngang, chữ *i* xoay ngang nối hai đầu —
  ra vòng vô cực thứ nhất; chữ B vặn thành vòng thứ hai. Hai vòng bắt chéo nhau
  90° thành một hoa thị bốn cánh. Nét vẽ chạy từ từ khi trang mở, kể lại đúng
  trình tự ấy.
- **Logo chỉ ở trang chủ và trang giới thiệu.** Các trang khác giữ nguyên dòng
  chữ *Zoey in Borderland*. Không bao giờ hiện cả hai cùng lúc — logo là chữ
  ấy viết lại, đặt cạnh nhau thì thành nói hai lần.

## V4.05 — 15-Sep-2026

- **Trang ghi chú ngắn.** Bắt gặp một quyển sách, một bản nhạc, một ý thoáng
  qua thì mở `content/ghi-chu.md` gõ vài dòng — không tiêu đề, không ảnh bìa,
  không chuyên mục. Một file duy nhất chứ không mỗi ghi chú một file: ba dòng
  mà phải tạo file, đặt tên, khai front matter thì lần sau không ai ghi nữa.
  Loại (sách · nhạc · ý · …) muốn đặt gì cũng được, trang tự gom thành bộ lọc.
  Nó thay Tags trên thanh điều hướng; trang tag từng bài vẫn còn nguyên.

## V4.04 — 15-Sep-2026

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

## V4.03 — 15-Sep-2026

- **Đếm lượt xem thật.** Cloudflare Web Analytics đếm rất tốt nhưng KHÔNG có
  API đọc ngược — số liệu chỉ xem được trên bảng điều khiển, không in lên bài
  được. Nên con số này giữ trong D1. Chọn D1 chứ không KV vì KV giới hạn mỗi
  khoá một lượt ghi mỗi giây, mà bộ đếm đúng là cái kiểu ghi ấy.

- **Nói thẳng nó gần đúng.** Bot biết chạy JavaScript vẫn lọt; tải lại trong
  cùng phiên không cộng thêm nhưng mở tab mới thì tính lại; và không biết ai là
  ai — cố ý không biết. Mặc định TẮT, chưa gắn D1 thì trang lặng lẽ bỏ qua.

## V4.02 — 15-Sep-2026

- **Trích dẫn thành tab bên lề bài**, ngay dưới mục lục, cùng một khối dính khi
  cuộn. Đổi câu sau mỗi HAI trang: giữ nguyên cả phiên thì nó thành mảng trang
  trí chết, đổi mỗi lần tải trang thì thành nhấp nháy và người quay lại tab cũ
  thấy câu khác.

- **Nền động nhạt hẳn ở trang tĩnh.** Màn hero chỉ có mấy nhãn nhỏ nên nền động
  là nhân vật chính; trang giới thiệu thì kín chữ, và cánh hoa rơi sau chữ ở độ
  đậm của màn hero làm mắt bị kéo đi liên tục.

## V4.01 — 15-Sep-2026

- **Trang Posts thành thư mục chuyên mục.** Đo ra thì nó đang liệt kê ĐÚNG cùng
  9 bài với Archive, chỉ khác là có tóm tắt và tag — hai trang cùng trả lời một
  câu hỏi thì một cái là thừa. Nay ba trang trả lời ba câu khác nhau: Posts =
  blog này viết về những gì, Archive = viết vào lúc nào, tag = sợi chỉ nào xuyên
  qua. Mỗi mục khoe ba bài mới nhất rồi dẫn vào trang mục.

- **Thẻ bài giữ hai tag.** Ba cái thì ở bề ngang một cột lưới thường không đủ
  chỗ, và luật giữ cho thẻ cao bằng nhau cắt cái thứ ba làm đôi — một chữ bị
  cắt giữa chừng đọc ra là trang hỏng.
## V4.00 — 15-Sep-2026

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

## V3.09 — 15-Sep-2026

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

## V3.08 — 15-Sep-2026

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
## V3.07 — 15-Sep-2026

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
## V3.06 — 15-Sep-2026

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
## V3.05 — 15-Sep-2026

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

## V3.04 — 15-Sep-2026

- **Màn đầu ở khổ dọc trở lại đúng một màn.** Bản trước xếp dọc đủ bốn khối nên
  màn đầu dài hơn màn hình, chữ chen nhau, và nền động gần như không thấy đâu —
  mà nền động mới là thứ người đọc gặp đầu tiên, chữ tên blog cố ý làm mờ cũng
  là để nhường chỗ cho nó. Nay bỏ hẳn danh sách ba bài ở màn đầu (cuộn xuống
  một nhịp đã có trọn danh sách rồi), ba khối còn lại giãn ra cho vừa khít, và
  khoảng trống giữa chúng để hiệu ứng thở.

- **Thẻ bài gọn lại ở khổ dọc.** Tóm tắt kẹp hai dòng, tag giữ hai cái, lề trong
  siết lại. Một màn điện thoại trước chứa nổi hai bài, giờ là ba — và người đọc
  lấy lại được khả năng lướt.

## V3.03 — 15-Sep-2026

- **Cánh hoa có chiều sâu.** Mỗi cánh mang một "lớp xa gần", và cỡ, độ đậm, tốc
  độ rơi, độ dày viền đều suy ra từ đó: cánh gần thì to, rõ, rơi nhanh; cánh xa
  thì nhỏ, mờ, trôi chậm. Thêm gân giữa cho cánh đủ lớn. Cánh to gần gấp đôi nên
  số cánh phải BỚT đi — giữ nguyên số mà phóng to là màn hình kín đặc.

- **Thiên hà tràn cả hai mép.** Bản trước chỉ vươn khỏi mép phải, nửa trái màn
  trống trơn, nên cái đang thấy đọc ra là một đốm sáng lệch chứ không phải một
  dải ngân hà. Nay đĩa rộng hơn nửa màn, sao dày gấp đôi, nhánh xoắn thu gọn lại
  cho ra dải rõ ràng, và lõi sáng nhỏ đi để nhánh làm chủ.

## V3.02 — 15-Sep-2026

- **Chữ giữa tách khỏi chữ đầu.** Nó đang nép sát quá, đọc ra như một dấu phụ
  của chữ Z chứ không phải một từ.

- **Hai dòng thôi đè nhau lúc co lại.** Đuôi chữ "y" của dòng trên thò xuống
  đúng thân chữ "d" của dòng dưới — hai nét chồng nhau và mắt đọc ra là lỗi in.
  Chữ nghiêng kiểu Cormorant có đuôi rất dài nên khoảng dòng cũ không đủ; mở
  thêm một chút là vừa hở mà vẫn chưa thành hai dòng rời rạc.
## V3.01 — 15-Sep-2026

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

## V3.00 — 15-Sep-2026

- **Trang chủ giữ tối đa 6 bài**, không kể bài nổi bật. Trang chủ là chỗ mời
  vào, không phải chỗ liệt kê kho bài: đổ hết bài ra đây thì cuộn mãi không hết
  mà vẫn không có cách nào lọc.

- **Hai lối đi dưới lưới bài.** Posts xếp theo chuyên mục, Archive xếp theo
  năm — hai cách tìm khác nhau, nên để cả hai thay vì bắt người đọc đoán.

## V2.09 — 15-Sep-2026

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
## V2.08 — 15-Sep-2026

- **File cài đặt có mục đo lượt xem.** Bốn bước, kèm hai chỗ dễ sai: bật ở cả
  `site.config.json` lẫn nút trên bảng điều khiển Cloudflare thì một trang có
  hai đoạn beacon và mỗi lượt xem đếm thành hai; và token đo lượt xem là thứ
  CÔNG KHAI, khác hẳn khoá Gemini — nó nằm nguyên văn trong HTML mọi trang nên
  để trong repo là đúng chỗ.
## V2.07 — 15-Sep-2026

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

## V2.06 — 15-Sep-2026

- **Đo lượt xem, không đặt cookie.** Cloudflare Web Analytics, khai một dòng
  trong file cấu hình, **mặc định tắt**. Không cookie nghĩa là không phải dựng
  banner xin phép — mà banner ấy là thứ đầu tiên người đọc gặp, và nó nói rằng
  trang này đang lấy gì đó của họ. Nó đo luôn tốc độ thật của người đọc chứ
  không phải điểm giả lập trên máy mình.

- **Đoán trước trang kế.** Trình duyệt tải sẵn trang mà người đọc rê chuột vào,
  nên bấm xong hiện gần như tức thì. Chỉ TẢI trước chứ không CHẠY trước — chạy
  trước thì mỗi link rê chuột qua đều bị tính một lượt xem và số liệu thành rác.

## V2.05 — 15-Sep-2026

- **Số phiên bản có luật, và có chỗ canh luật.** Đuôi bản vá chỉ chạy 00 tới 09
  — không có V1.10. Bộ ghi sổ bản đầu không có cái chặn ấy nên cứ cộng dồn: sổ
  đã đi tới V1.14 rồi mới có người nhận ra. Nay chạm 09 thì bản kế tự mở build
  mới, và có một phép kiểm canh cả sổ chứ không riêng dòng mới. Năm dòng lỡ ghi
  sai đã đánh số lại thành V2.00–V2.04.
## V2.04 — 15-Sep-2026

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
## V2.03 — 15-Sep-2026

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
## V2.02 — 15-Sep-2026

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
## V2.01 — 15-Sep-2026

- **Thiên hà to bằng khung.** Đĩa ngân hà ở theme tối trước đây lấy cỡ theo
  cạnh NGẮN của màn. Đĩa lại bị ép dẹt còn một phần ba chiều cao, nên cạnh
  ngắn chưa bao giờ là thứ chạm mép trước — kết quả là trên màn ngang nó co
  lại thành một cái huy hiệu nhỏ dán ở góc. Giờ cỡ đĩa đo theo chiều ngang và
  đường kính hơi tràn mép, nên nhánh xoắn chạy ra khỏi khung; số sao cũng tăng
  theo để nhánh không bị thủng lỗ chỗ. Quầng lõi chỉ nhỉnh lên một chút —
  phần to ra phải là nhánh xoắn, không phải cục sáng giữa màn.

## V2.00 — 15-Sep-2026

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
## V1.09 — 15-Sep-2026

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

## V1.08 — 15-Sep-2026

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

## V1.07 — 15-Sep-2026

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

## V1.06 — 15-Sep-2026

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

## V1.05 — 14-Sep-2026

- **Trang giới thiệu, hai khung.** `bento` là lưới ô kính đọc như tấm danh
  thiếp; `chuong` là các chương chữ lớn hiện dần khi cuộn. Đổi bằng một chữ
  trong front matter, cùng dữ liệu, khác cách bày.
- **Ô trích dẫn mỗi ngày.** Cả ngày một câu, chọn bằng cách chia bài nên mỗi câu
  ra đúng một lần trong mỗi vòng và không bao giờ trùng hai ngày liền. Chạy
  offline. Bật thêm lớp Gemini thì mỗi ngày có một câu viết mới.
- **Dựng được trang tĩnh** từ `content/pages/` — `/about/` ra khỏi danh sách
  chưa dựng.

## V1.04 — 14-Sep-2026

- **Thêm ảnh chia sẻ mặc định.** `public/og.png` trước đây được khai trong thẻ
  meta nhưng file không tồn tại — mọi link chia sẻ ra ô trắng.
- **Bổ sung dữ liệu có cấu trúc.** `BreadcrumbList` cho dòng phân cấp hiện dưới
  tiêu đề trong kết quả Google, `max-image-preview:large` cho ảnh bìa hiện cỡ
  lớn thay vì ô nhỏ, `lastmod` trong sitemap.
- **Bốn phép kiểm SEO mới,** trong đó một cái bắt lỗi ảnh bìa để `.svg` —
  Facebook và Zalo không đọc được định dạng đó.
- Ghi rõ trong tài liệu: **repo riêng tư không ảnh hưởng SEO**, vì Google đọc
  trang đã dựng chứ không đọc repo.

## V1.03 — 14-Sep-2026

- **Bản nháp không còn lên mạng.** Trước đây bài `draft: true` vẫn được đẩy lên
  máy chủ, chỉ gắn `noindex` — mà `noindex` chỉ bảo Google đừng đánh chỉ mục,
  ai đoán trúng đường dẫn vẫn đọc được. Nay `npm run build` không ghi chúng ra.
- **Chép cả bài thì clipboard tự kèm dòng nguồn.** Trích ngắn dưới 220 ký tự và
  khối mã vẫn chép nguyên vẹn. Dán vào Word thì dòng nguồn là liên kết bấm được.
- **Thêm `docs/RIENG-TU.md`** — cách đặt repo riêng tư, và nói thẳng vì sao
  không thể chặn việc sao chép trên web.

## V1.02 — 14-Sep-2026

- **Sửa chỗ Vercel deploy ra 404.** Thêm `vercel.json` trỏ thẳng vào `dist/`.
  Không có nó, Vercel lấy nhầm thư mục `public/` — trong đó chỉ có ảnh, không
  có trang chủ.
- **Xem thử trên điện thoại.** `npm run dev` nay in luôn địa chỉ của máy trong
  mạng WiFi, gõ vào trình duyệt điện thoại là mở được.
- **Thêm `docs/DUA-LEN-MANG.md`** — ba cách xem trang, cách gỡ mấy lỗi hay gặp,
  và cái bẫy `.gitignore` biến mất khi upload tay lên GitHub.

## V1.01 — 14-Sep-2026

- **Xếp lại đầu bài.** Ngày và phút đọc lên ngay dưới tiêu đề; tóm tắt xuống
  sau, in nghiêng và nhỏ lại. Tag rời khỏi đầu bài, xuống hẳn khung riêng ở chân.
- **Mọi thứ thẳng một mép.** Ảnh bìa, ảnh trong bài, bảng, đầu bài, chân bài —
  cùng một lề trái với cột chữ. Đo lại: lệch 0px ở cả hai khung, cả hai khổ màn.
- **Khung bình luận.** Google Apps Script + Google Sheet, không tốn tiền, không
  bình luận nào tự lên trang. Thêm khối gợi ý đọc tiếp xếp theo tag trùng.
- **Hai công cụ mới.** `npm run anh` đưa ảnh từ `_anh/` vào đúng thư mục bài và
  in sẵn dòng chèn. Chữ giao diện chuyển hết sang tiếng Anh; bỏ khung C.

## V1.00 — 14-Sep-2026

- **Hệ chữ đo lại bằng số liệu thật.** Đếm ký tự trên dòng trong trình duyệt rồi
  mới chỉnh, không ước lượng. Giãn dòng tiêu đề nới ra cho dấu tiếng Việt có chỗ.
- **Bỏ đoạn sapo trùng lặp.** Bài có `summary` thì đoạn đầu không tự phóng to
  nữa — trước đó người đọc gặp hai khối chữ lớn nói cùng một ý.
- **Chuyển sang bộ liquid glass.** Nền kính có viền sáng và độ sâu, nút nhấn có
  nhịp nảy, header và thẻ bài dùng chung một lớp vật liệu.
- **Thêm hai công cụ.** `npm run ver` ghi sổ phiên bản; `npm run kiem` chạy bộ
  kiểm định trước khi đăng.

## V0.00 — 14-Sep-2026

- Dựng hạ tầng blog tĩnh, không framework và không dependency.
- Design system kế thừa bảng màu Sakura và Galaxy; khung đọc bài có ba làn cho
  ảnh phá rào ra ngoài cột chữ.
- Bộ dựng Markdown tự viết, tự đo kích thước ảnh để khoá tỉ lệ.
- Ba file tài liệu: hướng dẫn đăng bài, IA, design system.
