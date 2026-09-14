#!/usr/bin/env node
/* ============================================================
   KIỂM ĐỊNH — chạy TRƯỚC KHI ĐĂNG, bắt lỗi mà mắt không nhìn ra.

   Chạy:  npm run kiem            dựng lại rồi kiểm
          npm run kiem -- --nhanh  kiểm dist/ đang có, không dựng lại

   Khác `npm run check` ở chỗ: `check` chỉ soi file .md nguồn, còn cái này soi
   HTML ĐÃ DỰNG XONG trong dist/ — tức là đúng thứ người đọc sẽ nhận được.

   ─────────────────────────────────────────────────────────────
   THÊM PHÉP KIỂM MỚI: thêm một object vào mảng KIEM ở §2.
     { ten, muc: 'loi' | 'canh', chay: (ctx) => ['câu báo', …] }
   Trả mảng rỗng nghĩa là đạt. `ctx` có sẵn: trang[], media[], cau, goc, dist.
   Không phải sửa gì ở chỗ khác.
   ─────────────────────────────────────────────────────────────
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { docSo } from './lib/lichsu.mjs';
import { boDau } from './lib/text.mjs';

const GOC  = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(GOC, 'dist');
const CO   = new Set(process.argv.slice(2));

const mau = {
  do:   (s) => `\x1b[31m${s}\x1b[0m`, vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`, mo:  (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`,  tim: (s) => `\x1b[35m${s}\x1b[0m`
};

/* ══════════════ 1. GOM DỮ LIỆU MỘT LẦN ══════════════ */

function quet(goc, loc) {
  if (!fs.existsSync(goc)) return [];
  const ra = [];
  for (const m of fs.readdirSync(goc, { withFileTypes: true })) {
    const p = path.join(goc, m.name);
    if (m.isDirectory()) ra.push(...quet(p, loc));
    else if (!loc || loc(p)) ra.push(p);
  }
  return ra;
}

function docThe(html, re) { const m = html.match(re); return m ? m[1] : null; }

function gomContext() {
  const cau = JSON.parse(fs.readFileSync(path.join(GOC, 'site.config.json'), 'utf8'));

  const trang = quet(DIST, (p) => p.endsWith('.html')).map((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const url = '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
    return {
      f, url, html,
      nhan: path.relative(GOC, f),
      title      : docThe(html, /<title>([^<]*)<\/title>/),
      description: docThe(html, /<meta name="description" content="([^"]*)"/),
      canonical  : docThe(html, /<link rel="canonical" href="([^"]*)"/),
      ogImage    : docThe(html, /<meta property="og:image" content="([^"]*)"/),
      noindex    : /name="robots" content="noindex/.test(html),
      /* Chỉ soi phần thân bài, không soi header/footer — nếu không thì mọi
         trang đều báo trùng vì header có chung một bộ link. */
      than       : (html.match(/<main id="noi-dung">([\s\S]*?)<\/main>/) || [, html])[1]
    };
  });

  const media = quet(path.join(GOC, 'public'))
    .map((f) => ({ f, url: '/' + path.relative(path.join(GOC, 'public'), f).replace(/\\/g, '/'),
                   kb: Math.round(fs.statSync(f).size / 1024) }));

  return { cau, trang, media, goc: GOC, dist: DIST };
}

/* ══════════════ 2. CÁC PHÉP KIỂM ══════════════ */

const KIEM = [

  /* ── Thẻ meta: thứ quyết định bài trông thế nào trên Google và Facebook ── */
  {
    ten: 'Mỗi trang có đủ title · description · canonical · og:image',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) => {
      const thieu = ['title', 'description', 'canonical', 'ogImage']
        .filter((k) => !t[k] || !String(t[k]).trim());
      return thieu.length ? [`${t.url} — thiếu ${thieu.join(', ')}`] : [];
    })
  },
  {
    ten: 'Mỗi trang có đúng MỘT thẻ h1',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) => {
      const n = (t.than.match(/<h1[\s>]/g) || []).length;
      return n === 1 ? [] : [`${t.url} — có ${n} thẻ h1 (phải đúng 1)`];
    })
  },
  {
    ten: 'description dài trong khoảng Google hiển thị được (50–170)',
    muc: 'canh',
    chay: ({ trang }) => trang.flatMap((t) => {
      const n = (t.description || '').length;
      if (n >= 50 && n <= 170) return [];
      return [`${t.url} — description ${n} ký tự ${n < 50 ? '(quá ngắn)' : '(Google cắt ở ~160)'}`];
    })
  },

  /* ── Ảnh ── */
  {
    ten: 'Mọi thẻ img có chữ alt',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.than.matchAll(/<img\b[^>]*>/g)]
        /* alt="" CỐ Ý để rỗng là hợp lệ cho ảnh trang trí (ảnh bìa video chẳng
           hạn) — trình đọc màn hình bỏ qua nó. Thiếu HẲN thuộc tính alt mới là lỗi. */
        .filter((m) => !/\balt\s*=/.test(m[0]))
        .map((m) => `${t.url} — img không có thuộc tính alt: ${m[0].slice(0, 70)}…`))
  },
  {
    ten: 'Mọi thẻ img có khoá sẵn tỉ lệ (không làm nhảy chữ)',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.than.matchAll(/<img\b[^>]*>/g)]
        .filter((m) => !/--ar:/.test(m[0]) && !/position:absolute/.test(m[0]) &&
                       !/class="[^"]*yt/.test(m[0]))
        .filter((m) => {
          /* Ảnh trong .yt-facade nằm tuyệt đối phủ kín khung 16/9 của thẻ cha
             nên không cần --ar riêng. Nhận ra nó qua src trỏ sang ytimg. */
          const src = (m[0].match(/src="([^"]*)"/) || [])[1] || '';
          return !src.includes('ytimg.com');
        })
        .map((m) => `${t.url} — img thiếu --ar: ${(m[0].match(/src="([^"]*)"/) || [])[1]}`))
  },
  {
    ten: 'Ảnh không quá nặng',
    muc: 'canh',
    chay: ({ media }) => media
      .filter((m) => /\.(png|jpe?g|gif|webp)$/i.test(m.f) && m.kb > 400)
      .map((m) => `${m.url} — ${m.kb} KB, nên nén xuống dưới 400 KB` +
                  (m.kb > 1200 ? ' (nặng thế này người đọc 4G phải chờ lâu)' : ''))
  },
  {
    ten: 'Không có ảnh mồ côi trong public/media',
    muc: 'canh',
    chay: ({ trang, media }) => {
      const dung = new Set();
      trang.forEach((t) => [...t.html.matchAll(/(?:src|href|poster)="([^"]+)"/g)]
        .forEach((m) => dung.add(m[1])));
      return media
        .filter((m) => m.url.startsWith('/media/'))
        .filter((m) => ![...dung].some((d) => d.endsWith(m.url)))
        .map((m) => `${m.url} — không bài nào dùng tới, xoá được`);
    }
  },

  /* ── Liên kết ── */
  {
    ten: 'Không có liên kết nội bộ gãy',
    muc: 'loi',
    chay: ({ trang, media, dist }) => {
      const co = (u) => {
        const p = path.join(dist, u.replace(/^\//, ''));
        return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html'));
      };
      const bo = new Set();
      return trang.flatMap((t) =>
        [...t.html.matchAll(/href="(\/[^"#?]*)"/g)]
          .map((m) => m[1])
          .filter((u) => !co(u))
          .filter((u) => { const k = t.url + u; if (bo.has(k)) return false; bo.add(k); return true; })
          .map((u) => `${t.url} → ${u} (không có trong dist/)`));
    }
  },
  {
    ten: 'Liên kết ra ngoài mở tab mới đều có rel chống chiếm cửa sổ',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.than.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)]
        .filter((m) => !/rel="[^"]*noopener/.test(m[0]))
        .map((m) => `${t.url} — thiếu rel="noopener": ${m[0].slice(0, 60)}…`))
  },

  /* ── Tag ── */
  {
    ten: 'Không có tag viết lệch nhau (cùng nghĩa, khác chữ)',
    muc: 'canh',
    chay: ({ dist }) => {
      const f = path.join(dist, 'tags.json');
      if (!fs.existsSync(f)) return [];
      const tag = JSON.parse(fs.readFileSync(f, 'utf8'));
      const nhom = new Map();
      /* Gom theo dạng ĐÃ BỎ DẤU và viết thường: "Tâm Lý", "tâm lý", "tam ly"
         về cùng một nhóm. Nhóm nào hơn một tên là đang bị tách bài ra hai trang. */
      for (const t of tag) {
        const k = boDau(t.ten).toLowerCase().replace(/\s+/g, ' ').trim();
        if (!nhom.has(k)) nhom.set(k, []);
        nhom.get(k).push(`${t.ten} (${t.so} bài)`);
      }
      return [...nhom.values()].filter((v) => v.length > 1)
        .map((v) => `mấy tag này thực ra là một: ${v.join(' · ')} — gộp lại đi`);
    }
  },

  /* ── Cấu hình trước khi lên sóng ── */
  {
    ten: 'site.config.json đã điền địa chỉ thật',
    muc: 'canh',
    chay: ({ cau }) => {
      const r = [];
      if (/example\.com|localhost|vercel\.app$/.test(cau.url)) {
        r.push(`url còn là "${cau.url}" — đổi thành tên miền thật, không thì ` +
               `canonical, ảnh OG và sitemap đều trỏ sai`);
      }
      if (cau.base && !cau.base.startsWith('/')) r.push(`base "${cau.base}" phải bắt đầu bằng /`);
      if (cau.base && cau.base.endsWith('/')) r.push(`base "${cau.base}" không được có / ở cuối`);
      return r;
    }
  },
  {
    ten: 'Có đủ file phụ: robots · sitemap · feed · favicon · chỉ mục tìm kiếm',
    muc: 'loi',
    chay: ({ dist }) => ['robots.txt', 'sitemap.xml', 'feed.xml', 'favicon.svg',
                         'search-index.json', 'tags.json', 'version.json']
      .filter((f) => !fs.existsSync(path.join(dist, f)))
      .map((f) => `thiếu dist/${f}`)
  },
  {
    ten: 'Bản nháp không lọt vào sitemap hay RSS',
    muc: 'loi',
    chay: ({ trang, dist }) => {
      const sm = fs.existsSync(path.join(dist, 'sitemap.xml'))
        ? fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8') : '';
      const rss = fs.existsSync(path.join(dist, 'feed.xml'))
        ? fs.readFileSync(path.join(dist, 'feed.xml'), 'utf8') : '';
      return trang.filter((t) => t.noindex)
        .flatMap((t) => [
          sm.includes(t.url) ? `${t.url} là bản nháp nhưng có trong sitemap.xml` : null,
          rss.includes(t.url) ? `${t.url} là bản nháp nhưng có trong feed.xml` : null
        ].filter(Boolean));
    }
  },

  /* ── CSS ── */
  {
    /* Thiếu một file CSS trong bundle thì KHÔNG có lỗi nào cả — trang vẫn dựng,
       vẫn mở được, chỉ là một mảng giao diện lặng lẽ biến mất. Đã vấp: cả bộ
       liquid glass nằm ngoài bundle suốt một phiên bản mà không ai biết. */
    ten: 'Bundle CSS gộp đủ mọi file trong src/styles/',
    muc: 'loi',
    chay: ({ goc, dist }) => {
      const f = path.join(dist, 'assets', 'style.css');
      if (!fs.existsSync(f)) return ['thiếu dist/assets/style.css'];
      const gop = fs.readFileSync(f, 'utf8');
      const thuMuc = path.join(goc, 'src', 'styles');
      if (!fs.existsSync(thuMuc)) return [];
      return fs.readdirSync(thuMuc)
        .filter((x) => x.endsWith('.css'))
        .filter((x) => !gop.includes(`───────── ${x} ─────────`))
        .map((x) => `src/styles/${x} không có trong bundle — thêm vào mảng ` +
                    `thuTu ở tools/build.mjs (hàm gopCSS)`);
    }
  },
  {
    /* Nút chính là chỗ dễ lọt lỗi tương phản nhất: nền gradient pastel + chữ
       trắng nhìn trên bản thiết kế thì đẹp, nhưng đọc thì không ra chữ. */
    ten: 'Nút chính không dùng chữ trắng trên nền pastel',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'styles', 'components.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');
      const m = css.match(/\.btn\s*\{[^}]*\}/);
      if (!m) return [];
      return /color:\s*(#fff|#ffffff|white|rgb\(255,\s*255,\s*255\))/i.test(m[0])
        ? ['.btn đặt chữ màu trắng — trên nền gradient pastel chỉ đạt ~2:1, đọc không ra']
        : [];
    }
  },

  {
    /* Mục nav trỏ tới trang chưa dựng render thành <span>, không phải <a>.
       Luật CSS nào chỉ nhắm `a.nav-text` sẽ bỏ sót chúng — và ở màn hẹp,
       bốn mục nav không ẩn được sẽ ép tên trang co về 0. */
    ten: 'Luật ẩn nav ở màn hẹp bắt được cả <span> lẫn <a>',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'styles', 'layout.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');
      return /\.nav\s+a\.nav-text\s*\{[^}]*display\s*:\s*none/.test(css)
        ? ['layout.css: luật ẩn nav viết `.nav a.nav-text` — bỏ chữ `a` đi, ' +
           'không thì mục "sắp có" (là <span>) vẫn hiện và đẩy tên trang mất chỗ']
        : [];
    }
  },

  {
    /* Vercel preset "Other" mặc định lấy thư mục `public/` làm nơi chứa trang
       nếu nó tồn tại — mà repo này có public/, trong đó chỉ có ảnh. Không có
       vercel.json trỏ sang dist/ thì deploy xong ra 404, và log build lại hoàn
       toàn sạch nên rất khó đoán ra. */
    ten: 'vercel.json trỏ đúng vào dist/',
    muc: 'canh',
    chay: ({ goc }) => {
      const f = path.join(goc, 'vercel.json');
      if (!fs.existsSync(f)) {
        return ['thiếu vercel.json — Vercel sẽ lấy nhầm thư mục public/ và ra 404 ' +
                '(xem docs/DUA-LEN-MANG.md §3)'];
      }
      let v;
      try { v = JSON.parse(fs.readFileSync(f, 'utf8')); }
      catch (e) { return [`vercel.json đọc không được: ${e.message}`]; }
      const r = [];
      if (v.outputDirectory !== 'dist') {
        r.push(`vercel.json: outputDirectory là "${v.outputDirectory}" — phải là "dist"`);
      }
      if (!v.buildCommand) r.push('vercel.json: thiếu buildCommand "npm run build"');
      return r;
    }
  },

  {
    /* Bản nháp thường là thứ riêng tư nhất trên blog cá nhân. `noindex` chỉ
       bảo Google đừng đánh chỉ mục — file vẫn nằm công khai trên máy chủ, ai
       đoán trúng đường dẫn là đọc được. Nên nó phải KHÔNG có mặt trong dist. */
    ten: 'Bản nháp không lọt vào bản dựng',
    muc: 'loi',
    chay: ({ trang }) => trang
      .filter((t) => t.noindex)
      .map((t) => `${t.url} là bản nháp nhưng vẫn có file trong dist/ — ` +
                  `chạy \`npm run build\` (không kèm --nhap) để dựng bản sạch`)
  },

  /* ── Sổ phiên bản ── */
  {
    ten: 'Sổ phiên bản có ghi bản mới nhất, và có phần tóm tắt cho nó',
    muc: 'canh',
    chay: ({ goc }) => {
      const so = docSo(goc);
      if (so.loi || !so.moiNhat) return [so.loi || 'sổ chưa có dòng nào'];
      const raw = fs.readFileSync(path.join(goc, 'docs', 'LICH-SU.md'), 'utf8');
      return raw.includes(`## ${so.moiNhat.ten} —`)
        ? []
        : [`${so.moiNhat.ten} có trong bảng nhưng chưa có phần tóm tắt "## ${so.moiNhat.ten} — …" ` +
           `ở dưới — viết 3–4 gạch đầu dòng nói cái người đọc thấy khác`];
    }
  },

  /* ── Thân bài ── */
  {
    /* Soi CẢ TRANG, không chỉ trong <article>. Bản đầu cắt lấy đoạn giữa
       <article> và </article> bằng regex, rồi chính một chú thích trong template
       có nhắc chữ "<article>" làm regex bắt nhầm mốc mở — báo lỗi giả ở mọi
       bài. Không dò cấu trúc bằng regex nữa: build đã bỏ sạch chú thích rồi,
       nên bất kỳ dấu <!-- nào còn sót đều là lỗi. */
    ten: 'Không còn chú thích <!-- --> lọt ra HTML',
    muc: 'loi',
    chay: ({ trang }) => trang
      .filter((t) => /<!--/.test(t.html))
      .map((t) => `${t.url} — còn chú thích trong HTML, người đọc xem mã nguồn là thấy`)
  },
  {
    ten: 'Không có đường dẫn còn sót dấu vết máy chạy build',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.html.matchAll(/(?:src|href)="(file:\/\/|[A-Z]:\\|\/home\/|\/Users\/)[^"]*"/g)]
        .map((m) => `${t.url} — đường dẫn máy cá nhân lọt ra HTML: ${m[0].slice(0, 60)}`))
  }
];

/* ══════════════ 3. CHẠY ══════════════ */

console.log(mau.dam('\n  KIỂM ĐỊNH TRƯỚC KHI ĐĂNG\n'));

if (!CO.has('--nhanh')) {
  const r = spawnSync(process.execPath, [path.join(GOC, 'tools', 'build.mjs')],
                      { stdio: ['ignore', 'ignore', 'inherit'] });
  if (r.status !== 0) {
    console.log(mau.do('  ✖ Build hỏng — sửa xong rồi kiểm lại.\n'));
    console.log(mau.mo('    Chạy `npm run build` để xem lỗi chi tiết.\n'));
    process.exit(1);
  }
}
if (!fs.existsSync(DIST)) {
  console.log(mau.do('  ✖ Chưa có dist/ — chạy `npm run build` trước.\n'));
  process.exit(1);
}

const ctx = gomContext();
let soLoi = 0, soCanh = 0;

for (const k of KIEM) {
  let ra;
  try { ra = k.chay(ctx) || []; }
  catch (e) { ra = [`phép kiểm này hỏng: ${e.message}`]; }

  if (!ra.length) {
    console.log(`  ${mau.xanh('✓')} ${mau.mo(k.ten)}`);
    continue;
  }
  const loi = k.muc === 'loi';
  loi ? (soLoi += ra.length) : (soCanh += ra.length);
  console.log(`  ${loi ? mau.do('✖') : mau.vang('⚠')} ${k.ten}`);
  /* Chỉ in 6 dòng đầu: một lỗi lặp trên 200 trang thì in hết là trôi mất
     mọi phép kiểm khác, mà 6 dòng đã đủ để biết phải sửa gì. */
  ra.slice(0, 6).forEach((x) => console.log(`      ${mau.mo('·')} ${x}`));
  if (ra.length > 6) console.log(mau.mo(`      … và ${ra.length - 6} chỗ nữa`));
}

console.log('');
console.log(`  ${mau.mo(`${ctx.trang.length} trang · ${ctx.media.length} file media · ${KIEM.length} phép kiểm`)}`);

if (soLoi) {
  console.log(mau.do(`  ✖ ${soLoi} lỗi` + (soCanh ? ` · ${soCanh} cảnh báo` : '')) +
              mau.mo('   — sửa lỗi đỏ rồi hãy đăng\n'));
  process.exit(1);
}
if (soCanh) {
  console.log(mau.vang(`  ⚠ ${soCanh} cảnh báo`) +
              mau.mo('   — đăng được, nhưng đọc qua một lượt đã\n'));
  process.exit(0);
}
console.log(mau.xanh('  ✓ Sạch. Đăng được.\n'));
