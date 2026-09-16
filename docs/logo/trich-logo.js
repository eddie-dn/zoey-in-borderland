/* Trích từng khung của hoạt hình logo thành SVG đứng một mình.
   Chạy trong trình duyệt, trên một trang có <svg class="logo--dong">. */
(async function () {
  const CK = 27;

  /* ── LƯU BẰNG CHÍNH TRÌNH DUYỆT ──
     Bản đầu POST từng khung về `/__luu` của máy chủ dev. Nhưng máy chủ ấy
     (tools/dev.mjs) KHÔNG có đường đó — nó chỉ phục vụ file tĩnh. Nên mỗi khung
     lặng lẽ nhận 404, hàm vẫn chạy tiếp, bảng kết quả vẫn in ra đủ mười hai
     dòng, mà trên đĩa không có file nào. Sai kiểu tệ nhất: nhìn thì như xong.

     Không thêm đường ghi file vào máy chủ dev để chữa: mở cho trang web ghi
     thẳng vào đĩa là mở một cửa không đáng mở, chỉ để phục vụ một việc vài
     tháng làm một lần. Trình duyệt tải file về là đủ — file rơi vào thư mục
     Tải về, chép sang docs/logo/ là xong.

     Lần chạy đầu trình duyệt sẽ hỏi có cho tải nhiều file không. Bấm cho. */
  function luu(ten, noiDung) {
    const b = new Blob([noiDung], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = ten;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const svg = document.querySelector('svg.logo--dong');
  svg.pauseAnimations();

  /* ── DỪNG ĐÚNG MỐC, BẰNG WEB ANIMATIONS API ──
     Bản đầu chỉnh `animation-delay` âm cộng `animation-play-state:paused`.
     Cách ấy đúng cho MỘT khung, nhưng sai từ khung thứ hai trở đi: hoạt hình
     đã tạm dừng rồi thì Chrome không tính lại mốc khi `animation-delay` đổi,
     nên mọi khung sau đều kẹt lại ở thời điểm của lần dừng ĐẦU TIÊN. Trên tấm
     lát cắt nó hiện ra thành cả lưới bị xê đi vài ô — và xê đều nhau nên nhìn
     thoáng qua vẫn tưởng là đúng.

     `getAnimations()` cho cầm thẳng từng hoạt hình: đặt `currentTime` là nhảy
     tới đúng mốc ấy, đặt bao nhiêu lần cũng được. Không phải mẹo, mà là đường
     chính thức để làm việc này. */
  function dungTai(pct) {
    const t = (pct / 100) * CK;
    const ms = t * 1000;
    svg.querySelectorAll('*').forEach((el) => {
      if (!el.getAnimations) return;
      el.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; });
    });
    svg.setCurrentTime(t);
    /* setTimeout chứ KHÔNG requestAnimationFrame: rAF không chạy khi thẻ đang
       ẩn hoặc nằm dưới, nên vòng trích treo vô hạn. */
    return new Promise((r) => setTimeout(r, 40));
  }

  const SO = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : v;
  };

  /* ── GỐC PHÉP BIẾN HÌNH PHẢI ĐỌC TỪ CHÍNH PHẦN TỬ ──
     getComputedStyle().transform là ma trận CHƯA tính transform-origin, nên
     muốn bake ra thuộc tính `transform` thì phải kẹp phép dời vào hai đầu.

     Bản đầu gõ cứng (24,24) cho MỌI phần tử — sai, và sai im lặng:

       · `.lg-hoa`, `.lg-man`… có luật `transform-origin:50% 50%` với
         `transform-box:view-box` ⇒ gốc đúng là (24,24). Không sao.
       · Hai cánh sao mandala KHÔNG có luật ấy. Phép xoay của chúng là thuộc
         tính `rotate(45 24 24)` viết thẳng trên thẻ, mà thuộc tính ấy đã gói
         sẵn tâm quay vào trong rồi. Kẹp thêm (24,24) nữa là dời tâm HAI LẦN —
         và trên tấm lát cắt nó hiện ra thành một vòng vô cực thừa nằm lệch hẳn
         ra ngoài bông hoa.
       · Hạt bụi dùng `transform-box:fill-box` ⇒ gốc là tâm của CHÍNH hạt, phải
         cộng thêm gốc hộp bao mới ra toạ độ người dùng.

     Nên đọc thẳng `transformOrigin` của từng phần tử thay vì đoán. */
  function bienHinh(el, cs) {
    const m = cs.transform;
    if (!m || m === 'none') return null;
    const s = m.match(/matrix\(([^)]+)\)/);
    if (!s) return null;
    const v = s[1].split(',').map((x) => SO(x.trim()));
    if (v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 1 && v[4] === 0 && v[5] === 0) return null;

    const g = (cs.transformOrigin || '0px 0px').split(' ').map(parseFloat);
    let ox = g[0] || 0, oy = g[1] || 0;
    if (cs.transformBox === 'fill-box' && el.getBBox) {
      try { const b = el.getBBox(); ox += b.x; oy += b.y; } catch (e) {}
    }
    const mt = `matrix(${v.join(' ')})`;
    if (!ox && !oy) return mt;
    return `translate(${SO(ox)} ${SO(oy)}) ${mt} translate(${SO(-ox)} ${SO(-oy)})`;
  }

  /* Thẻ hoạt hình của SVG (<animate>) không có chỗ trong một khung TĨNH — hình
     đã được chốt lại rồi. Để lọt vào thì file lưu vừa có hình chốt vừa có lệnh
     đổi hình, và trình xem nào chạy SMIL sẽ nhảy sang hình khác. */
  const SMIL = ['animate', 'animateTransform', 'animateMotion', 'set'];

  function chep(goc) {
    if (SMIL.includes(goc.tagName)) return null;
    const cs = getComputedStyle(goc);
    if (parseFloat(cs.opacity) < 0.008 || cs.display === 'none') return null;

    const el = document.createElementNS('http://www.w3.org/2000/svg', goc.tagName);
    /* Giữ mấy thuộc tính hình học; bỏ class, style, id — bản lưu không cần
       biết gì về CSS của trang. */
    for (const a of ['cx', 'cy', 'r', 'x', 'y', 'width', 'height']) {
      if (goc.hasAttribute(a)) el.setAttribute(a, goc.getAttribute(a));
    }
    /* `d` lấy từ computed style: thẻ <animate> của SVG đổi hình qua đường ấy,
       còn getAttribute('d') thì vẫn trả về hình GỐC. Đây là chỗ quyết định bản
       lưu có khớp hoạt hình thật hay không. */
    if (goc.tagName === 'path') {
      const d = cs.d && cs.d !== 'none'
        ? cs.d.replace(/^path\(["']?/, '').replace(/["']?\)$/, '')
        : goc.getAttribute('d');
      el.setAttribute('d', d);
    }
    const dat = (ten, gt, boQua) => {
      if (gt == null || gt === '' || gt === boQua) return;
      el.setAttribute(ten, gt);
    };
    dat('fill', cs.fill, 'rgb(0, 0, 0)');
    if (cs.fill === 'none' || goc.getAttribute('fill') === 'none') el.setAttribute('fill', 'none');
    dat('stroke', cs.stroke, 'none');
    dat('stroke-width', SO(parseFloat(cs.strokeWidth)), 1);
    if (parseFloat(cs.strokeOpacity) < 0.999) el.setAttribute('stroke-opacity', SO(cs.strokeOpacity));
    dat('stroke-linecap', cs.strokeLinecap, 'butt');
    dat('stroke-linejoin', cs.strokeLinejoin, 'miter');
    if (cs.strokeDasharray && cs.strokeDasharray !== 'none') {
      el.setAttribute('stroke-dasharray', cs.strokeDasharray.replace(/px/g, ''));
      const off = parseFloat(cs.strokeDashoffset) || 0;
      if (off) el.setAttribute('stroke-dashoffset', SO(off));
    }
    if (parseFloat(cs.opacity) < 0.999) el.setAttribute('opacity', SO(cs.opacity));
    const bh = bienHinh(goc, cs);
    if (bh) el.setAttribute('transform', bh);
    else if (goc.hasAttribute('transform')) el.setAttribute('transform', goc.getAttribute('transform'));

    for (const con of goc.children) {
      const c = chep(con);
      if (c) el.appendChild(c);
    }
    /* Thẻ <g> rỗng sau khi lọc thì bỏ luôn — bản lưu không nên có thẻ trống. */
    if (goc.tagName === 'g' && !el.children.length) return null;
    return el;
  }

  async function motKhung(pct, ten, ta) {
    await dungTai(pct);
    const goc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    goc.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    goc.setAttribute('viewBox', '0 0 48 48');
    goc.setAttribute('width', '240');
    goc.setAttribute('height', '240');
    goc.setAttribute('role', 'img');
    goc.setAttribute('aria-label', ta);
    const mo = document.createComment(
      ` Zoey in Borderland — logo, ${ta} (${pct}% vòng kể) `);
    goc.appendChild(mo);
    /* currentColor không còn nghĩa gì ở file đứng một mình, nên chốt màu lại.
       Dùng đúng mực của theme Sakura để bộ ảnh đồng bộ với nhau. */
    goc.setAttribute('color', '#2E2340');
    for (const con of svg.children) {
      const c = chep(con);
      if (c) goc.appendChild(c);
    }
    const chu = new XMLSerializer().serializeToString(goc)
      .replace(/><(?!\/)/g, '>\n  <')
      .replace(/rgb\((\d+), (\d+), (\d+)\)/g, (m, r, g, b) =>
        '#' + [r, g, b].map((x) => (+x).toString(16).padStart(2, '0')).join(''));
    luu(ten, chu);
    return { ten, pct, byte: chu.length };
  }

  /* Danh sách mốc: window.__KHUNG nếu bên gọi khai sẵn, không thì mười hai
     chặng có tên. */
  const KHUNG = window.__KHUNG || [
    [0,  '01-nghi.svg',        'trạng thái nghỉ — đoá mandala tám cánh'],
    [10, '02-ba-vach.svg',     'ba vạch — tên blog nhìn từ rất xa'],
    [22, '03-chu-z.svg',       'nét chữ Z vẽ dần ra'],
    [30, '04-da-giac.svg',     'nét nối khép chữ Z thành vô cực đa giác'],
    [36, '05-xoay-ngang.svg',  'cả cụm xoay ngang'],
    [44, '06-vo-cuc-1.svg',    'đa giác bo thành vô cực thứ nhất'],
    [50, '07-chu-b.svg',       'chữ B vẽ ra bên trên vô cực thứ nhất'],
    [58, '08-hai-vo-cuc.svg',  'bụng chữ B vòng ra thành vô cực thứ hai'],
    [66, '09-mandala-no.svg',  'bốn cánh nở thành tám — mandala hiện đủ'],
    [80, '10-xoay.svg',        'mandala xoay, hai tầng cánh chạy lệch nhau'],
    [90, '11-vo.svg',          'vỡ ra thành bụi'],
    [97, '12-tu-lai.svg',      'bụi tan, mandala tụ lại']
  ];


  const kq = [];
  for (const [p, t, ta] of KHUNG) kq.push(await motKhung(p, t, ta));
  return kq;
})();
