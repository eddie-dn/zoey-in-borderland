# SAO LƯU

> Mỗi Chủ nhật 21:00 giờ Việt Nam, trang gom `binh_luan` + `ghi_chu` + `xem`
> trong D1 rồi **hợp nhất** vào một Google Sheet trong Drive của chủ trang:
> dòng mới thêm vào, dòng đổi ghi đè, dòng không đổi để yên, dòng biến mất
> khỏi D1 thì đánh dấu chứ **không xoá**.
>
> Hai nửa: `functions/api/thu-bao.js` (hàm `chaySaoLuu`) và `tools/sao-luu.gs`
> (mã Apps Script). Hai nửa phải khớp nhau về hình dạng gói JSON.

---

## 1. Vì sao cần

D1 gói miễn phí **không có khôi phục theo thời điểm**. Xoá nhầm một dòng, chạy
nhầm một câu `DELETE` trong Console, hay tài khoản Cloudflare gặp chuyện — thì
không có đường lùi. Bình luận người đọc gõ và ghi chú viết trên điện thoại chỉ
tồn tại ở đúng một chỗ.

Đây là bản thứ hai, nằm ngoài Cloudflare.

**Vì sao là Google Sheet chứ không phải file `.xlsx` gửi qua mail.** File đính
kèm vẫn bắt phải NHỚ: nhớ kéo từ Gmail sang Drive, mỗi tuần. Cái gì cần nhớ
hằng tuần thì tuần thứ ba là quên. Sheet thì không có bước nào để quên — và nó
**cộng dồn**: mở ra thấy cả lịch sử, không phải đi tìm file của tuần nào.

**Vì sao không gọi thẳng Drive API.** Gọi thẳng thì Worker phải tự ký JWT RS256
bằng khoá service account, đổi lấy access token, rồi mới đẩy file — cộng một
GCP project, một khoá JSON, và một thư mục Drive phải chia sẻ đúng cho email
service account. Bốn chỗ để vấp lúc cài. Apps Script **chạy dưới danh nghĩa
chủ trang**, nên nó vốn đã có quyền ghi vào Drive của chính mình.

> **Đây không phải lần quay lại của Apps Script cũ.** `binh-luan.js` kể vì sao
> bỏ Apps Script: nó *đứng trên đường đọc*, mỗi người mở một bài đều phải đợi
> một lượt gọi sang Google. Chỗ này chạy **mỗi tuần một lần**, lúc không ai
> ngồi đó, và không người đọc nào chờ nó. Lý do bỏ hồi đó không áp vào đây.

---

## 2. Cài (một lần, ~10 phút)

### 2.1 · Tạo Apps Script

1. Mở [script.google.com](https://script.google.com) → **New project**
2. Xoá sạch mã mẫu trong `Code.gs`
3. Dán **toàn bộ** nội dung `tools/sao-luu.gs` vào
4. Đổi dòng đầu:

```javascript
const KHOA = 'DOI-CHUOI-NAY-DI';
```

thành một chuỗi ngẫu nhiên dài. Đừng nghĩ ra chữ có nghĩa — gõ bừa 30 ký tự,
hoặc lấy từ:

```bash
openssl rand -hex 24
```

**Chép chuỗi đó ra chỗ khác**, lát nữa phải dán lại vào Cloudflare.

5. Đặt tên project (góc trên trái) → **Save**

### 2.2 · Deploy thành web app

1. **Deploy** → **New deployment**
2. Bấm bánh răng cạnh "Select type" → chọn **Web app**
3. Điền:

| Ô | Chọn |
|---|---|
| Description | `sao luu zoey` |
| Execute as | **Me** — *bắt buộc*, đây là thứ cho script quyền ghi Drive của bạn |
| Who has access | **Anyone** |

4. **Deploy** → Google hỏi quyền → **Authorize access** → chọn tài khoản →
   màn hình cảnh báo "Google hasn't verified this app" thì bấm **Advanced** →
   **Go to … (unsafe)** → **Allow**

> Cảnh báo ấy là bình thường: script do chính bạn viết, chưa qua kiểm duyệt của
> Google, và nó chỉ xin quyền vào Drive của bạn.

5. Copy **Web app URL** — dạng
   `https://script.google.com/macros/s/AKfy…/exec`

**`Who has access` phải là `Anyone`.** Worker không đăng nhập Google được, nên
để "Only myself" là nó bị chặn — mà triệu chứng là trả về một trang HTML đăng
nhập, không phải một lỗi rõ ràng. Đó cũng chính là lý do phải có `KHOA`: cửa
mở cho mọi người thì chuỗi bí mật là thứ duy nhất giữ cửa.

### 2.3 · Đặt Secret ở Cloudflare

Worker `zoey-in-borderland` → **Settings** → **Runtime** →
**Variables and Secrets**:

| Name | Type | Value |
|---|---|---|
| `SAO_LUU_URL` | **Secret** | Web app URL vừa copy |
| `SAO_LUU_KHOA` | **Secret** | chuỗi `KHOA` ở bước 2.1 |

`SAO_LUU_URL` để Secret chứ không phải Text vì **ai biết địa chỉ là gửi được
dữ liệu rác vào Sheet của bạn** — nó là một cửa mở, không phải một cái tên.

Type phải là **`Secret`**. Chọn `Text` thì mỗi lượt deploy Wrangler xoá đi, vì
`wrangler.jsonc` là nguồn đúng duy nhất cho biến dạng Text và hai tên này
không có trong đó.

### 2.4 · Thử ngay

```bash
curl -X POST "https://z-in-borderland.com/api/thu-bao?viec=saoluu" \
  -H "x-gc-id: zoey" \
  -H "x-gc-key: KHOÁ-CHỦ-TRANG-CỦA-BẠN"
```

Trả về:

```json
{"ok":true,"dem":{"binh_luan":5,"ghi_chu":2,"xem":41},"coEmail":false,
 "sheet":"https://docs.google.com/spreadsheets/d/…"}
```

Mở đường dẫn `sheet` — file `zoey-in-borderland — sao lưu` đã nằm trong Drive
với trang **Mục lục** và ba tab dữ liệu theo ngày.

---

## 3. Bên trong file Sheet — sổ cái, không phải ảnh chụp

**Bốn tab, mãi mãi bốn tab.** Không sinh thêm tab theo ngày.

| Tab | Nội dung |
|---|---|
| **Mục lục** | Mỗi lượt sao lưu ghi **một dòng cho mỗi bảng**: động vào bao nhiêu dòng, đổi mấy dòng |
| `binh_luan` | Toàn bộ bình luận từng tồn tại |
| `ghi_chu` | Ghi chú đăng thẳng lên `/notes/` |
| `xem` | Bộ đếm lượt xem |

Mỗi lượt **hợp nhất** theo khoá chính (`ma` cho bình luận và ghi chú, `u` cho
lượt xem):

| Tình huống | Sổ làm gì |
|---|---|
| Dòng **mới** | Thêm vào cuối, `_trangThai = mới` |
| Dòng **đổi nội dung** | Ghi đè đúng dòng ấy, `_trangThai = đổi`, `_capNhat` cập nhật |
| Dòng **không đổi** | **Không đụng tới** — `_capNhat` giữ nguyên mốc cũ |
| Dòng **biến mất khỏi D1** | **KHÔNG xoá.** Đánh dấu `đã xoá khỏi DB`, một lần duy nhất |

### Ba cột sổ, đứng đầu mỗi tab

| Cột | Nghĩa |
|---|---|
| `_trangThai` | `mới` · `đổi` · `nguyên` · `đã xoá khỏi DB` |
| `_capNhat` | Lượt gần nhất **thật sự làm gì đó** với dòng này |
| `_lanDau` | Lượt đầu tiên thấy dòng này |

`_capNhat` **chỉ đổi khi dòng thật sự đổi**. Đóng dấu lại mỗi lượt thì nó thành
cột "ngày chạy gần nhất" — cùng một giá trị ở mọi dòng, và không trả lời được
câu duy nhất nó sinh ra để trả lời: *dòng này đổi lần cuối khi nào?*

### Vì sao không xoá dòng đã mất

Đây là lý do cả cách này đáng làm. Sổ giữ lại thứ cơ sở dữ liệu đã bỏ, nên nó
chống được **sai sót của chính bạn** — xoá nhầm một bình luận, chạy nhầm một
câu `DELETE` trong Console — chứ không chỉ chống sự cố của Cloudflare. Mà sai
sót của chính mình mới là thứ hay xảy ra.

Một bản soi gương thuần (ghi đè sạch mỗi lượt) mất đúng khả năng ấy: xoá nhầm
hôm nay, Chủ nhật tới bản sao lưu xoá theo, không còn chỗ nào giữ dòng đó nữa.

> **Một lưới an toàn nữa:** nếu một bảng chạm trần 5000 dòng thì gói gửi đi bị
> cắt, và Worker báo cờ `cat` để Apps Script **bỏ hẳn** bước đánh dấu xoá cho
> bảng ấy. Thiếu cờ này thì mọi dòng ngoài trần bị ghi là "đã xoá khỏi DB" —
> bản sao lưu tự bôi bẩn chính nó, và bôi lặng lẽ.

Chạy lại nhiều lần trong ngày cũng không sao: lượt thứ hai thấy mọi dòng
`nguyên`, không đổi gì, chỉ thêm một dòng vào Mục lục.

---

## 4. Email người bình luận

**Đang chép** (`"SAO_LUU_EMAIL": "1"` trong `wrangler.jsonc`).

### Trước hết, gỡ một hiểu nhầm

Lời hứa ở đầu `binh-luan.js` — *"email không ra khỏi cơ sở dữ liệu"* — nghĩa là
nó **không đi qua API** xuống trình duyệt người đọc, và **không vào thư báo**.
Nó **không** có nghĩa là không lưu.

Cột `email` nằm nguyên trong bảng `binh_luan` từ lúc người ta bấm Gửi. Cần liên
hệ lại thì tra bất cứ lúc nào ở Cloudflare → D1 → `zoey-blog` → **Console**:

```sql
SELECT ten, email, chu, luc FROM binh_luan WHERE ma = 'bl...';
SELECT ma, ten, email, luc FROM binh_luan WHERE ten LIKE '%Linh%';
```

### Vậy công tắc này quyết định gì

Đúng một chuyện: có chép **thêm một bản** sang Google Drive hay không.

| | `"0"` | `"1"` ← đang dùng |
|---|---|---|
| Liên hệ lại hằng ngày | ✅ qua D1 Console | ✅ qua D1 Console |
| D1 mất sạch, dựng lại từ Sheet | ❌ mất phần email | ✅ còn đủ |
| Email nằm ở đâu | Cloudflare | Cloudflare **+ Google Drive** |

Bật vì một bản sao lưu mà khôi phục xong vẫn thiếu một cột thì chưa phải bản
sao lưu đầy đủ — mất cột này là mất luôn đường liên hệ lại với người đã viết.

**Cái giá, ghi ra để đừng quên:** người đọc đưa địa chỉ cho *chủ trang*, không
cho Google. Từ khi bật, nó nằm trong Drive và trong mọi bản sao lưu của Drive.

Tắt lại: đổi về `"0"`, deploy. Sheet **không tự xoá** cột đã chép — muốn sạch
thì xoá cột `email` trong tab `binh_luan` bằng tay.

> **Lượt sao lưu ngay sau khi đổi công tắc sẽ báo `Đổi` ở mọi dòng.** Cột
> `email` xuất hiện (hoặc biến mất) là sổ thấy nội dung khác đi, nên đánh dấu
> một lượt rồi thôi. Không phải lỗi.

---

## 5. Khi sao lưu hỏng

Hỏng thì **tự gửi thư báo** — không nằm im trong log. Cố ý: sao lưu hỏng mà
tưởng là chạy là kiểu hỏng tệ nhất, nó chỉ lộ ra đúng lúc cần khôi phục, tức
là lúc đã mất dữ liệu.

| Trả về | Nghĩa | Sửa |
|---|---|---|
| `{"ok":true,"boQua":"thieu-SAO_LUU_URL"}` | Chưa bật tính năng | Đặt Secret ở §2.3 |
| `{"ok":false,"loi":"thieu-SAO_LUU_KHOA"}` | Có URL mà thiếu khoá — cài dở | Đặt nốt Secret thứ hai |
| `{"ok":false,"loi":"sao-luu 200","chiTiet":"<!DOCTYPE html…"}` | Apps Script trả HTML | `Who has access` chưa phải `Anyone`, hoặc deploy đã bị xoá |
| `chiTiet` chứa `sai khoá` | Hai chuỗi không khớp | So `KHOA` trong script với Secret `SAO_LUU_KHOA` |
| `{"ok":false,"loi":"mang: …"}` | Không gọi tới được | Kiểm URL có đúng đuôi `/exec` không |

Mở web app URL bằng trình duyệt để tách bạch: thấy
`{"ok":true,"noi":"web app đang chạy…"}` nghĩa là deploy còn sống và vấn đề
nằm ở khoá. Thấy trang đăng nhập Google nghĩa là `Who has access` sai.

> **Sửa mã trong Apps Script xong phải Deploy lại.** Bấm **Deploy** → **Manage
> deployments** → bút chì → **Version: New version** → **Deploy**. Chỉ Save
> không thôi thì web app vẫn chạy bản cũ — và không có gì báo cho biết.

---

## 6. Khôi phục

Chưa có công cụ tự động, và cố ý chưa làm: khôi phục là việc hiếm, làm tay thì
còn nhìn thấy mình đang ghi đè cái gì.

**Lấy lại một dòng lỡ xoá** — trường hợp hay gặp nhất:

1. Mở tab `binh_luan`, lọc cột `_trangThai` = `đã xoá khỏi DB`
2. Cột `_capNhat` cho biết nó biến mất ở lượt sao lưu nào — dùng để nhận ra
   đúng dòng cần, nhất là khi có nhiều dòng cùng trạng thái
3. Chép các ô dữ liệu (bỏ ba cột `_`) rồi vào Cloudflare → D1 → `zoey-blog` →
   **Console**, gõ một câu `INSERT` với đúng những giá trị đó

**Lấy lại cả bảng:** mở tab → **File → Download → CSV** → D1 → tab **Import**.
Nhớ **xoá ba cột `_trangThai` · `_capNhat` · `_lanDau`** trước khi nhập — chúng
là cột của sổ, không có trong lược đồ D1, và để nguyên thì import hỏng.

Kiểm bảng đích đang có gì trước khi nhập: import không tự xoá dòng cũ, và `ma`
trùng thì câu lệnh hỏng giữa chừng.
