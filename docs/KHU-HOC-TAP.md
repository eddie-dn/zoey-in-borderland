# KHU HỌC TẬP — learning.z-in-borderland.com

> Tài liệu này chốt **ranh giới** và **luồng đi**. Mã nguồn của khu học tập
> KHÔNG nằm trong kho này — nó ở kho riêng `z-learning`. Ở đây chỉ có đúng một
> thứ thuộc về blog: mục `Learning` trên thanh đầu trang.

---

## 1 · KHU HỌC TẬP LÀM GÌ, VÀ KHÔNG LÀM GÌ

Blog và khu học tập là hai trang web khác nhau, cố ý.

| | z-in-borderland.com | learning.z-in-borderland.com |
|---|---|---|
| Nội dung | bài viết công khai, miễn phí | tài liệu trả tiền |
| Dựng kiểu gì | tĩnh, build sẵn ra `dist/` | động, render sau khi kiểm quyền |
| Ai đọc được | tất cả, kể cả Google | chỉ người đã mua |

**Khu học tập có đúng năm việc:**

1. **Thanh toán** — chọn tài liệu, tạo đơn, quét QR, tự mở quyền khi tiền vào.
2. **Quản lý tài khoản** — thông tin, thiết bị đang đăng nhập, lịch sử đơn.
3. **Hỗ trợ sau mua** — mỗi đơn một luồng hỏi riêng, có người thật trả lời.
4. **Q&A** — kho hỏi đáp chung theo từng tài liệu, người mua cùng tài liệu đọc được của nhau.
5. **Tủ sách** — chỗ đọc và tải thứ đã mua.

Mục 5 không nằm trong danh sách bốn việc ban đầu, nhưng nó phải ở đây: tài liệu
trả tiền mà đặt trên blog thì blog build tĩnh ra `dist/` và nó công khai vĩnh
viễn. Chỗ duy nhất kiểm được quyền trước khi trả chữ là khu này.

**Khu học tập KHÔNG làm:** bài viết công khai, SEO, RSS, bình luận. Muốn viết
để người lạ đọc thì viết ở blog — đó là việc của blog.

---

## 2 · HAI KHO MÃ, HAI WORKER, MỘT TÊN MIỀN

Đây là câu hỏi "tách kho riêng rồi quản thế nào". Câu trả lời ngắn: **một zone
DNS, hai Worker, hai kho mã, không có gì dùng chung.**

```
Cloudflare zone: z-in-borderland.com          ← đã có sẵn
├── Worker "zoey-in-borderland"   ← kho eddie-dn/zoey-in-borderland
│     custom domain: z-in-borderland.com
│     D1: zoey-blog · Secrets: GH_TOKEN, RESEND_KEY, GEMINI_KEY…
│
└── Worker "z-learning"           ← kho eddie-dn/z-learning  (MỚI)
      custom domain: learning.z-in-borderland.com
      D1: z-learning · Secrets: SEPAY_KHOA, RESEND_KEY, KY_HMAC…
```

### 2.1 · Gắn tên miền con — không phải sửa DNS tay

Cloudflare Dashboard → **Compute (Workers & Pages)** → chọn Worker `z-learning`
→ **Settings** → **Domains & Routes** → **Add** → **Custom domain** → gõ
`learning.z-in-borderland.com`.

Cloudflare tự thêm bản ghi DNS và tự cấp chứng chỉ. Không cần vào tab DNS, không
cần đợi chứng chỉ — Universal SSL đã phủ sẵn tên miền con cấp một.

> Đừng tạo bản ghi CNAME bằng tay rồi mới thêm custom domain. Bản ghi tay sẽ
> chặn đúng bước Cloudflare định làm, và triệu chứng là một trang 522 không có
> lý do rõ ràng.

### 2.2 · Mỗi kho mã dựng đúng Worker của nó

Trong từng Worker: **Settings → Build → Connect to Git**, trỏ vào kho tương ứng,
nhánh `main`. Từ đó push kho nào thì chỉ Worker ấy dựng lại. Hai hệ thống không
bao giờ làm nhau sập.

### 2.3 · Ba thứ tuyệt đối KHÔNG dùng chung

| | Vì sao |
|---|---|
| **Secret** | `GH_TOKEN` của blog có quyền ghi vào kho mã. Khu học tập không cần nó, nên nó không được có mặt ở đó — một lỗ hổng ở khu bán hàng không được phép với tới kho mã. |
| **Cơ sở dữ liệu** | D1 riêng. Bình luận blog và đơn hàng không có lý do gì đứng chung một chỗ. |
| **Cookie phiên** | Cookie đăng nhập đặt **host-only** cho `learning.…`, KHÔNG đặt `domain=.z-in-borderland.com`. Đặt rộng ra thì mọi script trên blog đọc được phiên đăng nhập của người mua. |

### 2.4 · Màu thì chép, không chia sẻ

Khu học tập dùng **bộ màu `frost` (霜降)** — trắng, mực đen, xám trung tính. Lý
do: nó là theme không màu, nên khu học tập nhìn ra ngay là "chỗ làm việc" chứ
không phải chỗ đọc chơi; và chỉ cần một bộ token, không phải kéo cả bốn theme
cùng nút chuyển sang.

Chép khối `:root[data-theme="frost"]` trong `src/styles/tokens.css` sang kho mới
thành `:root` — **chép một lần, không dùng submodule**. Blog đổi màu thì khu học
tập không có lý do gì đổi theo: một bên là tạp chí, một bên là quầy thu ngân.

---

## 3 · LUỒNG ĐI, CHỐT

### 3.1 · Vào cửa

```
Blog, thanh đầu trang → Learning → learning.z-in-borderland.com
```

Mục `Learning` khai trong `site.config.json`, mục `nav`. Nó là đường dẫn TUYỆT
ĐỐI — `navHTML` trong `tools/build.mjs` nhận ra `https://` thì không ghép `base`
và không gắn `aria-current`.

**Bật / tắt:** chừng nào địa chỉ ấy còn nằm trong danh sách `chuaDung` thì mục
hiện ra chữ mờ "Coming soon". Dựng xong khu học tập thì xoá dòng đó đi, mục tự
thành link thật. Không phải sửa mã.

Trang đích là trang bán: giới thiệu, danh mục tài liệu, giá, bản xem thử vài
trang. Trang này CÔNG KHAI — người chưa mua phải xem được thứ mình sắp trả tiền.

### 3.2 · Đăng ký và đăng nhập

Gõ email → nhận **magic link** qua Resend → bấm vào là xong. Không mật khẩu:
không có mật khẩu thì không có thứ để đăng lên nhóm chia sẻ.

Link sống 10 phút, dùng một lần. Phiên giữ 30 ngày, ràng vào thiết bị.

### 3.3 · Mua và thanh toán

```
Chọn tài liệu
   → Tạo đơn  ZIB-A7K3M9        (hết hiệu lực sau 60 phút)
   → Hiện VietQR: số tiền và nội dung chuyển khoản đã điền sẵn
   → Người mua quét mã, chuyển khoản
   → Ngân hàng báo có → cổng đối soát bắn webhook về /api/webhook-tt
   → Khớp mã đơn trong nội dung chuyển khoản
   → Ghi `quyen`, gửi email "đã mở", tài liệu hiện trong Tủ sách
```

Nội dung chuyển khoản là **mã đơn**, không phải tên người mua — tên thì trùng
nhau và gõ sai dấu, mã đơn thì khớp được bằng máy.

**Đường lui bắt buộc:** nút *"Tôi đã chuyển rồi"* tạo một yêu cầu đối soát tay,
hiện trong ngăn quản trị. Ngày cổng đối soát trục trặc mà không có cửa này thì
người mua đứng đợi còn mình không biết gì.

### 3.4 · Nhận tài liệu

| Cách | Khi nào | Chống lộ |
|---|---|---|
| **Đọc online** | mặc định, mọi tài liệu | render từng trang, đóng dấu email + giờ lên nền |
| **Tải về** | chỉ tài liệu bật cờ `cho_tai` | mỗi lượt tải sinh bản riêng có watermark; link ký HMAC, sống 60 giây, dùng một lần |

Không bao giờ để file gốc ở chỗ có địa chỉ đoán được. Gốc nằm trong R2 private,
chỉ Worker đọc.

### 3.5 · Hỗ trợ sau mua

Mỗi đơn có một luồng hỏi riêng. Người mua gõ câu hỏi → mình nhận email → trả lời
→ câu trả lời hiện trong tài khoản họ và gửi kèm email. Riêng tư, không ai khác
đọc được.

### 3.6 · Q&A

Khác hỗ trợ ở chỗ nó **chung**: câu hỏi gắn vào TÀI LIỆU chứ không gắn vào đơn.
Mình trả lời một lần, mọi người đã mua tài liệu đó đều đọc được. Người chưa mua
không thấy gì.

Đây là thứ càng dùng càng có giá: sau vài chục câu thì nó thành phần phụ lục do
chính người học viết ra.

### 3.7 · Quản lý tài khoản

Thông tin cá nhân · lịch sử đơn · biên nhận · **thiết bị đang đăng nhập** (xem
và đá ra) · đổi email.

---

## 4 · CHỐNG CHIA SẺ TÀI KHOẢN

| Lớp | Cụ thể |
|---|---|
| Thiết bị | tối đa **2**; thêm cái thứ ba phải đá một cái cũ, và chỉ đổi được **1 lần / 30 ngày** |
| Phiên | **1 phiên hoạt động** tại một thời điểm; nhịp tim 45 giây, phiên mới đẩy phiên cũ ra |
| IP | KHÔNG khoá cứng — 4G đổi IP liên tục. Chỉ chấm điểm: hai IP khác quốc gia cách nhau dưới 30 phút → bắt xác minh lại qua email |
| Watermark | email + giờ, hiện trên mọi trang đọc và mọi bản tải |

**Chụp màn hình thì không chặn được.** Web không có API nào làm việc đó, và một
cái điện thoại thứ hai thì không API nào với tới. Watermark không để chặn — nó
để lúc một bản trôi ra ngoài thì biết chính xác nó trôi từ tài khoản nào.

---

## 5 · BẢNG DỮ LIỆU (D1 của kho `z-learning`)

```
nguoi_dung   id · email · ten · tao_luc · trang_thai
tai_lieu     id · ten · mo_ta · gia · so_trang · cho_tai · khoa_r2 · hien
don_hang     ma · nguoi_dung_id · tai_lieu_id · so_tien · trang_thai · het_han · tao_luc
quyen        nguoi_dung_id · tai_lieu_id · don_ma · mo_luc
thiet_bi     id · nguoi_dung_id · van_tay · ip_dau · lan_cuoi · doi_luc
ho_tro       id · don_ma · vai · noi_dung · tao_luc
qa           id · tai_lieu_id · nguoi_dung_id · hoi · dap · hien · tao_luc
nhat_ky      id · nguoi_dung_id · viec · chi_tiet · ip · tao_luc
```

---

## 6 · ĐÃ LÀM / CHƯA LÀM

**Đã làm (trong kho này):**
- Mục `Learning` trên thanh đầu trang, đang ở trạng thái "Coming soon".
- `navHTML` hiểu đường dẫn tuyệt đối.

**Chưa làm (kho `z-learning`):** tất cả phần còn lại.
