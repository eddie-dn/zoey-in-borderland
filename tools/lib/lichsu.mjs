/* ============================================================
   LỊCH SỬ — đọc và ghi docs/LICH-SU.md.

   docs/LICH-SU.md là NGUỒN DUY NHẤT của số phiên bản. Build đọc dòng đầu tiên
   trong bảng để lấy Vxx.yy và ngày. Không khai số phiên bản ở site.config.json
   hay bất kỳ đâu khác — hai chỗ thì sớm muộn cũng lệch nhau, và lúc lệch thì
   không biết chỗ nào đúng.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const MO  = '<!-- BANG-BAT-DAU';
const DONG = '<!-- BANG-KET-THUC -->';

/* Một dòng bảng: | V1.00 | 2026-09-14 | 00 | sửa chính | */
const RE_DONG = /^\|\s*V(\d+)\.(\d+)\s*\|\s*([\d-]+)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|\s*$/;

export function duongDan(goc) {
  return path.join(goc, 'docs', 'LICH-SU.md');
}

/* Đọc cả bảng. Dòng đầu mảng là bản mới nhất. */
export function docSo(goc) {
  const f = duongDan(goc);
  if (!fs.existsSync(f)) return { thieuFile: true, ban: [] };

  const raw = fs.readFileSync(f, 'utf8');
  const i = raw.indexOf(MO), j = raw.indexOf(DONG);
  if (i < 0 || j < 0) {
    return { loi: 'docs/LICH-SU.md mất dấu mốc BANG-BAT-DAU hoặc BANG-KET-THUC', ban: [] };
  }

  const ban = [];
  for (const d of raw.slice(i, j).split('\n')) {
    const m = d.match(RE_DONG);
    if (m) {
      ban.push({
        build: +m[1], va: +m[2],
        ten: `V${m[1]}.${m[2]}`,
        ngay: m[3],
        so: m[4],
        suaChinh: m[5]
      });
    }
  }
  return { ban, moiNhat: ban[0] || null };
}

/* Thêm một dòng ngay dưới hàng gạch của bảng.
   `lon: true` mở build mới (V1.03 → V2.00); mặc định là thêm bản vá (V1.03 → V1.04). */
export function ghiSo(goc, suaChinh, { lon = false, ngay = null } = {}) {
  const f = duongDan(goc);
  const raw = fs.readFileSync(f, 'utf8');
  const { moiNhat } = docSo(goc);

  const build = moiNhat ? (lon ? moiNhat.build + 1 : moiNhat.build) : 1;
  const va    = moiNhat ? (lon ? 0 : moiNhat.va + 1) : 0;
  const ten   = `V${build}.${String(va).padStart(2, '0')}`;

  const d = ngay ? new Date(ngay) : new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const ngayISO = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

  /* Cột `#` đếm số bản vá ghi lại được TRONG BUILD ĐÓ, đúng quy ước §5.3 của
     design system cũ — nên nó bằng chính số `va` của dòng này. */
  const dongMoi = `| ${ten} | ${ngayISO} | ${p2(va)} | ${suaChinh} |`;

  /* Chèn ngay sau hàng gạch "|---|---|---|---|", không phải sau hàng tiêu đề:
     chèn nhầm chỗ là bảng vỡ và build không đọc được dòng nào nữa. */
  const dong = raw.split('\n');
  let viTri = -1;
  for (let i = 0; i < dong.length; i++) {
    if (/^\|[\s:|-]+\|\s*$/.test(dong[i]) && dong[i].includes('-')) { viTri = i; break; }
  }
  if (viTri < 0) throw new Error('docs/LICH-SU.md: không tìm thấy hàng gạch của bảng');

  dong.splice(viTri + 1, 0, dongMoi);
  fs.writeFileSync(f, dong.join('\n'));

  return { ten, ngay: ngayISO, va, build, suaChinh, lon };
}

/* "2026-09-14" → "14-Sep-2026" cho tem ở chân trang */
export function temNgay(iso) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${String(d.getUTCDate()).padStart(2, '0')}-${M[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}

/* ── CHI TIẾT TỪNG BẢN ──
   Dưới bảng, mỗi bản có một mục `## Vx.yy — dd-Mon-yyyy` với mấy gạch đầu dòng
   `- **Tên việc.** mô tả`. Bảng điều khiển lịch sử (cửa hậu ở chân trang) đọc
   mấy mục này để hiện chi tiết khi bấm vào một dòng.

   Bộ đọc cố ý DỄ TÍNH, chỉ bám vào hai thứ: dòng `## V...` và các dòng bắt đầu
   bằng `- `. Chữ nghĩa xung quanh gõ kiểu gì cũng được, gõ sai cũng không làm
   sập build — mục nào không đọc được thì bản đó đơn giản là không có chi tiết,
   bảng vẫn hiện dòng tóm tắt lấy từ bảng ở trên.

   Đây là chỗ đã học từ `assets/lichsu.js` bên dongchibinh-33: chỗ nào không có
   dữ liệu thì NÓI RÕ LÀ KHÔNG CÓ, không bịa một dòng nghe cho đẹp. */
export function docChiTiet(goc) {
  const f = duongDan(goc);
  if (!fs.existsSync(f)) return {};

  const raw = fs.readFileSync(f, 'utf8');
  /* Chỉ đọc phần SAU bảng — trong phần ghi chú đầu file cũng có chữ `V1.00`,
     đọc cả file thì mấy dòng ví dụ ở đó lọt vào thành chi tiết giả. */
  const sau = raw.slice(raw.indexOf(DONG) + DONG.length);

  const ra = {};
  for (const khoi of sau.split(/^##[ \t]+/m).slice(1)) {
    const dauDe = (khoi.split('\n')[0] || '').trim();
    const m = dauDe.match(/^(V\d+\.\d+)/);
    if (!m) continue;

    const y = [];
    let dem = null;
    for (const d of khoi.split('\n').slice(1)) {
      if (/^[ \t]*-[ \t]+/.test(d)) {
        if (dem) y.push(dem);
        dem = d.replace(/^[ \t]*-[ \t]+/, '').trim();
      } else if (dem && d.trim() && !/^#/.test(d)) {
        /* Dòng thụt vào là phần nối tiếp của gạch đầu dòng phía trên. Không
           nối thì mỗi ý bị cắt ngang ở chỗ xuống dòng trong file .md — mà chỗ
           xuống dòng đó chỉ là để file dễ đọc, không phải hết ý. */
        dem += ' ' + d.trim();
      } else if (!d.trim() && dem) {
        y.push(dem); dem = null;
      }
    }
    if (dem) y.push(dem);
    if (y.length) ra[m[1]] = y;
  }
  return ra;
}
