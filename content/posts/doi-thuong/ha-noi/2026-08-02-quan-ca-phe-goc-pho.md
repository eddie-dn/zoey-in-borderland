---
title: Quán cà phê góc phố, 6 giờ sáng
date: 2026-08-02
summary: Một bài ngắn, đặt trong thư mục con doi-thuong/ha-noi/ để làm ví dụ cho cấu trúc chuyên mục lồng nhau và đường dẫn phân cấp.
tags: [hà nội, đời thường]
cover: /media/2026/quan-ca-phe-goc-pho/bia.png
coverAlt: Quán cà phê góc phố, 6 giờ sáng
---

Sáu giờ sáng, quán mới mở, ghế còn úp lên bàn. Cô chủ pha ấm nước đầu tiên rồi
ngồi xuống uống một mình, trước khi có khách nào.

Bài này ngắn có chủ đích: nó nằm trong `content/posts/doi-thuong/ha-noi/`, nên
đường dẫn ra `/posts/doi-thuong/ha-noi/quan-ca-phe-goc-pho/`, và dòng phân cấp
ở đầu bài tự hiện đủ **Bài viết / Đời thường / Hà Nội**.

## Thêm chuyên mục mới thì làm gì

Tạo một thư mục trong `content/posts/`, thả bài `.md` vào. Xong. Muốn thư mục
có tên hiển thị đẹp (có dấu) thì thêm `_muc.json` cạnh bài:

```json
{ "title": "Hà Nội", "description": "Một dòng mô tả" }
```

Không có file đó thì tên thư mục được dùng làm tên hiển thị luôn.
