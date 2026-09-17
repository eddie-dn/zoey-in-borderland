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
     và mở /#duyet là ra bàn duyệt. Không có khoá thì mọi thứ ở đây chạy đúng
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

  function noi(t, loai) {
    bao.textContent = t || '';
    bao.className = 'bl-bao' + (loai ? ' bl-bao--' + loai : '');
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
     `khung-a` không. Suy ra được, nhưng nó là bản sao thứ hai của một luật đã
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

    function doiCho(vaoBen) {
      if (!duocDoi) return;
      if (vaoBen) {
        if (moc) return;
        moc = document.createComment('bl-than');
        than.parentNode.insertBefore(moc, than);
        ben.appendChild(than);
        ben.classList.add('ben--bl');
        luoi.classList.add('khung-a--bl');
      } else {
        if (!moc) return;
        moc.parentNode.insertBefore(than, moc);
        moc.remove(); moc = null;
        ben.classList.remove('ben--bl');
        luoi.classList.remove('khung-a--bl');
      }
    }

    /* Nút "Back" trong khung bấm hộ chính nút đã mở khung: một đường đóng duy
       nhất, nên trạng thái `aria-expanded`, việc dời chỗ và cú cuộn đều đi qua
       cùng một chỗ. Dựng riêng một đường đóng thứ hai là sớm muộn có một đường
       quên cập nhật một thứ. */
    var nutDong = than.querySelector('.bl-lui');
    if (nutDong) nutDong.addEventListener('click', function () { nutMo.click(); });

    nutMo.addEventListener('click', function () {
      var dangMo = nutMo.getAttribute('aria-expanded') === 'true';
      nutMo.setAttribute('aria-expanded', dangMo ? 'false' : 'true');
      /* .hidden chứ không phải style.display: thuộc tính này vừa giấu khỏi mắt
         vừa giấu khỏi trình đọc màn hình, và bấm Tab không lọt vào được. */
      than.hidden = dangMo;
      doiCho(!dangMo && rong.matches);
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
        var vaoBen = duocDoi && rong.matches;
        than.scrollIntoView({ block: vaoBen ? 'nearest' : 'start',
                              behavior: 'smooth' });
        /* Con trỏ vào thẳng ô viết: mở khung bình luận là để viết, và nếu đã
           cuộn tới nơi rồi thì bắt gõ thêm một cú bấm nữa là thừa. Chờ hết cú
           cuộn mới focus — focus sớm thì trình duyệt tự nhảy, đè lên cuộn mượt. */
        setTimeout(function () {
          var o = than.querySelector('textarea');
          if (o) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
        }, 420);
      }
      /* Đóng lại thì đưa mắt VỀ chỗ cái nút — không thì người đọc đóng khung ở
         cuối bài xong còn đứng nguyên dưới đó, nhìn một khoảng trống vừa co
         lại mà không rõ mình đang ở đâu. */
      if (dangMo) nutMo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    /* Vượt ngưỡng lúc đang mở — xoay điện thoại, kéo rộng cửa sổ — thì khung
       phải đổi chỗ theo. Không nghe thì có lúc nó nằm trong một `.ben` đang là
       `display:contents`, tức là mất luôn cái cột mà nó vừa được dời vào. */
    var theoNgang = function () {
      if (than.hidden) return;
      doiCho(rong.matches);
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

  function ngay(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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
      trong.className = 'bl-trong';
      trong.textContent = L('noComments');
      dsEl.appendChild(trong);
      return;
    }
    dungCay(ds).forEach(function (c) { dsEl.appendChild(veMot(c, false)); });
  }

  function veMot(c, laCon) {
    var li = document.createElement('li');
    /* Thôi mang `.card`. Một bình luận ba chữ ("hay quá chị") trong một tấm
       thẻ kính bo góc lớn với lề trong 24px là một cái hộp gần trống, và mười
       cái hộp như thế xếp dọc thì phần đọc được chiếm chưa tới một phần ba
       chiều cao. Nay là một HÀNG có đường kẻ ngăn — cùng nếp với bảng làm việc
       ở /z-admin/, và cùng nếp với mọi danh sách khác trên trang. */
    li.className = 'bl-item' + (laCon ? ' bl-item--con' : '');
    if (c.chu) li.className += ' bl-item--chu';

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

    var luc = document.createElement('time');
    luc.className = 'bl-luc';
    luc.textContent = ngay(c.luc);
    if (c.luc) luc.dateTime = c.luc;
    dau.appendChild(luc);

    var nd = document.createElement('p');
    nd.className = 'bl-nd';
    nd.textContent = c.noiDung;                       /* ← textContent */

    li.appendChild(dau);
    li.appendChild(nd);

    /* Nút trả lời — chỉ ở bình luận GỐC, vì cây chỉ có hai tầng. */
    if (!laCon) {
      var nutTra = document.createElement('button');
      nutTra.type = 'button';
      nutTra.className = 'bl-tra';
      nutTra.textContent = L('reply');
      nutTra.addEventListener('click', function () { denTraLoi(c, li); });
      li.appendChild(nutTra);
    }

    if (c.con && c.con.length) li.appendChild(veCon(c.con));
    nutChuTrang(c, li);
    return li;
  }

  /* Nhánh trả lời. Quá 2 cái thì gấp lại — một bình luận có 15 trả lời mà bung
     hết thì đẩy mọi bình luận khác xuống tận đáy trang. */
  function veCon(con) {
    var hopNhanh = document.createElement('div');
    hopNhanh.className = 'bl-nhanh';

    var ul = document.createElement('ul');
    ul.className = 'bl-ds bl-ds--con';

    var GAP_TU = 2;
    var an = con.length > GAP_TU ? con.slice(0, con.length - GAP_TU) : [];
    var hien = con.slice(an.length);

    if (an.length) {
      var nut = document.createElement('button');
      nut.type = 'button';
      nut.className = 'bl-them';
      nut.textContent = L('moreReplies', an.length);
      nut.addEventListener('click', function () {
        /* Chèn NGƯỢC lên đầu để thứ tự thời gian vẫn đúng sau khi bung. */
        an.forEach(function (x, i) {
          ul.insertBefore(veMot(x, true), ul.children[i] || null);
        });
        nut.remove();
      });
      hopNhanh.appendChild(nut);
    }

    hien.forEach(function (x) { ul.appendChild(veMot(x, true)); });
    hopNhanh.appendChild(ul);
    return hopNhanh;
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

  /* ══════════ 4. GỬI ══════════ */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nut = form.querySelector('button[type="submit"]');
    var nd = form.noiDung.value.trim();

    if (nd.length < 2) { noi(L('tooShort'), 'loi'); form.noiDung.focus(); return; }

    nut.disabled = true;
    var chuCu = nut.textContent;
    nut.textContent = L('sending');
    noi('');

    fetch(API, {
      method: 'POST',
      headers: dauKhoa({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        url: TRANG,
        ten: form.ten.value,
        email: form.email.value,
        noiDung: nd,
        traLoiCho: traLoiCho,
        hp: form.hp.value,                             /* bẫy bot */
        giay: Math.round((Date.now() - moLuc) / 1000)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        if (!kq.ok) { noi(kq.loi || L('failed'), 'loi'); return; }
        form.reset();
        veNha();
        /* Bình luận của chủ trang lên thẳng, nên báo khác: nói "chờ duyệt" với
           người vừa tự duyệt mình là một câu vô nghĩa. */
        noi(kq.duyet ? L('sentOwner') : L('sent'), 'ok');
        if (kq.duyet) tai();
      })
      .catch(function () {
        noi(L('netErr'), 'loi');
      })
      .finally(function () {
        nut.disabled = false;
        nut.textContent = chuCu;
      });
  });

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

  /* ══════════ 5. NÚT CỦA CHỦ TRANG, NGAY TRÊN TỪNG BÌNH LUẬN ══════════

     Bàn duyệt (xem src/js/duyet.js) là chỗ xử lý HÀNG LOẠT: mở ra, lướt hàng
     chờ, duyệt hoặc ẩn. Nhưng có một việc nó làm không tiện — đang ĐỌC một
     bình luận trong ngữ cảnh bài viết rồi mới thấy nó cần gỡ. Lúc ấy phải nhớ
     tên người gõ, mở bàn duyệt, dò lại trong danh sách. Đọc ở đây, bấm ở kia.

     Nên mỗi bình luận đã hiện trên trang mang thêm hai nút nhỏ — nhưng CHỈ khi
     máy này có khoá. Người đọc thường không bao giờ thấy chúng.

     Mờ sẵn, rõ khi rê vào cả thẻ: đây là việc dọn dẹp thỉnh thoảng mới làm,
     không phải thứ mắt phải vấp mỗi lần đọc một bình luận. */
  function nutChuTrang(c, li) {
    if (!coKhoa()) return;

    var nhom = document.createElement('div');
    nhom.className = 'bl-quyen';

    function lam(than, xong) {
      fetch(API, {
        method: 'PATCH',
        headers: dauKhoa({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(than)
      }).then(function (r) { return r.json(); })
        .then(function (kq) { if (kq.ok) xong(); })
        .catch(function () {});
    }

    var bRut = document.createElement('button');
    bRut.type = 'button';
    bRut.className = 'bl-quyen-nut';
    bRut.textContent = L('unapprove');
    bRut.title = L('unapproveHint');
    bRut.addEventListener('click', function () {
      bRut.disabled = true;
      lam({ ma: c.ma, duyet: 0 }, function () { li.remove(); tai(); });
    });

    var bAn = document.createElement('button');
    bAn.type = 'button';
    bAn.className = 'bl-quyen-nut bl-quyen-nut--an';
    bAn.textContent = L('hide');
    bAn.title = L('hideHint');
    bAn.addEventListener('click', function () {
      bAn.disabled = true;
      lam({ ma: c.ma, an: 1 }, function () { li.remove(); tai(); });
    });

    nhom.appendChild(bRut);
    nhom.appendChild(bAn);
    li.appendChild(nhom);
  }


  tai();
})();
