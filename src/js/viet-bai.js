/* ══════════════════════════════════════════════════════════════════════
   Ô VIẾT BÀI — mọc ở /z-admin/, nói chuyện với /api/bai.

   Khác ô viết GHI CHÚ ở một điểm quan trọng, và điểm ấy phải nói thẳng ra cho
   người dùng: ghi chú bấm xong là thấy ngay, còn bài thì KHÔNG. Bài đi vào kho
   mã rồi đợi Cloudflare dựng lại — khoảng một phút. Bấm Đăng xong mà trang
   chẳng đổi gì thì ai cũng tưởng hỏng, nên sau khi gửi xong màn hình phải nói
   rõ nó đang ở đâu và bao giờ thì xong.

   Khoá do src/js/khoa.js giữ, và trang /z-admin/ chỉ hỏi nó MỘT lần ở cửa
   vào — file này không có ô xin khoá nào.

   Phần thân bài không còn là <textarea> gõ Markdown trần: src/js/soan.js dựng
   một khung gõ như gõ văn bản, và lúc bấm Đăng mới đổi ra Markdown. Lý do đầy
   đủ ở đầu file ấy; chỗ này chỉ cần nhớ một điều — thứ gửi lên GitHub vẫn
   đúng là Markdown, y hệt bản gõ tay ở máy.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var goc = document.documentElement;
  var api = goc.getAttribute('data-bai-api');
  var oSan = document.querySelector('[data-viet-bai-host]');
  if (!api || !oSan) return;

  var N = {};
  try { N = JSON.parse(goc.getAttribute('data-bai-nhan') || '{}'); } catch (e) {}
  function L(k, m) { return N[k] || m; }

  var K = (window.ZIB || {}).khoa;
  function coKhoa() { return !!(K && K.co()); }

  /* Khung soạn thảo đang cắm vào ô này — giữ lại để lúc bấm Đăng còn hỏi nó
     lấy Markdown, và lúc đăng xong còn bảo nó dọn bản nháp. */
  var soan = null;

  function tho(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Bản sao của slugify bên tools/lib/text.mjs, chỉ để XEM TRƯỚC đường dẫn khi
     đang gõ tiêu đề. Đường dẫn thật do máy chủ rút ra — ở đây rút sai một chút
     cũng không hỏng gì, nhưng rút cho giống thì đỡ bất ngờ. */
  function slugify(s) {
    return String(s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/['"‘’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  var hop = document.createElement('section');
  hop.className = 'vb-khoi';
  oSan.appendChild(hop);

  var dsMuc = null;

  function noi(chu, kieu) {
    var o = hop.querySelector('.vb-noi');
    if (!o) return;
    o.textContent = chu || '';
    o.className = 'vb-noi' + (kieu ? ' vb-noi--' + kieu : '');
  }

  /* ── CHƯA CÓ KHOÁ THÌ KHÔNG BÀY Ô VIẾT ──
     Ô viết ghi chú ngay bên trên đã có sẵn chỗ nhập khoá. Bày thêm một ô nữa
     là hỏi cùng một câu hai lần trên một màn hình. Ở đây chỉ nói ngắn gọn là
     đang đợi khoá, rồi tự hiện ra khi khoá đã lưu. */
  /* Ở /z-admin/ ngăn này không bao giờ hiện ra khi chưa đăng nhập — cửa chung
     của trang đã chặn từ ngoài. Câu dưới đây chỉ là lưới an toàn cho trường
     hợp khoa.js không tải được. */
  function khungCho() {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('locked',
      'Sign in above to unlock this.')) + '</p>';
  }

  /* ══════════════ BẢNG BÀI ĐÃ ĐĂNG ══════════════

     Ngăn Post có hai mặt: VIẾT MỚI và SỬA BÀI CŨ. Trước bản này nó chỉ có mặt
     đầu, nên một bài đăng nhầm ngày, sai chính tả trong tiêu đề, hay cần cất
     đi đều phải mở máy, mở file, sửa tay, đẩy lên — tức là đúng cái quy trình
     mà ô viết bài sinh ra để khỏi phải làm.

     ── BA TRẠNG THÁI, MỘT HÀNG NÚT LỌC ──
       hiện   bài công khai
       nháp   `draft: true` — vẫn dựng ra trang để xem thử, nhưng không vào
              danh sách, feed, sitemap, và mang noindex
       ẩn     `hidden: true` — không dựng ra gì cả, đường dẫn cũ trả 404

     ── VÌ SAO KHÔNG CÓ NÚT XOÁ ──
     Xoá một file trong kho mã thì lịch sử Git vẫn giữ, nhưng khôi phục lại là
     việc của dòng lệnh — tức là đúng thứ người dùng ô này không muốn động
     tới. "Ẩn" làm được mọi điều người ta thật sự cần khi muốn xoá (bài biến
     khỏi trang, không ai đọc được nữa) mà vẫn lấy lại được bằng một cú bấm. */

  /* ── BẢNG BÀI TẢI THEO TRANG ──
     Máy chủ phải MỞ TỪNG FILE mới biết tiêu đề và trạng thái của một bài, nên
     một bảng 60 bài là 60 lượt gọi ra GitHub — quá hạn mức của một request
     Worker, và chậm cả chục giây kể cả khi lọt.

     Nay nó xin từng trang 20 bài (`?ds=1&tu=N`), và `bangDS` là phần ĐÃ TẢI,
     cộng dồn qua từng lượt. Ba con số đi kèm:
       `tong`  tổng số bài trong kho — biết ngay từ trang đầu, vì nó đếm trên
               cây thư mục chứ không phải trên mấy file vừa mở;
       `con`   còn trang nữa không;
       `cut`   GitHub cắt bớt chính cái cây ấy (kho quá lớn) — chuyện khác hẳn,
               và không có nút nào chữa được.

     Lọc theo trạng thái và lọc theo tên đều chạy TRÊN PHẦN ĐÃ TẢI, và giao
     diện nói rõ điều đó. Lọc trên máy chủ thì mỗi lần gõ một chữ là một vòng
     mở sáu chục file — đắt hơn hẳn việc bấm "tải thêm" một hai lần. */
  var bangDS = null;      /* mảng bài ĐÃ tải, cộng dồn qua từng trang */
  var dangTai = false;    /* chặn hai cú bấm "tải thêm" chồng lên nhau */
  var dangSua = null;     /* {duong, sha, fm, khoaKhac} của bài đang mở */
  var locTrang = '';      /* '' = tất cả */
  var locChu = '';        /* lọc theo tên bài, chạy trên phần đã tải */

  /* Bỏ dấu để gõ "tam ly" cũng tìm ra "tâm lý" — cùng phép với ô tìm kiếm của
     trang (src/js/search.js). `normalize` có ở mọi trình duyệt còn sống; bọc
     try cho chắc, hỏng thì rơi về so khớp có dấu. */
  function khongDau(x) {
    try {
      return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
    } catch (e) { return String(x).toLowerCase(); }
  }

  var TEN_TRANG = { hien: 'Live', nhap: 'Draft', an: 'Hidden' };

  function veBang() {
    soan = null;
    hop.innerHTML =
      '<div class="vb-thanh">' +
        '<button type="button" class="btn btn--chinh" data-moi>' +
          tho(L('newPost', 'New post')) + '</button>' +
        '<label class="vb-tim">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/></svg>' +
          '<input type="search" data-tim autocomplete="off" spellcheck="false" ' +
                 'placeholder="' + tho(L('find', 'Filter by title')) + '" ' +
                 'aria-label="' + tho(L('find', 'Filter by title')) + '">' +
        '</label>' +
        '<div class="vb-loc" data-loc></div>' +
      '</div>' +
      '<div class="vb-bang" data-bang>' +
        '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    hop.querySelector('[data-moi]').addEventListener('click', function () { khungViet(); });

    var oTim = hop.querySelector('[data-tim]');
    if (oTim) {
      oTim.value = locChu;
      /* Vẽ lại ngay từng phím, không chờ: bảng nằm sẵn trong bộ nhớ nên lọc
         là một phép `filter` trên vài chục dòng — đặt một cái hẹn 200ms ở đây
         chỉ làm ô gõ có cảm giác trễ mà không tiết kiệm được gì. */
      oTim.addEventListener('input', function () {
        locChu = oTim.value.trim();
        veHang();
        /* `veHang` dựng lại phần bảng chứ không dựng lại thanh trên, nên ô gõ
           không mất tiêu điểm — nhưng phòng khi sau này có người đổi. */
        if (document.activeElement !== oTim) oTim.focus();
      });
    }

    if (bangDS) veHang(); else taiBang(0);
  }

  /* `tu = 0` là tải lại từ đầu; lớn hơn 0 là xin thêm một trang và CỘNG vào
     phần đã có. Một hàm cho cả hai đường: hai hàm thì hai chỗ phải nhớ cập
     nhật `tong`, `con`, `cut` cho khớp. */
  function taiBang(tu) {
    if (dangTai) return;
    dangTai = true;
    var them = tu > 0;
    var nutThem = hop.querySelector('[data-them]');
    if (nutThem) { nutThem.disabled = true; nutThem.textContent = L('working', '…'); }

    fetch(api + '?ds=1&tu=' + (tu || 0), { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        dangTai = false;
        if (!kq.d || !kq.d.ok) {
          if (them) { veHang(); noi(loiChu(kq.d), 'hong'); return; }
          var o = hop.querySelector('[data-bang]');
          if (o) o.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
          return;
        }
        var moi = kq.d.bai || [];
        bangDS = them ? bangDS.concat(moi) : moi;
        bangDS.tong = kq.d.tong;
        bangDS.con  = kq.d.con === true;
        bangDS.cut  = kq.d.cut === true;
        veHang();
      })
      .catch(function () {
        dangTai = false;
        if (them) { veHang(); noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong'); return; }
        var o = hop.querySelector('[data-bang]');
        if (o) o.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Network hiccup. Try again in a moment.')) + '</p>';
      });
  }

  function veHang() {
    var oLoc = hop.querySelector('[data-loc]');
    var oBang = hop.querySelector('[data-bang]');
    if (!oBang) return;

    /* Đếm theo trạng thái để in số lên chip. Chip có số thì biết ngay có gì
       đang nằm trong đó mà không phải bấm thử. */
    var dem = { hien: 0, nhap: 0, an: 0 };
    bangDS.forEach(function (b) { if (dem[b.trang] != null) dem[b.trang]++; });

    if (oLoc) {
      var h = '<button type="button" class="chip' + (locTrang ? '' : ' chip--nay') +
              '" data-t="">' + tho(L('all', 'All')) +
              '<span class="chip-so">' + bangDS.length + '</span></button>';
      ['hien', 'nhap', 'an'].forEach(function (t) {
        if (!dem[t]) return;
        h += '<button type="button" class="chip' + (locTrang === t ? ' chip--nay' : '') +
             '" data-t="' + t + '">' + tho(TEN_TRANG[t]) +
             '<span class="chip-so">' + dem[t] + '</span></button>';
      });
      oLoc.innerHTML = h;
      [].slice.call(oLoc.querySelectorAll('button')).forEach(function (b) {
        b.addEventListener('click', function () {
          locTrang = b.getAttribute('data-t'); veHang();
        });
      });
    }

    var chu = locChu ? khongDau(locChu) : '';
    var ds = bangDS.filter(function (b) {
      if (locTrang && b.trang !== locTrang) return false;
      if (chu && khongDau(b.title).indexOf(chu) < 0) return false;
      return true;
    });

    /* ── KHÔNG CÓ DÒNG NÀO: HAI CÂU KHÁC NHAU ──
       "Chưa có bài nào" và "không bài nào ĐÃ TẢI khớp với chữ đang gõ" là hai
       tình huống khác hẳn — câu thứ hai còn có đường đi tiếp (tải thêm), câu
       thứ nhất thì không. Nói chung một câu là để người dùng tự đoán, và đoán
       sai thì họ đi tìm một bài vốn đang nằm ở trang chưa tải. */
    if (!ds.length) {
      oBang.innerHTML = '<p class="vb-cho">' +
        tho(chu || locTrang ? L('noMatch', 'Nothing matches, in what is loaded so far.')
                            : L('empty', 'Nothing here.')) + '</p>' +
        chanBang();
      noiNutThem();
      return;
    }

    oBang.innerHTML = ds.map(function (b) {
      return '<div class="vb-dong" data-d="' + tho(b.duong) + '">' +
        '<span class="vb-dong-ngay">' + tho(b.date) + '</span>' +
        '<span class="vb-dong-ten">' + tho(b.title) + '</span>' +
        (b.trang !== 'hien'
          ? '<span class="vb-cd vb-cd--' + b.trang + '">' + tho(TEN_TRANG[b.trang]) + '</span>'
          : '<span class="vb-cd"></span>') +
        '<span class="vb-dong-nut">' +
          '<button type="button" class="vb-nho" data-sua>' + tho(L('edit', 'Edit')) + '</button>' +
          '<button type="button" class="vb-nho" data-an>' +
            tho(b.trang === 'an' ? L('unhide', 'Unhide') : L('hide', 'Hide')) + '</button>' +
        '</span>' +
      '</div>';
    }).join('') + chanBang();

    noiNutThem();

    [].slice.call(oBang.querySelectorAll('.vb-dong')).forEach(function (d) {
      var duong = d.getAttribute('data-d');
      d.querySelector('[data-sua]').addEventListener('click', function () { moSua(duong); });
      d.querySelector('[data-an]').addEventListener('click', function (e) {
        doiAn(duong, e.target);
      });
    });
  }

  /* ── CHÂN BẢNG: "ĐANG XEM 20 TRÊN 63" + NÚT TẢI THÊM ──
     Con số phải nói ra, không phải để đẹp: thiếu nó thì một bài cũ không thấy
     trong bảng là chuyện mơ hồ — chưa tải, hay đã xoá? Có con số thì câu trả
     lời nằm ngay đó. */
  function chanBang() {
    if (!bangDS) return '';
    var h = '';
    if (bangDS.tong > bangDS.length) {
      h += '<p class="vb-cho vb-chan">' +
             tho(L('shown', 'Loaded {n} of {t}.')
                   .replace('{n}', bangDS.length).replace('{t}', bangDS.tong)) +
             (bangDS.con
               ? ' <button type="button" class="vb-nho" data-them>' +
                   tho(L('more', 'Load more')) + '</button>'
               : '') +
           '</p>';
    }
    /* Cây kho mã bị GitHub cắt bớt — không phải chuyện phân trang, và không có
       nút nào chữa được. Nói riêng một dòng. */
    if (bangDS.cut) {
      h += '<p class="vb-cho vb-noi--hong">' +
             tho(L('capped', 'The repository is too large to list in full.')) + '</p>';
    }
    return h;
  }

  function noiNutThem() {
    var n = hop.querySelector('[data-them]');
    if (n) n.addEventListener('click', function () { taiBang(bangDS.length); });
  }

  /* ── ẨN / BỎ ẨN ──
     Hai lượt gọi: đọc bài ra để lấy `sha` và mọi khoá front matter, rồi ghi
     lại với đúng một cờ đổi. Không đi đường tắt "chỉ gửi cờ": máy chủ dựng
     lại CẢ file, nên nó phải nhận đủ mọi thứ cần giữ — thiếu một khoá là mất
     khoá ấy. */
  function doiAn(duong, nut) {
    var cu = nut.textContent;
    nut.disabled = true;
    nut.textContent = L('working', '…');
    fetch(api + '?doc=' + encodeURIComponent(duong), { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error('doc');
        var than = {
          duong: d.duong, sha: d.sha, noiDung: d.noiDung, khoaKhac: d.khoaKhac,
          title: d.fm.title, date: d.fm.date, summary: d.fm.summary,
          tags: d.fm.tags, cover: d.fm.cover, coverAlt: d.fm.coverAlt,
          draft: d.fm.draft, hidden: !d.fm.hidden
        };
        return fetch(api, {
          method: 'PUT',
          headers: K.dau({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(than)
        }).then(function (r) { return r.json(); });
      })
      .then(function (d) {
        nut.disabled = false;
        if (!d || !d.ok) { nut.textContent = cu; noi(loiChu(d), 'hong'); return; }
        /* Cập nhật ngay trong bảng đang mở, không tải lại cả danh sách: tải
           lại là hai chục lượt gọi ra GitHub cho một cú bấm — và nó còn vứt
           mất mọi trang đã bấm "tải thêm" để có. */
        for (var i = 0; i < bangDS.length; i++) {
          if (bangDS[i].duong === duong) { bangDS[i].trang = d.trang; bangDS[i].sha = d.sha; }
        }
        veHang();
        noi(L('saved', 'Saved. Cloudflare is rebuilding.'));
      })
      .catch(function () {
        nut.disabled = false; nut.textContent = cu;
        noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
      });
  }

  /* ── MỞ MỘT BÀI RA SỬA ──
     Dùng lại ĐÚNG khung viết bài, chỉ khác ba chỗ: ô đã điền sẵn, nút Đăng
     thành nút Lưu, và có thêm nút Quay lại. Dựng một khung sửa riêng thì hai
     khung phải giữ cho giống nhau mãi mãi — mà chúng vốn là một việc. */
  function moSua(duong) {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>';
    fetch(api + '?doc=' + encodeURIComponent(duong), { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (!kq.d || !kq.d.ok) {
          hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
          return;
        }
        dangSua = kq.d;
        khungViet(kq.d);
      })
      .catch(function () {
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Network hiccup. Try again in a moment.')) + '</p>';
      });
  }

  function khungViet(cu) {
    var chon = (dsMuc || []).map(function (m) {
      return '<option value="' + tho(m) + '">' + tho(m) + '</option>';
    }).join('');

    hop.innerHTML =
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('title', 'Title')) + '</span>' +
          '<input type="text" name="title" autocomplete="off" maxlength="200"></label>' +
      '</div>' +
      /* ── BA Ô PHỤ TRÊN MỘT HÀNG ──
         Trước đây chuyên mục + ngày một hàng, tag một hàng nữa. Cộng với tiêu
         đề và tóm tắt là bốn hàng nhãn trước khi tới chỗ gõ bài — trên laptop
         thì khung soạn thảo bắt đầu ở dưới mép màn hình, và việc đầu tiên mỗi
         lần viết bài là cuộn xuống.
         `.vb-o` khai `flex:1 1 180px`, nên ba ô này tự xếp một hàng ở khổ rộng
         và tự xuống hàng ở khổ hẹp — không cần thêm câu @media nào. */
      '<div class="vb-hang">' +
        '<label class="vb-o"><span>' + tho(L('muc', 'Category')) + '</span>' +
          '<select name="muc">' + chon + '</select></label>' +
        '<label class="vb-o"><span>' + tho(L('date', 'Date')) + '</span>' +
          '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
        '<label class="vb-o"><span>' + tho(L('tags', 'Tags — separated by commas')) + '</span>' +
          '<input type="text" name="tags" autocomplete="off"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' + tho(L('summary', 'Summary')) + '</span>' +
          '<textarea name="summary" rows="1" maxlength="400"></textarea></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<div class="vb-o vb-o--rong"><span>' + tho(L('body', 'Post')) + '</span>' +
          '<div data-soan></div></div>' +
      '</div>' +
      /* ── ĐƯỜNG DẪN SỬA ĐƯỢC NGAY TRÊN DÒNG XEM TRƯỚC ──
         Bản trước dòng này chỉ để ĐỌC: nó hiện ra đường dẫn mà máy rút từ tiêu
         đề, và không có cách nào đổi. Với SEO thì đó là một hạn chế thật —
         tiêu đề hay cho người đọc ("Vô thức tập thể, và cái cớ để tin vào giấc
         mơ") ra một đường dẫn dài 46 ký tự, trong khi đường dẫn tốt thì ngắn,
         chỉ giữ mấy từ khoá.

         Nay phần GIỮA của đường dẫn là một ô gõ, còn hai đầu vẫn là chữ chết:
         người ta sửa đúng phần được phép sửa, và nhìn thấy nguyên cái đường
         dẫn thật trong lúc gõ. Không phải học "slug" là gì. */
      '<div class="vb-duong">' +
        '<span class="vb-duong-nhan">' + tho(L('willBe', 'Will live at')) + '</span>' +
        '<span class="vb-duong-o">' +
          '<code data-duong-dau>/posts/</code>' +
          '<input type="text" name="slug" autocomplete="off" spellcheck="false" ' +
                 'maxlength="80" aria-label="' + tho(L('slug', 'Link')) + '">' +
          '<code>/</code>' +
        '</span>' +
        '<button type="button" class="vb-nho" data-slug-lai hidden>' +
          tho(L('slugAuto', 'From title')) + '</button>' +
      '</div>' +
      '<p class="vb-duong-bao" data-duong-bao></p>' +
      '<div class="vb-nut">' +
        '<label class="vb-nhap"><input type="checkbox" name="draft"> ' +
          tho(L('draft', 'Keep as draft — built but not public')) + '</label>' +
        (cu ? '<button type="button" class="vb-nho" data-ve>' +
                tho(L('back', 'Back')) + '</button>' : '') +
        '<button type="button" class="btn" data-dang>' +
          tho(cu ? L('save', 'Save') : L('publish', 'Post')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    /* ── SỬA THÌ ĐIỀN SẴN — VÀ CHUYÊN MỤC NAY ĐỔI ĐƯỢC ──
       Đường dẫn bài tính từ CHỖ ĐẶT FILE, nên đổi chuyên mục là dời file. Đời
       trước khoá hẳn ô này lại vì thế: dời file là ghi mới rồi xoá cũ, và nếu
       lượt thứ hai hỏng thì bài biến mất.

       Nay máy chủ làm đúng thứ tự an toàn — ghi bản mới TRƯỚC, xoá bản cũ SAU
       — nên hỏng ở bước nào cũng còn ít nhất một bản (xem onRequestPut trong
       functions/api/bai.js). Cái giá còn lại là LINK CŨ GÃY, và đó là thứ phải
       nói ra chứ không phải thứ để chặn: `xemDuong()` in thẳng đường dẫn cũ ra
       ngay lúc người ta vừa đổi, trước khi bấm Lưu. */
    if (cu) {
      hop.querySelector('[name=title]').value = cu.fm.title || '';
      hop.querySelector('[name=date]').value = cu.fm.date || '';
      hop.querySelector('[name=tags]').value = (cu.fm.tags || []).join(', ');
      hop.querySelector('[name=summary]').value = cu.fm.summary || '';
      hop.querySelector('[name=draft]').checked = cu.fm.draft === true;
      var oMuc = hop.querySelector('[name=muc]');
      var mucCu = cu.duong.split('/').slice(2, -1).join('/');
      if (oMuc) {
        if (mucCu && !oMuc.querySelector('option[value="' + mucCu + '"]')) {
          oMuc.insertAdjacentHTML('beforeend',
            '<option value="' + tho(mucCu) + '">' + tho(mucCu) + '</option>');
        }
        oMuc.value = mucCu;
      }
      /* Đường dẫn hiện tại, rút ra từ tên file: bỏ phần ngày ở đầu. Điền sẵn
         để người ta thấy nó đang là gì — và để không sửa gì thì nó giữ nguyên. */
      var oSlugCu = hop.querySelector('[name=slug]');
      if (oSlugCu) {
        oSlugCu.value = cu.duong.split('/').pop()
          .replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      }
      var bVe = hop.querySelector('[data-ve]');
      if (bVe) bVe.addEventListener('click', function () { dangSua = null; veBang(); });
    }

    /* Cắm khung soạn thảo SAU khi innerHTML đã xong: đặt trước thì lượt gán
       innerHTML kế tiếp quét sạch nó đi cùng mọi trình nghe sự kiện của nó. */
    var oSoan = hop.querySelector('[data-soan]');
    if (oSoan && window.ZIB && window.ZIB.soan) {
      soan = window.ZIB.soan.gan(oSoan, { nhan: N });
      /* Bản nháp lần trước: đóng nhầm tab, mất mạng, bấm nhầm nút — bài gõ dở
         phải còn đó. Chỉ hỏi khi ô đang trống, để "Viết bài nữa" không lôi
         bài vừa đăng quay lại. */
      if (cu && window.ZIB.soan.tuMD) {
        /* Đổ bài cũ vào khung. Bản nháp trên máy KHÔNG hỏi ở đây: nháp ấy là
           của một bài đang viết dở, còn đây là một bài đã có thật — trộn hai
           thứ vào nhau thì mất một trong hai. */
        soan.datHTML(window.ZIB.soan.tuMD(cu.noiDung));
      } else {
        var nhap = soan.nhapCu();
        if (nhap && soan.rong()) {
          if (window.confirm(L('draftAsk', 'There is an unfinished post saved on this device. Open it?'))) {
            soan.datHTML(nhap);
          } else {
            soan.boNhap();
          }
        }
      }
    } else if (oSoan) {
      /* soan.js không tải được thì vẫn phải viết được bài — rơi về ô Markdown
         trần, đúng cái ô đã dùng trước bản này. */
      oSoan.innerHTML = '<textarea name="noiDung" rows="14"></textarea>';
    }

    var oSlug = hop.querySelector('[name=slug]');
    var nutLai = hop.querySelector('[data-slug-lai]');

    /* ── Ô ĐƯỜNG DẪN TỰ ĐIỀN, CHO TỚI LÚC NGƯỜI TA TỰ GÕ ──
       Mặc định nó bám theo tiêu đề, nên ai không quan tâm thì không phải làm
       gì. Gõ vào nó một cái là nó THÔI bám — và từ đó đổi tiêu đề không còn
       giật mất thứ vừa gõ. Nút "From title" là đường quay lại.

       Bài ĐANG SỬA thì mặc định là KHÔNG bám: đường dẫn ấy đã công khai, có
       thể đã được chia sẻ và Google đã đánh chỉ mục, nên nó chỉ được đổi khi
       chủ trang cố ý đổi — không phải vì vừa sửa một chữ trong tiêu đề. */
    var slugTuDo = !!cu;
    if (nutLai) nutLai.hidden = !slugTuDo;

    function theoTieuDe() {
      if (slugTuDo || !oSlug) return;
      oSlug.value = slugify((hop.querySelector('[name=title]') || {}).value || '');
      xemDuong();
    }

    hop.querySelector('[name=title]').addEventListener('input', theoTieuDe);
    hop.querySelector('[name=muc]').addEventListener('change', xemDuong);
    hop.querySelector('[name=date]').addEventListener('change', xemDuong);
    if (oSlug) {
      oSlug.addEventListener('input', function () {
        slugTuDo = true;
        if (nutLai) nutLai.hidden = false;
        xemDuong();
      });
      /* Dọn lúc rời ô, không dọn từng phím: gõ "tam " rồi định gõ tiếp "ly" mà
         dấu cách bị đổi thành "-" ngay lập tức thì con trỏ nhảy và người ta gõ
         tiếp vào chỗ khác. */
      oSlug.addEventListener('blur', function () {
        oSlug.value = slugify(oSlug.value);
        xemDuong();
      });
    }
    if (nutLai) {
      nutLai.addEventListener('click', function () {
        slugTuDo = false; nutLai.hidden = true; theoTieuDe();
      });
    }
    hop.querySelector('[data-dang]').addEventListener('click', gui);
    if (!cu) theoTieuDe();
    xemDuong();
  }

  /* ── XEM TRƯỚC ĐƯỜNG DẪN, VÀ NÓI RA CHỖ ĐÁNG NGẠI ──
     Ba thứ kiểm ngay lúc gõ, vì cả ba đều chỉ lộ ra sau khi đăng:
       · rỗng      → máy chủ sẽ tự rút từ tiêu đề, và kết quả có thể rất dài;
       · quá dài   → Google cắt đường dẫn trong kết quả tìm kiếm ở khoảng 60–70
                     ký tự; dài hơn thì phần đuôi thành dấu ba chấm;
       · ĐÃ ĐỔI ở một bài đang sửa → link cũ GÃY. Đây là chỗ đáng sợ nhất và
         cũng là chỗ dễ làm mà không nhận ra, nên nó được nói to nhất. */
  function xemDuong() {
    var dau = hop.querySelector('[data-duong-dau]');
    var bao = hop.querySelector('[data-duong-bao]');
    var oSlug = hop.querySelector('[name=slug]');
    if (!dau || !oSlug) return;

    var m = (hop.querySelector('[name=muc]') || {}).value || '';
    dau.textContent = '/posts/' + (m ? m + '/' : '');

    var s = slugify(oSlug.value || (hop.querySelector('[name=title]') || {}).value || '');
    if (!bao) return;

    var duongMoi = '/posts/' + (m ? m + '/' : '') + s + '/';
    var nhac = [];
    if (dangSua) {
      var cuMuc  = dangSua.duong.split('/').slice(2, -1).join('/');
      var cuTen  = dangSua.duong.split('/').pop().replace(/\.md$/, '');
      var cuSlug = cuTen.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      var duongCu = '/posts/' + (cuMuc ? cuMuc + '/' : '') + cuSlug + '/';
      if (duongCu !== duongMoi) nhac.push(L('slugMoved', 'The old link {u} will stop working.').replace('{u}', duongCu));
    }
    if (s.length > 60) nhac.push(L('slugLong', 'Long links get cut off in search results — under 60 characters reads better.'));

    bao.textContent = nhac.join(' ');
    bao.className = 'vb-duong-bao' + (nhac.length ? ' vb-duong-bao--nhac' : '');
  }

  function gui() {
    var nut = hop.querySelector('[data-dang]');
    var oTho = hop.querySelector('[name=noiDung]');
    var b = {
      title  : hop.querySelector('[name=title]').value,
      muc    : hop.querySelector('[name=muc]').value,
      slug   : (hop.querySelector('[name=slug]') || {}).value || '',
      date   : hop.querySelector('[name=date]').value,
      tags   : hop.querySelector('[name=tags]').value,
      summary: hop.querySelector('[name=summary]').value,
      noiDung: soan ? soan.layMD() : (oTho ? oTho.value : ''),
      draft  : hop.querySelector('[name=draft]').checked
    };
    if (!b.title.trim() || !b.noiDung.trim()) {
      noi(L('needBoth', 'Both a title and some text are needed.'), 'hong');
      return;
    }

    nut.disabled = true;
    noi(L('sending', 'Sending…'));

    /* Sửa bài là PUT và mang theo `sha` + mọi khoá front matter đọc ra lúc
       mở — máy chủ dựng lại CẢ file, nên thiếu một khoá là mất khoá ấy. */
    if (dangSua) {
      b.duong = dangSua.duong;
      b.sha = dangSua.sha;
      b.khoaKhac = dangSua.khoaKhac;
      b.cover = dangSua.fm.cover;
      b.coverAlt = dangSua.fm.coverAlt;
      b.hidden = dangSua.fm.hidden === true;
    }

    fetch(api, {
      method: dangSua ? 'PUT' : 'POST',
      headers: K.dau({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(b)
    }).then(function (r) {
      return r.json().then(function (d) { return { ma: r.status, d: d }; });
    }).then(function (kq) {
      nut.disabled = false;
      if (kq.d && kq.d.ok) {
        if (dangSua) {
          /* Lưu xong thì `sha` đổi — giữ bản mới để lưu tiếp lần nữa không bị
             từ chối vì cầm mã băm cũ. Và nếu vừa DỜI bài thì `duong` cũng đổi:
             không cập nhật thì lượt lưu kế tiếp gửi đường dẫn cũ, máy chủ
             không tìm thấy file ở đó, và nó dời bài thêm một lần nữa. */
          dangSua.sha = kq.d.sha || dangSua.sha;
          if (kq.d.duong) dangSua.duong = kq.d.duong;
          bangDS = null;
          /* Máy chủ dặn gì thì nói đúng câu ấy: ca "đã ghi bản mới nhưng không
             xoá được bản cũ" cần một việc phải làm tay, và câu mặc định
             "đã lưu" thì giấu mất chuyện đó. */
          noi(kq.d.soTay ? kq.d.nhac : L('saved', 'Saved. Cloudflare is rebuilding.'),
              kq.d.soTay ? 'hong' : '');
          xemDuong();
          return;
        }
        xong(kq.d, b);
        return;
      }
      noi(loiChu(kq.d), 'hong');
    }).catch(function () {
      nut.disabled = false;
      noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
    });
  }

  /* Báo lỗi phải nói được PHẢI LÀM GÌ, không chỉ nói là hỏng. Bài vừa gõ vẫn
     còn nguyên trong ô — đó là điều quan trọng nhất lúc này. */
  function loiChu(d) {
    if (!d) return L('failed', 'Could not publish.');
    if (d.loi === 'khoa') return L('badKey', 'Wrong owner ID or key.');
    if (d.loi === 'cauhinh') {
      /* Máy chủ biết rõ thiếu gì và phải bấm vào đâu — câu của nó luôn đúng
         hơn câu ghép sẵn ở đây. Chỉ ghép khi nó không gửi câu nào. */
      return d.chiTiet
          || L('noConfig', 'The server is missing') + ' ' + (d.thieu || []).join(', ')
           + ' — ' + L('seeDoc', 'xem docs/CAI-DAT.md');
    }
    if (d.loi === 'kiem') return (d.chiTiet || []).join(' · ');
    if (d.loi === 'lechban') return L('clash',
      'This post changed somewhere else. Go back and reopen it to get the latest version.');
    if (d.loi === 'duong' || d.loi === 'sha') return L('failed', 'Could not save.');
    if (d.loi === 'trung') return d.chiTiet || L('dup', 'A post with that name already exists.');
    if (d.loi === 'muc') return d.chiTiet || L('badMuc', 'No such category.');
    return d.chiTiet || L('failed', 'Could not publish.');
  }

  /* ── SAU KHI GỬI: NÓI RÕ NÓ ĐANG Ở ĐÂU ──
     Đây là chỗ dễ làm người ta hoang mang nhất. Bài đã nằm trong kho mã nhưng
     trang thì chưa đổi, và nếu chỉ hiện "Xong!" thì phản xạ đầu tiên là bấm
     Đăng lần nữa — rồi nhận báo trùng tên và tưởng là hỏng thật.

     Nên hiện đủ ba thứ: bài sẽ nằm ở đâu, commit vừa tạo (soi được bộ dựng
     chạy tới đâu), và câu nhắc là phải đợi. */
  function xong(d, b) {
    /* Bài đã nằm trong kho mã — bản nháp trên máy hết việc. Giữ lại thì lần
       mở sau nó hỏi "mở lại bài gõ dở?" với đúng bài vừa đăng xong. */
    if (soan) soan.boNhap();
    soan = null;
    hop.innerHTML =
      '<div class="vb-xong">' +
        '<p class="vb-xong-de">' + tho(L('done', 'Pushed to the repository')) + '</p>' +
        '<p class="vb-xong-chu">' + tho(b.title) + '</p>' +
        '<ul class="vb-xong-ds">' +
          '<li>' + tho(L('willBe', 'Will live at')) + ' <code>' + tho(d.duongBai) + '</code></li>' +
          (d.commit ? '<li><a href="' + tho(d.commit) + '" target="_blank" rel="noopener">' +
            tho(L('seeCommit', 'See the commit on GitHub')) + '</a></li>' : '') +
        '</ul>' +
        '<p class="vb-noi">' + tho(d.nhac || L('building',
          'Cloudflare is rebuilding. The post goes live in about a minute.')) + '</p>' +
        '<div class="vb-nut">' +
          '<button type="button" class="vb-nho" data-ve>' + tho(L('back', 'Back')) + '</button>' +
          '<button type="button" class="btn" data-nua>' +
            tho(L('another', 'Write another')) + '</button>' +
        '</div>' +
      '</div>';
    hop.querySelector('[data-nua]').addEventListener('click', function () { khungViet(); });
    /* Bảng phải tải lại: bài vừa đăng chưa có trong danh sách đang giữ. */
    hop.querySelector('[data-ve]').addEventListener('click', function () {
      bangDS = null; veBang();
    });
  }

  /* ── LẤY DANH SÁCH CHUYÊN MỤC, VÀ THỬ KHOÁ LUÔN THỂ ──
     Gọi một lượt GET trước khi bày ô ra: vừa đổ được ô chọn chuyên mục, vừa
     biết ngay khoá có đúng không. Biết khoá sai TRƯỚC khi gõ cả bài thì hơn
     hẳn biết sau. */
  function nap() {
    if (!coKhoa()) { khungCho(); return; }
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>';
    fetch(api, { headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (kq.d && kq.d.ok) { dsMuc = kq.d.muc || []; dangSua = null; veBang(); return; }
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
      })
      /* ── HAI LOẠI HỎNG, MỘT CÂU BÁO — VÀ ĐÓ TỪNG LÀ MỘT BUỔI ĐI SAI ĐƯỜNG ──
         `khungViet()` chạy bên TRONG chuỗi promise, nên một lỗi lập trình ở
         đó (một hàm gọi sai, một thuộc tính không có) rơi thẳng vào chỗ bắt
         lỗi này và hiện ra thành "Mạng trục trặc". Người ta đi kiểm wifi,
         kiểm Cloudflare, kiểm token — trong khi mạng vẫn tốt và lỗi nằm
         trong đúng mấy dòng vừa sửa.
         Nay lỗi thật vẫn được ném ra bảng điều khiển, và câu trên màn hình
         nói đúng loại hỏng. */
      .catch(function (e) {
        var laMang = (e instanceof TypeError) && /fetch|network|Load failed/i.test(String(e.message));
        if (!laMang && window.console) console.error('[viet-bai]', e);
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(laMang ? L('netErr', 'Network hiccup. Try again in a moment.')
                     : L('crash', 'The editor failed to load — open the browser console to see the error.')) +
          '</p>';
      });
  }

  nap();

  /* Ô viết ghi chú ở trên lưu khoá xong thì ô này phải tự hiện ra — bắt người
     ta tải lại trang sau khi vừa gõ khoá là một bước thừa mà ai cũng vấp. */
  /* Một sự kiện duy nhất, do khoa.js phát — kể cả khi khoá đổi ở tab khác.
     Bản trước nghe `storage` và một sự kiện tự chế `zib:co-khoa`; hai đường
     ấy không bao giờ cùng nổ, nên có lúc ô này vẽ lại có lúc không. */
  if (K) K.theoDoi(nap);
})();
