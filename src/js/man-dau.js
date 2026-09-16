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
