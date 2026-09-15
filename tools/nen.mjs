/* ============================================================
   npm run nen            xem file nào nén lại được, không sửa gì
   npm run nen -- --lam   nén thật, ghi đè

   NÉN LẠI PNG MÀ KHÔNG MẤT MỘT PIXEL NÀO.

   ── LÀM GÌ ──────────────────────────────────────────────────────────────
   PNG cho phép mỗi DÒNG chọn một cách "lọc": thay vì ghi giá trị pixel, ghi
   HIỆU so với pixel bên trái (Sub), bên trên (Up), trung bình (Average), hay
   Paeth. Ảnh nào cũng có một kiểu hợp nhất, và thường khác nhau theo từng dòng.

   Rất nhiều công cụ xuất ảnh ghi filter 0 (None) cho mọi dòng cho nhanh. Ảnh
   vẫn đúng, chỉ là to gấp hai ba lần mức cần thiết. File này đọc ảnh ra, thử
   cả năm kiểu lọc cho TỪNG DÒNG, giữ kiểu cho ra ít byte nhất, rồi nén lại.

   Pixel không đổi một chút nào — đây là nén KHÔNG MẤT DỮ LIỆU. Ảnh sau vẫn
   giống hệt ảnh trước, chỉ nhẹ hơn.

   ── VÌ SAO KHÔNG DÙNG pngquant / oxipng ─────────────────────────────────
   Cả dự án này không có dependency nào, và đó là chủ ý: người clone về chỉ cần
   Node là chạy được, không phải cài thêm gì, không lo một gói nào đó hỏng sau
   một năm. `zlib` nằm sẵn trong Node nên việc này làm được bằng tay.

   Đổi lại: không giảm số màu (pngquant làm được, nhưng đó là nén CÓ MẤT), và
   không tối ưu tới mức cuối cùng như oxipng. Với ảnh của một cái blog thì phần
   chênh còn lại không đáng để đánh đổi.

   ── KHÔNG ĐỤNG TỚI ──────────────────────────────────────────────────────
   Ảnh JPEG, WebP, GIF, SVG: bỏ qua hết, chúng nén theo cách khác.
   PNG có bảng màu (palette) hay có kênh trong suốt cũng bỏ qua — bộ đọc ở đây
   chỉ làm đúng loại truecolour RGB 8-bit, và thà bỏ qua còn hơn làm hỏng.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(GOC, 'public');

const mau = {
  vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo:   (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`
};

function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  let r = 0xFFFFFFFF;
  for (const b of buf) r = t[(r ^ b) & 0xFF] ^ (r >>> 8);
  return (r ^ 0xFFFFFFFF) >>> 0;
}
function khoi(ten, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const than = Buffer.concat([Buffer.from(ten, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(than));
  return Buffer.concat([len, than, crc]);
}

/* Bóc một file PNG thành { W, H, dong[] } — mỗi dòng là mảng byte đã BỎ filter,
   tức là giá trị pixel thật. Trả null nếu không phải loại làm được. */
function doc(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504E47) return null;
  let i = 8, ihdr = null, idat = [];
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const ten = buf.slice(i + 4, i + 8).toString('ascii');
    if (ten === 'IHDR') ihdr = buf.slice(i + 8, i + 8 + len);
    else if (ten === 'IDAT') idat.push(buf.slice(i + 8, i + 8 + len));
    else if (ten === 'IEND') break;
    i += 12 + len;
  }
  if (!ihdr || !idat.length) return null;

  const W = ihdr.readUInt32BE(0), H = ihdr.readUInt32BE(4);
  const sau = ihdr[8], loai = ihdr[9], xen = ihdr[12];
  /* Chỉ nhận truecolour RGB 8-bit, không xen kẽ (interlace). Mấy loại kia đọc
     được nhưng mỗi loại một kiểu byte-per-pixel; làm sai là ảnh nát. */
  if (sau !== 8 || loai !== 2 || xen !== 0) return null;

  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { return null; }
  const bpp = 3, buoc = W * bpp;
  if (raw.length !== H * (1 + buoc)) return null;

  /* Bỏ filter để lấy pixel thật. Phải làm tuần tự vì mỗi dòng tham chiếu dòng
     trên đã bỏ filter xong. */
  const px = Buffer.alloc(H * buoc);
  for (let y = 0; y < H; y++) {
    const kieu = raw[y * (1 + buoc)];
    const vao = y * (1 + buoc) + 1, ra = y * buoc, tren = (y - 1) * buoc;
    for (let k = 0; k < buoc; k++) {
      const x = raw[vao + k];
      const a = k >= bpp ? px[ra + k - bpp] : 0;
      const b = y > 0 ? px[tren + k] : 0;
      const c = (k >= bpp && y > 0) ? px[tren + k - bpp] : 0;
      let v;
      if (kieu === 0) v = x;
      else if (kieu === 1) v = x + a;
      else if (kieu === 2) v = x + b;
      else if (kieu === 3) v = x + ((a + b) >> 1);
      else if (kieu === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else return null;
      px[ra + k] = v & 0xFF;
    }
  }
  return { W, H, px, ihdr };
}

/* Lọc lại: thử cả năm kiểu cho TỪNG DÒNG, giữ kiểu có tổng |hiệu| nhỏ nhất.
   Đây là phép chọn chuẩn mà libpng vẫn dùng — tổng trị tuyệt đối nhỏ thì dãy
   số nằm sát 0, và dãy sát 0 thì zlib nén tốt. */
function locLai({ W, H, px }) {
  const bpp = 3, buoc = W * bpp;
  const ra = Buffer.alloc(H * (1 + buoc));
  const thu = Buffer.alloc(buoc);
  for (let y = 0; y < H; y++) {
    const vao = y * buoc, tren = (y - 1) * buoc;
    let kieuTot = 0, diemTot = Infinity, dongTot = null;
    for (let kieu = 0; kieu <= 4; kieu++) {
      let diem = 0;
      for (let k = 0; k < buoc; k++) {
        const x = px[vao + k];
        const a = k >= bpp ? px[vao + k - bpp] : 0;
        const b = y > 0 ? px[tren + k] : 0;
        const c = (k >= bpp && y > 0) ? px[tren + k - bpp] : 0;
        let v;
        if (kieu === 0) v = x;
        else if (kieu === 1) v = x - a;
        else if (kieu === 2) v = x - b;
        else if (kieu === 3) v = x - ((a + b) >> 1);
        else { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
               v = x - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
        v &= 0xFF;
        thu[k] = v;
        /* Byte được coi là số có dấu: 200 nghĩa là −56, gần 0 hơn nhiều so với
           đọc thẳng là 200. Không đổi dấu thì phép chọn gần như luôn ra None. */
        diem += v < 128 ? v : 256 - v;
      }
      if (diem < diemTot) { diemTot = diem; kieuTot = kieu; dongTot = Buffer.from(thu); }
    }
    ra[y * (1 + buoc)] = kieuTot;
    dongTot.copy(ra, y * (1 + buoc) + 1);
  }
  return ra;
}

function nen(buf) {
  const a = doc(buf);
  if (!a) return null;
  const moi = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    khoi('IHDR', a.ihdr),
    khoi('IDAT', zlib.deflateSync(locLai(a), { level: 9 })),
    khoi('IEND', Buffer.alloc(0))
  ]);
  /* Chỉ nhận nếu THẬT SỰ nhỏ hơn. Ảnh nào đã tối ưu sẵn thì để yên — ghi đè
     bằng một bản to hơn là đi lùi. */
  return moi.length < buf.length ? moi : null;
}

/* ══════════ CHẠY ══════════ */
const LAM = process.argv.includes('--lam');
const ds = [];
(function di(d) {
  if (!fs.existsSync(d)) return;
  for (const x of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, x.name);
    if (x.isDirectory()) di(f);
    else if (x.name.toLowerCase().endsWith('.png')) ds.push(f);
  }
})(PUBLIC);

console.log(mau.dam('\n  NÉN LẠI PNG' + (LAM ? '' : mau.mo('  — chỉ xem, thêm --lam để ghi thật')) + '\n'));

let cu = 0, moi = 0, so = 0, boQua = 0;
for (const f of ds) {
  const buf = fs.readFileSync(f);
  const ra = nen(buf);
  const ten = path.relative(PUBLIC, f);
  cu += buf.length;
  if (!ra) {
    moi += buf.length; boQua++;
    console.log(`  ${mau.mo('bỏ qua')}  ${mau.mo(ten.padEnd(42))} ${(buf.length / 1024).toFixed(0)}KB`);
    continue;
  }
  moi += ra.length; so++;
  const phan = Math.round(100 - ra.length / buf.length * 100);
  console.log(`  ${mau.xanh('✓')}  ${ten.padEnd(42)} ` +
              `${(buf.length / 1024).toFixed(0)}KB → ${mau.xanh((ra.length / 1024).toFixed(0) + 'KB')} ` +
              mau.mo(`(−${phan}%)`));
  if (LAM) fs.writeFileSync(f, ra);
}

if (!ds.length) { console.log(mau.mo('  Không có file .png nào trong public/.\n')); process.exit(0); }
console.log('');
console.log(`  ${(cu / 1024).toFixed(0)}KB → ${(moi / 1024).toFixed(0)}KB ` +
            mau.xanh(`(−${Math.round(100 - moi / cu * 100)}%)`) +
            mau.mo(`   ${so} file nén được · ${boQua} file đã tối ưu sẵn`));
console.log(LAM ? mau.xanh('  Đã ghi.\n') : mau.vang('  Chưa ghi gì — chạy lại với --lam.\n'));
