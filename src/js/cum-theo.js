/* ============================================================
   CỤM TIM · CHIA SẺ · BÌNH LUẬN ĐI THEO NGƯỜI ĐỌC — chỉ ở BÀI DÀI.

   ── VẤN ĐỀ ──────────────────────────────────────────────────────────────
   Cụm nút nằm ở hàng meta, ngay dưới tiêu đề. Đó là chỗ đúng: mọi khổ màn đều
   có, ai cũng thấy ngay khi mở bài, và ba con số đứng cạnh thứ sinh ra chúng.

   Nhưng ở một bài ba nghìn chữ, hàng meta trôi khỏi màn hình sau chừng một cú
   vuốt. Người đọc tới đoạn hay nhất, muốn thả tim — và phải cuộn ngược lên
   đầu bài. Phần lớn thì không cuộn; họ đọc tiếp rồi đóng tab.

   ── CÁCH LÀM: DỜI, KHÔNG PHẢI CHÉP ──────────────────────────────────────
   Dựng thêm một cụm thứ hai thì có hai trái tim, hai `aria-pressed`, hai con
   số, và mọi thứ comments.js đang giữ tham chiếu tới đều trỏ vào bản cũ. Sớm
   muộn hai bản nói hai chuyện khác nhau về cùng một bài.

   Nên ở đây DỜI hẳn cái cụm đang có. Trạng thái nằm trong chính phần tử ấy,
   nên dời tới đâu nó đúng tới đó, và không có gì phải giữ cho khớp.
   `moc` là một nút chú thích rỗng đánh dấu chỗ cũ, để còn biết trả nó về đâu.

   ── HAI ĐÍCH ĐẾN ────────────────────────────────────────────────────────
     ≥1080px, khung A   → CỘT PHẢI, dưới khối "đọc tiếp". Cột ấy dính khi
                          cuộn, nên cụm đi theo suốt bài mà không che chữ.
     còn lại            → một cụm NỔI ở GÓC DƯỚI PHẢI. Điện thoại không có cột
                          nào để mượn, và góc dưới là chỗ ngón cái với tới
                          được (lý do đầy đủ ở `.cum-noi` trong prose.css).

   ── BỐN TRƯỜNG HỢP KHÔNG DỜI ────────────────────────────────────────────
   · bài ngắn (không có `data-dai`) — cả bài gọn trong một hai màn;
   · hàng meta vẫn còn trong tầm mắt — dời lúc ấy là bày hai lần một thứ;
   · khung bình luận đang chiếm cột phải (`.ben--bl`) — lúc ấy cột đã có việc,
     và người đang gõ bình luận thì không cần một cái nút mời gõ bình luận;
   · đã cuộn tới chân bài ở khổ hẹp — cụm nổi sẽ che mất nút Send.
   ============================================================ */
(function () {
  'use strict';

  var luoi = document.querySelector('.post-layout');
  if (!luoi || !luoi.hasAttribute('data-dai')) return;

  var hang = document.querySelector('.post-head .meta-row');
  var cum  = hang && hang.querySelector('.cum-tt');
  if (!hang || !cum) return;

  /* Trình duyệt không có IntersectionObserver thì thôi — cụm ở lại hàng meta,
     đúng như bài ngắn. Mất một tiện ích, không mất chức năng nào. */
  if (!('IntersectionObserver' in window)) return;

  var ben  = document.querySelector('.ben');
  /* Cột bên chỉ là CỘT THẬT ở khung A có mục lục — cùng câu hỏi mà
     `coCotBen()` bên tools/build.mjs trả lời lúc dựng. Ở đây hỏi thẳng DOM:
     có khối "đọc tiếp" nằm trong `.ben` nghĩa là cột ấy có thật. */
  var coBen = !!(ben && ben.querySelector('.read-next'));
  var rong  = window.matchMedia('(min-width:1080px)');

  var moc = document.createComment('cum-tt');
  cum.parentNode.insertBefore(moc, cum);

  /* Ổ cho cụm nổi. Dựng sẵn một lần, để trống cho tới lúc cần — chèn vào
     <body> chứ không vào `.post-layout`, vì `position:fixed` bên trong một
     phần tử có `transform` hay `filter` sẽ neo vào phần tử ấy chứ không neo
     vào màn hình. `.post-layout` hôm nay không có hai thứ đó, nhưng đặt ở
     body thì mai kia có cũng không hỏng. */
  var oNoi = document.createElement('div');
  oNoi.className = 'cum-noi';
  oNoi.hidden = true;
  document.body.appendChild(oNoi);

  var CHO_GOC = 0, CHO_BEN = 1, CHO_NOI = 2;
  var dangO = CHO_GOC;
  var daRoi = false;          /* hàng meta đã trôi khỏi tầm mắt chưa */
  var toiChan = false;        /* chân bài đã vào tầm mắt chưa */

  function dinh() {
    /* Cột bên đang chở khung bình luận thì trả cụm về chỗ gốc: hai thứ tranh
       nhau một cột là cột ấy dài ra và khung soạn bị đẩy xuống. */
    if (!daRoi) return CHO_GOC;
    if (rong.matches && coBen && !ben.classList.contains('ben--bl')) return CHO_BEN;
    /* ── TỚI CHÂN BÀI THÌ CỤM NỔI LUI ──
       Dưới đó là hàng tag, khung bình luận và cặp đọc tiếp — toàn thứ bấm
       được, và cụm nổi ở góc dưới phải sẽ nằm đè lên đúng nút Send. Một cái
       nút che mất một cái nút khác là lỗi nặng hơn hẳn việc thiếu một lối tắt
       ở đoạn mà lối tắt ấy không còn cần: mọi thứ nó mở ra đều đang hiện ngay
       trên màn. Ở cột phải (khổ rộng) thì không có chuyện che, nên nhánh
       CHO_BEN ở trên đã trả về trước khi tới đây. */
    if (toiChan) return CHO_GOC;
    return CHO_NOI;
  }

  function dat(cho) {
    if (cho === dangO) return;
    dangO = cho;

    cum.classList.toggle('cum-tt--ben', cho === CHO_BEN);
    cum.classList.toggle('cum-tt--noi', cho === CHO_NOI);

    if (cho === CHO_GOC) {
      moc.parentNode.insertBefore(cum, moc.nextSibling);
      oNoi.hidden = true;
      return;
    }
    if (cho === CHO_BEN) { ben.appendChild(cum); oNoi.hidden = true; return; }
    oNoi.appendChild(cum);
    oNoi.hidden = false;
    /* Lớp hiện ra đặt ở khung sau, không đặt cùng lúc với `hidden=false`:
       một phần tử vừa thôi `display:none` thì trình duyệt chưa có trạng thái
       đầu để chạy transition — nó nhảy thẳng tới trạng thái cuối. */
    requestAnimationFrame(function () { oNoi.classList.add('cum-noi--hien'); });
  }

  function ve() {
    var cho = dinh();
    if (cho !== CHO_NOI) oNoi.classList.remove('cum-noi--hien');
    dat(cho);
  }

  /* Ngưỡng 0 và không có `rootMargin`: cụm đổi chỗ đúng lúc hàng meta chạm
     mép trên màn hình. Thêm lề âm để nó đổi sớm hơn thì có một quãng cả hai
     cùng nằm trong tầm mắt — hai cụm nút giống hệt nhau trên một màn. */
  new IntersectionObserver(function (ds) {
    daRoi = !ds[0].isIntersecting;
    ve();
  }).observe(hang);

  var chan = document.querySelector('.post-foot');
  if (chan) {
    new IntersectionObserver(function (ds) {
      toiChan = ds[0].isIntersecting;
      ve();
    }).observe(chan);
  }

  /* Vượt ngưỡng lúc đang dời — xoay điện thoại, kéo rộng cửa sổ — thì đích
     đến đổi theo. Không nghe thì có lúc cụm nằm trong một `.ben` đang là
     `display:contents`, tức là mất luôn cái cột nó vừa được dời vào. */
  (rong.addEventListener ? rong.addEventListener('change', ve)
                         : rong.addListener(ve));

  /* Mở / đóng khung bình luận ở khổ rộng làm cột bên đổi việc. comments.js
     gắn và gỡ lớp `ben--bl` trên chính `.ben`, nên nghe ngay trên nó là biết,
     không phải bắt tay với file kia. */
  if (ben && 'MutationObserver' in window) {
    new MutationObserver(ve).observe(ben, {
      attributes: true, attributeFilter: ['class']
    });
  }
})();
