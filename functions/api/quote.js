/**
 * functions/api/quote.js — MỘT câu trích dẫn cho ô "Quote of the day".
 *
 * Chạy trên CLOUDFLARE PAGES FUNCTIONS (Workers runtime), không phải Node.
 *
 * ═══ BỐN THỨ WORKERS KHÔNG CÓ, VÀ CHỖ NÀY LÀM GÌ THAY ═══
 *
 *   KHÔNG có `fs`            → nguồn câu được NƯỚNG SẴN lúc build ra
 *                              `./_nguon.js`, ở đây chỉ `import` vào.
 *   KHÔNG có `process.env`   → khoá lấy từ `context.env`, tham số thứ nhất
 *                              của `onRequest`.
 *   KHÔNG có `req` / `res`   → nhận `Request` chuẩn Web, trả `Response` chuẩn
 *                              Web. Không có `res.setHeader`, không `res.end`.
 *   KHÔNG có `export default`→ Pages tìm đúng tên hàm `onRequest`
 *                              (hoặc `onRequestGet` cho riêng GET).
 *
 * Đường dẫn cũng khác: trên Vercel là `api/quote.js` → `/api/quote`; ở đây
 * phải nằm trong `functions/`, và `functions/api/quote.js` → `/api/quote`.
 *
 * ═══ GIỮ NGUYÊN MẤY NGUYÊN TẮC HỌC TỪ dongchibinh-33 ═══
 *   · khoá Gemini không bao giờ xuống trình duyệt
 *   · chậm quá thì bỏ cuộc, đừng bắt người đọc chờ
 *   · câu rỗng, quá ngắn hay quá dài thì vứt
 *   · chữ nghĩa để ở file riêng (`content/quote-nguon.md`), không lẫn vào mã
 *   · hỏng kiểu gì cũng trả 200 — người đọc không bao giờ thấy lỗi cấu hình
 *
 * ═══ HAI CHỖ CỐ Ý KHÁC BẢN GỐC ═══
 *
 * 1. CÂU ĐÓNG THEO NGÀY. Bản gốc là "lời chào", mỗi lần tải một câu mới. Ô này
 *    là "câu CỦA HÔM NAY" nên cả ngày phải MỘT câu — đổi mỗi lần F5 thì không
 *    còn là câu của ngày, chỉ là một cái máy xổ số.
 *
 * 2. BỐC NGẪU NHIÊN CHỦ ĐỀ VÀ NHÓM TÁC GIẢ. Bản gốc nhét cả bốn chủ đề và 46
 *    cái tên vào một lời dặn, và Gemini gần như lúc nào cũng rơi vào mấy cái
 *    tên quen nhất. Ở đây mỗi ngày bốc MỘT chủ đề và 12 tác giả rồi mới hỏi.
 *
 * Gọi:  GET /api/quote?ngay=YYYY-MM-DD        câu của ngày (có cache)
 *       GET /api/quote?ngay=YYYY-MM-DD&moi=1  xin câu khác (không cache)
 * Trả:  { ok, q, tacGia, chuDe, src }  ·  ok:false ⇒ trang dùng kho sẵn.
 *
 * KHÔNG CẦN file này thì blog vẫn chạy: ô trích dẫn luôn có câu lấy từ
 * `### Câu sẵn` đã nhúng vào HTML lúc build.
 */

import NGUON from './_nguon.js';

/* Chậm quá thì thôi. Trang tự bỏ cuộc sau 3 giây nên số này phải nhỏ hơn. */
const HET_GIO_MS = 2600;

/* Việc ở đây nhẹ: viết đúng một câu ngắn. `flash-lite` đủ và nhanh. Tên mặc
   định là alias `-latest` nên Google ra bản mới cũng tự theo. */
const MODEL_MAC_DINH = 'gemini-flash-lite-latest';

/* Trần VÀ sàn. Trần chặn câu lê thê tràn khung. Sàn cũng cần: câu 30 ký tự thì
   ô chừa hẳn một mảng trống bên phải, nhìn như bị cắt cụt — bản gốc đã vấp
   đúng chỗ này và phải nới trần lên sau khi bỏ `text-wrap:balance`. */
const TRAN = 150;
const SAN  = 40;

/* Bốc bao nhiêu tác giả mỗi lần hỏi. 12 là chỗ vừa: ít quá thì mấy hôm liền
   trùng người, nhiều quá thì Gemini lại bám vào cái tên quen nhất trong nhóm. */
const SO_TAC_GIA = 12;

/* Bộ sinh số tất định — cùng hạt giống thì luôn ra cùng dãy. Hạt giống theo
   NGÀY để cùng một ngày mọi lần gọi ra cùng chủ đề và cùng nhóm tác giả: có
   vậy bản cache mới khớp với câu đã trả lần đầu. */
function sinh(hat) {
  return function () {
    hat = (hat + 0x6D2B79F5) >>> 0;
    let t = hat;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hatTuChuoi(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
/* Bốc n phần tử khác nhau, không lặp — Fisher–Yates một phần. */
function bocRa(ds, n, r) {
  const a = ds.slice();
  const lay = Math.min(n, a.length);
  for (let i = 0; i < lay; i++) {
    const k = i + Math.floor(r() * (a.length - i));
    const t = a[i]; a[i] = a[k]; a[k] = t;
  }
  return a.slice(0, lay);
}

const traLoi = (obj, cache) => new Response(JSON.stringify(obj), {
  status: 200,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache }
});

export async function onRequest(context) {
  const { request, env } = context;
  const p = new URL(request.url).searchParams;

  /* Ngày do TRANG gửi lên, theo giờ máy người đọc. Bắt buộc phải vậy: hàm này
     chạy ở điểm biên nào thì mang giờ chỗ đó — người ở TP.HCM sang ngày mới
     lúc 0h giờ Việt Nam, không phải 7h sáng như nếu tính theo UTC. */
  const ngay = /^\d{4}-\d{2}-\d{2}$/.test(p.get('ngay') || '')
    ? p.get('ngay')
    : new Date().toISOString().slice(0, 10);

  /* `moi=1` là nút "xem câu khác" trên trang bấm sang. Lần đó bốc thật ngẫu
     nhiên và KHÔNG cache — bấm nút mà ra lại câu cũ thì người bấm tưởng hỏng. */
  const xinMoi = p.get('moi') === '1';
  const r = sinh(xinMoi ? (Math.random() * 0xFFFFFFFF) >>> 0 : hatTuChuoi(ngay));

  const chuDe  = NGUON.chuDe[Math.floor(r() * NGUON.chuDe.length)] || { ten: '', ta: '' };
  const nhomTG = bocRa(NGUON.nguon, SO_TAC_GIA, r);

  /* Biến môi trường lấy từ `env`, KHÔNG phải `process.env` — Workers không có
     `process`. Khai ở Cloudflare: Pages → Settings → Variables and Secrets. */
  const key = env.GEMINI_KEY || env.GOOGLE_API_KEY;
  if (!key || !NGUON.nhac) {
    /* Chưa khai khoá không phải lỗi — chỉ là chưa bật lớp này. Trang đang hiện
       câu từ kho sẵn rồi, không cần làm gì thêm. */
    return traLoi({ ok: false, ly_do: key ? 'thieu-loi-dan' : 'chua-khai-khoa' }, 'no-store');
  }

  const nhac = NGUON.nhac
    .replace(/\{\{chuDe\}\}/g, chuDe.ta ? `${chuDe.ten} — ${chuDe.ta}` : chuDe.ten)
    .replace(/\{\{nguon\}\}/g, nhomTG.join(' · '));

  const goi = (model) => fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
    {
      method: 'POST',
      /* AbortSignal.timeout có sẵn trên Workers — gọn hơn dựng AbortController
         với setTimeout, và không để lại cái hẹn lơ lửng phải tự dọn. */
      signal: AbortSignal.timeout(HET_GIO_MS),
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: nhac }] }],
        generationConfig: { temperature: 1, maxOutputTokens: 220 }
      })
    }
  );

  try {
    let kq = await goi(env.GEMINI_MODEL_QUOTE || MODEL_MAC_DINH);
    /* Tên model sai hoặc chưa được cấp → 404/403. Lùi một lần về model chính,
       khỏi phải sửa mã khi Google đổi tên bản lite. */
    if (kq.status === 404 || kq.status === 403) {
      kq = await goi(env.GEMINI_MODEL || 'gemini-2.0-flash');
    }
    if (!kq.ok) throw new Error('gemini ' + kq.status);

    const j = await kq.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    let cau = parts.map((x) => x.text || '').join('')
      .trim()
      .replace(/^["'“”]+|["'“”]+$/g, '')
      .replace(/\s+/g, ' ');

    if (!cau || cau.length > TRAN || cau.length < SAN) {
      throw new Error('câu không dùng được (' + cau.length + ' ký tự)');
    }

    /* Tách tên tác giả ở dấu — CUỐI CÙNG. Tách ở dấu đầu tiên thì câu có em
       dash giữa chừng bị cụt mất nửa sau. */
    let tacGia = '';
    const i = cau.lastIndexOf('—');
    if (i > 0) { tacGia = cau.slice(i + 1).trim(); cau = cau.slice(0, i).trim(); }

    /* Giữ nguyên câu trả lời tới hết ngày, rồi cho dùng bản cũ thêm một ngày
       trong lúc lấy bản mới — nhờ vậy người mở trang lúc 0h01 không phải chờ. */
    const cache = xinMoi ? 'no-store'
      : 'public, s-maxage=' + conLaiTrongNgay() + ', stale-while-revalidate=86400';

    return traLoi({ ok: true, q: cau, tacGia, chuDe: chuDe.ten, src: 'gemini' }, cache);
  } catch (e) {
    return traLoi({ ok: false, ly_do: String((e && e.message) || e) }, 'no-store');
  }
}

/* Số giây còn lại tới nửa đêm UTC. Xấp xỉ thôi — múi giờ người đọc lệch thì
   câu đổi sớm hoặc muộn vài tiếng, và đó là chuyện chấp nhận được với một ô
   trích dẫn. Muốn chuẩn từng múi giờ thì phải cache theo từng ngày+múi giờ,
   tức là nhân số lần gọi Gemini lên vài chục — không đáng. */
function conLaiTrongNgay() {
  const d = new Date();
  const nuaDem = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(300, Math.floor((nuaDem - d.getTime()) / 1000));
}
