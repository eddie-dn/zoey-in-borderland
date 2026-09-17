/* ============================================================
   /api/binh-luan — bình luận chạy thẳng trên Cloudflare D1.

   ── VÌ SAO KHÔNG CÒN GOOGLE APPS SCRIPT ───────────────────────────────
   Bản trước để Apps Script lo hết: nhận bình luận, ghi vào Google Sheet, và
   trả bình luận về cho trang. Cái sai không nằm ở Apps Script — nó nằm ở chỗ
   Apps Script ĐỨNG TRÊN ĐƯỜNG ĐỌC. Mỗi người mở một bài đều phải đợi một lượt
   gọi sang Google (khởi động nguội 1–3 giây, và không cache được ở biên) chỉ
   để lấy về mấy dòng bình luận. Đổi lại được đúng một thứ: chủ trang duyệt bài
   bằng cách tick một ô trong bảng tính.

   Nay D1 lo phần chạy trang — cùng nhà với hosting, đọc nhanh, cache 30 giây ở
   biên — còn việc duyệt chuyển hẳn lên chính trang web (xem `#duyet` trong
   src/js/comments.js). Bớt một dịch vụ, bớt một chiều đồng bộ, và chủ trang
   duyệt được từ điện thoại mà không phải mở bảng tính nào.

   ── BA ĐIỀU GIỮ NGUYÊN TỪ BẢN CŨ ──────────────────────────────────────
   1. EMAIL KHÔNG BAO GIỜ RA KHỎI CƠ SỞ DỮ LIỆU. Không câu lệnh SELECT nào ở
      đây đọc cột email — kể cả lượt gọi của chủ trang. Nó chỉ để chủ trang mở
      D1 ra tra khi cần liên hệ lại, không phải thứ đi qua mạng.
   2. KHÔNG BÌNH LUẬN NÀO TỰ LÊN TRANG. Mọi dòng vào bảng đều `duyet = 0`. Đây
      là lớp chặn spam thật sự; mấy phép kiểm dưới đây chỉ lọc bớt cho đỡ rác.
   3. CÂY CHỈ HAI TẦNG. Máy chủ trả về danh sách PHẲNG kèm `cha`; trình duyệt
      tự dựng cây. Việc ấy tốn một phần nghìn giây ở máy người đọc.

   ── KHOÁ CHỦ TRANG DÙNG CHUNG VỚI GHI CHÚ ─────────────────────────────
   Vẫn hai biến `GC_ID` + `GC_KEY` như /api/ghi-chu. Một cặp khoá cho mọi quyền
   của chủ trang: nhớ một chỗ, đổi một chỗ. Đặt thêm một cặp nữa chỉ để riêng
   cho bình luận là thêm một thứ để quên.

   ── BẢNG CẦN TẠO ──────────────────────────────────────────────────────
     CREATE TABLE IF NOT EXISTS binh_luan (
       ma       TEXT PRIMARY KEY,
       trang    TEXT NOT NULL,
       ten      TEXT NOT NULL,
       email    TEXT NOT NULL DEFAULT '',
       chu      TEXT NOT NULL,
       cha      TEXT NOT NULL DEFAULT '',
       chuTrang INTEGER NOT NULL DEFAULT 0,
       duyet    INTEGER NOT NULL DEFAULT 0,
       an       INTEGER NOT NULL DEFAULT 0,
       luc      TEXT NOT NULL
     );
     CREATE INDEX IF NOT EXISTS bl_trang ON binh_luan (trang, duyet, an, luc);

   Không phải chạy tay: lượt gửi đầu tiên tự tạo. Chép ra đây để đọc code là
   biết bảng có gì. Các bước gắn D1 và đặt khoá: docs/CAI-DAT.md §1.
   ============================================================ */

const MAX_TEN   = 60;
const MAX_EMAIL = 120;
const MAX_CHU   = 2000;
const MIN_CHU   = 2;
const GIAY_TOI_THIEU = 3;    /* mở form dưới 3 giây đã gửi ⇒ gần như chắc là bot */
const LAY       = 300;

const TAO = [
  `CREATE TABLE IF NOT EXISTS binh_luan (
     ma       TEXT PRIMARY KEY,
     trang    TEXT NOT NULL,
     ten      TEXT NOT NULL,
     email    TEXT NOT NULL DEFAULT '',
     chu      TEXT NOT NULL,
     cha      TEXT NOT NULL DEFAULT '',
     chuTrang INTEGER NOT NULL DEFAULT 0,
     duyet    INTEGER NOT NULL DEFAULT 0,
     an       INTEGER NOT NULL DEFAULT 0,
     luc      TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS bl_trang ON binh_luan (trang, duyet, an, luc)`
];

/* ── HAI CỘT THÊM SAU, PHẢI DÙNG `ALTER TABLE` ──
   `CREATE TABLE IF NOT EXISTS` KHÔNG thêm cột vào một bảng đã có: nó thấy
   bảng tồn tại rồi là bỏ qua cả câu. Bảng `binh_luan` đã chạy thật với dữ
   liệu thật, nên hai cột này phải đi bằng `ALTER TABLE`.

   Chạy RIÊNG từng câu trong try/catch, KHÔNG gộp vào `batch`: lần thứ hai trở
   đi thì cột đã có và SQLite ném lỗi — mà trong một batch thì một câu lỗi là
   cả batch hỏng, tức là mọi bình luận thôi gửi được kể từ lượt deploy thứ hai.
   SQLite không có `ADD COLUMN IF NOT EXISTS`, nên nuốt lỗi là cách đúng. */
const THEM_COT = [
  `ALTER TABLE binh_luan ADD COLUMN mtSua TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE binh_luan ADD COLUMN soSua INTEGER NOT NULL DEFAULT 0`
];

async function noiRongBang(env) {
  for (const sql of THEM_COT) {
    try { await env.DB.prepare(sql).run(); } catch (e) { /* cột đã có */ }
  }
}

/* Băm mã sửa trước khi lưu. Lưu thẳng thì ai đọc được bảng là sửa được lời
   của mọi người — mà bảng ấy còn đi qua mọi bản sao lưu. Băm rồi thì cái nằm
   trong D1 không mở được cửa nào. */
async function bam(chuoi) {
  const bit = new TextEncoder().encode(String(chuoi));
  const ra  = await crypto.subtle.digest('SHA-256', bit);
  return [...new Uint8Array(ra)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Trần số lần sửa. Ba là đủ cho lỗi chính tả và một lần nghĩ lại; trên nữa thì
   nó thôi là "sửa" mà thành "viết lại", và người đã trả lời bên dưới đang trả
   lời một câu không còn tồn tại. */
const TOI_DA_SUA = 3;

function traLoi(data, ma = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status: ma,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': cache }
  });
}

/* Chạy hết chuỗi dài nhất trong hai chuỗi, không thoát sớm — `===` thoát ngay
   ký tự đầu khác nhau, và thời gian thoát ấy rò rỉ ra bao nhiêu ký tự đầu đã
   đúng. Cùng hàm với /api/ghi-chu; chép sang đây chứ không tách ra file chung
   vì mỗi hàm trong functions/ là một gói riêng, `import` chéo giữa chúng thì
   Pages phải gộp — mà đoạn này có mười dòng. */
function bang(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  let lech = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    lech |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return lech === 0;
}

/* Thiếu một vế khoá ở phía máy chủ là CHẶN hết, không phải mở hết. */
function chuaDatKhoa(env) { return !env.GC_ID || !env.GC_KEY; }

/* Chưa đặt khoá ở Cloudflare KHÁC với gõ sai khoá — xem chú thích cùng tên
   trong bai.js. Bàn duyệt phải phân biệt được hai câu ấy, không thì chủ trang
   ngồi gõ lại khoá cả buổi cho một thứ không nằm ở chỗ mình gõ. */
const LOI_CHUA_DAT = { ok: false, loi: 'cauhinh',
  chiTiet: 'Máy chủ chưa đặt GC_ID và GC_KEY. Cloudflare → Settings → Runtime '
         + '→ Variables and Secrets (KHÔNG phải mục Builds).' };

function laChuTrang(request, env) {
  if (chuaDatKhoa(env)) return false;
  return bang(request.headers.get('x-gc-id'), env.GC_ID)
      && bang(request.headers.get('x-gc-key'), env.GC_KEY);
}

/* Chỉ nhận đường dẫn nội bộ. Không lọc thì ai cũng bơm được hàng nghìn dòng
   rác vào bảng bằng cách gọi với một đường dẫn tự chế. */
function sachTrang(u) {
  const s = String(u || '').trim();
  if (!/^\/[A-Za-z0-9\-._~/]*$/.test(s)) return null;
  if (s.length > 200 || s.includes('//') || s.includes('..')) return null;
  return s;
}

function locMa(v) {
  const s = String(v || '').trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(s) ? s : null;
}

function gonChu(v, max) {
  /* Bỏ ký tự điều khiển (trừ xuống dòng và tab) rồi mới cắt: dán từ một trang
     web khác vào ô nhập là kéo theo đủ thứ ký tự vô hình. */
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim().slice(0, max);
}

/* ══════════ ĐỌC ══════════ */
export async function onRequestGet({ request, env }) {
  if (!env.DB) return traLoi({ ok: true, ds: [], tat: true });
  const url = new URL(request.url);
  const cho = url.searchParams.get('cho') === '1';

  /* HÀNG CHỜ của chủ trang: mọi bình luận chưa duyệt, TOÀN TRANG chứ không
     riêng một bài. Duyệt từ điện thoại thì không ai muốn mở từng bài một để
     xem bài nào có gì đang chờ. */
  if (cho) {
    if (chuaDatKhoa(env)) return traLoi(LOI_CHUA_DAT, 503);
  if (!laChuTrang(request, env)) return traLoi({ ok: false, loi: 'sai khoá' }, 401);
    try {
      const kq = await env.DB.prepare(
        `SELECT ma, trang, ten, chu, cha, chuTrang, duyet, luc, soSua FROM binh_luan
          WHERE an = 0 ORDER BY duyet ASC, luc DESC LIMIT ?`).bind(LAY).all();
      return traLoi({ ok: true, ds: kq.results || [] });
    } catch (e) {
      return traLoi({ ok: true, ds: [] });
    }
  }

  const trang = sachTrang(url.searchParams.get('url'));
  if (!trang) return traLoi({ ok: false, loi: 'thiếu url' }, 400);

  let kq;
  try {
    kq = await env.DB.prepare(
      `SELECT ma, ten, chu AS noiDung, cha, chuTrang AS chu, luc FROM binh_luan
        WHERE trang = ? AND duyet = 1 AND an = 0 ORDER BY luc ASC LIMIT ?`
    ).bind(trang, LAY).all();
  } catch (e) {
    /* Bảng chưa có (chưa ai bình luận) là chuyện bình thường, không phải lỗi. */
    return traLoi({ ok: true, ds: [] }, 200, 'public, max-age=30');
  }
  /* Cache 30 giây ở biên. Một bình luận chậm nửa phút mới hiện với người lạ là
     chấp nhận được; chính người vừa gửi thì thấy câu báo "đang chờ duyệt", nên
     họ không ngồi tải lại trang chờ nó xuất hiện. */
  return traLoi({ ok: true, ds: kq.results || [] }, 200, 'public, max-age=30');
}

/* ══════════ GỬI ══════════ */
export async function onRequestPost({ request, env }) {
  if (!env.DB) return traLoi({ ok: false, loi: 'chưa gắn D1' }, 503);

  let than;
  try { than = await request.json(); } catch (e) { than = null; }
  if (!than || typeof than !== 'object') return traLoi({ ok: false, loi: 'thân rỗng' }, 400);

  /* ── BẪY BOT ──
     Ô `hp` ẩn khỏi mắt người nhưng bot đọc HTML thì thấy và điền vào. Và mở
     form chưa tới 3 giây đã gửi xong thì không phải người gõ.
     Trả về `ok:true` chứ không báo lỗi: nói thẳng "mày là bot" là chỉ cho
     người viết bot biết cần sửa gì. */
  if (gonChu(than.hp, 10)) return traLoi({ ok: true, boQua: true });
  if (Number(than.giay) < GIAY_TOI_THIEU) return traLoi({ ok: true, boQua: true });

  const trang = sachTrang(than.url);
  if (!trang) return traLoi({ ok: false, loi: 'thiếu url' }, 400);

  const chu = gonChu(than.noiDung, MAX_CHU);
  if (chu.length < MIN_CHU) return traLoi({ ok: false, loi: 'ngắn quá' }, 400);

  const ten   = gonChu(than.ten, MAX_TEN);
  const email = gonChu(than.email, MAX_EMAIL);
  const cha   = locMa(than.traLoiCho) || '';

  /* Chủ trang gửi kèm khoá thì bình luận vào thẳng, có huy hiệu, khỏi chờ
     duyệt — chủ nhà không phải tự duyệt lời của chính mình. */
  const laChu = laChuTrang(request, env);

  const ma = 'bl' + Date.now().toString(36) +
             Math.random().toString(36).slice(2, 8);

  /* Mã sửa do TRÌNH DUYỆT sinh và giữ; ở đây chỉ lưu bản băm. Không có mã thì
     bình luận vẫn vào bình thường, chỉ là về sau không sửa được — người tắt
     `localStorage` không vì thế mà mất đường nói. */
  const mtSua = than.maSua ? await bam(gonChu(than.maSua, 80)) : '';

  await env.DB.batch([
    ...TAO.map((sql) => env.DB.prepare(sql))
  ]);
  await noiRongBang(env);
  await env.DB.prepare(
    `INSERT INTO binh_luan (ma, trang, ten, email, chu, cha, chuTrang, duyet, an, luc, mtSua, soSua)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`
  ).bind(ma, trang, ten, email, chu, cha, laChu ? 1 : 0, laChu ? 1 : 0,
         new Date().toISOString(), mtSua).run();

  return traLoi({ ok: true, ma, chuTrang: laChu, duyet: laChu, conSua: TOI_DA_SUA });
}

/* ══════════ NGƯỜI GÕ TỰ SỬA LỜI MÌNH ══════════

   Đường này KHÔNG dùng khoá chủ trang — nó dành cho người đọc bình thường,
   sửa đúng bình luận của chính họ.

   ── XÁC THỰC MÀ KHÔNG CÓ TÀI KHOẢN ──
   Lúc gửi, trình duyệt sinh một chuỗi ngẫu nhiên, gửi kèm, rồi cất vào
   `localStorage` của chính máy ấy. Máy chủ chỉ lưu bản BĂM. Muốn sửa thì gửi
   lại chuỗi gốc; băm ra khớp thì đúng là cái máy đã gõ.

   Nó KHÔNG chứng minh "đúng người" — xoá lịch sử trình duyệt là mất quyền
   sửa, và ai mượn được máy thì sửa được. Đúng mức bảo đảm cần cho một ô bình
   luận không tài khoản: đủ để không ai sửa được lời người khác từ xa, và
   không đòi ai phải đăng ký gì.

   ── VÌ SAO DÙNG PUT CHỨ KHÔNG THÊM NHÁNH VÀO PATCH ──
   PATCH là cửa của chủ trang và câu đầu tiên của nó là "sai khoá thì 401".
   Nhét một nhánh không cần khoá vào đó thì câu ấy thôi đúng, và lần sửa sau
   rất dễ nới nhầm quyền cho cả nhánh duyệt/ẩn. Hai mức quyền khác nhau thì
   hai cửa khác nhau.

   ── SỬA THÌ VỀ LẠI HÀNG CHỜ ──
   Bình luận đã duyệt mà sửa nội dung thì phải duyệt lại: không thì đây là
   đường vòng để đăng bất cứ thứ gì — gửi một câu hiền, chờ duyệt, rồi sửa
   thành thứ khác. Chủ trang gửi kèm khoá thì miễn, vì lời của chủ nhà vốn
   không qua hàng chờ. */
export async function onRequestPut({ request, env }) {
  if (!env.DB) return traLoi({ ok: false, loi: 'chưa gắn D1' }, 503);

  let than;
  try { than = await request.json(); } catch (e) { than = null; }
  const ma = locMa(than && than.ma);
  if (!ma) return traLoi({ ok: false, loi: 'thiếu mã' }, 400);

  const chu = gonChu(than.noiDung, MAX_CHU);
  if (chu.length < MIN_CHU) return traLoi({ ok: false, loi: 'ngắn quá' }, 400);

  await noiRongBang(env);
  const dong = await env.DB.prepare(
    'SELECT mtSua, soSua, an FROM binh_luan WHERE ma = ?').bind(ma).first();
  if (!dong || dong.an) return traLoi({ ok: false, loi: 'không có' }, 404);

  if (!dong.mtSua) return traLoi({ ok: false, loi: 'khong-sua-duoc' }, 403);
  const gui = await bam(gonChu(than.maSua, 80));
  if (!bang(gui, dong.mtSua)) return traLoi({ ok: false, loi: 'khong-phai-cua-ban' }, 403);

  if (Number(dong.soSua) >= TOI_DA_SUA) {
    return traLoi({ ok: false, loi: 'het-luot-sua', conSua: 0 }, 409);
  }

  const laChu = laChuTrang(request, env);
  const soMoi = Number(dong.soSua) + 1;
  await env.DB.prepare(
    'UPDATE binh_luan SET chu = ?, soSua = ?, duyet = ? WHERE ma = ?'
  ).bind(chu, soMoi, laChu ? 1 : 0, ma).run();

  return traLoi({ ok: true, ma, soSua: soMoi, conSua: TOI_DA_SUA - soMoi,
                  duyet: laChu ? 1 : 0 });
}

/* ══════════ DUYỆT · ẨN ══════════
   Một cửa cho cả hai việc, vì cả hai đều là "đổi một cờ của một dòng". Tách
   thành hai đường thì phía trình duyệt phải nhớ gọi đường nào cho việc nào. */
export async function onRequestPatch({ request, env }) {
  if (!env.DB) return traLoi({ ok: false, loi: 'chưa gắn D1' }, 503);
  if (chuaDatKhoa(env)) return traLoi(LOI_CHUA_DAT, 503);
  if (!laChuTrang(request, env)) return traLoi({ ok: false, loi: 'sai khoá' }, 401);

  let than;
  try { than = await request.json(); } catch (e) { than = null; }
  const ma = locMa(than && than.ma);
  if (!ma) return traLoi({ ok: false, loi: 'thiếu mã' }, 400);

  const dat = [];
  const tham = [];
  if ('duyet' in than) { dat.push('duyet = ?'); tham.push(than.duyet ? 1 : 0); }
  if ('an' in than)    { dat.push('an = ?');    tham.push(than.an ? 1 : 0); }
  if (!dat.length) return traLoi({ ok: false, loi: 'không có gì để đổi' }, 400);

  tham.push(ma);
  await env.DB.prepare(
    `UPDATE binh_luan SET ${dat.join(', ')} WHERE ma = ?`).bind(...tham).run();

  return traLoi({ ok: true, ma });
}

/* Xoá MỀM, cùng lý do với ghi chú: đánh dấu thì bảng vẫn kể lại được chuyện gì
   đã xảy ra, còn xoá cứng thì không. Dọn hẳn thì vào Console của D1 mà DELETE. */
export async function onRequestDelete({ request, env }) {
  if (!env.DB) return traLoi({ ok: false, loi: 'chưa gắn D1' }, 503);
  if (chuaDatKhoa(env)) return traLoi(LOI_CHUA_DAT, 503);
  if (!laChuTrang(request, env)) return traLoi({ ok: false, loi: 'sai khoá' }, 401);

  const ma = locMa(new URL(request.url).searchParams.get('ma'));
  if (!ma) return traLoi({ ok: false, loi: 'thiếu mã' }, 400);

  await env.DB.prepare('UPDATE binh_luan SET an = 1 WHERE ma = ?').bind(ma).run();
  return traLoi({ ok: true, ma, an: true });
}
