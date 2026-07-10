// locators/featured-collection.locators.ts
// ─────────────────────────────────────────────────────────────
// CSS selectors for the Lollipop Shopify theme home-page
// "Featured Collection" section.
//
// Verified against the LIVE, JS-initialised DOM of
// https://wdtsanthanalakshmi.myshopify.com/ and against the theme
// source `sections/featured-collection.liquid` (theme id 188143075695),
// not assumptions:
//
//   <section class="section section-featured-collection">  (dynamic id — NOT hard-coded)
//     └─ .collection.featured-collection-<section.id>
//         ├─ .title-container > h2.heading_block         ("Featured Collection")
//         ├─ .shape.shape-bottom.shaper-bottom
//         └─ <wdt-swiper-slider>
//             └─ div[data-slider-options]                (JSON config, see below)
//                 └─ .swiper[data-swiper-slider]         (Swiper; adds .swiper-initialized)
//                     ├─ .swiper-wrapper[aria-live=polite]
//                     │    └─ .swiper-slide[role=group][aria-label="n / 7"]
//                     │         [data-swiper-slide-index]  ×7
//                     │         └─ .card-wrapper.product-card-wrapper
//                     │              └─ .card.card-main
//                     │                   ├─ .card__inner.ratio.ratio-1x1
//                     │                   │    └─ svg.placeholder-svg
//                     │                   └─ .card-body > .card-body-information
//                     │                        ├─ h3.card-title > a.full-unstyled-link
//                     │                        └─ .placeholder-price
//                     └─ span.swiper-notification[aria-live=assertive]
//
// Live section settings (templates/index.json → featured_collection_Txgdpp):
//   collection_list: []   products_to_show: 7   desktop: 4   mobile: 1
//   swiper_enable: true   auto_play: 0   space: 55   styles: "none"
//   tab_style: "dropdown" card_aspect_ratio: "square"
//
// Notes — these drive the negative / limitation tests:
//  • `collection_list` is EMPTY, so the Liquid `for product in
//    collection.products` loop falls through to its `{% else %}` branch and
//    renders `products_to_show` (7) ONBOARDING PLACEHOLDER cards. Placeholder
//    cards have NO product href (`<a role="link" aria-disabled="true">`), no
//    vendor, no swatches and no quick-add button — even though the section
//    settings enable vendor/swatch_color/quick_button/show_secondary_image.
//  • `styles: "none"` ⇒ the theme renders NEITHER `.swiper-button-next/prev`
//    NOR `.swiper-pagination`. Navigation is pointer-drag only.
//  • Only 0 collections are configured, and the Liquid renders `<dropdown-tabs>`
//    only when `count > 1`, so there are NO tabs in this configuration.
//  • Swiper runs with `loop: true` (v11-style: it REORDERS real slides instead
//    of cloning, so `.swiper-slide` count stays 7 and `swiper-slide-duplicate`
//    never appears — use `data-swiper-slide-index` / `swiper.realIndex`).
//  • `auto_play: 0` ⇒ autoplay disabled; `keyboard` module is NOT enabled.
//
// The generic `LOCATORS.featuredCollection` entry in `shopify-locators.js` is a
// theme-agnostic guess kept for cross-theme smoke checks. These selectors are
// the verified, Lollipop-specific ones and supersede it for this suite.
// ─────────────────────────────────────────────────────────────

/** Section root. The Shopify section id is dynamic — always scope through this. */
const SECTION = 'section.section-featured-collection';

export const featuredCollectionSelectors = {
  // ── Region ────────────────────────────────────────────────
  section:           SECTION,
  collection:        `${SECTION} .collection`,
  titleContainer:    `${SECTION} .title-container`,
  heading:           `${SECTION} h2.heading_block`,
  richtext:          `${SECTION} .subheading`,
  shape:             `${SECTION} .shape`,

  // ── Slider ────────────────────────────────────────────────
  sliderRoot:        `${SECTION} wdt-swiper-slider`,
  sliderOptions:     `${SECTION} [data-slider-options]`,
  swiper:            `${SECTION} .swiper[data-swiper-slider]`,
  initializedSwiper: `${SECTION} .swiper.swiper-initialized`,
  wrapper:           `${SECTION} .swiper-wrapper`,
  notification:      `${SECTION} .swiper-notification`,

  // ── Slides ────────────────────────────────────────────────
  slide:             `${SECTION} .swiper-slide`,
  activeSlide:       `${SECTION} .swiper-slide.swiper-slide-active`,
  // Swiper 11 loop reorders rather than clones; kept as a safety net only.
  duplicateSlide:    `${SECTION} .swiper-slide-duplicate`,

  // ── Product cards ─────────────────────────────────────────
  card:              `${SECTION} .card-wrapper.product-card-wrapper`,
  cardMain:          `${SECTION} .card.card-main`,
  cardMedia:         `${SECTION} .card__inner`,
  cardBody:          `${SECTION} .card-body`,
  cardTitle:         `${SECTION} .card-title`,
  cardTitleLink:     `${SECTION} .card-title a.full-unstyled-link`,
  placeholderSvg:    `${SECTION} svg.placeholder-svg`,
  placeholderPrice:  `${SECTION} .placeholder-price`,
  // Rendered only when a real collection is wired up (see notes above).
  productLink:       `${SECTION} a[href*="/products/"]`,
  price:             `${SECTION} .price_block .price`,
  vendor:            `${SECTION} .card-vendor`,
  quickButton:       `${SECTION} .quick-add, ${SECTION} .quick_button`,

  // ── Controls this configuration does NOT render (negative asserts) ─
  arrows:            `${SECTION} .swiper-button-next, ${SECTION} .swiper-button-prev`,
  pagination:        `${SECTION} .swiper-pagination`,
  tabs:              `${SECTION} dropdown-tabs`,
  tabItems:          `${SECTION} .tab__item`,
  tabDropdownToggle: `${SECTION} .tab-style-dropdown .dropdown-toggle`,

  // ── Relative selectors (used from a resolved slide/card locator) ─
  cardRel:            '.card-wrapper.product-card-wrapper',
  cardMainRel:        '.card.card-main',
  cardMediaRel:       '.card__inner',
  cardTitleRel:       '.card-title',
  cardTitleLinkRel:   '.card-title a.full-unstyled-link',
  placeholderSvgRel:  'svg.placeholder-svg',
  placeholderPriceRel:'.placeholder-price',
};

export default featuredCollectionSelectors;
