# Shopify Playwright Framework — Session History

> Working record of the automation work done on this framework.
> Target storefront, Allure reporting, three new test suites, and the
> store/auth migration. Secrets are redacted.

**Project:** `shopify-playwright-framework`
**Stack:** Playwright + TypeScript, Page Object Model, Allure reporting
**Date of session:** 2026-07-09 · **Git branch:** `master`

---

## Table of contents

1. [Stores involved (read this first)](#1-stores-involved-read-this-first)
2. [Task 1 — Footer test suite](#2-task-1--footer-test-suite)
3. [Task 2 — Allure reporting](#3-task-2--allure-reporting)
4. [Task 3 — Announcement Bar test suite](#4-task-3--announcement-bar-test-suite)
5. [Task 4 — Slideshow test suite](#5-task-4--slideshow-test-suite)
6. [Task 5 — Featured Product (blocked)](#6-task-5--featured-product-blocked)
7. [Task 6 — Store migration & storefront auth](#7-task-6--store-migration--storefront-auth)
8. [Bugs found in the existing framework](#8-bugs-found-in-the-existing-framework)
9. [Theme gotchas worth remembering](#9-theme-gotchas-worth-remembering)
10. [Files created / changed](#10-files-created--changed)
11. [Current state & open items](#11-current-state--open-items)

---

## 1. Stores involved (read this first)

Most of the confusion in this session came from conflating two different stores.

| | Purpose | Auth | Can it show rendered DOM? |
|---|---|---|---|
| `lollipop-theme.myshopify.com` | Public demo store. **All original locators derived here.** | None (public) | ✅ Yes — plain HTTP fetch |
| `dt-prethi` → `wdtsanthanalakshmi` | The store the **Shopify MCP connector** points at | OAuth (Admin API) | ❌ No — returns JSON / Liquid source only |

**Key point:** element inspection was *never* done "via the MCP store". The MCP
Admin API cannot render HTML. Every locator came from fetching the live
storefront over HTTP, plus a headless-browser probe for JS-built DOM.

The MCP-connected store **changed mid-session** (`dt-prethi` → `wdtsanthanalakshmi`).
Always run `get-shop-info` to confirm; never trust a remembered value.

### How elements are inspected (the actual method)

1. Fetch the **rendered storefront HTML** over HTTP (`curl` / Playwright).
   Never the Admin API, never Liquid source — Liquid can't tell you the final
   class names (e.g. `featured-product.liquid` builds its root class from variables).
2. For JS-initialised DOM (Swiper, marquees), drive a **real browser probe**
   *after* initialisation.
3. Scope to **stable theme classes** (`.announcement-bar-section`,
   `.section-slideshow`), never the dynamic `shopify-section-template--…__xxx` ids.

---

## 2. Task 1 — Footer test suite

**Ask:** create `tests/Footer/footer.spec.ts`, follow the existing POM architecture.

The pre-existing `pages/FooterPage.ts` was a scaffold built on **assumptions**:
three heading-resolved columns, mobile accordions, a "Follow on Shop" button —
**none of which existed** in the live DOM. It also imported a locators file that
didn't exist, so it didn't even compile.

Rewrote it against the real footer:

- `.footer-block--brand` → `a.logo_link[href="/"]` + logo image
- **One** link-list menu `.footer-block--menu` ("Pages"): Shop, Our Story, Journal, Faq, Contact
- Social block (`ul.footer__list-social`) — **7** placeholder (`href="#"`) links
- Bottom bar `.footer_bottom`: localization `<localization-form>`, copyright, and
  `ul.payment-icons-list` with **6** icons

**Result:** 35 tests × 3 projects = **105, all passing.**

Documented as *not automatable*: the "Pages" list has no `.collapse` class, so
there is **no working mobile accordion** to test; social links are placeholders;
country selection is side-effectful and skipped.

Also made the "all footer images loaded" test deterministic — it was flaky
because a visible image can still report `naturalWidth === 0` mid-load. Replaced
the one-shot check with `expect.poll` on `complete && naturalWidth > 0`.

---

## 3. Task 2 — Allure reporting

**Ask:** integrate Allure, one command to run + report.

Most of it already existed (`allure-playwright@3.10.2`, `allure-commandline@2.43`,
Java 17, reporter config, npm scripts). Verified all reporter options were valid
for v3 and that env info, categories, per-test steps, and browser/device labels
were being emitted.

### The real bug
`allure-results/` **was never cleaned**. The reporter *appends* results, and
`allure generate --clean` only wipes the **report** folder, not the **results**.
So 564 stale files from ~10 past runs were being merged into every report — you
ran one spec and got a report for all four.

### Fixes
- Added a Playwright `globalSetup` that clears `allure-results/` at the start of
  **every** run, however it's launched (single spec, full suite, VS Code runner).
  Trend `history` is preserved.
  → Verified: running only the announcement spec logged
  `[allure] cleared 499 stale entries` and produced exactly 31 results.
- Rewrote `scripts/allure-report.mjs` into a true one-command flow:
  clean → run → restore trend history → generate → serve.
- Enriched `environmentInfo` (Executor / Browser / Devices) and added
  `globalLabels` for project-wide Allure **tags** (`storefront`, `ui`) + an epic.
- Added `allure:serve`.

### Two viewing traps (both hit)
1. **`allure open` is a foreground web server, not a hang.** "Starting web
   server…" holding the terminal is normal. Pinned it to
   `--host localhost --port 8080` so there's always a known URL.
2. **Never open `allure-report/index.html` directly.** Allure loads its data via
   `fetch()`, which browsers block on the `file://` protocol → every widget shows
   *"500 Failed to fetch."* It **must** be served over HTTP.

```bash
npm run test:allure     # clean → run → generate → serve  (single command)
npm run allure:open     # serve an existing report at http://localhost:8080
```

---

## 4. Task 3 — Announcement Bar test suite

**Ask:** create `tests/announcement-bar.spec.ts`.

Live implementation: a **horizontal CSS marquee** (not a slideshow) pinned above
the header.

- `.marquee_annoucement { animation: scroll-left 60s linear infinite }`,
  pauses via `.announcement_bar_style-horizontal:hover`
- **Two tracks**: an active server-rendered one (5 blocks, "Welcome to our store")
  and a second carrying `inert` (a11y-hidden) for the seamless loop
- No dismiss control, no links, not swiper/vertical mode

**Result:** 31 tests × 3 projects = 93 → **91 passed, 2 skipped** (the hover-pause
test auto-skips on touch devices via `matchMedia('(hover: hover)')`).

### Caught by running it
My first "loop invariant" test asserted both tracks hold the same block count.
The run showed active = 5, duplicate = **4** — the duplicate is a **JS-built fill
track**, not a clone. Rewrote it to assert the duplicate *repeats the same message*.

`.marquee_annoucement` is **also** used by the home-page wave-marquee, so every
selector is scoped under `.announcement-bar-section` to avoid double-matching.

---

## 5. Task 4 — Slideshow test suite

**Ask:** create `tests/slideshow.spec.ts`.

Swiper slider inside `<wdt-slideshow>`, options
`{loop:true, fade:true, dots:true, auto_play:0}` — **autoplay disabled,
dots-only navigation, no prev/next arrows.** 3 slides, each with a heading, a
`View Collection` CTA (`target=_blank`) and separate desktop/mobile images + overlays.

**Result:** 30 tests × 3 projects = **90, all passing, zero flakes.**

### Two gotchas found by a runtime probe
1. **`fade:true` ⇒ Swiper creates no loop clones.** `.swiper-slide` count is a
   clean 3. (Guarded with `:not(.swiper-slide-duplicate)` anyway.)
2. **`text-capitalize` CSS** makes `innerText` return title-cased text
   ("Because **F**lawless…") while `textContent` returns the raw source. All
   heading assertions use `textContent`, normalised + case-insensitive, so they
   hold across Chromium and WebKit.

Bullets are real controls: `role="button"`, `aria-label="Go to slide N"`, `aria-current`.

---

## 6. Task 5 — Featured Product (blocked)

**Ask:** create `tests/featured-product.spec.ts`.

The request initially contradicted itself (filename said Featured Product, body
said Slideshow). Clarified, then investigated.

### Findings
- **No Featured Product section existed** on the demo storefront. Verified across
  6 templates with cache-busting: `featured-product` → **0 hits**. What the theme
  ships on the home page is a **Featured *Collection*** carousel.
- The nearest real equivalent is the **product page's `__main` section**, which I
  fully probed (title, vendor, price + compare-at + discount badge, 4 size
  variants with 2 sold out, per-variant inventory caps, quantity stepper,
  add-to-cart wired to the cart drawer).
- After the store migration, the theme **does** ship `sections/featured-product.liquid`
  (schema name *"Featured product"*), and the section **is placed** on the home
  template of your store.

### The remaining blocker
```json
"featured_product_mQpCa9": { "settings": { "product": "" } }   ← no product assigned
```
It renders Shopify's onboarding placeholder: `Product title`, `€0,00`, fake
`Option 1–4` variants, **no `<form action="/cart/add">`**, and `#addToCart` is
`disabled` reading **"Sold out"**. Nothing meaningful to automate until a product
is assigned.

### Recommendation (not yet implemented)
Don't rely on a human assigning it and pinging me each time — that isn't
automation. Instead:
- **Pinned QA theme** (duplicate, never published) + `SHOPIFY_PREVIEW_THEME_ID`.
- **Seed the section settings via the Admin API** (`scripts/seed-theme.mjs`),
  so store state is code.
- Add a **loud precondition guard** so an unassigned product fails with
  *"no product assigned — run `npm run seed:theme`"* rather than 20 cryptic errors.

Never automate the Shopify Admin UI / Google SSO login — the Admin API does this
properly and needs no login.

---

## 7. Task 6 — Store migration & storefront auth

Target moved from the public demo to `wdtsanthanalakshmi.myshopify.com`
(Shopify Plus Development plan), where **Lollipop is now published**
(`MAIN`, theme id `188143075695`).

### The `storefront_digest` trick is dead
The widely-cited bypass — set cookie `storefront_digest = md5(password)` — **does
not work** on current Shopify. Proven empirically: setting it leaves you gated,
and after a *successful* form login Shopify sets **no `storefront_digest` at all**.
The session rides on `_shopify_essential`.

### What was implemented
`scripts/allure-global-setup.ts` now (Playwright allows only one `globalSetup`):
1. Clears stale `allure-results/` (keeps `history`).
2. Performs a **real password-form login once**
   (`input#password[name=password]` → `form[action="/password"] button[type=submit]`),
   then saves `playwright/.auth/storefront.json`.
3. Optionally plants `?preview_theme_id=` so an unpublished/DEMO theme renders
   without publishing it.

`playwright.config.ts` reuses it via `use.storageState`, but **only** when
`SHOPIFY_STOREFRONT_PASSWORD` or `SHOPIFY_PREVIEW_THEME_ID` is set — so open
storefronts behave exactly as before. It throws a clear error if still gated,
instead of failing hundreds of tests with timeouts.

Verified:
```
[allure] cleared 6 stale entries from ./allure-results (kept history)
[storefront] authenticated wdtsanthanalakshmi.myshopify.com
[storefront] session saved → playwright/.auth/storefront.json
  4 passed
```

### Secret handling
- `.env` is **gitignored, untracked, and never appeared in git history**.
- Added `.env.example` — committable, keys documented, **no values**.
- `globalSetup` **never logs** the password and runs *outside* test fixtures, so
  it cannot leak into traces, videos, or screenshots.
- `dotenv` does not override real env vars → in CI, set the password as a masked
  secret and nothing needs to touch disk.

---

## 8. Bugs found in the existing framework

| # | Bug | Impact | Fix |
|---|---|---|---|
| 1 | `allure-results` never cleaned | Report showed every spec ever run | `globalSetup` clears it per run |
| 2 | **`dotenv` never imported** | `.env` was completely **inert**; `SHOPIFY_BASE_URL` silently fell back to a hardcoded default | `import 'dotenv/config'` in `playwright.config.ts` |
| 3 | Env-var name mismatch | `playwright.config.ts` read `STORE_URL`; `BasePage.js` / `helper.js` read `SHOPIFY_BASE_URL` — could point at different stores | Unified on `SHOPIFY_BASE_URL`, `STORE_URL` kept as fallback |
| 4 | Trailing slash in base URL | Would yield `//products/...` once dotenv went live | Stripped in config, `BasePage`, `helper` |
| 5 | `FooterPage.ts` scaffold | Assumed a DOM that didn't exist; imported a missing locators file → wouldn't compile | Rewritten from the live DOM |
| 6 | `scripts/` outside `tsconfig.include` | Editor errors (`Cannot find name 'node:fs'`) | Added `scripts` to `include` |
| 7 | Flaky footer image test | Visible image can report `naturalWidth === 0` mid-load | `expect.poll` until decoded |

---

## 9. Theme gotchas worth remembering

- **Dynamic section ids** (`shopify-section-template--…__slideshow_3Y9cHE`) —
  never hardcode; scope by stable classes.
- **`.marquee_annoucement` is shared** between the announcement bar and the
  home-page wave-marquee → always scope.
- **Swiper `fade:true` ⇒ no clones**; `loop` without fade *does* clone.
- **`aria-selected` lies at runtime** on variant/slide items — trust the
  `.selected` class instead.
- **`text-capitalize`** → `innerText` ≠ `textContent`. Use `textContent`.
- **Variant items duplicate their label** via a visually-hidden span → match on
  `data-swatch`, not `innerText`.
- **Quantity `max` is per-variant inventory** — switching variant changes both
  price and max (40 → 10 observed). Read it from the DOM; don't hardcode.
- **Clicking a sold-out variant still selects it**; the guard is the disabled
  `#addToCart` ("Sold out"), not the variant list.
- **Prices are currency-dependent** (demo rendered AED, your store is INR) →
  assert currency-agnostically.
- The footer's `.footer-heading` elements are `d-none` → assert with
  `toContainText`/`textContent`, not visibility.

---

## 10. Files created / changed

### Test suites
- `tests/Footer/footer.spec.ts` — 35 tests
- `tests/announcement-bar.spec.ts` — 31 tests
- `tests/slideshow.spec.ts` — 30 tests

### Page Objects
- `pages/FooterPage.ts` *(rewritten from live DOM)*
- `pages/AnnouncementBarPage.ts`
- `pages/SlideshowPage.ts`
- `pages/BasePage.js` *(base-URL normalisation)*

### Locators
- `locators/footer.locators.ts`
- `locators/announcement-bar.locators.ts`
- `locators/slideshow.locators.ts`

### Config / infra
- `playwright.config.ts` — dotenv, unified base URL, `storageState`, `globalSetup`, Allure env + tags
- `scripts/allure-global-setup.ts` — results cleanup + storefront login
- `scripts/allure-report.mjs` — one-command clean → run → generate → serve
- `package.json` — `allure:serve`, pinned host/port
- `tsconfig.json` — added `scripts`
- `.env` / `.env.example` / `.gitignore`
- `data/testData.json` — `footer`, `announcementBar`, `slideshow` keys
- `utils/helper.js` — base-URL normalisation

### Totals
**96 tests × 3 projects (desktop-chromium, tablet, mobile webkit)**, green on the
demo store: Footer 105, Announcement Bar 91 + 2 skipped, Slideshow 90.

---

## 11. Current state & open items

### ✅ Done
- Three production-ready suites, all green on the demo store
- Allure reporting: correct, single-command, per-run scoped, trend history
- Storefront auth working against the password-protected store
- Lollipop confirmed published on `wdtsanthanalakshmi`
- Secrets audited and masked

### ⚠️ Open

**1. `testData.json` drift.** Locators/POMs port perfectly; **content does not.**
Verified by inspecting the new store's footer:

| Field | Expected (demo) | Actual (your store) |
|---|---|---|
| logo alt | `Lollipop-theme` | `null` |
| menu links | 5 (Shop, Our Story, …) | 1 (`Search` → `/search`) |
| social | 7 | 0 |
| **payments** | **6** | **6 ✅ identical** |
| copyright | `Lollipop-theme` | `Wdtsanthanalakshmi` |

Payments matching exactly is the proof the **locators are correct** — those come
from Shopify's payment settings, not theme content. Everything else is simply
unconfigured on a freshly uploaded theme.

**2. Featured Product** — needs a product assigned to the section.

### Three ways forward

- **A — Configure the store.** Set the footer logo/menu/social and assign a
  Featured Product in the customizer. Fastest path to green.
- **B — Re-derive `testData.json` per store.** `scripts/derive-testdata.mjs`
  inspects whatever `SHOPIFY_BASE_URL` points at and regenerates the expected
  values. `npm run derive:testdata`.
- **C — Stop hardcoding content** *(best long-term, esp. for testing many themes)*.
  Split assertions:
  - **Structure/behaviour** → portable, zero fixtures (marquee animation, bullet
    navigation, a11y contracts). Most of the current suites already are this.
  - **Content** → fetch the source of truth at runtime (linklist, assigned
    product, section settings) and assert *the DOM renders what's configured*.

  Under **C**, today's footer failures become structurally impossible: an empty
  menu would correctly render an empty menu and pass — while still catching a
  theme bug that drops a configured link.

**Recommended:** B now, C incrementally.

### Infrastructure advice
Request a **dedicated Partner development store** for automation (free,
unlimited, isolated). But a store alone isn't enough — pair it with:
1. **Pin the theme** via `SHOPIFY_PREVIEW_THEME_ID` (don't follow whatever is `MAIN`).
2. **Seed data as code** via the Admin API.
3. Storefront password as a **CI secret**.
4. Admin API token with `read_products`, `read_themes`, `write_themes` —
   **never** the Google SSO login.
