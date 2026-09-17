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
        mo: (0.16 + lop * 0.42)
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
        mo: 0.3 + lop * 0.5
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
            mo: 0.035 + Math.random() * 0.05,
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
  /* ══════════ SƠN THUỶ — THEME 霜降 ══════════

     Vẽ lại theo một bức thuỷ mặc: núi đá dựng đứng, một dòng THÁC đổ xuống
     mặt nước, sương mờ nằm giữa các lớp núi ở xa, và mấy đốt trúc ở tiền
     cảnh.

     ── VÌ SAO ĐỔI PHẦN CHUYỂN ĐỘNG TỪ SƯƠNG SANG THÁC ──
     Bản trước lấy sương trôi ngang làm phần động. Nó gần như không thấy
     được, và lý do không phải ở chỗ vẽ sai: một MẢNG mờ trôi ngang trên nền
     giấy trắng thì mắt phải so sánh hai vùng gần như cùng màu ở hai thời
     điểm — thứ mắt người rất kém.

     Một dòng nước rơi thì khác hẳn. Nó là những NÉT DỌC mảnh chạy trong một
     dải hẹp, và mắt bắt chuyển động dọc ở độ tương phản thấp hơn hẳn — đó là
     cùng cơ chế giúp ta thấy mưa qua cửa kính lúc trời xám. Nên thác đọc được
     ở alpha thấp hơn sương nhiều lần, mà vẫn không cướp mắt khỏi chữ.

     ── SƯƠNG NAY VẼ TĨNH ──
     Sương ở xa thì vẽ MỘT LẦN vào tấm nền: nó là thứ làm cho các lớp núi tách
     khỏi nhau và làm cho lớp xa ra vẻ xa. Đứng yên cũng không ai thấy thiếu —
     sương thật cũng gần như không nhúc nhích trong mươi giây người ta nhìn
     vào một cái nền.

     ── MỘT SẮC LỤC DUY NHẤT ──
     Trúc là chỗ duy nhất có màu trên cả bức, và nó rất trầm (`#7E9384`). Đó
     đúng cách một bức thuỷ mặc dùng màu: mực là chính, màu chỉ để điểm. Thêm
     màu nữa là theme thôi là giấy.
  ══════════════════════════════════════════════════════════════════════ */
  function dungThuyMac() {
    var nen = null, W0 = 0, H0 = 0;
    var giot = [], gon = [];
    /* Khung của dòng thác, tính theo tỉ lệ khung nhìn — đặt vào một chỗ và
       mọi thứ khác (miệng thác, vũng nước, gợn sóng) đọc từ đây. */
    var tX = 0, tRong = 0, tDinh = 0, tChan = 0;

    var MUC  = '17,19,21';
    var TRUC = '126,147,132';        /* lục trúc, đã hạ tươi hết mức */

    /* ── MỘT NẾP NÚI ──
       Đường sống dựng bằng tổng ba sóng sin lệch pha, cộng tuỳ chọn một hai
       ngọn nhô lên (đường chuông). Tô NGƯỢC nhau cho hai loại: núi xa đậm ở
       đường sống rồi nhoè xuống chân (đó là thứ làm nó ra một ngọn núi nhìn
       qua sương); núi gần nhạt ở đỉnh, đậm xuống chân. */
    function veNui(c, y0, cao, mo, hat, dinh, xa) {
      c.beginPath();
      c.moveTo(0, H0);
      for (var x = 0; x <= W0; x += 3) {
        var u = x / W0;
        var h = Math.sin(u * 6.1 + hat) * 0.45
              + Math.sin(u * 2.3 + hat * 1.7) * 0.36
              + Math.sin(u * 11.4 + hat * 0.6) * 0.19;
        if (dinh) {
          for (var k = 0; k < dinh.length; k++) {
            var d = (u - dinh[k][0]) / dinh[k][1];
            h += dinh[k][2] * Math.exp(-d * d * 4);
          }
        }
        c.lineTo(x, y0 - h * cao);
      }
      c.lineTo(W0, H0);
      c.closePath();
      var g;
      if (xa) {
        g = c.createLinearGradient(0, y0 - cao * 1.6, 0, y0 + cao * 0.5);
        g.addColorStop(0, 'rgba(' + MUC + ',' + mo.toFixed(3) + ')');
        g.addColorStop(0.62, 'rgba(' + MUC + ',' + (mo * 0.5).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + MUC + ',0)');
      } else {
        g = c.createLinearGradient(0, y0 - cao, 0, y0 + cao * 0.9);
        g.addColorStop(0, 'rgba(' + MUC + ',0)');
        g.addColorStop(0.45, 'rgba(' + MUC + ',' + (mo * 0.72).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + MUC + ',' + mo.toFixed(3) + ')');
      }
      c.fillStyle = g;
      c.fill();
    }

    /* ── DẢI SƯƠNG NẰM NGANG ──
       Vẽ bằng `destination-out`: nó XOÁ mực đã có, để giấy trắng phía sau
       hiện ra. Tô trắng đè lên thì không đổi gì — canvas trong suốt nằm trên
       trang giấy trắng. */
    function veSuong(c, y, cao, manh) {
      c.save();
      c.globalCompositeOperation = 'destination-out';
      var g = c.createLinearGradient(0, y - cao, 0, y + cao);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, 'rgba(0,0,0,' + manh.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, y - cao, W0, cao * 2);
      c.restore();
    }

    /* ── MẤY ĐỐT TRÚC ──
       Thân thẳng, đốt ngắt quãng, vài chiếc lá hình thoi. Không vẽ kỹ: ở
       alpha này nó là một bóng lá ở mép khung, không phải một bức vẽ trúc. */
    function veTruc(c, x0, y0, cao, ng, mo) {
      c.save();
      c.translate(x0, y0);
      c.rotate(ng);
      c.strokeStyle = 'rgba(' + TRUC + ',' + mo.toFixed(3) + ')';
      c.lineCap = 'round';
      c.lineWidth = Math.max(1.4, cao * 0.012);
      var dot = cao / 6;
      for (var i = 0; i < 6; i++) {
        c.beginPath();
        c.moveTo(0, -i * dot);
        c.lineTo(0, -(i + 0.86) * dot);
        c.stroke();
      }
      c.fillStyle = 'rgba(' + TRUC + ',' + (mo * 0.8).toFixed(3) + ')';
      for (var j = 0; j < 7; j++) {
        var ly = -(1.6 + Math.random() * 4.2) * dot;
        var ben = Math.random() < 0.5 ? -1 : 1;
        var dai = dot * (0.7 + Math.random() * 0.8);
        c.beginPath();
        c.moveTo(0, ly);
        c.quadraticCurveTo(ben * dai * 0.6, ly - dai * 0.42,
                           ben * dai, ly - dai * 0.16);
        c.quadraticCurveTo(ben * dai * 0.55, ly + dai * 0.1, 0, ly);
        c.fill();
      }
      c.restore();
    }

    /* Một giọt của dòng thác: nét dọc mảnh, lớp càng gần càng dài và nhanh. */
    function moiGiot(batDau) {
      var lop = Math.random();
      return {
        x: tX + Math.random() * tRong,
        y: batDau ? tDinh + Math.random() * (tChan - tDinh) : tDinh - Math.random() * 30,
        dai: 10 + lop * 34,
        v: 1.6 + lop * 3.4,
        rong: 0.6 + lop * 1.1,
        mo: 0.05 + lop * 0.13
      };
    }

    /* Gợn sóng ở chân thác: vòng tròn nở ra rồi tan. */
    function moiGon(x) {
      gon.push({ x: x, y: tChan + Math.random() * 8,
                 r: 1, rMax: 14 + Math.random() * 34,
                 v: 0.5 + Math.random() * 0.6, mo: 0.10 + Math.random() * 0.10 });
    }

    return {
      dung: function () {
        W0 = W; H0 = H;
        tRong = Math.max(26, W0 * 0.055);
        tX    = W0 * 0.655;
        tDinh = H0 * 0.30;
        tChan = H0 * 0.63;

        nen = document.createElement('canvas');
        nen.width = Math.max(1, Math.round(W0));
        nen.height = Math.max(1, Math.round(H0));
        var c = nen.getContext('2d');

        /* Xa trước gần sau. Hai lớp đầu là núi XA — cao, nhạt, mỗi lớp một
           ngọn nhô lên; lớp thứ ba là vách đá đỡ dòng thác. */
        veNui(c, H0 * 0.44, H0 * 0.30, 0.070, 1.3, [[0.17, 0.09, 0.90]], true);
        veNui(c, H0 * 0.48, H0 * 0.26, 0.055, 3.7, [[0.86, 0.08, 0.76]], true);
        veSuong(c, H0 * 0.46, H0 * 0.055, 0.85);

        veNui(c, H0 * 0.58, H0 * 0.22, 0.105, 5.1, [[0.66, 0.10, 0.82]], true);
        veSuong(c, H0 * 0.575, H0 * 0.040, 0.70);

        /* Vách đá gần, hai bên miệng thác. Không vẽ đè lên dải thác: chừa ra
           bằng cách cắt một cửa sổ dọc trước khi tô. */
        c.save();
        c.beginPath();
        c.rect(0, 0, tX - tRong * 0.15, H0);
        c.rect(tX + tRong * 1.15, 0, W0, H0);
        c.clip();
        veNui(c, H0 * 0.70, H0 * 0.17, 0.115, 0.0);
        c.restore();

        veNui(c, H0 * 0.84, H0 * 0.11, 0.085, 2.4);
        veSuong(c, H0 * 0.66, H0 * 0.030, 0.55);

        /* Trúc ở hai mép dưới — chỗ mắt ít đi qua nhất. */
        veTruc(c, W0 * 0.06, H0 * 1.02, H0 * 0.40, -0.05, 0.16);
        veTruc(c, W0 * 0.12, H0 * 1.04, H0 * 0.32,  0.07, 0.11);
        veTruc(c, W0 * 0.93, H0 * 1.02, H0 * 0.36,  0.04, 0.13);

        var n = Math.max(30, Math.min(110, Math.round(tRong * 2.2)));
        giot = [];
        for (var i = 0; i < n; i++) giot.push(moiGiot(true));
        gon = [];
      },

      ve: function () {
        ctx.clearRect(0, 0, W, H);
        if (nen) ctx.drawImage(nen, 0, 0, W, H);

        /* ── DÒNG THÁC ──
           Nét dọc, không phải hạt tròn: cùng một lượng mực, một nét dài đọc
           ra là NƯỚC ĐANG RƠI còn một chấm thì đọc ra là bụi. */
        ctx.lineCap = 'round';
        for (var i = 0; i < giot.length; i++) {
          var g = giot[i];
          g.y += g.v;
          if (g.y - g.dai > tChan) {
            /* Chạm mặt nước thì sinh một gợn rồi quay lên miệng thác. Chỉ một
               phần nhỏ sinh gợn — mỗi giọt một gợn thì chân thác thành một
               mảng trắng đặc. */
            if (Math.random() < 0.14) moiGon(g.x);
            giot[i] = moiGiot(false);
            continue;
          }
          ctx.strokeStyle = 'rgba(' + MUC + ',' + g.mo.toFixed(3) + ')';
          ctx.lineWidth = g.rong;
          ctx.beginPath();
          ctx.moveTo(g.x, g.y - g.dai);
          ctx.lineTo(g.x, g.y);
          ctx.stroke();
        }

        /* ── GỢN Ở CHÂN THÁC ──
           Vẽ bằng `destination-out` như sương: chúng là chỗ nước trắng xoá,
           tức chỗ mực bị đẩy đi. */
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        for (var j = gon.length - 1; j >= 0; j--) {
          var o = gon[j];
          o.r += o.v;
          if (o.r > o.rMax) { gon.splice(j, 1); continue; }
          var mo = o.mo * (1 - o.r / o.rMax);
          ctx.strokeStyle = 'rgba(0,0,0,' + mo.toFixed(3) + ')';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(o.x, o.y, o.r, o.r * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
  }

  /* ══════════ SƠN THUỶ, BẢN HAI: MẶT TRỜI VÀ ĐÀN CHIM ══════════

     Cùng một bộ núi và sương với bản thác, chỉ đổi phần ĐỘNG và phần điểm
     màu: một vầng mặt trời thấp ở chân trời, và một đàn chim bay ngang rất
     chậm.

     ── VÌ SAO ĐÀN CHIM ĐỌC ĐƯỢC ──
     Cùng lý do với thác, nhưng theo chiều khác: chim là những nét NHỎ và ĐẬM
     di chuyển trên một vùng giấy gần như trống. Mắt bắt một vật nhỏ tương
     phản cao dễ hơn nhiều so với một mảng lớn tương phản thấp — nên chỉ cần
     mươi cái chấm bằng đầu kim là cả bức có sự sống, mà tổng lượng mực thêm
     vào còn ít hơn một dòng chữ.

     ── MẶT TRỜI LÀ CHỖ DUY NHẤT CÓ MÀU ──
     Một đĩa cam ở chân trời. Nó đứng yên, rất nhạt, và nằm ở nửa trên màn —
     chỗ mắt đi qua chứ không dừng. Ở bản thác thì chỗ có màu là mấy đốt trúc;
     ở đây là mặt trời. Cả hai bản đều giữ đúng một nguồn màu.
  ══════════════════════════════════════════════════════════════════════ */
  function dungMatTroi() {
    var nen = null, W0 = 0, H0 = 0, chim = [];
    var MUC = '17,19,21';

    /* Một con chim: hai nét cong nối nhau, vẽ bằng một đường bezier duy nhất.
       Ở cỡ này không cần hơn — thêm thân hay đuôi là nó thành một hình vẽ
       chim, mà cái cần là một DẤU chim. */
    function veChim(c, x, y, r, mo, vo) {
      c.strokeStyle = 'rgba(' + MUC + ',' + mo.toFixed(3) + ')';
      c.lineWidth = Math.max(0.9, r * 0.13);
      c.lineCap = 'round';
      /* `vo` 0→1: cánh đang hạ → đang nâng. Biên độ nhỏ thôi, và mỗi con một
         pha riêng — cả đàn vỗ cùng nhịp thì đọc ra là một hoạ tiết lặp. */
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
        y: H * (0.10 + Math.random() * 0.26),
        r: 4 + lop * 9,
        v: 0.16 + lop * 0.34,
        pha: Math.random() * Math.PI * 2,
        nhip: 0.055 + Math.random() * 0.05,
        mo: 0.20 + lop * 0.4,
        /* Trôi lên xuống rất nhẹ theo đường sin — chim bay thẳng băng thì đọc
           ra là một dấu trượt ngang, không ra là đang bay. */
        bien: 5 + lop * 12,
        nhipY: 0.004 + Math.random() * 0.004
      };
    }

    function veNui(c, y0, cao, mo, hat, dinh, xa) {
      c.beginPath();
      c.moveTo(0, H0);
      for (var x = 0; x <= W0; x += 3) {
        var u = x / W0;
        var h = Math.sin(u * 6.1 + hat) * 0.45
              + Math.sin(u * 2.3 + hat * 1.7) * 0.36
              + Math.sin(u * 11.4 + hat * 0.6) * 0.19;
        if (dinh) {
          for (var k = 0; k < dinh.length; k++) {
            var d = (u - dinh[k][0]) / dinh[k][1];
            h += dinh[k][2] * Math.exp(-d * d * 4);
          }
        }
        c.lineTo(x, y0 - h * cao);
      }
      c.lineTo(W0, H0);
      c.closePath();
      var g;
      if (xa) {
        g = c.createLinearGradient(0, y0 - cao * 1.6, 0, y0 + cao * 0.5);
        g.addColorStop(0, 'rgba(' + MUC + ',' + mo.toFixed(3) + ')');
        g.addColorStop(0.62, 'rgba(' + MUC + ',' + (mo * 0.5).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + MUC + ',0)');
      } else {
        g = c.createLinearGradient(0, y0 - cao, 0, y0 + cao * 0.9);
        g.addColorStop(0, 'rgba(' + MUC + ',0)');
        g.addColorStop(0.45, 'rgba(' + MUC + ',' + (mo * 0.72).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + MUC + ',' + mo.toFixed(3) + ')');
      }
      c.fillStyle = g;
      c.fill();
    }

    function veSuong(c, y, cao, manh) {
      c.save();
      c.globalCompositeOperation = 'destination-out';
      var g = c.createLinearGradient(0, y - cao, 0, y + cao);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, 'rgba(0,0,0,' + manh.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, y - cao, W0, cao * 2);
      c.restore();
    }

    return {
      dung: function () {
        W0 = W; H0 = H;
        nen = document.createElement('canvas');
        nen.width = Math.max(1, Math.round(W0));
        nen.height = Math.max(1, Math.round(H0));
        var c = nen.getContext('2d');

        /* Mặt trời vẽ TRƯỚC núi: nó ở sau dãy, nên mép dưới bị núi che khuất
           một phần — đó là thứ đặt nó vào không gian thay vì dán lên trên. */
        var sx = W0 * 0.70, sy = H0 * 0.20, sr = Math.min(W0, H0) * 0.058;
        var gs = c.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.6);
        gs.addColorStop(0, 'rgba(216,116,70,0.30)');
        gs.addColorStop(0.28, 'rgba(216,116,70,0.16)');
        gs.addColorStop(1, 'rgba(216,116,70,0)');
        c.fillStyle = gs;
        c.beginPath(); c.arc(sx, sy, sr * 2.6, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(206,98,54,0.34)';
        c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI * 2); c.fill();

        veNui(c, H0 * 0.44, H0 * 0.30, 0.070, 1.3, [[0.17, 0.09, 0.90]], true);
        veNui(c, H0 * 0.48, H0 * 0.26, 0.055, 3.7, [[0.86, 0.08, 0.76]], true);
        veSuong(c, H0 * 0.46, H0 * 0.055, 0.85);
        veNui(c, H0 * 0.58, H0 * 0.22, 0.105, 5.1, [[0.66, 0.10, 0.82]], true);
        veSuong(c, H0 * 0.575, H0 * 0.040, 0.70);
        veNui(c, H0 * 0.72, H0 * 0.16, 0.115, 0.0);
        veNui(c, H0 * 0.86, H0 * 0.10, 0.085, 2.4);
        veSuong(c, H0 * 0.68, H0 * 0.030, 0.55);

        var n = Math.max(7, Math.min(18, Math.round(W0 / 110)));
        chim = [];
        for (var i = 0; i < n; i++) chim.push(moiChim(true));
      },

      ve: function (t) {
        ctx.clearRect(0, 0, W, H);
        if (nen) ctx.drawImage(nen, 0, 0, W, H);
        for (var i = 0; i < chim.length; i++) {
          var k = chim[i];
          k.x += k.v;
          if (k.x - k.r > W) { chim[i] = moiChim(false); continue; }
          var y = k.y + Math.sin(t * k.nhipY + k.pha) * k.bien;
          var vo = (Math.sin(t * k.nhip + k.pha) + 1) / 2;
          veChim(ctx, k.x, y, k.r, k.mo, vo);
        }
      }
    };
  }

  /* ══════════ ĐIỀU PHỐI ══════════ */

  /* Theme → hiệu ứng. Một bảng tra, không phải một chuỗi if: thêm theme là
     thêm đúng một dòng ở đây, và không có đường nào rơi vào nhánh "còn lại"
     để rồi lặng lẽ chạy sai hiệu ứng. */
  /* ── HAI BẢN NỀN CHO 霜降, ĐANG CHỌN ──
     TẠM THỜI. Chủ trang đang so hai bản để quyết:
       `thac`    núi đá + dòng thác đổ + mấy đốt trúc  (mặc định)
       `mattroi` núi xa + mặt trời thấp + đàn chim bay ngang

     Đổi bằng cách gõ vào Console của trình duyệt:
       localStorage.setItem('zib-nen-frost','mattroi')   rồi tải lại trang
       localStorage.removeItem('zib-nen-frost')          về lại bản thác

     Chọn xong thì XOÁ khối này và xoá hàm của bản không dùng — giữ hai bản
     song song lâu là hai chỗ phải sửa mỗi lần đụng tới nền. */
  function nenFrost() {
    var chon = '';
    /* Nhận cả từ ĐỊA CHỈ: `?nen=mattroi` hoặc `?nen=thac`. Mở Console gõ lệnh
       là một rào cản thật — dán nhầm vào terminal là chuyện xảy ra ngay lần
       đầu. Một đường dẫn bấm được thì không nhầm vào đâu được.

       Bấm một lần là nhớ luôn (ghi vào localStorage), nên mọi trang sau đó
       đều theo bản đã chọn mà không cần mang tham số đi kèm. */
    try {
      var q = new URLSearchParams(location.search).get('nen');
      if (q === 'mattroi' || q === 'thac') localStorage.setItem('zib-nen-frost', q);
      chon = localStorage.getItem('zib-nen-frost') || '';
    } catch (e) {}
    return chon === 'mattroi' ? dungMatTroi() : dungThuyMac();
  }

  var BO = { light: dungHoa, dark: dungThienHa, calm: dungThac, frost: nenFrost };

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
