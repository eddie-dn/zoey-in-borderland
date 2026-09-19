/* ============================================================
   SAO-LUU.GS — nửa Google của việc sao lưu hằng tuần.

   File này KHÔNG chạy cùng blog. Nó là mã Google Apps Script, dán vào
   script.google.com và deploy thành một web app. Worker gọi tới nó mỗi Chủ
   nhật, nó ghi dữ liệu vào một Google Sheet trong Drive của chủ trang.

   Để trong repo vì nó là MỘT NỬA của một tính năng — nửa kia ở
   functions/api/thu-bao.js (hàm `chaySaoLuu`). Hai nửa phải khớp nhau về hình
   dạng gói JSON; để riêng một nửa trong Drive thì lần sửa sau không ai biết
   còn nửa kia ở đâu.

   ── VÌ SAO KHÔNG CẦN OAUTH ────────────────────────────────────────────
   Apps Script chạy DƯỚI DANH NGHĨA người deploy nó. Bạn deploy thì nó có đúng
   quyền của bạn với Drive của bạn — không service account, không khoá máy,
   không chia sẻ thư mục. Đây là lý do chọn đường này thay vì gọi Drive API
   thẳng từ Worker.

   ── BẢO VỆ BẰNG MỘT CHUỖI BÍ MẬT ──────────────────────────────────────
   Web app phải để "Anyone" mới nhận được lượt gọi từ Worker (Worker không đăng
   nhập Google được). Nghĩa là ai biết địa chỉ cũng gọi được — nên gói JSON
   phải chở theo `khoa`, và chuỗi ấy phải khớp `KHOA` dưới đây.

   Không có nó thì bất kỳ ai dò ra địa chỉ đều bơm được dữ liệu rác vào Sheet.

   ── CÀI ĐẶT: xem docs/SAO-LUU.md ──────────────────────────────────────
   ============================================================ */

/* ĐỔI DÒNG NÀY trước khi deploy. Phải KHỚP TỪNG CHỮ với Secret `SAO_LUU_KHOA`
   đặt ở Cloudflare. Gõ một chuỗi ngẫu nhiên dài, đừng nghĩ ra chữ có nghĩa. */
const KHOA = 'DOI-CHUOI-NAY-DI';

/* Tên file Sheet trong Drive. Chưa có thì lần chạy đầu tự tạo. */
const TEN_FILE = 'zoey-in-borderland — sao lưu';

/* Giữ bao nhiêu bản. Mỗi lượt sao lưu tạo một bộ sheet mới theo ngày; quá số
   này thì bộ CŨ NHẤT bị xoá.

   Có trần vì Google Sheets giới hạn 10 triệu ô cho cả file — không dọn thì
   một ngày nào đó lượt sao lưu hỏng vì file đầy, và nó hỏng đúng lúc bạn
   không nhìn. 8 tuần là đủ xa để phát hiện ra một sự cố rồi quay lại lấy. */
const GIU_BAO_NHIEU = 8;

/* Thứ tự cột cho từng bảng. Khai cứng chứ không lấy khoá của dòng đầu: một
   bình luận cũ thiếu cột `soSua` sẽ làm cả bảng lệch cột nếu nó tình cờ đứng
   đầu. Cột lạ (thêm về sau mà quên khai ở đây) được nối vào cuối, không bị
   rơi mất. */
const COT = {
  binh_luan: ['ma', 'trang', 'ten', 'email', 'chu', 'cha', 'chuTrang',
              'duyet', 'an', 'luc', 'mtSua', 'soSua'],
  ghi_chu:   ['ma', 'ngay', 'chu', 'an', 'luc'],
  xem:       ['u', 'so', 'sua']
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return traLoi({ ok: false, loi: 'gói rỗng' });
    }

    const goi = JSON.parse(e.postData.contents);

    /* So khoá TRƯỚC mọi thứ khác. Không có khoá đúng thì không đọc tiếp gói,
       không ghi gì, không nói gì thêm — câu trả lời gọn nhất có thể, để người
       dò không biết mình sai ở đâu. */
    if (!goi || goi.khoa !== KHOA) return traLoi({ ok: false, loi: 'sai khoá' });
    if (!goi.bang) return traLoi({ ok: false, loi: 'thiếu dữ liệu' });

    const file = layFile_();
    const dau = nhan_(goi.luc);
    const dem = {};

    Object.keys(goi.bang).forEach(function (ten) {
      dem[ten] = ghiBang_(file, ten + ' ' + dau, ten, goi.bang[ten] || []);
    });

    ghiMuc_(file, goi, dem);
    donBotCu_(file);

    /* Worker ĐÒI đúng `{"ok":true}`, vì Apps Script trả 200 cho cả lúc hỏng —
       xem chú thích cùng chỗ trong functions/api/thu-bao.js. */
    return traLoi({ ok: true, sheet: file.getUrl(), dem: dem });

  } catch (err) {
    /* Nuốt lỗi rồi trả JSON chứ không để Apps Script ném ra trang HTML lỗi:
       trang HTML ấy vẫn về với mã 200, và phía Worker chỉ thấy một chuỗi không
       phải JSON. Trả lỗi có hình dạng thì thư báo hỏng nói được nguyên nhân. */
    return traLoi({ ok: false, loi: String(err && err.message || err) });
  }
}

/* Gọi bằng trình duyệt để xem web app còn sống không. Không trả dữ liệu gì —
   chỉ đủ để phân biệt "chưa deploy" với "deploy rồi nhưng khoá sai". */
function doGet() {
  return traLoi({ ok: true, noi: 'web app đang chạy — dùng POST để sao lưu' });
}

function traLoi(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Tìm file theo tên, chưa có thì tạo. Dùng tên chứ không phải ID để lần cài
   đầu không phải chép ID vào đâu cả — một bước ít đi là một chỗ ít vấp. */
function layFile_() {
  const thay = DriveApp.getFilesByName(TEN_FILE);
  if (thay.hasNext()) return SpreadsheetApp.open(thay.next());

  const moi = SpreadsheetApp.create(TEN_FILE);
  moi.getActiveSheet().setName('Mục lục');
  return moi;
}

/* Nhãn ngày cho bộ sheet của lượt này, theo giờ Việt Nam. Lấy giờ UTC thì bản
   sao lưu tối Chủ nhật bị ghi thành thứ Hai — tên sai một ngày, và lúc cần
   tìm lại thì tìm nhầm chỗ. */
function nhan_(iso) {
  const d = iso ? new Date(iso) : new Date();
  return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
}

function ghiBang_(file, tenSheet, tenBang, ds) {
  /* Cùng một ngày chạy lại lần nữa thì GHI ĐÈ, không tạo sheet thứ hai. Chạy
     tay để thử là chuyện thường, và mỗi lần thử đẻ thêm một sheet thì file
     đầy rất nhanh. */
  let sheet = file.getSheetByName(tenSheet);
  if (sheet) sheet.clear();
  else sheet = file.insertSheet(tenSheet);

  if (!ds.length) {
    sheet.getRange(1, 1).setValue('(không có dòng nào)');
    return 0;
  }

  /* Cột khai sẵn trước, cột lạ nối vào sau — xem chú thích ở COT. */
  const khai = COT[tenBang] || [];
  const co = {};
  ds.forEach(function (d) { Object.keys(d).forEach(function (k) { co[k] = 1; }); });
  const cot = khai.filter(function (k) { return co[k]; })
    .concat(Object.keys(co).filter(function (k) { return khai.indexOf(k) < 0; }));

  const hang = [cot].concat(ds.map(function (d) {
    return cot.map(function (k) {
      const v = d[k];
      if (v === null || v === undefined) return '';
      /* Ép chuỗi để Sheets khỏi tự diễn giải. Không ép thì một bình luận mở
         đầu bằng dấu `=` thành công thức, và `+84…` thành số âm. */
      return String(v);
    });
  }));

  sheet.getRange(1, 1, hang.length, cot.length).setValues(hang);
  sheet.getRange(1, 1, 1, cot.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return ds.length;
}

/* Trang đầu: mỗi lượt sao lưu một dòng. Mở file ra là thấy ngay lần cuối chạy
   khi nào và được bao nhiêu dòng — không phải đi đếm tab. */
function ghiMuc_(file, goi, dem) {
  let s = file.getSheetByName('Mục lục');
  if (!s) s = file.insertSheet('Mục lục', 0);

  if (s.getLastRow() === 0) {
    s.appendRow(['Lúc', 'Bình luận', 'Ghi chú', 'Lượt xem', 'Có email?']);
    s.getRange(1, 1, 1, 5).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  s.appendRow([
    nhan_(goi.luc) + ' ' + Utilities.formatDate(
      goi.luc ? new Date(goi.luc) : new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm'),
    dem.binh_luan || 0,
    dem.ghi_chu || 0,
    dem.xem || 0,
    goi.coEmail ? 'có' : 'không'
  ]);
}

/* Xoá bộ sheet cũ nhất khi vượt trần. Gom theo NGÀY chứ không theo từng sheet:
   một lượt sao lưu đẻ ra ba sheet, xoá lẻ từng cái thì còn lại những bộ khuyết
   — nhìn thì tưởng đủ mà khôi phục mới biết thiếu. */
function donBotCu_(file) {
  const ngay = {};
  file.getSheets().forEach(function (s) {
    const ten = s.getName();
    const m = ten.match(/ (\d{4}-\d{2}-\d{2})$/);
    if (!m) return;                       /* Mục lục và sheet lạ: không đụng */
    (ngay[m[1]] = ngay[m[1]] || []).push(s);
  });

  const cac = Object.keys(ngay).sort();
  while (cac.length > GIU_BAO_NHIEU) {
    ngay[cac.shift()].forEach(function (s) { file.deleteSheet(s); });
  }
}
