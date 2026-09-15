/* ============================================================
   QUOTE — trích dẫn theo ngày: cả ngày một câu, sang ngày mới đổi câu.

   Tách khỏi reveal.js vì hai việc ấy không còn đi cùng nhau nữa: trích dẫn
   giờ nằm cả ở màn đầu trang chủ, còn hiệu ứng hiện-dần-khi-cuộn thì chỉ có
   ở khung `chuong` của trang tĩnh. Nhét chung một file thì trang chủ phải tải
   cả đoạn mã nó không dùng, và cái tên file thành nói dối.
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

      /* ── BƯỚC: mỗi ngày một câu, HOẶC cứ mấy trang một câu ──
         `data-nhip="2"` nghĩa là cứ hai trang người đọc đi qua thì sang câu kế.
         Đếm trong sessionStorage chứ không localStorage: "hai trang" là chuyện
         của một lượt ghé thăm, không phải của cả đời cái máy — đóng trình duyệt
         rồi mở lại thì đếm lại từ đầu, đúng như người đọc cảm nhận.

         Vẫn cộng thêm số ngày vào bước, nên hai người mở cùng một trang ở hai
         ngày khác nhau không gặp cùng một câu. */
      var nhip = parseInt(hop.getAttribute('data-nhip'), 10) || 0;
      var buoc = ngayThu();
      if (nhip) {
        var dem = 0;
        try {
          dem = (parseInt(sessionStorage.getItem('zoey:trang'), 10) || 0) + 1;
          sessionStorage.setItem('zoey:trang', String(dem));
        } catch (e) { dem = 1; }
        buoc += Math.floor((dem - 1) / nhip);
      }
      var homNay = laBai(N, Math.floor(buoc / N))[((buoc % N) + N) % N];
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

      /* Ngày theo GIỜ MÁY người đọc, dạng YYYY-MM-DD. Không dùng
         toISOString(): hàm đó trả giờ UTC, nên từ 0h tới 7h sáng giờ Việt Nam
         nó còn báo ngày hôm qua. */
      function nayLa() {
        var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
        var d = new Date();
        return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
      }

      function xinGemini(api) {
        var nay = nayLa();
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
        var dangXin = false;
        nut.addEventListener('click', function () {
          /* ── BẤM NÚT: XIN CÂU MỚI, NHƯNG KHÔNG ĐỂ AI PHẢI CHỜ ──

             Có lớp Gemini thì bấm nút là xin một câu VIẾT MỚI (`moi=1`, không
             cache) chứ không chỉ lật sang câu kế trong kho — đúng ý "random
             đổi mới chứ không chỉ dùng trong kho".

             Nhưng mạng có thể chậm, mà không ai đứng chờ một ô trích dẫn. Nên:
             chạy song song một cái hẹn 700ms. Gemini về trước thì hiện câu của
             Gemini; hẹn tới trước thì lật sang câu kế trong kho, và nếu Gemini
             về muộn thì chỉ NHÉT THÊM vào kho chứ không giật lại màn hình —
             chữ đang đọc dở mà tự đổi là thứ khó chịu hơn cả phải chờ.

             `dangXin` chặn bấm dồn: bấm năm cái liên tiếp mà bắn năm request
             thì vừa tốn vừa về lộn xộn không biết cái nào tới sau. */
          if (!hop.dataset.api || dangXin) { lat(); return; }

          dangXin = true;
          var xong = false;
          var henLat = setTimeout(function () {
            if (!xong) { xong = true; lat(); }
          }, 700);

          var ac = new AbortController();
          var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

          fetch(hop.dataset.api + '?moi=1&ngay=' + nayLa(),
                { signal: ac.signal, cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (kq) {
              if (!kq || !kq.ok || !kq.q) return;
              ds.push({ chu: kq.q, ai: kq.tacGia || '' });
              if (!xong) { xong = true; clearTimeout(henLat); dangO = ds.length - 1; ve(dangO, true); }
            })
            .catch(function () { /* im lặng — đã hoặc sắp lật sang câu trong kho */ })
            .finally(function () {
              clearTimeout(boCuoc);
              if (!xong) { xong = true; clearTimeout(henLat); lat(); }
              dangXin = false;
            });
        });
      }

      /* Lật sang câu kế trong kho. Đi vòng tròn thay vì bốc ngẫu nhiên: bốc
         ngẫu nhiên thì bấm ba lần có khi trúng lại câu cũ, người bấm tưởng
         nút hỏng. */
      function lat() {
        dangO = (dangO + 1) % ds.length;
        ve(dangO, true);
      }
    }
  }
})();
