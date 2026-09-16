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

`lat-cat.svg` — **cả vòng kể trên MỘT tấm.** Lưới 5×5, 25 mốc cách nhau 4%,
mỗi ô ghi phần trăm và tên chặng. Xem hết câu chuyện mà không phải mở 25 file
hay ngồi chờ hoạt hình chạy tới đoạn mình cần. Đây là tấm để in ra dán tường,
hoặc gửi cho ai muốn hiểu logo này từ đâu ra.

> Mỗi ô là một `<svg>` LỒNG chứ không phải một nhóm: ở mấy mốc đang phóng to
> rồi vỡ, hình vượt hẳn khỏi khung 48×48 — bông hoa căng 1,34 lần và mười tám
> hạt bụi bay ra tới rìa. `<svg>` lồng nhau tự cắt theo khung của nó, đúng cách
> trình duyệt cắt logo thật trên trang.

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

### Hai cái bẫy đã vấp, ghi lại để khỏi vấp lần nữa

**Đừng dừng hoạt hình bằng `animation-delay` âm.** Cách ấy đúng cho MỘT khung,
nhưng hoạt hình đã tạm dừng rồi thì trình duyệt không tính lại mốc khi
`animation-delay` đổi — mọi khung sau đều kẹt ở thời điểm của lần dừng đầu
tiên. Trên tấm lát cắt nó hiện ra thành cả lưới bị xê đi vài ô, mà xê ĐỀU nhau
nên nhìn thoáng qua vẫn tưởng đúng. Dùng `getAnimations()` rồi đặt thẳng
`currentTime`.

**Gốc phép xoay phải đọc từ chính phần tử.** Không phải phần tử nào cũng lấy
tâm khung làm gốc: hai cánh sao mandala xoay bằng thuộc tính `rotate(45 24 24)`
đã gói sẵn tâm, còn hạt bụi thì lấy tâm của chính nó. Gõ cứng một con số cho
tất cả thì mấy cánh ấy bị dời tâm hai lần, và hiện ra thành một vòng vô cực
thừa nằm lệch hẳn ra ngoài bông hoa.

### Ba file làm việc đó

| File | Chạy ở đâu | Làm gì |
|---|---|---|
| `trich-logo.js` | bảng điều khiển của **trình duyệt** | dừng hoạt hình ở từng mốc, đọc trạng thái thật, tải từng khung về máy |
| `dung-logo-dong.mjs` | `node` | gộp markup trong `dist/index.html` với đúng phần CSS của logo → `logo-dong.svg` |
| `dung-lat-cat.mjs` | `node` | xếp 25 khung đã trích thành một tấm lưới 5×5 → `lat-cat.svg` |

### Các bước

```bash
npm run build && npm run dev
```

1. Mở trang chủ, mở bảng điều khiển của trình duyệt.
2. Dán trọn `trich-logo.js` vào rồi Enter. Nó tải mười hai file `.svg` về thư
   mục Tải về — lần đầu trình duyệt sẽ hỏi có cho tải nhiều file không, bấm
   cho. Chép chúng đè lên `docs/logo/`.
3. Dựng file động:
   ```bash
   node docs/logo/dung-logo-dong.mjs
   ```
4. **Tấm lát cắt** cần 25 khung chứ không phải 12. Trước khi dán bộ trích,
   khai mốc riêng:
   ```js
   window.__KHUNG = Array.from({length: 25}, (_, i) =>
     [i * 4, 'f' + String(i * 4).padStart(2, '0') + '.svg', 'mốc ' + (i * 4) + '%']);
   ```
   Chép 25 file ấy vào `docs/logo/_khung/` rồi:
   ```bash
   node docs/logo/dung-lat-cat.mjs
   ```
   `_khung/` là thư mục tạm, đã nằm trong `.gitignore`.

> **Bộ trích KHÔNG ghi thẳng vào đĩa, và cố ý vậy.** Bản đầu POST từng khung về
> một đường `/__luu` của máy chủ dev — mà máy chủ ấy không có đường đó, nên mỗi
> khung lặng lẽ nhận 404, bảng kết quả vẫn in đủ mười hai dòng, còn trên đĩa
> không có gì. Mở cho trang web ghi thẳng vào đĩa là mở một cửa không đáng mở,
> chỉ để phục vụ một việc vài tháng làm một lần.

Giữ nguyên mười hai mốc phần trăm ở bảng trên thì bộ ảnh mới so sánh được với
bộ cũ.
