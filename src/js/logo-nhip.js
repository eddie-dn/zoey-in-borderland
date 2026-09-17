/* ============================================================
   LOGO — GIỮ HAI ĐỒNG HỒ CHẠY CÙNG NHỊP.

   ── VÒNG KỂ ĐƯỢC KÉO BỞI HAI CƠ CHẾ KHÁC NHAU ────────────────────────
   Phần biến hình (nét chữ Z → nơ → vô cực → mandala) do thẻ <animate> của
   SVG lo; phần xoay, mờ và hiện/ẩn do @keyframes của CSS lo. Cả hai cùng
   dài 27 giây và cùng khởi động lúc mở trang, nên bình thường chúng khớp
   nhau tới từng mili-giây — đo thật: lệch 17ms sau 190 giây.

   ── NHƯNG HAI ĐỒNG HỒ ẤY KHÔNG CÙNG MỘT GỐC ──────────────────────────
   Hoạt hình CSS tính giờ theo `document.timeline`, và cái đó ĐỨNG LẠI khi
   trang không còn được vẽ ra — chuyển sang tab khác, thu nhỏ cửa sổ, hay
   trang bị cất vào bộ nhớ đệm back/forward lúc người đọc bấm sang trang
   khác. Đồng hồ SMIL của SVG thì tính theo dòng thời gian của chính tài
   liệu SVG, và mỗi trình duyệt dừng nó ở một thời điểm khác — Safari nổi
   tiếng về chỗ này.

   Hệ quả: đi đâu đó rồi bấm quay lại, hai nửa hoạt hình lệch nhau đúng
   bằng quãng thời gian vắng mặt. Bông hoa xoay trong khi nét chữ còn đang
   ở chặng chữ Z, hay hình nổ tung lúc lẽ ra đang nghỉ. Nhìn ra thì nó
   giống "logo chạy sai thứ tự", chứ không giống "hai đồng hồ lệch nhau" —
   và đó là lý do lỗi này khó gọi tên.

   ── CÁCH CHỮA: KÉO SMIL VỀ THEO CSS ──────────────────────────────────
   Mỗi lần trang được nhìn thấy trở lại, đọc giờ của một hoạt hình CSS bất
   kỳ trong vòng kể rồi đặt đồng hồ SVG về đúng số ấy. Chọn CSS làm chuẩn
   vì nó là thứ kéo phần XOAY — thứ mắt bắt được ngay khi lệch.

   Khớp sẵn thì không đụng vào: `setCurrentTime` là một cú nhảy, và nhảy
   một quãng 30ms vẫn là một cú giật thấy được trên hình đang xoay.
   ============================================================ */
/* Hai việc, hai khối. Chúng chẳng dính gì nhau về mặt mã, nhưng cùng là
   "cách logo cư xử theo thời gian" — và một trang chỉ bao giờ có đúng một
   trong hai (trang có logo động thì không có ô đổi qua lại, và ngược lại). */

/* ══════════ 1 · GIỮ HAI ĐỒNG HỒ CÙNG NHỊP ══════════ */
(function () {
  'use strict';

  var svg = document.querySelector('svg.logo--dong');
  /* `setCurrentTime` là của SVGSVGElement; `getAnimations` có từ Safari 13.4.
     Thiếu một trong hai thì thôi — logo vẫn chạy, chỉ là không tự chỉnh lại. */
  if (!svg || !svg.setCurrentTime || !svg.getAnimations) return;

  function gioCSS() {
    /* Lấy hoạt hình của bông hoa: nó chạy `linear` suốt cả vòng nên giờ của
       nó là giờ của cả vòng kể. Không có thì lấy hoạt hình đầu tiên tìm được
       trong logo — mọi hoạt hình ở đây đều dài đúng một vòng. */
    var el = svg.querySelector('.lg-hoa');
    var ds = (el && el.getAnimations) ? el.getAnimations() : svg.getAnimations();
    for (var i = 0; i < ds.length; i++) {
      if (ds[i].currentTime != null) return ds[i].currentTime / 1000;
    }
    return null;
  }

  function dongBo() {
    var t = gioCSS();
    if (t == null) return;
    if (Math.abs(svg.getCurrentTime() - t) < 0.05) return;   /* đã khớp */
    svg.setCurrentTime(t);
  }

  /* ══════════ QUAY LẠI SAU MỘT LÚC THÌ KỂ LẠI TỪ ĐẦU ══════════

     Vòng logo là một CÂU CHUYỆN 27 giây có mở có kết: nét dựng, xoay, nở, nổ,
     rồi nghỉ. Đi tab khác mươi phút rồi quay về thì đồng hồ đã chạy qua ba
     bốn vòng, và cái đập vào mắt là một mẩu giữa chuyện — hình đang nổ tung,
     hay đang nằm im ở chặng nghỉ. Không sai nhịp, nhưng đọc ra là lộn xộn.

     Nên: vắng mặt QUÁ NGƯỠNG thì kéo cả hai đồng hồ về 0 và kể lại từ đầu.

     ── VÌ SAO CÓ NGƯỠNG, KHÔNG PHẢI CỨ QUAY LẠI LÀ RESET ──
     Liếc sang cửa sổ khác hai giây rồi quay lại là chuyện xảy ra suốt trong
     lúc đọc — reset ở đó thì logo giật về đầu mỗi lần người ta đổi cửa sổ,
     và cái giật ấy còn phá hơn hẳn việc bắt gặp giữa chuyện.

     8 giây: dưới đó là "vẫn đang ở đây, chỉ ngó đi một cái" — chỉ chỉnh lại
     cho hai đồng hồ khớp nhau như cũ. Trên đó là "đã đi chỗ khác rồi quay
     lại", và lúc ấy kể lại từ đầu mới đúng. */
  var NGUONG_LAI = 8000;
  var lucAn = 0;

  function batDauLai() {
    /* Kéo MỌI hoạt hình CSS trong logo về 0, rồi đặt đồng hồ SVG theo. Phải
       làm cả hai: mỗi cái kéo một nửa hình, đặt lại một nửa thì nửa kia vẫn
       ở giữa chuyện — đúng cái lệch mà cả khối này sinh ra để chữa. */
    var ds = svg.getAnimations({ subtree: true });
    for (var i = 0; i < ds.length; i++) {
      try { ds[i].currentTime = 0; } catch (e) {}
    }
    try { svg.setCurrentTime(0); } catch (e) {}
  }

  function veLai() {
    var vang = lucAn ? Date.now() - lucAn : 0;
    lucAn = 0;
    if (vang > NGUONG_LAI) batDauLai();
    else dongBo();
  }

  /* Ba cửa, vì ba trình duyệt báo một chuyện bằng ba sự kiện khác nhau:
       pageshow(persisted)  lấy lại từ bộ nhớ đệm back/forward (Safari, Firefox)
       visibilitychange     đổi tab, thu nhỏ cửa sổ (mọi trình duyệt)
       focus                lấy lại tiêu điểm cửa sổ — lưới an toàn cuối
     Gọi thừa vài lần không sao: `dongBo` tự bỏ qua khi hai đồng hồ đã khớp,
     còn `batDauLai` chỉ chạy khi `lucAn` còn được ghi — và nó bị xoá ngay ở
     lượt gọi đầu tiên. */
  window.addEventListener('pageshow', function (e) { if (e.persisted) batDauLai(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) lucAn = Date.now();
    else veLai();
  });
  window.addEventListener('focus', veLai);
})();

/* ══════════ 2 · ĐỔI QUA LẠI GIỮA CHỮ VÀ LOGO ══════════

   Ở mọi trang ngoài Home và About, ô thương hiệu nghỉ ở dạng DÒNG CHỮ. Rê
   chuột vào thì nó thành logo — việc ấy CSS lo một mình, không cần file này.

   Phần dưới đây chỉ lo cú đổi TỰ ĐỘNG: cứ 20 giây gạt qua một lần, để người
   đọc không rê chuột vào cũng có lúc gặp cái logo.

   ── VÌ SAO 20 GIÂY, VÀ VÌ SAO KHÔNG CHẠY LẠI HOẠT HÌNH ──
   Đây là một dấu hiệu nhận diện nép ở góc trang, không phải một màn trình
   diễn. Nhanh hơn thì nó thành thứ nhấp nháy ở rìa mắt trong lúc người ta
   đang đọc; chậm hơn thì có người đọc xong cả bài mà chưa gặp lần nào. Và nó
   chỉ MỜ DẦN đổi hình, không chạy lại vòng kể 27 giây — vòng kể là chuyện của
   màn đầu, chỗ người ta tới để nhìn.

   ── DỪNG KHI TRANG KHÔNG ĐƯỢC NHÌN ──
   Đồng hồ chạy tiếp lúc tab bị ẩn thì lúc quay lại, ô thương hiệu có thể đang
   ở giữa một cú mờ dần mà chẳng vì lý do gì. Trình duyệt đã bóp `setInterval`
   ở tab ẩn, nhưng bóp không có nghĩa là dừng — nên dừng hẳn cho chắc. */
(function () {
  'use strict';

  var o = document.querySelector('.brand--doi');
  if (!o) return;
  /* Người tắt hiệu ứng chuyển động: CSS đã khoá luôn trạng thái logo, nên cái
     đồng hồ này chỉ còn gạt một lớp chẳng đổi gì. Thôi đừng chạy. */
  var iu = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (iu && iu.matches) return;

  var NHIP = 20000;
  var dong = null;

  function chay() {
    if (dong) return;
    dong = setInterval(function () {
      o.classList.toggle('brand--hien-logo');
    }, NHIP);
  }
  function dung() {
    clearInterval(dong);
    dong = null;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) dung(); else chay();
  });
  if (!document.hidden) chay();
})();
