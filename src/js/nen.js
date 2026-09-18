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
    var xa = null, gan = null, W0 = 0, H0 = 0, chim = [], sao = [], may = [], vet = [];
    var cumSao = [];

    /* ══════════════════════════════════════════════════════════════════════
       ĐƯỜNG SỐNG CAO NHẤT — ĐỂ ĐẶT MẶT TRĂNG

       Mọi dãy núi vẽ SAU thiên thể, nên dãy nào cũng che được nó. Muốn hạ
       trăng xuống thấp mà không bị che thì phải biết đỉnh núi ở ĐÚNG chỗ
       trăng đứng cao bao nhiêu — và con số ấy đổi theo bề ngang khung, vì
       tần số sóng nhân với `W0/1400`.

       Đo bằng cách ghi lại: `veNui` đang dựng sẵn một đường sống lấy mẫu mỗi
       3px, nên chỉ cần giữ giá trị NHỎ NHẤT (cao nhất trên màn) tại từng mẫu,
       cộng dồn qua cả năm sáu dãy. Xong là có nguyên đường bao của núi.

       Đây là việc mà chú thích trong bản trước hẹn "để một lượt khác": bản ấy
       đã thử SUY đỉnh núi ra bằng công thức và sai — phép đo cho cùng một giá
       trị ở mọi bề ngang, dấu hiệu rõ ràng của một công thức sai. Ghi lại thì
       không có gì để sai: đó đúng là đường mà `canvas` vừa tô.
       ══════════════════════════════════════════════════════════════════════ */
    var dinhQ = [];

    /* Đỉnh cao nhất trong một dải ngang, tính theo phần của bề ngang. */
    function dinhDai(u0, u1) {
      var n = dinhQ.length;
      if (!n) return H0 * 0.30;
      var i0 = Math.max(0, Math.floor(u0 * (n - 1)));
      var i1 = Math.min(n - 1, Math.ceil(u1 * (n - 1)));
      var m0 = Infinity, i;
      for (i = i0; i <= i1; i++) if (dinhQ[i] < m0) m0 = dinhQ[i];
      return m0 === Infinity ? H0 * 0.30 : m0;
    }

    /* ══════════════════════════════════════════════════════════════════════
       KHUNG VẼ CAO NHẤT MỘT MÀN HÌNH

       Ba hiệu ứng kia — hoa rơi, thiên hà, thác — KHÔNG có bố cục theo chiều
       dọc: cánh hoa rơi ở đâu cũng là cánh hoa, sao ở đâu cũng là sao. Kéo
       chúng cao bao nhiêu cũng đúng, nên chúng phủ trọn khối chứa.

       Bức này thì có CHÂN TRỜI. Mọi thứ trong nó đo theo chiều cao khung: núi
       xa ở 0,35, mép nước ở 0,75, trăng ở 0,22. Cho khung cao gấp đôi thì mặt
       nước tụt xuống khỏi tầm mắt và để lại hai màn trời trắng — đúng chuyện
       đã xảy ra ở trang About, nơi khối chứa cao 1881px trong khi màn hình cao
       877px. Người dùng nhìn ra ngay: "nền About hỏng".

       Nên khung vẽ cao nhất một màn hình. Phần khối chứa còn lại phía dưới
       không bỏ trắng — nó là NƯỚC kéo dài tiếp, mà nước kéo dài thì vẫn là
       nước: một cái hồ rộng ra về phía người xem. Không có mép cắt nào, vì
       chỗ nối mang đúng sắc của đáy dải nước.

       1,20 chứ không phải 1,00. Trang chủ cao 1002px trên màn 877px — tức
       1,14 màn — và bố cục ở đó đã được ngắm kỹ rồi; hạ trần xuống 1,06 là
       xén nó đi 72px và làm tan mất nếp bờ gần ở đáy bức. Trần phải đủ rộng
       để KHÔNG chạm vào những trang chỉ hơn một màn một quãng, và chỉ can
       thiệp vào những khối cao gấp đôi trở lên như trang About (1825px).
       ══════════════════════════════════════════════════════════════════════ */
    function caoKhung() {
      var man = window.innerHeight || H;
      return Math.min(H, Math.max(320, man * 1.20));
    }
    var CHU_KY = 4200;          /* khung hình một vòng — ~70 giây ở 60fps */

    /* ══════════════════════════════════════════════════════════════════════
       MỰC NHẠT, VÀ VÌ SAO PHẢI NHẠT ĐẾN THẾ

       Cả bảng dưới 0,24 — và bốn lớp núi xa thì dưới 0,14. Đã từng đẩy lên
       gấp ba (0,25–0,34) với lý do "một bức mực không có chỗ nào đậm thật thì
       không có trọng lượng". Lý do ấy đúng với một bức tranh treo tường và sai
       với cái này, vì hai lẽ:

       · Đây là NỀN của một trang để đọc. Mực đậm thì nó thôi là nền mà thành
         một bức tranh có chữ đè lên.
       · Sơn thuỷ sống bằng phần KHÔNG vẽ. Mực nhạt thì chỗ nào cũng còn thấy
         giấy dưới nó, và cái đọc ra là hơi nước; mực đậm thì giấy bị bịt, và
         cái đọc ra là địa hình.

       Bốn bậc ở đây khác nhau cả sắc lẫn độ — xa thì ngả lạnh, gần thì về mực
       đen — nhưng cả bốn đều nằm trong một quãng rất hẹp (chừng 234 → 184 trên
       giấy trắng). Chỗ tương phản mạnh của bức không nằm ở núi: nó nằm ở MẶT
       TRỜI và MẶT TRĂNG. Một bức có đúng một điểm sáng mạnh thì mắt biết đậu
       vào đâu; có năm chỗ đậm thì mắt không đậu vào đâu cả.
       ══════════════════════════════════════════════════════════════════════ */
    var MUC      = '17,19,21';    /* mực đặc — chim, sao */
    var MUC_XA   = '46,54,66';
    var MUC_XA2  = '38,45,56';
    var MUC_GIUA = '28,33,42';
    var MUC_GAN  = '17,19,21';

    var MEP_NUOC = 0.750;
    var CHAN_TROI = 0.700;

    function kep(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function muot(p, a, b) { var u = kep((p - a) / (b - a)); return u * u * (3 - 2 * u); }
    function mau(r, g, b) { return Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b); }

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
        y: H * (0.10 + Math.random() * 0.22),
        r: 4 + lop * 9,
        v: 0.16 + lop * 0.34,
        pha: Math.random() * Math.PI * 2,
        nhip: 0.055 + Math.random() * 0.05,
        mo: 0.20 + lop * 0.4,
        bien: 5 + lop * 12,
        nhipY: 0.004 + Math.random() * 0.004
      };
    }

    /* ── MỘT DẢI MÂY ──
       Lớp: 0 = dải xa tít, 1 = dải ngay trước mặt. Cỡ, độ đậm và tốc độ đều
       suy ra từ một con số ấy.

       Mây chỉ ở quãng có mực núi. Mây lửng lơ giữa trời trống thì không có gì
       để nó ôm lấy — và vì nó là một cái TẨY (xem vòng vẽ), ở chỗ trống nó
       không để lại gì cả. */
    function moiMay(batDau) {
      var lop = Math.random();
      var r = 60 + lop * 190;
      return {
        lop: lop,
        x: batDau ? Math.random() * (W + r * 4) - r * 2 : -r * 2.4,
        y: H * (0.50 + Math.random() * 0.40),
        r: r,
        /* Dải gần trôi nhanh hơn dải xa — thị sai, và nó là thứ duy nhất ở
           đây nói ra chiều sâu, vì màu thì cả mấy dải gần như nhau. */
        v: 0.05 + lop * 0.16,
        /* ── BA CON SỐ LÀM NÊN "LỀNH BỀNH" ──
           Mây trôi thuần ngang với một tốc độ không đổi thì đúng về vật lý
           nhưng nhìn ra là TRƯỢT chứ không ra là trôi: mắt bắt được ngay cái
           đều đặn, và một thứ đều đặn thì thôi là mây mà thành thanh cuộn.

           `pha` cho mỗi dải một điểm xuất phát riêng trên vòng sin, để chúng
           không bao giờ cùng lên cùng xuống. `bien` là biên độ dập dềnh dọc,
           tính theo CỠ dải — dải to bồng bềnh rộng hơn dải nhỏ. `nhip` là tốc
           độ thở: dải xa thở chậm hơn dải gần. Tất cả đều rất nhỏ. */
        pha: Math.random() * Math.PI * 2,
        bien: r * (0.04 + lop * 0.05),
        nhip: 0.0016 + lop * 0.0022,
        mo: 0.05 + lop * 0.13,
        /* Mỗi dải vài quầng lệch tâm, sinh SẴN một lần. Sinh lại mỗi khung
           thì bờ mây rung như nhiễu. */
        cum: (function () {
          var n = 3 + ((Math.random() * 3) | 0), ra = [];
          for (var i = 0; i < n; i++) {
            ra.push({ dx: (Math.random() - 0.5) * r * 2.1,
                      dy: (Math.random() - 0.5) * r * 0.5,
                      rr: r * (0.45 + Math.random() * 0.5) });
          }
          return ra;
        })()
      };
    }

    /* Một vệt sương mỏng ở NỬA TRÊN — chỗ không có mực núi để mây xoá. */
    function moiVet(batDau) {
      var r = 140 + Math.random() * 260;
      return {
        r: r,
        x: batDau ? Math.random() * (W + r * 2) - r : -r * 2,
        y: H * (0.16 + Math.random() * 0.34),
        v: 0.03 + Math.random() * 0.07,
        /* Dưới 0,025: đủ để thấy có gì trôi khi nhìn vào khoảng trống, không
           đủ để đọc ra một vật. Để 0,044 như bản cũ thì trên một mặt giấy
           trắng trơn nó hiện ra thành một vệt bẩn hình bầu dục. */
        mo: 0.009 + Math.random() * 0.016
      };
    }

    /* Màu giấy của theme — để tô ĐẶC mọi dãy núi. */
    var GIAY = (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#fff').trim() || '#fff';
    function giayRGB() {
      var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(GIAY);
      return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : '255,255,255';
    }

    /* Một bệt loang: dùng cho quầng sáng và cho sương tĩnh. Gradient tròn
       không nhận tỉ lệ bầu dục nên co trục tung lại bằng `scale` rồi vẽ tròn.
       Đuôi chia nhiều chặng — xem chú thích ở `veDia` về vành Mach. */
    function loang(c, cx, cy, rx, ry, m, a, xoa) {
      if (a <= 0.002 || rx <= 0.5 || ry <= 0.5) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';
      c.translate(cx, cy);
      c.scale(1, ry / rx);
      var g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0,    'rgba(' + m + ',' + a.toFixed(4) + ')');
      g.addColorStop(0.30, 'rgba(' + m + ',' + (a * 0.72).toFixed(4) + ')');
      g.addColorStop(0.52, 'rgba(' + m + ',' + (a * 0.400).toFixed(4) + ')');
      g.addColorStop(0.70, 'rgba(' + m + ',' + (a * 0.180).toFixed(4) + ')');
      g.addColorStop(0.86, 'rgba(' + m + ',' + (a * 0.048).toFixed(4) + ')');
      g.addColorStop(1,    'rgba(' + m + ',0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    /* ══════════════════════════════════════════════════════════════════════
       ĐƯỜNG SỐNG NÚI: TỔNG SIN, VÀ MỘT CÁI BAO RỘNG

       Đã thử ba cách dựng sống núi. Hai cách sau đều sai, và sai theo cùng một
       kiểu: chúng cố làm cho đỉnh núi SẮC hơn.

       · TỔNG SIN + ĐƯỜNG CHUÔNG hẹp (`rong` 0,09). Chuông CỘNG vào nền sin thì
         át hẳn nền, nên ngọn lấy đúng dáng chuông: cao, hẹp, sườn cong lõm —
         đọc ra hình vi cá.
       · NHIỄU GẤP NẾP (`1-|nhiễu|` bình phương, chồng tầng). Đúng cách dựng
         sống núi thật, cho ra đỉnh sắc và khe có đáy. Nhưng sắc là thứ bức này
         KHÔNG cần: một cái nền trang thì mọi đỉnh nhọn đều thành một mũi chỉ
         vào chữ, và mấy chục nếp gấp nhỏ đọc ra là răng cưa.

       Quay về TỔNG BA SÓNG SIN như bản V2.8.8 — mềm, liền, không đỉnh nào nhọn.
       Cái phải sửa không phải dáng sống núi, là mấy thứ khác: mực nhạt đi và
       trải rộng ra, núi kéo lại gần hơn, và bức phải có một điểm nhìn.

       ── TẦN SỐ THEO BỀ NGANG THẬT, KHÔNG THEO TỈ LỆ ──
       Tính theo `u = x / W0` thì số ngọn trên một dãy luôn bằng nhau bất kể màn
       rộng hay hẹp. Trên 1400px thì vừa; nhét đúng chừng ấy ngọn vào một cái
       điện thoại 375px thì chúng chen nhau thành một hàng răng cưa. Nay bước
       sóng đo bằng PIXEL: màn hẹp thấy ít ngọn hơn, mỗi ngọn vẫn rộng đúng
       chừng ấy — như cắt một khúc của cùng một bức tranh.

       ── BAO: ĐIỂM NHÌN, KHÔNG PHẢI HÌNH DÁNG ──
       `bao` NHÂN vào biên độ của tổng sin, nên chỗ nào bao lớn thì dãy nhấp
       nhô mạnh hơn và cao hơn, chỗ nào bao nhỏ thì nó xẹp về gần đường giữa.
       Đó là cách cho bức một chỗ để mắt đậu mà không phải dựng một cái đỉnh
       riêng: DÁNG vẫn do sin vẽ, bao chỉ nói "chỗ này lớn hơn chỗ kia".

       Bề rộng bao phải RỘNG — từ 0,30 trở lên. Hẹp hơn thì nó lại thành cái
       chuông, và ta quay về đúng lỗi đầu tiên. `san` là mức sàn, mặc định 1
       (không bao, dãy nhấp nhô đều suốt bề ngang).
       ══════════════════════════════════════════════════════════════════════ */
    function bao(u, dsBao, san) {
      if (!dsBao || !dsBao.length) return 1;
      var e = san === undefined ? 1 : san, k, dd, v;
      for (k = 0; k < dsBao.length; k++) {
        dd = (u - dsBao[k][0]) / dsBao[k][1];
        v = dsBao[k][2] * Math.exp(-dd * dd * 1.7);
        if (v > e) e = v;
      }
      return e;
    }

    /* ══════════════════════════════════════════════════════════════════════
       MỘT NẾP NÚI

       Đường sống là tổng BA SÓNG SIN lệch pha, cộng thêm mấy ĐƯỜNG CHUÔNG nếu
       dãy ấy có ngọn cao.

       ── VÌ SAO ĐƯỜNG CHUÔNG CỘNG VÀO, KHÔNG PHẢI ĐỈNH RỜI ──
       Đã thử dựng mỗi dãy bằng một chùm đỉnh rời, mỗi đỉnh một dáng
       `(1-|t|)^n`. Về số thì kiểm soát tốt hơn hẳn, nhưng nhìn thì sai: dáng
       ấy có một GÓC ở đỉnh và hai sườn gần như thẳng, nên mỗi đỉnh đọc ra một
       cái nón, và ba cái nón cạnh nhau đọc ra hình minh hoạ chứ không ra sơn
       thuỷ. Chỗ hai đỉnh gặp nhau lại thành một cái khe chữ V, phải đi làm
       tròn thêm một lượt nữa.

       Đường chuông `exp(-d²·4)` thì không có góc nào cả, và vì nó CỘNG vào nếp
       sin có sẵn nên ngọn núi MỌC LÊN TỪ dãy chứ không dán đè lên dãy: chân
       ngọn hoà vào đường sống chung, sườn bên này bên kia không bao giờ giống
       nhau (nền sin bên dưới đã lệch), và không có chỗ nào cần làm tròn.

       ── TẦN SỐ THEO BỀ NGANG THẬT, KHÔNG THEO TỈ LỆ ──
       Tính theo `u = x / W0` thì số ngọn trên một dãy luôn bằng nhau bất kể
       màn rộng hay hẹp. Trên 1400px thì vừa; nhét đúng chừng ấy ngọn vào một
       cái điện thoại 375px thì chúng chen nhau thành một hàng răng cưa. Nay
       bước sóng đo bằng PIXEL: màn hẹp thấy ít ngọn hơn, mỗi ngọn vẫn rộng
       đúng chừng ấy — như cắt một khúc của cùng một bức tranh. Đường chuông
       thì giữ theo TỈ LỆ, vì ngọn cao là chuyện bố cục: nó phải nằm đúng chỗ
       ấy trong khung ở mọi khổ màn.

       ── HAI CÁCH TÔ, CHO HAI LOẠI NÚI ──
       NÚI XA (có `dinh`): đậm nhất ngay tại đường sống rồi nhoè dần xuống.
       Nhìn một dãy núi xa qua sương thì đúng như vậy — đường sống cắt vào nền
       trời còn đọc được, còn chân núi thì chìm trong sương. Tô ngược lại thì
       cái đỉnh, thứ duy nhất làm nó ra một NGỌN, lại là chỗ mờ nhất.

       NÚI GẦN (không `dinh`): NGƯỢC LẠI — nhạt ở đỉnh, đậm dần xuống chân.
       Đỉnh tan vào giấy, vì núi thuỷ mặc không có đường viền trên, và vì mấy
       nếp gần ở đây là đồi thấp nằm trong sương chứ không phải ngọn nhô lên
       khỏi sương.

       Chính hai cách tô này là chỗ bản trước làm hỏng: nó đánh khối
       đậm-trên-nhạt-dưới cho MỌI dãy, nên năm dãy xếp lên nhau ra năm nếp lụa
       gấp cùng một kiểu.
       ══════════════════════════════════════════════════════════════════════ */
    function veNui(c, o) {
      var y0 = o.y * H0, cao = o.cao * H0;
      var xaXoi = o.xaXoi, kW = W0 / 1400, d = [], x, k;

      for (x = 0; x <= W0; x += 3) {
        var u = x / W0, h = 0;
        for (k = 0; k < o.song.length; k++) {
          h += Math.sin(u * o.song[k][0] * kW + o.song[k][2]) * o.song[k][1];
        }
        d.push([x, y0 - h * cao * bao(u, o.bao, o.san)]);
      }

      /* Góp đường sống của dãy này vào đường bao chung (xem `dinhQ`). Mọi dãy
         lấy mẫu cùng một bước 3px nên các chỉ số khớp nhau. */
      for (k = 0; k < d.length; k++) {
        if (dinhQ[k] === undefined || d[k][1] < dinhQ[k]) dinhQ[k] = d[k][1];
      }

      function thanNui() {
        c.beginPath();
        c.moveTo(0, H0);
        for (var q = 0; q < d.length; q++) c.lineTo(d[q][0], d[q][1]);
        c.lineTo(W0, H0);
        c.closePath();
      }

      /* ── SƯƠNG CHÂN NÚI ──
         Một dải giấy mỏng rắc dọc đường sống, vẽ TRƯỚC lớp giấy đặc, nên nó
         xoá mờ đúng cái CHÂN của dãy đứng sau. Bản cũ không cần dải này vì các
         lớp của nó trong suốt và cộng dồn vào nhau; ở đây lớp nào cũng tô giấy
         đặc (xem dưới), nên không có nó thì mỗi đường sống là một chỗ cắt. */
      if (o.suong) {
        c.save();
        c.lineJoin = 'round';
        c.lineCap = 'butt';
        var lop = 30, a1 = 1 - Math.pow(1 - o.suong, 1 / lop);
        c.strokeStyle = 'rgba(' + giayRGB() + ',' + a1.toFixed(4) + ')';
        for (k = lop - 1; k >= 0; k--) {
          c.lineWidth = cao * (0.05 + (k / (lop - 1)) * 0.80);
          c.beginPath();
          c.moveTo(d[0][0], d[0][1]);
          for (var q1 = 1; q1 < d.length; q1++) c.lineTo(d[q1][0], d[q1][1]);
          c.stroke();
        }
        c.restore();
      }

      /* ── GIẤY ĐẶC ──
         Bản cũ để mọi lớp trong suốt. Nhìn thì êm, nhưng nó không che được gì,
         và bản cũ không có thiên thể nên không ai phát hiện. Thêm mặt trời với
         mặt trăng vào thì lỗi lộ ra ngay: cái đĩa được vẽ TRƯỚC núi, nên nó
         lặn xuống dưới sống núi rồi mà vẫn thấy tròn vành vạnh — nhìn xuyên
         qua đá. Từng thử chừa 6–12% cho "quầng rạng" rọi qua: 12% của một đĩa
         đặc vẫn là một vệt cam rõ mồn một nằm giữa sườn núi. Núi che là che
         kín; chặng rạng lấy từ phần quầng NHÔ TRÊN sống núi, quầng rộng gấp
         chín lần cái đĩa nên vẫn còn nguyên. */
      thanNui();
      c.fillStyle = GIAY;
      c.fill();

      var g;
      if (xaXoi) {
        g = c.createLinearGradient(0, y0 - cao * 1.55, 0, y0 + cao * 0.50);
        g.addColorStop(0, 'rgba(' + o.muc + ',' + o.dam.toFixed(3) + ')');
        g.addColorStop(0.62, 'rgba(' + o.muc + ',' + (o.dam * 0.55).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + o.muc + ',0)');
      } else {
        g = c.createLinearGradient(0, y0 - cao, 0, y0 + cao * 0.90);
        g.addColorStop(0, 'rgba(' + o.muc + ',0)');
        g.addColorStop(0.45, 'rgba(' + o.muc + ',' + (o.dam * 0.72).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + o.muc + ',' + o.dam.toFixed(3) + ')');
      }
      c.fillStyle = g;
      c.fill();

      /* ── NÉT SỐNG NÚI: TUỲ CHỌN, MẶC ĐỊNH TẮT ──
         Với lối tô ở trên thì MÉP TRÊN CỦA LỚP RỬA ĐÃ LÀ NÉT: chỗ đậm nhất của
         gradient núi xa nằm đúng trên đường sống, nên cái sống ấy tự cắt vào
         nền trời thành một đường. Đi thêm một nét nữa lên đúng chỗ ấy là kẻ hai
         lần một đường, và đường thứ hai — dù mảnh, dù ngắt quãng — vẫn biến
         bóng núi thành một hình tô màu có outline. Tranh thuỷ mặc không viền
         núi: chỗ nào cần sắc thì để mực đậm lại ở đó.

         Nên `o.vien` để TRỐNG ở mọi dãy trong bản dựng. Nó còn ở đây vì có một
         lối vẽ khác cũng đúng: mực rửa nhạt tới mức gần như không có, và toàn
         bộ hình do NÉT gánh — khi ấy nét không chồng lên một mảng đậm nào cả,
         nên nó không ra outline mà ra chính cái hình. Muốn thử lối ấy thì khai
         `vien` với một lớp rửa rất nhạt, chứ không phải thêm nét vào lớp rửa
         hiện tại.

         Nét TẮT HẲN ở chỗ sống chưa nhô khỏi mặt nước: chỗ ấy đằng nào cũng
         chìm dưới lớp rửa nước, đi nét vào đó là kẻ một đường ngang suốt khung. */
      if (o.vien) {
        /* Pha của nhịp bút lấy từ `o.song[0][2]` — pha của sóng đầu tiên, thứ
           mọi dãy đều có. Bản trước lấy từ một tham số của bộ dựng nhiễu đã
           bỏ: nó thành `undefined`, `Math.sin(x + undefined)` ra `NaN`, và
           `NaN.toFixed(3)` ra chuỗi "NaN". Canvas gặp một màu không hợp lệ thì
           KHÔNG báo lỗi — nó lặng lẽ giữ `strokeStyle` cũ, mà cũ ở đây là màu
           mặc định: ĐEN ĐẶC. Nên cả nét sống hiện ra thành một đường đen tuyệt
           đối, đo ra "tối nhất 0". Cùng chuyện với `lineWidth = NaN`.

           Đây là kiểu lỗi canvas dễ để lọt nhất: không ngoại lệ, không cảnh
           báo, chỉ một con số sai và một cái nét sai màu. */
        var nuoc = MEP_NUOC * H0, B = 6, day = o.vienDay || 1.1;
        var phaBut = o.song[0][2];
        c.lineCap = 'round';
        c.lineJoin = 'round';
        for (k = 0; k + B < d.length; k += B) {
          var t0 = d[k], t1 = d[k + B];
          if (t0[1] >= nuoc) continue;
          var noiLen = muot(nuoc - t0[1], 0, cao * 0.12);
          var doc = Math.min(1, Math.abs((t1[1] - t0[1]) / (t1[0] - t0[0])) * 1.3);
          var uu2 = t0[0] / W0;
          /* Hai nhịp lệch tần cho bút có chỗ thở; luỹ 1,4 để có chỗ ăn hẳn vào
             giấy và chỗ bỏ trắng, thay vì dày mỏng đều như một sóng sin. */
          var but = (0.5 + 0.5 * Math.sin(uu2 * 13.0 + phaBut * 1.7)) * 0.7
                  + (0.5 + 0.5 * Math.sin(uu2 * 34.0 + phaBut * 2.9)) * 0.3;
          c.lineWidth = day * (0.46 + doc * 0.84) * (0.66 + 0.56 * but);
          c.strokeStyle = 'rgba(' + (o.mucVien || o.muc) + ',' +
            (o.vien * noiLen * Math.pow(0.32 + 0.68 * but, 1.4)).toFixed(3) + ')';
          c.beginPath();
          c.moveTo(t0[0], t0[1]);
          for (var q3 = k + 1; q3 <= k + B; q3++) c.lineTo(d[q3][0], d[q3][1]);
          c.stroke();
        }
      }
      /* ── NÉT CHỈ ĐI Ở DÃY GẦN ──
         Ba dãy xa để `vien` trống, và đó là chủ ý: với lối tô của núi xa thì
         MÉP TRÊN CỦA LỚP RỬA ĐÃ LÀ NÉT — chỗ đậm nhất của gradient nằm đúng
         trên đường sống, nên cái sống ấy tự cắt vào nền trời thành một đường.
         Vẽ thêm một nét lên đúng chỗ ấy là kẻ hai lần một đường, và đường thứ
         hai biến bóng núi thành một hình tô màu có outline.

         Hai nếp gần thì ngược: chúng tô nhạt-ở-đỉnh, nên mép trên của chúng
         TAN vào giấy và không có gì cắt ra hình. Ở đấy nét không chồng lên mảng
         đậm nào cả, nên nó không ra outline mà ra chính cái hình. */

    }

    /* Sương TĨNH nướng vào tấm nền: xoá mực trong một dải ngang, đậm giữa dải,
       tan ra hai mép, và không đều tay suốt bề ngang — bốn bệt rời đặt lệch
       nhau, vì sương thật đọng thành đám chứ không nằm thành thanh. */
    function veSuong(c, y, cao, manh) {
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
        loang(c, W0 * DAM[i][0], y, W0 * DAM[i][1], cao * 1.30, '0,0,0', manh * DAM[i][2], true);
      }
    }

    /* ══════════════════════════════════════════════════════════════════════
       BỜ NƯỚC LÀ CHỖ MỰC TAN, KHÔNG PHẢI MỘT ĐƯỜNG

       Chỗ nào đường sống trũng xuống dưới mép nước thì phần đất ấy phải đi
       mất. Đã thử cách thẳng tay nhất: KẸP đường sống lại ở mép nước. Nó giải
       đúng bài — không còn quả đồi ngập trong hồ — rồi tạo ra một lỗi nặng
       hơn, vì chỗ kẹp là một đoạn NẰM NGANG TUYỆT ĐỐI, và mọi chỗ kẹp trên cả
       bề ngang nối nhau thành một đường kẻ chạy suốt khung. Đọc ra là "đây là
       bờ nè" — thô, và đó là thứ duy nhất trong bức có một đường thẳng.

       Bờ nước thật không phải một đường. Nó là chỗ mực THƯA đi rồi hết: nước
       nông thì còn thấy đáy, sâu dần thì mất hẳn. Nên thay cú kẹp bằng một dải
       giấy phủ dần, bắt đầu từ HƠI TRÊN mép nước (−0,012 khung) và đặc hẳn ở
       dưới mép 0,05 khung. Ranh giới của đất khi ấy vẫn là chính đường sống
       uốn lượn của nó — chỗ nào nhô cao thì còn thấy, chỗ nào trũng thì tan
       vào nước — và không có một đoạn thẳng nào cả.

       Bắt đầu từ trên mép nước là chủ ý: nếu bắt đầu đúng tại mép thì tại đó
       giấy còn trong suốt, nên vẫn còn một nấc chuyển thấy được. Cho nó chớm
       lên trên một chút thì mép nước thôi là một mốc, nó thành một quãng.
       ══════════════════════════════════════════════════════════════════════ */
    function veTanNuoc(c) {
      /* ── TAN SỚM HƠN MÉP NƯỚC MỘT QUÃNG RỘNG ──
           Đo trên bản trước, lấy độ sáng bình quân từng hàng (mực đã hợp lên
           giấy trắng): 0,69 H ra 247, rồi TỤT xuống 217 ở 0,73, rồi lên lại
           247 ở 0,78. Một dải tối rộng chừng 6% khung nằm NGAY TRÊN mép nước
           — đó là chân mấy nếp núi gần, chỗ mực đậm nhất của chúng, và lớp
           giấy phủ nước lúc ấy mới bắt đầu ở 0,738 nên không với tới.

           Mắt không đọc dải ấy ra là "chân núi". Nó đọc ra là một vạch tương
           phản chạy ngang bên trên bờ nước — tức đúng cái mà cả lượt làm mềm
           bờ nước định bỏ đi, chỉ là nó lùi lên cao hơn vài chục pixel.

           Nay lớp giấy bắt đầu tan từ 0,688 và mạnh tay sớm: ở 0,73 nó phủ
           chừng nửa, nên dải tối chỉ còn là một chỗ hơi sẫm chứ không còn là
           một vạch. Chân núi vẫn chìm dần vào nước — chỉ là nó chìm từ cao
           hơn, đúng như một bờ nông thoải. */
      var y1 = H0 * (MEP_NUOC - 0.062), y2 = H0 * (MEP_NUOC + 0.055);
      var rgb = giayRGB();
      var g = c.createLinearGradient(0, y1, 0, y2);
      g.addColorStop(0,    'rgba(' + rgb + ',0)');
      g.addColorStop(0.14, 'rgba(' + rgb + ',0.52)');
      g.addColorStop(0.34, 'rgba(' + rgb + ',0.78)');
      g.addColorStop(0.66, 'rgba(' + rgb + ',0.88)');
      g.addColorStop(1,    'rgba(' + rgb + ',0.94)');
      c.fillStyle = g;
      c.fillRect(0, y1, W0, H0 - y1);
    }

    /* Mặt nước: phủ GIẤY (không xoá mực — xoá thì tấm nền thủng và thứ nằm
       dưới nó lộ ra qua lỗ), rồi mấy nét ngang mảnh. */
    function veNuoc(c) {
      var y0 = H0 * MEP_NUOC;
      var rgb = giayRGB();
      var g = c.createLinearGradient(0, y0, 0, H0);
      g.addColorStop(0, 'rgba(' + rgb + ',0)');
      g.addColorStop(0.10, 'rgba(' + rgb + ',0.58)');
      g.addColorStop(0.30, 'rgba(' + rgb + ',0.86)');
      g.addColorStop(1, 'rgba(' + rgb + ',0.93)');
      c.fillStyle = g;
      c.fillRect(0, y0, W0, H0 - y0);
      c.lineCap = 'round';
      /* Dải nước nay chiếm một phần tư khung, cao gần gấp đôi bản trước, nên
         số nét phải tăng theo — chín nét trải trên một dải cao gấp đôi thì nửa
         dưới trống trơn, và một mặt nước trống trơn đọc ra là giấy chưa vẽ chứ
         không ra là nước. */
      for (var i = 0; i < 16; i++) {
        var yy = y0 + H0 * (0.022 + i * 0.0145) + Math.sin(i * 2.7) * 3;
        if (yy > H0 - 4) break;
        var dai = W0 * (0.13 + ((i * 7) % 5) * 0.08);
        var x0 = W0 * (0.07 + ((i * 3) % 7) * 0.11);
        if (x0 + dai > W0) x0 = W0 - dai - 10;
        c.strokeStyle = 'rgba(' + MUC_GAN + ',' + (0.030 + (i % 3) * 0.014).toFixed(3) + ')';
        c.lineWidth = 0.8 + (i % 2) * 0.5;
        c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + dai, yy); c.stroke();
      }
    }

    /* ── VỆT SÁNG TRÊN NƯỚC ──
       Không phải một cái bầu dục loang. Ánh sáng trên mặt nước là một CỘT
       những vệt ngang rời nhau: gần bờ thì ngắn và khít, càng ra xa càng dài
       và thưa, cả cột rung theo sóng. Vẽ một khối mờ thì ra một vũng dầu. */
    function veVet(c, x, rong, m, mo, t, xoa) {
      var y0 = H0 * (MEP_NUOC + 0.018), y1 = H0 * 0.995;
      if (y1 <= y0 || mo <= 0.004) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';
      var n = 13;
      for (var i = 0; i < n; i++) {
        var u = i / (n - 1);
        var y = y0 + (y1 - y0) * u;
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
       Khác nhau đúng ở chỗ ĐỔ MỰC hay LẤY MỰC: trên giấy trắng, mặt trăng sáng
       được là nhờ lấy bớt lớp rửa đêm đi, còn mặt trời thì tự nó là một vệt
       màu ấm.

       Quầng và đĩa đi HAI LƯỢT, không một. Một gradient chỉ có một mức đậm ở
       tâm, mà quầng rộng gấp mấy lần đĩa nên phải mỏng tới mức gần như không
       thấy, còn đĩa phải ĐẶC để đọc ra là một vật — nhét cả hai vào một
       gradient thì mức đậm phải chọn theo cái rộng hơn, và đĩa bị kéo mờ theo
       quầng. Đó là vì sao hai thiên thể từng "hơi mờ".

       Đuôi quầng phải RẤT dài. Trên mặt giấy trắng trơn thì không có gì che
       được một chỗ gãy độ đậm, kể cả gãy một nấc trên 255: mắt tự vẽ thêm một
       đường viền ở đó (Mach band). Quầng tắt hẳn ở `r·6,2` thì đúng tại vòng
       tròn ấy hiện ra một cái VÀNH mờ quanh mặt trời. Nay `r·9,5` và bảy
       chặng, ba chặng ngoài đã dưới một phần nghìn. */
    /* `ky` — pha của kỳ trăng, 0 là tròn và 1 là tối hẳn. Mặt trời luôn
       truyền 0: nó không có pha, và một mặt trời khuyết thì đó là nhật thực. */
    function veDia(c, x, y, r, m, moQuang, moDia, xoa, ky) {
      ky = ky || 0;
      if (moQuang <= 0.004 && moDia <= 0.004) return;
      c.save();
      if (xoa) c.globalCompositeOperation = 'destination-out';
      if (moQuang > 0.004) {
        var R = r * 9.5;
        var gq = c.createRadialGradient(x, y, r * 0.55, x, y, R);
        gq.addColorStop(0,    'rgba(' + m + ',' + moQuang.toFixed(4) + ')');
        gq.addColorStop(0.10, 'rgba(' + m + ',' + (moQuang * 0.46).toFixed(4) + ')');
        gq.addColorStop(0.25, 'rgba(' + m + ',' + (moQuang * 0.170).toFixed(4) + ')');
        gq.addColorStop(0.42, 'rgba(' + m + ',' + (moQuang * 0.055).toFixed(4) + ')');
        gq.addColorStop(0.60, 'rgba(' + m + ',' + (moQuang * 0.018).toFixed(4) + ')');
        gq.addColorStop(0.80, 'rgba(' + m + ',' + (moQuang * 0.004).toFixed(4) + ')');
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
        c.beginPath();
        if (ky > 0.001) duongKy(c, x, y, r, ky); else c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    /* ══════════════════════════════════════════════════════════════════════
       MỘT KỲ TRĂNG — TRÒN · KHUYẾT · BÁN KHUYẾT · LƯỠI LIỀM

       Phần sáng của mặt trăng không phải một hình tuỳ ý: nó luôn là một nửa
       đường TRÒN ghép với một nửa đường BẦU DỤC. Bầu dục ấy là đường phân giới
       (terminator) — vòng tròn ngăn ngày với đêm trên quả cầu, mà ta nhìn
       nghiêng nên nó dẹt lại.

       Bán trục ngang của nó là `r · cos θ`, với θ là góc pha:

           θ = 0        cos = 1     bầu dục trùng đường tròn  →  TRĂNG TRÒN
           θ = 60°      cos = .50   bầu dục phình sang phải   →  KHUYẾT
           θ = 90°      cos = 0     bầu dục dẹt thành đoạn thẳng → BÁN KHUYẾT
           θ = 130°     cos = −.64  bầu dục cong ngược lại    →  LƯỠI LIỀM

       Dấu của `cos θ` quyết định bầu dục cong về bên nào, và `ellipse()` của
       canvas nhận điều đó qua tham số chiều quay — nên đúng MỘT công thức lo
       cả bốn dáng, không phải bốn nhánh `if`.

       Vẽ ngược chiều kim cho nửa đường tròn rồi xuôi chiều cho nửa bầu dục
       (hoặc ngược lại khi đã qua bán khuyết): hai nửa phải nối đầu–đuôi, không
       thì `fill()` ra một hình số tám. */
    function duongKy(c, x, y, r, ky) {
      var th = ky * Math.PI;
      var a = r * Math.cos(th);
      /* Nửa đường tròn bên TRÁI — phía còn sáng. Đi NGƯỢC chiều kim từ −90°
         tới 90° thì nó vòng qua 180°, tức nửa trái; đi xuôi chiều là vòng qua
         0° và ra nửa PHẢI, lúc ấy hình đổ ra là phần BÓNG chứ không phải phần
         sáng — kỳ trăng chạy ngược, lưỡi liềm trước rồi mới tròn.

         Đo để chốt, không suy: đổ hình rồi đếm điểm ảnh, lấy tỉ lệ trên diện
         tích đĩa. Cách này ra 0,999 · 0,852 · 0,499 · 0,181 · 0 cho
         ky = 0 · 0,25 · 0,5 · 0,72 · 1 — đúng một kỳ trăng đi từ tròn xuống
         tối. Cách kia ra đúng dãy số ấy nhưng lộn đầu. */
      c.arc(x, y, r, -Math.PI / 2, Math.PI / 2, true);
      /* Nửa đường phân giới. `a < 0` thì nó cong ngược, và cờ chiều quay đảo
         theo để hai nửa vẫn nối liền. */
      c.ellipse(x, y, Math.abs(a), r, 0, Math.PI / 2, -Math.PI / 2, a > 0);
      c.closePath();
    }

    /* ══════════════════════════════════════════════════════════════════════
       BỐ CỤC — HAI NGỌN CAO Ở XA, MẤY NẾP THẤP Ở GẦN

       Hai lớp đầu là NÚI XA: cao hơn hẳn, nhạt hơn hẳn, mỗi lớp một ngọn nhô
       lên (`dinh`). Chúng đứng ở nửa trên khung để còn chỗ cho mây trôi ngang
       qua CHÂN chúng — mây che ngang lưng một ngọn núi cao là hình ảnh làm nên
       cả bức, còn mây trôi trên một dãy đồi thấp thì chỉ là mây trôi trên trời.

       Hai ngọn không cùng cỡ và không cùng độ cao: một ở x=0,23 cao 0,85, một
       ở x=0,69 cao 0,72. Bằng nhau là đối xứng, và đối xứng trong sơn thuỷ đọc
       ra là hình trang trí.

       Mấy lớp sau là nếp gần, thấp và đậm dần xuống đáy, đỉnh tan vào giấy.

       Rồi mặt nước. Chân mọi nếp nằm dưới mép nước nên chúng chìm hẳn — đó là
       cách một ngọn núi mọc lên từ mặt hồ mà không kéo theo một dải đất chạy
       suốt khung.
       ══════════════════════════════════════════════════════════════════════ */
    function veTamNen() {
      W0 = W; H0 = caoKhung();
      dinhQ = [];
      xa = document.createElement('canvas');
      xa.width = Math.max(1, Math.round(W0));
      xa.height = Math.max(1, Math.round(H0));
      var c = xa.getContext('2d');

      /* Hai ngọn cao ở XA: cao hơn hẳn, nhạt hơn hẳn. Chúng đứng ở nửa trên
         khung để còn chỗ cho mây trôi ngang qua CHÂN chúng — mây che ngang
         lưng một ngọn núi cao là hình ảnh làm nên cả bức, còn mây trôi trên
         một dãy đồi thấp thì chỉ là mây trôi trên trời.

         Hai ngọn không cùng cỡ và không cùng độ cao. Bằng nhau là đối xứng, và
         đối xứng trong sơn thuỷ đọc ra là hình trang trí. */
      /* ── CHÂN DÃY ĐẶT DƯỚI MÉP NƯỚC ──
         `chan` là chỗ đường sống tụt về khi cái bao tắt. Đặt nó TRÊN mặt nước
         thì cái vai phẳng ấy hiện ra thành một đường ngang suốt khung. Nên nó
         xuống dưới mép nước (0,86–0,88 so với mép nước 0,80) và `cao` tăng lên
         bù: ngọn vẫn tới đúng độ cao ấy trong khung, còn vai phẳng thì chìm
         hẳn dưới lớp rửa nước. Đó là cách một ngọn núi mọc lên từ mặt hồ mà
         không kéo theo một dải đất chạy suốt khung.

         ── VÀ VÌ SAO SÀN KHÔNG ĐƯỢC VỀ 0 ──
         Đã thử `san: 0` cho gọn: mỗi dãy chỉ còn một khối quanh ngọn của nó,
         rất nhiều giấy trắng. Đo ra mới thấy sai — mực chỉ còn phủ 30% khung,
         trong khi bản V2.6.9 (bản đọc ra "hữu tình") phủ tới 56%. Hoá ra cái
         làm nên không khí của lối vẽ ấy KHÔNG phải một chỗ nào đậm: chỗ đậm
         nhất của nó còn nhạt hơn ở đây (201 so với 192 trên thang 255). Nó là
         một TRƯỜNG mực rất nhạt trải rộng — mực mỏng thì chỗ nào cũng còn thấy
         giấy dưới nó, và cái đọc ra là hơi nước; để trống thì đọc ra là trống.

         Nên sàn trở lại 0,32–0,36: dãy vẫn trải ngang, nhưng phần trải ấy nằm
         sát mặt nước và mỏng tới mức nó là sương chứ là đất. */
      /* ── NÚI KÉO LẠI GẦN ──
         Tần số sóng hạ hẳn xuống (1,4–6,4 radian trên khổ 1400px, so với
         2,2–14 của bản trước): ít ngọn hơn, mỗi ngọn rộng hơn. Đó là cách duy
         nhất nói ra "gần" trong một bức không có phối cảnh — vật gần thì chiếm
         nhiều góc nhìn hơn, nên ít vật hơn mà mỗi vật lớn hơn. Đẩy `cao` lên
         cũng làm núi lớn, nhưng nó làm núi CAO chứ không làm núi GẦN.

         Bốn tầng sát nhau (0,64 · 0,70 · 0,76 · 0,81) thay vì trải từ 0,37:
         khoảng giữa các tầng hẹp lại thì mắt đọc ra chúng cách nhau ít, tức là
         cả cụm đang ở gần. */
      /* ── NÚI KÉO LẠI GẦN, MÀ KHÔNG ĐỔI TẦN SỐ SÓNG ──
         Đã thử hạ tần số (1,4–6,4 thay cho 2,2–14) với lý do "ít ngọn hơn,
         mỗi ngọn rộng hơn thì đọc ra là gần". Sai: dưới một chu kỳ trên cả bề
         ngang thì dãy núi không còn là dãy núi, nó là một đường chân trời hơi
         nghiêng. Và nét sống đi trên một đường gần thẳng thì đọc ra đúng là
         một nét kẻ.

         Nên bộ tần số giữ nguyên của V2.8.8 (đường cong ấy đã đẹp), còn "gần"
         dồn vào hai chỗ khác: `cao` nhân 1,35 và cả cụm tụt xuống chừng 0,06
         khung. Vật gần thì CHE nhiều hơn và trùm cao hơn trong khung — đó mới
         là dấu hiệu của khoảng cách. Mép nước xuống theo (0,755 → 0,855): núi
         lại gần thì thấy ít mặt hồ hơn, đúng như bước lên vài bước. */
      /* ── NÚI KÉO LẠI GẦN, MÀ KHÔNG ĐỔI TẦN SỐ SÓNG ──
         Đã thử hạ tần số (1,4–6,4 thay cho 2,2–14) với lý do "ít ngọn hơn,
         mỗi ngọn rộng hơn thì đọc ra là gần". Sai: dưới một chu kỳ trên cả bề
         ngang thì dãy núi không còn là dãy núi, nó là một đường chân trời hơi
         nghiêng. Và nét sống đi trên một đường gần thẳng thì đọc ra đúng là
         một nét kẻ.

         Nên bộ tần số giữ nguyên của V2.8.8 (đường cong ấy đã đẹp), còn "gần"
         dồn vào hai chỗ khác: `cao` nhân 1,35 và cả cụm tụt xuống chừng 0,06
         khung. Vật gần thì CHE nhiều hơn và trùm cao hơn trong khung — đó mới
         là dấu hiệu của khoảng cách. Mép nước xuống theo (0,755 → 0,855): núi
         lại gần thì thấy ít mặt hồ hơn, đúng như bước lên vài bước. */
      /* ── NÚI KÉO LẠI GẦN, MÀ KHÔNG ĐỔI TẦN SỐ SÓNG ──
         Đã thử hạ tần số (1,4–6,4 thay cho 2,2–14) với lý do "ít ngọn hơn,
         mỗi ngọn rộng hơn thì đọc ra là gần". Sai: dưới một chu kỳ trên cả bề
         ngang thì dãy núi không còn là dãy núi, nó là một đường chân trời hơi
         nghiêng. Và nét sống đi trên một đường gần thẳng thì đọc ra đúng là
         một nét kẻ.

         Nên bộ tần số giữ nguyên của V2.8.8 (đường cong ấy đã đẹp), còn "gần"
         dồn vào hai chỗ khác: `cao` nhân 1,35 và cả cụm tụt xuống chừng 0,06
         khung. Vật gần thì CHE nhiều hơn và trùm cao hơn trong khung — đó mới
         là dấu hiệu của khoảng cách. Mép nước xuống theo (0,755 → 0,855): núi
         lại gần thì thấy ít mặt hồ hơn, đúng như bước lên vài bước. */
      veNui(c, {
        y: 0.440, cao: 0.380, muc: MUC_XA, dam: 0.085, xaXoi: true,
        song: [[4.3, 0.46, 0.6], [1.8, 0.34, 2.1], [8.4, 0.13, 4.4]]
      });
      veSuong(c, H0 * 0.510, H0 * 0.042, 0.22);
      veNui(c, {
        y: 0.540, cao: 0.300, muc: MUC_XA2, dam: 0.100, xaXoi: true, suong: 0.22,
        song: [[5.4, 0.44, 3.4], [2.3, 0.30, 0.8], [10.1, 0.11, 1.9]]
      });
      veSuong(c, H0 * 0.600, H0 * 0.036, 0.22);
      veNui(c, {
        y: 0.635, cao: 0.255, muc: MUC_GIUA, dam: 0.118, xaXoi: true, suong: 0.22,
        song: [[3.7, 0.48, 1.5], [6.6, 0.22, 5.2], [11.2, 0.09, 3.1]]
      });

      /* ── ĐIỂM NHÌN NẰM Ở ĐÂY ──
         Hai nếp gần đậm hơn ba dãy xa một bậc rõ, và có nét sống. Trên trang
         chủ thì chỗ này nằm dưới dòng chữ lớn và sau thẻ trích dẫn — đúng phần
         mắt đi tới sau khi đọc xong tiêu đề. Dồn tương phản vào đấy thì bức có
         chỗ kết, mà chữ ở trên vẫn nằm trên giấy gần như trắng.

         Mép nước lên 1/4 khung (0,750) nên hai nếp này xếp lại: nếp chính lên
         0,700 để một nửa sống của nó còn nhô trên nước, còn nếp cuối tụt xuống
         0,965 và mỏng đi một nửa — nó chỉ còn là một vệt bờ ở sát đáy, chừa
         nguyên dải nước ở giữa. */
      /* Dải tan đặt trên tấm XA trước: chân ba dãy xa cũng trũng xuống dưới
         mép nước, và chúng lộ qua tấm gần ở những chỗ tấm gần không che. */
      veTanNuoc(c);

      gan = document.createElement('canvas');
      gan.width = xa.width; gan.height = xa.height;
      var g = gan.getContext('2d');

      veNui(g, {
        y: 0.700, cao: 0.180, muc: MUC_GAN, dam: 0.175, suong: 0.26,
        song: [[2.7, 0.55, 2.6], [5.7, 0.25, 4.9]],
        vien: 0.38, mucVien: '26,30,36', vienDay: 1.15
      });
      veTanNuoc(g);
      veNuoc(g);
      /* ── VÙNG NƯỚC LẤY CỦA Ý E, NÚI LẤY CỦA Ý D ──
         Nếp bờ cuối vẽ SAU mặt nước: nó ở gần nhất, nằm TRÊN nước chứ không
         chìm dưới lớp rửa nước. Nhưng nó nhạt hơn núi một bậc rõ và KHÔNG có
         nét sống — ngược với mấy nếp núi ở trên.

         Nghe như phá luật "càng gần càng đậm", mà không: một vệt bờ thấp nằm
         sát mặt nước thì cái mắt thấy không phải khối đất, nó là hơi nước bốc
         trên mặt hồ. Đi nét vào đấy là đóng đáy bức lại bằng một đường kẻ, và
         cả một phần tư khung dành cho nước thành ra chỉ là một cái khung. */
      /* ── NẾP BỜ GẦN NHẤT CHỈ VẼ KHI KHUNG BẰNG CẢ KHỐI ──
         Nó là TIỀN CẢNH: đáy bức, chỗ mắt đứng, và nó chỉ đúng vai khi mép
         dưới khung vẽ cũng là mép dưới khối chứa. Ở một khối cao gấp đôi
         (trang About) thì dưới nó còn cả một dải nước nữa, nên nó thành một
         vạch sẫm nằm ngang GIỮA trang — một cái bờ mọc giữa hồ.

         Đã thử phủ giấy tan dần lên nó thay vì bỏ hẳn. Không ăn: nếp này trải
         từ 0,91 tới 1,0 khung, nên muốn phủ kín thì lớp giấy phải đạt trị tối
         đa ngay ở 0,91 — và thế thì chính chỗ 0,91 ấy lại thành một mép. Đo
         ra 239 so với 248 hai bên: chín nấc, mà chín nấc trên một mảng gần
         trắng thì mắt đọc ra một đường kẻ (vành Mach, xem §12.1).

         Bỏ hẳn thì mặt nước ở đó là mặt nước, liền một mạch xuống tới đáy
         khối. Một cái hồ rộng ra về phía người xem thì không có tiền cảnh —
         đúng thế mới phải. */
      if (H <= H0 + 0.5) {
        veNui(g, {
          y: 0.965, cao: 0.055, muc: MUC_GAN, dam: 0.170, suong: 0.20,
          song: [[3.4, 0.50, 5.6], [7.2, 0.20, 1.2]]
        });
      }
    }

    return {
      dung: function () {
        veTamNen();
        var n = Math.max(6, Math.min(16, Math.round(W0 / 130)));
        chim = [];
        for (var i = 0; i < n; i++) chim.push(moiChim(true));

        var nm = Math.max(5, Math.min(16, Math.round(W0 / 120)));
        may = [];
        for (var im = 0; im < nm; im++) may.push(moiMay(true));

        var nv = Math.max(3, Math.min(9, Math.round(W0 / 220)));
        vet = [];
        for (var iv = 0; iv < nv; iv++) vet.push(moiVet(true));

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

        /* ══════════════════════════════════════════════════════════════════
           LẤP LÁNH THEO CỤM, KHÔNG THEO TỪNG SAO

           Bản trước cho mỗi sao một pha và một nhịp riêng. Nghe thì "tự
           nhiên", mà kết quả ngược lại: ở bất cứ khoảnh khắc nào cũng có
           chừng một nửa số sao đang sáng, rải đều khắp trời, nên không mảng
           nào nổi lên so với mảng nào. Trời đứng yên về TỔNG THỂ và chỉ rung
           ở chi tiết — mắt đọc ra là nhiễu màn hình, không đọc ra là lấp lánh.

           Gom sao vào mấy cụm và cho cả cụm thở cùng một nhịp thì có lúc một
           MẢNG trời rực lên rồi lịm đi trong khi mảng bên cạnh đang lịm. Đó
           là thứ nhìn ra được từ xa. Và nó gần thật hơn: cái làm sao lấp lánh
           là khí quyển, mà một khối khí thì phủ cả một vùng trời chứ không
           phủ đúng một ngôi sao.

           Vẫn chừa cho từng sao một quãng lệch pha (±0,8 radian) và một chút
           lệch nhịp: cả cụm bật tắt cùng một khắc thì đọc ra là một bóng đèn
           nhấp nháy, không ra là một vùng trời.

           Khoảng cách tính với trục tung nhân 1,6 — cụm vì thế trải NGANG hơn
           là trải dọc, đúng dáng một mảng khí quyển nhìn từ dưới lên, và cũng
           vừa với dải trời cao 0,46 khung mà sao được rải vào.
           ══════════════════════════════════════════════════════════════════ */
        cumSao = [];
        var nCum = Math.max(4, Math.min(7, Math.round(W0 / 220)));
        for (var ic = 0; ic < nCum; ic++) {
          cumSao.push({
            /* ── RẢI PHÂN TẦNG, KHÔNG RẢI THUẦN NGẪU NHIÊN ──
               Chia bề ngang thành `nCum` băng rồi đặt một cụm vào mỗi băng,
               lệch tự do trong băng ấy. Rải thuần ngẫu nhiên với bốn cụm thì
               rất hay có một góc trời không cụm nào — đo ra đúng thế ở khổ
               446px: một phần tư khung bên trái có nhịp bằng 0, tức góc ấy
               đứng chết suốt đêm. Phân tầng thì mọi phần trời đều có nhịp,
               mà vẫn không ra đều đặn vì chỗ đứng trong băng là ngẫu nhiên. */
            x: W0 * ((ic + 0.15 + 0.70 * Math.random()) / nCum),
            y: (0.05 + 0.36 * Math.random()) * H0,
            pha: Math.random() * Math.PI * 2,
            nhip: 0.020 + Math.random() * 0.022,
            manh: 0.55 + Math.random() * 0.45
          });
        }
        for (var js = 0; js < sao.length; js++) {
          var k0 = sao[js], gan0 = cumSao[0], dMin = Infinity;
          for (var jc = 0; jc < cumSao.length; jc++) {
            var ddx = k0.x - cumSao[jc].x, ddy = (k0.y - cumSao[jc].y) * 1.6;
            var d0 = ddx * ddx + ddy * ddy;
            if (d0 < dMin) { dMin = d0; gan0 = cumSao[jc]; }
          }
          k0.pha = gan0.pha + (Math.random() - 0.5) * 1.6;
          k0.nhip = gan0.nhip * (0.92 + Math.random() * 0.16);
          k0.manh = gan0.manh;
        }
      },

      /* ══════════ MỘT VÒNG NGÀY ══════════
         0.00 → 0.05  đêm tàn, chân trời đông ửng
         0.03 → 0.16  MẶT TRỜI MỌC — quầng sáng dâng lên từ sau ngọn núi xa
         0.16 → 0.42  lên cao, nhỏ và nhạt dần; giấy gần như trắng
         0.42 → 0.58  hạ về bên phải, to và đỏ lại; một dải ấm ở chân trời
         0.56 → 0.70  chạng vạng, sương dâng, sao hiện
         0.62 → 0.98  trăng đi một cung từ phải sang trái rồi lặn
         0.93 → 1.00  trời nhạt dần, nối về đầu vòng

         Chuyển động chính KHÔNG phải vòng ngày ấy — nó chậm quá, chẳng ai ngồi
         đợi. Chuyển động chính là MÂY TRÔI ngang lưng núi, và mấy vệt sương ở
         khoảng trống phía trên. */
      ve: function (t) {
        ctx.clearRect(0, 0, W, H);
        /* `HK` = chiều cao KHUNG VẼ (xem `caoKhung`), khác `H` = chiều cao
           canvas. Mọi con số bố cục đo theo `HK`; chỉ hai việc dùng `H`: xoá
           canvas, và tô nốt dải nước phía dưới khung. */
        var HK = H0 || H;
        var p = (t % CHU_KY) / CHU_KY;
        /* ── CỠ ĐĨA KHÔNG ĐƯỢC TÍNH THEO CẠNH NGẮN ──
           Trước đây `Math.min(W, H)`. Ở khổ ngang thì cạnh ngắn là chiều cao,
           hợp lý. Ở khổ dọc thì cạnh ngắn là bề NGANG — 375 so với 964 — nên
           mọi cỡ đĩa co lại hơn một nửa: mặt trăng từ bán kính 22px xuống còn
           9,75px, tức một đĩa 20px mờ nhạt trên một khoảng trời rộng. Trên
           điện thoại thì đọc ra là KHÔNG CÓ mặt trăng, và đó đúng là chuyện
           đã gặp.

           `Math.min(H, W * 2)` giữ nguyên khổ ngang (ở đó `H` vẫn nhỏ hơn) và
           ở khổ dọc thì lấy theo bề ngang nhân hai — ra bán kính 43px cho mặt
           trời và 19,5px cho mặt trăng. To hơn theo tỉ lệ bề ngang so với
           desktop, và đúng thế mới phải: trời trên điện thoại rộng và trống
           hơn nhiều, một cái đĩa bằng tỉ lệ cũ thì lọt thỏm trong đó. */
        var m = Math.min(HK, W * 2);
        var chanTroi = HK * CHAN_TROI;

        /* ── MỘT LƯỢT MẶT TRỜI, RỒI SANG TRĂNG ──
           Bản trước có HAI bao ấm: `binhMinh` đỉnh ở quãng 0,10 và `hoangHon`
           đỉnh ở quãng 0,53. Nghĩa là trong một vòng, mặt trời to-và-đỏ rồi
           nhỏ-và-nhạt rồi lại to-và-đỏ — cú zoom xảy ra hai lần, và lần thứ
           hai không kể thêm gì. Với lối "đứng một chỗ" thì nó càng lộ: cùng
           một chỗ, cùng một đĩa, phình ra rồi co lại rồi phình ra.

           Nay đúng một lượt, và đi một chiều: đĩa vào khung ở xa (nhỏ, nhạt,
           cao), rồi lớn dần, ấm dần, hạ dần — tới 0,46 thì tắt và trăng lên.
           `tien` là cả cú zoom ấy, từ 0 (xa) tới 1 (gần). */
        /* ── MẶT TRỜI NHANH, MẶT TRĂNG LÂU ──
           Trước đây mặt trời chiếm 0,02–0,46 của vòng và trăng 0,50–0,93 —
           gần như chia đôi. Nhưng hai chặng ấy không cùng một lượng chuyện để
           kể: mặt trời có cả cú lại gần (lớn dần, ấm dần, hạ dần), còn mặt
           trăng thì chỉ có một đĩa trắng trên nền trời sẫm — và chính cái
           TĨNH ấy mới là điều đáng giữ lâu. Nhìn nhanh qua một đêm thì nó
           thành một nhịp chuyển, không thành một cảnh.

           Nay mặt trời gói vào 0,02–0,34 (nhanh hơn một phần ba), và đêm trải
           từ 0,38 tới 0,95 — 57% của vòng, gần gấp đôi chặng ngày. */
        var tien     = muot(p, 0.02, 0.34);
        var dem      = muot(p, 0.38, 0.50) * (1 - muot(p, 0.95, 1.00));
        var ngay     = muot(p, 0.05, 0.14) * (1 - muot(p, 0.30, 0.40));
        /* Lớp trời ấm đi theo cú zoom, và tắt hẳn khi đêm tới. */
        var am       = tien * (1 - dem);
        /* Hai tên cũ còn được mấy chỗ dưới đọc: giữ lại, nhưng nay chúng chỉ
           là hai nửa của MỘT lượt — nửa đầu lúc trời còn sáng, nửa sau lúc
           trời đã ngả. Nhờ vậy sắc ấm vẫn đổi được từ hồng sang cam đất. */
        var binhMinh = am * (1 - muot(p, 0.16, 0.34));
        var hoangHon = am * muot(p, 0.16, 0.34);

        /* ══════════════════════════════════════════════════════════════════
           THIÊN THỂ: MỘT CHỖ, MỘT CÚ CHUYỂN CẢNH

           Mặt trăng đặt ĐÚNG chỗ mặt trời, không lệch một chút nào. Trời sẫm
           dần, mặt trời nhạt đi, mặt trăng hiện lên ngay tại đó. Lệch ra một
           quãng thì mắt đọc ra hai vật — một cái tắt, một cái bật; trùng khít
           thì nó đọc ra MỘT vật đang đổi.

           ── ĐÃ THỬ LỐI ĐI MỘT CUNG QUA TRỜI, VÀ ĐÃ BỎ ──
           Mỗi thiên thể đi một cung từ chân trời bên này sang bên kia, đúng
           như trời thật. Đẹp khi ngồi ngắm, sai khi làm nền một trang để đọc:

           · Một cái đĩa trôi ngang khung kéo mắt đi ngang đúng lúc đang đọc
             một dòng. Cùng cái lo đã làm cánh hoa ở trang giới thiệu bị hạ
             xuống .22 — bắt được một vật đang bay ngang nghĩa là đã mất một
             nhịp đọc.
           · Phần lớn vòng thì đĩa nằm thấp và bị núi che, nên chẳng thấy gì;
             rồi đột ngột có một vật băng qua. Cả vòng 70 giây, mà khách ở lại
             20 giây thì chỉ gặp một mảnh của chuyến đi.
           · Đi qua trời là đi qua CHỮ. Đứng một chỗ thì chọn được chỗ ấy một
             lần cho xong: 0,655 ngang · 0,175–0,285 dọc — khoảng trống giữa
             dòng chữ lớn và cột mục lục.

           Đổi lại, cái thay đổi dồn hết vào NỀN TRỜI. Một lớp rửa sẫm dần thì
           lúc đọc không ai thấy, lúc rời mắt khỏi chữ mới thấy — đó đúng là
           chỗ một cái nền nên đứng.
           ══════════════════════════════════════════════════════════════════ */
        /* `cung` ở đây không còn là độ cao trên cung trời. Nó chỉ còn làm một
           việc: nói mặt trời đang giữa trưa (1 — nhạt, vàng, nhỏ) hay đang lúc
           rạng/tà (0 — đỏ, to). Nên công thức màu và cỡ đĩa giữ nguyên được,
           không phải viết lại. */
        /* `cung` = 1 lúc đĩa còn xa (nhỏ, vàng nhạt) → 0,08 lúc nó đã tới gần
           (to, đỏ). Một chiều, không quay lại. */
        /* ── CHỖ ĐỨNG KHAI BẰNG CON SỐ, KHÔNG SUY TỪ ĐỈNH NÚI ──
           Đã thử suy dải trời ra từ đỉnh núi cao nhất đo được lúc nướng tấm
           nền, để chắc chắn thiên thể không bao giờ bị che ở bất cứ khổ màn
           nào. Ý đúng, mà phép đo sai: con số đỉnh tính ra giống nhau ở mọi bề
           ngang — dấu hiệu rõ ràng của một công thức sai — và nó đẩy mặt trăng
           xuống 0,33 H, tức vào đúng chỗ dòng chữ lớn.

           Nên quay về khai bằng con số, ở quãng đã biết là chạy được (0,095 →
           0,255 H, đều nằm trên đỉnh núi 0,352 với dư một quãng rộng). Muốn
           buộc vào đỉnh núi thì phải đo lại cho đúng trước, không phải đoán —
           và chuyện ấy để một lượt khác. */

        var cung = 1 - tien * 0.92;
        var sx = W * 0.655;
        /* Hạ xuống một quãng nhỏ lúc rạng và lúc tà. Không phải để làm một cái
           cung thu nhỏ — mà vì màu và độ cao phải nói cùng một chuyện: đĩa lúc
           ấy to và ĐỎ, mà đỏ là màu của thấp (ánh sáng đi qua nhiều khí quyển
           hơn). Một mặt trời đỏ ối đứng gần đỉnh trời thì mắt biết ngay là sai,
           dù không gọi được tên chỗ sai. 0,175 giữa trưa → 0,285 lúc tà: đủ để
           đọc ra buổi, chưa đủ để thành một chuyến đi.

           Nhịp sin cuối cho nó trôi lên xuống 0,016 khung suốt cả vòng. Đứng
           chết một chỗ thì đọc ra một cái hình dán lên, không ra thiên thể. */
        /* Hạ dần theo cú zoom: từ nóc dải xuống đáy dải. Càng gần càng thấp,
           và càng thấp thì càng đỏ — màu với độ cao nói cùng một chuyện. */
        /* Hạ dần theo cú zoom: 0,140 lúc còn xa → 0,255 lúc đã tới gần. Càng
           gần càng thấp, và càng thấp thì càng đỏ — màu với độ cao nói cùng
           một chuyện. */
        /* Quãng hạ 0,115 → 0,144 khung: nhanh hơn đúng 1,25 lần trong cùng
           khoảng thời gian, tức tốc độ tăng 25%. Đĩa vào khung ở 0,140 và hạ
           tới 0,284 — vẫn cao hơn chân trời 0,700 rất nhiều, và mép dưới đĩa
           lúc thấp nhất (0,284 + 0,058) mới tới 0,342, nên nó chỉ bắt đầu
           chạm vào ngọn núi ở mấy khổ hẹp. Chạm là đúng: đó là lúc lặn. */
        var sy = HK * (0.140 + 0.144 * tien + 0.012 * Math.sin(p * Math.PI * 2));
        /* Bán kính đo theo cạnh NGẮN của khung. 0,058 lúc rạng/tà → đĩa rộng
           chừng 11% chiều cao, đúng cỡ trong tranh gốc; giữa trưa nhỏ lại còn
           0,042. Từng để 0,078: đĩa rộng 15% khung và ở lối "đứng một chỗ" thì
           nó thành một cục màu to nằm mãi một chỗ, chứ không thành một thiên
           thể. Đi một cung thì to mấy cũng được, vì nó đi qua rồi hết. */
        var sr = m * (0.058 - 0.016 * cung);

        /* ── MẶT TRĂNG ĐI RIÊNG MỘT ĐƯỜNG, RẤT CHẬM ──
           Trước đây trăng đặt ĐÚNG chỗ mặt trời (`mx = sx, my = sy`) để cú
           chuyển cảnh đọc ra là một vật đang đổi. Cú chuyển ấy giữ nguyên —
           lúc giao nhau hai đĩa vẫn trùng chỗ — nhưng sau đó trăng tự dâng
           lên: 0,235 khung lúc vừa hiện, tới 0,158 lúc gần tàn, cộng một quãng
           trôi ngang 0,017 cho nó không thành một cú trượt thẳng đứng.

           Cả quãng dâng chỉ 0,077 khung trải trên hơn nửa vòng — chừng 40 giây
           cho 66 pixel ở khổ 863. Chậm tới mức không ai bắt được lúc nó đang
           đi, mà nhìn lại thì nó đã ở chỗ khác. Đó là tốc độ đúng cho một cái
           nền: đủ để bức tranh không phải một tấm hình tĩnh, không đủ để kéo
           mắt khỏi dòng chữ đang đọc. */
        /* Trăng đi ngược chiều mặt trời trong cùng dải ấy: vừa hiện thì ở đáy
           dải, gần tàn thì lên nóc. Cả quãng dâng chỉ bằng chiều cao dải —
           chừng 60 pixel ở khổ 863 — trải trên hơn nửa vòng, tức khoảng bốn
           mươi giây. Chậm tới mức không ai bắt được lúc nó đang đi, mà nhìn
           lại thì nó đã ở chỗ khác. */
        var tienTrang = muot(p, 0.40, 0.92);
        /* ══════════════════════════════════════════════════════════════════
           TRĂNG ĐI MỘT ĐƯỜNG CHÉO 15°

           Bản trước trăng chỉ dâng thẳng đứng 0,022 khung — chừng 21px trên
           một khung cao 955, trải suốt hơn nửa vòng. Không ai thấy được, và
           người dùng nói thẳng: "hiện tại ko cảm nhận đc mặt trăng moving rõ
           ràng". Con số ấy chọn hồi trăng còn kẹt trong một dải trời rất hẹp;
           nay chỗ đứng đo từ đường bao núi nên dải ấy rộng ra nhiều.

           Nay một đường CHÉO: 0,115 W đi ngang, nâng lên đúng
           0,115 × tan15° = 0,0308 W. Hai cạnh cùng đo bằng W nên góc trên màn
           đúng 15° ở mọi khổ — lấy chiều cao đo cạnh đứng thì góc đổi theo tỉ
           lệ khung, và ở khổ dọc nó thành gần 40°.

           Quãng đi thật: 139px ở khổ 1169 (134 ngang + 36 lên), so với 21px
           của bản trước. Vẫn chậm — trải trên hơn nửa vòng, chừng 36 giây —
           nên nó không kéo mắt khỏi dòng chữ đang đọc; nhưng nhìn lại sau một
           lúc thì thấy rõ trăng đã ở chỗ khác.

           Xuất phát ở 0,600 W, ngay cạnh chỗ mặt trời đứng (0,655): lúc giao
           cảnh hai đĩa vẫn gần nhau, đủ để đọc ra là một vật đang đổi. Rồi đi
           về bên PHẢI và lên — rời xa chỗ mặt trời vừa lặn.
           ══════════════════════════════════════════════════════════════════ */
        var TRANG_NGANG = 0.115;
        var TRANG_LEN = TRANG_NGANG * Math.tan(15 * Math.PI / 180);
        var mx = W * (0.600 + TRANG_NGANG * tienTrang);
        /* ── ĐIỂM BẮT ĐẦU THẤP HƠN, VÀ DÂNG ÍT HƠN ──
           Từng là 0,215 → 0,095. Hai chỗ sai với một con số ấy:

           Một, 0,095 H là KỊCH KHUNG. Ở khổ điện thoại đĩa bán kính 19,5px
           đặt tâm ở 0,095 × 812 = 77px, tức mép trên đĩa ở 58px — lọt vào
           đúng vùng thanh đầu trang. Trăng đi tới đó là đi hết trời, và cái
           mắt đọc ra không phải "trăng đã lên cao" mà "trăng sắp ra khỏi
           tranh".

           Hai, càng lên cao thì trăng càng RỜI mặt nước. Vệt sáng dưới nước
           vẽ ở 0,768 → 0,995 H, cố định; trăng ở 0,095 thì khoảng cách giữa
           đĩa và bóng của nó bằng hai phần ba khung, và mắt thôi nối hai thứ
           ấy làm một. Cái mất đi chính là hiệu ứng trăng-dưới-nước.

           ── LẦN NÀY CON SỐ ĐO RA, KHÔNG ƯỚM ──
           Đường sống của mỗi dãy xa là tổng ba sóng sin, không có bao, nên
           đỉnh của nó tính được thẳng: `y = y0 − h·cao` với `h` là tổng ba
           sin. Chạy cả ba dãy xa qua mọi bề ngang 340 → 1900px và lấy giá trị
           nhỏ nhất trong dải x mà trăng đi qua (0,63 → 0,70 W):

               đỉnh cao nhất = 0,1815 H   (ở bề ngang 580px)

           Và đó cũng đúng bằng đỉnh cao nhất của CẢ khung — ba sóng không bao
           giờ cùng đạt cực đại, nên biên độ tổng 0,93 chỉ ra tới đấy. Con số
           ấy không đổi theo bề ngang: sóng bị kéo giãn, không bị nâng lên.

           Nên mép DƯỚI của đĩa phải ở trên 0,1815 H. Bán kính 0,026 của cạnh
           tính cỡ, cộng một quãng dư 0,010, ra trần 0,145 H cho tâm đĩa.

           Điều này phơi ra một lỗi cũ: bản trước cho trăng VỪA HIỆN ở 0,215 H
           — tức nằm sau núi ở gần như mọi bề ngang — rồi mới dâng lên chỗ
           thấy được. Nửa đầu đêm không có mặt trăng, và không ai gọi tên được
           chuyện ấy vì cuối đêm thì nó có.

           ── VÀ CHỖ ĐỨNG PHẢI ĐO TỪ NÚI, KHÔNG KHAI BẰNG HẰNG SỐ ──
           `0,150` cố định vẫn còn quá cao, vì nó là con số của TRƯỜNG HỢP XẤU
           NHẤT: đỉnh núi cao nhất trên mọi bề ngang là 0,1815 H, nên một hằng
           số muốn an toàn ở mọi khổ thì phải nằm trên nó. Mà cái đỉnh ấy đi
           lang thang theo bề ngang — ở khổ 1180px thì núi dưới chỗ trăng đứng
           chỉ cao 0,33 H, tức còn dư 0,15 khung trời KHÔNG dùng tới. Trăng vì
           thế treo lơ lửng giữa trời trên gần như mọi máy tính để bàn.

           Nay hỏi thẳng đường bao đã ghi (`dinhDai`) xem núi dưới trăng cao
           bao nhiêu, rồi đặt đĩa ngay trên nó, cách một quãng thở bằng 0,030
           khung. Kết quả: khổ rộng thì trăng xuống rất thấp, sát ngọn núi và
           gần mặt nước; khổ hẹp thì nó tự dừng ở chỗ cao hơn — vì ở đó núi
           cao thật. Không khổ nào bị che, và không khổ nào bỏ trống trời.

           Hai cái chặn hai đầu: không thấp hơn 0,42 khung (dưới nữa là vào
           vùng chữ lớn và vùng mây), không cao hơn 0,105 khung (trên nữa là
           kịch thanh đầu trang).

           Dâng nhẹ 0,030 khung suốt đêm, như cũ. */
        var mr = m * 0.032;
        /* ── QUÃNG THỞ 0,016, VÀ VÌ SAO KHÔNG ĐƯỢC BẰNG 0 ──
           Đĩa ngồi sát ngọn núi chừng 15px ở khổ 955. Hạ thêm nữa là đĩa
           CHẠM vào núi, và chỗ ấy thì không hạ được: ban đêm núi sáng 237
           trên thang 255 còn trời 197 — núi SÁNG HƠN trời. Một đĩa trắng
           chồng lên một mảng núi trắng thì nó tan vào đó, mất hẳn. Trăng vì
           thế phải ở hẳn trong khoảng trời sẫm, tức ở trên đường sống.

           Muốn trăng thấp hơn nữa thì phải hạ dãy núi xa — mà bố cục núi đã
           chốt từ đợt chọn D + E, nên đó là một quyết định riêng. */
        /* Dải hỏi phải bằng ĐÚNG bề ngang đĩa (`mx ± mr`, cộng quãng trôi
           ngang), không rộng hơn. Đã thử hỏi 0,53 → 0,64: dải ấy chồm sang
           chỗ núi cao hơn ở bên trái, nên đĩa bị đẩy lên 0,18 H trong khi núi
           NGAY DƯỚI nó chỉ cao 0,28 H — mất đứt 90px trời không dùng tới.
           Hỏi đúng chỗ đĩa đứng thì nó xuống tới 0,215 H. */
        /* Dải hỏi phải phủ CẢ đường đi của đĩa, không chỉ chỗ nó đứng lúc
           đầu: từ `0,600 − mr/W` tới `0,715 + mr/W`, làm tròn ra 0,574 → 0,741.
           Đo lại đường bao núi trên dải ấy qua mọi bề ngang 340–1900px: trần
           gần như không đổi so với dải cũ, và ở khổ 1180 còn rộng hơn (0,300
           so với 0,278) — đường chéo dài ra mà không phải trả bằng độ cao. */
        var dinhTr = dinhDai(0.574, 0.741);
        var myThap = Math.max(HK * 0.105,
                     Math.min(HK * 0.420, dinhTr - mr - HK * 0.016));
        var my = myThap - W * TRANG_LEN * tienTrang + HK * 0.008 * Math.sin(p * Math.PI * 2);
        var mTroi = mau(206 + 14 * cung, 98 + 74 * cung, 54 + 68 * cung);
        /* Tắt hẳn trong quãng 0,46–0,58 để nhường chỗ cho trăng — không dùng
           `dem` nữa, vì `dem` lên muộn hơn và hai thiên thể sẽ chồng nhau. */
        var hienS = 1 - muot(p, 0.34, 0.46);

        /* ── 1 · NỀN TRỜI ──
           Trên giấy trắng, "trời sáng" là giấy để trắng; mọi sắc khác là một
           lớp rửa mỏng phủ lên. Lớp đêm phủ tới TẬN ĐÁY, không dừng ở chân
           trời: mặt nước phản chiếu bầu trời, nên nước ban đêm phải sẫm theo —
           và chính nhờ vậy vệt trăng dưới nước mới có thứ để mà lấy đi. */
        if (dem > 0.002) {
          /* ── DẢI CHUYỂN PHẢI ĐƠN ĐIỆU, KHÔNG ĐƯỢC LÕM ──
             Bản trước đi 0,150 → 0,098 → 0,034 ở chân trời → 0,082 ở đáy. Ba
             chặng đầu nhạt dần rồi chặng cuối đậm lại, tức là dải chuyển có
             một chỗ LÕM đúng tại chân trời. Mắt đọc một chỗ lõm trong dải
             chuyển ra thành một VỆT SÁNG nằm ngang — và trên một nền trời
             đêm thì vệt ấy là một "cục màu" rõ mồn một, dù mọi trị số nhìn
             riêng đều hợp lý.

             Nay nhạt dần một chiều từ đỉnh xuống chân trời rồi GIỮ NGUYÊN
             xuống đáy. Nước sẫm bằng chân trời chứ không sẫm hơn: nó phản
             chiếu đúng cái mảng trời thấp nhất, không phản chiếu cả bầu trời.

             Và đậm hơn hẳn bản trước (0,150 → 0,255 ở đỉnh). Xem chú thích ở
             bước 6b về chuyện tương phản núi với trời. */
          var gd = ctx.createLinearGradient(0, 0, 0, HK);
          gd.addColorStop(0,    'rgba(' + mau(36, 42, 58) + ',' + (0.255 * dem).toFixed(3) + ')');
          gd.addColorStop(0.30, 'rgba(' + mau(38, 44, 60) + ',' + (0.210 * dem).toFixed(3) + ')');
          gd.addColorStop(0.55, 'rgba(' + mau(42, 48, 64) + ',' + (0.155 * dem).toFixed(3) + ')');
          gd.addColorStop(CHAN_TROI, 'rgba(' + mau(46, 52, 68) + ',' + (0.115 * dem).toFixed(3) + ')');
          gd.addColorStop(1,    'rgba(' + mau(46, 52, 68) + ',' + (0.112 * dem).toFixed(3) + ')');
          ctx.fillStyle = gd;
          ctx.fillRect(0, 0, W, H);
        }
        /* Lớp trời ấm phải có HƯỚNG: một dải rất mỏng sát chân trời, cộng một
           đám loang quanh chính mặt trời. Phủ đều suốt bề ngang thì góc trời
           bên kia ửng hồng đúng bằng góc có mặt trời, nên cả bức bị nhuộm một
           lớp hồng phẳng và không ai đọc ra ánh sáng đang tới từ phía nào. */
        if (am > 0.002) {
          var mAm = hoangHon >= binhMinh ? mau(208, 104, 62) : mau(214, 130, 100);
          var ga = ctx.createLinearGradient(0, HK * 0.22, 0, chanTroi);
          ga.addColorStop(0, 'rgba(' + mAm + ',0)');
          ga.addColorStop(0.55, 'rgba(' + mAm + ',' + (0.018 * am).toFixed(3) + ')');
          ga.addColorStop(1, 'rgba(' + mAm + ',' + (0.052 * am).toFixed(3) + ')');
          ctx.fillStyle = ga;
          ctx.fillRect(0, HK * 0.22, W, chanTroi - HK * 0.22);
          /* Nhân thêm `(1 - dem)`: hoàng hôn và đêm CHỒNG LẤN nhau một quãng
             (hoangHon chạy tới 0,68 mà dem đã bắt đầu từ 0,56), nên có một
             khoảng cả bệt ấm và lớp rửa đêm cùng có mặt. Một bệt cam nằm trên
             một nền trời đang sẫm lại thì đọc ra hai cục màu chồng nhau, chứ
             không ra một buổi chiều muộn. */
          loang(ctx, sx, Math.min(sy, chanTroi), W * 0.40, HK * 0.26, mAm,
                0.070 * am * hienS * (1 - dem), false);
        }

        /* ══════════════════════════════════════════════════════════════════
           2 · MẶT TRĂNG — VẼ BẰNG MỘT PHÉP XOÁ, VÀ ĐI TRỌN MỘT KỲ

           Suốt đêm trăng đi hết một kỳ: tròn khi vừa lên, rồi khuyết dần, bán
           khuyết, và tàn đêm thì còn một lưỡi liềm. Một đêm thật thì không như
           thế — kỳ trăng dài hai mươi chín ngày. Nhưng cả bức này vốn nén một
           ngày vào bảy mươi giây, nên kỳ trăng nén theo là cùng một phép nói;
           và nó cho mắt một thứ để đo thời gian trôi, thay vì một đĩa trắng
           đứng yên suốt hơn nửa vòng.

           Dừng ở 0,72 chứ không đi hết 1,0: qua đó thì phần sáng mỏng tới mức
           trên khung 955px nó còn chưa tới hai pixel — đọc ra là một vệt xước,
           không ra là mặt trăng. Lưỡi liềm ở 0,72 vẫn dày chừng một phần ba
           bán kính, vẫn ra dáng.

           `tienTrang` là cùng một đồng hồ với đường đi chéo 15° — trăng lên
           cao tới đâu thì khuyết tới đó, hai chuyển động nói cùng một chuyện
           là "đêm đang trôi". */
        var sangTrang = dem * muot(p, 0.42, 0.52);
        var kyTrang = 0.72 * tienTrang;
        veDia(ctx, mx, my, mr, '0,0,0', 0.30 * sangTrang, 0.95 * sangTrang,
              true, kyTrang);

        /* ── CHIỀU SÂU: MỘT VỆT MỰC RẤT MỎNG DỌC ĐƯỜNG PHÂN GIỚI ──
           Đĩa vẽ bằng phép xoá nên nó ra một mảng giấy trắng PHẲNG — đúng, mà
           phẳng quá: mặt trăng thật có rìa tối dần (limb darkening) và một
           vùng chuyển ở sát đường phân giới.

           Đổ lại một lớp mực rất nhạt, hình bầu dục, nằm lệch về phía tối. Nó
           không vẽ ra hình gì nhận biết được — chỉ đủ để rìa thôi sắc lẻm và
           đĩa có một chiều. Alpha 0,055 ở tâm: cao hơn là thấy ra một cái bóng
           dán lên, thấp hơn là không khác gì. */
        if (sangTrang > 0.02) {
          var lech = mr * 0.42 * Math.cos(kyTrang * Math.PI);
          loang(ctx, mx + lech, my + mr * 0.10, mr * 0.92, mr * 0.88,
                mau(58, 64, 82), 0.055 * sangTrang, false);
        }

        /* ── 3 · SAO ── */
        /* ── SAO LÀ CHỖ LẤY MỰC ĐI, KHÔNG PHẢI CHỖ ĐỔ MỰC VÀO ──
           Bản trước vẽ sao bằng mực ĐẬM (`MUC` = 17,19,21). Trên một nền trời
           đêm thì một chấm đậm hơn nền không đọc ra là sao — nó đọc ra là bụi
           trên mặt giấy. Sao sáng hơn trời, nên nó phải là chỗ lớp rửa đêm bị
           LẤY ĐI, đúng cùng một phép với mặt trăng. Vẽ trước núi, nên sao nào
           nằm sau núi thì bị núi che — đúng như phải thế. */
        if (dem > 0.02) {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          /* ── MẢNG SÁNG CỦA CẢ CỤM ──
             Mấy chấm sao nói CHI TIẾT; thứ làm "vùng chớp sáng" đọc được từ
             xa là một bệt rất mờ phủ cả cụm, thở cùng nhịp với nó. Cũng vẽ
             bằng phép LẤY MỰC ĐI như sao, nên nó là chỗ lớp rửa đêm mỏng
             bớt — một mảng trời trong hơn, không phải một đám sương tô thêm.

             ── CON SỐ PHẢI ĐO, KHÔNG ƯỚM ──
             Bản đầu để 0,030. Tính ra thì nó vô hình: trời đêm hợp lên giấy
             ra chừng 197 trên thang 255, tức cách trắng 58 nấc, nên lấy đi 3%
             lớp rửa chỉ sáng thêm 1,7 nấc ở TÂM bệt — và bình quân trên một
             mảng trời thì còn 0,3 nấc. Đo thật cũng đúng thế: cả một vòng
             nhịp chỉ đưa mảng trời qua 0,11 nấc.

             0,115 thì tâm bệt sáng thêm chừng bảy nấc — đọc ra được là một
             mảng trời trong hơn, mà vẫn chưa thành một quầng có đường biên
             (đuôi gradient của `loang` chia nhiều chặng chính là để không có
             biên). Bệt cũng nhỏ lại một bậc: một mảng bằng nửa bề ngang khung
             thì đọc ra là cả trời đang sáng lên, không ra là một mảng. */
          for (var ig = 0; ig < cumSao.length; ig++) {
            var g0 = cumSao[ig];
            var n0 = 0.5 + 0.5 * Math.sin(t * g0.nhip + g0.pha);
            loang(ctx, g0.x, g0.y, W * 0.17, HK * 0.060, '0,0,0',
                  0.115 * dem * g0.manh * n0, true);
          }
          for (var s = 0; s < sao.length; s++) {
            var k = sao[s];
            /* Biên độ theo cụm: cụm thở mạnh thì sao trong nó tắt gần hẳn rồi
               sáng hẳn (0,25 → 1,00), cụm thở nhẹ thì chỉ hơi đưa. Bản trước
               cố định 0,55 ± 0,45 cho mọi sao, nên mọi chỗ nhấp nháy bằng
               nhau và cả trời ra một mặt phẳng đang rung. */
            var bien = 0.30 + 0.45 * (k.manh || 0.7);
            var nhay = (1 - bien) + bien * (0.5 + 0.5 * Math.sin(t * k.nhip + k.pha));
            var a = k.mo * dem * nhay;
            ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2); ctx.fill();
            if (k.tia) {
              ctx.strokeStyle = 'rgba(0,0,0,' + (a * 0.55).toFixed(3) + ')';
              ctx.lineWidth = 0.7;
              var d2 = k.r * (2.4 + nhay * 1.6);
              ctx.beginPath();
              ctx.moveTo(k.x - d2, k.y); ctx.lineTo(k.x + d2, k.y);
              ctx.moveTo(k.x, k.y - d2); ctx.lineTo(k.x, k.y + d2);
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        /* ── 4 · MẶT TRỜI, VẼ TRƯỚC CẢ NÚI ── */
        veDia(ctx, sx, sy, sr, mTroi,
              (0.20 - 0.05 * cung) * hienS, (0.86 - 0.42 * cung) * hienS, false);

        /* ── 5 · NÚI XA · 6 · NẾP GẦN + MẶT NƯỚC ── */
        if (xa) ctx.drawImage(xa, 0, 0, W, H0);
        if (gan) ctx.drawImage(gan, 0, 0, W, H0);
        /* ── 6b · DƯỚI KHUNG VẼ, NƯỚC KÉO DÀI TIẾP ──
           Chỉ chạy ở những trang mà khối chứa cao hơn một màn hình. Sắc lấy
           đúng bằng chặng cuối của dải nước (`veNuoc`: giấy alpha .93), nên
           chỗ nối không có mép. Lớp rửa trời phủ 0 → H nên nó cũng phủ dải
           này — nước dưới khung vì thế tối đi đúng bằng nước trong khung. */
        if (H > H0 + 0.5) {
          var rgbN = giayRGB();
          /* ── CHỖ NỐI PHẢI TAN, KHÔNG ĐƯỢC CẮT ──
             Nếp bờ gần nhất vẽ ở 0,965 khung — nó là TIỀN CẢNH, đáy bức, chỗ
             mắt đứng. Đo ra dải ấy sẫm chừng 218 trên thang 255 trong khi mặt
             nước quanh nó 247. Ở một khung bằng đúng màn hình thì nó nằm sát
             mép dưới và đọc ra đúng vai; ở một khối cao gấp đôi thì nó thành
             một vạch tối nằm ngang GIỮA trang, và dưới nó lại là nước — tức
             một cái bờ mọc giữa hồ.

             Nếp bờ gần nhất nay không vẽ ra ở trường hợp này (lý do ở chỗ
             khai nó trong `veTamNen`), nên chỗ nối chỉ còn phải khớp nước với
             nước — một quãng tan ngắn là đủ, và ngắn thì không lấy mất mấy
             nét ngang của mặt nước. */
          var yj = H0 * 0.965;
          var gj = ctx.createLinearGradient(0, yj, 0, H0);
          gj.addColorStop(0, 'rgba(' + rgbN + ',0)');
          gj.addColorStop(1, 'rgba(' + rgbN + ',0.93)');
          ctx.fillStyle = gj;
          ctx.fillRect(0, yj, W, H0 - yj);
          ctx.fillStyle = 'rgba(' + rgbN + ',0.93)';
          ctx.fillRect(0, H0 - 0.5, W, H - H0 + 1);
        }

        /* ── 7 · MÂY LÀ MỘT CÁI TẨY, KHÔNG PHẢI MỘT NÉT VẼ ──
           Từng vẽ mây bằng màu TRẮNG chồng lên. Nó không bao giờ hiện ra được,
           và lý do hiển nhiên khi nói thành lời: canvas này trong suốt và nằm
           trên một trang GIẤY TRẮNG, nên tô trắng lên nó là tô trắng lên trắng.

           `destination-out` mới đúng việc: nó xoá phần alpha đã có ở chỗ hình
           được vẽ. Mực núi bị tẩy đi, giấy trắng phía sau hiện ra — tức là
           sương che khuất núi, đúng cách mây được vẽ trong tranh thuỷ mặc (chỗ
           trắng là chỗ CHỪA LẠI, không phải chỗ tô thêm). Và vì nó tẩy theo
           gradient tròn, mép sương tan dần chứ không có đường viền.

           ── VÌ SAO MÂY TRÔI, KHÔNG PHẢI SƯƠNG THỞ TẠI CHỖ ──
           Từng thay chỗ này bằng ba dải sương nằm ngang, dày mỏng theo một
           nhịp sin tại chỗ. Về số thì cũng là "lúc mờ lúc tỏ", nhưng mắt đọc
           ra hai thứ rất khác nhau: một dải đổi độ đậm mà không đi đâu thì đọc
           ra là màn hình đang nhấp nháy; một đám ĐI QUA thì đọc ra là có gió.
           Cùng một lượng mực bị lấy đi, mà một cái làm bức tranh sống và một
           cái làm nó chập chờn. */
        /* ── VỀ ĐÊM MÂY PHẢI TẨY NHẸ TAY HƠN, KHÔNG PHẢI MẠNH HƠN ──
           Bản trước để `0,60 + 0,30·dem`: càng đêm tẩy càng mạnh, với lý do
           "đêm nhiều mực hơn thì cú tẩy càng đọc được". Đúng về lượng, sai về
           mắt — ban ngày cái bị tẩy là mực núi nhạt nên chỗ tẩy chỉ mờ đi một
           chút; ban đêm cái bị tẩy là cả lớp rửa trời, nên chỗ tẩy nhảy hẳn về
           màu giấy và đọc ra một CỤC SÁNG. Nay `0,60 - 0,22·dem`. */
        var dayMay = 0.60 - 0.22 * dem;
        ctx.globalCompositeOperation = 'destination-out';
        for (var i = 0; i < may.length; i++) {
          var mm = may[i];
          var song = Math.sin(t * mm.nhip + mm.pha);
          /* Tốc độ ngang cũng thở theo CÙNG sóng ấy, biên độ một phần tư: dải
             mây thật lúc nhanh lúc chậm theo túi gió. Hai sóng rời thì dải bò
             thành hình số tám. */
          mm.x += mm.v * (1 + song * 0.25);
          var ly = song * mm.bien;
          if (mm.x - mm.r * 2.4 > W) { may[i] = moiMay(false); continue; }
          for (var k2 = 0; k2 < mm.cum.length; k2++) {
            var q = mm.cum[k2];
            var cx = mm.x + q.dx, cy = mm.y + q.dy + ly;
            var gm = ctx.createRadialGradient(cx, cy, 0, cx, cy, q.rr);
            /* Màu ở đây không quan trọng, chỉ alpha quan trọng. Để đen cho rõ
               ý: đây là một cái tẩy, không phải một nét vẽ. */
            gm.addColorStop(0, 'rgba(0,0,0,' + (mm.mo * dayMay).toFixed(3) + ')');
            gm.addColorStop(0.55, 'rgba(0,0,0,' + (mm.mo * dayMay * 0.6).toFixed(3) + ')');
            gm.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gm;
            ctx.beginPath(); ctx.arc(cx, cy, q.rr, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.globalCompositeOperation = 'source-over';

        /* ── 7b · TRỜI PHỦ LẦN HAI, LÊN TRÊN CẢ NÚI VÀ CẢ MÂY ──
           Núi có lớp giấy đặc nên lớp rửa đêm ở bước 1 nằm HẲN SAU núi và
           không tới được nó; để vậy thì nửa đêm trời sẫm mà núi vẫn trắng như
           giữa trưa. Mỏng hơn lượt đầu chứ không bằng: núi vốn sáng hơn trời
           đêm thật, và giữ chúng sáng hơn một bậc là cách duy nhất để đêm
           không bôi cả bức thành một mảng xám phẳng. Và lượt này là một dải
           PHẲNG suốt bề ngang — một bệt loang nằm trên sườn núi thì đọc ra
           đúng là mặt trời đang thấu qua đá, mà đó là thứ vừa bỏ.

           ── ĐÂY LÀ CHỖ QUYẾT ĐỊNH TƯƠNG PHẢN NÚI VỚI TRỜI ──
           Trời đêm phủ 0,255, còn núi chỉ phủ thêm đúng lượt này. Bản trước để
           0,066: đo ra trời 223 và núi 227 trên thang 255 — chênh nhau BỐN
           nấc, tức là không chênh. Đó là cả lý do "không ra tương phản núi với
           trời", và nó không nằm ở mực của núi, nó nằm ở đúng con số này.

           Nay 0,030. Núi ban đêm phải SÁNG hơn trời rõ rệt, và đó cũng là
           chuyện thật: tuyết, đá trần, hơi nước bốc lên đều bắt sáng, còn bầu
           trời thì không có gì để bắt.

           ── VÀ NÓ PHẢI VẼ SAU MÂY ──
           Mây là một cái tẩy. Đặt nó sau lượt này thì mỗi đám mây chọc một lỗ
           xuyên qua cả hai lớp trời, xuống tận mặt giấy — mấy cục sáng trên
           nền trời đêm chính là mấy cái lỗ ấy. Đặt lượt này SAU mây thì lỗ nào
           cũng được phủ lại một lớp mỏng: chỗ mây đi qua vẫn sáng lên, nhưng
           sáng thành một vệt sương, không thành một lỗ. */
        if (dem > 0.002) {
          var g2 = ctx.createLinearGradient(0, 0, 0, HK);
          g2.addColorStop(0, 'rgba(' + mau(40, 46, 64) + ',' + (0.030 * dem).toFixed(3) + ')');
          g2.addColorStop(CHAN_TROI, 'rgba(' + mau(52, 58, 72) + ',' + (0.022 * dem).toFixed(3) + ')');
          g2.addColorStop(1, 'rgba(' + mau(44, 50, 66) + ',' + (0.028 * dem).toFixed(3) + ')');
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, W, H);
        }

        /* ── 7c · MẶT NƯỚC BAN ĐÊM PHẢI CÓ MỰC ĐỂ MÀ LẤY ĐI ──
           Vệt trăng dưới nước vẽ bằng phép `destination-out`, tức LẤY MỰC ĐI
           — đúng phép, cùng phép với mặt trăng và với mây. Nhưng đo ra thì
           ban đêm mặt nước sáng 249 trên thang 255 còn trời ở chân trời 241:
           mặt nước TRẮNG HƠN trời. Lấy mực đi ở một chỗ không có mực thì
           không có gì xảy ra — và đó đúng là lý do "ko thấy ánh trăng trong
           nước luôn".

           Vì sao nó trắng: lớp rửa đêm ở bước 1 phủ từ 0 tới H, kể cả dải
           nước. Nhưng ngay sau đó tấm núi+nước được vẽ chồng lên, mà `veNuoc`
           tô GIẤY đặc (alpha .93) — nên nó xoá sạch lớp rửa đêm ở đúng dải
           nước. Bước 7b chỉ trả lại 0,028, gần như không có.

           Nên phải rửa lại mặt nước SAU tấm núi. Và đó cũng là chuyện đúng:
           mặt hồ phản chiếu mảng trời thấp nhất, nên nó phải sẫm xấp xỉ chân
           trời, không được trắng hơn. Đo lại sau khi rửa: nước 238, chân trời
           241 — nước hơi sẫm hơn một nấc, đúng dáng.

           Nhạt ở mép nước, đậm dần xuống đáy: chỗ gần bờ phản chiếu trời ngay
           trên nó (còn ít lớp khí), chỗ xa phản chiếu cả bầu trời. Và nhờ có
           mực rồi, vệt trăng lấy đi được tới tận giấy trắng — chênh lệch đo ra
           mười mấy nấc, tức nhìn ra được là một cột sáng. */
        if (dem > 0.002) {
          var yNuoc = HK * MEP_NUOC;
          var gN = ctx.createLinearGradient(0, yNuoc, 0, H);
          gN.addColorStop(0,    'rgba(' + mau(46, 52, 68) + ',' + (0.010 * dem).toFixed(3) + ')');
          gN.addColorStop(0.30, 'rgba(' + mau(44, 50, 66) + ',' + (0.040 * dem).toFixed(3) + ')');
          gN.addColorStop(1,    'rgba(' + mau(42, 48, 64) + ',' + (0.052 * dem).toFixed(3) + ')');
          ctx.fillStyle = gN;
          ctx.fillRect(0, yNuoc, W, H - yNuoc);
        }

        /* ── 8 · VỆT SÁNG TRÊN NƯỚC ── */
        var choiTroi = hienS * (1 - muot(sy + sr, HK * 0.60, HK * 0.70));
        /* ── BÓNG MẶT TRỜI: 0,13 → 0,072 ──
           Vệt trăng tô GIẤY nên nó chỉ kéo mặt nước về phía sáng; vệt mặt
           trời thì tô MÀU ẤM chồng lên, mà mười ba lớp gradient cam chồng
           nhau trên một dải nước gần trắng thì ra mấy cái đốm đặc — đúng chỗ
           người dùng nói "bị dư". Hạ gần một nửa, và thu cột hẹp lại một bậc:
           nó trở lại là nắng loang trên nước, không phải mấy vũng dầu. */
        veVet(ctx, sx, sr * 1.25, mTroi, 0.072 * choiTroi, t, false);
        /* ── VỆT TRĂNG TÔ GIẤY, KHÔNG LẤY MỰC ĐI ──
           `destination-out` chỉ lấy đi được đúng lượng mực đang có ở đó. Sau
           lượt rửa nước ở bước 7c thì mặt nước có chừng 9–12 nấc mực, nên dù
           xoá sạch cũng chỉ sáng thêm bấy nhiêu — và `veVet` còn nhạt dần
           xuống đáy, nên nửa dưới cột đo ra chênh lệch BẰNG 0. Cột sáng vì
           thế chỉ hiện ra một mẩu ngắn sát bờ xa.

           Tô GIẤY thì không phụ thuộc vào lượng mực có sẵn: nó kéo chỗ ấy về
           phía màu giấy, muốn sáng bao nhiêu cũng được. Đây đúng là cách chỗ
           sáng được vẽ trong tranh thuỷ mặc — chừa giấy ra, mà ở một lớp
           canvas trong suốt thì "chừa" phải làm bằng cách tô lại màu giấy.

           Mặt trời ở trên đã tô màu (`mTroi`, ấm) từ trước theo đúng lối này;
           chỉ mặt trăng là còn dùng phép xoá, và đó là chỗ sai. */
        var choiTrang = sangTrang * (1 - muot(my + mr, HK * 0.58, HK * 0.70));
        veVet(ctx, mx, mr * 1.7, giayRGB(), 0.92 * choiTrang, t, false);

        /* ── 9 · VỆT SƯƠNG MỎNG, VẼ THẬT ──
           Phần trên chỉ XOÁ, nên ở khoảng giấy trống — chỗ không có mực núi —
           nó không để lại gì. Mà khoảng trống ấy chiếm nửa trên màn, và một
           nửa màn đứng im thì cả hiệu ứng đọc ra là một tấm hình tĩnh có góc
           dưới hơi động đậy. Nên thêm vài vệt sương XÁM rất mỏng, vẽ bình
           thường, đi chậm hơn mây, alpha dưới 0,05 — đủ để thấy có gì trôi khi
           nhìn vào khoảng trống, không đủ để đọc ra là một vật. */
        for (var j = 0; j < vet.length; j++) {
          var v = vet[j];
          v.x += v.v;
          if (v.x - v.r * 2 > W) { vet[j] = moiVet(false); continue; }
          /* Đuôi chia nhiều chặng. Một gradient hai chặng thì độ đậm giảm
             ĐỀU theo bán kính, nên tới mép nó vẫn còn một nấc rồi tắt đột —
             trên giấy trắng trơn mắt bắt ra ngay cái mép ấy, và bệt sương đọc
             ra thành một cái đĩa bầu dục lơ lửng. Đó đúng là cái "đĩa bay" ở
             góc trên bản V2.6.9. */
          /* Nhạt hẳn về đêm. Ban ngày chúng là thứ duy nhất động ở khoảng
             giấy trống phía trên; ban đêm khoảng ấy đã có lớp rửa trời và có
             sao, nên thêm mấy bệt xám nữa chỉ làm nền trời lấm tấm. */
          var moV = v.mo * (1 - dem * 0.78);
          var gv = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r);
          gv.addColorStop(0,    'rgba(42,52,64,' + moV.toFixed(4) + ')');
          gv.addColorStop(0.34, 'rgba(42,52,64,' + (moV * 0.66).toFixed(4) + ')');
          gv.addColorStop(0.60, 'rgba(42,52,64,' + (moV * 0.28).toFixed(4) + ')');
          gv.addColorStop(0.82, 'rgba(42,52,64,' + (moV * 0.065).toFixed(4) + ')');
          gv.addColorStop(1,    'rgba(42,52,64,0)');
          ctx.fillStyle = gv;
          ctx.beginPath();
          ctx.ellipse(v.x, v.y, v.r, v.r * 0.26, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        /* ── 10 · CHIM: bay ban ngày, thưa dần khi chiều xuống ── */
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
    /* ── ĐO CHÍNH CANVAS, KHÔNG ĐO KHỐI BỌC ──
       Bản trước đo `hop` (khối mang `data-nen`) rồi đặt bộ đệm theo số ấy.
       Đúng khi hai cái bằng nhau, mà không phải lúc nào cũng bằng: canvas là
       `position:absolute;inset:0`, nên cỡ CSS của nó do TỔ ĐỊNH VỊ gần nhất
       quyết định — và tổ ấy có thể không phải `hop`. Ở trang giới thiệu, khối
       bọc để `static` nên tổ định vị gần nhất là `body`: canvas rộng 1013×1275
       trong khi bộ đệm dựng theo 949×883. Bộ đệm bị kéo giãn dọc 1,44 lần, và
       thứ lộ ra ngay là mặt trời với mặt trăng — chúng vẽ bằng `arc`, tức hình
       tròn, nên thành bầu dục.

       Đã thử chữa bằng cách cho `.nen-boc{position:relative}`. Nó sửa được cái
       méo, và làm hỏng một chuyện khác: canvas thôi phủ cả trang mà co về đúng
       khối bọc, nên trang giới thiệu hiện ra một khối xám có mép vuông ngay
       giữa trang.

       Chữa đúng chỗ là ở ĐÂY: đo chính canvas. Bộ đệm khi ấy luôn bằng cỡ vẽ
       ra của nó, bất kể CSS cho nó phủ tới đâu — hình tròn là hình tròn, mà độ
       phủ thì để CSS quyết. Một phép đo, không một luật CSS nào phải đổi. */
    var r = cv.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) r = hop.getBoundingClientRect();
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

  /* ── CỠ KHỐI ĐỔI MÀ KHÔNG PHẢI DO ĐỔI CỠ CỬA SỔ ──
     `resize` chỉ bắn khi CỬA SỔ đổi cỡ. Nhưng khối chứa nền còn đổi cỡ vì
     những lẽ khác: phông vào muộn rồi chữ xếp lại, ảnh tải xong rồi ô ảnh nở
     ra, một thẻ mở/đóng. Lúc ấy canvas bị CSS căng theo khối mới trong khi bộ
     đệm vẫn là cỡ cũ — và thứ lộ ra ngay là mặt trời với mặt trăng, vì chúng
     vẽ bằng `arc` nên hình tròn bị kéo thành bầu dục.

     Đo trên trang giới thiệu: khối cao 908 mà bộ đệm dựng lúc nó còn 883 —
     giãn dọc 2,8%, đủ để thấy méo.

     Chỉ dựng lại khi cỡ LÀM TRÒN thật sự đổi: `coLai` nướng lại cả năm dãy
     núi, gọi nó ở mỗi phần nghìn pixel thì vừa tốn vừa có thể tự kích lại
     chính mình qua vòng lặp bố cục. */
  var cuW = 0, cuH = 0;
  function doCo() {
    var r = cv.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) r = hop.getBoundingClientRect();
    var w = Math.round(r.width), h = Math.round(r.height);
    if (w === cuW && h === cuH) return;
    cuW = w; cuH = h;
    coLai();
    /* Vẽ ngay một khung: không có dòng này thì lúc đổi cỡ canvas trắng một
       nhịp rồi mới có hình — thấy rõ nếu người đọc đang cuộn. */
    if (may) may.ve(t);
  }
  if ('ResizeObserver' in window) new ResizeObserver(doCo).observe(cv);

  /* ── VÀ MỘT LỚP KHÔNG PHỤ THUỘC NHỊP VẼ ──
     ResizeObserver gắn vào các bước dựng hình của trình duyệt, nên ở một tab
     chạy nền hay một khung xem đang ẩn thì quan sát KHÔNG được giao — y như
     `requestAnimationFrame`. Trang không được vẽ thì nền sai cỡ cũng chẳng ai
     thấy, nhưng nó sai ngay lúc trang hiện trở lại, tức là sai đúng lúc có
     người nhìn.

     `setTimeout` thì chạy bất kể trang có được vẽ hay không. Hai mốc: 400ms
     cho phông và CSS vào xong, 1600ms cho ảnh tải xong và ô ảnh nở ra. Hai
     lần đo, và lần nào cỡ không đổi thì `doCo` tự bỏ qua. */
  setTimeout(doCo, 400);
  setTimeout(doCo, 1600);
  addEventListener('load', doCo);

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
