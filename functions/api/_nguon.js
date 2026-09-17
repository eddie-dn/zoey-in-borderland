/* SINH TỰ ĐỘNG bởi tools/build.mjs — ĐỪNG SỬA TAY.
   Sửa nội dung ở `content/quote-nguon.md` rồi chạy `npm run build`.
   Vì sao phải nướng sẵn: Cloudflare Workers không có `fs` để đọc file .md
   lúc chạy — xem chú thích ở `nuongNguonQuote` trong tools/build.mjs. */
export default {
  "chuDe": [
    {
      "ten": "Tự biết mình",
      "ta": "nhìn ra cái đang chạy trong đầu mình rồi gọi đúng tên nó"
    },
    {
      "ten": "Tự trọng",
      "ta": "giá trị của mình không nằm ở lời khen chê của người khác"
    },
    {
      "ten": "Tự soi lại",
      "ta": "ngồi xét việc mình đã làm, sửa mình trước khi trách người"
    },
    {
      "ten": "Khiêm nhường",
      "ta": "biết chỗ mình chưa biết, biết mình nhỏ trong một thứ lớn hơn"
    },
    {
      "ten": "Sự chú ý",
      "ta": "để tâm vào đâu thì đời mình thành ra ở đó"
    },
    {
      "ten": "Thói quen",
      "ta": "cái làm mỗi ngày quyết định mình là ai, không phải cái định làm"
    },
    {
      "ten": "Cái đẹp của thứ bình thường",
      "ta": "buổi sáng, ấm trà, một quãng đường quen"
    },
    {
      "ten": "Chịu đựng",
      "ta": "đi qua chuyện khó mà không hoá thành người khác"
    }
  ],
  "nguon": [
    "Carl Jung",
    "Marcus Aurelius",
    "Seneca",
    "Epictetus",
    "Socrates",
    "Montaigne",
    "Blaise Pascal",
    "Kierkegaard",
    "Nietzsche",
    "Simone Weil",
    "Viktor Frankl",
    "Carl Rogers",
    "Erich Fromm",
    "Gabor Maté",
    "Krishnamurti",
    "Rumi",
    "Lão Tử",
    "Trang Tử",
    "Khổng Tử",
    "Tôn Tử",
    "Đức Phật",
    "Thích Nhất Hạnh",
    "Ajahn Chah",
    "Nguyễn Trãi",
    "Nguyễn Bỉnh Khiêm",
    "Trần Nhân Tông",
    "Leo Tolstoy",
    "Fyodor Dostoevsky",
    "Anton Chekhov",
    "Richard Feynman",
    "Albert Einstein",
    "Maya Angelou",
    "James Baldwin",
    "Toni Morrison",
    "Annie Dillard",
    "Mary Oliver",
    "John Berger",
    "Susan Sontag",
    "Hồ Chí Minh",
    "Võ Nguyên Giáp",
    "Trần Hưng Đạo",
    "Lý Thường Kiệt",
    "Quang Trung",
    "Lê Lợi",
    "Phan Châu Trinh",
    "Phan Bội Châu",
    "Miyamoto Musashi",
    "Carl von Clausewitz",
    "Niccolò Machiavelli"
  ],
  "nhac": "Chọn {{so}} câu nói CÓ THẬT và KHÁC NHAU về chủ đề: {{chuDe}}.\n\nChỉ lấy của những người sau: {{nguon}}. Mỗi câu một tác giả khác nhau.\n\nDịch sang tiếng Việt gọn gàng, TRỌN VẸN một ý, dài 60 đến 115 ký tự — kể cả\nphần tên tác giả thì đừng vượt 150. Ưu tiên câu có hai vế: câu quá ngắn thì ô\ntrích dẫn chừa một mảng trống bên phải, nhìn như bị cắt.\n\nTrả về đúng {{so}} dòng, mỗi dòng một câu theo khuôn:\nNội dung câu nói — Tên tác giả\n\nKhông đánh số, không gạch đầu dòng, không chừa dòng trống giữa các câu.\n\nChỉ dùng câu CÓ THẬT, KHÔNG bịa, không gán nhầm tác giả — không chắc ai nói thì\nchọn câu khác. Với các nhân vật Việt Nam, chỉ trích câu có nguồn rõ ràng; không\nchắc thì bỏ qua người đó và chọn tác giả khác trong danh sách. Không emoji,\nkhông dấu ngoặc kép, không lời dẫn, không giải thích."
};
