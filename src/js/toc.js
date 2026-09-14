/* ============================================================
   TOC — sáng mục đang đọc trong mục lục + thanh tiến độ đọc.
   ============================================================ */
(function(){
  'use strict';
  var toc = document.querySelector('.toc');
  var bar = document.querySelector('.read-bar');
  var art = document.querySelector('.prose');

  /* ── 1. Sáng mục đang đọc ──
     Dùng IntersectionObserver chứ không nghe scroll: trình duyệt tự gọi lại
     khi có thay đổi, không phải tính lại vị trí mọi tiêu đề ở từng nhịp cuộn. */
  if(toc && art){
    var links = {}, ds = [];
    toc.querySelectorAll('a[href^="#"]').forEach(function(a){
      links[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
    });
    var heads = art.querySelectorAll('h2[id],h3[id]');
    function sang(id){
      toc.querySelectorAll('a.active').forEach(function(a){ a.classList.remove('active'); });
      if(links[id]) links[id].classList.add('active');
    }
    var io = new IntersectionObserver(function(recs){
      recs.forEach(function(r){
        var i = ds.indexOf(r.target);
        if(r.isIntersecting && i < 0) ds.push(r.target);
        else if(!r.isIntersecting && i >= 0) ds.splice(i, 1);
      });
      if(ds.length){
        /* Nhiều tiêu đề cùng trong tầm nhìn thì lấy cái TRÊN CÙNG — đó là mục
           người đọc đang ở trong, không phải mục sắp tới. */
        ds.sort(function(a,b){ return a.offsetTop - b.offsetTop; });
        sang(ds[0].id);
      }
    }, { rootMargin: '-72px 0px -62% 0px', threshold: 0 });
    heads.forEach(function(h){ io.observe(h); });
  }

  /* ── 2. Thanh tiến độ ──
     transform:scaleX rẻ hơn width: trình duyệt chạy nó trên luồng vẽ, không
     phải tính lại bố cục ở mỗi nhịp cuộn. rAF gộp nhiều sự kiện cuộn về một lần vẽ. */
  if(bar && art){
    var cho = false;
    function ve(){
      cho = false;
      var top = art.offsetTop;
      var het = top + art.offsetHeight - innerHeight;
      var p = het <= top ? 1 : (scrollY - top) / (het - top);
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    addEventListener('scroll', function(){
      if(!cho){ cho = true; requestAnimationFrame(ve); }
    }, { passive: true });
    addEventListener('resize', ve, { passive: true });
    ve();
  }
})();
