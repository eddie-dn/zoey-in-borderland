/* ============================================================
   /api/thich — nút trái tim dưới mỗi bài.

   ── VÌ SAO CÓ NÓ, KHI ĐÃ CÓ BÌNH LUẬN ────────────────────────────────
   Bình luận đòi người đọc phải nghĩ ra một câu. Phần lớn người thích một bài
   thì không có câu nào để nói — họ chỉ muốn nói "tôi có đọc, và nó chạm".
   Bắt họ hoặc viết một đoạn hoặc im lặng là mất hết nhóm ở giữa, vốn là nhóm
   đông nhất.

   ── MỘT NGƯỜI MỘT LƯỢT, VÀ ĐÓ LÀ MỘT LỜI HỨA MỀM ─────────────────────
   Chỗ nhớ "máy này đã thích bài này chưa" nằm ở localStorage của TRÌNH DUYỆT,
   không ở máy chủ. Nghĩa là xoá dữ liệu trang, mở chế độ ẩn danh, hay đổi máy
   là thích lại được.

   Cố ý không chặn chặt hơn. Chặn chặt cần một thứ định danh người đọc — địa
   chỉ IP băm ra, hay một cookie sống lâu — và cả hai đều là theo dấu người
   đọc. Một blog cá nhân đổi quyền riêng tư của người đọc lấy độ chính xác của
   một con số đếm tim là đổi hớ.

   Con số này vì thế là con số GẦN ĐÚNG, đúng như lượt xem. Nó nói "có chừng
   này người thấy hay", không nói "đúng chừng này người".

   ── BẢNG CẦN TẠO ─────────────────────────────────────────────────────
     CREATE TABLE IF NOT EXISTS thich (
       u   TEXT PRIMARY KEY,
       so  INTEGER NOT NULL DEFAULT 0,
       sua TEXT
     );
   Không phải chạy tay: lượt ghi đầu tiên tự tạo bảng. Chép ra đây để đọc mã
   là biết bảng có gì. Dùng chung cơ sở dữ liệu D1 với lượt xem, ghi chú và
   bình luận — cùng biến `DB`.
   ============================================================ */

const TAO = `CREATE TABLE IF NOT EXISTS thich (
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

/* Chỉ nhận đường dẫn nội bộ. Không lọc thì ai cũng bơm được hàng nghìn dòng
   rác vào bảng bằng cách gọi với một đường dẫn tự chế. Cùng hàm với
   functions/api/xem.js — chép lại vì mỗi hàm trong functions/ là một gói
   riêng, và mười dòng thì chép rẻ hơn một file dùng chung. */
function sach(u) {
  const s = String(u || '').trim();
  if (!/^\/[A-Za-z0-9\-._~/]*$/.test(s)) return null;
  if (s.length > 200 || s.includes('//') || s.includes('..')) return null;
  return s;
}

export async function onRequest(context) {
  const { request, env } = context;

  /* Chưa gắn D1 thì trả "tắt" chứ không trả lỗi: trang thấy `tat` là ẩn luôn
     nút tim đi. Một tính năng phụ không được phép làm đỏ console người đọc,
     và một nút bấm vào chẳng để làm gì thì thà đừng bày. */
  if (!env.DB) return traLoi({ tat: true });

  const url = new URL(request.url);
  const u = sach(url.searchParams.get('u'));
  if (!u) return traLoi({ loi: 'thiếu u' }, 400);

  if (request.method === 'POST') {
    /* `bo=1` là BỎ thích. Một đường cho cả hai chiều: nút này là công tắc,
       mà hai đường cho hai chiều của một công tắc thì sớm muộn lệch nhau. */
    const bo = url.searchParams.get('bo') === '1';
    await env.DB.batch([
      env.DB.prepare(TAO),
      bo
        /* `MAX(so - 1, 0)`: không để con số âm. Xoá dữ liệu trang rồi bấm bỏ
           thích là gửi một lượt trừ mà chưa từng có lượt cộng nào — hiếm,
           nhưng một lần xảy ra là con số hỏng vĩnh viễn. */
        ? env.DB.prepare(
            `UPDATE thich SET so = MAX(so - 1, 0), sua = ? WHERE u = ?`
          ).bind(new Date().toISOString(), u)
        : env.DB.prepare(
            `INSERT INTO thich (u, so, sua) VALUES (?, 1, ?)
             ON CONFLICT(u) DO UPDATE SET so = so + 1, sua = excluded.sua`
          ).bind(u, new Date().toISOString())
    ]);
  }

  let r = null;
  try {
    r = await env.DB.prepare('SELECT so FROM thich WHERE u = ?').bind(u).first();
  } catch (e) { /* bảng chưa có ⇒ chưa ai thích ⇒ 0 */ }

  /* Lượt ĐỌC cache 30 giây ở biên; lượt GHI thì không, vì người vừa bấm phải
     thấy con số của chính mình đổi ngay. */
  return traLoi({ u, so: r ? r.so : 0 },
                200, request.method === 'POST' ? 'no-store' : 'public, max-age=30');
}
