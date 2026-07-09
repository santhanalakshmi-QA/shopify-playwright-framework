// locators/footer.locators.ts
// ─────────────────────────────────────────────────────────────
// CSS selectors for the Lollipop Shopify theme storefront footer.
//
// Verified against the LIVE footer DOM of
// https://lollipop-theme.myshopify.com/ (not assumptions):
//   <footer id="footer">
//     .container > #footer-accordion > .row
//        ├─ .footer-block--brand   -> a.logo_link > img         (logo)
//        ├─ .footer-block--menu    -> h4.footer-heading "Pages"
//        │                            + ul.footer-link-list > li > a.menu_link
//        └─ .footer-social-icon    -> h4.footer-heading "Share with us"
//                                     + ul.footer__list-social > li > a.list-social__link
//     .footer_bottom
//        ├─ .footer__localization  -> <localization-form> #FooterCountryForm
//        │                            button.localization-selector (country/currency)
//        ├─ .footer__copyright     -> p.footer-copyright (© year, store + Powered by Shopify)
//        └─ .footer-payments       -> ul.payment-icons-list > li > svg[title]
//
// Locator priority follows the project rule (id > class > …). Most
// footer nodes are theme-generated and only expose class hooks, so
// stable class names are used and scoped under `footer#footer`.
// ─────────────────────────────────────────────────────────────

export const footerSelectors = {
  // ── Regions ───────────────────────────────────────────────
  section:       'footer#footer',
  container:     'footer#footer > .container:not(.footer_bottom)',
  accordionRoot: '#footer-accordion',
  bottom:        'footer#footer .footer_bottom',

  // ── Brand / logo ──────────────────────────────────────────
  brandBlock: 'footer#footer .footer-block--brand',
  logoLink:   'footer#footer a.logo_link',
  logoImage:  'footer#footer a.logo_link img',

  // ── Menu (link-list) columns ──────────────────────────────
  menuBlock:   'footer#footer .footer-block--menu',
  menuHeading: '.footer-heading',
  menuList:    'ul.footer-link-list',
  menuLink:    'a.menu_link',

  // ── Social icons ──────────────────────────────────────────
  socialBlock:   'footer#footer .footer-social-icon',
  socialWrapper: 'footer#footer .social-wrapper',
  socialList:    'ul.footer__list-social',
  socialItem:    'ul.footer__list-social li.list-social__item',
  socialLink:    'ul.footer__list-social a.list-social__link',
  socialLabel:   'ul.footer__list-social .social-icon-items',

  // ── Localization / country selector ───────────────────────
  localization:  'footer#footer .footer__localization',
  countryForm:   '#FooterCountryForm',
  countryToggle: 'footer#footer .localization-selector',
  countryList:   '#FooterCountry-country-results',
  countryMenu:   '#FooterCountry-country-results ul.dropdown-menu',
  countryOption: '#FooterCountry-country-results a.dropdown-item',

  // ── Bottom bar: copyright + payments ──────────────────────
  copyright:         'footer#footer .footer__copyright',
  copyrightText:     'footer#footer .footer-copyright',
  copyrightHomeLink: 'footer#footer .footer-copyright a[href="/"]',
  poweredByShopify:  'footer#footer .footer-copyright a[href*="shopify.com"]',
  payments:          'footer#footer .footer-payments',
  paymentList:       'footer#footer ul.payment-icons-list',
  paymentItem:       'footer#footer ul.payment-icons-list > li',
  paymentIcon:       'footer#footer ul.payment-icons-list svg',
  paymentIconTitle:  'footer#footer ul.payment-icons-list svg > title',
};

export default footerSelectors;
