/* ══════════════════════════════════════════════════════════════════════
   MÀN ĐẦU — nút "Read on" ở KHỔ DỌC mở danh sách bài ra.

   ── VÌ SAO CÙNG MỘT NÚT LÀM HAI VIỆC ──
   Khổ ngang: ba bài mới nhất nằm sẵn ở cột phải, nên "Read on" chẳng còn gì
   để mở — nó đi thẳng sang /posts/, nơi có tất cả.

   Khổ dọc: không có cột phải. Bày danh sách ra sẵn thì màn đầu thôi là một
   màn — cuộn một nhịp là gặp ngay danh sách, và khoảng lặng giữa tên blog với
   nội dung mất hẳn. Nên lần bấm ĐẦU mở danh sách ra; từ lần sau nó lại là một
   đường dẫn bình thường sang /posts/.

   Hai việc, một nút, và không có nút thứ hai nào mọc thêm ở khổ dọc.

   ── KHÔNG CÓ JAVASCRIPT THÌ SAO ──
   "Read on" vẫn là thẻ <a href="/posts/"> viết thẳng trong HTML, nên nó vẫn
   dẫn tới danh sách bài đầy đủ. Chỉ mất cú mở tại chỗ. Đó là trạng thái đúng.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var man = document.querySelector('.hero');
  var nut = document.querySelector('.hero-xuong');
  var cot = document.querySelector('.hero-cot--phai');

  /* Ngưỡng phải KHỚP câu @media trong list.css. Đọc bằng matchMedia chứ không
     đo `innerWidth`: xoay ngang điện thoại là ngưỡng đổi, mà matchMedia báo
     tin còn một phép so sánh thì phải tự đi hỏi lại. */
  var hep = window.matchMedia('(max-width: 1000px)');

  /* ── TÊN BLOG: CHẠM ĐỂ MỞ RA ──
     Khổ ngang mở bằng `:hover`, thuần CSS. Khổ dọc không có cú rê chuột nào,
     nên cần đúng một chỗ trong JavaScript: gạt một lớp lên `.hero`.

     Gạt lên `.hero` chứ không lên chính khối chữ, để câu CSS viết được giống
     hệt câu `:hover` đang có — cùng một trạng thái thì nên cùng một cách tả,
     không thì hai bên trôi khỏi nhau sau vài lần sửa.

     Chạm lần nữa thì thu lại: mở ra mà không đóng được thì nó là một cú bấm
     một chiều, và người đọc không có cách nào xem lại cái mình vừa bỏ lỡ. */
  var danh = document.querySelector('.hero-danh');
  if (man && danh) {
    danh.addEventListener('click', function () {
      if (!hep.matches) return;            /* khổ ngang: :hover lo rồi */
      man.classList.toggle('hd-ro');
    });

    /* ── BA ĐƯỜNG THU LẠI, ĐỂ KHỔ DỌC KHÉP KÍN NHƯ `:hover` ──
       `:hover` tự thu lại khi con trỏ rời đi — không cần ai bảo. Cú chạm thì
       không có "rời đi", nên trạng thái mở cứ thế nằm lại: cuộn xuống đọc bài
       rồi cuộn ngược lên vẫn thấy khối chữ đang nở, mà không nhớ mình đã mở
       nó lúc nào.

       Nên dựng đủ ba đường ra, ứng với ba cách người ta thật sự rời khỏi nó. */

    /* 1 · Chạm ra NGOÀI khối chữ — thanh đầu trang, nút, chỗ trống. Nghe ở
       pha bắt (`true`) để nó chạy trước mọi thứ khác, và bỏ qua khi chính
       khối chữ được chạm — cú bấm ấy đã có bộ chuyển ở trên lo. */
    document.addEventListener('click', function (e) {
      if (!hep.matches) return;
      if (!man.classList.contains('hd-ro')) return;
      if (danh.contains(e.target)) return;
      man.classList.remove('hd-ro');
    }, true);

    /* 2 · Cuộn khỏi màn đầu. Ngưỡng .3 chứ không phải 0: đợi khuất hẳn mới
       thu thì lúc cuộn ngược lên, khối chữ hiện ra vẫn đang nở và cú thu diễn
       ra ngay trước mắt — đọc ra như một trục trặc. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ds) {
        if (!ds[0].isIntersecting) man.classList.remove('hd-ro');
      }, { threshold: .3 }).observe(danh);
    }

    /* 3 · Kéo cửa sổ rộng ra quá ngưỡng: từ đó trở đi `:hover` cầm trịch, mà
       lớp `hd-ro` còn sót lại thì hai bên cùng nói một lúc. */
    (hep.addEventListener ? hep.addEventListener('change', function () {
      if (!hep.matches) man.classList.remove('hd-ro');
    }) : hep.addListener(function () {
      if (!hep.matches) man.classList.remove('hd-ro');
    }));
  }

  if (!nut || !cot) return;

  nut.addEventListener('click', function (e) {
    if (!hep.matches) return;              /* khổ ngang: để nó đi /posts/ */
    if (cot.classList.contains('hien')) return;  /* đã mở rồi: đi tiếp */

    e.preventDefault();
    cot.classList.add('hien');

    /* Cuộn tới danh sách vừa mở. Nhảy thẳng chứ không cuộn mượt: trang khai
       `scroll-behavior:smooth` ở cấp cao nhất, mà cuộn mượt tới một khối VỪA
       MỚI hiện ra thì đích còn đang dịch trong lúc cuộn. */
    var toi = function () {
      var y = cot.getBoundingClientRect().top + window.pageYOffset - 16;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    };
    if (document.readyState === 'complete') toi();
    else window.addEventListener('load', toi, { once: true });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   MỤC LỤC TRANG CHỦ — MỘT BÀI MỚI NHẤT + HAI BÀI NHIỀU LƯỢT XEM NHẤT

   ── VÌ SAO VIỆC NÀY PHẢI LÀM Ở ĐÂY, KHÔNG LÀM LÚC DỰNG TRANG ──
   Lượt xem nằm trong D1 của Cloudflare, và D1 chỉ đọc được lúc CHẠY từ một
   hàm worker. Trang chủ thì dựng TĨNH lúc build. Nên HTML dựng ra không thể
   mang sẵn câu trả lời đúng — nó mang ba bài mới nhất, là câu trả lời đúng
   thứ hai, rồi ở đây xếp lại.

   Nghĩa là hai ô sau sẽ ĐỔI CHỮ một nhịp sau khi trang hiện. Đổi lại: trang
   không có JavaScript, hay trang lúc API chưa trả về, vẫn có một mục lục đủ
   nghĩa thay vì ba ô trống. Với một cái nền phụ như mục lục thì đánh đổi ấy
   đúng; nếu là nội dung chính thì đã phải dựng ở phía máy chủ.

   ── KHÔNG Ô NÀO TRÙNG Ô NÀO ──
   Bài mới nhất rất có thể cũng là bài nhiều lượt xem nhất. Nên ô đầu chốt
   trước, rồi hai ô sau lấy theo lượt xem mà BỎ QUA bài đã dùng, và thiếu thì
   bù bằng bài mới kế tiếp. Khối `#hero-ung-vien` mang mười hai ứng viên nên
   luôn còn bài để bù.

   ── KHÔNG ĐỔI THÌ KHÔNG ĐỤNG ──
   Nếu xếp lại mà ra đúng thứ tự đang bày (chuyện thường gặp: bài mới cũng là
   bài được xem nhiều nhất), thì không ghi lại gì cả. Ghi lại y nguyên vẫn là
   một cú nhảy chữ, và một cú nhảy không đổi gì thì chỉ làm người đọc giật
   mình.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ol = document.querySelector('.hero-ds');
  var kho = document.getElementById('hero-ung-vien');
  if (!ol || !kho) return;

  var o = ol.querySelectorAll('.hero-dong');
  if (!o.length) return;

  var uv;
  try { uv = JSON.parse(kho.textContent); } catch (e) { return; }
  if (!uv || uv.length < 2) return;

  function veDong(li, b, i) {
    var a = li.querySelector('a');
    var so = li.querySelector('.hero-so');
    var tt = li.querySelector('.hero-tt');
    var tm = li.querySelector('.hero-ngay');
    if (!a || !tt) return;
    a.setAttribute('href', b.u);
    if (so) so.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    tt.textContent = b.t;
    if (tm) { tm.setAttribute('datetime', b.d); tm.textContent = b.n; }
  }

  /* `top` xin nhiều hơn số ô cần: mấy bài đầu bảng có thể trùng bài mới nhất,
     hoặc là bài đã rút xuống bản nháp nên không còn trong danh sách ứng viên. */
  fetch('/api/xem?top=' + (o.length + 8), { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (kq) {
      if (!kq || !kq.top || !kq.top.length) return;

      var diem = {};
      for (var i = 0; i < kq.top.length; i++) diem[kq.top[i].u] = kq.top[i].so;

      var chon = [uv[0]], dung = {};
      dung[uv[0].u] = 1;

      /* Chỉ xét những bài CÓ trong danh sách ứng viên: bảng lượt xem còn giữ
         cả đường dẫn của bài đã xoá hay đã rút về nháp, và trỏ vào đó là trỏ
         vào một trang 404. */
      var theoView = [];
      for (var j = 0; j < uv.length; j++) if (diem[uv[j].u]) theoView.push(uv[j]);
      theoView.sort(function (a, b) {
        return (diem[b.u] - diem[a.u]) || (a.u < b.u ? -1 : 1);
      });

      for (var k = 0; k < theoView.length && chon.length < o.length; k++) {
        if (!dung[theoView[k].u]) { chon.push(theoView[k]); dung[theoView[k].u] = 1; }
      }
      for (var m = 0; m < uv.length && chon.length < o.length; m++) {
        if (!dung[uv[m].u]) { chon.push(uv[m]); dung[uv[m].u] = 1; }
      }
      if (chon.length < o.length) return;

      var giong = true;
      for (var n = 0; n < o.length; n++) {
        var a0 = o[n].querySelector('a');
        if (!a0 || a0.getAttribute('href') !== chon[n].u) { giong = false; break; }
      }
      if (giong) return;

      for (var q = 0; q < o.length; q++) veDong(o[q], chon[q], q);
    })
    .catch(function () { /* mất mạng, hay chưa gắn D1: giữ ba bài mới nhất */ });
})();
