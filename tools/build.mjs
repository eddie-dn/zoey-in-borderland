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
import { docSo, temNgay } from './lib/lichsu.mjs';
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

/* ══════════ BẢNG NHÃN GIAO DIỆN ══════════
   Mọi chữ KHÔNG phải nội dung bài đều lấy từ đây — tiếng Anh, để phần khung
   trang đọc ra đồng bộ với nhau và tách bạch hẳn khỏi nội dung tiếng Việt.
   Đổi ngôn ngữ giao diện là sửa đúng khối này, không phải đi lùng từng chuỗi
   nằm rải trong code. */
const NHAN = {
  posts      : 'Posts',
  tagged     : 'Tagged',
  readNext   : 'Read next',
  onThisPage : 'On this page',
  contents   : 'Contents',
  minRead    : 'min read',
  updated    : 'Updated',
  draft      : 'Draft',
  soon       : 'Coming soon',
  search     : 'Search',
  skipToMain : 'Skip to content',
  toLight    : 'Switch to light',
  toDark     : 'Switch to dark',
  anchor     : 'Link to this section',
  related    : 'Related',
  comments   : 'Leave a note',
  yourName   : 'Name',
  yourNote   : 'Your note',
  optional   : 'optional',
  emailNote  : 'optional · never shown',
  namePh     : 'Ai ghé ngang đây?',
  emailPh    : 'Để mình trả lời riêng',
  notePh     : 'Viết gì cũng được…',
  send       : 'Send',
  older      : 'Older',
  newer      : 'Newer'
};

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

/* ══════════════ 3. DỰNG HTML ══════════════ */

const MAU_SHELL = fs.readFileSync(path.join(THU_MUC.src, 'templates', 'shell.html'), 'utf8');
const MAU_POST  = fs.readFileSync(path.join(THU_MUC.src, 'templates', 'post.html'), 'utf8');

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
    htmlAttr  : '',
    title     : escapeHtml(title),
    siteTitle : escapeHtml(CAU.title),
    tagline   : escapeHtml(CAU.tagline),
    author    : escapeHtml(CAU.author),
    description: attr(description || CAU.description),
    canonical : attr(canonical),
    ogTitle   : attr(ogTitle || title),
    ogType    : ogType || 'website',
    ogImage   : attr(ogImage || `${CAU.url}/og.png`),
    locale    : CAU.locale,
    robots    : noindex ? '<meta name="robots" content="noindex, nofollow">' : '',
    base      : BASE,
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
    version   : BAN.ten
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
  return `<section class="binh-luan" data-binh-luan="${attr(c.url || '')}"
           data-trang="${attr(bai.url)}">
    <div class="eyebrow"><i></i></div>
    <p class="label">${NHAN.comments} <span class="bl-dem"></span></p>
    <p class="bl-moi">${escapeHtml(c.loiMoi || 'Ghé ngang thì để lại một dòng cũng được.')}</p>

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
    <ul class="bl-ds"></ul>
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
      ? `<span class="dot" aria-hidden="true"></span><span>${NHAN.updated} ${ngayAnh(bai.updated)}</span>`
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
    ogImage    : bai.cover
      ? (/^https?:/.test(bai.cover) ? bai.cover : `${CAU.url}${BASE}${bai.cover}`)
      : `${CAU.url}/og.png`,
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
    headExtra  : `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: bai.title, datePublished: bai.date,
      dateModified: bai.updated || bai.date,
      description: bai.summary, keywords: bai.tags.join(', '),
      author: { '@type': 'Person', name: CAU.author },
      mainEntityOfPage: `${CAU.url}${bai.url}`
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
  /* Thứ tự này không đổi được:
       tokens     trước mọi thứ, vì mọi file còn lại đọc biến của nó
       glass      trước component, để component ghi đè được vật liệu khi cần
       prose      sau component, để khung đọc bài ghi đè được component */
  /* Thứ tự KHÔNG đổi được:
       tokens     trước mọi thứ, vì mọi file còn lại đọc biến của nó
       glass      trước component, để component ghi đè được vật liệu khi cần
       prose      sau component, để khung đọc bài ghi đè được component
     Danh sách này phải phủ HẾT src/styles/ — bộ kiểm định có một phép so lại
     (xem tools/kiem-dinh.mjs). Bản trước thiếu glass.css ở đây, và vì CSS
     thiếu thì không báo lỗi gì cả, cả bộ liquid glass im lặng không chạy. */
  const thuTu = ['tokens.css', 'base.css', 'glass.css', 'layout.css',
                 'components.css', 'prose.css'];
  return thuTu.map((f) => {
    const p = path.join(THU_MUC.src, 'styles', f);
    if (!fs.existsSync(p)) { CANH_BAO.push(`thiếu file style: ${f}`); return ''; }
    return `/* ───────── ${f} ───────── */\n${fs.readFileSync(p, 'utf8')}`;
  }).join('\n\n');
}

/* ══════════════ 5. TRANG TẠM & FILE PHỤ ══════════════ */

/* Trang chủ ở đây là BẢN TẠM có chủ đích: lượt này chỉ dựng khung sườn, trang
   chủ / trang tag / trang tìm kiếm đầy đủ nằm ở lượt sau. Vẫn dựng để trang
   không rơi vào ngõ cụt, và để soi thử khung đọc bài trên máy. */
function trangChuTam(bai) {
  const the = bai.map((b) => `
    <article class="card">
      <div class="meta-row">
        <time datetime="${b.date}">${ngayAnh(b.date)}</time>
        <span class="dot" aria-hidden="true"></span><span>${b.phut} phút đọc</span>
        ${b.draft ? '<span class="badge badge--draft">Nháp</span>' : ''}
      </div>
      <h3><a class="stretch" href="${b.url}">${escapeHtml(b.title)}</a></h3>
      <p class="meta">${escapeHtml(tomTat(b.summary, 150))}</p>
      ${b.tags.length ? `<div class="tag-row">${b.tags.map((t) =>
        `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    </article>`).join('');

  return trang({
    title: `${CAU.title} · ${CAU.tagline}`,
    description: CAU.description,
    canonical: `${CAU.url}${BASE}/`,
    duong: '/',
    content: `
<div class="container" style="padding-block:var(--s10) var(--s8)">
  <div class="eyebrow"><i></i></div>
  <h1 style="font-size:var(--fs-display);font-style:italic">${escapeHtml(CAU.title)}</h1>
  <p class="lead" style="max-width:var(--measure);font-size:var(--fs-md);color:var(--text-muted);margin-top:var(--s4)">
    ${escapeHtml(CAU.description)}
  </p>
  <div class="callout callout--note" style="margin-top:var(--s8);max-width:var(--measure)">
    <b class="callout-lab">Bản tạm</b>
    <p style="margin-top:var(--s2)">Đây là trang chủ dựng tạm của lượt "khung sườn".
    Trang chủ thật, trang tag và trang tìm kiếm nằm ở lượt sau — xem
    <code>docs/IA.md</code> phần "Việc còn lại".</p>
  </div>
</div>
<div class="container" style="padding-bottom:var(--s10)">
  <div class="eyebrow"><i></i></div>
  <p class="label" style="margin-bottom:var(--s5)">${bai.length} bài</p>
  <div style="display:grid;gap:var(--s4);grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
    ${the || '<p style="color:var(--text-muted)">Chưa có bài nào. Chạy <code>npm run new "Tên bài"</code>.</p>'}
  </div>
</div>`
  });
}

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

function sitemap(bai) {
  const u = [`${CAU.url}${BASE}/`, ...bai.map((b) => `${CAU.url}${b.url}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${u.map((x) => `  <url><loc>${x}</loc></url>`).join('\n')}
</urlset>`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="#F4E7FB"/>
<path d="M16 14.6a2.6 2.6 0 1 0 0 1.6 2.6 2.6 0 0 0 0-1.6Zm0-9c1.9 0 3.1 1.8 2.6 3.6-.2.8.6 1.5 1.3 1.1 1.7-.9 3.7.3 3.7 2.2 0 1.9-2 3.1-3.7 2.2-.7-.4-1.5.3-1.3 1.1.5 1.8-.7 3.6-2.6 3.6s-3.1-1.8-2.6-3.6c.2-.8-.6-1.5-1.3-1.1-1.7.9-3.7-.3-3.7-2.2 0-1.9 2-3.1 3.7-2.2.7.4 1.5-.3 1.3-1.1C12.9 7.4 14.1 5.6 16 5.6Z" fill="#E3AADD"/>
</svg>`;

/* ══════════════ 6. CHẠY ══════════════ */

async function chay() {
  const t0 = Date.now();
  console.log(mau.dam(`\n  ${CAU.title} — ${CHI_KIEM ? 'kiểm bài' : 'dựng trang'}\n`));

  const file = quet(THU_MUC.posts);
  if (!file.length) CANH_BAO.push('content/posts/ chưa có bài nào');

  const bai = file.map(docBai).filter(Boolean);

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
    for (const j of ['theme.js', 'toc.js', 'media.js', 'comments.js', 'copy-guard.js']) {
      ghi(path.join(THU_MUC.dist, 'assets', j),
          fs.readFileSync(path.join(THU_MUC.src, 'js', j), 'utf8'));
    }
    ghi(path.join(THU_MUC.dist, 'favicon.svg'), FAVICON);

    /* Gợi ý chỉ lấy trong danh sách CÔNG KHAI: gợi ý cả bản nháp thì bạn đọc
       bấm vào là rơi vào một bài chưa viết xong. */
    const canDung = CO_NHAP ? bai : congKhai;
    for (const b of canDung) ghi(b.duongDanRa, trangBai(b, congKhai));

    ghi(path.join(THU_MUC.dist, 'index.html'), trangChuTam(canDung));
    ghi(path.join(THU_MUC.dist, 'feed.xml'), rss(congKhai));
    ghi(path.join(THU_MUC.dist, 'sitemap.xml'), sitemap(congKhai));
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

    /* Bảng tag: tên hiển thị (giữ dấu) ↔ slug ↔ số bài */
    const tag = new Map();
    for (const b of congKhai) {
      for (const t of b.tags) {
        const s = slugify(t);
        if (!tag.has(s)) tag.set(s, { slug: s, ten: t, so: 0, bai: [] });
        const o = tag.get(s); o.so++; o.bai.push(b.url);
      }
    }
    ghi(path.join(THU_MUC.dist, 'tags.json'),
        JSON.stringify([...tag.values()].sort((a, b) => b.so - a.so || a.ten.localeCompare(b.ten, 'vi'))));
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
    (nhap ? ` · ${nhap} bản nháp` : '')) +
    mau.mo(`  ·  ${BAN.ten} · ${BAN.ngay}`) +
    mau.mo(`  (${Date.now() - t0}ms)`));
  console.log(mau.mo(CHI_KIEM
    ? '    chế độ kiểm bài — không ghi file nào\n'
    : `    → ${path.relative(GOC, THU_MUC.dist)}/   ·   xem thử: npm run dev\n`));
}

chay().catch((e) => { console.error(mau.do('\n  ✖ ' + e.stack + '\n')); process.exit(1); });
