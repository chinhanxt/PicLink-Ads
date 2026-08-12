# Mode Ẩn Chữ — Chỉ Hiện Đúng 1 Ảnh: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi bật "Ẩn Chữ" trên trang chủ, khu Xem Trước của cả 5 nền tảng chỉ còn nền màu nền tảng + duy nhất 1 ảnh bìa (không avatar / Sponsored / comment / tweet / domain / title / desc), kèm badge báo hiệu trong header hộp preview.

**Architecture:** 1 "clean shell" dùng chung (`CleanPreview`) render khi `hideText === true`; tra cứu màu nền theo `activeTab` qua map `PLATFORM_BG`. Khi `hideText === false` giữ nguyên 5 block preview hiện tại. Chỉ sửa `app/page.tsx`, tận dụng class CSS đã có.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `app/page.tsx` (client component). Kiểm thử bằng Python Playwright + `tsc --noEmit` (dự án chưa có test runner).

## Global Constraints

- Chỉ sửa file `app/page.tsx`. Không sửa `app/c/[slug]/route.ts`, `app/api/*`, `app/links/page.tsx`, CSS.
- Tắt Ẩn Chữ (`hideText === false`): render phải giữ nguyên hệt hành vi hiện tại.
- Không submit form / không tạo bản ghi mới trong `piclink.db` khi kiểm thử (chỉ điền URL ảnh vào ô URL mode).
- Dự án **chưa phải git repo** → bỏ qua mọi bước `git commit`; kết thúc mỗi task ở bước kiểm thử.
- Dev server phải đang chạy tại `http://localhost:3000` (nếu chưa: `npm run dev` trong `/home/chinhan/piclink-ads`).
- Giao diện tuân thủ design system hiện tại: nền tối, accent `#52a8ff` (chip dùng class có sẵn `.chip-chip-accent` → viết là `.chip chip-accent`).

---

### Task 1: Viết kịch bản kiểm thử (Playwright) — phải FAIL trước khi có code

**Files:**
- Create: `/tmp/verify_hide_text.py`

**Interfaces:**
- Consumes: dev server `http://localhost:3000`, ảnh có sẵn `/uploads/1786353372841_xxr6lq.jpg`
- Produces: script trả exit code 0 (PASS) khi tất cả check đạt, 1 (FAIL) khi có check trượt.

- [ ] **Step 1: Tạo script kiểm thử**

```python
#!/usr/bin/env python3
from playwright.sync_api import sync_playwright

UPLOAD = "http://localhost:3000/uploads/1786353372841_xxr6lq.jpg"
TABS = [("facebook", "Facebook Feed"), ("fb_comment", "FB Comment"), ("zalo", "Zalo Chat"),
        ("twitter", "Twitter / X"), ("telegram", "Telegram")]
FAILED = []

def check(name, ok):
    print(("  ok  " if ok else "  FAIL") + f" {name}")
    if not ok:
        FAILED.append(name)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1200})
    page.goto("http://localhost:3000/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)

    # Điền ảnh qua URL mode để previewImage có giá trị
    page.locator(".seg-btn", has_text="Nhập URL").click()
    page.locator("input[placeholder*='banner.jpg']").fill(UPLOAD)
    page.wait_for_timeout(500)

    check("badge absent when hideText off", page.locator("text=Ảnh sạch 100%").count() == 0)

    # Bật Ẩn Chữ
    page.locator(".toggle-row").click()
    page.wait_for_timeout(400)

    check("badge shown when hideText on", page.locator("text=Ảnh sạch 100%").count() == 1)

    for tab_id, tab_label in TABS:
        page.locator(".preview-tabs .tab", has_text=tab_label).click()
        page.wait_for_timeout(250)
        shell_text = page.locator(".preview-shell").inner_text().strip()
        img_count = page.locator(".preview-shell img").count()
        check(f"{tab_id}: exactly 1 img", img_count == 1)
        check(f"{tab_id}: shell has no text", shell_text == "")

    # Tắt -> FB header text hiện lại, badge biến mất
    page.locator(".toggle-row").click()
    page.wait_for_timeout(300)
    page.locator(".preview-tabs .tab", has_text="Facebook Feed").click()
    check("fb header text back when hideText off",
          "PicLink Ads Sponsor" in page.locator(".preview-shell").inner_text())
    check("badge gone when hideText off", page.locator("text=Ảnh sạch 100%").count() == 0)

    browser.close()

print(f"\n{'PASS' if not FAILED else 'FAIL: ' + ', '.join(FAILED)}")
exit(0 if not FAILED else 1)
```

- [ ] **Step 2: Chạy để xác nhận nó FAIL**

Run in `/home/chinhan/piclink-ads`:
```bash
python3 /tmp/verify_hide_text.py
```
Expected: FAIL với ít nhất các check về badge khi bật (hiện chưa có `CleanPreview`) và "shell has no text" ở các tab fb_comment / zalo / twitter / telegram (hiện vẫn còn chữ trong khung).

---

### Task 2: Triển khai CleanPreview + nhánh rẽ + badge trong `app/page.tsx`

**Files:**
- Modify: `/home/chinhan/piclink-ads/app/page.tsx`

**Interfaces:**
- Consumes: state `hideText`, `activeTab`, `previewImage` (đã tồn tại trong component).
- Produces: `PLATFORM_BG` (map string→hex), component `CleanPreview({ bg, image })`.

- [ ] **Step 1: Thêm map `PLATFORM_BG` và component `CleanPreview`**

Chèn ngay sau khối `PLATFORM_TABS` (sau dòng đóng `] as const;`):

```tsx
const PLATFORM_BG: Record<string, string> = {
  facebook: '#242526',
  fb_comment: '#242526',
  zalo: '#0068ff',
  twitter: '#000000',
  telegram: '#17212b',
};

function CleanPreview({ bg, image }: { bg: string; image: string }) {
  return (
    <div style={{ background: bg, padding: '16px' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '1200 / 630',
          background: '#000',
          overflow: 'hidden',
          borderRadius: '6px',
        }}
      >
        {image ? (
          <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#65676b',
              background: '#3a3b3c',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>🖼️</span>
            <span style={{ fontSize: '0.85rem', marginTop: '8px' }}>Chưa chọn hình ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Nhánh rẽ render preview**

Tìm dòng:

```tsx
            <div className="preview-shell" style={{ marginTop: '12px' }}>
              {activeTab === 'facebook' && (
```

Thay thành:

```tsx
            <div className="preview-shell" style={{ marginTop: '12px' }}>
              {hideText ? (
                <CleanPreview bg={PLATFORM_BG[activeTab] || '#242526'} image={previewImage} />
              ) : (
                <>
              {activeTab === 'facebook' && (
```

- [ ] **Step 3: Đóng nhánh rẽ**

Tìm khối cuối cùng của 5 tab (sau khi đóng block telegram, trước `</div>` đóng `.preview-shell`):

```tsx
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
```

Thay thành (thêm `</>` và dấu đóng `)}`):

```tsx
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
```

- [ ] **Step 4: Bỏ điều kiện `hideText` trong tab Facebook Feed (giờ đã không thể chạy)**

Tìm:

```tsx
                  {!hideText && (
                    <div style={{ padding: '12px 16px', background: '#3a3b3c', borderTop: '1px solid #4e4f50' }}>
```

Thay thành (bỏ wrapper điều kiện):

```tsx
                  (
                    <div style={{ padding: '12px 16px', background: '#3a3b3c', borderTop: '1px solid #4e4f50' }}>
```

Và tìm khối đóng kèm:

```tsx
                      </div>
                    </div>
                  )}
                </div>
              )}
```

Thay thành:

```tsx
                      </div>
                    </div>
                  )}
                </div>
              )}
```

> Lưu ý: giữ nguyên `)}` đóng khối `( {...} )`. Sau Step 4 vùng footer của tab facebook phải là `( <div ...>...</div> )` thuần — nhánh `hideText` đã bị thay bằng CleanPreview nên điều kiện cũ không bao giờ đúng nữa, ta bỏ nó để gọn. Nếu bạn đánh dấu thì giữ `{!hideText && ` cũng KHÔNG hỏng chức năng — nhưng Step 4 cho kết quả sạch hơn.

- [ ] **Step 5: Thêm badge trong header hộp preview**

Tìm:

```tsx
            <div className="card-header">
              <h3 className="section-title">Xem Trước Trực Tiếp</h3>
              <span className="chip chip-accent">Realtime Render</span>
            </div>
```

Thay thành:

```tsx
            <div className="card-header">
              <h3 className="section-title">Xem Trước Trực Tiếp</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {hideText && <span className="chip chip-accent">Ảnh sạch 100% · Chỉ hiện ảnh</span>}
                <span className="chip chip-accent">Realtime Render</span>
              </div>
            </div>
```

- [ ] **Step 6: Check type**

Run in `/home/chinhan/piclink-ads`:
```bash
npx tsc --noEmit
```
Expected: không output, exit code 0.

- [ ] **Step 7: Chạy kiểm thử xác nhận PASS**

```bash
python3 /tmp/verify_hide_text.py
```
Expected: PASS, tất cả check in `ok`.

---

## Self-Review

**Spec coverage (đối chiếu spec `2026-08-12-hide-text-clean-image-design.md`):**
- Mục 2.1 (5 tab vẫn chuyển được) → Task 2 Step 2 (nhánh rẽ giữ tab UI chung). ✓
- Mục 2.2 (chỉ nền + 1 ảnh, không text) → CleanPreview + test "no text"/"1 img". ✓
- Mục 2.3 (badge ngoài khung) → Task 2 Step 5 + test badge present/absent. ✓
- Mục 2.4 (tắt → giữ nguyên) → test "fb header text back" + "badge gone". ✓
- Mục 3 (map màu, tái sử dụng khối img/placeholder) → Step 1. ✓
- Mục 5 (placeholder khi chưa có ảnh) → nhánh `else` của CleanPreview. ✓ (không có check tự động riêng cho cả 5 tab ở trạng thái rỗng để giữ script gọn; trạng thái rỗng vẫn render placeholder.) ✓
- Mục 6 (tsc + Playwright, không tạo DB record) → Step 6/7 + script không submit. ✓

**Placeholder scan:** Không có TBD/TODO; mọi bước đều có code/command đầy đủ.

**Type consistency:** `PLATFORM_BG` (Record<string,string>), `CleanPreview({bg, image})` dùng đúng tên ở Step 2. Selector kiểm thử khớp class có sẵn: `.seg-btn`, `.toggle-row`, `.preview-tabs .tab`, `.card-header`, `.preview-shell`. ✓