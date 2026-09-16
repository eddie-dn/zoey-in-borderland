(function () {
  'use strict';

  var hop = document.querySelector('[data-nen]');
  if (!hop) return;

  var cv = document.createElement('canvas');
  cv.className = 'nen-canvas';
  cv.setAttribute('aria-hidden', 'true');
  hop.appendChild(cv);

  var ctx = cv.getContext('2d');
  var W = 0, H = 0;
  var dpr = Math.min(devicePixelRatio || 1, 2);
  var itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var may = null;
  var quay = 0;
  var trongTam = true;
  var moTab = true;

  function dungHoa() {
    var MAU = ['#F8C8D8', '#F5BCBA', '#FBD9E4', '#F3DCDC', '#EFC7E4', '#E9C4EE'];

    var DAM = ['#EFA6C2', '#EC9C9A', '#F4BBD0', '#E6C0C0', '#DFA6D6', '#D8A3E2'];
    var hoa = [];

    function moi(batDau) {

      var lop = Math.pow(Math.random(), 0.7);
      var iMau = (Math.random() * MAU.length) | 0;
      return {
        lop: lop,
        x: -20 + Math.random() * (W + 40),

        y: batDau ? Math.random() * H : -18 - Math.random() * 80,

        r: 3.2 + lop * 8.2,

        vy: 0.3 + lop * 1.05,
        vx: -0.06 - lop * 0.3,
        sw: 0.5 + Math.random() * 1.5,
        ph: Math.random() * 6.28,
        sp: 0.011 + Math.random() * 0.024,
        go: Math.random() * 6.28,
        mau: MAU[iMau], dam: DAM[iMau],

        mo: 0.22 + lop * 0.48
      };
    }

    function canh(h, lat) {
      var r = h.r;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.75, -r * 0.72, r * 0.62, r * 0.5, 0, r);
      ctx.bezierCurveTo(-r * 0.62, r * 0.5, -r * 0.75, -r * 0.72, 0, -r);
      ctx.closePath();

      var g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, '#FFFFFF');

      g.addColorStop(0.62, h.mau);
      g.addColorStop(0.88, h.dam || h.mau);
      g.addColorStop(1, h.dam || h.mau);
      ctx.fillStyle = g;
      ctx.globalAlpha = h.mo * (0.58 + 0.42 * lat);
      ctx.fill();

      if (r > 6) {
        ctx.strokeStyle = 'rgba(184,112,162,' + (0.08 + h.lop * 0.18).toFixed(3) + ')';
        ctx.lineWidth = 0.35 + h.lop * 0.4;
        ctx.globalAlpha *= 0.9;
        ctx.stroke();
      }

      if (r > 10) {
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.72);
        ctx.quadraticCurveTo(r * 0.12, 0, 0, r * 0.82);
        ctx.strokeStyle = 'rgba(206,138,178,' + (0.10 + h.lop * 0.14).toFixed(3) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    return {
      dung: function () {

        var n = Math.max(54, Math.min(170, Math.round(W * H / 3300)));
        while (hoa.length < n) hoa.push(moi(true));
        hoa.length = n;
      },
      ve: function (t) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < hoa.length; i++) {
          var h = hoa[i];
          if (!itMotion) {
            h.y += h.vy;
            h.x += h.vx + Math.sin((t * 0.01) + h.ph) * h.sw * 0.45;
            h.go += h.sp;
          }

          if (h.x < -40) h.x = W + 40;
          else if (h.x > W + 40) h.x = -40;
          if (h.y > H + 24) { hoa[i] = moi(false); continue; }

          var lat = Math.abs(Math.cos(h.go));
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(Math.sin(h.go * 0.7) * 0.95);

          ctx.scale(0.22 + lat * 0.78, 1);
          canh(h, lat);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    };
  }

  function dungThac() {

    var MAU = ['#FFFFFF', '#DAE8F5', '#9FD3EA', '#A8DED6', '#BAD9F4', '#7FB6D8'];
    var vet = [], giot = [], gon = [], suong = [], toe = [];
    var mn = 0;

    function moiVet(batDau) {

      var lop = Math.pow(Math.random(), 0.75);
      return {
        lop: lop,
        x: Math.random() * W,
        y: batDau ? Math.random() * mn : -40 - Math.random() * 160,

        dai: 12 + lop * 39,
        rong: 0.7 + lop * 1.9,
        vy: 1.35 + lop * 3.6,

        vx: 0.06 + lop * 0.16,
        mau: MAU[(Math.random() * MAU.length) | 0],
        mo: (0.16 + lop * 0.42)
      };
    }

    function moiGiot(batDau) {
      var lop = Math.pow(Math.random(), 0.6);

      var s = Math.pow(Math.random(), 1.7);
      return {
        lop: lop, s: s,
        cham: mn + s * (H - mn) * 0.92,
        x: 20 + Math.random() * Math.max(1, W - 40),

        y: batDau ? Math.random() * mn : -12 - Math.random() * 90,
        r: 1.6 + lop * 2.6,

        vy: 0.95 + lop * 1.8,
        mo: 0.3 + lop * 0.5
      };
    }

    function moiToe(x, y, lop) {
      if (Math.random() > 0.62) return;
      var n = 2 + ((Math.random() * 4) | 0);
      for (var k = 0; k < n; k++) {
        toe.push({
          x: x, y: y,

          vx: (Math.random() - 0.5) * (0.62 + lop * 0.8),
          vy: -(0.52 + Math.random() * (0.62 + lop * 0.72)),
          r: 0.6 + Math.random() * (0.5 + lop * 0.7),
          mo: 0.3 + Math.random() * 0.26,

          day: y
        });
      }
    }

    function moiGon(x, lop) {
      var s = Math.random();
      gon.push({ x: x, y: mn + s * (H - mn) * 0.92,
                 r: 1, rMax: (18 + lop * 46) * (0.55 + s * 0.85),
                 v: (0.42 + lop * 0.5) * (0.6 + s * 0.8),
                 mo: 0.3 + s * 0.42 });
    }

    return {
      dung: function () {
        mn = H * 0.74;

        var nVet = Math.max(40, Math.min(190, Math.round(W * H / 4200)));
        var nGiot = Math.max(9, Math.min(34, Math.round(W / 58)));
        while (vet.length < nVet) vet.push(moiVet(true));
        vet.length = nVet;
        while (giot.length < nGiot) giot.push(moiGiot(true));
        giot.length = nGiot;

        suong = [];

        for (var i = 0; i < 16; i++) {
          suong.push({
            x: Math.random() * W,
            y: mn - Math.random() * H * 0.1,
            r: H * (0.06 + Math.random() * 0.13),
            vy: 0.06 + Math.random() * 0.14,
            mo: 0.035 + Math.random() * 0.05,
            m: MAU[2 + ((Math.random() * 4) | 0)]
          });
        }

        if (itMotion && !gon.length) {
          for (i = 0; i < 7; i++) {
            moiGon(Math.random() * W, Math.random());
            gon[gon.length - 1].r = gon[gon.length - 1].rMax * (0.15 + Math.random() * 0.7);
          }
        }
      },

      ve: function (t) {
        var i, o, g;
        ctx.clearRect(0, 0, W, H);

        for (i = 0; i < suong.length; i++) {
          o = suong[i];
          if (!itMotion) {
            o.y -= o.vy;

            if (o.y < mn - H * 0.34) { o.y = mn + H * 0.04; o.x = Math.random() * W; }
          }
          g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
          g.addColorStop(0, o.m);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = o.mo; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill();
        }

        ctx.lineCap = 'round';
        for (i = 0; i < vet.length; i++) {
          o = vet[i];
          if (!itMotion) { o.y += o.vy; o.x += o.vx; }
          if (o.y - o.dai > mn) { vet[i] = moiVet(false); continue; }
          if (o.x > W + 10) o.x = -10;

          var gan = (o.y - (mn - H * 0.22)) / (H * 0.22);
          var mo = o.mo * (gan > 0 ? Math.max(0, 1 - gan) : 1);
          if (mo <= 0.004) continue;

          g = ctx.createLinearGradient(o.x, o.y - o.dai, o.x, o.y);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(1, o.mau);
          ctx.globalAlpha = mo;
          ctx.strokeStyle = g;
          ctx.lineWidth = o.rong;
          ctx.beginPath();
          ctx.moveTo(o.x - o.vx * o.dai / Math.max(0.1, o.vy), o.y - o.dai);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }

        var day = H - mn;
        g = ctx.createLinearGradient(0, mn, 0, H);

        g.addColorStop(0, 'rgba(155,211,218,.05)');
        g.addColorStop(0.35, 'rgba(155,211,218,.2)');
        g.addColorStop(1, 'rgba(105,178,194,.42)');
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.fillRect(0, mn, W, day);

        for (i = 0; i < giot.length; i++) {
          o = giot[i];
          if (!itMotion) o.y += o.vy;
          if (o.y >= o.cham) {
            moiGon(o.x, o.lop);
            if (!itMotion) moiToe(o.x, o.cham, o.lop);
            giot[i] = moiGiot(false); continue;
          }
          ctx.globalAlpha = o.mo;
          ctx.fillStyle = MAU[0];

          ctx.beginPath();
          ctx.ellipse(o.x, o.y, o.r, o.r * (1 + o.vy * 0.26), 0, 0, 6.2832);
          ctx.fill();
        }

        for (i = gon.length - 1; i >= 0; i--) {
          o = gon[i];
          if (!itMotion) { o.r += o.v; }
          var pha = o.r / o.rMax;
          if (pha >= 1) { gon.splice(i, 1); continue; }

          ctx.globalAlpha = (o.mo || 0.3) * (1 - pha) * (1 - pha);
          ctx.strokeStyle = MAU[5];
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(o.x, o.y, o.r, o.r * 0.3, 0, 0, 6.2832);
          ctx.stroke();

          if (o.r > 12) {
            ctx.globalAlpha *= 0.5;
            ctx.beginPath();
            ctx.ellipse(o.x, o.y, o.r * 0.58, o.r * 0.58 * 0.3, 0, 0, 6.2832);
            ctx.stroke();
          }
        }

        for (i = toe.length - 1; i >= 0; i--) {
          o = toe[i];
          if (!itMotion) { o.x += o.vx; o.y += o.vy; o.vy += 0.032; }
          if (o.y >= o.day) { toe.splice(i, 1); continue; }

          ctx.globalAlpha = o.mo * Math.max(0.1, 1 - (o.day - o.y) / 26);

          ctx.fillStyle = MAU[5];
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.r, 0, 6.2832);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }
    };
  }

  function dungThienHa() {
    var MAU = ['#FFFFFF', '#FBE3F0', '#F5BCBA', '#E3AADD', '#C3C7F3', '#C8A8E9', '#FFF6FB'];
    var nen = [], sao = [], bui = [], cuc = [];

    var NGHIENG = -0.34, DET = 0.42;
    var R = 1;
    var NHANH = 2;
    var VONG = 2.9;

    function chuan() {
      return (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 1.6;
    }

    return {
      dung: function () {

        R = Math.max(W * 0.8, H * 1.05);
        nen = []; sao = []; bui = []; cuc = [];

        var nNen = Math.max(180, Math.min(1400, Math.round(W * H / 1800)));
        for (var i = 0; i < nNen; i++) {
          nen.push({
            x: Math.random() * W, y: Math.random() * H,
            s: Math.random() < 0.86 ? 1 : 1.6,
            m: MAU[(Math.random() * MAU.length) | 0],
            o: 0.1 + Math.random() * 0.3,
            nh: Math.random() * 6.28, ns: 0.006 + Math.random() * 0.02
          });
        }

        var day = Math.max(1, R / (Math.min(W, H) * 1.15));
        var nSao = Math.max(420, Math.min(3200, Math.round(W * H / 620 * day)));
        var t, k, goc;
        for (i = 0; i < nSao; i++) {

          t = Math.pow(Math.random(), 0.62);
          k = i % NHANH;
          goc = t * VONG * Math.PI + k * (6.2832 / NHANH);

          goc += chuan() * Math.min(0.85, 0.15 / Math.max(0.1, t));
          sao.push({
            r: R * t * (1 + chuan() * 0.04), g: goc,

            v: 0.00042 + 0.00020 / (0.5 + t),
            s: Math.random() < 0.9 ? 1 : 1.8,
            m: MAU[(Math.random() * MAU.length) | 0],

            o: (0.42 + Math.random() * 0.58) * (1 - t * 0.5),
            nh: Math.random() * 6.28, ns: 0.008 + Math.random() * 0.026
          });
        }

        for (i = 0; i < 70; i++) {

          t = Math.pow(Math.random(), 0.75);
          k = i % NHANH;

          goc = t * VONG * Math.PI + k * (6.2832 / NHANH) + chuan() * 0.28;
          bui.push({
            r: R * t, g: goc,
            v: 0.00042 + 0.00020 / (0.5 + t),
            rad: R * (0.07 + Math.random() * 0.17),
            m: ['#E3AADD', '#C3C7F3', '#F5BCBA', '#C8A8E9', '#9F7BD8', '#FBE3F0'][i % 6],
            o: (0.03 + Math.random() * 0.045) * (1 - t * 0.35)
          });
        }

        for (i = 0; i < 7; i++) {
          cuc.push({
            dx: chuan() * R * 0.1, dy: chuan() * R * 0.05,
            rad: R * (0.05 + Math.random() * 0.09),
            o: 0.06 + Math.random() * 0.07
          });
        }
      },

      ve: function (t) {
        var cx = W * 0.56, cy = H * 0.6;
        var i, o, x, y, g;
        ctx.clearRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'lighter';

        for (i = 0; i < nen.length; i++) {
          o = nen[i];
          var nhayN = itMotion ? 1 : 0.55 + 0.45 * Math.sin(t * o.ns + o.nh);
          ctx.globalAlpha = o.o * nhayN;
          ctx.fillStyle = o.m;
          ctx.fillRect(o.x, o.y, o.s, o.s);
        }

        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(NGHIENG); ctx.translate(-cx, -cy);

        for (i = 0; i < bui.length; i++) {
          o = bui[i]; if (!itMotion) o.g += o.v;
          x = cx + Math.cos(o.g) * o.r; y = cy + Math.sin(o.g) * o.r * DET;
          g = ctx.createRadialGradient(x, y, 0, x, y, o.rad);
          g.addColorStop(0, o.m); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = o.o; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, o.rad, 0, 6.2832); ctx.fill();
        }

        var Rl = Math.min(R * 0.26, Math.min(W, H) * 0.3);
        g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rl);
        g.addColorStop(0, 'rgba(255,250,254,.8)');
        g.addColorStop(0.14, 'rgba(253,236,246,.46)');
        g.addColorStop(0.38, 'rgba(236,196,234,.22)');
        g.addColorStop(0.68, 'rgba(206,164,214,.09)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, Rl, 0, 6.2832); ctx.fill();

        for (i = 0; i < cuc.length; i++) {
          o = cuc[i];
          x = cx + o.dx; y = cy + o.dy;
          g = ctx.createRadialGradient(x, y, 0, x, y, o.rad);
          g.addColorStop(0, '#FFF6FB'); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = o.o; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, o.rad, 0, 6.2832); ctx.fill();
        }

        for (i = 0; i < sao.length; i++) {
          o = sao[i]; if (!itMotion) o.g += o.v;
          var nhay = itMotion ? 1 : 0.62 + 0.38 * Math.sin(t * o.ns + o.nh);
          x = cx + Math.cos(o.g) * o.r; y = cy + Math.sin(o.g) * o.r * DET;
          ctx.globalAlpha = o.o * nhay; ctx.fillStyle = o.m;
          ctx.fillRect(x, y, o.s, o.s);
        }

        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    };
  }

  var BO = { light: dungHoa, dark: dungThienHa, calm: dungThac };

  function themeNao() {
    var t = document.documentElement.getAttribute('data-theme');
    if (BO[t]) return t;

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function coLai() {
    var r = hop.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (may) may.dung();
  }

  var t = 0;
  function vong() {
    quay = 0;
    if (!may) return;
    t++;
    may.ve(t);

    if (itMotion) return;
    if (trongTam && moTab) quay = requestAnimationFrame(vong);
  }

  function chay() {
    if (!quay && may && trongTam && moTab) quay = requestAnimationFrame(vong);
  }
  function ngung() {
    if (quay) { cancelAnimationFrame(quay); quay = 0; }
  }

  function doiBo() {
    ngung();
    may = BO[themeNao()]();
    coLai();

    may.ve(t);
    chay();
  }

  doiBo();

  new MutationObserver(doiBo).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', doiBo);

  addEventListener('resize', coLai, { passive: true });

  document.addEventListener('visibilitychange', function () {
    moTab = !document.hidden;
    moTab ? chay() : ngung();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (r) {
      trongTam = r[0].isIntersecting;
      trongTam ? chay() : ngung();
    }, { threshold: 0 }).observe(hop);
  }
})();
