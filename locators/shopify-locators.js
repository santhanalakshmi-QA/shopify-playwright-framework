// locators/shopify-locators.js
// ─────────────────────────────────────────────────────────────
// All CSS selectors for Shopify theme testing in one place.
// When a selector breaks after a theme update — fix it here
// and all tests update automatically.
// ─────────────────────────────────────────────────────────────

const LOCATORS = {

  // ── Header ────────────────────────────────────────────────
  header: {
    container:   'header, .header, .header-wrapper, #shopify-section-header, [id*="__header"]',
    root:        'header#header, header.navbar',
    wrapper:     'sticky-header, .header-wrapper',
    logo:        'a.header-logo, .header-logo a, .header__heading a, .logo a',
    logoLink:    'header#header a.header-logo',
    logoImg:     'header#header a.header-logo img',
    cartIcon:    'a[href="/cart"], .header-cart, .header__icon--cart, #cart-icon-bubble',
    cartLink:    'header#header a.header-cart',
    cartCount:   '#header-cart-count, .header-cart-count, .cart-count-bubble, [class*="cart-count"]',
    cartDrawer:  '#cartOffCanvas',
    searchIcon:  '.search-type-form, .search__button, .header__search, button[aria-label*="search" i]',
    searchToggle:'header#header button[data-bs-target="#searchBox"], button[aria-label="Enter keyword"]',
    accountIcon: 'header#header .header-account, shopify-account',
    menuButton:  '.navbar-toggler, .header__icon--menu, button[aria-label*="menu" i]',
  },

  // ── Navigation ────────────────────────────────────────────
  nav: {
    container:       '.navbar-nav, .dt-nav, nav, .header__inline-menu',
    links:           '.navbar-nav a.nav-link, .dt-nav a, nav a',
    mobileMenu:      '.offcanvas, .menu-drawer-container, .menu-drawer, .mobile-nav',
    closeButton:     '.offcanvas .btn-close, button[aria-label*="close" i], .menu-drawer__close',
    desktopContainer:'header#header nav.d-none.d-lg-block',
    desktopMenu:     '[data-menu="dt-main-menu"]',
    topLevelItems:   '[data-menu="dt-main-menu"] > li.nav-item',
    topLevelLinks:   '[data-menu="dt-main-menu"] > li.nav-item > a.nav-link, [data-menu="dt-main-menu"] > li.nav-item > .mega-menu__wrapper > a.nav-link',
    megaItem:        '[data-menu="dt-main-menu"] li.has-mega-menu',
    megaToggle:      'li.has-mega-menu > .mega-menu__wrapper > a.dropdown-toggle',
    megaContent:     'li.has-mega-menu .mega-menu__content',
    dropdownToggle:  '[data-menu="dt-main-menu"] a.nav-link.dropdown-toggle',
    dropdownMenu:    '[data-menu="dt-main-menu"] .dropdown-menu',
    level2Links:     '.mega-menu__content .sub-menu-lists a.h5, [data-menu="dt-main-menu"] .dropdown-menu a.dropdown-item',
    level3Links:     '.mega-menu__content .sub-menu .menu-item a',
  },

  // ── Mobile navigation drawer (off-canvas) ─────────────────
  mobileNav: {
    drawer:    '#mobileNavigation',
    menu:      '#menuGroup',
    items:     '#menuGroup > li.nav-item',
    links:     '#mobileNavigation a.nav-link',
    expanders: '#mobileNavigation .dt-sc-caret.dropdown-toggle',
    submenu:   '#mobileNavigation .collapse',
    logo:      '#mobileNavigation a.header-logo',
    closeBtn:  '#mobileNavigation .btn-close',
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    container:   'footer, .footer, #shopify-section-footer',
    links:       'footer a',
    newsletter:  'footer input[type="email"], .newsletter input[type="email"]',
    submitBtn:   'footer button[type="submit"], .newsletter button[type="submit"]',
  },

  // ── Search ────────────────────────────────────────────────
  search: {
    modal:         '#searchBox',
    form:          '#searchBox form[action="/search"], #searchBox predictive-search',
    input:         '#Search-In-Modal, input[type="search"][name="q"], .search__input',
    button:        '#searchBox button.search__button, button.search__button[aria-label="Search"]',
    clearBtn:      '#searchBox .reset__button',
    results:       '#predictive-search-results, #searchBox predictive-search, .predictive-search, .search-modal__content',
    productResults:'#searchBox a[href*="/products/"], #predictive-search-results a[href*="/products/"]',
    submitBtn:     'button[type="submit"][aria-label*="search" i]',
    closeBtn:      '#searchBox .btn-close',
  },

  // ── Collection page ───────────────────────────────────────
  collection: {
    grid:        '.product-grid, #product-grid, .grid, .collection-grid',
    productCard: '.product-card-wrapper, .card-wrapper, .product-card, .grid__item',
    productLink: '.product-card-wrapper a, .card-wrapper a, a[href*="/products/"]',
    sortDropdown:'#dropdownMenuSorting, .sort-by.dropdown, #FacetSortForm, select#SortBy',
    filterBtn:   '.facets__summary, .facet-filters__field, .filter-button, [aria-controls*="Facet"]',
    filterCheck: '.facets__item input[type="checkbox"], .filter-value input[type="checkbox"]',
    pagination:  '.pagination, nav[aria-label*="pagination" i]',
  },

  // ── Product page ──────────────────────────────────────────
  product: {
    title:       '.product-title, .product__title, .product-single__title, h1',
    price:       '.price_block .price, .price, .product__price, [class*="price"]',
    gallery:     '.product-media-gallery, .product__media-list, [class*="product__media"], .product-gallery',
    atcButton:   'button[name="add"], .shopify-product-form button[type="submit"], .product-form__submit',
    variantBtn:  '.variant-option-item, .swatch-option, input[type="radio"] + label',
    variantSelect:'.product-variants-selector-select, select[name*="options"], select[id*="Option"]',
    quantity:    'input[name="quantity"], .quantity-input, .quantity__input',
    soldOutMsg:  '.product__sold-out, [class*="sold-out"], .badge--sold-out',
    description: '.product__description, .product-single__description, #ProductDescription',
  },

  // ── Cart ──────────────────────────────────────────────────
  cart: {
    drawer:      '.cart-drawer, #CartDrawer, .drawer--active, .cart-notification',
    checkoutBtn: 'button[name="checkout"], #CartDrawer-Checkout, .cart__checkout-button',
    itemName:    '.cart_item_name, .cart-item__name, .cart-item h3',
    itemPrice:   '.cart-item .price, .cart-item [class*="price"]',
    emptyMsg:    '.cart__empty-text, .is-empty, .empty-cart',
    continueBtn: 'a[href="/collections/all"], .cart__continue-shopping',
    removeBtn:   '.cart-item__remove, button[aria-label*="remove" i]',
  },

  // ── Account ───────────────────────────────────────────────
  account: {
    emailInput:  'input[type="email"], #CustomerEmail',
    passInput:   'input[type="password"], #CustomerPassword',
    submitBtn:   'button[type="submit"], input[type="submit"]',
    errorMsg:    '.errors, .form__message--error, [class*="error"]',
    registerLink:'a[href*="/account/register"]',
    forgotLink:  'a[href*="/account/recover"]',
  },

  // ── Contact form ──────────────────────────────────────────
  contact: {
    form:        'form#ContactForm, #contact_form, .contact-form',
    nameInput:   'input[name*="name"], #ContactForm-name',
    emailInput:  'input[name*="email"], #ContactForm-email',
    msgInput:    'textarea, #ContactForm-body',
    submitBtn:   'button[type="submit"], input[type="submit"]',
    successMsg:  '.form__message--success, [class*="success"]',
    errorMsg:    '.form__message--error, [class*="error"]',
  },

  // ── Blog ──────────────────────────────────────────────────
  blog: {
    grid:        '.blog, .article-list, .articles-grid',
    articleCard: '.article, .article-card, .blog-article',
    articleLink: '.article a, .article-card a',
    articleBody: 'article, .article__content, .article-template',
  },

  // ── Main content ──────────────────────────────────────────
  main: {
    container:   'main, #MainContent, .main-content',
  },
// ── Home page sections ──────────────────────────────
  slideshow: {
    section:   '[id^="shopify-section"] .slideshow, [id^="shopify-section"] [class*="slideshow"], [id^="shopify-section"] [class*="slider"]',
    slide:     '[class*="slide"], [role="group"], li',
    nextArrow: 'button[aria-label*="Next" i], [class*="next"]',
    dots:      '[class*="dot"], [class*="indicator"], button[aria-label*="slide" i]',
    cta:       'a[class*="button"], .btn, a[role="button"]',
  },
  featuredProduct: {
    section:     '[id^="shopify-section"] .featured-product, [id^="shopify-section"] [class*="featured-product"]',
    title:       '[class*="product__title"], h1, h2, h3',
    price:       '[class*="price"]',
    productLink: 'a[href*="/products/"]',
    addToCart:   'button[name="add"], [class*="add-to-cart"]',
    quantity:    'input[name="quantity"], input[type="number"][class*="quantity"]',
  },
  featuredCollection: {
    section:        '[id^="shopify-section"] .featured-collection, [id^="shopify-section"] [class*="featured-collection"], [id^="shopify-section"] [class*="collection__products"]',
    title:          '[class*="title"], h2, h3',
    collectionLink: 'a[href*="/collections/"]',
    productCard:    '[class*="product-card"], [class*="card--product"], a[href*="/products/"]',
  },
  collectionList: {
    section: '[id^="shopify-section"] .collection-list, [id^="shopify-section"] [class*="collection-list"]',
    tile:    'a[href*="/collections/"], [class*="collection-list__item"], [class*="collection-card"]',
  },
  imageWithText: {
    section: '[id^="shopify-section"] .image-with-text, [id^="shopify-section"] [class*="image-with-text"]',
    heading: 'h2, h3, [class*="heading"]',
    text:    '[class*="text"], [class*="content"], p',
  },
  newsletter: {
    section: '[id^="shopify-section"] .newsletter, [id^="shopify-section"] [class*="newsletter"]',
    email:   'input[type="email"], input[name*="email" i]',
    submit:  'button[type="submit"], input[type="submit"]',
  },
  richText: {
    section: '[id^="shopify-section"] .rich-text, [id^="shopify-section"] [class*="rich-text"]',
    heading: 'h1, h2, h3, [class*="heading"]',
    body:    'p, [class*="rich-text__text"], [class*="text"]',
  },
  blogPosts: {
    section:     '[id^="shopify-section"] .blog-posts, [id^="shopify-section"] [class*="blog-posts"], [id^="shopify-section"] [class*="article"]',
    article:     '[class*="article"], a[href*="/blogs/"]',
    articleLink: 'a[href*="/blogs/"]',
  },
  video: {
    section:     '[id^="shopify-section"] .video, [id^="shopify-section"] [class*="video"]',
    player:      'video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[title*="video" i]',
    playTrigger: '[class*="deferred-media__poster"], button[aria-label*="play" i]',
  },

  // ── Lollipop theme custom sections ────────────────────
  // These sections are specific to the WeDesignTech "Lollipop"
  // theme and are not part of Dawn. Selectors verified against
  // https://lollipop-theme.myshopify.com/ (home page).

  // Wave / scrolling marquee announcement strip
  waveMarquee: {
    section:  '.marquee-wave, [class*="marquee-wave"], [id*="__wave_marquee"]',
    track:    '.marquee_annoucement, [class*="marquee_annoucement"]',
    item:     '.marquee_annoucement > *, [class*="marquee"] a, [class*="marquee"] span',
  },

  // Content showcase (media + text promo blocks)
  contentShowcase: {
    section:  '.content_showcase, [class*="content_showcase"], [id*="__content_showcase"]',
    heading:  'h2, h3, [class*="heading"], [class*="title"]',
    item:     '[class*="content_showcase"] a, [class*="showcase"] [class*="item"]',
    cta:      'a[class*="button"], .btn, a[role="button"]',
  },

  // Shop the look (shoppable lookbook with product hotspots)
  shopTheLook: {
    section:      '.section-shop-the-look, .shop-the-look, [id*="__shop_the_look"]',
    media:        '.shop-the-look__media, .shop-the-look__media-wrapper',
    hotspot:      '.shop-the-look__media [class*="dot"], button[aria-label*="product" i], [class*="hotspot"]',
    productLink:  'a[href*="/products/"]',
  },

  // Brand logos (swiper carousel of brand images)
  brandLogos: {
    section:  '.section-brand-logos, .brand-logos, [id*="__brand_logos"]',
    track:    '.brand-logos-cotainer, .swiper-wrapper.brand-logos-gap',
    logo:     '.swiper-slide img, .brand-logos img',
  },

  // Comparison banner (two-column us-vs-them banner)
  comparisonBanner: {
    section:  '.section-comparison-banner, .comparison-banner, [id*="__comparison_banner"]',
    heading:  'h2, h3, [class*="heading"], [class*="title"]',
    column:   '[class*="comparison-banner"] [class*="col"]',
    cta:      'a[class*="button"], .btn, a[role="button"]',
  },

  // Product comparison table (feature grid across products)
  comparisonTable: {
    section:      '.section-comparison-table, .product-comparison-table, [id*="__product_comparison_table"]',
    table:        '.compare_container, .comparison-table.table, table',
    productMedia: '.product-table-media',
    productList:  '.product-table-list',
    productLink:  'a[href*="/products/"]',
  },

  // Text with icons (icon + copy feature columns)
  textWithIcons: {
    section:  '.text-with-icons, [class*="text-with-icon"], [id*="__text_with_icons"]',
    block:    '.icon-block, .section-text-with-icon',
    icon:     '.icon-block img, .icon-block svg',
    heading:  'h2, h3, [class*="heading"], [class*="title"]',
    text:     'p, [class*="text"]',
  },

  // Image gallery (swiper of images)
  imageGallery: {
    section:  '.image-gallery, [class*="image-gallery"], [id*="__image_gallery"]',
    item:     '.image-gallery-item, .swiper-slide[class*="gallery"]',
    image:    '.image-gallery-item img, .swiper-slide img',
    link:     '.image-gallery-item a',
  },

  // Quiz (interactive product-finder quiz)
  quiz: {
    section:     '.quiz-section, .quiz_section, .quiz, [id*="__quiz"]',
    imageBlock:  '.quiz-image-block',
    qaBlock:     '.quiz-qa-block',
    question:    '.quiz_options_block, [class*="quiz_question"]',
    option:      '.quiz_options_block [class*="option"], [class*="quiz_answer"]',
    answer:      '.quiz_answer, .quiz-answer_block',
    nextButton:  '.quiz-button-next',
    prevButton:  '.quiz-button-prev',
  },

  // Testimonials (customer quotes with author blocks)
  testimonials: {
    section:      '.section-testimonials, [class*="testimonial"], [id*="__testimonials"]',
    block:        '.testimonial_block, .testimonial-content',
    authorName:   '.testimonial_author_title',
    authorRole:   '.testimonial_author_subtitle',
    image:        '.testimonial_image img, .testimonial_image',
  },

  // Shoppable videos (renders as the theme's video grid)
  shoppableVideos: {
    section:  '.section-video-grid, .video-grid, [id*="__shoppable_videos"]',
    wrapper:  '.video-grid-wrapper',
    player:   'video, iframe[src*="youtube"], iframe[src*="vimeo"]',
    trigger:  '[class*="deferred-media__poster"], button[aria-label*="play" i]',
  },

  home: {
    sectionWrapper: '[id^="shopify-section-"]',
    mainSections:   'main [id^="shopify-section-"], #MainContent [id^="shopify-section-"]',
  },
};

export default LOCATORS;
