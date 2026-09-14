#!/usr/bin/env node
/* ============================================================
   DEV — máy chủ xem thử tại chỗ, tự dựng lại khi file đổi.

   Chạy:  npm run dev          rồi mở http://localhost:4321

   Không dùng gói ngoài: node:http đủ để phục vụ file tĩnh, và fs.watch đủ để
   biết file nào vừa đổi. Không có hot-reload kiểu framework — trang tự tải lại
   bằng một vòng hỏi nhẹ 700ms một lần, đủ nhanh khi đang viết bài.
   ============================================================ */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const GOC  = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(GOC, 'dist');
const CONG = Number(process.env.PORT) || 4321;

const KIEU = {
  '.html': 'text/html; charset=utf-8',  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml' : 'application/xml; charset=utf-8', '.txt' : 'text/plain; charset=utf-8',
  '.svg' : 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.mp4' : 'video/mp4', '.webm': 'video/webm',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

const mau = {
  do: (s) => `\x1b[31m${s}\x1b[0m`, xanh: (s) => `\x1b[32m${s}\x1b[0m`,
  mo: (s) => `\x1b[2m${s}\x1b[0m`,  dam: (s) => `\x1b[1m${s}\x1b[0m`
};

let phienBan = Date.now();

function dung() {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(GOC, 'tools', 'build.mjs')],
                      { stdio: 'inherit' });
  if (r.status === 0) phienBan = Date.now();
  else console.log(mau.do('  ✖ dựng hỏng — giữ nguyên bản cũ đang chạy\n'));
  return Date.now() - t0;
}

/* Gộp nhiều lần đổi file thành một lần dựng: lưu file trong biên tập thường
   bắn ra 2–3 sự kiện liền nhau, dựng cả ba lần là phí. */
let hen = null;
function henDung(vi) {
  clearTimeout(hen);
  hen = setTimeout(() => {
    console.log(mau.mo(`\n  ↻ ${vi} đổi — dựng lại…`));
    dung();
  }, 140);
}

for (const d of ['content', 'src', 'public']) {
  const p = path.join(GOC, d);
  if (fs.existsSync(p)) {
    fs.watch(p, { recursive: true }, (_, f) => henDung(`${d}/${f || ''}`));
  }
}
fs.watchFile(path.join(GOC, 'site.config.json'), { interval: 500 },
             () => henDung('site.config.json'));

/* Đoạn chèn vào mọi trang HTML: hỏi máy chủ 700ms một lần xem đã dựng lại chưa.
   Chỉ chạy ở chế độ dev, KHÔNG có trong bản dựng thật. */
const NAP_LAI = `
<script>
(function(){
  var v = null;
  setInterval(function(){
    fetch('/__ver', { cache: 'no-store' }).then(function(r){ return r.text(); })
      .then(function(t){
        if (v === null) { v = t; return; }
        if (t !== v) location.reload();
      }).catch(function(){});
  }, 700);
})();
</script>`;

const may = http.createServer((req, res) => {
  const duong = decodeURIComponent(req.url.split('?')[0]);

  if (duong === '/__ver') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
    return res.end(String(phienBan));
  }

  /* Chặn đường dẫn đi ngược ra ngoài dist — .. trong URL là cách cổ điển nhất
     để đọc trộm file ngoài thư mục phục vụ. */
  let f = path.normalize(path.join(DIST, duong));
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end('403'); }

  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    /* Không có trang 404 riêng ở lượt này — trả một trang tối giản, kèm
       đoạn tự tải lại để sửa xong là thấy ngay. */
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<!doctype html><meta charset="utf-8">
      <title>404</title>
      <body style="font:16px/1.6 system-ui;padding:3rem;max-width:40rem;margin:auto">
      <h1>404</h1><p>Không có <code>${duong}</code> trong <code>dist/</code>.</p>
      <p><a href="/">← về trang chủ</a></p>${NAP_LAI}`);
  }

  const duoi = path.extname(f).toLowerCase();
  const kieu = KIEU[duoi] || 'application/octet-stream';
  let than = fs.readFileSync(f);
  if (duoi === '.html') than = Buffer.from(than.toString('utf8').replace('</body>', NAP_LAI + '\n</body>'));

  res.writeHead(200, { 'Content-Type': kieu, 'Cache-Control': 'no-store' });
  res.end(than);
});

/* Địa chỉ máy trong MẠNG NỘI BỘ, để mở thử trên điện thoại.
   localhost chỉ có nghĩa với chính cái máy đang chạy lệnh; gõ nó trên điện
   thoại là điện thoại tự tìm chính nó, không ra gì cả. Phải là địa chỉ IP của
   laptop trong mạng WiFi nhà.

   Lọc bỏ interface ảo (Docker, VPN, máy ảo): chúng cũng có IPv4 nội bộ nhưng
   điện thoại không vào được, mà in ra thì người dùng thử nhầm cái đó trước. */
function diaChiMang() {
  const ra = [];
  for (const [ten, ds] of Object.entries(os.networkInterfaces())) {
    if (/^(docker|br-|veth|virbr|vmnet|utun|tun|tap|lo)/i.test(ten)) continue;
    for (const n of ds || []) {
      if (n.family === 'IPv4' && !n.internal) ra.push({ ten, ip: n.address });
    }
  }
  return ra;
}

console.log(mau.dam('\n  Dựng lần đầu…'));
dung();

/* listen(CONG) không kèm địa chỉ ⇒ Node nghe trên MỌI interface, nên máy khác
   trong cùng WiFi vào được ngay. Nếu đổi thành listen(CONG, '127.0.0.1') thì
   chỉ chính máy này vào được, điện thoại chịu. */
may.listen(CONG, () => {
  console.log(`  ${mau.xanh('▸')} ${mau.dam(`http://localhost:${CONG}`)}   ${mau.mo('máy này')}`);

  const mang = diaChiMang();
  if (mang.length) {
    mang.forEach((m) => {
      console.log(`  ${mau.xanh('▸')} ${mau.dam(`http://${m.ip}:${CONG}`)}` +
        `   ${mau.mo('điện thoại — cùng WiFi, gõ nguyên địa chỉ này')}`);
    });
  } else {
    console.log(mau.mo('    (không thấy địa chỉ mạng nào — máy đang không nối WiFi/LAN?)'));
  }

  console.log(mau.mo('\n    đang theo dõi content/ · src/ · public/ — lưu file là trang tự tải lại'));
  console.log(mau.mo('    máy tính và điện thoại phải chung một mạng WiFi'));
  console.log(mau.mo('    Ctrl+C để dừng\n'));
});
