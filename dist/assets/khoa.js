(function () {
  'use strict';

  var K_ID = 'zib-gc-id', K_KEY = 'zib-gc-key';
  var goc = document.documentElement;

  var N = {};
  try { N = JSON.parse(goc.getAttribute('data-khoa-nhan') || '{}'); } catch (e) {}
  function L(k, m) { return N[k] || m; }

  function doc(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function bo(k)     { try { localStorage.removeItem(k); } catch (e) {} }

  function lay() { return { id: doc(K_ID), key: doc(K_KEY) }; }
  function co()  { var k = lay(); return !!(k.id && k.key); }

  function dau(them) {
    var h = them || {}, k = lay();
    h['x-gc-id'] = k.id; h['x-gc-key'] = k.key;
    return h;
  }

  function bao() {
    document.dispatchEvent(new CustomEvent('zib:khoa', { detail: { co: co() } }));
  }

  function dat(id, key) { ghi(K_ID, id); ghi(K_KEY, key); bao(); }
  function xoa()        { bo(K_ID); bo(K_KEY); bao(); }

  function theoDoi(fn) {
    document.addEventListener('zib:khoa', function (e) { fn(!!(e.detail && e.detail.co)); });
  }

  window.addEventListener('storage', function (e) {
    if (e.key === K_ID || e.key === K_KEY) bao();
  });

  function duongThu() {
    var bai = goc.getAttribute('data-bai-api');
    if (bai) return bai;
    var duyet = goc.getAttribute('data-duyet-api');
    if (duyet) return duyet + '?cho=1';
    return '';
  }

  function thu(id, key) {
    var duong = duongThu();
    if (!duong) return Promise.resolve({ ok: true });

    return fetch(duong, {
      cache: 'no-store',
      headers: { 'x-gc-id': id, 'x-gc-key': key }
    }).then(function (r) {
      return r.json().catch(function () { return {}; })
        .then(function (d) { return { ma: r.status, d: d || {} }; });
    }).then(function (kq) {
      if (kq.ma === 200 && kq.d.ok !== false) return { ok: true };

      if (kq.d.loi === 'cauhinh' && kq.d.chiTiet) {
        return { ok: false, chu: String(kq.d.chiTiet) };
      }
      if (kq.ma === 401) return { ok: false, chu: '' };

      return { ok: false, chu: L('failed', 'The server did not accept it.') };
    }).catch(function () {
      return { ok: false, chu: L('netErr', 'Network hiccup. Try again in a moment.') };
    });
  }

  function veCong(hop, xong) {

    hop.textContent = '';
    var khung = document.createElement('div');
    khung.className = 'kh-cong';
    hop.appendChild(khung);

    var de = document.createElement('p');
    de.className = 'kh-de';
    de.textContent = L('title', 'Sign in');
    khung.appendChild(de);

    var dan = document.createElement('p');
    dan.className = 'kh-dan';
    dan.textContent = L('lead', 'Sign in once — it covers notes, comments and posts.');
    khung.appendChild(dan);

    var hang = document.createElement('div');
    hang.className = 'kh-hang';

    function o(nhan, loai, ten) {
      var l = document.createElement('label');
      l.className = 'kh-o';
      var s = document.createElement('span');
      s.textContent = nhan;
      var i = document.createElement('input');
      i.type = loai; i.name = ten;
      i.autocomplete = loai === 'password' ? 'current-password' : 'username';
      i.autocapitalize = 'off'; i.spellcheck = false;
      l.appendChild(s); l.appendChild(i);
      hang.appendChild(l);
      return i;
    }

    var oId  = o(L('keyId', 'Owner ID'), 'text', 'gc-id');
    var oKey = o(L('keySecret', 'Key'), 'password', 'gc-key');
    khung.appendChild(hang);

    var nut = document.createElement('button');
    nut.type = 'button';
    nut.className = 'btn btn--chinh';
    nut.textContent = L('signIn', 'Sign in');

    var hangNut = document.createElement('div');
    hangNut.className = 'kh-nut';
    hangNut.appendChild(nut);
    khung.appendChild(hangNut);

    var bao2 = document.createElement('p');
    bao2.className = 'kh-bao';
    khung.appendChild(bao2);

    function noi(chu, hong) {
      bao2.textContent = chu || '';
      bao2.classList.toggle('kh-bao--hong', !!hong);
    }

    function gui() {
      var id = (oId.value || '').trim();
      var key = (oKey.value || '').trim();
      if (!id || !key) { noi(L('needBoth', 'Fill in both fields.'), true); return; }
      nut.disabled = true;
      noi(L('checking', 'Checking…'));
      thu(id, key).then(function (kq) {
        nut.disabled = false;
        if (!kq.ok) {
          noi(kq.chu, !!kq.chu);

          oKey.value = '';
          oKey.focus();
          return;
        }

        dat(id, key);
        noi('');
        if (xong) xong();
      });
    }

    nut.addEventListener('click', gui);
    [oId, oKey].forEach(function (i) {
      i.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); gui(); }
      });
    });

    return { tap: function () { oId.focus(); }, noi: noi };
  }

  function veChao(hop, ten) {
    hop.textContent = '';
    var chu = document.createElement('span');
    chu.textContent = (L('hello', 'Haluuu, {ten}!')).replace('{ten}', ten || '');
    hop.appendChild(chu);
    hop.appendChild(document.createTextNode(' \u2014 '));

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kh-ra';
    b.textContent = L('signOut', 'Sign out');
    b.addEventListener('click', function () { xoa(); });
    hop.appendChild(b);
    return b;
  }

  window.ZIB = window.ZIB || {};
  window.ZIB.khoa = {
    co: co, lay: lay, dau: dau, dat: dat, xoa: xoa,
    theoDoi: theoDoi, thu: thu, veCong: veCong, veChao: veChao
  };
})();
