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
     Chỗ nào không có cột trái riêng thì mượn đúng khung đăng nhập chung — cùng
     một khung, cùng một phép thử khoá, cùng một câu báo lỗi. */
  /* Chưa vào được thì KHÔNG vẽ khung xin khoá ở đây: cửa chung của /z-admin/
     đã hỏi rồi, và chưa vào thì cả ngăn này còn chưa được bày ra. Chỉ giữ chỗ
     in một câu báo khi máy chủ từ chối giữa chừng. */
  function veKhoa(loi) {
    hop.textContent = '';
    dungDongHo();
    if (!loi) return;
    var b = de(loi);
    b.className = 'bao bl-duyet-bao bao--hong';
    hop.appendChild(b);
  }

  /* ══════════ XIN HÀNG CHỜ ══════════ */

  function xin(lang) {
    if (dangXin) return;
    dangXin = true;
    if (!lang) {
      hop.textContent = '';
      var b = document.createElement('p');
      b.className = 'bao bl-duyet-bao';
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
        if (kq.hanRac) HAN_RAC = kq.hanRac;
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
  var loc = 'cho';   /* 'cho' | 'roi' | '' (tất cả) | 'rac' (thùng rác) */
  /* Số ngày một bình luận nằm trong thùng rác trước khi bị xoá cứng. Máy chủ
     gửi kèm con số thật (`hanRac`); 30 chỉ là giá trị chờ. */
  var HAN_RAC = 30;
  var MOI_LUOT = 25; /* dựng bấy nhiêu dòng một lần, còn lại chờ bấm "thêm" */
  var hienToi = MOI_LUOT;
  var dsHienTai = [];

  function veHang(ds) {
    dsHienTai = ds;
    /* ── THÙNG RÁC LÀ MỘT NGĂN RIÊNG, KHÔNG NẰM TRONG "ALL" ──
       "All" là mọi thứ ĐANG SỐNG trên trang. Cho thùng rác vào đó thì bấm All
       là thấy lẫn cái đã xoá với cái đang hiện, và một cú Approve hàng loạt
       ở All sẽ duyệt luôn cả rác. */
    var rac = ds.filter(function (c) { return !!c.an; });
    var song = ds.filter(function (c) { return !c.an; });
    var cho = song.filter(function (c) { return !c.duyet; });
    var roi = song.length - cho.length;
    hop.textContent = '';
    /* ── KHÔNG CÒN DÒNG "WAITING FOR REVIEW (n)" ──
       Nó nói lại đúng cái mà chip "Pending n" ngay dưới đã nói, mà nói bằng
       một dòng chữ to hơn — nên bàn duyệt mở ra là gặp hai lần cùng một con
       số, và cái đập vào mắt trước lại là cái nói ít hơn. Bỏ dòng, giữ chip:
       chip vừa là con số vừa là bộ lọc bấm được. */

    if (!ds.length) {
      var trong = document.createElement('p');
      trong.className = 'bao bl-duyet-bao';
      trong.textContent = L('queueEmpty');
      hop.appendChild(trong);
      batDongHo();
      return;
    }

    /* ── THANH CÔNG CỤ: TICK TẤT CẢ BÊN TRÁI, CHIP LỌC BÊN PHẢI ──
       Đúng một khuôn `.ad-thanh` với ngăn Post và ngăn Category — ba bàn làm
       việc cạnh nhau thì không được có ba kiểu thanh trên.

       Trước bản này hàng chip ở đây đứng một mình và dạt TRÁI, vì nó nằm
       ngoài `.ad-thanh` nên `margin-left:auto` của `.ad-loc` không có gì để
       đẩy. Đổi tab một cái là hàng lọc nhảy từ phải sang trái.

       Chỗ trống nửa trái nay là ô tick tất cả. Hai ngăn kia có nút New rồi ô
       tìm ở đó; ngăn này không có cả hai, mà nó có một việc riêng mà hai ngăn
       kia không có — duyệt cả bàn một lượt. */
    var thanh = document.createElement('div');
    thanh.className = 'ad-thanh';

    /* ── TICK TẤT CẢ ──
       Nó tick những dòng ĐANG HIỆN, tức trong bộ lọc hiện thời và trong trần
       25 dòng một lượt. Đó là nghĩa duy nhất đúng: các nút làm-hàng-loạt cũng
       chỉ chạy trên đúng bấy nhiêu dòng, nên "tất cả" mà rộng hơn cái mắt
       đang thấy thì thành một lời hứa hàm mà máy không giữ. */
    var oHet = document.createElement('label');
    oHet.className = 'ad-tick ad-tick--het';
    var tickHet = document.createElement('input');
    tickHet.type = 'checkbox';
    var chuHet = document.createElement('span');
    chuHet.textContent = L('pickAll', 'Select all');
    oHet.appendChild(tickHet);
    oHet.appendChild(chuHet);
    thanh.appendChild(oHet);

    var hangChip = document.createElement('div');
    hangChip.className = 'ad-loc';
    [['cho', L('fPending'), cho.length],
     ['roi', L('fDone'), roi],
     ['',    L('fAll'), song.length],
     ['rac', L('fTrash'), rac.length]].forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (loc === x[0] ? ' chip--nay' : '') +
                    (x[0] === 'rac' ? ' bl-chip-rac' : '');
      b.textContent = x[1];
      var s = document.createElement('span');
      s.className = 'chip-so'; s.textContent = x[2];
      b.appendChild(s);
      b.addEventListener('click', function () {
        loc = x[0]; hienToi = MOI_LUOT; veHang(dsHienTai);
      });
      hangChip.appendChild(b);
    });
    thanh.appendChild(hangChip);
    hop.appendChild(thanh);

    /* ── THANH LÀM HÀNG LOẠT ──
       Ẩn cho tới khi có ít nhất một dòng được tick. Bày sẵn một thanh trống
       thì nó chiếm một hàng ở đầu bảng suốt ngày để chờ một việc mỗi tuần làm
       vài lần — và người mới nhìn vào không biết nó dùng để làm gì. */
    var thanhChon = document.createElement('div');
    thanhChon.className = 'ad-chon-thanh';
    thanhChon.hidden = true;
    hop.appendChild(thanhChon);

    var loc1 = loc === 'rac' ? rac : song.filter(function (c) {
      return !loc || (loc === 'cho' ? !c.duyet : !!c.duyet);
    });

    /* Ngăn Trash nói luôn luật của nó, kể cả khi thùng rỗng: không ai đoán
       được là thứ nằm đây sẽ tự mất sau một tháng. */
    if (loc === 'rac') {
      var luat = document.createElement('p');
      luat.className = 'bl-rac-luat';
      luat.textContent = L('trashNote').replace('{n}', HAN_RAC);
      hop.appendChild(luat);
    }

    if (!loc1.length) {
      tickHet.disabled = true;
      var trong2 = document.createElement('p');
      trong2.className = 'bao bl-duyet-bao';
      trong2.textContent = loc === 'rac' ? L('trashEmpty') : L('queueEmpty');
      hop.appendChild(trong2);
      batDongHo();
      return;
    }

    /* ── CÁC HÀNG NẰM CHUNG MỘT KHUNG `.ad-bang` ──
       Đúng khuôn của ngăn Post. Trước bản này các hàng là con trực tiếp của
       `.bl-duyet` — một cột `flex` có `gap` — nên giữa hai hàng hở ra một
       khe, và hàng nào đang được tick thì nền màu của nó đứng lơ lửng giữa
       hai khe ấy thay vì liền thành một dải. */
    var bang = document.createElement('div');
    bang.className = 'ad-bang';
    hop.appendChild(bang);
    var dsDong = loc1.slice(0, hienToi).map(function (c) {
      var d = veDong(c);
      bang.appendChild(d);
      return d;
    });

    function dangChon() {
      return dsDong.filter(function (d) { return d.oTick && d.oTick.checked; });
    }

    tickHet.addEventListener('change', function () {
      var bat = tickHet.checked;
      dsDong.forEach(function (d) {
        if (!d.oTick) return;
        d.oTick.checked = bat;
        d.classList.toggle('ad-dong--dang-chon', bat);
      });
      veThanhChon();
    });

    /* ── LÀM HÀNG LOẠT: GỬI TỪNG CÁI, KHÔNG GỬI MỘT GÓI ──
       Máy chủ nhận mỗi lượt một bình luận (`PATCH` với một `ma`). Dựng thêm
       một cửa nhận cả mảng thì phải viết thêm cả đường xử lý lỗi một-phần —
       "ba cái xong, hai cái hỏng" là trạng thái khó báo và khó sửa.

       Gửi tuần tự từng cái: chậm hơn vài trăm mili giây, nhưng hỏng ở cái nào
       thì biết đúng cái ấy, và những cái đã xong vẫn xong. */
    /* `nhan` rỗng = không hỏi lại. Vào thùng rác thì cứu lại được, nên
       không có hộp hỏi; xoá vĩnh viễn thì không cứu được, nên luôn hỏi. */
    function lamHangLoat(than, nhan) {
      var ds2 = dangChon();
      if (!ds2.length) return;
      if (nhan && !window.confirm(nhan.replace('{n}', ds2.length))) return;
      thanhChon.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      var i = 0;
      (function ke() {
        if (i >= ds2.length) { xin(true); return; }
        var d = ds2[i++];
        d.classList.add('ad-dong--xong');
        if (than === 'vinhVien') xoaHan(d.duLieu.ma, ke);
        else doi(Object.assign({ ma: d.duLieu.ma }, than), ke);
      })();
    }

    function veThanhChon() {
      var n = dangChon().length;
      /* ── BA TRẠNG THÁI, KHÔNG PHẢI HAI ──
         Tick vài dòng bằng tay thì ô "tất cả" phải nói "một phần" — `checked`
         là nói sai (chưa tick hết), mà bỏ trống cũng là nói sai (đã tick mấy
         cái rồi). `indeterminate` là trạng thái thứ ba, và trình duyệt vẽ nó
         thành một gạch ngang.

         Nó không phải một thuộc tính HTML, chỉ là một tính chất của phần tử,
         nên phải gán lại bằng tay mỗi lần vẽ. */
      tickHet.checked = n > 0 && n === dsDong.length;
      tickHet.indeterminate = n > 0 && n < dsDong.length;
      thanhChon.hidden = !n;
      if (!n) return;
      thanhChon.innerHTML = '';
      var dem = document.createElement('span');
      dem.className = 'ad-chon-dem';
      dem.textContent = L('picked', '{n} selected').replace('{n}', n);
      thanhChon.appendChild(dem);

      /* ── KHÔNG CÒN NÚT "CLEAR" ──
         Bỏ tick hết đã có ô Select all ngay phía trên làm (bấm một lần nữa
         là bỏ). Chỗ cuối thanh nhường cho Delete — việc hay làm hơn hẳn.

         Ở ngăn Trash, thanh đổi sang hai việc của thùng rác. */
      var viec = loc === 'rac'
        ? [[L('restore'), { an: 0 }, '', ' ad-lenh--chinh'],
           [L('purge'), 'vinhVien', L('askPurge'), ' ad-lenh--xoa']]
        : [[L('approve'), { duyet: 1 }, L('askApprove'), ' ad-lenh--chinh'],
           [L('unapprove'), { duyet: 0 }, L('askUnapprove'), ''],
           [L('del'), { an: 1 }, '', ' ad-lenh--xoa']];
      var cum = document.createElement('span');
      cum.className = 'ad-chon-viec';
      viec.forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ad-lenh' + x[3];
        b.textContent = x[0];
        b.addEventListener('click', function () { lamHangLoat(x[1], x[2]); });
        cum.appendChild(b);
      });
      thanhChon.appendChild(cum);
    }
    /* `veDong` gọi tới nó mỗi lần một ô tick đổi — gán vào chỗ dùng chung để
       hàm kia với được. */
    veThanhChonHienTai = veThanhChon;

    /* Trần 25 dòng một lượt: mỗi dòng chở tên, đường dẫn, nguyên nội dung và
       hai cái nút, nên hai trăm dòng là hai trăm lần dựng DOM cho một màn hình
       chỉ hiện được bốn. */
    if (loc1.length > hienToi) {
      var them = document.createElement('button');
      them.type = 'button';
      them.className = 'ad-lenh bl-duyet-them';
      them.textContent = L('more') + ' (' + (loc1.length - hienToi) + ')';
      them.addEventListener('click', function () {
        hienToi += MOI_LUOT; veHang(dsHienTai);
      });
      hop.appendChild(them);
    }

    batDongHo();
  }

  /* ── MỘT HÀNG BÌNH LUẬN, ĐÚNG KHUÔN BẢNG LÀM VIỆC ──
     Đời trước mỗi bình luận là một KHỐI XẾP DỌC: tên và đường dẫn một hàng,
     nội dung một hàng, rồi một nút Approve tô đầy chiếm gần nửa bề ngang. Bốn
     bình luận là hết một màn hình — mà bàn duyệt là chỗ cần liếc qua hai chục
     cái một lượt rồi mới quyết.

     Nay dùng chung `.ad-dong` với ngăn Post và ngăn Category: bốn cột, một
     hàng một bình luận. Bản đồ cột ở đầu khối `.ad-*` trong list.css.

       phụ     → tên người gửi
       chính   → nội dung, và đường dẫn trang ở dòng dưới
       cd      → chờ / đã duyệt
       nút     → Approve · Hide

     Approve thôi là nút tô đầy: mười lăm hàng là mười lăm viên thuốc, và lúc
     ấy bảng đọc ra là một cái lưới nút chứ không phải một danh sách. Nó vẫn
     nổi hơn Hide, bằng màu (`.ad-lenh--chinh`). */
  /* `veDong` dựng từng hàng, còn thanh làm-hàng-loạt sống trong `veHang`.
     Một biến dùng chung là cầu nối giữa hai chỗ ấy: đơn giản hơn việc chuyền
     một hàm qua bốn tầng gọi, và ở một file một trang thì rõ hơn. */
  var veThanhChonHienTai = function () {};
  function veThanhChon() { veThanhChonHienTai(); }

  function veDong(c) {
    var d = document.createElement('div');
    d.className = 'ad-dong ad-dong--hai ad-dong--chon' +
                  (c.duyet && !c.an ? ' ad-dong--roi' : '');

    /* ── Ô TICK ──
       Duyệt bình luận là việc LÀM HÀNG LOẠT: mở bàn duyệt ra thường có mươi
       cái spam giống hệt nhau và vài cái thật. Bấm Approve từng dòng một là
       mươi cú bấm cho một quyết định duy nhất.

       `<label>` bọc ngoài để vùng bấm rộng hơn cái ô 14px — trên điện thoại
       một ô vuông 14px là thứ bấm ba lần trúng một. */
    var oTick = document.createElement('label');
    oTick.className = 'ad-tick';
    var tick = document.createElement('input');
    tick.type = 'checkbox';
    tick.setAttribute('aria-label', L('pick', 'Select') + ' — ' + (c.ten || L('anon')));
    tick.addEventListener('change', function () {
      d.classList.toggle('ad-dong--dang-chon', tick.checked);
      veThanhChon();
    });
    oTick.appendChild(tick);
    d.oTick = tick;
    d.duLieu = c;

    var ai = document.createElement('span');
    ai.className = 'ad-phu';
    ai.textContent = c.ten || L('anon');

    var giua = document.createElement('span');
    giua.className = 'ad-chinh';
    /* textContent, KHÔNG BAO GIỜ innerHTML — chữ này do người lạ gõ. Luật ấy
       đúng ở đây gấp đôi: "chỗ chỉ mình đọc" mới là chỗ kẻ gửi spam nhắm tới. */
    giua.textContent = c.chu;

    var o = document.createElement('a');
    o.className = 'ad-mo';
    o.href = c.trang; o.textContent = c.trang;
    giua.appendChild(o);

    /* ── CHỈ ĐÁNH DẤU CÁI LỆCH KHỎI BÌNH THƯỜNG ──
       Trước bản này mỗi hàng in một chữ: LIVE xanh hoặc PENDING cam. Mười lăm
       hàng là mười lăm nhãn, mà mười ba cái trong đó nói "bình thường" —
       nghĩa là cột ấy gần như chỉ có nhiễu, và đúng cái đáng thấy thì không
       nổi hơn được bao nhiêu.

       Ngăn Post đã theo luật này từ trước: bài đang hiện không có huy hiệu
       nào, chỉ Nháp với Ẩn mới có. Bàn duyệt nay theo cùng luật — hàng đã
       duyệt để trắng (nó còn mờ đi .55 nhờ `.ad-dong--roi`, và nút của nó đọc
       ra là "Unapprove", nên không thiếu chỗ nào nói nó đã xong).

       Ô vẫn phải còn kể cả khi rỗng: nó giữ bề rộng cho cột nút phía sau. */
    var cd = document.createElement('span');
    cd.className = 'ad-cd';
    if (c.an) {
      /* Trong thùng rác thì cột trạng thái đếm ngược: còn mấy ngày nữa là
         mất hẳn. Ba ngày cuối đổi sang màu báo động. */
      var con = conNgay(c);
      var hr = document.createElement('span');
      hr.className = 'badge' + (con <= 3 ? ' badge--bad' : '');
      hr.textContent = L('daysLeft').replace('{n}', con);
      hr.title = L('trashNote').replace('{n}', HAN_RAC);
      cd.appendChild(hr);
    } else if (!c.duyet) {
      var hh = document.createElement('span');
      hh.className = 'badge badge--warn';
      hh.textContent = L('stateOff', 'Pending');
      cd.appendChild(hh);
    }

    var nut = document.createElement('span');
    nut.className = 'ad-lenh-hang';

    /* Trượt đi rồi mới rút khỏi danh sách — cùng nhịp với mọi hàng khác ở
       bảng làm việc. Biến mất phụt một cái thì mắt không kịp thấy hàng nào
       vừa đi, và cả bảng nhảy lên một nấc mà không rõ vì sao. */
    function rut(b, viec) {
      b.disabled = true;
      d.classList.add('ad-dong--xong');
      viec(function () { setTimeout(function () { xin(true); }, 200); });
    }

    var bDuyet = document.createElement('button');
    bDuyet.type = 'button'; bDuyet.className = 'ad-lenh ad-lenh--chinh';
    var bXoa = document.createElement('button');
    bXoa.type = 'button'; bXoa.className = 'ad-lenh ad-lenh--xoa';

    if (c.an) {
      bDuyet.textContent = L('restore');
      bDuyet.addEventListener('click', function () {
        rut(bDuyet, function (xong) { doi({ ma: c.ma, an: 0 }, xong); });
      });
      bXoa.textContent = L('purge');
      bXoa.addEventListener('click', function () {
        if (!window.confirm(L('askPurge').replace('{n}', 1))) return;
        rut(bXoa, function (xong) { xoaHan(c.ma, xong); });
      });
    } else {
      bDuyet.textContent = c.duyet ? L('unapprove') : L('approve');
      bDuyet.addEventListener('click', function () {
        bDuyet.disabled = true;
        doi({ ma: c.ma, duyet: c.duyet ? 0 : 1 }, function () { xin(true); });
      });
      /* ── DELETE THAY CHO HIDE ──
         Hide cũ đặt `an = 1` rồi thôi: bình luận biến khỏi cả trang lẫn bàn
         duyệt, không đường nào cứu lại. Nay cùng cờ ấy nghĩa là "nằm trong
         thùng rác", có đồng hồ 30 ngày và nút Restore — nên nó là Delete,
         và giữ thêm một nút Hide làm đúng việc ấy chỉ là hai tên cho một
         việc. (Muốn tạm cất khỏi trang mà không xoá thì đã có Unapprove.) */
      bXoa.textContent = L('del');
      bXoa.addEventListener('click', function () {
        rut(bXoa, function (xong) { doi({ ma: c.ma, an: 1 }, xong); });
      });
    }

    nut.appendChild(bDuyet); nut.appendChild(bXoa);
    d.appendChild(oTick);
    d.appendChild(ai); d.appendChild(giua); d.appendChild(cd); d.appendChild(nut);
    return d;
  }

  /* Số ngày còn lại trước khi một dòng trong thùng rác bị xoá cứng. Không
     bao giờ âm: máy chủ dọn dòng quá hạn mỗi lượt đọc, nên con số 0 chỉ có
     trong vài phút giữa hai lượt. */
  function conNgay(c) {
    var t = Date.parse(c.xoaLuc || '');
    if (isNaN(t)) return HAN_RAC;
    return Math.max(0, Math.ceil(HAN_RAC - (Date.now() - t) / 864e5));
  }

  /* Xoá vĩnh viễn — chỉ có ở ngăn Trash. Máy chủ chỉ xoá dòng đã nằm trong
     thùng, nên lỡ gửi nhầm mã cũng không xoá được bình luận đang sống. */
  function xoaHan(ma, xong) {
    fetch(API + '?ma=' + encodeURIComponent(ma) + '&vinhVien=1', {
      method: 'DELETE', headers: dauKhoa()
    }).then(function (r) { return r.json(); })
      .then(function (kq) { if (kq.ok) xong(); })
      .catch(function () {});
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
