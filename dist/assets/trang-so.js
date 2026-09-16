(function () {
  'use strict';

  var KHO = 'zoey:moi-trang';
  var CHON = [10, 20, 50, 0];

  function doc(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function dung(hop) {
    var chon = hop.getAttribute('data-phan-trang') || '';
    var mon  = [].slice.call(hop.querySelectorAll(chon));
    if (!mon.length) return;

    hop.addEventListener('trang-so:dung-lai', function () {
      mon = [].slice.call(hop.querySelectorAll(chon));
      trang = 1;
      ve();
    });

    var nhan = {};
    try { nhan = JSON.parse(hop.getAttribute('data-nhan') || '{}'); } catch (e) {}

    var nhom = [].slice.call(hop.querySelectorAll('[data-nhom]'));

    var macDinh = Math.max(1, parseInt(hop.getAttribute('data-moi-trang'), 10) || 10);
    var luu = parseInt(doc(KHO), 10);
    var moiTrang = (CHON.indexOf(luu) >= 0) ? luu : macDinh;
    var trang = 1;

    var nav = document.createElement('nav');
    nav.className = 'pt';
    nav.setAttribute('aria-label', nhan.pages || 'Pages');

    var so = document.createElement('div');
    so.className = 'pt-so';

    var chonCo = document.createElement('label');
    chonCo.className = 'pt-chon';
    var chuChon = document.createElement('span');
    chuChon.textContent = nhan.perPage || 'Per page';
    var sel = document.createElement('select');
    CHON.forEach(function (n) {
      var o = document.createElement('option');
      o.value = String(n);
      o.textContent = n ? String(n) : (nhan.all || 'All');
      sel.appendChild(o);
    });
    sel.value = String(moiTrang);
    chonCo.appendChild(chuChon);
    chonCo.appendChild(sel);

    nav.appendChild(so);
    nav.appendChild(chonCo);
    hop.appendChild(nav);

    function tongTrang() {
      return moiTrang ? Math.max(1, Math.ceil(mon.length / moiTrang)) : 1;
    }

    function daySo(nay, tong) {
      if (tong <= 7) {
        var a = []; for (var i = 1; i <= tong; i++) a.push(i); return a;
      }
      var r = [1];
      var dau = Math.max(2, nay - 1), cuoi = Math.min(tong - 1, nay + 1);
      if (dau > 2) r.push('…');
      for (var j = dau; j <= cuoi; j++) r.push(j);
      if (cuoi < tong - 1) r.push('…');
      r.push(tong);
      return r;
    }

    function veSo() {
      var tong = tongTrang();
      so.textContent = '';
      if (tong <= 1) return;

      so.appendChild(nut('‹', trang > 1 ? trang - 1 : 0, nhan.prevPage || 'Previous', 'pt-nut pt-nut--lui'));
      daySo(trang, tong).forEach(function (x) {
        if (x === '…') {
          var s = document.createElement('span');
          s.className = 'pt-lung'; s.textContent = '…';
          s.setAttribute('aria-hidden', 'true');
          so.appendChild(s);
          return;
        }
        so.appendChild(nut(String(x), x, null, 'pt-nut' + (x === trang ? ' pt-nut--nay' : '')));
      });
      so.appendChild(nut('›', trang < tong ? trang + 1 : 0, nhan.nextPage || 'Next', 'pt-nut pt-nut--toi'));
    }

    function nut(chu, di, nhanPhu, lop) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = lop;
      b.textContent = chu;
      if (nhanPhu) b.setAttribute('aria-label', nhanPhu);
      if (!di) { b.disabled = true; return b; }
      if (di === trang) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', function () { di_(di); });
      return b;
    }

    function di_(n) {
      trang = n;
      ve();

      var y = hop.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    function ve() {
      var tong = tongTrang();
      if (trang > tong) trang = tong;
      var a = moiTrang ? (trang - 1) * moiTrang : 0;
      var b = moiTrang ? a + moiTrang : mon.length;

      for (var i = 0; i < mon.length; i++) mon[i].hidden = !(i >= a && i < b);

      for (var k = 0; k < nhom.length; k++) {
        nhom[k].hidden = !nhom[k].querySelector(chon + ':not([hidden])');
      }
      veSo();
    }

    sel.addEventListener('change', function () {
      moiTrang = parseInt(sel.value, 10) || 0;
      ghi(KHO, String(moiTrang));
      trang = 1;
      ve();
    });

    ve();
  }

  var ds = document.querySelectorAll('[data-phan-trang]');
  for (var i = 0; i < ds.length; i++) dung(ds[i]);
})();
