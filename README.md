# ChemLab – Nền tảng học Hóa học 3D

Đồ án tốt nghiệp: hệ thống học Hóa học trực quan gồm backend Spring Boot và frontend Angular.

| Thư mục     | Công nghệ                                   | Cổng   |
|-------------|---------------------------------------------|--------|
| `backend/`  | Spring Boot 3.2, Java 17, Spring Security + JWT, JPA (H2 / MySQL) | `8888` |
| `frontend/` | Angular 17, Angular Material, Three.js, ngx-translate | `4200` |

## Chạy dự án

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

## Biến môi trường

Key bí mật không được commit lên repo, cần đặt qua biến môi trường:

| Biến                 | Dùng cho                         | Bắt buộc |
|----------------------|----------------------------------|----------|
| `JWT_SECRET`         | Ký token đăng nhập (≥ 64 ký tự)  | Khi deploy |
| `OPENROUTER_API_KEY` | Các chức năng AI (OpenRouter)    | Khi dùng AI |
| `YOUTUBE_API_KEY`    | Gợi ý video bài giảng            | Không |
