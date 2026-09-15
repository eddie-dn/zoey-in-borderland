/* ============================================================
   BĂNG ẢNH — hàng chấm và hai nút cho băng ảnh của khung C.

   ── FILE NÀY CHỈ LÀ PHẦN THÊM ──────────────────────────────────────────
   Việc trượt do CSS `scroll-snap` lo, không phải do đây. Nhờ vậy băng ảnh
   vuốt được trên điện thoại, lăn ngang được bằng chuột, kéo được thanh cuộn
   và đi được bằng phím mũi tên NGAY CẢ KHI file này không chạy — vì tất cả
   những thứ đó là hành vi có sẵn của trình duyệt.

   Thư viện carousel làm ngược lại: chặn cuộn thật rồi dựng lại bằng
   `transform`, sau đó phải tự vá lại từng thứ vừa phá — vuốt, phím, trợ
   năng, thanh cuộn. Ở đây không phá gì nên không phải vá gì.

   ── VÌ SAO DÙNG IntersectionObserver ĐỂ BIẾT ĐANG Ở TẤM NÀO ────────────
   Cách hiển nhiên là nghe `scroll` rồi chia `scrollLeft` cho bề rộng tấm.
   Nó sai ở hai chỗ: `scroll` bắn hàng chục lần mỗi giây (tốn pin), và phép
   chia ấy giả định mọi tấm rộng bằng nhau — đúng hôm nay, sai ngay khi có
   ai đổi bố cục. IntersectionObserver hỏi thẳng trình duyệt "tấm nào đang
   nằm giữa khung", và nó chỉ báo khi câu trả lời ĐỔI.
   ============================================================ */
(function () {
  'use strict';

  var ds = document.querySelectorAll('[data-bang]');
  if (!ds.length) return;

  function dung(hop) {
    var cuon = hop.querySelector('.ba-cuon');
    var tam = [].slice.call(hop.querySelectorAll('.ba-tam'));
    if (!cuon || tam.length < 2) return;      /* một tấm thì không phải băng */

    var nhan = {};
    try { nhan = JSON.parse(hop.getAttribute('data-nhan') || '{}'); } catch (e) {}

    var nay = 0;

    var dieu = document.createElement('div');
    dieu.className = 'ba-dieu';

    var cham = document.createElement('div');
    cham.className = 'ba-cham';
    var nutCham = tam.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (nhan.of || '{n}/{m}')
        .replace('{n}', i + 1).replace('{m}', tam.length));
      b.addEventListener('click', function () { di(i); });
      cham.appendChild(b);
      return b;
    });

    var hopNut = document.createElement('div');
    hopNut.className = 'ba-nut';
    var lui = nut('‹', nhan.prev || 'Previous', -1);
    var toi = nut('›', nhan.next || 'Next', 1);
    hopNut.appendChild(lui); hopNut.appendChild(toi);

    function nut(chu, nhanPhu, buoc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = chu;
      b.setAttribute('aria-label', nhanPhu);
      b.addEventListener('click', function () { di(nay + buoc); });
      return b;
    }

    dieu.appendChild(cham);
    dieu.appendChild(hopNut);
    hop.appendChild(dieu);

    function di(i) {
      i = Math.max(0, Math.min(tam.length - 1, i));
      /* Cuộn bằng `scrollIntoView` chứ không gán `scrollLeft`: nó tự lo phần
         tính toạ độ, tự tôn trọng `scroll-behavior:smooth` của CSS, và tự đúng
         cả khi trang đọc từ phải sang trái. */
      tam[i].scrollIntoView({ block: 'nearest', inline: 'start' });
    }

    function danhDau(i) {
      nay = i;
      for (var k = 0; k < nutCham.length; k++) {
        nutCham[k].setAttribute('aria-current', k === i ? 'true' : 'false');
      }
      lui.disabled = i === 0;
      toi.disabled = i === tam.length - 1;
    }

    danhDau(0);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (recs) {
        /* Lấy tấm CHE NHIỀU NHẤT, không lấy tấm đầu tiên lọt vào tầm: lúc đang
           trượt giữa hai tấm thì cả hai đều "lọt", và lấy bừa một cái làm hàng
           chấm nhấp nháy qua lại. */
        var tot = null;
        for (var i = 0; i < recs.length; i++) {
          if (!tot || recs[i].intersectionRatio > tot.intersectionRatio) tot = recs[i];
        }
        if (tot && tot.intersectionRatio > 0.55) danhDau(tam.indexOf(tot.target));
      }, { root: cuon, threshold: [0.25, 0.55, 0.85] });
      for (var i = 0; i < tam.length; i++) io.observe(tam[i]);
    }
  }

  for (var i = 0; i < ds.length; i++) dung(ds[i]);
})();
