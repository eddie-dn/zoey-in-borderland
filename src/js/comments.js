/* ============================================================
   BÌNH LUẬN — phía trình duyệt. Có trả lời lồng bên trong.

   Gửi lên và lấy về từ /api/binh-luan — một hàm Cloudflare Pages chạy trên
   D1, cùng tên miền với trang. Đường dẫn khai ở site.config.json → binhLuan.api.

   Bốn điều quan trọng trong file này:

   1. CHÈN BẰNG textContent, KHÔNG BAO GIỜ innerHTML.
      Nội dung ở đây do người lạ trên mạng gõ vào. Dùng innerHTML thì một dòng
      <script> trong ô bình luận chạy được trên trang của mình. textContent
      biến mọi thứ thành chữ thuần.

   2. GỌI THẲNG /api/binh-luan, CÙNG TÊN MIỀN.
      Bản trước gọi sang Google Apps Script và phải gửi kiểu text/plain: đặt
      Content-Type: application/json là trình duyệt bắn một request OPTIONS hỏi
      trước, mà Apps Script không trả lời OPTIONS. Nay hàm nằm cùng tên miền
      nên không có chuyện hỏi trước, và JSON là JSON.

   3. BÀN DUYỆT KHÔNG Ở ĐÂY. Nó ở src/js/duyet.js và mọc được trên MỌI trang,
      không riêng trang bài — duyệt là việc của chủ trang, chẳng dính tới một
      bài nào. File này chỉ giữ hai cái nút nhỏ trên từng bình luận đã hiện,
      cho lúc đang đọc mà muốn gỡ ngay.

   4. KHÔNG CHẶN VIỆC ĐỌC BÀI.
      Bình luận tải sau, tải hỏng cũng không sao — bài vẫn nguyên vẹn. Nên mọi
      lỗi ở đây đều nuốt vào một câu báo nhỏ, không ném ra ngoài.

   5. MỘT CÁI FORM DUY NHẤT, ĐEM ĐI CHỖ KHÁC.
      Trả lời không dựng thêm form mới mà DI CHUYỂN chính cái form đang có
      xuống dưới bình luận được trả lời, kèm một dòng "Đang trả lời …".
      Dựng mỗi bình luận một form thì mười bình luận là mười cái form, mười bộ
      ô nhập trùng tên, và người dùng bàn phím phải Tab qua tất cả. Một cái đem
      đi đem lại thì chỉ có một chỗ để kiểm, một chỗ để sửa.
   ============================================================ */
(function () {
  'use strict';

  var khoi = document.querySelector('[data-binh-luan]');
  if (!khoi) return;

  var API   = khoi.dataset.binhLuan || '';
  var TRANG = khoi.dataset.trang || location.pathname;
  var dsEl  = khoi.querySelector('.bl-ds');
  var form  = khoi.querySelector('.bl-form');
  var bao   = khoi.querySelector('.bl-bao');
  var than  = khoi.querySelector('.bl-than');

  /* ── HÀNG NÚT NAY Ở CỘT BÊN, KHÔNG CÒN TRONG KHỐI NÀY ──
     Tim, chia sẻ và bình luận gom thành một cụm ở cột phải (xem cumTuongTac
     trong tools/build.mjs), còn khối `[data-binh-luan]` chỉ giữ danh sách lời
     nhắn và ô viết. Nên mấy nút ấy phải tìm từ `document`.

     Vẫn thử trong khối trước: một trang chỉ có một bài, nhưng nếu mai này có
     khung nào giữ lại hàng nút tại chỗ thì bản trong khối phải thắng — nút
     gần với khối nó điều khiển là nút đúng. */
  function tim1(sel) { return khoi.querySelector(sel) || document.querySelector(sel); }
  /* ── SỐ BÌNH LUẬN IN TRÊN CHÍNH CÁI NÚT ──
     Nó từng đứng riêng ở hàng meta, cạnh lượt xem. Tách ra như thế thì một
     bài có hai biểu tượng bong bóng cạnh nhau: một cái mang số mà bấm không
     được, một cái bấm được mà không mang số.

     Nay `[data-bl-so]` LÀ chính cái span mang con số, nằm trong nút. */
  var demEl = document.querySelector('[data-bl-so]');
  /* Con số thứ hai: in cạnh TÊN khối bình luận cuối bài. Cùng một số, hai chỗ
     đọc — một ở nút (bấm được), một ở đầu khối (đang mở, đang đọc). Cùng một
     phép cập nhật lo cả hai, nên không có đường nào để chúng lệch nhau. */
  var deEl = document.querySelector('[data-bl-dem]');
  var nutMo = tim1('.bl-mo');
  var moLuc = Date.now();

  /* Chữ trên giao diện lấy từ bảng NHAN trong tools/build.mjs, gửi sang đây
     qua data-nhan. KHÔNG gõ thẳng chuỗi vào file này: một nửa khung bình luận
     dựng bằng HTML lúc build, nửa kia dựng bằng JS lúc chạy — để chữ ở hai nơi
     thì sửa một nhãn phải nhớ mở hai file, và sớm muộn quên một chỗ. */
  var N = {};
  try { N = JSON.parse(khoi.dataset.nhan || '{}'); } catch (e) {}
  function L(k, n) { return String(N[k] || '').replace('{n}', n); }

  /* Chỗ ĐỨNG GỐC của form — nhớ lại để còn trả nó về sau khi thôi trả lời. */
  var nhaCuaForm = form.parentNode;
  var traLoiCho = '';

  /* ── KHOÁ CHỦ TRANG ──
     Dùng CHUNG với ô viết ghi chú (src/js/ghi-chu.js): cùng hai biến trong
     localStorage, cùng hai biến bí mật ở phía máy chủ. Nhập khoá ở một chỗ là
     mở được cả hai quyền — một cặp khoá để nhớ, không phải hai.

     Có khoá thì bình luận của chủ trang vào thẳng, có huy hiệu, khỏi chờ duyệt;
     và ngăn Comment của /z-admin/ là bàn duyệt. Không có khoá thì mọi thứ ở đây chạy đúng
     như với một người ghé ngang. */
  /* Khoá do src/js/khoa.js giữ. Tra window.ZIB MỖI LẦN GỌI chứ không giữ lại
     một tham chiếu lúc nạp: file này còn chạy ở trang không có khoa.js, và
     thứ tự thẻ <script> thì cách đây ba lớp hàm — bắt nó phải đúng mới chạy
     được là một ràng buộc không nhìn thấy từ trong file này. */
  function kho() { return (window.ZIB || {}).khoa; }
  function coKhoa() { var k = kho(); return !!(k && k.co()); }
  function dauKhoa(them) {
    var h = them || {};
    return coKhoa() ? kho().dau(h) : h;
  }

  /* ══════════ CHỦ TRANG ĐÃ ĐĂNG NHẬP THÌ KHÔNG PHẢI TỰ KHAI MÌNH LÀ AI ══════════

     Máy chủ đã nhận ra chủ trang từ lâu — nó đọc cặp khoá trong header rồi
     đóng dấu `chuTrang` và cho bình luận vào thẳng không qua duyệt. Nhưng cái
     form thì vẫn hỏi tên và email như hỏi một người lạ, nên chủ nhà phải tự
     gõ tên mình mỗi lần trả lời một bình luận trên chính blog của mình — và
     gõ sai một chữ thì huy hiệu AUTHOR đứng cạnh một cái tên khác.

     Nay: có khoá thì hai ô ấy ẩn đi, và tên gửi lên lấy thẳng từ `author`
     trong site.config.json — cùng cái tên bộ dựng in ra khắp trang.

     Gọi lại mỗi lần khoá đổi (`theoDoi`), vì đăng nhập ở tab này thì tab kia
     cũng phải đổi theo mà không cần tải lại trang. */
  var TEN_CHU = khoi.dataset.chuTen || '';

  /* ── AI ĐANG GÕ: MỘT DÒNG, KHÔNG PHẢI HAI Ô ──
     Hai ô Tên và Email chiếm gần một nửa chiều cao khung soạn, và chúng hỏi
     đúng một câu mà máy đã biết câu trả lời — tên lần trước đã lưu ở
     `localStorage` (xem `dienLaiTen`).

     Nên khi đã biết tên thì gấp hai ô ấy lại thành MỘT DÒNG: "Posting as
     Mai · change". Bấm `change` là mở lại hai ô. Ai chưa từng bình luận thì
     vẫn thấy hai ô như cũ — không giấu thứ họ bắt buộc phải điền.

     Chủ trang đăng nhập rồi thì hai ô KHÔNG mở lại được: tên lấy thẳng từ
     site.config.json, gõ tên khác vào cũng không đổi được gì. */
  var moHang = false;

  function veVaiTro() {
    var hang = form && form.querySelector('.bl-hang');
    if (!hang) return;
    var laChu = coKhoa() && TEN_CHU;
    var tenNho = '';
    if (!laChu) {
      try { tenNho = (JSON.parse(localStorage.getItem(KHOA_TEN) || 'null') || {}).ten || ''; }
      catch (e) { tenNho = ''; }
    }
    var gap = laChu || (!!tenNho && !moHang);
    hang.hidden = gap;

    var dau = khoi.querySelector('.bl-vaitro');
    if (!gap) { if (dau) dau.hidden = true; return; }

    if (!dau) {
      /* `<span>` chứ không `<p>`: nó vào nằm trong một `<label>`, mà nhãn chỉ
         nhận nội dung dạng câu chữ — một `<p>` ở đó là HTML sai, và trình
         duyệt sẽ tự đóng thẻ nhãn lại trước nó. */
      dau = document.createElement('span');
      dau.className = 'bao bl-vaitro';
      var oNhan = khoi.querySelector('.bl-nhan');
      if (oNhan) oNhan.appendChild(dau);
      else hang.parentNode.insertBefore(dau, hang);
    }
    dau.textContent = L('laChu', 'Posting as {ten}')
                        .replace('{ten}', laChu ? TEN_CHU : tenNho);
    dau.hidden = false;

    /* Nút "đổi" chỉ có khi người đọc THẬT SỰ đổi được — tức không phải chủ
       trang. Bày một cái nút không làm gì là tệ hơn không bày. */
    var doi = dau.querySelector('.bl-doi-ten');
    if (laChu) { if (doi) doi.remove(); return; }
    if (!doi) {
      doi = document.createElement('button');
      doi.type = 'button';
      doi.className = 'bl-doi-ten';
      doi.textContent = L('changeName', 'change');
      doi.addEventListener('click', function (e) {
        /* Nút này nằm TRONG một `<label>`. Không chặn thì cú bấm chạy tiếp lên
           nhãn, nhãn đưa con trỏ vào ô gõ nội dung — đúng cái ô người ta vừa
           bảo "khoan đã, tôi muốn đổi tên trước". */
        e.preventDefault(); e.stopPropagation();
        moHang = true;
        veVaiTro();
        if (form.ten) form.ten.focus();
      });
      dau.appendChild(document.createTextNode(' · '));
      dau.appendChild(doi);
    }
  }

  function noi(t, loai) {
    bao.textContent = t || '';
    bao.className = 'bao bl-bao' + (loai ? ' bao--' + loai : '');
  }

  /* ══════════ TRÁI TIM ══════════

     Một công tắc, và chỗ nhớ "máy này đã bấm chưa" nằm ở localStorage — máy
     chủ không giữ gì để nhận ra người đọc. Lý do đầy đủ ở đầu
     functions/api/thich.js: chặn chặt hơn thì phải theo dấu người đọc, mà
     một con số đếm tim không đáng cái giá ấy.

     Con số hiện lên TRƯỚC khi máy chủ trả lời — bấm xong thấy ngay, không
     chờ một vòng mạng. Máy chủ từ chối thì trả lại trạng thái cũ. */
  var tim = tim1('.bl-tim');
  if (tim) (function () {
    var api = tim.getAttribute('data-thich');
    /* Con số nằm TRONG chính cái nút tim (xem `cumTuongTac` ở build.mjs): bấm
       một phát là số nhảy ngay dưới ngón tay, không phải liếc sang chỗ khác
       để biết cú bấm có ăn hay không. */
    var soEl = document.querySelector('[data-thich-so]');
    var KHO = 'zib-thich:' + TRANG;
    var daBam = false;
    try { daBam = localStorage.getItem(KHO) === '1'; } catch (e) {}
    var so = 0, dangGui = false;

    function ve() {
      tim.setAttribute('aria-pressed', daBam ? 'true' : 'false');
      tim.classList.toggle('bl-tim--bam', daBam);
      if (soEl) {
        /* Ẩn hẳn khi chưa ai thích: một trái tim kèm số 0 đọc ra là "chưa ai
           thích bài này", mà đó là câu không cần nói ra. `.bl-so:empty` ở
           prose.css lo phần nút co lại thành hình tròn gọn. */
        soEl.hidden = so <= 0;
        soEl.textContent = so > 0 ? String(so) : '';
      }
    }

    /* Ẩn hẳn nút khi máy chủ báo chưa gắn D1: một trái tim bấm vào không đếm
       được gì thì thà đừng bày. */
    fetch(api + '?u=' + encodeURIComponent(TRANG), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.tat) { tim.remove(); return; }
        so = d.so || 0; ve();
      })
      .catch(function () { tim.remove(); });

    tim.addEventListener('click', function () {
      if (dangGui) return;
      dangGui = true;
      var truoc = daBam, truocSo = so;
      daBam = !daBam;
      so = Math.max(0, so + (daBam ? 1 : -1));
      ve();
      try { if (daBam) localStorage.setItem(KHO, '1'); else localStorage.removeItem(KHO); } catch (e) {}

      fetch(api + '?u=' + encodeURIComponent(TRANG) + (daBam ? '' : '&bo=1'),
            { method: 'POST', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          dangGui = false;
          if (d && typeof d.so === 'number') { so = d.so; ve(); }
        })
        .catch(function () {
          /* Mạng hỏng: trả lại đúng trạng thái trước cú bấm, cả trên màn hình
             lẫn trong localStorage. Để lệch thì lần sau mở bài lên con số nói
             một đằng còn trái tim tô một nẻo. */
          dangGui = false;
          daBam = truoc; so = truocSo; ve();
          try { if (daBam) localStorage.setItem(KHO, '1'); else localStorage.removeItem(KHO); } catch (e) {}
        });
    });
  })();

  /* ══════════ ĐÓNG MỞ CẢ KHỐI ══════════

     ── HAI ĐƯỜNG, VÀ BUILD ĐÃ CHỌN SẴN ──
     Nút mang `data-o`:

       'ben'  khung bình luận DỜI sang cột phải (khung A, khổ ≥1080px)
       'cho'  khung mở TẠI CHỖ, ngay dưới hàng tag — khung ảnh, khung B

     Trước đây file này tự suy ra đường đi bằng cách hỏi DOM xem lưới có mang
     `post-left` không. Suy ra được, nhưng nó là bản sao thứ hai của một luật đã
     có ở tools/build.mjs (`binhLuanODau`) — và hai bản sao thì sớm muộn lệch
     nhau. Nay build nói thẳng, ở đây chỉ việc đọc.

     ── VÌ SAO KHUNG A DỜI SANG CỘT PHẢI ──
     Mở ở cuối bài nghĩa là người đọc phải cuộn xuống tận đáy để viết, và lúc
     đang viết thì bài không còn trong tầm mắt — muốn trích một câu là phải
     cuộn lên đọc, nhớ lấy, cuộn xuống gõ. Cột phải nằm ngang tầm bài, nên vừa
     đọc vừa viết được, và đó đúng là việc người ta đang làm.

     Mục lục và "đọc tiếp" nhường chỗ trong lúc ấy: cả hai là thứ để ĐI TIẾP,
     mà người đang viết bình luận thì chưa đi đâu cả.

     ── CỘT PHẢI KHÔNG NỚI RA NỮA ──
     Bản trước cột phải rộng 280px lúc thường và bị kéo lên 400px ngay khi bấm
     nút — cả trang giật một nhịp, và bài bên trái hẹp lại đúng lúc người đọc
     đang nhìn nó. Nay cột rộng sẵn 320px ở mọi lúc (xem layout.css): đủ cho ô
     nhập tên và khung soạn ba dòng, mà mục lục ở đó cũng dễ đọc hơn. Bấm nút
     thì chỉ NỘI DUNG trong cột đổi, bề ngang không nhúc nhích.

     ── DI CHUYỂN NÚT DOM, KHÔNG PHẢI DỰNG BẢN SAO ──
     Chép ra một khung thứ hai thì có hai cái form, hai danh sách, và mọi thứ
     comments.js đang giữ tham chiếu tới đều trỏ vào bản cũ. Dời hẳn nút đi thì
     chữ đang gõ dở, ô đang chọn, cả cái chip "đang trả lời ai" đều đi theo.

     `moc` là một nút rỗng đánh dấu chỗ cũ, để lúc đóng còn biết trả về đâu. */
  if (nutMo && than) {
    var ben  = document.querySelector('.ben');
    var luoi = document.querySelector('.post-layout');
    /* Lưới hai cột chỉ bật từ 1080px. Dưới ngưỡng đó `.ben` là
       `display:contents`, nên dời khung vào đấy chẳng chuyển nó đi đâu cả. */
    var rong = window.matchMedia('(min-width:1080px)');
    var duocDoi = !!(ben && luoi && nutMo.getAttribute('data-o') === 'ben');
    var moc = null;

    /* ── BA CHỖ KHUNG BÌNH LUẬN CÓ THỂ ĐỨNG ──
         'goc'  dưới hàng tag, chỗ nó được dựng ra
         'ben'  cột phải, khổ ≥1080px có cột thật
         'tam'  MỘT TẤM NỔI LÊN TRÊN BÀI, bám mép dưới màn — chỉ ở khổ hẹp

       Chỗ thứ ba sinh ra vì: ở khổ hẹp không có cột nào để mượn, nên khung ở
       lại chân bài, và bấm nút giữa một bài ba nghìn chữ là bị ném xuống tận
       đáy trang. Muốn quay lại chỗ đang đọc thì phải tự dò ngược lên — không
       ai làm thế, họ đóng tab.

       ── VÌ SAO KHÔNG CÒN CHÈN THẲNG VÀO BÀI ──
       Bản trước nhét khung vào GIỮA hai đoạn văn, ngay dưới đoạn đang đọc.
       Nó giải quyết đúng chuyện bị ném xuống đáy, nhưng đẻ ra một chuyện khác
       khó chịu hơn: bài đang đọc bị cắt đôi bởi một cái hộp xám cao gần bằng
       màn hình, chữ trên chữ dưới rời hẳn nhau, và mở ra đóng vào là cả bài
       nhảy lên nhảy xuống vì dòng chảy văn bản đổi chiều cao hai lần.

       Một TẤM NỔI thì bài phía sau không suy suyển một pixel nào. Nó trượt
       lên từ mép dưới, có màn mờ phía sau, bấm ra ngoài hoặc Esc là đóng —
       đúng cách mọi ứng dụng điện thoại mở một ô gõ.

       Vẫn là DỜI chứ không chép, nên chữ đang gõ dở và chip "đang trả lời ai"
       đều đi theo. Dời hẳn ra `<body>`: `position:fixed` bên trong một tổ
       tiên có `transform` thì neo theo tổ tiên ấy chứ không theo màn hình —
       một cái bẫy chỉ lộ ra khi ai đó thêm hiệu ứng vào khung bài.

       Một `moc` duy nhất cho cả ba chỗ: mỗi lúc khung chỉ ở một nơi, nên hai
       cái mốc là sớm muộn có một cái trỏ vào chỗ không còn tồn tại. */
    var man = null;

    function boTam() {
      than.classList.remove('bl-than--tam');
      if (man) { man.remove(); man = null; }
      document.documentElement.classList.remove('bl-khoa');
    }

    function datCho(cho) {
      if (cho === 'ben' && !luoi) return;
      /* Về gốc trước đã — đi thẳng từ 'ben' sang 'tam' thì `moc` cũ mất. */
      if (moc) {
        moc.parentNode.insertBefore(than, moc);
        moc.remove(); moc = null;
        if (ben) ben.classList.remove('ben--bl');
        if (luoi) luoi.classList.remove('post-left--bl');
        boTam();
      }
      if (cho === 'goc') return;

      if (cho === 'ben') {
        if (!duocDoi) return;
        moc = document.createComment('bl-than');
        than.parentNode.insertBefore(moc, than);
        ben.appendChild(than);
        ben.classList.add('ben--bl');
        luoi.classList.add('post-left--bl');
        return;
      }

      moc = document.createComment('bl-than');
      than.parentNode.insertBefore(moc, than);
      /* Màn mờ vào TRƯỚC tấm: hai anh em cùng một cha, nên thứ tự trong cây
         quyết định cái nào nằm trên — khỏi phải đếm z-index. */
      man = document.createElement('div');
      man.className = 'bl-man';
      man.addEventListener('click', function () { nutMo.click(); });
      document.body.appendChild(man);
      document.body.appendChild(than);
      than.classList.add('bl-than--tam');
      /* Khoá cuộn của trang phía sau. Không khoá thì vuốt trong tấm tới đầu
         hoặc cuối là cú vuốt ấy truyền ra bài đằng sau, và bài trôi đi trong
         lúc đang gõ. `overscroll-behavior` trong CSS lo phần trong tấm. */
      document.documentElement.classList.add('bl-khoa');
    }

    /* Nút "Back" trong khung bấm hộ chính nút đã mở khung: một đường đóng duy
       nhất, nên trạng thái `aria-expanded`, việc dời chỗ và cú cuộn đều đi qua
       cùng một chỗ. Dựng riêng một đường đóng thứ hai là sớm muộn có một đường
       quên cập nhật một thứ. */
    var nutDong = than.querySelector('.bl-lui');
    if (nutDong) nutDong.addEventListener('click', function () { nutMo.click(); });

    /* ── LỐI VÀO THỨ HAI: BẤM THẲNG VÀO KHU BÌNH LUẬN ──
       Dòng tiêu đề cuối bài là một nút, và nó bấm hộ `nutMo` chứ không tự mở
       lấy. Một đường mở duy nhất thì `aria-expanded`, việc dời chỗ và cú cuộn
       chỉ có một chỗ để đúng — dựng đường thứ hai là sớm muộn một đường quên
       cập nhật một thứ. */
    var nutKhu = khoi.querySelector('.bl-mo-khu');
    if (nutKhu) nutKhu.addEventListener('click', function () { nutMo.click(); });

    nutMo.addEventListener('click', function () {
      var dangMo = nutMo.getAttribute('aria-expanded') === 'true';
      nutMo.setAttribute('aria-expanded', dangMo ? 'false' : 'true');
      if (nutKhu) nutKhu.setAttribute('aria-expanded', dangMo ? 'false' : 'true');
      /* .hidden chứ không phải style.display: thuộc tính này vừa giấu khỏi mắt
         vừa giấu khỏi trình đọc màn hình, và bấm Tab không lọt vào được. */
      than.hidden = dangMo;
      if (dangMo) datCho('goc');
      else datCho(rong.matches ? 'ben' : 'tam');
      /* ── ĐƯA MẮT TỚI CHỖ VỪA MỞ ──
         Nút nằm ở đầu bài, còn khung — trừ lúc vừa dời sang cột bên — mở ra ở
         DƯỚI hàng tag, cách chỗ vừa bấm cả nghìn pixel. Bấm xong mà màn hình
         không đổi gì thì đọc ra là nút hỏng, không đọc ra là "nó mở ở dưới
         kia". Đây chính là cú nhảy tới khung viết ở khung ảnh.

         `start` chứ không `nearest`: `nearest` cuộn ĐÚNG VỪA ĐỦ để khung lọt
         vào màn, nên ở một bài ngắn nó gần như không nhúc nhích. `start` đưa
         hẳn đầu khung lên đầu vùng nhìn — người đọc thấy rõ mình vừa được
         chuyển tới đâu. */
      /* ── LUÔN ĐƯA MẮT TỚI CHỖ VỪA MỞ, KỂ CẢ KHI NÓ SANG CỘT BÊN ──
         Bản trước bỏ qua cú cuộn ở khổ rộng, vì "khung nằm ngay cạnh, khỏi
         cuộn". Đúng khi người đọc còn ở đầu bài; sai hẳn khi họ đang ở giữa
         bài — lúc ấy cột bên có thể đã trôi qua, và bấm xong thì không có gì
         đổi trên màn.

         `nearest` cho cột bên: nó đã dính sẵn trong tầm mắt, nên cú cuộn chỉ
         nhích vừa đủ thay vì kéo cả trang lên đầu. `start` cho khung mở tại
         chỗ dưới hàng tag: ở đó nó thật sự ở xa, và phải đưa hẳn lên. */
      if (!dangMo) {
        /* Tấm nổi thì KHÔNG cuộn gì hết: nó đã nằm sẵn ở mép dưới màn hình,
           và một cú cuộn lúc này chỉ làm bài phía sau trôi đi vô cớ. */
        var tamNoi = !rong.matches && !!moc;
        var oGan = duocDoi && rong.matches;
        if (!tamNoi) {
          than.scrollIntoView({ block: oGan ? 'nearest' : 'start',
                                behavior: 'smooth' });
        }
        /* Con trỏ vào thẳng ô viết: mở khung bình luận là để viết, và nếu đã
           cuộn tới nơi rồi thì bắt gõ thêm một cú bấm nữa là thừa. Chờ hết cú
           cuộn mới focus — focus sớm thì trình duyệt tự nhảy, đè lên cuộn mượt. */
        setTimeout(function () {
          var o = than.querySelector('textarea');
          if (o) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
        }, tamNoi ? 260 : 420);
      }
      /* Đóng lại thì đưa mắt VỀ chỗ cái nút — không thì người đọc đóng khung ở
         cuối bài xong còn đứng nguyên dưới đó, nhìn một khoảng trống vừa co
         lại mà không rõ mình đang ở đâu. */
      if (dangMo) nutMo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    /* Vượt ngưỡng lúc đang mở — xoay điện thoại, kéo rộng cửa sổ — thì khung
       phải đổi chỗ theo. Không nghe thì có lúc nó nằm trong một `.ben` đang là
       `display:contents`, tức là mất luôn cái cột mà nó vừa được dời vào. */
    /* Xoay máy hay kéo rộng cửa sổ lúc khung đang mở: đích đến đổi theo khổ
       màn. Không nghe thì khung chèn giữa bài ở khổ hẹp vẫn nằm chèn giữa bài
       sau khi máy đã rộng ra tới hai cột. */
    /* Esc: lối ra của bàn phím, và của cả người đang cầm điện thoại có bàn
       phím ngoài. Chỉ bắt khi tấm đang nổi — ở hai chỗ kia khung là một phần
       của trang, Esc ở đó không có nghĩa gì. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !man) return;
      e.preventDefault();
      nutMo.click();
    });

    var theoNgang = function () {
      if (than.hidden) return;
      datCho(rong.matches ? 'ben' : 'tam');
    };
    (rong.addEventListener ? rong.addEventListener('change', theoNgang)
                           : rong.addListener(theoNgang));
  }

  /* Chưa khai địa chỉ script: khoá form lại thay vì để một cái nút bấm không
     ăn thua gì. Nút bấm mãi không phản hồi còn khó chịu hơn là không có nút. */
  if (!API) {
    form.hidden = true;
    noi(L('notLinked'), 'cho');
    return;
  }

  /* ══════════ 1. LẤY BÌNH LUẬN ĐÃ DUYỆT ══════════ */
  function tai() {
    fetch(API + '?url=' + encodeURIComponent(TRANG),
          { cache: 'no-store', headers: dauKhoa() })
      .then(function (r) { return r.json(); })
      .then(function (kq) { if (kq.ok && kq.ds) ve(kq.ds); })
      .catch(function () {
        /* Im lặng: bình luận tải hỏng không phải lý do để làm phiền người
           đang đọc bài. Form vẫn gửi được. */
      });
  }

  /* ── NGÀY VÀ GIỜ, LUÔN TÍNH THEO GIỜ VIỆT NAM ──
     Không lấy giờ máy người đọc. Blog viết ở GMT+7 và người đọc cũng gần hết
     ở đó; một bình luận gõ lúc 23:30 tối thứ Ba mà người mở ở châu Âu thấy
     đề "17 Sep" còn người mở ở Hà Nội thấy "18 Sep" thì hai người đang nói
     về hai buổi tối khác nhau.

     `Intl` lo cả việc đổi múi lẫn việc bù ngày. Máy nào không có nó thì rơi
     về giờ máy — mất độ chính xác chứ không mất dòng chữ. */
  function ngay(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    try {
      var p = {};
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      if (p.day && p.hour) {
        return p.day + ' ' + p.month + ' ' + p.year + ' · ' + p.hour + ':' + p.minute;
      }
    } catch (e) { /* rơi về giờ máy ở dưới */ }
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ══════════ 2. DỰNG CÂY ══════════

     Máy chủ trả về một danh sách phẳng, mỗi dòng có `ma` của chính nó và `cha`
     là mã của bình luận nó trả lời. Dựng thành cây ở đây chứ không ở máy chủ:
     máy chủ chỉ nên làm việc của máy chủ, còn dựng cây là việc trình duyệt làm
     trong một phần nghìn giây.

     CHỈ HAI TẦNG. Trả lời của trả lời cũng gắn vào bình luận GỐC của nhánh đó,
     y như Facebook. Cho lồng vô hạn thì trên màn hình 390px, tới tầng thứ tư
     là cột chữ còn 120px — mỗi dòng ba chữ. */
  function dungCay(ds) {
    var theoMa = {}, goc = [];
    ds.forEach(function (c) { c.con = []; theoMa[c.ma] = c; });
    ds.forEach(function (c) {
      var cha = c.cha && theoMa[c.cha];
      if (!cha) { goc.push(c); return; }
      /* Leo ngược lên tới gốc của nhánh — nhờ vậy tầng 3, 4 cũng về tầng 2. */
      var soLan = 0;
      while (cha.cha && theoMa[cha.cha] && soLan++ < 50) cha = theoMa[cha.cha];
      cha.con.push(c);
    });
    return goc;
  }

  function ve(ds) {
    dsHienTai = ds;
    dsEl.textContent = '';
    if (deEl) deEl.textContent = ds.length ? String(ds.length) : '';
    if (demEl) {
      /* Ẩn hẳn khi chưa có bình luận nào — cùng luật với ô lượt thích. Số 0
         cạnh một cái icon bong bóng đọc ra là "chưa ai nói gì", mà đó là câu
         không cần nói ra ngay dưới tiêu đề bài. */
      demEl.hidden = ds.length === 0;
      demEl.textContent = ds.length ? String(ds.length) : '';
    }
    if (!ds.length) {
      var trong = document.createElement('li');
      trong.className = 'trong bl-trong';
      trong.textContent = L('noComments');
      dsEl.appendChild(trong);
      return;
    }
    /* ══════════════════════════════════════════════════════════════════════
       MƯỜI BÌNH LUẬN MỘT TRANG

       Một bài có bốn chục bình luận thì khu ấy dài hơn cả bài, và người vừa
       đọc xong bài phải cuộn qua bốn chục cái nữa mới tới ô gõ. Ở điện thoại
       thì tệ hơn: khu bình luận là một tấm trượt, nên nó đẩy chính nó dài ra
       khỏi màn.

       Mười một trang, và `‹ ›` để đi tới lui — cùng con số với mọi danh sách
       khác của trang (xem §17). Chỉ đếm bình luận GỐC: trả lời đi theo gốc của
       nó, không tách sang trang khác được, không thì một mạch trò chuyện bị
       cắt làm đôi giữa hai trang.

       Trang hiện tại giữ trong biến, không nằm ở địa chỉ: người ta tới đây từ
       một link chia sẻ, mà một link chở số trang BÌNH LUẬN là thứ không ai
       muốn gửi đi. */
    var goc = dungCay(ds);
    if (goc.length <= MOI_TRANG) {
      goc.forEach(function (c) { dsEl.appendChild(veMot(c, false, c)); });
      return;
    }
    var soTrang = Math.ceil(goc.length / MOI_TRANG);
    if (trangNay >= soTrang) trangNay = soTrang - 1;
    goc.slice(trangNay * MOI_TRANG, (trangNay + 1) * MOI_TRANG)
       .forEach(function (c) { dsEl.appendChild(veMot(c, false, c)); });
    dsEl.appendChild(veThanhTrang(soTrang, goc.length));
  }

  /* Thanh `‹ 2/4 ›`. Là một `<li>` vì nó nằm trong `<ul class="bl-ds">` — một
     `<div>` lạc giữa các `<li>` là HTML sai, và trình đọc màn hình đọc ra một
     mục danh sách rỗng. */
  function veThanhTrang(soTrang, tong) {
    var li = document.createElement('li');
    li.className = 'bl-trang';
    function nut(chu, di, tat) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bl-trang-nut';
      b.textContent = chu;
      b.disabled = !!tat;
      b.setAttribute('aria-label', chu === '‹' ? L('prevPage', 'Previous page')
                                               : L('nextPage', 'Next page'));
      b.addEventListener('click', function () {
        trangNay = di;
        ve(dsHienTai);
        /* Cuộn về đầu khu, không để người ta đứng giữa trang mới. */
        try { dsEl.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {}
      });
      return b;
    }
    li.appendChild(nut('‹', trangNay - 1, trangNay === 0));
    var giua = document.createElement('span');
    giua.className = 'bl-trang-so';
    giua.textContent = (trangNay + 1) + '/' + soTrang + ' · ' + tong;
    li.appendChild(giua);
    li.appendChild(nut('›', trangNay + 1, trangNay === soTrang - 1));
    return li;
  }

  /* Mười bình luận gốc một trang, và trang đang xem. Cả hai sống ở đây chứ
     không trong `ve()`: `ve()` chạy lại sau mỗi lần gửi hoặc duyệt, mà lúc ấy
     người đọc vẫn phải ở nguyên trang họ đang xem. */
  var MOI_TRANG = 10;
  var trangNay = 0;
  var dsHienTai = [];

  function veMot(c, laCon, goc) {
    var li = document.createElement('li');
    /* Thôi mang `.card`. Một bình luận ba chữ ("hay quá chị") trong một tấm
       thẻ kính bo góc lớn với lề trong 24px là một cái hộp gần trống, và mười
       cái hộp như thế xếp dọc thì phần đọc được chiếm chưa tới một phần ba
       chiều cao. Nay là một HÀNG có đường kẻ ngăn — cùng nếp với bảng làm việc
       ở /z-admin/, và cùng nếp với mọi danh sách khác trên trang. */
    li.className = 'bl-item' + (laCon ? ' bl-item--con' : '');
    if (c.chu) li.className += ' bl-item--chu';
    /* Mã in ra DOM để `chenChoDuyet` tìm được nhánh cần cắm trả lời vào. Chỉ
       là mã công khai của một bình luận đã hiện — không phải mã sửa. */
    if (c.ma) li.setAttribute('data-ma', c.ma);

    var dau = document.createElement('div');
    dau.className = 'bl-dau';

    var ten = document.createElement('span');
    ten.className = 'bl-ten';
    ten.textContent = c.ten || L('anon');            /* ← textContent, không innerHTML */
    dau.appendChild(ten);

    /* Huy hiệu chủ trang: người đọc cần phân biệt ngay đâu là trả lời của chủ
       nhà, đâu là của một người ghé ngang trùng tên. */
    if (c.chu) {
      var hh = document.createElement('span');
      hh.className = 'bl-hh';
      hh.textContent = L('author');
      dau.appendChild(hh);
    }

    /* ── GIỜ ĐI LIỀN SAU TÊN, KHÔNG DẠT SANG MÉP PHẢI ──
       Trước đây giờ nằm trong `.bl-cuoi` — cụm dạt phải cùng nút Reply. Ở một
       hàng co giãn thì mép phải là chỗ DI ĐỘNG: bình luận ngắn thì giờ nằm
       giữa hàng, bình luận dài thì nó rớt xuống dòng dưới. Đọc một cọc mười
       bình luận thì mười cái giờ ở mười chỗ khác nhau, không cái nào thẳng
       hàng với cái nào.

       "Ai nói" và "nói lúc nào" là một cặp — chúng thuộc về nhau hơn là thuộc
       về nút Reply. Đặt liền nhau thì chúng thành MỘT khối, và khối ấy luôn
       bắt đầu ở mép trái, tức luôn thẳng cột qua mọi bình luận. */
    var luc = document.createElement('time');
    luc.className = 'bl-luc';
    luc.textContent = ngay(c.luc);
    if (c.luc) luc.dateTime = c.luc;
    dau.appendChild(luc);

    /* ── BA TẦNG CHỮ CHO MỘT BÌNH LUẬN BA CHỮ ──
       Bản trước xếp dọc: tên và ngày một hàng, nội dung một hàng, nút Reply
       một hàng nữa. "love u chị iu~" dài đúng bốn chữ mà chiếm ba dòng và gần
       trọn bề ngang cột — phần chữ thật chiếm chưa tới một phần ba chiều cao
       cái khối bao quanh nó.

       Nay cả ba mẩu là ba ô trên MỘT hàng co giãn: tên · nội dung · (ngày và
       Reply dồn sang phải). Nội dung khai `flex:1 1 55%`, nên bình luận ngắn
       nằm gọn một dòng, còn bình luận dài thì tự rớt xuống dòng dưới — một
       luật lo cả hai ca, không cần đo độ dài chữ. */
    var nd = document.createElement('p');
    nd.className = 'bl-nd';
    nd.textContent = c.noiDung;                       /* ← textContent */

    var cuoi = document.createElement('span');
    cuoi.className = 'bl-cuoi';

    /* ── NÚT TRẢ LỜI, VÀ TRẦN CỦA MỘT NHÁNH ──
       Nút chỉ ở bình luận GỐC, vì cây chỉ có hai tầng.

       Nhưng hai tầng không có nghĩa là ngắn: một nhánh vẫn nhận được vô hạn
       trả lời, và hai người cãi nhau ba mươi lượt thì nhánh ấy dài hơn cả
       phần bình luận còn lại cộng lại. Mọi bình luận khác bị đẩy xuống dưới
       một cuộc trao đổi mà người mới vào không có phần.

       Chạm trần thì KHÔNG khoá nút — khoá là chặn người ta nói. Nút đổi việc:
       nó đưa về khung soạn chính, và bình luận gửi đi thành một nhánh MỚI ở
       ngang hàng. Cùng chừng ấy chữ, nhưng cuộc trao đổi dài được thở ở một
       chỗ khác thay vì nhồi tiếp vào một cột đã hẹp.

       Trần 12: dưới đó là một cuộc trò chuyện bình thường; trên đó thì hàng
       chấm gấp lại (`GAP_TU`) đã phải giấu đi quá nửa, tức là người đọc không
       còn thấy được mạch nữa. */
    /* ── NÚT TRẢ LỜI CÓ Ở MỌI THẺ, KỂ CẢ THẺ CON ──
       Bản trước chặn `if (!laCon)`, nên trả lời của một trả lời thì không bấm
       được vào đâu: muốn nói tiếp với người vừa trả lời mình thì phải cuộn
       ngược lên bấm Reply ở bình luận GỐC, rồi tự gõ tên người kia vào. Đó là
       bắt người đọc làm thay việc của trang.

       Cây vẫn HAI TẦNG như cũ — `dungCay` leo ngược lên gốc nhánh, nên trả
       lời của trả lời vẫn nằm phẳng trong cùng một nhánh. Cái đổi là chỗ BẤM,
       không phải cấu trúc: bấm ở thẻ con thì chip ghi đúng tên người ấy, và
       bình luận gửi lên mang `cha` là mã của chính thẻ con — máy chủ lưu đúng
       ai trả lời ai, còn lượt dựng lại thì kéo nó về tầng hai.

       Trần nhánh đọc từ GỐC chứ không từ thẻ đang vẽ: thẻ con không có `con`,
       nên hỏi nó thì trần không bao giờ chạm. */
    var TRAN_NHANH = 12;
    {
      var nhanh = (goc && goc.con) ? goc.con.length : 0;
      var day = nhanh >= TRAN_NHANH;
      var nutTra = document.createElement('button');
      nutTra.type = 'button';
      nutTra.className = 'bl-tra' + (day ? ' bl-tra--moi' : '');
      nutTra.textContent = day ? L('newThread') : L('reply');
      if (day) nutTra.title = L('threadFull');
      nutTra.addEventListener('click', function () {
        if (day) { veNha(); noi(L('threadFull'), 'cho'); moKhungSoan(); return; }
        denTraLoi(c, li);
      });
      cuoi.appendChild(nutTra);
    }

    /* ── NÚT SỬA — CHỈ HIỆN Ở LỜI CỦA CHÍNH MÁY NÀY ──
       Có mã sửa trong `localStorage` cho đúng `c.ma` thì mới hiện. Người khác
       mở cùng trang không thấy nút này ở thẻ ấy, vì máy họ không giữ mã.

       Hết ba lượt thì nút biến mất hẳn thay vì mờ đi: một cái nút bấm không
       ăn thua gì còn khó chịu hơn là không có nút. Số lượt còn lại in ngay
       trong nhãn, nên người sửa biết mình còn mấy lần trước khi bấm. */
    var maSua = maSuaCua(c.ma);
    var daSua = Number(c.soSua || 0);
    if (maSua && daSua < 3) {
      var nutSua = document.createElement('button');
      nutSua.type = 'button';
      nutSua.className = 'bl-tra bl-sua';
      nutSua.textContent = L('edit', 'Edit') + ' · ' + (3 - daSua);
      nutSua.title = L('editLeft', '{n} edits left').replace('{n}', 3 - daSua);
      nutSua.addEventListener('click', function () { moOSua(c, li, nd, maSua); });
      cuoi.appendChild(nutSua);
    }

    li.appendChild(dau);
    li.appendChild(nd);
    li.appendChild(cuoi);

    if (c.con && c.con.length) li.appendChild(veCon(c.con, goc));
    return li;
  }

  /* Nhánh trả lời. Quá 2 cái thì gấp lại — một bình luận có 15 trả lời mà bung
     hết thì đẩy mọi bình luận khác xuống tận đáy trang. Gấp lại được. */
  function veCon(con, goc) {
    var hopNhanh = document.createElement('div');
    hopNhanh.className = 'bl-nhanh';

    var ul = document.createElement('ul');
    ul.className = 'bl-ds bl-ds--con';

    /* ── LUÔN HIỆN HAI CÁI GẦN NHẤT, GẤP PHẦN CŨ HƠN ──
       Ngưỡng này đã đi ba nhịp: 3 → 5 → 2. Lý do dừng ở 2 là chỗ này không
       phải một hộp thư, nó là một cái đuôi dưới bình luận gốc. Hai lời đáp
       gần nhất đủ nói "ở đây có trao đổi, và nó đang nói về gì"; mọi thứ cũ
       hơn là chuyện của người muốn đọc kỹ, và người ấy bấm một cái.

       Gấp CÁI CŨ, không gấp cái mới: đọc một mạch trò chuyện thì cái vừa nói
       là cái cần thấy trước. Nên nút nằm TRÊN danh sách, và bung ra là chèn
       ngược lên đầu.

       ── VÀ NÓ PHẢI GẤP LẠI ĐƯỢC ──
       Bản trước bung xong thì xoá luôn cái nút: mở nhầm một nhánh mười lăm
       lời đáp là không có đường lùi, phải tải lại cả trang. Nay nút ở lại và
       đổi lời; các hàng đã bung giữ trong `hangCu` để gấp lại thì gỡ đúng
       chúng, không đụng vào hai hàng vẫn luôn hiện. */
    var GAP_TU = 2;
    var an = con.length > GAP_TU ? con.slice(0, con.length - GAP_TU) : [];
    var hien = con.slice(an.length);

    if (an.length) {
      var nut = document.createElement('button');
      nut.type = 'button';
      nut.className = 'bl-them';
      var moRa = false;
      var hangCu = [];
      function veNhanNut() {
        nut.textContent = moRa ? L('fewerReplies', an.length)
                               : L('moreReplies', an.length);
        nut.setAttribute('aria-expanded', moRa ? 'true' : 'false');
      }
      nut.addEventListener('click', function () {
        if (moRa) {
          for (var i = 0; i < hangCu.length; i++) hangCu[i].remove();
          hangCu = [];
        } else {
          /* Chèn NGƯỢC lên đầu để thứ tự thời gian vẫn đúng sau khi bung. */
          an.forEach(function (x, i) {
            var h = veMot(x, true, goc);
            ul.insertBefore(h, ul.children[i] || null);
            hangCu.push(h);
          });
        }
        moRa = !moRa;
        veNhanNut();
      });
      veNhanNut();
      hopNhanh.appendChild(nut);
    }

    hien.forEach(function (x) { ul.appendChild(veMot(x, true, goc)); });
    hopNhanh.appendChild(ul);
    return hopNhanh;
  }

  /* ── Ô SỬA TẠI CHỖ ──
     Không dời cái form chính xuống đây: form ấy là để viết lời MỚI, còn đây là
     sửa một lời đã có. Dùng chung thì phải nhớ nó đang ở chế độ nào, và cái
     chip "đang trả lời ai" lại phải kể thêm một trạng thái nữa.

     Một `<textarea>` với hai nút, dựng lúc bấm và gỡ lúc xong. Đơn giản tới
     mức không có trạng thái nào để sai. */
  function moOSua(c, li, nd, maSua) {
    if (li.querySelector('.bl-osua')) return;

    var o = document.createElement('div');
    o.className = 'bl-osua';

    var ta = document.createElement('textarea');
    ta.className = 'bl-osua-chu';
    ta.rows = 3;
    ta.maxLength = 2000;
    ta.value = c.noiDung;

    var hang = document.createElement('div');
    hang.className = 'bl-osua-nut';

    var bThoi = document.createElement('button');
    bThoi.type = 'button'; bThoi.className = 'btn btn--ghost';
    bThoi.textContent = L('cancelEdit', 'Cancel');
    bThoi.addEventListener('click', function () { o.remove(); nd.hidden = false; });

    var bLuu = document.createElement('button');
    bLuu.type = 'button'; bLuu.className = 'btn';
    bLuu.textContent = L('saveEdit', 'Save');
    bLuu.addEventListener('click', function () {
      var chu = ta.value.trim();
      if (chu.length < 2) { ta.focus(); return; }
      bLuu.disabled = true;
      fetch(API, {
        method: 'PUT',
        headers: dauKhoa({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ma: c.ma, noiDung: chu, maSua: maSua })
      }).then(function (r) { return r.json(); })
        .then(function (kq) {
          bLuu.disabled = false;
          if (!kq.ok) { noi(L('editFail', 'Could not save the edit'), 'hong'); return; }
          o.remove(); nd.hidden = false;
          /* Tải lại cả danh sách chứ không chỉ đổi chữ tại chỗ: sửa xong thì
             bình luận về lại hàng chờ duyệt (máy chủ làm vậy), nên nó có thể
             BIẾN MẤT khỏi danh sách công khai. Đổi chữ tại chỗ thì người sửa
             thấy lời mình còn đó, rồi tải lại trang mới thấy nó mất. */
          noi(kq.duyet ? L('editOk', 'Saved') : L('editWait', 'Saved — waiting for review again'), 'ok');
          tai();
        })
        .catch(function () { bLuu.disabled = false; noi(L('netErr'), 'hong'); });
    });

    hang.appendChild(bThoi); hang.appendChild(bLuu);
    o.appendChild(ta); o.appendChild(hang);
    nd.hidden = true;
    li.insertBefore(o, nd.nextSibling);
    ta.focus();
  }

  /* ══════════ 3. ĐEM FORM ĐI TRẢ LỜI ══════════ */
  var chip = null;

  function denTraLoi(c, li) {
    traLoiCho = c.ma;
    li.appendChild(form);
    if (!chip) {
      chip = document.createElement('p');
      chip.className = 'bl-chip';
      var chu = document.createElement('span');
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'bl-chip-x';
      x.setAttribute('aria-label', L('cancelReply'));
      x.textContent = '✕';
      x.addEventListener('click', veNha);
      chip.appendChild(chu); chip.appendChild(x);
      chip._chu = chu;
    }
    chip._chu.textContent = L('replyTo', c.ten || L('anon'));
    form.insertBefore(chip, form.firstChild);
    noi('');
    form.noiDung.focus();
  }

  function veNha() {
    traLoiCho = '';
    if (chip && chip.parentNode) chip.remove();
    nhaCuaForm.appendChild(form);
  }

  /* Đưa mắt và con trỏ tới khung soạn chính. Dùng khi nhánh đã chạm trần: nút
     "Start a new thread" phải đưa người ta TỚI chỗ gõ, không thì bấm xong màn
     hình không đổi gì và đọc ra là nút hỏng.

     Chờ hết cú cuộn mới focus — focus sớm thì trình duyệt tự nhảy tới ô, đè
     lên cuộn mượt và cả hai cùng giật. */
  function moKhungSoan() {
    form.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(function () {
      var o = form.noiDung;
      if (o) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
    }, 420);
  }

  /* ══════════ 4. GỬI ══════════ */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nut = form.querySelector('button[type="submit"]');
    var nd = form.noiDung.value.trim();

    if (nd.length < 2) { noi(L('tooShort'), 'hong'); form.noiDung.focus(); return; }

    nut.disabled = true;
    var maSuaMoi = sinhMa();
    var chuCu = nut.textContent;
    nut.textContent = L('sending');
    noi('');

    fetch(API, {
      method: 'POST',
      headers: dauKhoa({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        url: TRANG,
        /* Có khoá thì tên lấy từ cấu hình, không lấy từ ô đang ẩn — ô ấy có
           thể còn sót chữ của một lượt gõ trước. */
        maSua: maSuaMoi,
        ten: (coKhoa() && TEN_CHU) ? TEN_CHU : form.ten.value,
        email: (coKhoa() && TEN_CHU) ? '' : form.email.value,
        noiDung: nd,
        traLoiCho: traLoiCho,
        hp: form.hp.value,                             /* bẫy bot */
        giay: Math.round((Date.now() - moLuc) / 1000)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        if (!kq.ok) { noi(kq.loi || L('failed'), 'hong'); return; }
        /* Cất mã NGAY khi máy chủ xác nhận, trước cả lượt tải lại danh sách:
           `form.reset()` ngay dưới không đụng tới nó, nhưng nếu lượt tải lại
           hỏng giữa chừng thì quyền sửa vẫn còn. */
        if (kq.ma) catMaSua(kq.ma, maSuaMoi);
        /* `form.reset()` xoá cả tên và email — nhưng chúng là thứ người ta vừa
           gõ và sẽ gõ lại y hệt ở lần sau. Nhớ lại ngay sau khi reset. */
        var tenDaGui = (coKhoa() && TEN_CHU) ? TEN_CHU : form.ten.value;
        var choCha = traLoiCho;
        form.reset();
        nhoTen();
        veNha();
        /* Bình luận của chủ trang lên thẳng, nên báo khác: nói "chờ duyệt" với
           người vừa tự duyệt mình là một câu vô nghĩa. */
        if (kq.duyet) { noi(L('sentOwner'), 'ok'); tai(); return; }
        /* ── CHO NGƯỜI GỬI THẤY LỜI MÌNH, VÀ SỬA ĐƯỢC ──
           Trước bản này: gửi xong hiện một dòng "đang chờ duyệt" rồi hết. Lời
           vừa gõ không hiện ra ở đâu cả, vì danh sách công khai chỉ chở những
           bình luận ĐÃ duyệt.

           Cơ chế sửa thì đã có đủ từ trước — mã sửa cất trong `localStorage`,
           máy chủ cho ba lượt, nút `Edit · n` dựng sẵn trong `veMot`. Chỉ có
           điều không ai dùng được: muốn bấm Edit thì phải THẤY bình luận, mà
           nó không hiện. Một cơ chế hoàn chỉnh không có cửa vào.

           Nay cắm thẳng một hàng vào cuối danh sách, dựng từ chính những gì
           vừa gửi lên cộng cái mã máy chủ trả về. Cùng một `veMot` với mọi
           hàng khác, nên nút Edit, ô sửa tại chỗ và bộ đếm lượt chạy y hệt.

           ── CHỈ TRONG PHIÊN NÀY ──
           Tải lại trang là nó biến mất, cho tới khi admin duyệt. Đó là chuyện
           đúng chứ không phải chuyện thiếu: máy chủ không trả về bình luận
           chưa duyệt, và bày ra một thứ chỉ mình mình thấy suốt nhiều phiên
           thì người gửi tưởng lời mình đã lên trang. Dòng báo nói thẳng ra
           điều ấy, kèm số lượt sửa còn lại. */
        var conSua = typeof kq.conSua === 'number' ? kq.conSua : 3;
        noi(L('sentWait', 'Waiting for review — only you can see it. {n} edits left this session.')
              .replace('{n}', conSua), 'ok');
        chenChoDuyet({
          ma: kq.ma, ten: tenDaGui, noiDung: nd,
          luc: new Date().toISOString(), cha: choCha, soSua: 0, chu: false
        });
      })
      .catch(function () {
        noi(L('netErr'), 'hong');
      })
      .finally(function () {
        nut.disabled = false;
        nut.textContent = chuCu;
      });
  });

  /* ══════════ HÀNG "CHỜ DUYỆT" CẮM TẠI CHỖ ══════════

     Dựng bằng đúng `veMot` của mọi hàng khác — không có khuôn thứ hai. Cái
     riêng chỉ là một lớp `.bl-item--cho` và một huy hiệu `.badge--warn`:
     cùng hình, cùng sắc với `PENDING` ở ngăn Comment của /z-admin/ và với
     `DRAFT` ở bảng bài. Một trạng thái thì một hình, ở cả ba chỗ — xem
     docs/DESIGN-SYSTEM.md §20.1.

     Trả lời thì cắm vào đúng nhánh của nó nếu nhánh ấy đang hiện; không thì
     xuống cuối danh sách, vì một lời không biết đặt đâu nằm ở cuối vẫn đúng
     hơn là không hiện. */
  function chenChoDuyet(c) {
    if (!dsEl) return;
    var li = veMot(c, false, null);
    li.classList.add('bl-item--cho');

    var hh = document.createElement('span');
    hh.className = 'badge badge--warn bl-cho-hh';
    hh.textContent = L('stateOff', 'Pending');
    var dau = li.querySelector('.bl-dau');
    if (dau) dau.appendChild(hh);

    var oCha = c.cha && dsEl.querySelector('[data-ma="' + c.cha + '"] .bl-ds--con');
    (oCha || dsEl).appendChild(li);

    /* Cuộn tới nó chứ không để người gửi tự đi tìm: khung soạn có thể ở cột
       bên hoặc ở giữa bài, và hàng vừa cắm thì ở cuối danh sách. */
    try { li.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
  }

  /* ══════════ NHỚ TÊN NGƯỜI ĐÃ BÌNH LUẬN ══════════

     Người ghé lại lần thứ hai phải gõ lại đúng cái tên và đúng cái email họ
     vừa gõ tuần trước. Không có lý do nào cho việc ấy: máy của họ nhớ được.

     ── Ở MÁY NGƯỜI ĐỌC, KHÔNG Ở MÁY CHỦ ──
     `localStorage` chứ không phải cookie và cũng không gửi thêm gì lên máy
     chủ. Máy chủ đã có tên và email trong chính bình luận rồi; lưu thêm một
     bản nữa để "nhận ra người quen" là dựng một hồ sơ người dùng mà không ai
     xin phép. Ở đây không có hồ sơ nào: chỉ có hai ô trên máy của chính họ,
     xoá lịch sử trình duyệt là mất.

     ── KHÔNG ĐÈ LÊN THỨ ĐANG GÕ DỞ ──
     Chỉ điền khi ô đang TRỐNG. Người đang gõ một cái tên khác cho lần này —
     hoặc trình duyệt vừa tự điền — thì đừng chen vào.

     ── CHỦ TRANG KHÔNG DÙNG ĐƯỜNG NÀY ──
     Đã đăng nhập thì hai ô ấy ẩn đi và tên lấy từ site.config.json
     (`veVaiTro`), nên không có gì để nhớ và cũng không nên nhớ. */
  var KHOA_TEN = 'zoey:bl-ten';

  /* ══════════ MÃ SỬA — CHÌA KHOÁ NẰM Ở MÁY NGƯỜI GÕ ══════════

     Gửi bình luận thì sinh một chuỗi ngẫu nhiên, gửi kèm lên máy chủ (nơi chỉ
     lưu bản BĂM), rồi cất bản gốc ở đây. Muốn sửa thì gửi lại chuỗi gốc.

     Nó KHÔNG chứng minh "đúng người" — xoá lịch sử trình duyệt là mất quyền
     sửa. Đúng mức bảo đảm cần cho một ô bình luận không tài khoản: đủ để
     không ai sửa được lời người khác từ xa, mà không đòi ai đăng ký gì.

     Giữ tối đa 50 mã gần nhất: một người đọc lâu năm có thể để lại vài chục
     bình luận, mà `localStorage` thì có hạn và không nên để một tính năng nhỏ
     ăn dần hết chỗ. */
  var KHOA_SUA = 'zoey:bl-sua';
  var GIU_MA = 50;

  function khoSua() {
    try { return JSON.parse(localStorage.getItem(KHOA_SUA) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function catMaSua(ma, maSua) {
    try {
      var k = khoSua();
      k[ma] = maSua;
      var ds = Object.keys(k);
      if (ds.length > GIU_MA) ds.slice(0, ds.length - GIU_MA).forEach(function (x) { delete k[x]; });
      localStorage.setItem(KHOA_SUA, JSON.stringify(k));
    } catch (e) { /* chế độ riêng tư — mất quyền sửa, không mất gì khác */ }
  }
  function maSuaCua(ma) { return khoSua()[ma] || ''; }

  function sinhMa() {
    try {
      var b = new Uint8Array(16);
      crypto.getRandomValues(b);
      return [].map.call(b, function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
      return String(Date.now()) + Math.random().toString(36).slice(2);
    }
  }

  function nhoTen() {
    if (coKhoa() && TEN_CHU) return;
    try {
      var t = (form.ten && form.ten.value || '').trim();
      var e = (form.email && form.email.value || '').trim();
      if (!t && !e) return;
      localStorage.setItem(KHOA_TEN, JSON.stringify({ ten: t, email: e }));
    } catch (x) { /* chế độ riêng tư, kho đầy — không sao, chỉ là mất tiện ích */ }
  }

  (function dienLaiTen() {
    if (coKhoa() && TEN_CHU) return;
    try {
      var d = JSON.parse(localStorage.getItem(KHOA_TEN) || 'null');
      if (!d) return;
      if (form.ten && !form.ten.value && d.ten) form.ten.value = d.ten;
      if (form.email && !form.email.value && d.email) form.email.value = d.email;
    } catch (x) { /* như trên */ }
  })();

  /* Chạy lại sau khi đã điền tên: lượt gọi đầu ở cuối file chạy TRƯỚC đoạn
     điền, nên lúc ấy chưa biết có tên để mà gấp hai ô lại. */
  veVaiTro();

  /* Đếm ký tự còn lại — chỉ hiện khi đã gõ quá nửa hạn mức, để nó không
     ngồi đó đếm ngược ngay từ chữ đầu tiên như đang thúc người ta. */
  var o = form.noiDung, con = form.querySelector('.bl-con');
  if (o && con) {
    var MAX = Number(o.getAttribute('maxlength')) || 2000;
    o.addEventListener('input', function () {
      var du = MAX - o.value.length;
      con.textContent = du < MAX / 2 ? L('charsLeft', du) : '';
    });
  }

  /* ══════════ 5. DUYỆT THÌ VÀO /z-admin/, KHÔNG DUYỆT Ở ĐÂY ══════════

     Ở đây từng có hai nút nhỏ trên mỗi bình luận — `Unapprove` và `Hide` —
     chỉ hiện khi máy có khoá chủ trang. Ý là "đang đọc trong ngữ cảnh bài
     viết mà thấy cần gỡ thì gỡ ngay, không phải mở bàn duyệt rồi dò lại".

     Bỏ hẳn. Ba lẽ, nặng dần:

     · **Một việc, một chỗ.** Duyệt bình luận nay ở đúng một nơi: ngăn Comment
       của /z-admin/, nơi có bộ lọc, có ô tick tất cả, có thanh làm hàng loạt
       và có lịch sử trạng thái. Hai cửa cho cùng một việc thì cửa nhỏ luôn là
       cửa thiếu — nút ở đây không có xác nhận, không có hoàn tác, không nói
       được "còn mấy cái đang chờ".

     · **Một cú bấm không hoàn tác được, đặt cạnh chỗ đọc.** `Hide` là vĩnh
       viễn. Nó từng nằm mờ ở mép phải một hàng bình luận, rõ lên khi rê chuột
       vào hàng — tức đúng lúc mắt đang đọc thì một nút xoá vĩnh viễn sáng lên
       dưới con trỏ. Trên màn hẹp, cụm ấy đo ra chừng 24px trong khi ngón tay
       phủ 45px.

     · **Khung bình luận nay chỉ còn hai tầng** (tên+nút / nội dung), và mép
       phải tầng một là chỗ của `Reply` với `Edit` — thứ mọi người đọc đều
       dùng. Chen thêm hai nút chỉ chủ trang thấy vào đúng chỗ ấy thì hàng nút
       đổi hình theo việc ai đang xem.

     Cái mất đi là một quãng đường đi tắt của riêng chủ trang. Đổi lại: mọi
     người xem cùng một khung bình luận, và không cú bấm nào ở trang công khai
     làm mất dữ liệu.

  veVaiTro();
  /* Đăng nhập hay đăng xuất ở một tab khác thì form ở tab này phải đổi theo mà
     không cần tải lại trang — cùng một sự kiện khoa.js phát cho ô viết bài. */
  (function () { var k = kho(); if (k && k.theoDoi) k.theoDoi(veVaiTro); })();

  tai();
})();
