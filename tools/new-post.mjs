#!/usr/bin/env node
/* ============================================================
   NEW-POST — dựng sẵn một bài mới đúng chỗ, đúng khung.

   Chạy:
     npm run new "Tên bài viết"
     npm run new "Tên bài viết" tam-ly
     npm run new "Tên bài viết" doi-thuong/ha-noi
     npm run new "Tên bài" tam-ly --tags "jung, ghi chép"

   Việc nó làm, ngoài tạo file .md:
     · đặt tên file theo dạng YYYY-MM-DD-slug để thư mục tự sắp theo ngày
     · tạo luôn thư mục ảnh public/media/<năm>/<slug>/ cho bài đó
     · điền sẵn `date` là hôm nay, khỏi phải gõ tay rồi gõ nhầm
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/text.mjs';

const GOC   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(GOC, 'content', 'posts');
const MEDIA = path.join(GOC, 'public', 'media');

const mau = {
  do: (s) => `\x1b[31m${s}\x1b[0m`, xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo: (s) => `\x1b[2m${s}\x1b[0m`,  dam:  (s) => `\x1b[1m${s}\x1b[0m`
};

/* ── đọc tham số ── */
const tho = process.argv.slice(2);
const co  = {};
const tuDo = [];
for (let i = 0; i < tho.length; i++) {
  if (tho[i].startsWith('--')) { co[tho[i].slice(2)] = tho[i + 1] || ''; i++; }
  else tuDo.push(tho[i]);
}
const tieuDe = tuDo[0];
const thuMuc = (tuDo[1] || co.muc || '').replace(/^\/+|\/+$/g, '');

if (!tieuDe) {
  console.log(`
  ${mau.dam('Tạo bài mới')}

    npm run new "Tên bài viết"
    npm run new "Tên bài viết" ${mau.mo('<chuyên-mục>')}
    npm run new "Tên bài viết" ${mau.mo('<chuyên-mục>/<chuyên-mục-con>')}

  ${mau.dam('Tuỳ chọn')}
    --tags "jung, ghi chép"     gắn tag sẵn
    --slug ten-khac             đặt slug khác với tiêu đề

  ${mau.dam('Chuyên mục đang có')}
${đangCo().map((x) => '    · ' + x).join('\n') || mau.mo('    (chưa có chuyên mục nào — gõ tên mới là nó tự tạo)')}
`);
  process.exit(1);
}

function đangCo(goc = POSTS, tien = '') {
  if (!fs.existsSync(goc)) return [];
  const ra = [];
  for (const m of fs.readdirSync(goc, { withFileTypes: true })) {
    if (!m.isDirectory() || m.name.startsWith('_') || m.name.startsWith('.')) continue;
    const p = tien ? `${tien}/${m.name}` : m.name;
    ra.push(p, ...đangCo(path.join(goc, m.name), p));
  }
  return ra;
}

const slug = slugify(co.slug || tieuDe);
const d    = new Date();
const p2   = (n) => String(n).padStart(2, '0');
const ngay = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

const thuMucBai = path.join(POSTS, ...thuMuc.split('/').filter(Boolean));
const fileBai   = path.join(thuMucBai, `${ngay}-${slug}.md`);
const thuMucAnh = path.join(MEDIA, String(d.getFullYear()), slug);
const duongAnh  = `/media/${d.getFullYear()}/${slug}`;

if (fs.existsSync(fileBai)) {
  console.log(mau.do(`\n  ✖ File đã tồn tại: ${path.relative(GOC, fileBai)}`));
  console.log(mau.mo('    Đổi tiêu đề, hoặc đặt slug khác bằng --slug ten-khac\n'));
  process.exit(1);
}

const tags = (co.tags || '').split(',').map((s) => s.trim()).filter(Boolean);

const noiDung = `---
title: ${tieuDe}
date: ${ngay}
summary:
tags: [${tags.join(', ')}]
# cover: ${duongAnh}/bia.jpg
# coverAlt:
draft: true
---

Đoạn đầu tiên tự thành sapo — chữ to hơn, màu nhạt hơn. Viết 2–3 câu gói trọn
ý bài.

## Mục đầu tiên

Nội dung ở đây.

<!-- Ảnh của bài để trong ${duongAnh}/ rồi chèn bằng:
     ![tả ảnh](${duongAnh}/ten-anh.jpg "Chú thích"){.wide}
     Bảng đầy đủ các khối viết được: docs/HUONG-DAN-DANG-BAI.md -->
`;

fs.mkdirSync(thuMucBai, { recursive: true });
fs.writeFileSync(fileBai, noiDung);
fs.mkdirSync(thuMucAnh, { recursive: true });
/* .gitkeep để thư mục ảnh rỗng vẫn theo git — git không theo dõi thư mục rỗng,
   nên không có file này thì người khác clone về là mất luôn thư mục. */
fs.writeFileSync(path.join(thuMucAnh, '.gitkeep'), '');

const url = `/posts/${[...thuMuc.split('/').filter(Boolean).map(slugify), slug].join('/')}/`;

console.log(`
  ${mau.xanh('✓ Đã tạo bài mới')}

    bài    ${mau.dam(path.relative(GOC, fileBai))}
    ảnh    ${mau.mo(path.relative(GOC, thuMucAnh) + '/')}
    URL    ${mau.mo(url)}

  ${mau.dam('Tiếp theo')}
    1. Điền ${mau.dam('summary')} và ${mau.dam('tags')} — hai thứ hay quên nhất
    2. Viết bài
    3. ${mau.dam('npm run dev')}    xem thử tại chỗ
    4. Bỏ dòng ${mau.dam('draft: true')} khi muốn đăng thật
    5. ${mau.dam('npm run check')}  kiểm lại trước khi commit
`);
