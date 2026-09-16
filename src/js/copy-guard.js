/* ============================================================
   COPY-GUARD — chép một đoạn DÀI thì tự kèm nguồn.

   ─────────────────────────────────────────────────────────────
   NÓI THẲNG TRƯỚC: ĐÂY LÀ GỜ GIẢM TỐC, KHÔNG PHẢI Ổ KHOÁ.

   Không có cách nào chặn được việc sao chép chữ trên một trang web. Chữ đã
   nằm sẵn trong máy người đọc rồi — đó là điều kiện để họ đọc được nó. Ai
   muốn lấy vẫn còn:
     · Ctrl+U xem mã nguồn         · chế độ Đọc của Safari/Firefox
     · DevTools                     · tắt JavaScript
     · In ra PDF                    · chụp màn hình rồi OCR

   Cái này chỉ nhắm vào trường hợp thường gặp nhất: người bôi đen cả bài rồi
   dán sang chỗ khác mà quên ghi nguồn. Dán ra vẫn có một dòng nguồn đi kèm.

   ─────────────────────────────────────────────────────────────
   BA THỨ CỐ Ý KHÔNG LÀM, vì hại nhiều hơn lợi:

   1. KHÔNG đặt `user-select: none`. Nó chặn luôn cả người đọc bình thường
      muốn trích một câu gửi bạn, và chặn cả người dùng trình đọc màn hình,
      công cụ dịch, hay người quen bôi đen để dò dòng khi đọc.
   2. KHÔNG chặn chuột phải. Nó không ngăn được ai cả, chỉ làm phiền người
      muốn mở link ra tab mới.
   3. KHÔNG đụng tới đoạn chép NGẮN. Trích một câu là chuyện bình thường và
      nên dễ. Chỉ can thiệp khi vượt ngưỡng.

   Khối mã (<pre>) cũng được chép nguyên — mã là thứ SINH RA để chép.
   ============================================================ */
(function () {
  'use strict';

  var khoi = document.querySelector('[data-copy-guard]');
  if (!khoi) return;

  var NGUONG  = Number(khoi.dataset.nguong) || 220;   /* dưới mức này: không đụng */
  var GIOIHAN = Number(khoi.dataset.gioihan) || 0;    /* >0 = cắt còn bấy nhiêu ký tự */
  var NHAC    = khoi.dataset.nhac || 'Read the full piece at';
  var TIEUDE  = khoi.dataset.tieude || document.title;

  function trongKhoiMa(sel) {
    /* Vùng bôi đen nằm gọn trong một khối mã thì để yên. commonAncestorContainer
       là nút cha chung gần nhất của cả vùng chọn; nếu nó nằm trong <pre> thì cả
       vùng chọn cũng vậy. */
    if (!sel.rangeCount) return false;
    var n = sel.getRangeAt(0).commonAncestorContainer;
    if (n.nodeType === 3) n = n.parentNode;
    return !!(n && n.closest && n.closest('pre'));
  }

  document.addEventListener('copy', function (e) {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    var chu = String(sel);
    if (chu.length < NGUONG) return;      /* trích ngắn — để nguyên, không can thiệp */
    if (trongKhoiMa(sel)) return;         /* mã nguồn — sinh ra để chép */

    /* Chỉ can thiệp khi vùng chọn nằm TRONG bài. Bôi đen ở header hay chân
       trang thì kệ, không phải nội dung cần ghi nguồn. */
    if (sel.rangeCount) {
      var n = sel.getRangeAt(0).commonAncestorContainer;
      if (n.nodeType === 3) n = n.parentNode;
      if (!n || !n.closest || !n.closest('[data-copy-guard]')) return;
    }

    var than = chu;
    var catBot = false;
    if (GIOIHAN > 0 && than.length > GIOIHAN) {
      /* Cắt ở ranh giới TỪ, không cắt giữa chừng một chữ */
      var cut = than.slice(0, GIOIHAN);
      var sp = cut.lastIndexOf(' ');
      than = (sp > GIOIHAN * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
      catBot = true;
    }

    var nguon = '\n\n— ' + TIEUDE + '\n' + NHAC + ': ' + location.href;
    var raTho = than + nguon;

    try {
      e.clipboardData.setData('text/plain', raTho);
      /* Đặt cả text/html để dán vào Word hay Google Docs cũng có nguồn, và
         dòng nguồn ở đó là một liên kết bấm được. */
      e.clipboardData.setData('text/html',
        '<blockquote>' + thoat(than) + '</blockquote>' +
        '<p>— ' + thoat(TIEUDE) + '<br>' + thoat(NHAC) + ': ' +
        '<a href="' + thoat(location.href) + '">' + thoat(location.href) + '</a></p>');
      e.preventDefault();
    } catch (err) {
      /* Trình duyệt không cho ghi clipboard thì thôi, để nó chép như thường —
         thà chép được không nguồn còn hơn bấm Ctrl+C mà không có gì xảy ra. */
      return;
    }

    if (catBot) nhacNho();
  });

  function thoat(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Báo cho người đọc biết đoạn vừa chép đã bị cắt — im lặng cắt bớt thì họ
     dán ra mới phát hiện thiếu, và không hiểu vì sao. */
  var dangHien = null;
  function nhacNho() {
    if (dangHien) { clearTimeout(dangHien.t); dangHien.el.remove(); }
    var el = document.createElement('div');
    el.className = 'copy-nhac';
    el.setAttribute('role', 'status');
    el.textContent = 'That was a long excerpt, so it was shortened and the source added ✦';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('hien'); });
    dangHien = { el: el, t: setTimeout(function () {
      el.classList.remove('hien');
      setTimeout(function () { el.remove(); }, 320);
      dangHien = null;
    }, 3200) };
  }
})();
