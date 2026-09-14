# KHUNG BÌNH LUẬN — cài đặt

> Blog là trang tĩnh, không có máy chủ. Khung bình luận chạy nhờ **Google Apps
> Script** đứng làm máy chủ, và **Google Sheet** làm chỗ lưu. Không tốn tiền,
> không đăng ký dịch vụ nào, và dữ liệu nằm trong Drive của chính bạn.
>
> Làm một lần, chừng 10 phút. Sau đó không phải đụng lại.

---

## Cách nó chạy

```
Người đọc gõ bình luận
      ↓ POST
Google Apps Script  ──ghi──►  Google Sheet   (cột Duyệt để TRỐNG)
      ↑ GET                        │
Trang web  ◄────chỉ dòng đã duyệt──┘
```

**Không bình luận nào tự lên trang.** Mọi dòng vào Sheet đều nằm chờ tới khi
bạn tự tay đánh dấu duyệt. Đây là lớp chặn spam thật sự.

**Email không bao giờ ra khỏi Sheet.** Phần script trả bình luận về trang web
không hề đọc cột email — nên không có đường nào moi nó ra qua mạng. Email chỉ
để bạn liên hệ lại nếu muốn.

---

## Cài — 6 bước

### 1 · Tạo Google Sheet

Vào [sheets.new](https://sheets.new), đặt tên gì cũng được (ví dụ
`Blog — Bình luận`). Không phải tạo cột gì cả, script tự tạo ở lần chạy đầu.

### 2 · Mở trình soạn script

Trong Sheet đó: **Tiện ích mở rộng → Apps Script**
(Extensions → Apps Script).

### 3 · Dán mã

Xoá sạch nội dung đang có trong `Code.gs`, dán **toàn bộ** file
[`tools/apps-script/Code.gs`](../tools/apps-script/Code.gs) vào.

Bấm **Lưu** (biểu tượng đĩa mềm).

### 4 · Triển khai

**Triển khai → Bản triển khai mới** (Deploy → New deployment).

| Ô | Chọn |
|---|---|
| Loại | **Ứng dụng web** (Web app) |
| Thực thi với tư cách | **Tôi** (Me) |
| Ai có quyền truy cập | **Bất kỳ ai** (Anyone) |

:::warn Hai ô này phải đúng
**"Thực thi với tư cách: Tôi"** — để script có quyền ghi vào Sheet của bạn.
**"Ai có quyền truy cập: Bất kỳ ai"** — người đọc blog không đăng nhập Google,
nên để "Bất kỳ ai có tài khoản Google" là họ gửi không được.
:::

Google sẽ hỏi cấp quyền ở lần đầu. Màn hình cảnh báo "Google chưa xác minh ứng
dụng này" là bình thường — đây là script của chính bạn, không phải của ai khác.
Bấm **Nâng cao → Đi tới … (không an toàn)** rồi **Cho phép**.

### 5 · Chép địa chỉ vào cấu hình

Sau khi triển khai xong, Google cho một địa chỉ dạng:

```
https://script.google.com/macros/s/AKfycb..................../exec
```

Dán vào `site.config.json`:

```json
"binhLuan": {
  "bat": true,
  "url": "https://script.google.com/macros/s/AKfycb.../exec",
  "loiMoi": "Ghé ngang thì để lại một dòng cũng được — không cần đăng ký gì cả."
}
```

### 6 · Dựng lại

```bash
npm run build
```

Xong. Mở một bài, kéo xuống cuối, thử gõ một dòng rồi mở Sheet xem đã có chưa.

---

## Duyệt bình luận

Mở Sheet. Mỗi bình luận là một dòng. Cột **Duyet** đang trống.

Muốn đăng dòng nào thì gõ **`x`** vào ô Duyet của dòng đó. Script nhận cả
`x` · `v` · `1` · `yes` · `ok` · ô đánh dấu (checkbox).

Không muốn đăng thì **cứ để trống** — nó nằm yên trong Sheet, không lên trang.
Muốn xoá hẳn thì xoá cả dòng.

Bình luận đã duyệt hiện ra ở lần tải trang kế tiếp. Không phải build lại.

:::tip Đọc Sheet trên điện thoại
Cài app Google Sheets rồi ghim file đó lại. Duyệt bình luận trở thành việc gõ
một chữ `x`, làm được lúc đang đợi xe.
:::

---

## Đổi mã sau này

Sửa `Code.gs` trong Apps Script rồi **Triển khai → Quản lý bản triển khai →
biểu tượng bút chì → Phiên bản: Mới → Triển khai**.

:::stop Đừng tạo bản triển khai MỚI khi chỉ sửa mã
Tạo bản mới là ra một địa chỉ khác, và bạn phải đi sửa `site.config.json` theo.
Cập nhật bản cũ thì địa chỉ giữ nguyên.
:::

---

## Chống spam

Bốn lớp, từ ngoài vào:

| Lớp | Chặn gì |
|---|---|
| **Ô bẫy** (`hp`) | Bot điền mọi ô nó thấy. Ô này người không nhìn thấy nên không bao giờ điền — ai điền vào là bot. Bị chặn nhưng vẫn báo "thành công" để bot tưởng xong việc và bỏ đi. |
| **Đồng hồ** | Mở form chưa tới 3 giây đã gửi thì không phải người gõ. |
| **Lọc thẻ HTML** | Mọi thẻ `<...>` bị bỏ ngay lúc ghi vào Sheet. |
| **Duyệt tay** | Lớp cuối và là lớp thật sự. Không gì lên trang mà bạn chưa đọc. |

Trang web cũng chèn bình luận bằng `textContent` chứ không phải `innerHTML` —
nên kể cả một dòng `<script>` lọt được vào Sheet, nó vẫn chỉ hiện ra dưới dạng
chữ thuần, không chạy được.

---

## Khi có chuyện

| Hiện tượng | Nguyên nhân |
|---|---|
| Bấm Gửi không có gì xảy ra, Console báo **CORS** | Ô "Ai có quyền truy cập" chưa để **Bất kỳ ai** |
| Gửi được nhưng Sheet trống | "Thực thi với tư cách" chưa để **Tôi** |
| Bình luận đã đánh `x` mà không lên trang | Sai cột — cột **Duyet** là cột thứ **6** |
| Khung hiện "chưa nối với máy chủ" | `binhLuan.url` trong `site.config.json` còn rỗng |
| Bình luận hiện ở **mọi** bài | Cột **Trang** trong Sheet bị sửa tay — nó phải khớp đúng đường dẫn bài |

---

## Tắt hẳn khung bình luận

```json
"binhLuan": { "bat": false }
```

Khung biến mất khỏi mọi bài, và file `comments.js` cũng không được nạp nữa.
