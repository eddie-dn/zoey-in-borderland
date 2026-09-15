/**
 * /api/quote — MỘT câu trích dẫn cho ô "Quote of the day".
 *
 * Học cách làm từ `api/quote.js` bên dongchiBinh-33 (nhánh v2-birthday-surprise),
 * giữ nguyên mấy nguyên tắc quan trọng của bản đó:
 *   · khoá Gemini nằm ở BIẾN MÔI TRƯỜNG, không bao giờ xuống trình duyệt
 *   · chậm quá thì bỏ cuộc, đừng bắt người đọc chờ
 *   · câu rỗng hoặc dài lê thê thì vứt, thà không có còn hơn tràn khung
 *   · lời dặn gửi cho Gemini để ở FILE RIÊNG, không lẫn vào mã
 *   · hỏng kiểu gì cũng trả 200 — người đọc không bao giờ thấy lỗi cấu hình
 *
 * Một chỗ KHÁC bản gốc, và là chỗ quan trọng nhất:
 *
 *   Bản gốc là "lời chào", mỗi lần tải là một câu mới — nên nó gọi Gemini với
 *   temperature 1 và không nhớ gì cả. Ô này là "câu CỦA HÔM NAY", nên cả ngày
 *   phải MỘT câu. Đổi câu mỗi lần bấm F5 thì nó không còn là câu của ngày nữa,
 *   chỉ là một cái máy xổ số.
 *
 *   Nên: câu được đóng theo NGÀY. Trang gửi lên ngày theo giờ máy người đọc
 *   (`?ngay=2026-09-14`), hàm này đưa ngày đó vào lời dặn và đặt cache-control
 *   để Vercel giữ nguyên câu trả lời tới hết ngày. Người đọc cũng cất câu vào
 *   localStorage nên tải lại trang không gọi mạng lần nữa.
 *
 * Gọi:  GET /api/quote?ngay=YYYY-MM-DD
 * Trả:  { ok, q, tacGia, src }   ·  src = 'gemini'
 *       ok:false ⇒ trang tự dùng kho câu có sẵn nhúng trong HTML.
 *
 * KHÔNG cần file này thì blog vẫn chạy: chưa deploy, chưa khai khoá, hay Gemini
 * hỏng — ô trích dẫn vẫn có câu, lấy từ kho `content/quotes.md` đã nhúng sẵn
 * vào trang lúc build. Đây chỉ là lớp làm cho nó phong phú thêm.
 */

/* Chậm quá thì thôi. Trang tự bỏ cuộc sau 3 giây nên số này phải nhỏ hơn —
   hết giờ ở đây thì trang còn kịp nhận câu trả lời "không được" và quay về
   kho sẵn, thay vì treo tới lúc trình duyệt tự ngắt. */
const HET_GIO_MS = 2600;

/* Việc ở đây nhẹ: viết đúng một câu ngắn. Bản `flash-lite` là đủ, và nhanh —
   chờ lâu thì trang đã lấy câu sẵn mất rồi, model to cũng vô ích.
   Tên mặc định là alias `-latest` nên Google ra bản mới cũng tự theo. */
const MODEL = process.env.GEMINI_MODEL_QUOTE || 'gemini-flash-lite-latest';

/* Trần ký tự. Ô trích dẫn rộng khoảng 3 dòng ở khổ bento; đo trên cột 300px
   cỡ chữ 21px thì một dòng chứa ~34 ký tự, nên 150 là vừa 3 dòng đầy cộng một
   dòng tên tác giả. Đây là chỗ CHẶN câu lê thê, không phải đích nhắm. */
const TRAN = 150;

/* Lời dặn gửi cho Gemini. Để ngay đây vì nó ngắn; dài hơn thì tách ra file
   riêng như bản gốc làm với `_lib/loichao.md`. */
const NHAC = [
  'Viết MỘT câu trích dẫn ngắn bằng tiếng Việt, hợp để đọc vào một buổi sáng yên tĩnh.',
  'Chủ đề: tự hiểu mình, thói quen, sự chú ý, hoặc cái đẹp của những thứ bình thường.',
  '',
  'Luật:',
  '- Dưới 120 ký tự.',
  '- Nếu là câu của một người có thật thì ghi đúng nguyên văn và thêm " — Tên người".',
  '- Nếu tự viết thì KHÔNG gán cho ai cả, không thêm dấu gạch ngang.',
  '- Không sáo rỗng, không "hãy", không khẩu hiệu tạo động lực.',
  '- Trả về ĐÚNG một dòng, không giải thích, không dấu ngoặc kép bao ngoài.'
].join('\n');

module.exports = async (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');

  let q = req.query;
  if (!q) {
    try { q = Object.fromEntries(new URL(req.url, 'http://x').searchParams); }
    catch (e) { q = {}; }
  }
  /* Ngày do TRANG gửi lên, theo giờ máy người đọc. Bắt buộc phải vậy: hàm này
     chạy ở máy chủ nào thì mang giờ máy đó — người ở Hà Nội sang ngày mới lúc
     0h Hà Nội, không phải 7h sáng như nếu tính theo UTC. */
  const ngay = /^\d{4}-\d{2}-\d{2}$/.test(String(q.ngay || ''))
    ? String(q.ngay)
    : new Date().toISOString().slice(0, 10);

  const key = process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    /* Chưa khai khoá không phải lỗi — chỉ là chưa bật lớp này. */
    res.setHeader('cache-control', 'no-store');
    return res.status(200).end(JSON.stringify({ ok: false, ly_do: 'chua-khai-khoa' }));
  }

  const goi = (model) => {
    const ac = new AbortController();
    const hen = setTimeout(() => ac.abort(), HET_GIO_MS);
    return fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
      {
        method: 'POST', signal: ac.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          /* Ngày đi vào lời dặn để mỗi ngày ra một câu khác. Cùng ngày thì
             Vercel trả lại bản đã cache, nên không gọi Gemini lần hai. */
          contents: [{ parts: [{ text: NHAC + '\n\nHôm nay là ' + ngay + '.' }] }],
          generationConfig: { temperature: 1, maxOutputTokens: 220 }
        })
      }
    ).finally(() => clearTimeout(hen));
  };

  try {
    let r = await goi(MODEL);
    /* Tên model sai hoặc chưa được cấp → 404/403. Lùi một lần về model chính,
       khỏi phải sửa mã khi Google đổi tên bản lite. */
    if (r.status === 404 || r.status === 403) {
      r = await goi(process.env.GEMINI_MODEL || 'gemini-2.0-flash');
    }
    if (!r.ok) throw new Error('gemini ' + r.status);

    const j = await r.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    let cau = parts.map((p) => p.text || '').join('')
      .trim()
      .replace(/^["'“”]+|["'“”]+$/g, '')
      .replace(/\s+/g, ' ');

    if (!cau || cau.length > TRAN) throw new Error('câu không dùng được');

    /* Tách tên tác giả ở dấu — CUỐI CÙNG. Tách ở dấu đầu tiên thì câu có em
       dash giữa chừng bị cụt mất nửa sau. */
    let tacGia = '';
    const i = cau.lastIndexOf('—');
    if (i > 0) { tacGia = cau.slice(i + 1).trim(); cau = cau.slice(0, i).trim(); }

    /* Giữ nguyên câu trả lời tới hết ngày (tính theo giờ người gửi), rồi cho
       phép dùng bản cũ thêm một ngày trong lúc lấy bản mới — nhờ vậy người mở
       trang lúc 0h01 không phải chờ Gemini. */
    res.setHeader('cache-control',
      'public, s-maxage=' + conLaiTrongNgay() + ', stale-while-revalidate=86400');
    return res.status(200).end(JSON.stringify({ ok: true, q: cau, tacGia, src: 'gemini' }));
  } catch (e) {
    res.setHeader('cache-control', 'no-store');
    return res.status(200).end(JSON.stringify({ ok: false, ly_do: String(e.message || e) }));
  }
};

/* Số giây còn lại tới nửa đêm UTC. Xấp xỉ thôi — múi giờ người đọc lệch thì
   câu đổi sớm hoặc muộn vài tiếng, và đó là chuyện chấp nhận được với một ô
   trích dẫn. Muốn chuẩn từng múi giờ thì phải cache theo từng ngày+múi giờ,
   tức là nhân số lần gọi Gemini lên vài chục — không đáng. */
function conLaiTrongNgay() {
  const d = new Date();
  const nuaDem = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(300, Math.floor((nuaDem - d.getTime()) / 1000));
}
