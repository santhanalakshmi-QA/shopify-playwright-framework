# Lollipop Shopify Home Page — Playwright Test Suite

Generated from the Shopify home page requirement checklist. Each checklist
section maps to its own folder (in checklist order), and each folder holds one
`*.spec.ts` file whose `test.describe()` / `test()` blocks cover the checklist
point across positive, negative, boundary, validation, UI, responsive,
accessibility and edge-case scenarios.

**Theme under test:** `https://lollipop-theme.myshopify.com/`

## Folder ↔ checklist mapping

| # | Folder | Checklist point |
|---|--------|-----------------|
| 1 | `tests/01-slideshow` | Three slideshows |
| 2 | `tests/02-featured-products` | Five featured products, three of which are the same product |
| 3 | `tests/03-featured-collections` | Three different featured collections |
| 4 | `tests/04-collection-list` | One collection list |
| 5 | `tests/05-image-with-text` | Three image with text |
| 6 | `tests/06-newsletter` | One newsletter |
| 7 | `tests/07-rich-text` | One rich text |
| 8 | `tests/08-blog-posts` | One blog post |
| 9 | `tests/09-video` | Two video (if applicable) |
| 10 | `tests/10-homepage-section-count` | Add additional sections until the homepage has 25 sections + overall "verify they work" |

## Setup

```bash
npm install
npx playwright install
```

## Run

```bash
npm test                     # all sections, all projects (desktop/tablet/mobile)
npm run test:desktop         # desktop-chromium only
npm run test:slideshow       # just the slideshow folder
STORE_URL=https://your-store.myshopify.com npm test   # override base URL
npm run report               # open the last HTML report
```

## Notes on selectors

Shopify wraps every section in `<div id="shopify-section-...">`. Section *type*
is detected via type classes (`.slideshow`, `.featured-product`,
`.collection-list`, etc.) defined in `support/shopify.ts`. Selectors are
intentionally permissive so the suite tolerates minor markup differences. If the
Lollipop theme uses different class names, update the `SECTION_SELECTORS` map in
`support/shopify.ts` — every spec reads from that single source of truth.

Tests that depend on optional theme settings (autoplay, variants, sold-out
states, video, "view all" links) use `test.skip(...)` so they degrade
gracefully rather than producing false failures.
