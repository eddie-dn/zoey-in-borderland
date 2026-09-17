/* ============================================================
   BÀN DUYỆT — một khung gom mọi bình luận đang chờ, của CẢ BLOG.

   Sống ở ĐÚNG MỘT chỗ: ngăn Comment của `/z-admin/`.

   ── ĐÃ BỎ: LỐI TẮT `#duyet` ──
   Đời trước khối này mọc ra ở bất kỳ trang bài nào khi địa chỉ mang `#duyet`,
   và lúc chưa có khoá thì nó chèn một khung XIN KHOÁ lên đầu bài viết. Nay
   `/z-admin/` là một trang thật và có cửa đăng nhập riêng, nên lối tắt ấy chỉ
   còn là cửa thứ hai cho cùng một việc — mà cửa thứ hai là cửa có ngày bị
   quên khi sửa cửa thứ nhất. Bỏ nó đi cũng gỡ luôn file này khỏi mọi trang
   bài: người đọc thôi tải một thứ chỉ chủ trang mới dùng tới.

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

  /* Chỗ cắm duy nhất: ô `[data-duyet-host]` của /z-admin/. */
  function oCamSan() { return document.querySelector('[data-duyet-host]'); }

  function mo() {
    if (hop) return;
    var o = oCamSan();
    if (!o) return;
    hop = document.createElement('section');
    hop.className = 'bl-duyet';
    o.appendChild(hop);
    ve();
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
  /* Chưa vào được thì KHÔNG vẽ khung xin khoá ở đây: cửa chung của /z-admin/
     đã hỏi rồi, và chưa vào thì cả ngăn này còn chưa được bày ra. Chỉ giữ chỗ
     in một câu báo khi máy chủ từ chối giữa chừng. */
  function veKhoa(loi) {
    hop.textContent = '';
    dungDongHo();
    if (!loi) return;
    var b = de(loi);
    b.className = 'bl-duyet-bao bl-duyet-bao--hong';
    hop.appendChild(b);
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

  /* ── LỌC: CHỜ DUYỆT · ĐÃ DUYỆT · TẤT CẢ ──
     Mặc định là CHỜ DUYỆT. Đây là khác biệt lớn nhất khi hàng chờ dài ra: bản
     trước đổ nguyên cả danh sách theo thứ tự máy chủ trả về, nên hai chục dòng
     cần bấm nằm rải giữa một chục dòng đã xong — và cái đã xong thì chiếm đúng
     chừng ấy chỗ với cái chưa. Đo trên 34 bình luận: 4.700px cuộn, mà việc
     thật chỉ nằm ở 22 dòng.

     Bàn duyệt là chỗ để LÀM XONG một việc, không phải chỗ để xem lại. Thứ đã
     duyệt vẫn mở ra được — chỉ là không nằm chắn đường nữa. */
  var loc = 'cho';   /* 'cho' | 'roi' | '' (tất cả) */
  var MOI_LUOT = 25; /* dựng bấy nhiêu dòng một lần, còn lại chờ bấm "thêm" */
  var hienToi = MOI_LUOT;
  var dsHienTai = [];

  function veHang(ds) {
    dsHienTai = ds;
    var cho = ds.filter(function (c) { return !c.duyet; });
    var roi = ds.length - cho.length;
    hop.textContent = '';
    hop.appendChild(de(L('queue') + (cho.length ? ' (' + cho.length + ')' : '')));

    if (!ds.length) {
      var trong = document.createElement('p');
      trong.className = 'bl-duyet-bao';
      trong.textContent = L('queueEmpty');
      hop.appendChild(trong);
      batDongHo();
      return;
    }

    /* Hàng chip cùng khuôn với ngăn Post — hai bàn làm việc cạnh nhau thì
       không nên có hai kiểu lọc khác nhau. */
    var hangChip = document.createElement('div');
    hangChip.className = 'vb-loc bl-duyet-loc';
    [['cho', L('fPending'), cho.length],
     ['roi', L('fDone'), roi],
     ['',    L('fAll'), ds.length]].forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (loc === x[0] ? ' chip--nay' : '');
      b.textContent = x[1];
      var s = document.createElement('span');
      s.className = 'chip-so'; s.textContent = x[2];
      b.appendChild(s);
      b.addEventListener('click', function () {
        loc = x[0]; hienToi = MOI_LUOT; veHang(dsHienTai);
      });
      hangChip.appendChild(b);
    });
    hop.appendChild(hangChip);

    var loc1 = ds.filter(function (c) {
      return !loc || (loc === 'cho' ? !c.duyet : !!c.duyet);
    });

    if (!loc1.length) {
      var trong2 = document.createElement('p');
      trong2.className = 'bl-duyet-bao';
      trong2.textContent = L('queueEmpty');
      hop.appendChild(trong2);
      batDongHo();
      return;
    }

    loc1.slice(0, hienToi).forEach(function (c) { hop.appendChild(veDong(c)); });

    /* Trần 25 dòng một lượt: mỗi dòng chở tên, đường dẫn, nguyên nội dung và
       hai cái nút, nên hai trăm dòng là hai trăm lần dựng DOM cho một màn hình
       chỉ hiện được bốn. */
    if (loc1.length > hienToi) {
      var them = document.createElement('button');
      them.type = 'button';
      them.className = 'vb-nho bl-duyet-them';
      them.textContent = L('more') + ' (' + (loc1.length - hienToi) + ')';
      them.addEventListener('click', function () {
        hienToi += MOI_LUOT; veHang(dsHienTai);
      });
      hop.appendChild(them);
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

  mo();

  /* Khoá đổi ở đâu cũng vẽ lại ở đây. Quan trọng nhất là chiều ĐĂNG XUẤT:
     hàng chờ duyệt đang bày đầy tên và nội dung bình luận chưa duyệt ra màn
     hình, mà bấm Đăng xuất xong nó vẫn nằm đó cho tới nhịp hỏi máy chủ kế
     tiếp thì "đăng xuất" chỉ là một cái nút không làm gì trong hai mươi giây. */
  if (K) K.theoDoi(function () { if (hop) ve(); });
})();
