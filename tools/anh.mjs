#!/usr/bin/env node
/* ============================================================
   ANH — đưa ảnh vào đúng thư mục của một bài, rồi in sẵn dòng Markdown.

   Chạy:
     npm run anh                       xem trạng thái: bài nào có ảnh gì
     npm run anh vo-thuc-tap-the       chuyển mọi ảnh trong _anh/ vào bài đó
     npm run anh vo-thuc-tap-the --bia ảnh đầu tiên thành ảnh bìa luôn

   CÁCH DÙNG THƯỜNG NGÀY
     1. Quăng ảnh vào thư mục `_anh/` ở gốc dự án (chụp màn hình, tải về, kéo
        thả — kiểu gì cũng được, tên file không cần đặt trước).
     2. `npm run anh <slug-bài>`
     3. Dán mấy dòng Markdown nó in ra vào bài.

   `_anh/` nằm trong .gitignore nên ảnh chưa dùng không bao giờ lọt lên git.
   Việc của lệnh này là: đổi tên cho sạch, xếp vào public/media/<năm>/<slug>/,
   đo kích thước, cảnh báo ảnh nặng, và viết sẵn dòng chèn.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/text.mjs';
import { kichThuocAnh, tiLe } from './lib/imgsize.mjs';

const GOC   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NHAP  = path.join(GOC, '_anh');
const POSTS = path.join(GOC, 'content', 'posts');
const MEDIA = path.join(GOC, 'public', 'media');

const mau = {
  do: (s) => `\x1b[31m${s}\x1b[0m`, vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`, mo: (s) => `\x1b[2m${s}\x1b[0m`,
  dam: (s) => `\x1b[1m${s}\x1b[0m`, tim: (s) => `\x1b[35m${s}\x1b[0m`
};

const DUOI = /\.(jpe?g|png|gif|webp|avif|svg|mp4|webm)$/i;

function quet(d, loc) {
  if (!fs.existsSync(d)) return [];
  const ra = [];
  for (const m of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, m.name);
    if (m.isDirectory()) { if (!m.name.startsWith('.')) ra.push(...quet(p, loc)); }
    else if (!m.name.startsWith('.') && (!loc || loc(m.name))) ra.push(p);
  }
  return ra;
}

/* Tìm bài theo slug. Nhận cả tên file đầy đủ lẫn slug trần. */
function timBai(slug) {
  const s = slugify(slug.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''));
  for (const f of quet(POSTS, (n) => n.endsWith('.md') && !n.startsWith('_'))) {
    const ten = path.basename(f, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const raw = fs.readFileSync(f, 'utf8');
    const khai = (raw.match(/^slug:\s*(.+)$/m) || [])[1];
    if (slugify(khai || ten) === s) {
      const ngay = (raw.match(/^date:\s*(\d{4})-/m) || [])[1] || String(new Date().getFullYear());
      return { file: f, slug: slugify(khai || ten), nam: ngay, raw };
    }
  }
  return null;
}

const tho  = process.argv.slice(2);
const coBia = tho.includes('--bia');
const dich = tho.filter((x) => !x.startsWith('--'))[0];

/* ══════════ Không truyền gì → in trạng thái ══════════ */
if (!dich) {
  const cho = quet(NHAP, (n) => DUOI.test(n));
  console.log(`\n  ${mau.dam('Ảnh đang chờ')}  ${mau.mo('_anh/')}`);
  if (!cho.length) {
    console.log(mau.mo('    (trống — quăng ảnh vào thư mục _anh/ rồi chạy lại)\n'));
  } else {
    cho.forEach((f) => {
      const kb = Math.round(fs.statSync(f).size / 1024);
      const kt = kichThuocAnh(f);
      console.log(`    ${path.basename(f).padEnd(34)} ${String(kb).padStart(5)} KB` +
        (kt ? mau.mo(`  ${kt.w}×${kt.h}`) : ''));
    });
    console.log('');
  }

  const bai = quet(POSTS, (n) => n.endsWith('.md') && !n.startsWith('_'));
  console.log(`  ${mau.dam('Bài đang có')}`);
  bai.forEach((f) => {
    const b = timBai(path.basename(f));
    if (!b) return;
    const tm = path.join(MEDIA, b.nam, b.slug);
    const n = fs.existsSync(tm) ? quet(tm, (x) => DUOI.test(x)).length : 0;
    console.log(`    ${b.slug.padEnd(34)} ${mau.mo(n ? n + ' ảnh' : 'chưa có ảnh')}`);
  });
  console.log(`\n  ${mau.mo('chuyển ảnh vào bài:')} npm run anh <slug-bài>`);
  console.log(`  ${mau.mo('kèm đặt ảnh bìa:   ')} npm run anh <slug-bài> --bia\n`);
  process.exit(0);
}

/* ══════════ Có bài đích → chuyển ảnh vào ══════════ */
const bai = timBai(dich);
if (!bai) {
  console.log(mau.do(`\n  ✖ Không tìm thấy bài nào có slug "${dich}"`));
  console.log(mau.mo('    Chạy `npm run anh` không tham số để xem danh sách bài.\n'));
  process.exit(1);
}

const cho = quet(NHAP, (n) => DUOI.test(n));
if (!cho.length) {
  console.log(mau.vang(`\n  ⚠ Thư mục _anh/ đang trống.`));
  console.log(mau.mo('    Quăng ảnh vào đó rồi chạy lại lệnh này.\n'));
  process.exit(0);
}

const thuMuc = path.join(MEDIA, bai.nam, bai.slug);
const duongWeb = `/media/${bai.nam}/${bai.slug}`;
fs.mkdirSync(thuMuc, { recursive: true });

const xong = [];
for (const f of cho) {
  const duoi = path.extname(f).toLowerCase();
  /* Đặt lại tên cho sạch: bỏ dấu, bỏ khoảng trắng, viết thường. Tên file gốc
     hay là "Ảnh chụp Màn hình 2026-09-14 lúc 10.23.45.png" — sang URL là một
     chuỗi %20%C3%A1 dài loằng ngoằng, và vài máy chủ còn từ chối hẳn. */
  let ten = slugify(path.basename(f, duoi)) + duoi;
  let i = 2;
  while (fs.existsSync(path.join(thuMuc, ten))) {
    ten = `${slugify(path.basename(f, duoi))}-${i++}${duoi}`;
  }
  fs.renameSync(f, path.join(thuMuc, ten));

  const kb = Math.round(fs.statSync(path.join(thuMuc, ten)).size / 1024);
  const kt = kichThuocAnh(path.join(thuMuc, ten));
  xong.push({ ten, kb, kt, video: /\.(mp4|webm)$/i.test(ten) });
}

/* Dọn thư mục con rỗng còn lại trong _anh/ */
for (const d of fs.readdirSync(NHAP, { withFileTypes: true })) {
  const p = path.join(NHAP, d.name);
  if (d.isDirectory() && !fs.readdirSync(p).length) fs.rmdirSync(p);
}

console.log(`\n  ${mau.xanh(`✓ Chuyển ${xong.length} file vào`)} ${mau.dam(path.relative(GOC, thuMuc) + '/')}\n`);

const nang = xong.filter((x) => !x.video && x.kb > 400);
if (nang.length) {
  console.log(mau.vang('  ⚠ Ảnh nặng — nên nén xuống dưới 400 KB trước khi đăng:'));
  nang.forEach((x) => console.log(`      ${x.ten}  ${mau.vang(x.kb + ' KB')}`));
  console.log(mau.mo('    Nén nhanh: squoosh.app  ·  hoặc Xem trước trên Mac → Xuất → JPEG 80%\n'));
}

/* ── In sẵn dòng Markdown ── */
console.log(`  ${mau.dam('Dán vào bài:')}\n`);
xong.forEach((x, i) => {
  if (x.video) {
    console.log(mau.tim(`    @video[${duongWeb}/${x.ten}](Chú thích)`));
    return;
  }
  const ngang = x.kt && x.kt.w / x.kt.h > 1.6;
  const lop = ngang ? '{.wide}' : '';
  console.log(mau.tim(`    ![TẢ ẢNH](${duongWeb}/${x.ten} "Chú thích")${lop}`) +
    mau.mo(x.kt ? `   ${x.kt.w}×${x.kt.h} · ${tiLe(x.kt.w, x.kt.h)}` : ''));
});

if (coBia && xong.length) {
  /* Ảnh bìa nên là ảnh NGANG: khung bìa đặt tỉ lệ ~16/9, ảnh vuông hay ảnh dọc
     nhét vào đó bị cắt cụt hai đầu. Nên chọn ảnh ngang đầu tiên, không phải
     file đầu tiên trong thư mục. Không có ảnh ngang nào thì mới lấy tạm cái đầu. */
  const bia = xong.find((x) => !x.video && x.kt && x.kt.w / x.kt.h >= 1.4)
           || xong.find((x) => !x.video);
  if (!bia) { console.log(mau.vang('\n  ⚠ Không có ảnh nào dùng làm bìa được (chỉ có video).')); }
  else {
  const cu = bai.raw.match(/^#?\s*cover:.*$/m);
  const dong = `cover: ${duongWeb}/${bia.ten}`;
  const raw = cu ? bai.raw.replace(cu[0], dong)
                 : bai.raw.replace(/^(date:.*)$/m, `$1\n${dong}\n# coverAlt: `);
  fs.writeFileSync(bai.file, raw);
  console.log(`\n  ${mau.xanh('✓ Đặt làm ảnh bìa')} ${mau.mo(dong)}` +
    mau.mo(`  (${bia.kt.w}×${bia.kt.h})`));
  console.log(mau.mo('    Nhớ điền coverAlt — tả ảnh cho người không nhìn thấy nó.'));
  }
}

console.log(`\n  ${mau.mo('TẢ ẢNH = tả cho người không nhìn thấy. Chú thích = chữ hiện dưới ảnh.')}`);
console.log(`  ${mau.mo('Bỏ {.wide} nếu muốn ảnh thẳng mép với cột chữ.')}\n`);
