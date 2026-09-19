/* ============================================================
   SAO-LUU.GS — nửa Google của việc sao lưu hằng tuần.

   File này KHÔNG chạy cùng blog. Nó là mã Google Apps Script, dán vào
   script.google.com và deploy thành một web app. Worker gọi tới nó mỗi Chủ
   nhật, nó hợp nhất dữ liệu vào một Google Sheet trong Drive của chủ trang.

   Để trong repo vì nó là MỘT NỬA của một tính năng — nửa kia ở
   functions/api/thu-bao.js (hàm `chaySaoLuu`). Hai nửa phải khớp nhau về hình
   dạng gói JSON; để riêng một nửa trong Drive thì lần sửa sau không ai biết
   còn nửa kia ở đâu.

   ══════════════════════════════════════════════════════════════════════
   SỔ CÁI, KHÔNG PHẢI ẢNH CHỤP
   ══════════════════════════════════════════════════════════════════════

   Bản đầu làm theo lối ảnh chụp: mỗi lượt sinh một bộ tab gắn ngày
   (`binh_luan 2026-09-20`…), giữ 8 bộ. Đúng về khả năng khôi phục nhưng sai
   về hình dạng — ba tab mỗi tuần, hai tháng là 24 tab, và muốn biết một
   bình luận đổi gì thì phải mở tám tab ra so tay.

   Nay **ba tab, tên trần, không gắn ngày**, và mỗi lượt HỢP NHẤT vào đó:

     · dòng MỚI          → thêm vào cuối
     · dòng ĐỔI nội dung → ghi đè đúng dòng ấy
     · dòng KHÔNG đổi    → không đụng tới, giữ nguyên cả mốc thời gian
     · dòng BIẾN MẤT khỏi D1 → **KHÔNG xoá**, chỉ đánh dấu `đã xoá khỏi DB`

   Vế cuối là lý do cả cách này đáng làm. Sổ giữ lại thứ cơ sở dữ liệu đã bỏ,
   nên nó chống được **sai sót của chính chủ trang** — xoá nhầm một bình luận,
   chạy nhầm một câu DELETE — chứ không chỉ chống sự cố của Cloudflare. Mà sai
   sót của chính mình mới là thứ hay xảy ra.

   Một bản soi gương thuần (ghi đè sạch mỗi lượt) thì mất đúng khả năng ấy:
   xoá nhầm hôm nay, Chủ nhật tới bản sao lưu xoá theo, và không còn chỗ nào
   giữ dòng đó nữa.

   ── BA CỘT SỔ, ĐỨNG ĐẦU MỖI TAB ──────────────────────────────────────
     _trangThai   mới · đổi · nguyên · đã xoá khỏi DB
     _capNhat     lượt gần nhất LÀM GÌ ĐÓ với dòng này
     _lanDau      lượt đầu tiên thấy dòng này

   `_capNhat` chỉ đổi khi dòng thật sự đổi. Đóng dấu lại mỗi lượt thì cột ấy
   thành cột "ngày chạy gần nhất" — cùng một giá trị ở mọi dòng, và không trả
   lời được câu duy nhất nó sinh ra để trả lời: *dòng này đổi lần cuối khi
   nào?*

   Đứng ĐẦU chứ không phải cuối: `binh_luan` có mười hai cột và cột `chu` thì
   dài, nên xếp cuối là phải cuộn ngang mới thấy — mà đây lại là ba cột hay
   liếc nhất.

   ── VÌ SAO KHÔNG CẦN OAUTH ────────────────────────────────────────────
   Apps Script chạy DƯỚI DANH NGHĨA người deploy nó. Bạn deploy thì nó có đúng
   quyền của bạn với Drive của bạn — không service account, không khoá máy,
   không chia sẻ thư mục.

   ── BẢO VỆ BẰNG MỘT CHUỖI BÍ MẬT ──────────────────────────────────────
   Web app phải để "Anyone" mới nhận được lượt gọi từ Worker (Worker không
   đăng nhập Google được). Nghĩa là ai biết địa chỉ cũng gọi được — nên gói
   JSON phải chở theo `khoa`, và chuỗi ấy phải khớp `KHOA` dưới đây.

   ── CÀI ĐẶT: xem docs/SAO-LUU.md ──────────────────────────────────────
   ============================================================ */

/* ĐỔI DÒNG NÀY trước khi deploy. Phải KHỚP TỪNG CHỮ với Secret `SAO_LUU_KHOA`
   đặt ở Cloudflare. Gõ một chuỗi ngẫu nhiên dài, đừng nghĩ ra chữ có nghĩa. */
const KHOA = 'DOI-CHUOI-NAY-DI';

/* Tên file Sheet trong Drive. Chưa có thì lần chạy đầu tự tạo. */
const TEN_FILE = 'zoey-in-borderland — sao lưu';

/* ── KHOÁ CHÍNH CỦA TỪNG BẢNG ──
   Đây là thứ cho phép hợp nhất: không có khoá thì không biết dòng nào trong
   sổ ứng với dòng nào trong D1, và mọi lượt lại thành chép đè cả bảng.

   Khớp đúng `PRIMARY KEY` khai trong functions/api/*.js. Bảng lạ không có tên
   ở đây thì rơi về lối GHI ĐÈ CẢ TAB — vẫn sao lưu được, chỉ mất phần lịch sử.
   Thêm bảng mới thì thêm một dòng vào đây, không thì nó lặng lẽ mất sổ. */
const KHOA_CHINH = {
  binh_luan: 'ma',
  ghi_chu:   'ma',
  xem:       'u'
};

/* Ba cột sổ, luôn đứng đầu. Tiền tố `_` để không bao giờ đụng tên cột thật
   của D1 — SQLite cho phép đặt tên cột bắt đầu bằng gạch dưới, nhưng không
   bảng nào ở đây làm thế. */
const COT_SO = ['_trangThai', '_capNhat', '_lanDau'];

/* Thứ tự cột dữ liệu cho từng bảng. Khai cứng chứ không lấy khoá của dòng
   đầu: một bình luận cũ thiếu cột `soSua` sẽ làm cả bảng lệch cột nếu nó tình
   cờ đứng đầu. Cột lạ (thêm về sau mà quên khai ở đây) được nối vào cuối,
   không bị rơi mất. */
const COT = {
  binh_luan: ['ma', 'trang', 'ten', 'email', 'chu', 'cha', 'chuTrang',
              'duyet', 'an', 'luc', 'mtSua', 'soSua'],
  ghi_chu:   ['ma', 'ngay', 'chu', 'an', 'luc'],
  xem:       ['u', 'so', 'sua']
};

const TT_MOI     = 'mới';
const TT_DOI     = 'đổi';
const TT_NGUYEN  = 'nguyên';
const TT_DA_XOA  = 'đã xoá khỏi DB';

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
    const luc  = nhan_(goi.luc);
    const dem  = {};

    Object.keys(goi.bang).forEach(function (ten) {
      /* `dayDu` nói gói này có phải TOÀN BỘ bảng không. Xem chú thích trong
         `hopNhat_` về vì sao nó quyết định được chuyện sống chết. */
      const dayDu = !(goi.cat && goi.cat[ten]);
      dem[ten] = hopNhat_(file, ten, goi.bang[ten] || [], luc, dayDu);
    });

    ghiMuc_(file, goi, dem, luc);

    /* Worker ĐÒI đúng `{"ok":true}`, vì Apps Script trả 200 cho cả lúc hỏng —
       xem chú thích cùng chỗ trong functions/api/thu-bao.js. */
    return traLoi({ ok: true, sheet: file.getUrl(), dem: dem });

  } catch (err) {
    /* Nuốt lỗi rồi trả JSON chứ không để Apps Script ném ra trang HTML lỗi:
       trang HTML ấy vẫn về với mã 200, và phía Worker chỉ thấy một chuỗi
       không phải JSON. Trả lỗi có hình dạng thì thư báo hỏng nói được nguyên
       nhân. */
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

/* Mốc thời gian theo giờ Việt Nam. Lấy giờ UTC thì lượt chạy tối Chủ nhật bị
   ghi thành thứ Hai — sai một ngày, và lúc cần tra thì tra nhầm chỗ. */
function nhan_(iso) {
  const d = iso ? new Date(iso) : new Date();
  return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm');
}

/* Ép mọi giá trị về chuỗi. Không ép thì Sheets tự diễn giải: một bình luận mở
   đầu bằng `=` thành công thức, `+84…` thành số âm, và `2026-09-19` thành một
   đối tượng ngày mà lần đọc sau ra một chuỗi khác hẳn — tức là dòng ấy bị coi
   là "đổi" ở mọi lượt sao lưu, mãi mãi. */
function chu_(v) {
  return (v === null || v === undefined) ? '' : String(v);
}

/* ══════════ HỢP NHẤT MỘT BẢNG ══════════

   Đọc cả tab lên bộ nhớ, trộn với dữ liệu mới, ghi xuống một lần. Cách này
   tốn bộ nhớ hơn là sửa từng ô, nhưng mỗi lượt chỉ còn HAI lượt gọi Sheets
   (một đọc, một ghi) thay vì vài nghìn — mà Apps Script tính hạn mức theo số
   lượt gọi, không theo lượng dữ liệu. */
function hopNhat_(file, tenBang, ds, luc, dayDu) {
  const khoa = KHOA_CHINH[tenBang];

  /* Bảng chưa khai khoá chính: không hợp nhất được, ghi đè cả tab. Vẫn có bản
     sao lưu, chỉ là không có sổ. */
  if (!khoa) return ghiDe_(file, tenBang, ds);

  let sheet = file.getSheetByName(tenBang);
  const dauTien = !sheet;
  if (dauTien) sheet = file.insertSheet(tenBang);

  /* ── CỘT: hợp của ba nguồn ──
     cột đã có trong tab (giữ nguyên thứ tự, không làm xê dịch dữ liệu cũ) +
     cột khai ở COT + cột lạ thấy trong gói. Nhờ vậy thêm một cột vào D1 thì
     nó tự hiện ra ở cuối, không phải sửa gì ở đây. */
  const cu = dauTien ? [] : sheet.getDataRange().getValues();
  const dauCu = cu.length ? cu[0].map(String) : [];
  const cotCu = dauCu.filter(function (c) { return COT_SO.indexOf(c) < 0; });

  const thay = {};
  ds.forEach(function (d) { Object.keys(d).forEach(function (k) { thay[k] = 1; }); });

  const cot = cotCu.slice();
  (COT[tenBang] || []).concat(Object.keys(thay)).forEach(function (c) {
    if (cot.indexOf(c) < 0 && thay[c]) cot.push(c);
  });
  if (cot.indexOf(khoa) < 0) cot.unshift(khoa);

  /* ── Đọc dòng cũ thành bảng tra theo khoá chính ── */
  const viTri = {};   /* khoá → chỉ số trong `ra` */
  const ra = [];      /* mảng kết quả, mỗi phần tử { so: [...], du: {...} } */

  for (let i = 1; i < cu.length; i++) {
    const hang = cu[i];
    const du = {};
    dauCu.forEach(function (ten, j) { du[ten] = chu_(hang[j]); });
    const k = du[khoa];
    if (!k) continue;                       /* dòng rác, bỏ qua */
    viTri[k] = ra.length;
    ra.push({
      trangThai: du['_trangThai'] || '',
      capNhat:   du['_capNhat']   || '',
      lanDau:    du['_lanDau']    || luc,
      du:        du
    });
  }

  const dem = { moi: 0, doi: 0, nguyen: 0, xoa: 0 };
  const conSong = {};

  /* ── Trộn dữ liệu mới vào ── */
  ds.forEach(function (d) {
    const k = chu_(d[khoa]);
    if (!k) return;
    conSong[k] = 1;

    const idx = viTri[k];

    if (idx === undefined) {
      const du = {};
      cot.forEach(function (c) { du[c] = chu_(d[c]); });
      viTri[k] = ra.length;
      ra.push({ trangThai: TT_MOI, capNhat: luc, lanDau: luc, du: du });
      dem.moi++;
      return;
    }

    /* So từng cột DỮ LIỆU, không so ba cột sổ — không thì mọi dòng đều "đổi"
       ngay lượt sau, vì chính ba cột ấy vừa bị mình ghi vào. */
    const dong = ra[idx];
    let khac = false;
    cot.forEach(function (c) {
      const moi = chu_(d[c]);
      if (chu_(dong.du[c]) !== moi) { khac = true; dong.du[c] = moi; }
    });

    if (khac) {
      dong.trangThai = TT_DOI;
      dong.capNhat = luc;                   /* chỉ đóng dấu KHI THẬT SỰ ĐỔI */
      dem.doi++;
    } else if (dong.trangThai === TT_DA_XOA) {
      /* Dòng từng biến mất nay trở lại — khôi phục từ bản sao lưu, hoặc một
         mã trùng. Đáng ghi nhận là một lần đổi, không im lặng. */
      dong.trangThai = TT_DOI;
      dong.capNhat = luc;
      dem.doi++;
    } else {
      dong.trangThai = TT_NGUYEN;
      dem.nguyen++;                          /* `capNhat` GIỮ NGUYÊN */
    }
  });

  /* ── Dòng có trong sổ mà không có trong D1 ──
     KHÔNG xoá. Đánh dấu một lần rồi thôi: đóng dấu lại mỗi lượt thì `_capNhat`
     thành ngày chạy gần nhất chứ không phải ngày nó biến mất — mà ngày biến
     mất mới là thứ cần khi đi tìm "mình lỡ tay hôm nào".

     CHỈ làm khi `dayDu`. Gói bị cắt vì chạm trần 5000 dòng mà vẫn đánh dấu
     thì mọi dòng ngoài trần bị ghi là đã xoá — một bản sao lưu tự bôi bẩn
     chính nó, và bôi lặng lẽ. */
  if (dayDu) {
    ra.forEach(function (dong) {
      const k = dong.du[khoa];
      if (conSong[k]) return;
      if (dong.trangThai === TT_DA_XOA) return;   /* đã đánh dấu lần trước */
      dong.trangThai = TT_DA_XOA;
      dong.capNhat = luc;
      dem.xoa++;
    });
  }

  /* ── Ghi xuống một lần ── */
  const dau = COT_SO.concat(cot);
  const bang = [dau].concat(ra.map(function (dong) {
    return [dong.trangThai, dong.capNhat, dong.lanDau]
      .concat(cot.map(function (c) { return chu_(dong.du[c]); }));
  }));

  sheet.clear();
  sheet.getRange(1, 1, bang.length, dau.length).setValues(bang);
  sheet.getRange(1, 1, 1, dau.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  dem.tong = ra.length;
  return dem;
}

/* Lối ghi đè cho bảng chưa khai khoá chính. Giữ lại để thêm một bảng mới vào
   `BANG_SAO_LUU` bên Worker mà quên khai khoá ở đây thì vẫn có dữ liệu, chứ
   không nổ. */
function ghiDe_(file, tenBang, ds) {
  let sheet = file.getSheetByName(tenBang);
  if (sheet) sheet.clear(); else sheet = file.insertSheet(tenBang);

  if (!ds.length) {
    sheet.getRange(1, 1).setValue('(không có dòng nào)');
    return { tong: 0, moi: 0, doi: 0, nguyen: 0, xoa: 0, khongCoKhoa: true };
  }

  const co = {};
  ds.forEach(function (d) { Object.keys(d).forEach(function (k) { co[k] = 1; }); });
  const khai = COT[tenBang] || [];
  const cot = khai.filter(function (k) { return co[k]; })
    .concat(Object.keys(co).filter(function (k) { return khai.indexOf(k) < 0; }));

  const bang = [cot].concat(ds.map(function (d) {
    return cot.map(function (c) { return chu_(d[c]); });
  }));

  sheet.getRange(1, 1, bang.length, cot.length).setValues(bang);
  sheet.getRange(1, 1, 1, cot.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return { tong: ds.length, khongCoKhoa: true };
}

/* Trang đầu: mỗi lượt sao lưu một dòng. Mở file ra là thấy ngay lần cuối chạy
   khi nào và lượt ấy động vào những gì — không phải mở ba tab ra dò. */
function ghiMuc_(file, goi, dem, luc) {
  let s = file.getSheetByName('Mục lục');
  if (!s) s = file.insertSheet('Mục lục', 0);

  const cot = ['Lúc', 'Bảng', 'Tổng dòng', 'Mới', 'Đổi', 'Nguyên',
               'Đã xoá khỏi DB', 'Có email?'];

  if (s.getLastRow() === 0) {
    s.appendRow(cot);
    s.getRange(1, 1, 1, cot.length).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  /* Một dòng cho MỖI BẢNG, không gộp ba bảng vào một dòng: gộp lại thì thấy
     "3 dòng đổi" mà không biết đổi ở bảng nào, và đó đúng là câu hỏi đầu tiên
     người ta hỏi khi liếc vào đây. */
  Object.keys(dem).forEach(function (ten) {
    const d = dem[ten] || {};
    s.appendRow([luc, ten, d.tong || 0, d.moi || 0, d.doi || 0,
                 d.nguyen || 0, d.xoa || 0, goi.coEmail ? 'có' : 'không']);
  });
}
