# 🌟 Hành Trình Ngôn Từ — Ứng Dụng Luyện Viết Văn Biểu Cảm Lớp 5

> Nền tảng học tập tương tác giúp học sinh lớp 5 mở rộng vốn từ láy, làm chủ phép So sánh, Nhân hóa và nâng cao năng lực viết 4 dạng bài Tập làm văn trọng tâm (Kể chuyện sáng tạo, Tả cây cối, Tả cảnh, Tả người).

---

## 🚀 Hướng Dẫn Triển Khai Từ GitHub Lên Vercel

Ứng dụng được thiết kế theo kiến trúc **Pure Client-Side SPA** (Single Page Application) kết hợp với **Google Gemini REST API**, cho phép triển khai hoàn toàn miễn phí và không cần duy trì backend server phức tạp.

### Bước 1: Đẩy mã nguồn lên GitHub
Mở cửa sổ dòng lệnh (Terminal / PowerShell) trong thư mục dự án và thực hiện:
```bash
git init
git add .
git commit -m "Khoi tao du an Hanh Trinh Ngon Tu"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/morongvontucacdangvan.git
git push -u origin main
```

### Bước 2: Import dự án vào Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Nhấn nút **"Add New..."** $\rightarrow$ chọn **"Project"**.
3. Tìm và chọn repository `morongvontucacdangvan` vừa đẩy lên.
4. Cấu hình cài đặt build (Vercel tự động nhận diện Vite):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Nhấn **"Deploy"** và đợi khoảng 1 phút để Vercel hoàn tất quá trình biên dịch.

> [!NOTE]
> File `vercel.json` đã được tạo sẵn ở thư mục gốc để tự động điều hướng tất cả các route về `index.html`, đảm bảo không bị lỗi 404 khi tải lại trang web.

---

## 🔑 Hướng Dẫn Người Dùng Setup Gemini API Key

Ứng dụng tích hợp cơ chế quản lý API Key an toàn trực tiếp trên trình duyệt của người dùng (lưu tại `localStorage`):

1. **Lấy API Key miễn phí**:
   - Truy cập vào [Google AI Studio API Keys](https://aistudio.google.com/api-keys).
   - Đăng nhập bằng tài khoản Google $\rightarrow$ Nhấn **"Create API Key"** $\rightarrow$ Sao chép khóa (bắt đầu bằng `AIzaSy...`).
2. **Nhập vào ứng dụng**:
   - Khi truy cập vào trang web lần đầu, một cửa sổ Modal sẽ xuất hiện hướng dẫn nhập khóa.
   - Bạn cũng có thể nhấn vào nút **"Lấy API key để sử dụng app"** (chữ màu đỏ nổi bật trên Header) bất cứ lúc nào để thay đổi key hoặc đổi Model AI.
3. **Cơ chế Fallback & Dự phòng tự động**:
   - Mặc định: `gemini-3-flash-preview` (tốc độ cao).
   - Khi gặp lỗi quá tải (`429 RESOURCE_EXHAUSTED`), hệ thống sẽ **tự động thử lại** với các model tiếp theo: `gemini-3-pro-preview` $\rightarrow$ `gemini-2.5-flash`.
   - Kết quả các bước thành công trước đó luôn được bảo lưu nguyên vẹn.

---

## 💻 Chạy Ứng Dụng Ở Môi Trường Local (Máy Tính Cá Nhân)

Yêu cầu: Máy tính đã cài đặt **Node.js** (phiên bản 18+).

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy ứng dụng ở chế độ phát triển
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên màn hình).

---

## 📚 Các Tính Năng Nổi Bật Của Ứng Dụng

1. **4 Trụ Cột Văn Học Lớp 5**:
   - *Kể chuyện sáng tạo* (Thêm chi tiết & Đóng vai nhân vật).
   - *Tả cây cối* (Chi tiết bộ phận, màu sắc, hương thơm theo thời gian).
   - *Tả cảnh* (Không gian, ánh sáng, âm thanh, nhịp sống).
   - *Tả người* (Ngoại hình, ánh mắt, nụ cười, cử chỉ thân thương).
2. **Xưởng Nâng Cấp Câu Văn (3 Cấp Độ)**:
   - Cấp độ 1: Bổ sung từ láy & sắc màu sinh động.
   - Cấp độ 2: Phép So sánh tự nhiên, giàu sức gợi.
   - Cấp độ 3: Phép Nhân hóa & Cảm xúc tinh tế.
3. **Bác Sĩ Câu Chữ**:
   - Tìm điểm sáng đáng khen, bắt lỗi chính tả, lặp từ, ngữ pháp và giải thích *"Tại sao sai?"* dễ hiểu cho học sinh 10 tuổi.
4. **Gia Sư Viết Đoạn Văn 4 Bước**:
   - Quy trình khơi mở ý tưởng $\rightarrow$ Lập dàn ý $\rightarrow$ Chắp bút từng phần $\rightarrow$ AI trau chuốt và tính điểm thưởng.
5. **Đấu Trường Trò Chơi Ngôn Từ (4 Minigames)**:
   - *Giải cứu Tính từ & Từ láy* (+10 XP).
   - *Cuộc đua So sánh & Nhân hóa* (+15 XP).
   - *Thợ Săn Tu Từ* (Phản xạ phân biệt So sánh vs Nhân hóa) (+15 XP).
   - *Xếp gạch Cốt truyện Sáng tạo bằng AI* (+30 XP).
   - Tích hợp âm thanh Web Audio sống động.
6. **Bản Đồ Năng Lực Văn Học (Radar Chart 5 Chiều)**:
   - Đánh giá trực quan sự tiến bộ của học sinh qua các khía cạnh: Từ láy, So sánh, Nhân hóa, Cốt truyện, Chính tả.
7. **Xuất Bản Tài Liệu Chuẩn Word (.docx)**:
   - Xuất *Sổ tay Ngôn từ cá nhân* lưu lại toàn bộ các câu văn hay đã nâng cấp.
   - Xuất *Phiếu bài tập 4 trụ cột* có dòng kẻ tập viết để in ấn, phát bài trên lớp.
