(function () {
  'use strict';

  var khung = document.querySelector('[data-admin]');
  if (!khung) return;

  var nut = [].slice.call(khung.querySelectorAll('[data-ad]'));
  if (!nut.length) return;

  var KHO = 'zib-admin-ngan';

  function o(ma) { return document.getElementById('ad-o-' + ma); }

  function chon(ma, ghiNho) {
    if (!o(ma)) ma = nut[0].getAttribute('data-ad');

    nut.forEach(function (b) {
      var la = b.getAttribute('data-ad') === ma;
      b.setAttribute('aria-selected', la ? 'true' : 'false');
      b.tabIndex = la ? 0 : -1;
      var k = o(b.getAttribute('data-ad'));
      if (k) k.hidden = !la;
    });

    if (ghiNho) {
      try { localStorage.setItem(KHO, ma); } catch (e) {}

      try { history.replaceState(null, '', '#' + ma); } catch (e) {}
    }

    document.dispatchEvent(new CustomEvent('zib:ngan', { detail: { ma: ma } }));
  }

  nut.forEach(function (b) {
    b.addEventListener('click', function () { chon(b.getAttribute('data-ad'), true); });
    b.addEventListener('keydown', function (e) {
      var i = nut.indexOf(b), j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % nut.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + nut.length) % nut.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = nut.length - 1;
      if (j < 0) return;
      e.preventDefault();
      chon(nut[j].getAttribute('data-ad'), true);
      nut[j].focus();
    });
  });

  var K = (window.ZIB || {}).khoa;
  var oCong = document.querySelector('[data-khoa-cong]');
  var oChao = document.querySelector('[data-khoa-chao]');
  var TEN   = (oChao && oChao.getAttribute('data-ten')) || '';
  var congDaVe = null;

  var daTungVao = K ? K.co() : false;

  function veCua() {

    if (!K || !oCong) { khung.hidden = false; return; }

    var vao = K.co();
    khung.hidden = !vao;
    oCong.hidden = vao;

    if (oChao) oChao.hidden = !vao;

    if (vao) {
      oCong.textContent = '';
      congDaVe = null;
      if (oChao) K.veChao(oChao, TEN);
      return;
    }
    if (oChao) oChao.textContent = '';

    congDaVe = K.veCong(oCong, veCua);

    if (daTungVao) congDaVe.tap();
  }

  if (K) K.theoDoi(function (vao) { if (vao) daTungVao = true; veCua(); });
  veCua();

  var tuDia = (location.hash || '').replace(/^#/, '');
  var daNho = '';
  try { daNho = localStorage.getItem(KHO) || ''; } catch (e) {}
  chon(tuDia || daNho || nut[0].getAttribute('data-ad'), false);

  window.addEventListener('hashchange', function () {
    chon((location.hash || '').replace(/^#/, ''), false);
  });
})();
