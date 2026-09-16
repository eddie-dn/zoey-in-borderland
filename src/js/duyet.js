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

  /* Khoá do src/js/khoa.js giữ — một chỗ cho cả ba ngăn. File này không còn
     tự đọc localStorage, và cũng không còn khung xin khoá của riêng nó. */
  var K = (window.ZIB || {}).khoa;
  function coKhoa() { return !!(K && K.co()); }
  function dauKhoa(them) { return K ? K.dau(them) : (them || {}); }

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

  /* ── CHƯA VÀO ĐƯỢC ──
     Ở /z-admin/ thì không vẽ gì: cửa chung của trang đã hỏi khoá rồi, và hỏi
     lần nữa ngay trong ngăn là một màn hình có hai ô đăng nhập.
     Ở trang bài hoặc /notes/#duyet thì mượn đúng khung đăng nhập chung — cùng
     một khung, cùng một phép thử khoá, cùng một câu báo lỗi. */
  function veKhoa(loi) {
    hop.textContent = '';
    dungDongHo();

    if (oCamSan()) {
      if (loi) { var b = de(loi); b.className = 'bl-duyet-bao bl-duyet-bao--hong'; hop.appendChild(b); }
      return;
    }

    hop.appendChild(de(L('queue')));
    if (!K) return;
    var cong = K.veCong(hop, ve);
    if (loi) cong.noi(loi, true);
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
        /* `chiTiet` là câu NÓI PHẢI LÀM GÌ (thường là lỗi cấu hình máy chủ);
           `loi` chỉ là mã phân loại — in mã ra thì màn hình hiện chữ
           "cauhinh" và người đọc không biết đi đâu tiếp. */
        if (!kq.ok) { veKhoa(kq.chiTiet || kq.loi || L('badKey')); return; }
        veHang(kq.ds || []);
      })
      .catch(function () {
        dangXin = false;
        if (!lang) veKhoa(L('netErr'));
      });
  }

  /* ── BÀN DUYỆT CÓ ĐANG THẤY ĐƯỢC KHÔNG ──
     Ở /z-admin/ ba việc nằm trong ba ngăn, ngăn không chọn thì mang `hidden`.
     Phần tử nằm trong một khối `display:none` có `offsetParent` bằng null —
     đọc dấu hiệu ấy rẻ hơn hẳn việc bắt admin.js phải báo tin sang đây, và nó
     đúng cho MỌI cách ẩn chứ không riêng ba ngăn kia.

     `document.hidden` chỉ biết cả TAB có đang hiện hay không; nó không biết
     ngăn nào trong tab đang mở. Thiếu phép thử này thì bàn duyệt vẫn gọi máy
     chủ hai mươi giây một lần suốt lúc chủ trang ngồi gõ bài ở ngăn bên cạnh. */
  function dangThay() { return !!(hop && hop.offsetParent !== null); }

  /* ── TỰ XIN LẠI ──
     Bàn duyệt hay bị mở rồi để đó. Không tự làm mới thì con số đứng im, và chủ
     trang tưởng không có gì mới trong khi hàng chờ đã dài ra.

     20 giây, và CHỈ khi tab đang hiện VÀ ngăn này đang mở: không ai nhìn mà
     vẫn gọi là đốt hạn ngạch để vẽ cho cái không ai xem. Quay lại thì xin ngay
     một lượt cho số liệu khớp lại. */
  function batDongHo() {
    dungDongHo();
    dongHo = setInterval(function () {
      if (!document.hidden && dangThay() && coKhoa()) xin(true);
    }, 20000);
  }
  function dungDongHo() { if (dongHo) { clearInterval(dongHo); dongHo = null; } }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && dangThay() && hop && coKhoa()) xin(true);
  });

  /* Đổi sang ngăn Comment ở /z-admin/ thì xin ngay, đừng bắt đợi hết hai mươi
     giây mới thấy hàng chờ đúng. Sự kiện do admin.js phát ra. */
  document.addEventListener('zib:ngan', function () {
    if (dangThay() && hop && coKhoa()) xin(true);
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

    /* Lối ra chỉ mọc ở trang KHÔNG có cửa chung. Ở /z-admin/ nút Đăng xuất
       nằm dưới cột chọn việc, và hai nút cùng một việc trên một màn hình thì
       kiểu gì cũng có ngày một cái bị sửa còn cái kia không. */
    if (K && !oCamSan()) {
      var oRa = document.createElement('div');
      oRa.className = 'bl-duyet-ra';
      K.veNutRa(oRa);
      hop.appendChild(oRa);
    }
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

  /* Khoá đổi ở đâu cũng vẽ lại ở đây. Quan trọng nhất là chiều ĐĂNG XUẤT:
     hàng chờ duyệt đang bày đầy tên và nội dung bình luận chưa duyệt ra màn
     hình, mà bấm Đăng xuất xong nó vẫn nằm đó cho tới nhịp hỏi máy chủ kế
     tiếp thì "đăng xuất" chỉ là một cái nút không làm gì trong hai mươi giây. */
  if (K) K.theoDoi(function () { if (hop) ve(); });
})();
