/* ============================================================
   npm run og          sinh ba tấm ảnh chia sẻ (og:image)

   ── ẢNH CHIA SẺ LÀ THỨ NGƯỜI TA THẤY ĐẦU TIÊN ────────────────────────────
   Trước bản này `public/og.png` là một tấm gradient trơn với hai vòng nét đứt
   rất mờ: không logo, không tên blog, không địa chỉ. Dán một đường dẫn lên
   Facebook hay Zalo thì thẻ hiện ra gần như một ô trống — người lướt qua
   không có gì để nhận ra đây là ai.

   Tấm mới mang đúng ba thứ: logo ở trạng thái nghỉ, tên blog bằng chính phông
   của trang, và địa chỉ.

   ── BA THEME, VÀ VÌ SAO KHÔNG "NGẪU NHIÊN MỖI LẦN CHIA SẺ" ───────────────
   Máy quét của Facebook, Zalo, X… đọc og:image MỘT LẦN cho mỗi đường dẫn rồi
   nhớ lại hàng tuần. Nên "mỗi lần share một theme" là điều không làm được:
   ai chia sẻ cũng nhận đúng tấm mà máy quét đã nhớ.

   Cái làm được — và cho ra đúng thứ muốn có — là ngẫu nhiên theo BÀI: tên bài
   quyết định theme, tất định và không đổi. Một feed có vài đường dẫn của blog
   này sẽ hiện ba sắc khác nhau, mà mỗi bài vẫn luôn là một tấm cố định.
   Xem `anhChiaSe()` trong tools/build.mjs.

   ── VÌ SAO DỰNG BẰNG SVG RỒI RASTER HOÁ ─────────────────────────────────
   Chữ phải là Cormorant Garamond nghiêng và Oswald — hai phông tải từ Google
   Fonts, không có sẵn trong máy. Nên file này NHÚNG thẳng hai phông ấy (dạng
   woff2, base64) vào SVG: ảnh ra đúng chữ của trang ở bất kỳ máy nào, không
   cần mạng, không cần cài phông.

   `qlmanage` là bộ raster hoá có sẵn trong macOS (chính là thứ tạo ảnh xem
   trước trong Finder). Thêm một thư viện vẽ ảnh chỉ để chạy vài tháng một lần
   thì không đáng — cả dự án này không có dependency nào.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT = path.join(GOC, 'tools', 'og-font');
const RA = path.join(GOC, 'public');
const W = 1200, H = 630;
const DEM = Math.round((W - H) / 2);   /* đệm trên/dưới khi vẽ vào khung vuông */

/* Bốn bảng màu, chép từ src/styles/tokens.css. Đổi màu ở đó thì đổi cả ở đây —
   không có cách nào đọc CSS custom property từ Node mà không dựng cả trang. */
const THEME = {
  'og':            { nen: '#FAF6FD', muc: '#3E2F56', logo: '#7A52B8', nhan: '#6A587F',
                     quang: [['#FFF6FB', 10, -4, 120, 70], ['#EFE4FC', 94, 2, 90, 55],
                             ['#FBEDF1', 50, 104, 120, 60]] },
  'og-thien-ha':   { nen: '#120C22', muc: '#F6EFFB', logo: '#EFC2E9', nhan: '#9E93AC',
                     quang: [['#2B1E4C', 50, 38, 125, 85], ['#3A2560', 86, 90, 80, 55],
                             ['#1B1233', 50, 38, 190, 120]] },
  'og-tinh-lang':  { nen: '#DCE8F5', muc: '#15303E', logo: '#0B5A78', nhan: '#365665',
                     quang: [['#F4FAFF', 10, -4, 120, 70], ['#CFE4F8', 94, 2, 90, 55],
                             ['#D3E9E6', 50, 104, 120, 60]] },
  /* 霜降 — giấy trắng, mực đen. Hai quầng rất nhạt, một ngả lam bạc một ngả
     ấm, y như `--bg-tint` của theme. Nền ở đây KHÔNG dùng #FFFFFF: ảnh chia
     sẻ nằm trên nền trắng của Facebook và Messenger, nên một ảnh nền trắng
     thì mất luôn mép và đọc ra như chữ trôi giữa giao diện của họ. #FBFCFD
     đủ để thấy ảnh là một tấm. */
  'og-suong-giang':{ nen: '#FBFCFD', muc: '#111315', logo: '#2A3440', nhan: '#5C6166',
                     quang: [['#F4F8FB', 10, -4, 120, 70], ['#EEF2F6', 94, 2, 90, 55],
                             ['#F7F5F2', 50, 104, 120, 60]] }
};

/* Logo ở trạng thái nghỉ — hai nét, lấy nguyên từ docs/logo/01-nghi.svg. */
const NET1 = 'M 24 24 C 32 15 38 17 41 24 C 38 31 32 33 24 24 C 16 15 10 17 7 24 C 10 31 16 33 24 24';
const NET2 = 'M 24 24 C 15 32 17 38 24 41 C 31 38 33 32 24 24 C 33 16 31 10 24 7 C 17 10 15 16 24 24';

const b64 = (f) => fs.readFileSync(path.join(FONT, f)).toString('base64');
const FONT_CSS = `
@font-face{font-family:CG;font-style:italic;font-weight:600;
  src:url(data:font/woff2;base64,${b64('cormorant.woff2')}) format('woff2')}
@font-face{font-family:OS;font-weight:600;
  src:url(data:font/woff2;base64,${b64('oswald.woff2')}) format('woff2')}`;

function dungSVG(t) {
  const quang = t.quang.map(([mau, px, py, rx, ry], i) => `
    <radialGradient id="q${i}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${mau}" stop-opacity="1"/>
      <stop offset="1" stop-color="${mau}" stop-opacity="0"/>
    </radialGradient>`).join('');
  const veQuang = t.quang.map(([, px, py, rx, ry], i) => {
    const r = Math.max(W, H) * 0.62;
    return `<ellipse cx="${px / 100 * W}" cy="${py / 100 * H}" rx="${r * rx / 100}" ry="${r * ry / 100}" fill="url(#q${i})"/>`;
  }).join('');

  /* Logo: khung 48×48 đặt vào ô 410×410 ở bên phải. */
  const R = 205, cx = W * 0.775, cy = H * 0.5, co = R / 24;
  const g = `translate(${cx} ${cy}) scale(${co}) translate(-24 -24)`;
  const vong = [[21.5, 0.9, 0.42, '3, 6'], [13.5, 0.7, 0.28, '2, 5'], [6, 0.9, 0.42, '1.4, 3.2']]
    .map(([r, w, mo, nhip]) =>
      `<circle cx="24" cy="24" r="${r}" fill="none" stroke="${t.logo}" stroke-width="${w}"
               stroke-opacity="${mo}" stroke-linecap="round" stroke-dasharray="${nhip}"/>`).join('');
  const canh = [45, 135].map((goc) =>
    `<path d="${NET1}" fill="none" stroke="${t.logo}" stroke-width="2" stroke-opacity="0.8"
           stroke-linecap="round" transform="rotate(${goc} 24 24)"/>`).join('');

  const le = 96;
  /* ── KHUNG VẼ HÌNH VUÔNG, THIẾT KẾ NẰM GIỮA ──
     `qlmanage` luôn xuất ra ảnh VUÔNG và co thiết kế cho vừa cạnh dài nhất —
     nên một khung 1200×630 bị phóng to rồi cắt mất hai đầu. Vẽ vào một khung
     vuông 1200×1200, đặt dải 630 vào giữa, rồi cắt lại đúng dải ấy: tỉ lệ 1:1,
     không co không phóng. `DEM` là quãng đệm trên/dưới. */
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
<defs>${quang}<style>${FONT_CSS}</style></defs>
<rect width="${W}" height="${W}" fill="${t.nen}"/>
<g transform="translate(0 ${DEM})">
<rect width="${W}" height="${H}" fill="${t.nen}"/>
${veQuang}
<g transform="${g}" stroke-linejoin="round">
  ${vong}${canh}
  <path d="${NET1}" fill="none" stroke="${t.logo}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="${NET2}" fill="none" stroke="${t.logo}" stroke-width="2.6" stroke-linecap="round"/>
</g>
<text x="${le}" y="150" font-family="OS" font-size="21" font-weight="600"
      letter-spacing="5.2" fill="${t.nhan}">PERSONAL NOTES</text>
<text x="${le}" y="300" font-family="CG" font-style="italic" font-size="112"
      font-weight="600" fill="${t.muc}">Zoey<tspan font-size="40" dx="18" opacity="0.66">in</tspan></text>
<text x="${le}" y="416" font-family="CG" font-style="italic" font-size="112"
      font-weight="600" fill="${t.muc}">Borderland</text>
<line x1="${le}" y1="474" x2="${le + 300}" y2="474" stroke="${t.nhan}" stroke-width="1" stroke-opacity="0.45"/>
<text x="${le}" y="516" font-family="OS" font-size="19" font-weight="600"
      letter-spacing="3.4" fill="${t.nhan}">Z-IN-BORDERLAND.COM</text>
</g>
</svg>`;
}

const tam = fs.mkdtempSync(path.join(GOC, '.og-'));
try {
  for (const [ten, t] of Object.entries(THEME)) {
    const svg = path.join(tam, ten + '.svg');
    fs.writeFileSync(svg, dungSVG(t), 'utf8');
    /* qlmanage đệm ảnh ra hình VUÔNG, nên xin cạnh 1200 rồi cắt lấy dải giữa
       cao 630. `sips` cũng có sẵn trong macOS. */
    execFileSync('qlmanage', ['-t', '-s', String(W), '-o', tam, svg], { stdio: 'ignore' });
    const thoPNG = path.join(tam, ten + '.svg.png');
    const dich = path.join(RA, ten + '.jpg');
    /* ── JPEG, KHÔNG PHẢI PNG ──
       Tấm này gần như toàn gradient mềm — đúng thứ PNG nén tệ nhất: 670KB cho
       một hình chỉ có bốn dòng chữ và một cái logo. JPEG chất lượng 80 cho ra
       chừng 60KB, và ở một hình không có nét mảnh hay mảng màu phẳng thì mắt
       không phân biệt được. Facebook, Zalo, X đều nhận JPEG cho og:image.

       Cắt lấy đúng dải giữa rồi đổi định dạng. sips: -c <cao> <rộng>,
       cropOffset <y> <x>. */
    execFileSync('sips', ['-c', String(H), String(W), '--cropOffset', String(DEM), '0',
                          '-s', 'format', 'jpeg', '-s', 'formatOptions', '80',
                          thoPNG, '--out', dich], { stdio: 'ignore' });
    console.log('  %s  %d KB', ten + '.jpg', Math.round(fs.statSync(dich).size / 1024));
  }
} finally {
  fs.rmSync(tam, { recursive: true, force: true });
}
console.log('\n  Xong. Bốn tấm nằm trong public/ — npm run build là chúng sang dist/.');
