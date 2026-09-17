# SEO và thẻ chia sẻ

Hai chuyện khác nhau, hay bị gộp làm một:

| | Ai đọc | Hiện ra ở đâu |
|---|---|---|
| **SEO** | Google | trang kết quả tìm kiếm |
| **Thẻ chia sẻ** | Facebook · Messenger · Zalo · iMessage · Threads | ô xem trước khi dán link |

Trang này dựng sẵn cả hai. Chỗ cần người quyết chỉ có ba: **tiêu đề**, **tóm
tắt**, **ảnh bìa** — và cả ba đều gõ được thẳng ở `/z-admin/`, có bảng
**Search & sharing** đo ngay lúc gõ.

---

## Dán link mà ra một ô trắng — vì sao

Đây là chuyện hay gặp nhất, và phản xạ đầu tiên thường sai. Trước khi sửa gì,
**xem thật** trang ấy đang trả về cái gì:

```bash
curl -sA facebookexternalhit/1.1 https://z-in-borderland.com/posts/tan-man/thu-bay-khong-co-gi/ | grep -o '<meta[^>]*og:[^>]*>'
```

Có đủ `og:title`, `og:description`, `og:image` là **phía trang không thiếu gì**.
Lúc ấy nguyên nhân nằm ở một trong hai chỗ dưới.

### 1. Họ nhớ kết quả cũ

Facebook, Messenger và Zalo quét một đường dẫn **một lần** rồi nhớ lại hàng
tuần — kể cả khi lần quét ấy ra một ô trắng. Trang từng được dán đi trước lúc
có ảnh bìa thì ô trắng ấy còn nằm trong bộ nhớ của họ, dù nay đã sửa xong.

Bắt quét lại:

| Chỗ | Cách |
|---|---|
| Facebook · Messenger | [Sharing Debugger](https://developers.facebook.com/tools/debug/) → dán link → **Scrape Again** |
| Zalo | [Zalo Link Preview](https://developers.zalo.me/tools/preview-link) → dán link → làm mới |
| Threads · X | [Card Validator](https://cards-dev.twitter.com/validator) |
| iMessage | nhớ ngay trên máy, không có nút xoá. Đổi link một chút (thêm `?x=1`) để thử bản mới |

Sau khi bấm Scrape Again mà vẫn trắng thì lỗi mới thật sự nằm ở trang.

### 2. Bài chưa có ảnh bìa

Không có `cover` thì trang lấy tấm og chung — vẫn ra thẻ, nhưng ba bài dán liền
nhau ra ba thẻ giống hệt nhau. `npm run kiem` nhắc từng bài còn thiếu.

---

## Bộ dựng in ra những gì

Tự động, không phải khai ở đâu (xem `ogThemHTML` trong `tools/build.mjs`):

- `og:title` · `og:description` · `og:url` · `og:type` · `og:site_name` · `og:locale`
- `og:image` kèm **`og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt`**
- `twitter:card` · `twitter:title` · `twitter:description` · `twitter:image`
- `article:published_time` · `article:author` · `article:section` · `article:tag`
- JSON-LD nối thành một đồ thị (`Article` → `WebSite` → `Person`)
- `sitemap.xml`, `feed.xml`, `robots.txt`, thẻ `canonical`

**Hai dòng khổ ảnh là dòng quan trọng nhất trong danh sách trên.** Bộ quét của
mấy ứng dụng nhắn tin có hạn giờ rất ngắn: không biết trước khổ ảnh thì nó phải
tải nguyên tấm về rồi giải mã để đo — một lượt gọi mạng nữa — và phần lớn bỏ
luôn tấm ảnh thay vì chờ. Kết quả đúng là ô chỉ có tên miền.

---

## Ảnh bìa

Thả thẳng vào ô **Cover image** ở `/z-admin/`. Trình duyệt tự thu nhỏ còn
1800px và đổi sang WebP trước khi gửi, nên ảnh gốc nặng bao nhiêu cũng được.

- **Tỉ lệ 1,91:1** (1200×630). Ô thả dựng đúng khổ ấy, nên nhìn là biết tấm này
  bị cắt mất phần nào.
- **Dưới 400 KB** — `npm run kiem` nhắc nếu quá.
- **Luôn gõ dòng mô tả.** Đó là thứ trình đọc màn hình đọc lên, và là thứ Google
  dùng để biết ảnh vẽ gì.
- Ảnh vào kho mã ngay, nhưng **địa chỉ thật chỉ có sau khi Cloudflare dựng
  xong** — khoảng một phút. Trong ô soạn thảo thì thấy ngay.

---

## Bảng Search & sharing

Nằm ngay dưới ô soạn thảo ở `/z-admin/`, đóng sẵn. Nắp bảng nói luôn có gì cần
mở ra hay không.

| Dấu | Nghĩa |
|---|---|
| `×` | làm hỏng một thứ có thật — thẻ chia sẻ trắng, ảnh không ai đọc được |
| `!` | nên hơn được, nhưng không hỏng |
| `✓` | ổn |

Chín phép đo: tiêu đề · tóm tắt · đường dẫn · ảnh bìa · mô tả bìa · ảnh trong
bài thiếu mô tả · tiêu đề mục · độ dài bài · tag. Khối xem trước ở trên cùng
cắt đúng chỗ Google cắt — một con số "64 ký tự" không nói được bằng việc nhìn
thấy câu của mình cụt mất ba chữ cuối.

---

## Một việc nên làm một lần

Mở `site.config.json`, điền `mangXaHoi` — địa chỉ Facebook / Instagram /
LinkedIn của chính chủ trang. Đó là thứ Google dựa vào nhiều nhất để nối cái
tên trên blog với một người có thật.
