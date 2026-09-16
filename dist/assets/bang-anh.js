(function () {
  'use strict';

  var ds = document.querySelectorAll('[data-bang]');
  if (!ds.length) return;

  function dung(hop) {
    var cuon = hop.querySelector('.ba-cuon');
    var tam = [].slice.call(hop.querySelectorAll('.ba-tam'));
    if (!cuon || tam.length < 2) return;

    var nhan = {};
    try { nhan = JSON.parse(hop.getAttribute('data-nhan') || '{}'); } catch (e) {}

    var nay = 0;

    var dieu = document.createElement('div');
    dieu.className = 'ba-dieu';

    var cham = document.createElement('div');
    cham.className = 'ba-cham';
    var nutCham = tam.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (nhan.of || '{n}/{m}')
        .replace('{n}', i + 1).replace('{m}', tam.length));
      b.addEventListener('click', function () { di(i); });
      cham.appendChild(b);
      return b;
    });

    var hopNut = document.createElement('div');
    hopNut.className = 'ba-nut';
    var lui = nut('‹', nhan.prev || 'Previous', -1);
    var toi = nut('›', nhan.next || 'Next', 1);
    hopNut.appendChild(lui); hopNut.appendChild(toi);

    function nut(chu, nhanPhu, buoc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = chu;
      b.setAttribute('aria-label', nhanPhu);
      b.addEventListener('click', function () { di(nay + buoc); });
      return b;
    }

    dieu.appendChild(cham);
    dieu.appendChild(hopNut);
    hop.appendChild(dieu);

    function di(i) {
      i = Math.max(0, Math.min(tam.length - 1, i));

      tam[i].scrollIntoView({ block: 'nearest', inline: 'start' });
    }

    function danhDau(i) {
      nay = i;
      for (var k = 0; k < nutCham.length; k++) {
        nutCham[k].setAttribute('aria-current', k === i ? 'true' : 'false');
      }
      lui.disabled = i === 0;
      toi.disabled = i === tam.length - 1;
    }

    danhDau(0);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (recs) {

        var tot = null;
        for (var i = 0; i < recs.length; i++) {
          if (!tot || recs[i].intersectionRatio > tot.intersectionRatio) tot = recs[i];
        }
        if (tot && tot.intersectionRatio > 0.55) danhDau(tam.indexOf(tot.target));
      }, { root: cuon, threshold: [0.25, 0.55, 0.85] });
      for (var i = 0; i < tam.length; i++) io.observe(tam[i]);
    }
  }

  for (var i = 0; i < ds.length; i++) dung(ds[i]);
})();
