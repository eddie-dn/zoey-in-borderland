/* ============================================================
   BÌNH LUẬN — phía trình duyệt. Có trả lời lồng bên trong.

   Gửi lên và lấy về từ một Google Apps Script (xem tools/apps-script/Code.gs).
   Địa chỉ script khai ở site.config.json → binhLuan.url.

   Bốn điều quan trọng trong file này:

   1. CHÈN BẰNG textContent, KHÔNG BAO GIỜ innerHTML.
      Nội dung ở đây do người lạ trên mạng gõ vào. Dùng innerHTML thì một dòng
      <script> trong ô bình luận chạy được trên trang của mình. textContent
      biến mọi thứ thành chữ thuần.

   2. POST GỬI KIỂU text/plain, KHÔNG PHẢI application/json.
      Đặt header Content-Type: application/json là trình duyệt bắn một request
      OPTIONS hỏi trước; Apps Script không trả lời OPTIONS nên hỏng CORS. Không
      đặt header nào cả thì trình duyệt dùng text/plain và gửi thẳng. Nội dung
      vẫn là chuỗi JSON, chỉ khác cái nhãn.

   3. KHÔNG CHẶN VIỆC ĐỌC BÀI.
      Bình luận tải sau, tải hỏng cũng không sao — bài vẫn nguyên vẹn. Nên mọi
      lỗi ở đây đều nuốt vào một câu báo nhỏ, không ném ra ngoài.

   4. MỘT CÁI FORM DUY NHẤT, ĐEM ĐI CHỖ KHÁC.
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
  var demEl = khoi.querySelector('.bl-dem');
  var than  = khoi.querySelector('.bl-than');
  var nutMo = khoi.querySelector('.bl-mo');
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

  function noi(t, loai) {
    bao.textContent = t || '';
    bao.className = 'bl-bao' + (loai ? ' bl-bao--' + loai : '');
  }

  /* ══════════ ĐÓNG MỞ CẢ KHỐI ══════════ */
  if (nutMo && than) {
    nutMo.addEventListener('click', function () {
      var dangMo = nutMo.getAttribute('aria-expanded') === 'true';
      nutMo.setAttribute('aria-expanded', dangMo ? 'false' : 'true');
      /* .hidden chứ không phải style.display: thuộc tính này vừa giấu khỏi mắt
         vừa giấu khỏi trình đọc màn hình, và bấm Tab không lọt vào được. */
      than.hidden = dangMo;
    });
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
    fetch(API + '?url=' + encodeURIComponent(TRANG), { cache: 'no-store' })
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
     Apps Script tính tiền theo thời gian chạy, mà việc này trình duyệt làm
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
    if (demEl) demEl.textContent = ds.length ? '(' + ds.length + ')' : '';
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
    li.className = 'bl-item' + (laCon ? ' bl-item--con' : ' card');
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
      /* KHÔNG đặt Content-Type — xem ghi chú §2 ở đầu file */
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
        noi(L('sent'), 'ok');
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

  tai();
})();
