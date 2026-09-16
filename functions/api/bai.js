/* ══════════════════════════════════════════════════════════════════════
   ĐĂNG BÀI THẲNG TỪ /z-admin/ — không mở máy, không chạm dòng lệnh.

   ── ĐƯỜNG ĐI CỦA MỘT BÀI ──
     /z-admin/  →  hàm này  →  GitHub  →  Cloudflare thấy commit  →  dựng lại
                                                                      ↓
                                                              ~1 phút, bài lên

   ── VÌ SAO GHI VÀO GITHUB CHỨ KHÔNG VÀO D1 ──
   Ghi chú (xem ghi-chu.js) sống thẳng trong D1 và hiện ra bằng JavaScript lúc
   người đọc mở /notes/. Với mấy dòng ngắn thì thế là đủ.

   Một BÀI thì không. Bài cần: đường dẫn riêng của nó, một mục trong feed.xml,
   một dòng trong sitemap.xml, một mẩu trong ô tìm kiếm, và thẻ chia sẻ để lúc
   gửi vào Facebook nó ra ảnh bìa với tiêu đề. Tất cả những thứ đó do bộ dựng
   sinh ra lúc build. Bài chỉ nằm trong cơ sở dữ liệu là bài không có mặt ở chỗ
   nào trong số đó — nó chỉ hiện với người bật JavaScript, và biến mất khỏi mọi
   đường tìm ra nó.

   Nên hàm này không tự dựng trang. Nó làm đúng một việc: đặt một file .md vào
   đúng chỗ trong kho mã, y như lúc ngồi gõ ở máy. Phần còn lại vẫn là bộ dựng
   cũ, không có đường tắt nào.

   Hệ quả phải chấp nhận: bấm Đăng xong KHÔNG thấy bài ngay. Phải đợi Cloudflare
   dựng xong. Hàm trả về luôn đường dẫn tới commit để còn soi được nó đang tới
   đâu, và bài sẽ nằm ở đâu.

   ── CẦN GÌ Ở PHÍA CLOUDFLARE ──
     GH_TOKEN   Secret   — token GitHub, quyền Contents: Read and write
     GH_REPO    Var      — "tên-tài-khoản/tên-repo"
     GH_NHANH   Var      — nhánh Cloudflare đang dựng, thiếu thì hiểu là "main"
     GC_ID      Secret   ┐ đúng cặp khoá chủ trang đang dùng cho
     GC_KEY     Secret   ┘ bình luận và ghi chú
   Từng bước: docs/CAI-DAT.md.

   GH_TOKEN là thứ mạnh nhất trong cả dự án — ai cầm nó thì ghi được vào kho mã.
   Nó KHÔNG BAO GIỜ rời khỏi hàm này: trình duyệt gửi lên cặp khoá chủ trang,
   hàm đối chiếu, rồi TỰ nó nói chuyện với GitHub. Trang không thấy token, và
   xem mã nguồn trang cũng không thấy.
   ══════════════════════════════════════════════════════════════════════ */

const GH = 'https://api.github.com';
const THU_MUC_BAI = 'content/posts';

/* GitHub bắt buộc có User-Agent, thiếu là trả 403 kèm một câu khó hiểu. */
const UA = 'zoey-in-borderland-admin';

/* ── SO KHOÁ KHÔNG ĐỂ LỘ QUA THỜI GIAN ──
   Giống hệt bản trong binh-luan.js, và cố ý chép lại chứ không tách ra file
   chung: mỗi hàm trong functions/ phải đứng một mình được: Cloudflare gói từng
   hàm riêng, và một file dùng chung là một chỗ nữa để quên cập nhật. Mười dòng
   thì chép lại rẻ hơn. */
function bang(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  let lech = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    lech |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return lech === 0;
}

/* Thiếu một vế khoá ở phía máy chủ là CHẶN hết, không phải mở hết. */
function laChuTrang(request, env) {
  if (chuaDatKhoa(env)) return false;
  return bang(request.headers.get('x-gc-id'), env.GC_ID)
      && bang(request.headers.get('x-gc-key'), env.GC_KEY);
}


/* ── "SAI KHOÁ" VÀ "CHƯA CÓ KHOÁ" PHẢI NÓI RA HAI CÂU KHÁC NHAU ──
   Chưa đặt GC_ID/GC_KEY ở Cloudflare thì không ai vào được, kể cả người gõ
   đúng. Trả về "sai khoá" lúc ấy đẩy người ta đi tìm lỗi ở chỗ mình vừa gõ —
   gõ lại, đổi khoá, gõ lại nữa — trong khi chỗ phải sửa nằm ở bảng điều khiển.
   Nói thẳng không lộ gì: cửa chưa lắp khoá thì cũng chưa có gì để canh. */
function chuaDatKhoa(env) { return !env.GC_ID || !env.GC_KEY; }

function loiChuaDatKhoa() {
  return ra({ ok: false, loi: 'cauhinh', thieu: ['GC_ID', 'GC_KEY'],
              chiTiet: 'Máy chủ chưa đặt GC_ID và GC_KEY. Cloudflare → '
                     + 'Settings → Runtime → Variables and Secrets (KHÔNG phải '
                     + 'mục Builds). Xem docs/CAI-DAT.md §6.' }, 503);
}

function ra(du, ma = 200) {
  return new Response(JSON.stringify(du), {
    status: ma,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': 'no-store' }
  });
}

function thieuCauHinh(env) {
  const thieu = [];
  if (!env.GH_TOKEN) thieu.push('GH_TOKEN');
  if (!env.GH_REPO) thieu.push('GH_REPO');
  if (!env.GC_ID || !env.GC_KEY) thieu.push('GC_ID/GC_KEY');
  return thieu;
}

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

function nhanh(env) { return String(env.GH_NHANH || 'main'); }

/* ── BỎ DẤU RỒI RÚT VỀ SLUG ──
   Phải khớp với slugify trong tools/lib/text.mjs, nếu không thì đường dẫn hàm
   này hứa và đường dẫn bộ dựng sinh ra sẽ khác nhau — mà chỉ khác ở mấy bài có
   dấu, tức là hầu hết bài. Không import được vì hàm chạy trên Workers, không
   thấy thư mục tools/. */
function boDau(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function slugify(s) {
  return boDau(s)
    .toLowerCase()
    .replace(/['"‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'khong-ten';
}

/* ── CHUỖI ĐI VÀO FRONT MATTER ──
   Bộ đọc front matter (tools/lib/frontmatter.mjs) rất đơn giản, và đơn giản
   theo kiểu có mấy chỗ gãy được:
     · giá trị trong nháy kép được cắt bỏ ký tự đầu và cuối, KHÔNG có cơ chế
       thoát — nên một dấu " lọt vào giữa thì phần sau nó thành rác;
     · không có giá trị nhiều dòng — một ký tự xuống dòng là dòng sau bị đọc
       thành một khoá khác, hoặc bị bỏ qua hẳn;
     · mảng cắt theo dấu phẩy — một tag có dấu phẩy là thành hai tag.
   Bài gõ trên điện thoại thì đủ cả ba: người ta dán tiêu đề có nháy kép, gõ
   xuống dòng trong ô tóm tắt. Nên chặn ngay ở đây thay vì để bộ dựng chết. */
function chuoiYAML(v) {
  let mo = true;
  const s = String(v == null ? '' : v)
    .replace(/[\r\n\t]+/g, ' ')
    /* Nháy THẲNG đổi thành nháy CONG: chữ đọc ra vẫn y nguyên, mà không còn
       ký tự nào đóng sớm giá trị trong front matter. Mở và đóng phải khác
       nhau, không thì “thấy” ra “thấy“ — trông như gõ hỏng. */
    .replace(/"/g, () => (mo = !mo) ? '\u201D' : '\u201C')
    .trim();
  return `"${s}"`;
}

/* Trả về danh sách đã rửa. KHÔNG tự cắt bớt: cắt lặng lẽ thì người ta gõ mười
   tag, thấy bài lên bình thường, và mãi sau mới phát hiện hai tag cuối không
   dẫn đi đâu cả. Quá số thì báo lỗi để họ tự chọn bỏ cái nào. */
function rangTag(ds) {
  return ds
    .map((t) => String(t).replace(/[\[\],"'\r\n]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/* btoa chỉ nhận từng byte một, mà chữ tiếng Việt là nhiều byte. Phải mã hoá ra
   byte trước rồi mới gọi btoa. Cắt từng khúc 32 KB vì String.fromCharCode nhận
   đối số theo kiểu trải ra — cả bài dán một lần là tràn ngăn xếp. */
function b64(s) {
  const b = new TextEncoder().encode(s);
  let r = '';
  for (let i = 0; i < b.length; i += 0x8000) {
    r += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  }
  return btoa(r);
}

async function danhSachMuc(env) {
  const { ma, du } = await goiGH(env,
    `/repos/${env.GH_REPO}/contents/${THU_MUC_BAI}?ref=${encodeURIComponent(nhanh(env))}`);
  if (ma !== 200 || !Array.isArray(du)) return { ma, ds: null, du };
  const ds = du
    .filter((x) => x.type === 'dir' && !x.name.startsWith('_') && !x.name.startsWith('.'))
    .map((x) => x.name)
    .sort();
  return { ma: 200, ds };
}

/* ══════════ ĐỌC: danh sách chuyên mục, để ô viết đổ vào ô chọn ══════════
   Cũng là phép thử khoá của ô viết: mở /z-admin/ rồi gõ khoá, nếu khoá sai thì
   biết ngay ở đây chứ không phải sau khi gõ xong cả bài. */
export async function onRequestGet({ request, env }) {
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!laChuTrang(request, env)) return ra({ ok: false, loi: 'khoa' }, 401);

  const thieu = thieuCauHinh(env);
  if (thieu.length) return ra({ ok: false, loi: 'cauhinh', thieu }, 503);

  const { ma, ds } = await danhSachMuc(env);
  if (!ds) {
    return ra({ ok: false, loi: 'github',
                chiTiet: `không đọc được ${THU_MUC_BAI} (GitHub trả ${ma})` }, 502);
  }
  return ra({ ok: true, muc: ds, nhanh: nhanh(env), repo: env.GH_REPO });
}

/* ══════════ GHI: đặt một file .md vào kho mã ══════════ */
export async function onRequestPost({ request, env }) {
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!laChuTrang(request, env)) return ra({ ok: false, loi: 'khoa' }, 401);

  const thieu = thieuCauHinh(env);
  if (thieu.length) return ra({ ok: false, loi: 'cauhinh', thieu }, 503);

  let b;
  try { b = await request.json(); } catch (e) { return ra({ ok: false, loi: 'json' }, 400); }

  /* ── KIỂM TRƯỚC KHI GHI, VÌ GHI RỒI THÌ MUỘN ──
     Một file .md hỏng front matter làm BỘ DỰNG DỪNG HẲN. Cloudflare khi ấy giữ
     nguyên bản đang chạy — trang không chết — nhưng mọi bài đăng sau đó cũng
     không lên được, và ngoài mặt thì không có dấu hiệu gì. Người ta chỉ thấy
     "đăng rồi mà mãi không thấy bài".

     Nên mọi thứ bộ dựng bắt buộc phải có thì kiểm ngay ở đây. */
  const loi = [];

  const title = String(b.title || '').replace(/[\r\n]+/g, ' ').trim();
  if (!title) loi.push('thiếu tiêu đề');
  if (title.length > 200) loi.push('tiêu đề dài quá 200 ký tự');

  const noiDung = String(b.noiDung || '').trim();
  if (!noiDung) loi.push('bài chưa có chữ nào');
  if (noiDung.length > 200000) loi.push('bài dài quá 200.000 ký tự');

  /* Ngày mặc định là HÔM NAY theo giờ UTC. Không lấy giờ máy người gửi: hai
     người ở hai múi giờ gửi cùng lúc thì ra hai ngày khác nhau, và thứ tự bài
     trên trang bắt đầu lệch với thứ tự thật. */
  const date = String(b.date || '').trim() || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date + 'T00:00:00Z'))) {
    loi.push(`ngày "${date}" không hợp lệ — cần dạng YYYY-MM-DD`);
  }

  /* ── ĐƯỜNG DẪN LÀ CHỖ NGUY HIỂM NHẤT TRONG CẢ HÀM ──
     `muc` và `slug` đi thẳng vào đường dẫn file gửi cho GitHub. Thả lỏng một
     chút là ai có khoá cũng ghi đè được worker.js hay .github/workflows/ —
     tức là chạy được mã tuỳ ý trên kho mã. Nên: chỉ chữ thường, số và gạch
     ngang, không gì khác. Dấu chấm cũng cấm, vì ".." là đủ để đi ngược lên. */
  const HOP_LE = /^[a-z0-9][a-z0-9-]{0,80}$/;

  const muc = String(b.muc || '').trim();
  if (muc && !HOP_LE.test(muc)) loi.push('tên chuyên mục chỉ được có chữ thường, số và dấu gạch ngang');

  const slug = slugify(b.slug || title);
  if (!HOP_LE.test(slug)) loi.push('không rút được đường dẫn từ tiêu đề này');

  const dsTag = rangTag(Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(','));
  if (dsTag.length > 8) loi.push(`${dsTag.length} tag là nhiều quá — tối đa 8`);
  const tagDai = dsTag.find((t) => t.length > 40);
  if (tagDai) loi.push(`tag "${tagDai.slice(0, 20)}…" dài quá 40 ký tự`);

  if (loi.length) return ra({ ok: false, loi: 'kiem', chiTiet: loi }, 400);

  /* Chuyên mục phải là thư mục ĐANG CÓ. Gõ nhầm "tam-li" thì tạo ra một chuyên
     mục mới tên "tam-li" với đúng một bài trong đó — và không ai nhận ra cho
     tới lúc mở trang Posts thấy hai mục na ná nhau. */
  const { ma: maMuc, ds } = await danhSachMuc(env);
  if (!ds) {
    return ra({ ok: false, loi: 'github',
                chiTiet: `không đọc được ${THU_MUC_BAI} (GitHub trả ${maMuc})` }, 502);
  }
  if (muc && !ds.includes(muc)) {
    return ra({ ok: false, loi: 'muc', chiTiet: `chưa có chuyên mục "${muc}"`, muc: ds }, 400);
  }

  const duongFile = [THU_MUC_BAI, muc, `${date}-${slug}.md`].filter(Boolean).join('/');

  /* ── KHÔNG GHI ĐÈ, BAO GIỜ ──
     GitHub cho ghi đè nếu gửi kèm `sha` của bản cũ. Hàm này cố ý KHÔNG gửi,
     nên trùng tên là GitHub từ chối. Đăng nhầm hai lần thì mất công đổi tiêu
     đề — còn hơn là bài viết hôm qua bị bài hôm nay đè lên không dấu vết. */
  const { ma: maCo } = await goiGH(env,
    `/repos/${env.GH_REPO}/contents/${duongFile}?ref=${encodeURIComponent(nhanh(env))}`);
  if (maCo === 200) {
    return ra({ ok: false, loi: 'trung',
                chiTiet: `đã có ${duongFile} — đổi tiêu đề hoặc đổi ngày`, duong: duongFile }, 409);
  }

  const dongTag = dsTag.length ? `[${dsTag.join(', ')}]` : '';
  const summary = String(b.summary || '').trim();
  const cover = String(b.cover || '').trim();

  const fm = ['---', `title: ${chuoiYAML(title)}`, `date: ${date}`];
  if (summary) fm.push(`summary: ${chuoiYAML(summary)}`);
  if (dongTag) fm.push(`tags: ${dongTag}`);
  if (cover && /^\/[A-Za-z0-9\-._~/]*$/.test(cover)) {
    fm.push(`cover: ${cover}`);
    if (b.coverAlt) fm.push(`coverAlt: ${chuoiYAML(b.coverAlt)}`);
  }
  if (b.draft === true) fm.push('draft: true');
  /* Hai chuỗi rỗng ở đây thành MỘT dòng trống sau khối `---`, đúng như mọi bài
     gõ tay trong content/posts/. Bộ đọc không quan tâm, nhưng người mở file ra
     đọc thì có — và bài đăng từ điện thoại rồi cũng có ngày được mở ra sửa. */
  fm.push('---', '', '');

  const file = fm.join('\n') + noiDung.replace(/\r\n/g, '\n') + '\n';

  const { ma, du } = await goiGH(env, `/repos/${env.GH_REPO}/contents/${duongFile}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `bài mới: ${title}`,
      content: b64(file),
      branch: nhanh(env)
    })
  });

  if (ma !== 200 && ma !== 201) {
    return ra({ ok: false, loi: 'github', maGH: ma,
                chiTiet: (du && du.message) || 'GitHub từ chối ghi file' }, 502);
  }

  /* Đường dẫn bài SẼ có, tính theo đúng luật của bộ dựng: tên file bỏ phần
     ngày ở đầu. Nói trước để còn biết mà mở kiểm, dù lúc này nó chưa tồn tại. */
  const duongBai = '/posts/' + [muc, slug].filter(Boolean).join('/') + '/';

  return ra({
    ok: true,
    duong: duongFile,
    duongBai,
    commit: du && du.commit ? du.commit.html_url : null,
    nhac: 'Cloudflare đang dựng lại. Bài lên sau khoảng một phút.'
  }, 201);
}
