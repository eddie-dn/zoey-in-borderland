---
title: Vô thức tập thể, và cái cớ để tin vào giấc mơ
date: 2026-09-14
summary: Jung nói có một tầng ký ức không thuộc về riêng ai. Bài này vừa là ghi chép về ý đó, vừa là bản demo đầy đủ mọi khối viết được trên blog.
tags: [tâm lý, jung, ghi chép]
cover: /media/2026/vo-thuc-tap-the/bia.png
coverAlt: Một quầng sáng tím hồng toả ra từ tâm, bao quanh là hai vòng tròn nét đứt
---

Có những hình ảnh quay lại trong giấc mơ của những người chưa từng gặp nhau, ở
những nơi chưa từng nghe tên nhau. Jung gọi tầng đó là **vô thức tập thể** — và
gọi những hình ảnh lặp lại ấy là *cổ mẫu*.

Bài này cũng đồng thời là **bản demo**: mỗi khối viết được trên blog đều xuất
hiện ít nhất một lần ở đây. Mở `content/posts/tam-ly/2026-09-14-vo-thuc-tap-the.md`
ra xem là thấy cách gõ.

## Ba tầng của tâm trí

Jung chia tâm trí làm ba tầng, mỗi tầng nằm sâu hơn tầng trước một chút:

1. **Cái Tôi** — phần mình biết là mình.
2. **Vô thức cá nhân** — những gì mình từng biết rồi quên, hoặc cố quên.
3. **Vô thức tập thể** — tầng không ai học mà có, nhưng ai cũng có.

![Sơ đồ ba vòng tròn đồng tâm: Cái Tôi ở trong cùng, rồi Vô thức cá nhân, ngoài cùng là Vô thức tập thể](/media/2026/vo-thuc-tap-the/so-do.svg "Ba tầng, vẽ theo cách Jung mô tả trong **Sách Đỏ**"){.wide}

Cái làm ý này khó nuốt không nằm ở tầng thứ ba. Nó nằm ở chỗ: nếu tầng ba có
thật, thì một phần những gì mình tưởng là *của mình* — sợ hãi, khao khát, cả
gu thẩm mỹ — hoá ra là đồ mượn.

:::note Đọc thêm
Ba cuốn vào được mà không cần nền tâm lý học: *Con người và biểu tượng*,
*Ký ức, giấc mơ, suy tưởng*, và [Sách Đỏ](https://en.wikipedia.org/wiki/The_Red_Book_%28Jung%29)
— cuốn cuối nên xem bản in màu, vì tranh trong đó là một nửa nội dung.
:::

### Cổ mẫu không phải là khuôn mẫu

Chỗ này hay bị hiểu nhầm nhất. Cổ mẫu không phải một hình ảnh cố định được
truyền lại, mà là một **khuynh hướng** tạo ra hình ảnh.

> Cổ mẫu không phải bức tranh. Nó là cái khung căng sẵn, chờ người ta vẽ lên.
> Mỗi nền văn hoá vẽ một kiểu, nhưng khung thì giống nhau.
>
> — diễn giải tự do, không phải trích nguyên văn

| Cổ mẫu | Xuất hiện dưới dạng | Hay gặp ở |
|---|---|---:|
| Người Mẹ | che chở, cũng có thể nuốt chửng | cổ tích, quảng cáo |
| Cái Bóng | phần mình chối bỏ | phản diện, giấc mơ xấu |
| Anima / Animus | hình bóng người khác giới trong mình | chuyện tình, thần thoại |

## Thử nghiệm trên chính mình

Cách kiểm chứng rẻ nhất là ghi lại giấc mơ trong ba tuần, không diễn giải gì cả.
Chỉ ghi.

- [x] Để sổ và bút ngay cạnh gối — mở điện thoại là giấc mơ bay mất
- [x] Ghi trong vòng 2 phút sau khi mở mắt
- [ ] Ba tuần liền, không bỏ ngày nào
- [ ] Đọc lại cả xấp một lượt, tìm cái gì lặp lại

:::warn Một điều nên biết trước
Đây là chuyện tự quan sát cho vui và cho hiểu mình, **không phải trị liệu**.
Nếu giấc mơ đang làm bạn mất ngủ hoặc hoảng sợ thật sự, chuyện cần làm là gặp
người có chuyên môn, không phải đọc thêm sách.
:::

### Đoạn mã ghi chép

Mình dùng một file `.md` mỗi tháng, mở đầu bằng đúng mấy dòng này:

```javascript
// dem.js — sinh khung ghi chép cho cả tháng
const thang = new Date().getMonth() + 1;
const soNgay = new Date(2026, thang, 0).getDate();

for (let d = 1; d <= soNgay; d++) {
  console.log(`## ${String(d).padStart(2, '0')}/${thang}\n\n- \n`);
}
```

Chạy `node dem.js > thang-9.md`, thế là xong khung. Phần còn lại là việc của
buổi sáng.

## Ảnh và video chèn vào bài

Ba khổ ảnh dùng được: mặc định nằm gọn trong cột chữ, `{.wide}` rộng hơn cột
chữ, `{.full}` tràn hết bề ngang màn hình.

![Dải màu chuyển từ tím nhạt sang hồng](/media/2026/vo-thuc-tap-the/anh-ngang.png "Ảnh khổ `{.full}` — tràn hết bề ngang, dùng cho ảnh phong cảnh"){.full}

Xếp hai ba ảnh cạnh nhau thì bọc trong khối `gallery`:

:::gallery wide
![Quầng sáng tím hồng](/media/2026/vo-thuc-tap-the/bia.svg)
![Sơ đồ ba vòng tròn đồng tâm](/media/2026/vo-thuc-tap-the/so-do.svg)
:::

Video YouTube nhúng bằng một dòng, và nó **chỉ tải khi bạn bấm play** — mở bài
ra thì chỉ có ảnh bìa, không có script nào của Google chạy:

@youtube[nBPHBW-6Smo](Một giờ nhạc để ngồi ghi chép){.wide}

:::tip Mẹo đặt ảnh
Để ảnh của bài trong `public/media/<năm>/<slug-bài>/`. Mỗi bài một thư mục riêng
thì sau này xoá bài là xoá gọn cả ảnh, không còn ảnh mồ côi nằm lại.
:::

---

## Còn lại là việc của mình

Thứ Jung để lại không phải một bộ câu trả lời, mà là một cách hỏi: *cái này
trong mình, có thật là của mình không?*

Câu hỏi đó không giải quyết được buổi tối nào cả. Nhưng nó làm mấy giấc mơ bớt
vô nghĩa đi một chút.

:::stop Đừng làm
Đừng đem cổ mẫu ra giải thích hành vi của người khác. Nó là công cụ soi vào
trong, không phải cái nhãn dán lên người ta.
:::
