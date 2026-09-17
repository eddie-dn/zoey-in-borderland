#!/usr/bin/env node
/* ============================================================
   npm run phong        tải phông từ Google về để trang tự phục vụ

   ── VÌ SAO TỰ HOST ──
   Đo trên bản đang chạy: một trang bài kéo về **27 file phông, 421 KB** từ hai
   tên miền của Google. Nặng hơn gấp ba lần toàn bộ CSS của trang.

   Nhưng số byte chưa phải chỗ tệ nhất. Tệ hơn là THỨ TỰ: trình duyệt phải tải
   xong file CSS của Google (19,5 KB) rồi mới biết đường dẫn của từng file
   phông — một vòng đi-về nữa nằm chắn ngang, TRƯỚC khi một chữ nào hiện lên.

   Tự host bỏ được cả ba: vòng đi-về ấy, hai lượt bắt tay TLS với tên miền lạ,
   và việc mỗi người đọc blog này đều để lại một lượt ghé ở máy chủ Google.
   Đổi lại: chừng nửa megabyte nằm trong kho mã, thứ không ai phải nhìn.

   ── CHỈ LẤY BA TẬP KÝ TỰ ──
   Google cắt mỗi phông thành nhiều tập theo bảng chữ. Trang này viết tiếng
   Việt, nên chỉ cần `vietnamese`, `latin`, `latin-ext`. Bỏ `cyrillic` và
   `cyrillic-ext` — 14 file chưa bao giờ có ai tải tới.

   ── KHÔNG CẮT LẠI PHÔNG ──
   Cắt phông cho nhỏ hơn nữa cần một công cụ ngoài (pyftsubset). Ở đây chỉ CHÉP
   đúng mấy file Google đã cắt sẵn, rồi tự viết lại phần @font-face trỏ về
   chúng — không thêm phụ thuộc nào, và chữ ra đúng y như cũ.

   ── CHẠY LẠI KHI NÀO ──
   Chỉ khi đổi danh sách phông ở `DIA_CHI` bên dưới. Google có cập nhật phông
   (đổi số `v21` trong đường dẫn) nhưng bản đang có vẫn chạy mãi — không việc
   gì phải đuổi theo.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA_FONT = path.join(GOC, 'public', 'assets', 'fonts');
const RA_CSS  = path.join(GOC, 'src', 'styles', 'fonts.css');

/* Đúng địa chỉ mà shell.html đang gọi. Đổi phông thì đổi ở ĐÂY, chạy lại
   `npm run phong`, rồi mới sửa `--font-*` trong tokens.css. */
const DIA_CHI = 'https://fonts.googleapis.com/css2'
  + '?family=Oswald:wght@400;500;600'
  + '&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600'
  + '&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400'
  + '&display=swap';

const GIU = ['vietnamese', 'latin', 'latin-ext'];

/* User-Agent của một trình duyệt hiện đại: Google trả định dạng phông theo UA,
   và gửi UA của Node thì nhận về `.ttf` nặng gấp ba `.woff2`. */
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
         + '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const mau = {
  xanh: (s) => `\x1b[32m${s}\x1b[0m`, mo: (s) => `\x1b[2m${s}\x1b[0m`,
  do: (s) => `\x1b[31m${s}\x1b[0m`, dam: (s) => `\x1b[1m${s}\x1b[0m`
};

async function chay() {
  console.log(`\n  ${mau.dam('Tải phông về để trang tự phục vụ')}\n`);

  const r = await fetch(DIA_CHI, { headers: { 'User-Agent': UA } });
  if (!r.ok) { console.log(mau.do(`  ✖ Google trả ${r.status}\n`)); process.exit(1); }
  const css = await r.text();

  /* Mỗi khối @font-face đứng sau một chú thích ghi tên tập ký tự — đó là chỗ
     DUY NHẤT Google nói tập nào là tập nào, nên phải đọc cả chú thích. */
  const khoi = [...css.matchAll(/\/\*\s*([\w\[\]-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
  if (!khoi.length) { console.log(mau.do('  ✖ không đọc được @font-face nào\n')); process.exit(1); }

  fs.mkdirSync(RA_FONT, { recursive: true });
  const ra = [];
  let tai = 0, bo = 0, byte = 0;

  for (const [, tap, than] of khoi) {
    if (!GIU.includes(tap)) { bo++; continue; }
    const u = than.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    const ho = than.match(/font-family:\s*'([^']+)'/);
    const nang = than.match(/font-weight:\s*(\d+)/);
    const nghieng = /font-style:\s*italic/.test(than);
    if (!u || !ho) continue;

    /* Tên file tự đặt, KHÔNG giữ tên băm của Google: tên ấy đọc ra không nói
       gì, mà thứ cần nhìn thấy khi mở thư mục là phông nào, đậm bao nhiêu. */
    const ten = [ho[1].toLowerCase().replace(/\s+/g, '-'),
                 nang ? nang[1] : '400',
                 nghieng ? 'italic' : null, tap].filter(Boolean).join('-') + '.woff2';
    const dich = path.join(RA_FONT, ten);

    if (!fs.existsSync(dich)) {
      const f = await fetch(u[1], { headers: { 'User-Agent': UA } });
      if (!f.ok) { console.log(mau.do(`  ✖ ${ten}: ${f.status}`)); continue; }
      fs.writeFileSync(dich, Buffer.from(await f.arrayBuffer()));
      tai++;
    }
    byte += fs.statSync(dich).size;

    ra.push(than
      .replace(/url\(https:\/\/fonts\.gstatic\.com\/[^)]+\)/, `url(/assets/fonts/${ten})`)
      .replace(/\s+/g, ' ')
      .replace(/\{ /, ' {\n  ').replace(/; /g, ';\n  ').replace(/ ?\}$/, '\n}'));
  }

  const dau = `/* ══════════════════════════════════════════════════════════════
   PHÔNG — SINH RA BỞI \`npm run phong\`, ĐỪNG SỬA TAY

   Mọi dòng dưới đây do tools/phong.mjs viết ra từ file CSS của Google, chỉ
   thay đường dẫn về \`/assets/fonts/\`. Sửa tay thì lần chạy sau mất hết.

   Đổi phông: sửa \`DIA_CHI\` trong tools/phong.mjs rồi chạy lại.
   ══════════════════════════════════════════════════════════════ */\n\n`;
  fs.writeFileSync(RA_CSS, dau + ra.join('\n\n') + '\n');

  console.log(`  ${mau.xanh('✓')} ${ra.length} @font-face  ${mau.mo(`(bỏ ${bo} tập ký tự không dùng)`)}`);
  console.log(`  ${mau.xanh('✓')} ${tai} file tải mới  ·  tổng ${Math.round(byte / 1024)} KB`);
  console.log(`  ${mau.mo('→')} public/assets/fonts/  ·  src/styles/fonts.css\n`);
}

chay().catch((e) => { console.log(mau.do(`\n  ✖ ${e.message}\n`)); process.exit(1); });
