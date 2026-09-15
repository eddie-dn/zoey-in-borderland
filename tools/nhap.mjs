/* ============================================================
   npm run nhap -- <file.md ...>     nhập bài cũ vào blog
   npm run nhap -- <thư mục>         nhập cả thư mục

   NHẬP BÀI TỪ BẢN XUẤT WORDPRESS (hoặc bất kỳ .md nào có front matter khác).

   ── VÌ SAO LÀM CÔNG CỤ THAY VÌ SỬA TAY ──────────────────────────────────
   Sửa tay năm bài thì nhanh hơn viết file này. Nhưng bản xuất WordPress
   thường có hàng chục tới hàng trăm bài, và mỗi lần sửa tay là một lần có
   thể gõ nhầm ngày, quên tag, hay đặt sai thư mục chuyên mục. Công cụ làm
   sai thì sai ĐỀU và sửa một chỗ là xong.

   ── NÓ ĐỔI NHỮNG GÌ ─────────────────────────────────────────────────────
   nguồn (WordPress)              →  đích (blog này)
   ──────────────────────────────    ────────────────────────────────────
   date: "2017-04-04 12:43:26"       date: 2017-04-04
   categories: ["Review Sách"]       thư mục content/posts/review-sach/
   status: "publish"                 tag `published`
   (không có)                        updated: <hôm nay>
   # Tiêu đề trùng front matter      bỏ đi — layout đã in tiêu đề rồi
   original_url, source, author      bỏ đi — không dùng tới

   ── KHÔNG ĐỤNG VÀO CHỮ ──────────────────────────────────────────────────
   Thân bài giữ NGUYÊN VĂN, kể cả lỗi chính tả, emoji và giọng văn cũ. Đây là
   bài đã đăng năm 2017; sửa lại là làm giả lịch sử. Chỉ bỏ đúng một thứ: dòng
   `# Tiêu đề` mở đầu, vì bộ dựng đã in tiêu đề từ front matter và để lại thì
   trang có HAI thẻ h1 (bộ kiểm định bắt lỗi này).
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify, ngayISO, tomTat } from './lib/text.mjs';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(GOC, 'content', 'posts');

const mau = {
  do:   (s) => `\x1b[31m${s}\x1b[0m`, vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`, mo:   (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`
};

/* Tên hiển thị cho chuyên mục nhập về. Không có trong bảng thì lấy chính tên
   gốc — thà để tên tiếng Việt còn hơn đoán bừa một cái tên tiếng Anh. */
const TEN_MUC = {
  'tan-man':     { title: 'Musings',   description: 'Mấy thứ nghĩ lan man, chưa xếp được vào đâu.' },
  'review-sach': { title: 'Books',     description: 'Sách đã đọc, và thứ còn lại sau khi gấp sách.' },
  'thuc-duong':  { title: 'Food',      description: 'Ăn uống, thực dưỡng, và chuyện chăm cái thân.' },
  'tarot':       { title: 'Tarot',     description: 'Bài, biểu tượng, và cách người ta tự đọc mình.' }
};

/* Bóc front matter kiểu WordPress. Cố ý viết tay thay vì dùng bộ đọc YAML của
   dự án: bản xuất WordPress bọc mọi giá trị trong dấu nháy kép và dùng mảng
   kiểu JSON, khác hẳn khuôn front matter của blog này. */
function bocFM(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const fm = {};
  for (const dong of m[1].split('\n')) {
    const k = dong.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      try { v = JSON.parse(v); } catch (e) { v = []; }
    } else {
      v = v.replace(/^"(.*)"$/, '$1');
    }
    fm[k[1]] = v;
  }
  return { fm, than: raw.slice(m[0].length) };
}

/* Thoát một chuỗi cho front matter của blog. Dùng nháy kép khi chuỗi có ký tự
   mà bộ đọc YAML-rút-gọn của blog sẽ hiểu nhầm — dấu hai chấm, dấu #, hoặc
   khoảng trắng đầu/cuối. */
function chuoi(s) {
  const t = String(s).trim();
  return /[:#"'\[\]{}]|^\s|\s$/.test(t) ? JSON.stringify(t) : t;
}

function nhapMot(f, homNay) {
  const raw = fs.readFileSync(f, 'utf8');
  const doc = bocFM(raw);
  if (!doc) return { bo: `${path.basename(f)} — không có front matter` };

  const { fm } = doc;
  let than = doc.than;

  if (!fm.title) return { bo: `${path.basename(f)} — không có title` };

  /* Bỏ dòng `# Tiêu đề` mở đầu nếu nó trùng title — để lại thì trang có hai
     thẻ h1 và bộ kiểm định báo lỗi. */
  than = than.replace(/^\s*#\s+(.+?)\s*\n/, (khop, t) =>
    t.trim() === String(fm.title).trim() ? '' : khop).trim();

  const ngay = ngayISO(String(fm.date || '').slice(0, 10));
  const slug = String(fm.slug || slugify(fm.title));
  const mucGoc = Array.isArray(fm.categories) && fm.categories.length
    ? String(fm.categories[0]) : 'Tản Mạn';
  const mucSlug = slugify(mucGoc);

  /* Tag: giữ tag cũ, thêm `published`.

     `published` ở đây là một NHÃN TRẠNG THÁI, không phải chủ đề. Nó nói "bài
     này đã từng đăng ở chỗ khác trước khi về đây" — hữu ích khi về sau kho bài
     có cả bài viết mới lẫn bài nhập lại, và muốn lọc ra một trong hai. */
  const tags = [...new Set([
    ...(Array.isArray(fm.tags) ? fm.tags.map((x) => String(x).trim()) : []),
    'published'
  ])].filter(Boolean);

  /* Tóm tắt: lấy dòng trích dẫn `>` đầu tiên nếu có (bài WordPress hay mở bằng
     một câu dẫn), không thì cắt từ thân bài. */
  const dan = than.match(/^>\s*(.+?)(?:\n(?!>)|$)/m);
  const tom = dan ? dan[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim()
                  : tomTat(than.replace(/[#>*_`\[\]()]/g, ''), 180);

  /* Bỏ khối trích dẫn MỞ ĐẦU sau khi đã lấy nó làm tóm tắt.
     Bản xuất WordPress hay mở bài bằng một câu dẫn trong khối `>`. Ở blog này
     câu dẫn đã có ô riêng ngay dưới tiêu đề, nên giữ cả hai nghĩa là người đọc
     gặp đúng một đoạn chữ hai lần, cách nhau chưa tới một màn. */
  if (dan && than.startsWith('>')) {
    const dong = than.split('\n');
    let k = 0;
    while (k < dong.length && (dong[k].startsWith('>') ||
           (k > 0 && !dong[k].trim() && (dong[k + 1] || '').startsWith('>')))) k++;
    than = dong.slice(k).join('\n').replace(/^\n+/, '');
  }

  const thuMuc = path.join(POSTS, mucSlug);
  const dich = path.join(thuMuc, `${ngay}-${slug}.md`);
  if (fs.existsSync(dich)) return { bo: `${path.basename(dich)} — đã có, bỏ qua` };

  const ra = [
    '---',
    `title: ${chuoi(fm.title)}`,
    `date: ${ngay}`,
    /* `updated` = ngày đưa về blog này. Bài viết năm 2017 nhưng bản đang đọc
       được dựng lại hôm nay — layout in cả hai ngày. */
    `updated: ${homNay}`,
    `summary: ${chuoi(tomTat(tom, 200))}`,
    'tags:',
    ...tags.map((t) => `  - ${t}`),
    '---',
    '',
    than,
    ''
  ].join('\n');

  fs.mkdirSync(thuMuc, { recursive: true });
  fs.writeFileSync(dich, ra);

  /* Chuyên mục chưa có tên hiển thị thì lập luôn `_muc.json`. */
  const fMuc = path.join(thuMuc, '_muc.json');
  if (!fs.existsSync(fMuc)) {
    const info = TEN_MUC[mucSlug] || { title: mucGoc, description: '' };
    fs.writeFileSync(fMuc, JSON.stringify(info, null, 2) + '\n');
  }

  return { ok: path.relative(GOC, dich), muc: mucSlug, tags: tags.length };
}

/* ══════════ CHẠY ══════════ */
const CO = process.argv.slice(2).filter((x) => !x.startsWith('--'));
if (!CO.length) {
  console.log(mau.dam('\n  NHẬP BÀI CŨ\n'));
  console.log('    npm run nhap -- bai-1.md bai-2.md');
  console.log('    npm run nhap -- ~/wordpress-export/\n');
  process.exit(0);
}

const ds = [];
for (const x of CO) {
  if (!fs.existsSync(x)) { console.log(mau.do(`  không thấy: ${x}`)); continue; }
  if (fs.statSync(x).isDirectory()) {
    for (const f of fs.readdirSync(x)) if (f.endsWith('.md')) ds.push(path.join(x, f));
  } else ds.push(x);
}

const homNay = ngayISO(new Date().toISOString().slice(0, 10));
console.log(mau.dam('\n  NHẬP BÀI CŨ\n'));
let so = 0;
for (const f of ds.sort()) {
  const kq = nhapMot(f, homNay);
  if (kq.bo) { console.log(`  ${mau.vang('bỏ qua')}  ${mau.mo(kq.bo)}`); continue; }
  so++;
  console.log(`  ${mau.xanh('✓')}  ${kq.ok}  ${mau.mo(`· ${kq.tags} tag`)}`);
}
console.log(so ? mau.xanh(`\n  Xong ${so} bài.`) + mau.mo('  Chạy `npm run bia -- --tat-ca` để sinh ảnh bìa.\n')
               : mau.mo('\n  Không nhập bài nào.\n'));
