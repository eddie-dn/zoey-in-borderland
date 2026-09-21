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
import { docSo, docChiTiet } from './lib/lichsu.mjs';
import { docNguon } from './lib/doc-nguon.mjs';
import { render as dungMD } from './lib/markdown.mjs';
import { boDau } from './lib/text.mjs';

const GOC  = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(GOC, 'dist');

/* ══════════════════════════════════════════════════════════════════════
   TRA MỘT FILE TRONG /assets/ KHI TÊN NÓ CÓ VÂN TAY

   Từ V16.03, build đổi `comments.js` thành `comments.afa8a87e.js` để đặt được
   cache một năm (lý do đầy đủ ở `vanTayAssets` trong tools/build.mjs).

   Phép kiểm thì vẫn nghĩ theo tên LOGIC — "trang /notes/ có nạp ghi-chu.js
   không" — nên hai hàm này dịch giữa hai cách gọi. Không phép kiểm nào được
   gõ thẳng tên có băm: băm đổi mỗi lần sửa file. */
function fileAssets(ten) {
  const thu = path.join(DIST, 'assets');
  if (!fs.existsSync(thu)) return null;
  const i = ten.lastIndexOf('.');
  const dau = ten.slice(0, i), duoi = ten.slice(i);
  const re = new RegExp('^' + dau.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                        '\\.[0-9a-f]{6,}' + duoi.replace(/\./g, '\\.') + '$');
  const co = fs.readdirSync(thu).find((f) => f === ten || re.test(f));
  return co ? path.join(thu, co) : null;
}

/* Trang `html` có nạp asset tên logic `ten` không. */
function nhacAssets(html, ten) {
  const i = ten.lastIndexOf('.');
  const dau = ten.slice(0, i).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duoi = ten.slice(i).replace(/\./g, '\\.');
  return new RegExp('/assets/' + dau + '(\\.[0-9a-f]{6,})?' + duoi + '(?![\\w.-])')
    .test(html);
}
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
    ten: 'Galaxy, Tĩnh lặng và 霜降 khai cùng một bộ biến',
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
      const suong = than(/:root\[data-theme="frost"\]\s*\{/);
      if (!toi || !tinh || !suong) {
        return ['tokens.css thiếu khối [data-theme="dark"], [data-theme="calm"] hoặc [data-theme="frost"]'];
      }

      /* --raw-* là chú thích chạy được, mỗi theme đặt tên màu gốc của riêng nó
         (raw-orchid bên Sakura, raw-suoi bên Tĩnh lặng). Component không được
         phép đọc chúng nên chúng không cần khớp nhau. */
      const bo = (s) => new Set([...s].filter((k) => !k.startsWith('--raw-')));
      const a = bo(bien(toi));

      /* 霜降 vào cùng một lượt so: bốn màu chữ thêm ở V2.7.3 phải có mặt ở
         cả ba theme tự chọn, thiếu một khối là chữ tô màu ấy rơi về màu mặc
         định của theme mà không ai báo. */
      const ra = [];
      for (const [ten, khoi] of [['calm', tinh], ['frost', suong]]) {
        const b = bo(bien(khoi));
        for (const k of a) if (!b.has(k)) ra.push(`tokens.css — [data-theme="${ten}"] thiếu ${k} (Galaxy có khai)`);
        for (const k of b) if (!a.has(k)) ra.push(`tokens.css — [data-theme="dark"] thiếu ${k} ([data-theme="${ten}"] có khai)`);
      }

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
    /* `favicon-calm.svg` phải có mặt y như bản chính: theme calm dùng riêng nó,
       và tên file ấy được GHÉP BẰNG CHUỖI trong đoạn script ở <head> (thay
       "favicon.svg" thành "favicon-calm.svg"), nên không có thẻ <link> nào trỏ
       tới nó để bộ kiểm link chết bắt được. Build thôi sinh ra nó thì người đọc
       theme calm nhận 404 và mất icon — im lặng, và chỉ ở một trong ba theme
       nên rất dễ lọt. */
    chay: ({ dist }) => ['robots.txt', 'sitemap.xml', 'feed.xml', 'favicon.svg',
                         'favicon-calm.svg',
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
      /* ── TỪ V17: KHÔNG CÒN MỘT BUNDLE, MÀ LÀ NĂM GÓI ──
         CSS nay chia theo loại trang (`GOI_CSS` trong tools/build.mjs), nên
         phép kiểm gộp tất cả lại rồi mới soi: câu hỏi vẫn y nguyên — file nào
         trong src/styles/ mà KHÔNG lọt vào bản dựng nào cả? */
      const thuAssets = path.join(dist, 'assets');
      if (!fs.existsSync(thuAssets)) return ['thiếu dist/assets/'];
      const dsGoi = fs.readdirSync(thuAssets).filter((x) => x.endsWith('.css'));
      if (!dsGoi.length) return ['dist/assets/ không có gói CSS nào'];
      const gop = dsGoi.map((x) => fs.readFileSync(path.join(thuAssets, x), 'utf8')).join('\n');
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
        if (!fileAssets(x)) {
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
      /* ── LUẬT NÀY ĐÃ ĐẢO CHIỀU Ở V16.03 ──
         Trước đó phép kiểm bắt lỗi khi `/assets/*` đặt cache DÀI, vì tên file
         không có vân tay nội dung. Nay build gắn vân tay (`vanTayAssets` trong
         tools/build.mjs), nên cache dài là thứ ĐÚNG — và cache ngắn mới là
         lỗi: nó bắt người đọc hỏi lại 14 lượt mỗi lần mở một trang, đổi lấy
         một an toàn mà vân tay đã lo xong.

         Hai vế phải khớp nhau: tên file có vân tay thì header phải dài. Kiểm
         cả hai để không bên nào đổi một mình. */
      const kAssets = (t.match(/^\/assets\/\*[\s\S]*?(?=^\/|\Z)/m) || [''])[0];
      const coVanTay = fs.existsSync(path.join(DIST, 'assets')) &&
        fs.readdirSync(path.join(DIST, 'assets'))
          .some((x) => /\.[0-9a-f]{6,}\.(js|css)$/.test(x));
      const cacheDai = /max-age=\s*([1-9]\d{4,})/.test(kAssets);
      if (coVanTay && !cacheDai) {
        r.push('dist/_headers: tên file assets có vân tay nội dung rồi mà ' +
               '/assets/* vẫn đặt cache ngắn — mỗi lượt xem trang tốn 14 vòng ' +
               'hỏi lại máy chủ không cần thiết');
      }
      if (!coVanTay && cacheDai) {
        r.push('dist/_headers: /assets/* đặt cache dài nhưng tên file KHÔNG có ' +
               'vân tay nội dung — sửa giao diện xong người đọc cũ vẫn thấy bản cũ');
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
      /* Thiếu {{so}} thì hàm vẫn chạy — nó tự hiểu là xin một câu. Nhưng lúc ấy
         mỗi lượt gọi chỉ về đúng một câu, kho đệm trong máy người đọc chỉ có
         một phần tử, và F5 lại gặp y câu cũ. Hỏng đúng thứ vừa dựng ra, mà
         không một dòng lỗi nào. */
      if (k.nhac && !/\{\{so\}\}/.test(k.nhac)) {
        r.push('content/quote-nguon.md: `### Lời dặn` thiếu {{so}} — mỗi lượt gọi ' +
               'chỉ xin được một câu, nên F5 lại gặp câu cũ');
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
       đoán trúng đường dẫn là đọc được. Nên nó phải KHÔNG có mặt trong dist.

       ── PHÉP KIỂM NÀY TỪNG KHÔNG BAO GIỜ ĐỎ ĐƯỢC ──
       Bản trước soi `noindex` trên mấy trang ĐÃ DỰNG. Nghe hợp lý, nhưng
       `npm run kiem` tự dựng lại một bản SẠCH trước khi soi — nên tới lúc nó
       nhìn thì bản nháp đã bị dọn đi rồi, bất kể trước đó ai chạy
       `npm run build -- --nhap`. Thử: dựng có `--nhap` (bài nháp ra file thật,
       mang noindex), chạy `kiem`, vẫn xanh.

       Một phép kiểm luôn xanh thì tệ hơn không có: nó chiếm một dòng trong
       báo cáo và cho cảm giác có người canh.

       Nay đi từ NGUỒN chứ không từ bản dựng: đọc front matter trong
       `content/posts/`, lấy ra bài nào `draft: true`, rồi soi xem đường dẫn
       của nó có mặt trong dist / sitemap / feed không. Bộ dựng thôi loại nháp
       ra là phép kiểm đỏ ngay — đó mới là thứ nó nói rằng nó canh. */
    ten: 'Bài nháp và bài hẹn ngày không lọt vào bản dựng, sitemap hay RSS',
    muc: 'loi',
    chay: ({ goc, dist }) => {
      const thuBai = path.join(goc, 'content', 'posts');
      if (!fs.existsSync(thuBai)) return [];
      const doc = (f) => fs.existsSync(path.join(dist, f))
        ? fs.readFileSync(path.join(dist, f), 'utf8') : '';
      const sm = doc('sitemap.xml'), rss = doc('feed.xml');

      const ds = [];
      (function di(d) {
        for (const f of fs.readdirSync(d)) {
          const p2 = path.join(d, f);
          if (fs.statSync(p2).isDirectory()) { di(p2); continue; }
          if (!f.endsWith('.md')) continue;
          const van = fs.readFileSync(p2, 'utf8');
          /* Chỉ đọc khối front matter ở đầu file: chữ `draft: true` nằm giữa
             thân bài là nội dung, không phải lời khai. */
          const m = van.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          if (!m) continue;
          /* Hai lý do một bài chưa được phép lên sóng, và cả hai hỏng theo
             cùng một kiểu nếu bộ dựng quên: file nằm công khai trên máy chủ,
             ai đoán trúng đường dẫn là đọc được. */
          const laNhap = /^draft\s*:\s*true\s*$/m.test(m[1]);
          const mNgay = m[1].match(/^date\s*:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
          const laHen = !!(mNgay && mNgay[1] > new Date().toISOString().slice(0, 10));
          if (!laNhap && !laHen) continue;
          const viSao = laNhap ? '`draft: true`' : `hẹn ngày ${mNgay[1]}`;
          /* Đường dẫn bài: thư mục con làm chuyên mục, tên file bỏ phần ngày. */
          const muc = path.relative(thuBai, path.dirname(p2)).split(path.sep).filter(Boolean);
          const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
          ds.push({ file: path.relative(goc, p2), viSao,
                     url: '/posts/' + [...muc, slug].join('/') + '/' });
        }
      })(thuBai);

      return ds.flatMap((b) => {
        const coFile = fs.existsSync(path.join(dist, ...b.url.split('/').filter(Boolean), 'index.html'));
        const them = [coFile && 'dist/', sm.includes(b.url) && 'sitemap.xml',
                      rss.includes(b.url) && 'feed.xml'].filter(Boolean);
        return them.length
          ? [`${b.file} (${b.viSao}) vẫn lộ ở ${them.join(' + ')} ` +
             `(${b.url}) — chạy \`npm run build\` không kèm --nhap`]
          : [];
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
    /* ── MỖI CÚ PHÁP PHẢI CÓ CẢ BỘ DỰNG LẪN CSS ──
       Đây là lỗi đã gặp thật, hai chiều:

         · `.prose kbd`, `.prose small`, `.prose abbr` có CSS từ lâu mà KHÔNG
           có cú pháp nào sinh ra chúng — ba luật trang trí không ai dùng được,
           nằm im nhiều tháng;
         · `{.giua}` thì ngược lại: bộ dựng nhận nó và in ra `class="giua"`,
           nhưng không có luật CSS nào — gõ vào thì đoạn ấy trông y hệt đoạn
           thường, và không ai biết vì sao.

       Cả hai đều KHÔNG báo lỗi gì: trang vẫn dựng sạch, vẫn mở được. Nên phải
       có một phép kiểm chạy thật bộ dựng rồi soi lại CSS.

       Chỉ canh những thứ ĐÃ CÓ NÚT trong ô soạn thảo: một cú pháp có nút mà
       không ra hình là người viết bấm rồi ngồi đoán. Thứ chỉ gõ tay được thì
       để tài liệu lo. */
    ten: 'Mỗi nét có nút đều dựng ra thẻ thật và có luật CSS đi kèm',
    muc: 'loi',
    chay: ({ goc }) => {
      const ra = [];
      /* ── BỎ CHÚ THÍCH TRƯỚC KHI SOI ──
         Lần cắm lỗi thứ hai vẫn xanh, và lý do là chú thích: ngay phía trên
         luật `.prose .nho` có một dòng giải thích viết `{.nho}` trong đó. Xoá
         luật đi thì chuỗi `.nho` vẫn còn nguyên trong chú thích, và phép kiểm
         vẫn tìm thấy.

         Chú thích trong file này dày hơn mã, nên đây không phải ca hiếm — gần
         như MỌI tên lớp đều được nhắc trong một chú thích nào đó. Không bỏ
         chú thích thì phép kiểm không bao giờ đỏ được. */
      const css = fs.readFileSync(path.join(goc, 'src', 'styles', 'prose.css'), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ');
      const THU = [
        ['m^2^',        '<sup>',          ':is(sup,sub)'],
        ['H~2~O',       '<sub>',          ':is(sup,sub)'],
        ['[[Esc]]',     '<kbd>',          'kbd'],
        ['x ~~y~~',     '<del>',          null],
        ['x ==y==',     '<mark>',         null],
        ['x {.nho}',    'class="nho"',    '.nho'],
        ['x {.giua}',   'class="giua"',   '.giua'],
        ['x {tím: y}',  'class="c-tim"',  '.c-tim']
      ];
      /* ── TÌM THEO MỐC, KHÔNG TÌM THEO CHUỖI CON ──
         Bản đầu dùng `css.includes('.prose .nho')`. Cắm lỗi vào thử thì nó
         KHÔNG bắt: đổi tên lớp thành `.nho-TAT` vẫn còn nguyên chuỗi con
         `.prose .nho` bên trong, nên phép kiểm vẫn xanh trong khi luật đã mất.

         Nay đòi ký tự ngay sau tên lớp KHÔNG được là chữ, số, gạch dưới hay
         gạch ngang — tức là tên phải kết thúc đúng ở đó. Cắm lại đúng cái lỗi
         cũ thì nó đỏ. */
      const coLuat = (lop) => new RegExp(
        lop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(css);

      for (const [md, mongDoi, lop] of THU) {
        let html = '';
        try { html = dungMD(md).html; } catch (e) { html = 'LỖI: ' + e.message; }
        if (!html.includes(mongDoi)) {
          ra.push(`cú pháp \`${md}\` không còn dựng ra ${mongDoi} — ô soạn thảo có nút cho nó`);
        }
        if (lop && !coLuat(lop)) {
          ra.push(`\`${md}\` dựng ra được nhưng prose.css thiếu luật cho ${lop} — gõ vào không thấy gì đổi`);
        }
      }
      /* `~~gạch~~` và `~dưới~` không được ăn nhau. Hai biểu thức đang có chốt
         `[^~]` ở đầu và `(?!~)` ở cuối nên chúng độc lập với THỨ TỰ — đảo chỗ
         vẫn ra đúng, đã thử. Nhưng chốt ấy là thứ dễ bị gỡ mất lúc ai đó "dọn
         cho gọn", nên câu kiểm này canh KẾT QUẢ chứ không canh thứ tự. */
      const g = dungMD('~~bỏ~~ và H~2~O').html;
      if (!g.includes('<del>bỏ</del>') || !g.includes('<sub>2</sub>')) {
        ra.push('`~~gạch~~` và `~dưới~` đang ăn nhau — kiểm lại hai chốt [^~] và (?!~)');
      }
      return ra;
    }
  },
  {
    /* ── BẢNG NHÃN VÀ MÃ ĐỌC NÓ PHẢI KHỚP NHAU HAI CHIỀU ──
       Mọi chữ hiện trên giao diện quản trị sống ở đúng một chỗ: bảng `NHAN`
       trong `tools/build.mjs`. Build gói chúng thành JSON rồi gắn vào một
       thuộc tính `data-…-nhan`; mấy file trong `src/js/` đọc ra.

       Hai đầu ấy trôi xa nhau rất dễ, và cả hai chiều đều hỏng lặng lẽ:

       · Mã ĐỌC một khoá mà build không gửi → hiện ra chữ dự phòng tiếng Anh
         gõ cứng trong mã, tức là một chuỗi không đổi được từ cấu hình. Không
         có gì báo, vì nó vẫn ra chữ.
       · Build GỬI một khoá mà không ai đọc → mấy chục byte chết nằm trong
         thuộc tính `data-nhan` của MỌI trang, mãi mãi. Đo thật ở lượt rà này:
         15 nhãn như thế, 14 cái sót lại từ bảng Blocks đã bỏ từ lâu.

       Phép kiểm soi cả hai chiều. Chỗ đọc nhận ba lối viết đang dùng trong mã
       — `L('k')`, `nhan('k')`, và `.k` — vì mấy file không ra đời cùng lúc và
       mỗi file tự đặt tên hàm tra nhãn của nó. */
    ten: 'Bảng nhãn và mã đọc nó khớp nhau hai chiều',
    muc: 'loi',
    chay: ({ goc }) => {
      const fB = path.join(goc, 'tools', 'build.mjs');
      const thuJS = path.join(goc, 'src', 'js');
      if (!fs.existsSync(fB) || !fs.existsSync(thuJS)) return [];
      const build = fs.readFileSync(fB, 'utf8');
      const ra = [];

      /* Chỉ những khối `JSON.stringify({…})` đứng gần chữ "nhan" mới là bảng
         nhãn. `JSON.stringify` còn dùng cho JSON-LD, số trang, quy tắc tải
         trước — gom hết vào là phép kiểm đỏ ở những chỗ không liên quan. */
      const khoiNhan = [];
      for (let i = build.indexOf('JSON.stringify({'); i >= 0;
           i = build.indexOf('JSON.stringify({', i + 1)) {
        const truoc = build.slice(Math.max(0, i - 260), i);
        if (!/nhan|NHAN/.test(truoc)) continue;
        let j = build.indexOf('{', i), sau = 0, k = j;
        for (; k < build.length; k++) {
          if (build[k] === '{') sau++;
          else if (build[k] === '}') { sau--; if (!sau) { k++; break; } }
        }
        khoiNhan.push({ dong: build.slice(0, i).split('\n').length, than: build.slice(j, k) });
      }
      if (!khoiNhan.length) {
        return ['tools/build.mjs: không tìm thấy bảng nhãn nào — phép kiểm này đã lạc hậu'];
      }

      let maJS = '';
      const theoFile = {};
      for (const f of fs.readdirSync(thuJS)) {
        if (!f.endsWith('.js')) continue;
        const t = fs.readFileSync(path.join(thuJS, f), 'utf8')
                    .replace(/\/\*[\s\S]*?\*\//g, ' ');
        theoFile[f] = t; maJS += t;
      }
      const coDoc = (k) => {
        const e = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp("\\b(?:L|nhan)\\(\\s*['\"]" + e + "['\"]").test(maJS) ||
               new RegExp("\\." + e + "\\b").test(maJS) ||
               new RegExp("\\[['\"]" + e + "['\"]\\]").test(maJS);
      };

      const daGui = new Set();
      for (const { dong, than } of khoiNhan) {
        for (const m of than.matchAll(/(?:^|[,{\s])([A-Za-z0-9_]+)\s*:/g)) {
          daGui.add(m[1]);
          if (!coDoc(m[1])) {
            ra.push(`tools/build.mjs:${dong}: gửi nhãn \`${m[1]}\` mà không file nào ` +
                    'trong src/js/ đọc — mấy chục byte chết trên mọi trang');
          }
        }
      }

      for (const [f, t] of Object.entries(theoFile)) {
        for (const m of t.matchAll(/\b(?:L|nhan)\(\s*['\"]([A-Za-z0-9_]+)['\"]/g)) {
          if (!daGui.has(m[1])) {
            ra.push(`src/js/${f}: đọc nhãn \`${m[1]}\` mà bảng NHAN không gửi — ` +
                    'chữ ấy sẽ là chuỗi gõ cứng trong mã, không đổi được từ cấu hình');
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── og:image VÀ THẺ CON CỦA NÓ PHẢI LIỀN MỘT MẠCH ──
       `og:image:width`, `:height`, `:type`, `:secure_url`, `:alt` là THUỘC
       TÍNH CÓ CẤU TRÚC của Open Graph: chúng gắn vào cái `og:image` đứng ngay
       trước. Chen bất cứ thẻ nào vào giữa là cắt đứt liên kết.

       Chuyện đã xảy ra thật và sống rất lâu, vì nó chia bộ quét làm hai nhóm:

         · Dễ tính (Facebook, kể cả Sharing Debugger của họ) tự nối lại — mở
           debugger ra thấy đủ ảnh đủ chữ, không có gì sai.
         · Chặt (Zalo, LinkedIn, Slack, iMessage) bỏ mấy thẻ con, hoặc coi
           `og:image:secure_url` lạc loài là một ảnh MỚI không có đường dẫn —
           một mục ảnh hỏng thì cả thẻ chia sẻ bị bỏ, ra một dòng link trơ.

       Nên người dùng thấy "debugger đủ info mà share ra vẫn trơ", và đi tìm
       mãi ở phía ảnh. Phép kiểm này soi HTML ĐÃ DỰNG, không soi mẫu — mẫu đúng
       mà chỗ chèn sai thì vẫn hỏng. */
    ten: 'Thẻ con của og:image nằm liền ngay sau og:image',
    muc: 'loi',
    chay: ({ goc }) => {
      const dist = path.join(goc, 'dist');
      if (!fs.existsSync(dist)) return [];
      const ra = [];
      const CON = ['og:image:width', 'og:image:height', 'og:image:type',
                   'og:image:secure_url', 'og:image:alt'];
      /* Vài trang tiêu biểu là đủ: cả site đi qua cùng một mẫu shell. */
      const thu = ['index.html', 'about/index.html',
                   'posts/tan-man/chiec-guong/index.html'];
      for (const t of thu) {
        const f = path.join(dist, t);
        if (!fs.existsSync(f)) continue;
        const html = fs.readFileSync(f, 'utf8');
        const the = [...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"/g)]
                      .map((m) => m[1]);
        const i = the.indexOf('og:image');
        if (i < 0) { ra.push(`dist/${t}: không có og:image`); continue; }
        /* Mọi thẻ con phải nằm trong khối liền ngay sau `og:image`. */
        let j = i + 1;
        while (j < the.length && the[j].startsWith('og:image:')) j++;
        const trongKhoi = new Set(the.slice(i + 1, j));
        for (const c of CON) {
          if (the.includes(c) && !trongKhoi.has(c)) {
            ra.push(`dist/${t}: \`${c}\` bị tách khỏi \`og:image\` — ` +
                    `có "${the[i + 1]}" chen vào giữa. Zalo và mấy bộ quét chặt ` +
                    'sẽ bỏ cả thẻ chia sẻ, chỉ còn một dòng link trơ.');
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── LỆNH DANH SÁCH PHẢI ĐI QUA ĐÚNG MỘT CỬA ──
       Bốn lệnh `insertUnorderedList` · `insertOrderedList` · `indent` ·
       `outdent` của trình duyệt đều để lại hai loại hư hỏng:

       1 · HTML SAI, và mỗi kiểu sai mất một thứ khác nhau khi ra Markdown:

            <p><ul>…</ul></p>              cả danh sách bị nuốt
            <li>một<li>hai</li></li>       hai mục dính thành một dòng
            <ul><li>…</li><ul>…</ul></ul>  MẤT HẲN mục con khỏi bài

       2 · CON TRỎ BỊ KÉO ĐI. Đo thật ở Chromium: con trỏ đứng cuối chữ "Việc
           một" (offset 8), gọi `insertUnorderedList` xong nó nằm ở offset 0.
           Gõ tiếp là chữ mới chui vào TRƯỚC chữ cũ.

       Cả hai đều im lặng — chữ chỉ lộ ra sai lúc mở file .md, hoặc lúc người
       dùng thấy mình gõ ngược. `lamDanhSach()` lo cả hai: cắm mốc giữ con trỏ
       TRƯỚC khi gọi lệnh, gọi lệnh, dọn cấu trúc, rồi trả con trỏ về mốc.

       Nên luật là: bốn lệnh ấy chỉ được gọi từ TRONG `lamDanhSach`, không chỗ
       nào khác. Gọi thẳng `lenh('indent')` ở một nút mới là đỏ ngay — kể cả
       khi có nhớ gọi `donDanhSach()` sau, vì như thế vẫn mất con trỏ. */
    ten: 'Lệnh danh sách trong ô soạn thảo chỉ gọi từ lamDanhSach',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'js', 'soan.js');
      if (!fs.existsSync(f)) return [];
      const ma = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
      const LENH = ['insertUnorderedList', 'insertOrderedList', 'indent', 'outdent'];
      const ra = [];

      /* Thân của `lamDanhSach` — chỗ DUY NHẤT được phép gọi bốn lệnh ấy. */
      const iCua = ma.indexOf('function lamDanhSach');
      if (iCua < 0) {
        ra.push('src/js/soan.js: không còn `lamDanhSach()` — mọi lệnh danh sách ' +
                'đang gọi thẳng, con trỏ sẽ nhảy về đầu dòng sau mỗi cú bấm');
        return ra;
      }
      const cua = ma.slice(iCua, iCua + 260);
      if (!cua.includes('camMoc') || !cua.includes('donDanhSach')) {
        ra.push('src/js/soan.js: `lamDanhSach()` phải cắm mốc (camMoc) TRƯỚC khi ' +
                'gọi lệnh và dọn (donDanhSach) sau — thiếu một trong hai là mất ' +
                'con trỏ hoặc mất mục danh sách');
      }

      /* Tìm bằng chuỗi thẳng, KHÔNG bằng regex: mẫu cần tìm có sẵn dấu ngoặc
         và dấu nháy, mà mỗi lớp thoát là một dịp thoát hụt — bản đầu viết
         bằng regex và nó không khớp được dòng nào, tức là một phép kiểm luôn
         xanh vì lý do sai. */
      let soCho = 0;
      for (const l of LENH) {
        for (const mau of [`lenh('${l}')`, `execCommand('${l}')`,
                           `lamDanhSach('${l}')`]) {
          let i2 = ma.indexOf(mau);
          while (i2 >= 0) {
            soCho++;
            /* Qua cửa: hợp lệ, không cần xét gì thêm. */
            if (mau.startsWith('lamDanhSach')) { i2 = ma.indexOf(mau, i2 + 1); continue; }
            /* Gọi thẳng thì phải TỰ cắm mốc ngay trước — `chenViec` đi đường
               này, vì nó còn phải đánh dấu `data-viec` giữa lệnh và lúc trả
               con trỏ về. */
            const truoc = ma.slice(Math.max(0, i2 - 200), i2);
            if (!truoc.includes('camMoc')) {
              ra.push(`src/js/soan.js: \`${mau}\` gọi ngoài lamDanhSach và ` +
                      'không tự cắm mốc — con trỏ sẽ nhảy về đầu dòng sau cú bấm');
            }
            i2 = ma.indexOf(mau, i2 + 1);
          }
        }
      }
      if (!soCho) {
        ra.push('src/js/soan.js: không còn chỗ nào gọi bốn lệnh danh sách — ' +
                'phép kiểm này đã lạc hậu, sửa lại danh sách LENH');
      }
      return ra;
    }
  },
  {
    /* ── GÕ TẮT MARKDOWN PHẢI HOÃN MỘT NHỊP ──
       `goTat()` chạy TRONG sự kiện `input`. Gọi `execCommand` ngay trong một
       sự kiện `input` thì Chromium lặng lẽ bỏ qua — đo được là chữ mồi biến
       mất đúng như mong, nhưng khối không đổi: gõ `# ` ra `<p>` chứ không ra
       `<h2>`. Không báo lỗi, không ném gì, chỉ là không xảy ra.

       Nên mọi lệnh trong `MAU_GO` phải đi qua một `setTimeout`, để nó chạy sau
       khi sự kiện đã xong. Bỏ cái hoãn ấy đi là gõ tắt chết câm. */
    ten: 'Gõ tắt Markdown hoãn lệnh ra ngoài sự kiện input',
    muc: 'loi',
    chay: ({ goc }) => {
      const f = path.join(goc, 'src', 'js', 'soan.js');
      if (!fs.existsSync(f)) return [];
      const ma = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
      if (!ma.includes('MAU_GO')) return [];
      const i = ma.indexOf('function goTat');
      if (i < 0) {
        return ['src/js/soan.js: có bảng MAU_GO mà không còn `goTat()` — ' +
                'gõ tắt Markdown đã mất đường chạy'];
      }
      /* Cắt đúng thân hàm bằng đếm ngoặc, KHÔNG bằng một cửa sổ bao nhiêu
         ký tự: bản đầu lấy 900 ký tự và cửa sổ ấy tràn sang `luuNhap()` ngay
         bên dưới — hàm ấy có sẵn một `setTimeout`, nên phép kiểm xanh cả khi
         `goTat` đã bị gọi thẳng. Thử phá mới lòi ra. */
      const moKhoi = ma.indexOf('{', i);
      let sau = 0, het = moKhoi;
      while (het < ma.length) {
        if (ma[het] === '{') sau++;
        else if (ma[het] === '}' && --sau === 0) break;
        het++;
      }
      const than = ma.slice(i, het);
      if (!than.includes('setTimeout')) {
        return ['src/js/soan.js: `goTat()` gọi lệnh thẳng trong sự kiện input — ' +
                'Chromium bỏ qua, gõ `# ` sẽ mất chữ mồi mà không thành tiêu đề; ' +
                'bọc lệnh trong setTimeout(..., 0)'];
      }
      return [];
    }
  },
  {
    /* ── BA NGĂN QUẢN TRỊ PHẢI ĐI CHUNG MỘT KHUÔN HÀNG ──
       Post, Category và Comment đều bày một danh sách để điểm danh rồi thao
       tác. Ba ngăn ấy TỪNG có ba bộ luật CSS riêng ở hai file khác nhau, và
       chúng trôi xa nhau: hai ngăn ra danh sách dòng mười lăm mục một màn,
       ngăn còn lại ra một cọc thẻ có viền bốn mục một màn. Không có gì báo,
       vì mỗi bộ luật đều "đúng" trong phạm vi của nó.

       Phép kiểm này canh ba điều, và cả ba đều là chuyện đã xảy ra thật:

       1. Ngăn nào dựng danh sách cũng phải đi qua `.ad-dong`. Thiếu là có
          người vừa dựng bộ luật thứ hai.
       2. Không file nào còn dùng tên của mấy bộ luật đã bỏ. Sót một tên là
          ngăn ấy lặng lẽ không có luật nào, hoặc tệ hơn: nhặt phải luật của
          một thứ khác trùng tên (xem `.bl-dong` ở §20 DESIGN-SYSTEM).
       3. Mọi tên `.ad-*` gõ trong JS phải có luật CSS đi kèm — gõ sai một chữ
          thì hàng ấy mất đúng một thuộc tính, và mắt không bắt được.

       Đầy đủ: docs/DESIGN-SYSTEM.md §20. */
    ten: 'Ba ngăn quản trị dùng chung một khuôn hàng .ad-*',
    muc: 'loi',
    chay: ({ goc }) => {
      const NGAN = ['viet-bai.js', 'muc.js', 'duyet.js'];
      /* Tên của mấy bộ luật cũ. `bl-dong` nằm đây vì nó vừa là tên hàng cũ của
         bàn duyệt, vừa là tên một cái NÚT — đúng cặp đã đụng nhau. */
      const BO = ['vb-dong', 'vb-cd', 'vb-nho', 'vb-bang', 'vb-chan', 'vb-loc',
                  'vb-tim', 'vb-thanh', 'mc-dong-ql', 'ql-mo', 'bl-dong'];
      const ra = [];
      /* Một tên bị trùng thì cả ba file đều báo — nó là lỗi của CSS, không
         phải của từng file JS. Gom lại để nói đúng một lần. */
      const daBao = new Set();

      /* Từ V17 CSS chia theo loại trang, và khuôn hàng `.ad-*` nằm ở
         admin.css. Đọc CẢ thư mục thay vì liệt kê tên file: thêm một file
         style mới mà quên thêm vào đây thì phép kiểm báo thiếu luật giả. */
      const css = fs.readdirSync(path.join(goc, 'src', 'styles'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => fs.readFileSync(path.join(goc, 'src', 'styles', f), 'utf8'))
        .join('\n')
        /* Bỏ chú thích TRƯỚC khi dò: file CSS ở đây chú thích dày hơn mã, và
           gần như mọi tên lớp đều được nhắc trong một câu giải thích nào đó.
           Không bỏ thì phép kiểm không bao giờ đỏ được — đã vấp đúng bẫy này
           một lần ở phép kiểm nét-có-nút. */
        .replace(/\/\*[\s\S]*?\*\//g, ' ');
      const coLuat = (lop) =>
        new RegExp('\\.' + lop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(css);

      /* Bản CSS đã bỏ mọi khối `@media{...}`, để đếm số lần một tên được khai
         TRẦN. Cắt bằng cách đếm ngoặc thay vì regex: `@media` chứa nhiều luật
         lồng nhau, mà regex không đếm được ngoặc. */
      const cssNgoaiMedia = (() => {
        let ra2 = '', i = 0;
        while (i < css.length) {
          const j = css.indexOf('@media', i);
          if (j < 0) { ra2 += css.slice(i); break; }
          ra2 += css.slice(i, j);
          let k = css.indexOf('{', j), sau = 1;
          if (k < 0) break;
          k++;
          while (k < css.length && sau > 0) {
            if (css[k] === '{') sau++;
            else if (css[k] === '}') sau--;
            k++;
          }
          i = k;
        }
        return ra2;
      })();

      for (const ten of NGAN) {
        const f = path.join(goc, 'src', 'js', ten);
        if (!fs.existsSync(f)) { ra.push(`thiếu src/js/${ten}`); continue; }
        const ma = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');

        if (!/\bad-dong\b/.test(ma)) {
          ra.push(`src/js/${ten} dựng danh sách mà không dùng .ad-dong — ` +
                  'xem docs/DESIGN-SYSTEM.md §20');
        }
        for (const cu of BO) {
          if (new RegExp('(?<![\\w-])' + cu + '(?![\\w-])').test(ma)) {
            ra.push(`src/js/${ten} còn dùng tên đã bỏ "${cu}" — đổi sang bộ .ad-*`);
          }
        }
        /* Tên gõ ghép động (`'ad-cd ad-cd--' + trang`) để lại một đuôi `--`;
           cắt đi rồi mới tra, vì phần biến thiên nằm ở CSS dưới dạng nhiều
           luật riêng và không đoán được từ đây. */
        const dung = new Set(
          [...ma.matchAll(/\bad-[a-z0-9-]+/g)].map((m) => m[0].replace(/-+$/, ''))
        );
        for (const lop of dung) {
          if (!coLuat(lop)) ra.push(`src/js/${ten} gõ .${lop} nhưng không có luật CSS nào`);
          /* ── MỘT TÊN, MỘT CHỦ ──
             "Có luật CSS" chưa đủ: luật ấy có thể là của một thứ KHÁC trùng
             tên. Chuyện đã xảy ra ngay trong lượt dựng khuôn này — `.ad-nut`
             vốn là nút tab ở cột trái của /z-admin/, mà khuôn hàng mới cũng
             lấy đúng cái tên ấy cho nút trên từng dòng. Luật sau đè luật
             trước, và mấy cái tab bên trái teo lại còn một dúm chữ.

             Nên đếm: một tên chỉ được khai TRẦN (`.x{`) đúng một lần. Bỏ mấy
             khối `@media` trước khi đếm — khai lại ở đó là chuyện bình thường
             và cần thiết, đó là cách một luật đổi theo khổ màn hình. */
          /* Chỉ đếm luật mà bộ chọn là ĐÚNG `.tên` — tức đứng ngay sau đầu
             file hoặc sau một dấu `}`. Không đếm `.cha .tên{`: đó là một luật
             ĐI KÈM ngữ cảnh, chuyện bình thường và không phải trùng tên. */
          const soLan = (cssNgoaiMedia.match(
            new RegExp('(^|\\})\\s*\\.' + lop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                       '\\s*\\{', 'g')) || []).length;
          if (soLan > 1 && !daBao.has(lop)) {
            daBao.add(lop);
            ra.push(`.${lop} được khai ${soLan} lần ở hai chỗ khác nhau — ` +
                    'hai thứ đang dùng chung một tên, luật sau đè luật trước');
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── PHẦN DIỄN GIẢI: TỐI ĐA BA GẠCH ĐẦU DÒNG ──
       Mỗi bản có một mục `## Vx.y.z` ở dưới bảng, và ngăn phiên bản ở chân
       trang đọc thẳng mấy gạch đầu dòng ấy ra màn hình. Sáu bảy gạch trong một
       mục thì cái ngăn ấy phải cuộn, và người bấm vào để xem "bản này đổi gì"
       nhận về một bài đọc.

       Ba là chỗ vừa: đủ kể ba việc chính, và ép người viết chọn ra ba.

       ── VÌ SAO CHỈ SOI BẢN MỚI NHẤT ──
       137 mục cũ viết trước luật này, nhiều mục bốn năm gạch. Bắt cả sổ thì
       phép kiểm đỏ vĩnh viễn ở những chỗ không ai được phép sửa (sửa là sửa
       lịch sử), mà một phép kiểm đỏ mãi thì người ta thôi nhìn nó. */
    ten: 'Phần diễn giải của bản mới nhất có tối đa 3 gạch đầu dòng',
    muc: 'loi',
    chay: ({ goc }) => {
      const so = docSo(goc);
      if (so.loi || !so.moiNhat) return [];
      const chi = docChiTiet(goc)[so.moiNhat.ten];
      if (!chi) return [];
      return chi.length <= 3 ? []
        : [`${so.moiNhat.ten} — phần diễn giải có ${chi.length} gạch đầu dòng, ` +
           'tối đa 3. Gộp lại, hoặc tách việc sang một bản vá nữa.'];
    }
  },
  {
    /* ── MỘT DÒNG SỔ CHỞ TỐI ĐA BỐN VIỆC ──
       Cột "Sửa chính" hiện ra trong ngăn phiên bản ở chân trang, tức là người
       đọc blog mở ra xem được. Sáu bảy mệnh đề nối bằng dấu chấm phẩy ở đó là
       một khối chữ không ai đọc hết — và cả cuốn sổ mất tác dụng.

       `tools/version.mjs` đã chặn ngay lúc ghi. Phép kiểm này soi lại, vì có
       những dòng vào sổ bằng đường khác: sửa tay, trộn nhánh, hay một bản công
       cụ cũ hơn.

       ── VÌ SAO CHỈ SOI DÒNG MỚI NHẤT ──
       Sổ có sẵn mấy dòng chở năm việc, từ trước lúc có luật này. Số phiên bản
       đã in ra chân trang và đã lên kho mã, nên sửa lại là sửa lịch sử — mà
       bắt cả bảng thì phép kiểm đỏ vĩnh viễn ở những dòng không ai được phép
       động vào, và một phép kiểm đỏ vĩnh viễn thì chỉ có một kết cục: người ta
       thôi nhìn nó. Dòng đầu là dòng đang được in ra trang NGAY LÚC NÀY, và
       cũng là dòng duy nhất còn sửa được. */
    ten: 'Dòng mới nhất trong sổ phiên bản chở tối đa 4 việc',
    muc: 'loi',
    chay: ({ goc }) => {
      const so = docSo(goc);
      if (so.loi || !so.ban.length) return [];
      const moi = so.ban[0];
      const viec = moi.suaChinh.split(';').map((x) => x.trim()).filter(Boolean);
      if (viec.length <= 4) return [];
      return [`${moi.ten} — dòng này chở ${viec.length} việc, tối đa 4. ` +
              `Chia ra thành ${moi.ten} và bản vá kế tiếp (đuôi chạy tới 09).`];
    }
  },
  {
    ten: 'Số phiên bản đúng luật: ba tầng 0–9, cột # khớp vế cuối, không dùng số kiêng',
    muc: 'loi',
    chay: ({ goc }) => {
      const so = docSo(goc);
      if (so.loi || !so.ban.length) return [];
      const ra = [];
      /* ── SỐ BUILD KIÊNG ──
         Chép lại từ `BUILD_BO` trong tools/lib/lichsu.mjs. Hai bản, và cố ý:
         bên kia là luật LÚC GHI (nhảy qua khi sinh số mới), bên này là luật
         LÚC KIỂM (bắt cả những dòng vào sổ bằng cách khác — sửa tay, trộn
         nhánh, hay một bản công cụ cũ hơn). Một cái chặn, một cái soi; cùng
         một danh sách nhưng không thay được cho nhau. */
      const BUILD_BO = [13, 14, 23, 38, 39, 40, 41];
      for (const b of so.ban) {
        if (BUILD_BO.includes(b.build)) {
          ra.push(`${b.ten} — build ${b.build} nằm trong danh sách số kiêng ` +
                  `(${BUILD_BO.join(', ')}); đổi sang số kế tiếp hợp lệ`);
        }
        if (b.va > 9) {
          ra.push(`${b.ten} — vế bản vá chỉ chạy 0..9; sau V${b.build}.${b.dot}.9 là ` +
                  `V${b.build}.${b.dot + 1}.0, không phải ${b.ten}`);
        }
        if (b.dot > 9) {
          ra.push(`${b.ten} — vế đợt cũng chỉ chạy 0..9; sau V${b.build}.9.9 là ` +
                  `build kế tiếp, không phải ${b.ten}`);
        }
        if (/^\d+$/.test(b.so) && +b.so !== b.va) {
          ra.push(`${b.ten} — cột # ghi ${b.so} nhưng vế bản vá là ${String(b.va).padStart(2, '0')}`);
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
      /* ── FILE `.mjs` LÀ MODULE, KHÔNG DỊCH ĐƯỢC NHƯ SCRIPT THƯỜNG ──
         `new Function()` dựng một script cổ điển, mà `import`/`export` là cú
         pháp chỉ hợp lệ trong module — nên một module hoàn toàn đúng vẫn ném
         "Cannot use import statement outside a module". Đó là phép kiểm nói
         sai, không phải file sai.

         Không `import()` thật được: đường dẫn trong mấy file ấy là tuyệt đối
         theo GỐC TRANG (`/assets/…`), mà dưới `file://` thì gốc là gốc ổ đĩa.

         Nên cắt mấy dòng `import`/`export` đi rồi mới dịch phần thân. Đúng thứ
         phép kiểm này vốn lo: bộ cắt chú thích có làm hỏng cú pháp không. */
      const boModule = (s) => s
        .replace(/^\s*import[^;]*;/gm, '')
        .replace(/^\s*export\s+\{[^}]*\}[^;]*;/gm, '')
        .replace(/^(\s*)export\s+/gm, '$1');
      return fs.readdirSync(thuMuc)
        .filter((f) => f.endsWith('.js') || f.endsWith('.mjs')).flatMap((f) => {
        try {
          const ma = fs.readFileSync(path.join(thuMuc, f), 'utf8');
          new Function(f.endsWith('.mjs') ? boModule(ma) : ma);
          return [];
        }
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
                              ['data-viet-bai-host', 'Post'],
                              ['data-muc-host', 'Category']]) {
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

      for (const j of ['admin.js', 'viet-bai.js', 'muc.js']) {
        if (!nhacAssets(ql.html, j)) ra.push(`/z-admin/ không nạp ${j}`);
        if (!fileAssets(j)) {
          ra.push(`thiếu dist/assets/${j} — thêm vào danh sách chép trong tools/build.mjs`);
        }
      }

      /* Ngăn thứ hai trở đi PHẢI mang `hidden` ngay trong HTML tĩnh. Thiếu nó
         thì trong khoảnh khắc trước lúc admin.js chạy, cả mấy khung hiện chồng
         lên nhau rồi lần lượt biến mất — một cú giật thấy rõ mỗi lần mở trang.

         Đếm theo SỐ NGĂN THẬT thay vì gõ cứng một con số: thêm ngăn thứ tư
         (Category) mà quên sửa phép kiểm thì nó báo lỗi ở đúng chỗ không có
         lỗi, và người sửa mất một vòng mới biết là phép kiểm sai chứ không
         phải trang sai. */
      const tong = (ql.html.match(/role="tabpanel"/g) || []).length;
      const an = (ql.html.match(/role="tabpanel"[^>]*hidden/g) || []).length;
      if (tong && an !== tong - 1) {
        ra.push(`/z-admin/ có ${tong} ngăn mà ${an} cái mang hidden sẵn, đáng lẽ ${tong - 1} — mở trang sẽ thấy giật`);
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
        if (!nhacAssets(t.html, 'ghi-chu.js')) {
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
      .filter((t) => !/class="post-layout[^"]*post-insta/.test(t.html))
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
      /* ── CHỈ TRANG CHỦ ──
         /about/ từng nằm trong danh sách này. Bỏ ra ở V2.8.1: tiêu đề trang ấy
         là "About me", nên khi thanh đầu trang chỉ bày một đoá hoa thì trên cả
         trang không còn một chữ nào nói đây là blog nào. Trang chủ thì khác —
         khối chữ "Zoey in Borderland" cao bằng nửa màn nằm ngay dưới thanh. */
      const CHO_KE = ['/'];
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
      /* ── ĐỌC GÓI `nen`, KHÔNG PHẢI `style.css` ──
         Luật logo nằm ở `layout.css`, tức gói `nen`. Dòng này từng tìm
         `style.css` — cái tên của thời mọi trang tải chung một file. Từ lượt
         chia CSS theo loại trang thì không còn file nào tên thế, `fileAssets`
         trả về null, và câu `if (!fCss) return []` ngay dưới khiến phép kiểm
         ÂM THẦM ĐI QUA. Nó không đỏ được nữa, và không ai biết.

         Nay thiếu gói là BÁO LỖI chứ không bỏ qua: một phép kiểm không chạy
         được thì phải nói ra, không thì nó chỉ là một dòng xanh dối. */
      const fCss = fileAssets('nen.css');
      if (!fCss) return ['không tìm thấy gói CSS `nen` trong dist/assets/ — '
                       + 'phép kiểm này không chạy được'];
      const css = fs.readFileSync(fCss, 'utf8');
      /* Lấy khai báo CUỐI CÙNG: cùng độ ưu tiên thì luật sau thắng, và build
         ghi đè giá trị của cấu hình vào cuối bundle. */
      const dsCss = [...css.matchAll(/--lg-ck:\s*([\w.]+)/g)].map((m) => m[1]);
      if (!dsCss.length) return ['gói CSS `nen` không có --lg-ck nào'];
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
      /* Khối liệt kê của một thư mục trong bản đồ file ở README: dòng mở đầu
         bằng chính đường dẫn ấy, rồi mọi dòng thụt vào tiếp sau. */
      const layKhoi = (dau) => {
        const dong = doc.split('\n');
        const giu = [];
        for (let i = 0; i < dong.length; i++) {
          if (!dong[i].startsWith(dau)) continue;
          giu.push(dong[i]);
          for (let j = i + 1; j < dong.length && /^\s+\S/.test(dong[j]); j++) giu.push(dong[j]);
        }
        return giu.join('\n');
      };

      for (const [thu, mo] of [['src/js', 'src/js/'], ['functions/api', 'functions/api/']]) {
        const d = path.join(GOC, thu);
        if (!fs.existsSync(d)) continue;
        const khoiKe = layKhoi(mo);
        if (!khoiKe) { ra.push(`README không có khối liệt kê cho ${mo}`); continue; }
        for (const f of fs.readdirSync(d)) {
          if (!f.endsWith('.js') || f.startsWith('_')) continue;
          const ten = f.replace(/\.js$/, '');
          /* ── TÌM TRONG ĐÚNG KHỐI CỦA THƯ MỤC ẤY, KHÔNG TÌM CẢ README ──
             Bản trước khớp tên TRẦN bằng ranh giới từ, trên toàn bộ file. Điều
             đó biến mọi tên file ngắn thành một từ tiếng Việt hoặc một tên
             công cụ: `functions/api/anh.js` vừa thêm vào đã xanh ngay, vì
             README có sẵn `npm run anh` và một `tools/ … anh …` chẳng liên
             quan gì. Một file mới toanh coi như đã được kể tới, mà chưa ai
             viết một dòng nào về nó.

             Không siết sang "phải kèm đuôi .js" được: bản đồ file trong README
             cố ý viết tên trần cho gọn (`theme · nen · toc · …`), và bắt thêm
             đuôi là bắt viết lại cả bản đồ cho một phép kiểm.

             Nên siết ở PHẠM VI: chỉ đọc khối liệt kê của chính thư mục ấy —
             dòng mở đầu bằng tên thư mục, cộng mọi dòng thụt vào ngay dưới nó. */
          if (!khoiKe.includes(f) &&
              !new RegExp('(^|[^\\w-])' + ten.replace(/-/g, '\\-') + '($|[^\\w-])').test(khoiKe)) {
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
    /* ── MỘT CỤM NÚT, MỘT CHỖ ĐỨNG, MỌI KHUNG ──
       Cụm tim · chia sẻ · bình luận nằm CUỐI HÀNG META, mọi khung bài như
       nhau. Đời trước nó đi ba đường tuỳ khung và phép kiểm này canh cả ba;
       nay chỉ còn một đường, nên phép kiểm canh đúng một điều — và canh chặt
       hơn hẳn, vì "một chỗ duy nhất" chỉ có nghĩa khi không có ngoại lệ nào
       lọt qua.

       Canh luôn hai chuyện đi kèm, vì cả hai đều hỏng ÂM THẦM:
         · hai ô đếm phải nằm TRÊN NÚT (`data-thich-so`, `data-bl-so` trong
           `.cum-nut`). Chúng từng là hai ô chữ riêng ở hàng meta; để sót một
           bản cũ ở đâu đó là bài ấy hiện hai trái tim.
         · khung bình luận phải đứng NGAY SAU hàng tag, trước khối "đọc tiếp".
           Sai thứ tự thì cú bấm nút bình luận mở ra một khung nằm dưới cả
           danh sách gợi ý — vẫn chạy, chỉ là nhảy tới sai chỗ. */
    ten: 'Cụm tim · chia sẻ · bình luận: đúng một cụm, nằm trong hàng meta',
    muc: 'loi',
    chay: ({ trang }) => {
      const ra = [];
      for (const t of trang) {
        if (!/class="post-layout/.test(t.html)) continue;
        const so = (t.html.match(/class="cum-tt"/g) || []).length;
        if (so !== 1) { ra.push(`${t.url} — có ${so} cụm tương tác, phải đúng 1`); continue; }

        /* Cụm phải nằm TRONG `<div class="meta-row"> … </div>`. Tìm mốc đóng
           bằng `</div>` đầu tiên sau hàng meta: hàng ấy chỉ chứa span, time và
           button, không có div lồng nào. */
        const iHang = t.html.indexOf('class="meta-row"');
        const iHet  = iHang < 0 ? -1 : t.html.indexOf('</div>', iHang);
        const iCum  = t.html.indexOf('class="cum-tt"');
        if (!(iHang >= 0 && iCum > iHang && iCum < iHet)) {
          ra.push(`${t.url} — cụm tương tác không nằm trong hàng meta`);
        }

        const cum = iCum < 0 ? '' : t.html.slice(iCum, t.html.indexOf('</span>\n  </span>', iCum) + 20);
        for (const [re, chu] of [
          [/class="bl-nut bl-tim\b/,  'thiếu nút tim'],
          [/class="bl-nut bl-chia\b/, 'thiếu nút chia sẻ'],
          [/class="bl-nut bl-mo\b/,   'thiếu nút bình luận'],
          [/data-thich-so/,           'thiếu ô đếm lượt thích trên nút tim'],
          [/data-bl-so/,              'thiếu ô đếm bình luận trên nút bình luận']
        ]) {
          if (!re.test(cum)) ra.push(`${t.url} — ${chu}`);
        }

        /* Hai ô đếm cũ ở hàng meta: một trái tim để đọc cạnh một trái tim để
           bấm. Nếu còn, nghĩa là xemHTML chưa được dọn. */
        const hang = iHang < 0 ? '' : t.html.slice(iHang, iHet);
        if (/class="thich"/.test(hang)) {
          ra.push(`${t.url} — hàng meta còn ô đếm rời; số phải nằm trên nút`);
        }
        if (/class="bl-dem"/.test(t.html)) {
          ra.push(`${t.url} — còn ô đếm kiểu cũ trên nút bình luận`);
        }
        if (/class="cum-nhan"/.test(t.html)) {
          ra.push(`${t.url} — còn nhãn "Leave a note"; ba icon đã nói thay nó`);
        }
        if (!/class="btn btn--ghost bl-lui"/.test(t.html)) {
          ra.push(`${t.url} — khung bình luận thiếu nút Back`);
        }

        /* Thứ tự chân bài: tag → bình luận → đọc tiếp. Khung A không có khối
           "đọc tiếp" ở chân bài (nó lên cột bên), nên chỉ canh khi có mặt. */
        const iTag = t.html.indexOf('class="post-tags"');
        const iBL  = t.html.indexOf('class="binh-luan"');
        const iDoc = Math.max(t.html.indexOf('class="read-next"'),
                              t.html.indexOf('class="rn-cap"'));
        if (iTag >= 0 && iBL >= 0 && iBL < iTag) {
          ra.push(`${t.url} — khung bình luận đứng trước hàng tag`);
        }
        if (iDoc >= 0 && iBL >= 0 && iDoc < iBL && iDoc > iTag) {
          ra.push(`${t.url} — khối "đọc tiếp" chen vào giữa tag và bình luận`);
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

      /* Mọi ô có khai grid-column ở phần desktop (ngoài @media).
         Mẫu `.bo-*` bắt cả `.bo--cot`, `.bo-dai`, `.bo-hang` — kể tên từng ô
         thì mỗi lần thêm một dải mới lại phải nhớ sửa chỗ này, mà quên thì
         phép kiểm im lặng đúng vào lúc nó cần lên tiếng. */
      const ngoai = css.split('@media')[0];
      const o = new Set();
      for (const m of ngoai.matchAll(/\.(bo-[\w-]+)\s*\{[^}]*grid-column/g)) o.add(m[1]);

      /* Danh sách được kéo về cột 1 trong khối @media hẹp */
      const kh = css.match(/@media\s*\(max-width:\s*860px\)\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*2/);
      const ten = new Set();
      if (kh) for (const m of kh[0].matchAll(/\.(bo-[\w-]+)/g)) ten.add(m[1]);

      return [...o].filter((x) => !ten.has(x)).map((x) =>
        `src/styles/about.css — ô .${x} có grid-column nhưng không nằm trong luật ` +
        `gộp về một cột ở @media (max-width:860px) ⇒ trang sẽ tràn ngang trên điện thoại`);
    }
  },
  {
    /* ── CHÚ THÍCH VÀ NGOẶC TRONG CSS PHẢI ĐÓNG ĐỦ ──
       Một chú thích mở mà không đóng thì nuốt sạch mọi luật phía sau nó. Một
       dấu đóng chú thích thừa thì trình duyệt coi chỗ đó là rác, và nó bỏ
       luôn KHỐI LUẬT KẾ TIẾP để tìm lại chỗ đứng.

       Cả hai đã xảy ra thật, cùng một lượt, lúc tách `list.css` ra bốn file:
       `admin.css` mất dòng mở của một khối chú thích, và dấu đóng còn lại
       nuốt đúng `.ad-thanh` ngay bên dưới — thanh công cụ ở /z-admin/ thôi
       là flex, ô tìm kiếm giãn hết bề ngang, hàng chip lọc rơi về bên trái.
       `soan.css` thì đứt hẳn phần đuôi, để lại một chú thích mở lơ lửng.

       KHÔNG có gì báo: `npm run build` vẫn chạy, bộ rút gọn CSS vẫn nuốt
       trôi, trang vẫn hiện. Chỉ mắt người mở đúng trang ấy ra mới thấy.
       Nên phải quét ở đây. */
    ten: 'Chú thích và ngoặc trong mọi file CSS đều đóng đủ',
    muc: 'loi',
    chay: () => {
      const thuMuc = path.join(GOC, 'src', 'styles');
      if (!fs.existsSync(thuMuc)) return [];
      const ra = [];
      for (const ten of fs.readdirSync(thuMuc).filter((x) => x.endsWith('.css'))) {
        const s = fs.readFileSync(path.join(thuMuc, ten), 'utf8');
        let i = 0, trong = false, sau = 0, dong = 1, dongMo = 0;
        while (i < s.length) {
          if (s[i] === '\n') dong++;
          if (!trong && s[i] === '/' && s[i + 1] === '*') { trong = true; dongMo = dong; i += 2; continue; }
          if (trong && s[i] === '*' && s[i + 1] === '/') { trong = false; i += 2; continue; }
          if (!trong && s[i] === '*' && s[i + 1] === '/') {
            ra.push(`src/styles/${ten}:${dong} — dấu đóng chú thích thừa ⇒ `
                  + `trình duyệt bỏ luôn khối luật ngay sau nó`);
            i += 2; continue;
          }
          if (!trong && s[i] === '{') sau++;
          if (!trong && s[i] === '}') { if (--sau < 0) { ra.push(`src/styles/${ten}:${dong} — thừa một dấu }`); sau = 0; } }
          i++;
        }
        if (trong) ra.push(`src/styles/${ten}:${dongMo} — chú thích mở mà không đóng ⇒ `
                         + `mọi luật sau dòng này bị nuốt`);
        if (sau > 0) ra.push(`src/styles/${ten} — thiếu ${sau} dấu }`);
      }
      return ra;
    }
  },
  {
    /* ── TRANG NÀO DÙNG MỘT CỤM THÌ PHẢI TẢI LUẬT GỐC CỦA CỤM ẤY ──
       Từ lúc CSS chia theo loại trang, mỗi trang chỉ tải vài gói. Một cụm có
       luật nằm trong gói trang KHÔNG tải thì cụm ấy hiện lên trần trụi — mà
       trang vẫn dựng ra, vẫn không lỗi nào.

       Đã vấp thật: ô trích dẫn khai trong `about.css`, nhưng nó còn ở màn
       hero TRANG CHỦ. Trang chủ không tải `about.css`, nên câu trích dẫn mất
       phông nghiêng Cormorant, mất cặp dấu ngoặc kép hai đầu, nút xem câu
       khác rơi xuống đáy ô. Không ai biết cho tới lúc nhìn bằng mắt.

       Soi bằng TÊN LỚP thì không bắt được: `list.css` vẫn nhắc `.q-chu` ở
       luật `.hero-quote .q-chu{font-size}`, nên tên lớp coi như có đủ. Phải
       soi LUẬT TRẦN — luật mà bộ chọn đúng bằng `.tên-lớp`, không tổ tiên,
       không lớp kèm. Luật trần là định nghĩa gốc của cụm: thiếu nó là mất
       phông, mất viền, mất vị trí. */
    ten: 'Trang nào dùng một cụm thì gói CSS của trang có luật gốc của cụm',
    muc: 'loi',
    chay: () => {
      const tep = [];
      (function di(d) {
        for (const x of fs.readdirSync(d)) {
          const q = path.join(d, x);
          if (fs.statSync(q).isDirectory()) di(q);
          else if (x.endsWith('.html')) tep.push(q);
        }
      })(DIST);

      /* `.C`, `.C:hover`, `.C::before` — KHÔNG `.a .C`, `.C.d`, `.C > x` */
      const TRAN = /^\.(-?[_a-zA-Z][\w-]*)(::?[a-z-]+(\([^)]*\))?)*$/;
      const banTran = new Map();
      const thuAssets = path.join(DIST, 'assets');
      if (!fs.existsSync(thuAssets)) return [];
      for (const x of fs.readdirSync(thuAssets).filter((n) => n.endsWith('.css'))) {
        const noi = fs.readFileSync(path.join(thuAssets, x), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        const bo = new Set();
        for (const m of noi.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
          if (!m[2].trim()) continue;
          for (const sel of m[1].split(',')) {
            const g = sel.trim().match(TRAN);
            if (g) bo.add(g[1]);
          }
        }
        banTran.set('/assets/' + x, bo);
      }
      const coTran = new Set();
      for (const bo of banTran.values()) for (const c of bo) coTran.add(c);

      const ra = [];
      for (const f of tep) {
        const html = fs.readFileSync(f, 'utf8');
        const goi = [...html.matchAll(/<link[^>]+href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
        const co = new Set();
        for (const g of goi) for (const c of (banTran.get(g) || [])) co.add(c);
        const dung = new Set();
        for (const m of html.matchAll(/class="([^"]*)"/g))
          for (const c of m[1].trim().split(/\s+/)) if (c) dung.add(c);
        const thieu = [...dung].filter((c) => !co.has(c) && coTran.has(c));
        if (thieu.length) {
          ra.push(`${f.slice(DIST.length)} — tải `
            + `${goi.map((g) => g.split('/').pop().split('.')[0]).join(' + ')} `
            + `nhưng không gói nào có luật gốc cho: ${thieu.map((x) => '.' + x).join(' · ')} `
            + `⇒ cụm hiện lên trần trụi`);
        }
      }
      return ra;
    }
  },
  {
    /* ── DÒNG BÁO TIN CHỈ CÓ MỘT BỘ TRẠNG THÁI ──
       Bảy chỗ trong trang cần nói một câu với người dùng, và mỗi chỗ từng tự
       dựng lấy một bộ luật riêng. Chúng trôi xa nhau: bốn cỡ chữ, ba màu
       nghỉ, hai chữ cho cùng một nghĩa (`--loi` một chỗ, `--hong` sáu chỗ).

       Hai chỗ hỏng thật, mà chỉ lúc xếp cạnh nhau mới lộ:
         · `.vb-noi--hong` tô `--accent-ink` chứ không phải `--bad` — báo lỗi
           ở ô viết bài hiện màu tím suốt từ lúc ra đời;
         · `.bl-duyet-bao--hong` không có luật nào — báo lỗi ở bàn duyệt
           không đổi màu gì cả.

       Nay một cụm `.bao` lo mọi trạng thái (components.css). Phép kiểm này
       giữ cho nó ở nguyên một chỗ:

         A · KHÔNG lớp phụ nào được tự khai trạng thái. `.x-bao--hong`,
             `.x-noi--loi`… đều sai — trạng thái là việc của `.bao--*`.
         B · Chỗ nào gắn lớp phụ thì PHẢI gắn kèm `bao`, không thì cụm gốc
             không tới được và dòng ấy mất cỡ chữ, mất màu, mất chiều cao
             giữ chỗ. */
    ten: 'Báo tin và trạng thái rỗng dùng chung một cụm, không chỗ nào khai lại',
    muc: 'loi',
    chay: () => {
      const ra = [];
      const TRANG_THAI = '(ok|hong|loi|cho)';

      /* ── A · lớp phụ tự khai trạng thái ── */
      const thuMuc = path.join(GOC, 'src', 'styles');
      if (fs.existsSync(thuMuc)) {
        for (const ten of fs.readdirSync(thuMuc).filter((x) => x.endsWith('.css'))) {
          const noi = fs.readFileSync(path.join(thuMuc, ten), 'utf8')
                        .replace(/\/\*[\s\S]*?\*\//g, '');
          const re = new RegExp('\\.([a-z][\\w-]*-(?:bao|noi))--' + TRANG_THAI + '\\b', 'g');
          for (const m of noi.matchAll(re)) {
            ra.push(`src/styles/${ten} — .${m[1]}--${m[2]} tự khai trạng thái ⇒ `
                  + `bỏ đi, dùng .bao--${m[2] === 'loi' ? 'hong' : m[2]} của cụm chung`);
          }
        }
      }

      /* ── B · gắn lớp phụ thì phải gắn kèm lớp GỐC của nó ──
         Hai cụm dùng chung, mỗi cụm một bảng lớp phụ:
           `.bao`   một dòng báo tin
           `.trong` "chỗ này không có gì" */
      const GOC_CUA = {
        'bl-bao': 'bao', 'sz-bao': 'bao', 'cum-bao': 'bao',
        'gc-noi': 'bao', 'bl-duyet-bao': 'bao',
        'ds-trong': 'trong', 'bl-trong': 'trong',
        'so-trong': 'trong', 'vb-cho': 'trong'
      };
      const CHO = Object.keys(GOC_CUA);
      const nguon = [];
      const thuJs = path.join(GOC, 'src', 'js');
      if (fs.existsSync(thuJs)) {
        for (const x of fs.readdirSync(thuJs).filter((n) => n.endsWith('.js')))
          nguon.push(['src/js/' + x, path.join(thuJs, x)]);
      }
      nguon.push(['tools/build.mjs', path.join(GOC, 'tools', 'build.mjs')]);

      for (const [nhan, duong] of nguon) {
        if (!fs.existsSync(duong)) continue;
        const noi = fs.readFileSync(duong, 'utf8');
        /* Mọi chuỗi ký tự trong mã — chỉ những chuỗi CHỞ TÊN LỚP mới lọt vào
           vòng dưới, nên không phải hiểu cú pháp JS làm gì. */
        for (const m of noi.matchAll(/(['"`])([^'"`\n]*)\1/g)) {
          const chuoi = m[2];
          const co = CHO.filter((c) => new RegExp('(^|[\\s"\'=])' + c + '($|[\\s"\'])').test(chuoi));
          if (!co.length) continue;
          const goc = GOC_CUA[co[0]];
          if (new RegExp('(^|[\\s"\'=])' + goc + '($|[\\s"\'])').test(chuoi)) continue;
          ra.push(`${nhan} — "${chuoi.slice(0, 60)}" gắn .${co[0]} mà thiếu .${goc} ⇒ `
                + `mất cỡ chữ, màu và lề của cụm chung`);
        }
      }
      return ra;
    }
  },
  {
    /* ── KHÔNG GÕ CỨNG ĐƯỜNG DẪN TRONG dist/assets/ ──
       Tên file assets mang VÂN TAY NỘI DUNG từ V2.4.3 (`nen.b92c6bac.css`),
       và đổi mỗi lần nội dung đổi. Gõ cứng một tên nào ở đó thì mã chạy đúng
       đúng một lượt build, rồi hỏng lặng.

       Đã vấp thật: `docs/logo/dung-logo-dong.mjs` đọc `dist/assets/style.css`.
       Cái tên ấy còn đúng cho tới lượt chia CSS theo loại trang — từ đó không
       có file nào tên như vậy nữa, và script ném ENOENT. Không ai biết, vì nó
       không nằm trong `npm run build` cũng không nằm trong `npm run kiem`;
       phải có người chạy tay mới thấy.

       Cách đúng: đọc `<link>` / `<script>` của trang đã dựng — trang tự khai
       nó tải những gì. */
    ten: 'Không file mã nào gõ cứng một tên file trong dist/assets/',
    muc: 'loi',
    chay: () => {
      const ra = [];
      const quet = [];
      const them = (thu, tien) => {
        if (!fs.existsSync(thu)) return;
        for (const x of fs.readdirSync(thu, { withFileTypes: true })) {
          const d = path.join(thu, x.name);
          if (x.isDirectory()) them(d, tien + x.name + '/');
          else if (/\.(mjs|js)$/.test(x.name)) quet.push([tien + x.name, d]);
        }
      };
      them(path.join(GOC, 'tools'), 'tools/');
      them(path.join(GOC, 'src', 'js'), 'src/js/');
      them(path.join(GOC, 'docs'), 'docs/');
      them(path.join(GOC, 'functions'), 'functions/');

      for (const [nhan, duong] of quet) {
        /* Bỏ chú thích trước khi quét. Chỗ GIẢI THÍCH một đường dẫn sai không
           phải là chỗ DÙNG nó — mà lời giải thích rõ ràng nhất lại chính là
           lời nhắc lại cái tên đã hỏng. Không lọc thì phép kiểm phạt đúng
           người đang viết tài liệu cho nó. */
        const noi = fs.readFileSync(duong, 'utf8')
                      .replace(/\/\*[\s\S]*?\*\//g, '')
                      .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
        for (const m of noi.matchAll(/['"`]([^'"`\n]*dist\/assets\/[^'"`\n]+)['"`]/g)) {
          const d = m[1];
          /* Chỉ bắt thứ TRÔNG NHƯ MỘT ĐƯỜNG DẪN: không khoảng trắng, không
             nội suy `${…}`, và kết thúc bằng một phần đuôi file. Câu thông báo
             lỗi có nhắc tên thư mục thì không phải chuyện của phép kiểm này —
             bắt cả chúng thì mỗi lời giải thích rõ ràng lại thành một lỗi đỏ,
             và người ta học cách viết mơ hồ để né. */
          if (/[\s${}]/.test(d)) continue;
          if (!/dist\/assets\/[\w.-]+\.\w+$/.test(d)) continue;
          ra.push(`${nhan} — gõ cứng "${d}" ⇒ tên file assets mang vân tay nội dung, `
                + `đổi mỗi lượt build. Đọc từ <link> của trang đã dựng.`);
        }
      }
      return ra;
    }
  },
  {
    /* ── BẢNG "FILE NÀO CHỨA GÌ" PHẢI KHỚP src/styles/ THẬT ──
       `docs/DESIGN-SYSTEM.md` §7 là chỗ duy nhất nói file CSS nào chứa gì và
       gói nào gồm những file nào. Nó lạc hậu thì người đọc đi sai đường ngay
       từ câu hỏi đầu tiên ("sửa cái này thì mở file nào").

       Và nó ĐÃ lạc hậu: sau lượt chia CSS theo loại trang, bảng vẫn liệt kê 8
       file và vẫn nói build gộp tất cả thành một `assets/style.css`. Năm file
       mới không có tên trong đó suốt nhiều bản.

       Tài liệu không tự kiểm được, nên phải kiểm ở đây. Hai vế:
         A · mọi file trong `src/styles/` đều có mặt trong bảng, và ngược lại
         B · mọi gói trong `GOI_CSS` đều có mặt trong bảng gói, và ngược lại */
    ten: 'Bảng FILE NÀO CHỨA GÌ trong DESIGN-SYSTEM khớp với src/styles/ thật',
    muc: 'loi',
    chay: () => {
      const fDoc = path.join(GOC, 'docs', 'DESIGN-SYSTEM.md');
      const thuCss = path.join(GOC, 'src', 'styles');
      if (!fs.existsSync(fDoc) || !fs.existsSync(thuCss)) return [];
      const doc = fs.readFileSync(fDoc, 'utf8');

      const i = doc.indexOf('## 7 · FILE NÀO CHỨA GÌ');
      if (i < 0) return ['docs/DESIGN-SYSTEM.md không còn mục "## 7 · FILE NÀO CHỨA GÌ"'];
      const j = doc.indexOf('\n## ', i + 5);
      const muc7 = doc.slice(i, j < 0 ? doc.length : j);

      const ra = [];

      /* ── A · danh sách file ── */
      const thatCss = new Set(fs.readdirSync(thuCss).filter((x) => x.endsWith('.css')));
      const docCss = new Set();
      for (const m of muc7.matchAll(/`([a-z-]+\.css)`/g)) docCss.add(m[1]);
      for (const f of thatCss) {
        if (!docCss.has(f)) ra.push(`src/styles/${f} có thật nhưng KHÔNG có trong bảng §7`);
      }
      for (const f of docCss) {
        if (!thatCss.has(f)) ra.push(`§7 nhắc \`${f}\` nhưng src/styles/ không có file ấy`);
      }

      /* ── B · danh sách gói ── */
      const build = fs.readFileSync(path.join(GOC, 'tools', 'build.mjs'), 'utf8');
      const kBuild = build.indexOf('const GOI_CSS');
      const goiThat = new Set();
      if (kBuild >= 0) {
        const khoi = build.slice(kBuild, build.indexOf('};', kBuild));
        for (const m of khoi.matchAll(/^\s*([a-z]+)\s*:\s*\[/gm)) goiThat.add(m[1]);
      }
      const goiDoc = new Set();
      for (const m of muc7.matchAll(/^\| `([a-z]+)` \|/gm)) goiDoc.add(m[1]);
      for (const g of goiThat) {
        if (!goiDoc.has(g)) ra.push(`GOI_CSS có gói \`${g}\` nhưng §7 không nhắc tới`);
      }
      for (const g of goiDoc) {
        if (!goiThat.has(g)) ra.push(`§7 nhắc gói \`${g}\` nhưng GOI_CSS không có`);
      }
      return ra;
    }
  },
  {
    /* ── KHÔNG XIN CÂN NẶNG NÀO KHÔNG CÓ FACE ĐỠ ──
       `fonts.css` khai đúng những cân nặng đã tải về: 400 · 500 · 600. Một
       luật xin 700 thì trình duyệt không có gì để lấy, nên nó BỊA nét đậm —
       vẽ đè chính chữ ấy lệch đi vài phần pixel.

       Nét bịa nhoè, và nhoè nhất đúng ở chỗ tiếng Việt cần rõ nhất: dấu mũ,
       dấu móc, dấu thanh chồng lên nhau ở cỡ chữ thân bài.

       Đã vấp thật, và vấp ở chỗ đọc nhiều nhất: trình duyệt cho `<strong>`
       và `<b>` cân nặng 700 theo MẶC ĐỊNH, mà `prose.css` không đặt lại. Nên
       mọi cụm chữ đậm trong mọi bài đều là nét bịa — đo được 30 cụm trên một
       bài. Không có gì báo, vì CSS không sai cú pháp và chữ vẫn hiện ra.

       Phép kiểm này đọc thẳng `fonts.css` để biết có những face nào, nên tải
       thêm một cân nặng là nó tự nới theo. */
    ten: 'Không luật CSS nào xin một cân nặng chữ không có face đỡ',
    muc: 'loi',
    chay: () => {
      const thuCss = path.join(GOC, 'src', 'styles');
      const fFonts = path.join(thuCss, 'fonts.css');
      if (!fs.existsSync(fFonts)) return [];

      const co = new Set();
      for (const m of fs.readFileSync(fFonts, 'utf8').matchAll(/font-weight:\s*(\d+)/g)) {
        co.add(+m[1]);
      }
      if (!co.size) return ['src/styles/fonts.css không khai cân nặng nào — chạy `npm run phong`'];

      const ra = [];
      for (const ten of fs.readdirSync(thuCss).filter((x) => x.endsWith('.css'))) {
        if (ten === 'fonts.css') continue;
        const noi = fs.readFileSync(path.join(thuCss, ten), 'utf8')
                      .replace(/\/\*[\s\S]*?\*\//g, '');
        const dong = noi.split('\n');
        for (let i = 0; i < dong.length; i++) {
          for (const m of dong[i].matchAll(/font-weight:\s*(\d+)/g)) {
            const n = +m[1];
            if (co.has(n)) continue;
            ra.push(`src/styles/${ten}:${i + 1} — xin font-weight:${n} mà không face nào `
                  + `có cân nặng ấy (đang có: ${[...co].sort((a, b) => a - b).join(' · ')}) `
                  + `⇒ trình duyệt bịa nét đậm, chữ nhoè ở dấu tiếng Việt`);
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── DÀN TIÊU ĐỀ KHÔNG ĐƯỢC NHẢY CÓC ──
       Trình đọc màn hình cho người dùng nhảy giữa các tiêu đề bằng phím tắt,
       và bậc của tiêu đề CHÍNH LÀ cái dàn ý họ đi theo. Nhảy từ h1 thẳng
       xuống h3 thì họ gặp một bậc trống: không biết mình vừa bỏ lỡ một cấp
       hay trang thiếu mất một khối.

       Đã vấp thật, và vấp ở 30 trang cùng lúc: tiêu đề trên thẻ bài để <h3>
       trong khi trên nó chỉ có đúng một <h1>. Không ai thấy, vì trên màn hình
       nó vẫn là chữ to chữ nhỏ đúng thứ tự — chỉ cái DÀN Ý là sai.

       Kiểm trên bản ĐÃ DỰNG, không trên template: bậc cuối cùng người đọc gặp
       là bậc trong HTML, và nó có thể tới từ ba bốn chỗ ghép lại. */
    ten: 'Dàn tiêu đề trên mọi trang không nhảy cóc bậc',
    muc: 'loi',
    chay: ({ trang }) => {
      const ra = [];
      for (const t of trang) {
        const bac = [...t.html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
        for (let i = 1; i < bac.length; i++) {
          if (bac[i] - bac[i - 1] > 1) {
            ra.push(`${t.url} — nhảy từ h${bac[i - 1]} thẳng xuống h${bac[i]} `
                  + `⇒ dàn ý có một bậc trống`);
            break;
          }
        }
      }
      return ra;
    }
  },
  {
    /* ── MỘT LỚP KHAI HAI LẦN TRONG CÙNG MỘT FILE ──
       CSS cho phép, nên không có lỗi nào báo — và đó chính là chỗ nguy. Khai
       `.bl-vaitro` ở dòng 1049 rồi khai lại ở dòng 1474 thì bản sau đè bản
       trước ở mọi thuộc tính trùng tên; ai mở file ra sửa, tìm thấy bản đầu,
       sửa xong và không thấy gì đổi trên màn hình. Đã xảy ra thật.

       Chỉ báo khi hai khối cùng ĐẶT MỘT THUỘC TÍNH: khai lại một lớp để thêm
       thuộc tính khác là chuyện bình thường và có ích (gom theo chủ đề), còn
       đặt `text-transform` hai lần hai giá trị thì đúng một trong hai là vô
       nghĩa. So ở ngoài `@media` thôi — trong media query là cố ý đè. */
    ten: 'Không lớp CSS nào bị khai hai lần cùng một thuộc tính trong một file',
    muc: 'loi',
    chay: ({ goc }) => {
      const thuMuc = path.join(goc, 'src', 'styles');
      if (!fs.existsSync(thuMuc)) return [];
      const ra = [];
      for (const ten of fs.readdirSync(thuMuc).filter((x) => x.endsWith('.css'))) {
        const s = fs.readFileSync(path.join(thuMuc, ten), 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, ' ');
        /* Quét tay thay vì regex: phải đếm được độ sâu ngoặc để bỏ qua mọi
           thứ nằm trong @media, @supports, @keyframes. */
        const khoi = [];
        let sau = 0, dauChon = 0, dong = 1, dongChon = 1;
        for (let i = 0; i < s.length; i++) {
          const c = s[i];
          if (c === '\n') dong++;
          if (c === '{') {
            if (sau === 0) {
              const chon = s.slice(dauChon, i).trim().replace(/\s+/g, ' ');
              dongChon = dong;
              sau = 1;
              /* @media/@supports/@keyframes: nhảy qua cả khối. */
              if (chon.startsWith('@')) {
                let n = 1;
                while (++i < s.length && n) {
                  if (s[i] === '\n') dong++;
                  else if (s[i] === '{') n++;
                  else if (s[i] === '}') n--;
                }
                sau = 0; dauChon = i + 1;
                continue;
              }
              let than = '', n = 1;
              while (++i < s.length && n) {
                if (s[i] === '\n') dong++;
                if (s[i] === '{') n++;
                else if (s[i] === '}') { n--; if (!n) break; }
                than += s[i];
              }
              khoi.push({ chon, dong: dongChon, than });
              sau = 0; dauChon = i + 1;
            }
          } else if (c === '}' && sau === 0) {
            dauChon = i + 1;
          }
        }
        const thay = new Map();
        for (const k of khoi) {
          const tt = new Set([...k.than.matchAll(/(^|;)\s*([a-z-]+)\s*:/gi)]
            .map((m) => m[2].toLowerCase()));
          if (!thay.has(k.chon)) { thay.set(k.chon, { dong: k.dong, tt }); continue; }
          const cu = thay.get(k.chon);
          const trung = [...tt].filter((x) => cu.tt.has(x));
          if (trung.length) {
            ra.push(`${ten} — \x60${k.chon}\x60 khai lại ở dòng ${k.dong} ` +
                    `(đã khai ở dòng ${cu.dong}), cùng đặt: ${trung.slice(0, 4).join(', ')}` +
                    (trung.length > 4 ? '…' : '') + ' — bản sau đè bản trước');
          }
          trung.forEach(() => {});
          for (const x of tt) cu.tt.add(x);
        }
      }
      return ra;
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
