# MultipleChoices App

Ứng dụng luyện thi trắc nghiệm chạy trên React + Vite.

## Tính năng

- Thi trắc nghiệm theo section.
- Chọn số lượng câu hỏi muốn làm.
- Chọn thời gian làm bài: theo số câu, nhập phút tùy chỉnh, hoặc không giới hạn.
- Đồng hồ đếm ngược theo thời gian đã chọn.
- Chấm điểm tự động sau khi nộp bài.
- Xem kho câu hỏi (archive) và tìm kiếm nhanh.
- Import/Export bộ đề qua file Excel.

## Cài đặt và chạy

Yêu cầu Node.js 18+.

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Định dạng file Excel

Sheet đầu tiên của file sẽ được đọc để tạo bộ câu hỏi.

Cột cần có:

- `Section`
- `No.`
- `Question`
- `Option A`
- `Option B`
- `Option C`
- `Option D`
- `Correct Answer`
- `Explanation`

Gợi ý:

- `Correct Answer` nên là `A`, `B`, `C` hoặc `D`.
- Có thể export file mẫu trực tiếp trong ứng dụng rồi điền dữ liệu.

## Lint

```bash
npm run lint
```
