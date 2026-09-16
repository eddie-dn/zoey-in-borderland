(function () {
  'use strict';

  var o = document.querySelectorAll('[data-moc]');
  if (!o.length) return;

  var N = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-thoi') || '{}'); } catch (e) {}
  if (!N.ago) return;

  var BAC = [
    [31536000, N.year, N.years],
    [2592000,  N.month, N.months],
    [86400,    N.day, N.days],
    [3600,     N.hour, N.hours],
    [60,       N.min, N.mins]
  ];

  function chu(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return null;
    var giay = Math.floor((Date.now() - t) / 1000);

    if (giay < 60) return N.now;

    for (var i = 0; i < BAC.length; i++) {
      var n = Math.floor(giay / BAC[i][0]);
      if (n >= 1) {
        var mau = (n === 1 ? BAC[i][1] : BAC[i][2]) || '{n}';
        return N.ago.replace('{t}', mau.replace('{n}', n));
      }
    }
    return N.now;
  }

  function ve() {
    for (var i = 0; i < o.length; i++) {
      var el = o[i];
      var c = chu(el.getAttribute('data-moc'));
      if (!c) continue;

      if (!el.dataset.dau) el.dataset.dau = (el.textContent.split(/\s+/)[0] || '');
      el.textContent = el.dataset.dau ? el.dataset.dau + ' ' + c : c;

      if (!el.title) el.title = el.getAttribute('data-moc').slice(0, 10);
    }
  }

  ve();

  setInterval(ve, 60000);
})();
