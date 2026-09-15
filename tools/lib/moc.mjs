/* ============================================================
   MỐC — nhớ lần cuối mỗi bài thật sự đổi nội dung.

   ── VÌ SAO KHÔNG DÙNG NGÀY SỬA FILE ────────────────────────────────────
   `fs.statSync().mtime` là thứ đầu tiên ai cũng nghĩ tới, và nó SAI ở đây:
   git không giữ ngày sửa file. Cloudflare Pages clone lại repo từ đầu mỗi
   lần dựng, nên mọi file đều mang ngày clone — tức là MỌI BÀI đều "vừa cập
   nhật xong", kể cả bài năm 2017.

   ── VÌ SAO KHÔNG DÙNG `git log` ────────────────────────────────────────
   Đúng hơn nhiều, nhưng buộc bản dựng phải có đủ lịch sử git. Cloudflare
   Pages clone nông, và ai tải repo dạng .zip thì không có git nào cả. Một
   bộ dựng không được phép sập chỉ vì thiếu git.

   ── CÁCH LÀM Ở ĐÂY ─────────────────────────────────────────────────────
   Một cuốn sổ nhỏ, `content/.moc.json`, ghi cho mỗi bài:

       "posts/tan-man/2017-04-04-x.md": { bam: "<vân tay>", moc: "<ISO>" }

   Mỗi lần dựng, tính lại vân tay của TIÊU ĐỀ + THÂN BÀI. Khác vân tay cũ
   nghĩa là nội dung thật sự đổi → ghi mốc mới. Giống thì giữ nguyên mốc cũ,
   dù file có bị chạm vào bao nhiêu lần.

   Vân tay CỐ Ý không tính cả front matter: sửa một cái tag hay thêm dòng
   `cover:` không phải là sửa bài. Nếu tính cả thì mỗi lần chạy `npm run bia`
   là mọi bài đều thành "vừa cập nhật".

   Sổ này PHẢI ĐƯỢC COMMIT. Không có nó thì lần dựng sau coi mọi bài là mới
   và mốc mất sạch.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const TEN = '.moc.json';

export function duongDanMoc(goc) {
  return path.join(goc, 'content', TEN);
}

export function vanTay(title, than) {
  return createHash('sha1').update(String(title) + '\n' + String(than)).digest('hex').slice(0, 16);
}

export function docMoc(goc) {
  const f = duongDanMoc(goc);
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')) || {}; } catch (e) { return {}; }
}

/* `ds` là mảng { khoa, bam, ngay } — khoa là đường dẫn tương đối từ content/,
   ngay là ngày đăng (dùng làm mốc đầu cho bài mới).

   Trả về { moc: {khoa: ISO}, doi: [khoa…] } và GHI LẠI sổ nếu có thay đổi.
   Chỉ ghi khi thật sự khác: ghi lại y nguyên thì file đổi dấu thời gian và
   git báo có thay đổi ở mỗi lần dựng. */
export function capNhatMoc(goc, ds) {
  const cu = docMoc(goc);
  const moi = {};
  const doi = [];
  const bayGio = new Date().toISOString();

  for (const x of ds) {
    const truoc = cu[x.khoa];
    if (!truoc) {
      /* Bài mới: mốc = chính ngày đăng, không phải bây giờ. Lấy bây giờ thì
         bài vừa viết xong đã mang nhãn "vừa cập nhật" so với ngày đăng của
         chính nó — vô nghĩa. */
      moi[x.khoa] = { bam: x.bam, moc: x.ngay };
    } else if (truoc.bam !== x.bam) {
      moi[x.khoa] = { bam: x.bam, moc: bayGio };
      doi.push(x.khoa);
    } else {
      moi[x.khoa] = { bam: truoc.bam, moc: truoc.moc };
    }
  }

  /* Sắp khoá bằng cách DỰNG LẠI object theo thứ tự, không truyền mảng khoá làm
     tham số thứ hai của JSON.stringify. Tham số ấy là REPLACER: nó lọc khoá ở
     MỌI tầng, nên mảng tên file sẽ xoá sạch `bam` và `moc` bên trong và ghi ra
     một sổ toàn object rỗng. Không lỗi nào cả — chỉ là lần dựng sau đọc vào
     thấy rỗng và coi mọi bài là vừa sửa. */
  const sapXep = (o) => {
    const r = {};
    for (const k of Object.keys(o).sort()) r[k] = o[k];
    return r;
  };
  const raCu = JSON.stringify(sapXep(cu), null, 2);
  const raMoi = JSON.stringify(sapXep(moi), null, 2);
  if (raCu !== raMoi) fs.writeFileSync(duongDanMoc(goc), raMoi + '\n');

  const moc = {};
  for (const k of Object.keys(moi)) moc[k] = moi[k].moc;
  return { moc, doi };
}
