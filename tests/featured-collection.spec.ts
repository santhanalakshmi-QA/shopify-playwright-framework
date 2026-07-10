// tests/featured-collection.spec.ts
// ─────────────────────────────────────────────────────────────
// Featured Collection test suite for the Lollipop Shopify theme
// (https://wdtsanthanalakshmi.myshopify.com/).
//
// Coverage was derived by inspecting the LIVE implementation via the connected
// Shopify MCP server (theme source + section settings) and a runtime Swiper
// probe against the rendered storefront — not from assumptions. Verified:
//
//   • <section.section-featured-collection> → <wdt-swiper-slider>
//       → div[data-slider-options] → .swiper[data-swiper-slider]
//     options: {desktop:4, laptop:3, tablet:3, medium_down:2, mobile:1,
//               loop:true, mode:false, auto_play:0, space:55}
//   • 7 product cards (section setting `products_to_show: 7`).
//   • Swiper 11 loop REORDERS slides instead of cloning them, so the slide
//     count stays 7 and position is read from `realIndex` /
//     `data-swiper-slide-index`, never from DOM order.
//   • `styles: "none"` ⇒ NO prev/next arrows and NO pagination dots. The only
//     user-facing navigation is pointer drag (`allowTouchMove: true`).
//   • `auto_play: 0` ⇒ autoplay disabled. Swiper's keyboard module is off.
//   • `collection_list` is EMPTY ⇒ the Liquid falls through to its onboarding
//     branch and renders PLACEHOLDER cards (see LIMITATIONS at the bottom).
//
// Architecture: intent lives in pages/FeaturedCollectionPage.ts (extends
// BasePage); selectors live in locators/featured-collection.locators.ts;
// shared utilities come from utils/helper.js; expected values come from
// data/testData.json. No locators are written inline here.
//
// Cross-browser: playwright.config.ts runs every test across
// desktop-chromium (Chromium), tablet (iPad — WebKit) and mobile
// (iPhone 13 — WebKit), so each case below is exercised on both engines.
//
// LIMITATIONS / non-automatable items are documented at the bottom of file.
// ─────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { FeaturedCollectionPage } from '../pages/FeaturedCollectionPage';
import { BREAKPOINTS, collectErrors } from '../utils/helper.js';
import testData from '../data/testData.json';

const FC = testData.featuredCollection;
const LAST_INDEX = FC.productsToShow - 1;

/** slidesPerView Swiper must resolve at each shared framework breakpoint. */
const RESPONSIVE_MATRIX = BREAKPOINTS.map((bp) => ({
  ...bp,
  expectedSlidesPerView: FC.slidesPerViewByWidth[String(bp.width) as keyof typeof FC.slidesPerViewByWidth],
}));

// ═════════════════════════════════════════════════════════════
// 1. STRUCTURE & PRESENCE
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Structure & Presence', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('section is rendered and visible on the home page', async () => {
    await expect(fc.section).toBeVisible();
  });

  test('section renders exactly one Swiper slider that finishes initialising', async () => {
    await expect(fc.sliderRoot).toBeVisible();
    await expect(fc.swiper).toHaveCount(1);
    await expect(fc.swiper).toHaveClass(/swiper-initialized/);
  });

  test('section renders its decorative bottom shape', async () => {
    await expect(fc.shape).toHaveClass(/shaper-bottom/);
  });

  test('section is positioned after the hero slideshow in the page flow', async () => {
    // templates/index.json orders the slideshow first, then featured collection.
    const index = await fc.sectionOrderIndex();
    expect(index).toBeGreaterThan(0);
  });
});

// ═════════════════════════════════════════════════════════════
// 2. HEADING & CONTENT
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Heading & Content', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('heading displays the merchant-configured title', async () => {
    await expect(fc.heading).toBeVisible();
    expect(await fc.headingText()).toBe(FC.heading);
  });

  test('heading renders at the configured heading size', async () => {
    // section setting `heading_size: "h2"` drives both the tag and the class.
    await expect(fc.heading).toHaveClass(new RegExp(`\\b${FC.headingLevel}\\b`));
  });

  test('section exposes exactly one level-2 heading', async () => {
    await expect(fc.section.locator('h2')).toHaveCount(1);
  });
});

// ═════════════════════════════════════════════════════════════
// 3. PRODUCT CARDS (UI)
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Product cards', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('renders exactly the configured number of product cards', async () => {
    await expect(fc.cards).toHaveCount(FC.productsToShow);
  });

  test('every slide wraps exactly one product card', async () => {
    await expect(fc.slides).toHaveCount(FC.productsToShow);
    await expect(fc.cards).toHaveCount(FC.productsToShow);
  });

  test('every card renders media, a title and a price', async () => {
    await expect(fc.cardMedia).toHaveCount(FC.productsToShow);
    await expect(fc.cardTitles).toHaveCount(FC.productsToShow);
    await expect(fc.placeholderPrices).toHaveCount(FC.productsToShow);
  });

  test('card media honours the configured square aspect ratio', async () => {
    const count = await fc.cardMedia.count();
    for (let i = 0; i < count; i++) {
      await expect(fc.cardMedia.nth(i)).toHaveClass(new RegExp(FC.cardAspectRatioClass));
    }
  });

  test('every card title carries non-empty text', async () => {
    const count = await fc.cardTitles.count();
    expect(count).toBe(FC.productsToShow);
    for (let i = 0; i < count; i++) {
      const text = (await fc.cardTitles.nth(i).textContent())?.trim();
      expect(text, `card #${i} should have a title`).toBeTruthy();
    }
  });

  test('every card price is rendered and non-empty', async () => {
    const count = await fc.placeholderPrices.count();
    for (let i = 0; i < count; i++) {
      const text = (await fc.placeholderPrices.nth(i).textContent())?.trim();
      expect(text, `card #${i} should show a price`).toBeTruthy();
    }
  });

  test('the first card is visible without horizontal scrolling', async () => {
    await expect(fc.cards.first()).toBeInViewport();
  });
});

// ═════════════════════════════════════════════════════════════
// 4. SLIDER CONFIGURATION & VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Slider configuration', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('data-slider-options is valid JSON matching the section settings', async () => {
    const options = await fc.sliderOptions();
    expect(options).toMatchObject(FC.sliderOptions);
  });

  test('Swiper initialises with loop enabled and autoplay disabled', async () => {
    const state = await fc.swiperState();
    expect(state.loop).toBe(FC.loop);
    expect(state.autoplayEnabled).toBe(FC.autoplay);
    expect(state.autoplayRunning).toBe(false);
  });

  test('Swiper resolves the desktop slides-per-view and gutter', async () => {
    const state = await fc.swiperState();
    expect(state.slidesPerView).toBe(FC.slidesPerViewByWidth['1440']);
    expect(state.spaceBetween).toBe(FC.spaceBetween);
  });

  test('Swiper is initialised with the expected responsive breakpoint map', async () => {
    expect(await fc.breakpoints()).toMatchObject(FC.breakpoints);
  });

  test('pointer dragging is enabled — it is the only navigation affordance', async () => {
    const state = await fc.swiperState();
    expect(state.allowTouchMove).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════
// 5. NAVIGATION (FUNCTIONAL)
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Navigation', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('carousel starts on the first slide', async () => {
    expect(await fc.realIndex()).toBe(0);
    expect(await fc.activeSlideIndex()).toBe(0);
  });

  test('advancing moves to the next slide', async () => {
    await fc.slideNext();
    await expect.poll(() => fc.realIndex()).toBe(1);
    expect(await fc.activeSlideIndex()).toBe(1);
  });

  test('stepping back returns to the previous slide', async () => {
    await fc.goToSlide(2);
    await expect.poll(() => fc.realIndex()).toBe(2);

    await fc.slidePrev();
    await expect.poll(() => fc.realIndex()).toBe(1);
  });

  test('navigating to any slide activates that slide', async () => {
    for (const target of [3, 6, 0, 5]) {
      await fc.goToSlide(target);
      await expect.poll(() => fc.realIndex()).toBe(target);
      expect(await fc.activeSlideIndex()).toBe(target);
    }
  });

  test('dragging the carousel advances it @desktop-only', async ({ isMobile }) => {
    // Swiper binds touch listeners on touch-capable devices, so a synthetic
    // mouse drag only exercises the real code path on the desktop project.
    test.skip(!!isMobile, 'Pointer drag is mouse-driven; touch projects use touch events');

    expect(await fc.realIndex()).toBe(0);
    await fc.dragNext();
    await expect.poll(() => fc.realIndex()).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════
// 6. BOUNDARY CASES
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Boundary cases', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('slide count is capped at products_to_show and never exceeds it', async () => {
    const state = await fc.swiperState();
    expect(state.slideCount).toBe(FC.productsToShow);
    await expect(fc.slides).toHaveCount(FC.productsToShow);
  });

  test('loop wraps forward from the last slide back to the first', async () => {
    await fc.goToSlide(LAST_INDEX);
    await expect.poll(() => fc.realIndex()).toBe(LAST_INDEX);

    await fc.slideNext();
    await expect.poll(() => fc.realIndex()).toBe(0);
  });

  test('loop wraps backward from the first slide to the last', async () => {
    expect(await fc.realIndex()).toBe(0);

    await fc.slidePrev();
    await expect.poll(() => fc.realIndex()).toBe(LAST_INDEX);
  });

  test('realIndex stays within bounds after rapid successive advances', async () => {
    for (let i = 0; i < FC.productsToShow * 2; i++) {
      await fc.slideNext();
    }
    const index = await fc.realIndex();
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThanOrEqual(LAST_INDEX);
  });

  test('a full forward cycle returns to the starting slide', async () => {
    for (let i = 0; i < FC.productsToShow; i++) {
      await fc.slideNext();
    }
    await expect.poll(() => fc.realIndex()).toBe(0);
  });

  test('the 480px breakpoint boundary switches from one to two columns', async () => {
    await fc.resizeTo(479, 812);
    await expect.poll(() => fc.slidesPerView()).toBe(FC.slidesPerViewByWidth['479']);

    await fc.resizeTo(480, 812);
    await expect.poll(() => fc.slidesPerView()).toBe(FC.slidesPerViewByWidth['480']);
  });
});

// ═════════════════════════════════════════════════════════════
// 7. NEGATIVE CASES — controls this configuration must NOT render
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Negative cases', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('no prev/next arrows are rendered when styles is "none"', async () => {
    await expect(fc.arrows).toHaveCount(0);
    expect((await fc.swiperState()).hasNavigationEl).toBe(false);
  });

  test('no pagination dots are rendered when styles is "none"', async () => {
    await expect(fc.pagination).toHaveCount(0);
    expect((await fc.swiperState()).hasPaginationEl).toBe(false);
  });

  test('no collection tabs are rendered for a single-collection configuration', async () => {
    // Liquid renders <dropdown-tabs> only when more than one collection is set.
    await expect(fc.tabs).toHaveCount(0);
  });

  test('the carousel does not auto-advance while idle', async ({ page }) => {
    const before = await fc.realIndex();
    await page.waitForTimeout(3_000);
    expect(await fc.realIndex()).toBe(before);
  });

  test('Swiper 11 loop reorders slides rather than cloning them', async () => {
    await expect(fc.duplicateSlides).toHaveCount(0);
  });

  test('arrow keys do not move the carousel — the keyboard module is disabled', async () => {
    // Documented theme limitation, asserted so a future theme change surfaces here.
    expect((await fc.swiperState()).keyboardEnabled).toBe(false);

    await fc.swiper.click({ position: { x: 5, y: 5 } });
    const before = await fc.realIndex();
    await fc.pressKey('ArrowRight');
    expect(await fc.realIndex()).toBe(before);
  });
});

// ═════════════════════════════════════════════════════════════
// 8. RESPONSIVE
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Responsive', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.open();
  });

  for (const bp of RESPONSIVE_MATRIX) {
    test(`shows ${bp.expectedSlidesPerView} column(s) at ${bp.name} (${bp.width}px)`, async () => {
      await fc.resizeTo(bp.width, bp.height);
      await expect.poll(() => fc.slidesPerView()).toBe(bp.expectedSlidesPerView);
    });
  }

  test('section and its first card stay visible across every breakpoint', async () => {
    for (const bp of BREAKPOINTS) {
      await fc.resizeTo(bp.width, bp.height);
      await expect(fc.section, `section hidden at ${bp.name}`).toBeVisible();
      await expect(fc.cards.first(), `first card hidden at ${bp.name}`).toBeVisible();
    }
  });

  test('the carousel never overflows the viewport horizontally', async ({ page }) => {
    for (const bp of BREAKPOINTS) {
      await fc.resizeTo(bp.width, bp.height);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflows, `horizontal overflow at ${bp.name}`).toBe(false);
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 9. ACCESSIBILITY
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Accessibility', () => {
  let fc: FeaturedCollectionPage;

  test.beforeEach(async ({ page }) => {
    fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
  });

  test('section has no critical or serious axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('section.section-featured-collection')
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

  test('Swiper enables its accessibility module', async () => {
    expect((await fc.swiperState()).a11yEnabled).toBe(true);
  });

  test('the slide wrapper is a polite live region', async () => {
    await expect(fc.wrapper).toHaveAttribute('aria-live', 'polite');
  });

  test('an assertive screen-reader notification region is present', async () => {
    await expect(fc.notification).toHaveAttribute('aria-live', 'assertive');
  });

  test('each slide is a labelled group announcing its position', async () => {
    const count = await fc.slides.count();
    expect(count).toBe(FC.productsToShow);
    for (let i = 0; i < count; i++) {
      const slide = fc.slides.nth(i);
      await expect(slide).toHaveAttribute('role', 'group');
      await expect(slide).toHaveAttribute('aria-label', new RegExp(`/\\s*${FC.productsToShow}$`));
    }
  });

  test('placeholder card titles are marked as disabled links, not focusable traps', async () => {
    // Onboarding cards have no destination, so the theme renders
    // <a role="link" aria-disabled="true"> with no href. Asserting this keeps a
    // regression (a real link with no href) from silently shipping.
    const count = await fc.cardTitleLinks.count();
    expect(count).toBe(FC.productsToShow);
    for (let i = 0; i < count; i++) {
      const link = fc.cardTitleLinks.nth(i);
      await expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(await link.getAttribute('href')).toBeNull();
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 10. EDGE CASES & STABILITY
// ═════════════════════════════════════════════════════════════
test.describe('Featured Collection - Edge cases & stability', () => {
  test('section renders without JavaScript console errors', async ({ page }) => {
    const fc = new FeaturedCollectionPage(page);
    const errors = collectErrors(page);

    await fc.setDesktopView();
    await fc.open();

    // Scope to failures attributable to this section / its slider, so unrelated
    // third-party storefront noise does not make the suite flaky.
    const relevant = errors.filter((e) => /swiper|featured[-_]collection/i.test(e));
    expect(relevant, `Console errors:\n${relevant.join('\n')}`).toEqual([]);
  });

  test('slider re-initialises consistently after a reload', async ({ page }) => {
    const fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();
    await expect(fc.slides).toHaveCount(FC.productsToShow);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await fc.section.scrollIntoViewIfNeeded();
    await expect(fc.swiper).toHaveClass(/swiper-initialized/);
    await expect(fc.slides).toHaveCount(FC.productsToShow);
    expect(await fc.realIndex()).toBe(0);
  });

  test('resizing the viewport keeps the carousel initialised and bounded', async ({ page }) => {
    const fc = new FeaturedCollectionPage(page);
    await fc.setDesktopView();
    await fc.open();

    await fc.goToSlide(2);
    await expect.poll(() => fc.realIndex()).toBe(2);

    await fc.resizeTo(375, 812);
    await expect(fc.swiper).toHaveClass(/swiper-initialized/);
    const index = await fc.realIndex();
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThanOrEqual(LAST_INDEX);
  });

  test('the section still renders when animations are reduced', async ({ page }) => {
    const fc = new FeaturedCollectionPage(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await fc.setDesktopView();
    await fc.open();

    await expect(fc.section).toBeVisible();
    await expect(fc.slides).toHaveCount(FC.productsToShow);
    // Autoplay is already off, so reduced motion introduces no extra motion.
    expect((await fc.swiperState()).autoplayRunning).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════
// LIMITATIONS — requirements that cannot be automated against this store
// ═════════════════════════════════════════════════════════════
//
// The section's `collection_list` setting is EMPTY on the live theme
// (templates/index.json → featured_collection_Txgdpp). The Liquid therefore
// takes its onboarding branch and renders 7 PLACEHOLDER cards. As a direct
// consequence the following requirements have no DOM to assert against and are
// intentionally NOT automated here:
//
//  1. Product link navigation — placeholder titles render as
//     `<a role="link" aria-disabled="true">` with NO href, so clicking through
//     to a product page is impossible. Covered indirectly by the accessibility
//     test that pins the disabled-link contract.
//  2. Quick-add / quick-view button — `quick_button: true` is set, but the
//     placeholder card snippet never renders the control.
//  3. Vendor name, colour swatches and secondary (hover) image —
//     `vendor`, `swatch_color` and `show_secondary_image` are all enabled in
//     the section settings, yet placeholder cards render none of them.
//  4. Real price formatting / compare-at pricing — placeholders emit a static
//     `.placeholder-price` ("€0,00") instead of the theme's `.price_block`.
//  5. Collection tabs (`tab_style: "dropdown"`) — `<dropdown-tabs>` is only
//     emitted when MORE THAN ONE collection is configured. Asserted absent.
//  6. Prev/next arrows and pagination dots — not rendered because
//     `styles: "none"`. Asserted absent.
//  7. Keyboard carousel navigation — Swiper's `keyboard` module is not enabled
//     by the theme. Asserted absent so a future theme change surfaces here.
//
// Locators for (1)–(4) are already defined in
// locators/featured-collection.locators.ts (`productLink`, `quickButton`,
// `vendor`, `price`). Once a real collection is assigned in the theme editor,
// those tests can be written without touching the Page Object.
// ═════════════════════════════════════════════════════════════
