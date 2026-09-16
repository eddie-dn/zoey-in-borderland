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
     3. ô viết     CHỈ dựng ở /z-admin/, nơi có sẵn chỗ cắm

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
    /* Giấu bằng CLASS chứ không bằng `hidden`. Bộ chia trang cũng dùng
       `hidden`, nên hai bên cùng giành một thuộc tính: lọc xong thì mấy mục
       trang-so vừa giấu lại bật ra, và ngược lại. Mỗi bên một cách giấu thì ai
       giấu cái gì vẫn còn nguyên. */
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
    /* Không có chỗ để chèn thì cũng không việc gì phải hỏi — /z-admin/ thôi
       dựng danh sách nên nó thôi luôn cả lượt gọi này. */
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

     ── ĐÃ BỎ: CỬA SAU `#viet` ──
     Đời trước ô viết mọc ra ở bất kỳ trang nào có danh sách ghi chú khi địa
     chỉ mang `#viet`, và lúc chưa có khoá thì nó bày một khung XIN KHOÁ chen
     thẳng vào giữa trang người đọc đang xem.

     Bỏ vì ba lẽ, và lẽ thứ ba mới là lẽ chính:
       · nay đã có `/z-admin/` — một trang thật, lưu được vào màn hình chính,
         không phải học thuộc một chuỗi dấu thăng;
       · hai cửa cho cùng một việc thì có ngày một cửa được sửa còn cửa kia
         không, và cửa bị quên là cửa còn mở;
       · một ô xin mật khẩu chèn giữa trang đọc là đúng hình dạng của một trò
         lừa — và nó nằm ngay trên tên miền thật, nên nó dạy người đọc một
         thói quen rất xấu.

     `/notes/` nay chỉ còn LỌC và XIN GHI CHÚ MỚI — hai việc của người đọc. */

  var viet = null;

  /* Trang /z-admin/ dành sẵn một ô `[data-viet-host]`. Có nó thì ô viết cắm
     thẳng vào đó và không cần `#viet`, không cuộn đi đâu — vào trang ấy chính
     là để viết. Không có thì giữ nguyên nếp cũ ở /notes/. */
  function oVietCamSan() { return document.querySelector('[data-viet-host]'); }

  function dungOViet(tuDong) {
    if (!api) return null;
    if (!oVietCamSan() && !ds && !document.querySelector('.ds-trong')) return null;

    /* Khoá nay do src/js/khoa.js giữ — file này không đọc localStorage nữa.
       Trước đây nó tự đọc tự ghi, và đó chính là chỗ sinh ra chuyện "đăng
       xuất ở ngăn này mà ngăn kia vẫn mở": mỗi file một bản sao của cùng một
       trạng thái thì không bản nào biết bản kia vừa đổi. */
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

    /* Ô viết chỉ sống ở /z-admin/, và trang ấy đã có cửa đăng nhập riêng ở
       đầu trang — chưa vào được thì cả khối này còn chẳng được dựng. Nên ở
       đây chỉ còn hai trạng thái, và trạng thái "chưa có khoá" chỉ là lưới an
       toàn cho lúc khoá bị gỡ ở một tab khác. */
    function veLai() {
      hop.hidden = !coKhoa();
      hop.innerHTML = coKhoa() ? khungViet() : '';
      if (coKhoa()) gan();
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

    /* Chỗ cắm sẵn ở /z-admin/ đã có tiêu đề ngăn ("Viết ghi chú") in ngay
       trên nó, nên một tiêu đề thứ hai bên trong khung là chữ lặp — hai dòng
       giống hệt nhau cách nhau hai chục pixel. Chỉ /notes/ mới cần nó, vì ở
       đó khung này chen vào giữa một trang đang đọc và phải tự giới thiệu. */
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
          /* Chỗ trống cho nút Đăng xuất. Ở /z-admin/ nút ấy đã nằm ở cột
             trái nên chỗ này để rỗng; chỉ /notes/#viet mới cần một lối ra
             ngay tại đây. */
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

      /* Nút Đăng xuất chỉ mọc ở /notes/ — ở /z-admin/ nó đã có chỗ riêng. */
      if (oRa && K && !oVietCamSan()) K.veChao(oRa, '');

      if (bDang) bDang.addEventListener('click', function () {
        var chu = (hop.querySelector('[name=chu]').value || '').trim();
        if (!chu) { noi(N.bodyMissing || 'Nothing written yet.', true); return; }
        var g = {
          /* Mã sinh ở đây chứ không ở máy chủ: bấm Đăng mà mạng chập, gửi lại
             lần nữa thì cùng một mã ⇒ máy chủ ghi đè, không đẻ ra bản trùng. */
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

    /* Trang chưa có ghi chú nào thì build không dựng <ol> — phải tự dựng, nếu
       không ghi chú đầu tiên không có chỗ nào để đứng. */
    function lamOl() {
      if (ds) return;
      ds = document.createElement('ol');
      ds.className = 'gc-ds';
      hop.parentNode.insertBefore(ds, hop.nextSibling);
    }

    /* ── Ở /z-admin/ KHÔNG DỰNG DANH SÁCH ──
       Ngăn Note của bàn làm việc là chỗ VIẾT. Bản trước nó tự dựng thêm một
       thẻ <ol> rỗng rồi đổ toàn bộ ghi chú vào đấy, nên đăng xong là dưới ô
       viết mọc ra một khối dài — và khối ấy chẳng để làm gì: nó chỉ chép lại
       thứ /notes/ đã bày đầy đủ hơn.

       Sửa và xoá ghi chú nay làm ngay tại /notes/ khi đã đăng nhập, đúng chỗ
       nhìn thấy nó trong ngữ cảnh của nó. */
    if (!oVietCamSan()) lamOl();
    veLai();

    /* Cuộn tới — lý do đầy đủ ở src/js/comments.js, cùng hai cái bẫy. Cắm vào
       chỗ dành sẵn thì thôi, vì nó đã nằm ngay đầu trang rồi. */
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

  /* ══════════ CHẠY ══════════ */

  dungLoc();
  if (oVietCamSan()) viet = dungOViet(true);

  /* Khoá đổi ở BẤT KỲ đâu — cửa chung ở /z-admin/, nút Đăng xuất ngay trong
     ô này, hay một tab khác — thì ô viết vẽ lại theo. Đây là nửa còn lại của
     lời hứa "đăng xuất một lần, ra khỏi cả ba chỗ": khoa.js lo phần báo tin,
     mỗi ngăn lo phần tự dọn mình. */
  if (window.ZIB && window.ZIB.khoa) {
    window.ZIB.khoa.theoDoi(function () { if (viet) viet.veLai(); });
  }
  xinVe();
})();
