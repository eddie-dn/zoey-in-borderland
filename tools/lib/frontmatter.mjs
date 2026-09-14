/* ============================================================
   FRONT MATTER — đọc khối --- ở đầu file .md, và KIỂM BÀI.

   Đây cố tình KHÔNG phải bộ đọc YAML đầy đủ. Nó nhận đúng những dạng một bài
   blog cần: chuỗi, số, đúng/sai, mảng một dòng, mảng nhiều dòng. Đổi lại là
   không có gói ngoài nào, và báo lỗi đọc được bằng tiếng người.
   ============================================================ */
import { slugify } from './text.mjs';

/* ── Các field BẮT BUỘC. Thiếu một cái là build dừng, không đăng bài lỗi. ── */
export const BAT_BUOC = ['title', 'date'];

/* ── Các field NÊN có. Thiếu thì chỉ cảnh báo, bài vẫn ra. ── */
export const NEN_CO = {
  summary : 'Không có tóm tắt thì thẻ bài và phần chia sẻ lên mạng xã hội sẽ lấy 170 chữ đầu của bài — thường là câu dở dang.',
  tags    : 'Không gắn tag thì bài này sẽ không xuất hiện ở bất kỳ trang tag nào, về sau rất khó tìm lại.',
  cover   : 'Không có ảnh bìa thì link chia sẻ lên Facebook/Zalo ra một ô trắng trơn.'
};

const BOOL = { true:true, 'true':true, yes:true, 'có':true, false:false, 'false':false, no:false, 'không':false };

function docGiaTri(raw){
  let v = raw.trim();
  if(v === '') return '';
  /* Chuỗi trong nháy: giữ nguyên mọi thứ bên trong, kể cả dấu # của comment */
  if((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'")){
    return v.slice(1, -1);
  }
  /* Bỏ comment cuối dòng, nhưng chỉ khi dấu # có khoảng trắng đứng trước —
     không thì "màu: #F4E7FB" bị cắt mất giá trị. */
  v = v.replace(/\s+#.*$/, '').trim();
  if(v[0] === '[' && v.at(-1) === ']'){
    return v.slice(1, -1).split(',')
      .map(x => x.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  const low = v.toLowerCase();
  if(low in BOOL) return BOOL[low];
  if(/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

export function docFrontMatter(raw, duongDan = '?'){
  const m = raw.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if(!m){
    throw new Error(
      `${duongDan}: không tìm thấy khối front matter.\n` +
      `  Bài phải mở đầu bằng đúng ba gạch ngang "---" ở DÒNG ĐẦU TIÊN, không có dòng trống phía trên.`
    );
  }
  const data = {};
  let keyMang = null;

  for(const dong of m[1].split(/\r?\n/)){
    if(!dong.trim() || /^\s*#/.test(dong)) continue;

    /* Dòng của mảng nhiều dòng: "  - tâm lý" */
    const item = dong.match(/^\s*-\s+(.*)$/);
    if(item && keyMang){
      data[keyMang].push(String(docGiaTri(item[1])));
      continue;
    }
    const kv = dong.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if(!kv){ keyMang = null; continue; }

    const [, key, phanSau] = kv;
    if(phanSau.trim() === ''){        /* mở đầu một mảng nhiều dòng */
      data[key] = []; keyMang = key;
    }else{
      data[key] = docGiaTri(phanSau); keyMang = null;
    }
  }
  return { data, than: raw.slice(m[0].length) };
}

/* ── KIỂM BÀI ──
   Trả về { loi:[], canhBao:[] }. Build dừng khi có `loi`, chỉ in ra khi có `canhBao`.
   Đây chính là bảng kiểm "một bài đăng cần có gì" trong docs/HUONG-DAN-DANG-BAI.md
   — sửa ở đây thì nhớ sửa cả bên đó. */
export function kiemBai(fm, duongDan, than){
  const loi = [], canhBao = [];

  for(const k of BAT_BUOC){
    if(fm[k] === undefined || fm[k] === '') loi.push(`thiếu \`${k}\` — đây là field bắt buộc`);
  }
  if(fm.date !== undefined && isNaN(new Date(fm.date))){
    loi.push(`\`date: ${fm.date}\` không phải ngày hợp lệ — viết dạng YYYY-MM-DD, ví dụ 2026-09-14`);
  }
  if(fm.updated !== undefined && fm.updated !== '' && isNaN(new Date(fm.updated))){
    loi.push(`\`updated: ${fm.updated}\` không phải ngày hợp lệ`);
  }
  if(fm.slug && slugify(fm.slug) !== String(fm.slug)){
    loi.push(`\`slug: ${fm.slug}\` có ký tự không dùng được trên URL — nên là "${slugify(fm.slug)}"`);
  }
  if(fm.tags !== undefined && !Array.isArray(fm.tags)){
    loi.push('`tags` phải là một mảng — viết `tags: [tâm lý, jung]` hoặc xuống dòng gạch đầu dòng');
  }
  if(fm.cover && !String(fm.cover).startsWith('/') && !/^https?:/.test(fm.cover)){
    loi.push(`\`cover: ${fm.cover}\` phải bắt đầu bằng "/" (tính từ thư mục public/) hoặc là một URL đầy đủ`);
  }

  for(const [k, viSao] of Object.entries(NEN_CO)){
    const v = fm[k];
    const trong = v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    if(trong) canhBao.push(`chưa có \`${k}\` — ${viSao}`);
  }
  if(Array.isArray(fm.tags) && fm.tags.length > 6){
    canhBao.push(`gắn ${fm.tags.length} tag là hơi nhiều; 2–5 tag thì trang tag mới còn gom được bài lại với nhau`);
  }
  if(fm.cover && !fm.coverAlt){
    canhBao.push('có `cover` nhưng chưa có `coverAlt` — trình đọc màn hình sẽ đọc ảnh bìa thành một khoảng lặng');
  }
  if(fm.summary && String(fm.summary).length > 200){
    canhBao.push(`\`summary\` dài ${String(fm.summary).length} ký tự; Facebook cắt còn khoảng 160 — nên gói trong 160`);
  }
  if(than.trim().length < 120){
    canhBao.push('thân bài rất ngắn (dưới 120 ký tự) — có phải bài còn đang viết dở không?');
  }
  /* Ảnh không có alt: bắt ngay từ khâu build, vì lúc đọc lại bài không ai nhớ */
  const thieuAlt = [...than.matchAll(/!\[\s*\]\(([^)\s]+)/g)].map(x => x[1]);
  if(thieuAlt.length){
    canhBao.push(`${thieuAlt.length} ảnh chưa có chữ alt (${thieuAlt.slice(0,2).join(', ')}${thieuAlt.length>2?'…':''}) — điền vào giữa hai dấu ngoặc vuông`);
  }
  return { loi, canhBao };
}
