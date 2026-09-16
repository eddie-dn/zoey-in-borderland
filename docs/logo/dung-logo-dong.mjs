/* Dựng một file SVG ĐỘNG đứng một mình từ chính logo đang chạy trên trang:
   lấy markup trong HTML đã dựng, gói kèm đúng mấy luật CSS của logo, rồi ghi
   ra `_anh/logo/logo-dong.svg`. Mở bằng trình duyệt là nó tự kể lại vòng 27
   giây, không cần trang web nào. */
import fs from 'node:fs';
import path from 'node:path';

const GOC = "/Users/zoey-nguyen/Desktop/HAN's/My Blog/zoey-in-borderland";
const html = fs.readFileSync(path.join(GOC, 'dist/index.html'), 'utf8');
const css  = fs.readFileSync(path.join(GOC, 'dist/assets/style.css'), 'utf8');

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
     _anh/logo/README.md. -->
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

const thuMuc = path.join(GOC, '_anh', 'logo');
fs.mkdirSync(thuMuc, { recursive: true });
fs.writeFileSync(path.join(thuMuc, 'logo-dong.svg'), ra, 'utf8');
console.log('logo-dong.svg  %d KB  ·  %d luật CSS',
  Math.round(ra.length / 1024), luat.split('\n').length);
