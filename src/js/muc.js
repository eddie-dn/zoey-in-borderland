/* ══════════════════════════════════════════════════════════════════════
   NGĂN CHUYÊN MỤC — thêm, sửa, bỏ; và viết câu mô tả hiện ở trang Posts.

   ── MỘT CHUYÊN MỤC LÀ MỘT THƯ MỤC, KHÔNG PHẢI MỘT BẢN GHI ─────────────
   `content/posts/tam-ly/` là chuyên mục "tam-ly". Cạnh nó có thể có một file
   `_muc.json` chở ba thứ mà tên thư mục không chở được:

       title        tên hiện ra trên trang   — "Psychology", không phải "tam-ly"
       description  câu dưới tên ở /posts/   — thứ nói cho người đọc biết mục
                                                này viết về cái gì
       thuTu        thứ tự xếp               — để mục quan trọng nằm trước

   Thiếu file ấy thì bộ dựng lấy luôn tên thư mục làm tên, mô tả để trống. Nên
   ngăn này KHÔNG tạo ra cái gì mới — nó chỉ là cách viết `_muc.json` mà không
   phải mở kho mã trên GitHub.

   ── VÌ SAO TẠO CHUYÊN MỤC = GHI MỘT FILE ──────────────────────────────
   Git không lưu được thư mục rỗng. Muốn có `content/posts/am-nhac/` thì phải
   có ít nhất một file trong đó — và `_muc.json` chính là file ấy. Nhờ vậy
   "tạo chuyên mục" và "đặt tên cho chuyên mục" là cùng một thao tác, không
   phải hai.

   ── VÌ SAO XOÁ THÌ PHẢI RỖNG ──────────────────────────────────────────
   Xoá `_muc.json` của một chuyên mục đang có bài KHÔNG làm bài biến mất. Nó
   chỉ làm chuyên mục mất tên đẹp và mất câu mô tả — âm thầm, và phải mở trang
   Posts mới thấy. Nên máy chủ chặn hẳn, và ở đây nút Xoá mờ đi kèm con số bài
   còn lại, để biết phải dọn bao nhiêu trước đã.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var goc = document.documentElement;
  var api = goc.getAttribute('data-bai-api');
  var oSan = document.querySelector('[data-muc-host]');
  if (!api || !oSan) return;

  var N = {};
  try { N = JSON.parse(goc.getAttribute('data-bai-nhan') || '{}'); } catch (e) {}
  function L(k, m) { return N[k] || m; }

  var K = (window.ZIB || {}).khoa;
  function coKhoa() { return !!(K && K.co()); }

  function tho(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var hop = document.createElement('section');
  hop.className = 'vb-khoi';
  oSan.appendChild(hop);

  var ds = null;        /* bảng chuyên mục đã tải */
  var dangSua = null;   /* chuyên mục đang mở ra sửa, hoặc {moi:true} */

  function noi(t, loai) {
    var o = hop.querySelector('.vb-noi');
    if (!o) return;
    o.textContent = t || '';
    o.className = 'vb-noi' + (loai ? ' vb-noi--' + loai : '');
  }

  /* Cùng một phép rút tên thư mục với `slugify` bên viet-bai.js và bên máy
     chủ. Ba bản, và cố ý: hai bản kia chạy ở hai môi trường khác. Đổi luật thì
     phải sửa cả ba — máy chủ là bản CÓ QUYỀN quyết định, hai bản kia chỉ để
     xem trước. */
  function slugify(s) {
    return String(s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/['"‘’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  /* ══════════ TẢI BẢNG ══════════ */
  function tai() {
    hop.innerHTML = '<p class="vb-cho">' + tho(L('loading', 'Loading…')) + '</p>';
    fetch(api + '?muc=1', { cache: 'no-store', headers: K.dau() })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (!kq.d || !kq.d.ok) {
          hop.innerHTML = '<p class="vb-cho vb-noi--hong">' + tho(loiChu(kq.d)) + '</p>';
          return;
        }
        ds = kq.d.muc || [];
        veBang();
      })
      .catch(function (e) {
        if (window.console) console.error('[muc]', e);
        hop.innerHTML = '<p class="vb-cho vb-noi--hong">' +
          tho(L('netErr', 'Network hiccup. Try again in a moment.')) + '</p>';
      });
  }

  /* Chữ đang lọc ở thanh trên. Giữ ngoài `veBang()` để vẽ lại bảng không mất
     thứ vừa gõ. */
  var locChu = '';

  /* Bỏ dấu để gõ "tam ly" cũng tìm ra "Tâm lý" — bản sao của hàm cùng tên bên
     viet-bai.js. Chép lại chứ không tách ra file chung: ba dòng, mà một file
     dùng chung nữa là một file nữa phải nạp ở mọi trang có ngăn quản trị. */
  function khongDau(x) {
    try {
      return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[-_/]+/g, ' ');
    } catch (e) { return String(x).toLowerCase(); }
  }

  /* ══════════ BẢNG ══════════ */
  function veBang() {
    dangSua = null;
    var chu = locChu ? khongDau(locChu) : '';
    /* Soi cả mã, tên hiển thị lẫn câu mô tả: ba thứ ấy đều là "tên" của một
       chuyên mục tuỳ người đang nhớ cái nào. */
    var loc = !chu ? ds : ds.filter(function (m) {
      return khongDau(m.muc).indexOf(chu) >= 0 ||
             khongDau(m.title || '').indexOf(chu) >= 0 ||
             khongDau(m.description || '').indexOf(chu) >= 0;
    });
    hop.innerHTML =
      /* ── CÙNG MỘT THANH TRÊN VỚI NGĂN POST ──
         Hai ngăn cạnh nhau làm cùng một loại việc, nên chúng phải mở ra giống
         nhau: nút chính bên trái, ô lọc ngay cạnh. Trước bản này ngăn này chỉ
         có mỗi cái nút — đổi tab một cái là nửa thanh công cụ biến mất, và mắt
         phải đi tìm lại xem ô lọc đâu rồi.

         Lọc TẠI CHỖ trên danh sách đã tải, giống hệt ngăn Post: chuyên mục
         không bao giờ nhiều tới mức phải hỏi máy chủ. */
      '<div class="ad-thanh">' +
        '<button type="button" class="btn btn--chinh" data-moi>' +
          tho(L('mucNew', 'New category')) + '</button>' +
        '<label class="ad-tim">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/></svg>' +
          '<input type="search" data-tim autocomplete="off" spellcheck="false" ' +
                 'value="' + tho(locChu) + '" ' +
                 'placeholder="' + tho(L('mucFind', 'Filter by name')) + '" ' +
                 'aria-label="' + tho(L('mucFind', 'Filter by name')) + '">' +
        '</label>' +
        '<span class="ad-dem" data-dem></span>' +
      '</div>' +
      '<div class="ad-bang">' +
        (loc.length
          ? loc.map(function (m) {
              /* Chuyên mục con in kèm tầng cha, vì tên ngắn của nó ("ha-noi")
                 không nói được nó nằm ở đâu. */
              return '<div class="ad-dong ad-dong--hai" data-m="' + tho(m.muc) + '">' +
                '<span class="ad-phu">' + tho(m.muc) + '</span>' +
                '<span class="ad-chinh">' + tho(m.title) +
                  (m.description ? '<em class="ad-mo">' + tho(m.description) + '</em>' : '') +
                '</span>' +
                '<span class="ad-cd">' +
                  tho(L('mucCount', '{n} posts').replace('{n}', m.soBai)) + '</span>' +
                '<span class="ad-lenh-hang">' +
                  '<button type="button" class="ad-lenh" data-sua>' +
                    tho(L('edit', 'Edit')) + '</button>' +
                  '<button type="button" class="ad-lenh" data-xoa' +
                    (m.soBai > 0 || !m.sha ? ' disabled' : '') + '>' +
                    tho(L('mucDel', 'Delete')) + '</button>' +
                '</span>' +
              '</div>';
            }).join('')
          : '<p class="vb-cho">' +
              tho(chu ? L('noMatch', 'Nothing matches, in what is loaded so far.')
                      : L('empty', 'Nothing here.')) + '</p>') +
      '</div>' +
      '<p class="vb-noi"></p>';

    var oDem = hop.querySelector('[data-dem]');
    if (oDem) {
      oDem.textContent = L('mucShown', '{n} of {t}')
        .replace('{n}', loc.length).replace('{t}', ds.length);
    }

    var oTim = hop.querySelector('[data-tim]');
    if (oTim) {
      /* Vẽ lại ngay từng phím: danh sách nằm sẵn trong bộ nhớ, lọc là một phép
         `filter` trên vài chục dòng. Trả tiêu điểm về ô gõ vì `veBang()` dựng
         lại CẢ thanh trên, khác `veHang()` bên ngăn Post. */
      oTim.addEventListener('input', function () {
        locChu = oTim.value.trim();
        var vt = oTim.selectionStart;
        veBang();
        var moi = hop.querySelector('[data-tim]');
        if (moi) { moi.focus(); try { moi.setSelectionRange(vt, vt); } catch (e) {} }
      });
    }

    hop.querySelector('[data-moi]').addEventListener('click', function () { khung(null); });
    [].slice.call(hop.querySelectorAll('.ad-dong--hai')).forEach(function (d) {
      var ten = d.getAttribute('data-m');
      var cai = ds.filter(function (x) { return x.muc === ten; })[0];
      d.querySelector('[data-sua]').addEventListener('click', function () { khung(cai); });
      var nXoa = d.querySelector('[data-xoa]');
      if (nXoa && !nXoa.disabled) {
        nXoa.addEventListener('click', function () { xoa(cai, nXoa); });
      }
    });
  }

  /* ══════════ KHUNG SỬA / THÊM ══════════ */
  function khung(cai) {
    dangSua = cai;
    var moi = !cai;

    hop.innerHTML =
      '<div class="vb-hang">' +
        '<label class="vb-o"><span>' + tho(L('mucFolder', 'Folder name — part of every link')) + '</span>' +
          '<input type="text" name="muc" autocomplete="off" spellcheck="false" maxlength="60"' +
            (moi ? '' : ' readonly') + '></label>' +
        '<label class="vb-o"><span>' + tho(L('mucTitle', 'Name shown on the site')) + '</span>' +
          '<input type="text" name="title" autocomplete="off" maxlength="80"></label>' +
        '<label class="vb-o"><span>' + tho(L('mucOrder', 'Order — smaller comes first')) + '</span>' +
          '<input type="number" name="thuTu" step="1"></label>' +
      '</div>' +
      '<div class="vb-hang">' +
        '<label class="vb-o vb-o--rong"><span>' +
          tho(L('mucDesc', 'One line under the name on All posts')) + '</span>' +
          '<textarea name="description" rows="2" maxlength="300"></textarea></label>' +
      '</div>' +
      '<p class="vb-duong">' +
        '<span class="vb-duong-nhan">' + tho(L('willBe', 'Will live at')) + '</span>' +
        '<code data-xem>…</code>' +
      '</p>' +
      /* Đổi TÊN THƯ MỤC của một chuyên mục đang có là dời mọi bài trong đó —
         hàng chục lượt ghi, và mọi link gãy hết. Nên ô ấy `readonly` khi sửa,
         và dòng này nói ra đường vòng: dời từng bài bằng ngăn Post. */
      (moi ? '' :
        '<p class="vb-duong-bao vb-duong-bao--nhac">' +
          tho(L('mucLocked', 'The folder name cannot be changed here — it is part of every link in this category. Move the posts one by one from the Post tab instead.')) +
        '</p>') +
      '<div class="vb-nut">' +
        '<button type="button" class="ad-lenh" data-ve>' + tho(L('back', 'Back')) + '</button>' +
        '<button type="button" class="btn" data-luu>' +
          tho(moi ? L('mucAdd', 'Add') : L('save', 'Save')) + '</button>' +
      '</div>' +
      '<p class="vb-noi"></p>';

    var oMuc = hop.querySelector('[name=muc]');
    if (cai) {
      oMuc.value = cai.muc;
      hop.querySelector('[name=title]').value = cai.title || '';
      hop.querySelector('[name=description]').value = cai.description || '';
      hop.querySelector('[name=thuTu]').value = cai.thuTu == null ? '' : cai.thuTu;
    }

    /* Tên thư mục tự rút từ tên hiện ra, cho tới lúc người ta tự gõ — cùng
       nếp với ô đường dẫn bài ở ngăn Post. Ai không quan tâm thì không phải
       nghĩ tới nó lần nào. */
    var tuDo = !moi;
    if (moi) {
      hop.querySelector('[name=title]').addEventListener('input', function (e) {
        if (tuDo) return;
        oMuc.value = slugify(e.target.value);
        xem();
      });
      oMuc.addEventListener('input', function () { tuDo = true; xem(); });
      oMuc.addEventListener('blur', function () { oMuc.value = slugify(oMuc.value); xem(); });
    }

    hop.querySelector('[data-ve]').addEventListener('click', veBang);
    hop.querySelector('[data-luu]').addEventListener('click', luu);
    xem();
  }

  function xem() {
    var o = hop.querySelector('[data-xem]');
    if (!o) return;
    var m = (hop.querySelector('[name=muc]') || {}).value || '';
    o.textContent = m ? '/posts/' + m + '/' : '…';
  }

  /* ══════════ GHI ══════════ */
  function luu() {
    var nut = hop.querySelector('[data-luu]');
    var b = {
      muc        : slugifyDuong(hop.querySelector('[name=muc]').value),
      title      : hop.querySelector('[name=title]').value,
      description: hop.querySelector('[name=description]').value,
      thuTu      : hop.querySelector('[name=thuTu]').value
    };
    if (dangSua) b.sha = dangSua.sha || '';

    if (!b.muc || !b.title.trim()) {
      noi(L('mucNeed', 'A folder name and a name to show are both needed.'), 'hong');
      return;
    }

    nut.disabled = true;
    noi(L('sending', 'Sending…'));
    fetch(api, {
      method: 'PATCH',
      headers: K.dau({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(b)
    })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        nut.disabled = false;
        if (!kq.d || !kq.d.ok) { noi(loiChu(kq.d), 'hong'); return; }
        ds = null;
        tai();
      })
      .catch(function (e) {
        nut.disabled = false;
        if (window.console) console.error('[muc]', e);
        noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
      });
  }

  /* Tên thư mục có thể hai tầng (`doi-thuong/ha-noi`), nên `slugify` — vốn
     nuốt cả dấu `/` — không dùng thẳng được. Rút từng tầng rồi ghép lại. */
  function slugifyDuong(s) {
    return String(s).split('/').map(slugify).filter(Boolean).slice(0, 2).join('/');
  }

  /* ══════════ XOÁ ══════════ */
  function xoa(cai, nut) {
    if (!window.confirm(L('mucDelAsk', 'Remove the name and description of “{n}”? The folder itself stays.')
                          .replace('{n}', cai.title || cai.muc))) return;
    var cu = nut.textContent;
    nut.disabled = true;
    nut.textContent = L('working', '…');
    fetch(api + '?muc=' + encodeURIComponent(cai.muc), {
      method: 'DELETE', headers: K.dau()
    })
      .then(function (r) { return r.json().then(function (d) { return { ma: r.status, d: d }; }); })
      .then(function (kq) {
        if (!kq.d || !kq.d.ok) {
          nut.disabled = false; nut.textContent = cu;
          noi(loiChu(kq.d), 'hong');
          return;
        }
        tai();
      })
      .catch(function () {
        nut.disabled = false; nut.textContent = cu;
        noi(L('netErr', 'Network hiccup. Try again in a moment.'), 'hong');
      });
  }

  /* Báo lỗi nói PHẢI LÀM GÌ, không chỉ nói là hỏng — cùng nếp với viet-bai.js. */
  function loiChu(d) {
    if (!d) return L('failed', 'Could not publish.');
    if (d.loi === 'khoa') return L('badKey', 'Wrong owner ID or key.');
    if (d.loi === 'conbai') return d.chiTiet || L('mucBusy', 'This category still has posts in it.');
    if (d.loi === 'lechban') return d.chiTiet || L('clash', 'This changed somewhere else. Reload and try again.');
    if (d.loi === 'kiem') return (d.chiTiet || []).join(' · ');
    if (d.loi === 'cauhinh') {
      return d.chiTiet
          || L('noConfig', 'The server is missing') + ' ' + (d.thieu || []).join(', ');
    }
    return d.chiTiet || L('failed', 'Could not publish.');
  }

  /* ── CHẠY MỘT LẦN NGAY LÚC NẠP, RỒI MỚI NGHE ──
     `theoDoi()` chỉ ĐĂNG KÝ một trình nghe; nó không gọi hàm ngay. Và
     `khoa.js` chỉ phát sự kiện `zib:khoa` khi khoá ĐỔI (nhập vào, xoá đi, hoặc
     đổi ở tab khác) — mở trang với khoá đã lưu sẵn thì không có sự kiện nào cả.

     Nên nếu chỉ đăng ký mà không gọi, ngăn này TRỐNG TRƠN mỗi lần mở trang, và
     chỉ hiện ra sau khi đăng xuất rồi đăng nhập lại. Đúng lỗi đã gặp.

     `viet-bai.js` và `duyet.js` đều gọi một lần rồi mới nghe — làm theo. */
  if (coKhoa()) tai();

  /* Khoá đổi ở đâu cũng vẽ lại ở đây. Chiều ĐĂNG XUẤT quan trọng không kém:
     bảng chuyên mục đang bày ra thì bấm Đăng xuất xong nó phải biến mất, không
     thì "đăng xuất" chỉ là một cái nút không làm gì. */
  if (K && K.theoDoi) {
    K.theoDoi(function (co) {
      if (co) tai();
      else { ds = null; hop.innerHTML = ''; }
    });
  }
})();
