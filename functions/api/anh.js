/* ══════════════════════════════════════════════════════════════════════
   THẢ ẢNH THẲNG VÀO KHUNG SOẠN THẢO — không mở Finder, không gõ đường dẫn.

   ── VÌ SAO CẦN MỘT CỬA RIÊNG ──
   Trước bản này, chèn ảnh vào bài là một việc ba chặng: mở máy, chép file vào
   `public/media/<năm>/<slug>/`, commit, rồi quay lại /z-admin/ GÕ TAY đường
   dẫn ấy vào ô hỏi "Image path". Gõ sai một ký tự thì bài lên với một ô ảnh
   vỡ, và chỉ phát hiện ra sau khi Cloudflare dựng xong.

   Tức là: viết bài thì không cần mở máy, nhưng CHÈN MỘT TẤM ẢNH thì cần. Cửa
   này bỏ nốt chặng ấy.

   ── ĐƯỜNG ĐI ──
     kéo thả / dán / chọn file
        → trình duyệt thu nhỏ và đổi sang WebP ngay tại máy (xem soan.js)
        → hàm này  →  public/media/<năm>/<slug>/<tên>  →  GitHub
        → Cloudflare dựng lại  →  ảnh có thật ở /media/<năm>/<slug>/<tên>

   ── HỆ QUẢ PHẢI CHẤP NHẬN ──
   Ảnh vừa tải lên CHƯA có ở địa chỉ ấy cho tới khi Cloudflare dựng xong —
   khoảng một phút. Nên khung soạn thảo KHÔNG hiện ảnh theo đường dẫn mới; nó
   giữ bản xem tại chỗ trong bộ nhớ trình duyệt và chỉ cất đường dẫn thật vào
   `data-that`. Người viết thấy ảnh ngay, còn file .md thì mang đường dẫn đúng.

   Mỗi tấm ảnh là MỘT commit, nên thả năm tấm là năm lượt dựng lại xếp hàng.
   Gộp chúng vào một commit thì phải đi đường Git Data API — ba lượt gọi
   (blob → tree → commit) cho mỗi lượt gộp, và một nhánh mã nữa phải đúng.
   Đắt hơn cái nó tiết kiệm, ở một trang mỗi tuần vài bài.

   ── CẦN GÌ Ở PHÍA CLOUDFLARE ──
   Đúng năm thứ mà functions/api/bai.js đang cần, không thêm gì:
     GH_TOKEN · GH_REPO · GH_NHANH · GC_ID · GC_KEY
   ══════════════════════════════════════════════════════════════════════ */

const GH = 'https://api.github.com';
const THU_MUC_ANH = 'public/media';
const UA = 'zoey-in-borderland-admin';

/* ── GIỚI HẠN ──
   4 MB là kích thước SAU khi trình duyệt đã thu nhỏ. Một tấm ảnh 1600px rộng
   ở chất lượng WebP 0.82 nặng chừng 150–400 KB, nên 4 MB là rất rộng rãi —
   nó ở đây để chặn ca trình duyệt cũ không thu nhỏ được và gửi thẳng file gốc
   12 MB từ điện thoại.

   GitHub Contents API nhận tới 100 MB, nhưng nội dung đi dưới dạng base64
   nằm trong một chuỗi JSON: 4 MB ảnh thành ~5,5 MB chữ, và bộ nhớ của một
   Worker phải chứa cả chuỗi ấy. Trên ngưỡng đó thì phải đổi sang Git Data API
   và luồng nhiều bước. */
const TOI_DA = 4 * 1024 * 1024;

/* ── ĐUÔI FILE NHẬN VÀO ──
   KHÔNG có .svg, và đây là một quyết định về an toàn chứ không phải về sở
   thích: một file .svg mở thẳng bằng đường dẫn là một tài liệu XML chạy được
   <script> TRONG chính tên miền của trang. Ảnh do chủ trang tải lên nên rủi ro
   thấp, nhưng "thấp" không phải "không", và blog này không cần .svg tải lên
   bao giờ — mấy sơ đồ .svg đang có đều viết tay rồi commit thẳng.

   .avif và .webp đứng trước vì đó là thứ trình duyệt sinh ra ở soan.js; jpg,
   png, gif còn đây cho trình duyệt không đổi định dạng được. */
const DUOI = {
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png' : 'png',
  'image/gif' : 'gif'
};

function bang(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  let lech = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    lech |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return lech === 0;
}

function chuaDatKhoa(env) { return !env.GC_ID || !env.GC_KEY; }

function laChuTrang(request, env) {
  if (chuaDatKhoa(env)) return false;
  return bang(request.headers.get('x-gc-id'), env.GC_ID)
      && bang(request.headers.get('x-gc-key'), env.GC_KEY);
}

function ra(du, ma = 200) {
  return new Response(JSON.stringify(du), {
    status: ma,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': 'no-store' }
  });
}

function nhanh(env) { return String(env.GH_NHANH || 'main'); }

async function goiGH(env, duong, tuyChon = {}) {
  const r = await fetch(GH + duong, {
    ...tuyChon,
    headers: {
      Authorization: `Bearer ${env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': UA,
      ...(tuyChon.body ? { 'Content-Type': 'application/json' } : {}),
      ...(tuyChon.headers || {})
    }
  });
  let du = null;
  try { du = await r.json(); } catch (e) {}
  return { ma: r.status, du };
}

/* ── TÊN FILE: CHỖ NGUY HIỂM NHẤT TRONG CẢ HÀM ──
   `thuMuc` và tên file đi thẳng vào đường dẫn gửi cho GitHub, và token này ghi
   được vào MỌI file trong kho mã. Một tên chứa `../../.github/workflows/x.yml`
   là chạy được mã tuỳ ý trên kho.

   Nên không lọc theo danh sách đen, mà DỰNG LẠI tên từ đầu: chỉ giữ chữ
   thường, số và gạch ngang, mọi thứ khác thành gạch ngang. Dấu chấm cũng bỏ —
   phần đuôi được gắn lại từ `DUOI`, tức là từ loại file đã kiểm, chứ không
   phải từ chữ người gửi lên. */
function sach(s, dai) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, dai);
}

/* Base64 → số byte thật, không phải giải mã cả chuỗi ra để đếm. Bốn ký tự
   base64 là ba byte, trừ đi mỗi dấu `=` ở đuôi một byte. Đếm trước khi giải
   mã thì một file 50 MB gửi lên bị chặn mà không phải nạp cả nó vào bộ nhớ. */
function soByte(b64) {
  const n = b64.length;
  if (!n) return 0;
  let bu = 0;
  if (b64.charCodeAt(n - 1) === 61) bu++;
  if (b64.charCodeAt(n - 2) === 61) bu++;
  return Math.floor(n / 4) * 3 - bu;
}

export async function onRequestPost({ request, env }) {
  if (chuaDatKhoa(env)) {
    return ra({ ok: false, loi: 'cauhinh', thieu: ['GC_ID', 'GC_KEY'],
                chiTiet: 'Máy chủ chưa đặt GC_ID và GC_KEY. Xem docs/CAI-DAT.md §6.' }, 503);
  }
  if (!laChuTrang(request, env)) return ra({ ok: false, loi: 'khoa' }, 401);
  if (!env.GH_TOKEN || !env.GH_REPO) {
    return ra({ ok: false, loi: 'cauhinh',
                thieu: [!env.GH_TOKEN && 'GH_TOKEN', !env.GH_REPO && 'GH_REPO'].filter(Boolean) }, 503);
  }

  let b;
  try { b = await request.json(); } catch (e) { return ra({ ok: false, loi: 'json' }, 400); }

  const loai = String(b.loai || '').toLowerCase().split(';')[0].trim();
  const duoi = DUOI[loai];
  if (!duoi) {
    return ra({ ok: false, loi: 'loai',
                chiTiet: `không nhận loại file "${loai || '?'}" — chỉ nhận ${Object.keys(DUOI).join(', ')}` }, 415);
  }

  /* Chuỗi base64 phải ĐÚNG là base64 trước khi đưa cho GitHub. Gửi rác lên thì
     GitHub trả một câu lỗi chung chung, và đứng ở /z-admin/ không đoán ra được
     là hỏng ở đâu. */
  const duLieu = String(b.duLieu || '').replace(/^data:[^,]*,/, '');
  if (!duLieu || !/^[A-Za-z0-9+/]+={0,2}$/.test(duLieu)) {
    return ra({ ok: false, loi: 'dulieu', chiTiet: 'nội dung ảnh không đọc được' }, 400);
  }
  const co = soByte(duLieu);
  if (co <= 0) return ra({ ok: false, loi: 'dulieu', chiTiet: 'ảnh rỗng' }, 400);
  if (co > TOI_DA) {
    return ra({ ok: false, loi: 'to',
                chiTiet: `ảnh ${(co / 1048576).toFixed(1)} MB — quá ${TOI_DA / 1048576} MB`,
                co, toiDa: TOI_DA }, 413);
  }

  /* ── THƯ MỤC: <năm>/<slug bài> ──
     Cùng nếp với mọi ảnh đang có trong kho (xem public/media/2026/…): mỗi bài
     một thư mục riêng, nên xoá bài là xoá gọn cả ảnh của nó, không còn ảnh mồ
     côi nằm lại mà không ai dám dọn. */
  const nam = String(b.nam || '').trim();
  if (!/^\d{4}$/.test(nam)) return ra({ ok: false, loi: 'nam', chiTiet: 'năm phải là bốn chữ số' }, 400);

  const bai = sach(b.bai, 80);
  if (!bai) return ra({ ok: false, loi: 'bai', chiTiet: 'chưa có đường dẫn bài để xếp ảnh vào' }, 400);

  let ten = sach(b.ten, 50) || 'anh';
  /* Tên rút ra từ một file điện thoại thường là `img-20260917-wa0003`: đúng cú
     pháp nhưng không nói gì. Không tự sửa — người gửi biết rõ hơn hàm này —
     chỉ chặn ca tên rút xong chỉ còn mấy con số, vì `20260917.webp` nằm cạnh
     `bia.webp` thì sau này không ai biết nó là tấm nào. */
  if (/^\d+$/.test(ten)) ten = 'anh-' + ten;

  const thuMuc = `${THU_MUC_ANH}/${nam}/${bai}`;
  let duongFile = `${thuMuc}/${ten}.${duoi}`;

  /* ── TRÙNG TÊN THÌ ĐỔI TÊN, KHÔNG GHI ĐÈ ──
     Hai tấm ảnh cùng tên `bia.webp` trong một bài là chuyện thường: chụp màn
     hình hai lần, kéo cả hai vào. Ghi đè thì tấm đầu biến mất khỏi bài đã đăng
     TRƯỚC ĐÓ mà không có dấu vết nào — nó vẫn còn trong lịch sử git, nhưng
     trang thì đã đổi.

     Một lượt hỏi, và nếu trùng thì gắn thêm bốn ký tự thời gian. Không đếm
     `-2`, `-3`, `-4`: đếm thì mỗi lần trùng là một lượt gọi GitHub nữa, và
     Workers có hạn mức số lượt trong một request. */
  const { ma: maCo } = await goiGH(env,
    `/repos/${env.GH_REPO}/contents/${duongFile}?ref=${encodeURIComponent(nhanh(env))}`);
  if (maCo === 200) {
    const dau = Date.now().toString(36).slice(-4);
    duongFile = `${thuMuc}/${ten}-${dau}.${duoi}`;
  }

  const { ma, du } = await goiGH(env, `/repos/${env.GH_REPO}/contents/${duongFile}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `ảnh: ${duongFile.split('/').pop()} (${bai})`,
      content: duLieu,
      branch: nhanh(env)
    })
  });

  if (ma !== 200 && ma !== 201) {
    return ra({ ok: false, loi: 'github', maGH: ma,
                chiTiet: (du && du.message) || 'GitHub từ chối ghi ảnh' }, 502);
  }

  /* Đường dẫn CÔNG KHAI, không phải đường dẫn trong kho: `public/` là gốc của
     trang đã dựng, nên `public/media/x.webp` ra `/media/x.webp`. */
  return ra({
    ok: true,
    duong: '/' + duongFile.slice('public/'.length),
    trongKho: duongFile,
    co,
    commit: du && du.commit ? du.commit.html_url : null
  }, 201);
}

/* Mọi phương thức khác: nói rõ cửa này chỉ nhận POST. Trả 404 thì lúc gỡ lỗi
   không phân biệt được "gõ sai địa chỉ" với "địa chỉ đúng, gọi sai cách". */
export async function onRequestGet() {
  return ra({ ok: false, loi: 'cach', chiTiet: 'cửa /api/anh chỉ nhận POST' }, 405);
}
