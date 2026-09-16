(function () {
  'use strict';

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
