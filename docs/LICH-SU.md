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
