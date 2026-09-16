# LOGO — bản lưu từng trạng thái

Mười hai khung tĩnh cắt ra từ vòng kể 27 giây, cộng một file chạy được trọn
vòng. Tất cả là **SVG**: phóng to bao nhiêu cũng nét, và mở bằng trình duyệt là
xem được, không cần cài gì.

> Mấy file này **trích từ chính hoạt hình đang chạy trên trang**, không phải vẽ
> lại. Hình dáng, độ mờ, phép xoay, đường nét đứt — đều đọc ra từ trạng thái
> thật của trình duyệt tại đúng mốc ấy. Nên nếu logo đổi mà quên dựng lại bộ
> này, hai bên sẽ lệch nhau — xem mục *Dựng lại* ở cuối.

---

## Vòng kể, và mười hai chặng

| File | Mốc | Đang xảy ra chuyện gì |
|---|---|---|
| `01-nghi.svg` | 0% | **Trạng thái nghỉ.** Đoá mandala tám cánh với ba vành đồng tâm — đây là logo thật, hình mà người đọc thấy chín phần mười thời gian |
| `02-ba-vach.svg` | 10% | Ba vạch dài ngắn khác nhau: tên blog nhìn từ rất xa, trước khi nó bóp lại còn một điểm |
| `03-chu-z.svg` | 22% | Nét gấp khúc hình chữ **Z** vẽ dần ra, đứng thẳng |
| `04-da-giac.svg` | 30% | Nét nối (chữ **i**) quét vào, chạm đúng hai đầu tự do của chữ Z → khép thành vô cực dạng đa giác |
| `05-xoay-ngang.svg` | 36% | Cả cụm xoay ngang |
| `06-vo-cuc-1.svg` | 44% | Đa giác bo góc dần thành **vô cực thứ nhất** |
| `07-chu-b.svg` | 50% | Chữ **B** vẽ ra bên trên; vô cực thứ nhất lùi lại còn ba phần mười độ đậm để hai nét không lẫn vào nhau |
| `08-hai-vo-cuc.svg` | 58% | Bụng dưới chữ B vòng ra thành **vô cực thứ hai** — bốn cánh |
| `09-mandala-no.svg` | 66% | Bốn cánh nở thành **tám**, ba vành hiện ra: mandala đủ hình |
| `10-xoay.svg` | 80% | Đang xoay. Hai tầng cánh chạy lệch nhau, ba vành quay ba tốc độ khác dấu |
| `11-vo.svg` | 90% | **Vỡ** — mười tám hạt bụi toả ra theo phương bán kính |
| `12-tu-lai.svg` | 97% | Bụi tan, mandala tụ lại. Vòng khép kín, sắp kể lại từ đầu |

`logo-dong.svg` — **trọn vòng, tự chạy.** Mở bằng trình duyệt là nó kể lại từ
đầu tới cuối rồi lặp. Không cần trang web, không cần mạng, không cần phông chữ.
File này gói sẵn cả markup lẫn đúng phần CSS của logo, nên nó đứng một mình
được — kéo vào Figma, nhúng vào slide, gửi cho ai cũng chạy.

---

## Vì sao là SVG chứ không phải PNG hay GIF

- **Nét vẽ, không phải điểm ảnh.** Logo này toàn là đường nét; SVG giữ đúng
  đường nét ấy, phóng lên bảng hiệu cũng không vỡ.
- **Nhẹ.** Cả bộ mười ba file chưa tới 60 KB. Một ảnh GIF cùng độ mượt đã vài
  trăm KB, mà vẫn mờ khi phóng to.
- **Đọc được bằng mắt thường.** Mở file bằng trình soạn thảo là thấy từng
  đường, từng màu. Mười năm nữa vẫn mở ra được — không phụ thuộc phần mềm nào.
- **GIF thì sao?** Cần được thì mở `logo-dong.svg` trong trình duyệt rồi quay
  màn hình. Máy dựng bộ này không có sẵn công cụ tạo GIF, và bản SVG hơn hẳn ở
  mọi mặt trừ chuyện xem trước trong Finder.

Bản đứng yên dùng làm gì: ảnh đại diện, favicon cỡ lớn, ảnh bìa mạng xã hội,
slide, in ấn. Bản động dùng khi cần cho ai đó xem *câu chuyện* — nó mới là thứ
giải thích vì sao logo lại có hình ấy.

---

## Màu

Mọi file chốt cứng màu mực của theme Sakura (`#7A52B8`), vì file đứng một mình
thì `currentColor` không còn trỏ vào đâu.

Muốn đổi màu: mở file bằng trình soạn thảo, thay hết `#7a52b8`. Với
`logo-dong.svg` thì sửa đúng một dòng ở đầu khối `<style>`:

```css
svg{color:#7A52B8;background:#FAF6FD}
```

---

## Dựng lại khi logo đổi

Bộ này **không tự cập nhật**. Sửa logo xong thì phải trích lại, không thì bản
lưu kể một chuyện còn trang web kể một chuyện khác.

Cách dựng lại nằm ngoài quy trình `npm run` vì nó cần một trình duyệt thật:
bộ trích đọc `getComputedStyle().d` để lấy đường đang biến hình giữa chừng —
`getAttribute('d')` chỉ trả về hình gốc, và không công cụ dòng lệnh nào ở đây
tính được phép biến hình của thẻ `<animate>`.

Các bước:

1. `npm run build && npm run dev`
2. Mở trang chủ, mở bảng điều khiển của trình duyệt
3. Chạy bộ trích (nó dừng hoạt hình ở từng mốc rồi ghi ra từng file)
4. Chạy bộ dựng file động (gộp markup với phần CSS của logo)

Giữ nguyên mười hai mốc phần trăm ở bảng trên thì bộ ảnh mới so sánh được với
bộ cũ.
