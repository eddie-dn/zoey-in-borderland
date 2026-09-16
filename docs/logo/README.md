# LOGO — bản lưu từng trạng thái

Mười hai khung tĩnh cắt ra từ vòng kể 27 giây, cộng một file chạy được trọn
vòng. Tất cả là **SVG**: phóng to bao nhiêu cũng nét, và mở bằng trình duyệt là
xem được, không cần cài gì.

> Mấy file này **trích từ chính hoạt hình đang chạy trên trang**, không phải vẽ
> lại. Hình dáng, độ mờ, phép xoay, đường nét đứt — đều đọc ra từ trạng thái
> thật của trình duyệt tại đúng mốc ấy. Nên nếu logo đổi mà quên dựng lại bộ
> này, hai bên sẽ lệch nhau — xem mục *Dựng lại* ở cuối.

---

## Vòng kể, và mười bốn chặng

| File | Mốc | Đang xảy ra chuyện gì |
|---|---|---|
| `01-nghi.svg` | 2% | **Trạng thái nghỉ.** Đoá mandala tám cánh ĐẦU NHỌN với ba vành đồng tâm — đây là logo thật, hình mà người đọc thấy chín phần mười thời gian |
| `02-ba-vach.svg` | 11% | Ba vạch dài ngắn khác nhau: tên blog nhìn từ rất xa, trước khi nó bóp lại còn một điểm |
| `03-chu-z.svg` | 19% | Nét gấp khúc hình chữ **Z** vẽ dần ra, còn đứng |
| `04-xoay-ngang.svg` | 24% | Chữ Z tự xoay ngang — một mình, trước khi có gì nối vào |
| `05-net-noi.svg` | 29% | Nét nối (chữ **i**) hiện ra, **đứng thẳng giữa khung** |
| `06-chiec-no.svg` | 33,5% | Nét nối ngả xuống, khép hai đầu tự do của chữ Z thành **chiếc nơ** bốn cạnh thẳng |
| `07-bo-tron.svg` | 37% | Chiếc nơ **đang bo tròn**; nét nối tan dần vào chỗ giao ở giữa |
| `08-chu-b.svg` | 41% | Chữ **B** vẽ ra bên trên; vô cực thứ nhất lùi lại còn ba phần mười độ đậm |
| `09-hai-vo-cuc.svg` | 46% | Bụng dưới chữ B vòng ra thành **vô cực thứ hai** — bốn cánh |
| `10-mandala-no.svg` | 49,5% | Bốn cánh **mở ra** thành tám: cụm cánh sao xoay tách khỏi hai vô cực gốc |
| `11-danh-net.svg` | 53% | **Đanh nét** — tám đầu cánh nhọn lên cùng một lúc, rồi mới xoay |
| `12-xoay.svg` | 70% | Đang xoay. Hai tầng cánh chạy lệch nhau, ba vành quay ba tốc độ khác dấu |
| `13-vo.svg` | 81,5% | **Vỡ** — xoáy nhoè rồi mười tám hạt bụi toả ra theo phương bán kính |
| `14-tu-lai.svg` | 84% | Bụi tan, mandala tụ lại. Vòng khép kín, rồi đứng yên 6,2 giây trước khi kể lại |

> Mười hai mốc của đời trước không còn dùng được: vòng kể đã đổi hẳn từ bản
> V9.00–V10.01 (xoay trước rồi mới nối · giữ hình nơ · mở tám cánh ra từ bốn ·
> đanh nét · xoáy nhoè rồi nổ). Bốn nấc mới ấy là bốn khoảnh khắc riêng, gộp
> vào mười hai mốc cũ thì mất đúng những chỗ vừa thêm vào.

`lat-cat.svg` — **cả vòng trên một tấm.** Lưới 5 cột, mười bốn ô theo đúng thứ
tự bảng trên, mỗi ô ghi mốc phần trăm và tên chặng. Mở một file là đọc hết cả
vòng kể, không phải mở mười bốn file hay ngồi chờ hoạt hình chạy.

Bản cũ từng bị xoá: nó là lưới 5×5 dựng từ 25 mốc cách đều của vòng kể CŨ, nên
nó kể một chuyện khác hẳn thứ đang chạy trên trang — mà một bản lưu sai còn tệ
hơn không có bản lưu nào. Bản này dựng thẳng từ mười bốn file khung nằm cạnh
nó, nên nó không thể lệch khỏi chúng được nữa.

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
| `dung-lat-cat.mjs` | `node` | xếp 14 file khung cạnh nó thành một tấm lưới 5 cột → `lat-cat.svg` |

### Các bước

```bash
npm run build && npm run dev
```

1. Mở trang chủ, mở bảng điều khiển của trình duyệt.
2. Dán trọn `trich-logo.js` vào rồi Enter. Nó tải mười bốn file `.svg` về thư
   mục Tải về — lần đầu trình duyệt sẽ hỏi có cho tải nhiều file không, bấm
   cho. Chép chúng đè lên `docs/logo/`.
3. Dựng file động:
   ```bash
   node docs/logo/dung-logo-dong.mjs
   ```
4. Dựng tấm lát cắt:
   ```bash
   node docs/logo/dung-lat-cat.mjs
   ```
   Không cần trình duyệt và không cần thư mục tạm nào: nó đọc thẳng mười bốn
   file khung vừa chép vào ở bước 2. Bản trước đọc 25 file trong `docs/logo/_khung/`
   — một thư mục tạm phải tự tay dựng lấy, và nó thành lối chết ngay khi vòng
   kể đổi sang mười bốn chặng có tên.

   Đổi mốc hay đổi tên chặng thì sửa bảng `KHUNG` ở **cả hai** file: `trich-logo.js`
   (để trích đúng khung) và `dung-lat-cat.mjs` (để ghi đúng nhãn). Lệch nhau thì
   hình vẫn đúng mà con số nói sai — loại sai khó thấy nhất.

> **Bộ trích KHÔNG ghi thẳng vào đĩa, và cố ý vậy.** Bản đầu POST từng khung về
> một đường `/__luu` của máy chủ dev — mà máy chủ ấy không có đường đó, nên mỗi
> khung lặng lẽ nhận 404, bảng kết quả vẫn in đủ mười hai dòng, còn trên đĩa
> không có gì. Mở cho trang web ghi thẳng vào đĩa là mở một cửa không đáng mở,
> chỉ để phục vụ một việc vài tháng làm một lần.

Giữ nguyên mười hai mốc phần trăm ở bảng trên thì bộ ảnh mới so sánh được với
bộ cũ.
