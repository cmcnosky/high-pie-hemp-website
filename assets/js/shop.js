/* ==========================================================================
   HIGH PIE — searchable product catalog
   ========================================================================== */
window.HP_PAGE = function () {
  "use strict";
  var A = HP.art;
  var $ = HP.$;
  var $$ = HP.$$;

  var FACETS = [
    {
      key: "category",
      title: "Format",
      options: HP.CATEGORIES.map(function (c) { return { value: c.key, label: c.label }; }),
      test: function (p, value) { return p.category === value; }
    },
    {
      key: "profile",
      title: "Profile",
      options: Object.keys(HP.PROFILES).map(function (key) {
        return { value: key, label: HP.PROFILES[key].label };
      }),
      test: function (p, value) {
        return p.profile === value || p.variants.some(function (variant) { return variant.profileOverride === value; });
      }
    },
    {
      key: "cannabinoid",
      title: "Cannabinoid",
      options: [
        { value: "thc", label: "THC" },
        { value: "cbd", label: "CBD" },
        { value: "ratio", label: "THC + CBD" }
      ],
      test: function (p, value) { return p.cannabinoid === value; }
    }
  ];

  function readState() {
    var query = new URLSearchParams(location.search);
    var state = { sort: query.get("sort") === "name" ? "name" : "featured" };
    FACETS.forEach(function (facet) {
      var allowed = facet.options.map(function (option) { return option.value; });
      state[facet.key] = (query.get(facet.key) || "").split(",").filter(function (value) {
        return allowed.indexOf(value) > -1;
      });
    });
    return state;
  }

  function writeState(replace) {
    var query = new URLSearchParams();
    FACETS.forEach(function (facet) {
      if (state[facet.key].length) query.set(facet.key, state[facet.key].join(","));
    });
    if (state.sort === "name") query.set("sort", "name");
    var url = location.pathname + (query.toString() ? "?" + query.toString() : "");
    history[replace ? "replaceState" : "pushState"](null, "", url);
  }

  function matches(product, stateToUse, skip) {
    return FACETS.every(function (facet) {
      if (facet.key === skip || !stateToUse[facet.key].length) return true;
      return stateToUse[facet.key].some(function (value) { return facet.test(product, value); });
    });
  }

  function countFor(facet, value) {
    return HP.PRODUCTS.filter(function (product) {
      return matches(product, state, facet.key) && facet.test(product, value);
    }).length;
  }

  var state = readState();
  var groupsHost = $("[data-filter-groups]");
  var resultsHost = $("[data-results]");
  var chipsHost = $("[data-chips]");
  var countHost = $("[data-count]");
  var sortSelect = $("#sort");
  var defaultHeading = {
    title: $("[data-title]").textContent,
    crumb: $("[data-crumb]").textContent,
    blurb: $("[data-blurb]").textContent
  };

  function renderFilters() {
    groupsHost.innerHTML = FACETS.map(function (facet) {
      var rows = facet.options.map(function (option) {
        var count = countFor(facet, option.value);
        var checked = state[facet.key].indexOf(option.value) > -1;
        return '<label class="check' + (!count && !checked ? " is-empty" : "") + '">' +
          '<input type="checkbox" data-facet="' + facet.key + '" value="' + option.value + '"' +
          (checked ? " checked" : "") + (!count && !checked ? " disabled" : "") + '>' +
          '<span>' + option.label + '</span><span class="check__count">' + count + '</span></label>';
      }).join("");
      return '<div class="filter"><div class="filter__title">' + facet.title + '</div>' + rows + '</div>';
    }).join("");
  }

  function renderChips() {
    var chips = [];
    FACETS.forEach(function (facet) {
      state[facet.key].forEach(function (value) {
        var option = facet.options.filter(function (candidate) { return candidate.value === value; })[0];
        if (!option) return;
        chips.push('<span class="chip">' + option.label + '<button data-chip-facet="' + facet.key +
          '" data-chip-value="' + value + '" aria-label="Remove ' + option.label + ' filter">' +
          A.icon("x") + '</button></span>');
      });
    });
    chipsHost.innerHTML = chips.join("");
    chipsHost.hidden = !chips.length;
  }

  function renderResults() {
    var list = HP.PRODUCTS.filter(function (product) { return matches(product, state); });
    list.sort(function (a, b) {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name);
    });
    countHost.textContent = list.length + (list.length === 1 ? " product" : " products");
    if (!list.length) {
      resultsHost.innerHTML = '<div class="empty">' + A.icon("search") +
        '<h3>No products match those filters</h3><p>Clear one or more filters to keep exploring.</p>' +
        '<button class="btn btn--forest" data-clear>Clear all filters</button></div>';
    } else {
      resultsHost.innerHTML = list.map(HP.card).join("");
    }
  }

  function renderHeading() {
    var categories = state.category;
    var profiles = state.profile;
    if (categories.length === 1 && !profiles.length) {
      var category = HP.CATEGORIES.filter(function (c) { return c.key === categories[0]; })[0];
      $("[data-title]").textContent = category.label;
      $("[data-crumb]").textContent = category.label;
      $("[data-blurb]").textContent = category.blurb + ".";
    } else if (profiles.length === 1 && !categories.length) {
      var profile = HP.PROFILES[profiles[0]];
      $("[data-title]").textContent = profile.label + " products";
      $("[data-crumb]").textContent = profile.label;
      $("[data-blurb]").textContent = "Explore the " + profile.label.toLowerCase() + " side of the High Pie lineup.";
    } else {
      $("[data-title]").textContent = defaultHeading.title;
      $("[data-crumb]").textContent = defaultHeading.crumb;
      $("[data-blurb]").textContent = defaultHeading.blurb;
    }
  }

  function renderAll() {
    renderHeading();
    renderFilters();
    renderChips();
    renderResults();
    sortSelect.value = state.sort;
    if (HP.revealScan) HP.revealScan();
  }

  groupsHost.addEventListener("change", function (event) {
    var input = event.target.closest("[data-facet]");
    if (!input) return;
    var key = input.getAttribute("data-facet");
    var value = input.value;
    var index = state[key].indexOf(value);
    if (input.checked && index === -1) state[key].push(value);
    if (!input.checked && index > -1) state[key].splice(index, 1);
    writeState(false);
    renderAll();
  });

  chipsHost.addEventListener("click", function (event) {
    var button = event.target.closest("[data-chip-facet]");
    if (!button) return;
    var key = button.getAttribute("data-chip-facet");
    var value = button.getAttribute("data-chip-value");
    state[key] = state[key].filter(function (item) { return item !== value; });
    writeState(false);
    renderAll();
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-clear]")) return;
    FACETS.forEach(function (facet) { state[facet.key] = []; });
    writeState(false);
    renderAll();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    writeState(false);
    renderResults();
  });

  window.addEventListener("popstate", function () {
    state = readState();
    renderAll();
  });

  /* Accessible mobile filter dialog. Desktop keeps the same aside in flow. */
  var panel = $("#filters");
  var openButton = $("[data-open-filters]");
  var closeButton = $("[data-close-filters]");
  var mobile = window.matchMedia("(max-width: 940px)");
  var opener = null;
  closeButton.innerHTML = A.icon("x");

  function syncPanel() {
    if (mobile.matches && !panel.classList.contains("is-open")) {
      panel.setAttribute("inert", "");
      panel.setAttribute("aria-hidden", "true");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
    } else {
      panel.removeAttribute("inert");
      panel.setAttribute("aria-hidden", "false");
      if (!mobile.matches) {
        panel.removeAttribute("role");
        panel.removeAttribute("aria-modal");
      }
    }
  }

  function openFilters() {
    opener = document.activeElement;
    panel.classList.add("is-open");
    document.body.classList.add("scroll-lock");
    $("[data-filter-head]").style.display = "flex";
    syncPanel();
    closeButton.focus();
  }

  function closeFilters() {
    if (!panel.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    document.body.classList.remove("scroll-lock");
    syncPanel();
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  openButton.addEventListener("click", openFilters);
  closeButton.addEventListener("click", closeFilters);
  panel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") return closeFilters();
    if (event.key !== "Tab" || !mobile.matches) return;
    var focusable = $$("button, input, select, a[href]", panel).filter(function (node) { return !node.disabled; });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (mobile.addEventListener) mobile.addEventListener("change", syncPanel);

  syncPanel();
  renderAll();
};
