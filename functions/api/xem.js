/* ============================================================
   /api/xem — đếm lượt xem thật.

   ── VÌ SAO KHÔNG DÙNG CLOUDFLARE WEB ANALYTICS ─────────────────────────
   Web Analytics đếm rất tốt, nhưng nó KHÔNG CÓ API ĐỌC NGƯỢC: số liệu chỉ
   xem được trên bảng điều khiển, không lấy ra đổ vào trang được. Muốn in con
   số lên chính bài viết thì phải tự giữ lấy nó.

   ── VÌ SAO D1 CHỨ KHÔNG PHẢI KV ────────────────────────────────────────
   KV giới hạn MỖI KHOÁ một lượt ghi mỗi giây. Một bộ đếm lượt xem là đúng
   cái kiểu ghi ấy — nhiều lượt ghi vào cùng một khoá — nên KV sai việc ngay
   từ hình dạng. D1 là SQLite, `UPDATE ... SET so = so + 1` là một phép cộng
   nguyên tử, đúng thứ cần.

   ── NHỮNG GÌ NÓ KHÔNG HỨA ──────────────────────────────────────────────
   Đây là con số GẦN ĐÚNG, và nói thẳng ra như thế còn hơn giả vờ chính xác:
     · bot cào trang cũng bị tính — chặn được phần nào bằng cách chỉ đếm khi
       trình duyệt CHẠY JavaScript, nhưng bot biết chạy JS thì vẫn lọt;
     · một người mở lại trang trong cùng phiên chỉ tính một lần (phía trình
       duyệt tự chặn bằng sessionStorage), nhưng mở tab mới thì tính lại;
     · không biết ai là ai, và cố ý không biết: không cookie, không dấu vết.

   ── BẢNG TỰ TẠO, KHÔNG PHẢI CHẠY SQL TAY ──────────────────────────────
     CREATE TABLE IF NOT EXISTS xem (
       u   TEXT PRIMARY KEY,
       so  INTEGER NOT NULL DEFAULT 0,
       sua TEXT
     );

   Bản trước bắt chủ trang tự chạy câu ấy trong Console của D1. Quên một bước
   trong tài liệu thì hàm này NỔ 500 ở mọi lượt mở bài — và nổ lặng lẽ, vì phía
   trình duyệt nuốt mọi lỗi để không làm đỏ console của người đọc. Trang nhìn
   vẫn bình thường, chỉ thiếu con số, còn log Worker thì đầy 500.

   Nay lượt GHI đầu tiên tự tạo bảng, và mọi lượt ĐỌC bọc trong try/catch —
   bảng chưa có nghĩa là chưa ai xem, tức là 0, không phải lỗi. Giống hệt cách
   /api/ghi-chu và /api/binh-luan làm; để riêng hàm này đòi một bước tay là
   chỗ sớm muộn có người vấp.

   Các bước gắn D1 vào dự án: docs/CAI-DAT.md §5.
   ============================================================ */

const TAO = `CREATE TABLE IF NOT EXISTS xem (
  u   TEXT PRIMARY KEY,
  so  INTEGER NOT NULL DEFAULT 0,
  sua TEXT
)`;

const CORS = { 'Access-Control-Allow-Origin': '*' };

function traLoi(data, ma = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status: ma,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': cache, ...CORS }
  });
}

/* Chỉ nhận đường dẫn nội bộ dạng `/posts/…/`. Không lọc thì ai cũng bơm được
   hàng nghìn dòng rác vào bảng bằng cách gọi với đường dẫn tự chế. */
function sach(u) {
  const s = String(u || '').trim();
  if (!/^\/[A-Za-z0-9\-._~/]*$/.test(s)) return null;
  if (s.length > 200 || s.includes('//') || s.includes('..')) return null;
  return s;
}

export async function onRequest(context) {
  const { request, env } = context;

  /* Chưa gắn D1 thì trả về "tắt" chứ không trả lỗi: trang gọi xong thấy `tat`
     là im lặng bỏ qua, hàng meta chỉ ngắn đi một mục. Một tính năng phụ không
     được phép làm trang đỏ console của người đọc. */
  if (!env.DB) return traLoi({ tat: true });

  const url = new URL(request.url);

  /* ĐỌC NHIỀU: `?ds=/a/,/b/` — trang danh sách cần vài chục con số một lúc, và
     gọi vài chục lần thì vừa chậm vừa tốn hạn ngạch. */
  const ds = url.searchParams.get('ds');
  if (ds) {
    const khoa = ds.split(',').map(sach).filter(Boolean).slice(0, 60);
    if (!khoa.length) return traLoi({ so: {} });
    const hoi = khoa.map(() => '?').join(',');
    let kq;
    try {
      kq = await env.DB.prepare(
        `SELECT u, so FROM xem WHERE u IN (${hoi})`).bind(...khoa).all();
    } catch (e) {
      /* Bảng chưa có = chưa ai xem bài nào. Trả rỗng, thẻ không hiện số. */
      return traLoi({ so: {} }, 200, 'public, max-age=60');
    }
    const so = {};
    for (const r of (kq.results || [])) so[r.u] = r.so;
    /* Cache 60 giây ở biên: lượt xem không cần chính xác tới từng giây, mà một
       trang danh sách thì gọi rất nhiều. */
    return traLoi({ so }, 200, 'public, max-age=60');
  }

  /* ── XEM NHIỀU NHẤT: `?top=n` ──
     Trang chủ xếp mục lục theo "một bài mới nhất + hai bài nhiều lượt xem nhất
     mọi thời điểm". Bài mới nhất thì lúc dựng trang đã biết; còn bài nhiều
     lượt xem thì chỉ D1 biết, và D1 chỉ đọc được lúc chạy — nên phải có một
     cửa đọc ngược như cửa này.

     `ORDER BY so DESC, u ASC` — phải có khoá phụ. Chỉ xếp theo `so` thì hai
     bài bằng điểm sẽ đổi chỗ nhau giữa hai lượt gọi, và mục lục trang chủ
     nhảy chỗ mỗi lần tải mà không ai hiểu vì sao.

     Cache 300 giây: "nhiều nhất mọi thời điểm" không đổi trong năm phút, mà
     trang chủ thì bị gọi nhiều nhất trong cả site. */
  const top = url.searchParams.get('top');
  if (top !== null) {
    const n = Math.max(1, Math.min(20, parseInt(top, 10) || 3));
    let kq;
    try {
      kq = await env.DB.prepare(
        'SELECT u, so FROM xem WHERE so > 0 ORDER BY so DESC, u ASC LIMIT ?'
      ).bind(n).all();
    } catch (e) {
      /* Bảng chưa có = chưa ai xem bài nào. Trả rỗng thì trang chủ giữ nguyên
         ba bài mới nhất — đúng trạng thái cần. */
      return traLoi({ top: [] }, 200, 'public, max-age=300');
    }
    return traLoi({ top: (kq.results || []).map((r) => ({ u: r.u, so: r.so })) },
                  200, 'public, max-age=300');
  }

  const u = sach(url.searchParams.get('u'));
  if (!u) return traLoi({ loi: 'thiếu u' }, 400);

  /* `ghi=1` mới cộng. Mặc định chỉ đọc — nhờ vậy một lần rê chuột hay một lần
     lấy trước trang (prefetch) không tự nhiên thành một lượt xem. */
  if (url.searchParams.get('ghi') === '1') {
    /* CREATE đi CÙNG LÔ với INSERT, không phải một lượt gọi riêng: một lô là
       một vòng tới cơ sở dữ liệu, mà lượt ghi này chạy ở mọi lượt mở bài. */
    await env.DB.batch([
      env.DB.prepare(TAO),
      env.DB.prepare(
        `INSERT INTO xem (u, so, sua) VALUES (?, 1, ?)
         ON CONFLICT(u) DO UPDATE SET so = so + 1, sua = excluded.sua`
      ).bind(u, new Date().toISOString())
    ]);
  }

  let r = null;
  try {
    r = await env.DB.prepare('SELECT so FROM xem WHERE u = ?').bind(u).first();
  } catch (e) { /* bảng chưa có ⇒ chưa ai xem ⇒ 0 */ }
  return traLoi({ u, so: r ? r.so : 0 });
}
