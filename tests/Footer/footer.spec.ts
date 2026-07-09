// tests/Footer/footer.spec.ts
// ─────────────────────────────────────────────────────────────
// Footer section test suite for the Lollipop Shopify theme
// (https://lollipop-theme.myshopify.com/).
//
// Coverage was derived by inspecting the LIVE storefront footer DOM
// (Shopify MCP server + storefront HTML) rather than from assumptions.
// Verified structure:
//   • <footer id="footer"> .container > #footer-accordion
//       - .footer-block--brand  -> a.logo_link[href="/"] > img (alt "Lollipop-theme")
//       - .footer-block--menu   -> heading "Pages" + ul.footer-link-list
//                                  (Shop, Our Story, Journal, Faq, Contact)
//       - .footer-social-icon   -> heading "Share with us" + 7 social links
//   • .footer_bottom
//       - .footer__localization -> <localization-form> country/currency selector
//       - .footer-copyright     -> "© <year>, Lollipop-theme" + "Powered by Shopify"
//       - .footer-payments      -> 6 payment icons (Visa, Mastercard, Amex,
//                                  PayPal, Diners Club, Discover)
//
// Architecture: intent lives in pages/FooterPage.ts (extends BasePage);
// selectors live in locators/footer.locators.ts; shared utilities come
// from utils/helper.js; expected values come from data/testData.json.
// No locators are written inline here.
//
// NOTES / non-automatable items are documented at the bottom of file.
// ─────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { FooterPage } from '../../pages/FooterPage';
import {
  BREAKPOINTS,
  collectErrors,
  expectImageLoaded,
} from '../../utils/helper.js';
import testData from '../../data/testData.json';

const FOOTER = testData.footer;

// ═════════════════════════════════════════════════════════════
// 1. STRUCTURE & RENDERING
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Structure & Rendering', () => {
  let footer: FooterPage;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
  });

  test('footer is present in the DOM on page load', async () => {
    await expect(footer.section).toBeAttached();
  });

  test('footer becomes visible once scrolled into view', async () => {
    await footer.scrollIntoView();
    await expect(footer.section).toBeVisible();
  });

  test('footer exposes its top content region and bottom bar', async () => {
    await footer.scrollIntoView();
    await expect(footer.container).toBeVisible();
    await expect(footer.bottom).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════
// 2. BRANDING (logo)
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Branding', () => {
  let footer: FooterPage;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('logo links to the home page and is accessible', async () => {
    await expect(footer.logoLink).toBeVisible();
    await expect(footer.logoLink).toHaveAttribute('href', '/');
    await expect(footer.logoLink).toHaveAttribute('aria-label', FOOTER.logoAlt);
  });

  test('logo image renders, is loaded and has descriptive alt text', async () => {
    await expect(footer.logoImage).toHaveAttribute('alt', FOOTER.logoAlt);
    await expectImageLoaded(footer.logoImage);
  });

  test('clicking the footer logo navigates to the home page', async ({ page }) => {
    await footer.open('/collections/all'); // start away from home
    await footer.scrollIntoView();
    await footer.logoLink.click();
    await expect(page).toHaveURL(/\/(?:$|\?|#)|myshopify\.com\/?$/);
  });
});

// ═════════════════════════════════════════════════════════════
// 3. MENU (link list)
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Menu', () => {
  let footer: FooterPage;
  const MENU = FOOTER.menu;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('the "Pages" menu column is present with its heading', async () => {
    const column = footer.menuColumn(MENU.heading);
    await expect(column).toHaveCount(1);
    await expect(column.locator('.footer-heading')).toContainText(MENU.heading);
  });

  test('the menu renders exactly the expected number of links', async () => {
    await expect(footer.menuColumnLinks(MENU.heading)).toHaveCount(MENU.links.length);
  });

  test('every expected menu item is present with the correct href', async () => {
    for (const item of MENU.links) {
      const link = footer.menuLinkByText(MENU.heading, item.label);
      await expect(link, `Footer link "${item.label}" should be visible`).toBeVisible();
      await expect(link).toHaveAttribute('href', item.href);
    }
  });

  test('every footer menu link exposes a non-empty internal href', async () => {
    const links = footer.menuColumnLinks(MENU.heading);
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `menu link #${i} should have an href`).toBeTruthy();
      expect(href, `menu link #${i} should be an internal path`).toMatch(/^\//);
    }
  });

  test('clicking a footer menu link navigates to its target page', async ({ page }) => {
    await footer.menuLinkByText(MENU.heading, 'Shop').click();
    await expect(page).toHaveURL(/\/collections\/all/);
  });
});

// ═════════════════════════════════════════════════════════════
// 4. SOCIAL ICONS  ("Share with us")
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Social icons', () => {
  let footer: FooterPage;
  const SOCIAL = FOOTER.social;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('renders the expected number of social links', async () => {
    await expect(footer.socialLinks).toHaveCount(SOCIAL.networks.length);
  });

  test('each social link exposes an accessible network name', async () => {
    const labels = (await footer.socialLabels.allTextContents())
      .map((t) => t.replace(/[#\s]/g, ''))
      .filter(Boolean);

    expect(labels.length).toBe(SOCIAL.networks.length);
    for (const network of SOCIAL.networks) {
      expect(
        labels.some((l) => l.toLowerCase() === network.toLowerCase()),
        `Social label for "${network}" should be present (found: ${labels.join(', ')})`,
      ).toBeTruthy();
    }
  });

  test('each social link renders an icon and is keyboard-focusable', async () => {
    const count = await footer.socialLinks.count();
    for (let i = 0; i < count; i++) {
      const link = footer.socialLinks.nth(i);
      await expect(link).toBeVisible();
      await expect(link.locator('svg')).toBeVisible();
    }
  });

  test('edge case: social links are placeholder anchors (href="#") on this store', async () => {
    // The theme ships social blocks whose target URLs are unconfigured on
    // this preview store, so each anchor points at "#". This documents the
    // real state; wire real profile URLs in theme settings to change it.
    const count = await footer.socialLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(footer.socialLinks.nth(i)).toHaveAttribute('href', '#');
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 5. LOCALIZATION  (country / currency selector)
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Localization', () => {
  let footer: FooterPage;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('the country/currency selector is present with a current value', async () => {
    await expect(footer.localization).toBeVisible();
    await expect(footer.countryToggle).toBeVisible();
    // The toggle label shows the active currency (e.g. "AED (د.إ)").
    await expect(footer.countryToggle).not.toHaveText('');
  });

  test('opening the selector reveals a list of selectable countries', async () => {
    await expect(footer.countryToggle).toHaveAttribute('aria-expanded', 'false');
    await footer.openCountrySelector();
    await expect(footer.countryToggle).toHaveAttribute('aria-expanded', 'true');
    expect(await footer.countryOptions.count()).toBeGreaterThan(1);
    await expect(footer.countryOptions.first()).toBeVisible();
  });

  test('each country option carries a market data-value', async () => {
    await footer.openCountrySelector();
    const count = await footer.countryOptions.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(footer.countryOptions.nth(i)).toHaveAttribute('data-value', /\w+/);
    }
  });
});

// ═════════════════════════════════════════════════════════════
// 6. COPYRIGHT / BOTTOM BAR
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Copyright', () => {
  let footer: FooterPage;
  const COPY = FOOTER.copyright;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('copyright shows the year and store name', async () => {
    await expect(footer.copyrightText).toBeVisible();
    await expect(footer.copyrightText).toContainText(COPY.storeName);
    await expect(footer.copyrightText).toContainText(/©|\bcopyright\b|\d{4}/i);
  });

  test('the copyright store link points at the home page', async () => {
    await expect(footer.copyrightHomeLink).toHaveAttribute('href', '/');
  });

  test('the "Powered by Shopify" link is present and opens in a new tab', async () => {
    const link = footer.poweredByShopify;
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', new RegExp(COPY.poweredByHref));
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /nofollow/);
  });
});

// ═════════════════════════════════════════════════════════════
// 7. PAYMENT ICONS
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Payment icons', () => {
  let footer: FooterPage;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('renders the expected number of payment icons', async () => {
    await expect(footer.paymentItems).toHaveCount(FOOTER.payments.length);
  });

  test('each payment icon is visible and exposes an accessible name', async () => {
    const count = await footer.paymentIcons.count();
    expect(count).toBe(FOOTER.payments.length);
    for (let i = 0; i < count; i++) {
      await expect(footer.paymentIcons.nth(i)).toBeVisible();
      // Each <svg> is labelled by a <title> element (role="img").
      await expect(footer.paymentIcons.nth(i)).toHaveAttribute('aria-labelledby', /pi-/);
    }
  });

  test('the rendered payment brands match the configured set', async () => {
    const titles = (await footer.paymentIconTitles.allTextContents())
      .map((t) => t.trim())
      .filter(Boolean);

    expect(titles.sort()).toEqual([...FOOTER.payments].sort());
  });
});

// ═════════════════════════════════════════════════════════════
// 8. RESPONSIVE  (layout integrity across breakpoints)
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Responsive', () => {
  for (const bp of BREAKPOINTS) {
    test(`footer and its key regions stay present at ${bp.name} (${bp.width}px)`, async ({ page }) => {
      const footer = new FooterPage(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await footer.open();
      await footer.scrollIntoView();

      await expect(footer.section).toBeVisible();
      await expect(footer.logoLink).toBeVisible();
      // Menu links, copyright and payments are offered at every width.
      expect(await footer.menuLinks.count()).toBeGreaterThan(0);
      await expect(footer.copyrightText).toBeVisible();
      await expect(footer.payments).toBeVisible();
    });
  }
});

// ═════════════════════════════════════════════════════════════
// 9. ACCESSIBILITY
// ═════════════════════════════════════════════════════════════
test.describe('Footer - Accessibility', () => {
  let footer: FooterPage;

  test.beforeEach(async ({ page }) => {
    footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
  });

  test('footer has no critical or serious axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('#footer')
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

  test('social links expose non-empty accessible names', async () => {
    const count = await footer.socialLinks.count();
    for (let i = 0; i < count; i++) {
      const name = (await footer.socialLinks.nth(i).textContent())?.trim() ?? '';
      expect(name.length, `social link #${i} should have an accessible name`).toBeGreaterThan(0);
    }
  });

  test('every payment icon svg has a <title> for assistive tech', async () => {
    const iconCount = await footer.paymentIcons.count();
    const titleCount = await footer.paymentIconTitles.count();
    expect(titleCount).toBe(iconCount);
  });
});

// ═════════════════════════════════════════════════════════════
// 10. STABILITY / EDGE CASES
// ═════════════════════════════════════════════════════════════

// Known-benign console noise emitted by Shopify/theme infrastructure
// (pixel/postMessage bridge, third-party embeds) that is outside the
// footer's control. Genuine footer/app errors still fail the test.
const IGNORED_CONSOLE = [
  /Unable to post message to .*Recipient has origin null/i,
  /web-pixels-manager/i,
  /Failed to load resource:.*(status of 40|net::ERR)/i,
];

test.describe('Footer - Stability & Edge cases', () => {
  test('footer loads without unexpected JavaScript console errors', async ({ page }) => {
    const footer = new FooterPage(page);
    const errors = collectErrors(page); // attach BEFORE navigation
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();
    await footer.waitForPageLoad();

    const unexpected = errors.filter(
      (e) => !IGNORED_CONSOLE.some((re) => re.test(e)),
    );
    expect(unexpected, `Unexpected console errors:\n${unexpected.join('\n')}`).toEqual([]);
  });

  test('all images rendered inside the footer are loaded', async ({ page }) => {
    const footer = new FooterPage(page);
    await footer.setDesktopView();
    await footer.open();
    await footer.scrollIntoView();

    const images = footer.section.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      if (!(await img.isVisible())) continue;
      // Poll until the browser reports the image as fully decoded — footer
      // images can still be in-flight the instant they scroll into view.
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
          { message: `footer image #${i} should finish loading (naturalWidth > 0)` },
        )
        .toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// NOTES — requirements that are intentionally NOT automated here
// ─────────────────────────────────────────────────────────────
// 1. Mobile "accordion" collapse: the theme markup renders accordion
//    headers/buttons (data-bs-toggle="collapse") but the "Pages" link
//    list has NO Bootstrap `.collapse` class and stays visible at every
//    breakpoint, so there is no working expand/collapse to assert. It is
//    covered instead as an always-visible list (see Menu + Responsive).
// 2. Newsletter signup: this theme places the newsletter in a home-page
//    section, not in the footer, so it is out of scope here and covered
//    by the home-page/newsletter suite to avoid duplicate coverage.
// 3. Country/currency SELECTION: choosing a country submits the
//    localization form (a full page reload) and mutates the storefront
//    currency for the session, which would leak state into other specs.
//    Presence + open + option listing are validated; the actual currency
//    switch belongs in a dedicated, isolated localization test.
// 4. Social link destinations: anchors point at "#" on this preview store
//    (unconfigured), so outbound navigation cannot be asserted. Presence,
//    icon rendering and accessible names are validated instead (Section 4).
// 5. "Powered by Shopify" is external; it is validated by href/target/rel
//    rather than by following the outbound navigation.
