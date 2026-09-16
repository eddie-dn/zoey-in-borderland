/* ============================================================
   MENU Ở KHỔ HẸP — nút ☰ mở bốn mục điều hướng.

   ── VÌ SAO CẦN ──────────────────────────────────────────────────────────
   Dưới 640px, bốn mục Posts · Notes · Archive · About bị giấu đi để chừa chỗ
   cho tên blog và hai nút hình. Chúng được giấu từ lâu, còn cái nút mở chúng
   ra thì chưa bao giờ được dựng — nên trên điện thoại, blog này KHÔNG CÓ
   đường nào tới bốn trang chính ngoài mấy dòng ở chân trang.

   ── MỞ TẠI CHỖ, KHÔNG PHỦ KÍN MÀN ───────────────────────────────────────
   Một tấm menu phủ kín màn hình là cách quen thuộc, nhưng nó bắt người đọc
   rời hẳn trang đang xem để chọn một mục rồi quay lại. Bốn mục thì không đáng.
   Ở đây nó là một tấm nhỏ thả xuống ngay dưới thanh đầu trang: trang vẫn ở đó,
   và bấm ra ngoài là đóng.

   ── BA ĐƯỜNG ĐÓNG ───────────────────────────────────────────────────────
   Bấm lại nút, bấm ra ngoài tấm, hoặc Esc. Thiếu đường nào thì có người mở ra
   rồi mắc kẹt — nhất là trên bàn phím, nơi không có chỗ "bên ngoài" để bấm.
   ============================================================ */
(function () {
  'use strict';

  var nut = document.querySelector('.nav-nut');
  var tam = document.querySelector('.nav-menu');
  if (!nut || !tam) return;

  function dat(mo) {
    nut.setAttribute('aria-expanded', mo ? 'true' : 'false');
    tam.classList.toggle('nav-menu--mo', mo);
  }
  function dangMo() { return nut.getAttribute('aria-expanded') === 'true'; }

  nut.addEventListener('click', function (e) {
    e.stopPropagation();
    dat(!dangMo());
  });

  /* Chọn xong thì đóng. Trang mới tải lại sẽ dựng menu ở trạng thái đóng, nên
     dòng này chỉ có tác dụng với mục trỏ tới chính trang đang xem — nhưng
     thiếu nó thì đúng trường hợp ấy để lại một tấm menu mở trơ ra. */
  tam.addEventListener('click', function (e) {
    if (e.target.closest('a')) dat(false);
  });

  document.addEventListener('click', function (e) {
    if (!dangMo()) return;
    if (!tam.contains(e.target) && e.target !== nut) dat(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dangMo()) { dat(false); nut.focus(); }
  });
})();
