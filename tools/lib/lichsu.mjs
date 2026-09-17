/* ============================================================
   LỊCH SỬ — đọc và ghi docs/LICH-SU.md.

   docs/LICH-SU.md là NGUỒN DUY NHẤT của số phiên bản. Build đọc dòng đầu tiên
   trong bảng để lấy Vxx.yy và ngày. Không khai số phiên bản ở site.config.json
   hay bất kỳ đâu khác — hai chỗ thì sớm muộn cũng lệch nhau, và lúc lệch thì
   không biết chỗ nào đúng.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

/* ══════════ SỐ BUILD BỊ BỎ QUA ══════════
   Chủ trang kiêng mấy con số này, nên sổ phiên bản không bao giờ dừng ở chúng.
   Đây là lựa chọn của người, không phải ràng buộc kỹ thuật — nhưng nó phải nằm
   TRONG công cụ chứ không nằm trong trí nhớ: nhớ bằng đầu thì đúng được vài
   lần, rồi một hôm gõ `npm run ver` lúc đang vội là sổ có một dòng V13 nằm đó
   vĩnh viễn (số phiên bản đã in ra chân trang, đã lên kho mã, sửa lại là sửa
   lịch sử).

   Bỏ qua ở VẾ BUILD, không ở vế bản vá: vế sau chỉ chạy 00..09 nên không bao
   giờ chạm tới mấy số này. */
const BUILD_BO = [13, 14, 23, 38, 39, 40, 41];

/* Trả về số build kế tiếp HỢP LỆ, nhảy qua mọi số trong danh sách trên.
   Vòng lặp chắc chắn dừng: danh sách hữu hạn, mà số thì tăng mãi. */
function buildKe(n) {
  let b = n;
  while (BUILD_BO.includes(b)) b++;
  return b;
}

const MO  = '<!-- BANG-BAT-DAU';
const DONG = '<!-- BANG-KET-THUC -->';

/* ══════════ BA TẦNG SỐ: Vxx.yy.zz ══════════
   Đời trước chỉ có hai tầng `Vxx.yy`, đuôi chạy 00..09 — tức mỗi build chỉ chở
   được MƯỜI bản. Làm một ngày là hết ba build, và con số đầu nở ra nhanh tới
   mức nó thôi nói lên điều gì.

   Nay ba tầng, mỗi tầng vẫn 00..09:
     zz   bản vá      — mỗi lượt `npm run ver`
     yy   đợt         — zz chạm 09 thì yy lên một, zz về 00
     xx   build       — yy VÀ zz cùng 09 thì xx lên một, cả hai về 00

   Một build nay chở 100 bản thay vì 10, nên số build lại có nghĩa: nó đánh dấu
   một chặng, không phải một buổi chiều.

   Luật bỏ số (13 · 14 · 23 · 38 · 39 · 40 · 41) chỉ áp cho VẾ BUILD — hai vế
   sau chạy 00..09 nên không bao giờ chạm tới mấy số ấy. */
const RE_DONG = /^\|\s*V(\d+)\.(\d+)\.(\d+)\s*\|\s*([\d-]+)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|\s*$/;

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
        build: +m[1], dot: +m[2], va: +m[3],
        ten: `V${+m[1]}.${+m[2]}.${+m[3]}`,
        /* `nhom` là hai tầng đầu — khoá để gom bản vá theo đợt ở ngăn phiên
           bản, và cũng là thứ chiếu vào mấy mục `## V2.04` trong tài liệu. */
        nhom: `V${+m[1]}.${+m[2]}`,
        ngay: m[4],
        so: m[5],
        suaChinh: m[6]
      });
    }
  }
  return { ban, moiNhat: ban[0] || null };
}

/* Thêm một dòng ngay dưới hàng gạch của bảng.
   `lon: true` mở build mới (V1.03 → V2.00); mặc định là thêm bản vá (V1.03 → V1.04).
   Đuôi bản vá chỉ chạy 00..09 — chạm 09 thì bản kế tự mở build mới. */
export function ghiSo(goc, suaChinh, { lon = false, vua = false, ngay = null } = {}) {
  const f = duongDan(goc);
  const raw = fs.readFileSync(f, 'utf8');
  const { moiNhat } = docSo(goc);

  /* ĐUÔI BẢN VÁ CHỈ CHẠY 00..09.
     Quy ước Vxx.yy có đúng hai chữ số cho mỗi vế, và vế sau dừng ở 09 — không
     có V1.10. Chạm 09 rồi thì bản kế TỰ mở build mới, không cần ai nhớ gõ
     --lon. Bản đầu không có cái chặn này nên sổ đã lỡ đi tới V1.14 trước khi
     có người nhận ra; sửa tay thì lần sau lại lặp lại. */
  const TOI_DA = 9;
  let build, dot, va, tuCuon = false;

  if (!moiNhat) {
    build = 1; dot = 0; va = 0;
  } else if (lon) {
    build = buildKe(moiNhat.build + 1); dot = 0; va = 0;
  } else if (vua) {
    /* Xin một ĐỢT mới: nếu đợt cũng đã chạm 09 thì phải cuốn lên build. */
    if (moiNhat.dot >= TOI_DA) {
      build = buildKe(moiNhat.build + 1); dot = 0; va = 0; tuCuon = true;
    } else {
      build = moiNhat.build; dot = moiNhat.dot + 1; va = 0;
    }
  } else if (moiNhat.va < TOI_DA) {
    build = moiNhat.build; dot = moiNhat.dot; va = moiNhat.va + 1;
  } else if (moiNhat.dot < TOI_DA) {
    /* Bản vá chạm 09 → tự sang đợt mới, không cần ai nhớ gõ cờ. */
    build = moiNhat.build; dot = moiNhat.dot + 1; va = 0; tuCuon = true;
  } else {
    /* Cả hai vế sau cùng 09 → build mới. */
    build = buildKe(moiNhat.build + 1); dot = 0; va = 0; tuCuon = true;
  }

  /* KHÔNG đệm số 0: `V2.4.9`, không phải `V2.04.09` — ba cặp số đệm đọc ra
     nặng nề mà chẳng thêm nghĩa gì. Vế build thì bao nhiêu chữ số cũng được,
     `V10.9.1` vẫn hợp lệ. */
  const ten = `V${build}.${dot}.${va}`;
  const moBuild = !!moiNhat && build !== moiNhat.build;
  const moDot   = !!moiNhat && !moBuild && dot !== moiNhat.dot;

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

  /* `buildTruoc` chứ không để chỗ gọi tự tính `build - 1`: từ lúc có luật bỏ
     số, hai con số ấy không còn liền nhau — V12.09 nhảy thẳng lên V15.00, và
     câu báo "bản vá của build 14 đã chạm 09" nói về một build chưa từng tồn
     tại. Ai biết số thì trả số ấy ra. */
  return { ten, ngay: ngayISO, va, dot, build, suaChinh,
           lon: moBuild, vua: moDot, tuCuon,
           nhom: `V${build}.${dot}`,
           buildTruoc: moiNhat ? moiNhat.build : null,
           dotTruoc: moiNhat ? moiNhat.dot : null };
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
    /* Khớp cả `V2.04.09` (một bản) lẫn `V2.04` (cả một đợt) — ngăn phiên bản
       ở chân trang dựng ba tầng, nên tài liệu cũng viết được ở hai mức. */
    const m = dauDe.match(/^(V\d+\.\d+(?:\.\d+)?)/);
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
