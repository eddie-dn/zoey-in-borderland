/* ══════════════════════════════════════════════════════════════════════
   Ô VIẾT BÀI — mọc ở /z-admin/, nói chuyện với /api/bai.

   Khác ô viết GHI CHÚ ở một điểm quan trọng, và điểm ấy phải nói thẳng ra cho
   người dùng: ghi chú bấm xong là thấy ngay, còn bài thì KHÔNG. Bài đi vào kho
   mã rồi đợi Cloudflare dựng lại — khoảng một phút. Bấm Đăng xong mà trang
   chẳng đổi gì thì ai cũng tưởng hỏng, nên sau khi gửi xong màn hình phải nói
   rõ nó đang ở đâu và bao giờ thì xong.

   Khoá do src/js/khoa.js giữ, và trang /z-admin/ chỉ hỏi nó MỘT lần ở cửa
   vào — file này không có ô xin khoá nào.

   Phần thân bài không còn là <textarea> gõ Markdown trần: src/js/soan.js dựng
   một khung gõ như gõ văn bản, và lúc bấm Đăng mới đổi ra Markdown. Lý do đầy
   đủ ở đầu file ấy; chỗ này chỉ cần nhớ một điều — thứ gửi lên GitHub vẫn
   đúng là Markdown, y hệt bản gõ tay ở máy.
   ══════════════════════════════════════════════════════════════════════ */
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

  /* Khung soạn thảo đang cắm vào ô này — giữ lại để lúc bấm Đăng còn hỏi nó
     lấy Markdown, và lúc đăng xong còn bảo nó dọn bản nháp. */
  var soan = null;

  function tho(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Bản sao của slugify bên tools/lib/text.mjs, chỉ để XEM TRƯỚC đường dẫn khi
     đang gõ tiêu đề. Đường dẫn thật do máy chủ rút ra — ở đây rút sai một chút
     cũng không hỏng gì, nhưng rút cho giống thì đỡ bất ngờ. */
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

  /* ── CHƯA CÓ KHOÁ THÌ KHÔNG BÀY Ô VIẾT ──
     Ô viết ghi chú ngay bên trên đã có sẵn chỗ nhập khoá. Bày thêm một ô nữa
     là hỏi cùng một câu hai lần trên một màn hình. Ở đây chỉ nói ngắn gọn là
     đang đợi khoá, rồi tự hiện ra khi khoá đã lưu. */
  /* Ở /z-admin/ ngăn này không bao giờ hiện ra khi chưa đăng nhập — cửa chung
     của trang đã chặn từ ngoài. Câu dưới đây chỉ là lưới an toàn cho trường
     hợp khoa.js không tải được. */
  function khungCho() {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('locked',
      'Đăng nhập ở trên để mở ô này.')) + '</p>';
  }

  /* ══════════════ BẢNG BÀI ĐÃ ĐĂNG ══════════════

     Ngăn Post có hai mặt: VIẾT MỚI và SỬA BÀI CŨ. Trước bản này nó chỉ có mặt
     đầu, nên một bài đăng nhầm ngày, sai chính tả trong tiêu đề, hay cần cất
     đi đều phải mở máy, mở file, sửa tay, đẩy lên — tức là đúng cái quy trình
     mà ô viết bài sinh ra để khỏi phải làm.

     ── BA TRẠNG THÁI, MỘT HÀNG NÚT LỌC ──
       hiện   bài công khai
       nháp   `draft: true` — vẫn dựng ra trang để xem thử, nhưng không vào
              danh sách, feed, sitemap, và mang noindex
       ẩn     `hidden: true` — không dựng ra gì cả, đường dẫn cũ trả 404

     ── VÌ SAO KHÔNG CÓ NÚT XOÁ ──
     Xoá một file trong kho mã thì lịch sử Git vẫn giữ, nhưng khôi phục lại là
     việc của dòng lệnh — tức là đúng thứ người dùng ô này không muốn động
     tới. "Ẩn" làm được mọi điều người ta thật sự cần khi muốn xoá (bài biến
     khỏi trang, không ai đọc được nữa) mà vẫn lấy lại được bằng một cú bấm. */

  var bangDS = null;      /* danh sách bài đã tải về, giữ để lọc tại chỗ */
  var dangSua = null;     /* {duong, sha, fm, khoaKhac} của bài đang mở */
  var locTrang = '';      /* '' = tất cả */

  var TEN_TRANG = { hien: 'Hiện', nhap: 'Nháp', an: 'Đã ẩn' };

  function veBang() {
    soan = null;
    hop.innerHTML =
      '<div class="vb-thanh">' +
        '<button type="button" class="btn btn--chinh" data-moi>' +
          tho(L('newPost', 'Viết bài mới')) + '</button>' +
        '<div class="vb-loc" data-loc></div>' +
      '</div>' +
      '<div class="vb-bang" data-bang>' +
        '<p class="vb-cho">' + tho(L('loading', 'Đang tải…')) + '</p>' +
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
          tho(L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.')) + '</p>';
      });
  }

  function veHang() {
    var oLoc = hop.querySelector('[data-loc]');
    var oBang = hop.querySelector('[data-bang]');
    if (!oBang) return;

    /* Đếm theo trạng thái để in số lên chip. Chip có số thì biết ngay có gì
       đang nằm trong đó mà không phải bấm thử. */
    var dem = { hien: 0, nhap: 0, an: 0 };
    bangDS.forEach(function (b) { if (dem[b.trang] != null) dem[b.trang]++; });

    if (oLoc) {
      var h = '<button type="button" class="chip' + (locTrang ? '' : ' chip--nay') +
              '" data-t="">' + tho(L('all', 'Tất cả')) +
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
      oBang.innerHTML = '<p class="vb-cho">' + tho(L('empty', 'Không có bài nào ở đây.')) + '</p>';
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
          '<button type="button" class="vb-nho" data-sua>' + tho(L('edit', 'Sửa')) + '</button>' +
          '<button type="button" class="vb-nho" data-an>' +
            tho(b.trang === 'an' ? L('unhide', 'Bỏ ẩn') : L('hide', 'Ẩn')) + '</button>' +
        '</span>' +
      '</div>';
    }).join('') +
    (bangDS.cut
      ? '<p class="vb-cho">' + tho(
          (L('capped', 'Đang xem {n} bài mới nhất trong tổng số {t}.'))
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

  /* ── ẨN / BỎ ẨN ──
     Hai lượt gọi: đọc bài ra để lấy `sha` và mọi khoá front matter, rồi ghi
     lại với đúng một cờ đổi. Không đi đường tắt "chỉ gửi cờ": máy chủ dựng
     lại CẢ file, nên nó phải nhận đủ mọi thứ cần giữ — thiếu một khoá là mất
     khoá ấy. */
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
        /* Cập nhật ngay trong bảng đang mở, không tải lại cả danh sách: tải
           lại là bốn chục lượt gọi ra GitHub cho một cú bấm. */
        for (var i = 0; i < bangDS.length; i++) {
          if (bangDS[i].duong === duong) { bangDS[i].trang = d.trang; bangDS[i].sha = d.sha; }
        }
        veHang();
        noi(L('saved', 'Xong. Cloudflare đang dựng lại.'));
      })
      .catch(function () {
        nut.disabled = false; nut.textContent = cu;
        noi(L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.'), 'hong');
      });
  }

  /* ── MỞ MỘT BÀI RA SỬA ──
     Dùng lại ĐÚNG khung viết bài, chỉ khác ba chỗ: ô đã điền sẵn, nút Đăng
     thành nút Lưu, và có thêm nút Quay lại. Dựng một khung sửa riêng thì hai
     khung phải giữ cho giống nhau mãi mãi — mà chúng vốn là một việc. */
  function moSua(duong) {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Đang tải…')) + '</p>';
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
          tho(L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.')) + '</p>';
      });
  }

  function khungViet(cu) {
    var chon = (dsMuc || []).map(function (m) {
      return '<option value="' + tho(m) + '">' + tho(m) + '</option>';
    }).join('');

    hop.innerHTML =
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('title', 'Tiêu đề')) + '</span>' +
          '<input type="text" name="title" autocomplete="off" maxlength="200"></label>' +
      '</div>' +
      /* ── BA Ô PHỤ TRÊN MỘT HÀNG ──
         Trước đây chuyên mục + ngày một hàng, tag một hàng nữa. Cộng với tiêu
         đề và tóm tắt là bốn hàng nhãn trước khi tới chỗ gõ bài — trên laptop
         thì khung soạn thảo bắt đầu ở dưới mép màn hình, và việc đầu tiên mỗi
         lần viết bài là cuộn xuống.
         `.vb-o` khai `flex:1 1 180px`, nên ba ô này tự xếp một hàng ở khổ rộng
         và tự xuống hàng ở khổ hẹp — không cần thêm câu @media nào. */
      '<div class="vb-hang">' +
        '<label class="vb-o"><span>' + tho(L('muc', 'Chuyên mục')) + '</span>' +
          '<select name="muc">' + chon + '</select></label>' +
        '<label class="vb-o"><span>' + tho(L('date', 'Ngày')) + '</span>' +
          '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
        '<label class="vb-o"><span>' + tho(L('tags', 'Tag — cách nhau bằng dấu phẩy')) + '</span>' +
          '<input type="text" name="tags" autocomplete="off"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('summary', 'Tóm tắt')) + '</span>' +
          '<textarea name="summary" rows="1" maxlength="400"></textarea></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<div class="vb-o vb-o--rong"><span>' + tho(L('body', 'Bài')) + '</span>' +
          '<div data-soan></div></div>' +
      '</div>' +
      '<p class="vb-duong"><span class="vb-duong-nhan">' + tho(L('willBe', 'Sẽ nằm ở')) +
        '</span> <code data-xem-duong>…</code></p>' +
      '<div class="vb-nut">' +
        '<label class="vb-nhap"><input type="checkbox" name="draft"> ' +
          tho(L('draft', 'Để nháp — dựng ra nhưng chưa công khai')) + '</label>' +
        (cu ? '<button type="button" class="vb-nho" data-ve>' +
                tho(L('back', 'Quay lại')) + '</button>' : '') +
        '<button type="button" class="btn" data-dang>' +
          tho(cu ? L('save', 'Lưu') : L('publish', 'Đăng')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    /* ── SỬA THÌ ĐIỀN SẴN, VÀ CHUYÊN MỤC KHOÁ LẠI ──
       Đổi chuyên mục là đổi đường dẫn bài, mà đường dẫn tính từ CHỖ ĐẶT FILE.
       Muốn đổi thì phải dời file — hai lượt ghi, và giữa hai lượt ấy bài
       không tồn tại, cộng thêm mọi link đã chia sẻ gãy hết. Nên ô chuyên mục
       ở chế độ sửa chỉ để XEM. */
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

    /* Cắm khung soạn thảo SAU khi innerHTML đã xong: đặt trước thì lượt gán
       innerHTML kế tiếp quét sạch nó đi cùng mọi trình nghe sự kiện của nó. */
    var oSoan = hop.querySelector('[data-soan]');
    if (oSoan && window.ZIB && window.ZIB.soan) {
      soan = window.ZIB.soan.gan(oSoan, { nhan: N });
      /* Bản nháp lần trước: đóng nhầm tab, mất mạng, bấm nhầm nút — bài gõ dở
         phải còn đó. Chỉ hỏi khi ô đang trống, để "Viết bài nữa" không lôi
         bài vừa đăng quay lại. */
      if (cu && window.ZIB.soan.tuMD) {
        /* Đổ bài cũ vào khung. Bản nháp trên máy KHÔNG hỏi ở đây: nháp ấy là
           của một bài đang viết dở, còn đây là một bài đã có thật — trộn hai
           thứ vào nhau thì mất một trong hai. */
        soan.datHTML(window.ZIB.soan.tuMD(cu.noiDung));
      } else {
        var nhap = soan.nhapCu();
        if (nhap && soan.rong()) {
          if (window.confirm(L('draftAsk', 'Còn một bài gõ dở trên máy này. Mở lại?'))) {
            soan.datHTML(nhap);
          } else {
            soan.boNhap();
          }
        }
      }
    } else if (oSoan) {
      /* soan.js không tải được thì vẫn phải viết được bài — rơi về ô Markdown
         trần, đúng cái ô đã dùng trước bản này. */
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
      noi(L('needBoth', 'Cần cả tiêu đề lẫn nội dung.'), 'hong');
      return;
    }

    nut.disabled = true;
    noi(L('sending', 'Đang gửi…'));

    /* Sửa bài là PUT và mang theo `sha` + mọi khoá front matter đọc ra lúc
       mở — máy chủ dựng lại CẢ file, nên thiếu một khoá là mất khoá ấy. */
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
          /* Lưu xong thì `sha` đổi — giữ bản mới để lưu tiếp lần nữa không bị
             từ chối vì cầm mã băm cũ. */
          dangSua.sha = kq.d.sha || dangSua.sha;
          bangDS = null;
          noi(L('saved', 'Xong. Cloudflare đang dựng lại.'));
          return;
        }
        xong(kq.d, b);
        return;
      }
      noi(loiChu(kq.d), 'hong');
    }).catch(function () {
      nut.disabled = false;
      noi(L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.'), 'hong');
    });
  }

  /* Báo lỗi phải nói được PHẢI LÀM GÌ, không chỉ nói là hỏng. Bài vừa gõ vẫn
     còn nguyên trong ô — đó là điều quan trọng nhất lúc này. */
  function loiChu(d) {
    if (!d) return L('failed', 'Không đăng được.');
    if (d.loi === 'khoa') return L('badKey', 'Mã chủ hoặc khoá sai.');
    if (d.loi === 'cauhinh') {
      /* Máy chủ biết rõ thiếu gì và phải bấm vào đâu — câu của nó luôn đúng
         hơn câu ghép sẵn ở đây. Chỉ ghép khi nó không gửi câu nào. */
      return d.chiTiet
          || L('noConfig', 'Máy chủ chưa có') + ' ' + (d.thieu || []).join(', ')
           + ' — ' + L('seeDoc', 'xem docs/CAI-DAT.md');
    }
    if (d.loi === 'kiem') return (d.chiTiet || []).join(' · ');
    if (d.loi === 'lechban') return L('clash',
      'Bài này vừa đổi ở chỗ khác. Quay lại rồi mở lại để lấy bản mới.');
    if (d.loi === 'duong' || d.loi === 'sha') return L('failed', 'Không lưu được.');
    if (d.loi === 'trung') return d.chiTiet || L('dup', 'Đã có bài trùng tên.');
    if (d.loi === 'muc') return d.chiTiet || L('badMuc', 'Chuyên mục không có.');
    return d.chiTiet || L('failed', 'Không đăng được.');
  }

  /* ── SAU KHI GỬI: NÓI RÕ NÓ ĐANG Ở ĐÂU ──
     Đây là chỗ dễ làm người ta hoang mang nhất. Bài đã nằm trong kho mã nhưng
     trang thì chưa đổi, và nếu chỉ hiện "Xong!" thì phản xạ đầu tiên là bấm
     Đăng lần nữa — rồi nhận báo trùng tên và tưởng là hỏng thật.

     Nên hiện đủ ba thứ: bài sẽ nằm ở đâu, commit vừa tạo (soi được bộ dựng
     chạy tới đâu), và câu nhắc là phải đợi. */
  function xong(d, b) {
    /* Bài đã nằm trong kho mã — bản nháp trên máy hết việc. Giữ lại thì lần
       mở sau nó hỏi "mở lại bài gõ dở?" với đúng bài vừa đăng xong. */
    if (soan) soan.boNhap();
    soan = null;
    hop.innerHTML =
      '<div class="vb-xong">' +
        '<p class="vb-xong-de">' + tho(L('done', 'Đã đưa vào kho mã')) + '</p>' +
        '<p class="vb-xong-chu">' + tho(b.title) + '</p>' +
        '<ul class="vb-xong-ds">' +
          '<li>' + tho(L('willBe', 'Sẽ nằm ở')) + ' <code>' + tho(d.duongBai) + '</code></li>' +
          (d.commit ? '<li><a href="' + tho(d.commit) + '" target="_blank" rel="noopener">' +
            tho(L('seeCommit', 'Xem commit trên GitHub')) + '</a></li>' : '') +
        '</ul>' +
        '<p class="vb-noi">' + tho(d.nhac || L('building',
          'Cloudflare đang dựng lại. Bài lên sau khoảng một phút.')) + '</p>' +
        '<div class="vb-nut">' +
          '<button type="button" class="vb-nho" data-ve>' + tho(L('back', 'Quay lại')) + '</button>' +
          '<button type="button" class="btn" data-nua>' +
            tho(L('another', 'Viết bài nữa')) + '</button>' +
        '</div>' +
      '</div>';
    hop.querySelector('[data-nua]').addEventListener('click', function () { khungViet(); });
    /* Bảng phải tải lại: bài vừa đăng chưa có trong danh sách đang giữ. */
    hop.querySelector('[data-ve]').addEventListener('click', function () {
      bangDS = null; veBang();
    });
  }

  /* ── LẤY DANH SÁCH CHUYÊN MỤC, VÀ THỬ KHOÁ LUÔN THỂ ──
     Gọi một lượt GET trước khi bày ô ra: vừa đổ được ô chọn chuyên mục, vừa
     biết ngay khoá có đúng không. Biết khoá sai TRƯỚC khi gõ cả bài thì hơn
     hẳn biết sau. */
  function nap() {
    if (!coKhoa()) { khungCho(); return; }
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Đang tải…')) + '</p>';
    fetch(api, { headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (kq.d && kq.d.ok) { dsMuc = kq.d.muc || []; dangSua = null; veBang(); return; }
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
      })
      /* ── HAI LOẠI HỎNG, MỘT CÂU BÁO — VÀ ĐÓ TỪNG LÀ MỘT BUỔI ĐI SAI ĐƯỜNG ──
         `khungViet()` chạy bên TRONG chuỗi promise, nên một lỗi lập trình ở
         đó (một hàm gọi sai, một thuộc tính không có) rơi thẳng vào chỗ bắt
         lỗi này và hiện ra thành "Mạng trục trặc". Người ta đi kiểm wifi,
         kiểm Cloudflare, kiểm token — trong khi mạng vẫn tốt và lỗi nằm
         trong đúng mấy dòng vừa sửa.
         Nay lỗi thật vẫn được ném ra bảng điều khiển, và câu trên màn hình
         nói đúng loại hỏng. */
      .catch(function (e) {
        var laMang = (e instanceof TypeError) && /fetch|network|Load failed/i.test(String(e.message));
        if (!laMang && window.console) console.error('[viet-bai]', e);
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(laMang ? L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.')
                     : L('crash', 'Ô viết bài dựng hỏng — mở bảng điều khiển để xem lỗi.')) +
          '</p>';
      });
  }

  nap();

  /* Ô viết ghi chú ở trên lưu khoá xong thì ô này phải tự hiện ra — bắt người
     ta tải lại trang sau khi vừa gõ khoá là một bước thừa mà ai cũng vấp. */
  /* Một sự kiện duy nhất, do khoa.js phát — kể cả khi khoá đổi ở tab khác.
     Bản trước nghe `storage` và một sự kiện tự chế `zib:co-khoa`; hai đường
     ấy không bao giờ cùng nổ, nên có lúc ô này vẽ lại có lúc không. */
  if (K) K.theoDoi(nap);
})();
