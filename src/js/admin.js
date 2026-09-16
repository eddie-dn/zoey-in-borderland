/* ══════════════════════════════════════════════════════════════════════
   BA NGĂN CỦA /z-admin/ — chọn việc bên trái, nội dung bên phải.

   Nhỏ, nhưng có bốn chỗ cố ý:

   1 · ẨN BẰNG `hidden`, KHÔNG PHẢI DỊCH RA NGOÀI MÀN HÌNH.
       Ngăn ẩn phải thật sự biến khỏi cây trang: trình đọc màn hình không đọc
       phải ba khung cùng lúc, và phần tử trong đó có `offsetParent` bằng null
       — bàn duyệt đọc dấu hiệu ấy để ngừng hỏi máy chủ mỗi hai mươi giây khi
       không ai nhìn nó.

   2 · DẤU THĂNG TRÊN ĐỊA CHỈ.
       `/z-admin/#post` mở thẳng ngăn viết bài, nên lưu được vào màn hình chính
       điện thoại cho đúng việc hay làm nhất. Địa chỉ đổi theo khi bấm, nhưng
       bằng `replaceState` — bấm qua lại ba ngăn không nên nhồi ba mục vào lịch
       sử trình duyệt, vì lúc ấy nút Quay lại hết đưa được về trang trước.

   3 · NHỚ NGĂN ĐANG MỞ.
       Đóng trang rồi mở lại thì về đúng chỗ cũ. Nhưng dấu thăng trên địa chỉ
       luôn THẮNG chỗ nhớ: gõ hẳn một đường dẫn ra là một ý định rõ ràng hơn.

   4 · BÀN PHÍM.
       Mũi tên chạy giữa ba nút theo đúng lệ của một dải thẻ (tablist): chỉ nút
       đang chọn nằm trong luồng Tab, mũi tên đi tiếp trong dải.

   5 · MỘT CỬA VÀO, KHÔNG PHẢI BA.
       File này cũng là chỗ đóng/mở cả trang theo khoá. Ba ngăn bên trong
       KHÔNG còn tự hỏi khoá nữa — chúng chỉ dựng nội dung khi đã vào được.
       Nhờ vậy bấm Đăng xuất một lần là cả ba cùng đóng, chứ không phải đóng
       lần lượt từng ngăn theo lúc nó tình cờ hỏi lại máy chủ.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var khung = document.querySelector('[data-admin]');
  if (!khung) return;

  var nut = [].slice.call(khung.querySelectorAll('[data-ad]'));
  if (!nut.length) return;

  var KHO = 'zib-admin-ngan';

  function o(ma) { return document.getElementById('ad-o-' + ma); }

  function chon(ma, ghiNho) {
    if (!o(ma)) ma = nut[0].getAttribute('data-ad');

    nut.forEach(function (b) {
      var la = b.getAttribute('data-ad') === ma;
      b.setAttribute('aria-selected', la ? 'true' : 'false');
      b.tabIndex = la ? 0 : -1;
      var k = o(b.getAttribute('data-ad'));
      if (k) k.hidden = !la;
    });

    if (ghiNho) {
      try { localStorage.setItem(KHO, ma); } catch (e) {}
      /* Không dùng location.hash = … : nó đẩy thêm một mục vào lịch sử VÀ làm
         trang nhảy tới phần tử có id trùng. Cả hai đều không mong muốn. */
      try { history.replaceState(null, '', '#' + ma); } catch (e) {}
    }

    /* Ngăn vừa hiện ra có thể chứa một khung mới dựng xong lúc đang ẩn — báo
       cho nó biết là giờ đã thấy được, để nó tự làm mới nếu cần. */
    document.dispatchEvent(new CustomEvent('zib:ngan', { detail: { ma: ma } }));
  }

  nut.forEach(function (b) {
    b.addEventListener('click', function () { chon(b.getAttribute('data-ad'), true); });
    b.addEventListener('keydown', function (e) {
      var i = nut.indexOf(b), j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % nut.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + nut.length) % nut.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = nut.length - 1;
      if (j < 0) return;
      e.preventDefault();
      chon(nut[j].getAttribute('data-ad'), true);
      nut[j].focus();
    });
  });

  /* ══════════ CỬA VÀO ══════════
     Đổi qua đổi lại giữa khung đăng nhập và bàn làm việc. Gọi lại mỗi lần
     khoá đổi — kể cả khi khoá đổi ở MỘT TAB KHÁC, vì khoa.js nghe `storage`
     rồi phát cùng một sự kiện ấy sang đây. */
  var K = (window.ZIB || {}).khoa;
  var oCong = document.querySelector('[data-khoa-cong]');
  var oRa   = document.querySelector('[data-khoa-ra]');
  var congDaVe = null;
  /* Đã vào được lần nào trong lượt mở trang này chưa. Dùng để phân biệt "mới
     mở trang" với "vừa bấm Đăng xuất" — hai lúc ấy cần hai hành vi con trỏ
     khác nhau, xem cuối veCua(). */
  var daTungVao = K ? K.co() : false;

  function veCua() {
    /* Thiếu khoa.js thì mở thẳng bàn làm việc: ba ngăn bên trong tự báo lỗi
       khi gọi máy chủ. Khoá một trang lại vì một file JS không tải được thì
       hỏng thêm chứ không an toàn thêm — lớp canh thật nằm ở máy chủ. */
    if (!K || !oCong) { khung.hidden = false; return; }

    var vao = K.co();
    khung.hidden = !vao;
    oCong.hidden = vao;

    if (vao) {
      oCong.textContent = '';
      congDaVe = null;
      if (oRa && !oRa.firstChild) K.veNutRa(oRa);
      return;
    }
    if (oRa) oRa.textContent = '';
    /* Dựng lại khung đăng nhập MỖI LẦN đăng xuất, không giữ lại khung cũ: ô
       khoá cũ còn nguyên chữ vừa gõ, và để nguyên nó là để lại mật khẩu nằm
       trong DOM của một trang đã đăng xuất. */
    congDaVe = K.veCong(oCong, veCua);
    /* Chỉ kéo con trỏ vào ô khi người ta VỪA đăng xuất — lúc mới mở trang thì
       không, vì bàn phím điện thoại bật lên che mất nửa màn hình trước khi họ
       kịp nhìn thấy đây là trang gì. */
    if (daTungVao) congDaVe.tap();
  }

  if (K) K.theoDoi(function (vao) { if (vao) daTungVao = true; veCua(); });
  veCua();

  var tuDia = (location.hash || '').replace(/^#/, '');
  var daNho = '';
  try { daNho = localStorage.getItem(KHO) || ''; } catch (e) {}
  chon(tuDia || daNho || nut[0].getAttribute('data-ad'), false);

  window.addEventListener('hashchange', function () {
    chon((location.hash || '').replace(/^#/, ''), false);
  });
})();
