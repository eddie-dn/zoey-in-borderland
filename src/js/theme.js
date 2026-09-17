/* ============================================================
   THEME — xoay vòng Sakura sáng → Galaxy tối → Tĩnh lặng, nhớ lựa chọn.

   Việc ĐẶT theme lúc tải trang KHÔNG nằm ở file này. Nó nằm trong một đoạn
   <script> viết thẳng vào <head> (xem src/templates/shell.html), chạy TRƯỚC
   khi trình duyệt vẽ khung hình đầu tiên. Để ở file ngoài thì trang loé
   trắng một nhịp rồi mới tối lại — trên máy chậm thấy rất rõ.

   File này chỉ lo cái nút.

   ── VÌ SAO XOAY VÒNG CHỨ KHÔNG PHẢI MENU THẢ XUỐNG ──
   Ba lựa chọn là ngưỡng cuối cùng còn xoay vòng được: bấm quá tay một nhịp
   thì bấm thêm hai nhịp nữa là về chỗ cũ, không ai phải đi tìm lại. Từ bốn
   trở lên thì phải đổi sang menu — và lúc đó cái nút một-hình này không còn
   đủ, vì người đọc không nhìn thấy trước mình sắp đi đâu.
   ============================================================ */
(function(){
  'use strict';
  var KEY = 'zib-theme';
  var root = document.documentElement;

  /* THỨ TỰ XOAY VÒNG. Sáng → tối → tĩnh lặng → sáng.
     Tĩnh lặng đứng SAU Galaxy chứ không chen vào giữa: hai theme đầu là cặp
     sáng/tối mà mọi trang web đều có, người đọc bấm một nhịp là gặp đúng cái
     họ đang đi tìm. Theme thứ ba là thứ tìm thấy thêm, không phải thứ chắn
     đường. */
  /* Thứ tự vòng: hai theme có màu trước, rồi Tĩnh lặng, rồi 霜降. 霜降 đứng
     CUỐI vì nó là theme không màu — ai bấm tới đó là đang tìm một trang
     trung tính, và người đi tìm thì chịu bấm thêm một nhịp. Đặt nó thứ hai
     thì ai chỉ muốn đổi sáng-tối phải đi qua nó mỗi vòng. */
  var VONG = ['light', 'dark', 'calm', 'frost'];

  /* Màu thanh trạng thái của trình duyệt điện thoại. Bảng này lặp lại ở đoạn
     script trong <head> — cố ý, vì đoạn đó phải chạy trước khi file này kịp
     tải. Sửa màu nền của theme nào thì sửa CẢ HAI chỗ. */
  var MAU_THANH = { light:'#FAF6FD', dark:'#120C22', calm:'#DCE8F5', frost:'#FFFFFF' };

  /* ICON CỦA TAB theo theme. Chỉ khai theme nào CÓ bản riêng; tên nào không
     có ở đây thì về favicon.svg.

     Vì sao chỉ `calm`: nó là theme duy nhất đổi hẳn tông sang xanh lạnh, nên
     đoá hoa tím nằm trong tab đọc ra như icon của một trang khác. `dark` có
     bảng màu riêng nhưng cố ý dùng chung bản lavender — bản nền tối đặt trên
     thanh tab chế độ đêm thì nền icon lẫn vào nền tab, nhoè hơn chính bản
     không khớp theme. Lý do đầy đủ ở FAVICON trong tools/build.mjs.

     Lượt đặt ĐẦU TIÊN không nằm ở đây mà ở đoạn script trong <head>: thẻ
     <link rel=icon> là HTML tĩnh nên trình duyệt tải bản mặc định ngay, đợi
     file này tải xong mới đổi thì loé một nhịp. */
  var ICON = { calm: 'favicon-calm.svg', frost: 'favicon-frost.svg' };

  /* Nhãn lấy từ data-* mà build gắn sẵn, không gõ cứng ở đây — cả bộ chữ
     giao diện nằm ở bảng NHAN trong tools/build.mjs. Nhãn nói theme SẮP
     bấm sang, còn hình trên nút nói theme ĐANG dùng. */
  var NHAN = {
    light: ['data-nhan-sang', 'Switch to light'],
    dark : ['data-nhan-toi',  'Switch to dark'],
    calm : ['data-nhan-tinh', 'Switch to calm'],
    frost: ['data-nhan-frost', 'Switch to 霜降']
  };

  function he(){            /* máy đang để sáng hay tối */
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function dangDung(){
    var t = root.getAttribute('data-theme');
    /* Kiểm giá trị đọc được có nằm trong vòng không. Một attribute lạ (gõ tay
       lúc thử, hoặc tiện ích của trình duyệt cắm vào) mà lọt qua đây thì
       indexOf trả -1, và -1 + 1 = 0 lại ra 'light' — im lặng nhảy về đầu vòng
       thay vì kẹt cứng. */
    return VONG.indexOf(t) >= 0 ? t : he();
  }
  function keTiep(t){
    return VONG[(VONG.indexOf(t) + 1) % VONG.length];
  }
  /* `luu` chỉ bật khi người đọc THẬT SỰ bấm nút.

     Bản trước ghi localStorage ở mọi lần gọi, kể cả cú gọi lúc nạp trang ở
     cuối file. Hậu quả: mở trang một lần là đã có lựa chọn "đã lưu", nên cái
     listener bên dưới không bao giờ gỡ được attribute ra nữa — người đọc đổi
     cài đặt sáng/tối của máy thì trang đứng im ở theme mà họ chưa từng chọn.
     Lỗi này chỉ lộ ra ở lần mở trang THỨ HAI trở đi nên rất dễ lọt. */
  function dat(t, luu){
    root.setAttribute('data-theme', t);
    if(luu){ try{ localStorage.setItem(KEY, t); }catch(e){} }
    /* Đổi luôn theme-color: thanh trạng thái của trình duyệt điện thoại ăn theo
       giá trị này, không đổi thì nền tối mà thanh trên vẫn hồng nhạt. */
    var m = document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content', MAU_THANH[t] || MAU_THANH.light);
    /* Đổi icon tab. Thay ĐÚNG phần tên file trong href đang có, không dựng lại
       đường dẫn: trang chạy dưới thư mục con thì có tiền tố base, mà dán tay là
       sớm muộn lệch. Mẫu khớp cả `favicon.svg` lẫn `favicon-calm.svg`, nên bấm
       xoay vòng qua lại bao nhiêu lượt cũng không chồng thêm hậu tố.

       Lưu ý đã biết: Safari cache favicon rất dai và nhiều lúc bỏ qua lượt đổi
       href này. Không chữa được từ phía trang, mà hỏng thì cũng chỉ là icon
       đứng ở bản cũ — nên cứ để vậy, đừng dựng thêm cơ chế cho một cái icon. */
    var ic = document.querySelector('link[rel="icon"]');
    if(ic) ic.href = ic.href.replace(/favicon(-[a-z]+)?\.svg/,
                                     ICON[t] || 'favicon.svg');
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

  /* Người đọc đổi cài đặt của máy giữa chừng: chỉ đi theo NẾU họ chưa tự chọn
     bao giờ. Đã tự chọn rồi thì lựa chọn của họ thắng, không bị máy ghi đè. */
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
    var daChon = null;
    try{ daChon = localStorage.getItem(KEY); }catch(e){}
    if(!daChon) root.removeAttribute('data-theme');
  });

  /* Không truyền `luu`: cú gọi này chỉ để đồng bộ nhãn và màu thanh trạng
     thái với theme mà đoạn script trong <head> đã đặt. Nó KHÔNG phải một lựa
     chọn của người đọc, nên không được ghi vào localStorage. */
  dat(dangDung(), false);
})();
