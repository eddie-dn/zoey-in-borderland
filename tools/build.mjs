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
  slugify, escapeHtml, attr, phutDoc, ngayViet, ngayISO, ngayTem, tomTat, boDau
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
      if (!'ABC'.includes(k) || k.length !== 1) {
        canhBaoBai(`\`khung: ${fm.khung}\` không có — chỉ nhận A, B hoặc C. Dùng tạm A.`);
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
      return `<span class="nav-text nav-cho tip" data-tip="Sắp có">${escapeHtml(n.label)}</span>`;
    }
    const day = duongHienTai.startsWith(n.href) && n.href !== '/';
    return `<a class="nav-text" href="${BASE}${n.href}"${day ? ' aria-current="page"' : ''}>` +
           `${escapeHtml(n.label)}</a>`;
  }).join('\n      ');
}

function trang({ title, description, canonical, ogTitle, ogImage, ogType, content,
                 scripts = '', headExtra = '', noindex = false, lang = CAU.lang, duong = '/' }) {
  return dienMau(MAU_SHELL, {
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
      ? `<a class="ico-btn tip" href="${BASE}/search/" aria-label="Tìm kiếm" data-tip="Tìm kiếm">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/>` +
        `<path d="M16.2 16.2 21 21"/></svg></a>` : '',
    footLinks : [
        ['/feed.xml', 'RSS', true],
        ['/archive/', 'Lưu trữ', coTrang('/archive/')],
        ['/tags/', 'Tag', coTrang('/tags/')]
      ].map(([h, t, co]) => co ? `<a href="${BASE}${h}">${t}</a>`
                               : `<span class="nav-cho">${t}</span>`).join('\n      '),
    content,
    scripts,
    headExtra,
    year      : new Date().getFullYear(),
    buildDate : BAN.ngay ? temNgay(BAN.ngay) : ngayTem(),
    version   : BAN.ten
  });
}

function tocHTML(headings) {
  /* Dưới 2 mục thì mục lục chỉ tổ chiếm chỗ — bài ngắn không cần bản đồ. */
  if (headings.length < 2) return '';
  const li = headings.map((h) =>
    `<li class="lvl-${h.cap}"><a href="#${h.id}">${escapeHtml(h.chu)}</a></li>`).join('');
  return `<details class="toc-box" open>
    <summary>Mục lục</summary>
    <nav class="toc" aria-label="Mục lục bài viết">
      <div class="toc-title">Trong bài này</div>
      <ol>${li}</ol>
    </nav>
  </details>`;
}

function crumbsHTML(bai) {
  const muc = [
    `<li>${lienKet('/posts/', 'Bài viết')}</li>`,
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
  return `<figure class="post-cover wide">` +
    `<img src="${attr(ngoai ? bai.cover : BASE + bai.cover)}" alt="${attr(bai.coverAlt)}"` +
    `${dim}${style} loading="eager" fetchpriority="high" decoding="async">` +
    (bai.coverAlt ? `<figcaption>${escapeHtml(bai.coverAlt)}</figcaption>` : '') +
    `</figure>`;
}

function postNavHTML(truoc, sau) {
  const o = [];
  if (truoc) o.push(`<a class="prev" href="${truoc.url}"><span class="dir">← Bài trước</span>` +
                    `<span class="t">${escapeHtml(truoc.title)}</span></a>`);
  if (sau)   o.push(`<a class="next" href="${sau.url}"><span class="dir">Bài sau →</span>` +
                    `<span class="t">${escapeHtml(sau.title)}</span></a>`);
  return o.length ? `<nav class="post-nav" aria-label="Bài trước và bài sau">${o.join('')}</nav>` : '';
}

function trangBai(bai, truoc, sau) {
  const noiDung = dienMau(MAU_POST, {
    khung       : bai.khung,
    crumbs      : crumbsHTML(bai),
    title       : escapeHtml(bai.title),
    summaryBlock: bai.summary ? `<p class="summary">${escapeHtml(bai.summary)}</p>` : '',
    dateISO     : bai.date,
    dateText    : ngayViet(bai.date),
    readingTime : bai.phut,
    updatedBlock: bai.updated
      ? `<span class="dot" aria-hidden="true"></span><span>Sửa lần cuối ${ngayViet(bai.updated)}</span>`
      : '',
    draftBadge  : bai.draft ? '<span class="badge badge--draft">Bản nháp</span>' : '',
    tagRow      : bai.tags.length
      ? `<div class="tag-row">${bai.tags.map((t) =>
          lienKet(`/tags/${slugify(t)}/`, t, 'tag')).join('')}</div>`
      : '',
    cover       : coverHTML(bai),
    body        : bai.html,
    postNav     : postNavHTML(truoc, sau),
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
                 `<script src="${BASE}/assets/media.js" defer></script>`,
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
  const thuTu = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'prose.css'];
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
        <time datetime="${b.date}">${ngayViet(b.date)}</time>
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
    for (const j of ['theme.js', 'toc.js', 'media.js']) {
      ghi(path.join(THU_MUC.dist, 'assets', j),
          fs.readFileSync(path.join(THU_MUC.src, 'js', j), 'utf8'));
    }
    ghi(path.join(THU_MUC.dist, 'favicon.svg'), FAVICON);

    /* Bài trước / bài sau chỉ nối trong danh sách CÔNG KHAI: nối cả bản nháp
       thì bạn đọc bấm "bài sau" là rơi vào một bài chưa viết xong. */
    const viTri = new Map(congKhai.map((b, i) => [b.url, i]));
    for (const b of bai) {
      const i = viTri.get(b.url);
      const truoc = i === undefined ? null : congKhai[i + 1] || null;
      const sau   = i === undefined ? null : congKhai[i - 1] || null;
      ghi(b.duongDanRa, trangBai(b, truoc, sau));
    }

    ghi(path.join(THU_MUC.dist, 'index.html'), trangChuTam(bai));
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
  console.log(mau.xanh(`  ✓ ${congKhai.length} bài công khai` +
    (nhap ? ` · ${nhap} bản nháp` : '')) +
    mau.mo(`  ·  ${BAN.ten} · ${BAN.ngay}`) +
    mau.mo(`  (${Date.now() - t0}ms)`));
  console.log(mau.mo(CHI_KIEM
    ? '    chế độ kiểm bài — không ghi file nào\n'
    : `    → ${path.relative(GOC, THU_MUC.dist)}/   ·   xem thử: npm run dev\n`));
}

chay().catch((e) => { console.error(mau.do('\n  ✖ ' + e.stack + '\n')); process.exit(1); });
