/* ============================================================
   REVEAL — hai việc của trang giới thiệu:
     1. TRÍCH DẪN THEO NGÀY  — cả ngày một câu, sang ngày mới đổi câu
     2. HIỆN DẦN KHI CUỘN    — cho khung "chuong"
   ============================================================ */
(function () {
  'use strict';

  /* ══════════ 1. TRÍCH DẪN THEO NGÀY ══════════

     KHÔNG dùng Math.random(). "Random mỗi ngày" nghĩa là cả ngày MỘT câu, chứ
     không phải đổi câu mỗi lần tải lại trang — đổi liên tục thì nó không còn
     là "câu của hôm nay" nữa, chỉ là một cái máy xổ số.

     Cách làm: CHIA BÀI, không phải chia dư.

     Bản đầu băm chuỗi ngày rồi lấy dư theo số câu. Đo ra hỏng: 7 ngày liên
     tiếp cho [1,2,3,4,1,2,10] — vừa đi gần như tuần tự, vừa TRÙNG CÂU HAI LẦN
     trong một tuần. Lý do: hai ngày liền nhau chỉ khác một ký tự, và phần bit
     thấp của hàm băm không xáo đủ mạnh để dấu điều đó sau phép chia dư.

     Cách đúng: coi kho câu như một CỖ BÀI. Mỗi vòng N ngày xáo lại một lần,
     rồi mỗi ngày rút một lá theo thứ tự. Nhờ vậy:
       · mỗi câu xuất hiện ĐÚNG MỘT LẦN trong mỗi N ngày — không bao giờ trùng
       · mỗi vòng xáo một kiểu khác, không thành lịch cố định
       · vẫn hoàn toàn tất định: cùng ngày, mọi máy ra cùng câu, không cần lưu gì

     Ngày lấy theo GIỜ MÁY người đọc, không phải UTC: người ở Hà Nội sang ngày
     mới lúc 0h Hà Nội, không phải 7h sáng. */
  var hop = document.querySelector('[data-quote]');

  /* Bộ sinh số giả ngẫu nhiên tất định — mulberry32. Cùng một hạt giống thì
     luôn ra cùng một dãy số, nên "xáo bài" ở máy nào cũng ra thứ tự y hệt. */
  function sinh(hat) {
    return function () {
      hat = (hat + 0x6D2B79F5) >>> 0;
      var t = hat;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Ngày thứ mấy tính từ mốc, theo GIỜ MÁY người đọc — người ở Hà Nội sang
     ngày mới lúc 0h Hà Nội, không phải 7h sáng như nếu tính theo UTC. */
  function ngayThu() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  /* Xáo Fisher–Yates với hạt giống là số thứ tự VÒNG. */
  function xaoBai(n, vong) {
    var r = sinh(((vong + 1) * 2654435761) >>> 0);
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(r() * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }

  /* CHỖ NỐI GIỮA HAI VÒNG — cái bẫy kinh điển của kiểu xáo bài này.

     Mỗi vòng riêng lẻ thì không câu nào trùng. Nhưng lá CUỐI của vòng này và
     lá ĐẦU của vòng sau được xáo độc lập, nên hoàn toàn có thể trùng nhau —
     và người đọc thấy đúng một câu hai ngày liền, tức là thấy đúng cái mà cả
     cơ chế này sinh ra để tránh. Đo ra: khoảng cách gần nhất giữa hai lần
     trùng là 1 ngày.

     Chữa: nếu lá đầu vòng mới trùng lá cuối vòng trước thì đổi chỗ nó với lá
     thứ hai. Vẫn tất định, vẫn đủ cả N câu, và khoảng cách gần nhất thành 2. */
  function laBai(n, vong) {
    var a = xaoBai(n, vong);
    if (n > 2) {
      var truoc = xaoBai(n, vong - 1);
      if (a[0] === truoc[n - 1]) { var t = a[0]; a[0] = a[1]; a[1] = t; }
    }
    return a;
  }

  if (hop) {
    var ds = [];
    try { ds = JSON.parse(hop.dataset.quote) || []; } catch (e) {}

    if (ds.length) {
      var elChu = hop.querySelector('.q-chu');
      var elAi  = hop.querySelector('.q-ai');
      var nut   = hop.querySelector('.q-nut');
      var N      = ds.length;
      var ngay   = ngayThu();
      var homNay = laBai(N, Math.floor(ngay / N))[((ngay % N) + N) % N];
      var dangO  = homNay;

      function ve(i, doiTay) {
        var q = ds[i];
        hop.classList.add('q-mo');
        setTimeout(function () {
          elChu.textContent = q.chu;                 /* textContent, không innerHTML */
          elAi.textContent  = q.ai || '';
          elAi.hidden = !q.ai;
          hop.classList.toggle('q-khac', i !== homNay);
          hop.classList.remove('q-mo');
        }, doiTay ? 180 : 0);
      }
      ve(homNay, false);

      /* ── LỚP GEMINI (tuỳ chọn) ──
         Kho câu nhúng sẵn ở trên LUÔN chạy, không cần mạng, không cần khoá.
         Nếu trang có /api/quote và đã khai khoá Gemini thì xin thêm một câu
         viết mới cho hôm nay, đè lên câu vừa vẽ.

         Ba luật của lớp này:
           1. MỖI NGÀY GỌI ĐÚNG MỘT LẦN. Cất vào localStorage theo ngày, tải
              lại trang là lấy từ đó — không gọi mạng lần nữa.
           2. HỎNG THÌ IM. Không có mạng, chưa deploy, chưa khai khoá, Gemini
              chậm — câu từ kho sẵn vẫn đang nằm đó, người đọc không thấy gì
              khác thường.
           3. BỎ CUỘC SAU 3 GIÂY. Lâu hơn thì thà giữ câu sẵn: không ai chờ
              một ô trích dẫn. */
      if (hop.dataset.api) xinGemini(hop.dataset.api);

      function xinGemini(api) {
        var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
        var d = new Date();
        var nay = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
        var KHOA = 'zib-quote';

        /* Đã có câu của đúng hôm nay thì dùng luôn, khỏi gọi mạng */
        try {
          var cu = JSON.parse(localStorage.getItem(KHOA) || 'null');
          if (cu && cu.ngay === nay && cu.q) { dat(cu); return; }
        } catch (e) {}

        var ac = new AbortController();
        var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

        fetch(api + '?ngay=' + nay, { signal: ac.signal, cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (kq) {
            if (!kq || !kq.ok || !kq.q) return;
            var x = { ngay: nay, q: kq.q, ai: kq.tacGia || '' };
            try { localStorage.setItem(KHOA, JSON.stringify(x)); } catch (e) {}
            dat(x);
          })
          .catch(function () { /* im lặng — câu từ kho sẵn vẫn đang hiện */ })
          .finally(function () { clearTimeout(boCuoc); });

        function dat(x) {
          /* Chèn vào ĐẦU danh sách và trỏ "hôm nay" vào nó, để nút đổi câu
             vẫn đi vòng qua cả kho sẵn như thường. */
          ds.unshift({ chu: x.q, ai: x.ai });
          homNay = 0; dangO = 0;
          ve(0, true);
        }
      }

      if (nut) {
        nut.addEventListener('click', function () {
          /* Đi vòng tròn qua danh sách thay vì bốc ngẫu nhiên: bốc ngẫu nhiên
             thì bấm ba lần có khi trúng lại câu cũ, người bấm tưởng nút hỏng. */
          dangO = (dangO + 1) % ds.length;
          ve(dangO, true);
        });
      }
    }
  }

  /* ══════════ 2. HIỆN DẦN KHI CUỘN ══════════

     Các khối [data-hien] bắt đầu ở trạng thái mờ và thấp hơn 16px, hiện lên khi
     lọt vào tầm nhìn. unobserve ngay sau lần đầu: hiện rồi thì thôi, không cho
     nó mờ lại lúc cuộn ngược — chữ nhấp nháy khi cuộn lên là thứ gây khó chịu
     rõ rệt, và không ai cuộn ngược để xem lại hiệu ứng.

     Người bật "giảm chuyển động" thì hiện hết ngay, không animate gì. */
  var khoi = document.querySelectorAll('[data-hien]');
  if (!khoi.length) return;

  var itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (itMotion || !('IntersectionObserver' in window)) {
    khoi.forEach(function (el) { el.classList.add('hien'); });
    return;
  }

  var io = new IntersectionObserver(function (recs) {
    recs.forEach(function (r) {
      if (!r.isIntersecting) return;
      r.target.classList.add('hien');
      io.unobserve(r.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  khoi.forEach(function (el) { io.observe(el); });
})();
