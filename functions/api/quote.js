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
 * 1. CÂU ĐÓNG THEO KHUNG GIỜ. Bản gốc là "lời chào", mỗi lần tải một câu mới.
 *    Ô này là "câu CỦA BUỔI NÀY" nên trong một khung giờ phải MỘT câu — đổi
 *    mỗi lần F5 thì không còn là câu của buổi, chỉ là một cái máy xổ số.
 *
 *    Bản trước đóng theo NGÀY, một câu duy nhất từ 0h tới 24h. Đúng chữ nhưng
 *    hỏng việc: người đọc quay lại buổi chiều gặp đúng câu ban sáng, và ô
 *    trích dẫn thành một mảng trang trí chết. Nay TRANG gửi lên cặp
 *    `ngay` + `khung`, mỗi cặp một câu — mặc định ba khung một ngày.
 *
 *    Vì sao trang gửi chứ hàm không tự tính: hàm chạy ở điểm biên nào thì
 *    mang giờ chỗ đó. Bảng mốc giờ nằm ở `src/js/quote.js`, chỗ duy nhất
 *    biết đang mấy giờ ở nhà người đọc.
 *
 * 2. BỐC NGẪU NHIÊN CHỦ ĐỀ VÀ NHÓM TÁC GIẢ. Bản gốc nhét cả bốn chủ đề và 46
 *    cái tên vào một lời dặn, và Gemini gần như lúc nào cũng rơi vào mấy cái
 *    tên quen nhất. Ở đây mỗi ngày bốc MỘT chủ đề và 12 tác giả rồi mới hỏi.
 *
 * Gọi:  GET /api/quote?ngay=YYYY-MM-DD&khung=N&sokhung=M   câu của khung (cache)
 *       thêm &moi=1                                        xin câu khác (không cache)
 *       thiếu khung/sokhung ⇒ coi như cả ngày một câu, y như bản trước.
 * Trả:  { ok, q, tacGia, chuDe, khung, src }  ·  ok:false ⇒ trang dùng kho sẵn.
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

/* Lưới đỡ. Phải là một bí danh KHÁC hẳn cái trên, không phải một số hiệu ghim
   cứng: ghim số hiệu là hẹn trước một ngày phải đi sửa (bản trước ghim
   `gemini-2.0-flash`, tra lại thì chính nó đã bị Google tắt). Khai đè được
   bằng biến `GEMINI_MODEL` ở Cloudflare, tiện lúc cần thử một model cụ thể mà
   không phải sửa mã. */
const MODEL_DU_PHONG = 'gemini-flash-latest';

/* Trần VÀ sàn. Trần chặn câu lê thê tràn khung. Sàn cũng cần: câu 30 ký tự thì
   ô chừa hẳn một mảng trống bên phải, nhìn như bị cắt cụt — bản gốc đã vấp
   đúng chỗ này và phải nới trần lên sau khi bỏ `text-wrap:balance`. */
const TRAN = 150;
const SAN  = 40;

/* Trần token cho câu trả lời. Một câu 150 ký tự tiếng Việt chưa tới 80 token,
   nên 512 là thừa thãi — cố ý thừa. Bản trước để 220, đủ cho câu nhưng KHÔNG
   đủ chỗ cho phần "suy nghĩ" của mấy model đời mới: token nghĩ ăn hết hạn mức
   rồi `parts` trả về RỖNG, và lỗi hiện ra là "câu không dùng được (0 ký tự)" —
   nghe như Gemini viết câu dở, chứ không ai đoán ra là thiếu chỗ. Nay tắt hẳn
   phần nghĩ bằng `thinkingConfig`, và để trần rộng làm lưới đỡ phòng khi cái
   đứng sau bí danh `-latest` lại không nhận `thinkingConfig`. */
const TRAN_TOKEN = 512;

/* Bản cache phải sống HẾT khung giờ. Hết sớm thì `stale-while-revalidate` đi
   lấy bản mới ngay giữa buổi, và người vào sau thấy một câu khác người vào
   trước — đúng cái nhấp nháy mà cơ chế khung giờ sinh ra để tránh.

   Mỗi số dưới đây dài hơn khung DÀI NHẤT của cấu hình tương ứng (bảng mốc ở
   `src/js/quote.js`), chừa dư vài tiếng:
     2 khung  khung dài nhất 12h  →  20h
     3 khung  khung dài nhất 11h  →  13h
     4 khung  khung dài nhất  9h  →  10h
   Cache dài quá không hại gì: KHOÁ đã có sẵn `ngay` và `khung` trong địa chỉ,
   nên sang khung mới là sang một khoá mới, không đụng bản cũ. */
const HAN_CACHE = { 2: 72000, 3: 46800, 4: 36000 };

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

  /* Khung giờ trong ngày, do trang gửi lên. `sokhung` là TỔNG số khung — cần
     nó để tính hạn cache: khung càng ít thì mỗi khung càng dài, mà bản cache
     phải sống hết khung chứ hết sớm thì câu đổi giữa buổi.

     Kẹp cả hai vào khoảng hợp lệ thay vì tin thẳng: hai tham số này nằm trong
     địa chỉ, ai gõ gì vào cũng được. `sokhung=99999` mà lọt thì hạn cache
     thành 1 giây và mỗi lượt tải là một lượt gọi Gemini. */
  const soKhung = Math.min(4, Math.max(1, parseInt(p.get('sokhung'), 10) || 1));
  const khung   = Math.min(soKhung - 1, Math.max(0, parseInt(p.get('khung'), 10) || 0));

  /* `moi=1` là nút "xem câu khác" trên trang bấm sang. Lần đó bốc thật ngẫu
     nhiên và KHÔNG cache — bấm nút mà ra lại câu cũ thì người bấm tưởng hỏng. */
  const xinMoi = p.get('moi') === '1';

  /* Hạt giống là NGÀY + KHUNG, không phải ngày trơn. Cùng một khung thì mọi
     lượt gọi ra cùng chủ đề và cùng nhóm tác giả — có vậy bản cache mới khớp
     câu đã trả lần đầu. Mà hai khung khác nhau trong cùng một ngày thì bốc ra
     hai chủ đề khác nhau, nên câu buổi chiều không phải là một biến thể của
     câu ban sáng. */
  const r = sinh(xinMoi ? (Math.random() * 0xFFFFFFFF) >>> 0
                        : hatTuChuoi(ngay + '#' + khung));

  /* ── CHỦ ĐỀ: CHIA BÀI THEO NGÀY, KHÔNG BỐC RỜI TỪNG KHUNG ──

     Bản đầu bốc chủ đề bằng chính hạt giống ngày+khung ở trên, mỗi khung bốc
     độc lập. Đo ra hỏng ngay: ngày 17/09 thì khung 1 và khung 2 cùng rơi vào
     "Cái đẹp của thứ bình thường". Không phải xui — 8 chủ đề, 3 khung, thì
     xác suất có hai khung trùng nhau trong cùng một ngày khoảng 30%. Mà người
     đọc quay lại buổi tối để gặp lại đúng chủ đề ban chiều thì cả cơ chế khung
     giờ thành công cốc.

     Chữa bằng đúng cái cách kho câu sẵn đã dùng (xem `laBai` trong
     src/js/quote.js): xáo cả cỗ MỘT LẦN theo ngày, rồi mỗi khung rút một lá
     theo thứ tự. Trong một ngày không khung nào trùng khung nào — chắc chắn,
     không phải xác suất.

     Hai ngày liền nhau vẫn có thể chạm lại một chủ đề ở chỗ nối giữa hai cỗ.
     Chỗ nối ấy bên kho câu sẵn phải chữa vì nó lặp lại nguyên một CÂU; ở đây
     chỉ là lặp chủ đề, mà chủ đề lặp thì Gemini vẫn viết ra câu khác với nhóm
     tác giả khác. Không đáng thêm một lớp cơ chế nữa.

     Nút "xem câu khác" thì vẫn bốc rời, thật ngẫu nhiên — bấm nút là muốn đi
     chệch khỏi lịch, không phải đi tiếp theo lịch. */
  const chuDe = xinMoi
    ? (NGUON.chuDe[Math.floor(r() * NGUON.chuDe.length)] || { ten: '', ta: '' })
    /* Chia dư phòng lúc `### Chủ đề` bị rút ngắn còn ít hơn số khung: lúc ấy
       hai khung đành chạm nhau, nhưng chạm nhau vẫn hơn là rút phải lá rỗng
       rồi gửi cho Gemini một lời dặn không có chủ đề nào. */
    : (bocRa(NGUON.chuDe, NGUON.chuDe.length, sinh(hatTuChuoi(ngay)))
       [khung % Math.max(1, NGUON.chuDe.length)] || { ten: '', ta: '' });

  /* Nhóm tác giả thì bốc theo ngày+khung như cũ. Hai khung có chạm lại vài cái
     tên cũng không sao: chủ đề đã khác thì câu đã khác. */
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

  const goi = (model, tatNghi) => fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
    {
      method: 'POST',
      /* AbortSignal.timeout có sẵn trên Workers — gọn hơn dựng AbortController
         với setTimeout, và không để lại cái hẹn lơ lửng phải tự dọn. */
      signal: AbortSignal.timeout(HET_GIO_MS),
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: nhac }] }],
        generationConfig: tatNghi
          ? { temperature: 1, maxOutputTokens: TRAN_TOKEN, thinkingConfig: { thinkingBudget: 0 } }
          : { temperature: 1, maxOutputTokens: TRAN_TOKEN }
      })
    }
  );

  /* Gọi một model, và nếu model ấy không biết `thinkingConfig` thì gọi lại
     không kèm. Trả về `{ kq, vi }` — `vi` là lời báo lỗi ĐÃ ĐỌC SẴN, vì thân
     Response chỉ đọc được một lượt.

     Không đoán model nào biết `thinkingConfig` theo số hiệu: cả hai tên ở đây
     đều là bí danh `-latest`, mà Google hoán cái đứng sau bí danh lúc nào
     không báo. Cứ hỏi, đúng lỗi ấy thì hỏi lại. */
  async function thu(model) {
    let kq = await goi(model, true);
    if (kq.ok) return { kq, vi: '' };
    let vi = await doiLoi(kq);
    if (kq.status === 400 && /thinking/i.test(vi)) {
      kq = await goi(model, false);
      if (kq.ok) return { kq, vi: '' };
      vi = await doiLoi(kq);
    }
    return { kq, vi };
  }

  try {
    const mChinh   = env.GEMINI_MODEL_QUOTE || MODEL_MAC_DINH;
    const mDuPhong = env.GEMINI_MODEL || MODEL_DU_PHONG;

    let { kq, vi } = await thu(mChinh);
    /* ── LÙI MỘT LẦN, VÀ LÙI VỀ MỘT BÍ DANH KHÁC ──
       Tên model sai hoặc chưa được cấp → 404/403.

       Bản trước lùi về `gemini-2.0-flash`, một tên GHIM CỨNG — ý là "cái lưới
       chắc chắn tồn tại". Tra lại tháng 9/2026 thì chính nó đã nằm trong mục
       "Previous models" của Google với nhãn (Shut down). Tức là cái lưới rách
       trước cả thứ nó đỡ, mà rách IM LẶNG: cả hai cùng 404 thì ô trích dẫn chỉ
       lặng lẽ dùng câu từ kho mãi mãi, không ai biết lớp AI đã chết.

       Ghim cứng vào một số hiệu là hẹn trước một ngày phải đi sửa. Nay cả hai
       đều là bí danh `-latest`, thứ Google tự hoán đổi mỗi lần ra bản mới:
         · chính     gemini-flash-lite-latest   bản lite, rẻ nhất
         · dự phòng  gemini-flash-latest        bản flash đầy đủ
       Hai bí danh KHÁC NHAU, nên cái này hỏng cái kia vẫn còn. Google bỏ đồng
       thời cả hai thì mới hết đường, và lúc ấy thì ghim số hiệu cũng chẳng cứu
       được gì.

       ── VÌ SAO LÙI CẢ KHI GẶP 400 ──
       Bản trước chỉ lùi ở 404/403, và đó là một lỗ thật: đo trên trang đang
       chạy, model chính trả về

         400 INVALID_ARGUMENT — Request contains an invalid argument.

       Google kiểm KHOÁ TRƯỚC thân yêu cầu — khoá sai thì mọi lượt gọi đều trả
       đúng một câu "API key not valid", kể cả khi cố tình gửi thân rỗng hay
       tên model bịa (đã thử cả bốn ca). Nhận được câu KHÁC nghĩa là khoá hợp
       lệ và thân yêu cầu mới là chỗ Google chê. Mà thân ấy đúng chuẩn: một
       phần `text` 710 ký tự, `temperature` 1, `maxOutputTokens`. Không có gì
       để chê.

       Còn lại đúng một biến: chính cái bí danh. Google trả 400 chứ không phải
       404 cho một bí danh mà khoá này không được cấp — nên lưới đỡ dựng ở
       404/403 không bao giờ bung ra, và ô trích dẫn chết lặng y như lúc chưa
       có lưới.

       Nay lùi ở cả ba mã. Cái giá là một lượt gọi thừa khi thân yêu cầu hỏng
       thật — rẻ, vì đó là nhánh lỗi, và đổi lại là cái lưới hoạt động đúng lúc
       cần nhất. */
    if (!kq.ok && (kq.status === 400 || kq.status === 403 || kq.status === 404)
        && mDuPhong !== mChinh) {
      const loiDau = kq.status + (vi ? ' · ' + vi : '');
      ({ kq, vi } = await thu(mDuPhong));
      /* Kể lại CẢ HAI lời báo, kèm tên model. Chỉ kể cái sau thì người đọc log
         tưởng model chính vẫn ổn, và đi sửa nhầm chỗ. */
      if (!kq.ok) {
        throw new Error(`gemini · ${mChinh}: ${loiDau} · ${mDuPhong}: `
          + kq.status + (vi ? ' · ' + vi : ''));
      }
    }
    if (!kq.ok) throw new Error(`gemini ${kq.status}` + (vi ? ' · ' + vi : '')
      + ` (model ${mChinh})`);

    const j = await kq.json();
    const ungVien = (j.candidates || [])[0] || {};
    const parts = (ungVien.content || {}).parts || [];
    let cau = parts.map((x) => x.text || '').join('')
      .trim()
      .replace(/^["'“”]+|["'“”]+$/g, '')
      .replace(/\s+/g, ' ');

    if (!cau || cau.length > TRAN || cau.length < SAN) {
      /* Kèm `finishReason`: câu rỗng vì bị chặn nội dung (SAFETY), vì hết token
         (MAX_TOKENS) hay vì model nghĩ hết sạch phần được nói là ba chuyện sửa
         ở ba chỗ khác hẳn nhau — mà nhìn "0 ký tự" thì không phân biệt nổi. */
      throw new Error('câu không dùng được (' + cau.length + ' ký tự'
        + (ungVien.finishReason ? ', ' + ungVien.finishReason : '') + ')');
    }

    /* Tách tên tác giả ở dấu — CUỐI CÙNG. Tách ở dấu đầu tiên thì câu có em
       dash giữa chừng bị cụt mất nửa sau. */
    let tacGia = '';
    const i = cau.lastIndexOf('—');
    if (i > 0) { tacGia = cau.slice(i + 1).trim(); cau = cau.slice(0, i).trim(); }

    /* Giữ nguyên câu trả lời tới hết khung giờ, rồi cho dùng bản cũ thêm một
       ngày trong lúc lấy bản mới — nhờ vậy người mở trang đúng lúc sang khung
       không phải chờ. */
    const cache = xinMoi ? 'no-store'
      : 'public, s-maxage=' + (HAN_CACHE[soKhung] || conLaiTrongNgay())
        + ', stale-while-revalidate=86400';

    return traLoi({ ok: true, q: cau, tacGia, chuDe: chuDe.ten, khung, src: 'gemini' }, cache);
  } catch (e) {
    return traLoi({ ok: false, ly_do: String((e && e.message) || e) }, 'no-store');
  }
}

/* ── KỂ LẠI LỖI THẬT, ĐỪNG NUỐT MẤT ──
   Bản đầu ném ra đúng ba chữ: "gemini 400". Con số ấy không sai, nhưng vô dụng
   — 400 có thể là khoá không hợp lệ, là khoá bị gửi hai lần, là project chưa
   bật Generative Language API, là model không nhận `thinkingConfig`, hay là
   thân yêu cầu hỏng. Năm thứ ấy sửa ở năm chỗ khác hẳn nhau, mà Google thì đã
   nói rõ là cái nào ngay trong `error.message`. Nuốt nó đi là tự bịt mắt mình.

   Câu báo của Google KHÔNG bao giờ chứa khoá, nên đưa ra ngoài là an toàn. Vẫn
   cắt 200 ký tự, phòng lúc cổng vào trả về nguyên một trang HTML.

   Đọc THÂN MỘT LẦN rồi mới thử parse: `Response` chỉ đọc được một lượt, gọi
   .json() hỏng rồi gọi tiếp .text() là nhận lỗi "body already used" đè lên
   đúng cái lỗi mình đang muốn xem. */
async function doiLoi(kq) {
  try {
    const tho = await kq.text();
    let du = null;
    try { du = JSON.parse(tho); } catch (e) {}
    const loi = (du && du.error) || {};

    /* ── ĐỪNG DỪNG Ở `message` ──
       Với INVALID_ARGUMENT, `message` chỉ là đúng một câu vô hồn: "Request
       contains an invalid argument." Không nói trường nào, không nói vì sao —
       đọc xong vẫn không biết đi sửa ở đâu.

       Chỗ có thông tin thật là `details[].fieldViolations[]`, nơi Google chỉ
       đích danh `field` và `description`. Bản trước bỏ qua hẳn mảng ấy, nên tự
       vứt đi đúng thứ mình cần. Google không phải lúc nào cũng kèm, nhưng khi
       có thì nó là câu trả lời. */
    const viPham = []
      .concat(...(loi.details || []).map((d) => d.fieldViolations || []))
      .map((v) => [v.field, v.description].filter(Boolean).join(': '))
      .filter(Boolean);

    return ([loi.status, loi.message, ...viPham].filter(Boolean).join(' — ') || tho)
      .slice(0, 300);
  } catch (e) { return ''; }
}

/* Số giây còn lại tới nửa đêm UTC. Chỉ còn dùng khi trang chạy nếp cũ một câu
   một ngày (`quoteAI.khung = 1`, hoặc HTML dựng từ bản trước chưa có
   `data-khung`). Xấp xỉ thôi — múi giờ người đọc lệch thì
   câu đổi sớm hoặc muộn vài tiếng, và đó là chuyện chấp nhận được với một ô
   trích dẫn. Muốn chuẩn từng múi giờ thì phải cache theo từng ngày+múi giờ,
   tức là nhân số lần gọi Gemini lên vài chục — không đáng. */
function conLaiTrongNgay() {
  const d = new Date();
  const nuaDem = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(300, Math.floor((nuaDem - d.getTime()) / 1000));
}
