// pages/HeaderPage.js
// ─────────────────────────────────────────────────────────────
// Page Object for the Lollipop theme site header.
// Extends BasePage so it inherits navigation, waiting, viewport,
// screenshot and console-error helpers. All CSS selectors live in
// locators/shopify-locators.js — this class only exposes intent:
// "give me the logo", "open search", "open the mobile menu", etc.
// ─────────────────────────────────────────────────────────────

import { BasePage } from './BasePage.js';

export class HeaderPage extends BasePage {

  constructor(page) {
    super(page);
    // Short-hand references to the relevant locator groups.
    this.h = this.locators.header;
    this.n = this.locators.nav;
    this.s = this.locators.search;
    this.m = this.locators.mobileNav;
  }

  // ── Element getters (return Playwright Locators) ────────────

  header()          { return this.page.locator(this.h.root).first(); }
  headerWrapper()   { return this.page.locator(this.h.wrapper).first(); }
  logoLink()        { return this.page.locator(this.h.logoLink).first(); }
  logoImage()       { return this.page.locator(this.h.logoImg).first(); }
  searchToggle()    { return this.page.locator(this.h.searchToggle).first(); }
  accountIcon()     { return this.page.locator(this.h.accountIcon).first(); }
  cartLink()        { return this.page.locator(this.h.cartLink).first(); }
  cartCount()       { return this.page.locator(this.h.cartCount).first(); }
  cartDrawer()      { return this.page.locator(this.h.cartDrawer).first(); }
  mobileMenuButton(){ return this.page.locator(this.h.menuButton).first(); }

  // ── Navigation getters ──────────────────────────────────────

  desktopNav()      { return this.page.locator(this.n.desktopContainer).first(); }
  desktopMenu()     { return this.page.locator(this.n.desktopMenu).first(); }
  topLevelItems()   { return this.page.locator(this.n.topLevelItems); }
  topLevelLinks()   { return this.page.locator(this.n.topLevelLinks); }
  megaMenuItems()   { return this.page.locator(this.n.megaItem); }
  megaMenuToggle()  { return this.page.locator(this.n.megaToggle).first(); }
  megaMenuContent() { return this.page.locator(this.n.megaContent).first(); }
  level2Links()     { return this.page.locator(this.n.level2Links); }
  level3Links()     { return this.page.locator(this.n.level3Links); }

  // Find a top-level nav entry by its accessible name (role-based, per
  // the project's locator-priority rules). This theme renders its
  // top-level menu anchors with role="button", so match either role.
  navLinkByName(name) {
    const menu = this.desktopMenu();
    return menu
      .getByRole('link', { name, exact: true })
      .or(menu.getByRole('button', { name, exact: true }))
      .first();
  }

  // ── Mobile drawer getters ───────────────────────────────────

  mobileDrawer()    { return this.page.locator(this.m.drawer).first(); }
  mobileMenu()      { return this.page.locator(this.m.menu).first(); }
  mobileLinks()     { return this.page.locator(this.m.links); }
  mobileExpanders() { return this.page.locator(this.m.expanders); }

  // ── Search getters ──────────────────────────────────────────

  searchModal()      { return this.page.locator(this.s.modal).first(); }
  searchInput()      { return this.page.locator(this.s.input).first(); }
  searchButton()     { return this.page.locator(this.s.button).first(); }
  searchResults()    { return this.page.locator(this.s.results).first(); }
  searchProductLinks(){ return this.page.locator(this.s.productResults); }
  searchClearButton() { return this.page.locator(this.s.clearBtn).first(); }
  searchCloseButton() { return this.page.locator(this.s.closeBtn).first(); }

  // ── Actions ─────────────────────────────────────────────────

  // Open the site header (home page) and wait for it to render.
  async open() {
    await this.gotoHome();
    await this.header().waitFor({ state: 'visible' });
  }

  // Open the search off-canvas panel.
  async openSearch() {
    await this.searchToggle().click();
    await this.searchModal().waitFor({ state: 'visible' });
  }

  // Type a query into the search panel (opens it first if needed).
  async searchFor(term) {
    if (!(await this.searchModal().isVisible())) {
      await this.openSearch();
    }
    await this.searchInput().fill(term);
    await this.page.waitForTimeout(600); // predictive-search debounce
  }

  // Submit the current search query and wait for the results page.
  // The theme's search form is a native GET form posting to /search,
  // so submitting navigates to the full search results page.
  async submitSearch(term) {
    await this.searchFor(term);
    await Promise.all([
      this.page.waitForURL(/[/]search/, { timeout: 15000 }),
      this.searchInput().press('Enter'),
    ]);
    await this.waitForPageLoad();
  }

  // Clear the search field via the theme's reset button.
  async clearSearch() {
    await this.searchClearButton().click();
  }

  // Close the search panel. This theme's off-canvas has Bootstrap's
  // keyboard-dismiss disabled, so ESC is attempted first and we fall
  // back to the panel's close control (the real user affordance).
  async closeSearch() {
    await this.pressKey('Escape');
    try {
      await this.searchModal().waitFor({ state: 'hidden', timeout: 1500 });
    } catch {
      await this.searchCloseButton().click();
      await this.searchModal().waitFor({ state: 'hidden' });
    }
  }

  // Open the cart off-canvas drawer from the header cart icon.
  async openCartDrawer() {
    await this.cartLink().click();
    await this.cartDrawer().waitFor({ state: 'visible' });
  }

  // Open the mobile navigation drawer (forces a mobile viewport so
  // the hamburger toggle is rendered by the theme's CSS breakpoints).
  async openMobileMenu() {
    await this.setMobileView();
    await this.mobileMenuButton().click();
    await this.mobileDrawer().waitFor({ state: 'visible' });
  }

  // Close the mobile navigation drawer via its close button.
  async closeMobileMenu() {
    await this.page.locator(this.m.closeBtn).first().click();
    await this.mobileDrawer().waitFor({ state: 'hidden' });
  }

  // Expand the first collapsible submenu inside the mobile drawer.
  async expandFirstMobileSubmenu() {
    const expander = this.mobileExpanders().first();
    await expander.click();
    // Bootstrap collapse animation.
    await this.page.waitForTimeout(400);
  }

  // Reveal the mega-menu panel (desktop only). The theme opens it on
  // hover via CSS; on touch-capable contexts hover may not trigger, so
  // fall back to clicking the role="button" dropdown toggle.
  async openMegaMenu() {
    await this.megaMenuToggle().hover();
    try {
      await this.megaMenuContent().waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      await this.megaMenuToggle().click();
      await this.megaMenuContent().waitFor({ state: 'visible' });
    }
  }

  // ── Convenience checks ──────────────────────────────────────

  // True when the inline desktop navigation is visible.
  async isDesktopNavVisible() {
    return this.desktopNav().isVisible();
  }

  // True when the mobile hamburger toggle is visible.
  async isMobileMenuButtonVisible() {
    return this.mobileMenuButton().isVisible();
  }

  // Number of top-level navigation items.
  async topLevelItemCount() {
    return this.topLevelItems().count();
  }
}

export default HeaderPage;
