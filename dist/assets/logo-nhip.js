(function () {
  'use strict';

  var svg = document.querySelector('svg.logo--dong');

  if (!svg || !svg.setCurrentTime || !svg.getAnimations) return;

  function gioCSS() {

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
    if (Math.abs(svg.getCurrentTime() - t) < 0.05) return;
    svg.setCurrentTime(t);
  }

  window.addEventListener('pageshow', function (e) { if (e.persisted) dongBo(); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) dongBo();
  });
  window.addEventListener('focus', dongBo);
})();

(function () {
  'use strict';

  var o = document.querySelector('.brand--doi');
  if (!o) return;

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
