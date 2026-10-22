// Getchells Strategy Copilot — data
// Real game data through Round 1. Add a new entry to `rounds` and update base/defaults/rivals after each round.

window.SIM = {
  company: "Getchells",
  dataVersion: "R2-split-v9",  // bump whenever data is updated (clears stale browser saves)
  round: 3,

  // Current financial position ($M) — END OF ROUND 2 (exported CSVs, exact)
  base: {
    revenue: 488.7, cogs: 311.3, depreciation: 29.86, otherSGA: 24.43,
    interest: 23.45, cash: 27.47, debt: 241.45, stLoans: 117.40, equity: 123.41, ap: 30.50,
    inventory: 61.31, receivables: 20.08, netPPE: 286.50,
    wacc: 9.4, marketValue: 361.9, budget: 74.616, stores: 185, clv: 1075.0,
    netIncome: 22.84, pe: 15.8, growth: 0.14, debtPrev: 250.02
    // budget 74.616 = REAL (game screen, Round 3). growth = revenue growth with no changes (R1 final +14.5%, R2 +14.5%); debtPrev = debt a round earlier (for average-debt interest)
  },

  // Last submitted decisions = Round 2
  defaults: {
    online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8,
    markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6,
    pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50
  },

  quadrants: ["Brand", "Experience", "Low Price", "Frictionless"],

  // Matrix scores 0–10: [Brand, Experience, Low Price, Frictionless] — END OF ROUND 2 (kahn-round2.csv, exact)
  rivals: {
    "Getchells": [5.1, 6.1, 4.8, 3.5],
    "Cadabra":   [4.1, 2.5, 5.1, 7.5],
    "PriceMart": [1.9, 3.9, 5.2, 3.1],
    "AIM":       [3.5, 1.0, 5.5, 1.4],
    "KT Benny":  [3.0, 4.4, 4.8, 1.9],
    "Zephara":   [4.8, 6.4, 4.9, 3.9],
    "BestCo":    [4.2, 3.5, 4.9, 5.9]
  },
  // Drift per round if we change nothing (R2: inputs flat except online → Experience −0.1 as rivals spent more)
  drift: [0, -0.1, 0, 0],

  // Fair value = 75% of the leader (official rule, Intro slides). The game's white line looked closer to ~66%; we plan to the stricter 75%.
  fairRatio: 0.75,

  // History from kahn-round2.csv (exact): rounds −2..2. Game's white line = 2/3 of leader.
  trendRounds: [-2, -1, 0, 1, 2],
  trend: [
    { "Getchells": [6.3, 6.3, 6.3, 5.1, 5.1], "Zephara": [5.2, 5.0, 4.9, 5.0, 4.8], "Cadabra": [4.5, 4.2, 4.1, 4.3, 4.1], "BestCo": [3.2, 3.5, 3.6, 4.0, 4.2], "AIM": [3.9, 3.6, 3.5, 3.7, 3.5], "KT Benny": [2.2, 2.4, 2.5, 2.8, 3.0], "PriceMart": [1.8, 1.8, 1.8, 1.9, 1.9], "Fair value": [4.2, 4.2, 4.2, 3.4, 3.4] },
    { "Zephara": [5.9, 6.4, 6.5, 6.3, 6.4], "Getchells": [5.2, 5.7, 5.8, 6.2, 6.1], "KT Benny": [2.5, 3.2, 3.8, 4.1, 4.4], "PriceMart": [2.5, 3.1, 3.5, 3.7, 3.9], "BestCo": [2.4, 2.9, 3.3, 3.4, 3.5], "Cadabra": [6.7, 4.2, 3.1, 2.6, 2.5], "AIM": [2.2, 1.7, 1.4, 1.1, 1.0], "Fair value": [4.4, 4.2, 4.3, 4.2, 4.3] },
    { "AIM": [5.5, 5.5, 5.4, 5.5, 5.5], "PriceMart": [5.2, 5.1, 5.1, 5.1, 5.2], "Cadabra": [4.8, 5.0, 5.0, 5.1, 5.1], "BestCo": [5.2, 5.0, 4.9, 4.9, 4.9], "Zephara": [4.9, 4.8, 4.8, 4.9, 4.9], "Getchells": [4.9, 4.9, 4.9, 4.8, 4.8], "KT Benny": [5.2, 5.1, 5.0, 4.9, 4.8], "Fair value": [3.7, 3.6, 3.6, 3.6, 3.7] },
    { "Cadabra": [9.7, 8.4, 7.8, 7.6, 7.5], "BestCo": [3.7, 4.5, 5.2, 5.6, 5.9], "Zephara": [2.7, 3.3, 3.6, 3.7, 3.9], "Getchells": [3.3, 3.5, 3.4, 3.5, 3.5], "PriceMart": [1.9, 2.4, 2.8, 3.0, 3.1], "KT Benny": [0.9, 1.2, 1.5, 1.8, 1.9], "AIM": [2.3, 2.0, 1.8, 1.5, 1.4], "Fair value": [6.5, 5.6, 5.2, 5.1, 5.0] }
  ],

  // Why each retailer lands where it does (from the game's company profiles)
  why: {
    "Getchells": ["#1 (5.1), lead widened to 0.3: PB + NB quality 6", "#2 (6.1), 0.3 behind Zephara: slipped 0.1 with flat spend", "4.8: flat tie, vendor $25M (avg $34.6M)", "3.5: flat 4 rounds; online +$1.5M moved nothing; fair line 5.0"],
    "Cadabra":   ["Drifting down (4.1)", "Collapsed: 6.7 → 2.5", "5.1, mid-tie", "Still #1 (7.5) but sliding"],
    "PriceMart": ["Last (1.9)", "Rising: 2.5 → 3.9", "#2 (5.2)", "Rising: 1.9 → 3.1"],
    "AIM":       ["3.5, flat", "Last (1.0)", "#1 (5.5) for 5 rounds", "Falling (1.4)"],
    "KT Benny":  ["Rising slowly (3.0)", "Rising fast: 2.5 → 4.4", "Slipping (4.8)", "Low (1.9)"],
    "Zephara":   ["#2 (4.8), fading", "#1 (6.4), steady", "4.9, mid-tie", "Rising: 2.7 → 3.9"],
    "BestCo":    ["Rising every round (4.2)", "Rising (3.5)", "4.9, mid-tie", "Rising fastest: 3.7 → 5.9"]
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
    { sub: "Branded performance superiority", note: "#1 by 0.3 over Zephara (4.8). DEFEND: keep PB + NB quality 6." },
    { sub: "Enhanced customer experience",    note: "#2, 0.3 behind Zephara (6.4); slipped 0.1 with flat spend. WIN: service + experience up." },
    { sub: "Operational excellence, lowest cost", note: "Flat tie; we're 4.8 vs fair 3.7. HOLD: safe even at vendor $23M." },
    { sub: "Customer understanding, convenience", note: "Our gap: 3.5 vs fair line 5.0; online +$1.5M did nothing. Service/analytics are the levers." }
  ],

  // REAL segment data (Round 0 Preferences chart, read by bar length).
  // weights → [Brand, Experience, Low Price, Frictionless]: Experience = shopping exp + ½ service; Frictionless = online + ½ service.
  // clvShare / rev = share of OUR revenue by segment, R2 (marketRevenue-round2.csv, exact; CLV split assumed same).
  // Our R2 revenue $M: S5 108.5, S2 100.5, S6 87.3, S1 85.1, S3 64.8, S4 42.5. Growth R1→R2: S4 +19%, S6 +18%, S3 +15%, S1 +15%, S5 +12%, S2 +11%.
  segments: [
    { id: 1, name: "Online Bargain",     wants: "Online + low price + service · never in stores", clvShare: 0.174, rev: 0.174, weights: [0.05, 0.15, 0.33, 0.47], rival: "Cadabra" },
    { id: 2, name: "Breadth Shoppers",   wants: "Huge selection + stores + price",              clvShare: 0.206, rev: 0.206, weights: [0.14, 0.32, 0.24, 0.30], rival: "PriceMart / AIM" },
    { id: 3, name: "Brand Lovers",       wants: "Brand + shopping experience",                  clvShare: 0.133, rev: 0.133, weights: [0.29, 0.42, 0.13, 0.16], rival: "Zephara" },
    { id: 4, name: "Omni Mix",           wants: "Online + stores + price",                      clvShare: 0.087, rev: 0.087, weights: [0.12, 0.30, 0.23, 0.35], rival: "AIM / KT Benny" },
    { id: 5, name: "Experience Seekers", wants: "Shopping experience above all + stores",       clvShare: 0.222, rev: 0.222, weights: [0.13, 0.53, 0.12, 0.22], rival: "Zephara" },
    { id: 6, name: "Store Bargain",      wants: "Stores + price + breadth · zero depth",        clvShare: 0.179, rev: 0.179, weights: [0.13, 0.40, 0.26, 0.21], rival: "BestCo" }
  ],

  // Market-wide preference intensity (sum of 6 segments), Round 0
  prefs: [
    { n: "Shopping experience", v: 1.44, q: "Experience" }, { n: "Breadth", v: 1.41, q: "Assortment" },
    { n: "Retail stores", v: 1.16, q: "Stores" }, { n: "Low price", v: 1.12, q: "Low Price" },
    { n: "Online", v: 1.02, q: "Frictionless" }, { n: "Customer service", v: 0.96, q: "Frict. / Exp." },
    { n: "Depth", v: 0.96, q: "Assortment" }, { n: "Brand", v: 0.80, q: "Brand" }
  ],

  // Our history (Data → Market CLV / Market Revenue for your company)
  ourTrend: { rounds: [-2, -1, 0, 1, 2], clv: [680.1, 738.0, 818.5, 943.7, 1075.0], revenue: [314.7, 342.0, 372.8, 426.7, 488.7] },

  // ---- Decision log: what we submitted each round (for the Timeline page) ----
  decisionLog: [
    { round: 0, label: "R0 (inherited)", d: { online: 2, service: 15, experience: 10, vendor: 30, analytics: 10, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 50, pbHigh: 50, stores: 200, depthLow: 50, depthHigh: 50, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 try 1 (undone)", d: { online: 9, service: 7, experience: 15, vendor: 30, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 final", d: { online: 9, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 2, label: "R2", d: { online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } }
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
      results: ["MV $361.9M (+96.6%); model forecast was $185M", "Net income $11.1M → $22.8M (revenue +14.5%, opex flat)", "Debt $250.0M → $241.4M; ROE 18.5%", "WACC 7.9% → 9.4%; P/E 15.8", "Matrix: Brand 5.1 (#1), Experience 6.2 → 6.1 (Zephara 6.4), Low Price 4.8, Frictionless 3.5 (flat)"],
      lesson: "Market value = P/E × net income in every round so far. Holding spending flat while revenue grows ~12–15% doubles profit, so value doubles. But the matrix drifts: Experience −0.1 with flat spend, and online +$1.5M moved Frictionless 0.0. Model now has drift and a much weaker online coefficient." }
  ],

  // ---- Model back-test (scratchpad bt.js): each run replayed from the real state it started in. predicted / actual ----
  backtest: [
    { run: "R1 try 1 (mulligan)", cells: ["4.7 / 4.7", "4.8 / 4.8", "4.9 / 4.9", "2.7 / 2.7", "$403M / $404M", "$6.6M / $8.2M", "P/E-driven"] },
    { run: "R1 final",            cells: ["5.1 / 5.1", "6.2 / 6.2", "4.8 / 4.8", "3.5 / 3.5", "$421M / $427M", "$6.7M / $11.1M", "P/E-driven"] },
    { run: "R2",                  cells: ["5.1 / 5.1", "6.1 / 6.1", "4.8 / 4.8", "3.5 / 3.5", "$486M / $489M", "$22.9M / $22.8M", "$363M / $362M"] }
  ],
  // R1 net income runs low because R0 interest (10.5% of year-end debt) is overstated without R−1 debt; R2 uses average debt.

  // ---- Impact guide: how much change → how much effect (guesses + confidence) ----
  impacts: [
    { lever: "Customer service", by: "+$1M", effect: "Experience +0.15 to +0.17, Frictionless +0.08; profit −$1.0M (100% expensed + 0.5% of revenue fixed)", conf: "High", evidence: "Back-test exact on R1 try 1 (mulligan), R1 final and R2: service $7M vs $15M = −1.4 Experience, −0.8 Frictionless" },
    { lever: "Shopping experience", by: "+$1M", effect: "Experience +0.07 to +0.09; 80% expensed, 20% capitalized", conf: "Medium", evidence: "Refit R0→R1: exp $10M → $15M = +0.5 Experience (half what we assumed); income statements show exactly 80% expensed" },
    { lever: "Online investment", by: "+$1M", effect: "Frictionless ≈ +0.01 to +0.03 (near zero); profit −$0.4M (mostly capitalized)", conf: "Medium", evidence: "R0→R2: online $2M → $10.5M moved Frictionless 3.4 → 3.5 only; R2 +$1.5M = 0.0" },
    { lever: "Vendor management", by: "+$1M", effect: "Unit cost −0.1 to −0.2%, Low Price +0.05; compounds each round", conf: "Medium", evidence: "Professor's slides: most reliable long-term lever; rivals now avg $33.5M" },
    { lever: "Customer analytics", by: "+$1M", effect: "Frictionless + Experience +0.05 each, mostly by amplifying online & experience spend", conf: "Medium", evidence: "Intro slide maps analytics to Frictionless/Experience; MV slide calls it a multiplier. R1 cut $10M → $6M likely part of the drop" },
    { lever: "National brand quality", by: "+1 step", effect: "Brand +0.2 to +0.4 (with PB quality +1); unit cost +1–2%", conf: "Medium", evidence: "Intro slide: carrying high-quality brands = Brand quadrant. Untested by us" },
    { lever: "Private brand quality", by: "+1 step", effect: "Brand +0.2 to +0.4; unit cost +~1%", conf: "Low", evidence: "Untested; would offset PB 60% dilution" },
    { lever: "Private brand % (lower / higher)", by: "+10 pts", effect: "Brand −0.8 (if PB is the cause); margin barely moves (gross margin flat 36.2%)", conf: "Low", evidence: "R0→R1 both runs: PB 50→60% + depth 50→30 = Brand −1.6, split 50/50 between them. Plan C tests it" },
    { lever: "Depth (lower / higher)", by: "−10", effect: "Inventory −~$20M (frees debt); Brand −0.4 (if depth is the cause)", conf: "Medium", evidence: "R1: −20 → inventory −$5M vs revenue growth, days 90 → 72; Brand drop shared with PB" },
    { lever: "Breadth (lower / higher)", by: "+5", effect: "Revenue +~1.4%, net income +~$1M; inventory +~5%", conf: "Low", evidence: "Never changed (50/50; rivals avg 43 / 30). Customers' #2 value (1.41). Untested: change only one at a time" },
    { lever: "Stores", by: "−5", effect: "Debt −~$8M; revenue −~0.3% (half our sales are online)", conf: "Medium", evidence: "R1: −15 stores but revenue +14.5%, sales/store +20.5% → store elasticity small" },
    { lever: "Markup (lower-cost)", by: "−1 pt", effect: "Low Price +0.05 to +0.1; gross margin −0.6 pt; units +1–2%", conf: "Low", evidence: "Intro slide: markup = Low Price quadrant. Immediate, no persistence" },
    { lever: "Net income", by: "+$1M", effect: "Market value +~$14M (P/E 13.9)", conf: "Medium", evidence: "R1 scorecard: P/E 13.9; assumes P/E stays similar" },
    { lever: "Debt", by: "−$10M", effect: "Interest −~$1M/yr → net income +$0.65M → MV +~$9M; better WACC/credit", conf: "Medium", evidence: "R1: interest $25.5M on $250.5M debt ≈ 10.2%; tax ~35%" }
  ],

  // ---- Top 3 plans for the next round (levers in $M / % / count). Breadth stays 50/50 in all plans. ----
  plans: [
    {
      id: "A", name: "Win Experience with service", badge: "Recommended", segs: [5, 3],
      tag: "Service $19M + experience $17M, funded by vendor + analytics · $73.0M of $74.6M",
      levers: { vendor: 22, online: 10.5, experience: 17, service: 19, analytics: 4.5, pbLow: 60, pbHigh: 60, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 },
      why: [
        "<b>Experience 6.1 → ≈6.7</b> vs Zephara 6.4 (rising ~0.1/round): a clear lead. Brand + Experience = the professor's two-quadrant sweet spot.",
        "<b>Service is the strongest lever</b> (back-tested on all 3 runs): it lifts Experience AND Frictionless (3.5 → ≈3.8).",
        "<b>Shopping experience is weaker than we thought</b> (refit on the mulligan): $1M of service ≈ 2× the Experience gain of $1M of shopping experience.",
        "<b>Model value ≈$610M</b> vs ≈$566M for holding; net income ≈$36M either way, so the gain is the P/E premium of leading 2 quadrants."
      ],
      risks: ["Vendor $22M vs $34.6M avg: Low Price 4.8 → ≈4.74, still far above fair (3.7).", "Service $19M is above every rival ($16.8M max): we're testing the top of the curve.", "Frictionless still a gap (≈3.8 vs fair 5.0)."]
    },
    {
      id: "B", name: "Hold & bank profit", badge: "Safe", segs: [5, 3],
      tag: "Change nothing",
      levers: { vendor: 25, online: 10.5, experience: 15, service: 15, analytics: 5.8, pbLow: 60, pbHigh: 60, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 },
      why: ["<b>Revenue +14%/yr</b> with flat spending already lifts net income to ≈$36M.", "Lowest risk on the cash side."],
      risks: ["Experience drifts to ≈6.0 while Zephara climbs: only 1 lead → lower P/E. Model ≈$566M."]
    },
    {
      id: "C", name: "Plan A + test private brand 55%", badge: "Bold test", segs: [5, 3],
      tag: "Plan A, plus private brand 60% → 55% (lower + higher)",
      levers: { vendor: 22, online: 10.5, experience: 17, service: 19, analytics: 4.5, pbLow: 55, pbHigh: 55, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 },
      why: ["<b>Tests why Brand fell 6.3 → 5.1 in Round 1</b>: private brand 50 → 60% and depth 50 → 30 moved together. If PB is the cause, Brand ≈5.5.", "Model ≈$626M (low confidence)."],
      risks: ["If depth (not PB) caused the Brand drop, this only costs a little margin (≈−$0.5M net income)."]
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
      matrix: { getchells: [6.3, 5.8, 4.9, 3.4], leader: [6.3, 6.5, 5.4, 7.8], fair: [4.2, 4.3, 3.6, 5.2] },
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
      matrix: { getchells: [5.1, 6.2, 4.8, 3.5], leader: [5.1, 6.3, 5.5, 7.6], fair: [3.4, 4.2, 3.6, 5.1] },
      share: {
        "PriceMart": [12.0, 11.4], "BestCo": [10.4, 6.0], "Cadabra": [9.7, 4.8], "Getchells": [10.4, 3.5],
        "Zephara": [10.6, 1.7], "AIM": [8.0, 2.2], "KT Benny": [8.6, 0.7]
      },
      revenue: { "PriceMart": 717.2, "BestCo": 503.2, "Cadabra": 443.4, "Getchells": 426.7, "Zephara": 375.2, "AIM": 313.2, "KT Benny": 285.6 },
      industry: [
        { name: "Markup · lower-cost", ours: 54, avg: 47.81, min: 26.02, max: 71.8, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 53.03, min: 26.02, max: 83.25, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 43, min: 23, max: 77, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost", ours: 30, avg: 30, min: 21, max: 34, unit: "" },
        { name: "Depth · higher-cost", ours: 30, avg: 21, min: 6, max: 31, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 46, min: 1, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 41, min: 1, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 234, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 9, avg: 11, min: 6.05, max: 18.25, unit: "$M" },
        { name: "Customer service", ours: 15, avg: 10.86, min: 5.05, max: 15, unit: "$M" },
        { name: "Shopping experience", ours: 15, avg: 8.88, min: 0, max: 15, unit: "$M" },
        { name: "Vendor management", ours: 25, avg: 32.76, min: 13.21, max: 61.07, unit: "$M" },
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
             grossMargin: 36.3, daysInventory: 72, budget: 74.6, clv: 1075.0 },
      matrix: { getchells: [5.1, 6.1, 4.8, 3.5], leader: [5.1, 6.4, 5.5, 7.5], fair: [3.4, 4.3, 3.7, 5.0] },
      revenue: { "PriceMart": 808.5, "BestCo": 579.1, "Getchells": 488.7, "Cadabra": 483.1, "Zephara": 410.8, "AIM": 341.6, "KT Benny": 325.4 },
      // Market share by revenue (hovered R2 donut); Getchells split from revenue; Zephara higher = remainder
      share: {
        "PriceMart": [11.9, 11.6], "BestCo": [10.5, 6.3], "Cadabra": [9.5, 4.6], "Getchells": [10.5, 3.7],
        "Zephara": [10.4, 1.6], "AIM": [7.8, 2.1], "KT Benny": [8.8, 0.7]
      },
      // Unit cost R2 (Pricing chart): we're mid-pack; Zephara + BestCo cheapest
      unitCost: { "Zephara": [127.65, 255.30], "BestCo": [128.23, 260.68], "Cadabra": [133.05, 267.61], "Getchells": [133.53, 267.05], "AIM": [133.72, 268.82], "KT Benny": [136.57, 273.14], "PriceMart": [131.43, 262.85] },
      industry: [
        { name: "Markup · lower-cost", ours: 54, avg: 48.68, min: 26.28, max: 72.52, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 53.9, min: 26.28, max: 84.08, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 43, min: 23, max: 76, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost", ours: 30, avg: 29, min: 21, max: 35, unit: "" },
        { name: "Depth · higher-cost", ours: 30, avg: 20, min: 6, max: 32, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 47, min: 2, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 42, min: 2, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 233, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 10.5, avg: 12.44, min: 6.93, max: 20.9, unit: "$M" },
        { name: "Customer service", ours: 15, avg: 11.81, min: 5.43, max: 16.79, unit: "$M" },
        { name: "Shopping experience", ours: 15, avg: 9.58, min: 0, max: 15, unit: "$M" },
        { name: "Vendor management", ours: 25, avg: 34.61, min: 14.55, max: 65.94, unit: "$M" },
        { name: "Customer analytics", ours: 5.8, avg: 6.82, min: 2.91, max: 11.64, unit: "$M" }
      ],
      headline: "MV +96.6% to $362M. <span class=\"hl\">Brand #1; Experience gap now 0.3.</span>",
      moves: [
        "<b>Value = P/E × net income</b>: protect profit; every +$1M net income ≈ +$16M value. Model now back-tests R2 within 1% (NI $22.9M vs $22.8M).",
        "<b>Keep the formula</b>; rivals now spend more on service ($16.8M max) and online (avg $12.4M).",
        "<b>Experience slipped</b> 6.2 → 6.1 while Zephara rose to 6.4; standing still loses ground. Online +$1.5M left Frictionless flat at 3.5."
      ]
    }
  ]
};
