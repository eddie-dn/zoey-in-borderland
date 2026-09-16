(function () {
  'use strict';

  var khoi = document.querySelector('[data-copy-guard]');
  if (!khoi) return;

  var NGUONG  = Number(khoi.dataset.nguong) || 220;
  var GIOIHAN = Number(khoi.dataset.gioihan) || 0;
  var NHAC    = khoi.dataset.nhac || 'Read the full piece at';
  var TIEUDE  = khoi.dataset.tieude || document.title;

  function trongKhoiMa(sel) {

    if (!sel.rangeCount) return false;
    var n = sel.getRangeAt(0).commonAncestorContainer;
    if (n.nodeType === 3) n = n.parentNode;
    return !!(n && n.closest && n.closest('pre'));
  }

  document.addEventListener('copy', function (e) {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    var chu = String(sel);
    if (chu.length < NGUONG) return;
    if (trongKhoiMa(sel)) return;

    if (sel.rangeCount) {
      var n = sel.getRangeAt(0).commonAncestorContainer;
      if (n.nodeType === 3) n = n.parentNode;
      if (!n || !n.closest || !n.closest('[data-copy-guard]')) return;
    }

    var than = chu;
    var catBot = false;
    if (GIOIHAN > 0 && than.length > GIOIHAN) {

      var cut = than.slice(0, GIOIHAN);
      var sp = cut.lastIndexOf(' ');
      than = (sp > GIOIHAN * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
      catBot = true;
    }

    var nguon = '\n\n— ' + TIEUDE + '\n' + NHAC + ': ' + location.href;
    var raTho = than + nguon;

    try {
      e.clipboardData.setData('text/plain', raTho);

      e.clipboardData.setData('text/html',
        '<blockquote>' + thoat(than) + '</blockquote>' +
        '<p>— ' + thoat(TIEUDE) + '<br>' + thoat(NHAC) + ': ' +
        '<a href="' + thoat(location.href) + '">' + thoat(location.href) + '</a></p>');
      e.preventDefault();
    } catch (err) {

      return;
    }

    if (catBot) nhacNho();
  });

  function thoat(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var dangHien = null;
  function nhacNho() {
    if (dangHien) { clearTimeout(dangHien.t); dangHien.el.remove(); }
    var el = document.createElement('div');
    el.className = 'copy-nhac';
    el.setAttribute('role', 'status');
    el.textContent = 'That was a long excerpt, so it was shortened and the source added ✦';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('hien'); });
    dangHien = { el: el, t: setTimeout(function () {
      el.classList.remove('hien');
      setTimeout(function () { el.remove(); }, 320);
      dangHien = null;
    }, 3200) };
  }
})();
