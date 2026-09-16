(function () {
  'use strict';

  var o    = document.getElementById('tk-o');
  var kq   = document.getElementById('tk-kq');
  var loc  = document.getElementById('tk-loc');
  if (!o || !kq) return;

  var dem  = document.querySelector('.tk-dem');
  var xoa  = document.querySelector('.tk-xoa');
  var goc  = document.documentElement.getAttribute('data-base') || '';

  var DU = null, dangTai = false;
  var locTag = '';

  function boDau(s) {
    return String(s).normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  }

  function an(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toSang(chu, tu) {
    if (!tu) return an(chu);
    var kd = boDau(chu), ra = '', i = 0;
    while (i < chu.length) {
      var j = kd.indexOf(tu, i);
      if (j < 0) { ra += an(chu.slice(i)); break; }
      ra += an(chu.slice(i, j)) + '<mark>' + an(chu.slice(j, j + tu.length)) + '</mark>';
      i = j + tu.length;
    }
    return ra;
  }

  var N = {};
  try { N = JSON.parse((loc && loc.dataset.nhan) || '{}'); } catch (e) {}
  function nhan(k, n) {
    return String(N[k] || '').replace('{n}', n);
  }

  function tai() {
    if (DU || dangTai) return Promise.resolve();
    dangTai = true;
    return fetch(goc + '/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { DU = chuanBi(d || []); veChip(); })
      .catch(function () { DU = []; })
      .finally(function () { dangTai = false; });
  }

  function chuanBi(ds) {
    for (var i = 0; i < ds.length; i++) {
      var b = ds[i];
      b._de  = boDau(b.title);
      b._tag = boDau((b.tags || []).join(' '));
      b._muc = boDau((b.muc || []).join(' '));
      b._tom = boDau(b.summary || '');
      b._tho = boDau(b.tho || '');
    }
    return ds;
  }

  function veChip() {
    if (!loc || !DU) return;
    var d = {};
    DU.forEach(function (b) { (b.tags || []).forEach(function (t) { d[t] = (d[t] || 0) + 1; }); });
    var ds = Object.keys(d).sort(function (a, b) { return d[b] - d[a]; }).slice(0, 8);
    loc.textContent = '';
    ds.forEach(function (t) {
      var n = document.createElement('button');
      n.type = 'button';
      n.className = 'chip' + (locTag === t ? ' chip--nay' : '');
      n.textContent = t;
      var s = document.createElement('span');
      s.className = 'chip-so'; s.textContent = d[t];
      n.appendChild(s);
      n.addEventListener('click', function () {
        locTag = (locTag === t) ? '' : t;
        veChip(); chay();
      });
      loc.appendChild(n);
    });
  }

  function chay() {
    var tu = boDau(o.value.trim());
    if (xoa) xoa.hidden = !o.value;

    if (!DU) { tai().then(chay); return; }

    if (!tu && !locTag) {
      kq.textContent = ''; if (dem) dem.textContent = '';
      return;
    }

    if (tu && tu.length < 2 && !locTag) {
      kq.textContent = ''; if (dem) dem.textContent = nhan('typeMore');
      return;
    }

    var ra = [];
    for (var i = 0; i < DU.length; i++) {
      var b = DU[i];
      if (locTag && (b.tags || []).indexOf(locTag) < 0) continue;

      var diem = 0;
      if (tu) {
        var tieuDe = b._de, tags = b._tag, muc = b._muc, tom = b._tom;

        if (tieuDe.indexOf(tu) === 0) diem += 100;
        else if (tieuDe.indexOf(tu) >= 0) diem += 60;
        if (tags.indexOf(tu) >= 0) diem += 40;
        if (muc.indexOf(tu) >= 0)  diem += 30;
        if (tom.indexOf(tu) >= 0)  diem += 15;
        if ((b.kd || '').indexOf(tu) >= 0) diem += 8;
        if (b._tho.indexOf(tu) >= 0) diem += 4;
        if (!diem) continue;
      } else {
        diem = 1;
      }
      ra.push({ b: b, diem: diem });
    }

    ra.sort(function (x, y) { return y.diem - x.diem || (x.b.date < y.b.date ? 1 : -1); });

    if (dem) {
      dem.textContent = ra.length === 0 ? nhan('noResults')
        : ra.length === 1 ? nhan('oneResult') : nhan('results', ra.length);
    }
    ve(ra, tu);
  }

  function ve(ra, tu) {
    kq.textContent = '';
    var manh = document.createDocumentFragment();
    ra.slice(0, 40).forEach(function (x) {
      var b = x.b;
      var el = document.createElement('article');
      el.className = 'card the-bai';

      var meta = document.createElement('div');
      meta.className = 'meta-row';
      var t = document.createElement('time');
      t.dateTime = b.date; t.textContent = ngay(b.date);
      meta.appendChild(t);
      if (b.muc && b.muc.length) {

        var m = document.createElement('span');
        m.textContent = b.muc[b.muc.length - 1];
        meta.appendChild(m);
      }

      var h = document.createElement('h3');
      var a = document.createElement('a');
      a.className = 'stretch'; a.href = b.url;
      a.innerHTML = toSang(b.title, tu);
      h.appendChild(a);

      var p = document.createElement('p');
      p.className = 'the-tom';
      p.innerHTML = toSang(cat(b.summary, 150), tu);

      el.appendChild(meta); el.appendChild(h); el.appendChild(p);

      if (b.tags && b.tags.length) {
        var hang = document.createElement('div');
        hang.className = 'tag-row';
        b.tags.slice(0, 3).forEach(function (x2) {
          var s = document.createElement('span');
          s.className = 'tag tag--tinh'; s.textContent = x2;
          hang.appendChild(s);
        });
        el.appendChild(hang);
      }
      manh.appendChild(el);
    });
    kq.appendChild(manh);
  }

  function cat(s, n) {
    s = String(s || '');
    if (s.length <= n) return s;
    var c = s.slice(0, n);
    var k = c.lastIndexOf(' ');
    return (k > n * 0.6 ? c.slice(0, k) : c) + '…';
  }

  function ngay(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }

  var hen = null;
  o.addEventListener('input', function () {
    clearTimeout(hen);
    hen = setTimeout(chay, 120);
  });

  tai();

  if (xoa) {
    xoa.addEventListener('click', function () {
      o.value = ''; locTag = ''; veChip(); chay(); o.focus();
    });
  }

  var q = new URLSearchParams(location.search).get('q');
  if (q) { o.value = q; tai().then(chay); }
})();
