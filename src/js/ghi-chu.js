/* ============================================================
   GHI CHÚ — lọc theo loại, và (nếu bật) đăng thẳng lên không cần dựng lại.

   Lọc ở TRÌNH DUYỆT chứ không dựng sẵn mỗi loại một trang: ghi chú là thứ
   ngắn và nhiều, dựng sẵn thì mỗi loại mới lại sinh thêm một thư mục. Và
   lọc tại chỗ thì bấm phát đổi ngay, không chờ mạng.

   Không có JavaScript: thấy ĐỦ mọi ghi chú DỰNG SẴN, không có hàng nút lọc,
   không có ghi chú đăng thẳng. Đó là trạng thái đúng — danh sách đầy đủ vẫn
   đọc được, chỉ là dài hơn và thiếu mấy dòng mới nhất.

   ── BA PHẦN, THEO ĐÚNG THỨ TỰ NÀY ──────────────────────────────────────
     1. lọc        luôn chạy, chỉ cần có sẵn ghi chú trong HTML
     2. xin thêm   gọi /api/ghi-chu, chèn ghi chú mới vào danh sách
     3. ô viết     chỉ dựng khi địa chỉ có #viet — xem phần CỬA SAU

   Phần 1 không được phép phụ thuộc phần 2: mạng hỏng thì lọc vẫn phải chạy.
   ============================================================ */
(function () {
  'use strict';

  var ds  = document.querySelector('.gc-ds');
  var loc = document.querySelector('[data-gc-loc]');
  var api = document.documentElement.getAttribute('data-gc-api');
  var N   = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-gc-nhan') || '{}'); }
  catch (e) {}

  /* ══════════ TIỆN ÍCH ══════════ */

  function tho(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;',
               '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── BỘ DỰNG CHỮ TÍ HON ──
     Ghi chú lấy từ mạng về là chữ THÔ; bộ dựng Markdown thật nằm ở
     tools/lib/markdown.mjs, chạy lúc build, không có ở đây. Chép nó sang
     đây là hai bộ dựng phải giữ cho giống nhau mãi mãi.

     Nên chỗ này cố ý làm ÍT: đoạn, **đậm**, *nghiêng*, `mã`, [chữ](link).
     Vừa đủ cho ba dòng ghi chú. Ghi chú kéo về Markdown rồi thì lần dựng kế
     tiếp nó đi qua bộ dựng thật và có đủ mọi thứ — cái thiếu ở đây chỉ thiếu
     trong quãng từ lúc gõ tới lần dựng ấy.

     THOÁT CHỮ TRƯỚC, dựng thẻ SAU. Ngược lại thì mấy thẻ vừa dựng bị thoát
     theo, mà chừa chúng ra thì phải dò — và dò thì sót. */
  function dungChu(chu) {
    return String(chu).trim().split(/\n{2,}/).map(function (doan, i) {
      var h = tho(doan).replace(/\n/g, '<br>');
      h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
      h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      /* Chỉ nhận http, https và đường dẫn nội bộ. Không lọc thì một dòng
         `[bấm đi](javascript:…)` thành nút chạy mã ngay trên trang. */
      h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
                    '<a href="$2">$1</a>');
      /* Đoạn ĐẦU mang class `lead`, đúng như bộ dựng thật làm với mọi ghi chú
         (xem `laSapo` trong tools/lib/markdown.mjs). Thiếu dòng này thì ghi chú
         vừa đăng nằm cạnh ghi chú dựng sẵn mà trông khác hẳn — không nghiêng,
         không có vạch dọc bên trái — và người đọc thấy hai kiểu ghi chú trong
         cùng một danh sách. */
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

  /* ══════════ 1 · LỌC ══════════ */

  var mon = [];
  var nut = [];

  function chon(loai) {
    for (var i = 0; i < mon.length; i++) {
      mon[i].hidden = !!loai && mon[i].getAttribute('data-loai') !== loai;
    }
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

  /* Gọi lại sau mỗi lần danh sách đổi. Đếm lại số của từng loại và dựng lại
     hàng nút — ghi chú mới có thể mang một loại chưa từng có nút nào. */
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
    /* Một loại thì bộ lọc là vô nghĩa — mọi nút đều ra cùng một danh sách. */
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
    /* Giữ nguyên loại đang chọn, trừ khi loại ấy vừa biến mất khỏi danh sách. */
    chon(dem[cu] ? cu : '');
  }

  /* ══════════ 2 · XIN GHI CHÚ MỚI VỀ ══════════ */

  /* Chèn theo NGÀY, mới nhất trước — đúng thứ tự mà build đã xếp. Nối đuôi
     vào cuối danh sách thì một ghi chú đề ngày cũ nhảy xuống dưới cùng. */
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
        /* Trang trống thì phần "chưa có ghi chú nào" phải biến đi, và danh
           sách <ol> chưa tồn tại — build chỉ dựng nó khi có ghi chú. */
        var trong = document.querySelector('.ds-trong');
        if (trong) trong.remove();
        for (var i = 0; i < d.ghiChu.length; i++) chen(d.ghiChu[i]);
        dungLoc();
        if (viet) viet.veLai();
      })
      /* Hỏng thì im lặng: danh sách dựng sẵn vẫn còn nguyên trên trang. */
      .catch(function () {});
  }

  /* ══════════ 3 · Ô VIẾT ══════════

     ── CỬA SAU LÀ #viet, KHÔNG PHẢI MỘT CÁI NÚT ──
     Ô viết chỉ dành cho một người. Để một cái nút "Viết ghi chú" lộ ra giữa
     trang thì mọi người đọc đều thấy một thứ họ bấm vào cũng chẳng để làm gì.
     `/notes/#viet` thì lưu được vào màn hình chính điện thoại, gõ một phát ra
     ngay — mà người đọc thường không bao giờ gặp.

     Đây KHÔNG phải lớp bảo mật. Lớp bảo mật là hai vế khoá ở phía máy chủ;
     ai gõ đúng #viet cũng chỉ thấy một cái ô xin khoá.

     Khoá giữ trong localStorage của MÁY NÀY. Máy khác, trình duyệt khác, chế
     độ ẩn danh — đều phải nhập lại. Đó là đúng: khoá không nên đi theo trang. */

  var viet = null;

  function dungOViet() {
    if (!api || (!ds && !document.querySelector('.ds-trong'))) return null;

    var K_ID = 'zib-gc-id', K_KEY = 'zib-gc-key';
    function doc(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
    function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function bo(k) { try { localStorage.removeItem(k); } catch (e) {} }

    var hop = document.createElement('section');
    hop.className = 'gc-viet';
    var neo = document.querySelector('.gc-loc') || ds || document.querySelector('.ds-trong');
    neo.parentNode.insertBefore(hop, neo);

    function khoa() { return { id: doc(K_ID), key: doc(K_KEY) }; }
    function coKhoa() { var k = khoa(); return !!(k.id && k.key); }

    function noi(chu, hong) {
      var o = hop.querySelector('.gc-noi');
      if (!o) return;
      o.textContent = chu || '';
      o.classList.toggle('gc-noi--hong', !!hong);
    }

    function veLai() {
      hop.innerHTML = coKhoa() ? khungViet() : khungKhoa();
      gan();
      ganXoa();
    }

    /* ── XOÁ ──
       Chỉ ghi chú đến từ mạng (`data-ma`) mới xoá được. Ghi chú dựng sẵn nằm
       trong `content/ghi-chu.md`: xoá nó là việc của bàn phím, không phải của
       một cái nút trên trang — và máy chủ cũng không có cách nào sửa file ấy.

       Nút chỉ mọc khi máy này có khoá. Không phải để giấu: người không có
       khoá bấm vào cũng chỉ nhận 401, nhưng bày ra một cái nút chắc chắn
       hỏng thì thà đừng bày. */
    function ganXoa() {
      var cac = document.querySelectorAll('.gc-mot[data-ma]');
      for (var i = 0; i < cac.length; i++) {
        var cu = cac[i].querySelector('.gc-xoa');
        if (!coKhoa()) { if (cu) cu.remove(); continue; }
        if (cu) continue;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gc-xoa';
        b.title = N.del || 'Xoá ghi chú';
        b.setAttribute('aria-label', N.del || 'Xoá ghi chú');
        b.textContent = '×';
        b.addEventListener('click', function () {
          var li = this.closest('.gc-mot');
          var k = khoa();
          this.disabled = true;
          fetch(api + '?ma=' + encodeURIComponent(li.getAttribute('data-ma')), {
            method: 'DELETE',
            headers: { 'x-gc-id': k.id, 'x-gc-key': k.key }
          }).then(function (r) {
            if (!r.ok) throw new Error('401');
            li.remove();
            dungLoc();
          }).catch(function () {
            noi(N.delFail || 'Không xoá được.', true);
          });
        });
        cac[i].querySelector('.gc-dau').appendChild(b);
      }
    }

    function khungKhoa() {
      return '<h2 class="gc-viet-de">' + tho(N.write || 'Viết ghi chú') + '</h2>' +
        '<div class="gc-hang">' +
          '<label class="gc-o"><span>' + tho(N.keyId || 'Mã chủ') + '</span>' +
            '<input type="text" name="id" autocomplete="off" autocapitalize="off" spellcheck="false"></label>' +
          '<label class="gc-o"><span>' + tho(N.keySecret || 'Khoá') + '</span>' +
            '<input type="password" name="key" autocomplete="off"></label>' +
        '</div>' +
        '<div class="gc-nut"><button type="button" class="btn" data-nho>' +
          tho(N.keySave || 'Nhớ khoá trên máy này') + '</button></div>' +
        '<p class="gc-noi"></p>';
    }

    function khungViet() {
      var homNay = new Date();
      var iso = new Date(homNay.getTime() - homNay.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 10);
      return '<h2 class="gc-viet-de">' + tho(N.write || 'Viết ghi chú') + '</h2>' +
        '<div class="gc-hang">' +
          '<label class="gc-o gc-o--ngay"><span>' + tho(N.date || 'Ngày') + '</span>' +
            '<input type="date" name="ngay" value="' + iso + '"></label>' +
          '<label class="gc-o"><span>' + tho(N.kind || 'Loại') + '</span>' +
            '<input type="text" name="loai" list="gc-loai-co" maxlength="24" ' +
              'autocapitalize="off" placeholder="sách · nhạc · ý"></label>' +
        '</div>' +
        '<datalist id="gc-loai-co">' + loaiDaCo() + '</datalist>' +
        '<label class="gc-o"><span>' + tho(N.body || 'Nội dung') + '</span>' +
          '<textarea name="chu" rows="5" maxlength="2000"></textarea></label>' +
        '<div class="gc-nut">' +
          '<button type="button" class="btn btn--chinh" data-dang>' +
            tho(N.post || 'Đăng') + '</button>' +
          '<button type="button" class="btn" data-quen>' +
            tho(N.keyForget || 'Quên khoá') + '</button>' +
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
      var bNho  = hop.querySelector('[data-nho]');
      var bDang = hop.querySelector('[data-dang]');
      var bQuen = hop.querySelector('[data-quen]');

      if (bNho) bNho.addEventListener('click', function () {
        var id  = (hop.querySelector('[name=id]').value || '').trim();
        var key = (hop.querySelector('[name=key]').value || '').trim();
        if (!id || !key) { noi(N.keyMissing || 'Nhập đủ hai ô.', true); return; }
        ghi(K_ID, id); ghi(K_KEY, key);
        veLai();
      });

      if (bQuen) bQuen.addEventListener('click', function () {
        bo(K_ID); bo(K_KEY); veLai();
      });

      if (bDang) bDang.addEventListener('click', function () {
        var chu = (hop.querySelector('[name=chu]').value || '').trim();
        if (!chu) { noi(N.bodyMissing || 'Chưa có chữ nào.', true); return; }
        var g = {
          /* Mã sinh ở đây chứ không ở máy chủ: bấm Đăng mà mạng chập, gửi lại
             lần nữa thì cùng một mã ⇒ máy chủ ghi đè, không đẻ ra bản trùng. */
          ma  : 'gc' + Date.now().toString(36) +
                Math.random().toString(36).slice(2, 8),
          ngay: hop.querySelector('[name=ngay]').value,
          loai: (hop.querySelector('[name=loai]').value || '').trim(),
          chu : chu
        };
        var k = khoa();
        bDang.disabled = true;
        noi(N.posting || 'Đang gửi…');
        fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
                     'x-gc-id': k.id, 'x-gc-key': k.key },
          body: JSON.stringify(g)
        }).then(function (r) {
          return r.json().catch(function () { return {}; })
            .then(function (d) { return { ok: r.ok, d: d }; });
        }).then(function (kq) {
          bDang.disabled = false;
          if (!kq.ok) { noi((kq.d && kq.d.loi) || (N.postFail || 'Không gửi được.'), true); return; }
          var trong = document.querySelector('.ds-trong');
          if (trong) { trong.remove(); lamOl(); }
          chen(kq.d);
          dungLoc();
          hop.querySelector('[name=chu]').value = '';
          noi(N.posted || 'Xong.');
        }).catch(function () {
          bDang.disabled = false;
          noi(N.postFail || 'Không gửi được.', true);
        });
      });
    }

    /* Trang chưa có ghi chú nào thì build không dựng <ol> — phải tự dựng, nếu
       không ghi chú đầu tiên không có chỗ nào để đứng. */
    function lamOl() {
      if (ds) return;
      ds = document.createElement('ol');
      ds.className = 'gc-ds';
      hop.parentNode.insertBefore(ds, hop.nextSibling);
    }

    lamOl();
    veLai();

    /* Cuộn tới — lý do đầy đủ ở src/js/comments.js, cùng hai cái bẫy. */
    function denNoi() {
      var y = hop.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    }
    if (document.readyState === 'complete') denNoi();
    else window.addEventListener('load', denNoi, { once: true });

    return { veLai: veLai };
  }

  /* ══════════ CHẠY ══════════ */

  dungLoc();
  if (location.hash === '#viet') viet = dungOViet();
  window.addEventListener('hashchange', function () {
    if (location.hash === '#viet' && !viet) viet = dungOViet();
  });
  xinVe();
})();
