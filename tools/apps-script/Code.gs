/* ============================================================
   BÌNH LUẬN — Google Apps Script
   Dán toàn bộ file này vào script.google.com, gắn với một Google Sheet.
   Hướng dẫn cài từng bước: docs/BINH-LUAN.md

   Script làm hai việc:
     doPost  nhận bình luận mới  → ghi một dòng vào Sheet, cột Duyệt để trống
     doGet   trả về bình luận    → CHỈ những dòng đã được đánh dấu duyệt

   Ba điều đáng nhớ:

   1. EMAIL KHÔNG BAO GIỜ RA KHỎI SHEET. doGet không đọc cột email, nên không
      có cách nào moi nó qua mạng. Email chỉ để bạn chủ trang liên hệ lại.

   2. KHÔNG BÌNH LUẬN NÀO TỰ LÊN TRANG. Mọi dòng vào Sheet đều chờ duyệt. Đây
      là lớp chặn spam thật sự — mấy lớp kiểm ở dưới chỉ lọc bớt cho đỡ rác Sheet.

   3. POST GỬI KIỂU text/plain, KHÔNG PHẢI application/json. Gửi JSON thì trình
      duyệt bắn một request OPTIONS hỏi trước, mà Apps Script không trả lời
      OPTIONS — thành ra bình luận nào cũng lỗi CORS. text/plain là "request
      đơn giản", trình duyệt gửi thẳng. Nội dung vẫn là chuỗi JSON, chỉ khác
      cái nhãn. Đây là chỗ gần như ai cũng vấp lần đầu.
   ============================================================ */

/* ══════════ CẤU HÌNH ══════════ */
var TEN_SHEET   = 'BinhLuan';
var MAX_TEN     = 60;
var MAX_EMAIL   = 120;
var MAX_ND      = 2000;
var MIN_ND      = 2;
var GIAY_TOI_THIEU = 3;     /* mở form dưới 3 giây đã gửi ⇒ gần như chắc là bot */

/* Cột trong Sheet. THÊM CỘT THÌ THÊM VÀO CUỐI danh sách này, đừng chèn giữa:
   dữ liệu cũ nằm theo vị trí cột, chèn giữa là mọi dòng cũ lệch hết sang phải.

     Ma          mã riêng của mỗi bình luận — chỗ để một trả lời trỏ tới
     Tra loi cho mã của bình luận cha. Để trống ⇒ bình luận gốc.
     Chu trang   đánh x ⇒ hiện dưới dạng trả lời của chủ trang (có huy hiệu) */
var COT = ['Thoi gian', 'Trang', 'Ten', 'Email', 'Noi dung', 'Duyet',
           'Ma', 'Tra loi cho', 'Chu trang', 'Ghi chu'];

/* Vị trí cột, đếm từ 0. Viết tên ra thay vì rải số 0..9 khắp file: đọc
   `r[C.NOI_DUNG]` biết ngay là gì, còn `r[4]` thì phải đếm lại hàng tiêu đề. */
var C = { LUC:0, URL:1, TEN:2, EMAIL:3, NOI_DUNG:4, DUYET:5,
          MA:6, CHA:7, CHU:8, GHI_CHU:9 };

var MAX_MA = 24;

/* ══════════ TIỆN ÍCH ══════════ */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TEN_SHEET);
  if (!sh) {
    sh = ss.insertSheet(TEN_SHEET);
    sh.appendRow(COT);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COT.length).setFontWeight('bold');
    return sh;
  }

  /* ── TỰ VÁ HÀNG TIÊU ĐỀ ──
     Sheet lập từ bản trước chỉ có 7 cột; bản này cần 10. Tự thêm mấy cột còn
     thiếu vào cuối thay vì bắt người dùng sửa tay — bảo người ta "thêm ba cột
     tên là Ma, Tra loi cho, Chu trang" thì chỉ cần gõ sai một chữ là mọi trả
     lời im lặng biến mất, mà không có gì báo.

     Chỉ THÊM, không bao giờ đổi hay xoá cột đang có: cột cũ đang giữ dữ liệu
     thật, và một cái script chạy ngầm thì không được phép đụng vào. */
  var dangCo = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0]
                 .map(function (x) { return String(x || '').trim(); });
  var thieu = [];
  for (var i = 0; i < COT.length; i++) {
    if (dangCo.indexOf(COT[i]) < 0) thieu.push(COT[i]);
  }
  if (thieu.length) {
    var tu = dangCo.length + 1;
    sh.getRange(1, tu, 1, thieu.length).setValues([thieu]).setFontWeight('bold');
  }
  return sh;
}

/* Mã riêng cho mỗi bình luận. Giờ + phần ngẫu nhiên: chỉ giờ thôi thì hai
   người bấm gửi cùng một giây là trùng mã, và lúc đó một trả lời có thể gắn
   nhầm vào bình luận của người khác. */
function maMoi_() {
  return 'c' + Date.now().toString(36) +
         Math.random().toString(36).slice(2, 7);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function cat_(s, n) {
  return String(s == null ? '' : s).trim().slice(0, n);
}

/* Bỏ mọi thẻ HTML ngay từ lúc ghi vào Sheet. Trang web cũng đã chèn bằng
   textContent (không phải innerHTML) nên có hai lớp chặn — nhưng lọc sớm thì
   Sheet đọc cũng sạch, không phải nhìn một mớ thẻ khi ngồi duyệt. */
function sach_(s) {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+\n/g, '\n').trim();
}

/* ══════════ NHẬN BÌNH LUẬN MỚI ══════════ */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, loi: 'Không có dữ liệu gửi lên.' });
    }
    var d = JSON.parse(e.postData.contents);

    /* Bẫy bot: ô ẩn `hp` người thật không nhìn thấy nên không bao giờ điền.
       Trả về ok:true cố ý — báo lỗi thì bot biết đường lách, còn báo thành
       công thì nó tưởng xong việc và bỏ đi. */
    if (cat_(d.hp, 50) !== '') return json_({ ok: true });

    /* Mở form chưa tới 3 giây đã gửi: người thật không gõ nổi một câu trong
       chừng đó thời gian. */
    var giay = Number(d.giay || 0);
    if (giay > 0 && giay < GIAY_TOI_THIEU) {
      return json_({ ok: false, loi: 'Từ từ đã — thử lại sau vài giây nhé.' });
    }

    var nd = sach_(cat_(d.noiDung, MAX_ND));
    if (nd.length < MIN_ND) {
      return json_({ ok: false, loi: 'Chưa có nội dung gì để gửi.' });
    }

    var email = cat_(d.email, MAX_EMAIL);
    if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
      return json_({ ok: false, loi: 'Địa chỉ email trông không đúng.' });
    }

    /* ── TRẢ LỜI CHO AI ──
       Mã cha phải CÓ THẬT VÀ ĐÃ ĐƯỢC DUYỆT, nếu không thì bỏ mã đi và coi như
       bình luận gốc. Nhận bừa mã nào cũng được thì có hai chỗ hỏng:

         · gửi mã bịa ⇒ bình luận rơi vào một nhánh không tồn tại, trang dựng
           cây xong là nó biến mất, người gửi tưởng bị nuốt mất bài
         · gửi mã của bình luận CHƯA duyệt ⇒ người ngoài dò được bình luận nào
           đang nằm chờ, tức là lộ thứ chưa công khai

       Thà tụt xuống thành bình luận gốc — vẫn hiện, vẫn đúng chỗ — còn hơn
       mất hẳn. */
    var cha = cat_(d.traLoiCho, MAX_MA);
    if (cha && !maDaDuyet_(cha)) cha = '';

    var hang = [];
    hang[C.LUC]      = new Date();
    hang[C.URL]      = cat_(d.url, 300);
    hang[C.TEN]      = sach_(cat_(d.ten, MAX_TEN));
    hang[C.EMAIL]    = email;
    hang[C.NOI_DUNG] = nd;
    hang[C.DUYET]    = '';          /* để trống, chờ duyệt tay */
    hang[C.MA]       = maMoi_();
    hang[C.CHA]      = cha;
    hang[C.CHU]      = '';          /* chỉ chủ trang tự đánh x trong Sheet */
    hang[C.GHI_CHU]  = '';
    sheet_().appendRow(hang);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, loi: 'Máy chủ gặp trục trặc: ' + err.message });
  }
}

/* Mã này có ứng với một dòng ĐÃ DUYỆT không? */
function maDaDuyet_(ma) {
  var sh = sheet_();
  var soDong = sh.getLastRow();
  if (soDong < 2) return false;
  var hang = sh.getRange(2, 1, soDong - 1, COT.length).getValues();
  for (var i = 0; i < hang.length; i++) {
    if (String(hang[i][C.MA] || '').trim() === ma && daDuyet_(hang[i][C.DUYET])) return true;
  }
  return false;
}

/* Duyệt khi ô có x, v, 1, yes, hoặc ô kiểu checkbox (TRUE) */
function daDuyet_(o) {
  var v = String(o == null ? '' : o).trim().toLowerCase();
  return ['x', 'v', '1', 'yes', 'true', 'ok'].indexOf(v) >= 0;
}

/* ══════════ TRẢ VỀ BÌNH LUẬN ĐÃ DUYỆT ══════════ */

function doGet(e) {
  try {
    var url = (e && e.parameter && e.parameter.url) ? String(e.parameter.url) : '';
    var sh = sheet_();
    var soDong = sh.getLastRow();
    if (soDong < 2) return json_({ ok: true, ds: [] });

    var hang = sh.getRange(2, 1, soDong - 1, COT.length).getValues();
    var ds = [];

    for (var i = 0; i < hang.length; i++) {
      var r = hang[i];
      if (!daDuyet_(r[C.DUYET])) continue;
      if (url && String(r[C.URL]) !== url) continue;

      /* CHỈ mấy trường này ra khỏi Sheet. Cột email (C.EMAIL) cố ý KHÔNG có
         mặt — doGet không đọc nó, nên không có cách nào moi email qua mạng. */
      ds.push({
        ma: String(r[C.MA] || ''),
        cha: String(r[C.CHA] || ''),
        chu: daDuyet_(r[C.CHU]) ? 1 : 0,
        luc: r[C.LUC] instanceof Date ? r[C.LUC].toISOString() : String(r[C.LUC]),
        ten: String(r[C.TEN] || ''),
        noiDung: String(r[C.NOI_DUNG] || '')
      });
    }
    ds.sort(function (a, b) { return a.luc < b.luc ? -1 : 1; });

    /* Dòng cũ (lập trước khi có cột Ma) không có mã. Cấp tạm một mã theo vị
       trí để trang còn dựng được cây — không ghi ngược vào Sheet, vì doGet chỉ
       nên đọc. Mấy dòng này luôn là bình luận gốc, không ai trả lời vào được. */
    for (var k = 0; k < ds.length; k++) if (!ds[k].ma) ds[k].ma = 'cu' + k;

    return json_({ ok: true, ds: ds });
  } catch (err) {
    return json_({ ok: false, loi: err.message, ds: [] });
  }
}
