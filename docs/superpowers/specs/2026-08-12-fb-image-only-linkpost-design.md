# Thiết kế: Link post "chỉ còn 1 tấm ảnh" trên Facebook

Ngày: 2026-08-12
Dự án: PicLink Ads (Next.js, SQLite)

## Bối cảnh / Vấn đề

Người dùng tạo card (link ngắn redirect) để post lên Facebook chạy ads. Khi dán link card vào bài đăng Facebook, FB dựng link card/OG preview: ảnh bìa + tiêu đề + mô tả + dòng domain bên dưới.

Người dùng muốn bài đăng FB trông **chỉ có 1 tấm ảnh**, không tiêu đề, không mô tả, không dòng domain dễ thấy, và **bấm vào tấm ảnh mở được link đích**.

### Giới hạn kỹ thuật của Facebook (đã xác nhận)

- Trên bài đăng **thường (organic)**, không có cách nào làm "ảnh thuần nhưng bấm ảnh là mở link" — chức năng này chỉ có ở **link post** (dán URL vào nội dung bài) hoặc **quảng cáo trả phí**.
- Với **link post**, FB **luôn luôn** vẽ dòng domain bên dưới ảnh; không có thẻ OG nào xóa được.
- Với **photo post thuần** (upload ảnh), tấm ảnh KHÔNG mở link được — đây là con đường người dùng đã chọn KHÔNG đi.

### Quyết định

Chọn con đường **Link post**: bấm ảnh mở link đích. Chấp nhận 1 dòng domain nhỏ còn lại, nhưng tối đa hóa "chỉ còn 1 tấm ảnh" bằng cách ép FB ẩn tiêu đề + mô tả.

## Mục tiêu

1. Card ở chế độ **"Ảnh sạch"** (`hide_text=1`) sinh đúng OG tags để FB chỉ vẽ 1 tấm ảnh lớn + dòng domain nhỏ: `og:title` vô hình, `og:description` rỗng.
2. UI modal sau khi tạo card thể hiện rõ 2 thao tác: **Copy link** (dán vào bài FB) và **Mở thử link** (self-check).
3. Không xây thêm cơ chế trộn ký tự ẩn / obfuscate URL — đã loại.

## Hiện trạng code liên quan

- `app/c/[slug]/route.ts`: dựng bot HTML (FB crawler) với OG tags. Khi `hide_text=1`: `title = '&#8203;'` (zero-width space), `description = ''`. Robocontrol này là nền tảng của mục tiêu 1.
- `app/page.tsx`: form tạo card, chế độ "Ảnh sạch" (`hideText`) truyền `title=''`, `description=''`, `hideText=true`. Modal success có: link box + Copy + Mở thử link + Tạo tiếp (nút Tải ảnh bìa đã bỏ theo yêu cầu).
- `lib/bot-detector.ts`: danh sách crawler — đã thêm `'zalo'` (fix bug Zalo không nhận OG).

## Thiết kế chi tiết

### 1. Đảm bảo OG render "chỉ 1 ảnh"

- `hide_text=1` → `og:title='&#8203;'` (đã làm), `og:description=''` (đã làm), `og:image` 1200x630 (đã làm qua upload handler).
- **Cần xác nhận thêm:** crawler Facebook nhận đủ `og:image`, không còn `meta http-equiv="refresh"` trong HTML bot (đã gỡ ở bug trước).
- Kết quả mong đợi khi FB scrape: card hiện đúng 1 tấm ảnh, không có dòng tiêu đề/mô tả, chỉ còn domain nhỏ dưới ảnh.

### 2. UI modal post-kit

Giữ modal hiện tại, xác nhận thông điệp dẫn người dùng:

- **Tiêu đề modal**: "Link đã sẵn sàng"
- **Body**: hướng dẫn ngắn "Dán link này lên bài đăng → FB tự hiện tấm ảnh, khách bấm ảnh là về link đích"
- **Link box + Copy link** (giữ nguyên)
- **Mở thử link** (giữ nguyên)
- **Tạo tiếp** (giữ nguyên, reset form — đã fix)
- **Bỏ**: nút "Tải ảnh bìa" (theo yêu cầu), bỏ mọi ý tưởng caption trộn ký tự ẩn.

### 3. Triển khai domain thật qua Vercel (giải quyết dòng domain dài)

Dòng domain FB hiển thị = host của link đã dán. Domain tunnel free (`*.trycloudflare.com`) hiện ra dài + không tin cậy. Giải pháp:

- **Deploy app lên Vercel** (miễn phí, HTTPS permanent, hot-reload từ git/mã nguồn).
- **Gắn domain riêng** (người dùng tự mua, ví dụ gợi ý rẻ: `.xyz`, `.top`, `.site`) vào Vercel project.
- Sau khi gắn: mọi card link thành `https://tencua-ban.com/c/<slug>` → dòng domain dưới ảnh chỉ còn `tencua-ban.com`, ngắn và sạch.
- **Lưu ý triển khai:** DB dùng SQLite file (`piclink.db`) — trên Vercel serverless, filesystem không persistent giữa requests. Cần chọn 1 trong 2:
  - (a) Chuyển DB sang service bên ngoài (VD Turso/libSQL, hoặc Supabase Postgres) để dữ liệu bền.
  - (b) Tạm chấp nhận: giữ SQLite local cho bước test, triển khai DB đám mây trong vòng lặp kế tiếp.
- Mục này là phần riêng, có thể tách thành sub-project sau khi hoàn tất mục 1+2.

### 4. Không thay đổi

- Không thêm thuật toán obfuscate zero-width.
- Không thêm field mới vào DB.
- Không đổi luồng redirect của `/c/[slug]`.

### 5. Quyết định trước đó bị loại

- Trộn ký tự ẩn vào domain: **không khả thi** — FB tự bóc hostname từ URL đã dán, không đọc từ thẻ OG nào; URL chỉ thị được mọi thẻ thì đó là domain thật, không thể giấu.
- Domain dùng ký tự trống/ẩn: **không khả thi** — DNS không cho phép.

## Testing

- **Smoke (Playwright, `verify_hide_text.py` hiện tại)**: giữ nguyên — form vẫn có 2 radio Loại thẻ, Ảnh sạch khoá tiêu đề/mô tả.
- **Bổ sung**: assert OHG render qua curl crawler UA:
  - `curl -s "<host>/c/<slug>" -H "User-Agent: facebookexternalhit/1.1"` → trả 200, có `og:image`, không có `http-equiv="refresh"`, `og:title` là `&#8203;`.
  - `User-Agent: Zalo` → cũng trả 200 + `og:image` (regression từ bug zalo).
- Kiểm tra tay: tạo card Ảnh sạch → FB Sharing Debugger → "Scrape Again" → thấy 1 ảnh + domain nhỏ.

## Phạm vi loại trừ (YAGNI)

- Không làm photo post thuần.
- Không làm quảng cáo trả phí.
- Không làm caption/comment tự sinh.
- Không trộn ký tự ẩn vào domain/URL.