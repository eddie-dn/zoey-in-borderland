#!/usr/bin/env node
/* ============================================================
   VERSION — ghi một dòng vào sổ phiên bản docs/LICH-SU.md.

   Chạy:
     npm run ver -- "chỉnh hệ chữ"          bản vá     V2.4.9 → V2.5.0
     npm run ver -- --vua "dựng trang tag"   đợt mới    V2.4.x → V2.5.0
     npm run ver -- --lon "đổi bộ khung"     build mới  V2.x.x → V3.0.0
     npm run ver                             chỉ xem bản hiện tại

   BA TẦNG, mỗi tầng chạy 0..9. Chạm 9 thì tầng trên tự lên và tầng dưới về 0 —
   không cần nhớ gõ cờ. Không đệm số 0: `V2.4.9`, không phải `V2.04.09`.

   Cột "Sửa chính" chỉ ghi LOẠI VIỆC. Không ghi tên biến, tên endpoint, đường
   dẫn nội bộ hay mã gì — sổ này người đọc blog mở ra xem được.
   ============================================================ */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docSo, ghiSo, temNgay } from './lib/lichsu.mjs';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mau = {
  do: (s) => `\x1b[31m${s}\x1b[0m`, xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo: (s) => `\x1b[2m${s}\x1b[0m`,  dam: (s) => `\x1b[1m${s}\x1b[0m`,
  tim: (s) => `\x1b[35m${s}\x1b[0m`
};

const tho = process.argv.slice(2);
const lon = tho.includes('--lon') || tho.includes('--major');
const vua = tho.includes('--vua') || tho.includes('--minor');
const suaChinh = tho.filter((x) => !x.startsWith('--')).join(' ').trim();

const so = docSo(GOC);
if (so.loi) { console.log(mau.do(`\n  ✖ ${so.loi}\n`)); process.exit(1); }

/* Không có mô tả → chỉ xem, không ghi gì */
if (!suaChinh) {
  console.log(`\n  ${mau.dam('Sổ phiên bản')}  ${mau.mo('docs/LICH-SU.md')}\n`);
  so.ban.slice(0, 6).forEach((b, i) => {
    const dau = i === 0 ? mau.tim('▸') : mau.mo('·');
    console.log(`  ${dau} ${mau.dam(b.ten.padEnd(7))} ${mau.mo(temNgay(b.ngay).padEnd(12))} ${b.suaChinh}`);
  });
  console.log(`\n  ${mau.mo('bản vá :')} npm run ver -- "mô tả loại việc"`);
  console.log(`  ${mau.mo('đợt mới:')} npm run ver -- --vua "mô tả"`);
  console.log(`  ${mau.mo('build  :')} npm run ver -- --lon "mô tả"\n`);
  process.exit(0);
}

/* Chặn mô tả lọt thông tin nội bộ — sổ này công khai */
/* Chỉ chặn theo TỪ KHOÁ, không chặn theo con số. Bản đầu chặn mọi số 4–6 chữ
   số để bắt mã PIN, nhưng thế thì "chỉnh khung ảnh 1600x900" cũng bị chặn —
   luật gắt quá thì người ta bỏ qua luôn cả công cụ. */
const CAM = [
  [/\bPIN\b|\bmật khẩu\b|\bpassword\b/i, 'có nhắc tới mã hoặc mật khẩu'],
  [/process\.env|API[_ -]?KEY|\btoken\b|\bsecret\b|\bendpoint\b/i,
   'có nhắc tới biến môi trường, khoá, hoặc tên endpoint'],
  [/https?:\/\//i, 'có đường dẫn — sổ chỉ ghi loại việc, không ghi địa chỉ']
];
for (const [re, viSao] of CAM) {
  if (re.test(suaChinh)) {
    console.log(mau.do(`\n  ✖ Không ghi: ${viSao}.`));
    console.log(mau.mo('    Sổ phiên bản là file công khai — chỉ ghi LOẠI việc.'));
    console.log(mau.mo(`    Ví dụ: "chỉnh hệ chữ", "đồng bộ hệ nút", "cập nhật khung ảnh"\n`));
    process.exit(1);
  }
}

/* ── MỘT DÒNG SỔ CHỞ TỐI ĐA BỐN VIỆC ──
   Cột "Sửa chính" hiện ra trong ngăn phiên bản ở chân trang — người đọc blog
   mở được. Một dòng sáu bảy mệnh đề ở đó không ai đọc hết; nó thành một khối
   chữ để lướt qua, và cả cuốn sổ mất tác dụng.

   Nhiều việc quá thì KHÔNG phải cắt bớt cho vừa — cắt bớt là mất dấu vết của
   thứ đã làm. Chia làm hai bản vá: V15.01 rồi V15.02. Đuôi chạy tới 09, nên
   chỗ thì có thừa.

   Đếm theo dấu `;` vì đó là dấu ngăn việc trong mọi dòng của sổ. */
const soViec = suaChinh.split(';').map((x) => x.trim()).filter(Boolean).length;
if (soViec > 4) {
  console.log(mau.do(`\n  ✖ Dòng này chở ${soViec} việc — một dòng sổ tối đa 4.`));
  console.log(mau.mo('    Cột "Sửa chính" hiện ra ở ngăn phiên bản chân trang; dài quá thì không ai đọc.'));
  console.log(mau.mo('    Chia ra chạy hai lượt, mỗi lượt một bản vá:'));
  suaChinh.split(';').map((x) => x.trim()).filter(Boolean).forEach((x, i) => {
    console.log(mau.mo(`      ${i + 1}. ${x}`));
  });
  console.log('');
  process.exit(1);
}

const kq = ghiSo(GOC, suaChinh, { lon, vua });
console.log(`
  ${mau.xanh('✓ Đã ghi sổ')}   ${mau.dam(kq.ten)}  ${mau.mo(temNgay(kq.ngay))}
    ${kq.suaChinh}
  ${mau.mo(
    kq.lon      ? (kq.tuCuon ? `build mới — đợt ${kq.buildTruoc}.${kq.dotTruoc} đã chạm 9.9`
                             : 'build mới')
    : kq.tuCuon ? `đợt mới — bản vá của đợt ${kq.buildTruoc}.${kq.dotTruoc} đã chạm 9`
    : kq.vua    ? `đợt mới của build ${kq.build}`
                : `bản vá thứ ${kq.va} của đợt ${kq.build}.${kq.dot}`)}

  ${mau.mo('Đừng quên viết mấy dòng tóm tắt cho bản này ở phần dưới docs/LICH-SU.md')}
  ${mau.mo('— tối đa 3–4 gạch đầu dòng, ghi cái người đọc thấy khác, không phải tên file.')}
`);
