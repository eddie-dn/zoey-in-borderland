/* ═══════════════════════════════════════════════════════════════════════
   NỀN ĐỘNG — bốn theme, bốn hiệu ứng.

     Sakura      cánh hoa anh đào rơi chéo      (port từ HAN-961030-a)
     Galaxy      đĩa thiên hà xoắn ốc           (port từ HAN-961030-b)
     Tĩnh lặng   thác nước · giọt · gợn · sương (dựng mới cho blog)

   Bật ở đâu: front matter `nen: dong` (hoặc `nen: tinh` để tắt). Trang chủ
   mặc định bật. Xem docs/DESIGN-SYSTEM.md §12.

   ── BỐN THỨ KHÁC BẢN GỐC ───────────────────────────────────────────────

   1. MỘT FILE, BA HIỆU ỨNG, TỰ ĐỔI THEO THEME.
      Bản gốc là hai trang riêng nên mỗi trang một canvas cứng. Ở đây người
      đọc bấm đổi theme bất cứ lúc nào, nên phải dừng hiệu ứng cũ và dựng
      hiệu ứng mới ngay tại chỗ. Bảng tra BO ở phần ĐIỀU PHỐI là chỗ duy nhất
      biết theme nào đi với hiệu ứng nào.

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
        /* CỠ CÁNH: 3,2 → 11,4px, trước là 5 → 19.
           Bản trước phóng cánh to gần gấp đôi để "thấy rõ là cánh hoa". Thấy
           rõ thật, nhưng ở 19px trên một màn hero thì mỗi cánh thành một mảng
           màu có viền, và cả màn đọc ra là đám bìa cắt dán chứ không phải hoa
           đang rơi. Hoa anh đào thật, nhìn từ khoảng cách người ta thường nhìn
           nó, là những mẩu rất nhỏ — cái làm nên vẻ đẹp là SỐ LƯỢNG và cách
           chúng lượn, không phải cỡ từng cánh. */
        r: 3.2 + lop * 8.2,
        /* Gió dạt trái chậm hơn tốc độ rơi nhiều lần, nên cánh đi hết chiều
           dọc màn hình mới ra khỏi mép — nửa dưới không bị trống. */
        vy: 0.3 + lop * 1.05,
        vx: -0.06 - lop * 0.3,
        sw: 0.5 + Math.random() * 1.5,
        ph: Math.random() * 6.28,
        sp: 0.011 + Math.random() * 0.024,
        go: Math.random() * 6.28,
        mau: MAU[iMau], dam: DAM[iMau],
        /* ĐỘ ĐẬM: 0,22 → 0,70, trước là 0,46 → 0,96.
           Gần như đục hoàn toàn ở lớp gần. Cánh hoa là vật MỎNG — ánh sáng
           xuyên qua được, nên nó không bao giờ đặc như một mảnh giấy màu. Hạ
           trần xuống 0,70 là chỗ nó bắt đầu đọc ra là cánh hoa; và hạ sàn
           xuống 0,22 thì lớp xa lùi hẳn ra sau, chiều sâu rõ hơn hẳn. */
        mo: 0.30 + lop * 0.55
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
      /* Chặng giữa đẩy xuống 0,62 và mũi đậm chỉ bắt đầu từ 0,88: nhờ vậy phần
         TRẮNG chiếm hơn nửa cánh, còn màu đậm co về đúng cái mũi. Bản trước
         chia 0 / 0,55 / 1 nên nửa dưới cánh là một mảng màu đặc, và chính mảng
         ấy làm cánh trông nặng. Cánh hoa thật nhạt dần về phía gốc và chỉ ngả
         hồng ở rìa ngoài. */
      g.addColorStop(0.62, h.mau);
      g.addColorStop(0.88, h.dam || h.mau);
      g.addColorStop(1, h.dam || h.mau);
      ctx.fillStyle = g;
      ctx.globalAlpha = h.mo * (0.58 + 0.42 * lat);
      ctx.fill();
      /* VIỀN — chỗ làm cả màn hoa thành thô nhất, và là chỗ sửa mạnh tay nhất.

         Bản trước: alpha 0,26 → 0,60, bề dày 0,55 → 1,70px. Trên một cánh chỉ
         rộng mươi pixel thì một nét viền 1,7px chiếm tới một phần sáu bề ngang
         cánh — đọc ra là hình CÓ ĐƯỜNG BAO, tức là một cái nhãn dán, không
         phải một vật mỏng đang lượn trong không khí.

         Nay: alpha 0,08 → 0,26, bề dày 0,35 → 0,75px. Viền còn đúng việc cần
         nó — tách cánh khỏi nền hồng nhạt để nó khỏi chìm — mà thôi tự nhận
         mình là một nét vẽ.

         Và chỉ viền cho cánh ĐỦ TO. Dưới 6px thì đường bao gần bằng cả cánh:
         vẽ vào là được một chấm đậm, xoá sạch phần chuyển màu bên trong. Lớp
         xa vốn đã mờ, không cần viền để tách khỏi nền. */
      if (r > 6) {
        ctx.strokeStyle = 'rgba(184,112,162,' + (0.08 + h.lop * 0.18).toFixed(3) + ')';
        ctx.lineWidth = 0.35 + h.lop * 0.4;
        ctx.globalAlpha *= 0.9;
        ctx.stroke();
      }
      /* Gân giữa — một nét cong mảnh. Chỉ vẽ cho cánh đủ to, vì dưới ngưỡng
         này nó chỉ làm cánh trông bẩn. Đây là chi tiết khiến cánh đọc ra là
         CÁNH HOA chứ không phải một hình giọt nước.

         Ngưỡng nâng từ 9 lên 10px dù cánh đã nhỏ đi — tức là nay CHỈ lớp gần
         nhất mới có gân. Đó là đúng cách mắt hoạt động: chi tiết bên trong chỉ
         đọc được ở vật gần, vẽ gân cho cánh xa là vẽ thứ không ai phân giải
         nổi, và ở cỡ ấy nó chỉ thành một vệt bẩn giữa cánh. */
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
        /* Mật độ theo DIỆN TÍCH thật, không theo một con số cố định: cùng một
           số cánh thì màn 1440px thấy thưa mà màn 390px thấy dày đặc. */
        /* Cánh nhỏ lại thì mật độ phải TĂNG theo, không thì màn hình trống
           trơn: mắt đọc ra "nhiều hoa" bằng tổng diện tích phủ, mà diện tích
           một cánh giảm theo BÌNH PHƯƠNG bán kính. Cánh từ trung bình 12px
           xuống 7,3px là diện tích còn khoảng 37%, nên số cánh phải lên gần
           gấp rưỡi mới giữ được cảm giác cũ — và vì mỗi cánh nhạt hơn nhiều,
           đông hơn vẫn không thành rối. */
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

  /* ══════════ THÁC NƯỚC ══════════
     Theme Tĩnh lặng. Bốn tầng, và thiếu tầng nào cũng không ra thác:

       1. MÀN NƯỚC  vệt dọc rơi nhanh, mờ dần về phía chân — đây là KHỐI nước
                    đang đổ. Vệt nào cũng tan trước khi chạm mặt nước.
       2. GIỌT      vài hạt rời, to và chậm hơn hẳn, rơi TỚI CÙNG và chạm mặt
                    nước. Đây là tầng duy nhất có điểm kết.
       3. GỢN       vòng sóng loang ra từ đúng chỗ giọt vừa chạm.
       4. SƯƠNG     mảng mờ dâng lên ở chân thác — bụi nước bắn lên.

     ── VÌ SAO PHẢI CÓ TẦNG 2 ──
     Bản đầu chỉ có màn nước cộng gợn sóng ngẫu nhiên ở đáy. Nhìn ra ngay là
     sai: vệt nước tan giữa chừng còn vòng sóng thì nổi lên ở chỗ chẳng có gì
     rơi xuống, nên hai tầng đọc thành hai hiệu ứng rời nhau chạy song song.
     Mắt người bắt quan hệ NHÂN QUẢ rất nhanh — phải có một vật rơi tới nơi và
     vòng sóng phải nở ra từ đúng chỗ nó chạm, thì cả màn mới thành một cảnh.

     ── ĐƯỜNG NƯỚC ──
     Mọi thứ quy về `mn` (mặt nước) = 0.74 × chiều cao. Đó là ranh giới giữa
     thác và vũng: trên nó là nước rơi, dưới nó là nước lặng. Không có đường
     này thì gợn sóng rải khắp khung và cả màn thành cơn mưa, không phải thác. */
  function dungThac() {
    /* Sáu màu lấy thẳng từ bảng Tĩnh lặng trong tokens.css — trắng và suong
       cho phần bọt sáng, suoi/reu/troi cho thân nước. */
    var MAU = ['#FFFFFF', '#DAE8F5', '#9FD3EA', '#A8DED6', '#BAD9F4', '#7FB6D8'];
    var vet = [], giot = [], gon = [], suong = [], toe = [];
    var mn = 0;          /* y của mặt nước */

    function moiVet(batDau) {
      /* LỚP SÂU: 0 = màn nước phía xa, 1 = ngay trước mặt. Y hệt cách hoa rơi
         dựng chiều sâu — cỡ, độ đậm và tốc độ đều suy ra từ một con số này.
         Mũ 0.75 nghiêng về phía gần để có vài vệt đủ rõ làm điểm nhìn; rải đều
         thì cả màn ra một lớp sương xám không có lớp lang. */
      var lop = Math.pow(Math.random(), 0.75);
      return {
        lop: lop,
        x: Math.random() * W,
        y: batDau ? Math.random() * mn : -40 - Math.random() * 160,
        /* Vệt càng gần càng DÀI: cùng một khoảng thời gian phơi sáng, vật đi
           nhanh hơn thì để lại vệt dài hơn. Đây là chỗ làm nước có tốc độ. */
        /* Đã chậm dần ba nhịp so với bản đầu: 3,4+9,5 → 2,6+7,1 → 1,9+5,2 →
           1,35+3,6, còn chừng 40% tốc độ ban đầu. Thác chảy xiết đọc ra là thác
           lũ, mà theme này tên là Tĩnh lặng.

           Mỗi lần giảm tốc thì `dai` giảm theo ĐÚNG tỉ lệ ấy, không giữ nguyên:
           vệt dài là dấu của vật đi nhanh, nên chậm mà vệt vẫn dài thì nước
           trông như bị kéo giãn chứ không phải chảy chậm. */
        dai: 12 + lop * 39,
        rong: 0.7 + lop * 1.9,
        vy: 1.35 + lop * 3.6,
        /* Dạt ngang rất nhẹ và LUÔN cùng một chiều: thác có hướng gió của nó.
           Cho mỗi vệt một chiều riêng thì màn nước loạn như tuyết rơi. */
        vx: 0.06 + lop * 0.16,
        mau: MAU[(Math.random() * MAU.length) | 0],
        mo: (0.25 + lop * 0.52)
      };
    }

    function moiGiot(batDau) {
      var lop = Math.pow(Math.random(), 0.6);
      /* Mỗi giọt nhắm sẵn một điểm chạm trong DẢI nước. Cho mọi giọt cùng chạm
         ở `mn` thì mười tám vòng sóng nở ra trên đúng một đường ngang, và mắt
         đọc ngay ra cái đường ấy — vũng nước thành một vạch kẻ. */
      /* Mũ 1,7 dồn phần lớn giọt về phía MÉP TRÊN của dải nước, sát đường mặt
         nước. Rải đều (mũ 1) thì nửa số giọt chạm ở nửa dưới — chỗ nằm khuất
         sau ô trích dẫn và chân trang, nên công toé nước rơi vào chỗ không ai
         nhìn thấy. Vẫn còn ít giọt chạm sâu, đủ giữ cảm giác mặt nước là một
         MẶT chứ không phải một vạch. */
      var s = Math.pow(Math.random(), 1.7);
      return {
        lop: lop, s: s,
        cham: mn + s * (H - mn) * 0.92,
        x: 20 + Math.random() * Math.max(1, W - 40),
        /* Sinh ra ngay trên mép màn chứ không từ tít trên cao. Quãng rơi cũ
           tới 440px nằm ngoài khung: với tốc độ đã chậm ba nhịp, một giọt mất
           hơn hai mươi giây mới vào tới khung hình, nên một lúc lâu sau khi mở
           trang gần như không có cú chạm nào. */
        y: batDau ? Math.random() * mn : -12 - Math.random() * 90,
        r: 1.6 + lop * 2.6,
        /* Giọt phải chậm theo màn nước, nếu không nó vượt lên trước và đọc
           ra là hai thứ rơi trong hai trọng trường khác nhau. */
        vy: 0.95 + lop * 1.8,
        mo: 0.42 + lop * 0.55
      };
    }

    /* Gợn sóng nở ra từ chỗ giọt chạm. Bán kính đích theo lớp sâu của giọt:
       giọt gần thì to, nên vòng sóng nó tạo ra cũng rộng hơn.

       `y` rải trong cả DẢI nước chứ không nằm đúng trên đường mặt nước: mặt
       nước nhìn xiên từ trên xuống thì nó là một MẶT, không phải một đường —
       chỗ xa nằm cao trên màn, chỗ gần nằm thấp. Dồn hết gợn vào một đường thì
       cả vũng bẹp lại thành một sợi chỉ. Càng xuống thấp (càng gần người xem)
       vòng sóng càng to, nên bán kính đích nhân thêm theo độ sâu. */
    /* ── NƯỚC HẮT LÊN ──
       Vòng sóng nói "có thứ gì vừa chạm xuống". Nó KHÔNG nói được "thứ ấy
       nặng bao nhiêu" — sóng loang ra là chuyện của mặt nước, không phải của
       cú va. Mấy hạt bắn ngược lên rồi rơi lại mới là dấu của cú va, và thiếu
       nó thì giọt nước chạm mặt nước êm như chạm vào bông.

       ── CHỖ CÓ CHỖ KHÔNG ──
       Chỉ chừng ba phần năm số giọt bắn toé, và số hạt mỗi lần cũng khác nhau.
       Giọt nào cũng toé đều thì mắt bắt ra ngay cái đều ấy, và cả mặt nước đọc
       thành một cỗ máy đang chạy đúng nhịp. Ngẫu nhiên ở đây không phải để cho
       "tự nhiên" một cách chung chung — nó để PHÁ cái nhịp.

       Hạt bay theo parabol thật: vận tốc dọc âm lúc bật lên, cộng dần trọng
       lực mỗi khung. Cho nó đi thẳng rồi tắt thì ra pháo hoa, không ra nước. */
    function moiToe(x, y, lop) {
      if (Math.random() > 0.62) return;
      var n = 2 + ((Math.random() * 4) | 0);
      for (var k = 0; k < n; k++) {
        toe.push({
          x: x, y: y,
          /* ── MỀM HƠN ──
             Bản trước bật lên tới 2,1 px mỗi khung dưới trọng lực .062: hạt
             vọt cao, đi nhanh, và mắt đọc ra tia lửa chứ không ra nước. Nay
             tốc độ bật còn chừng ba phần năm và trọng lực nhẹ đi một nửa —
             hạt lên tới độ cao xấp xỉ cũ nhưng mất nhiều khung hơn để tới
             đỉnh, và đó chính là chỗ "mềm" nằm. Hạt cũng nhỏ và nhạt hơn. */
          vx: (Math.random() - 0.5) * (0.62 + lop * 0.8),
          vy: -(0.52 + Math.random() * (0.62 + lop * 0.72)),
          r: 0.6 + Math.random() * (0.5 + lop * 0.7),
          mo: 0.3 + Math.random() * 0.26,
          /* Mốc rơi lại: chính chỗ nó bật lên. Hạt rơi quá mốc ấy là hạt chui
             xuống dưới mặt nước — mà nước thì không trong suốt tới thế. */
          day: y
        });
      }
    }

    function moiGon(x, lop) {
      var s = Math.random();                 /* 0 = mép xa, 1 = sát chân màn */
      gon.push({ x: x, y: mn + s * (H - mn) * 0.92,
                 r: 1, rMax: (18 + lop * 46) * (0.55 + s * 0.85),
                 v: (0.42 + lop * 0.5) * (0.6 + s * 0.8),
                 mo: 0.3 + s * 0.42 });
    }

    return {
      dung: function () {
        mn = H * 0.74;
        /* Mật độ theo DIỆN TÍCH thật, không theo một con số cố định: cùng một
           số vệt thì màn 1440px thấy thưa mà màn 390px thấy dày đặc. */
        var nVet = Math.max(40, Math.min(190, Math.round(W * H / 4200)));
        var nGiot = Math.max(9, Math.min(34, Math.round(W / 58)));
        while (vet.length < nVet) vet.push(moiVet(true));
        vet.length = nVet;
        while (giot.length < nGiot) giot.push(moiGiot(true));
        giot.length = nGiot;

        suong = [];
        /* Bụi nước bám sát chân thác, nên tâm rải quanh ĐƯỜNG NƯỚC chứ không
           rải khắp nửa dưới — rải khắp thì nó thành một lớp mù phủ chữ. */
        for (var i = 0; i < 16; i++) {
          suong.push({
            x: Math.random() * W,
            y: mn - Math.random() * H * 0.1,
            r: H * (0.06 + Math.random() * 0.13),
            vy: 0.06 + Math.random() * 0.14,
            mo: 0.055 + Math.random() * 0.07,
            m: MAU[2 + ((Math.random() * 4) | 0)]
          });
        }

        /* Người tắt chuyển động vẫn phải thấy một cảnh CÓ BỐ CỤC, không phải
           một màn nước đứng hình giữa khoảng không. Rải sẵn mấy vòng sóng ở
           các kích cỡ khác nhau thì khung tĩnh vẫn đọc ra là mặt nước đang
           động — chỉ là ta bắt được nó ở đúng một khoảnh khắc. */
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

        /* ── 4. SƯƠNG ── vẽ TRƯỚC: nó là lớp xa nhất, nước rơi qua phía trước nó. */
        for (i = 0; i < suong.length; i++) {
          o = suong[i];
          if (!itMotion) {
            o.y -= o.vy;
            /* Dâng quá cao thì thả lại xuống chân thác. Sương bốc lên mãi tới
               đỉnh màn là mây, không phải bụi nước. */
            if (o.y < mn - H * 0.34) { o.y = mn + H * 0.04; o.x = Math.random() * W; }
          }
          g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
          g.addColorStop(0, o.m);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = o.mo; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill();
        }

        /* ── 1. MÀN NƯỚC ── */
        ctx.lineCap = 'round';
        for (i = 0; i < vet.length; i++) {
          o = vet[i];
          if (!itMotion) { o.y += o.vy; o.x += o.vx; }
          if (o.y - o.dai > mn) { vet[i] = moiVet(false); continue; }
          if (o.x > W + 10) o.x = -10;

          /* TAN DẦN KHI TỚI GẦN MẶT NƯỚC. Cắt cụt ở đúng đường nước thì mỗi
             vệt kết thúc bằng một nhát dao ngang, và cả màn có một đường kẻ
             thẳng mà mắt bắt được ngay. Nhạt dần trong 22% chiều cao cuối thì
             nước "đi vào" bụi sương. */
          var gan = (o.y - (mn - H * 0.22)) / (H * 0.22);
          var mo = o.mo * (gan > 0 ? Math.max(0, 1 - gan) : 1);
          if (mo <= 0.004) continue;

          /* Vệt tô bằng GRADIENT dọc, không phải màu đặc: đầu vệt (chỗ nước
             đang tới) đậm, đuôi nhạt dần về không. Màu đặc cho ra một cái que,
             gradient cho ra một vệt chuyển động. */
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

        /* ── 2b. MẶT NƯỚC ── vẽ TRƯỚC giọt và gợn: nó là cái mặt, hai thứ kia
           nằm trên nó.

           Chỉ còn MỘT lớp: dải màu đậm dần xuống chân màn. Nước sâu thì tối và
           no màu hơn nước nông, và cái dốc màu ấy là toàn bộ chỗ dựa để mắt
           đọc ra "đây là một mặt nước nhìn xiên".

           Hai lớp kia — một nét kẻ ở đường nước và năm lằn trôi bên dưới — đã
           bỏ, lý do ghi ngay dưới đây và ở chỗ năm lằn. Cùng một chuyện: tả
           nước bằng đường kẻ thì ra hình học, không ra nước. */
        var day = H - mn;
        g = ctx.createLinearGradient(0, mn, 0, H);
        /* Đậm hơn hẳn bản trước (.13/.26 → .2/.42). Ở độ đậm cũ, dải nước
           chìm gần hết vào nền và cả nửa dưới màn đọc ra là một khoảng trống
           hơi xanh — không ra mặt nước. Mặt nước phải là một MẶT nhìn thấy
           được thì mấy vòng sóng trên nó mới có chỗ để nằm. */
        g.addColorStop(0, 'rgba(155,211,218,.05)');
        g.addColorStop(0.35, 'rgba(155,211,218,.2)');
        g.addColorStop(1, 'rgba(105,178,194,.42)');
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.fillRect(0, mn, W, day);

        /* ── ĐƯỜNG KẺ MẶT NƯỚC: ĐÃ BỎ ──
           Từng có một nét mảnh chạy ngang ở mốc `mn`, nhấp nhô theo hai sóng
           sin, để NÓI RA rằng "từ đây trở xuống là mặt nước". Nó làm đúng việc
           ấy, và đó chính là vấn đề: nó nói bằng một ĐƯỜNG KẺ.

           Trên một màn hero vốn đã có hai đường kẻ dọc của lưới, thêm một nét
           ngang chạy suốt bề rộng là thêm một cạnh hình học — mắt đọc nó chung
           với lưới, thành ra mặt nước trông như một ô nữa của bố cục chứ không
           như nước. Cùng lý do đã bỏ năm lằn trôi ở ngay dưới.

           Mặt nước giờ nói bằng thứ không phải nét vẽ: dải màu đậm dần xuống
           chân màn, vòng sóng loang ra mỗi lần có giọt chạm, và mấy hạt bắn
           ngược lên. Mềm hơn, và không cái nào là một đường thẳng. */

        /* ── NĂM LẰN TRÔI: ĐÃ BỎ ──
           Chúng là năm vòng elip rất bẹt nằm ngang, trôi qua trôi lại để tả
           chiều sâu mặt nước. Vấn đề: chúng là NĂM ĐƯỜNG KẺ song song, và năm
           đường kẻ song song thì mắt đọc ra một cái lưới chứ không ra một mặt
           nước — nhất là khi mỗi đường đều đủ mảnh và đủ đều để trông như nét
           vẽ. Chiều sâu ở đây đã có sẵn trong dải màu chuyển và trong cỡ vòng
           sóng to dần về phía dưới; thêm năm vạch nữa chỉ là tả lại một lần
           nữa bằng thứ ngôn ngữ sai. */

        /* ── 2. GIỌT ── rơi tới cùng, chạm mặt nước rồi sinh ra một vòng sóng. */
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
          /* Hình giọt: ép dọc theo tốc độ. Một hình tròn rơi thẳng đọc ra là
             hạt bụi; kéo dài ra theo chiều rơi thì đọc ra là nước. */
          ctx.beginPath();
          ctx.ellipse(o.x, o.y, o.r, o.r * (1 + o.vy * 0.26), 0, 0, 6.2832);
          ctx.fill();
        }

        /* ── 3. GỢN ── ELIP chứ không phải tròn: mặt nước nhìn xiên từ trên
           xuống thì vòng sóng tròn chiếu lên màn thành hình bẹt. Vẽ tròn là cả
           vũng nước dựng đứng lên như một tấm bảng. */
        for (i = gon.length - 1; i >= 0; i--) {
          o = gon[i];
          if (!itMotion) { o.r += o.v; }
          var pha = o.r / o.rMax;
          if (pha >= 1) { gon.splice(i, 1); continue; }
          /* Mờ dần theo BÌNH PHƯƠNG phần còn lại: sóng loang ra thì năng lượng
             tãi trên một chu vi mỗi lúc một dài, nên nó tắt nhanh về cuối chứ
             không tắt đều. Giảm tuyến tính thì vòng sóng cứ lởn vởn mãi ở rìa. */
          ctx.globalAlpha = (o.mo || 0.3) * (1 - pha) * (1 - pha);
          ctx.strokeStyle = MAU[5];
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(o.x, o.y, o.r, o.r * 0.3, 0, 0, 6.2832);
          ctx.stroke();
          /* Vòng thứ hai chạy sau, nhỏ hơn và nhạt hơn. Một vòng đơn đọc ra là
             một cái vòng tròn; hai vòng đuổi nhau mới đọc ra là sóng. */
          if (o.r > 12) {
            ctx.globalAlpha *= 0.5;
            ctx.beginPath();
            ctx.ellipse(o.x, o.y, o.r * 0.58, o.r * 0.58 * 0.3, 0, 0, 6.2832);
            ctx.stroke();
          }
        }

        /* ── 3b. HẠT NƯỚC HẮT LÊN ── vẽ SAU vòng sóng: chúng bay bên trên mặt
           nước, còn vòng sóng thì nằm trên mặt. */
        for (i = toe.length - 1; i >= 0; i--) {
          o = toe[i];
          if (!itMotion) { o.x += o.vx; o.y += o.vy; o.vy += 0.032; }
          if (o.y >= o.day) { toe.splice(i, 1); continue; }
          /* Mờ dần theo ĐỘ CAO còn lại: hạt lên cao nhất là lúc mờ nhất, rồi
             rõ lại khi rơi xuống. Giảm đều theo thời gian thì hạt tắt giữa
             không trung và cú toé trông như bốc hơi. */
          ctx.globalAlpha = o.mo * Math.max(0.1, 1 - (o.day - o.y) / 26);
          /* Cùng lý do với đường nước: hạt TRẮNG trên nền gần trắng là hạt vô
             hình. Dùng đúng màu vòng sóng — hạt bắn lên và vòng sóng loang ra
             là hai nửa của cùng một cú chạm. */
          ctx.fillStyle = MAU[5];
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.r, 0, 6.2832);
          ctx.fill();
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
        /* ── ĐĨA PHẢI PHỦ HẾT KHUNG ──
           `Math.min` là chỗ sai: ở khổ dọc, W nhỏ nên nó lấy W×0.8 — đĩa co
           lại còn một dải ngang nằm giữa màn, trên và dưới trống hoác. Mà đĩa
           còn bị ép dẹt (DET 0.42) và nghiêng, nên nửa bề cao thật của nó chỉ
           chừng 0.75R: muốn phủ hết chiều cao từ tâm ở 0.6H thì cần R ≥ 0.8H.

           `Math.max` với H×1.05 lo đúng chuyện đó, và ở khổ ngang thì W×0.8
           vẫn thắng nên màn rộng không đổi gì. */
        R = Math.max(W * 0.8, H * 1.05);
        nen = []; sao = []; bui = []; cuc = [];

        /* ── 1. NỀN SAO ── toạ độ theo KHUNG, không theo đĩa, và không quay. */
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

        /* ── 2. SAO TRONG NHÁNH ── */
        /* Số sao phải theo ĐĨA, không chỉ theo khung: đĩa to gấp đôi mà giữ
           nguyên số sao thì mật độ nhìn thấy giảm một nửa, và nhánh xoắn nhạt
           đi đúng lúc nó vừa được nới rộng ra. Hệ số dưới đây là tỉ lệ giữa
           bán kính đĩa và cạnh ngắn của khung. */
        var day = Math.max(1, R / (Math.min(W, H) * 1.15));
        var nSao = Math.max(420, Math.min(3200, Math.round(W * H / 620 * day)));
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
             Kẹp trần cho vùng sát tâm, nơi mọi thứ vốn đã chen chúc.

             0.075 → 0.15: DÀY GẤP ĐÔI. Ở bề dày cũ, hai nhánh đọc ra là hai
             đường kẻ có sao rải lên — mảnh và sắc nét như nét vẽ. Ngân hà thật
             thì nhánh là một DẢI có chiều ngang thật, mép nó tãi dần ra chứ
             không có đường bao. Dày lên thì cái tãi ấy mới thấy được, và cả
             đĩa đọc ra là một khối sáng chứ không phải một hình vẽ.
             Trần nới 0.5 → 0.85 theo cùng tỉ lệ; giữ nguyên 0.5 thì vùng trong
             bị kẹp lại và nhánh thắt eo ở giữa. */
          goc += chuan() * Math.min(0.85, 0.15 / Math.max(0.1, t));
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
            /* ĐỘ SÁNG GIẢM DẦN RA NGOÀI. Đĩa thật đặc và rực ở tâm rồi loãng
               dần tới rìa; cho mọi ngôi sáng đều nhau thì được một đám bụi
               phẳng, không ra cái đĩa có chiều sâu. Hệ số (1 - t*0.5) giữ cho
               rìa vẫn còn thấy — nhân mạnh hơn thì nhánh ngoài biến mất. */
            o: (0.42 + Math.random() * 0.58) * (1 - t * 0.5),
            nh: Math.random() * 6.28, ns: 0.008 + Math.random() * 0.026
          });
        }

        /* ── 3. BỤI KHÍ ── cùng đường xoắn với sao, nên mảng sáng nằm ĐÚNG trên
           nhánh chứ không trôi lung tung giữa các nhánh. */
        /* 44 mảng, không phải 64. Bụi khí là lớp cho nhánh có khối; quá tay thì
           nó phủ lên chính dải sao và xoá mất cái nét vừa làm ra. */
        for (i = 0; i < 70; i++) {
          /* Mũ 0.75 dồn mảng sáng về phía TRONG — chỗ khí và bụi thật sự đặc. */
          t = Math.pow(Math.random(), 0.75);
          k = i % NHANH;
          /* 0.14 → 0.28, đi đôi với bề dày dải sao ở trên. Lệch nhau thì mảng
             sáng thành một lõi đặc nằm giữa một dải sao rộng — đọc ra là hai
             tầng rời nhau chứ không phải một nhánh có khối. */
          goc = t * VONG * Math.PI + k * (6.2832 / NHANH) + chuan() * 0.28;
          bui.push({
            r: R * t, g: goc,
            v: 0.00042 + 0.00020 / (0.5 + t),
            rad: R * (0.07 + Math.random() * 0.17),
            m: ['#E3AADD', '#C3C7F3', '#F5BCBA', '#C8A8E9', '#9F7BD8', '#FBE3F0'][i % 6],
            o: (0.03 + Math.random() * 0.045) * (1 - t * 0.35)
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
        /* Quầng lõi kẹp theo KHUNG, không chỉ theo đĩa: đĩa nới rộng ở khổ
           dọc kéo lõi to theo, và một quầng sáng chiếm nửa màn thì nhánh xoắn
           biến mất sau nó. */
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
  /* ══════════════════════════════════════════════════════════════════════
     霜降 — MỘT BUỔI CHIỀU TRÔI SANG ĐÊM, TRÊN GIẤY TRẮNG

     Núi xa mấy lớp, một dải nước ở chân, và một vòng ngày–đêm rất chậm
     (chừng hai phút rưỡi một vòng, xem CHU_KY):

       0.00 – 0.50  mặt trời nhỏ ở cao, hạ dần về chân núi, to dần và đỏ
                    dần, rồi khuất sau dãy núi gần — ngay trên mặt nước.
       0.50 – 0.70  chiều tà: sương ở các thung dâng lên, dày lên; nền trời
                    phủ một lớp mực rất mỏng; đàn chim thưa dần rồi thôi.
       0.60 – 0.95  trăng lên bên trái, sao hiện dần và lấp lánh.
       0.95 – 1.00  đêm nhạt đi, quay về đầu vòng.

     ── VÌ SAO KHÔNG CÓ "TRỜI TỐI" ──
     Nền là canvas trong suốt trên một trang GIẤY TRẮNG. Không thể làm tối
     cả trang mà chữ vẫn đọc được, và một bức thuỷ mặc cũng không tô đen bầu
     trời: đêm được gợi bằng trăng, sao, và một lớp mực rửa rất mỏng phía
     trên. Người xem tự biết là đêm.

     ── BA TẤM NỀN TĨNH, MỘT LỚP ĐỘNG ──
     Núi xa (`xa`) và núi gần + mặt nước (`gan`) vẽ MỘT LẦN vào hai canvas
     ngoài màn hình. Mặt trời nằm GIỮA hai tấm ấy: đi trước dãy xa (đỏ trên
     nền sương, như tranh vẫn vẽ) và khuất sau dãy gần. Sương dâng buổi chiều
     là lớp destination-out vẽ mỗi khung — nó XOÁ mực đi để giấy lộ ra, cùng
     cách sương được vẽ trong tranh. Trắng chồng lên trắng thì không thấy gì;
     bài học ấy đã trả giá một lần ở bản trước.
  ══════════════════════════════════════════════════════════════════════ */
  function dungSuongGiang() {
    var xa = null, gan = null, W0 = 0, H0 = 0, chim = [], sao = [];
    var CHU_KY = 4200;          /* khung hình một vòng — ~70 giây ở 60fps */

    /* ── BỐN BẬC MỰC, KHÔNG PHẢI MỘT BẬC BỐN ĐỘ MỜ ──
       Bản trước chỉ có đúng một màu mực (`17,19,21`) và phân tầng xa gần bằng
       cách hạ độ mờ. Hạ độ mờ của cùng một màu thì ra cùng một sắc xám nhạt
       hơn — nên năm dãy núi đọc ra là NĂM LỚP CỦA MỘT VỆT, không ra năm khoảng
       cách khác nhau. Mắt đọc chiều sâu qua SẮC chứ không chỉ qua độ đậm: một
       dãy núi cách mười cây số thì cả một khối không khí nằm giữa, và khối
       không khí ấy làm mực ngả LẠNH và nhạt sắc đi, chứ không chỉ mờ.

       Nên bốn bậc ở đây khác nhau cả sắc lẫn độ: xa thì xám ngả lam bạc, càng
       gần càng dồn về mực đen thật. Cả bốn đều dưới 8 điểm bão hoà — cùng mức
       "điểm chút màu" mà `--bg-tint` của theme này chịu được (xem tokens.css),
       nên bức tranh vẫn là tranh mực, không thành tranh màu. */
    var MUC      = '17,19,21';    /* mực đặc — chim, sao, nét cuối */
    var MUC_XA   = '118,125,134'; /* dãy xa nhất — sau một khối không khí dày */
    var MUC_GIUA = '80,86,94';    /* dãy giữa */
    var MUC_GAN  = '30,34,40';    /* dãy gần — khối chính của bức */
    var MUC_BO   = '22,25,29';    /* mép bờ sát nước — chỗ đậm nhất */

    /* ── NÉT ĐI BẰNG MỰC ĐẶC HƠN LỚP RỬA ──
       Người vẽ mực chấm bút vào mực đặc để đi nét, rồi pha loãng ra để rửa —
       không ai đi cả hai bằng một độ mực. Có lý do kỹ thuật: nét nằm NGAY
       TRÊN chỗ lớp rửa đậm nhất (cả hai đều áp vào đường sống), nên nét chỉ
       đọc ra được khi nó đậm hơn cái nền ngay cạnh nó. Bản trước đi nét bằng
       đúng mực của lớp rửa: đo ra nét còn NHẠT HƠN vệt mực nằm dưới nó, nên
       viền tàng hình — mắt chỉ thấy một mép chuyển mềm.

       Nét cũng phải nhạt sắc dần theo chiều sâu như lớp rửa, nếu không thì
       dãy xa nhất lại có cái viền đen sắc nét nhất bức. */
    var NET_XA   = '88,95,104';
    var NET_GIUA = '46,51,58';
    var NET_GAN  = '16,18,22';

    /* Mép nước. Nâng khỏi đáy để dải nước đủ chỗ hứng bóng mặt trời và trăng. */
    var MEP_NUOC = 0.755;
    /* Đường chân trời — mốc chung cho nền trời, cung mặt trời và cung trăng. */
    var CHAN_TROI = 0.70;

    function kep(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function muot(p, a, b) { var u = kep((p - a) / (b - a)); return u * u * (3 - 2 * u); }
    function mau(r, g, b) { return Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b); }

    /* Số ngẫu nhiên CÓ HẠT GIỐNG. Vân đá được nướng vào tấm nền một lần, nhưng
       tấm nền được nướng LẠI mỗi lần đổi khổ màn — dùng Math.random thì xoay
       ngang điện thoại một cái là cả sườn núi đổi vân. Cùng một hạt giống thì
       cùng một hòn núi, ở mọi khổ màn. */
    function bam(h) {
      return function () { h = (h * 1664525 + 1013904223) % 4294967296; return h / 4294967296; };
    }

    function veChim(c, x, y, r, mo, vo) {
      c.strokeStyle = 'rgba(' + MUC + ',' + mo.toFixed(3) + ')';
      c.lineWidth = Math.max(0.9, r * 0.13);
      c.lineCap = 'round';
      var nang = 0.34 + vo * 0.5;
      c.beginPath();
      c.moveTo(x - r, y);
      c.quadraticCurveTo(x - r * 0.45, y - r * nang, x, y);
      c.quadraticCurveTo(x + r * 0.45, y - r * nang, x + r, y);
      c.stroke();
    }

    function moiChim(batDau) {
      var lop = Math.random();
      return {
        lop: lop,
        x: batDau ? Math.random() * W : -40 - Math.random() * W * 0.5,
        y: H * (0.12 + Math.random() * 0.24),
        r: 4 + lop * 9,
        v: 0.16 + lop * 0.34,
        pha: Math.random() * Math.PI * 2,
        nhip: 0.055 + Math.random() * 0.05,
        mo: 0.20 + lop * 0.4,
        bien: 5 + lop * 12,
        nhipY: 0.004 + Math.random() * 0.004
      };
    }

    /* Màu giấy của theme — để tô ĐẶC dãy núi gần. Mực rửa trong suốt không che
       được gì; tô một lớp giấy dưới mực là núi thành vật thật. */
    var GIAY = (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#fff').trim() || '#fff';
    function giayRGB() {
      var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(GIAY);
      return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : '255,255,255';
    }

    /* ── MỘT BỆT LOANG ──
       Một hàm cho cả sương, cả quầng sáng, cả vệt ấm ở chân trời: bệt mực
       loang ra từ một tâm, hình bầu dục, mép tan hẳn.

       Vì sao một hàm dùng chung: ba thứ ấy khác nhau đúng ở màu và ở chỗ ĐỔ
       mực hay LẤY mực. Gradient tròn không nhận tỉ lệ bầu dục, nên co trục
       tung lại bằng `scale` rồi vẽ tròn — cùng một mẹo cho cả ba. */
    function loang(c, cx, cy, rx, ry, m, a, xoa) {
      if (a <= 0.002 || rx <= 0.5 || ry <= 0.5) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';
      c.translate(cx, cy);
      c.scale(1, ry / rx);
      var g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0,    'rgba(' + m + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.40, 'rgba(' + m + ',' + (a * 0.70).toFixed(3) + ')');
      g.addColorStop(0.72, 'rgba(' + m + ',' + (a * 0.22).toFixed(3) + ')');
      g.addColorStop(1,    'rgba(' + m + ',0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    /* ── BÚT MỀM ──
       Một nét có mép tan dần, dựng bằng cách chồng nhiều nét cùng đường mà
       khác bề rộng: rộng nhất ở ngoài, hẹp nhất ở trong, mỗi nét một lớp mực
       rất mỏng. Cộng lại ra một dải đậm ở lõi và nhạt ra hai mép.

       ── VÌ SAO KHÔNG DÙNG `ctx.filter = 'blur()'` ──
       Đã thử, và đã bỏ. Nhoè bằng `filter` thì đúng về mặt hình học, nhưng
       Chromium xé vùng lọc thành từng Ô rồi lọc riêng từng ô, và với một nét
       rộng vài trăm pixel trải hết bề ngang thì mép các ô không khớp nhau:
       trên màn điện thoại cả sườn núi hiện ra thành một bậc thang những khối
       chữ nhật lệch nhau một hai nấc xám. Không phải lỗi mình gọi sai, và
       không có cách nào chỉnh — nên không dùng.

       Thêm hai cái được của cách này: `filter` trên một nét HẸP hơn bán kính
       nhoè thì dàn mỏng nét ra và làm mất độ đậm (một nét 3px nhoè 6px không
       ra nét 3px mềm mép, nó ra nét 15px nhạt hơn năm lần) — chồng nét thì
       không bao giờ mất mực. Và `filter` không có ở Safari trước 16.4.

       Số lớp tính từ BỀ RỘNG THẬT, không để cứng: mép của hai nét cạnh nhau
       phải cách nhau dưới khoảng một điểm ảnh, vì mắt bắt ra chỗ gãy độ đậm
       giỏi hơn bắt ra độ đậm nhiều lần — cách nhau 5px thì đọc ra một chùm
       đường đồng mức, cách nhau 1px thì đọc ra một dải chuyển liền.

       Mực chồng nhau không cộng tuyến tính (hai lớp 0,3 ra 0,51 chứ không ra
       0,6), nên `dam` khai mức đậm MUỐN CÓ ở lõi và độ mờ mỗi lớp được giải
       ngược ra từ đó. */
    function toMem(c, veDuong, rong0, rong1, muc, dam, lopToiDa) {
      var lop = Math.max(5, Math.min(lopToiDa || 60, Math.round((rong1 - rong0) / 2.2)));
      var a = 1 - Math.pow(1 - Math.min(0.97, dam), 1 / lop);
      var mo = 'rgba(' + muc + ',' + a.toFixed(4) + ')';
      for (var k = lop - 1; k >= 0; k--) {
        c.lineWidth = rong0 + (rong1 - rong0) * (k / (lop - 1));
        c.strokeStyle = mo;
        veDuong();
        c.stroke();
      }
    }

    /* ── MỘT DÃY NÚI ──
       `o.song` là danh sách [tần số, biên độ, lệch pha] — mỗi dãy một bộ riêng
       nên không dãy nào trùng đường với dãy nào.

       ── TẦN SỐ PHẢI THEO BỀ NGANG THẬT, KHÔNG THEO TỈ LỆ ──
       Bản trước tính theo `u = x / W0`, tức là số ngọn núi trên một dãy luôn
       bằng nhau bất kể màn rộng hay hẹp. Trên màn 1400px thì vừa; nhét đúng
       chừng ấy ngọn vào một cái điện thoại 375px thì chúng chen nhau thành
       một hàng răng cưa lởm chởm — đúng cái "trên mobile núi lôm côm".
       Nay bước sóng đo bằng PIXEL: màn hẹp thấy ít ngọn hơn, mỗi ngọn vẫn
       rộng đúng chừng ấy — giống hệt việc cắt một khúc của cùng một bức tranh.

       ── BỐN LẦN ĐI MỰC, KHÔNG PHẢI MỘT ──
       Một dãy núi ở đây được đi bốn lượt, đúng thứ tự người vẽ mực thật làm:

         1 · GIẤY   tô đặc (chỉ dãy gần) — để nó CHE được thứ nằm sau.
         2 · RỬA    một lớp mỏng phủ cả khối, cho nó có thân.
         3 · LÒNG   mực đậm ÁP SÁT ĐƯỜNG SỐNG rồi tan xuống chân.
         4 · NÉT    đường sống, đi bằng nét thay đổi bề dày.

       Lượt 3 là lượt bản trước không có, và là chỗ hỏng chính. Một gradient
       dọc thì đậm nhạt theo ĐỘ CAO TRÊN KHUNG, còn núi thì phải đậm nhạt theo
       KHOẢNG CÁCH TỚI ĐƯỜNG SỐNG — hai chuyện khác nhau, và chúng chỉ trùng
       nhau khi đường sống nằm ngang. Sống núi có đỉnh có khe, nên gradient dọc
       làm đỉnh nhạt bằng khe: cả dãy xẹp thành một dải xám nằm ngang, đúng cái
       "hai object chính đọc ra là hai thanh phẳng".

       Lượt 3 chồng vài nét RẤT DÀY lên chính đường sống, nét sau mảnh hơn và
       đậm hơn nét trước, tất cả bị cắt trong lòng khối. Cộng lại ra một vệt
       mực đậm nhất ngay tại sống rồi nhạt dần xuống — tức là một gradient CHẠY
       THEO ĐƯỜNG SỐNG, thứ mà canvas không cho dựng trực tiếp. */
    function veNui(c, o) {
      var y0 = o.y * H0, cao = o.cao * H0, song = o.song;
      var muc = o.muc, kW = W0 / 1400;
      var d = [], i, j, k;
      for (var x = 0; x <= W0; x += 2) {
        var u = x / W0, h = 0;
        for (k = 0; k < song.length; k++) {
          h += Math.sin(u * song[k][0] * kW + song[k][2]) * song[k][1];
        }
        d.push([x, y0 - h * cao]);
      }

      /* Đỉnh và khe của chính dãy này — để nét ở lượt 4 biết chỗ nào là đỉnh. */
      var yCao = Infinity, yThap = -Infinity;
      for (i = 0; i < d.length; i++) {
        if (d[i][1] < yCao) yCao = d[i][1];
        if (d[i][1] > yThap) yThap = d[i][1];
      }
      var khoang = Math.max(1, yThap - yCao);

      function thanNui() {
        c.beginPath();
        c.moveTo(0, H0);
        for (var q = 0; q < d.length; q++) c.lineTo(d[q][0], d[q][1]);
        c.lineTo(W0, H0);
        c.closePath();
      }
      function duongSong(a, b) {
        c.beginPath();
        c.moveTo(d[a][0], d[a][1]);
        for (var q = a + 1; q <= b; q++) c.lineTo(d[q][0], d[q][1]);
      }

      /* ── 1 · GIẤY ──
         ── VÌ SAO DÃY XA CŨNG PHẢI CÓ LỚP GIẤY ──
         Bản trước chỉ hai dãy gần được tô giấy; ba dãy xa để trong suốt hoàn
         toàn. Một dãy trong suốt thì KHÔNG CHE được gì, và ba chuyện xấu đi
         cùng nhau:

         · Đường sống của dãy sau chạy XUYÊN QUA thân dãy trước. Mắt đọc ra ba
           tấm voan xếp lên nhau, không ra ba dãy núi cách nhau mấy cây số —
           vì vật thật thì che nhau, đó là dấu hiệu duy nhất nói ra cái nào
           đứng trước.

         · MẶT TRỜI VÀ MẶT TRĂNG được vẽ TRƯỚC cả ba dãy, nên chúng lọt qua
           núi mà hiện ra. Đây đúng là chỗ "hai object chính hơi mờ": không
           phải sương che, mà là cái đĩa đang nằm sau một hòn núi nhìn thấu
           được. Một mặt trời còn chưa mọc khỏi sống núi mà đã thấy tròn vành
           vạnh thì mắt không đọc ra nó tròn — nó đọc ra là mờ.

         · Lớp rửa của dãy sau cộng dồn vào lớp rửa của dãy trước, nên chỗ nào
           trùng nhau cũng đậm hơn — thang sắc độ theo chiều sâu dựng công
           bằng mấy vẫn bị mấy vùng trùng đó phá.

         Nên `o.dac` nay là một SỐ, không phải một cờ bật-tắt: dãy xa tô giấy
         gần đặc (0,88–0,94) — đủ để che hình, còn chừa một phần rất mỏng cho
         quầng sáng sau núi rọi qua, đúng chặng "rạng" trước lúc mặt trời mọc.
         Hai dãy gần thì đặc hẳn. */
      /* ── 0 · SƯƠNG CHÂN NÚI ──
         Một dải giấy mỏng rắc DỌC THEO đường sống, vẽ TRƯỚC cả lớp giấy đặc,
         nên nó xoá mờ đúng cái CHÂN của dãy đứng sau.

         Không có dải này thì mỗi đường sống là một chỗ cắt: mực của dãy sau
         đang đậm, tới sống dãy trước thì đứt phựt và đổi sang mực của dãy
         trước. Bức tranh gốc không có chỗ cắt nào — chân dãy nào cũng tan hẳn
         vào một vệt sương trước khi dãy trước nó dựng lên. Đó là thứ làm năm
         dãy núi thành MỘT không gian có không khí ở giữa, chứ không thành năm
         miếng giấy dán chồng.

         Chỉ hai dãy gần dùng nó, và dùng bằng cách tô GIẤY. Dãy xa thì phải
         XOÁ (xem `veSuong`), vì thứ nằm dưới chúng là nền trời — trời lọt qua
         sương là đúng; còn xoá trên tấm `gan` thì lại chọc lỗ xuống dãy xa. */
      if (o.suong) {
        c.save();
        c.lineCap = 'butt';
        c.lineJoin = 'round';
        toMem(c, function () { duongSong(0, d.length - 1); },
              cao * 0.06, cao * 1.15, giayRGB(), o.suong, 48);
        c.restore();
      }

      thanNui();
      var docDac = o.dac === true ? 1 : (o.dac || 0);
      if (docDac > 0) {
        c.save();
        c.globalAlpha = docDac;
        c.fillStyle = GIAY;
        c.fill();
        c.restore();
      }

      /* ── 2 · RỬA ── */
      var g;
      if (o.xaXoi) {
        /* Núi xa: đậm nhất ngay tại đường sống rồi nhoè xuống chân — cách mắt
           thấy một khối núi qua một lớp không khí dày. */
        g = c.createLinearGradient(0, y0 - cao * 1.7, 0, y0 + cao * 0.6);
        g.addColorStop(0, 'rgba(' + muc + ',' + o.dam.toFixed(3) + ')');
        g.addColorStop(0.55, 'rgba(' + muc + ',' + (o.dam * 0.55).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + muc + ',0)');
      } else {
        /* Núi gần: cũng ĐẬM TRÊN NHẠT DƯỚI, không ngược lại. Bản trước để
           `0 → mo` từ trên xuống, tức là chân núi đậm nhất và sống núi trong
           suốt — trên giấy trắng thì đọc ra là một cái bục, không ra một hòn
           núi. Núi mực thì chân núi phải TAN vào sương: đó là chỗ để dành cho
           mặt nước và cho dãy đứng trước nó. */
        /* Neo vào ĐỈNH và KHE THẬT của chính dãy này, không vào `y0`. `y0` là
           đường giữa của dao động, nên neo vào nó thì cái đỉnh cao nhất rơi
           ra NGOÀI chặng đầu của gradient và được tô bằng màu của chặng 0 —
           tức là đỉnh nhạt hơn sườn. Sai đúng chỗ quan trọng nhất của một
           hòn núi. */
        g = c.createLinearGradient(0, yCao - cao * 0.06, 0, yThap + cao * 1.60);
        g.addColorStop(0,    'rgba(' + muc + ',' + o.dam.toFixed(3) + ')');
        g.addColorStop(0.40, 'rgba(' + muc + ',' + (o.dam * 0.74).toFixed(3) + ')');
        g.addColorStop(0.74, 'rgba(' + muc + ',' + (o.dam * 0.42).toFixed(3) + ')');
        g.addColorStop(1,    'rgba(' + muc + ',' + (o.dam * 0.16).toFixed(3) + ')');
      }
      c.fillStyle = g;
      c.fill();

      /* ── 3 · LÒNG: mực áp sát đường sống ──
         Đây là lượt bản trước KHÔNG CÓ, và là chỗ hỏng chính.

         Một gradient dọc thì đậm nhạt theo ĐỘ CAO TRÊN KHUNG, còn núi thì
         phải đậm nhạt theo KHOẢNG CÁCH TỚI ĐƯỜNG SỐNG — hai chuyện khác nhau,
         và chúng chỉ trùng nhau khi đường sống nằm ngang. Sống núi có đỉnh có
         khe, nên gradient dọc làm đỉnh nhạt bằng khe: cả dãy xẹp thành một
         dải xám nằm ngang, đúng cái "hai object chính đọc ra là hai thanh
         phẳng".

         Lượt này đi một nét BÚT MỀM rất rộng lên chính đường sống rồi cắt nó
         trong lòng khối, nên nửa trên bị bỏ và nửa dưới ở lại: ra một vệt mực
         đậm nhất ngay tại sống rồi nhạt dần xuống chân. Tức là một gradient
         CHẠY THEO ĐƯỜNG SỐNG, thứ mà canvas không cho dựng trực tiếp. */
      if (o.long) {
        c.save();
        thanNui();
        c.clip();
        c.lineJoin = 'round';
        c.lineCap = 'butt';
        toMem(c, function () { duongSong(0, d.length - 1); },
              cao * 0.04, cao * 1.80, muc, o.long, 60);
        /* ── MÉP ƯỚT ──
           Một nét cuối, hẹp, ngay sát đường sống. Mực rửa trên giấy ướt luôn
           đọng lại thành một vệt đậm ở đúng cái mép nó dừng — đó là dấu hiệu
           mắt dùng để nhận ra "cái này vẽ bằng mực" chứ không phải "cái này
           tô bằng máy". */
        c.lineWidth = cao * 0.09;
        c.strokeStyle = 'rgba(' + muc + ',' + (o.long * 0.30).toFixed(3) + ')';
        duongSong(0, d.length - 1);
        c.stroke();
        c.restore();
      }

      /* ── 3b · VỆT RỬA ──
         Mấy đường mực chạy SONG SONG VỚI SỐNG NÚI, cách sống một quãng, mỗi
         đường lại lượn lệch đi một chút.

         Bản trước để chỗ này là mấy nét buông thẳng đứng từ sống xuống —
         định tả thớ đá. Ở 2× thì rõ ngay là hỏng: chúng đọc ra một hàng vạch
         dọc mảnh cách nhau đều đều, đúng như lỗi của một cái màn hình, vì nét
         thẳng đứng thì CẮT NGANG mọi đường trong bức, mà cả bức này không có
         một đường thẳng đứng nào khác.

         Nay vệt đi THEO sống. Người vẽ mực không tô một mảng bằng một lượt:
         họ rửa một lượt tới ngang đâu thì dừng, chờ ráo, rửa tiếp lượt nữa
         xuống thấp hơn — và mỗi chỗ dừng để lại một cái mép. Ba bốn cái mép
         như thế là toàn bộ lý do một mảng mực đọc ra "vẽ bằng tay". Không có
         chúng thì mảng nào cũng là một dải chuyển toán học, và mắt gọi đó là
         phun sơn. */
      if (o.vet) {
        var rt = bam(Math.round(song[0][2] * 100000) + 7);
        c.save();
        thanNui();
        c.clip();
        c.lineCap = 'round';
        c.lineJoin = 'round';
        for (var q2 = 0; q2 < 4; q2++) {
          var lechV = cao * (0.16 + q2 * 0.36 + rt() * 0.22);
          var bienV = cao * (0.07 + rt() * 0.20);
          var tanV = 2.2 + rt() * 4.5;
          var phaV = rt() * 6.283;
          /* Đường của vệt này: chính đường sống, dịch xuống `lechV`, cộng một
             sóng dài riêng — nên nó SONG SONG với sống mà không trùng sống. */
          var dv = [];
          for (i = 0; i < d.length; i++) {
            dv.push([d[i][0],
              d[i][1] + lechV + Math.sin((d[i][0] / W0) * tanV * kW + phaV) * bienV]);
          }
          /* Vệt dưới sâu thì nhạt hơn — lớp rửa sau bao giờ cũng loãng hơn
             lớp đầu, và phần thấp của dãy đằng nào cũng đang chìm vào sương. */
          var dayV = cao * (0.05 + rt() * 0.11);
          var moV = o.vet * (1 - q2 * 0.19) * (0.55 + rt() * 0.55);
          toMem(c, (function (duong) {
            return function () {
              c.beginPath();
              c.moveTo(duong[0][0], duong[0][1]);
              for (var w = 1; w < duong.length; w++) c.lineTo(duong[w][0], duong[w][1]);
            };
          })(dv), dayV * 0.4, dayV * 3.6, muc, moV, 12);
        }
        c.restore();
      }

      /* ── 3c · VẨY: LỚP RỬA KHÔNG ĐỀU TAY ──
         Một gradient là một hàm toán: mỗi dòng pixel một giá trị, không dòng
         nào lệch. Cái đó không tồn tại trong tự nhiên và mắt biết — nên năm
         dãy núi dựng bằng năm gradient, dù sắc độ đã đúng, vẫn đọc ra là năm
         cái đồi cát phun sơn. Chỗ hỏng không nằm ở màu mà nằm ở chỗ màu QUÁ
         ĐỀU.

         Lượt này rắc mấy bệt mực rất lớn và rất mỏng, chỗ đậm chỗ nhạt, vào
         trong lòng khối. Không ai nhìn ra được một bệt riêng lẻ; cái nhìn ra
         được là lớp rửa thôi phẳng — giấy chỗ ăn mực nhiều chỗ ăn ít, đúng
         như một lượt tô bằng bút ướt.

         Dãy có tô giấy đặc thì chỉ ĐỔ mực, không LẤY: lấy mực trên tấm `gan`
         là chọc một lỗ xuyên qua lớp giấy, và dãy núi xa nằm dưới sẽ hiện lên
         qua cái lỗ ấy — núi gần hoá ra trong suốt. Dãy xa thì lấy được, vì
         thứ nằm dưới nó là nền trời, và trời lọt qua sương thì đúng. */
      if (o.vay) {
        var rv = bam(Math.round(song[0][2] * 100000) + 23);
        var choXoa = !o.dac;
        c.save();
        thanNui();
        c.clip();
        for (i = 0; i < 9; i++) {
          var vx = W0 * (rv() * 1.24 - 0.12);
          var vy = yCao + rv() * (khoang + cao * 1.30);
          loang(c, vx, vy, W0 * (0.09 + rv() * 0.21), cao * (0.22 + rv() * 0.75),
                muc, o.vay * (0.35 + rv() * 0.65), choXoa && rv() < 0.5);
        }
        c.restore();
      }

      /* ── 4 · NÉT SỐNG NÚI ──
         Sương xoá mực, nên một dãy chìm trong sương thì tan biến hoàn toàn và
         bức tranh mất khung. Nét sống giữ lại cái KHUNG ấy: sương mỏng đi là
         viền hiện ra trước tiên, đúng như núi thật ló ra khỏi mây.

         Bản trước đi nét này bằng MỘT đường `lineWidth = 1`, một độ mờ, chạy
         suốt từ mép trái sang mép phải. Bề dày không đổi thì nó không còn là
         nét bút mà là đường kẻ của bản vẽ kỹ thuật — và đó đúng là cái "viền
         chưa ổn". Nét bút thật dày lên ở chỗ bút ĐÈ và mảnh đi ở chỗ bút
         BUÔNG; trên một dãy núi thì bút đè ở đỉnh, ở sườn dốc, và buông ở khe.

         Nay nét được cắt thành từng khúc, mỗi khúc một bề dày và một độ mờ
         tính từ ba thứ: sống ở đây CAO hay THẤP, sườn DỐC hay THOẢI, và một
         nhịp dài chạy ngang cho bút có chỗ thở. Hai mép khung thì nét nhạt
         hẳn — bức tranh mực không bao giờ kết thúc bằng một đường kẻ cụt. */
      if (o.vien) {
        c.lineCap = 'round';
        c.lineJoin = 'round';
        var B = 8, day = o.vienDay || 1.2, phaVien = song[0][2] * 1.7;
        for (i = 0; i + B < d.length; i += B) {
          var t0 = d[i], t1 = d[i + B];
          var doc = Math.min(1, Math.abs((t1[1] - t0[1]) / (t1[0] - t0[0])) * 1.35);
          var treoV = 1 - (t0[1] - yCao) / khoang;
          var uu = t0[0] / W0;
          /* Hai nhịp lệch tần: một nhịp dài cho bút thở, một nhịp ngắn cho
             giấy ăn mực không đều. Một nhịp thôi thì nét dày mỏng đều đặn như
             sóng sin — vẫn là một đường kẻ, chỉ là đường kẻ gợn. */
          var tho = 0.5 + 0.5 * Math.sin(uu * 11.5 * kW + phaVien);
          var nham2 = 0.5 + 0.5 * Math.sin(uu * 31.0 * kW + phaVien * 2.7);
          var but = tho * 0.68 + nham2 * 0.32;
          var mep = muot(uu, 0, 0.05) * (1 - muot(uu, 0.95, 1));
          c.lineWidth = day * (0.34 + treoV * 0.80 + doc * 0.78) * (0.62 + 0.62 * but);
          /* Luỹ 1,5 chứ không tuyến tính: bút thật có chỗ ĂN HẲN vào giấy và
             chỗ BỎ TRẮNG, không rải mực đều hai đầu thang. */
          c.strokeStyle = 'rgba(' + (o.mucVien || muc) + ',' +
            (o.vien * mep * (0.26 + treoV * 0.74) * Math.pow(0.30 + 0.70 * but, 1.5)).toFixed(3) + ')';
          duongSong(i, i + B);
          c.stroke();
        }
      }
    }

    /* ── SƯƠNG ──
       XOÁ mực trong một dải ngang — nhưng KHÔNG đều tay suốt bề ngang.

       Bản trước là một `fillRect` phủ trọn chiều ngang với một gradient dọc:
       mọi cột pixel bị lấy đi đúng bằng nhau, nên cái hiện ra là một THANH
       NGANG mờ chạy hết khung, và cả bức có ba cái thanh như thế xếp trên
       nhau. Sương thật không nằm thành thanh — nó đọng ở khe núi, dày lên
       thành đám, chỗ này kín chỗ kia hở.

       Nay: một lớp nền rất mỏng cho cả dải (để hai đám không hở ra mép cứng),
       rồi mấy ĐÁM bầu dục đặt rời nhau, mỗi đám một cỡ. `lech` đẩy cả cụm
       trôi ngang theo thời gian — nên chỗ nào đang bị che thì lát sau hở ra,
       và đó là cái làm núi với mặt trời "lúc mờ lúc tỏ" thay vì mờ đều. */
    function veSuong(c, y, cao, manh, lech) {
      if (manh <= 0.002 || cao <= 0) return;
      c.save();
      c.globalCompositeOperation = 'destination-out';
      var g = c.createLinearGradient(0, y - cao, 0, y + cao);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, 'rgba(0,0,0,' + (manh * 0.34).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, y - cao, W0, cao * 2);
      c.restore();

      var DAM = [[0.16, 0.30, 1.00], [0.47, 0.40, 0.72], [0.78, 0.26, 0.94], [0.97, 0.20, 0.55]];
      for (var i = 0; i < DAM.length; i++) {
        var cx = W0 * (((DAM[i][0] + (lech || 0)) % 1.34) - 0.17);
        loang(c, cx, y, W0 * DAM[i][1], cao * 1.30, '0,0,0', manh * DAM[i][2], true);
      }
    }

    /* Mặt nước: phủ GIẤY (không xoá mực — xoá thì tấm `gan` thủng và thứ nằm
       dưới nó lộ ra qua lỗ), rồi mấy nét ngang mảnh. */
    function veNuoc(c) {
      var y0 = H0 * MEP_NUOC;
      var rgb = giayRGB();
      var g = c.createLinearGradient(0, y0, 0, H0);
      g.addColorStop(0, 'rgba(' + rgb + ',0)');
      g.addColorStop(0.25, 'rgba(' + rgb + ',0.74)');
      g.addColorStop(1, 'rgba(' + rgb + ',0.88)');
      c.fillStyle = g;
      c.fillRect(0, y0, W0, H0 - y0);
      c.lineCap = 'round';
      for (var i = 0; i < 12; i++) {
        var yy = y0 + H0 * (0.018 + i * 0.017) + Math.sin(i * 2.7) * 3;
        if (yy > H0 - 4) break;
        var dai = W0 * (0.16 + ((i * 7) % 5) * 0.09);
        var x0 = W0 * (0.08 + ((i * 3) % 7) * 0.11);
        if (x0 + dai > W0) x0 = W0 - dai - 10;
        /* Nét nước lấy mực của DÃY GẦN, không lấy mực đặc: nó là bóng của bờ
           in xuống nước, nên phải cùng một sắc với cái bờ ấy. */
        c.strokeStyle = 'rgba(' + MUC_GAN + ',' + (0.075 + (i % 3) * 0.028).toFixed(3) + ')';
        c.lineWidth = 0.8 + (i % 2) * 0.5;
        c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + dai, yy); c.stroke();
      }
    }

    /* ── VỆT SÁNG TRÊN NƯỚC ──
       Không phải một cái bầu dục loang. Ánh sáng trên mặt nước là một CỘT
       những vệt ngang rời nhau: gần bờ thì ngắn và khít, càng ra xa càng dài
       và thưa, và cả cột rung theo sóng. Vẽ đúng như thế thì nó ra ánh sáng;
       vẽ một khối mờ thì nó ra một vũng dầu.

       `xoa` = vệt sáng thật (ánh trăng): lấy bớt lớp rửa trên mặt nước để
       giấy hiện lên. `false` = thêm mực màu (ánh mặt trời lúc thấp). */
    function veVet(c, x, rong, m, mo, t, xoa) {
      var y0 = H0 * (MEP_NUOC + 0.015), y1 = H0 * 0.995;
      if (y1 <= y0 || mo <= 0.004) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';
      var n = 13;
      for (var i = 0; i < n; i++) {
        var u = i / (n - 1);
        var y = y0 + (y1 - y0) * u;
        /* Xa bờ thì vệt dài ra và mảnh đi; cộng một nhịp sóng cho nó thở. */
        var song = Math.sin(t * 0.05 + i * 1.7);
        var w = rong * (0.35 + u * 1.25) * (0.82 + 0.18 * song);
        var a = mo * (1 - u * 0.82) * (0.72 + 0.28 * Math.sin(t * 0.035 + i * 2.3));
        if (a <= 0.002) continue;
        var lech = rong * 0.16 * Math.sin(t * 0.03 + i * 0.9);
        var g = c.createLinearGradient(x - w, 0, x + w, 0);
        g.addColorStop(0, 'rgba(' + m + ',0)');
        g.addColorStop(0.5, 'rgba(' + m + ',' + a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + m + ',0)');
        c.fillStyle = g;
        var cao = Math.max(1.2, (y1 - y0) / n * 0.42);
        c.beginPath();
        c.ellipse(x + lech, y, w, cao, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    /* ── ĐĨA SÁNG: MỘT HÀM CHO CẢ MẶT TRỜI LẪN MẶT TRĂNG ──
       Khác nhau đúng ở chỗ ĐỔ MỰC hay LẤY MỰC: trên giấy trắng, mặt trăng
       sáng được là nhờ lấy bớt lớp rửa đêm đi, còn mặt trời thì tự nó là một
       vệt màu ấm.

       ── QUẦNG VÀ ĐĨA LÀ HAI THỨ, KHÔNG PHẢI MỘT ──
       Bản trước dựng cả hai bằng MỘT dải chuyển tám chặng. Một gradient thì
       chỉ có một mức đậm ở tâm, mà quầng với đĩa cần hai mức cách nhau rất
       xa: quầng phải mỏng tới mức gần như không thấy (nó rộng gấp sáu lần đĩa,
       đậm thêm một chút là cả góc trời bị nhuộm), còn đĩa phải ĐẶC để đọc ra
       là một vật. Nhét cả hai vào một gradient thì mức đậm phải chọn theo cái
       rộng hơn — nên đĩa bị kéo mờ xuống theo quầng. Đó là vì sao mặt trời và
       mặt trăng "hơi mờ": không phải sương che, mà tại chính cái gradient.

       Nay hai lượt: quầng rộng và mỏng, rồi đĩa nhỏ và đặc, mép đĩa tan trong
       7% bán kính cuối — đủ để không thấy răng cưa, không đủ để thành quầng. */
    function veDia(c, x, y, r, m, moQuang, moDia, xoa) {
      if (moQuang <= 0.004 && moDia <= 0.004) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';

      if (moQuang > 0.004) {
        var R = r * 6.2;
        var gq = c.createRadialGradient(x, y, r * 0.55, x, y, R);
        gq.addColorStop(0,    'rgba(' + m + ',' + moQuang.toFixed(3) + ')');
        gq.addColorStop(0.16, 'rgba(' + m + ',' + (moQuang * 0.46).toFixed(3) + ')');
        gq.addColorStop(0.38, 'rgba(' + m + ',' + (moQuang * 0.17).toFixed(3) + ')');
        gq.addColorStop(0.66, 'rgba(' + m + ',' + (moQuang * 0.05).toFixed(3) + ')');
        gq.addColorStop(1,    'rgba(' + m + ',0)');
        c.fillStyle = gq;
        c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
      }

      if (moDia > 0.004) {
        var gd = c.createRadialGradient(x, y - r * 0.18, r * 0.12, x, y, r);
        gd.addColorStop(0,    'rgba(' + m + ',' + Math.min(1, moDia * 1.06).toFixed(3) + ')');
        gd.addColorStop(0.72, 'rgba(' + m + ',' + moDia.toFixed(3) + ')');
        gd.addColorStop(0.93, 'rgba(' + m + ',' + (moDia * 0.90).toFixed(3) + ')');
        gd.addColorStop(1,    'rgba(' + m + ',0)');
        c.fillStyle = gd;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }

    /* ── BỐ CỤC NÚI ──
       Ba lớp xa dựng thành một cụm lệch trái, cao dần vào giữa; hai lớp gần
       thấp và trải rộng. Mỗi lớp một bộ sóng riêng, và lớp nào cũng có ít
       nhất hai sóng dài để đường sống có chỗ nghỉ — một dãy toàn sóng ngắn
       đọc ra là hàng răng cưa, không ra là núi.

       ĐƯỜNG CONG KHÔNG ĐỔI so với bản trước — chỗ sửa nằm hết ở mực: mỗi dãy
       nay có sắc riêng theo chiều sâu, có lượt mực áp sống, và có nét sống đi
       bằng bút thay vì bằng thước. */
    function veTamNen() {
      W0 = W; H0 = H;
      xa = document.createElement('canvas');
      xa.width = Math.max(1, Math.round(W0));
      xa.height = Math.max(1, Math.round(H0));
      var c = xa.getContext('2d');

      /* Dãy xa nhất: cao, thoải, lệch trái — cái đỉnh mặt trời sẽ mọc lên từ
         phía sau nó. Con số đầu mỗi cặp là SỐ RADIAN trải hết bề ngang ở khổ
         1400px; chia cho 2π ra số ngọn. Dưới 4 thì cả dãy chỉ còn một cái gò
         thoai thoải — không ra núi. */
      veNui(c, {
        y: 0.375, cao: 0.285, muc: MUC_XA, dam: 0.170,
        song: [[5.4, 0.46, 0.6], [2.2, 0.34, 2.1], [10.5, 0.13, 4.4]],
        xaXoi: true, dac: 0.88, long: 0.34, vet: 0.026, vay: 0.014,
        vien: 0.62, mucVien: NET_XA, vienDay: 1.05
      });
      veSuong(c, H0 * 0.40, H0 * 0.050, 0.42);
      /* Dãy giữa: thấp hơn, đỉnh lệch phải cho cụm không đối xứng. */
      veNui(c, {
        y: 0.470, cao: 0.225, muc: MUC_XA, dam: 0.220,
        song: [[6.8, 0.44, 3.4], [2.9, 0.30, 0.8], [12.6, 0.11, 1.9]],
        xaXoi: true, dac: 0.90, long: 0.42, vet: 0.038, vay: 0.016,
        vien: 0.70, mucVien: NET_XA, vienDay: 1.15
      });
      veSuong(c, H0 * 0.490, H0 * 0.038, 0.46);
      /* Dãy thứ ba: đậm hơn, làm nền cho dãy gần đứng lên. */
      veNui(c, {
        y: 0.570, cao: 0.190, muc: MUC_GIUA, dam: 0.300,
        song: [[4.6, 0.48, 1.5], [8.2, 0.22, 5.2], [14.0, 0.09, 3.1]],
        xaXoi: true, dac: 0.94, long: 0.56, vet: 0.055, vay: 0.020,
        vien: 0.78, mucVien: NET_GIUA, vienDay: 1.3
      });

      gan = document.createElement('canvas');
      gan.width = xa.width; gan.height = xa.height;
      var g = gan.getContext('2d');
      /* Khối chính của bức. Đây là chỗ được phép đậm: nó ở gần nhất, và một
         bức tranh mực không có chỗ nào đậm thật thì cả bức không có trọng
         lượng — mọi thứ trôi lửng lơ ở một khoảng xám giữa. */
      veNui(g, {
        y: 0.660, cao: 0.140, muc: MUC_GAN, dam: 0.340,
        song: [[3.4, 0.55, 2.6], [7.1, 0.25, 4.9]],
        xaXoi: false, dac: true, suong: 0.62, long: 0.62, vet: 0.085, vay: 0.024,
        vien: 0.90, mucVien: NET_GAN, vienDay: 1.70
      });
      /* Mép bờ sát nước: KHÔNG dày thêm một khối nữa — chỉ một nét đậm và một
         lườn mỏng. Bờ nước là đường chuyển giữa đất và nước, mà đường chuyển
         thì đọc bằng NÉT. Dựng nó thành một khối đậm thì đáy bức có một thanh
         tối chắn ngang, và cả bức bị đóng lại ở dưới. */
      veNui(g, {
        y: 0.728, cao: 0.070, muc: MUC_BO, dam: 0.120,
        song: [[4.2, 0.50, 5.6], [9.0, 0.20, 1.2]],
        xaXoi: false, dac: true, suong: 0.50, long: 0.30, vet: 0.070, vay: 0.018,
        vien: 0.92, mucVien: NET_GAN, vienDay: 1.40
      });
      veNuoc(g);
    }

    return {
      dung: function () {
        veTamNen();
        var n = Math.max(6, Math.min(16, Math.round(W0 / 130)));
        chim = [];
        for (var i = 0; i < n; i++) chim.push(moiChim(true));
        sao = [];
        var m = Math.max(28, Math.min(70, Math.round(W0 / 16)));
        for (var j = 0; j < m; j++) {
          sao.push({
            x: Math.random() * W0, y: Math.random() * H0 * 0.46,
            r: 0.6 + Math.random() * 1.0,
            mo: 0.22 + Math.random() * 0.34,
            tia: Math.random() < 0.14,
            pha: Math.random() * Math.PI * 2,
            nhip: 0.018 + Math.random() * 0.045
          });
        }
      },

      /* ══════════ MỘT VÒNG NGÀY ══════════
         0.00 → 0.05  đêm tàn, chân trời đông ửng
         0.03 → 0.16  MẶT TRỜI MỌC — quầng sáng dâng lên từ sau dãy núi xa
         0.16 → 0.42  lên cao, nhỏ và nhạt dần; giấy gần như trắng
         0.42 → 0.58  hạ về bên phải, to và đỏ lại; một dải ấm ở chân trời
         0.56 → 0.70  chạng vạng, sương dâng, sao hiện
         0.62 → 0.98  trăng đi một cung từ phải sang trái rồi lặn
         0.93 → 1.00  trời nhạt dần, nối về đầu vòng

         Sương THỞ suốt cả vòng: ba dải, mỗi dải một nhịp riêng, lúc dày lúc
         mỏng, và cả cụm trôi ngang. Khi mỏng thì nét sống núi hiện ra — đó là
         phần chuyển động chính của bức này, thay cho mấy đám mây đã bỏ. */
      ve: function (t) {
        ctx.clearRect(0, 0, W, H);
        var p = (t % CHU_KY) / CHU_KY;
        var m = Math.min(W, H);
        var chanTroi = H * CHAN_TROI;

        var dem      = muot(p, 0.56, 0.70) * (1 - muot(p, 0.93, 1.00));
        var binhMinh = muot(p, 0.00, 0.06) * (1 - muot(p, 0.16, 0.26));
        var hoangHon = muot(p, 0.40, 0.50) * (1 - muot(p, 0.58, 0.68));
        var ngay     = muot(p, 0.12, 0.24) * (1 - muot(p, 0.50, 0.62));
        var am       = Math.max(binhMinh, hoangHon);

        /* Cung mặt trời — tính sớm vì lớp trời ấm ở bước 1 phải biết nó đang
           ở ĐÂU. */
        var uS = kep((p - 0.03) / 0.55);
        var cung = Math.sin(Math.PI * uS);
        var sx = W * (0.19 + 0.62 * uS);
        var sy = H * 0.82 - (H * 0.82 - H * 0.14) * cung;
        var sr = m * (0.072 - 0.028 * cung);
        var mTroi = mau(206 + 14 * cung, 98 + 74 * cung, 54 + 68 * cung);
        var hienS = kep(1 - dem * 1.8);

        /* ── 1 · NỀN TRỜI ──
           Trên giấy trắng, "trời sáng" là giấy để trắng; mọi sắc khác là một
           lớp rửa mỏng phủ lên. Lớp đêm phủ tới TẬN ĐÁY, không dừng ở chân
           trời: mặt nước phản chiếu bầu trời, nên nước ban đêm phải sẫm theo
           — và chính nhờ vậy vệt trăng dưới nước mới có thứ để mà lấy đi. */
        if (dem > 0.002) {
          var gd = ctx.createLinearGradient(0, 0, 0, H);
          gd.addColorStop(0, 'rgba(' + mau(38, 44, 62) + ',' + (0.155 * dem).toFixed(3) + ')');
          gd.addColorStop(0.45, 'rgba(' + mau(44, 50, 66) + ',' + (0.100 * dem).toFixed(3) + ')');
          gd.addColorStop(CHAN_TROI, 'rgba(' + mau(58, 62, 74) + ',' + (0.034 * dem).toFixed(3) + ')');
          gd.addColorStop(1, 'rgba(' + mau(46, 52, 68) + ',' + (0.085 * dem).toFixed(3) + ')');
          ctx.fillStyle = gd;
          ctx.fillRect(0, 0, W, H);
        }
        /* ── LỚP TRỜI ẤM: MỘT DẢI MỎNG CỘNG MỘT ĐÁM QUANH MẶT TRỜI ──
           Bản trước chỉ có cái dải: một gradient phủ đều suốt bề ngang từ
           H*0.14 xuống chân trời. Phủ đều nghĩa là góc trời bên kia ửng hồng
           đúng bằng góc có mặt trời — nên cả bức bị nhuộm một lớp hồng phẳng,
           và không ai đọc ra ánh sáng đang tới từ phía nào. Đó là chỗ "layer
           màu chưa ổn": không phải sai màu, mà là màu không có HƯỚNG.

           Nay dải giữ lại nhưng hạ xuống còn hơn một nửa — nó chỉ còn làm cái
           việc thật của nó, là ửng ở sát chân trời. Phần còn lại dồn vào một
           đám loang quanh chính mặt trời. Trời bên có mặt trời ấm, bên kia
           gần như là giấy: bức tranh có nguồn sáng. */
        if (am > 0.002) {
          var mAm = hoangHon >= binhMinh ? mau(208, 104, 62) : mau(214, 130, 100);
          var ga = ctx.createLinearGradient(0, H * 0.22, 0, chanTroi);
          ga.addColorStop(0, 'rgba(' + mAm + ',0)');
          ga.addColorStop(0.55, 'rgba(' + mAm + ',' + (0.022 * am).toFixed(3) + ')');
          ga.addColorStop(1, 'rgba(' + mAm + ',' + (0.062 * am).toFixed(3) + ')');
          ctx.fillStyle = ga;
          ctx.fillRect(0, H * 0.22, W, chanTroi - H * 0.22);
          loang(ctx, sx, Math.min(sy, chanTroi), W * 0.42, H * 0.30, mAm, 0.085 * am * hienS, false);
        }

        /* ── 2 · MẶT TRĂNG ──
           Vẽ trước mọi thứ khác và bằng một phép XOÁ: đĩa là chỗ lớp rửa đêm
           bị lấy đi hẳn, quầng là chỗ bị lấy đi một phần. Không một nét viền.
           Đĩa lấy tới 0,95 — tức là gần như trả về đúng mặt giấy, nên trăng là
           vật SÁNG NHẤT trong bức lúc đêm, không phải một vệt xám nhạt hơn
           nền một chút. */
        var uM = kep((p - 0.62) / 0.36);
        var mx = W * (0.80 - 0.60 * uM);
        var my = chanTroi - (chanTroi - H * 0.11) * Math.sin(Math.PI * uM);
        var mr = m * 0.032;
        var sangTrang = dem * muot(p, 0.60, 0.68);
        var noTrang = 1 - muot(my + mr, H * 0.60, H * 0.72);
        veDia(ctx, mx, my, mr, '0,0,0',
              0.30 * sangTrang, 0.95 * sangTrang * (0.10 + 0.90 * noTrang), true);

        /* ── 3 · SAO ── */
        if (dem > 0.02) {
          for (var s = 0; s < sao.length; s++) {
            var k = sao[s];
            var nhay = 0.55 + 0.45 * Math.sin(t * k.nhip + k.pha);
            var a = k.mo * dem * nhay;
            ctx.fillStyle = 'rgba(' + MUC + ',' + a.toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2); ctx.fill();
            if (k.tia) {
              ctx.strokeStyle = 'rgba(' + MUC + ',' + (a * 0.6).toFixed(3) + ')';
              ctx.lineWidth = 0.7;
              var d2 = k.r * (2.4 + nhay * 1.6);
              ctx.beginPath();
              ctx.moveTo(k.x - d2, k.y); ctx.lineTo(k.x + d2, k.y);
              ctx.moveTo(k.x, k.y - d2); ctx.lineTo(k.x, k.y + d2);
              ctx.stroke();
            }
          }
        }

        /* ── 4 · MẶT TRỜI, VẼ TRƯỚC CẢ DÃY XA ──
           Nó nằm SAU mọi dãy núi, nên lúc mọc thì thứ hiện ra đầu tiên là
           quầng sáng dâng lên từ phía sau cụm núi cao ở xa, rồi cái đĩa mới
           từ từ trồi khỏi đường sống.

           Đĩa nhạt dần khi tâm hạ xuống dưới sống dãy gần: tới đó thì núi đã
           che nó bằng lớp giấy đặc, nhưng mặt nước chỉ phủ giấy 74–88% nên
           một cái đĩa đặc nằm dưới mép nước sẽ hắt lên thành một vũng hồng.
           `noTroi` cắt đúng cái vũng ấy mà vẫn để quầng sáng ở lại — nên chặng
           "rạng" trước lúc mọc không mất. */
        var noTroi = 1 - muot(sy, H * 0.62, H * 0.74);
        var moDiaTroi = (0.86 - 0.42 * cung) * hienS * (0.06 + 0.94 * noTroi);
        veDia(ctx, sx, sy, sr, mTroi, (0.21 - 0.05 * cung) * hienS, moDiaTroi, false);

        /* ── 5 · DÃY XA ── */
        if (xa) ctx.drawImage(xa, 0, 0, W, H);

        /* ── 6 · DÃY GẦN + MẶT NƯỚC ── */
        if (gan) ctx.drawImage(gan, 0, 0, W, H);

        /* ── 6b · TRỜI PHỦ LẦN HAI, LÊN TRÊN CẢ NÚI ──
           Núi nay có lớp giấy đặc, nên lớp rửa đêm vẽ ở bước 1 nằm HẲN SAU
           núi và không tới được nó. Để vậy thì nửa đêm trời sẫm mà năm dãy
           núi vẫn trắng như giữa trưa — mỗi lớp đúng một mình nó, cả bức thì
           sai, vì đêm xuống là xuống cho mọi thứ cùng lúc.

           Nên lớp đêm được phủ lần thứ hai, mỏng hơn, lên trên tất cả. Mỏng
           hơn chứ không bằng: núi vốn sáng hơn trời đêm thật (tuyết, đá trần,
           hơi nước bốc lên), và giữ cho chúng sáng hơn một bậc là cách duy
           nhất để đêm không bôi cả bức thành một mảng xám phẳng.

           Chiều thì ngược lại: một vệt ấm rất mỏng rọi từ phía mặt trời sang,
           chỉ đủ để sườn núi bên ấy hồng lên một chút. Bỏ nó đi thì mặt trời
           đỏ rực mà cả dãy núi ngay dưới nó vẫn xám lạnh — hai thứ trong cùng
           một bức mà chịu hai thứ ánh sáng khác nhau. */
        if (dem > 0.002) {
          var g2 = ctx.createLinearGradient(0, 0, 0, H);
          g2.addColorStop(0, 'rgba(' + mau(40, 46, 64) + ',' + (0.070 * dem).toFixed(3) + ')');
          g2.addColorStop(CHAN_TROI, 'rgba(' + mau(52, 58, 72) + ',' + (0.048 * dem).toFixed(3) + ')');
          g2.addColorStop(1, 'rgba(' + mau(44, 50, 66) + ',' + (0.062 * dem).toFixed(3) + ')');
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, W, H);
        }
        if (am > 0.002) {
          var mAm2 = hoangHon >= binhMinh ? mau(206, 112, 74) : mau(212, 138, 110);
          loang(ctx, sx, Math.min(sy + H * 0.10, H * 0.78), W * 0.36, H * 0.20,
                mAm2, 0.050 * am * hienS, false);
        }

        /* ── 7 · VỆT SÁNG TRÊN NƯỚC ──
           Chỉ khi thiên thể còn nhô trên đường sống dãy gần — khuất rồi thì
           không còn gì để mà chiếu xuống. */
        var choiTroi = hienS * (1 - muot(sy + sr, H * 0.60, H * 0.70));
        veVet(ctx, sx, sr * 1.5, mTroi, 0.14 * choiTroi, t, false);
        /* Trăng thì LẤY BỚT lớp rửa đêm trên mặt nước — nước đêm sẫm hơn giấy
           nên chỗ bị lấy đi đọc ra là sáng. */
        var choiTrang = sangTrang * (1 - muot(my + mr, H * 0.58, H * 0.70));
        veVet(ctx, mx, mr * 1.7, '0,0,0', 0.85 * choiTrang, t, true);

        /* ── 8 · SƯƠNG THỞ ──
           Ba dải, ba nhịp lệch nhau, mỗi dải vừa dày mỏng vừa trôi lên xuống
           vừa TRÔI NGANG. Đây là phần chuyển động chính: lúc một đám dày trùm
           qua thì cả một tầng núi tan vào giấy, lúc nó đi khỏi thì nét sống
           hiện lại. Về đêm sương dâng cao hơn và đậm hơn.

           Sương ĐỘNG vẽ lại mỗi khung, khác hẳn sương TĨNH nướng sẵn một lần
           vào tấm nền — nên cùng một con số ở đây nặng gấp nhiều lần. Bản đầu
           để 0,30–0,72 và cả bức trắng xoá. Nay sương đi thành đám nên nó
           không còn xoá đều tay nữa: cùng một lượng mực bị lấy đi, nhưng lấy
           tập trung vào mấy chỗ thay vì rải mỏng khắp bức — nên trị số hạ
           thêm một nấc so với bản dải ngang. */
        var dayDem = 0.60 + 0.55 * dem;
        var DAI = [[0.615, 0.042, 0.0061, 0.0, 0.00011],
                   [0.515, 0.036, 0.0043, 2.1, -0.00007],
                   [0.735, 0.030, 0.0078, 4.2, 0.00016]];
        for (var q = 0; q < DAI.length; q++) {
          var o = DAI[q];
          var tho = 0.5 + 0.5 * Math.sin(t * o[2] + o[3]);
          var y = H * (o[0] - 0.035 * dem) + Math.sin(t * o[2] * 0.6 + o[3]) * H * 0.012;
          var lech = ((t * o[4]) % 1 + 1) % 1;
          veSuong(ctx, y, H * o[1] * (0.65 + 0.7 * tho), (0.085 + 0.145 * tho) * dayDem, lech);
        }

        /* ── 9 · CHIM: bay ban ngày, thưa dần khi chiều xuống ── */
        var baySang = Math.max(ngay, binhMinh * 0.55);
        if (baySang > 0.02) {
          for (var i3 = 0; i3 < chim.length; i3++) {
            var ch = chim[i3];
            ch.x += ch.v;
            if (ch.x - ch.r > W) { chim[i3] = moiChim(false); continue; }
            var y3 = ch.y + Math.sin(t * ch.nhipY + ch.pha) * ch.bien;
            var vo = (Math.sin(t * ch.nhip + ch.pha) + 1) / 2;
            veChim(ctx, ch.x, y3, ch.r, ch.mo * baySang, vo);
          }
        }
      }
    };
  }

  /* ══════════ ĐIỀU PHỐI ══════════ */

  /* Theme → hiệu ứng. Một bảng tra, không phải một chuỗi if: thêm theme là
     thêm đúng một dòng ở đây, và không có đường nào rơi vào nhánh "còn lại"
     để rồi lặng lẽ chạy sai hiệu ứng. */
  var BO = { light: dungHoa, dark: dungThienHa, calm: dungThac, frost: dungSuongGiang };

  /* Theme nào đang chạy. Trả về đúng tên theme chứ không trả về true/false như
     bản hai theme: thêm theme thứ ba vào thì một câu hỏi có/không không còn
     đủ chỗ cho câu trả lời. */
  function themeNao() {
    var t = document.documentElement.getAttribute('data-theme');
    if (BO[t]) return t;
    /* Attribute vắng mặt (tắt JavaScript ở tab khác, hoặc theme.js vừa gỡ nó
       ra vì người đọc đổi cài đặt máy) — hỏi lại hệ điều hành. */
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
    may = BO[themeNao()]();
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
