// tests/slideshow.spec.ts
// ─────────────────────────────────────────────────────────────
// Slideshow (hero banner) test suite for the Lollipop Shopify theme
// (https://lollipop-theme.myshopify.com/).
//
// Coverage was derived by inspecting the LIVE, JS-initialised DOM (Shopify
// MCP server + storefront HTML + a runtime Swiper probe) rather than from
// assumptions. Verified:
//   • <section.section-slideshow> → <wdt-slideshow> → .swiper.slideshow_swiper
//     options: {loop:true, fade:true, dots:true, auto_play:0}
//   • 3 slides (fade ⇒ no loop clones). Each slide: desktop+mobile image,
//     desktop+mobile overlay with an <h2> heading and a "View Collection"
//     CTA (a.btn, target=_blank) linking to a collection.
//   • Navigation is via 3 pagination bullets (role=button, aria-label
//     "Go to slide N"). NO prev/next arrows; NO autoplay.
//
// Architecture: intent lives in pages/SlideshowPage.ts (extends BasePage);
// selectors live in locators/slideshow.locators.ts; shared utilities come
// from utils/helper.js; expected values come from data/testData.json.
// No locators are written inline here.
//
// Headings use the theme's `text-capitalize` CSS, so comparisons use raw
// textContent, case-insensitively, to stay stable across browsers.
//
// NOTES / non-automatable items are documented at the bottom of file.
// ─────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SlideshowPage } from '../pages/SlideshowPage';
import { BREAKPOINTS, collectErrors, expectImageLoaded } from '../utils/helper.js';
import testData from '../data/testData.json';

const SS = testData.slideshow;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

// ═════════════════════════════════════════════════════════════
// 1. STRUCTURE & PRESENCE
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Structure & Presence', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('slideshow section renders and is visible', async () => {
    await expect(ss.section).toBeVisible();
    await expect(ss.swiper).toBeVisible();
  });

  test('Swiper initialises on load', async ({ page }) => {
    await expect(page.locator('section.section-slideshow .slideshow_swiper.swiper-initialized')).toBeVisible();
  });

  test('renders exactly the expected number of slides', async () => {
    await expect(ss.realSlides).toHaveCount(SS.slideCount);
  });

  test('renders one pagination bullet per slide', async () => {
    await expect(ss.pagination).toBeVisible();
    await expect(ss.bullets).toHaveCount(SS.slideCount);
  });

  test('the decorative shape divider is present', async () => {
    await expect(ss.shape).toBeAttached();
  });
});

// ═════════════════════════════════════════════════════════════
// 2. SLIDE CONTENT & VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Content & Validation', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('each slide exposes a non-empty heading', async () => {
    await expect(ss.slideHeadings).toHaveCount(SS.slideCount);
    const texts = (await ss.slideHeadings.allTextContents()).map(norm);
    for (const [i, t] of texts.entries()) {
      expect(t, `slide #${i} heading should not be empty`).not.toEqual('');
    }
  });

  test('slide headings match the configured content, in order', async () => {
    const actual = (await ss.slideHeadings.allTextContents()).map(norm);
    const expected = SS.slides.map((s: { heading: string }) => norm(s.heading));
    expect(actual).toEqual(expected);
  });

  test('each slide has a CTA linking to its collection with the expected label', async () => {
    await expect(ss.slideCtas).toHaveCount(SS.slideCount);
    for (let i = 0; i < SS.slideCount; i++) {
      const cta = ss.slideCtas.nth(i);
      await expect(cta).toHaveAttribute('href', SS.slides[i].href);
      await expect(cta).toHaveAttribute('aria-label', SS.ctaLabel);
      expect(norm(await cta.textContent() ?? '')).toBe(norm(SS.ctaLabel));
    }
  });

  test('every slide renders at least one image', async () => {
    const count = await ss.realSlides.count();
    expect(count).toBe(SS.slideCount);
    for (let i = 0; i < count; i++) {
      const imgs = ss.realSlides.nth(i).locator('.swipper_banner img');
      expect(await imgs.count(), `slide #${i} should have image(s)`).toBeGreaterThan(0);
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 3. NAVIGATION  (pagination dots — functional)
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Navigation', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('the first slide is active by default', async () => {
    expect(await ss.activeBulletIndex()).toBe(0);
    expect(norm(await ss.activeHeadingText())).toBe(norm(SS.slides[0].heading));
  });

  test('clicking each pagination bullet activates the matching slide', async () => {
    for (let i = 0; i < SS.slideCount; i++) {
      await ss.goToSlide(i);
      expect(await ss.activeBulletIndex(), `bullet ${i} should be active`).toBe(i);
      expect(
        norm(await ss.activeHeadingText()),
        `slide ${i} heading should be shown`,
      ).toBe(norm(SS.slides[i].heading));
    }
  });

  test('navigating back to the first bullet returns to the first slide', async () => {
    await ss.goToSlide(SS.slideCount - 1);
    expect(norm(await ss.activeHeadingText())).toBe(norm(SS.slides[SS.slideCount - 1].heading));
    await ss.goToSlide(0);
    expect(norm(await ss.activeHeadingText())).toBe(norm(SS.slides[0].heading));
  });

  test('the active pagination bullet is unique at any time', async () => {
    await ss.goToSlide(1);
    await expect(ss.activeBullets).toHaveCount(1);
  });
});

// ═════════════════════════════════════════════════════════════
// 4. CTA BEHAVIOUR  (functional)
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - CTA behaviour', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('the active slide CTA opens its collection in a new tab (target=_blank)', async ({ context }) => {
    const cta = ss.activeDesktopCta();
    await expect(cta).toHaveAttribute('target', '_blank');
    const href = await cta.getAttribute('href');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      cta.click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain(href!);
    await expect(popup).toHaveURL(/\/collections\//);
    await popup.close();
  });
});

// ═════════════════════════════════════════════════════════════
// 5. AUTOPLAY  (negative / edge — autoplay is disabled in this config)
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Autoplay disabled', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('the slideshow does not auto-advance (auto_play = 0)', async ({ page }) => {
    const before = await ss.activeHeadingText();
    await page.waitForTimeout(3000); // deliberate wait to prove no auto-rotation
    const after = await ss.activeHeadingText();
    expect(norm(after)).toBe(norm(before));
    expect(await ss.activeBulletIndex()).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════
// 6. UI / MEDIA
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - UI & Media', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('the active slide and its heading are visible', async () => {
    await expect(ss.activeSlide).toBeVisible();
    await expect(ss.activeDesktopHeading()).toBeVisible();
  });

  test('the active slide desktop image is loaded', async () => {
    await expectImageLoaded(ss.activeDesktopImage());
  });

  test('the CTA is styled as a themed button', async () => {
    await expect(ss.activeDesktopCta()).toHaveClass(/btn-primary/);
  });
});

// ═════════════════════════════════════════════════════════════
// 7. RESPONSIVE  (breakpoint-specific media + integrity)
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Responsive', () => {
  for (const bp of BREAKPOINTS) {
    test(`slideshow stays functional at ${bp.name} (${bp.width}px)`, async ({ page }) => {
      const ss = new SlideshowPage(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await ss.open();

      await expect(ss.section).toBeVisible();
      await expect(ss.realSlides).toHaveCount(SS.slideCount);
      await expect(ss.bullets).toHaveCount(SS.slideCount);

      // The theme swaps image + overlay variants at the `md` (768px) breakpoint.
      if (bp.width >= 768) {
        await expect(ss.activeDesktopImage()).toBeVisible();
        await expect(ss.activeDesktopHeading()).toBeVisible();
      } else {
        await expect(ss.activeMobileImage()).toBeVisible();
        await expect(ss.activeMobileHeading()).toBeVisible();
      }
    });
  }
});

// ═════════════════════════════════════════════════════════════
// 8. ACCESSIBILITY
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Accessibility', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('slideshow has no critical or serious axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('section.section-slideshow')
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      blocking,
      `Critical/serious a11y violations:\n${blocking
        .map((v) => `• ${v.id}: ${v.help}`)
        .join('\n')}`,
    ).toEqual([]);
  });

  test('pagination bullets are accessible buttons with descriptive names', async () => {
    const count = await ss.bullets.count();
    expect(count).toBe(SS.slideCount);
    for (let i = 0; i < count; i++) {
      const bullet = ss.bullets.nth(i);
      await expect(bullet).toHaveAttribute('role', 'button');
      await expect(bullet).toHaveAttribute('aria-label', /go to slide/i);
    }
  });

  test('every slide image exposes non-empty alt text', async () => {
    const imgs = ss.slideImages;
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt?.trim(), `image #${i} should have alt text`).toBeTruthy();
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 9. EDGE CASES / NEGATIVE
// ═════════════════════════════════════════════════════════════
test.describe('Slideshow - Edge cases', () => {
  let ss: SlideshowPage;

  test.beforeEach(async ({ page }) => {
    ss = new SlideshowPage(page);
    await ss.setDesktopView();
    await ss.open();
  });

  test('this slideshow config renders no prev/next arrow controls', async () => {
    // Navigation is dots-only; arrow controls are intentionally absent.
    await expect(ss.arrows).toHaveCount(0);
  });

  test('repeatedly selecting the already-active slide keeps it active (idempotent)', async () => {
    await ss.goToSlide(0);
    await ss.goToSlide(0);
    expect(await ss.activeBulletIndex()).toBe(0);
    expect(norm(await ss.activeHeadingText())).toBe(norm(SS.slides[0].heading));
  });
});

// ═════════════════════════════════════════════════════════════
// 10. STABILITY
// ═════════════════════════════════════════════════════════════

// Known-benign console noise emitted by Shopify/theme infrastructure.
const IGNORED_CONSOLE = [
  /Unable to post message to .*Recipient has origin null/i,
  /web-pixels-manager/i,
  /Failed to load resource:.*(status of 40|net::ERR)/i,
];

test.describe('Slideshow - Stability', () => {
  test('slideshow loads without unexpected JavaScript console errors', async ({ page }) => {
    const ss = new SlideshowPage(page);
    const errors = collectErrors(page); // attach BEFORE navigation
    await ss.setDesktopView();
    await ss.open();
    await ss.waitForPageLoad();

    const unexpected = errors.filter(
      (e) => !IGNORED_CONSOLE.some((re) => re.test(e)),
    );
    expect(unexpected, `Unexpected console errors:\n${unexpected.join('\n')}`).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// NOTES — requirements that are intentionally NOT automated here
// ─────────────────────────────────────────────────────────────
// 1. Autoplay timing / interval: autoplay is disabled in this store
//    (auto_play:0), so there is no interval to validate. Its ABSENCE is
//    covered positively (Section 5). If autoplay is enabled in theme
//    settings, add interval + pause-on-hover tests.
// 2. Prev/Next arrows: not rendered in this config (dots-only). Covered
//    negatively (Section 9); add arrow-navigation tests if enabled.
// 3. Loop wrap-around: `loop:true` is set, but with fade transitions Swiper
//    creates no clones and — with no arrows and no autoplay — wrap-around is
//    not reachable through the exposed UI. Touch-swipe looping is
//    environment/timing sensitive and is intentionally not asserted;
//    per-bullet navigation is covered deterministically instead (Section 3).
// 4. CTA destination pages: the CTA opens a collection in a NEW TAB; the
//    test asserts the popup URL matches the slide's collection href rather
//    than deep-validating the collection page (that is the collection
//    suite's responsibility).
