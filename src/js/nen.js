/* ═══════════════════════════════════════════════════════════════════════
   NỀN ĐỘNG — hoa rơi ở theme sáng, thiên hà ở theme tối.

   Port từ hai bản gốc:
     HAN-961030-a  cánh hoa anh đào rơi chéo
     HAN-961030-b  đĩa thiên hà xoắn ốc

   Bật ở đâu: front matter `nen: dong` (hoặc `nen: tinh` để tắt). Trang chủ
   mặc định bật. Xem docs/DESIGN-SYSTEM.md §12.

   ── BỐN THỨ KHÁC BẢN GỐC ───────────────────────────────────────────────

   1. MỘT FILE, HAI HIỆU ỨNG, TỰ ĐỔI THEO THEME.
      Bản gốc là hai trang riêng nên mỗi trang một canvas cứng. Ở đây người
      đọc bấm đổi theme bất cứ lúc nào, nên phải dừng hiệu ứng cũ và dựng
      hiệu ứng mới ngay tại chỗ.

   2. DỪNG HẲN KHI TAB BỊ ẨN.
      Bản gốc chạy requestAnimationFrame mãi. Trình duyệt có tiết lưu rAF ở
      tab ẩn, nhưng không dừng hẳn — vẫn tốn pin của người mở mười tab. Ở đây
      nghe `visibilitychange` và huỷ vòng lặp.

   3. DỪNG KHI CUỘN QUA KHỎI.
      Nền chỉ nằm ở màn đầu. Cuộn xuống dưới rồi thì vẽ tiếp là vẽ cho không
      ai xem — IntersectionObserver tắt nó đi.

   4. TÔN TRỌNG prefers-reduced-motion.
      Vẫn VẼ một khung hình tĩnh (đẹp, có bố cục) rồi dừng, chứ không bỏ
      trắng: người tắt chuyển động vẫn xứng đáng được nhìn cái nền.
   ═══════════════════════════════════════════════════════════════════════ */
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

  var may = null;       /* bộ hiệu ứng đang chạy */
  var quay = 0;         /* id của requestAnimationFrame */
  var trongTam = true;  /* canvas có đang lọt vào tầm nhìn không */
  var moTab = true;

  /* ══════════ HOA RƠI ══════════ */
  function dungHoa() {
    var MAU = ['#F8C8D8', '#F5BCBA', '#FBD9E4', '#F3DCDC', '#EFC7E4', '#E9C4EE'];
    var hoa = [];

    function moi(batDau) {
      return {
        x: -20 + Math.random() * (W + 40),
        /* Lần đầu rải sẵn khắp chiều cao, để trang vừa mở đã có hoa ở cả trên
           lẫn dưới chứ không phải chờ chúng rơi xuống. */
        y: batDau ? Math.random() * H : -14 - Math.random() * 70,
        r: 4.5 + Math.random() * 7,
        /* Gió dạt trái chậm hơn tốc độ rơi nhiều lần, nên cánh đi hết chiều
           dọc màn hình mới ra khỏi mép — nửa dưới không bị trống. */
        vy: 0.42 + Math.random() * 0.95,
        vx: -0.10 - Math.random() * 0.30,
        sw: 0.6 + Math.random() * 1.5,
        ph: Math.random() * 6.28,
        sp: 0.012 + Math.random() * 0.026,
        go: Math.random() * 6.28,
        mau: MAU[(Math.random() * MAU.length) | 0],
        mo: 0.4 + Math.random() * 0.5
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
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, h.mau);
      ctx.fillStyle = g;
      ctx.globalAlpha = h.mo * (0.5 + 0.5 * lat);
      ctx.fill();
      /* Viền mảnh: nền nửa dưới ngả hồng, cánh trắng-hồng không viền thì chìm
         hẳn — cánh vẫn ở đó mà mắt không nhận ra. */
      ctx.strokeStyle = 'rgba(196,132,172,.34)';
      ctx.lineWidth = 0.7;
      ctx.globalAlpha *= 0.9;
      ctx.stroke();
    }

    return {
      dung: function () {
        /* Mật độ theo DIỆN TÍCH thật, không theo một con số cố định: cùng một
           số cánh thì màn 1440px thấy thưa mà màn 390px thấy dày đặc. */
        var n = Math.max(40, Math.min(130, Math.round(W * H / 4200)));
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
          /* Ra khỏi mép trái thì VÒNG sang mép phải, không thay cánh mới: cánh
             chỉ rời cuộc khi chạm đáy, nhờ vậy mật độ đều từ đỉnh xuống chân. */
          if (h.x < -40) h.x = W + 40;
          else if (h.x > W + 40) h.x = -40;
          if (h.y > H + 24) { hoa[i] = moi(false); continue; }

          var lat = Math.abs(Math.cos(h.go));
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(Math.sin(h.go * 0.7) * 0.95);
          /* Ép ngang theo góc xoay: cánh lúc mỏng lúc dày như đang lật trong gió */
          ctx.scale(0.22 + lat * 0.78, 1);
          canh(h, lat);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    };
  }

  /* ══════════ THIÊN HÀ ══════════ */
  function dungThienHa() {
    var MAU = ['#FFFFFF', '#FBE3F0', '#F5BCBA', '#E3AADD', '#C3C7F3', '#C8A8E9', '#FFF6FB'];
    var sao = [], bui = [], vanMay = [];
    /* Đĩa nghiêng và ép dẹt để thấy hình xoắn ốc, không phải một vòng tròn. */
    var NGHIENG = -0.38, DET = 0.34;
    /* R nằm ở đây chứ không nằm trong `dung` vì `ve` cũng cần nó (quầng lõi
       bám theo cỡ đĩa). Để trong `dung` thì `ve` ném ReferenceError. */
    var R = 1;

    /* Xoắn log: góc tăng theo bán kính. Đây là thứ làm ra hình xoắn ốc thật
       thay vì mấy vòng tròn đồng tâm. */
    function nhanh(t, k) {
      return t * 4.6 + k * Math.PI + (Math.random() - 0.5) * (0.7 - t * 0.42);
    }

    return {
      dung: function () {
        /* CỠ ĐĨA THEO CHIỀU NGANG, KHÔNG THEO min(W,H).
           Đĩa đã bị ép dẹt còn 0.34 chiều cao, nên chiều dọc chưa bao giờ là
           thứ chạm mép trước. Lấy min(W,H) trên màn ngang tức là trói cỡ đĩa
           vào chiều CAO — và được một thiên hà bé tẹo nằm lọt thỏm giữa khung,
           trông như cái huy hiệu dán lên nền chứ không như bầu trời.
           0.52 cho đường kính ngang hơi tràn mép: thiên hà phải chạy RA KHỎI
           khung mới ra dáng thiên hà.
           Vế H*0.92 là cái CHẶN cho khung ngang-mà-thấp (1600x500): không có
           nó thì cả màn chỉ còn thấy mỗi quầng lõi. */
        R = Math.min(W * 0.52, H * 0.92);
        sao = []; bui = []; vanMay = [];
        /* Đếm theo diện tích MÀN chứ không theo diện tích đĩa — cái mắt người
           thấy là bao nhiêu chấm trên mỗi vùng màn hình. Nhưng đĩa to ra gần
           gấp đôi thì trần cũng phải nới, không thì từng ấy sao trải trên vùng
           rộng gấp bốn và nhánh xoắn trông thủng lỗ chỗ. */
        var nSao = Math.max(80, Math.min(420, Math.round(W * H / 3400)));
        var nBui = Math.round(nSao * 1.5);

        for (var i = 0; i < nSao; i++) {
          var t = Math.pow(Math.random(), 0.62);
          sao.push({
            r: R * t, g: nhanh(t, i % 2),
            /* Vòng trong quay nhanh hơn vòng ngoài — đúng như thiên hà thật,
               và chính cái chênh tốc độ đó làm nhánh xoắn "chảy". */
            v: 0.00034 + 0.00055 / (0.28 + t),
            s: 0.4 + Math.random() * 1.5,
            m: MAU[(Math.random() * MAU.length) | 0],
            o: 0.3 + Math.random() * 0.6,
            nh: Math.random() * 6.28, ns: 0.01 + Math.random() * 0.03
          });
        }
        for (i = 0; i < nBui; i++) {
          t = Math.pow(Math.random(), 0.5);
          bui.push({
            r: R * t, g: nhanh(t, i % 2),
            v: 0.00030 + 0.00045 / (0.3 + t),
            s: 0.3 + Math.random() * 0.8,
            m: ['#E3AADD', '#C3C7F3', '#C8A8E9'][i % 3],
            o: 0.10 + Math.random() * 0.18
          });
        }
        for (i = 0; i < 14; i++) {
          t = Math.pow(Math.random(), 0.55);
          vanMay.push({
            r: R * t, g: nhanh(t, i % 2),
            v: 0.00030 + 0.00042 / (0.3 + t),
            rad: R * (0.15 + Math.random() * 0.22),
            m: ['#E3AADD', '#C3C7F3', '#F5BCBA', '#C8A8E9', '#9F7BD8'][i % 5],
            o: 0.055 + Math.random() * 0.075
          });
        }
      },

      ve: function (t) {
        /* Lõi lệch khỏi tâm: để đúng giữa thì quầng sáng nằm ngay sau chữ và
           chữ bị loá. Lệch xuống-phải thì chữ nằm trên vùng tối, còn người đọc
           vẫn thấy trọn đĩa ngân hà. */
        var cx = W * 0.66, cy = H * 0.60;
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(NGHIENG); ctx.translate(-cx, -cy);
        /* `lighter` để các lớp CỘNG ánh sáng vào nhau — đó là cách ánh sáng
           thật hoạt động, và là lý do chỗ dày sao trông rực lên. */
        ctx.globalCompositeOperation = 'lighter';
        var i, o, x, y, g;

        for (i = 0; i < vanMay.length; i++) {
          o = vanMay[i]; if (!itMotion) o.g += o.v;
          x = cx + Math.cos(o.g) * o.r; y = cy + Math.sin(o.g) * o.r * DET;
          g = ctx.createRadialGradient(x, y, 0, x, y, o.rad);
          g.addColorStop(0, o.m); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = o.o; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, o.rad, 0, 6.2832); ctx.fill();
        }
        for (i = 0; i < bui.length; i++) {
          o = bui[i]; if (!itMotion) o.g += o.v;
          x = cx + Math.cos(o.g) * o.r; y = cy + Math.sin(o.g) * o.r * DET;
          ctx.globalAlpha = o.o; ctx.fillStyle = o.m;
          ctx.beginPath(); ctx.arc(x, y, o.s, 0, 6.2832); ctx.fill();
        }

        /* Quầng lõi — ba chặng màu cho sáng dần vào giữa */
        /* Quầng lõi bám theo R chứ không theo màn: đĩa to mà lõi giữ nguyên
           thì thành cái đèn pin giữa đám bụi. Hệ số 0.46 (thay vì 0.74 như
           tỉ lệ cũ) để lõi chỉ nhỉnh lên một chút — phần to ra phải là NHÁNH
           XOẮN, không phải cục sáng. */
        var Rl = R * 0.46;
        g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rl);
        g.addColorStop(0, 'rgba(255,248,253,.80)');
        g.addColorStop(.16, 'rgba(251,227,240,.46)');
        g.addColorStop(.42, 'rgba(227,170,221,.20)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, Rl, 0, 6.2832); ctx.fill();

        for (i = 0; i < sao.length; i++) {
          o = sao[i]; if (!itMotion) o.g += o.v;
          var nhay = itMotion ? 1 : 0.6 + 0.4 * Math.sin(t * o.ns + o.nh);
          x = cx + Math.cos(o.g) * o.r; y = cy + Math.sin(o.g) * o.r * DET;
          ctx.globalAlpha = o.o * nhay; ctx.fillStyle = o.m;
          ctx.beginPath(); ctx.arc(x, y, o.s, 0, 6.2832); ctx.fill();
        }

        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    };
  }

  /* ══════════ ĐIỀU PHỐI ══════════ */
  function dangToi() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return matchMedia('(prefers-color-scheme: dark)').matches;
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
    /* Người tắt chuyển động: vẽ đúng MỘT khung rồi dừng. Vẫn có nền đẹp, chỉ
       là nó đứng yên. */
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
    may = dangToi() ? dungThienHa() : dungHoa();
    coLai();
    /* Vẽ ngay một khung trước khi vào vòng lặp: không có dòng này thì lúc đổi
       theme canvas trắng một nhịp rồi mới có hình. */
    may.ve(t);
    chay();
  }

  doiBo();

  /* Đổi theme → đổi hiệu ứng. Nghe cả hai đường: người bấm nút (data-theme
     đổi trên <html>) và người đổi cài đặt hệ điều hành. */
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
