import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { slideshowSelectors as S } from '../locators/slideshow.locators';

/**
 * SlideshowPage — Page Object for the Lollipop home-page hero Slideshow
 * (a Swiper slider inside a <wdt-slideshow> custom element).
 *
 * Extends BasePage (navigation / viewport / screenshot / console-error
 * helpers). All selectors live in `slideshow.locators.ts` and are scoped
 * to `section.section-slideshow`.
 *
 * Live behaviour (from data-slider-options): loop + fade + dots, autoplay
 * disabled. Navigation is via pagination bullets only (no arrows). Each
 * slide carries a heading, a "View Collection" CTA, and separate
 * desktop/mobile images + overlays.
 */
export class SlideshowPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Regions ────────────────────────────────────────────────
  get section(): Locator {
    return this.page.locator(S.section).first();
  }
  get swiper(): Locator {
    return this.page.locator(S.swiper).first();
  }
  get shape(): Locator {
    return this.page.locator(S.shape).first();
  }

  // ── Slides ─────────────────────────────────────────────────
  get slides(): Locator {
    return this.page.locator(S.slide);
  }
  get realSlides(): Locator {
    return this.page.locator(S.realSlide);
  }
  get activeSlide(): Locator {
    return this.page.locator(S.activeSlide).first();
  }
  /** Desktop-overlay headings of every real slide (one per slide). */
  get slideHeadings(): Locator {
    return this.page.locator(S.realSlide).locator(`${S.desktopOverlayRel} ${S.headingRel}`);
  }
  /** Desktop-overlay CTA links of every real slide (one per slide). */
  get slideCtas(): Locator {
    return this.page.locator(S.realSlide).locator(`${S.desktopOverlayRel} ${S.ctaRel}`);
  }

  // ── Pagination ─────────────────────────────────────────────
  get pagination(): Locator {
    return this.page.locator(S.pagination).first();
  }
  get bullets(): Locator {
    return this.page.locator(S.bullet);
  }
  get activeBullet(): Locator {
    return this.page.locator(S.activeBullet).first();
  }
  /** All active bullets (used to assert exactly one is active). */
  get activeBullets(): Locator {
    return this.page.locator(S.activeBullet);
  }
  get arrows(): Locator {
    return this.page.locator(S.arrows);
  }

  /** Every image across the real (non-clone) slides. */
  get slideImages(): Locator {
    return this.page.locator(S.realSlide).locator(S.bannerImgRel);
  }

  // ── Active-slide helpers ───────────────────────────────────
  activeDesktopHeading(): Locator {
    return this.activeSlide.locator(`${S.desktopOverlayRel} ${S.headingRel}`).first();
  }
  activeMobileHeading(): Locator {
    return this.activeSlide.locator(`${S.mobileOverlayRel} ${S.headingRel}`).first();
  }
  activeDesktopCta(): Locator {
    return this.activeSlide.locator(`${S.desktopOverlayRel} ${S.ctaRel}`).first();
  }
  activeDesktopImage(): Locator {
    return this.activeSlide.locator(S.desktopImgRel).first();
  }
  activeMobileImage(): Locator {
    return this.activeSlide.locator(S.mobileImgRel).first();
  }

  // ── Actions / queries ──────────────────────────────────────

  /** Navigate to a page, reveal the slideshow and wait for Swiper init. */
  async open(path = '/'): Promise<void> {
    await this.goto(path);
    await this.section.scrollIntoViewIfNeeded();
    await this.page.locator(S.initializedSwiper).first().waitFor({ state: 'visible' });
    await this.bullets.first().waitFor({ state: 'visible' });
  }

  /** Zero-based index of the currently active pagination bullet. */
  activeBulletIndex(): Promise<number> {
    return this.bullets.evaluateAll((els) =>
      els.findIndex((e) => e.classList.contains('swiper-pagination-bullet-active')),
    );
  }

  /** Click the nth pagination bullet and wait until it becomes active. */
  async goToSlide(index: number): Promise<void> {
    await this.bullets.nth(index).click();
    await this.page.waitForFunction(
      ({ i }) => {
        const dots = document.querySelectorAll(
          'section.section-slideshow .swiper-pagination-bullet',
        );
        return dots[i]?.classList.contains('swiper-pagination-bullet-active');
      },
      { i: index },
    );
  }

  /** Trimmed raw text (textContent) of the active slide's desktop heading. */
  async activeHeadingText(): Promise<string> {
    return (await this.activeDesktopHeading().textContent())?.trim() ?? '';
  }
}

export default SlideshowPage;
