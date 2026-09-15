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

## Cài đặt

Các bước bấm ở đâu, điền gì — xem **`docs/CAI-DAT.md` §1**. Để một chỗ thôi cho
khỏi lệch: hai bản hướng dẫn song song thì sớm muộn một bản được sửa còn bản
kia không.

File này lo phần còn lại: cơ chế, cách trả lời, cách chống spam, và chỗ hay hỏng.

---

## Trả lời — cây hai tầng

### Cột trong Sheet

Ba cột quyết định chuyện lồng nhau:

| Cột | Nghĩa |
|---|---|
| `Ma` | mã riêng của mỗi bình luận, script tự sinh |
| `Tra loi cho` | mã của bình luận cha. **Để trống ⇒ bình luận gốc** |
| `Chu trang` | đánh `x` ⇒ hiện huy hiệu **AUTHOR** |

Sheet lập từ bản cũ chỉ có 7 cột. **Không phải sửa tay**: script tự thêm cột
còn thiếu vào cuối ở lần chạy sau. Nó chỉ THÊM, không bao giờ đổi hay xoá cột
đang có.

### Chỉ hai tầng, y như Facebook

Trả lời của trả lời cũng được kéo về gắn vào bình luận **gốc** của nhánh đó.
Cho lồng vô hạn thì trên màn hình 390px, tới tầng thứ tư là cột chữ còn khoảng
120px — mỗi dòng ba chữ.

### Gấp bớt

Một bình luận có quá **2** trả lời thì phần cũ gấp lại sau nút
`Show N earlier replies`. Không gấp thì một nhánh 15 trả lời đẩy mọi bình luận
khác xuống tận đáy trang.

### Cả khối cũng đóng mở được

Đầu khối là một cái nút. Mặc định **mở** — giấu bình luận đi thì người đọc
không biết là có, và Google cũng không đọc được chữ trong đó. Nút chỉ để ai
muốn gấp cho gọn thì gấp.

### Mã cha phải có thật VÀ đã duyệt

Script kiểm điều này trước khi ghi. Gửi mã bịa thì bỏ mã đi, coi như bình luận
gốc. Hai lý do:

- mã bịa ⇒ bình luận rơi vào một nhánh không tồn tại, trang dựng cây xong là nó
  biến mất, người gửi tưởng bị nuốt bài
- mã của bình luận **chưa duyệt** ⇒ người ngoài dò được bình luận nào đang nằm
  chờ, tức là lộ thứ chưa công khai

Thà tụt xuống thành bình luận gốc — vẫn hiện, vẫn đúng chỗ — còn hơn mất hẳn.

### Một cái form, đem đi chỗ khác

Bấm `Reply` thì chính cái form đang có được **di chuyển** xuống dưới bình luận
đó, kèm dòng `Replying to <tên>` và một dấu ✕ để thôi.

Dựng mỗi bình luận một form thì mười bình luận là mười cái form, mười bộ ô nhập
trùng tên, và người dùng bàn phím phải Tab qua tất cả.

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
