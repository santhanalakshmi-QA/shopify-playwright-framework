// locators/slideshow.locators.ts
// ─────────────────────────────────────────────────────────────
// CSS selectors for the Lollipop Shopify theme home-page Slideshow
// (the hero banner slider).
//
// Verified against the LIVE, JS-initialised DOM of
// https://lollipop-theme.myshopify.com/ (not assumptions):
//   <section class="section section-slideshow">   (dynamic id — NOT hard-coded)
//     └─ <wdt-slideshow>
//         └─ .slider.slideshow
//             └─ .swiper.slideshow_swiper   (Swiper; adds .swiper-initialized)
//                 data-slider-options='{"loop":"true","fade":"true",
//                                       "dots":"true","auto_play":"0"}'
//                 ├─ .swiper-wrapper
//                 │    └─ .swiper-slide.slide-item  ×3
//                 │         ├─ .swipper_banner > img.d-md-block (desktop)
//                 │         │                    + img.d-md-none (mobile)
//                 │         ├─ .banner-overlay(:not(.mobile))  (desktop overlay)
//                 │         │    └─ .content-block > h2 + .slider-btn > a.btn
//                 │         └─ .banner-overlay.mobile          (mobile overlay)
//                 └─ .swiper-pagination.classic
//                      └─ .swiper-pagination-bullet[role=button][aria-label]  ×3
//
// Notes:
//  • `fade:true` ⇒ Swiper does NOT create loop clones, so `.swiper-slide`
//    count == real slide count (3). The `:not(.swiper-slide-duplicate)`
//    guard is kept as a safety net if the transition is ever changed.
//  • auto_play:0 ⇒ NO autoplay; navigation is via pagination bullets only
//    (this config renders no .swiper-button-next/prev arrows).
// ─────────────────────────────────────────────────────────────

export const slideshowSelectors = {
  // ── Region ────────────────────────────────────────────────
  section:           'section.section-slideshow',
  root:              'section.section-slideshow wdt-slideshow',
  swiper:            'section.section-slideshow .slideshow_swiper',
  initializedSwiper: 'section.section-slideshow .slideshow_swiper.swiper-initialized',
  wrapper:           'section.section-slideshow .swiper-wrapper',
  shape:             'section.section-slideshow .shape',

  // ── Slides ────────────────────────────────────────────────
  slide:       'section.section-slideshow .swiper-slide',
  realSlide:   'section.section-slideshow .swiper-slide:not(.swiper-slide-duplicate)',
  activeSlide: 'section.section-slideshow .swiper-slide.swiper-slide-active',

  // ── Pagination (dots) ─────────────────────────────────────
  pagination:  'section.section-slideshow .swiper-pagination',
  bullet:      'section.section-slideshow .swiper-pagination-bullet',
  activeBullet:'section.section-slideshow .swiper-pagination-bullet-active',

  // ── Controls this config does NOT render (negative asserts) ─
  arrows: 'section.section-slideshow .swiper-button-next, section.section-slideshow .swiper-button-prev',

  // ── Relative selectors (used from a resolved slide locator) ─
  desktopOverlayRel: '.banner-overlay:not(.mobile)',
  mobileOverlayRel:  '.banner-overlay.mobile',
  headingRel:        '.content-block h2',
  ctaRel:            '.content-block a.btn',
  bannerImgRel:      '.swipper_banner img',
  desktopImgRel:     '.swipper_banner img.d-md-block',
  mobileImgRel:      '.swipper_banner img.d-md-none',
};

export default slideshowSelectors;
