/* ============================================================
   GHI CHÚ — lọc theo loại trên trang /notes/.

   Lọc ở TRÌNH DUYỆT chứ không dựng sẵn mỗi loại một trang: ghi chú là thứ
   ngắn và nhiều, dựng sẵn thì mỗi loại mới lại sinh thêm một thư mục. Và
   lọc tại chỗ thì bấm phát đổi ngay, không chờ mạng.

   Không có JavaScript: thấy ĐỦ mọi ghi chú, không có hàng nút lọc. Đó là
   trạng thái đúng — danh sách đầy đủ vẫn đọc được, chỉ là dài hơn.
   ============================================================ */
(function () {
  'use strict';

  var loc = document.querySelector('[data-gc-loc]');
  if (!loc) return;
  var mon = [].slice.call(document.querySelectorAll('.gc-mot'));
  if (!mon.length) return;

  var nut = [].slice.call(loc.querySelectorAll('button'));

  function chon(loai) {
    for (var i = 0; i < mon.length; i++) {
      mon[i].hidden = !!loai && mon[i].getAttribute('data-loai') !== loai;
    }
    for (i = 0; i < nut.length; i++) {
      var la = nut[i].getAttribute('data-loai') === loai;
      nut[i].classList.toggle('chip--nay', la);
      nut[i].setAttribute('aria-pressed', la ? 'true' : 'false');
    }
  }

  for (var i = 0; i < nut.length; i++) {
    nut[i].setAttribute('aria-pressed', nut[i].getAttribute('data-loai') ? 'false' : 'true');
    nut[i].addEventListener('click', function () {
      chon(this.getAttribute('data-loai'));
    });
  }
})();
