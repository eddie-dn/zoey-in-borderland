/**
 * tools/lib/doc-nguon.mjs — BỘ ĐỌC `content/quote-nguon.md`.
 *
 * ┌─ CHỈ CHẠY LÚC BUILD, KHÔNG BAO GIỜ CHẠY TRÊN MẠNG ─────────────────────┐
 * │ File này đọc đĩa bằng `fs`. Trên Cloudflare Workers KHÔNG CÓ ĐĨA —      │
 * │ không có `fs`, không có `process.cwd()`, không có thư mục nào để đọc.   │
 * │ Nên nó nằm ở `tools/`, chạy đúng một lần lúc dựng trang, rồi:           │
 * │                                                                        │
 * │   · `tools/build.mjs`  lấy `### Câu sẵn` nhúng thẳng vào HTML           │
 * │   · `tools/build.mjs`  NƯỚNG cả gói ra `functions/api/_nguon.js`        │
 * │                        cho hàm Cloudflare `import` vào lúc chạy         │
 * │                                                                        │
 * │ Vẫn là MỘT bộ đọc, MỘT file nguồn. Hàm trên mạng không đọc lại file .md │
 * │ mà dùng bản đã nướng, nên hai bên không thể lệch nhau.                  │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * (Bản trước để file này ở `api/_lib/` và cho hàm serverless tự `readFileSync`
 * lúc chạy — làm được trên Vercel vì hàm ở đó là một tiến trình Node thật.
 * Chuyển sang Cloudflare thì cách đó chết hẳn: Workers không phải Node.)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ESM không có sẵn __dirname — dựng lại từ import.meta.url. */
const THU_MUC_NAY = path.dirname(fileURLToPath(import.meta.url));

/* ── TÌM FILE ──
   Chạy lúc build nên đơn giản: thử vài chỗ, lấy chỗ nào có thật. Không cần
   mánh gì cả — đây là một tiến trình Node bình thường trên máy dựng trang.

   (Bản trước hàm này phải lo chuyện Vercel gói file .md theo hàm serverless
   thế nào. Chuyển sang Cloudflare thì mối lo đó biến mất luôn, vì hàm không
   còn đọc file nữa — nó nhận bản đã nướng sẵn.) */
function timFile(goc) {
  const thu = [];
  if (goc) thu.push(path.join(goc, 'content', 'quote-nguon.md'));
  thu.push(path.join(THU_MUC_NAY, '..', '..', 'content', 'quote-nguon.md'));
  thu.push(path.join(process.cwd(), 'content', 'quote-nguon.md'));
  for (const f of thu) { try { if (fs.existsSync(f)) return f; } catch (e) {} }
  return null;
}

/* ── BÓC FILE ──
   Luật đọc cố ý DỄ TÍNH, chỉ bám vào bốn dòng `###`. Chữ nghĩa xung quanh gõ
   kiểu gì cũng được.

   CHỈ nhận dấu `-` làm gạch đầu dòng, KHÔNG nhận `*`. Bản gốc bên
   dongchibinh-33 nhận cả hai và đã vấp: một dòng tiêu đề in đậm `**Tự biết
   mình**` bị đọc thành một câu trích dẫn. Bỏ `*` đi thì viết đậm ở đâu trong
   file cũng an toàn. */
export function boc(src) {
  const ra = { chuDe: [], nguon: [], nhac: '', san: [] };

  /* Bỏ mọi dòng `>` (ghi chú cho người đọc file) và mọi dòng `#` */
  const sach = (s) => s.replace(/^>.*$/gm, '');
  const gach = (s) => s.split('\n')
    .map((d) => (d.match(/^[ \t]*-[ \t]+(.*)$/) || [])[1])
    .filter((d) => d && d.trim())
    .map((d) => d.trim());

  for (const muc of sach(src).split(/^###[ \t]+/m).slice(1)) {
    const dau = (muc.split('\n')[0] || '').trim().toLowerCase();
    const noi = muc.slice(muc.indexOf('\n') + 1);

    if (dau.indexOf('chủ đề') === 0 || dau.indexOf('chu de') === 0) {
      ra.chuDe = gach(noi).map((d) => {
        const i = d.indexOf('·');
        return i < 0 ? { ten: d, ta: '' }
                     : { ten: d.slice(0, i).trim(), ta: d.slice(i + 1).trim() };
      });
    } else if (dau.indexOf('nguồn') === 0 || dau.indexOf('nguon') === 0) {
      ra.nguon = gach(noi);
    } else if (dau.indexOf('lời dặn') === 0 || dau.indexOf('loi dan') === 0) {
      /* Giữ nguyên xuống dòng: lời dặn có bố cục đoạn, ép về một dòng thì
         mấy luật dính vào nhau và Gemini đọc kém hẳn. Chỉ cắt khoảng trắng
         thừa ở hai đầu và gộp ba dòng trống thành một. */
      ra.nhac = noi.replace(/\n{3,}/g, '\n\n').trim();
    } else if (dau.indexOf('câu sẵn') === 0 || dau.indexOf('cau san') === 0) {
      ra.san = gach(noi).map(tachTacGia).filter((q) => q.chu);
    }
  }
  return ra;
}

/* Tách tên tác giả ở dấu — CUỐI CÙNG. Tách ở dấu đầu tiên thì câu nào có em
   dash giữa chừng bị cụt mất nửa sau. */
export function tachTacGia(cau) {
  const i = cau.lastIndexOf('—');
  if (i < 0) return { chu: cau.trim(), ai: '' };
  return { chu: cau.slice(0, i).trim(), ai: cau.slice(i + 1).trim() };
}

/* Dự phòng CỐ Ý NGẮN — chỉ đủ để ô trích dẫn không bao giờ trống nếu vì lý do
   gì đó không đọc được file .md. KHÔNG chép lại cả kho vào đây: hai bản song
   song thì kiểu gì cũng lệch, rồi có ngày chạy nhầm bản cũ mà không ai biết. */
const DU_PHONG = {
  chuDe: [{ ten: 'Tự biết mình', ta: '' }],
  nguon: ['Carl Jung', 'Marcus Aurelius', 'Lão Tử'],
  nhac: '',
  san: [{ chu: 'Ai nhìn ra ngoài thì mơ, ai nhìn vào trong mới thật sự tỉnh ra', ai: 'Carl Jung' }]
};

export function docNguon(goc) {
  const f = timFile(goc);
  if (!f) return Object.assign({ thieuFile: true }, DU_PHONG);
  try {
    const kq = boc(fs.readFileSync(f, 'utf8'));
    /* Mục nào trống thì lấy dự phòng cho mục ĐÓ THÔI, không vứt cả file. Sửa
       hỏng một mục thì ba mục kia vẫn chạy. */
    if (!kq.san.length)   kq.san   = DU_PHONG.san;
    if (!kq.chuDe.length) kq.chuDe = DU_PHONG.chuDe;
    if (!kq.nguon.length) kq.nguon = DU_PHONG.nguon;
    return kq;
  } catch (e) {
    return Object.assign({ loi: String(e.message || e) }, DU_PHONG);
  }
}
