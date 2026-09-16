/* ============================================================
   BÀN DUYỆT — một khung gom mọi bình luận đang chờ, của CẢ BLOG.

   Mở bằng cách thêm `#duyet` vào địa chỉ BẤT KỲ trang nào có khai
   `data-duyet-api` (trang bài và /notes/). Nhờ vậy chỉ cần nhớ MỘT lối tắt:

       /notes/#viet      viết ghi chú
       /notes/#duyet     duyệt bình luận

   ── VÌ SAO TÁCH KHỎI comments.js ──────────────────────────────────────
   Bản trước để bàn duyệt sống trong `comments.js`, mà file ấy chỉ chạy ở trang
   bài — nên muốn duyệt thì phải mở một bài viết nào đó ra trước, và phải nhớ
   đường dẫn của đúng một bài cụ thể. Duyệt là việc của CHỦ TRANG, không dính
   gì tới một bài nào; nó không nên phải đi nhờ khối bình luận của bài khác mới
   có chỗ đứng.

   Tách ra rồi thì hai file cũng hết chồng việc: `comments.js` lo phần người
   đọc thấy, file này lo phần chỉ chủ trang thấy.

   ── ĐÂY KHÔNG PHẢI LỚP BẢO MẬT ────────────────────────────────────────
   `#duyet` chỉ là chỗ cất cho khuất mắt — một cái nút "Duyệt bình luận" bày
   giữa trang thì mọi người đọc đều thấy một thứ họ bấm vào cũng chẳng để làm
   gì. Lớp bảo mật là hai vế khoá ở phía máy chủ; ai gõ đúng `#duyet` cũng chỉ
   thấy một cái ô xin khoá.
   ============================================================ */
(function () {
  'use strict';

  var API = document.documentElement.getAttribute('data-duyet-api');
  if (!API) return;

  var N = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-duyet-nhan') || '{}'); }
  catch (e) {}
  function L(k) { return String(N[k] || k); }

  /* Khoá dùng CHUNG với ô viết ghi chú: nhập ở một chỗ là mở được cả hai. */
  var K_ID = 'zib-gc-id', K_KEY = 'zib-gc-key';
  function doc(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function coKhoa() { return !!(doc(K_ID) && doc(K_KEY)); }
  function dauKhoa(them) {
    var h = them || {};
    h['x-gc-id'] = doc(K_ID); h['x-gc-key'] = doc(K_KEY);
    return h;
  }

  var hop = null;
  var dongHo = null;
  var dangXin = false;

  /* ══════════ DỰNG KHUNG ══════════ */

  /* ── HAI KIỂU MỌC ──
     MỘT — trang /z-admin/ có sẵn một ô `[data-duyet-host]`. Cắm thẳng vào
     đó, không cần dấu thăng, không cuộn đi đâu cả: người ta vào trang ấy chính
     là để làm việc này.
     HAI — mọi trang khác thì phải gõ `#duyet`, và lúc ấy khối tự chèn lên đầu
     rồi cuộn tới. */
  function oCamSan() { return document.querySelector('[data-duyet-host]'); }

  function mo(tuDong) {
    if (hop) return;
    hop = document.createElement('section');
    hop.className = 'bl-duyet';

    var o = oCamSan();
    if (o) {
      o.appendChild(hop);
      ve();
      return;
    }

    /* Chèn ngay sau đầu trang, KHÔNG phải cuối trang: đây là việc đang làm,
       không phải phần đọc thêm. */
    hop.classList.add('duyet-noi');
    var neo = document.querySelector('.post-layout') ||
              document.querySelector('main .container') ||
              document.querySelector('main');
    if (!neo) { hop = null; return; }
    neo.insertBefore(hop, neo.firstChild);

    ve();
    if (!tuDong) denNoi();
  }

  /* Cuộn tới — `#duyet` không phải id của phần tử nào nên trình duyệt không tự
     đưa tới. Và phải NHẢY THẲNG: trang khai `scroll-behavior:smooth` ở cấp cao
     nhất, nên cuộn mượt thành một hoạt hình dài mà ảnh tải xong giữa chừng làm
     trôi đích. Đợi `load` cho bố cục xong hẳn rồi mới tính vị trí. */
  function denNoi() {
    function toi() {
      var y = hop.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    }
    if (document.readyState === 'complete') toi();
    else window.addEventListener('load', toi, { once: true });
  }

  function ve() {
    if (!coKhoa()) { veKhoa(); return; }
    xin();
  }

  function de(chu) {
    var p = document.createElement('p');
    p.className = 'bl-duyet-de';
    p.textContent = chu;
    return p;
  }

  function veKhoa(loi) {
    hop.textContent = '';
    hop.appendChild(de(L('queue')));

    var hang = document.createElement('div');
    hang.className = 'bl-duyet-hang';
    var oId = document.createElement('input');
    oId.type = 'text'; oId.placeholder = L('keyId');
    oId.autocapitalize = 'off'; oId.spellcheck = false;
    var oKey = document.createElement('input');
    oKey.type = 'password'; oKey.placeholder = L('keySecret');
    var nut = document.createElement('button');
    nut.type = 'button'; nut.className = 'btn'; nut.textContent = L('keySave');
    function luu() {
      if (!oId.value.trim() || !oKey.value.trim()) return;
      try {
        localStorage.setItem(K_ID, oId.value.trim());
        localStorage.setItem(K_KEY, oKey.value.trim());
      } catch (e) {}
      ve();
    }
    nut.addEventListener('click', luu);
    oKey.addEventListener('keydown', function (e) { if (e.key === 'Enter') luu(); });
    hang.appendChild(oId); hang.appendChild(oKey); hang.appendChild(nut);
    hop.appendChild(hang);

    var bao = document.createElement('p');
    bao.className = 'bl-duyet-bao';
    if (loi) bao.classList.add('bl-duyet-bao--hong');
    bao.textContent = loi || '';
    hop.appendChild(bao);
    dungDongHo();
  }

  /* ══════════ XIN HÀNG CHỜ ══════════ */

  function xin(lang) {
    if (dangXin) return;
    dangXin = true;
    if (!lang) {
      hop.textContent = '';
      hop.appendChild(de(L('queue')));
      var b = document.createElement('p');
      b.className = 'bl-duyet-bao';
      b.textContent = L('loading');
      hop.appendChild(b);
    }
    fetch(API + '?cho=1', { cache: 'no-store', headers: dauKhoa() })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        dangXin = false;
        if (!kq.ok) { veKhoa(kq.loi || L('badKey')); return; }
        veHang(kq.ds || []);
      })
      .catch(function () {
        dangXin = false;
        if (!lang) veKhoa(L('netErr'));
      });
  }

  /* ── TỰ XIN LẠI ──
     Bàn duyệt hay bị mở rồi để đó. Không tự làm mới thì con số đứng im, và chủ
     trang tưởng không có gì mới trong khi hàng chờ đã dài ra.

     20 giây, và CHỈ khi tab đang hiện: tab nằm dưới thì không ai nhìn, gọi tiếp
     là đốt hạn ngạch để vẽ cho cái không ai xem. Trình duyệt quay lại tab thì
     xin ngay một lượt cho số liệu khớp lại. */
  function batDongHo() {
    dungDongHo();
    dongHo = setInterval(function () {
      if (!document.hidden && coKhoa()) xin(true);
    }, 20000);
  }
  function dungDongHo() { if (dongHo) { clearInterval(dongHo); dongHo = null; } }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && hop && coKhoa()) xin(true);
  });

  function veHang(ds) {
    var cho = ds.filter(function (c) { return !c.duyet; });
    hop.textContent = '';
    hop.appendChild(de(L('queue') + (cho.length ? ' (' + cho.length + ')' : '')));

    if (!ds.length) {
      var trong = document.createElement('p');
      trong.className = 'bl-duyet-bao';
      trong.textContent = L('queueEmpty');
      hop.appendChild(trong);
    }
    ds.forEach(function (c) { hop.appendChild(veDong(c)); });

    var quen = document.createElement('button');
    quen.type = 'button'; quen.className = 'bl-duyet-quen';
    quen.textContent = L('keyForget');
    quen.addEventListener('click', function () {
      try { localStorage.removeItem(K_ID); localStorage.removeItem(K_KEY); } catch (e) {}
      ve();
    });
    hop.appendChild(quen);
    batDongHo();
  }

  function veDong(c) {
    var d = document.createElement('div');
    d.className = 'bl-dong' + (c.duyet ? ' bl-dong--roi' : '');

    var dau = document.createElement('div');
    dau.className = 'bl-dong-dau';
    var ai = document.createElement('span');
    ai.className = 'bl-ten';
    ai.textContent = c.ten || L('anon');
    var o = document.createElement('a');
    o.className = 'bl-dong-trang';
    o.href = c.trang; o.textContent = c.trang;
    dau.appendChild(ai); dau.appendChild(o);

    var nd = document.createElement('p');
    nd.className = 'bl-nd';
    /* textContent, KHÔNG BAO GIỜ innerHTML — chữ này do người lạ gõ. Luật ấy
       đúng ở đây gấp đôi: "chỗ chỉ mình đọc" mới là chỗ kẻ gửi spam nhắm tới. */
    nd.textContent = c.chu;

    var nut = document.createElement('div');
    nut.className = 'bl-dong-nut';

    var bDuyet = document.createElement('button');
    bDuyet.type = 'button'; bDuyet.className = 'btn';
    bDuyet.textContent = c.duyet ? L('unapprove') : L('approve');
    bDuyet.addEventListener('click', function () {
      bDuyet.disabled = true;
      doi({ ma: c.ma, duyet: c.duyet ? 0 : 1 }, function () { xin(true); });
    });

    var bAn = document.createElement('button');
    bAn.type = 'button'; bAn.className = 'bl-dong-an';
    bAn.textContent = L('hide');
    bAn.addEventListener('click', function () {
      bAn.disabled = true;
      doi({ ma: c.ma, an: 1 }, function () { d.remove(); xin(true); });
    });

    nut.appendChild(bDuyet); nut.appendChild(bAn);
    d.appendChild(dau); d.appendChild(nd); d.appendChild(nut);
    return d;
  }

  function doi(than, xong) {
    fetch(API, {
      method: 'PATCH',
      headers: dauKhoa({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(than)
    }).then(function (r) { return r.json(); })
      .then(function (kq) { if (kq.ok) xong(); })
      .catch(function () {});
  }

  /* ══════════ CHẠY ══════════ */

  if (oCamSan()) mo(true);
  else if (location.hash === '#duyet') mo();
  window.addEventListener('hashchange', function () {
    if (location.hash === '#duyet') mo();
  });
})();
