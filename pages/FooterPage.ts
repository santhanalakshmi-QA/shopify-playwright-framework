import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { footerSelectors as S } from '../locators/footer.locators';

/**
 * FooterPage — Page Object for the Lollipop storefront footer.
 *
 * Extends BasePage (navigation / viewport / screenshot / console-error
 * helpers). All selectors live in `footer.locators.ts`; this class only
 * exposes intent. The model mirrors the LIVE footer structure:
 *   • Brand block  -> logo link + image
 *   • Menu block   -> "Pages" link list (resolved by heading text)
 *   • Social block -> "Share with us" social-icon links
 *   • Bottom bar   -> localization/country selector, copyright, payments
 *
 * Note: on this theme the footer link list is rendered as an always-on
 * list (no Bootstrap `.collapse`), so there is no functioning mobile
 * accordion to toggle — see the spec NOTES section.
 */
export class FooterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Regions ────────────────────────────────────────────────
  get section(): Locator {
    return this.page.locator(S.section);
  }
  get container(): Locator {
    return this.page.locator(S.container).first();
  }
  get bottom(): Locator {
    return this.page.locator(S.bottom).first();
  }

  // ── Brand: logo ────────────────────────────────────────────
  get brandBlock(): Locator {
    return this.page.locator(S.brandBlock);
  }
  get logoLink(): Locator {
    return this.page.locator(S.logoLink).first();
  }
  get logoImage(): Locator {
    return this.page.locator(S.logoImage).first();
  }

  // ── Menu columns (link lists) ──────────────────────────────
  get menuBlocks(): Locator {
    return this.page.locator(S.menuBlock);
  }
  get menuHeadings(): Locator {
    return this.page.locator(S.menuBlock).locator(S.menuHeading);
  }
  get menuLinks(): Locator {
    return this.page.locator(S.menuBlock).locator(S.menuLink);
  }

  /** Resolve a single menu column by its heading text (dynamic-id safe). */
  menuColumn(heading: string): Locator {
    return this.page
      .locator(S.menuBlock)
      .filter({ has: this.page.locator(S.menuHeading, { hasText: heading }) });
  }
  menuColumnLinks(heading: string): Locator {
    return this.menuColumn(heading).locator(S.menuLink);
  }
  /** A single footer menu link by its visible text, scoped to its column. */
  menuLinkByText(heading: string, text: string): Locator {
    return this.menuColumn(heading).getByRole('link', { name: text, exact: true });
  }

  // ── Social icons ───────────────────────────────────────────
  get socialBlock(): Locator {
    return this.page.locator(S.socialBlock);
  }
  get socialWrapper(): Locator {
    return this.page.locator(S.socialWrapper);
  }
  get socialLinks(): Locator {
    return this.page.locator(S.socialLink);
  }
  get socialLabels(): Locator {
    return this.page.locator(S.socialLabel);
  }

  // ── Localization / country selector ────────────────────────
  get localization(): Locator {
    return this.page.locator(S.localization);
  }
  get countryToggle(): Locator {
    return this.page.locator(S.countryToggle).first();
  }
  get countryMenu(): Locator {
    return this.page.locator(S.countryMenu).first();
  }
  get countryOptions(): Locator {
    return this.page.locator(S.countryOption);
  }

  // ── Bottom bar: copyright + payments ───────────────────────
  get copyrightText(): Locator {
    return this.page.locator(S.copyrightText).first();
  }
  get copyrightHomeLink(): Locator {
    return this.page.locator(S.copyrightHomeLink).first();
  }
  get poweredByShopify(): Locator {
    return this.page.locator(S.poweredByShopify).first();
  }
  get payments(): Locator {
    return this.page.locator(S.payments).first();
  }
  get paymentItems(): Locator {
    return this.page.locator(S.paymentItem);
  }
  get paymentIcons(): Locator {
    return this.page.locator(S.paymentIcon);
  }
  get paymentIconTitles(): Locator {
    return this.page.locator(S.paymentIconTitle);
  }

  // ── Actions ────────────────────────────────────────────────

  /** Navigate to a page and wait for the footer to be attached. */
  async open(path = '/'): Promise<void> {
    await this.goto(path);
    await this.section.waitFor({ state: 'attached' });
  }

  /** Scroll the footer into view (it sits below the fold on most pages). */
  async scrollIntoView(): Promise<void> {
    await this.section.scrollIntoViewIfNeeded();
  }

  /** Whether the resolved menu column rendered any links. */
  async columnHasLinks(heading: string): Promise<boolean> {
    return (await this.menuColumnLinks(heading).count()) > 0;
  }

  /** Open the footer country/currency selector (Bootstrap dropdown). */
  async openCountrySelector(): Promise<void> {
    await this.scrollIntoView();
    await this.countryToggle.click();
    await this.countryMenu.waitFor({ state: 'visible' });
  }
}

export default FooterPage;
