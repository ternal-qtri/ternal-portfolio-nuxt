# Ternal Portfolio

Portfolio cá nhân của **Nguyễn Quốc Trí**, sinh viên Phát triển phần mềm tại FPT Polytechnic HCM, định hướng Backend Java/Spring Boot.

Giao diện theo phong cách game pixel, chủ đề khám phá di tích cổ trong rừng: kỹ năng là năng lực của nhân vật, mỗi dự án là một di tích đã khám phá. Nội dung được quản lý qua trang admin và lưu trên Supabase.

🌐 https://ternal-nguyenquoctri.io.vn

## Tính năng

**Trang công khai**
- **Trang chủ**: cảnh rừng pixel vẽ bằng canvas, bảng chỉ số nhân vật, thanh kỹ năng chính, các dự án nổi bật, nhiệm vụ hiện tại.
- **Kỹ năng** (`/skills`): toàn bộ kỹ năng chia theo nhánh, lọc theo tab, mức độ thông thạo 1–5.
- **Dự án** (`/projects`, `/projects/[slug]`): ảnh bìa, công nghệ, tính năng, thử thách và cách giải, bài học, video demo YouTube.
- **Liên hệ** (`/contact`): email, điện thoại/Zalo, GitHub và form gửi lời nhắn lưu vào database.

**Trang quản trị** (`/admin`)
- Đăng nhập bằng Supabase Auth; chỉ tài khoản có trong bảng `admins` mới vào được.
- Quản lý dự án (thêm/sửa/xóa, xuất bản/ẩn, sắp xếp các mục con), kỹ năng, hồ sơ và hộp thư liên hệ.

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Frontend | Nuxt 4, Vue 3, TypeScript, CSS thuần, Canvas 2D |
| Backend / DB | Supabase (PostgreSQL, Auth, Row Level Security) |
| Font | Bungee, Be Vietnam Pro, Silkscreen (Google Fonts) |

## Thiết kế cơ sở dữ liệu

Schema nằm trong [`supabase/migrations`](supabase/migrations):

- `profile` (1 dòng), `quest_steps`
- `skill_categories` → `skills`
- `projects` → `project_tags`, `project_features`, `project_challenges`, `project_lessons`
- `contact_messages`, `admins`

Phân quyền bằng RLS:
- Khách chỉ đọc được nội dung và các dự án đã xuất bản; được gửi tin nhắn nhưng không đọc được tin nào.
- Chỉ admin được ghi dữ liệu.
- Lưu dự án và hồ sơ đi qua hàm SQL (`save_project`, `save_profile`) chạy trong một giao dịch, nên lưu lỗi giữa chừng không làm mất dữ liệu cũ.

## Chạy trên máy

Cần Node.js 20+.

```bash
npm install
cp .env.example .env   # điền URL và publishable key của project Supabase
npm run dev            # http://localhost:3000
```

### Thiết lập Supabase

1. Tạo project trên [Supabase](https://supabase.com).
2. Chạy lần lượt các file trong `supabase/migrations`, rồi chạy `supabase/seed.sql` để có dữ liệu mẫu (dùng SQL Editor hoặc Supabase CLI).
3. Trong **Authentication**: tắt đăng ký tài khoản mới, tạo một user cho admin.
4. Cấp quyền admin cho user đó:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = '<email-admin>';
   ```

## Cấu trúc thư mục

```
app/
  pages/          # trang công khai + admin/
  components/     # cảnh hero, thẻ dự án, ô kỹ năng...
  data/           # truy vấn Supabase, ánh xạ dữ liệu cho giao diện
  composables/    # useSupabase, useContent
  middleware/     # chặn trang admin
  utils/          # vẽ pixel art, đọc link YouTube
supabase/
  migrations/     # schema, RLS, hàm lưu
  seed.sql        # dữ liệu ban đầu
```

## Build

```bash
npm run build
npm run preview
```
