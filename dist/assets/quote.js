(function () {
  'use strict';

  var hop = document.querySelector('[data-quote]');

  function sinh(hat) {
    return function () {
      hat = (hat + 0x6D2B79F5) >>> 0;
      var t = hat;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ngayThu() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function xaoBai(n, vong) {
    var r = sinh(((vong + 1) * 2654435761) >>> 0);
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(r() * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }

  function laBai(n, vong) {
    var a = xaoBai(n, vong);
    if (n > 2) {
      var truoc = xaoBai(n, vong - 1);
      if (a[0] === truoc[n - 1]) { var t = a[0]; a[0] = a[1]; a[1] = t; }
    }
    return a;
  }

  if (hop) {
    var ds = [];
    try { ds = JSON.parse(hop.dataset.quote) || []; } catch (e) {}

    if (ds.length) {
      var elChu = hop.querySelector('.q-chu');
      var elAi  = hop.querySelector('.q-ai');
      var nut   = hop.querySelector('.q-nut');
      var N      = ds.length;

      var nhip = parseInt(hop.getAttribute('data-nhip'), 10) || 0;
      var buoc = ngayThu();
      if (nhip) {
        var dem = 0;
        try {
          dem = (parseInt(sessionStorage.getItem('zoey:trang'), 10) || 0) + 1;
          sessionStorage.setItem('zoey:trang', String(dem));
        } catch (e) { dem = 1; }
        buoc += Math.floor((dem - 1) / nhip);
      }
      var homNay = laBai(N, Math.floor(buoc / N))[((buoc % N) + N) % N];
      var dangO  = homNay;

      function ve(i, doiTay) {
        var q = ds[i];
        hop.classList.add('q-mo');
        setTimeout(function () {
          elChu.textContent = q.chu;
          elAi.textContent  = q.ai || '';
          elAi.hidden = !q.ai;
          hop.classList.toggle('q-khac', i !== homNay);
          hop.classList.remove('q-mo');
        }, doiTay ? 180 : 0);
      }
      ve(homNay, false);

      if (hop.dataset.api) xinGemini(hop.dataset.api);

      function nayLa() {
        var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
        var d = new Date();
        return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
      }

      function xinGemini(api) {
        var nay = nayLa();
        var KHOA = 'zib-quote';

        try {
          var cu = JSON.parse(localStorage.getItem(KHOA) || 'null');
          if (cu && cu.ngay === nay && cu.q) { dat(cu); return; }
        } catch (e) {}

        var ac = new AbortController();
        var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

        fetch(api + '?ngay=' + nay, { signal: ac.signal, cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (kq) {
            if (!kq || !kq.ok || !kq.q) return;
            var x = { ngay: nay, q: kq.q, ai: kq.tacGia || '' };
            try { localStorage.setItem(KHOA, JSON.stringify(x)); } catch (e) {}
            dat(x);
          })
          .catch(function () {  })
          .finally(function () { clearTimeout(boCuoc); });

        function dat(x) {

          ds.unshift({ chu: x.q, ai: x.ai });
          homNay = 0; dangO = 0;
          ve(0, true);
        }
      }

      if (nut) {
        var dangXin = false;
        nut.addEventListener('click', function () {

          if (!hop.dataset.api || dangXin) { lat(); return; }

          dangXin = true;
          var xong = false;
          var henLat = setTimeout(function () {
            if (!xong) { xong = true; lat(); }
          }, 700);

          var ac = new AbortController();
          var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

          fetch(hop.dataset.api + '?moi=1&ngay=' + nayLa(),
                { signal: ac.signal, cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (kq) {
              if (!kq || !kq.ok || !kq.q) return;
              ds.push({ chu: kq.q, ai: kq.tacGia || '' });
              if (!xong) { xong = true; clearTimeout(henLat); dangO = ds.length - 1; ve(dangO, true); }
            })
            .catch(function () {  })
            .finally(function () {
              clearTimeout(boCuoc);
              if (!xong) { xong = true; clearTimeout(henLat); lat(); }
              dangXin = false;
            });
        });
      }

      function lat() {
        dangO = (dangO + 1) % ds.length;
        ve(dangO, true);
      }
    }
  }
})();
