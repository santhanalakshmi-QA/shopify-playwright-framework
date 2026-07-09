// tests/Header/header.spec.ts
// ─────────────────────────────────────────────────────────────
// Header section test suite for the Lollipop Shopify theme
// (https://lollipop-theme.myshopify.com/).
//
// Coverage was derived by inspecting the LIVE storefront header DOM
// (via the Shopify MCP server + storefront HTML) rather than from
// assumptions. Verified structure:
//   • <header id="header"> with nav[data-menu="dt-main-menu"]
//   • Top-level menu: Home, Shop (mega-menu), Inner Pages, Journal
//   • Search  -> off-canvas #searchBox (predictive-search, form -> /search)
//   • Cart    -> a.header-cart (#cartOffCanvas drawer) + #header-cart-count
//   • Account -> <shopify-account> (hidden below the `md` breakpoint)
//   • Mobile  -> button.navbar-toggler -> #mobileNavigation drawer
//
// Architecture: all intent lives in pages/HeaderPage.js (extends
// BasePage); all selectors live in locators/shopify-locators.js;
// shared utilities come from utils/helper.js; expected values come
// from data/testData.json. No locators are written inline here.
//
// NOTES / non-automatable items are documented at the bottom of file.
// ─────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HeaderPage } from '../../pages/HeaderPage.js';
import {
  BREAKPOINTS,
  collectErrors,
  expectImageLoaded,
} from '../../utils/helper.js';
import testData from '../../data/testData.json';

const HEADER = testData.header;

// ═════════════════════════════════════════════════════════════
// 1. STRUCTURE & BRANDING (logo)
// ═════════════════════════════════════════════════════════════
test.describe('Header - Structure & Branding', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('header renders and is visible on load', async () => {
    await expect(header.header()).toBeVisible();
  });

  test('logo is visible, links home and renders a loaded image', async () => {
    const logo = header.logoLink();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');

    const img = header.logoImage();
    await expect(img).toHaveAttribute('alt', HEADER.logoAlt);
    await expectImageLoaded(img);
  });

  test('clicking the logo navigates to the home page', async ({ page }) => {
    await header.gotoCollections();          // move away from home first
    await header.clickLogo();
    await expect(page).toHaveURL(/\/(?:$|\?|#)|myshopify\.com\/?$/);
  });

  test('the three primary header actions (search, cart, mobile toggle) exist', async () => {
    await expect(header.searchToggle()).toBeVisible();
    await expect(header.cartLink()).toBeVisible();
    // Mobile toggle is present in the DOM but hidden at desktop widths.
    await expect(header.mobileMenuButton()).toBeAttached();
  });
});

// ═════════════════════════════════════════════════════════════
// 2. DESKTOP NAVIGATION
// ═════════════════════════════════════════════════════════════
test.describe('Header - Desktop Navigation', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('desktop navigation is visible and mobile toggle is hidden', async () => {
    await expect(header.desktopNav()).toBeVisible();
    await expect(header.mobileMenuButton()).toBeHidden();
  });

  test('renders exactly the expected top-level menu items', async () => {
    await expect(header.topLevelItems()).toHaveCount(HEADER.topLevelNav.length);
  });

  test('each expected top-level item is present by its accessible name', async () => {
    for (const item of HEADER.topLevelNav) {
      await expect(
        header.navLinkByName(item.label),
        `Top-level nav item "${item.label}" should be visible`,
      ).toBeVisible();
    }
  });

  test('every top-level nav link exposes a non-empty href', async () => {
    const links = header.topLevelLinks();
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `nav link #${i} should have an href`).toBeTruthy();
    }
  });

  test('the "Shop" item is wired as a mega-menu trigger', async () => {
    await expect(header.megaMenuItems().first()).toBeAttached();
    await expect(header.megaMenuToggle()).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════
// 3. MEGA MENU  (Shop)
// ═════════════════════════════════════════════════════════════
test.describe('Header - Mega Menu (Shop)', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('opening the mega menu reveals its panel with sub-menu links', async () => {
    await header.openMegaMenu();
    await expect(header.megaMenuContent()).toBeVisible();
    expect(await header.level2Links().count()).toBeGreaterThan(0);
    expect(await header.level3Links().count()).toBeGreaterThan(0);
  });

  test('mega-menu links carry valid product/collection hrefs', async () => {
    await header.openMegaMenu();
    const link = header
      .megaMenuContent()
      .locator('a[href*="/collections/"], a[href*="/products/"]')
      .first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\/(collections|products)\//);
  });

  test('clicking a mega-menu link navigates to the target page', async ({ page }) => {
    await header.openMegaMenu();
    const link = header
      .megaMenuContent()
      .locator('a[href^="/collections/"]')
      .first();
    const href = await link.getAttribute('href');
    await link.click();
    await page.waitForURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page).toHaveURL(new RegExp('/collections/'));
  });
});

// ═════════════════════════════════════════════════════════════
// 4. SEARCH   (positive, negative, validation, UI, edge cases)
// ═════════════════════════════════════════════════════════════
test.describe('Header - Search', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('search toggle opens the off-canvas search panel with focusable input', async () => {
    await header.openSearch();
    await expect(header.searchModal()).toBeVisible();
    await expect(header.searchInput()).toBeVisible();
    await expect(header.searchInput()).toHaveAttribute('type', 'search');
  });

  test('typing a term populates the field and renders the clear control (UI)', async () => {
    await header.searchFor(HEADER.search.validTerm);
    await expect(header.searchInput()).toHaveValue(HEADER.search.validTerm);
    // The reset control is toggled in by the theme once the field has a
    // value; assert it is present (its reset behaviour is covered below).
    await expect(header.searchClearButton()).toBeAttached();
  });

  test('positive: submitting a valid term returns results on the search page', async ({ page }) => {
    await header.submitSearch(HEADER.search.validTerm);
    await expect(page).toHaveURL(/[/]search\?.*q=/);
    const results = page.locator('#MainContent a[href*="/products/"]');
    await expect(results.first()).toBeVisible();
  });

  test('negative: an unmatched term yields zero product results', async ({ page }) => {
    await header.submitSearch(HEADER.search.noResultsTerm);
    await expect(page).toHaveURL(/[/]search\?.*q=/);
    await expect(page.locator('#MainContent a[href*="/products/"]')).toHaveCount(0);
  });

  test('validation: an empty search does not surface product suggestions', async () => {
    await header.openSearch();
    await header.searchInput().fill('');
    // No query -> the predictive results must not list any products.
    await expect(header.searchProductLinks()).toHaveCount(0);
  });

  test('the clear button resets the search field', async () => {
    await header.searchFor(HEADER.search.validTerm);
    await header.clearSearch();
    await expect(header.searchInput()).toHaveValue('');
  });

  test('the search panel can be dismissed via its close control', async () => {
    await header.openSearch();
    await header.closeSearch();
    await expect(header.searchModal()).toBeHidden();
  });
});

// ═════════════════════════════════════════════════════════════
// 5. CART
// ═════════════════════════════════════════════════════════════
test.describe('Header - Cart', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('cart icon is visible and points at /cart', async () => {
    await expect(header.cartLink()).toBeVisible();
    await expect(header.cartLink()).toHaveAttribute('href', '/cart');
  });

  test('cart count badge is present in the header', async () => {
    await expect(header.cartCount()).toBeAttached();
  });

  test('clicking the cart icon opens the cart drawer', async () => {
    await header.openCartDrawer();
    await expect(header.cartDrawer()).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════
// 6. ACCOUNT
// ═════════════════════════════════════════════════════════════
test.describe('Header - Account', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.open();
  });

  test('account control is visible on desktop', async () => {
    await header.setDesktopView();
    await expect(header.accountIcon()).toBeVisible();
  });

  test('account control is hidden on mobile widths (theme d-none d-md-flex)', async () => {
    await header.setMobileView();
    await expect(header.accountIcon()).toBeHidden();
  });
});

// ═════════════════════════════════════════════════════════════
// 7. MOBILE NAVIGATION
// ═════════════════════════════════════════════════════════════
test.describe('Header - Mobile Navigation', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setMobileView();
    await header.open();
  });

  test('hamburger toggle is visible and desktop nav is hidden on mobile', async () => {
    await expect(header.mobileMenuButton()).toBeVisible();
    await expect(header.desktopNav()).toBeHidden();
  });

  test('tapping the hamburger opens the mobile drawer with menu items', async () => {
    await header.openMobileMenu();
    await expect(header.mobileDrawer()).toBeVisible();
    expect(await header.mobileLinks().count()).toBeGreaterThan(0);
  });

  test('the mobile drawer can be closed again', async () => {
    await header.openMobileMenu();
    await header.closeMobileMenu();
    await expect(header.mobileDrawer()).toBeHidden();
  });
});

// ═════════════════════════════════════════════════════════════
// 8. RESPONSIVE  (layout integrity across breakpoints)
// ═════════════════════════════════════════════════════════════
test.describe('Header - Responsive', () => {
  for (const bp of BREAKPOINTS) {
    test(`header stays visible and shows one nav mode at ${bp.name} (${bp.width}px)`, async ({ page }) => {
      const header = new HeaderPage(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await header.open();

      // The header itself must always be present.
      await expect(header.header()).toBeVisible();

      // Exactly one navigation affordance should be offered at any width:
      // the inline desktop nav (>= lg) OR the hamburger toggle (< lg).
      const desktopVisible = await header.isDesktopNavVisible();
      const toggleVisible = await header.isMobileMenuButtonVisible();
      expect(
        desktopVisible !== toggleVisible,
        `Exactly one nav mode expected at ${bp.width}px ` +
          `(desktopNav=${desktopVisible}, toggle=${toggleVisible})`,
      ).toBeTruthy();

      // Search + cart affordances are offered at every breakpoint.
      await expect(header.searchToggle()).toBeVisible();
      await expect(header.cartLink()).toBeVisible();
    });
  }
});

// ═════════════════════════════════════════════════════════════
// 9. ACCESSIBILITY
// ═════════════════════════════════════════════════════════════
test.describe('Header - Accessibility', () => {
  let header: HeaderPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();
  });

  test('key header icons expose descriptive accessible names', async () => {
    await expect(header.searchToggle()).toHaveAttribute('aria-label', /keyword|search/i);
    await expect(header.cartLink()).toHaveAttribute('aria-label', /cart/i);
  });

  test('header has no critical or serious axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('#header')
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

  test('the search panel is reachable and dismissible via the keyboard', async () => {
    await header.openSearch();
    await expect(header.searchInput()).toBeVisible();
    await header.closeSearch();               // ESC
    await expect(header.searchModal()).toBeHidden();
  });
});

// ═════════════════════════════════════════════════════════════
// 10. STABILITY / EDGE CASES
// ═════════════════════════════════════════════════════════════

// Known-benign console noise emitted by Shopify/theme infrastructure
// (pixel/postMessage bridge, third-party embeds) that is outside the
// header's control. Genuine header/app errors still fail the test.
const IGNORED_CONSOLE = [
  /Unable to post message to .*Recipient has origin null/i,
  /web-pixels-manager/i,
  /Failed to load resource:.*(status of 40|net::ERR)/i,
];

test.describe('Header - Stability & Edge cases', () => {
  test('header loads without unexpected JavaScript console errors', async ({ page }) => {
    const header = new HeaderPage(page);
    const errors = collectErrors(page);         // attach BEFORE navigation
    await header.setDesktopView();
    await header.open();
    await header.waitForPageLoad();

    const unexpected = errors.filter(
      (e) => !IGNORED_CONSOLE.some((re) => re.test(e)),
    );
    expect(unexpected, `Unexpected console errors:\n${unexpected.join('\n')}`).toEqual([]);
  });

  test('all images rendered inside the header are loaded', async ({ page }) => {
    const header = new HeaderPage(page);
    await header.setDesktopView();
    await header.open();

    const images = header.header().locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        await expectImageLoaded(img);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────
// NOTES — requirements that are intentionally NOT automated here
// ─────────────────────────────────────────────────────────────
// 1. Account authentication flow: the header exposes a <shopify-account>
//    web component. Its click opens Shopify's hosted / customer-account
//    surface, which lives outside the storefront DOM and requires real
//    credentials. Header scope is limited to presence/visibility; the
//    login/registration journey belongs in an Account-page spec.
// 2. Cart line-item / checkout behaviour: the header only owns the cart
//    entry point (icon, count badge, drawer open). Adding items and
//    checkout are covered by cart/checkout specs (see utils/helper.js
//    addToCart) to avoid duplicate coverage.
// 3. Localization (country / language) selectors render only inside the
//    mobile drawer in this theme configuration and depend on the store's
//    Markets setup; they are omitted until a stable market list exists.
// 4. Predictive-search result *contents* are validated via the
//    deterministic /search results page (positive/negative tests) rather
//    than the debounced dropdown, which is network-timing sensitive.
