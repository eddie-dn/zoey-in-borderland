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
})();
