/* ============================================================
   THEME — chuyển Sakura sáng ⇄ Galaxy tối, nhớ lựa chọn.

   Việc ĐẶT theme lúc tải trang KHÔNG nằm ở file này. Nó nằm trong một đoạn
   <script> viết thẳng vào <head> (xem src/templates/shell.html), chạy TRƯỚC
   khi trình duyệt vẽ khung hình đầu tiên. Để ở file ngoài thì trang loé
   trắng một nhịp rồi mới tối lại — trên máy chậm thấy rất rõ.

   File này chỉ lo cái nút.
   ============================================================ */
(function(){
  'use strict';
  var KEY = 'zib-theme';
  var root = document.documentElement;

  function he(){            /* máy đang để sáng hay tối */
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function dangDung(){
    return root.getAttribute('data-theme') || he();
  }
  function dat(t){
    root.setAttribute('data-theme', t);
    try{ localStorage.setItem(KEY, t); }catch(e){}
    /* Đổi luôn theme-color: thanh trạng thái của trình duyệt điện thoại ăn theo
       giá trị này, không đổi thì nền tối mà thanh trên vẫn hồng nhạt. */
    var m = document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content', t === 'dark' ? '#120C22' : '#FAF6FD');
    var b = document.querySelector('.theme-btn');
    if(b){
      var nhan = t === 'dark' ? 'Switch to light' : 'Switch to dark';
      b.setAttribute('aria-label', nhan);
      b.setAttribute('data-tip', nhan);
    }
  }

  var btn = document.querySelector('.theme-btn');
  if(btn) btn.addEventListener('click', function(){
    dat(dangDung() === 'dark' ? 'light' : 'dark');
  });

  /* Người đọc đổi cài đặt của máy giữa chừng: chỉ đi theo NẾU họ chưa tự chọn
     bao giờ. Đã tự chọn rồi thì lựa chọn của họ thắng, không bị máy ghi đè. */
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
    var daChon = null;
    try{ daChon = localStorage.getItem(KEY); }catch(e){}
    if(!daChon) root.removeAttribute('data-theme');
  });

  dat(dangDung());
})();
