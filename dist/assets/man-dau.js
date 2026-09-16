(function () {
  'use strict';

  var man = document.querySelector('.hero');
  var nut = document.querySelector('.hero-xuong');
  var cot = document.querySelector('.hero-cot--phai');

  var hep = window.matchMedia('(max-width: 1000px)');

  var danh = document.querySelector('.hero-danh');
  if (man && danh) {
    danh.addEventListener('click', function () {
      if (!hep.matches) return;
      man.classList.toggle('hd-ro');
    });
  }

  if (!nut || !cot) return;

  nut.addEventListener('click', function (e) {
    if (!hep.matches) return;
    if (cot.classList.contains('hien')) return;

    e.preventDefault();
    cot.classList.add('hien');

    var toi = function () {
      var y = cot.getBoundingClientRect().top + window.pageYOffset - 16;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    };
    if (document.readyState === 'complete') toi();
    else window.addEventListener('load', toi, { once: true });
  });
})();
