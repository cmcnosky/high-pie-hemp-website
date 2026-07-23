/* ==========================================================================
   HIGH PIE — Art
   Every mark, icon and product packshot is drawn here as SVG. No raster
   assets, so everything stays sharp and re-colors to the profile key.

   Packshot geometry follows PACKAGING_SPEC.md: clear flint flower jars with a
   narrow cream label, matte sleeve-and-drawer gummy boxes with a full-width
   profile stripe, luer-lock glass RSO applicators, and Retroflip pre-roll tins.
   ========================================================================== */
(function (root) {
  "use strict";

  var HP = (root.HP = root.HP || {});
  var A = (HP.art = {});

  /* ------------------------------------------------------------ Utilities */

  /* Deterministic PRNG so a given strain always draws the same flower. */
  function rng(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6d2b79f5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(n, a, b) { return n < a ? a : n > b ? b : n; }

  /* Shift a hex color toward white (amt > 0) or black (amt < 0). */
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt > 0) {
      r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
    } else {
      r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
    }
    return "#" + [r, g, b].map(function (c) {
      return ("0" + Math.round(clamp(c, 0, 255)).toString(16)).slice(-2);
    }).join("");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Keep long cultivar names inside the label plate. */
  function fit(s, max) {
    s = String(s || "");
    return s.length > max ? s.slice(0, max - 1).trim() + "…" : s;
  }

  var uid = 0;
  function nid() { return "hp" + (++uid); }

  A.shade = shade;

  /* ------------------------------------------------------- Brand: the mark */
  /* Rising sun with rays over a two-peak ridge — the constant across every
     board in the brand set. */
  A.mark = function (opts) {
    opts = opts || {};
    var sun = opts.sun || "#d2551f";
    var hill = opts.hill || "#7c9a3f";
    var rays = opts.rays !== false;
    var r = "";
    if (rays) {
      for (var i = 0; i < 11; i++) {
        var a = Math.PI * (0.06 + (0.88 * i) / 10);
        var x1 = 50 - Math.cos(a) * 30, y1 = 44 - Math.sin(a) * 30;
        var x2 = 50 - Math.cos(a) * 39, y2 = 44 - Math.sin(a) * 39;
        r += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' +
             x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + sun +
             '" stroke-width="2.6" stroke-linecap="round"/>';
      }
    }
    return '<svg viewBox="0 0 100 74" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      r +
      '<path d="M28 44a22 22 0 0 1 44 0Z" fill="' + sun + '"/>' +
      '<path d="M16 60 34 39l10 11 9-13 15 17 10-8 6 14Z" fill="' + hill + '"/>' +
      '<path d="M22 66h20M48 66h30" stroke="' + hill + '" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M36 72h26" stroke="' + hill + '" stroke-width="3" stroke-linecap="round" opacity=".5"/>' +
      '</svg>';
  };

  /* Full lockup: mark + HIGH PIE + descriptor rule. */
  A.logo = function (opts) {
    opts = opts || {};
    var light = opts.light;
    var word = light ? "#faf9f4" : "#14291f";
    var sub = light ? "#d3a02c" : "#a45a39";
    var sun = opts.sun || "#d2551f";
    var hill = light ? "#7c9a3f" : "#4e6b3e";
    var rays = "";
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (0.08 + (0.84 * i) / 8);
      var x1 = 26 - Math.cos(a) * 14, y1 = 20 - Math.sin(a) * 14;
      var x2 = 26 - Math.cos(a) * 19, y2 = 20 - Math.sin(a) * 19;
      rays += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' +
              x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + sun +
              '" stroke-width="1.7" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 232 62" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="High Pie">' +
      rays +
      '<path d="M15 20a11 11 0 0 1 22 0Z" fill="' + sun + '"/>' +
      '<path d="M7 30 17 19l5 6 5-7 8 9 5-4 4 7Z" fill="' + hill + '"/>' +
      '<path d="M11 34h10M24 34h15" stroke="' + hill + '" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>' +
      '<text x="54" y="31" font-family="Fraunces, Georgia, serif" font-size="30" font-weight="700" letter-spacing="0.5" fill="' + word + '">HIGH PIE</text>' +
      '<line x1="55" y1="43" x2="70" y2="43" stroke="' + sub + '" stroke-width="1.3"/>' +
      '<text x="76" y="47" font-family="Jost, Avenir Next, sans-serif" font-size="11.5" letter-spacing="5.4" fill="' + sub + '">HEMP</text>' +
      '<line x1="150" y1="43" x2="165" y2="43" stroke="' + sub + '" stroke-width="1.3"/>' +
      '</svg>';
  };

  /* ------------------------------------------------------ Brand: the waves */
  /* The layered terrain stripes. `to` = the color the band resolves into so
     it can seam invisibly against the next section. */
  A.waves = function (opts) {
    opts = opts || {};
    var to = opts.to || "#14291f";
    /* Orange and green lead the terrain stack; gold and teal support. */
    var stack = opts.colors || ["#cd5928", "#7c9a3f", "#ece4d4", "#4e6b3e", "#2f6f69"];
    var id = nid();
    var out = '<svg class="waves' + (opts.flip ? " waves--flip" : "") +
      '" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    var paths = [
      "M0 78c150-30 280 24 430 16s250-56 400-52 280 58 420 44 190-30 190-30V120H0Z",
      "M0 88c160-26 290 20 440 14s260-50 400-46 270 52 410 40 190-26 190-26V120H0Z",
      "M0 98c170-22 300 16 450 12s250-44 400-40 260 46 400 36 190-22 190-22V120H0Z",
      "M0 106c180-16 310 12 460 9s250-36 400-33 250 38 390 30 190-16 190-16V120H0Z",
      "M0 113c190-10 320 8 470 6s250-26 400-24 240 28 380 22 190-10 190-10V120H0Z"
    ];
    for (var i = 0; i < paths.length; i++) {
      out += '<path d="' + paths[i] + '" fill="' + (stack[i] || to) + '" opacity="' + (0.92 - i * 0.02).toFixed(2) + '"/>';
    }
    out += '<path d="M0 118h1440v2H0Z" fill="' + to + '"/>';
    out += "</svg>";
    return out.replace(/__ID__/g, id);
  };

  /* ---------------------------------------------------------------- Icons */
  var ICONS = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    flask: '<path d="M9 3h6M10 3v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M6.8 14h10.4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    batch: '<path d="M12 2 3 7v10l9 5 9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    moon: '<path d="M21 13.2A8.6 8.6 0 1 1 10.8 3a6.9 6.9 0 0 0 10.2 10.2Z"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 2h2.6l2.5 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 6H5.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    arrowUR: '<path d="M6 18 18 6M8 6h10v10"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    chevD: '<path d="m5 9 7 7 7-7"/>',
    check: '<path d="m4 12.5 5.2 5.2L20 7"/>',
    shield: '<path d="M12 2 4 5.5v6c0 5 3.4 9.2 8 10.5 4.6-1.3 8-5.5 8-10.5v-6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    truck: '<path d="M2 5.5h11v11H2ZM13 9h4l4 4v3.5h-8"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/>',
    doc: '<path d="M14 2H6.5A1.5 1.5 0 0 0 5 3.5v17A1.5 1.5 0 0 0 6.5 22h11a1.5 1.5 0 0 0 1.5-1.5V7Z"/><path d="M14 2v5h5M8.5 13h7M8.5 17h4.5"/>',
    star: '<path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.06-5.8 3.06 1.1-6.5-4.7-4.6 6.5-.95Z" fill="currentColor" stroke="none"/>',
    insta: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M22 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 4.3 2H7a2 2 0 0 1 2 1.7c.1 1 .35 2 .7 2.9a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.45c.94.35 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    filter: '<path d="M3 5h18M6.5 12h11M10 19h4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
    lock: '<rect x="4" y="10.5" width="16" height="11" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    drop: '<path d="M12 2.7c3.4 4 6.5 7.3 6.5 11.1A6.5 6.5 0 0 1 5.5 13.8c0-3.8 3.1-7.1 6.5-11.1Z"/>',
    scale: '<path d="M12 3v18M7 6h10M5 6 2.5 13h5ZM19 6l-2.5 7h5Z"/><path d="M7 21h10"/>'
  };

  A.icon = function (name, cls) {
    var d = ICONS[name];
    if (!d) return "";
    var filled = name === "star";
    return '<svg viewBox="0 0 24 24" fill="none"' + (cls ? ' class="' + cls + '"' : "") +
      ' stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      d + "</svg>";
  };

  /* Botanical flourish — the gold linework framing the brand boards. */
  A.botanical = function (color, flip) {
    return '<svg viewBox="0 0 120 200" fill="none" stroke="' + (color || "#d3a02c") +
      '" stroke-width="1.1" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"' +
      (flip ? ' style="transform:scaleX(-1)"' : "") + ">" +
      '<path d="M60 196C60 150 54 110 40 74 30 48 20 30 8 16"/>' +
      '<path d="M52 150c-12-4-22-2-30 6M52 150c-2-12-9-20-19-24"/>' +
      '<path d="M46 118c-12-2-22 2-28 11M46 118c-4-11-11-18-21-21"/>' +
      '<path d="M38 88c-11-1-20 4-25 13M38 88c-4-10-11-16-20-18"/>' +
      '<path d="M68 160c11-6 21-6 30 0M68 160c0-12 6-21 15-26"/>' +
      '<path d="M72 126c11-4 21-2 29 5M72 126c1-12 8-20 18-24"/>' +
      '<path d="M76 96c10-5 20-4 28 2M76 96c1-11 7-19 16-23"/>' +
      '<circle cx="8" cy="16" r="3.4"/><circle cx="98" cy="70" r="3"/>' +
      '<circle cx="103" cy="131" r="2.6"/><circle cx="22" cy="101" r="2.6"/>' +
      "</svg>";
  };

  /* ================================================================== */
  /*  Product packshots                                                 */
  /*  Every one is 400 × 400 with a consistent top-left light source     */
  /*  and a soft contact shadow at y ≈ 352.                              */
  /* ================================================================== */

  /* ==================================================================
     Studio rendering

     Each packshot is composed like a real product shot: a seamless
     backdrop, one key light from the upper left with a cooler fill from
     the right, a contact shadow plus a softer cast shadow, and a faded
     surface reflection. The product body is defined once and referenced
     twice — once upright, once flipped into the reflection.
     ================================================================== */

  var BASE = 344;          /* the surface the product stands on */
  var LIGHT = "#fffaf0";   /* key light, very slightly warm */

  function open(extra) {
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ' +
      (extra || "") + ' aria-hidden="true">';
  }

  /* Filters and the grain tile are shared across every packshot on the
     page — 25 product cards must not each rasterize their own noise. */
  var defsInstalled = false;
  var GRAIN =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E" +
    "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' " +
    "stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E" +
    "%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E";

  function installDefs() {
    if (defsInstalled || typeof document === "undefined") return;
    defsInstalled = true;
    var host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    host.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>' +
        '<filter id="hpB1" x="-30%" y="-30%" width="160%" height="160%">' +
          '<feGaussianBlur stdDeviation="1.1"/></filter>' +
        '<filter id="hpB2" x="-40%" y="-40%" width="180%" height="180%">' +
          '<feGaussianBlur stdDeviation="2.6"/></filter>' +
        '<filter id="hpB5" x="-50%" y="-50%" width="200%" height="200%">' +
          '<feGaussianBlur stdDeviation="5"/></filter>' +
        '<filter id="hpB12" x="-60%" y="-60%" width="220%" height="220%">' +
          '<feGaussianBlur stdDeviation="12"/></filter>' +
        '<pattern id="hpGrain" width="140" height="140" patternUnits="userSpaceOnUse">' +
          '<image href="' + GRAIN + '" width="140" height="140"/></pattern>' +
      "</defs></svg>";
    document.body.appendChild(host);
  }

  /* A cylinder lit from the upper left: dark turning edge, hot specular
     band, mid tone, falloff, then a little bounce light on the far rim. */
  function cylinder(id, base, strength) {
    var k = strength == null ? 1 : strength;
    function s(a) { return shade(base, a * k); }
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="' + s(-0.5) + '"/>' +
      '<stop offset=".05" stop-color="' + s(-0.24) + '"/>' +
      '<stop offset=".17" stop-color="' + s(0.34) + '"/>' +
      '<stop offset=".27" stop-color="' + s(0.14) + '"/>' +
      '<stop offset=".47" stop-color="' + base + '"/>' +
      '<stop offset=".72" stop-color="' + s(-0.24) + '"/>' +
      '<stop offset=".9" stop-color="' + s(-0.46) + '"/>' +
      '<stop offset=".97" stop-color="' + s(-0.1) + '"/>' +
      '<stop offset="1" stop-color="' + s(-0.4) + '"/>' +
      "</linearGradient>";
  }

  /* A flat panel catching the key light from the upper left. */
  function panel(id, base, spread) {
    var k = spread == null ? 1 : spread;
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2=".75" y2="1">' +
      '<stop offset="0" stop-color="' + shade(base, 0.16 * k) + '"/>' +
      '<stop offset=".45" stop-color="' + base + '"/>' +
      '<stop offset="1" stop-color="' + shade(base, -0.16 * k) + '"/>' +
      "</linearGradient>";
  }

  /* Brushed metal reads as two specular bands rather than one. */
  function metal(id, base) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="' + shade(base, -0.5) + '"/>' +
      '<stop offset=".08" stop-color="' + shade(base, 0.42) + '"/>' +
      '<stop offset=".18" stop-color="' + shade(base, -0.1) + '"/>' +
      '<stop offset=".38" stop-color="' + shade(base, 0.24) + '"/>' +
      '<stop offset=".6" stop-color="' + shade(base, -0.2) + '"/>' +
      '<stop offset=".82" stop-color="' + shade(base, 0.12) + '"/>' +
      '<stop offset=".94" stop-color="' + shade(base, -0.44) + '"/>' +
      '<stop offset="1" stop-color="' + shade(base, -0.12) + '"/>' +
      "</linearGradient>";
  }

  /* Horizontal arc used for label edges and container tops. A cylinder
     seen slightly from above shows every horizontal line bowing down at
     the centre — it is the cue that sells the round form. */
  function arc(x1, x2, y, sag) {
    return "M" + x1 + " " + y + "Q" + ((x1 + x2) / 2) + " " + (y + sag * 2) + " " + x2 + " " + y;
  }
  function band(x1, x2, yTop, h, sag) {
    return arc(x1, x2, yTop, sag) + "L" + x2 + " " + (yTop + h) +
      "Q" + ((x1 + x2) / 2) + " " + (yTop + h + sag * 2) + " " + x1 + " " + (yTop + h) + "Z";
  }

  /* Compose a product body into a lit stage. */
  function compose(o) {
    installDefs();
    var id = nid();
    var cx = o.cx == null ? 200 : o.cx;
    var tint = o.tint || "#ece7d9";
    var lift = o.lift || 0;           /* products that float (pouches) */
    var baseY = BASE - lift;
    /* Fill the frame the way a real packshot does, scaling about the point
       where the product meets the surface so it stays planted. */
    var k = o.scale || 1.15;
    var w = (o.width || 150) * k;
    var plant = "translate(" + cx + "," + baseY + ") scale(" + k + ") translate(" +
      -cx + "," + -baseY + ")";

    return open() +
      "<defs>" +
        (o.defs || "") +
        /* seamless sweep: brighter behind the product, falling off outward */
        '<radialGradient id="' + id + 'sweep" cx=".5" cy=".42" r=".78">' +
          '<stop offset="0" stop-color="' + shade(tint, 0.5) + '"/>' +
          '<stop offset=".55" stop-color="' + shade(tint, 0.14) + '"/>' +
          '<stop offset="1" stop-color="' + shade(tint, -0.16) + '"/>' +
        "</radialGradient>" +
        /* the surface picks up a touch more warmth than the wall */
        '<linearGradient id="' + id + 'floor" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + shade(tint, 0.06) + '" stop-opacity="0"/>' +
          '<stop offset=".35" stop-color="' + shade(tint, -0.04) + '" stop-opacity=".65"/>' +
          '<stop offset="1" stop-color="' + shade(tint, -0.2) + '" stop-opacity=".9"/>' +
        "</linearGradient>" +
        '<radialGradient id="' + id + 'vig" cx=".5" cy=".45" r=".72">' +
          '<stop offset=".55" stop-color="#000" stop-opacity="0"/>' +
          '<stop offset="1" stop-color="#3a2a17" stop-opacity=".2"/>' +
        "</radialGradient>" +
        /* reflection falls away over roughly a third of the product height */
        '<linearGradient id="' + id + 'rg" gradientUnits="userSpaceOnUse" x1="0" y1="' +
          baseY + '" x2="0" y2="' + (baseY + (o.reflect || 62)) + '">' +
          '<stop offset="0" stop-color="#fff" stop-opacity="' + (o.reflectOpacity || 0.34) + '"/>' +
          '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
        "</linearGradient>" +
        '<mask id="' + id + 'rm"><rect x="0" y="' + baseY + '" width="400" height="' +
          (o.reflect || 62) + '" fill="url(#' + id + 'rg)"/></mask>' +
        '<g id="' + id + 'body" transform="' + plant + '">' + o.body + "</g>" +
      "</defs>" +

      /* Backdrop is skipped when the shot is being composited into a larger
         scene — three opaque sweeps would paint over each other. */
      (o.bare ? "" :
        '<rect width="400" height="400" fill="url(#' + id + 'sweep)"/>' +
        '<rect y="' + (baseY - 26) + '" width="400" height="' + (400 - baseY + 26) +
          '" fill="url(#' + id + 'floor)"/>' +
        '<ellipse cx="' + cx + '" cy="' + (baseY + 6) + '" rx="' + (w * 1.5) +
          '" ry="26" fill="' + LIGHT + '" opacity=".3" filter="url(#hpB12)"/>') +

      /* reflection, before the shadows so the shadows sit on top of it */
      '<g mask="url(#' + id + 'rm)"><g transform="translate(0,' + baseY * 2 +
        ') scale(1,-1)" filter="url(#hpB2)" opacity=".5"><use href="#' + id +
        'body"/></g></g>' +

      /* cast shadow — key is upper left, so it throws down and right */
      '<ellipse cx="' + (cx + w * 0.28) + '" cy="' + (baseY + 9) + '" rx="' + (w * 0.95) +
        '" ry="15" fill="#2b1c0c" opacity=".2" filter="url(#hpB12)"/>' +
      /* contact shadow — tight and dark where the product meets the surface */
      '<ellipse cx="' + cx + '" cy="' + (baseY + 2) + '" rx="' + (w * 0.62) +
        '" ry="7" fill="#241608" opacity=".42" filter="url(#hpB5)"/>' +

      /* product */
      '<use href="#' + id + 'body"/>' +

      (o.after ? '<g transform="' + plant + '">' + o.after + "</g>" : "") +

      /* lens vignette, then film grain over the whole frame */
      (o.bare ? "" :
        '<rect width="400" height="400" fill="url(#' + id + 'vig)"/>' +
        '<rect width="400" height="400" fill="url(#hpGrain)" opacity=".07" ' +
          'style="mix-blend-mode:overlay"/>') +
      "</svg>";
  }

  /* A decorative QR-looking block for COA panels. Not a scannable code —
     swap in a real one generated from the batch URL before print. */
  function qrBlock(x, y, size, seedStr) {
    var rand = rng("qr" + seedStr);
    var n = 11;
    var c = size / n;
    var s = "";
    function finder(fx, fy) {
      s += '<rect x="' + (x + fx * c) + '" y="' + (y + fy * c) + '" width="' + c * 3 +
        '" height="' + c * 3 + '" fill="#14291f"/>';
      s += '<rect x="' + (x + (fx + 0.6) * c) + '" y="' + (y + (fy + 0.6) * c) + '" width="' +
        c * 1.8 + '" height="' + c * 1.8 + '" fill="#f7efdf"/>';
      s += '<rect x="' + (x + (fx + 1.1) * c) + '" y="' + (y + (fy + 1.1) * c) + '" width="' +
        c * 0.8 + '" height="' + c * 0.8 + '" fill="#14291f"/>';
    }
    for (var r = 0; r < n; r++) {
      for (var k = 0; k < n; k++) {
        var inFinder = (r < 3 && k < 3) || (r < 3 && k > n - 4) || (r > n - 4 && k < 3);
        if (inFinder || rand() > 0.52) continue;
        s += '<rect x="' + (x + k * c).toFixed(1) + '" y="' + (y + r * c).toFixed(1) +
          '" width="' + c.toFixed(1) + '" height="' + c.toFixed(1) + '" fill="#14291f"/>';
      }
    }
    finder(0, 0); finder(n - 3, 0); finder(0, n - 3);
    return s;
  }

  /* The tiny sun mark used on caps, tins and box faces. */
  function sunMark(cx, cy, s, color, op) {
    var g = '<g transform="translate(' + cx + ',' + cy + ') scale(' + s + ')" opacity="' +
      (op == null ? 1 : op) + '">';
    for (var i = 0; i < 7; i++) {
      var a = Math.PI * (0.12 + (0.76 * i) / 6);
      g += '<line x1="' + (-Math.cos(a) * 9).toFixed(1) + '" y1="' + (-Math.sin(a) * 9).toFixed(1) +
           '" x2="' + (-Math.cos(a) * 12.5).toFixed(1) + '" y2="' + (-Math.sin(a) * 12.5).toFixed(1) +
           '" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round"/>';
    }
    g += '<path d="M-7 0a7 7 0 0 1 14 0Z" fill="' + color + '"/>';
    g += '<path d="M-11 5 -4 -1l3 3.5 3-4.5 5 6 3-2.5 2 4.5Z" fill="' + color + '" opacity=".85"/>';
    return g + "</g>";
  }

  /* ------------------------------------------------------------ Flower */
  /* Cannabis inside clear flint glass. The flower is built from nug
     rosettes rather than scattered blobs, then read through glass:
     edge refraction, a specular streak, and a bright rim at the shoulder. */
  function flowerJar(p, o) {
    o = o || {};
    var prof = HP.PROFILES[p.profile] || HP.PROFILES.hybrid;
    var rand = rng((p.id || "x") + (o.size || ""));
    var id = nid();

    var L = 122, R = 278, TOP = 178, BOT = 344;   /* jar body box */
    var CX = (L + R) / 2;

    var buds = p.profile === "indica"
      ? ["#4b4260", "#3a3350", "#554a6b", "#665a7c", "#2e3a3c"]
      : p.profile === "sativa"
      ? ["#6d8a38", "#5a7430", "#7b9945", "#465c24", "#84a04e"]
      : ["#5c7a34", "#4a6529", "#6b8a40", "#3d5322", "#79934a"];

    function nug(cx, cy, size, depth) {
      var s = "";
      s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + (cy + size * 0.5).toFixed(1) +
        '" rx="' + (size * 0.92).toFixed(1) + '" ry="' + (size * 0.42).toFixed(1) +
        '" fill="#16200f" opacity="' + (0.45 * depth).toFixed(2) + '"/>';

      var blades = 2 + ((rand() * 3) | 0);
      for (var bl = 0; bl < blades; bl++) {
        var ba = rand() * Math.PI * 2;
        var blen = size * (0.5 + rand() * 0.45);
        var bw = size * 0.12;
        s += '<path d="M0 0 L' + blen.toFixed(1) + " " + (-bw).toFixed(1) + " L" +
          (blen * 0.72).toFixed(1) + " 0 L" + blen.toFixed(1) + " " + bw.toFixed(1) +
          ' Z" fill="' + buds[(rand() * buds.length) | 0] + '" opacity=".85" transform="translate(' +
          (cx + Math.cos(ba) * size * 0.5).toFixed(1) + "," +
          (cy + Math.sin(ba) * size * 0.44).toFixed(1) + ") rotate(" +
          ((ba * 180) / Math.PI).toFixed(0) + ')"/>';
      }

      var n = 8 + ((rand() * 4) | 0);
      var base = rand() * 360;
      for (var q = 0; q < n; q++) {
        var a = ((base + (360 / n) * q + rand() * 16) * Math.PI) / 180;
        var dist = size * (0.2 + rand() * 0.48);
        var x = cx + Math.cos(a) * dist;
        var y = cy + Math.sin(a) * dist * 0.86;
        var rx = size * (0.36 + rand() * 0.2);
        var ry = rx * (0.52 + rand() * 0.2);
        var deg = ((a * 180) / Math.PI).toFixed(0);
        s += '<path d="M' + (-rx).toFixed(1) + " 0C" + (-rx).toFixed(1) + " " + (-ry).toFixed(1) +
          " " + (rx * 0.18).toFixed(1) + " " + (-ry).toFixed(1) + " " + rx.toFixed(1) + " 0C" +
          (rx * 0.18).toFixed(1) + " " + ry.toFixed(1) + " " + (-rx).toFixed(1) + " " + ry.toFixed(1) +
          " " + (-rx).toFixed(1) + ' 0Z" fill="' + buds[(rand() * buds.length) | 0] +
          '" transform="translate(' + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + deg + ')"/>';
        s += '<path d="M' + (-rx * 0.7).toFixed(1) + " 0C" + (-rx * 0.7).toFixed(1) + " " +
          (-ry * 0.62).toFixed(1) + " " + (rx * 0.1).toFixed(1) + " " + (-ry * 0.62).toFixed(1) +
          " " + (rx * 0.62).toFixed(1) + ' 0Z" fill="#f4ffdc" opacity="' +
          (0.05 + rand() * 0.07).toFixed(2) + '" transform="translate(' + x.toFixed(1) + "," +
          y.toFixed(1) + ") rotate(" + deg + ')"/>';
      }

      s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' +
        (size * 0.38).toFixed(1) + '" ry="' + (size * 0.32).toFixed(1) + '" fill="' +
        buds[(rand() * buds.length) | 0] + '" opacity=".85"/>';
      s += '<ellipse cx="' + (cx + size * 0.1).toFixed(1) + '" cy="' + (cy + size * 0.14).toFixed(1) +
        '" rx="' + (size * 0.3).toFixed(1) + '" ry="' + (size * 0.24).toFixed(1) +
        '" fill="#141c0e" opacity=".26"/>';

      for (var w = 0; w < 2; w++) {
        var pa = rand() * 360;
        var px = cx + (rand() - 0.5) * size * 1.1;
        var py = cy + (rand() - 0.5) * size;
        s += '<path d="M' + px.toFixed(1) + " " + py.toFixed(1) + "q" + (size * 0.22).toFixed(1) +
          " " + (-size * 0.16).toFixed(1) + " " + (size * 0.44).toFixed(1) +
          ' -.5" stroke="#c47a2e" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="' +
          (0.45 + rand() * 0.35).toFixed(2) + '" transform="rotate(' + pa.toFixed(0) + " " +
          px.toFixed(1) + " " + py.toFixed(1) + ')"/>';
      }
      for (var t = 0; t < 9; t++) {
        s += '<circle cx="' + (cx + (rand() - 0.5) * size * 1.7).toFixed(1) + '" cy="' +
          (cy + (rand() - 0.5) * size * 1.5).toFixed(1) + '" r="' + (0.5 + rand() * 1.2).toFixed(1) +
          '" fill="#f2ffe0" opacity="' + (0.3 + rand() * 0.45).toFixed(2) + '"/>';
      }
      return s;
    }

    var flower = '<rect x="' + L + '" y="' + (TOP - 6) + '" width="' + (R - L) +
      '" height="' + (BOT - TOP + 12) + '" fill="#141b0d"/>';
    var rows = [
      { y: BOT - 12, size: 23, n: 5, d: 1 },
      { y: BOT - 38, size: 22, n: 5, d: 0.9 },
      { y: BOT - 64, size: 22, n: 5, d: 0.82 },
      { y: BOT - 90, size: 21, n: 5, d: 0.74 },
      { y: BOT - 116, size: 20, n: 5, d: 0.66 },
      { y: BOT - 140, size: 19, n: 5, d: 0.58 }
    ];
    for (var ri = rows.length - 1; ri >= 0; ri--) {
      var rw = rows[ri];
      for (var ci = 0; ci < rw.n; ci++) {
        var span = (R - L - 12) / rw.n;
        flower += nug(
          L + 6 + span * (ci + 0.5) + (rand() - 0.5) * span * 0.5,
          rw.y + (rand() - 0.5) * 13,
          rw.size * (0.82 + rand() * 0.34),
          rw.d
        );
      }
    }

    var label = fit(p.name, 17);
    var sizeTxt = o.size || "1/8 OZ";
    var LT = 252, LH = 60, SAG = 4;   /* label top, height, curvature */

    /* Silhouette: the sides stop short and the front of the base bows down to
       the contact point — what a cylinder looks like from slightly above, and
       what makes it agree with the elliptical cap top. */
    var HW = (R - L) / 2;
    var JAR = "M" + L + " " + (TOP + 8) + "q0-8 8-8h" + (R - L - 16) + "q8 0 8 8v" +
      (BOT - TOP - 24) + "q0 16-" + HW + " 16t-" + HW + " -16Z";

    var body =
      /* ---- glass body ---- */
      '<path d="' + JAR + '" fill="#e9efe6" opacity=".5"/>' +

      '<g clip-path="url(#' + id + 'clip)">' +
        flower +
        /* contents darken and compress against the turning edges */
        '<rect x="' + L + '" y="' + TOP + '" width="' + (R - L) + '" height="' + (BOT - TOP) +
          '" fill="url(#' + id + 'refr)"/>' +

        /* ---- label, bowed to sit on the cylinder ---- */
        '<path d="' + band(L, R, LT, LH, SAG) + '" fill="url(#' + id + 'lbl)"/>' +
        '<path d="' + arc(L, R, LT, SAG) + '" fill="none" stroke="' + prof.color + '" stroke-width="2.6"/>' +
        '<path d="' + arc(L, R, LT + LH, SAG) + '" fill="none" stroke="' + prof.color +
          '" stroke-width="2.4" opacity=".55"/>' +
        '<text x="' + CX + '" y="' + (LT + 20) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
          'font-size="6.4" letter-spacing="2.6" fill="#9d5433">HIGH PIE</text>' +
        '<text x="' + CX + '" y="' + (LT + 38) + '" text-anchor="middle" ' +
          'font-family="Fraunces, Georgia, serif" font-size="14" font-weight="600" fill="#16291d">' +
          esc(label) + "</text>" +
        '<text x="' + CX + '" y="' + (LT + 52) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
          'font-size="6.5" letter-spacing="2.2" fill="' + prof.ink + '">' +
          esc(prof.label.toUpperCase()) + " · " + esc(sizeTxt) + "</text>" +
        /* the label is paper on a round form, so it takes the same shading */
        '<path d="' + band(L, R, LT, LH, SAG) + '" fill="url(#' + id + 'wrap)"/>' +

        /* ---- glass over everything ---- */
        '<rect x="' + L + '" y="' + TOP + '" width="' + (R - L) + '" height="' + (BOT - TOP) +
          '" fill="url(#' + id + 'glass)"/>' +
        /* specular streaks: one broad on the key side, one thin on the fill side */
        '<rect x="' + (L + 9) + '" y="' + (TOP + 10) + '" width="11" height="' + (BOT - TOP - 26) +
          '" rx="5.5" fill="' + LIGHT + '" opacity=".5" filter="url(#hpB1)"/>' +
        '<rect x="' + (L + 24) + '" y="' + (TOP + 16) + '" width="3.5" height="' + (BOT - TOP - 42) +
          '" rx="1.75" fill="' + LIGHT + '" opacity=".26" filter="url(#hpB1)"/>' +
        '<rect x="' + (R - 20) + '" y="' + (TOP + 20) + '" width="5" height="' + (BOT - TOP - 50) +
          '" rx="2.5" fill="' + LIGHT + '" opacity=".22" filter="url(#hpB1)"/>' +
      "</g>" +

      /* shoulder: the glass rim catches a bright arc */
      '<ellipse cx="' + CX + '" cy="' + (TOP + 2) + '" rx="' + ((R - L) / 2 - 1) +
        '" ry="9" fill="#dfe7dc" opacity=".85"/>' +
      '<ellipse cx="' + CX + '" cy="' + (TOP + 1) + '" rx="' + ((R - L) / 2 - 5) +
        '" ry="6" fill="#8fa08a" opacity=".5"/>' +
      '<path d="' + arc(L + 8, R - 8, TOP - 1, 4) + '" fill="none" stroke="' + LIGHT +
        '" stroke-width="2.4" opacity=".75" filter="url(#hpB1)"/>' +

      /* thick glass base catches light, then the outline keeps it crisp */
      '<path d="' + arc(L + 10, R - 10, BOT - 22, 12) + '" fill="none" stroke="' + LIGHT +
        '" stroke-width="3" opacity=".3" filter="url(#hpB1)"/>' +
      '<path d="' + JAR + '" fill="none" stroke="#93a48d" stroke-width="1.3" opacity=".55"/>' +

      /* ---- cap: matte forest, knurled, seen slightly from above ---- */
      '<path d="M126 146q0-9 9-9h130q9 0 9 9v40q0 6-6 6H132q-6 0-6-6Z" fill="url(#' + id + 'cap)"/>' +
      '<ellipse cx="200" cy="146" rx="74" ry="10" fill="' + shade("#1e3a2a", 0.3) + '"/>' +
      '<ellipse cx="200" cy="146" rx="74" ry="10" fill="url(#' + id + 'captop)"/>' +
      knurl(132, 268, 158, 30, "#3f6b4d", 0.32) +
      /* the cap's lower lip and the shadow it drops onto the shoulder */
      '<path d="M126 178h148v8q0 6-6 6H132q-6 0-6-6Z" fill="#0d1f15" opacity=".55"/>' +
      '<ellipse cx="200" cy="194" rx="72" ry="7" fill="#0a1710" opacity=".4" filter="url(#hpB2)"/>' +
      '<path d="' + arc(140, 260, 174, 3) + '" fill="none" stroke="' + prof.color +
        '" stroke-width="3.4" opacity=".95"/>' +
      sunMark(200, 160, 0.86, "#c98a5c") +
      /* rim light down the left of the cap */
      '<path d="M126 155q0-18 9-18v52q-9 0-9-9Z" fill="' + LIGHT + '" opacity=".16"/>';

    var after =
      /* caustic: light focused through the glass onto the surface */
      '<ellipse cx="' + (CX + 6) + '" cy="' + (BOT + 4) + '" rx="52" ry="8" fill="#fff3d4" ' +
        'opacity=".4" filter="url(#hpB5)"/>';

    var defs =
      '<clipPath id="' + id + 'clip"><path d="' + JAR + '"/></clipPath>' +
      cylinder(id + "cap", "#1e3a2a", 0.9) +
      '<linearGradient id="' + id + 'captop" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + LIGHT + '" stop-opacity=".3"/>' +
        '<stop offset=".5" stop-color="' + LIGHT + '" stop-opacity=".04"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>' +
      /* glass: bright turning edges, darker body, bounce on the far side */
      '<linearGradient id="' + id + 'glass" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#0e1a12" stop-opacity=".5"/>' +
        '<stop offset=".05" stop-color="#dfe9dc" stop-opacity=".34"/>' +
        '<stop offset=".14" stop-color="#fff" stop-opacity=".05"/>' +
        '<stop offset=".55" stop-color="#0e1a12" stop-opacity=".05"/>' +
        '<stop offset=".86" stop-color="#0e1a12" stop-opacity=".2"/>' +
        '<stop offset=".95" stop-color="#dfe9dc" stop-opacity=".28"/>' +
        '<stop offset="1" stop-color="#0e1a12" stop-opacity=".55"/></linearGradient>' +
      /* refraction: contents crush and darken toward the turning edges */
      '<linearGradient id="' + id + 'refr" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#0b1409" stop-opacity=".72"/>' +
        '<stop offset=".1" stop-color="#0b1409" stop-opacity=".16"/>' +
        '<stop offset=".5" stop-color="#0b1409" stop-opacity="0"/>' +
        '<stop offset=".88" stop-color="#0b1409" stop-opacity=".26"/>' +
        '<stop offset="1" stop-color="#0b1409" stop-opacity=".76"/></linearGradient>' +
      '<linearGradient id="' + id + 'lbl" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fdf7ea"/><stop offset=".5" stop-color="#f6ecd6"/>' +
        '<stop offset="1" stop-color="#ece0c6"/></linearGradient>' +
      /* the wrap shading that makes the label read as curved paper */
      '<linearGradient id="' + id + 'wrap" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#3d2f18" stop-opacity=".55"/>' +
        '<stop offset=".1" stop-color="#3d2f18" stop-opacity=".16"/>' +
        '<stop offset=".22" stop-color="#fff" stop-opacity=".26"/>' +
        '<stop offset=".5" stop-color="#fff" stop-opacity=".02"/>' +
        '<stop offset=".84" stop-color="#3d2f18" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="#3d2f18" stop-opacity=".58"/></linearGradient>';

    return compose({ bare: o.bare,
      body: body, defs: defs, after: after,
      width: 80, tint: prof.wash, reflect: 58
    });
  }

  /* Fine vertical ridges — cap knurling, tin ribs, jar closures. */
  function knurl(x1, x2, y, h, color, op) {
    var s = '<g opacity="' + op + '">';
    for (var x = x1 + 3; x < x2 - 2; x += 5) {
      s += '<rect x="' + x + '" y="' + y + '" width="1.6" height="' + h + '" fill="' + color + '"/>';
      s += '<rect x="' + (x + 2) + '" y="' + y + '" width="1.2" height="' + h + '" fill="#0a1810"/>';
    }
    return s + "</g>";
  }

  /* ------------------------------------------------------------ Gummies */
  /* Matte rigid sleeve-and-drawer box, three-quarter view. Matte means
     broad soft falloff and no hard specular — the realism comes from the
     lit edges, the ambient occlusion in the corner, and paper grain. */
  function gummyBox(p, o) {
    o = o || {};
    var prof = HP.PROFILES[p.profile] || HP.PROFILES.hybrid;
    var id = nid();
    var c = prof.color;
    var strength = o.strength || "10 MG";
    var pack = o.pack || "10-PACK";

    /* Box corners: front face, plus top and right in slight axonometric. */
    var FL = 112, FR = 292, FT = 168, FB = 330;   /* front face */
    var DX = 26, DY = 24;                          /* depth offset */

    /* Translucent gummies catch light through their whole volume. */
    function gummy(x, y, s, rot) {
      var w = 27 * s;
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">' +
        '<ellipse cx="' + w / 2 + '" cy="' + (w + 4) + '" rx="' + w * 0.6 +
          '" ry="4.5" fill="#2b1c0c" opacity=".34" filter="url(#hpB2)"/>' +
        '<rect width="' + w + '" height="' + w + '" rx="' + 6 * s + '" fill="' + c + '"/>' +
        '<rect width="' + w + '" height="' + w + '" rx="' + 6 * s +
          '" fill="url(#' + id + 'gumV)"/>' +
        /* sugar-frosted faces plus a wet highlight on the top-left corner */
        '<rect x="' + w * 0.12 + '" y="' + w * 0.1 + '" width="' + w * 0.34 + '" height="' + w * 0.2 +
          '" rx="' + 2.5 * s + '" fill="#fff" opacity=".42" filter="url(#hpB1)"/>' +
        '<rect width="' + w + '" height="' + w + '" rx="' + 6 * s +
          '" fill="none" stroke="' + shade(c, 0.45) + '" stroke-width="' + 0.9 * s + '" opacity=".5"/>' +
        "</g>";
    }

    var body =
      /* right face */
      '<path d="M' + FR + " " + FT + "L" + (FR + DX) + " " + (FT - DY) + "L" + (FR + DX) + " " +
        (FB - DY) + "L" + FR + " " + FB + 'Z" fill="url(#' + id + 'side)"/>' +
      /* top face */
      '<path d="M' + FL + " " + FT + "L" + (FL + DX) + " " + (FT - DY) + "L" + (FR + DX) + " " +
        (FT - DY) + "L" + FR + " " + FT + 'Z" fill="url(#' + id + 'top)"/>' +
      /* front face */
      '<rect x="' + FL + '" y="' + FT + '" width="' + (FR - FL) + '" height="' + (FB - FT) +
        '" fill="url(#' + id + 'front)"/>' +

      /* full-width profile stripe — the family cue, wrapping onto the side */
      '<rect x="' + FL + '" y="252" width="' + (FR - FL) + '" height="36" fill="' + c + '"/>' +
      '<rect x="' + FL + '" y="252" width="' + (FR - FL) + '" height="36" fill="url(#' + id + 'stripe)"/>' +
      '<path d="M' + FR + " 252L" + (FR + DX) + " 228L" + (FR + DX) + " 264L" + FR + ' 288Z" fill="' +
        shade(c, -0.28) + '"/>' +

      /* lit edges: the die-cut corners catch the key light */
      '<path d="M' + FL + " " + FT + "L" + (FR + 0.5) + " " + FT + '" stroke="' + LIGHT +
        '" stroke-width="1.6" opacity=".55"/>' +
      '<path d="M' + FL + " " + FT + "L" + (FL + DX) + " " + (FT - DY) + '" stroke="' + LIGHT +
        '" stroke-width="1.4" opacity=".4"/>' +
      '<path d="M' + FR + " " + FT + "L" + FR + " " + FB + '" stroke="#2c2312" stroke-width="1.4" opacity=".3"/>' +
      /* ambient occlusion where the faces meet and along the base */
      '<rect x="' + (FR - 16) + '" y="' + FT + '" width="16" height="' + (FB - FT) +
        '" fill="url(#' + id + 'ao)"/>' +
      '<rect x="' + FL + '" y="' + (FB - 22) + '" width="' + (FR - FL) +
        '" height="22" fill="url(#' + id + 'aoB)"/>' +

      /* front copy */
      sunMark(202, 196, 0.95, "#a85c33") +
      '<text x="202" y="219" text-anchor="middle" font-family="Jost, sans-serif" font-size="7.4" ' +
        'letter-spacing="3.4" fill="#a85c33">HIGH PIE</text>' +
      '<text x="202" y="241" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="18" font-weight="600" fill="#16291d">' +
        esc(fit(p.name.replace(/ Gummies$/, ""), 15)) + "</text>" +
      '<text x="202" y="271" text-anchor="middle" font-family="Jost, sans-serif" font-size="9.4" ' +
        'letter-spacing="4.6" fill="#fdf6e8">' + esc(prof.label.toUpperCase()) + "</text>" +
      '<text x="202" y="282" text-anchor="middle" font-family="Jost, sans-serif" font-size="6.2" ' +
        'letter-spacing="2.4" fill="#fdf6e8" opacity=".8">THC</text>' +
      '<rect x="146" y="298" width="112" height="24" rx="3" fill="none" stroke="#a85c33" ' +
        'stroke-width="1.1" opacity=".6"/>' +
      '<text x="202" y="309" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="11" font-weight="600" fill="#16291d">' + esc(strength) + " PER PIECE</text>" +
      '<text x="202" y="318" text-anchor="middle" font-family="Jost, sans-serif" font-size="6" ' +
        'letter-spacing="2" fill="#5f6d5c">' + esc(pack) + "</text>" +
      /* debossed drawer tabs */
      '<circle cx="' + FL + '" cy="215" r="3.6" fill="#c3ae8a"/>' +
      '<circle cx="' + FL + '" cy="215" r="3.6" fill="none" stroke="#fff" stroke-width=".8" opacity=".4"/>' +
      '<circle cx="' + FR + '" cy="215" r="3.6" fill="#b9a37e"/>' +

      /* uncoated stock has visible tooth */
      '<rect x="' + FL + '" y="' + FT + '" width="' + (FR - FL) + '" height="' + (FB - FT) +
        '" fill="url(#hpGrain)" opacity=".13" style="mix-blend-mode:multiply"/>' +

      gummy(122, 320, 1, -8) + gummy(158, 330, 0.94, 6) + gummy(258, 326, 0.9, -3);

    var defs =
      panel(id + "front", "#f0e4cb", 0.85) +
      panel(id + "top", "#f8efdb", 0.5) +
      '<linearGradient id="' + id + 'side" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#c9b795"/><stop offset="1" stop-color="#a8946f"/></linearGradient>' +
      '<linearGradient id="' + id + 'stripe" x1="0" y1="0" x2=".6" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".16"/>' +
        '<stop offset=".6" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>' +
      '<linearGradient id="' + id + 'ao" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2c2312" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#2c2312" stop-opacity=".22"/></linearGradient>' +
      '<linearGradient id="' + id + 'aoB" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#2c2312" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#2c2312" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="' + id + 'gumV" x1="0" y1="0" x2=".5" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".5"/>' +
        '<stop offset=".45" stop-color="#fff" stop-opacity=".06"/>' +
        '<stop offset="1" stop-color="#2a1408" stop-opacity=".34"/></linearGradient>';

    return compose({ bare: o.bare, body: body, defs: defs, width: 96, tint: prof.wash, cx: 206, reflect: 46 });
  }

  /* ------------------------------------------------------------ RSO */
  function rsoSyringe(p, o) {
    o = o || {};
    var prof = HP.PROFILES[(o.profile || p.profile)] || HP.PROFILES.hybrid;
    var isCbd = p.cannabinoid === "cbd";
    var id = nid();
    var oil = isCbd ? "#8a5520" : "#33200f";

    var body =
      /* fitted drawer carton, standing */
      '<g>' +
        '<path d="M232 122 254 102h44v206l-22 20h-44Z" fill="' + shade("#11271b", -0.4) + '"/>' +
        '<rect x="232" y="122" width="64" height="222" rx="2" fill="url(#' + id + 'carton)"/>' +
        '<path d="M232 122 254 102h44l-22 20Z" fill="url(#' + id + 'lid)"/>' +
        '<path d="M232 122h64" stroke="' + LIGHT + '" stroke-width="1.2" opacity=".35"/>' +
        '<rect x="232" y="198" width="64" height="5" fill="' + prof.color + '"/>' +
        '<rect x="278" y="122" width="18" height="222" fill="url(#' + id + 'cartonAO)"/>' +
        sunMark(264, 150, 0.78, "#d3a02c") +
        '<text x="264" y="172" text-anchor="middle" font-family="Jost, sans-serif" font-size="6.4" ' +
          'letter-spacing="2.8" fill="#d3a02c">HIGH PIE</text>' +
        '<text x="264" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
          'font-size="15" font-weight="600" fill="#f7efdf">RSO</text>' +
        '<text x="264" y="218" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" ' +
          'letter-spacing="3" fill="#f7efdf">' + (isCbd ? "CBD" : "THC") + "</text>" +
        '<text x="264" y="234" text-anchor="middle" font-family="Jost, sans-serif" font-size="6" ' +
          'letter-spacing="1.8" fill="#f7efdf" opacity=".6">1 G · FULL</text>' +
        '<text x="264" y="244" text-anchor="middle" font-family="Jost, sans-serif" font-size="6" ' +
          'letter-spacing="1.8" fill="#f7efdf" opacity=".6">SPECTRUM</text>' +
        '<rect x="246" y="260" width="36" height="36" rx="2" fill="#f7efdf" opacity=".93"/>' +
        qrBlock(249, 263, 30, p.id + (isCbd ? "c" : "t")) +
        '<text x="264" y="310" text-anchor="middle" font-family="Jost, sans-serif" font-size="5" ' +
          'letter-spacing="1.4" fill="#f7efdf" opacity=".5">SCAN FOR COA</text>' +
        '<rect x="232" y="122" width="64" height="222" fill="url(#hpGrain)" opacity=".12" ' +
          'style="mix-blend-mode:overlay"/>' +
      "</g>" +

      /* luer-lock glass applicator leaning across the front */
      '<g transform="rotate(-18 168 250)">' +
        '<rect x="150" y="318" width="36" height="8" rx="4" fill="url(#' + id + 'plas)"/>' +
        '<rect x="164" y="288" width="8" height="34" fill="url(#' + id + 'plas)"/>' +
        /* barrel */
        '<rect x="152" y="150" width="32" height="142" rx="4" fill="#eef3ec"/>' +
        '<rect x="155" y="158" width="26" height="130" rx="3" fill="url(#' + id + 'oil)"/>' +
        /* the extract is glossy — a soft sheen down its length */
        '<rect x="159" y="162" width="6" height="120" rx="3" fill="' + LIGHT +
          '" opacity=".22" filter="url(#hpB1)"/>' +
        '<rect x="152" y="150" width="32" height="142" rx="4" fill="url(#' + id + 'tube)"/>' +
        '<g stroke="#16291d" stroke-width="1" opacity=".45">' +
          '<path d="M177 168h6M177 181h4M177 194h6M177 207h4M177 220h6M177 233h4M177 246h6M177 259h4M177 272h6"/>' +
        "</g>" +
        '<rect x="144" y="288" width="48" height="8" rx="4" fill="url(#' + id + 'plas)"/>' +
        '<path d="M160 150h16v-12h-16Z" fill="#dcd6c6"/>' +
        '<rect x="163" y="124" width="10" height="16" rx="2" fill="' + prof.color + '"/>' +
        '<rect x="163" y="124" width="4" height="16" rx="2" fill="#fff" opacity=".3"/>' +
        '<rect x="152" y="150" width="32" height="142" rx="4" fill="none" stroke="#b9c4b4" stroke-width="1.2"/>' +
        /* wrapped label with its own curvature shading */
        '<rect x="152" y="198" width="32" height="34" fill="#f7efdf"/>' +
        '<rect x="152" y="198" width="32" height="2" fill="' + prof.color + '"/>' +
        '<text x="168" y="212" text-anchor="middle" font-family="Jost, sans-serif" font-size="5" ' +
          'letter-spacing="1" fill="#a85c33">HIGH PIE</text>' +
        '<text x="168" y="224" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
          'font-size="9" font-weight="600" fill="#16291d">' + (isCbd ? "CBD" : "THC") + "</text>" +
        '<rect x="152" y="198" width="32" height="34" fill="url(#' + id + 'tube)" opacity=".7"/>' +
      "</g>";

    var defs =
      cylinder(id + "carton", "#183024", 0.85) +
      '<linearGradient id="' + id + 'lid" x1="0" y1="0" x2=".4" y2="1">' +
        '<stop offset="0" stop-color="#39604a"/><stop offset="1" stop-color="#20402e"/></linearGradient>' +
      '<linearGradient id="' + id + 'cartonAO" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>' +
      cylinder(id + "oil", oil, 0.75) +
      cylinder(id + "plas", "#e6e0d0", 0.7) +
      '<linearGradient id="' + id + 'tube" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#0e1a12" stop-opacity=".28"/>' +
        '<stop offset=".07" stop-color="#fff" stop-opacity=".62"/>' +
        '<stop offset=".22" stop-color="#fff" stop-opacity=".05"/>' +
        '<stop offset=".7" stop-color="#0e1a12" stop-opacity=".1"/>' +
        '<stop offset=".9" stop-color="#0e1a12" stop-opacity=".2"/>' +
        '<stop offset=".97" stop-color="#fff" stop-opacity=".38"/>' +
        '<stop offset="1" stop-color="#0e1a12" stop-opacity=".3"/></linearGradient>';

    return compose({ bare: o.bare, body: body, defs: defs, width: 92, tint: prof.wash, cx: 214, reflect: 54 });
  }

  /* ------------------------------------------------------------ Pre-rolls */
  function prerollTin(p, o) {
    var prof = HP.PROFILES[p.profile] || HP.PROFILES.hybrid;
    var id = nid();

    function joint(x, y, rot) {
      return '<g transform="rotate(' + rot + " " + x + " " + y + ')">' +
        '<rect x="' + x + '" y="' + (y + 13) + '" width="104" height="5" rx="2.5" fill="#2b1c0c" ' +
          'opacity=".3" filter="url(#hpB2)"/>' +
        '<rect x="' + x + '" y="' + y + '" width="104" height="13" rx="6.5" fill="url(#' + id + 'paper)"/>' +
        '<rect x="' + x + '" y="' + y + '" width="25" height="13" rx="6.5" fill="url(#' + id + 'tip)"/>' +
        '<rect x="' + (x + 96) + '" y="' + (y + 1.5) + '" width="8" height="10" rx="4" fill="#3f4d32"/>' +
        '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="100" height="3" rx="1.5" fill="#fff" ' +
          'opacity=".3" filter="url(#hpB1)"/>' +
        "</g>";
    }

    var body =
      /* tin: metal, so sharper doubled speculars and crisp lit edges */
      '<path d="M300 156 328 128v122l-28 28Z" fill="' + shade("#14291f", -0.4) + '"/>' +
      '<path d="M86 156 114 128h214l-28 28Z" fill="url(#' + id + 'lid)"/>' +
      '<rect x="86" y="156" width="214" height="122" rx="11" fill="url(#' + id + 'tin)"/>' +
      /* lid seam and the shadow the lid drops on the base */
      '<rect x="86" y="234" width="214" height="1.4" fill="' + LIGHT + '" opacity=".22"/>' +
      '<rect x="86" y="235" width="214" height="5" fill="#000" opacity=".28"/>' +
      '<path d="M86 156h214" stroke="' + LIGHT + '" stroke-width="1.6" opacity=".5"/>' +
      '<path d="M86 156 114 128" stroke="' + LIGHT + '" stroke-width="1.3" opacity=".35"/>' +
      '<rect x="284" y="156" width="16" height="122" fill="url(#' + id + 'ao)"/>' +
      /* debossed copper frame */
      '<rect x="98" y="166" width="190" height="62" rx="4" fill="none" stroke="#a8683f" ' +
        'stroke-width="1.1" opacity=".7"/>' +
      '<rect x="98.8" y="166.8" width="190" height="62" rx="4" fill="none" stroke="#000" ' +
        'stroke-width=".8" opacity=".3"/>' +
      '<rect x="86" y="256" width="214" height="8" fill="' + prof.color + '"/>' +
      '<rect x="86" y="256" width="214" height="8" fill="url(#' + id + 'railS)"/>' +
      sunMark(193, 188, 0.92, "#d3a02c") +
      '<text x="193" y="208" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" ' +
        'letter-spacing="3.2" fill="#d3a02c">HIGH PIE</text>' +
      '<text x="193" y="223" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="12.5" font-weight="600" fill="#f7efdf">SUNDIAL</text>' +
      '<text x="193" y="250" text-anchor="middle" font-family="Jost, sans-serif" font-size="7.6" ' +
        'letter-spacing="3.4" fill="#f7efdf" opacity=".85">' + esc(prof.label.toUpperCase()) +
        " · PRE-ROLLS</text>" +
      '<text x="193" y="274" text-anchor="middle" font-family="Jost, sans-serif" font-size="6.6" ' +
        'letter-spacing="2" fill="#f7efdf" opacity=".6">' +
        esc(fit(p.name.replace(/^Sundial Pre-Rolls — /, ""), 22)) + "</text>" +
      joint(100, 300, -6) + joint(92, 318, -3);

    var defs =
      metal(id + "tin", "#1b3527") +
      '<linearGradient id="' + id + 'lid" x1="0" y1="0" x2=".5" y2="1">' +
        '<stop offset="0" stop-color="#437052"/><stop offset=".5" stop-color="#2c5039"/>' +
        '<stop offset="1" stop-color="#1d3b2a"/></linearGradient>' +
      '<linearGradient id="' + id + 'ao" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>' +
      '<linearGradient id="' + id + 'railS" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".28"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>' +
      cylinder(id + "paper", "#efe6d2", 0.55) +
      cylinder(id + "tip", "#c2a274", 0.55);

    return compose({ bare: o.bare, body: body, defs: defs, width: 106, tint: prof.wash, cx: 200, reflect: 40 });
  }

  /* ------------------------------------------------------------ Shake */
  function shakePouch(p, o) {
    o = o || {};
    var prof = HP.PROFILES[p.profile] || HP.PROFILES.hybrid;
    var id = nid();
    var rand = rng(p.id);

    var cols = p.profile === "indica"
      ? ["#4b4260", "#3a3350", "#554a6b"]
      : p.profile === "sativa"
      ? ["#6d8a38", "#5a7430", "#7b9945"]
      : ["#5c7a34", "#4a6529", "#6b8a40"];

    var bits = "";
    for (var i = 0; i < 150; i++) {
      var x = 164 + rand() * 74, y = 210 + rand() * 74;
      var r = 2.2 + rand() * 5;
      bits += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + r.toFixed(1) +
        '" ry="' + (r * 0.7).toFixed(1) + '" fill="' + cols[(rand() * 3) | 0] +
        '" transform="rotate(' + (rand() * 360).toFixed(0) + " " + x.toFixed(1) + " " +
        y.toFixed(1) + ')" opacity="' + (0.8 + rand() * 0.2).toFixed(2) + '"/>';
    }
    for (var t = 0; t < 30; t++) {
      bits += '<circle cx="' + (164 + rand() * 74).toFixed(1) + '" cy="' + (210 + rand() * 74).toFixed(1) +
        '" r="' + (0.5 + rand() * 1).toFixed(1) + '" fill="#f2ffe0" opacity="' +
        (0.25 + rand() * 0.4).toFixed(2) + '"/>';
    }

    var body =
      /* stand-up pouch: soft-sided, so the form is read through creases */
      '<path d="M116 112q0-8 8-8h152q8 0 8 8v206q0 14-16 18-56 12-136 0-16-3-16-18Z" ' +
        'fill="url(#' + id + 'kraft)"/>' +
      /* creases running down the face */
      '<path d="M150 118q6 100 2 210" stroke="#000" stroke-width="6" opacity=".05" fill="none" filter="url(#hpB2)"/>' +
      '<path d="M252 118q-8 100-4 210" stroke="#000" stroke-width="8" opacity=".07" fill="none" filter="url(#hpB2)"/>' +
      '<path d="M132 120q4 100 0 208" stroke="#fff" stroke-width="7" opacity=".13" fill="none" filter="url(#hpB2)"/>' +
      /* crimped top seal */
      '<rect x="116" y="104" width="168" height="18" fill="url(#' + id + 'seal)"/>' +
      '<g stroke="#9c8763" stroke-width="1.4" opacity=".45">' +
        '<path d="M124 108v10M134 108v10M144 108v10M154 108v10M164 108v10M174 108v10M184 108v10M194 108v10M204 108v10M214 108v10M224 108v10M234 108v10M244 108v10M254 108v10M264 108v10M274 108v10"/>' +
      "</g>" +
      '<rect x="116" y="120" width="168" height="4" fill="#000" opacity=".14" filter="url(#hpB1)"/>' +

      sunMark(200, 152, 0.9, "#a85c33") +
      '<text x="200" y="172" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" ' +
        'letter-spacing="3.2" fill="#a85c33">HIGH PIE</text>' +
      '<text x="200" y="194" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="17" font-weight="600" fill="#16291d">' +
        esc(fit(p.name.replace(" Shake", ""), 14)) + "</text>" +
      '<text x="200" y="206" text-anchor="middle" font-family="Jost, sans-serif" font-size="7.2" ' +
        'letter-spacing="3.6" fill="' + prof.ink + '">SHAKE</text>' +

      /* die-cut window, recessed behind film */
      '<rect x="159" y="205" width="84" height="84" rx="6" fill="#9d8760"/>' +
      '<rect x="161" y="207" width="80" height="80" rx="5" fill="#0d1408"/>' +
      '<g clip-path="url(#' + id + 'win)"><rect x="164" y="210" width="74" height="74" fill="#222c18"/>' +
        bits +
        '<rect x="164" y="210" width="74" height="74" fill="url(#' + id + 'winShade)"/>' +
      "</g>" +
      /* the film over the window has its own sheen */
      '<path d="M164 210h74v30l-74 22Z" fill="#fff" opacity=".1"/>' +
      '<rect x="164" y="210" width="74" height="74" rx="4" fill="none" stroke="#000" ' +
        'stroke-width="1.2" opacity=".35"/>' +

      '<rect x="140" y="302" width="120" height="22" rx="3" fill="' + prof.color + '"/>' +
      '<rect x="140" y="302" width="120" height="22" rx="3" fill="url(#' + id + 'railS)"/>' +
      '<text x="200" y="317" text-anchor="middle" font-family="Jost, sans-serif" font-size="8" ' +
        'letter-spacing="3" fill="#fdf6e8">' + esc(prof.label.toUpperCase()) + " · 1 OZ</text>" +
      '<path d="M116 112q0-8 8-8h152q8 0 8 8v206q0 14-16 18-56 12-136 0-16-3-16-18Z" ' +
        'fill="url(#hpGrain)" opacity=".16" style="mix-blend-mode:multiply"/>';

    var defs =
      '<clipPath id="' + id + 'win"><rect x="164" y="210" width="74" height="74" rx="4"/></clipPath>' +
      cylinder(id + "kraft", "#dbc59d", 0.7) +
      '<linearGradient id="' + id + 'seal" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#b9a179"/><stop offset=".2" stop-color="#d3bd95"/>' +
        '<stop offset=".8" stop-color="#bda787"/><stop offset="1" stop-color="#a08a66"/></linearGradient>' +
      '<radialGradient id="' + id + 'winShade" cx=".4" cy=".3" r=".8">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".1"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>' +
      '<linearGradient id="' + id + 'railS" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".24"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>';

    return compose({ bare: o.bare, body: body, defs: defs, width: 86, tint: prof.wash, reflect: 46, lift: 4 });
  }

  /* ------------------------------------------------------------ Topical */
  /* Amber PET. Light passes through the wall, so the glass glows where it
     is thin and goes deep where it is thick. */
  function salveJar(p, o) {
    o = o || {};
    var id = nid();
    var LT = 226, LH = 100, SAG = 5;

    var body =
      '<path d="M104 213q0-13 13-13h166q13 0 13 13v117q0 14-96 14t-96-14Z" fill="url(#' + id + 'amber)"/>' +
      /* light transmitting through the base */
      '<ellipse cx="200" cy="334" rx="76" ry="11" fill="#f0b45c" opacity=".4" filter="url(#hpB5)"/>' +
      '<path d="M104 213q0-13 13-13h166q13 0 13 13v117q0 14-96 14t-96-14Z" fill="url(#' + id + 'amberV)"/>' +

      /* cap: ribbed polypropylene, seen slightly from above */
      '<path d="M96 152q0-10 10-10h188q10 0 10 10v46q0 6-6 6H102q-6 0-6-6Z" fill="url(#' + id + 'cap)"/>' +
      '<ellipse cx="200" cy="152" rx="104" ry="12" fill="' + shade("#1d3a2b", 0.28) + '"/>' +
      '<ellipse cx="200" cy="152" rx="104" ry="12" fill="url(#' + id + 'captop)"/>' +
      knurl(102, 298, 164, 34, "#3f6b4d", 0.34) +
      '<path d="M96 190h208v8q0 6-6 6H102q-6 0-6-6Z" fill="#0d1f15" opacity=".5"/>' +
      '<ellipse cx="200" cy="206" rx="98" ry="8" fill="#0a1710" opacity=".4" filter="url(#hpB2)"/>' +
      sunMark(200, 168, 1.05, "#d3a02c") +
      '<path d="M96 162q0-20 10-20v56q-10 0-10-10Z" fill="' + LIGHT + '" opacity=".14"/>' +

      /* label, bowed onto the cylinder */
      '<path d="' + band(118, 282, LT, LH, SAG) + '" fill="url(#' + id + 'lbl)"/>' +
      '<path d="' + arc(118, 282, LT, SAG) + '" fill="none" stroke="#6e5477" stroke-width="3.4"/>' +
      '<path d="' + arc(118, 282, LT + LH, SAG) + '" fill="none" stroke="#6e5477" stroke-width="3.2" opacity=".5"/>' +
      '<text x="200" y="' + (LT + 21) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
        'font-size="7.4" letter-spacing="3.4" fill="#a85c33">HIGH PIE</text>' +
      '<path d="' + arc(150, 250, LT + 27, 2) + '" stroke="#d9cbaf" stroke-width="1" fill="none"/>' +
      '<text x="200" y="' + (LT + 48) + '" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="21" font-weight="600" fill="#16291d">RELIEF</text>' +
      '<text x="200" y="' + (LT + 62) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
        'font-size="7.6" letter-spacing="4" fill="#6e5477">SALVE</text>' +
      '<path d="' + band(140, 260, LT + 70, 22, 3) + '" fill="#6e5477"/>' +
      '<text x="200" y="' + (LT + 84) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
        'font-size="6.8" letter-spacing=".7" fill="#f7efdf">3000MG CBD · 500MG THC</text>' +
      '<text x="200" y="' + (LT + 92.5) + '" text-anchor="middle" font-family="Jost, sans-serif" ' +
        'font-size="5.6" letter-spacing="2" fill="#f7efdf" opacity=".72">2 OZ · 56 G</text>' +
      '<path d="' + band(118, 282, LT, LH, SAG) + '" fill="url(#' + id + 'wrap)"/>' +

      /* specular streaks on the glass, over the label */
      '<rect x="113" y="208" width="13" height="128" rx="6.5" fill="' + LIGHT +
        '" opacity=".34" filter="url(#hpB1)"/>' +
      '<rect x="278" y="216" width="7" height="112" rx="3.5" fill="' + LIGHT +
        '" opacity=".2" filter="url(#hpB1)"/>' +
      '<path d="M104 213q0-13 13-13h166q13 0 13 13v117q0 14-96 14t-96-14Z" fill="none" stroke="#5e360f" ' +
        'stroke-width="1.2" opacity=".4"/>';

    var defs =
      cylinder(id + "amber", "#96591a", 1.15) +
      '<linearGradient id="' + id + 'amberV" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000" stop-opacity=".22"/>' +
        '<stop offset=".4" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#ffb95e" stop-opacity=".2"/></linearGradient>' +
      cylinder(id + "cap", "#1d3a2b", 0.9) +
      '<linearGradient id="' + id + 'captop" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + LIGHT + '" stop-opacity=".3"/>' +
        '<stop offset=".5" stop-color="' + LIGHT + '" stop-opacity=".04"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>' +
      '<linearGradient id="' + id + 'lbl" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fdf7ea"/><stop offset=".5" stop-color="#f6ecd6"/>' +
        '<stop offset="1" stop-color="#ece0c6"/></linearGradient>' +
      '<linearGradient id="' + id + 'wrap" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#3d2f18" stop-opacity=".5"/>' +
        '<stop offset=".12" stop-color="#3d2f18" stop-opacity=".12"/>' +
        '<stop offset=".24" stop-color="#fff" stop-opacity=".24"/>' +
        '<stop offset=".55" stop-color="#fff" stop-opacity=".02"/>' +
        '<stop offset=".86" stop-color="#3d2f18" stop-opacity=".2"/>' +
        '<stop offset="1" stop-color="#3d2f18" stop-opacity=".52"/></linearGradient>';

    return compose({ bare: o.bare, body: body, defs: defs, width: 100, tint: "#ebe6db", reflect: 52 });
  }

  /* ------------------------------------------------------------ Bundles */
  function bundleBox(p, o) {
    o = o || {};
    var prof = HP.PROFILES[p.profile] || HP.PROFILES.hybrid;
    var id = nid();
    var stripes = ["#d2551f", "#c98a1e", "#e9d1b8", "#7c9a3f", "#2f6f69"];
    var w = "";
    for (var i = 0; i < stripes.length; i++) {
      w += '<path d="M78 ' + (266 + i * 13) + 'q60 -16 122 -4t122 -8v14q-60 -4 -122 8t-122 4Z" fill="' +
        stripes[i] + '" opacity=".95"/>';
    }

    var FL = 78, FR = 322, FT = 168, FB = 318, DX = 26, DY = 26;

    var body =
      '<path d="M' + FR + " " + FT + "L" + (FR + DX) + " " + (FT - DY) + "L" + (FR + DX) + " " +
        (FB - DY) + "L" + FR + " " + FB + 'Z" fill="url(#' + id + 'side)"/>' +
      '<path d="M' + FL + " " + FT + "L" + (FL + DX) + " " + (FT - DY) + "L" + (FR + DX) + " " +
        (FT - DY) + "L" + FR + " " + FT + 'Z" fill="url(#' + id + 'top)"/>' +
      '<rect x="' + FL + '" y="' + FT + '" width="' + (FR - FL) + '" height="' + (FB - FT) +
        '" rx="2" fill="url(#' + id + 'front)"/>' +
      '<g clip-path="url(#' + id + 'face)">' + w + "</g>" +

      '<path d="M' + FL + " " + FT + "L" + FR + " " + FT + '" stroke="' + LIGHT +
        '" stroke-width="1.6" opacity=".5"/>' +
      '<rect x="' + (FR - 18) + '" y="' + FT + '" width="18" height="' + (FB - FT) +
        '" fill="url(#' + id + 'ao)"/>' +
      '<rect x="' + FL + '" y="' + (FB - 20) + '" width="' + (FR - FL) +
        '" height="20" fill="url(#' + id + 'aoB)"/>' +

      sunMark(200, 206, 1.1, "#a85c33") +
      '<text x="200" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
        'font-size="25" font-weight="700" letter-spacing="1" fill="#16291d">HIGH PIE</text>' +
      '<path d="M140 242h23" stroke="#a85c33" stroke-width="1.2"/>' +
      '<text x="200" y="246" text-anchor="middle" font-family="Jost, sans-serif" font-size="8.6" ' +
        'letter-spacing="5" fill="#a85c33">HEMP</text>' +
      '<path d="M237 242h23" stroke="#a85c33" stroke-width="1.2"/>' +
      '<text x="200" y="338" text-anchor="middle" font-family="Jost, sans-serif" font-size="7.4" ' +
        'letter-spacing="3.4" fill="#7d8a79">CANNABIS. CURATED. CONSCIOUS.</text>' +

      '<circle cx="298" cy="294" r="19" fill="' + prof.color + '"/>' +
      '<circle cx="298" cy="294" r="19" fill="url(#' + id + 'sealS)"/>' +
      '<circle cx="298" cy="294" r="19" fill="none" stroke="#f7efdf" stroke-width="1" opacity=".45"/>' +
      '<text x="298" y="297" text-anchor="middle" font-family="Jost, sans-serif" font-size="6.6" ' +
        'letter-spacing="1.2" fill="#fdf6e8">' + esc(prof.label.toUpperCase()) + "</text>" +

      '<rect x="' + FL + '" y="' + FT + '" width="' + (FR - FL) + '" height="' + (FB - FT) +
        '" fill="url(#hpGrain)" opacity=".15" style="mix-blend-mode:multiply"/>';

    var defs =
      '<clipPath id="' + id + 'face"><rect x="' + FL + '" y="' + FT + '" width="' + (FR - FL) +
        '" height="' + (FB - FT) + '" rx="2"/></clipPath>' +
      panel(id + "front", "#dfcba4", 0.8) +
      panel(id + "top", "#eddcbb", 0.5) +
      '<linearGradient id="' + id + 'side" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#bda684"/><stop offset="1" stop-color="#9c8763"/></linearGradient>' +
      '<linearGradient id="' + id + 'ao" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2c2312" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#2c2312" stop-opacity=".24"/></linearGradient>' +
      '<linearGradient id="' + id + 'aoB" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#2c2312" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#2c2312" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="' + id + 'sealS" x1="0" y1="0" x2=".5" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>';

    return compose({ bare: o.bare, body: body, defs: defs, width: 130, tint: prof.wash, reflect: 40 });
  }

  var RENDERERS = {
    "flower-jar": flowerJar,
    "gummy-box": gummyBox,
    "rso-syringe": rsoSyringe,
    "preroll-tin": prerollTin,
    "shake-pouch": shakePouch,
    "salve-jar": salveJar,
    "bundle-box": bundleBox
  };

  /* `opts` lets the PDP re-render the packshot as the shopper changes
     variant — the jar label picks up the size, the box picks up the dose. */
  A.packshot = function (product, opts) {
    var fn = RENDERERS[product && product.art] || bundleBox;
    return fn(product, opts || {});
  };

  /* Category tiles reuse the packshot of a representative product. */
  A.categoryArt = function (cat) {
    var stub = { id: "cat-" + cat.key, name: cat.label, art: cat.art, profile: "hybrid", cannabinoid: "thc" };
    if (cat.key === "gummies") { stub.name = "Golden Hour"; stub.profile = "hybrid"; }
    if (cat.key === "flower") { stub.name = "Runtz"; }
    if (cat.key === "prerolls") { stub.name = "Sundial Pre-Rolls — Blue Dream"; }
    if (cat.key === "rso") { stub.name = "RSO"; }
    if (cat.key === "topicals") { stub.name = "Relief Salve"; stub.profile = "cbd"; }
    if (cat.key === "bundles") { stub.name = "Bundle"; }
    /* Tiles supply their own dark ground, so the studio backdrop is dropped. */
    return A.packshot(stub, { bare: true });
  };

  /* Hero composition: three packages staggered on a shared ground line. */
  A.heroScene = function () {
    var jar = HP.byId("runtz");
    var box = HP.byId("northern-lights-gummies");
    var tin = HP.byId("sundial-sativa");
    /* Cropped tight to the packages — each carries its own contact shadow, so
       a separate ground ellipse would read as a shadow they aren't standing on. */
    return '<svg viewBox="40 116 626 300" xmlns="http://www.w3.org/2000/svg" aria-label="High Pie packaging">' +
      '<g transform="translate(-24,86) scale(.78)">' +
        strip(A.packshot(box, { strength: "25 MG", pack: "10-PACK", bare: true })) + "</g>" +
      '<g transform="translate(392,80) scale(.8)">' +
        strip(A.packshot(tin, { bare: true })) + "</g>" +
      '<g transform="translate(196,10) scale(1.02)">' +
        strip(A.packshot(jar, { size: "1/8 OZ", bare: true })) + "</g>" +
      "</svg>";
  };

  /* Unwrap a packshot so it can be nested inside another <svg>. */
  function strip(svg) {
    return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  }
  A.strip = strip;

})(window);
