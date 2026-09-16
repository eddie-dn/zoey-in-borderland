/* Trích từng khung của hoạt hình logo thành SVG đứng một mình.
   Chạy trong trình duyệt, trên một trang có <svg class="logo--dong">. */
(async function () {
  const CK = 27;
  const svg = document.querySelector('svg.logo--dong');
  svg.pauseAnimations();

  /* Bắt CSS dừng đúng mốc: mỗi phần tử nhận animation-delay âm + paused. */
  function dungTai(pct) {
    const t = (pct / 100) * CK;
    svg.querySelectorAll('*').forEach((el) => {
      el.style.setProperty('animation-delay', (-t) + 's', 'important');
      el.style.setProperty('animation-play-state', 'paused', 'important');
    });
    svg.setCurrentTime(t);
    /* setTimeout chứ KHÔNG requestAnimationFrame: rAF không chạy khi thẻ đang
       ẩn hoặc nằm dưới, nên vòng trích treo vô hạn. Ở đây chỉ cần đợi trình
       duyệt tính lại kiểu dáng, mà việc ấy xong trước lượt hẹn giờ kế tiếp. */
    return new Promise((r) => setTimeout(r, 40));
  }

  const SO = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : v;
  };

  /* getComputedStyle().transform là ma trận CHƯA tính transform-origin. Các
     phần tử ở đây đều lấy gốc là tâm view-box (24,24), nên phải kẹp phép dời
     vào hai đầu thì hình mới đúng chỗ. */
  function bienHinh(cs) {
    const m = cs.transform;
    if (!m || m === 'none') return null;
    const s = m.match(/matrix\(([^)]+)\)/);
    if (!s) return null;
    const v = s[1].split(',').map((x) => SO(x.trim()));
    if (v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 1 && v[4] === 0 && v[5] === 0) return null;
    return `translate(24 24) matrix(${v.join(' ')}) translate(-24 -24)`;
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
    const bh = bienHinh(cs);
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
    await fetch('/__luu', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten, noiDung: chu }) });
    return { ten, pct, byte: chu.length };
  }

  const KHUNG = [
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
