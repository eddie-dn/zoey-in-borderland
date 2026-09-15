/* ═══════════════════════════════════════════════════════════════════════
   SỔ TAY — bảng lịch sử phiên bản, mở bằng cửa hậu ở chân trang.

   ĐƯỜNG VÀO:  bấm 5 nhịp liên tiếp vào dòng "Last updated … · Vx.yy".

   ── VÌ SAO CỬA LÀ CHÍNH DÒNG CHỮ, KHÔNG PHẢI MỘT CÁI NÚT ────────────────
   Học thẳng từ `assets/lichsu.js` bên dongchibinh-33, chỗ đó đã đi qua một
   đời có nút icon rồi bỏ đi. Nút icon vừa thừa — dòng chữ đã nói đúng tên
   chỗ đó rồi — vừa hết là cửa hậu, vì ai nhìn chân trang cũng thấy ngay có
   thứ bấm được. Dòng chữ thì đứng yên không có dấu vết gì; trỏ chuột vào mới
   đổi màu nhẹ.

   ── DỮ LIỆU LẤY TỪ ĐÂU ──────────────────────────────────────────────────
   Không chép tay vào đây. Build đọc `docs/LICH-SU.md` — vốn đã là nguồn duy
   nhất của số Vx.yy in ở chân trang — rồi nhúng vào mỗi trang một khối JSON.
   Nhờ vậy sổ này không bao giờ lệch với tem phiên bản: hai thứ cùng một gốc.

   Bản nào trong bảng mà không có mục chi tiết ở dưới thì hiện đúng chữ
   "no info", KHÔNG bịa một dòng nghe cho đẹp — cũng là luật bên kia.

   ── KHÔNG CÓ MÃ VÀO ─────────────────────────────────────────────────────
   Bên dongchibinh-33 còn một lớp mã số nữa vì sổ đó nằm trong một trò chơi.
   Sổ này chỉ là changelog của một cái blog, không có gì phải giấu — 5 nhịp
   bấm là để nó không chiếm chỗ trên giao diện, không phải để khoá ai.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var NHIP  = 5;      /* bấm bao nhiêu nhịp thì mở */
  var NGUNG = 900;    /* ngưng bấy nhiêu ms là đếm lại từ đầu */

  var nodeData = document.getElementById('so-tay-data');
  var cua = document.querySelector('[data-so-tay]');
  if (!nodeData || !cua) return;

  var DU;
  try { DU = JSON.parse(nodeData.textContent) || {}; } catch (e) { return; }
  if (!DU.ban || !DU.ban.length) return;

  /* Chữ lấy từ bảng NHAN trong tools/build.mjs, gửi kèm trong chính khối JSON
     này — cùng lý do như bên comments.js: một bảng nhãn, một chỗ để sửa. */
  var N = DU.nhan || {};
  function L(k, n) { return String(N[k] || '').replace('{n}', n); }

  /* ══════════ ĐẾM NHỊP ══════════ */
  var dem = 0, hen = null;

  cua.addEventListener('click', function () {
    clearTimeout(hen);
    dem++;
    /* Nhấp nháy theo từng nhịp từ nhịp thứ hai trở đi: bấm một cái lỡ tay thì
       không thấy gì, nhưng ai đang cố tình bấm thì biết là máy có nghe. */
    if (dem > 1) {
      cua.classList.remove('go');
      void cua.offsetWidth;            /* ép vẽ lại để animation chạy lần nữa */
      cua.classList.add('go');
    }
    if (dem >= NHIP) { dem = 0; cua.classList.remove('go'); mo(); return; }
    hen = setTimeout(function () { dem = 0; cua.classList.remove('go'); }, NGUNG);
  });

  /* ══════════ HỘP ══════════ */
  var nen = null, hop = null, traVe = null;

  function mo() {
    if (nen) return;
    traVe = document.activeElement;

    nen = document.createElement('div');
    nen.className = 'so-nen';
    nen.innerHTML = '<div class="so-hop glass" role="dialog" aria-modal="true" ' +
                    'aria-label="' + an(L('history')) + '"></div>';
    hop = nen.querySelector('.so-hop');
    document.body.appendChild(nen);
    document.body.classList.add('so-khoa');

    veDanhSach();
    requestAnimationFrame(function () { nen.classList.add('hien'); });

    nen.addEventListener('click', function (e) { if (e.target === nen) dong(); });
    document.addEventListener('keydown', phim);
  }

  function phim(e) {
    if (e.key === 'Escape') { dong(); return; }
    if (e.key !== 'Tab' || !hop) return;
    /* Giam tiêu điểm trong hộp. Thiếu đoạn này thì bấm Tab vài cái là con trỏ
       chạy ra sau tấm nền mờ, người dùng bàn phím gõ vào một trang họ không
       nhìn thấy. */
    var oc = hop.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
    if (!oc.length) return;
    var dau = oc[0], cuoi = oc[oc.length - 1];
    if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
    else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
  }

  function dong() {
    if (!nen) return;
    document.removeEventListener('keydown', phim);
    document.body.classList.remove('so-khoa');
    var x = nen; nen = null; hop = null;
    x.classList.remove('hien');
    setTimeout(function () { x.remove(); }, 200);
    if (traVe && traVe.focus) traVe.focus();
  }

  /* ══════════ CHỮ ══════════ */
  function an(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* Đổi `**đậm**` và `` `mã` `` thành thẻ. ESCAPE TRƯỚC rồi mới đổi — làm
     ngược lại thì một dấu < trong sổ mở được thẻ thật. */
  function chuNho(s) {
    return an(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function veDanhSach() {
    var hang = DU.ban.map(function (b, i) {
      var coChi = DU.chiTiet && DU.chiTiet[b.ten] && DU.chiTiet[b.ten].length;
      return '<tr class="' + (coChi ? 'so-co' : 'so-khong') + '"' +
             (coChi ? ' tabindex="0" role="button" data-i="' + i + '"' : '') + '>' +
               '<td class="so-ver">' + an(b.ten) + '</td>' +
               '<td class="so-ngay">' + an(b.ngay) + '</td>' +
               '<td class="so-dem">' + an(b.so) + '</td>' +
               '<td class="so-viec">' + an(b.suaChinh) +
                 (coChi ? '<i class="so-mui" aria-hidden="true"></i>' : '') +
               '</td>' +
             '</tr>';
    }).join('');

    hop.innerHTML =
      '<div class="so-dau">' +
        '<p class="label label--muted">' + an(L('history')) + '</p>' +
        '<button class="ico-btn so-x" type="button" aria-label="' + an(L('close')) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('builds', DU.ban.length)) + '</p>';

    hop.querySelector('.so-x').addEventListener('click', dong);
    hop.querySelectorAll('[data-i]').forEach(function (n) {
      function vao() { veChiTiet(+n.getAttribute('data-i')); }
      n.addEventListener('click', vao);
      n.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vao(); }
      });
    });
    hop.querySelector('.so-x').focus();
  }

  function veChiTiet(i) {
    var b  = DU.ban[i];
    var ds = (DU.chiTiet && DU.chiTiet[b.ten]) || [];

    hop.innerHTML =
      '<div class="so-dau">' +
        '<button class="ico-btn so-lui" type="button" aria-label="' + an(L('back')) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' +
        '</button>' +
        '<p class="label label--muted">' + an(b.ten) + ' · ' + an(b.ngay) + '</p>' +
        '<button class="ico-btn so-x" type="button" aria-label="' + an(L('close')) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="so-cuon">' +
        (ds.length
          ? '<ul class="so-y">' + ds.map(function (y) {
              return '<li>' + chuNho(y) + '</li>';
            }).join('') + '</ul>'
          : '<p class="so-trong">' + an(L('noInfo')) + '</p>') +
      '</div>' +
      '<p class="so-chan">' + an(L('patches', b.so)) + '</p>';

    hop.querySelector('.so-x').addEventListener('click', dong);
    hop.querySelector('.so-lui').addEventListener('click', veDanhSach);
    hop.querySelector('.so-lui').focus();
  }
})();
