# GIỮ RIÊNG TƯ — mã nguồn và nội dung

> Hai việc khác hẳn nhau về bản chất, nên để riêng hai phần:
>
> **§1 giấu MÃ NGUỒN** — làm được triệt để.
> **§2 giữ NỘI DUNG** — chỉ làm được đến mức gờ giảm tốc. Nói rõ ở §2.1 vì sao.

---

## 1 · GIẤU MÃ NGUỒN — đặt repo thành riêng tư

Đây là câu trả lời đầy đủ, và là câu trả lời **duy nhất** có tác dụng thật.
Không có mẹo nào khác: repo công khai thì ai cũng tải nguyên bộ về được.

### 1.1 · Cách làm — 4 bước

1. Mở repo trên GitHub → **Settings**
2. Kéo xuống cuối, mục **Danger Zone**
3. **Change repository visibility** → **Make private**
4. Gõ tên repo để xác nhận

Xong. Từ lúc đó `content/`, `src/`, `tools/`, bài nháp — không ai thấy được.

### 1.2 · Cloudflare Pages vẫn deploy được từ repo riêng tư

Gói miễn phí của Cloudflare Pages deploy repo private bình thường. Không phải
đổi gì, không phải trả tiền.

Nếu sau khi đổi sang private mà Cloudflare báo mất quyền: dash.cloudflare.com →
Workers & Pages → dự án → **Settings** → **Build** → **Manage GitHub app**, rồi
cấp quyền cho repo private trong trang GitHub hiện ra.

### 1.3 · Repo riêng tư giấu được gì — và KHÔNG giấu được gì

| Thứ | Repo private có giấu không |
|---|---|
| File `.md` gốc, front matter, ghi chú trong code | **Có** |
| Bài `draft: true` | **Có** |
| `tools/`, `src/`, cấu hình, lịch sử commit | **Có** |
| Chữ trong bài đã đăng | **Không** — nó phải gửi tới trình duyệt thì người ta mới đọc được |
| CSS, JavaScript của trang | **Không** — cùng lý do |
| Ảnh đã đăng | **Không** |

Đây không phải thiếu sót của GitHub hay của blog này. **Một trang web muốn hiển
thị được thì phải gửi nội dung xuống máy người đọc.** Chuyện đó không né được.

### 1.4 · Bản nháp KHÔNG còn lên mạng nữa

Trước V1.1.3, bài `draft: true` vẫn được dựng ra file và đẩy lên máy chủ, chỉ
gắn thẻ `noindex`. Nhưng `noindex` chỉ bảo Google **đừng đánh chỉ mục** — file
vẫn nằm công khai, ai đoán trúng đường dẫn là đọc được.

Nay `npm run build` **không ghi bản nháp ra `dist/`**. Muốn xem thử ở máy mình
thì `npm run dev` (nó tự thêm cờ `--nhap`), hoặc:

```bash
node tools/build.mjs --nhap
```

Bộ kiểm định có một phép canh việc này, nên lỡ tay cũng không lọt.

### 1.5 · Repo riêng tư KHÔNG làm mất SEO — một chút cũng không

Đây là chỗ dễ lo nhầm nhất, nên nói rõ: **hai việc này không liên quan gì nhau.**

```
GitHub repo  ──(Cloudflare dựng)──►  Trang web  ──(Google đọc)──►  Kết quả tìm kiếm
   private                        công khai
```

Google **không bao giờ đọc repo** của anh. Nó đọc **trang web đã dựng** — tức
là `dist/`, thứ Cloudflare phục vụ công khai. Repo private hay public, Google thấy
y hệt nhau.

| | Repo private | SEO |
|---|---|---|
| Bài đã đăng | giấu file `.md` gốc | vẫn được Google đọc đủ |
| `sitemap.xml`, `robots.txt`, RSS | không liên quan | vẫn công khai, vẫn hoạt động |
| Ảnh bìa, thẻ chia sẻ | không liên quan | vẫn hiện bình thường |

Nói cách khác: **giấu nguyên liệu, vẫn bày món ăn.** Anh giấu bản thảo, ghi chú,
bài nháp và mã dựng; còn bài đã đăng thì vẫn mở toang cho Google và người đọc.

Cả phần kèm nguồn khi chép (§2.2) cũng không ảnh hưởng SEO — Google đọc HTML
chứ không bôi đen rồi Ctrl+C.

Chi tiết trang đã được tối ưu SEO những gì: `docs/DUA-LEN-MANG.md` §7.

### 1.6 · Ba thứ đừng bao giờ để trong repo, kể cả repo riêng tư

- **Mã, mật khẩu, khoá API.** Repo private hôm nay có thể thành public ngày mai,
  và lịch sử commit thì giữ mãi mọi thứ từng có mặt.
- **Địa chỉ Apps Script của khung bình luận** thì để trong `site.config.json`
  bình thường — nó vốn đã công khai trong HTML rồi, giấu cũng vô nghĩa.
- **File `.env`.** Dự án này không dùng, nhưng nếu sau có thì thêm vào
  `.gitignore` ngay từ đầu.

---

## 2 · GIỮ NỘI DUNG — chặn chép

### 2.1 · Nói thẳng: không chặn được

Chữ trên trang đã nằm sẵn trong máy người đọc — đó là **điều kiện để họ đọc
được nó**. Mọi cách "chống copy" đều bị đi vòng trong vài giây:

| Cách đi vòng | Mất bao lâu |
|---|---|
| `Ctrl+U` xem mã nguồn | 1 giây |
| Chế độ Đọc của Safari / Firefox | 1 giây, bỏ sạch mọi CSS và JS |
| Tắt JavaScript | 5 giây |
| DevTools → copy element | 5 giây |
| In ra PDF | 5 giây |
| Chụp màn hình rồi OCR | 30 giây |

Nên đừng đầu tư vào việc chặn. Ba thứ **cố ý không làm** trong blog này, vì hại
nhiều hơn lợi:

**Không đặt `user-select: none`.** Nó chặn luôn người đọc bình thường muốn trích
một câu gửi bạn. Nó cũng chặn người dùng trình đọc màn hình, công cụ dịch, và
những người quen bôi đen để dò dòng khi đọc bài dài.

**Không chặn chuột phải.** Không ngăn được ai, chỉ làm phiền người muốn mở link
ra tab mới.

**Không chặn `Ctrl+C`.** Trích một câu là chuyện bình thường và nên dễ.

### 2.2 · Cái thật sự làm được: chép dài thì kèm nguồn

Nhắm vào trường hợp thường gặp nhất — người bôi đen cả bài rồi dán sang chỗ
khác mà quên ghi nguồn. Không phải kẻ cố tình ăn cắp, mà là người lười.

| Chép gì | Xảy ra gì |
|---|---|
| Dưới 220 ký tự | **Không đụng.** Trích một câu vẫn nguyên vẹn. |
| Khối mã `<pre>` | **Không đụng.** Mã sinh ra để chép. |
| Header, chân trang | **Không đụng.** Không phải nội dung bài. |
| **Cả bài** | Clipboard tự có thêm một dòng nguồn ở cuối |

Dán ra được:

```
…phần chữ vừa chép…

— Vô thức tập thể, và cái cớ để tin vào giấc mơ
Đọc bản đầy đủ tại: https://…/posts/tam-ly/vo-thuc-tap-the/
```

Dán vào Word hay Google Docs thì dòng nguồn là một **liên kết bấm được**, vì
script đặt cả `text/html` chứ không chỉ `text/plain`.

### 2.3 · Chỉnh trong `site.config.json`

```json
"baoVeChu": {
  "bat": true,
  "nguong": 220,
  "gioiHan": 0,
  "loiNhac": "Đọc bản đầy đủ tại"
}
```

| Khoá | Nghĩa |
|---|---|
| `bat` | `false` để tắt hẳn — script cũng không được nạp |
| `nguong` | Từ bao nhiêu ký tự trở lên mới can thiệp. Thấp quá thì phiền người trích chính đáng; 200–300 là vừa |
| `gioiHan` | `0` = không cắt, chỉ thêm nguồn. Số `> 0` = rút gọn đoạn chép còn bấy nhiêu ký tự, cắt ở ranh giới từ, và hiện một dòng báo cho người đọc biết |
| `loiNhac` | Chữ đứng trước địa chỉ trong dòng nguồn |

:::warn Cân nhắc trước khi đặt `gioiHan` > 0
Cắt bớt đoạn chép làm phiền cả người trích chính đáng, mà người cố tình lấy thì
vẫn lấy được bằng sáu cách ở §2.1. Em khuyên để `0` — chỉ thêm nguồn, không cắt.
:::

### 2.4 · Thứ thật sự bảo vệ nội dung

Không phải mã, mà là dấu vết:

- **Ghi rõ bản quyền ở chân trang** — đã có sẵn: `© 2026 Zoey`.
- **Đăng ở nhà mình trước.** Google nhìn ngày đánh chỉ mục để quyết định ai là
  bản gốc. Trang của anh có `sitemap.xml` và RSS nên được đọc sớm.
- **Dòng nguồn trong clipboard** (§2.2) khiến bản sao tự mang theo địa chỉ gốc.
- **Báo cáo khi bị chép** — Google có biểu mẫu gỡ nội dung vi phạm bản quyền,
  và nó có tác dụng thật với các trang chép lại.

---

## 3 · TRA NHANH

| Muốn | Làm gì |
|---|---|
| Giấu mã nguồn, bài nháp, ghi chú | Đặt repo **private** (§1.1) |
| Bài nháp không lên mạng | Đã tự động rồi (§1.4) |
| Chép cả bài thì kèm nguồn | Đã bật sẵn (§2.2) |
| Tắt hẳn phần kèm nguồn | `"baoVeChu": { "bat": false }` |
| Chặn hẳn việc chép | **Không làm được** — xem §2.1 |
| Vừa giấu nguồn vừa lên top Google | Được, không xung đột — xem §1.5 |
