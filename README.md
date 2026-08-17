# High Pie consumer storefront

[View the live storefront](https://cmcnosky.github.io/high-pie-hemp-website/)

High Pie is a responsive, multi-page storefront preview built with plain HTML,
CSS, and JavaScript. The repository turns a product catalog, a distinct visual
system, and real product photography into a fast GitHub Pages experience with
no application framework or build step.

## Case study

### The problem

The brand needed more than a collection of attractive pages. Product identity,
profile colors, variants, pricing, images, navigation, search, and status had to
stay consistent across the home page, catalog, product details, and supporting
content without a server-side commerce platform.

### What I built

- A structured catalog of 18 products across six formats and four profile tracks.
- Shared site components and data-driven rendering for navigation, search,
  category counts, product cards, and product-detail pages.
- Responsive layouts and product photography that preserve the brand's visual
  hierarchy from desktop to small screens.
- A deliberate commerce boundary: `commerceEnabled` is `false`, purchase
  controls are disabled, and cart and checkout routes state that purchasing is
  coming soon.
- Supporting pages for the brand story, education, policies, lab-results
  guidance, FAQs, and contact information.

### Technical choices

The site is dependency-light at runtime: static HTML provides durable routes,
CSS owns the design system and breakpoints, and focused JavaScript modules own
catalog data and page behavior. `assets/js/catalog.js` is the single source of
truth for product records, variants, profile metadata, prices, imagery, and the
commerce flag. The published pages request brand typefaces from Google Fonts;
all product and interface assets otherwise ship from this repository.

The result can be hosted directly by GitHub Pages, inspected without a build
pipeline, and tested with a small repository-local verification script.

## Evaluate this repository in five minutes

1. Open the [live home page](https://cmcnosky.github.io/high-pie-hemp-website/)
   and follow the primary navigation to Shop, Learn, About, and Lab Results.
2. In [Shop](https://cmcnosky.github.io/high-pie-hemp-website/shop.html), use
   search and the category or profile filters, then open a product detail page.
3. On a product page, verify that the profile treatment, images, format, SKU,
   and price come from the shared catalog and that purchase controls reflect
   the current commerce setting.
4. Clone the repository and run the deterministic portfolio check:

```sh
node scripts/verify-portfolio.mjs
```

The check validates the catalog totals, unique product identifiers, required
product structure, the commerce boundary, and every local `href` or `src`
referenced by the static HTML pages.

## Repository map

- `assets/js/catalog.js`: product, variant, profile, brand, and commerce data.
- `assets/js/site.js`: shared navigation, search, and page-level behavior.
- `assets/js/home.js`, `shop.js`, and `product.js`: focused page controllers.
- `assets/css/`: design tokens, components, layouts, and responsive rules.
- `assets/img/`: product, packaging, and brand photography.
- `scripts/verify-portfolio.mjs`: fast structural and content-boundary check.

## Current publication boundary

The public site is a browsable catalog preview. Turning on transactions requires
separate work for payments, inventory, fulfillment, tax, age and location gates,
policy review, operational readiness, and launch approval; the storefront keeps
that boundary explicit in code and in the interface.
