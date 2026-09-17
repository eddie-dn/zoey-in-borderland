/* Dựng một file SVG ĐỘNG đứng một mình từ chính logo đang chạy trên trang:
   lấy markup trong HTML đã dựng, gói kèm đúng mấy luật CSS của logo, rồi ghi
   ra `docs/logo/logo-dong.svg`. Mở bằng trình duyệt là nó tự kể lại vòng 27
   giây, không cần trang web nào. */
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

/* Gốc dự án suy ra từ chỗ chính file này đang nằm (docs/logo/ ⇒ lùi hai bậc).
   Bản trước gõ cứng đường trên máy người viết — chạy ở máy khác, hay chỉ cần
   đổi tên thư mục, là hỏng ngay. */
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const html = fs.readFileSync(path.join(GOC, 'dist/index.html'), 'utf8');

/* ── ĐỌC ĐÚNG MẤY GÓI TRANG CHỦ ĐANG TẢI ──
   Trước V2.5.0 chỉ có một `dist/assets/style.css` và dòng này gõ cứng tên ấy.
   Nay CSS chia theo loại trang, và tên file còn mang vân tay nội dung
   (`nen.b92c6bac.css`), nên gõ cứng bất kỳ tên nào cũng sai sau lượt sửa kế
   tiếp. Đọc thẳng từ trang đã dựng: nó khai ra nó tải những gì.

   Luật của logo nằm ở `layout.css`, tức gói `nen` — nhưng cứ nối hết mọi gói
   trang chủ tải rồi lọc sau, vì phần lọc bên dưới đã làm đúng việc ấy. */
const goi = [...html.matchAll(/<link[^>]+href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
if (!goi.length) throw new Error('dist/index.html không trỏ tới gói CSS nào — chạy npm run build trước');
const css = goi.map((g) => fs.readFileSync(path.join(GOC, 'dist' + g), 'utf8')).join('\n');

/* ── MARKUP ── */
const m = html.match(/<svg class="logo logo--dong"[\s\S]*?<\/svg>/);
if (!m) throw new Error('không tìm thấy logo trong dist/index.html');
let svg = m[0]
  .replace(/^<svg class="logo logo--dong"[^>]*>/, '')
  .replace(/<\/svg>$/, '');

/* ── CSS ──
   Quét từng khối ở cấp cao nhất, giữ khối nào có dính tới logo. Không dùng
   regex một phát cho cả file: `@keyframes` có ngoặc lồng, mà regex thì không
   đếm được ngoặc lồng nhau. */
function tachKhoi(s) {
  const ra = [];
  let i = 0;
  while (i < s.length) {
    const mo = s.indexOf('{', i);
    if (mo < 0) break;
    let sau = s.indexOf('}', mo), sau2 = mo + 1, muc = 1;
    while (sau2 < s.length && muc > 0) {
      const c = s[sau2];
      if (c === '{') muc++;
      else if (c === '}') muc--;
      sau2++;
    }
    ra.push({ dau: s.slice(i, mo).trim(), than: s.slice(mo, sau2) });
    i = sau2;
  }
  return ra;
}

const CAN = /(^|[\s,{])\.(lg-|logo)|@keyframes\s+lg-/;
const luat = tachKhoi(css)
  .filter((k) => CAN.test(k.dau))
  /* Bỏ luật trong @media: file lưu không có ngữ cảnh trang, và mấy luật ấy
     đều là phần "giảm chuyển động" hoặc bố cục thanh đầu trang. */
  .filter((k) => !k.dau.startsWith('@media'))
  /* Bỏ luật của THANH ĐẦU TRANG: `.brand .logo` khoá bề ngang 30px, mà ở file
     đứng một mình thì logo phải rộng bằng khung. Luật ấy nói về chỗ logo ĐỨNG,
     không nói về bản thân logo. */
  .filter((k) => !/\.brand/.test(k.dau))
  .map((k) => k.dau + k.than)
  .join('\n');

/* Biến màu và biến vòng lặp: file đứng một mình nên không có :root của trang,
   phải tự khai. Lấy đúng mực accent của theme Sakura. */
const dau = `svg{color:#7A52B8;background:#FAF6FD}
.logo--dong{--lg-ck:27s}`;

const ra = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Zoey in Borderland — logo, trọn một vòng kể 27 giây.
     Mở file này bằng trình duyệt là nó tự chạy. Không cần trang web,
     không cần mạng, không cần phông chữ nào.
     Sinh ra từ chính hoạt hình đang chạy trên trang; muốn dựng lại thì xem
     docs/logo/README.md. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="320" height="320"
     class="logo logo--dong" role="img"
     aria-label="Logo Zoey in Borderland đang kể lại quá trình dựng hình">
<style>
${dau}
${luat}
</style>
${svg.trim()}
</svg>
`;

const thuMuc = path.join(GOC, 'docs', 'logo');
fs.mkdirSync(thuMuc, { recursive: true });
fs.writeFileSync(path.join(thuMuc, 'logo-dong.svg'), ra, 'utf8');
console.log('logo-dong.svg  %d KB  ·  %d luật CSS',
  Math.round(ra.length / 1024), luat.split('\n').length);
