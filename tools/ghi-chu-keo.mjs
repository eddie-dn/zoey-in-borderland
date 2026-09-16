#!/usr/bin/env node
/* ============================================================
   KÉO GHI CHÚ VỀ NHÀ — `npm run gc`

   /api/ghi-chu cho phép đăng ghi chú thẳng lên trang, không phải dựng lại.
   Tiện, nhưng nó đẻ ra một cái nợ: từ lúc ấy blog có HAI chỗ chứa ghi chú.
   File này là chỗ trả nợ.

   Ghi chú nằm ở D1 thì:
     · chỉ hiện khi trình duyệt chạy JavaScript,
     · không có trong RSS, sitemap hay chỉ mục tìm kiếm,
     · và sống trong một cơ sở dữ liệu mà bản sao lưu duy nhất là Cloudflare.

   Ghi chú nằm trong `content/ghi-chu.md` thì không thiếu thứ nào trong số đó.
   Nên D1 là CHỖ ĐỨNG TẠM giữa lúc gõ và lần dựng kế tiếp, còn file Markdown
   vẫn là nhà. Chạy file này trước mỗi lần dựng là xong.

   ── TRÌNH TỰ, VÀ VÌ SAO ĐÚNG THỨ TỰ ẤY ────────────────────────────────
     1. xin danh sách về
     2. bỏ những ghi chú file đã có rồi
     3. GHI VÀO FILE
     4. rồi mới xoá ở D1

   Ghi trước, xoá sau. Ngược lại — xoá xong mới ghi — mà máy chết ở giữa thì
   ghi chú bốc hơi khỏi cả hai nơi. Theo thứ tự này, hỏng ở bước 4 chỉ để lại
   một bản thừa trên D1, và bước 2 của lần chạy sau sẽ nhận ra nó.

   ── CÁCH GỌI ──────────────────────────────────────────────────────────
     GC_ID=... GC_KEY=... npm run gc
     GC_ID=... GC_KEY=... npm run gc -- --url=https://ten-mien-cua-ban
     npm run gc -- --thu            (chỉ xem sẽ kéo về những gì, không sửa gì)

   Khoá KHÔNG nằm trong file nào của dự án. Đặt bằng biến môi trường: viết vào
   file thì sớm muộn cũng có ngày nó đi theo một lần commit.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(GOC, 'content', 'ghi-chu.md');

const E = String.fromCharCode(27);
const mau = {
  dam : (s) => `${E}[1m${s}${E}[0m`,
  mo  : (s) => `${E}[2m${s}${E}[0m`,
  xanh: (s) => `${E}[32m${s}${E}[0m`,
  vang: (s) => `${E}[33m${s}${E}[0m`,
  do  : (s) => `${E}[31m${s}${E}[0m`
};

function thoat(chu) {
  console.error('\n  ' + mau.do('✗ ' + chu) + '\n');
  process.exit(1);
}

const doiSo = process.argv.slice(2);
const chiThu = doiSo.includes('--thu');
const urlTay = (doiSo.find((x) => x.startsWith('--url=')) || '').slice(6);

const CAU = JSON.parse(fs.readFileSync(path.join(GOC, 'site.config.json'), 'utf8'));
const goc = (urlTay || CAU.url || '').replace(/\/+$/, '');
if (!goc) thoat('chưa biết địa chỉ trang — điền `url` trong site.config.json hoặc dùng --url=');

const duong = (CAU.ghiChu || {}).api || '/api/ghi-chu';
const API = goc + (CAU.base || '') + duong;

const ID  = process.env.GC_ID  || '';
const KEY = process.env.GC_KEY || '';

/* ── ĐỌC FILE ĐỂ BIẾT ĐÃ CÓ GÌ ──
   So bằng NGÀY + chữ đã bóp gọn (bỏ khoảng trắng thừa, về chữ thường). So
   nguyên văn thì một dấu xuống dòng lệch chỗ là tưởng hai ghi chú khác nhau
   và file có hai bản y hệt. */
function gonLai(s) {
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

const NGAN = String.fromCharCode(0);   /* dấu ngăn giữa ngày và chữ trong khoá so sánh */

function daCo(md) {
  const co = new Set();
  for (const khoi of md.replace(/<!--[\s\S]*?-->/g, '').split(/^##[ \t]+/m).slice(1)) {
    const dong = khoi.split('\n');
    const m = (dong[0] || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (!m) continue;
    co.add(m[1] + NGAN + gonLai(dong.slice(1).join('\n')));
  }
  return co;
}

/* Chèn vào NGAY TRƯỚC khối `##` đầu tiên — file này xếp mới nhất trên cùng.
   Chưa có khối nào thì nối vào cuối. (Build tự xếp lại theo ngày, nên chỗ chèn
   chỉ quyết định file đọc có thuận mắt hay không.)

   ── HAI CÁI BẪY Ở ĐÂY, ĐÃ VẤP CẢ HAI ──
   MỘT: chỗ chèn phải lấy từ `m.index` của regex, KHÔNG phải `md.indexOf(m[0])`.
   Regex có `^` nên nó chỉ khớp đầu dòng; `indexOf` thì tìm chuỗi trần và khớp
   luôn vào giữa dòng. Đầu file có một khối chú thích bày mẫu `## 2026-…-…`
   thụt vào trong khung — `indexOf` nhảy đúng vào đó và ghi chú mới bị nhét vào
   giữa khối chú thích.

   HAI: và vì nằm trong chú thích nên `daCo()` — vốn bóc chú thích đi trước khi
   đọc — không thấy nó. Lần chạy sau tưởng chưa có, chèn thêm bản nữa. Một lỗi
   đặt sai chỗ đẻ ra một lỗi trùng lặp, im lặng, mỗi lần chạy thêm một bản.

   Nên dưới đây quét MỌI khớp đầu dòng rồi bỏ những khớp rơi vào vùng chú
   thích. Chặt hơn `m.index` một bậc, phòng khi sau này có ai viết một dòng
   `## 2026-…` sát mép trái ở trong chú thích. */
function vungChuThich(md) {
  const vung = [];
  const re = /<!--[\s\S]*?-->/g;
  let m;
  while ((m = re.exec(md))) vung.push([m.index, m.index + m[0].length]);
  return vung;
}

function chen(md, khoiMoi) {
  const chu = khoiMoi.join('\n\n');
  const bo = vungChuThich(md);
  const re = /^##[ \t]+\d{4}-\d{2}-\d{2}/gm;
  let m, i = -1;
  while ((m = re.exec(md))) {
    if (bo.some(([a, b]) => m.index >= a && m.index < b)) continue;
    i = m.index;
    break;
  }
  if (i < 0) return md.replace(/\s*$/, '') + '\n\n' + chu + '\n';
  return md.slice(0, i) + chu + '\n\n' + md.slice(i);
}

const kq = await fetch(API, { headers: { Accept: 'application/json' } })
  .catch((e) => thoat(`không gọi được ${API} — ${e.message}`));
if (!kq.ok) thoat(`${API} trả về ${kq.status}`);
const { ghiChu = [], tat } = await kq.json();

console.log('\n  ' + mau.dam('Kéo ghi chú từ D1 về content/ghi-chu.md'));
console.log('  ' + mau.mo(API) + '\n');

if (tat) {
  console.log('  ' + mau.vang('⚠ hàm báo chưa gắn D1 — không có gì để kéo') + '\n');
  process.exit(0);
}
if (!ghiChu.length) {
  console.log('  ' + mau.mo('không có ghi chú nào trên D1') + '\n');
  process.exit(0);
}

const md = fs.readFileSync(FILE, 'utf8');
const co = daCo(md);

const moi = [], trung = [];
for (const g of ghiChu) {
  (co.has(g.ngay + NGAN + gonLai(g.chu)) ? trung : moi).push(g);
}

for (const g of moi) {
  console.log('  ' + mau.xanh('+ ') + g.ngay + (g.loai ? mau.mo(' · ' + g.loai) : '') +
              '  ' + mau.mo(gonLai(g.chu).slice(0, 56) + '…'));
}
for (const g of trung) {
  console.log('  ' + mau.mo('· ' + g.ngay + '  file đã có — chỉ xoá trên D1'));
}

if (chiThu) {
  console.log('\n  ' + mau.mo(`--thu: không sửa gì. ${moi.length} sẽ thêm vào file, ` +
              `${moi.length + trung.length} sẽ xoá trên D1.`) + '\n');
  process.exit(0);
}

/* BƯỚC 3 — ghi file trước. */
if (moi.length) {
  const khoi = moi.map((g) =>
    `## ${g.ngay}${g.loai ? ' · ' + g.loai : ''}\n\n${String(g.chu).trim()}`);
  fs.writeFileSync(FILE, chen(md, khoi), 'utf8');
}

/* BƯỚC 4 — xoá trên D1. Cần khoá; không có thì dừng ở đây và nói rõ, chứ
   không im lặng coi như xong: lần dựng sau ghi chú sẽ hiện HAI lần (một bản
   từ file, một bản từ D1) và chẳng ai đoán ra vì sao. */
if (!ID || !KEY) {
  console.log('\n  ' + mau.vang('⚠ thiếu GC_ID / GC_KEY — đã ghi vào file nhưng CHƯA xoá trên D1.'));
  console.log('  ' + mau.mo('Chạy lại kèm khoá, không thì /notes/ sẽ hiện trùng:'));
  console.log('  ' + mau.mo('GC_ID=… GC_KEY=… npm run gc') + '\n');
  process.exit(1);
}

let xong = 0, hong = 0;
for (const g of [...moi, ...trung]) {
  const r = await fetch(API + '?ma=' + encodeURIComponent(g.ma), {
    method: 'DELETE', headers: { 'x-gc-id': ID, 'x-gc-key': KEY }
  }).catch(() => null);
  if (r && r.ok) xong++;
  else { hong++; console.log('  ' + mau.do('✗ không xoá được ' + g.ma)); }
}

console.log('\n  ' + mau.xanh(`✓ thêm ${moi.length} ghi chú vào file · xoá ${xong} bản trên D1`) +
            (hong ? mau.do(` · ${hong} không xoá được`) : ''));
console.log('  ' + mau.mo('chạy `npm run build` để chúng lên trang thật') + '\n');
process.exit(hong ? 1 : 0);
