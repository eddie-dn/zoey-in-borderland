#!/usr/bin/env node
/* ============================================================
   BUILD — quét content/ rồi dựng ra dist/.

   Chạy:  npm run build          dựng đầy đủ
          npm run check          chỉ kiểm bài, không ghi file nào
          node tools/build.mjs --v   in thêm chi tiết

   Nguyên tắc: THIẾU FIELD BẮT BUỘC THÌ DỪNG HẲN, không đăng bài lỗi.
   Còn những thứ chỉ "nên có" thì cảnh báo rồi vẫn dựng — tác giả tự quyết.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docFrontMatter, kiemBai } from './lib/frontmatter.mjs';
import { render } from './lib/markdown.mjs';
import { kichThuocAnh, tiLe } from './lib/imgsize.mjs';
import { docSo, docChiTiet, temNgay } from './lib/lichsu.mjs';
import { docNguon } from './lib/doc-nguon.mjs';
import {
  slugify, escapeHtml, attr, phutDoc, ngayAnh, ngayISO, ngayTem, tomTat, boDau, noiChu
} from './lib/text.mjs';

const GOC        = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THU_MUC    = {
  content : path.join(GOC, 'content'),
  posts   : path.join(GOC, 'content', 'posts'),
  pages   : path.join(GOC, 'content', 'pages'),
  src     : path.join(GOC, 'src'),
  public  : path.join(GOC, 'public'),
  dist    : path.join(GOC, 'dist')
};
const CO        = new Set(process.argv.slice(2));
const CHI_KIEM  = CO.has('--check-only') || CO.has('--check');
const CHI_TIET  = CO.has('--v') || CO.has('--verbose');
/* BẢN NHÁP MẶC ĐỊNH KHÔNG ĐƯỢC GHI RA dist/.
   Bản trước vẫn ghi ra file rồi gắn noindex. Nhưng noindex chỉ bảo Google đừng
   đánh chỉ mục — file vẫn nằm công khai trên máy chủ, ai đoán trúng đường dẫn
   là đọc được bài chưa viết xong. Với blog cá nhân, bài nháp thường là thứ
   riêng tư nhất.
   `npm run dev` tự bật cờ này để tác giả vẫn xem thử được ở máy mình. */
const CO_NHAP   = CO.has('--nhap') || CO.has('--drafts');

const CAU = JSON.parse(fs.readFileSync(path.join(GOC, 'site.config.json'), 'utf8'));
const BASE = (CAU.base || '').replace(/\/$/, '');
const CANH_BAO = [];
const LOI = [];

/* Phiên bản đọc từ docs/LICH-SU.md, KHÔNG từ site.config.json. Một nguồn duy
   nhất thì không bao giờ lệch. Khai ở cả hai chỗ là sớm muộn cũng quên một chỗ,
   và lúc đó không biết chỗ nào mới đúng. */
const SO = docSo(GOC);
if (SO.loi) LOI.push(SO.loi);
if (SO.thieuFile) LOI.push('thiếu docs/LICH-SU.md — sổ phiên bản là nguồn của số Vxx.yy');
if (!SO.thieuFile && !SO.loi && !SO.moiNhat) LOI.push('docs/LICH-SU.md: bảng chưa có dòng nào');
const BAN = SO.moiNhat || { ten: 'V0.00', ngay: '', suaChinh: '' };
if (CAU.version) {
  CANH_BAO.push('site.config.json còn khoá `version` — bỏ đi, phiên bản nay lấy từ docs/LICH-SU.md');
}

/* SỔ TAY — cả bảng phiên bản kèm chi tiết, nhúng vào mọi trang cho cửa hậu ở
   chân trang đọc (xem src/js/so-tay.js). Cùng một gốc với tem Vx.yy in ra
   ngay cạnh đó, nên hai thứ không bao giờ lệch nhau.

   Là HÀM chứ không phải hằng: nó đọc NHAN, mà NHAN khai bên dưới. Hằng thì
   chạy ngay lúc nạp file và NHAN lúc đó còn chưa tồn tại. */
const SO_TAY = () => JSON.stringify({
  /* GOM THEO BUILD, không rải mỗi bản vá một dòng.

     Bản đầu liệt kê thẳng V1.06, V1.05, V1.04… ra trang ngoài. Sai về bản
     chất của cách đánh số: theo quy ước ở đầu docs/LICH-SU.md, mỗi dòng bảng
     là một BUILD LỚN và số đuôi là bản vá trong build đó. Rải phẳng ra thì
     người xem thấy tám dòng ngang hàng nhau, không đọc được đâu là mốc lớn.

     Nay ba tầng:  V1 (build)  →  các bản vá V1.yy  →  chi tiết từng bản. */
  build: (() => {
    const m = new Map();
    for (const b of SO.ban) {
      const lon = b.ten.split('.')[0];              /* 'V1.06' → 'V1' */
      if (!m.has(lon)) m.set(lon, { ten: lon, va: [] });
      m.get(lon).va.push({ ten: b.ten, ngay: b.ngay, so: b.so, suaChinh: b.suaChinh });
    }
    return [...m.values()].map((x) => ({
      ten: x.ten,
      /* Bảng xếp mới nhất trước, nên phần tử đầu là bản mới nhất của build. */
      tuNgay: x.va[x.va.length - 1].ngay,
      denNgay: x.va[0].ngay,
      soVa: x.va.length,
      va: x.va
    }));
  })(),
  chiTiet: docChiTiet(GOC),
  nhan: {
    history: NHAN.history, builds: NHAN.builds, patches: NHAN.patches,
    noInfo: NHAN.noInfo, close: NHAN.close, back: NHAN.back
  }
/* `</` phải chẻ đôi: chuỗi `</script>` nằm trong nội dung một thẻ <script> thì
   trình duyệt đóng thẻ NGAY TẠI ĐÓ, phần còn lại của JSON đổ thẳng ra trang
   thành chữ. Sổ này có ghi tên thẻ HTML nên chuyện đó xảy ra thật. */
}).replace(/<\//g, '<\\/');

/* ══════════ BẢNG NHÃN GIAO DIỆN ══════════
   Mọi chữ KHÔNG phải nội dung bài đều lấy từ đây — tiếng Anh, để phần khung
   trang đọc ra đồng bộ với nhau và tách bạch hẳn khỏi nội dung tiếng Việt.
   Đổi ngôn ngữ giao diện là sửa đúng khối này, không phải đi lùng từng chuỗi
   nằm rải trong code. */
const NHAN = {
  /* MỌI chữ trên giao diện nằm ở đây, và đều là TIẾNG ANH. Trang viết bằng
     tiếng Việt nhưng phần khung — nhãn, nút, huy hiệu — thì tiếng Anh cho
     đồng bộ: nửa nọ nửa kia thì mỗi khối một giọng, đọc rất chắp vá. Chữ
     tiếng Việt chỉ còn ở NỘI DUNG do người viết gõ ra.

     Mấy nhãn có {n} là chỗ để thay số lúc chạy. */

  /* ── điều hướng và khung chung ── */
  posts       : 'Posts',
  topics      : 'Topics',
  tagged      : 'Tagged',
  readNext    : 'Read next',
  related     : 'Related',
  onThisPage  : 'On this page',
  contents    : 'Contents',
  minRead     : 'min read',
  updated     : 'Updated',
  draft       : 'Draft',
  soon        : 'Coming soon',
  search      : 'Search',
  skipToMain  : 'Skip to content',
  toLight     : 'Switch to light',
  toDark      : 'Switch to dark',
  older       : 'Older',
  newer       : 'Newer',

  /* ── trang danh sách ── */
  allPosts    : 'All posts',
  allTopics   : 'All topics',
  archive     : 'Archive',
  latest      : 'Latest',
  pinned      : 'Pinned',
  more        : 'More writing',
  noPosts     : 'Nothing here yet.',
  noTags      : 'No topics yet.',
  searchHint  : 'Search by title, topic or category. Accents optional.',
  searchPh    : 'Type to search…',
  clear       : 'Clear',
  results     : '{n} results',
  oneResult   : '1 result',
  noResults   : 'Nothing matched.',
  typeMore    : 'Keep typing…',

  /* ── trang giới thiệu ── */
  based       : 'Based in',
  writingSince: 'Writing since',
  lately      : 'Lately',
  findMe      : 'Find me',
  quoteToday  : 'Quote of the day',
  quoteMore   : 'Another one',

  /* ── bình luận: khung ── */
  comments    : 'Leave a note',
  yourName    : 'Name',
  yourNote    : 'Your note',
  optional    : 'optional',
  emailNote   : 'optional · never shown',
  namePh      : 'Who dropped by?',
  emailPh     : 'So I can reply privately',
  notePh      : 'Anything at all…',
  send        : 'Send',

  /* ── bình luận: phần do JS dựng ra ──
     Gửi sang comments.js qua thuộc tính data-nhan. Để chung một bảng ở đây
     thay vì rải trong file .js: sửa chữ thì chỉ mở đúng một chỗ. */
  author      : 'Author',
  anon        : 'Anonymous',
  reply       : 'Reply',
  replyTo     : 'Replying to {n}',
  cancelReply : 'Cancel reply',
  moreReplies : 'Show {n} earlier replies',
  noComments  : 'No notes yet. Yours can be the first.',
  sending     : 'Sending…',
  tooShort    : 'Write a few words first.',
  sent        : 'Got it, thank you ✦ I read everything before it goes up.',
  failed      : 'Could not send. Try again in a bit.',
  netErr      : 'Network hiccup. Try again in a moment.',
  notLinked   : 'Comments are not connected to a server yet — see docs/BINH-LUAN.md.',
  charsLeft   : '{n} characters left',

  /* ── sổ lịch sử phiên bản ── */
  history     : 'Version history',
  builds      : '{n} builds · source: docs/LICH-SU.md',
  patches     : '{n} patches recorded in this build',
  noInfo      : 'no info',
  close       : 'Close',
  back        : 'Back'
};

/* Thay {n} trong một nhãn. */
const nhan = (k, n) => String(NHAN[k] || '').replace('{n}', n);

const mau = {
  do:   (s) => `\x1b[31m${s}\x1b[0m`,
  vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo:   (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`,
  tim:  (s) => `\x1b[35m${s}\x1b[0m`
};

/* ══════════════ 1. GOM FILE ══════════════ */

function quet(thuMuc, duoi = '.md') {
  if (!fs.existsSync(thuMuc)) return [];
  const ra = [];
  for (const m of fs.readdirSync(thuMuc, { withFileTypes: true })) {
    const p = path.join(thuMuc, m.name);
    if (m.isDirectory()) {
      /* Thư mục mở đầu bằng _ là thư mục nháp/hệ thống, không quét vào */
      if (!m.name.startsWith('_') && !m.name.startsWith('.')) ra.push(...quet(p, duoi));
    } else if (m.name.endsWith(duoi) && !m.name.startsWith('_') && !m.name.startsWith('.')) {
      ra.push(p);
    }
  }
  return ra;
}

/* Tên hiển thị của một chuyên mục. Ưu tiên file _muc.json đặt trong chính
   thư mục đó; không có thì lấy tên thư mục. Không đoán dấu tiếng Việt từ slug
   — "tam-ly" thành "Tâm lý" hay "Tám lý" thì máy không biết được. */
const KHO_MUC = new Map();
function tenMuc(duongDanTuongDoi) {
  if (KHO_MUC.has(duongDanTuongDoi)) return KHO_MUC.get(duongDanTuongDoi);
  const f = path.join(THU_MUC.posts, duongDanTuongDoi, '_muc.json');
  let ra = { title: path.basename(duongDanTuongDoi), description: '' };
  if (fs.existsSync(f)) {
    try { ra = { ...ra, ...JSON.parse(fs.readFileSync(f, 'utf8')) }; }
    catch (e) { CANH_BAO.push(`${path.relative(GOC, f)}: đọc không được (${e.message})`); }
  }
  KHO_MUC.set(duongDanTuongDoi, ra);
  return ra;
}

/* ══════════════ 1b. ĐỌC KHO TRÍCH DẪN ══════════════
   content/quotes.md — mỗi gạch đầu dòng một câu, dạng "Nội dung — Người nói".

   Tách ở dấu — (em dash) CUỐI CÙNG chứ không phải dấu đầu tiên: nội dung câu
   hoàn toàn có thể chứa em dash giữa chừng ("Ta là thứ ta làm — lặp đi lặp
   lại — mỗi ngày"), tách ở dấu đầu là cụt câu. */
function docTrichDan() {
  /* Dùng CHUNG bộ đọc với hàm /api/quote — xem tools/lib/doc-nguon.mjs. Trang và
     máy chủ đọc cùng một file bằng cùng một bộ đọc, nên kho câu hiện ra ngoại
     tuyến không bao giờ lệch với kho máy chủ dùng làm dự phòng.

     Chỉ lấy `### Câu sẵn`. Ba mục kia (chủ đề · nguồn · lời dặn) là việc của
     máy chủ, nhúng vào trang thì vừa thừa vừa lộ nguyên lời dặn ra HTML. */
  const kq = docNguon(GOC);
  if (kq.thieuFile) {
    CANH_BAO.push('thiếu content/quote-nguon.md — ô trích dẫn chỉ còn một câu dự phòng');
  }
  if (kq.loi) CANH_BAO.push(`content/quote-nguon.md đọc không được: ${kq.loi}`);
  return kq.san;
}

/* ── NƯỚNG NGUỒN QUOTE CHO HÀM CLOUDFLARE ──

   Hàm `/api/quote` chạy trên Cloudflare Workers, mà Workers KHÔNG CÓ ĐĨA:
   không `fs`, không `readFileSync`, không có thư mục `content/` nào để mở.
   Nên nó không thể tự đọc `content/quote-nguon.md` như bản chạy trên Vercel.

   Cách chữa: build đọc file .md một lần rồi GHI RA một module JS mà hàm kia
   `import` thẳng vào. Cloudflare gói cả cây import lại lúc deploy, nên tới lúc
   chạy mọi thứ đã nằm sẵn trong bộ nhớ.

   File sinh ra ĐƯỢC COMMIT, không bỏ vào .gitignore. Lý do: nếu vì cớ gì đó
   build không chạy trước lúc Cloudflare gói hàm thì thiếu file là hỏng cả hàm.
   Có bản commit sẵn thì chậm nhất cũng chỉ là nguồn cũ một nhịp — và có một
   phép kiểm bắt đúng chuyện "bản nướng lệch với file .md" (xem kiem-dinh.mjs),
   nên lệch thì biết ngay chứ không âm thầm.

   KHÔNG nướng `### Câu sẵn` vào đây: kho câu đã nhúng thẳng vào HTML rồi, hàm
   trên mạng không dùng tới. Nướng cả vào thì mỗi lần deploy lại đẩy thêm mấy
   chục câu qua mạng mà chẳng ai đọc. */
function nuongNguonQuote() {
  const k = docNguon(GOC);
  const dau = [
    '/* SINH TỰ ĐỘNG bởi tools/build.mjs — ĐỪNG SỬA TAY.',
    '   Sửa nội dung ở `content/quote-nguon.md` rồi chạy `npm run build`.',
    '   Vì sao phải nướng sẵn: Cloudflare Workers không có `fs` để đọc file .md',
    '   lúc chạy — xem chú thích ở `nuongNguonQuote` trong tools/build.mjs. */',
    'export default '
  ].join('\n');

  const ra = dau +
    JSON.stringify({ chuDe: k.chuDe, nguon: k.nguon, nhac: k.nhac }, null, 2) + ';\n';

  const f = path.join(GOC, 'functions', 'api', '_nguon.js');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  /* Chỉ ghi khi KHÁC — ghi đè mỗi lần build thì git thấy file đổi liên tục dù
     nội dung y hệt, và mỗi lần chạy dev là một dòng "modified" giả. */
  if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== ra) fs.writeFileSync(f, ra);
}

/* ══════════════ 2. ĐỌC MỘT BÀI ══════════════ */

function docBai(file) {
  const rel  = path.relative(THU_MUC.posts, file);
  const thoi = path.dirname(rel) === '.' ? [] : path.dirname(rel).split(path.sep);
  const raw  = fs.readFileSync(file, 'utf8');
  const nhan = path.relative(GOC, file);

  let fm, than;
  try { ({ data: fm, than } = docFrontMatter(raw, nhan)); }
  catch (e) { LOI.push(e.message); return null; }

  const kq = kiemBai(fm, nhan, than);
  kq.loi.forEach((x) => LOI.push(`${nhan}: ${x}`));
  kq.canhBao.forEach((x) => CANH_BAO.push(`${nhan}: ${x}`));
  if (kq.loi.length) return null;

  /* Slug: ưu tiên khai trong front matter; không có thì lấy tên file, bỏ phần
     ngày ở đầu. "2026-09-14-vo-thuc.md" → "vo-thuc". */
  const tenFile = path.basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const slug = String(fm.slug || slugify(tenFile));

  const canhBaoBai = (m) => CANH_BAO.push(`${nhan}: ${m}`);
  const kq2 = render(than, {
    publicDir: THU_MUC.public,
    base: BASE,
    host: new URL(CAU.url).host,
    canhBao: canhBaoBai,
    /* Bài đã có `summary` thì đoạn đầu KHÔNG tự phóng to nữa. Để cả hai thì
       người đọc gặp liền hai khối chữ lớn cùng cỡ nói cùng một ý — đo ra đúng
       20.5px cho cả hai, nhìn như bài bị lặp. Một bài chỉ nên có một chỗ mở. */
    khongSapo: !!fm.summary
  });

  const duong  = ['posts', ...thoi.map((x) => slugify(x)), slug];
  const url    = `${BASE}/${duong.join('/')}/`;
  const muc    = thoi.map((_, i) => {
    const relMuc = thoi.slice(0, i + 1).join(path.sep);
    const info   = tenMuc(relMuc);
    return { slug: slugify(thoi[i]), ten: info.title, url: `${BASE}/posts/${thoi.slice(0, i + 1).map(slugify).join('/')}/` };
  });

  return {
    file, nhan, url,
    duongDanRa : path.join(THU_MUC.dist, ...duong, 'index.html'),
    title      : String(fm.title),
    slug,
    date       : ngayISO(fm.date),
    updated    : fm.updated ? ngayISO(fm.updated) : null,
    summary    : String(fm.summary || tomTat(kq2.tho)),
    tags       : (Array.isArray(fm.tags) ? fm.tags : []).map((t) => String(t).trim()).filter(Boolean),
    muc,
    cover      : fm.cover ? String(fm.cover) : null,
    coverAlt   : String(fm.coverAlt || ''),
    draft      : fm.draft === true,
    pinned     : fm.pinned === true,
    lang       : String(fm.lang || CAU.lang),
    /* Khung trình bày: A (mặc định) · B bìa tràn màn · C lề trái dính.
       Khai sai chữ thì lặng lẽ về A — bài vẫn đọc được, chỉ không đúng khung
       mong muốn, nên báo cảnh báo chứ không dừng build. */
    khung      : (() => {
      const k = String(fm.khung || 'A').trim().toUpperCase();
      if (k !== 'A' && k !== 'B') {
        canhBaoBai(`\`khung: ${fm.khung}\` không có — chỉ nhận A hoặc B. Dùng tạm A.`);
        return 'a';
      }
      return k.toLowerCase();
    })(),
    html       : kq2.html,
    headings   : kq2.headings,
    tho        : kq2.tho,
    phut       : phutDoc(kq2.tho)
  };
}

/* ══════════════ 2b. ĐỌC MỘT TRANG TĨNH ══════════════
   content/pages/*.md → /<slug>/. Khác bài viết ở ba chỗ: không có chuyên mục,
   không vào RSS/sitemap theo ngày, và đọc thêm mấy field riêng cho khung bento. */
function docTrang(file) {
  const raw  = fs.readFileSync(file, 'utf8');
  const nhan = path.relative(GOC, file);

  let fm, than;
  try { ({ data: fm, than } = docFrontMatter(raw, nhan)); }
  catch (e) { LOI.push(e.message); return null; }

  if (!fm.title) { LOI.push(`${nhan}: thiếu \`title\``); return null; }

  const slug = String(fm.slug || slugify(path.basename(file, '.md')));
  const kq = render(than, {
    publicDir: THU_MUC.public, base: BASE,
    host: new URL(CAU.url).host,
    canhBao: (m) => CANH_BAO.push(`${nhan}: ${m}`),
    khongSapo: true
  });

  const mang = (k) => (Array.isArray(fm[k]) ? fm[k].map(String) : []);
  /* "Đọc · Sách Đỏ" → { nhan:'Đọc', chu:'Sách Đỏ' }. Không có dấu · thì cả
     dòng là nội dung, nhãn để trống — vẫn hiện được. */
  const cap = (k) => mang(k).map((d) => {
    const i = d.indexOf('·');
    return i < 0 ? { nhan: '', chu: d.trim() }
                 : { nhan: d.slice(0, i).trim(), chu: d.slice(i + 1).trim() };
  });

  return {
    file, nhan, slug,
    url        : `${BASE}/${slug}/`,
    duongDanRa : path.join(THU_MUC.dist, slug, 'index.html'),
    title      : String(fm.title),
    summary    : String(fm.summary || tomTat(kq.tho)),
    khung      : String(fm.khung || 'bento').trim().toLowerCase(),
    gioiThieu  : String(fm.gioiThieu || ''),
    viTri      : String(fm.viTri || ''),
    tuNam      : String(fm.tuNam || ''),
    nghe       : String(fm.nghe || ''),
    dangLam    : cap('dangLam'),
    lienHe     : cap('lienHe'),
    anh        : fm.anh ? String(fm.anh) : null,
    anhAlt     : String(fm.anhAlt || ''),
    cover      : fm.cover ? String(fm.cover) : null,
    coverAlt   : String(fm.coverAlt || ''),
    lang       : String(fm.lang || CAU.lang),
    html       : kq.html,
    headings   : kq.headings,
    tho        : kq.tho,
    phut       : phutDoc(kq.tho)
  };
}

/* ══════════════ 3. DỰNG HTML ══════════════ */

const MAU_SHELL = fs.readFileSync(path.join(THU_MUC.src, 'templates', 'shell.html'), 'utf8');
const MAU_POST  = fs.readFileSync(path.join(THU_MUC.src, 'templates', 'post.html'), 'utf8');
const MAU_PAGE  = fs.readFileSync(path.join(THU_MUC.src, 'templates', 'page.html'), 'utf8');

/* Thay {{khoa}} bằng giá trị. Cố tình KHÔNG dùng regex chung cho mọi khoá:
   nội dung bài hoàn toàn có thể chứa chuỗi "{{...}}" (bài hướng dẫn về template
   chẳng hạn), và nếu thay theo vòng lặp thì chuỗi đó bị thay tiếp ở vòng sau. */
function dienMau(mau, gt) {
  return mau.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in gt ? String(gt[k] ?? '') : ''));
}

/* MỘT danh sách chuaDung trong site.config.json, mọi chỗ dùng chung.
   Link trỏ tới trang chưa có là link chết — người đọc bấm vào ăn trang 404, mà
   404 đọc như trang hỏng chứ không đọc như "phần này sắp có". Nên chỗ nào trỏ
   tới đường dẫn trong danh sách đó thì render thành chữ mờ, không phải <a>.
   Dựng xong trang nào thì xoá dòng đó khỏi danh sách, mọi link tự sống lại. */
const CHUA_DUNG = CAU.chuaDung || [];
function coTrang(href) {
  return !CHUA_DUNG.some((x) => href === x || href.startsWith(x));
}
/* Dựng một liên kết, tự hạ xuống chữ mờ nếu đích chưa dựng */
function lienKet(href, chu, lop = '') {
  return coTrang(href)
    ? `<a${lop ? ` class="${lop}"` : ''} href="${BASE}${href}">${escapeHtml(chu)}</a>`
    : `<span class="${lop ? lop + ' ' : ''}nav-cho tip" data-tip="Sắp có">${escapeHtml(chu)}</span>`;
}

function navHTML(duongHienTai) {
  return CAU.nav.map((n) => {
    if (!coTrang(n.href)) {
      return `<span class="nav-text nav-cho tip" data-tip="${NHAN.soon}">${escapeHtml(n.label)}</span>`;
    }
    const day = duongHienTai.startsWith(n.href) && n.href !== '/';
    return `<a class="nav-text" href="${BASE}${n.href}"${day ? ' aria-current="page"' : ''}>` +
           `${escapeHtml(n.label)}</a>`;
  }).join('\n      ');
}

/* Bỏ chú thích HTML khỏi trang đã dựng.
   Chú thích trong shell.html và post.html là ghi chú cho người SỬA TEMPLATE,
   không phải cho người đọc blog. Đẩy chúng ra HTML thì vừa nặng trang vừa sinh
   một lỗi khó thấy: chú thích nào nhắc tới tên thẻ (ví dụ giải thích về
   `<article>`) sẽ làm mọi phép dò cấu trúc bằng regex bắt nhầm mốc. Đã vấp
   đúng lỗi đó — bộ kiểm định báo "chú thích lọt vào thân bài" cho cả hai bài.

   Chú thích trong BÀI VIẾT đã bị bỏ từ khâu dựng Markdown (markdown.mjs);
   đây là lớp chặn thứ hai, cho phần khung trang. */
function boChuThich(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function trang({ title, description, canonical, ogTitle, ogImage, ogType, content,
                 scripts = '', headExtra = '', noindex = false, lang = CAU.lang, duong = '/' }) {
  return boChuThich(dienMau(MAU_SHELL, {
    lang,
    /* `data-base` để JS biết gốc trang khi deploy vào thư mục con (GitHub
       Pages kiểu /ten-repo/). search.js đọc nó để dựng đường dẫn tới
       search-index.json — gắn cứng '/' thì trang ở thư mục con tìm 404. */
    htmlAttr  : BASE ? `data-base="${attr(BASE)}"` : '',
    title     : escapeHtml(title),
    siteTitle : escapeHtml(CAU.title),
    tagline   : escapeHtml(CAU.tagline),
    author    : escapeHtml(CAU.author),
    description: attr(description || CAU.description),
    canonical : attr(canonical),
    ogTitle   : attr(ogTitle || title),
    ogType    : ogType || 'website',
    ogImage   : attr(ogImage || `${CAU.url}${BASE}/og.png`),
    locale    : CAU.locale,
    /* Không có bài nào noindex nữa (bản nháp không được dựng ra), nhưng giữ
       nhánh này phòng khi cần chặn một trang riêng lẻ.

       max-image-preview:large là thứ quyết định Google hiện ảnh bìa CỠ LỚN hay
       một ô nhỏ xíu cạnh tiêu đề. Mặc định của Google với trang tiếng Việt là
       ô nhỏ. Một dòng này đổi hẳn diện mạo kết quả tìm kiếm.
       max-snippet:-1 cho phép trích đoạn dài tuỳ Google thấy hợp. */
    robots    : noindex
      ? '<meta name="robots" content="noindex, nofollow">'
      : '<meta name="robots" content="index, follow, max-image-preview:large, ' +
        'max-snippet:-1, max-video-preview:-1">',
    base      : BASE,
    skipToMain: escapeHtml(NHAN.skipToMain),
    toLight   : attr(NHAN.toLight),
    toDark    : attr(NHAN.toDark),
    nav       : navHTML(duong),
    napTimKiem: coTrang('/search/')
      ? `<a class="ico-btn tip" href="${BASE}/search/" aria-label="${NHAN.search}" data-tip="${NHAN.search}">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/>` +
        `<path d="M16.2 16.2 21 21"/></svg></a>` : '',
    footLinks : [
        ['/feed.xml', 'RSS', true],
        ['/archive/', 'Archive', coTrang('/archive/')],
        ['/tags/', 'Tags', coTrang('/tags/')]
      ].map(([h, t, co]) => co ? `<a href="${BASE}${h}">${t}</a>`
                               : `<span class="nav-cho">${t}</span>`).join('\n      '),
    content,
    scripts,
    headExtra,
    year      : new Date().getFullYear(),
    buildDate : BAN.ngay ? temNgay(BAN.ngay) : ngayTem(),
    version   : BAN.ten,
    soTay     : SO_TAY(),
  }));
}

function tocHTML(headings) {
  /* Dưới 2 mục thì mục lục chỉ tổ chiếm chỗ — bài ngắn không cần bản đồ. */
  if (headings.length < 2) return '';
  const li = headings.map((h) =>
    `<li class="lvl-${h.cap}"><a href="#${h.id}">${escapeHtml(h.chu)}</a></li>`).join('');
  return `<details class="toc-box" open>
    <summary>${NHAN.contents}</summary>
    <nav class="toc" aria-label="${NHAN.onThisPage}">
      <div class="toc-title">${NHAN.onThisPage}</div>
      <ol>${li}</ol>
    </nav>
  </details>`;
}

function crumbsHTML(bai) {
  const muc = [
    `<li>${lienKet('/posts/', NHAN.posts)}</li>`,
    ...bai.muc.map((m) => `<li>${lienKet(m.url.replace(BASE, ''), m.ten)}</li>`)
  ].join('');
  return `<ol>${muc}</ol>`;
}

function coverHTML(bai) {
  if (!bai.cover) return '';
  const ngoai = /^https?:/.test(bai.cover);
  let dim = '', style = '';
  if (!ngoai) {
    const that = path.join(THU_MUC.public, bai.cover.replace(/^\//, ''));
    if (!fs.existsSync(that)) {
      CANH_BAO.push(`${bai.nhan}: ảnh bìa không tồn tại: ${bai.cover}`);
    } else {
      /* Dùng chung bộ đọc kích thước với ảnh trong bài — xem tools/lib/imgsize.mjs */
      const kt = kichThuocAnh(that);
      if (kt) { dim = ` width="${kt.w}" height="${kt.h}"`; style = ` style="--ar:${tiLe(kt.w, kt.h)}"`; }
    }
  }
  /* Ảnh bìa là thứ ĐẦU TIÊN người đọc nhìn thấy, nên KHÔNG lazy-load nó:
     lazy ở đây làm ảnh bìa về sau cả những ảnh nằm dưới màn hình. */
  /* Không còn class `wide`: ảnh bìa thẳng mép với cột chữ. Để nó thò ra hai
     bên thì bài nào cũng mở đầu bằng một tấm ảnh lệch khỏi mọi thứ phía dưới. */
  return `<figure class="post-cover">` +
    `<img src="${attr(ngoai ? bai.cover : BASE + bai.cover)}" alt="${attr(bai.coverAlt)}"` +
    `${dim}${style} loading="eager" fetchpriority="high" decoding="async">` +
    (bai.coverAlt ? `<figcaption>${escapeHtml(bai.coverAlt)}</figcaption>` : '') +
    `</figure>`;
}

/* ── KHỐI TAG Ở CHÂN BÀI ──
   Tag chuyển hẳn từ đầu bài xuống đây. Ở đầu bài chúng chen giữa tiêu đề và
   câu đầu tiên, làm chậm lúc người đọc đang muốn vào bài; ở chân bài chúng
   đúng vai: đọc xong rồi mới hỏi "còn gì giống thế này nữa không". */
function tagBlockHTML(bai) {
  if (!bai.tags.length) return '';
  return `<section class="post-tags">
    <p class="label label--muted">${NHAN.tagged}</p>
    <div class="tag-row">${bai.tags.map((t) =>
      lienKet(`/tags/${slugify(t)}/`, t, 'tag')).join('')}</div>
  </section>`;
}

/* ── GỢI Ý ĐỌC TIẾP ──
   Xếp hạng theo SỐ TAG TRÙNG trước, rồi mới tới gần nhau về thời gian. Bài
   cùng tag là bài cùng mạch nghĩ — đó mới là thứ người vừa đọc xong muốn đọc
   tiếp; còn "bài ngay trước/sau theo ngày" chỉ là một phép sắp xếp tình cờ.

   CHƯA xếp theo "được đọc nhiều" được: trang không gắn công cụ đo lượt xem
   nào (xem docs/IA.md §6). Khi nào gắn thì cộng thêm một số hạng vào `diem`
   dưới đây, phần còn lại không phải sửa. */
function goiY(bai, congKhai, soLuong = 3) {
  const tag = new Set(bai.tags.map((t) => slugify(t)));
  const i = congKhai.findIndex((b) => b.url === bai.url);

  return congKhai
    .filter((b) => b.url !== bai.url)
    .map((b, _, __) => {
      const j = congKhai.findIndex((x) => x.url === b.url);
      const trung = b.tags.filter((t) => tag.has(slugify(t))).length;
      return {
        bai: b,
        trung,
        /* Mỗi tag trùng ăn đứt mọi khoảng cách thời gian, nên nhân 100.
           Phần còn lại tách hai bài xa nhau về ngày ra sau. */
        diem: trung * 100 - Math.abs(j - i),
        moiHon: j < i
      };
    })
    .sort((a, b) => b.diem - a.diem)
    .slice(0, soLuong);
}

/* ── KHUNG BÌNH LUẬN ──
   Chỉ là HTML tĩnh; mọi việc gửi/nhận do src/js/comments.js lo, nói chuyện với
   một Google Apps Script (tools/apps-script/Code.gs).

   Ba chỗ cố ý:
     · Ô `hp` là BẪY BOT — ẩn bằng CSS chứ không phải type="hidden", vì bot đọc
       HTML thấy hidden là biết đường bỏ qua. Phải có aria-hidden và tabindex=-1
       để người dùng bàn phím và trình đọc màn hình không bao giờ lạc vào đó.
     · Email ghi rõ là KHÔNG hiện công khai — và đúng là không: doGet bên Apps
       Script không đọc cột email, nên không có đường nào moi ra qua mạng.
     · Form nằm TRƯỚC danh sách bình luận. Người ghé qua muốn để lại một dòng
       thì thấy ô nhập ngay, không phải cuộn qua hết bình luận của người khác. */
function binhLuanHTML(bai) {
  const c = CAU.binhLuan || {};
  if (c.bat === false) return '';
  /* Đầu khối là một cái NÚT, không phải một dòng chữ: cả khối đóng mở được.
     `aria-expanded` bắt đầu ở "true" vì mặc định là MỞ — giấu bình luận đi thì
     người đọc không biết là có, và Google cũng không đọc được chữ trong đó.
     Nút chỉ để ai muốn gấp lại cho gọn thì gấp. */
  /* Bảng nhãn đi kèm dưới dạng JSON: comments.js dựng ra một nửa giao diện
     bằng JS, mà những chữ đó vẫn phải nằm chung bảng NHAN ở đầu file này.
     Rải chữ sang file .js thì sửa một nhãn phải nhớ có hai chỗ. */
  const nhanJS = attr(JSON.stringify({
    author: NHAN.author, anon: NHAN.anon, reply: NHAN.reply,
    replyTo: NHAN.replyTo, cancelReply: NHAN.cancelReply,
    moreReplies: NHAN.moreReplies, noComments: NHAN.noComments,
    sending: NHAN.sending, tooShort: NHAN.tooShort, sent: NHAN.sent,
    failed: NHAN.failed, netErr: NHAN.netErr, notLinked: NHAN.notLinked,
    charsLeft: NHAN.charsLeft
  }));

  return `<section class="binh-luan" data-binh-luan="${attr(c.url || '')}"
           data-trang="${attr(bai.url)}" data-nhan="${nhanJS}">
    <div class="eyebrow"><i></i></div>
    <button class="bl-mo" type="button" aria-expanded="true" aria-controls="bl-than">
      <span class="label">${NHAN.comments} <span class="bl-dem"></span></span>
      <i class="bl-mui" aria-hidden="true"></i>
    </button>

    <div class="bl-than" id="bl-than">
    <p class="bl-moi">${escapeHtml(c.loiMoi || 'Ghé ngang thì để lại một dòng cũng được.')}</p>

    <ul class="bl-ds"></ul>

    <form class="bl-form" novalidate>
      <div class="bl-hang">
        <label class="bl-o">
          <span>${NHAN.yourName} <em>${NHAN.optional}</em></span>
          <input name="ten" type="text" maxlength="60" autocomplete="name"
                 placeholder="${attr(NHAN.namePh)}">
        </label>
        <label class="bl-o">
          <span>Email <em>${NHAN.emailNote}</em></span>
          <input name="email" type="email" maxlength="120" autocomplete="email"
                 placeholder="${attr(NHAN.emailPh)}">
        </label>
      </div>

      <label class="bl-o">
        <span>${NHAN.yourNote}</span>
        <textarea name="noiDung" rows="4" maxlength="2000" required
                  placeholder="${attr(NHAN.notePh)}"></textarea>
      </label>

      <input class="bl-hp" name="hp" type="text" tabindex="-1"
             autocomplete="off" aria-hidden="true">

      <div class="bl-chan">
        <span class="bl-con"></span>
        <button class="btn" type="submit">${NHAN.send}</button>
      </div>
    </form>

    <p class="bl-bao" role="status" aria-live="polite"></p>
    </div>
  </section>`;
}

function readNextHTML(bai, congKhai) {
  const ds = goiY(bai, congKhai);
  if (!ds.length) return '';

  const the = ds.map(({ bai: b, trung, moiHon }) => `
    <a class="rn-card card" href="${b.url}">
      <span class="rn-kind">${trung ? NHAN.related : (moiHon ? NHAN.newer : NHAN.older)}</span>
      <span class="rn-title">${escapeHtml(b.title)}</span>
      <span class="rn-meta">${ngayAnh(b.date)} · ${b.phut} ${NHAN.minRead}</span>
    </a>`).join('');

  return `<section class="read-next">
    <div class="eyebrow"><i></i></div>
    <p class="label">${NHAN.readNext}</p>
    <div class="rn-grid">${the}</div>
  </section>`;
}

/* Ảnh dùng cho og:image VÀ cho JSON-LD — phải là MỘT, không thì Facebook hiện
   một ảnh còn Google hiện ảnh khác. Luôn là địa chỉ TUYỆT ĐỐI: cả hai bên đều
   bỏ qua đường dẫn tương đối. */
function anhChiaSe(bai) {
  if (!bai.cover) return `${CAU.url}${BASE}/og.png`;
  return /^https?:/.test(bai.cover) ? bai.cover : `${CAU.url}${BASE}${bai.cover}`;
}

function trangBai(bai, congKhai) {
  const noiDung = dienMau(MAU_POST, {
    khung       : bai.khung,
    /* Thuộc tính cho copy-guard.js. Để rỗng khi tắt trong cấu hình thì script
       không tìm thấy mốc và tự thoát ngay, không làm gì cả. */
    copyGuard   : (CAU.baoVeChu || {}).bat === false ? '' :
      ` data-copy-guard data-nguong="${attr(String((CAU.baoVeChu || {}).nguong ?? 220))}"` +
      ` data-gioihan="${attr(String((CAU.baoVeChu || {}).gioiHan ?? 0))}"` +
      ` data-nhac="${attr((CAU.baoVeChu || {}).loiNhac || 'Đọc bản đầy đủ tại')}"` +
      ` data-tieude="${attr(bai.title)}"`,
    crumbs      : crumbsHTML(bai),
    /* noiChu() dán từ công cụ vào từ sau nó, để text-wrap:balance không bẻ
       tiêu đề đúng giữa một cụm từ. Chỉ dùng ở h1 — xem tools/lib/text.mjs. */
    title       : noiChu(escapeHtml(bai.title)),
    summaryBlock: bai.summary ? `<p class="summary">${escapeHtml(bai.summary)}</p>` : '',
    dateISO     : bai.date,
    dateText    : ngayAnh(bai.date),
    readingTime : bai.phut,
    updatedBlock: bai.updated
      ? `<span>${NHAN.updated} ${ngayAnh(bai.updated)}</span>`
      : '',
    draftBadge  : bai.draft ? `<span class="badge badge--draft">${NHAN.draft}</span>` : '',

    cover       : coverHTML(bai),
    body        : bai.html,
    tagBlock    : tagBlockHTML(bai),
    readNext    : readNextHTML(bai, congKhai),
    binhLuan    : binhLuanHTML(bai),
    toc         : tocHTML(bai.headings)
  });

  return trang({
    title      : `${bai.title} · ${CAU.title}`,
    ogTitle    : bai.title,
    description: bai.summary,
    canonical  : `${CAU.url}${bai.url}`,
    ogType     : 'article',
    ogImage    : anhChiaSe(bai),
    /* Bản nháp vẫn dựng ra file để tác giả xem thử, nhưng gắn noindex và
       không nằm trong danh sách / RSS / sitemap. */
    noindex    : bai.draft,
    lang       : bai.lang,
    duong      : '/posts/',
    content    : noiDung,
    scripts    : `<script src="${BASE}/assets/toc.js" defer></script>\n` +
                 `<script src="${BASE}/assets/media.js" defer></script>` +
                 ((CAU.binhLuan || {}).bat === false ? ''
                   : `\n<script src="${BASE}/assets/comments.js" defer></script>`) +
                 ((CAU.baoVeChu || {}).bat === false ? ''
                   : `\n<script src="${BASE}/assets/copy-guard.js" defer></script>`),
    /* HAI khối dữ liệu có cấu trúc, gộp trong một mảng @graph:

         BlogPosting     — Google đọc để biết đây là bài viết, của ai, ngày nào,
                           ảnh nào. Thiếu `image` thì không đủ điều kiện hiện
                           kết quả dạng thẻ có ảnh.
         BreadcrumbList  — thứ làm dòng "Posts › Psychology" hiện dưới tiêu đề
                           trong kết quả tìm kiếm, thay cho đường dẫn thô.
                           Phải khai riêng; Google không tự đọc <nav class="crumbs">. */
    headExtra  : `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: bai.title,
          datePublished: bai.date,
          dateModified: bai.updated || bai.date,
          description: bai.summary,
          keywords: bai.tags.join(', '),
          inLanguage: bai.lang,
          wordCount: (bai.tho.match(/\S+/g) || []).length,
          image: [anhChiaSe(bai)],
          author: { '@type': 'Person', name: CAU.author, url: `${CAU.url}${BASE}/` },
          publisher: { '@type': 'Person', name: CAU.author },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${CAU.url}${bai.url}` }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: CAU.title, item: `${CAU.url}${BASE}/` },
            ...bai.muc.map((m, i) => ({
              '@type': 'ListItem', position: i + 2, name: m.ten,
              item: `${CAU.url}${m.url}`
            })),
            { '@type': 'ListItem', position: bai.muc.length + 2, name: bai.title }
          ]
        }
      ]
    })}</script>`
  });
}

/* ══════════════ 3b. TRANG GIỚI THIỆU — HAI KHUNG ══════════════

   Cả hai khung dựng từ CÙNG dữ liệu trong front matter, chỉ khác cách bày.
   Đổi `khung:` trong content/pages/about.md là đổi hẳn diện mạo, không phải
   viết lại nội dung.

     bento   lưới ô kính, mỗi ô một mẩu thông tin. Liếc một cái là nắm hết.
             Hợp khi muốn trang giới thiệu đọc như một tấm danh thiếp.

     chuong  các chương chữ lớn, hiện dần khi cuộn tới. Đọc như một đoạn văn
             có nhịp. Hợp khi muốn kể hơn là liệt kê.
*/

function oQuote(nhan) {
  /* Ô trích dẫn — dữ liệu nhúng sẵn dạng JSON, JS chỉ chọn theo ngày.
     Nhúng thẳng chứ không fetch: một file JSON riêng cho 12 câu thì tốn thêm
     một vòng mạng mà chẳng tiết kiệm được byte nào đáng kể. */
  if (!KHO_QUOTE.length) return '';
  const api = (CAU.quoteAI || {}).bat ? (CAU.quoteAI.api || '/api/quote') : '';
  return `<div class="bo-quote card ${nhan}"${api ? ` data-api="${attr(BASE + api)}"` : ''}
    data-quote='${JSON.stringify(KHO_QUOTE)
      .replace(/'/g, '&#39;').replace(/</g, '\\u003c')}'>
    <p class="label label--muted">${NHAN.quoteToday}</p>
    <blockquote class="q-chu"></blockquote>
    <p class="q-ai"></p>
    <button class="q-nut ico-btn tip" type="button"
            aria-label="${NHAN.quoteMore}" data-tip="${NHAN.quoteMore}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.2V1.4L7.6 5.8 12 10.2V7.4a4.8 4.8 0 1 1-4.8 4.8H4.6A7.4 7.4 0 1 0 12 4.2Z"
              class="fill"/>
      </svg>
    </button>
  </div>`;
}

function khungBento(t, soBai, soTag) {
  /* CẤU TRÚC KHOÁ CỨNG, không để lưới tự xếp:

       hàng 1–2   [ giới thiệu  4 cột × 2 hàng ] [ trích dẫn 2 cột × 2 hàng ]
       hàng 3     [ dải số  6 cột — bên trong tự chia đều ]
       hàng 4     [ dạo này  3 cột ]             [ liên hệ  3 cột ]
       hàng 5     [ thân bài  6 cột ]

     Bản đầu để mỗi ô một span rồi thả cho lưới tự lấp. Hỏng: số ô SỐ thay đổi
     theo việc tác giả khai bao nhiêu field, nên hàng nào cũng có thể thừa 2
     cột trống — và một lưới bento có lỗ hổng đọc ra là trang bị lỗi, không
     phải trang gọn gàng.

     Cách chữa: nhét mọi ô số vào MỘT dải chiếm trọn 6 cột, bên trong dải đó
     mới chia đều. Khai 2 field hay 4 field thì lưới ngoài vẫn kín như nhau.

     ── CÓ ẢNH THÌ HÀNG ĐẦU CHIA BA ─────────────────────────────────────────
     Khai `anh:` trong front matter thì hàng đầu thành  ảnh 2 · giới thiệu 2 ·
     trích dẫn 2, vẫn trọn 6 cột. Không khai thì về khuôn cũ  giới thiệu 4 ·
     trích dẫn 2. Hai đường đều KÍN LƯỚI — đó là lý do phải đổi cả ô giới
     thiệu chứ không chỉ chèn thêm một ô ảnh vào. */
  const o = [];
  const coAnh = !!anhBento(t);

  if (coAnh) o.push(anhBento(t));

  o.push(`<div class="bo bo--intro card">
    <div class="eyebrow"><i></i></div>
    <h1>${noiChu(escapeHtml(t.title))}</h1>
    ${t.gioiThieu ? `<p class="bo-lead">${escapeHtml(t.gioiThieu)}</p>` : ''}
  </div>`);

  o.push(oQuote('bo bo--quote'));

  const soLieu = [
    t.viTri && { nhan: NHAN.based, chu: t.viTri },
    t.tuNam && { nhan: NHAN.writingSince, chu: t.tuNam },
    soBai   && { nhan: NHAN.posts, chu: String(soBai) },
    soTag   && { nhan: NHAN.topics, chu: String(soTag) }
  ].filter(Boolean);
  if (soLieu.length) {
    /* Ô số vốn dựng cho giá trị NGẮN: "2016", "12", "Hà Nội". Gặp chuỗi dài
       như "TP. Hồ Chí Minh" thì cỡ 32px vỡ thành hai dòng và đẩy lệch cả dải.
       Không ép người viết phải viết tắt — hạ cỡ chữ theo độ dài thay vì vậy.
       Ngưỡng 11 ký tự là chỗ chuỗi bắt đầu không vừa một dòng ở ô hẹp nhất
       (150px) trong dải. */
    o.push(`<div class="bo-dai">${soLieu.map((x) => `<div class="bo bo--so card">
      <span class="bo-so${x.chu.length > 11 ? ' bo-so--dai' : ''}">${escapeHtml(x.chu)}</span>
      <span class="label label--muted">${escapeHtml(x.nhan)}</span>
    </div>`).join('')}</div>`);
  }

  if (t.dangLam.length) {
    o.push(`<div class="bo bo--nay card">
      <p class="label label--muted">${NHAN.lately}</p>
      <ul class="bo-ds">${t.dangLam.map((d) =>
        `<li>${d.nhan ? `<b>${escapeHtml(d.nhan)}</b>` : ''}<span>${escapeHtml(d.chu)}</span></li>`
      ).join('')}</ul>
      ${t.nghe ? `<p class="bo-nghe">${escapeHtml(t.nghe)}</p>` : ''}
    </div>`);
  }

  if (t.lienHe.length) {
    o.push(`<div class="bo bo--lienhe card">
      <p class="label label--muted">${NHAN.findMe}</p>
      <ul class="bo-ds">${t.lienHe.map((d) => {
        const laMail = /@/.test(d.chu) && !/^https?:/.test(d.chu) &&
                       d.nhan.toLowerCase().includes('mail');
        const url = laMail ? `mailto:${d.chu}` : (/^https?:/.test(d.chu) ? d.chu : null);
        const chu = escapeHtml(d.chu);
        return `<li>${d.nhan ? `<b>${escapeHtml(d.nhan)}</b>` : ''}<span>` +
               `${url ? `<a href="${attr(url)}">${chu}</a>` : chu}</span></li>`;
      }).join('')}</ul>
    </div>`);
  }

  o.push(`<div class="bo bo--chu"><div class="prose">${t.html}</div></div>`);

  return `<div class="bento${coAnh ? ' bento--anh' : ''}">${o.filter(Boolean).join('\n')}</div>`;
}

/* Ô ẢNH CHÂN DUNG. Trả '' nếu không khai `anh:` — lưới tự về khuôn cũ.

   Ảnh phủ kín ô bằng object-fit:cover, KHÔNG giữ tỉ lệ gốc. Cố ý: ô này cao
   đúng bằng hàng đầu của lưới, mà chiều cao hàng đó do ô giới thiệu quyết
   định. Giữ tỉ lệ gốc thì ảnh dọc làm thủng lưới, ảnh ngang chừa băng trống
   trên dưới — đúng cái bệnh đã chữa ở dải số. Người dùng bỏ ảnh dọc hay ngang
   vào cũng ra một ô kín như nhau.

   Vẫn đọc kích thước thật để ghi width/height: cover thì không lệch khung,
   nhưng thiếu hai thuộc tính đó trình duyệt vẫn phải chờ tải xong mới biết
   chỗ mà đặt, và Lighthouse trừ điểm CLS. */
function anhBento(t) {
  if (!t.anh) return '';
  const ngoai = /^https?:/.test(t.anh);
  let dim = '';
  if (!ngoai) {
    const that = path.join(THU_MUC.public, t.anh.replace(/^\//, ''));
    if (!fs.existsSync(that)) {
      CANH_BAO.push(`${t.nhan}: ảnh chân dung không tồn tại: ${t.anh}`);
      return '';
    }
    const kt = kichThuocAnh(that);
    if (kt) dim = ` width="${kt.w}" height="${kt.h}"`;
  }
  return `<figure class="bo bo--anh card">` +
    `<img src="${attr(ngoai ? t.anh : BASE + t.anh)}" alt="${attr(t.anhAlt)}"${dim}` +
    ` loading="eager" fetchpriority="high" decoding="async">` +
    `</figure>`;
}

function khungChuong(t, soBai, soTag) {
  /* Cắt thân bài ở mỗi <h2> thành từng chương. Mỗi chương là một khối hiện dần
     khi cuộn tới — xem src/js/reveal.js. Cắt bằng chuỗi chứ không dựng lại DOM:
     bộ dựng Markdown đã ra HTML phẳng, các <h2> luôn ở cấp cao nhất. */
  const phan = t.html.split(/(?=<h2 )/);
  const dau  = phan[0];
  const ch   = phan.slice(1);

  return `<div class="chuong">
    <header class="ch ch--mo" data-hien>
      <div class="eyebrow"><i></i></div>
      <h1>${noiChu(escapeHtml(t.title))}</h1>
      ${t.gioiThieu ? `<p class="ch-lead">${escapeHtml(t.gioiThieu)}</p>` : ''}
      <div class="ch-so">
        ${[t.viTri && `${escapeHtml(t.viTri)}`,
           t.tuNam && `${NHAN.writingSince} ${escapeHtml(t.tuNam)}`,
           soBai && `${soBai} ${NHAN.posts.toLowerCase()}`
          ].filter(Boolean).map((x) => `<span>${x}</span>`).join('')}
      </div>
    </header>

    ${dau.trim() ? `<section class="ch" data-hien><div class="prose">${dau}</div></section>` : ''}
    ${ch.map((x) => `<section class="ch" data-hien><div class="prose">${x}</div></section>`).join('\n')}

    <section class="ch ch--quote" data-hien>${oQuote('')}</section>

    ${t.lienHe.length ? `<section class="ch ch--lienhe" data-hien>
      <p class="label label--muted">${NHAN.findMe}</p>
      <ul class="bo-ds">${t.lienHe.map((d) =>
        `<li>${d.nhan ? `<b>${escapeHtml(d.nhan)}</b>` : ''}${escapeHtml(d.chu)}</li>`
      ).join('')}</ul>
    </section>` : ''}
  </div>`;
}

function trangTinh(t, soBai, soTag) {
  const than = t.khung === 'chuong'
    ? khungChuong(t, soBai, soTag)
    : khungBento(t, soBai, soTag);

  return trang({
    title      : `${t.title} · ${CAU.title}`,
    ogTitle    : t.title,
    description: t.summary,
    canonical  : `${CAU.url}${t.url}`,
    ogType     : 'profile',
    lang       : t.lang,
    duong      : t.url.replace(BASE, ''),
    content    : dienMau(MAU_PAGE, { khung: t.khung, than }),
    scripts    : `<script src="${BASE}/assets/reveal.js" defer></script>` +
                 ((CAU.baoVeChu || {}).bat === false ? ''
                   : `\n<script src="${BASE}/assets/copy-guard.js" defer></script>`),
    headExtra  : `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ProfilePage',
      name: t.title, description: t.summary, inLanguage: t.lang,
      mainEntity: { '@type': 'Person', name: CAU.author,
                    description: t.gioiThieu || t.summary,
                    url: `${CAU.url}${BASE}/` }
    })}</script>`
  });
}

/* ══════════════ 4. GHI FILE ══════════════ */

function ghi(duongDan, noiDung) {
  if (CHI_KIEM) return;
  fs.mkdirSync(path.dirname(duongDan), { recursive: true });
  fs.writeFileSync(duongDan, noiDung);
}
function chep(tu, den) {
  if (CHI_KIEM || !fs.existsSync(tu)) return;
  fs.cpSync(tu, den, { recursive: true });
}

function gopCSS() {
  /* Thứ tự KHÔNG đổi được:
       tokens     trước mọi thứ, vì mọi file còn lại đọc biến của nó
       glass      trước component, để component ghi đè được vật liệu khi cần
       prose      sau component, để khung đọc bài ghi đè được component
     Danh sách này phải phủ HẾT src/styles/ — bộ kiểm định có một phép so lại
     (xem tools/kiem-dinh.mjs). Bản trước thiếu glass.css ở đây, và vì CSS
     thiếu thì không báo lỗi gì cả, cả bộ liquid glass im lặng không chạy. */
  const thuTu = ['tokens.css', 'base.css', 'glass.css', 'layout.css',
                 'components.css', 'list.css', 'prose.css', 'about.css'];

  const gop = thuTu.map((f) => {
    const p = path.join(THU_MUC.src, 'styles', f);
    if (!fs.existsSync(p)) { CANH_BAO.push(`thiếu file style: ${f}`); return ''; }
    return `/* ───────── ${f} ───────── */\n${fs.readFileSync(p, 'utf8')}`;
  }).join('\n\n');

  return boChuThichCSS(gop);
}

/* ── CẮT CHÚ THÍCH KHI GỬI RA ──
   Mấy file trong src/styles/ có rất nhiều chú thích, và đó là chủ ý: chúng ghi
   lại vì sao từng luật lại viết như vậy, chỗ nào đã vấp. Nhưng người ĐỌC BLOG
   không cần chúng, mà vẫn phải tải về.

   Đo trên bundle thật:
       nguyên bản    91.1KB  ·  25.8KB sau brotli
       bỏ chú thích  56.7KB  ·  10.9KB sau brotli

   Tức là 15KB mỗi lượt tải đầu, chỉ để chở mấy dòng ghi chú cho chính mình.
   Chú thích vẫn nằm nguyên trong src/ — đây chỉ là bước cuối trước khi ghi ra
   dist/.

   KHÔNG nén khoảng trắng luôn: đo ra chỉ thêm 1.1KB nữa sau brotli, đổi lại
   CSS gửi đi mất hẳn khả năng đọc khi cần soi bằng DevTools. Không đáng.

   An toàn vì chú thích CSS không lồng nhau được, và đã soát: không có chuỗi
   `/*` nào nằm trong `content:` hay `url()` của dự án này. */
function boChuThichCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    /* Bỏ chú thích xong để lại nhiều dòng trống liên tiếp — gom lại còn một. */
    .replace(/\n[ \t]*\n[ \t]*\n+/g, '\n\n')
    .replace(/[ \t]+$/gm, '');
}

/* ══════════════ 5. TRANG DANH SÁCH ══════════════

   Sáu trang dùng chung một khuôn: trang chủ · /posts/ · /posts/<mục>/ ·
   /tags/ · /tags/<tag>/ · /archive/. Khác nhau ở tiêu đề, bộ lọc và danh
   sách bài truyền vào — không trang nào có bố cục riêng.

   Cố ý vậy: sáu bố cục riêng thì sửa khoảng cách một cái là phải mở sáu file
   và chắc chắn sót một chỗ. Một khuôn thì sửa một lần.
   ============================================================ */

/* Thẻ một bài. Dùng ở mọi trang danh sách và ở khối "đọc tiếp" cuối bài. */
function theBai(b, { hienMuc = true } = {}) {
  const muc = hienMuc && b.muc.length ? b.muc[b.muc.length - 1] : null;
  return `<article class="card the-bai">
    <div class="meta-row">
      <time datetime="${b.date}">${ngayAnh(b.date)}</time>
      <span>${b.phut} ${NHAN.minRead}</span>
      ${muc ? `<span>${escapeHtml(muc.ten)}</span>` : ''}
      ${b.draft ? `<span class="badge badge--draft">${NHAN.draft}</span>` : ''}
    </div>
    <h3><a class="stretch" href="${b.url}">${noiChu(escapeHtml(b.title))}</a></h3>
    <p class="the-tom">${escapeHtml(tomTat(b.summary, 150))}</p>
    ${b.tags.length ? `<div class="tag-row">${b.tags.slice(0, 3).map((t) =>
      `<span class="tag tag--tinh">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
  </article>`;
}

/* Lưới thẻ. `min(300px,100%)` chứ không phải 300px trơn: thiếu `min()` thì ở
   khổ hẹp hơn 300px, cột vẫn giữ 300px và trang tràn ngang. */
function luoiThe(ds, trong) {
  if (!ds.length) return `<p class="ds-trong">${trong}</p>`;
  return `<div class="ds-luoi">${ds.map((b) => theBai(b)).join('')}</div>`;
}

/* Hàng chip lọc. `nay` là chip đang bật. */
function hangChip(ds, nay) {
  if (!ds.length) return '';
  return `<nav class="chip-hang" aria-label="Filter">${ds.map((x) =>
    `<a class="chip${x.href === nay ? ' chip--nay' : ''}" href="${BASE}${x.href}"` +
    `${x.href === nay ? ' aria-current="page"' : ''}>${escapeHtml(x.ten)}` +
    `${x.so != null ? `<span class="chip-so">${x.so}</span>` : ''}</a>`).join('')}</nav>`;
}

/* Khuôn chung của mọi trang danh sách. */
function trangDanhSach({ tieuDe, dan, chip, than, duong, canonical, title, description,
                        scripts = '' }) {
  return trang({
    title: title || `${tieuDe} · ${CAU.title}`,
    description: description || CAU.description,
    canonical: canonical || `${CAU.url}${BASE}${duong}`,
    duong,
    scripts: ((CAU.baoVeChu || {}).bat === false ? ''
      : `<script src="${BASE}/assets/copy-guard.js" defer></script>`) + scripts,
    content: `
<div class="container ds-trang">
  <header class="ds-dau">
    <div class="eyebrow"><i></i></div>
    <h1>${noiChu(escapeHtml(tieuDe))}</h1>
    ${dan ? `<p class="ds-dan">${escapeHtml(dan)}</p>` : ''}
    ${chip || ''}
  </header>
  ${than}
</div>`
  });
}

/* ── TRANG CHỦ ── */
function trangChu(bai) {
  /* Bài ghim lên trước, rồi tới mới nhất. `pinned: true` trong front matter. */
  const xep = [...bai].sort((a, b) =>
    (b.pinned - a.pinned) || (a.date < b.date ? 1 : -1));
  const noiBat = xep[0];
  /* `postsPerPage` trong site.config.json quyết định trang chủ liệt kê bao
     nhiêu bài dưới bài nổi bật. Trước đây khoá này khai mà KHÔNG AI ĐỌC — sửa
     nó không có tác dụng gì, đúng kiểu cấu hình nói dối.

     Chưa cắt trang cho /posts/: ba bài thì cắt trang là thừa. Khi nào danh sách
     dài tới mức phải cuộn lâu mới tính, và lúc đó dùng lại chính khoá này. */
  const conLai = xep.slice(1, 1 + Math.max(1, Number(CAU.postsPerPage) || 6));

  return trang({
    title: `${CAU.title} · ${CAU.tagline}`,
    description: CAU.description,
    canonical: `${CAU.url}${BASE}/`,
    duong: '/',
    /* Trang chủ khai WebSite + Person: đây là chỗ Google lấy tên trang và tên
       tác giả để hiện trong kết quả, thay vì tự đoán từ thẻ <title>. */
    headExtra: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: CAU.title, description: CAU.description,
          url: `${CAU.url}${BASE}/`, inLanguage: CAU.lang,
          publisher: { '@type': 'Person', name: CAU.author } },
        { '@type': 'Person', name: CAU.author, url: `${CAU.url}${BASE}/` }
      ]
    })}</script>`,
    scripts: (CAU.baoVeChu || {}).bat === false ? ''
      : `<script src="${BASE}/assets/copy-guard.js" defer></script>`,
    content: `
<div class="container trang-chu">
  <header class="chu-dau">
    <div class="eyebrow"><i></i></div>
    <h1>${escapeHtml(CAU.title)}</h1>
    <p class="chu-dan">${escapeHtml(CAU.description)}</p>
  </header>

  ${noiBat ? `<section class="chu-nb">
    <p class="label label--muted">${noiBat.pinned ? NHAN.pinned : NHAN.latest}</p>
    <article class="card chu-the">
      <div class="meta-row">
        <time datetime="${noiBat.date}">${ngayAnh(noiBat.date)}</time>
        <span>${noiBat.phut} ${NHAN.minRead}</span>
      </div>
      <h2><a class="stretch" href="${noiBat.url}">${noiChu(escapeHtml(noiBat.title))}</a></h2>
      <p class="chu-tom">${escapeHtml(tomTat(noiBat.summary, 220))}</p>
      ${noiBat.tags.length ? `<div class="tag-row">${noiBat.tags.map((t) =>
        `<span class="tag tag--tinh">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    </article>
  </section>` : ''}

  ${conLai.length ? `<section class="chu-ds">
    <div class="ds-thanh">
      <p class="label label--muted">${NHAN.more}</p>
      ${coTrang('/posts/') ? `<a class="ds-them" href="${BASE}/posts/">${NHAN.allPosts} →</a>` : ''}
    </div>
    ${luoiThe(conLai, '')}
  </section>` : ''}

  ${!bai.length ? `<p class="ds-trong">${NHAN.noPosts}</p>` : ''}
</div>`
  });
}

/* ── /posts/ VÀ /posts/<chuyên mục>/ ──
   Chuyên mục lấy từ CHÍNH CẤU TRÚC THƯ MỤC trong content/posts/, không phải
   từ một danh sách khai tay. Bỏ bài vào thư mục mới là chuyên mục mới tự có
   trang riêng, tự lên hàng chip. Đó là điểm quan trọng cho việc đăng bài về
   sau: không phải nhớ khai thêm ở đâu cả. */
function gomMuc(bai) {
  const m = new Map();
  for (const b of bai) {
    for (let i = 0; i < b.muc.length; i++) {
      const x = b.muc[i];
      if (!m.has(x.url)) m.set(x.url, { ...x, so: 0, sau: i > 0 });
      m.get(x.url).so++;
    }
  }
  return [...m.values()];
}

/* Bảng tag: tên hiển thị (giữ dấu) ↔ slug ↔ số bài.
   Gộp theo SLUG chứ không theo tên: "Tâm lý" và "tâm lý" phải là một chủ đề,
   không phải hai trang riêng. Tên hiển thị lấy theo lần xuất hiện đầu tiên. */
function gomTag(bai) {
  const m = new Map();
  for (const b of bai) {
    for (const t of b.tags) {
      const s = slugify(t);
      if (!m.has(s)) m.set(s, { slug: s, ten: t, so: 0, bai: [] });
      const o = m.get(s); o.so++; o.bai.push(b.url);
    }
  }
  return [...m.values()].sort((a, b) => b.so - a.so || a.ten.localeCompare(b.ten, 'vi'));
}

function cacTrangPosts(bai) {
  const ra = [];
  const muc = gomMuc(bai);
  /* Chip chỉ hiện chuyên mục CẤP MỘT. Đổ cả cấp hai vào thì một blog có sáu
     mục con là hàng chip dài hơn cả danh sách bài. Mục con vẫn có trang riêng,
     vào từ dòng chuyên mục trên mỗi thẻ bài. */
  const chipDS = [{ ten: NHAN.allPosts, href: '/posts/' }]
    .concat(muc.filter((x) => !x.sau)
               .sort((a, b) => b.so - a.so || a.ten.localeCompare(b.ten, 'vi'))
               .map((x) => ({ ten: x.ten, href: x.url.replace(BASE, ''), so: x.so })));

  const theoNgay = [...bai].sort((a, b) => (a.date < b.date ? 1 : -1));

  ra.push({
    duong: '/posts/',
    html: trangDanhSach({
      tieuDe: NHAN.allPosts,
      dan: `${theoNgay.length} ${theoNgay.length === 1 ? 'bài' : 'bài'} · ${muc.filter((x) => !x.sau).length} chuyên mục`,
      chip: hangChip(chipDS, '/posts/'),
      than: luoiThe(theoNgay, NHAN.noPosts),
      duong: '/posts/'
    })
  });

  for (const x of muc) {
    const duong = x.url.replace(BASE, '');
    const trong = theoNgay.filter((b) => b.muc.some((y) => y.url === x.url));
    ra.push({
      duong,
      html: trangDanhSach({
        tieuDe: x.ten,
        dan: `${trong.length} bài trong chuyên mục này`,
        chip: hangChip(chipDS, duong),
        than: luoiThe(trong, NHAN.noPosts),
        duong,
        description: moTaDanhSach(
          tenMuc(x.url.replace(`${BASE}/posts/`, '').replace(/\/$/, '')).description ||
          `Chuyên mục ${x.ten} trên ${CAU.title}`, trong)
      })
    });
  }
  return ra;
}

/* ── /tags/ VÀ /tags/<tag>/ ── */
/* Ghép một câu mô tả đủ dài cho trang danh sách: câu mở + tên vài bài trong
   đó. Google cắt ở ~170 ký tự nên dừng trước mốc ấy, và dừng ở RANH GIỚI BÀI
   chứ không cắt giữa một cái tên — cắt giữa thì đoạn mô tả kết thúc lửng lơ. */
function moTaDanhSach(mo, ds) {
  let ra = mo.replace(/\.$/, '') + '.';
  if (!ds.length) return ra;
  const ten = [];
  for (const b of ds) {
    const thu = ra + ' ' + [...ten, b.title].join(' · ') + '.';
    if (thu.length > 168) break;
    ten.push(b.title);
  }
  return ten.length ? `${ra} ${ten.join(' · ')}.` : ra;
}

function cacTrangTags(bai, bangTag) {
  const ra = [];

  /* Cỡ chữ theo số bài — mây tag đọc ra ngay cái nào nhiều. Ba bậc thôi:
     chia theo tỉ lệ liên tục thì tag 3 bài và tag 4 bài lệch nhau vài phần
     trăm pixel, mắt không thấy mà mã thì phức tạp thêm. */
  const max = Math.max(1, ...bangTag.map((t) => t.so));
  const bac = (n) => (n >= max * 0.66 ? ' tag--to' : n >= max * 0.33 ? ' tag--vua' : '');

  ra.push({
    duong: '/tags/',
    html: trangDanhSach({
      tieuDe: NHAN.topics,
      dan: `${bangTag.length} chủ đề trên ${bai.length} bài`,
      than: bangTag.length
        ? `<div class="may-tag">${bangTag.map((t) =>
            `<a class="tag tag--may${bac(t.so)}" href="${BASE}/tags/${t.slug}/">` +
            `${escapeHtml(t.ten)}<span class="tag-so">${t.so}</span></a>`).join('')}</div>`
        : `<p class="ds-trong">${NHAN.noTags}</p>`,
      duong: '/tags/'
    })
  });

  for (const t of bangTag) {
    const trong = bai.filter((b) => b.tags.some((x) => slugify(x) === t.slug))
                     .sort((a, b) => (a.date < b.date ? 1 : -1));
    ra.push({
      duong: `/tags/${t.slug}/`,
      html: trangDanhSach({
        tieuDe: t.ten,
        dan: `${trong.length} bài gắn chủ đề này`,
        chip: coTrang('/tags/')
          ? `<nav class="chip-hang"><a class="chip" href="${BASE}/tags/">← ${NHAN.allTopics}</a></nav>` : '',
        than: luoiThe(trong, NHAN.noPosts),
        duong: `/tags/${t.slug}/`,
        title: `${t.ten} · ${NHAN.topics} · ${CAU.title}`,
        /* Mô tả phải dài 50–170 ký tự thì Google mới hiện trọn — ngắn quá nó
           tự bịa một đoạn trích từ thân trang, mà thân trang danh sách thì
           chỉ toàn tiêu đề bài, đọc ra rất cụt. Nên nhồi thêm TÊN MẤY BÀI
           trong chủ đề đó: vừa đủ dài, vừa đúng là thứ người tìm muốn thấy. */
        description: moTaDanhSach(`Các bài viết về ${t.ten} trên ${CAU.title}`, trong)
      })
    });
  }
  return ra;
}

/* ── /archive/ — theo năm ──
   Danh sách dày, không phải lưới thẻ: kho lưu là chỗ người ta ĐI TÌM một bài
   đã biết tên, không phải chỗ lướt xem có gì hay. Thẻ to làm việc tìm chậm đi. */
function trangArchive(bai) {
  const theoNam = new Map();
  for (const b of [...bai].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    const n = b.date.slice(0, 4);
    if (!theoNam.has(n)) theoNam.set(n, []);
    theoNam.get(n).push(b);
  }
  const than = [...theoNam.entries()].map(([nam, ds]) => `
    <section class="kho-nam">
      <h2 class="kho-so">${nam}<span class="kho-dem">${ds.length}</span></h2>
      <ul class="kho-ds">${ds.map((b) => `
        <li class="kho-dong">
          <time datetime="${b.date}">${ngayAnh(b.date).replace(/ \d{4}$/, '')}</time>
          <a href="${b.url}">${escapeHtml(b.title)}</a>
          ${b.muc.length ? `<span class="kho-muc">${escapeHtml(b.muc[b.muc.length - 1].ten)}</span>` : ''}
        </li>`).join('')}</ul>
    </section>`).join('');

  return trangDanhSach({
    tieuDe: NHAN.archive,
    dan: `${bai.length} bài · ${theoNam.size} năm`,
    than: bai.length ? than : `<p class="ds-trong">${NHAN.noPosts}</p>`,
    duong: '/archive/'
  });
}

/* ── /search/ — tìm ngay trên trình duyệt ──
   Không có máy chủ tìm kiếm nào cả: build đã ghi sẵn `search-index.json`, trang
   tải file đó một lần rồi lọc tại chỗ. Với một blog cá nhân (vài trăm bài) thì
   cách này nhanh hơn gọi mạng, chạy được offline, và không tốn đồng nào.

   Khi nào cần đổi: chỉ mục lớn hơn khoảng 1MB — lúc đó mới phải cắt trang hoặc
   dựng chỉ mục đảo. Còn lâu mới tới. */
function trangSearch() {
  return trangDanhSach({
    tieuDe: NHAN.search,
    dan: NHAN.searchHint,
    than: `
<form class="tk-form" role="search" onsubmit="return false">
  <label class="sr-only" for="tk-o">${NHAN.search}</label>
  <div class="tk-hop">
    <svg class="tk-kinh" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/>
    </svg>
    <input id="tk-o" class="tk-o" type="search" autocomplete="off" autofocus
           placeholder="${attr(NHAN.searchPh)}" enterkeyhint="search">
    <button class="tk-xoa" type="button" aria-label="${attr(NHAN.clear)}" hidden>✕</button>
  </div>
</form>
<div class="tk-loc" id="tk-loc" data-nhan="${attr(JSON.stringify({
      results: NHAN.results, oneResult: NHAN.oneResult,
      noResults: NHAN.noResults, typeMore: NHAN.typeMore
    }))}"></div>
<p class="tk-dem" role="status" aria-live="polite"></p>
<div class="tk-kq" id="tk-kq"></div>`,
    duong: '/search/',
    scripts: `<script src="${BASE}/assets/search.js" defer></script>`
  });
}

/* ══════════════ FILE PHỤ ══════════════ */


function rss(bai) {
  const muc = bai.slice(0, 30).map((b) => `    <item>
      <title>${escapeHtml(b.title)}</title>
      <link>${CAU.url}${b.url}</link>
      <guid isPermaLink="true">${CAU.url}${b.url}</guid>
      <pubDate>${new Date(b.date).toUTCString()}</pubDate>
      <description>${escapeHtml(b.summary)}</description>
${b.tags.map((t) => `      <category>${escapeHtml(t)}</category>`).join('\n')}
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(CAU.title)}</title>
    <link>${CAU.url}${BASE}/</link>
    <description>${escapeHtml(CAU.description)}</description>
    <language>${CAU.lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${CAU.url}${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${muc}
  </channel>
</rss>`;
}

/* lastmod giúp Google biết trang nào vừa đổi mà quay lại đọc, thay vì bò đều
   khắp trang mỗi lần. Với blog ít bài thì chưa khác biệt mấy, nhưng khi có vài
   trăm bài thì đây là thứ quyết định bài mới được đọc sau vài giờ hay vài ngày. */
function sitemap(bai, trangKhac = []) {
  const moiNhat = bai.length
    ? bai.map((b) => b.updated || b.date).sort().at(-1)
    : new Date().toISOString().slice(0, 10);

  const u = [
    { loc: `${CAU.url}${BASE}/`, mod: moiNhat, uu: '1.0' },
    ...bai.map((b) => ({ loc: `${CAU.url}${b.url}`, mod: b.updated || b.date, uu: '0.8' })),
    ...trangKhac.map((u) => ({ loc: `${CAU.url}${u}`, mod: moiNhat, uu: '0.6' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${u.map((x) => `  <url>\n    <loc>${x.loc}</loc>\n    <lastmod>${x.mod}</lastmod>` +
             `\n    <priority>${x.uu}</priority>\n  </url>`).join('\n')}
</urlset>`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="#F4E7FB"/>
<path d="M16 14.6a2.6 2.6 0 1 0 0 1.6 2.6 2.6 0 0 0 0-1.6Zm0-9c1.9 0 3.1 1.8 2.6 3.6-.2.8.6 1.5 1.3 1.1 1.7-.9 3.7.3 3.7 2.2 0 1.9-2 3.1-3.7 2.2-.7-.4-1.5.3-1.3 1.1.5 1.8-.7 3.6-2.6 3.6s-3.1-1.8-2.6-3.6c.2-.8-.6-1.5-1.3-1.1-1.7.9-3.7-.3-3.7-2.2 0-1.9 2-3.1 3.7-2.2.7.4 1.5-.3 1.3-1.1C12.9 7.4 14.1 5.6 16 5.6Z" fill="#E3AADD"/>
</svg>`;

/* ══════════════ 6. CHẠY ══════════════ */

let KHO_QUOTE = [];

async function chay() {
  const t0 = Date.now();
  KHO_QUOTE = docTrichDan();
  console.log(mau.dam(`\n  ${CAU.title} — ${CHI_KIEM ? 'kiểm bài' : 'dựng trang'}\n`));

  const file = quet(THU_MUC.posts);
  if (!file.length) CANH_BAO.push('content/posts/ chưa có bài nào');

  const bai = file.map(docBai).filter(Boolean);
  const trangTinhDS = quet(THU_MUC.pages).map(docTrang).filter(Boolean);

  /* Trùng URL là lỗi câm nhất trong mọi lỗi build: bài sau ghi đè bài trước,
     không báo gì cả, và mãi sau mới phát hiện mất một bài. */
  const theoUrl = new Map();
  for (const b of bai) {
    if (theoUrl.has(b.url)) {
      LOI.push(`hai bài cùng đường dẫn ${b.url}:\n      ${theoUrl.get(b.url).nhan}\n      ${b.nhan}` +
               `\n      → khai \`slug\` khác nhau trong front matter của một trong hai bài`);
    } else theoUrl.set(b.url, b);
  }

  bai.sort((a, b) => (b.pinned - a.pinned) || b.date.localeCompare(a.date) ||
                     a.title.localeCompare(b.title, 'vi'));
  const congKhai = bai.filter((b) => !b.draft);

  if (LOI.length) {
    console.log(mau.do(`  ✖ ${LOI.length} lỗi — KHÔNG dựng trang:\n`));
    LOI.forEach((l) => console.log(`    ${mau.do('•')} ${l}`));
    console.log('');
    process.exit(1);
  }

  /* Đọc phiên bản của LẦN DỰNG TRƯỚC ngay trong dist cũ, trước khi xoá nó.
     Không cần file trạng thái riêng ở gốc dự án — dist đã là chỗ ghi nhớ sẵn. */
  let banCu = null;
  const fBan = path.join(THU_MUC.dist, 'version.json');
  if (fs.existsSync(fBan)) {
    try { banCu = JSON.parse(fs.readFileSync(fBan, 'utf8')).ban; } catch {}
  }

  if (!CHI_KIEM) {
    fs.rmSync(THU_MUC.dist, { recursive: true, force: true });
    fs.mkdirSync(THU_MUC.dist, { recursive: true });

    chep(THU_MUC.public, THU_MUC.dist);
    ghi(path.join(THU_MUC.dist, 'assets', 'style.css'), gopCSS());
    for (const j of ['theme.js', 'toc.js', 'media.js', 'comments.js',
                     'copy-guard.js', 'reveal.js', 'so-tay.js', 'search.js']) {
      ghi(path.join(THU_MUC.dist, 'assets', j),
          fs.readFileSync(path.join(THU_MUC.src, 'js', j), 'utf8'));
    }
    ghi(path.join(THU_MUC.dist, 'favicon.svg'), FAVICON);
    nuongNguonQuote();

    /* Gợi ý chỉ lấy trong danh sách CÔNG KHAI: gợi ý cả bản nháp thì bạn đọc
       bấm vào là rơi vào một bài chưa viết xong. */
    const canDung = CO_NHAP ? bai : congKhai;
    for (const b of canDung) ghi(b.duongDanRa, trangBai(b, congKhai));

    /* Trang tĩnh dựng sau bài viết, vì khung bento cần biết tổng số bài và
       tổng số tag để điền mấy ô số. */
    const soTag = new Set(congKhai.flatMap((b) => b.tags.map(slugify))).size;
    for (const t of trangTinhDS) {
      ghi(t.duongDanRa, trangTinh(t, congKhai.length, soTag));
    }

    ghi(path.join(THU_MUC.dist, 'index.html'), trangChu(canDung));

    /* Bảng tag dựng MỘT LẦN rồi dùng cho cả trang /tags/ lẫn file tags.json —
       hai nguồn thì sớm muộn lệch nhau về số đếm. */
    const bangTag = gomTag(congKhai);

    /* Trang danh sách. `duong` là đường dẫn trang, đổi thành thư mục + index.html
       để máy chủ nào cũng phục vụ được mà không cần luật rewrite. */
    const dsTrang = [
      ...cacTrangPosts(canDung),
      ...cacTrangTags(canDung, bangTag),
      { duong: '/archive/', html: trangArchive(canDung) },
      { duong: '/search/',  html: trangSearch() }
    ];
    for (const t of dsTrang) {
      ghi(path.join(THU_MUC.dist, ...t.duong.split('/').filter(Boolean), 'index.html'), t.html);
    }

    ghi(path.join(THU_MUC.dist, 'feed.xml'), rss(congKhai));
    ghi(path.join(THU_MUC.dist, 'sitemap.xml'),
        sitemap(congKhai, [...trangTinhDS.map((t) => t.url),
                           ...dsTrang.map((t) => `${BASE}${t.duong}`)]));
    ghi(path.join(THU_MUC.dist, 'robots.txt'),
        `User-agent: *\nAllow: /\nSitemap: ${CAU.url}${BASE}/sitemap.xml\n`);
    ghi(path.join(THU_MUC.dist, 'version.json'), JSON.stringify({
      ban: BAN.ten, ngay: BAN.ngay, suaChinh: BAN.suaChinh,
      dungLuc: new Date().toISOString()
    }));

    /* Bộ chỉ mục tìm kiếm. Trang /search/ của lượt sau chỉ việc tải file này
       rồi lọc ngay trong trình duyệt — không cần máy chủ, không cần API.
       Cắt phần chữ thô ở 1200 ký tự: đủ để tìm trúng, mà file không phình to. */
    const chiMuc = congKhai.map((b) => ({
      url: b.url, title: b.title, summary: b.summary, tags: b.tags,
      muc: b.muc.map((m) => m.ten), date: b.date, phut: b.phut,
      cover: b.cover,
      /* Kèm bản bỏ dấu để gõ "tam ly" cũng tìm ra "tâm lý" */
      kd: boDau(`${b.title} ${b.summary} ${b.tags.join(' ')}`).toLowerCase(),
      tho: b.tho.slice(0, 1200)
    }));
    ghi(path.join(THU_MUC.dist, 'search-index.json'), JSON.stringify(chiMuc));

    ghi(path.join(THU_MUC.dist, 'tags.json'), JSON.stringify(bangTag));
  }

  /* ── Báo cáo ── */
  if (CANH_BAO.length) {
    console.log(mau.vang(`  ⚠ ${CANH_BAO.length} cảnh báo:\n`));
    CANH_BAO.forEach((c) => console.log(`    ${mau.vang('•')} ${c}`));
    console.log('');
  }
  if (CHI_TIET) bai.forEach((b) => console.log(`    ${mau.mo(b.url.padEnd(46))} ${b.title}`));

  /* Có bản mới thì in hẳn một khối cho dễ thấy — đây là lúc dễ quên nhất việc
     viết mấy dòng tóm tắt xuống phần dưới sổ. */
  if (!CHI_KIEM && banCu && banCu !== BAN.ten) {
    console.log(mau.tim(`  ┌─ CẬP NHẬT MỚI  ${banCu} → ${BAN.ten}`));
    console.log(mau.tim('  │ ') + BAN.suaChinh);
    console.log(mau.tim('  └─ ') + mau.mo('nhớ viết tóm tắt cho bản này ở docs/LICH-SU.md\n'));
  }

  const nhap = bai.length - congKhai.length;
  if (nhap && !CHI_KIEM) {
    console.log(mau.mo(CO_NHAP
      ? `    ${nhap} bản nháp CÓ dựng ra file (đang ở chế độ xem thử)`
      : `    ${nhap} bản nháp KHÔNG dựng ra file — thêm --nhap nếu muốn xem thử`));
  }

  console.log(mau.xanh(`  ✓ ${congKhai.length} bài công khai` +
    (nhap ? ` · ${nhap} bản nháp` : '') +
    (trangTinhDS.length ? ` · ${trangTinhDS.length} trang tĩnh` : '') +
    (KHO_QUOTE.length ? ` · ${KHO_QUOTE.length} trích dẫn` : '')) +
    mau.mo(`  ·  ${BAN.ten} · ${BAN.ngay}`) +
    mau.mo(`  (${Date.now() - t0}ms)`));
  console.log(mau.mo(CHI_KIEM
    ? '    chế độ kiểm bài — không ghi file nào\n'
    : `    → ${path.relative(GOC, THU_MUC.dist)}/   ·   xem thử: npm run dev\n`));
}

chay().catch((e) => { console.error(mau.do('\n  ✖ ' + e.stack + '\n')); process.exit(1); });
