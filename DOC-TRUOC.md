# V8.01 → V8.02 — bốn file, và ba file phải XOÁ

GitHub của em đang ở **V8.01**. Chỉ cần đổi bốn file dưới đây.

---

## 1 · Ba file kéo thả bình thường

| Kéo file này | Vào chỗ này trên GitHub |
|---|---|
| `wrangler.jsonc` | gốc repo |
| `tools/kiem-dinh.mjs` | thư mục `tools/` |
| `docs/LICH-SU.md` | thư mục `docs/` |

Vào repo → **Add file** → **Upload files** → kéo vào → **Commit changes**.

---

## 2 · File thứ tư KHÔNG kéo thả được

`content/.moc.json` mở đầu bằng dấu chấm, và **trình duyệt bỏ qua mọi file bắt
đầu bằng dấu chấm khi kéo thả**. Đây là lý do nó chưa bao giờ có trên GitHub.

Hệ quả: sổ ghi mốc sửa bài không có trên GitHub, nên mỗi lần Cloudflare dựng
lại là nó coi mọi bài đều mới tinh. **Nhãn "Updated" vì thế không bao giờ hiện
trên bài nào cả** — không phải hỏng, chỉ là lặng lẽ không chạy.

### Cách đưa lên

1. Vào repo → **Add file** → **Create new file**
2. Ô tên file, gõ đúng chuỗi này (gõ cả dấu `/`, GitHub tự tạo thư mục):

   ```
   content/.moc.json
   ```

3. Mở `content/moc.json.txt` trong gói này, chép **toàn bộ** nội dung, dán vào
   khung soạn thảo
4. **Commit changes**

> File trong gói này để đuôi `.txt` để em mở xem được. Lúc tạo trên GitHub thì
> tên phải là `.moc.json`, không có `.txt`.

---

## 3 · Ba file phải XOÁ khỏi GitHub

V7.09 đã dọn ba thứ chết này, nhưng kéo thả chỉ THÊM và GHI ĐÈ — không bao giờ
xoá. Nên chúng vẫn nằm đó:

```
api/quote.js
content/quotes.md
tools/apps-script/Code.gs
```

Chúng vô hại cho tới lúc có người mở nhầm ra sửa — rồi sửa vào chỗ không chạy,
hoặc chép lại một cái tên model đã ngừng hoạt động.

**Cách xoá:** mở từng file trên GitHub → nút **⋯** góc phải → **Delete file** →
**Commit changes**.

---

## 4 · Sau khi xong

Cloudflare tự dựng lại. Mở `z-in-borderland.com` xem chân trang có `V8.02` là
xong.
