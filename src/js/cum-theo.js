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

  /* ── CỤM NỔI LUI ĐI TRONG LÚC CUỘN XUỐNG ──
     Nó nằm ĐÈ LÊN cột chữ — trên màn 390px, cột chữ rộng 350px mà cụm ăn mất
     54px ở mép phải, tức là nuốt hai ba chữ cuối của mấy dòng nó che. Đọc tới
     đó là hụt mất chữ.

     Cuộn XUỐNG là đang đọc tới; lúc ấy cụm không có việc gì, nên nó trượt đi.
     Cuộn NGƯỢC LÊN là đã dừng đọc và đang tìm lại cái gì đó — đúng lúc cần
     nó. Cùng nếp với thanh công cụ của mọi trình duyệt điện thoại.

     Ngưỡng 8px để một cú chạm rung tay không bật tắt liên tục. */
  var CHO_GOC = 0, CHO_BEN = 1, CHO_NOI = 2;
  var dangO = CHO_GOC;
  var daRoi = false;          /* hàng meta đã trôi khỏi tầm mắt chưa */
  var toiChan = false;        /* chân bài đã vào tầm mắt chưa */

  function dinh() {
    /* Cột bên đang chở khung bình luận thì trả cụm về chỗ gốc: hai thứ tranh
       nhau một cột là cột ấy dài ra và khung soạn bị đẩy xuống. */
    if (!daRoi) return CHO_GOC;
    if (rong.matches && coBen && !ben.classList.contains('ben--bl')) return CHO_BEN;
    /* ── CỤM NỔI LÀ CÁCH LÀM CỦA ĐIỆN THOẠI, KHÔNG PHẢI CỦA MÁY BÀN ──
       Ở khổ rộng mà bài không có cột bên (khung ảnh, khung B, hoặc khung A
       không có tiêu đề mục), cụm KHÔNG nổi lên: nó ở lại hàng meta.

       Ba nút tròn thả nổi giữa một màn 1440px đọc ra là một mẩu giao diện lạc
       — không neo vào cột chữ, không neo vào cột bên, chỉ lơ lửng ở góc. Trên
       điện thoại nó có lý do tồn tại (không còn chỗ nào khác, và ngón cái với
       tới được); trên máy bàn thì chuột đi đâu cũng tới, nên cái giá "một mẩu
       lạc giữa màn" không đổi lại được gì. */
    if (rong.matches) return CHO_GOC;
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

  /* ── GIẤU KHI ĐANG CUỘN XUỐNG, HIỆN LẠI KHI DỪNG TAY ──
     Bản trước chỉ đổi trạng thái lúc HƯỚNG cuộn đảo chiều: giấu khi xuống,
     hiện khi lên. Trên điện thoại thì đó là một cái bẫy — một cú vuốt mạnh
     sinh ra quán tính chạy tiếp cả nghìn pixel rồi tắt dần, và hướng KHÔNG
     BAO GIỜ đảo. Cụm ba nút trượt ra khỏi mép phải và nằm luôn ngoài đó cho
     tới khi người đọc chủ động vuốt ngược lên. Đúng cái "lướt hơi nhanh tí
     là mất ba cục bên tay phải".

     Nay có thêm một đường về thứ hai: hết cuộn thì hiện lại. 420ms là quãng
     đủ dài để không chớp tắt giữa những cú vuốt nối nhau, mà vẫn đủ ngắn để
     người vừa dừng mắt lại đã thấy cụm nút ở đó. */
  var truocY = window.scrollY;
  var dangLui = false;
  var henHien = 0;

  function lui(co) {
    if (co === dangLui) return;
    dangLui = co;
    /* Chỉ giấu, KHÔNG dời chỗ: dời đi dời lại theo mỗi cú vuốt là mỗi cú vuốt
       một lượt tính lại bố cục, và nút vừa bấm hụt thì nó đã ở chỗ khác. */
    oNoi.classList.toggle('cum-noi--lui', co);
  }

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - truocY) >= 8) {
      lui(y > truocY);
      truocY = y;
    }
    clearTimeout(henHien);
    henHien = setTimeout(function () { lui(false); }, 420);
  }, { passive: true });

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
