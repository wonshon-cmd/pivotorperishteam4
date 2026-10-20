// Getchells Strategy Copilot — data
// Real game data through Round 1. Add a new entry to `rounds` and update base/defaults/rivals after each round.

window.SIM = {
  company: "Getchells",
  round: 2,

  // Current financial position ($M) — real game data, END OF ROUND 1 (before Round 2)
  base: {
    revenue: 403.6, cogs: 257.5, depreciation: 27.26, otherSGA: 20.18,
    interest: 25.5, cash: 25.54, debt: 250.5, stLoans: 128.7, equity: 97.64, ap: 25.6,
    inventory: 50.76, receivables: 16.59, netPPE: 280.83,
    wacc: 7.9, marketValue: 113.0, budget: 71.2, stores: 185, clv: 852.5
    // budget 71.2 = ESTIMATE (prior $69.8M + ~2% inflation); replace with the game's number
  },

  // Last submitted decisions = Round 1 (Plan A)
  defaults: {
    online: 9, service: 7, experience: 15, vendor: 30, analytics: 6,
    markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5,
    privateBrand: 60, stores: 185, depth: 30
  },

  quadrants: ["Brand", "Experience", "Low Price", "Frictionless"],

  // Matrix scores 0–10: [Brand, Experience, Low Price, Frictionless]
  // END OF ROUND 1, read from the game's quadrant detail charts (±0.2).
  // Low Price R1 detail chart not captured yet → R0 values kept. Frictionless: ours ~2.7 (unconfirmed).
  rivals: {
    "Getchells": [4.7, 4.8, 4.9, 2.7],
    "Cadabra":   [4.4, 2.9, 4.9, 7.9],
    "PriceMart": [1.9, 3.9, 5.0, 3.1],
    "AIM":       [3.8, 1.2, 5.3, 1.6],
    "KT Benny":  [2.9, 4.2, 4.8, 1.9],
    "Zephara":   [5.1, 6.7, 4.75, 4.0],
    "BestCo":    [4.0, 3.7, 5.0, 6.0]
  },

  // Fair value = 75% of the leader (official rule, Intro slides). The game's white line looked closer to ~66%; we plan to the stricter 75%.
  fairRatio: 0.75,

  // History from the quadrant detail charts: rounds −2, −1, 0, 1 (Low Price R1 = estimate)
  trendRounds: [-2, -1, 0, 1],
  trend: [
    { "Getchells": [6.2, 6.2, 6.2, 4.7], "Zephara": [5.1, 4.9, 4.8, 5.1], "Cadabra": [4.4, 4.1, 4.1, 4.4], "AIM": [3.8, 3.5, 3.4, 3.8], "BestCo": [3.1, 3.4, 3.5, 4.0], "KT Benny": [2.2, 2.4, 2.5, 2.9], "PriceMart": [1.8, 1.8, 1.8, 1.9], "Fair value": [4.1, 4.1, 4.1, 3.4] },
    { "Zephara": [5.8, 6.3, 6.4, 6.7], "Getchells": [5.1, 5.6, 5.7, 4.8], "Cadabra": [6.6, 4.1, 3.0, 2.9], "KT Benny": [2.4, 3.1, 3.7, 4.2], "PriceMart": [2.4, 2.9, 3.4, 3.9], "BestCo": [2.3, 2.8, 3.2, 3.7], "AIM": [2.1, 1.6, 1.3, 1.2], "Fair value": [4.3, 4.1, 4.2, 4.5] },
    { "AIM": [5.4, 5.4, 5.3, 5.3], "BestCo": [5.1, 5.0, 5.0, 5.0], "PriceMart": [5.0, 5.0, 5.0, 5.0], "Getchells": [5.0, 4.9, 4.9, 4.9], "Cadabra": [5.0, 4.9, 4.9, 4.9], "KT Benny": [4.9, 4.8, 4.8, 4.8], "Zephara": [4.7, 4.7, 4.75, 4.75], "Fair value": [3.6, 3.6, 3.55, 3.55] },
    { "Cadabra": [9.7, 8.3, 7.9, 7.9], "BestCo": [3.7, 4.4, 5.1, 6.0], "Zephara": [2.6, 3.1, 3.6, 4.0], "Getchells": [3.2, 3.4, 3.4, 2.7], "PriceMart": [1.9, 2.3, 2.8, 3.1], "AIM": [2.2, 1.8, 1.8, 1.6], "KT Benny": [0.9, 1.1, 1.6, 1.9], "Fair value": [6.5, 5.5, 5.2, 5.3] }
  ],

  // Why each retailer lands where it does (from the game's company profiles)
  why: {
    "Getchells": ["Fell 6.2 → 4.7: lost #1 (depth cut, PB 60% at quality 5)", "Fell 5.7 → 4.8 despite $15M: service cut to $7M", "Unchanged estimate; check R1 chart", "Still a gap (~2.7): online lags, service cut"],
    "Cadabra":   ["Steady ~4.4", "Collapsed: 6.6 → 2.9", "Competitive pricing on Cadabra Retail", "Still #1 (7.9), stopped falling"],
    "PriceMart": ["Inferior-quality goods; last (1.9)", "Rising steadily: 2.4 → 3.9", "Everyday low pricing, field still tied", "Rising: 1.9 → 3.1"],
    "AIM":       ["Recovering: 3.4 → 3.8", "Last and falling (1.2)", "Narrowly leads a flat tie", "Weak (1.6)"],
    "KT Benny":  ["Rising slowly (2.9)", "Rising fast: 2.4 → 4.2", "Low-end mall anchor", "Rising from a low base (1.9)"],
    "Zephara":   ["NEW #1 (5.1) after we slipped", "#1 and still rising (6.7)", "Premium feel; mass brands added", "Rising: 2.6 → 4.0"],
    "BestCo":    ["Rising (4.0)", "Rising (3.7)", "Buying power + low overhead", "Rising fastest: 3.7 → 6.0"]
  },

  // One-minute read: each rival's competitive edge
  edges: [
    { n: "Getchells", real: "Macy's",   q: "Brand #2 ↓", edge: "Profitable again; debt falling; lowest cost growth", weak: "Lost Brand #1; Experience + Frictionless slipped" , us: true },
    { n: "Cadabra",   real: "Amazon",    q: "Frictionless #1", edge: "Few-click buying + massive customer data", weak: "Slowest growth (+5.5%); Experience collapsed" },
    { n: "PriceMart", real: "Walmart",   q: "Low Price (tie)",    edge: "Biggest revenue ($718M, +13%); owns higher-cost share", weak: "Poor brand (1.9)" },
    { n: "BestCo",    real: "Costco",    q: "Frictionless #2 ↑",    edge: "Fastest growth (+18%); Frictionless 6.0 and rising", weak: "Austere stores" },
    { n: "Zephara",   real: "Sephora",   q: "Brand #1 + Experience #1",   edge: "Now leads BOTH our target quadrants", weak: "Depends on foot traffic" },
    { n: "AIM",       real: "Target",    q: "Low Price #1",     edge: "Cheap-but-chic, narrowly leads on price", weak: "Experience last (1.2)" },
    { n: "KT Benny",  real: "JCPenney",  q: "Rising",         edge: "+15.6% revenue; Experience 2.4 → 4.2", weak: "Still smallest" }
  ],

  // What each quadrant means for Getchells
  quadNotes: [
    { sub: "Branded performance superiority", note: "We slipped to 4.7, Zephara leads at 5.1. WIN back: only 0.4 needed (NB quality 6)." },
    { sub: "Enhanced customer experience",    note: "We fell to 4.8, just above fair (4.5); Zephara 6.7. DEFEND: restore service to $10M." },
    { sub: "Operational excellence, lowest cost", note: "Flat tie (R0 data). HOLD: vendor mgmt to ~avg ($33M). Our unit cost rose least." },
    { sub: "Customer understanding, convenience", note: "Still a gap (~2.7 vs fair 5.3). FIX: online $11M + service $10M." }
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
  ourTrend: { rounds: [-2, -1, 0, 1], clv: [680.1, 738.0, 818.5, 852.5], revenue: [314.7, 342.0, 372.8, 403.6] },

  // ---- Decision log: what we submitted each round (for the Timeline page) ----
  decisionLog: [
    { round: 0, label: "R0 (inherited)", d: { online: 2, service: 15, experience: 10, vendor: 30, analytics: 10, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, privateBrand: 50, stores: 200, depth: 50 } },
    { round: 1, label: "R1 (Plan A)",    d: { online: 9, service: 7, experience: 15, vendor: 30, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, privateBrand: 60, stores: 185, depth: 30 } }
  ],
  // What each round's changes did (cause → effect → lesson)
  lessons: [
    { round: 1,
      changes: ["Service $15M → $7M", "Analytics $10M → $6M", "Online $2M → $9M", "Experience $10M → $15M", "Depth 50 → 30", "Stores 200 → 185", "Private brand 50% → 60%"],
      results: ["MV $93.2M → $113.0M (+21%)", "Net income −$6.3M → +$8.2M", "Debt −$36.5M; inventory days 90 → 72", "Brand 6.2 → 4.7 (lost #1)", "Experience 5.7 → 4.8 (below 75% fair)", "Frictionless ~3.4 → ~2.7 (gap)"],
      lesson: "Cost cuts (depth, stores, service, analytics) fixed the money fast. But service + analytics feed Experience AND Frictionless, so cutting them cancelled the online and experience increases." }
  ],

  // ---- Impact guide: how much change → how much effect (guesses + confidence) ----
  impacts: [
    { lever: "Customer service", by: "+$1M", effect: "Experience +0.1, Frictionless +0.05; profit −$1M; no persistence", conf: "Medium", evidence: "Intro slide: service drives Frictionless AND Experience. R1: −$8M (with analytics −$4M) → Experience −0.9, Frictionless −0.7" },
    { lever: "Shopping experience", by: "+$1M", effect: "Experience +0.05 to +0.1; ~80% expensed this year", conf: "Low", evidence: "R1: +$5M did not offset the service cut; only $12M of $15M hit the P&L" },
    { lever: "Online", by: "+$1M", effect: "Frictionless +0.1, mostly NEXT round; only 40% expensed", conf: "Low", evidence: "R1: $2M → $9M showed no gain yet (lag); slides: online is partly capitalized" },
    { lever: "Vendor management", by: "+$1M", effect: "Unit cost −0.1 to −0.2%, Low Price +0.05; compounds each round", conf: "Medium", evidence: "Professor's slides: most reliable long-term lever; rivals now avg $33.5M" },
    { lever: "Customer analytics", by: "+$1M", effect: "Frictionless + Experience +0.05 each, mostly by amplifying online & experience spend", conf: "Medium", evidence: "Intro slide maps analytics to Frictionless/Experience; MV slide calls it a multiplier. R1 cut $10M → $6M likely part of the drop" },
    { lever: "National brand quality", by: "+1 step", effect: "Brand +0.3 to +0.6; unit cost +1–2% (pair with vendor mgmt)", conf: "Medium", evidence: "Intro slide: carrying high-quality brands = Brand quadrant. Untested by us" },
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
      id: "A", name: "Repair & Re-lead", badge: "Recommended", segs: [5, 3],
      tag: "WIN Experience + Brand · undo Round 1's service cut",
      levers: { vendor: 30, online: 10, experience: 14, service: 10, analytics: 7, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 6, privateBrand: 60, stores: 185, depth: 30 },
      why: [
        "<b>Fixes the main mistake.</b> We cut BOTH levers that feed Experience + Frictionless (service $15M → $7M, analytics $10M → $6M). Restore service to $10M (avg $9.7M) and analytics to $7M (avg $6.8M).",
        "<b>Experience is now BELOW official fair value</b> (4.8 vs 75% × 6.7 = 5.0). This round must lift it.",
        "<b>Takes Brand #1 back cheaply.</b> We're only 0.4 behind Zephara; national brand quality 5 → 6 should cover it.",
        "<b>Closes the Frictionless gap.</b> Online $9M → $10M plus service + analytics; Round 1's online money should start showing.",
        "<b>Keeps what worked.</b> Depth 30, 185 stores, PB 60%, same markups: these drove MV +21%, profit +$14.5M and debt −$36.5M.",
        "<b>Within budget.</b> ≈$71M (budget ≈ prior $69.8M + inflation, since 14% × $403.6M = $56.5M is lower)."
      ],
      risks: ["NB quality 6 raises unit cost (margin dips slightly).", "Zephara keeps rising in Experience (6.7); we're defending, not winning it yet."]
    },
    {
      id: "B", name: "Cash Machine", badge: "Safest", segs: [5, 3],
      tag: "Keep the money momentum · hold fair value",
      levers: { vendor: 31, online: 10, experience: 13, service: 9, analytics: 4, markupLow: 55, markupHigh: 67, pbQuality: 5, nbQuality: 5, privateBrand: 65, stores: 180, depth: 28 },
      why: [
        "<b>Doubles down on what moved MV.</b> 5 more closures, depth 28, PB 65% keep cutting debt and cost.",
        "<b>Still repairs service</b> ($7M → $9M) so Experience stays above the fair line.",
        "<b>≈$4M of budget unspent</b> as a cushion; markups +1 pt for margin."
      ],
      risks: ["Brand stays #2 and Experience stays well behind Zephara: no clear lead = longer horizon.", "Customers now value stores MORE (1.12 → 1.15); closures cost share."]
    },
    {
      id: "C", name: "Experience All-In", badge: "Bold", segs: [5, 3],
      tag: "Go for Experience #1 against Zephara",
      levers: { vendor: 28, online: 9, experience: 18, service: 12, analytics: 4, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 6, privateBrand: 55, stores: 185, depth: 32 },
      why: [
        "<b>Biggest bet on customers' #1 value</b> (shopping experience 1.44): experience $18M + service $12M.",
        "<b>Brand back to #1</b> with NB quality 6 and PB 55%.",
        "<b>Experience Seekers are our biggest segment</b>, so winning them grows CLV fastest."
      ],
      risks: ["Vendor mgmt falls further below the $33.5M avg: Low Price and costs at risk.", "Zephara is at 6.7; catching it may take 2+ rounds of heavy spend.", "Online stays below avg, Frictionless gap stays."]
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
      round: 1, label: "After Round 1",
      kpi: { marketValue: 113.0, mvChange: 21.2, revenue: 403.6, ebit: 38.1, interest: 25.5, netIncome: 8.2,
             debt: 250.5, equity: 97.6, currentRatio: 0.60, roic: 10.9, wacc: 7.9, onlineSales: 50.6,
             grossMargin: 36.2, daysInventory: 72, budget: 71.2, clv: 852.5 },
      matrix: { getchells: [4.7, 4.8, 4.9, 2.7], leader: [5.1, 6.7, 5.3, 7.9], fair: [3.8, 5.0, 4.0, 5.9] },
      share: {
        "PriceMart": [12.0, 11.5], "BestCo": [10.5, 6.1], "Cadabra": [9.8, 4.9], "Getchells": [10.0, 3.2],
        "Zephara": [10.7, 1.7], "AIM": [8.0, 2.2], "KT Benny": [8.7, 0.7]
      },
      revenue: { "PriceMart": 718.4, "BestCo": 508.4, "Cadabra": 448.8, "Getchells": 403.6, "Zephara": 379.0, "AIM": 313.5, "KT Benny": 286.6 },
      industry: [
        { name: "Markup · lower-cost",  ours: 54, avg: 47.81, min: 26.02, max: 71.80, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 53.03, min: 26.02, max: 83.25, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 43, min: 23, max: 77, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost",   ours: 30, avg: 30, min: 21, max: 34, unit: "" },
        { name: "Depth · higher-cost",  ours: 30, avg: 21, min: 6, max: 31, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 46, min: 1, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 41, min: 1, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 5, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 5, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 234, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 9.0, avg: 11.0, min: 6.05, max: 18.25, unit: "$M" },
        { name: "Customer service", ours: 7.0, avg: 9.72, min: 5.05, max: 14.82, unit: "$M" },
        { name: "Shopping experience", ours: 15.0, avg: 8.88, min: 0, max: 15.0, unit: "$M" },
        { name: "Vendor management", ours: 30.0, avg: 33.47, min: 13.21, max: 61.07, unit: "$M" },
        { name: "Customer analytics", ours: 6.0, avg: 6.78, min: 2.64, max: 10.57, unit: "$M" }
      ],
      headline: "Money fixed: MV +21%. <span class=\"hl\">Our positions slipped.</span>",
      moves: [
        "<b>Restore service ($10M) + analytics ($7M)</b>: both feed Experience + Frictionless; cutting them dragged Experience below fair value (4.8 vs 5.0).",
        "<b>Win Brand back</b>: only 0.4 behind Zephara. National brand quality 5 → 6.",
        "<b>Customers first this round</b> (professor's step 7): the money moves are done; now rebuild the matrix.",
        "<b>Keep the money moves</b>: depth 30, 185 stores, PB 60%, same markups (MV +21%, profit +$8.2M, debt −$36.5M)."
      ]
    }
  ]
};
