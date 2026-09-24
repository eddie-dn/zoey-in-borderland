/* ============================================================
   MARKDOWN — dựng .md thành HTML.

   Tự viết chứ không dùng marked/markdown-it, vì blog này cần ba thứ mà gói
   ngoài đều phải vá thêm mới có:
     1. Ảnh đứng riêng một dòng phải thành <figure> có aspect-ratio ĐO TỪ FILE THẬT.
     2. Video YouTube phải là ảnh-bìa-bấm-mới-tải, không phải iframe nhúng sẵn.
     3. Ảnh gãy link phải làm build BÁO LỖI, không phải im lặng ra ô vỡ.
   Đổi lại: đây là một tập con của Markdown, không phải bản đầy đủ.
   Danh sách cú pháp nhận được nằm ở docs/HUONG-DAN-DANG-BAI.md.
   ============================================================ */
/* ══════════════════════════════════════════════════════════════════════════
   BỘ DỰNG NÀY PHẢI CHẠY ĐƯỢC CẢ Ở TRÌNH DUYỆT

   Nó từng `import` thẳng `node:path` và `node:fs`, nên chỉ chạy được ở Node.
   Hậu quả không nằm ở bộ dựng — nó nằm ở Ô SOẠN BÀI: muốn cho người viết XEM
   THỬ bài trước khi đăng thì trang quản trị phải dựng được Markdown ra HTML,
   mà nó không nạp nổi file này. Đường duy nhất còn lại là viết một bộ dựng
   THỨ HAI cho trình duyệt — và hai bộ dựng thì sớm muộn lệch nhau, tức là một
   ô xem thử NÓI DỐI. Thà không có còn hơn.

   Thật ra file này gần như đã thuần rồi: hai thứ của Node chỉ dùng ở đúng bốn
   chỗ, và cả bốn đều nằm sau `if (ctx.publicDir)` — tức là chúng chỉ chạy khi
   người gọi đưa vào một thư mục trên đĩa.

   Nay đảo lại cho đúng chiều phụ thuộc: file này KHÔNG biết đĩa là gì, nó chỉ
   biết hỏi. Người gọi đưa vào hai cái hàm:

       ctx.coFile(duong)  → true/false   file ấy có trên đĩa không
       ctx.doAnh(duong)   → {w,h}|null   khổ ảnh, nếu đo được

   Ở Node, `build.mjs` đưa vào hai hàm đọc đĩa thật. Ở trình duyệt, không đưa
   gì cả — hai phép kiểm kia lặng lẽ bỏ qua, ảnh ra không có `width/height`.
   Bài xem thử vì thế có thể xô nhẹ lúc ảnh tải xong; bài THẬT thì không, vì
   lúc dựng thật vẫn đo đủ.
   ══════════════════════════════════════════════════════════════════════════ */
import { escapeHtml, attr, slugify, tiLe } from './text.mjs';

const NHAN_CALLOUT = { note: 'Ghi chú', tip: 'Mẹo', warn: 'Lưu ý', stop: 'Đừng làm' };

/* Ký tự giữ chỗ. Dùng ký tự điều khiển U+0001 vì nó không bao giờ xuất hiện
   trong bài viết thật — nếu dùng một ký tự thường thì người viết gõ trúng nó
   là hỏng cả đoạn. */
const GIU = '';

/* ══════════════ 1. LỚP CHỮ TRONG DÒNG ══════════════ */

/* Tách phần {.wide .full poster=/x.jpg} ở đuôi một directive */
function tachLop(s) {
  const m = String(s || '').match(/\{([^}]*)\}\s*$/);
  if (!m) return { lop: [], con: s || '', them: {} };
  const lop = [], them = {};
  for (const t of m[1].trim().split(/\s+/)) {
    if (t.startsWith('.')) lop.push(t.slice(1));
    else if (t.includes('=')) {
      const [k, ...v] = t.split('=');
      them[k] = v.join('=').replace(/^["']|["']$/g, '');
    }
  }
  return { lop, con: s.slice(0, m.index), them };
}

/* ══════════ MÀU CHỮ ══════════
   Cú pháp `{tím: chữ}` → <span class="c-tim">chữ</span>.

   ── VÌ SAO KHÔNG CHO VIẾT THẲNG HTML ──
   `inline()` thoát HẾT ký tự HTML trong dòng (xem `escapeHtml` ở cuối hàm),
   nên <span style="color:red"> gõ trong bài sẽ hiện ra thành chữ trần. Nới
   chỗ thoát ấy ra là mở cho MỌI thẻ đi thẳng vào trang, kể cả <script> — một
   cái cửa rất rộng, mở ra chỉ để tô màu được mấy chữ.

   Bảng tên màu thì hẹp đúng bằng nhu cầu: tám tên, ra tám tên lớp, không thứ
   gì khác lọt qua. Và vì màu thật nằm ở biến CSS (tokens.css), một bài viết
   hồi theme Sakura vẫn đọc được khi người đọc bật theme Galaxy — mã màu gõ
   tay thì không có cách nào làm được điều đó.

   ── TÊN TIẾNG VIỆT, VÀ CÓ CẢ BẢN KHÔNG DẤU ──
   Gõ trên điện thoại thì dấu là thứ rơi rụng đầu tiên. `{tim: …}` và
   `{tím: …}` cùng ra một kết quả; không nhận bản không dấu thì người ta gõ
   xong thấy nguyên cụm `{tim: chữ}` nằm giữa bài mà không hiểu vì sao. */
const MAU = {
  'tím':'tim',   'tim':'tim',
  'hồng':'hong', 'hong':'hong',
  'đỏ':'do',     'do':'do',
  'cam':'cam',
  'vàng':'vang', 'vang':'vang',
  'lục':'luc',   'luc':'luc',
  'lam':'lam',
  'xám':'xam',   'xam':'xam',
  'nâu':'nau',   'nau':'nau',
  'ngọc':'ngoc', 'ngoc':'ngoc',
  'chàm':'cham', 'cham':'cham',
  /* "ô liu" có dấu cách; bản không dấu viết liền. */
  'ô liu':'oliu', 'oliu':'oliu'
};

/* Chỉ khớp khi tên NẰM TRONG bảng: `{note: xem thêm}` là chữ bình thường và
   phải giữ nguyên, không được biến thành thẻ rỗng. `[^{}]` chặn phần nội dung
   nuốt sang cụm kế tiếp khi trong một dòng có hai cụm màu. */
const RE_MAU = new RegExp(
  '\\{(' + Object.keys(MAU).join('|') + ')\\s*:\\s*([^{}]+?)\\}', 'g');

function nhanManh(s) {
  return s
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?!\w)/g, '$1<em>$2</em>')
    /* Gạch dưới chỉ tính khi đứng ở ranh giới TỪ — nếu không thì tên biến
       kiểu ten_bien_dai bị biến thành ten<em>bien</em>dai. */
    .replace(/(^|[\s(])_(?=\S)([^_]*?\S)_(?=$|[\s).,;:!?])/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    /* ── CHỈ SỐ DƯỚI, CHỈ SỐ TRÊN, PHÍM ──
       Ba thứ này có sẵn CSS trong prose.css từ lâu mà chưa có đường nào sinh
       ra chúng — tức là ba luật trang trí không ai dùng được. Nay có cú pháp.

       THỨ TỰ BẮT BUỘC: `~dưới~` phải chạy SAU `~~gạch~~`. Chạy trước thì cặp
       dấu ngã đôi bị đọc thành hai lần chỉ số dưới lồng nhau, và `~~bỏ~~` ra
       một mớ thẻ <sub> chồng lên nhau thay vì một thẻ <del>.

       Cả ba đều CẤM khoảng trắng bên trong. Chỉ số và tên phím vốn là những
       mẩu ngắn dính liền; cho phép khoảng trắng thì một câu có hai dấu ngã
       cách nhau nửa dòng lập tức bị nuốt vào giữa. Đây là chỗ Pandoc cũng
       chọn đúng như vậy, vì cùng một lý do.

       `[[⌘K]]` dùng ngoặc vuông ĐÔI: ngoặc đơn đã là link `[chữ](địa chỉ)`,
       mà tới lúc hàm này chạy thì mọi link thật đã nằm trong kho ký tự giữ
       chỗ (xem `inline`), nên không còn gì để đụng. */
    .replace(/(^|[^~])~(?=\S)([^~\s]*?\S)~(?!~)/g, '$1<sub>$2</sub>')
    .replace(/\^(?=\S)([^^\s]*?\S)\^/g, '<sup>$1</sup>')
    .replace(/\[\[(?=\S)([^\][]*?\S)\]\]/g, '<kbd>$1</kbd>')
    .replace(/==(?=\S)([\s\S]*?\S)==/g, '<mark>$1</mark>')
    /* Màu chạy SAU đậm/nghiêng: nhờ vậy `{tím: **chữ**}` ra chữ vừa tím vừa
       đậm. Chạy trước thì phần **…** nằm gọn trong thẻ span và không còn ai
       xử nó nữa. */
    .replace(RE_MAU, (_, ten, chu) => '<span class="c-' + MAU[ten] + '">' + chu + '</span>')
    .replace(/ {2,}\n/g, '<br>\n');
}

/* Trình tự BẮT BUỘC: rút mã và link ra chỗ khác TRƯỚC khi thoát ký tự HTML.
   Làm ngược lại thì dấu " trong tiêu đề link đã thành &quot;, regex bắt tiêu
   đề không còn khớp nữa. Đây là lỗi rất khó nhìn ra khi đọc code. */
export function inline(s, ctx = {}) {
  const kho = [];
  const cat = (html) => { kho.push(html); return GIU + (kho.length - 1) + GIU; };

  /* ── DẤU CHÉO NGƯỢC: MỘT KÝ TỰ CÚ PHÁP VIẾT THÀNH CHỮ THƯỜNG ──
     `5 \* 3` ra dấu sao, không mở phần in nghiêng.

     Phải chạy TRƯỚC mọi phép khác, kể cả mã trong dòng: `\`` mà xử sau thì
     bộ bắt mã trong dòng đã coi dấu huyền ấy là một đầu ô mã rồi, và cái ra
     là nửa thẻ <code> kèm một dấu chéo ngược lạc giữa câu.

     ── VÌ SAO GIỜ MỚI CÓ ──
     Trước bản này bộ dựng KHÔNG hiểu dấu chéo ngược: `\*` in ra nguyên cả
     dấu chéo. Gõ tay thì hiếm khi vấp — người ta tự tránh. Nhưng ô soạn thảo
     ở /z-admin/ thì phải tự đổi chữ người ta gõ ra Markdown, và lúc ấy nó
     BẮT BUỘC cần một cách nói "dấu sao này là dấu sao thật". Không có đường
     ấy thì mỗi dấu sao trong bài thành một lệnh in nghiêng hụt.

     Ký tự vào danh sách đều là ký tự CÓ NGHĨA ở đâu đó trong bộ dựng này —
     kể cả `{` `}`, vì cú pháp màu `{tím: …}` đọc chúng. */
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!~=>|^])/g, (_, c) => cat(escapeHtml(c)));

  /* mã trong dòng */
  s = s.replace(/`([^`\n]+)`/g, (_, c) => cat('<code>' + escapeHtml(c) + '</code>'));

  /* ảnh — phải trước link, vì ![x](y) chứa nguyên hình dạng của [x](y) */
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(\{[^}]*\})?/g,
    (_, alt, src, cap, br) => cat(theAnh({ alt, src, cap, br, trongDong: true }, ctx)));

  /* link */
  s = s.replace(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, txt, href, ti) => {
    const ngoai = /^https?:\/\//i.test(href) && !href.includes(ctx.host || GIU);
    return cat(
      '<a href="' + attr(href) + '"' + (ti ? ' title="' + attr(ti) + '"' : '') +
      (ngoai ? ' rel="external noopener" target="_blank"' : '') + '>' +
      nhanManh(escapeHtml(txt)) + '</a>'
    );
  });

  /* link viết trần trong ngoặc nhọn */
  s = s.replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, (_, u) =>
    cat('<a href="' + attr(u) + '" rel="external noopener" target="_blank">' +
        escapeHtml(u.replace(/^mailto:/, '')) + '</a>'));

  s = nhanManh(escapeHtml(s));

  /* URL gõ trần giữa câu — làm sau cùng, khi mọi link thật đã nằm trong kho */
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g,
    (_, tr, u) => tr + '<a href="' + u + '" rel="external noopener" target="_blank">' + u + '</a>');

  return s.replace(new RegExp(GIU + '(\\d+)' + GIU, 'g'), (_, i) => kho[+i]);
}

/* Bản chỉ lấy chữ trần — dùng cho ô tìm kiếm và đếm phút đọc */
function tran(s) {
  return String(s)
    /* Nhả dấu chéo ngược ra TRƯỚC: `5 \* 3` phải vào ô tìm kiếm thành "5 * 3",
       không phải "5 \* 3". Chạy sau mấy phép dưới thì dấu chéo còn lại một
       mình giữa câu. */
    .replace(/\\(.)/g, '$1')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~=#>|]/g, ' ')
    /* Cụm màu phải nhả CHỮ ra chứ không bị xoá cả cụm: `{tím: điều quan
       trọng}` mà rơi mất thì đúng cái câu người viết nhấn mạnh lại là câu duy
       nhất ô tìm kiếm không tìm thấy. Chạy TRƯỚC phép xoá `{…}` chung. */
    .replace(RE_MAU, (_, ten, chu) => chu)
    /* Ba cú pháp mới cũng phải NHẢ CHỮ ra ở bản chữ trần: ô tìm kiếm và phép
       đếm phút đọc đọc bản này, nên nuốt cả cụm là gõ "m2" không tìm ra "m^2^". */
    .replace(/(^|[^~])~(?=\S)([^~\s]*?\S)~(?!~)/g, '$1$2')
    .replace(/\^(?=\S)([^^\s]*?\S)\^/g, '$1')
    .replace(/\[\[(?=\S)([^\][]*?\S)\]\]/g, '$1')
    .replace(/\{[^}]*\}/g, ' ');
}

/* ══════════════ 2. ẢNH ══════════════ */

function theAnh({ alt, src, cap, br, lopThem = [], trongDong = false }, ctx) {
  const { lop, them } = tachLop(br || '');
  const cls = [...lop, ...lopThem];

  let dim = '', style = '';
  if (src.startsWith('/') && ctx.coFile) {
    if (!ctx.coFile(src)) {
      if (ctx.canhBao) ctx.canhBao('ảnh không tồn tại: ' + src);
    } else {
      const kt = ctx.doAnh ? ctx.doAnh(src) : null;
      if (kt && kt.w && kt.h) {
        dim = ' width="' + kt.w + '" height="' + kt.h + '"';
        style = ' style="--ar:' + tiLe(kt.w, kt.h) + '"';
      }
    }
  }
  const img = '<img src="' + attr(ctx.base + src) + '" alt="' + attr(alt) + '"' +
              dim + style + ' loading="lazy" decoding="async">';
  if (trongDong) return img;

  const chu = cap || them.caption || '';
  return '<figure class="' + cls.join(' ') + '">' + img +
         (chu ? '<figcaption>' + inline(chu, ctx) + '</figcaption>' : '') +
         '</figure>';
}

/* ══════════════ 3. VIDEO ══════════════ */

function theYouTube(id, cap, br, ctx) {
  const { lop } = tachLop(br || '');
  /* Ảnh bìa lấy từ i.ytimg.com — đây là CDN ảnh tĩnh, KHÔNG đặt cookie và
     không kéo theo script nào. Khác hẳn iframe youtube.com nhúng sẵn, thứ
     kéo về hơn 1MB script của Google ngay lúc mở trang. */
  const bia = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg';
  return '<figure class="' + lop.join(' ') + '">' +
    '<div class="video-frame">' +
      '<button class="yt-facade" type="button" data-yt="' + attr(id) + '"' +
      ' data-title="' + attr(cap || 'Video') + '"' +
      ' aria-label="Phát video: ' + attr(cap || id) + '">' +
        '<img src="' + bia + '" alt="" loading="lazy" decoding="async">' +
        '<span class="yt-play" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12 8 5.2Z"/></svg>' +
        '</span>' +
      '</button>' +
    '</div>' +
    (cap ? '<figcaption>' + inline(cap, ctx) + '</figcaption>' : '') +
    '</figure>';
}

function theVideo(src, cap, br, ctx) {
  const { lop, them } = tachLop(br || '');
  if (src.startsWith('/') && ctx.coFile && !ctx.coFile(src)) {
    if (ctx.canhBao) ctx.canhBao('video không tồn tại: ' + src);
  }
  /* preload="metadata": chỉ tải phần đầu file để biết thời lượng và vẽ thanh
     tua. Để "auto" thì bài có video 40MB là tải hết 40MB ngay lúc mở trang,
     dù người đọc chưa chắc bấm play. */
  const kieu = src.split('.').pop() === 'webm' ? 'webm' : 'mp4';
  return '<figure class="' + lop.join(' ') + '">' +
    '<div class="video-frame">' +
      '<video controls preload="metadata" playsinline' +
      (them.poster ? ' poster="' + attr(ctx.base + them.poster) + '"' : '') + '>' +
        '<source src="' + attr(ctx.base + src) + '" type="video/' + kieu + '">' +
        'Trình duyệt không mở được video này. ' +
        '<a href="' + attr(ctx.base + src) + '">Tải về xem</a>.' +
      '</video>' +
    '</div>' +
    (cap ? '<figcaption>' + inline(cap, ctx) + '</figcaption>' : '') +
    '</figure>';
}

/* ══════════════ 4. LỚP KHỐI ══════════════ */

const RE_HR      = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_H       = /^(#{1,4})\s+(.*)$/;
const RE_UL      = /^(\s*)[-*+]\s+(.*)$/;
const RE_OL      = /^(\s*)(\d+)[.)]\s+(.*)$/;
const RE_QUOTE   = /^\s{0,3}>\s?(.*)$/;
const RE_FENCE   = /^\s{0,3}(`{3,}|~{3,})\s*([\w-]*)\s*$/;
const RE_CONT    = /^:::\s*([\w-]*)\s*(.*)$/;
const RE_TABLE   = /^\s*\|(.+)\|\s*$/;
const RE_ALIGN   = /^\s*\|[\s:|-]+\|\s*$/;
const RE_YT      = /^@youtube\[([^\]]+)\]\((.*?)\)(\{[^}]*\})?\s*$/;
const RE_VID     = /^@video\[([^\]]+)\]\((.*?)\)(\{[^}]*\})?\s*$/;
const RE_ANH_DON = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(\{[^}]*\})?\s*$/;
const RE_HTML    = /^\s{0,3}<(\/?)([a-zA-Z][\w-]*)/;

function batDauKhoi(d) {
  return RE_HR.test(d) || RE_H.test(d) || RE_UL.test(d) || RE_OL.test(d) ||
         RE_QUOTE.test(d) || RE_FENCE.test(d) || RE_CONT.test(d) ||
         RE_YT.test(d) || RE_VID.test(d) || RE_HTML.test(d);
}

function docKhoi(dong, ctx, sau) {
  sau = sau || 0;
  const ra = [];
  let i = 0;

  while (i < dong.length) {
    const d = dong[i];
    if (!d.trim()) { i++; continue; }

    /* ── chú thích <!-- --> ──
       Bỏ HẲN, không đẩy ra HTML. Chú thích trong file .md là ghi chú cho người
       viết ("chỗ này cần kiểm lại", "ảnh chờ chị gửi"), không phải thứ để bạn
       đọc xem được khi bấm Xem mã nguồn.
       Phải bắt TRƯỚC mọi khối khác: RE_HTML đòi một chữ cái ngay sau dấu <,
       mà "<!--" thì không có, nên nếu không có nhánh này thì chú thích rơi
       xuống nhánh đoạn văn và Markdown bên trong nó bị đem ra dựng thật. */
    if (/^\s{0,3}<!--/.test(d)) {
      while (i < dong.length && !/-->/.test(dong[i])) i++;
      i++;
      continue;
    }

    /* ── khối bọc ::: ── */
    let m = d.match(RE_CONT);
    if (m && m[1]) {
      const loai = m[1], nhan = m[2].trim();
      const than = [];
      let mo = 1;
      i++;
      while (i < dong.length) {
        const mm = dong[i].match(RE_CONT);
        if (mm) {
          if (mm[1]) mo++;
          else { mo--; if (!mo) { i++; break; } }
        }
        than.push(dong[i]); i++;
      }
      ra.push(boc(loai, nhan, than, ctx, sau));
      continue;
    }

    /* ── khối mã ── */
    m = d.match(RE_FENCE);
    if (m) {
      const rao = m[1], ngonNgu = m[2];
      const dong_ = [];
      const dong_dong = new RegExp('^\\s{0,3}\\' + rao[0] + '{' + rao.length + ',}\\s*$');
      i++;
      while (i < dong.length && !dong_dong.test(dong[i])) { dong_.push(dong[i]); i++; }
      i++;
      ra.push('<pre' + (ngonNgu ? ' data-lang="' + attr(ngonNgu) + '"' : '') +
              '><code>' + escapeHtml(dong_.join('\n')) + '</code></pre>');
      continue;
    }

    /* ── tiêu đề ── */
    m = d.match(RE_H);
    if (m) {
      const cap = m[1].length, chu = m[2].trim();
      const goc = slugify(chu);
      let id = goc, n = 2;
      while (ctx.ids.has(id)) id = goc + '-' + (n++);
      ctx.ids.add(id);
      if (cap === 2 || cap === 3) ctx.headings.push({ cap, id, chu: tran(chu).trim() });
      ctx.tho.push(tran(chu));
      ra.push('<h' + cap + ' id="' + id + '">' +
              '<a class="anchor" href="#' + id + '" aria-label="Liên kết tới mục này">#</a>' +
              inline(chu, ctx) + '</h' + cap + '>');
      i++; continue;
    }

    /* ── video ── */
    m = d.match(RE_YT);
    if (m) { ra.push(theYouTube(m[1].trim(), m[2].trim(), m[3], ctx)); i++; continue; }
    m = d.match(RE_VID);
    if (m) { ra.push(theVideo(m[1].trim(), m[2].trim(), m[3], ctx)); i++; continue; }

    /* ── ảnh đứng một mình → figure ── */
    m = d.match(RE_ANH_DON);
    if (m) {
      ctx.tho.push(m[1]);
      ra.push(theAnh({ alt: m[1], src: m[2], cap: m[3], br: m[4] }, ctx));
      i++; continue;
    }

    /* ── vạch ngang ── */
    if (RE_HR.test(d)) { ra.push('<hr>'); i++; continue; }

    /* ── trích dẫn ── */
    if (RE_QUOTE.test(d)) {
      const than = [];
      while (i < dong.length &&
             (RE_QUOTE.test(dong[i]) ||
              (than.length && dong[i].trim() && !batDauKhoi(dong[i])))) {
        const mq = dong[i].match(RE_QUOTE);
        than.push(mq ? mq[1] : dong[i]);
        i++;
      }
      ra.push('<blockquote>' + docKhoi(than, ctx, sau + 1) + '</blockquote>');
      continue;
    }

    /* ── bảng ── */
    if (RE_TABLE.test(d) && i + 1 < dong.length && RE_ALIGN.test(dong[i + 1])) {
      const hang = [];
      while (i < dong.length && RE_TABLE.test(dong[i])) { hang.push(dong[i]); i++; }
      let lopTo = '';
      if (i < dong.length && RE_TO_BANG.test(dong[i])) { lopTo = dong[i]; i++; }
      ra.push(bang(hang, ctx, lopTo));
      continue;
    }

    /* ── danh sách ── */
    if (RE_UL.test(d) || RE_OL.test(d)) {
      const than = [];
      while (i < dong.length &&
             (RE_UL.test(dong[i]) || RE_OL.test(dong[i]) ||
              (dong[i].trim() && /^\s{2,}/.test(dong[i])))) { than.push(dong[i]); i++; }
      ra.push(danhSach(than, ctx));
      continue;
    }

    /* ── HTML viết thẳng: giữ nguyên tới dòng trống ── */
    if (RE_HTML.test(d)) {
      const than = [];
      while (i < dong.length && dong[i].trim()) { than.push(dong[i]); i++; }
      ra.push(than.join('\n'));
      continue;
    }

    /* ── đoạn văn ── */
    const p = [];
    while (i < dong.length && dong[i].trim() && !batDauKhoi(dong[i]) &&
           !RE_ANH_DON.test(dong[i]) &&
           !(RE_TABLE.test(dong[i]) && RE_ALIGN.test(dong[i + 1] || ''))) {
      p.push(dong[i]); i++;
    }
    if (p.length) {
      const raw = p.join('\n');
      ctx.tho.push(tran(raw));
      const { lop, con } = tachLop(raw);
      /* Đoạn đầu tiên của bài mặc định là SAPO — cỡ chữ lớn hơn, màu nhạt hơn,
         để mắt có chỗ bám khi vừa vào bài. Tắt bằng {.thuong} ở cuối đoạn. */
      const laSapo = sau === 0 && !ctx.coSapo && !ctx.khongSapo && !lop.includes('thuong');
      if (sau === 0) ctx.coSapo = true;
      const cls = lop.filter((c) => c !== 'thuong');
      if (laSapo && !cls.length) cls.push('lead');
      ra.push('<p' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' +
              inline(lop.length ? con : raw, ctx) + '</p>');
    }
  }
  return ra.join('\n');
}

function boc(loai, nhan, than, ctx, sau) {
  if (loai === 'gallery' || loai === 'anh') {
    const lop = nhan.split(/\s+/).filter(Boolean).map((x) => x.replace(/^\./, ''));
    return '<div class="gallery ' + lop.join(' ') + '">' +
           docKhoi(than, ctx, sau + 1) + '</div>';
  }
  if (loai === 'wide' || loai === 'full') {
    return '<div class="' + loai + '">' + docKhoi(than, ctx, sau + 1) + '</div>';
  }
  if (loai in NHAN_CALLOUT || loai === 'callout') {
    const kieu = loai === 'callout' ? 'note' : loai;
    return '<div class="callout callout--' + kieu + '">' +
           '<b class="callout-lab">' + escapeHtml(nhan || NHAN_CALLOUT[kieu]) + '</b>' +
           docKhoi(than, ctx, sau + 1) + '</div>';
  }
  if (ctx.canhBao) {
    ctx.canhBao('không hiểu khối ":::' + loai +
      '" — chỉ nhận: note, tip, warn, stop, gallery, wide, full');
  }
  return docKhoi(than, ctx, sau);
}

/* ── TÔ MÀU HÀNG / CỘT ──
   Dòng `{.to-hang-2 .to-cot-3}` đứng NGAY dưới bảng tô nền hàng thân thứ 2 và
   cột thứ 3. Vẫn là một dòng đọc được bằng mắt trong file .md — cùng họ với
   `{.wide}` ở đuôi ảnh — và bảng không có dòng ấy thì y như cũ. Ô soạn thảo
   ghi dòng này qua nút "Shade row / column" trên thanh bảng. */
const RE_TO_BANG = /^\s*\{((?:\s*\.to-(?:hang|cot)-\d+)+)\s*\}\s*$/;

function bang(hang, ctx, lopTo) {
  const to = new Set();
  for (const m of String(lopTo || '').matchAll(/\.to-(hang|cot)-(\d+)/g)) to.add(m[1] + m[2]);
  const oTo = (r, j) => (to.has('cot' + (j + 1)) || (r > 0 && to.has('hang' + r)));
  const oCua = (d) => d.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
  const dau = oCua(hang[0]);
  const canh = oCua(hang[1]).map((s) =>
    s.startsWith(':') && s.endsWith(':') ? 'center' : s.endsWith(':') ? 'right' : '');
  const than = hang.slice(2).map(oCua);
  const st = (j) => (canh[j] ? ' style="text-align:' + canh[j] + '"' : '');
  const lp = (r, j) => (oTo(r, j) ? ' class="to"' : '');

  /* ── BỀ RỘNG CỘT ĐỌC TỪ SỐ DẤU GẠCH ──
     `|---|----------|` thì cột hai rộng gấp hơn ba lần cột một. Không phải
     một cú pháp mới phải học: ai gõ bảng bằng tay vẫn gõ y như cũ, còn ai
     muốn chỉnh thì kéo dài hàng gạch ra — thứ nhìn thẳng vào mã nguồn là
     thấy, không cần đọc tài liệu.

     CHỈ sinh `<colgroup>` khi các cột khai khác nhau. Mọi bảng đã viết đều
     dùng số gạch bằng nhau (hoặc `---` cả loạt), nên chúng không đổi một
     pixel nào — và một `<colgroup>` chia đều tay thì còn tệ hơn là không có,
     vì nó khoá luôn cách trình duyệt tự cân cột theo nội dung. */
  const soGach = oCua(hang[1]).map((x) => (x.match(/-/g) || []).length);
  const deu = soGach.every((n) => n === soGach[0]);
  const tong = soGach.reduce((a, b) => a + b, 0);
  const cot = (deu || !tong) ? '' :
    '<colgroup>' + soGach.map((n) =>
      `<col style="width:${(n / tong * 100).toFixed(2)}%">`).join('') + '</colgroup>';

  ctx.tho.push(tran(hang.join(' ')));
  return '<div class="table-wrap"><table>' + cot + '<thead><tr>' +
    dau.map((c, j) => '<th' + lp(0, j) + st(j) + '>' + inline(c, ctx) + '</th>').join('') +
    '</tr></thead><tbody>' +
    than.map((r, ri) => '<tr>' +
      r.map((c, j) => '<td' + lp(ri + 1, j) + st(j) + '>' + inline(c, ctx) + '</td>').join('') +
      '</tr>').join('') +
    '</tbody></table></div>';
}

function danhSach(dong, ctx) {
  const d0 = dong[0];
  const co = RE_OL.test(d0);
  const thut0 = (d0.match(/^\s*/) || [''])[0].length;
  const muc = [];
  let hien = null;

  for (const d of dong) {
    const mu = d.match(RE_UL), mo = d.match(RE_OL);
    const m = mu || mo;
    const thut = m ? m[1].length : (d.match(/^\s*/) || [''])[0].length;

    if (m && thut <= thut0 + 1) {
      hien = { chu: mu ? mu[2] : mo[3], con: [] };
      muc.push(hien);
    } else if (hien) {
      /* Dòng thụt sâu hơn thuộc về mục đang mở. Cắt bớt đúng phần thụt của mục
         cha rồi đệ quy, nhờ vậy danh sách con lồng bao nhiêu tầng cũng được. */
      hien.con.push(d.slice(Math.min(thut, thut0 + 2)));
    }
  }
  const the = co ? 'ol' : 'ul';
  const batDau = co ? Number(d0.match(RE_OL)[2]) : null;
  ctx.tho.push(tran(dong.join(' ')));

  const li = muc.map((mc) => {
    /* [ ] và [x] ở đầu mục → ô đánh dấu việc cần làm.
       Lớp đặt trên TỪNG MỤC chứ không trên cả danh sách: một danh sách trộn
       lẫn mục có ô và mục thường thì mục thường vẫn giữ được dấu ✦ của nó. */
    const tick = mc.chu.match(/^\[([ xX])\]\s+(.*)$/);
    const cls = tick ? ' class="tick' + (tick[1].toLowerCase() === 'x' ? ' done' : '') + '"' : '';
    const chu = tick ? tick[2] : mc.chu;
    const con = mc.con.some((x) => x.trim()) ? docKhoi(mc.con, ctx, 1) : '';
    return '<li' + cls + '>' + inline(chu, ctx) + con + '</li>';
  }).join('');

  /* Bỏ hẳn lề trái chỉ khi MỌI mục đều có ô đánh dấu — danh sách trộn lẫn mà
     bỏ lề thì các mục thường mất chỗ treo dấu đầu dòng. */
  const coTick = muc.length > 0 && muc.every((mc) => /^\[[ xX]\]\s/.test(mc.chu));
  return '<' + the + (coTick ? ' class="task"' : '') +
         (batDau && batDau !== 1 ? ' start="' + batDau + '"' : '') + '>' +
         li + '</' + the + '>';
}

/* ══════════════ 5. CỬA CHÍNH ══════════════ */

export function render(src, opts) {
  opts = opts || {};
  const ctx = {
    coFile: typeof opts.coFile === 'function' ? opts.coFile : null,
    doAnh: typeof opts.doAnh === 'function' ? opts.doAnh : null,
    base: opts.base || '',
    host: opts.host || GIU,
    canhBao: opts.canhBao || null,
    khongSapo: !!opts.khongSapo,
    ids: new Set(opts.ids || []),
    headings: [],
    tho: [],
    coSapo: false
  };
  const html = docKhoi(String(src).replace(/\r\n?/g, '\n').split('\n'), ctx, 0);
  return {
    html,
    headings: ctx.headings,
    tho: ctx.tho.join(' ').replace(/\s+/g, ' ').trim()
  };
}
