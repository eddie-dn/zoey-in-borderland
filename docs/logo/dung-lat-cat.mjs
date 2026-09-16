/* Gộp 25 khung đã trích thành MỘT tấm lát cắt: lưới 5×5, mỗi ô một mốc, có
   ghi phần trăm và tên chặng. Một file xem hết cả vòng kể mà không phải mở 25
   file hay ngồi chờ hoạt hình chạy. */
import fs from 'node:fs';
import path from 'node:path';

const GOC = "/Users/zoey-nguyen/Desktop/HAN's/My Blog/zoey-in-borderland";
const NGUON = path.join(GOC, 'docs', 'logo', '_khung');

/* Tên chặng cho mấy mốc đáng nhớ. Mốc nào không có tên thì để trống — ghi chữ
   vào mọi ô thì hai mươi lăm dòng chữ át mất chính cái hình. */
const TEN = {
  0: 'nghỉ · mandala', 8: 'ba vạch', 20: 'chữ Z', 28: 'đa giác',
  36: 'xoay ngang', 44: 'vô cực 1', 48: 'chữ B', 56: 'vô cực 2',
  64: 'mandala nở', 80: 'xoay', 88: 'vỡ', 96: 'tụ lại'
};

const O    = 150;   /* cạnh một ô */
const COT  = 5;
const LE   = 26;    /* lề ngoài */
const CHU  = 30;    /* chỗ chừa cho dòng chữ dưới mỗi ô */
const DAU  = 84;    /* chỗ chừa cho tiêu đề tấm */

const moc = [];
for (let p = 0; p <= 96; p += 4) moc.push(p);

const HANG = Math.ceil(moc.length / COT);
const W = LE * 2 + COT * O;
const H = DAU + LE + HANG * (O + CHU);

const o = [];
o.push(`<?xml version="1.0" encoding="UTF-8"?>`);
o.push(`<!-- Zoey in Borderland — lát cắt vòng kể của logo.
     25 mốc, cách nhau 4% của vòng 27 giây. Đọc từ trái sang phải, trên xuống
     dưới. Sinh ra từ chính hoạt hình đang chạy; xem docs/logo/README.md. -->`);
o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"`
     + ` width="${W}" height="${H}" role="img"`
     + ` aria-label="Hai mươi lăm lát cắt của vòng kể logo Zoey in Borderland">`);
o.push(`<style>
  .nen{fill:#FAF6FD}
  .o{fill:#FFFFFF;stroke:#E4DAF0;stroke-width:1;rx:10}
  .de{font:600 22px "Cormorant Garamond",Georgia,serif;font-style:italic;fill:#2E2340}
  .dan{font:400 12.5px ui-sans-serif,system-ui,sans-serif;fill:#6B6180}
  .so{font:600 10px ui-monospace,Menlo,monospace;fill:#8A7FA3;letter-spacing:.08em}
  .ten{font:400 11px ui-sans-serif,system-ui,sans-serif;fill:#5A5070}
</style>`);
o.push(`<rect class="nen" x="0" y="0" width="${W}" height="${H}"/>`);
o.push(`<text class="de" x="${LE}" y="${LE + 26}">Logo — lát cắt một vòng kể</text>`);
o.push(`<text class="dan" x="${LE}" y="${LE + 48}">`
     + `25 mốc, cách nhau 4% của vòng 27 giây · đọc từ trái sang phải</text>`);

moc.forEach((p, i) => {
  const c = i % COT, h = Math.floor(i / COT);
  const x = LE + c * O;
  const y = DAU + h * (O + CHU);

  const f = path.join(NGUON, 'f' + String(p).padStart(2, '0') + '.svg');
  let noi = fs.readFileSync(f, 'utf8');
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
     Chừa lề trong 10 đơn vị bằng cách nới viewBox ra hai phía. */
  o.push(`<svg x="${x + 4}" y="${y}" width="${O - 8}" height="${O - 8}"`
       + ` viewBox="-5 -5 58 58" color="#2E2340">${noi}</svg>`);
  const nhan = String(p).padStart(2, '0') + '%'
             + (TEN[p] ? '   ' + TEN[p] : '');
  o.push(`<text class="so" x="${x + 4}" y="${y + O + 2}">${nhan}</text>`);
});

o.push('</svg>');

const ra = o.join('\n') + '\n';
fs.writeFileSync(path.join(GOC, 'docs', 'logo', 'lat-cat.svg'), ra, 'utf8');
console.log('lat-cat.svg  %d KB  ·  %d ô  ·  %d×%d',
  Math.round(ra.length / 1024), moc.length, W, H);
