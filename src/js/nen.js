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
    /* Màu MŨI cánh — cùng sắc nhưng đậm hơn một bậc. Xếp cùng thứ tự với MAU
       để mỗi cánh lấy đúng cặp của nó. */
    var DAM = ['#EFA6C2', '#EC9C9A', '#F4BBD0', '#E6C0C0', '#DFA6D6', '#D8A3E2'];
    var hoa = [];

    function moi(batDau) {
      /* LỚP SÂU: 0 = xa tít, 1 = ngay trước mặt.
         Mọi thứ khác suy ra từ nó — cỡ, độ đậm, tốc độ rơi, độ dày viền. Cánh
         gần thì to, rõ, rơi nhanh; cánh xa thì nhỏ, mờ, trôi chậm. Đó là cách
         mắt người đọc ra chiều sâu, và là lý do màn hoa rơi không thành một
         đám đốm hồng phẳng lì.

         Mũ 0.7 để số cánh NGHIÊNG VỀ PHÍA GẦN: rải đều thì phần lớn cánh rơi
         vào khoảng giữa và không cánh nào đủ to để thành điểm nhìn. */
      var lop = Math.pow(Math.random(), 0.7);
      var iMau = (Math.random() * MAU.length) | 0;
      return {
        lop: lop,
        x: -20 + Math.random() * (W + 40),
        /* Lần đầu rải sẵn khắp chiều cao, để trang vừa mở đã có hoa ở cả trên
           lẫn dưới chứ không phải chờ chúng rơi xuống. */
        y: batDau ? Math.random() * H : -18 - Math.random() * 80,
        r: 5 + lop * 14,
        /* Gió dạt trái chậm hơn tốc độ rơi nhiều lần, nên cánh đi hết chiều
           dọc màn hình mới ra khỏi mép — nửa dưới không bị trống. */
        vy: 0.34 + lop * 1.2,
        vx: -0.07 - lop * 0.34,
        sw: 0.5 + Math.random() * 1.5,
        ph: Math.random() * 6.28,
        sp: 0.011 + Math.random() * 0.024,
        go: Math.random() * 6.28,
        mau: MAU[iMau], dam: DAM[iMau],
        mo: 0.46 + lop * 0.5
      };
    }

    function canh(h, lat) {
      var r = h.r;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.75, -r * 0.72, r * 0.62, r * 0.5, 0, r);
      ctx.bezierCurveTo(-r * 0.62, r * 0.5, -r * 0.75, -r * 0.72, 0, -r);
      ctx.closePath();
      /* Ba chặng màu thay vì hai: trắng ở gốc, màu hoa ở giữa, rồi ĐẬM HƠN ở
         mũi cánh. Hai chặng cho ra một vệt chuyển đều, nhìn như vết mực loang;
         chặng thứ ba làm mũi cánh có trọng lượng và cánh đọc ra là một VẬT chứ
         không phải một vệt màu. */
      var g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.55, h.mau);
      g.addColorStop(1, h.dam || h.mau);
      ctx.fillStyle = g;
      ctx.globalAlpha = h.mo * (0.58 + 0.42 * lat);
      ctx.fill();
      /* Viền dày theo LỚP SÂU. Nền ngả hồng, cánh trắng-hồng không viền thì
         chìm hẳn — cánh vẫn ở đó mà mắt không nhận ra. Cánh gần viền đậm và
         dày hơn, nên nó nổi hẳn lên trước; cánh xa gần như không viền. */
      ctx.strokeStyle = 'rgba(184,112,162,' + (0.26 + h.lop * 0.34).toFixed(3) + ')';
      ctx.lineWidth = 0.55 + h.lop * 1.15;
      ctx.globalAlpha *= 0.92;
      ctx.stroke();
      /* Gân giữa — một nét cong mảnh. Chỉ vẽ cho cánh đủ to, vì dưới ~9px thì
         nó chỉ làm cánh trông bẩn. Đây là chi tiết khiến cánh đọc ra là CÁNH
         HOA chứ không phải một hình giọt nước. */
      if (r > 9) {
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.72);
        ctx.quadraticCurveTo(r * 0.12, 0, 0, r * 0.82);
        ctx.strokeStyle = 'rgba(206,138,178,' + (0.16 + h.lop * 0.2).toFixed(3) + ')';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    return {
      dung: function () {
        /* Mật độ theo DIỆN TÍCH thật, không theo một con số cố định: cùng một
           số cánh thì màn 1440px thấy thưa mà màn 390px thấy dày đặc. */
        /* Cánh to gần gấp đôi bản trước, nên mật độ phải BỚT đi chứ không tăng:
           giữ nguyên số cánh mà phóng to là màn hình kín đặc và thành rối. */
        var n = Math.max(36, Math.min(112, Math.round(W * H / 5200)));
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

  /* ══════════ THIÊN HÀ ══════════
     Bản trước cho ra một SỢI sao mảnh vắt chéo màn hình. Sai ở chỗ mô hình: nó
     rải sao dọc đường xoắn rồi thêm nhiễu vào GÓC. Nhiễu góc ở bán kính lớn thì
     tãi rộng, ở bán kính nhỏ thì gần như không tãi — nên nhánh bó chặt ở trong
     và loe ra ở ngoài, đọc ra là một sợi chỉ chứ không phải một dải.

     Ngân hà thật có bốn tầng, thiếu tầng nào cũng không ra:

       1. NỀN SAO   sao rải khắp khung, KHÔNG quay. Đây là thứ nói "đây là bầu
                    trời", và là tầng bản trước thiếu hẳn.
       2. NHÁNH     không phải đường mà là DẢI: đặt sao lên đường xoắn rồi đẩy
                    lệch một khoảng ngẫu nhiên, có chia lại theo bán kính để bề
                    dày THẬT của dải đều từ trong ra ngoài.
       3. BỤI KHÍ   mảng sáng mờ bám theo cùng đường xoắn với sao, cộng sáng
                    chồng lên nhau — tầng làm nhánh có KHỐI chứ không chỉ có chấm.
       4. LÕI       quầng sáng nhỏ ở tâm, cộng vài cục lệch tâm cho lõi gợn.

     Vẽ sao bằng `fillRect` chứ không `arc`: ở cỡ 1–2px mắt không phân biệt được
     tròn hay vuông, mà fillRect rẻ hơn hẳn — ở đây có tới hơn hai nghìn ngôi. */
  function dungThienHa() {
    var MAU = ['#FFFFFF', '#FBE3F0', '#F5BCBA', '#E3AADD', '#C3C7F3', '#C8A8E9', '#FFF6FB'];
    var nen = [], sao = [], bui = [], cuc = [];
    /* Đĩa nghiêng và ép dẹt để thấy hình xoắn ốc, không phải một vòng tròn. */
    var NGHIENG = -0.34, DET = 0.42;
    var R = 1;
    var NHANH = 2;      /* hai nhánh chính; thêm nữa là rối, không phải là đẹp */
    var VONG = 2.9;     /* nhánh quấn gần một vòng rưỡi */

    /* Xấp xỉ phân phối chuẩn bằng cách cộng bốn số ngẫu nhiên đều. Cần nó để sao
       dồn về TRỤC nhánh và thưa dần ra hai bên — rải đều thì dải có mép cứng
       như một cái băng dán. */
    function chuan() {
      return (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 1.6;
    }

    return {
      dung: function () {
        R = Math.min(W * 0.8, H * 1.3);
        nen = []; sao = []; bui = []; cuc = [];

        /* ── 1. NỀN SAO ── toạ độ theo KHUNG, không theo đĩa, và không quay. */
        var nNen = Math.max(120, Math.min(900, Math.round(W * H / 2600)));
        for (var i = 0; i < nNen; i++) {
          nen.push({
            x: Math.random() * W, y: Math.random() * H,
            s: Math.random() < 0.86 ? 1 : 1.6,
            m: MAU[(Math.random() * MAU.length) | 0],
            o: 0.1 + Math.random() * 0.3,
            nh: Math.random() * 6.28, ns: 0.006 + Math.random() * 0.02
          });
        }

        /* ── 2. SAO TRONG NHÁNH ── */
        var nSao = Math.max(260, Math.min(1700, Math.round(W * H / 950)));
        var t, k, goc;
        for (i = 0; i < nSao; i++) {
          /* t = bán kính chuẩn hoá. Mũ 0.62 dồn sao về phía trong, đúng như đĩa
             thật: càng ra ngoài càng thưa. */
          t = Math.pow(Math.random(), 0.62);
          k = i % NHANH;
          goc = t * VONG * Math.PI + k * (6.2832 / NHANH);
          /* Đẩy lệch theo GÓC, nhưng chia lại cho t: cùng một góc ở bán kính lớn
             cho ra khoảng cách lớn hơn, nên không chia thì dải phình ở ngoài và
             bó ở trong — đúng cái làm bản trước thành một sợi chỉ. */
          /* Bề dày dải tính bằng PIXEL rồi mới đổi ra góc: một khoảng cách
             cố định `w` ứng với góc `w/r`, nên chia cho t. Công thức trước nhân
             thêm một hệ số theo t nữa, thành ra ở vòng trong góc tãi tới gần
             một phần ba vòng tròn và cả đĩa trong bị xoá nhoè thành sương.
             Kẹp trần 0.5 rad cho vùng sát tâm, nơi mọi thứ vốn đã chen chúc. */
          goc += chuan() * Math.min(0.5, 0.075 / Math.max(0.1, t));
          sao.push({
            r: R * t * (1 + chuan() * 0.04), g: goc,
            /* TỐC ĐỘ QUAY. Đủ chậm để không ai thấy chóng mặt, đủ nhanh để mở
               trang một lúc là nhận ra đĩa đang quay — khoảng hai phút rưỡi một
               vòng. Bản trước hạ xuống một phần ba con số này và nó thành đứng
               yên trên thực tế.
               Vòng trong quay nhanh hơn vòng ngoài một chút, đúng như đĩa thật,
               và chính chênh lệch ấy làm nhánh xoắn "chảy". Chỉ một chút thôi:
               chênh nhiều thì sau vài phút nhánh tự cuốn chặt và hình xoắn mất. */
            v: 0.00042 + 0.00020 / (0.5 + t),
            s: Math.random() < 0.9 ? 1 : 1.8,
            m: MAU[(Math.random() * MAU.length) | 0],
            o: 0.34 + Math.random() * 0.66,
            nh: Math.random() * 6.28, ns: 0.008 + Math.random() * 0.026
          });
        }

        /* ── 3. BỤI KHÍ ── cùng đường xoắn với sao, nên mảng sáng nằm ĐÚNG trên
           nhánh chứ không trôi lung tung giữa các nhánh. */
        /* 44 mảng, không phải 64. Bụi khí là lớp cho nhánh có khối; quá tay thì
           nó phủ lên chính dải sao và xoá mất cái nét vừa làm ra. */
        for (i = 0; i < 44; i++) {
          t = Math.pow(Math.random(), 0.5);
          k = i % NHANH;
          goc = t * VONG * Math.PI + k * (6.2832 / NHANH) + chuan() * 0.14;
          bui.push({
            r: R * t, g: goc,
            v: 0.00042 + 0.00020 / (0.5 + t),
            rad: R * (0.07 + Math.random() * 0.17),
            m: ['#E3AADD', '#C3C7F3', '#F5BCBA', '#C8A8E9', '#9F7BD8', '#FBE3F0'][i % 6],
            o: 0.024 + Math.random() * 0.035
          });
        }

        /* ── 4. CỤC SÁNG LỆCH TÂM ── để lõi gợn, không phẳng như một cái đèn pin. */
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

        /* `lighter` để các lớp CỘNG ánh sáng vào nhau — đó là cách ánh sáng thật
           hoạt động, và là lý do chỗ dày sao trông rực lên. */
        ctx.globalCompositeOperation = 'lighter';

        /* Nền sao vẽ TRƯỚC và KHÔNG xoay theo đĩa: nó là bầu trời phía sau. */
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

        /* Quầng lõi — nhỏ hơn hẳn bản trước. Lõi to thì cả màn thành một quầng
           sáng và nhánh xoắn biến mất sau nó. */
        var Rl = R * 0.17;
        g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rl);
        g.addColorStop(0, 'rgba(255,248,253,.6)');
        g.addColorStop(0.2, 'rgba(251,227,240,.32)');
        g.addColorStop(0.5, 'rgba(227,170,221,.16)');
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
