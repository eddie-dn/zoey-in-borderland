/* ============================================================
   /api/thu-bao — THƯ BÁO GOM TRONG NGÀY.

   ── VÌ SAO CẦN ────────────────────────────────────────────────────────
   Bình luận vào D1 với `duyet = 0` và NẰM IM ở đó cho tới khi chủ trang mở
   ngăn Comment ở `/z-admin/` ra bấm. Không có gì nhắc. Người đọc gõ một câu
   hỏi tử tế rồi đợi — họ không biết là đang đợi một người chưa biết mình có gì
   để đọc.

   Cái thiếu không phải chỗ chứa, mà là MỘT CÚ HUÝCH. File này lo đúng việc ấy:
   mỗi ngày một lượt, nếu có gì mới thì gửi một lá thư.

   ── VÌ SAO GOM MỘT LÁ, KHÔNG PHẢI MỖI BÌNH LUẬN MỘT LÁ ────────────────
   Gửi ngay từng cái thì một đợt spam mười lăm dòng là mười lăm lần điện thoại
   rung lúc nửa đêm — và lần thứ ba là người ta tắt thông báo, tức là tính năng
   tự huỷ. Gom lại còn được hai thứ nữa: đọc một lá biết TOÀN BỘ hàng chờ, và
   hạn mức Resend (3.000 thư/tháng) coi như không bao giờ đụng tới — mỗi ngày
   nhiều nhất một lá là 31 lá/tháng.

   ── KHÔNG GIỮ TRẠNG THÁI "ĐÃ GỬI TỚI ĐÂU" ─────────────────────────────
   Cách thường thấy là lưu mốc thời gian của lần gửi trước rồi lấy phần mới
   hơn. Làm vậy phải thêm một bảng, và bảng ấy hỏng thì hoặc gửi trùng mãi
   hoặc im mãi — mà im thì KHÔNG AI BIẾT.

   Ở đây đơn giản hơn: lịch chạy mỗi ngày một lần, nên "mới" = gửi trong
   NGUONG_GIO giờ gần nhất. Không bảng, không trạng thái, không thứ để hỏng.

   Đặt 25 chứ không phải 24 là CỐ Ý. Cron có thể lệch vài phút, và một lượt
   chạy hỏng thì cửa sổ 24 giờ khít khìn khịt sẽ đánh rơi hẳn một ngày. Thừa
   một giờ nghĩa là thỉnh thoảng một bình luận bị nhắc hai hôm liền — phiền
   nhẹ. Thiếu một giờ nghĩa là có bình luận không bao giờ được nhắc — hỏng
   hẳn. Chọn cái phiền.

   ── THƯ KHÔNG BAO GIỜ CHỞ EMAIL NGƯỜI BÌNH LUẬN ───────────────────────
   `binh-luan.js` có một lời hứa ở đầu file: cột `email` không ra khỏi cơ sở dữ
   liệu, kể cả với chủ trang. File này GIỮ NGUYÊN lời hứa ấy — câu SELECT dưới
   đây không chạm vào cột đó.

   Nó không phải sự cẩn thận thừa: thư đi qua Resend, nằm trong log của Resend,
   rồi nằm trong hộp thư Gmail, rồi nằm trong mọi bản sao lưu của Gmail. Một
   địa chỉ người ta đưa cho MÌNH không có lý do gì phải đi qua bấy nhiêu chặng.
   Cần liên hệ lại thì mở Console của D1 mà tra — một lần, đúng dòng cần.

   ── BA VIỆC CHẠY THEO LỊCH, MỘT MÁY GỬI ───────────────────────────────
     · `chayThuBao(env)`  mỗi ngày · bình luận đang chờ duyệt
     · `tuKiem(env)`      mỗi ngày · soi xem có thứ gì đang hỏng lặng lẽ
     · `chaySaoLuu(env)`  mỗi tuần · đẩy dữ liệu sang Google Sheet

   Cả ba ở chung một file vì chúng là CÙNG MỘT VIỆC nhìn từ xa: thứ chạy khi
   không có ai ngồi đó, và nói ra khi có chuyện. Chúng dùng chung `guiThu()`,
   chung cách bỏ qua khi thiếu cấu hình, chung nếp ghi log. Tách ra ba file thì
   ba bản sao của cùng một hàm gửi, và sớm muộn ba bản ấy trôi lệch nhau.

   ── HAI ĐƯỜNG VÀO ─────────────────────────────────────────────────────
     · `scheduled` trong worker.js — lịch gọi (khối `triggers` ở wrangler.jsonc)
     · `onRequestPost` — chủ trang gọi tay để THỬ, không phải đợi tới mai.

   Không có đường thứ hai thì mỗi lần sửa một dòng chữ trong thư là chờ 24 giờ
   mới biết đúng sai. Nó dùng đúng cặp khoá `GC_ID` + `GC_KEY` như mọi cửa khác
   của chủ trang.

   ── BA BIẾN CẦN ĐẶT Ở CLOUDFLARE ──────────────────────────────────────
     RESEND_KEY  Secret  khoá API Resend, quyền "Sending access"
     THU_DEN     Secret  địa chỉ nhận thư báo
     THU_TU      Var     người gửi, đã khai sẵn trong wrangler.jsonc

   THU_DEN để Secret chứ không để Var vì kho mã này công khai — địa chỉ hộp thư
   riêng của chủ trang không phải thứ để trong repo. RESEND_KEY thì khỏi bàn.

   Thiếu bất kỳ biến nào thì hàm LẶNG LẼ bỏ qua và ghi một dòng vào log, chứ
   không ném lỗi: một lượt cron hỏng vì thiếu cấu hình sẽ hỏng lại mỗi ngày,
   mãi mãi, và không ai đọc log của một thứ chạy lúc 8 giờ tối.

   Từng bước: docs/THU-BAO.md
   ============================================================ */

/* Cửa sổ "mới". Xem chú thích dài ở đầu file về việc vì sao 25 chứ không 24. */
const NGUONG_GIO = 25;

/* Trần số dòng in vào thư. Hàng chờ mà dài hơn bấy nhiêu thì vấn đề không nằm
   ở lá thư nữa — nó nằm ở chỗ chủ trang đã bỏ bẵng hàng tháng, hoặc có một đợt
   spam. Cả hai trường hợp, in thêm 200 dòng nữa không giúp được gì. */
const TOI_DA_DONG = 40;

/* Cắt nội dung bình luận trong thư. Thư báo là cái CHUÔNG, không phải bàn
   duyệt: đủ để nhận ra dòng ấy đáng đọc hay là rác, rồi bấm sang trang thật. */
const CAT_CHU = 180;

/* ── HAI HÀM CHÉP TỪ binh-luan.js ──
   Mỗi hàm trong `functions/` là một gói riêng và `import` chéo giữa chúng thì
   Pages phải gộp lại; cả kho này theo nếp chép mười dòng còn hơn tạo một sợi
   phụ thuộc. Xem chú thích cùng tên trong binh-luan.js. */
function bang(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  let lech = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    lech |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return lech === 0;
}

function laChuTrang(request, env) {
  if (!env.GC_ID || !env.GC_KEY) return false;
  return bang(request.headers.get('x-gc-id'), env.GC_ID)
      && bang(request.headers.get('x-gc-key'), env.GC_KEY);
}

/* Thoát HTML trước khi nhét vào thân thư. Nội dung bình luận là chữ NGƯỜI LẠ
   gõ vào — đúng thứ không bao giờ được đi thẳng vào HTML. Gmail không chạy
   script, nhưng một dấu `<` lạc chỗ cũng đủ nuốt mất nửa lá thư. */
function thoat(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function catChu(s, max) {
  const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

/* Giờ Việt Nam, không phải UTC. Thư gửi cho một người sống ở múi giờ +7 mà ghi
   "lúc 03:14" cho một bình luận gõ lúc 10 giờ sáng thì con số ấy vô dụng. */
function gioVN(iso) {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return String(iso || ''); }
}

/* ══════════ GỬI MỘT LÁ QUA RESEND ══════════
   Tách riêng vì đây là hàm DÙNG LẠI được: thư báo bình luận hôm nay, thư báo
   thống kê tuần sau, thư báo lỗi sau nữa — đều đi qua đây. Đổi nhà cung cấp
   thì sửa đúng một chỗ.

   Workers KHÔNG mở được kết nối SMTP, nên bắt buộc phải là HTTP API. Đây là lý
   do kỹ thuật thật sự sau mục C3 trong docs/VIEC-DANG-CHO.md. */
export async function guiThu(env, { tieuDe, chuThuong, chuHTML }) {
  if (!env.RESEND_KEY) return { ok: false, loi: 'thieu-RESEND_KEY' };
  if (!env.THU_DEN)    return { ok: false, loi: 'thieu-THU_DEN' };

  /* Cái `||` này là lưới chứ không phải cấu hình. Nguồn đúng của địa chỉ gửi là
     `THU_TU` trong wrangler.jsonc; đổi ở ĐÓ, không phải ở đây. Để một địa chỉ
     trần ở đây phòng lượt deploy nào đó làm rơi mất biến — thà gửi từ một địa
     chỉ cũ còn hơn không gửi được lá thư báo nào. */
  const tu = env.THU_TU || 'contact@z-in-borderland.com';

  let ra;
  try {
    ra = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: tu,
        to: [env.THU_DEN],
        subject: tieuDe,
        text: chuThuong,
        html: chuHTML
      })
    });
  } catch (e) {
    /* Mạng hỏng giữa chừng. Không thử lại: lịch sẽ chạy lại vào mai, và một
       vòng thử lại ở đây chỉ làm một lượt cron hỏng thành một lượt cron treo. */
    return { ok: false, loi: 'mang: ' + String((e && e.message) || e) };
  }

  if (!ra.ok) {
    const chiTiet = await ra.text().catch(() => '');
    return { ok: false, loi: `resend ${ra.status}`, chiTiet: chiTiet.slice(0, 400) };
  }

  const json = await ra.json().catch(() => ({}));
  return { ok: true, id: json.id || '' };
}

/* ══════════ DỰNG VÀ GỬI THƯ BÁO BÌNH LUẬN ══════════ */
export async function chayThuBao(env) {
  if (!env.DB) return { ok: false, loi: 'chua-gan-D1' };

  /* Lấy CẢ hàng chờ, không riêng phần mới. Lá thư trả lời câu hỏi "giờ có gì
     đang đợi mình" — mà một bình luận từ thứ Ba vẫn đang đợi y như cái vừa gõ
     xong. Phần "mới" chỉ quyết định CÓ GỬI HAY KHÔNG, không quyết định in gì.

     Cột `email` cố ý không có trong danh sách này — xem đầu file. */
  let ds;
  try {
    const kq = await env.DB.prepare(
      `SELECT ma, trang, ten, chu, luc FROM binh_luan
        WHERE duyet = 0 AND an = 0
        ORDER BY luc DESC LIMIT ?`).bind(TOI_DA_DONG).all();
    ds = kq.results || [];
  } catch (e) {
    const loi = String((e && e.message) || e);
    /* Bảng chưa có = chưa ai bình luận bao giờ. Đó là một trang blog mới, không
       phải một lỗi. Mọi lỗi khác thì nói ra. */
    if (/no such table/i.test(loi)) return { ok: true, boQua: 'chua-co-bang' };
    return { ok: false, loi };
  }

  if (!ds.length) return { ok: true, boQua: 'hang-cho-rong' };

  const moc = Date.now() - NGUONG_GIO * 3600 * 1000;
  const moi = ds.filter((d) => {
    const t = Date.parse(d.luc);
    return Number.isFinite(t) && t >= moc;
  });

  /* KHÔNG CÓ GÌ MỚI THÌ KHÔNG GỬI GÌ. Đây là dòng quan trọng nhất file.
     Thiếu nó thì một hàng chờ chưa dọn sẽ đẻ ra một lá thư y hệt mỗi ngày, và
     một lá thư nói đúng một chuyện mỗi ngày là thứ người ta học cách không
     đọc — rồi lá thư có tin thật cũng chịu chung số phận. */
  if (!moi.length) return { ok: true, boQua: 'khong-co-gi-moi', hangCho: ds.length };

  const goc  = (env.TRANG_GOC || 'https://z-in-borderland.com').replace(/\/+$/, '');
  const tong = ds.length;

  const tieuDe = moi.length === tong
    ? `${moi.length} bình luận chờ duyệt`
    : `${moi.length} bình luận mới · ${tong} đang chờ duyệt`;

  /* ── HAI THÂN THƯ, KHÔNG PHẢI MỘT ──
     `text` không phải phần thừa cho vui. Thư chỉ có HTML bị chấm điểm spam cao
     hơn hẳn, và bản chữ thường là thứ hiện ra trong dòng xem trước trên điện
     thoại — chỗ chủ trang thật sự đọc nó. */
  const dongChu = [];
  const dongHTML = [];

  for (const d of ds) {
    const laMoi = moi.includes(d);
    const dau   = laMoi ? '● ' : '○ ';
    const ten   = String(d.ten || '').trim() || '(không tên)';
    const noi   = catChu(d.chu, CAT_CHU);
    const luc   = gioVN(d.luc);
    /* Trỏ tới chính BÀI, không phải bàn duyệt. Bàn duyệt sống ở đúng một chỗ
       là ngăn Comment của /z-admin/ (xem đầu src/js/duyet.js) — lối tắt
       `#duyet` gắn vào địa chỉ bài đã bỏ, nên link kèm nó dẫn tới một trang
       bài bình thường với một dấu thăng vô nghĩa.

       Trỏ vào bài vẫn đúng việc: đọc một bình luận rời khỏi ngữ cảnh thì không
       quyết được nên duyệt hay không. Đường sang chỗ bấm nút nằm ở cuối thư,
       đúng một lần, vì nó là MỘT chỗ chứ không phải mỗi dòng một chỗ. */
    const link  = `${goc}${d.trang}`;

    dongChu.push(`${dau}${ten} · ${luc} · ${d.trang}\n  ${noi}\n  ${link}`);

    dongHTML.push(
      `<tr><td style="padding:14px 0;border-bottom:1px solid #e6e6e6">
         <div style="font:600 14px/1.4 system-ui,sans-serif;color:#111">
           ${laMoi ? '<span style="color:#c2410c">●</span> ' : ''}${thoat(ten)}
           <span style="font-weight:400;color:#888">· ${thoat(luc)}</span>
         </div>
         <div style="font:400 14px/1.6 system-ui,sans-serif;color:#333;margin:6px 0">
           ${thoat(noi)}
         </div>
         <a href="${thoat(link)}"
            style="font:400 13px/1.4 system-ui,sans-serif;color:#0369a1">
           ${thoat(d.trang)} →
         </a>
       </td></tr>`
    );
  }

  const chuThuong =
    `${moi.length} bình luận mới trong ${NGUONG_GIO} giờ qua.\n` +
    `Tổng cộng ${tong} dòng đang chờ duyệt.\n\n` +
    `● = mới   ○ = đã chờ từ trước\n\n` +
    dongChu.join('\n\n') +
    `\n\n—\nDuyệt ở ngăn Comment: ${goc}/z-admin/`;

  const chuHTML =
    `<div style="max-width:560px;margin:0 auto;padding:24px 16px">
       <div style="font:600 17px/1.3 system-ui,sans-serif;color:#111;margin-bottom:4px">
         ${moi.length} bình luận mới
       </div>
       <div style="font:400 14px/1.5 system-ui,sans-serif;color:#666;margin-bottom:18px">
         Tổng cộng ${tong} dòng đang chờ duyệt.
         <span style="color:#c2410c">●</span> mới &nbsp; ○ đã chờ từ trước
       </div>
       <table style="width:100%;border-collapse:collapse">${dongHTML.join('')}</table>
       <div style="margin-top:22px">
         <a href="${thoat(goc)}/z-admin/"
            style="display:inline-block;padding:10px 18px;border-radius:6px;
                   background:#111;color:#fff;text-decoration:none;
                   font:600 14px/1 system-ui,sans-serif">
           Duyệt ở ngăn Comment →
         </a>
       </div>
     </div>`;

  const kq = await guiThu(env, { tieuDe, chuThuong, chuHTML });
  return { ...kq, moi: moi.length, hangCho: tong };
}

/* ══════════════════════════════════════════════════════════════════════
   ② TỰ KIỂM — soi những thứ hỏng mà KHÔNG kêu

   ── VÌ SAO CẦN ────────────────────────────────────────────────────────
   Trang này có rất nhiều đường hỏng lặng lẽ, và đó là CỐ Ý: mỗi hàm đều chọn
   "trang vẫn chạy, chỉ thiếu một mục" thay vì "nổ 500 vào mặt người đọc". Đọc
   qua `functions/` thấy ngay mấy chỗ:

     · GEMINI_KEY mất   → /api/quote lặng lẽ quay về kho câu sẵn
     · GH_TOKEN hết hạn → ô đăng bài ở /z-admin/ im, bài không bao giờ lên
     · DB rớt binding   → lượt xem về 0, bình luận không gửi được
     · GC_KEY chưa đặt  → mọi cửa chủ trang đóng lại

   Lựa chọn ấy đúng với NGƯỜI ĐỌC. Nhưng nó đẩy cái giá sang chủ trang: không
   có gì đỏ, không có gì kêu, và một thứ hỏng có thể nằm im hàng tuần cho tới
   lúc tình cờ đụng vào. Hàm này là cái còn thiếu — nó đi soi đúng mấy chỗ ấy.

   ── CHỈ BÁO KHI TRẠNG THÁI ĐỔI ────────────────────────────────────────
   Gửi thư mỗi lần thấy hỏng thì một thứ hỏng lâu ngày đẻ ra một lá thư y hệt
   mỗi sáng — cách nhanh nhất biến cảnh báo thành thứ bị bỏ qua.

   Nên ở đây lưu "lần trước thấy gì" vào bảng `he_thong`, và chỉ gửi khi bức
   tranh KHÁC lần trước. Hỏng thì báo một lần. Sửa xong thì báo một lần nữa
   ("đã ổn lại") — vế thứ hai quan trọng ngang vế đầu: không có nó thì sau khi
   sửa, chẳng gì xác nhận là mình đã sửa đúng.

   ── KHÔNG KIỂM THỨ KHÔNG DÙNG ─────────────────────────────────────────
   GH_TOKEN và GEMINI_KEY chỉ soi khi chúng đã được đặt. Chủ trang không dùng ô
   đăng bài thì thiếu token là chuyện bình thường — mà báo lỗi cho một thứ cố ý
   không bật là dạy người ta bỏ qua thư của mình.
   ══════════════════════════════════════════════════════════════════════ */

const TAO_HE_THONG = `CREATE TABLE IF NOT EXISTS he_thong (
  khoa TEXT PRIMARY KEY,
  gia  TEXT NOT NULL DEFAULT '',
  sua  TEXT NOT NULL DEFAULT ''
)`;

async function docHeThong(env, khoa) {
  try {
    await env.DB.prepare(TAO_HE_THONG).run();
    const d = await env.DB.prepare('SELECT gia FROM he_thong WHERE khoa = ?')
      .bind(khoa).first();
    return d ? String(d.gia || '') : '';
  } catch (e) { return ''; }
}

async function ghiHeThong(env, khoa, gia) {
  try {
    await env.DB.prepare(TAO_HE_THONG).run();
    await env.DB.prepare(
      `INSERT INTO he_thong (khoa, gia, sua) VALUES (?, ?, ?)
       ON CONFLICT(khoa) DO UPDATE SET gia = excluded.gia, sua = excluded.sua`
    ).bind(khoa, String(gia), new Date().toISOString()).run();
  } catch (e) { /* mất một mốc trạng thái không đáng làm hỏng cả lượt chạy */ }
}

export async function tuKiem(env) {
  const phep = [];

  /* ── D1 ──
     Không chỉ hỏi "có binding không" mà CHẠY THẬT một câu. Binding còn nguyên
     mà cơ sở dữ liệu bị xoá hay đổi tên thì `env.DB` vẫn tồn tại — chỉ tới lúc
     truy vấn mới lộ. Hỏi cái rẻ nhất, nhưng vẫn phải đi tới nơi. */
  if (!env.DB) {
    phep.push({ ten: 'D1', ok: false, noi: 'chưa gắn binding DB' });
  } else {
    try {
      await env.DB.prepare('SELECT 1').first();
      phep.push({ ten: 'D1', ok: true, noi: 'chạy' });
    } catch (e) {
      phep.push({ ten: 'D1', ok: false,
                  noi: String((e && e.message) || e).slice(0, 120) });
    }
  }

  /* ── Khoá chủ trang ──
     Thiếu là MỌI cửa của chủ trang đóng: duyệt bình luận, viết ghi chú, đăng
     bài. Mà triệu chứng phía ngoài chỉ là "gõ khoá vào không vào được" — rất
     dễ tưởng mình gõ sai khoá. */
  const coKhoa = !!(env.GC_ID && env.GC_KEY);
  phep.push({
    ten: 'Khoá chủ trang',
    ok: coKhoa,
    noi: coKhoa ? 'đã đặt'
       : 'thiếu GC_ID hoặc GC_KEY — mọi cửa chủ trang đang đóng'
  });

  /* ── Đường gửi thư ──
     Nghịch lý phải nói thẳng: thiếu khoá Resend thì chính lá thư báo này cũng
     không gửi được. Vẫn kiểm, vì lượt gọi tay `POST /api/thu-bao` trả JSON đọc
     được ngay — đó mới là chỗ dòng này có ích. */
  phep.push({
    ten: 'Resend',
    ok: !!(env.RESEND_KEY && env.THU_DEN),
    noi: env.RESEND_KEY ? (env.THU_DEN ? 'đã đặt' : 'thiếu THU_DEN')
                        : 'thiếu RESEND_KEY'
  });

  /* ── Token GitHub ──
     Token fine-grained của GitHub có HẠN, và lúc hết hạn thì ô đăng bài ở
     /z-admin/ im lặng: bấm Đăng, không báo gì, bài không bao giờ xuất hiện.
     Đúng thứ cần một cái chuông.

     Gọi API thật chứ không chỉ xem chuỗi có tồn tại — một token hết hạn vẫn là
     một chuỗi trông y như token còn hạn. */
  if (env.GH_TOKEN && env.GH_REPO) {
    try {
      const r = await fetch(`https://api.github.com/repos/${env.GH_REPO}`, {
        headers: {
          Authorization: `Bearer ${env.GH_TOKEN}`,
          'User-Agent': 'zoey-in-borderland-tukiem',
          Accept: 'application/vnd.github+json'
        }
      });
      phep.push({
        ten: 'GitHub token',
        ok: r.ok,
        noi: r.ok ? 'còn hạn'
           : r.status === 401 ? 'hết hạn hoặc bị thu hồi (401)'
           : r.status === 404 ? 'không thấy kho mã, hoặc token thiếu quyền (404)'
           : `GitHub trả ${r.status}`
      });
    } catch (e) {
      phep.push({ ten: 'GitHub token', ok: false,
                  noi: 'không gọi được API: '
                     + String((e && e.message) || e).slice(0, 80) });
    }
  }

  /* ── Khoá Gemini ──
     Mức nhẹ nhất: thiếu thì ô trích dẫn vẫn chạy bằng kho câu sẵn và không ai
     thấy gì bất thường. Vẫn đáng báo MỘT lần, vì "vẫn chạy" ở đây nghĩa là một
     tính năng đã tắt mà không ai biết.

     Chỉ soi khi khoá từng được đặt — `undefined` nghĩa là chủ trang chưa bao
     giờ bật lớp này, chuỗi rỗng nghĩa là đã bật rồi mất. */
  if (env.GEMINI_KEY !== undefined) {
    phep.push({
      ten: 'Gemini',
      ok: !!env.GEMINI_KEY,
      noi: env.GEMINI_KEY ? 'đã đặt'
         : 'thiếu GEMINI_KEY — ô trích dẫn đang dùng kho câu sẵn'
    });
  }

  const hong = phep.filter((p) => !p.ok);

  /* Chữ ký gọn của bức tranh hiện tại. So CHỮ KÝ chứ không so số lỗi: hai thứ
     hỏng khác nhau mà cùng đếm ra "1" thì vẫn là hai chuyện khác nhau. */
  const chuKy = phep.map((p) => `${p.ten}:${p.ok ? 1 : 0}`).join('|');
  const truoc = env.DB ? await docHeThong(env, 'tukiem') : '';

  if (chuKy === truoc) return { ok: true, boQua: 'khong-doi', hong: hong.length };

  const tieuDe = hong.length
    ? `⚠ ${hong.length} thứ đang hỏng · z-in-borderland`
    : '✓ Đã ổn lại · z-in-borderland';

  const moDau = hong.length
    ? 'Tự kiểm thấy có thay đổi. Mấy mục dấu ✗ đang hỏng:'
    : 'Mọi thứ đã trở lại bình thường.';

  const chuThuong = `${moDau}\n\n`
    + phep.map((p) => `${p.ok ? '✓' : '✗'} ${p.ten} — ${p.noi}`).join('\n')
    + `\n\n—\nSửa ở Cloudflare → Worker → Settings → Runtime → Variables and`
    + ` Secrets.\nNhớ chọn Type = Secret, không phải Text.`;

  const chuHTML =
    `<div style="max-width:560px;margin:0 auto;padding:24px 16px">
       <div style="font:600 17px/1.3 system-ui,sans-serif;margin-bottom:12px;color:${hong.length ? '#b91c1c' : '#15803d'}">
         ${thoat(tieuDe)}
       </div>
       <div style="font:400 14px/1.6 system-ui,sans-serif;color:#444;margin-bottom:14px">
         ${thoat(moDau)}
       </div>
       <table style="width:100%;border-collapse:collapse;font:400 14px/1.6 system-ui,sans-serif">
         ${phep.map((p) => `<tr>
             <td style="padding:6px 8px 6px 0;width:1em;color:${p.ok ? '#15803d' : '#b91c1c'}">${p.ok ? '✓' : '✗'}</td>
             <td style="padding:6px 8px 6px 0;color:#111;white-space:nowrap">${thoat(p.ten)}</td>
             <td style="padding:6px 0;color:#666">${thoat(p.noi)}</td>
           </tr>`).join('')}
       </table>
       <div style="font:400 13px/1.6 system-ui,sans-serif;color:#888;margin-top:18px">
         Sửa ở Cloudflare → Worker → Settings → Runtime → Variables and Secrets.<br>
         Nhớ chọn <b>Type = Secret</b>, không phải Text.
       </div>
     </div>`;

  const kq = await guiThu(env, { tieuDe, chuThuong, chuHTML });

  /* Chỉ ghi mốc KHI GỬI ĐƯỢC. Ghi trước rồi gửi hỏng thì lần sau chữ ký đã
     trùng, và cái tin ấy mất luôn — im lặng, đúng thứ hàm này sinh ra để chống. */
  if (kq.ok && env.DB) await ghiHeThong(env, 'tukiem', chuKy);

  return { ...kq, hong: hong.length, doi: true };
}

/* ══════════════════════════════════════════════════════════════════════
   ④ SAO LƯU sang Google Sheet

   ── VÌ SAO KHÔNG GỌI THẲNG DRIVE API ──────────────────────────────────
   Gọi thẳng thì Worker phải tự ký JWT RS256 bằng khoá của một service account,
   đổi lấy access token, rồi mới đẩy được file. Khoảng ba lần lượng mã của cả
   khối này, cộng một GCP project, một khoá JSON, và một thư mục Drive phải chia
   sẻ đúng cho email service account — bốn chỗ để vấp lúc cài, mỗi chỗ hỏng một
   kiểu khác nhau.

   Apps Script gánh hết phần ấy: script CHẠY DƯỚI DANH NGHĨA CHỦ TRANG, nên nó
   vốn đã có quyền ghi vào Drive của chính mình. Không OAuth, không khoá máy,
   không chia sẻ thư mục. Worker chỉ việc POST một gói JSON kèm một chuỗi bí mật
   dùng chung.

   ── ĐÂY KHÔNG PHẢI LẦN QUAY LẠI CỦA APPS SCRIPT CŨ ────────────────────
   `binh-luan.js` có một đoạn dài kể vì sao bỏ Apps Script: nó ĐỨNG TRÊN ĐƯỜNG
   ĐỌC — mỗi người mở một bài đều phải đợi một lượt gọi sang Google.

   Chỗ này khác hẳn về bản chất. Nó chạy MỖI TUẦN MỘT LẦN, lúc không có ai ngồi
   đó, và không người đọc nào chờ nó. Apps Script chậm hay nguội cũng không ai
   biết. Lý do bỏ hồi đó không áp vào đây.

   ── VÌ SAO KHÔNG PHẢI FILE .xlsx ĐÍNH KÈM MAIL ────────────────────────
   Vì file đính kèm vẫn bắt phải NHỚ: nhớ kéo từ Gmail sang Drive, mỗi tuần. Cái
   gì cần nhớ hằng tuần thì tuần thứ ba là quên. Ghi thẳng vào Sheet thì không
   có bước nào để quên — và Sheet còn hơn .xlsx ở chỗ nó CỘNG DỒN: mở ra thấy cả
   lịch sử, không phải đi tìm file của tuần nào.

   ── EMAIL NGƯỜI BÌNH LUẬN: MẶC ĐỊNH KHÔNG CHÉP ────────────────────────
   `SAO_LUU_EMAIL` mặc định tắt. Bật thì bản sao lưu khôi phục được đầy đủ, nhưng
   địa chỉ của người đọc sẽ nằm trong Google Drive — đúng thứ lời hứa đầu
   `binh-luan.js` nói là không nên. Tắt thì mất phần liên hệ khi khôi phục.

   Không có lựa chọn nào đúng cho mọi người, nên nó là một cái CÔNG TẮC chứ không
   phải một quyết định chôn trong mã. Mặc định chọn vế an toàn.
   ══════════════════════════════════════════════════════════════════════ */

const BANG_SAO_LUU = ['binh_luan', 'ghi_chu', 'xem'];
const TOI_DA_DONG_SAO_LUU = 5000;

export async function chaySaoLuu(env) {
  if (!env.DB) return { ok: false, loi: 'chua-gan-D1' };
  /* Chưa khai URL = chủ trang chưa bật tính năng này. Bỏ qua, không phải lỗi —
     xem lý do ở `boQua` của tuKiem: báo lỗi cho thứ cố ý không bật là dạy người
     ta bỏ qua thư của mình. */
  if (!env.SAO_LUU_URL) return { ok: true, boQua: 'thieu-SAO_LUU_URL' };
  /* Có URL mà thiếu khoá thì KHÁC: đã bật rồi nhưng cài dở. Cái này phải kêu. */
  if (!env.SAO_LUU_KHOA) return { ok: false, loi: 'thieu-SAO_LUU_KHOA' };

  const chepEmail = String(env.SAO_LUU_EMAIL || '') === '1';
  const goi = {};
  const dem = {};

  for (const bang of BANG_SAO_LUU) {
    try {
      const kq = await env.DB.prepare(`SELECT * FROM ${bang} LIMIT ?`)
        .bind(TOI_DA_DONG_SAO_LUU).all();
      let ds = kq.results || [];

      /* Gỡ cột email NGAY Ở ĐÂY, trước khi gói rời khỏi Worker. Lọc ở phía Apps
         Script thì dữ liệu đã đi qua mạng rồi — muộn. */
      if (bang === 'binh_luan' && !chepEmail) {
        ds = ds.map((d) => { const { email, ...con } = d; return con; });
      }

      goi[bang] = ds;
      dem[bang] = ds.length;
    } catch (e) {
      /* Bảng chưa có = tính năng ấy chưa ai dùng. Không phải lỗi, và KHÔNG được
         làm hỏng bản sao lưu của mấy bảng còn lại. */
      const loi = String((e && e.message) || e);
      if (!/no such table/i.test(loi)) return { ok: false, loi: `${bang}: ${loi}` };
      goi[bang] = [];
      dem[bang] = 0;
    }
  }

  let ra;
  try {
    ra = await fetch(env.SAO_LUU_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        khoa: env.SAO_LUU_KHOA,
        luc: new Date().toISOString(),
        coEmail: chepEmail,
        bang: goi
      })
    });
  } catch (e) {
    return { ok: false, loi: 'mang: ' + String((e && e.message) || e) };
  }

  /* ── APPS SCRIPT TRẢ 200 CHO CẢ LÚC HỎNG ──
     Web app của Apps Script chuyển hướng qua `script.googleusercontent.com` rồi
     trả 200 kèm một trang HTML lỗi. Chỉ xem mã trạng thái thì một lượt sao lưu
     hỏng trông y như một lượt thành công.

     Mà sao lưu hỏng nhưng tưởng là chạy là kiểu hỏng TỆ NHẤT: nó chỉ lộ ra đúng
     lúc cần khôi phục, tức là lúc đã mất dữ liệu rồi. Nên phải ĐỌC thân trả về
     và đòi đúng `{"ok":true}`. */
  const chu = await ra.text().catch(() => '');
  let json = null;
  try { json = JSON.parse(chu); } catch (e) { /* không phải JSON — coi như hỏng */ }

  if (!ra.ok || !json || json.ok !== true) {
    /* Sao lưu hỏng là đúng thứ phải kêu lên, không phải chỉ nằm im trong log. */
    await guiThu(env, {
      tieuDe: '⚠ Sao lưu tuần này HỎNG · z-in-borderland',
      chuThuong: `Lượt sao lưu sang Google Sheet không thành công.\n\n`
               + `Mã: ${ra.status}\nTrả về: ${chu.slice(0, 300)}\n\n`
               + `Kiểm hai chỗ: Apps Script còn deploy không, và SAO_LUU_KHOA `
               + `hai bên có khớp nhau không.`,
      chuHTML: `<div style="font:400 14px/1.7 system-ui,sans-serif;padding:24px;max-width:560px">
          <b style="color:#b91c1c">Sao lưu tuần này hỏng.</b><br><br>
          Mã: <code>${thoat(String(ra.status))}</code><br>
          Trả về: <code>${thoat(chu.slice(0, 300))}</code><br><br>
          <span style="color:#666">Kiểm hai chỗ: Apps Script còn deploy không,
          và <code>SAO_LUU_KHOA</code> hai bên có khớp nhau không.</span>
        </div>`
    });
    return { ok: false, loi: `sao-luu ${ra.status}`, chiTiet: chu.slice(0, 300) };
  }

  return { ok: true, dem, coEmail: chepEmail, sheet: json.sheet || '' };
}

/* ══════════ CHỦ TRANG GỌI TAY ĐỂ THỬ ══════════
   POST /api/thu-bao với hai header khoá. Chạy đúng thân hàm mà lịch chạy, nên
   thử ở đây đúng nghĩa là thử cái sẽ chạy thật — không phải một bản mô phỏng.

   Chọn việc bằng `?viec=`:

     (không có)     bình luận đang chờ duyệt — mặc định, vì đây là việc chạy
                    hằng ngày và cũng là việc hay phải soi nhất
     ?viec=kiem     tự kiểm
     ?viec=saoluu   sao lưu sang Google Sheet
     ?ep=1          gửi một lá thư THỬ, kể cả khi chẳng có tin gì

   `?ep=1` cần thiết vì lúc vừa dựng xong thì hàng chờ thường rỗng và mọi thứ
   đều đang chạy tốt — cả ba việc đều im lặng, đúng như thiết kế. Mà một cái
   chuông chưa bao giờ nghe kêu thì chưa biết nó có kêu không.

   `?viec=kiem` KHÔNG bỏ qua mốc trạng thái: gọi lần đầu thì gửi thư, gọi lại
   ngay thì trả `boQua:"khong-doi"`. Cố ý — thử phải thử đúng cái sẽ chạy thật,
   kể cả phần nín. Muốn thấy thư thì dùng `?ep=1`. */
export async function onRequestPost({ request, env }) {
  if (!laChuTrang(request, env)) {
    return new Response(JSON.stringify({ ok: false, loi: 'sai khoá' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const tham = new URL(request.url).searchParams;
  const viec = tham.get('viec') || '';

  let kq;
  if (tham.get('ep') === '1') {
    kq = await guiThu(env, {
      tieuDe: 'Thử thư báo · z-in-borderland',
      chuThuong: 'Đường gửi thư chạy được. Đây là thư thử, không có tin gì cả.',
      chuHTML: '<div style="font:400 15px/1.6 system-ui,sans-serif;padding:24px">'
             + 'Đường gửi thư chạy được.<br>'
             + '<span style="color:#888">Đây là thư thử, không có tin gì cả.</span></div>'
    });
  } else if (viec === 'kiem') {
    kq = await tuKiem(env);
  } else if (viec === 'saoluu') {
    kq = await chaySaoLuu(env);
  } else {
    kq = await chayThuBao(env);
  }

  return new Response(JSON.stringify(kq), {
    status: kq.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': 'no-store' }
  });
}
