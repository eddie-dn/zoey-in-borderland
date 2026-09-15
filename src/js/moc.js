/* ============================================================
   MỐC — đổi ngày tuyệt đối thành "3 days ago".

   ── VÌ SAO KHÔNG NƯỚNG SẴN CHỮ TƯƠNG ĐỐI VÀO HTML ──────────────────────
   Trang này là HTML tĩnh nằm trên CDN. Nướng sẵn "15 mins ago" thì dòng ấy
   đứng nguyên ở đó cho tới lần dựng sau — có thể là hàng tháng. Một con số
   thời gian SAI còn tệ hơn không có con số nào.

   Nên HTML ghi ngày TUYỆT ĐỐI ("Updated 15 Sep 2026"), và file này đổi nó
   sang tương đối ngay trên máy người đọc. Ai tắt JavaScript vẫn đọc được
   ngày đầy đủ — mất phần tiện, không mất thông tin.

   ── TỰ LÀM THAY VÌ DÙNG Intl.RelativeTimeFormat ────────────────────────
   API ấy có sẵn trong trình duyệt và làm đúng việc này. Không dùng vì chữ
   hiển thị của trang nằm trong MỘT bảng duy nhất (biến NHAN ở đầu
   tools/build.mjs) — để Intl tự sinh chữ là có một góc giao diện nói thứ
   tiếng khác với phần còn lại, và đổi cách gọi thì không sửa được ở đâu cả.
   ============================================================ */
(function () {
  'use strict';

  var o = document.querySelectorAll('[data-moc]');
  if (!o.length) return;

  var N = {};
  try { N = JSON.parse(document.documentElement.getAttribute('data-thoi') || '{}'); } catch (e) {}
  if (!N.ago) return;                       /* không có bảng chữ thì để nguyên ngày */

  /* Bậc thang đơn vị. Mỗi bậc: số giây, tên ít, tên nhiều.
     Dừng ở "năm" — "3 decades ago" thì đúng mà không ai cần. */
  var BAC = [
    [31536000, N.year, N.years],
    [2592000,  N.month, N.months],
    [86400,    N.day, N.days],
    [3600,     N.hour, N.hours],
    [60,       N.min, N.mins]
  ];

  function chu(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return null;
    var giay = Math.floor((Date.now() - t) / 1000);
    /* Mốc ở TƯƠNG LAI (đồng hồ máy người đọc chạy chậm, hoặc bài hẹn giờ):
       đừng ghi "-2 hours ago". Coi như vừa xong. */
    if (giay < 60) return N.now;

    for (var i = 0; i < BAC.length; i++) {
      var n = Math.floor(giay / BAC[i][0]);
      if (n >= 1) {
        var mau = (n === 1 ? BAC[i][1] : BAC[i][2]) || '{n}';
        return N.ago.replace('{t}', mau.replace('{n}', n));
      }
    }
    return N.now;
  }

  function ve() {
    for (var i = 0; i < o.length; i++) {
      var el = o[i];
      var c = chu(el.getAttribute('data-moc'));
      if (!c) continue;
      /* Giữ lại chữ "Updated" ở đầu — nó nằm sẵn trong HTML, không dựng lại. */
      if (!el.dataset.dau) el.dataset.dau = (el.textContent.split(/\s+/)[0] || '');
      el.textContent = el.dataset.dau ? el.dataset.dau + ' ' + c : c;
      /* Ngày đầy đủ vẫn còn, ở tooltip — "3 months ago" tiện để liếc, nhưng ai
         muốn biết chính xác ngày nào thì phải có đường lấy ra. */
      if (!el.title) el.title = el.getAttribute('data-moc').slice(0, 10);
    }
  }

  ve();
  /* Vẽ lại mỗi phút: người mở tab từ sáng tới chiều vẫn thấy con số đúng.
     Một phút là đủ mịn cho mọi bậc — bậc nhỏ nhất đã là phút. */
  setInterval(ve, 60000);
})();
