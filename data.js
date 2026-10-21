// Getchells Strategy Copilot — data
// Real game data through Round 1. Add a new entry to `rounds` and update base/defaults/rivals after each round.

window.SIM = {
  company: "Getchells",
  dataVersion: "R2-results-v5",  // bump whenever data is updated (clears stale browser saves)
  round: 3,

  // Current financial position ($M) — END OF ROUND 2 (exported CSVs, exact)
  base: {
    revenue: 488.7, cogs: 311.3, depreciation: 29.86, otherSGA: 24.43,
    interest: 23.45, cash: 27.47, debt: 241.45, stLoans: 117.40, equity: 123.41, ap: 30.50,
    inventory: 61.31, receivables: 20.08, netPPE: 286.50,
    wacc: 9.4, marketValue: 361.9, budget: 73.1, stores: 185, clv: 1075.0,
    netIncome: 22.84, pe: 15.8, growth: 0.12
    // budget 73.1 = ESTIMATE: max(14% × 488.7 = 68.4, 71.42 × ~1.023 inflation). growth = expected revenue growth with no changes (R1→R2 was +14.5%)
  },

  // Last submitted decisions = Round 2
  defaults: {
    online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8,
    markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6,
    privateBrand: 60, stores: 185, depth: 30
  },

  quadrants: ["Brand", "Experience", "Low Price", "Frictionless"],

  // Matrix scores 0–10: [Brand, Experience, Low Price, Frictionless] — END OF ROUND 1 FINAL, from the 4 detail charts (±0.2)
  rivals: {
    "Getchells": [5.1, 6.2, 4.8, 3.5],
    "Cadabra":   [4.3, 2.6, 5.0, 7.6],
    "PriceMart": [1.9, 3.7, 5.0, 3.0],
    "AIM":       [3.7, 1.1, 5.5, 1.4],
    "KT Benny":  [2.8, 4.1, 4.9, 1.8],
    "Zephara":   [5.0, 6.3, 4.9, 3.7],
    "BestCo":    [3.9, 3.4, 5.0, 5.6]
  },

  // Fair value = 75% of the leader (official rule, Intro slides). The game's white line looked closer to ~66%; we plan to the stricter 75%.
  fairRatio: 0.75,

  // History from the quadrant detail charts: rounds −2..1 (R1 = final, after undo). Game's white line ≈ 66% of leader.
  trendRounds: [-2, -1, 0, 1],
  trend: [
    { "Getchells": [6.2, 6.2, 6.2, 5.1], "Zephara": [5.1, 4.9, 4.8, 5.0], "Cadabra": [4.4, 4.1, 4.1, 4.3], "AIM": [3.8, 3.5, 3.4, 3.7], "BestCo": [3.1, 3.4, 3.5, 3.9], "KT Benny": [2.2, 2.4, 2.5, 2.8], "PriceMart": [1.8, 1.8, 1.8, 1.9], "Fair value": [4.1, 4.1, 4.1, 3.4] },
    { "Zephara": [5.8, 6.3, 6.4, 6.3], "Getchells": [5.1, 5.6, 5.7, 6.2], "Cadabra": [6.6, 4.1, 3.0, 2.6], "KT Benny": [2.4, 3.1, 3.7, 4.1], "PriceMart": [2.4, 2.9, 3.4, 3.7], "BestCo": [2.3, 2.8, 3.2, 3.4], "AIM": [2.1, 1.6, 1.3, 1.1], "Fair value": [4.3, 4.1, 4.2, 4.2] },
    { "AIM": [5.4, 5.4, 5.3, 5.5], "BestCo": [5.1, 5.0, 5.0, 5.0], "PriceMart": [5.0, 5.0, 5.0, 5.0], "Getchells": [5.0, 4.9, 4.9, 4.8], "Cadabra": [5.0, 4.9, 4.9, 5.0], "KT Benny": [4.9, 4.8, 4.8, 4.9], "Zephara": [4.7, 4.7, 4.75, 4.9], "Fair value": [3.6, 3.6, 3.55, 3.6] },
    { "Cadabra": [9.7, 8.3, 7.9, 7.6], "BestCo": [3.7, 4.4, 5.1, 5.6], "Zephara": [2.6, 3.1, 3.6, 3.7], "Getchells": [3.2, 3.4, 3.4, 3.5], "PriceMart": [1.9, 2.3, 2.8, 3.0], "AIM": [2.2, 1.8, 1.8, 1.4], "KT Benny": [0.9, 1.1, 1.6, 1.8], "Fair value": [6.5, 5.5, 5.2, 5.1] }
  ],

  // Why each retailer lands where it does (from the game's company profiles)
  why: {
    "Getchells": ["#1 (5.1) by a hair: PB + NB quality 6", "#2 (6.2), 0.1 behind Zephara: service $15M + experience $15M", "4.8: in the flat tie, vendor cut to $25M", "3.5: below fair (5.1); online $9M still lagging"],
    "Cadabra":   ["Steady ~4.4", "Collapsed: 6.6 → 2.9", "Competitive pricing on Cadabra Retail", "Still #1 (~7.6)"],
    "PriceMart": ["Inferior-quality goods; last (1.9)", "Rising steadily: 2.4 → 3.9", "Everyday low pricing, field still tied", "Rising: 1.9 → 3.1"],
    "AIM":       ["Recovering: 3.4 → 3.8", "Last and falling (1.2)", "Narrowly leads a flat tie", "Weak (1.6)"],
    "KT Benny":  ["Rising slowly (2.9)", "Rising fast: 2.4 → 4.2", "Low-end mall anchor", "Rising from a low base (1.9)"],
    "Zephara":   ["Neck-and-neck with us (~5.0)", "Neck-and-neck with us (~6.5)", "Premium feel; mass brands added", "Rising: 2.6 → 4.0"],
    "BestCo":    ["Rising (4.0)", "Rising (3.7)", "Buying power + low overhead", "Rising fastest: 3.7 → 6.0"]
  },

  // One-minute read: each rival's competitive edge
  edges: [
    { n: "Getchells", real: "Macy's",   q: "Brand #1 + Experience #2", edge: "MV +97.5% to $184M; CLV $944M; net income $11.1M", weak: "Frictionless below fair; debt $250M" , us: true },
    { n: "Cadabra",   real: "Amazon",    q: "Frictionless #1", edge: "Few-click buying + massive customer data", weak: "Slowest growth (+5.5%); Experience collapsed" },
    { n: "PriceMart", real: "Walmart",   q: "Low Price (tie)",    edge: "Biggest revenue ($718M, +13%); owns higher-cost share", weak: "Poor brand (1.9)" },
    { n: "BestCo",    real: "Costco",    q: "Frictionless #2 ↑",    edge: "Fastest growth (+18%); Frictionless 6.0 and rising", weak: "Austere stores" },
    { n: "Zephara",   real: "Sephora",   q: "Brand + Experience rival",   edge: "Our direct rival in BOTH target quadrants", weak: "Depends on foot traffic" },
    { n: "AIM",       real: "Target",    q: "Low Price #1",     edge: "Cheap-but-chic, narrowly leads on price", weak: "Experience last (1.2)" },
    { n: "KT Benny",  real: "JCPenney",  q: "Rising",         edge: "+15.6% revenue; Experience 2.4 → 4.2", weak: "Still smallest" }
  ],

  // What each quadrant means for Getchells
  quadNotes: [
    { sub: "Branded performance superiority", note: "#1 by 0.1 over Zephara. DEFEND: keep PB + NB quality 6." },
    { sub: "Enhanced customer experience",    note: "#2, only 0.1 behind Zephara. WIN: keep service $15M + experience $15M." },
    { sub: "Operational excellence, lowest cost", note: "Flat tie; we're 4.8 vs fair 3.6. HOLD: vendor $25M is enough for now." },
    { sub: "Customer understanding, convenience", note: "Our only gap: 3.5 vs game fair line 5.1. FIX: online up with the spare budget." }
  ],

  // REAL segment data (Round 0 Preferences chart, read by bar length).
  // weights → [Brand, Experience, Low Price, Frictionless]: Experience = shopping exp + ½ service; Frictionless = online + ½ service.
  // clvShare = share of OUR CLV ($818M); rev = share of OUR revenue ($373M).
  segments: [
    { id: 1, name: "Online Bargain",     wants: "Online + low price + service · never in stores", clvShare: 0.19, rev: 0.21, weights: [0.05, 0.15, 0.33, 0.47], rival: "Cadabra" },
    { id: 2, name: "Breadth Shoppers",   wants: "Huge selection + stores + price",              clvShare: 0.23, rev: 0.26, weights: [0.14, 0.32, 0.24, 0.30], rival: "PriceMart / AIM" },
    { id: 3, name: "Brand Lovers",       wants: "Brand + shopping experience",                  clvShare: 0.13, rev: 0.15, weights: [0.29, 0.42, 0.13, 0.16], rival: "Zephara" },
    { id: 4, name: "Omni Mix",           wants: "Online + stores + price",                      clvShare: 0.09, rev: 0.10, weights: [0.12, 0.30, 0.23, 0.35], rival: "AIM / KT Benny" },
    { id: 5, name: "Experience Seekers", wants: "Shopping experience above all + stores",       clvShare: 0.21, rev: 0.28, weights: [0.13, 0.53, 0.12, 0.22], rival: "Zephara" },
    { id: 6, name: "Store Bargain",      wants: "Stores + price + breadth · zero depth",        clvShare: 0.15, rev: 0.00, weights: [0.13, 0.40, 0.26, 0.21], rival: "BestCo" }
  ],

  // Market-wide preference intensity (sum of 6 segments), Round 0
  prefs: [
    { n: "Shopping experience", v: 1.44, q: "Experience" }, { n: "Breadth", v: 1.41, q: "Assortment" },
    { n: "Retail stores", v: 1.15, q: "Stores" }, { n: "Low price", v: 1.12, q: "Low Price" },
    { n: "Online", v: 1.02, q: "Frictionless" }, { n: "Customer service", v: 0.96, q: "Frict. / Exp." },
    { n: "Depth", v: 0.92, q: "Assortment" }, { n: "Brand", v: 0.80, q: "Brand" }
  ],

  // Our history (Data → Market CLV / Market Revenue for your company)
  ourTrend: { rounds: [-2, -1, 0, 1, 2], clv: [680.1, 738.0, 818.5, 943.7, 1075.0], revenue: [314.7, 342.0, 372.8, 426.7, 488.7] },

  // ---- Decision log: what we submitted each round (for the Timeline page) ----
  decisionLog: [
    { round: 0, label: "R0 (inherited)", d: { online: 2, service: 15, experience: 10, vendor: 30, analytics: 10, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, privateBrand: 50, stores: 200, depth: 50 } },
    { round: 1, label: "R1 try 1 (undone)", d: { online: 9, service: 7, experience: 15, vendor: 30, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, privateBrand: 60, stores: 185, depth: 30 } },
    { round: 1, label: "R1 final", d: { online: 9, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 } },
    { round: 2, label: "R2", d: { online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 } }
  ],
  // What each round's changes did (cause → effect → lesson)
  lessons: [
    { round: 1, title: "Round 1 · try 1 (undone)",
      changes: ["Service $15M → $7M", "Analytics $10M → $6M", "Online $2M → $9M", "Experience $10M → $15M", "Depth 50 → 30, stores 200 → 185, PB 60%"],
      results: ["MV $113.0M (+21%)", "Brand 6.2 → 4.7 (lost #1)", "Experience 5.7 → 4.8", "Net income $8.2M"],
      lesson: "Cutting service wiped out the experience and online gains." },
    { round: 1, title: "Round 1 · final (kept)",
      changes: ["Same as try 1, EXCEPT:", "Service back to $15M (not $7M)", "PB + NB quality 5 → 6", "Vendor $30M → $25M", "Analytics $5.8M"],
      results: ["MV $184.1M (+97.5%) vs $113M", "Brand 5.1 (#1), Experience 6.2 (#2, 0.1 behind)", "Net income $11.1M; CLV $944M", "Debt $287M → $250M; inventory days 72"],
      lesson: "Model retrained on this A/B test: re-running try 1 now predicts Brand 4.7, Experience 4.8, Low Price 4.9, Frictionless 2.7 (all exact) and MV $105M (actual $113M). Controlled experiment: +$8M service and +1 quality turned +21% into +97.5%. Service is our strongest Experience lever (+$8M ≈ +1.4 Experience); quality 6 ≈ +0.4 Brand. Depth/stores/PB cuts still delivered the cash and debt gains." }
,
    { round: 2, title: "Round 2 (online $9M → $10.5M only)",
      changes: ["Online $9M → $10.5M", "Everything else unchanged", "$0.12M of budget unspent"],
      results: ["MV $361.9M (+96.6%); model forecast was $185M", "Net income $11.1M → $22.8M (revenue +14.5%, opex flat)", "Debt $250.0M → $241.4M; ROE 18.5%", "WACC 7.9% → 9.4%; P/E 15.8"],
      lesson: "Market value = P/E × net income in every round so far. Holding spending flat while revenue grows ~12–15% doubles profit, so value doubles. Model rebuilt on this." }
  ],

  // ---- Impact guide: how much change → how much effect (guesses + confidence) ----
  impacts: [
    { lever: "Customer service", by: "+$1M", effect: "Experience +0.15, Frictionless +0.05; profit −$1M", conf: "High", evidence: "R1 try 1 vs final: service $7M → $15M (+ quality 6) moved Experience 4.8 → 6.2 and MV $113M → $184M" },
    { lever: "Shopping experience", by: "+$1M", effect: "Experience +0.05 to +0.1; ~80% expensed this year", conf: "Low", evidence: "R1: +$5M did not offset the service cut; only $12M of $15M hit the P&L" },
    { lever: "Online", by: "+$1M", effect: "Frictionless +0.1, mostly NEXT round; only 40% expensed", conf: "Low", evidence: "R1: $2M → $9M showed no gain yet (lag); slides: online is partly capitalized" },
    { lever: "Vendor management", by: "+$1M", effect: "Unit cost −0.1 to −0.2%, Low Price +0.05; compounds each round", conf: "Medium", evidence: "Professor's slides: most reliable long-term lever; rivals now avg $33.5M" },
    { lever: "Customer analytics", by: "+$1M", effect: "Frictionless + Experience +0.05 each, mostly by amplifying online & experience spend", conf: "Medium", evidence: "Intro slide maps analytics to Frictionless/Experience; MV slide calls it a multiplier. R1 cut $10M → $6M likely part of the drop" },
    { lever: "National brand quality", by: "+1 step", effect: "Brand +0.2 to +0.4 (with PB quality +1); unit cost +1–2%", conf: "Medium", evidence: "Intro slide: carrying high-quality brands = Brand quadrant. Untested by us" },
    { lever: "Private brand quality", by: "+1 step", effect: "Brand +0.2 to +0.4; unit cost +~1%", conf: "Low", evidence: "Untested; would offset PB 60% dilution" },
    { lever: "Private brand %", by: "+10 pts", effect: "Unit cost −~1% (margin up); Brand −0.2 to −0.4 at quality 5; CLV value up", conf: "Medium", evidence: "R1: our cost rose 5.3% vs ~6.3% for rivals; Brand fell 1.5 (with depth cut)" },
    { lever: "Depth", by: "−10", effect: "Inventory −~$4M (cash → debt), days −9; Brand/Experience −0.2 to −0.4", conf: "Medium", evidence: "R1: −20 → inventory −$7.9M, days 90 → 72; Brand & Experience both fell" },
    { lever: "Breadth", by: "−10", effect: "Revenue −2 to −4% (customers' #2 value, 1.41); small cash gain", conf: "Low", evidence: "Preferences chart; we haven't changed it. Keep at 50" },
    { lever: "Stores", by: "−5", effect: "Debt −~$5M, sales/store up; revenue −~1%, share −0.1 pt", conf: "Medium", evidence: "R1: −15 stores → sales/store +15.9% but share 13.5% → 13.2%; retail pref rose to 1.15" },
    { lever: "Markup (lower-cost)", by: "−1 pt", effect: "Low Price +0.05 to +0.1; gross margin −0.6 pt; units +1–2%", conf: "Low", evidence: "Intro slide: markup = Low Price quadrant. Immediate, no persistence" },
    { lever: "Net income", by: "+$1M", effect: "Market value +~$14M (P/E 13.9)", conf: "Medium", evidence: "R1 scorecard: P/E 13.9; assumes P/E stays similar" },
    { lever: "Debt", by: "−$10M", effect: "Interest −~$1M/yr → net income +$0.65M → MV +~$9M; better WACC/credit", conf: "Medium", evidence: "R1: interest $25.5M on $250.5M debt ≈ 10.2%; tax ~35%" }
  ],

  // ---- Top 3 plans for the next round (levers in $M / % / count). Breadth stays 50/50 in all plans. ----
  plans: [
    {
      id: "A", name: "Take Experience #1, stay lean", badge: "Recommended", segs: [5, 3],
      tag: "Experience $17M + service $16M, funded by vendor + analytics · ≈$70.5M of ~$73M",
      levers: { vendor: 23, online: 10.5, experience: 17, service: 16, analytics: 4, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 },
      why: [
        "<b>Value = P/E × net income</b> (true in all 3 rounds): keep total spend about flat so revenue growth falls to profit.",
        "<b>Experience 6.2 → ≈6.6</b> passes Zephara (6.3): two leads (Brand + Experience), the professor's sweet spot.",
        "<b>Service is our proven lever</b> (+$8M = +1.4 Experience in Round 1); rivals' max is now $16.8M.",
        "<b>Leaves ≈$2.5M unspent</b>; the professor says we don't have to spend it all."
      ],
      risks: ["Vendor $23M is far below the $34.6M average; unit costs keep rising ~6%/yr.", "Frictionless stays below fair value."]
    },
    {
      id: "B", name: "Hold & bank profit", badge: "Safe", segs: [5, 3],
      tag: "Change nothing",
      levers: { vendor: 25, online: 10.5, experience: 15, service: 15, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 },
      why: ["<b>Same inputs just doubled value</b> twice in a row.", "Revenue growth alone lifts net income."],
      risks: ["Zephara could pass us in Brand or Experience while we stand still."]
    },
    {
      id: "C", name: "Experience #1, no cuts to analytics", badge: "Middle", segs: [5, 3],
      tag: "Experience $17M funded by vendor only",
      levers: { vendor: 23, online: 10.5, experience: 17, service: 15, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 },
      why: ["<b>Experience ≈6.5</b> takes #1; analytics kept as a multiplier."],
      risks: ["Smaller profit gain than Plan A."]
    }
  ],

  // ---- Round-by-round snapshots (real game data). Add one per round. ----
  rounds: [
    {
      round: 0, label: "Before Round 1",
      kpi: { marketValue: 93.2, mvChange: 9.0, revenue: 372.8, ebit: 23.8, interest: 30.1, netIncome: -6.3,
             debt: 286.9, equity: 89.5, currentRatio: 0.56, roic: 6.8, wacc: 7.8, onlineSales: 51.3,
             grossMargin: 36.2, daysInventory: 90, budget: 69.8, clv: 818.5 },
      // Kahn Matrix from the quadrant detail charts (±0.2): [Brand, Experience, Low Price, Frictionless]
      matrix: { getchells: [6.2, 5.7, 4.9, 3.4], leader: [6.2, 6.4, 5.3, 7.9], fair: [4.1, 4.2, 3.55, 5.2] },
      // Market share by revenue [lower-cost, higher-cost] %, Data → Market Share donut + Revenue Breakdown (total market $2.75B)
      share: {
        "PriceMart": [12.0, 11.1], "BestCo": [10.3, 5.4], "Cadabra": [10.1, 5.4], "Getchells": [10.3, 3.3],
        "Zephara": [10.8, 1.8], "AIM": [8.2, 2.4], "KT Benny": [8.4, 0.6]
      },
      // Revenue $M and online share (Revenue by company and access point)
      revenue: { "PriceMart": 636.4, "BestCo": 430.8, "Cadabra": 425.6, "Getchells": 372.8, "Zephara": 347.9, "AIM": 290.2, "KT Benny": 248.0 },
      online:  { "PriceMart": 51, "BestCo": 51, "Cadabra": 100, "Getchells": 51.3, "Zephara": 53, "AIM": 55, "KT Benny": 54 },
      // Our decisions vs Industry Decisions tab
      industry: [
        { name: "Markup · lower-cost",  ours: 54, avg: 47.06, min: 25.76, max: 71.09, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 52.34, min: 25.76, max: 82.42, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 43, min: 22, max: 78, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 5, max: 50, unit: "" },
        { name: "Depth · lower-cost",   ours: 50, avg: 32, min: 21, max: 50, unit: "" },
        { name: "Depth · higher-cost",  ours: 50, avg: 24, min: 6, max: 50, unit: "" },
        { name: "Private brand · lower", ours: 50, avg: 44, min: 1, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 50, avg: 39, min: 1, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 5, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 5, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 200, avg: 236, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 2.0, avg: 9.61, min: 2.0, max: 18.75, unit: "$M" },
        { name: "Customer service", ours: 15.0, avg: 10.10, min: 4.84, max: 15.0, unit: "$M" },
        { name: "Shopping experience", ours: 10.0, avg: 7.80, min: 0, max: 12.03, unit: "$M" },
        { name: "Vendor management", ours: 30.0, avg: 31.68, min: 12.03, max: 56.72, unit: "$M" },
        { name: "Customer analytics", ours: 10.0, avg: 7.19, min: 2.41, max: 10.0, unit: "$M" }
      ],
      headline: "Customers like us. <span class=\"hl\">Our debt is the problem.</span>",
      moves: [
        "<b>Win Experience</b>: customers' #1 value (1.44), and Experience Seekers are already our biggest segment (28% of revenue).",
        "<b>Fix Frictionless</b>: our only gap. Move money from service + analytics into online.",
        "<b>Cut debt the smart way</b>: trim depth (customers' #7 value), KEEP breadth (#2), open no stores.",
        "<b>Defend Brand cheaply</b>: we're #1, but it's customers' lowest value (0.80). No extra quality spend."
      ]
    },
    {
      round: 1, label: "After Round 1 (final)",
      kpi: { marketValue: 184.1, mvChange: 97.5, revenue: 426.7, ebit: 42.5, interest: 25.4, netIncome: 11.1,
             debt: 250.0, equity: 100.6, currentRatio: 0.62, roic: 12.2, wacc: 7.9, onlineSales: 50.5,
             grossMargin: 36.2, daysInventory: 72, budget: 71.4, clv: 943.7 },
      matrix: { getchells: [5.1, 6.2, 4.8, 3.5], leader: [5.1, 6.3, 5.5, 7.6], fair: [3.8, 4.7, 4.1, 5.7] },
      share: {
        "PriceMart": [12.0, 11.4], "BestCo": [10.4, 6.0], "Cadabra": [9.7, 4.8], "Getchells": [10.4, 3.5],
        "Zephara": [10.6, 1.7], "AIM": [8.0, 2.2], "KT Benny": [8.6, 0.7]
      },
      revenue: { "PriceMart": 717.2, "BestCo": 503.2, "Cadabra": 443.4, "Getchells": 426.7, "Zephara": 375.2, "AIM": 313.2, "KT Benny": 285.6 },
      industry: [
        { name: "Markup · lower-cost",  ours: 54, avg: 47.81, min: 26.02, max: 71.80, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 53.03, min: 26.02, max: 83.25, unit: "%" },
        { name: "Depth · lower-cost",   ours: 30, avg: 30, min: 21, max: 34, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 46, min: 1, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 234, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 9.0, avg: 11.0, min: 6.05, max: 18.25, unit: "$M" },
        { name: "Customer service", ours: 15.0, avg: 10.86, min: 5.05, max: 15.0, unit: "$M" },
        { name: "Shopping experience", ours: 15.0, avg: 8.88, min: 0, max: 15.0, unit: "$M" },
        { name: "Vendor management", ours: 25.0, avg: 32.76, min: 13.21, max: 61.07, unit: "$M" },
        { name: "Customer analytics", ours: 5.8, avg: 6.75, min: 2.64, max: 10.57, unit: "$M" }
      ],
      headline: "MV +97.5% to $184M. <span class=\"hl\">Brand #1, Experience 0.1 from #1.</span>",
      moves: [
        "<b>Keep the formula</b>: service $15M, experience $15M, quality 6/6, depth 30, 185 stores.",
        "<b>Fix Frictionless</b> (3.5 vs fair 5.1): online up with the spare $1.6M.",
        "<b>Optional</b>: $2M vendor → experience to take Experience #1 (Plan B)."
      ]
    },
    {
      round: 2, label: "After Round 2",
      kpi: { marketValue: 361.9, mvChange: 96.6, revenue: 488.7, ebit: 58.6, interest: 23.5, netIncome: 22.8,
             debt: 241.4, equity: 123.4, currentRatio: 0.74, roic: 16.4, wacc: 9.4, onlineSales: 50.0,
             grossMargin: 36.3, daysInventory: 72, budget: 73.1, clv: 1075.0 },
      matrix: { getchells: [5.1, 6.2, 4.8, 3.5], leader: [5.1, 6.3, 5.5, 7.6], fair: [3.8, 4.7, 4.1, 5.7] },
      industry: [
        { name: "Markup · lower-cost",  ours: 54, avg: 48.68, min: 26.28, max: 72.52, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 53.90, min: 26.28, max: 84.08, unit: "%" },
        { name: "Depth · lower-cost",   ours: 30, avg: 29, min: 21, max: 35, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 47, min: 2, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 233, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 10.5, avg: 12.44, min: 6.93, max: 20.90, unit: "$M" },
        { name: "Customer service", ours: 15.0, avg: 11.81, min: 5.43, max: 16.79, unit: "$M" },
        { name: "Shopping experience", ours: 15.0, avg: 9.58, min: 0, max: 15.0, unit: "$M" },
        { name: "Vendor management", ours: 25.0, avg: 34.61, min: 14.55, max: 65.94, unit: "$M" },
        { name: "Customer analytics", ours: 5.8, avg: 6.82, min: 2.91, max: 11.64, unit: "$M" }
      ],
      headline: "MV +96.6% to $362M. <span class=\"hl\">Profit doubled; send matrix charts.</span>",
      moves: [
        "<b>Value = P/E × net income</b>: protect profit; every +$1M net income ≈ +$16M value.",
        "<b>Keep the formula</b>; rivals now spend more on service ($16.8M max) and online (avg $12.4M).",
        "<b>Matrix scores below are Round 1</b>: send the 4 quadrant detail charts for Round 2."
      ]
    }
  ]
};
