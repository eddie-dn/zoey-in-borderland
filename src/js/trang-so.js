/* ============================================================
   TRANG SỐ — cắt danh sách dài thành từng trang, có số để bấm.

   ── VÌ SAO CẮT Ở TRÌNH DUYỆT CHỨ KHÔNG CẮT LÚC DỰNG ────────────────────
   Cách quen thuộc là dựng sẵn /posts/, /posts/2/, /posts/3/… Không làm thế,
   vì hai lẽ:

   1. NGƯỜI ĐỌC ĐƯỢC CHỌN SỐ BÀI MỖI TRANG. Cắt lúc dựng thì mỗi lựa chọn là
      một bộ file riêng — 10, 20, 50 bài mỗi trang là ba bộ, và số file nhân
      lên theo từng chuyên mục, từng tag.
   2. KHÔNG TẢI LẠI TRANG. Bấm sang trang 2 là đổi ngay, không chờ mạng.

   Cái giá phải trả: mọi bài đều nằm sẵn trong HTML. Với blog cá nhân vài
   trăm bài thì đó là vài chục KB — rẻ hơn nhiều so với một vòng mạng. Tới
   khi kho bài lớn tới mức HTML nặng thật thì mới phải đổi cách.

   ── KHÔNG CÓ JAVASCRIPT THÌ SAO ────────────────────────────────────────
   Thấy ĐỦ mọi bài, không có bộ số trang. Đó là trạng thái đúng: danh sách
   đầy đủ vẫn đọc được, chỉ là dài. Máy tìm kiếm cũng đọc được trọn danh
   sách thay vì phải mò theo từng trang.
   ============================================================ */
(function () {
  'use strict';

  var KHO = 'zoey:moi-trang';          /* nhớ lựa chọn của người đọc */
  var CHON = [10, 20, 50, 0];          /* 0 = tất cả */

  function doc(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function dung(hop) {
    var chon = hop.getAttribute('data-phan-trang') || '';
    var mon  = [].slice.call(hop.querySelectorAll(chon));
    if (!mon.length) return;

    /* ── DỰNG LẠI KHI DANH SÁCH ĐỔI ──
       Trang ghi chú vừa phân trang vừa lọc theo loại. Hai thứ ấy đều giấu bớt
       mục, mà `mon` thì chỉ quét MỘT LẦN lúc dựng — nên lọc xong là bộ số
       trang đếm theo danh sách cũ, và có lúc trang 2 rỗng trơn trong khi số
       vẫn ghi là còn.

       Nghe một sự kiện riêng thay vì để ghi-chu.js thò tay vào bên trong: file
       này vẫn là chỗ duy nhất biết cách chia trang, còn bên kia chỉ nói "danh
       sách đổi rồi". */
    hop.addEventListener('trang-so:dung-lai', function () {
      mon = [].slice.call(hop.querySelectorAll(chon));
      trang = 1;
      ve();
    });

    var nhan = {};
    try { nhan = JSON.parse(hop.getAttribute('data-nhan') || '{}'); } catch (e) {}

    /* Nhóm (ví dụ khối từng năm ở trang lưu trữ): nhóm nào không còn bài nào
       hiện trên trang này thì giấu luôn cả cái đầu đề năm — để lại thì trang 2
       mở ra thấy một cái "2017" trống trơn. */
    var nhom = [].slice.call(hop.querySelectorAll('[data-nhom]'));

    var macDinh = Math.max(1, parseInt(hop.getAttribute('data-moi-trang'), 10) || 10);
    var luu = parseInt(doc(KHO), 10);
    var moiTrang = (CHON.indexOf(luu) >= 0) ? luu : macDinh;
    var trang = 1;

    /* ── khung điều khiển ── */
    var nav = document.createElement('nav');
    nav.className = 'pt';
    nav.setAttribute('aria-label', nhan.pages || 'Pages');

    var so = document.createElement('div');
    so.className = 'pt-so';

    var chonCo = document.createElement('label');
    chonCo.className = 'pt-chon';
    var chuChon = document.createElement('span');
    chuChon.textContent = nhan.perPage || 'Per page';
    var sel = document.createElement('select');
    CHON.forEach(function (n) {
      var o = document.createElement('option');
      o.value = String(n);
      o.textContent = n ? String(n) : (nhan.all || 'All');
      sel.appendChild(o);
    });
    sel.value = String(moiTrang);
    chonCo.appendChild(chuChon);
    chonCo.appendChild(sel);

    nav.appendChild(so);
    nav.appendChild(chonCo);
    hop.appendChild(nav);

    function tongTrang() {
      return moiTrang ? Math.max(1, Math.ceil(mon.length / moiTrang)) : 1;
    }

    /* Dãy số trang có rút gọn: 1 … 4 5 6 … 12. Không rút thì blog trăm bài ra
       một hàng số dài hơn cả danh sách. */
    function daySo(nay, tong) {
      if (tong <= 7) {
        var a = []; for (var i = 1; i <= tong; i++) a.push(i); return a;
      }
      var r = [1];
      var dau = Math.max(2, nay - 1), cuoi = Math.min(tong - 1, nay + 1);
      if (dau > 2) r.push('…');
      for (var j = dau; j <= cuoi; j++) r.push(j);
      if (cuoi < tong - 1) r.push('…');
      r.push(tong);
      return r;
    }

    function veSo() {
      var tong = tongTrang();
      so.textContent = '';
      if (tong <= 1) return;

      so.appendChild(nut('‹', trang > 1 ? trang - 1 : 0, nhan.prevPage || 'Previous', 'pt-nut pt-nut--lui'));
      daySo(trang, tong).forEach(function (x) {
        if (x === '…') {
          var s = document.createElement('span');
          s.className = 'pt-lung'; s.textContent = '…';
          s.setAttribute('aria-hidden', 'true');
          so.appendChild(s);
          return;
        }
        so.appendChild(nut(String(x), x, null, 'pt-nut' + (x === trang ? ' pt-nut--nay' : '')));
      });
      so.appendChild(nut('›', trang < tong ? trang + 1 : 0, nhan.nextPage || 'Next', 'pt-nut pt-nut--toi'));
    }

    function nut(chu, di, nhanPhu, lop) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = lop;
      b.textContent = chu;
      if (nhanPhu) b.setAttribute('aria-label', nhanPhu);
      if (!di) { b.disabled = true; return b; }
      if (di === trang) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', function () { di_(di); });
      return b;
    }

    function di_(n) {
      trang = n;
      ve();
      /* Cuộn về đầu danh sách, không cuộn về đầu TRANG: đầu trang là tiêu đề
         và hàng chip, mà người bấm sang trang 2 muốn thấy bài chứ không muốn
         xem lại cái tiêu đề. */
      var y = hop.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    function ve() {
      var tong = tongTrang();
      if (trang > tong) trang = tong;
      var a = moiTrang ? (trang - 1) * moiTrang : 0;
      var b = moiTrang ? a + moiTrang : mon.length;

      for (var i = 0; i < mon.length; i++) mon[i].hidden = !(i >= a && i < b);

      for (var k = 0; k < nhom.length; k++) {
        nhom[k].hidden = !nhom[k].querySelector(chon + ':not([hidden])');
      }
      veSo();
    }

    sel.addEventListener('change', function () {
      moiTrang = parseInt(sel.value, 10) || 0;
      ghi(KHO, String(moiTrang));
      trang = 1;
      ve();
    });

    ve();
  }

  var ds = document.querySelectorAll('[data-phan-trang]');
  for (var i = 0; i < ds.length; i++) dung(ds[i]);
})();
