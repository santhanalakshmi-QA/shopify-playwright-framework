import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { featuredCollectionSelectors as F } from '../locators/featured-collection.locators';

/** Shape of the JSON in the section's `data-slider-options` attribute. */
export interface SliderOptions {
  desktop: string;
  laptop: string;
  tablet: string;
  medium_down: string;
  mobile: string;
  loop: string;
  mode: string;
  auto_play: string;
  space: string;
}

/** The subset of the live Swiper instance's params/state the suite asserts on. */
export interface SwiperState {
  loop: boolean;
  slidesPerView: number;
  spaceBetween: number;
  autoplayRunning: boolean;
  autoplayEnabled: boolean;
  allowTouchMove: boolean;
  keyboardEnabled: boolean;
  a11yEnabled: boolean;
  hasNavigationEl: boolean;
  hasPaginationEl: boolean;
  currentBreakpoint: string;
  realIndex: number;
  slideCount: number;
}

/**
 * FeaturedCollectionPage — Page Object for the Lollipop home-page
 * "Featured Collection" section (a Swiper carousel of product cards inside a
 * <wdt-swiper-slider> custom element).
 *
 * Extends BasePage (navigation / viewport / screenshot / console-error
 * helpers). All selectors live in `featured-collection.locators.ts` and are
 * scoped to `section.section-featured-collection`.
 *
 * Live behaviour (verified against the storefront + theme source):
 *   • 7 slides, `loop: true`, autoplay disabled (`auto_play: 0`).
 *   • `styles: "none"` ⇒ NO arrows and NO pagination dots are rendered, so the
 *     only user-facing navigation is pointer drag (`allowTouchMove: true`).
 *   • Swiper 11 loop REORDERS slides rather than cloning them, so the slide
 *     count is stable at 7 and position must be read from `realIndex` /
 *     `data-swiper-slide-index`, never from DOM order.
 *   • `collection_list` is empty ⇒ cards are onboarding PLACEHOLDERS with no
 *     product href, no vendor, no swatches and no quick-add button.
 */
export class FeaturedCollectionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Regions ────────────────────────────────────────────────
  get section(): Locator {
    return this.page.locator(F.section).first();
  }
  get heading(): Locator {
    return this.page.locator(F.heading).first();
  }
  get shape(): Locator {
    return this.page.locator(F.shape).first();
  }
  get sliderRoot(): Locator {
    return this.page.locator(F.sliderRoot).first();
  }
  get swiper(): Locator {
    return this.page.locator(F.swiper).first();
  }
  get wrapper(): Locator {
    return this.page.locator(F.wrapper).first();
  }
  get notification(): Locator {
    return this.page.locator(F.notification).first();
  }

  // ── Slides ─────────────────────────────────────────────────
  get slides(): Locator {
    return this.page.locator(F.slide);
  }
  get activeSlide(): Locator {
    return this.page.locator(F.activeSlide).first();
  }
  get duplicateSlides(): Locator {
    return this.page.locator(F.duplicateSlide);
  }

  // ── Product cards ──────────────────────────────────────────
  get cards(): Locator {
    return this.page.locator(F.card);
  }
  get cardMedia(): Locator {
    return this.page.locator(F.cardMedia);
  }
  get cardTitles(): Locator {
    return this.page.locator(F.cardTitle);
  }
  get cardTitleLinks(): Locator {
    return this.page.locator(F.cardTitleLink);
  }
  get placeholderImages(): Locator {
    return this.page.locator(F.placeholderSvg);
  }
  get placeholderPrices(): Locator {
    return this.page.locator(F.placeholderPrice);
  }
  get productLinks(): Locator {
    return this.page.locator(F.productLink);
  }

  // ── Controls this configuration does not render ────────────
  get arrows(): Locator {
    return this.page.locator(F.arrows);
  }
  get pagination(): Locator {
    return this.page.locator(F.pagination);
  }
  get tabs(): Locator {
    return this.page.locator(F.tabs);
  }

  // ── Actions / queries ──────────────────────────────────────

  /** Navigate to a page, reveal the section and wait for Swiper to initialise. */
  async open(path = '/'): Promise<void> {
    await this.goto(path);
    await this.section.scrollIntoViewIfNeeded();
    await this.page.locator(F.initializedSwiper).first().waitFor({ state: 'visible' });
    await this.slides.first().waitFor({ state: 'visible' });
  }

  /** Parsed `data-slider-options` JSON that the Liquid template emits. */
  async sliderOptions(): Promise<SliderOptions> {
    const raw = await this.page.locator(F.sliderOptions).first().getAttribute('data-slider-options');
    return JSON.parse(raw ?? '{}') as SliderOptions;
  }

  /** Live params/state read straight off the initialised Swiper instance. */
  swiperState(): Promise<SwiperState> {
    return this.swiper.evaluate((el: any) => {
      const s = el.swiper;
      return {
        loop: !!s.params.loop,
        slidesPerView: s.params.slidesPerView,
        spaceBetween: s.params.spaceBetween,
        autoplayRunning: !!s.autoplay?.running,
        autoplayEnabled: !!s.params.autoplay?.enabled,
        allowTouchMove: !!s.params.allowTouchMove,
        keyboardEnabled: !!s.params.keyboard?.enabled,
        a11yEnabled: !!s.params.a11y?.enabled,
        hasNavigationEl: !!s.navigation?.nextEl,
        hasPaginationEl: !!s.pagination?.el,
        currentBreakpoint: String(s.currentBreakpoint),
        realIndex: s.realIndex,
        slideCount: s.slides.length,
      };
    });
  }

  /** The responsive `breakpoints` map Swiper was initialised with. */
  breakpoints(): Promise<Record<string, { slidesPerView: number; spaceBetween?: number }>> {
    return this.swiper.evaluate((el: any) => el.swiper.params.breakpoints);
  }

  /** Zero-based index of the logical slide currently in the active position. */
  realIndex(): Promise<number> {
    return this.swiper.evaluate((el: any) => el.swiper.realIndex);
  }

  /** Slides-per-view Swiper has resolved for the current viewport. */
  slidesPerView(): Promise<number> {
    return this.swiper.evaluate((el: any) => el.swiper.params.slidesPerView);
  }

  /** `data-swiper-slide-index` of the slide carrying `.swiper-slide-active`. */
  async activeSlideIndex(): Promise<number> {
    const raw = await this.activeSlide.getAttribute('data-swiper-slide-index');
    return Number(raw);
  }

  /**
   * Advance the carousel using the theme's Swiper instance.
   * The theme renders no arrows or dots (`styles: "none"`), so the instance API
   * is the only viewport-independent way to drive navigation deterministically.
   */
  async slideNext(): Promise<void> {
    await this.swiper.evaluate((el: any) => el.swiper.slideNext(0));
  }

  /** Step the carousel backwards via the theme's Swiper instance. */
  async slidePrev(): Promise<void> {
    await this.swiper.evaluate((el: any) => el.swiper.slidePrev(0));
  }

  /**
   * Move the carousel to a logical slide index.
   *
   * Swiper's own `slideToLoop()` is unreliable in this configuration: with 7
   * slides at 4 per view, once loop mode has reordered the DOM it lands
   * off-by-one (asking for 6 yields 5, then asking for 0 yields 6). Stepping
   * with `slideNext()` until `realIndex` matches is deterministic and keeps
   * `.swiper-slide-active` in agreement with `realIndex`.
   */
  async goToSlide(index: number): Promise<void> {
    const reached = await this.swiper.evaluate((el: any, target: number) => {
      const s = el.swiper;
      // Bounded by the slide count: looping guarantees every index is reachable.
      for (let i = 0; i <= s.slides.length && s.realIndex !== target; i++) {
        s.slideNext(0);
      }
      return s.realIndex;
    }, index);

    if (reached !== index) {
      throw new Error(`Could not reach slide ${index}; carousel stopped at ${reached}`);
    }
  }

  /**
   * Drag the carousel one card to the left with the pointer — the only
   * user-facing navigation this configuration exposes. Mouse-driven, so callers
   * must skip it on touch-only projects (Swiper binds touch events there).
   */
  async dragNext(): Promise<void> {
    const box = await this.swiper.boundingBox();
    if (!box) throw new Error('Featured Collection swiper has no bounding box');

    const startX = box.x + box.width * 0.7;
    const y = box.y + box.height / 2;

    await this.page.mouse.move(startX, y);
    await this.page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await this.page.mouse.move(startX - i * 25, y, { steps: 2 });
    }
    await this.page.mouse.up();
  }

  /** Resize and wait until Swiper has re-resolved its breakpoint. */
  async resizeTo(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
    // Swiper re-resolves its breakpoint on resize; let two frames settle first.
    await this.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
  }

  /** Trimmed heading text of the section. */
  async headingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() ?? '';
  }

  /** Position of this section among all Shopify sections on the page. */
  sectionOrderIndex(): Promise<number> {
    return this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('[id^="shopify-section-"]'));
      return all.findIndex((s) => s.classList.contains('section-featured-collection'));
    });
  }
}

export default FeaturedCollectionPage;
