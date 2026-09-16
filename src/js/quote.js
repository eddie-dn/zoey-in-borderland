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
         viết mới cho khung giờ đang tới lượt, đè lên câu vừa vẽ.

         Ba luật của lớp này:
           1. MỖI KHUNG GIỜ GỌI ĐÚNG MỘT LẦN. Cất vào localStorage theo cặp
              ngày+khung, tải lại trang là lấy từ đó — không gọi mạng lần nữa.
           2. HỎNG THÌ IM. Không có mạng, chưa deploy, chưa khai khoá, Gemini
              chậm — câu từ kho sẵn vẫn đang nằm đó, người đọc không thấy gì
              khác thường.
           3. BỎ CUỘC SAU 3 GIÂY. Lâu hơn thì thà giữ câu sẵn: không ai chờ
              một ô trích dẫn. */
      if (hop.dataset.api) xinGemini(hop.dataset.api);

      /* ══════════ MỐC GIỜ CHIA KHUNG ══════════

         Bản đầu là MỘT câu cho cả ngày. Đúng với cái tên "câu của hôm nay",
         nhưng người đọc quay lại buổi chiều thì gặp đúng câu ban sáng — ô
         trích dẫn thành một mảng trang trí chết. Nay chia ngày ra mấy khung,
         mỗi khung một câu mới: quay lại là có cái để đọc, mà vẫn không phải
         cái máy xổ số đổi câu mỗi lần F5.

         Đây là chỗ DUY NHẤT biết giờ giấc của người đọc. Hàm trên Cloudflare
         không tự tính được: nó chạy ở điểm biên nào thì mang giờ chỗ đó, nên
         cặp ngày+khung phải do TRANG gửi lên.

           1  cả ngày một câu — nếp cũ
           2  sáng · tối
           3  sáng · chiều · tối        ← mặc định
           4  sáng · trưa · chiều · tối

         Số này do build in ra `data-khung` từ `quoteAI.khung`. Thiếu thẻ ấy
         (chưa bật lớp Gemini, hoặc HTML dựng từ bản cũ) thì rơi về 1 — tức là
         y hệt nếp cũ, không phải hỏng. */
      var MOC_KHUNG = { 1: [0], 2: [5, 17], 3: [5, 12, 18], 4: [5, 11, 15, 20] };

      function p2(n) { return (n < 10 ? '0' : '') + n; }

      /* Dạng YYYY-MM-DD theo GIỜ MÁY người đọc. Không dùng toISOString(): hàm
         đó trả giờ UTC, nên từ 0h tới 7h sáng giờ Việt Nam nó còn báo ngày
         hôm qua. */
      function ymd(d) {
        return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
      }

      /* KHOÁ của câu đang tới lượt: { ngay, khung, so }.

         CHỖ DỄ SAI NHẤT — quãng 0h tới trước mốc đầu tiên. Người đọc lúc 1h
         sáng vẫn đang ở "buổi tối" theo cảm nhận, nhưng `getDate()` thì đã
         sang ngày mới. Tính thẳng thì họ nhảy sang một câu khác lúc nửa đêm,
         rồi 5h sáng lại nhảy tiếp — hai câu trong năm tiếng, đúng cái nhấp
         nháy mà cơ chế này sinh ra để tránh. Nên quãng ấy trả về khung CUỐI
         của HÔM QUA: câu giữ nguyên từ tối hôm trước tới sáng hôm sau.

         Với số khung = 1 thì mốc là [0], `gio >= 0` luôn đúng, không bao giờ
         lùi ngày — nếp cũ giữ nguyên từng chi tiết. */
      function moc() {
        var so = parseInt(hop.getAttribute('data-khung'), 10) || 1;
        var mo = MOC_KHUNG[so] || MOC_KHUNG[3];
        var d = new Date();
        var gio = d.getHours();
        var i = -1;
        for (var k = 0; k < mo.length; k++) if (gio >= mo[k]) i = k;
        if (i < 0) { d.setDate(d.getDate() - 1); i = mo.length - 1; }
        return { ngay: ymd(d), khung: i, so: mo.length };
      }

      /* Cả hai đường (tự xin lúc tải trang, và bấm nút) đều cất qua đây, nên
         chỉ có MỘT chỗ biết hình dạng của bản lưu. */
      function luu(x) {
        try { localStorage.setItem('zib-quote', JSON.stringify(x)); } catch (e) {}
        return x;
      }

      function dat(x) {
        /* Chèn vào ĐẦU danh sách và trỏ "hôm nay" vào nó, để nút đổi câu
           vẫn đi vòng qua cả kho sẵn như thường. */
        ds.unshift({ chu: x.q, ai: x.ai });
        homNay = 0; dangO = 0;
        ve(0, true);
      }

      function xinGemini(api) {
        var m = moc();

        /* Đã có câu của đúng khung giờ này thì dùng luôn, khỏi gọi mạng */
        try {
          var cu = JSON.parse(localStorage.getItem('zib-quote') || 'null');
          if (cu && cu.ngay === m.ngay && cu.khung === m.khung && cu.q) { dat(cu); return; }
        } catch (e) {}

        var ac = new AbortController();
        var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

        fetch(api + '?ngay=' + m.ngay + '&khung=' + m.khung + '&sokhung=' + m.so,
              { signal: ac.signal, cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (kq) {
            if (!kq || !kq.ok || !kq.q) return;
            dat(luu({ ngay: m.ngay, khung: m.khung, q: kq.q, ai: kq.tacGia || '' }));
          })
          .catch(function () { /* im lặng — câu từ kho sẵn vẫn đang hiện */ })
          .finally(function () { clearTimeout(boCuoc); });
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

          var m = moc();
          fetch(hop.dataset.api + '?moi=1&ngay=' + m.ngay + '&khung=' + m.khung +
                '&sokhung=' + m.so, { signal: ac.signal, cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (kq) {
              if (!kq || !kq.ok || !kq.q) return;
              /* Cất luôn vào localStorage đè lên câu của khung giờ này. Bản
                 trước không cất: bấm nút xin được câu mới, F5 một cái là mất,
                 và lần tải sau còn gọi mạng thêm một lượt nữa cho đúng cái
                 khung vừa xin xong. Người bấm nút là người đang muốn câu ĐÓ —
                 giữ lấy nó mới phải. */
              luu({ ngay: m.ngay, khung: m.khung, q: kq.q, ai: kq.tacGia || '' });
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
