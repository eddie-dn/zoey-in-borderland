(function(){
  'use strict';

  var hop = document.querySelector('.toc-box');
  if (hop) {
    var hep = window.matchMedia('(max-width:1079px)');
    var theo = function (m) { if (m.matches) hop.removeAttribute('open'); else hop.open = true; };
    theo(hep);
    (hep.addEventListener ? hep.addEventListener('change', theo)
                          : hep.addListener(theo));
  }

  var toc = document.querySelector('.toc');
  var bar = document.querySelector('.read-bar');
  var art = document.querySelector('.prose');

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

        ds.sort(function(a,b){ return a.offsetTop - b.offsetTop; });
        sang(ds[0].id);
      }
    }, { rootMargin: '-72px 0px -62% 0px', threshold: 0 });
    heads.forEach(function(h){ io.observe(h); });
  }

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
