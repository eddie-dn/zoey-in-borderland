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
   GET để `*` cho thoải mái. POST/DELETE thì KHÔNG khai
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
       xoa  INTEGER NOT NULL DEFAULT 0
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

const TAO = [
  `CREATE TABLE IF NOT EXISTS ghi_chu (
     ma   TEXT PRIMARY KEY,
     ngay TEXT NOT NULL,
     loai TEXT NOT NULL DEFAULT '',
     chu  TEXT NOT NULL,
     luc  TEXT NOT NULL,
     xoa  INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS ghi_chu_moi ON ghi_chu (xoa, ngay DESC)`
];

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

export async function onRequestGet({ env }) {
  if (!env.DB) return traLoi({ tat: true });
  let kq;
  try {
    kq = await env.DB.prepare(
      `SELECT ma, ngay, loai, chu FROM ghi_chu
        WHERE xoa = 0 ORDER BY ngay DESC, luc DESC LIMIT ?`).bind(LAY).all();
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

  await env.DB.batch([
    ...TAO.map((sql) => env.DB.prepare(sql)),
    env.DB.prepare(
      `INSERT INTO ghi_chu (ma, ngay, loai, chu, luc, xoa)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(ma) DO UPDATE SET
         ngay = excluded.ngay, loai = excluded.loai,
         chu  = excluded.chu,  luc  = excluded.luc, xoa = 0`
    ).bind(ma, ngay, loai, chu, luc)
  ]);

  return traLoi({ ma, ngay, loai, chu }, 200, 'no-store', false);
}

/* Xoá MỀM. Ghi chú đã kéo về Markdown rồi mà xoá cứng ở đây thì không còn dấu
   vết nào để biết dòng nào từng ở đâu; đánh dấu `xoa=1` thì bảng vẫn kể lại
   được, và `tools/ghi-chu-keo.mjs` biết mà bỏ qua. */
export async function onRequestDelete({ request, env }) {
  if (!env.DB) return traLoi({ loi: 'chưa gắn D1' }, 503, 'no-store', false);
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!duocGhi(request, env)) return traLoi({ loi: 'sai khoá' }, 401, 'no-store', false);

  const ma = locMa(new URL(request.url).searchParams.get('ma'));
  if (!ma) return traLoi({ loi: 'thiếu mã' }, 400, 'no-store', false);

  await env.DB.prepare('UPDATE ghi_chu SET xoa = 1 WHERE ma = ?').bind(ma).run();
  return traLoi({ ma, xoa: true }, 200, 'no-store', false);
}
