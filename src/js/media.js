/* ============================================================
   MEDIA — YouTube bấm-mới-tải, và nút chép mã.
   ============================================================ */
(function(){
  'use strict';

  /* ── 1. YouTube: chỉ dựng iframe KHI người đọc bấm play ──
     Một iframe YouTube nhúng sẵn kéo về hơn 1MB script của Google và đặt cookie
     theo dõi lên người đọc dù họ chưa bấm gì. Bài có ba video thì thành ba lần
     như vậy, ngay lúc mở trang. Ở đây chỉ có ảnh bìa; bấm rồi mới tải. */
  document.querySelectorAll('.yt-facade').forEach(function(btn){
    /* Ảnh bìa lấy từ i.ytimg.com có thể hỏng: video bị xoá, hoặc máy người đọc
       chặn miền đó. Bỏ hẳn thẻ <img> đi thì lộ nền gradient bên dưới cùng nút
       play — vẫn bấm được. Để nguyên thì ra biểu tượng ảnh vỡ giữa khung.
       Phải kiểm cả trường hợp ảnh đã tải hỏng TRƯỚC khi file này chạy: lúc đó
       sự kiện 'error' bắn xong rồi, nghe cũng không kịp nữa. */
    var bia = btn.querySelector('img');
    if (bia) {
      var bo = function(){ bia.remove(); };
      if (bia.complete && !bia.naturalWidth) bo();
      else bia.addEventListener('error', bo, { once: true });
    }

    btn.addEventListener('click', function(){
      var id = btn.dataset.yt;
      if(!id) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id
            + '?autoplay=1&rel=0&modestbranding=1';
      f.title = btn.dataset.title || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; '
              + 'gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      btn.replaceWith(f);
    });
  });

  /* ── 2. Nút chép mã ──
     Nút được dựng bằng JS chứ không viết sẵn trong HTML: máy không chạy JS thì
     không có nút, mà một cái nút bấm không ăn thua gì còn tệ hơn là không có nút. */
  document.querySelectorAll('.prose pre').forEach(function(pre){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'copy-btn';
    b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy code');
    b.addEventListener('click', function(){
      var code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function(){
        b.textContent = 'Copied';
        setTimeout(function(){ b.textContent = 'Copy'; }, 1600);
      }).catch(function(){
        b.textContent = 'Failed';
        setTimeout(function(){ b.textContent = 'Copy'; }, 1600);
      });
    });
    pre.appendChild(b);
  });

  /* ══════════ 3. BẤM ẢNH ĐỂ XEM TO ══════════

     ── VÌ SAO CẦN ──
     Ảnh trong bài nằm gọn trong cột chữ, rộng chừng 700px. Sơ đồ có chữ nhỏ,
     ảnh chụp có chi tiết — trên điện thoại thì cột chữ chỉ còn 350px, và
     người đọc làm đúng cái phản xạ mà mọi ứng dụng ảnh dạy họ: chạm vào tấm
     ảnh. Trước bản này chạm vào không có gì xảy ra.

     ── DÙNG <dialog>, KHÔNG TỰ DỰNG LỚP PHỦ ──
     `showModal()` cho sẵn bốn thứ mà một lớp phủ tự dựng phải viết tay và
     thường viết thiếu: phím Esc đóng, tiêu điểm bị khoá bên trong, phần còn
     lại của trang thành `inert` với trình đọc màn hình, và một `::backdrop`
     thật. Bốn thứ ấy là phần khó, và trình duyệt đã làm xong.

     ── BA TẤM ẢNH KHÔNG MỞ RA ──
     · ảnh nằm trong một <a> — người ta bấm để đi tới link, không phải để xem to;
     · ảnh trong băng ảnh khung C — nó đã có bộ xem riêng (bang-anh.js);
     · ảnh bìa đầu bài — nó đang hiện ở khổ lớn nhất trang rồi.
     ══════════════════════════════════════════════════════════════ */
  var dsAnh = [].slice.call(
    document.querySelectorAll('.prose img:not(.ba-anh img):not(.post-cover img)')
  ).filter(function(a){ return !a.closest('a'); });

  if (dsAnh.length && typeof HTMLDialogElement === 'function') {
    var hop = null;

    var mo = function(anh){
      if (!hop) {
        hop = document.createElement('dialog');
        hop.className = 'anh-to';
        hop.innerHTML = '<img alt=""><p class="anh-to-chu"></p>';
        /* Bấm vào bất cứ đâu trong hộp là đóng — kể cả lên chính tấm ảnh.
           Người đang xem một tấm ảnh phóng to thì việc duy nhất họ muốn làm
           tiếp là đóng nó lại. */
        hop.addEventListener('click', function(){ hop.close(); });
        document.body.appendChild(hop);
      }
      var to = hop.querySelector('img');
      var chu = hop.querySelector('.anh-to-chu');
      to.src = anh.currentSrc || anh.src;
      to.alt = anh.alt || '';
      /* Chú thích lấy từ <figcaption> đi kèm, nếu có: xem một tấm ảnh to mà
         mất dòng chú thích thì nhiều khi mất luôn nghĩa của nó. */
      var cap = anh.closest('figure');
      cap = cap && cap.querySelector('figcaption');
      chu.textContent = cap ? cap.textContent.trim() : '';
      chu.hidden = !chu.textContent;
      hop.showModal();
    };

    dsAnh.forEach(function(anh){
      anh.classList.add('anh-mo-duoc');
      anh.addEventListener('click', function(){ mo(anh); });
      /* Bàn phím: ảnh không phải nút, nên phải tự khai vai trò và bắt phím.
         Không đổi <img> thành <button>: làm thế là đổi cả cách trình đọc màn
         hình đọc nó, và một tấm ảnh thì vẫn nên được đọc ra là tấm ảnh. */
      anh.tabIndex = 0;
      anh.setAttribute('role', 'button');
      anh.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mo(anh); }
      });
    });
  }
})();
