# UI Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the PicLink Ads UI by aligning the stylesheet with the class contracts used by the existing React pages.

**Architecture:** Keep `app/page.tsx` and `app/links/page.tsx` behavior intact. Extend `app/globals.css` with the missing component styles and responsive rules. Validate the styles with a Playwright browser assertion against both routes.

**Tech Stack:** Next.js 15, React 19, CSS, Playwright (local Python runner).

## Global Constraints

- Do not change routes, API payloads, SQLite data, or business logic.
- Preserve Vietnamese copy and all existing interactive controls.
- Support 1440px desktop and 390px mobile viewports.

---

### Task 1: Add the missing CSS contracts

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Existing JSX classes from `app/page.tsx` and `app/links/page.tsx`.
- Produces: CSS selectors for every rendered UI component.

- [ ] **Step 1: Write the failing browser contract test**

Assert that in-use classes `page`, `card`, `input`, `btn`, `seg`, `dropzone`, and `card-radio-group` resolve to direct CSS selectors on `/`.

- [ ] **Step 2: Run the test to verify it fails**

Run the local Next server with Playwright. Expected: failure naming at least `card-radio-group` as missing.

- [ ] **Step 3: Implement the minimal stylesheet compatibility layer**

Add component styles for page containers, cards, form controls, segmented inputs, upload state, radio cards, buttons, empty/error/loading states, tables, metrics, modals, and header aliases. Add media rules that stack form actions and make tables scroll horizontally.

- [ ] **Step 4: Run the browser contract test to verify it passes**

Run the same Playwright assertion for `/` and `/links`. Expected: zero missing contracts and no page errors.

### Task 2: Verify build and rendered responsive UI

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Browser-compatible stylesheet from Task 1.
- Produces: A production build and verified desktop/mobile rendering.

- [ ] **Step 1: Run the production build**

Run: `npm run build`.

Expected: exit code 0.

- [ ] **Step 2: Run desktop and mobile browser checks**

Open `/` and `/links` at 1440px and 390px widths. Assert no horizontal document overflow except the intentionally scrollable table container and no browser console/page errors.
