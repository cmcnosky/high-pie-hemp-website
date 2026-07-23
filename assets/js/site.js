/* ==========================================================================
   HIGH PIE — Site core
   Shared chrome (header/footer/drawer/gate), the cart store, and the render
   helpers every page reuses. Loaded on every page after catalog.js + art.js.
   ========================================================================== */
(function (root, doc) {
  "use strict";

  var HP = (root.HP = root.HP || {});
  var A = HP.art;
  var B = HP.BRAND;

  /* ------------------------------------------------------------- Storage */
  var KEY_CART = "hp.cart.v2";
  var KEY_AGE = "hp.age.v1";

  function read(key, fallback) {
    try {
      var raw = root.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* Private mode or quota — the cart just won't persist. */
    }
  }

  function restoredCart() {
    var stored = read(KEY_CART, []);
    if (!Array.isArray(stored)) return [];
    return stored.map(function (line) {
      var resolved = line && HP.resolve(line.key);
      if (!resolved) return null;
      var quantity = Number(line.qty);
      var cap = Number(resolved.variant.stock) || 99;
      if (!Number.isInteger(quantity) || quantity < 1) return null;
      return { key: line.key, qty: Math.min(quantity, cap) };
    }).filter(Boolean);
  }

  /* ---------------------------------------------------------------- Cart */
  var listeners = [];

  var Cart = (HP.cart = {
    items: restoredCart(),

    save: function () {
      write(KEY_CART, this.items);
      listeners.forEach(function (fn) { fn(Cart); });
    },

    onChange: function (fn) { listeners.push(fn); return fn; },

    find: function (key) {
      for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].key === key) return this.items[i];
      }
      return null;
    },

    add: function (key, qty) {
      qty = qty || 1;
      var r = HP.resolve(key);
      if (!r) return false;
      var cap = Number.isInteger(r.variant.stock) && r.variant.stock > 0 ? r.variant.stock : 0;
      if (!cap || !Number.isInteger(qty) || qty < 1) return false;
      var line = this.find(key);
      if (line) {
        line.qty = Math.min(line.qty + qty, cap);
      } else {
        this.items.push({ key: key, qty: Math.min(qty, cap) });
      }
      this.save();
      return true;
    },

    setQty: function (key, qty) {
      var line = this.find(key);
      if (!line) return;
      var r = HP.resolve(key);
      var cap = r && Number.isInteger(r.variant.stock) && r.variant.stock > 0 ? r.variant.stock : 0;
      if (!cap) return this.remove(key);
      line.qty = Math.max(0, Math.min(qty, cap));
      if (line.qty === 0) return this.remove(key);
      this.save();
    },

    remove: function (key) {
      this.items = this.items.filter(function (l) { return l.key !== key; });
      this.save();
    },

    clear: function () { this.items = []; this.save(); },

    count: function () {
      return this.items.reduce(function (n, l) { return n + l.qty; }, 0);
    },

    subtotal: function () {
      return this.items.reduce(function (n, l) {
        var r = HP.resolve(l.key);
        return r ? n + r.variant.price * l.qty : n;
      }, 0);
    },

    shipping: function () {
      if (!this.items.length) return 0;
      return this.subtotal() >= B.freeShipThreshold ? 0 : B.flatShip;
    },

    tax: function () { return Math.round(this.subtotal() * B.taxRate); },

    total: function () { return this.subtotal() + this.shipping() + this.tax(); },

    /* Resolved lines, skipping anything whose product no longer exists. */
    lines: function () {
      return this.items.map(function (l) {
        var r = HP.resolve(l.key);
        return r ? { key: l.key, qty: l.qty, product: r.product, variant: r.variant, index: r.index } : null;
      }).filter(Boolean);
    }
  });

  /* --------------------------------------------------------------- Utils */
  function el(html) {
    var t = doc.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  HP.el = el; HP.$ = $; HP.$$ = $$;

  function param(name) {
    return new URLSearchParams(root.location.search).get(name);
  }
  HP.param = param;

  function profileVars(p) {
    var pr = HP.profileOf(p);
    /* color = the locked packaging hue (dots, bars, fills); ink = its darker
       text-safe partner for small labels on light surfaces. */
    return "--profile:" + pr.color + ";--profile-ink:" + pr.ink +
      ";--profile-wash:" + pr.wash + ";--profile-bg:" + pr.wash;
  }
  HP.profileVars = profileVars;

  /* --------------------------------------------------------- Product media */
  var IMG_DIR = "assets/img/products/";
  var IMG_VERSION = B.assetVersion ? "?v=" + encodeURIComponent(B.assetVersion) : "";

  HP.imagePath = function (slug, small) {
    return IMG_DIR + slug + (small ? "-sm" : "") + ".jpg" + IMG_VERSION;
  };

  /* Variant photography wins over the product default, so changing pack size
     or profile swaps the shot. Omit the index — as cards do — to get the
     product's hero shot rather than whichever variant happens to be first. */
  HP.photosFor = function (product, index) {
    if (index != null) {
      var v = product.variants[index];
      if (v && v.photos && v.photos.length) return v.photos;
    }
    return product.photos || [];
  };

  HP.hasPhotos = function (product) {
    return HP.photosFor(product).length > 0;
  };

  /* The photos are a mix of square and portrait. Rather than crop or letterbox,
     a blurred copy of the same image fills behind it — the fill is always an
     exact colour match because it is the photo's own backdrop. */
  HP.media = function (product, opts) {
    opts = opts || {};
    var photos = HP.photosFor(product, opts.index);
    var alt = Object.prototype.hasOwnProperty.call(opts, "alt") ? opts.alt :
      (product.name + " — " + HP.profileOf(product).label + " " +
      ((HP.CATEGORIES.filter(function (c) { return c.key === product.category; })[0] || {}).label || ""));

    if (!photos.length) {
      return '<div class="ph ph--art">' + A.packshot(product, opts.art || {}) + '</div>';
    }

    var slug = photos[Math.min(opts.photo || 0, photos.length - 1)];
    var small = HP.imagePath(slug, true);
    var full = HP.imagePath(slug, false);
    var sizes = opts.sizes || "(max-width: 760px) 50vw, 320px";
    var load = opts.eager ? "eager" : "lazy";

    return '<div class="ph">' +
      '<img class="ph__bg" src="' + small + '" alt="" aria-hidden="true" ' +
        'loading="' + load + '" decoding="async">' +
      '<img class="ph__fg" src="' + small + '" ' +
        'srcset="' + small + ' 560w, ' + full + ' 1100w" sizes="' + sizes + '" ' +
        'alt="' + String(alt).replace(/"/g, "&quot;") + '" ' +
        'loading="' + load + '" decoding="async"></div>';
  };

  /* ------------------------------------------------------------- Toasts */
  var toastHost;
  HP.toast = function (msg, opts) {
    opts = opts || {};
    if (!toastHost) {
      toastHost = el('<div class="toasts" role="status" aria-live="polite"></div>');
      doc.body.appendChild(toastHost);
    }
    var t = el(
      '<div class="toast">' + A.icon(opts.icon || "check") +
      "<span>" + msg + "</span>" +
      '<button class="toast__x" aria-label="Dismiss">' + A.icon("x") + "</button></div>"
    );
    toastHost.appendChild(t);
    var killed = false;
    function kill() {
      if (killed) return;
      killed = true;
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 260);
    }
    t.querySelector(".toast__x").addEventListener("click", kill);
    setTimeout(kill, opts.duration || 3600);
  };

  /* ------------------------------------------------------------ Age gate */
  function ageGate() {
    if (read(KEY_AGE, false) === true) return;

    var gate = el(
      '<div class="gate" role="dialog" aria-modal="true" aria-labelledby="gate-h">' +
        '<div class="gate__card">' +
          '<div class="mark">' + A.mark({}) + "</div>" +
          '<h2 id="gate-h">Are you 21 or older?</h2>' +
          "<p>High Pie products are intended for adults 21 and older. Confirm your age to enter the store.</p>" +
          '<div class="gate__btns">' +
            '<button class="btn btn--forest" data-yes>Yes, I am 21+</button>' +
            '<button class="btn btn--ghost" data-no>No</button>' +
          "</div>" +
          '<p class="gate__fine">By entering, you confirm that you are at least 21 years old.</p>' +
          '<p class="gate__deny">You must be 21 or older to visit High Pie. Thanks for stopping by.<br>' +
          '<a href="https://www.google.com" style="text-decoration:underline;text-underline-offset:3px">Leave this site</a></p>' +
        "</div>" +
      "</div>"
    );
    doc.body.appendChild(gate);
    var blocked = $$("body > *").filter(function (node) {
      return node !== gate && node.tagName !== "SCRIPT";
    });
    blocked.forEach(function (node) {
      node.dataset.gateWasInert = node.hasAttribute("inert") ? "1" : "0";
      node.setAttribute("inert", "");
    });
    doc.body.classList.add("scroll-lock");

    gate.querySelector("[data-yes]").addEventListener("click", function () {
      write(KEY_AGE, true);
      blocked.forEach(function (node) {
        if (node.dataset.gateWasInert !== "1") node.removeAttribute("inert");
        delete node.dataset.gateWasInert;
      });
      gate.remove();
      doc.body.classList.remove("scroll-lock");
    });
    gate.querySelector("[data-no]").addEventListener("click", function () {
      gate.classList.add("is-denied");
      /* The buttons (including the one that was focused) just vanished —
         move focus to the exit link so the Tab trap keeps working. */
      var leave = gate.querySelector(".gate__deny a");
      if (leave) leave.focus();
    });
    gate.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("button, a[href]", gate).filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    setTimeout(function () { gate.querySelector("[data-yes]").focus(); }, 60);
  }

  /* --------------------------------------------------------------- Stars */
  HP.stars = function (rating) {
    var full = Math.round(rating);
    var out = '<div class="stars" aria-label="' + rating + ' out of 5">';
    for (var i = 0; i < 5; i++) {
      out += '<span style="opacity:' + (i < full ? 1 : 0.24) + '">' + A.icon("star") + "</span>";
    }
    return out + "</div>";
  };

  /* --------------------------------------------------------- Product card */
  HP.card = function (p) {
    var pr = HP.profileOf(p);
    var flags = "";
    var quick = '<a class="btn btn--sm btn--forest btn--block card__quick" href="product.html?id=' +
      p.id + '">View product</a>';
    var range = HP.priceRange(p);
    var price = (range.single ? "" : "From ") + HP.moneyShort(range.lo);

    var optCount = p.variants.length > 1
      ? '<span class="card__opts">' + p.variants.length + " options</span>"
      : "";

    var catLabel = p.subcategory === "shake" ? "Shake"
      : (HP.CATEGORIES.filter(function (c) { return c.key === p.category; })[0] || {}).label || "";

    return '<article class="card" style="' + profileVars(p) + '">' +
      '<div class="card__media">' + HP.media(p, { sizes: "(max-width: 640px) 50vw, 320px" }) + "</div>" +
      (flags ? '<div class="card__flags">' + flags + "</div>" : "") +
      quick +
      '<div class="card__body">' +
        '<div class="card__profile"><span class="dot"></span>' +
          pr.label + (catLabel ? " · " + catLabel : "") + "</div>" +
        '<h3 class="card__title"><a href="product.html?id=' + p.id + '">' + p.name + "</a></h3>" +
        '<p class="card__meta">' + p.short + "</p>" +
        '<div class="card__foot">' +
          '<div class="card__price">' + price + '</div>' +
          optCount +
        "</div>" +
      "</div>" +
    "</article>";
  };

  HP.renderCards = function (host, products) {
    host.innerHTML = products.map(HP.card).join("");
  };

  /* --------------------------------------------------------------- Header */
  /* The catalog lives behind one Shop menu; only destination pages sit in
     the top bar. Category links derive from HP.CATEGORIES so the menu can
     never disagree with the shop page. */
  var NAV_PAGES = [
    { label: "Learn", href: "learn.html" },
    { label: "Lab Results", href: "lab-results.html" },
    { label: "About", href: "about.html" },
    { label: "FAQ", href: "faq.html" },
    { label: "Contact", href: "contact.html" }
  ];

  function shopLinks() {
    return [{ label: "All products", href: "shop.html" }].concat(
      HP.CATEGORIES.map(function (c) {
        return { label: c.label, href: "shop.html?category=" + c.key, key: c.key };
      })
    );
  }

  function currentPage() {
    var f = root.location.pathname.split("/").pop() || "index.html";
    return f;
  }

  function navMarkup(cls, list) {
    var page = currentPage();
    var cat = param("category");
    return list.map(function (n) {
      var isPage = n.href.split("?")[0] === page;
      var nCat = (n.href.split("category=")[1] || null);
      var active = isPage && (page !== "shop.html" || nCat === cat);
      return '<a class="' + cls + '" href="' + n.href + '"' +
        (active ? ' aria-current="page"' : "") + ">" + n.label +
        (cls === "mobile-nav__link" ? A.icon("chev") : "") + "</a>";
    }).join("");
  }

  function shopMenuMarkup() {
    var counts = {};
    HP.PRODUCTS.forEach(function (p) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return '<div class="nav-item" data-menu>' +
      '<button class="nav__link" data-menu-btn aria-haspopup="true" aria-expanded="false"' +
        (currentPage() === "shop.html" ? ' aria-current="page"' : "") +
        '>Shop' + A.icon("chevD") + "</button>" +
      '<div class="menu" role="menu" aria-label="Shop">' +
        shopLinks().map(function (n, i) {
          var count = n.key ? counts[n.key] : HP.PRODUCTS.length;
          return '<a class="menu__item" role="menuitem" href="' + n.href + '">' +
            n.label + "<small>" + count + "</small></a>" +
            (i === 0 ? '<div class="menu__sep" role="separator"></div>' : "");
        }).join("") +
      "</div></div>";
  }

  function buildHeader() {
    var host = $("[data-chrome=header]");
    if (!host) return;

    host.innerHTML =
      '<div class="announce"><div class="announce__track">' +
        '<span class="announce__item">' + A.icon("lock") + B.catalogStatus + "</span>" +
        '<span class="announce__item">' + A.icon("leaf") + "Curated hemp products for every part of the day</span>" +
        '<span class="announce__item">' + A.icon("shield") + "Adults 21+ only</span>" +
      "</div></div>" +
      '<header class="header"><div class="wrap header__inner">' +
        '<a class="brand" href="index.html" aria-label="High Pie — home">' + A.logo({}) + "</a>" +
        '<nav class="nav" aria-label="Primary">' + shopMenuMarkup() + navMarkup("nav__link", NAV_PAGES) + "</nav>" +
        '<div class="header__actions">' +
          '<button class="icon-btn" data-open-search aria-label="Search products">' + A.icon("search") + "</button>" +
          '<a class="icon-btn header__lab" href="lab-results.html" aria-label="Lab results">' + A.icon("flask") + "</a>" +
          (B.commerceEnabled
            ? '<button class="icon-btn" data-open-cart aria-label="Open cart">' + A.icon("cart") +
              '<span class="cart-count" data-cart-count>0</span></button>'
            : "") +
          '<button class="icon-btn nav-toggle" data-open-nav aria-label="Open menu">' + A.icon("menu") + "</button>" +
        "</div>" +
      "</div></header>";

    /* Elevate the header once the page scrolls. */
    var header = $(".header", host);
    var onScroll = function () {
      header.classList.toggle("header--scrolled", root.scrollY > 8);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    buildShopMenu(host);
    buildMobileNav();
    $("[data-open-nav]").addEventListener("click", openNav);
    $("[data-open-search]").addEventListener("click", openSearch);
    var cartButton = $("[data-open-cart]");
    if (cartButton) cartButton.addEventListener("click", openCart);
  }

  /* Shop popover: click to toggle, Escape or outside click to dismiss,
     arrows cycle the items. The panel itself animates via .is-open. */
  function buildShopMenu(host) {
    var item = $("[data-menu]", host);
    if (!item) return;
    var btn = $("[data-menu-btn]", item);
    var panel = $(".menu", item);

    function setOpen(open) {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function isOpen() { return item.classList.contains("is-open"); }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!isOpen());
    });
    doc.addEventListener("click", function (e) {
      if (isOpen() && !item.contains(e.target)) setOpen(false);
    });
    panel.addEventListener("click", function () { setOpen(false); });
    /* Tabbing out of the menu dismisses it — outside clicks alone would
       leave keyboard users with a stranded popover. */
    item.addEventListener("focusout", function (e) {
      if (isOpen() && !item.contains(e.relatedTarget)) setOpen(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      var inside = item.contains(doc.activeElement);
      if (e.key === "Escape") {
        setOpen(false);
        if (inside) btn.focus();
        return;
      }
      /* Arrows drive the menu only while focus is in it — never steal
         them from the search palette or page scroll. */
      if (!inside) return;
      var items = $$(".menu__item", panel);
      var idx = items.indexOf(doc.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[idx + 1] || items[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[idx - 1] || items[items.length - 1]).focus();
      }
    });
    HP.closeShopMenu = function () { setOpen(false); };
  }

  function buildMobileNav() {
    var sheet = el(
      '<div class="mobile-nav" id="mobile-nav">' +
        '<div class="mobile-nav__scrim" data-close-nav></div>' +
        '<div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Menu">' +
          '<div class="mobile-nav__head">' + A.logo({}) +
            '<button class="icon-btn" data-close-nav aria-label="Close menu">' + A.icon("x") + "</button>" +
          "</div>" +
          "<nav>" + navMarkup("mobile-nav__link",
            shopLinks().concat(NAV_PAGES).concat([{ label: "Cart", href: "cart.html" }])) + "</nav>" +
          '<div class="mobile-nav__foot">' +
            '<a class="btn btn--block btn--forest" href="shop.html">Shop all products</a>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
    doc.body.appendChild(sheet);
    sheet.setAttribute("inert", "");
    sheet.setAttribute("aria-hidden", "true");
    $$("[data-close-nav]", sheet).forEach(function (b) {
      b.addEventListener("click", closeNav);
    });
    bindDialogFocus(sheet);
  }

  /* Focus containment for the class-toggled dialogs (drawer + mobile sheet):
     focus moves in on open, Tab wraps inside, close hands focus back to the
     opener — the same contract the search palette keeps. */
  function bindDialogFocus(host) {
    host.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("input, button, a[href]", host).filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  var navOpener = null;
  function openNav() {
    navOpener = doc.activeElement;
    var sheet = $("#mobile-nav");
    sheet.removeAttribute("inert");
    sheet.setAttribute("aria-hidden", "false");
    sheet.classList.add("is-open");
    doc.body.classList.add("scroll-lock");
    var close = $("#mobile-nav .mobile-nav__head [data-close-nav]");
    if (close) setTimeout(function () { close.focus(); }, 40);
  }
  function closeNav() {
    var sheet = $("#mobile-nav");
    if (!sheet || !sheet.classList.contains("is-open")) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("inert", "");
    sheet.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("scroll-lock");
    if (navOpener && navOpener.focus) navOpener.focus();
    navOpener = null;
  }

  /* --------------------------------------------------------------- Footer */
  function buildFooter() {
    var host = $("[data-chrome=footer]");
    if (!host) return;

    var shopLinks = HP.CATEGORIES.map(function (c) {
      return '<li><a href="shop.html?category=' + c.key + '">' + c.label + "</a></li>";
    }).join("");

    host.innerHTML =
      '<footer class="footer">' +
        A.waves({ to: "#14291f", flip: true }) +
        '<div class="wrap footer__inner">' +
          '<div class="footer__brand">' + A.logo({ light: true }) +
            "<p>" + B.tagline + " Thoughtfully made gummies, flower, pre-rolls, extracts, and topicals.</p>" +
            '<div class="social">' +
              '<a href="' + B.instagramUrl + '" aria-label="Instagram" rel="noopener">' + A.icon("insta") + "</a>" +
              '<a href="mailto:' + B.email + '" aria-label="Email">' + A.icon("mail") + "</a>" +
              '<a href="' + B.phoneHref + '" aria-label="Phone">' + A.icon("phone") + "</a>" +
            "</div>" +
          "</div>" +
          "<div><h4>Shop</h4><ul class=\"footer__links\">" + shopLinks +
            '<li><a href="shop.html">All products</a></li></ul></div>' +
          '<div><h4>Customer care</h4><ul class="footer__links">' +
            '<li><a href="learn.html">Consumer safety guide</a></li>' +
            '<li><a href="lab-results.html">Lab results</a></li>' +
            '<li><a href="policies.html#shipping">Shipping &amp; returns</a></li>' +
            '<li><a href="faq.html">FAQ</a></li>' +
          "</ul></div>" +
          '<div><h4>Company</h4><ul class="footer__links">' +
            '<li><a href="about.html">About High Pie</a></li>' +
            '<li><a href="contact.html">Contact</a></li>' +
            '<li><a href="mailto:' + B.email + '">' + B.email + '</a></li>' +
            '<li><a href="' + B.phoneHref + '">' + B.phone + '</a></li>' +
          "</ul>" +
          "</div>" +
        "</div>" +
        '<div class="wrap"><div class="footer__legal">' +
          "<p><strong>Adults 21+ only.</strong> Keep all hemp products away from children and pets. Do not drive or operate machinery after using intoxicating products.</p>" +
          "<p>Always follow the package label. Product availability and shipping eligibility vary by destination. Nothing on this site is medical or legal advice.</p>" +
          '<div class="footer__legal-row">' +
            "<span>© " + new Date().getFullYear() + " " + B.legal + ". All rights reserved.</span>" +
            "<nav>" +
              '<a href="policies.html">Terms</a>' +
              '<a href="policies.html#privacy">Privacy</a>' +
              '<a href="lab-results.html">Lab results</a>' +
            "</nav>" +
          "</div>" +
        "</div></div>" +
      "</footer>";
  }

  /* ---------------------------------------------------------- Cart drawer */
  function buildDrawer() {
    var drawer = el(
      '<div class="drawer" id="cart-drawer">' +
        '<div class="drawer__scrim" data-close-cart></div>' +
        '<div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Your cart">' +
          '<div class="drawer__head"><h2>Your cart</h2>' +
            '<button class="icon-btn" data-close-cart aria-label="Close cart">' + A.icon("x") + "</button></div>" +
          '<div class="drawer__body" data-cart-body></div>' +
          '<div class="drawer__foot" data-cart-foot></div>' +
        "</div>" +
      "</div>"
    );
    doc.body.appendChild(drawer);
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    $$("[data-close-cart]", drawer).forEach(function (b) {
      b.addEventListener("click", closeCart);
    });
    bindDialogFocus(drawer);
    renderDrawer();
  }

  var cartOpener = null;
  function openCart() {
    renderDrawer();
    cartOpener = doc.activeElement;
    var drawer = $("#cart-drawer");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    drawer.classList.add("is-open");
    doc.body.classList.add("scroll-lock");
    var close = $("#cart-drawer .drawer__head [data-close-cart]");
    if (close) setTimeout(function () { close.focus(); }, 40);
  }
  function closeCart() {
    var drawer = $("#cart-drawer");
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("scroll-lock");
    if (cartOpener && cartOpener.focus) cartOpener.focus();
    cartOpener = null;
  }
  HP.openCart = openCart;

  /* One line-item row, reused by the drawer and the cart page. */
  HP.lineMarkup = function (line) {
    var opts = line.variant.opts.join(" · ");
    return '<div class="line" style="' + profileVars(line.product) + '" data-line="' + line.key + '">' +
      '<a class="line__media" href="product.html?id=' + line.product.id + '">' +
        HP.media(line.product, {
          index: line.index,
          sizes: "74px",
          art: variantArtOpts(line.product, line.variant)
        }) + "</a>" +
      "<div>" +
        '<a class="line__title" href="product.html?id=' + line.product.id + '">' + line.product.name + "</a>" +
        (opts ? '<div class="line__opt">' + opts + "</div>" : "") +
        '<div class="line__row">' +
          '<div class="qty qty--sm">' +
            '<button data-dec aria-label="Decrease quantity">' + A.icon("minus") + "</button>" +
            '<input type="number" value="' + line.qty + '" min="1" max="' + (line.variant.stock || 99) +
              '" aria-label="Quantity">' +
            '<button data-inc aria-label="Increase quantity">' + A.icon("plus") + "</button>" +
          "</div>" +
          '<span class="line__price">' + HP.money(line.variant.price * line.qty) + "</span>" +
        "</div>" +
        '<div class="line__row"><button class="line__remove" data-remove>Remove</button></div>' +
      "</div>" +
    "</div>";
  };

  /* Keep the packshot label in sync with the chosen variant. */
  function variantArtOpts(product, variant) {
    var o = {};
    if (product.category === "flower" && variant.opts[0]) o.size = variant.opts[0].toUpperCase();
    if (product.category === "gummies") {
      o.strength = (variant.opts[0] || "").toUpperCase();
      o.pack = (variant.opts[1] || "").toUpperCase();
    }
    if (product.category === "rso" && variant.opts[0]) {
      var m = variant.opts[0].split("·")[1];
      if (m) o.profile = m.trim().toLowerCase();
    }
    return o;
  }
  HP.variantArtOpts = variantArtOpts;

  /* Wire qty/remove controls inside any container holding .line rows. */
  HP.bindLines = function (host, after) {
    host.addEventListener("click", function (e) {
      var row = e.target.closest("[data-line]");
      if (!row) return;
      var key = row.getAttribute("data-line");
      var line = Cart.find(key);
      if (!line) return;

      if (e.target.closest("[data-inc]")) Cart.setQty(key, line.qty + 1);
      else if (e.target.closest("[data-dec]")) Cart.setQty(key, line.qty - 1);
      else if (e.target.closest("[data-remove]")) {
        Cart.remove(key);
        HP.toast("Removed from cart.");
      } else return;

      if (after) after();
    });

    host.addEventListener("change", function (e) {
      if (e.target.tagName !== "INPUT") return;
      var row = e.target.closest("[data-line]");
      if (!row) return;
      Cart.setQty(row.getAttribute("data-line"), parseInt(e.target.value, 10) || 1);
      if (after) after();
    });
  };

  function shipMeter() {
    var sub = Cart.subtotal();
    var need = B.freeShipThreshold - sub;
    if (need <= 0) {
      return '<div class="ship-meter"><p>' + A.icon("truck") +
        " <b>Free shipping unlocked.</b></p>" +
        '<div class="ship-meter__track"><div class="ship-meter__fill" style="width:100%"></div></div></div>';
    }
    var pct = Math.max(4, Math.round((sub / B.freeShipThreshold) * 100));
    return '<div class="ship-meter"><p>You\'re <b>' + HP.money(need) +
      "</b> away from free shipping.</p>" +
      '<div class="ship-meter__track"><div class="ship-meter__fill" style="width:' + pct + '%"></div></div></div>';
  }
  HP.shipMeter = shipMeter;

  /* The four trust marks, repeated at every decision point. */
  HP.trustStrip = function (vertical) {
    var items = [
      ["truck", "Free shipping on orders $75+"],
      ["box", "Discreet outer packaging"],
      ["mail", "Customer care when you need it"],
      ["shield", "Adults 21+ only"]
    ];
    return '<ul class="pdp__assure" style="border-bottom:none;margin-bottom:0' +
      (vertical ? ";flex-direction:column;gap:.6rem" : "") + '">' +
      items.map(function (it) {
        return "<li>" + A.icon(it[0]) + it[1] + "</li>";
      }).join("") + "</ul>";
  };

  function renderDrawer() {
    var body = $("[data-cart-body]");
    var foot = $("[data-cart-foot]");
    if (!body) return;

    var lines = Cart.lines();
    if (!lines.length) {
      body.innerHTML =
        '<div class="empty" style="border:none;padding-top:4rem">' + A.icon("cart") +
        "<h3>Your cart is empty</h3>" +
        (function () {
          var starter = HP.byId("flower-flight");
          return "<p>Nothing in here yet. " + (starter
            ? "The " + starter.name + " is an easy way in — " +
              HP.moneyShort(HP.fromPrice(starter)) + "."
            : "") + "</p>";
        })() +
        '<a class="btn btn--forest" href="shop.html">Shop everything</a></div>';
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = lines.map(HP.lineMarkup).join("");
    foot.innerHTML =
      shipMeter() +
      '<div class="totals mt-2">' +
        '<div class="totals__row"><span>Subtotal</span><span>' + HP.money(Cart.subtotal()) + "</span></div>" +
        '<div class="totals__row"><span>Shipping</span><span>' +
          (Cart.shipping() === 0 ? "Free" : HP.money(Cart.shipping())) + "</span></div>" +
      "</div>" +
      '<a class="btn btn--block btn--lg mt-2" href="checkout.html">Checkout · ' +
        HP.money(Cart.subtotal() + Cart.shipping()) + "</a>" +
      '<a class="btn btn--block btn--ghost btn--sm mt-1" href="cart.html">View full cart</a>' +
      '<p class="totals__note">Tax calculated at checkout. Discreet, unbranded outer packaging.</p>';
  }

  /* --------------------------------------------------------------- Search */
  /* Client-side, no index server: 25 products fit comfortably in memory.
     Every token must match somewhere; name matches rank above the rest. */
  var searchIndex = null;
  var searchWrap, searchInput, searchList;
  var searchOpener = null;
  var searchActive = -1;
  var searchHits = [];

  function catLabelOf(p) {
    var c = HP.CATEGORIES.filter(function (x) { return x.key === p.category; })[0];
    return (c && c.label) || p.category;
  }

  function buildSearchIndex() {
    searchIndex = HP.PRODUCTS.map(function (p) {
      var pr = HP.profileOf(p);
      return {
        p: p,
        name: p.name.toLowerCase(),
        hay: [
          p.name, p.subtitle || "", catLabelOf(p), pr.label, pr.arc,
          (p.effects || []).join(" "),
          HP.bucketsOf(p).join(" "),
          (p.terpenes || []).map(function (t) { return t.name; }).join(" "),
          p.tier || "", p.short || ""
        ].join(" ").toLowerCase()
      };
    });
  }

  function searchQuery(q) {
    if (!searchIndex) buildSearchIndex();
    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    var scored = [];
    searchIndex.forEach(function (row) {
      var score = 0;
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (row.name.indexOf(t) === 0) score += 5;
        else if (row.name.indexOf(t) > -1) score += 3;
        else if (row.hay.indexOf(t) > -1) score += 1;
        else return; /* every token must land somewhere */
      }
      if (row.p.featured) score += 0.5;
      scored.push({ row: row, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score || a.row.p.name.localeCompare(b.row.p.name); });
    return scored.slice(0, 8).map(function (s) { return s.row.p; });
  }

  function searchHitMarkup(p, i) {
    var pr = HP.profileOf(p);
    return '<a class="search-hit" role="option" id="search-opt-' + i +
      '" aria-selected="' + (i === searchActive) + '" href="product.html?id=' + p.id +
      '" style="' + profileVars(p) + '">' +
      '<span class="search-hit__media">' + HP.media(p, { sizes: "52px" }) + "</span>" +
      "<span><span class=\"search-hit__name\">" + p.name + "</span>" +
      '<span class="search-hit__meta"><span class="dot"></span>' + pr.label +
      " · " + catLabelOf(p) + "</span></span>" +
      '<span class="search-hit__price">' + HP.moneyShort(HP.fromPrice(p)) + '</span></a>';
  }

  function renderSearch(q) {
    searchHits = searchQuery(q);
    searchActive = searchHits.length ? 0 : -1;

    if (!q.trim()) {
      searchList.setAttribute("role", "presentation");
      searchInput.setAttribute("aria-activedescendant", "");
      var chips = HP.CATEGORIES.map(function (c) {
        return '<a class="chip" href="shop.html?category=' + c.key + '">' + c.label + "</a>";
      }).join("") +
      Object.keys(HP.PROFILES).map(function (k) {
        return '<a class="chip" href="shop.html?profile=' + k + '">' + HP.PROFILES[k].label + "</a>";
      }).join("");
      searchList.innerHTML =
        '<div class="search__empty">Search by product name, profile, or format.</div>' +
        '<div class="search__chips">' + chips + "</div>";
      return;
    }

    if (!searchHits.length) {
      searchList.setAttribute("role", "presentation");
      searchInput.setAttribute("aria-activedescendant", "");
      searchList.innerHTML =
        '<div class="search__empty">Nothing matches “' +
        q.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
        '”.<br>Try a product name, “gummies”, or a profile such as “sativa”.</div>';
      return;
    }

    searchList.setAttribute("role", "listbox");
    searchList.innerHTML = searchHits.map(searchHitMarkup).join("");
    paintSearchActive();
  }

  function paintSearchActive() {
    $$(".search-hit", searchList).forEach(function (el, i) {
      el.classList.toggle("is-active", i === searchActive);
      el.setAttribute("aria-selected", String(i === searchActive));
      if (i === searchActive) el.scrollIntoView({ block: "nearest" });
    });
    searchInput.setAttribute("aria-activedescendant",
      searchActive > -1 ? "search-opt-" + searchActive : "");
  }

  function buildSearch() {
    searchWrap = el(
      '<div class="search" id="site-search">' +
        '<div class="search__scrim" data-close-search></div>' +
        '<div class="search__panel" role="dialog" aria-modal="true" aria-label="Search products">' +
          '<div class="search__box">' + A.icon("search") +
            '<input type="search" placeholder="Search strains, formats, effects…" ' +
              'aria-label="Search products" ' +
              'role="combobox" aria-expanded="true" aria-controls="search-results" ' +
              'aria-autocomplete="list" autocomplete="off" spellcheck="false">' +
            '<button class="icon-btn" type="button" data-close-search aria-label="Close search">' + A.icon("x") + "</button>" +
          "</div>" +
          '<div class="search__results" id="search-results" role="listbox" aria-label="Results"></div>' +
          '<div class="search__foot"><span>↑↓ navigate</span>' +
          "<span>↩ open</span><span>esc close</span></div>" +
        "</div>" +
      "</div>"
    );
    doc.body.appendChild(searchWrap);
    searchWrap.setAttribute("inert", "");
    searchWrap.setAttribute("aria-hidden", "true");
    searchInput = $("input", searchWrap);
    searchList = $(".search__results", searchWrap);

    $$('[data-close-search]', searchWrap).forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });

    /* Keep Tab inside the dialog — same pattern as the age gate. */
    searchWrap.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("input, button, a[href]", searchWrap).filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!searchHits.length) return;
        searchActive = (searchActive + (e.key === "ArrowDown" ? 1 : -1) +
          searchHits.length) % searchHits.length;
        paintSearchActive();
      } else if (e.key === "Enter") {
        var hit = searchHits[searchActive > -1 ? searchActive : 0];
        if (hit) root.location.href = "product.html?id=" + hit.id;
      }
    });

    /* Cmd/Ctrl+K anywhere; "/" when not typing in a field */
    doc.addEventListener("keydown", function (e) {
      if (doc.querySelector(".gate")) return; /* the age gate owns the screen */
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        var t = e.target;
        if (t && (/(INPUT|TEXTAREA|SELECT)/.test(t.tagName) || t.isContentEditable)) return;
        e.preventDefault();
        openSearch();
      }
    });
  }

  function openSearch() {
    if (!searchWrap) return;
    if (doc.querySelector(".gate")) return; /* age gate owns the screen */
    /* Search sits above every other overlay — close them first so the single
       scroll-lock class stays truthful when search later releases it. */
    closeCart();
    closeNav();
    if (HP.closeShopMenu) HP.closeShopMenu();
    var filters = $(".filters.is-open");
    if (filters) filters.classList.remove("is-open");
    searchOpener = doc.activeElement;
    searchWrap.removeAttribute("inert");
    searchWrap.setAttribute("aria-hidden", "false");
    searchWrap.classList.add("is-open");
    doc.body.classList.add("scroll-lock");
    searchInput.value = "";
    renderSearch("");
    setTimeout(function () { searchInput.focus(); }, 40);
  }

  function closeSearch() {
    searchWrap.classList.remove("is-open");
    searchWrap.setAttribute("inert", "");
    searchWrap.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("scroll-lock");
    /* Put keyboard users back where they were, not at the top of the page. */
    if (searchOpener && searchOpener.focus) searchOpener.focus();
    searchOpener = null;
  }

  /* --------------------------------------------------- Global add-to-cart */
  function bindAddButtons() {
    doc.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn) return;
      e.preventDefault();
      var key = btn.getAttribute("data-add");
      var qty = parseInt(btn.getAttribute("data-qty"), 10) || 1;
      var r = HP.resolve(key);
      if (!r) return;
      if (Cart.add(key, qty)) {
        HP.toast("Added " + r.product.name + " to your cart.");
        openCart();
      }
    });
  }

  /* Reflect the count in the header badge on every change. */
  function bindCartBadge() {
    function paint() {
      var n = Cart.count();
      $$("[data-cart-count]").forEach(function (b) {
        b.textContent = n;
        b.classList.toggle("is-on", n > 0);
      });
      renderDrawer();
    }
    Cart.onChange(paint);
    paint();
  }

  /* ----------------------------------------------------------- Accordions */
  function setPanel(item, open) {
    var panel = $(".acc__panel", item);
    if (!panel) return;
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + "px";
      /* Release the cap once open so reflow (fonts, images) can't clip it.
         The timer is the real guarantee — transitionend does not fire in a
         backgrounded tab, and content must never stay stuck at zero height. */
      clearTimeout(panel._accTimer);
      panel._accTimer = setTimeout(function () {
        if (item.classList.contains("is-open")) panel.style.maxHeight = "none";
      }, 320);
    } else {
      /* Go from a concrete height so the collapse actually animates. */
      clearTimeout(panel._accTimer);
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight;
      panel.style.maxHeight = "0px";
      /* Snap shut if the transition was interrupted or never ran. */
      panel._accTimer = setTimeout(function () {
        if (item.classList.contains("is-open")) return;
        panel.style.transition = "none";
        panel.style.maxHeight = "0px";
        void panel.offsetHeight;
        panel.style.transition = "";
      }, 320);
    }
  }

  HP.bindAccordions = function (ctx) {
    $$(".acc__item", ctx || doc).forEach(function (item) {
      var btn = $(".acc__btn", item);
      if (!btn || btn.dataset.accBound) return;
      btn.dataset.accBound = "1";

      var panel = $(".acc__panel", item);
      if (panel && !panel.id) panel.id = "acc-panel-" + Math.random().toString(36).slice(2);
      if (panel) btn.setAttribute("aria-controls", panel.id);

      setPanel(item, item.classList.contains("is-open"));

      btn.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        setPanel(item, open);
      });
    });
  };

  /* ----------------------------------------------------- Reveal on scroll */
  /* Rescannable, because pages inject most of their content after init.
     Anything still hidden after a beat is force-shown — a missed observer
     must never leave a section permanently invisible. */
  var io = null;

  function revealAll() {
    $$("[data-reveal]").forEach(function (n) { n.classList.add("is-in"); });
  }

  HP.revealScan = function () {
    var nodes = $$("[data-reveal]:not([data-reveal-seen])");
    if (!nodes.length) return;

    if (!("IntersectionObserver" in root)) return revealAll();

    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var delay = parseInt(en.target.getAttribute("data-reveal"), 10) || 0;
          setTimeout(function () { en.target.classList.add("is-in"); }, delay);
          io.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    }

    nodes.forEach(function (n) {
      n.setAttribute("data-reveal-seen", "");
      io.observe(n);
    });
  };

  function bindReveal() {
    HP.revealScan();
    /* Safety net: never strand content behind a failed observer. */
    setTimeout(revealAll, 2500);
  }

  /* --------------------------------------------------------------- Escape */
  function bindEscape() {
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var drawer = $("#cart-drawer");
      var nav = $("#mobile-nav");
      var filters = $(".filters.is-open");
      if (searchWrap && searchWrap.classList.contains("is-open")) return closeSearch();
      if (drawer && drawer.classList.contains("is-open")) return closeCart();
      if (nav && nav.classList.contains("is-open")) return closeNav();
      if (filters) {
        filters.classList.remove("is-open");
        doc.body.classList.remove("scroll-lock");
      }
    });
  }

  /* ------------------------------------------------------------ Bootstrap */
  function init() {
    buildHeader();
    buildFooter();
    if (B.commerceEnabled) buildDrawer();
    buildSearch();
    if (B.commerceEnabled) {
      bindAddButtons();
      bindCartBadge();
    }
    bindEscape();
    ageGate();
    /* Page content is injected here, so reveal must be scanned afterwards. */
    if (root.HP_PAGE && typeof root.HP_PAGE === "function") root.HP_PAGE();
    bindReveal();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})(window, document);
