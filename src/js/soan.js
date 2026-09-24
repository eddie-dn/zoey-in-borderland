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
    { ma: 'xam',  ten: 'Xám' },
    /* Bốn màu thêm ở V2.7.3 — mỗi màu có bản riêng cho cả bốn theme trong
       tokens.css, tương phản trên nền từng theme đều trên 5:1. */
    { ma: 'nau',  ten: 'Nâu' },
    { ma: 'ngoc', ten: 'Ngọc' },
    { ma: 'cham', ten: 'Chàm' },
    { ma: 'oliu', ten: 'Ô liu' }
  ];
  var TEN_MD = { tim:'tím', hong:'hồng', do:'đỏ', cam:'cam',
                 vang:'vàng', luc:'lục', lam:'lam', xam:'xám',
                 nau:'nâu', ngoc:'ngọc', cham:'chàm', oliu:'ô liu' };

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
        .replace(/^(\s*(?:[-*+]\s+)?)\\\[( |x|X)\\\]/, '$1[$2]')
        /* `@youtube[mã](…)` · `@video[/x.mp4](…)` đứng đầu dòng là CÚ PHÁP —
           bộ dựng bắt bằng /^@youtube\[/ và không hiểu dấu chéo ngược. Không
           nhả thì chèn một video, hay chỉ mở rồi lưu lại một bài có video, là
           bài đăng in nguyên dòng `@youtube\[…\]` ra thay cho cái video. */
        .replace(/^(\s*)@([a-z]+)\\\[((?:[^\\\]]|\\.)*?)\\\]\(/i, function (_, le, ten, trong) {
          return le + '@' + ten + '[' + trong.replace(/\\(.)/g, '$1') + '](';
        });
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

      /* ── BẢNG: MỘT <table> THẬT TRONG Ô SOẠN, RA MẤY DÒNG GẠCH ĐỨNG ──
         Đời trước chèn thẳng mấy dòng `| | |` vào một đoạn văn và để người
         viết tự gõ giữa hai dấu gạch. Nhìn ra đúng như nó là: một mớ ký tự.
         Không thấy được đâu là ô nào, thêm một cột là phải đếm tay lại cả
         bảng, và gõ lố một dấu là bảng thôi là bảng.

         Nay trong ô soạn nó là một `<table>` có ô bấm vào gõ được, và chỉ tới
         lúc lưu mới đổi ra cú pháp Markdown. Hàng đầu là `<thead>` — đúng
         hàng mà bộ dựng hiểu là hàng tiêu đề.

         Dấu `|` người viết lỡ gõ TRONG một ô phải được thoát, không thì nó
         cắt ô ấy làm đôi lúc đọc lại. */
      if (the === 'TABLE') {
        var hangB = [];
        var oHang = c.querySelectorAll('tr');
        for (var hi = 0; hi < oHang.length; hi++) {
          var oO = oHang[hi].children, cot = [];
          for (var ci = 0; ci < oO.length; ci++) {
            cot.push(trong(oO[ci]).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim());
          }
          hangB.push('| ' + cot.join(' | ') + ' |');
          /* Dòng gạch ngăn đi ngay sau hàng tiêu đề — đó là thứ nói cho bộ
             dựng biết bảng bắt đầu từ đâu. */
          if (hi === 0) {
            hangB.push('|' + new Array(oO.length + 1).join('---|'));
          }
        }
        ra.push(thut + hangB.join('\n' + thut));
        continue;
      }

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
          var chuMuc = trong(ban);
          /* ── MỤC RỖNG KHÔNG RA MARKDOWN ──
             Lúc soạn, một `<li>` rỗng là chuyện thường: vừa Enter xong và
             chưa gõ. Nhưng xuất ra thì nó thành một dòng `-` cụt, và bộ dựng
             in ra một dấu chấm không có chữ giữa bài.

             Bỏ ở đây chứ không xoá trong DOM — xoá trong DOM là xoá đúng cái
             dòng người ta sắp gõ vào (lý do đầy đủ ở `donDanhSach`). */
          if (!chuMuc.trim() && !con.length) continue;
          /* ── MỤC RỖNG CÓ DANH SÁCH CON: PHẢI GIỮ MỘT DẤU CÁCH ──
             Thụt vào ở mục ĐẦU danh sách sinh ra một mục cha rỗng bọc lấy danh
             sách con (xem `thutVao1`). Viết ra Markdown, mục ấy là một gạch
             trơ — mà bộ dựng đọc `-` đứng một mình thành một ĐOẠN VĂN chứa dấu
             gạch, rồi danh sách con thành một danh sách riêng ngang hàng. Đo
             thật: `-\n  - x` ra `<p>-</p><ul><li>x</li></ul>`.

             `- ` (gạch + dấu cách) thì đọc đúng: `<ul><li><ul><li>x</li></ul>
             </li></ul>`. Nhưng bước rửa ở cuối `sangMD` cắt mọi dấu cách cuối
             dòng — trừ đúng HAI dấu, vì hai dấu là cú xuống dòng cứng của
             Markdown. Nên thêm một dấu nữa cho nó thành đúng cái ngoại lệ ấy,
             và dấu cách sống sót. Đã thử cả năm lối viết; chỉ lối này đi vòng
             lại đúng cấu trúc ban đầu. */
          var duoi = (!chuMuc.trim() && con.length) ? ' ' : '';
          muc.push(thut + dau + dauViec + chuMuc + duoi +
                   (con.length ? '\n' + con.join('\n') : ''));
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

  /* Tách một dòng bảng thành các ô. Bỏ dấu `|` ngoài cùng hai đầu, rồi cắt ở
     mỗi `|` KHÔNG có dấu `\` đứng trước — dấu ấy là do sangMD thoát ra. */
  function oCuaHang(d) {
    return d.trim().replace(/^\||\|$/g, '')
      .split(/(?<!\\)\|/)
      .map(function (x) { return x.replace(/\\\|/g, '|').trim(); });
  }

  function bangTuMD(ds) {
    var dau = oCuaHang(ds[0]);
    var than = [];
    for (var i = 2; i < ds.length; i++) than.push(oCuaHang(ds[i]));
    var h = '<table class="sz-bang-o"><thead><tr>';
    for (var k = 0; k < dau.length; k++) h += '<th>' + nhoMD(dau[k]) + '</th>';
    h += '</tr></thead><tbody>';
    for (var r = 0; r < than.length; r++) {
      h += '<tr>';
      for (var c2 = 0; c2 < dau.length; c2++) {
        h += '<td>' + nhoMD(than[r][c2] || '') + '</td>';
      }
      h += '</tr>';
    }
    return h + '</tbody></table>';
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
      /* ── BẢNG ĐỌC NGƯỢC LẠI ──
         Nhận ra bằng đúng thứ bộ dựng nhận: một dòng mở đầu bằng `|`, và ngay
         dòng sau là dòng gạch ngăn. Thiếu dòng gạch ngăn thì đó là đoạn văn
         có dấu gạch đứng, không phải bảng — cứ để nguyên. */
      if (/^\s*\|/.test(d) && dong[i + 1] && /^\s*\|[\s:|-]*-[\s:|-]*\|\s*$/.test(dong[i + 1])) {
        var oBang = [];
        while (i < dong.length && /^\s*\|/.test(dong[i])) { oBang.push(dong[i]); i++; }
        ra.push(bangTuMD(oBang));
        continue;
      }

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
      ghiNgay();
      khung.focus();
      /* ── THAM SỐ RỖNG PHẢI LÀ CHUỖI RỖNG, KHÔNG PHẢI `null` ──
         Vài lệnh của trình duyệt dùng tham số thứ ba làm THUỘC TÍNH của thẻ nó
         dựng ra. `insertHorizontalRule` lấy nó làm `id`, và `null` thì bị đổi
         thành chuỗi "null" — đo thật: bấm nút đường kẻ ra `<hr id="null">`.
         Không đổi hình gì trên màn, nhưng nó là rác nằm lại trong DOM, và một
         `id` trùng nhau ở hai chỗ là một lỗi HTML thật. */
      try { document.execCommand(ten, false, gt == null ? '' : gt); } catch (e) {}
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
      /* `ghiNgay()` hai đầu mỗi cú bấm: phần chữ vừa gõ thành MỘT bước hoàn
         tác, việc của nút thành bước kế, và chữ gõ ngay sau đó không bị gộp
         vào việc của nút — hoàn tác lùi đúng một nấc. */
      b.addEventListener('click', function (e) { e.preventDefault(); ghiNgay(); lam(b); ghiNgay(); });
      (nhomNay || thanh).appendChild(b);
      return b;
    }

    /* ══════════════════════════════════════════════════════════════════════
       HOÀN TÁC CỦA RIÊNG KHUNG NÀY

       Bộ hoàn tác của trình duyệt chỉ biết những gì đi qua `execCommand`. Từ
       bản này danh sách (chấm · số · việc · thụt vào · thụt ra) được làm
       thẳng trên DOM — vì `execCommand` làm hỏng danh sách lồng (xem
       `lamDanhSach`) — và khối, bảng, khổ ảnh vốn đã dựng tay từ trước. Trộn
       hai loại ấy với bộ hoàn tác của trình duyệt thì ⌘Z lùi nhầm chỗ: nó
       hoàn một cú gõ phím trên cái cây đã bị đổi dưới chân nó, và chữ nhảy
       lung tung.

       Nên khung giữ lịch sử của chính nó: mỗi bước là một bản chụp HTML cộng
       chỗ con trỏ. Gõ phím gom lại theo nhịp dừng tay (400ms); mỗi cú bấm
       nút là một bước riêng. ⌘Z · ⇧⌘Z · ⌘Y, hai nút trên thanh, và lệnh
       hoàn tác trong menu chuột phải đều đi qua đây. */
    var LS = [], LSi = -1, henLS = null, dangTraLS = false;

    function viTri(n, o) {
      var p = [];
      while (n && n !== khung) {
        var i = 0, c = n;
        while ((c = c.previousSibling)) i++;
        p.unshift(i);
        n = n.parentNode;
      }
      return n === khung ? { p: p, o: o } : null;
    }
    function timViTri(v) {
      var n = khung;
      for (var i = 0; i < v.p.length; i++) {
        n = n.childNodes[v.p[i]];
        if (!n) return null;
      }
      return { n: n, o: Math.min(v.o, n.nodeType === 3 ? n.length : n.childNodes.length) };
    }
    function anhChup() {
      var s = window.getSelection(), c = null;
      if (s && s.rangeCount && khung.contains(s.getRangeAt(0).startContainer)) {
        var r = s.getRangeAt(0);
        c = { a: viTri(r.startContainer, r.startOffset), b: viTri(r.endContainer, r.endOffset) };
      }
      return { h: khung.innerHTML, c: c };
    }
    function ghiNgay() {
      if (henLS) { clearTimeout(henLS); henLS = null; }
      if (dangTraLS) return;
      var a = anhChup();
      if (LSi >= 0 && LS[LSi].h === a.h) { LS[LSi].c = a.c; return; }
      LS.length = LSi + 1;
      LS.push(a);
      if (LS.length > 300) LS.shift();
      LSi = LS.length - 1;
    }
    function henGhi() {
      if (dangTraLS) return;
      if (henLS) clearTimeout(henLS);
      henLS = setTimeout(ghiNgay, 400);
    }
    function veLS(i) {
      var a = LS[i];
      if (!a) return;
      dangTraLS = true;
      LSi = i;
      khung.innerHTML = a.h;
      suaAnhTai();
      khung.focus();
      var x = a.c && a.c.a ? timViTri(a.c.a) : null;
      var y = a.c && a.c.b ? timViTri(a.c.b) : null;
      if (x) {
        try {
          var r = document.createRange();
          r.setStart(x.n, x.o);
          if (y) r.setEnd(y.n, y.o);
          var s = window.getSelection();
          s.removeAllRanges(); s.addRange(r);
        } catch (e) {}
      }
      capNhat();
      dangTraLS = false;
    }
    function hoanTac() { ghiNgay(); if (LSi > 0) veLS(LSi - 1); }
    function lamLai()  { ghiNgay(); if (LSi < LS.length - 1) veLS(LSi + 1); }
    function batDauLS() { LS = []; LSi = -1; ghiNgay(); }

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
        L('undo', 'Undo') + ' (⌘Z)', hoanTac);
    nut(svg(['M21 10H10a5 5 0 0 0 0 10h3', 'M17 6l4 4-4 4']),
        L('redo', 'Redo') + ' (⇧⌘Z)', lamLai);
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
        L('ul', 'Bullet list'), function () { lamDanhSach('cham'); });
    nut(svg(['M10 6h10M10 12h10M10 18h10', 'M4 5h1v4M4 9h2M4 14.5h2v2H4v2h2']),
        L('ol', 'Numbered list'), function () { lamDanhSach('so'); });

    /* ── CĂN DÒNG: BA NÚT, KHÔNG PHẢI MỘT BẢNG ──
       Bản trước là một nút mở ra bảng bốn dòng có câu mô tả. Căn dòng là việc
       bấm một cái rồi thôi, và ba biểu tượng trái · giữa · phải đã là ngôn ngữ
       chung của mọi trình soạn thảo — không cần đọc gì. "Đều hai bên" là mặc
       định của `.prose p` nên không có nút: bấm lại đúng nút đang bật thì về
       mặc định (`doiLopDoan` vốn đã bật/tắt). Nút của lớp đang bật sáng lên
       theo con trỏ — xem `capNhat`. */
    var nutCanDS = {};
    [['{.trai}', L('canTrai', 'Left'),   ['M4 6h16', 'M4 12h10', 'M4 18h14']],
     ['{.giua}', L('canGiua', 'Centre'), ['M4 6h16', 'M7 12h10', 'M5 18h14']],
     ['{.phai}', L('canPhai', 'Right'),  ['M4 6h16', 'M10 12h10', 'M6 18h14']]
    ].forEach(function (x) {
      nutCanDS[x[0]] = nut(svg(x[2]), x[1], function () { doiLopDoan(x[0]); });
    });
    vach(2);

    /* ── HAI CỬA CHÈN: MEDIA và KHUNG NHẤN ──
       Trước đây là Ảnh + Blocks, mà Blocks là một bảng mười sáu dòng trộn
       ảnh, video, bảng, mã, bốn khung nhấn và hai lớp đoạn vào một chỗ — kèm
       cả một khung chỉ dẫn dài ở dưới. Ai mở ra cũng phải đọc hết mới tìm
       được thứ mình cần, và bốn khung nhấn trong khung soạn thảo trông y hệt
       nhau nên bấm cái nào cũng như nhau.

       Nay: MEDIA mở đúng bảy thứ về hình và video. KHUNG NHẤN chèn thẳng một
       khối `note`; loại đổi ngay trên NHÃN của khối (bấm vào chữ `note` là
       xoay note → tip → warn → stop), và khối đổi màu theo loại ngay trong
       khung gõ. Bảng · mã · checklist · hai lớp đoạn xuống hàng hai làm nút
       riêng. Không còn bảng Blocks, không còn khung chỉ dẫn. */
    var nutMedia = nut(svg(['M3 5h18v14H3z', 'm3 16 5-5 4 4 3-3 6 6', 'M15.5 8.5h.01']),
                       L('media', 'Media — image, video, gallery'),
                       function () { moBangMedia(); });
    nutMedia.setAttribute('aria-expanded', 'false');
    var bangMedia = veBangMedia();
    /* ── BỐN LOẠI, CHỌN NGAY LÚC CHÈN ──
       Bản trước bấm là ra thẳng một khối `note`, rồi muốn đổi loại thì bấm
       vào cái nhãn trên khối. Cơ chế ấy vẫn còn (và vẫn tiện lúc sửa bài cũ),
       nhưng nó bắt người ta phải BIẾT trước đã — mà cái duy nhất nói ra điều
       đó là một dòng chú thích hiện khi rê chuột.

       Nay nút mở một bảng bốn dòng, mỗi dòng một chấm đúng màu nó sẽ hiện ra
       trên trang. Chọn màu là việc làm lúc chèn, nên chỗ chọn phải ở ngay chỗ
       chèn. */
    var nutNhan = nut(svg(['M5 5h14v14H5z', 'M8 5v14', 'M11 10h5M11 14h3']),
                      L('callout', 'Callout box'),
                      function () { moBangNhan(); });
    nutNhan.setAttribute('aria-expanded', 'false');
    var bangNhan = veBangNhan();
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
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M3 9l3 3-3 3']),
        L('indent', 'Indent — makes a sub-list'), function () {
      /* ── MỤC ĐẦU DANH SÁCH: NAY THỤT ĐƯỢC ──
         Ở đây từng có một chốt chặn: mục đầu tiên thì không làm gì, vì "thụt
         vào" nghĩa là làm con của mục đứng trước, mà mục đầu không có mục nào
         đứng trước. Lý do kỹ thuật đúng, và nó tránh được một lỗi thật —
         trình duyệt bọc mục ấy vào một danh sách con rồi để danh sách con nằm
         trơ dưới `<ol>` cha, `donDanhSach` phải dựng một `<li>` RỖNG cho nó
         bám, và cái `<li>` rỗng ấy in ra một số "1." không có chữ ngay trên số
         "1." thật.

         Nhưng người dùng không nghĩ theo cây HTML. Họ gõ một dòng, cho nó
         thành gạch đầu dòng, rồi muốn nó thụt vào — và Word, Google Docs,
         Notion đều cho. Một cái nút im lặng không làm gì là một cái nút hỏng,
         dù trình duyệt có lý của nó. Người dùng báo đúng chuyện này: "chọn
         listing/bullet point xong rồi indent vào thêm cx ko đc".

         Nay `thutVao1()` tự dựng lấy danh sách con và một mục cha rỗng — mà
         mục cha rỗng KHÔNG in ra Markdown (xem chỗ lọc mục rỗng trong
         `sangMD`), nên không còn cái "1." thừa nào. Ngoài danh sách thì
         `lamDanhSach` không tìm thấy mục nào và không làm gì. */
      lamDanhSach('thutVao');
    });
    nut(svg(['M9 6h11M9 12h11M9 18h11', 'M6 9l-3 3 3 3']),
        L('outdent', 'Outdent'), function () { lamDanhSach('thutRa'); });
    nut('¶', L('para', 'Back to a normal paragraph'), function () {
      lenh('formatBlock', 'p');
    }, 'sz-nut--h');
    /* Hai lớp đoạn còn lại — trước nằm trong bảng Blocks dưới đề "Whole
       paragraph". Chúng là phép đổi trên đoạn đang đứng, cùng họ với `¶`. */
    nut(svg(['M4 18 8 7l4 11', 'M5.5 14h5', 'M15 18l2-6 2 6', 'M15.8 16h2.4']),
        L('bNho', 'Small text'), function () { doiLopDoan('{.nho}'); });
    nut(svg(['M4 6h9', 'M4 12h16', 'M4 18h16', 'M16 3.5l4 4', 'M20 3.5l-4 4']),
        L('bThuong', 'Not a lead-in'), function () { doiLopDoan('{.thuong}'); });
    /* ── VẠCH CHÈN SAU ĐOẠN, KHÔNG ĐÈ LÊN CHỮ ──
       `insertHorizontalRule` của trình duyệt THAY vùng đang bôi đen bằng cái
       vạch — bôi đen một câu rồi bấm là mất câu ấy. Dựng tay và đặt ngay sau
       khối đang đứng, cùng đường với khối mã (`chenKhoiSau`). */
    nut(svg('M4 12h16'), L('hr', 'Divider'), function () {
      khung.focus();
      var sau = document.createElement('p');
      sau.appendChild(document.createElement('br'));
      chenKhoiSau([document.createElement('hr'), sau]);
      datConTroVao(sau);
      capNhat();
    });
    vach(2);

    /* ── BA KHỐI CẤU TRÚC: bảng · mã · checklist ──
       Cũng từ bảng Blocks ra. Mỗi cái là một nút vì mỗi cái chèn một thứ khác
       hẳn nhau — không có gì để so sánh trong một bảng cả. */
    nut(svg(['M3 5h18v14H3z', 'M3 10h18', 'M9 5v14', 'M15 5v14']),
        L('bTable', 'Table'), chenBang);
    var bangNgon = veBangNgon();
    nut(svg(['M4 4h16v16H4z', 'M10 9l-3 3 3 3', 'M14 9l3 3-3 3']),
        L('bCode', 'Code block'), function () { moBangNgon(); });
    nut(svg(['M4 5h5v5H4z', 'M12 7.5h8', 'M4 14h5v5H4z', 'M12 16.5h8', 'M5.3 7.5l1.2 1.2 2.2-2.4']),
        L('bTask', 'Checklist'), function () { lamDanhSach('viec'); });
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

    /* ══════════ CHÈN MỘT KHỐI ::: ══════════

       Dùng cho khung nhấn lẫn ba khối bọc trong bảng Media. Chèn bằng `insertHTML` chứ không dựng
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
    /* ── MỖI DẠNG DẢI ẢNH MỘT DÒNG NHẮC ──
       Dạng ghi vào file là một lớp (`.giu`, `.hai`, `.ba`) và nó hiện ra ngay
       trên nhãn khối. Nhưng `.giu` thì không tự nói nó là gì — ba tháng sau mở
       lại bài cũ, người viết nhìn `gallery .giu` mà không nhớ mình chọn dạng
       nào. Nên rê vào nhãn là thấy câu giải thích. */
    var NHAC_DANG = {
      ''    : L('gDangLuoi', 'Grid — square crops, fills the row'),
      'giu' : L('gDangGiu', 'Keeps each photo\'s own shape — no cropping'),
      'hai' : L('gDangHai', 'Exactly two columns — before and after'),
      'ba'  : L('gDangBa', 'Exactly three columns')
    };
    function nhacDang(ma, ten) {
      if (ma !== 'gallery') return '';
      var d = String(ten || '').trim().replace(/^\./, '');
      return NHAC_DANG[d] || NHAC_DANG[''];
    }

    /* ── DỰNG KHỐI BẰNG TAY, KHÔNG NHỜ `insertHTML` ──
       Cùng lý do với khối mã (xem `chenMa`): `insertHTML` một thẻ KHỐI trong
       lúc con trỏ đang ở trong một `<li>` thì trình duyệt tự quyết, và nó
       quyết sai — khối chui vào giữa danh sách. Đúng cái ảnh người dùng gửi:
       hai khối `gallery` lồng bên trong một gạch đầu dòng.

       Trả về chính khối vừa dựng, để chỗ gọi còn đặt con trỏ vào trong nó hay
       mở hộp chọn ảnh. */
    function chenKhoi(ma, ten) {
      khung.focus();
      var kh = document.createElement('div');
      kh.className = 'sz-khoi';
      kh.setAttribute('data-khoi', ma);

      var nhan = document.createElement('div');
      nhan.className = 'sz-khoi-nhan';
      var loai = document.createElement('span');
      loai.className = 'sz-khoi-loai';
      loai.contentEditable = 'false';
      loai.title = nhacDang(ma, ten) ||
                   L('bLoaiDoi', 'Click to change: note → tip → warn → stop');
      loai.textContent = ma + (ma === 'gallery' && ten ? ' ' + ten : '');
      var de = document.createElement('span');
      de.className = 'sz-khoi-de';
      de.setAttribute('data-cho', L('bDeCho', 'Title — type here'));
      if (ten) de.textContent = ten;
      nhan.appendChild(loai); nhan.appendChild(de);

      var ruot = document.createElement('p');
      ruot.appendChild(document.createElement('br'));
      kh.appendChild(nhan); kh.appendChild(ruot);

      var sau = document.createElement('p');
      sau.appendChild(document.createElement('br'));
      chenKhoiSau([kh, sau]);
      datConTroVao(ruot);
      capNhat();
      return kh;
    }

    /* ── DẢI ẢNH PHẢI MỞ LUÔN HỘP CHỌN ẢNH ──
       Bản trước bấm "Gallery" chỉ ra một cái khung rỗng có nhãn, và không có
       đường nào đưa ảnh vào ngoài việc tự đoán ra là phải kéo thả vào giữa nó.
       Người dùng hỏi thẳng: "gallery đâu có cho chọn ảnh?".

       Một dải ảnh KHÔNG có ảnh thì không phải một dải ảnh — nó là một cái hộp
       trống. Nên bấm là dựng khối, đặt con trỏ vào trong, rồi mở ngay hộp chọn
       nhiều ảnh. Ảnh tải lên chèn tại con trỏ, tức rơi đúng vào trong khối.

       Không có `taiAnh` (chưa đăng nhập) thì chỉ dựng khối và báo một câu —
       mở hộp chọn ra rồi không tải lên được thì tệ hơn là không mở. */
    function chenDaiAnh(lop) {
      var kh = chenKhoi('gallery', lop);
      if (!taiAnh) { bao(L('upNo', 'Uploading is off — sign in with the owner key first.'), true); return kh; }
      setTimeout(function () { oFile.click(); }, 0);
      return kh;
    }

    /* ══════════ BẢNG MEDIA ══════════
       Chỉ những gì thuộc về HÌNH và VIDEO, mỗi dòng kèm cú pháp nó ghi ra
       file. Bảng Blocks cũ gom mười sáu thứ, và cái giá là không ai tìm được
       thứ mình cần; bảng này bảy dòng, đúng một câu hỏi: "đặt cái gì vào bài?". */
    function veBangMedia() {
      var b = el('div', 'sz-bang sz-bang--khoi');
      b.hidden = true;

      function dong(ten, mo, cu, lam) {
        var o = el('button', 'sz-khoi-nut');
        o.type = 'button';
        var trai = el('span', 'sz-khoi-chu');
        trai.appendChild(el('span', 'sz-khoi-ten', ten));
        if (mo) trai.appendChild(el('span', 'sz-khoi-mo', mo));
        o.appendChild(trai);
        if (cu) o.appendChild(el('code', 'sz-khoi-cu', cu));
        o.addEventListener('mousedown', function (e) { e.preventDefault(); });
        o.addEventListener('click', function () { ghiNgay(); lam(); dongBang(); ghiNgay(); });
        b.appendChild(o);
      }

      dong(L('img', 'Image'), L('imgMo', 'upload a file, or paste a /media/ path'), '![…](…)', chenAnh);

      /* ── KHÔNG CÓ DÒNG "BỀ NGANG ẢNH" Ở ĐÂY NỮA ──
         Từng có một dòng bấm-vòng `thường → rộng → tràn`. Nó đi vì hai lẽ:
         nó là cửa THỨ HAI vào cùng một việc mà thanh nổi hiện dưới tấm ảnh đã
         làm tốt hơn (năm nấc, thấy ngay nấc đang dùng, không phải bấm vòng để
         dò); và hai cửa ấy đã bắt đầu lệch nhau — dòng này vẫn phát ra
         `{.wide}` sau khi nấc *Rộng* đã bỏ khỏi thanh. Một việc, một cửa. */

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
        chenDoanMoi(doanChu('@youtube[' + ma + '](' + chu.replace(/[()]/g, '') + '){.wide}'));
        capNhat();
      });

      dong(L('bVideo', 'Video file'), L('bVideoMo', 'an .mp4 or .webm you uploaded'), '@video[…]', function () {
        var u = window.prompt(L('bVidAsk', 'Video path (starts with /media/):'), '/media/') || '';
        u = u.trim();
        if (!/^(https?:\/\/|\/)/.test(u)) return;
        var chu = window.prompt(L('bCapAsk', 'Caption (can be empty):'), '') || '';
        khung.focus();
        chenDoanMoi(doanChu('@video[' + u.replace(/[()\[\]\s]/g, '') + '](' +
                            chu.replace(/[()]/g, '') + '){.wide}'));
        capNhat();
      });

      /* Ba khối bọc: dải ảnh, và hai khổ rộng cho bất kỳ thứ gì nằm trong. */
      /* ── BỐN DẠNG DẢI ẢNH ──
         Trước bản này chỉ có MỘT: lưới tự xếp, và mọi tấm bị cắt vuông
         (`aspect-ratio:1/1`). Cắt vuông là một quyết định đúng cho ảnh chụp
         ngang chụp dọc lẫn lộn, nhưng nó SAI cho ba việc rất thường gặp: ảnh
         bìa sách (dọc, cắt mất đầu sách), ảnh chụp màn hình (cắt mất nửa
         dưới), và bộ ảnh trước–sau (phải đúng hai cột mới so được).

         Dạng ghi ra file là một LỚP sau tên khối — `:::gallery .giu` — nên nó
         vẫn là Markdown đọc được, không phải một cú pháp riêng. Bày sẵn bốn
         dòng ở đây thay vì bắt người viết gõ tên lớp: người không biết code
         không có cách nào đoán ra `.giu` nghĩa là gì. */
      dong(L('bGallery', 'Gallery · grid'), L('bGalleryMo', 'square crops, fills the row'), ':::gallery', function () { chenDaiAnh(''); });
      dong(L('bGalleryGiu', 'Gallery · keep shape'), L('bGalleryGiuMo', 'no cropping — for book covers, screenshots'), ':::gallery .giu', function () { chenDaiAnh('.giu'); });
      dong(L('bGalleryHai', 'Gallery · 2 columns'), L('bGalleryHaiMo', 'exactly two — before and after'), ':::gallery .hai', function () { chenDaiAnh('.hai'); });
      dong(L('bGalleryBa', 'Gallery · 3 columns'), L('bGalleryBaMo', 'exactly three, even on wide screens'), ':::gallery .ba', function () { chenDaiAnh('.ba'); });
      dong(L('bWide', 'Wide block'), L('bWideMo', 'spills past the text column'), ':::wide', function () { chenKhoi('wide', ''); });
      dong(L('bFull', 'Full-bleed block'), L('bFullMo', 'edge to edge of the screen'), ':::full', function () { chenKhoi('full', ''); });
      return b;
    }

    /* ══════════ BA KHỐI CẤU TRÚC ══════════ */
    /* ── KHUNG ĐẶT CỠ BẢNG ──
       Bản trước hỏi bằng `window.prompt` với một ô chữ, và câu hỏi là "cỡ —
       cột × hàng (tối đa 5 × 20)". Ai cũng phải tự dịch ý mình ra một chuỗi
       kiểu `3x4`, gõ sai một ký tự là không có bảng nào hiện ra và cũng không
       có lời nào giải thích. Hộp thoại ấy còn nhảy lên đỉnh màn hình, cách
       chỗ đang gõ cả một chiều dài trang.

       Nay là một khung ngay trong trang, hai cái nút cộng trừ cho mỗi chiều,
       và một bảng XEM TRƯỚC vẽ đúng cỡ đang chọn — không phải dịch gì cả.

       Trần 5×20 giữ nguyên. Trần CỘT là chuyện bề ngang thật: cột chữ của bài
       rộng chừng 66 ký tự, chia sáu cột là mỗi cột mười ký tự — không còn đọc
       được. Trần HÀNG chỉ để chặn gõ nhầm; hai mươi hàng đã dài hơn gần hết
       bảng người ta thật sự viết. */
    var TRAN_COT = 5, TRAN_HANG = 20;

    function chenBang() {
      var nCot = 3, nHang = 3;
      /* Hộp thoại `showModal()` kéo tiêu điểm đi và vùng chọn trong khung mất
         theo — cùng chuyện với khung cắt ảnh (xem `moKhungCat`). Chép lại chỗ
         đang đứng TRƯỚC khi mở, đặt lại trước khi chèn. */
      var vungCu = null;
      try {
        var sC = window.getSelection();
        if (sC && sC.rangeCount && khung.contains(sC.getRangeAt(0).startContainer)) {
          vungCu = sC.getRangeAt(0).cloneRange();
        }
      } catch (eC) {}
      var kh = el('dialog', 'sz-cat sz-bang-hoi');
      var xem = el('div', 'sz-bang-xem');

      function soDong(ten, lay, dat, tran) {
        var h = el('div', 'sz-bang-so');
        h.appendChild(el('span', 'sz-bang-nhan', ten));
        var tru = el('button', 'sz-bang-nut', '−');
        var so  = el('span', 'sz-bang-gia', String(lay()));
        var cong = el('button', 'sz-bang-nut', '+');
        tru.type = cong.type = 'button';
        function ve() { so.textContent = String(lay()); veXem(); }
        tru.addEventListener('click', function () { if (lay() > 1) { dat(lay() - 1); ve(); } });
        cong.addEventListener('click', function () { if (lay() < tran) { dat(lay() + 1); ve(); } });
        h.appendChild(tru); h.appendChild(so); h.appendChild(cong);
        return h;
      }

      /* Bảng xem trước dựng lại từ đầu mỗi lần đổi số: ở cỡ tối đa là 100 ô,
         rẻ hơn nhiều so với việc giữ và đối chiếu từng ô một. */
      function veXem() {
        xem.innerHTML = '';
        var t = document.createElement('table');
        for (var r = 0; r <= nHang; r++) {
          var tr = document.createElement('tr');
          for (var c = 0; c < nCot; c++) {
            tr.appendChild(document.createElement(r === 0 ? 'th' : 'td'));
          }
          t.appendChild(tr);
        }
        xem.appendChild(t);
      }

      kh.appendChild(el('p', 'sz-bang-de', L('bTableAsk', 'How big?')));
      kh.appendChild(soDong(L('bTableCot', 'Columns'),
        function () { return nCot; }, function (v) { nCot = v; }, TRAN_COT));
      kh.appendChild(soDong(L('bTableHang', 'Rows'),
        function () { return nHang; }, function (v) { nHang = v; }, TRAN_HANG));
      kh.appendChild(xem);
      kh.appendChild(el('p', 'sz-bang-mach', L('bTableMach',
        'The first row is the header. Tab moves to the next cell.')));

      var hangNut = el('div', 'sz-bang-nuts');
      var thoi = el('button', 'btn btn--ghost', L('huy', 'Cancel'));
      var lam  = el('button', 'btn', L('bTableOk', 'Insert'));
      thoi.type = lam.type = 'button';
      hangNut.appendChild(thoi); hangNut.appendChild(lam);
      kh.appendChild(hangNut);

      function dong2() { try { kh.close(); } catch (e) {} kh.remove(); }
      thoi.addEventListener('click', dong2);
      kh.addEventListener('cancel', function () { kh.remove(); });
      lam.addEventListener('click', function () {
        dong2();
        khung.focus();
        if (vungCu) {
          try { var sD = window.getSelection(); sD.removeAllRanges(); sD.addRange(vungCu); } catch (eD) {}
        }
        ghiNgay();
        /* ── DỰNG TAY, KHÔNG `insertHTML` ──
           `insertHTML` một `<table>` vào một đoạn đang đứng thì Chromium lặng
           lẽ bỏ cả bảng — đo thật: bấm Insert xong khung vẫn là `<p><br></p>`,
           không có bảng nào. Cùng bệnh với khối mã (xem `chenMa`), cùng thuốc:
           dựng nút rồi đặt sau khối đang đứng. */
        var bang = document.createElement('table');
        bang.className = 'sz-bang-o';
        var dau = bang.appendChild(document.createElement('thead')).appendChild(document.createElement('tr'));
        for (var c = 0; c < nCot; c++) dau.appendChild(document.createElement('th')).appendChild(document.createElement('br'));
        var than = bang.appendChild(document.createElement('tbody'));
        for (var r = 0; r < nHang; r++) {
          var tr = than.appendChild(document.createElement('tr'));
          for (var c2 = 0; c2 < nCot; c2++) tr.appendChild(document.createElement('td')).appendChild(document.createElement('br'));
        }
        var sau = document.createElement('p');
        sau.appendChild(document.createElement('br'));
        chenKhoiSau([bang, sau]);
        /* Con trỏ vào ô đầu tiên — mở bảng ra là để gõ vào nó. */
        datConTroVao(bang.querySelector('th'));
        capNhat();
        ghiNgay();
      });

      veXem();
      document.body.appendChild(kh);
      try { kh.showModal(); } catch (e) { kh.setAttribute('open', ''); }
    }

    /* ── TAB ĐI Ô KẾ TRONG BẢNG ──
       Trong một `contenteditable`, Tab mặc định nhảy ra khỏi cả khung soạn —
       nên gõ xong một ô là mất chỗ. Mọi trình soạn bảng đều cho Tab đi sang ô
       bên phải, hết hàng thì xuống đầu hàng dưới; Shift+Tab đi ngược. Tab ở ô
       cuối cùng thì thêm hẳn một hàng mới, vì đó luôn là thứ người ta định
       làm tiếp. */
    khung.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var s2 = window.getSelection();
      if (!s2 || !s2.rangeCount) return;
      var n = s2.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      var oNay = o && o.closest ? o.closest('td, th') : null;
      if (!oNay || !khung.contains(oNay)) {
        /* ── TAB TRONG DANH SÁCH ──
           Ở Notion, Google Docs, Word, GitHub — chỗ nào có danh sách thì Tab
           là thụt vào và Shift+Tab là thụt ra. Đó là phím mà tay người dùng
           tìm tới trước khi mắt tìm nút trên thanh.

           Trước bản này Tab trong một mục danh sách rơi vào hành vi mặc định
           của `contenteditable`: nhảy tiêu điểm RA KHỎI cả khung soạn. Đang gõ
           dở một danh sách mà bấm Tab là mất chỗ, phải bấm chuột vào lại. */
        var liTab = liDangDung();
        if (!liTab) return;
        e.preventDefault();
        lamDanhSach(e.shiftKey ? 'thutRa' : 'thutVao');
        return;
      }
      e.preventDefault();
      var bang = oNay.closest('table');
      var ds = [].slice.call(bang.querySelectorAll('th, td'));
      var i = ds.indexOf(oNay) + (e.shiftKey ? -1 : 1);
      if (i < 0) return;
      if (i >= ds.length) {
        var hangCuoi = bang.querySelector('tbody') || bang;
        var soCot = bang.querySelectorAll('tr')[0].children.length;
        var tr = document.createElement('tr');
        for (var c = 0; c < soCot; c++) {
          var td = document.createElement('td');
          td.appendChild(document.createElement('br'));
          tr.appendChild(td);
        }
        hangCuoi.appendChild(tr);
        ds = [].slice.call(bang.querySelectorAll('th, td'));
        capNhat();
      }
      var oKe = ds[i];
      if (!oKe) return;
      var r = document.createRange();
      r.selectNodeContents(oKe); r.collapse(true);
      s2.removeAllRanges(); s2.addRange(r);
    });

    /* ══════════════════════════════════════════════════════════════════════
       CHÈN MỘT KHỐI, KHÔNG NHỜ `insertHTML`

       `execCommand('insertHTML')` với một thẻ KHỐI trong lúc con trỏ đang nằm
       trong `<p>` thì trình duyệt phải tự quyết xẻ đoạn ra sao — và với `<pre>`
       nó quyết sai hẳn: thay vì dựng một khối mã, Chromium đổi nó thành một
       `<span style="font-family: ui-monospace…">` RỖNG nằm trong đoạn cũ.

       Đo thật: bấm nút khối mã rồi chọn "No colours" ra
       `<p>y<span style="font-family: ui-monospace, …"></span></p>` — không có
       `<pre>` nào, và Markdown xuất ra mất sạch phần mã.

       Nên dựng nút bằng tay rồi đặt nó SAU khối đang đứng. Khối đang đứng mà
       rỗng thì thay luôn nó — không để lại một đoạn trắng ở trên. */
    function khoiDangDung() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      while (o && o.parentNode !== khung) o = o.parentNode;
      return (o && khung.contains(o)) ? o : null;
    }

    function chenKhoiSau(ds) {
      var truoc = khoiDangDung();
      var rong = truoc && !truoc.textContent.trim() &&
                 !truoc.querySelector('img, ul, ol, table, pre');
      for (var i = 0; i < ds.length; i++) {
        if (truoc) truoc.parentNode.insertBefore(ds[i], truoc.nextSibling);
        else khung.appendChild(ds[i]);
        truoc = ds[i];
      }
      if (rong) {
        var cu = khoiDangDung();
        if (cu && ds.indexOf(cu) < 0) cu.remove();
      }
    }

    /* ── MỘT ĐOẠN RIÊNG NGAY SAU ĐOẠN ĐANG ĐỨNG ──
       Cho ảnh và video: bộ dựng chỉ nhận ra chúng khi chúng đứng MỘT MÌNH một
       dòng. `insertHTML('<p>…</p>')` giữa một đoạn đang có chữ thì Chromium
       nhét nội dung vào CHÍNH đoạn ấy — đo thật: "para" + nút YouTube ra
       `<p>para@youtube[…]</p>`, và bài đăng in nguyên dòng cú pháp ra giữa bài.

       Khác `chenKhoiSau` ở một chỗ: đoạn đang đứng có thể nằm TRONG một khối
       ::: (dải ảnh), và ảnh phải vào trong khối ấy chứ không nhảy ra sau cả
       khối. Đoạn đang đứng mà rỗng thì thay luôn nó. */
    function doanChu(t) {
      var p = document.createElement('p');
      p.appendChild(document.createTextNode(t));
      return p;
    }
    function chenDoanMoi(p) {
      var s = window.getSelection(), k = null;
      if (s && s.rangeCount) {
        var n = s.getRangeAt(0).startContainer;
        var o = n.nodeType === 1 ? n : n.parentNode;
        k = o && o.closest ? o.closest('p') : null;
        if (k && (!khung.contains(k) || k.closest('li, td, th, pre, blockquote'))) k = null;
      }
      if (!k) {
        var cuoi = document.createElement('p');
        cuoi.appendChild(document.createElement('br'));
        chenKhoiSau([p, cuoi]);
        datConTroVao(cuoi);
        return;
      }
      var rong = !k.textContent.trim() && !k.querySelector('img');
      k.parentNode.insertBefore(p, k.nextSibling);
      if (rong) k.remove();
      var sau = p.nextElementSibling;
      if (!sau || sau.nodeName !== 'P' || sau.textContent.trim() || sau.querySelector('img')) {
        sau = document.createElement('p');
        sau.appendChild(document.createElement('br'));
        p.parentNode.insertBefore(sau, p.nextSibling);
      }
      datConTroVao(sau);
    }

    function chenMa(ngon) {
      khung.focus();
      var n = String(ngon || '').trim().replace(/[^\w-]/g, '');
      var pre = document.createElement('pre');
      if (n) pre.setAttribute('data-ngon', n);
      pre.appendChild(document.createTextNode(' '));
      var sau = document.createElement('p');
      sau.appendChild(document.createElement('br'));
      chenKhoiSau([pre, sau]);
      datConTroVao(pre);
      capNhat();
    }

    function datConTroVao(o) {
      var r = document.createRange();
      r.selectNodeContents(o);
      r.collapse(true);
      var s = window.getSelection();
      s.removeAllRanges(); s.addRange(r);
      khung.focus();
    }

    /* `<li>` mà con trỏ đang đứng trong, nếu có. */
    function liDangDung() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      var li = o && o.closest ? o.closest('li') : null;
      return (li && khung.contains(li)) ? li : null;
    }

    function doiLopDoan(lop) {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      /* Nhận MỌI khối chữ, không chỉ `<p>`: con trỏ đang ở một mục danh sách,
         một tiêu đề, hay trong một khối trích dẫn thì căn dòng vẫn có nghĩa.
         Bản trước chỉ nhận `<p>` và bật hộp báo "Put the cursor in a paragraph
         first" — câu ấy đúng về kỹ thuật mà vô nghĩa với người đang gõ: họ RÕ
         RÀNG đang đứng trong một đoạn chữ. Không có khối nào thì lặng lẽ thôi,
         không bật hộp gì. */
      var p = o && o.closest ? o.closest('p, li, h1, h2, h3, h4, blockquote, div.sz-khoi') : null;
      if (!p || !khung.contains(p) || p === khung) return;
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

    /* Một dòng của bảng bật ra: chấm màu · tên · câu mô tả · cú pháp. */
    function dongChon(b, cham, ten, mo, cu, lam) {
      var o = el('button', 'sz-khoi-nut');
      o.type = 'button';
      var trai = el('span', 'sz-khoi-chu');
      var hangC = el('span', 'sz-khoi-hang');
      if (cham) {
        var ch = el('span', 'sz-khoi-cham');
        ch.style.setProperty('--m', cham);
        hangC.appendChild(ch);
      }
      hangC.appendChild(el('span', 'sz-khoi-ten', ten));
      trai.appendChild(hangC);
      if (mo) trai.appendChild(el('span', 'sz-khoi-mo', mo));
      o.appendChild(trai);
      if (cu) o.appendChild(el('code', 'sz-khoi-cu', cu));
      o.addEventListener('mousedown', function (e) { e.preventDefault(); });
      o.addEventListener('click', function () { ghiNgay(); lam(); dongBang(); ghiNgay(); });
      b.appendChild(o);
      return o;
    }

    /* ── BỐN KHUNG NHẤN ──
       Thứ khác nhau THẬT giữa chúng là MÀU, nên mỗi dòng mang một chấm đúng
       bằng màu nó sẽ hiện ra trên trang; `--cl` lấy thẳng tên biến của
       `.callout--*` trong prose.css, nên đổi màu ở đó là chấm ở đây đổi theo.
       Câu mô tả tả VIỆC — dùng cái này khi nào — chứ không tả cơ chế; bốn câu
       "cùng một cái hộp" thì đọc xong vẫn không chọn được cái nào. */
    function veBangNhan() {
      var b = el('div', 'sz-bang sz-bang--khoi');
      b.hidden = true;
      [['note', 'var(--accent-ink)', L('bNote', 'Note'), L('bNoteMo', 'a side point, out of the main flow')],
       ['tip',  'var(--ok)',         L('bTip', 'Tip'),   L('bTipMo', 'a shortcut, something that helps')],
       ['warn', 'var(--warn)',       L('bWarn', 'Heads up'), L('bWarnMo', 'worth knowing before you start')],
       ['stop', 'var(--bad)',        L('bStop', 'Do not'),   L('bStopMo', 'something that should not be done')]
      ].forEach(function (x) {
        dongChon(b, x[1], x[2], x[3], ':::' + x[0], function () { chenKhoi(x[0], ''); });
      });
      b.appendChild(el('p', 'sz-bang-mach', L('bLoaiDoi', 'Click to change: note → tip → warn → stop')));
      return b;
    }

    /* ── NGÔN NGỮ CỦA KHỐI MÃ ──
       Bản trước hỏi bằng `window.prompt`: một hộp thoại trắng của trình duyệt
       ghi "Language (js, css, python… — can be empty)". Không nói ra nó DÙNG
       ĐỂ LÀM GÌ, nên câu trả lời thường là bấm OK cho xong.

       Nó chỉ có đúng một tác dụng: TÔ MÀU CÚ PHÁP cho khối mã trên trang đã
       dựng. Nên bảng này nói thẳng điều đó ở dòng đầu, rồi bày sẵn mấy thứ
       hay dùng — và một lối ra "không tô màu" cho khối mã chỉ là chữ. */
    function veBangNgon() {
      var b = el('div', 'sz-bang sz-bang--khoi');
      b.hidden = true;
      b.appendChild(el('p', 'sz-bang-mach', L('bCodeMach',
        'Pick the language so the code gets syntax colours on the page.')));
      [['', L('bCodeTron', 'No colours'), L('bCodeTronMo', 'plain text in a box')],
       ['js', 'JavaScript', ''], ['html', 'HTML', ''], ['css', 'CSS', ''],
       ['python', 'Python', ''], ['bash', 'Shell', ''], ['json', 'JSON', ''],
       ['sql', 'SQL', ''], ['md', 'Markdown', '']
      ].forEach(function (x) {
        dongChon(b, '', x[1], x[2], x[0] ? '```' + x[0] : '```', function () { chenMa(x[0]); });
      });
      return b;
    }

    function moBangNhan() {
      bangMau.hidden = true; bangMedia.hidden = true; bangNgon.hidden = true;
      nutMedia.setAttribute('aria-expanded', 'false');
      bangNhan.hidden = !bangNhan.hidden;
      nutNhan.setAttribute('aria-expanded', bangNhan.hidden ? 'false' : 'true');
    }

    function moBangNgon() {
      bangMau.hidden = true; bangMedia.hidden = true; bangNhan.hidden = true;
      nutMedia.setAttribute('aria-expanded', 'false');
      nutNhan.setAttribute('aria-expanded', 'false');
      bangNgon.hidden = !bangNgon.hidden;
    }

    function moBangMedia() {
      bangMau.hidden = true; bangNhan.hidden = true; bangNgon.hidden = true;
      nutNhan.setAttribute('aria-expanded', 'false');
      bangMedia.hidden = !bangMedia.hidden;
      nutMedia.setAttribute('aria-expanded', bangMedia.hidden ? 'false' : 'true');
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
          ghiNgay();
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
        ghiNgay();
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
      bangMedia.hidden = true; bangNhan.hidden = true; bangNgon.hidden = true;
      nutMedia.setAttribute('aria-expanded', 'false');
      nutNhan.setAttribute('aria-expanded', 'false');
      bangMau.hidden = !bangMau.hidden;
    }

    function dongBang() {
      bangMau.hidden = true; bangMedia.hidden = true;
      bangNhan.hidden = true; bangNgon.hidden = true;
      nutMedia.setAttribute('aria-expanded', 'false');
      nutNhan.setAttribute('aria-expanded', 'false');
    }

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

    var oFile = el('input');
    oFile.type = 'file';
    oFile.accept = 'image/*';
    oFile.multiple = true;
    oFile.hidden = true;
    oFile.addEventListener('change', function () {
      if (oFile.files && oFile.files.length) xepHang(oFile.files);

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
      var anhTay = document.createElement('img');
      anhTay.setAttribute('src', u);
      anhTay.setAttribute('alt', mo.replace(/[<>&"]/g, ''));
      var pTay = document.createElement('p');
      pTay.appendChild(anhTay);
      chenDoanMoi(pTay);
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
    var xongTai = {};       /* mã ô giữ chỗ → đường thật, cho hoàn tác / làm lại */

    /* Bản chụp hoàn tác chụp cả ô giữ chỗ lúc ảnh còn đang lên. Trả lại bản
       ấy SAU khi ảnh đã lên xong thì ô ấy phải nhận lại đường thật, không thì
       `sangMD` ghi vào bài một đường `blob:` chết. */
    function suaAnhTai() {
      var ds = khung.querySelectorAll('img[data-tai]');
      for (var i = 0; i < ds.length; i++) {
        var d = xongTai[ds[i].getAttribute('data-tai')];
        if (!d) continue;
        ds[i].setAttribute('data-that', d);
        ds[i].removeAttribute('data-tai');
        ds[i].classList.remove('sz-anh--tai');
        if (!ds[i].classList.length) ds[i].removeAttribute('class');
      }
    }
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
      /* ── GIỮ LẠI CHỖ ĐANG ĐỨNG TRƯỚC KHI MỞ KHUNG ──
         `showModal()` kéo tiêu điểm vào hộp thoại, và vùng chọn trong khung
         soạn thảo mất theo. Lúc đóng hộp rồi `chayHang()` gọi `insertHTML`,
         nó chèn vào chỗ vùng chọn ĐANG có — mà lúc ấy hoặc không có, hoặc đã
         nhảy về đầu khung. Kết quả nhìn thấy: bấm Crop xong, ảnh biến mất
         (thật ra nó nằm ở một chỗ khác, ngoài tầm mắt, hoặc không vào đâu).

         Chép lại Range trước khi mở, đặt lại ngay trước khi gọi tiếp. */
      var vungCu = null;
      try {
        var sC = window.getSelection();
        if (sC && sC.rangeCount && khung.contains(sC.getRangeAt(0).startContainer)) {
          vungCu = sC.getRangeAt(0).cloneRange();
        }
      } catch (eC) {}
      var xongGoc = xong;
      xong = function (ra) {
        if (vungCu) {
          try {
            khung.focus();
            var sD = window.getSelection();
            sD.removeAllRanges(); sD.addRange(vungCu);
          } catch (eD) {}
        }
        xongGoc(ra);
      };
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
      var oCho = document.createElement('img');
      oCho.className = 'sz-anh--tai';
      oCho.setAttribute('data-tai', ma);
      oCho.setAttribute('src', xem);
      oCho.setAttribute('alt', '');
      var pCho = document.createElement('p');
      pCho.appendChild(oCho);
      chenDoanMoi(pCho);

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
          /* Ghi lại đường thật theo mã: hoàn tác có thể đã dựng lại ô giữ chỗ
             từ một bản chụp cũ, và lượt làm lại sau đó phải tìm ra nó. */
          xongTai[ma] = kq.duong;
          var a = timAnh();
          if (!a) return;   /* người ta vừa xoá nó — `blob:` còn giữ cho lượt làm lại */
          a.setAttribute('data-that', kq.duong);
          a.removeAttribute('data-tai');
          a.classList.remove('sz-anh--tai');
          if (!a.classList.length) a.removeAttribute('class');
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
    /* ══════════════════════════════════════════════════════════════════════
       GIỮ CON TRỎ QUA MỘT CA MỔ DOM

       `donDanhSach` nhấc nguyên `<li>` và `<ul>` sang chỗ khác. Mỗi lần nhấc
       là mọi `Range` đang trỏ vào chúng bị huỷ — trình duyệt thu con trỏ về
       một chỗ nào đó không đoán trước được.

       Đo thật: gõ một danh sách, thụt vào một mục, bấm "thụt ra" rồi gõ tiếp —
       chữ vừa gõ rơi vào mục CŨ chứ không vào mục vừa thụt ra, và ở cuối danh
       sách còn lại một `<li>` rỗng. Người dùng nói đúng: "thụt vào, thụt ra,
       bullet points, checkbox dùng cùng nhau bị lỗi".

       Cách chữa là cách mọi trình soạn thảo dùng: cắm một cái mốc rỗng vào
       đúng chỗ con trỏ TRƯỚC khi mổ, rồi trả con trỏ về cái mốc ấy sau khi mổ
       xong. Mốc đi theo nút của nó, nút bị nhấc đi đâu thì mốc đi theo đó.

       Mốc là một `<span>` rỗng mang `data-moc`: nó không có bề rộng, không có
       chữ, và bị gỡ ngay sau khi trả con trỏ — nên không bao giờ lọt ra bài. */
    function camMoc() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var r = s.getRangeAt(0);
      if (!khung.contains(r.startContainer)) return null;
      var m = document.createElement('span');
      m.setAttribute('data-moc', '1');
      var r2 = r.cloneRange();
      r2.collapse(true);
      try { r2.insertNode(m); } catch (e) { return null; }
      return m;
    }
    /* ══════════════════════════════════════════════════════════════════════
       CỨU CÁI MỐC TRƯỚC KHI XOÁ NÚT CHỨA NÓ

       `execCommand('insertUnorderedList')` không mang cái mốc theo: nó nhấc
       phần CHỮ vào `<li>` mới và bỏ mốc lại trong cái `<p>` cũ —

           <p><ul><li>AAA</li></ul><span data-moc></span></p>

       Rồi lượt dọn ở trên nhấc `<ul>` ra ngoài và XOÁ cái `<p>` rỗng còn lại.
       Cùng với nó là cái mốc, và cùng với cái mốc là con trỏ: `veMoc` sau đó
       đặt `Range` vào một nút đã rời khỏi tài liệu — `rangeCount` vẫn báo 1
       nên trông như thành công, mà gõ phím thì không có gì xảy ra. Đó là lý do
       thật của "1 số nút trong ô soạn thảo ko dùng đc": không phải nút hỏng,
       mà con trỏ đã rơi ra ngoài tài liệu.

       Nên trước khi xoá một nút, nếu mốc nằm trong nó thì dời mốc sang chỗ
       sống: cuối mục cuối của danh sách vừa nhấc ra, hoặc ngay sau chính nút
       sắp xoá nếu không có danh sách nào để bám. */
    function cuuMoc(sapXoa, dsDich) {
      var m = sapXoa.querySelector ? sapXoa.querySelector('[data-moc]') : null;
      if (!m) return;
      var den = null;
      if (dsDich) {
        var liCuoi = dsDich.lastElementChild;
        if (liCuoi) den = liCuoi;
      }
      if (den) den.appendChild(m);
      else if (sapXoa.parentNode) sapXoa.parentNode.insertBefore(m, sapXoa.nextSibling);
    }

    function veMoc(m) {
      if (!m || !m.parentNode) return;
      /* ── GỠ MỐC TRƯỚC, ĐẶT CON TRỎ SAU ──
         Đã thử làm ngược: đặt `Range` ngay SAU cái mốc rồi mới gỡ mốc đi. Sai.
         Biên của một `Range` là một cặp (nút cha, CHỈ SỐ con); gỡ mốc đi là
         mọi chỉ số sau nó tụt một bậc, nên biên vừa đặt trỏ ra ngoài phạm vi
         và trình duyệt bỏ luôn vùng chọn. Đo thật: sau một cú bấm nút danh
         sách, `getSelection().rangeCount` bằng 0 — không còn con trỏ nào, và
         mọi phím gõ tiếp rơi vào hư không.

         Nên: đếm chỉ số của mốc, gỡ mốc, RỒI đặt biên vào đúng chỉ số ấy — chỗ
         mốc vừa rời khỏi chính là chỗ con trỏ phải đứng.

         Và `focus()` gọi TRƯỚC khi đặt vùng chọn: gọi sau thì ở vài trình
         duyệt nó tự dời con trỏ về đầu khối. */
      var cha = m.parentNode;
      var i = 0;
      for (var n = cha.firstChild; n && n !== m; n = n.nextSibling) i++;
      cha.removeChild(m);
      khung.focus();
      var s = window.getSelection();
      var r = document.createRange();
      var xong = false;
      try { r.setStart(cha, i); r.collapse(true); s.removeAllRanges(); s.addRange(r); xong = true; }
      catch (e) { xong = false; }

      /* ── ĐƯỜNG LÙI: CUỐI KHỐI GẦN NHẤT ──
         Đặt lại con trỏ theo (nút cha, chỉ số) có thể hỏng: nút cha bị chính
         lượt dọn nhấc đi chỗ khác, hoặc chỉ số lệch vì mấy nút quanh nó vừa
         gộp lại. Lúc ấy `addRange` ném lỗi, và nếu không bắt thì vùng chọn còn
         lại RỖNG — `getSelection().rangeCount` bằng 0, mọi phím gõ tiếp rơi
         vào hư không và mọi nút trên thanh thành vô dụng. Đúng triệu chứng
         người dùng gặp: "1 số nút trong ô soạn thảo ko dùng đc".

         Không có chỗ cũ thì về cuối khối đang đứng — sai vài ký tự còn hơn
         mất hẳn con trỏ. */
      if (!xong || !s.rangeCount) {
        var khoi = cha;
        while (khoi && khoi !== khung && !/^(P|LI|H2|H3|H4|BLOCKQUOTE|PRE|TD|TH)$/.test(khoi.nodeName)) {
          khoi = khoi.parentNode;
        }
        if (!khoi || khoi === khung) khoi = khung.lastElementChild || khung;
        try {
          var r2 = document.createRange();
          r2.selectNodeContents(khoi);
          r2.collapse(false);
          s.removeAllRanges(); s.addRange(r2);
        } catch (e2) {}
      }
    }

    /* ══════════════════════════════════════════════════════════════════════
       DANH SÁCH: LÀM THẲNG TRÊN DOM, KHÔNG MƯỢN `execCommand`

       Mấy bản trước đi qua `insertUnorderedList` · `insertOrderedList` ·
       `indent` · `outdent` của trình duyệt rồi dọn hậu quả. Dọn mãi không
       hết, vì lệnh của Chromium được viết cho danh sách PHẲNG — gặp danh sách
       lồng là nó tự chế:

         · bấm "số" trên một mục con của danh sách số → nó gộp mục con vào mục
           ĐẦU của cả danh sách: "sub" + "one" thành một dòng "subone";
         · bấm "việc" trên một mục con → mục CHA cũng thành ô việc, vì vùng
           chọn nằm trong mục con thì cũng "chạm" mục cha;
         · mỗi lượt nó còn nhân bản cái mốc giữ con trỏ, để lại `<span>` rác.

       Người dùng kể đúng mấy chuyện ấy: "lồng giữa bullet point, đánh số thứ
       tự với checkbox thì bị hỏng".

       Nay mọi phép là vài dòng DOM rõ nghĩa, và đều làm trên đúng những MỤC
       mà vùng chọn chứa chữ của nó (mục con thì là mục con, không kéo theo
       cha):

         lamDanhSach('cham' | 'so' | 'viec')  đổi loại; cả vùng chọn đã là
                                              loại ấy thì bỏ danh sách
         lamDanhSach('thutVao' | 'thutRa')    thụt vào / thụt ra một bậc

       Chữ không bao giờ bị chép lại — nút được NHẤC đi nguyên con — nên mốc
       giữ vùng chọn đi theo chữ, và vùng chọn còn nguyên sau cú bấm. */
    function laDS(n) { return !!n && (n.nodeName === 'UL' || n.nodeName === 'OL'); }
    function loaiLi(li) {
      if (li.hasAttribute('data-viec')) return 'viec';
      return li.parentNode && li.parentNode.nodeName === 'OL' ? 'so' : 'cham';
    }
    function liCha(li) {
      var c = li.parentNode && li.parentNode.parentNode;
      return c && c.nodeName === 'LI' ? c : null;
    }

    /* Khối "một dòng" chứa nút `n`: một mục danh sách, một đoạn, một tiêu đề.
       Đoạn nằm TRONG một mục (`<li><p>`) thì tính là mục. */
    function dongCua(n) {
      var o = n.nodeType === 1 ? n : n.parentNode;
      var k = o && o.closest ? o.closest('li, p, h1, h2, h3, h4, blockquote') : null;
      if (k && k.nodeName === 'P' && k.parentNode && k.parentNode.nodeName === 'LI') k = k.parentNode;
      if (!k || k === khung || !khung.contains(k)) return null;
      if (k.closest('pre, td, th')) return null;
      return k;
    }

    /* Mọi dòng mà vùng chọn có CHỮ nằm trong. Hỏi từng nút chữ (và `<br>` của
       dòng trống), không hỏi từng `<li>`: một vùng chọn nằm gọn trong mục con
       thì cũng "giao" với mục cha bao nó, và hỏi theo `<li>` là kéo cả cha
       vào — đúng cái lỗi "đổi mục con thành việc thì mục cha cũng thành việc". */
    function cacDongChon() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return [];
      var r = s.getRangeAt(0);
      if (!khung.contains(r.commonAncestorContainer)) return [];
      var d0 = dongCua(r.startContainer);
      var ra = d0 ? [d0] : [];
      if (r.collapsed) return ra;
      /* Bôi đen tới ĐẦU dòng sau (bấm ba lần là ra đúng thế) thì dòng sau
         không được chọn chữ nào — không tính nó. */
      var dCuoi = r.endOffset === 0 ? dongCua(r.endContainer) : null;
      var di = document.createTreeWalker(khung, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
      var n;
      while ((n = di.nextNode())) {
        if (n.nodeType === 1 && n.nodeName !== 'BR' && n.nodeName !== 'IMG') continue;
        if (n.nodeType === 3 && !n.nodeValue.trim()) continue;
        if (!r.intersectsNode(n)) continue;
        var d = dongCua(n);
        if (d && d !== dCuoi && ra.indexOf(d) < 0) ra.push(d);
      }
      return ra;
    }

    /* ── GIỮ VÙNG CHỌN QUA MỘT CA MỔ ──
       Hai mốc rỗng ở hai đầu vùng chọn (một, nếu chỉ là con trỏ). Mốc là nút
       thật trong cây nên đi theo chữ tới bất cứ đâu chữ bị nhấc. Trả lại thì
       dựng `Range` TRƯỚC khi gỡ mốc: Range là vật sống, gỡ nút xong nó tự dời
       về đúng chỗ — khỏi phải tính lại chỉ số con như `veMoc` phải làm. */
    function giuChon() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var r = s.getRangeAt(0);
      if (!khung.contains(r.startContainer)) return null;
      function moc() { var m = document.createElement('span'); m.setAttribute('data-moc', '1'); return m; }
      var dau = moc(), cuoi = null;
      if (!r.collapsed) {
        cuoi = moc();
        var rc = r.cloneRange(); rc.collapse(false);
        try { rc.insertNode(cuoi); } catch (e) { cuoi = null; }
      }
      var ra = r.cloneRange(); ra.collapse(true);
      try { ra.insertNode(dau); } catch (e2) { if (cuoi) cuoi.remove(); return null; }
      return { dau: dau, cuoi: cuoi };
    }
    function traChon(m) {
      var s = window.getSelection();
      var r = null;
      if (m && m.dau.parentNode && khung.contains(m.dau)) {
        r = document.createRange();
        r.setStartBefore(m.dau);
        if (m.cuoi && m.cuoi.parentNode && khung.contains(m.cuoi)) r.setEndBefore(m.cuoi);
        else r.collapse(true);
      }
      /* Gỡ MỌI mốc, kể cả mốc lạc từ một lượt cũ: không cái nào được lọt vào
         bản nháp hay vào lịch sử hoàn tác. */
      var cu = khung.querySelectorAll('[data-moc]');
      for (var i = 0; i < cu.length; i++) cu[i].remove();
      khung.focus();
      if (r) { try { s.removeAllRanges(); s.addRange(r); } catch (e) {} }
    }

    /* Tách danh sách chứa `li` để `li` đứng MỘT MÌNH trong một danh sách
       riêng (cùng loại thẻ). Mục trước ở lại chỗ cũ, mục sau sang một danh
       sách mới ngay bên dưới — thứ tự bài không đổi. */
    function tachRieng(li) {
      var ds = li.parentNode;
      if (li.nextElementSibling) {
        var sau = document.createElement(ds.nodeName);
        while (li.nextSibling) sau.appendChild(li.nextSibling);
        ds.parentNode.insertBefore(sau, ds.nextSibling);
      }
      if (li.previousElementSibling) {
        var rieng = document.createElement(ds.nodeName);
        ds.parentNode.insertBefore(rieng, ds.nextSibling);
        rieng.appendChild(li);
        return rieng;
      }
      return ds;
    }

    function doiLoai(li, loai) {
      var the = loai === 'so' ? 'OL' : 'UL';
      if (li.parentNode.nodeName !== the) {
        var rieng = tachRieng(li);
        var moi = document.createElement(the);
        while (rieng.firstChild) moi.appendChild(rieng.firstChild);
        rieng.parentNode.replaceChild(moi, rieng);
      }
      if (loai === 'viec') { if (!li.hasAttribute('data-viec')) li.setAttribute('data-viec', '0'); }
      else li.removeAttribute('data-viec');
    }

    /* Một đoạn (hay tiêu đề) thành một mục. Danh sách cùng loại đứng ngay
       trên thì nối vào đó — bôi đen ba đoạn rồi bấm là ra MỘT danh sách ba
       mục, không phải ba danh sách một mục. */
    function vaoDanhSach(k, loai) {
      if (k.nodeName === 'BLOCKQUOTE') {
        var p0 = document.createElement('p');
        while (k.firstChild) p0.appendChild(k.firstChild);
        k.appendChild(p0);
        k = p0;
      }
      var the = loai === 'so' ? 'OL' : 'UL';
      var li = document.createElement('li');
      while (k.firstChild) li.appendChild(k.firstChild);
      if (!li.textContent && !li.querySelector('br, img')) li.appendChild(document.createElement('br'));
      if (loai === 'viec') li.setAttribute('data-viec', '0');
      var truoc = k.previousElementSibling;
      if (truoc && truoc.nodeName === the) { truoc.appendChild(li); k.remove(); }
      else {
        var ds = document.createElement(the);
        ds.appendChild(li);
        k.parentNode.replaceChild(ds, k);
      }
      return li;
    }

    /* Thụt vào: thành mục con của mục đứng trên. Mục ĐẦU danh sách không có
       mục nào đứng trên, nên dựng một mục cha rỗng cho nó bám — Word, Docs,
       Notion đều cho thụt ở đó, và mục cha rỗng không in ra Markdown (xem chỗ
       lọc mục rỗng trong `sangMD`). Danh sách con của chính mục ấy đi theo
       nó, sâu thêm một bậc. */
    function thutVao1(li) {
      var ds = li.parentNode;
      var truoc = li.previousElementSibling;
      /* Mục đầu mà ngay trên là một danh sách KHÁC (chấm rồi tới số): bám vào
         mục cuối của danh sách ấy — trên màn đó chính là "dòng ở trên". */
      var dsTren = ds.previousElementSibling;
      if (!truoc && laDS(dsTren) && dsTren.lastElementChild) truoc = dsTren.lastElementChild;
      if (!truoc || truoc.nodeName !== 'LI') {
        truoc = document.createElement('li');
        ds.insertBefore(truoc, li);
      }
      var dich = truoc.lastElementChild;
      if (!laDS(dich)) {
        dich = document.createElement(ds.nodeName);
        truoc.appendChild(dich);
      }
      dich.appendChild(li);
      if (!ds.querySelector('li')) ds.remove();
    }

    /* Thụt ra: đứng ngay sau mục cha. Các mục đứng SAU nó trong danh sách con
       thành con của nó — nhờ vậy thứ tự đọc từ trên xuống không đổi. Đã ở
       bậc ngoài cùng thì thụt ra nghĩa là thôi là danh sách. */
    function thutRa1(li) {
      var ds = li.parentNode, cha = liCha(li);
      if (!cha) return raDoan(li);
      if (li.nextElementSibling) {
        var dich = li.lastElementChild;
        if (!laDS(dich)) { dich = document.createElement(ds.nodeName); li.appendChild(dich); }
        while (li.nextSibling) dich.appendChild(li.nextSibling);
      }
      cha.parentNode.insertBefore(li, cha.nextSibling);
      /* Mục RỖNG ra ngoài (Enter hai lần để thoát danh sách con) thì nhận kiểu
         của bậc ngoài: thoát khỏi mấy ô việc lồng trong một danh sách số thì
         dòng kế là một số, không phải thêm một ô việc. Mục có chữ thì giữ
         nguyên kiểu của nó — đó là lựa chọn của người viết. */
      if (!li.textContent.trim() && !li.querySelector('img')) {
        if (cha.hasAttribute('data-viec')) li.setAttribute('data-viec', '0');
        else li.removeAttribute('data-viec');
      }
      if (!ds.querySelector('li')) ds.remove();
      /* Mục cha rỗng do thụt mục đầu dựng ra: không còn con nào thì bỏ. */
      if (!cha.textContent.trim() && !cha.querySelector('img, li')) cha.remove();
      return li;
    }

    /* Một mục thành một đoạn văn ở bậc ngoài cùng. Danh sách con của nó
       không mất: chúng đứng ngay dưới đoạn ấy. */
    function raDoan(li) {
      while (liCha(li)) thutRa1(li);
      var rieng = tachRieng(li);
      var p = document.createElement('p');
      var con = [];
      while (li.firstChild) {
        var c = li.firstChild;
        if (laDS(c)) { con.push(c); li.removeChild(c); }
        else p.appendChild(c);
      }
      if (!p.textContent && !p.querySelector('br, img')) p.appendChild(document.createElement('br'));
      var cha = rieng.parentNode;
      cha.insertBefore(p, rieng);
      for (var i = 0; i < con.length; i++) cha.insertBefore(con[i], rieng);
      rieng.remove();
      return p;
    }

    /* ══════════ MỘT CỬA CHO MỌI LỆNH DANH SÁCH ══════════
       Nút chấm · số · việc · thụt vào · thụt ra, phím Tab, gõ tắt `- `, và
       Enter trên một mục rỗng — tất cả đi qua đây: ghi một bước hoàn tác,
       giữ vùng chọn, làm, dọn, trả vùng chọn. */
    function lamDanhSach(ten) {
      khung.focus();
      var ds = cacDongChon();
      if (ten === 'thutVao' || ten === 'thutRa') {
        ds = ds.filter(function (k) { return k.nodeName === 'LI'; });
        /* Mục mà cha của nó cũng đang được chọn thì đi theo cha, không thụt
           riêng — thụt riêng là nó lệch hai bậc so với cha. */
        ds = ds.filter(function (li) {
          for (var a = li.parentNode; a && a !== khung; a = a.parentNode) {
            if (ds.indexOf(a) >= 0) return false;
          }
          return true;
        });
      }
      if (!ds.length) return false;
      ghiNgay();
      var m = giuChon();
      if (ten === 'thutVao') ds.forEach(thutVao1);
      else if (ten === 'thutRa') ds.forEach(function (li) { if (li.parentNode) thutRa1(li); });
      else {
        var boHet = ds.every(function (k) { return k.nodeName === 'LI' && loaiLi(k) === ten; });
        ds.forEach(function (k) {
          if (!k.parentNode) return;
          if (boHet) raDoan(k);
          else if (k.nodeName === 'LI') doiLoai(k, ten);
          else vaoDanhSach(k, ten);
        });
      }
      donDanhSach();
      traChon(m);
      capNhat();
      ghiNgay();
      return true;
    }

    /* ── Ô VIỆC BẤM ĐƯỢC ──
       Ô vuông vẽ bằng `::before` nằm ở lề trái của mục, ngoài hộp chữ. Bấm
       trúng lề ấy là đánh dấu / bỏ dấu; bấm vào chữ thì vẫn là đặt con trỏ.
       `mousedown` + preventDefault để cú bấm không kéo con trỏ và không cuộn. */
    khung.addEventListener('mousedown', function (e) {
      var li = e.target;
      if (!li || li.nodeName !== 'LI' || !li.hasAttribute('data-viec')) return;
      if (e.clientX >= li.getBoundingClientRect().left) return;
      e.preventDefault();
      ghiNgay();
      li.setAttribute('data-viec', li.getAttribute('data-viec') === '1' ? '0' : '1');
      capNhat();
    });

    /* ══════════ DỌN DANH SÁCH ══════════
       Phần lớn HTML sai trước đây là do lệnh danh sách của trình duyệt đẻ ra;
       lệnh ấy nay không còn được gọi. Nhưng HTML DÁN VÀO từ Word, Docs, một
       trang web vẫn mang đủ kiểu, nên bốn ca dưới vẫn phải dọn. */
    function donDanhSach() {
      /* ── CA MỘT: `<ul>` NẰM TRONG `<p>` ── (nút danh sách, xem trên) */
      var ds = khung.querySelectorAll('p > ul, p > ol');
      for (var i = 0; i < ds.length; i++) {
        var ul = ds[i], p = ul.parentNode;
        if (!p || p.tagName !== 'P') continue;
        p.parentNode.insertBefore(ul, p.nextSibling);
        if (!p.textContent.trim() && !p.querySelector('img, ul, ol')) {
          cuuMoc(p, ul);
          p.remove();
        }
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
          /* Không có mục nào đứng trước để làm cha. Bản trước dựng một `<li>`
             RỖNG cho nó bám — và `<li>` rỗng trong `<ol>` in ra một con số
             không có chữ, chính là cái "1. 1." đã thấy. Nay TRẢI PHẲNG: nhấc
             từng mục con lên đứng ngay chỗ danh sách con đang đứng, rồi bỏ cái
             vỏ. Không mất chữ, không mất mục, chỉ mất một bậc thụt vốn không
             có nghĩa. */
          var ke = ds2.parentNode;
          while (ds2.firstChild) ke.insertBefore(ds2.firstChild, ds2);
          ds2.remove();
          continue;
        }
        cha.appendChild(ds2);
      }

      /* ── CA BỐN: `<p>` NẰM THẲNG TRONG `<ul>`/`<ol>` ──
         Bấm nút danh sách khi con trỏ đang ở một chỗ trình duyệt không biết
         gói thế nào, nó nhét luôn một `<p>` vào giữa hai `<li>`. HTML sai, mà
         `sangMD` thì bỏ qua — đoạn văn ấy biến mất khỏi bài.

         Có chữ thì bọc thành một `<li>` để giữ lại; rỗng thì bỏ. */
      var pTrongDs = khung.querySelectorAll('ul > p, ol > p');
      for (var q = 0; q < pTrongDs.length; q++) {
        var pp = pTrongDs[q];
        if (pp.textContent.trim() || pp.querySelector('img')) {
          var liMoi = document.createElement('li');
          while (pp.firstChild) liMoi.appendChild(pp.firstChild);
          pp.parentNode.replaceChild(liMoi, pp);
        } else pp.remove();
      }

      /* ── MỤC RỖNG THÌ KHÔNG XOÁ Ở ĐÂY ──
         Đã thử: dọn luôn cái `<li>` rỗng ở cuối danh sách, để trong .md không
         còn dòng `-` cụt. Sai, và sai nặng — `donDanhSach` chạy sau MỖI lần
         thụt vào/thụt ra, tức là đúng lúc người ta vừa xuống dòng và mục mới
         còn rỗng. Nó xoá ngay cái mục đang chuẩn bị gõ vào, và con trỏ rơi
         theo. Đo thật: cả bài mất sạch, còn lại `<p><br></p>`.

         Mục rỗng là trạng thái BÌNH THƯỜNG lúc đang soạn. Chỗ đúng để lọc nó
         là lúc XUẤT ra Markdown (xem `sangMD`) — ở đó bài đã soạn xong, mục
         nào còn rỗng thì đúng là rỗng thật.

         Chỉ bỏ cái vỏ `<ul>`/`<ol>` không còn mục nào: vỏ ấy không phải chỗ
         gõ được, và nó vẫn chiếm một nhịp lề trên màn hình. */
      var dsRong = khung.querySelectorAll('ul, ol');
      for (var z = 0; z < dsRong.length; z++) {
        if (!dsRong[z].children.length) { cuuMoc(dsRong[z], null); dsRong[z].remove(); }
      }

      /* ── CA NĂM: HAI DANH SÁCH CÙNG LOẠI NẰM SÁT NHAU THÌ LÀ MỘT ──
         Đổi một mục ở giữa sang loại khác rồi đổi lại thì danh sách đã bị tách
         làm ba; đổi lại xong phải liền như cũ. Đi từ CUỐI lên để ba mảnh liền
         nhau gộp dồn được vào mảnh đầu trong một lượt. */
      var cacDS = khung.querySelectorAll('ul, ol');
      for (var g = cacDS.length - 1; g >= 0; g--) {
        var a1 = cacDS[g];
        if (!a1.parentNode) continue;
        var ke = a1.nextSibling;
        while (ke && ke.nodeType === 3 && !ke.nodeValue.trim()) ke = ke.nextSibling;
        if (ke && ke.nodeName === a1.nodeName) {
          while (ke.firstChild) a1.appendChild(ke.firstChild);
          ke.remove();
        }
      }

      /* ── MỤC VỎ ──
         Mục chỉ có danh sách con mà không có chữ của riêng nó (thụt vào ở mục
         đầu dựng ra thế) thì không vẽ dấu chấm — một dấu chấm không có chữ
         nhìn như một dòng bị lỗi. Markdown thì đã lo riêng ở `sangMD`. */
      var cacLi = khung.querySelectorAll('li');
      for (var v = 0; v < cacLi.length; v++) {
        var li2 = cacLi[v], coChu = false;
        for (var c2 = li2.firstChild; c2; c2 = c2.nextSibling) {
          if (laDS(c2) || (c2.nodeType === 1 && c2.hasAttribute('data-moc'))) continue;
          if (c2.nodeType === 3 ? c2.nodeValue.trim() : (c2.textContent.trim() || c2.nodeName === 'IMG' ||
              (c2.nodeName === 'BR' && !li2.querySelector(':scope > ul, :scope > ol')))) { coChu = true; break; }
        }
        li2.classList.toggle('sz-li-vo', !coChu && !!li2.querySelector(':scope > ul, :scope > ol'));
        if (!li2.classList.length) li2.removeAttribute('class');
      }

      donRac();
    }

    /* ── RÁC CỦA TRÌNH DUYỆT ──
       `execCommand('outdent')` trong Chromium để lại những `<span>` mang đúng
       một thuộc tính vô nghĩa như `style="text-wrap-mode: initial"`. Chúng
       không đổi hình gì trên màn, nhưng `sangMD` phải bước qua chúng, và mỗi
       lượt thụt vào–thụt ra lại đẻ thêm một lớp. Bóc ngay khi thấy: `<span>`
       không mang lớp màu của trang thì rút xuống còn phần chữ của nó. */

    function donRac() {
      var sp = khung.querySelectorAll('span[style]');
      for (var i = sp.length - 1; i >= 0; i--) {
        var n = sp[i];
        if (n.hasAttribute('data-moc')) continue;
        if (n.className && /sz-mau|mau-/.test(n.className)) continue;
        var cha = n.parentNode;
        while (n.firstChild) cha.insertBefore(n.firstChild, n);
        cha.removeChild(n);
      }
      /* KHÔNG gọi `khung.normalize()` ở đây. Nó gộp mấy nút chữ nằm cạnh nhau
         — gọn hơn thật, nhưng gộp là đổi cả cấu trúc con của khối, và mọi
         `Range` đang trỏ vào đó bằng (nút cha, chỉ số) thành lệch. Lượt dọn
         này chạy NGAY TRƯỚC lúc trả con trỏ về mốc, nên cái giá là mất con
         trỏ — đắt hơn nhiều so với vài nút chữ dư. */
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
      ghiNgay();
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

      /* ── DỰNG LẠI LỚP XEM TRƯỚC TỪ `data-lop` ──
         Các lớp `sz-anh--*` chỉ để NHÌN trong khung gõ; thứ đi vào file là
         `data-lop`. Trước bản này chúng chỉ được gắn lúc BẤM nút, nên mở một
         bài cũ ra thì mọi tấm ảnh hiện rộng bằng cột chữ dù trong file ghi
         `{.hep}` — người viết tưởng khổ đã mất và bấm đặt lại, ghi đè lên
         đúng thứ mình đã chọn lần trước. `datHTML` gọi hàm này sau mỗi lần
         nạp, nên đây là chỗ đúng để đồng bộ. */
      var moi = khung.querySelectorAll('img');
      for (var k = 0; k < moi.length; k++) {
        var lop = locLopAnh(moi[k]);
        datLopAnh(moi[k], lop.kho, lop.can);
      }
    }

    /* ══════════════════════════════════════════════════════════════════════
       BỐN CHẾ ĐỘ XEM, MỘT CHỖ ĐỨNG

       Bản trước có hai nút bật/tắt: "Preview" mở một hộp bài xem thử, "</>"
       mở một hộp Markdown — cả hai mọc ra DƯỚI ĐÁY khung gõ. Bài dài bao
       nhiêu thì hộp ấy nằm xa bấy nhiêu: bấm xong không thấy gì, phải cuộn
       xuống tìm, xem xong lại cuộn lên sửa, và hai hộp mở cùng lúc thì chồng
       lên nhau dưới chân bài. Người dùng tả đúng: "preview bấm ra lộn xộn,
       chiếm không gian phía dưới".

       Nay là MỘT công tắc bốn nấc ở góc thanh nút, và thứ được chọn hiện
       ngay TẠI CHỖ khung gõ:

         Write    khung gõ, như cũ
         Split    khung gõ bên trái, bài dựng thật bên phải — gõ tới đâu bên
                  phải đổi tới đó. Chỉ có khi khung đủ rộng (≥ 880px); hẹp
                  hơn thì hai nửa xếp chồng.
         Preview  bài dựng thật thay chỗ khung gõ. Bấm đúp vào bài là về
                  lại Write, đúng đoạn vừa xem.
         </>      Markdown sẽ ghi vào file, cũng thay chỗ khung gõ.

       Ở hai chế độ chỉ-xem, các nút định dạng mờ đi và không bấm được — bấm
       một nút mà không có chỗ nào đổi là một nút hỏng. Nấc đang chọn nhớ
       theo máy (localStorage), vì ai quen viết song song thì muốn mở ra là
       song song. */
    var oMD = el('pre', 'sz-md');
    oMD.hidden = true;
    var oXem = el('div', 'sz-xem');
    oXem.hidden = true;
    var coDung = !!(window.ZIB && window.ZIB.md);

    var CHE = [
      ['viet', L('modeWrite', 'Write'),    L('modeWriteTip', 'Write and format')],
      ['song', L('modeSplit', 'Split'),    L('modeSplitTip', 'Write on the left, see the post on the right')],
      ['xem',  L('preview', 'Preview'),    L('previewTip', 'See it as a published post')],
      ['md',   '</>',                      L('seeMd', 'See the Markdown')]
    ];
    var cheDo = 'viet';
    try { cheDo = localStorage.getItem('zib-soan-che') || 'viet'; } catch (e) {}
    if (!CHE.some(function (x) { return x[0] === cheDo; })) cheDo = 'viet';

    var nhomChe = el('span', 'sz-che');
    nhomChe.setAttribute('role', 'group');
    nhomChe.setAttribute('aria-label', L('modeGroup', 'View'));
    var nutChe = {};
    CHE.forEach(function (x) {
      var b = el('button', 'sz-che-nut sz-che-nut--' + x[0], x[1]);
      b.type = 'button';
      b.title = x[2];
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { doiCheDo(x[0]); });
      nutChe[x[0]] = b;
      nhomChe.appendChild(b);
    });
    /* Chưa có bộ dựng (mạng hỏng, hoặc ô soạn nhúng ở trang khác) thì hai nấc
       cần nó ẩn đi, chứ không bày ra nút bấm không ra gì. */
    function coBoDung() {
      nutChe.song.hidden = nutChe.xem.hidden = !coDung;
      if (!coDung && (cheDo === 'song' || cheDo === 'xem')) cheDo = 'viet';
    }
    window.addEventListener('zib-md-san', function () { coDung = true; coBoDung(); doiCheDo(cheDo, true); });

    function doiCheDo(moi, imLang) {
      if (!coDung && (moi === 'song' || moi === 'xem')) moi = 'viet';
      var cu = cheDo;
      cheDo = moi;
      try { localStorage.setItem('zib-soan-che', moi); } catch (e) {}
      ['viet', 'song', 'xem', 'md'].forEach(function (k) {
        khoiSoan.classList.toggle('sz--' + k, k === moi);
        nutChe[k].classList.toggle('sz-che-nut--bat', k === moi);
        nutChe[k].setAttribute('aria-pressed', k === moi ? 'true' : 'false');
      });
      khung.hidden = (moi === 'xem' || moi === 'md');
      oXem.hidden = !(moi === 'xem' || moi === 'song');
      oMD.hidden = moi !== 'md';
      dongBang();
      datThanhAnh(null);
      veCheDo(true);
      if (!imLang && (moi === 'viet' || moi === 'song') && cu !== moi) khung.focus();
    }

    /* Vẽ lại phần đang xem. Gọi từ `capNhat` sau MỖI phím gõ, nên ở chế độ
       song song thì hoãn một nhịp — dựng cả bài 60 lần một giây là thừa. */
    var henXem = null;
    function veCheDo(ngay) {
      if (cheDo === 'md') oMD.textContent = sangMD(khung) || L('empty', '(nothing yet)');
      if (cheDo !== 'xem' && cheDo !== 'song') return;
      if (henXem) { clearTimeout(henXem); henXem = null; }
      if (ngay) { veXemThu(oXem); return; }
      henXem = setTimeout(function () { henXem = null; veXemThu(oXem); }, 250);
    }

    /* Bài xem thử là bài THẬT, nên nó có liên kết thật — bấm vào là rời trang
       quản trị giữa lúc đang viết. Chặn ở đây; muốn mở liên kết thì mở từ bài
       đã đăng. Bấm đúp ở chế độ Preview là về lại chỗ gõ. */
    oXem.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (a) e.preventDefault();
    });
    oXem.addEventListener('dblclick', function () {
      if (cheDo === 'xem') doiCheDo('viet');
    });

    function veXemThu(o) {
      /* Dựng lại cả bài sau mỗi nhịp gõ thì vị trí cuộn phải giữ nguyên — nếu
         không, gõ một chữ ở cuối bài là ô bên phải nhảy về đầu. */
      var cuon = o.scrollTop;
      o.innerHTML = '';
      veXemThu1(o);
      o.scrollTop = cuon;
    }
    function veXemThu1(o) {
      var md = sangMD(khung);
      if (!md.trim()) {
        o.appendChild(el('p', 'sz-xem-trong', L('empty', '(nothing yet)')));
        return;
      }
      var kq;
      try {
        kq = window.ZIB.md.render(md, { base: '' });
      } catch (e) {
        o.appendChild(el('p', 'sz-xem-trong',
          L('previewFail', 'Could not build the preview') + ' — ' + e.message));
        return;
      }

      /* ── THẺ CHIA SẺ ──
         Thứ người viết KHÔNG thể thấy ở đâu khác, và là thứ vừa làm hỏng mấy
         lượt chia sẻ: tiêu đề, tóm tắt, ảnh bìa — đúng ba mẩu mà Facebook,
         Zalo, Messenger đọc. Trang chủ quản đưa vào qua `tuyChon.thongTin()`;
         không có thì bỏ qua phần này. */
      /* Chỉ ở chế độ Preview: ở chế độ song song, cột bên phải là để nhìn
         BÀI trong lúc gõ, và thẻ chia sẻ đứng đầu thì đẩy bài xuống nửa màn. */
      var tin = (cheDo === 'xem' && typeof tuyChon.thongTin === 'function') ? tuyChon.thongTin() : null;
      if (cheDo === 'xem') {
        o.appendChild(el('p', 'sz-xem-mach', L('previewBack', 'Double-click the post to go back to writing.')));
      }
      if (tin) {
        var the = el('div', 'sz-xem-the');
        if (tin.bia) {
          var anhThe = document.createElement('img');
          anhThe.src = tin.bia; anhThe.alt = '';
          the.appendChild(anhThe);
        }
        var ruot = el('div', 'sz-xem-the-ruot');
        ruot.appendChild(el('span', 'sz-xem-the-mien', tin.mien || location.host));
        ruot.appendChild(el('b', 'sz-xem-the-de', tin.tieuDe || L('noTitle', '(no title)')));
        if (tin.tomTat) ruot.appendChild(el('p', 'sz-xem-the-tom', tin.tomTat));
        the.appendChild(ruot);
        o.appendChild(el('p', 'sz-xem-nhan', L('previewCard', 'Share card')));
        o.appendChild(the);
      }

      if (tin) o.appendChild(el('p', 'sz-xem-nhan', L('previewPost', 'The post')));
      var bai = el('div', 'prose sz-xem-bai');
      bai.innerHTML = kq.html;
      o.appendChild(bai);
    }

    hang[0].appendChild(el('span', 'sz-day'));
    hang[0].appendChild(nhomChe);

    /* ══════════ TRẠNG THÁI NÚT ══════════
       Nút đang bật thì phải nhìn ra là đang bật — không thì bôi đen một cụm
       chữ đậm rồi bấm B lần nữa, người ta không biết mình vừa bật hay vừa tắt. */
    function capNhat() {
      [['bold', nDam], ['italic', nNgh], ['strikeThrough', nGac]].forEach(function (x) {
        var bat = false;
        try { bat = document.queryCommandState(x[0]); } catch (e) {}
        x[1].classList.toggle('sz-nut--bat', !!bat);
      });
      /* Ba nút căn dòng sáng theo lớp của khối con trỏ đang đứng. */
      var lopNay = '';
      var sC = window.getSelection();
      if (sC && sC.rangeCount) {
        var nC = sC.getRangeAt(0).startContainer;
        var oC = nC.nodeType === 1 ? nC : nC.parentNode;
        var kC = oC && oC.closest ? oC.closest('[data-lop]') : null;
        if (kC && khung.contains(kC)) lopNay = kC.getAttribute('data-lop') || '';
      }
      for (var kCan in nutCanDS) nutCanDS[kCan].classList.toggle('sz-nut--bat', kCan === lopNay);
      /* Nhãn loại của khối nhấn nói ra là bấm được — kể cả khối mở từ bài cũ,
         nơi markup được dựng ở `tuMD` không có tay với tới `L()`. */
      khung.querySelectorAll('.sz-khoi-loai:not([title])').forEach(function (n) {
        n.title = L('bLoaiDoi', 'Click to change: note → tip → warn → stop');
      });
      if (anhDangChon && !khung.contains(anhDangChon)) datThanhAnh(null);
      veCheDo();
      henGhi();
      luuNhap();
      if (khiDoi) { try { khiDoi(); } catch (e) {} }
    }

    /* ══════════ THANH KHỔ ẢNH — BẤM VÀO ẢNH LÀ HIỆN RA ══════════
       Ba khổ, đúng ba khổ mà bộ dựng hiểu: thường (nằm trong cột chữ), `.wide`
       (rộng hơn cột chữ), `.full` (tràn hết bề ngang màn hình). Không có khổ
       thứ tư, và cũng không có "kéo góc cho to nhỏ tuỳ ý": một con số pixel
       không viết ra được thành Markdown, nên nó sẽ biến mất ở lượt lưu.

       Trước bản này, đổi khổ nằm sau một dòng trong bảng Media và bắt phải đặt
       con trỏ đúng cạnh tấm ảnh — mà ảnh vừa cắt xong thì con trỏ chẳng ở đâu
       cả. Nay bấm thẳng vào tấm ảnh là ba khổ hiện ra ngay dưới nó, khổ đang
       dùng sáng lên. */
    /* ── BỐN NẤC KHỔ ẢNH ──
       Thêm nấc NHỎ vào đầu dãy. Ba nấc cũ chỉ đi một chiều — bằng cột chữ,
       rộng hơn, tràn trang — nên một tấm ảnh dọc chụp từ điện thoại thả vào
       bài là chiếm trọn chiều cao màn hình mà không có cách nào thu lại.

       Nấc chứ không phải kéo góc tự do: khổ ảnh phải nằm trong vài nấc có sẵn
       thì cả bài mới cùng một nhịp, và một con số pixel chọn trên màn rộng là
       một tấm ảnh tràn mép trên điện thoại. Medium · Substack · Ghost đều cho
       nấc, không cho kéo. */
    /* ── NĂM NẤC KHỔ ẢNH ──
       Cùng nếp với ô soạn thư (Gmail: Small · Best fit · Original): người viết
       chọn NẤC, không kéo góc. Kéo góc cho ra một con số pixel là thứ không
       viết được vào Markdown — nó biến mất ở lượt lưu — và một con số chọn
       trên màn 27 inch là một tấm ảnh tràn mép trên điện thoại.

       `{.goc}` là nấc quan trọng nhất mà bản trước thiếu. Mặc định mọi ảnh bị
       kéo rộng bằng cột chữ (`.prose figure img{width:100%}`), nên một ảnh
       chụp màn hình rộng 320px bị phóng lên 720px và mờ nhoè. `{.goc}` giữ
       đúng khổ thật, chỉ thu lại khi ảnh rộng hơn cột chữ.

       `{.hep}` chứ KHÔNG `{.nho}`: `{.nho}` đã là lớp của ĐOẠN CHỮ NHỎ
       (`.prose .nho{font-size:var(--fs-sm)}`), và bộ chọn ấy là hậu duệ nên nó
       ăn cả vào `<figure class="nho">` — tấm ảnh kéo theo cỡ chữ nhỏ và màu
       nhạt cho chú thích của nó. Hai thứ khác hẳn nhau thì phải hai tên.

       Mỗi nấc kèm một dòng giải thích trong `title`: "Hẹp" hay "Rộng" không tự
       nói ra nó rộng hơn cái gì. */
    /* ── BỎ NẤC "RỘNG", THÊM NẤC "RẤT HẸP" ──
       `{.wide}` chỉ rộng hơn cột chữ một chút. Đứng cạnh `{.full}` thì khác
       biệt quá nhỏ để đáng một nút: người viết phải bấm thử cả hai mới thấy,
       mà thấy rồi vẫn khó nói cái nào hợp hơn. Bỏ.

       Đổi lại một nấc thật sự thiếu: một NỬA nấc hẹp. Ảnh dọc chụp từ điện
       thoại, ảnh bìa sách, một cái logo — ở 62% cột chữ chúng vẫn to quá.
       `{.rat-hep}` là 31%, tức đúng một nửa.

       Lớp cũ `{.wide}` vẫn chạy ở bộ dựng (bài cũ có thể đang dùng), chỉ là
       thôi bày nút. */
    /* ── NẤC THEO PHẦN TRĂM ──
       Hai nấc "Small" (31%) và "Narrow" (62%) không trả lời được câu người
       viết thật sự hỏi: "cho nó bằng một nửa", "cho nó còn một phần ba". Hai
       con số lẻ ấy lại nằm hai bên đúng chỗ người ta cần nhất — 50% — và
       không có gì nhỏ hơn 31%.

       Nay nấc gọi bằng chính con số: 25 · 33 · 50 · 75 · 100 phần trăm của
       cột chữ. Vẫn là nấc chứ không kéo góc (lý do ở trên), chỉ là dày hơn và
       tự nói ra nó là gì.

       `{.rat-hep}` và `{.hep}` vẫn chạy ở bộ dựng và ô soạn — bài cũ đang
       dùng — chỉ thôi bày nút. */
    var KHO_ANH = [
      ['{.goc}',     L('anhGoc', 'Original'), L('anhGocMo', 'true size — never blown up')],
      ['{.w25}',     '25%',  L('anhW25Mo', 'a quarter of the text column')],
      ['{.w33}',     '33%',  L('anhW33Mo', 'a third of the text column')],
      ['{.w50}',     '50%',  L('anhW50Mo', 'half the text column')],
      ['{.w75}',     '75%',  L('anhW75Mo', 'three quarters of the text column')],
      ['',           '100%', L('anhThuongMo', 'the width of the text column')],
      ['{.full}',    L('anhTran', 'Full'), L('anhTranMo', 'edge to edge of the screen')]
    ];
    /* ── CĂN DÒNG CHO ẢNH ──
       Chỉ có nghĩa với ảnh HẸP HƠN cột chữ: một tấm bằng đúng cột chữ hay tràn
       cả trang thì không còn chỗ trống nào để dạt về bên nào. Nên ba nút này
       tắt đi ở nấc *Thường* và *Tràn* — bày ra một cái nút bấm không đổi gì
       còn tệ hơn là không có nút.

       Dùng LẠI tên lớp của đoạn văn (`.trai` · `.phai`), không đặt tên mới:
       cùng một ý thì cùng một tên, và bộ dựng đã đọc được chúng sẵn.

       Nhưng KHÔNG bao giờ ghi `{.giua}` lên ảnh, dù đó là nút giữa. `.prose
       .giua` là bộ chọn HẬU DUỆ và nó kèm `max-width:46ch` — đúng cho một đoạn
       chữ căn giữa, mà rơi lên `<figure>` thì bóp tấm ảnh lại còn 46 ký tự bề
       ngang. Giữa vốn đã là mặc định của mọi nấc hẹp, nên nút Giữa nghĩa là
       *bỏ lớp căn đi*, không phải *thêm một lớp*. Cùng một cái bẫy với `{.nho}`
       ở mục 22.5 — bảng tên lớp phải tra trước khi đặt thêm. */
    var CAN_ANH = [
      ['trai', L('canTrai', 'Left'),   L('canTraiMo', 'hugs the left edge of the text column')],
      ['',     L('canGiua', 'Centre'), L('canGiuaMo', 'centred — the default')],
      ['phai', L('canPhai', 'Right'),  L('canPhaiMo', 'hugs the right edge of the text column')]
    ];
    /* Nấc nào còn chỗ trống hai bên để mà dạt. */
    var KHO_CAN_DUOC = { '{.goc}': 1, '{.w25}': 1, '{.w33}': 1, '{.w50}': 1, '{.w75}': 1,
                         '{.rat-hep}': 1, '{.hep}': 1 };

    var LOP_XEM = ['sz-anh--goc', 'sz-anh--w25', 'sz-anh--w33', 'sz-anh--w50',
                   'sz-anh--w75', 'sz-anh--rat-hep', 'sz-anh--hep',
                   'sz-anh--wide', 'sz-anh--full', 'sz-anh--trai', 'sz-anh--phai'];

    /* MỘT cụm `{…}` chở CẢ khổ lẫn căn dòng — `{.hep .phai}`. Bộ dựng tách
       cụm ấy ra thành nhiều lớp từ lâu (`tachLop` trong markdown.mjs), nên
       không phải thêm cú pháp nào; chỉ cần ở đây đọc ra và ghi lại cho đúng.
       Một thuộc tính `data-lop` duy nhất còn có nghĩa là `sangMD`, `trong()`
       và `rua()` không phải biết gì về việc có thêm căn dòng. */
    function locLopAnh(a) {
      var m = (a.getAttribute('data-lop') || '').match(/\{([^}]*)\}/);
      var cac = m ? m[1].trim().split(/\s+/) : [];
      var ra = { kho: '', can: '' };
      for (var i = 0; i < cac.length; i++) {
        if (cac[i] === '.trai' || cac[i] === '.phai') ra.can = cac[i].slice(1);
        else if (cac[i]) ra.kho = '{' + cac[i] + '}';
      }
      return ra;
    }

    function datLopAnh(a, kho, can) {
      if (!KHO_CAN_DUOC[kho]) can = '';
      var cac = [];
      if (kho) cac.push(kho.slice(1, -1));
      if (can) cac.push('.' + can);
      if (cac.length) a.setAttribute('data-lop', '{' + cac.join(' ') + '}');
      else a.removeAttribute('data-lop');
      a.classList.remove.apply(a.classList, LOP_XEM);
      if (kho) a.classList.add('sz-anh--' + kho.slice(2, -1));
      if (can) a.classList.add('sz-anh--' + can);
    }

    var thanhAnh = el('div', 'sz-anh-thanh');
    thanhAnh.hidden = true;
    var nutKho = KHO_ANH.map(function (x) {
      var b = el('button', 'sz-anh-nut', x[1]);
      b.type = 'button';
      if (x[2]) b.title = x[1] + ' — ' + x[2];
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        if (!anhDangChon) return;
        ghiNgay();
        /* Giữ NGUYÊN căn dòng khi đổi khổ — trừ khi khổ mới không căn được. */
        datLopAnh(anhDangChon, x[0], locLopAnh(anhDangChon).can);
        capNhat();
        /* Đổi khổ là đổi cả chiều cao tấm ảnh, nên thanh phải đi theo. */
        datThanhAnh(anhDangChon);
      });
      thanhAnh.appendChild(b);
      return b;
    });

    thanhAnh.appendChild(el('span', 'sz-anh-vach'));

    var nutCan = CAN_ANH.map(function (x) {
      var b = el('button', 'sz-anh-nut sz-anh-nut--can');
      b.type = 'button';
      b.title = x[1] + ' — ' + x[2];
      b.appendChild(svg(x[0] === 'trai' ? ['M4 6h16', 'M4 12h10', 'M4 18h14']
                      : x[0] === 'phai' ? ['M4 6h16', 'M10 12h10', 'M6 18h14']
                      :                   ['M4 6h16', 'M7 12h10', 'M5 18h14']));
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        if (!anhDangChon) return;
        ghiNgay();
        datLopAnh(anhDangChon, locLopAnh(anhDangChon).kho, x[0]);
        capNhat();
        datThanhAnh(anhDangChon);
      });
      thanhAnh.appendChild(b);
      return b;
    });

    var anhDangChon = null;

    function datThanhAnh(a) {
      anhDangChon = a;
      if (!a) { thanhAnh.hidden = true; return; }
      var nay = locLopAnh(a);
      for (var i = 0; i < nutKho.length; i++) {
        nutKho[i].classList.toggle('sz-anh-nut--bat', KHO_ANH[i][0] === nay.kho);
      }
      var canDuoc = !!KHO_CAN_DUOC[nay.kho];
      for (var j = 0; j < nutCan.length; j++) {
        nutCan[j].classList.toggle('sz-anh-nut--bat', canDuoc && CAN_ANH[j][0] === nay.can);
        nutCan[j].disabled = !canDuoc;
      }
      /* Ảnh vừa chèn có thể chưa xong bố cục ở nhịp này — lúc ấy chiều cao
         bằng 0 và thanh rơi lên đỉnh tấm ảnh. Đợi nó tải xong rồi đặt lại. */
      if (!a.complete || !a.getBoundingClientRect().height) {
        a.addEventListener('load', function () {
          if (anhDangChon === a) datThanhAnh(a);
        }, { once: true });
      }
      var rA = a.getBoundingClientRect();
      var rK = khoiSoan.getBoundingClientRect();
      thanhAnh.hidden = false;
      /* Kẹp vào trong khung. Thanh neo theo TÂM tấm ảnh (`translateX(-50%)`),
         nên một tấm căn phải đẩy nó thò ra ngoài mép — và vì nó nằm trong một
         khối `position:relative` có bề ngang hữu hạn, phần thò ra bị kẹp lại
         và flex bóp các con cho vừa. */
      var nuaThanh = thanhAnh.getBoundingClientRect().width / 2;
      var x = rA.left - rK.left + rA.width / 2;
      x = Math.max(nuaThanh, Math.min(x, rK.width - nuaThanh));
      thanhAnh.style.left = Math.round(x) + 'px';
      thanhAnh.style.top  = Math.round(rA.bottom - rK.top - 6) + 'px';
    }

    khung.addEventListener('click', function (e) {
      var a = e.target && e.target.nodeName === 'IMG' ? e.target : null;
      datThanhAnh(a && khung.contains(a) ? a : null);
    });
    /* ── CUỘN THÌ THANH ĐI THEO ẢNH, KHÔNG BIẾN MẤT ──
       Bản trước cất thanh đi ở mọi cú cuộn — trên điện thoại chạm vào ảnh là
       trang nhích một chút, và thanh khổ ảnh vừa hiện đã biến mất trước khi
       kịp bấm. Toạ độ của thanh tính theo KHUNG SOẠN chứ không theo màn hình,
       nên cuộn trang không làm nó lệch; đổi cỡ cửa sổ thì đo lại. */
    addEventListener('resize', function () { if (anhDangChon) datThanhAnh(anhDangChon); }, { passive: true });

    /* ══════════ ĐỔI LOẠI KHUNG NHẤN NGAY TRÊN NHÃN ══════════
       Bốn khung nhấn chỉ khác nhau ở MÀU, và màu ấy nay hiện ngay trong khung
       gõ (xem `.sz-khoi[data-khoi]` trong soan.css). Nên cách tự nhiên nhất
       để đổi loại là bấm vào chính cái nhãn: note → tip → warn → stop → note.
       Ba khối bọc (gallery · wide · full) không xoay — chúng không phải một
       họ với nhau. */
    var LOAI_NHAN = ['note', 'tip', 'warn', 'stop'];
    khung.addEventListener('click', function (e) {
      var nhan = e.target && e.target.closest ? e.target.closest('.sz-khoi-loai') : null;
      if (!nhan || !khung.contains(nhan)) return;
      var kh = nhan.closest('.sz-khoi');
      if (!kh) return;
      var i = LOAI_NHAN.indexOf(kh.getAttribute('data-khoi'));
      if (i < 0) return;
      ghiNgay();
      var moi = LOAI_NHAN[(i + 1) % LOAI_NHAN.length];
      kh.setAttribute('data-khoi', moi);
      nhan.textContent = moi;
      capNhat();
    });


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
      ghiNgay();
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
        /* Hoàn tác đi qua lịch sử của khung, không của trình duyệt — xem
           `ghiNgay`. */
        if (p === 'z') { e.preventDefault(); if (e.shiftKey) lamLai(); else hoanTac(); return; }
        if (p === 'y') { e.preventDefault(); lamLai(); return; }
      }
      /* Enter trong một trích dẫn hoặc tiêu đề thì nên nhả về đoạn thường —
         không thì gõ tiếp là vẫn nằm trong khối cũ, và cả bài thành một khối
         trích dẫn khổng lồ mà không ai hiểu vì sao. */
      if (e.key === 'Enter' && !e.shiftKey) {
        /* ── ENTER TRÊN MỘT MỤC RỖNG: RA MỘT BẬC ──
           Luật này giống nhau ở mọi trình soạn thảo, và người dùng trông đợi
           nó mà không nghĩ tới: gõ xong danh sách thì Enter hai lần để thoát
           ra. Enter thứ nhất mở một mục mới; mục ấy còn rỗng nên Enter thứ hai
           phải ĐƯA RA — ra bậc ngoài nếu đang ở danh sách con, ra hẳn đoạn văn
           nếu đã ở bậc ngoài cùng.

           Không có luật này thì Enter mãi mãi đẻ thêm mục rỗng, và cách duy
           nhất để thoát là bấm nút danh sách trên thanh — mà lúc ấy danh sách
           đã có một dãy mục trắng ở đuôi.

           Chặn TRƯỚC hành vi mặc định, không sửa sau: sửa sau thì màn hình
           nháy một cái (mục mới hiện ra rồi biến mất).

           Mục rỗng ở GIỮA danh sách cũng ra được: `thutRa1` cho các mục phía
           sau đi theo, nên thứ tự đọc không đổi — bản trước chỉ nhận mục
           cuối vì phép cũ nhấc mục ra khỏi chỗ và làm đảo thứ tự. */
        var liRong = liDangDung();
        if (liRong && !liRong.textContent.trim() &&
            !liRong.querySelector('img, ul, ol')) {
          e.preventDefault();
          lamDanhSach('thutRa');
          return;
        }
        ghiNgay();
        setTimeout(function () {
          /* Enter trên một mục việc ĐÃ đánh dấu: trình duyệt chép luôn thuộc
             tính sang mục mới, nên việc vừa mở đã hiện là xong. Việc mới
             luôn là việc chưa làm. */
          var liMoi = liDangDung();
          if (liMoi && liMoi.getAttribute('data-viec') === '1' && !liMoi.textContent.trim()) {
            liMoi.setAttribute('data-viec', '0');
          }
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

    /* ══════════════════════════════════════════════════════════════════════
       TRONG KHUNG CHỈ CÓ KHỐI, KHÔNG CÓ CHỮ TRẦN

       Ô soạn mở ra rỗng: `khung.innerHTML` là chuỗi rỗng. Gõ chữ đầu tiên vào
       thì trình duyệt thả nó xuống dưới dạng một NÚT CHỮ TRẦN, con trực tiếp
       của khung, không có `<p>` nào bọc.

       Từ đó mọi thứ dựa trên khối đều hỏng, mà hỏng lặng lẽ:

       · Enter không tách được đoạn — không có khối nào để tách. Đo thật: gõ
         "Dòng một", Enter, "Dòng hai" ra `Dòng một<p>Dòng hai</p>`, tức dòng
         đầu không phải một đoạn.
       · `formatBlock` (H2, trích dẫn, ¶) không bắt được gì.
       · `sangMD` duyệt theo khối nên nút chữ trần ấy đi vào Markdown không có
         dòng trắng ngăn — hai đoạn dính làm một.

       Nên: mở ra thì GIEO sẵn một `<p><br></p>`, và mỗi lần nội dung đổi thì
       gom mọi nút trần (chữ, `<b>`, `<a>`, `<img>`…) đang làm con trực tiếp
       của khung vào một `<p>`. Gom theo CỤM liền nhau, không mỗi nút một
       `<p>`, để một câu có chữ đậm ở giữa không bị xé thành ba đoạn.

       Đây là việc mọi trình soạn thảo đều làm ngay từ lúc khởi tạo; nó không
       phải một mẹo chữa cháy. */
    var TRAN_INLINE = { '#text': 1, SPAN: 1, B: 1, STRONG: 1, I: 1, EM: 1, A: 1,
                        CODE: 1, U: 1, S: 1, MARK: 1, SUP: 1, SUB: 1, BR: 1, IMG: 1 };
    function baoDamKhoi() {
      if (!khung.firstChild) { khung.innerHTML = '<p><br></p>'; return; }
      var co = false, n;
      for (n = khung.firstChild; n; n = n.nextSibling) {
        var ten = n.nodeType === 3 ? '#text' : n.nodeName;
        if (TRAN_INLINE[ten] && !(n.nodeType === 3 && !n.data.trim())) { co = true; break; }
      }
      if (!co) return;

      var moc = camMoc();
      var cum = [];
      n = khung.firstChild;
      while (n) {
        var ke = n.nextSibling;
        var t2 = n.nodeType === 3 ? '#text' : n.nodeName;
        if (TRAN_INLINE[t2]) cum.push(n);
        else if (cum.length) { gomVaoDoan(cum); cum = []; }
        n = ke;
      }
      if (cum.length) gomVaoDoan(cum);
      veMoc(moc);
    }
    function gomVaoDoan(cum) {
      var p = document.createElement('p');
      cum[0].parentNode.insertBefore(p, cum[0]);
      for (var i = 0; i < cum.length; i++) p.appendChild(cum[i]);
    }

    /* ══════════════════════════════════════════════════════════════════════
       GÕ TẮT KIỂU MARKDOWN

       Gõ `- ` ở đầu dòng thì dòng ấy thành gạch đầu dòng; `# ` thành tiêu đề;
       `> ` thành trích dẫn. Notion, Bear, Craft, Obsidian, Linear, GitHub —
       chỗ nào cũng có, tới mức người viết gõ theo phản xạ rồi mới nhớ ra là
       trang này có hay không.

       Nó không thay thanh nút, nó ĐI CÙNG: người mới thì bấm nút, người quen
       thì gõ, và cả hai ra cùng một kết quả. Ai không biết luật này thì cũng
       không vấp phải nó — trừ khi thật sự định gõ một dấu gạch rồi dấu cách ở
       đầu dòng, và lúc ấy Ctrl+Z trả lại ngay vì mọi lệnh ở đây đều đi qua bộ
       hoàn tác của trình duyệt.

       Chỉ bắt khi cả khối chỉ có ĐÚNG mẩu gõ tắt ấy và không có gì khác — nên
       giữa câu gõ "a - b" không kích hoạt gì. */
    var MAU_GO = [
      [/^#\u00a0?\s$/,        function () { lenh('formatBlock', 'h2'); }],
      [/^##\u00a0?\s$/,       function () { lenh('formatBlock', 'h3'); }],
      [/^>\u00a0?\s$/,        function () { lenh('formatBlock', 'blockquote'); }],
      [/^[-*]\u00a0?\s$/,     function () { lamDanhSach('cham'); }],
      [/^1[.)]\u00a0?\s$/,    function () { lamDanhSach('so'); }],
      [/^\[\s?\]\u00a0?\s$/, function () { lamDanhSach('viec'); }]
    ];

    /* Khối CHỮ gần con trỏ nhất — khác `khoiDangDung`, hàm kia trả về con trực
       tiếp của khung (với danh sách là cả cái `<ul>`). Ở đây cần đúng cái ô
       đang gõ. */
    function khoiChu() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return null;
      var n = s.getRangeAt(0).startContainer;
      var o = n.nodeType === 1 ? n : n.parentNode;
      var k = o && o.closest ? o.closest('p, li, h2, h3, h4, blockquote') : null;
      return (k && khung.contains(k)) ? k : null;
    }

    function goTat() {
      var k = khoiChu();
      if (!k) return;
      /* Trong `<pre>` thì mọi ký tự là nội dung, không phải lệnh. */
      if (k.closest('pre')) return;
      var chu = k.textContent;
      if (chu.length > 4) return;
      for (var i = 0; i < MAU_GO.length; i++) {
        if (!MAU_GO[i][0].test(chu)) continue;
        /* Đang ở danh sách rồi mà gõ `- ` nữa thì để yên: chạy lệnh lúc ấy là
           BỎ danh sách, ngược hẳn ý người gõ. */
        if (i >= 3 && k.nodeName === 'LI' && loaiLi(k) === ['cham', 'so', 'viec'][i - 3]) return;
        while (k.firstChild) k.removeChild(k.firstChild);
        k.appendChild(document.createElement('br'));
        datConTroVao(k);
        /* ── HOÃN MỘT NHỊP ──
           Hàm này chạy TRONG sự kiện `input`, mà `execCommand` gọi ngay trong
           một sự kiện `input` thì Chromium lặng lẽ bỏ qua: đo được là chữ mồi
           biến mất đúng như mong, nhưng khối không đổi — `# chữ` ra `<p>chữ</p>`
           chứ không ra `<h2>`. Đẩy sang nhịp sau, lúc sự kiện đã xong. */
        var lam = MAU_GO[i][1];
        /* Ba mẫu danh sách thì KHÔNG hoãn: chúng làm thẳng trên DOM (xem
           `lamDanhSach`), không qua `execCommand`, nên chạy được ngay trong
           sự kiện. Hoãn thì gõ nhanh là phím kế tiếp tới trước — chữ đã vào
           đoạn cũ rồi danh sách mới dựng, và Enter lúc ấy đi nhầm khối. */
        if (i >= 3) { lam(); return; }
        setTimeout(function () { lam(); capNhat(); }, 0);
        return;
      }
    }

    khung.addEventListener('input', function () { baoDamKhoi(); goTat(); capNhat(); });
    /* Hoàn tác từ menu chuột phải, từ phím của bàn phím ảo, hay từ cử chỉ lắc
       máy của iPhone đi vào bằng `beforeinput` chứ không bằng phím — chặn ở
       đây để chúng cũng đi qua lịch sử của khung. */
    khung.addEventListener('beforeinput', function (e) {
      if (e.inputType === 'historyUndo') { e.preventDefault(); hoanTac(); }
      else if (e.inputType === 'historyRedo') { e.preventDefault(); lamLai(); }
    });
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

    /* ══════════════════════════════════════════════════════════════════════
       RÁP LẠI — VÀ BẢNG BẬT RA PHẢI NẰM NGAY DƯỚI NÚT MỞ NÓ

       Bốn cái bảng (media · nhãn khối · ngôn ngữ mã · màu chữ) trước đây xếp
       SAU ô gõ. Ô gõ cao bao nhiêu thì bảng tụt xuống bấy nhiêu: đo ở một bài
       mười bốn dòng, bảng media nằm cách thanh nút 259px — tức dưới đáy màn.
       Người dùng bấm nút Media rồi không thấy gì, phải cuộn xuống mới gặp.
       Nói đúng lời họ: "phải kéo lên trên cùng mới thấy box".

       Nút mở nằm trên thanh, nên bảng phải mọc ra ngay dưới thanh — đúng chỗ
       mắt đang nhìn. Chúng `hidden` sẵn nên lúc đóng không chiếm một pixel
       nào; thứ tự trong DOM chỉ quyết định chỗ chúng bung ra.

       `oXem` thì ngược lại, vẫn ở dưới cùng: nó là KẾT QUẢ, và kết quả thì
       đứng sau việc. */
    khoiSoan.appendChild(thanh);
    khoiSoan.appendChild(bangMedia);
    khoiSoan.appendChild(bangNhan);
    khoiSoan.appendChild(bangNgon);
    khoiSoan.appendChild(bangMau);
    khoiSoan.appendChild(oBao);
    khoiSoan.appendChild(oFile);
    khoiSoan.appendChild(thanhAnh);
    /* Khung gõ, bài xem thử và Markdown chung MỘT chỗ đứng — xem `doiCheDo`.
       Ở chế độ song song chỗ ấy chia hai cột. */
    var than = el('div', 'sz-than');
    than.appendChild(khung);
    than.appendChild(oXem);
    than.appendChild(oMD);
    khoiSoan.appendChild(than);
    oSan.appendChild(khoiSoan);

    /* Song song chỉ có nghĩa khi mỗi nửa còn đủ một cột chữ đọc được. Đo
       chính khối soạn chứ không đo cửa sổ: cùng một màn hình, ngăn Post có
       menu bên trái còn hẹp hơn cả cửa sổ. */
    function doRong() { khoiSoan.classList.toggle('sz--rong', khoiSoan.clientWidth >= 880); }
    if (window.ResizeObserver) new ResizeObserver(doRong).observe(khoiSoan);
    doRong();
    coBoDung();
    doiCheDo(cheDo, true);

    /* Bấm ra ngoài thì đóng bảng đang mở. Nghe trên `document` chứ không trên
       khối: bấm vào ô Tiêu đề phía trên cũng phải đóng nó. */
    document.addEventListener('mousedown', function (e) {
      if (!khoiSoan.contains(e.target)) { dongBang(); datThanhAnh(null); }
    });

    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
    try { document.execCommand('styleWithCSS', false, false); } catch (e) {}
    /* Gieo khối ngay lúc mở, trước khi ai kịp gõ chữ nào. */
    baoDamKhoi();
    batDauLS();

    return {
      layMD   : function () { return sangMD(khung); },
      rong    : function () { return !khung.textContent.trim(); },
      nhapCu  : doNhap,
      /* `baoDamKhoi` chạy sau mỗi lần nạp/xoá: bài cũ có thể mở ra với chữ
         trần ở đầu (bản .md trước đây dựng thế), và ô vừa xoá thì rỗng hẳn —
         cả hai đều cần gieo lại khối. */
      datHTML : function (h) { khung.innerHTML = h || ''; donAnh(); baoDamKhoi(); donDanhSach(); capNhat(); batDauLS(); },
      xoa     : function () { khung.innerHTML = ''; boNhap(); baoDamKhoi(); capNhat(); batDauLS(); },
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
