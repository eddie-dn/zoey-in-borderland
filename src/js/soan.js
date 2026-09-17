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

  /* Chiều ngang tối đa sau khi thu nhỏ. Ảnh `{.full}` tràn hết bề ngang màn
     hình, mà màn 1440px trên máy có tỉ lệ điểm ảnh gấp đôi — 1800px là vừa đủ
     nét ở khổ ấy, và vẫn nhỏ hơn ảnh gốc của mọi máy ảnh.

     Hai hàm dưới nằm ở phạm vi NGOÀI `gan()` và được xuất ra `ZIB.soan`: ô ảnh
     bìa ở viet-bai.js cần đúng hai hàm này, mà nó không nằm trong khung soạn
     thảo nào. Chép lại thì có hai bộ luật nén ảnh, và bìa với ảnh trong bài sẽ
     lệch nhau về chất lượng mà không ai hiểu vì sao. */
  var RONG_TOI_DA = 1800;

  /* ── THU NHỎ VÀ ĐỔI SANG WEBP ──
     GIF đi thẳng, không qua canvas: canvas chỉ vẽ được KHUNG ĐẦU của một ảnh
     động, nên đi qua đây là ảnh động thành ảnh tĩnh mà không có gì báo.

     Mọi loại khác đều thử qua canvas, kể cả `.heic` của iPhone: Safari giải
     mã được nó, nên trên máy Mac một tấm .heic thả vào ra .webp chạy được ở
     mọi trình duyệt. Chrome không giải mã được thì `onerror` nổ, ta trả lại
     file gốc, và máy chủ từ chối kèm danh sách loại nhận được. */
  function thuNho(f) {
    return new Promise(function (xong) {
      if (f.type === 'image/gif') { xong(f); return; }
      var xem = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(xem);
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) { xong(f); return; }
        var ti = Math.min(1, RONG_TOI_DA / w);
        var c = document.createElement('canvas');
        c.width  = Math.max(1, Math.round(w * ti));
        c.height = Math.max(1, Math.round(h * ti));
        try {
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        } catch (e) { xong(f); return; }
        /* PNG thường là ảnh chụp màn hình hoặc sơ đồ — chữ nhỏ, nét mảnh, và
           nén mất mát mạnh làm chữ nhoè. Ảnh chụp thì ngược lại, 0.82 không
           nhìn ra khác biệt mà nhẹ hơn hẳn. */
        var net = f.type === 'image/png' ? 0.92 : 0.82;
        c.toBlob(function (b) {
          /* Trình duyệt không biết WebP thì `toBlob` lặng lẽ trả PNG, và PNG
             của một tấm ảnh chụp thường TO HƠN bản gốc. Nhỏ hơn mới lấy. */
          xong(b && b.size && b.size < f.size ? b : f);
        }, 'image/webp', net);
      };
      img.onerror = function () { URL.revokeObjectURL(xem); xong(f); };
      img.src = xem;
    });
  }

  function sangB64(blob) {
    return new Promise(function (xong, hong) {
      var r = new FileReader();
      r.onload  = function () { xong(String(r.result).replace(/^data:[^,]*,/, '')); };
      r.onerror = function () { hong(new Error('doc-khong-duoc')); };
      r.readAsDataURL(blob);
    });
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
    /* `~` và `^` vào danh sách từ bản này: chúng vừa thành cú pháp thật
       (`~dưới~`, `^trên^`), nên một câu gõ có dấu ngã hay dấu mũ mà không
       thoát thì bị đọc thành chỉ số. Trước đây `~` đã là cú pháp của
       `~~gạch~~` mà vẫn không thoát — một lỗ đã có sẵn, nay bịt luôn. */
    return String(s).replace(/([\\`*\[\]{}~^])/g, '\\$1');
  }

  /* ── TRẢ LẠI CỤM LỚP Ở CUỐI DÒNG ──
     Bộ dựng đọc `{.wide}`, `{.full}`, `{.thuong}`, `{.gallery poster=/x.jpg}`
     ở đuôi một đoạn hoặc một dòng `:::` như CÚ PHÁP, không như chữ. Nhưng
     `thoat()` bôi dấu chéo ngược lên mọi dấu ngoặc nhọn — nó phải làm thế, vì
     cú pháp màu `{tím: …}` cũng dùng đúng cặp ngoặc ấy và một câu văn có
     ngoặc nhọn thật thì không được biến mất vào một thẻ span.

     Nên ở đây nhả lại đúng một trường hợp: cụm NẰM CUỐI dòng mà bên trong
     toàn là lớp (`.x`) hoặc thuộc tính (`k=v`). Một câu kết thúc bằng
     `{ghi chú}` không lọt qua được cửa ấy, và vẫn ra dấu ngoặc thật. */
  function nhaLopCuoi(s) {
    return String(s).replace(/\\\{([^{}\\]*)\\\}(\s*)$/, function (ca, trong, sau) {
      var muc = trong.trim().split(/\s+/);
      var ok = trong.trim() !== '' && muc.every(function (t) {
        return t.charAt(0) === '.' || t.indexOf('=') > 0;
      });
      return ok ? '{' + trong + '}' + sau : ca;
    });
  }

  /* ── TRẢ LẠI CÚ PHÁP MỞ ĐẦU MỘT DÒNG ──
     Cùng phép với `nhaLopCuoi`, cho hai thứ khác:

       ```js        mở (hoặc đóng) một khối mã
       - [ ]        ô đánh dấu việc

     `thoat()` bôi dấu chéo ngược lên dấu huyền và dấu ngoặc vuông — đúng khi
     chúng nằm giữa câu, sai khi chúng MỞ ĐẦU một dòng, vì ở đó chúng là cú
     pháp chứ không phải chữ. Không nhả lại thì một khối mã gõ trong ô soạn
     thảo in nguyên mấy dấu chéo ra giữa bài.

     Neo vào ĐẦU DÒNG, nên một câu văn có dấu ngoặc vuông ở giữa không lọt qua
     được. Chạy một lần trên chuỗi cuối cùng, vì cả hai đều là luật theo DÒNG —
     mà "dòng" chỉ thành hình sau khi mọi khối đã nối lại với nhau. */
  function nhaDauDong(s) {
    /* Cờ "đang ở trong khối mã" để làm nốt một việc dọn: mỗi dòng gõ bằng
       Shift+Enter kết thúc bằng HAI DẤU CÁCH — đó là cách Markdown ghi một cú
       xuống dòng cứng. Trong văn xuôi chúng vô hình; trong khối mã thì chúng
       đi thẳng vào file .md và nằm lại ở đuôi mọi dòng mã, thứ mà trình soạn
       thảo nào cũng tô đỏ và `git diff` thì hiện ra. */
    var trongMa = false;
    return String(s).split('\n').map(function (d) {
      var ra = d
        .replace(/^(\s*)((?:\\`){3,})/, function (_, le, ba) {
          return le + ba.replace(/\\/g, '');
        })
        .replace(/^(\s*(?:[-*+]\s+)?)\\\[( |x|X)\\\]/, '$1[$2]');
      var vach = /^\s*`{3,}/.test(ra);
      if (trongMa && !vach) ra = ra.replace(/\s+$/, '');
      if (vach) trongMa = !trongMa;
      return ra;
    }).join('\n');
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
        /* ── `data-that` ĐI TRƯỚC `src`, VÀ ĐÓ LÀ CẢ CƠ CHẾ THẢ ẢNH ──
           Ảnh vừa tải lên chưa có ở địa chỉ công khai của nó — Cloudflare còn
           đang dựng, khoảng một phút. Nên `src` trỏ vào bản xem TẠI CHỖ trong
           bộ nhớ trình duyệt (một `blob:` URL), để người viết thấy tấm ảnh
           ngay; còn đường dẫn THẬT nằm ở `data-that`.

           File .md phải mang đường dẫn thật. Một `blob:` URL sống đúng một
           phiên trình duyệt: ghi nó vào bài là ghi một đường chết. */
        ra += '![' + (c.getAttribute('alt') || '') + ']('
            + (c.getAttribute('data-that') || c.getAttribute('src') || '')
            + (ti ? ' "' + ti + '"' : '') + ')'
            + (lopA || '');
        continue;
      }

      var mau = lopMau(c);
      if (mau) { ra += boc('{' + TEN_MD[mau] + ': ', trong(c), '}'); continue; }

      if (the === 'STRONG' || the === 'B') { ra += boc('**', trong(c)); continue; }
      if (the === 'EM' || the === 'I')     { ra += boc('*',  trong(c)); continue; }
      if (the === 'DEL' || the === 'S' || the === 'STRIKE') { ra += boc('~~', trong(c)); continue; }
      if (the === 'MARK') { ra += boc('==', trong(c)); continue; }
      /* Ba thẻ mới. `KBD` bọc bằng ngoặc vuông ĐÔI, nên `boc` nhận hai đầu
         khác nhau — tham số thứ ba của nó có đúng để làm việc ấy. */
      if (the === 'SUP') { ra += boc('^', trong(c)); continue; }
      if (the === 'SUB') { ra += boc('~', trong(c)); continue; }
      if (the === 'KBD') { ra += boc('[[', trong(c), ']]'); continue; }

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
        if (t) ra.push(thut + nhaLopCuoi(thoat(t)));
        continue;
      }
      if (c.nodeType !== 1) continue;

      /* Nhãn ở đầu một khối ::: là thứ VẼ RA cho người gõ nhìn, không phải nội
         dung — tên loại và tiêu đề khối đã nằm ở `data-khoi` / `data-nhan` rồi.
         Không bỏ qua ở đây thì nó ra Markdown thành một đoạn văn thừa nằm ngay
         trong khối, và mỗi lượt mở-lưu lại đẻ thêm một đoạn nữa. */
      if (c.classList && c.classList.contains('sz-khoi-nhan')) continue;

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
          /* Ô đánh dấu việc. Nó là một thuộc tính trên <li>, không phải một
             ký tự trong chữ — nếu để người ta gõ "[ ]" vào đầu dòng thì mỗi
             lần sửa lại phải né đúng ba ký tự ấy. */
          var viec = li.getAttribute && li.getAttribute('data-viec');
          var dauViec = viec == null ? '' : (viec === '1' ? '[x] ' : '[ ] ');
          muc.push(thut + dau + dauViec + trong(ban) + (con.length ? '\n' + con.join('\n') : ''));
        }
        if (muc.length) ra.push(muc.join('\n'));
        continue;
      }

      if (the === 'FIGURE') { ra.push(thut + trong(c)); continue; }

      /* ── KHỐI ::: (ghi chú, mẹo, lưu ý, đừng làm, dải ảnh, tràn lề) ──
         Trong khung soạn thảo nó là một <div data-khoi="note" data-nhan="…">
         có viền và có nhãn, tức là NHÌN RA ngay nó là cái gì. Ra Markdown thì
         nó trở lại đúng ba dòng mà bộ dựng đọc được:

             :::note Đọc thêm
             <nội dung>
             :::

         Nhãn ở đầu khối là `contenteditable=false` nên nó không lọt vào phần
         nội dung; ở đây bỏ qua nó bằng cách đọc `data-nhan` thay vì đọc chữ. */
      if (the === 'DIV' && c.getAttribute && c.getAttribute('data-khoi')) {
        var loai = c.getAttribute('data-khoi');
        /* ── TIÊU ĐỀ ĐỌC TỪ CHÍNH Ô GÕ, KHÔNG TỪ `data-nhan` ──
           Từ V16.08 tiêu đề khối sửa được ngay tại chỗ (xem `chenKhoi`), nên
           nguồn đúng là chữ trong ô ấy. `data-nhan` chỉ còn là đường lùi cho
           khối dựng bằng bản cũ — bỏ hẳn thì một bài đang mở dở trong tab kia
           lưu lại là mất tiêu đề. */
        var oDe = c.querySelector('.sz-khoi-de');
        var nhanK = (oDe ? oDe.textContent : (c.getAttribute('data-nhan') || ''))
                      .replace(/[\r\n]+/g, ' ').trim();
        var trongK = [];
        khoi(c, trongK, '');
        ra.push(thut + ':::' + loai + (nhanK ? ' ' + nhanK : '') + '\n\n' +
                trongK.join('\n\n') + '\n\n' + thut + ':::');
        continue;
      }

      /* P, DIV, và mọi thứ còn lại: một đoạn. Trình duyệt đôi khi đẻ ra <div>
         thay vì <p> (Safari vẫn làm thế ở vài chỗ dù đã khai
         defaultParagraphSeparator), nên không phân biệt hai cái ấy. */
      var d = trong(c);
      /* Chỉ ngắt lại khi đoạn đứng ở cấp NGOÀI CÙNG (`thut` rỗng). Đoạn nằm
         trong một mục danh sách đã mang lề thụt, mà ngắt thêm ở đó thì dòng
         tràn ra mất lề và nhảy khỏi mục. */
      d = nhaLopCuoi(d);
      /* ── LỚP CỦA CẢ ĐOẠN ──
         `{.giua}`, `{.thuong}` là thuộc tính của ĐOẠN, không phải chữ trong
         đoạn. Giữ chúng ở `data-lop` thì người viết không phải né mấy ký tự ấy
         mỗi lần sửa câu cuối, và bấm nút lần nữa là gỡ ra — thứ không làm được
         nếu để chúng nằm lẫn trong chữ. */
      var lopDoan = c.getAttribute && c.getAttribute('data-lop');
      if (d.trim() && lopDoan) d += ' ' + lopDoan;
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
       đúng cái dấu hiệu cũ — hai dấu cách rồi xuống dòng.

       HAI LOẠI DÒNG KHÔNG ĐƯỢC NGẮT, dài bao nhiêu cũng để nguyên:

         · hàng của một bảng — bộ dựng đọc bảng theo DÒNG, nên một hàng bị bẻ
           làm đôi là bảng vỡ thành hai hàng lệch số cột;
         · ảnh hoặc video đứng riêng một dòng — mỗi dòng như thế ra một
           <figure>; bẻ đôi thì nửa sau thành một đoạn văn chở nguyên cú pháp
           Markdown ra giữa bài.

       Cả hai đều chỉ lộ ra ở lượt lưu THỨ HAI: lượt đầu còn ngắt đúng chỗ, lượt
       sau đọc lại phần đã bị bẻ và không nhận ra nó nữa. Cùng lý do với ba chỗ
       đã liệt kê ở chú thích của `ngatMot`. */
    var GIU_NGUYEN = [
      /^\s*\|/,                                        /* hàng bảng */
      /^\s*!\[[^\]]*\]\([^)]*\)\s*(\{[^}]*\})?\s*$/,   /* ảnh đứng riêng */
      /^\s*@[a-z]+\\?\[/i                              /* @youtube[…] và họ hàng */
    ];
    return String(s).split('  \n')
      .map(function (d) {
        return GIU_NGUYEN.some(function (re) { return re.test(d); }) ? d : ngatMot(d);
      })
      .join('  \n');
  }

  function sangMD(goc) {
    var ra = [];
    khoi(goc, ra, '');
    return nhaDauDong(ra.join('\n\n')
      .replace(/ /g, ' ')          /* dấu cách cứng do contenteditable đẻ ra */
      .replace(/[ \t]+$/gm, function (m) { return m === '  ' ? m : ''; })
      .replace(/\n{3,}/g, '\n\n')
      .trim());
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
     dạng mấy dòng gạch đứng — xấu, nhưng còn nguyên.

     "Còn nguyên" ấy có điều kiện, và điều kiện đó từng KHÔNG được giữ: nếu nối
     mấy dòng ấy lại bằng dấu cách thì phép ngắt lại 80 cột ở `sangMD` xáo hết
     chỗ ngắt, và lưu một lần là bảng vỡ thật — mất nội dung, không chỉ xấu.
     Nay đoạn nào có dòng-là-nội-dung (bảng, ảnh đứng riêng) được nối bằng cú
     ngắt dòng CỨNG; xem nhánh đoạn văn ở cuối hàm.

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
    s = String(s).replace(/\\([\\`*\[\]{}~^])/g, function (_, c) { return cat(thoatHTML(c)); });
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
    /* Cùng thứ tự với bộ dựng thật: `~~gạch~~` TRƯỚC `~dưới~`, không thì cặp
       dấu ngã đôi bị đọc thành hai lần chỉ số dưới lồng nhau. */
    s = s.replace(/(^|[^~])~(?=\S)([^~\s]*?\S)~(?!~)/g, '$1<sub>$2</sub>');
    s = s.replace(/\^(?=\S)([^^\s]*?\S)\^/g, '<sup>$1</sup>');
    s = s.replace(/\[\[(?=\S)([^\][]*?\S)\]\]/g, '<kbd>$1</kbd>');
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

      /* ── KHỐI ::: ──
         Gom tới dòng `:::` đóng, rồi đọc phần bên trong bằng chính hàm này.
         Đếm tầng để một khối lồng trong một khối không làm dòng đóng của khối
         trong đóng mất khối ngoài.

         Không nhận ra loại khối thì CỨ DỰNG: bộ dựng thật nhận note · tip ·
         warn · stop · gallery · wide · full, và danh sách ấy có thể dài thêm.
         Giữ nguyên tên loại rồi trả lại y như cũ lúc lưu là cách duy nhất để
         một khối kiểu mới đi qua khung soạn thảo mà không bị nghiền nát. */
      var moKhoi = d.match(/^:::\s*([\w-]+)\s*(.*)$/);
      if (moKhoi) {
        i++;
        var tang = 1, thanK = [];
        while (i < dong.length) {
          if (/^:::\s*$/.test(dong[i])) { tang--; if (!tang) { i++; break; } }
          else if (/^:::\s*[\w-]+/.test(dong[i])) tang++;
          thanK.push(dong[i]); i++;
        }
        var ten = moKhoi[1], nhanK = (moKhoi[2] || '').trim();
        ra.push('<div class="sz-khoi" data-khoi="' + ten.replace(/"/g, '') + '">' +
                '<div class="sz-khoi-nhan">' +
                  '<span class="sz-khoi-loai" contenteditable="false">' +
                    thoatHTML(ten) + '</span>' +
                  '<span class="sz-khoi-de" data-cho="Title — type here">' +
                    thoatHTML(nhanK) + '</span>' +
                '</div>' +
                tuMD(thanK.join('\n')) + '</div>');
        continue;
      }

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
          /* `- [ ] việc` / `- [x] việc` → một mục có ô đánh dấu. Bắt ở đây
             chứ không ở `nhoMD`: nó là thuộc tính của CẢ MỤC, không phải một
             nét nằm giữa chữ. */
          var oViec = chu.match(/^\[( |x|X)\]\s+([\s\S]*)$/);
          var thuocViec = '';
          if (oViec) {
            thuocViec = ' data-viec="' + (oViec[1] === ' ' ? '0' : '1') + '"';
            chu = oViec[2];
          }
          muc.push('<li' + thuocViec + '>' + nhoMD(chu) +
                   (con.length ? tuMD(con.join('\n')) : '') + '</li>');
        }
        ra.push((co ? '<ol>' : '<ul>') + muc.join('') + (co ? '</ol>' : '</ul>'));
        continue;
      }

      /* Đoạn: gom tới dòng trống hoặc tới dòng mở một khối khác. */
      var doan = [];
      while (i < dong.length && dong[i].trim()
             && !/^(#{1,4}\s|>|```|:::)/.test(dong[i])
             && !dsThuong.test(dong[i]) && !dsSo.test(dong[i]) && !laVach(dong[i])) {
        doan.push(dong[i]); i++;
      }
      if (doan.length) {
        /* ── CÓ NHỮNG ĐOẠN MÀ CHỖ NGẮT DÒNG LÀ NỘI DUNG ──
           Văn xuôi thì chỗ ngắt dòng chỉ là chỗ ngắt: bộ dựng nối lại thành
           một đoạn, và khung soạn thảo cũng nối lại. Nhưng hai thứ dưới đây
           thì bộ dựng đọc THEO DÒNG:

             · bảng   — mỗi dòng một hàng của bảng;
             · ảnh và video đứng riêng một dòng — mỗi dòng một <figure>, và
               đó là thứ làm nên một dải ảnh.

           Nối chúng lại bằng dấu cách là bảng thành một đoạn văn đầy gạch
           đứng, và dải ảnh thành một đoạn có mấy tấm ảnh nằm ngang. Chú thích
           cũ ở đầu `tuMD` từng hứa "xấu nhưng còn nguyên" — không đúng: phép
           ngắt lại 80 cột ở `sangMD` xáo luôn chỗ ngắt, nên lưu lại một lần là
           bảng hỏng thật.

           Nên ở đây nối bằng cú ngắt dòng CỨNG (hai dấu cách rồi xuống dòng).
           Bộ dựng hiểu nó đúng như hiểu một dòng riêng, và `xuongDong()` thì
           cắt trước ở mọi cú ngắt cứng nên nó không xáo được nữa. */
        var laDong = doan.some(function (d) {
          return /^\s*\|/.test(d) ||
                 /^\s*!\[[^\]]*\]\([^)]*\)\s*(\{[^}]*\})?\s*$/.test(d) ||
                 /^\s*@[a-z]+\\?\[/i.test(d);
        });
        /* Cắt khoảng trắng cuối mỗi dòng TRƯỚC khi nối, và chỉ ở nhánh này:
           dòng đọc vào có thể đã mang sẵn hai dấu cách của lượt lưu trước, cộng
           thêm hai dấu nữa là bốn — mà `sangMD` chỉ giữ lại đúng HAI. Kết quả
           là bản lưu lần này rụng mất hai dấu cách so với lần trước, lần sau
           lại mọc ra, và `git diff` kêu ở mấy dòng bảng sau mỗi lượt sửa dù
           chẳng ai động vào chúng. Nhánh văn xuôi thì KHÔNG cắt: ở đó hai dấu
           cách cuối dòng là cú ngắt dòng cứng người viết cố ý đặt. */
        var chuDoan = laDong
          ? doan.map(function (d) { return d.replace(/\s+$/, ''); }).join('  \n')
          : doan.join('\n');
        /* Cụm lớp ở CUỐI đoạn đi vào `data-lop`, không ở lại trong chữ — để
           nút bật/tắt được và để người viết khỏi thấy cú pháp giữa bài.

           TRỪ dòng ẢNH và dòng VIDEO đứng một mình: ở đó cụm lớp thuộc về
           chính tấm ảnh / cái video, và nó phải DÍNH LIỀN dấu ngoặc đóng —
           `![x](y){.wide}`, không có dấu cách. Bộ dựng bắt nó bằng một biểu
           thức đòi `)` rồi tới `{` ngay; chen một dấu cách vào là cả cụm lớp
           rơi ra thành chữ thường giữa bài. `trong()` đã lo phần ấy qua
           `data-lop` của chính thẻ <img>, nên ở đây chỉ cần tránh đường. */
        var laMedia = /^\s*(!\[[^\]]*\]\([^)]*\)|@[a-z]+\\?\[[^\]]*\\?\]\([^)]*\))\s*(\{[^}]*\})?\s*$/i
                        .test(chuDoan);
        var mLop = laMedia ? null : chuDoan.match(/\s*(\{[.\w\s=\/-]*\})\s*$/);
        var thuocLop = '';
        if (mLop && /\./.test(mLop[1])) {
          thuocLop = ' data-lop="' + mLop[1].replace(/"/g, '') + '"';
          chuDoan = chuDoan.slice(0, mLop.index);
        }
        ra.push('<p' + thuocLop + '>' + nhoMD(chuDoan) + '</p>');
      }
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
      if (the === 'IMG') giu = ['src', 'alt', 'data-tieu', 'data-lop', 'data-that'];
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
        /* `blob:` được đi qua CHỈ KHI có `data-that` đi kèm — tức là một tấm
           vừa thả vào, đang chờ Cloudflare dựng, và đã biết mình sẽ nằm ở đâu.
           Không có `data-that` thì đó là một `blob:` từ chỗ khác dán sang: nó
           chết ngay khi đóng tab, và vào bài thì thành ô ảnh vỡ vĩnh viễn. */
        var tam = /^blob:/i.test(sc) && n.getAttribute('data-that');
        if (!tam && !/^(https?:\/\/|\/)/i.test(sc)) n.remove();
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

     ── VÌ SAO KHÔNG CÒN LÀ `surroundContents` ──
     Bản trước gọi `range.surroundContents(span)`, và rơi về `extractContents`
     khi nó ném lỗi. Hai chỗ hỏng, cả hai đều im lặng:

       1. TÔ LẠI MỘT CỤM ĐÃ CÓ MÀU thì màu BIẾN MẤT, không đổi sang màu mới.
          Chỗ gọi phải gỡ lớp cũ trước (`goBoc`), mà phép gỡ ấy thay cả thẻ
          bằng chữ trần — tức là huỷ luôn vùng chọn. Lượt bọc ngay sau đó đọc
          `getSelection()` ra một vùng rỗng và lặng lẽ không làm gì.
          Đây đúng là "bấm màu mà không thấy màu chạy".

       2. BÔI ĐEN QUA HAI ĐOẠN VĂN thì `extractContents` lôi cả thẻ <p> ra,
          rồi nhét chúng VÀO TRONG một <span> — HTML thành `<span><p>…</p></span>`
          nằm cạnh một <p> khác, hai đoạn văn bị cắt thành bốn, và Markdown
          xuất ra dính liền hai đoạn vào nhau.

     ── CÁCH LÀM MỚI: ĐI TỪNG NÚT CHỮ ──
     Cắt hai đầu vùng chọn cho khớp mép chữ, gom đúng những NÚT CHỮ nằm trong
     đó, rồi bọc từng nút một. Không nút khối nào bị động tới, nên cấu trúc
     đoạn văn còn nguyên dù bôi qua bao nhiêu đoạn. Lớp cũ cùng loại thì gỡ
     bằng cách TÁCH ĐÔI nó — phần chữ ngoài vùng chọn giữ nguyên màu cũ. */

  /* Tách cây từ `t` lên tới `toi` (không kể `toi`), sao cho nhánh chứa `t`
     không còn anh em nào. Đây là phép mở đường để gỡ một lớp bọc ra khỏi ĐÚNG
     phần chữ đang chọn mà không đụng phần còn lại của lớp ấy. */
  function tachTren(t, toi) {
    var n = t;
    while (n.parentNode && n.parentNode !== toi) {
      var cha = n.parentNode;
      if (n.previousSibling) {
        var truoc = cha.cloneNode(false);
        while (cha.firstChild !== n) truoc.appendChild(cha.firstChild);
        cha.parentNode.insertBefore(truoc, cha);
      }
      if (n.nextSibling) {
        var sau = cha.cloneNode(false);
        while (n.nextSibling) sau.appendChild(n.nextSibling);
        cha.parentNode.insertBefore(sau, cha.nextSibling);
      }
      n = cha;
    }
    return n;
  }

  /* Có lớp bọc loại `hop` nào đang ôm `t` không? */
  function coBoc(t, khung, hop) {
    var n = t.parentNode;
    while (n && n !== khung) { if (n.nodeType === 1 && hop(n)) return true; n = n.parentNode; }
    return false;
  }

  /* Gỡ mọi lớp bọc loại `hop` đang ôm `t`, và CHỈ gỡ phần của `t`. */
  function goBocQuanh(t, khung, hop) {
    var ngoai = null, n = t.parentNode;
    while (n && n !== khung) { if (n.nodeType === 1 && hop(n)) ngoai = n; n = n.parentNode; }
    if (!ngoai || !ngoai.parentNode) return;
    tachTren(t, ngoai.parentNode);
    /* Gom chuỗi tổ tiên TRƯỚC khi gỡ: gỡ xong thì `t.parentNode` đã đổi, mà
       đi từ trong ra ngoài thì các tham chiếu bên ngoài vẫn còn nguyên. */
    var chuoi = [], m = t.parentNode;
    while (m && m !== khung) { chuoi.push(m); if (m === ngoai) break; m = m.parentNode; }
    chuoi.forEach(function (v) {
      if (v.nodeType === 1 && hop(v) && v.parentNode) thayBangChu(v);
    });
  }

  /* Cắt hai đầu vùng chọn cho khớp mép chữ, rồi trả về đúng những nút chữ nằm
     trong đó. Mảng rỗng = không có gì để bọc. */
  function nutChuTrongChon(khung) {
    try { return nutChu1(khung); } catch (e) { return []; }
  }
  function nutChu1(khung) {
    var s = window.getSelection();
    if (!s || !s.rangeCount || s.isCollapsed) return [];
    var r = s.getRangeAt(0);
    if (!khung.contains(r.commonAncestorContainer)) return [];

    /* Cùng một nút chữ ở cả hai đầu: cắt hai nhát, lấy khúc giữa. Phải làm
       riêng — cắt đầu trước thì mốc cuối trỏ vào một nút đã ngắn đi.

       ĐỌC HAI MỐC RA BIẾN TRƯỚC KHI CẮT. `splitText` dời mốc của mọi Range
       đang sống trong nút ấy: mốc nào lớn hơn chỗ cắt thì nhảy sang nút mới và
       trừ đi đúng chỗ cắt, mốc nào BẰNG chỗ cắt thì ở lại nút cũ. Nên sau nhát
       cắt đầu, `r.startOffset` còn 6 (ở nút cũ) trong khi `r.endOffset` đã
       thành 4 (ở nút mới) — hiệu của chúng ra âm, và `splitText(-2)` ném lỗi
       ngay giữa cú bấm. Đúng lỗi này từng làm nút màu im lặng không chạy. */
    if (r.startContainer === r.endContainer && r.startContainer.nodeType === 3) {
      var t = r.startContainer;
      var d0 = r.startOffset, d1 = r.endOffset;
      if (d1 <= d0) return [];
      var giua = d0 > 0 ? t.splitText(d0) : t;
      if (d1 - d0 < giua.nodeValue.length) giua.splitText(d1 - d0);
      return giua.nodeValue ? [giua] : [];
    }

    /* Cắt ĐUÔI trước rồi mới cắt ĐẦU: `splitText` giữ phần trước ở nút cũ, nên
       mốc cuối (nút, offset) vẫn đúng sau nhát cắt của chính nó. */
    if (r.endContainer.nodeType === 3 &&
        r.endOffset > 0 && r.endOffset < r.endContainer.nodeValue.length) {
      r.endContainer.splitText(r.endOffset);
    }
    if (r.startContainer.nodeType === 3 &&
        r.startOffset > 0 && r.startOffset < r.startContainer.nodeValue.length) {
      r.setStart(r.startContainer.splitText(r.startOffset), 0);
    }

    var ds = [];
    var di = document.createTreeWalker(khung, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = di.nextNode())) {
      if (!n.nodeValue) continue;
      /* `comparePoint` trả 0 khi điểm nằm TRONG vùng (kể cả đúng mép). Hỏi cả
         hai đầu của nút: chỉ nút nằm TRỌN trong vùng mới được bọc — mà sau hai
         nhát cắt trên thì mọi nút đáng bọc đều nằm trọn. */
      try {
        if (r.comparePoint(n, 0) !== 0) continue;
        if (r.comparePoint(n, n.nodeValue.length) !== 0) continue;
      } catch (e) { continue; }
      ds.push(n);
    }
    return ds;
  }

  function chonLai(ds) {
    var s = window.getSelection();
    if (!s || !ds.length || !ds[0].parentNode) return;
    try {
      var r = document.createRange();
      r.setStartBefore(ds[0]);
      r.setEndAfter(ds[ds.length - 1]);
      s.removeAllRanges(); s.addRange(r);
    } catch (e) {}
  }

  /* Gộp hai vỏ giống hệt nhau nằm cạnh nhau. Bôi qua một cụm chữ có sẵn thẻ
     <strong> ở giữa thì ra ba nút chữ, tức ba cái <span class="c-tim"> liền
     nhau — Markdown xuất ra `{tím: a}{tím: b}{tím: c}`, đọc được nhưng bẩn. */
  function gopKe(ds) {
    ds.forEach(function (t) {
      var v = t.parentNode;
      if (!v || v.nodeType !== 1) return;
      var truoc = v.previousSibling;
      if (truoc && truoc.nodeType === 1 && truoc.nodeName === v.nodeName &&
          truoc.className === v.className && truoc.className !== '') {
        while (v.firstChild) truoc.appendChild(v.firstChild);
        v.parentNode.removeChild(v);
      }
    });
  }

  /* `tao()`   dựng cái vỏ mới.
     `laNo(n)`  nhận ra vỏ ĐÚNG CÁI NÀY đã có sẵn → bấm lại lần nữa là gỡ ra.
     `goCa(n)`  nhận ra vỏ CÙNG HỌ cần gỡ trước khi bọc; mặc định là `laNo`.

     Hai vị từ, không phải một, vì với MÀU chúng khác nhau: bấm Lục lên một cụm
     đang Tím thì "đã là cái này chưa" trả lời KHÔNG (nên phải bọc), còn "có vỏ
     cùng họ phải gỡ không" trả lời CÓ (nên phải gỡ Tím trước). Gộp làm một thì
     hoặc là không gỡ được — ra `{tím: {lục: chữ}}`, một cụm lồng mà bộ dựng
     không đọc nổi — hoặc là không bọc được.

     Trả về `false` khi KHÔNG có gì được chọn; mọi trường hợp khác trả về thứ
     khác `false`, để chỗ gọi phân biệt được "không có vùng chọn" với "đã làm
     xong việc". */
  function bocChon(khung, tao, laNo, goCa) {
    var ds = nutChuTrongChon(khung);
    if (!ds.length) return false;
    goCa = goCa || laNo;

    var daCo = !!laNo && ds.every(function (t) { return coBoc(t, khung, laNo); });
    if (goCa) ds.forEach(function (t) { goBocQuanh(t, khung, goCa); });
    if (daCo) { chonLai(ds); return true; }

    ds.forEach(function (t) {
      if (!t.parentNode) return;
      var v = tao();
      t.parentNode.insertBefore(v, t);
      v.appendChild(t);
    });
    gopKe(ds);
    chonLai(ds);
    return ds[0].parentNode || true;
  }

  /* Gỡ một lớp bọc khi con trỏ đang nằm trong nó mà KHÔNG bôi đen gì — dùng
     cho nút "dọn định dạng". Có vùng chọn thì `bocChon` lo, và nó gỡ chính
     xác hơn (chỉ phần được chọn). */
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

    /* ── AI GỬI ẢNH LÊN LÀ VIỆC CỦA TRANG CHỦ QUẢN, KHÔNG PHẢI CỦA Ô NÀY ──
       Ô soạn thảo không biết bài đang viết tên gì, đăng năm nào, hay khoá chủ
       trang nằm ở đâu — mà cả ba thứ ấy đều cần để xếp ảnh vào đúng thư mục.
       Trang gọi `gan()` thì biết đủ, nên nó đưa vào đây một hàm nhận
       `{ten, loai, duLieu}` và hứa trả về `{duong}`.

       Không có hàm ấy thì kéo thả im lặng không làm gì — đúng như trước bản
       này — chứ không hỏng. */
    var taiAnh = typeof tuyChon.taiAnh === 'function' ? tuyChon.taiAnh : null;

    /* Trang chủ quản muốn biết mỗi lúc bài đổi — để tính lại bảng SEO. Gọi từ
       `capNhat()`, tức là sau MỖI phím gõ: chỗ nghe phải tự hoãn lại, và
       viet-bai.js làm đúng thế. Ở đây không hoãn, vì ô soạn thảo không biết
       việc bên kia nặng hay nhẹ. */
    var khiDoi = typeof tuyChon.khiDoi === 'function' ? tuyChon.khiDoi : null;

    var khoiSoan = el('div', 'sz');

    /* ── THANH NÚT ── */
    var thanh = el('div', 'sz-thanh');
    thanh.setAttribute('role', 'toolbar');
    thanh.setAttribute('aria-label', L('toolbar', 'Format'));

    var khung = el('div', 'sz-khung');
    khung.contentEditable = 'true';
    khung.setAttribute('role', 'textbox');
    khung.setAttribute('aria-multiline', 'true');
    khung.setAttribute('aria-label', L('body', 'Post body'));
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
      (nhomNay || thanh).appendChild(b);
      return b;
    }

    /* ── MỖI NHÓM MỘT KHUNG, ĐỂ NÓ KHÔNG BỊ XÉ NGANG ──
       Thanh này `flex-wrap:wrap`, nên ở khổ hẹp nó tự rớt xuống hàng hai —
       đúng ý. Nhưng khi mỗi cái nút là một ô rời thì chỗ rớt rơi vào GIỮA một
       nhóm: "B I 🔗" có thể thành "B I" ở hàng trên và "🔗" ở hàng dưới, và
       cái vạch ngăn thì đứng lạc một mình ở đầu hàng.

       Bọc mỗi nhóm trong một `<span>` thì cả nhóm là MỘT ô của hàng: nó xuống
       hàng nguyên cụm hoặc không xuống. Vạch ngăn thôi là một phần tử riêng
       mà thành đường viền trái của nhóm — bớt được chín thẻ rỗng, và không
       bao giờ có vạch mồ côi.

       `vach()` giữ nguyên tên và nguyên chỗ gọi: nó nay mở một nhóm MỚI thay
       vì vẽ một cái vạch. Mọi chỗ gọi cũ vẫn đúng nghĩa "từ đây là nhóm
       khác". */
    /* ── HAI HÀNG, CHIA THEO NGHĨA ──
       Bản trước để một hàng dài rồi cho nó tự rớt xuống hàng hai khi hết chỗ.
       Chỗ rớt vì thế do BỀ NGANG CỬA SỔ quyết định, không do nghĩa: cùng một
       thanh, màn rộng thì "x² x₂ ⌨" nằm hàng trên, màn hẹp hơn một chút thì
       nó xuống hàng dưới. Người dùng không bao giờ nhớ được nút ở đâu.

       Nay hai hàng CỐ ĐỊNH, và ranh giới là một câu hỏi trả lời được:

         hàng 1 — đổi CHỮ:   hoàn tác · đậm nghiêng liên kết · gạch mã nhấn
                             màu · chỉ số trên dưới phím
         hàng 2 — đổi KHỐI:  tiêu đề trích dẫn danh sách căn dòng · ảnh khối ·
                             thụt ra vào đoạn vạch · dọn định dạng

       "Đổi chữ" là việc làm với phần đang bôi đen; "đổi khối" là việc làm với
       cả đoạn con trỏ đang đứng. Hai loại ấy khác nhau ở tay người dùng, nên
       tách ra thì tìm nhanh hơn hẳn — và mỗi hàng còn chừng mười nút, đủ ngắn
       để quét một lượt bằng mắt. */
    /* Dựng sẵn cả hai hàng, rồi `vach(n)` thả nhóm vào hàng n. Làm vậy thì
       THỨ TỰ MÃ giữ nguyên — không phải dời mấy khối bốn chục dòng đi chỗ
       khác chỉ để đổi chỗ chúng trên màn hình, và mỗi nhóm vẫn nằm cạnh đúng
       cái chú thích giải thích nó. */
    var hang = [el('div', 'sz-hang'), el('div', 'sz-hang')];
    thanh.appendChild(hang[0]);
    thanh.appendChild(hang[1]);
    var nhomNay = null;
    function vach(n) {
      nhomNay = el('span', 'sz-nhom');
      hang[(n || 1) - 1].appendChild(nhomNay);
    }

    /* ══════════════════════════════════════════════════════════════
       THỨ TỰ TRÊN THANH: CHÍNH TRƯỚC, PHỤ SAU

       Hai mươi lăm cái nút trên một hàng thì thứ tự không còn là chuyện thẩm
       mỹ. Bản trước xếp theo LOẠI KỸ THUẬT — nét trong dòng, khối, chèn, nhấn
       mạnh — nên `Gạch ngang chữ` và `Mã` (mỗi bài dùng chừng không lần) ngồi
       ngay cạnh `Đậm`, còn `Link` (dùng mỗi đoạn) bị đẩy xuống quá nửa thanh.

       Nay xếp theo TẦN SUẤT, và cắt làm hai nửa rõ rệt:

         CHÍNH · gõ bài nào cũng chạm tới
           hoàn tác · đậm nghiêng link · tiêu đề trích dẫn danh sách · ảnh khối
         PHỤ · vài bài một lần
           gạch mã tô màu · chỉ số phím · thụt lề đoạn vạch · dọn

       Nút `</>` vẫn đứng riêng ở mép phải: nó không sửa gì cả, nó chỉ mở ra
       xem — khác loại với mọi nút còn lại.
       ══════════════════════════════════════════════════════════════ */

    /* ── CHÍNH 1: hoàn tác ──
       ⌘Z vẫn chạy sẵn vì đây là một vùng soạn thảo thật, nhưng CHỈ trên bàn
       phím. Trên điện thoại — nơi phần lớn bài được gõ — không có phím tắt
       nào, nên một cú bấm nhầm là không có đường lùi. Hai cái nút này là đường
       lùi ấy, và chúng đứng NGOÀI CÙNG BÊN TRÁI: đó là chỗ mọi trình soạn thảo
       ba mươi năm nay vẫn để nút hoàn tác. */
    /* Mở nhóm đầu tiên TRƯỚC nút đầu tiên: thiếu dòng này thì Undo/Redo rơi
       thẳng vào thanh chứ không vào nhóm nào, và chúng là hai nút duy nhất có
       thể bị xé khỏi nhau khi xuống hàng. */
    vach(1);
    nut(svg(['M3 10h11a5 5 0 0 1 0 10h-3', 'M7 6 3 10l4 4']),
        L('undo', 'Undo') + ' (⌘Z)', function () { lenh('undo'); });
    nut(svg(['M21 10H10a5 5 0 0 0 0 10h3', 'M17 6l4 4-4 4']),
        L('redo', 'Redo') + ' (⇧⌘Z)', function () { lenh('redo'); });
    vach(1);

    /* ── CHÍNH 2: ba nét của một câu ──
       Đậm · nghiêng · link. Ba thứ này chiếm gần hết số lần bấm của cả thanh,
       và cả ba đều có phím tắt — nên chúng đứng cạnh nhau, ngay đầu thanh. */
    var nDam = nut('B', L('bold', 'Bold') + ' (⌘B)', function () { lenh('bold'); }, 'sz-nut--dam');
    var nNgh = nut('I', L('italic', 'Italic') + ' (⌘I)', function () { lenh('italic'); }, 'sz-nut--ngh');
    nut(svg('M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'),
        L('link', 'Link') + ' (⌘K)', chenLink);
    vach(2);

    /* ── CHÍNH 3: dàn bài ── */
    nut('H2', L('h2', 'Heading'), function () { lenh('formatBlock', 'h2'); }, 'sz-nut--h');
    nut('H3', L('h3', 'Subheading'), function () { lenh('formatBlock', 'h3'); }, 'sz-nut--h');
    nut(svg('M10 7H6a2 2 0 0 0-2 2v3h4l-2 5M20 7h-4a2 2 0 0 0-2 2v3h4l-2 5'),
        L('quote', 'Quote'), function () { lenh('formatBlock', 'blockquote'); });
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M4.5 6h.01M4.5 12h.01M4.5 18h.01']),
        L('ul', 'Bullet list'), function () { lenh('insertUnorderedList'); donDanhSach(); });
    nut(svg(['M10 6h10M10 12h10M10 18h10', 'M4 5h1v4M4 9h2M4 14.5h2v2H4v2h2']),
        L('ol', 'Numbered list'), function () { lenh('insertOrderedList'); donDanhSach(); });

    /* ── CĂN DÒNG: MỘT NÚT, BỐN CHẾ ĐỘ ──
       Bốn nút rời cho bốn kiểu căn là bốn chỗ trên một thanh vốn đã chật, mà
       ba trong bốn cái gần như không bao giờ dùng tới. Một nút xổ ra bốn dòng
       thì chiếm một chỗ, và lúc mở ra thì cả bốn nằm cạnh nhau — chọn được
       bằng cách SO SÁNH thay vì phải nhớ icon nào là cái nào.

       "Đều hai bên" là mặc định của `.prose p`, nên nó không gắn lớp gì; ba
       cái kia gắn `{.trai}` · `{.giua}` · `{.phai}`. Bấm lại đúng cái đang
       bật thì gỡ ra — `doiLopDoan` vốn đã làm vậy. */
    var nutCan = nut(svg(['M4 6h16M4 12h10M4 18h16']), L('align', 'Alignment'),
                     function () { moBangCan(); });
    nutCan.setAttribute('aria-expanded', 'false');
    var bangCan = veBangCan();
    vach(2);

    /* ── CHÍNH 4: hai cửa chèn ──
       Ảnh là thứ chèn nhiều nhất; Blocks là cửa vào mười sáu thứ còn lại. Hai
       nút này đứng cạnh nhau và ở khoảng GIỮA thanh — chỗ mắt dừng lại khi
       không tìm thấy thứ mình cần trong mấy nhóm trước. */
    nut(svg(['M3 5h18v14H3z', 'm3 16 5-5 4 4 3-3 6 6']),
        L('img', 'Image'), chenAnh);
    /* ── NÚT NÀY MANG CẢ CHỮ, KHÔNG CHỈ ICON ──
       Hai mươi lăm cái nút trên thanh đều là hình vẽ, và cái này là cửa vào
       mười sáu thứ nữa — nó là nút quan trọng nhất trên thanh. Một hình chữ
       nhật có gạch chân không nói ra được điều đó; ai không rê chuột lên đợi
       dòng chú thích thì không bao giờ biết bên trong có gì.

       Chữ ẩn đi ở khổ hẹp (xem `.sz-nut-chu` trong list.css): trên điện thoại
       thanh nút đã phải cuộn ngang rồi. */
    var nhanKhoi = document.createDocumentFragment();
    nhanKhoi.appendChild(svg(['M4 5h16v6H4z', 'M4 15h10']));
    nhanKhoi.appendChild(el('span', 'sz-nut-chu', L('block', 'Blocks')));
    var nutKhoi = nut(nhanKhoi, L('block', 'Blocks'),
                      function () { moBangKhoi(); }, 'sz-nut--khoi');
    nutKhoi.setAttribute('aria-expanded', 'false');
    var bangKhoi = veBangKhoi();
    vach(1);

    /* ── PHỤ 1: nhấn một mẩu chữ ──
       Bốn nét cùng một họ: chúng bọc một đoạn chữ đã bôi đen, bấm lại thì gỡ.
       Dùng chung `bocChon` nên chúng cũng đi từng nút chữ một và không cắt đôi
       đoạn văn. */
    var nGac = nut('S', L('strike', 'Strikethrough'), function () { lenh('strikeThrough'); }, 'sz-nut--gac');
    nut(svg('M9 6 4 12l5 6M15 6l5 6-5 6'), L('code', 'Code'), function () {
      bocChon(khung, function () { return document.createElement('code'); },
              function (n) { return n.nodeName === 'CODE'; }) ||
        goBoc(khung, function (n) { return n.nodeName === 'CODE'; });
      capNhat();
    });
    nut(svg(['M5 19h14', 'M8 15 12 5l4 10z']), L('mark', 'Highlight'), function () {
      bocChon(khung, function () { return document.createElement('mark'); },
              function (n) { return n.nodeName === 'MARK'; }) ||
        goBoc(khung, function (n) { return n.nodeName === 'MARK'; });
      capNhat();
    });
    var nutMau = nut(el('span', 'sz-cham'), L('color', 'Text colour'), function () { moBangMau(); });
    nutMau.classList.add('sz-nut--mau');
    var bangMau = veBangMau();
    vach(1);

    /* ── PHỤ 2: ba nét kỹ thuật ──
       Chỉ số trên, chỉ số dưới, phím. Tách khỏi nhóm trên vì chúng thuộc một
       loại chữ khác hẳn: công thức và phím bấm, không phải nhấn giọng. */
    nut('x²', L('sup', 'Superscript — m²'), function () {
      bocChon(khung, function () { return document.createElement('sup'); },
              function (n) { return n.nodeName === 'SUP'; }) ||
        goBoc(khung, function (n) { return n.nodeName === 'SUP'; });
      capNhat();
    }, 'sz-nut--h');
    nut('x₂', L('sub', 'Subscript — H₂O'), function () {
      bocChon(khung, function () { return document.createElement('sub'); },
              function (n) { return n.nodeName === 'SUB'; }) ||
        goBoc(khung, function (n) { return n.nodeName === 'SUB'; });
      capNhat();
    }, 'sz-nut--h');
    nut(svg(['M3 6h18v12H3z', 'M7 10h.01M11 10h.01M15 10h.01M8 14h8']),
        L('kbd', 'Key — ⌘K, Esc'), function () {
      bocChon(khung, function () { return document.createElement('kbd'); },
              function (n) { return n.nodeName === 'KBD'; }) ||
        goBoc(khung, function (n) { return n.nodeName === 'KBD'; });
      capNhat();
    });
    vach(2);

    /* ── PHỤ 3: sửa hình dạng của một đoạn ──
       Thụt vào / thụt ra là cách DUY NHẤT để có danh sách lồng nhau — gõ dấu
       cách ở đầu dòng không ra danh sách con, contenteditable coi đó là chữ.
       `¶` trả một tiêu đề hay trích dẫn về đoạn thường: trước đây lỡ biến cả
       đoạn thành H2 thì không có đường lùi nào ngoài hoàn tác. */
    /* ── THỤT VÀO / THỤT RA CHỈ CHẠY TRONG DANH SÁCH ──
       `indent` của trình duyệt, gọi trên một đoạn thường, biến đoạn ấy thành
       một khối TRÍCH DẪN. Nút này ghi là "làm danh sách con", mà bấm nhầm
       ngoài danh sách thì được một khối trích dẫn — trong khi cạnh đó đã có
       một nút Trích dẫn thật. Hai nút ra cùng một thứ, một trong hai là do
       nhầm, là thứ khó lần ra nhất khi người dùng kể lại.

       Nên: ngoài danh sách thì không làm gì. Không báo lỗi, không hộp thoại —
       một nút không phản ứng ở chỗ nó vô nghĩa thì tự nói ra điều đó. */
    function trongDanhSach() {
      var s2 = window.getSelection();
      if (!s2 || !s2.rangeCount) return false;
      var n = s2.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      return !!(o && o.closest && o.closest('li') && khung.contains(o));
    }
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M3 9l3 3-3 3']),
        L('indent', 'Indent — makes a sub-list'), function () {
      if (!trongDanhSach()) return;
      lenh('indent'); donDanhSach();
    });
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M6 9l-3 3 3 3']),
        L('outdent', 'Outdent'), function () {
      if (!trongDanhSach()) return;
      lenh('outdent'); donDanhSach();
    });
    nut('¶', L('para', 'Back to a normal paragraph'), function () {
      lenh('formatBlock', 'p');
    }, 'sz-nut--h');
    nut(svg('M4 12h16'), L('hr', 'Divider'), function () { lenh('insertHorizontalRule'); });
    vach(2);

    /* ── Nhóm 5: dọn ── */
    nut(svg(['M4 7h16', 'M9 7V5h6v2', 'M6 7l1 13h10l1-13']), L('clear', 'Clear formatting'), function () {
      goBoc(khung, function (n) { return n.nodeName === 'CODE' || n.nodeName === 'MARK' || !!lopMau(n); });
      lenh('removeFormat');
      /* `removeFormat` KHÔNG đụng tới thẻ <a> — đó là luật của trình duyệt,
         không phải thiếu sót ở đây. Hệ quả: trước bản này, đặt nhầm một liên
         kết rồi thì không có đường nào gỡ ra ngoài hoàn tác, và hoàn tác thì
         cuốn theo cả mấy thứ vừa gõ sau đó. `unlink` là lệnh đúng cho việc ấy,
         và nó nằm ngay trong nút "dọn" vì đó là chỗ người ta tìm tới. */
      lenh('unlink');
    });

    /* ── NÚT `i` ĐÃ BỎ ──
       Nó mở một bảng chỉ dẫn riêng, tức là ô soạn thảo có HAI cửa dạy người
       dùng: bảng Blocks (bày sẵn mọi khối kèm cú pháp của từng cái) và bảng
       này. Hai cửa cho một việc thì chúng lệch nhau — và đã lệch thật: bảng
       chỉ dẫn còn dạy gõ tay đúng những thứ bảng Blocks đã có nút.

       Nay phần chỉ dẫn xuống nằm ở CUỐI bảng Blocks, sau danh sách khối. Ai mở
       bảng ấy ra là thấy cả hai, và không còn cửa thứ hai để lệch. */

    /* ══════════ BẢNG KHỐI ══════════

       Mỗi dòng là một khối chèn được. Chèn bằng `insertHTML` chứ không dựng
       DOM rồi nhét vào: `insertHTML` đi qua đúng cỗ máy hoàn tác của trình
       duyệt, nên Ctrl+Z gỡ được — dựng tay thì cú bấm ấy nằm ngoài lịch sử và
       người ta mất đường lùi. */
    /* ── TIÊU ĐỀ KHỐI: GÕ THẲNG VÀO ĐÓ, KHÔNG HỎI BẰNG HỘP THOẠI ──
       Bản trước bật `window.prompt` để hỏi tiêu đề. Hộp thoại ấy nhảy lên
       ĐỈNH MÀN HÌNH — cách chỗ đang gõ cả một chiều dài trang — và nó CHẶN cả
       trang cho tới khi trả lời. Người ta phải quyết một cái tiêu đề trước cả
       khi viết một chữ nào trong khối, mà lúc đó thì chưa biết khối ấy sẽ nói
       gì; bấm Cancel thì khối ra không có tiêu đề và không có đường nào thêm
       vào sau.

       Nay chèn thẳng khối, và cái tên nằm ngay trên nó là một ô GÕ ĐƯỢC, có
       sẵn dòng mờ "sửa ở đây". Không hộp thoại, không chặn gì, và sửa lại lúc
       nào cũng được — kể cả khi mở một bài cũ ra.

       Phần TÊN LOẠI (`note`, `tip`…) vẫn khoá: nó do cái nút vừa bấm quyết,
       gõ đè lên nó thì bộ dựng không nhận ra khối nữa. */
    function chenKhoi(ma, ten) {
      khung.focus();
      document.execCommand('insertHTML', false,
        '<div class="sz-khoi" data-khoi="' + ma + '">' +
          '<div class="sz-khoi-nhan">' +
            '<span class="sz-khoi-loai" contenteditable="false">' + ma + '</span>' +
            '<span class="sz-khoi-de" data-cho="' +
              thoatHTML(L('bDeCho', 'Title — type here')) + '">' +
              (ten ? thoatHTML(ten) : '') + '</span>' +
          '</div>' +
          '<p><br></p>' +
        '</div><p><br></p>');
      capNhat();
    }

    function veBangKhoi() {
      /* Danh sách dựng BÊN TRONG hàm, không phải một `var` ở ngoài: hàm này
         được gọi ngay lúc dựng thanh nút, mà `var` thì mới chỉ được cất chỗ ở
         đó chứ chưa gán — đọc ra `undefined`, và cả khung soạn thảo chết ngay
         dòng đầu. Khai báo hàm thì được đưa lên trước; khai báo biến thì không. */
      /* ── BỐN KHUNG NHẤN, VÀ VÌ SAO CHÚNG TỪNG KHÔNG PHÂN BIỆT ĐƯỢC ──
         Câu mô tả cũ tả CƠ CHẾ: "a boxed aside", rồi "same box, friendlier",
         "same box, careful tone", "same box, strongest tone". Đọc bốn dòng ấy
         cạnh nhau thì chúng nói đúng một điều — cùng một cái hộp — và không
         dòng nào giúp chọn được cái nào.

         Nay tả VIỆC: dùng cái này khi nào. Và thêm một chấm màu đúng bằng màu
         nó hiện ra trên trang, vì thứ khác nhau thật giữa bốn khối này là màu
         chứ không phải chữ.

         `--cl` lấy đúng tên biến của `.callout--*` trong prose.css, nên đổi
         màu ở đó là chấm ở đây đổi theo. */
      var KHOI = [
        { ma: 'note', nhom: 'nhan', cham: 'var(--accent-ink)',
          ten: L('bNote', 'Note'),  mo: L('bNoteMo', 'a side point, out of the main flow') },
        { ma: 'tip', nhom: 'nhan', cham: 'var(--ok)',
          ten: L('bTip', 'Tip'),    mo: L('bTipMo', 'a shortcut, something that helps') },
        { ma: 'warn', nhom: 'nhan', cham: 'var(--warn)',
          ten: L('bWarn', 'Heads up'), mo: L('bWarnMo', 'worth knowing before you start') },
        { ma: 'stop', nhom: 'nhan', cham: 'var(--bad)',
          ten: L('bStop', 'Do not'), mo: L('bStopMo', 'something that should not be done') },
        { ma: 'gallery', nhom: 'anh', ten: L('bGallery', 'Gallery'), mo: L('bGalleryMo', 'photos side by side') },
        { ma: 'wide', nhom: 'anh', ten: L('bWide', 'Wide block'), mo: L('bWideMo', 'spills past the text column') },
        /* `:::full` là khối DUY NHẤT bộ dựng hiểu mà bảng này chưa có nút —
           nó vẫn nằm trong phần "gõ tay" của bảng chỉ dẫn, và đó là lý do
           phần ấy còn tồn tại. Thêm nốt vào đây thì không còn gì phải gõ. */
        { ma: 'full', nhom: 'anh', ten: L('bFull', 'Full-bleed block'), mo: L('bFullMo', 'edge to edge of the screen') }
      ];
      var b = el('div', 'sz-bang sz-bang--khoi');
      b.hidden = true;

      /* ── MỖI DÒNG BÀY LUÔN CÚ PHÁP CỦA NÓ ──
         Trước bản này cú pháp nằm ở BẢNG CHỈ DẪN, dưới cái đầu đề "gõ tay —
         không có nút". Nó sai từ lúc bảng khối ra đời: mọi thứ trong danh sách
         ấy đều đã có nút. Ai mở bảng chỉ dẫn ra đọc thì được dạy gõ tay đúng
         thứ chỉ cần bấm một cái — và kết luận là ô soạn thảo chẳng khác gì.

         Nên cú pháp về đứng ngay cạnh cái nút làm ra nó. Một chỗ, không hai;
         và bấm một lần là thấy ngay nó ghi ra cái gì trong file. */
      function dong(ten, mo, cu, lam, cham) {
        var o = el('button', 'sz-khoi-nut');
        o.type = 'button';
        var trai = el('span', 'sz-khoi-chu');
        var hang = el('span', 'sz-khoi-hang');
        if (cham) {
          var ch = el('span', 'sz-khoi-cham');
          ch.style.setProperty('--m', cham);
          hang.appendChild(ch);
        }
        hang.appendChild(el('span', 'sz-khoi-ten', ten));
        trai.appendChild(hang);
        if (mo) trai.appendChild(el('span', 'sz-khoi-mo', mo));
        o.appendChild(trai);
        if (cu) o.appendChild(el('code', 'sz-khoi-cu', cu));
        o.addEventListener('mousedown', function (e) { e.preventDefault(); });
        o.addEventListener('click', function () { lam(); dongBang(); });
        b.appendChild(o);
      }

      /* ── BẢNG CHIA NHÓM, KHÔNG PHẢI MỘT LƯỚI MƯỜI SÁU Ô ──
         Mười sáu dòng xếp phẳng thì mắt phải đọc hết mới biết cái mình cần ở
         đâu — và bốn khung nhấn nằm cạnh nhau mà câu mô tả đều mở đầu bằng
         "same box" thì đọc xong vẫn không chọn được cái nào.

         Bốn nhóm theo VIỆC: khung nhấn · ảnh và video · cấu trúc · cả đoạn.
         Tiêu đề nhóm chiếm trọn bề ngang lưới (xem `.sz-khoi-de`), nên nhóm
         nào cũng bắt đầu ở một hàng mới dù lưới đang có mấy cột. */
      function de(chu) { b.appendChild(el('p', 'sz-khoi-de', chu)); }

      function khoiNhom(ten) {
        KHOI.filter(function (k) { return k.nhom === ten; }).forEach(function (k) {
          dong(k.ten, k.mo, ':::' + k.ma, function () {
            /* Nhãn của khối ghi chú là thứ hiện ra ở đầu ô trên trang đã dựng —
               để trống thì bộ dựng lấy tên mặc định theo loại. Hỏi ngay lúc chèn
               thì người ta khỏi phải tìm ra chỗ sửa nó sau. */
            chenKhoi(k.ma, '');
          }, k.cham);
        });
      }

      de(L('gNhomNhan', 'Callout boxes'));
      khoiNhom('nhan');

      de(L('gNhomAnh', 'Pictures and video'));
      khoiNhom('anh');

      /* ── VIDEO ──
         Hai dạng, và bộ dựng phân biệt chúng bằng chính chữ đầu dòng:
           @youtube[<mã>](chú thích)  — chỉ tải iframe của Google KHI bấm play
           @video[/media/x.mp4](…)    — file tự chứa

         Dán cả đường dẫn YouTube cũng được: rút lấy mã ở đây, để người viết
         khỏi phải biết "mã video" là đoạn nào trong cái link dài ấy. */
      dong(L('bYoutube', 'YouTube'), L('bYoutubeMo', 'loads only when someone presses play'), '@youtube[…]', function () {
        var u = window.prompt(L('bYtAsk', 'YouTube link or video id:'), '') || '';
        u = u.trim();
        if (!u) return;
        var ma = (u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/) || [])[1]
              || (/^[\w-]{6,}$/.test(u) ? u : '');
        if (!ma) { window.alert(L('bYtSai', 'Could not find a video id in that.')); return; }
        var chu = window.prompt(L('bCapAsk', 'Caption (can be empty):'), '') || '';
        khung.focus();
        document.execCommand('insertHTML', false,
          '<p>@youtube\\[' + ma + '\\](' + chu.replace(/[<>&()]/g, '') + '){.wide}</p><p><br></p>');
        capNhat();
      });


      dong(L('bVideo', 'Video file'), L('bVideoMo', 'an .mp4 or .webm you uploaded'), '@video[…]', function () {
        var u = window.prompt(L('bVidAsk', 'Video path (starts with /media/):'), '/media/') || '';
        u = u.trim();
        if (!/^(https?:\/\/|\/)/.test(u)) return;
        var chu = window.prompt(L('bCapAsk', 'Caption (can be empty):'), '') || '';
        khung.focus();
        document.execCommand('insertHTML', false,
          '<p>@video\\[' + u.replace(/[<>&()]/g, '') + '\\](' +
          chu.replace(/[<>&()]/g, '') + '){.wide}</p><p><br></p>');
        capNhat();
      });

      /* ── BỀ NGANG CỦA MỘT TẤM ẢNH ──
         `{.wide}` và `{.full}` là thuộc tính của ĐÚNG một tấm ảnh, nên nó
         không thể là một khối chèn vào — nó là một phép đổi trên tấm ảnh con
         trỏ đang đứng cạnh. Bấm vòng: thường → rộng → tràn → thường. */
      dong(L('bAnhRong', 'Image width'), L('bAnhRongMo', 'normal → wide → full-bleed'), '{.wide} {.full}', function () {
        var anh = anhGanConTro();
        if (!anh) { window.alert(L('bAnhChua', 'Put the cursor next to an image first.')); return; }
        var VONG = ['', '{.wide}', '{.full}'];
        var nay = anh.getAttribute('data-lop') || '';
        var ke = VONG[(VONG.indexOf(nay) + 1) % VONG.length];
        if (ke) anh.setAttribute('data-lop', ke); else anh.removeAttribute('data-lop');
        anh.classList.remove('sz-anh--wide', 'sz-anh--full');
        if (ke === '{.wide}') anh.classList.add('sz-anh--wide');
        if (ke === '{.full}') anh.classList.add('sz-anh--full');
        capNhat();
      });

      /* ── HAI LỚP CỦA CẢ ĐOẠN ──
         Bật/tắt trên đoạn con trỏ đang đứng. Giữ ở `data-lop` chứ không gõ
         thẳng vào chữ: gõ vào chữ thì mỗi lần sửa câu cuối phải né ba ký tự,
         và không có cách nào bấm lần nữa để bỏ. */

      de(L('gNhomCau', 'Structure'));


      dong(L('bTable', 'Table'), L('bTableMo', 'up to 5 × 20 — Shift+Enter between rows'), '| a | b |', function () {
        khung.focus();
        /* ── HỎI CỠ BẢNG ──
           Bản trước luôn chèn đúng 2×2, và muốn thêm cột thì phải tự gõ thêm
           dấu gạch đứng vào cả ba dòng cho khớp nhau — sai một dấu là bảng
           thôi là bảng. Hỏi một câu thì dựng sẵn đúng cỡ.

           Trần 5×20. Trần CỘT là chuyện bề ngang thật: cột chữ của bài rộng
           chừng 66 ký tự, chia sáu cột là mỗi cột mười ký tự — không còn đọc
           được. Trần HÀNG chỉ để chặn gõ nhầm "200"; hai mươi hàng đã dài hơn
           gần hết bảng người ta thật sự viết. */
        var TRAN_COT = 5, TRAN_HANG = 20;
        var tra = window.prompt(
          L('bTableAsk', 'Size — columns × rows (up to 5 × 20):'), '2x3') || '';
        var m = tra.replace(/\s/g, '').match(/^(\d+)[x×*,](\d+)$/i);
        if (!m) return;
        var nCot  = Math.max(1, Math.min(TRAN_COT,  parseInt(m[1], 10) || 2));
        var nHang = Math.max(1, Math.min(TRAN_HANG, parseInt(m[2], 10) || 2));

        /* Một ĐOẠN có xuống dòng cứng, không phải một <table>: bộ dựng đọc
           bảng theo DÒNG, và một đoạn có <br> ra Markdown đúng chừng ấy dòng
           liền nhau — thứ nó cần. Dựng <table> thật trong khung soạn thảo thì
           phải viết thêm cả một bộ đổi bảng ↔ Markdown. */
        function hang(o) { return '|' + new Array(nCot + 1).join(o + '|'); }
        var d = [hang('  '), hang('---')];
        for (var i = 0; i < nHang; i++) d.push(hang('  '));
        document.execCommand('insertHTML', false,
          '<p>' + d.join('<br>') + '</p><p><br></p>');
        capNhat();
      });


      dong(L('bCode', 'Code block'), L('bCodeMo', 'keeps every space and line break'), '```js', function () {
        khung.focus();
        var ngon = window.prompt(L('bCodeAsk', 'Language (js, css, python… — can be empty):'), '') || '';
        document.execCommand('insertHTML', false,
          '<pre' + (ngon.trim() ? ' data-ngon="' + ngon.trim().replace(/[^\w-]/g, '') + '"' : '') +
          '> </pre><p><br></p>');
        capNhat();
      });


      dong(L('bTask', 'Checklist'), L('bTaskMo', 'a list with tick boxes'), '- [ ]', function () {
        khung.focus();
        document.execCommand('insertHTML', false,
          '<ul><li data-viec="0"> </li></ul><p><br></p>');
        capNhat();
      });

      de(L('gNhomDoan', 'Whole paragraph'));

      /* ── HAI LỚP CỦA CẢ ĐOẠN ──
         Bật/tắt trên đoạn con trỏ đang đứng. Giữ ở `data-lop` chứ không gõ
         thẳng vào chữ: gõ vào chữ thì mỗi lần sửa câu cuối phải né ba ký tự,
         và không có cách nào bấm lần nữa để bỏ. */
      dong(L('bGiua', 'Centre this paragraph'), L('bGiuaMo', 'for a line that stands alone'), '{.giua}', function () {
        doiLopDoan('{.giua}');
      });

      dong(L('bNho', 'Small text'), L('bNhoMo', 'for a side note or a source line'), '{.nho}', function () {
        doiLopDoan('{.nho}');
      });

      dong(L('bThuong', 'Not a lead-in'), L('bThuongMo', 'stops the first paragraph being larger'), '{.thuong}', function () {
        doiLopDoan('{.thuong}');
      });

      /* ── PHẦN CHỈ DẪN ĐI TRONG MỘT KHUNG RIÊNG ──
         Trước bản này nó là một bảng riêng sau nút `i` — hai cửa dạy cùng một
         việc, và chúng đã lệch nhau. Gộp vào đây là đúng.

         Nhưng KHÔNG rót thẳng từng mẩu vào `b`: `b` là một LƯỚI ba cột, nên
         mỗi tiêu đề và mỗi danh sách chỉ dẫn rơi vào một ô lưới riêng, nằm
         chen ngang giữa các nút khối. Trên màn rộng nó ra thành ba cột chữ
         xếp chồng lên nhau, đọc không ra chữ nào vào chữ nào.

         Nên chỉ dẫn vào MỘT khung con, và khung ấy trải hết bề ngang lưới
         (`grid-column:1/-1`). Trong khung thì chữ chảy dọc như văn bản
         thường, đúng như nó cần. */
      var oGiup = el('div', 'sz-giup');
      giupVao(oGiup);
      b.appendChild(oGiup);
      return b;
    }

    /* Tấm ảnh gần con trỏ nhất: trong chính đoạn đang đứng, hoặc — nếu đoạn ấy
       không có ảnh nào — tấm cuối cùng phía trên nó. */
    function anhGanConTro() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      if (!o || !khung.contains(o)) return null;
      var khoiO = o.closest ? o.closest('p, figure, li, div') : null;
      if (khoiO) {
        var trong = khoiO.querySelector('img');
        if (trong) return trong;
      }
      var moi = khung.querySelectorAll('img');
      return moi.length ? moi[moi.length - 1] : null;
    }

    function doiLopDoan(lop) {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      var p = o && o.closest ? o.closest('p') : null;
      if (!p || !khung.contains(p)) {
        window.alert(L('bDoanChua', 'Put the cursor in a paragraph first.'));
        return;
      }
      var LOP_CSS = { '{.giua}': 'sz-doan--giua', '{.thuong}': 'sz-doan--thuong',
                      '{.nho}': 'sz-doan--nho',
                      '{.trai}': 'sz-doan--trai', '{.phai}': 'sz-doan--phai' };
      p.classList.remove('sz-doan--giua', 'sz-doan--thuong', 'sz-doan--nho',
                         'sz-doan--trai', 'sz-doan--phai');
      /* `__bo__` = "về mặc định": lớp đã gỡ ở dòng trên, ở đây chỉ dọn nốt
         thuộc tính rồi thôi. Một giá trị riêng chứ không phải chuỗi rỗng, vì
         chuỗi rỗng lọt vào nhánh so sánh bên dưới và hoá ra lại BẬT một lớp
         tên rỗng. */
      if (lop === '__bo__') { p.removeAttribute('data-lop'); capNhat(); return; }
      if (p.getAttribute('data-lop') === lop) {
        p.removeAttribute('data-lop');
      } else {
        p.setAttribute('data-lop', lop);
        p.classList.add(LOP_CSS[lop]);
      }
      capNhat();
    }

    function moBangKhoi() {
      bangMau.hidden = true;
      bangKhoi.hidden = !bangKhoi.hidden;
      nutKhoi.setAttribute('aria-expanded', bangKhoi.hidden ? 'false' : 'true');
    }

    /* ══════════ BẢNG CĂN DÒNG ══════════ */
    function veBangCan() {
      var b = el('div', 'sz-bang sz-bang--can');
      b.hidden = true;
      [['', L('canDeu', 'Justified'), L('canDeuMo', 'the default — both edges straight')],
       ['{.trai}', L('canTrai', 'Left'), L('canTraiMo', 'ragged right edge')],
       ['{.giua}', L('canGiua', 'Centre'), L('canGiuaMo', 'for a line or two, not a whole paragraph')],
       ['{.phai}', L('canPhai', 'Right'), L('canPhaiMo', 'a signature, a dedication')]
      ].forEach(function (x) {
        var o = el('button', 'sz-khoi-nut');
        o.type = 'button';
        var chu = el('div', 'sz-khoi-chu');
        chu.appendChild(el('span', 'sz-khoi-ten', x[1]));
        chu.appendChild(el('span', 'sz-khoi-mo', x[2]));
        o.appendChild(chu);
        if (x[0]) o.appendChild(el('code', 'sz-khoi-ma', x[0]));
        o.addEventListener('mousedown', function (e) { e.preventDefault(); });
        o.addEventListener('click', function () {
          /* Chuỗi rỗng = về mặc định: gỡ lớp đang có, không gắn gì thêm. */
          doiLopDoan(x[0] || '__bo__');
          dongBang();
        });
        b.appendChild(o);
      });
      return b;
    }

    function moBangCan() {
      bangMau.hidden = true;
      bangKhoi.hidden = true;
      nutKhoi.setAttribute('aria-expanded', 'false');
      bangCan.hidden = !bangCan.hidden;
      nutCan.setAttribute('aria-expanded', bangCan.hidden ? 'false' : 'true');
    }

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
          /* MỘT lượt gọi lo cả hai việc — gỡ màu cũ rồi bọc màu mới — và nó
             giữ vùng chọn suốt quá trình. Bản trước gọi `goBoc` trước rồi
             `bocChon` sau: phép gỡ huỷ vùng chọn, nên lượt bọc ngay sau đó
             không còn gì để bọc, và bấm đổi màu ra thành xoá màu. */
          bocChon(khung, function () {
            var sp = document.createElement('span');
            sp.className = 'c-' + m.ma;
            return sp;
          }, function (n) { return lopMau(n) === m.ma; },
             function (n) { return !!lopMau(n); }) ||
            /* Không bôi đen mà con trỏ đang đứng trong một cụm cùng màu: hiểu
               là "bỏ màu này đi". */
            goBoc(khung, function (n) { return lopMau(n) === m.ma; });
          dongBang();
          capNhat();
        });
        b.appendChild(o);
      });
      var xoa = el('button', 'sz-mau sz-mau--bo');
      xoa.type = 'button';
      xoa.appendChild(el('span', 'sz-mau-cham'));
      xoa.appendChild(el('span', 'sz-mau-ten', L('noColor', 'Remove colour')));
      xoa.addEventListener('mousedown', function (e) { e.preventDefault(); });
      xoa.addEventListener('click', function () {
        /* `bocChon` với `tao` trả về một vỏ TRUNG TÍNH: nó gỡ mọi lớp màu
           trong vùng chọn rồi bọc lại bằng một <span> trần, thứ mà sangMD bỏ
           qua như không có. Đường này gỡ đúng phần được chọn, không gỡ cả cụm. */
        bocChon(khung, function () { return document.createElement('span'); },
                function (n) { return !!lopMau(n); }) ||
          goBoc(khung, function (n) { return !!lopMau(n); });
        dongBang(); capNhat();
      });
      b.appendChild(xoa);
      return b;
    }

    /* Hai bảng, một chỗ đứng: mở cái này thì cái kia đóng. Chồng lên nhau thì
       bảng dưới vẫn ăn được cú bấm mà không ai thấy nó ở đó. */
    function moBangMau() {
      bangKhoi.hidden = true;
      nutKhoi.setAttribute('aria-expanded', 'false');
      bangMau.hidden = !bangMau.hidden;
    }

    function dongBang() {
      bangMau.hidden = true; bangKhoi.hidden = true; bangCan.hidden = true;
      nutKhoi.setAttribute('aria-expanded', 'false');
      nutCan.setAttribute('aria-expanded', 'false');
    }

    /* ══════════ CHỈ DẪN ══════════

       ── HAI PHẦN, VÌ CÓ HAI LOẠI NGƯỜI ĐỌC NÓ ──
       Phần trên là những thứ có NÚT trên thanh: ai quên thì liếc một dòng là
       xong. Phần dưới là những thứ KHÔNG có nút — khối ghi chú, ảnh tràn lề,
       bảng — phải gõ tay bằng cú pháp.

       Phần dưới sinh ra vì một chuyện cụ thể: bài "Vô thức tập thể" dùng bốn
       kiểu khối `:::`, một dải ảnh, một bảng và một khối mã, mà trong ô soạn
       thảo không có chỗ nào nói rằng những thứ ấy tồn tại. Người viết bài sau
       mở ô này ra chỉ thấy mười cái nút, và không có đường nào đoán ra là còn
       mười thứ nữa gõ được.

       Mỗi dòng đúng MỘT việc, và có mẫu gõ sẵn ngay trong dòng — đây là thứ
       liếc lúc đang quên, không phải thứ ngồi học. Ai muốn chép nguyên mẫu thì
       bôi đen dòng đó là chép được. */
    function giupVao(b) {
      function nhom(de, ds) {
        b.appendChild(el('p', 'sz-giup-de', de));
        var ul = el('ul', 'sz-giup-ds');
        ds.forEach(function (x) {
          var li = el('li');
          if (typeof x === 'string') { li.textContent = x; }
          else {
            li.appendChild(el('code', 'sz-giup-ma', x[0]));
            li.appendChild(document.createTextNode(' ' + x[1]));
          }
          ul.appendChild(li);
        });
        b.appendChild(ul);
      }

      nhom(L('gHelp1', 'The buttons'), [
        L('h1', 'Select some text, then press a button — no syntax to remember.'),
        L('h2t', 'Bold ⌘B · Italic ⌘I · Link ⌘K (Ctrl on Windows).'),
        L('h3t', 'Colour: select → press the dot → pick one. Press the same one again to remove.'),
        L('h4t', 'New line inside the same paragraph: Shift + Enter.'),
        L('h6t', 'Pasting from elsewhere: keeps bold/italic/links, drops fonts and sizes.'),
        L('h7t', 'Drafts save to this device on their own; closing the tab is safe.'),
        L('h9t', 'The — button drops a ✦ ✦ ✦ break between two parts of a post.'),
        L('h10t', 'x² · x₂ · the key button: for m², H₂O and ⌘K.'),
        L('h8t', 'Press </> to see the exact Markdown that will go to GitHub.')
      ]);

      /* ── ẢNH ĐƯỢC MỘT MỤC RIÊNG ──
         Nó là thứ đổi nhiều nhất ở bản này, và là thứ duy nhất trong cả ô soạn
         thảo có một quãng CHỜ mà người dùng không đoán trước được: ảnh vào kho
         mã ngay, nhưng phải đợi Cloudflare dựng xong mới có ở địa chỉ thật.
         Không nói ra thì lần đầu mở bài đã đăng lên xem sẽ thấy ô ảnh vỡ và
         tưởng mình làm hỏng. */
      nhom(L('gHelpAnh', 'Images'), [
        L('a1', 'Drag a photo onto the box, or press ⌘V after a screenshot, or press the image button.'),
        L('a2', 'Big photos are shrunk to 1800px and turned into WebP here on your machine first.'),
        L('a3', 'Double-click an image to describe it — that line is what a blind reader hears and what Google reads.'),
        L('a4', 'A new image takes about a minute to appear on the live site; in this box you see it straight away.')
      ]);

      /* ── PHẦN NÀY TỪNG TÊN LÀ "GÕ TAY — KHÔNG CÓ NÚT", VÀ NÓ ĐÃ SAI ──
         Danh sách ấy ra đời TRƯỚC bảng Blocks. Bảng Blocks nhận hết mười lăm
         thứ trong đó, nhưng câu đầu đề thì ở lại — nên ai mở bảng chỉ dẫn ra
         cũng được dạy gõ tay đúng những thứ chỉ cần bấm một cái, và kết luận
         rất hợp lý là ô soạn thảo không khác gì bản cũ.

         Nay cú pháp đứng ngay trên từng dòng của bảng Blocks (xem `dong()` ở
         trên), nên chỗ này không chép lại nữa — chép lại là có hai bản, và
         sớm muộn lại lệch nhau đúng như lần này. Còn đúng một câu: bảng ấy
         nằm ở đâu. */
      /* Mục "bảng Blocks nằm ở đâu" đã bỏ: phần chỉ dẫn này nay in ngay DƯỚI
         chính danh sách ấy, nên chỉ đường tới thứ người ta đang nhìn là thừa.
         Còn lại đúng một câu về cách gõ, thứ danh sách không nói được. */
      nhom(L('gHelp2', 'Worth knowing'), [
        L('g3', 'A ::: block and a table each live in ONE paragraph: Shift+Enter between rows, not Enter.'),
        L('g2', 'Every line above shows the exact text it writes into the file — nothing needs typing.')
      ]);

      b.appendChild(el('p', 'sz-giup-chan',
        L('gChan', 'Everything the site can render has a button now. Press </> at any time to ' +
                   'see the exact Markdown that will be sent to GitHub.')));
    }

    /* ══════════ CHÈN LINK / ẢNH ══════════
       `prompt` chứ không phải một khung tự dựng: nó xấu, nhưng nó chạy đúng
       trên mọi máy kể cả điện thoại, không cần bẫy phím Esc, không cần trả
       con trỏ về chỗ cũ. Ở một ô chỉ chủ trang dùng thì đó là đánh đổi đúng. */
    function chenLink() {
      var s = window.getSelection();
      var coChon = s && s.rangeCount && !s.isCollapsed;
      var chu = coChon ? s.toString() : '';
      var u = window.prompt(L('linkAsk', 'Link:'), 'https://');
      if (!u) return;
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(u)) {
        u = 'https://' + u.replace(/^\/+/, '');
      }
      khung.focus();
      if (!coChon) {
        var t = window.prompt(L('linkText', 'Text to show:'), u) || u;
        document.execCommand('insertHTML', false,
          '<a href="' + u.replace(/"/g, '%22') + '">' + t.replace(/[<>&]/g, '') + '</a>');
      } else {
        document.execCommand('createLink', false, u);
      }
      capNhat();
    }

    /* Ô chọn file nằm ẩn trong khối soạn thảo. `accept` để hộp chọn của máy
       lọc sẵn, `multiple` để chọn cả loạt một lượt — cùng đường với kéo thả. */
    var oFile = el('input');
    oFile.type = 'file';
    oFile.accept = 'image/*';
    oFile.multiple = true;
    oFile.hidden = true;
    oFile.addEventListener('change', function () {
      if (oFile.files && oFile.files.length) xepHang(oFile.files);
      /* Dọn ô: chọn lại ĐÚNG file vừa chọn thì `change` không nổ lần nữa nếu
         giá trị cũ còn đó — và người ta tưởng nút hỏng. */
      oFile.value = '';
    });

    function chenAnh() {
      /* Có đường tải lên thì mở hộp chọn file — không ai phải biết đường dẫn
         trong kho mã trông như thế nào. Không có thì rơi về ô gõ tay, đúng
         cách cũ, để ô soạn thảo vẫn dùng được ở chỗ không có khoá. */
      if (taiAnh) { oFile.click(); return; }
      var u = window.prompt(L('imgAsk', 'Image path (starts with /media/):'), '/media/');
      if (!u) return;
      if (!/^(https?:\/\/|\/)/i.test(u)) return;
      var mo = window.prompt(L('imgAlt', 'Describe the image (for people who cannot see it):'), '') || '';
      khung.focus();
      document.execCommand('insertHTML', false,
        '<p><img src="' + u.replace(/"/g, '%22') + '" alt="' + mo.replace(/[<>&"]/g, '') + '"></p>');
      capNhat();
    }

    /* ══════════════════════════════════════════════════════════════
       THẢ ẢNH VÀO KHUNG

       ── BA ĐƯỜNG VÀO, MỘT ĐƯỜNG ĐI ──
       Kéo thả · dán (⌘V một ảnh chụp màn hình) · bấm nút ảnh rồi chọn file.
       Cả ba đổ vào `xepHang()`, nên chỉ có một luồng phải đúng.

       ── VÌ SAO THU NHỎ NGAY TẠI MÁY ──
       Một tấm ảnh chụp bằng điện thoại nặng 3–6 MB và rộng 4000px. Cột chữ
       của blog rộng khoảng 700px, nên 3/4 số byte ấy không bao giờ hiện lên
       màn hình của ai — chúng chỉ làm bài tải chậm, và Google đo đúng chuyện
       đó khi xếp hạng.

       Thu nhỏ Ở ĐÂY chứ không ở máy chủ vì hàm Workers không có thư viện xử
       lý ảnh, và vì gửi 6 MB lên rồi mới cắt còn 300 KB là đã trả giá đường
       truyền rồi. Trình duyệt có sẵn canvas; dùng nó.

       ── VÌ SAO KHÔNG HIỆN ẢNH THEO ĐƯỜNG DẪN MỚI ──
       Ảnh vừa ghi vào kho mã CHƯA có ở /media/... — Cloudflare còn đang dựng.
       Trỏ `src` vào đó là một phút đầu nhìn thấy ô ảnh vỡ, đúng lúc đang viết.
       Nên `src` giữ bản xem tại chỗ, `data-that` giữ đường dẫn thật, và
       `sangMD` đọc `data-that`.

       ── VÌ SAO XẾP HÀNG, KHÔNG GỬI SONG SONG ──
       Mỗi tấm là một commit vào cùng một nhánh. Hai commit cùng lúc thì GitHub
       từ chối cái thứ hai ("nhánh đang ở sha khác"), và tấm ảnh ấy im lặng
       biến mất. Kéo bốn tấm vào một lần là chuyện thường, nên đây không phải
       ca hiếm.
       ══════════════════════════════════════════════════════════════ */

    var hangAnh = [];       /* việc đang chờ — gửi lần lượt, không song song */
    var dangGui = false;
    var demAnh  = 0;

    /* Dòng trạng thái: nằm ngay dưới thanh nút, và chỉ hiện khi có chuyện.
       Không dùng `alert` cho việc đang chạy — một hộp thoại chặn cả trang thì
       không gõ tiếp được trong lúc ảnh đang lên. */
    var oBao = el('div', 'bao sz-bao');
    oBao.hidden = true;
    oBao.setAttribute('role', 'status');

    function bao(chu, hong) {
      if (!chu) { oBao.hidden = true; oBao.textContent = ''; return; }
      oBao.hidden = false;
      oBao.textContent = chu;
      oBao.classList.toggle('bao--hong', !!hong);
    }

    /* ── ĐẾM ẢNH CHƯA CÓ MÔ TẢ ──
       `alt` là thứ người khiếm thị nghe thấy thay cho tấm ảnh, và là thứ
       Google đọc để biết ảnh vẽ gì. Hỏi ngay lúc thả thì kéo bốn tấm vào là
       bốn hộp thoại liên tiếp — phần lớn người ta bấm OK cho xong, và ta có
       bốn `alt` rỗng cùng một cảm giác đã được hỏi.

       Nên: không hỏi, mà ĐẾM và nói ra. Bấm đúp vào tấm ảnh là gõ được. */
    function demThieuMoTa() {
      var ds = khung.querySelectorAll('img');
      var n = 0;
      for (var i = 0; i < ds.length; i++) if (!(ds[i].getAttribute('alt') || '').trim()) n++;
      return n;
    }

    function nhacMoTa() {
      var n = demThieuMoTa();
      if (!n) { bao(''); return; }
      bao(L('altMissing', '{n} image(s) still have no description — double-click one to add it.')
            .replace('{n}', n));
    }

    /* Đuôi file dựng lại từ LOẠI thật của blob, không lấy từ tên file người ta
       kéo vào: sau khi qua canvas thì `anh.png` đã là dữ liệu WebP, và giữ
       đuôi cũ là một file nói dối về chính nó. */
    function tenTu(f, blob) {
      var goc = String(f.name || 'anh').replace(/\.[^.]+$/, '');
      return { ten: goc, loai: blob.type || f.type || 'image/webp' };
    }

    function xepHang(ds) {
      if (!taiAnh) {
        bao(L('upNo', 'Uploading is off — sign in with the owner key first.'), true);
        return;
      }
      var anh = [];
      for (var i = 0; i < ds.length; i++) {
        if (/^image\//i.test(ds[i].type)) anh.push(ds[i]);
      }
      if (!anh.length) return;

      /* ── CẮT ẢNH: CHỈ HỎI KHI THẢ ĐÚNG MỘT TẤM ──
         Thả một tấm là một quyết định về tấm ấy — mở khung cắt ra là đúng lúc.
         Thả năm tấm là "đưa hết vào bài": hỏi năm lần liên tiếp thì bốn lần
         sau người ta bấm bỏ qua cho xong, và cái khung ấy thành một cửa phải
         đóng chứ không phải một công cụ.

         Ảnh động .gif cũng bỏ qua: cắt bằng canvas chỉ giữ được khung đầu. */
      if (anh.length === 1 && anh[0].type !== 'image/gif') {
        moKhungCat(anh[0], function (ra) {
          hangAnh.push(ra || anh[0]);
          chayHang();
        });
        return;
      }
      for (var j = 0; j < anh.length; j++) hangAnh.push(anh[j]);
      chayHang();
    }

    /* ══════════════════════════════════════════════════════════════
       KHUNG CẮT ẢNH

       ── VÌ SAO CẮT Ở ĐÂY, KHÔNG PHẢI SAU KHI ĐĂNG ──
       Cú pháp Markdown của trang không có chỗ nào diễn đạt "cắt": `{.wide}` và
       `{.full}` chỉ nói BỀ NGANG, còn phần bị cắt bỏ thì không ghi ra được.
       Muốn cắt sau khi đăng thì phải sinh ra một file ảnh thứ hai và sửa lại
       đường dẫn trong bài — hai việc, hai chỗ hỏng.

       Cắt TRƯỚC KHI GỬI thì file lên kho mã đã là tấm đã cắt: bài chỉ có một
       đường dẫn, và không có tấm gốc nào nằm lại làm ảnh mồ côi.

       ── KHUNG CẮT LÀ MỘT HÌNH CHỮ NHẬT, KHÔNG PHẢI MỘT BỘ ẢNH ──
       Kéo trong lòng để dời, kéo bốn góc để co giãn, hoặc bấm một tỉ lệ có
       sẵn. Không có xoay, không có phóng to, không có bộ lọc — mỗi thứ ấy là
       một thanh công cụ nữa cho một việc mỗi tháng làm vài lần.
       ══════════════════════════════════════════════════════════════ */
    function moKhungCat(file, xong) {
      var xem = URL.createObjectURL(file);
      var img = new Image();
      img.onerror = function () { URL.revokeObjectURL(xem); xong(null); };
      img.onload = function () {
        var hop = el('dialog', 'sz-cat');
        var khungAnh = el('div', 'sz-cat-anh');
        img.className = 'sz-cat-goc';
        khungAnh.appendChild(img);
        var o = el('div', 'sz-cat-o');
        ['tt', 'tp', 'dt', 'dp'].forEach(function (g) {
          o.appendChild(el('span', 'sz-cat-goc-' + g));
        });
        khungAnh.appendChild(o);

        var thanh = el('div', 'sz-cat-thanh');
        var TI = [[L('cropFree', 'Original'), 0], ['16:9', 16 / 9], ['3:2', 3 / 2],
                  ['1:1', 1], ['4:5', 4 / 5]];
        var tiNay = 0;

        /* Khung cắt giữ theo TỈ LỆ 0..1 của tấm ảnh, không theo pixel màn hình:
           cửa sổ đổi cỡ hay xoay điện thoại thì khung vẫn trùm đúng chỗ cũ. */
        var v = { x: 0, y: 0, w: 1, h: 1 };

        function ve() {
          o.style.left   = (v.x * 100) + '%';
          o.style.top    = (v.y * 100) + '%';
          o.style.width  = (v.w * 100) + '%';
          o.style.height = (v.h * 100) + '%';
        }
        function datTi(t) {
          tiNay = t;
          if (!t) { v = { x: 0, y: 0, w: 1, h: 1 }; ve(); return; }
          /* Tỉ lệ tính trên PIXEL THẬT của ảnh, rồi đổi về tỉ lệ 0..1 — nên
             một khung "1:1" ra hình vuông thật, không phải vuông trên màn. */
          var W = img.naturalWidth, H = img.naturalHeight;
          var w = W, h = w / t;
          if (h > H) { h = H; w = h * t; }
          v.w = w / W; v.h = h / H;
          v.x = (1 - v.w) / 2; v.y = (1 - v.h) / 2;
          ve();
        }
        TI.forEach(function (x) {
          var b = el('button', 'sz-cat-ti', x[0]);
          b.type = 'button';
          b.addEventListener('click', function () {
            thanh.querySelectorAll('.sz-cat-ti').forEach(function (n) {
              n.classList.remove('sz-cat-ti--nay');
            });
            b.classList.add('sz-cat-ti--nay');
            datTi(x[1]);
          });
          thanh.appendChild(b);
        });

        var day = el('span', 'sz-day');
        thanh.appendChild(day);
        var bBo = el('button', 'sz-cat-nut', L('cropSkip', 'Use as is'));
        bBo.type = 'button';
        var bOk = el('button', 'sz-cat-nut sz-cat-nut--chinh', L('cropDo', 'Crop'));
        bOk.type = 'button';
        thanh.appendChild(bBo); thanh.appendChild(bOk);

        /* ── KÉO ──
           Một trình nghe cho cả bốn góc lẫn phần trong: chỗ bắt đầu bấm quyết
           định đang làm gì. Dùng Pointer Events nên chuột và ngón tay đi chung
           một đường — không phải viết hai lần cho `mouse` và `touch`. */
        var keo = null;
        khungAnh.addEventListener('pointerdown', function (e) {
          var hop2 = khungAnh.getBoundingClientRect();
          var g = e.target.className && String(e.target.className).match(/sz-cat-goc-(\w\w)/);
          keo = { g: g ? g[1] : null, x: e.clientX, y: e.clientY,
                  W: hop2.width, H: hop2.height, v0: { x: v.x, y: v.y, w: v.w, h: v.h } };
          khungAnh.setPointerCapture(e.pointerId);
          e.preventDefault();
        });
        khungAnh.addEventListener('pointermove', function (e) {
          if (!keo) return;
          var dx = (e.clientX - keo.x) / keo.W, dy = (e.clientY - keo.y) / keo.H;
          var a2 = keo.v0;
          if (!keo.g) {
            /* Dời cả khung, và chặn ở mép — kéo ra ngoài ảnh thì phần thừa là
               nền trắng, không ai muốn thế. */
            v.x = Math.max(0, Math.min(1 - a2.w, a2.x + dx));
            v.y = Math.max(0, Math.min(1 - a2.h, a2.y + dy));
          } else {
            var trai = keo.g[1] === 't', tren = keo.g[0] === 't';
            var x1 = trai ? a2.x + dx : a2.x, x2 = trai ? a2.x + a2.w : a2.x + a2.w + dx;
            var y1 = tren ? a2.y + dy : a2.y, y2 = tren ? a2.y + a2.h : a2.y + a2.h + dy;
            x1 = Math.max(0, Math.min(x1, x2 - .05)); x2 = Math.min(1, Math.max(x2, x1 + .05));
            y1 = Math.max(0, Math.min(y1, y2 - .05)); y2 = Math.min(1, Math.max(y2, y1 + .05));
            v.x = x1; v.y = y1; v.w = x2 - x1; v.h = y2 - y1;
            if (tiNay) {
              /* Giữ tỉ lệ: sửa chiều cao theo chiều ngang vừa kéo. */
              var W2 = img.naturalWidth, H2 = img.naturalHeight;
              var hMoi = (v.w * W2 / tiNay) / H2;
              if (v.y + hMoi > 1) hMoi = 1 - v.y;
              v.h = hMoi;
            }
          }
          ve();
        });
        khungAnh.addEventListener('pointerup', function () { keo = null; });
        khungAnh.addEventListener('pointercancel', function () { keo = null; });

        function dong(ra) {
          URL.revokeObjectURL(xem);
          hop.close();
          hop.remove();
          xong(ra);
        }
        bBo.addEventListener('click', function () { dong(null); });
        hop.addEventListener('cancel', function (e) { e.preventDefault(); dong(null); });
        bOk.addEventListener('click', function () {
          var W = img.naturalWidth, H = img.naturalHeight;
          var sx = Math.round(v.x * W), sy = Math.round(v.y * H);
          var sw = Math.max(1, Math.round(v.w * W)), sh = Math.max(1, Math.round(v.h * H));
          if (sw === W && sh === H) { dong(null); return; }   /* không cắt gì */
          var c = document.createElement('canvas');
          c.width = sw; c.height = sh;
          try {
            c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          } catch (e2) { dong(null); return; }
          c.toBlob(function (b) {
            if (!b) { dong(null); return; }
            /* Giữ tên gốc để đường dẫn trên kho mã vẫn đọc ra được là ảnh nào. */
            b.name = file.name;
            dong(new File([b], file.name, { type: b.type }));
          }, 'image/webp', 0.9);
        });

        hop.appendChild(el('p', 'sz-cat-de', L('cropHint', 'Drag inside to move, corners to resize')));
        hop.appendChild(khungAnh);
        hop.appendChild(thanh);
        document.body.appendChild(hop);
        hop.showModal();
        ve();
      };
      img.src = xem;
    }

    function chayHang() {
      if (dangGui) return;
      var f = hangAnh.shift();
      if (!f) { nhacMoTa(); return; }
      dangGui = true;

      /* Ô giữ chỗ vào bài NGAY, trước cả lúc bắt đầu gửi: người ta thấy tấm
         ảnh đã ở đúng chỗ mình thả, và gõ tiếp được trong lúc nó đang lên.
         Chèn bằng `insertHTML` để cú này nằm trong lịch sử hoàn tác. */
      var ma  = 'tai-' + (++demAnh);
      var xem = URL.createObjectURL(f);
      khung.focus();
      document.execCommand('insertHTML', false,
        '<p><img class="sz-anh--tai" data-tai="' + ma + '" src="' + xem + '" alt=""></p>');

      function timAnh() { return khung.querySelector('[data-tai="' + ma + '"]'); }

      var conLai = hangAnh.length;
      bao(conLai
        ? L('upMany', 'Uploading image… {n} more in the queue.').replace('{n}', conLai)
        : L('upOne', 'Uploading image…'));

      thuNho(f)
        .then(function (blob) {
          return sangB64(blob).then(function (b64) {
            var t = tenTu(f, blob);
            return taiAnh({ ten: t.ten, loai: t.loai, duLieu: b64, co: blob.size });
          });
        })
        .then(function (kq) {
          var a = timAnh();
          if (!a) { URL.revokeObjectURL(xem); return; }   /* người ta vừa xoá nó */
          a.setAttribute('data-that', kq.duong);
          a.removeAttribute('data-tai');
          a.classList.remove('sz-anh--tai');
          capNhat();
        })
        .catch(function (e) {
          var a = timAnh();
          /* Bỏ hẳn ô giữ chỗ khi hỏng. Để lại thì nó vẫn hiện ra như một tấm
             ảnh bình thường trong khung, mà `sangMD` sẽ ghi vào bài một đường
             `blob:` chết — bài lên với một ô ảnh vỡ, và không ai nhớ tấm nào. */
          if (a) {
            var oCha = a.parentNode;
            a.remove();
            if (oCha && oCha.tagName === 'P' && !oCha.textContent.trim() &&
                !oCha.querySelector('img')) oCha.remove();
          }
          URL.revokeObjectURL(xem);
          /* `sangB64` nằm ngoài `gan()`, nên nó không với tới bảng nhãn —
             nó ném ra một dấu hiệu, và chỗ này mới đổi thành câu tiếng người. */
          var chu = (e && e.message) || '';
          if (chu === 'doc-khong-duoc') chu = L('upRead', 'Could not read that file.');
          bao(chu || L('upFail', 'Could not upload that image.'), true);
          capNhat();
        })
        .then(function () {
          dangGui = false;
          if (hangAnh.length) chayHang();
          else if (!oBao.classList.contains('bao--hong')) nhacMoTa();
        });
    }

    /* ══════════ DANH SÁCH LỌT VÀO TRONG MỘT ĐOẠN ══════════

       ── LỖI ĐÃ GẶP THẬT ──
       Mở một bài ĐÃ ĐĂNG ra sửa, bôi đen một đoạn, bấm nút danh sách: không có
       gì xảy ra. Bấm lại vẫn không. Nút trông như hỏng.

       Nó không hỏng — nó dựng ra `<p><ul><li>…</li></ul></p>`. Một `<ul>` nằm
       TRONG một `<p>` là HTML sai, và `sangMD` đi qua từng con của khung: nó
       gặp một `<p>`, lấy phần chữ của `<p>` ấy, rồi đi tiếp — cái `<ul>` bị
       nuốt gọn. Markdown ra y như cũ.

       ── VÌ SAO CHỈ HỎNG Ở BÀI ĐANG SỬA ──
       Gõ mới thì chữ nằm trần trong khung, chưa có `<p>` nào bọc, nên lệnh của
       trình duyệt dựng `<ul>` ở ngay tầng ngoài — đúng. Còn bài mở ra sửa thì
       `tuMD()` đã bọc mỗi đoạn vào một `<p>`, và lúc ấy lệnh nhét danh sách
       vào BÊN TRONG cái `<p>` đang có thay vì thay thế nó.

       Đó là lý do lỗi này sống lâu: ai thử nút trên một khung trống đều thấy
       nó chạy.

       ── CHỮA ──
       Nhấc danh sách ra khỏi `<p>`. `<p>` không còn gì khác thì bỏ luôn nó;
       còn chữ thì để chữ ở lại và đặt danh sách ngay sau. Giữ nguyên các nút
       DOM (không dựng lại) để vùng chọn và con trỏ không nhảy đi đâu. */
    function donDanhSach() {
      /* ── CA MỘT: `<ul>` NẰM TRONG `<p>` ── (nút danh sách, xem trên) */
      var ds = khung.querySelectorAll('p > ul, p > ol');
      for (var i = 0; i < ds.length; i++) {
        var ul = ds[i], p = ul.parentNode;
        if (!p || p.tagName !== 'P') continue;
        p.parentNode.insertBefore(ul, p.nextSibling);
        if (!p.textContent.trim() && !p.querySelector('img, ul, ol')) p.remove();
      }

      /* ── CA HAI: `<li>` NẰM TRONG `<li>` ──
         Bấm "thụt ra" trên một mục con: trình duyệt trả về
         `<li>một<li>con</li></li>` — một `<li>` lồng thẳng trong `<li>` khác,
         không qua `<ul>`. Đó là HTML sai, và `sangMD` gom phần chữ của mục
         ngoài lại thành một chuỗi: hai mục dính liền thành `- mộtcon`.

         Chữ không mất, nhưng dòng thì mất — và mất im lặng, chỉ thấy khi mở
         file .md ra đọc. Nhấc mục trong ra đứng ngay sau mục ngoài. */
      var conLi = khung.querySelectorAll('li > li');
      for (var j = 0; j < conLi.length; j++) {
        var trong = conLi[j], ngoai = trong.parentNode;
        ngoai.parentNode.insertBefore(trong, ngoai.nextSibling);
      }

      /* ── CA BA: `<ul>` LÀM CON TRỰC TIẾP CỦA `<ul>` ──
         Bấm "thụt vào" trên mục thứ hai của một danh sách: trình duyệt trả về
         `<ul><li>một</li><ul><li>hai</li></ul></ul>`. Danh sách con phải nằm
         TRONG mục cha (`<li>một<ul>…</ul></li>`), không phải nằm cạnh nó.

         Hậu quả nặng hơn hai ca trên: `sangMD` duyệt các con của `<ul>` để tìm
         `<li>`, nên cái `<ul>` lạc chỗ bị bỏ qua hoàn toàn — mục "hai" BIẾN
         MẤT khỏi bài, không còn dấu vết nào. Đây là mất chữ, không phải mất
         định dạng.

         Nhét nó vào cuối `<li>` đứng ngay trước; không có `<li>` nào trước thì
         dựng một cái rỗng để nó có chỗ bám. */
      var conDs = khung.querySelectorAll('ul > ul, ul > ol, ol > ul, ol > ol');
      for (var k = 0; k < conDs.length; k++) {
        var ds2 = conDs[k], cha = ds2.previousElementSibling;
        if (!cha || cha.tagName !== 'LI') {
          cha = document.createElement('li');
          ds2.parentNode.insertBefore(cha, ds2);
        }
        cha.appendChild(ds2);
      }
      capNhat();
    }

    /* ── KÉO THẢ ──
       `dragover` phải `preventDefault`, không thì trình duyệt không coi khung
       này là chỗ thả được và `drop` không bao giờ nổ.

       Thả một tấm ảnh vào một vùng contenteditable, mặc định trình duyệt chèn
       thẳng nó dưới dạng `data:` URL dài vài trăm nghìn ký tự — nằm lại trong
       file .md, và bài phình ra tới mức GitHub từ chối. Nên chặn hẳn hành vi
       mặc định rồi tự lo. */
    khung.addEventListener('dragover', function (e) {
      if (!e.dataTransfer) return;
      var co = Array.prototype.some.call(e.dataTransfer.types || [], function (t) {
        return t === 'Files';
      });
      if (!co) return;
      e.preventDefault();
      khung.classList.add('sz-khung--tha');
    });
    khung.addEventListener('dragleave', function (e) {
      if (e.target === khung) khung.classList.remove('sz-khung--tha');
    });
    khung.addEventListener('drop', function (e) {
      var ds = e.dataTransfer && e.dataTransfer.files;
      if (!ds || !ds.length) return;
      e.preventDefault();
      khung.classList.remove('sz-khung--tha');
      datConTroTai(e.clientX, e.clientY);
      xepHang(ds);
    });

    /* ── ẢNH PHẢI VÀO ĐÚNG CHỖ THẢ ──
       Ô giữ chỗ được chèn ở VỊ TRÍ CON TRỎ. Nhưng kéo một tấm ảnh từ Finder
       vào thì con trỏ đang ở đâu là chuyện của lần gõ trước — có thể là đầu
       bài, có thể là giữa một mục danh sách. Đo thật: thả ảnh xuống cuối bài
       mà nó nhảy lên nối vào một dòng danh sách ở trên.

       Nên trước khi chèn, dời con trỏ tới đúng điểm con chuột nhả ra. Hai tên
       hàm cho cùng một việc: Firefox dùng `caretPositionFromPoint`, còn
       WebKit/Blink dùng `caretRangeFromPoint`. Không có cái nào (trình duyệt
       quá cũ) thì rơi về nếp cũ — chèn ở con trỏ, vẫn chạy. */
    function datConTroTai(x, y) {
      var r = null;
      try {
        if (document.caretRangeFromPoint) {
          r = document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint) {
          var vt = document.caretPositionFromPoint(x, y);
          if (vt) {
            r = document.createRange();
            r.setStart(vt.offsetNode, vt.offset);
            r.collapse(true);
          }
        }
      } catch (e2) {}
      if (!r || !khung.contains(r.startContainer)) return;
      var s2 = window.getSelection();
      s2.removeAllRanges();
      s2.addRange(r);
    }

    /* ── BẤM ĐÚP VÀO ẢNH ĐỂ GÕ MÔ TẢ ──
       Chỗ duy nhất sửa được `alt` sau khi ảnh đã vào bài. Bấm đúp chứ không
       bấm một cái: bấm một cái là đặt con trỏ, và người ta bấm vào ảnh suốt
       trong lúc viết. */
    khung.addEventListener('dblclick', function (e) {
      var a = e.target && e.target.nodeName === 'IMG' ? e.target : null;
      if (!a) return;
      e.preventDefault();
      var cu = a.getAttribute('alt') || '';
      var moi = window.prompt(L('imgAlt', 'Describe the image (for people who cannot see it):'), cu);
      if (moi === null) return;
      a.setAttribute('alt', moi.replace(/[<>&"]/g, '').trim());
      capNhat();
      nhacMoTa();
    });

    /* ── ẢNH TRONG BẢN NHÁP MỞ LẠI ──
       `blob:` chỉ sống trong đúng phiên trình duyệt đã tạo ra nó. Mở lại bản
       nháp hôm qua thì mọi `src` kiểu ấy đã chết — nhưng `data-that` thì
       không, và tới lúc ấy Cloudflare đã dựng xong từ lâu, nên đường dẫn thật
       đã có ảnh thật. Trả `src` về đường dẫn thật là ảnh hiện lại đúng. */
    function donAnh() {
      var ds = khung.querySelectorAll('img[data-that]');
      for (var i = 0; i < ds.length; i++) {
        var a = ds[i];
        if (/^blob:/i.test(a.getAttribute('src') || '')) {
          a.setAttribute('src', a.getAttribute('data-that'));
          a.classList.remove('sz-anh--tai');
        }
      }
      /* Ô giữ chỗ của một lượt tải CHƯA XONG lúc đóng tab: nó không có
         `data-that`, nên không có gì cứu được. Bỏ đi, và nói ra. */
      var treo = khung.querySelectorAll('img[data-tai]');
      for (var j = 0; j < treo.length; j++) treo[j].remove();
      if (treo.length) bao(L('upLost', 'An image that was still uploading did not make it.'), true);
    }

    /* ══════════ Ô XEM MARKDOWN ══════════ */
    var oMD = el('pre', 'sz-md');
    oMD.hidden = true;
    var nutMD = el('button', 'sz-nut sz-nut--md');
    nutMD.type = 'button';
    nutMD.textContent = '</>';
    nutMD.title = L('seeMd', 'See the Markdown');
    nutMD.addEventListener('mousedown', function (e) { e.preventDefault(); });
    nutMD.addEventListener('click', function () {
      oMD.hidden = !oMD.hidden;
      nutMD.classList.toggle('sz-nut--bat', !oMD.hidden);
      if (!oMD.hidden) oMD.textContent = sangMD(khung) || L('empty', '(nothing yet)');
    });
    hang[1].appendChild(el('span', 'sz-day'));
    hang[1].appendChild(nutMD);

    /* ══════════ TRẠNG THÁI NÚT ══════════
       Nút đang bật thì phải nhìn ra là đang bật — không thì bôi đen một cụm
       chữ đậm rồi bấm B lần nữa, người ta không biết mình vừa bật hay vừa tắt. */
    function capNhat() {
      [['bold', nDam], ['italic', nNgh], ['strikeThrough', nGac]].forEach(function (x) {
        var bat = false;
        try { bat = document.queryCommandState(x[0]); } catch (e) {}
        x[1].classList.toggle('sz-nut--bat', !!bat);
      });
      if (!oMD.hidden) oMD.textContent = sangMD(khung) || L('empty', '(nothing yet)');
      luuNhap();
      if (khiDoi) { try { khiDoi(); } catch (e) {} }
    }

    /* ══════════ DÁN ══════════ */
    khung.addEventListener('paste', function (e) {
      var dl = e.clipboardData;
      if (!dl) return;

      /* ── ẢNH TRONG CLIPBOARD ──
         Chụp màn hình rồi ⌘V là đường chèn ảnh nhanh nhất có, và trước bản này
         nó chèn vào một `data:` URL dài hàng trăm nghìn ký tự nằm thẳng trong
         file .md.

         Chỉ đi đường này khi clipboard KHÔNG có chữ nào. Chép một đoạn từ Word
         hay Google Docs thì clipboard mang cả chữ LẪN một file ảnh kèm theo —
         lấy file là mất nguyên đoạn văn vừa chép. */
      if (dl.files && dl.files.length && !(dl.getData('text/plain') || '').trim()) {
        var anhDan = [];
        for (var k = 0; k < dl.files.length; k++) {
          if (/^image\//i.test(dl.files[k].type)) anhDan.push(dl.files[k]);
        }
        if (anhDan.length) { e.preventDefault(); xepHang(anhDan); return; }
      }

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
    khoiSoan.appendChild(oBao);
    khoiSoan.appendChild(oFile);
    khoiSoan.appendChild(bangKhoi);
    khoiSoan.appendChild(bangMau);
    khoiSoan.appendChild(bangCan);
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
      datHTML : function (h) { khung.innerHTML = h || ''; donAnh(); capNhat(); },
      xoa     : function () { khung.innerHTML = ''; boNhap(); capNhat(); },
      boNhap  : boNhap,
      tapTrung: function () { khung.focus(); }
    };
  }

  window.ZIB = window.ZIB || {};
  /* `thuNho` và `sangB64` ra ngoài cùng với ba hàm kia: ô ảnh bìa ở
     viet-bai.js dùng đúng chúng, để bìa và ảnh trong bài đi qua cùng một luật
     nén. Xem chú thích ở chỗ khai báo. */
  window.ZIB.soan = { gan: gan, sangMD: sangMD, tuMD: tuMD,
                      thuNho: thuNho, sangB64: sangB64 };
})();
