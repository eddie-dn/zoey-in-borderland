(function () {
  'use strict';

  var ds  = document.querySelector('.gc-ds');
  var loc = document.querySelector('[data-gc-loc]');
  var api = document.documentElement.getAttribute('data-gc-api');
  var N   = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-gc-nhan') || '{}'); }
  catch (e) {}

  function tho(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;',
               '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function dungChu(chu) {
    return String(chu).trim().split(/\n{2,}/).map(function (doan, i) {
      var h = tho(doan).replace(/\n/g, '<br>');
      h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
      h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
                    '<a href="$2">$1</a>');

      return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + h + '</p>';
    }).join('');
  }

  function ngayAnh(s) {
    var d = new Date(s + 'T00:00:00');
    if (isNaN(d)) return s;
    var TH = ['Jan','Feb','Mar','Apr','May','Jun',
              'Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + TH[d.getMonth()] + ' ' + d.getFullYear();
  }

  var mon = [];
  var nut = [];

  function chon(loai) {

    for (var i = 0; i < mon.length; i++) {
      mon[i].classList.toggle('gc-khac-loai',
        !!loai && mon[i].getAttribute('data-loai') !== loai);
    }
    var hop = document.querySelector('[data-phan-trang]');
    if (hop) hop.dispatchEvent(new CustomEvent('trang-so:dung-lai'));
    for (i = 0; i < nut.length; i++) {
      var la = nut[i].getAttribute('data-loai') === loai;
      nut[i].classList.toggle('chip--nay', la);
      nut[i].setAttribute('aria-pressed', la ? 'true' : 'false');
    }
  }

  function dangChon() {
    for (var i = 0; i < nut.length; i++) {
      if (nut[i].getAttribute('aria-pressed') === 'true') {
        return nut[i].getAttribute('data-loai');
      }
    }
    return '';
  }

  function dungLoc() {
    mon = [].slice.call(document.querySelectorAll('.gc-mot'));
    if (!loc) return;

    var dem = {}, thuTu = [];
    for (var i = 0; i < mon.length; i++) {
      var l = mon[i].getAttribute('data-loai');
      if (!l) continue;
      if (!(l in dem)) { dem[l] = 0; thuTu.push(l); }
      dem[l]++;
    }
    var cu = dangChon();

    if (thuTu.length < 2) { loc.hidden = true; return; }
    loc.hidden = false;

    var h = '<button type="button" class="chip" data-loai="">' +
            tho(N.all || 'All') + '</button>';
    for (i = 0; i < thuTu.length; i++) {
      h += '<button type="button" class="chip" data-loai="' + tho(thuTu[i]) + '">' +
           tho(thuTu[i]) + '<span class="chip-so">' + dem[thuTu[i]] + '</span></button>';
    }
    loc.innerHTML = h;

    nut = [].slice.call(loc.querySelectorAll('button'));
    for (i = 0; i < nut.length; i++) {
      nut[i].addEventListener('click', function () {
        chon(this.getAttribute('data-loai'));
      });
    }

    chon(dem[cu] ? cu : '');
  }

  function chen(g) {
    if (!ds) return null;
    var li = document.createElement('li');
    li.className = 'gc-mot';
    li.setAttribute('data-loai', g.loai || '');
    if (g.ma) li.setAttribute('data-ma', g.ma);
    li.innerHTML =
      '<div class="gc-dau">' +
        '<time datetime="' + tho(g.ngay) + '">' + tho(ngayAnh(g.ngay)) + '</time>' +
        (g.loai ? '<span class="gc-loai">' + tho(g.loai) + '</span>' : '') +
      '</div>' +
      '<div class="gc-chu prose">' + dungChu(g.chu) + '</div>';

    var cac = ds.querySelectorAll('.gc-mot');
    for (var i = 0; i < cac.length; i++) {
      var t = cac[i].querySelector('time');
      if (t && (t.getAttribute('datetime') || '') < g.ngay) {
        ds.insertBefore(li, cac[i]);
        return li;
      }
    }
    ds.appendChild(li);
    return li;
  }

  function xinVe() {

    if (!api || !ds) return Promise.resolve();
    return fetch(api, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.ghiChu || !d.ghiChu.length) return;

        var trong = document.querySelector('.ds-trong');
        if (trong) trong.remove();
        for (var i = 0; i < d.ghiChu.length; i++) chen(d.ghiChu[i]);
        dungLoc();
        if (viet) viet.veLai();
      })

      .catch(function () {});
  }

  var viet = null;

  function oVietCamSan() { return document.querySelector('[data-viet-host]'); }

  function dungOViet(tuDong) {
    if (!api) return null;
    if (!oVietCamSan() && !ds && !document.querySelector('.ds-trong')) return null;

    var K = (window.ZIB || {}).khoa;

    var hop = document.createElement('section');
    hop.className = 'gc-viet';
    var oSan = oVietCamSan();
    if (oSan) oSan.appendChild(hop);
    else {
      var neo = document.querySelector('.gc-loc') || ds || document.querySelector('.ds-trong');
      neo.parentNode.insertBefore(hop, neo);
    }

    function coKhoa() { return !!(K && K.co()); }

    function noi(chu, hong) {
      var o = hop.querySelector('.gc-noi');
      if (!o) return;
      o.textContent = chu || '';
      o.classList.toggle('gc-noi--hong', !!hong);
    }

    function veLai() {
      hop.hidden = !coKhoa();
      hop.innerHTML = coKhoa() ? khungViet() : '';
      if (coKhoa()) gan();
      ganXoa();
    }

    function ganXoa() {
      var cac = document.querySelectorAll('.gc-mot[data-ma]');
      for (var i = 0; i < cac.length; i++) {
        var cu = cac[i].querySelector('.gc-xoa');
        if (!coKhoa()) { if (cu) cu.remove(); continue; }
        if (cu) continue;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gc-xoa';
        b.title = N.del || 'Delete note';
        b.setAttribute('aria-label', N.del || 'Delete note');
        b.textContent = '×';
        b.addEventListener('click', function () {
          var li = this.closest('.gc-mot');
          this.disabled = true;
          fetch(api + '?ma=' + encodeURIComponent(li.getAttribute('data-ma')), {
            method: 'DELETE',
            headers: K.dau()
          }).then(function (r) {
            if (!r.ok) throw new Error('401');
            li.remove();
            dungLoc();
          }).catch(function () {
            noi(N.delFail || 'Could not delete.', true);
          });
        });
        cac[i].querySelector('.gc-dau').appendChild(b);
      }
    }

    function de2() {
      return oVietCamSan() ? ''
        : '<h2 class="gc-viet-de">' + tho(N.write || 'Write a note') + '</h2>';
    }

    function khungViet() {
      var homNay = new Date();
      var iso = new Date(homNay.getTime() - homNay.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 10);
      return de2() +
        '<div class="gc-hang">' +
          '<label class="gc-o gc-o--ngay"><span>' + tho(N.date || 'Date') + '</span>' +
            '<input type="date" name="ngay" value="' + iso + '"></label>' +
          '<label class="gc-o"><span>' + tho(N.kind || 'Kind') + '</span>' +
            '<input type="text" name="loai" list="gc-loai-co" maxlength="24" ' +
              'autocapitalize="off" placeholder="books · music · ideas"></label>' +
        '</div>' +
        '<datalist id="gc-loai-co">' + loaiDaCo() + '</datalist>' +
        '<label class="gc-o"><span>' + tho(N.body || 'Note') + '</span>' +
          '<textarea name="chu" rows="5" maxlength="2000"></textarea></label>' +
        '<div class="gc-nut">' +
          '<button type="button" class="btn btn--chinh" data-dang>' +
            tho(N.post || 'Post') + '</button>' +

          '<span class="gc-ra" data-khoa-ra-nho></span>' +
        '</div>' +
        '<p class="gc-noi"></p>';
    }

    function loaiDaCo() {
      var co = {}, h = '';
      var cac = document.querySelectorAll('.gc-mot');
      for (var i = 0; i < cac.length; i++) {
        var l = cac[i].getAttribute('data-loai');
        if (l && !co[l]) { co[l] = 1; h += '<option value="' + tho(l) + '">'; }
      }
      return h;
    }

    function gan() {
      var bDang = hop.querySelector('[data-dang]');
      var oRa   = hop.querySelector('[data-khoa-ra-nho]');

      if (oRa && K && !oVietCamSan()) K.veChao(oRa, '');

      if (bDang) bDang.addEventListener('click', function () {
        var chu = (hop.querySelector('[name=chu]').value || '').trim();
        if (!chu) { noi(N.bodyMissing || 'Nothing written yet.', true); return; }
        var g = {

          ma  : 'gc' + Date.now().toString(36) +
                Math.random().toString(36).slice(2, 8),
          ngay: hop.querySelector('[name=ngay]').value,
          loai: (hop.querySelector('[name=loai]').value || '').trim(),
          chu : chu
        };
        bDang.disabled = true;
        noi(N.posting || 'Sending…');
        fetch(api, {
          method: 'POST',
          headers: K.dau({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(g)
        }).then(function (r) {
          return r.json().catch(function () { return {}; })
            .then(function (d) { return { ok: r.ok, d: d }; });
        }).then(function (kq) {
          bDang.disabled = false;
          if (!kq.ok) {
            noi((kq.d && (kq.d.chiTiet || kq.d.loi)) ||
                (N.postFail || 'Could not send.'), true);
            return;
          }
          var trong = document.querySelector('.ds-trong');
          if (trong) { trong.remove(); lamOl(); }
          chen(kq.d);
          dungLoc();
          hop.querySelector('[name=chu]').value = '';
          noi(N.posted || 'Xong.');
        }).catch(function () {
          bDang.disabled = false;
          noi(N.postFail || 'Could not send.', true);
        });
      });
    }

    function lamOl() {
      if (ds) return;
      ds = document.createElement('ol');
      ds.className = 'gc-ds';
      hop.parentNode.insertBefore(ds, hop.nextSibling);
    }

    if (!oVietCamSan()) lamOl();
    veLai();

    if (!tuDong) {
      var denNoi = function () {
        var y = hop.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
      };
      if (document.readyState === 'complete') denNoi();
      else window.addEventListener('load', denNoi, { once: true });
    }

    return { veLai: veLai };
  }

  dungLoc();
  if (oVietCamSan()) viet = dungOViet(true);

  if (window.ZIB && window.ZIB.khoa) {
    window.ZIB.khoa.theoDoi(function () { if (viet) viet.veLai(); });
  }
  xinVe();
})();
