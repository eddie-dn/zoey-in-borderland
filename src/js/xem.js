/* ============================================================
   XEM — xin con số lượt xem về và in vào hàng meta.

   ── VÌ SAO KHÔNG NƯỚNG SẴN CON SỐ VÀO HTML ─────────────────────────────
   Trang này là HTML tĩnh nằm trên CDN, có khi hàng tuần mới dựng lại. Nướng
   sẵn một con số vào đó thì nó đứng yên từ lúc dựng — mà lượt xem là thứ
   DUY NHẤT trên trang này bắt buộc phải luôn mới. Nên HTML để ô trống và
   ẩn sẵn; file này xin số về rồi mới hiện ô ra.

   Hỏng kiểu gì cũng im lặng: ô ở nguyên trạng thái ẩn, hàng meta ngắn đi
   một mục, không có dòng đỏ nào trong console của người đọc. Một tính năng
   phụ không được phép làm trang trông như hỏng.

   ── MỘT LƯỢT GHÉ TÍNH MỘT LẦN ──────────────────────────────────────────
   Tải lại trang trong cùng một phiên KHÔNG cộng thêm — đánh dấu bằng
   sessionStorage. Không chặn được người mở tab mới hay bot biết chạy
   JavaScript, và không giả vờ là chặn được: đây là con số gần đúng.
   ============================================================ */
(function () {
  'use strict';

  var o = document.querySelectorAll('[data-xem]');
  if (!o.length) return;

  var api = document.documentElement.getAttribute('data-xem-api');
  if (!api) return;

  var N = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-xem-nhan') || '{}'); } catch (e) {}

  function hien(el, so) {
    if (!(so > 0)) return;                 /* 0 lượt thì đừng khoe con số 0 */
    var mau = so === 1 ? (N.one || '1 view') : (N.many || '{n} views');
    el.textContent = mau.replace('{n}', so.toLocaleString());
    el.hidden = false;
  }

  /* TRANG BÀI: đúng một ô, và ô ấy là trang đang mở → cộng một lượt.
     TRANG DANH SÁCH: nhiều ô, không ô nào là trang đang mở → chỉ đọc, và đọc
     GỘP một lần cho cả danh sách. Gọi ba chục lần cho ba chục thẻ thì vừa chậm
     vừa tốn hạn ngạch mà chẳng được gì thêm. */
  var day = window.location.pathname;
  var minh = null;
  for (var i = 0; i < o.length; i++) {
    if (o[i].getAttribute('data-xem') === day) { minh = o[i]; break; }
  }

  if (minh && o.length === 1) {
    var khoa = 'zoey:xem:' + day;
    var daGhi = false;
    try { daGhi = sessionStorage.getItem(khoa) === '1'; } catch (e) {}
    fetch(api + '?u=' + encodeURIComponent(day) + (daGhi ? '' : '&ghi=1'))
      .then(function (r) { return r.json(); })
      .then(function (k) {
        if (k && !k.tat) {
          hien(minh, k.so);
          try { sessionStorage.setItem(khoa, '1'); } catch (e) {}
        }
      })
      .catch(function () {});
    return;
  }

  var ds = [];
  for (i = 0; i < o.length; i++) ds.push(o[i].getAttribute('data-xem'));
  fetch(api + '?ds=' + encodeURIComponent(ds.join(',')))
    .then(function (r) { return r.json(); })
    .then(function (k) {
      if (!k || k.tat || !k.so) return;
      for (var j = 0; j < o.length; j++) hien(o[j], k.so[o[j].getAttribute('data-xem')] || 0);
    })
    .catch(function () {});
})();
