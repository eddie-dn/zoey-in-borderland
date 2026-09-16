# VIỆC ĐANG CHỜ

> Sổ hàng đợi. Mỗi mục là MỘT việc đã được yêu cầu nhưng chưa xong — ghi đủ để
> người khác (hoặc chính mình tuần sau) làm được mà không cần đọc lại hội thoại.
> Làm xong thì xoá khỏi đây và ghi một dòng vào `docs/LICH-SU.md`.
>
> Thứ tự trong file là thứ tự làm. Việc mới thêm vào CUỐI nhóm của nó, không
> chen lên đầu — chen lên đầu thì mục nào cũng khẩn cấp và thứ tự thành vô nghĩa.

---

## Đã xong trong lượt này

| Mục | Bản | Việc |
|---|---|---|
| A1 | V10.08 · V11.01 | Tĩnh lặng: giữ nền cũ, đậm phần mép; bỏ hết đường kẻ nước |
| B1–B3 | V11.00 | Posts thành danh sách dòng, 6 mục một trang, chip ba nơi một khuôn |
| C1 | V11.03 | Mục lục điện thoại thành nút hamburger |
| C2 | V11.03 | "Borderland" nở ra khi mở tên blog |
| D1 | V11.02 | Thanh đầu trang đổi qua lại tên blog ↔ logo |
| E1 · E3 | V10.09 | Tim · chia sẻ · bình luận về một cụm ở cột phải |
| E2 | V11.04 | Bình luận nở ra cột phải ở khổ rộng |
| F1 | V11.04 | Search thôi khựng ở phím gõ đầu |
| H1 | V11.02 | Logo giữ nhịp khi quay lại trang |
| I1 · I2 | V11.05 | Back cạnh Save; ô quản trị sang tiếng Anh |
| — | V11.06 | Dọn CSS chết và trùng, nhãn thừa, script nạp đúng chỗ |

---

## C · Điện thoại

### C3. Gợi ý cách xếp tim / bình luận / chia sẻ
Cụm ba nút đã có (V10.09). Còn nợ một đề xuất cho khổ dọc: hiện nó rơi vào dòng
chảy ở `order:2` — sau thân bài, trước chân bài. Câu hỏi là có nên cho nó dính
đáy màn thành một thanh nổi hay không.

---

## G · Để sau, chưa ai giục

### G1. Đệm trích dẫn AI theo ngày trong D1
`/api/quote` gọi Gemini và bị chặn theo vùng (HKG trả `FAILED_PRECONDITION`),
nên từ Việt Nam gần như luôn rơi về kho tĩnh. Đệm kết quả một ngày trong D1 thì
một lượt gọi thành công là cả ngày ai cũng thấy câu mới.

### G2. H1 — nếu logo còn chạy lạ thì cần thêm thông tin
Đã chữa nguyên nhân có thật (hai đồng hồ lệch nhau sau khi trang bị cất đi rồi
lấy lại). Nếu vẫn thấy lạ: cần biết **trình duyệt nào** và **logo ở đâu** —
thanh đầu trang hay màn đầu trang chủ.
