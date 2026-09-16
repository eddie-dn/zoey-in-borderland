(function(){
  'use strict';

  document.querySelectorAll('.yt-facade').forEach(function(btn){

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
