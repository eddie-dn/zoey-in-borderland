(function () {
  'use strict';

  var o = document.querySelectorAll('[data-xem]');
  if (!o.length) return;

  var api = document.documentElement.getAttribute('data-xem-api');
  if (!api) return;

  var N = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-xem-nhan') || '{}'); } catch (e) {}

  function hien(el, so) {
    if (!(so > 0)) return;
    var mau = so === 1 ? (N.one || '1 view') : (N.many || '{n} views');
    el.textContent = mau.replace('{n}', so.toLocaleString());
    el.hidden = false;
  }

  var day = window.location.pathname;
  var minh = null;
  for (var i = 0; i < o.length; i++) {
    if (o[i].getAttribute('data-xem') === day) { minh = o[i]; break; }
  }

  if (minh && o.length === 1) {
    var khoa = 'zoey:xem:' + day;
    var daGhi = false;
    try { daGhi = sessionStorage.getItem(khoa) === '1'; } catch (e) {}
    fetch(api + '?u=' + encodeURIComponent(day) + (daGhi ? '' : '&ghi=1'))
      .then(function (r) { return r.json(); })
      .then(function (k) {
        if (k && !k.tat) {
          hien(minh, k.so);
          try { sessionStorage.setItem(khoa, '1'); } catch (e) {}
        }
      })
      .catch(function () {});
    return;
  }

  var LO = 60;
  var ds = [];
  for (i = 0; i < o.length; i++) ds.push(o[i].getAttribute('data-xem'));

  var gom = {};
  var cho = [];
  for (i = 0; i < ds.length; i += LO) {
    cho.push(fetch(api + '?ds=' + encodeURIComponent(ds.slice(i, i + LO).join(',')))
      .then(function (r) { return r.json(); })
      .then(function (k) {
        if (!k || k.tat || !k.so) return;
        for (var u in k.so) if (Object.prototype.hasOwnProperty.call(k.so, u)) gom[u] = k.so[u];
      })

      .catch(function () {}));
  }

  Promise.all(cho).then(function () {
    for (var j = 0; j < o.length; j++) hien(o[j], gom[o[j].getAttribute('data-xem')] || 0);
  });
})();
