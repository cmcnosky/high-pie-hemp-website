/* ==========================================================================
   HIGH PIE — Catalog
   Single source of truth for brand strings, the profile color code, and every
   product + purchasable variant. Prices are integer cents.

   Flower price ladder is carried over verbatim from PACKAGING_SPEC.md
   ("Clear-glass flower and price ladder") as the Signature tier.
   ========================================================================== */
(function (root) {
  "use strict";

  var HP = (root.HP = root.HP || {});

  /* ---------------------------------------------------------------- Brand */
  HP.BRAND = {
    name: "High Pie",
    legal: "High Pie Hemp LLC",
    descriptor: "Hemp",
    tagline: "Cannabis. Curated. Conscious.",
    promise: "Elevated. Balanced. Everyday.",
    est: "2021",
    phone: "817-360-0687",
    phoneHref: "tel:+18173600687",
    email: "hello@highpiehemp.com",
    instagram: "@HighPieHemp",
    instagramUrl: "https://instagram.com/highpiehemp",
    assetVersion: "20260723-4",
    commerceEnabled: true,
    catalogStatus: "High Pie online store",
    freeShipThreshold: 7500, // cents
    flatShip: 795,
    taxRate: 0.0825
  };

  /* ------------------------------------------------- Profile color coding */
  /* These are the colours actually printed on the packaging in the product
     photography — burnt tangerine, aubergine, dusty rose, deep teal. The site
     matches the boxes rather than the other way round. */
  HP.PROFILES = {
    sativa: {
      key: "sativa",
      label: "Sativa",
      color: "#c76532",
      wash: "#f6ead9",
      ink: "#8f421c",
      arc: "Daybreak",
      line: "Energy. Clarity. Go."
    },
    hybrid: {
      key: "hybrid",
      label: "Hybrid",
      color: "#b76662",
      wash: "#f5e7e3",
      ink: "#8a423f",
      arc: "Golden Hour",
      line: "Balance. Breathe. Be well."
    },
    indica: {
      key: "indica",
      label: "Indica",
      color: "#70566f",
      wash: "#efe9ee",
      ink: "#513c59",
      arc: "Nightfall",
      line: "Rest. Recover. Recharge."
    },
    cbd: {
      key: "cbd",
      label: "CBD",
      color: "#2f6f69",
      wash: "#e3f0ec",
      ink: "#215049",
      arc: "Steady",
      line: "Relieve. Soothe. Restore."
    }
  };

  HP.CATEGORIES = [
    { key: "gummies", label: "Gummies", blurb: "Pectin gummies in three signature profiles", art: "gummy-box" },
    { key: "flower", label: "Flower", blurb: "Premium flower in clear-glass eighth jars", art: "flower-jar" },
    { key: "prerolls", label: "Pre-Rolls", blurb: "Whole-flower seven-packs in keepsake tins", art: "preroll-tin" },
    { key: "rso", label: "RSO", blurb: "Full-spectrum one-gram applicators", art: "rso-syringe" },
    { key: "topicals", label: "Topicals", blurb: "Full-spectrum botanical salve", art: "salve-jar" },
    { key: "bundles", label: "Bundles", blurb: "Curated multi-profile collections", art: "bundle-box" }
  ];

  /* --------------------------------------------------- Effect buckets */
  /* Products carry free-text effect words; these buckets are how first-time
     buyers actually shop ("something for sleep"). Shared by the shop facet
     and site search so the two can never disagree. */
  HP.EFFECT_BUCKETS = {
    sleep: ["sedating", "sleepy", "restful", "dreamy", "body-heavy", "evening", "heavy"],
    calm: ["calm", "relaxing", "easy", "gentle", "even", "balanced",
           "comforting", "forgiving", "warm", "present"],
    /* "euphoric" deliberately maps to no bucket: sedating indicas carry it
       too, and it would file the reference indica under Energy. */
    energy: ["energetic", "awake", "bright", "sharp", "alert", "uplifted",
             "talkative", "sociable"],
    focus: ["clear", "functional", "focused", "creative", "cerebral"],
    relief: ["targeted", "cooling", "body-calm", "anti-inflammatory",
             "restorative", "soothe", "fast", "body-forward"]
  };

  HP.bucketsOf = function (p) {
    var out = [];
    var effects = (p.effects || []).map(function (e) { return String(e).toLowerCase(); });
    Object.keys(HP.EFFECT_BUCKETS).forEach(function (k) {
      var wants = HP.EFFECT_BUCKETS[k];
      for (var i = 0; i < effects.length; i++) {
        if (wants.indexOf(effects[i]) > -1) { out.push(k); return; }
      }
    });
    return out;
  };

  /* ---------------------------------------------- Shipping restrictions */
  /* ONE source of truth: checkout blocks against this and the policies page
     renders from it, so the legal page and the blocker can never drift
     apart. Initial list — confirm with counsel before launch. */
  HP.RESTRICTED = {
    AK: "Alaska", CO: "Colorado", HI: "Hawaii", IA: "Iowa", ID: "Idaho",
    KS: "Kansas", LA: "Louisiana", MS: "Mississippi", MT: "Montana",
    NE: "Nebraska", ND: "North Dakota", NY: "New York", OR: "Oregon",
    RI: "Rhode Island", SD: "South Dakota", UT: "Utah", VT: "Vermont",
    WA: "Washington"
  };

  /* ------------------------------------------------------------- Helpers */
  function v(opts, price, extra) {
    var o = {
      opts: opts,
      price: price,
      stock: 24,
      sku: null,
      note: "",
      compare: 0,
      bulk: false
    };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    return o;
  }

  /* Flower ladders. Sizes are shared; only the price tier changes. */
  var FLOWER_SIZES = [
    { label: "1/8 oz", grams: "3.5 g", jar: "3 oz clear flint jar · 57 × 63 mm", bulk: false },
    { label: "1/4 oz", grams: "7 g", jar: "5 oz clear flint jar · 60 × 72.5 mm", bulk: false },
    { label: "1/2 oz", grams: "14 g", jar: "10 oz clear flint jar · 65.8 × 115.2 mm", bulk: false },
    { label: "1 oz", grams: "28 g", jar: "18 oz clear flint jar · 86 × 112.4 mm", bulk: false },
    { label: "1/4 lb", grams: "113.4 g", jar: "Presentation case · four 18 oz jars", bulk: true },
    { label: "1/2 lb", grams: "226.8 g", jar: "Presentation case · eight 18 oz jars", bulk: true },
    { label: "1 lb", grams: "453.6 g", jar: "Presentation case · sixteen 18 oz jars", bulk: true }
  ];

  var FLOWER_TIERS = {
    // Signature ladder = the pricing already set in PACKAGING_SPEC.md
    reserve: [4500, 8500, 15800, 27000, 84000, 129000, 180000],
    signature: [4000, 7500, 14000, 24000, 75000, 115000, 160000],
    everyday: [3200, 6000, 11200, 19200, 60000, 92000, 128000]
  };

  function flowerVariants(tier, skuBase) {
    return FLOWER_SIZES.map(function (s, i) {
      return v([s.label], FLOWER_TIERS[tier][i], {
        note: s.grams + " · " + s.jar,
        grams: s.grams,
        bulk: s.bulk,
        stock: s.bulk ? 6 : 30 - i * 3,
        sku: skuBase + "-" + s.label.replace(/[^0-9a-z]/gi, "").toUpperCase()
      });
    });
  }

  function flower(o) {
    return {
      id: o.id,
      name: o.name,
      category: "flower",
      profile: o.profile,
      cannabinoid: "thc",
      art: "flower-jar",
      photos: ["flower-" + o.id + "-a", "flower-" + o.id + "-b"].concat(o.macro || []),
      tier: o.tier,
      subtitle: HP.PROFILES[o.profile].label + " · " + o.nose,
      featured: !!o.featured,
      rating: o.rating,
      reviews: o.reviews,
      short: o.short,
      description: o.description,
      optionNames: ["Size"],
      variants: flowerVariants(o.tier, o.sku),
      potency: { thc: o.thc, cbd: o.cbd || "<0.3%", total: o.total },
      terpenes: o.terpenes,
      effects: o.effects,
      specs: {
        "Cultivar": o.name,
        "Profile": HP.PROFILES[o.profile].label,
        "Total THC": o.thc,
        "Total cannabinoids": o.total,
        "Grade": o.tier === "reserve" ? "Reserve — top-shelf indoor" : o.tier === "signature" ? "Signature — indoor" : "Everyday — indoor",
        "Cure": o.cure,
        "Nose": o.nose,
        "Packaging": "Clear flint glass, matte forest cap with copper top mark and profile ring",
        "Batch": o.batch
      },
      lab: { batch: o.batch, harvest: o.harvest, status: "Current" }
    };
  }

  /* Every gummy line shares one strength × pack-size matrix. The 2-piece and
     10-piece boxes are photographed separately, so the variant carries its
     own imagery and the gallery swaps as you change pack size. */
  function gummyVariants(skuBase, profile) {
    var rows = [
      ["10 mg", "2-pack", 900, "20 mg total"],
      ["10 mg", "10-pack", 3200, "100 mg total"],
      ["25 mg", "2-pack", 1300, "50 mg total"],
      ["25 mg", "10-pack", 4800, "250 mg total"],
      ["50 mg", "2-pack", 1800, "100 mg total"],
      ["50 mg", "10-pack", 6800, "500 mg total"]
    ];
    return rows.map(function (r) {
      var count = r[1] === "2-pack" ? "2" : "10";
      return v([r[0], r[1]], r[2], {
        note: r[3],
        stock: 48,
        photos: ["gummy-" + profile + "-" + count + "-a", "gummy-" + profile + "-" + count + "-b"],
        sku: skuBase + "-" + r[0].replace(" ", "") + "-" + r[1].replace("-pack", "PK").toUpperCase()
      });
    });
  }

  function gummy(o) {
    return {
      id: o.id,
      name: o.name,
      category: "gummies",
      profile: o.profile,
      cannabinoid: "thc",
      art: "gummy-box",
      photos: ["gummy-" + o.profile + "-10-a", "gummy-" + o.profile + "-10-b"],
      subtitle: HP.PROFILES[o.profile].label + " · " + o.flavor,
      featured: !!o.featured,
      rating: o.rating,
      reviews: o.reviews,
      short: o.short,
      description: o.description,
      optionNames: ["Strength", "Pack size"],
      variants: gummyVariants(o.sku, o.profile),
      potency: {
        thc: "10 · 25 · 50 mg per piece",
        cbd: "<0.5 mg per piece",
        total: "20 mg – 500 mg per box"
      },
      effects: o.effects,
      terpenes: o.terpenes,
      ingredients:
        "Cane sugar, tapioca syrup, filtered water, pectin, citric acid, natural " +
        o.flavor.toLowerCase() + " flavor, fruit and vegetable juice (color), full-spectrum " +
        "cannabis distillate, " + o.botanical + ".",
      specs: {
        "Format": "Pectin gummy, 4 g each",
        "Profile": HP.PROFILES[o.profile].label,
        "Flavor": o.flavor,
        "Botanical support": o.botanical,
        "Strengths": "10 mg · 25 mg · 50 mg THC per piece",
        "Counts": "2-piece pocket tin · 10-piece drawer box",
        "Packaging": "2-piece in a hinged pocket tin with a fitted two-well insert; 10-piece in a matte sleeve-and-drawer box with a ten-well food-contact tray",
        "Onset": "45–90 minutes",
        "Duration": "4–8 hours",
        "Batch": o.batch
      },
      lab: { batch: o.batch, harvest: o.harvest, status: "Current" }
    };
  }

  /* ------------------------------------------------------------ Products */
  HP.PRODUCTS = [

    /* ============================== GUMMIES ============================== */
    gummy({
      id: "jack-herer-gummies",
      name: "Jack Herer Gummies",
      profile: "sativa",
      sku: "HP-GUM-SAT",
      flavor: "Blood Orange & Ginger",
      botanical: "organic ginger root and L-theanine",
      featured: true,
      rating: 4.8,
      reviews: 214,
      batch: "HP-2607-DB",
      harvest: "2026-05-18",
      short: "A bright, citrus-forward sativa gummy built for the front half of the day.",
      description:
        "Daybreak is the sunrise end of the arc. We pair a limonene-rich sativa distillate with organic " +
        "ginger root and L-theanine so the lift arrives clean instead of jittery. Blood orange up front, " +
        "a little warmth from the ginger on the finish. Made in small batches, pectin-set — never gelatin — " +
        "and cut to a true 4 g piece so the dose you read on the box is the dose in your hand.",
      effects: ["Uplifted", "Focused", "Social", "Creative"],
      terpenes: [
        { name: "Limonene", pct: 0.42 },
        { name: "Pinene", pct: 0.28 },
        { name: "Terpinolene", pct: 0.19 }
      ]
    }),

    gummy({
      id: "blue-dream-gummies",
      name: "Blue Dream Gummies",
      profile: "hybrid",
      sku: "HP-GUM-HYB",
      flavor: "Peach & Wild Honey",
      botanical: "ashwagandha and lemon balm",
      featured: true,
      rating: 4.9,
      reviews: 386,
      batch: "HP-2607-GH",
      harvest: "2026-05-18",
      short: "The everyday hybrid — balanced, warm, and the one most people come back for.",
      description:
        "Golden Hour sits in the middle of the arc, and it is our best seller by a wide margin. A balanced " +
        "hybrid distillate carried on ripe peach and wild honey, rounded out with ashwagandha and lemon balm. " +
        "It is the gummy for the stretch of day that is neither work nor sleep — the walk, the dinner, the " +
        "long conversation on the porch.",
      effects: ["Balanced", "Calm", "Present", "Easy"],
      terpenes: [
        { name: "Caryophyllene", pct: 0.38 },
        { name: "Limonene", pct: 0.31 },
        { name: "Myrcene", pct: 0.22 }
      ]
    }),

    gummy({
      id: "northern-lights-gummies",
      name: "Northern Lights Gummies",
      profile: "indica",
      sku: "HP-GUM-IND",
      flavor: "Black Cherry & Lavender",
      botanical: "chamomile, valerian root and 1 mg melatonin",
      featured: true,
      rating: 4.9,
      reviews: 502,
      batch: "HP-2607-NF",
      harvest: "2026-05-18",
      short: "A heavy, dark-fruit indica gummy with chamomile, valerian and a light touch of melatonin.",
      description:
        "Nightfall closes the arc. Myrcene-dominant indica distillate, black cherry and culinary lavender, " +
        "backed by chamomile, valerian root and just 1 mg of melatonin — enough to signal bedtime without the " +
        "next-morning fog that comes from the 10 mg megadoses sold everywhere else. Take it 60 to 90 minutes " +
        "before you actually want to be asleep.",
      effects: ["Sedating", "Heavy", "Body-calm", "Restful"],
      terpenes: [
        { name: "Myrcene", pct: 0.46 },
        { name: "Linalool", pct: 0.27 },
        { name: "Caryophyllene", pct: 0.18 }
      ]
    }),

    /* ================================ RSO ================================ */
    {
      id: "rso-thc",
      name: "Full-Spectrum RSO — THC",
      category: "rso",
      profile: "hybrid",
      cannabinoid: "thc",
      art: "rso-syringe",
      photos: ["rso-hybrid-a", "rso-hybrid-b"],
      subtitle: "1 g applicator · three profiles",
      featured: true,
      rating: 4.9,
      reviews: 168,
      short: "One gram of unfiltered, full-spectrum THC extract in a graduated glass applicator.",
      description:
        "Whole-plant extract, ethanol-washed and vacuum-purged, with nothing stripped back out. No " +
        "distillation, no added terpenes, no cutting agents — which is why it is dark, thick and tastes " +
        "exactly like the plant it came from. The applicator is graduated in tenths so you can actually " +
        "measure a dose, and it ships in a fitted drawer carton that will stand up in a drawer for a year.",
      optionNames: ["Profile"],
      variants: [
        v(["Northern Lights · Indica"], 5500, { note: "842 mg total cannabinoids · 71.4% THC", sku: "HP-RSO-IND-001", stock: 18, profileOverride: "indica", photos: ["rso-indica-a", "rso-indica-b"] }),
        v(["Jack Herer · Sativa"], 5500, { note: "836 mg total cannabinoids · 70.1% THC", sku: "HP-RSO-SAT-001", stock: 16, profileOverride: "sativa", photos: ["rso-sativa-a", "rso-sativa-b"] }),
        v(["Blue Dream · Hybrid"], 5500, { note: "851 mg total cannabinoids · 72.0% THC", sku: "HP-RSO-HYB-001", stock: 21, profileOverride: "hybrid", photos: ["rso-hybrid-a", "rso-hybrid-b"] })
      ],
      potency: { thc: "70.1 – 72.0%", cbd: "1.8 – 2.4%", total: "836 – 851 mg per applicator" },
      effects: ["Potent", "Long-lasting", "Whole-plant", "Body-forward"],
      specs: {
        "Net weight": "1 g",
        "Applicator": "Luer-lock borosilicate glass · 10.8 mm barrel × 79.8 mm",
        "Graduation": "0.1 g increments",
        "Extraction": "Cold ethanol wash, rotary recovered, vacuum purged",
        "Additives": "None. No distillate, no cutting agents, no botanical terpenes",
        "Typical dose": "A grain of rice (~25 mg) to start",
        "Storage": "Cool and dark. Warm the barrel in your hand before dispensing",
        "Packaging": "Fitted rigid drawer carton, 1.25 × 1.25 × 6 in",
        "Batch": "HP-2606-RSO"
      },
      lab: { batch: "HP-2606-RSO", harvest: "2026-04-02", status: "Current" }
    },

    {
      id: "rso-cbd",
      name: "Full-Spectrum RSO — CBD",
      category: "rso",
      profile: "cbd",
      cannabinoid: "cbd",
      art: "rso-syringe",
      photos: ["rso-cbd-a", "rso-cbd-b"],
      subtitle: "1 g applicator · three profiles",
      rating: 4.8,
      reviews: 94,
      short: "The same whole-plant process, run on high-CBD cultivars. Under 0.3% THC.",
      description:
        "Identical extraction to our THC line, run on three high-CBD cultivars instead. You get the full " +
        "cannabinoid and terpene envelope — CBD, CBG, CBC and the minor acids — with the THC left below the " +
        "0.3% federal threshold. This is the one people reach for when they want the body effect of a " +
        "full-spectrum extract during the working day, or to blend down a THC dose that landed too hard.",
      optionNames: ["Profile"],
      variants: [
        v(["Bubba Kush CBD · Indica"], 4800, { note: "884 mg total cannabinoids · 74.2% CBD", sku: "HP-RSO-CBD-IND", stock: 14, profileOverride: "indica" }),
        v(["Sour Space Candy · Sativa"], 4800, { note: "871 mg total cannabinoids · 72.9% CBD", sku: "HP-RSO-CBD-SAT", stock: 12, profileOverride: "sativa" }),
        v(["ACDC · Hybrid"], 4800, { note: "897 mg total cannabinoids · 76.1% CBD", sku: "HP-RSO-CBD-HYB", stock: 19, profileOverride: "hybrid" })
      ],
      potency: { thc: "<0.3%", cbd: "72.9 – 76.1%", total: "871 – 897 mg per applicator" },
      effects: ["Non-intoxicating", "Body-calm", "Anti-inflammatory", "Clear"],
      specs: {
        "Net weight": "1 g",
        "Applicator": "Luer-lock borosilicate glass · 10.8 mm barrel × 79.8 mm",
        "Graduation": "0.1 g increments",
        "Extraction": "Cold ethanol wash, rotary recovered, vacuum purged",
        "THC content": "Below 0.3% Δ9 THC by dry weight",
        "Typical dose": "A grain of rice (~25 mg) to start",
        "Storage": "Cool and dark. Warm the barrel in your hand before dispensing",
        "Packaging": "Fitted rigid drawer carton, 1.25 × 1.25 × 6 in",
        "Batch": "HP-2606-RSOC"
      },
      lab: { batch: "HP-2606-RSOC", harvest: "2026-04-02", status: "Current" }
    },

    /* =============================== FLOWER =============================== */
    /* Nine cultivars, three per profile. Every one is photographed — the
       catalogue follows the photography, not the other way round. */
    flower({
      id: "northern-lights",
      name: "Northern Lights #5",
      profile: "indica",
      tier: "reserve",
      sku: "HP-FLW-NL5",
      macro: ["macro-purple"],
      featured: true,
      rating: 4.9,
      reviews: 271,
      thc: "24.8%",
      total: "28.1%",
      nose: "Sweet pine, damp earth, a little pepper",
      cure: "14-day dry, 6-week cure in glass",
      batch: "HP-FLR-NL5-0354",
      harvest: "2026-04-28",
      short: "The reference indica. Dense, resin-heavy, and about as reliable as flower gets.",
      description:
        "There is a reason this cultivar has been in continuous circulation since the eighties. Compact, " +
        "frosted, almost purple at the bract tips, with a nose that reads sweet pine first and wet forest " +
        "floor underneath. Ours is grown indoors under a slow finish, hand-trimmed, and cured six weeks in " +
        "glass before it ever gets jarred. Heavy in the body, quiet in the head.",
      effects: ["Sedating", "Body-heavy", "Euphoric", "Appetite"],
      terpenes: [
        { name: "Myrcene", pct: 0.71 },
        { name: "Caryophyllene", pct: 0.44 },
        { name: "Pinene", pct: 0.31 }
      ]
    }),

    flower({
      id: "granddaddy-purple",
      name: "Granddaddy Purple",
      profile: "indica",
      tier: "signature",
      sku: "HP-FLW-GDP",
      rating: 4.7,
      reviews: 158,
      thc: "22.1%",
      total: "25.4%",
      nose: "Concord grape, blackberry, sweet musk",
      cure: "12-day dry, 5-week cure in glass",
      batch: "HP-FLR-GDP-0361",
      harvest: "2026-04-30",
      short: "Grape and berry on the nose, deep physical calm on the back end.",
      description:
        "Grown for colour as much as effect — the bracts run genuinely violet under a cool finish, which is " +
        "why this is the jar people pick up first on a shelf. Concord grape and blackberry on the grind, " +
        "sweet musk on the exhale. The effect is classic evening indica: it lands in the shoulders and hips " +
        "before it reaches your head.",
      effects: ["Relaxing", "Dreamy", "Body-heavy", "Restful"],
      terpenes: [
        { name: "Myrcene", pct: 0.63 },
        { name: "Pinene", pct: 0.29 },
        { name: "Caryophyllene", pct: 0.26 }
      ]
    }),

    flower({
      id: "gmo-cookies",
      name: "GMO Cookies",
      profile: "indica",
      tier: "everyday",
      sku: "HP-FLW-GMO",
      rating: 4.6,
      reviews: 119,
      thc: "21.4%",
      total: "24.3%",
      nose: "Garlic, diesel, roasted savoury funk",
      cure: "10-day dry, 4-week cure",
      batch: "HP-FLR-GMO-0372",
      harvest: "2026-05-04",
      short: "Savoury, funky and genuinely heavy. Not for everyone, adored by the people it is for.",
      description:
        "Our value tier is not our leftovers — it is the same rooms and the same hands, run on cultivars " +
        "that finish faster and yield heavier. GMO is the best example of that. Garlic and diesel with a " +
        "roasted savoury funk underneath, which is exactly as polarising as it sounds. The effect is a " +
        "thick, sleepy body that does not need 25% THC to get there.",
      effects: ["Sleepy", "Heavy", "Comforting", "Slow"],
      terpenes: [
        { name: "Caryophyllene", pct: 0.58 },
        { name: "Limonene", pct: 0.34 },
        { name: "Myrcene", pct: 0.27 }
      ]
    }),

    flower({
      id: "sour-diesel",
      name: "Sour Diesel",
      profile: "sativa",
      tier: "reserve",
      sku: "HP-FLW-SD",
      featured: true,
      rating: 4.8,
      reviews: 203,
      thc: "25.3%",
      total: "28.6%",
      nose: "Fuel, grapefruit peel, sharp citrus",
      cure: "14-day dry, 6-week cure in glass",
      batch: "HP-FLR-SD-0348",
      harvest: "2026-04-26",
      short: "Loud, fuel-forward sativa. The strongest thing on our sativa shelf.",
      description:
        "Unapologetically loud. Open the jar in a room and everyone knows. Diesel and grapefruit peel with a " +
        "sharp citric edge, long and spindly bud structure, and a head effect that arrives fast and stays " +
        "sharp for a couple of hours. This is a morning or mid-afternoon cultivar and it will absolutely " +
        "keep you up if you smoke it at ten at night.",
      effects: ["Energetic", "Cerebral", "Talkative", "Alert"],
      terpenes: [
        { name: "Caryophyllene", pct: 0.58 },
        { name: "Limonene", pct: 0.49 },
        { name: "Myrcene", pct: 0.24 }
      ]
    }),

    flower({
      id: "jack-herer",
      name: "Jack Herer",
      profile: "sativa",
      tier: "signature",
      sku: "HP-FLW-JH",
      featured: true,
      rating: 4.8,
      reviews: 187,
      thc: "22.7%",
      total: "26.0%",
      nose: "Pine, black pepper, orange rind",
      cure: "12-day dry, 5-week cure in glass",
      batch: "HP-FLR-JH-0356",
      harvest: "2026-04-29",
      short: "Terpinolene-driven, piney and clear-headed. Our daytime standard.",
      description:
        "The cultivar our sativa pre-rolls, sativa gummies and sativa RSO are all built on, so if you like " +
        "one you will like the rest. Terpinolene leads — pine and black pepper with orange rind behind it — " +
        "and the effect is the cleanest daytime high in the catalogue. Clear, functional, no fog, no crash.",
      effects: ["Clear", "Functional", "Uplifted", "Creative"],
      terpenes: [
        { name: "Terpinolene", pct: 0.66 },
        { name: "Caryophyllene", pct: 0.35 },
        { name: "Pinene", pct: 0.33 }
      ]
    }),

    flower({
      id: "durban-poison",
      name: "Durban Poison",
      profile: "sativa",
      tier: "everyday",
      sku: "HP-FLW-DP",
      rating: 4.5,
      reviews: 96,
      thc: "20.6%",
      total: "23.4%",
      nose: "Anise, sweet liquorice, orange zest",
      cure: "10-day dry, 4-week cure",
      batch: "HP-FLR-DP-0377",
      harvest: "2026-05-06",
      short: "A pure landrace sativa — sweet, sharp, and priced to smoke daily.",
      description:
        "One of the few true landrace sativas still in wide circulation, and it smokes like it: anise and " +
        "sweet liquorice with orange zest behind. Chunky, resin-coated bud that grinds beautifully, which " +
        "makes this the one we reach for when rolling for ourselves. Fast onset, bright, and priced so that " +
        "going through an ounce a month is not a decision.",
      effects: ["Sharp", "Awake", "Bright", "Focused"],
      terpenes: [
        { name: "Terpinolene", pct: 0.54 },
        { name: "Ocimene", pct: 0.31 },
        { name: "Myrcene", pct: 0.25 }
      ]
    }),

    flower({
      id: "runtz",
      name: "Runtz",
      profile: "hybrid",
      tier: "reserve",
      sku: "HP-FLW-RTZ",
      macro: ["macro-green"],
      featured: true,
      rating: 5.0,
      reviews: 341,
      thc: "26.4%",
      total: "29.8%",
      nose: "Candied fruit, sweet cream, gassy finish",
      cure: "16-day dry, 6-week cure in glass",
      batch: "HP-FLR-RTZ-0341",
      harvest: "2026-04-24",
      short: "The best-looking and highest-testing jar we make. Sells out first, every time.",
      description:
        "If you buy one thing off this page, buy this. Runtz is the top of our reserve tier — the densest, " +
        "frostiest, highest-testing flower in the building, cured sixteen days slower than anything else. " +
        "Candied fruit and sweet cream with a gassy finish. The effect is genuinely balanced: a real head " +
        "lift that settles into a heavy, warm body about forty minutes in.",
      effects: ["Euphoric", "Balanced", "Potent", "Warm"],
      terpenes: [
        { name: "Limonene", pct: 0.74 },
        { name: "Caryophyllene", pct: 0.61 },
        { name: "Linalool", pct: 0.28 }
      ]
    }),

    flower({
      id: "blue-dream",
      name: "Blue Dream",
      profile: "hybrid",
      tier: "signature",
      sku: "HP-FLW-BD",
      rating: 4.7,
      reviews: 224,
      thc: "23.0%",
      total: "26.3%",
      nose: "Blueberry, sweet herb, light pine",
      cure: "12-day dry, 5-week cure in glass",
      batch: "HP-FLR-BD-0352",
      harvest: "2026-04-27",
      short: "The most forgiving flower we sell, and the one we hand to beginners.",
      description:
        "Blue Dream is the safest recommendation in the catalogue. Blueberry and sweet herb, a gentle onset, " +
        "and a ceiling that is high enough to matter but low enough that it rarely gets away from anyone. " +
        "If you are new, or you are buying for somebody who is, start here and start with an eighth.",
      effects: ["Gentle", "Even", "Happy", "Forgiving"],
      terpenes: [
        { name: "Myrcene", pct: 0.57 },
        { name: "Pinene", pct: 0.34 },
        { name: "Caryophyllene", pct: 0.29 }
      ]
    }),

    flower({
      id: "cereal-milk",
      name: "Cereal Milk",
      profile: "hybrid",
      tier: "everyday",
      sku: "HP-FLW-CM",
      rating: 4.6,
      reviews: 141,
      thc: "21.2%",
      total: "24.1%",
      nose: "Sweet cream, berry cereal, faint mint",
      cure: "10-day dry, 4-week cure",
      batch: "HP-FLR-CM-0369",
      harvest: "2026-05-08",
      short: "Dessert-sweet and easygoing at the everyday price.",
      description:
        "Sweet cream and berry cereal with a faint mint edge on the exhale — one of the more distinctive " +
        "noses on the shelf and the reason this jar moves as fast as it does. A genuinely pleasant, " +
        "mid-weight hybrid that does not demand anything of you. This is the jar that lives on the coffee " +
        "table rather than in the safe.",
      effects: ["Easy", "Sociable", "Light", "Warm"],
      terpenes: [
        { name: "Limonene", pct: 0.48 },
        { name: "Caryophyllene", pct: 0.4 },
        { name: "Linalool", pct: 0.22 }
      ]
    }),

    /* =============================== SHAKE ================================ */
    {
      id: "daybreak-shake",
      name: "Daybreak Shake",
      category: "flower",
      subcategory: "shake",
      profile: "sativa",
      cannabinoid: "thc",
      art: "shake-pouch",
      subtitle: "Sativa trim · by the ounce",
      rating: 4.4,
      reviews: 88,
      short: "Sativa shake and small nug from our Jack Herer and Durban Poison runs. $50 an ounce.",
      description:
        "Shake is what comes off the trays and out of the bottom of the jars — same flower, smaller pieces. " +
        "Ours is pulled from the Jack Herer and Durban Poison rooms, sifted to remove stem and leaf, and sold " +
        "by the ounce at a price that makes rolling, cooking or infusing actually economical. It is not " +
        "pretty. It smokes fine and it extracts beautifully.",
      optionNames: ["Size"],
      variants: [
        v(["1 oz"], 5000, { note: "28 g · 10 oz clear jar", grams: "28 g", stock: 40, sku: "HP-SHK-SAT-1OZ" }),
        v(["1/4 lb"], 16000, { note: "113.4 g · vacuum-sealed in kraft pouch", grams: "113.4 g", bulk: true, stock: 14, sku: "HP-SHK-SAT-QP" }),
        v(["1/2 lb"], 29000, { note: "226.8 g · vacuum-sealed in kraft pouch", grams: "226.8 g", bulk: true, stock: 8, sku: "HP-SHK-SAT-HP" }),
        v(["1 lb"], 50000, { note: "453.6 g · vacuum-sealed in kraft pouch", grams: "453.6 g", bulk: true, stock: 5, sku: "HP-SHK-SAT-LB" })
      ],
      potency: { thc: "18.4%", cbd: "<0.3%", total: "21.2%" },
      effects: ["Bright", "Awake", "Everyday"],
      specs: {
        "Contents": "Sifted shake and small nug from Jack Herer and Durban Poison",
        "Profile": "Sativa",
        "Total THC": "18.4% (batch composite)",
        "Sifting": "De-stemmed and screened, no leaf",
        "Best for": "Rolling, infusion, extraction",
        "Packaging": "1 oz in clear glass; bulk vacuum-sealed inside a kraft pouch",
        "Batch": "HP-2606-SHK-S"
      },
      lab: { batch: "HP-2606-SHK-S", harvest: "2026-05-01", status: "Current" }
    },

    {
      id: "golden-hour-shake",
      name: "Golden Hour Shake",
      category: "flower",
      subcategory: "shake",
      profile: "hybrid",
      cannabinoid: "thc",
      art: "shake-pouch",
      subtitle: "Hybrid trim · by the ounce",
      rating: 4.5,
      reviews: 112,
      short: "Hybrid shake from the Blue Dream and Cereal Milk rooms. $50 an ounce.",
      description:
        "The middle of the shake range and the one most people buy twice. Composite of Blue Dream and " +
        "Cereal Milk, screened and de-stemmed. Even and forgiving — which matters more in shake than " +
        "it does in flower, because you are usually making something with it rather than smoking it neat.",
      optionNames: ["Size"],
      variants: [
        v(["1 oz"], 5000, { note: "28 g · 10 oz clear jar", grams: "28 g", stock: 44, sku: "HP-SHK-HYB-1OZ" }),
        v(["1/4 lb"], 16000, { note: "113.4 g · vacuum-sealed in kraft pouch", grams: "113.4 g", bulk: true, stock: 16, sku: "HP-SHK-HYB-QP" }),
        v(["1/2 lb"], 29000, { note: "226.8 g · vacuum-sealed in kraft pouch", grams: "226.8 g", bulk: true, stock: 9, sku: "HP-SHK-HYB-HP" }),
        v(["1 lb"], 50000, { note: "453.6 g · vacuum-sealed in kraft pouch", grams: "453.6 g", bulk: true, stock: 6, sku: "HP-SHK-HYB-LB" })
      ],
      potency: { thc: "19.1%", cbd: "<0.3%", total: "22.0%" },
      effects: ["Even", "Easy", "Everyday"],
      specs: {
        "Contents": "Sifted shake and small nug from Blue Dream and Cereal Milk",
        "Profile": "Hybrid",
        "Total THC": "19.1% (batch composite)",
        "Sifting": "De-stemmed and screened, no leaf",
        "Best for": "Rolling, infusion, extraction",
        "Packaging": "1 oz in clear glass; bulk vacuum-sealed inside a kraft pouch",
        "Batch": "HP-2606-SHK-H"
      },
      lab: { batch: "HP-2606-SHK-H", harvest: "2026-05-01", status: "Current" }
    },

    {
      id: "nightfall-shake",
      name: "Nightfall Shake",
      category: "flower",
      subcategory: "shake",
      profile: "indica",
      cannabinoid: "thc",
      art: "shake-pouch",
      subtitle: "Indica trim · by the ounce",
      rating: 4.5,
      reviews: 97,
      short: "Indica shake from the GMO Cookies and Granddaddy Purple rooms. $50 an ounce.",
      description:
        "Composite of GMO Cookies and Granddaddy Purple. Heavier and sweeter than the other two, and the one " +
        "to buy if you are making an infused butter or oil for evening use. Same screening, same price, " +
        "same honest description: this is trim, and it is good trim.",
      optionNames: ["Size"],
      variants: [
        v(["1 oz"], 5000, { note: "28 g · 10 oz clear jar", grams: "28 g", stock: 38, sku: "HP-SHK-IND-1OZ" }),
        v(["1/4 lb"], 16000, { note: "113.4 g · vacuum-sealed in kraft pouch", grams: "113.4 g", bulk: true, stock: 13, sku: "HP-SHK-IND-QP" }),
        v(["1/2 lb"], 29000, { note: "226.8 g · vacuum-sealed in kraft pouch", grams: "226.8 g", bulk: true, stock: 7, sku: "HP-SHK-IND-HP" }),
        v(["1 lb"], 50000, { note: "453.6 g · vacuum-sealed in kraft pouch", grams: "453.6 g", bulk: true, stock: 4, sku: "HP-SHK-IND-LB" })
      ],
      potency: { thc: "18.8%", cbd: "<0.3%", total: "21.6%" },
      effects: ["Heavy", "Sweet", "Everyday"],
      specs: {
        "Contents": "Sifted shake and small nug from GMO Cookies and Granddaddy Purple",
        "Profile": "Indica",
        "Total THC": "18.8% (batch composite)",
        "Sifting": "De-stemmed and screened, no leaf",
        "Best for": "Rolling, infusion, extraction",
        "Packaging": "1 oz in clear glass; bulk vacuum-sealed inside a kraft pouch",
        "Batch": "HP-2606-SHK-I"
      },
      lab: { batch: "HP-2606-SHK-I", harvest: "2026-05-01", status: "Current" }
    },

    /* ============================= PRE-ROLLS ============================== */
    {
      id: "sundial-sativa",
      name: "Sundial Pre-Rolls — Jack Herer",
      category: "prerolls",
      profile: "sativa",
      cannabinoid: "thc",
      art: "preroll-tin",
      photos: ["preroll-sativa-pack-a", "preroll-sativa-pack-b"],
      subtitle: "Sativa · single, five minis, or seven-pack",
      featured: true,
      rating: 4.7,
      reviews: 143,
      short: "Jack Herer flower, ground and packed by hand into matte tins.",
      description:
        "Sundial is our pre-roll program, and it runs on the same three cultivars as our flower shelf so " +
        "you always know what you are getting. This is the Jack Herer: piney, peppery, clear-headed. " +
        "Everything is whole flower — no trim, no shake, no additives — ground to a consistent coarse and " +
        "packed by hand so they draw evenly all the way down.",
      optionNames: ["Format"],
      variants: [
        v(["Single · 1 × 0.75 g"], 1200, { note: "Matte child-resistant J-Line tube, 116 × 19 mm", stock: 60, sku: "HP-PR-SAT-1", photos: ["preroll-sativa-single-a", "preroll-sativa-single-b"] }),
        v(["Five Minis · 5 × 0.35 g"], 2200, { note: "1.75 g total · small two-button tin, 80 × 58 × 15 mm", stock: 34, sku: "HP-PR-SAT-5", photos: ["preroll-mini-sativa-a", "preroll-mini-sativa-b"] }),
        v(["Seven-Pack · 7 × 0.75 g"], 5200, { note: "5.25 g total · Retroflip tin, 102.5 × 64 × 21.5 mm", stock: 22, sku: "HP-PR-SAT-7", photos: ["preroll-sativa-pack-a", "preroll-sativa-pack-b"] })
      ],
      potency: { thc: "22.7%", cbd: "<0.3%", total: "26.0%" },
      effects: ["Clear", "Functional", "Uplifted"],
      specs: {
        "Cultivar": "Jack Herer",
        "Profile": "Sativa",
        "Total THC": "22.7%",
        "Contents": "Whole flower only — no trim, no shake, no additives",
        "Paper": "Unbleached organic hemp, 98 mm cones with a spiral filter tip",
        "Tins": "Matte forest, debossed sun mark, cream slot insert, child-resistant",
        "Freshness": "Two-way 62% humidity pack in every multi-pack tin",
        "Batch": "HP-2606-JH"
      },
      lab: { batch: "HP-2606-JH", harvest: "2026-04-29", status: "Current" }
    },

    {
      id: "sundial-hybrid",
      name: "Sundial Pre-Rolls — Blue Dream",
      category: "prerolls",
      profile: "hybrid",
      cannabinoid: "thc",
      art: "preroll-tin",
      photos: ["preroll-hybrid-pack-a", "preroll-hybrid-pack-b"],
      subtitle: "Hybrid · single, five minis, or seven-pack",
      featured: true,
      rating: 4.8,
      reviews: 219,
      short: "Blue Dream flower in the same matte tins. The one to buy if you're not sure.",
      description:
        "The middle of the Sundial range and easily our best-selling pre-roll. Blue Dream is forgiving, " +
        "even and pleasant, which is exactly what you want in a format where you have already committed to " +
        "the whole thing once you light it. The five-mini tin is the smart buy here — 0.35 g is about right " +
        "for one person and one sitting.",
      optionNames: ["Format"],
      variants: [
        v(["Single · 1 × 0.75 g"], 1200, { note: "Matte child-resistant J-Line tube, 116 × 19 mm", stock: 72, sku: "HP-PR-HYB-1", photos: ["preroll-hybrid-single-a", "preroll-hybrid-single-b"] }),
        v(["Five Minis · 5 × 0.35 g"], 2200, { note: "1.75 g total · small two-button tin, 80 × 58 × 15 mm", stock: 41, sku: "HP-PR-HYB-5", photos: ["preroll-mini-a", "preroll-mini-b"] }),
        v(["Seven-Pack · 7 × 0.75 g"], 5200, { note: "5.25 g total · Retroflip tin, 102.5 × 64 × 21.5 mm", stock: 28, sku: "HP-PR-HYB-7", photos: ["preroll-hybrid-pack-a", "preroll-hybrid-pack-b"] })
      ],
      potency: { thc: "23.0%", cbd: "<0.3%", total: "26.3%" },
      effects: ["Gentle", "Even", "Happy"],
      specs: {
        "Cultivar": "Blue Dream",
        "Profile": "Hybrid",
        "Total THC": "23.0%",
        "Contents": "Whole flower only — no trim, no shake, no additives",
        "Paper": "Unbleached organic hemp, 98 mm cones with a spiral filter tip",
        "Tins": "Matte forest, debossed sun mark, cream slot insert, child-resistant",
        "Freshness": "Two-way 62% humidity pack in every multi-pack tin",
        "Batch": "HP-2606-BD"
      },
      lab: { batch: "HP-2606-BD", harvest: "2026-04-27", status: "Current" }
    },

    {
      id: "sundial-indica",
      name: "Sundial Pre-Rolls — Northern Lights",
      category: "prerolls",
      profile: "indica",
      cannabinoid: "thc",
      art: "preroll-tin",
      photos: ["preroll-indica-pack-a", "preroll-indica-pack-b"],
      subtitle: "Indica · single, five minis, or seven-pack",
      rating: 4.8,
      reviews: 176,
      short: "Northern Lights flower, packed for the end of the day.",
      description:
        "Reserve-tier Northern Lights, ground and packed into the same tins. Sweet pine and damp earth, and " +
        "a body effect that shows up fast in this format because you are inhaling it rather than waiting on " +
        "an edible. The seven-pack tin is the one to keep on the nightstand.",
      optionNames: ["Format"],
      variants: [
        v(["Single · 1 × 0.75 g"], 1200, { note: "Matte child-resistant J-Line tube, 116 × 19 mm", stock: 58, sku: "HP-PR-IND-1", photos: ["preroll-indica-single-a", "preroll-indica-single-b"] }),
        v(["Five Minis · 5 × 0.35 g"], 2200, { note: "1.75 g total · small two-button tin, 80 × 58 × 15 mm", stock: 31, sku: "HP-PR-IND-5", photos: ["preroll-mini-a", "preroll-mini-b"] }),
        v(["Seven-Pack · 7 × 0.75 g"], 5200, { note: "5.25 g total · Retroflip tin, 102.5 × 64 × 21.5 mm", stock: 19, sku: "HP-PR-IND-7", photos: ["preroll-indica-pack-a", "preroll-indica-pack-b"] })
      ],
      potency: { thc: "24.8%", cbd: "<0.3%", total: "28.1%" },
      effects: ["Sedating", "Body-heavy", "Restful"],
      specs: {
        "Cultivar": "Northern Lights",
        "Profile": "Indica",
        "Total THC": "24.8%",
        "Contents": "Whole flower only — no trim, no shake, no additives",
        "Paper": "Unbleached organic hemp, 98 mm cones with a spiral filter tip",
        "Tins": "Matte forest, debossed sun mark, cream slot insert, child-resistant",
        "Freshness": "Two-way 62% humidity pack in every multi-pack tin",
        "Batch": "HP-2606-NL"
      },
      lab: { batch: "HP-2606-NL", harvest: "2026-04-28", status: "Current" }
    },

    /* ============================== TOPICALS ============================== */
    {
      id: "relief-salve",
      name: "Relief Salve",
      category: "topicals",
      profile: "cbd",
      cannabinoid: "ratio",
      art: "salve-jar",
      photos: ["topical-a-v2", "topical-b-v2"],
      subtitle: "2 oz · 3000 mg CBD + 500 mg THC",
      featured: true,
      rating: 4.9,
      reviews: 264,
      short: "A genuinely potent whole-plant salve. Coconut oil, beeswax, RSO and five essential oils.",
      description:
        "Most salves on the shelf run 250 to 1000 mg of CBD in a two-ounce jar. This one runs 3000 mg of CBD " +
        "and 500 mg of THC, because it is built on our own full-spectrum RSO rather than an isolate powder. " +
        "The base is virgin coconut oil and beeswax — nothing else, no petrolatum, no emulsifiers — so it " +
        "goes on thick and stays where you put it. Eucalyptus and peppermint give it the cooling front end; " +
        "lavender, rosemary and arnica do the slower work underneath.",
      optionNames: [],
      variants: [
        v([], 8900, { note: "2 oz · 3000 mg CBD + 500 mg THC", stock: 36, sku: "HP-TOP-SLV-2OZ" })
      ],
      potency: { cbd: "3000 mg", thc: "500 mg", total: "3500 mg per jar" },
      effects: ["Targeted", "Cooling", "Non-intoxicating", "Fast"],
      ingredients:
        "Virgin coconut oil, beeswax, full-spectrum cannabis extract (RSO), arnica-infused olive oil, " +
        "eucalyptus essential oil, peppermint essential oil, lavender essential oil, rosemary essential oil, " +
        "vitamin E. That is the entire formula.",
      specs: {
        "Net weight": "2 oz (56 g)",
        "CBD": "3000 mg per jar",
        "THC": "500 mg per jar",
        "Base": "Virgin coconut oil and beeswax",
        "Actives": "Full-spectrum RSO, arnica",
        "Essential oils": "Eucalyptus, peppermint, lavender, rosemary",
        "Intoxicating": "No — topical application does not cross into the bloodstream at these levels",
        "Container": "Amber PET straight-sided jar, 2.3 in diameter × 1.3 in, 58-400 neck",
        "Batch": "HP-2605-SLV"
      },
      lab: { batch: "HP-2605-SLV", harvest: "2026-03-19", status: "Current" }
    },

    /* ============================== BUNDLES =============================== */
    {
      id: "flower-flight",
      name: "The Three-Profile Flight",
      category: "bundles",
      profile: "hybrid",
      cannabinoid: "thc",
      art: "bundle-box",
      photos: ["bundle-flight-a", "bundle-flight-b"],
      subtitle: "Six minis, two of each profile",
      featured: true,
      rating: 4.9,
      reviews: 54,
      short: "Six 0.35 g minis in one tin — two sativa, two hybrid, two indica.",
      description:
        "The fastest way to find out what you actually like. One tin, six 0.35 g minis, colour-coded by " +
        "profile — two Jack Herer for the morning, two Blue Dream for the middle, two Northern Lights " +
        "for the end of the night. A 0.35 g mini is about right for one person and one sitting, so you " +
        "can work through the whole arc in a week. This is the only way we sell two of a profile; " +
        "everything else is a five or a seven.",
      optionNames: [],
      variants: [
        v([], 3200, { note: "6 × 0.35 g · 2.1 g total", stock: 24, sku: "HP-BDL-FLT" })
      ],
      contents: [
        { id: "sundial-sativa", label: "2 × Jack Herer mini · 0.35 g each", value: 0 },
        { id: "sundial-hybrid", label: "2 × Blue Dream mini · 0.35 g each", value: 0 },
        { id: "sundial-indica", label: "2 × Northern Lights mini · 0.35 g each", value: 0 }
      ],
      effects: ["Comparative", "Complete", "Easy"],
      specs: {
        "Contents": "6 minis · 0.35 g each · 2.1 g total",
        "Split": "2 sativa, 2 hybrid, 2 indica",
        "Profiles": "Jack Herer, Blue Dream and Northern Lights",
        "Packaging": "Hinged tin with a fitted six-slot insert and colour-coded filter tips"
      }
    },

    {
      id: "gummy-sampler",
      name: "The Gummy Sampler",
      category: "bundles",
      profile: "hybrid",
      cannabinoid: "thc",
      art: "bundle-box",
      photos: ["bundle-sampler-a", "bundle-sampler-b"],
      subtitle: "Six gummies, THC and CBD",
      featured: true,
      rating: 4.9,
      reviews: 88,
      short: "Six gummies in one tin — three 50 mg THC, three 100 mg CBD, one of each strain.",
      description:
        "Six gummies, colour-coded, in a hinged tin. Three are 50 mg THC — one Jack Herer, one Blue " +
        "Dream, one Northern Lights. Three are 100 mg CBD in the same three profiles. It is the only " +
        "place we sell the CBD gummies, and the only way to try all three profiles without committing " +
        "to a full box of any of them.",
      optionNames: [],
      variants: [
        v([], 4200, { note: "6 pieces · 150 mg THC + 300 mg CBD", stock: 18, sku: "HP-BDL-GUM" })
      ],
      contents: [
        { id: "jack-herer-gummies", label: "Jack Herer — 1 × 50 mg THC, 1 × 100 mg CBD", value: 0 },
        { id: "blue-dream-gummies", label: "Blue Dream — 1 × 50 mg THC, 1 × 100 mg CBD", value: 0 },
        { id: "northern-lights-gummies", label: "Northern Lights — 1 × 50 mg THC, 1 × 100 mg CBD", value: 0 }
      ],
      effects: ["Comparative", "Everyday", "Shareable"],
      specs: {
        "Contents": "6 pectin gummies · 24 g net wt",
        "THC": "3 × 50 mg · 150 mg total",
        "CBD": "3 × 100 mg · 300 mg total",
        "Profiles": "Jack Herer, Blue Dream and Northern Lights",
        "Packaging": "Hinged tin with a fitted six-well insert"
      }
    },

    {
      id: "rso-starter",
      name: "The RSO Starter",
      category: "bundles",
      profile: "cbd",
      cannabinoid: "ratio",
      art: "bundle-box",
      photos: ["rso-balanced-a", "rso-balanced-b"],
      subtitle: "Both extracts plus the salve",
      rating: 4.8,
      reviews: 42,
      short: "One THC RSO, one CBD RSO and a jar of Relief Salve. Save $17.",
      description:
        "The set to buy if you are working with RSO for the first time. A gram of THC RSO and a gram of " +
        "CBD RSO — both hybrid profile — so you can titrate between them, plus a jar of Relief Salve for " +
        "anything better handled topically. Ships with our printed RSO dosing card, which is the single " +
        "most useful thing in the box.",
      optionNames: [],
      variants: [
        v([], 17500, { compare: 19200, note: "Save $17", stock: 12, sku: "HP-BDL-RSO" })
      ],
      contents: [
        { id: "rso-thc", label: "Full-Spectrum RSO — THC · Blue Dream", value: 5500 },
        { id: "rso-cbd", label: "Full-Spectrum RSO — CBD · ACDC", value: 4800 },
        { id: "relief-salve", label: "Relief Salve — 2 oz", value: 8900 }
      ],
      effects: ["Potent", "Titratable", "Whole-plant"],
      specs: {
        "Contents": "3 items — see breakdown",
        "Retail value": "$192.00",
        "Bundle price": "$175.00",
        "Profiles": "Hybrid THC and hybrid CBD",
        "Packaging": "Printed rigid box with fitted applicator wells and an RSO dosing card"
      }
    },

    {
      id: "nightfall-set",
      name: "The Nightfall Set",
      category: "bundles",
      profile: "indica",
      cannabinoid: "thc",
      art: "bundle-box",
      photos: ["topical-a", "topical-b"],
      subtitle: "The full wind-down, boxed",
      featured: true,
      rating: 4.9,
      reviews: 88,
      short: "Northern Lights gummies, a Northern Lights eighth and a full jar of Relief Salve. Save $28.",
      description:
        "Everything for the back half of the day, all on the same cultivar. A 10-pack of 25 mg Northern " +
        "Lights gummies, an eighth of Reserve-tier Northern Lights #5 in clear glass, and a full 2 oz jar " +
        "of Relief Salve. The salve alone is $89, so this is the most value we put in a single box — and " +
        "it is consistently our best-selling bundle.",
      optionNames: [],
      variants: [
        v([], 15400, { compare: 18200, note: "Save $28", stock: 15, sku: "HP-BDL-NGT" })
      ],
      contents: [
        { id: "northern-lights-gummies", label: "Northern Lights Gummies — 25 mg, 10-pack", value: 4800 },
        { id: "northern-lights", label: "Northern Lights #5 — 1/8 oz", value: 4500 },
        { id: "relief-salve", label: "Relief Salve — 2 oz", value: 8900 }
      ],
      effects: ["Evening", "Heavy", "Restorative"],
      specs: {
        "Contents": "3 items — see breakdown",
        "Retail value": "$182.00",
        "Bundle price": "$154.00",
        "Profile": "Indica plus a non-intoxicating topical",
        "Packaging": "Printed rigid gift box with kraft crinkle fill and a folded dosing card"
      }
    }
  ];

  /* ------------------------------------------------ Storefront assortment */
  /*
     Keep the public assortment aligned with the available product photography.
     The broader source catalog remains above so additional items can be added
     when their product media is ready.
  */
  var STORE_IDS = [
    "jack-herer-gummies", "blue-dream-gummies", "northern-lights-gummies",
    "northern-lights", "jack-herer", "runtz",
    "rso-thc", "rso-cbd",
    "sundial-sativa", "sundial-hybrid", "sundial-indica",
    "relief-salve", "flower-flight"
  ];

  var STORE_COPY = {
    "jack-herer-gummies": "Blood orange and ginger pectin gummies with the bright Jack Herer profile.",
    "blue-dream-gummies": "Peach and wild honey pectin gummies with the balanced Blue Dream profile.",
    "northern-lights-gummies": "Black cherry and lavender pectin gummies built around Northern Lights.",
    "northern-lights": "Sweet pine and earthy notes in a clear-glass 3.5 g jar.",
    "jack-herer": "Pine, black pepper, and orange-rind character in a clear-glass 3.5 g jar.",
    "runtz": "Candied fruit, sweet cream, and a gassy finish in a clear-glass 3.5 g jar.",
    "rso-thc": "One gram of full-spectrum extract in Northern Lights or Jack Herer.",
    "rso-cbd": "One gram of full-spectrum ACDC CBD extract in a graduated applicator.",
    "sundial-sativa": "Seven whole-flower Jack Herer pre-rolls in a profile-coded tin.",
    "sundial-hybrid": "Seven whole-flower Blue Dream pre-rolls in a profile-coded tin.",
    "sundial-indica": "Seven whole-flower Northern Lights pre-rolls in a profile-coded tin.",
    "relief-salve": "A two-ounce full-spectrum botanical salve in an amber jar.",
    "flower-flight": "Six minis spanning Jack Herer, Blue Dream, and Northern Lights."
  };

  var STORE_SUBTITLE = {
    "jack-herer-gummies": "50 mg each · 10 pieces · Blood Orange & Ginger",
    "blue-dream-gummies": "50 mg each · 10 pieces · Peach & Wild Honey",
    "northern-lights-gummies": "50 mg each · 10 pieces · Black Cherry & Lavender",
    "northern-lights": "1/8 oz · Indica",
    "jack-herer": "1/8 oz · Sativa",
    "runtz": "1/8 oz · Hybrid",
    "rso-thc": "1 g applicator · two profiles",
    "rso-cbd": "1 g applicator · ACDC",
    "sundial-sativa": "Seven-Pack · 7 × 0.75 g · Jack Herer",
    "sundial-hybrid": "Seven-Pack · 7 × 0.75 g · Blue Dream",
    "sundial-indica": "Seven-Pack · 7 × 0.75 g · Northern Lights",
    "relief-salve": "2 oz · 3,000 mg CBD + 500 mg THC",
    "flower-flight": "Six minis · three profiles"
  };

  HP.PRODUCTS = HP.PRODUCTS.filter(function (p) {
    return STORE_IDS.indexOf(p.id) > -1;
  });

  HP.PRODUCTS.forEach(function (p) {
    if (p.category === "flower") {
      p.variants = p.variants.slice(0, 1);
      p.photos = p.photos.slice(0, 2);
    }
    if (p.category === "gummies") {
      p.variants = p.variants.filter(function (x) {
        return x.opts[0] === "50 mg" && x.opts[1] === "10-pack";
      });
    }
    if (p.category === "prerolls") p.variants = p.variants.slice(-1);
    if (p.id === "rso-thc") {
      p.variants = p.variants.slice(0, 2);
      p.photos = p.variants[0].photos;
      p.profile = "indica";
      p.variants.forEach(function (variant) { variant.note = "1 g applicator"; });
    }
    if (p.id === "rso-cbd") {
      p.variants = p.variants.slice(2, 3);
      p.variants.forEach(function (variant) { variant.note = "1 g applicator"; });
    }

    p.rating = null;
    p.reviews = null;
    p.lab = null;
    p.effects = [];
    p.terpenes = [];
    p.potency = null;
    p.ingredients = null;
    p.subtitle = STORE_SUBTITLE[p.id] || p.subtitle;
    p.short = STORE_COPY[p.id] || p.short;
    p.description = p.short;
    p.specs = {
      "Format": p.subtitle,
      "Profile": HP.PROFILES[p.profile] ? HP.PROFILES[p.profile].label : "High Pie",
      "SKU": (p.variants[0] && p.variants[0].sku) || "High Pie"
    };
  });

  /* ------------------------------------------------------------ Accessors */
  HP.byId = function (id) {
    for (var i = 0; i < HP.PRODUCTS.length; i++) {
      if (HP.PRODUCTS[i].id === id) return HP.PRODUCTS[i];
    }
    return null;
  };

  HP.profileOf = function (p) {
    return HP.PROFILES[p && p.profile] || HP.PROFILES.hybrid;
  };

  /* Lowest price across a product's variants — what the card shows. */
  HP.fromPrice = function (p) {
    return p.variants.reduce(function (min, x) {
      return x.price < min ? x.price : min;
    }, Infinity);
  };

  HP.priceRange = function (p) {
    var lo = Infinity, hi = 0;
    p.variants.forEach(function (x) {
      if (x.price < lo) lo = x.price;
      if (x.price > hi) hi = x.price;
    });
    return { lo: lo, hi: hi, single: lo === hi };
  };

  HP.totalStock = function (p) {
    return p.variants.reduce(function (n, x) { return n + (x.stock || 0); }, 0);
  };

  /* A stable line-item key: product + selected option indices. */
  HP.variantKey = function (productId, optIndex) {
    return productId + "::" + optIndex;
  };

  HP.resolve = function (key) {
    var match = /^([^:]+)::(0|[1-9]\d*)$/.exec(String(key));
    if (!match) return null;
    var parts = [match[0], match[1], match[2]];
    var p = HP.byId(parts[1]);
    if (!p) return null;
    var idx = Number(parts[2]);
    var variant = p.variants[idx];
    if (!variant) return null;
    return { product: p, variant: variant, index: idx };
  };

  HP.money = function (cents) {
    return "$" + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /* Compact form for cards — drops ".00" so grids read cleanly. */
  HP.moneyShort = function (cents) {
    var s = HP.money(cents);
    return s.replace(/\.00$/, "");
  };

})(window);
