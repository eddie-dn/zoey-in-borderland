/* ============================================================
   CHIA SẺ — một nút, hai đường đi.

   ── VÌ SAO KHÔNG PHẢI MỘT HÀNG ICON MẠNG XÃ HỘI ──────────────────────
   Cách quen thuộc là bày sẵn Facebook · X · Telegram · Mail. Bốn cái icon ấy
   nói với người đọc rằng blog này quan tâm tới bốn nền tảng đó — mà thật ra
   nó không quan tâm, và người đọc thì dùng đúng một chỗ trong bốn chỗ (hoặc
   một chỗ thứ năm không có trong hàng). Mỗi icon còn kéo theo một lượt gọi ra
   miền ngoài, tức là một điểm theo dấu người đọc mà trang này vốn tránh.

   Một nút thôi, rồi để HỆ ĐIỀU HÀNH bày ra danh sách của chính người đọc —
   đúng những chỗ họ thật sự dùng, kể cả AirDrop hay một ứng dụng ghi chú.

   ── MÁY BÀN THÌ KHÔNG CÓ BẢNG ẤY ──────────────────────────────────────
   `navigator.share` gần như chỉ có trên điện thoại. Máy bàn rơi về việc chép
   đường dẫn — và đó không phải giải pháp hạng hai: trên máy bàn, chép đường
   dẫn rồi tự dán vào đâu mình muốn CHÍNH LÀ cách người ta vẫn chia sẻ.

   ── BA TẦNG, VÌ CLIPBOARD KHÔNG PHẢI LÚC NÀO CŨNG CÓ ──────────────────
     1. navigator.share        điện thoại
     2. navigator.clipboard    máy bàn, trang chạy qua https
     3. execCommand('copy')    trang chạy qua http (dev, mạng nội bộ) — API
                               clipboard đòi ngữ cảnh an toàn, mà bản xem thử
                               ở localhost qua IP LAN thì không có.
   Tầng 3 trông cổ lỗ nhưng nó là tầng duy nhất chạy ở mọi nơi, và không có nó
   thì nút này im lặng không làm gì trên đúng bản xem thử của người viết.
   ============================================================ */
(function () {
  'use strict';

  var nut = document.querySelector('[data-chia]');
  if (!nut) return;

  var bao = document.querySelector('.cum-bao');
  var NHAN = {};
  try { NHAN = JSON.parse(nut.getAttribute('data-nhan') || '{}'); } catch (e) {}

  /* Báo bằng CHỮ ngay dưới cụm nút, không phải bằng một hộp thoại. Hộp thoại
     đòi một cú bấm nữa để đóng — hai cú bấm cho một việc vốn chỉ đáng một. */
  var dongHo = null;
  function noi(chu, hong) {
    if (!bao) return;
    bao.textContent = chu;
    bao.classList.toggle('cum-bao--hong', !!hong);
    clearTimeout(dongHo);
    dongHo = setTimeout(function () {
      bao.textContent = '';
      bao.classList.remove('cum-bao--hong');
    }, 2600);
  }

  function chepTay(chu) {
    try {
      var o = document.createElement('textarea');
      o.value = chu;
      /* Đặt ngoài khung nhìn chứ không `display:none`: phần tử ẩn hẳn thì
         không chọn được chữ trong nó, và lệnh chép không có gì để chép. */
      o.setAttribute('readonly', '');
      o.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(o);
      o.select();
      var xong = document.execCommand('copy');
      document.body.removeChild(o);
      return xong;
    } catch (e) { return false; }
  }

  nut.addEventListener('click', function () {
    var duong = nut.getAttribute('data-chia') || location.href;
    var de = nut.getAttribute('data-de') || document.title;

    if (navigator.share) {
      navigator.share({ title: de, url: duong }).catch(function (e) {
        /* Người đọc bấm huỷ bảng chia sẻ cũng rơi vào đây, và đó KHÔNG phải
           lỗi — báo "không chia sẻ được" lúc họ vừa cố ý huỷ là nói sai. */
        if (e && e.name === 'AbortError') return;
        if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
        else noi(NHAN.fail || 'Could not copy', true);
      });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(duong).then(function () {
        noi(NHAN.copied || 'Link copied');
      }).catch(function () {
        if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
        else noi(NHAN.fail || 'Could not copy', true);
      });
      return;
    }

    if (chepTay(duong)) noi(NHAN.copied || 'Link copied');
    else noi(NHAN.fail || 'Could not copy', true);
  });
})();
