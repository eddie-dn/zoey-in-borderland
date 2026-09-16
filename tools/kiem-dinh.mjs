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
    /* Ba biến quầng sáng phải có ở MỌI khối theme. Thiếu ở khối nào thì đúng
       khối đó mất quầng — mà người đọc chỉ gặp một khối tại một thời điểm, nên
       lỗi này rất dễ lọt: thử ở theme hệ điều hành thì thấy đẹp, chỉ ai bấm
       nút đổi theme mới gặp bản phẳng lì.

       ── PHÉP KIỂM NÀY TỪNG XANH MÀ KHÔNG KIỂM GÌ CẢ ──
       Bản trước dò khối bằng `css.search(/prefers-color-scheme: dark/)` rồi
       cắt tới `indexOf('\n}')` đầu tiên. Hai chỗ sai chồng nhau:
         · tokens.css viết `(prefers-color-scheme:dark)` KHÔNG có dấu cách, nên
           thứ khớp được lại là dòng CHÚ THÍCH ở đầu file;
         · từ chú thích đó cắt tới `\n}` đầu tiên thì lấy trúng trọn khối
           :root sáng — vốn khai đủ cả ba biến.
       Tức là nó đọc nhầm khối, tìm thấy đủ, và báo xanh. Xoá sạch `--glow` ra
       khỏi cả hai khối tối thì nó VẪN xanh. Đã cắm lỗi vào thử đúng như vậy
       trước khi viết lại.

       Bản này dò bằng chính dòng mở khối rồi ĐẾM NGOẶC để lấy đúng thân của
       nó, nên không cắt nhầm sang khối bên cạnh được nữa. */
    ten: 'Quầng sáng khai đủ ở mọi khối theme',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'styles', 'tokens.css');
      if (!fs.existsSync(f)) return [];
      /* Bỏ chú thích TRƯỚC khi dò: chú thích trong file này có nhắc lại nguyên
         văn mấy dòng selector để giải thích, và đó chính là thứ đã lừa được
         bản trước. */
      const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const KHOI = [
        ['theme sáng (:root)',            /^:root\{/m],
        ['@media prefers-color-scheme',   /@media\s*\(prefers-color-scheme\s*:\s*dark\)/],
        ['[data-theme="dark"]',           /:root\[data-theme="dark"\]\s*\{/],
        ['[data-theme="calm"]',           /:root\[data-theme="calm"\]\s*\{/]
      ];
      const ra = [];
      for (const [ten, re] of KHOI) {
        const i = css.search(re);
        if (i < 0) { ra.push(`tokens.css thiếu hẳn khối ${ten}`); continue; }
        /* Đếm ngoặc từ dấu `{` đầu tiên sau chỗ khớp. Khối @media lồng một
           khối con bên trong, nên cắt tới `}` đầu tiên là hụt mất cả thân. */
        const mo = css.indexOf('{', i);
        let sau = 0, het = mo;
        for (let j = mo; j < css.length; j++) {
          if (css[j] === '{') sau++;
          else if (css[j] === '}' && --sau === 0) { het = j; break; }
        }
        const than = css.slice(mo, het);
        for (const k of ['--glow:', '--glow-manh:', '--chu-bong:']) {
          if (!than.includes(k)) ra.push(`tokens.css — khối ${ten} thiếu ${k}`);
        }
      }
      return ra;
    }
  },
  {
    /* LUẬT CỨNG của tokens.css, bản tổng quát: không biến màu nào được phép
       chỉ tồn tại ở MỘT theme.

       Phép kiểm ngay trên chỉ soi ba biến quầng sáng, vì hồi hai theme thì ba
       biến đó là chỗ duy nhất từng vấp. Có theme thứ ba rồi thì cách vấp không
       còn đếm được nữa: mỗi lần thêm một màu vào Galaxy mà quên Tĩnh lặng là
       một biến rơi ngược về giá trị Sakura, và nó rơi ÂM THẦM — CSS không báo
       lỗi biến thiếu, nó chỉ lấy giá trị kế thừa gần nhất. Trang vẫn lên, chỉ
       là sai màu ở đúng một theme mà người sửa không mở ra xem. */
    ten: 'Galaxy và Tĩnh lặng khai cùng một bộ biến',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'styles', 'tokens.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

      const than = (re) => {
        const i = css.search(re);
        if (i < 0) return null;
        const mo = css.indexOf('{', i);
        let sau = 0;
        for (let j = mo; j < css.length; j++) {
          if (css[j] === '{') sau++;
          else if (css[j] === '}' && --sau === 0) return css.slice(mo, j);
        }
        return null;
      };
      const bien = (t) => new Set([...t.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));

      const toi  = than(/:root\[data-theme="dark"\]\s*\{/);
      const tinh = than(/:root\[data-theme="calm"\]\s*\{/);
      if (!toi || !tinh) return ['tokens.css thiếu khối [data-theme="dark"] hoặc [data-theme="calm"]'];

      /* --raw-* là chú thích chạy được, mỗi theme đặt tên màu gốc của riêng nó
         (raw-orchid bên Sakura, raw-suoi bên Tĩnh lặng). Component không được
         phép đọc chúng nên chúng không cần khớp nhau. */
      const bo = (s) => new Set([...s].filter((k) => !k.startsWith('--raw-')));
      const a = bo(bien(toi)), b = bo(bien(tinh));

      const ra = [];
      for (const k of a) if (!b.has(k)) ra.push(`tokens.css — [data-theme="calm"] thiếu ${k} (Galaxy có khai)`);
      for (const k of b) if (!a.has(k)) ra.push(`tokens.css — [data-theme="dark"] thiếu ${k} (Tĩnh lặng có khai)`);

      /* ── HAI KHỐI GALAXY PHẢI GIỐNG NHAU TỪNG GIÁ TRỊ ──
         Media query và attribute selector không giao nhau nên không kế thừa
         được của nhau; design system gọi đây là "luật cứng" và bắt chép y hệt.
         Chép tay thì sớm muộn cũng lệch, và ĐÃ lệch thật: --text-faint được
         sửa lên .62 ở khối @media cho đủ tương phản, còn khối attribute nằm
         lại ở .50 (3.9:1). Người để máy ở chế độ tối thì đọc được; người tự
         bấm nút chọn tối thì không. Không ai bắt được bằng mắt vì hai khối
         không bao giờ hiện cùng lúc. */
      const gt = (t) => new Map([...t.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)]
        .map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
      const media = than(/@media\s*\(prefers-color-scheme\s*:\s*dark\)/);
      if (media) {
        const m1 = gt(media), m2 = gt(toi);
        for (const [k, v] of m2) {
          if (!m1.has(k)) ra.push(`tokens.css — khối @media tối thiếu ${k}`);
          else if (m1.get(k) !== v) {
            ra.push(`tokens.css — ${k} lệch giữa hai khối Galaxy: ` +
                    `@media để "${m1.get(k)}", [data-theme="dark"] để "${v}"`);
          }
        }
        for (const k of m1.keys()) {
          if (!m2.has(k)) ra.push(`tokens.css — khối [data-theme="dark"] thiếu ${k}`);
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
    /* ── PHÉP KIỂM NÀY SINH RA TỪ MỘT LẦN HỎNG THẬT ──
       Khối `quoteAI` bị xoá khỏi site.config.json trong một lượt sửa cấu hình,
       và KHÔNG CÓ GÌ BÁO. Build vẫn xanh. `_nguon.js` vẫn nướng ra đủ bốn mục.
       Hàm `/api/quote` vẫn nằm đó, khoá Gemini vẫn khai đúng. Chỉ có thẻ
       `data-api` là không được in ra nữa — nên trang KHÔNG BAO GIỜ gọi tới hàm.

       Lớp Gemini chết lặng, mà nhìn ngoài thì không thấy gì khác: ô trích dẫn
       vẫn có câu, vì kho sẵn vẫn chạy. Đúng cái tính "hỏng thì im" đã giữ cho
       trang không bao giờ sập, cũng là cái giấu luôn chuyện nó tắt.

       Mọi phép kiểm quote khác ở trên đều hỏi "đã chuẩn bị đủ chưa". Phép kiểm
       này hỏi câu còn lại: "có thật sự nối dây không". */
    ten: 'Lớp Gemini của ô trích dẫn có được nối vào trang không',
    muc: 'canh',
    chay: ({ cau, trang }) => {
      const coO = trang.filter((t) => t.html.includes('class="bo-quote'));
      if (!coO.length || (cau.quoteAI || {}).bat) return [];
      return ['site.config.json không bật quoteAI — ô trích dẫn chỉ xoay vòng trong ' +
              'kho sẵn, hàm /api/quote không bao giờ được gọi tới. Muốn bật thì thêm ' +
              'lại khối "quoteAI": { "bat": true, "api": "/api/quote", "khung": 3 }'];
    }
  },

  {
    /* Bật rồi thì phải nối được tới cả hai đầu dây. Thiếu `data-khung` không
       làm hỏng gì — trang rơi về nếp cũ một câu một ngày — nhưng đó là lặng lẽ
       mất đúng cái vừa bật lên, nên vẫn phải báo. */
    ten: 'Bật quoteAI thì ô trích dẫn phải có data-api và data-khung',
    muc: 'loi',
    chay: ({ cau, trang, goc }) => {
      if (!(cau.quoteAI || {}).bat) return [];
      const ra = [];

      if (!fs.existsSync(path.join(goc, 'functions', 'api', 'quote.js'))) {
        ra.push('site.config.json bật quoteAI nhưng thiếu functions/api/quote.js');
      }

      const coO = trang.filter((t) => t.html.includes('class="bo-quote'));
      if (!coO.length) {
        ra.push('bật quoteAI nhưng không trang nào có ô trích dẫn — ' +
                'kho `### Câu sẵn` trong content/quote-nguon.md rỗng?');
        return ra;
      }

      const thieuApi = coO.filter((t) => !t.html.includes('data-api='));
      if (thieuApi.length) {
        ra.push(`${thieuApi.length} ô trích dẫn thiếu data-api, ví dụ ${thieuApi[0].url} — ` +
                'trang sẽ không gọi /api/quote lần nào');
      }

      /* Chỉ nhận 1–4: bảng mốc giờ ở src/js/quote.js đúng bấy nhiêu khoá, số
         ngoài bảng thì client lặng lẽ rơi về bảng 3 khung, còn hàm lại tính
         hạn cache theo số khác — hai bên lệch nhau là câu đổi giữa buổi. */
      const thieuKhung = coO.filter((t) => !/data-khung="[1-4]"/.test(t.html));
      if (thieuKhung.length) {
        ra.push(`${thieuKhung.length} ô trích dẫn thiếu data-khung hợp lệ (1–4), ` +
                `ví dụ ${thieuKhung[0].url} — trang rơi về nếp cũ một câu một ngày`);
      }
      return ra;
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
      /* `noindex` LÀ DẤU HIỆU, KHÔNG PHẢI ĐỊNH NGHĨA của bản nháp.
         Bàn làm việc của chủ trang (/z-admin/) cũng mang noindex, nhưng nó
         là trang CỐ Ý dựng ra và cố ý không cho Google lập chỉ mục — hai việc
         khác hẳn nhau. Không chừa nó ra thì mỗi lần dựng lại báo một dòng đỏ
         giả, mà dòng đỏ giả lặp mãi thì sớm muộn người ta thôi đọc dòng đỏ. */
      const CO_Y = ['/z-admin/'];
      return trang.filter((t) => t.noindex && !CO_Y.includes(t.url)).map((t) => {
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
    /* ── SỔ PHIÊN BẢN PHẢI Ở NGOÀI TRANG, VÀ PHẢI VỚI TỚI ĐƯỢC ──
       Sổ này từng nằm nhúng trong MỌI trang: 77 KB một trang, 3,5 MB cho cả
       bản dựng, chỉ để phục vụ một cửa hậu bấm năm nhịp mới mở. Nay nó là
       dist/so-tay.json.

       Hai đường hỏng, và cả hai đều hỏng LẶNG LẼ:
         · nhúng lại vào trang — trang nặng trở lại mà nhìn bên ngoài y hệt;
         · địa chỉ trỏ vào chỗ không có file — bấm năm nhịp thì chẳng có gì mở
           ra, mà cũng không lỗi nào hiện lên vì chỗ bắt lỗi nuốt im.
       Phép kiểm canh cả hai. */
    ten: 'Sổ phiên bản nằm ngoài trang và địa chỉ trỏ đúng file',
    muc: 'loi',
    chay: ({ trang, dist }) => {
      const ra = [];
      const nhung = trang.filter((t) => t.html.includes('id="so-tay-data"'));
      if (nhung.length) {
        ra.push(`${nhung.length} trang còn nhúng sổ phiên bản vào HTML ` +
                `(${nhung[0].url}…) — đáng lẽ chỉ còn data-so-tay-api`);
      }
      const thieu = trang.filter((t) => !/data-so-tay-api="[^"]+"/.test(t.html));
      if (thieu.length) {
        ra.push(`${thieu.length} trang không có data-so-tay-api (${thieu[0].url}…) — ` +
                `bấm năm nhịp ở chân trang sẽ không mở được gì`);
      }
      const f = path.join(dist, 'so-tay.json');
      if (!fs.existsSync(f)) {
        ra.push('thiếu dist/so-tay.json — mọi trang trỏ vào một file không có');
      } else {
        try {
          const d = JSON.parse(fs.readFileSync(f, 'utf8'));
          if (!d.build || !d.build.length) ra.push('dist/so-tay.json không có mục build nào');
          if (!d.nhan || !d.nhan.history) ra.push('dist/so-tay.json thiếu bảng nhãn');
        } catch (e) { ra.push(`dist/so-tay.json không đọc được: ${e.message}`); }
      }
      return ra;
    }
  },
  {
    /* ── JS GỬI RA PHẢI DỊCH ĐƯỢC ──
       Bộ dựng cắt chú thích khỏi JS trước khi ghi vào dist/ (xem boChuThichJS
       trong tools/build.mjs). Cắt chú thích của JS khó hơn của CSS vì dấu `/`
       vừa là phép chia vừa mở regex; cắt nhầm một chỗ là cả file chết, và chết
       theo kiểu tệ nhất — trang vẫn hiện đủ, chỉ là không bấm được gì nữa.

       build.mjs đã tự thử dịch rồi mới ghi, nhưng phép kiểm này soi BẢN ĐANG
       NẰM TRONG dist: đúng thứ người đọc tải về, kể cả khi ai đó sửa tay vào
       đó hay bước cắt kia bị bỏ qua. */
    ten: 'Mọi file JS trong dist/assets đều dịch được',
    muc: 'loi',
    chay: ({ dist }) => {
      const thuMuc = path.join(dist, 'assets');
      if (!fs.existsSync(thuMuc)) return [];
      return fs.readdirSync(thuMuc).filter((f) => f.endsWith('.js')).flatMap((f) => {
        try { new Function(fs.readFileSync(path.join(thuMuc, f), 'utf8')); return []; }
        catch (e) { return [`dist/assets/${f} không dịch được: ${e.message}`]; }
      });
    }
  },
  {
    /* ── BẬT Ô VIẾT BÀI THÌ PHẢI CÓ ĐỦ BỘ ──
       Bốn mẩu đi cùng nhau: hàm ở functions/, ba ngăn ở /z-admin/, địa chỉ in
       ra trang ấy, và hai file JS đọc địa chỉ đó. Thiếu mẩu nào thì ngăn Post
       vẫn mở ra bình thường — chỉ là bấm Đăng xong không có gì xảy ra, hoặc
       tệ hơn, ngăn ấy trống trơn mà không ai biết vì sao. */
    ten: 'Bật ô viết bài thì phải có đủ hàm, ba ngăn và script',
    muc: 'loi',
    chay: ({ cau, goc, trang }) => {
      if ((cau.dangBai || {}).bat === false) return [];
      const ra = [];
      if (!fs.existsSync(path.join(goc, 'functions', 'api', 'bai.js'))) {
        ra.push('site.config.json bật dangBai nhưng thiếu functions/api/bai.js');
      }
      const ql = trang.find((t) => t.url === '/z-admin/');
      if (!ql) return ra;

      for (const [o, ten] of [['data-viet-host', 'Note'],
                              ['data-duyet-host', 'Comment'],
                              ['data-viet-bai-host', 'Post']]) {
        if (!ql.html.includes(o)) ra.push(`/z-admin/ thiếu chỗ cắm ngăn ${ten} (${o})`);
      }
      if (!/data-bai-api="[^"]+"/.test(ql.html)) {
        ra.push('/z-admin/ không in data-bai-api — ô viết bài sẽ không mọc ra');
      }
      /* ── CHỖ TRỐNG MẪU PHẢI ĐƯỢC ĐIỀN ──
         `wrangler.jsonc` xuất xưởng với "tai-khoan/ten-repo". Để nguyên thì
         mọi thứ vẫn dựng, vẫn deploy, ngăn Post vẫn mở ra — chỉ đến lúc bấm
         Đăng mới nhận một câu 404 của GitHub, mà 404 ở đó đọc ra như "token
         hỏng" chứ không như "bạn quên điền tên kho mã". */
      const fW = path.join(goc, 'wrangler.jsonc');
      if (fs.existsSync(fW)) {
        const w = fs.readFileSync(fW, 'utf8');
        const m = w.match(/"GH_REPO"\s*:\s*"([^"]*)"/);
        if (!m) {
          ra.push('wrangler.jsonc chưa khai GH_REPO — ngăn Post sẽ không biết ghi vào kho mã nào');
        } else if (!/^[\w.-]+\/[\w.-]+$/.test(m[1]) || m[1] === 'tai-khoan/ten-repo') {
          ra.push(`wrangler.jsonc còn để GH_REPO = "${m[1]}" — thay bằng kho mã thật, `
                + `dạng "tên-tài-khoản/tên-repo" đọc trên thanh địa chỉ GitHub`);
        }
      }

      for (const j of ['admin.js', 'viet-bai.js']) {
        if (!ql.html.includes(`/assets/${j}`)) ra.push(`/z-admin/ không nạp ${j}`);
        if (!fs.existsSync(path.join(goc, 'dist', 'assets', j))) {
          ra.push(`thiếu dist/assets/${j} — thêm vào danh sách chép trong tools/build.mjs`);
        }
      }

      /* Ngăn thứ hai trở đi PHẢI mang `hidden` ngay trong HTML tĩnh. Thiếu nó
         thì trong khoảnh khắc trước lúc admin.js chạy, cả ba khung hiện chồng
         lên nhau rồi hai cái biến mất — một cú giật thấy rõ mỗi lần mở trang. */
      const an = (ql.html.match(/role="tabpanel"[^>]*hidden/g) || []).length;
      if (an !== 2) {
        ra.push(`/z-admin/ có ${an} ngăn mang hidden sẵn, đáng lẽ 2 — mở trang sẽ thấy giật`);
      }
      return ra;
    }
  },
  {
    /* ── WORKER.JS PHẢI BIẾT MỌI CỬA TRONG functions/api/ ──
       Đây là lỗi đã vấp thật, và nó im lặng tới mức nguy hiểm.

       `functions/` là quy ước của RIÊNG Cloudflare Pages. Chạy dưới dạng
       Worker (tên miền …workers.dev) thì Cloudflare không đọc thư mục ấy —
       phải có `worker.js` tự định tuyến. Thiếu một đường trong bảng tra của
       nó thì đường ấy trả 404, mà 404 ở đây KHÔNG giống lỗi: trang tĩnh vẫn
       mở bình thường, log không có gì, chỉ là bình luận không gửi được và
       lượt xem không đếm. Phát hiện ra lúc có người thật gửi bình luận thì đã
       muộn.

       Nên mỗi lần thêm một hàm vào functions/api/ là phải thêm một dòng vào
       bảng CUA trong worker.js. Phép kiểm này canh đúng việc đó. */
    ten: 'worker.js định tuyến đủ mọi hàm trong functions/api/',
    muc: 'loi',
    chay: ({ goc }) => {
      const thuMuc = path.join(goc, 'functions', 'api');
      const fWorker = path.join(goc, 'worker.js');
      if (!fs.existsSync(thuMuc) || !fs.existsSync(fWorker)) return [];
      const js = fs.readFileSync(fWorker, 'utf8');
      return fs.readdirSync(thuMuc)
        /* `_nguon.js` bắt đầu bằng gạch dưới: Pages coi đó là file dùng chung,
           không phải một đường dẫn. Worker cũng không cần định tuyến nó. */
        .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
        .map((f) => '/api/' + f.replace(/\.js$/, ''))
        .filter((duong) => !js.includes(`'${duong}'`) && !js.includes(`"${duong}"`))
        .map((duong) => `worker.js không có đường ${duong} trong bảng tra — ` +
                        `chạy dưới dạng Worker thì đường này trả 404 và không ai báo`);
    }
  },
  {
    /* ── BẬT BÌNH LUẬN THÌ PHẢI CÓ ĐỦ BỘ ──
       Ba mẩu đi cùng nhau: hàm ở functions/, địa chỉ in ra mỗi trang bài, và
       file JS đọc địa chỉ ấy. Thiếu mẩu nào thì khung bình luận vẫn hiện
       nguyên — chỉ là gửi không đi đâu cả. Người đọc gõ xong bấm Gửi và nhận
       một câu báo lỗi; chủ trang thì không bao giờ biết, vì trang nhìn vẫn
       bình thường. */
    ten: 'Bật bình luận thì phải có đủ hàm, địa chỉ và script',
    muc: 'loi',
    chay: ({ cau, goc, trang }) => {
      if ((cau.binhLuan || {}).bat === false) return [];
      const ra = [];
      if (!fs.existsSync(path.join(goc, 'functions', 'api', 'binh-luan.js'))) {
        ra.push('site.config.json bật binhLuan nhưng thiếu functions/api/binh-luan.js');
      }
      /* Khoá cũ `url` là địa chỉ Google Apps Script. Còn sót lại thì cấu hình
         đọc ra là vẫn đang dùng Apps Script, mà build thì đã thôi đọc nó. */
      if ((cau.binhLuan || {}).url !== undefined) {
        ra.push('site.config.json còn khoá binhLuan.url (địa chỉ Apps Script cũ) — ' +
                'bỏ đi, nay dùng binhLuan.api trỏ vào hàm nội bộ');
      }
      const api = (cau.binhLuan || {}).api || '/api/binh-luan';
      if (api !== '/api/binh-luan') {
        ra.push(`binhLuan.api = "${api}" nhưng hàm nằm ở /api/binh-luan ` +
                '(Cloudflare lấy đường dẫn theo tên file trong functions/)');
      }
      const bai = trang.filter((t) => /class="post-layout/.test(t.html));
      const thieu = bai.filter((t) => !t.html.includes('data-binh-luan='));
      if (bai.length && thieu.length) {
        ra.push(`${thieu.length} trang bài không có khối bình luận, ví dụ ${thieu[0].url}`);
      }
      return ra;
    }
  },
  {
    /* ── BẬT GHI CHÚ ĐĂNG THẲNG THÌ PHẢI CÓ ĐỦ BỘ ──
       Ba mẩu phải đi cùng nhau: hàm ở functions/, địa chỉ API in ra /notes/,
       và file JS đọc địa chỉ ấy. Thiếu mẩu nào thì /notes/ vẫn đọc được bình
       thường — đó mới là chỗ nguy: nó hỏng LẶNG LẼ, và cái hỏng chỉ lộ ra vào
       đúng lúc chủ trang đang đứng ngoài đường muốn ghi vội một dòng. */
    ten: 'Bật ghi chú đăng thẳng thì phải có đủ hàm, địa chỉ và script',
    muc: 'loi',
    chay: ({ cau, goc, trang }) => {
      if (!(cau.ghiChu || {}).online) return [];
      const ra = [];
      if (!fs.existsSync(path.join(goc, 'functions', 'api', 'ghi-chu.js'))) {
        ra.push('site.config.json bật ghiChu nhưng thiếu functions/api/ghi-chu.js');
      }
      const t = trang.find((x) => x.url === '/notes/');
      if (!t) ra.push('bật ghiChu nhưng không dựng trang /notes/');
      else {
        if (!t.html.includes('data-gc-api=')) {
          ra.push('/notes/ không in ra data-gc-api — ô viết sẽ không bao giờ hiện');
        }
        if (!t.html.includes('ghi-chu.js')) {
          ra.push('/notes/ không nạp ghi-chu.js');
        }
      }
      /* Địa chỉ API phải trỏ vào đúng chỗ Cloudflare đặt hàm. Khai một đường
         khác thì hàm nằm đó mà không ai gọi tới. */
      const api = (cau.ghiChu || {}).api || '/api/ghi-chu';
      if (api !== '/api/ghi-chu') {
        ra.push(`ghiChu.api = "${api}" nhưng hàm nằm ở /api/ghi-chu ` +
                '(Cloudflare lấy đường dẫn theo tên file trong functions/)');
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
    /* ── BÀI DÀI THÌ NÊN CÓ MỤC ──
       Lý do CŨ của phép kiểm này là bố cục: cột bên chỉ dựng khi có mục lục,
       nên bài không mục để lại một cột trống. Lý do ấy hết rồi — cột bên nay
       luôn có ô trích dẫn, có mục lục hay không cũng vậy (xem tocHTML trong
       build.mjs).

       Giữ lại phép kiểm vì lý do CÒN LẠI, và nó là lý do thật hơn: một bài dài
       không có mục nào thì người đọc không liếc qua được, phải cuộn hết mới
       biết trong đó có gì.

       Chỉ hỏi những bài ĐỦ DÀI. Bài vài đoạn không có mục là chuyện bình
       thường, hỏi nó là bắt người viết bịa tiêu đề cho đủ luật. */
    ten: 'Bài dài có ít nhất một tiêu đề mục (để liếc qua được)',
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
      /* Ngưỡng dài: 6000 ký tự HTML của cả trang, khoảng hơn nghìn chữ thân
         bài. Dưới ngưỡng ấy thì cuộn một hơi là hết, mục lục không giúp gì. */
      .filter((t) => t.html.length > 6000)
      .map((t) => `${t.url} — bài dài mà không có tiêu đề mục nào, người đọc ` +
                  `không liếc qua được. Thêm vài dòng \`## \` vào bài.`)
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
    /* ── LOGO VÀ DÒNG CHỮ KHÔNG BAO GIỜ CÙNG HIỆN ──
       Logo và tên viết đầy đủ nói CÙNG một điều; đặt cạnh nhau là lặp, và ở
       thanh đầu trang thì lặp là tốn chỗ của mục điều hướng. Luật: trang chủ và
       trang giới thiệu chỉ logo, mọi trang khác chỉ dòng chữ, và chỉ TRANG CHỦ
       mới cho logo kể chuyện.

       Việc ẩn do CSS lo (`.brand--logo b{display:none}`), nên thêm nhầm một lớp
       vào HTML thì không có lỗi nào nổ ra — chỉ là một trang nào đó hiện cả hai,
       hoặc hiện không cái nào. Phép kiểm soi lớp trong HTML đã dựng. */
    ten: 'Logo và dòng chữ tên blog không cùng hiện trên một trang',
    muc: 'loi',
    chay: ({ trang }) => {
      /* Hai trang có logo. Đổi danh sách này là đổi luôn cả hai vế của phép
         kiểm — chỗ báo sai trang, và chỗ đếm tổng. */
      const CHO_KE = ['/', '/about/'];
      const ra = [];
      let soDong = 0;
      for (const t of trang) {
        const m = t.html.match(/<[^>]*class="brand([^"]*)"/);
        if (!m) { ra.push(`${t.url} — không có ô thương hiệu nào ở thanh đầu trang`); continue; }
        const lop = m[1];
        const coLogo = lop.includes('brand--logo');
        const coChu  = lop.includes('brand--chu');
        const coDong = lop.includes('brand--dong');
        /* ── Ô ĐỔI QUA LẠI ──
           Trang KHÔNG kể chuyện thì ô thương hiệu phải biết đổi giữa chữ và
           logo (brand--doi). Canh cả hai chiều: thiếu ở một trang thì trang ấy
           lặng lẽ đứng im mãi ở dòng chữ, mà thừa ở trang chủ thì hai cơ chế
           cùng tranh một ô — một bên mờ dần theo đồng hồ, một bên đang chạy
           vòng kể 27 giây. */
        const coDoi = lop.includes('brand--doi');
        if (coDoi !== !CHO_KE.includes(t.url)) {
          ra.push(`${t.url} — ${coDoi ? 'có' : 'thiếu'} brand--doi; lớp ấy chỉ dành cho `
                + `trang NGOÀI ${CHO_KE.join(' và ')}`);
        }
        if (coDoi && !coChu) ra.push(`${t.url} — có brand--doi mà không có brand--chu`);
        /* Ô đổi qua lại phải có SẴN nét logo trong HTML để mà đổi sang. */
        if (coDoi && !t.html.includes('class="lg-vc lg-vc--1"')) {
          ra.push(`${t.url} — khai brand--doi mà trong HTML không có nét logo để đổi sang`);
        }
        if (coLogo === coChu) {
          ra.push(`${t.url} — lớp "brand${lop}": phải có ĐÚNG MỘT trong brand--logo / brand--chu`);
        }
        if (coDong) {
          soDong++;
          /* Hai trang được kể chuyện: trang chủ và trang giới thiệu. Đúng hai
             trang ấy là hai trang có logo — nên luật gọn lại thành "có logo
             thì kể chuyện", và điều kiện thật sự cần canh là ĐỪNG LAN sang
             trang thứ ba. Một trang bài viết mà logo lặp suốt ở thanh đầu là
             thứ mắt không bỏ qua được, mà người ta tới đó để đọc. */
          if (!CHO_KE.includes(t.url)) {
            ra.push(`${t.url} — có brand--dong, nhưng logo chỉ được kể chuyện ở ${CHO_KE.join(' và ')}`);
          }
          if (!coLogo) ra.push(`${t.url} — có brand--dong mà không có brand--logo`);
        }
        /* Lớp đúng nhưng quên nhả nét vào HTML thì ô thương hiệu rỗng. */
        if (coLogo && !t.html.includes('class="lg-vc lg-vc--1"')) {
          ra.push(`${t.url} — khai brand--logo mà trong HTML không có nét logo`);
        }
      }
      if (soDong !== CHO_KE.length) {
        ra.push(`có ${soDong} trang khai brand--dong — phải đúng ${CHO_KE.length} ` +
                `(${CHO_KE.join(' và ')})`);
      }
      return ra;
    }
  },
  {
    /* ── TỈ LỆ KHUNG BĂNG ẢNH PHẢI NẰM TRONG KHOẢNG INSTAGRAM CHO PHÉP ──
       Khung lấy tỉ lệ theo tấm đầu tiên, kẹp trong 4:5 … 1.91:1 — ngoài khoảng
       ấy thì chính Instagram và Facebook cũng tự cắt. Phép kẹp nằm trong
       `tiLeBang()`; phép kiểm này soi con số ĐÃ IN RA HTML, tức là kiểm cả hàm
       lẫn đường đi của nó tới trang.

       Một tấm ảnh panorama 3:1 thay vào là lộ ngay: nếu con số in ra thành 3
       thì phép kẹp đã hỏng ở đâu đó. */
    ten: 'Tỉ lệ khung băng ảnh nằm trong khoảng 4:5 … 1.91:1',
    muc: 'loi',
    chay: ({ trang }) => trang.flatMap((t) =>
      [...t.html.matchAll(/class="bang-anh"[^>]*style="--ba-ti:([\d.]+)"/g)]
        .map((m) => +m[1])
        .filter((v) => !(v >= 0.8 - 1e-6 && v <= 1.91 + 1e-6))
        .map((v) => `${t.url} — --ba-ti:${v} nằm ngoài khoảng 0.8 … 1.91`))
  },
  {
    /* ── BỐN ĐƯỜNG CỦA LOGO PHẢI CÙNG CẤU TRÚC `M + 4C` ──
       Logo trang chủ kể chuyện bằng cách BIẾN HÌNH: nét gấp khúc chữ Z cong dần
       thành vô cực, vòng tròn vặn dần thành vô cực thứ hai. Trình duyệt chỉ nội
       suy được giữa hai đường khi chúng có CÙNG chuỗi lệnh và cùng số điểm.

       Hỏng kiểu này im lặng đến khó chịu: thêm một khúc cong cho đẹp thì đường
       vẫn vẽ ra đúng, trang vẫn dựng, không ai báo gì — chỉ là phép biến hình
       thôi chạy và hình NHẢY từ chữ Z sang vô cực. Muốn biết thì phải mở trình
       duyệt, đợi đúng giây thứ tám của một vòng hai mươi giây rồi nhìn. */
    ten: 'Bốn đường của logo cùng cấu trúc M + 4C (để biến hình được)',
    muc: 'loi',
    chay: () => {
      const f = path.join(GOC, 'tools', 'build.mjs');
      const js = fs.readFileSync(f, 'utf8');
      const ra = [];
      /* P_NOI KHÔNG có trong danh sách: nét nối chữ i không biến hình với ai,
         nó chỉ vẽ dần ra rồi tắt, nên nó được phép là một đoạn thẳng `M…L…`.
         Bốn đường dưới đây thì phải cùng cấu trúc, vì chúng nội suy vào nhau
         theo từng cặp: P_ZZ→P_INF1 và P_B→P_INF2. */
      /* P_NHON1/P_NHON2 là bản đầu cánh nhọn; chúng nội suy vào chính bản
         tròn của mình ở nấc "đanh lại" trước chặng xoay, nên phải cùng cấu
         trúc y như hai cặp kia. */
      const ten = ['P_INF1', 'P_INF2', 'P_ZZ', 'P_B', 'P_NHON1', 'P_NHON2'];
      for (const k of ten) {
        /* Cắt bằng chỉ số chứ không dựng RegExp từ chuỗi: RegExp dựng động ở đây
           phải escape hai tầng — một cho chuỗi mẫu, một cho biểu thức — và đã sai
           đúng vì chuyện ấy một lần. Sai xong thì phép kiểm báo "không tìm thấy"
           cho cả bốn đường, tức là nó tố cáo chính nó chứ không tố cáo code. */
        const dau = js.indexOf(`const ${k} `);
        const n1 = dau < 0 ? -1 : js.indexOf("'", dau);
        const n2 = n1 < 0 ? -1 : js.indexOf("'", n1 + 1);
        if (n2 < 0) { ra.push(`build.mjs không còn khai ${k} — phép kiểm hết bám được vào đâu`); continue; }
        const lenh = js.slice(n1 + 1, n2).match(/[A-Za-z]/g) || [];
        const soC = lenh.filter((x) => x.toUpperCase() === 'C').length;
        const dauM = lenh[0] && lenh[0].toUpperCase() === 'M';
        if (!dauM || soC !== 4 || lenh.length !== 5) {
          ra.push(`${k} có chuỗi lệnh "${lenh.join('')}" — phải đúng "MCCCC", ` +
                  `không thì nó thôi biến hình được với ba đường kia`);
        }
      }
      return ra;
    }
  },
  {
    /* ── HAI NỬA HOẠT HÌNH LOGO PHẢI CHẠY CÙNG NHỊP ──
       Vòng kể chuyện của logo chạy bằng HAI cơ chế: phần mờ/xoay do CSS lo
       (`--lg-ck`), phần biến hình do thẻ <animate> trong SVG lo (thuộc tính
       `dur`). `dur` là attribute của SVG chứ không phải CSS, nên `var(--lg-ck)`
       ở đó không nở ra gì cả — buộc phải là một con số thật.

       Lệch nhau thì không ai báo lỗi, chỉ là hai nửa câu chuyện trôi dần khỏi
       nhau: chữ Z cong ra lúc nó đã xoay xong từ đời nào, hoặc ngược lại. Và vì
       trôi DẦN nên xem mấy vòng đầu vẫn thấy đúng.

       Nay cả hai lấy từ một nguồn (`logo.vongKe` trong site.config.json), nên
       phép kiểm này không còn canh hai chỗ KHAI nữa — nó soi hai chỗ ĐÃ DỰNG
       RA. Đó mới là thứ trình duyệt đọc, và nó bắt được cả trường hợp một chỗ
       nào đó ghi đè mất biến trên đường ra dist. */
    ten: 'Hai nửa hoạt hình logo chạy cùng nhịp trong bản đã dựng',
    muc: 'loi',
    chay: ({ trang, dist }) => {
      const fCss = path.join(dist, 'assets', 'style.css');
      if (!fs.existsSync(fCss)) return [];
      const css = fs.readFileSync(fCss, 'utf8');
      /* Lấy khai báo CUỐI CÙNG: cùng độ ưu tiên thì luật sau thắng, và build
         ghi đè giá trị của cấu hình vào cuối bundle. */
      const dsCss = [...css.matchAll(/--lg-ck:\s*([\w.]+)/g)].map((m) => m[1]);
      if (!dsCss.length) return ['dist/assets/style.css không có --lg-ck nào'];
      const cCss = dsCss[dsCss.length - 1];

      const co = trang.find((t) => /<svg class="logo logo--dong"/.test(t.html));
      if (!co) return [];
      const dur = [...co.html.matchAll(/<animate[^>]*\bdur="([^"]+)"/g)].map((m) => m[1]);
      if (!dur.length) return [`${co.url} có logo động nhưng không thẻ <animate> nào khai dur`];

      const le = [...new Set(dur)].filter((d) => d !== cCss);
      return le.length
        ? [`--lg-ck = ${cCss} nhưng <animate dur> = ${le.join(', ')} — hai nửa hoạt hình `
           + `logo sẽ trôi lệch nhau (sửa logo.vongKe trong site.config.json)`]
        : [];
    }
  },
  {
    /* ── TỪ CUỐI Ở MÀN ĐẦU PHẢI BỊ ĐƯỜNG KẺ XÉN ĐÚNG NỬA CHỮ ──
       Ở trạng thái NGHỈ, từ "Borderland" cố ý chạy quá đường kẻ phải của ô
       lưới để bị xén — đó là trò bố cục, không phải tràn lề. Xén quá tay thì
       mất hai chữ cuối và đọc ra là "Borderl"; xén hụt thì chữ dừng lửng lơ
       giữa cột và cả khối trông như bị bó lại.

       ── PHÉP KIỂM NÀY TỪNG CHỈ CANH MỘT CHIỀU, VÀ ĐÃ ĐỂ LỌT ──
       Bản trước chỉ báo khi lấn QUÁ nửa chữ. Chữ không lấn tới nơi thì nó im,
       nên khi hằng số đo lệch đi, `--s3` tụt xuống 20,35cqw và chữ "d" dừng
       cách đường kẻ 45px — bộ kiểm định vẫn xanh suốt. Nay canh cả hai đầu.

       ── HAI HẰNG SỐ ĐÃ ĐO LẠI ──
       Số cũ (4,72 và 0,538) lệch 17% so với nét chữ đang thật sự hiện ra. Đo
       lại bằng Range trên chính phần tử đó, phông Cormorant Garamond italic
       600 đã nạp xong, bốn cỡ 80/103/137/200px cho cùng một tỉ lệ. Đổi phông
       hay đổi chữ thì phải đo lại — đo thật, đừng ước lượng. */
    ten: 'Từ cuối ở màn đầu bị xén đúng nửa chữ, không hụt không quá',
    muc: 'loi',
    chay: () => {
      const f = path.join(GOC, 'src', 'styles', 'list.css');
      if (!fs.existsSync(f)) return [];
      const css = fs.readFileSync(f, 'utf8');
      const BE_NGANG_TU  = 4.0343;   /* "Borderland" / cỡ chữ, CHƯA gồm giãn chữ */
      const BE_NGANG_D   = 0.4481;   /* riêng nét chữ "d" cuối / cỡ chữ */
      const SO_CHU       = 10;

      /* Mỗi chỗ khai đủ bộ ba --s3/--x3/--ls3 là MỘT trạng thái. Bộ ĐẦU TIÊN
         theo thứ tự dòng là trạng thái NGHỈ — trạng thái duy nhất được phép
         lấn ra ngoài; mấy bộ sau là "hiện đủ", và ở đó chữ là chữ ĐỂ ĐỌC nên
         không được dính vào đường kẻ. */
      const bo = [...css.matchAll(
        /--s3:\s*([\d.]+)cqw;\s*--x3:\s*([\d.-]+)em;\s*--ls3:\s*([\d.-]+)em/g)];
      if (!bo.length) return ['list.css không còn khai --s3/--x3/--ls3 — phép kiểm này hết bám được vào đâu'];

      const ra = [];
      bo.forEach((m, vt) => {
        const [s3, x3, ls3] = [+m[1], +m[2], +m[3]];
        /* Quy hết về ĐƠN VỊ CỠ CHỮ: ô rộng 100cqw, cỡ chữ = s3 cqw, nên ô rộng
           100/s3 lần cỡ chữ. Mép phải của NÉT CHỮ "d" nằm ở `+ 9·ls3`, không
           phải `+ 10·ls3`: giãn chữ cộng thêm sau cả ký tự cuối, mà nhịp giãn
           ấy là khoảng trống chứ không phải chữ. Bản trước cộng 10 nhịp, tức
           là đo cả một khoảng trống vào bề ngang con chữ. */
        const o      = 100 / s3;
        const mepChu = x3 + BE_NGANG_TU + (SO_CHU - 1) * ls3;
        const lan    = mepChu - o;

        if (vt === 0) {
          /* Trạng thái NGHỈ: đường kẻ phải cắt ngang chữ "d", và cắt gần đúng
             giữa. Dung sai ±15% bề ngang chữ — hẹp hơn thì mỗi lần tinh chỉnh
             cỡ chữ một nhịp là đỏ, rộng hơn thì hụt/quá lọt qua được. */
          const dich = BE_NGANG_D / 2;
          const saiSo = Math.abs(lan - dich);
          if (saiSo > BE_NGANG_D * 0.15) {
            ra.push(`--s3:${s3}cqw · --x3:${x3}em · --ls3:${ls3}em (trạng thái nghỉ) → ` +
                    (lan < dich
                      ? `chữ "d" HỤT, chưa tới đường kẻ ${Math.round((dich - lan) * 100)}% cỡ chữ`
                      : `xén QUÁ nửa chữ ${Math.round((lan - dich) * 100)}% cỡ chữ`) +
                    ` — cần s3 ≈ ${(100 / (x3 + BE_NGANG_TU + (SO_CHU - 1) * ls3 - dich)).toFixed(2)}cqw`);
          }
        } else if (lan > 0) {
          ra.push(`--s3:${s3}cqw · --x3:${x3}em · --ls3:${ls3}em (trạng thái hiện đủ) → ` +
                  `chữ lấn ra ngoài đường kẻ ${Math.round(lan * 100)}% cỡ chữ; ` +
                  `lúc chữ đã rõ để ĐỌC thì không được dính đường kẻ`);
        }
      });
      return ra;
    }
  },
  {
    /* ── TÀI LIỆU PHẢI KỂ ĐỦ MỌI FILE MÃ CHẠY Ở TRÌNH DUYỆT VÀ MỌI CỬA API ──
       Bản đồ file trong README là thứ người mới mở kho mã đọc đầu tiên. Nó
       không tự cập nhật, và thêm một file mới thì chẳng có gì nhắc — nên nó
       lặng lẽ cũ đi. Đã lệch thật: năm file trong src/js/ và một cửa API
       (thich.js) ra đời mà bản đồ vẫn giữ nguyên danh sách cũ, và đọc README
       thì tưởng chúng không tồn tại.

       Chỉ canh CHIỀU THIẾU. README được phép nhắc tới thứ không còn (một dòng
       lịch sử, một ví dụ) — nhưng không được phép bỏ sót thứ đang chạy. */
    ten: 'README kể đủ mọi file trong src/js/ và functions/api/',
    muc: 'canh',
    chay: () => {
      const doc = fs.readFileSync(path.join(GOC, 'README.md'), 'utf8');
      const ra = [];
      for (const [thu, mo] of [['src/js', 'src/js/'], ['functions/api', 'functions/api/']]) {
        const d = path.join(GOC, thu);
        if (!fs.existsSync(d)) continue;
        for (const f of fs.readdirSync(d)) {
          if (!f.endsWith('.js') || f.startsWith('_')) continue;
          const ten = f.replace(/\.js$/, '');
          /* Bản đồ viết tên có lúc kèm đuôi .js, có lúc không — chấp cả hai. */
          if (!doc.includes(f) && !new RegExp('\\b' + ten.replace(/-/g, '\\-') + '\\b').test(doc)) {
            ra.push(`README chưa nhắc tới ${mo}${f}`);
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── ĐƯỜNG DẪN NÊU TRONG TÀI LIỆU PHẢI CÓ THẬT ──
       Tài liệu ở đây chỉ đích danh file rất nhiều — đó là điểm mạnh của nó, và
       cũng là chỗ nó hỏng: đổi tên hay dời một file thì mọi câu trỏ tới nó
       thành lời nói dối, mà không có gì báo.

       Chỉ xét đường trong dấu nháy ngược và bắt đầu bằng một thư mục có thật
       của kho mã. Mấy đường DÙNG LÀM VÍ DỤ (thứ người đọc sẽ tự tạo) nằm trong
       danh sách miễn ở dưới — chúng cố ý chưa tồn tại. */
    ten: 'Đường dẫn file nêu trong tài liệu đều có thật',
    muc: 'loi',
    chay: () => {
      const MIEN = new Set([
        'content/pages/lien-he.md',        /* ví dụ: trang tĩnh người đọc tự thêm */
      ]);
      /* LICH-SU.md là SỔ LỊCH SỬ: nó kể chuyện đã xảy ra, nên nó được phép —
         và phải được phép — nhắc tới file từng tồn tại rồi bị đổi tên hay xoá.
         Bắt nó chỉ nói về hiện tại là bắt nó viết lại quá khứ. */
      const BO_QUA = new Set(['LICH-SU.md']);
      const docs = [];
      (function quet(d) {
        for (const f of fs.readdirSync(d)) {
          const p = path.join(d, f);
          if (fs.statSync(p).isDirectory()) quet(p);
          else if (f.endsWith('.md') && !BO_QUA.has(f)) docs.push(p);
        }
      })(path.join(GOC, 'docs'));
      docs.push(path.join(GOC, 'README.md'));

      const ra = [];
      for (const f of docs) {
        const van = fs.readFileSync(f, 'utf8');
        const thay = new Set();
        for (const m of van.matchAll(
          /`((?:src|tools|docs|functions|content|public)\/[A-Za-z0-9._/-]+)`/g)) thay.add(m[1]);
        for (const u of thay) {
          if (u.endsWith('/') || MIEN.has(u)) continue;
          if (!fs.existsSync(path.join(GOC, u))) {
            ra.push(`${path.relative(GOC, f)} trỏ tới ${u} — không có file ấy`);
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── CỤM TIM · CHIA SẺ · BÌNH LUẬN: MỘT CỤM, ĐÚNG MỘT CHỖ ──
       Cụm này đã đổi chỗ bốn lần (chân bài → cột phải → đầu bài → cột phải,
       dưới "đọc tiếp"). Mỗi lần đổi là một lần có thể sót: hoặc nhả ra hai bản
       trên cùng một trang, hoặc quên hẳn ở một khung nào đó.

       Ba điều canh ở đây, và cả ba đều là lỗi đã suýt xảy ra:
         · đúng MỘT cụm mỗi trang bài
         · nó đứng SAU khối "đọc tiếp" (thứ tự trong HTML, nên đúng ở mọi khổ)
         · số bình luận ở hàng meta, KHÔNG in trên nút */
    ten: 'Mỗi trang bài có đúng một cụm tim · chia sẻ · bình luận, đặt sau "đọc tiếp"',
    muc: 'loi',
    chay: ({ trang }) => {
      const ra = [];
      for (const t of trang) {
        if (!/class="post-layout/.test(t.html)) continue;
        const so = (t.html.match(/class="cum-tt"/g) || []).length;
        if (so !== 1) { ra.push(`${t.url} — có ${so} cụm tương tác, phải đúng 1`); continue; }
        const iCum = t.html.indexOf('class="cum-tt"');
        const iDoc = t.html.indexOf('class="read-next"');
        const iDau = t.html.indexOf('class="post-head"');
        /* Tìm `</header>` SAU đầu bài: thẻ đầu tiên trong trang là của thanh
           đầu trang (`<header class="site-head">`), không phải của bài. */
        const iChu = t.html.indexOf('</header>', iDau);
        /* ── KHUNG ẢNH ĐI ĐƯỜNG KHÁC, VÀ ĐÓ LÀ CỐ Ý ──
           Khung C bày bài như một trang ảnh: cụm nút lên ngay dưới tiêu đề, vì
           ở đó người ta thả tim ngay sau khi xem chứ không cuộn xuống đáy tìm
           nút. Hai khung kia là bài ĐỌC, và ở đó cụm phải đứng sau khối "đọc
           tiếp". Canh cả hai chiều: đặt nhầm đường nào cũng là một trang cư xử
           khác hẳn mấy trang anh em mà không ai báo. */
        if (/post-layout khung-c/.test(t.html)) {
          if (!(iCum > iDau && iCum < iChu)) {
            ra.push(`${t.url} — khung ảnh: cụm tương tác phải nằm trong đầu bài`);
          }
        } else if (iDoc >= 0 && iCum < iDoc) {
          ra.push(`${t.url} — cụm tương tác đứng TRƯỚC khối "đọc tiếp"`);
        }
        if (!t.html.includes('data-bl-so')) {
          ra.push(`${t.url} — hàng meta thiếu ô số bình luận`);
        }
        if (/class="bl-dem"/.test(t.html)) {
          ra.push(`${t.url} — còn ô đếm trên nút bình luận; số phải ở hàng meta`);
        }
        if (!/class="bl-nut bl-chia"/.test(t.html)) {
          ra.push(`${t.url} — thiếu nút chia sẻ`);
        }
        if (!/class="btn btn--ghost bl-dong"/.test(t.html)) {
          ra.push(`${t.url} — khung bình luận thiếu nút Back`);
        }
      }
      return ra;
    }
  },
  {
    /* ── MỌI THẺ <script src> PHẢI TRỎ TỚI MỘT FILE CÓ THẬT ──
       Danh sách file .js được chép sang dist/ nằm RIÊNG một chỗ trong
       tools/build.mjs, tách khỏi chỗ viết ra thẻ <script>. Thêm một file mới
       mà quên một trong hai nơi thì trang vẫn dựng sạch, vẫn mở được, và tính
       năng của file ấy lặng lẽ không tồn tại — trình duyệt chỉ ghi một dòng
       404 vào bảng điều khiển mà không ai mở ra xem.

       Đã vấp thật khi thêm chia-se.js: thẻ có, file không, nút chia sẻ bấm
       không ra gì. Phép kiểm này đọc mọi trang đã dựng nên nó bắt được cả
       trường hợp chỉ MỘT loại trang nạp file đó. */
    ten: 'Mọi thẻ script trỏ tới một file có thật trong dist/assets/',
    muc: 'loi',
    chay: () => {
      const ra = [];
      const daBao = new Set();
      for (const t of ctx.trang) {
        for (const m of t.html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
          const u = m[1];
          if (/^https?:|^\/\//.test(u)) continue;          /* file ngoài: không kiểm */
          const that = path.join(GOC, 'dist', u.replace(/^\//, '').split('?')[0]);
          if (fs.existsSync(that) || daBao.has(u)) continue;
          daBao.add(u);
          ra.push(`${t.duong} nạp ${u} nhưng không có file ấy trong dist/ — `
                + `thêm tên file vào danh sách chép ở cuối tools/build.mjs`);
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
