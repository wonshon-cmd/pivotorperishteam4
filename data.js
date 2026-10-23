// Getchells Strategy Copilot — data
// Real game data through Round 1. Add a new entry to `rounds` and update base/defaults/rivals after each round.

window.SIM = {
  company: "Getchells",
  dataVersion: "R6-sub-v94",  // bump whenever data is updated (clears stale browser saves)
  round: 6,

  // Current financial position ($M) — END OF ROUND 5 = our Round 6 status (CSV "Round-5", exact)
  base: {
    revenue: 677.39, cogs: 430.81, depreciation: 36.26, otherSGA: 33.87,
    interest: 6.74, cash: 49.05, debt: 116.70, stLoans: 0, equity: 275.10, ap: 41.11,
    inventory: 87.89, receivables: 27.84, netPPE: 268.12,
    wacc: 10.9, marketValue: 1024.2, budget: 85.517, stores: 185, clv: 1523.3,
    netIncome: 66.64, pe: 15.4, peDrift: 1.0, growth: 0.10, debtPrev: 166.67
    // budget 85.517 = REAL (Round 6 input screen) = 14% × Round 4 revenue 610.84 → rule = max(14% × revenue two results back, …). Next ≈ 14% × 677.39 = $94.8M.
    // Short-term loans paid to $0; long-term debt $116.7M runs off slowly, so free cash now builds cash ($36M → $49M).
    // P/E rose 15.2 → 15.4 as WACC fell 11.6% → 10.9% → peDrift 1.0 now. Growth: +14.5, 14.5, 12.4, 11.2, 10.9% → 10% next.
  },

  // Last submitted decisions = Round 5 (game screen) — Brian's screen
  defaults: {
    online: 14.5, service: 18, experience: 20, vendor: 18, analytics: 6,
    markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6,
    pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 28, breadthLow: 55, breadthHigh: 50
  },
  // v8 position model inputs: our product positions now (CSV Round-5) and industry average spend now / next round (+7.5%, +7.8%, +9.4%/round trend)
  posNow: { exp: 3.8, svc: 2.5, onl: 1.3 },
  indAvgNow: { service: 15.18, experience: 11.81, online: 16.40, vendor: 38.79, analytics: 7.75 },
  indAvgNext: { service: 16.32, experience: 12.73, online: 17.94 },

  quadrants: ["Brand", "Experience", "Low Price", "Frictionless"],

  // Matrix scores 0–10: [Brand, Experience, Low Price, Frictionless] — END OF CSV ROUND 5 = Round 6 status (BRAND/EXPERIENCE/LOW_PRICE/FRICTIONLESS-round5.csv, exact)
  rivals: {
    "Getchells": [4.9, 6.3, 4.8, 3.8],
    "Cadabra":   [3.9, 2.5, 5.2, 7.1],
    "PriceMart": [1.9, 3.8, 5.2, 3.0],
    "AIM":       [3.4, 0.9, 5.5, 1.3],
    "KT Benny":  [3.5, 4.7, 4.7, 2.1],
    "Zephara":   [4.6, 6.5, 4.9, 4.1],
    "BestCo":    [4.5, 3.4, 4.9, 6.0]
  },
  // Drift per round if we change nothing (R2: inputs flat except online → Experience −0.1 as rivals spent more)
  drift: [0, 0, 0, 0], // v8: drift now comes from the position model (rivals raise service ≈7.5%/round)

  // Fair value = 75% of the leader (official rule, Intro slides). The game's white line looked closer to ~66%; we plan to the stricter 75%.
  fairRatio: 0.75,

  // History from kahn-round2.csv (exact): rounds −2..2. Game's white line = 2/3 of leader.
  trendRounds: [-2, -1, 0, 1, 2, 3, 4, 5],
  trend: [
    { "Getchells": [6.3, 6.3, 6.3, 5.1, 5.1, 5.1, 5.1, 4.9], "Zephara": [5.2, 5.0, 4.9, 5.0, 4.8, 4.7, 4.6, 4.6], "Cadabra": [4.5, 4.2, 4.1, 4.3, 4.1, 4.0, 3.9, 3.9], "BestCo": [3.2, 3.5, 3.6, 4.0, 4.2, 4.4, 4.4, 4.5], "AIM": [3.9, 3.6, 3.5, 3.7, 3.5, 3.4, 3.4, 3.4], "KT Benny": [2.2, 2.4, 2.5, 2.8, 3.0, 3.2, 3.4, 3.5], "PriceMart": [1.8, 1.8, 1.8, 1.9, 1.9, 1.9, 1.9, 1.9], "Fair value": [4.2, 4.2, 4.2, 3.4, 3.4, 3.4, 3.4, 3.3] },
    { "Zephara": [5.9, 6.4, 6.5, 6.3, 6.4, 6.4, 6.5, 6.5], "Getchells": [5.2, 5.7, 5.8, 6.2, 6.1, 6.3, 6.4, 6.3], "KT Benny": [2.5, 3.2, 3.8, 4.1, 4.4, 4.5, 4.6, 4.7], "PriceMart": [2.5, 3.1, 3.5, 3.7, 3.9, 3.9, 3.9, 3.8], "BestCo": [2.4, 2.9, 3.3, 3.4, 3.5, 3.5, 3.4, 3.4], "Cadabra": [6.7, 4.2, 3.1, 2.6, 2.5, 2.4, 2.5, 2.5], "AIM": [2.2, 1.7, 1.4, 1.1, 1.0, 0.9, 0.9, 0.9], "Fair value": [4.4, 4.2, 4.3, 4.2, 4.3, 4.3, 4.3, 4.4] },
    { "AIM": [5.5, 5.5, 5.4, 5.5, 5.5, 5.5, 5.5, 5.5], "PriceMart": [5.2, 5.1, 5.1, 5.1, 5.2, 5.2, 5.2, 5.2], "Cadabra": [4.8, 5.0, 5.0, 5.1, 5.1, 5.1, 5.2, 5.2], "BestCo": [5.2, 5.0, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9], "Zephara": [4.9, 4.8, 4.8, 4.9, 4.9, 4.9, 4.9, 4.9], "Getchells": [4.9, 4.9, 4.9, 4.8, 4.8, 4.8, 4.8, 4.8], "KT Benny": [5.2, 5.1, 5.0, 4.9, 4.8, 4.8, 4.7, 4.7], "Fair value": [3.7, 3.6, 3.6, 3.6, 3.7, 3.7, 3.7, 3.7] },
    { "Cadabra": [9.7, 8.4, 7.8, 7.6, 7.5, 7.4, 7.3, 7.1], "BestCo": [3.7, 4.5, 5.2, 5.6, 5.9, 5.9, 5.9, 6.0], "Zephara": [2.7, 3.3, 3.6, 3.7, 3.9, 3.9, 4.0, 4.1], "Getchells": [3.3, 3.5, 3.4, 3.5, 3.5, 3.8, 3.9, 3.8], "PriceMart": [1.9, 2.4, 2.8, 3.0, 3.1, 3.1, 3.0, 3.0], "KT Benny": [0.9, 1.2, 1.5, 1.8, 1.9, 2.0, 2.0, 2.1], "AIM": [2.3, 2.0, 1.8, 1.5, 1.4, 1.4, 1.3, 1.3], "Fair value": [6.5, 5.6, 5.2, 5.1, 5.0, 5.0, 4.8, 4.8] }
  ],

  // Why each retailer lands where it does (from the game's company profiles)
  why: {
    "Getchells": ["#1 (4.9) but slipped 0.2: higher-cost depth cut 30 → 28", "#2 (6.3), 0.2 behind Zephara: service position fell 2.7 → 2.5", "4.8, flat; costs now 2.0% above rivals (vendor $18M)", "3.8 (−0.1); online position up, service position down"],
    "Cadabra":   ["3.9, flat", "2.5", "5.2 (#2 tie)", "#1 (7.1) but sliding every round"],
    "PriceMart": ["Last (1.9)", "3.8", "5.2 (#2 tie)", "3.0"],
    "AIM":       ["3.4", "Last (0.9)", "#1 (5.5) for 8 rounds", "1.3"],
    "KT Benny":  ["Rising (3.5)", "Rising: 2.5 → 4.7", "4.7", "2.1"],
    "Zephara":   ["#2 (4.6), flat", "#1 (6.5); best service position (3.4)", "4.9", "4.1"],
    "BestCo":    ["4.5 ↑, closing in on us", "3.4", "4.9", "#2 (6.0), rising"]
  },

  // One-minute read: each rival's competitive edge
  edges: [
    { n: "Getchells", real: "Macy's",   q: "Brand #1 + Experience #2", edge: "MV $1.02B (+32.6%); net income $66.6M; fastest grower (+10.9% vs market +8.7%)", weak: "Experience slipped to 6.3; Frictionless below fair; costs 2.0% above rivals", us: true },
    { n: "Cadabra",   real: "Amazon",    q: "Frictionless #1", edge: "100% online ($604M, +7%); online position 4.6", weak: "Frictionless sliding 9.7 → 7.1; Experience 2.5" },
    { n: "PriceMart", real: "Walmart",   q: "Low Price #2",    edge: "Biggest revenue ($1,038M, +8.2%); most stores; breadth leader", weak: "Brand last (1.9)" },
    { n: "BestCo",    real: "Costco",    q: "Frictionless #2",    edge: "$767M (+9.3%); lowest costs; Brand 4.5 rising", weak: "Experience 3.4; austere stores" },
    { n: "Zephara",   real: "Sephora",   q: "Experience #1",   edge: "Experience 6.5; best service position (3.4)", weak: "Slowest grower (+6.8%); Brand flat 4.6" },
    { n: "AIM",       real: "Target",    q: "Low Price #1",     edge: "Low Price leader 8 rounds (5.5)", weak: "Experience last (0.9)" },
    { n: "KT Benny",  real: "JCPenney",  q: "Rising",         edge: "Experience 2.5 → 4.7; Brand 3.5 ↑", weak: "Smallest ($419M); priciest costs" }
  ],

  // What each quadrant means for Getchells
  quadNotes: [
    { sub: "Branded performance superiority", note: "#1 by 0.3 (Zephara 4.6, BestCo 4.5 ↑). Higher-cost depth back to 30 should recover ≈+0.15." },
    { sub: "Enhanced customer experience",    note: "#2, 0.2 behind Zephara (6.5). Service must keep pace with rivals (+7%/round) or Experience slips." },
    { sub: "Operational excellence, lowest cost", note: "Flat tie; 4.8 vs fair 3.7. Costs 2.0% above rivals (vendor $18M vs avg $38.8M)." },
    { sub: "Customer understanding, convenience", note: "3.8 vs fair line 4.8. Online position builds; service position slipping holds it back." }
  ],

  // REAL segment data (Round 0 Preferences chart, read by bar length).
  // weights → [Brand, Experience, Low Price, Frictionless]: Experience = shopping exp + ½ service; Frictionless = online + ½ service.
  // CSV Round 4 exact (preference / marketRevenue / marketCLV / marketSize). weights = [brand, shopping exp + ½ service, low price, online + ½ service], normalized.
  // CSV Round 5: our revenue $M: S5 135.6 (+6.6%), S2 134.0 (+9.8%), S6 131.1 (+13.8%), S1 122.5 (+13.4%), S3 85.6 (+8.5%), S4 68.5 (+15.4%).
  // Customers (units): S1 4.01M (+7.6%), S6 3.37M (+5.1%), S2 3.22M (+3.4%), S5 2.32M (0%: stopped growing), S4 1.84M (+4.7%), S3 1.62M (+1.0%).
  // Customers: S1 3.72M ↑, S6 3.21M ↑, S2 3.12M ↑, S5 2.32M (flat 6 rounds), S4 1.76M ↑, S3 1.61M. Growth = S4, S6, S1; Experience segments slowest.
  segments: [
    { id: 1, name: "Online Bargain",     wants: "Online + low price + service · never in stores", clvShare: 0.200, rev: 0.181, weights: [0.06, 0.16, 0.29, 0.48], rival: "Cadabra" },
    { id: 2, name: "Breadth Shoppers",   wants: "Huge selection + stores + price",              clvShare: 0.196, rev: 0.198, weights: [0.14, 0.32, 0.26, 0.28], rival: "PriceMart / AIM" },
    { id: 3, name: "Brand Lovers",       wants: "Brand + shopping experience",                  clvShare: 0.119, rev: 0.126, weights: [0.28, 0.42, 0.13, 0.17], rival: "Zephara" },
    { id: 4, name: "Omni Mix",           wants: "Online + stores + price",                      clvShare: 0.106, rev: 0.101, weights: [0.13, 0.3, 0.23, 0.34], rival: "AIM / KT Benny" },
    { id: 5, name: "Experience Seekers", wants: "Shopping experience above all + stores",       clvShare: 0.183, rev: 0.200, weights: [0.13, 0.53, 0.12, 0.22], rival: "Zephara" },
    { id: 6, name: "Store Bargain",      wants: "Stores + price + breadth · zero depth",        clvShare: 0.196, rev: 0.194, weights: [0.14, 0.39, 0.27, 0.21], rival: "BestCo" }
  ],

  // Market-wide preference intensity (sum of 6 segments), CSV Round 4. Depth keeps rising (0.89 → 1.03); now above online.
  prefs: [
    { n: "Shopping experience", v: 1.44, q: "Experience" }, { n: "Breadth", v: 1.37, q: "Assortment" },
    { n: "Retail stores", v: 1.22, q: "Stores" }, { n: "Low price", v: 1.12, q: "Low Price" },
    { n: "Depth", v: 1.06, q: "Assortment" }, { n: "Online", v: 1.02, q: "Frictionless" },
    { n: "Customer service", v: 0.92, q: "Frict. / Exp." }, { n: "Brand", v: 0.80, q: "Brand" }
  ],

  // Our history (Data → Market CLV / Market Revenue for your company)
  ourTrend: { rounds: [-2, -1, 0, 1, 2, 3, 4, 5], clv: [680.1, 738.0, 818.5, 943.7, 1075.0, 1201.1, 1349.1, 1523.3], revenue: [314.7, 342.0, 372.8, 426.7, 488.7, 549.2, 610.8, 677.4] },

  // ---- Decision log: what we submitted each round (for the Timeline page) ----
  decisionLog: [
    { round: 0, label: "R0 (inherited)", d: { online: 2, service: 15, experience: 10, vendor: 30, analytics: 10, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 50, pbHigh: 50, stores: 200, depthLow: 50, depthHigh: 50, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 try 1 (undone)", d: { online: 9, service: 7, experience: 15, vendor: 30, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 5, nbQuality: 5, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 1, label: "R1 final", d: { online: 9, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 2, label: "R2", d: { online: 10.5, service: 15, experience: 15, vendor: 25, analytics: 5.8, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } }
,
    { round: 3, label: "R3", d: { online: 11.5, service: 17, experience: 17, vendor: 23, analytics: 6, pbLow: 60, pbHigh: 60, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } }
,
    { round: 4, label: "R4", d: { online: 12.5, service: 18, experience: 17.5, vendor: 20, analytics: 6, pbLow: 60, pbHigh: 60, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 50, breadthHigh: 50 } },
    { round: 5, label: "R5", d: { online: 14.5, service: 18, experience: 20, vendor: 18, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 28, breadthLow: 55, breadthHigh: 50 } },
    { round: 6, label: "R6 submitted", d: { online: 16, service: 24, experience: 21.5, vendor: 18, analytics: 6, markupLow: 54, markupHigh: 66, pbQuality: 7, nbQuality: 7, pbLow: 60, pbHigh: 60, stores: 185, depthLow: 30, depthHigh: 30, breadthLow: 55, breadthHigh: 50 } },
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
      lesson: "Profit forecast was right; the miss was P/E (WACC jumped). Service saturates: +$2M gave far less Experience than the first $8M did, because the game scores us RELATIVE to rivals (our service position fell 3.4 → 2.8 as rivals raised spending to $18.5M max). Model v6: service curve saturates, P/E drifts down ~2%/round." },
    { round: 4, title: "Round 4 (service $18M, experience $17.5M, vendor $20M, online $12.5M)",
      changes: ["Service $17M → $18M", "Shopping experience $17M → $17.5M", "Vendor $23M → $20M", "Online $11.5M → $12.5M", "Budget $74.152M (fell vs $74.616M)"],
      results: ["MV $772.4M (+44.7%); model $717M", "Net income $50.7M (model $47.2M); revenue $610.8M (model $610M ✓); P/E 15.2 ✓", "Experience 6.3 → 6.4 (Zephara 6.5); Frictionless 3.8 → 3.9; Low Price 4.8", "Debt $212.5M → $166.7M; interest $20.5M → $13.7M"],
      lesson: "Revenue and P/E forecasts were exact; the whole miss was interest. Debt falls by exactly the free cash flow (NI + depreciation − capex − working capital), and the rate fell 9.0% → 7.2% as credit improved. Model v7 fixes debt paydown. Vendor −$3M: no visible Low Price change yet." }
,
    { round: 5, title: "Round 5 (experience $20M, online $14.5M, vendor $18M, breadth 55, higher depth 28)",
      changes: ["Shopping experience $17.5M → $20M", "Online $12.5M → $14.5M", "Vendor $20M → $18M", "Breadth (lower) 50 → 55", "Depth (higher) 30 → 28", "Service flat at $18M; $0.98M unspent"],
      results: ["MV $1,024M (+32.6%); model $952M", "Net income $66.6M (model $63.2M); revenue $677.4M (model $682M ✓); P/E 15.4", "Brand 5.1 → 4.9; Experience 6.4 → 6.3 (model 6.54); Frictionless 3.9 → 3.8 (model 4.03); Low Price 4.8", "Short-term loans $47M → $0; cash $36M → $49M; interest $6.7M"],
      lesson: "Value beat again (interest + P/E), but the matrix model was too optimistic. Every quadrant move matched the game's product positions: service position fell 2.7 → 2.5 at flat $18M (rivals +7%), which cancelled the experience (+0.2) and online (+0.2) gains; higher-cost depth position 3.4 → 3.1 took Brand down 0.2. Model v8 is now built on positions, relative to industry spend." }
  ],

  // ---- Model back-test (scratchpad bt.js): each run replayed from the real state it started in. predicted / actual ----
  backtest: [
    { run: "R1 try 1 (mulligan)", cells: ["4.7 / 4.7", "4.8 / 4.8", "4.9 / 4.9", "2.7 / 2.7", "$403M / $404M", "$6.6M / $8.2M", "P/E-driven"] },
    { run: "R1 final",            cells: ["5.1 / 5.1", "6.2 / 6.2", "4.8 / 4.8", "3.5 / 3.5", "$421M / $427M", "$6.7M / $11.1M", "P/E-driven"] },
    { run: "R3 (forecast on file, v5)", cells: ["5.1 / 5.1", "6.46 / 6.3", "4.76 / 4.8", "3.67 / 3.8", "$562M / $549M", "$35.3M / $34.4M", "$579M / $534M"] },
    { run: "R3 (refit v6)",       cells: ["5.1 / 5.1", "6.3 / 6.3", "4.76 / 4.8", "3.67 / 3.8", "", "", ""] },
    { run: "R4 (forecast on file, v6)", cells: ["5.1 / 5.1", "6.29 / 6.4", "4.74 / 4.8", "3.88 / 3.9", "$610M / $611M", "$47.2M / $50.7M", "$717M / $772M"] },
    { run: "R5 (forecast on file, v7)", cells: ["5.08 / 4.9", "6.54 / 6.3", "4.76 / 4.8", "4.03 / 3.8", "$682M / $677M", "$63.2M / $66.6M", "$952M / $1,024M"] },
    { run: "R5 (refit v8, positions)", cells: ["4.95 / 4.9", "6.37 / 6.3", "4.8 / 4.8", "3.92 / 3.8", "", "", ""] },
    { run: "R2",                  cells: ["5.1 / 5.1", "6.1 / 6.1", "4.8 / 4.8", "3.5 / 3.5", "$486M / $489M", "$22.9M / $22.8M", "$363M / $362M"] }
  ],
  // R1 net income runs low because R0 interest (10.5% of year-end debt) is overstated without R−1 debt; R2 uses average debt.

  // ---- Game's product-position map, CSV Round 4 (Round 5 status) (productPosition CSV): how customers SEE each firm, relative to rivals ----
  positions: {
    cols: ["Getchells", "Cadabra", "PriceMart", "AIM", "KT Benny", "Zephara", "BestCo"],
    rows: [
      ["Customer service", 2.5, 2.5, 1.0, 0.4, 1.3, 3.4, 2.4], ["Online", 1.3, 4.6, 2.0, 0.9, 0.8, 0.7, 3.6],
      ["Shopping experience", 3.8, 0, 2.8, 0.5, 3.4, 3.2, 1.0], ["Retail coverage", 1.3, 0, 5.0, 1.3, 1.2, 1.3, 4.2],
      ["Private brand · lower", 2.4, 1.8, 1.3, 1.8, 1.3, 3.1, 1.5], ["Private brand · higher", 2.5, 1.9, 1.3, 1.9, 1.3, 3.2, 1.1],
      ["Breadth · lower", 2.7, 1.9, 4.3, 1.6, 0.7, 1.6, 0.9], ["Breadth · higher", 4.0, 1.9, 3.2, 1.6, 0, 1.6, 1.6],
      ["Depth · lower", 1.8, 2.0, 1.0, 1.5, 3.0, 1.5, 2.5], ["Depth · higher", 3.1, 2.1, 0.2, 1.5, 1.4, 1.5, 3.8],
      ["Price · lower", 1.0, 0.8, 0.7, 0.8, 1.4, 1.1, 0.9], ["Price · higher", 3.1, 2.6, 2.1, 2.5, 3.6, 3.4, 2.7]
    ],
    note: "Service position 2.7 → 2.5 at flat $18M (rivals' avg rose to $15.2M, max $22.4M). Shopping experience 3.8 = #1. Higher-cost depth 3.4 → 3.1 after the 30 → 28 cut, and Brand fell with it."
  },


  // ---- Hover help on Build plan sliders: confidence, effect, hypothesis (untested levers), long-term call + why ----
  // Build plan value panel: smaller "hold" calls + ideas worth exploring (update each round)
  minorCalls: [
    ["stores", "Hold 185", "Store sales grew faster than online (+12% vs +10%), but new stores are untested; cash is building if we ever try."],
    ["breadthLow", "Hold 55 / 50", "Breadth 55 added ≈+0.4 pt of lower-cost growth and 2 inventory days; no clear harm, no clear win."],
    ["markupLow", "Hold 54% / 66%", "Low Price stays above fair; cutting price costs ≈$4M profit per point."],
    ["pbQuality", "Hold 6 / 6", "Brand lead 0.3 over BestCo (rising 0.1/round); go to 7 if the lead drops below 0.2."],
    ["pbLow", "Hold 60%", "No evidence private brand % moves Brand; depth does."],
    ["vendor", "Hold $18M", "Costs now 2.0% above rivals; cut to ≈$15M only in the final round."],
    ["analytics", "Hold $6M", "Small effect; cut only in the final round."]
  ],
  explore: [
    { label: "Higher-cost depth → 32", change: { depthHigh: 32 }, when: "If BestCo's Brand gets within 0.2", conf: "Low", why: "Brand has tracked our higher-cost depth position in every round (R1 and R5). 32 is the industry max, so it's untested ground: ≈+0.15 Brand, a bit more inventory." },
    { label: "Brand quality 6 → 7", change: { pbQuality: 7, nbQuality: 7 }, when: "If Brand lead < 0.2", conf: "High", why: "Proven lever (+0.2 Brand per step). BestCo is at 4.5 and rising ≈+0.1 a round." },
    { label: "Service $26M", change: { service: 26 }, when: "If Zephara's Experience rises again", conf: "Medium", why: "Service position is relative: ≈+0.26 per extra $2M at today's industry average. Doesn't build up, so it has to be paid every round." },
    { label: "Online +$2M", change: { online: 18 }, when: "To close the Frictionless gap", conf: "Medium", why: "Online position builds (+0.2/round); Frictionless 3.8 vs the game's fair line 4.8. S1 and S4 shop online and are growing." },
    { label: "Breadth (lower) back to 50", change: { breadthLow: 50 }, when: "To free inventory", conf: "Low", why: "Breadth 55 barely moved lower-cost growth (+10.0% → +10.4%) and inventory days rose 72 → 74." }
  ],

  // Last round recap page (update every round): game screen "Round 4" inputs → Round 5 status
  recap: {
    title: "Round 5 screen → Round 6 status",
    sub: "What we typed in last round, what it changed, and how close our forecast was.",
    kpis: [
      { k: "Market value", from: 772.4, to: 1024.2, proj: 952, unit: "$M", note: "beat our forecast by $72M" },
      { k: "Net income", from: 50.7, to: 66.6, proj: 63.2, unit: "$M", note: "beat by $3.4M (interest halved)" },
      { k: "Revenue", from: 610.8, to: 677.4, proj: 682, unit: "$M", note: "within 1% of forecast" },
      { k: "Debt", from: 166.7, to: 116.7, proj: 112, unit: "$M", note: "short-term loans now $0" }
    ],
    quads: [
      { q: "Brand", from: 5.1, to: 4.9, proj: 5.08, rank: "#1", note: "BestCo 4.5 ↑ · Zephara 4.6" },
      { q: "Experience", from: 6.4, to: 6.3, proj: 6.54, rank: "#2", note: "Zephara 6.5, gap 0.2" },
      { q: "Low Price", from: 4.8, to: 4.8, proj: 4.76, rank: "fair", note: "AIM 5.5 · fair line 3.7" },
      { q: "Frictionless", from: 3.9, to: 3.8, proj: 4.03, rank: "below fair", note: "Cadabra 7.1 · fair 4.8" }
    ],
    changes: [
      { lever: "Shopping experience", from: "$17.5M", to: "$20M", effect: "Our shopping-experience position rose 3.6 → 3.8 (#1, and we're the industry's top spender). On its own that was worth ≈+0.2 Experience.", how: "+0.2", conf: "High" },
      { lever: "Customer service (held)", from: "$18M", to: "$18M", effect: "Rivals' average rose $14.1M → $15.2M, so our service position fell 2.7 → 2.5. That cancelled the experience gain: Experience 6.4 → 6.3.", how: "−0.2", conf: "High" },
      { lever: "Online", from: "$12.5M", to: "$14.5M", effect: "Online position built 1.1 → 1.3, but the service slip pulled Frictionless 3.9 → 3.8. Online share of sales kept drifting (49.3% → 48.7%).", how: "+0.2 pos.", conf: "High" },
      { lever: "Depth · higher-cost", from: "30", to: "28", effect: "Depth position 3.4 → 3.1 and Brand 5.1 → 4.9. Same link as Round 1, when cutting depth 50 → 30 dropped Brand.", how: "−0.2 Brand", conf: "Medium" },
      { lever: "Breadth · lower-cost", from: "50", to: "55", effect: "Breadth position 2.4 → 2.7. Lower-cost sales grew +10.4% (vs +10.0% the round before); inventory days 72 → 74.", how: "≈+$2M rev.", conf: "Low" },
      { lever: "Vendor management", from: "$20M", to: "$18M", effect: "Saved $2M. Low Price held at 4.8, but our unit cost is now 2.0% above rivals (was 1.8%).", how: "+$2M now", conf: "Medium" }
    ],
    untouched: "Markups 54/66, lower-cost depth 30, private brand 60/60, quality 6/6, stores 185, analytics $6M (score 100.5% → 100.8%).",
    why: [
      { t: "Why value beat the forecast", d: "Short-term loans went to $0 and interest halved ($13.7M → $6.7M), worth ≈+$2M of profit, and P/E rose 15.2 → 15.4 as WACC fell to 10.9% (model expected P/E to drift down). 15.4 × $66.6M = $1,024M.", conf: "High" },
      { t: "Why Experience and Brand slipped", d: "The game scores positions relative to rivals. Rivals raised service 7%, so our flat $18M lost ground; and the depth cut lowered our premium depth position. Model v8 now predicts from positions and industry spend.", conf: "High" },
      { t: "Why the budget jumped to $85.5M", d: "It's 14% of Round 4 revenue ($610.8M). The rule uses revenue from two results back, so next round's budget should be ≈14% × $677.4M = $94.8M.", conf: "High" }
    ],
    track: [
      { r: "R1 (try 1, undone)", model: "v1", mvP: 102.7, mvA: 113.0, niP: null, niA: 8.2, qErr: "≈0.5–1.5", fix: "Service drives Experience" },
      { r: "R2", model: "v2", mvP: 185, mvA: 361.9, niP: null, niA: 22.8, qErr: "Fric 3.8 vs 3.5", fix: "Value = P/E × net income" },
      { r: "R3", model: "v5", mvP: 579, mvA: 533.8, niP: 35.3, niA: 34.4, qErr: "Exp 6.46 vs 6.3", fix: "Service saturates; P/E drift" },
      { r: "R4", model: "v6", mvP: 717, mvA: 772.4, niP: 47.2, niA: 50.7, qErr: "Exp 6.29 vs 6.4", fix: "Debt = free cash flow" },
      { r: "R5", model: "v7", mvP: 952, mvA: 1024.2, niP: 63.2, niA: 66.6, qErr: "Brand 5.08 vs 4.9 · Exp 6.54 vs 6.3 · Fric 4.03 vs 3.8", fix: "v8: position model relative to industry spend; P/E drift 1.0; cash builds" },
      { r: "R6 (submitted)", model: "v8", mvP: 1354, mvA: null, niP: 77.4, niA: null, qErr: "Brand ≈5.45 · Exp ≈7.02 · Fric ≈4.58", fix: "Compare when Round 6 results arrive" }
    ],
    next: "So for this round: raise service to ≈$24M to win the Experience lead back, put higher-cost depth back to 30 for Brand, and spend the rest of the bigger $85.5M budget on experience and online, which keep building."
  },

  team: ["Mike", "Brian", "Patrick", "Abhishek", "Joe"], submitter: "Brian", liveTopic: "getchells-t4-39bd523aae1a",  // ntfy.sh relay room (only names + slider numbers are sent)

  // How we beat Zephara (differentiate, don't out-spend). Shown on Build plan + Game plan. Update each round.
  vsZephara: {
    title: "How we beat Zephara",
    sub: "Zephara leads Experience on service. We match it on service once, and win where it's weak: brand, premium range and growth.",
    compare: [["Experience score", "6.3", "6.5", 0], ["Service position", "2.5", "3.4", -1], ["Shopping-experience position", "3.8 (#1)", "3.2", 1], ["Brand score", "4.9", "4.6", 1], ["Premium sales share", "4.3%", "1.3%", 1], ["Product costs", "+2.0% vs rivals", "≈−3%", -1], ["Revenue growth", "+10.9%", "+6.8%", 1]],
    moves: [
      ["Raise", "Close the service gap", "Round 5 proved service is scored against rivals: flat $18M lost 0.2 Experience. $24M (just above the industry max) wins the lead back.", "Medium"],
      ["Raise", "Keep Brand our clear lead", "Higher-cost depth back to 30 (cheap, ≈+0.15). Quality to 7 if BestCo (4.5, rising) gets within 0.2.", "Medium"],
      ["Hold", "Own 'wide and premium'", "Our premium share (4.3%) is 3× Zephara's; keep breadth 55/50.", "Low"],
      ["Hold", "Win on growth and profit", "We're the fastest grower (+10.9%); Zephara the slowest (+6.8%). No price war: its costs are lower.", "Medium"]
    ],
    watch: "If Zephara raises service again, add ≈$2M service (≈+0.26). <b>Watch BestCo's Brand</b> (4.5, +0.1/round). KT Benny's Experience keeps rising (4.7)."
  },

  // Lever page: grouped by how we decide (our thought process)
  leverGroups: [
    { q: "1 · Does it help us WIN Brand or Experience?", why: "Leading two quadrants lifts our P/E (≈ +10% per point of Brand + Experience).",
      note: "<b>How brand works:</b> every product is either <b>our own label</b> (private brand %) or a <b>national brand</b> (the rest = 100% − private brand %). Each has a <b>quality</b> setting (1–10). Raising both qualities 5 → 6 lifted our Brand score +0.4. When we raised our own-label share 50 → 60% (and cut depth the same round), Brand fell −1.6, so more own-label may weaken Brand.", keys: ["experience", "service", "pbQuality", "nbQuality"] },
    { q: "2 · Does it keep Low Price at fair value?", why: "We only need to stay above 75% of the leader (we're at 4.8 vs 4.1 needed).", keys: ["vendor", "markupLow", "markupHigh"] },
    { q: "3 · Does it grow revenue cheaply?", why: "Revenue growth turns straight into profit when spending stays flat.", keys: ["breadthLow", "breadthHigh", "stores"] },
    { q: "4 · Is it protecting profit and cash?", why: "Every $1M we don't spend ≈ +$10M of market value (value = P/E × profit).", keys: ["online", "analytics", "depthLow", "depthHigh", "pbLow", "pbHigh"] }
  ],
  // What we've learned so far (update each round) + one test per round so we keep learning
  learning: {
    proven:  { label: "Proven", note: "tested cleanly, numbers are reliable", keys: ["service", "pbQuality", "nbQuality", "depthLow", "depthHigh"] },
    partly:  { label: "Partly known", note: "seen it move, size is an estimate", keys: ["experience", "vendor", "online", "stores"] },
    unknown: { label: "Still unknown", note: "never changed on its own", keys: ["breadthLow", "breadthHigh", "markupLow", "markupHigh", "pbLow", "pbHigh", "analytics"] },
    tests: ["Round 5 → 6: breadth (lower-cost) 50 → 55", "Round 6 → 7: private brand 60% → 55% (alone)", "Round 7 → 8: analytics $6M → $4M (alone)", "Final round: no tests, just harvest profit"]
  },
  leverInfo: {
    vendor: { build: ["slow", "Builds slowly", "Savings pile up in our cost per item over rounds; cuts also hurt slowly, so the best time to cut is the final round."], what: "Vendor management = money spent negotiating better prices from suppliers.", up: "Better deals → our cost per item falls slowly over rounds → lower shelf prices (same markup) → Low Price score and sales tick up.", down: "Less negotiating → saves money now (profit up) → but our cost per item creeps above rivals' each round → slowly hurts later rounds, so it's best done in the final round.", data: ["Industry: we spend far below average ($20M vs $37.4M; max $72.8M).", "Scorecard: our cost per item is $144.09 vs rivals' ≈$141.6 average (+1.8%, up from +0.3% at the start). Vendor Score 100.4% creeps up like the analytics score.", "Income statement: 100% booked as cost; gross margin still flat at 36.4%."], plain: "Money spent negotiating better prices from suppliers.", rule: "If our unit cost gap vs rivals passes +2.5% → add $3–5M back.", conf: "Medium", status: "Changed R1, R3, R4", effect: "Lowers our product cost slowly; Low Price ≈ +0.02 per $1M. Each $1M cut ≈ +$0.65M profit now, but our cost gap vs rivals grows ≈0.3 pt/yr.", longTerm: "Hold ≈$20M now; cut to ≈$15M in the final round", why: "Savings count fully in the last year, before the cost penalty builds up." },
    online: { build: ["up", "Builds up", "60% is capitalized, so our online position keeps growing (0 → 1.1) and mostly stays if we cut later."], what: "Online = website, app and delivery.", up: "Better website → Frictionless rises a little → but for us the effect has been tiny, and our target shoppers care least about online → 40% of the cost hits this year.", down: "Less online spend → Frictionless barely moves (it hasn't for us) → we save money → profit and market value rise slightly.", data: ["Industry: we're below average ($12.5M vs $15.0M; max $26.1M, probably Cadabra).", "Income statement: only 40% is booked as cost now ($5.0M); the rest is spread over later years.", "Scorecard: our online share of sales is drifting down (51.3% → 49.3%), but online revenue still grew 11%."], plain: "Website, app and delivery.", rule: "Watch online share of sales (49.3%): if it drops below 48%, add $1–2M; otherwise hold.", conf: "Medium", status: "Raised every round", effect: "Frictionless only ≈ +0.01–0.05 per $1M (online $2M → $12.5M moved it 3.4 → 3.9). 40% expensed.", longTerm: "Hold ≈$12.5M; trim only in the final round", why: "About half our sales are online and growing segments (S1, S4) shop there. Cutting saves little (only 40% is expensed) and the downside is uncertain." },
    experience: { build: ["up", "Builds up", "20% is capitalized, so our position keeps growing (2.4 → 3.6) and mostly stays if we cut later."], what: "Shopping experience = how nice our stores feel: layout, events, comfort.", up: "Nicer stores → higher Experience score (customers' #1 need) → helps us take Experience #1 from Zephara → leading two quadrants lifts our P/E → <b>market value up</b>. Cost: 80% of the spend hits this year's profit.", down: "Plainer stores → Experience score slips → we risk staying #2 behind Zephara → lower P/E premium; we save the spend, which lifts profit this year.", data: ["Industry: we're the top spender ($17.5M; average $11.0M, max $17.5M).", "Income statement: 80% is booked as cost this year, so $17.5M shows up as $14.0M.", "Product position: our shopping experience is 3.6, #1 in the market."], plain: "How nice our stores feel: layout, events, comfort.", rule: "If Experience is still below Zephara next round → add $1–2M more.", conf: "Medium", status: "Raised R1, R3, R4", effect: "Experience ≈ +0.08 per $1M at today's level. 80% expensed. Our position 3.6 = #1.", longTerm: "Raise to ≈$20.5M, then hold", why: "Customers' #1 need (1.44) and the cheapest way to take Experience #1." },
    service: { build: ["no", "Doesn't build up", "100% expensed and judged against rivals each round: cutting drops Experience right away (−1.4 in the mulligan)."], what: "Customer service = staff and help for shoppers, in store and online.", up: "Better service → Experience and Frictionless both rise a little → but rivals keep raising service too, so each extra $1M buys less → full cost hits profit.", down: "Less service → Experience and Frictionless slip (in Round 1 a deep cut cost −1.4 Experience) → we save the full amount in profit.", data: ["Industry: average $14.1M, max $20.4M (and rising ≈$1M a year); we're at $18M.", "Income statement: service cost = what we enter + 0.5% of revenue (≈$3M extra automatically).", "Product position: ours slipped 3.4 → 2.7 while Zephara holds 3.2: rivals are catching up."], plain: "Staff and help for shoppers, in store and online.", rule: "If our service position drops below 2.5 → add $1M; otherwise hold.", conf: "Medium", status: "Changed R1, R3, R4", effect: "Experience ≈ +0.05 and Frictionless ≈ +0.08 per $1M, but saturating: scored vs rivals' spending (avg $14M, max $20M).", longTerm: "Hold ≈$17M", why: "Rivals keep matching it; more $ buys less each round." },
    analytics: { build: ["no", "Barely builds", "The score creeps up whatever we spend; small effect either way."], what: "Customer analytics = data on our shoppers that makes service and online work better.", up: "More data → service and online spending work a little better → small lift to Experience/Frictionless → full cost hits profit.", down: "Less data → service and online work slightly less well → we save the full amount.", data: ["Scorecard: Analytics Score 100.0% → 100.5%, rising even when we cut spend from $10M to $6M. 100% looks like the Round 0 starting point, not 'maxed out'.", "Industry: average $7.4M (min $3.3M, max $13.4M); we're slightly below at $6M.", "Income statement: 100% booked as cost this year."], plain: "Data on our customers; makes service and online work better.", rule: "Hold; cut to $3M only in the final round.", conf: "Low", status: "Barely changed since R1", effect: "Small multiplier on service + online effects. No clean test yet.", hypothesis: "Probably +0.05 Experience/Frictionless per $1M at most.", longTerm: "Hold $5–6M", why: "Unproven; cheap to keep, risky to cut hard." },
    markupLow: { build: ["now", "Instant", "Prices change this round and can be undone next round."], what: "Markup = how much we charge above what the product costs us (price = cost × (1 + markup)).", up: "Higher prices → more profit per item → but price-sensitive shoppers buy less → fewer items sold and a lower Low Price score → overall profit can go either way.", down: "Lower prices → more shoppers and a better Low Price score → but less profit on every item → profit usually falls unless volume jumps.", data: ["Industry: average 50.6% (min 26.8%, max 76.0%); ours 54% is a bit above average.", "Income statement: gross margin has stayed 36.2–36.4% every round.", "Price = cost × (1 + markup), so our shelf price is ≈$222 per everyday item."], plain: "How much we charge above cost on everyday products.", rule: "Only cut if Low Price falls near fair value (≈4.1).", conf: "Medium", status: "NEVER changed (54%)", effect: "Untested.", hypothesis: "−1 pt ≈ −$3M gross profit, +1–2% units, Low Price ≈ +0.05. Prices = cost × (1 + markup).", longTerm: "Hold 54%", why: "Low Price is already above fair value; cutting markup trades profit for a score we don't need." },
    markupHigh: { build: ["now", "Instant", "Prices change this round and can be undone next round."], what: "Markup (premium) = how much we charge above cost on premium products.", up: "Higher premium prices → more profit per item, fewer premium buyers.", down: "Lower premium prices → more buyers, thinner margins.", data: ["Industry: average 55.9% (max 85.8%); ours 66% is well above average.", "Higher-cost sales still grew +14% last round, so customers accept the price."], plain: "How much we charge above cost on premium products.", rule: "Leave alone unless higher-cost sales growth drops below 8%.", conf: "Medium", status: "NEVER changed (66%)", effect: "Untested.", hypothesis: "−1 pt ≈ −$1M gross profit; higher-cost line is growing +14% without it.", longTerm: "Hold 66%", why: "Higher-cost growth is already strong; margin is the bigger win." },
    pbQuality: { build: ["now", "Instant", "Brand moved the same round we changed quality."], what: "Private-brand quality = how good our own-label products are (1–10).", up: "Better own-label products → Brand score rises (+0.2 per step) → protects our Brand #1 → small extra cost.", down: "Cheaper own-label products → Brand score falls → risks our Brand lead.", data: ["Industry: average quality 5 (range 4–7); we're at 6.", "Raising quality barely raised our costs (gross margin stayed flat)."], plain: "How good our own-label products are.", rule: "If BestCo or Zephara Brand gets within 0.3 of us → raise to 7.", conf: "High", status: "Raised 5 → 6 in R1", effect: "+1 ≈ +0.2 Brand (mulligan A/B test). Small cost effect.", longTerm: "Hold 6; go to 7 only if Brand lead < 0.3", why: "We lead Brand by 0.5 and customers value Brand least (0.80)." },
    nbQuality: { build: ["now", "Instant", "Brand moved the same round we changed quality."], what: "National-brand quality = how good the name-brand products we stock are (1–10).", up: "Better name brands → Brand score rises (+0.2 per step) → small extra cost.", down: "Cheaper name brands → Brand score falls.", data: ["Industry: average 5 (range 3–7); we're at 6."], plain: "How good the national-brand products we stock are.", rule: "Same trigger as private-brand quality.", conf: "High", status: "Raised 5 → 6 in R1", effect: "+1 ≈ +0.2 Brand.", longTerm: "Hold 6", why: "Same as private-brand quality: insurance, not a growth lever." },
    pbLow: { build: ["now", "Instant", "Changes the product mix this round."], what: "Private brand % = share of products sold under our own label; the rest are national (name) brands.", up: "More own-label → maybe slightly better margins → but fewer name brands may weaken our Brand image (Brand fell −1.6 when we did this in Round 1).", down: "More name brands → Brand image may improve → margins roughly the same (they barely moved last time).", data: ["Industry: average 50% own-label on everyday products; we're at 60%.", "Gross margin didn't improve when we went 50 → 60%, so the margin benefit seems small."], plain: "Share of everyday products sold under our own label.", rule: "Test 55% (alone) only if our Brand lead shrinks below 0.3.", conf: "Low", status: "Changed once (50 → 60% in R1)", effect: "Brand fell 1.6 when we did this AND cut depth; cause unclear. Margin stayed flat.", hypothesis: "Each −5 pts might give back ≈ +0.4 Brand.", longTerm: "Hold 60%; test 55% only if BestCo nears our Brand", why: "Brand is safe for now; keep tests one at a time." },
    pbHigh: { build: ["now", "Instant", "Changes the product mix this round."], what: "Private brand % (premium) = share of premium products under our own label.", up: "Same as everyday: more own-label may weaken Brand.", down: "Same as everyday: more name brands may help Brand.", data: ["Industry: average 43% on premium products; we're at 60%."], plain: "Share of premium products sold under our own label.", rule: "Same as lower-cost private brand.", conf: "Low", status: "Changed once (50 → 60% in R1)", effect: "Same as lower-cost private brand.", hypothesis: "Each −5 pts might give back ≈ +0.4 Brand.", longTerm: "Hold 60%", why: "Same reason." },
    breadthLow: { build: ["now", "Instant", "Changes what's on the shelf (and inventory) this round; easy to undo."], what: "Breadth = how many different products and categories we carry (e.g. more styles, more brands, more departments).", up: "More choice on the shelf → shoppers who want variety (Segment 2 Breadth Shoppers, and S4, S6, S1) find what they want with us instead of PriceMart → more visits and bigger baskets → <b>revenue rises</b>. The catch: every new product needs stock, so <b>inventory grows</b> → we borrow a bit more → slightly more interest. If the extra sales beat the extra interest, profit rises → <b>market value rises</b> (value = P/E × profit).", down: "Fewer choices on the shelf → variety shoppers (S2, S4, S6) find less and buy some of it elsewhere → <b>revenue dips</b>. Upside: we carry less stock → <b>less cash tied up in inventory</b> → slightly less debt and interest. Usually the lost sales outweigh the interest saved → profit and <b>market value dip</b>.", data: ["Industry: average 42 (min 25, max 75); we're at 50 but our position (2.4) trails PriceMart (4.4).", "Balance sheet: more products = more inventory (now $76M, 72 days), financed by debt."], plain: "How many different everyday products we carry.", rule: "If lower-cost revenue grows > 11% → go to 60; if < 10% → back to 50.", conf: "Low", status: "NEVER changed (50)", effect: "Untested.", hypothesis: "+5 ≈ +1% revenue (≈$6M) for ≈$0.3M interest on extra inventory. Customers' #2 need (1.39); S2, S4, S6 weight it; our position 2.4 trails PriceMart 4.5.", longTerm: "Test 55 now → 60 if lower-cost revenue grows > 11%", why: "Cheapest growth lever, aimed at our growing segments; easy to undo." },
    breadthHigh: { build: ["now", "Instant", "Changes what's on the shelf this round."], what: "Breadth (premium) = how many different premium products we carry.", up: "Already at the maximum (50), so it can't go higher.", down: "Fewer premium choices → our fastest-growing line (+14%) loses its edge → premium revenue slows → profit and market value dip; we'd save a little inventory.", data: ["Industry: average 30, max 50: we're at the max and #1 position (4.0)."], plain: "How many different premium products we carry.", rule: "Already at the max (50): leave it.", conf: "Low", status: "NEVER changed (50 = industry max)", effect: "Untested; already #1 position (4.0).", hypothesis: "Raising further is impossible (max 50); cutting would hurt our +14% higher-cost growth.", longTerm: "Hold 50", why: "Probably part of why higher-cost sales grow fastest." },
    depthLow: { build: ["now", "Instant", "Changes inventory (and debt) this round."], what: "Depth = how many units of each product we keep in stock (how full the shelves are).", up: "Fuller shelves → fewer 'out of stock' moments → a few more sales (customers value depth more each round) → but much more inventory to pay for → more debt and interest. In Round 1, cutting depth freed ≈$37M.", down: "Emptier shelves → less cash locked in stock → debt and interest fall → but more stock-outs, and customers are caring more about depth → some lost sales.", data: ["Balance sheet: inventory $76M; cutting depth 50 → 30 in Round 1 took inventory days from 90 to 72 and debt down ≈$37M.", "Industry: average 30 (max 40); we're at 30."], plain: "How many units of each everyday product we keep in stock.", rule: "If days of inventory rise above 75 → trim 2–3.", conf: "High", status: "Cut 50 → 30 in R1", effect: "Inventory & debt: −20 freed ≈$37M of debt (days 90 → 72). Revenue still grew.", longTerm: "Hold 30", why: "Cash win already banked; customers now value depth more (0.89 → 1.03), so don't cut further." },
    depthHigh: { build: ["now", "Instant", "Changes inventory (and debt) this round."], what: "Depth (premium) = units of each premium product we keep in stock.", up: "Same as everyday depth: more sales a little, but more cash tied up in stock.", down: "Same as everyday depth: frees cash, risks stock-outs.", data: ["Industry: average 20; we're at 30 (above average)."], plain: "How many units of each premium product we keep in stock.", rule: "Same as lower-cost depth.", conf: "High", status: "Cut 50 → 30 in R1", effect: "Same as lower-cost depth; we're above the industry average (20).", longTerm: "Hold 30", why: "Same reason." },
    stores: { build: ["asset", "Long-lasting", "Each store is a $1.75M asset that lasts for years; opening or closing is hard to reverse."], what: "Retail coverage = how many stores we run.", up: "More stores → reach more store shoppers (S2, S4, S6) → a bit more revenue → but each store costs ≈$1.75M, adding debt and depreciation.", down: "Fewer stores → frees cash and cuts costs → but store shoppers lose access → some sales lost (half our sales are online, so the hit is small).", data: ["Industry: average 233 stores (0–500); we run 185.", "Scorecard: sales per store keep growing (+10.8% last round).", "Balance sheet: buildings and equipment are our biggest asset ($275M); each new store adds ≈$1.75M."], plain: "How many stores we run.", rule: "Revisit only if store shoppers (S2, S4, S6) stop growing.", conf: "Medium", status: "Cut 200 → 185 in R1", effect: "Each store = $1.75M of debt/assets. Closing 15 barely hurt revenue (sales/store +11–20%/yr).", hypothesis: "Each +5 stores ≈ +0.5% revenue but +$8.75M debt.", longTerm: "Hold 185", why: "Store shoppers (S2, S4, S6) matter, but new stores are a value trap per the slides." }
  },


  // ---- "Ask" assistant: answers to general questions (local, no outside AI). keys = words that trigger the answer ----
  faq: [
    { keys: ["analytics score", "vendor score", "100%", "score mean"], conf: "Low", a: "The Analytics and Vendor Management scores started at <b>100% in Round 0</b> and crept up to 100.5% and 100.4%, even while we <b>cut</b> spending ($10M → $6M and $30M → $20M). So 100% is a starting baseline, not 'maxed out'. It looks like a slowly building capability that doesn't drop right away when we spend less. The effect is tiny, so don't chase the score.", rec: "Hold analytics at $5–6M; cut it only in the final round." },
    { keys: ["debt", "pay down", "repay", "loan", "interest"], conf: "Medium", a: "There's no 'repay debt' box. Debt falls by the cash we generate each round (≈$45–55M), so we'll be debt-free around Round 7. Each $10M less debt ≈ +$0.5M profit ≈ +$7M value.", rec: "Speed it up only by leaving budget unspent and keeping depth at 30. Don't close stores or cut depth just to repay debt." },
    { keys: ["p/e", "pe ", "market value", "valuation", "how is value", "wacc"], conf: "High", a: "In every round so far, <b>market value = P/E × net income</b> (e.g. 15.2 × $50.7M ≈ $772M). P/E has slipped 16.6 → 15.2 as WACC rose; leading two quadrants seems to add ≈10% to P/E per point of Brand + Experience.", rec: "Grow profit (keep spending flat) and hold two clear leads to protect P/E." },
    { keys: ["more budget", "bigger budget", "budget grow", "budget increase", "get more budget", "budget if we make"], conf: "Medium", a: "Not in practice. The slide says budget = max(14% of last revenue, last budget + inflation), but our revenue is up 64% since Round 0 while our budget is up only 11% ($69.8M → $77.48M). It even dipped in Round 4. By the 14% rule this round would be ≈$85.5M. So the budget seems to grow with inflation (≈2–4.5% a year), not with our sales.", rec: "It doesn't matter much: the budget isn't what limits us, profit is. Check next round: ≈$95M means the 14% rule is real; ≈$80–81M means inflation only." },
    { keys: ["budget", "spend all", "unspent", "spend the whole", "invest fully"], conf: "Medium", a: "Only the final market value decides the winner. Shopping experience and online are partly capitalized, so the positions they build keep growing and mostly stay after we cut. So: invest the full budget in those through Round 7, then cut hard in the final round. Padding service, vendor or analytics is pure cost (≈ −$7–13M of value per $1.5M).", rec: "Rounds 5–7: full budget, extra into shopping experience then online. Final round: cut vendor, online, analytics." },
    { keys: ["why cut online", "cut online", "online sales", "half our sales"], conf: "Medium", a: "About half our sales are online (49.3%), but our online <b>spending</b> hasn't driven them: we raised it $2M → $12.5M and the online share actually slipped 51.3% → 49.3%. Online shoppers buy online regardless. Still, cutting saves little (only 40% of online spend is expensed, ≈$0.8M per $2M) and S1/S4, two growing segments, shop online.", rec: "Hold online at $12.5M. Trim it only in the final round." },
    { keys: ["segment", "target", "customer group", "who do we"], conf: "Medium", a: "Target <b>S5 Experience Seekers, S2 Breadth Shoppers and S4 Omni Mix</b> (the professor's '2, 4, 5 = in-store experience'), grow S6 Store Bargain, defend S3 Brand Lovers, and skip S1 Online Bargain (Cadabra's turf). Growth is in S4 (+17%), S6 (+14%), S1 (+13%).", rec: "Spend on shopping experience and breadth; keep 185 stores; hold online steady (don't chase it, don't cut it)." },
    { keys: ["1.5", "beat", "better than", "end value", "final value", "how high"], conf: "Medium", a: "On the current path we reach ≈$1.5B by Round 8 (profit ≈$106M × P/E ≈14). Realistic upside ≈$1.7–1.9B: hold two clear leads (stops the P/E slide), make breadth work (+2–3% revenue), and cut vendor/online/analytics hard in the final round.", rec: "Take Experience #1 now, run the breadth test, plan the final-round cuts." },
    { keys: ["fair value", "frictionless gap", "frictionless"], conf: "Medium", a: "Fair value = 75% of the leader. We pass in Low Price (4.8 vs 4.1) but not Frictionless (3.9 vs 5.5). Closing it would cost ≈$15M a year ≈ −$150M of value, and our target customers care least about online.", rec: "Accept the small Frictionless gap; nudge it with service, not online." },
    { keys: ["win", "strategy", "thesis", "plan", "how do we"], conf: "Medium", a: "Be the <b>premium, wide-assortment department store</b>: lead Brand and Experience, stay fair in Low Price, accept a small Frictionless gap, and keep spending flat so profit (and value) grows.", rec: "This round: shopping experience → $20.5M, service → $17M, lower-cost breadth → 55; hold online at $12.5M." },
    { keys: ["final round", "last round", "endgame", "round 8"], conf: "Medium", a: "In the final round, effects that build up slowly (vendor cost savings) can't come back to hurt us. Cutting vendor to ≈$15M and online/analytics to minimum boosts final-year profit, which sets final value.", rec: "Keep service + shopping experience so both leads hold; cut the rest." },
    { keys: ["beat zephara", "differentiate", "zephara catching", "zephara following", "against zephara", "vs zephara"], conf: "Medium", a: "Don't out-spend Zephara on Experience: service is saturating and it keeps matching us. Stay within 5% of it in Experience (that counts as 'close to the leader'), make <b>Brand</b> our clear lead (its Brand fell 4 rounds in a row), and own <b>wide and premium</b>: our premium range is #1 (position 4.0 vs 1.6) and growing +14%, while Zephara barely sells premium (1.4% share).", rec: "This round: shopping experience $20.5M, breadth 55, quality 6 (→ 7 if Brand gets within 0.3)." },
    { keys: ["zephara", "competitor", "rival", "bestco", "cadabra"], conf: "High", a: "Zephara leads Experience (6.5 vs our 6.4) with the best service position; its Brand is falling (4.6). BestCo's Brand is rising (4.4). Cadabra owns Frictionless (7.3) but is sliding.", rec: "Watch Zephara Experience > 6.6 and BestCo Brand > 4.8 every round." }
  ],

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
      id: "A", name: "Win Experience back with service", badge: "Recommended", segs: [5, 3],
      tag: "Service $24M (rivals keep raising theirs), experience $21.51M, online $16M, higher-cost depth back to 30 · $85.51M of $85.52M",
      levers: { vendor: 18, online: 16, experience: 21.51, service: 24, analytics: 6, breadthLow: 55, breadthHigh: 50, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, pbLow: 60, pbHigh: 60 },
      why: [
        "<b>Experience 6.3 → ≈7.0</b> vs Zephara 6.5: Round 5 showed our service position slips whenever rivals out-raise us (2.7 → 2.5 at flat $18M). $24M puts service just above the industry max ($22.4M).",
        "<b>Brand 4.9 → ≈5.05</b>: higher-cost depth back to 30 undoes the Round 5 cut that cost Brand 0.2 (depth position 3.4 → 3.1).",
        "<b>Full budget on what builds or holds position</b>: experience and online keep building (capitalized); only the final market value counts, and idle cash already piles up ($49M)."
      ],
      risks: ["Service must stay high every round (it doesn't build). Zephara may also raise service. Medium confidence on the size (±0.2)."]
    },
    {
      id: "B", name: "Service fix, hold the rest", badge: "Lean", segs: [5, 3],
      tag: "Service $24M, higher-cost depth 30; experience $20M and online $14.5M held · $82.5M",
      levers: { vendor: 18, online: 14.5, experience: 20, service: 24, analytics: 6, breadthLow: 55, breadthHigh: 50, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 30, pbLow: 60, pbHigh: 60 },
      why: ["Highest value this round (≈$1.34B) because less is expensed, but it builds less shopping-experience and online position for Rounds 7–8."],
      risks: ["$3M unspent; Experience ≈6.94 (still #1)."]
    },
    {
      id: "S", name: "What we submitted (Round 6)", badge: "Submitted", segs: [5, 3],
      tag: "Entered on the Round 6 screen · $85.50M of $85.52M ($0.02M left)",
      levers: { vendor: 18, online: 16, experience: 21.5, service: 24, analytics: 6, breadthLow: 55, breadthHigh: 50, depthLow: 30, depthHigh: 30, markupLow: 54, markupHigh: 66, pbQuality: 7, nbQuality: 7, pbLow: 60, pbHigh: 60, stores: 185 },
      why: ["Plan A + quality 7/7. Model projection on file: <b>MV ≈ $1,354M</b>, net income ≈ $77.4M, revenue ≈ $763M; <b>Brand ≈5.45, Experience ≈7.02 (lead)</b>, Low Price 4.8, Frictionless ≈4.58."],
      risks: ["Service +33% and quality 7 are the big moves (Medium / High). Zephara may also raise service. Compare when Round 6 results arrive."]
    },
    {
      id: "C", name: "Change nothing", badge: "Safe", segs: [5, 3],
      tag: "Repeat Round 5 · $76.5M",
      levers: { vendor: 18, online: 14.5, experience: 20, service: 18, analytics: 6, breadthLow: 55, breadthHigh: 50, markupLow: 54, markupHigh: 66, pbQuality: 6, nbQuality: 6, stores: 185, depthLow: 30, depthHigh: 28, pbLow: 60, pbHigh: 60 },
      why: ["Profit still grows with revenue (≈$1.22B), but Experience slips to ≈6.15: below 95% of Zephara, so we'd lead only one quadrant."],
      risks: ["Loses the Experience near-lead; Brand stays 4.9 with BestCo rising."]
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
    },
    {
      round: 4, label: "Round 5 status (after R4 submit)",
      kpi: { marketValue: 772.4, mvChange: 44.7, revenue: 610.8, ebit: 91.7, interest: 13.7, netIncome: 50.7,
             debt: 166.7, equity: 208.5, currentRatio: 1.63, roic: 24.8, wacc: 11.6, onlineSales: 49.3,
             grossMargin: 36.4, daysInventory: 72, budget: 74.2, clv: 1349.1 },
      matrix: { getchells: [5.1, 6.4, 4.8, 3.9], leader: [5.1, 6.5, 5.5, 7.3], fair: [3.4, 4.3, 3.7, 4.8] },
      revenue: { "PriceMart": 960.9, "BestCo": 700.9, "Getchells": 610.8, "Cadabra": 561.3, "Zephara": 476.4, "AIM": 399.1, "KT Benny": 388.0 },
      // Market $4.10B (+9.2%); we grew +11.2%
      share: {
        "PriceMart": [11.7, 11.7], "BestCo": [10.6, 6.5], "Cadabra": [9.3, 4.4], "Getchells": [10.7, 4.2],
        "Zephara": [10.3, 1.4], "AIM": [7.7, 2.1], "KT Benny": [8.9, 0.6]
      },
      // Our cost +3.9% vs rivals +3.7% avg: gap vs rivals' average now +1.8% (was +1.5%) after vendor cut to $20M
      unitCost: { "BestCo": [137.22, 279.62], "Zephara": [137.35, 274.70], "PriceMart": [141.03, 282.07], "Cadabra": [142.78, 287.43], "AIM": [143.54, 288.80], "Getchells": [144.09, 288.19], "KT Benny": [147.67, 295.34] },
      industry: [
        { name: "Markup · lower-cost", ours: 54, avg: 50.62, min: 26.8, max: 75.98, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 55.88, min: 26.8, max: 85.77, unit: "%" },
        { name: "Breadth · lower-cost", ours: 50, avg: 42, min: 25, max: 75, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost", ours: 30, avg: 30, min: 21, max: 40, unit: "" },
        { name: "Depth · higher-cost", ours: 30, avg: 20, min: 7, max: 32, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 50, min: 2, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 43, min: 2, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 233, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 12.5, avg: 14.99, min: 8.65, max: 26.09, unit: "$M" },
        { name: "Customer service", ours: 18, avg: 14.13, min: 6.49, max: 20.41, unit: "$M" },
        { name: "Shopping experience", ours: 17.5, avg: 10.96, min: 0, max: 17.5, unit: "$M" },
        { name: "Vendor management", ours: 20, avg: 37.42, min: 16.69, max: 72.75, unit: "$M" },
        { name: "Customer analytics", ours: 6, avg: 7.39, min: 3.34, max: 13.35, unit: "$M" }
      ],
      headline: "Round 5 status: MV +44.7% to $772M. <span class=\"hl\">Beat forecast by $55M; debt −$46M.</span>",
      moves: [
        "<b>Net income $50.7M</b> (forecast $47.2M): interest fell $20.5M → $13.7M as debt dropped to $167M and our rate fell 9.0% → 7.2%.",
        "<b>Experience 6.4, 0.1 behind Zephara (6.5)</b>: we're at 98% of the leader = 'close to leader' per the professor.",
        "<b>Brand #1 by 0.5</b>; Frictionless 3.9 vs fair 4.8 (gap shrinking). Vendor $20M: watch unit costs."
      ]
    },
    {
      round: 5, label: "Round 6 status (after R5 submit)",
      kpi: { marketValue: 1024.2, mvChange: 32.6, revenue: 677.4, ebit: 109.3, interest: 6.7, netIncome: 66.6,
             debt: 116.7, equity: 275.1, currentRatio: 4.01, roic: 27.9, wacc: 10.9, onlineSales: 48.7,
             grossMargin: 36.4, daysInventory: 74, budget: 85.5, clv: 1523.3 },
      matrix: { getchells: [4.9, 6.3, 4.8, 3.8], leader: [4.9, 6.5, 5.5, 7.1], fair: [3.3, 4.4, 3.7, 4.8] },
      revenue: { "PriceMart": 1038.3, "BestCo": 766.5, "Getchells": 677.4, "Cadabra": 604.4, "Zephara": 512.4, "AIM": 436.7, "KT Benny": 418.9 },
      // Market $4.46B (+8.7%); we grew +10.9% (fastest); Zephara slowest (+6.8%)
      share: {
        "PriceMart": [11.6, 11.7], "BestCo": [10.6, 6.6], "Cadabra": [9.2, 4.3], "Getchells": [10.9, 4.3],
        "Zephara": [10.2, 1.3], "AIM": [7.7, 2.1], "KT Benny": [8.9, 0.5]
      },
      // Our lower-cost unit cost $149.47 vs rivals' avg $146.53: gap +2.0% (was +1.8%) after vendor cut to $18M
      unitCost: { "BestCo": [141.68, 289.09], "Zephara": [142.25, 284.50], "PriceMart": [145.85, 291.70], "Cadabra": [147.70, 297.46], "AIM": [148.50, 298.90], "Getchells": [149.47, 298.95], "KT Benny": [153.22, 306.45] },
      industry: [
        { name: "Markup · lower-cost", ours: 54, avg: 51.66, min: 27.07, max: 79.78, unit: "%" },
        { name: "Markup · higher-cost", ours: 66, avg: 56.95, min: 27.07, max: 86.63, unit: "%" },
        { name: "Breadth · lower-cost", ours: 55, avg: 43, min: 25, max: 74, unit: "" },
        { name: "Breadth · higher-cost", ours: 50, avg: 30, min: 6, max: 50, unit: "" },
        { name: "Depth · lower-cost", ours: 30, avg: 31, min: 22, max: 43, unit: "" },
        { name: "Depth · higher-cost", ours: 28, avg: 20, min: 7, max: 32, unit: "" },
        { name: "Private brand · lower", ours: 60, avg: 51, min: 2, max: 100, unit: "%" },
        { name: "Private brand · higher", ours: 60, avg: 44, min: 2, max: 100, unit: "%" },
        { name: "Private brand quality", ours: 6, avg: 5, min: 4, max: 7, unit: "" },
        { name: "National brand quality", ours: 6, avg: 5, min: 3, max: 7, unit: "" },
        { name: "Stores", ours: 185, avg: 233, min: 0, max: 500, unit: "" },
        { name: "Online", ours: 14.5, avg: 16.40, min: 9.44, max: 28.47, unit: "$M" },
        { name: "Customer service", ours: 18, avg: 15.18, min: 7.07, max: 22.45, unit: "$M" },
        { name: "Shopping experience", ours: 20, avg: 11.81, min: 0, max: 20, unit: "$M" },
        { name: "Vendor management", ours: 18, avg: 38.79, min: 17.84, max: 76.26, unit: "$M" },
        { name: "Customer analytics", ours: 6, avg: 7.75, min: 3.57, max: 14.27, unit: "$M" }
      ],
      headline: "Round 6 status: MV +32.6% to $1.02B. <span class=\"hl\">Beat forecast by $72M, but Brand and Experience slipped.</span>",
      moves: [
        "<b>Net income $66.6M</b> (forecast $63.2M): interest halved ($13.7M → $6.7M) as short-term loans hit $0, and P/E rose 15.2 → 15.4.",
        "<b>Experience 6.4 → 6.3</b>, 0.2 behind Zephara: rivals raised service 7%, so our flat $18M slipped (service position 2.7 → 2.5).",
        "<b>Brand 5.1 → 4.9</b> (still #1, BestCo 4.5 ↑): cutting higher-cost depth 30 → 28 cost Brand. Budget is now <b>$85.5M</b>."
      ]
    }
  ]
};

// ---- Round 6 status updates (CSV Round-5): lever knowledge refreshed from the position audit ----
(function (S) {
  const L = S.leverInfo;
  Object.assign(L.service, {
    build: ["no", "Doesn't build up", "100% expensed and scored RELATIVE to rivals every round: rivals raise service ≈7%/round, so flat spend loses ground (R5: position 2.7 → 2.5 at $18M)."],
    up: "More service than rivals → our service position rises (≈2.15 × our spend ÷ industry average) → BOTH Experience and Frictionless rise → full cost hits profit this year.",
    down: "Less service, or flat while rivals raise theirs → service position slips → Experience and Frictionless both fall (R5: −0.2 each).",
    data: ["Industry R5: average $15.2M, max $22.4M; we're at $18M (1.19× average).", "Our service position 3.4 → 2.7 → 2.5 as rivals caught up; Zephara 3.4 is best."],
    conf: "Medium", status: "R5 lesson: flat service cost us 0.2 Experience", effect: "+$2M ≈ +0.26 service position ≈ +0.26 Experience and Frictionless (at today's industry average).",
    rule: "Keep service above rivals' average × 1.4 every round, including the final round." });
  Object.assign(L.depthHigh, {
    what: "Depth (premium) = units of each premium product we keep in stock.",
    up: "Fuller premium shelves → our premium depth position rises → <b>Brand rises</b> (R1 and R5 both showed it) → a bit more inventory.",
    down: "Thinner premium shelves → depth position falls → Brand falls (R5: 30 → 28 cost Brand 0.2) → frees a little inventory.",
    data: ["R5: 30 → 28 moved our depth position 3.4 → 3.1 and Brand 5.1 → 4.9.", "Industry average 20, max 32; we're at 28."],
    conf: "Medium", status: "Cut 30 → 28 in R5 (Brand −0.2)", effect: "≈ +0.075 Brand per point; inventory +≈1% per point.",
    rule: "Keep at 30 or above; it's our cheapest Brand lever." });
  Object.assign(L.online, { data: ["Industry R5: average $16.4M, max $28.5M; we're at $14.5M (0.88× average).", "Online position 1.1 → 1.3 (builds ≈+0.2/round); online share of our sales still drifting down (48.7%)."] });
  Object.assign(L.experience, { data: ["Industry R5: average $11.8M, max $20M (us); our position 3.6 → 3.8, #1.", "Position builds ≈25% of the way to 2.5 × (our spend ÷ industry average) each round."] });
  Object.assign(L.vendor, { data: ["Industry R5: average $38.8M; we're the lowest at $18M.", "Our unit cost is now 2.0% above rivals' average (was 0.3% in R0); Low Price still 4.8."] });
  Object.assign(L.breadthLow, { data: ["R5 test (50 → 55): breadth position 2.4 → 2.7; lower-cost sales +10.4% (vs +10.0%); inventory days 72 → 74.", "Industry average 43, max 74."], status: "Tested 55 in R5: tiny revenue gain" });
  Object.assign(L.online, { build: ["up", "Builds up", "60% is capitalized, so our online position keeps growing (0 → 1.3) and mostly stays if we cut later."],
    rule: "Online share of our sales is 48.7% and slipping: keep building the position (≈+$1.5M a round).", longTerm: "Raise to ≈$16M, cut only in the final round", status: "Raised every round; position 1.3" });
  Object.assign(L.experience, { build: ["up", "Builds up", "20% is capitalized, so our position keeps growing (2.4 → 3.8, #1) and mostly stays if we cut later."],
    rule: "We're already the industry's top spender ($20M); add ≈$1.5M a round while the budget grows.", longTerm: "Raise to ≈$21.5M, hold in the final round", status: "Raised R1, R3, R4, R5" });
  Object.assign(L.service, { longTerm: "Raise to ≈$24M and keep it there", why: "It's scored against rivals, who add ≈7% a round; it's also the only lever that lifts Experience AND Frictionless at once." });
  Object.assign(L.depthHigh, { longTerm: "Back to 30 (or 32 to test)", why: "Premium depth moves Brand; it costs inventory, not budget." });
  const faq = (k, o) => { const f = S.faq.find(x => x.keys.includes(k)); if (f) Object.assign(f, o); };
  faq("more budget", { conf: "High", a: "Yes, with a lag. The Round 6 budget is <b>$85.52M = 14% of Round 4 revenue</b> ($610.8M). So budget follows revenue from two results back: next round should be ≈14% × $677.4M = <b>$94.8M</b>.", rec: "Plan to spend it on levers that build or hold position; growing revenue keeps growing the budget." });
  faq("debt", { conf: "High", a: "Short-term loans hit <b>$0</b> in Round 5. What's left is $116.7M of long-term debt, which only runs off ≈$2.8M a round, so extra profit now builds up as <b>cash ($49M → ≈$110M next round)</b>. Interest fell to $6.7M.", rec: "Nothing to repay. Idle cash earns nothing, which is another reason to spend the full budget on levers that build." });
  faq("1.5", { a: "We're already at <b>$1.02B</b>. Plan A projects ≈$1.33B after this round (Medium, ±8%); two more rounds of ≈10% profit growth plus a final-round cut could reach ≈$1.8–2.0B.", rec: "Hold two leads (Brand + Experience), keep service ahead of rivals, cut hard only in the final round." });
  faq("zephara", { a: "Zephara leads Experience (6.5 vs our 6.3) with the best service position (3.4 vs our 2.5) but is the slowest grower (+6.8%). BestCo's Brand is rising (4.5, 0.4 behind our 4.9). KT Benny's Experience keeps rising (4.7)." });
  S.impacts[0] = { lever: "Customer service", by: "+$1M", effect: "Service position ≈ +0.13 → Experience and Frictionless ≈ +0.13 each (relative to rivals' $16.3M average next round); profit −$1.0M", conf: "Medium", evidence: "Positions R0–R5 track 2.15 × our spend ÷ industry average" };
  S.impacts[1] = { lever: "Shopping experience", by: "+$1M", effect: "Experience ≈ +0.05 this round, more over later rounds (position builds 25% of the gap per round); 80% expensed", conf: "Medium", evidence: "Position 2.4 → 3.8 over R0–R5" };
  S.impacts[2] = { lever: "Online investment", by: "+$1M", effect: "Frictionless ≈ +0.03 this round, building later; 40% expensed", conf: "Medium", evidence: "Online position 0 → 1.3 over R0–R5" };
})(window.SIM);
