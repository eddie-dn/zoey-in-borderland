/* ============================================================
   WORKER — cửa vào khi trang chạy dưới dạng Cloudflare **Worker**
   (tên miền …workers.dev), chứ không phải Cloudflare **Pages**
   (tên miền …pages.dev).

   ── VÌ SAO CẦN FILE NÀY ───────────────────────────────────────────────
   Thư mục `functions/` là quy ước của RIÊNG Pages: Pages đọc nó, lấy tên file
   làm đường dẫn, và tự dựng đường đi. Worker thì không — Worker chỉ có đúng
   MỘT cửa vào, và mọi thứ khác phải tự định tuyến.

   Triệu chứng khi thiếu file này mà lại chạy dưới dạng Worker: trang tĩnh mở
   bình thường, nhưng `/api/...` trả 404 hết. Không có lỗi nào trong log, vì
   với Worker thì mấy đường ấy chưa từng tồn tại. Bình luận không gửi được,
   lượt xem không đếm, ô viết ghi chú báo lỗi mạng — mà trang thì nhìn vẫn ổn.

   ── CÙNG MỘT BỘ HÀM CHO CẢ HAI ────────────────────────────────────────
   File này KHÔNG chép lại logic. Nó `import` đúng mấy hàm trong `functions/`
   rồi gọi chúng với cùng hình dạng tham số mà Pages vẫn truyền vào. Nhờ vậy:

     · chạy dưới Worker  → `worker.js` định tuyến, `functions/` xử lý
     · chạy dưới Pages   → Pages định tuyến, `functions/` xử lý, file này nằm im

   Đổi backend thì sửa đúng một chỗ trong `functions/`. Chép logic sang đây là
   sớm muộn hai bản trôi lệch nhau, mà lệch ở lớp máy chủ thì không ai thấy cho
   tới lúc có người gửi bình luận.

   ── `env.ASSETS` ──────────────────────────────────────────────────────
   Đây là binding trỏ tới thư mục `dist/`, khai ở `wrangler.jsonc`. Mọi đường
   KHÔNG phải `/api/...` đều giao thẳng cho nó — tức là Worker chỉ chen vào
   đúng năm đường dẫn, còn lại vẫn là trang tĩnh phục vụ từ biên như cũ.
   ============================================================ */

import * as binhLuan from './functions/api/binh-luan.js';
import * as ghiChu   from './functions/api/ghi-chu.js';
import * as xem      from './functions/api/xem.js';
import * as quote    from './functions/api/quote.js';
import * as bai      from './functions/api/bai.js';
import * as thich    from './functions/api/thich.js';
import * as anh      from './functions/api/anh.js';

/* Bảng tra, không phải chuỗi if: thêm một hàm là thêm một dòng ở đây, và tên
   đường dẫn nằm ngay cạnh module lo nó — đọc một chỗ là biết trang có những
   cửa nào. */
const CUA = {
  '/api/binh-luan': binhLuan,
  '/api/ghi-chu':   ghiChu,
  '/api/xem':       xem,
  '/api/quote':     quote,
  '/api/bai':       bai,
  '/api/thich':     thich,
  '/api/anh':       anh
};

export default {
  async fetch(request, env, ctx) {
    /* Bỏ dấu `/` cuối để `/api/xem` và `/api/xem/` cùng vào một cửa. Đường `/`
       rút thành chuỗi rỗng — không khớp cửa nào, nên nó rơi xuống ASSETS,
       đúng như mong muốn. */
    const duong = new URL(request.url).pathname.replace(/\/+$/, '');
    const mo = CUA[duong];
    if (!mo) return env.ASSETS.fetch(request);

    /* Pages đặt tên hàm theo phương thức: GET → onRequestGet, PATCH →
       onRequestPatch. Hàm nào không tách theo phương thức thì khai `onRequest`
       và nhận hết (xem functions/api/xem.js). */
    const pt = request.method.toUpperCase();
    const f = mo['onRequest' + pt.charAt(0) + pt.slice(1).toLowerCase()]
           || mo.onRequest;
    if (!f) {
      return new Response(JSON.stringify({ ok: false, loi: 'phương thức không nhận' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'GET, POST' }
      });
    }

    /* Hình dạng tham số Pages vẫn truyền. Mấy hàm ở đây chỉ dùng `request` và
       `env`, nhưng khai đủ thì sau này thêm hàm mới không phải nhớ là nó đang
       chạy dưới lớp giả nào. */
    return f({
      request,
      env,
      params: {},
      data: {},
      waitUntil: ctx.waitUntil.bind(ctx),
      passThroughOnException: ctx.passThroughOnException.bind(ctx),
      next: () => env.ASSETS.fetch(request)
    });
  }
};
