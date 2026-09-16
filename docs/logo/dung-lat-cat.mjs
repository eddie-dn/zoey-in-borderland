/* Gộp 14 khung đã trích thành MỘT tấm lát cắt: lưới 5 cột, mỗi ô một chặng,
   có ghi phần trăm và tên chặng. Một file xem hết cả vòng kể mà không phải mở
   14 file hay ngồi chờ hoạt hình chạy.

   ── ĐỌC THẲNG TỪ MẤY FILE KHUNG ──
   Bản trước đọc 25 file `_khung/fNN.svg` — thư mục tạm mà bộ trích sinh ra rồi
   xoá. Nghĩa là muốn dựng lại tấm này thì phải mở trình duyệt, chạy bộ trích,
   rồi mới chạy được file này; và sau khi vòng kể đổi từ 25 mốc đều đặn sang 14
   chặng có tên, nó đọc vào một thư mục không còn tồn tại nữa.

   Giờ nó đọc đúng 14 file khung nằm ngay cạnh — thứ đã nằm sẵn trong kho mã.
   Chạy `node docs/logo/dung-lat-cat.mjs` là xong, không cần trình duyệt. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DAY = path.dirname(fileURLToPath(import.meta.url));

/* Mốc phần trăm phải KHỚP với bảng KHUNG trong trich-logo.js. Chép sang đây
   chứ không import: file kia là mã chạy trong trình duyệt, không phải mô-đun.
   Lệch một con số ở đây thì tấm lát cắt nói sai thời điểm, mà hình vẫn đúng —
   loại sai khó thấy nhất. */
const KHUNG = [
  [2,    '01-nghi.svg',       'nghỉ · mandala'],
  [11,   '02-ba-vach.svg',    'ba vạch'],
  [19,   '03-chu-z.svg',      'chữ Z'],
  [24,   '04-xoay-ngang.svg', 'xoay ngang'],
  [29,   '05-net-noi.svg',    'nét nối đứng'],
  [33.5, '06-chiec-no.svg',   'chiếc nơ'],
  [37,   '07-bo-tron.svg',    'bo tròn'],
  [41,   '08-chu-b.svg',      'chữ B'],
  [46,   '09-hai-vo-cuc.svg', 'hai vô cực'],
  [49.5, '10-mandala-no.svg', 'mandala nở'],
  [53,   '11-danh-net.svg',   'đanh nét'],
  [70,   '12-xoay.svg',       'xoay'],
  [81.5, '13-vo.svg',         'vỡ'],
  [84,   '14-tu-lai.svg',     'tụ lại']
];

const O   = 150;   /* cạnh một ô */
const COT = 5;
const LE  = 26;    /* lề ngoài */
const CHU = 30;    /* chỗ chừa cho dòng chữ dưới mỗi ô */
const DAU = 84;    /* chỗ chừa cho tiêu đề tấm */

const HANG = Math.ceil(KHUNG.length / COT);
const W = LE * 2 + COT * O;
const H = DAU + LE + HANG * (O + CHU);

const o = [];
o.push(`<?xml version="1.0" encoding="UTF-8"?>`);
o.push(`<!-- Zoey in Borderland — lát cắt vòng kể của logo.
     14 chặng trong vòng 27 giây. Đọc từ trái sang phải, trên xuống dưới.
     Sinh ra từ chính mấy file khung bên cạnh; xem docs/logo/README.md. -->`);
o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"`
     + ` width="${W}" height="${H}" role="img"`
     + ` aria-label="Mười bốn chặng của vòng kể logo Zoey in Borderland">`);
o.push(`<style>
  .nen{fill:#FAF6FD}
  .o{fill:#FFFFFF;stroke:#E4DAF0;stroke-width:1;rx:10}
  .de{font:600 22px "Cormorant Garamond",Georgia,serif;font-style:italic;fill:#2E2340}
  .dan{font:400 12.5px ui-sans-serif,system-ui,sans-serif;fill:#6B6180}
  .so{font:600 10px ui-monospace,Menlo,monospace;fill:#8A7FA3;letter-spacing:.08em}
</style>`);
o.push(`<rect class="nen" x="0" y="0" width="${W}" height="${H}"/>`);
o.push(`<text class="de" x="${LE}" y="${LE + 26}">Logo — lát cắt một vòng kể</text>`);
o.push(`<text class="dan" x="${LE}" y="${LE + 48}">`
     + `14 chặng của vòng 27 giây · đọc từ trái sang phải</text>`);

KHUNG.forEach(([p, ten, nhan], i) => {
  const c = i % COT, h = Math.floor(i / COT);
  const x = LE + c * O;
  const y = DAU + h * (O + CHU);

  let noi = fs.readFileSync(path.join(DAY, ten), 'utf8');
  /* Bóc vỏ <svg> ngoài cùng và dòng chú thích — chỉ giữ ruột để đặt vào ô. */
  noi = noi.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
           .replace(/<!--[\s\S]*?-->/g, '').trim();

  o.push(`<rect class="o" x="${x + 4}" y="${y}" width="${O - 8}" height="${O - 8}" rx="10"/>`);
  /* ── LỒNG MỘT <svg> CON, KHÔNG PHẢI MỘT <g> ──
     Ở mấy mốc đang phóng to rồi vỡ, hình vượt hẳn ra ngoài khung 48×48: bông
     hoa căng tới 1,34 lần và mười tám hạt bụi bay ra tới rìa. Đặt bằng <g> thì
     chúng tràn sang ô bên cạnh và cả tấm đọc ra như in lỗi.

     <svg> lồng nhau thì tự cắt theo khung của chính nó — đúng cách trình duyệt
     cắt logo thật trên trang, nên ô ở đây thấy đúng bằng cái người đọc thấy.
     Chừa lề trong 5 đơn vị bằng cách nới viewBox ra hai phía. */
  o.push(`<svg x="${x + 4}" y="${y}" width="${O - 8}" height="${O - 8}"`
       + ` viewBox="-5 -5 58 58" color="#2E2340">${noi}</svg>`);
  /* Mốc lẻ ghi bằng dấu PHẨY (33,5%) — nếp số của tiếng Việt, và cả tấm này
     là chú thích cho người đọc chứ không phải dữ liệu cho máy. Mốc chẵn đệm số
     0 phía trước để cột số thẳng hàng. */
  const so = (Number.isInteger(p) ? String(p).padStart(2, '0') : String(p).replace('.', ','));
  o.push(`<text class="so" x="${x + 4}" y="${y + O + 2}">${so}%   ${nhan}</text>`);
});

o.push('</svg>');

const ra = o.join('\n') + '\n';
fs.writeFileSync(path.join(DAY, 'lat-cat.svg'), ra, 'utf8');
console.log('lat-cat.svg  %d KB  ·  %d ô  ·  %d×%d',
  Math.round(ra.length / 1024), KHUNG.length, W, H);
