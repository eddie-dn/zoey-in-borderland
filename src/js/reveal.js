/* ============================================================
   REVEAL — hiện dần khi cuộn, cho khung `chuong` của trang tĩnh.
   (Phần trích dẫn theo ngày đã tách sang src/js/quote.js.)
   ============================================================ */
(function () {
  'use strict';
  /* ══════════ 2. HIỆN DẦN KHI CUỘN ══════════

     Các khối [data-hien] bắt đầu ở trạng thái mờ và thấp hơn 16px, hiện lên khi
     lọt vào tầm nhìn. unobserve ngay sau lần đầu: hiện rồi thì thôi, không cho
     nó mờ lại lúc cuộn ngược — chữ nhấp nháy khi cuộn lên là thứ gây khó chịu
     rõ rệt, và không ai cuộn ngược để xem lại hiệu ứng.

     Người bật "giảm chuyển động" thì hiện hết ngay, không animate gì. */
  var khoi = document.querySelectorAll('[data-hien]');
  if (!khoi.length) return;

  var itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (itMotion || !('IntersectionObserver' in window)) {
    khoi.forEach(function (el) { el.classList.add('hien'); });
    return;
  }

  var io = new IntersectionObserver(function (recs) {
    recs.forEach(function (r) {
      if (!r.isIntersecting) return;
      r.target.classList.add('hien');
      io.unobserve(r.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  khoi.forEach(function (el) { io.observe(el); });
})();
