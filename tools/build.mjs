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
import { vanTay, capNhatMoc } from './lib/moc.mjs';
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
  updated     : 'Updated',
  /* Chữ cho mốc thời gian tương đối. Gửi sang JS qua attribute dạng JSON —
     chữ hiển thị ở một chỗ duy nhất, không gõ cứng vào file .js. */
  thoi        : {
    now: 'just now', ago: '{t} ago',
    min: '{n} min',   mins: '{n} mins',
    hour: '{n} hour', hours: '{n} hours',
    day: '{n} day',   days: '{n} days',
    month: '{n} month', months: '{n} months',
    year: '{n} year',   years: '{n} years'
  },
  views       : '{n} views',
  view1       : '1 view',
  draft       : 'Draft',
  soon        : 'Coming soon',
  search      : 'Search',
  skipToMain  : 'Skip to content',
  toLight     : 'Switch to light',
  toDark      : 'Switch to dark',
  /* "Calm" chứ không phải "Zen" hay "Still": nhãn này nằm cạnh light/dark
     trong cùng một vòng xoay, nên nó phải cùng loại chữ — một tính từ tả cảm
     giác của trang, không phải một cái tên riêng. */
  toCalm      : 'Switch to calm',
  older       : 'Older',
  newer       : 'Newer',

  /* ── trang danh sách ── */
  allPosts    : 'All posts',
  allTopics   : 'All topics',
  archive     : 'Archive',
  latest      : 'Latest',
  index       : 'Index',
  notes       : 'Notes',
  notesHint   : 'Mấy dòng nhặt dọc đường — sách, nhạc, và ý chưa thành bài',
  noNotes     : 'Chưa có ghi chú nào.',
  allNotes    : 'All',
  filter      : 'Filter',
  seeAll      : 'See all',
  profile     : 'Profile',
  perPage     : 'Per page',
  allItems    : 'All',
  pages       : 'Pages',
  prevPage    : 'Previous page',
  nextPage    : 'Next page',
  aboutMe     : 'About me',
  pinned      : 'Pinned',
  more        : 'More writing',
  noPosts     : 'Nothing here yet.',
  readOn      : 'Read on',
  browse      : 'Browse everything',
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
    /* Tiêu đề NGẮN cho màn đầu trang chủ. Ở đó mỗi bài chỉ có một dòng, tiêu
       đề 60 ký tự gãy làm ba dòng là hỏng cả bố cục. Không khai thì cắt tạm
       ở dấu phẩy đầu tiên — tiêu đề tiếng Việt hay có dạng "Vế chính, vế phụ",
       nên vế trước dấu phẩy gần như luôn là phần cốt lõi. */
    titleNgan  : String(fm.titleNgan || String(fm.title).split(/\s*[,—–]\s*/)[0]),
    /* `<title>` chỉ được phép đổi sang bản ngắn khi tác giả TỰ KHAI titleNgan.
       Bản suy ra tự động (cắt ở dấu phẩy) không đủ tin để đem đi làm tiêu đề
       trên Google: cắt máy móc có khi rụng đúng phần nói bài này về cái gì. */
    titleNganKhai: !!fm.titleNgan,
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
      if (!'ABC'.includes(k) || k.length !== 1) {
        canhBaoBai(`\`khung: ${fm.khung}\` không có — chỉ nhận A, B hoặc C. Dùng tạm A.`);
        return 'a';
      }
      return k.toLowerCase();
    })(),
    /* ── ẢNH CHO KHUNG C ──
       Mỗi dòng một tấm: `- <đường dẫn> | <chú thích>`. Chú thích không bắt buộc.
       Đường dẫn nhận cả ảnh trong `public/media/` lẫn địa chỉ ngoài — bài kỉ
       niệm hay có ảnh đã up sẵn ở chỗ khác, bắt tải về rồi bỏ vào repo chỉ để
       đăng một lần là phiền vô ích.

       KHÔNG lấy từ Markdown trong thân bài: băng ảnh cần biết TRƯỚC nó có bao
       nhiêu tấm để dựng hàng chấm và đặt tỉ lệ khung; đào ảnh ra từ HTML đã dựng
       là làm ngược. */
    anhBang    : (Array.isArray(fm.anh) ? fm.anh : []).map((x) => {
      const [src, ...chu] = String(x).split('|');
      return { src: src.trim(), alt: chu.join('|').trim() };
    }).filter((x) => x.src),
    html       : kq2.html,
    headings   : kq2.headings,
    tho        : kq2.tho,
    phut       : phutDoc(kq2.tho),
    /* Khoá và vân tay cho sổ mốc cập nhật — xem tools/lib/moc.mjs.
       Vân tay tính trên TIÊU ĐỀ + THÂN BÀI, không tính front matter: thêm một
       cái tag hay dán dòng `cover:` không phải là sửa bài. */
    khoaMoc    : path.relative(THU_MUC.content, file).replace(/\\/g, '/'),
    bamMoc     : vanTay(fm.title, than)
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
    /* `nen: dong` bật nền động (hoa rơi ở theme sáng, thiên hà ở theme tối).
       Mặc định `tinh` — nền động ở MỌI trang thì nó hết là điểm nhấn, và
       trang đọc bài cần yên để đọc. Xem docs/DESIGN-SYSTEM.md §12. */
    nen        : String(fm.nen || 'tinh').trim().toLowerCase(),
    /* `gioiThieu` nhận HAI dạng: một dòng như cũ, hoặc một danh sách gạch đầu
       dòng — mỗi gạch là một đoạn. Từ lúc ô trích dẫn rời khỏi khung bento, ô
       giới thiệu rộng trọn sáu cột, và một câu thì trông trống trải. */
    gioiThieu  : String(Array.isArray(fm.gioiThieu)
                   ? fm.gioiThieu.join(' ') : (fm.gioiThieu || '')),
    gioiThieuDoan: (Array.isArray(fm.gioiThieu) ? fm.gioiThieu : [fm.gioiThieu])
                   .map((x) => String(x || '').trim()).filter(Boolean),
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
                 scripts = '', headExtra = '', noindex = false, lang = CAU.lang, duong = '/',
                 epTheme = '' }) {
  return boChuThich(dienMau(MAU_SHELL, {
    lang,
    /* `data-base` để JS biết gốc trang khi deploy vào thư mục con (GitHub
       Pages kiểu /ten-repo/). search.js đọc nó để dựng đường dẫn tới
       search-index.json — gắn cứng '/' thì trang ở thư mục con tìm 404. */
    /* `data-ep` = theme MẶC ĐỊNH của riêng trang này, dùng khi người đọc chưa
       tự chọn gì. Đoạn script trong <head> đọc nó. KHÔNG đặt thẳng data-theme
       ở đây: làm vậy là đè lên lựa chọn của người đọc. */
    htmlAttr  : [BASE ? `data-base="${attr(BASE)}"` : '',
                 epTheme ? `data-ep="${attr(epTheme)}"` : '',
                 /* Bảng chữ cho mốc thời gian tương đối. Đặt trên <html> chứ
                    không đặt trên từng mốc: một trang danh sách có tới vài chục
                    mốc, lặp cùng một bảng chữ vài chục lần là thừa vài KB. */
                 `data-thoi="${attr(JSON.stringify(NHAN.thoi))}"`,
                 /* Địa chỉ hàm đếm lượt xem và chữ hiển thị, đặt trên <html> để
                    mọi trang dùng chung một chỗ khai. Tắt thì không in gì cả và
                    xem.js tự thoát ngay dòng đầu. */
                 (CAU.luotXem || {}).bat
                   ? `data-xem-api="${attr(BASE + ((CAU.luotXem || {}).api || '/api/xem'))}" ` +
                     `data-xem-nhan="${attr(JSON.stringify({ one: NHAN.view1, many: NHAN.views }))}"`
                   : ''
                ].filter(Boolean).join(' '),
    title     : escapeHtml(title),
    /* Logo kể chuyện ở CẢ hai trang có logo — trang chủ và trang giới thiệu.
       Trước đây chỉ trang chủ được kể; trang giới thiệu vẽ một lần rồi đứng
       yên, vì đó là trang nhiều chữ nhất và một hình động lặp ở thanh đầu
       trang là thứ mắt không bỏ qua được. Nay cả hai cùng kể — xem ghi chú
       "MỘT VÒNG DÀI HƠN" ở layout.css về cách bù lại chỗ đó. */
    logo      : logoHTML(duong === '/' || duong === '/about/'),
    /* LOGO CHỈ Ở TRANG CHỦ VÀ TRANG GIỚI THIỆU, và ở đó nó đứng MỘT MÌNH.
       Mọi trang khác chỉ có dòng chữ tên blog, không logo.

       Lý do: logo và tên viết đầy đủ nói CÙNG một điều. Đặt cạnh nhau thì
       thành lặp, và ở thanh đầu trang — nơi chỗ hẹp nhất — lặp là tốn chỗ của
       mục điều hướng. Hai trang kia là hai trang "giới thiệu mình", nên ở đó
       logo đứng một mình là đủ và đẹp hơn. */
    /* Trang chủ thêm `brand--dong`: chỉ ở đó logo mới tự kể lại câu chuyện dựng
       hình theo vòng lặp. Trang giới thiệu vẫn là logo, nhưng vẽ một lần rồi
       đứng yên — đó là trang nhiều chữ nhất, một hình động lặp mãi ở góc trên
       là thứ mắt không bỏ qua được. */
    lopBrand  : duong === '/'        ? ' brand--logo brand--dong'
              : duong === '/about/'  ? ' brand--logo brand--dong'
              :                        ' brand--chu',
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
    toCalm    : attr(NHAN.toCalm),
    nav       : navHTML(duong),
    napTimKiem: coTrang('/search/')
      ? `<a class="ico-btn tip" href="${BASE}/search/" aria-label="${NHAN.search}" data-tip="${NHAN.search}">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/>` +
        `<path d="M16.2 16.2 21 21"/></svg></a>` : '',
    /* Ghi chú đã thế chỗ Tags trên thanh đầu trang, nhưng trang tag vẫn còn và
       vẫn nên có đường vào — chân trang là chỗ của nó. Bỏ hẳn Tags khỏi cả hai
       nơi thì mấy chục trang tag thành trang mồ côi: Google vẫn giữ trong chỉ
       mục mà trên trang không còn đường nào bấm tới. */
    footLinks : [
        ['/feed.xml', 'RSS', true],
        ['/notes/', NHAN.notes, coTrang('/notes/')],
        ['/archive/', 'Archive', coTrang('/archive/')],
        ['/tags/', 'Tags', coTrang('/tags/')]
      ].map(([h, t, co]) => co ? `<a href="${BASE}${h}">${t}</a>`
                               : `<span class="nav-cho">${t}</span>`).join('\n      '),
    content,
    scripts: `<script src="${BASE}/assets/moc.js" defer></script>\n` +
             ((CAU.luotXem || {}).bat
               ? `<script src="${BASE}/assets/xem.js" defer></script>\n` : '') +
             scripts + doanTruocHTML() + beaconHTML(),
    headExtra,
    year      : new Date().getFullYear(),
    buildDate : BAN.ngay ? temNgay(BAN.ngay) : ngayTem(),
    version   : BAN.ten,
    soTay     : SO_TAY(),
  }));
}

/* ── ĐO LƯỢT XEM ──
   Cloudflare Web Analytics. Chọn nó thay vì Google Analytics vì ba lẽ:
   không đặt cookie (nên không phải dựng banner xin phép), không theo dấu người
   đọc sang trang khác, và nó đo luôn Core Web Vitals THẬT của người đọc chứ
   không phải điểm giả lập trên máy mình.

   Token nằm trong site.config.json chứ không phải biến môi trường, và đó là
   ĐÚNG: nó hiện nguyên văn trong HTML mọi trang, giấu đi cũng vô nghĩa. Đây là
   chỗ khác hẳn GEMINI_KEY — khoá ấy không bao giờ được rời khỏi Cloudflare.

   Đây là script NGOÀI DUY NHẤT của cả trang, và nó tắt sẵn: bật hay không là
   quyết định của chủ trang, không phải mặc định của bộ dựng. */
function beaconHTML() {
  const c = CAU.phanTich || {};
  if (!c.bat || !String(c.token || '').trim()) return '';
  return `\n<script defer src="https://static.cloudflareinsights.com/beacon.min.js"` +
         ` data-cf-beacon='{"token":"${attr(String(c.token).trim())}"}'></script>`;
}

/* ── ĐOÁN TRƯỚC TRANG KẾ ──
   Luật speculation rules: trình duyệt tải sẵn trang mà người đọc có vẻ sắp bấm.

   `prefetch` CHỨ KHÔNG `prerender`. prerender dựng hẳn trang trong nền, tức là
   CHẠY script của trang đó — kể cả beacon đếm lượt xem. Thành ra mỗi link người
   đọc rê chuột qua đều bị tính một lượt xem, và số liệu thành rác. prefetch chỉ
   tải file về nằm sẵn, không chạy gì.

   `eagerness: moderate` = đoán khi người đọc rê chuột vào link, không phải đoán
   mọi link trong tầm nhìn. Trên trang danh sách 12 bài thì `eager` nghĩa là tải
   12 trang cho một lượt đọc — tốn 4G của người ta để tiết kiệm 200ms của mình.

   Trình duyệt chưa hỗ trợ thì bỏ qua khối này, không lỗi gì. */
function doanTruocHTML() {
  if (CAU.doanTruoc === false) return '';
  return `\n<script type="speculationrules">` +
    JSON.stringify({ prefetch: [{ source: 'document',
      where: { and: [{ href_matches: `${BASE}/*` },
                     { not: { href_matches: `${BASE}/*.*` } }] },
      eagerness: 'moderate' }] }).replace(/<\//g, '<\\/') +
    `</script>`;
}
/* ── BĂNG ẢNH CHO KHUNG C ──
   Khung C là bài NGẮN có ảnh: vài tấm kỉ niệm bên trái, mấy dòng tản mạn bên
   phải. Kiểu bài này không hợp khung đọc dài — một bài bốn dòng mà bày ra giữa
   cột chữ 66 ký tự thì trông như bài bị cụt.

   ── BĂNG ẢNH LÀM BẰNG CUỘN-DÍNH, KHÔNG BẰNG JAVASCRIPT ──────────────────
   `scroll-snap-type` lo toàn bộ phần trượt: vuốt trên điện thoại, lăn chuột
   ngang trên laptop, kéo thanh cuộn, và cả phím mũi tên khi băng đang được chọn
   — tất cả đều là hành vi CÓ SẴN của trình duyệt, đã đúng với mọi thiết bị
   trợ năng. JavaScript chỉ thêm hàng chấm và hai nút, và nếu nó không chạy thì
   băng ảnh vẫn vuốt được. Thư viện carousel làm ngược lại: dựng lại toàn bộ cơ
   chế cuộn bằng JS, rồi phải tự vá lại từng thứ vừa phá.

   Mỗi tấm chiếm trọn bề ngang băng và dính mép trái khi dừng, nên không bao
   giờ có cảnh hai nửa tấm ảnh cạnh nhau. */
/* ── TỈ LỆ KHUNG BĂNG ẢNH ──
   Instagram và Facebook không cho ảnh tỉ lệ nào cũng được: khung hẹp nhất là
   4:5 (ảnh dọc, 1080×1350) và rộng nhất là 1.91:1 (ảnh ngang). Ngoài khoảng ấy
   thì chính hai nền tảng đó tự cắt bớt. Vuông 1:1 nằm giữa.

   Và cả một băng ảnh dùng CHUNG MỘT khung — khung lấy theo tấm ĐẦU TIÊN. Nếu
   mỗi tấm một khung thì cả khối cao thấp nhảy loạn mỗi lần trượt, chú thích và
   hàng chấm chạy theo, người đọc mất luôn điểm tựa của mắt.

   Làm đúng như vậy ở đây: đo tấm đầu, kẹp vào khoảng 4:5 … 1.91:1, rồi lấy con
   số ấy làm khung cho cả băng. Bài toàn ảnh dọc thì được khung dọc; bài ảnh
   ngang thì được khung ngang. Ảnh nào lệch khỏi khung vẫn vào TRỌN (`contain`,
   không cắt) — mình không phải Instagram, không có lý do gì cắt ảnh của người
   ta để cho vừa lưới. */
const BA_DOC  = 4 / 5;        /* dọc nhất: 1080×1350 */
const BA_NGANG = 1.91;        /* ngang nhất: 1080×566 */

function tiLeBang(ds) {
  const dau = ds[0];
  if (!dau || /^https?:/.test(dau.src)) return null;   /* ảnh ngoài: không đo được */
  const that = path.join(THU_MUC.public, dau.src.replace(/^\//, ''));
  const kt = fs.existsSync(that) ? kichThuocAnh(that) : null;
  if (!kt || !kt.h) return null;
  return Math.min(BA_NGANG, Math.max(BA_DOC, kt.w / kt.h));
}

function bangAnhHTML(bai) {
  const ds = bai.anhBang || [];
  if (bai.khung !== 'c' || !ds.length) return '';
  const tam = ds.map((x, i) => {
    const src = /^https?:/.test(x.src) ? x.src : BASE + x.src;
    return `<figure class="ba-tam" id="ba-${bai.slug}-${i + 1}">
      <img src="${attr(src)}" alt="${attr(x.alt)}" loading="${i ? 'lazy' : 'eager'}"
           decoding="async">
      ${x.alt ? `<figcaption>${escapeHtml(x.alt)}</figcaption>` : ''}
    </figure>`;
  }).join('');
  /* Đo không ra thì KHÔNG khai biến — CSS có sẵn giá trị lùi (4:5). Khai
     `--ba-ti:null` hay để trống là CSS nhận một giá trị hỏng và bỏ luôn cả luật,
     tệ hơn là không khai. */
  const ti = tiLeBang(ds);
  return `<div class="bang-anh" data-bang${ti ? ` style="--ba-ti:${ti.toFixed(4)}"` : ''}
    data-nhan="${attr(JSON.stringify({
    prev: NHAN.prevPage, next: NHAN.nextPage, of: '{n}/{m}'
  }))}">
    <div class="ba-cuon" tabindex="0" role="group" aria-roledescription="carousel"
         aria-label="${attr(bai.title)}">${tam}</div>
  </div>`;
}
/* ── LOGO ──
   Dựng theo đúng trình tự mà cái tên co lại:

     Zoey in Borderland
        ↓  thu gọn còn ba chữ đầu
     Z · i · B
        ↓  chữ Z XOAY NGANG
     ba nét của Z (vạch trên · chéo · vạch dưới) thành vạch TRÁI · chéo · vạch PHẢI
        ↓  chữ i xoay ngang, nối hai đầu còn lại
     ╳ giữa hai vạch đứng  =  VÔ CỰC THỨ NHẤT (nằm ngang)
        ↓  chữ B vặn thành vòng, úp lên theo phương kia
     ╳ giữa hai vạch ngang =  VÔ CỰC THỨ HAI (dựng đứng)

   Hai dấu vô cực DÙNG CHUNG hai đường chéo. Đó là chỗ hay của hình: cùng một
   dấu ╳, đọc theo chiều ngang thì hai vạch đứng khép nó lại thành một vô cực,
   đọc theo chiều dọc thì hai vạch ngang khép nó lại thành một vô cực nữa. Bốn
   vạch hợp thành khung vuông — đúng hình mẫu.

   Nét vẽ ra THEO THỨ TỰ ẤY: vô cực ngang trước (Z + i), vô cực đứng sau (B).
   Người xem thấy đúng câu chuyện dựng hình chứ không thấy một hình có sẵn.

   ── VÌ SAO KHÔNG PHẢI HÌNH VUÔNG GẠCH CHÉO ─────────────────────────────
   Bản đầu vẽ đúng như thế: khung vuông cộng hai đường chéo, hình học thì chuẩn
   (hai vạch đứng khép dấu ╳ thành vô cực ngang, hai vạch ngang khép nó thành vô
   cực đứng). Nhưng dựng ra rồi nhìn thì nó đọc thành **biểu tượng "ảnh lỗi"** —
   ô vuông gạch chéo là ký hiệu phổ biến nhất của "không có gì ở đây". Một logo
   không được phép trùng với ký hiệu của sự trống rỗng.

   Nên giữ nguyên CÂU CHUYỆN, đổi NÉT: chữ B vặn thành vòng thì hai vô cực thôi
   vẽ bằng nét thẳng mà vẽ bằng nét cong. Bốn cánh mọc ra từ một tâm — và bốn
   cánh ấy lại vọng đúng cánh hoa đang rơi ở nền trang. Không cố ý, nhưng giữ.

   MỖI VÔ CỰC LÀ MỘT ĐƯỜNG RIÊNG, không phải bốn cánh rời. Nhờ vậy nét vẽ ra kể
   đúng trình tự: một dấu vô cực trọn vẹn, rồi dấu thứ hai. */
/* ══════════════ LOGO ══════════════
   Dựng theo đúng trình tự mà cái tên co lại:

     Zoey in Borderland
        ↓  cả dòng bóp lại còn một điểm
     nét gấp khúc hình chữ Z
        ↓  xoay ngang
     một nét thẳng quét vào nối hai đầu          ← chữ i
        ↓  CONG DẦN RA
     VÔ CỰC THỨ NHẤT
        ↓  một vòng tròn khép lại rồi VẶN        ← chữ B
     VÔ CỰC THỨ HAI
        ↓
     bốn cánh — xoay một vòng rồi vỡ ra, và kể lại từ đầu

   ── VÌ SAO KHÔNG PHẢI HÌNH VUÔNG GẠCH CHÉO ─────────────────────────────
   Bản đầu vẽ đúng như hình mẫu: khung vuông cộng hai đường chéo, hình học thì
   chuẩn. Nhưng dựng ra rồi nhìn thì nó đọc thành **biểu tượng "ảnh lỗi"** — ô
   vuông gạch chéo là ký hiệu phổ biến nhất của "không có gì ở đây". Một logo
   không được phép trùng với ký hiệu của sự trống rỗng. Nên giữ nguyên CÂU
   CHUYỆN, đổi NÉT: chữ B vặn thành vòng thì hai vô cực thôi vẽ bằng nét thẳng
   mà vẽ bằng nét cong. Bốn cánh mọc ra từ một tâm — và bốn cánh ấy lại vọng
   đúng cánh hoa đang rơi ở nền trang. Không cố ý, nhưng giữ.

   ── BỐN HÌNH, MỘT CẤU TRÚC ĐƯỜNG ───────────────────────────────────────
   Cả bốn đường dưới đây đều là `M` rồi ĐÚNG BỐN `C`. Không phải trùng hợp:
   trình duyệt chỉ nội suy được giữa hai đường khi chúng có CÙNG chuỗi lệnh và
   cùng số điểm. Nhờ vậy nét gấp khúc chữ Z CONG DẦN ra thành vô cực, và vòng
   tròn VẶN dần thành vô cực thứ hai — hình này biến thành hình kia thật, chứ
   không phải hình này mờ đi rồi hình kia hiện lên.

   Hệ quả phải nhớ: sửa một đường thì phải giữ nguyên cấu trúc `M + 4C`. Thêm
   một khúc cong cho đẹp là phép biến hình gãy ngay, mà nó gãy im lặng — đường
   vẫn vẽ ra đúng, chỉ là thôi biến. */
const P_INF1 = 'M24 24C32 16 41 18 41 24C41 30 32 32 24 24C16 16 7 18 7 24C7 30 16 32 24 24';
const P_INF2 = 'M24 24C16 32 18 41 24 41C30 41 32 32 24 24C32 16 30 7 24 7C18 7 16 16 24 24';
/* Chữ Z vẽ bằng bốn khúc cong có điểm điều khiển nằm THẲNG HÀNG — tức là bốn
   đoạn thẳng đội lốt đường cong. Nhìn ra chữ Z, mà cấu trúc thì đã sẵn sàng để
   cong ra.

   Và nó nằm NGANG sẵn trong file. Lúc chặng chữ Z bắt đầu, cả nét được xoay
   -90° nên trên màn hình nó đứng thẳng; xoay về 0° chính là cú "Z xoay ngang".
   Làm ngược lại — vẽ Z đứng rồi xoay +90° — thì cái vô cực nó cong ra cũng bị
   xoay theo và thành vô cực DỰNG ĐỨNG, sai mất hình cuối. */
const P_ZZ   = 'M35 13C35 20 35 28 35 35C31 31 28 28 24 24C20 20 17 17 13 13C13 20 13 28 13 35';
/* ── CHỮ B ──
   Trước đây chặng này là một VÒNG TRÒN. Vòng tròn vặn ra vô cực thì đúng về
   hình học, nhưng nó đánh rơi mất con chữ: cái tên là *Borderland*, chữ B mới
   là thứ đang được kể lại, còn vòng tròn thì chẳng của riêng ai.

   Viết B bằng ĐÚNG MỘT nét, theo thứ tự tay người viết: từ giữa sống lưng
   xuống bụng dưới, ngược lên giữa, lên bụng trên, rồi về giữa. Sống lưng bị
   đi qua hai lần — đúng như khi viết tay, và hai lượt chồng khít nhau nên
   nhìn ra vẫn là một nét.

   ── VÌ SAO CÁC NÚT PHẢI XẾP ĐÚNG THỨ TỰ NÀY ──
   P_INF2 đi: tâm → đáy → tâm → đỉnh → tâm.
   Chữ B ở đây đi: tâm → đáy → tâm → đỉnh → tâm.
   Trùng khít từng nút một. Đó không phải tình cờ mà là điều kiện để phép biến
   hình đọc ra là BỤNG DƯỚI ĐANG XOAY: mỗi nút bò tới đúng nút tương ứng của
   nó, nên bụng dưới của chữ B là thứ vòng ra thành thuỳ dưới của vô cực. Xếp
   lệch thứ tự thì hai hình vẫn nội suy được, nhưng các nút bò chéo qua nhau và
   mắt chỉ đọc ra một mớ nét đang quẫy. */
const P_B    = 'M16 24C30 26 30 38 16 40C16 35 16 29 16 24C30 22 30 10 16 8C16 13 16 19 16 24';

/* ── NÉT NỐI — CHỮ i ──
   Nối ĐỈNH PHẢI của chữ Z (35,13) xuống ĐÁY TRÁI của nó (13,35). Đó đúng là
   hai ĐẦU TỰ DO của nét chữ Z, nên nối chúng lại là KHÉP hình lại.

   Và khép xong thì nó tự thắt nút: đường chéo sẵn có của chữ Z chạy
   (35,35)→(13,13), nét nối này chạy (35,13)→(13,35) — hai đường cắt nhau ngay
   giữa khung, ở đúng (24,24). Bốn cạnh, một chỗ cắt: một VÔ CỰC DẠNG ĐA GIÁC.
   Từ đó chỉ cần bo góc là ra vô cực nét cong.

   Bản trước để `M24 15V33`, một vạch dựng giữa khung — nó quét vào rồi xoay
   ngang, nhìn thì có động, nhưng nó không nối vào đâu cả: hai đầu chữ Z vẫn hở
   nguyên, và chặng sau chữ Z cong ra thành vô cực mà chẳng nhờ gì tới nó. Nét
   nối phải chạm vào đúng hai đầu ấy thì cả chuỗi mới đọc ra là NHÂN QUẢ.

   Không cần cấu trúc `M + 4C` vì nó không biến hình với ai — nó chỉ vẽ dần ra
   rồi tắt đi. */
const P_NOI  = 'M35 13L13 35';

/* ── PHÉP BIẾN HÌNH CHẠY BẰNG SMIL, KHÔNG PHẢI CSS ──────────────────────
   CSS có thuộc tính `d` và Chrome/Safari nội suy được nó, nhưng Firefox thì
   không — ở đó nét sẽ NHẢY từ chữ Z sang vô cực thay vì cong dần, mất đúng
   cái mình muốn. Thẻ <animate> của SVG chạy được ở cả ba, và nó là cơ chế
   sinh ra để làm việc này.

   Phần mờ/xoay vẫn để CSS lo. Hai hệ chạy song song nhưng cùng một vòng 20
   giây và cùng khởi động lúc trang mở, nên chúng không trôi lệch nhau.

   `keyTimes` là PHẦN CỦA VÒNG, không phải giây: 0.12 = 12% của 20s. Hai mốc
   đầu giữ nguyên hình cuối cho tới lúc bốn cánh vỡ xong, rồi mới nháy sang
   hình chữ — nháy lúc đang vô hình thì không ai thấy cú nháy ấy. */
/* 30 giây — PHẢI khớp với `--lg-ck` trong src/styles/layout.css. Thuộc tính
   `dur` của <animate> là attribute của SVG, không phải CSS, nên `var()` ở đây
   không nở ra gì cả; buộc phải ghi số. Hai chỗ ghi cùng một con số là đúng cái
   kiểu sớm muộn cũng lệch nhau, nên bộ kiểm định có một phép canh việc ấy. */
const LG_CK = '30s';

function bien(tu, den, t1, t2) {
  return `<animate attributeName="d" dur="${LG_CK}" repeatCount="indefinite"
      calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"
      keyTimes="0;.08;.12;${t1};${t2};1"
      values="${den};${den};${tu};${tu};${den};${den}"/>`;
}

function logoHTML(dong) {
  const net = (lop, d, smil) =>
    `<path class="lg-vc ${lop}" fill="none" stroke="currentColor" d="${d}">${smil}</path>`;

  /* ── MANDALA ──
     Hai vô cực đã có sẵn nằm vuông góc nhau (một ngang, một đứng) — tức là đã
     có bốn cánh. Thêm hai bản SAO của vô cực ngang, xoay 45° và 135°, là thành
     TÁM cánh: một bông đối xứng tám hướng, đúng cái khung mà mọi hình mandala
     dựng trên đó.

     Bản sao là nét TĨNH, không mang thẻ <animate> nào. Chúng chỉ hiện ở chặng
     mandala, mà chặng ấy nằm SAU khi hai vô cực đã thành hình xong — nên không
     có lúc nào chúng phải biến hình theo. Cho chúng <animate> nữa thì mỗi bông
     hoa có thêm hai nét âm thầm chạy chữ Z ở dưới lớp mờ, tốn việc vẽ mà không
     ai nhìn thấy.

     Hai vành tròn đồng tâm là thứ làm nó đọc ra là MANDALA chứ không phải một
     bông hoa tám cánh: mandala luôn có đường viền khép vòng ngoài và một tâm
     rõ ràng. Thiếu chúng thì tám cánh chỉ toả ra rồi hết, không có chỗ dừng. */
  const mandala = `<g class="lg-man" fill="none" stroke="currentColor">
      <path class="lg-canh" d="${P_INF1}" transform="rotate(45 24 24)"/>
      <path class="lg-canh" d="${P_INF1}" transform="rotate(135 24 24)"/>
      <circle class="lg-vanh" cx="24" cy="24" r="21.5"/>
      <circle class="lg-vanh" cx="24" cy="24" r="6"/>
    </g>`;

  /* ── BỤI ──
     Toạ độ TÍNH RA lúc dựng chứ không gõ tay: mười tám hạt rải đều theo góc,
     bán kính so le theo một chu kỳ không chia hết cho mười tám nên không hạt
     nào xếp thành hàng với hạt nào. Gõ tay mười tám cặp số thì kiểu gì cũng
     lọt ba bốn hạt thẳng hàng, và mắt bắt được ngay cái hàng ấy.

     Mỗi hạt mang sẵn hướng dạt, độ sâu rơi và độ trễ của riêng nó trong ba
     biến CSS. Nhờ vậy CẢ MƯỜI TÁM dùng chung đúng một @keyframes mà vẫn rơi
     mỗi hạt một kiểu — viết mười tám bộ keyframes thì cùng một hiệu ứng phải
     sửa mười tám chỗ. */
  const bui = `<g class="lg-bui" fill="currentColor"><circle cx="30.6" cy="26.4" r="0.9" style="--bx:-6px;--by:22px;--bt:0.0"/><circle cx="34.7" cy="33.0" r="2.0" style="--bx:5px;--by:35px;--bt:0.214"/><circle cx="28.0" cy="30.9" r="1.56" style="--bx:-1px;--by:29px;--bt:0.428"/><circle cx="26.6" cy="38.8" r="1.12" style="--bx:10px;--by:23px;--bt:0.092"/><circle cx="22.4" cy="32.9" r="2.22" style="--bx:4px;--by:36px;--bt:0.306"/><circle cx="16.0" cy="37.8" r="1.78" style="--bx:-2px;--by:30px;--bt:0.519"/><circle cx="16.3" cy="30.4" r="1.34" style="--bx:9px;--by:24px;--bt:0.183"/><circle cx="8.0" cy="29.8" r="0.9" style="--bx:3px;--by:37px;--bt:0.397"/><circle cx="13.0" cy="24.0" r="2.0" style="--bx:-3px;--by:31px;--bt:0.061"/><circle cx="7.1" cy="17.8" r="1.56" style="--bx:8px;--by:25px;--bt:0.275"/><circle cx="14.8" cy="16.3" r="1.12" style="--bx:2px;--by:38px;--bt:0.489"/><circle cx="14.5" cy="7.5" r="2.22" style="--bx:-4px;--by:32px;--bt:0.153"/><circle cx="21.8" cy="11.2" r="1.78" style="--bx:7px;--by:26px;--bt:0.367"/><circle cx="25.2" cy="17.1" r="1.34" style="--bx:1px;--by:39px;--bt:0.031"/><circle cx="31.0" cy="11.9" r="0.9" style="--bx:-5px;--by:33px;--bt:0.244"/><circle cx="30.1" cy="18.9" r="2.0" style="--bx:6px;--by:27px;--bt:0.458"/><circle cx="38.1" cy="18.9" r="1.56" style="--bx:0px;--by:40px;--bt:0.122"/><circle cx="33.0" cy="24.0" r="1.12" style="--bx:-6px;--by:34px;--bt:0.336"/></g>`;

  return `<svg class="logo${dong ? ' logo--dong' : ''}" viewBox="0 0 48 48"` +
    ` aria-hidden="true" focusable="false">` +
    (dong ? `<g class="lg-ke">
      <g class="lg-ten" fill="none" stroke="currentColor">
        <path d="M6 24H17"/><path d="M20 24H24"/><path d="M27 24H42"/>
      </g>
      <path class="lg-noi" fill="none" stroke="currentColor" d="${P_NOI}"/>
    </g>` : '') +
    `<g class="lg-hoa">` +
      (dong ? mandala : '') +
      net('lg-vc--1', P_INF1, dong ? bien(P_ZZ, P_INF1, '.38', '.44') : '') +
      net('lg-vc--2', P_INF2, dong ? bien(P_B, P_INF2, '.50', '.58') : '') +
    `</g>` +
    (dong ? bui : '') +
    `</svg>`;
}
function tocHTML(headings) {
  /* MỘT mục trở lên là dựng mục lục. Ngưỡng cũ là hai, và hậu quả không nằm ở
     cái mục lục: nó nằm ở BỐ CỤC. Lưới khổ rộng khai sẵn hai cột, nên bài không
     có mục lục vẫn bị giữ chỗ 210px cho một cột trống, và khung chữ nằm lệch
     hẳn về trái giữa một khoảng rộng vô chủ.

     Chữa bằng cách bỏ cột ở bài không mục lục thì được một trang bài rộng khác
     mọi trang bài còn lại — hai khung cho cùng một loại nội dung. Chữa bằng cách
     BÀI NÀO CŨNG CÓ MỤC LỤC thì chỉ còn một khung. Bộ kiểm định canh bài không
     có tiêu đề mục nào. */
  if (!headings.length) return '';
  const li = headings.map((h) =>
    `<li class="lvl-${h.cap}"><a href="#${h.id}">${escapeHtml(h.chu)}</a></li>`).join('');
  /* Mục lục và ô trích dẫn gói chung trong MỘT khối bên lề. Trước đây mục lục
     là con trực tiếp của lưới; muốn thêm ô trích dẫn xuống dưới nó thì phải khai
     thêm một ô lưới nữa, và hai khối dính-khi-cuộn riêng lẻ sẽ chồng lên nhau
     lúc cuộn. Gói lại thì chỉ một khối dính, và thứ tự bên trong tự đúng. */
  return `<aside class="ben">
    <details class="toc-box" open>
      <summary>${NHAN.contents}</summary>
      <nav class="toc" aria-label="${NHAN.onThisPage}">
        <div class="toc-title">${NHAN.onThisPage}</div>
        <ol>${li}</ol>
      </nav>
    </details>
    ${oQuote('quote-tab', { nhip: 2 })}
  </aside>`;
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
  /* Khung C KHÔNG in ảnh bìa vào thân bài: băng ảnh ĐÃ là phần hình của bài,
     thêm ảnh bìa nữa là hai khối ảnh chồng nhau ngay đầu trang. `cover` vẫn giữ
     nguyên công dụng còn lại của nó — ảnh trên thẻ bài và ảnh khi chia sẻ link. */
  if (bai.khung === 'c') return '';
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
      <span class="rn-meta">${ngayAnh(b.date)}</span>
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
    mocBlock    : mocHTML(bai),
    xemBlock    : xemHTML(bai),
    draftBadge  : bai.draft ? `<span class="badge badge--draft">${NHAN.draft}</span>` : '',

    cover       : coverHTML(bai),
    body        : bai.html,
    tagBlock    : tagBlockHTML(bai),
    readNext    : readNextHTML(bai, congKhai),
    binhLuan    : binhLuanHTML(bai),
    toc         : tocHTML(bai.headings),
    bangAnh     : bangAnhHTML(bai)
  });

  return trang({
    /* Google cắt tiêu đề ở khoảng 60 ký tự, và phần bị cắt là phần ĐUÔI —
       tức tên blog. Tiêu đề dài mà tác giả có khai bản ngắn thì dùng bản ngắn
       cho thẻ <title>; <h1> trên trang vẫn giữ nguyên tiêu đề đầy đủ. */
    title      : (bai.titleNganKhai &&
                  `${bai.title} · ${CAU.title}`.length > 65)
                   ? `${bai.titleNgan} · ${CAU.title}`
                   : `${bai.title} · ${CAU.title}`,
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
    scripts    : `<script src="${BASE}/assets/quote.js" defer></script>\n` +
                 (bai.khung === 'c'
                   ? `<script src="${BASE}/assets/bang-anh.js" defer></script>\n` : '') +
                 `<script src="${BASE}/assets/toc.js" defer></script>\n` +
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

function oQuote(nhan, { nhip = 0 } = {}) {
  /* Ô trích dẫn — dữ liệu nhúng sẵn dạng JSON, JS chỉ chọn theo ngày.
     Nhúng thẳng chứ không fetch: một file JSON riêng cho 12 câu thì tốn thêm
     một vòng mạng mà chẳng tiết kiệm được byte nào đáng kể. */
  if (!KHO_QUOTE.length) return '';
  const api = (CAU.quoteAI || {}).bat ? (CAU.quoteAI.api || '/api/quote') : '';
  /* `nhip` = cứ bấy nhiêu trang người đọc đi qua thì đổi câu một lần. Bỏ trống
     thì giữ nếp cũ: mỗi ngày một câu. Ô ở lề bài dùng nhịp 2 — đọc hết một bài
     rồi sang bài kế mà câu vẫn y nguyên thì nó thành một mảng trang trí chết;
     đổi mỗi lần tải trang thì lại thành nhấp nháy, và người đang đọc dở quay
     lại tab cũ sẽ thấy câu khác. Hai trang là chỗ ở giữa. */
  return `<div class="bo-quote card ${nhan}"${nhip ? ` data-nhip="${nhip}"` : ''}${api ? ` data-api="${attr(BASE + api)}"` : ''}
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
    ${t.gioiThieuDoan.map((d) => `<p class="bo-lead">${escapeHtml(d)}</p>`).join('')}
  </div>`);

  /* Ô trích dẫn từng nằm ở đây, chiếm hai cột bên phải hàng đầu. Chuyển ra màn
     đầu trang chủ: ở đó nó là thứ người đọc gặp đầu tiên mỗi ngày, còn ở trang
     giới thiệu nó chen giữa phần tự giới thiệu và mấy ô số — đúng chỗ người ta
     đang đọc về CHỦ TRANG thì lại chêm lời của người khác. Ô giới thiệu lấy
     luôn hai cột đó. */

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
  let than = t.khung === 'chuong'
    ? khungChuong(t, soBai, soTag)
    : khungBento(t, soBai, soTag);

  /* Nền động bọc NGOÀI nội dung, không chèn vào giữa: canvas phải phủ cả khối
     mà không đẩy chữ đi đâu cả. */
  if (t.nen === 'dong') {
    than = `<div class="nen-boc" data-nen>${than}</div>`;
  }

  return trang({
    title      : `${t.title} · ${CAU.title}`,
    ogTitle    : t.title,
    description: t.summary,
    canonical  : `${CAU.url}${t.url}`,
    ogType     : 'profile',
    lang       : t.lang,
    duong      : t.url.replace(BASE, ''),
    content    : dienMau(MAU_PAGE, { khung: t.khung, than }),
    scripts    : `<script src="${BASE}/assets/quote.js" defer></script>\n` +
                 `<script src="${BASE}/assets/reveal.js" defer></script>` +
                 (t.nen === 'dong' ? `\n<script src="${BASE}/assets/nen.js" defer></script>` : '') +
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
/* ── HÀNG META DÙNG CHUNG ──
   Ba chỗ cần nó: thẻ bài trong lưới, bài nổi bật ở trang chủ, và đầu trang bài.
   Trước đây ba chỗ gõ ba lần — đổi luật một chỗ là hai chỗ kia lệch ngay, và đã
   lệch thật (bài nổi bật từng thiếu nhãn bản nháp).

   ── VÌ SAO BỎ "phút đọc" ────────────────────────────────────────────────
   Nó là con số MÁY ĐOÁN: chia số chữ cho một tốc độ đọc giả định. Với văn xuôi
   tiếng Việt có cả thơ trích và danh sách thì nó sai đều. Lượt xem thì ngược
   lại — là con số THẬT, và nó trả lời đúng câu người đọc đang hỏi: "bài này có
   ai đọc không?"

   ── HAI MỐC THỜI GIAN ───────────────────────────────────────────────────
   Ngày ĐĂNG giữ nguyên vĩnh viễn (bài 2017 mãi là 2017). Mốc CẬP NHẬT chỉ hiện
   khi nó thật sự muộn hơn ngày đăng quá một ngày — sửa một lỗi chính tả vài giờ
   sau khi đăng thì không đáng gắn nhãn.

   HTML ghi sẵn ngày TUYỆT ĐỐI ("Updated 15 Sep 2026"); JavaScript đổi nó sang
   tương đối ("Updated 3 days ago"). Nướng sẵn chữ tương đối vào HTML là sai:
   trang tĩnh nằm trên CDN hàng tháng, và "15 phút trước" sẽ đứng đó mãi. */
function hangMeta(b) {
  const muc = b.muc && b.muc.length ? b.muc[b.muc.length - 1].ten : '';
  return `<div class="meta-row">
    <time datetime="${b.date}">${ngayAnh(b.date)}</time>
    ${mocHTML(b)}
    ${xemHTML(b)}
    ${muc ? `<span>${escapeHtml(muc)}</span>` : ''}
    ${b.draft ? `<span class="badge badge--draft">${NHAN.draft}</span>` : ''}
  </div>`;
}

function mocHTML(b) {
  if (!b.capNhat) return '';
  const cn = Date.parse(b.capNhat.length > 10 ? b.capNhat : b.capNhat + 'T00:00:00Z');
  const dg = Date.parse(b.date + 'T00:00:00Z');
  /* Ngưỡng 20 giờ: đủ để bỏ qua mấy lần sửa vặt ngay sau khi đăng, mà vẫn bắt
     được lần sửa của ngày hôm sau. */
  if (!(cn - dg > 20 * 3600 * 1000)) return '';
  return `<span class="moc" data-moc="${attr(new Date(cn).toISOString())}">` +
         `${NHAN.updated} ${ngayAnh(new Date(cn).toISOString().slice(0, 10))}</span>`;
}

/* Ô lượt xem để TRỐNG và `hidden` sẵn: con số do trình duyệt xin về sau. Nướng
   sẵn một con số vào HTML tĩnh thì nó đứng yên từ lúc dựng — mà lượt xem là thứ
   duy nhất trên trang này phải luôn mới. Chưa bật hoặc gọi hỏng thì ô ở nguyên
   trạng thái ẩn, hàng meta chỉ ngắn đi một mục. */
function xemHTML(b) {
  if (!(CAU.luotXem || {}).bat) return '';
  return `<span class="xem" data-xem="${attr(b.url)}" hidden></span>`;
}
function theBai(b, { hienMuc = true } = {}) {
  /* HAI tag trên thẻ, không phải ba. Ba cái thì ở bề ngang một cột lưới thường
     không đủ chỗ, và luật giữ cho thẻ cao bằng nhau sẽ cắt cái thứ ba làm đôi —
     một chữ bị cắt giữa chừng đọc ra là trang hỏng, tệ hơn hẳn so với việc
     thiếu mất một tag. */
  return `<article class="card the-bai">
    ${hangMeta(hienMuc ? b : { ...b, muc: [] })}
    <h3><a class="stretch" href="${b.url}">${noiChu(escapeHtml(b.title))}</a></h3>
    <p class="the-tom">${escapeHtml(tomTat(b.summary, 150))}</p>
    ${b.tags.length ? `<div class="tag-row">${b.tags.slice(0, 2).map((t) =>
      `<span class="tag tag--tinh">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
  </article>`;
}

/* Lưới thẻ. `min(300px,100%)` chứ không phải 300px trơn: thiếu `min()` thì ở
   khổ hẹp hơn 300px, cột vẫn giữ 300px và trang tràn ngang. */
/* ── BỌC MỘT DANH SÁCH VÀO KHUNG PHÂN TRANG ──
   Chỉ bọc khi danh sách DÀI HƠN một trang. Ngắn hơn mà vẫn bọc thì trang có
   thêm một lớp div và một ô chọn số bài chẳng để làm gì.

   Nhãn gửi qua attribute dạng JSON, cùng cách với khung bình luận và ô tìm
   kiếm: chữ hiển thị nằm trong bảng NHAN ở đầu file này, không gõ cứng vào
   file .js. Có phép kiểm canh khối JSON ấy parse được. */
function bocPhanTrang(than, chonItem, so) {
  const moiTrang = Math.max(1, Number(CAU.moiTrang) || 10);
  if (so <= moiTrang) return than;
  const nhan = JSON.stringify({
    perPage: NHAN.perPage, all: NHAN.allItems, pages: NHAN.pages,
    prevPage: NHAN.prevPage, nextPage: NHAN.nextPage
  });
  return `<div class="phan-trang" data-phan-trang="${attr(chonItem)}"` +
         ` data-moi-trang="${moiTrang}" data-nhan="${attr(nhan)}">${than}</div>`;
}
function luoiThe(ds, trong) {
  if (!ds.length) return `<p class="ds-trong">${trong}</p>`;
  const luoi = `<div class="ds-luoi">${ds.map((b) => theBai(b)).join('')}</div>`;
  return bocPhanTrang(luoi, '.the-bai', ds.length);
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
      : `<script src="${BASE}/assets/copy-guard.js" defer></script>`) +
      `\n<script src="${BASE}/assets/trang-so.js" defer></script>` + scripts,
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

/* ── ẢNH MÀN HERO (tuỳ chọn) ──
   Khai `heroAnh` trong site.config.json thì ảnh đè lên chữ khổng lồ, đúng kiểu
   nhân vật đè lên con số lớn trong mấy trang catalogue triển lãm. Không khai
   thì chữ lớn cộng nền động tự gánh — và đó vẫn là một màn hero hoàn chỉnh,
   không phải một chỗ trống chờ ảnh.

   Ảnh nền PNG/WebP có phần trong suốt thì đẹp nhất (ảnh cắt nền). Ảnh chữ nhật
   đặc cũng dùng được, chỉ là nó che mất chữ lớn nhiều hơn.

   `aria-hidden` + `alt=""`: đây là ĐỒ HOẠ trang trí. Nội dung thật của màn này
   là tên trang và ba dòng bài; ảnh chỉ tạo không khí. Bắt trình đọc màn hình
   đọc "ảnh trang trí" trước khi tới tiêu đề là làm phiền người ta. */
function heroAnhHTML() {
  const a = CAU.heroAnh;
  if (!a) return '';
  const ngoai = /^https?:/.test(a);
  if (!ngoai) {
    const that = path.join(THU_MUC.public, String(a).replace(/^\//, ''));
    if (!fs.existsSync(that)) {
      CANH_BAO.push(`site.config.json: heroAnh trỏ vào file không có — ${a}`);
      return '';
    }
  }
  return `<img class="hero-anh" src="${attr(ngoai ? a : BASE + a)}" alt=""` +
         ` aria-hidden="true" loading="eager" fetchpriority="high" decoding="async">`;
}

/* ── TRANG CHỦ ──

   HAI MÀN, MỘT TRANG.

     màn 1  hero cao trọn màn hình: tên trang + 1–3 bài mới nhất, mỗi bài đúng
            MỘT DÒNG tiêu đề ngắn. Nền động chạy sau lưng.
     màn 2  cuộn xuống (hoặc bấm mũi tên) thì ra đúng trang danh sách như cũ.

   ── VÌ SAO KHÔNG GIẤU MÀN 2 BẰNG `hidden` ────────────────────────────────
   "Bấm mới mở xuống" nghe như phải giấu phần dưới đi rồi bấm mới hiện. Làm vậy
   mất ba thứ cùng lúc:
     · Google đọc trang thấy một màn hero trống rỗng, không thấy bài nào
     · người tắt JavaScript không bao giờ mở được phần dưới
     · người dùng trình đọc màn hình mất luôn nội dung

   Cách ở đây: màn 2 LUÔN có trong HTML, chỉ nằm dưới màn 1. Hero cao 100vh nên
   cuộn xuống là gặp; nút mũi tên cuộn mượt xuống đó. Cảm giác "mở ra" giữ
   nguyên, mà không đánh đổi gì. */
function trangChu(bai) {
  /* Bài ghim lên trước, rồi tới mới nhất. `pinned: true` trong front matter. */
  const xep = [...bai].sort((a, b) =>
    (b.pinned - a.pinned) || (a.date < b.date ? 1 : -1));

  /* Màn đầu: TỐI ĐA BA bài. Bốn dòng trở lên là màn hero hết thoáng, mà thoáng
     mới là điểm của nó. */
  const dauTien = xep.slice(0, 3);
  const noiBat  = xep[0];
  /* TRANG CHỦ CHỈ GIỮ 6 BÀI ngoài bài nổi bật. Màn đầu là chỗ mời vào, không
     phải chỗ liệt kê kho bài: đổ hết bài ra đây thì cuộn mãi không hết mà vẫn
     không có cách nào lọc. Ai muốn xem nhiều hơn thì có trang Posts (xếp theo
     chuyên mục) và trang Archive (xếp theo năm) — hai lối đi ấy để sẵn ở dưới
     lưới. */
  const conLai  = xep.slice(1, 1 + Math.max(1, Number(CAU.baiTrangChu) || 6));

  /* ══════════ MÀN HERO ══════════
     Dựng theo khuôn tạp chí / catalogue triển lãm, không phải khuôn "header
     blog". Sáu thứ làm nên nó, và thiếu thứ nào là nó xẹp về một khối chữ:

       1. LƯỚI CÓ ĐƯỜNG KẺ NHÌN THẤY ĐƯỢC. Ba cột, kẻ hairline giữa các cột.
          Mắt đọc ra ngay là trang này có cấu trúc, không phải chữ thả trôi.
       2. MỘT CHỮ KHỔNG LỒ BỊ KHUNG CẮT. Chữ Z cỡ 40vw, mờ, nằm dưới mọi thứ,
          tràn ra ngoài mép. Đây là thứ cho trang chiều sâu mà không cần ảnh.
       3. BẤT ĐỐI XỨNG. Khối trái neo đáy, khối giữa neo giữa, khối phải neo
          đỉnh. Cả ba cùng canh giữa là lại ra một hàng ngay ngắn, vô vị.
       4. MỘT KHỐI ĐẬM NEO GÓC. Ô chỉ số bên trái là mảng đặc duy nhất giữa
          nhiều khoảng trắng — mắt có chỗ đậu.
       5. NHÃN NHỎ IN HOA Ở GÓC PANEL. Chữ 9px giãn rộng, đặt ở mép chứ không
          ở giữa. Đây là chi tiết khiến trang "đọc ra là đồ hoạ".
       6. DẤU + LÀM MỐC CĂN, như dấu chồng màu của nhà in.

     Căn theo MÉP KHUNG, không căn giữa một cột chữ. */
  /* KHỐI CHỮ LỚN TÁCH RA TỪ TIÊU ĐỀ, không gõ cứng "Zoey"/"in"/"Borderland":
     đổi tên blog trong cấu hình thì khối này phải đổi theo, không thì trang chủ
     mang một cái tên khác với mọi chỗ còn lại mà không ai báo. */
  const tuDe   = CAU.title.trim().split(/\s+/);
  const tuDau  = tuDe[0] || 'Z';
  const tuCuoi = tuDe.length > 1 ? tuDe[tuDe.length - 1] : '';
  /* Từ giữa ("in") nằm NGAY TRONG dòng một, không phải một dòng riêng: chỉ khi
     nó là chữ cùng dòng thì lúc co lại nó mới về đúng hàng với "Zoey". Ba khối
     đặt tuyệt đối tách rời thì CSS phải biết trước bề rộng chữ "Zoey" mới xếp
     được "in" ngay sau — mà bề rộng ấy đổi theo font và theo cỡ. */
  const tuGiua = tuDe.slice(1, -1).join(' ');

  const hero = `
<section class="hero" data-nen>
  ${heroAnhHTML()}

  <div class="hero-luoi">

    <div class="hero-cot hero-cot--trai">
      <a class="hero-hoso" href="${BASE}/about/">${escapeHtml(NHAN.profile)} →</a>
      ${oQuote('hero-quote')}
    </div>

    <h1 class="hero-danh" aria-label="${attr(CAU.title)}">
      <span class="hd-hang hd-hang--1" aria-hidden="true"><span class="hd-dau">${escapeHtml(tuDau[0])}</span><span class="hd-con">${escapeHtml(tuDau.slice(1))}</span>${tuGiua ? `<span class="hd-in">${escapeHtml(tuGiua)}</span>` : ''}</span>
      ${tuCuoi ? `<span class="hd-hang hd-hang--3" aria-hidden="true">${escapeHtml(tuCuoi)}</span>` : ''}
    </h1>

    <div class="hero-cot hero-cot--giua">
      <a class="hero-xuong" href="#doc-tiep">
        <span>${escapeHtml(NHAN.readOn)}</span>
        <i aria-hidden="true"></i>
      </a>
    </div>

    <div class="hero-cot hero-cot--phai">
      <p class="hero-nhan">${escapeHtml(NHAN.index)}</p>
      ${dauTien.length ? `<ol class="hero-ds">${dauTien.map((b, i) => `
        <li class="hero-dong">
          <a href="${b.url}">
            <span class="hero-so">${String(i + 1).padStart(2, '0')}</span>
            <span class="hero-tt">${noiChu(escapeHtml(b.titleNgan))}</span>
            <time class="hero-ngay" datetime="${b.date}">${ngayAnh(b.date).replace(/ \d{4}$/, '')}</time>
          </a>
        </li>`).join('')}</ol>` : ''}
      ${coTrang('/posts/') ? `<a class="hero-them" href="${BASE}/posts/">${NHAN.allPosts} →</a>` : ''}
    </div>
  </div>

  <!-- Mốc căn ở bốn góc, như dấu chồng màu của nhà in -->
  <i class="hero-moc hero-moc--tt" aria-hidden="true"></i>
  <i class="hero-moc hero-moc--tp" aria-hidden="true"></i>
  <i class="hero-moc hero-moc--dt" aria-hidden="true"></i>
  <span class="hero-tem" aria-hidden="true">${BAN.ten}</span>
</section>`;

  return trang({
    title: `${CAU.title} · ${CAU.tagline}`,
    description: CAU.description,
    canonical: `${CAU.url}${BASE}/`,
    duong: '/',
    /* Trang chủ LUÔN theme sáng — xem ghi chú `ep` trong hàm trang(). */
    epTheme: 'light',
    headExtra: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: CAU.title, description: CAU.description,
          url: `${CAU.url}${BASE}/`, inLanguage: CAU.lang,
          publisher: { '@type': 'Person', name: CAU.author } },
        { '@type': 'Person', name: CAU.author, url: `${CAU.url}${BASE}/` }
      ]
    })}</script>`,
    scripts: `<script src="${BASE}/assets/nen.js" defer></script>\n` +
      `<script src="${BASE}/assets/quote.js" defer></script>` +
      ((CAU.baoVeChu || {}).bat === false ? ''
        : `\n<script src="${BASE}/assets/copy-guard.js" defer></script>`),
    content: hero + `
<div class="container trang-chu" id="doc-tiep">
  ${noiBat ? `<section class="chu-nb">
    <p class="label label--muted">${noiBat.pinned ? NHAN.pinned : NHAN.latest}</p>
    <article class="card chu-the${noiBat.cover ? ' chu-the--anh' : ''}">
      ${noiBat.cover ? `<div class="chu-anh">
        <img src="${attr(/^https?:/.test(noiBat.cover) ? noiBat.cover : BASE + noiBat.cover)}"
             alt="${attr(noiBat.coverAlt)}" loading="lazy" decoding="async">
      </div>` : ''}
      <div class="chu-chu">
        ${hangMeta(noiBat)}
        <h2><a class="stretch" href="${noiBat.url}">${noiChu(escapeHtml(noiBat.title))}</a></h2>
        <p class="chu-tom">${escapeHtml(tomTat(noiBat.summary, 220))}</p>
        ${noiBat.tags.length ? `<div class="tag-row">${noiBat.tags.map((t) =>
          `<span class="tag tag--tinh">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      </div>
    </article>
  </section>` : ''}

  ${conLai.length ? `<section class="chu-ds">
    <div class="ds-thanh">
      <p class="label label--muted">${NHAN.more}</p>
      ${coTrang('/posts/') ? `<a class="ds-them" href="${BASE}/posts/">${NHAN.allPosts} →</a>` : ''}
    </div>
    ${luoiThe(conLai, '')}
    ${(coTrang('/posts/') || coTrang('/archive/')) ? `<div class="ds-chan">
      ${coTrang('/posts/') ? `<a class="ds-loi" href="${BASE}/posts/">${NHAN.allPosts} →</a>` : ''}
      ${coTrang('/archive/') ? `<a class="ds-loi" href="${BASE}/archive/">${NHAN.archive} →</a>` : ''}
    </div>` : ''}
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

  /* ── /posts/ LÀ THƯ MỤC CHUYÊN MỤC, KHÔNG PHẢI DANH SÁCH THEO NGÀY ──
     Bản trước đổ toàn bộ bài ra một lưới xếp theo ngày. Đo ra thì nó liệt kê
     ĐÚNG cùng tập bài với /archive/ — chỉ khác là có tóm tắt và tag. Hai trang
     cùng trả lời một câu hỏi thì một trong hai là thừa.

     Ba trang danh sách nay trả lời ba câu khác nhau:
       /posts/    blog này viết về NHỮNG GÌ   → xếp theo chuyên mục
       /archive/  viết vào LÚC NÀO            → xếp theo năm
       /tags/     những sợi chỉ nào xuyên qua → xếp theo tag

     Và nó còn co giãn được: 200 bài thì thư mục chuyên mục vẫn đọc trong một
     màn, còn lưới theo ngày thành một cuộn vô tận. */
  const mucCap1 = muc.filter((x) => !x.sau)
    .sort((a, b) => b.so - a.so || a.ten.localeCompare(b.ten, 'vi'));
  const MOI_MUC = 3;      /* mỗi mục khoe 3 bài mới nhất, còn lại vào trang mục */

  const thuMuc = mucCap1.map((x) => {
    const trong = theoNgay.filter((b) => b.muc.some((y) => y.url === x.url));
    const duong = x.url.replace(BASE, '');
    const moTa = tenMuc(duong.replace('/posts/', '').replace(/\/$/, '')).description || '';
    return `<section class="muc-khoi">
      <div class="muc-dau">
        <h2><a href="${x.url}">${escapeHtml(x.ten)}</a></h2>
        <span class="muc-so">${trong.length}</span>
        ${moTa ? `<p class="muc-mo">${escapeHtml(moTa)}</p>` : ''}
        ${trong.length > MOI_MUC
          ? `<a class="ds-them" href="${x.url}">${NHAN.seeAll} →</a>` : ''}
      </div>
      <div class="ds-luoi">${trong.slice(0, MOI_MUC).map((b) =>
        theBai(b, { hienMuc: false })).join('')}</div>
    </section>`;
  }).join('');

  ra.push({
    duong: '/posts/',
    html: trangDanhSach({
      tieuDe: NHAN.allPosts,
      dan: `${mucCap1.length} chuyên mục · ${theoNgay.length} bài`,
      chip: hangChip(chipDS, '/posts/'),
      than: theoNgay.length ? thuMuc : `<p class="ds-trong">${NHAN.noPosts}</p>`,
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
/* ── /notes/ — GHI CHÚ NGẮN ──
   Không phải bài viết. Bắt gặp một quyển sách, một bản nhạc, một ý thoáng qua
   thì mở `content/ghi-chu.md` gõ vài dòng — không tiêu đề, không ảnh bìa,
   không chuyên mục.

   ── VÌ SAO MỘT FILE CHỨ KHÔNG PHẢI MỖI GHI CHÚ MỘT FILE ────────────────
   Ma sát. Một ghi chú ba dòng mà phải tạo file, đặt tên, khai front matter thì
   lần sau người ta không ghi nữa. Một file mở sẵn, thêm một khối, xong.

   Khuôn khối: `## <ngày> · <loại>` rồi mấy dòng chữ. Loại muốn đặt gì cũng
   được, trang tự gom thành bộ lọc — không có bảng loại nào phải khai trước. */
function docGhiChu() {
  const f = path.join(THU_MUC.content, 'ghi-chu.md');
  if (!fs.existsSync(f)) return [];
  const raw = fs.readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const ra = [];
  for (const khoi of raw.split(/^##[ \t]+/m).slice(1)) {
    const dong = khoi.split('\n');
    const dau = (dong[0] || '').trim();
    /* Ngày là thứ DUY NHẤT bắt buộc. Thiếu thì bỏ qua khối — thà mất một ghi
       chú còn hơn xếp nó sai chỗ trong dòng thời gian mà không ai biết. */
    const m = dau.match(/^(\d{4}-\d{2}-\d{2})(?:\s*[·|-]\s*(.+))?$/);
    if (!m) continue;
    const than = dong.slice(1).join('\n').trim();
    if (!than) continue;
    ra.push({ ngay: m[1], loai: (m[2] || '').trim(),
              html: render(than, { publicDir: THU_MUC.public, base: BASE }).html });
  }
  return ra.sort((a, b) => (a.ngay < b.ngay ? 1 : -1));
}

function trangGhiChu() {
  const ds = docGhiChu();
  const loai = [...new Set(ds.map((x) => x.loai).filter(Boolean))];
  const than = ds.length ? `
    ${loai.length > 1 ? `<nav class="gc-loc" data-gc-loc aria-label="${NHAN.filter}">
      <button type="button" class="chip chip--nay" data-loai="">${NHAN.allNotes}</button>
      ${loai.map((x) => `<button type="button" class="chip" data-loai="${attr(x)}">` +
        `${escapeHtml(x)}<span class="chip-so">${ds.filter((y) => y.loai === x).length}</span>` +
        `</button>`).join('')}
    </nav>` : ''}
    <ol class="gc-ds">${ds.map((x) => `
      <li class="gc-mot" data-loai="${attr(x.loai)}">
        <div class="gc-dau">
          <time datetime="${x.ngay}">${ngayAnh(x.ngay)}</time>
          ${x.loai ? `<span class="gc-loai">${escapeHtml(x.loai)}</span>` : ''}
        </div>
        <div class="gc-chu prose">${x.html}</div>
      </li>`).join('')}</ol>` : `<p class="ds-trong">${NHAN.noNotes}</p>`;

  return trangDanhSach({
    tieuDe: NHAN.notes,
    dan: NHAN.notesHint,
    than,
    duong: '/notes/',
    description: `${NHAN.notesHint} — ${CAU.title}.`,
    scripts: `<script src="${BASE}/assets/ghi-chu.js" defer></script>`
  });
}
function trangArchive(bai) {
  const theoNam = new Map();
  for (const b of [...bai].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    const n = b.date.slice(0, 4);
    if (!theoNam.has(n)) theoNam.set(n, []);
    theoNam.get(n).push(b);
  }
  const than = [...theoNam.entries()].map(([nam, ds]) => `
    <section class="kho-nam" data-nhom>
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
    than: bai.length ? bocPhanTrang(than, '.kho-dong', bai.length)
                     : `<p class="ds-trong">${NHAN.noPosts}</p>`,
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

  /* ── MỐC CẬP NHẬT ──
     Đối chiếu vân tay nội dung với sổ `content/.moc.json` để biết bài nào thật
     sự đổi. Chạy trước khi dựng trang vì mọi khung meta đều cần con số này.
     Chế độ `--check-only` chỉ soi file nguồn, không được ghi gì. */
  const kqMoc = CHI_KIEM
    ? { moc: {}, doi: [] }
    : capNhatMoc(GOC, bai.map((b) => ({ khoa: b.khoaMoc, bam: b.bamMoc, ngay: b.date })));
  for (const b of bai) {
    /* Khai tay trong front matter thì THẮNG sổ: đó là lời của người viết, còn
       sổ chỉ là thứ máy suy ra. Năm bài nhập từ blog cũ dùng đúng đường này. */
    b.capNhat = b.updated || kqMoc.moc[b.khoaMoc] || b.date;
  }
  if (kqMoc.doi.length && CHI_TIET) {
    kqMoc.doi.forEach((k) => CHI_TIET && console.log(mau.mo(`    mốc mới: ${k}`)));
  }

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
                     'copy-guard.js', 'reveal.js', 'quote.js', 'so-tay.js', 'search.js',
                     'nen.js', 'trang-so.js', 'moc.js',
                     'bang-anh.js', 'xem.js', 'ghi-chu.js']) {
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
      { duong: '/notes/',   html: trangGhiChu() },
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
