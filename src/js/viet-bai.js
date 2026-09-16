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

  function khungViet() {
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
        '<button type="button" class="btn" data-dang>' + tho(L('publish', 'Đăng')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    /* Cắm khung soạn thảo SAU khi innerHTML đã xong: đặt trước thì lượt gán
       innerHTML kế tiếp quét sạch nó đi cùng mọi trình nghe sự kiện của nó. */
    var oSoan = hop.querySelector('[data-soan]');
    if (oSoan && window.ZIB && window.ZIB.soan) {
      soan = window.ZIB.soan.gan(oSoan, { nhan: N });
      /* Bản nháp lần trước: đóng nhầm tab, mất mạng, bấm nhầm nút — bài gõ dở
         phải còn đó. Chỉ hỏi khi ô đang trống, để "Viết bài nữa" không lôi
         bài vừa đăng quay lại. */
      var cu = soan.nhapCu();
      if (cu && soan.rong()) {
        if (window.confirm(L('draftAsk', 'Còn một bài gõ dở trên máy này. Mở lại?'))) {
          soan.datHTML(cu);
        } else {
          soan.boNhap();
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

    fetch(api, {
      method: 'POST',
      headers: K.dau({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(b)
    }).then(function (r) {
      return r.json().then(function (d) { return { ma: r.status, d: d }; });
    }).then(function (kq) {
      nut.disabled = false;
      if (kq.d && kq.d.ok) { xong(kq.d, b); return; }
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
        '<div class="vb-nut"><button type="button" class="btn" data-nua>' +
          tho(L('another', 'Viết bài nữa')) + '</button></div>' +
      '</div>';
    hop.querySelector('[data-nua]').addEventListener('click', function () { khungViet(); });
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
        if (kq.d && kq.d.ok) { dsMuc = kq.d.muc || []; khungViet(); return; }
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
