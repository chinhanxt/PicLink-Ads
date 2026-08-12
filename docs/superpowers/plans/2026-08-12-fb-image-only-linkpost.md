# Link Post "Chỉ còn 1 tấm ảnh" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu card "Ảnh sạch" để khi dán link lên Facebook chỉ hiện 1 tấm ảnh + dòng domain nhỏ, và modal sau khi tạo card dẫn người dùng dùng đúng cách (link post, bấm ảnh mở link).

**Architecture:** Không xây thêm hệ thống mới. Dựa vào cơ chế OG hiện có (`app/c/[slug]/route.ts`) — chế độ `hide_text=1` đã đặt `og:title='&#8203;'`, `og:description=''`. Việc cần làm: dọn modal (bỏ nút "Tải ảnh", cập nhật hướng dẫn) và bổ sung test crawler (facebookexternalhit + Zalo) xác nhận OG render "chỉ 1 ảnh" không còn meta refresh. Việc deploy Vercel + domain thật là sub-project riêng, không nằm trong plan này.

**Tech Stack:** Next.js (App Router), React, TypeScript, better-sqlite3, Playwright (script smoke).

## Global Constraints

- Không thêm thuật toán obfuscate zero-width vào domain/URL (đã loại ở spec).
- Không thêm field mới vào DB.
- Không đổi luồng redirect của `/c/[slug]`.
- Không xóa chức năng "Ảnh sạch" (`hideText`) và 2 radio Loại thẻ ở form.
- Ngôn ngữ UI: tiếng Việt, không dấu trong class name (theo convention hiện tại).
- Dev server: `npm run dev` trên `http://localhost:3000`.

---

### Task 1: Dọn modal success — bỏ nút "Tải ảnh", cập nhật hướng dẫn link post

**Files:**
- Modify: `app/page.tsx`
- Test: `.superpowers/sdd/verify_hide_text.py` (sửa assertion liên quan nút Tải ảnh)

**Interfaces:**
- Consumes: state hiện có `successResult` (`CreateCardResponse`), `resetForm`, `copyToClipboard`.
- Produces: modal không còn nút "Tải ảnh bìa"; body hướng dẫn mới. Không đổi các hàm.

- [ ] **Step 1: Cập nhật smoke test cho đúng UI mới**

Sửa `.superpowers/sdd/verify_hide_text.py`: sau khi tạo card thành công (không thực hiện tạo thật qua mạng), assert modal hiển thị **2** nút trong `modal-footer` (Mở thử link + Tạo tiếp), không có nút nào chứa text "Tải ảnh".

Thêm helper check cuối file (trước `browser.close()`):

```python
    # Modal success không còn nút Tải ảnh (đã bỏ theo spec)
    page.locator('input[placeholder*="khuyen-mai-shopee"]').fill("smoke-modal")
    page.locator('input[placeholder*="shopee.vn"]').fill("https://shopee.vn/product/1")
    page.locator("button[type=submit]").click()
    page.wait_for_timeout(800)
    check("modal shown", page.locator(".modal-title", has_text="Link đã sẵn sàng").count() == 1)
    check("no Tải ảnh button", page.locator("button", has_text="Tải ảnh").count() == 0)
    check("modal footer 2 buttons", page.locator(".modal-footer button, .modal-footer a").count() == 2)
    page.locator("button", has_text="Tạo tiếp").click()
    page.wait_for_timeout(300)
```

Lưu ý: khối này **thêm** vào script hiện có (giữ nguyên các check form phía trên), đặt trước `browser.close()`.

- [ ] **Step 2: Chạy test xác nhận FAIL (vì nút Tải ảnh vẫn còn)**

Run: `cd /home/chinhan/piclink-ads && python3 .superpowers/sdd/verify_hide_text.py`
Expected: check `no Tải ảnh button` FAIL (button vẫn tồn tại). Dev server phải đang chạy ở `localhost:3000`; nếu chưa chạy, khởi động bằng `npm run dev` ở tab khác.

- [ ] **Step 3: Xóa hàm `downloadCardImage` khỏi `app/page.tsx`**

Trong `app/page.tsx`, xóa nguyên khối hàm sau (từ dòng `const downloadCardImage = async () => {` đến dòng `};` trước `const resetForm`):

```tsx
  const downloadCardImage = async () => {
    const imgPath = successResult?.image_url;
    if (!imgPath) return;
    const url = `${window.location.origin}${imgPath}`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `piclink-${successResult?.slug || 'card'}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
    }
  };
```

- [ ] **Step 4: Xóa nút "Tải ảnh" khỏi modal**

Trong `app/page.tsx`, xóa khối:

```tsx
                <button onClick={downloadCardImage} className="btn btn-soft" style={{ flex: 1 }}>
                  Tải ảnh
                </button>
```

- [ ] **Step 5: Cập nhật body modal thành hướng dẫn link post**

Thay nội dung `<p className="modal-sub">...` trong modal bằng text:

```tsx
              <p className="modal-sub" style={{ textAlign: 'center', marginBottom: '20px' }}>
                Dán link này lên bài đăng Facebook — FB tự hiện tấm ảnh bìa,
                khách bấm vào ảnh là được chuyển thẳng về link đích.
              </p>
```

- [ ] **Step 6: Xóa field `image_url` khỏi interface (nếu không còn dùng)**

Trong `app/page.tsx`, interface `CreateCardResponse` có dòng `image_url?: string;` và trong `handleSubmit` có dòng `data.image_url = (data as any).card?.image_url || data.image_url;`. Sau khi xóa hàm tải ảnh, hai chỗ này thành dead code — xóa cả hai.

- [ ] **Step 7: Chạy test xác nhận PASS**

Run: `cd /home/chinhan/piclink-ads && npx tsc --noEmit && python3 .superpowers/sdd/verify_hide_text.py`
Expected: `TSC_OK` và toàn bộ check PASS (kể cả 4 check modal mới).

- [ ] **Step 8: Commit**

```bash
cd /home/chinhan/piclink-ads
git add app/page.tsx .superpowers/sdd/verify_hide_text.py
git commit -m "feat: remove download-image button, guide FB link-post usage in modal"
```

---

### Task 2: Test OG render cho crawler — facebookexternalhit + Zalo (regression)

**Files:**
- Create: `.superpowers/sdd/verify_og_render.sh`
- Test: chính script bash này (không phải unit test)

**Interfaces:**
- Consumes: card đã tồn tại trong DB (dùng slug bất kỳ hợp lệ). Cần một card `hide_text=1` — tạo qua API trước khi chạy, hoặc dùng card hiện có (vd query DB lấy slug mới nhất có `hide_text=1`).
- Produces: script exit code 0 khi tất cả assertion qua.

- [ ] **Step 1: Tạo script `.superpowers/sdd/verify_og_render.sh`**

Tạo file shell script:

```bash
#!/usr/bin/env bash
# Verify OG render cho card "Ảnh sạch" với crawler Facebook + Zalo.
# Chạy với dev server ở localhost:3000.
set -euo pipefail

BASE="${1:-http://localhost:3000}"
echo "BASE=$BASE"

SLUG=$(cd "$(dirname "$0")/../.." && node -e "
const Database = require('better-sqlite3');
const db = new Database('piclink.db', { readonly: true });
const row = db.prepare(\"SELECT slug FROM cards WHERE hide_text = 1 ORDER BY id DESC LIMIT 1\").get();
if (!row) { console.error('No hide_text card found'); process.exit(1); }
console.log(row.slug);
")
echo "SLUG=$SLUG"

FB_HTML=$(curl -s "$BASE/c/$SLUG" -H "User-Agent: facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")
ZALO_HTML=$(curl -s "$BASE/c/$SLUG" -H "User-Agent: Zalo")

fail=0
assert_contains() {
  if echo "$2" | grep -q "$1"; then
    echo "  ok  $3"
  else
    echo "  FAIL $3 (missing: $1)"
    fail=1
  fi
}
assert_absent() {
  if echo "$2" | grep -q "$1"; then
    echo "  FAIL $3 (should not contain: $1)"
    fail=1
  else
    echo "  ok  $3"
  fi
}

# Facebook crawler
assert_contains 'og:image'        "$FB_HTML"  "fb: has og:image"
assert_contains 'og:image:width" content="1200"' "$FB_HTML" "fb: og:image width 1200"
assert_contains 'og:title" content="&#8203;' "$FB_HTML" "fb: og:title invisible"
assert_contains 'og:description" content=""' "$FB_HTML" "fb: og:description empty"
assert_absent   'http-equiv="refresh"' "$FB_HTML" "fb: no meta refresh"
assert_contains "og:url"          "$FB_HTML"  "fb: has og:url"

# Zalo crawler (regression: UA 'Zalo' phải nhận OG, không bị 302)
assert_contains 'og:image'        "$ZALO_HTML" "zalo: has og:image"
assert_contains 'og:title" content="&#8203;' "$ZALO_HTML" "zalo: og:title invisible"

echo
if [ "$fail" -eq 0 ]; then
  echo "PASS"
else
  echo "FAIL"
fi
exit $fail
```

- [ ] **Step 2: Chạy script, xác nhận PASS**

Run: `cd /home/chinhan/piclink-ads && chmod +x .superpowers/sdd/verify_og_render.sh && ./.superpowers/sdd/verify_og_render.sh`
Expected: toàn bộ dòng `ok`, kết thúc `PASS`, exit 0. Nếu card `hide_text=1` không tồn tại, tạo một card Ảnh sạch qua API trước (dùng `curl -X POST /api/create-card` với `hideText:true`) hoặc chạy `python3 .superpowers/sdd/verify_hide_text.py` để có dữ liệu.

- [ ] **Step 3: Commit**

```bash
cd /home/chinhan/piclink-ads
git add .superpowers/sdd/verify_og_render.sh
git commit -m "test: add OG render regression for fb/zalo crawlers"
```

---

## Self-Review Ghi chú

- Spec yêu cầu "OG render chỉ 1 ảnh" → Task 2 test trực tiếp (og:title vô hình, desc rỗng, không meta refresh, có og:image).
- Spec yêu cầu "modal thể hiện rõ Copy link + Mở thử link, bỏ Tải ảnh" → Task 1.
- Spec yêu cầu "hướng dẫn link post" → Task 1 Step 5.
- Sub-project deploy Vercel + domain thật (mục 3 spec): ngoài phạm vi plan này (spec ghi rõ "có thể tách thành sub-project"). KHÔNG tạo task — plan chỉ phủ mục 1+2 của spec, đúng ý spec.
