(function () {
  'use strict';

  var NHIP  = 5;
  var NGUNG = 900;

  var API_SO = document.documentElement.getAttribute('data-so-tay-api');

  (function () {
    var de = document.querySelector('[data-cua-ql]');
    if (!de) return;
    var d = 0, h = null;
    de.addEventListener('pointerdown', function () {
      d++;
      if (h) clearTimeout(h);
      if (d >= 5) { d = 0; location.href = de.getAttribute('data-cua-ql'); return; }
      h = setTimeout(function () { d = 0; }, 900);
    });
  })();

  var cua = document.querySelector('[data-so-tay]');
  if (!API_SO || !cua) return;

  var DU = null;
  var dangXin = null;

  var N = {};
  function L(k, n) { return String(N[k] || '').replace('{n}', n); }

  function xinDuLieu() {
    if (DU) return Promise.resolve(DU);
    if (dangXin) return dangXin;

    dangXin = fetch(API_SO)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.build || !d.build.length) throw new Error('sổ rỗng');
        DU = d; N = d.nhan || {};
        return DU;
      })
      .catch(function (e) { dangXin = null; throw e; });
    return dangXin;
  }

  var dem = 0, hen = null;

  cua.addEventListener('click', function () {
    clearTimeout(hen);
    dem++;

    if (dem > 1) {
      cua.classList.remove('go');
      void cua.offsetWidth;
      cua.classList.add('go');
    }
    if (dem >= NHIP) { dem = 0; cua.classList.remove('go'); mo(); return; }
    hen = setTimeout(function () { dem = 0; cua.classList.remove('go'); }, NGUNG);
  });

  var nen = null, hop = null, traVe = null;

  function mo() {
    if (nen) return;

    xinDuLieu().then(moThat, function () {});
  }

  function moThat() {
    if (nen) return;
    traVe = document.activeElement;

    nen = document.createElement('div');
    nen.className = 'so-nen';
    nen.innerHTML = '<div class="so-hop glass" role="dialog" aria-modal="true" ' +
                    'aria-label="' + an(L('history')) + '"></div>';
    hop = nen.querySelector('.so-hop');
    document.body.appendChild(nen);
    document.body.classList.add('so-khoa');

    veBuild();
    requestAnimationFrame(function () { nen.classList.add('hien'); });

    nen.addEventListener('click', function (e) { if (e.target === nen) dong(); });
    document.addEventListener('keydown', phim);
  }

  function phim(e) {
    if (e.key === 'Escape') { dong(); return; }
    if (e.key !== 'Tab' || !hop) return;

    var oc = hop.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
    if (!oc.length) return;
    var dau = oc[0], cuoi = oc[oc.length - 1];
    if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
    else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
  }

  function dong() {
    if (!nen) return;
    document.removeEventListener('keydown', phim);
    document.body.classList.remove('so-khoa');
    var x = nen; nen = null; hop = null;
    x.classList.remove('hien');
    setTimeout(function () { x.remove(); }, 200);
    if (traVe && traVe.focus) traVe.focus();
  }

  function an(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chuNho(s) {
    return an(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function veDau(tieuDe, coLui, luiVe) {
    return '<div class="so-dau">' +
      (coLui
        ? '<button class="ico-btn so-lui" type="button" aria-label="' + an(L('back')) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' +
          '</button>'
        : '') +
      '<p class="label label--muted">' + tieuDe + '</p>' +
      '<button class="ico-btn so-x" type="button" aria-label="' + an(L('close')) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '</button>' +
    '</div>';
  }

  function noiNut(luiVe) {
    hop.querySelector('.so-x').addEventListener('click', dong);
    var l = hop.querySelector('.so-lui');
    if (l && luiVe) { l.addEventListener('click', luiVe); l.focus(); }
    else hop.querySelector('.so-x').focus();
  }

  function veBuild() {
    var hang = DU.build.map(function (b, i) {

      var moi = b.va[0];
      var khoang = b.tuNgay === b.denNgay ? an(b.tuNgay)
                 : an(b.tuNgay) + ' → ' + an(b.denNgay);
      return '<tr class="so-co so-build" tabindex="0" role="button" data-i="' + i + '">' +
          '<td class="so-ver so-ver--lon">' + an(b.ten) + '</td>' +
          '<td class="so-ngay">' + khoang + '</td>' +
          '<td class="so-dem">' + an(b.soVa) + '</td>' +
          '<td class="so-viec">' + an(moi.suaChinh) +
            '<i class="so-mui" aria-hidden="true"></i></td>' +
        '</tr>';
    }).join('');

    hop.innerHTML =
      veDau(an(L('history')), false) +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('builds', DU.build.length)) + '</p>';

    noiNut(null);
    gan(function (i) { veVa(i); });
  }

  function veVa(iB) {
    var b = DU.build[iB];
    var hang = b.va.map(function (v, i) {
      var coChi = DU.chiTiet && DU.chiTiet[v.ten] && DU.chiTiet[v.ten].length;
      return '<tr class="' + (coChi ? 'so-co' : 'so-khong') + '"' +
             (coChi ? ' tabindex="0" role="button" data-i="' + i + '"' : '') + '>' +
          '<td class="so-ver">' + an(v.ten) + '</td>' +
          '<td class="so-ngay">' + an(v.ngay) + '</td>' +
          '<td class="so-dem">' + an(v.so) + '</td>' +
          '<td class="so-viec">' + an(v.suaChinh) +
            (coChi ? '<i class="so-mui" aria-hidden="true"></i>' : '') + '</td>' +
        '</tr>';
    }).join('');

    hop.innerHTML =
      veDau(an(b.ten), true) +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('patches', b.soVa)) + '</p>';

    noiNut(veBuild);
    gan(function (i) { veChiTiet(iB, i); });
  }

  function veChiTiet(iB, iV) {
    var v  = DU.build[iB].va[iV];
    var ds = (DU.chiTiet && DU.chiTiet[v.ten]) || [];

    hop.innerHTML =
      veDau(an(v.ten) + ' · ' + an(v.ngay), true) +
      '<div class="so-cuon">' +
        (ds.length
          ? '<ul class="so-y">' + ds.map(function (y) {
              return '<li>' + chuNho(y) + '</li>';
            }).join('') + '</ul>'
          : '<p class="so-trong">' + an(L('noInfo')) + '</p>') +
      '</div>' +
      '<p class="so-chan">' + an(v.suaChinh) + '</p>';

    noiNut(function () { veVa(iB); });
  }

  function gan(vao) {
    hop.querySelectorAll('[data-i]').forEach(function (n) {
      function di() { vao(+n.getAttribute('data-i')); }
      n.addEventListener('click', di);
      n.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); di(); }
      });
    });
  }
})();
