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

/* Cột trong Sheet — đổi thứ tự ở đây thì đổi cả hàng tiêu đề trong Sheet */
var COT = ['Thoi gian', 'Trang', 'Ten', 'Email', 'Noi dung', 'Duyet', 'Ghi chu'];

/* ══════════ TIỆN ÍCH ══════════ */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TEN_SHEET);
  if (!sh) {
    sh = ss.insertSheet(TEN_SHEET);
    sh.appendRow(COT);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COT.length).setFontWeight('bold');
  }
  return sh;
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

    sheet_().appendRow([
      new Date(),
      cat_(d.url, 300),
      sach_(cat_(d.ten, MAX_TEN)),
      email,
      nd,
      '',                                    /* Duyệt — để trống, chờ duyệt tay */
      ''
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, loi: 'Máy chủ gặp trục trặc: ' + err.message });
  }
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
      var duyet = String(r[5] || '').trim().toLowerCase();
      /* Duyệt khi ô có x, v, 1, yes, hoặc ô kiểu checkbox (TRUE) */
      if (['x', 'v', '1', 'yes', 'true', 'ok'].indexOf(duyet) < 0) continue;
      if (url && String(r[1]) !== url) continue;

      /* CHỈ ba trường này ra khỏi Sheet. Cột email (r[3]) cố ý không có mặt. */
      ds.push({
        luc: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        ten: String(r[2] || ''),
        noiDung: String(r[4] || '')
      });
    }
    ds.sort(function (a, b) { return a.luc < b.luc ? -1 : 1; });
    return json_({ ok: true, ds: ds });
  } catch (err) {
    return json_({ ok: false, loi: err.message, ds: [] });
  }
}
