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

/* ══════════ ĐỌC FRONT MATTER Ở PHÍA MÁY CHỦ ══════════

   Bản rút gọn của tools/lib/frontmatter.mjs. Chép lại chứ không import: hàm
   này chạy trên Cloudflare Workers, không thấy thư mục tools/.

   Nó chỉ cần đọc được đúng những khoá mà ô viết bài SINH RA, cộng mấy khoá
   người ta gõ tay hay dùng. Khoá lạ vẫn giữ nguyên trong `tho` để lúc ghi lại
   không làm mất chúng — đây là chỗ dễ đánh rơi dữ liệu nhất trong cả tính năng
   sửa bài: đọc ra 6 khoá, ghi lại 6 khoá, và khoá thứ 7 người ta gõ tay biến
   mất không dấu vết. */
function docFM(van) {
  const s = String(van || '').replace(/\r\n?/g, '\n');
  const m = s.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, tho: {}, than: s.trim() };

  const fm = {}, tho = {};
  /* Khoá đang mở một mảng nhiều dòng. Bài nhập từ blog cũ viết tag kiểu:
         tags:
           - tâm lý
           - giấc mơ
     Bản đầu chỉ đọc mảng một dòng `[a, b]`, nên `tags:` đọc ra chuỗi rỗng và
     mấy dòng gạch đầu dòng bị bỏ qua — tức là MỞ MỘT BÀI RA SỬA LÀ MẤT SẠCH
     TAG. Lỗi câm nhất trong cả tính năng sửa bài, vì trang vẫn dựng bình
     thường, chỉ là bài rơi khỏi mọi trang tag. */
  let dangMang = null;
  for (const dong of m[1].split('\n')) {
    const mi = dong.match(/^\s+-\s+(.*)$/);
    if (mi && dangMang) {
      const x = mi[1].trim().replace(/^["']|["']$/g, '');
      if (x) fm[dangMang].push(x);
      continue;
    }
    const k = dong.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!k) continue;
    dangMang = null;
    const ten = k[1];
    let v = k[2].trim();
    tho[ten] = v;
    /* Khoá có tên mà không có giá trị = đầu một mảng nhiều dòng. */
    if (v === '') { fm[ten] = []; dangMang = ten; continue; }
    if (v === 'true') { fm[ten] = true; continue; }
    if (v === 'false') { fm[ten] = false; continue; }
    if (/^\[.*\]$/.test(v)) {
      fm[ten] = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
      continue;
    }
    /* Nháy kép bao ngoài thì bóc — bộ dựng cũng bóc đúng kiểu ấy. Nháy cong
       (do `chuoiYAML` đổi vào) KHÔNG bóc: chúng là chữ thật trong tiêu đề. */
    if (v.length > 1 && v[0] === '"' && v[v.length - 1] === '"') v = v.slice(1, -1);
    fm[ten] = v;
  }
  /* Mảng nhiều dòng cất vào `tho` dưới dạng một chuỗi có ký tự canh ở đầu và
     giữa các mục. `dungFile` nhận ra ký tự ấy rồi trải lại thành từng dòng
     gạch đầu dòng — nhờ vậy MỌI khoá kiểu mảng nhiều dòng đều đi qua nguyên
     vẹn, kể cả khoá giao diện không biết tới (một bài trong kho có `anh:` viết
     kiểu này). */
  for (const k of Object.keys(fm)) {
    if (Array.isArray(fm[k]) && tho[k] === '') tho[k] = '\u0000' + fm[k].join('\u0000');
  }
  return { fm, tho, than: s.slice(m[0].length).replace(/^\n+/, '') };
}

/* Trạng thái của một bài, gom về MỘT chữ. Ba trạng thái loại trừ nhau, và thứ
   tự xét là quan trọng: một bài vừa `hidden` vừa `draft` thì nó ẩn — ẩn là
   trạng thái mạnh hơn, vì nó có nghĩa "không được xuất hiện ở đâu cả". */
function trangThai(fm) {
  if (fm.hidden === true) return 'an';
  if (fm.draft === true) return 'nhap';
  return 'hien';
}

/* ══════════ CÂY FILE TRONG KHO MÃ ══════════

   Một lượt gọi lấy TRỌN cây thư mục, thay vì đi từng cấp một bằng
   /contents/. Kho bài có bảy tám chuyên mục, mỗi chuyên mục lại có thể có mục
   con — đi từng cấp là tám chín lượt gọi, mà Cloudflare Workers giới hạn số
   lượt gọi ra ngoài trong một request. */
async function cayBai(env) {
  const { ma, du } = await goiGH(env,
    `/repos/${env.GH_REPO}/git/trees/${encodeURIComponent(nhanh(env))}?recursive=1`);
  if (ma !== 200 || !du || !Array.isArray(du.tree)) return { ma, ds: null };
  const ds = du.tree
    .filter((x) => x.type === 'blob' &&
                   x.path.startsWith(THU_MUC_BAI + '/') &&
                   x.path.endsWith('.md') &&
                   !x.path.split('/').pop().startsWith('_'))
    /* Tên file bắt đầu bằng ngày, nên xếp giảm dần theo tên là xếp mới trước.
       Quan trọng vì danh sách có TRẦN: bài mới luôn phải nằm trong phần được
       đọc. */
    .sort((a, b) => (a.path < b.path ? 1 : -1));
  return { ma: 200, ds, cut: du.truncated === true };
}

/* ── MỘT TRANG BAO NHIÊU BÀI ──
   Mỗi bài trong bảng là MỘT lượt gọi ra GitHub (phải mở file mới biết tiêu đề
   và trạng thái), mà Cloudflare Workers chỉ cho một số lượt hữu hạn trong một
   request — 50 ở gói miễn phí.

   Đời trước con số này là 40 và là một cái TRẦN CỨNG: bài thứ 41 trở đi không
   có đường nào mở ra từ /z-admin/ nữa, chỉ còn một dòng "đang xem 40 bài mới
   nhất" mà không có nút nào đi tiếp. Với một blog viết đều thì đó là hạn dùng,
   không phải giới hạn kỹ thuật.

   Nay nó là CỠ MỘT TRANG, và có `?tu=` để xin trang kế. Hạ xuống 20 vì hai lẽ:
   trang đầu hiện ra nhanh gấp đôi (20 lượt gọi thay vì 40), và 20 dòng vừa một
   màn — quá đó thì phải cuộn, mà đã phải cuộn thì thà bấm một nút.

   Tổng số bài vẫn trả về đủ, nên giao diện nói được "20 trên 63" ngay từ
   trang đầu. */
const MOI_TRANG = 20;

/* ══════════ GET ?ds=1[&tu=N] — MỘT TRANG CỦA BẢNG BÀI ══════════ */
async function danhSachBai(env, tu) {
  const { ma, ds, cut } = await cayBai(env);
  if (!ds) {
    return ra({ ok: false, loi: 'github',
                chiTiet: `không đọc được cây kho mã (GitHub trả ${ma})` }, 502);
  }

  /* Kẹp về khoảng hợp lệ chứ không tin con số gửi lên: `?tu=-5` hay `?tu=abc`
     thì `slice` trả về những thứ rất khó đoán. */
  const bd = Math.max(0, Math.min(Number(tu) || 0, ds.length));
  const lay = ds.slice(bd, bd + MOI_TRANG);
  const bai = await Promise.all(lay.map(async (x) => {
    const r = await goiGH(env,
      `/repos/${env.GH_REPO}/contents/${x.path}?ref=${encodeURIComponent(nhanh(env))}`);
    if (r.ma !== 200 || !r.du || !r.du.content) {
      return { duong: x.path, loi: true, title: x.path.split('/').pop() };
    }
    const van = giaiB64(r.du.content);
    const { fm } = docFM(van);
    const ten = x.path.split('/').pop();
    return {
      duong  : x.path,
      sha    : r.du.sha,
      title  : String(fm.title || ten.replace(/\.md$/, '')),
      date   : String(fm.date || ten.slice(0, 10)),
      muc    : x.path.slice(THU_MUC_BAI.length + 1, x.path.length - ten.length - 1),
      trang  : trangThai(fm)
    };
  }));

  /* `cut` nay chỉ còn nói về một chuyện: CÂY KHO MÃ bị GitHub cắt bớt (kho quá
     lớn). Chuyện "còn bài chưa tải" là `con`, và nó có nút để đi tiếp — hai
     trạng thái khác hẳn nhau, nên chúng phải là hai cờ khác nhau. */
  return ra({ ok: true, bai, tong: ds.length, tu: bd,
              con: bd + lay.length < ds.length, cut: cut === true });
}

/* ══════════ GET ?doc=… — MỘT BÀI ══════════ */
async function docMotBai(env, duong) {
  if (!ANTOAN_DUONG.test(duong)) return ra({ ok: false, loi: 'duong' }, 400);

  const { ma, du } = await goiGH(env,
    `/repos/${env.GH_REPO}/contents/${duong}?ref=${encodeURIComponent(nhanh(env))}`);
  if (ma !== 200 || !du || !du.content) {
    return ra({ ok: false, loi: 'github',
                chiTiet: `không đọc được ${duong} (GitHub trả ${ma})` }, ma === 404 ? 404 : 502);
  }

  const van = giaiB64(du.content);
  const { fm, tho, than } = docFM(van);
  return ra({
    ok: true, duong, sha: du.sha,
    /* `tho` đi kèm để lượt ghi lại giữ nguyên mọi khoá front matter mà giao
       diện không có ô nào cho — `khung`, `pinned`, `updated`, `lang`… */
    fm: {
      title  : String(fm.title || ''),
      date   : String(fm.date || ''),
      summary: String(fm.summary || ''),
      tags   : Array.isArray(fm.tags) ? fm.tags : [],
      cover  : String(fm.cover || ''),
      coverAlt: String(fm.coverAlt || ''),
      draft  : fm.draft === true,
      hidden : fm.hidden === true
    },
    khoaKhac: tho,
    noiDung: than,
    trang: trangThai(fm)
  });
}

/* Đường dẫn file đi thẳng vào lời gọi GitHub, nên nó là chỗ nguy hiểm nhất
   trong cả hàm — cùng lý do đã ghi ở phần kiểm `muc`/`slug` bên dưới. Chỉ
   nhận đúng hình dạng một bài trong kho: content/posts/…/….md, không dấu
   chấm đôi, không dấu gạch chéo mở đầu. */
const ANTOAN_DUONG = /^content\/posts\/(?:[a-z0-9][a-z0-9-]*\/)*[a-z0-9][a-z0-9.-]*\.md$/;

function giaiB64(b64) {
  const tho = atob(String(b64).replace(/\n/g, ''));
  const byte = new Uint8Array(tho.length);
  for (let i = 0; i < tho.length; i++) byte[i] = tho.charCodeAt(i);
  return new TextDecoder().decode(byte);
}

/* ══════════ ĐỌC: danh sách chuyên mục, để ô viết đổ vào ô chọn ══════════
   Cũng là phép thử khoá của ô viết: mở /z-admin/ rồi gõ khoá, nếu khoá sai thì
   biết ngay ở đây chứ không phải sau khi gõ xong cả bài. */
export async function onRequestGet({ request, env }) {
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!laChuTrang(request, env)) return ra({ ok: false, loi: 'khoa' }, 401);

  const thieu = thieuCauHinh(env);
  if (thieu.length) return ra({ ok: false, loi: 'cauhinh', thieu }, 503);

  /* Ba kiểu đọc trên cùng một đường, phân biệt bằng tham số — chứ không mở
     thêm hai đường /api mới. Mỗi đường mới là một chỗ nữa phải nhớ canh khoá,
     và ba việc này dùng chung y hệt bộ canh ở trên. */
  const u = new URL(request.url);
  if (u.searchParams.get('ds') === '1') return danhSachBai(env, u.searchParams.get('tu'));
  const mo = u.searchParams.get('doc');
  if (mo) return docMotBai(env, mo);

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

  /* Cùng một hàm với lượt SỬA — xem `dungFile` ở cuối file. Hai đường phải
     sinh ra front matter giống hệt nhau, nếu không thì mở một bài vừa đăng ra
     lưu lại là `git diff` hiện cả khối front matter thay đổi. */
  const file = dungFile({
    title, date, noiDung, tags: dsTag,
    summary : String(b.summary || '').trim(),
    cover   : String(b.cover || '').trim(),
    coverAlt: String(b.coverAlt || '').trim(),
    draft   : b.draft === true,
    hidden  : false
  });

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

/* ── NHÁY KÉP CHỈ ĐẶT KHI CẦN ──
   Bộ đọc front matter thật (tools/lib/frontmatter.mjs) nhận giá trị TRẦN cho
   gần như mọi thứ, và bài trong kho đều viết trần: `title: Chiếc gương`. Bọc
   nháy cho tất cả thì mở một bài cũ ra lưu lại là mọi dòng tiêu đề đổi — một
   dòng diff trên mỗi bài, cho một lượt sửa chẳng đụng tới tiêu đề.

   Chỉ năm hình dạng dưới đây mới thật sự cần nháy, và mỗi cái tương ứng một
   luật của bộ đọc:
     · mở đầu bằng " hoặc '   → bộ đọc bóc cặp nháy ngoài, mất ký tự đầu/cuối
     · mở đầu bằng [          → bộ đọc hiểu là mảng
     · có dấu hai chấm        → không hỏng gì, nhưng bài trong kho vẫn bọc
                                nháy ở những chỗ ấy, và giống nếp cũ thì lượt
                                lưu đầu tiên không sinh ra dòng diff nào
     · có " #" ở giữa         → bộ đọc cắt từ đó đi, coi là chú thích
     · đúng một từ đúng/sai   → bộ đọc đổi thành boolean
     · nhìn như một con số    → bộ đọc đổi thành Number
   Ngoài năm cái đó, trần là an toàn và khớp với nếp viết tay trong kho. */
const DUNG_SAI = ['true', 'false', 'yes', 'no', 'có', 'không'];

function giaTriYAML(v) {
  const s = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim();
  const canNhay = s === ''
    || /^["'\[]/.test(s)
    || /:/.test(s)
    || /\s#/.test(s)
    || DUNG_SAI.indexOf(s.toLowerCase()) >= 0
    || /^-?\d+(\.\d+)?$/.test(s);
  return canNhay ? chuoiYAML(s) : s;
}

/* ══════════ DỰNG LẠI FILE .md ══════════

   Dùng chung cho cả lượt ĐĂNG MỚI và lượt SỬA. Tách ra vì hai đường ấy phải
   sinh ra front matter giống hệt nhau: khác một khoá hay khác thứ tự khoá thì
   mở một bài cũ ra lưu lại là `git diff` hiện cả khối front matter thay đổi,
   dù chẳng sửa gì trong đó.

   ── GIỮ NGUYÊN THỨ TỰ KHOÁ CỦA FILE GỐC ──
   `khoaKhac` là bảng khoá→giá trị THÔ đọc ra từ file, và thứ tự khoá trong đó
   chính là thứ tự chúng nằm trong file. Ghi lại theo đúng thứ tự ấy thì phần
   không sửa không sinh ra dòng diff nào.

   Bản đầu xếp mấy khoá quen trước rồi dồn khoá lạ xuống cuối. Kết quả: một
   bài có `titleNgan` ngay sau `title`, hay có `updated` ngay sau `date`, thì
   lượt lưu đầu tiên xáo lại cả khối — và cái xáo ấy trộn lẫn với thay đổi
   thật, nên đọc diff không còn biết mình vừa sửa gì.

   ── KHOÁ LẠ ĐI QUA NGUYÊN VẸN ──
   `khung`, `pinned`, `updated`, `lang`, `titleNgan`… giao diện không có ô nào
   cho chúng. Chúng được đọc ra lúc mở bài và ghi trả lại y nguyên lúc lưu.
   Không làm thế thì sửa một chữ trong bài là mất sạch mấy khoá ấy — lặng lẽ,
   và chỉ lộ ra ở lần dựng sau khi bài đổi khung trình bày. */
const KHOA_CO_O = ['title', 'date', 'summary', 'tags', 'cover', 'coverAlt',
                   'draft', 'hidden'];

function dungFile(b) {
  /* Giá trị ĐÃ THÀNH CHỮ cho tám khoá giao diện quản. Chuỗi rỗng nghĩa là
     "không ghi dòng này" — nhờ vậy bỏ tóm tắt, bỏ ảnh bìa hay bỏ cờ nháp đều
     chỉ là gán rỗng, không phải một nhánh riêng. */
  const co = Object.create(null);
  co.title = giaTriYAML(b.title);
  co.date  = String(b.date || '').trim();
  co.summary = b.summary ? giaTriYAML(b.summary) : '';
  /* Giữ nguyên KIỂU viết mảng của file gốc. Đổi từ nhiều dòng sang một dòng
     thì nội dung vẫn đúng, nhưng lượt lưu đầu tiên sinh ra một khối diff chẳng
     liên quan gì tới thứ vừa sửa. */
  const mangNhieuDong = String((b.khoaKhac || {}).tags || '').charCodeAt(0) === 0;
  co.tags = (b.tags && b.tags.length)
    ? (mangNhieuDong ? '\u0000' + b.tags.join('\u0000') : `[${b.tags.join(', ')}]`)
    : '';
  co.cover = (b.cover && /^\/[A-Za-z0-9\-._~/]*$/.test(b.cover)) ? b.cover : '';
  co.coverAlt = (co.cover && b.coverAlt) ? giaTriYAML(b.coverAlt) : '';
  co.draft  = b.draft === true ? 'true' : '';
  co.hidden = b.hidden === true ? 'true' : '';

  const khac = b.khoaKhac || {};
  /* Thứ tự: theo file gốc nếu có, còn không thì theo thứ tự chuẩn của bài mới. */
  const goc = Object.keys(khac);
  const thuTu = goc.length ? goc.slice() : KHOA_CO_O.slice();
  /* Khoá giao diện vừa được BẬT mà file gốc chưa có (ví dụ vừa gắn ảnh bìa,
     vừa bấm ẩn bài) thì nối vào cuối — không chen vào giữa, vì chen vào giữa
     là lại xáo thứ tự của phần không đụng tới. */
  for (const k of KHOA_CO_O) if (thuTu.indexOf(k) < 0) thuTu.push(k);

  const dong = ['---'];
  const daRa = Object.create(null);
  for (const k of thuTu) {
    if (daRa[k]) continue;
    daRa[k] = 1;
    const v = (k in co) ? co[k] : String(khac[k]);
    if (v === '' || (!(k in co) && !/^[A-Za-z][\w-]*$/.test(k))) continue;
    /* Ký tự canh ở đầu = mảng nhiều dòng. Một nhánh cho cả khoá giao diện lẫn
       khoá lạ — hai nhánh riêng thì khoá lạ kiểu mảng lọt xuống nhánh dưới và
       in ra nguyên cả ký tự canh. */
    if (v.charCodeAt(0) === 0) {
      dong.push(`${k}:`);
      v.slice(1).split('\u0000').forEach((x) => dong.push(`  - ${x}`));
    } else dong.push(`${k}: ${v.replace(/[\r\n]+/g, ' ')}`);
  }

  /* Hai chuỗi rỗng ở đây thành MỘT dòng trống sau khối `---`, đúng như mọi
     bài gõ tay trong content/posts/. */
  dong.push('---', '', '');
  return dong.join('\n') + String(b.noiDung).replace(/\r\n/g, '\n').trim() + '\n';
}

/* ══════════ SỬA MỘT BÀI ĐÃ CÓ ══════════

   ── VÌ SAO PHẢI CÓ `sha` ──
   GitHub đòi mã băm của bản đang có mới cho ghi đè. Đó không phải thủ tục
   rườm rà mà là KHOÁ CHỐNG GHI ĐÈ NHẦM: mở bài trên điện thoại, sửa dở, rồi
   mở luôn bài ấy trên máy và sửa xong trước — lúc điện thoại bấm Lưu, `sha`
   nó cầm đã cũ, và GitHub từ chối thay vì lặng lẽ đè mất bản trên máy.

   Ở đây `sha` cũ được TRẢ LẠI trong câu báo lỗi, để giao diện nói được câu
   đúng: "bài này vừa đổi ở chỗ khác" chứ không phải "lưu hỏng".

   ── TÊN FILE KHÔNG ĐỔI, KỂ CẢ KHI NGÀY ĐỔI ──
   Đổi tên file trong Git là xoá một file rồi tạo một file khác — hai lượt
   ghi, và giữa hai lượt ấy bài không tồn tại. Nó cũng làm gãy mọi link đã
   chia sẻ, vì đường dẫn tính từ tên file.

   Nên `date` trong front matter sửa được thoải mái (nó quyết định thứ tự bài
   và ngày hiện trên trang), còn phần ngày trong TÊN FILE thì ở nguyên. Hai
   con số ấy lệch nhau là chuyện bình thường và không ai ngoài kho mã thấy. */
export async function onRequestPut({ request, env }) {
  if (chuaDatKhoa(env)) return loiChuaDatKhoa();
  if (!laChuTrang(request, env)) return ra({ ok: false, loi: 'khoa' }, 401);

  const thieu = thieuCauHinh(env);
  if (thieu.length) return ra({ ok: false, loi: 'cauhinh', thieu }, 503);

  let b;
  try { b = await request.json(); } catch (e) { return ra({ ok: false, loi: 'json' }, 400); }

  const duong = String(b.duong || '');
  if (!ANTOAN_DUONG.test(duong)) return ra({ ok: false, loi: 'duong' }, 400);
  const sha = String(b.sha || '').trim();
  if (!/^[0-9a-f]{7,64}$/.test(sha)) return ra({ ok: false, loi: 'sha' }, 400);

  const loi = [];
  const title = String(b.title || '').replace(/[\r\n]+/g, ' ').trim();
  if (!title) loi.push('thiếu tiêu đề');
  if (title.length > 200) loi.push('tiêu đề dài quá 200 ký tự');

  const noiDung = String(b.noiDung || '').trim();
  if (!noiDung) loi.push('bài chưa có chữ nào');
  if (noiDung.length > 200000) loi.push('bài dài quá 200.000 ký tự');

  const date = String(b.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date + 'T00:00:00Z'))) {
    loi.push(`ngày "${date}" không hợp lệ — cần dạng YYYY-MM-DD`);
  }

  const dsTag = rangTag(Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(','));
  if (dsTag.length > 8) loi.push(`${dsTag.length} tag là nhiều quá — tối đa 8`);
  const tagDai = dsTag.find((t) => t.length > 40);
  if (tagDai) loi.push(`tag "${tagDai.slice(0, 20)}…" dài quá 40 ký tự`);

  if (loi.length) return ra({ ok: false, loi: 'kiem', chiTiet: loi }, 400);

  const file = dungFile({
    title, date, noiDung, tags: dsTag,
    summary : String(b.summary || '').trim(),
    cover   : String(b.cover || '').trim(),
    coverAlt: String(b.coverAlt || '').trim(),
    draft   : b.draft === true,
    hidden  : b.hidden === true,
    khoaKhac: b.khoaKhac
  });

  const { ma, du } = await goiGH(env, `/repos/${env.GH_REPO}/contents/${duong}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: (b.hidden === true ? 'ẩn bài: ' : b.draft === true ? 'sửa nháp: ' : 'sửa bài: ') + title,
      content: b64(file),
      sha,
      branch: nhanh(env)
    })
  });

  if (ma === 409 || ma === 422) {
    return ra({ ok: false, loi: 'lechban',
                chiTiet: 'Bài này vừa đổi ở chỗ khác. Mở lại để lấy bản mới rồi sửa tiếp.' }, 409);
  }
  if (ma !== 200 && ma !== 201) {
    return ra({ ok: false, loi: 'github', maGH: ma,
                chiTiet: (du && du.message) || 'GitHub từ chối ghi file' }, 502);
  }

  return ra({
    ok: true, duong,
    sha: du && du.content ? du.content.sha : null,
    commit: du && du.commit ? du.commit.html_url : null,
    trang: b.hidden === true ? 'an' : b.draft === true ? 'nhap' : 'hien',
    nhac: 'Cloudflare đang dựng lại. Thay đổi lên sau khoảng một phút.'
  });
}
