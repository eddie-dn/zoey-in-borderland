/* ============================================================
   /api/ghi-chu — đăng ghi chú thẳng lên trang, không dựng lại.

   ── VÌ SAO CẦN ────────────────────────────────────────────────────────
   Ghi chú là thứ bắt gặp giữa đường: một quyển sách, một bản nhạc, một ý
   thoáng qua. Bắt nó đi qua `content/ghi-chu.md` nghĩa là phải mở máy, sửa
   file, chạy build, đẩy lên — bốn bước cho ba dòng chữ. Bốn bước ấy đủ để
   lần sau người ta không ghi nữa. Đây là đường tắt: mở /z-admin/ trên điện
   thoại, gõ, xong.

   (Đời trước cửa này nằm sau `/notes/#viet`. Đã gỡ ở V1.8.8 — lý do ở phần
   "ĐÃ BỎ: CỬA SAU #viet" trong src/js/ghi-chu.js. Nay `/notes/` chỉ còn hai
   việc của người đọc: lọc, và xin ghi chú mới.)

   ── HAI NGUỒN, VÀ CÁI GIÁ CỦA NÓ ──────────────────────────────────────
   Từ đây blog có HAI chỗ chứa ghi chú: file Markdown (dựng sẵn, bot đọc
   được, không cần JavaScript) và bảng D1 (mới, chỉ hiện khi trình duyệt
   chạy JS). Hai nguồn là một cái nợ — nên có `tools/ghi-chu-keo.mjs` để
   kéo ghi chú từ D1 về lại file Markdown. Kéo về rồi thì ghi chú ấy trở
   thành ghi chú bình thường, và bản D1 tự lui ra (xem phần trùng mã trong
   src/js/ghi-chu.js). File Markdown vẫn là nguồn thật; D1 chỉ là chỗ đứng
   tạm giữa lúc gõ và lần dựng kế tiếp.

   ── KHOÁ: HAI MẨU, KHÔNG PHẢI MỘT ─────────────────────────────────────
   `x-gc-id` là mã chủ (biết được cũng chẳng sao), `x-gc-key` là chuỗi bí
   mật. Tách đôi vì hai lẽ: log của Cloudflare có thể ghi lại vài header mà
   mình không kiểm soát hết, và khi cần đổi khoá thì đổi mỗi vế bí mật, mã
   chủ giữ nguyên — mấy chỗ đã lưu không phải sửa cả hai.

   So sánh bằng vòng lặp chạy HẾT chuỗi chứ không `===`. `===` thoát ngay
   ký tự đầu khác nhau, và thời gian thoát ấy rò rỉ ra bao nhiêu ký tự đầu
   đã đúng — đủ để dò dần từng ký tự một.

   ── VÌ SAO KHÔNG MỞ CORS CHO LƯỢT GHI ─────────────────────────────────
   GET để `*` cho thoải mái. POST/PATCH/DELETE thì KHÔNG khai
   `Access-Control-Allow-Headers`, nên trình duyệt ở tên miền khác không
   gửi được `x-gc-key` sang đây — request kiểm tra trước (preflight) không
   có ai trả lời. Gọi bằng curl hay Shortcuts vẫn chạy: mấy thứ đó không bị
   CORS ràng buộc, mà chúng thì vẫn phải có khoá.

   ── BẢNG CẦN TẠO ──────────────────────────────────────────────────────
     CREATE TABLE IF NOT EXISTS ghi_chu (
       ma   TEXT PRIMARY KEY,
       ngay TEXT NOT NULL,
       loai TEXT NOT NULL DEFAULT '',
       chu  TEXT NOT NULL,
       luc  TEXT NOT NULL,
       xoa  INTEGER NOT NULL DEFAULT 0,
       an     INTEGER NOT NULL DEFAULT 0,
       soSua  INTEGER NOT NULL DEFAULT 0,
       xoaLuc TEXT NOT NULL DEFAULT '',
       mood   TEXT NOT NULL DEFAULT '',
       kieuNguon TEXT NOT NULL DEFAULT '',
       nguon  TEXT NOT NULL DEFAULT '',
       tacGia TEXT NOT NULL DEFAULT '',
       link   TEXT NOT NULL DEFAULT '',
       trich  INTEGER NOT NULL DEFAULT 0,
       ghim   INTEGER NOT NULL DEFAULT 0
     );
     CREATE INDEX IF NOT EXISTS ghi_chu_moi ON ghi_chu (xoa, ngay DESC);

   Không phải chạy tay: lượt ghi đầu tiên tự tạo bảng (xem `TAO` dưới đây).
   Chép ra đây để đọc code là biết bảng có gì, không phải đi mò.
   Các bước gắn D1 và đặt khoá: docs/CAI-DAT.md §6.
   ============================================================ */

const DOC_CORS = { 'Access-Control-Allow-Origin': '*' };

const MAX_CHU  = 2000;
const MAX_LOAI = 24;
const MAX_MA   = 40;
const LAY       = 200;          /* trả tối đa bấy nhiêu ghi chú một lượt */

/* Trần số lần sửa một ghi chú đã đăng — cùng con số với bình luận (xem
   TOI_DA_SUA ở binh-luan.js). Ba là đủ cho lỗi chính tả và một lần nghĩ lại;
   quá nữa thì nó thôi là "sửa" mà là viết một ghi chú khác — mà ghi chú khác
   thì đăng mới. */
const TOI_DA_SUA = 3;

/* Ghi chú bấm Delete vào THÙNG RÁC, nằm đó bấy nhiêu ngày rồi mới xoá cứng.
   Cùng luật với thùng rác bình luận — xem khối "THÙNG RÁC" ở binh-luan.js. */
const HAN_RAC = 30;

const TAO = [
  `CREATE TABLE IF NOT EXISTS ghi_chu (
     ma   TEXT PRIMARY KEY,
     ngay TEXT NOT NULL,
     loai TEXT NOT NULL DEFAULT '',
     chu  TEXT NOT NULL,
     luc  TEXT NOT NULL,
     xoa  INTEGER NOT NULL DEFAULT 0,
     an     INTEGER NOT NULL DEFAULT 0,
     soSua  INTEGER NOT NULL DEFAULT 0,
     xoaLuc TEXT NOT NULL DEFAULT '',
     mood   TEXT NOT NULL DEFAULT '',
     kieuNguon TEXT NOT NULL DEFAULT '',
     nguon  TEXT NOT NULL DEFAULT '',
     tacGia TEXT NOT NULL DEFAULT '',
     link   TEXT NOT NULL DEFAULT '',
     trich  INTEGER NOT NULL DEFAULT 0,
     ghim   INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS ghi_chu_moi ON ghi_chu (xoa, ngay DESC)`
];

/* ── BA CỘT THÊM SAU ──
   `an` (ẩn khỏi /notes/ mà không xoá), `soSua` (đã sửa mấy lần), `xoaLuc`
   (lúc vào thùng rác). Bảng đang chạy thật nên phải `ALTER TABLE`, chạy RIÊNG
   từng câu và nuốt lỗi — lý do đầy đủ ở khối cùng tên trong binh-luan.js.

   Ghi chú đã xoá từ đời trước (`xoa = 1`, chưa có `xoaLuc`) được đóng dấu lúc
   này: chúng hiện ra trong ngăn Trash và có đủ 30 ngày để cứu lại. */
const THEM_COT = [
  `ALTER TABLE ghi_chu ADD COLUMN an INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE ghi_chu ADD COLUMN soSua INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE ghi_chu ADD COLUMN xoaLuc TEXT NOT NULL DEFAULT ''`,
  /* Bảy cột của khuôn ghi chú mới — xem khối "THÔNG TIN KÈM" dưới đây. */
  `ALTER TABLE ghi_chu ADD COLUMN mood TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE ghi_chu ADD COLUMN kieuNguon TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE ghi_chu ADD COLUMN nguon TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE ghi_chu ADD COLUMN tacGia TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE ghi_chu ADD COLUMN link TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE ghi_chu ADD COLUMN trich INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE ghi_chu ADD COLUMN ghim INTEGER NOT NULL DEFAULT 0`
];

/* ── THÔNG TIN KÈM MỘT GHI CHÚ ──
     mood       một biểu tượng cảm xúc, chọn từ bảng có sẵn ở ô viết
     kieuNguon  'doc' | 'nghe' | 'xem' | '' — đang đọc, nghe hay xem cái gì
     nguon      tên thứ ấy (sách, bài hát, phim…)
     tacGia     người viết / người hát / đạo diễn
     link       đường dẫn tới nó, chỉ nhận http(s)
     trich      1 = ghi chú là một CÂU TRÍCH, hiện thành chữ trích lớn
     ghim       1 = nằm trên cùng /notes/; tối đa TOI_DA_GHIM cái

   Tất cả đều không bắt buộc: một ghi chú ba dòng không kèm gì vẫn là ghi chú
   đầy đủ. */
const TOI_DA_GHIM = 2;
const KIEU_NGUON = ['doc', 'nghe', 'xem'];
const COT_DOC = 'ma, ngay, loai, chu, mood, kieuNguon, nguon, tacGia, link, trich, ghim';

/* Đọc phần kèm từ thân gửi lên. Chỉ trả về những khoá CÓ trong thân, để
   PATCH không xoá trắng một trường mà trang không gửi. */
function docKem(than) {
  const ra = {};
  if ('mood' in than) {
    /* Một biểu tượng, không phải một câu: tối đa 16 đơn vị mã (đủ cho biểu
       tượng ghép nhiều mảnh như 😵‍💫 hay cờ), không khoảng trắng, và phải
       có ít nhất một ký tự hình — ô "dán emoji bất kỳ" ở trang quản trị không
       được thành chỗ gõ chữ. */
    const m = String(than.mood || '').trim();
    ra.mood = m.length <= 16 && !/\s|[<>&"']/.test(m) &&
              /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(m) ? m : '';
  }
  if ('kieuNguon' in than) ra.kieuNguon = KIEU_NGUON.includes(than.kieuNguon) ? than.kieuNguon : '';
  if ('nguon' in than)  ra.nguon  = String(than.nguon  || '').trim().slice(0, 120);
  if ('tacGia' in than) ra.tacGia = String(than.tacGia || '').trim().slice(0, 80);
  if ('link' in than) {
    const l = String(than.link || '').trim();
    ra.link = /^https?:\/\/[^\s<>"']{3,300}$/.test(l) ? l : '';
  }
  if ('trich' in than) ra.trich = than.trich ? 1 : 0;
  return ra;
}

/* Còn chỗ ghim không. Đếm cả ghi chú đang ẩn: ẩn rồi hiện lại thì nó vẫn
   mang cờ ghim, và lúc ấy trang có ba cái ghim. Ghi chú vào thùng rác thì
   nhả cờ ghim ra (xem DELETE), nên không chiếm chỗ. */
async function conChoGhim(env, tru = '') {
  const r = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM ghi_chu WHERE ghim = 1 AND xoa = 0 AND ma != ?').bind(tru).first();
  return Number((r && r.n) || 0) < TOI_DA_GHIM;
}
let daNoiRong = false;
async function noiRongBang(env) {
  if (daNoiRong) return;
  for (const sql of THEM_COT) {
    try { await env.DB.prepare(sql).run(); } catch (e) { /* cột đã có */ }
  }
  try {
    await env.DB.prepare(`UPDATE ghi_chu SET xoaLuc = ? WHERE xoa = 1 AND xoaLuc = ''`)
      .bind(new Date().toISOString()).run();
  } catch (e) { /* bảng chưa có */ }
  daNoiRong = true;
}

function traLoi(data, ma = 200, cache = 'no-store', cors = true) {
  return new Response(JSON.stringify(data), {
    status: ma,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': cache, ...(cors ? DOC_CORS : {}) }
  });
}

/* Chạy hết chuỗi dài nhất trong hai chuỗi, không thoát sớm. */
function bang(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  let lech = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    lech |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return lech === 0;
}

/* Cả hai vế khoá phải được ĐẶT ở phía máy chủ. Thiếu một vế thì coi như khoá
   chưa cấu hình và chặn hết lượt ghi — chứ không phải "để trống nghĩa là ai
   cũng ghi được". Đây là chỗ một cái sơ ý thành cửa mở cho cả internet. */
function chuaDatKhoa(env) { return !env.GC_ID || !env.GC_KEY; }

/* ── MÁY CHỦ CHƯA CÓ KHOÁ LÀ MỘT CHUYỆN KHÁC HẲN VỚI GÕ SAI KHOÁ ──
   Hai vế khoá chưa đặt ở Cloudflare thì KHÔNG AI vào được — kể cả người gõ
   đúng. Báo "sai khoá" lúc ấy là chỉ sai hướng: người ta đi tìm lỗi ở chỗ
   mình vừa gõ, gõ lại, đổi khoá, gõ lại nữa, mà vấn đề nằm ở bảng điều khiển
   Cloudflare. Đây là cái bẫy đã ngốn hẳn một buổi.

   Nói thẳng ra KHÔNG lộ gì: chưa có khoá thì cũng chẳng có gì để canh, và
   người lạ biết "cửa này chưa lắp khoá" cũng không vào được — mọi lượt ghi
   vẫn chặn hết. Cái lộ ra là một câu cho CHỦ TRANG, không phải cho kẻ dò. */
function loiChuaDatKhoa() {
  return traLoi({ loi: 'cauhinh', thieu: ['GC_ID', 'GC_KEY'],
                  chiTiet: 'Máy chủ chưa đặt GC_ID và GC_KEY. Cloudflare → '
                         + 'Settings → Runtime → Variables and Secrets (KHÔNG '
                         + 'phải mục Builds). Xem docs/CAI-DAT.md §6.' },
                503, 'no-store', false);
}

function duocGhi(request, env) {
  if (chuaDatKhoa(env)) return false;
  return bang(request.headers.get('x-gc-id'), env.GC_ID)
      && bang(request.headers.get('x-gc-key'), env.GC_KEY);
}

function locNgay(v) {
  const s = String(v || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  /* Chuỗi đúng khuôn vẫn có thể là ngày không tồn tại (2026-02-31). Dựng lại
     từ Date rồi so chuỗi: khớp thì ngày có thật. */
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === s ? s : null;
}

function locMa(v) {
  const s = String(v || '').trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(s) ? s : null;
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return traLoi({ tat: true });

  /* ── `?ql=1`: DANH SÁCH CỦA CHỦ TRANG ──
     Ngăn Note ở /z-admin/ cần thấy cả ghi chú đang ẩn và ghi chú trong thùng
     rác, kèm số lần đã sửa — những thứ người đọc không được thấy. Nên nhánh
     này đòi khoá, và không bao giờ cache. Dọn thùng rác quá hạn trước khi
     đọc, cùng nếp với bàn duyệt bình luận. */
  if (new URL(request.url).searchParams.get('ql') === '1') {
    if (chuaDatKhoa(env)) return loiChuaDatKhoa();
    if (!duocGhi(request, env)) return traLoi({ loi: 'sai khoá' }, 401, 'no-store', false);
    await noiRongBang(env);
    try {
      const han = new Date(Date.now() - HAN_RAC * 864e5).toISOString();
      await env.DB.prepare(
        `DELETE FROM ghi_chu WHERE xoa = 1 AND xoaLuc != '' AND xoaLuc < ?`).bind(han).run();
      const ql = await env.DB.prepare(
        `SELECT ${COT_DOC}, an, xoa, xoaLuc, soSua FROM ghi_chu
          ORDER BY xoa ASC, ngay DESC, luc DESC LIMIT ?`).bind(LAY).all();
      return traLoi({ ok: true, ghiChu: ql.results || [], hanRac: HAN_RAC,
                      toiDaSua: TOI_DA_SUA, toiDaGhim: TOI_DA_GHIM }, 200, 'no-store', false);
    } catch (e) {
      const loi = String((e && e.message) || e);
      if (/no such table/i.test(loi)) {
        return traLoi({ ok: true, ghiChu: [], hanRac: HAN_RAC, toiDaSua: TOI_DA_SUA,
                        toiDaGhim: TOI_DA_GHIM }, 200, 'no-store', false);
      }
      return traLoi({ ok: false, loi }, 500, 'no-store', false);
    }
  }

  let kq;
  try {
    await noiRongBang(env);
    kq = await env.DB.prepare(
      `SELECT ${COT_DOC} FROM ghi_chu
        WHERE xoa = 0 AND an = 0 ORDER BY ngay DESC, luc DESC LIMIT ?`).bind(LAY).all();
  } catch (e) {
    /* Bảng chưa có (chưa ghi lần nào) là chuyện bình thường, không phải lỗi. */
    return traLoi({ ghiChu: [] }, 200, 'public, max-age=30');
  }
  /* Cache 30 giây ở biên. Ghi chú không cần tức thì tới từng giây, mà /notes/
     thì ai mở cũng gọi. Lượt ghi tự xoá cache bằng cách... không xoá: 30 giây
     là quãng chờ chấp nhận được, và chính người vừa gõ thì thấy ngay vì trang
     chèn thẳng ghi chú mới vào danh sách, không đợi gọi lại. */
  return traLoi({ ghiChu: kq.results || [] }, 200, 'public, max-age=30');
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return traLoi({ loi: 'chưa gắn D1' }, 503, 'no-store', false);
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!duocGhi(request, env)) return traLoi({ loi: 'sai khoá' }, 401, 'no-store', false);

  let than;
  try { than = await request.json(); } catch (e) { than = null; }
  if (!than || typeof than !== 'object') {
    return traLoi({ loi: 'thân rỗng' }, 400, 'no-store', false);
  }

  const chu = String(than.chu || '').trim();
  if (!chu) return traLoi({ loi: 'chưa có chữ' }, 400, 'no-store', false);
  if (chu.length > MAX_CHU) {
    return traLoi({ loi: `dài quá ${MAX_CHU} ký tự` }, 400, 'no-store', false);
  }

  const ngay = locNgay(than.ngay) || new Date().toISOString().slice(0, 10);
  const loai = String(than.loai || '').trim().slice(0, MAX_LOAI);
  /* Mã do trang gửi lên để lượt gửi lại KHÔNG sinh ra bản trùng: mạng chập
     chờn, bấm Đăng một lần mà request đi hai lượt là chuyện thường. Trang
     không gửi mã thì máy chủ tự sinh. */
  const ma = locMa(than.ma) || crypto.randomUUID().slice(0, MAX_MA);
  const luc = new Date().toISOString();

  /* ── GỬI LẠI CÙNG MÃ THÌ KHÔNG GHI ĐÈ ──
     Bản trước `ON CONFLICT … DO UPDATE`: gửi lại thì ghi đè cả nội dung. Đó
     là một đường SỬA không đếm lượt — đúng thứ trần ba lần sửa ở PATCH phải
     chặn. Lượt gửi lại thật (mạng chập) mang đúng nội dung cũ, nên bỏ qua nó
     là đủ; muốn đổi chữ thì đi qua PATCH. */
  await env.DB.batch(TAO.map((sql) => env.DB.prepare(sql)));
  await noiRongBang(env);
  const kem = { mood: '', kieuNguon: '', nguon: '', tacGia: '', link: '', trich: 0, ...docKem(than) };
  /* Xin ghim mà đã đủ hai cái thì VẪN ĐĂNG, chỉ là không ghim — mất cả ghi
     chú vì một cái cờ là trả giá quá đắt. `ghimDay` báo lại cho ô viết nói ra. */
  let ghim = 0, ghimDay = false;
  if (than.ghim) { if (await conChoGhim(env)) ghim = 1; else ghimDay = true; }
  await env.DB.prepare(
    `INSERT INTO ghi_chu (ma, ngay, loai, chu, luc, xoa, an, soSua, xoaLuc,
                          mood, kieuNguon, nguon, tacGia, link, trich, ghim)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, '', ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(ma) DO NOTHING`
  ).bind(ma, ngay, loai, chu, luc, kem.mood, kem.kieuNguon, kem.nguon, kem.tacGia,
         kem.link, kem.trich, ghim).run();

  const dong = await env.DB.prepare(
    `SELECT ${COT_DOC}, an, xoa, soSua FROM ghi_chu WHERE ma = ?`).bind(ma).first();
  return traLoi({ ...(dong || { ma, ngay, loai, chu }), ghimDay }, 200, 'no-store', false);
}

/* ══════════ SỬA · ẨN · CỨU KHỎI THÙNG RÁC ══════════
   Một cửa cho mọi việc "đổi một ghi chú đang có", cùng nếp với PATCH của
   bình luận. Thân gửi lên mang `ma` và đúng MỘT trong ba thứ:
     · `chu` (kèm `ngay`, `loai` nếu đổi)  → sửa nội dung, tính một lượt sửa
     · `an: 0|1`                           → hiện / ẩn khỏi /notes/
     · `xoa: 0`                            → lấy ra khỏi thùng rác

   Ẩn và cứu KHÔNG tính lượt sửa: chúng không đổi chữ nào. */
export async function onRequestPatch({ request, env }) {
  if (!env.DB) return traLoi({ loi: 'chưa gắn D1' }, 503, 'no-store', false);
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!duocGhi(request, env)) return traLoi({ loi: 'sai khoá' }, 401, 'no-store', false);

  let than;
  try { than = await request.json(); } catch (e) { than = null; }
  const ma = locMa(than && than.ma);
  if (!ma) return traLoi({ loi: 'thiếu mã' }, 400, 'no-store', false);

  await noiRongBang(env);
  const dong = await env.DB.prepare(
    `SELECT ${COT_DOC}, an, xoa, soSua FROM ghi_chu WHERE ma = ?`).bind(ma).first();
  if (!dong) return traLoi({ loi: 'không có' }, 404, 'no-store', false);

  if ('chu' in than) {
    if (dong.xoa) return traLoi({ loi: 'đang trong thùng rác' }, 409, 'no-store', false);
    if (Number(dong.soSua) >= TOI_DA_SUA) {
      return traLoi({ loi: 'het-luot-sua', conSua: 0 }, 409, 'no-store', false);
    }
    const chu = String(than.chu || '').trim();
    if (!chu) return traLoi({ loi: 'chưa có chữ' }, 400, 'no-store', false);
    if (chu.length > MAX_CHU) {
      return traLoi({ loi: `dài quá ${MAX_CHU} ký tự` }, 400, 'no-store', false);
    }
    const ngay = locNgay(than.ngay) || dong.ngay;
    const loai = 'loai' in than ? String(than.loai || '').trim().slice(0, MAX_LOAI) : dong.loai;
    const soSua = Number(dong.soSua) + 1;
    /* Đổi nguồn, mood hay kiểu trích cũng là SỬA — cùng một lượt với chữ,
       vì chúng đi chung một lần bấm Save edit. */
    const k = { ...dong, ...docKem(than) };
    await env.DB.prepare(
      `UPDATE ghi_chu SET chu = ?, ngay = ?, loai = ?, soSua = ?,
         mood = ?, kieuNguon = ?, nguon = ?, tacGia = ?, link = ?, trich = ? WHERE ma = ?`
    ).bind(chu, ngay, loai, soSua, k.mood, k.kieuNguon, k.nguon, k.tacGia, k.link,
           k.trich ? 1 : 0, ma).run();
    return traLoi({ ...k, ma, ngay, loai, chu, soSua,
                    conSua: TOI_DA_SUA - soSua }, 200, 'no-store', false);
  }
  /* Ghim / bỏ ghim — không tính lượt sửa, như ẩn. Hết chỗ thì 409 và nói rõ
     phải bỏ ghim cái nào trước: tự gỡ cái cũ nhất thì một cú bấm lặng lẽ đổi
     cả trang mà người bấm không hề biết. */
  if ('ghim' in than) {
    if (than.ghim && !dong.ghim && !(await conChoGhim(env, ma))) {
      return traLoi({ loi: 'het-cho-ghim', toiDaGhim: TOI_DA_GHIM }, 409, 'no-store', false);
    }
    await env.DB.prepare('UPDATE ghi_chu SET ghim = ? WHERE ma = ?')
      .bind(than.ghim ? 1 : 0, ma).run();
    return traLoi({ ma, ghim: than.ghim ? 1 : 0 }, 200, 'no-store', false);
  }
  if ('an' in than) {
    await env.DB.prepare('UPDATE ghi_chu SET an = ? WHERE ma = ?')
      .bind(than.an ? 1 : 0, ma).run();
    return traLoi({ ma, an: than.an ? 1 : 0 }, 200, 'no-store', false);
  }
  if ('xoa' in than && !than.xoa) {
    await env.DB.prepare(`UPDATE ghi_chu SET xoa = 0, xoaLuc = '' WHERE ma = ?`).bind(ma).run();
    return traLoi({ ma, xoa: 0 }, 200, 'no-store', false);
  }
  return traLoi({ loi: 'không có gì để đổi' }, 400, 'no-store', false);
}

/* Mặc định là xoá MỀM: `xoa = 1` cộng `xoaLuc`, tức vào thùng rác. Nằm đó
   HAN_RAC ngày thì lượt mở ngăn Note kế tiếp xoá cứng nó.

   `?vinhVien=1` — nút "Delete forever" của ngăn Trash: xoá cứng ngay, và CHỈ
   xoá được dòng đã nằm trong thùng.

   `?vinhVien=1&keo=1` — `npm run gc` dùng sau khi đã chép ghi chú về
   `content/ghi-chu.md`. Lúc ấy bản D1 chỉ là bản thừa; để nó vào thùng rác
   thì ngăn Trash đầy những dòng mà bấm Restore là ra một bản trùng. */
export async function onRequestDelete({ request, env }) {
  if (!env.DB) return traLoi({ loi: 'chưa gắn D1' }, 503, 'no-store', false);
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!duocGhi(request, env)) return traLoi({ loi: 'sai khoá' }, 401, 'no-store', false);

  const ma = locMa(new URL(request.url).searchParams.get('ma'));
  if (!ma) return traLoi({ loi: 'thiếu mã' }, 400, 'no-store', false);

  await noiRongBang(env);
  const q = new URL(request.url).searchParams;
  if (q.get('vinhVien') === '1') {
    await env.DB.prepare(
      q.get('keo') === '1' ? 'DELETE FROM ghi_chu WHERE ma = ?'
                           : 'DELETE FROM ghi_chu WHERE ma = ? AND xoa = 1').bind(ma).run();
    return traLoi({ ma, xoa: true, vinhVien: true }, 200, 'no-store', false);
  }
  /* Vào thùng rác thì nhả cờ ghim: một ghi chú đã xoá không được giữ một
     trong hai chỗ ghim. Cứu ra thì nó về như ghi chú thường. */
  await env.DB.prepare('UPDATE ghi_chu SET xoa = 1, xoaLuc = ?, ghim = 0 WHERE ma = ?')
    .bind(new Date().toISOString(), ma).run();
  return traLoi({ ma, xoa: true }, 200, 'no-store', false);
}
