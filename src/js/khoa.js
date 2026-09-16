/* ══════════════════════════════════════════════════════════════════════
   KHOÁ CHỦ TRANG — MỘT CHỖ GIỮ, MỘT CHỖ HỎI, MỘT CHỖ BỎ.

   ── VẤN ĐỀ NÓ SINH RA ĐỂ GIẢI ─────────────────────────────────────────
   Trước bản này có BA ô xin khoá: một trong ghi-chu.js, một trong duyet.js,
   và viet-bai.js thì không có ô nào mà chỉ đứng chờ ("nhập khoá ở ô bên
   trên"). Ba ô ấy cùng đọc cùng ghi hai dòng localStorage, nên trên giấy tờ
   chúng dùng chung khoá — nhưng mỗi ô một khung, một câu báo lỗi, một nút
   "Quên khoá" riêng. Hệ quả:

     · bấm Quên khoá ở ngăn Note thì ngăn Comment vẫn đang bày hàng chờ duyệt
       ra đó cho tới lúc nó tự hỏi lại máy chủ — tức là đăng xuất một chỗ mà
       hai chỗ kia chưa biết;
     · gõ khoá SAI thì không chỗ nào nói ra ngay. Khoá cứ thế nằm trong máy,
       và cái báo lỗi tới muộn, ở một ngăn khác, sau khi đã gõ xong cả bài;
     · máy chủ chưa đặt GC_ID/GC_KEY cũng ra đúng một câu "sai khoá" như lúc
       gõ nhầm — xem chú thích cùng chuyện trong functions/api/bai.js.

   Nay: file này giữ khoá, file này hỏi khoá, file này bỏ khoá. Ba ngăn kia
   chỉ hỏi nó một câu "có khoá chưa" rồi nghe nó báo khi khoá đổi.

   ── THỬ KHOÁ TRƯỚC KHI NHẬN ───────────────────────────────────────────
   Bấm Đăng nhập là gọi thật một lượt lên máy chủ. Đúng thì mới lưu. Sai thì
   KHÔNG lưu gì cả — chứ không phải lưu rồi để ngăn nào gọi tới mới báo lỗi.
   Cái giá là chờ một lượt mạng ở màn đăng nhập; đổi lại không bao giờ có
   chuyện gõ xong cả bài rồi mới biết khoá sai từ đầu.

   ── VÌ SAO KHÔNG PHẢI COOKIE, KHÔNG PHẢI PHIÊN ĐĂNG NHẬP ──────────────
   Máy chủ không giữ phiên nào: mỗi lượt gọi tự mang hai vế khoá trong header
   (xem `duocGhi` trong functions/api/ghi-chu.js). Nên "đăng nhập" ở đây thật
   ra là "nhớ khoá trên máy này", và "đăng xuất" là "quên nó đi". Gọi đúng
   tên ấy trong giao diện thì không ai tưởng rằng bấm Đăng xuất là thu hồi
   được khoá ở máy khác — nó không thu hồi được gì cả.

   Khoá sống trong localStorage của MÁY NÀY. Máy khác, trình duyệt khác, chế
   độ ẩn danh — đều phải nhập lại. Đó là đúng.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var K_ID = 'zib-gc-id', K_KEY = 'zib-gc-key';
  var goc = document.documentElement;

  var N = {};
  try { N = JSON.parse(goc.getAttribute('data-khoa-nhan') || '{}'); } catch (e) {}
  function L(k, m) { return N[k] || m; }

  function doc(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function bo(k)     { try { localStorage.removeItem(k); } catch (e) {} }

  function lay() { return { id: doc(K_ID), key: doc(K_KEY) }; }
  function co()  { var k = lay(); return !!(k.id && k.key); }

  /* Gắn hai vế khoá vào một bộ header có sẵn. Mọi lượt gọi cần khoá đều đi
     qua đây, nên đổi tên header thì sửa đúng một dòng. */
  function dau(them) {
    var h = them || {}, k = lay();
    h['x-gc-id'] = k.id; h['x-gc-key'] = k.key;
    return h;
  }

  /* Một sự kiện trên `document` chứ không phải một danh sách hàm gọi lại: ba
     ngăn kia dựng lên và tắt đi theo nhịp riêng của chúng, và một cái danh
     sách thì phải có chỗ gỡ tên ra — mà chỗ ấy chắc chắn có ngày bị quên. */
  function bao() {
    document.dispatchEvent(new CustomEvent('zib:khoa', { detail: { co: co() } }));
  }

  function dat(id, key) { ghi(K_ID, id); ghi(K_KEY, key); bao(); }
  function xoa()        { bo(K_ID); bo(K_KEY); bao(); }

  function theoDoi(fn) {
    document.addEventListener('zib:khoa', function (e) { fn(!!(e.detail && e.detail.co)); });
  }

  /* Đổi khoá ở TAB KHÁC thì tab này phải theo — nếu không, mở hai tab admin
     rồi đăng xuất ở một tab là tab kia vẫn bày đủ mọi ô ra như chưa có gì
     xảy ra, và lượt gửi kế tiếp của nó nhận 401 không lý do. */
  window.addEventListener('storage', function (e) {
    if (e.key === K_ID || e.key === K_KEY) bao();
  });

  /* ══════════ THỬ KHOÁ ══════════

     Không có đường /api nào sinh ra chỉ để thử khoá. Cố ý: thêm một đường
     nữa là thêm một chỗ phải canh quyền, mà hai đường ĐANG CÓ đều đã trả
     401 khi khoá sai — dùng luôn chúng thì không có gì mới để canh.

     Thứ tự ưu tiên là thứ tự RẺ: /api/bai chỉ liệt kê tên thư mục, còn
     /api/binh-luan?cho=1 phải quét bảng. Trang nào không khai đường nào thì
     thôi không thử — lúc ấy nhận khoá luôn, và ngăn nào gọi tới sẽ tự báo. */
  function duongThu() {
    var bai = goc.getAttribute('data-bai-api');
    if (bai) return bai;
    var duyet = goc.getAttribute('data-duyet-api');
    if (duyet) return duyet + '?cho=1';
    return '';
  }

  function thu(id, key) {
    var duong = duongThu();
    if (!duong) return Promise.resolve({ ok: true });

    return fetch(duong, {
      cache: 'no-store',
      headers: { 'x-gc-id': id, 'x-gc-key': key }
    }).then(function (r) {
      return r.json().catch(function () { return {}; })
        .then(function (d) { return { ma: r.status, d: d || {} }; });
    }).then(function (kq) {
      if (kq.ma === 200 && kq.d.ok !== false) return { ok: true };

      /* ── KHOÁ SAI THÌ KHÔNG NÓI GÌ ──
         Trang này ai gõ đúng đường dẫn cũng mở được, nên màn đăng nhập là thứ
         người lạ nhìn thấy. Một câu "mã chủ hoặc khoá sai" nói với họ đúng hai
         điều: cửa này có thật, và họ đã sai ở vế nào — hai mẩu ấy cộng lại là
         lời mời dò tiếp.

         Chủ trang mất gì? Gần như không: ô khoá tự xoá trắng và con trỏ nhảy
         về đó, nên "gõ lại đi" vẫn được nói ra, chỉ là bằng hành vi chứ không
         bằng chữ.

         `cauhinh` thì NGƯỢC LẠI — vẫn nói. Máy chủ chưa đặt khoá thì không ai
         vào được, kể cả người gõ đúng: không có gì để giấu, mà có một buổi
         của chủ trang để cứu. */
      if (kq.d.loi === 'cauhinh' && kq.d.chiTiet) {
        return { ok: false, chu: String(kq.d.chiTiet) };
      }
      if (kq.ma === 401) return { ok: false, chu: '' };
      /* Mạng hỏng hay máy chủ đổ thì vẫn báo: đó không phải chuyện khoá, và
         im lặng ở đây chỉ làm người ta bấm lại mười lần. */
      return { ok: false, chu: L('failed', 'Máy chủ không nhận.') };
    }).catch(function () {
      return { ok: false, chu: L('netErr', 'Mạng trục trặc. Thử lại một lát nữa.') };
    });
  }

  /* ══════════ KHUNG ĐĂNG NHẬP ══════════

     Dựng bằng DOM chứ không nối chuỗi HTML: ô mật khẩu và giá trị người ta
     vừa gõ không bao giờ đi qua innerHTML, nên không có chỗ nào để một ký tự
     lạ trong khoá thành ra thẻ. Ở một khung chỉ chủ trang thấy thì rủi ro ấy
     nhỏ, nhưng đây đúng là chỗ không nên tiết kiệm. */
  function veCong(hop, xong) {
    /* Dựng vào một thẻ CON chứ không đặt lại class của `hop`: chỗ cắm có thể
       là ô viết ghi chú ở /notes/, và ô ấy mang sẵn `.gc-viet` với nền chìm
       viền đứt của nó. Đè class đi thì khung đăng nhập hiện ra không có nền,
       nằm trơ giữa danh sách ghi chú. */
    hop.textContent = '';
    var khung = document.createElement('div');
    khung.className = 'kh-cong';
    hop.appendChild(khung);

    var de = document.createElement('p');
    de.className = 'kh-de';
    de.textContent = L('title', 'Đăng nhập');
    khung.appendChild(de);

    var dan = document.createElement('p');
    dan.className = 'kh-dan';
    dan.textContent = L('lead', 'Nhập một lần, dùng cho cả ghi chú, bình luận và bài viết.');
    khung.appendChild(dan);

    var hang = document.createElement('div');
    hang.className = 'kh-hang';

    function o(nhan, loai, ten) {
      var l = document.createElement('label');
      l.className = 'kh-o';
      var s = document.createElement('span');
      s.textContent = nhan;
      var i = document.createElement('input');
      i.type = loai; i.name = ten;
      i.autocomplete = loai === 'password' ? 'current-password' : 'username';
      i.autocapitalize = 'off'; i.spellcheck = false;
      l.appendChild(s); l.appendChild(i);
      hang.appendChild(l);
      return i;
    }

    var oId  = o(L('keyId', 'Mã chủ'), 'text', 'gc-id');
    var oKey = o(L('keySecret', 'Khoá'), 'password', 'gc-key');
    khung.appendChild(hang);

    var nut = document.createElement('button');
    nut.type = 'button';
    nut.className = 'btn btn--chinh';
    nut.textContent = L('signIn', 'Đăng nhập');

    var hangNut = document.createElement('div');
    hangNut.className = 'kh-nut';
    hangNut.appendChild(nut);
    khung.appendChild(hangNut);

    var bao2 = document.createElement('p');
    bao2.className = 'kh-bao';
    khung.appendChild(bao2);

    function noi(chu, hong) {
      bao2.textContent = chu || '';
      bao2.classList.toggle('kh-bao--hong', !!hong);
    }

    function gui() {
      var id = (oId.value || '').trim();
      var key = (oKey.value || '').trim();
      if (!id || !key) { noi(L('needBoth', 'Nhập đủ hai ô.'), true); return; }
      nut.disabled = true;
      noi(L('checking', 'Đang thử khoá…'));
      thu(id, key).then(function (kq) {
        nut.disabled = false;
        if (!kq.ok) {
          noi(kq.chu, !!kq.chu);
          /* Xoá trắng ô khoá chứ không bôi đen: bôi đen thì chuỗi cũ còn đó và
             gõ tiếp là chèn vào giữa. Xoá rồi thì lần gõ sau là một lần gõ
             sạch — và đó cũng là dấu hiệu duy nhất nói rằng vừa có gì đó
             không xong. */
          oKey.value = '';
          oKey.focus();
          return;
        }
        /* Lưu SAU khi máy chủ đã nhận. Lưu trước rồi sửa sau thì có một
           quãng mà máy nhớ một khoá sai, và ngăn nào tình cờ hỏi đúng lúc ấy
           sẽ nhận 401 mà không ai giải thích được vì sao. */
        dat(id, key);
        noi('');
        if (xong) xong();
      });
    }

    nut.addEventListener('click', gui);
    [oId, oKey].forEach(function (i) {
      i.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); gui(); }
      });
    });

    /* Con trỏ nhảy vào ô đầu — nhưng chỉ khi khung này là thứ người ta vừa
       mở ra để dùng, không phải khi nó nằm sẵn dưới cuối một trang đang đọc.
       `autofocus` đặt cứng thì trang /notes/ vừa mở đã cuộn tuột xuống ô khoá. */
    return { tap: function () { oId.focus(); }, noi: noi };
  }

  /* ── LỜI CHÀO KIÊM LỐI RA ──
     Một dòng chữ thường, không phải một cái nút có viền: chỗ này trước đây là
     dòng phụ đề của trang ("Ghi chú, bình luận và bài viết…") — một câu tả
     lại thứ người ta đang nhìn thấy, tức là một câu không nói thêm gì.

     Nay nó nói đúng hai điều đáng nói: ĐANG LÀ AI, và ĐI RA LỐI NÀO. Lối ra
     là một <button> (nó làm một việc, không dẫn tới địa chỉ nào) nhưng mặc
     đúng bộ đồ của chữ trong dòng — xem `.kh-ra` ở list.css. */
  function veChao(hop, ten) {
    hop.textContent = '';
    var chu = document.createElement('span');
    chu.textContent = (L('hello', 'Haluuu, {ten}!')).replace('{ten}', ten || '');
    hop.appendChild(chu);
    hop.appendChild(document.createTextNode(' \u2014 '));

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kh-ra';
    b.textContent = L('signOut', 'Đăng xuất');
    b.addEventListener('click', function () { xoa(); });
    hop.appendChild(b);
    return b;
  }

  window.ZIB = window.ZIB || {};
  window.ZIB.khoa = {
    co: co, lay: lay, dau: dau, dat: dat, xoa: xoa,
    theoDoi: theoDoi, thu: thu, veCong: veCong, veChao: veChao
  };
})();
