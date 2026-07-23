/* HIGH PIE — storefront home */
window.HP_PAGE = function () {
  "use strict";
  var A = HP.art;
  var $ = HP.$;

  var HERO = [
    { slug: "flower-runtz-a", alt: "Runtz eighth-ounce flower", label: "Flower", cls: "hero__shot--a" },
    { slug: "gummy-hybrid-10-b", alt: "Blue Dream ten-piece gummies", label: "Gummies", cls: "hero__shot--b" },
    { slug: "topical-a-v2", alt: "High Pie Relief Salve", label: "Topicals", cls: "hero__shot--c" }
  ];
  $("[data-hero-art]").innerHTML = '<div class="hero__shots">' + HERO.map(function (image) {
    var small = HP.imagePath(image.slug, true);
    var full = HP.imagePath(image.slug, false);
    return '<figure class="hero__shot ' + image.cls + '">' +
      '<img src="' + small + '" srcset="' + small + ' 560w, ' + full + ' 1100w" ' +
      'sizes="(max-width: 940px) 40vw, 260px" alt="' + image.alt + '" decoding="async">' +
      '<figcaption>' + image.label + '</figcaption></figure>';
  }).join("") + '</div>';

  $("[data-waves-cream]").innerHTML = A.waves({ to: "#faf9f4" });
  $("[data-cta-mark]").innerHTML = A.mark({ sun: "#d3a02c", hill: "#7c9a3f" });

  $("[data-hero-marks]").innerHTML = [
    ["truck", "Free shipping on orders $75+"],
    ["box", "Discreet outer packaging"],
    ["mail", "Customer care when you need it"],
    ["shield", "Adults 21+ only"]
  ].map(function (item) { return '<li>' + A.icon(item[0]) + item[1] + '</li>'; }).join("");

  $("[data-standard]").innerHTML = [
    ["box", "Premium presentation"],
    ["leaf", "Six ways to shop"],
    ["sun", "Three signature profiles"],
    ["truck", "Free shipping over $75"],
    ["shield", "Adults 21+ only"]
  ].map(function (item, index) {
    return '<div class="standard__item" data-reveal="' + index * 60 + '">' +
      A.icon(item[0]) + '<span>' + item[1] + '</span></div>';
  }).join("");

  var shots = {
    gummies: "gummy-hybrid-10-b",
    flower: "flower-runtz-b",
    prerolls: "preroll-hybrid-pack-b",
    rso: "rso-indica-b",
    topicals: "topical-b-v2",
    bundles: "bundle-flight-b"
  };
  $("[data-categories]").innerHTML = HP.CATEGORIES.map(function (category, index) {
    var count = HP.PRODUCTS.filter(function (product) { return product.category === category.key; }).length;
    var slug = shots[category.key];
    var small = HP.imagePath(slug, true);
    var full = HP.imagePath(slug, false);
    return '<a class="cat" href="shop.html?category=' + category.key + '" data-reveal="' + index * 55 + '">' +
      '<div class="cat__art cat__art--photo"><img src="' + small + '" ' +
      'srcset="' + small + ' 560w, ' + full + ' 1100w" ' +
      'sizes="(max-width: 900px) 50vw, 400px" alt="" loading="lazy" decoding="async"></div>' +
      '<span class="cat__go">' + A.icon("arrowUR") + '</span><h3>' + category.label + '</h3>' +
      '<p>' + category.blurb + ' · ' + count + (count === 1 ? ' product' : ' products') + '</p></a>';
  }).join("");

  var featured = HP.PRODUCTS.filter(function (product) { return product.featured; }).slice(0, 8);
  $("[data-featured]").innerHTML = featured.map(function (product, index) {
    return '<div data-reveal="' + (index % 4) * 60 + '">' + HP.card(product) + '</div>';
  }).join("");

  var profiles = [
    { key: "sativa", icon: "sun", title: "Daybreak", copy: "Bright, citrus-forward selections for the front half of the day." },
    { key: "hybrid", icon: "leaf", title: "Golden Hour", copy: "Balanced favorites made for the middle of everything." },
    { key: "indica", icon: "moon", title: "Nightfall", copy: "Deep fruit, earthy notes, and an evening state of mind." }
  ];
  $("[data-intent]").innerHTML = profiles.map(function (item, index) {
    var profile = HP.PROFILES[item.key];
    return '<a class="intent" href="shop.html?profile=' + item.key + '" style="--profile:' + profile.color +
      ';--profile-ink:' + profile.ink + '" data-reveal="' + index * 70 + '">' +
      '<div class="intent__mark">' + A.icon(item.icon) + '</div><h3>' + item.title + '</h3>' +
      '<div class="intent__sub">' + profile.label + ' · ' + profile.line + '</div><p>' + item.copy + '</p>' +
      '<span class="link" style="color:' + profile.ink + '">Explore ' + profile.label +
      ' <span aria-hidden="true">→</span></span></a>';
  }).join("");

  var readiness = [
    ["box", "Grab-and-go formats", "Gummies, pre-rolls, and applicators keep the experience simple and portable."],
    ["leaf", "Flower, kept classic", "Clear-glass eighth jars let the cultivar and profile stay front and center."],
    ["target", "Build your own rhythm", "Shop by format or move through Daybreak, Golden Hour, and Nightfall."]
  ];
  $("[data-readiness]").innerHTML = readiness.map(function (item, index) {
    return '<article class="review" data-reveal="' + index * 70 + '"><div class="intent__mark">' +
      A.icon(item[0]) + '</div><h3>' + item[1] + '</h3><p>' + item[2] + '</p></article>';
  }).join("");

  var principles = [
    ["A shelf that makes sense", "Every product belongs to one clear format and one easy-to-recognize profile."],
    ["Packaging worth keeping", "Forest green, cream, clear glass, and profile color create one unmistakable family."],
    ["Help when you need it", "Straightforward product details, safety guidance, and direct customer care."]
  ];
  $("[data-principles]").innerHTML = principles.map(function (item, index) {
    return '<article class="review" data-reveal="' + index * 70 + '"><h3>' + item[0] + '</h3><p>' + item[1] + '</p></article>';
  }).join("");

  var teasers = [
    ["Edibles can be delayed", "CDC guidance says effects can take 30 minutes to two hours; taking more during that delay raises risk."],
    ["CBD is not risk-free", "FDA warns about interactions and other risks. Talk with a qualified clinician about medications or pregnancy."],
    ["Know when to call", "For a possible poisoning, call Poison Control at 1-800-222-1222; call 911 for an emergency."]
  ];
  $("[data-learn-teaser]").innerHTML = teasers.map(function (item, index) {
    return '<a class="learn-card" href="learn.html" data-reveal="' + index * 70 + '"><h3>' + item[0] +
      '</h3><p>' + item[1] + '</p><span class="link">Read the guide <span aria-hidden="true">→</span></span></a>';
  }).join("");
};
