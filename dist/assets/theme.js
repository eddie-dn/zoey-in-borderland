(function(){
  'use strict';
  var KEY = 'zib-theme';
  var root = document.documentElement;

  var VONG = ['light', 'dark', 'calm'];

  var MAU_THANH = { light:'#FAF6FD', dark:'#120C22', calm:'#E9F1FA' };

  var NHAN = {
    light: ['data-nhan-sang', 'Switch to light'],
    dark : ['data-nhan-toi',  'Switch to dark'],
    calm : ['data-nhan-tinh', 'Switch to calm']
  };

  function he(){
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function dangDung(){
    var t = root.getAttribute('data-theme');

    return VONG.indexOf(t) >= 0 ? t : he();
  }
  function keTiep(t){
    return VONG[(VONG.indexOf(t) + 1) % VONG.length];
  }

  function dat(t, luu){
    root.setAttribute('data-theme', t);
    if(luu){ try{ localStorage.setItem(KEY, t); }catch(e){} }

    var m = document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content', MAU_THANH[t] || MAU_THANH.light);
    var b = document.querySelector('.theme-btn');
    if(b){
      var n = NHAN[keTiep(t)];
      var chu = b.getAttribute(n[0]) || n[1];
      b.setAttribute('aria-label', chu);
      b.setAttribute('data-tip', chu);
    }
  }

  var btn = document.querySelector('.theme-btn');
  if(btn) btn.addEventListener('click', function(){
    dat(keTiep(dangDung()), true);
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
    var daChon = null;
    try{ daChon = localStorage.getItem(KEY); }catch(e){}
    if(!daChon) root.removeAttribute('data-theme');
  });

  dat(dangDung(), false);
})();
