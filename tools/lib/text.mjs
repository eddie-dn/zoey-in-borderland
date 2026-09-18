/* ============================================================
   TEXT — cắt chữ, tạo slug, đếm phút đọc, định dạng ngày.
   Không phụ thuộc gói ngoài nào.
   ============================================================ */

/* Bỏ dấu tiếng Việt. NFD tách chữ và dấu thành hai ký tự rời, rồi xoá dải dấu.
   Riêng đ/Đ không phải chữ có dấu mà là một CHỮ CÁI KHÁC — NFD không đụng tới,
   phải thay tay. Thiếu dòng này thì "đường" ra slug "ng". */
export function boDau(s){
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export function slugify(s){
  return boDau(s)
    .toLowerCase()
    .replace(/['"'']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'khong-ten';
}

export function escapeHtml(s){
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
/* Dùng cho nội dung nhét vào thuộc tính HTML (alt, title, content của meta) */
export function attr(s){
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/* Phút đọc. 190 chữ/phút là nhịp đọc tiếng Việt trung bình của người đọc
   thường — chậm hơn con số 230 hay thấy cho tiếng Anh, vì tiếng Việt đơn âm,
   một ý mất nhiều "chữ" hơn. Luôn tối thiểu 1 phút. */
export function phutDoc(plain){
  const n = (plain.trim().match(/\S+/g) || []).length;
  return Math.max(1, Math.round(n / 190));
}

const THANG = ['01','02','03','04','05','06','07','08','09','10','11','12'];

/* "2026-09-14" → "14 Sep 2026". Phần khung trang dùng tiếng Anh để đồng bộ với
   nav, đường dẫn phân cấp và mấy nhãn khác; nội dung bài vẫn tiếng Việt.

   Cố tình KHÔNG dùng toLocaleDateString: hàm đó đọc theo cài đặt vùng của MÁY
   CHẠY BUILD, nên cùng một bài build ở hai máy khác nhau ra hai chuỗi khác nhau. */
const THANG_ANH = ['Jan','Feb','Mar','Apr','May','Jun',
                   'Jul','Aug','Sep','Oct','Nov','Dec'];
export function ngayAnh(iso){
  const d = new Date(iso);
  if(isNaN(d)) return String(iso);
  return `${d.getUTCDate()} ${THANG_ANH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/* Giữ lại bản tiếng Việt phòng khi muốn đổi phần khung về tiếng Việt */
export function ngayViet(iso){
  const d = new Date(iso);
  if(isNaN(d)) return String(iso);
  return `${d.getUTCDate()} tháng ${d.getUTCMonth() + 1}, ${d.getUTCFullYear()}`;
}
export function ngayISO(iso){
  const d = new Date(iso);
  if(isNaN(d)) return String(iso);
  return `${d.getUTCFullYear()}-${THANG[d.getUTCMonth()]}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
export function ngayTem(){
  const d = new Date();
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2,'0')}-${M[d.getMonth()]}-${d.getFullYear()}`;
}

/* Tóm tắt tự động khi bài quên khai `summary`. Cắt ở ranh giới TỪ, không cắt
   giữa chừng một chữ. */
export function tomTat(plain, max = 170){
  const s = plain.replace(/\s+/g, ' ').trim();
  if(s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
}

/* ============================================================
   NỐI CHỮ KHÔNG CHO XUỐNG DÒNG — dùng cho TIÊU ĐỀ

   Vấn đề: `text-wrap: balance` chia đều độ dài các dòng, nhưng nó không biết
   đâu là ranh giới Ý. Tiêu đề "Vô thức tập thể, và cái cớ để tin vào giấc mơ"
   bị bẻ thành "…và cái" / "cớ để tin…" — cắt đôi đúng giữa cụm "cái cớ".

   Cách chữa: dán từ CÔNG CỤ vào từ đứng ngay sau nó bằng khoảng trắng cứng.
   Tiếng Việt có hai nhóm không bao giờ nên đứng cuối dòng:
     · LOẠI TỪ   cái, con, chiếc, người, việc, điều… luôn đi với danh từ sau nó
     · TỪ NỐI    và, của, là, với, cho, từ, về, trong, như, mà, thì…

   Chỉ áp cho TIÊU ĐỀ, không áp cho thân bài: thân bài dòng nào cũng dài, dán
   thêm khoảng trắng cứng chỉ làm trình duyệt khó xuống dòng hơn mà mắt không
   nhận ra khác biệt gì.
   ============================================================ */
const TU_NOI = [
  'và','của','là','với','cho','từ','về','trong','như','mà','thì','ở','vì','nên',
  'một','những','các','mọi','từng','mỗi',
  'cái','con','chiếc','người','việc','điều','thứ','nơi','lúc','khi'
];
export function noiChu(s){
  let ra = String(s);
  for(const t of TU_NOI){
    /* Ranh giới từ hai đầu: không dán nhầm "cho" trong "chống" hay "và" trong "vàng" */
    ra = ra.replace(new RegExp(`(^|[\\s(“"'])(${t}) `, 'gi'), '$1$2\u00A0');
  }
  return ra;
}

/* ── TỈ LỆ KHUNG ẢNH, RÚT GỌN ──
   Ở đây chứ không ở `imgsize.mjs`, vì đây là một phép toán THUẦN: nó không
   đụng tới đĩa, không cần Node. `markdown.mjs` phải chạy được cả trong trình
   duyệt (xem chú thích đầu file ấy), nên mọi thứ nó cần đều phải thuần. */
export function tiLe(w, h){
  const ucln = (a, b) => b ? ucln(b, a % b) : a;
  const g = ucln(Math.round(w), Math.round(h)) || 1;
  return `${Math.round(w) / g} / ${Math.round(h) / g}`;
}
