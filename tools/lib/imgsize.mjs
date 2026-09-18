/* ============================================================
   IMGSIZE — đọc bề ngang × bề cao của ảnh, chỉ từ vài chục byte đầu file.

   VÌ SAO PHẢI CÓ. Ảnh không khai sẵn tỉ lệ thì lúc chưa tải xong nó cao 0px;
   tải xong bật ra chiều cao thật, đẩy toàn bộ chữ phía dưới nhảy xuống. Người
   đang đọc mất dòng. Trên 4G yếu thì nhảy liên tục suốt bài.

   Cách chữa: build đọc kích thước thật rồi ghi aspect-ratio vào CSS. Trình duyệt
   chừa sẵn đúng chỗ, ảnh về là lấp vào, không có gì nhúc nhích.

   Không dùng gói ngoài: mỗi định dạng chỉ cần đọc đúng phần đầu file.
   ============================================================ */
import { readFileSync } from 'node:fs';

export function kichThuocAnh(duongDanThat){
  let b;
  try{ b = readFileSync(duongDanThat); }catch{ return null; }
  if(b.length < 24) return null;

  /* ── PNG ── 8 byte chữ ký, rồi chunk IHDR: dài(4) + "IHDR"(4) + W(4) + H(4) */
  if(b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG'){
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }

  /* ── GIF ── "GIF87a"/"GIF89a" rồi W,H kiểu little-endian 2 byte */
  if(b.toString('latin1', 0, 3) === 'GIF'){
    return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  }

  /* ── JPEG ── phải đi lần theo từng segment tới khi gặp khung SOF.
     Không có chỗ cố định nào chứa kích thước như PNG. */
  if(b[0] === 0xFF && b[1] === 0xD8){
    let i = 2;
    while(i < b.length - 9){
      if(b[i] !== 0xFF){ i++; continue; }          /* trôi tới byte đánh dấu kế */
      const mark = b[i + 1];
      /* SOF0–SOF15 là các khung chứa kích thước, TRỪ C4 (bảng Huffman),
         C8 (mở rộng JPEG) và CC (bảng số học) — ba cái này trùng dải nhưng
         không phải SOF, đọc nhầm thì ra kích thước rác. */
      if(mark >= 0xC0 && mark <= 0xCF && mark !== 0xC4 && mark !== 0xC8 && mark !== 0xCC){
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      }
      if(mark === 0xD8 || mark === 0x01 || (mark >= 0xD0 && mark <= 0xD7)){ i += 2; continue; }
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  }

  /* ── WebP ── ba biến thể, mỗi biến thể một cách ghi khác nhau */
  if(b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP'){
    const loai = b.toString('latin1', 12, 16);
    if(loai === 'VP8 ')  return { w: b.readUInt16LE(26) & 0x3FFF, h: b.readUInt16LE(28) & 0x3FFF };
    if(loai === 'VP8L'){                      /* 14 bit mỗi chiều, nhồi vào 4 byte */
      const n = b.readUInt32LE(21);
      return { w: (n & 0x3FFF) + 1, h: ((n >> 14) & 0x3FFF) + 1 };
    }
    if(loai === 'VP8X')  return {             /* 24 bit mỗi chiều, little-endian */
      w: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
      h: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1
    };
    return null;
  }

  /* ── SVG ── là chữ, đọc viewBox trước (đáng tin hơn width/height vì
     width có thể ghi theo % hoặc em) */
  const dau = b.toString('utf8', 0, Math.min(b.length, 1024));
  if(dau.includes('<svg')){
    const vb = dau.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if(vb) return { w: +vb[1], h: +vb[2] };
    const w = dau.match(/\bwidth\s*=\s*["']([\d.]+)/i);
    const h = dau.match(/\bheight\s*=\s*["']([\d.]+)/i);
    if(w && h) return { w: +w[1], h: +h[1] };
  }
  return null;
}

/* Rút gọn tỉ lệ cho gọn mắt khi soi CSS: 1600×900 → "16 / 9" chứ không phải
   "1600 / 900". Trình duyệt hiểu như nhau, nhưng người đọc code thì khác. */
/* `tiLe` dọn sang `text.mjs` — nó là phép toán thuần, không đụng đĩa, mà
   `markdown.mjs` cần nó và phải chạy được cả trong trình duyệt. Xuất lại ở đây
   để mấy chỗ gọi cũ (`anh.mjs`, `build.mjs`) không phải sửa. */
export { tiLe } from './text.mjs';
