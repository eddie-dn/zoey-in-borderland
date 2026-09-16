/* ══════════════════════════════════════════════════════════════════════
   Ô SOẠN THẢO — gõ như gõ văn bản, gửi đi vẫn là Markdown.

   ── VÌ SAO KHÔNG BẮT GÕ MARKDOWN THẲNG ───────────────────────────────
   Ô cũ là một <textarea> trần: muốn in đậm thì gõ hai dấu sao, muốn trích dẫn
   thì nhớ dấu lớn hơn ở đầu dòng. Cái đó ổn khi ngồi máy và viết đều tay.
   Nó KHÔNG ổn khi lâu lâu mới viết một bài, hoặc viết trên điện thoại — lúc
   ấy phải nhớ lại cú pháp trước khi nhớ ra mình định viết gì, và cái phải nhớ
   ấy đủ để bài viết lùi sang ngày mai.

   ── VÌ SAO KHÔNG ĐỔI LUÔN SANG LƯU HTML ──────────────────────────────
   Vì bài vẫn phải là file .md trong kho mã. Đó là thứ mở ra đọc được bằng mắt
   mười năm nữa, sửa được bằng bất kỳ trình soạn thảo nào, và so sánh được
   giữa hai lần sửa. Một kho bài viết bằng HTML do máy sinh ra thì mất sạch cả
   ba tính chất ấy. Nên ô này CHỈ là cái mặt: người ta gõ trên một khung chữ
   thật, còn thứ đi lên GitHub vẫn là Markdown, và vẫn là Markdown mà người
   gõ tay ở máy viết ra được y hệt.

   ── KHÔNG DÙNG THƯ VIỆN, VÀ ĐÓ LÀ MỘT LỰA CHỌN ───────────────────────
   Cả dự án này không có một dependency nào. Một bộ soạn thảo ngoài (TipTap,
   Quill, Toast UI) làm xong việc này trong hai mươi dòng, nhưng kéo theo
   150–300 KB tải từ máy chủ người khác và một khối mã không ai ở đây đọc hết
   được. Đổi lại, file này dài — mà dài thì đọc được, sửa được, và không có
   ngày nào nó tự đổi hành vi vì có người phát hành một bản mới.

   ── execCommand ĐÃ BỊ KHAI TỬ, VÀ VẪN LÀ ĐƯỜNG ĐÚNG ──────────────────
   Nó nằm trong danh sách "deprecated" đã nhiều năm. Nhưng mọi trình duyệt
   đang sống đều chạy nó, không trình nào công bố ngày gỡ, và thứ thay thế
   thì chưa có — viết tay phép in đậm trên một vùng chọn cắt ngang ba thẻ là
   vài trăm dòng nữa, riêng cho một nút. Chỗ nào execCommand KHÔNG làm được
   (tô màu theo tên lớp, chữ trong ô mã) thì bên dưới có hàm riêng.

   ── MỘT CHIỀU, KHÔNG PHẢI HAI ────────────────────────────────────────
   Khung này đổi ra Markdown được; nó KHÔNG đọc Markdown vào. Nên bản nháp tự
   lưu giữ dạng HTML của chính khung — thứ nó đọc lại được nguyên vẹn. Thêm
   một bộ đọc Markdown nữa là thêm một bộ dựng thứ ba phải giữ cho khớp với
   hai bộ đang có (tools/lib/markdown.mjs và bộ tí hon trong ghi-chu.js).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Tên màu phải khớp bảng MAU trong tools/lib/markdown.mjs và bảng lớp .c-*
     trong src/styles/prose.css. Ba chỗ, và cố ý không gom lại: hai chỗ kia
     chạy ở hai môi trường khác (node lúc dựng, CSS lúc vẽ) nên không có cách
     nào chia sẻ. Đổi bảng thì sửa cả ba — bộ kiểm định không bắt được chuyện
     này, nên nó nằm ở đây thành một câu nhắc. */
  var MAU = [
    { ma: 'tim',  ten: 'Tím' },
    { ma: 'hong', ten: 'Hồng' },
    { ma: 'do',   ten: 'Đỏ' },
    { ma: 'cam',  ten: 'Cam' },
    { ma: 'vang', ten: 'Vàng' },
    { ma: 'luc',  ten: 'Lục' },
    { ma: 'lam',  ten: 'Lam' },
    { ma: 'xam',  ten: 'Xám' }
  ];
  var TEN_MD = { tim:'tím', hong:'hồng', do:'đỏ', cam:'cam',
                 vang:'vàng', luc:'lục', lam:'lam', xam:'xám' };

  /* ══════════════ TIỆN ÍCH ══════════════ */

  function el(the, lop, chu) {
    var n = document.createElement(the);
    if (lop) n.className = lop;
    if (chu != null) n.textContent = chu;
    return n;
  }

  /* Nhận một chuỗi `d` hoặc một mảng chuỗi. Hỏi thẳng `Array.isArray` chứ
     KHÔNG nhận thêm một cờ "nhiều nét" từ chỗ gọi: bản đầu làm thế, và mười
     chỗ gọi thì có bốn chỗ cờ không khớp với kiểu dữ liệu — chuỗi mà khai là
     mảng thì `.forEach` không tồn tại, và cả khung soạn thảo chết ngay lúc
     dựng. Dữ liệu tự nói ra được kiểu của nó thì đừng bắt chỗ gọi nói hộ. */
  function svg(d) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    n.setAttribute('viewBox', '0 0 24 24');
    n.setAttribute('aria-hidden', 'true');
    (Array.isArray(d) ? d : [d]).forEach(function (x) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', x);
      n.appendChild(p);
    });
    return n;
  }

  /* ══════════════ ĐỔI DOM RA MARKDOWN ══════════════

     Đi hai tầng: `khoi()` lo những thứ chiếm trọn một dòng (đoạn, tiêu đề,
     danh sách, trích dẫn), `trong()` lo những thứ nằm giữa dòng (đậm,
     nghiêng, link, màu). Tách hai tầng vì luật của chúng khác hẳn nhau: khối
     nối với nhau bằng dòng trống, còn nét trong dòng thì dính liền chữ.

     ── DẤU CÁCH PHẢI NẰM NGOÀI DẤU NHẤN ──
     Bôi đen kèm một dấu cách thừa là chuyện xảy ra mỗi ngày (bấm đúp vào một
     từ ở Safari là dính luôn dấu cách sau nó). `** đậm **` thì bộ dựng KHÔNG
     đọc ra in đậm — nó in ra nguyên mấy dấu sao. Nên trước khi bọc, đẩy dấu
     cách ra ngoài cặp dấu. */

  function thoat(s) {
    /* Thoát vừa đủ: mấy ký tự này mà đứng giữa câu thì bộ dựng đọc nhầm thành
       cú pháp. KHÔNG thoát dấu gạch dưới — trong tiếng Việt nó gần như chỉ
       xuất hiện giữa tên biến, mà bộ dựng đã bỏ qua trường hợp ấy rồi (xem
       `nhanManh` trong tools/lib/markdown.mjs); thoát nó thì mọi tên biến
       trong bài mọc thêm dấu chéo ngược.

       Hai dấu ngoặc nhọn CÓ trong danh sách: cú pháp màu là `{tím: chữ}`, nên
       một câu gõ thật có dấu ngoặc nhọn mà không thoát thì biến mất vào một
       thẻ span. Bộ dựng hiểu được dấu chéo ngược từ bản này — trước đó nó in
       ra nguyên cả dấu chéo, và đó là lý do ô soạn thảo không thể ra đời sớm
       hơn bộ đọc dấu thoát. */
    return String(s).replace(/([\\`*\[\]{}])/g, '\\$1');
  }

  function boc(dau, chu, cuoi) {
    if (!chu) return '';
    var tr = chu.match(/^\s*/)[0];
    var sa = chu.match(/\s*$/)[0];
    var loi = chu.slice(tr.length, chu.length - sa.length);
    if (!loi) return chu;
    return tr + dau + loi + (cuoi == null ? dau : cuoi) + sa;
  }

  function lopMau(n) {
    if (!n.classList) return '';
    for (var i = 0; i < MAU.length; i++) {
      if (n.classList.contains('c-' + MAU[i].ma)) return MAU[i].ma;
    }
    return '';
  }

  function trong(n) {
    var ra = '';
    for (var i = 0; i < n.childNodes.length; i++) {
      var c = n.childNodes[i];

      if (c.nodeType === 3) { ra += thoat(c.nodeValue); continue; }
      if (c.nodeType !== 1) continue;

      var the = c.nodeName;

      if (the === 'BR') { ra += '  \n'; continue; }

      if (the === 'CODE') {
        /* Chữ trong ô mã đi NGUYÊN, không thoát: dấu sao trong một đoạn mã là
           dấu sao, và thoát nó thì đoạn mã in ra có thêm dấu chéo ngược mà
           người đọc tưởng là mã thật. */
        var m = c.textContent;
        ra += m ? boc('`', m) : '';
        continue;
      }

      if (the === 'A') {
        var href = c.getAttribute('href') || '';
        var tiA = c.getAttribute('title');
        var chuA = trong(c);
        ra += href
          ? '[' + chuA + '](' + href + (tiA ? ' "' + tiA + '"' : '') + ')'
          : chuA;
        continue;
      }

      if (the === 'IMG') {
        var ti = c.getAttribute('data-tieu');
        var lopA = c.getAttribute('data-lop');
        ra += '![' + (c.getAttribute('alt') || '') + ']('
            + (c.getAttribute('src') || '') + (ti ? ' "' + ti + '"' : '') + ')'
            + (lopA || '');
        continue;
      }

      var mau = lopMau(c);
      if (mau) { ra += boc('{' + TEN_MD[mau] + ': ', trong(c), '}'); continue; }

      if (the === 'STRONG' || the === 'B') { ra += boc('**', trong(c)); continue; }
      if (the === 'EM' || the === 'I')     { ra += boc('*',  trong(c)); continue; }
      if (the === 'DEL' || the === 'S' || the === 'STRIKE') { ra += boc('~~', trong(c)); continue; }
      if (the === 'MARK') { ra += boc('==', trong(c)); continue; }

      ra += trong(c);
    }
    return ra;
  }

  function khoi(n, ra, thut) {
    thut = thut || '';
    for (var i = 0; i < n.childNodes.length; i++) {
      var c = n.childNodes[i];

      if (c.nodeType === 3) {
        var t = c.nodeValue.trim();
        if (t) ra.push(thut + thoat(t));
        continue;
      }
      if (c.nodeType !== 1) continue;

      var the = c.nodeName;

      if (the === 'H1' || the === 'H2') { ra.push(thut + '## '   + trong(c)); continue; }
      if (the === 'H3')                 { ra.push(thut + '### '  + trong(c)); continue; }
      if (the === 'H4')                 { ra.push(thut + '#### ' + trong(c)); continue; }
      if (the === 'HR')                 { ra.push(thut + '---'); continue; }

      if (the === 'PRE') {
        var ngon = c.getAttribute && c.getAttribute('data-ngon');
        ra.push(thut + '```' + (ngon || '') + '\n'
                + c.textContent.replace(/\n+$/, '') + '\n' + thut + '```');
        continue;
      }

      if (the === 'BLOCKQUOTE') {
        var q = [];
        khoi(c, q, '');
        /* Trích dẫn nhiều đoạn: MỖI dòng phải mang dấu `>`, kể cả dòng trống
           giữa hai đoạn — thiếu nó thì đoạn thứ hai rơi ra ngoài khối trích. */
        ra.push(q.join('\n\n').split('\n').map(function (d) {
          return thut + '> ' + d;
        }).join('\n'));
        continue;
      }

      if (the === 'UL' || the === 'OL') {
        /* ── CẢ DANH SÁCH LÀ MỘT MỤC TRONG `ra`, KHÔNG PHẢI MỖI DÒNG MỘT MỤC ──
           `ra` nối với nhau bằng DÒNG TRỐNG, vì đó là cách hai đoạn văn ngăn
           nhau. Đẩy từng mục danh sách vào `ra` thì giữa hai gạch đầu dòng
           cũng có một dòng trống — và với Markdown, dòng trống giữa các mục
           đổi danh sách từ "chặt" sang "lỏng": bộ dựng bọc mỗi mục vào một thẻ
           <p>, và danh sách giãn gấp đôi chiều cao trên trang đã dựng.
           Nên gom hết mục lại rồi đẩy MỘT lần. */
        var muc = [];
        var so = 0;
        for (var j = 0; j < c.children.length; j++) {
          var li = c.children[j];
          if (li.nodeName !== 'LI') continue;
          so++;
          var dau = the === 'OL' ? (so + '. ') : '- ';

          /* Danh sách lồng đi RIÊNG hai đường, và phải cắt đôi đúng chỗ:
             · phần CHỮ của mục     → một bản sao đã gỡ hết danh sách con ra,
                                       nếu không thì chữ của mấy mục con bị
                                       `trong()` nối thẳng vào cuối dòng cha;
             · phần DANH SÁCH con   → gom vào một thẻ tạm rồi gọi lại `khoi()`
                                       với hai dấu cách thụt thêm.
             Gọi `khoi(li, …)` thẳng như bản đầu thì nó duyệt CẢ hai phần, và
             mỗi mục con hiện ra hai lần. */
          var ban = li.cloneNode(true);
          var bo = ban.querySelectorAll(':scope > ul, :scope > ol');
          for (var q2 = 0; q2 < bo.length; q2++) bo[q2].remove();

          var con = [];
          var conDS = li.querySelectorAll(':scope > ul, :scope > ol');
          if (conDS.length) {
            var tam = document.createElement('div');
            for (var k = 0; k < conDS.length; k++) tam.appendChild(conDS[k].cloneNode(true));
            khoi(tam, con, thut + '  ');
          }
          muc.push(thut + dau + trong(ban) + (con.length ? '\n' + con.join('\n') : ''));
        }
        if (muc.length) ra.push(muc.join('\n'));
        continue;
      }

      if (the === 'FIGURE') { ra.push(thut + trong(c)); continue; }

      /* P, DIV, và mọi thứ còn lại: một đoạn. Trình duyệt đôi khi đẻ ra <div>
         thay vì <p> (Safari vẫn làm thế ở vài chỗ dù đã khai
         defaultParagraphSeparator), nên không phân biệt hai cái ấy. */
      var d = trong(c);
      /* Chỉ ngắt lại khi đoạn đứng ở cấp NGOÀI CÙNG (`thut` rỗng). Đoạn nằm
         trong một mục danh sách đã mang lề thụt, mà ngắt thêm ở đó thì dòng
         tràn ra mất lề và nhảy khỏi mục. */
      if (d.trim()) ra.push(thut + (thut ? d : xuongDong(d)));
      else if (the === 'P' || the === 'DIV') ra.push('');
    }
  }

  /* ── NGẮT DÒNG LẠI Ở 80 CỘT ──
     Bài trong kho mã gõ tay và ngắt dòng quanh cột 80. Khung soạn thảo thì
     không có khái niệm "dòng" bên trong một đoạn — nó chỉ có đoạn — nên nếu
     nhả ra nguyên một dòng dài thì mở một bài cũ rồi lưu lại là mọi đoạn trong
     bài bị gộp lại, và `git diff` hiện ra "cả bài thay đổi" cho một lượt sửa
     ba chữ. Lịch sử bài viết hỏng theo kiểu không lấy lại được.

     Ngắt lại ở 80 cột thì:
       · diff đọc được theo từng dòng, đúng như mọi bài gõ tay;
       · phép này BẤT BIẾN — ngắt một đoạn đã ngắt 80 cột ra đúng chính nó,
         nên từ lượt lưu thứ hai trở đi không còn xáo trộn nào.
     Lượt lưu ĐẦU TIÊN của một bài cũ vẫn có thể xê dịch vài chỗ ngắt, vì bài
     ấy ngắt theo tay người chứ không theo thước. Đó là cái giá một lần.

     ── BA CHỖ KHÔNG ĐƯỢC NGẮT VÀO ──
     · `mã trong dòng`: bộ dựng bắt nó bằng /`([^`\n]+)`/ — KHÔNG cho xuống
       dòng ở giữa. Ngắt vào đấy là ô mã vỡ thành hai dấu huyền lạc.
     · cú ngắt dòng CỨNG người viết tự đặt (Shift+Enter → hai dấu cách cuối
       dòng): nó phải ở nguyên chỗ cũ, nên đoạn được cắt tại đó rồi mới ngắt
       từng mảnh một.
     · TIÊU ĐỀ và MỤC DANH SÁCH: phần chữ tràn xuống dòng dưới sẽ bị đọc thành
       một đoạn văn mới, hoặc dính vào mục kế tiếp. Nên hàm này chỉ được gọi
       cho ĐOẠN VĂN — xem chỗ gọi trong `khoi()`.

     Đậm, nghiêng, gạch, tô nền, màu và link thì ngắt thoải mái: bộ dựng bắt
     chúng bằng [\s\S] nên chúng đi qua được chỗ xuống dòng, và địa chỉ trong
     link vốn không có dấu cách nào để mà ngắt vào. */
  var COT = 80;

  function ngatMot(s) {
    if (!s || s.length <= COT) return s;

    /* ── CẤT Ô MÃ ĐI RỒI MỚI CẮT HẠT ──
       Bản đầu cắt chuỗi thành ba loại mảnh (trước ô mã · ô mã · sau ô mã) rồi
       nối lại bằng dấu cách. Sai ở chỗ nối: `` `duong/dan`, `` có dấu phẩy
       DÍNH ngay sau ô mã, mà cắt kiểu ấy thì dấu phẩy thành một hạt riêng và
       lúc ghép lại nó mọc thêm một dấu cách — `` `duong/dan` , ``.

       Nay thay mỗi ô mã bằng một ký tự giữ chỗ KHÔNG CÓ DẤU CÁCH, rồi cắt cả
       chuỗi theo dấu cách như bình thường. Dấu phẩy ở lại đúng chỗ của nó,
       dính vào hạt chứa ô mã. Bề dài thì đo trên chữ THẬT, không đo trên ký
       tự giữ chỗ — nếu không thì dòng nào có ô mã sẽ dài quá cột. */
    var kho = [];
    var t = s.replace(/`[^`]*`/g, function (m) {
      kho.push(m); return GIU + (kho.length - 1) + GIU;
    });
    var reGiu = new RegExp(GIU + '(\\d+)' + GIU, 'g');
    function mo(x) { return x.replace(reGiu, function (_, i) { return kho[+i]; }); }
    function do_(x) { return mo(x).length; }

    var hat = t.split(/\s+/).filter(function (x) { return x !== ''; });
    var dong = [], nay = '', dai = 0;
    for (var i = 0; i < hat.length; i++) {
      var h = hat[i], n = do_(h);
      if (!nay) { nay = h; dai = n; }
      else if (dai + 1 + n <= COT) { nay += ' ' + h; dai += 1 + n; }
      else { dong.push(nay); nay = h; dai = n; }
    }
    if (nay) dong.push(nay);
    return mo(dong.join('\n'));
  }

  function xuongDong(s) {
    /* Cắt ở cú ngắt dòng cứng trước, ngắt lại từng mảnh, rồi ghép lại bằng
       đúng cái dấu hiệu cũ — hai dấu cách rồi xuống dòng. */
    return String(s).split('  \n').map(ngatMot).join('  \n');
  }

  function sangMD(goc) {
    var ra = [];
    khoi(goc, ra, '');
    return ra.join('\n\n')
      .replace(/ /g, ' ')          /* dấu cách cứng do contenteditable đẻ ra */
      .replace(/[ \t]+$/gm, function (m) { return m === '  ' ? m : ''; })
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /* ══════════════ ĐỌC MARKDOWN VÀO KHUNG ══════════════

     Chiều ngược của `sangMD`. Đầu file này từng ghi "khung đổi ra Markdown
     được; nó KHÔNG đọc Markdown vào" — đúng cho tới lúc phải SỬA một bài đã
     đăng. Sửa thì bắt buộc phải nạp được bài cũ vào khung.

     ── NÓ KHÔNG PHẢI BỘ DỰNG THỨ BA ──
     `tools/lib/markdown.mjs` mới là bộ dựng thật, và nó đầy đủ hơn hẳn: bảng,
     khung nhấn `:::note`, thư viện ảnh, nhúng video, chú thích. Hàm dưới đây
     chỉ đọc đúng cái TẬP CON mà `sangMD` sinh ra, cộng vài thứ gõ tay hay gặp.

     Thứ nó không hiểu KHÔNG bị mất: mọi dòng lạ rơi xuống nhánh cuối và thành
     một đoạn văn giữ nguyên chữ. Sửa một bài có bảng thì cái bảng hiện ra dưới
     dạng mấy dòng gạch đứng — xấu, nhưng còn nguyên, và lưu lại vẫn ra đúng
     chừng ấy ký tự. Mất chữ mới là hỏng; hiện xấu thì chỉ là xấu.

     ── VÒNG TRÒN PHẢI KHÉP ──
     `sangMD(tuMD(x))` phải trả lại đúng `x`. Mở một bài ra rồi lưu lại mà
     không sửa gì thì commit phải TRỐNG — nếu không, mỗi lần mở bài là một lần
     kho mã nhận một thay đổi vô nghĩa, và lịch sử bài viết thành rác. */

  function thoatHTML(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /* Ký tự giữ chỗ cho mấy mẩu phải miễn nhiễm với các phép thay thế phía sau.
     Dùng U+0001 vì nó không bao giờ xuất hiện trong bài viết thật — cùng mẹo
     với `GIU` trong tools/lib/markdown.mjs. */
  var GIU = String.fromCharCode(1);

  function nhoMD(s) {
    var kho = [];
    function cat(html) { kho.push(html); return GIU + (kho.length - 1) + GIU; }

    /* Dấu chéo ngược và mã trong dòng đi TRƯỚC mọi thứ khác — hai thứ này phải
       không bị các phép dưới đọc phải. */
    s = String(s).replace(/\\([\\`*\[\]{}])/g, function (_, c) { return cat(thoatHTML(c)); });
    s = s.replace(/`([^`\n]+)`/g, function (_, m) { return cat('<code>' + thoatHTML(m) + '</code>'); });

    s = thoatHTML(s);

    /* ── ẢNH: PHẢI NUỐT CẢ CHÚ THÍCH VÀ CẢ KHỐI {.lop} ──
       Dạng đầy đủ trong kho bài là:
           ![mô tả](/duong/dan.svg "Chú thích có **đậm**"){.wide}
       Bản đầu chỉ bắt `![x](y)`, nên gặp dạng này là KHÔNG khớp gì cả — dòng
       ảnh ở lại dạng chữ, rồi `thoat()` bôi dấu chéo ngược lên hai dấu ngoặc
       vuông, và bài lưu lại có một dòng `!\[…\]` chết giữa trang.

       Hai phần ấy khung soạn thảo không sửa được (không có ô nào cho chúng),
       nhưng phải ĐI QUA nguyên vẹn — nên chúng được cất vào hai thuộc tính
       data- rồi nhả lại y như cũ lúc đổi ngược ra Markdown. Sửa được thì tốt;
       giữ nguyên là bắt buộc. */
    /* ── THẺ ĐI VÀO KHO, CHỮ Ở LẠI DÒNG ──
       Mấy phép thay thế bên dưới (đậm, nghiêng, màu…) chạy trên CẢ chuỗi, kể
       cả phần nằm trong dấu nháy của thuộc tính. Chú thích ảnh thì hay có
       `**đậm**` — và nếu thẻ <img> đã dựng xong nằm trong dòng lúc ấy, cú
       thay thế biến nó thành `<strong>` NGAY TRONG thuộc tính. Lưu lại là
       file .md mang một mẩu HTML lạ giữa chú thích ảnh.

       Nên: thẻ <img> vào kho trọn gói (nó không có chữ bên trong). Còn thẻ
       <a> thì chỉ cất HAI ĐẦU vào kho, chừa phần chữ ở lại dòng — chữ trong
       link vẫn phải in đậm/nghiêng được, đúng như bộ dựng thật vẫn làm. */
    var ANH = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(\{[^}]*\})?/g;
    s = s.replace(ANH, function (ca, alt, src, tieu, lop) {
      if (!/^(https?:\/\/|\/)/i.test(src)) return ca;
      return cat('<img src="' + src.replace(/"/g, '%22') +
             '" alt="' + String(alt).replace(/"/g, '') + '"' +
             (tieu ? ' data-tieu="' + tieu.replace(/"/g, '&quot;') + '"' : '') +
             (lop ? ' data-lop="' + lop.replace(/"/g, '') + '"' : '') + '>');
    });
    var LINK = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
    s = s.replace(LINK, function (ca, chu, href, tieu) {
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(href)) return ca;
      return cat('<a href="' + href.replace(/"/g, '%22') + '"' +
                 (tieu ? ' title="' + tieu.replace(/"/g, '&quot;') + '"' : '') + '>')
             + chu + cat('</a>');
    });

    /* Màu chạy TRƯỚC đậm/nghiêng, ngược thứ tự với bộ dựng thật: ở đây phần
       chữ bên trong cụm màu còn phải đi tiếp qua mấy phép dưới, nên cụm phải
       được mở ra trước cho nội dung nó lộ ra. */
    var TEN = {};
    for (var k in TEN_MD) TEN[TEN_MD[k]] = k;
    s = s.replace(/\{([^:{}]+):\s*([^{}]+?)\}/g, function (ca, ten, chu) {
      var ma = TEN[String(ten).trim()];
      return ma ? '<span class="c-' + ma + '">' + chu + '</span>' : ca;
    });

    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    s = s.replace(/ {2}\n/g, '<br>');
    s = s.replace(/\n/g, ' ');

    /* ── TRẢ KHO RA THEO VÒNG, KHÔNG PHẢI MỘT LƯỢT ──
       Kho lồng nhau được: chú thích của một tấm ảnh có thể chứa `mã trong
       dòng`, mà ô mã ấy đã vào kho TRƯỚC khi cả thẻ <img> vào kho. Trả một
       lượt thì lớp ngoài mở ra để lộ ký tự giữ chỗ của lớp trong, và nó nằm
       lại đó — in ra thành chữ "undefined" giữa chú thích ảnh.
       Vòng lặp này chắc chắn dừng: mỗi lượt gỡ đúng một tầng, mà số tầng thì
       hữu hạn. */
    var reGiu = new RegExp(GIU + '(\\d+)' + GIU, 'g');
    var truoc;
    do { truoc = s; s = s.replace(reGiu, function (_, i) { return kho[+i]; }); }
    while (s !== truoc);
    return s;
  }

  function tuMD(md) {
    var dong = String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n');
    var ra = [], i = 0;
    var dsThuong = /^\s*[-*+]\s+/, dsSo = /^\s*\d+[.)]\s+/;
    var laVach = function (d) { return /^\s{0,3}(---+|\*\*\*+|___+)\s*$/.test(d); };

    while (i < dong.length) {
      var d = dong[i];
      if (!d.trim()) { i++; continue; }

      var h = d.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        /* H1 kéo về H2: tiêu đề bài đã là thẻ h1 của trang, và hai h1 trên một
           trang thì trình đọc màn hình không biết cái nào là tiêu đề thật. */
        var cap = Math.min(Math.max(h[1].length, 2), 4);
        ra.push('<h' + cap + '>' + nhoMD(h[2]) + '</h' + cap + '>');
        i++; continue;
      }

      if (laVach(d)) { ra.push('<hr>'); i++; continue; }

      if (/^```/.test(d)) {
        /* Tên ngôn ngữ sau ba dấu huyền quyết định cách tô màu cú pháp ở bài
           đã dựng. Bản đầu vứt nó đi, nên mở một bài có khối mã ra rồi lưu
           lại là ```json thành ``` — khối mã mất màu mà không ai thấy ngay. */
        var ngon = (d.match(/^```\s*(\S+)/) || ['', ''])[1];
        i++;
        var ma = [];
        while (i < dong.length && !/^```/.test(dong[i])) { ma.push(dong[i]); i++; }
        i++;
        ra.push('<pre' + (ngon ? ' data-ngon="' + ngon.replace(/"/g, '') + '"' : '') +
                '>' + thoatHTML(ma.join('\n')) + '</pre>');
        continue;
      }

      /* Trích dẫn: gom mọi dòng còn mang dấu `>` rồi đọc lại phần bên trong
         bằng chính hàm này — nhờ vậy trích dẫn nhiều đoạn tự chạy. */
      if (/^>\s?/.test(d)) {
        var than = [];
        while (i < dong.length && /^>\s?/.test(dong[i])) {
          than.push(dong[i].replace(/^>\s?/, '')); i++;
        }
        ra.push('<blockquote>' + tuMD(than.join('\n')) + '</blockquote>');
        continue;
      }

      if (dsThuong.test(d) || dsSo.test(d)) {
        var co = dsSo.test(d);
        var dau = co ? dsSo : dsThuong;
        var muc = [];
        while (i < dong.length && dau.test(dong[i])) {
          var chu = dong[i].replace(dau, '');
          i++;
          /* Dòng thụt vào ngay dưới một mục là danh sách con của nó. */
          var con = [];
          while (i < dong.length && /^\s{2,}\S/.test(dong[i])) {
            con.push(dong[i].replace(/^\s{2}/, '')); i++;
          }
          muc.push('<li>' + nhoMD(chu) + (con.length ? tuMD(con.join('\n')) : '') + '</li>');
        }
        ra.push((co ? '<ol>' : '<ul>') + muc.join('') + (co ? '</ol>' : '</ul>'));
        continue;
      }

      /* Đoạn: gom tới dòng trống hoặc tới dòng mở một khối khác. Hai dấu cách
         cuối dòng đã thành <br> trong `nhoMD`, nên nối bằng xuống dòng là đủ. */
      var doan = [];
      while (i < dong.length && dong[i].trim()
             && !/^(#{1,4}\s|>|```)/.test(dong[i])
             && !dsThuong.test(dong[i]) && !dsSo.test(dong[i]) && !laVach(dong[i])) {
        doan.push(dong[i]); i++;
      }
      if (doan.length) ra.push('<p>' + nhoMD(doan.join('\n')) + '</p>');
      else i++;
    }
    return ra.join('');
  }

  /* ══════════════ RỬA HTML DÁN VÀO ══════════════

     Dán từ Word, từ Google Docs, từ một trang web bất kỳ — thứ đi vào clipboard
     là một đống thẻ với style inline, class của trang gốc, đôi khi cả <script>.
     Thả thẳng vào khung là bài mang theo phông chữ và cỡ chữ của chỗ khác, và
     nhìn ra ngay ở trang đã dựng.

     Nên: giữ đúng mấy thẻ bộ đổi Markdown bên trên biết đọc, mọi thẻ khác rút
     xuống còn phần chữ của nó. Danh sách trắng chứ không danh sách đen — thẻ
     lạ thì bỏ, và thẻ lạ là thứ mỗi năm lại có thêm vài cái. */
  var CHO_PHEP = {
    P:1, BR:1, STRONG:1, B:1, EM:1, I:1, DEL:1, S:1, STRIKE:1, CODE:1, PRE:1,
    A:1, H1:1, H2:1, H3:1, H4:1, BLOCKQUOTE:1, UL:1, OL:1, LI:1, HR:1,
    MARK:1, SPAN:1, IMG:1
  };

  function rua(goc) {
    var cac = goc.querySelectorAll('*');
    for (var i = cac.length - 1; i >= 0; i--) {
      var n = cac[i];
      var the = n.nodeName;

      if (!CHO_PHEP[the]) { thayBangChu(n); continue; }

      /* SPAN chỉ sống sót khi nó mang đúng một lớp màu của trang này. Mọi
         span khác là vỏ trang trí của chỗ dán tới. */
      if (the === 'SPAN' && !lopMau(n)) { thayBangChu(n); continue; }

      var giu = the === 'A' ? ['href'] : the === 'IMG' ? ['src', 'alt']
              : the === 'SPAN' ? ['class'] : the === 'PRE' ? ['data-ngon'] : [];
      if (the === 'IMG') giu = ['src', 'alt', 'data-tieu', 'data-lop'];
      for (var j = n.attributes.length - 1; j >= 0; j--) {
        var ten = n.attributes[j].name;
        if (giu.indexOf(ten) < 0) n.removeAttribute(ten);
      }
      /* `javascript:` trong href là đường chạy mã ngay trên trang. Chỉ nhận
         đường ngoài bằng http/https và đường nội bộ bắt đầu bằng gạch chéo. */
      if (the === 'A') {
        var h = n.getAttribute('href') || '';
        if (!/^(https?:\/\/|\/|#|mailto:)/i.test(h)) n.removeAttribute('href');
      }
      if (the === 'IMG') {
        var sc = n.getAttribute('src') || '';
        if (!/^(https?:\/\/|\/)/i.test(sc)) n.remove();
      }
    }
    return goc;
  }

  function thayBangChu(n) {
    var cha = n.parentNode;
    if (!cha) return;
    while (n.firstChild) cha.insertBefore(n.firstChild, n);
    cha.removeChild(n);
  }

  /* ══════════════ BỌC VÙNG CHỌN ══════════════

     execCommand không có lệnh nào bọc vùng chọn vào một thẻ có class, nên ba
     nút Màu, Tô nền và Mã dùng hàm này.

     `surroundContents` là đường ngắn, nhưng nó NÉM LỖI khi vùng chọn cắt ngang
     ranh giới thẻ — bôi từ giữa một chữ đậm sang chữ thường là đúng trường hợp
     ấy, và đó là cách bôi đen thường gặp nhất. Nên bắt lỗi rồi rơi xuống cách
     dài: lấy nội dung ra, nhét vào thẻ mới, đặt lại vào chỗ cũ. */
  function bocChon(tao) {
    var s = window.getSelection();
    if (!s || !s.rangeCount || s.isCollapsed) return null;
    var r = s.getRangeAt(0);
    var v = tao();
    try {
      r.surroundContents(v);
    } catch (e) {
      v.appendChild(r.extractContents());
      r.insertNode(v);
    }
    /* Chọn lại đúng phần vừa bọc: bấm Tím rồi bấm Đậm là hai lượt liền nhau
       trên cùng một cụm chữ, mà mất vùng chọn thì lượt thứ hai rơi vào chỗ
       khác — hoặc không rơi vào đâu cả. */
    s.removeAllRanges();
    var r2 = document.createRange();
    r2.selectNodeContents(v);
    s.addRange(r2);
    return v;
  }

  /* Gỡ một lớp bọc khi con trỏ đang nằm trong nó — bấm Tím lần nữa để bỏ tím.
     Không có phép gỡ thì mỗi lần đổi ý là một lớp span nữa chồng lên, và
     Markdown ra `{tím: {hồng: chữ}}`. */
  function goBoc(khung, hop) {
    var s = window.getSelection();
    if (!s || !s.rangeCount) return false;
    var n = s.getRangeAt(0).startContainer;
    while (n && n !== khung) {
      if (n.nodeType === 1 && hop(n)) { thayBangChu(n); return true; }
      n = n.parentNode;
    }
    return false;
  }

  /* ══════════════ DỰNG KHUNG ══════════════ */

  function gan(oSan, tuyChon) {
    tuyChon = tuyChon || {};
    var N = tuyChon.nhan || {};
    function L(k, m) { return N[k] || m; }

    var khoiSoan = el('div', 'sz');

    /* ── THANH NÚT ── */
    var thanh = el('div', 'sz-thanh');
    thanh.setAttribute('role', 'toolbar');
    thanh.setAttribute('aria-label', L('toolbar', 'Định dạng'));

    var khung = el('div', 'sz-khung');
    khung.contentEditable = 'true';
    khung.setAttribute('role', 'textbox');
    khung.setAttribute('aria-multiline', 'true');
    khung.setAttribute('aria-label', L('body', 'Nội dung bài'));
    khung.spellcheck = true;

    function lenh(ten, gt) {
      khung.focus();
      try { document.execCommand(ten, false, gt == null ? null : gt); } catch (e) {}
      capNhat();
    }

    function nut(nhan, tip, lam, lopThem) {
      var b = el('button', 'sz-nut' + (lopThem ? ' ' + lopThem : ''));
      b.type = 'button';
      b.title = tip;
      b.setAttribute('aria-label', tip);
      if (typeof nhan === 'string') b.textContent = nhan;
      else b.appendChild(nhan);
      /* `mousedown` + preventDefault chứ không `click`: bấm một cái nút là
         trình duyệt bỏ vùng chọn trong khung soạn thảo TRƯỚC khi sự kiện
         click chạy tới. Chặn ngay ở mousedown thì vùng chọn còn nguyên. */
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function (e) { e.preventDefault(); lam(b); });
      thanh.appendChild(b);
      return b;
    }

    function vach() { thanh.appendChild(el('span', 'sz-vach')); }

    /* ── Nhóm 1: nét trong dòng ── */
    var nDam = nut('B', L('bold', 'Đậm') + ' (⌘B)', function () { lenh('bold'); }, 'sz-nut--dam');
    var nNgh = nut('I', L('italic', 'Nghiêng') + ' (⌘I)', function () { lenh('italic'); }, 'sz-nut--ngh');
    var nGac = nut('S', L('strike', 'Gạch ngang'), function () { lenh('strikeThrough'); }, 'sz-nut--gac');
    nut(svg('M9 6 4 12l5 6M15 6l5 6-5 6'), L('code', 'Mã'), function () {
      if (goBoc(khung, function (n) { return n.nodeName === 'CODE'; })) { capNhat(); return; }
      bocChon(function () { return document.createElement('code'); });
      capNhat();
    });
    vach();

    /* ── Nhóm 2: khối ── */
    nut('H2', L('h2', 'Tiêu đề lớn'), function () { lenh('formatBlock', 'h2'); }, 'sz-nut--h');
    nut('H3', L('h3', 'Tiêu đề nhỏ'), function () { lenh('formatBlock', 'h3'); }, 'sz-nut--h');
    nut(svg('M10 7H6a2 2 0 0 0-2 2v3h4l-2 5M20 7h-4a2 2 0 0 0-2 2v3h4l-2 5'),
        L('quote', 'Trích dẫn'), function () { lenh('formatBlock', 'blockquote'); });
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M4.5 6h.01M4.5 12h.01M4.5 18h.01']),
        L('ul', 'Danh sách'), function () { lenh('insertUnorderedList'); });
    nut(svg(['M10 6h10M10 12h10M10 18h10', 'M4 5h1v4M4 9h2M4 14.5h2v2H4v2h2']),
        L('ol', 'Danh sách đánh số'), function () { lenh('insertOrderedList'); });
    vach();

    /* ── Nhóm 3: chèn ── */
    nut(svg('M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'),
        L('link', 'Link') + ' (⌘K)', chenLink);
    nut(svg(['M3 5h18v14H3z', 'm3 16 5-5 4 4 3-3 6 6']),
        L('img', 'Ảnh'), chenAnh);
    nut(svg('M4 12h16'), L('hr', 'Đường kẻ ngang'), function () { lenh('insertHorizontalRule'); });
    vach();

    /* ── Nhóm 4: nhấn mạnh ── */
    nut(svg(['M5 19h14', 'M8 15 12 5l4 10z']), L('mark', 'Tô nền'), function () {
      if (goBoc(khung, function (n) { return n.nodeName === 'MARK'; })) { capNhat(); return; }
      bocChon(function () { return document.createElement('mark'); });
      capNhat();
    });

    var nutMau = nut(el('span', 'sz-cham'), L('color', 'Màu chữ'), function () { moBangMau(); });
    nutMau.classList.add('sz-nut--mau');
    var bangMau = veBangMau();
    vach();

    /* ── Nhóm 5: dọn ── */
    nut(svg(['M4 7h16', 'M9 7V5h6v2', 'M6 7l1 13h10l1-13']), L('clear', 'Xoá định dạng'), function () {
      goBoc(khung, function (n) { return n.nodeName === 'CODE' || n.nodeName === 'MARK' || !!lopMau(n); });
      lenh('removeFormat');
    });

    /* ── Nút CUỐI: chỉ dẫn ── */
    var nutI = nut('i', L('help', 'Cách dùng'), function () { moGiupDo(); }, 'sz-nut--i');
    nutI.setAttribute('aria-expanded', 'false');
    var bangGiup = veBangGiup();

    /* ══════════ BẢNG MÀU ══════════ */
    function veBangMau() {
      var b = el('div', 'sz-bang sz-bang--mau');
      b.hidden = true;
      MAU.forEach(function (m) {
        var o = el('button', 'sz-mau');
        o.type = 'button';
        o.title = m.ten;
        o.setAttribute('aria-label', m.ten);
        o.style.setProperty('--m', 'var(--c-' + m.ma + ')');
        o.appendChild(el('span', 'sz-mau-cham'));
        o.appendChild(el('span', 'sz-mau-ten', m.ten));
        o.addEventListener('mousedown', function (e) { e.preventDefault(); });
        o.addEventListener('click', function () {
          goBoc(khung, function (n) { return !!lopMau(n); });
          bocChon(function () {
            var s = document.createElement('span');
            s.className = 'c-' + m.ma;
            return s;
          });
          dongBang();
          capNhat();
        });
        b.appendChild(o);
      });
      var xoa = el('button', 'sz-mau sz-mau--bo');
      xoa.type = 'button';
      xoa.appendChild(el('span', 'sz-mau-cham'));
      xoa.appendChild(el('span', 'sz-mau-ten', L('noColor', 'Bỏ màu')));
      xoa.addEventListener('mousedown', function (e) { e.preventDefault(); });
      xoa.addEventListener('click', function () {
        goBoc(khung, function (n) { return !!lopMau(n); });
        dongBang(); capNhat();
      });
      b.appendChild(xoa);
      return b;
    }

    /* Hai bảng, một chỗ đứng: mở cái này thì cái kia đóng. Chồng lên nhau thì
       bảng dưới vẫn ăn được cú bấm mà không ai thấy nó ở đó. */
    function moBangMau() {
      bangGiup.hidden = true;
      nutI.setAttribute('aria-expanded', 'false');
      bangMau.hidden = !bangMau.hidden;
    }

    function dongBang() { bangMau.hidden = true; bangGiup.hidden = true; }

    /* ══════════ CHỈ DẪN ══════════
       Viết thành từng gạch đầu dòng NGẮN, mỗi dòng một việc. Đây là thứ đọc
       lúc đang quên, không phải thứ ngồi học — một đoạn văn xuôi ở đây thì
       người ta đóng lại và đi đoán tiếp. */
    function veBangGiup() {
      var b = el('div', 'sz-bang sz-bang--giup');
      b.hidden = true;
      var ds = el('ul', 'sz-giup-ds');
      [
        L('h1', 'Bôi đen chữ rồi bấm nút — không phải nhớ cú pháp nào cả.'),
        L('h2t', 'Đậm ⌘B · Nghiêng ⌘I · Link ⌘K (Ctrl trên Windows).'),
        L('h3t', 'Màu: bôi đen → bấm chấm tròn → chọn màu. Bấm lại màu cũ để bỏ.'),
        L('h4t', 'Xuống dòng trong cùng một đoạn: Shift + Enter.'),
        L('h5t', 'Ảnh: bấm nút ảnh rồi dán đường dẫn, dạng /media/2026/ten-bai/anh.png'),
        L('h6t', 'Dán từ nơi khác: giữ đậm/nghiêng/link, bỏ phông và cỡ chữ.'),
        L('h7t', 'Bài tự lưu nháp trên máy này; đóng nhầm tab vẫn còn.'),
        L('h8t', 'Bấm </> để xem đúng đoạn Markdown sắp gửi lên GitHub.')
      ].forEach(function (chu) { ds.appendChild(el('li', null, chu)); });
      b.appendChild(ds);
      return b;
    }

    function moGiupDo() {
      bangMau.hidden = true;
      bangGiup.hidden = !bangGiup.hidden;
      nutI.setAttribute('aria-expanded', bangGiup.hidden ? 'false' : 'true');
    }

    /* ══════════ CHÈN LINK / ẢNH ══════════
       `prompt` chứ không phải một khung tự dựng: nó xấu, nhưng nó chạy đúng
       trên mọi máy kể cả điện thoại, không cần bẫy phím Esc, không cần trả
       con trỏ về chỗ cũ. Ở một ô chỉ chủ trang dùng thì đó là đánh đổi đúng. */
    function chenLink() {
      var s = window.getSelection();
      var coChon = s && s.rangeCount && !s.isCollapsed;
      var chu = coChon ? s.toString() : '';
      var u = window.prompt(L('linkAsk', 'Đường dẫn:'), 'https://');
      if (!u) return;
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(u)) {
        u = 'https://' + u.replace(/^\/+/, '');
      }
      khung.focus();
      if (!coChon) {
        var t = window.prompt(L('linkText', 'Chữ hiện ra:'), u) || u;
        document.execCommand('insertHTML', false,
          '<a href="' + u.replace(/"/g, '%22') + '">' + t.replace(/[<>&]/g, '') + '</a>');
      } else {
        document.execCommand('createLink', false, u);
      }
      capNhat();
    }

    function chenAnh() {
      var u = window.prompt(L('imgAsk', 'Đường dẫn ảnh (bắt đầu bằng /media/):'), '/media/');
      if (!u) return;
      if (!/^(https?:\/\/|\/)/i.test(u)) return;
      var mo = window.prompt(L('imgAlt', 'Mô tả ảnh (cho người không xem được ảnh):'), '') || '';
      khung.focus();
      document.execCommand('insertHTML', false,
        '<p><img src="' + u.replace(/"/g, '%22') + '" alt="' + mo.replace(/[<>&"]/g, '') + '"></p>');
      capNhat();
    }

    /* ══════════ Ô XEM MARKDOWN ══════════ */
    var oMD = el('pre', 'sz-md');
    oMD.hidden = true;
    var nutMD = el('button', 'sz-nut sz-nut--md');
    nutMD.type = 'button';
    nutMD.textContent = '</>';
    nutMD.title = L('seeMd', 'Xem Markdown sắp gửi');
    nutMD.addEventListener('mousedown', function (e) { e.preventDefault(); });
    nutMD.addEventListener('click', function () {
      oMD.hidden = !oMD.hidden;
      nutMD.classList.toggle('sz-nut--bat', !oMD.hidden);
      if (!oMD.hidden) oMD.textContent = sangMD(khung) || L('empty', '(chưa có gì)');
    });
    thanh.appendChild(el('span', 'sz-day'));
    thanh.appendChild(nutMD);

    /* ══════════ TRẠNG THÁI NÚT ══════════
       Nút đang bật thì phải nhìn ra là đang bật — không thì bôi đen một cụm
       chữ đậm rồi bấm B lần nữa, người ta không biết mình vừa bật hay vừa tắt. */
    function capNhat() {
      [['bold', nDam], ['italic', nNgh], ['strikeThrough', nGac]].forEach(function (x) {
        var bat = false;
        try { bat = document.queryCommandState(x[0]); } catch (e) {}
        x[1].classList.toggle('sz-nut--bat', !!bat);
      });
      if (!oMD.hidden) oMD.textContent = sangMD(khung) || L('empty', '(chưa có gì)');
      luuNhap();
    }

    /* ══════════ DÁN ══════════ */
    khung.addEventListener('paste', function (e) {
      var dl = e.clipboardData;
      if (!dl) return;
      e.preventDefault();
      var html = dl.getData('text/html');
      if (html) {
        var tam = document.createElement('div');
        tam.innerHTML = html;
        /* Bỏ hẳn hai thẻ này TRƯỚC khi rửa: `rua()` rút thẻ lạ xuống còn phần
           chữ của nó, mà phần chữ của <script> và <style> là mã — rút xuống
           thì mã ấy hiện ra thành chữ giữa bài. */
        tam.querySelectorAll('script,style,meta,link,title').forEach(function (n) { n.remove(); });
        rua(tam);
        document.execCommand('insertHTML', false, tam.innerHTML);
      } else {
        document.execCommand('insertText', false, dl.getData('text/plain'));
      }
      capNhat();
    });

    /* ══════════ PHÍM ══════════ */
    khung.addEventListener('keydown', function (e) {
      var pt = e.metaKey || e.ctrlKey;
      if (pt && !e.altKey) {
        var p = e.key.toLowerCase();
        if (p === 'k') { e.preventDefault(); chenLink(); return; }
      }
      /* Enter trong một trích dẫn hoặc tiêu đề thì nên nhả về đoạn thường —
         không thì gõ tiếp là vẫn nằm trong khối cũ, và cả bài thành một khối
         trích dẫn khổng lồ mà không ai hiểu vì sao. */
      if (e.key === 'Enter' && !e.shiftKey) {
        setTimeout(function () {
          var s = window.getSelection();
          if (!s || !s.rangeCount) return;
          var n = s.getRangeAt(0).startContainer;
          var o = n.nodeType === 1 ? n : n.parentNode;
          var trong2 = o.closest ? o.closest('h1,h2,h3,h4') : null;
          if (trong2 && !trong2.textContent.trim()) {
            document.execCommand('formatBlock', false, 'p');
          }
          capNhat();
        }, 0);
      }
    });

    khung.addEventListener('input', capNhat);
    khung.addEventListener('keyup', capNhat);
    khung.addEventListener('mouseup', capNhat);

    /* ══════════ NHÁP TỰ LƯU ══════════
       Giữ HTML CỦA CHÍNH KHUNG, không giữ Markdown: khung đọc lại HTML được
       nguyên vẹn, còn đọc Markdown vào thì cần một bộ dựng thứ ba nữa. Bản
       nháp nằm trong localStorage của máy này, và bị xoá ngay khi bài đăng
       xong — giữ lại thì lần viết sau mở ra thấy bài cũ. */
    var KHO = 'zib-nhap-bai';
    var hen = null;
    function luuNhap() {
      if (hen) clearTimeout(hen);
      hen = setTimeout(function () {
        try {
          var h = khung.innerHTML;
          if (khung.textContent.trim()) localStorage.setItem(KHO, h);
          else localStorage.removeItem(KHO);
        } catch (e) {}
      }, 1200);
    }

    function doNhap() {
      try { return localStorage.getItem(KHO) || ''; } catch (e) { return ''; }
    }
    function boNhap() {
      try { localStorage.removeItem(KHO); } catch (e) {}
    }

    /* ══════════ RÁP LẠI ══════════ */
    khoiSoan.appendChild(thanh);
    khoiSoan.appendChild(bangMau);
    khoiSoan.appendChild(bangGiup);
    khoiSoan.appendChild(khung);
    khoiSoan.appendChild(oMD);
    oSan.appendChild(khoiSoan);

    /* Bấm ra ngoài thì đóng bảng đang mở. Nghe trên `document` chứ không trên
       khối: bấm vào ô Tiêu đề phía trên cũng phải đóng nó. */
    document.addEventListener('mousedown', function (e) {
      if (!khoiSoan.contains(e.target)) dongBang();
    });

    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
    try { document.execCommand('styleWithCSS', false, false); } catch (e) {}

    return {
      layMD   : function () { return sangMD(khung); },
      rong    : function () { return !khung.textContent.trim(); },
      nhapCu  : doNhap,
      datHTML : function (h) { khung.innerHTML = h || ''; capNhat(); },
      xoa     : function () { khung.innerHTML = ''; boNhap(); capNhat(); },
      boNhap  : boNhap,
      tapTrung: function () { khung.focus(); }
    };
  }

  window.ZIB = window.ZIB || {};
  window.ZIB.soan = { gan: gan, sangMD: sangMD, tuMD: tuMD };
})();
