/* ============================================================
   npm run bia -- <slug>        sinh ảnh bìa cho một bài
   npm run bia -- --tat-ca      sinh cho mọi bài chưa có bìa

   ── VÌ SAO SINH ẢNH CHỨ KHÔNG ĐI TÌM ẢNH ────────────────────────────────
   "Tự tìm ảnh đại diện" nghe thì hợp lý, nhưng tải ảnh từ Unsplash hay Google
   về đặt lên blog là chuyện khác hẳn: mỗi tấm một giấy phép, nhiều tấm bắt ghi
   nguồn, và tấm nào cũng mang một tông màu riêng — mười bài là mười phong cách
   đá nhau. Blog này có một bảng màu chặt; ảnh lạ phá nó ngay.

   Nên: SINH ảnh từ chính tên bài. Được ba thứ cùng lúc —

     · không vướng bản quyền, vì không lấy của ai cả
     · luôn đúng bảng màu, vì màu lấy thẳng từ tokens.css
     · TẤT ĐỊNH: cùng một tên bài luôn ra cùng một tấm. Dựng lại trang hay đổi
       máy cũng không đổi ảnh, nên không có chuyện hôm nay một kiểu mai một kiểu.

   Bố cục thì đổi theo tên bài (góc nghiêng, vị trí vầng sáng, cặp màu), nên
   mỗi bài một hình riêng mà vẫn cùng một họ.

   ── KHÔNG DÙNG THƯ VIỆN NÀO ─────────────────────────────────────────────
   Tự ghi PNG: IHDR + IDAT nén bằng zlib + IEND. `zlib` nằm sẵn trong Node.
   Thêm một dependency chỉ để vẽ mấy vệt màu thì không đáng — cả dự án này
   không có dependency nào, và đó là chủ ý.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/text.mjs';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(GOC, 'content', 'posts');
const PUBLIC = path.join(GOC, 'public');

/* 1600×900 — tỉ lệ 16:9. Vừa làm ảnh bìa trong bài, vừa đủ lớn để Facebook và
   Google cắt lại mà không bị vỡ. */
const W = 1600, H = 900;

const mau = {
  do:   (s) => `\x1b[31m${s}\x1b[0m`,
  vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo:   (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`
};

/* ══════════ BẢNG MÀU ══════════
   Chép từ tokens.css. CỐ Ý chép chứ không đọc file .css: đọc CSS bằng regex là
   một bộ phân tích cú pháp nửa vời, hỏng lúc nào không biết. Sáu màu này đã
   đứng yên từ V0.10; đổi thì sửa ở đây một dòng. */
const BANG = {
  lav:    '#F4E7FB', blush:  '#F3DCDC', coral:  '#F5BCBA',
  orchid: '#E3AADD', violet: '#C8A8E9', peri:   '#C3C7F3',
  paper:  '#F6EFFB', bg:     '#FAF6FD'
};
/* Mấy cặp màu chính. Bài nào rơi vào cặp nào là do tên bài quyết định. */
const CAP = [
  ['paper', 'violet', 'coral'],
  ['lav',   'peri',   'orchid'],
  ['bg',    'orchid', 'peri'],
  ['blush', 'violet', 'peri'],
  ['paper', 'coral',  'orchid'],
  ['lav',   'violet', 'blush']
];

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const tron = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const kep  = (v) => Math.max(0, Math.min(255, Math.round(v)));
/* Mềm hoá: 1 ở tâm, 0 ở mép, chuyển bằng smoothstep nên không thấy đường bao.
   Không có nó thì mỗi vầng sáng có một viền tròn sắc lẻm. */
const mem  = (d) => { const t = Math.max(0, Math.min(1, 1 - d)); return t * t * (3 - 2 * t); };

/* Hạt giống từ tên bài — FNV-1a. Cùng tên thì luôn cùng số. */
function hat(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function sinh(h) {
  return function () {
    h = (h + 0x6D2B79F5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ══════════ VẼ ══════════ */
function ve(tieuDe) {
  const r = sinh(hat(tieuDe));
  const cap = CAP[Math.floor(r() * CAP.length)];
  const [NEN, A, B] = cap.map((k) => hex(BANG[k]));

  /* Góc nghiêng của dải màu, và hai vầng sáng. Tất cả lấy từ cùng một dòng số
     nên cùng tên bài là cùng bố cục. */
  const goc  = r() * Math.PI;
  const cx1 = .12 + r() * .3,  cy1 = .08 + r() * .35;
  const cx2 = .6  + r() * .34, cy2 = .55 + r() * .4;
  const ban1 = .5 + r() * .35, ban2 = .45 + r() * .4;
  /* Số vệt mảnh vắt ngang — 2 tới 4. Không có vệt nào thì ảnh phẳng như một
     cái nền gradient mặc định; nhiều quá thì rối. */
  const soVet = 2 + Math.floor(r() * 3);
  const vet = [];
  for (let i = 0; i < soVet; i++) {
    vet.push({ p: .15 + r() * .7, day: .012 + r() * .03, lech: (r() - .5) * .5, dam: .1 + r() * .16 });
  }

  const px = Buffer.alloc(H * (1 + W * 3));
  const cos = Math.cos(goc), sin = Math.sin(goc);

  for (let y = 0; y < H; y++) {
    const doc = y * (1 + W * 3);
    px[doc] = 0;                                   /* filter byte: none */
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      const ar = H / W;                            /* để hình tròn ra tròn thật */

      /* Nền: dải màu chạy theo góc đã bốc, đi TRỌN từ nền sang màu A.
         Bản đầu chỉ đi nửa đường (`tron(NEN, A, .55)`) nên cả tấm gần như một
         màu — nhìn ra là một cái nền mặc định chứ không phải một tấm ảnh. */
      const t = Math.max(0, Math.min(1, (u * cos + v * sin + 1) / 2));
      let c = tron(NEN, A, t * .92);

      /* Hai vầng sáng. Vầng đầu kéo NGƯỢC về phía sáng để có chỗ thở, vầng sau
         là màu nhấn — hai vầng cùng tông thì lại phẳng như cũ. */
      c = tron(c, tron([255, 252, 255], NEN, .25),
               mem(Math.hypot((u - cx1) * ar, v - cy1) / ban1) * .78);
      c = tron(c, B, mem(Math.hypot((u - cx2) * ar, v - cy2) / ban2) * .72);

      /* Vệt mảnh vắt ngang — cho ảnh có nhịp, đỡ phẳng */
      for (const s of vet) {
        const d = Math.abs((v + (u - .5) * s.lech) - s.p);
        c = tron(c, [255, 255, 255], mem(d / s.day) * s.dam * 1.5);
      }

      /* Tối nhẹ bốn góc — ảnh sáng đều tuyệt đối trông như lỗi in */
      const goc4 = Math.hypot((u - .5) * 1.25, (v - .5) * 1.25);
      c = tron(c, tron(c, [120, 96, 150], .5), Math.max(0, goc4 - .42) * .78);

      /* Hạt nhiễu rất nhẹ — gradient phẳng tuyệt đối in ra bị vệt dải */
      const n = ((x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      const nz = (n - .5) * 3.4;

      const o = doc + 1 + x * 3;
      px[o]     = kep(c[0] + nz);
      px[o + 1] = kep(c[1] + nz);
      px[o + 2] = kep(c[2] + nz);
    }
  }
  return px;
}

/* ══════════ GHI PNG ══════════ */
function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  let r = 0xFFFFFFFF;
  for (const b of buf) r = t[(r ^ b) & 0xFF] ^ (r >>> 8);
  return (r ^ 0xFFFFFFFF) >>> 0;
}
function khoi(ten, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const than = Buffer.concat([Buffer.from(ten, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(than));
  return Buffer.concat([len, than, crc]);
}
function png(px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2;                        /* 8-bit, truecolour RGB */
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    khoi('IHDR', ihdr),
    khoi('IDAT', zlib.deflateSync(px, { level: 9 })),
    khoi('IEND', Buffer.alloc(0))
  ]);
}

/* ══════════ ĐỌC BÀI ══════════ */
function moiBai() {
  const ra = [];
  const di = (d) => {
    for (const x of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, x.name);
      if (x.isDirectory()) { di(f); continue; }
      if (!x.name.endsWith('.md') || x.name.startsWith('_')) continue;
      const raw = fs.readFileSync(f, 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!m) continue;
      const fm = m[1];
      const lay = (k) => {
        const v = fm.match(new RegExp(`^${k}:[ \\t]*(.+)$`, 'm'));
        return v ? v[1].trim().replace(/^["']|["']$/g, '') : '';
      };
      const ten = path.basename(f, '.md');
      ra.push({
        file: f,
        title: lay('title'),
        date: lay('date'),
        cover: lay('cover'),
        slug: lay('slug') || slugify(ten.replace(/^\d{4}-\d{2}-\d{2}-/, ''))
      });
    }
  };
  di(POSTS);
  return ra;
}

/* ══════════ CHẠY ══════════ */
const CO = process.argv.slice(2);
const TAT_CA = CO.includes('--tat-ca');
const DE = CO.includes('--de');                    /* ghi đè ảnh đã có */
const chon = CO.filter((x) => !x.startsWith('--'));

const bai = moiBai();
if (!bai.length) {
  console.log(mau.vang('\n  Chưa có bài nào trong content/posts/.\n'));
  process.exit(0);
}

let lam = TAT_CA ? bai : bai.filter((b) => chon.includes(b.slug));
if (!TAT_CA && !chon.length) {
  console.log(mau.dam('\n  SINH ẢNH BÌA\n'));
  console.log('  Cách dùng:');
  console.log(mau.mo('    npm run bia -- <slug>        một bài'));
  console.log(mau.mo('    npm run bia -- --tat-ca      mọi bài chưa có bìa'));
  console.log(mau.mo('    npm run bia -- <slug> --de   ghi đè ảnh đã có\n'));
  console.log('  Các bài đang có:');
  for (const b of bai) {
    console.log(`    ${b.cover ? mau.xanh('có bìa ') : mau.vang('chưa có')}  ` +
                `${mau.mo(b.slug.padEnd(28))} ${b.title}`);
  }
  console.log('');
  process.exit(0);
}
if (!TAT_CA && !lam.length) {
  console.log(mau.do(`\n  Không có bài nào tên "${chon.join(', ')}".\n`));
  process.exit(1);
}

console.log(mau.dam('\n  SINH ẢNH BÌA\n'));
let so = 0;
for (const b of lam) {
  const nam = (b.date || '').slice(0, 4) || String(new Date().getFullYear());
  const rel = `/media/${nam}/${b.slug}/bia.png`;
  const dich = path.join(PUBLIC, rel.replace(/^\//, ''));

  if (fs.existsSync(dich) && !DE) {
    console.log(`  ${mau.mo('bỏ qua')}  ${b.slug} ${mau.mo('— đã có ảnh, thêm --de để ghi đè')}`);
    continue;
  }
  if (!b.title) {
    console.log(`  ${mau.vang('bỏ qua')}  ${b.slug} ${mau.mo('— bài chưa có title')}`);
    continue;
  }

  fs.mkdirSync(path.dirname(dich), { recursive: true });
  const buf = png(ve(b.title));
  fs.writeFileSync(dich, buf);
  so++;
  console.log(`  ${mau.xanh('✓')}  ${mau.mo(rel.padEnd(42))} ${(buf.length / 1024).toFixed(0)}KB`);

  if (b.cover !== rel) {
    console.log(mau.mo(`     dán vào front matter của ${path.relative(GOC, b.file)}:`));
    console.log(`     ${mau.dam(`cover: ${rel}`)}`);
    console.log(`     ${mau.dam(`coverAlt: ${b.title}`)}`);
  }
}
console.log(so ? mau.xanh(`\n  Xong ${so} ảnh.\n`) : mau.mo('\n  Không sinh ảnh nào.\n'));
