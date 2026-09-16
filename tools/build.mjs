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

/* ── NÚM VẶN: ĐỌC TỪ site.config.json, KHÔNG GÕ THẲNG VÀO ĐÂY ──
   Mấy con số dưới đây từng nằm rải rác trong file này dưới dạng `slice(0, 2)`,
   `slice(0, 3)`, `slice(0, 30)`. Đọc mã thì thấy ngay, nhưng người VIẾT BLOG
   thì không có lý do gì phải mở một file hai nghìn dòng chỉ để đổi "đọc tiếp
   hai bài" thành ba bài — và mỗi lần đổi là một lần có thể sửa nhầm dòng.

   Nay chúng nằm trong khối `soLuong` của site.config.json. Thiếu khoá nào thì
   dùng số mặc định ghi ngay dưới đây, nên cấu hình cũ vẫn chạy y nguyên.

   `so()` chặn luôn mấy thứ lặng lẽ hỏng: chữ thay vì số, số âm, số lẻ. Một
   `"docTiep": "hai"` mà lọt qua thì slice(0, NaN) trả về mảng RỖNG — khối Đọc
   tiếp biến mất khỏi mọi bài mà không một dòng lỗi nào. */
function so(khoi, khoa, macDinh, itNhat = 0) {
  const v = ((CAU[khoi] || {})[khoa]);
  if (v === undefined || v === null || v === '') return macDinh;
  const n = Number(v);
  if (!Number.isInteger(n) || n < itNhat) {
    CANH_BAO.push(`site.config.json — ${khoi}.${khoa} = ${JSON.stringify(v)} không dùng được `
                + `(cần số nguyên ≥ ${itNhat}); tạm dùng ${macDinh}`);
    return macDinh;
  }
  return n;
}

/* Đọc MỘT LẦN lúc nạp file, không phải mỗi lần dùng. Bản trước để chúng là hàm
   và gọi lại ở mỗi bài — một giá trị gõ sai thì cùng một câu cảnh báo in ra chín
   lần, đúng bằng số bài. Cảnh báo lặp thì người ta thôi đọc cảnh báo. */
const SL = {
  docTiep      : so('soLuong', 'docTiep', 2, 0),
  tagMoiThe    : so('soLuong', 'tagMoiThe', 2, 0),
  heroTrangChu : so('soLuong', 'heroTrangChu', 3, 1),
  rss          : so('soLuong', 'rss', 30, 1),
  logoSoHat    : so('logo', 'soHat', 18, 0)
};

/* Thời lượng vòng kể của logo. Phải là một quãng thời gian CSS hợp lệ, vì nó
   vừa đi vào thuộc tính `dur` của thẻ <animate> vừa đi vào biến `--lg-ck`.
   Viết "27" thiếu chữ s thì CSS bỏ qua cả luật, còn SVG thì hiểu là 27 GIÂY —
   hai nửa hoạt hình chạy hai tốc độ khác nhau mà không ai báo gì. */
function logoVongKe() {
  const v = String((CAU.logo || {}).vongKe || '').trim();
  if (!v) return '27s';
  if (!/^\d+(\.\d+)?m?s$/.test(v)) {
    CANH_BAO.push(`site.config.json — logo.vongKe = ${JSON.stringify(v)} không phải quãng `
                + `thời gian CSS (ví dụ "27s" hoặc "800ms"); tạm dùng 27s`);
    return '27s';
  }
  return v;
}

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

/* SỔ TAY — cả bảng phiên bản kèm chi tiết, ghi ra dist/so-tay.json cho cửa
   hậu ở chân trang xin về khi mở (xem src/js/so-tay.js). Cùng một gốc với tem
   Vx.yy in ra ngay cạnh đó, nên hai thứ không bao giờ lệch nhau.

   ── VÌ SAO KHÔNG NHÚNG THẲNG VÀO TRANG NỮA ──
   Bản trước nhúng trọn sổ này vào MỌI trang dưới dạng <script type="applica\
   tion/json">. Đo lại thì thấy nó nặng 77 KB một trang, trong khi thân bài dài
   nhất chỉ 6 KB — bốn phần năm sức nặng của một trang bài là thứ chỉ hiện khi
   người ta bấm năm nhịp vào dòng chữ nhỏ ở chân trang. Nhân 47 trang thành 3,5
   MB lặp lại, hơn nửa cả bản dựng.

   Nay là một file riêng. Người đọc bình thường không bao giờ tải nó.

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
}, null, 0);

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
  index       : 'Index',
  notes       : 'Notes',
  notesHint   : 'Bits picked up along the way — books, music, thoughts not yet essays',
  noNotes     : 'No notes yet.',
  allNotes    : 'All',
  filter      : 'Filter',
  /* Ô viết ghi chú — chỉ chủ trang thấy, nên KHÔNG theo lệ tiếng Anh của phần
     khung. Lệ ấy có lý do là để phần khung không lẫn vào bài tiếng Việt; ô này
     thì chẳng ai ngoài chủ trang đọc, mà chủ trang thì đọc tiếng Việt nhanh
     hơn. Xem docs/CAI-DAT.md §6. */
  /* Năm nhãn gcKey* đã xoá cùng bản đưa khung đăng nhập về một chỗ: ô viết
     ghi chú không còn tự hỏi khoá. Nhãn của khung chung nằm ở nhóm kh* bên
     dưới. */
  gcWrite     : 'Write a note',
  gcDate      : 'Date',
  gcKind      : 'Kind',
  gcBody      : 'Note',
  gcBodyEmpty : 'Nothing written yet.',
  gcPost      : 'Post',
  gcPosting   : 'Sending…',
  gcPosted    : 'Done — the note is live.',
  gcPostFail  : 'Could not send. Check the key or your connection.',
  gcDel       : 'Delete note',
  gcDelFail   : 'Could not delete.',
  blUnapproveHint: 'Back to the queue, not deleted',
  blHideHint  : 'Hide from the page entirely',
  /* ── trang quản lý /z-admin/ ──
     Ba việc, ba ngăn, chỉ một ngăn hiện mỗi lúc. Nhãn để NGẮN vì chúng nằm
     trong một cột hẹp bên trái và phải đọc được bằng một cái liếc. */
  qlTitle     : 'Admin',
  /* Dòng dưới tiêu đề trang Admin để TRỐNG. Chỗ ấy nay là lời chào kiêm lối
     ra, và nó chỉ hiện sau khi đã vào được — xem `veChao` trong khoa.js.
     Câu cũ ("Ghi chú, bình luận và bài viết. Chỉ mình bạn thấy trang này.")
     tả lại đúng thứ người ta đang nhìn thấy, tức là không nói thêm gì. */
  qlDan       : '',
  khHello     : 'Haluuu, {ten}!',
  qlViet      : 'Write a note',
  qlDuyet     : 'Comments',
  qlMenu      : 'Pick a task',
  qlNote      : 'Note',
  qlComment   : 'Comment',
  qlPost      : 'Post',
  qlBai       : 'Write a post',
  /* ── ô viết bài ── */
  vbTitle     : 'Title',
  vbMuc       : 'Category',
  vbDate      : 'Date',
  vbTags      : 'Tags — separated by commas',
  vbSummary   : 'Summary',
  vbBody      : 'Post',
  vbWillBe    : 'Will live at',
  vbDraft     : 'Keep as draft — built but not public',
  vbPublish   : 'Publish',
  vbCrash     : 'The editor failed to load — open the browser console to see the error.',
  vbDraftAsk  : 'There is an unfinished post saved on this device. Open it?',

  /* ── BẢNG BÀI ĐÃ ĐĂNG (ngăn Post) ── */
  vbNewPost   : 'New post',
  vbAll       : 'All',
  vbEdit      : 'Edit',
  vbHide      : 'Hide',
  vbUnhide    : 'Unhide',
  vbBack      : 'Back',
  vbSave      : 'Save',
  vbSaved     : 'Saved. Cloudflare is rebuilding.',
  vbWorking   : '…',
  vbEmptyList : 'Nothing here.',
  /* {n} bài đang xem, {t} tổng số. Trần này có thật — mỗi bài là một lượt gọi
     ra GitHub, mà Workers giới hạn số lượt trong một request. */
  vbCapped    : 'Showing the {n} newest of {t} posts.',
  vbClash     : 'This post changed somewhere else. Go back and reopen it to get the latest version.',

  /* ── NHÃN CỦA KHUNG SOẠN THẢO (src/js/soan.js) ──
     Đi CHUNG bảng với ô viết bài chứ không tách bảng riêng: soan.js chỉ mọc
     bên trong ô ấy, và một bảng nhãn thứ tư trên cùng một trang là thêm một
     chỗ nữa để quên cập nhật. Tám dòng `szH*` là nội dung bảng chỉ dẫn hiện
     ra khi bấm nút `i` — mỗi dòng ĐÚNG MỘT việc, cố ý ngắn: đây là thứ người
     ta liếc lúc đang quên, không phải thứ ngồi đọc. */
  szToolbar   : 'Format',
  szBold      : 'Bold',
  szItalic    : 'Italic',
  szStrike    : 'Strikethrough',
  szCode      : 'Code',
  szH2        : 'Heading',
  szH3        : 'Subheading',
  szQuote     : 'Quote',
  szUl        : 'Bullet list',
  szOl        : 'Numbered list',
  szLink      : 'Link',
  szImg       : 'Image',
  szHr        : 'Divider',
  szMark      : 'Highlight',
  szColor     : 'Text colour',
  szNoColor   : 'Remove colour',
  szClear     : 'Clear formatting',
  szHelp      : 'How to use',
  szSeeMd     : 'See the Markdown',
  szEmpty     : '(nothing yet)',
  szLinkAsk   : 'Link:',
  szLinkText  : 'Text to show:',
  szImgAsk    : 'Image path (starts with /media/):',
  szImgAlt    : 'Describe the image (for people who cannot see it):',
  szH1t       : 'Select some text, then press a button — no syntax to remember.',
  szH2t       : 'Bold ⌘B · Italic ⌘I · Link ⌘K (Ctrl on Windows).',
  szH3t       : 'Colour: select → press the dot → pick one. Press again to remove.',
  szH4t       : 'New line inside the same paragraph: Shift + Enter.',
  szH5t       : 'Images: press the image button, paste a path like /media/2026/post-name/pic.png',
  szH6t       : 'Pasting from elsewhere: keeps bold/italic/links, drops fonts and sizes.',
  szH7t       : 'Drafts save to this device on their own; closing the tab is safe.',
  szH8t       : 'Press </> to see the exact Markdown that will go to GitHub.',
  vbNeedBoth  : 'Both a title and some text are needed.',
  vbSending   : 'Sending…',
  vbDone      : 'Pushed to the repository',
  vbBuilding  : 'Cloudflare is rebuilding. The post goes live in about a minute.',
  vbSeeCommit : 'See the commit on GitHub',
  vbAnother   : 'Write another',
  vbFailed    : 'Could not publish.',
  vbNoConfig  : 'The server is missing',
  vbSeeDoc    : 'xem docs/CAI-DAT.md',
  vbLoading   : 'Loading…',
  seeAll      : 'See all',
  profile     : 'Profile',
  perPage     : 'Per page',
  allItems    : 'All',
  pages       : 'Pages',
  prevPage    : 'Previous page',
  nextPage    : 'Next page',
  /* Năm nhãn của đời trang chủ cũ — latest · aboutMe · pinned · more · browse —
     đã bỏ cùng lượt dọn CSS chết: trang chủ nay chỉ còn màn đầu, không còn khối
     "bài mới nhất", "bài ghim" hay hàng lối đi ở chân danh sách. Một bảng nhãn
     giữ lại nhãn không ai gọi thì lần sau đọc nó không còn biết cái nào đang
     sống. */
  noPosts     : 'Nothing here yet.',
  readOn      : 'Read on',
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

  /* ── bình luận: bàn duyệt của chủ trang ──
     Tiếng Việt, khác lệ tiếng Anh của phần khung: chỉ chủ trang đọc mấy dòng
     này, mà chủ trang thì đọc tiếng Việt nhanh hơn. Cùng lý do với ô viết ghi
     chú. */
  queue       : 'Waiting for review',
  queueEmpty  : 'Nothing waiting.',
  loading     : 'Loading…',
  approve     : 'Approve',
  unapprove   : 'Unapprove',
  hide        : 'Hide',
  /* ── KHUNG ĐĂNG NHẬP DÙNG CHUNG (src/js/khoa.js) ──
     Một bộ nhãn cho MỘT khung. Trước đây mỗi ngăn tự xin khoá nên có ba bộ
     nhãn gần giống nhau (gcKey*, key*, và câu chờ của ô viết bài); ba bộ ấy
     rồi cũng trôi lệch chữ nghĩa với nhau. Nay chỉ còn bộ này. */
  khTitle     : 'Sign in',
  khLead      : 'Sign in once — it covers notes, comments and posts.',
  khSignIn    : 'Sign in',
  khSignOut   : 'Sign out',
  khChecking  : 'Checking…',
  khNeedBoth  : 'Fill in both fields.',
  khFailed    : 'The server did not accept this key.',
  khLocked    : 'Sign in above to unlock this.',

  keyId       : 'Owner ID',
  keySecret   : 'Key',
  badKey      : 'Wrong key.',
  sentOwner   : 'Posted — the owner’s words skip the queue.',

  /* ── bình luận: khung ── */
  comments    : 'Leave a note',
  blLike      : 'Like this post',
  blShare     : 'Share this post',
  shareCopied : 'Link copied',
  shareFail   : 'Could not copy — copy it from the address bar',
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
  notLinked   : 'Comments are not connected to a database yet — see docs/BINH-LUAN.md.',
  charsLeft   : '{n} characters left',

  /* ── sổ lịch sử phiên bản ── */
  history     : 'Version history',
  /* Chỉ đếm số bản dựng. Chỗ file nguồn là việc của người viết blog, không
     phải của người đọc — và người viết thì đã biết rồi. */
  builds      : '{n} builds',
  patches     : '{n} patches recorded in this build',
  noInfo      : 'no info',
  close       : 'Close',
  back        : 'Back'
};

/* ── SỬA MỘT VÀI CHỮ MÀ KHÔNG ĐỤNG VÀO BẢNG TRÊN ──
   Bảng NHAN ở trên là bản gốc, và nó nằm trong mã CÓ LÝ DO: mỗi nhãn đi kèm
   một dòng giải thích vì sao lại chọn chữ ấy, và mấy dòng đó không sống được
   trong một file JSON.

   Nhưng muốn đổi đúng một chữ — "Read next" thành "Đọc tiếp" chẳng hạn — thì
   không nên phải mở file hai nghìn dòng. Nên: khai `nhan` trong
   site.config.json, nó đè lên bảng trên. Chỉ khai chữ nào muốn đổi.

   Khoá lạ thì KÊU LÊN chứ không im lặng bỏ qua: gõ nhầm `"readnext"` thay vì
   `"readNext"` mà không ai báo thì người ta ngồi đổi mãi không thấy trang đổi
   theo, rồi kết luận là tính năng hỏng. */
for (const [k, v] of Object.entries(CAU.nhan || {})) {
  if (!(k in NHAN)) {
    CANH_BAO.push(`site.config.json — nhan.${k} không có trong bảng nhãn, bỏ qua `
                + `(gõ đúng hoa thường chưa? xem biến NHAN trong tools/build.mjs)`);
    continue;
  }
  if (typeof v !== 'string') {
    CANH_BAO.push(`site.config.json — nhan.${k} phải là một chuỗi chữ, bỏ qua`);
    continue;
  }
  /* Nhãn nào có {n} thì chỗ thay số nằm ở đó; bỏ mất {n} là con số biến mất
     khỏi câu mà câu vẫn đọc xuôi, nên không ai nhận ra. */
  if (NHAN[k].includes('{n}') && !v.includes('{n}')) {
    CANH_BAO.push(`site.config.json — nhan.${k} thiếu {n} (chỗ điền con số); `
                + `giữ nguyên chữ gốc "${NHAN[k]}"`);
    continue;
  }
  NHAN[k] = v;
}

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
   content/quote-nguon.md — mỗi gạch đầu dòng một câu, dạng "Nội dung — Người nói".

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
    /* ── `hidden: true` — CẤT BÀI ĐI, KHÔNG PHẢI XOÁ BÀI ──
       Khác `draft` ở chỗ quyết định: bài nháp VẪN dựng ra file để xem thử
       (chỉ không vào feed, sitemap, danh sách, và mang noindex). Bài ẩn thì
       KHÔNG dựng ra gì cả — đường dẫn cũ trả 404.

       Vì sao cần một trạng thái thứ ba: có bài viết xong, đăng rồi, rồi thấy
       không muốn để đó nữa — mà cũng không muốn mất. Xoá file là mất; để
       `draft: true` thì bài vẫn còn một trang sống ở đường dẫn cũ, ai có link
       vẫn mở được. `hidden` là chỗ ở giữa: file còn nguyên trong kho mã, chữ
       còn nguyên, nhưng trên mạng thì không còn gì.

       Bỏ cờ đi là bài trở lại y như cũ — kể cả đường dẫn, vì đường dẫn tính
       từ tên file chứ không từ một cái id nào. */
    an         : fm.hidden === true,
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
                 epTheme = '', shellAttr = '' }) {
  return boChuThich(dienMau(MAU_SHELL, {
    lang,
    /* `data-base` để JS biết gốc trang khi deploy vào thư mục con (GitHub
       Pages kiểu /ten-repo/). search.js đọc nó để dựng đường dẫn tới
       search-index.json — gắn cứng '/' thì trang ở thư mục con tìm 404. */
    /* `data-ep` = theme MẶC ĐỊNH của riêng trang này, dùng khi người đọc chưa
       tự chọn gì. Đoạn script trong <head> đọc nó. KHÔNG đặt thẳng data-theme
       ở đây: làm vậy là đè lên lựa chọn của người đọc. */
    /* Nền động bám vào ĐÂU. Mặc định rỗng — mỗi trang tự khai nếu cần. Trang
       chủ khai ở đây (chứ không trên riêng màn hero) để canvas phủ TRỌN trang,
       kể cả chân trang: xem ghi chú ở `trangChu`. */
    shellAttr,
    htmlAttr  : [BASE ? `data-base="${attr(BASE)}"` : '',
                 epTheme ? `data-ep="${attr(epTheme)}"` : '',
                 /* Bảng chữ cho mốc thời gian tương đối. Đặt trên <html> chứ
                    không đặt trên từng mốc: một trang danh sách có tới vài chục
                    mốc, lặp cùng một bảng chữ vài chục lần là thừa vài KB. */
                 `data-thoi="${attr(JSON.stringify(NHAN.thoi))}"`,
                 /* Địa chỉ sổ phiên bản. Chỉ là một đường dẫn ~20 byte thay cho
                    77 KB nhúng sẵn — xem chú thích ở SO_TAY bên trên. */
                 `data-so-tay-api="${attr(BASE + '/so-tay.json')}"`,
                 /* Địa chỉ hàm đếm lượt xem và chữ hiển thị, đặt trên <html> để
                    mọi trang dùng chung một chỗ khai. Tắt thì không in gì cả và
                    xem.js tự thoát ngay dòng đầu. */
                 (CAU.luotXem || {}).bat
                   ? `data-xem-api="${attr(BASE + ((CAU.luotXem || {}).api || '/api/xem'))}" ` +
                     `data-xem-nhan="${attr(JSON.stringify({ one: NHAN.view1, many: NHAN.views }))}"`
                   : '',
                 /* Ghi chú đăng thẳng. CHỈ in ở /notes/ — mọi trang khác không
                    có danh sách ghi chú nào để mà chèn vào, in ra là mời người
                    ta đi mò một đường API chẳng dùng được ở đó. */
                 /* ── BÀN DUYỆT MỌC ĐƯỢC Ở ĐÂU ──
                    ĐÚNG MỘT chỗ: ngăn Comment của /z-admin/.

                    Đời trước nó mọc được ở trang bài và /notes/ qua dấu thăng
                    `#duyet`. Bỏ rồi: hai cửa cho cùng một việc thì có ngày một
                    cửa được sửa còn cửa kia không, và khung xin khoá chèn giữa
                    một trang đang đọc là đúng hình dạng của một trò lừa. */
                 ((CAU.binhLuan || {}).bat !== false && duong === '/z-admin/')
                   ? `data-duyet-api="${attr(BASE + ((CAU.binhLuan || {}).api || '/api/binh-luan'))}" ` +
                     `data-duyet-nhan="${attr(JSON.stringify({
                        queue: NHAN.queue, queueEmpty: NHAN.queueEmpty,
                        loading: NHAN.loading, approve: NHAN.approve,
                        unapprove: NHAN.unapprove, hide: NHAN.hide,
                        /* Bốn nhãn của khung xin khoá (keyId, keySecret,
                           keySave, keyForget) đã rời khỏi đây: bàn duyệt không
                           còn tự hỏi khoá, nó mượn khung chung của khoa.js và
                           khung ấy đọc bảng data-khoa-nhan. Gửi kèm nhãn mà
                           không ai đọc thì lần sau có người sửa chữ ở đây rồi
                           ngồi tìm mãi không hiểu vì sao màn hình không đổi. */
                        badKey: NHAN.badKey, netErr: NHAN.netErr,
                        anon: NHAN.anon
                      }))}"`
                   : '',
                 /* ── NHÃN CỦA KHUNG ĐĂNG NHẬP ──
                    In ở MỌI trang có nạp khoa.js, và điều kiện phải là HỢP
                    của ba điều kiện dưới chứ không phải một trong số chúng:
                    thiếu bảng nhãn thì khung đăng nhập vẫn dựng ra được (nó
                    có chữ dự phòng viết cứng trong file) nhưng lại nói một
                    thứ tiếng khác với phần còn lại của trang. */
                 ((CAU.binhLuan || {}).bat !== false &&
                  (duong === '/notes/' || duong === '/z-admin/' ||
                   /^\/posts\/.+\//.test(duong))) ||
                 (duong === '/z-admin/') ||
                 (duong === '/notes/' && (CAU.ghiChu || {}).online)
                   ? `data-khoa-nhan="${attr(JSON.stringify({
                        title: NHAN.khTitle, lead: NHAN.khLead,
                        signIn: NHAN.khSignIn, signOut: NHAN.khSignOut,
                        hello: NHAN.khHello, checking: NHAN.khChecking,
                        needBoth: NHAN.khNeedBoth, failed: NHAN.khFailed,
                        locked: NHAN.khLocked,
                        keyId: NHAN.keyId, keySecret: NHAN.keySecret,
                        badKey: NHAN.badKey, netErr: NHAN.netErr
                      }))}"`
                   : '',
                 /* Ô viết BÀI chỉ có ở /z-admin/. Khác ghi chú và bàn duyệt —
                    hai thứ ấy còn mọc được ở /notes/ và trong trang bài — viết
                    bài là việc ngồi hẳn xuống làm, không phải việc tiện tay. */
                 (duong === '/z-admin/' && (CAU.dangBai || {}).bat !== false)
                   ? `data-bai-api="${attr(BASE + ((CAU.dangBai || {}).api || '/api/bai'))}" ` +
                     `data-bai-nhan="${attr(JSON.stringify({
                        title: NHAN.vbTitle, muc: NHAN.vbMuc, date: NHAN.vbDate,
                        tags: NHAN.vbTags, summary: NHAN.vbSummary, body: NHAN.vbBody,
                        willBe: NHAN.vbWillBe, draft: NHAN.vbDraft, publish: NHAN.vbPublish,
                        needBoth: NHAN.vbNeedBoth,
                        sending: NHAN.vbSending, done: NHAN.vbDone,
                        building: NHAN.vbBuilding, seeCommit: NHAN.vbSeeCommit,
                        another: NHAN.vbAnother, failed: NHAN.vbFailed,
                        noConfig: NHAN.vbNoConfig, seeDoc: NHAN.vbSeeDoc,
                        loading: NHAN.vbLoading, badKey: NHAN.badKey, netErr: NHAN.netErr,
                        newPost: NHAN.vbNewPost, all: NHAN.vbAll, edit: NHAN.vbEdit,
                        hide: NHAN.vbHide, unhide: NHAN.vbUnhide, back: NHAN.vbBack,
                        save: NHAN.vbSave, saved: NHAN.vbSaved, working: NHAN.vbWorking,
                        empty: NHAN.vbEmptyList, capped: NHAN.vbCapped, clash: NHAN.vbClash,
                        locked: NHAN.khLocked, draftAsk: NHAN.vbDraftAsk,
                        crash: NHAN.vbCrash,
                        toolbar: NHAN.szToolbar, bold: NHAN.szBold,
                        italic: NHAN.szItalic, strike: NHAN.szStrike,
                        code: NHAN.szCode, h2: NHAN.szH2, h3: NHAN.szH3,
                        quote: NHAN.szQuote, ul: NHAN.szUl, ol: NHAN.szOl,
                        link: NHAN.szLink, img: NHAN.szImg, hr: NHAN.szHr,
                        mark: NHAN.szMark, color: NHAN.szColor,
                        noColor: NHAN.szNoColor, clear: NHAN.szClear,
                        help: NHAN.szHelp, seeMd: NHAN.szSeeMd, empty: NHAN.szEmpty,
                        linkAsk: NHAN.szLinkAsk, linkText: NHAN.szLinkText,
                        imgAsk: NHAN.szImgAsk, imgAlt: NHAN.szImgAlt,
                        h1: NHAN.szH1t, h2t: NHAN.szH2t, h3t: NHAN.szH3t,
                        h4t: NHAN.szH4t, h5t: NHAN.szH5t, h6t: NHAN.szH6t,
                        h7t: NHAN.szH7t, h8t: NHAN.szH8t
                      }))}"`
                   : '',
                 ((duong === '/notes/' || duong === '/z-admin/') &&
                  (CAU.ghiChu || {}).online)
                   ? `data-gc-api="${attr(BASE + ((CAU.ghiChu || {}).api || '/api/ghi-chu'))}" ` +
                     `data-gc-nhan="${attr(JSON.stringify({
                        all: NHAN.allNotes,    write: NHAN.gcWrite,
                        /* Năm nhãn của khung xin khoá đã rời khỏi đây, cùng
                           lý do như bảng của bàn duyệt ở trên. */
                        date: NHAN.gcDate,     kind: NHAN.gcKind,
                        body: NHAN.gcBody,     bodyMissing: NHAN.gcBodyEmpty,
                        post: NHAN.gcPost,     posting: NHAN.gcPosting,
                        posted: NHAN.gcPosted, postFail: NHAN.gcPostFail,
                        del: NHAN.gcDel,       delFail: NHAN.gcDelFail
                      }))}"`
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
    /* ── TRANG TRONG: CHỮ LÀ CHÍNH, LOGO GHÉ QUA ──
       `brand--chu` vẫn là trạng thái NGHỈ — mở một trang bài ra thì thấy tên
       blog viết đủ, đúng như trước. `brand--doi` thêm lớp logo nằm chồng lên,
       mờ sẵn, và nó chỉ hiện khi người đọc rê chuột vào hoặc khi đồng hồ
       trong logo-nhip.js gạt qua sau mỗi 20 giây.

       Nét logo vốn ĐÃ nằm sẵn trong HTML của mọi trang (logoHTML() nhả ra bất
       kể trang nào), trước nay chỉ bị `display:none` giấu đi. Nên chỗ này
       không thêm một byte markup nào — chỉ thôi giấu nó. */
    lopBrand  : duong === '/'        ? ' brand--logo brand--dong'
              : duong === '/about/'  ? ' brand--logo brand--dong'
              :                        ' brand--chu brand--doi',
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
             /* Mọi trang: file này lo hai việc của logo — giữ hai đồng hồ cùng
                nhịp ở hai trang có logo động, và gạt qua lại giữa chữ với logo
                ở mọi trang còn lại. Nó tự thoát ngay khi trang không có việc
                nào trong hai việc ấy. */
             `<script src="${BASE}/assets/logo-nhip.js" defer></script>\n` +
             ((CAU.luotXem || {}).bat
               ? `<script src="${BASE}/assets/xem.js" defer></script>\n` : '') +
             scripts + doanTruocHTML() + beaconHTML(),
    headExtra,
    year      : new Date().getFullYear(),
    buildDate : BAN.ngay ? temNgay(BAN.ngay) : ngayTem(),
    version   : BAN.ten,

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

/* ── BẢN NHỌN CỦA HAI VÔ CỰC ──
   Cùng một hình, khác đúng bốn nút điều khiển — và khác ấy đổi hẳn chất của
   đoá hoa: đầu cánh từ TRÒN thành NHỌN.

   ── VÌ SAO KHÔNG PHẢI ĐỔI stroke-linejoin ──
   Đầu cánh của bản gốc tròn vì HÌNH HỌC, không vì nét vẽ: ở điểm (41,24) nút
   điều khiển vào là (41,18) và ra là (41,30) — cùng nằm trên một đường thẳng
   đứng, nên tiếp tuyến liên tục và đường cong đi qua đó trơn tru. Ở một chỗ
   trơn thì không có góc nào để `stroke-linejoin` bo hay không bo.

   Muốn có mũi nhọn thì phải làm cho hai tiếp tuyến GÃY nhau. Kéo hai nút ấy
   vào trong (41→38 ở bản ngang) là góc mở ra chừng 50°, và `stroke-linejoin:
   miter` biến nó thành một mũi nhọn thật.

   ── VÌ SAO GIỮ ĐÚNG CẤU TRÚC M + 4C ──
   Hai đường này nội suy vào chính bản tròn của chúng, nên chúng phải cùng
   chuỗi lệnh và cùng số nút — y như luật đã áp cho P_ZZ↔P_INF1. Bộ kiểm định
   canh cả bốn tên này (xem tools/kiem-dinh.mjs).

   Hình NGHỈ của logo là bản NHỌN — đó mới là đoá mandala người đọc nhận mặt.
   Bản tròn chỉ xuất hiện ở chặng hoa vừa nở, như một hình còn đang mềm, rồi
   đanh lại thành bản nhọn ngay trước lúc bắt đầu xoay. */
const P_NHON1 = 'M24 24C32 15 38 17 41 24C38 31 32 33 24 24C16 15 10 17 7 24C10 31 16 33 24 24';
const P_NHON2 = 'M24 24C15 32 17 38 24 41C31 38 33 32 24 24C33 16 31 10 24 7C17 10 15 16 24 24';

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
   mắt chỉ đọc ra một mớ nét đang quẫy.

   ── VÌ SAO SỐNG LƯNG Ở x=19 CHỨ KHÔNG PHẢI x=16 ──
   Chữ B chiếm bề ngang từ sống lưng tới chỗ bụng phình xa nhất. Với nút điều
   khiển ở x=33 thì chỗ phình rơi vào x≈29,5, nên cả chữ nằm trong quãng 19…29,5
   và tâm của nó là 24,25 — đúng tâm khung. Để sống lưng ở 16 như bản trước thì
   tâm chữ rơi vào 21,25, lệch trái gần ba đơn vị.

   Lệch ấy không chỉ xấu lúc đứng yên. Chặng sau, chữ B xoay 180° QUANH TÂM
   KHUNG: hình càng lệch tâm thì cú xoay càng thành một cú văng ngang, và cái
   đang kể — "bụng dưới vòng ra thành thuỳ dưới của vô cực" — bị cú văng ấy
   nuốt mất. Canh giữa rồi thì nó xoay tại chỗ. */
const P_B    = 'M19 24C33 26 33 38 19 40C19 35 19 29 19 24C33 22 33 10 19 8C19 13 19 19 19 24';

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
/* ── MỘT NGUỒN CHO CẢ HAI NỬA HOẠT HÌNH LOGO ──
   Logo chạy bằng hai cơ chế khác nhau: phần xoay/mờ do CSS lo (`--lg-ck` trong
   layout.css), phần biến hình do thẻ <animate> trong SVG lo (thuộc tính `dur`).
   `dur` là attribute của SVG chứ không phải CSS, nên `var(--lg-ck)` viết vào đó
   không nở ra gì cả — buộc phải là một con số thật.

   Bản trước vì thế ghi con số ấy ở HAI chỗ và nhờ bộ kiểm định canh cho khớp.
   Canh được, nhưng vẫn là hai chỗ phải sửa. Nay chỉ còn một: site.config.json →
   `logo.vongKe`. Con số đi vào `dur` ngay dưới đây, và gopCSS() ghi đè
   `--lg-ck` ở cuối bundle bằng đúng nó. layout.css giữ nguyên 27s làm mặc định
   để file ấy mở riêng ra vẫn chạy. */
const LG_CK = logoVongKe();

/* ── TÁM MỐC, KHÔNG CÒN SÁU ──
   Bản trước: nghỉ ở hình vô cực → nháy sang hình chữ → vẽ chữ → cong lại
   thành vô cực → giữ tới hết vòng.

   Nay thêm một nấc nữa ở cuối: vô cực TRÒN đanh lại thành vô cực NHỌN, rồi
   mới tới chặng xoay. Đó là cú "hình vừa nở còn mềm, giờ nó định hình xong"
   — và vì nó xảy ra lúc bông hoa đứng yên nên mắt bắt được; nhét vào giữa
   chặng xoay thì nó trôi mất trong chuyển động.

   Hình NGHỈ (mốc 0 và mốc 1) là bản NHỌN: đó là logo. Bản tròn chỉ sống trong
   quãng từ lúc hai vô cực dựng xong tới lúc đanh lại.

   `keySplines` phải có đúng số mốc trừ một — bảy dòng cho tám mốc. Thiếu một
   dòng thì Firefox bỏ qua cả thẻ <animate>, im lặng, và hình thôi biến. */
function bien(tu, tron, nhon, t1, t2, s1, s2) {
  /* ── ĐOẠN BO TRÒN ĐI THEO MỘT ĐƯỜNG CONG KHÁC ──
     Sáu đoạn kia dùng `.4 0 .2 1` — rời đi nhanh, hạ xuống chậm. Đúng cho
     mấy cú nháy hình, nhưng SAI cho cú bo tròn: ở đường ấy, mới đi được một
     nửa thời gian thì hình đã đổi xong tám phần mười, nên cái nơ vừa kịp khép
     là đã thành vô cực. Mắt không thấy nó ĐANG bo, chỉ thấy nó đã bo xong.

     Đoạn thứ tư (chữ → tròn) đổi sang đường đối xứng: nửa thời gian thì nửa
     đường. Cú bo trải đều ra, và đó chính là thứ đang muốn cho thấy. */
  const spl = [0, 1, 2, 3, 4, 5, 6]
    .map((i) => (i === 3 ? '.33 0 .67 1' : '.4 0 .2 1')).join(';');
  return `<animate attributeName="d" dur="${LG_CK}" repeatCount="indefinite"
      calcMode="spline" keySplines="${spl}"
      keyTimes="0;.085;.12;${t1};${t2};${s1};${s2};1"
      values="${nhon};${nhon};${tu};${tu};${tron};${tron};${nhon};${nhon}"/>`;
}

/* Hai cánh sao (bản sao xoay 45° và 135°) trước đây là nét TĨNH — chúng chỉ
   hiện ở chặng mandala, sau khi hai vô cực đã dựng xong, nên chẳng có gì để
   biến hình theo.

   Nấc "đanh lại" đổi điều đó: lúc ấy CẢ TÁM cánh phải cùng nhọn lên một lượt.
   Bốn cánh nhọn còn bốn cánh tròn thì bông hoa đọc ra là hỏng, không đọc ra
   là đang định hình. Nên chúng nhận một thẻ <animate> riêng — ngắn hơn hẳn
   bản trên, vì chúng không dự chặng kể chuyện bằng chữ.

   Mốc .05 → .20 nằm gọn trong quãng chúng vô hình (xem @keyframes lg-man),
   nên cú đổi từ nhọn về tròn ở đầu vòng không ai thấy. */
function bienCanh(tron, nhon, s1, s2) {
  const spl = new Array(5).fill('.4 0 .2 1').join(';');
  return `<animate attributeName="d" dur="${LG_CK}" repeatCount="indefinite"
      calcMode="spline" keySplines="${spl}"
      keyTimes="0;.08;.20;${s1};${s2};1"
      values="${nhon};${nhon};${tron};${tron};${nhon};${nhon}"/>`;
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

     Ba vành tròn đồng tâm là thứ làm nó đọc ra là MANDALA chứ không phải một
     bông hoa tám cánh: mandala luôn có đường viền khép vòng ngoài, một vành
     giữa và một tâm rõ ràng. Thiếu chúng thì tám cánh chỉ toả ra rồi hết,
     không có chỗ dừng.

     ── VÌ SAO MỖI LỚP MỘT THẺ <g> RIÊNG ──
     Vòng xoay phải đọc ra là BÁNH XE: mỗi lớp chạy một tốc độ, lớp ngoài vượt
     lên, lớp giữa tụt lại, lõi thì xoáy nhanh nhất. Muốn vậy thì mỗi lớp phải
     xoay được RIÊNG, mà phép xoay 45°/135° của hai cánh sao lại là `transform`
     viết thẳng trên thẻ <path> — CSS mà đặt `transform` lên chính thẻ ấy thì nó
     ĐÈ mất, không cộng vào. Bọc thêm một lớp <g> là chỗ để CSS xoay mà không
     đụng tới phép xoay nền của từng cánh.

     ── VÌ SAO VÀNH PHẢI ĐỨT NÉT ──
     Vành liền trơn xoay quanh tâm nó thì vẫn là chính nó: xoay bao nhiêu cũng
     không ai thấy. Đứt nét thì mỗi vạch là một cái nan hoa, và bánh xe mới có
     cái để quay. Bề rộng vạch khai ở layout.css. */
  const canhSao = (goc) =>
    `<path class="lg-canh" d="${P_NHON1}" transform="rotate(${goc} 24 24)">` +
    (dong ? bienCanh(P_INF1, P_NHON1, '.51', '.54') : '') + `</path>`;

  const mandala = `<g class="lg-man" fill="none" stroke="currentColor">
      <g class="lg-vanh-g lg-vanh-g--ngoai"><circle class="lg-vanh lg-vanh--ngoai" cx="24" cy="24" r="21.5"/></g>
      <g class="lg-vanh-g lg-vanh-g--giua"><circle class="lg-vanh lg-vanh--giua" cx="24" cy="24" r="13.5"/></g>
      <g class="lg-vanh-g lg-vanh-g--trong"><circle class="lg-vanh lg-vanh--trong" cx="24" cy="24" r="6"/></g>
      <g class="lg-canh-g">
        ${canhSao(45)}
        ${canhSao(135)}
      </g>
    </g>`;

  /* ── BỤI ──
     Mười tám hạt: rải đều theo GÓC, bán kính so le theo một chu kỳ không chia
     hết cho mười tám nên không hạt nào xếp thành hàng với hạt nào. Tính ra lúc
     dựng chứ không gõ tay — gõ tay mười tám cặp số thì kiểu gì cũng lọt ba bốn
     hạt thẳng hàng, và mắt bắt được ngay cái hàng ấy.

     ── BAY RA, KHÔNG RƠI XUỐNG ──
     Mỗi hạt đi theo ĐÚNG PHƯƠNG BÁN KÍNH của chỗ nó đang đứng, cộng một chút
     trôi LÊN. Bản trước cho cả mười tám hạt rơi thẳng xuống, và cái ấy đọc ra
     là mảnh vụn rụng chứ không phải bụi. Mandala cát bị xoá thì bụi toả ra từ
     tâm rồi trôi đi — hướng bay phải nói được rằng có một cú vỡ ở GIỮA.

     Mỗi hạt mang sẵn hướng bay, quãng bay và độ trễ của riêng nó trong ba biến
     CSS. Nhờ vậy CẢ MƯỜI TÁM dùng chung đúng một @keyframes mà vẫn bay mỗi hạt
     một kiểu — viết mười tám bộ keyframes thì cùng một hiệu ứng phải sửa mười
     tám chỗ.

     Ba con số 5, 7, 3 dưới đây đều nguyên tố cùng nhau với 18: nhờ vậy bán
     kính, cỡ hạt và quãng bay mỗi thứ chạy hết một vòng riêng của nó trước khi
     lặp lại, không có hai hạt nào trùng cả ba. */
  const SO_HAT = SL.logoSoHat;
  const bui = `<g class="lg-bui" fill="currentColor">` +
    Array.from({ length: SO_HAT }, (_, i) => {
      const goc = (i / SO_HAT) * Math.PI * 2;
      const r   = 8 + (i * 5) % 11;            /* chỗ đứng: 8…18 tính từ tâm */
      const co  = 0.7 + ((i * 7) % 5) * 0.32;  /* cỡ hạt: 0,70…1,98 */
      /* Quãng bay 11…17, cộng với chỗ đứng 8…18 là hạt dừng ở bán kính 19…35.
         Khung chỉ rộng 48 nên nửa khung là 24: hạt nào bay quá số ấy thì bị
         khung CẮT MẤT — svg mặc định không cho vẽ tràn ra ngoài viewBox. Quãng
         này canh để chúng chỉ ra tới rìa vào lúc đã mờ gần hết, nên cú cắt rơi
         vào chỗ không ai thấy. Bản trước bay 15…28 và bị cắt ngay giữa lúc còn
         rõ nét — đó là vì sao cú vỡ trông như bụi biến mất chứ không như bụi bay. */
      const xa  = 11 + ((i * 3) % 7) * 1.0;    /* quãng bay: 11…17 */
      const n   = (v) => v.toFixed(1);
      return `<circle cx="${n(24 + Math.cos(goc) * r)}" cy="${n(24 + Math.sin(goc) * r)}"`
        + ` r="${co.toFixed(2)}"`
        + ` style="--bx:${n(Math.cos(goc) * xa)}px`
        + `;--by:${n(Math.sin(goc) * xa - 5 - (i % 3) * 1.8)}px`
        + `;--bt:${(((i * 7) % SO_HAT) / SO_HAT).toFixed(3)}"/>`;
    }).join('') + `</g>`;

  return `<svg class="logo${dong ? ' logo--dong' : ''}" viewBox="0 0 48 48"` +
    ` aria-hidden="true" focusable="false">` +
    (dong ? `<g class="lg-ke">
      <g class="lg-ten" fill="none" stroke="currentColor">
        <path d="M6 24H17"/><path d="M20 24H24"/><path d="M27 24H42"/>
      </g>
      <path class="lg-noi" fill="none" stroke="currentColor" d="${P_NOI}"/>
    </g>` : '') +
    `<g class="lg-hoa">` +
      /* Mandala có mặt ở CẢ HAI bản, động và tĩnh. Trước đây nó chỉ được dựng
         khi logo kể chuyện, nên bản tĩnh chỉ còn hai vô cực — tức là hai bản
         logo khác nhau cho cùng một trang web. Hình ĐỦ của logo này là đoá
         mandala tám cánh; hai vô cực là một CHẶNG trên đường dựng ra nó, không
         phải cái đích. */
      mandala +
      /* Hai vô cực GỐC nằm chung một nhóm để cả cặp mờ/tỏ cùng nhau ở chặng
         nhấp nháy — bốn cánh gốc nhạt đi đúng lúc bốn cánh mandala đậm lên.
         Độ mờ của nhóm NHÂN với độ mờ của từng nét, nên lg-n1/lg-n2 vẫn giữ
         nguyên quyền tắt-bật nét của chúng ở các chặng kể chuyện. */
      `<g class="lg-goc">` +
        /* Bản TĨNH (trang giới thiệu) vẽ thẳng hình nghỉ — tức là bản NHỌN.
           Trước đây nó vẽ P_INF1/P_INF2, nên hai trang có logo bày ra hai đoá
           hoa hơi khác nhau mà không ai nói vì sao. */
        net('lg-vc--1', P_NHON1,
            dong ? bien(P_ZZ, P_INF1, P_NHON1, '.35', '.39', '.51', '.54') : '') +
        net('lg-vc--2', P_NHON2,
            dong ? bien(P_B,  P_INF2, P_NHON2, '.43', '.48', '.51', '.54') : '') +
      `</g>` +
    `</g>` +
    (dong ? bui : '') +
    `</svg>`;
}
function tocHTML(headings, docTiep, cum) {
  /* MỘT mục trở lên là dựng mục lục. Ngưỡng cũ là hai, và hậu quả không nằm ở
     cái mục lục: nó nằm ở BỐ CỤC. Lưới khổ rộng khai sẵn hai cột, nên bài không
     có mục lục vẫn bị giữ chỗ 210px cho một cột trống, và khung chữ nằm lệch
     hẳn về trái giữa một khoảng rộng vô chủ.

     Chữa bằng cách bỏ cột ở bài không mục lục thì được một trang bài rộng khác
     mọi trang bài còn lại — hai khung cho cùng một loại nội dung. Chữa bằng cách
     BÀI NÀO CŨNG CÓ MỤC LỤC thì chỉ còn một khung. Bộ kiểm định canh bài không
     có tiêu đề mục nào. */
  /* ── CỘT BÊN LUÔN CÓ MẶT, MỤC LỤC THÌ KHÔNG ──
     Bản trước trả về chuỗi rỗng khi bài không có tiêu đề mục nào, và mất theo
     nó là CẢ cột bên — kể cả ô trích dẫn vốn chẳng liên quan gì tới mục lục.
     Lưới vẫn giữ chỗ cho cột ấy, nên bài không mục lục hiện ra với một khoảng
     rộng trống hoác bên phải: đúng hai khung khác nhau cho cùng một loại nội
     dung, thứ mà cả phần chú thích này vốn dựng ra để tránh.

     Nay cột bên luôn có ô trích dẫn, còn mục lục chỉ thêm vào khi có mục. Mọi
     trang bài — bài mới dài có mục, bài cũ ngắn không mục — dùng đúng một
     khung. Bài rất ngắn không có mục nào là chuyện bình thường, không phải lỗi
     cần người viết bịa tiêu đề ra chữa. */
  const li = headings.map((h) =>
    `<li class="lvl-${h.cap}"><a href="#${h.id}">${escapeHtml(h.chu)}</a></li>`).join('');
  /* Mục lục và ô trích dẫn gói chung trong MỘT khối bên lề. Trước đây mục lục
     là con trực tiếp của lưới; muốn thêm ô trích dẫn xuống dưới nó thì phải khai
     thêm một ô lưới nữa, và hai khối dính-khi-cuộn riêng lẻ sẽ chồng lên nhau
     lúc cuộn. Gói lại thì chỉ một khối dính, và thứ tự bên trong tự đúng. */
  /* ── "ĐỌC TIẾP" LÊN CỘT BÊN, KHÔNG NẰM DƯỚI CHÂN BÀI ──
     Dưới chân bài nó đứng sau hàng tag và khung bình luận, tức là sau hai thứ
     đã kết thúc bài rồi — người đọc tới đó là đã đóng bài trong đầu, và một
     danh sách gợi ý ở đấy chỉ còn là chữ thừa.

     Cột bên thì khác: nó nằm ngang tầm thân bài và ĐI THEO suốt lúc cuộn, nên
     gợi ý có mặt đúng lúc người ta còn đang đọc và bắt đầu nghĩ "đọc gì
     tiếp". Cùng chừng ấy chữ, đặt vào chỗ nó có việc để làm.

     Khổ hẹp không có cột bên (`.ben` thành `display:contents`), nên khối này
     rơi vào dòng chảy — và `order` ở list.css đẩy nó xuống SAU chân bài, tức
     là đúng chỗ cũ. Không có khổ nào mất nó. */
  return `<aside class="ben">
    ${cum || ''}
    ${headings.length ? `<details class="toc-box" open>
      <summary>${NHAN.contents}</summary>
      <nav class="toc" aria-label="${NHAN.onThisPage}">
        <div class="toc-title">${NHAN.onThisPage}</div>
        <ol>${li}</ol>
      </nav>
    </details>` : ''}
    ${docTiep || ''}
  </aside>`;
}

/* ══════════ CỤM TƯƠNG TÁC: TIM · BÌNH LUẬN · CHIA SẺ ══════════

   ── VÌ SAO KHÔNG CÒN Ở CHÂN BÀI ──
   Chân bài là chỗ người đọc vừa đọc xong và đang đi tiếp. Đặt nút ở đó nghĩa
   là ai đổi ý lúc đang đọc dở phải cuộn ngược xuống tận cuối mới bấm được —
   và phần lớn thì không cuộn, họ chỉ đọc tiếp rồi đóng tab.

   Cột bên đi THEO suốt bài (nó dính khi cuộn), nên cụm nút có mặt đúng lúc
   người ta đang có cảm xúc về bài, chứ không phải lúc đã đóng bài trong đầu.

   ── BA NÚT, BA MỨC CÔNG SỨC ──
   Tim là mức rẻ nhất: một cú bấm, không phải nghĩ ra câu nào. Chia sẻ là mức
   giữa: không tốn chữ, nhưng đưa bài ra ngoài. Bình luận là mức đắt nhất.
   Xếp theo đúng thứ tự ấy từ trái sang phải — nút rẻ nhất nằm chỗ ngón tay
   chạm tới trước.

   ── SỐ ĐẾM ẨN KHI BẰNG KHÔNG ──
   "0 bình luận" là một con số nói rằng chưa ai nói gì — tức là một lời nhắc
   về sự vắng mặt, ngay cạnh cái nút mời người ta lên tiếng. Không có số thì
   icon chỉ còn nói "bấm vào đây để viết". Cùng một trạng thái, hai cách kể. */
function cumTuongTac(bai) {
  const c = CAU.binhLuan || {};
  if (c.bat === false) return '';
  return `<div class="cum-tt">
    <p class="cum-nhan">${escapeHtml(NHAN.comments)}</p>
    <div class="cum-nut">
      <button class="bl-nut bl-tim" type="button"
              data-thich="${attr(BASE + '/api/thich')}"
              aria-pressed="false" aria-label="${attr(NHAN.blLike)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-9.7a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9c0 5.1-7.5 9.7-7.5 9.7Z"/></svg>
      </button>
      <button class="bl-nut bl-chia" type="button"
              data-chia="${attr(CAU.url + bai.url)}"
              data-de="${attr(bai.title)}"
              data-nhan="${attr(JSON.stringify({ copied: NHAN.shareCopied, fail: NHAN.shareFail }))}"
              aria-label="${attr(NHAN.blShare)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 13.5 14.5 16m0-8L9.5 10.5M7 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm15-5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0 11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/></svg>
      </button>
      <button class="bl-nut bl-mo" type="button" aria-expanded="false" aria-controls="bl-than"
              aria-label="${attr(NHAN.comments)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12.6c0 3.6-3.8 6.5-8.5 6.5a10 10 0 0 1-2.6-.33L4.5 20.5l1.3-3.6a6.2 6.2 0 0 1-2.3-4.7c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5Z"/></svg>
      </button>
    </div>
    <p class="cum-bao" role="status" aria-live="polite"></p>
  </div>`;
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
/* HAI, không phải ba. Ba thẻ xếp vừa một hàng ở khổ rộng nhưng ở cột chữ 639px
   thì thẻ thứ ba rớt xuống hàng hai, để lại một hàng lẻ một thẻ — đọc ra là bố
   cục hỏng chứ không phải chủ ý. Và hết một bài dài thì hai gợi ý đã là nhiều:
   càng nhiều lựa chọn thì càng dễ không chọn cái nào. */
function goiY(bai, congKhai, soLuong = SL.docTiep) {
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
   /api/binh-luan (functions/api/binh-luan.js).

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
    charsLeft: NHAN.charsLeft,
    queue: NHAN.queue, queueEmpty: NHAN.queueEmpty, loading: NHAN.loading,
    approve: NHAN.approve, unapprove: NHAN.unapprove, hide: NHAN.hide,
    /* comments.js KHÔNG dựng khung xin khoá — nó chỉ đọc khoá đã lưu để bình
       luận của chủ trang vào thẳng, có huy hiệu. Bốn nhãn của khung ấy từng
       nằm ở đây và chưa từng được ai đọc. */
    badKey: NHAN.badKey, sentOwner: NHAN.sentOwner,
    unapproveHint: NHAN.blUnapproveHint, hideHint: NHAN.blHideHint
  }));

  /* `c.api` chứ không còn `c.url`. Địa chỉ nay là một đường dẫn NỘI BỘ
     (/api/binh-luan), không phải địa chỉ Google Apps Script — xem đầu file
     functions/api/binh-luan.js về lý do bỏ Apps Script. */
  return `<section class="binh-luan" data-binh-luan="${attr(BASE + (c.api || '/api/binh-luan'))}"
           data-trang="${attr(bai.url)}" data-nhan="${nhanJS}">
    ${/* Vạch kẻ có hạt kim cương ở giữa (`.eyebrow`) ĐÃ BỎ khỏi đây: khối "đọc
          tiếp" ngay trên đã có một vạch y hệt, và hai vạch giống nhau cách
          nhau 80px thì cái nào cũng thôi làm dấu mở đầu. */''}
    ${cumTuongTac(bai)}

    ${/* ── HÀNG NÚT ĐÃ RỜI KHỎI ĐÂY ──
          Tim, chia sẻ và bình luận nay nằm chung một cụm ở CỘT BÊN
          (cumTuongTac ở trên). Lý do đầy đủ ghi ở đó; tóm lại: cột bên đi theo
          suốt lúc cuộn, còn chân bài chỉ có mặt khi người đọc đã đọc xong.

          Còn lại ở đây đúng phần việc của khối này: danh sách lời nhắn và ô
          viết. Chúng vẫn đóng mặc định, và vẫn mở bằng chính cái nút ở cột
          bên — `aria-controls` trỏ tới #bl-than dù hai bên không còn chung
          một khối cha. */''}

    <div class="bl-than" id="bl-than" hidden>
    ${/* ── LỐI RA ──
          Khung này mở ra bằng một cú bấm ở cụm nút ngay trên. Nhưng khi nó đã
          mở, nhất là lúc đã chiếm cột bên ở khổ rộng, cái nút mở ấy có thể
          đang nằm ngoài tầm mắt — người đọc đổi ý giữa chừng thì không thấy
          đường nào lùi lại.

          Một nút "Back" ngay trong khung, ở góc trên: chỗ mắt tìm lối ra. Nó
          không làm gì mới — nó bấm hộ đúng cái nút đã mở khung. Một đường
          đóng, không phải hai. */''}
    <div class="bl-lui">
      <button type="button" class="vb-nho bl-dong">← ${escapeHtml(NHAN.vbBack)}</button>
    </div>
    ${/* Để `loiMoi` rỗng là BỎ HẲN dòng mời, không phải rơi về một câu mặc
          định — bản trước có `|| 'câu mặc định'` nên xoá chữ trong cấu hình
          xong vẫn thấy một dòng khác hiện lên, và không có cách nào tắt. */''}
    ${c.loiMoi ? `<p class="bl-moi">${escapeHtml(c.loiMoi)}</p>` : ''}

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

/* Cột bên chỉ GIỮ được khối đọc tiếp khi nó thật sự là một cột: khung A, và
   bài có ít nhất một tiêu đề mục (không có mục thì `.ben` rỗng và lưới bỏ cột
   ấy đi). Mọi trường hợp khác trả về false và khối rơi xuống chân bài. */
function benGiuDocTiep(bai) {
  return bai.khung === 'a' && bai.headings.length > 0;
}

/* `benLaCot()` đã bỏ: cụm nút nay lên đầu bài ở MỌI khung, nên không còn chỗ
   nào phải hỏi "khung này có cột bên thật không". Câu hỏi ấy vẫn còn sống ở
   src/js/comments.js — nơi quyết định có dời khung bình luận sang cột bên hay
   không — và ở đó nó hỏi thẳng DOM (`.khung-a` có mặt hay không) thay vì hỏi
   một hàm ở phía dựng trang. */

function readNextHTML(bai, congKhai) {
  const ds = goiY(bai, congKhai);
  if (!ds.length) return '';

  /* ── DÒNG ĐƠN, KHÔNG PHẢI THẺ ──
     Trước đây mỗi gợi ý là một tấm thẻ kính có nền và lề trong, xếp thành
     lưới. Hai tấm thẻ ấy to ngang một khối nội dung thật, nên cuối bài có hai
     mảng đặc tranh chỗ với chính bài vừa đọc xong — mà chúng chỉ chở đúng một
     tiêu đề và một ngày.
     Nay mỗi gợi ý là MỘT DÒNG: loại bên trái, tiêu đề ở giữa, ngày bên phải,
     ngăn nhau bằng một sợi kẻ. Cùng chừng ấy chữ, chiếm một phần tư chỗ. */
  const the = ds.map(({ bai: b, trung, moiHon }) => `
    <a class="rn-dong" href="${b.url}">
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
    xemBlock    : xemHTML(bai, true),
    draftBadge  : bai.draft ? `<span class="badge badge--draft">${NHAN.draft}</span>` : '',

    cover       : coverHTML(bai),
    body        : bai.html,
    tagBlock    : tagBlockHTML(bai),
    readNext    : benGiuDocTiep(bai) ? '' : readNextHTML(bai, congKhai),
    binhLuan    : binhLuanHTML(bai),
    /* ── "ĐỌC TIẾP" NẰM Ở ĐÂU: TUỲ KHUNG BÀI ──
       Khung A có cột bên thật (mục lục dính khi cuộn ≥1080px), nên khối đọc
       tiếp vào đó: nó đi theo suốt lúc đọc, có mặt đúng lúc người ta bắt đầu
       nghĩ "đọc gì tiếp".

       Khung B và C KHÔNG có cột bên — B là bìa tràn màn, C là băng ảnh dính
       bên trái. Nhét vào `.ben` ở hai khung ấy thì nó nằm chồng lên băng ảnh,
       đúng nghĩa đen. Nên ở đó nó về lại dòng chảy, ĐỨNG SAU khối bình luận:
       bấm mở khung bình luận là nó bị đẩy xuống, chứ không phải nó che mất
       chỗ vừa mở ra. */
    /* ── MỘT CHỖ ĐỨNG DUY NHẤT, MỌI KHUNG ──
       Bản trước cụm nút đi hai đường: khung A vào cột bên, khung B và C lên đầu
       bài. Cùng một thứ nằm hai chỗ tuỳ khung là người đọc phải đi tìm lại nó
       mỗi lần mở một bài khác kiểu — mà ba khung ấy chỉ khác nhau ở cách bày
       ẢNH, không khác nhau ở chuyện thả tim hay viết một dòng.

       Nay cụm luôn ở ngay dưới hàng meta, cùng chỗ với ba con số nó điều khiển.
       Cột bên giữ đúng việc của nó: mục lục, đọc tiếp, và — khi người đọc bấm
       bình luận ở khổ rộng — chính khung bình luận (xem comments.js). */
    toc         : tocHTML(bai.headings, benGiuDocTiep(bai) ? readNextHTML(bai, congKhai) : ''),
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
    /* quote.js đã rời trang bài cùng với ô trích dẫn: một câu trích của NGƯỜI
       KHÁC đặt cạnh bài của mình thì nó tranh chỗ với chính bài ấy. Ô trích
       dẫn ở lại đúng hai chỗ nó thuộc về — màn đầu trang chủ và trang giới
       thiệu, nơi chưa có bài nào để tranh. */
    scripts    : (bai.khung === 'c'
                   ? `<script src="${BASE}/assets/bang-anh.js" defer></script>\n` : '') +
                 `<script src="${BASE}/assets/toc.js" defer></script>\n` +
                 `<script src="${BASE}/assets/media.js" defer></script>` +
                 ((CAU.binhLuan || {}).bat === false ? ''
                   : `\n<script src="${BASE}/assets/chia-se.js" defer></script>`) +
                 ((CAU.binhLuan || {}).bat === false ? ''
                     /* khoa.js đứng TRƯỚC comments.js: cả hai mang `defer` nên
                        chúng chạy đúng thứ tự thẻ, và comments.js hỏi
                        window.ZIB.khoa để biết có gắn huy hiệu chủ trang cho
                        bình luận không.

                        duyet.js KHÔNG còn ở đây. Bàn duyệt nay chỉ sống trong
                        ngăn Comment của /z-admin/, nên trang bài thôi phải tải
                        một file mà chỉ một người trên đời dùng tới. */
                   : `\n<script src="${BASE}/assets/khoa.js" defer></script>` +
                     `\n<script src="${BASE}/assets/comments.js" defer></script>`) +
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

  /* `data-cua-ql` — bấm 5 nhịp vào tiêu đề là tới bàn làm việc của chủ trang.
     Chỉ gắn ở trang giới thiệu: đó là trang chủ trang hay mở nhất mà không
     phải trang bài, nên nó là chỗ tự nhiên để giấu một cái cửa. Cơ chế đếm
     nhịp nằm ở src/js/so-tay.js, chung với cửa vào sổ phiên bản. */
  o.push(`<div class="bo bo--intro card">
    <div class="eyebrow"><i></i></div>
    <h1${t.url === '/about/' ? ` data-cua-ql="${attr(BASE + '/z-admin/')}"` : ''}>${
      noiChu(escapeHtml(t.title))}</h1>
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
      <h1${t.url === '/about/' ? ` data-cua-ql="${attr(BASE + '/z-admin/')}"` : ''}>${
        noiChu(escapeHtml(t.title))}</h1>
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

  /* Ghi đè CUỐI bundle: cùng độ ưu tiên thì luật sau thắng, nên con số trong
     site.config.json luôn thắng con số mặc định viết trong layout.css. */
  return boChuThichCSS(gop) + `\n.logo--dong{--lg-ck:${LG_CK}}\n`;
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

/* ── CẮT CHÚ THÍCH JS KHI GỬI RA ──
   Cùng lý do với boChuThichCSS ở trên, nhưng JS khó hơn CSS một bậc: dấu `/`
   trong JS vừa là phép chia, vừa mở chú thích, vừa mở một mẫu tìm kiếm. Cắt
   bằng một phép thay chuỗi là hỏng — trong src/js/ có sẵn ba thứ dính bẫy:

       s.replace(/[.?!]\s+/g, '\n')   mẫu regex có dấu chấm hỏi, dấu sao
       'http://…'                          hai gạch chéo nằm trong chuỗi
       `dấu nháy ngược nằm trong chú thích`

   Nên phải đọc từng ký tự và biết mình đang đứng trong chuỗi, trong regex hay
   trong chú thích. Đoạn dưới đúng là một bộ đọc token thu nhỏ, chỉ đủ để phân
   biệt bốn thứ ấy — không phải một bộ phân tích cú pháp.

   Phân biệt regex với phép chia bằng KÝ TỰ CÓ NGHĨA ĐỨNG NGAY TRƯỚC, đúng luật
   của chính JavaScript: sau một giá trị (tên biến, số, `)`, `]`) thì `/` là
   phép chia; sau một toán tử hay một từ khoá thì `/` mở regex.

   Sai một chỗ là cả file hỏng, nên bên gọi còn thử dịch lại bản đã cắt trước
   khi ghi ra — hỏng thì giữ nguyên bản gốc và kêu lên. */
const TU_KHOA_TRUOC_REGEX = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'case', 'do', 'else', 'yield', 'await', 'throw'
]);

function boChuThichJS(ma) {
  let ra = '';
  let i = 0;
  const n = ma.length;
  /* `truoc` giữ ký tự có nghĩa gần nhất, `tu` giữ chữ cuối nếu đó là một chữ. */
  let truoc = '';
  let tu = '';

  const laChu = (c) => /[A-Za-z0-9_$]/.test(c);

  function moRegex() {
    if (truoc === '') return true;                       /* đầu file */
    if (laChu(truoc)) return TU_KHOA_TRUOC_REGEX.has(tu); /* tên biến ⇒ chia */
    return !(truoc === ')' || truoc === ']' || truoc === '}');
  }

  while (i < n) {
    const c = ma[i];

    /* ── chú thích một dòng ── */
    if (c === '/' && ma[i + 1] === '/') {
      while (i < n && ma[i] !== '\n') i++;
      continue;                       /* để nguyên '\n' cho vòng sau chép */
    }

    /* ── chú thích nhiều dòng ── */
    if (c === '/' && ma[i + 1] === '*') {
      const het = ma.indexOf('*/', i + 2);
      const den = het < 0 ? n : het + 2;
      /* Chú thích trải nhiều dòng thì để lại một dòng trống, giữ cho số dòng
         không co rút quá đà — soi bằng DevTools còn lần được. */
      if (ma.slice(i, den).includes('\n')) ra += '\n';
      i = den;
      continue;
    }

    /* ── chuỗi ── */
    if (c === '"' || c === "'" || c === '`') {
      const dong = c;
      ra += c; i++;
      while (i < n) {
        const d = ma[i];
        if (d === '\\') { ra += ma.slice(i, i + 2); i += 2; continue; }
        ra += d; i++;
        if (d === dong) break;
        /* `${…}` trong chuỗi nháy ngược: chép nguyên tới ngoặc đóng khớp cặp,
           không cắt gì bên trong. Dự án này chưa có chú thích nằm trong `${}`,
           mà có thì cắt đi cũng chẳng lợi được mấy byte. */
        if (dong === '`' && d === '$' && ma[i] === '{') {
          let muc = 0;
          while (i < n) {
            const e = ma[i];
            if (e === '{') muc++;
            else if (e === '}') { muc--; ra += e; i++; if (!muc) break; continue; }
            ra += e; i++;
          }
        }
      }
      truoc = dong; tu = '';
      continue;
    }

    /* ── regex ── */
    if (c === '/' && moRegex()) {
      ra += c; i++;
      let trongNgoac = false;
      while (i < n) {
        const d = ma[i];
        if (d === '\\') { ra += ma.slice(i, i + 2); i += 2; continue; }
        if (d === '[') trongNgoac = true;
        else if (d === ']') trongNgoac = false;
        else if (d === '/' && !trongNgoac) { ra += d; i++; break; }
        else if (d === '\n') break;     /* không phải regex thật — thoát cho lành */
        ra += d; i++;
      }
      while (i < n && /[gimsuyd]/.test(ma[i])) { ra += ma[i]; i++; }
      truoc = '/'; tu = '';
      continue;
    }

    ra += c; i++;
    if (!/\s/.test(c)) {
      truoc = c;
      tu = laChu(c) ? tu + c : '';
    }
  }

  return ra
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
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
/* ── HAI CON SỐ CỦA MỘT BÀI, CẠNH NHAU, MỖI CÁI MỘT KÝ HIỆU ──
   Lượt xem là "bao nhiêu người đi qua"; lượt thích là "bao nhiêu người dừng
   lại". Chúng trả lời hai câu khác nhau nên đứng cạnh nhau thì đọc được cả
   hai, mà tách hai đầu trang thì không ai so được.

   Ký hiệu chứ không phải chữ: hàng meta này đã có ngày đăng và mốc cập nhật:
   thêm hai cụm "3 views · 12 likes" nữa là một dòng bốn mẩu chữ. Con mắt và
   trái tim nói đúng chừng ấy nghĩa trong một phần tư chỗ.

   Ô thích để RỖNG và `hidden` lúc dựng: con số do src/js/comments.js đổ vào
   sau khi hỏi máy chủ, cùng lượt hỏi mà nút tim cuối bài vẫn phải gọi. Chưa
   gắn D1 thì nó ở nguyên trạng thái ẩn, và hàng meta chỉ ngắn đi một mục. */
function xemHTML(b, day) {
  const mat = `<svg class="i-nho" viewBox="0 0 24 24" aria-hidden="true"><path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>`;
  const tim = `<span class="thich" data-thich-so hidden><svg class="i-nho" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-9.7a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9c0 5.1-7.5 9.7-7.5 9.7Z"/></svg><span class="thich-so"></span></span>`;
  /* ── BA CON SỐ, MỘT KHUÔN ──
     Lượt xem · lượt thích · số bình luận. Trước bản này chúng ở ba nơi và ba
     dạng: lượt xem và lượt thích ở hàng meta đầu bài, còn số bình luận thì in
     ngay trên cái NÚT bình luận — nên hai cái đầu là chữ để đọc, cái thứ ba là
     một phần của nút bấm, và không cái nào so được với cái nào.

     Nay cả ba ở cùng một hàng, cùng cỡ chữ, cùng kiểu "icon + số". Và nút bấm
     thôi mang số: nút là chỗ BẤM, hàng meta là chỗ ĐỌC. Một con số xuất hiện
     đúng một lần thì không có chỗ nào để hai bản trôi lệch nhau. */
  const bl = (CAU.binhLuan || {}).bat === false ? '' :
    `<span class="thich" data-bl-so hidden><svg class="i-nho" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12.6c0 3.6-3.8 6.5-8.5 6.5a10 10 0 0 1-2.6-.33L4.5 20.5l1.3-3.6a6.2 6.2 0 0 1-2.3-4.7c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5Z"/></svg><span class="bl-so-chu"></span></span>`;
  /* ── THẺ BÀI CHỈ CÓ LƯỢT XEM ──
     Ô lượt thích và ô số bình luận do comments.js đổ số vào, mà file ấy chỉ
     chạy trên TRANG BÀI. Trên một trang danh sách chúng nằm đó rỗng và `hidden`
     vĩnh viễn — mỗi thẻ hai khối markup không bao giờ hiện, nhân với số bài
     trên trang. Lượt xem thì khác: xem.js chạy ở mọi trang và đổ số cho từng
     thẻ, nên nó ở lại. */
  const so = day ? tim + bl : '';
  if (!(CAU.luotXem || {}).bat) return so;
  return `<span class="xem" data-xem="${attr(b.url)}" hidden>${mat}</span>${so}`;
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
    ${b.tags.length ? `<div class="tag-row">${b.tags.slice(0, SL.tagMoiThe).map((t) =>
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
function bocPhanTrang(than, chonItem, so, moi) {
  const moiTrang = Math.max(1, Number(moi) || Number(CAU.moiTrang) || 10);
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
                        scripts = '', noindex = false }) {
  return trang({
    noindex,
    title: title || `${tieuDe} · ${CAU.title}`,
    description: description || CAU.description,
    canonical: canonical || `${CAU.url}${BASE}${duong}`,
    duong,
    scripts: ((CAU.baoVeChu || {}).bat === false ? ''
      : `<script src="${BASE}/assets/copy-guard.js" defer></script>`) +
      /* Bộ số trang chỉ nạp khi trang NÀY thật sự có một danh sách bị cắt.
         Trước đây mọi trang danh sách đều nạp, kể cả /search/ — mà kết quả tìm
         kiếm không phân trang bao giờ (đã lọc bằng câu tìm rồi, cắt thêm một
         lần nữa là bắt người đang tìm phải tìm trong kết quả tìm). Một file tải
         về rồi chạy xong mà không có gì để làm là một vòng mạng trắng. */
      (String(than).includes('data-phan-trang')
        ? `\n<script src="${BASE}/assets/trang-so.js" defer></script>` : '') + scripts,
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
  const dauTien = xep.slice(0, SL.heroTrangChu);
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
<section class="hero">
  ${heroAnhHTML()}

  <div class="hero-luoi">

    <!-- ── MÀN THỨ NHẤT ──
         Ba khối này là thứ người ta thấy lúc mở trang, và chúng phải chiếm
         TRỌN một màn. Bọc lại thành một khối vì ở khổ dọc danh sách bài mở ra
         bên dưới: không bọc thì cả bốn khối cùng chia nhau chiều cao, khối chữ
         lớn mất hết phần dôi ra, và màn đầu co lại còn nửa màn — cuộn lên
         cũng không về được trạng thái ban đầu nữa.

         Ở khổ ngang lớp bọc này tàng hình, nên lưới ba cột không hề biết có
         nó. Luật ở src/styles/list.css. -->
    <div class="hero-man">

    <div class="hero-cot hero-cot--trai">
      <a class="hero-hoso" href="${BASE}/about/">${escapeHtml(NHAN.profile)} →</a>
      ${oQuote('hero-quote')}
    </div>

    <h1 class="hero-danh" aria-label="${attr(CAU.title)}">
      <span class="hd-hang hd-hang--1" aria-hidden="true"><span class="hd-dau">${escapeHtml(tuDau[0])}</span><span class="hd-con">${escapeHtml(tuDau.slice(1))}</span>${tuGiua ? `<span class="hd-in">${escapeHtml(tuGiua)}</span>` : ''}</span>
      ${tuCuoi ? `<span class="hd-hang hd-hang--3" aria-hidden="true">${escapeHtml(tuCuoi)}</span>` : ''}
    </h1>

    <div class="hero-cot hero-cot--giua">
      <!-- Trỏ thẳng sang /posts/, không còn cuộn xuống một khối bên dưới:
           khối ấy đã bỏ, lý do ở chỗ dựng nội dung cuối hàm này. -->
      <a class="hero-xuong" href="${BASE}/posts/">
        <span>${escapeHtml(NHAN.readOn)}</span>
        <i aria-hidden="true"></i>
      </a>
    </div>

    </div><!-- /.hero-man -->

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
  <!-- Tem phiên bản ở góc hero ĐÃ BỎ. Trang chủ nay chỉ còn màn đầu và chân
       trang, mà chân trang đã in sẵn số phiên bản — hai lần cùng một con số
       cách nhau vài chục pixel thì cái nào cũng thành thừa. Chân trang giữ
       lại vì ở đó nó còn là cửa vào sổ lịch sử. -->
</section>`;

  return trang({
    title: `${CAU.title} · ${CAU.tagline}`,
    description: CAU.description,
    canonical: `${CAU.url}${BASE}/`,
    duong: '/',
    /* Trang chủ LUÔN theme sáng — xem ghi chú `ep` trong hàm trang(). */
    epTheme: 'light',
    /* ── NỀN ĐỘNG PHỦ TRỌN TRANG, KHÔNG CHỈ MÀN HERO ──
       Đời trước `data-nen` nằm trên chính `<section class="hero">`, nên cánh
       hoa rơi dừng đúng ở mép dưới màn hero. Hồi còn khối bài ở dưới thì
       không sao — mép ấy là ranh giới giữa hai phần thật. Nay trang chủ chỉ
       còn hero và chân trang, và cái mép biến thành một đường cắt ngang giữa
       trang: hai mảng nền khác nhau dán lại, đọc ra là hai cục.
       Đưa lên `.shell` thì canvas phủ từ thanh đầu trang xuống hết chân
       trang, và trang đọc ra là MỘT tấm. */
    shellAttr: ' data-nen',
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
      `<script src="${BASE}/assets/man-dau.js" defer></script>\n` +
      `<script src="${BASE}/assets/quote.js" defer></script>` +
      ((CAU.baoVeChu || {}).bat === false ? ''
        : `\n<script src="${BASE}/assets/copy-guard.js" defer></script>`),
    /* ── TRANG CHỦ CHỈ CÒN MÀN ĐẦU ──
       Dưới hero từng có thêm một khối: bài nổi bật in to, rồi lưới mấy bài còn
       lại, rồi hai đường dẫn sang Posts và Archive. Nút "Read on" cuộn xuống
       đúng khối ấy.

       Bỏ vì nó KỂ LẠI thứ vừa nói. Cột phải của hero đã liệt kê ba bài mới
       nhất kèm ngày; cuộn xuống thì gặp lại đúng ba bài ấy, lần này to hơn và
       có ảnh. Người đọc không nhận thêm thông tin nào, chỉ nhận thêm một màn
       phải lướt qua.

       Nay "Read on" đi thẳng sang /posts/ — nơi bài xếp theo chuyên mục và
       thật sự có thêm thứ để xem. Trang chủ trở lại đúng việc của nó: một cửa
       vào, không phải một bản mục lục thứ hai. */
    content: hero
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

  /* ── SÁU CHUYÊN MỤC MỘT TRANG ──
     Trang này là một BẢNG MỤC LỤC, và một bảng mục lục phải liếc hết được
     trong một hai màn. Quá sáu khối thì nó thành một cuộn dài, mà cuộn dài
     đúng là thứ trang chuyên mục sinh ra để thay thế.

     Cắt trang bằng chính bộ phân trang đang dùng cho danh sách bài (xem
     bocPhanTrang và src/js/trang-so.js) — không dựng thêm cơ chế thứ hai.
     Khác duy nhất: ở đây một "mục" là một KHỐI CHUYÊN MỤC, không phải một bài.

     ── VÀ NĂM BÀI MỖI MỤC, KHÔNG PHẢI BA ──
     Ba là con số của đời trước, hồi mỗi bài là một tấm thẻ có tóm tắt và tag.
     Thẻ thì ba cái đã chiếm trọn một hàng lưới. Nay mỗi bài là MỘT DÒNG cao
     chừng 40px, nên năm dòng vẫn thấp hơn một hàng thẻ cũ mà nói được nhiều
     hơn — và năm bài là đủ để đoán ra một chuyên mục viết về cái gì. */
  const MOI_TRANG_MUC = 6;
  const MOI_MUC = 5;

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
      ${/* ── DÒNG, KHÔNG PHẢI THẺ ──
            Mỗi tấm thẻ chở một tiêu đề, một ngày, một câu tóm tắt và hai tag —
            và chiếm chỗ bằng chừng bốn dòng chữ. Trên một trang mà việc duy
            nhất là ĐIỂM DANH các bài, tóm tắt và tag không giúp chọn: người
            đọc chọn theo tiêu đề. Đổi sang dòng đơn thì cùng một bề cao chứa
            được gấp bốn số bài, và cả trang thôi là một bãi thẻ.

            Số thứ tự bên trái không phải trang trí: nó nói "đây là một danh
            sách có thứ tự", tức là bài mới nhất nằm trên. */''}
      <ol class="mc-ds">${trong.slice(0, MOI_MUC).map((b, i) => `
        <li class="mc-dong">
          <a href="${b.url}">
            <span class="mc-so">${String(i + 1).padStart(2, '0')}</span>
            <span class="mc-tt">${noiChu(escapeHtml(b.titleNgan || b.title))}</span>
            <time class="mc-ngay" datetime="${b.date}">${ngayAnh(b.date).replace(/ \d{4}$/, '')}</time>
          </a>
        </li>`).join('')}</ol>
    </section>`;
  }).join('');

  ra.push({
    duong: '/posts/',
    html: trangDanhSach({
      tieuDe: NHAN.allPosts,
      dan: `${mucCap1.length} chuyên mục · ${theoNgay.length} bài`,
      chip: hangChip(chipDS, '/posts/'),
      than: theoNgay.length
        ? bocPhanTrang(thuMuc, '.muc-khoi', mucCap1.length, MOI_TRANG_MUC)
        : `<p class="ds-trong">${NHAN.noPosts}</p>`,
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
  /* Thẻ <nav> LUÔN in ra, kể cả lúc rỗng — ghi-chu.js cần một cái neo sẵn để
     dựng lại hàng nút sau khi chèn ghi chú mới từ mạng (ghi chú mới có thể
     mang một loại chưa từng có nút nào). `hidden` lo phần không bày ra khi
     chưa đủ hai loại; không JavaScript thì nó ở nguyên như build in ra. */
  const locHTML = `<nav class="chip-hang gc-loc" data-gc-loc aria-label="${NHAN.filter}"` +
    `${loai.length > 1 ? '' : ' hidden'}>` +
    (loai.length > 1
      ? `<button type="button" class="chip chip--nay" data-loai="">${NHAN.allNotes}</button>` +
        loai.map((x) => `<button type="button" class="chip" data-loai="${attr(x)}">` +
          `${escapeHtml(x)}<span class="chip-so">${ds.filter((y) => y.loai === x).length}</span>` +
          `</button>`).join('')
      : '') + `</nav>`;

  const than = ds.length ? `
    ${locHTML}
    <ol class="gc-ds">${ds.map((x) => `
      <li class="gc-mot" data-loai="${attr(x.loai)}">
        <div class="gc-dau">
          <time datetime="${x.ngay}">${ngayAnh(x.ngay)}</time>
          ${x.loai ? `<span class="gc-loai">${escapeHtml(x.loai)}</span>` : ''}
        </div>
        <div class="gc-chu prose">${x.html}</div>
      </li>`).join('')}</ol>` : `${locHTML}<p class="ds-trong">${NHAN.noNotes}</p>`;

  /* Bọc phân trang, KHÔNG để danh sách dài vô tận. Chọn `.gc-mot:not(.gc-khac-loai)`
     chứ không phải `.gc-mot` trơn: lọc theo loại giấu mục bằng class ấy, và bộ
     chia trang phải đếm trên danh sách CÒN LẠI sau khi lọc — không thì lọc còn
     hai ghi chú mà bộ số vẫn ghi ba trang. */
  const thanCoSo = ds.length
    ? bocPhanTrang(than, '.gc-mot:not(.gc-khac-loai)', ds.length)
    : than;

  return trangDanhSach({
    tieuDe: NHAN.notes,
    dan: NHAN.notesHint,
    than: thanCoSo,
    duong: '/notes/',
    description: `${NHAN.notesHint} — ${CAU.title}.`,
    /* /notes/ nay chỉ còn hai việc của NGƯỜI ĐỌC: lọc theo loại, và xin về
       mấy ghi chú đăng thẳng chưa kịp vào bản dựng. Ô viết đã về hẳn
       /z-admin/, nên trang này thôi tải khoa.js lẫn duyet.js. */
    scripts: `<script src="${BASE}/assets/ghi-chu.js" defer></script>`
  });
}
/* ── /z-admin/ — BÀN LÀM VIỆC CỦA CHỦ TRANG ──
   MỘT đường dẫn, hai việc, không đè lên nhau: ô viết ghi chú ở trên, hàng chờ
   duyệt bình luận ở dưới.

   ── VÌ SAO LÀ MỘT TRANG THẬT, KHÔNG PHẢI DẤU THĂNG ──
   Bản trước bắt chủ trang nhớ hai địa chỉ `/notes/#viet` và `/notes/#duyet`.
   Cái đó không phải đăng nhập — nó là bắt người ta học thuộc đường đi, và mỗi
   lần muốn làm gì lại phải gõ đúng chuỗi ấy. Một trang thật thì lưu được vào
   màn hình chính điện thoại, bấm một phát là vào, và hai việc nằm cạnh nhau
   chứ không tranh chỗ.

   ── NÓ KHÔNG PHẢI BÍ MẬT, VÀ KHÔNG CẦN PHẢI BÍ MẬT ──
   `noindex` để Google không đưa nó vào kết quả tìm kiếm, và nó không nằm trong
   sitemap, không có trong thanh điều hướng. Nhưng ai gõ đúng đường dẫn vẫn mở
   được — và mở ra thì chỉ thấy một ô xin khoá. Lớp bảo mật là hai vế khoá ở
   phía máy chủ, không phải chỗ giấu đường dẫn.

   Ba khối bên trong đều RỖNG lúc dựng; ghi-chu.js, duyet.js và viet-bai.js đổ
   nội dung vào khi trang chạy, sau khi khoá đã khớp. Nhờ vậy HTML tĩnh của
   trang này không chứa gì đáng giấu — kể cả lúc ai đó xem mã nguồn.

   ── BA VIỆC, BA NGĂN, KHÔNG XẾP CHỒNG ──
   Bản trước đổ cả ô viết ghi chú lẫn hàng chờ duyệt xuống một cột dọc. Với hai
   khối thì còn chịu được; thêm ô viết BÀI — vốn cao gấp mấy lần vì có cả khung
   soạn thảo — là thành một trang cuộn mãi không hết, và muốn duyệt một bình
   luận thì phải lướt qua trọn một bài đang gõ dở.

   Nay là một cột chọn việc bên trái, nội dung bên phải, mỗi lúc một ngăn.
   Ngăn đang ẩn thì ẩn bằng `hidden` chứ không phải dịch ra ngoài màn hình:
   nội dung của nó thật sự biến khỏi cây trang, nên trình đọc màn hình không
   đọc phải ba khung cùng lúc, và bàn duyệt biết đường ngừng hỏi máy chủ.

   Khổ hẹp thì cột trái nằm ngang thành một hàng nút trên đầu — xem list.css. */
const AD_NGAN = [
  { ma: 'note',    nhan: () => NHAN.qlNote,    de: () => NHAN.qlViet,  o: 'data-viet-host' },
  { ma: 'comment', nhan: () => NHAN.qlComment, de: () => NHAN.qlDuyet, o: 'data-duyet-host' },
  { ma: 'post',    nhan: () => NHAN.qlPost,    de: () => NHAN.qlBai,   o: 'data-viet-bai-host' }
];

function trangChuTrang() {
  const menu = AD_NGAN.map((n, i) => `
      <button type="button" role="tab" class="ad-nut" id="ad-tab-${n.ma}"
              data-ad="${n.ma}" aria-controls="ad-o-${n.ma}"
              aria-selected="${i === 0 ? 'true' : 'false'}"
              tabindex="${i === 0 ? '0' : '-1'}">${escapeHtml(n.nhan())}</button>`).join('');

  /* Ngăn thứ hai trở đi mang `hidden` ngay trong HTML tĩnh: không có
     JavaScript thì cả ba vẫn hiện đủ… trừ khi đã có `hidden`. Cố ý chọn vế
     sau — trang này KHÔNG chạy được nếu thiếu JavaScript (cả ba khung đều do
     JS dựng), nên bày ba tiêu đề rỗng ra thì chỉ gây hiểu nhầm. */
  const than = AD_NGAN.map((n, i) => `
      <section role="tabpanel" class="ad-o" id="ad-o-${n.ma}"
               aria-labelledby="ad-tab-${n.ma}"${i === 0 ? '' : ' hidden'}>
        <h2 class="ql-de">${escapeHtml(n.de())}</h2>
        <div ${n.o}></div>
      </section>`).join('');

  return trangDanhSach({
    tieuDe: NHAN.qlTitle,
    dan: NHAN.qlDan,
    duong: '/z-admin/',
    noindex: true,
    than: `
    <!-- MỘT CỬA cho cả ba ngăn. Trước bản này mỗi ngăn tự xin khoá, nên trang
         hỏi cùng một câu ba lần và "đăng xuất" ở ngăn này không đóng hai ngăn
         kia. Nay khoa.js dựng đúng một khung vào đây, và cả ba ngăn chỉ đứng
         sau nó. Lý do đầy đủ ở đầu src/js/khoa.js. -->
    <!-- Lời chào kiêm lối ra, đứng đúng chỗ dòng phụ đề cũ. Mang sẵn thuộc
         tính hidden (viết trần, KHÔNG bọc dấu huyền — cả khối này nằm trong
         một template literal): nó chỉ có nghĩa sau khi đã vào được, mà lúc
         chưa vào thì cả trang chỉ có một ô xin khoá. -->
    <p class="ad-chao" data-khoa-chao data-ten="${attr(CAU.author || '')}" hidden></p>
    <div class="ad-cong" data-khoa-cong></div>
    <!-- Thuộc tính hidden đặt ngay trong HTML tĩnh (viết trần, KHÔNG bọc dấu
         huyền: cả khối này nằm trong một template literal, một dấu huyền lọt
         vào là chuỗi đóng sớm và build chết ở một dòng chú thích). Khối này
         chứa ô soạn thảo và hàng chờ duyệt, tức là chỗ làm việc — bày ra rồi
         mới giấu đi bằng JavaScript thì có một nhịp người ta thấy nguyên cái
         bàn làm việc nhấp nháy trước khi bị đẩy về màn đăng nhập. -->
    <div class="ad-khung" data-admin hidden>
      <nav class="ad-menu" role="tablist" aria-label="${attr(NHAN.qlMenu)}">${menu}
      </nav>
      <div class="ad-than">${than}
      </div>
    </div>`,
    scripts: `<script src="${BASE}/assets/khoa.js" defer></script>` +
             `\n<script src="${BASE}/assets/admin.js" defer></script>` +
             `\n<script src="${BASE}/assets/ghi-chu.js" defer></script>` +
             `\n<script src="${BASE}/assets/duyet.js" defer></script>` +
             `\n<script src="${BASE}/assets/soan.js" defer></script>` +
             `\n<script src="${BASE}/assets/viet-bai.js" defer></script>`
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
<div class="chip-hang tk-loc" id="tk-loc" data-nhan="${attr(JSON.stringify({
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
  const muc = bai.slice(0, SL.rss).map((b) => `    <item>
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

  const baiTatCa = file.map(docBai).filter(Boolean);
  /* Bài ẩn rời khỏi dòng chảy NGAY TẠI ĐÂY, trước mọi thứ khác. Lọc ở từng
     chỗ dùng thì sớm muộn sót một chỗ — mà chỗ sót ấy có thể là sitemap hoặc
     feed, tức là đúng hai nơi bài ẩn tuyệt đối không được xuất hiện. */
  const baiAn = baiTatCa.filter((b) => b.an);
  const bai = baiTatCa.filter((b) => !b.an);

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
                     'nen.js', 'trang-so.js', 'moc.js', 'man-dau.js',
                     'bang-anh.js', 'xem.js', 'khoa.js', 'ghi-chu.js', 'duyet.js',
                     'chia-se.js', 'logo-nhip.js',
                     'soan.js', 'viet-bai.js', 'admin.js']) {
      const goc = fs.readFileSync(path.join(THU_MUC.src, 'js', j), 'utf8');
      /* Lưới an toàn: thử DỊCH bản đã cắt trước khi ghi. new Function() dựng
         đúng bộ phân tích cú pháp của V8, nên nó bắt được mọi chỗ bộ đọc token
         ở trên đọc nhầm — mà đọc nhầm dấu `/` thì gần như luôn ra cú pháp sai.
         Hỏng thì gửi nguyên bản gốc: trang nặng thêm vài KB còn hơn trang chết. */
      let ra = boChuThichJS(goc);
      try { new Function(ra); }
      catch (e) {
        CANH_BAO.push(`cắt chú thích ${j} ra cú pháp hỏng (${e.message})`
                      + ' — gửi nguyên bản');
        ra = goc;
      }
      ghi(path.join(THU_MUC.dist, 'assets', j), ra);
    }
    ghi(path.join(THU_MUC.dist, 'so-tay.json'), SO_TAY());
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
      { duong: '/z-admin/', html: trangChuTrang() },
      { duong: '/search/',  html: trangSearch() }
    ];
    for (const t of dsTrang) {
      ghi(path.join(THU_MUC.dist, ...t.duong.split('/').filter(Boolean), 'index.html'), t.html);
    }

    ghi(path.join(THU_MUC.dist, 'feed.xml'), rss(congKhai));
    ghi(path.join(THU_MUC.dist, 'sitemap.xml'),
        /* Bàn làm việc của chủ trang KHÔNG vào sitemap: sitemap là lời mời
           Google ghé xem, mà trang ấy chẳng có gì cho người đọc. Nó cũng mang
           sẵn noindex — hai lớp cho cùng một ý, vì bỏ sót một lớp thì lớp kia
           vẫn giữ được. */
        sitemap(congKhai, [...trangTinhDS.map((t) => t.url),
                           ...dsTrang.filter((t) => t.duong !== '/z-admin/')
                                     .map((t) => `${BASE}${t.duong}`)]));
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
    /* In ra số bài ẩn: một bài biến mất khỏi trang mà dòng kết quả không nhắc
       gì thì lần sau mở lên chỉ thấy "thiếu một bài" và không biết hỏi ai. */
    (baiAn.length ? ` · ${baiAn.length} bài đã ẩn` : '') +
    (trangTinhDS.length ? ` · ${trangTinhDS.length} trang tĩnh` : '') +
    (KHO_QUOTE.length ? ` · ${KHO_QUOTE.length} trích dẫn` : '')) +
    mau.mo(`  ·  ${BAN.ten} · ${BAN.ngay}`) +
    mau.mo(`  (${Date.now() - t0}ms)`));
  console.log(mau.mo(CHI_KIEM
    ? '    chế độ kiểm bài — không ghi file nào\n'
    : `    → ${path.relative(GOC, THU_MUC.dist)}/   ·   xem thử: npm run dev\n`));
}

chay().catch((e) => { console.error(mau.do('\n  ✖ ' + e.stack + '\n')); process.exit(1); });
