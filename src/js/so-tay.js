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

  /* ── DỮ LIỆU XIN VỀ LÚC MỞ, KHÔNG NHÚNG SẴN TRONG TRANG ──
     Bản trước nhúng trọn sổ phiên bản dạng JSON vào MỌI trang. Đo ra: 77 KB
     mỗi trang, trong khi thân bài dài nhất chỉ 6 KB — tức là bốn phần năm sức
     nặng của một trang bài là thứ chỉ hiện ra khi người ta bấm năm nhịp vào
     dòng chữ nhỏ ở chân trang. Nhân 47 trang thành 3,5 MB lặp lại, chiếm hơn
     nửa cả bản dựng.

     Nay nó là một file riêng, xin về đúng lúc mở hộp. Người đọc bình thường
     không bao giờ tải nó; ai mở thì chờ thêm một vòng mạng — mà họ vừa bấm
     năm nhịp nên chờ một nhịp là chuyện thường. Xin xong thì nhớ lại, mở lần
     hai không gọi nữa. */
  var API_SO = document.documentElement.getAttribute('data-so-tay-api');
  /* ── CỬA THỨ HAI: BẤM 5 NHỊP VÀO TIÊU ĐỀ TRANG GIỚI THIỆU ──
     Đưa tới bàn làm việc của chủ trang (/z-admin/). Cùng cơ chế 5 nhịp với
     sổ phiên bản, và cùng lý do: một cái nút "Quản lý" bày giữa trang thì mọi
     người đọc đều thấy một thứ chẳng để làm gì, mà lại mời người ta thử.

     Không phải lớp bảo mật — ai bấm đủ 5 nhịp cũng chỉ tới một trang xin khoá.
     Nó chỉ để chủ trang khỏi phải nhớ đường dẫn: đang ở trang giới thiệu, bấm
     mấy cái vào tiêu đề là vào.

     Dùng `pointerdown` chứ không `click`: trên điện thoại, bấm nhanh liên tiếp
     vào một dòng chữ thì trình duyệt hay nuốt mất mấy cú `click` cuối để đoán
     xem có phải cú bấm-hai-lần-để-phóng-to hay không. */
  (function () {
    var de = document.querySelector('[data-cua-ql]');
    if (!de) return;
    var d = 0, h = null;
    de.addEventListener('pointerdown', function () {
      d++;
      if (h) clearTimeout(h);
      if (d >= 5) { d = 0; location.href = de.getAttribute('data-cua-ql'); return; }
      h = setTimeout(function () { d = 0; }, 900);
    });
  })();

  var cua = document.querySelector('[data-so-tay]');
  if (!API_SO || !cua) return;

  var DU = null;
  var dangXin = null;

  /* Chữ lấy từ bảng NHAN trong tools/build.mjs, gửi kèm trong chính khối JSON
     này — cùng lý do như bên comments.js: một bảng nhãn, một chỗ để sửa. */
  var N = {};
  /* `{s}` là chữ s của số nhiều: một thì bỏ đi, nhiều thì giữ. Nhờ vậy bảng
     không bao giờ ghi "1 patches" — chuỗi nhãn vẫn nằm một chỗ ở build.mjs. */
  function L(k, n) {
    return String(N[k] || '').replace('{n}', n).replace('{s}', n === 1 ? '' : 's');
  }

  function xinDuLieu() {
    if (DU) return Promise.resolve(DU);
    if (dangXin) return dangXin;
    /* KHÔNG 'no-store'. File này đổi theo mỗi lần đăng, mà Cloudflare gửi kèm
       ETag và `must-revalidate`: lần mở sau trình duyệt hỏi một câu rất nhẹ,
       chưa đổi thì nhận 304 và dùng lại bản cũ — không tải lại 77 KB. Đặt
       'no-store' là tự tay tắt mất chuyện đó. */
    dangXin = fetch(API_SO)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.build || !d.build.length) throw new Error('sổ rỗng');
        DU = d; N = d.nhan || {};
        return DU;
      })
      .catch(function (e) { dangXin = null; throw e; });
    return dangXin;
  }

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
  var nen = null, hop = null;

  function mo() {
    if (nen) return;
    /* Xin dữ liệu TRƯỚC khi dựng hộp: dựng hộp rỗng rồi mới đổ chữ vào thì
       người mở thấy một tấm kính trống nhấp nháy. Hỏng thì không mở gì cả —
       đúng như bản cũ khi JSON hỏng. */
    xinDuLieu().then(moThat, function () {});
  }

  /* ══════════ HỘP DỰNG BẰNG <dialog> ══════════

     Bản trước tự dựng lớp phủ: một `<div>` `position:fixed`, cộng ba đoạn mã
     viết tay cho ba việc mà trình duyệt vốn đã làm sẵn —

       · nghe phím Escape để đóng;
       · giam tiêu điểm trong hộp, không thì bấm Tab vài cái là con trỏ chạy
         ra sau tấm nền mờ và người dùng bàn phím gõ vào một trang họ không
         nhìn thấy;
       · che phần còn lại của trang khỏi trình đọc màn hình.

     `showModal()` cho cả ba, đúng và đủ, không phải viết dòng nào. Kèm theo
     nó là `::backdrop` — một lớp nền nằm sẵn ở tầng trên cùng, nên thôi phải
     đi tranh `z-index` với thanh đầu trang hay cụm nút nổi.

     Hai hộp thoại còn lại của trang (`.anh-to` xem ảnh, `.sz-cat` cắt ảnh) đã
     dùng `<dialog>` từ đầu. Đây là cái cuối cùng còn tự dựng — xem
     docs/DESIGN-SYSTEM.md §21.4.

     ── CÒN GIỮ LẠI HAI THỨ ──
     Khoá cuộn nền (`body.so-khoa`): `showModal()` chặn tương tác nhưng KHÔNG
     chặn cuộn, nên cuộn trong hộp tới đáy rồi cuộn tiếp là trang phía sau
     chạy. Và nhịp mờ dần lúc mở — `<dialog>` không có sẵn, vẫn phải tự gắn
     lớp `hien` ở khung sau. */
  function moThat() {
    if (nen) return;

    nen = document.createElement('dialog');
    nen.className = 'so-nen';
    nen.setAttribute('aria-label', an(L('history')));
    nen.innerHTML = '<div class="so-hop glass"></div>';
    hop = nen.querySelector('.so-hop');
    document.body.appendChild(nen);
    document.body.classList.add('so-khoa');

    veBuild();
    nen.showModal();
    requestAnimationFrame(function () { nen.classList.add('hien'); });

    /* Bấm ra ngoài hộp thì đóng. `<dialog>` nhận cú bấm trên chính nó khi
       người ta bấm vào vùng backdrop, nên so `e.target === nen` là đủ — bấm
       vào ruột hộp thì target là phần tử bên trong. */
    nen.addEventListener('click', function (e) { if (e.target === nen) dong(); });
    /* Escape do trình duyệt lo, nhưng nó đóng bằng cách riêng của nó — phải
       nghe `cancel` để dọn dẹp cho đúng thay vì để lại một thẻ chết trong DOM
       và một `body.so-khoa` không ai gỡ. */
    nen.addEventListener('cancel', function (e) { e.preventDefault(); dong(); });
  }

  function dong() {
    if (!nen) return;
    document.body.classList.remove('so-khoa');
    var x = nen; nen = null; hop = null;
    x.classList.remove('hien');
    /* Đợi hết nhịp mờ rồi mới `close()` + gỡ: gọi ngay thì hộp biến mất phụt
       một cái. `close()` tự trả tiêu điểm về chỗ đã mở nó, nên không cần giữ
       `traVe` nữa. */
    setTimeout(function () {
      if (x.open) x.close();
      x.remove();
    }, 200);
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

  /* ══════════ BA TẦNG ══════════
     1. danh sách ĐỢT     V2.4 · V2.3 · V2.2 …
     2. các bản vá trong một đợt   V2.4.9 · V2.4.8 …
     3. chi tiết một bản vá

     Gom như vậy vì mỗi dòng trong docs/LICH-SU.md là một bản vá, còn cái người
     xem muốn thấy trước là các MỐC LỚN. Rải phẳng trăm dòng ngang hàng thì
     không đọc ra đâu là mốc.

     Tầng đầu là ĐỢT chứ không phải BUILD: từ V3 số có ba tầng và một build chở
     tới 100 bản, nên gom theo build thì tầng đầu chỉ còn hai dòng. Số build
     vẫn đọc được — nó nằm ngay trong tên đợt. */

  function veDau(tieuDe, coLui, luiVe) {
    return '<div class="so-dau">' +
      (coLui
        ? '<button class="ico-btn so-lui" type="button" aria-label="' + an(L('back')) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' +
          '</button>'
        : '') +
      '<p class="label label--muted">' + tieuDe + '</p>' +
      '<button class="ico-btn so-x" type="button" aria-label="' + an(L('close')) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '</button>' +
    '</div>';
  }

  function noiNut(luiVe) {
    hop.querySelector('.so-x').addEventListener('click', dong);
    var l = hop.querySelector('.so-lui');
    if (l && luiVe) { l.addEventListener('click', luiVe); l.focus(); }
    else hop.querySelector('.so-x').focus();
  }

  /* ── IN NGÀY CHO GỌN ──
     Cột ngày từng in nguyên hai chuỗi ISO nối bằng mũi tên:
     `2026-09-15 → 2026-09-16`, hai mươi ba ký tự không ngắt dòng được. Ở một
     bảng bốn cột thì nó ăn mất phần lớn bề ngang, và cột MÔ TẢ — thứ người ta
     thật sự đọc — bị ép xuống hai ba dòng trong khi cột ngày vẫn thừa chỗ.

     Nay gộp phần chung lại: cùng tháng thì in `15–16 Sep 2026`, cùng năm thì
     `15 Sep – 2 Oct 2026`. Ngắn hơn một nửa mà đọc còn nhanh hơn. */
  var THANG = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function mot(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return String(iso || '');
    return { d: +p[2], m: +p[1] - 1, y: +p[0] };
  }
  function inNgay(x) {
    return typeof x === 'string' ? x : x.d + ' ' + THANG[x.m] + ' ' + x.y;
  }
  function khoangNgay(tu, den) {
    if (!den || tu === den) return inNgay(mot(tu));
    var a = mot(tu), b = mot(den);
    if (typeof a === 'string' || typeof b === 'string') return inNgay(a) + ' – ' + inNgay(b);
    if (a.y === b.y && a.m === b.m) return a.d + '–' + b.d + ' ' + THANG[a.m] + ' ' + a.y;
    if (a.y === b.y) return a.d + ' ' + THANG[a.m] + ' – ' + b.d + ' ' + THANG[b.m] + ' ' + a.y;
    return inNgay(a) + ' – ' + inNgay(b);
  }

  /* ── TẦNG 1: BUILD (Vx) ── */
  function veBuild() {
    var hang = DU.build.map(function (b, i) {
      /* Mô tả build = việc chính của bản vá MỚI NHẤT trong build đó. Gộp cả
         bảy dòng lại thì ra một đoạn dài không ai đọc. */
      var moi = b.dot[0].va[0];
      return '<tr class="so-co so-build" tabindex="0" role="button" data-i="' + i + '">' +
          '<td class="so-ver so-ver--lon">' + an(b.ten) + '</td>' +
          '<td class="so-ngay">' + an(khoangNgay(b.tuNgay, b.denNgay)) + '</td>' +
          '<td class="so-dem">' + an(b.soDot) + '</td>' +
          '<td class="so-viec">' + an(moi.suaChinh) +
            '<i class="so-mui" aria-hidden="true"></i></td>' +
        '</tr>';
    }).join('');

    hop.innerHTML =
      veDau(an(L('history')), false) +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('builds', DU.build.length)) + '</p>';

    noiNut(null);
    gan(function (i) { veDot(i); });
  }

  /* ── TẦNG 2: ĐỢT TRONG MỘT BUILD (Vx.y) ── */
  function veDot(iB) {
    var b = DU.build[iB];
    var hang = b.dot.map(function (d, i) {
      return '<tr class="so-co" tabindex="0" role="button" data-i="' + i + '">' +
          '<td class="so-ver">' + an(d.ten) + '</td>' +
          '<td class="so-ngay">' + an(khoangNgay(d.tuNgay, d.denNgay)) + '</td>' +
          '<td class="so-dem">' + an(d.soVa) + '</td>' +
          '<td class="so-viec">' + an(d.va[0].suaChinh) +
            '<i class="so-mui" aria-hidden="true"></i></td>' +
        '</tr>';
    }).join('');

    hop.innerHTML =
      veDau(an(b.ten), true) +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('dots', b.soDot)) + '</p>';

    noiNut(veBuild);
    gan(function (i) { veVa(iB, i); });
  }

  /* ── TẦNG 2: BẢN VÁ TRONG MỘT BUILD ── */
  function veVa(iB, iD) {
    var b = DU.build[iB].dot[iD];
    var hang = b.va.map(function (v, i) {
      var coChi = DU.chiTiet && DU.chiTiet[v.ten] && DU.chiTiet[v.ten].length;
      return '<tr class="' + (coChi ? 'so-co' : 'so-khong') + '"' +
             (coChi ? ' tabindex="0" role="button" data-i="' + i + '"' : '') + '>' +
          '<td class="so-ver">' + an(v.ten) + '</td>' +
          '<td class="so-ngay">' + an(khoangNgay(v.ngay)) + '</td>' +
          '<td class="so-dem">' + an(v.so) + '</td>' +
          '<td class="so-viec">' + an(v.suaChinh) +
            (coChi ? '<i class="so-mui" aria-hidden="true"></i>' : '') + '</td>' +
        '</tr>';
    }).join('');

    hop.innerHTML =
      veDau(an(b.ten), true) +
      '<div class="so-cuon"><table class="so-bang"><tbody>' + hang + '</tbody></table></div>' +
      '<p class="so-chan">' + an(L('patches', b.soVa)) + '</p>';

    noiNut(function () { veDot(iB); });
    gan(function (i) { veChiTiet(iB, iD, i); });
  }

  /* ── CHI TIẾT MỘT BẢN VÁ — các gạch đầu dòng của chính nó ── */
  function veChiTiet(iB, iD, iV) {
    var v  = DU.build[iB].dot[iD].va[iV];
    var ds = (DU.chiTiet && DU.chiTiet[v.ten]) || [];

    hop.innerHTML =
      veDau(an(v.ten) + ' · ' + an(khoangNgay(v.ngay)), true) +
      '<div class="so-cuon">' +
        (ds.length
          ? '<ul class="so-y">' + ds.map(function (y) {
              return '<li>' + chuNho(y) + '</li>';
            }).join('') + '</ul>'
          : '<p class="trong so-trong">' + an(L('noInfo')) + '</p>') +
      '</div>' +
      '<p class="so-chan">' + an(v.suaChinh) + '</p>';

    noiNut(function () { veVa(iB, iD); });
  }

  /* Gắn bấm + Enter/Space cho mọi dòng có data-i. Một chỗ cho cả ba tầng. */
  function gan(vao) {
    hop.querySelectorAll('[data-i]').forEach(function (n) {
      function di() { vao(+n.getAttribute('data-i')); }
      n.addEventListener('click', di);
      n.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); di(); }
      });
    });
  }
})();
