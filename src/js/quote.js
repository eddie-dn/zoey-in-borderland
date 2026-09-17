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

      function ve(i, doiTay, moi) {
        var q = ds[i];
        hop.classList.add('q-mo');
        setTimeout(function () {
          elChu.textContent = q.chu;                 /* textContent, không innerHTML */
          elAi.textContent  = q.ai || '';
          elAi.hidden = !q.ai;
          hop.classList.toggle('q-khac', i !== homNay);
          /* `moi` = câu này vừa được viết ra cho lượt bấm vừa rồi, chưa từng
             có ở đâu. Nhãn đổi thành "· mới" thay vì "· thêm" — lật trong kho
             sẵn và xin một câu chưa ai đọc là hai việc khác nhau, và người bấm
             bỏ một trong ba lượt mỗi ngày thì nên thấy mình được gì. */
          hop.classList.toggle('q-moi', !!moi);
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
      /* ── HAI HẰNG SỐ NÀY PHẢI ĐỨNG TRÊN DÒNG GỌI ──
         Chúng từng khai ở giữa khối, BÊN DƯỚI dòng ngay sau đây. `var` được
         cất chỗ trước nhưng chưa gán, nên lúc `xinGemini()` chạy thì cả hai
         còn là `undefined` — và cái giá phải trả im lặng đúng hai chỗ:

           · `localStorage.getItem(undefined)` luôn trả null, nên kho đệm KHÔNG
             BAO GIỜ được đọc: mỗi lượt tải trang là một lượt gọi Gemini nữa,
             đúng thứ cả cơ chế này sinh ra để tránh;
           · địa chỉ gửi đi thành `...&so=undefined`, hàm rơi về mặc định 1 câu,
             nên chùm chỉ có một phần tử và F5 lại gặp y câu cũ.

         Cả hai đều KHÔNG ném lỗi và không đổi gì trên màn hình. Xem thêm chú
         thích cùng loại trong `moc()` ngay dưới. */
      var KHO    = 'zib-quote-kho';
      var SO_XIN = 5;   /* xin mấy câu một lượt — đủ cho vài lần F5, chưa tốn */

      /* ══════════ BA LƯỢT XIN CÂU MỚI MỖI NGÀY ══════════

         Bấm nút "câu khác" gọi thẳng Gemini viết một câu mới. Không chặn gì
         thì một người bấm liên tục là mỗi cú bấm một lượt gọi — hạn mức của
         khoá cạn trong vài phút, và cạn rồi thì MỌI người đọc mất lớp này cho
         tới hết ngày.

         Ba lượt là chỗ vừa: đủ để ai thích thì đổi vài câu, mà một người nghịch
         nút cũng chỉ tốn ba lượt. Hết ba thì nút KHÔNG tắt — nó đổi việc, lật
         sang câu kế trong kho, và nhãn đổi theo để người bấm biết.

         Đếm trong máy người đọc, không đếm ở máy chủ: một cái đếm dùng chung
         thì người vào sau mất lượt vì người vào trước đã bấm, và để đếm theo
         từng người thì phải nhận dạng người đọc — thứ trang này cố ý không
         làm. Ai xoá bộ nhớ trình duyệt thì được ba lượt nữa; đó là cái giá
         chấp nhận được, vì trần thật nằm ở hạn mức của khoá chứ không ở đây. */
      var KHO_MOI  = 'zib-quote-moi';
      var TOI_DA_MOI = 3;

      function daXinMoi() {
        try {
          var x = JSON.parse(localStorage.getItem(KHO_MOI) || 'null');
          return (x && x.ngay === moc().ngay) ? (x.so || 0) : 0;
        } catch (e) { return 0; }
      }
      function conMoi() { return Math.max(0, TOI_DA_MOI - daXinMoi()); }
      function ghiMoi() {
        try {
          localStorage.setItem(KHO_MOI,
            JSON.stringify({ ngay: moc().ngay, so: daXinMoi() + 1 }));
        } catch (e) {}
      }

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
        /* ── BẢNG NẰM TRONG HÀM, KHÔNG NẰM NGOÀI ──
           Nó từng là `var MOC_KHUNG` khai ở giữa khối, BÊN DƯỚI dòng gọi
           `xinGemini()`. `var` thì được cất chỗ trước nhưng CHƯA gán, nên lúc
           `moc()` chạy thì nó còn là `undefined`, và `undefined[3]` ném lỗi
           ngay dòng đầu.

           Hậu quả không nhìn ra được bằng mắt: ô trích dẫn vẫn có câu — kho
           câu nhúng sẵn đã vẽ xong từ trước — nên trang trông bình thường,
           trong khi CẢ lớp Gemini chưa từng chạy một lần nào. Lỗi chỉ hiện
           trong bảng điều khiển của trình duyệt, chỗ không ai mở ra xem.

           Đây là lần thứ hai đúng lỗi này trong dự án (lần trước: bảng khối ở
           src/js/soan.js). Khai báo HÀM thì được đưa lên trước; khai báo BIẾN
           thì không. Bảng nào chỉ một hàm dùng thì để hẳn trong hàm ấy — chỗ
           duy nhất không thể đọc trước lúc gán. */
        var MOC_KHUNG = { 1: [0], 2: [5, 17], 3: [5, 12, 18], 4: [5, 11, 15, 20] };
        var so = parseInt(hop.getAttribute('data-khung'), 10) || 1;
        var mo = MOC_KHUNG[so] || MOC_KHUNG[3];
        var d = new Date();
        var gio = d.getHours();
        var i = -1;
        for (var k = 0; k < mo.length; k++) if (gio >= mo[k]) i = k;
        if (i < 0) { d.setDate(d.getDate() - 1); i = mo.length - 1; }
        return { ngay: ymd(d), khung: i, so: mo.length };
      }

      /* ══════════ KHO ĐỆM TRONG MÁY NGƯỜI ĐỌC ══════════

         Bản trước cất ĐÚNG MỘT câu cho mỗi khung giờ, nên F5 bao nhiêu lần
         cũng gặp lại nó. Nay lượt gọi đầu xin cả CHÙM câu rồi cất vào đây, và
         mỗi lần tải trang rút ra câu kế tiếp.

         Được hai thứ cùng lúc: người đọc quay lại là có câu mới, mà cả khung
         giờ vẫn chỉ tốn ĐÚNG MỘT lượt gọi Gemini trên một máy.

         Hết chùm thì QUAY VÒNG lại từ đầu chứ không xin thêm — xin thêm nghĩa
         là ai bấm F5 nhiều thành ra tốn nhiều lượt gọi, đúng cái vừa tránh
         được. Sang khung giờ mới thì khoá đổi, chùm cũ thành vô hiệu, và lượt
         gọi tiếp theo lấy chùm mới. */
      function luuKho(x) {
        try { localStorage.setItem(KHO, JSON.stringify(x)); } catch (e) {}
        return x;
      }

      function dat(x) {
        /* Chèn vào ĐẦU danh sách và trỏ "hôm nay" vào nó, để nút đổi câu
           vẫn đi vòng qua cả kho sẵn như thường. */
        ds.unshift({ chu: x.q, ai: x.ai });
        homNay = 0; dangO = 0;
        ve(0, true, true);
      }

      /* Chuẩn hoá một câu từ hàm về hình dạng mà `ve()` dùng. Một chỗ duy nhất
         biết hàm gọi tên trường là `tacGia` còn trong này là `ai`. */
      function nan(x) { return { q: x.q, ai: x.tacGia || x.ai || '' }; }

      function xinGemini(api) {
        var m = moc();

        /* Kho còn hàng cho ĐÚNG khung giờ này thì rút câu kế tiếp, khỏi gọi mạng */
        try {
          var kho = JSON.parse(localStorage.getItem(KHO) || 'null');
          if (kho && kho.ngay === m.ngay && kho.khung === m.khung
              && kho.ds && kho.ds.length) {
            var vt = (kho.i || 0) % kho.ds.length;
            kho.i = vt + 1;
            luuKho(kho);
            dat(kho.ds[vt]);
            return;
          }
        } catch (e) {}

        var ac = new AbortController();
        var boCuoc = setTimeout(function () { ac.abort(); }, 3000);

        fetch(api + '?ngay=' + m.ngay + '&khung=' + m.khung + '&sokhung=' + m.so
                  + '&so=' + SO_XIN,
              { signal: ac.signal, cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (kq) {
            if (!kq || !kq.ok) return;
            /* Hàm bản cũ chỉ trả `q`/`tacGia`, chưa có `ds` — vẫn nhận, coi như
               chùm một câu. Nhờ vậy trang mới chạy được với hàm chưa kịp lên. */
            var chum = (kq.ds && kq.ds.length ? kq.ds : [kq]).map(nan)
                         .filter(function (x) { return x.q; });
            if (!chum.length) return;
            luuKho({ ngay: m.ngay, khung: m.khung, ds: chum, i: 1 });
            dat(chum[0]);
          })
          .catch(function () { /* im lặng — câu từ kho sẵn vẫn đang hiện */ })
          .finally(function () { clearTimeout(boCuoc); });
      }

      if (nut) {
        var dangXin = false;

        /* Nhãn nút nói ĐÚNG việc nó sắp làm. Hai chuỗi lấy từ thuộc tính do
           build in ra, nên chữ vẫn nằm một chỗ trong bảng nhãn. */
        function veNhan() {
          var con = hop.dataset.api ? conMoi() : 0;
          var chu = con > 0
            ? (nut.getAttribute('data-tip-moi') || 'New one · {n} left today')
                .replace('{n}', con)
            : (nut.getAttribute('data-tip-het') || 'Another one');
          nut.setAttribute('data-tip', chu);
          nut.setAttribute('aria-label', chu);
          nut.classList.toggle('q-nut--moi', con > 0);
        }
        veNhan();
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
          /* Hết lượt trong ngày thì nút vẫn chạy — chỉ là nó lật sang câu kế
             trong kho thay vì gọi mạng. Tắt hẳn nút thì người ta bấm vào một
             thứ không phản ứng gì, khó chịu hơn hẳn việc đổi việc. */
          if (!hop.dataset.api || dangXin || conMoi() <= 0) { lat(); return; }

          ghiMoi();
          veNhan();
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
              /* NHÉT THÊM vào kho đệm chứ không đè. Bản trước cất đúng một câu
                 và ghi đè, nên bấm nút xong là mất cả chùm đã xin lúc tải
                 trang. Nay câu vừa xin nằm lại trong kho, F5 sau vẫn gặp —
                 người bấm nút là người đang muốn câu ĐÓ, giữ lấy mới phải. */
              var moiCau = nan(kq);
              try {
                var k = JSON.parse(localStorage.getItem(KHO) || 'null');
                if (!k || k.ngay !== m.ngay || k.khung !== m.khung || !k.ds) {
                  k = { ngay: m.ngay, khung: m.khung, ds: [], i: 0 };
                }
                if (!k.ds.some(function (x) { return x.q === moiCau.q; })) k.ds.push(moiCau);
                luuKho(k);
              } catch (e) {}
              ds.push({ chu: moiCau.q, ai: moiCau.ai });
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
