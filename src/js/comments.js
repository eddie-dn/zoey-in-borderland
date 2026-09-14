/* ============================================================
   BÌNH LUẬN — phía trình duyệt.

   Gửi lên và lấy về từ một Google Apps Script (xem tools/apps-script/Code.gs).
   Địa chỉ script khai ở site.config.json → binhLuan.url.

   Ba điều quan trọng trong file này:

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
   ============================================================ */
(function () {
  'use strict';

  var khoi = document.querySelector('[data-binh-luan]');
  if (!khoi) return;

  var API = khoi.dataset.binhLuan || '';
  var TRANG = khoi.dataset.trang || location.pathname;
  var dsEl = khoi.querySelector('.bl-ds');
  var form = khoi.querySelector('.bl-form');
  var bao = khoi.querySelector('.bl-bao');
  var demEl = khoi.querySelector('.bl-dem');
  var moLuc = Date.now();

  function noi(t, loai) {
    bao.textContent = t || '';
    bao.className = 'bl-bao' + (loai ? ' bl-bao--' + loai : '');
  }

  /* Chưa khai địa chỉ script: khoá form lại thay vì để một cái nút bấm không
     ăn thua gì. Nút bấm mãi không phản hồi còn khó chịu hơn là không có nút. */
  if (!API) {
    form.hidden = true;
    noi('Khung bình luận chưa nối với máy chủ. Xem docs/BINH-LUAN.md để cài.', 'cho');
    return;
  }

  /* ── 1. LẤY BÌNH LUẬN ĐÃ DUYỆT ── */
  function tai() {
    fetch(API + '?url=' + encodeURIComponent(TRANG), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        if (!kq.ok || !kq.ds) return;
        ve(kq.ds);
      })
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

  function ve(ds) {
    dsEl.textContent = '';
    if (demEl) demEl.textContent = ds.length ? '(' + ds.length + ')' : '';
    if (!ds.length) return;

    ds.forEach(function (c) {
      var li = document.createElement('li');
      li.className = 'bl-item card';

      var dau = document.createElement('div');
      dau.className = 'bl-dau';

      var ten = document.createElement('span');
      ten.className = 'bl-ten';
      ten.textContent = c.ten || 'Người đi ngang';      /* ← textContent, không innerHTML */

      var luc = document.createElement('time');
      luc.className = 'bl-luc';
      luc.textContent = ngay(c.luc);
      if (c.luc) luc.dateTime = c.luc;

      dau.appendChild(ten);
      dau.appendChild(luc);

      var nd = document.createElement('p');
      nd.className = 'bl-nd';
      nd.textContent = c.noiDung;                        /* ← textContent */

      li.appendChild(dau);
      li.appendChild(nd);
      dsEl.appendChild(li);
    });
  }

  /* ── 2. GỬI BÌNH LUẬN MỚI ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nut = form.querySelector('button[type="submit"]');
    var nd = form.noiDung.value.trim();

    if (nd.length < 2) { noi('Viết vài chữ đã nhé.', 'loi'); form.noiDung.focus(); return; }

    nut.disabled = true;
    var chuCu = nut.textContent;
    nut.textContent = 'Đang gửi…';
    noi('');

    fetch(API, {
      method: 'POST',
      /* KHÔNG đặt Content-Type — xem ghi chú §2 ở đầu file */
      body: JSON.stringify({
        url: TRANG,
        ten: form.ten.value,
        email: form.email.value,
        noiDung: nd,
        hp: form.hp.value,                               /* bẫy bot */
        giay: Math.round((Date.now() - moLuc) / 1000)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (kq) {
        if (!kq.ok) { noi(kq.loi || 'Gửi không được, thử lại sau nhé.', 'loi'); return; }
        form.reset();
        noi('Đã nhận rồi, cảm ơn bạn ✦ Mình đọc qua một lượt rồi mới đăng lên.', 'ok');
      })
      .catch(function () {
        noi('Mạng có vẻ trục trặc. Thử lại sau một lát nhé.', 'loi');
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
      con.textContent = du < MAX / 2 ? du + ' ký tự nữa' : '';
    });
  }

  tai();
})();
