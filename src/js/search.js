/* ============================================================
   TÌM KIẾM — chạy hoàn toàn trong trình duyệt.

   Không có máy chủ tìm kiếm nào cả. Build đã ghi sẵn `search-index.json`;
   trang tải file đó đúng MỘT lần rồi lọc tại chỗ. Với một blog cá nhân (vài
   trăm bài) cách này nhanh hơn gọi mạng, chạy được offline sau lần đầu, và
   không tốn đồng nào.

   Khi nào phải đổi cách: chỉ mục vượt khoảng 1MB. Lúc đó mới cần cắt trang
   hoặc dựng chỉ mục đảo. Vài trăm bài thì còn lâu mới tới.

   BA ĐIỂM ĐÁNG NHỚ

   1. GÕ KHÔNG DẤU VẪN RA. Build kèm sẵn trường `kd` — bản bỏ dấu, viết thường
      của tiêu đề + tóm tắt + tag. Gõ "tam ly" ra "tâm lý". Người Việt gõ vội
      thì hiếm khi bỏ dấu đầy đủ, mà bắt gõ đúng dấu mới tìm được thì coi như
      không có tìm kiếm.

   2. XẾP HẠNG THEO CHỖ TRÚNG, KHÔNG PHẢI THEO NGÀY. Trúng ở tiêu đề đáng giá
      hơn trúng ở thân bài rất nhiều. Xếp theo ngày thì một bài chỉ nhắc thoáng
      qua từ khoá lại đứng trên bài viết hẳn về nó.

   3. KHÔNG CHÈN BẰNG innerHTML VỚI CHỮ NGƯỜI DÙNG GÕ. Phần tô sáng có escape
      trước rồi mới bọc thẻ <mark>.
   ============================================================ */
(function () {
  'use strict';

  var o    = document.getElementById('tk-o');
  var kq   = document.getElementById('tk-kq');
  var loc  = document.getElementById('tk-loc');
  if (!o || !kq) return;

  var dem  = document.querySelector('.tk-dem');
  var xoa  = document.querySelector('.tk-xoa');
  var goc  = document.documentElement.getAttribute('data-base') || '';

  var DU = null, dangTai = false;
  var locTag = '';          /* chip chủ đề đang bật */

  /* ── BỎ DẤU ──
     Phải khớp ĐÚNG cách build tạo trường `kd`, không thì gõ không dấu ra
     không khớp gì cả. NFD tách nguyên âm khỏi dấu, rồi bỏ dải dấu thanh;
     đ/Đ không có dạng tách nên phải thay riêng. */
  function boDau(s) {
    return String(s).normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  }

  function an(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Tô sáng chỗ trùng. ESCAPE TRƯỚC rồi mới chèn <mark> — làm ngược lại thì
     một dấu < trong tiêu đề bài mở được thẻ thật. Dò trên bản BỎ DẤU nhưng
     cắt trên bản GỐC, nhờ vậy gõ "tam ly" vẫn tô đúng chữ "tâm lý". */
  function toSang(chu, tu) {
    if (!tu) return an(chu);
    var kd = boDau(chu), ra = '', i = 0;
    while (i < chu.length) {
      var j = kd.indexOf(tu, i);
      if (j < 0) { ra += an(chu.slice(i)); break; }
      ra += an(chu.slice(i, j)) + '<mark>' + an(chu.slice(j, j + tu.length)) + '</mark>';
      i = j + tu.length;
    }
    return ra;
  }

  function nhan(k, n) {
    var b = { results: '{n} results', oneResult: '1 result',
              noResults: 'Nothing matched.', typeMore: 'Keep typing…' };
    return b[k].replace('{n}', n);
  }

  /* ── TẢI CHỈ MỤC ──
     Chỉ tải khi người ta bắt đầu gõ, không tải ngay lúc mở trang: phần lớn
     người vào trang tìm kiếm rồi lại bấm ra chỗ khác. */
  function tai() {
    if (DU || dangTai) return Promise.resolve();
    dangTai = true;
    return fetch(goc + '/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { DU = d || []; veChip(); })
      .catch(function () { DU = []; })
      .finally(function () { dangTai = false; });
  }

  /* Chip chủ đề dựng từ chính chỉ mục — không phải khai thêm ở đâu. */
  function veChip() {
    if (!loc || !DU) return;
    var d = {};
    DU.forEach(function (b) { (b.tags || []).forEach(function (t) { d[t] = (d[t] || 0) + 1; }); });
    var ds = Object.keys(d).sort(function (a, b) { return d[b] - d[a]; }).slice(0, 8);
    loc.textContent = '';
    ds.forEach(function (t) {
      var n = document.createElement('button');
      n.type = 'button';
      n.className = 'chip' + (locTag === t ? ' chip--nay' : '');
      n.textContent = t;
      var s = document.createElement('span');
      s.className = 'chip-so'; s.textContent = d[t];
      n.appendChild(s);
      n.addEventListener('click', function () {
        locTag = (locTag === t) ? '' : t;   /* bấm lại chip đang bật thì tắt lọc */
        veChip(); chay();
      });
      loc.appendChild(n);
    });
  }

  /* ── CHẠY TÌM ── */
  function chay() {
    var tu = boDau(o.value.trim());
    if (xoa) xoa.hidden = !o.value;

    if (!DU) { tai().then(chay); return; }

    /* Chưa gõ gì mà cũng chưa lọc tag ⇒ chưa có gì để hiện. */
    if (!tu && !locTag) {
      kq.textContent = ''; if (dem) dem.textContent = '';
      return;
    }
    /* Một ký tự thì gần như bài nào cũng trúng — chờ thêm. */
    if (tu && tu.length < 2 && !locTag) {
      kq.textContent = ''; if (dem) dem.textContent = nhan('typeMore');
      return;
    }

    var ra = [];
    for (var i = 0; i < DU.length; i++) {
      var b = DU[i];
      if (locTag && (b.tags || []).indexOf(locTag) < 0) continue;

      var diem = 0;
      if (tu) {
        var tieuDe = boDau(b.title);
        var tags   = boDau((b.tags || []).join(' '));
        var muc    = boDau((b.muc || []).join(' '));
        var tom    = boDau(b.summary || '');

        /* Thang điểm: trúng ở tiêu đề đáng giá hơn trúng ở thân bài rất nhiều.
           Trúng ĐẦU tiêu đề còn hơn nữa — gõ "vô thức" thì bài tên
           "Vô thức tập thể" phải đứng trên bài chỉ nhắc chữ đó ở giữa. */
        if (tieuDe.indexOf(tu) === 0) diem += 100;
        else if (tieuDe.indexOf(tu) >= 0) diem += 60;
        if (tags.indexOf(tu) >= 0) diem += 40;
        if (muc.indexOf(tu) >= 0)  diem += 30;
        if (tom.indexOf(tu) >= 0)  diem += 15;
        if ((b.kd || '').indexOf(tu) >= 0) diem += 8;
        if (boDau(b.tho || '').indexOf(tu) >= 0) diem += 4;
        if (!diem) continue;
      } else {
        diem = 1;
      }
      ra.push({ b: b, diem: diem });
    }

    /* Điểm bằng nhau thì bài mới hơn lên trước. */
    ra.sort(function (x, y) { return y.diem - x.diem || (x.b.date < y.b.date ? 1 : -1); });

    if (dem) {
      dem.textContent = ra.length === 0 ? nhan('noResults')
        : ra.length === 1 ? nhan('oneResult') : nhan('results', ra.length);
    }
    ve(ra, tu);
  }

  function ve(ra, tu) {
    kq.textContent = '';
    var manh = document.createDocumentFragment();
    ra.slice(0, 40).forEach(function (x) {
      var b = x.b;
      var el = document.createElement('article');
      el.className = 'card the-bai';

      var meta = document.createElement('div');
      meta.className = 'meta-row';
      var t = document.createElement('time');
      t.dateTime = b.date; t.textContent = ngay(b.date);
      meta.appendChild(t);
      if (b.muc && b.muc.length) {
        /* Không chèn thẻ dấu chấm: dấu ngăn do CSS vẽ bằng `::before` của
           chính mục phía sau, nên gãy dòng thì dấu đi theo chữ. Xem
           `.meta-row > * + *::before` trong components.css. */
        var m = document.createElement('span');
        m.textContent = b.muc[b.muc.length - 1];
        meta.appendChild(m);
      }

      var h = document.createElement('h3');
      var a = document.createElement('a');
      a.className = 'stretch'; a.href = b.url;
      a.innerHTML = toSang(b.title, tu);      /* toSang đã escape bên trong */
      h.appendChild(a);

      var p = document.createElement('p');
      p.className = 'the-tom';
      p.innerHTML = toSang(cat(b.summary, 150), tu);

      el.appendChild(meta); el.appendChild(h); el.appendChild(p);

      if (b.tags && b.tags.length) {
        var hang = document.createElement('div');
        hang.className = 'tag-row';
        b.tags.slice(0, 3).forEach(function (x2) {
          var s = document.createElement('span');
          s.className = 'tag tag--tinh'; s.textContent = x2;
          hang.appendChild(s);
        });
        el.appendChild(hang);
      }
      manh.appendChild(el);
    });
    kq.appendChild(manh);
  }

  function cat(s, n) {
    s = String(s || '');
    if (s.length <= n) return s;
    var c = s.slice(0, n);
    var k = c.lastIndexOf(' ');
    return (k > n * 0.6 ? c.slice(0, k) : c) + '…';
  }

  function ngay(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ── NỐI SỰ KIỆN ──
     Hoãn 120ms sau mỗi phím: gõ nhanh một từ tám chữ mà chạy tám lượt lọc thì
     bảy lượt đầu vứt đi. Đủ ngắn để không ai thấy trễ. */
  var hen = null;
  o.addEventListener('input', function () {
    clearTimeout(hen);
    hen = setTimeout(chay, 120);
  });
  o.addEventListener('focus', tai, { once: true });

  if (xoa) {
    xoa.addEventListener('click', function () {
      o.value = ''; locTag = ''; veChip(); chay(); o.focus();
    });
  }

  /* Vào thẳng /search/?q=… từ chỗ khác — ví dụ một link chia sẻ. */
  var q = new URLSearchParams(location.search).get('q');
  if (q) { o.value = q; tai().then(chay); }
})();
