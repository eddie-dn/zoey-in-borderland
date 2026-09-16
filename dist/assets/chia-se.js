(function () {
  'use strict';

  var nut = document.querySelector('[data-chia]');
  if (!nut) return;

  var bao = document.querySelector('.cum-bao');
  var NHAN = {};
  try { NHAN = JSON.parse(nut.getAttribute('data-nhan') || '{}'); } catch (e) {}

  var dongHo = null;
  function noi(chu, hong) {
    if (!bao) return;
    bao.textContent = chu;
    bao.classList.toggle('cum-bao--hong', !!hong);
    clearTimeout(dongHo);
    dongHo = setTimeout(function () {
      bao.textContent = '';
      bao.classList.remove('cum-bao--hong');
    }, 2600);
  }

  function chepTay(chu) {
    try {
      var o = document.createElement('textarea');
      o.value = chu;

      o.setAttribute('readonly', '');
      o.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(o);
      o.select();
      var xong = document.execCommand('copy');
      document.body.removeChild(o);
      return xong;
    } catch (e) { return false; }
  }

  nut.addEventListener('click', function () {
    var duong = nut.getAttribute('data-chia') || location.href;
    var de = nut.getAttribute('data-de') || document.title;

    if (navigator.share) {
      navigator.share({ title: de, url: duong }).catch(function (e) {

        if (e && e.name === 'AbortError') return;
        if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
        else noi(NHAN.fail || 'Could not copy', true);
      });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(duong).then(function () {
        noi(NHAN.copied || 'Link copied');
      }).catch(function () {
        if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
        else noi(NHAN.fail || 'Could not copy', true);
      });
      return;
    }

    if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
    else noi(NHAN.fail || 'Could not copy', true);
  });
})();
