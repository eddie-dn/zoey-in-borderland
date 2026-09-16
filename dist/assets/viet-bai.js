(function () {
  'use strict';

  var goc = document.documentElement;
  var api = goc.getAttribute('data-bai-api');
  var oSan = document.querySelector('[data-viet-bai-host]');
  if (!api || !oSan) return;

  var N = {};
  try { N = JSON.parse(goc.getAttribute('data-bai-nhan') || '{}'); } catch (e) {}
  function L(k, m) { return N[k] || m; }

  var K = (window.ZIB || {}).khoa;
  function coKhoa() { return !!(K && K.co()); }

  var soan = null;

  function tho(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return String(s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/['"‘’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  var hop = document.createElement('section');
  hop.className = 'vb-khoi';
  oSan.appendChild(hop);

  var dsMuc = null;

  function noi(chu, kieu) {
    var o = hop.querySelector('.vb-noi');
    if (!o) return;
    o.textContent = chu || '';
    o.className = 'vb-noi' + (kieu ? ' vb-noi--' + kieu : '');
  }

  function khungCho() {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('locked',
      'Sign in above to unlock this.')) + '</p>';
  }

  var bangDS = null;
  var dangSua = null;
  var locTrang = '';

  var TEN_TRANG = { hien: 'Live', nhap: 'Draft', an: 'Hidden' };

  function veBang() {
    soan = null;
    hop.innerHTML =
      '<div class="vb-thanh">' +
        '<button type="button" class="btn btn--chinh" data-moi>' +
          tho(L('newPost', 'New post')) + '</button>' +
        '<div class="vb-loc" data-loc></div>' +
      '</div>' +
      '<div class="vb-bang" data-bang>' +
        '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    hop.querySelector('[data-moi]').addEventListener('click', function () { khungViet(); });
    if (bangDS) veHang(); else taiBang();
  }

  function taiBang() {
    fetch(api + '?ds=1', { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (!kq.d || !kq.d.ok) {
          var o = hop.querySelector('[data-bang]');
          if (o) o.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
          return;
        }
        bangDS = kq.d.bai || [];
        bangDS.cut = kq.d.cut; bangDS.tran = kq.d.tran; bangDS.tong = kq.d.tong;
        veHang();
      })
      .catch(function () {
        var o = hop.querySelector('[data-bang]');
        if (o) o.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Network hiccup. Try again in a moment.')) + '</p>';
      });
  }

  function veHang() {
    var oLoc = hop.querySelector('[data-loc]');
    var oBang = hop.querySelector('[data-bang]');
    if (!oBang) return;

    var dem = { hien: 0, nhap: 0, an: 0 };
    bangDS.forEach(function (b) { if (dem[b.trang] != null) dem[b.trang]++; });

    if (oLoc) {
      var h = '<button type="button" class="chip' + (locTrang ? '' : ' chip--nay') +
              '" data-t="">' + tho(L('all', 'All')) +
              '<span class="chip-so">' + bangDS.length + '</span></button>';
      ['hien', 'nhap', 'an'].forEach(function (t) {
        if (!dem[t]) return;
        h += '<button type="button" class="chip' + (locTrang === t ? ' chip--nay' : '') +
             '" data-t="' + t + '">' + tho(TEN_TRANG[t]) +
             '<span class="chip-so">' + dem[t] + '</span></button>';
      });
      oLoc.innerHTML = h;
      [].slice.call(oLoc.querySelectorAll('button')).forEach(function (b) {
        b.addEventListener('click', function () {
          locTrang = b.getAttribute('data-t'); veHang();
        });
      });
    }

    var ds = bangDS.filter(function (b) { return !locTrang || b.trang === locTrang; });
    if (!ds.length) {
      oBang.innerHTML = '<p class="vb-cho">' + tho(L('empty', 'Nothing here.')) + '</p>';
      return;
    }

    oBang.innerHTML = ds.map(function (b) {
      return '<div class="vb-dong" data-d="' + tho(b.duong) + '">' +
        '<span class="vb-dong-ngay">' + tho(b.date) + '</span>' +
        '<span class="vb-dong-ten">' + tho(b.title) + '</span>' +
        (b.trang !== 'hien'
          ? '<span class="vb-cd vb-cd--' + b.trang + '">' + tho(TEN_TRANG[b.trang]) + '</span>'
          : '<span class="vb-cd"></span>') +
        '<span class="vb-dong-nut">' +
          '<button type="button" class="vb-nho" data-sua>' + tho(L('edit', 'Edit')) + '</button>' +
          '<button type="button" class="vb-nho" data-an>' +
            tho(b.trang === 'an' ? L('unhide', 'Unhide') : L('hide', 'Hide')) + '</button>' +
        '</span>' +
      '</div>';
    }).join('') +
    (bangDS.cut
      ? '<p class="vb-cho">' + tho(
          (L('capped', 'Showing the {n} newest of {t} posts.'))
            .replace('{n}', bangDS.tran).replace('{t}', bangDS.tong)) + '</p>'
      : '');

    [].slice.call(oBang.querySelectorAll('.vb-dong')).forEach(function (d) {
      var duong = d.getAttribute('data-d');
      d.querySelector('[data-sua]').addEventListener('click', function () { moSua(duong); });
      d.querySelector('[data-an]').addEventListener('click', function (e) {
        doiAn(duong, e.target);
      });
    });
  }

  function doiAn(duong, nut) {
    var cu = nut.textContent;
    nut.disabled = true;
    nut.textContent = L('working', '…');
    fetch(api + '?doc=' + encodeURIComponent(duong), { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error('doc');
        var than = {
          duong: d.duong, sha: d.sha, noiDung: d.noiDung, khoaKhac: d.khoaKhac,
          title: d.fm.title, date: d.fm.date, summary: d.fm.summary,
          tags: d.fm.tags, cover: d.fm.cover, coverAlt: d.fm.coverAlt,
          draft: d.fm.draft, hidden: !d.fm.hidden
        };
        return fetch(api, {
          method: 'PUT',
          headers: K.dau({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(than)
        }).then(function (r) { return r.json(); });
      })
      .then(function (d) {
        nut.disabled = false;
        if (!d || !d.ok) { nut.textContent = cu; noi(loiChu(d), 'hong'); return; }

        for (var i = 0; i < bangDS.length; i++) {
          if (bangDS[i].duong === duong) { bangDS[i].trang = d.trang; bangDS[i].sha = d.sha; }
        }
        veHang();
        noi(L('saved', 'Saved. Cloudflare is rebuilding.'));
      })
      .catch(function () {
        nut.disabled = false; nut.textContent = cu;
        noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
      });
  }

  function moSua(duong) {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>';
    fetch(api + '?doc=' + encodeURIComponent(duong), { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (!kq.d || !kq.d.ok) {
          hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
          return;
        }
        dangSua = kq.d;
        khungViet(kq.d);
      })
      .catch(function () {
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Network hiccup. Try again in a moment.')) + '</p>';
      });
  }

  function khungViet(cu) {
    var chon = (dsMuc || []).map(function (m) {
      return '<option value="' + tho(m) + '">' + tho(m) + '</option>';
    }).join('');

    hop.innerHTML =
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('title', 'Title')) + '</span>' +
          '<input type="text" name="title" autocomplete="off" maxlength="200"></label>' +
      '</div>' +

      '<div class="vb-hang">' +
        '<label class="vb-o"><span>' + tho(L('muc', 'Category')) + '</span>' +
          '<select name="muc">' + chon + '</select></label>' +
        '<label class="vb-o"><span>' + tho(L('date', 'Date')) + '</span>' +
          '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
        '<label class="vb-o"><span>' + tho(L('tags', 'Tags — separated by commas')) + '</span>' +
          '<input type="text" name="tags" autocomplete="off"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('summary', 'Summary')) + '</span>' +
          '<textarea name="summary" rows="1" maxlength="400"></textarea></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<div class="vb-o vb-o--rong"><span>' + tho(L('body', 'Post')) + '</span>' +
          '<div data-soan></div></div>' +
      '</div>' +
      '<p class="vb-duong"><span class="vb-duong-nhan">' + tho(L('willBe', 'Will live at')) +
        '</span> <code data-xem-duong>…</code></p>' +
      '<div class="vb-nut">' +
        '<label class="vb-nhap"><input type="checkbox" name="draft"> ' +
          tho(L('draft', 'Keep as draft — built but not public')) + '</label>' +
        (cu ? '<button type="button" class="vb-nho" data-ve>' +
                tho(L('back', 'Back')) + '</button>' : '') +
        '<button type="button" class="btn" data-dang>' +
          tho(cu ? L('save', 'Save') : L('publish', 'Post')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    if (cu) {
      hop.querySelector('[name=title]').value = cu.fm.title || '';
      hop.querySelector('[name=date]').value = cu.fm.date || '';
      hop.querySelector('[name=tags]').value = (cu.fm.tags || []).join(', ');
      hop.querySelector('[name=summary]').value = cu.fm.summary || '';
      hop.querySelector('[name=draft]').checked = cu.fm.draft === true;
      var oMuc = hop.querySelector('[name=muc]');
      var mucCu = cu.duong.split('/').slice(2, -1).join('/');
      if (oMuc) {
        if (mucCu && !oMuc.querySelector('option[value="' + mucCu + '"]')) {
          oMuc.insertAdjacentHTML('beforeend',
            '<option value="' + tho(mucCu) + '">' + tho(mucCu) + '</option>');
        }
        oMuc.value = mucCu;
        oMuc.disabled = true;
      }
      var bVe = hop.querySelector('[data-ve]');
      if (bVe) bVe.addEventListener('click', function () { dangSua = null; veBang(); });
    }

    var oSoan = hop.querySelector('[data-soan]');
    if (oSoan && window.ZIB && window.ZIB.soan) {
      soan = window.ZIB.soan.gan(oSoan, { nhan: N });

      if (cu && window.ZIB.soan.tuMD) {

        soan.datHTML(window.ZIB.soan.tuMD(cu.noiDung));
      } else {
        var nhap = soan.nhapCu();
        if (nhap && soan.rong()) {
          if (window.confirm(L('draftAsk', 'There is an unfinished post saved on this device. Open it?'))) {
            soan.datHTML(nhap);
          } else {
            soan.boNhap();
          }
        }
      }
    } else if (oSoan) {

      oSoan.innerHTML = '<textarea name="noiDung" rows="14"></textarea>';
    }

    hop.querySelector('[name=title]').addEventListener('input', xemDuong);
    hop.querySelector('[name=muc]').addEventListener('change', xemDuong);
    hop.querySelector('[name=date]').addEventListener('change', xemDuong);
    hop.querySelector('[data-dang]').addEventListener('click', gui);
    xemDuong();
  }

  function xemDuong() {
    var o = hop.querySelector('[data-xem-duong]');
    if (!o) return;
    var t = (hop.querySelector('[name=title]') || {}).value || '';
    var m = (hop.querySelector('[name=muc]') || {}).value || '';
    var s = slugify(t);
    o.textContent = s ? '/posts/' + (m ? m + '/' : '') + s + '/' : '…';
  }

  function gui() {
    var nut = hop.querySelector('[data-dang]');
    var oTho = hop.querySelector('[name=noiDung]');
    var b = {
      title  : hop.querySelector('[name=title]').value,
      muc    : hop.querySelector('[name=muc]').value,
      date   : hop.querySelector('[name=date]').value,
      tags   : hop.querySelector('[name=tags]').value,
      summary: hop.querySelector('[name=summary]').value,
      noiDung: soan ? soan.layMD() : (oTho ? oTho.value : ''),
      draft  : hop.querySelector('[name=draft]').checked
    };
    if (!b.title.trim() || !b.noiDung.trim()) {
      noi(L('needBoth', 'Both a title and some text are needed.'), 'hong');
      return;
    }

    nut.disabled = true;
    noi(L('sending', 'Sending…'));

    if (dangSua) {
      b.duong = dangSua.duong;
      b.sha = dangSua.sha;
      b.khoaKhac = dangSua.khoaKhac;
      b.cover = dangSua.fm.cover;
      b.coverAlt = dangSua.fm.coverAlt;
      b.hidden = dangSua.fm.hidden === true;
    }

    fetch(api, {
      method: dangSua ? 'PUT' : 'POST',
      headers: K.dau({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(b)
    }).then(function (r) {
      return r.json().then(function (d) { return { ma: r.status, d: d }; });
    }).then(function (kq) {
      nut.disabled = false;
      if (kq.d && kq.d.ok) {
        if (dangSua) {

          dangSua.sha = kq.d.sha || dangSua.sha;
          bangDS = null;
          noi(L('saved', 'Saved. Cloudflare is rebuilding.'));
          return;
        }
        xong(kq.d, b);
        return;
      }
      noi(loiChu(kq.d), 'hong');
    }).catch(function () {
      nut.disabled = false;
      noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
    });
  }

  function loiChu(d) {
    if (!d) return L('failed', 'Could not publish.');
    if (d.loi === 'khoa') return L('badKey', 'Wrong owner ID or key.');
    if (d.loi === 'cauhinh') {

      return d.chiTiet
          || L('noConfig', 'The server is missing') + ' ' + (d.thieu || []).join(', ')
           + ' — ' + L('seeDoc', 'xem docs/CAI-DAT.md');
    }
    if (d.loi === 'kiem') return (d.chiTiet || []).join(' · ');
    if (d.loi === 'lechban') return L('clash',
      'This post changed somewhere else. Go back and reopen it to get the latest version.');
    if (d.loi === 'duong' || d.loi === 'sha') return L('failed', 'Could not save.');
    if (d.loi === 'trung') return d.chiTiet || L('dup', 'A post with that name already exists.');
    if (d.loi === 'muc') return d.chiTiet || L('badMuc', 'No such category.');
    return d.chiTiet || L('failed', 'Could not publish.');
  }

  function xong(d, b) {

    if (soan) soan.boNhap();
    soan = null;
    hop.innerHTML =
      '<div class="vb-xong">' +
        '<p class="vb-xong-de">' + tho(L('done', 'Pushed to the repository')) + '</p>' +
        '<p class="vb-xong-chu">' + tho(b.title) + '</p>' +
        '<ul class="vb-xong-ds">' +
          '<li>' + tho(L('willBe', 'Will live at')) + ' <code>' + tho(d.duongBai) + '</code></li>' +
          (d.commit ? '<li><a href="' + tho(d.commit) + '" target="_blank" rel="noopener">' +
            tho(L('seeCommit', 'See the commit on GitHub')) + '</a></li>' : '') +
        '</ul>' +
        '<p class="vb-noi">' + tho(d.nhac || L('building',
          'Cloudflare is rebuilding. The post goes live in about a minute.')) + '</p>' +
        '<div class="vb-nut">' +
          '<button type="button" class="vb-nho" data-ve>' + tho(L('back', 'Back')) + '</button>' +
          '<button type="button" class="btn" data-nua>' +
            tho(L('another', 'Write another')) + '</button>' +
        '</div>' +
      '</div>';
    hop.querySelector('[data-nua]').addEventListener('click', function () { khungViet(); });

    hop.querySelector('[data-ve]').addEventListener('click', function () {
      bangDS = null; veBang();
    });
  }

  function nap() {
    if (!coKhoa()) { khungCho(); return; }
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>';
    fetch(api, { headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (kq.d && kq.d.ok) { dsMuc = kq.d.muc || []; dangSua = null; veBang(); return; }
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
      })

      .catch(function (e) {
        var laMang = (e instanceof TypeError) && /fetch|network|Load failed/i.test(String(e.message));
        if (!laMang && window.console) console.error('[viet-bai]', e);
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(laMang ? L('netErr', 'Network hiccup. Try again in a moment.')
                     : L('crash', 'The editor failed to load — open the browser console to see the error.')) +
          '</p>';
      });
  }

  nap();

  if (K) K.theoDoi(nap);
})();
