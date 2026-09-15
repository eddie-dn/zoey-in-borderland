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
import { docNguon } from './lib/doc-nguon.mjs';
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
        .filter((m) => {
          /* Ảnh chân dung trong ô .bo--anh cũng vậy: ô đó do LƯỚI quyết định
             kích thước, ảnh nằm tuyệt đối phủ kín bằng object-fit:cover. Tỉ lệ
             tấm ảnh gốc không ảnh hưởng gì tới bố cục nên không có chỗ nhảy chữ.

             Khai --ar cho nó thì vừa thừa vừa SAI: không luật CSS nào đọc biến
             đó ở đây, mà số ghi ra lại gợi ý rằng ô này cao theo tỉ lệ ảnh —
             người sửa sau đọc vào là hiểu nhầm. Miễn cho nó ở đây, và nói rõ
             vì sao, đúng hơn là nhét một con số cho phép kiểm im mồm. */
          const i = t.than.indexOf(m[0]);
          return !/class="bo bo--anh[^"]*"[^>]*>\s*$/.test(t.than.slice(Math.max(0, i - 120), i));
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
      if (/example\.com|localhost|vercel\.app$|pages\.dev$/.test(cau.url)) {
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
       liquid glass nằm ngoài bundle suốt một phiên bản mà không ai biết.

       Dò bằng NỘI DUNG THẬT, không bằng dòng chú thích mốc. Bản trước tìm chuỗi
       `───────── tên.css ─────────` mà build chèn vào giữa các file; tới lúc
       build bắt đầu cắt chú thích khi xuất ra thì mọi mốc biến mất và phép kiểm
       này báo đỏ toàn bộ tám file, dù CSS vẫn nằm đủ trong bundle.

       Bài học: phép kiểm không được bám vào thứ chỉ có mặt để cho người đọc. */
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
        .filter((x) => {
          /* Dò bằng DÒNG SELECTOR, không bằng dòng khai báo.

             Bản trước lấy bất kỳ dòng nào có `:` hoặc `{`. Hỏng ngay: một dòng
             như `font-size:var(--fs-h1);font-style:italic;` là khai báo chung,
             file CSS nào cũng có thể có y hệt. Thử bỏ list.css ra khỏi bundle
             thì phép kiểm vẫn báo xanh, vì nó bắt trúng một dòng khai báo của
             file khác. Tên selector (`.ds-luoi{`, `.chip-hang{`) mới là thứ
             riêng của từng file. */
          const src = fs.readFileSync(path.join(thuMuc, x), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '');
          const sel = src.split('\n')
            .map((d) => d.trim())
            /* Dòng mở một khối luật, và có ít nhất một selector dạng .class
               hoặc #id — đủ đặc trưng để không đụng file khác. */
            .filter((d) => /\{\s*$|\{.+\}$/.test(d) && /^[.#][\w-]/.test(d))
            .slice(0, 8);
          if (!sel.length) return false;            /* file không có selector riêng */
          return !sel.some((d) => gop.includes(d));
        })
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
    /* Cloudflare Pages đọc luật header từ một file tên `_headers` nằm ở GỐC
       THƯ MỤC XUẤT BẢN — tức là trong `dist/`, không phải gốc repo. Để nhầm
       chỗ thì nó im lặng không có tác dụng gì: trang vẫn lên, ảnh vẫn hiện,
       chỉ là mỗi lần tải lại tải lại từ đầu. Không có lỗi nào để mà thấy.

       Nó nằm ở `public/_headers` trong repo và được build chép sang. */
    ten: 'Cloudflare `_headers` có mặt trong dist/ và đặt cache cho media',
    muc: 'canh',
    chay: ({ goc }) => {
      const f = path.join(DIST, '_headers');
      if (!fs.existsSync(f)) {
        return ['thiếu dist/_headers — Cloudflare sẽ không đặt cache cho ảnh ' +
                '(file gốc phải nằm ở public/_headers; xem docs/DUA-LEN-MANG.md)'];
      }
      const t = fs.readFileSync(f, 'utf8');
      const r = [];
      if (!/^\/media\/\*/m.test(t)) r.push('dist/_headers: chưa có luật cho /media/*');
      if (!/^\/assets\/\*/m.test(t)) r.push('dist/_headers: chưa có luật cho /assets/*');
      /* Đây là chỗ dễ sai nhất và hậu quả nặng nhất: đặt cache dài cho assets
         thì sửa CSS xong người đọc cũ vẫn thấy giao diện cũ hàng tháng trời. */
      const kAssets = (t.match(/^\/assets\/\*[\s\S]*?(?=^\/|\Z)/m) || [''])[0];
      if (/max-age=\s*([1-9]\d{3,})/.test(kAssets)) {
        r.push('dist/_headers: /assets/* đang đặt cache dài — tên file không có ' +
               'vân tay nội dung nên sửa giao diện xong người đọc cũ vẫn thấy bản cũ');
      }
      return r;
    }
  },

  {
    /* ── BỘ ĐỌC NGUỒN QUOTE CÓ THẬT SỰ ĐỌC ĐƯỢC KHÔNG ──
       `docNguon` cố ý DỄ TÍNH: mục nào đọc không ra thì lặng lẽ lấy bản dự
       phòng cho mục đó. Tính dễ tính ấy giữ cho trang không bao giờ sập —
       nhưng nó cũng nuốt luôn lỗi gõ nhầm. Đổi `### Chủ đề` thành `### Chu de`
       hay `## Chủ đề` là cả danh sách 8 chủ đề biến mất, còn đúng một chủ đề
       dự phòng, và KHÔNG CÓ GÌ BÁO: trang vẫn chạy, quote vẫn ra, chỉ là mỗi
       ngày đều một chủ đề.

       (Phép kiểm đời đầu ở chỗ này so bản nướng `_nguon.js` với file .md để
       bắt "nướng lệch". Vô dụng: `npm run kiem` dựng lại trước khi kiểm, nên
       bản nướng lúc nào cũng vừa mới sinh ra. Thử cắm lỗi vào thì nó vẫn báo
       xanh. Bỏ đi, kiểm cái hỏng được thật.) */
    ten: 'content/quote-nguon.md đọc ra đủ bốn mục',
    muc: 'canh',
    chay: ({ goc }) => {
      const k = docNguon(goc);
      const r = [];
      if (k.thieuFile) return ['thiếu content/quote-nguon.md'];
      if (k.loi) return [`content/quote-nguon.md: ${k.loi}`];
      /* Mấy con số này là cỡ của bản dự phòng trong doc-nguon.mjs. Chạm sàn
         nghĩa là mục tương ứng không đọc ra được gì. */
      if (k.chuDe.length <= 1) r.push('content/quote-nguon.md: không đọc ra `### Chủ đề` — kiểm lại dòng tiêu đề');
      if (k.nguon.length <= 3) r.push('content/quote-nguon.md: không đọc ra `### Nguồn` — kiểm lại dòng tiêu đề');
      if (!k.nhac)             r.push('content/quote-nguon.md: không đọc ra `### Lời dặn` — lớp Gemini sẽ không chạy');
      if (k.san.length <= 1)   r.push('content/quote-nguon.md: không đọc ra `### Câu sẵn` — ô trích dẫn chỉ còn một câu');
      if (k.nhac && !/\{\{chuDe\}\}/.test(k.nhac)) {
        r.push('content/quote-nguon.md: `### Lời dặn` thiếu {{chuDe}} — bốc chủ đề xong không gửi đi đâu cả');
      }
      if (k.nhac && !/\{\{nguon\}\}/.test(k.nhac)) {
        r.push('content/quote-nguon.md: `### Lời dặn` thiếu {{nguon}} — bốc tác giả xong không gửi đi đâu cả');
      }
      return r;
    }
  },

  {
    /* Hàm Cloudflare `import` bản nướng này; thiếu nó là hàm không build được.
       Nó ĐƯỢC COMMIT chứ không gitignore, nên phải có mặt trong repo. */
    ten: 'functions/api/_nguon.js có mặt và nạp được',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'functions', 'api', '_nguon.js');
      if (!fs.existsSync(f)) {
        return ['thiếu functions/api/_nguon.js — chạy `npm run build` rồi commit file đó'];
      }
      const t = fs.readFileSync(f, 'utf8');
      if (!/^export default/m.test(t)) {
        return ['functions/api/_nguon.js không có `export default` — Workers chỉ chạy ESM'];
      }
      try { JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); }
      catch (e) { return [`functions/api/_nguon.js hỏng cú pháp: ${e.message}`]; }
      return [];
    }
  },

  {
    /* Workers KHÔNG phải Node. Bốn thứ dưới đây chạy ngon ở máy mình nhưng
       chết ngay khi deploy, và lỗi chỉ hiện trong log Cloudflare chứ trang
       thì cứ im lặng trả về hỏng. Bắt sớm ở đây rẻ hơn nhiều. */
    ten: 'Hàm trong functions/ không dùng thứ Workers không có',
    muc: 'loi',
    chay: ({ goc }) => {
      const thu = path.join(goc, 'functions');
      if (!fs.existsSync(thu)) return [];
      const ra = [];
      const di = (d) => {
        for (const x of fs.readdirSync(d, { withFileTypes: true })) {
          const f = path.join(d, x.name);
          if (x.isDirectory()) { di(f); continue; }
          if (!/\.(js|mjs|ts)$/.test(x.name)) continue;
          const t = fs.readFileSync(f, 'utf8');
          const ten = path.relative(goc, f);
          /* Bỏ chú thích trước khi dò, không thì chính mấy dòng giải thích
             "Workers không có process.env" lại bị báo là lỗi. */
          const ma = t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
          if (/\bprocess\.env\b/.test(ma)) {
            ra.push(`${ten} — dùng process.env; trên Workers phải lấy từ tham số env của onRequest`);
          }
          if (/require\(|module\.exports/.test(ma)) {
            ra.push(`${ten} — dùng CommonJS; Workers chỉ chạy ESM (import/export)`);
          }
          if (/from\s+['"]node:|require\(['"]fs['"]\)|\bfs\.(readFile|existsSync)/.test(ma)) {
            ra.push(`${ten} — đọc file hoặc gọi module node:; Workers không có đĩa`);
          }
          if (/export\s+default\s+(async\s+)?function\s+handler/.test(ma)) {
            ra.push(`${ten} — còn kiểu handler của Vercel; Cloudflare tìm hàm tên onRequest`);
          }
        }
      };
      di(thu);
      return ra;
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

  /* ── SEO ── */
  {
    /* Facebook, Zalo và Twitter KHÔNG đọc được SVG làm ảnh chia sẻ. Ảnh bìa
       để .svg thì trang vẫn đẹp, nhưng mọi link chia sẻ ra một ô trắng — và
       chỉ phát hiện ra khi đã bấm gửi cho ai đó rồi. */
    ten: 'Ảnh chia sẻ không phải SVG, và là địa chỉ tuyệt đối',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) => {
      const r = [];
      const u = t.ogImage || '';
      if (/\.svgx?($|\?)/i.test(u)) {
        r.push(`${t.url} — og:image là SVG (${u.split('/').pop()}). ` +
               `Facebook/Zalo không đọc được. Đổi cover sang .jpg hoặc .png`);
      }
      if (u && !/^https?:\/\//i.test(u)) {
        r.push(`${t.url} — og:image không phải địa chỉ tuyệt đối: ${u}`);
      }
      return r;
    })
  },
  {
    ten: 'Khối dữ liệu có cấu trúc (JSON-LD) đọc được',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .flatMap((m) => {
          try { JSON.parse(m[1]); return []; }
          catch (e) { return [`${t.url} — JSON-LD hỏng cú pháp: ${e.message}`]; }
        }))
  },
  {
    /* Google cắt tiêu đề ở khoảng 60 ký tự trên máy tính. Dài hơn thì phần
       đuôi thành "…" — mà phần đuôi của mình là tên blog, nên mất luôn. */
    ten: 'Tiêu đề trang không dài quá chỗ Google hiển thị',
    muc: 'canh',
    chay: ({ trang }) => trang
      .filter((t) => (t.title || '').length > 65)
      .map((t) => `${t.url} — tiêu đề ${t.title.length} ký tự, Google cắt ở ~60`)
  },
  {
    ten: 'sitemap.xml có lastmod cho mọi trang',
    muc: 'canh',
    chay: ({ dist }) => {
      const f = path.join(dist, 'sitemap.xml');
      if (!fs.existsSync(f)) return [];
      const xml = fs.readFileSync(f, 'utf8');
      const loc = (xml.match(/<loc>/g) || []).length;
      const mod = (xml.match(/<lastmod>/g) || []).length;
      return loc === mod ? []
        : [`sitemap.xml: ${loc} trang nhưng chỉ ${mod} có lastmod`];
    }
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
  },
  {
    /* ── Ô BENTO NÀO CŨNG PHẢI CÓ TÊN TRONG LUẬT GỘP CỘT Ở MOBILE ──
       Lưới bento khoá cứng vị trí từng ô bằng `grid-column`. Dưới 860px lưới
       rút về một cột, và có một luật liệt kê tên từng ô để kéo chúng về cột 1.
       Ô nào KHÔNG có tên trong danh sách đó thì ở lại cột cũ — trình duyệt
       phải đẻ thêm cột ngầm cho đủ chỗ, mỗi ô teo lại còn mấy chục pixel và
       trang tràn ngang.

       Đã vấp thật khi thêm ô ảnh chân dung: trang tràn 402px trên màn 390px,
       CSS không báo lỗi gì cả. Phép kiểm này đọc thẳng file .css nên bắt được
       ngay lúc build, không phải đợi chụp ảnh màn hình mới thấy. */
    ten: 'Ô bento nào cũng được kéo về một cột ở khổ hẹp',
    muc: 'loi',
    chay: () => {
      const f = path.join(GOC, 'src', 'styles', 'about.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');

      /* Mọi ô có khai grid-column ở phần desktop (ngoài @media) */
      const ngoai = css.split('@media')[0];
      const o = new Set();
      for (const m of ngoai.matchAll(/\.(bo--[\w-]+|bo-dai)\s*\{[^}]*grid-column/g)) o.add(m[1]);

      /* Danh sách được kéo về cột 1 trong khối @media hẹp */
      const kh = css.match(/@media\s*\(max-width:\s*860px\)\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*2/);
      const ten = new Set();
      if (kh) for (const m of kh[0].matchAll(/\.(bo--[\w-]+|bo-dai)/g)) ten.add(m[1]);

      return [...o].filter((x) => !ten.has(x)).map((x) =>
        `src/styles/about.css — ô .${x} có grid-column nhưng không nằm trong luật ` +
        `gộp về một cột ở @media (max-width:860px) ⇒ trang sẽ tràn ngang trên điện thoại`);
    }
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
