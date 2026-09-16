/* ══════════════════════════════════════════════════════════════════════
   Ô VIẾT BÀI — mọc ở /z-admin/, nói chuyện với /api/bai.

   Khác ô viết GHI CHÚ ở một điểm quan trọng, và điểm ấy phải nói thẳng ra cho
   người dùng: ghi chú bấm xong là thấy ngay, còn bài thì KHÔNG. Bài đi vào kho
   mã rồi đợi Cloudflare dựng lại — khoảng một phút. Bấm Đăng xong mà trang
   chẳng đổi gì thì ai cũng tưởng hỏng, nên sau khi gửi xong màn hình phải nói
   rõ nó đang ở đâu và bao giờ thì xong.

   Dùng chung đúng cặp khoá đã lưu cho ghi chú và bàn duyệt (`zib-gc-id` /
   `zib-gc-key`). Gõ khoá một lần cho cả ba việc — ba ô xin khoá trên cùng một
   trang thì không ai chịu được.
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

  var K_ID = 'zib-gc-id', K_KEY = 'zib-gc-key';
  function doc(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function khoa() { return { id: doc(K_ID), key: doc(K_KEY) }; }
  function coKhoa() { var k = khoa(); return !!(k.id && k.key); }

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
  function khungCho() {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('needKey',
      'Nhập mã chủ và khoá ở ô bên trên, ô viết bài sẽ hiện ra.')) + '</p>';
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
      '<div class="vb-hang">' +
        '<label class="vb-o"><span>' + tho(L('muc', 'Chuyên mục')) + '</span>' +
          '<select name="muc">' + chon + '</select></label>' +
        '<label class="vb-o"><span>' + tho(L('date', 'Ngày')) + '</span>' +
          '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('tags', 'Tag — cách nhau bằng dấu phẩy')) + '</span>' +
          '<input type="text" name="tags" autocomplete="off"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('summary', 'Tóm tắt')) + '</span>' +
          '<textarea name="summary" rows="2" maxlength="400"></textarea></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('body', 'Bài — viết bằng Markdown')) + '</span>' +
          '<textarea name="noiDung" rows="14"></textarea></label>' +
      '</div>' +
      '<p class="vb-duong"><span class="vb-duong-nhan">' + tho(L('willBe', 'Sẽ nằm ở')) +
        '</span> <code data-xem-duong>…</code></p>' +
      '<div class="vb-nut">' +
        '<label class="vb-nhap"><input type="checkbox" name="draft"> ' +
          tho(L('draft', 'Để nháp — dựng ra nhưng chưa công khai')) + '</label>' +
        '<button type="button" class="btn" data-dang>' + tho(L('publish', 'Đăng')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

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
    var b = {
      title  : hop.querySelector('[name=title]').value,
      muc    : hop.querySelector('[name=muc]').value,
      date   : hop.querySelector('[name=date]').value,
      tags   : hop.querySelector('[name=tags]').value,
      summary: hop.querySelector('[name=summary]').value,
      noiDung: hop.querySelector('[name=noiDung]').value,
      draft  : hop.querySelector('[name=draft]').checked
    };
    if (!b.title.trim() || !b.noiDung.trim()) {
      noi(L('needBoth', 'Cần cả tiêu đề lẫn nội dung.'), 'hong');
      return;
    }

    var k = khoa();
    nut.disabled = true;
    noi(L('sending', 'Đang gửi…'));

    fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                 'x-gc-id': k.id, 'x-gc-key': k.key },
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
      return L('noConfig', 'Máy chủ chưa có') + ' ' + (d.thieu || []).join(', ')
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
    var k = khoa();
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Đang tải…')) + '</p>';
    fetch(api, { headers: { 'x-gc-id': k.id, 'x-gc-key': k.key } })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (kq.d && kq.d.ok) { dsMuc = kq.d.muc || []; khungViet(); return; }
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
      })
      .catch(function () {
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.')) + '</p>';
      });
  }

  nap();

  /* Ô viết ghi chú ở trên lưu khoá xong thì ô này phải tự hiện ra — bắt người
     ta tải lại trang sau khi vừa gõ khoá là một bước thừa mà ai cũng vấp. */
  window.addEventListener('storage', function (e) {
    if (e.key === K_ID || e.key === K_KEY) nap();
  });
  document.addEventListener('zib:co-khoa', nap);
})();
