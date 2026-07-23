/* ==========================================================================
   HIGH PIE — Product detail page
   ========================================================================== */
window.HP_PAGE = function () {
  "use strict";

  var A = HP.art;
  var $ = HP.$;
  var host = $("[data-pdp]");
  var product = HP.byId(HP.param("id"));

  if (!product) {
    document.title = "Product not found — High Pie";
    host.innerHTML = '<section class="section"><div class="wrap wrap--narrow">' +
      '<div class="empty">' + A.icon("search") +
      '<h1>We could not find that product</h1>' +
      '<p>The item may have moved or is no longer in the current assortment.</p>' +
      '<a class="btn btn--forest" href="shop.html">Shop all products</a>' +
      '</div></div></section>';
    return;
  }

  document.title = product.name + " | High Pie";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", product.short);

  var selected = 0;
  var view = 0;
  var VIEW_LABELS = ["Front view", "Inside view", "Detail", "Alternate view"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function variantProfile() {
    var variant = product.variants[selected] || {};
    return HP.PROFILES[variant.profileOverride] || HP.profileOf(product);
  }

  function currentPhotos() {
    return HP.photosFor(product, selected);
  }

  function currentOptionText() {
    var variant = product.variants[selected];
    if (variant && variant.opts && variant.opts.length) return variant.opts.join(" · ");
    return product.subtitle || product.name;
  }

  function valuesAt(position) {
    var out = [];
    product.variants.forEach(function (variant) {
      var value = variant.opts[position];
      if (value != null && out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }

  function indexFor(position, value) {
    for (var i = 0; i < product.variants.length; i++) {
      if (product.variants[i].opts[position] === value) return i;
    }
    return selected;
  }

  function accItem(id, title, body, open) {
    return '<div class="acc__item' + (open ? " is-open" : "") + '">' +
      '<button class="acc__btn" aria-expanded="' + (open ? "true" : "false") +
        '" aria-controls="' + id + '">' + title + A.icon("plus") + '</button>' +
      '<div class="acc__panel" id="' + id + '"><div>' + body + '</div></div>' +
      '</div>';
  }

  function specificationTable() {
    var rows = Object.keys(product.specs || {}).map(function (key) {
      var hook = key === "Profile" ? " data-spec-profile" : key === "SKU" ? " data-spec-sku" : "";
      return '<tr><th scope="row">' + esc(key) + '</th><td' + hook + '>' +
        esc(product.specs[key]) + '</td></tr>';
    }).join("");
    return '<table class="spec"><tbody>' + rows + '</tbody></table>';
  }

  function shell() {
    var pr = variantProfile();
    var category = (HP.CATEGORIES.filter(function (c) {
      return c.key === product.category;
    })[0] || {}).label || "Shop";

    return '<section class="section" style="padding-top:1.75rem"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Breadcrumb">' +
        '<a href="index.html">Home</a><span aria-hidden="true">›</span>' +
        '<a href="shop.html?category=' + esc(product.category) + '">' + esc(category) + '</a>' +
        '<span aria-hidden="true">›</span><span>' + esc(product.name) + '</span>' +
      '</nav>' +
      '<div class="pdp" style="' + HP.profileVars(product) + '">' +
        '<div class="pdp__gallery">' +
          '<div class="pdp__stage" data-stage></div>' +
          '<div class="pdp__thumbs" data-thumbs aria-label="Product image views"></div>' +
        '</div>' +
        '<div class="pdp__info">' +
          '<div class="pdp__profile"><span class="dot"></span><span data-profile>' +
            esc(pr.label) + '</span> · ' + esc(category) + '</div>' +
          '<h1>' + esc(product.name) + '</h1>' +
          '<p class="pdp__sub">' + esc(product.subtitle || product.short) + '</p>' +
          '<div class="pdp__price" data-price></div>' +
          '<div data-options></div>' +
          '<p class="pdp__unit" data-selection></p>' +
          '<div class="pdp__buy mt-2">' +
            '<div class="qty" aria-label="Quantity selector">' +
              '<button type="button" data-pdp-dec aria-label="Decrease quantity"' +
                (HP.BRAND.commerceEnabled ? "" : " disabled") + '>' + A.icon("minus") + '</button>' +
              '<input data-pdp-qty type="number" value="1" min="1" inputmode="numeric" aria-label="Quantity"' +
                (HP.BRAND.commerceEnabled ? "" : " disabled") + '>' +
              '<button type="button" data-pdp-inc aria-label="Increase quantity"' +
                (HP.BRAND.commerceEnabled ? "" : " disabled") + '>' + A.icon("plus") + '</button>' +
            '</div>' +
            '<button class="btn btn--forest" type="button" data-add data-qty="1"' +
              (HP.BRAND.commerceEnabled ? "" : ' disabled aria-disabled="true"') + '>' +
              (HP.BRAND.commerceEnabled ? "Add to cart" : "Purchasing coming soon") + '</button>' +
          '</div>' +
          (HP.BRAND.commerceEnabled ? "" :
            '<p class="pdp__unit mt-1">Products are available to browse; online orders are not being accepted yet.</p>') +
          '<ul class="pdp__assure">' +
            '<li>' + A.icon("truck") + 'Free shipping on orders $75+</li>' +
            '<li>' + A.icon("box") + 'Discreet outer packaging</li>' +
            '<li>' + A.icon("shield") + 'Adults 21+ only</li>' +
          '</ul>' +
          '<div class="acc">' +
            accItem("product-about", "About this product", '<p>' + esc(product.description) + '</p>', true) +
            accItem("product-details", "Product details", specificationTable(), false) +
            accItem("product-shipping", "Shipping & returns",
              '<p>Shipping options and destination eligibility are confirmed during checkout. ' +
              'If your order arrives damaged or incorrect, contact customer care with your order number.</p>', false) +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></section>' +
    '<section class="section on-sage"><div class="wrap">' +
      '<div class="section-head"><span class="eyebrow">Keep exploring</span><h2>You may also like</h2></div>' +
      '<div class="grid grid--4" data-related></div>' +
    '</div></section>';
  }

  function paintStage() {
    var photos = currentPhotos();
    var stage = $("[data-stage]");
    if (view >= photos.length) view = 0;
    stage.innerHTML = HP.media(product, {
      index: selected,
      photo: view,
      eager: true,
      sizes: "(max-width: 940px) 92vw, 560px",
      alt: product.name + " — " + currentOptionText()
    });

    $("[data-thumbs]").innerHTML = photos.map(function (_, i) {
      return '<button class="thumb" data-view="' + i + '" aria-pressed="' + (i === view) +
        '" aria-label="' + esc(VIEW_LABELS[i] || ("View " + (i + 1))) + '">' +
        HP.media(product, { index: selected, photo: i, sizes: "76px", alt: "" }) + '</button>';
    }).join("");
  }

  function paintOptions() {
    var optionNames = product.optionNames || [];
    var options = $("[data-options]");
    if (!optionNames.length || product.variants.length < 2) {
      options.innerHTML = "";
    } else {
      options.innerHTML = optionNames.map(function (name, position) {
        var values = valuesAt(position);
        if (values.length < 2) return "";
        var buttons = values.map(function (value) {
          return '<button class="opt" type="button" data-opt-pos="' + position +
            '" data-opt-val="' + esc(value) + '" aria-pressed="' +
            (product.variants[selected].opts[position] === value) + '">' + esc(value) + '</button>';
        }).join("");
        return '<div class="optgroup"><div class="optgroup__label"><span>' + esc(name) +
          '</span></div><div class="opts">' + buttons + '</div></div>';
      }).join("");
    }
  }

  function paintPurchase() {
    var variant = product.variants[selected];
    var price = '<strong>' + HP.money(variant.price) + '</strong>';
    if (variant.compare && variant.compare > variant.price) price += '<s>' + HP.money(variant.compare) + '</s>';
    $("[data-price]").innerHTML = price;

    var selection = currentOptionText();
    var normalizeSelection = function (value) {
      return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    };
    if (variant.note && normalizeSelection(variant.note) !== normalizeSelection(selection)) {
      selection += " · " + variant.note;
    }
    if (variant.sku) selection += " · " + variant.sku;
    $("[data-selection]").textContent = selection;
    $("[data-profile]").textContent = variantProfile().label;
    var profileSpec = $("[data-spec-profile]");
    var skuSpec = $("[data-spec-sku]");
    if (profileSpec) profileSpec.textContent = variantProfile().label;
    if (skuSpec) skuSpec.textContent = variant.sku || "High Pie";

    var quantity = $("[data-pdp-qty]");
    var cap = Number(variant.stock) || 99;
    quantity.max = String(cap);
    quantity.value = String(Math.max(1, Math.min(Number(quantity.value) || 1, cap)));
    var add = $("[data-add]");
    add.setAttribute("data-add", HP.variantKey(product.id, selected));
    add.setAttribute("data-qty", quantity.value);

    var pdp = $(".pdp", host);
    if (pdp) {
      pdp.setAttribute("style", HP.profileVars({
        profile: variant.profileOverride || product.profile
      }));
    }
  }

  function paintRelated() {
    var related = HP.PRODUCTS.filter(function (p) {
      return p.id !== product.id;
    }).sort(function (a, b) {
      var aScore = (a.profile === product.profile ? 2 : 0) +
        (a.category === product.category ? 1 : 0) + (a.featured ? 1 : 0);
      var bScore = (b.profile === product.profile ? 2 : 0) +
        (b.category === product.category ? 1 : 0) + (b.featured ? 1 : 0);
      return bScore - aScore || a.name.localeCompare(b.name);
    }).slice(0, 4);
    $("[data-related]").innerHTML = related.map(HP.card).join("");
  }

  host.innerHTML = shell();
  paintStage();
  paintOptions();
  paintPurchase();
  paintRelated();
  HP.bindAccordions(host);

  host.addEventListener("click", function (event) {
    var quantity = $("[data-pdp-qty]");
    var cap = Number(quantity.max) || 99;

    if (event.target.closest("[data-pdp-inc]")) {
      quantity.value = String(Math.min((Number(quantity.value) || 1) + 1, cap));
      $("[data-add]").setAttribute("data-qty", quantity.value);
      return;
    }
    if (event.target.closest("[data-pdp-dec]")) {
      quantity.value = String(Math.max((Number(quantity.value) || 1) - 1, 1));
      $("[data-add]").setAttribute("data-qty", quantity.value);
      return;
    }
    if (event.target.closest("[data-add]")) {
      $("[data-add]").setAttribute("data-qty", quantity.value);
      return;
    }

    var thumb = event.target.closest("[data-view]");
    if (thumb) {
      view = Number(thumb.getAttribute("data-view")) || 0;
      paintStage();
      var replacement = host.querySelector('[data-view="' + view + '"]');
      if (replacement) replacement.focus();
      return;
    }

    var option = event.target.closest("[data-opt-pos]");
    if (option) {
      var position = Number(option.getAttribute("data-opt-pos"));
      var value = option.getAttribute("data-opt-val");
      selected = indexFor(position, value);
      view = 0;
      paintStage();
      paintOptions();
      paintPurchase();
      var replacementOption = HP.$$("[data-opt-pos]", host).filter(function (candidate) {
        return Number(candidate.getAttribute("data-opt-pos")) === position &&
          candidate.getAttribute("data-opt-val") === value;
      })[0];
      if (replacementOption) replacementOption.focus();
    }
  });

  $("[data-pdp-qty]").addEventListener("change", function (event) {
    var cap = Number(event.target.max) || 99;
    event.target.value = String(Math.max(1, Math.min(Number(event.target.value) || 1, cap)));
    $("[data-add]").setAttribute("data-qty", event.target.value);
  });
};
