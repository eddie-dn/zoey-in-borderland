/* ============================================================
   npm run bia -- <slug>        sinh ảnh bìa cho một bài
   npm run bia -- --tat-ca      sinh cho mọi bài chưa có bìa

   ── VÌ SAO SINH ẢNH CHỨ KHÔNG ĐI TÌM ẢNH ────────────────────────────────
   "Tự tìm ảnh đại diện" nghe thì hợp lý, nhưng tải ảnh từ Unsplash hay Google
   về đặt lên blog là chuyện khác hẳn: mỗi tấm một giấy phép, nhiều tấm bắt ghi
   nguồn, và tấm nào cũng mang một tông màu riêng — mười bài là mười phong cách
   đá nhau. Blog này có một bảng màu chặt; ảnh lạ phá nó ngay.

   Nên: SINH ảnh từ chính tên bài. Được ba thứ cùng lúc —

     · không vướng bản quyền, vì không lấy của ai cả
     · luôn đúng bảng màu, vì màu lấy thẳng từ tokens.css
     · TẤT ĐỊNH: cùng một tên bài luôn ra cùng một tấm. Dựng lại trang hay đổi
       máy cũng không đổi ảnh, nên không có chuyện hôm nay một kiểu mai một kiểu.

   Bố cục thì đổi theo tên bài (góc nghiêng, vị trí vầng sáng, cặp màu), nên
   mỗi bài một hình riêng mà vẫn cùng một họ.

   ── KHÔNG DÙNG THƯ VIỆN NÀO ─────────────────────────────────────────────
   Tự ghi PNG: IHDR + IDAT nén bằng zlib + IEND. `zlib` nằm sẵn trong Node.
   Thêm một dependency chỉ để vẽ mấy vệt màu thì không đáng — cả dự án này
   không có dependency nào, và đó là chủ ý.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/text.mjs';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(GOC, 'content', 'posts');
const PUBLIC = path.join(GOC, 'public');

/* 1200×675 — tỉ lệ 16:9.

   Đời đầu để 1600×900. Thừa: cột chữ trong bài rộng khoảng 700px, thẻ bài ở
   lưới danh sách rộng nhất cũng chỉ ~1100px, và ảnh chia sẻ chuẩn của Facebook
   là 1200×630. Không chỗ nào cần tới 1600. Riêng việc hạ xuống 1200 đã cắt
   gần một nửa dung lượng mà không ai nhìn thấy khác biệt.

   Màn hình 2× thì trình duyệt phóng 1200 lên — với một tấm gradient mềm thì
   không thấy vỡ, khác hẳn ảnh chụp có chi tiết nhỏ. */
/* ── KHỔ ẢNH ──
   Mặc định 1200×675 (16:9) cho ảnh BÌA: đó là khổ thẻ chia sẻ của Facebook,
   X và LinkedIn.

   Cờ `--doc` đổi sang 1080×1350, tức 4:5 — khổ ảnh DỌC của Instagram và
   Facebook, và cũng là khổ hẹp nhất hai nơi ấy nhận trước khi tự cắt. Dùng
   cho ảnh trong băng ảnh của khung C, nơi khung lấy tỉ lệ theo tấm đầu tiên.
   Khai ở một chỗ để mọi phép tính bên dưới (gradient, vầng sáng, hạt nhiễu)
   tự co theo, không phải sửa mười chỗ. */
const DOC = process.argv.includes('--doc');
const W = DOC ? 1080 : 1200, H = DOC ? 1350 : 675;

/* ── BIÊN HẠT NHIỄU ──
   Hạt nhiễu chống vệt dải (banding) trên gradient mềm. Nhưng nó cũng là thứ
   PHÁ NÉN mạnh nhất: mỗi pixel một giá trị ngẫu nhiên mới thì zlib không tìm
   được mẫu nào để lặp.

   Đo trên ảnh thật (1200×675, có filter Sub):
       nhiễu ±0.8  →  165KB
       nhiễu  0    →   81KB
   Tức là hạt nhiễu tốn gấp đôi cả tấm ảnh.

   Soi kỹ bản không nhiễu: KHÔNG có vệt dải. Lý do là bảng màu ở đây toàn màu
   pastel nằm sát nhau, biên độ gradient hẹp nên 8 bit thừa sức. Nhiễu ở đây là
   bảo hiểm cho một rủi ro không có thật.

   Để lại hằng số này thay vì xoá hẳn: hôm nào thêm cặp màu cách xa nhau mà
   thấy vệt dải thì chỉnh lên 1.6 là xong, không phải viết lại gì.

   (Đã thử dither CÓ TRẬT TỰ kiểu Bayer 4×4, tưởng tuần hoàn thì nén tốt hơn.
   Sai: 302KB so với 236KB của nhiễu ngẫu nhiên. Nền gradient trôi bên dưới nên
   giá trị cộng lại vẫn khác nhau từng pixel, mà biên độ Bayer lại lớn hơn.) */
const NHIEU = 0;

const mau = {
  do:   (s) => `\x1b[31m${s}\x1b[0m`,
  vang: (s) => `\x1b[33m${s}\x1b[0m`,
  xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo:   (s) => `\x1b[2m${s}\x1b[0m`,
  dam:  (s) => `\x1b[1m${s}\x1b[0m`
};

/* ══════════ BẢNG MÀU ══════════
   Chép từ tokens.css. CỐ Ý chép chứ không đọc file .css: đọc CSS bằng regex là
   một bộ phân tích cú pháp nửa vời, hỏng lúc nào không biết. Sáu màu này đã
   đứng yên từ V0.10; đổi thì sửa ở đây một dòng. */
const BANG = {
  /* Sakura */
  lav:    '#F4E7FB', blush:  '#F3DCDC', coral:  '#F5BCBA',
  orchid: '#E3AADD', violet: '#C8A8E9', peri:   '#C3C7F3',
  paper:  '#F6EFFB', bg:     '#FAF6FD',
  /* Thiên hà — nền đêm, hai nốt sáng */
  dem:    '#1B1233', dem2:   '#2B1E4C', dem3:   '#120C22',
  sao:    '#EFC2E9', tim2:   '#C8A8E9',
  /* Tĩnh lặng — nước */
  suong:  '#DAE8F5', troi:   '#BAD9F4', suoi:   '#9FD3EA',
  reu:    '#A8DED6', nuoc:   '#E9F1FA'
};
/* ── MẤY CẶP MÀU, TRẢI KHẮP BA THEME ──
   Bài nào rơi vào cặp nào là do TÊN BÀI quyết định — tất định, nên cùng một
   bài luôn ra cùng một tấm.

   Sáu cặp đầu là Sakura (bảng màu mặc định của trang), rồi ba cặp Thiên hà và
   ba cặp Tĩnh lặng. Trước bản này cả mười hai bài đều rơi vào một họ hồng-tím:
   nhìn từng tấm thì đẹp, nhưng một feed có bốn năm đường dẫn của blog này hiện
   ra bốn năm tấm gần như trùng nhau, và mắt thôi phân biệt được bài nào với
   bài nào.

   Tỉ lệ 6/3/3 là cố ý: Sakura vẫn là bảng màu chính của trang, hai bảng kia
   là biến tấu. Muốn đều nhau thì thêm cặp cho hai bảng sau. */
const CAP = [
  ['paper', 'violet', 'coral'],
  ['lav',   'peri',   'orchid'],
  ['bg',    'orchid', 'peri'],
  ['blush', 'violet', 'peri'],
  ['paper', 'coral',  'orchid'],
  ['lav',   'violet', 'blush'],
  ['dem',   'sao',    'tim2'],
  ['dem3',  'tim2',   'sao'],
  ['dem2',  'sao',    'peri'],
  ['nuoc',  'suoi',   'reu'],
  ['suong', 'troi',   'suoi'],
  ['nuoc',  'reu',    'troi']
];

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const tron = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const kep  = (v) => Math.max(0, Math.min(255, Math.round(v)));
/* Mềm hoá: 1 ở tâm, 0 ở mép, chuyển bằng smoothstep nên không thấy đường bao.
   Không có nó thì mỗi vầng sáng có một viền tròn sắc lẻm. */
/* Độ sáng cảm nhận, 0..1 — dùng để chọn màu nét hoa văn theo nền. */
const do_sang = (c) => (c[0] * .299 + c[1] * .587 + c[2] * .114) / 255;
const mem  = (d) => { const t = Math.max(0, Math.min(1, 1 - d)); return t * t * (3 - 2 * t); };

/* Hạt giống từ tên bài — FNV-1a. Cùng tên thì luôn cùng số. */
function hat(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function sinh(h) {
  return function () {
    h = (h + 0x6D2B79F5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ══════════ VẼ ══════════ */
function ve(tieuDe) {
  const r = sinh(hat(tieuDe));
  const cap = CAP[Math.floor(r() * CAP.length)];
  const [NEN, A, B] = cap.map((k) => hex(BANG[k]));

  /* Góc nghiêng của dải màu, và hai vầng sáng. Tất cả lấy từ cùng một dòng số
     nên cùng tên bài là cùng bố cục. */
  const goc  = r() * Math.PI;
  const cx1 = .12 + r() * .3,  cy1 = .08 + r() * .35;
  const cx2 = .6  + r() * .34, cy2 = .55 + r() * .4;
  const ban1 = .5 + r() * .35, ban2 = .45 + r() * .4;
  /* Số vệt mảnh vắt ngang — 2 tới 4. Không có vệt nào thì ảnh phẳng như một
     cái nền gradient mặc định; nhiều quá thì rối. */
  const soVet = 2 + Math.floor(r() * 3);
  const vet = [];
  for (let i = 0; i < soVet; i++) {
    vet.push({ p: .15 + r() * .7, day: .012 + r() * .03, lech: (r() - .5) * .5, dam: .1 + r() * .16 });
  }

  /* ── ĐOÁ MANDALA — THỨ LÀM TẤM ẢNH RA TẤM ẢNH ──
     Trước bản này ảnh bìa chỉ có dải màu và mấy vệt sáng. Đẹp như một tấm vải,
     nhưng dán lên Facebook thì nó là một hình chữ nhật pastel trống: người
     lướt qua không có gì để nhận ra đây là blog nào, và ba bài cạnh nhau trông
     như ba lần cùng một tấm.

     Ba tấm og chung (`npm run og`) đã giải đúng bài đó bằng logo. Ảnh bìa nay
     mượn cùng hoạ tiết ấy — đoá tám cánh — nên một feed có cả bài có bìa lẫn
     bài không bìa vẫn đọc ra cùng một nhà.

     KHÔNG chép chuỗi `d` của logo vào đây: đó là đường bezier, mà file này ghi
     PNG từng điểm ảnh một, không có bộ tô đường nào. Dựng lại bằng TOẠ ĐỘ CỰC:
     `r = |cos(2θ)|` là một đoá bốn cánh; ba lớp lệch nhau ra hình đan, đúng
     hình nghỉ của logo. Vẽ VIỀN chứ không tô đặc, cũng như logo.

     Chữ thì không: ảnh này còn nằm ngay dưới tiêu đề ở đầu bài, nên in tiêu đề
     lên nó là đọc cùng một câu hai lần cách nhau ba centimet.

     ── BỐC SỐ Ở ĐÂY, KHÔNG BỐC SỚM HƠN ──
     Cả tấm ảnh dựng từ MỘT dòng số tất định. Chen mấy lượt bốc mới vào giữa
     dòng ấy thì mọi giá trị phía sau xê dịch, và tất cả ảnh bìa đã có đổi màu
     — một thay đổi không ai yêu cầu, lặng lẽ, trên mọi bài cũ. Bốc sau cùng
     thì ảnh cũ giữ nguyên nền, chỉ thêm hoa văn. */
  const mBan = .30 + r() * .09;              /* bán kính đoá, theo cạnh ngắn */
  /* Kẹp tâm để vòng ngoài cùng (1.34 lần bán kính) không chạm mép: một đoá bị
     xén nửa đọc ra là lỗi dựng ảnh, không phải ý đồ. */
  const le  = mBan * 1.34;
  const mx  = Math.min(1 - le * (H / W), Math.max(le * (H / W), (r() < .5 ? .30 : .70) + (r() - .5) * .1));
  const my  = Math.min(1 - le, Math.max(le, .5 + (r() - .5) * .22));
  const mXoay = r() * Math.PI;
  const mDam  = .40 + r() * .12;             /* đậm nhạt của nét */

  const px = Buffer.alloc(H * (1 + W * 3));
  const cos = Math.cos(goc), sin = Math.sin(goc);

  for (let y = 0; y < H; y++) {
    const doc = y * (1 + W * 3);
    px[doc] = 0;                                   /* filter byte: none */
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      const ar = H / W;                            /* để hình tròn ra tròn thật */

      /* Nền: dải màu chạy theo góc đã bốc, đi TRỌN từ nền sang màu A.
         Bản đầu chỉ đi nửa đường (`tron(NEN, A, .55)`) nên cả tấm gần như một
         màu — nhìn ra là một cái nền mặc định chứ không phải một tấm ảnh. */
      const t = Math.max(0, Math.min(1, (u * cos + v * sin + 1) / 2));
      let c = tron(NEN, A, t * .92);

      /* Hai vầng sáng. Vầng đầu kéo NGƯỢC về phía sáng để có chỗ thở, vầng sau
         là màu nhấn — hai vầng cùng tông thì lại phẳng như cũ. */
      c = tron(c, tron([255, 252, 255], NEN, .25),
               mem(Math.hypot((u - cx1) * ar, v - cy1) / ban1) * .78);
      c = tron(c, B, mem(Math.hypot((u - cx2) * ar, v - cy2) / ban2) * .72);

      /* Vệt mảnh vắt ngang — cho ảnh có nhịp, đỡ phẳng */
      for (const s of vet) {
        const d = Math.abs((v + (u - .5) * s.lech) - s.p);
        c = tron(c, [255, 255, 255], mem(d / s.day) * s.dam * 1.5);
      }

      /* ── ĐOÁ MANDALA ──
         `rc` là bán kính của đường cong tại góc này; nét nằm ở chỗ khoảng cách
         tới nó nhỏ hơn bề dày. Chia cho `doDoc` là phép sửa bậc nhất: trong
         toạ độ cực, |d − rc| KHÔNG phải khoảng cách thật tới đường cong, và
         không sửa thì nét mảnh hẳn đi ở chỗ đường cong dốc — mỗi cánh hoa ra
         một bề dày khác nhau.

         BA lớp, đúng như logo lúc nghỉ: một đoá chính đậm, một đoá lệch 45°
         nhạt hơn (chỗ hai đoá cắt nhau sinh ra cảm giác đan), và một lớp ngoài
         rộng hơn rất mờ làm nền cho cả hai. */
      {
        const dx = (u - mx) * (W / H), dy = v - my;
        const d  = Math.hypot(dx, dy) / mBan;
        if (d < 1.45) {
          /* ── MÀU NÉT PHẢI THEO NỀN, KHÔNG PHẢI MỘT MÀU CỐ ĐỊNH ──
             Ba trong mười hai cặp màu là bảng Thiên hà — nền đêm. Một nét ngả
             đen trên nền đêm thì biến mất hẳn: đo trên bài "Vô thức", cả đoá
             tụt xuống dưới ngưỡng nhìn thấy và tấm ảnh lại thành một hình chữ
             nhật trống, đúng thứ vừa sửa xong.

             Nên nét ĐỔI CHIỀU theo độ sáng của nền ngay tại điểm ấy: nền sáng
             thì nét đậm lại, nền tối thì nét sáng lên — cùng cách ba tấm og
             chung làm (bản Thiên hà dùng nét hồng sáng trên nền đêm). */
          const sang = do_sang(c);
          /* Không dùng ngưỡng cứng `sáng > .5`: nền nào nằm ngay quanh ngưỡng
             thì hai nhánh đều cho nét sát màu nền, và hoa văn mờ như không có.
             Đo trên bài "Vô thức" (nền ~.52) là đúng ca ấy.

             Nên NHẮM một độ sáng cách nền một khoảng CỐ ĐỊNH, rồi kéo màu nhấn
             về đúng độ sáng đó. Mọi bảng màu — pastel hay đêm — đều ra cùng một
             mức tương phản, không bảng nào chìm. */
          /* Chuyển MỀM qua ngưỡng, không lật. Bản lật cứng để lại một vệt
             gãy sắc lẻm ngay chỗ một vệt sáng vắt ngang đoá hoa: hai bên vệt,
             nền chênh nhau vài phần trăm độ sáng, mà màu nét nhảy nguyên 0.6 —
             ra một mảng chữ nhật đọc như ảnh bị dán chồng. */
          const ngach = Math.max(0, Math.min(1, (sang - .42) / .16));
          const dich = Math.max(.06, Math.min(.94,
            sang + .30 * (1 - 2 * ngach * ngach * (3 - 2 * ngach))));
          const lb   = do_sang(B);
          const net  = dich < lb
            ? tron(B, [0, 0, 0],       1 - dich / Math.max(lb, .02))
            : tron(B, [255, 255, 255], (dich - lb) / Math.max(1 - lb, .02));
          const goc0 = Math.atan2(dy, dx) + mXoay;
          const LOP = [
            { lech: 0,              ti: 1,    day: .075, dam: 1   },
            { lech: Math.PI / 4,    ti: 1,    day: .075, dam: .62 },
            { lech: Math.PI / 8,    ti: 1.18, day: .05,  dam: .3  }
          ];
          for (const L of LOP) {
            const th  = goc0 + L.lech;
            const rc  = Math.abs(Math.cos(2 * th)) * L.ti;
            const doc2 = Math.abs(2 * Math.sin(2 * th)) * L.ti / Math.max(d, .14);
            const kc  = Math.abs(d - rc) / Math.sqrt(1 + doc2 * doc2);
            c = tron(c, net, mem(kc / L.day) * mDam * L.dam);
          }
          /* Hai vòng: một nét liền sát đoá, một nét ĐỨT ở ngoài — cùng ngữ
             pháp với ba tấm og chung và với chính logo lúc nghỉ. */
          c = tron(c, net, mem(Math.abs(d - 1.2) / .012) * mDam * .8);
          const nhip = Math.sin(Math.atan2(dy, dx) * 20 + mXoay * 4);
          if (nhip > .15) {
            c = tron(c, net, mem(Math.abs(d - 1.34) / .014) * mDam * .7);
          }
        }
      }

      /* ── TỐI NHẸ BỐN GÓC ──
         Ảnh sáng đều tuyệt đối trông như lỗi in. Nhưng "nhẹ" là quan trọng:
         công thức cũ (.5 / .78) kéo góc phải dưới từ một màu oải hương xuống
         (73, 59, 92) — gần như đen tím. Cả tấm đọc ra xám đục, lạc hẳn khỏi
         bảng màu pastel của trang, và hoa văn ở giữa chìm mất.

         Đo lại trên cả mười bài: .34 / .36 giữ được cảm giác có chiều sâu mà
         góc tối nhất vẫn nằm trong họ màu. */
      const goc4 = Math.hypot((u - .5) * 1.25, (v - .5) * 1.25);
      c = tron(c, tron(c, [120, 96, 150], .34), Math.max(0, goc4 - .42) * .36);

      /* Hạt nhiễu — xem hằng số NHIEU ở đầu file. Mặc định tắt. */
      const nz = NHIEU ? (((x * 12.9898 + y * 78.233) * 43758.5453) % 1 - .5) * NHIEU : 0;

      /* ── LÀM TRÒN VỀ BỘI SỐ 2 ──
         Hoạ tiết mandala thêm vào từ V15.07 làm ảnh nặng gấp ba: 74 KB lên
         212 KB. Thủ phạm là mấy trăm nghìn sắc độ khác nhau ở rìa nét — mỗi
         pixel một giá trị mới thì zlib không tìm được mẫu nào để lặp.

         Bỏ đi bit cuối của mỗi kênh cắt 24% dung lượng. Đo trên cả tám tấm:
         không tấm nào lộ vệt dải, vì bảng màu ở đây toàn pastel nằm sát nhau —
         một bậc trên 256 là thứ mắt không tách ra được.

         Đã thử bước 3 và 4 (còn 124 và 106 KB) rồi bỏ: ở đó dải màu bắt đầu
         gãy thành từng khoanh, và một tấm ảnh có vệt dải thì nhẹ cỡ nào cũng
         là hỏng. */
      const o = doc + 1 + x * 3;
      px[o]     = kep(c[0] + nz) & 0xFE;
      px[o + 1] = kep(c[1] + nz) & 0xFE;
      px[o + 2] = kep(c[2] + nz) & 0xFE;
    }
  }
  return px;
}

/* ══════════ GHI PNG ══════════ */
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
/* ── LỌC TRƯỚC KHI NÉN ──
   PNG cho phép mỗi dòng chọn một cách "lọc": thay vì ghi giá trị pixel, ghi
   HIỆU so với pixel bên trái (Sub), bên trên (Up), hay trung bình (Average).
   Trên một dải màu mềm, hiệu giữa hai pixel cạnh nhau gần như luôn bằng 0 hoặc
   ±1, mà một dãy toàn số 0 thì zlib nén còn gần như không tốn gì.

   Đời đầu ghi filter 0 (None) cho mọi dòng — tức là không lọc gì cả. Đo trên
   ảnh thật, 1600×900 có nhiễu:
       None 391KB · Sub 271KB · Up 393KB · Average 386KB · Paeth 439KB
   Sub thắng rõ vì gradient ở đây chạy chủ yếu theo chiều NGANG.

   Không làm lọc thích ứng (thử cả 5 kiểu mỗi dòng rồi chọn kiểu nhỏ nhất) như
   bộ mã hoá thật: tốn gấp năm lần thời gian để đổi lấy vài phần trăm, trong
   khi ảnh ở đây bài nào cũng cùng một kiểu bố cục. */
function locSub(px) {
  const buoc = 1 + W * 3;
  const ra = Buffer.alloc(px.length);
  for (let y = 0; y < H; y++) {
    const o = y * buoc;
    ra[o] = 1;                                     /* filter type: Sub */
    for (let k = 0; k < W * 3; k++) {
      /* Trừ pixel bên trái — 3 byte trước, vì mỗi pixel là 3 byte RGB.
         Ba byte đầu dòng không có gì bên trái nên trừ 0. */
      const trai = k >= 3 ? px[o + 1 + k - 3] : 0;
      ra[o + 1 + k] = (px[o + 1 + k] - trai) & 0xFF;
    }
  }
  return ra;
}

function png(px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2;                        /* 8-bit, truecolour RGB */
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    khoi('IHDR', ihdr),
    khoi('IDAT', zlib.deflateSync(locSub(px), { level: 9 })),
    khoi('IEND', Buffer.alloc(0))
  ]);
}

/* ══════════ ĐỌC BÀI ══════════ */
function moiBai() {
  const ra = [];
  const di = (d) => {
    for (const x of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, x.name);
      if (x.isDirectory()) { di(f); continue; }
      if (!x.name.endsWith('.md') || x.name.startsWith('_')) continue;
      const raw = fs.readFileSync(f, 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!m) continue;
      const fm = m[1];
      const lay = (k) => {
        const v = fm.match(new RegExp(`^${k}:[ \\t]*(.+)$`, 'm'));
        return v ? v[1].trim().replace(/^["']|["']$/g, '') : '';
      };
      const ten = path.basename(f, '.md');
      /* Danh sách `anh:` của khung C — mỗi dòng `- <đường dẫn> | <chú thích>`.
         Cần nó để cờ --doc biết sinh mấy tấm và lấy chú thích làm hạt giống,
         nhờ vậy mỗi tấm trong băng ra một hình khác nhau. */
      const anh = (() => {
        const k = fm.match(/^anh:[ \t]*\n((?:[ \t]*-[ \t]*.+\n?)+)/m);
        if (!k) return [];
        return k[1].split('\n').map((d) => d.replace(/^[ \t]*-[ \t]*/, '').trim())
          .filter(Boolean).map((d) => d.split('|').slice(1).join('|').trim());
      })();
      ra.push({
        file: f,
        anh,
        title: lay('title'),
        date: lay('date'),
        cover: lay('cover'),
        draft: /^draft:\s*true\s*$/m.test(fm),
        slug: lay('slug') || slugify(ten.replace(/^\d{4}-\d{2}-\d{2}-/, ''))
      });
    }
  };
  di(POSTS);
  return ra;
}

/* ══════════ CHẠY ══════════ */
const CO = process.argv.slice(2);
const TAT_CA = CO.includes('--tat-ca');
const DE = CO.includes('--de');                    /* ghi đè ảnh đã có */
const chon = CO.filter((x) => !x.startsWith('--'));

const bai = moiBai();
if (!bai.length) {
  console.log(mau.vang('\n  Chưa có bài nào trong content/posts/.\n'));
  process.exit(0);
}

/* ── `--tat-ca` KHÔNG ĐỤNG TỚI BÀI ĐANG MƯỢN BÌA CỦA BÀI KHÁC ──
   Bài "Thứ bảy" khai `cover: /media/2026/quan-ca-phe-goc-pho/bia.png` — nó
   dùng chung bìa với một bài khác, cố ý. Dựng thêm một tấm vào thư mục riêng
   của nó thì tấm ấy nằm đó không ai dùng, và `npm run kiem` báo "ảnh mồ côi".

   Bài NHÁP cũng bỏ qua: nó chưa có mặt trong bản dựng, nên bìa của nó cũng
   chưa cần tồn tại. Muốn dựng riêng thì gọi thẳng tên slug. */
let lam = TAT_CA
  ? bai.filter((b) => {
      if (b.draft) return false;
      if (!b.cover) return true;          /* chưa có bìa — dựng cho nó */
      const nam2 = (b.date || '').slice(0, 4) || String(new Date().getFullYear());
      return b.cover === `/media/${nam2}/${b.slug}/bia.png`;
    })
  : bai.filter((b) => chon.includes(b.slug));
if (!TAT_CA && !chon.length) {
  console.log(mau.dam('\n  SINH ẢNH BÌA\n'));
  console.log('  Cách dùng:');
  console.log(mau.mo('    npm run bia -- <slug>        một bài'));
  console.log(mau.mo('    npm run bia -- --tat-ca      mọi bài chưa có bìa'));
  console.log(mau.mo('    npm run bia -- <slug> --de   ghi đè ảnh đã có'));
  console.log(mau.mo('    npm run bia -- <slug> --doc  ảnh DỌC 4:5 cho băng ảnh khung C\n'));
  console.log('  Các bài đang có:');
  for (const b of bai) {
    console.log(`    ${b.cover ? mau.xanh('có bìa ') : mau.vang('chưa có')}  ` +
                `${mau.mo(b.slug.padEnd(28))} ${b.title}`);
  }
  console.log('');
  process.exit(0);
}
if (!TAT_CA && !lam.length) {
  console.log(mau.do(`\n  Không có bài nào tên "${chon.join(', ')}".\n`));
  process.exit(1);
}

console.log(mau.dam(DOC ? '\n  SINH ẢNH DỌC CHO BĂNG ẢNH\n' : '\n  SINH ẢNH BÌA\n'));
let so = 0;

/* ── CỜ --doc: SINH ẢNH CHO BĂNG ẢNH CỦA KHUNG C ──
   Khác ảnh bìa ở ba chỗ: khổ 4:5 thay vì 16:9, sinh NHIỀU tấm thay vì một, và
   không đụng tới `cover:` trong front matter. Số tấm lấy theo đúng số dòng
   trong `anh:`, hạt giống lấy theo CHÚ THÍCH từng dòng — nhờ vậy ba tấm ra ba
   hình khác nhau chứ không phải ba bản sao. */
if (DOC) {
  for (const b of lam) {
    const nam = (b.date || '').slice(0, 4) || String(new Date().getFullYear());
    const n = b.anh.length || 3;
    for (let i = 0; i < n; i++) {
      const rel = `/media/${nam}/${b.slug}/anh-${i + 1}.png`;
      const dich = path.join(PUBLIC, rel.replace(/^\//, ''));
      if (fs.existsSync(dich) && !DE) {
        console.log(`  ${mau.mo('bỏ qua')}  ${rel} ${mau.mo('— đã có, thêm --de để ghi đè')}`);
        continue;
      }
      fs.mkdirSync(path.dirname(dich), { recursive: true });
      const buf = png(ve(b.anh[i] || `${b.title} ${i + 1}`));
      fs.writeFileSync(dich, buf);
      so++;
      console.log(`  ${mau.xanh('✓')}  ${mau.mo(rel.padEnd(46))} ${(buf.length / 1024).toFixed(0)}KB`);
    }
  }
  console.log(so ? mau.xanh(`\n  Xong ${so} ảnh dọc.\n`) : mau.mo('\n  Không sinh ảnh nào.\n'));
  process.exit(0);
}

for (const b of lam) {
  const nam = (b.date || '').slice(0, 4) || String(new Date().getFullYear());
  const rel = `/media/${nam}/${b.slug}/bia.png`;
  const dich = path.join(PUBLIC, rel.replace(/^\//, ''));

  if (fs.existsSync(dich) && !DE) {
    console.log(`  ${mau.mo('bỏ qua')}  ${b.slug} ${mau.mo('— đã có ảnh, thêm --de để ghi đè')}`);
    continue;
  }
  if (!b.title) {
    console.log(`  ${mau.vang('bỏ qua')}  ${b.slug} ${mau.mo('— bài chưa có title')}`);
    continue;
  }

  fs.mkdirSync(path.dirname(dich), { recursive: true });
  const buf = png(ve(b.title));
  fs.writeFileSync(dich, buf);
  so++;
  console.log(`  ${mau.xanh('✓')}  ${mau.mo(rel.padEnd(42))} ${(buf.length / 1024).toFixed(0)}KB`);

  if (b.cover !== rel) {
    console.log(mau.mo(`     dán vào front matter của ${path.relative(GOC, b.file)}:`));
    console.log(`     ${mau.dam(`cover: ${rel}`)}`);
    console.log(`     ${mau.dam(`coverAlt: ${b.title}`)}`);
  }
}
console.log(so ? mau.xanh(`\n  Xong ${so} ảnh.\n`) : mau.mo('\n  Không sinh ảnh nào.\n'));
