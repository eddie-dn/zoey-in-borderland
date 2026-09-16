(function () {
  'use strict';

  var khoi = document.querySelector('[data-binh-luan]');
  if (!khoi) return;

  var API   = khoi.dataset.binhLuan || '';
  var TRANG = khoi.dataset.trang || location.pathname;
  var dsEl  = khoi.querySelector('.bl-ds');
  var form  = khoi.querySelector('.bl-form');
  var bao   = khoi.querySelector('.bl-bao');
  var than  = khoi.querySelector('.bl-than');

  function tim1(sel) { return khoi.querySelector(sel) || document.querySelector(sel); }

  var demEl = document.querySelector('[data-bl-so]');
  var demChu = demEl ? demEl.querySelector('.bl-so-chu') : null;
  var nutMo = tim1('.bl-mo');
  var moLuc = Date.now();

  var N = {};
  try { N = JSON.parse(khoi.dataset.nhan || '{}'); } catch (e) {}
  function L(k, n) { return String(N[k] || '').replace('{n}', n); }

  var nhaCuaForm = form.parentNode;
  var traLoiCho = '';

  function kho() { return (window.ZIB || {}).khoa; }
  function coKhoa() { var k = kho(); return !!(k && k.co()); }
  function dauKhoa(them) {
    var h = them || {};
    return coKhoa() ? kho().dau(h) : h;
  }

  function noi(t, loai) {
    bao.textContent = t || '';
    bao.className = 'bl-bao' + (loai ? ' bl-bao--' + loai : '');
  }

  var tim = tim1('.bl-tim');
  if (tim) (function () {
    var api = tim.getAttribute('data-thich');

    var soEl = document.querySelector('[data-thich-so]');
    var soChu = soEl ? soEl.querySelector('.thich-so') : null;
    var KHO = 'zib-thich:' + TRANG;
    var daBam = false;
    try { daBam = localStorage.getItem(KHO) === '1'; } catch (e) {}
    var so = 0, dangGui = false;

    function ve() {
      tim.setAttribute('aria-pressed', daBam ? 'true' : 'false');
      tim.classList.toggle('bl-tim--bam', daBam);
      if (soEl) {

        soEl.hidden = so <= 0;
        soEl.classList.toggle('thich--bam', daBam);
        if (soChu) soChu.textContent = so > 0 ? String(so) : '';
      }
    }

    fetch(api + '?u=' + encodeURIComponent(TRANG), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.tat) { tim.remove(); return; }
        so = d.so || 0; ve();
      })
      .catch(function () { tim.remove(); });

    tim.addEventListener('click', function () {
      if (dangGui) return;
      dangGui = true;
      var truoc = daBam, truocSo = so;
      daBam = !daBam;
      so = Math.max(0, so + (daBam ? 1 : -1));
      ve();
      try { if (daBam) localStorage.setItem(KHO, '1'); else localStorage.removeItem(KHO); } catch (e) {}

      fetch(api + '?u=' + encodeURIComponent(TRANG) + (daBam ? '' : '&bo=1'),
            { method: 'POST', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          dangGui = false;
          if (d && typeof d.so === 'number') { so = d.so; ve(); }
        })
        .catch(function () {

          dangGui = false;
          daBam = truoc; so = truocSo; ve();
          try { if (daBam) localStorage.setItem(KHO, '1'); else localStorage.removeItem(KHO); } catch (e) {}
        });
    });
  })();

  if (nutMo && than) {
    var ben  = document.querySelector('.ben');
    var luoi = document.querySelector('.post-layout');

    var rong = window.matchMedia('(min-width:1080px)');
    var duocDoi = !!(ben && luoi && luoi.classList.contains('khung-a'));
    var moc = null;

    function doiCho(vaoBen) {
      if (!duocDoi) return;
      if (vaoBen) {
        if (moc) return;
        moc = document.createComment('bl-than');
        than.parentNode.insertBefore(moc, than);
        ben.appendChild(than);
        ben.classList.add('ben--bl');
        luoi.classList.add('khung-a--bl');
      } else {
        if (!moc) return;
        moc.parentNode.insertBefore(than, moc);
        moc.remove(); moc = null;
        ben.classList.remove('ben--bl');
        luoi.classList.remove('khung-a--bl');
      }
    }

    var nutDong = than.querySelector('.bl-dong');
    if (nutDong) nutDong.addEventListener('click', function () { nutMo.click(); });

    nutMo.addEventListener('click', function () {
      var dangMo = nutMo.getAttribute('aria-expanded') === 'true';
      nutMo.setAttribute('aria-expanded', dangMo ? 'false' : 'true');

      than.hidden = dangMo;
      doiCho(!dangMo && rong.matches);

      if (!dangMo && !(duocDoi && rong.matches)) {
        than.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      if (dangMo) nutMo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    var theoNgang = function () {
      if (than.hidden) return;
      doiCho(rong.matches);
    };
    (rong.addEventListener ? rong.addEventListener('change', theoNgang)
                           : rong.addListener(theoNgang));
  }

  if (!API) {
    form.hidden = true;
    noi(L('notLinked'), 'cho');
    return;
  }

  function tai() {
    fetch(API + '?url=' + encodeURIComponent(TRANG),
          { cache: 'no-store', headers: dauKhoa() })
      .then(function (r) { return r.json(); })
      .then(function (kq) { if (kq.ok && kq.ds) ve(kq.ds); })
      .catch(function () {

      });
  }

  function ngay(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }

  function dungCay(ds) {
    var theoMa = {}, goc = [];
    ds.forEach(function (c) { c.con = []; theoMa[c.ma] = c; });
    ds.forEach(function (c) {
      var cha = c.cha && theoMa[c.cha];
      if (!cha) { goc.push(c); return; }

      var soLan = 0;
      while (cha.cha && theoMa[cha.cha] && soLan++ < 50) cha = theoMa[cha.cha];
      cha.con.push(c);
    });
    return goc;
  }

  function ve(ds) {
    dsEl.textContent = '';
    if (demEl) {

      demEl.hidden = ds.length === 0;
      if (demChu) demChu.textContent = ds.length ? String(ds.length) : '';
    }
    if (!ds.length) {
      var trong = document.createElement('li');
      trong.className = 'bl-trong';
      trong.textContent = L('noComments');
      dsEl.appendChild(trong);
      return;
    }
    dungCay(ds).forEach(function (c) { dsEl.appendChild(veMot(c, false)); });
  }

  function veMot(c, laCon) {
    var li = document.createElement('li');
    li.className = 'bl-item' + (laCon ? ' bl-item--con' : ' card');
    if (c.chu) li.className += ' bl-item--chu';

    var dau = document.createElement('div');
    dau.className = 'bl-dau';

    var ten = document.createElement('span');
    ten.className = 'bl-ten';
    ten.textContent = c.ten || L('anon');
    dau.appendChild(ten);

    if (c.chu) {
      var hh = document.createElement('span');
      hh.className = 'bl-hh';
      hh.textContent = L('author');
      dau.appendChild(hh);
    }

    var luc = document.createElement('time');
    luc.className = 'bl-luc';
    luc.textContent = ngay(c.luc);
    if (c.luc) luc.dateTime = c.luc;
    dau.appendChild(luc);

    var nd = document.createElement('p');
    nd.className = 'bl-nd';
    nd.textContent = c.noiDung;

    li.appendChild(dau);
    li.appendChild(nd);

    if (!laCon) {
      var nutTra = document.createElement('button');
      nutTra.type = 'button';
      nutTra.className = 'bl-tra';
      nutTra.textContent = L('reply');
      nutTra.addEventListener('click', function () { denTraLoi(c, li); });
      li.appendChild(nutTra);
    }

    if (c.con && c.con.length) li.appendChild(veCon(c.con));
    nutChuTrang(c, li);
    return li;
  }

  function veCon(con) {
    var hopNhanh = document.createElement('div');
    hopNhanh.className = 'bl-nhanh';

    var ul = document.createElement('ul');
    ul.className = 'bl-ds bl-ds--con';

    var GAP_TU = 2;
    var an = con.length > GAP_TU ? con.slice(0, con.length - GAP_TU) : [];
    var hien = con.slice(an.length);

    if (an.length) {
      var nut = document.createElement('button');
      nut.type = 'button';
      nut.className = 'bl-them';
      nut.textContent = L('moreReplies', an.length);
      nut.addEventListener('click', function () {

        an.forEach(function (x, i) {
          ul.insertBefore(veMot(x, true), ul.children[i] || null);
        });
        nut.remove();
      });
      hopNhanh.appendChild(nut);
    }

    hien.forEach(function (x) { ul.appendChild(veMot(x, true)); });
    hopNhanh.appendChild(ul);
    return hopNhanh;
  }

  var chip = null;

  function denTraLoi(c, li) {
    traLoiCho = c.ma;
    li.appendChild(form);
    if (!chip) {
      chip = document.createElement('p');
      chip.className = 'bl-chip';
      var chu = document.createElement('span');
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'bl-chip-x';
      x.setAttribute('aria-label', L('cancelReply'));
      x.textContent = '✕';
      x.addEventListener('click', veNha);
      chip.appendChild(chu); chip.appendChild(x);
      chip._chu = chu;
    }
    chip._chu.textContent = L('replyTo', c.ten || L('anon'));
    form.insertBefore(chip, form.firstChild);
    noi('');
    form.noiDung.focus();
  }

  function veNha() {
    traLoiCho = '';
    if (chip && chip.parentNode) chip.remove();
    nhaCuaForm.appendChild(form);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nut = form.querySelector('button[type="submit"]');
    var nd = form.noiDung.value.trim();

    if (nd.length < 2) { noi(L('tooShort'), 'loi'); form.noiDung.focus(); return; }

    nut.disabled = true;
    var chuCu = nut.textContent;
    nut.textContent = L('sending');
    noi('');

    fetch(API, {
      method: 'POST',
      headers: dauKhoa({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        url: TRANG,
        ten: form.ten.value,
        email: form.email.value,
        noiDung: nd,
        traLoiCho: traLoiCho,
        hp: form.hp.value,
        giay: Math.round((Date.now() - moLuc) / 1000)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        if (!kq.ok) { noi(kq.loi || L('failed'), 'loi'); return; }
        form.reset();
        veNha();

        noi(kq.duyet ? L('sentOwner') : L('sent'), 'ok');
        if (kq.duyet) tai();
      })
      .catch(function () {
        noi(L('netErr'), 'loi');
      })
      .finally(function () {
        nut.disabled = false;
        nut.textContent = chuCu;
      });
  });

  var o = form.noiDung, con = form.querySelector('.bl-con');
  if (o && con) {
    var MAX = Number(o.getAttribute('maxlength')) || 2000;
    o.addEventListener('input', function () {
      var du = MAX - o.value.length;
      con.textContent = du < MAX / 2 ? L('charsLeft', du) : '';
    });
  }

  function nutChuTrang(c, li) {
    if (!coKhoa()) return;

    var nhom = document.createElement('div');
    nhom.className = 'bl-quyen';

    function lam(than, xong) {
      fetch(API, {
        method: 'PATCH',
        headers: dauKhoa({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(than)
      }).then(function (r) { return r.json(); })
        .then(function (kq) { if (kq.ok) xong(); })
        .catch(function () {});
    }

    var bRut = document.createElement('button');
    bRut.type = 'button';
    bRut.className = 'bl-quyen-nut';
    bRut.textContent = L('unapprove');
    bRut.title = L('unapproveHint');
    bRut.addEventListener('click', function () {
      bRut.disabled = true;
      lam({ ma: c.ma, duyet: 0 }, function () { li.remove(); tai(); });
    });

    var bAn = document.createElement('button');
    bAn.type = 'button';
    bAn.className = 'bl-quyen-nut bl-quyen-nut--an';
    bAn.textContent = L('hide');
    bAn.title = L('hideHint');
    bAn.addEventListener('click', function () {
      bAn.disabled = true;
      lam({ ma: c.ma, an: 1 }, function () { li.remove(); tai(); });
    });

    nhom.appendChild(bRut);
    nhom.appendChild(bAn);
    li.appendChild(nhom);
  }

  tai();
})();
