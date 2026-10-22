// Getchells Strategy Copilot — data
// Real game data through Round 1. Add a new entry to `rounds` and update base/defaults/rivals after each round.

window.SIM = {
  company: "Getchells",
  dataVersion: "R4-status-v13",  // bump whenever data is updated (clears stale browser saves)
  round: 4,

  // Current financial position ($M) — END OF ROUND 2 (exported CSVs, exact)
  base: {
    revenue: 549.19, cogs: 349.57, depreciation: 31.88, otherSGA: 27.46,
    interest: 20.47, cash: 31.81, debt: 212.52, stLoans: 90.60, equity: 157.77, ap: 34.00,
    inventory: 68.73, receivables: 22.57, netPPE: 281.17,
    wacc: 11.8, marketValue: 533.8, budget: 76.886, stores: 185, clv: 1201.1,
    netIncome: 34.37, pe: 15.5, peDrift: 0.98, growth: 0.11, debtPrev: 241.45
    // END OF ROUND 3 (exported CSVs, exact). budget 76.886 = 14% × $549.19M (ESTIMATE until the R4 input screen confirms).
    // growth: our revenue +14.5%, +14.5%, +12.4% (market +11%, +12%, +9%) → 11% next. peDrift: P/E 16.6 → 15.8 → 15.5 as WACC rises.
  },

  // Last submitted decisions = Round 3
  defaults: {
    online: 11.5, service: 17, experience: 17, vendor: 23, analytics: 6,
    markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6,
    pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50
  },

  quadrants: ["Brand", "Experience", "Low Price", "Frictionless"],

  // Matrix scores 0–10: [Brand, Experience, Low Price, Frictionless] — END OF ROUND 3 (kahn-round3.csv, exact)
  rivals: {
    "Getchells": [5.1, 6.3, 4.8, 3.8],
    "Cadabra":   [4.0, 2.4, 5.1, 7.4],
    "PriceMart": [1.9, 3.9, 5.2, 3.1],
    "AIM":       [3.4, 0.9, 5.5, 1.4],
    "KT Benny":  [3.2, 4.5, 4.8, 2.0],
    "Zephara":   [4.7, 6.4, 4.9, 3.9],
    "BestCo":    [4.4, 3.5, 4.9, 5.9]
  },
  // Drift per round if we change nothing (R2: inputs flat except online → Experience −0.1 as rivals spent more)
  drift: [0, -0.1, 0, 0],

  // Fair value = 75% of the leader (official rule, Intro slides). The game's white line looked closer to ~66%; we plan to the stricter 75%.
  fairRatio: 0.75,

  // History from kahn-round2.csv (exact): rounds −2..2. Game's white line = 2/3 of leader.
  trendRounds: [-2, -1, 0, 1, 2, 3],
  trend: [
    { "Getchells": [6.3, 6.3, 6.3, 5.1, 5.1, 5.1], "Zephara": [5.2, 5.0, 4.9, 5.0, 4.8, 4.7], "Cadabra": [4.5, 4.2, 4.1, 4.3, 4.1, 4.0], "BestCo": [3.2, 3.5, 3.6, 4.0, 4.2, 4.4], "AIM": [3.9, 3.6, 3.5, 3.7, 3.5, 3.4], "KT Benny": [2.2, 2.4, 2.5, 2.8, 3.0, 3.2], "PriceMart": [1.8, 1.8, 1.8, 1.9, 1.9, 1.9], "Fair value": [4.2, 4.2, 4.2, 3.4, 3.4, 3.4] },
    { "Zephara": [5.9, 6.4, 6.5, 6.3, 6.4, 6.4], "Getchells": [5.2, 5.7, 5.8, 6.2, 6.1, 6.3], "KT Benny": [2.5, 3.2, 3.8, 4.1, 4.4, 4.5], "PriceMart": [2.5, 3.1, 3.5, 3.7, 3.9, 3.9], "BestCo": [2.4, 2.9, 3.3, 3.4, 3.5, 3.5], "Cadabra": [6.7, 4.2, 3.1, 2.6, 2.5, 2.4], "AIM": [2.2, 1.7, 1.4, 1.1, 1.0, 0.9], "Fair value": [4.4, 4.2, 4.3, 4.2, 4.3, 4.3] },
    { "AIM": [5.5, 5.5, 5.4, 5.5, 5.5, 5.5], "PriceMart": [5.2, 5.1, 5.1, 5.1, 5.2, 5.2], "Cadabra": [4.8, 5.0, 5.0, 5.1, 5.1, 5.1], "BestCo": [5.2, 5.0, 4.9, 4.9, 4.9, 4.9], "Zephara": [4.9, 4.8, 4.8, 4.9, 4.9, 4.9], "Getchells": [4.9, 4.9, 4.9, 4.8, 4.8, 4.8], "KT Benny": [5.2, 5.1, 5.0, 4.9, 4.8, 4.8], "Fair value": [3.7, 3.6, 3.6, 3.6, 3.7, 3.7] },
    { "Cadabra": [9.7, 8.4, 7.8, 7.6, 7.5, 7.4], "BestCo": [3.7, 4.5, 5.2, 5.6, 5.9, 5.9], "Zephara": [2.7, 3.3, 3.6, 3.7, 3.9, 3.9], "Getchells": [3.3, 3.5, 3.4, 3.5, 3.5, 3.8], "PriceMart": [1.9, 2.4, 2.8, 3.0, 3.1, 3.1], "KT Benny": [0.9, 1.2, 1.5, 1.8, 1.9, 2.0], "AIM": [2.3, 2.0, 1.8, 1.5, 1.4, 1.4], "Fair value": [6.5, 5.6, 5.2, 5.1, 5.0, 5.0] }
  ],

  // Why each retailer lands where it does (from the game's company profiles)
  why: {
    "Getchells": ["#1 (5.1) for 3 rounds; lead 0.4 as Zephara fades. Quality 6/6", "#2 (6.3), 0.1 behind Zephara: service + experience $17M (+0.2)", "4.8, flat tie; vendor $23M vs avg $36.1M", "3.8, up 0.3 (service +$2M, online +$1M) but fair line 5.0"],
    "Cadabra":   ["Drifting down (4.0)", "Collapsed: 6.7 → 2.4", "5.1, mid-tie", "#1 (7.4) but sliding every round"],
    "PriceMart": ["Last (1.9)", "Flat at 3.9", "#2 (5.2)", "Flat (3.1)"],
    "AIM":       ["3.4, slipping", "Last (0.9)", "#1 (5.5) for 6 rounds", "1.4"],
    "KT Benny":  ["Rising slowly (3.2)", "Rising: 2.5 → 4.5", "4.8", "2.0"],
    "Zephara":   ["#2 (4.7), falling 3 rounds", "#1 (6.4), flat; service position 3.2 > ours 2.8", "4.9", "3.9"],
    "BestCo":    ["Rising every round (4.4): watch it", "3.5", "4.9", "#2 (5.9), flat"]
  },

  // One-minute read: each rival's competitive edge
  edges: [
    { n: "Getchells", real: "Macy's",   q: "Brand #1 + Experience #2", edge: "MV $534M (+47.5%); net income $34.4M; fastest growth (+12.4%)", weak: "Frictionless below fair; WACC 11.8%", us: true },
    { n: "Cadabra",   real: "Amazon",    q: "Frictionless #1", edge: "100% online ($520M); online position 5.0", weak: "Frictionless sliding 9.7 → 7.4; Experience 2.4" },
    { n: "PriceMart", real: "Walmart",   q: "Low Price #2",    edge: "Biggest revenue ($882M, +9%); most stores; breadth leader", weak: "Brand last (1.9)" },
    { n: "BestCo",    real: "Costco",    q: "Frictionless #2",    edge: "$639M (+10%); Brand rising every round (4.4)", weak: "Experience 3.5; austere stores" },
    { n: "Zephara",   real: "Sephora",   q: "Experience #1",   edge: "Experience 6.4; best service position (3.2); cheapest costs", weak: "Brand falling 3 rounds (4.7); slow growth (+7%)" },
    { n: "AIM",       real: "Target",    q: "Low Price #1",     edge: "Low Price leader 6 rounds (5.5)", weak: "Experience last (0.9); +7.5%" },
    { n: "KT Benny",  real: "JCPenney",  q: "Rising",         edge: "Experience 2.5 → 4.5; +9.5% revenue", weak: "Still smallest ($356M); priciest" }
  ],

  // What each quadrant means for Getchells
  quadNotes: [
    { sub: "Branded performance superiority", note: "#1 by 0.4 (Zephara 4.7 ↓, BestCo 4.4 ↑). DEFEND: keep PB + NB quality 6." },
    { sub: "Enhanced customer experience",    note: "#2, 0.1 behind Zephara (6.4). Service is saturating; shopping experience now the better $ lever." },
    { sub: "Operational excellence, lowest cost", note: "Flat tie; 4.8 vs fair 3.7. HOLD: safe even at vendor $22–23M." },
    { sub: "Customer understanding, convenience", note: "3.8 vs fair line 5.0 (+0.3 this round). Gap persists; expensive to close." }
  ],

  // REAL segment data (Round 0 Preferences chart, read by bar length).
  // weights → [Brand, Experience, Low Price, Frictionless]: Experience = shopping exp + ½ service; Frictionless = online + ½ service.
  // R3 exact (preference / marketRevenue / marketCLV CSVs). weights = [brand, shopping exp + ½ service, low price, online + ½ service], normalized.
  // Our R3 revenue $M: S5 118.4, S2 111.1, S6 100.7, S1 95.8, S3 72.4, S4 50.8. CLV $M: S2 240.3, S5 235.9, S1 231.9, S6 225.9, S3 148.5, S4 118.5.
  // Segment sizes (customers, R3): S1 3.47M ↑, S6 3.03M ↑, S2 2.99M, S5 2.32M (flat), S4 1.67M ↑, S3 1.59M. Growth is in S1/S4/S6, NOT our Experience segments.
  segments: [
    { id: 1, name: "Online Bargain",     wants: "Online + low price + service · never in stores", clvShare: 0.193, rev: 0.174, weights: [0.06, 0.16, 0.3, 0.48], rival: "Cadabra" },
    { id: 2, name: "Breadth Shoppers",   wants: "Huge selection + stores + price",              clvShare: 0.2, rev: 0.202, weights: [0.14, 0.32, 0.26, 0.28], rival: "PriceMart / AIM" },
    { id: 3, name: "Brand Lovers",       wants: "Brand + shopping experience",                  clvShare: 0.124, rev: 0.132, weights: [0.28, 0.42, 0.13, 0.17], rival: "Zephara" },
    { id: 4, name: "Omni Mix",           wants: "Online + stores + price",                      clvShare: 0.099, rev: 0.092, weights: [0.13, 0.3, 0.23, 0.34], rival: "AIM / KT Benny" },
    { id: 5, name: "Experience Seekers", wants: "Shopping experience above all + stores",       clvShare: 0.196, rev: 0.216, weights: [0.13, 0.53, 0.12, 0.22], rival: "Zephara" },
    { id: 6, name: "Store Bargain",      wants: "Stores + price + breadth · zero depth",        clvShare: 0.188, rev: 0.183, weights: [0.13, 0.39, 0.27, 0.21], rival: "BestCo" }
  ],

  // Market-wide preference intensity (sum of 6 segments), Round 3 (depth rising, breadth/service slowly falling)
  prefs: [
    { n: "Shopping experience", v: 1.44, q: "Experience" }, { n: "Breadth", v: 1.39, q: "Assortment" },
    { n: "Retail stores", v: 1.18, q: "Stores" }, { n: "Low price", v: 1.12, q: "Low Price" },
    { n: "Online", v: 1.02, q: "Frictionless" }, { n: "Depth", v: 0.99, q: "Assortment" },
    { n: "Customer service", v: 0.94, q: "Frict. / Exp." }, { n: "Brand", v: 0.80, q: "Brand" }
  ],

  // Our history (Data → Market CLV / Market Revenue for your company)
  ourTrend: { rounds: [-2, -1, 0, 1, 2, 3], clv: [680.1, 738.0, 818.5, 943.7, 1075.0, 1201.1], revenue: [314.7, 342.0, 372.8, 426.7, 488.7, 549.2] },

  // ---- Decision log: what we submitted each round (for the Timeline page) ----
  decisionLog: [
    { round: 0, label: "R0 (inherited)", d: { online: 2, service: 15, experience: 10, vendor: 30, analytics: 10, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 50, pbHigh: 50, stores: 200, depthLow: 50, depthHigh: 50, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 try 1 (undone)", d: { online: 9, service: 7, experience: 15, vendor: 30, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 final", d: { online: 9, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 2, label: "R2", d: { online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } }
,
    { round: 3, label: "R3", d: { online: 11.5, service: 17, experience: 17, vendor: 23, analytics: 6, pbLow: 60, pbHigh: 60, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } }
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
      lesson: "Market value = P/E × net income in every round so far. Holding spending flat while revenue grows ~12–15% doubles profit, so value doubles. But the matrix drifts: Experience −0.1 with flat spend, and online +$1.5M moved Frictionless 0.0. Model now has drift and a much weaker online coefficient." },
    { round: 3, title: "Round 3 (service + experience $17M, vendor $23M, online $11.5M)",
      changes: ["Service $15M → $17M", "Shopping experience $15M → $17M", "Vendor $25M → $23M", "Online $10.5M → $11.5M, analytics $5.8M → $6M", "$0.12M of budget unspent"],
      results: ["MV $533.8M (+47.5%); model $579M", "Net income $34.4M (model $35.3M ✓); revenue $549M (model $562M)", "Experience 6.1 → 6.3 (model 6.46); Frictionless 3.5 → 3.8 (model 3.67)", "WACC 9.4% → 11.8%; P/E 15.8 → 15.5; debt $212.5M"],
      lesson: "Profit forecast was right; the miss was P/E (WACC jumped). Service saturates: +$2M gave far less Experience than the first $8M did, because the game scores us RELATIVE to rivals (our service position fell 3.4 → 2.8 as rivals raised spending to $18.5M max). Model v6: service curve saturates, P/E drifts down ~2%/round." }
  ],

  // ---- Model back-test (scratchpad bt.js): each run replayed from the real state it started in. predicted / actual ----
  backtest: [
    { run: "R1 try 1 (mulligan)", cells: ["4.7 / 4.7", "4.8 / 4.8", "4.9 / 4.9", "2.7 / 2.7", "$403M / $404M", "$6.6M / $8.2M", "P/E-driven"] },
    { run: "R1 final",            cells: ["5.1 / 5.1", "6.2 / 6.2", "4.8 / 4.8", "3.5 / 3.5", "$421M / $427M", "$6.7M / $11.1M", "P/E-driven"] },
    { run: "R3 (forecast on file, v5)", cells: ["5.1 / 5.1", "6.46 / 6.3", "4.76 / 4.8", "3.67 / 3.8", "$562M / $549M", "$35.3M / $34.4M", "$579M / $534M"] },
    { run: "R3 (refit v6)",       cells: ["5.1 / 5.1", "6.3 / 6.3", "4.76 / 4.8", "3.67 / 3.8", "", "", ""] },
    { run: "R2",                  cells: ["5.1 / 5.1", "6.1 / 6.1", "4.8 / 4.8", "3.5 / 3.5", "$486M / $489M", "$22.9M / $22.8M", "$363M / $362M"] }
  ],
  // R1 net income runs low because R0 interest (10.5% of year-end debt) is overstated without R−1 debt; R2 uses average debt.

  // ---- Game's product-position map, Round 3 (productPosition CSV): how customers SEE each firm, relative to rivals ----
  positions: {
    cols: ["Getchells", "Cadabra", "PriceMart", "AIM", "KT Benny", "Zephara", "BestCo"],
    rows: [
      ["Customer service", 2.8, 2.4, 1.0, 0.4, 1.2, 3.2, 2.5], ["Online", 1.0, 5.0, 2.1, 0.9, 0.8, 0.7, 3.4],
      ["Shopping experience", 3.5, 0, 2.9, 0.5, 3.3, 3.2, 1.0], ["Retail coverage", 1.3, 0, 5.0, 1.3, 1.2, 1.3, 4.2],
      ["Private brand · lower", 2.4, 1.9, 1.3, 1.9, 1.3, 3.1, 1.4], ["Private brand · higher", 2.5, 1.9, 1.3, 1.9, 1.3, 3.2, 1.1],
      ["Breadth · lower", 2.4, 1.9, 4.5, 1.6, 0.7, 1.6, 0.9], ["Breadth · higher", 4.0, 1.9, 3.1, 1.6, 0, 1.6, 1.7],
      ["Depth · lower", 1.9, 2.1, 1.1, 1.5, 2.7, 1.5, 2.5], ["Depth · higher", 3.4, 2.1, 0.1, 1.6, 1.1, 1.6, 3.7],
      ["Price · lower", 1.0, 0.8, 0.7, 0.8, 1.3, 1.2, 0.9], ["Price · higher", 3.2, 2.6, 2.1, 2.5, 3.4, 3.4, 2.7]
    ],
    note: "Our service position fell 3.4 (R0) → 2.8 (R3) while we spent $15–17M: rivals caught up. Positions are relative, so standing still loses ground."
  },

  // ---- Impact guide: how much change → how much effect (guesses + confidence) ----
  impacts: [
    { lever: "Customer service", by: "+$1M", effect: "Experience ≈ +0.05 at $17M (saturating; was +0.17 at $7–15M), Frictionless ≈ +0.08; profit −$1.0M", conf: "High", evidence: "R1 mulligan: $7M vs $15M = −1.4 Experience. R3: $15M → $17M (+ exp $2M) = only +0.2 total. Rivals now spend up to $18.5M" },
    { lever: "Shopping experience", by: "+$1M", effect: "Experience ≈ +0.08 at $17M (now beats service per $); 80% expensed, 20% capitalized", conf: "Medium", evidence: "Refit R0→R1: exp $10M → $15M = +0.5 Experience (half what we assumed); income statements show exactly 80% expensed" },
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
      id: "A", name: "Take Experience #1, same total spend", badge: "Recommended", segs: [5, 3],
      tag: "Shopping experience $20M, paid for by online, analytics, vendor · $74.5M of ≈$76.9M",
      levers: { vendor: 22, online: 10.5, experience: 20, service: 17, analytics: 5, pbLow: 60, pbHigh: 60, breadthLow: 50, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthHigh: 50 },
      why: [
        "<b>Experience 6.3 → ≈6.43</b> vs Zephara 6.4 (flat for 2 rounds): takes #1 without raising total spend.",
        "<b>Shopping experience is now the better $ lever</b>: service is saturating (R3 +$2M ≈ +0.12) and rivals spend up to $18.5M on it.",
        "<b>Online and analytics barely move the matrix</b> (online +$8.5M since R0 → Frictionless only +0.4), so they fund it.",
        "<b>Net income ≈$46.7M</b> (+36%); model value ≈$719M."
      ],
      risks: ["Frictionless stays ≈3.8 (gap vs 5.0 fair line).", "Online sales share is slipping (51.3% → 49.7%); watch online revenue."]
    },
    {
      id: "B", name: "Bank profit, defend near-lead", badge: "Safe", segs: [5, 3],
      tag: "Trim online, analytics, vendor · $70.5M (≈$6.4M unspent)",
      levers: { vendor: 22, online: 10, experience: 17, service: 17, analytics: 4.5, pbLow: 60, pbHigh: 60, breadthLow: 50, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthHigh: 50 },
      why: ["<b>Highest net income (≈$48.5M)</b>: value = P/E × net income. Model ≈$728M.", "Experience ≈6.2 = 97% of Zephara: still 'close to the leader'."],
      risks: ["Experience drifts −0.1/round: we stay #2 and could fall further if Zephara moves.", "Unspent budget can look like no strategy (horizon/P/E)."]
    },
    {
      id: "C", name: "Plan A + breadth test", badge: "Bold test", segs: [5, 2],
      tag: "Plan A plus lower-cost breadth 50 → 55",
      levers: { vendor: 22, online: 10.5, experience: 20, service: 17, analytics: 5, pbLow: 60, pbHigh: 60, breadthLow: 55, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthHigh: 50 },
      why: ["<b>Breadth is customers' #2 value (1.39)</b> and we've never changed it; our lower-cost breadth position (2.4) trails PriceMart (4.5).", "Tests it on one product line only."],
      risks: ["Untested: model guess +$5M revenue, but more inventory and possible cost."]
    }
  ],

  // ---- Round-by-round snapshots (real game data). Add one per round. ----
  rounds: [
    {
      round: 0, label: "Round 1 status (start)",
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
      round: 1, label: "Round 2 status (after R1 submit)",
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
      round: 2, label: "Round 3 status (after R2 submit)",
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
    },
    {
      round: 3, label: "Round 4 status (after R3 submit)",
      kpi: { marketValue: 533.8, mvChange: 47.5, revenue: 549.2, ebit: 73.3, interest: 20.5, netIncome: 34.4,
             debt: 212.5, equity: 157.8, currentRatio: 0.99, roic: 19.8, wacc: 11.8, onlineSales: 49.7,
             grossMargin: 36.3, daysInventory: 72, budget: 76.9, clv: 1201.1 },
      matrix: { getchells: [5.1, 6.3, 4.8, 3.8], leader: [5.1, 6.4, 5.5, 7.4], fair: [3.4, 4.3, 3.7, 5.0] },
      revenue: { "PriceMart": 881.6, "BestCo": 638.6, "Getchells": 549.2, "Cadabra": 520.3, "Zephara": 439.9, "AIM": 367.3, "KT Benny": 356.3 },
      // Market share by revenue [lower-cost, higher-cost] % (revenueMarketShare CSV, exact). Market $3.75B (+9.2%)
      share: {
        "PriceMart": [11.8, 11.7], "BestCo": [10.5, 6.5], "Cadabra": [9.4, 4.5], "Getchells": [10.6, 4.0],
        "Zephara": [10.3, 1.4], "AIM": [7.7, 2.1], "KT Benny": [8.8, 0.7]
      },
      unitCost: { "Zephara": [132.38, 264.77], "BestCo": [132.64, 269.94], "PriceMart": [136.12, 272.24], "Cadabra": [137.79, 277.25], "AIM": [138.50, 278.54], "Getchells": [138.66, 277.33], "KT Benny": [142.01, 284.03] },
      industry: [
        { name: "Markup · lower-cost", ours: 54, avg: 49.62, min: 26.54, max: 73.24, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 54.86, min: 26.54, max: 84.92, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 43, min: 24, max: 75, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost", ours: 30, avg: 30, min: 21, max: 38, unit: "" },
        { name: "Depth · higher-cost", ours: 30, avg: 20, min: 7, max: 32, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 49, min: 2, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 43, min: 2, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 233, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 11.5, avg: 13.73, min: 7.84, max: 23.64, unit: "$M" },
        { name: "Customer service", ours: 17, avg: 12.98, min: 5.91, max: 18.51, unit: "$M" },
        { name: "Shopping experience", ours: 17, avg: 10.36, min: 0, max: 17, unit: "$M" },
        { name: "Vendor management", ours: 23, avg: 36.12, min: 15.58, max: 69.26, unit: "$M" },
        { name: "Customer analytics", ours: 6, avg: 7.07, min: 3.12, max: 12.47, unit: "$M" }
      ],
      headline: "Round 4 status: MV +47.5% to $534M. <span class=\"hl\">Profit +50%, but WACC jumped to 11.8%.</span>",
      moves: [
        "<b>Net income $34.4M</b> (model said $35.3M) but P/E slipped to 15.5 as WACC rose 9.4% → 11.8%: value grew 47.5%, not 60%.",
        "<b>Experience 6.3, 0.1 behind Zephara</b>: service is saturating (+$2M ≈ +0.12); shopping experience is now the better $ lever.",
        "<b>Frictionless +0.3 to 3.8</b> and Brand lead 0.4: keep quality 6/6. Growth is shifting to segments 1, 4, 6."
      ]
    }
  ]
};
