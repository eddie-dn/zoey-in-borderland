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
    /* ── TRANG KHÔNG CÓ GHI CHÚ DỰNG SẴN VẪN PHẢI HỎI ──
       Bản trước dừng ngay khi không thấy `.gc-ds`. Mà build chỉ dựng `<ol>`
       khi file Markdown có ít nhất một khối — nên lúc file trống (ba khối ví
       dụ vừa xoá, ghi chú thật đều nằm trên D1), trang KHÔNG HỎI MÁY CHỦ, và
       /notes/ báo "chưa có ghi chú nào" trong khi D1 vẫn còn nguyên. Nhìn y
       như mọi ghi chú đã bị xoá.

       Nay chỉ cần trang có danh sách HOẶC có câu báo trống là hỏi; thiếu
       `<ol>` thì dựng nó ngay chỗ câu báo. */
    var trong0 = document.querySelector('.ds-trong');
    if (!api || (!ds && !trong0)) return Promise.resolve();
    return fetch(api, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.ghiChu || !d.ghiChu.length) return;
        var trong = document.querySelector('.ds-trong');
        if (trong) {
          if (!ds) {
            ds = document.createElement('ol');
            ds.className = 'gc-ds';
            trong.parentNode.insertBefore(ds, trong);
          }
          trong.remove();
        }
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
      o.classList.toggle('bao--hong', !!hong);
    }

    /* Ô viết chỉ sống ở /z-admin/, và trang ấy đã có cửa đăng nhập riêng ở
       đầu trang — chưa vào được thì cả khối này còn chẳng được dựng. Nên ở
       đây chỉ còn hai trạng thái, và trạng thái "chưa có khoá" chỉ là lưới an
       toàn cho lúc khoá bị gỡ ở một tab khác. */
    function veLai() {
      hop.hidden = !coKhoa() || (!!che && che.dang() !== 'viet');
      hop.innerHTML = coKhoa() ? khungViet() : '';
      if (coKhoa()) gan();
      if (ql) ql.veLai();
      if (che) che.veLai();
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
          '<button type="button" class="btn" data-dang>' +
            tho(N.post || 'Post') + '</button>' +
          /* Chỉ hiện khi đang SỬA một ghi chú đã đăng (bấm Edit ở danh sách
             bên dưới): khung viết mượn lại làm khung sửa, và đây là lối ra. */
          '<button type="button" class="ad-lenh" data-huy hidden>' +
            tho(N.cancel || 'Cancel') + '</button>' +
          /* Chỗ trống cho nút Đăng xuất. Ở /z-admin/ — chỗ DUY NHẤT ô viết
             mọc ra từ V1.8.8 — nút ấy đã nằm ở cột trái, nên chỗ này để rỗng.
             Giữ lại cái móc vì khoa.js vẫn tìm `[data-khoa-ra-nho]`, và vì
             một chỗ cắm khác không có cột trái thì cần một lối ra ngay đây. */
          '<span class="gc-ra" data-khoa-ra-nho></span>' +
        '</div>' +
        '<p class="bao gc-noi"></p>';
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

      var bHuy = hop.querySelector('[data-huy]');
      if (bHuy) bHuy.addEventListener('click', function () { thoiSua(); noi(''); });

      if (bDang) bDang.addEventListener('click', function () {
        var chu = (hop.querySelector('[name=chu]').value || '').trim();
        if (!chu) { noi(N.bodyMissing || 'Nothing written yet.', true); return; }
        if (dangSua) { luuSua(chu); return; }
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
          if (ql) ql.xin();
        }).catch(function () {
          bDang.disabled = false;
          noi(N.postFail || 'Could not send.', true);
        });
      });
    }

    /* ── SỬA MỘT GHI CHÚ ĐÃ ĐĂNG ──
       Không dựng khung sửa thứ hai: bấm Edit ở danh sách thì khung viết ngay
       phía trên nhận lấy ngày, loại và chữ của ghi chú ấy, nút Post đổi thành
       "Save edit" kèm số lượt sửa còn lại, và hiện thêm nút Cancel. Hai khung
       cùng hình cùng ô thì phải giữ cho giống nhau mãi; một khung hai vai thì
       không. */
    var dangSua = null;

    function batSua(g, con) {
      if (!coKhoa()) return;
      dangSua = g;
      hop.querySelector('[name=ngay]').value = g.ngay;
      hop.querySelector('[name=loai]').value = g.loai || '';
      hop.querySelector('[name=chu]').value = g.chu;
      hop.classList.add('gc-viet--sua');
      hop.querySelector('[data-dang]').textContent =
        (N.saveEdit || 'Save edit ({n} left)').replace('{n}', con);
      hop.querySelector('[data-huy]').hidden = false;
      noi('');
      if (che) che.doi('viet');
      hop.scrollIntoView({ block: 'start', behavior: 'smooth' });
      hop.querySelector('[name=chu]').focus({ preventScroll: true });
    }

    function thoiSua() {
      dangSua = null;
      hop.classList.remove('gc-viet--sua');
      var b = hop.querySelector('[data-dang]');
      if (!b) return;
      b.textContent = N.post || 'Post';
      hop.querySelector('[data-huy]').hidden = true;
      hop.querySelector('[name=chu]').value = '';
      hop.querySelector('[name=loai]').value = '';
      /* Ngày về lại hôm nay — không thì ghi chú mới đăng ngay sau đó mang
         ngày của ghi chú vừa sửa. */
      var nay = new Date();
      hop.querySelector('[name=ngay]').value =
        new Date(nay.getTime() - nay.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    function luuSua(chu) {
      var bDang = hop.querySelector('[data-dang]');
      bDang.disabled = true;
      noi(N.posting || 'Sending…');
      fetch(api, {
        method: 'PATCH',
        headers: K.dau({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ma: dangSua.ma, chu: chu,
          ngay: hop.querySelector('[name=ngay]').value,
          loai: (hop.querySelector('[name=loai]').value || '').trim()
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; })
          .then(function (d) { return { ok: r.ok, d: d }; });
      }).then(function (kq) {
        bDang.disabled = false;
        if (!kq.ok) {
          noi(kq.d && kq.d.loi === 'het-luot-sua'
                ? (N.noEdits || 'No edits left.')
                : ((kq.d && kq.d.loi) || N.postFail || 'Could not send.'), true);
          return;
        }
        thoiSua();
        noi(N.saved || 'Saved.');
        if (ql) ql.xin();
        /* Sửa xong thì về lại danh sách — sửa là việc bắt đầu TỪ danh sách
           (bấm Edit ở một hàng), nên xong việc thì trả người dùng về đó để
           thấy hàng vừa sửa. */
        if (che) che.doi('ds');
      }).catch(function () {
        bDang.disabled = false;
        noi(N.postFail || 'Could not send.', true);
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
    var che = oSan ? dungChe(oSan, hop, coKhoa) : null;
    var ql = oSan ? dungQL(oSan, K, {
      sua: function (g, con) { batSua(g, con); },
      dangSua: function () { return dangSua; },
      thoiSua: thoiSua,
      dem: function (n) { che.dem(n); },
      oLoc: che.oLoc
    }) : null;
    if (ql) che.ganDS(ql.el);
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

  /* ══════════ 3b · HAI MẶT CỦA NGĂN NOTE: WRITE · LIST ══════════

     Ô viết và danh sách chồng lên nhau thì danh sách bị đẩy xuống dưới một
     khung cao 400px: muốn xem lại ghi chú nào phải cuộn qua cả ô viết, và
     ngồi viết thì danh sách lấp ló ở mép dưới làm phân tâm. Mỗi lúc chỉ làm
     một việc, nên mỗi lúc chỉ bày một mặt.

     Nút chuyển là đúng cái nút Write · Split · Preview của khung soạn bài
     (`.sz-che` trong soan.css) — cùng một trang quản trị thì một kiểu nút
     chuyển mặt, không phải hai.

     Nhớ mặt đang mở trong localStorage: người hay vào để dọn ghi chú cũ thì
     lần sau mở ra là thấy ngay danh sách. Bấm Edit ở danh sách tự chuyển sang
     Write; Save edit xong tự về List. */
  function dungChe(oSan, oViet, coKhoa) {
    var oDS = null;
    var dang = 'viet';
    try { dang = localStorage.getItem('zib-gc-che') || 'viet'; } catch (e) {}
    if (dang !== 'viet' && dang !== 'ds') dang = 'viet';
    var soDem = null;

    var thanh = document.createElement('div');
    thanh.className = 'gc-che';
    var nhom = document.createElement('span');
    nhom.className = 'sz-che';
    nhom.setAttribute('role', 'group');
    var nut = {};
    [['viet', N.tabWrite || 'Write note'], ['ds', N.tabList || 'List notes']].forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sz-che-nut';
      b.setAttribute('data-che', x[0]);
      b.textContent = x[1];
      b.addEventListener('click', function () { doi(x[0]); });
      nut[x[0]] = b;
      nhom.appendChild(b);
    });
    thanh.appendChild(nhom);
    /* Chỗ cho hàng chip lọc của danh sách (All · Hidden · Trash), cùng hàng
       với nút chuyển, dạt phải — đúng dáng thanh công cụ của ngăn Post: nút
       việc bên trái, bộ lọc bên phải. Để chip ở một hàng riêng dưới nút
       chuyển thì mặt List mất trắng một hàng chỉ để đứng ba viên chip. */
    var oLoc = document.createElement('div');
    oLoc.className = 'ad-loc';
    thanh.appendChild(oLoc);
    oSan.insertBefore(thanh, oSan.firstChild);

    function ve() {
      var co = coKhoa();
      thanh.hidden = !co;
      oViet.hidden = !co || dang !== 'viet';
      if (oDS) oDS.hidden = !co || dang !== 'ds';
      oLoc.hidden = !co || dang !== 'ds';
      ['viet', 'ds'].forEach(function (k) {
        nut[k].classList.toggle('sz-che-nut--bat', dang === k);
        nut[k].setAttribute('aria-pressed', dang === k ? 'true' : 'false');
      });
      nut.ds.textContent = (N.tabList || 'List notes') + (soDem != null ? ' · ' + soDem : '');
    }

    function doi(moi) {
      dang = moi;
      try { localStorage.setItem('zib-gc-che', moi); } catch (e) {}
      ve();
    }

    ve();
    return {
      dang: function () { return dang; },
      doi: doi,
      dem: function (n) { soDem = n; ve(); },
      veLai: ve,
      oLoc: oLoc,
      ganDS: function (el) { oDS = el; ve(); }
    };
  }

  /* ══════════ 4 · DANH SÁCH GHI CHÚ Ở NGĂN NOTE ══════════

     Trước bản này ngăn Note chỉ có ô viết: đăng xong là thôi, không có chỗ
     nào để sửa một lỗi chính tả, cất tạm một ghi chú, hay xoá một cái đăng
     nhầm. Nay bên dưới ô viết là một bảng cùng khuôn `.ad-*` với ngăn Post:

       ngày | chữ (dòng dưới: loại · đã sửa mấy lần) | trạng thái | nút

     Ba bộ lọc: All (đang sống, gồm cả ghi chú ẩn) · Hidden · Trash.
       · Edit    — mượn khung viết phía trên; tối đa 3 lần (máy chủ đếm).
       · Hide    — rút khỏi /notes/ mà không xoá; Unhide là hiện lại.
       · Delete  — vào thùng rác; sau 30 ngày tự xoá cứng.
       · Trash   — Restore để cứu lại, Delete forever để xoá ngay.

     Chỉ ghi chú trên D1 có trong bảng này. Ghi chú đã kéo về
     `content/ghi-chu.md` sửa ở file — máy chủ không ghi được vào file ấy. */
  function dungQL(oSan, K, khung) {
    var HAN = 30, TRAN = 3;
    var loc = '';          /* '' | 'an' | 'rac' */
    var dsQL = [];
    var dangXin = false;

    var hop = document.createElement('section');
    hop.className = 'gc-ql';
    oSan.appendChild(hop);

    function coKhoa() { return !!(K && K.co()); }

    function xin() {
      if (!coKhoa() || dangXin) return;
      dangXin = true;
      fetch(api + '?ql=1', { cache: 'no-store', headers: K.dau() })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          dangXin = false;
          if (!d || !d.ok) { bao((d && (d.chiTiet || d.loi)) || N.loadFail || 'Could not load notes.'); return; }
          if (d.hanRac) HAN = d.hanRac;
          if (d.toiDaSua) TRAN = d.toiDaSua;
          dsQL = d.ghiChu || [];
          ve();
        })
        .catch(function () { dangXin = false; bao(N.loadFail || 'Could not load notes.'); });
    }

    function bao(chu) {
      hop.innerHTML = '<p class="bao bl-duyet-bao bao--hong">' + tho(chu) + '</p>';
    }

    function conNgay(g) {
      var t = Date.parse(g.xoaLuc || '');
      if (isNaN(t)) return HAN;
      return Math.max(0, Math.ceil(HAN - (Date.now() - t) / 864e5));
    }

    function ve() {
      var song = dsQL.filter(function (g) { return !g.xoa; });
      var an = song.filter(function (g) { return !!g.an; });
      var rac = dsQL.filter(function (g) { return !!g.xoa; });
      var hien = loc === 'rac' ? rac : loc === 'an' ? an : song;
      if (khung.dem) khung.dem(song.length);

      var loc0 = '';
      [['', N.all || 'All', song.length],
       ['an', N.hidden || 'Hidden', an.length],
       ['rac', N.trash || 'Trash', rac.length]].forEach(function (x) {
        loc0 += '<button type="button" class="chip' + (loc === x[0] ? ' chip--nay' : '') +
             (x[0] === 'rac' ? ' bl-chip-rac' : '') + '" data-loc="' + x[0] + '">' +
             tho(x[1]) + '<span class="chip-so">' + x[2] + '</span></button>';
      });
      khung.oLoc.innerHTML = loc0;
      var h = '';

      if (loc === 'rac') {
        h += '<p class="bl-rac-luat">' +
             tho((N.trashNote || 'Deleted items are removed for good {n} days after deletion.')
                 .replace('{n}', HAN)) + '</p>';
      }

      if (!hien.length) {
        h += '<p class="trong trong--cho vb-cho">' +
             tho(loc === 'rac' ? (N.trashEmpty || 'Trash is empty.') : (N.listEmpty || 'Nothing here.')) +
             '</p>';
      } else {
        h += '<div class="ad-bang">' + hien.map(function (g) {
          var cd = '', nut = '';
          var con = TRAN - Number(g.soSua || 0);
          if (g.xoa) {
            var n = conNgay(g);
            cd = '<span class="badge' + (n <= 3 ? ' badge--bad' : '') + '">' +
                 tho((N.daysLeft || '{n}d left').replace('{n}', n)) + '</span>';
            nut = '<button type="button" class="ad-lenh ad-lenh--chinh" data-viec="cuu">' +
                    tho(N.restore || 'Restore') + '</button>' +
                  '<button type="button" class="ad-lenh ad-lenh--xoa" data-viec="han">' +
                    tho(N.purge || 'Delete forever') + '</button>';
          } else {
            if (g.an) cd = '<span class="badge badge--bad">' + tho(N.hidden || 'Hidden') + '</span>';
            nut = '<button type="button" class="ad-lenh" data-viec="sua"' +
                    (con > 0 ? ' title="' + tho((N.editsLeft || '{n} of {t} edits left')
                                  .replace('{n}', con).replace('{t}', TRAN)) + '"'
                             : ' disabled title="' + tho(N.noEdits || 'No edits left.') + '"') + '>' +
                    tho(N.edit || 'Edit') + '</button>' +
                  '<button type="button" class="ad-lenh" data-viec="an">' +
                    tho(g.an ? (N.unhide || 'Unhide') : (N.hide || 'Hide')) + '</button>' +
                  '<button type="button" class="ad-lenh ad-lenh--xoa" data-viec="xoa">' +
                    tho(N.del2 || 'Delete') + '</button>';
          }
          /* Dòng dưới: loại, và số lần đã sửa khi đã sửa ít nhất một lần —
             để biết trước còn bao nhiêu lượt, không phải bấm Edit mới thấy. */
          var mo = [g.loai || ''];
          if (Number(g.soSua) > 0) {
            mo.push((N.edited || 'edited {n}/{t}').replace('{n}', g.soSua).replace('{t}', TRAN));
          }
          return '<div class="ad-dong ad-dong--hai" data-ma="' + tho(g.ma) + '">' +
            '<span class="ad-phu">' + tho(g.ngay) + '</span>' +
            '<span class="ad-chinh">' + tho(String(g.chu).replace(/\s+/g, ' ')) +
              '<span class="ad-mo">' + tho(mo.filter(Boolean).join(' · ') || '—') + '</span></span>' +
            '<span class="ad-cd">' + cd + '</span>' +
            '<span class="ad-lenh-hang">' + nut + '</span>' +
          '</div>';
        }).join('') + '</div>';
      }
      hop.innerHTML = h;

      [].forEach.call(khung.oLoc.querySelectorAll('[data-loc]'), function (b) {
        b.addEventListener('click', function () { loc = b.getAttribute('data-loc'); ve(); });
      });
      [].forEach.call(hop.querySelectorAll('.ad-dong'), function (d) {
        var g = dsQL.filter(function (x) { return x.ma === d.getAttribute('data-ma'); })[0];
        [].forEach.call(d.querySelectorAll('[data-viec]'), function (b) {
          b.addEventListener('click', function () { lam(b.getAttribute('data-viec'), g, b, d); });
        });
      });
    }

    function goi(phuongThuc, url, than) {
      return fetch(url, {
        method: phuongThuc,
        headers: K.dau(than ? { 'Content-Type': 'application/json' } : {}),
        body: than ? JSON.stringify(than) : undefined
      }).then(function (r) { if (!r.ok) throw new Error(String(r.status)); });
    }

    function lam(viec, g, b, d) {
      if (viec === 'sua') { khung.sua(g, TRAN - Number(g.soSua || 0)); return; }
      var p;
      if (viec === 'an') p = goi('PATCH', api, { ma: g.ma, an: g.an ? 0 : 1 });
      else if (viec === 'xoa') p = goi('DELETE', api + '?ma=' + encodeURIComponent(g.ma));
      else if (viec === 'cuu') p = goi('PATCH', api, { ma: g.ma, xoa: 0 });
      else if (viec === 'han') {
        if (!window.confirm(N.askPurge || 'Delete this for good? This cannot be undone.')) return;
        p = goi('DELETE', api + '?ma=' + encodeURIComponent(g.ma) + '&vinhVien=1');
      }
      if (!p) return;
      /* Đang sửa đúng ghi chú vừa bị ẩn/xoá thì thả khung viết ra — không thì
         bấm Save là sửa vào một ghi chú đã nằm trong thùng rác. */
      var cu = khung.dangSua();
      if (cu && cu.ma === g.ma && viec !== 'an') khung.thoiSua();
      b.disabled = true;
      if (viec !== 'an') d.classList.add('ad-dong--xong');
      p.then(function () {
        /* Trang /notes/ trong cùng phiên không cần biết: nó hỏi lại máy chủ
           mỗi lần mở. Ở đây chỉ cần vẽ lại bảng. */
        setTimeout(xin, viec === 'an' ? 0 : 220);
      }).catch(function () {
        b.disabled = false;
        d.classList.remove('ad-dong--xong');
        window.alert(N.actFail || 'Could not do that. Check the connection and try again.');
      });
    }

    function veLai() {
      if (!coKhoa()) { hop.innerHTML = ''; khung.oLoc.innerHTML = ''; dsQL = []; return; }
      xin();
    }

    return { xin: xin, veLai: veLai, el: hop };
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
