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
    chay: ({ trang }) => {
      /* ── Ô TỰ ĐỊNH CỠ ──
         Mấy ô này cao rộng theo LƯỚI hoặc theo aspect-ratio của chính chúng,
         còn ảnh bên trong nằm tuyệt đối phủ kín bằng object-fit:cover. Tỉ lệ
         tấm ảnh gốc không ảnh hưởng gì tới bố cục nên không có chỗ nhảy chữ.

         Khai `--ar` cho chúng thì vừa thừa vừa SAI: không luật CSS nào đọc
         biến đó ở đây, mà con số ghi ra lại gợi ý rằng ô cao theo tỉ lệ ảnh —
         người sửa sau đọc vào là hiểu nhầm.

         Để thành DANH SÁCH thay vì viết ba nhánh `.filter()` riêng: thêm một ô
         kiểu này về sau chỉ phải thêm một chữ vào đây. */
      const O_TU_CO = ['bo--anh', 'chu-anh', 'yt-facade', 'ba-tam'];

      return trang.flatMap((t) =>
        [...t.than.matchAll(/<img\b[^>]*>/g)]
          .filter((m) => !/--ar:/.test(m[0]) && !/position:absolute/.test(m[0]))
          .filter((m) => {
            /* Ảnh nằm trong một ô tự định cỡ? Soi 160 ký tự HTML ngay trước
               thẻ img — đủ để trùm cái thẻ mở của ô chứa nó. */
            const i = t.than.indexOf(m[0]);
            const truoc = t.than.slice(Math.max(0, i - 160), i);
            return !O_TU_CO.some((c) => truoc.includes(`class="${c}`) ||
                                        truoc.includes(` ${c}"`) ||
                                        truoc.includes(` ${c} `));
          })
          .map((m) => `${t.url} — img thiếu --ar: ${(m[0].match(/src="([^"]*)"/) || [])[1]}`));
    }
  },
  {
    /* Ba biến quầng sáng phải có ở CẢ BA trạng thái theme. Thiếu ở khối nào
       thì đúng khối đó mất quầng — mà người đọc chỉ gặp một khối tại một thời
       điểm, nên lỗi này rất dễ lọt: thử ở theme hệ điều hành thì thấy đẹp, chỉ
       ai bấm nút đổi theme mới gặp bản phẳng lì. */
    ten: 'Quầng sáng khai đủ ở cả ba trạng thái theme',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'styles', 'tokens.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');
      const KHOI = [
        ['theme sáng (:root)', /^:root\{/m],
        ['@media prefers-color-scheme: dark', /prefers-color-scheme: dark/],
        ['[data-theme="dark"]', /:root\[data-theme="dark"\]\{/]
      ];
      const ra = [];
      for (const [ten, re] of KHOI) {
        const i = css.search(re);
        if (i < 0) { ra.push(`tokens.css thiếu hẳn khối ${ten}`); continue; }
        const khoi = css.slice(i, css.indexOf('\n}', i));
        for (const k of ['--glow:', '--glow-manh:', '--chu-bong:']) {
          if (!khoi.includes(k)) ra.push(`tokens.css — khối ${ten} thiếu ${k}`);
        }
      }
      return ra;
    }
  },
  {
    /* `nen` chỉ nhận hai giá trị. Gõ `nen: động` (có dấu) hay `nen: true` thì
       bộ dựng lặng lẽ coi như `tinh` — trang vẫn lên, chỉ là không có nền động
       và không ai biết vì sao. */
    ten: 'Front matter `nen` chỉ nhận tinh hoặc dong, và đặt đúng chỗ',
    muc: 'canh',
    chay: ({ goc }) => {
      /* SOI CẢ content/, KHÔNG RIÊNG content/pages/.
         Bản đầu chỉ soi pages, vì lúc ấy chỉ trang tĩnh mới có nền động. Nhưng
         người viết đâu biết ranh giới đó: gõ `nen: dong` vào một bài viết là
         việc hợp lý hoàn toàn, và nó lặng lẽ không có tác dụng gì. Phép kiểm
         chỉ soi đúng chỗ mình đã nghĩ tới thì nó canh cho chính mình, không
         canh cho người dùng. */
      const thu = path.join(goc, 'content');
      if (!fs.existsSync(thu)) return [];
      const O_PAGES = path.join('content', 'pages');
      return quet(thu, (x) => x.endsWith('.md')).flatMap((f) => {
        const raw = fs.readFileSync(f, 'utf8');
        const m = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!m) return [];
        const v = (m[1].match(/^nen:[ \t]*(.+)$/m) || [])[1];
        if (!v) return [];
        const g = v.trim().toLowerCase();
        const ten = path.relative(goc, f);
        if (g !== 'tinh' && g !== 'dong') {
          return [`${ten} — \`nen: ${v.trim()}\` không có; chỉ nhận \`tinh\` hoặc \`dong\``];
        }
        /* Giá trị đúng nhưng đặt sai chỗ cũng là im lặng không tác dụng. */
        if (!f.includes(O_PAGES)) {
          return [`${ten} — \`nen\` chỉ có tác dụng ở content/pages/; ở bài viết nó bị bỏ qua`];
        }
        return [];
      });
    }
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
    /* ── MỌI FILE src/js/ PHẢI LÊN dist/assets/ VÀ PHẢI ĐỌC ĐƯỢC CÚ PHÁP ──
       build chép JS theo một DANH SÁCH GÕ TAY. Thêm một file vào src/js/ mà
       quên thêm tên vào danh sách thì KHÔNG có lỗi nào cả: build chạy xong,
       trang mở được, chỉ là tính năng ấy không bao giờ chạy. Đúng hạng lỗi đã
       vấp một lần với bundle CSS — và hạng lỗi đó chỉ lộ ra khi có người hỏi
       'ơ sao cái này không hoạt động', tức là muộn nhất có thể.

       Vế thứ hai bắt hạng lỗi khác: file có mặt nhưng gõ sai cú pháp. Trình
       duyệt bỏ nguyên file, tính năng biến mất, và chỗ báo lỗi là console của
       NGƯỜI ĐỌC — máy mình thì im. */
    ten: 'Mọi file src/js/ đều lên dist/assets/ và đọc được cú pháp',
    muc: 'loi',
    chay: ({ goc, dist }) => {
      const thu = path.join(goc, 'src', 'js');
      if (!fs.existsSync(thu)) return [];
      const ra = [];
      for (const x of fs.readdirSync(thu).filter((n) => n.endsWith('.js'))) {
        const ich = path.join(dist, 'assets', x);
        if (!fs.existsSync(ich)) {
          ra.push(`src/js/${x} không được chép sang dist/assets/ — thêm tên file ` +
                  `vào danh sách JS trong tools/build.mjs`);
          continue;
        }
        /* Soi cú pháp file NGUỒN, không soi bản đã chép: bản chép chỉ đúng
           khi vừa build xong, mà `npm run kiem -- --nhanh` thì không build.
           Soi bản chép trong chế độ ấy là đọc file cũ rồi báo tên file mới. */
        const r = spawnSync(process.execPath, ['--check', path.join(thu, x)],
                            { stdio: 'pipe' });
        if (r.status !== 0) {
          const dong = String(r.stderr).split('\n').find((d) => /Error/.test(d));
          ra.push(`src/js/${x} hỏng cú pháp: ${dong || 'chạy `node --check` để xem'}`);
        }
      }
      return ra;
    }
  },

  {
    /* ── NHÃN GIAO DIỆN GỬI QUA ATTRIBUTE PHẢI PARSE ĐƯỢC ──
       Mấy khối JS dựng giao diện (bình luận, sổ lịch sử, tìm kiếm) nhận chữ
       hiển thị từ HTML qua một attribute chứa JSON, thay vì gõ cứng chữ vào
       file .js. Escape sai một dấu nháy là `JSON.parse` ném lỗi ngay dòng đầu,
       và CẢ KHỐI giao diện đó không dựng: khung bình luận trắng trơn, không
       báo gì, HTML thì vẫn hợp lệ nên không phép kiểm nào khác thấy.

       CHỖ NÓ KHÔNG VỚI TỚI: nếu escape hỏng tới mức lọt một dấu nháy kép TRẦN
       vào giữa attribute thì attribute bị đứt sớm, chuỗi không còn khớp khuôn
       dưới đây và phép kiểm lặng lẽ bỏ qua. Biết để không tin nó quá mức —
       nhưng hạng lỗi ấy thì trình duyệt cũng hỏng ngay ở tầng HTML, dễ thấy
       hơn nhiều so với JSON sai âm thầm. */
    ten: 'Nhãn giao diện nhúng trong attribute đều là JSON hợp lệ',
    muc: 'loi',
    chay: ({ trang }) => {
      /* Giải mã thực thể HTML. `&amp;` phải làm SAU CÙNG: làm trước thì
         `&amp;quot;` biến thành `&quot;` rồi bị giải tiếp thành dấu nháy — tự
         mình sinh ra JSON hỏng rồi báo lỗi giả. */
      const go = (x) => x.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return trang.flatMap((t) =>
        [...t.html.matchAll(/data-([a-z-]+)="(\{&quot;[^"]*\})"/g)]
          .flatMap((m) => {
            try { JSON.parse(go(m[2])); return []; }
            catch (e) { return [`${t.url} — data-${m[1]} không parse được: ${e.message}`]; }
          }));
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
    ten: 'Bản nháp không lọt vào bản dựng, sitemap hay RSS',
    muc: 'loi',
    chay: ({ trang, dist }) => {
      /* TRƯỚC ĐÂY LÀ HAI PHÉP KIỂM. Cái thứ hai soi sitemap.xml và feed.xml.
         Nó không bao giờ chạy được: sitemap và feed dựng ra TỪ CHÍNH danh sách
         trang trong dist, nên nháp chỉ lọt vào sitemap khi nó đã lọt vào dist —
         mà lúc đó phép kiểm này đã báo đỏ rồi. Hai dòng xanh cho một việc là tự
         dối mình. Gộp lại, và khi báo thì nói luôn nháp đang lộ ở những đâu. */
      const doc = (f) => fs.existsSync(path.join(dist, f))
        ? fs.readFileSync(path.join(dist, f), 'utf8') : '';
      const sm = doc('sitemap.xml'), rss = doc('feed.xml');
      return trang.filter((t) => t.noindex).map((t) => {
        const them = [sm.includes(t.url) && 'sitemap.xml',
                      rss.includes(t.url) && 'feed.xml'].filter(Boolean);
        return `${t.url} là bản nháp nhưng vẫn có file trong dist/` +
               (them.length ? ` — lọt cả vào ${them.join(' + ')}` : '') +
               ` — chạy \`npm run build\` (không kèm --nhap) để dựng bản sạch`;
      });
    }
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
    /* Soi luôn khối `speculationrules`: nó cũng là JSON trong thẻ script, cũng
       hỏng lặng lẽ (trình duyệt bỏ qua khối sai cú pháp mà không báo gì), và
       hậu quả cũng là một tính năng biến mất không dấu vết. */
    ten: 'Khối JSON trong thẻ script đọc được (JSON-LD · speculation rules)',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.html.matchAll(/<script type="(?:application\/ld\+json|speculationrules)">([\s\S]*?)<\/script>/g)]
        .flatMap((m) => {
          try { JSON.parse(m[1]); return []; }
          catch (e) { return [`${t.url} — khối JSON hỏng cú pháp: ${e.message}`]; }
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

  {
    /* ── ĐUÔI BẢN VÁ CHỈ CHẠY 00..09 ──
       Quy ước Vxx.yy có đúng hai chữ số mỗi vế, và vế sau dừng ở 09. Bộ ghi sổ
       bản đầu không có cái chặn ấy nên cứ cộng dồn: sổ đã đi tới V1.14 rồi mới
       có người nhận ra. Sửa tay thì lần sau lặp lại y hệt, nên luật phải có chỗ
       canh. Phép kiểm này canh CẢ SỔ, không riêng dòng mới — dòng cũ sai thì
       cái tem ở chân trang cũng sai theo.

       Kiểm luôn cột `#`: theo quy ước nó bằng đúng số bản vá của dòng đó. Lệch
       là có người sửa bảng bằng tay. */
    ten: 'Số phiên bản đúng luật: đuôi 00–09, cột # khớp đuôi',
    muc: 'loi',
    chay: ({ goc }) => {
      const so = docSo(goc);
      if (so.loi || !so.ban.length) return [];
      const ra = [];
      for (const b of so.ban) {
        if (b.va > 9) {
          ra.push(`${b.ten} — đuôi bản vá chỉ chạy 00..09; sau V${b.build}.09 là ` +
                  `V${b.build + 1}.00, không phải ${b.ten}`);
        }
        if (/^\d+$/.test(b.so) && +b.so !== b.va) {
          ra.push(`${b.ten} — cột # ghi ${b.so} nhưng đuôi là ${String(b.va).padStart(2, '0')}`);
        }
      }
      return ra;
    }
  },
  {
    /* Bật đếm lượt xem mà thiếu hàm thì trang gọi một địa chỉ không tồn tại:
       mỗi lượt mở bài là một lỗi 404 trong console của NGƯỜI ĐỌC, còn con số
       thì không bao giờ hiện. Trang vẫn đọc được nên không ai báo. */
    ten: 'Bật đếm lượt xem thì phải có hàm /api/xem',
    muc: 'loi',
    chay: ({ cau, goc, trang }) => {
      if (!(cau.luotXem || {}).bat) return [];
      const ra = [];
      if (!fs.existsSync(path.join(goc, 'functions', 'api', 'xem.js'))) {
        ra.push('site.config.json bật luotXem nhưng thiếu functions/api/xem.js');
      }
      const bai = trang.filter((t) => /class="post-layout/.test(t.html));
      const thieu = bai.filter((t) => !t.html.includes('data-xem='));
      if (bai.length && thieu.length) {
        ra.push(`${thieu.length} trang bài không có ô lượt xem, ví dụ ${thieu[0].url}`);
      }
      return ra;
    }
  },
  {
    /* Bật đo lượt xem mà quên dán token thì KHÔNG có lỗi nào cả: script vẫn
       được chèn, vẫn tải về, và lặng lẽ không ghi được lượt nào. Chủ trang chỉ
       phát hiện ra sau vài tuần khi mở bảng thống kê và thấy số 0. */
    ten: 'Bật đo lượt xem thì phải có token',
    muc: 'loi',
    chay: ({ cau, trang }) => {
      const c = cau.phanTich || {};
      const ra = [];
      if (c.bat && !String(c.token || '').trim()) {
        ra.push('site.config.json: phanTich.bat = true nhưng token rỗng — ' +
                'lấy token ở Cloudflare Dashboard → Web Analytics → Add a site');
      }
      /* Bật thật thì script phải có mặt trên MỌI trang, không riêng trang chủ. */
      if (c.bat && String(c.token || '').trim()) {
        const thieu = trang.filter((t) => !t.html.includes('data-cf-beacon'));
        if (thieu.length) ra.push(`${thieu.length} trang không có mã đo lượt xem, ` +
                                  `ví dụ ${thieu[0].url}`);
      }
      return ra;
    }
  },
  {
    /* ── BÀI NÀO CŨNG PHẢI CÓ MỤC LỤC ──
       Không phải vì mục lục tiện — vì BỐ CỤC. Lưới trang bài khai sẵn một cột
       cho mục lục; bài không có tiêu đề mục nào thì cột ấy trống và khung chữ
       nằm lệch hẳn về trái giữa một khoảng rộng vô chủ.

       Cảnh báo chứ không chặn: bài rất ngắn không có mục nào là hợp lý, và
       chặn thì người viết phải bịa ra tiêu đề mục cho đủ luật. */
    ten: 'Bài nào cũng có ít nhất một tiêu đề mục (để dựng mục lục)',
    muc: 'canh',
    chay: ({ trang }) => trang
      /* Nhận trang BÀI bằng dấu hiệu của chính nó, không đoán theo đường dẫn.
         Đoán theo đường dẫn thì `/posts/doi-thuong/ha-noi/` — một chuyên mục
         lồng hai tầng — trông y hệt một bài và bị bắt oan. */
      .filter((t) => /class="post-layout/.test(t.html))
      /* Khung C (bài ảnh ngắn) CỐ Ý không có mục lục: bài chỉ vài đoạn, và cột
         bên phải đã dành cho chữ chứ không bỏ trống. Lý do của phép kiểm này là
         cột trống, mà khung C thì không có cột trống nào. */
      .filter((t) => !/class="post-layout[^"]*khung-c/.test(t.html))
      .filter((t) => !/<nav class="toc"|id="muc-luc"|class="[^"]*toc/.test(t.html))
      .map((t) => `${t.url} — không có tiêu đề mục nào, nên trang bài thiếu ` +
                  `mục lục và cột bên phải bỏ trống. Thêm vài dòng \`## \` vào bài.`)
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
    /* ── TỪ "BORDERLAND" LẤN RA NGOÀI CỘT TỐI ĐA NỬA CHỮ CUỐI ──
       Màn đầu trang chủ đặt cỡ chữ bằng `cqw` — phần trăm bề ngang khung bao.
       Chữ thì không có `overflow` nào chặn, nên đặt cỡ quá tay là từ ấy cứ thò
       ra ngoài khung và chui xuống dưới khung danh sách bên phải.

       Lấn MỘT CHÚT là cố ý: chữ đầu khuất một phần ba sau đường kẻ trái, chữ
       cuối khuất một nửa sau đường kẻ phải, khối chữ đọc ra là được đặt vào
       khuôn rồi khuôn xén bớt. Lấn NHIỀU là lỗi: đã vấp thật với --s3:26cqw —
       từ dài 914px trong cột rộng 712px, mất hẳn hai chữ cuối, trên màn hình
       đọc ra là "Borderl". Ranh giới giữa hai thứ đó là NỬA CHỮ CUỐI, và đây
       là phép kiểm canh đúng ranh giới ấy.

       Bề ngang tính được, không phải ước lượng. Đo trong trình duyệt ở phông
       Cormorant nghiêng: cả từ "Borderland" chiếm 4,72 lần cỡ chữ (chưa tính
       giãn), riêng chữ "d" cuối chiếm 0,538 lần. `letter-spacing` cộng một
       nhịp sau MỖI chữ cái, kể cả chữ cuối, nên là 10 nhịp.

           lấn ra = lùi + 4,72 + 10 × giãn − 100cqw/cỡ
           cho phép ≤ nửa chữ "d" = 0,538 ÷ 2

       Đổi phông thì hai con số đo được kia sai, và phép kiểm này sai theo —
       nên chúng nằm ngay đây thành hằng có tên chứ không rải trong công thức. */
    ten: 'Từ cuối ở màn đầu lấn ra ngoài cột không quá nửa chữ',
    muc: 'loi',
    chay: () => {
      const f = path.join(GOC, 'src', 'styles', 'list.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');
      const BE_NGANG_TU  = 4.72;    /* "Borderland" / cỡ chữ, đo thật */
      const BE_NGANG_D   = 0.538;   /* riêng chữ "d" cuối / cỡ chữ */
      const SO_CHU       = 10;
      const LAN_TOI_DA   = BE_NGANG_D / 2;

      /* Mỗi chỗ khai đủ bộ ba --s3/--x3/--ls3 là MỘT trạng thái (nghỉ, hiện đủ,
         bản cho máy không có chuột). Kiểm hết, không chỉ cái đầu. */
      const bo = [...css.matchAll(
        /--s3:\s*([\d.]+)cqw;\s*--x3:\s*([\d.-]+)em;\s*--ls3:\s*([\d.-]+)em/g)];
      if (!bo.length) return ['list.css không còn khai --s3/--x3/--ls3 — phép kiểm này hết bám được vào đâu'];

      const ra = [];
      for (const m of bo) {
        const [s3, x3, ls3] = [+m[1], +m[2], +m[3]];
        /* Quy hết về ĐƠN VỊ CỠ CHỮ: bề ngang cột = 100cqw, mà cỡ chữ = s3 cqw,
           nên cột rộng 100/s3 lần cỡ chữ. */
        const cot = 100 / s3;
        const tu  = x3 + BE_NGANG_TU + SO_CHU * ls3;
        const lan = tu - cot;
        if (lan > LAN_TOI_DA + 0.005) {          /* .005 là dung sai làm tròn */
          ra.push(`--s3:${s3}cqw · --x3:${x3}em · --ls3:${ls3}em → lấn ra ngoài cột ` +
                  `${Math.round(lan * 100)}% cỡ chữ, quá nửa chữ cuối (${Math.round(LAN_TOI_DA * 100)}%)`);
        }
      }
      return ra;
    }
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
