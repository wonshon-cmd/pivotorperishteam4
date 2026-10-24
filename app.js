// Getchells Strategy Copilot — app logic (no build step, no modules)
(function () {
  const S = window.SIM;
  const Q = S.quadrants;
  const STORE_KEY = "getchells-copilot";

  // ---------- Saved data (Data panel) ----------
  function loadSaved() {
    if (!S.history) S.history = (S.rounds || []).map(r => ({ round: r.round, marketValue: r.kpi.marketValue, revenue: r.kpi.revenue, wacc: r.kpi.wacc }));
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      // Ignore browser-saved edits made against an older data release
      if (!saved || saved.dataVersion !== S.dataVersion) { localStorage.removeItem(STORE_KEY); return; }
      Object.assign(S.base, saved.base || {});
      Object.assign(S.defaults, saved.defaults || {});
      if (saved.rivals) S.rivals = saved.rivals;
      if (saved.history) S.history = saved.history;
      if (saved.round) S.round = saved.round;
      if (saved.team) state.team = saved.team;
    } catch (e) { /* ignore bad saves */ }
  }
  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      base: S.base, defaults: S.defaults, rivals: S.rivals,
      history: S.history, round: S.round, team: state.team, dataVersion: S.dataVersion
    }));
  }

  // ---------- Levers ----------
  const LEVERS = [
    { key: "vendor",      label: "Vendor management", unit: "$M", min: 0,  max: 80,  step: 1,   q: "Low Price",    group: "Invest" },
    { key: "online",      label: "Online",            unit: "$M", min: 0,  max: 40,  step: 0.5, q: "Frictionless", group: "Invest" },
    { key: "experience",  label: "Shopping experience", unit: "$M", min: 0, max: 45, step: 0.5, q: "Experience",   group: "Invest" },
    { key: "service",     label: "Customer service",  unit: "$M", min: 0,  max: 45,  step: 0.5, q: "Frict. / Exp.", group: "Invest" },
    { key: "analytics",   label: "Customer analytics", unit: "$M", min: 0, max: 20,  step: 0.5, q: "Multiplier",   group: "Invest" },
    { key: "markupLow",   label: "Markup · lower-cost",  unit: "%", min: 20, max: 90, step: 1,   q: "Low Price",    group: "Price" },
    { key: "markupHigh",  label: "Markup · higher-cost", unit: "%", min: 20, max: 100, step: 1,  q: "Low Price",    group: "Price" },
    { key: "pbQuality",   label: "Private brand quality",  unit: "", min: 1, max: 10, step: 1,  q: "Brand",        group: "Brand" },
    { key: "nbQuality",   label: "National brand quality", unit: "", min: 1, max: 10, step: 1,  q: "Brand",        group: "Brand" },
    { key: "pbLow",       label: "Private brand · lower-cost",  unit: "%", min: 0, max: 100, step: 1, q: "Brand / cost", group: "Brand" },
    { key: "pbHigh",      label: "Private brand · higher-cost", unit: "%", min: 0, max: 100, step: 1, q: "Brand / cost", group: "Brand" },
    { key: "breadthLow",  label: "Breadth · lower-cost",  unit: "", min: 5, max: 80, step: 1, q: "Revenue",  group: "Assortment" },
    { key: "breadthHigh", label: "Breadth · higher-cost", unit: "", min: 5, max: 80, step: 1, q: "Revenue",  group: "Assortment" },
    { key: "depthLow",    label: "Depth · lower-cost",    unit: "", min: 5, max: 60, step: 1, q: "Cash",     group: "Assortment" },
    { key: "depthHigh",   label: "Depth · higher-cost",   unit: "", min: 5, max: 60, step: 1, q: "Cash",     group: "Assortment" },
    { key: "stores",      label: "Stores",            unit: "",   min: 120, max: 320, step: 5,  q: "Debt",         group: "Stores" }
  ];


  // ---------- Model ----------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const sq = (x, ref) => Math.sqrt(Math.max(x, 0) / ref) - 1;
  // Lower-cost products = 74% of our revenue (R2 income statement: $361.4M of $488.7M)
  const WL = 0.74;
  const mix = (d, k) => WL * (d[k + "Low"] ?? 50) + (1 - WL) * (d[k + "High"] ?? 50);

  function rivalLeaders() {
    const lead = [0, 0, 0, 0], who = ["", "", "", ""];
    Object.entries(S.rivals).forEach(([name, sc]) => {
      if (name === S.company) return;
      sc.forEach((v, i) => { if (v > lead[i]) { lead[i] = v; who[i] = name; } });
    });
    return { lead, who };
  }

  function scores(d) {
    const b = S.rivals[S.company], d0 = S.defaults, P = S.posNow || {}, A = S.indAvgNext || {}, A0 = S.indAvgNow || {};
    // v8 (refit on R0–R5): quadrant moves = moves in the game's product positions (audit R0–R5)
    // Brand: quality (+0.2/step each, R1 A/B) + higher-cost DEPTH (R0→R1 depth 50→30 and R5 30→28 both moved Brand ≈ with the depth position: 0.075/pt)
    // v9 (R6): quality 6 → 7 moved our private-brand positions +0.3 and Brand ≈ +0.25 (less than 5 → 6 did: diminishing);
    // depth 28 → 30 only +0.1 position (rivals' depth rose). Brand = 0.12/quality step (each) + 0.06/pt higher-cost depth
    const brand = 0.12 * (d.pbQuality - d0.pbQuality) + 0.12 * (d.nbQuality - d0.nbQuality) + 0.06 * (d.depthHigh - d0.depthHigh);
    // Service position is RELATIVE: ≈2.15 × (our spend ÷ industry avg). Rivals raise service ≈7.5%/round, so flat spend loses ground.
    // v10: coefficient 2.2 fits R5–R7 (R7: $32.3M vs rivals' $19.6M → position 3.7)
    const svcPos = s => 2.2 * s / (A.service || 16.3), dSvc = svcPos(d.service) - 2.2 * d0.service / (A0.service || 15.2);
    // Shopping-experience and online positions BUILD toward a target set by our spend ÷ industry avg (25% of the gap per round)
    const tExp = 2.5 * d.experience / (A.experience || 12.7) - (P.exp || 3.8);
    const dExp = (tExp >= 0 ? 0.25 : (S.expDown ?? 0.25)) * tExp;   // falling speed when cut is UNTESTED (stress test: S.expDown)
    const dOnl = 0.2 * (2.2 * d.online / (A.online || 19.4) - (P.onl || 1.4));   // v9: builds 20% of the gap per round (R5 +0.2, R6 +0.1)
    const dAn = 0.03 * (d.analytics - d0.analytics);   // tiny, untested
    const lowP = 1.0 * (sq(d.vendor, 30) - sq(d0.vendor, 30)) - 0.07 * (d.markupLow - d0.markupLow) - 0.035 * (d.markupHigh - d0.markupHigh);
    const dr = S.drift || [0, 0, 0, 0];
    const delta = [brand, dExp + dSvc + dAn, lowP, dOnl + dSvc + dAn];
    return b.map((v, i) => clamp(v + delta[i] + (dr[i] || 0), 0, 10));
  }

  function demand(sc) {
    const { lead } = rivalLeaders();
    const top = sc.map((v, i) => Math.max(v, lead[i], 0.1));
    const base = S.rivals[S.company];
    const topB = base.map((v, i) => Math.max(v, lead[i], 0.1));
    let idx = 0;
    S.segments.forEach(s => {
      const a = s.weights.reduce((t, w, i) => t + w * sc[i] / top[i], 0);
      const a0 = s.weights.reduce((t, w, i) => t + w * base[i] / topB[i], 0);
      idx += s.clvShare * (a / a0);
    });
    idx = 1 + (S.base.demandW ?? 0.2) * (idx - 1);   // v9: weight refit on R6 share gain
    const pen = arr => arr.reduce((p, v, i) => {
      const r = v / lead[i];
      const fr = S.fairRatio || 0.75;
      return r < fr ? p * (1 - 0.12 * (fr - r)) : p;
    }, 1);
    return idx * pen(sc) / pen(base);
  }

  function classify(sc) {
    const { lead, who } = rivalLeaders();
    return sc.map((v, i) => {
      const r = v / lead[i];
      const fr = S.fairRatio || 0.75;
      const status = r >= 0.95 ? "LEAD" : r >= fr ? "FAIR" : "GAP";
      return { q: Q[i], score: v, leader: lead[i], leaderName: who[i], ratio: r, fair: (S.fairRatio || 0.75) * lead[i], status };
    });
  }

  function run(d, scale) {
    const B = S.base, D0 = S.defaults;
    const sc = scores(d);
    const cls = classify(sc);
    const leads = cls.filter(c => c.status === "LEAD").length;
    const gaps = cls.filter(c => c.status === "GAP").length;

    const m0 = WL * D0.markupLow / 100 + (1 - WL) * D0.markupHigh / 100;
    const mB = WL * d.markupLow / 100 + (1 - WL) * d.markupHigh / 100;
    const dIdx = demand(sc);
    const vol = dIdx * Math.pow((1 + m0) / (1 + mB), 3.2) * Math.pow(d.stores / D0.stores, 0.1) * Math.pow(mix(d, "depth") / mix(D0, "depth"), 0.02)
      * Math.pow(mix(d, "breadth") / mix(D0, "breadth"), 0.05); // v9: R5 test (lower breadth 50 → 55) lifted lower-cost growth only ≈+0.4 pt → small elasticity
    const revenue = B.revenue * vol * (1 + mB) / (1 + m0) * (1 + (S.base.growth || 0) * (S.noGrowth ? 0 : 1));

    // Gross margin held 36.2–36.3% in R0–R2 despite quality 5→6 and vendor 30→25: cost effects are small
    const costIdx = (dd) => 1 - 0.03 * sq(dd.vendor, 30) + 0.003 * (dd.pbQuality - 5) + 0.003 * (dd.nbQuality - 5) - 0.0004 * (mix(dd, "pb") - 50);  // R6: quality 7 lifted unit cost ≈+2% vs rivals but margin held (markup is on cost)
    const k = (B.cogs / B.revenue) * (1 + m0) / costIdx(D0);
    const cogs = revenue / (1 + mB) * costIdx(d) * k;
    const gross = revenue - cogs;

    const newStores = d.stores - D0.stores;
    // Opening: $1.75M each, fixed 60/40 debt/cash split. Closing: recovers remaining store value → retires debt.
    const ppePerStore = B.netPPE / D0.stores;
    const openCapex = Math.max(0, newStores) * 1.75;
    const closeRecover = Math.max(0, -newStores) * ppePerStore;
    const onlineCap = 0.6 * Math.max(0, d.online - D0.online) + 0.2 * Math.max(0, d.experience - D0.experience);
    const capex = openCapex + onlineCap - closeRecover;

    // Inventory scales with depth and (more weakly) breadth, relative to last round's inputs
    const inventory = B.inventory * (mix(d, "depth") / mix(D0, "depth")) * Math.pow(mix(d, "breadth") / mix(D0, "breadth"), 0.5) * (revenue / B.revenue);
    const invFreed = B.inventory - inventory;

    // Depreciation grew ~5%/yr with flat inputs (R0 26.9 → R1 27.3 with 15 closures → R2 29.9)
    const depreciation = B.depreciation * 1.06 * Math.pow(d.stores / D0.stores, 0.3) + onlineCap * 0.2;
    // Exact game accounting (R0–R2 income statements): other SGA = 5.0% of revenue; service expense = input + 0.5% of revenue;
    // shopping experience 80% expensed (20% capitalized); online 40% expensed (60% capitalized)
    const otherSGA = 0.05 * revenue;
    const opex = 0.4 * d.online + d.service + 0.005 * revenue + 0.8 * d.experience + d.vendor + d.analytics + depreciation + otherSGA;
    const ebit = gross - opex;

    // Debt falls by the free cash flow (exact R2–R4): NI + depreciation − capex − working capital. Inventory growth is in invFreed;
    // the rest nets to ≈ NI + 2.5 (dep exceeds capex by ~$6M; receivables + cash − payables ≈ $3.5M)
    const retained = (ebit - B.interest * 0.85) * 0.65 + 2.5;
    // v8: short-term loans hit $0 in R5; long-term debt only runs off ≈$2.8M/round, so extra free cash flow now piles up as CASH
    const ltNow = B.debt - (B.stLoans ?? 0), ltNext = Math.max(0, ltNow - 4.5);   // R6: LT debt 116.7 → 112.0
    const debtRaw = B.debt + 0.6 * (openCapex + onlineCap) - closeRecover - invFreed - retained;
    const debt = Math.max(ltNext, debtRaw);
    const cash = B.cash - 0.4 * (openCapex + onlineCap) + Math.max(0, ltNext - debtRaw);
    const stLoans = Math.max(0, debt - ltNext);
    const DE = debt / B.equity, DE0 = B.debt / B.equity;

    // Credit rating 0–9 from the professor's three ratios
    const ratingOf = (cr, cov, de) => clamp(Math.round(
      3 * clamp((cr - 0.5) / 1.5, 0, 1) + 3 * clamp((cov - 0.5) / 5.5, 0, 1) + 3 * clamp((3.5 - de) / 3, 0, 1)), 0, 9);
    const avgDebt0 = (B.debt + (B.debtPrev || B.debt)) / 2;
    const rate0 = B.interest / avgDebt0 * 100; // interest ≈ 9.5% of average debt in R1 and R2
    const ebit0 = S.base.ebit0 || ebit;
    const cr0 = (B.cash + B.receivables + B.inventory) / (B.ap + (B.stLoans ?? 158.4));
    const rating0 = ratingOf(cr0, ebit0 / B.interest, DE0);
    let rate = rate0, interest = debt * rate / 100, rating = rating0, cr = cr0, cov = 0;
    for (let k = 0; k < 3; k++) {
      cov = ebit / Math.max(interest, 0.1);
      cr = (cash + B.receivables + inventory) / (B.ap + stLoans);
      rating = ratingOf(cr, cov, DE);
      rate = clamp(rate0 - 0.3 * (rating - rating0) + 2 * (DE - DE0) / DE0, 3.5, 18);
      interest = (B.debt + debt) / 2 * rate / 100;
    }
    const sp = 0; void sp;

    const fairAll = gaps === 0;
    let clarity = 0, T = 10;
    if (leads === 2 && fairAll) { clarity = -0.8; T = 6; }
    else if (leads === 2) { clarity = -0.3; T = 8; }
    else if (leads >= 3) { clarity = 0; T = 9; } // 3–4 = asset-inefficient (slides)
    else if (leads === 1 && fairAll) { clarity = -0.2; T = 9; }
    const wacc = clamp(B.wacc + 0.3 * (rate - rate0) + 0.6 * (DE - DE0) + clarity, 5, 16);

    const investedCap = B.equity + B.debt - B.cash + capex - invFreed;
    const roic = ebit / investedCap * 100;

    let g = -0.025 + 0.25 * (dIdx - 1) + (leads >= 2 && fairAll ? 0.02 : 0);
    g += 0.035 * sq(d.vendor, 30) - 0.035 * sq(D0.vendor, 30); // vendor savings compound over rounds
    if (roic < wacc) g -= 0.01;
    g = clamp(g, -0.07, 0.08);
    const gT = 0.015, w = wacc / 100;
    const fcf1 = ebit * 0.65 * 0.85;
    const fcf1n = (ebit - interest * 0) * 0.65 * 0.85; void fcf1n;
    let ev = -Math.max(capex, 0) * 0.4, f = fcf1;
    for (let t = 1; t <= T; t++) { f = fcf1 * Math.pow(1 + g, t); ev += f / Math.pow(1 + w, t); }
    ev += (f * (1 + gT) / (w - gT)) / Math.pow(1 + w, T);
    const dcfRaw = ev - debt + cash;
    // Conservative: investors credit only half of a one-round improvement; idle budget is penalized
    const unspent = Math.max(0, 0.85 * B.budget - (d.online + d.service + d.experience + d.vendor + d.analytics));
    const base0 = S.base.dcf0 == null ? dcfRaw : S.base.dcf0;
    const dcf = (base0 + 0.5 * (dcfRaw - base0)) * (scale || 1) - 0.5 * unspent;

    const clvVal = B.clv * (S.base.clvF || 0.1) * dIdx * (1 + 0.004 * (mix(d, "pb") - 50)) * (1 + 0.04 * (d.pbQuality - 5));
    const liq = cash + 0.6 * B.inventory + 0.8 * B.receivables + 0.4 * B.netPPE * d.stores / D0.stores - debt - B.ap;
    // R1 mulligan A/B: P/E 13.9 → 16.6 for +1.8 Brand+Experience ≈ +10% P/E per point (profit effect is modelled separately)
    // v9: R6 Brand + Experience +0.9 lifted P/E only ≈3% (15.4 → 15.9) → 0.035 per point (was 0.10 from the R1 mulligan)
    // v9 P/E fit on R1–R6 (max error 0.26): P/E ≈ 14.06 + 0.445 × (Brand + Experience) − 0.33 × WACC → change form below
    const dBE = (sc[0] - S.rivals[S.company][0]) + (sc[1] - S.rivals[S.company][1]);
    // 0.445 = fit on R1–R6; the R1 mulligan (a CUT) moved P/E ≈1.5 per point → peSlopeDown for stress tests
    // v10 (R1–R7 fit, max error 0.26): + 0.64 P/E while every quadrant is at or above the game's fair line (2/3 of the leader).
    // R7 was the first round Frictionless cleared it (5.1 vs 4.6) and P/E jumped 15.9 → 17.1. Cuts: 0.76 per point (B+E-only fit; R1 undo ≈1.5).
    const gameGaps = arr => { const { lead } = rivalLeaders(); return arr.filter((v, i) => v < (S.gameFairRatio || 2 / 3) * Math.max(lead[i], v) - 1e-9).length; };
    const fairTerm = (S.base.peFairBonus ?? 0.64) * ((gameGaps(S.rivals[S.company]) ? 1 : 0) - (gameGaps(sc) ? 1 : 0));
    const peNext = (S.base.pe || 15) + (S.base.peSlope ?? 0.445) * Math.max(dBE, 0) + (S.base.peSlopeDown ?? 0.76) * Math.min(dBE, 0) + fairTerm;
    const mvK = 1;
    // Fitted on R1 try 1, R1 final, R2: market value ≈ P/E × net income (all within 1%)
    const niProj = (ebit - interest) * 0.65 * (S.base.niK || 1);
    const mv = S.base.pe ? Math.max(peNext * (S.base.peDrift || 1) * Math.max(niProj, 0) * mvK, liq) : Math.max(dcf, clvVal, liq) * mvK;
    const method = S.base.pe ? "P/E × net income" : mv === dcf ? "DCF" : mv === clvVal ? "CLV / brand" : "Liquidation";

    const spend = d.online + d.service + d.experience + d.vendor + d.analytics + Math.max(0, newStores) * 1.75;

    return { pe: peNext, niProj, sc, cls, leads, gaps, revenue, gross, ebit, roic, wacc, rate, rating, debt, cash, T, g, interest, cr, cov, DE, inventory,
             dcf, clvVal, liq, mv, method, spend, dIdx, dcfRaw };
  }

    function calibrate() {
    S.base.ebit0 = null; S.base.clvF = 0.1; S.base.dcf0 = null; SCALE = 1; S.base.niK = 1;
    if (S.base.pe) {  // fit earnings so last round's inputs (no growth) reproduce last round's real net income
      S.noGrowth = true; S.base.ebit0 = run(S.defaults, 1).ebit;
      const r0 = run(S.defaults, 1); S.base.niK = S.base.netIncome / Math.max(r0.niProj, 0.1); S.noGrowth = false;
    }
    S.base.ebit0 = run(S.defaults, 1).ebit;
    S.base.dcf0 = run(S.defaults, 1).dcfRaw;
    const r = run(S.defaults, 1);
    // Whichever method sets today's value gets calibrated to the real market value
    if (r.dcfRaw >= S.base.marketValue * 0.9) { SCALE = S.base.marketValue / r.dcfRaw; }
    else { S.base.clvF = S.base.marketValue / S.base.clv; const r2 = run(S.defaults, 1); S.base.clvF *= S.base.marketValue / r2.clvVal; }
  }
  const model = d => run(d, SCALE);

  let SCALE = 1;

  // ---------- "AI": seeded search over budget mixes ----------
  function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function targetQuads(segIds) {
    const t = [0, 0, 0, 0];
    S.segments.filter(s => segIds.includes(s.id)).forEach(s => s.weights.forEach((w, i) => t[i] += w * s.clvShare));
    // Only quadrants we can realistically lead: discount by how far we are behind the leader
    const { lead } = rivalLeaders(), me = S.rivals[S.company];
    t.forEach((v, i) => t[i] = v * Math.min(1, (me[i] / Math.max(lead[i], me[i])) / 0.8));
    return t.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(x => x[1]);
  }

  function optimize(target, onProgress) {
    const rand = rng(42 + target[0] * 7 + target[1]);
    const budget = S.base.budget;
    const R = (a, b) => a + rand() * (b - a);
    const score = r => {
      const hit = target.filter(i => r.cls[i].status === "LEAD").length;
      const over = Math.max(0, r.spend - budget); // unspent budget is allowed (professor: don't feel compelled to spend it all)
      // Professor's rules: exactly 2 leads, fair value elsewhere, ROIC > WACC, healthier credit
      const extra = Math.max(0, r.leads - 2);
      return (r.mv + 0.6 * r.dcf + 4 * r.rating) * (1 + 1.0 * hit - 0.25 * r.gaps - 0.3 * extra)
        - 6 * Math.max(0, r.wacc - r.roic) - over * 50;
    };
    // Search only sensible ranges, anchored on Round 0 industry min/avg/max and the professor's rules
    const RANGE = {
      vendor: [28, 48], online: [6, 16], experience: [9, 16], service: [6, 12], analytics: [5, 9],
      markupLow: [48, 56], markupHigh: [56, 68], pbQuality: [5, 7], nbQuality: [5, 6],
      pbLow: [50, 70], pbHigh: [50, 70], stores: [S.defaults.stores - 20, S.defaults.stores],
      depthLow: [25, 35], depthHigh: [25, 35], breadthLow: [45, 55], breadthHigh: [45, 55]
    };
    const sample = () => {
      const d = {};
      Object.keys(RANGE).forEach(k => d[k] = R(RANGE[k][0], RANGE[k][1]));
      d.pbQuality = Math.round(d.pbQuality); d.nbQuality = Math.round(d.nbQuality);
      d.stores = 5 * Math.round(d.stores / 5);
      return d;
    };
    let best = Object.assign({}, S.defaults), bestR = model(best), bestS = score(bestR);
    const N = 2400;
    for (let i = 0; i < N; i++) {
      const d = sample(), r = model(d), s = score(r);
      if (s > bestS) { best = d; bestR = r; bestS = s; }
      if (onProgress && i % 400 === 0) onProgress(i, bestR.mv);
    }
    for (let i = 0; i < 2500; i++) {   // local polish
      const d = Object.assign({}, best);
      const L = LEVERS[Math.floor(rand() * LEVERS.length)], rg = RANGE[L.key];
      d[L.key] = clamp(d[L.key] + (rand() - 0.5) * (rg[1] - rg[0]) * 0.15, rg[0], rg[1]);
      const r = model(d), s = score(r);
      if (s > bestS) { best = d; bestR = r; bestS = s; }
    }
    LEVERS.forEach(L => best[L.key] = Math.round(best[L.key] / L.step) * L.step);
    return best;
  }

  // ---------- UI ----------
  const $ = s => document.querySelector(s);
  const fmtM = v => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(1) + "M";
  const state = { team: "Team 4", segs: [], d: Object.assign({}, S.defaults), shownMV: S.base.marketValue };

  function show(id) {
    document.querySelectorAll(".screen").forEach(el => el.classList.toggle("active", el.id === id));
    if (id === "team" && $("#tcCards")) renderTeamCmp();
    if (id === "writeup") { renderWriteup(); setTimeout(() => document.querySelectorAll("#wuBody textarea").forEach(wuGrow), 0); }
    if (id === "recap") { document.querySelectorAll(".rc-grow").forEach(b => { b.style.transition = "none"; b.style.width = "0"; }); requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll(".rc-grow").forEach(b => { b.style.transition = ""; b.style.width = b.dataset.w + "%"; }))); }
    const nav = { stand: "stand", rivals: "rivals", start: "start", thinking: "start", cockpit: "start", timeline: "timeline", team: "team", recap: "recap", writeup: "writeup", guide: "guide", learn: "learn" }[id];
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.go === nav));
    window.scrollTo(0, 0);
  }

  // Small line chart: rounds −2 → latest; us = accent, leader = dark, fair = dashed, others faint
  function trendChart(i) {
    if (!S.trend) return "";
    const t = S.trend[i], R = S.trendRounds, W = 520, H = 160;
    const names = Object.keys(t), last = n => t[n][t[n].length - 1];
    const all = names.flatMap(n => t[n]);
    const lo = Math.max(0, Math.min(...all) - 0.3), hi = Math.min(10, Math.max(...all) + 0.3);
    const x = k => 26 + k * (W - 170) / (R.length - 1), y = v => 12 + (hi - v) / (hi - lo) * (H - 40);
    const leader = names.filter(n => n !== "Fair value").sort((a, b) => last(b) - last(a))[0];
    const kind = n => n === S.company ? "tme" : n === leader ? "tld" : n === "Fair value" ? "tfr" : "tot";
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="trend">`;
    R.forEach((r, k) => svg += `<text x="${x(k)}" y="${H - 4}" class="tx">R${r}</text>`);
    names.sort((a, b) => (a === S.company) - (b === S.company)).forEach(n =>
      svg += `<polyline points="${t[n].map((v, k) => x(k) + "," + y(v)).join(" ")}" class="${kind(n)}"/>`);
    // Labels for us, leader, fair value, spaced so they never overlap
    const labs = names.filter(n => kind(n) !== "tot").map(n => ({ n, y: y(last(n)) })).sort((a, b) => a.y - b.y);
    labs.forEach((l, k) => { if (k && l.y - labs[k - 1].y < 16) l.y = labs[k - 1].y + 16; });
    labs.forEach(l => svg += `<text x="${x(R.length - 1) + 10}" y="${l.y + 4}" class="tl ${kind(l.n)}t">${l.n === S.company ? "Us" : l.n} ${last(l.n)}</text>`);
    return svg + "</svg>";
  }

  // ---------- Page 2: who owns each quadrant (top 3 + us) ----------
  function renderLandscape() {
    $("#landscape").innerHTML = [0, 1, 2, 3].map(i => {
      const all = Object.keys(S.rivals).map(n => ({ n, v: S.rivals[n][i] })).sort((a, b) => b.v - a.v);
      let rows = all.slice(0, 3);
      if (!rows.some(r => r.n === S.company)) rows.push(all.find(r => r.n === S.company));
      const qn = S.quadNotes ? S.quadNotes[i] : { note: "" };
      // movement vs last round (from trend history): score change + rank change
      const T = (S.trend || [])[i] || {}, prevOf = n => { const h = T[n]; return h && h.length > 1 ? h[h.length - 2] : null; };
      const prevRank = Object.keys(S.rivals).map(n => ({ n, v: prevOf(n) })).filter(x => x.v != null).sort((a, b) => b.v - a.v).map(x => x.n);
      const list = rows.map(r => {
        const pos = all.indexOf(r) + 1, why = (S.why && S.why[r.n] && S.why[r.n][i]) || "";
        const pv = prevOf(r.n), dv = pv == null ? 0 : +(r.v - pv).toFixed(2), pr = prevRank.indexOf(r.n) + 1, dr = pr ? pr - pos : 0;
        const mv = Math.abs(dv) < 0.05 ? `<span class="mvb flat" title="No change vs last round">= 0.0</span>`
          : `<span class="mvb ${dv > 0 ? "up" : "down"}" title="${dv > 0 ? "Up" : "Down"} ${Math.abs(dv).toFixed(1)} vs last round"><i>${dv > 0 ? "▲" : "▼"}</i>${dv > 0 ? "+" : "−"}${Math.abs(dv).toFixed(1)}</span>`;
        const rk = dr ? `<span class="rkb ${dr > 0 ? "up" : "down"}">${dr > 0 ? "↑" : "↓"}${Math.abs(dr)} place</span>` : "";
        return `<div class="lr ${r.n === S.company ? "me" : ""}"><span class="lpos">${pos}</span>
          <div><div class="ln">${r.n} <b>${r.v.toFixed(1)}</b> ${mv}${rk}</div><div class="lw">${why}</div></div></div>`;
      }).join("");
      return `<div class="lq"><div class="lq-name">${Q[i]}</div>${trendChart(i)}<div class="lrows">${list}</div>
        <div class="lq-note">${qn.note.replace(/(WIN|HOLD|DEFEND|FIX FIRST)/, "<b>$1</b>")}</div></div>`;
    }).join("");
  }

  function renderPositions() {
    const P = S.positions; if (!P || !$("#positions")) return;
    $("#positions").innerHTML = `<tr><th></th>${P.cols.map(c => `<th>${c}</th>`).join("")}</tr>` + P.rows.map(r => {
      const vals = r.slice(1), mx = Math.max(...vals);
      return `<tr><td>${r[0]}</td>${vals.map((v, i) => `<td style="${v === mx ? "font-weight:800;" : ""}${P.cols[i] === S.company ? "color:#2E5BFF;" : ""}">${v}</td>`).join("")}</tr>`;
    }).join("");
    $("#posNote").textContent = P.note || "";
  }

  function renderEdges() {
    renderPositions();
    $("#edges").innerHTML = (S.edges || []).map(e => `<div class="edge ${e.us ? "us" : ""}"><div class="eh"><b>${e.n}</b><span class="er">= ${e.real}</span><span class="eq">${e.q}</span></div>
      <div class="ee"><i>+</i>${e.edge}</div><div class="ew"><i>−</i>${e.weak}</div></div>`).join("");
  }

  // ---------- Page 1: where we stand (one tab per round) ----------
  let standIdx = null;
  function rankOf(i) {
    const vals = Object.keys(S.rivals).map(n => ({ n, v: S.rivals[n][i] })).sort((a, b) => b.v - a.v);
    return vals.findIndex(x => x.n === S.company) + 1;
  }
  function renderStanding() {
    const R = S.rounds || [];
    if (!R.length) return;
    if (standIdx == null) standIdx = R.length - 1;
    const tabs = [];
    for (let k = 0; k <= 8; k++) {
      const idx = R.findIndex(r => r.round === k);
      const lbl = k === 8 ? "Final" : "R" + (k + 1); // status tab: data round k = status entering game Round k+1 (team convention)
      tabs.push(idx >= 0
        ? `<button class="rtab ${idx === standIdx ? "on" : ""}" data-i="${idx}">${lbl}</button>`
        : `<span class="rtab off">${lbl}</span>`);
    }
    $("#roundTabs").innerHTML = tabs.join("");
    document.querySelectorAll(".rtab[data-i]").forEach(b => b.onclick = () => { standIdx = +b.dataset.i; renderStanding(); show("stand"); });

    const r = R[standIdx], k = r.kpi;
    const fm = v => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(1) + "M";
    $("#standHeadline").innerHTML = r.headline;
    const tile = (label, val, sub, bad) => `<div class="kt ${bad ? "bad" : ""}"><div class="kl">${label}</div><div class="kv">${val}</div><div class="ks">${sub}</div></div>`;
    $("#kpis").innerHTML = [
      tile("Market value", fm(k.marketValue), (k.mvChange >= 0 ? "▲ " : "▼ ") + Math.abs(k.mvChange) + "% last round", false),
      tile("Profit", fm(k.netIncome), k.ebit ? "interest " + fm(k.interest) + " vs operating profit " + fm(k.ebit) : "ROE " + (k.netIncome / k.equity * 100).toFixed(0) + "%", k.netIncome < 0),
      tile("Debt", fm(k.debt), (k.debt / k.equity).toFixed(1) + "× equity", k.debt / k.equity > 2),
      k.roic ? tile("ROIC vs WACC", k.roic + "% vs " + k.wacc + "%", k.roic >= k.wacc ? "creating value" : "growth destroys value", k.roic < k.wacc) : tile("Customer lifetime value", fm(k.clv), "WACC " + k.wacc + "%", false)
    ].join("");

    // Game scorecard "Financial metrics" (+ days of inventory), with the move vs the round before
    const fs = $("#finStrip");
    if (fs) {
      const f = r.fin, pr = (R[standIdx - 1] || {}).fin;
      fs.innerHTML = !f ? "" : `<div class="fin-h">Financial metrics <small>game scorecard · ▲▼ vs the round before</small></div><div class="fin-row">` + [
        ["Return on sales", "ros", "%", 1], ["Asset turnover", "at", "×", 1], ["Return on assets", "roa", "%", 1], ["Return on equity", "roe", "%", 1],
        ["WACC", "wacc", "%", -1], ["P/E", "pe", "", 1], ["Market to book", "mb", "×", 1], ["Market value", "mv", "$M", 1], ["Change in value", "chg", "%", 1],
        ["Gross margin", "gm", "%", 1], ["Operating expense", "opex", "% of sales", -1], ["Days of inventory", "days", " days", -1]
      ].map(([lbl, key, u, good]) => {
        const v = f[key], p0 = pr ? pr[key] : null, d = p0 == null ? 0 : v - p0, cls = !d ? "fl" : (d * good > 0 ? "up" : "dn");
        const val = u === "$M" ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 1 }) + "M" : v + (u === "×" ? "×" : u === "%" ? "%" : u === " days" ? " days" : u === "% of sales" ? "%" : "");
        return `<div class="fin-c"><small>${lbl}</small><b>${val}</b>${p0 == null ? "" : `<i class="${cls}">${d > 0 ? "▲" : d < 0 ? "▼" : "="} ${d ? Math.abs(d).toFixed(key === "mv" ? 0 : 1) : ""}</i>`}</div>`;
      }).join("") + `</div>${f.note ? `<div class="fin-note">${f.note}</div>` : ""}`;
    }

    const m = r.matrix;
    $("#standQuads").innerHTML = Q.map((q, i) => {
      const g = m.getchells[i], L = m.leader[i], F = m.fair[i], rk = rankOf(i);
      const cls = rk === 1 || g >= 0.95 * L ? "lead" : g >= F ? "fair" : "gap";
      const word = rk === 1 ? "#1" : g >= F ? "#" + rk : "GAP";
      return `<div class="sq ${cls}"><div class="sq-q">${q}</div><div class="sq-rank">${word}</div>
        <div class="sq-track"><i style="width:${g * 10}%"></i><span style="left:${L * 10}%"></span></div>
        <div class="sq-n">us ${g.toFixed(1)} · leader ${L.toFixed(1)}</div></div>`;
    }).join("");
    // Mirror of the game's input screen for the round we're about to play
    const d0 = S.defaults, rec = (S.plans || []).find(p => p.badge === "Recommended");
    const spend = d0.online + d0.service + d0.experience + d0.vendor + d0.analytics;
    const f$ = v => "$" + (+v.toFixed(3)) + "M";
    const rows = [
      ["Price markup (lower / higher)", d0.markupLow + "% / " + d0.markupHigh + "%", "markupLow"], ["Breadth (lower / higher)", d0.breadthLow + " / " + d0.breadthHigh, "breadthLow"], ["Depth (lower / higher)", d0.depthLow + " / " + d0.depthHigh, "depthLow"],
      ["Private brand (lower / higher)", d0.pbLow + "% / " + d0.pbHigh + "%", "pbLow"], ["Private brand quality", d0.pbQuality, "pbQuality"], ["National brand quality", d0.nbQuality, "nbQuality"],
      ["Retail coverage", d0.stores, "stores"], ["Online investment", f$(d0.online), "online"], ["Customer service", f$(d0.service), "service"],
      ["Shopping experience", f$(d0.experience), "experience"], ["Vendor management", f$(d0.vendor), "vendor"], ["Customer analytics", f$(d0.analytics), "analytics"]
    ];
    $("#curTitle").innerHTML = `Round ${S.round} input screen · submit to reach Round ${S.round + 1} <span class="mut">(boxes pre-filled with what we submitted in Round ${S.round - 1})</span>`;
    $("#curInputs").innerHTML = rows.map(([n, v, k]) => {
      const nv = rec && k ? rec.levers[k] : undefined, chg = nv !== undefined && nv !== d0[k];
      return `<div class="cur"><span>${n}</span><b>${v}</b>${chg ? `<em>Plan ${rec.id}: ${["online","service","experience","vendor","analytics"].includes(k) ? f$(nv) : nv}</em>` : ""}</div>`;
    }).join("") + `<div class="cur tot"><span>Available</span><b>${f$(S.base.budget - spend)}</b></div><div class="cur tot"><span>Total budget</span><b>${f$(S.base.budget)}</b></div>`;

    $("#standMoves").innerHTML = r.moves.map((t, i) => `<li><span>${i + 1}</span><div>${t}</div></li>`).join("");

    // Page 2 flags: only decisions far from the industry
    const flags = r.industry.map(x => {
      const span = Math.max(x.max - x.min, 1e-9), diff = (x.ours - x.avg) / span;
      const tag = x.ours >= x.max ? "Industry MAX" : x.ours <= x.min ? "Industry MIN" : Math.abs(diff) > 0.25 ? (diff > 0 ? "Well above avg" : "Well below avg") : "";
      const f = v => x.unit === "$M" ? "$" + (+v.toFixed(1)) + "M" : (Math.round(v * 10) / 10) + x.unit;
      return tag ? `<div class="flag"><div class="fn">${x.name}</div><div class="fv">${f(x.ours)}</div><div class="ft">${tag}<small> · avg ${f(x.avg)}</small></div></div>` : "";
    }).join("");
    $("#flags").innerHTML = flags;

    // What customers value
    if (S.prefs) {
      const mx = Math.max(...S.prefs.map(p => p.v));
      $("#prefs").innerHTML = S.prefs.map((p, k) => `<div class="pr ${k < 2 ? "top" : k === S.prefs.length - 1 ? "low" : ""}"><span class="prk">${k + 1}</span><span class="prn">${p.n} <small>${p.q}</small></span>
        <span class="prt"><i style="width:${p.v / mx * 100}%"></i></span><b>${p.v.toFixed(2)}</b></div>`).join("");
    }

    // Market share bars (lower + higher cost)
    const sh = r.share;
    if (sh) {
      const tot = v => (v[0] || 0) + (v[1] || 0);
      const rows = Object.keys(sh).sort((a, b) => tot(sh[b]) - tot(sh[a]));
      const max = Math.max(...rows.map(n => tot(sh[n]))) * 1.15;
      $("#shares").innerHTML = rows.map(n => {
        const [lo, hi] = sh[n], me = n === S.company;
        const seg = (v, cls) => v == null ? `<i class="sb unk" style="width:${4 / max * 100}%">?</i>` : `<i class="sb ${cls}" style="width:${v / max * 100}%">${v >= 4 ? v + "%" : ""}</i>`;
        const known = lo != null && hi != null;
        return `<div class="shr ${me ? "me" : ""}"><span class="shn">${n}</span><span class="sht">${seg(lo, "lo")}${seg(hi, "hi")}</span><b>${known ? tot(sh[n]).toFixed(1) + "%" : "≥" + tot(sh[n]).toFixed(1) + "%"}</b></div>`;
      }).join("");
    }
  }

  // ---------- Impact guide: how much change → how much effect ----------
  function renderImpacts() {
    if (!$("#impacts")) return;
    if (!S.impacts || !$("#impacts")) return;
    const dots = c => ({ High: "●●●", Medium: "●●○", Low: "●○○" })[c];
    $("#impacts").innerHTML = `<tr><th>If we change…</th><th>By</th><th>Expected effect (our guess)</th><th>Confidence</th><th>Evidence</th></tr>` +
      S.impacts.map(x => `<tr><td><b>${x.lever}</b></td><td class="by">${x.by}</td><td>${x.effect}</td><td class="cf ${x.conf.toLowerCase()}"><span>${dots(x.conf)}</span> ${x.conf}</td><td class="ev">${x.evidence}</td></tr>`).join("");
  }

  // ---------- Page 4: Timeline ----------
  let tlPlan = "A";
  function renderTimeline() {
    if (!S.decisionLog || !$("#tlCharts")) return;
    const plan = S.plans.find(p => p.id === tlPlan) || S.plans[0];
    const nd = Object.assign({}, S.defaults, plan.levers), pr = model(nd);
    const nextR = S.round;
    $("#tlPlans").innerHTML = S.gameOver ? "" : S.plans.map(p => `<button class="chipbtn ${p.id === tlPlan ? "on" : ""}" data-tl="${p.id}">Plan ${p.id}: ${p.name}</button>`).join("");
    document.querySelectorAll("[data-tl]").forEach(b => b.onclick = () => { tlPlan = b.dataset.tl; renderTimeline(); });

    // Series: real values per round + projected next round
    const R = S.rounds;
    const kp = k => R.map(r => [r.round, r.kpi[k]]);
    const tr = S.trend, rr = S.trendRounds;
    const qser = i => rr.map((r, k) => [r, tr[i][S.company][k]]);
    const fser = i => rr.map((r, k) => [r, tr[i]["Fair value"][k] / 0.66 * (S.fairRatio || 0.75)]);
    const lser = i => rr.map((r, k) => [r, Math.max(...Object.entries(tr[i]).filter(([n]) => n !== "Fair value" && n !== S.company).map(([, v]) => v[k]))]);
    const charts = [
      { t: "Market value ($M)", s: kp("marketValue"), p: S.gameOver ? null : pr.mv, fmt: v => "$" + v.toFixed(0) },
      { t: "Net income ($M)", s: kp("netIncome"), p: null, fmt: v => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(1) },
      { t: "Debt ($M)", s: kp("debt"), p: S.gameOver ? null : pr.debt, fmt: v => "$" + v.toFixed(0), down: true },
      ...Q.map((q, i) => ({ t: q, s: qser(i), p: S.gameOver ? null : pr.sc[i], fair: fser(i), lead: lser(i), fmt: v => v.toFixed(1), q: true }))
    ];
    $("#tlCharts").innerHTML = charts.map(c => miniChart(c, nextR)).join("");

    // Decision table
    const log = S.decisionLog;
    const cols = log.map(l => ({ label: l.label, d: l.d })).concat(S.gameOver ? [] : [{ label: "R" + nextR + " Plan " + plan.id, d: nd, plan: true }]);
    const fmtV = (L, v) => L.unit === "$M" ? "$" + (+v.toFixed(1)) + "M" : (+v.toFixed(1)) + (L.unit || "");
    $("#tlTable").innerHTML = `<tr><th>Lever</th>${cols.map(c => `<th class="${c.plan ? "pl" : ""}">${c.label}</th>`).join("")}</tr>` +
      LEVERS.map(L => `<tr><td>${L.label}</td>${cols.map((c, k) => {
        const v = c.d[L.key], pv = k ? cols[k - 1].d[L.key] : v, dv = v - pv;
        const ar = Math.abs(dv) < 1e-9 ? "" : `<i class="${dv > 0 ? "up" : "dn"}">${dv > 0 ? "▲" : "▼"}</i>`;
        return `<td class="${c.plan ? "pl" : ""} ${Math.abs(dv) > 1e-9 ? "chg" : ""}">${fmtV(L, v)} ${ar}</td>`;
      }).join("")}</tr>`).join("");

    // Lessons + projection card
    const lead = pr.cls.filter(c => c.status === "LEAD").map(c => c.q).join(" + ") || "none";
    const lessonHTML = l => `<div class="ls"><div class="lsr">${l.title || "Round " + l.round}</div>
        <div class="lsg"><div><b>We changed</b><ul>${l.changes.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div><b>What happened</b><ul>${l.results.map(x => `<li>${x}</li>`).join("")}</ul></div></div>
        <div class="lsl">💡 ${l.lesson}</div></div>`;
    const Ls = S.lessons || [], older = Ls.slice(0, -1).reverse();
    $("#tlLessons").innerHTML = (Ls.length ? lessonHTML(Ls[Ls.length - 1]) : "") +
      (older.length ? `<details class="fold tl-older"><summary>Earlier rounds (${older.length})</summary>${older.map(lessonHTML).join("")}</details>` : "") +
      (S.gameOver ? "" : `<div class="ls proj"><div class="lsr">Round ${nextR} projection · Plan ${plan.id}</div>
        <ul><li>Market value ≈ <b>$${pr.mv.toFixed(0)}M</b> · net income ≈ $${pr.niProj.toFixed(1)}M</li>
        <li>Debt ≈ <b>$${pr.debt.toFixed(0)}M</b></li>
        <li>Leads: <b>${lead}</b> · ${pr.gaps} quadrant(s) below 75% fair value</li></ul>
        <div class="lsl">Watch next round: does Experience pass Zephara, and how much does service move Frictionless?</div></div>`);
    if ($("#tlAcc") && S.backtest) $("#tlAcc").innerHTML = `<tr><th>Run</th><th>Brand</th><th>Experience</th><th>Low Price</th><th>Frictionless</th><th>Revenue</th><th>Net income</th><th>Market value</th></tr>` +
      S.backtest.map(b => `<tr><td>${b.run}</td>${b.cells.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
  }
  // ---------- Write-up page: one editable box per question, saved on this computer + shared live (ntfy relay, sent in small pieces) ----------
  const WU_KEY = "getchells-wu-v1", WU_LIVE = S.liveTopic ? "https://ntfy.sh/" + S.liveTopic + "-wu" : "";
  const wuLoad = () => jl(WU_KEY) || {}, wuSave = o => localStorage.setItem(WU_KEY, JSON.stringify(o));
  const wuWords = t => (String(t || "").trim().match(/\S+/g) || []).length;
  const wuQs = () => (S.writeup ? S.writeup.parts.reduce((a, p) => a.concat(p.qs), []) : []);
  const wuText = q => { const e = wuLoad()[q.id]; return e ? e.text : q.draft; };
  const wuPending = {}, wuBuf = {}, wuTimers = {};
  const wuEsc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function wuSetLive(on) { wuSetLive.on = on; const el = $("#wuLive"); if (el) { el.className = "tr-live " + (on ? "on" : "off"); el.textContent = on ? "● Live: everyone on this page sees edits" : "○ Offline: edits stay on this computer"; } }
  function wuPub(id, e) {
    if (!WU_LIVE) return; const t = e.text || "", n = Math.max(1, Math.ceil(t.length / 1000));
    for (let i = 0; i < n; i++) setTimeout(() => fetch(WU_LIVE, { method: "POST", body: JSON.stringify({ v: 1, k: "wu", id, ts: e.ts, by: e.by || "", n, i, p: t.slice(i * 1000, (i + 1) * 1000) }) })
      .then(r => wuSetLive(r.ok)).catch(() => wuSetLive(false)), i * 300);
  }
  function wuApply(o) {
    if (o && o.v === 1 && o.k === "wuo") return wuoApply(o.m);
    if (!o || o.v !== 1 || o.k !== "wu") return;
    const key = o.id + "@" + o.ts, b = wuBuf[key] = wuBuf[key] || { n: o.n, parts: {}, by: o.by };
    b.parts[o.i] = o.p; if (Object.keys(b.parts).length < b.n) return;
    delete wuBuf[key];
    const text = Array.from({ length: b.n }, (_, i) => b.parts[i] || "").join(""), all = wuLoad();
    if (all[o.id] && all[o.id].ts >= o.ts) return;
    const ta = document.querySelector(`#wuBody textarea[data-wu="${o.id}"]`);
    if (ta && document.activeElement === ta) { wuPending[o.id] = { text, ts: o.ts, by: b.by }; wuFill(o.id); return; }
    all[o.id] = { text, ts: o.ts, by: b.by }; wuSave(all); wuFill(o.id);
  }
  // who owns each question + status (Not started / Working on it / Done), synced on the same relay
  const WUO_KEY = "getchells-wu-own", WU_ST = [["todo", "Not started"], ["doing", "Working on it"], ["done", "Done"]];
  const wuoLoad = () => jl(WUO_KEY) || {}, wuoSave = o => localStorage.setItem(WUO_KEY, JSON.stringify(o));
  function wuoPub() { if (!WU_LIVE) return; fetch(WU_LIVE, { method: "POST", body: JSON.stringify({ v: 1, k: "wuo", m: wuoLoad() }) }).then(r => wuSetLive(r.ok)).catch(() => wuSetLive(false)); }
  function wuoSet(id, patch) { const all = wuoLoad(), cur = all[id] || { o: "", s: "todo" }; all[id] = Object.assign({}, cur, patch, { ts: Date.now() }); wuoSave(all); wuoPub(); wuBoard(); }
  function wuoApply(m) { const all = wuoLoad(); let ch = false; Object.entries(m || {}).forEach(([id, e]) => { if (!all[id] || (e.ts || 0) > (all[id].ts || 0)) { all[id] = e; ch = true; } }); if (ch) { wuoSave(all); wuBoard(); } }
  function wuBoard() {
    const all = wuoLoad(), qs = wuQs(), team = S.team || [], done = qs.filter(q => (all[q.id] || {}).s === "done").length;
    const pill = (id, st) => WU_ST.map(([k, l]) => `<button type="button" class="wu-st ${k} ${st === k ? "on" : ""}" data-st="${id}" data-v="${k}">${l}</button>`).join("");
    const sel = (id, o) => `<select data-own="${id}" aria-label="Who is writing this"><option value="">Unclaimed</option>${team.map(n => `<option ${n === o ? "selected" : ""}>${n}</option>`).join("")}</select>`;
    const b = $("#wuBoard");
    if (b) b.innerHTML = `<div class="wu-bh"><b>Who's doing what</b><span>${done} of ${qs.length} done</span><div class="wu-btrack"><i style="width:${done / qs.length * 100}%"></i></div>
        <button type="button" class="ghost" id="wuSplit">Split evenly (${Math.ceil(qs.length / Math.max(team.length, 1))} each)</button></div>
      <div class="wu-blist">${qs.map((q, i) => { const e = all[q.id] || { o: "", s: "todo" }; return `<div class="wu-brow ${e.s}"><a href="#" data-jump="${q.id}">${i + 1}. ${q.short}<span class="wu-wc" data-wc="${q.id}"></span></a>${sel(q.id, e.o)}<div class="wu-sts">${pill(q.id, e.s)}</div></div>`; }).join("")}</div>
      <div class="wu-bsum">${team.map(n => { const mine = qs.filter(q => (all[q.id] || {}).o === n); return `<span><b>${n}</b> ${mine.length ? mine.map(q => "Q" + (qs.indexOf(q) + 1) + ((all[q.id] || {}).s === "done" ? " ✓" : "")).join(", ") : "—"}</span>`; }).join("")}</div>`;
    qs.forEach(q => { const e = all[q.id] || { o: "", s: "todo" }, h = document.querySelector(`[data-qown="${q.id}"]`);
      if (h) h.innerHTML = `${sel(q.id, e.o)}<div class="wu-sts">${pill(q.id, e.s)}</div>`;
      const card = document.getElementById("wuq-" + q.id); if (card) card.dataset.st = e.s; });
    document.querySelectorAll("#wuBody [data-own]").forEach(x => x.onchange = () => wuoSet(x.dataset.own, { o: x.value, s: x.value && ((wuoLoad()[x.dataset.own] || {}).s || "todo") === "todo" ? "doing" : ((wuoLoad()[x.dataset.own] || {}).s || "todo") }));
    document.querySelectorAll("#wuBody [data-st]").forEach(x => x.onclick = () => wuoSet(x.dataset.st, { s: x.dataset.v }));
    document.querySelectorAll("#wuBody [data-jump]").forEach(a => a.onclick = e => { e.preventDefault(); const c = document.getElementById("wuq-" + a.dataset.jump); if (c) window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" }); });
    if ($("#wuSplit")) $("#wuSplit").onclick = () => {
      if (!team.length) return; if (Object.values(all).some(e => e.o) && !confirm("Re-split every question evenly? This replaces current claims (statuses stay).")) return;
      const order = qs.slice().sort((a, b) => wuWords(b.draft) - wuWords(a.draft)), m = wuoLoad();   // snake order: heavy + light per person
      order.forEach((q, i) => { const r = Math.floor(i / team.length), k = i % team.length, who = team[r % 2 ? team.length - 1 - k : k]; m[q.id] = Object.assign({ s: "todo" }, m[q.id] || {}, { o: who, ts: Date.now() }); });
      wuoSave(m); wuoPub(); wuBoard(); };
    wuCounts();
  }
  function wuSnapX() {}
  function wuSnap() { Object.entries(wuLoad()).forEach(([id, e], k) => setTimeout(() => wuPub(id, e), k * 1500)); if (Object.keys(wuoLoad()).length) setTimeout(wuoPub, 400); }
  function wuLiveStart() {
    if (!WU_LIVE || !window.EventSource || wuLiveStart.on) return; wuLiveStart.on = 1;
    const take = l => { try { const m = JSON.parse(l); if (m.event === "message") wuApply(JSON.parse(m.message)); } catch (e) {} };
    fetch(WU_LIVE + "/json?poll=1&since=12h").then(r => r.text()).then(txt => { txt.split("\n").forEach(take); wuSetLive(true); wuSnap(); }).catch(() => wuSetLive(false));
    setInterval(wuSnap, 3600 * 1000);
    const es = new EventSource(WU_LIVE + "/sse"); es.onopen = () => wuSetLive(true); es.onerror = () => wuSetLive(false);
    es.onmessage = e => take(e.data);
  }
  function wuGrow(ta) { ta.style.height = "auto"; ta.style.height = Math.max(150, ta.scrollHeight + 4) + "px"; }
  // words written vs the words allocated to this question: "short by N" / "on target" (±10%) / "over by N"
  function wuStat(q) { const w = wuWords(wuText(q)), t = q.target || 200, d = w - t;
    return Math.abs(d) <= t * 0.1 ? { w, t, cls: "ok", txt: `on target (${w} / ${t})` } : d < 0 ? { w, t, cls: "short", txt: `${-d} more to write (${w} / ${t})` } : { w, t, cls: "over", txt: `${d} over (${w} / ${t})` }; }
  function wuCounts() {
    const W = S.writeup, tot = wuQs().reduce((s, q) => s + wuWords(wuText(q)), 0), over = tot > W.limit;
    if ($("#wuCount")) $("#wuCount").innerHTML = `<b style="${over ? "color:#b42318" : ""}">${tot.toLocaleString()}</b> of ${W.limit.toLocaleString()} words${over ? ` · <b style="color:#b42318">${(tot - W.limit).toLocaleString()} over</b>` : ` · ${(W.limit - tot).toLocaleString()} left`}`;
    if ($("#wuFillBar")) { $("#wuFillBar").style.width = Math.min(100, tot / W.limit * 100) + "%"; $("#wuFillBar").style.background = over ? "#b42318" : "#2E5BFF"; }
    wuQs().forEach(q => { const st = wuStat(q); document.querySelectorAll(`[data-wc="${q.id}"]`).forEach(el => { el.className = "wu-wc " + st.cls; el.textContent = st.txt; }); });
    const qs = wuQs(), alloc = qs.reduce((a, q) => a + (q.target || 0), 0), short = qs.filter(q => wuStat(q).cls === "short"), overQ = qs.filter(q => wuStat(q).cls === "over");
    if ($("#wuAlloc")) $("#wuAlloc").innerHTML = `Allocated: <b>${alloc.toLocaleString()}</b> words across ${qs.length} questions · <span class="short">${short.length} short</span> · <span class="ok">${qs.length - short.length - overQ.length} on target</span> · <span class="over">${overQ.length} over</span>`;
  }
  function wuFill(id) {
    const q = wuQs().find(x => x.id === id), ta = document.querySelector(`#wuBody textarea[data-wu="${id}"]`); if (!q || !ta) return;
    if (document.activeElement !== ta) { ta.value = wuText(q); wuGrow(ta); }
    const e = wuLoad()[id], p = wuPending[id], meta = document.querySelector(`[data-meta="${id}"]`);
    if (meta) meta.innerHTML = (e ? `Edited${e.by ? " by <b>" + wuEsc(e.by) + "</b>" : ""} · ${new Date(e.ts).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "Starter answer (not edited yet)") +
      (p && (!e || p.ts > e.ts) ? ` · <span class="wu-new">⟳ ${wuEsc(p.by || "A teammate")} saved a newer version: it loads when you click outside this box</span>` : "");
    wuCounts();
  }
  function wuPlain() { return S.writeup.parts.map(p => p.h + "\n\n" + p.qs.map(q => q.q + "\n\n" + wuText(q)).join("\n\n")).join("\n\n\n"); }
  // Voice: the browser's built-in speech-to-text (Chrome / Edge / Safari) → adds to or replaces the answer; "Rewrite with Claude" hands off to the chat
  const WU_SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let wuRec = null, wuRecId = null;
  function wuSetText(id, text) { const ta = document.querySelector(`#wuBody textarea[data-wu="${id}"]`); if (!ta) return;
    ta.value = text; const all = wuLoad(); all[id] = { text, ts: Date.now(), by: localStorage.getItem(ME_KEY) || "" }; wuSave(all); wuGrow(ta); wuFill(id);
    clearTimeout(wuTimers[id]); wuTimers[id] = setTimeout(() => wuPub(id, wuLoad()[id]), 800); }
  function wuVoice(id) {
    const btn = document.querySelector(`[data-mic="${id}"]`), st = document.querySelector(`[data-vs="${id}"]`), mode = (document.querySelector(`[data-vm="${id}"]`) || {}).value || "add";
    if (!WU_SR) { st.innerHTML = "Voice typing needs Chrome, Edge or Safari."; return; }
    if (wuRec) { wuRec.stop(); return; }
    const q = wuQs().find(x => x.id === id), before = wuText(q); let said = "";
    wuRec = new WU_SR(); wuRecId = id; wuRec.lang = "en-US"; wuRec.continuous = true; wuRec.interimResults = true;
    btn.classList.add("rec"); btn.textContent = "■ Stop"; st.innerHTML = "<b>● Listening…</b> speak, then press Stop.";
    wuRec.onresult = e => { let fin = "", tmp = ""; for (let i = 0; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) fin += r[0].transcript + " "; else tmp += r[0].transcript; }
      said = fin.trim(); st.innerHTML = `<b>● Listening…</b> ${wuEsc((fin + tmp).trim()).slice(-160)}`; };
    wuRec.onerror = e => { st.innerHTML = e.error === "not-allowed" ? "Microphone blocked: allow it in the browser's address bar." : "Voice stopped (" + e.error + ")."; };
    wuRec.onend = () => { btn.classList.remove("rec"); btn.textContent = "🎤 Speak"; wuRec = null; wuRecId = null;
      if (!said) { if (!/blocked|stopped/.test(st.textContent)) st.textContent = "Didn't catch anything."; return; }
      const txt = said.charAt(0).toUpperCase() + said.slice(1) + (/[.!?]$/.test(said) ? "" : ".");
      wuSetText(id, mode === "replace" ? txt : (before.trim() + "\n\n" + txt));
      st.innerHTML = `✓ ${mode === "replace" ? "Answer replaced" : "Added to the end"} (${wuWords(txt)} words). <button type="button" class="wu-link" data-vundo="${id}">↶ Undo</button>`;
      st.querySelector("[data-vundo]").onclick = () => { wuSetText(id, before); st.textContent = "Undone."; }; };
    wuRec.start();
  }
  function wuClaude(id) {
    const q = wuQs().find(x => x.id === id), t = `Please rewrite our Pivot or Perish write-up answer. Keep every fact and number, use plain, confident academic English in our team's voice ("we"), and keep it under ${Math.max(120, wuWords(wuText(q)))} words. Use my spoken notes at the end if there are any.\n\nQUESTION: ${q.q}\n\nFACTS WE CAN USE:\n- ${q.facts.join("\n- ")}\n\nCURRENT ANSWER (including any spoken notes):\n${wuText(q)}`;
    const b = document.querySelector(`[data-cl="${id}"]`), done = () => { b.textContent = "✓ Copied: paste into the Claude chat"; setTimeout(() => b.textContent = "✦ Rewrite with Claude", 2500); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done).catch(() => prompt("Copy this into the Claude chat:", t)); else prompt("Copy this into the Claude chat:", t);
  }
  // ---- Save + versions (saved on this computer; the answer itself syncs to the team) ----
  const WUV_KEY = "getchells-wu-ver", wuvLoad = () => jl(WUV_KEY) || {}, wuvSave = o => localStorage.setItem(WUV_KEY, JSON.stringify(o));
  function wuSaveQ(id, quiet) {
    const q = wuQs().find(x => x.id === id), t = wuText(q), all = wuvLoad(), list = all[id] || [], me = localStorage.getItem(ME_KEY) || "";
    if (!list.length || list[0].text !== t) { list.unshift({ text: t, by: me, ts: Date.now() }); all[id] = list.slice(0, 15); wuvSave(all); }
    const e = wuLoad(); e[id] = { text: t, ts: Date.now(), by: me }; wuSave(e); wuPub(id, e[id]);
    if (!quiet) wuVers(id, true);
  }
  function wuVers(id, justSaved) {
    const box = document.querySelector(`[data-vers="${id}"]`); if (!box) return;
    const list = wuvLoad()[id] || [], fmt = ts => new Date(ts).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
    box.innerHTML = `${justSaved ? `<span class="wu-saved">✓ Saved ${fmt(list[0].ts)}</span>` : list.length ? `<span class="mut">Last saved ${fmt(list[0].ts)}</span>` : ""}
      ${list.length > 1 ? `<details class="wu-vlist"><summary>Earlier versions (${list.length - 1})</summary>${list.slice(1).map((v, i) => `<div><span>${fmt(v.ts)}${v.by ? " · " + wuEsc(v.by) : ""} · ${wuWords(v.text)} words</span><button type="button" class="wu-link" data-restore="${id}" data-i="${i + 1}">Restore</button></div>`).join("")}</details>` : ""}`;
    box.querySelectorAll("[data-restore]").forEach(b => b.onclick = () => { const v = (wuvLoad()[id] || [])[+b.dataset.i]; if (!v || !confirm("Replace the current answer with this saved version? (The current text is saved first.)")) return; wuSaveQ(id, true); wuSetText(id, v.text); wuVers(id); });
  }
  // ---- Ask Claude: the page writes a data-packed request for the main Claude chat; paste the reply back here ----
  const WU_QUICK = ["Make it simpler and easier to read", "Fit it to the word count", "Add more data and numbers", "Explain our thinking more", "Make it sound more professional", "Make it shorter and punchier"];
  function wuBrief(q, ask) {
    const S8 = S.story || {}, rounds = (S8.rounds || []).map(r => `- ${r.r} (${r.t}): changed ${r.ch.map(c => c[0] + " " + c[1] + "→" + c[2]).join("; ")} → market value ${r.mv >= 1000 ? "$" + (r.mv / 1000).toFixed(2) + "B" : "$" + r.mv + "M"} (${r.chg}); ${r.kpi}. Why: ${r.why || ""} Found: ${r.found || r.lesson}`).join("\n");
    return `WRITE-UP REQUEST (Getchells / Team 4 · Pivot or Perish write-up, < 2,500 words total)
Please rewrite our answer below. My instruction: ${ask || "improve it"}.
Rules: keep every number accurate to our game data (check against the copilot data); plain English; our team's voice ("we"); about ${q.target} words (now ${wuWords(wuText(q))}). Reply with only the new answer text.

QUESTION: ${q.q}

FACTS FOR THIS QUESTION:
- ${q.facts.join("\n- ")}

GAME SUMMARY: ${(S.writeup.facts || []).map(f => f[0] + " " + f[1]).join(" · ")}
${rounds}

OUR CURRENT ANSWER:
${wuText(q)}`;
  }
  function wuChat(id) {
    const q = wuQs().find(x => x.id === id), box = document.querySelector(`[data-chat="${id}"]`); if (!box) return;
    const log = (jl("getchells-wu-chat") || {})[id] || [];
    box.innerHTML = `<div class="wu-chips">${WU_QUICK.map(t => `<button type="button" class="wu-chip" data-quick="${id}">${t}</button>`).join("")}</div>
      <div class="wu-ask"><input type="text" data-askin="${id}" placeholder="Or type how you want it rewritten, e.g. 'mention the Zephara rivalry more'"><button type="button" class="primary" data-askgo="${id}">Copy request for Claude</button></div>
      <div class="wu-step" data-askst="${id}"></div>
      <textarea class="wu-reply" data-reply="${id}" placeholder="Step 2: paste Claude's reply here"></textarea>
      <div class="wu-replyb"><button type="button" class="ghost" data-use="${id}" data-how="replace">Replace my answer with this</button><button type="button" class="ghost" data-use="${id}" data-how="add">Add to the end of my answer</button></div>
      ${log.length ? `<div class="wu-log">${log.slice(-4).map(m => `<div class="${m.me ? "me" : "cl"}">${m.me ? "You asked" : "Used reply"} · ${wuEsc(m.t).slice(0, 140)}${m.t.length > 140 ? "…" : ""}</div>`).join("")}</div>` : ""}`;
    const addLog = (t, me) => { const all = jl("getchells-wu-chat") || {}; (all[id] = all[id] || []).push({ t, me, ts: Date.now() }); all[id] = all[id].slice(-20); localStorage.setItem("getchells-wu-chat", JSON.stringify(all)); };
    const go = ask => { const t = wuBrief(q, ask), st = box.querySelector(`[data-askst="${id}"]`), ok = () => { st.innerHTML = `✓ Copied. <b>Paste it into the Claude chat</b>, then paste Claude's reply in the box below.`; addLog(ask || "improve it", true); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(() => { prompt("Copy this into the Claude chat:", t); ok(); }); else { prompt("Copy this into the Claude chat:", t); ok(); } };
    box.querySelectorAll("[data-quick]").forEach(b => b.onclick = () => go(b.textContent));
    box.querySelector("[data-askgo]").onclick = () => go(box.querySelector("[data-askin]").value.trim());
    box.querySelector("[data-askin]").onkeydown = e => { if (e.key === "Enter") go(e.target.value.trim()); };
    box.querySelectorAll("[data-use]").forEach(b => b.onclick = () => { const r = box.querySelector(`[data-reply="${id}"]`).value.trim(); if (!r) { box.querySelector(`[data-askst="${id}"]`).textContent = "Paste Claude's reply in the box first."; return; }
      wuSaveQ(id, true); wuSetText(id, b.dataset.how === "replace" ? r : wuText(q).trim() + "\n\n" + r); wuSaveQ(id); addLog(r, false); wuChat(id);
      document.querySelector(`[data-askst="${id}"]`) && (document.querySelector(`[data-askst="${id}"]`).innerHTML = "✓ Answer updated and saved (the old text is in Earlier versions)."); });
  }
  function renderWriteup() {
    const W = S.writeup, el = $("#wuBody"); if (!W || !el) return;
    const me = localStorage.getItem(ME_KEY) || "";
    el.innerHTML = `<h1>Write-up</h1><p class="wu-intro">${W.intro}</p><button type="button" class="story-btn" data-story style="margin:0 0 16px">▶ Watch our story · round by round, 2 min</button>
      <div class="card wu-top"><div class="wu-facts">${W.facts.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>
        <div class="wu-bar"><div id="wuCount"></div><div class="wu-track"><i id="wuFillBar"></i></div></div><div class="wu-alloc" id="wuAlloc"></div>
        <div class="wu-tools"><span class="tr-live off" id="wuLive">○ Offline: edits stay on this computer</span>
          <label>Writing as <select id="wuMe">${[""].concat(S.team || []).map(n => `<option value="${n}" ${n === me ? "selected" : ""}>${n || "pick your name"}</option>`).join("")}</select></label>
          <button type="button" class="primary" id="wuSaveAll">💾 Save all</button><button type="button" class="ghost" id="wuDoc">⬇ Download for Word</button><button type="button" class="ghost" id="wuCopy">Copy all text</button></div>
        <div id="wuBoard" class="wu-board"></div>
        <div class="wu-tip"><b>Tips:</b> one person per box at a time (the newest save wins). 🎤 Speak types what you say into the box (Chrome, Edge or Safari). 💾 Save keeps a version you can restore. ✦ Ask Claude builds a request with our game data: paste it into the Claude chat, then paste the reply back.</div></div>
      ${W.matrix ? `<div class="card wu-mx"><h2>${W.matrix.title}</h2><p class="wu-mxs">${W.matrix.sub}</p>
        <div class="wu-mxg">${W.matrix.cells.map(c => `<div class="wu-mxc ${c.aim === "Lead" ? "lead" : "fair"}"><div class="wu-mxh"><b>${c.q}</b><em>${c.aim}</em></div>
          <div class="wu-mxn"><span>${c.from.toFixed(1)}</span> → <b>${c.to.toFixed(1)}</b> <small>${c.rank}</small></div>
          <div class="wu-mxl"><small>Professor's tools</small>${c.tools}</div><div class="wu-mxl"><small>What we did</small>${c.did}</div></div>`).join("")}</div>
        <div class="wu-mxr"><b>The professor's rules, and how we followed them</b><ul>${W.matrix.rules.map(([a, b]) => `<li><span>✓</span><div><b>${a}</b><br>${b}</div></li>`).join("")}</ul></div></div>` : ""}
      ${W.parts.map(p => `<h2 class="wu-h">${p.h}</h2>` + p.qs.map(q => `<div class="card wu-q" id="wuq-${q.id}">
        <div class="wu-qh"><b>${q.q}</b><span class="wu-wc" data-wc="${q.id}"></span></div>
        <div class="wu-qown" data-qown="${q.id}"></div>
        <details class="wu-f"><summary>Facts to use</summary><ul>${q.facts.map(f => `<li>${f}</li>`).join("")}</ul></details>
        <div class="wu-voice"><button type="button" class="wu-mic" data-mic="${q.id}">🎤 Speak</button><select data-vm="${q.id}" aria-label="What voice does"><option value="add">add to my answer</option><option value="replace">replace my answer</option></select>
          <span class="wu-vs" data-vs="${q.id}"></span></div>
        <textarea data-wu="${q.id}" spellcheck="true"></textarea>
        <div class="wu-saveb"><button type="button" class="primary" data-save="${q.id}">💾 Save</button><span data-vers="${q.id}"></span></div>
        <details class="wu-chatd"><summary>✦ Ask Claude to rewrite this answer</summary><div class="wu-chat" data-chat="${q.id}"></div></details>
        <div class="wu-meta"><span data-meta="${q.id}"></span><button type="button" class="wu-reset" data-reset="${q.id}">↺ Back to the starter answer</button></div></div>`).join("")).join("")}`;
    wuQs().forEach(q => wuFill(q.id)); wuBoard();
    $("#wuMe").onchange = e => localStorage.setItem(ME_KEY, e.target.value);
    el.querySelectorAll("textarea[data-wu]").forEach(ta => {
      const id = ta.dataset.wu;
      ta.addEventListener("input", () => { const all = wuLoad(); all[id] = { text: ta.value, ts: Date.now(), by: localStorage.getItem(ME_KEY) || "" }; wuSave(all); wuGrow(ta); wuFill(id);
        clearTimeout(wuTimers[id]); wuTimers[id] = setTimeout(() => wuPub(id, wuLoad()[id]), 1500); });
      ta.addEventListener("blur", () => { const p = wuPending[id], e = wuLoad()[id]; if (p && (!e || p.ts > e.ts)) { const all = wuLoad(); all[id] = p; wuSave(all); } delete wuPending[id]; wuFill(id); });
    });
    el.querySelectorAll("[data-mic]").forEach(b => b.onclick = () => { if (wuRec && wuRecId !== b.dataset.mic) return; wuVoice(b.dataset.mic); });
    el.querySelectorAll("[data-save]").forEach(b => b.onclick = () => wuSaveQ(b.dataset.save));
    wuQs().forEach(q => { wuVers(q.id); wuChat(q.id); });
    if ($("#wuSaveAll")) $("#wuSaveAll").onclick = () => { wuQs().forEach((q, i) => setTimeout(() => wuSaveQ(q.id), i * 400)); $("#wuSaveAll").textContent = "✓ All saved"; setTimeout(() => $("#wuSaveAll").textContent = "💾 Save all", 2500); };
    el.querySelectorAll("[data-reset]").forEach(b => b.onclick = () => { const id = b.dataset.reset, q = wuQs().find(x => x.id === id);
      if (!confirm("Replace this answer with the starter answer? Everyone's edits to this box will be replaced.")) return;
      const all = wuLoad(); all[id] = { text: q.draft, ts: Date.now(), by: localStorage.getItem(ME_KEY) || "" }; wuSave(all); wuPub(id, all[id]); wuFill(id); });
    $("#wuCopy").onclick = () => { const t = wuPlain(), done = () => { $("#wuCopy").textContent = "✓ Copied"; setTimeout(() => $("#wuCopy").textContent = "Copy all text", 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done).catch(() => prompt("Copy:", t)); else prompt("Copy:", t); };
    $("#wuDoc").onclick = () => { const html = `<html><head><meta charset="utf-8"><title>Getchells write-up</title></head><body style="font-family:Calibri,Arial;font-size:11pt">
      <h1>Team 4 · Getchells · Pivot or Perish write-up</h1>` + S.writeup.parts.map(p => `<h2>${p.h}</h2>` + p.qs.map(q => `<h3>${wuEsc(q.q)}</h3>` + wuText(q).split(/\n+/).map(x => `<p>${wuEsc(x)}</p>`).join("")).join("")).join("") + `</body></html>`;
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + html], { type: "application/msword" })); a.download = "Getchells-writeup.doc"; a.click(); };
    wuCounts(); wuSetLive(!!wuSetLive.on); wuLiveStart();
  }
  // Game over: hide the forward-looking pieces (next input screen, "build this round" buttons, projection picker)
  function gameOverUI() {
    const ct = document.getElementById("curTitle"); if (ct && ct.parentElement) ct.parentElement.style.display = "none";
    document.body.classList.add("game-over");
    const h = document.querySelector("#timeline h1"); if (h) h.textContent = "What we changed → what happened";
  }
  function miniChart(c, nextR) {
    const W = 300, H = 150, P = 26;
    const pts = c.s.filter(x => x[1] != null);
    const all = pts.map(x => x[1]).concat(c.p != null ? [c.p] : []).concat(c.fair ? c.fair.map(x => x[1]) : []).concat(c.lead ? c.lead.map(x => x[1]) : []);
    let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.15 || 1; lo -= pad; hi += pad;
    const r0 = Math.min(...pts.map(x => x[0]), c.fair ? c.fair[0][0] : 99), r1 = nextR;
    const x = r => P + (r - r0) / Math.max(r1 - r0, 1) * (W - 2 * P), y = v => H - 22 - (v - lo) / (hi - lo) * (H - 44);
    const line = (arr, cls) => `<polyline class="${cls}" points="${arr.map(p => x(p[0]) + "," + y(p[1])).join(" ")}"/>`;
    let g = `<svg viewBox="0 0 ${W} ${H}">`;
    for (let r = r0; r <= r1; r++) g += `<text x="${x(r)}" y="${H - 6}" class="mx">${r === r1 && !S.gameOver ? "R" + r + "*" : "R" + r}</text>`;
    if (c.lead) g += line(c.lead, "mlead");
    if (c.fair) g += line(c.fair, "mfair");
    g += line(pts, "mreal");
    const last = pts[pts.length - 1];
    if (c.p != null) g += `<line class="mproj" x1="${x(last[0])}" y1="${y(last[1])}" x2="${x(r1)}" y2="${y(c.p)}"/><circle cx="${x(r1)}" cy="${y(c.p)}" r="5" class="mpd"/>`;
    pts.forEach(p => g += `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="4" class="mrd"/>`);
    g += `<text x="${x(last[0])}" y="${y(last[1]) - 9}" class="mv1">${c.fmt(last[1])}</text>`;
    if (c.p != null) g += `<text x="${x(r1)}" y="${y(c.p) - 9}" class="mv2">${c.fmt(c.p)}</text>`;
    g += "</svg>";
    const prev = pts.length > 1 ? pts[pts.length - 2][1] : null, dv = prev == null ? 0 : last[1] - prev;
    const good = c.down ? dv < 0 : dv > 0;
    return `<div class="mc"><div class="mch"><span>${c.t}</span>${prev == null ? "" : `<em class="${good ? "up" : "dn"}">${dv > 0 ? "▲" : "▼"} ${c.fmt(Math.abs(dv)).replace("−", "")}</em>`}</div>${g}
      ${c.q ? `<div class="mkey"><i class="k1"></i>us <i class="k2"></i>best rival <i class="k3"></i>75% fair</div>` : ""}</div>`;
  }

  // ---------- Top 3 plans ----------
  function renderPlans() {
    if (!S.plans) return;
    const base = model(S.defaults);
    $("#plans").innerHTML = S.plans.map(p => {
      const d = Object.assign({}, S.defaults, p.levers), r = model(d);
      const dv = r.mv - S.base.marketValue;
      const leads = r.cls.filter(c => c.status === "LEAD").map(c => c.q).join(" + ") || "none";
      const gaps = r.cls.filter(c => c.status === "GAP").length;
      const chips = LEVERS.map(L => ({ L, a: S.defaults[L.key], b: d[L.key] })).filter(x => Math.abs(x.b - x.a) > 1e-6)
        .map(x => `<span class="chip ${x.b > x.a ? "up" : "dn"}">${x.L.label.split(" (")[0]} ${x.L.unit === "$M" ? "$" + x.a + "→" + x.b + "M" : x.a + "→" + x.b + (x.L.unit || "")}</span>`).join("");
      const expQ = r.cls[1];
      return `<div class="plan ${p.badge === "Recommended" ? "best" : ""}">
        <div class="ph"><span class="pid">${p.id}</span><div class="pn">${p.name}</div><span class="pb">${p.badge}</span></div>
        <div class="pm3">
          <div><small>Market value</small><b>${fmtM(r.mv)}</b><em class="${dv >= 0 ? "up" : "dn"}">${dv >= 0 ? "▲" : "▼"} ${Math.abs(dv / S.base.marketValue * 100).toFixed(0)}%</em></div>
          <div><small>Net income</small><b>${fmtM(r.niProj)}</b><em>spend ${fmtM(r.spend)}</em></div>
          <div><small>Experience</small><b>${expQ.score.toFixed(2)}</b><em class="${expQ.score >= expQ.leader ? "up" : ""}">${expQ.score >= expQ.leader ? "#1" : "#2"} vs ${expQ.leaderName} ${expQ.leader}</em></div>
        </div>
        <div class="chips">${chips || '<span class="chip">No changes</span>'}</div>
        <p class="p1">${(p.why[0] || "").replace(/<[^>]+>/g, "")}</p>
        <details class="pmore"><summary>Why &amp; risks</summary><ul>${p.why.slice(1).map(w => `<li>${w}</li>`).join("")}</ul><ul class="risk">${p.risks.map(w => `<li>${w}</li>`).join("")}</ul></details>
        <button class="${p.badge === "Recommended" ? "primary" : "ghost"} wide" data-plan="${p.id}">Load Plan ${p.id} →</button>
      </div>`;
    }).join("");
    document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => {
      const p = S.plans.find(x => x.id === b.dataset.plan);
      state.segs = p.segs.slice(); state.plan = p;
      state.d = Object.assign({}, S.defaults, p.levers); state.baseD = Object.assign({}, state.d);
      renderStart(); openCockpit(true);
      $("#aiBadge").textContent = "✦ Plan " + p.id + ": " + p.name;
    });
  }

  // Start screen
  function renderStart() {
    if (S.ourTrend) {
      const t = S.ourTrend;
      $("#ourMix").innerHTML = `<span>Our revenue by segment</span><div class="mixbar">${S.segments.map(sg => sg.rev ? `<i style="flex:${sg.rev}">S${sg.id} ${Math.round(sg.rev * 100)}%</i>` : "").join("")}</div>
        <span class="mixnote">CLV $${Math.round(t.clv[0])}M → $${Math.round(t.clv[t.clv.length-1])}M · revenue $${Math.round(t.revenue[0])}M → $${Math.round(t.revenue[t.revenue.length-1])}M</span>`;
    }
    const grid = $("#segGrid");
    grid.innerHTML = "";
    S.segments.forEach(s => {
      const el = document.createElement("button");
      el.className = "seg" + (state.segs.includes(s.id) ? " on" : "");
      const bars = s.weights.map((w, i) => `<div class="wbar"><span style="height:${w * 100 * 1.6}%"></span><em>${Q[i].split(" ")[0]}</em></div>`).join("");
      el.innerHTML = `<div class="seg-top"><span class="seg-id">${s.id}</span><span class="seg-clv">${Math.round(s.rev * 100)}% of our sales${s.rev === 0 ? " · LOST" : ""}</span></div>
        <div class="seg-name">${s.name}</div><div class="seg-wants">${s.wants}</div>
        <div class="wbars">${bars}</div><div class="seg-rival">Owned by ${s.rival}</div>`;
      el.onclick = () => {
        if (state.segs.includes(s.id)) state.segs = state.segs.filter(x => x !== s.id);
        else { state.segs.push(s.id); if (state.segs.length > 2) state.segs.shift(); }
        renderStart();
      };
      grid.appendChild(el);
    });
    const go = $("#goBtn");
    if (state.segs.length) {
      const t = targetQuads(state.segs);
      $("#pairHint").innerHTML = `Lead in <b>${Q[t[0]]}</b> + <b>${Q[t[1]]}</b> · fair value in the other two`;
      go.disabled = false;
    } else {
      $("#pairHint").textContent = "Pick 1–2 segments to win";
      go.disabled = true;
    }
  }

  // AI log
  function runCopilot() {
    state.team = $("#teamName").value.trim() || "Team 4";
    save();
    const target = targetQuads(state.segs);
    show("thinking");
    const log = $("#log"), bar = $("#progFill"), cnt = $("#mixCount");
    log.innerHTML = ""; bar.style.width = "0%";
    const { who } = rivalLeaders();
    const lines = [
      `Reading Round ${S.round} status (game CSV "Round-${S.round - 1}") · market value ${fmtM(S.base.marketValue)} · WACC ${S.base.wacc}%`,
      `Scoring 6 segments by size × CLV × fit with Getchells`,
      `Target: segments ${state.segs.join(" + ")} → lead ${Q[target[0]]} (vs ${who[target[0]]}) + ${Q[target[1]]} (vs ${who[target[1]]})`,
      `Simulating 2,400 budget mixes within ${fmtM(S.base.budget)}`,
      `Checking 75% fair-value rule in all four quadrants`,
      `Testing ROIC vs WACC spread and credit rating`,
      `Projecting free cash flow · discounting at WACC · DCF vs CLV vs liquidation`,
    ];
    const best = optimize(target);
    const br = model(best);
    const won = target.filter(i => br.cls[i].status === "LEAD").length;
    lines.push(won === 2
      ? `✓ Both target quadrants reachable this round · projected ${fmtM(br.mv)}`
      : `Only ${won} of 2 target quadrants reachable in one budget, so build over 2–3 rounds · projected ${fmtM(br.mv)}`);
    let i = 0, mixes = 0;
    const tick = setInterval(() => {
      mixes = Math.min(2400, mixes + 137); cnt.textContent = mixes.toLocaleString();
    }, 40);
    const step = () => {
      if (i > 0) log.lastChild.classList.add("done");
      if (i === lines.length) {
        clearInterval(tick); cnt.textContent = "2,400";
        setTimeout(() => { state.d = best; openCockpit(true); }, 500);
        return;
      }
      const li = document.createElement("li"); li.textContent = lines[i]; log.appendChild(li);
      bar.style.width = ((i + 1) / lines.length * 100) + "%";
      i++; setTimeout(step, i === 4 ? 900 : 480);
    };
    step();
  }

  // Cockpit
  function buildLevers() {
    const wrap = $("#levers"); wrap.innerHTML = "";
    let group = "";
    LEVERS.forEach(L => {
      if (L.group !== group) { group = L.group; const h = document.createElement("div"); h.className = "lgroup"; h.textContent = group; wrap.appendChild(h); }
      const row = document.createElement("div"); row.className = "lever";
      row.innerHTML = `<div class="lrow"><label>${L.label}</label><span class="tag">${L.q}</span>
        <div class="stepper"><button class="stp" data-stp="-1" data-k="${L.key}" aria-label="Decrease">−</button><div class="num">${L.unit === "$M" ? "<i>$</i>" : ""}<input type="number" step="${L.step}" min="${L.min}" max="${L.max}" data-k="${L.key}">${L.unit === "%" ? "<i>%</i>" : L.unit === "$M" ? "<i>M</i>" : ""}</div><button class="stp" data-stp="1" data-k="${L.key}" aria-label="Increase">+</button></div></div>
        <div class="rng"><input type="range" min="${L.min}" max="${L.max}" step="${L.step}" data-k="${L.key}"><span class="was-tick" style="left:${((S.defaults[L.key] - L.min) / (L.max - L.min) * 100).toFixed(2)}%"></span></div>
        <div class="was-row"><span class="was-txt" data-was="${L.key}"></span><button class="lv-undo" data-undo="${L.key}" title="Put back to the loaded plan">↺ undo</button></div>`;
      row.dataset.k = L.key;
      row.querySelector("label").insertAdjacentHTML("beforeend", ' <span class="linfo">i</span>');
      row.addEventListener("mouseenter", () => showLeverTip(row, L));
      row.addEventListener("mouseleave", hideLeverTip);
      wrap.appendChild(row);
    });
    // − / + buttons: exact steps ($1M for spend levers, 1 unit otherwise)
    wrap.addEventListener("click", e => { const b = e.target.closest("[data-stp]"); if (!b) return;
      const L = LEVERS.find(x => x.key === b.dataset.k), st = L.unit === "$M" ? 1 : (L.key === "stores" ? 5 : 1);
      state.d[L.key] = Math.max(L.min, Math.min(L.max, Math.round((state.d[L.key] + st * +b.dataset.stp) * 100) / 100)); syncLevers(); update();
      const row = b.closest(".lever"); if (row) showLeverTip(row, L); });
    wrap.addEventListener("click", e => { const x = e.target.closest("[data-xp]"); if (!x) return;
      Object.assign(state.d, S.explore[+x.dataset.xp].change); syncLevers(); update(); });
    wrap.addEventListener("click", e => { const sv = e.target.closest("[data-setk]");
      if (sv) { state.d[sv.dataset.setk] = +sv.dataset.setv; syncLevers(); update(); hideLeverTip(); return; } });
    wrap.addEventListener("click", e => { const b = e.target.closest("[data-undo]"); if (!b) return;
      const k = b.dataset.undo; state.d[k] = (state.baseD || S.defaults)[k]; syncLevers(); update(); hideLeverTip(); });
    // Any change (drag, − / + buttons, typing a number, chips) fades the hover card so the quadrants stay visible
    let ghostT = null, dragging = false;
    const ghost = on => { const t = document.getElementById("levTip"); if (t) t.classList.toggle("ghost", on); };
    const ghostPulse = () => { ghost(true); clearTimeout(ghostT); ghostT = setTimeout(() => { if (!dragging) ghost(false); }, 1500); };
    wrap.querySelectorAll("input[type=range]").forEach(inp => {
      inp.addEventListener("pointerdown", () => { dragging = true; ghost(true); });
      ["pointerup", "pointercancel", "change"].forEach(ev => inp.addEventListener(ev, () => { dragging = false; ghostPulse(); }));
    });
    wrap.addEventListener("input", ghostPulse);
    wrap.addEventListener("click", e => { if (e.target.closest("button, [data-setk], [data-xp], [data-undo]")) ghostPulse(); });
    wrap.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.k; let v = parseFloat(inp.value);
        if (isNaN(v)) return;
        state.d[k] = v; syncLevers(inp); update();
        const row = inp.closest(".lever"), t = document.getElementById("levTip");
        if (row && t && t.style.display === "block") { const L = LEVERS.find(x => x.key === k); if (L) showLeverTip(row, L); }
      });
    });
  }
  // Hover tooltip: confidence, what it changes, hypothesis (untested), long-term call + live effect of your setting vs last round

  // ---------- Ask assistant (local: parses the question, runs our model, answers in plain English) ----------
  const ASK_LEVERS = [
    ["privateBrandQ", ["private brand quality", "own label quality", "own-label quality"], ["pbQuality"]],
    ["nationalBrandQ", ["national brand quality"], ["nbQuality"]],
    ["quality", ["quality"], ["pbQuality", "nbQuality"]],
    ["pb", ["private brand", "own label", "own-label"], ["pbLow", "pbHigh"]],
    ["exp", ["shopping experience", "store experience", "experience"], ["experience"]],
    ["svc", ["customer service", "service"], ["service"]],
    ["online", ["online", "website", "digital", "e-commerce"], ["online"]],
    ["vendor", ["vendor", "supplier"], ["vendor"]],
    ["analytics", ["analytics"], ["analytics"]],
    ["mkHigh", ["higher-cost markup", "higher cost markup", "premium markup", "markup higher", "markup on higher"], ["markupHigh"]],
    ["mkLow", ["lower-cost markup", "lower cost markup", "everyday markup", "markup lower", "markup on lower"], ["markupLow"]],
    ["mk", ["markup", "price"], ["markupLow", "markupHigh"]],
    ["brHigh", ["higher-cost breadth", "higher cost breadth", "premium breadth", "breadth higher"], ["breadthHigh"]],
    ["br", ["breadth", "assortment", "more products"], ["breadthLow"]],
    ["dp", ["depth", "inventory", "stock"], ["depthLow", "depthHigh"]],
    ["st", ["store", "retail coverage"], ["stores"]]
  ];
  const STEP = { experience: 2, service: 2, online: 2, vendor: 3, analytics: 1, markupLow: 2, markupHigh: 2, pbQuality: 1, nbQuality: 1, pbLow: 5, pbHigh: 5, breadthLow: 5, breadthHigh: 5, depthLow: 5, depthHigh: 5, stores: 10 };
  function askParse(q) {
    let t = " " + q.toLowerCase().replace(/[?!]/g, " ") + " ";
    t = t.replace(/\b(zero|nothing|nil)\b/g, "0").replace(/\bhalf\b/g, "50%").replace(/\bdouble\b/g, "100% more");
    let hit = null;
    for (const [id, words, keys] of ASK_LEVERS) { if (words.some(w => t.includes(w))) { hit = keys; break; } }
    if (!hit) return null;
    const up = /\b(raise|increase|more|add|higher|up|boost|grow|open|expand|spend more)\b/.test(t);
    const down = /\b(lower|cut|decrease|reduce|less|down|drop|trim|close|shrink|spend less|remove)\b/.test(t);
    const mm = t.match(/\$?\s*(\d+(?:\.\d+)?)\s*(m\b|%|percent|pts?\b|points?\b)?/) || [];
    const to = /\bto\s+\$?\s*\d/.test(t), by = /\bby\s+\$?\s*\d/.test(t);
    return { keys: hit, dir: down && !up ? -1 : up && !down ? 1 : (down ? -1 : 0), num: mm[1] == null ? null : +mm[1], pct: /%|percent/.test(mm[2] || ""), to, by };
  }
  // ---- Ask v2 helpers: tested range, official guidance, quadrant standing ----
  const GF = () => S.gameFairRatio || 2 / 3, FR = () => S.fairRatio || 0.75;
  function testedRange(k) {
    const v = (S.decisionLog || []).map(x => x.d && x.d[k]).filter(x => x != null).concat([S.defaults[k]]);
    return [Math.min(...v), Math.max(...v)];
  }
  const fmtL = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
  function quadStanding(v, i) {
    const { lead, who } = rivalLeaders(), L = lead[i], rk = quadRank(v, i);
    const line = v >= L * 0.95 ? (rk.rank === 1 ? "LEAD" : "near the lead") : v >= FR() * L ? "above fair value (75%)" : v >= GF() * L ? `above the game's fair line (≈${(GF() * L).toFixed(2)}) but below the slides' 75% (${(FR() * L).toFixed(2)})` : `BELOW fair value (game line ≈${(GF() * L).toFixed(2)})`;
    return `${Q[i]} <b>${v.toFixed(2)}</b> · ${rk.txt} · ${line}`;
  }
  function guideConflict(k, was, v) {
    const up = v > was, rel = was ? (v - was) / was : 1;
    if (k === "online" && v <= 0.01) return "Online is the professor's Frictionless lever and fair value is required in all four quadrants. $0 online goes against that, and how fast the score falls after a cut is untested.";
    if (k === "online" && rel <= -0.2) return "Online is the professor's Frictionless lever; Frictionless is already our weakest quadrant.";
    if (k === "vendor" && !up) return "The slides call vendor management the most reliable long-term lever (lower costs, can lower WACC). Our model only sees the saving.";
    if (k === "analytics" && !up) return "The slides call analytics a multiplier for shopping experience and online. Our model can't measure that, so the saving looks better than it is.";
    if (k === "stores" && up) return "The slides call stores the most common value trap ($1.75M each, more assets and debt). With two rounds left they can't pay back.";
    if (k === "experience" && rel <= -0.15) return "Shopping experience carries our Experience lead, one of our two leads. How fast the score falls after a cut is untested.";
    if (k === "service" && rel <= -0.1) return "Service is scored against rivals, who add 10–12% a round; cutting it drops Experience and Frictionless together.";
    if (["markupLow", "markupHigh"].includes(k) && Math.abs(v - was) >= 2) return "We have never changed markups (54% / 66% all game), so the size of the sales response is a guess.";
    return "";
  }
  const FINAL_RE = /final round|round 8|last round|end of the game|endgame|last year/;
  // A plan (several boxes) → full answer: short verdict, numbers, standing, professor's rule, how sure, what I'd do
  function askEval(q, base, d, changes, vsLbl) {
    const r0 = model(base), r1 = model(d), t = q.toLowerCase();
    const m = (x, dp = 0) => (x >= 0 ? "+" : "−") + "$" + Math.abs(x).toFixed(dp) + "M";
    const dMV = r1.mv - r0.mv, dNI = r1.niProj - r0.niProj, dRev = r1.revenue - r0.revenue;
    const dSpend = r1.spend - r0.spend, over = r1.spend > S.base.budget + 1e-6, err = r0.mv * 0.04;
    const k0 = changes[0][0].key, I = (S.leverInfo || {})[k0] || {};
    const moved = [0, 1, 2, 3].filter(i => Math.abs(r1.sc[i] - r0.sc[i]) >= 0.01);
    const newGap = [0, 1, 2, 3].filter(i => { const L = rivalLeaders().lead[i]; return r1.sc[i] < GF() * L && r0.sc[i] >= GF() * L; });
    const conflicts = changes.map(([L, a, b]) => guideConflict(L.key, a, b)).filter(Boolean);
    const untested = changes.filter(([L, a, b]) => { const [lo, hi] = testedRange(L.key); return b < lo - 1e-9 || b > hi + 1e-9; });
    const lowConf = changes.filter(([L]) => ((S.leverInfo || {})[L.key] || {}).conf === "Low");
    // verdict (most serious first)
    let v, cls;
    if (over) { v = `The game won't accept it: ${fmtM(r1.spend - S.base.budget)} over the ${fmtM(S.base.budget)} budget.`; cls = "no"; }
    else if (r1.leads < r0.leads) { v = "Don't do it: we'd lose a quadrant lead, and leading two quadrants is the professor's main rule for market value."; cls = "no"; }
    else if (newGap.length) { v = `Not advised: ${newGap.map(i => Q[i]).join(" and ")} would drop below fair value, which the professor says we must hold in all four quadrants.`; cls = "no"; }
    else if (conflicts.length && dMV > 0) { v = `Our model shows ${m(dMV)}, but I wouldn't do it: it goes against the professor's guidance, and that effect isn't in our model, so the gain isn't verified.`; cls = "no"; }
    else if (untested.length || lowConf.length) { v = `Untested ground: our model says ${m(dMV)}, but we've never tried ${(untested.length ? untested : lowConf).map(([L, a, b]) => `${L.label.toLowerCase()} at ${fmtL(L, b)}`).join(" or ")}, so treat the number as a guess.${dMV > err ? " If you want it, take a small step." : ""}`; cls = "meh"; }
    else if (dMV > err) { v = `Worth doing: about ${m(dMV)} of value, more than the model's error (≈${m(err).replace("+", "")}), with no lead or fair value lost.`; cls = "yes"; }
    else if (dMV < -err) { v = `Not recommended: it costs about ${m(dMV).replace("−", "")} of value.`; cls = "no"; }
    else { v = `About neutral: ${m(dMV)} is within the model's error (±${m(err).replace("+", "")}). Decide on the quadrant effects below.`; cls = "meh"; }
    // confidence
    let conf = (I.conf || "Medium");
    if (untested.length || conflicts.length || lowConf.length) conf = "Low"; else if (changes.length > 1 && conf === "High") conf = "Medium";
    // numbers
    const chain = [];
    if (Math.abs(dSpend) >= 0.05) chain.push(`Budget: we ${dSpend > 0 ? "spend" : "save"} <b>$${Math.abs(dSpend).toFixed(1)}M</b> (${fmtM(r1.spend)} of ${fmtM(S.base.budget)}).`);
    if (Math.abs(dRev) >= 0.5) chain.push(`Revenue ${dRev > 0 ? "rises" : "falls"} ≈${m(dRev)}.`);
    chain.push(`Net income ${dNI >= 0 ? "+" : "−"}$${Math.abs(dNI).toFixed(1)}M → market value (P/E × profit) <b>${m(dMV)}</b>: ${fmtM(r0.mv)} → ${fmtM(r1.mv)} (likely range ${fmtM(r1.mv * 0.92)}–${fmtM(r1.mv * 1.08)}).`);
    const stand = (moved.length ? moved : []).map(i => `<li>${quadStanding(r1.sc[i], i)} <span class="mut">(${r1.sc[i] >= r0.sc[i] ? "+" : "−"}${Math.abs(r1.sc[i] - r0.sc[i]).toFixed(2)})</span></li>`).join("");
    // professor's guidance + how sure
    const G = S.guide || {}, gl = [...new Set(changes.map(([L]) => G[L.key]).filter(Boolean))];
    const sure = changes.map(([L, a, b]) => { const [lo, hi] = testedRange(L.key), avg = (S.indAvgNext || {})[L.key] || (S.indAvgNow || {})[L.key];
      return `${L.label}: we've played ${fmtL(L, lo)}–${fmtL(L, hi)}${b < lo - 1e-9 || b > hi + 1e-9 ? ` → <b>${fmtL(L, b)} is outside that</b>` : ""}${avg ? `; rivals' average ≈$${(+avg).toFixed(1)}M (${(b / avg).toFixed(1)}×)` : ""}.`; });
    const fin = FINAL_RE.test(t);
    const doIt = cls === "yes" ? "Do it." : `Stick with Plan A (${changes.map(([L]) => `${L.label.toLowerCase()} ${fmtL(L, (recPlanD())[L.key])}`).join(", ")})${cls === "meh" ? " unless the team wants to test it with a small step" : ""}.`;
    const what = changes.map(([L, a, b]) => `${L.label} ${fmtL(L, a)} → <b>${fmtL(L, b)}</b>`).join(", ");
    return `<div class="ask-short ${cls}"><b>Short answer:</b> ${v}</div>
      <div class="ask-what">${what} <span class="mut">(${vsLbl})</span></div>
      ${fin ? `<div class="ask-hyp"><b>Final round:</b> our model scores the next round, so read the numbers as direction only. Final-round call: ${changes.map(([L]) => `<b>${L.label}</b>: ${(S.finalCall || {})[L.key] || "hold"}`).join(" ")}</div>` : ""}
      ${changes.length === 1 && I.what ? `<div class="ask-plain"><b>How it works:</b> ${I.what} ${changes[0][2] > changes[0][1] ? (I.up || "") : (I.down || "")}</div>` : ""}
      <div class="ask-sub">What our model says</div><ul class="ask-chain">${chain.map(c => `<li>${c}</li>`).join("")}${stand}</ul>
      ${gl.length ? `<div class="ask-data"><b>Professor's guidance</b><ul>${gl.map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
      ${conflicts.length ? `<div class="ask-hyp"><b>⚠ Goes against the guidance:</b> ${conflicts.join(" ")}</div>` : ""}
      <div class="ask-data"><b>How sure</b><ul>${sure.map(x => `<li>${x}</li>`).join("")}<li>Model error on market value: ≈4% average over Rounds 2–6 (worst 7%).</li></ul></div>
      <div class="ask-rec"><b>What I'd do:</b> ${doIt}</div>${confPill(conf)}`;
  }
  function recPlanD() { const rec = (S.plans || []).find(p => p.badge === "Recommended") || {}; return Object.assign({}, S.defaults, rec.levers || {}); }
  // Status, plans, model accuracy, guidance, risk, "what moves X": answered from live numbers
  function askIntent(q, d, P) {
    const t = q.toLowerCase(), r = model(d), change = P && (P.dir !== 0 || P.num != null);
    const li = (a) => `<ul class="ask-chain">${a.map(x => `<li>${x}</li>`).join("")}</ul>`;
    const qi = Q.findIndex(n => t.includes(n.toLowerCase())) >= 0 ? Q.findIndex(n => t.includes(n.toLowerCase())) : /friction/.test(t) ? 3 : /low.?price|price score/.test(t) ? 2 : -1;
    // rivals push: rivals' service +15% (we assume +10%) and Zephara Experience +0.3
    if (/(zephara|rivals?|competitors?|cadabra|bestco|pricemart|kt benny|\baim\b)[^.]*\b(raise|raises|push|pushes|spend more|spends more|catch|catches|increase|increases|add|adds|beat|overtake)/.test(t)) {
      const keep = { a: S.indAvgNext, z: S.rivals.Zephara };
      S.indAvgNext = Object.assign({}, S.indAvgNext, { service: (S.indAvgNow || {}).service * 1.20 }); S.rivals.Zephara = S.rivals.Zephara.slice(); S.rivals.Zephara[1] += 0.3;
      let rp; try { rp = model(d); } finally { S.indAvgNext = keep.a; S.rivals.Zephara = keep.z; }
      const z = (S.rivals.Zephara[1] + 0.3), holds = rp.sc[1] > z;
      return `<div class="ask-short ${holds ? "yes" : "no"}"><b>Short answer:</b> ${holds ? `Yes, with these sliders we keep Experience #1 even if rivals push harder: ${rp.sc[1].toFixed(2)} vs Zephara ≈${z.toFixed(2)}` : `No: Experience ${rp.sc[1].toFixed(2)} would fall behind Zephara ≈${z.toFixed(2)}`}.</div>
        <div class="ask-sub">Stress test: rivals raise service 20% (we plan for ${Math.round(((S.indAvgNext || {}).service / (S.indAvgNow || {}).service - 1) * 100)}%) and Zephara's Experience jumps +0.3</div>
        ${li([`Normal case: Experience ${r.sc[1].toFixed(2)}, Frictionless ${r.sc[3].toFixed(2)}, value ${fmtM(r.mv)}.`, `Rivals push: Experience <b>${rp.sc[1].toFixed(2)}</b>, Frictionless <b>${rp.sc[3].toFixed(2)}</b> (game fair line ≈${(GF() * rivalLeaders().lead[3]).toFixed(2)}), value ${fmtM(rp.mv)}.`, "Service is scored against rivals' average, so it is the lever that answers a rival push; shopping experience builds slowly (25% of the gap a round)."])}
        <div class="ask-rec"><b>What I'd do:</b> ${holds ? "Keep Plan A's service ($32M). Watch Zephara's Experience each round; if it passes 7.0, raise service in the final round." : "Raise service by $2–4M before submitting."}</div>${confPill("Medium")}`;
    }
    // what moves a quadrant
    if (/what (else )?(moves|drives|affects|raises|lifts|improves|helps|changes)|how (do|can) we (raise|improve|lift|increase|grow|fix)|levers? for/.test(t) && qi >= 0) {
      const tests = [["online", 1], ["service", 1], ["analytics", 1], ["experience", 1], ["vendor", 1], ["markupLow", -1], ["pbQuality", 1], ["nbQuality", 1], ["depthHigh", 1]];
      const off = { Brand: "Private + national brand quality (high-quality brands)", Experience: "Shopping experience, customer service, customer analytics", "Low Price": "Vendor management, markup", Frictionless: "Online, customer service, customer analytics" }[Q[qi]];
      const rows = tests.map(([k, st]) => { const dd = Object.assign({}, d); dd[k] += st; const r1 = model(dd); return [k, st, r1.sc[qi] - r.sc[qi], r1.mv - r.mv]; }).filter(x => Math.abs(x[2]) >= 0.005).sort((a, b) => b[2] - a[2]);
      const lbl = k => LEVERS.find(L => L.key === k).label, stp = (k, s) => { const L = LEVERS.find(x => x.key === k); return L.unit === "$M" ? "+$1M" : s < 0 ? "−1 pt" : "+1"; };
      const conf = { service: "High", online: "Medium", analytics: "Low", experience: "Medium", vendor: "Medium", markupLow: "Low", pbQuality: "Medium", nbQuality: "Medium", depthHigh: "Medium" };
      return `<div class="ask-short meh"><b>Short answer:</b> the professor's map says <b>${Q[qi]}</b> moves with: ${off}.</div>
        <div class="ask-sub">Measured in our data (per step, from your current sliders)</div>
        ${li(rows.map(([k, st, dq, dv]) => `${lbl(k)} ${stp(k, st)} → ${Q[qi]} <b>+${dq.toFixed(2)}</b> · value ${dv >= 0 ? "+" : "−"}$${Math.abs(dv).toFixed(0)}M <span class="mut">(${conf[k] || "Medium"})</span>`))}
        ${qi === 3 ? `<div class="ask-plain">Service is the strongest Frictionless lever per dollar (≈5× online) because it is scored against rivals' spend and counts for Experience too. Online builds slowly (60% capitalized, position 1.4) and analytics is the slides' multiplier, but we've never measured it cleanly. Breadth, depth and stores don't move the matrix.</div>` : ""}
        <div class="ask-rec"><b>What I'd do:</b> ${qi === 3 ? "Use service (Plan A $32M) and hold online $16M + analytics $6M. Don't cut online." : qi === 1 ? "Service first, shopping experience second; keep analytics as the multiplier." : qi === 0 ? "Hold quality 7/7 and premium depth 30; Brand is already #1 by 0.7." : "Hold vendor $18M and markups 54/66: Low Price is already above fair value."}</div>${confPill("Medium")}`;
    }
    // compare plans
    if (/plan\s*[abc]\b.*\b(vs|versus|or|better|compare|than|difference)|\bcompare\b.*plan|which plan|why plan/.test(t)) {
      const ps = S.plans || [];
      return `<div class="ask-short yes"><b>Short answer:</b> Plan ${(ps.find(p => p.badge === "Recommended") || ps[0]).id} is recommended: it follows the professor's rules with the fewest changes. Gaps between plans are mostly inside the model's error (±8%), so the rules and the risk labels decide.</div>
        <table class="ask-tbl"><tr><th></th>${ps.map(p => `<th>Plan ${p.id}</th>`).join("")}</tr>
        ${[["Market value", p => fmtM(model(Object.assign({}, S.defaults, p.levers)).mv)], ["Net income", p => "$" + model(Object.assign({}, S.defaults, p.levers)).niProj.toFixed(1) + "M"], ["Spend", p => fmtM(model(Object.assign({}, S.defaults, p.levers)).spend)],
           ...Q.map((n, i) => [n, p => model(Object.assign({}, S.defaults, p.levers)).sc[i].toFixed(2)]), ["Leads", p => model(Object.assign({}, S.defaults, p.levers)).leads], ["Label", p => p.badge]]
          .map(([n, f]) => `<tr><td>${n}</td>${ps.map(p => `<td>${f(p)}</td>`).join("")}</tr>`).join("")}</table>
        ${li(ps.map(p => `<b>Plan ${p.id} · ${p.name}:</b> ${p.why[0]}`))}<div class="ask-rec"><b>What I'd do:</b> Plan ${(ps.find(p => p.badge === "Recommended") || ps[0]).id}. Extra value in a "Riskier" plan rests on effects we can't verify.</div>${confPill("Medium")}`;
    }
    // model accuracy
    if (/accura|trust the model|how good is the model|model error|reliable is the model|how reliable|track record/.test(t)) {
      const C = (S.endgame || {}).check || {};
      return `<div class="ask-short meh"><b>Short answer:</b> within ≈4% on market value on average (worst 7%), quadrant scores within 0.15, when we replay Rounds 2–6 from their real starting points.</div>
        ${li((C.rows || []).map(([a, b]) => `${a}: ${b}`))}<div class="ask-data"><b>Verified</b><ul>${(C.verified || []).map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="ask-hyp"><b>Untested (treat as guesses):</b> ${(C.untested || []).join("; ")}.</div>
        <div class="ask-rec"><b>What it means:</b> differences under ≈$55M between two plans are inside the error. Decide those on the professor's rules and quadrant positions, not the value number.</div>${confPill("High")}`;
    }
    // risk of the current plan or a lever
    if (/\brisk|safe\b|safer|sure\b|danger|worried|confident/.test(t) && !(P && P.dir !== 0)) {
      const k = P && P.keys && P.keys[0];
      if (k) { const L = LEVERS.find(x => x.key === k), [lo, hi] = testedRange(k), v = P.num != null && !P.pct ? P.num : d[k], avg = (S.indAvgNext || {})[k] || (S.indAvgNow || {})[k], I = (S.leverInfo || {})[k] || {}, sp = k === "service" && avg ? 2.2 * v / avg : null, out = sp != null ? sp > Math.max(3.7, (S.posNow || {}).svc || 0) + 0.1 : v < lo - 1e-9 || v > hi + 1e-9;
        return `<div class="ask-short ${out ? "meh" : "yes"}"><b>Short answer:</b> ${L.label} at ${fmtL(L, v)} is ${sp != null ? (out ? `a service position ≈${sp.toFixed(2)}, <b>above anything we've played</b> (3.7), so the size of its effect is a guess` : `a service position ≈${sp.toFixed(2)} against rivals' expected spending: <b>inside what we've played</b> (up to 3.7), even though the dollar amount is new`) : out ? `<b>outside what we've tested</b> (${fmtL(L, lo)}–${fmtL(L, hi)}), so the size of its effect is a guess` : `inside what we've tested (${fmtL(L, lo)}–${fmtL(L, hi)})`}.</div>
          ${li([avg ? `Rivals' average ≈$${(+avg).toFixed(1)}M → we'd be at ${(v / avg).toFixed(1)}×.` : "", I.data && I.data[0], k === "service" ? `What matters is the position, not the dollars: $${(+v).toFixed(1)}M against rivals' expected $${(+(S.indAvgNext || {}).service).toFixed(1)}M gives a service position ≈${(2.2 * v / (S.indAvgNext || {}).service).toFixed(2)} (now ${(S.posNow || {}).svc}; we've already played up to 3.7). Worst case if returns flatten: we overpay a few $M; it doesn't cost a lead.` : "", (S.guide || {})[k] ? "Professor: " + S.guide[k] : ""].filter(Boolean))}
          <div class="ask-rec"><b>What I'd do:</b> ${I.longTerm || "Hold Plan A's value"}.</div>${confPill(out ? "Low" : I.conf || "Medium")}`; }
      const fl = riskFlags(d);
      return `<div class="ask-short ${fl.length ? "meh" : "yes"}"><b>Short answer:</b> ${fl.length ? `${fl.length} thing${fl.length > 1 ? "s" : ""} to double-check in the current sliders` : "nothing risky in the current sliders"}.</div>
        ${fl.length ? li(fl.map(f => `<b>${f.label}</b>${f.from != null ? ` ${f.from} → ${f.to}` : ""}: ${f.why}`)) : ""}
        <div class="ask-hyp"><b>Untested in general:</b> ${(((S.endgame || {}).check || {}).untested || []).join("; ")}.</div>${confPill("Medium")}`;
    }
    // where we stand / leads / fair value
    if (!change && /(lead|leading|rank|#1|number one|winning|ahead|behind|fair value|where (do|are) we|standing|status|two quadrants|2 quadrants)/.test(t)) {
      const now = S.rivals[S.company];
      return `<div class="ask-short ${r.leads >= 2 ? "yes" : "meh"}"><b>Short answer:</b> ${r.leads >= 2 ? "Yes: these sliders keep two leads (Brand + Experience)" : `These sliders lead ${r.leads} quadrant${r.leads === 1 ? "" : "s"}`}${r.gaps ? `; ${r.cls.filter(c => c.status === "GAP").map(c => c.q).join(", ")} is below the slides' 75% fair value` : "; fair value everywhere"}.</div>
        <div class="ask-sub">Now (Round ${S.round} status, real game data)</div>${li(now.map((v, i) => quadStanding(v, i)))}
        <div class="ask-sub">After these sliders (projected)</div>${li(r.sc.map((v, i) => quadStanding(v, i)))}
        <div class="ask-plain">Professor: lead (or be close to) two quadrants and hold fair value (75% of the leader) in the other two. The game's chart draws its fair line near 2/3.</div>${confPill("High")}`;
    }
    // projected value
    if (!change && /(market value|value|worth).*(be|end|get|look|reach)|what will|projected|forecast|how much (will|would|can)|how high/.test(t)) {
      const fr = (((S.endgame || {}).steps || [])[1] || [])[2] || "";
      return `<div class="ask-short meh"><b>Short answer:</b> about <b>${fmtM(r.mv)}</b> after this round with these sliders (likely ${fmtM(r.mv * 0.92)}–${fmtM(r.mv * 1.08)}); about $1.62–1.67B after a steady final round.</div>
        ${li([`Value = P/E × net income: ${r.pe.toFixed(1)} × $${r.niProj.toFixed(1)}M.`, `Now: ${fmtM(S.base.marketValue)} (Round ${S.round} status).`, "Final round: " + fr])}${confPill("Medium")}`;
    }
    // professor / rules
    if (/professor|slides?\b|guideline|official|by the book|kahn|rules?\b|course material/.test(t)) {
      const k = P && P.keys && P.keys[0];
      if (k && !change) return `<div class="ask-short meh"><b>Short answer:</b> ${(S.guide || {})[k] || "The slides don't single this lever out."}</div><div class="ask-rec"><b>How we apply it:</b> ${((S.leverInfo || {})[k] || {}).longTerm || ""}. Final round: ${(S.finalCall || {})[k] || "hold"}</div>${confPill("High")}`;
      if (!k) { const chk = [[r.leads >= 2, `Lead two quadrants: ${r.leads} lead${r.leads === 1 ? "" : "s"}`], [!r.gaps, `Fair value in the other two: ${r.gaps ? r.cls.filter(c => c.status === "GAP").map(c => c.q + " " + c.score.toFixed(2) + " vs 75% " + c.fair.toFixed(2)).join(", ") : "yes"}`], [r.spend <= S.base.budget + 1e-6, `Within budget: ${fmtM(r.spend)} of ${fmtM(S.base.budget)}`], [r.roic > r.wacc, `ROIC beats WACC: ${(r.roic - r.wacc).toFixed(1)} pts`]];
        return `<div class="ask-short meh"><b>Short answer:</b> the professor's rules, checked against your current sliders.</div>${li(chk.map(([ok, x]) => `${ok ? "✓" : "✗"} ${x}`))}<div class="ask-data"><b>The official rules</b><ul>${((S.guide || {}).general || []).map(x => `<li>${x}</li>`).join("")}</ul></div>${confPill("High")}`; }
    }
    return null;
  }
  function askAnswer(q, baseOverride) {
    const base = baseOverride ? Object.assign({}, baseOverride) : recPlanD();
    const vsLbl = baseOverride ? "vs your current sliders" : "vs Plan A";
    let P = askParse(q);
    const tl = q.toLowerCase(), faqHit = (S.faq || []).find(x => x.keys.some(k => tl.includes(k)));
    const intent = askIntent(q, base, P); if (intent) return intent;
    if (P && faqHit && P.dir === 0 && P.num == null) P = null;   // no raise/cut/number → it's a "how does it work / what should we do" question
    // several boxes in one question ("cut vendor to 15 and analytics to 4")
    const multi = askPlan(q, base);
    if (multi.changes.length >= 2) return askEval(q, base, multi.d, multi.changes, vsLbl);
    if (!P) {
      if (!faqHit) return `<div class="ask-short meh"><b>I didn't catch a lever or topic in that.</b></div><p>Try:</p><ul><li><b>What-ifs:</b> “Cut online to $10M?”, “Service 30 instead of 32?”, “Cut vendor to 15 and analytics to 4”</li><li><b>Status:</b> “Are we leading two quadrants?”, “What will our market value be?”, “How accurate is the model?”</li><li><b>Rules + risk:</b> “What does the professor say about vendor?”, “Is service at 32 risky?”, “What moves Frictionless?”, “Plan A vs B?”</li></ul><p class="mut">For anything else, tap ✦ Ask Claude below and paste it into the chat.</p>`;
      return `<div class="ask-short meh"><b>Short answer:</b> ${faqHit.rec || ""}</div><div class="ask-plain">${faqHit.a}</div>${confPill(faqHit.conf || "Medium")}`;
    }
    const d = Object.assign({}, base), changes = [];
    P.keys.forEach(k => {
      const L = LEVERS.find(x => x.key === k); if (!L) return;
      const was = base[k]; let v;
      const rel = P.pct && L.unit !== "%";   // "cut experience by 25%" → relative change
      if (P.num != null && P.to) v = rel ? was * P.num / 100 : P.num;
      else if (P.num != null && P.dir === 0 && !P.by) v = rel ? was * P.num / 100 : P.num;
      else if (P.num != null) v = rel ? was * (1 + (P.dir || 1) * P.num / 100) : was + (P.dir || 1) * P.num;
      else v = was + (P.dir || 1) * STEP[k];
      v = Math.max(L.min, Math.min(L.max, Math.round(v * 100) / 100));
      d[k] = v; changes.push([L, was, v]);
    });
    if (changes.every(([L, a, b]) => Math.abs(a - b) < 1e-9)) {
      const L = changes[0][0];
      return `<div class="ask-short meh"><b>Short answer:</b> ${L.label} is already ${fmtL(L, changes[0][1])} in ${baseOverride ? "your sliders" : "Plan A"}, so nothing changes.</div><p>Ask “Is ${L.label.toLowerCase()} at ${fmtL(L, changes[0][1])} risky?” or “What if we raise ${L.label.toLowerCase()} to …?”</p>`;
    }
    return askEval(q, base, d, changes, vsLbl);
  }
  // Hypothesis → plan: "experience to 24 and cut vendor by 2, breadth 60" → several lever changes applied together
  function askPlan(q, base) {
    const d = Object.assign({}, base), changes = [];
    String(q).split(/\s*(?:,|;|\band\b|\bthen\b|\bplus\b|&)\s*/i).filter(x => x.trim()).forEach(cl => {
      const P = askParse(cl); if (!P) return;
      if (P.dir === 0 && P.num == null) return;   // a question about a lever, not a change
      P.keys.forEach(k => { const L = LEVERS.find(x => x.key === k); if (!L) return;
        const was = d[k]; let v;
        if (P.num != null && P.to) v = P.num; else if (P.num != null && P.dir === 0) v = P.num; else if (P.num != null) v = was + P.dir * P.num; else v = was + P.dir * STEP[k];
        v = Math.max(L.min, Math.min(L.max, Math.round(v * 100) / 100)); if (Math.abs(v - was) < 1e-9) return;
        d[k] = v; const i = changes.findIndex(c => c[0] === L); if (i >= 0) changes[i][2] = v; else changes.push([L, was, v]); });
    });
    return { d, changes };
  }
  function planSummary(before, after, changes) {
    const r0 = model(before), r1 = model(after), dv = r1.mv - r0.mv, over = r1.spend > S.base.budget + 1e-6;
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
    const qd = r1.sc.map((v, i) => [Q[i], v - r0.sc[i]]).filter(x => Math.abs(x[1]) >= 0.01);
    return `<div class="hp-ch">${changes.map(([L, a, b]) => `<span>${L.label}: ${fmt(L, a)} → <b>${fmt(L, b)}</b></span>`).join("")}</div>
      <div class="hp-res"><div><small>Market value</small><b>${fmtM(r1.mv)}</b><i class="${dv >= 0 ? "up" : "dn"}">${dv >= 0 ? "+" : "−"}$${Math.abs(dv).toFixed(0)}M</i></div>
        <div><small>Experience</small><b>${r1.sc[1].toFixed(2)} ${r1.sc[1] >= r1.cls[1].leader ? "#1" : "#2"}</b></div>
        <div><small>Spend</small><b style="${over ? "color:#b42318" : ""}">${fmtM(r1.spend)}${over ? " ⚠ over" : ""}</b><i>of ${fmtM(S.base.budget)}</i></div></div>
      ${qd.length ? `<div class="hp-q">Quadrants: ${qd.map(([n, v]) => `${n} ${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`).join(" · ")}</div>` : ""}
      ${confPill("Medium")}`;
  }
  // Suggested questions that follow the current plan and the last question (refresh after every answer and slider change)
  const askSeen = new Set(); let askLast = "", askRun = null;
  const ASK_NAME = { vendor: "vendor management", online: "online", experience: "shopping experience", service: "customer service", analytics: "analytics", markupLow: "lower-cost markup", markupHigh: "higher-cost markup", pbQuality: "private brand quality", nbQuality: "national brand quality", pbLow: "private brand", pbHigh: "private brand", breadthLow: "breadth", breadthHigh: "higher-cost breadth", depthLow: "depth", depthHigh: "depth", stores: "stores" };
  function askSuggest(d) {
    const r = model(d), exp = r.cls[1], left = S.base.budget - r.spend, out = [], add = q => { if (q && !askSeen.has(q) && !out.includes(q)) out.push(q); };
    const amt = v => "$" + (+(+v).toFixed(1)) + "M";
    const P = askLast ? askParse(askLast) : null;
    if (P && P.keys && P.keys[0]) { const k = P.keys[0], L = LEVERS.find(x => x.key === k), nm = ASK_NAME[k] || L.label.toLowerCase(), st = STEP[k] || 1, unit = L.unit === "$M" ? "$" + st + "M" : st + (L.unit === "%" ? " points" : "");
      add(`${P.dir < 0 ? "Raise" : "Cut"} ${nm} by ${unit} instead?`); add(`${P.dir < 0 ? "Cut" : "Raise"} ${nm} by ${L.unit === "$M" ? "$" + st * 2 + "M" : st * 2 + (L.unit === "%" ? " points" : "")}?`); }
    if (left < -1e-6) add(`Cut vendor management by ${amt(Math.ceil(-left * 2) / 2)}?`);
    else if (left >= 0.5) add(`Raise shopping experience by ${amt(Math.floor(left * 2) / 2)}?`);
    if (r.sc[1] < exp.leader) add("Raise shopping experience by $2M?"); else add("Cut customer service by $1M?");
    if (Math.abs(d.online - S.defaults.online) > 1e-9) add(`Online back to ${amt(S.defaults.online)}?`); else add("Cut online by $2M?");
    if (d.breadthLow < 55) add("Breadth to 55?"); else if (d.breadthLow < 60) add("Breadth to 60?");
    if (d.pbQuality < 7) add("Raise quality to 7?");
    add("Raise markup by 2 points?");
    const faq = ["How do we pay down debt?", "How is market value calculated?", "What does the analytics score mean?", "Do we get more budget if we make more?", "How do we beat $1.5B?"].filter(q => !askSeen.has(q));
    const picks = out.slice(0, 3); if (faq.length) picks.push(faq[askSeen.size % faq.length]);
    return picks;
  }
  function renderAskSugg() {
    const box = document.querySelector(".qa-sugg"); if (!box || !askRun) return;
    box.innerHTML = `<span class="qa-try">Try:</span>` + askSuggest(state.d).map(x => `<button type="button" class="ask-s">${x}</button>`).join("");
    box.querySelectorAll(".ask-s").forEach(b => b.onclick = () => askRun(b.textContent));
  }
  // Paste a plan → sliders: reads "Label: value" lines (game export, Mike's tool, a chat message) and maps labels to levers
  const PASTE_MAP = [
    [/national.*quality|quality.*national|\bnb\b.*quality/, "nbQuality"], [/(private|own).*quality|quality.*(private|own)|\bpb\b.*quality/, "pbQuality"],
    [/(private|own).*(higher|high)|(higher|high).*(private|own)/, "pbHigh"], [/(private|own).*(lower|low)|(lower|low).*(private|own)/, "pbLow"],
    [/markup.*(higher|high)|(higher|high).*markup/, "markupHigh"], [/markup.*(lower|low)|(lower|low).*markup/, "markupLow"],
    [/breadth.*(higher|high)|(higher|high).*breadth/, "breadthHigh"], [/breadth.*(lower|low)|(lower|low).*breadth/, "breadthLow"],
    [/depth.*(higher|high)|(higher|high).*depth/, "depthHigh"], [/depth.*(lower|low)|(lower|low).*depth/, "depthLow"],
    [/online/, "online"], [/service/, "service"], [/experience/, "experience"], [/vendor/, "vendor"], [/analytic/, "analytics"], [/stores?\b|retail coverage/, "stores"]
  ];
  const PASTE_SKIP = /budget|spend|remaining|status|target|priority|hypothesis|verify|other|round|team|draft|note/;
  function parsePlan(txt) {
    const got = {}, skipped = [], unread = [];
    String(txt).split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([^:=]{2,60})[:=]\s*(.+)$/); if (!m) return;
      const lab = m[1].toLowerCase().replace(/[-_]/g, " ").trim(), val = m[2];
      if (PASTE_SKIP.test(lab)) { skipped.push(m[1].trim()); return; }
      const hit = PASTE_MAP.find(([re]) => re.test(lab)); if (!hit) { unread.push(m[1].trim()); return; }
      const num = parseFloat(val.replace(/[$,\s]/g, "").replace(/[a-z%]+$/i, "")); if (isNaN(num)) { unread.push(m[1].trim()); return; }
      const L = LEVERS.find(x => x.key === hit[1]); got[hit[1]] = Math.max(L.min, Math.min(L.max, num));
    });
    return { got, skipped, unread };
  }
  function initPaste() {
    if (!$("#ppGo") || $("#ppGo").dataset.on) return; $("#ppGo").dataset.on = 1;
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
    $("#ppGo").onclick = () => {
      const P = parsePlan($("#ppIn").value), keys = Object.keys(P.got);
      if (!keys.length) { $("#ppOut").innerHTML = `<div class="pp-msg warn">I couldn't find any slider values. Use lines like “Online investment: $13.5m” or “Stores: 185”.</div>`; return; }
      const before = Object.assign({}, state.d); keys.forEach(k => state.d[k] = P.got[k]); syncLevers(); update();
      const ch = LEVERS.filter(L => Math.abs(state.d[L.key] - before[L.key]) > 1e-9), r = model(state.d), over = r.spend > S.base.budget + 1e-6;
      const missing = LEVERS.filter(L => !(L.key in P.got)).map(L => L.label);
      $("#ppOut").innerHTML = `<div class="pp-msg"><div class="hp-top"><b>✓ Read ${keys.length} of ${LEVERS.length} boxes · ${ch.length} slider${ch.length === 1 ? "" : "s"} moved</b><button type="button" class="hp-undo" id="ppUndo">↶ Undo</button></div>
        ${ch.length ? `<div class="hp-ch">${ch.map(L => `<span>${L.label}: ${fmt(L, before[L.key])} → <b>${fmt(L, state.d[L.key])}</b></span>`).join("")}</div>` : "<div>Every value already matched the sliders.</div>"}
        <div class="hp-res"><div><small>Market value</small><b>${fmtM(r.mv)}</b><i>Medium</i></div><div><small>Experience</small><b>${r.sc[1].toFixed(2)} ${r.sc[1] >= r.cls[1].leader ? "#1" : "#2"}</b><i>High</i></div><div><small>Spend</small><b style="${over ? "color:#b42318" : ""}">${fmtM(r.spend)}${over ? " ⚠ over" : ""}</b><i>of ${fmtM(S.base.budget)}</i></div></div>
        ${missing.length ? `<div class="pp-note">Not in the paste, left as they were: ${missing.join(", ")}.</div>` : ""}${P.unread.length ? `<div class="pp-note">Couldn't match: ${P.unread.join(", ")}.</div>` : ""}</div>`;
      $("#ppUndo").onclick = () => { state.d = before; syncLevers(); update(); $("#ppOut").innerHTML = `<div class="pp-msg">Undone: sliders are back where they were.</div>`; };
    };
  }
  // Hand-off to Claude (this chat): copy the question + everything Claude needs to answer it well
  function claudeBrief(q, d) {
    d = d || state.d; const r = model(d), B = S.base, R = (S.rounds || []).slice(-1)[0] || {}, k = R.kpi || {};
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
    const ch = LEVERS.filter(L => Math.abs(d[L.key] - S.defaults[L.key]) > 1e-9);
    const pos = (S.positions && S.positions.rows || []).slice(0, 3).map(x => `${x[0]} ${x[1]} (Zephara ${x[6]})`).join("; ");
    return [
      `QUESTION: ${q}`, "",
      `CONTEXT (Getchells Copilot, Team 4) — Round ${S.round} input screen → Round ${S.round + 1} status. Model data ${S.dataVersion}.`,
      `Status now: MV $${k.marketValue}M (${k.mvChange}%), net income $${k.netIncome}M, revenue $${k.revenue}M, P/E ${B.pe}, WACC ${B.wacc}%, cash $${B.cash}M, LT debt $${B.debt}M, budget $${B.budget}M.`,
      `Matrix now [Brand, Experience, Low Price, Frictionless]: us ${(S.rivals[S.company] || []).join(" / ")}; Zephara ${(S.rivals.Zephara || []).join(" / ")}.`,
      `Positions: ${pos}. Industry avg spend now: service $${(S.indAvgNow || {}).service}M, experience $${(S.indAvgNow || {}).experience}M, online $${(S.indAvgNow || {}).online}M.`, "",
      `CURRENT SLIDERS: ${LEVERS.map(L => `${L.label} ${fmt(L, d[L.key])}`).join("; ")}.`,
      `Changes vs last round: ${ch.length ? ch.map(L => `${L.label} ${fmt(L, S.defaults[L.key])} → ${fmt(L, d[L.key])}`).join("; ") : "none"}.`,
      `Model projection: MV ≈ $${r.mv.toFixed(0)}M, net income ≈ $${r.niProj.toFixed(1)}M, revenue ≈ $${r.revenue.toFixed(0)}M, P/E ≈ ${(r.pe || B.pe).toFixed(2)}, quadrants ${r.sc.map(x => x.toFixed(2)).join(" / ")}, leads ${r.leads}, spend $${r.spend.toFixed(2)}M of $${B.budget}M.`
    ].join("\n");
  }
  function claudeBtn(q, d) {
    const id = "cb" + Math.random().toString(36).slice(2, 8);
    setTimeout(() => { const b = document.getElementById(id); if (!b) return; b.onclick = () => {
      const t = claudeBrief(q, d); const done = () => { b.textContent = "✓ Copied: paste it into the Claude chat"; b.classList.add("ok"); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done).catch(() => { prompt("Copy this and paste it into the Claude chat:", t); });
      else prompt("Copy this and paste it into the Claude chat:", t); }; }, 0);
    return `<button type="button" class="ask-claude" id="${id}">✦ Ask Claude about this <small>copies your question + the full plan context</small></button>`;
  }
  function confPill(c) { const col = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }[c]; return `<span class="ask-conf" style="color:${col};border-color:${col}">${c} confidence</span>`; }
  function initAsk() {
    if ($("#qaForm") && !$("#qaForm").dataset.on) {
      $("#qaForm").dataset.on = 1;
      const qa = q => { if (!q.trim()) return; askSeen.add(q); askLast = q; $("#qaOut").innerHTML = `<div class="ask-msg me">${q.replace(/</g, "&lt;")}</div><div class="ask-msg bot">${askAnswer(q, state.d)}${claudeBtn(q, Object.assign({}, state.d))}</div>`; renderAskSugg(); };
      askRun = qa;
      $("#qaForm").onsubmit = e => { e.preventDefault(); qa($("#qaIn").value); $("#qaIn").value = ""; };
      renderAskSugg();
    }
    if (document.getElementById("askBtn")) return;
    const top = document.querySelector(".top") || document.body;
    top.insertAdjacentHTML("beforeend", `<button id="askBtn"><span class="ask-lbl">Ask</span> <span class="ask-star">✦</span></button>`);
    document.body.insertAdjacentHTML("beforeend", `
      <div id="askPanel"><div class="ask-head"><b>Ask the copilot</b><button id="askClose" aria-label="Close">×</button></div>
      <div id="askLog"><div class="ask-msg bot">Ask a what-if or how-it-works question. I run our model and answer in plain English with our confidence. For anything deeper, tap <b>✦ Ask Claude about this</b> under the answer and paste it into the Claude chat.</div></div>
      <div class="ask-sugg">${["What if we lower online to $8M?", "Raise markup by 2 points?", "Should we cut vendor management?", "What if breadth goes to 60?", "What does the analytics score mean?", "Should we pay down debt?", "How do we beat $1.5B?"].map(x => `<button class="ask-s">${x}</button>`).join("")}</div>
      <form id="askForm"><input id="askIn" placeholder="e.g. What if we raise shopping experience by $3M?" autocomplete="off"><button class="primary">Ask</button></form></div>`);
    const open = v => document.getElementById("askPanel").classList.toggle("open", v);
    document.getElementById("askBtn").onclick = () => { document.getElementById("askBtn").classList.add("used"); open(true); document.getElementById("askIn").focus(); };
    document.getElementById("askClose").onclick = () => open(false);
    const ask = q => { if (!q.trim()) return; const log = document.getElementById("askLog");
      log.insertAdjacentHTML("beforeend", `<div class="ask-msg me">${q.replace(/</g, "&lt;")}</div><div class="ask-msg bot">${askAnswer(q)}${claudeBtn(q, Object.assign({}, state.d))}</div>`);
      log.scrollTop = log.scrollHeight; };
    document.getElementById("askForm").onsubmit = e => { e.preventDefault(); const i = document.getElementById("askIn"); ask(i.value); i.value = ""; };
    document.querySelectorAll("#askPanel .ask-s").forEach(b => b.onclick = () => ask(b.textContent));
  }

  // ---------- How we beat Zephara card (rendered into every .zeph-slot) ----------
  // ---------- Last round recap: what we changed → what it did (how much, confidence) + forecast vs actual ----------
  function renderRecap() {
    const R = S.recap, el = $("#recapBody"); if (!R || !el) return;
    const CC = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }, cb = c => `<span class="rc-cf" style="color:${CC[c]};border-color:${CC[c]}">${c}</span>`;
    const m = v => "$" + (+v).toFixed(1).replace(/\.0$/, "") + "M";
    const kp = R.kpis.map(k => { const d = k.to - k.from, mx = Math.max(k.to, k.proj, k.from) * 1.05;
      return `<div class="card rc-k"><div class="rc-kl">${k.k}</div><div class="rc-kv">${m(k.to)}<span class="${(k.k === "Debt" ? -d : d) >= 0 ? "up" : "dn"}">${d >= 0 ? "▲" : "▼"} ${m(Math.abs(d))}</span></div><div class="rc-kf">was ${m(k.from)}</div>
        <div class="rc-pa"><div><span>Forecast</span><i><b class="rc-grow" data-w="${k.proj / mx * 100}" style="width:0;background:#D9822B"></b></i><em>${m(k.proj)}</em></div><div><span>Actual</span><i><b class="rc-grow late" data-w="${k.to / mx * 100}" style="width:0;background:#2E5BFF"></b></i><em>${m(k.to)}</em></div></div>
        <div class="rc-kn">${k.note}</div></div>`; }).join("");
    const qs = R.quads.map(q => { const d = q.to - q.from;
      return `<div class="rc-q"><b>${q.q}</b><div class="rc-qv">${q.from} → <strong>${q.to}</strong> <span class="${d > 0 ? "up" : d < 0 ? "dn" : "fl"}">${d > 0 ? "▲ +" + d.toFixed(1) : d < 0 ? "▼ " + d.toFixed(1) : "= flat"}</span></div><small>${q.rank} · forecast ${q.proj} · ${q.note}</small></div>`; }).join("");
    const ch = R.changes.map(c => `<div class="rc-row"><div class="rc-lv"><b>${c.lever}</b><span>${c.from} → <strong>${c.to}</strong></span></div><div class="rc-how">${c.how}</div><div class="rc-ef">${c.effect}</div>${cb(c.conf)}</div>`).join("");
    const wy = R.why.map(w => `<div class="card rc-w"><div class="rc-wt">${w.t} ${cb(w.conf)}</div><p>${w.d}</p></div>`).join("");
    el.innerHTML = `<h1>Last round recap</h1><p class="rc-sub"><b>${R.title}</b> · ${R.sub}</p>
      <div class="rc-legend"><span><i style="background:#D9822B"></i>Our forecast</span><span><i style="background:#2E5BFF"></i>Actual</span><span class="rc-cl">Confidence: ${cb("High")} tested / exact data ${cb("Medium")} model estimate ${cb("Low")} untested</span></div>
      <div class="rc-kpis">${kp}</div>
      <div class="rc-h">Quadrants</div><div class="card rc-qs">${qs}</div>
      <div class="rc-h">What we changed → what it did</div><div class="card rc-ch"><div class="rc-row rc-hd"><div>Lever</div><div>How much</div><div>Effect</div><div>Sure?</div></div>${ch}<div class="rc-un"><b>Didn't touch:</b> ${R.untouched}</div></div>
      <div class="rc-h">Why the numbers moved</div><div class="rc-ws">${wy}</div>
      <div class="card rc-next"><div>${R.next}</div><button class="primary" data-go="start">Build this round's plan →</button></div>`;
    el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => show(b.dataset.go));
  }

  function renderZeph() {
    const Z = S.vsZephara; if (!Z) return;
    const CC = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" };
    const html = `<div class="zc"><div class="zc-h"><div><div class="zc-t">${Z.title}</div><div class="zc-s">${Z.sub}</div></div></div>
      <div class="zc-grid"><table class="zc-tab"><tr><th></th><th>Us</th><th>Zephara</th></tr>${Z.compare.map(([n, u, z, w]) => `<tr><td>${n}</td><td class="${w > 0 ? "win" : w < 0 ? "lose" : ""}">${u}</td><td>${z}</td></tr>`).join("")}</table>
      <div class="zc-moves">${Z.moves.map(([v, t, d, c]) => `<div class="zm"><span class="cb ${v.toLowerCase()}">${v}</span><div><b>${t}</b> <span class="zconf" style="color:${CC[c]}">${c}</span><div class="zd">${d}</div></div></div>`).join("")}</div></div>
      <div class="zc-w"><b>Watch next round:</b> ${Z.watch}</div></div>`;
    const E = S.endgame, eg = !E ? "" : (() => { const mx = Math.max(...E.share.map(x => x[1]));
      return `<div class="zc eg"><div class="zc-h"><div><div class="zc-t">${E.title}</div><div class="zc-s">${E.sub}</div></div></div>
      <div class="eg-grid"><div class="eg-share"><div class="eg-lab">Revenue market share · Round ${S.round - 1}</div>${E.share.map(([n, v]) => `<div class="eg-bar ${n === S.company ? "us" : ""}"><span>${n}</span><i><b style="width:${v / mx * 100}%"></b></i><em>${v}%</em></div>`).join("")}<div class="eg-note">${E.shareNote}</div></div>
      <div class="eg-steps">${E.steps.map(([r, t, d, c], i) => `<div class="eg-step"><span class="eg-n">${i + 1}</span><div><small>${r}</small><b>${t}</b> <span class="zconf" style="color:${CC[c]}">${c}</span><div class="zd">${d}</div></div></div>`).join("")}</div></div>
      ${E.check ? `<div class="eg-check"><div class="eg-lab">${E.check.title}</div><div class="eg-cgrid"><div><div class="eg-bt">${E.check.rows.map(([r, e]) => `<span><small>${r}</small><b class="${Math.abs(parseFloat(e.replace("−", "-"))) <= 5 ? "up" : "fl"}">${e}</b></span>`).join("")}</div><div class="eg-note">${E.check.note}</div></div>
        <div><b class="up">✓ Verified on game data</b><ul>${E.check.verified.map(x => `<li>${x}</li>`).join("")}</ul></div><div><b class="dn">⚠ Untested: be careful</b><ul>${E.check.untested.map(x => `<li>${x}</li>`).join("")}</ul></div></div></div>` : ""}</div>`; })();
    document.querySelectorAll(".zeph-slot").forEach(el => el.innerHTML = eg + html);
  }


  // ---------- Team plans on the Build plan screen: save per person, compare vs recommended, pros & cons ----------
  const TEAM_KEY = "getchells-team-r" + S.round;
  const teamLoad = () => { try { return JSON.parse(localStorage.getItem(TEAM_KEY) || "{}"); } catch (e) { return {}; } };
  const teamSave = t => localStorage.setItem(TEAM_KEY, JSON.stringify(t));
  const VOTE_KEY = TEAM_KEY + "-votes", FINAL_KEY = TEAM_KEY + "-final";
  const voteLoad = () => { try { return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}"); } catch (e) { return {}; } };
  const finalLoad = () => localStorage.getItem(FINAL_KEY) || "";
  // Long-term (strategic) effect of moving a lever up/down — based on what builds up and our end-game plan
  const LT = {
    experience: { up: [1, "Builds an Experience lead that carries to Round 8 (20% capitalized)"], down: [-1, "Experience position stops building; Zephara can pass us"] },
    online: { up: [1, "Online position keeps building → Frictionless creeps toward fair value"], down: [-1, "Online position stops building; S1/S4 (growing) shop online"] },
    service: { up: [-1, "Doesn't build up: rivals keep matching service spend"], down: [-1, "Experience drops right away (service is judged every round)"] },
    vendor: { up: [1, "Lower costs compound over rounds"], down: [-1, "Cost gap vs rivals widens every round; better saved for the final round"] },
    analytics: { up: [-1, "Small, unproven effect; doesn't build"], down: [0, "Little long-term effect"] },
    breadthLow: { up: [1, "Tests our growth lever for growing segments (S2, S4, S6)"], down: [-1, "Drops the breadth test; no read on our growth lever"] },
    breadthHigh: { up: [0, "Already at the max"], down: [-1, "Weakens our #1 premium range (fastest-growing line)"] },
    depthLow: { up: [-1, "Ties up cash in stock (more debt)"], down: [-1, "Stock-outs as customers value depth more each round"] },
    depthHigh: { up: [-1, "Ties up cash in stock"], down: [-1, "Stock-outs on premium products"] },
    pbQuality: { up: [1, "Brand insurance against BestCo's rise"], down: [-1, "Risks our Brand #1"] },
    nbQuality: { up: [1, "Brand insurance against BestCo's rise"], down: [-1, "Risks our Brand #1"] },
    pbLow: { up: [-1, "More own-label may weaken Brand"], down: [1, "Tests whether more national brands lift Brand"] },
    pbHigh: { up: [-1, "More own-label may weaken Brand"], down: [1, "Tests whether more national brands lift Brand"] },
    markupLow: { up: [-1, "Low Price could slip toward fair value"], down: [-1, "Thinner margins every round"] },
    markupHigh: { up: [0, "Untested: premium shoppers may accept it"], down: [-1, "Thinner premium margins"] },
    stores: { up: [-1, "More debt + depreciation for years (value trap per slides)"], down: [-1, "Loses store shoppers (S2, S4, S6 are growing)"] }
  };
  function prosCons(d, rec) {
    const r = model(d), r0 = model(rec), now = { pro: [], con: [] }, lt = { pro: [], con: [] };
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
    LEVERS.forEach(L => {
      if (Math.abs(d[L.key] - rec[L.key]) < 1e-9) return;
      const one = Object.assign({}, rec, { [L.key]: d[L.key] }), dv = model(one).mv - r0.mv, I = (S.leverInfo || {})[L.key] || {};
      (dv >= 0 ? now.pro : now.con).push([Math.abs(dv), `${L.label} ${fmt(L, rec[L.key])} → ${fmt(L, d[L.key])}: ${dv >= 0 ? "+" : "−"}$${Math.abs(dv).toFixed(0)}M${I.conf === "Low" ? " (untested)" : ""}`]);
      const e = (LT[L.key] || {})[d[L.key] > rec[L.key] ? "up" : "down"];
      if (e && e[0] !== 0) (e[0] > 0 ? lt.pro : lt.con).push([Math.abs(dv) + 1, `${L.label}: ${e[1]}`]);
    });
    const exp = r.cls[1];
    if (exp.score >= exp.leader) now.pro.push([99, `Experience ${exp.score.toFixed(2)} ≥ Zephara ${exp.leader}: two leads`]); else now.con.push([99, `Experience ${exp.score.toFixed(2)} < Zephara ${exp.leader}: stays #2`]);
    if (r.spend > S.base.budget + 1e-6) now.con.push([100, `Over budget by ${fmtM(r.spend - S.base.budget)}: the game will reject it`]);
    else if (S.base.budget - r.spend > 1) lt.con.push([5, `${fmtM(S.base.budget - r.spend)} unspent: positions that build up don't get built`]);
    const top = arr => arr.sort((x, y) => y[0] - x[0]).slice(0, 3).map(x => x[1]);
    return { r, now: { pro: top(now.pro), con: top(now.con) }, lt: { pro: top(lt.pro), con: top(lt.con) } };
  }
  // Strategy title from what the plan does (used when no title is typed)
  function autoTitle(d, rec) {
    const r = model(d), parts = [], unspent = S.base.budget - r.spend;
    if (d.experience > rec.experience + 0.4) parts.push("Push the Experience lead"); else if (d.experience < rec.experience - 0.4) parts.push("Lighter on Experience");
    if (d.vendor < rec.vendor - 0.4) parts.push("cut costs early"); else if (d.vendor > rec.vendor + 0.4) parts.push("invest in lower costs");
    if (d.online > rec.online + 0.4) parts.push("build Frictionless"); else if (d.online < rec.online - 0.4) parts.push("trim online");
    if (d.service > rec.service + 0.4) parts.push("more service");
    if (d.breadthLow > rec.breadthLow) parts.push("wider range"); else if (d.breadthLow < rec.breadthLow) parts.push("no breadth test");
    if (d.pbQuality > rec.pbQuality || d.nbQuality > rec.nbQuality) parts.push("Brand insurance");
    if (unspent > 2) parts.unshift("Bank profit now");
    if (!parts.length) return "Same as recommended";
    const s = parts.slice(0, 3).join(", "); return s[0].toUpperCase() + s.slice(1);
  }
  // ---------- Team room: everyone adds an idea; any card can go on the shared CENTER screen; Brian edits it there; live for everyone ----------
  const ME_KEY = "getchells-me", SUB = S.submitter || "Brian";
  const meLoad = () => localStorage.getItem(ME_KEY) || "";
  const AV = ["#2E5BFF", "#0f766e", "#7c3aed", "#c2410c", "#be185d"];
  const avColor = n => n === "Recommended" ? "#1f3fb8" : AV[Math.max(0, (S.team || []).indexOf(n)) % AV.length];
  const CENTER_KEY = TEAM_KEY + "-center", OK_KEY = TEAM_KEY + "-ok";
  const jl = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const centerLoad = () => jl(CENTER_KEY), centerSave = c => localStorage.setItem(CENTER_KEY, JSON.stringify(c));
  const okLoad = () => jl(OK_KEY) || { ts: 0, m: {} }, okSave = o => localStorage.setItem(OK_KEY, JSON.stringify(o));
  const diffOf = d => { const o = {}; LEVERS.forEach(L => { if (Math.abs(d[L.key] - S.defaults[L.key]) > 1e-9) o[L.key] = d[L.key]; }); return o; };
  const recPlan = () => { const p = (S.plans || []).find(x => x.badge === "Recommended"); return Object.assign({}, S.defaults, p ? p.levers : {}); };
  let pendingAdd = false;

  // live relay (ntfy.sh): every change is a small JSON message; newest timestamp wins
  const LIVE = S.liveTopic ? "https://ntfy.sh/" + S.liveTopic + "-r" + S.round : "";
  let liveOn = false, pubTimer = null;
  function setLive(on) { liveOn = on; const el = $("#trLive"); if (el) { el.className = "tr-live " + (on ? "on" : "off"); el.textContent = on ? "● Live" : "○ Offline: changes stay on this computer"; } }
  function livePub(o) { if (!LIVE) return; o.v = 1; fetch(LIVE, { method: "POST", body: JSON.stringify(o) }).then(r => setLive(r.ok)).catch(() => setLive(false)); }
  // tombstones so a deleted/cleared idea never comes back from an older copy
  const TOMB_KEY = TEAM_KEY + "-tomb", tombLoad = () => jl(TOMB_KEY) || { clear: 0, del: {} }, tombSave = x => localStorage.setItem(TOMB_KEY, JSON.stringify(x));
  function liveApply(o) {
    if (!o || o.v !== 1) return false;
    const tt = teamLoad(), tb = tombLoad();
    if (o.k === "snap") { let ch = false;
      if (o.tomb) { const m = { clear: Math.max(tb.clear, o.tomb.clear || 0), del: Object.assign({}, tb.del) }; Object.entries(o.tomb.del || {}).forEach(([n, x]) => { if (!(m.del[n] >= x)) m.del[n] = x; }); tombSave(m); }
      Object.entries(o.ideas || {}).forEach(([n, it]) => { if (liveApply({ v: 1, k: "idea", n, t: it.t, ts: it.ts, d: it.d })) ch = true; });
      if (o.center && liveApply(Object.assign({ v: 1, k: "center" }, o.center))) ch = true;
      if (o.ok && liveApply({ v: 1, k: "ok", m: o.ok.m, ts: o.ok.ts })) ch = true;
      Object.entries((o.tomb || {}).del || {}).forEach(([n, x]) => { const t2 = teamLoad(); if (t2[n] && t2[n].ts <= x) { delete t2[n]; teamSave(t2); ch = true; } });
      return ch; }
    if (o.k === "idea") { if ((tt[o.n] && tt[o.n].ts >= o.ts) || tb.clear >= o.ts || (tb.del[o.n] || 0) >= o.ts) return false; tt[o.n] = { d: Object.assign({}, S.defaults, o.d), ts: o.ts, title: o.t || "" }; teamSave(tt); return true; }
    if (o.k === "del") { tb.del[o.n] = Math.max(tb.del[o.n] || 0, o.ts); tombSave(tb); if (!tt[o.n] || tt[o.n].ts > o.ts) return false; delete tt[o.n]; teamSave(tt); return true; }
    if (o.k === "center") { const c = centerLoad(); if (c && c.ts >= o.ts) return false; centerSave({ src: o.src, d: Object.assign({}, S.defaults, o.d), ts: o.ts, by: o.by || "" }); return true; }
    if (o.k === "ok") { if (okLoad().ts >= o.ts) return false; okSave({ ts: o.ts, m: o.m || {} }); return true; }
    if (o.k === "clear") { tb.clear = Math.max(tb.clear, o.ts); tombSave(tb); let ch = false; Object.keys(tt).forEach(n => { if (tt[n].ts <= o.ts) { delete tt[n]; ch = true; } }); teamSave(tt);
      const c = centerLoad(); if (c && c.ts <= o.ts) { localStorage.removeItem(CENTER_KEY); ch = true; } if (okLoad().ts <= o.ts) { localStorage.removeItem(OK_KEY); ch = true; } return ch; }
    return false;
  }
  const liveRedraw = () => { const a = document.activeElement; if (a && a.closest && a.closest("#team") && a.tagName === "INPUT") return setTimeout(liveRedraw, 800); renderTeamCmp(); };
  function liveStart() {
    if (!LIVE || !window.EventSource) return;
    fetch(LIVE + "/json?poll=1&since=12h").then(r => r.text()).then(txt => { let ch = false;
      txt.split("\n").forEach(l => { try { const m = JSON.parse(l); if (m.event === "message" && liveApply(JSON.parse(m.message))) ch = true; } catch (e) {} });
      setLive(true); if (ch) liveRedraw(); pubSnap(); }).catch(() => setLive(false));
    setInterval(pubSnap, 3600 * 1000);
    const es = new EventSource(LIVE + "/sse");
    es.onopen = () => setLive(true); es.onerror = () => setLive(false);
    es.onmessage = e => { try { const m = JSON.parse(e.data); if (m.event === "message" && liveApply(JSON.parse(m.message))) liveRedraw(); } catch (x) {} };
  }
  // the relay keeps messages ~12h, so every open copy re-shares what it knows (newest timestamp still wins)
  function pubSnap() {
    const tt = teamLoad(), ideas = {}; Object.keys(tt).forEach(n => ideas[n] = { t: tt[n].title || "", ts: tt[n].ts, d: diffOf(Object.assign({}, S.defaults, tt[n].d)) });
    const c = centerLoad(), ok = okLoad(), tb = tombLoad();
    if (!Object.keys(ideas).length && !c && !ok.ts && !tb.clear) return;
    livePub({ k: "snap", ideas, center: c ? { src: c.src, d: diffOf(c.d), ts: c.ts, by: c.by } : null, ok: ok.ts ? ok : null, tomb: tb });
  }
  function pubCenter(c) { clearTimeout(pubTimer); pubTimer = setTimeout(() => livePub({ k: "center", src: c.src, d: diffOf(c.d), ts: c.ts, by: c.by }), 900); }

  // idea title fills itself from what the sliders do; typing your own keeps it (clear the box to go back to auto)
  function autoFillTitle() {
    const el = $("#tcTitle"); if (!el) return;
    if (!el.dataset.bound) { el.dataset.bound = "1"; el.addEventListener("input", () => { el.dataset.typed = el.value.trim() ? "1" : ""; if (!el.dataset.typed) autoFillTitle(); }); }
    if (el.dataset.typed === "1") return;
    el.value = autoTitle(state.d, recPlan());
  }
  function addMyIdea() {
    const me = meLoad(); if (!me) { pendingAdd = true; openTD(); return; }
    const tt = teamLoad(), ti = ($("#tcTitle") && $("#tcTitle").value.trim()) || "", it = { d: Object.assign({}, state.d), ts: Date.now(), title: ti };
    tt[me] = it; teamSave(tt); livePub({ k: "idea", n: me, t: ti, ts: it.ts, d: diffOf(it.d) });
    if ($("#tcTitle")) { $("#tcTitle").dataset.typed = ""; autoFillTitle(); } openTD();
  }
  // Outlook for any plan: expected value with confidence range, positioning vs the goal (lead 2, fair in 2), long-term viability to Round 8
  const fmtR = v => v >= 1000 ? "$" + (v / 1000).toFixed(2) + "B" : "$" + v.toFixed(0) + "M";
  function outlook(d) {
    const r = model(d), q = ["Brand", "Experience", "Low Price", "Frictionless"], st = k => r.cls[k].status;
    const leads = q.filter((x, k) => st(k) === "LEAD"), gaps = q.filter((x, k) => st(k) === "GAP");
    const posTxt = (leads.length ? "Leads " + leads.join(" + ") : "No lead") + (gaps.length ? " · below fair in " + gaps.join(", ") : " · fair in the rest");
    const posTag = leads.length >= 2 && !gaps.length ? ["On goal", "#1a7f37"] : leads.length >= 2 ? ["2 leads ✓", "#1a7f37"] : leads.length === 1 ? ["1 lead", "#9a6700"] : ["No lead", "#b42318"];
    const pc = prosCons(d, S.defaults), build = d.experience + d.online;
    let v = pc.lt.pro.length - pc.lt.con.length + (leads.length >= 2 ? 1 : -1) + (build >= S.defaults.experience + S.defaults.online ? 1 : -1);
    if (r.spend > S.base.budget + 1e-6) v -= 3;
    v -= LEVERS.filter(L => Math.abs(d[L.key] - S.defaults[L.key]) > 1e-9 && ((S.leverInfo || {})[L.key] || {}).conf === "Low").length;
    const via = v >= 2 ? ["Strong", "#1a7f37"] : v >= 0 ? ["Okay", "#9a6700"] : ["Fragile", "#b42318"];
    const why = r.spend > S.base.budget + 1e-6 ? "Over budget: the game won't accept it" : (v >= 0 ? (pc.lt.pro[0] || "Keeps building the levers that carry to Round 8") : (pc.lt.con[0] || "Builds less of what carries to Round 8")).replace(/^[^:]+: /, "");
    return { r, lo: r.mv * 0.92, hi: r.mv * 1.08, posTxt, posTag, via, why: why.length > 90 ? why.slice(0, 88) + "…" : why };
  }
  // Rank of a quadrant score vs rivals' latest scores: "#1 · 0.50 ahead of Zephara" / "#2 · 0.10 behind Zephara"
  function quadRank(v, k) {
    const others = Object.entries(S.rivals).filter(([n]) => n !== S.company).map(([n, sc]) => [n, sc[k]]).sort((a, b) => b[1] - a[1]);
    const rank = 1 + others.filter(o => o[1] > v + 1e-9).length;
    return rank === 1 ? { rank, gap: v - others[0][1], who: others[0][0], txt: `#1 · ${(v - others[0][1]).toFixed(2)} ahead of ${others[0][0]}`, short: `#1 ▲${(v - others[0][1]).toFixed(1)}` }
      : { rank, gap: others[0][1] - v, who: others[0][0], txt: `#${rank} · ${(others[0][1] - v).toFixed(2)} behind ${others[0][0]}`, short: `#${rank} ▼${(others[0][1] - v).toFixed(1)}` };
  }
  // Changes worth a second look before submitting: big jumps, untested (Low-confidence) levers, over budget, a lost lead
  function riskFlags(d) {
    const out = [], LI = S.leverInfo || {};
    LEVERS.forEach(L => { const was = S.defaults[L.key], v = d[L.key]; if (Math.abs(v - was) < 1e-9) return;
      const conf = (LI[L.key] || {}).conf || "Medium", pct = was ? (v - was) / was * 100 : 100, big = Math.abs(v - was) / (L.max - L.min) >= 0.08 || Math.abs(pct) >= 20;
      if (!big && conf !== "Low") return;
      const why = [big ? `big jump (${pct > 0 ? "+" : ""}${pct.toFixed(0)}%)` : "", conf === "Low" ? "untested: the effect is a guess" + ((LI[L.key] || {}).hypothesis ? " (" + LI[L.key].hypothesis.split(/\. /)[0].replace(/\.$/, "") + ")" : "") : ""].filter(Boolean).join(" · ");
      out.push({ key: L.key, label: L.label, from: was, to: v, conf, big, why, sev: (conf === "Low" ? 2 : 0) + (big ? 1 : 0) }); });
    const r = model(d), r0 = model(S.defaults);
    if (r.spend > S.base.budget + 1e-6) out.push({ key: "_budget", label: "Budget", conf: "High", why: `over by ${fmtM(r.spend - S.base.budget)}: the game will reject it`, sev: 3 });
    if (r.leads < r0.leads) out.push({ key: "_lead", label: "Quadrant lead", conf: "High", why: "this plan loses a lead we have now", sev: 3 });
    return out.sort((a, b) => b.sev - a.sev);
  }
  function openTD() { show("team"); }
  function closeTD() { show("cockpit"); }
  function renderTeamCmp() {
    if (!$("#tcCards")) return;
    const t = teamLoad(), me = meLoad(), rec = recPlan(), recP = (S.plans || []).find(p => p.badge === "Recommended");
    const names = (S.team || []).filter(n => t[n]).concat(Object.keys(t).filter(n => !(S.team || []).includes(n)));
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+(+v).toFixed(2)) + "M" : (+(+v).toFixed(2)) + (L.unit === "%" ? "%" : "");
    const short = L => L.label.replace("Shopping experience", "Experience").replace("Vendor management", "Vendor").replace("Customer service", "Service").replace("Customer analytics", "Analytics");
    const CC = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }, badge = (c, x) => `<em class="tr-b" style="color:${CC[c]};border-color:${CC[c]}">${c}${x ? " " + x : ""}</em>`;
    // Build plan section
    if ($("#tcMe")) $("#tcMe").innerHTML = (S.team || []).map(n => `<button class="tr-nm ${n === me ? "me" : ""}" data-pick="${n}" style="--c:${avColor(n)}"><i>${n[0]}</i>${n}${t[n] ? " ✓" : ""}</button>`).join("");
    document.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { localStorage.setItem(ME_KEY, b.dataset.pick); renderTeamCmp(); });
    if ($("#tcAdd")) { $("#tcAdd").textContent = me ? (t[me] ? `💾 Update ${me}'s idea` : `💾 Save as ${me}`) : "💾 Save"; $("#tcAdd").onclick = () => { if (!meLoad()) { const x = $("#tcMe"); x.classList.add("tc-nudge"); setTimeout(() => x.classList.remove("tc-nudge"), 1200); $("#tcAdd").textContent = "Click your name first →"; return; } addMyIdea(); }; }
    if ($("#tcOpen")) { $("#tcOpen").textContent = `Open team room · ${names.length} idea${names.length === 1 ? "" : "s"}`; $("#tcOpen").onclick = openTD; }
    // who's here
    $("#tcWho").innerHTML = `<div class="tr-who ${me ? "" : "ask"}"><span class="tr-q">${me ? "You're" : "👋 Who's here? Pick your name"}</span>${(S.team || []).map(n => `<button class="tr-nm ${n === me ? "me" : ""}" data-me="${n}" style="--c:${avColor(n)}"><i>${n[0]}</i>${n}</button>`).join("")}<span id="trLive" class="tr-live ${liveOn ? "on" : "off"}">${liveOn ? "● Live" : "○ Connecting…"}</span></div>`;
    // ===== CENTER SCREEN =====
    const c = centerLoad() || { src: "Recommended", d: rec, ts: 0, by: "" }, cd = Object.assign({}, S.defaults, c.d), canEdit = !!me;
    const o = outlook(cd), r = o.r, pc = prosCons(cd, S.defaults), ok = okLoad().m;
    const groups = [...new Set(LEVERS.map(L => L.group))], flagged = new Set(riskFlags(cd).map(f => f.key));
    const chL = LEVERS.filter(L => Math.abs(cd[L.key] - S.defaults[L.key]) > 1e-9);
    const quads = ["Brand", "Experience", "Low Price", "Frictionless"];
    const qb = quads.map((q, k) => { const s = r.sc[k], lead = r.cls[k].leader, rk = quadRank(s, k); return `<div class="tr-q4 cs-q"><span>${q}</span><div class="tr-tr"><div style="width:${Math.min(100, s * 10)}%;background:#2E5BFF"></div><em style="left:${Math.min(100, lead * 10)}%"></em></div><b>${s.toFixed(2)}</b><small class="${rk.rank === 1 ? "up" : r.cls[k].status === "GAP" ? "dn" : "fl"}">${rk.rank === 1 ? "LEAD · " + rk.txt.slice(5) : (r.cls[k].status === "GAP" ? "GAP (below fair) · " : r.cls[k].status === "LEAD" ? "LEAD (close) · " : "FAIR ✓ · ") + rk.txt.replace(/^#\d+ · /, "")}</small></div>`; }).join("");
    const flags = riskFlags(cd), CCf = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" };
    const flagBox = flags.length ? `<div class="cs-flags"><div class="cs-ft">⚠ Double-check before we submit</div>${flags.map(f => `<div class="cs-f ${f.conf === "Low" ? "low" : ""}"><b>${f.label}</b>${f.from != null ? ` ${fmt(LEVERS.find(L => L.key === f.key), f.from)} → ${fmt(LEVERS.find(L => L.key === f.key), f.to)}` : ""}<span>${f.why}</span>${badge(f.conf)}</div>`).join("")}</div>` : `<div class="cs-flags ok">✓ No big jumps or untested levers in this plan</div>`;
    const flagKeys = new Set(flags.map(f => f.key));
    const over = r.spend > S.base.budget + 1e-6, left = S.base.budget - r.spend;
    const srcPlan = c.src === "Recommended" ? rec : (t[c.src] ? Object.assign({}, S.defaults, t[c.src].d) : null);
    const edits = srcPlan ? LEVERS.filter(L => Math.abs(cd[L.key] - srcPlan[L.key]) > 1e-9) : [];
    const srcTxt = (c.src === "Recommended" ? "Plan A (recommended)" : c.src + "'s idea") + (edits.length ? `, <span class="cs-edited">edited: ${edits.length} box${edits.length > 1 ? "es" : ""} changed from the original (${edits.slice(0, 3).map(L => short(L) + " " + fmt(L, srcPlan[L.key]) + " → " + fmt(L, cd[L.key])).join(", ")}${edits.length > 3 ? "…" : ""})</span>${canEdit ? ` <button class="hp-undo" id="csOrig">↺ Back to original</button>` : ""}` : "");
    const center = `<div class="tr-sub cs">
      <div class="tr-subh"><div><b class="cs-t">🖥 Center screen · what we'll type into the game</b><small class="cs-s">Showing <b>${srcTxt}</b>${c.by && c.by !== c.src ? ` · last change by ${c.by}` : ""}${c.ts ? ` (${new Date(c.ts).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })})` : ""}. Pick a name in “Show” to bring their idea here; anyone can edit it and everyone sees the changes live.${canEdit ? "" : " Pick your name above to edit."}</small></div>
        <div class="tr-ok"><span>Show:</span>${["Recommended"].concat(S.team || []).map(n => { const has = n === "Recommended" || t[n], on = c.src === n;
          return `<button class="tr-okb ${n === "Recommended" ? "rec" : ""} ${on ? "on" : ""}" ${has ? `data-show="${n}"` : "disabled"} style="--c:${avColor(n)}" title="${has ? (on ? "On the center screen now" : "Show " + (n === "Recommended" ? "Plan A" : n + "'s idea") + " on the center screen") : n + " hasn't saved an idea yet"}">${on ? "● " : ""}${n === "Recommended" ? "★ Plan A" : n}</button>`; }).join("")}</div></div>
      <div class="cs-grid cs-grid2">
        <div class="cs-right"><div class="tr-lab">Type into the game (changes from last round)${canEdit ? " · adjust here" : ""}</div>
          ${flagBox}${chL.length ? `<ol class="cs-list">${chL.map(L => `<li class="${flagKeys.has(L.key) ? "flag" : ""}"><span>${flagKeys.has(L.key) ? "⚠ " : ""}${L.label}</span><div class="cs-li"><b>${fmt(L, S.defaults[L.key])} → <em>${fmt(L, cd[L.key])}</em></b>${canEdit ? `<span class="cs-ed"><button data-cs="${L.key}" data-dir="-1">−</button><input data-csin="${L.key}" value="${+(+cd[L.key]).toFixed(2)}" inputmode="decimal"><button data-cs="${L.key}" data-dir="1">+</button><button class="cs-x" data-csreset="${L.key}" title="Back to last round">↺</button></span>` : ""}</div></li>`).join("")}</ol>` : `<div class="tc-mut">No changes from last round</div>`}
          ${canEdit ? `<div class="cs-add"><select id="csAddSel"><option value="">＋ Change another box…</option>${LEVERS.filter(L => Math.abs(cd[L.key] - S.defaults[L.key]) < 1e-9).map(L => `<option value="${L.key}">${L.label} (now ${fmt(L, cd[L.key])})</option>`).join("")}</select></div>
          <form class="cs-hyp" id="csHyp"><input id="csHypIn" placeholder="Or type it: experience to 24 and vendor to 18" autocomplete="off"><button class="tc-ref">Apply</button></form><div id="csHypOut"></div>` : ""}
          <div class="cs-foot">Every other box: same as last round.</div></div>
        <div class="cs-mid"><div class="tr-lab">Expected outcome</div>
          <div class="cs-mv">${fmtM(r.mv)}</div><div class="tr-rng">likely ${fmtR(o.lo)}–${fmtR(o.hi)} ${badge("Medium")}</div>
          <div class="tr-ol"><div><span>Positioning</span><b style="color:${o.posTag[1]}">${o.posTag[0]}</b>${badge("High")}<p>${o.posTxt}</p></div>
            <div><span>Long term</span><b style="color:${o.via[1]}">${o.via[0]}</b>${badge("Low")}<p>${o.why}</p></div>
            <div><span>Net income</span><b>${fmtM(r.niProj)}</b>${badge("Medium")}</div></div>
          <div class="tr-bars" style="margin-top:8px">${qb}</div>
          <div class="tr-sp" style="margin-top:8px"><span>Spend ${fmtM(r.spend)} of ${fmtM(S.base.budget)} · ${over ? `<b style="color:#b42318">⚠ ${fmtM(-left)} over: the game will reject it</b>` : left > 0.005 ? fmtM(left) + " unspent" : "exactly on budget"}</span><div><div style="width:${Math.min(100, r.spend / S.base.budget * 100)}%;${over ? "background:#b42318" : ""}"></div></div></div>
          <div class="tr-lab" style="margin-top:12px">👍 What it does well</div>${pc.now.pro.concat(pc.lt.pro).slice(0, 3).map(x => `<div class="pp">${x}</div>`).join("") || '<div class="tc-mut">Same as last round</div>'}
          <div class="tr-lab" style="margin-top:10px">👀 Worth keeping an eye on</div>${pc.now.con.concat(pc.lt.con).slice(0, 3).map(x => `<div class="cc">${x}</div>`).join("") || '<div class="tc-mut">Nothing notable</div>'}</div>
      </div></div>`;
    // ===== everyone's ideas =====
    const screen = (who, d, it, isRec) => {
      const oo = outlook(d), rr = oo.r, col = avColor(who), inC = c.src === who;
      const ch = LEVERS.filter(L => Math.abs(d[L.key] - S.defaults[L.key]) > 1e-9).map(L => ({ L, w: Math.abs(d[L.key] - S.defaults[L.key]) / (L.max - L.min) })).sort((x, y) => y.w - x.w);
      const chips = ch.length ? ch.slice(0, 4).map(x => `<span class="tdf-chip">${short(x.L)} ${d[x.L.key] > S.defaults[x.L.key] ? "↑" : "↓"} ${fmt(x.L, d[x.L.key])}</span>`).join("") + (ch.length > 4 ? `<span class="tdf-more">+${ch.length - 4}</span>` : "") : `<span class="tdf-chip base">Same as last round</span>`;
      const bars = quads.map((q, k) => { const s = rr.sc[k], lead = rr.cls[k].leader, rk = quadRank(s, k); return `<div class="tr-q4 tr-q5"><span>${q}</span><div class="tr-tr"><div style="width:${Math.min(100, s * 10)}%;background:${col}"></div><em style="left:${Math.min(100, lead * 10)}%"></em></div><b>${s.toFixed(1)}</b><small class="${rk.rank === 1 ? "up" : rr.cls[k].status === "GAP" ? "dn" : "fl"}" title="${rk.txt}">${rk.rank === 1 ? rk.short.replace("#1 ", "") + " lead" : (rr.cls[k].status === "GAP" ? "gap" : rr.cls[k].status === "LEAD" ? "close" : "fair") + " ▼" + rk.gap.toFixed(1)}</small></div>`; }).join("");
      const fl = riskFlags(d), flLine = fl.length ? `<div class="tr-flag">⚠ ${fl.length} to double-check: ${fl.slice(0, 2).map(f => f.label.replace("Shopping experience", "Experience").replace(" · ", " ")).join(", ")}${fl.length > 2 ? "…" : ""}</div>` : "";
      return `<div class="tr-scr ${isRec ? "rec" : ""} ${who === me ? "mine" : ""} ${inC ? "inc" : ""}" style="--c:${col}">
        <div class="tr-h"><i>${isRec ? "★" : who[0]}</i><div><b>${isRec ? "Plan A · recommended" : who}${who === me ? ' <span class="tr-you">you</span>' : ""}</b><small>${isRec ? "From the model" : "submitted " + new Date(it.ts).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}</small></div></div>
        <div class="tdf-title">“${isRec ? (recP ? recP.name : "Recommended plan") : (it.title || autoTitle(d, rec))}”</div>${isRec && recP && recP.why ? `<div class="tr-why">${[].concat(recP.why)[0]}</div>` : ""}
        <div class="tdf-mv">${fmtM(rr.mv)}</div><div class="tr-rng">likely ${fmtR(oo.lo)}–${fmtR(oo.hi)} ${badge("Medium")}</div>
        <div class="tr-ol"><div><span>Net income</span><b>${fmtM(rr.niProj)}</b>${badge("Medium")}</div><div><span>Experience</span><b>${rr.sc[1].toFixed(2)} ${rr.sc[1] >= rr.cls[1].leader ? "#1" : "#2"}</b>${badge("High")}</div><div><span>Positioning</span><b style="color:${oo.posTag[1]}">${oo.posTag[0]}</b>${badge("High")}</div><div><span>Long term</span><b style="color:${oo.via[1]}">${oo.via[0]}</b>${badge("Low")}<p>${oo.why}</p></div></div>
        <div class="tr-bars">${bars}</div>
        ${flLine}<div class="tdf-chips">${chips}</div>
        <div class="tc-act">${inC ? `<span class="cs-on">● On the center screen</span>` : `<button class="cs-put" data-center="${who}">↑ Put on center screen</button>`}${!isRec ? `<button data-tcload="${who}">Try on my sliders</button>` : ""}${who === me ? `<button data-tcdel="${who}">Remove</button>` : ""}</div></div>`;
    };
    const waiting = (S.team || []).filter(n => !t[n]).map(n => `<div class="tr-scr wait" style="--c:${avColor(n)}"><div class="tr-h"><i>${n[0]}</i><div><b>${n}${n === me ? ' <span class="tr-you">you</span>' : ""}</b><small>${n === me ? "Set the Build plan sliders, then “Add my idea”" : "No idea added yet"}</small></div></div></div>`).join("");
    const screens = `<div class="tr-grid">${screen("Recommended", rec, null, true)}${names.map(n => screen(n, Object.assign({}, S.defaults, t[n].d), t[n], false)).join("")}${waiting}</div>`;
    $("#tcCards").innerHTML = center + `<div class="tr-sec">Everyone's ideas <small>click “Put on center screen” to look at one together</small></div>` + screens +
      `<div class="tr-foot"><span>Ideas save automatically and stay all day: add yours anytime before we meet, then we just talk it through and Brian submits. Model numbers are estimates.</span><button class="tc-link" id="tcClear">Clear the room</button></div>`;
    // events
    const plans = { Recommended: rec }; names.forEach(n => plans[n] = Object.assign({}, S.defaults, t[n].d));
    const setCenter = nc => { centerSave(nc); pubCenter(nc); renderTeamCmp(); };
    document.querySelectorAll("[data-center]").forEach(b => b.onclick = () => { const n = b.dataset.center; setCenter({ src: n, d: Object.assign({}, plans[n]), ts: Date.now(), by: me || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); });
    const edit = (k, v) => { const L = LEVERS.find(x => x.key === k); v = Math.min(L.max, Math.max(L.min, Math.round(v * 100) / 100)); if (isNaN(v)) return renderTeamCmp(); const nd = Object.assign({}, cd, { [k]: v }); setCenter({ src: c.src, d: nd, ts: Date.now(), by: me }); };
    document.querySelectorAll("[data-cs]").forEach(b => b.onclick = () => { const L = LEVERS.find(x => x.key === b.dataset.cs); edit(L.key, cd[L.key] + (+b.dataset.dir) * (L.step || 1)); });
    if ($("#csOrig")) $("#csOrig").onclick = () => setCenter({ src: c.src, d: Object.assign({}, srcPlan), ts: Date.now(), by: me });
    document.querySelectorAll("[data-csreset]").forEach(b => b.onclick = () => edit(b.dataset.csreset, S.defaults[b.dataset.csreset]));
    if ($("#csAddSel")) $("#csAddSel").onchange = e => { const k = e.target.value; if (!k) return; const L = LEVERS.find(x => x.key === k); edit(k, cd[k] + (L.step || 1)); setTimeout(() => { const i = document.querySelector(`[data-csin="${k}"]`); if (i) { i.focus(); i.select(); } }, 30); };
    document.querySelectorAll("[data-csin]").forEach(i => { i.onchange = () => edit(i.dataset.csin, parseFloat(i.value)); i.onkeydown = e => { if (e.key === "Enter") i.blur(); }; });
    if ($("#csHyp")) $("#csHyp").onsubmit = e => { e.preventDefault(); const q = $("#csHypIn").value; const hp = askPlan(q, cd);
      if (!hp.changes.length) { $("#csHypOut").innerHTML = `<div class="cs-hmsg">I couldn't find a change in that. Try “experience to 24” or “cut vendor by 2”.</div>`; return; }
      const prev = { src: c.src, d: cd, ts: Date.now(), by: me }; setCenter({ src: c.src, d: hp.d, ts: Date.now(), by: me });
      $("#csHypOut").innerHTML = `<div class="cs-hmsg">✓ ${hp.changes.map(([L, a, b]) => short(L) + " → " + fmt(L, b)).join(", ")} <button type="button" class="hp-undo" id="csUndo">↶ Undo</button></div>`;
      $("#csUndo").onclick = () => { prev.ts = Date.now(); setCenter(prev); }; };
    document.querySelectorAll("[data-me]").forEach(b => b.onclick = () => { localStorage.setItem(ME_KEY, b.dataset.me); if (pendingAdd) { pendingAdd = false; addMyIdea(); } else renderTeamCmp(); });
    document.querySelectorAll("[data-show]").forEach(b => b.onclick = () => { const n = b.dataset.show; if (c.src === n && !edits.length) return; setCenter({ src: n, d: Object.assign({}, plans[n]), ts: Date.now(), by: me || "" }); });
    if ($("#tdClose")) $("#tdClose").onclick = closeTD;
    if ($("#tcRefresh")) $("#tcRefresh").onclick = () => { renderTeamCmp(); $("#tcRefresh").textContent = "↻ Updated"; setTimeout(() => { const x = $("#tcRefresh"); if (x) x.textContent = "↻ Refresh"; }, 1200); };
    if ($("#tcClear")) $("#tcClear").onclick = () => { if (!confirm("Clear everyone's ideas and the center screen for this round (for the whole team)?")) return; const ts = Date.now(); [TEAM_KEY, CENTER_KEY, OK_KEY].forEach(k => localStorage.removeItem(k)); const tb = tombLoad(); tb.clear = ts; tombSave(tb); livePub({ k: "clear", ts }); renderTeamCmp(); };
    document.querySelectorAll("[data-tcload]").forEach(b => b.onclick = () => { state.d = Object.assign({}, plans[b.dataset.tcload]); syncLevers(); update(); closeTD(); });
    document.querySelectorAll("[data-tcdel]").forEach(b => b.onclick = () => { const tt = teamLoad(), ts = Date.now(); delete tt[b.dataset.tcdel]; teamSave(tt); const tb = tombLoad(); tb.del[b.dataset.tcdel] = ts; tombSave(tb); livePub({ k: "del", n: b.dataset.tcdel, ts }); renderTeamCmp(); });
  }

  // ---------- Levers page (plain-English cheat sheet, grouped by our decision steps) ----------
  let lvFilter = "all";
  function renderLearn() {
    if (!$("#lvBody") || !S.leverGroups) return;
    const rec = (S.plans || []).find(p => p.badge === "Recommended") || {};
    const plan = Object.assign({}, S.defaults, rec.levers || {});
    const fmt = (L, v) => L.unit === "$M" ? "$" + v + "M" : v + (L.unit === "%" ? "%" : "");
    const CC = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" };
    const filters = [["all", "All levers"], ["change", "Changing this round"], ["untested", "Untested ideas"], ["high", "Proven (high confidence)"]];
    const Lr = S.learning;
    if (Lr && $("#lvLearn")) $("#lvLearn").innerHTML = ["proven", "partly", "unknown"].map(t => `<div class="lk lk-${t}"><div class="lk-h">${Lr[t].label}</div><div class="lk-n">${Lr[t].note}</div>
        <div class="lk-chips">${Lr[t].keys.map(k => `<span>${(LEVERS.find(x => x.key === k) || {}).label || k}</span>`).join("")}</div></div>`).join("") +
      `<div class="lk lk-tests"><div class="lk-h">How we keep learning</div><div class="lk-n">one untested lever per round, so we can tell what caused what</div><ol>${Lr.tests.map(t => `<li>${t}</li>`).join("")}</ol></div>`;
    $("#lvFilters").innerHTML = filters.map(([k, l]) => `<button class="lv-chip ${lvFilter === k ? "on" : ""}" data-lvf="${k}">${l}</button>`).join("");
    document.querySelectorAll("[data-lvf]").forEach(b => b.onclick = () => { lvFilter = b.dataset.lvf; renderLearn(); });
    const keep = (k, I) => lvFilter === "all" || (lvFilter === "change" && plan[k] !== S.defaults[k]) ||
      (lvFilter === "untested" && (I.hypothesis || I.conf === "Low")) || (lvFilter === "high" && I.conf === "High");
    $("#lvBody").innerHTML = S.leverGroups.map(g => {
      const cards = g.keys.filter(k => S.leverInfo[k] && keep(k, S.leverInfo[k])).map(k => {
        const I = S.leverInfo[k], L = LEVERS.find(x => x.key === k); if (!L) return "";
        const now = S.defaults[k], nxt = plan[k], chg = now !== nxt;
        return `<div class="lv-card ${chg ? "chg" : ""}">
          <div class="lv-top"><div><div class="lv-name">${L.label}</div><div class="lv-plain">${I.plain}</div></div>
            <div class="lv-val"><div class="lv-now">Now <b>${fmt(L, now)}</b></div>${chg ? `<div class="lv-next">${rec.id ? "Plan " + rec.id : "Plan"}: <b>${fmt(L, nxt)}</b></div>` : `<div class="lv-hold">Keep</div>`}</div></div>
          <div class="lv-call"><b>${I.longTerm}.</b> ${I.why}</div>
          <div class="lv-foot"><span class="lv-conf" style="color:${CC[I.conf]};border-color:${CC[I.conf]}">${I.conf} confidence</span>${I.hypothesis ? `<span class="lv-tag">Untested idea</span>` : ""}
            <button class="lv-try" data-try="${k}">Try it →</button></div>
          <details class="lv-more"><summary>How it works</summary>
            <div class="lv-row"><span class="lv-k">What it changes</span><span>${I.effect}</span></div>
            ${I.data ? `<div class="lv-row"><span class="lv-k">From the game data</span><span><ul class="lv-ul">${I.data.map(x => `<li>${x}</li>`).join("")}</ul></span></div>` : ""}
            ${I.hypothesis ? `<div class="lv-row lv-hyp"><span class="lv-k">Our hypothesis</span><span>${I.hypothesis}</span></div>` : ""}
            <div class="lv-row"><span class="lv-k">Watch next round</span><span>${I.rule}</span></div>
            <div class="lv-row"><span class="lv-k">History</span><span>${I.status}</span></div></details></div>`;
      }).join("");
      return cards ? `<div class="lv-group"><div class="lv-q">${g.q}</div><div class="lv-why">${g.why}</div>${g.note && lvFilter === "all" ? `<div class="lv-note">${g.note}</div>` : ""}<div class="lv-grid">${cards}</div></div>` : "";
    }).join("") || `<p class="lv-sub">No levers match this filter.</p>`;
    document.querySelectorAll("[data-try]").forEach(b => b.onclick = () => {
      const k = b.dataset.try;
      if (rec.levers) { state.plan = rec; state.segs = rec.segs.slice(); state.d = Object.assign({}, S.defaults, rec.levers); }
      openCockpit(true);
      setTimeout(() => { const row = document.querySelector('.lever[data-k="' + k + '"]'); if (!row) return;
        row.scrollIntoView({ behavior: "smooth", block: "center" }); row.classList.add("flash"); setTimeout(() => row.classList.remove("flash"), 2200); }, 150);
    });
  }

  // Hover card: standardized + visual (what it is · industry range · effect chips · our call)
  const IND_NAME = { online: "Online", service: "Customer service", experience: "Shopping experience", vendor: "Vendor management", analytics: "Customer analytics",
    markupLow: "Markup · lower-cost", markupHigh: "Markup · higher-cost", breadthLow: "Breadth · lower-cost", breadthHigh: "Breadth · higher-cost",
    depthLow: "Depth · lower-cost", depthHigh: "Depth · higher-cost", pbLow: "Private brand · lower", pbHigh: "Private brand · higher",
    pbQuality: "Private brand quality", nbQuality: "National brand quality", stores: "Stores" };
  function effectChips(base, d) {
    const r0 = model(base), r1 = model(d), out = [];
    r1.sc.forEach((v, i) => { const x = v - r0.sc[i]; if (Math.abs(x) >= 0.01) out.push([Q[i], x, (x > 0 ? "+" : "−") + Math.abs(x).toFixed(2)]); });
    const ni = r1.niProj - r0.niProj, mv = r1.mv - r0.mv;
    out.push(["Profit", ni, (ni >= 0 ? "+" : "−") + "$" + Math.abs(ni).toFixed(1) + "M"]);
    out.push(["Value", mv, (mv >= 0 ? "+" : "−") + "$" + Math.abs(mv).toFixed(0) + "M"]);
    return out.map(([n, x, t]) => `<span class="ec ${Math.abs(x) < 0.005 ? "z" : x > 0 ? "p" : "n"}">${x > 0.005 ? "▲" : x < -0.005 ? "▼" : "•"} ${n} <b>${t}</b></span>`).join("");
  }
  function showLeverTip(row, L) {
    const I = (S.leverInfo || {})[L.key]; if (!I) return;
    let tip = document.getElementById("levTip");
    if (!tip) { tip = document.createElement("div"); tip.id = "levTip"; document.body.appendChild(tip); }
    const base = Object.assign({}, state.d), now = base[L.key], was = S.defaults[L.key];
    const fmt = v => L.unit === "$M" ? "$" + v + "M" : v + (L.unit === "%" ? "%" : "");
    // industry range bar from the latest round's industry table
    const R = S.rounds[S.rounds.length - 1], ind = (R.industry || []).find(x => x.name === IND_NAME[L.key]);
    let range = "";
    if (ind) {
      const lo = Math.min(ind.min, now), hi = Math.max(ind.max, now), pos = v => ((v - lo) / Math.max(hi - lo, 1e-6) * 100).toFixed(1);
      range = `<div class="lt-sec lt-range">Vs the industry</div><div class="rb lt-range"><div class="rb-line"></div><div class="rb-avg" style="left:${pos(ind.avg)}%"></div><div class="rb-us" style="left:${pos(now)}%"></div></div>
        <div class="rb-lab lt-range"><span>min ${fmt(+(+ind.min).toFixed(1))}</span><span>avg ${fmt(+(+ind.avg).toFixed(1))}</span><span>max ${fmt(+(+ind.max).toFixed(1))}</span></div>`;
    }
    const step = STEP[L.key] || 1, up = Object.assign({}, base, { [L.key]: Math.min(L.max, now + step) });
    const yours = now !== was ? `<div class="lt-sec">Your change ${fmt(was)} → ${fmt(now)}</div><div class="ecs">${effectChips(Object.assign({}, base, { [L.key]: was }), base)}</div>` : "";
    const verb = (I.longTerm || "").split(/[ ;,]/)[0].toLowerCase();
    const cls = { raise: "raise", test: "test", trim: "trim", cut: "trim", hold: "hold", keep: "hold" }[verb] || "hold";
    const why = (I.why || "").split(/(?<=[.;])\s/)[0].replace(/;$/, ".");
    const col = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }[I.conf];
    const bu = I.build ? `<div class="lt-build bu-${I.build[0]}"><b>${I.build[1]}</b> ${I.build[2]}</div>` : "";
    tip.innerHTML = `<div class="lt-h">${L.label} <span style="color:${col};border-color:${col}">${I.conf}</span></div>
      <div class="lt-plain">${(I.what || I.plain || "").replace(/\s*\(e\.g\.[^)]*\)/, "")}</div>${bu}
      ${range}
      <div class="lt-sec">If we raise it by ${fmt(step)}</div><div class="ecs">${effectChips(base, up)}</div>
      ${(() => { const X = (S.explore || []).find(x => x.change[L.key] != null); if (!X) return "";
        const dv = model(Object.assign({}, base, X.change)).mv - model(base).mv, cc = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }[X.conf];
        return `<div class="lt-x"><div class="lt-xh"><b>Worth exploring: ${X.label}</b><span class="${dv >= 0 ? "pos" : "neg"}">${dv >= 0 ? "+" : "−"}$${Math.abs(dv).toFixed(0)}M</span></div>
          <div>${X.why || ""}</div><div class="lt-xw">When: ${X.when} · <span style="color:${cc}">${X.conf} confidence</span></div></div>`; })()}
      ${yours}
      <div class="lt-call"><span class="cb ${cls}">${verb ? verb[0].toUpperCase() + verb.slice(1) : "Hold"}</span><span>${(I.longTerm || "").replace(/^\w+\s*/, "")}${why ? " · " + why : ""}</span></div>`;
    const r = row.getBoundingClientRect();
    tip.style.display = "block"; tip.classList.add("see");
    const mx = document.getElementById("ql1") && document.getElementById("ql1").parentElement.getBoundingClientRect();
    if (r.right + 14 + 390 <= window.innerWidth) {
      tip.style.left = (r.right + 14) + "px";
      // sit below the Kahn matrix so the quadrant bars stay visible
      const below = mx && mx.bottom > 0 ? mx.bottom + 8 : r.top;
      tip.classList.remove("compact");
      if (below + tip.offsetHeight > window.innerHeight - 10) tip.classList.add("compact");   // drop the range bar to fit under the matrix
      tip.style.top = Math.max(10, Math.min(Math.max(r.top, below), window.innerHeight - tip.offsetHeight - 10)) + "px";
    } else {
      tip.style.left = Math.max(10, Math.min(r.left, window.innerWidth - 390)) + "px";
      const below = r.bottom + 8, above = r.top - tip.offsetHeight - 8;
      tip.style.top = (below + tip.offsetHeight < window.innerHeight || above < 10 ? below : above) + "px";
    }
  }
  function placeTip(tip, el) {
    const r = el.getBoundingClientRect(); tip.style.display = "block";
    const left = r.left - 14 - 370 >= 10 ? r.left - 14 - 370 : Math.max(10, Math.min(r.right + 14, window.innerWidth - 380));
    tip.style.left = left + "px";
    tip.style.top = Math.max(10, Math.min(r.top, window.innerHeight - tip.offsetHeight - 10)) + "px";
  }
  // Hover cards for the value panel (market value, checks) — same standardized look as lever cards
  function showInfoTip(el, key) {
    const r = state.last; if (!r) return;
    let tip = document.getElementById("levTip");
    if (!tip) { tip = document.createElement("div"); tip.id = "levTip"; document.body.appendChild(tip); }
    const chip = (t, x) => `<span class="ec ${x > 0 ? "p" : x < 0 ? "n" : "z"}">${t}</span>`;
    const call = (cls, verb, txt) => `<div class="lt-call"><span class="cb ${cls}">${verb}</span><span>${txt}</span></div>`;
    const bar = (v, max, mark, lab) => `<div class="rb"><div class="rb-line"></div>${mark != null ? `<div class="rb-avg" style="left:${Math.min(100, mark / max * 100)}%"></div>` : ""}<div class="rb-us" style="left:${Math.min(100, v / max * 100)}%"></div></div><div class="rb-lab"><span>0</span><span>${lab}</span><span>${max}</span></div>`;
    let h = "";
    if (key === "mv") {
      const pe = r.mv / Math.max(r.niProj, 0.1), base = model(S.defaults);
      const drivers = LEVERS.filter(L => Math.abs(state.d[L.key] - S.defaults[L.key]) > 1e-6).map(L => {
        const one = Object.assign({}, S.defaults, { [L.key]: state.d[L.key] }); return [L.label, model(one).mv - base.mv]; })
        .sort((x, y) => Math.abs(y[1]) - Math.abs(x[1])).slice(0, 5);
      h = `<div class="lt-h">Projected market value <span style="color:#9a6700;border-color:#9a6700">Medium</span></div>
        <div class="lt-plain">Market value = <b>P/E × net income</b>. True in every round so far.</div>
        <div class="lt-sec">The math</div><div class="ecs">${chip("Net income " + fmtM(r.niProj), 1)}${chip("× P/E " + pe.toFixed(1), 0)}${chip("= " + fmtM(r.mv), 1)}</div>
        <div class="lt-sec">vs changing nothing (${fmtM(base.mv)})</div><div class="ecs">${drivers.length ? drivers.map(([n, v]) => chip(`${v >= 0 ? "▲" : "▼"} ${n} <b>${v >= 0 ? "+" : "−"}$${Math.abs(v).toFixed(0)}M</b>`, v)).join("") : chip("No changes", 0)}</div>
        <div class="lt-sec">Why it grows anyway</div><div class="lt-plain">Revenue grows ≈10% a year while spending stays flat, so profit rises; debt keeps falling, cutting interest.</div>
        ${call("hold", "Goal", "Protect profit and hold two quadrant leads (keeps P/E up). Path to ≈$1.5B+ by Round 8.")}`;
    } else if (key === "lead" || key === "fair") {
      const rows = r.cls.map(c => { const pctL = c.score / c.leader * 100;
        return `<div class="qrow"><span class="qn2">${c.q}</span><div class="rb" style="flex:1;margin:0 8px"><div class="rb-line"></div><div class="rb-avg" style="left:75%"></div><div class="rb-us" style="left:${Math.min(100, pctL).toFixed(0)}%"></div></div><span class="ec ${c.status === "LEAD" ? "p" : c.status === "GAP" ? "n" : "z"}">${c.status === "LEAD" ? "Lead" : c.status === "GAP" ? "Gap" : "Fair"} ${pctL.toFixed(0)}%</span></div>`; }).join("");
      h = key === "lead" ? `<div class="lt-h">Lead 2 quadrants <span style="color:#1a7f37;border-color:#1a7f37">High</span></div>
          <div class="lt-plain">The professor: value rises most when we lead (or are within ≈5% of the leader in) <b>two</b> quadrants.</div>
          <div class="lt-sec">Our score as % of the leader (tick = 75% fair value)</div>${rows}
          ${call("raise", "Do", "Keep Brand quality at 6 and push shopping experience so Experience passes Zephara.")}`
        : `<div class="lt-h">Fair value everywhere <span style="color:#9a6700;border-color:#9a6700">Medium</span></div>
          <div class="lt-plain">The other two quadrants should be at least <b>75% of the leader</b>.</div>
          <div class="lt-sec">Our score as % of the leader (tick = 75%)</div>${rows}
          ${call("hold", "Accept", "Frictionless is below fair, but closing the gap costs ≈$15M a year (≈ −$150M of value). Nudge it with service, not online.")}`;
    } else if (key === "roic") {
      h = `<div class="lt-h">ROIC beats WACC <span style="color:#1a7f37;border-color:#1a7f37">High</span></div>
        <div class="lt-plain">ROIC = what we earn on each $ invested; WACC = what that money costs us. Earning more than it costs = <b>creating value</b>.</div>
        <div class="lt-sec">This plan</div><div class="ecs">${chip("ROIC " + r.roic.toFixed(1) + "%", 1)}${chip("WACC " + r.wacc.toFixed(1) + "%", 0)}${chip("Spread " + (r.roic - r.wacc >= 0 ? "+" : "") + (r.roic - r.wacc).toFixed(1) + " pts", r.roic - r.wacc)}</div>
        <div class="lt-plain" style="margin-top:6px">Game data: WACC rose 7.8% → 11.6% as our value grew (more of our capital is now equity, which costs more), so P/E slipped 16.6 → 15.2.</div>
        ${call("hold", "Keep", "Profits growing faster than invested capital. Avoid new stores (more capital, little return).")}`;
    } else if (key === "budget") {
      const pct = r.spend / S.base.budget;
      h = `<div class="lt-h">Within budget <span style="color:#1a7f37;border-color:#1a7f37">High</span></div>
        <div class="lt-plain">Budget this round: <b>${fmtM(S.base.budget)}</b>. We don't have to spend it all.</div>
        <div class="lt-sec">Spend vs budget</div>${bar(+(r.spend).toFixed(1), +(S.base.budget).toFixed(1), null, fmtM(r.spend) + " (" + (pct * 100).toFixed(0) + "%)")}
        <div class="ecs" style="margin-top:6px">${chip("Unspent " + fmtM(Math.max(0, S.base.budget - r.spend)), 1)}</div>
        ${call("raise", "Rule", "Rounds 5–7: spend the full budget, but only on levers that build up (shopping experience, then online). Final round: cut hard. Padding service/vendor/analytics is pure cost.")}`;
    } else if (key === "credit") {
      h = `<div class="lt-h">Credit rating <span style="color:#9a6700;border-color:#9a6700">Medium</span></div>
        <div class="lt-plain">A 0–9 score from three ratios. Better rating = cheaper borrowing.</div>
        <div class="lt-sec">This plan · rating ${r.rating} / 9</div><div class="ecs">${chip("Current ratio " + r.cr.toFixed(2), r.cr >= 1 ? 1 : -1)}${chip("Interest cover " + r.cov.toFixed(1) + "×", r.cov >= 3 ? 1 : -1)}${chip("Debt/equity " + r.DE.toFixed(2), r.DE <= 1 ? 1 : -1)}</div>
        <div class="lt-plain" style="margin-top:6px">Game data: our interest rate fell 9.5% → 7.2% as debt dropped from $287M to $167M.</div>
        ${call("hold", "Keep", "Let profit keep paying debt down; no new stores (they add debt).")}`;
    }
    tip.innerHTML = h; placeTip(tip, el);
  }
  function bindValueTips() {
    const on = (sel, fn) => { const el = document.querySelector(sel); if (!el || el.dataset.tipOn) return; el.dataset.tipOn = 1;
      el.addEventListener("mouseover", e => fn(e)); el.addEventListener("mouseleave", hideLeverTip); };
    on("#checks", e => { const li = e.target.closest("li[data-tip]"); if (li) showInfoTip(li, li.dataset.tip); });
    on("#minor", e => { const li = e.target.closest("li[data-k]"); if (!li) return; const L = LEVERS.find(x => x.key === li.dataset.k); if (L) { showLeverTip(li, L); placeTip(document.getElementById("levTip"), li); } });
    on("#explore", e => { const li = e.target.closest("li[data-k]"); if (!li) return; const L = LEVERS.find(x => x.key === li.dataset.k); if (L) { showLeverTip(li, L); placeTip(document.getElementById("levTip"), li); } });
    on("#moves", e => { const li = e.target.closest("li[data-k]"); if (!li) return; const L = LEVERS.find(x => x.key === li.dataset.k); if (L) { showLeverTip(li, L); placeTip(document.getElementById("levTip"), li); } });
    const mvBox = document.getElementById("mv"); if (mvBox && !mvBox.dataset.tipOn) { mvBox.dataset.tipOn = 1;
      [mvBox, document.getElementById("mvDelta"), document.getElementById("mvMethod")].forEach(x => { x.addEventListener("mouseenter", () => showInfoTip(mvBox, "mv")); x.addEventListener("mouseleave", hideLeverTip); }); }
  }
  function hideLeverTip() { const t = document.getElementById("levTip"); if (t) t.style.display = "none"; }

  function syncLevers(except) {
    document.querySelectorAll("#levers input").forEach(inp => {
      if (inp === except) return;
      inp.value = state.d[inp.dataset.k];
    });
    // "was" line + undo: compare with what was loaded (plan) and last round
    const base = state.baseD || S.defaults;
    const recP = (S.plans || []).find(p => p.badge === "Recommended"), rec = Object.assign({}, S.defaults, recP ? recP.levers : {});
    LEVERS.forEach(L => {
      const f = v => L.unit === "$M" ? "$" + v + "M" : v + (L.unit === "%" ? "%" : "");
      const w = document.querySelector(`[data-was="${L.key}"]`), u = document.querySelector(`[data-undo="${L.key}"]`);
      if (!w) return;
      const last = S.defaults[L.key], rv = rec[L.key], b = base[L.key], now = state.d[L.key];
      const chip = (lbl, v) => `<button class="set-v ${Math.abs(now - v) < 1e-9 ? "on" : ""}" data-setk="${L.key}" data-setv="${v}" title="Set to ${f(v)}">${lbl} <b>${f(v)}</b></button>`;
      const xi = (S.explore || []).findIndex(x => x.change[L.key] != null);
      const xchip = xi >= 0 ? `<button class="set-v xp" data-xp="${xi}" title="${S.explore[xi].label}">Explore <b>${f(S.explore[xi].change[L.key])}</b></button>` : "";
      w.innerHTML = (Math.abs(last - rv) < 1e-9 ? chip("Last round = recommended", last) : chip("Last round", last) + chip("Recommended", rv)) + xchip;
      u.style.visibility = Math.abs(now - b) > 1e-9 && Math.abs(b - last) > 1e-9 && Math.abs(b - rv) > 1e-9 ? "visible" : "hidden";
    });
  }

  function openCockpit(fromAI) {
    if (!state.baseD) state.baseD = Object.assign({}, state.d);
    show("cockpit");
    syncLevers();
    state.shownMV = S.base.marketValue;
    update();
    $("#aiBadge").style.display = fromAI ? "" : "none";
  }

  // Each rival's strongest quadrant = where it is "maximizing"
  function focusOf(name) {
    const v = S.rivals[name]; return v.indexOf(Math.max(...v));
  }
  function planTargets(r) {
    if (state.segs.length) return targetQuads(state.segs);
    return r.cls.map((c, i) => [c.ratio, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(x => x[1]);
  }
  function renderQuads(r, base) {
    const targets = planTargets(r);
    const order = [0, 1, 2, 3];
    order.forEach(i => {
      const c = r.cls[i], isT = targets.includes(i);
      const all = Object.keys(S.rivals).map(n => ({ n, v: n === S.company ? r.sc[i] : S.rivals[n][i] }))
        .sort((a, b) => b.v - a.v);
      const rows = all.filter((x, k) => x.n === S.company || (x.n !== S.company && x.v === Math.max(...all.filter(y => y.n !== S.company).map(y => y.v))));
      const scaleMax = 10;
      const need = isT ? 0.95 * c.leader : c.fair;
      const ok = r.sc[i] >= need - 0.05;
      const play = isT
        ? `<b>WIN</b> <span class="${ok ? "hit" : "miss"}">${ok ? "✓ on track" : "need +" + (need - r.sc[i]).toFixed(1)}</span>`
        : `<b>HOLD</b> <span class="${ok ? "hit" : "miss"}">${ok ? "✓ safe" : "need +" + (need - r.sc[i]).toFixed(1)}</span>`;
      const bars = rows.map((row, k) => {
        const me = row.n === S.company;
        const star = !me && focusOf(row.n) === i ? ' <span class="star">★</span>' : "";
        const last = me ? `<i class="last" style="left:${base[i] / scaleMax * 100}%"></i>` : "";
        return `<div class="brow ${me ? "me" : ""} ${k === 0 && !me ? "lead1" : ""}"><span class="nm">${row.n}${star}</span>
          <span class="tr"><i class="fl" style="width:${row.v / scaleMax * 100}%"></i>${last}</span><span class="vl">${row.v.toFixed(1)}</span></div>`;
      }).join("");
      const el = $("#ql" + i);
      el.className = "quad" + (isT ? " target" : "");
      el.innerHTML = `<div class="qhead"><span class="qn">${c.q}</span><span class="qst ${c.status.toLowerCase()}">${c.status}</span></div>
        <div class="play">${play}</div>
        <div class="bars">${bars}<div class="fairline" style="left:calc(100px + (100% - 142px) * ${c.fair / scaleMax})"></div></div>`;
    });
  }

  // Narrow screens: the quadrants scroll away, so a slim bar at the bottom keeps the 4 scores + value in view
  function renderMiniBar() {
    let el = document.getElementById("miniBar"); if (!el) { document.body.insertAdjacentHTML("beforeend", '<div id="miniBar"></div>'); el = document.getElementById("miniBar"); }
    const r = model(state.d), st = r.cls.map(c => c.status);
    el.innerHTML = `<b>${fmtM(r.mv)}</b>` + Q.map((q, i) => `<span class="mb-${st[i].toLowerCase()}">${q} ${r.sc[i].toFixed(1)} <i>${st[i]}</i></span>`).join("") + `<span class="mb-sp">${fmtM(r.spend)} / ${fmtM(S.base.budget)}</span>`;
  }
  function update() {
    autoFillTitle(); renderAskSugg(); setTimeout(renderMiniBar, 0);
    const d = state.d, r = model(d);
    const base = S.rivals[S.company];
    renderQuads(r, base);

    // Market value
    const delta = r.mv - S.base.marketValue;
    animateMV(r.mv);
    const dEl = $("#mvDelta");
    dEl.textContent = (delta >= 0 ? "▲ " : "▼ ") + fmtM(Math.abs(delta)).replace("−", "") + "  (" + (delta >= 0 ? "+" : "−") + Math.abs(delta / S.base.marketValue * 100).toFixed(0) + "%)";
    dEl.className = "mv-delta " + (delta >= 0 ? "up" : "down");
    $("#mvMethod").textContent = "Scored by " + r.method + " · horizon T = " + r.T + " yrs";

    // Methods mini bars
    const spread = r.roic - r.wacc;
    const pct = r.spend / S.base.budget;

    // Checks
    const checks = [
      [r.leads === 2, `Lead 2 quadrants`, `${r.leads} leading`],
      [r.gaps === 0, `Fair value everywhere`, r.gaps ? r.cls.filter(c => c.status === "GAP").map(c => c.q).join(", ") + " below" : "all clear"],
      [spread > 0, `ROIC beats WACC`, (spread >= 0 ? "+" : "") + spread.toFixed(1) + " pts"],
      [pct <= 1.0001, `Within budget`, pct > 1 ? fmtM(r.spend - S.base.budget) + " over" : fmtM(S.base.budget - r.spend) + " left"],
      [r.rating >= 6, `Credit rating healthy`, r.rating + " / 9"]
    ];
    const tipKeys = ["lead", "fair", "roic", "budget", "credit"];
    $("#checks").innerHTML = checks.map(([ok, t, s], i) => `<li data-tip="${tipKeys[i]}" class="${ok ? "ok" : "no"}"><span class="ic">${ok ? "✓" : "!"}</span><span class="ct">${t}</span><span class="cs">${s}</span></li>`).join("");
    renderStory(r);
    renderEntries();
    state.last = r;
  }

  // "Type this into the game": changed boxes, in game-screen order
  function renderEntries() {
    const box = $("#entryList"); if (!box) return;
    const fmt = (L, v) => L.unit === "$M" ? "$" + (+v.toFixed(2)) + "M" : (+v.toFixed(2)) + (L.unit === "%" ? "%" : "");
    const ch = LEVERS.filter(L => Math.abs(state.d[L.key] - S.defaults[L.key]) > 1e-9);
    const spend = state.d.online + state.d.service + state.d.experience + state.d.vendor + state.d.analytics;
    box.innerHTML = `<div class="en-h"><b>Type this into the game</b></div>` +
      (ch.length ? `<ol class="en-list">${ch.map(L => `<li><span>${L.label}</span><b>${fmt(L, S.defaults[L.key])} → <em>${fmt(L, state.d[L.key])}</em></b></li>`).join("")}</ol>`
        : `<div class="en-none">No changes from last round.</div>`) +
      `<div class="en-foot">All other boxes: same as last round · investments total ${fmt({ unit: "$M" }, spend)} of $${S.base.budget}M</div>`;
  }

  // Quadrant colors for the money bar (one accent family, different strengths)
  const QCOL = { "Brand": "#9DB0FF", "Experience": "#2E5BFF", "Low Price": "#1B2F8A", "Frictionless": "#5F80FF", "Other": "#55545C" };
  function renderStory(r) {
    const d = state.d, t = planTargets(r);
    const holds = [0, 1, 2, 3].filter(i => !t.includes(i));
    $("#storyLine").innerHTML = `${state.team || "Team 4"} plan: <span class="win">WIN ${Q[t[0]]} + ${Q[t[1]]}</span><br>
      <span class="hold">HOLD fair value in ${Q[holds[0]]} + ${Q[holds[1]]}</span>
      <small>${r.leads === 2 && r.gaps === 0 ? "✓ This plan hits every Kahn rule" : r.leads === 2 ? "Leads 2 ✓ · close the fair-value gaps over the next rounds" : "Not leading 2 yet · shift money toward the WIN quadrants"}</small>`;
    const items = [
      ["Vendor mgmt", d.vendor, "Low Price"], ["Online", d.online, "Frictionless"], ["Experience", d.experience, "Experience"],
      ["Service", d.service, "Frictionless"], ["Analytics", d.analytics, "Other"],
      ["New stores", Math.max(0, d.stores - S.defaults.stores) * 1.75, "Other"]
    ].filter(x => x[1] > 0);
    const total = Math.max(S.base.budget, r.spend);
    $("#moneyBar").innerHTML = items.map(([n, v, q]) =>
      `<div style="flex-basis:${v / total * 100}%;background:${QCOL[q]}" title="${n} $${v}M">${v / total > 0.2 ? n + " $" + Math.round(v) + "M" : v / total > 0.08 ? "$" + Math.round(v) + "M" : ""}</div>`).join("");
    $("#moneyTxt").textContent = fmtM(r.spend) + " of " + fmtM(S.base.budget);

    const moves = LEVERS.map(L => ({ L, dv: d[L.key] - S.defaults[L.key] }))
      .filter(m => Math.abs(m.dv) > 1e-6)
      .sort((a, b) => Math.abs(b.dv) / (b.L.max - b.L.min) - Math.abs(a.dv) / (a.L.max - a.L.min)).slice(0, 5);
    const fmtV = (L, v) => L.unit === "$M" ? "$" + (+v.toFixed(1)) + "M" : (+v.toFixed(1)) + (L.unit || "");
    $("#moves").innerHTML = moves.length ? moves.map(m => `<li data-k="${m.L.key}" class="${m.dv > 0 ? "upm" : "dnm"}"><span class="ar">${m.dv > 0 ? "▲" : "▼"}</span>
      <span>${m.L.label}</span><b>${fmtV(m.L, S.defaults[m.L.key])} → ${fmtV(m.L, d[m.L.key])}</b></li>`).join("")
      : `<li><span></span><span style="color:var(--muted)">Same as last round</span></li>`;
    // smaller calls: levers we keep (skip any the user has changed)
    if ($("#minor") && S.minorCalls) $("#minor").innerHTML = S.minorCalls.filter(([k]) => Math.abs(d[k] - S.defaults[k]) < 1e-6)
      .map(([k, call, why]) => `<li data-k="${k}"><span class="mn">${k === "pbQuality" ? "Brand quality" : (LEVERS.find(x => x.key === k) || {}).label.split(" · ")[0]}</span><b>${call.replace(/^Quality: /, "")}</b><small>${why}</small></li>`).join("");
    // ideas worth exploring: live model effect vs the current sliders
    if ($("#explore") && S.explore) {
      const CC = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" };
      $("#explore").innerHTML = S.explore.map((x, i) => {
        const dd = Object.assign({}, d, x.change), dv = model(dd).mv - r.mv;
        return `<li data-k="${Object.keys(x.change)[0]}" data-x="${i}"><span class="mn">${x.label}</span><b class="${dv >= 0 ? "pos" : "neg"}">${dv >= 0 ? "+" : "−"}$${Math.abs(dv).toFixed(0)}M</b>
          <small>${x.when} · <span style="color:${CC[x.conf]}">${x.conf}</span></small><button class="xtry" data-x="${i}">Try</button></li>`; }).join("");
      document.querySelectorAll(".xtry").forEach(b => b.onclick = e => { e.stopPropagation(); Object.assign(state.d, S.explore[+b.dataset.x].change); syncLevers(); update(); });
    }
  }

  let mvAnim;
  function animateMV(target) {
    cancelAnimationFrame(mvAnim);
    const from = state.shownMV, t0 = performance.now();
    const stepF = now => {
      const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3);
      state.shownMV = from + (target - from) * e;
      $("#mv").textContent = fmtM(state.shownMV);
      if (k < 1) mvAnim = requestAnimationFrame(stepF);
    };
    mvAnim = requestAnimationFrame(stepF);
  }

  // ---------- Data panel ----------
  function openData() {
    const B = S.base;
    const fields = [["revenue", "Revenue $M"], ["cogs", "COGS $M"], ["budget", "Budget $M"], ["cash", "Cash $M"], ["debt", "Long-term debt $M"],
      ["equity", "Shareholder equity $M"], ["interest", "Interest expense $M"], ["wacc", "WACC %"], ["marketValue", "Market value $M"], ["clv", "Customer lifetime value $M"]];
    $("#dataFin").innerHTML = fields.map(([k, l]) => `<label>${l}<input type="number" step="0.1" data-f="${k}" value="${B[k]}"></label>`).join("");
    const names = Object.keys(S.rivals);
    $("#dataRivals").innerHTML = `<tr><th></th>${Q.map(q => `<th>${q}</th>`).join("")}</tr>` +
      names.map(n => `<tr><td>${n}</td>${S.rivals[n].map((v, i) => `<td><input type="number" step="0.1" min="0" max="10" data-r="${n}" data-i="${i}" value="${v}"></td>`).join("")}</tr>`).join("");
    renderHistory();
    $("#dataRound").value = S.round;
    $("#dataPanel").classList.add("open");
  }
  function renderHistory() {
    const h = S.history.slice().sort((a, b) => a.round - b.round);
    const W = 520, H = 160, P = 30;
    const maxV = Math.max(...h.map(x => x.marketValue), 300) * 1.1;
    const x = r => P + (r / 8) * (W - 2 * P), y = v => H - P - (v / maxV) * (H - 2 * P);
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="hist">`;
    for (let r = 0; r <= 8; r++) svg += `<text x="${x(r)}" y="${H - 8}" class="ht">R${r}</text>`;
    svg += `<polyline points="${h.map(p => x(p.round) + "," + y(p.marketValue)).join(" ")}" class="hl"/>`;
    h.forEach(p => svg += `<circle cx="${x(p.round)}" cy="${y(p.marketValue)}" r="5" class="hd"/><text x="${x(p.round)}" y="${y(p.marketValue) - 10}" class="hv">$${Math.round(p.marketValue)}M</text>`);
    $("#histChart").innerHTML = svg + "</svg>";
  }
  function saveData() {
    document.querySelectorAll("#dataFin input").forEach(i => { const v = parseFloat(i.value); if (!isNaN(v)) S.base[i.dataset.f] = v; });
    document.querySelectorAll("#dataRivals input").forEach(i => { const v = parseFloat(i.value); if (!isNaN(v)) S.rivals[i.dataset.r][+i.dataset.i] = v; });
    const rd = parseInt($("#dataRound").value, 10);
    if (!isNaN(rd)) {
      S.round = rd;
      S.history = S.history.filter(p => p.round !== rd - 1).concat([{ round: rd - 1, marketValue: S.base.marketValue, revenue: S.base.revenue, wacc: S.base.wacc }]);
    }
    if ($("#useSubmitted").checked && state.d) Object.assign(S.defaults, state.d);
    S.base.interest = S.base.interest || 0.1;
    save(); calibrate();
    state.d = Object.assign({}, S.defaults);
    $("#dataPanel").classList.remove("open");
    renderStart(); openCockpit(false);
  }

  function exportPlan() {
    const d = state.d, r = state.last;
    const txt = `Getchells · Round ${S.round} decision (${state.team || "Team"})${state.plan ? " · Plan " + state.plan.id + " " + state.plan.name : ""}\n` +
      LEVERS.map(L => `${L.label}: ${L.unit === "$M" ? "$" + d[L.key] + "M" : d[L.key] + (L.unit || "")}`).join("\n") +
      `\n\nProjected market value: ${fmtM(r.mv)} · ROIC ${r.roic.toFixed(1)}% vs WACC ${r.wacc.toFixed(1)}%\n` +
      r.cls.map(c => `${c.q}: ${c.score.toFixed(1)} (${c.status})`).join(" · ");
    navigator.clipboard && navigator.clipboard.writeText(txt).catch(() => {});
    const b = $("#exportBtn"); const o = b.textContent; b.textContent = "Copied ✓"; setTimeout(() => b.textContent = o, 1400);
  }

  // ---------- Wire up ----------
  document.addEventListener("DOMContentLoaded", () => {
    loadSaved(); calibrate(); buildLevers(); $("#teamName").value = state.team; renderStanding(); renderLandscape(); renderEdges(); renderPlans(); renderImpacts(); renderTimeline(); renderStart(); renderLearn(); initAsk(); bindValueTips(); renderZeph(); renderRecap(); initPaste(); window.__model = model; window.__calibrate = () => calibrate(); renderTeamCmp(); autoFillTitle(); liveStart(); if (S.gameOver) gameOverUI();
    $("#goBtn").onclick = runCopilot;
    
    $("#resetBtn").onclick = () => { state.d = Object.assign({}, state.baseD || S.defaults); syncLevers(); update(); $("#aiBadge").style.display = "none"; };
    document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => show(b.dataset.go));
    $("#dataBtn").onclick = openData;
    $("#dataClose").onclick = () => $("#dataPanel").classList.remove("open");
    $("#dataSave").onclick = saveData;
    if ($("#exportBtn")) $("#exportBtn").onclick = exportPlan;
    $("#manualBtn").onclick = () => { state.team = $("#teamName").value.trim() || "Team 4"; state.d = Object.assign({}, S.defaults); openCockpit(false); };
  });

  window.__copilot = { askAnswer, calibrate, model, optimize, targetQuads, get scale() { return SCALE; } };
})();
