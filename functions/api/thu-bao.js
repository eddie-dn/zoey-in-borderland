/* ============================================================
   /api/thu-bao — THƯ BÁO GOM TRONG NGÀY.

   ── VÌ SAO CẦN ────────────────────────────────────────────────────────
   Bình luận vào D1 với `duyet = 0` và NẰM IM ở đó cho tới khi chủ trang mở
   `#duyet` ra bấm. Không có gì nhắc. Người đọc gõ một câu hỏi tử tế rồi đợi —
   họ không biết là đang đợi một người chưa biết mình có gì để đọc.

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

   ── HAI ĐƯỜNG VÀO, MỘT THÂN HÀM ───────────────────────────────────────
     · `chayThuBao(env)` — lịch gọi, mỗi ngày một lượt (xem `scheduled` trong
       worker.js và khối `triggers` trong wrangler.jsonc).
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

  const tu = env.THU_TU || 'hi@z-in-borderland.com';

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
    const link  = `${goc}${d.trang}#duyet`;

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
    `\n\n—\nDuyệt: mở bất kỳ bài nào rồi thêm #duyet vào địa chỉ.\n${goc}`;

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
       <div style="font:400 13px/1.6 system-ui,sans-serif;color:#888;margin-top:20px">
         Duyệt bằng cách mở bất kỳ bài nào rồi thêm <code>#duyet</code> vào địa chỉ.<br>
         <a href="${thoat(goc)}" style="color:#0369a1">${thoat(goc)}</a>
       </div>
     </div>`;

  const kq = await guiThu(env, { tieuDe, chuThuong, chuHTML });
  return { ...kq, moi: moi.length, hangCho: tong };
}

/* ══════════ CHỦ TRANG GỌI TAY ĐỂ THỬ ══════════
   POST /api/thu-bao với hai header khoá. Chạy đúng thân hàm mà lịch chạy, nên
   thử ở đây đúng nghĩa là thử cái sẽ chạy thật — không phải một bản mô phỏng.

   Nhận `?ep=1` để gửi KỂ CẢ khi không có gì mới. Cần nó vì lúc dựng xong tính
   năng thì hàng chờ thường rỗng, mà một cái chuông chưa bao giờ nghe kêu thì
   chưa biết nó có kêu không. */
export async function onRequestPost({ request, env }) {
  if (!laChuTrang(request, env)) {
    return new Response(JSON.stringify({ ok: false, loi: 'sai khoá' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const ep = new URL(request.url).searchParams.get('ep') === '1';

  let kq;
  if (ep) {
    kq = await guiThu(env, {
      tieuDe: 'Thử thư báo · z-in-borderland',
      chuThuong: 'Đường gửi thư chạy được. Đây là thư thử, không có bình luận nào.',
      chuHTML: '<div style="font:400 15px/1.6 system-ui,sans-serif;padding:24px">'
             + 'Đường gửi thư chạy được.<br>'
             + '<span style="color:#888">Đây là thư thử, không có bình luận nào.</span></div>'
    });
  } else {
    kq = await chayThuBao(env);
  }

  return new Response(JSON.stringify(kq), {
    status: kq.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': 'no-store' }
  });
}
