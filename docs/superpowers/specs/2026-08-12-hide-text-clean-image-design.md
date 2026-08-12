# Hoàn thiện "Mode Ẩn Chữ — Chỉ hiện đúng 1 ảnh"

- **Ngày:** 2026-08-12
- **Dự án:** PicLink Ads (`/home/chinhan/piclink-ads`)
- **Trạng thái:** Đã được người dùng duyệt

## 1. Mục tiêu

Trong chế độ "Ẩn Chữ" (`hideText`) của form tạo link, khu Xem Trước trực tiếp
(theo dõi 5 nền tảng: Facebook Feed, FB Comment, Zalo, Twitter/X, Telegram)
phải chứng minh chính xác cam kết "*chỉ hiện duy nhất 1 tấm ảnh bìa sạch 100%*".

Hiện trạng: backend (`app/c/[slug]/route.ts`) đã gửi `og:title` rỗng + `og:description`
rỗng khi bật Ẩn Chữ → đúng rồi. Nhưng preview trang chủ mới chỉ ẩn phần title/desc
ở tab *Facebook Feed*; các tab còn lại vẫn hiện avatar, "Sponsored", comment bubble,
tweet text, domain — làm sai cam kết "chỉ 1 ảnh".

## 2. Hành vi mong muốn (khi `hideText === true`)

1. Cả **5 tab** vẫn chuyển đổi được (để xem ảnh trên từng nền tảng).
2. Mỗi tab hiển thị đúng và chỉ: **màu nền đặc trưng của nền tảng + 1 ảnh bìa
   căng đầy khung**. Tuyệt đối không còn avatar, "Sponsored", comment bubble,
   tweet text, domain, title hay description.
3. Badge báo hiệu **"Ảnh sạch 100% · Chỉ hiện ảnh"** xuất hiện trong header hộp
   preview, *ngoài khung nền tảng*, cạnh chip "Realtime Render".
4. Khi `hideText === false`: preview giữ nguyên hành vi hiện tại (không đổi gì).

## 3. Triển khai — "Clean shell" dùng chung

- Thêm map **nền tảng → màu nền**:
  - `facebook` / `fb_comment` → `#242526`
  - `zalo` → `#0068ff`
  - `twitter` → `#000000`
  - `telegram` → `#17212b`
- Trong `app/page.tsx`, nhánh rẽ ngay đầu khu render preview:
  - `hideText` → render **1 component dùng chung** `CleanPreview` với màu nền tra cứu
    theo `activeTab` + khối ảnh.
  - Ngược lại → render 5 block hiện tại (không đổi).
- `CleanPreview` tái sử dụng chính khối `<img>` / trạng thái rỗng
  ("Chưa chọn hình ảnh") của các tab hiện tại:
  - Ảnh: `width 100%`, `aspect-ratio 1200/630`, `object-fit cover`.
  - Rỗng: placeholder trên chính nền nền tảng, nội dung "Chưa chọn hình ảnh".
- Badge: trong `.card-header` của hộp preview, khi `hideText` render thêm
  `chip chip-accent` với nội dung trên. (Class đã tồn tại trong `globals.css`.)

## 4. Phạm vi

- **Chỉ sửa:** `app/page.tsx` (component + nhánh rẽ + badge). Không thêm CSS mới
  nếu không cần thiết, không sửa API/DB/links table/backend.
- **Không sửa:** `app/c/[slug]/route.ts`, `app/api/*`, `app/links/page.tsx`.

## 5. Tình huống biên

- Bật Ẩn Chữ nhưng chưa chọn ảnh → clean frame hiện placeholder trên nền nền tảng,
  nhắc người dùng chọn ảnh.
- Người dùng vẫn gõ title/description khi bật Ẩn Chữ → giá trị bị bỏ qua (hành vi
  hiện tại); preview chứng minh bằng cách không hiển thị chúng.
- Mobile: khung ảnh co giãn tự nhiên nhờ `aspect-ratio`.

## 6. Kiểm thử

- `npx tsc --noEmit` trong thư mục dự án.
- Playwright (dev server tại `http://localhost:3000`):
  1. Bật toggle Ẩn Chữ → duyệt cả 5 tab → trong khung nền tảng mỗi tab có đúng
     1 `<img>` và **0 text node** (badge + header nằm ngoài khung, không tính).
  2. Tắt toggle → 5 tab render như cũ (có avatar/chữ).
  3. Chưa chọn ảnh + bật Ẩn Chữ → placeholder "Chưa chọn hình ảnh" hiển thị.
- Không tạo bản ghi mới trong DB (không submit form trong lúc kiểm thử).

## 7. Tiêu chí hoàn thành (Definition of Done)

- Bật Ẩn Chữ: đúng 1 ảnh xuất hiện ở mọi tab, không còn bất kỳ chữ nào trong khung.
- Badge "Ảnh sạch 100% · Chỉ hiện ảnh" hiển thị khi bật, biến mất khi tắt.
- Tắt Ẩn Chữ: giao diện không đổi so với trước.
- `tsc --noEmit` pass, kiểm thử Playwright pass.