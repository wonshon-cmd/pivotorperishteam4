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
    { key: "vendor",      label: "Vendor management", unit: "$M", min: 0,  max: 70,  step: 1,   q: "Low Price",    group: "Invest" },
    { key: "online",      label: "Online",            unit: "$M", min: 0,  max: 25,  step: 0.5, q: "Frictionless", group: "Invest" },
    { key: "experience",  label: "Shopping experience", unit: "$M", min: 0, max: 30, step: 0.5, q: "Experience",   group: "Invest" },
    { key: "service",     label: "Customer service",  unit: "$M", min: 0,  max: 25,  step: 0.5, q: "Frict. / Exp.", group: "Invest" },
    { key: "analytics",   label: "Customer analytics", unit: "$M", min: 0, max: 15,  step: 0.5, q: "Multiplier",   group: "Invest" },
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
    const b = S.rivals[S.company], d0 = S.defaults;
    const am = 0.8 + 0.2 * Math.sqrt(Math.max(d.analytics, 0) / 10);   // analytics = multiplier
    const am0 = 0.8 + 0.2 * Math.sqrt(Math.max(d0.analytics, 0) / 10);
    const f = (dd, m) => [
      // R1 A/B: quality 6/6 vs 5/5 ≈ +0.4. R0→R1 (both runs): PB 50→60% + depth 50→30 cost Brand −1.6 (split 50/50, low confidence)
      0.2 * dd.pbQuality + 0.2 * dd.nbQuality - 0.08 * mix(dd, "pb") + 0.04 * mix(dd, "depth"),
      m * 2.34 * sq(dd.experience, 10) + 6.85 * (1 - Math.exp(-dd.service / 5.2)), // v6: service SATURATES (R3: +$2M → only ≈+0.12); fits try 1, R1 final, R2, R3 exactly
      1.0 * sq(dd.vendor, 30) - 0.07 * dd.markupLow - 0.035 * dd.markupHigh,
      m * 0.08 * Math.log(Math.max(dd.online, 0.5) / 2) + 2.5 * sq(dd.service, 15) // R0→R2: online $2M→$10.5M moved Frictionless only +0.1
    ];
    const now = f(d, am), then = f(d0, am0);
    const dr = S.drift || [0, 0, 0, 0]; // standing still loses ground (R2: Experience −0.1)
    return b.map((v, i) => clamp(v + now[i] - then[i] + dr[i], 0, 10));
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
    idx = 1 + 0.2 * (idx - 1);
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
      * Math.pow(mix(d, "breadth") / mix(D0, "breadth"), 0.15); // breadth = customers' #2 value (1.41); low confidence, never tested
    const revenue = B.revenue * vol * (1 + mB) / (1 + m0) * (1 + (S.base.growth || 0) * (S.noGrowth ? 0 : 1));

    // Gross margin held 36.2–36.3% in R0–R2 despite quality 5→6 and vendor 30→25: cost effects are small
    const costIdx = (dd) => 1 - 0.03 * sq(dd.vendor, 30) + 0.003 * (dd.pbQuality - 5) + 0.003 * (dd.nbQuality - 5) - 0.0004 * (mix(dd, "pb") - 50);
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
    const debt = Math.max(0, B.debt + 0.6 * (openCapex + onlineCap) - closeRecover - invFreed - retained);
    const cash = B.cash - 0.4 * (openCapex + onlineCap);
    const stLoans = Math.max(0, debt - (B.debt - (B.stLoans || 158.4)));
    const DE = debt / B.equity, DE0 = B.debt / B.equity;

    // Credit rating 0–9 from the professor's three ratios
    const ratingOf = (cr, cov, de) => clamp(Math.round(
      3 * clamp((cr - 0.5) / 1.5, 0, 1) + 3 * clamp((cov - 0.5) / 5.5, 0, 1) + 3 * clamp((3.5 - de) / 3, 0, 1)), 0, 9);
    const avgDebt0 = (B.debt + (B.debtPrev || B.debt)) / 2;
    const rate0 = B.interest / avgDebt0 * 100; // interest ≈ 9.5% of average debt in R1 and R2
    const ebit0 = S.base.ebit0 || ebit;
    const cr0 = (B.cash + B.receivables + B.inventory) / (B.ap + (B.stLoans || 158.4));
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
    const mvK = Math.exp(0.10 * ((sc[0] - S.rivals[S.company][0]) + (sc[1] - S.rivals[S.company][1])));
    // Fitted on R1 try 1, R1 final, R2: market value ≈ P/E × net income (all within 1%)
    const niProj = (ebit - interest) * 0.65 * (S.base.niK || 1);
    const mv = S.base.pe ? Math.max(S.base.pe * (S.base.peDrift || 1) * Math.max(niProj, 0) * mvK, liq) : Math.max(dcf, clvVal, liq) * mvK;
    const method = S.base.pe ? "P/E × net income" : mv === dcf ? "DCF" : mv === clvVal ? "CLV / brand" : "Liquidation";

    const spend = d.online + d.service + d.experience + d.vendor + d.analytics + Math.max(0, newStores) * 1.75;

    return { niProj, sc, cls, leads, gaps, revenue, gross, ebit, roic, wacc, rate, rating, debt, cash, T, g, interest, cr, cov, DE, inventory,
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
    const nav = { stand: "stand", rivals: "rivals", start: "start", thinking: "start", cockpit: "start", timeline: "timeline", guide: "guide", learn: "learn" }[id];
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
      const list = rows.map(r => {
        const pos = all.indexOf(r) + 1, why = (S.why && S.why[r.n] && S.why[r.n][i]) || "";
        return `<div class="lr ${r.n === S.company ? "me" : ""}"><span class="lpos">${pos}</span>
          <div><div class="ln">${r.n} <b>${r.v.toFixed(1)}</b></div><div class="lw">${why}</div></div></div>`;
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
    $("#tlPlans").innerHTML = S.plans.map(p => `<button class="chipbtn ${p.id === tlPlan ? "on" : ""}" data-tl="${p.id}">Plan ${p.id}: ${p.name}</button>`).join("");
    document.querySelectorAll("[data-tl]").forEach(b => b.onclick = () => { tlPlan = b.dataset.tl; renderTimeline(); });

    // Series: real values per round + projected next round
    const R = S.rounds;
    const kp = k => R.map(r => [r.round, r.kpi[k]]);
    const tr = S.trend, rr = S.trendRounds;
    const qser = i => rr.map((r, k) => [r, tr[i][S.company][k]]);
    const fser = i => rr.map((r, k) => [r, tr[i]["Fair value"][k] / 0.66 * (S.fairRatio || 0.75)]);
    const lser = i => rr.map((r, k) => [r, Math.max(...Object.entries(tr[i]).filter(([n]) => n !== "Fair value" && n !== S.company).map(([, v]) => v[k]))]);
    const charts = [
      { t: "Market value ($M)", s: kp("marketValue"), p: pr.mv, fmt: v => "$" + v.toFixed(0) },
      { t: "Net income ($M)", s: kp("netIncome"), p: null, fmt: v => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(1) },
      { t: "Debt ($M)", s: kp("debt"), p: pr.debt, fmt: v => "$" + v.toFixed(0), down: true },
      ...Q.map((q, i) => ({ t: q, s: qser(i), p: pr.sc[i], fair: fser(i), lead: lser(i), fmt: v => v.toFixed(1), q: true }))
    ];
    $("#tlCharts").innerHTML = charts.map(c => miniChart(c, nextR)).join("");

    // Decision table
    const log = S.decisionLog;
    const cols = log.map(l => ({ label: l.label, d: l.d })).concat([{ label: "R" + nextR + " Plan " + plan.id, d: nd, plan: true }]);
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
      `<div class="ls proj"><div class="lsr">Round ${nextR} projection · Plan ${plan.id}</div>
        <ul><li>Market value ≈ <b>$${pr.mv.toFixed(0)}M</b> · net income ≈ $${pr.niProj.toFixed(1)}M</li>
        <li>Debt ≈ <b>$${pr.debt.toFixed(0)}M</b></li>
        <li>Leads: <b>${lead}</b> · ${pr.gaps} quadrant(s) below 75% fair value</li></ul>
        <div class="lsl">Watch next round: does Experience pass Zephara, and how much does service move Frictionless?</div></div>`;
    if ($("#tlAcc") && S.backtest) $("#tlAcc").innerHTML = `<tr><th>Run</th><th>Brand</th><th>Experience</th><th>Low Price</th><th>Frictionless</th><th>Revenue</th><th>Net income</th><th>Market value</th></tr>` +
      S.backtest.map(b => `<tr><td>${b.run}</td>${b.cells.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
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
    for (let r = r0; r <= r1; r++) g += `<text x="${x(r)}" y="${H - 6}" class="mx">${r === r1 ? "R" + r + "*" : "R" + r}</text>`;
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
      state.d = Object.assign({}, S.defaults, p.levers);
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
        <div class="num">${L.unit === "$M" ? "<i>$</i>" : ""}<input type="number" step="${L.step}" min="${L.min}" max="${L.max}" data-k="${L.key}">${L.unit === "%" ? "<i>%</i>" : L.unit === "$M" ? "<i>M</i>" : ""}</div></div>
        <input type="range" min="${L.min}" max="${L.max}" step="${L.step}" data-k="${L.key}">`;
      row.dataset.k = L.key;
      row.querySelector("label").insertAdjacentHTML("beforeend", ' <span class="linfo">i</span>');
      row.addEventListener("mouseenter", () => showLeverTip(row, L));
      row.addEventListener("mouseleave", hideLeverTip);
      wrap.appendChild(row);
    });
    wrap.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.k; let v = parseFloat(inp.value);
        if (isNaN(v)) return;
        state.d[k] = v; syncLevers(inp); update();
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
    const t = " " + q.toLowerCase().replace(/[?!]/g, " ") + " ";
    let hit = null;
    for (const [id, words, keys] of ASK_LEVERS) { if (words.some(w => t.includes(w))) { hit = keys; break; } }
    if (!hit) return null;
    const up = /\b(raise|increase|more|add|higher|up|boost|grow|open|expand|spend more)\b/.test(t);
    const down = /\b(lower|cut|decrease|reduce|less|down|drop|trim|close|shrink|spend less|remove)\b/.test(t);
    const num = (t.match(/\$?\s*(\d+(?:\.\d+)?)\s*(m|%|pts?|points?)?/) || [])[1];
    const to = /\bto\s+\$?\s*\d/.test(t), by = /\bby\s+\$?\s*\d/.test(t);
    return { keys: hit, dir: down && !up ? -1 : up && !down ? 1 : (down ? -1 : 0), num: num == null ? null : +num, to, by };
  }
  function askAnswer(q) {
    const rec = (S.plans || []).find(p => p.badge === "Recommended") || {};
    const base = Object.assign({}, S.defaults, rec.levers || {});
    let P = askParse(q);
    const tl = q.toLowerCase(), faqHit = (S.faq || []).find(x => x.keys.some(k => tl.includes(k)));
    if (P && faqHit && P.dir === 0 && P.num == null && /\b(mean|what is|what's|explain|why|how does|how do|score)\b/.test(tl)) P = null;
    if (!P) {
      const t = q.toLowerCase();
      const f = (S.faq || []).find(x => x.keys.some(k => t.includes(k)));
      if (!f) return `<p>I can answer two kinds of questions:</p><ul><li><b>What-ifs</b>: “What if we lower online to $8M?”, “Raise markup by 2 points?”, “Cut vendor management?”</li><li><b>How things work</b>: debt, P/E, budget, analytics score, segments, fair value, final round, beating $1.5B.</li></ul>`;
      return `${f.a}<div class="ask-rec"><b>What I'd do:</b> ${f.rec}</div>${confPill(f.conf)}`;
    }
    const d = Object.assign({}, base), changes = [];
    P.keys.forEach(k => {
      const L = LEVERS.find(x => x.key === k); if (!L) return;
      const was = base[k]; let v;
      if (P.num != null && P.to) v = P.num;
      else if (P.num != null) v = was + (P.dir || 1) * P.num;
      else v = was + (P.dir || 1) * STEP[k];
      if (P.num != null && !P.to && !P.by && P.dir === 0) v = P.num;
      v = Math.max(L.min, Math.min(L.max, Math.round(v * 10) / 10));
      d[k] = v; changes.push([L, was, v]);
    });
    const r0 = model(base), r1 = model(d);
    const fmt = (L, v) => L.unit === "$M" ? "$" + v + "M" : v + (L.unit === "%" ? "%" : "");
    const m = (x, dp = 1) => (x >= 0 ? "+" : "−") + "$" + Math.abs(x).toFixed(dp) + "M";
    const gm0 = r0.gross / r0.revenue * 100, gm1 = r1.gross / r1.revenue * 100;
    const dSpend = (d.online + d.service + d.experience + d.vendor + d.analytics) - (base.online + base.service + base.experience + base.vendor + base.analytics);
    const qd = r1.sc.map((v, i) => [Q[i], v - r0.sc[i]]).filter(x => Math.abs(x[1]) >= 0.01);
    const dMV = r1.mv - r0.mv, dNI = r1.niProj - r0.niProj, dRev = r1.revenue - r0.revenue, dDebt = r1.debt - r0.debt;
    const k0 = changes[0][0].key, I = (S.leverInfo || {})[k0] || {}, G = (S.leverGroups || []).find(g => g.keys.includes(k0));
    const what = changes.map(([L, a, b]) => `${L.label} ${fmt(L, a)} → <b>${fmt(L, b)}</b>`).join(", ");
    // plain-English chain
    const chain = [];
    if (Math.abs(dSpend) >= 0.05) chain.push(`We ${dSpend > 0 ? "spend" : "save"} <b>$${Math.abs(dSpend).toFixed(1)}M</b> a year${["online", "experience"].includes(k0) ? ` (only part of it hits this year's costs: ${k0 === "online" ? "40%" : "80%"})` : ""}.`);
    if (Math.abs(dRev) >= 0.5) chain.push(`Revenue ${dRev > 0 ? "rises" : "falls"} ≈${m(dRev, 0)}${Math.abs(gm1 - gm0) >= 0.05 ? ` and gross margin moves ${gm0.toFixed(1)}% → ${gm1.toFixed(1)}%` : ""}.`);
    else if (Math.abs(gm1 - gm0) >= 0.05) chain.push(`Gross margin moves ${gm0.toFixed(1)}% → ${gm1.toFixed(1)}%.`);
    if (qd.length) chain.push(`Quadrant scores: ${qd.map(([n, v]) => `${n} ${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`).join(", ")}.`);
    chain.push(`Net income ${dNI >= 0 ? "rises" : "falls"} <b>${m(dNI)}</b>${Math.abs(dDebt) >= 0.5 ? `, debt ${dDebt > 0 ? "up" : "down"} ${m(Math.abs(dDebt), 1).replace("+", "")}` : ""}.`);
    chain.push(`Market value (P/E × profit) moves <b>${m(dMV, 0)}</b>: ${fmtM(r0.mv)} → ${fmtM(r1.mv)}.`);
    // recommendation
    const lostLead = r0.leads > r1.leads, gainLead = r1.leads > r0.leads;
    let verdict, vcls;
    if (lostLead) { verdict = "Don't do it: we'd lose a quadrant lead, which costs P/E over time even if this round's number looks fine."; vcls = "no"; }
    else if (dMV > 5) { verdict = `Worth doing: about ${m(dMV, 0)} of value${gainLead ? " and it adds a quadrant lead" : ""}.`; vcls = "yes"; }
    else if (dMV < -5) { verdict = `Not recommended: it costs about ${m(dMV, 0).replace("−", "")} of value.`; vcls = "no"; }
    else { verdict = "Roughly neutral this round (within the model's error). Decide on the long-term reason below."; vcls = "meh"; }
    if (k0 === "vendor" && changes[0][2] < changes[0][1] && !lostLead) { verdict = `This round looks like ${m(dMV, 0)}, but the higher-cost penalty builds up over the following rounds (our costs are already 1.8% above rivals). Best saved for the final round.`; vcls = "meh"; }
    const data = (I.data || []).slice(0, 2).map(x => `<li>${x}</li>`).join("");
    return `<div class="ask-what">${what} <span class="mut">(vs Plan ${rec.id || "A"})</span></div>
      <ul class="ask-chain">${chain.map(c => `<li>${c}</li>`).join("")}</ul>
      <div class="ask-verdict ${vcls}">${verdict}</div>
      ${data ? `<div class="ask-data"><b>From the game data</b><ul>${data}</ul></div>` : ""}
      ${I.hypothesis ? `<div class="ask-hyp"><b>Untested:</b> ${I.hypothesis}</div>` : ""}
      <div class="ask-rec"><b>Long term:</b> ${I.longTerm || ""}. ${I.why || ""}${G ? ` <span class="mut">(${G.why})</span>` : ""}</div>
      ${confPill(I.conf || "Medium")}`;
  }
  function confPill(c) { const col = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }[c]; return `<span class="ask-conf" style="color:${col};border-color:${col}">${c} confidence</span>`; }
  function initAsk() {
    if (document.getElementById("askBtn")) return;
    document.body.insertAdjacentHTML("beforeend", `<button id="askBtn">Ask ✦</button>
      <div id="askPanel"><div class="ask-head"><b>Ask the copilot</b><button id="askClose" aria-label="Close">×</button></div>
      <div id="askLog"><div class="ask-msg bot">Ask a what-if or how-it-works question. I run our model (vs Plan A) and answer in plain English with our confidence.</div></div>
      <div class="ask-sugg">${["What if we lower online to $8M?", "Raise markup by 2 points?", "Should we cut vendor management?", "What if breadth goes to 60?", "What does the analytics score mean?", "Should we pay down debt?", "How do we beat $1.5B?"].map(x => `<button class="ask-s">${x}</button>`).join("")}</div>
      <form id="askForm"><input id="askIn" placeholder="e.g. What if we raise shopping experience by $3M?" autocomplete="off"><button class="primary">Ask</button></form></div>`);
    const open = v => document.getElementById("askPanel").classList.toggle("open", v);
    document.getElementById("askBtn").onclick = () => { open(true); document.getElementById("askIn").focus(); };
    document.getElementById("askClose").onclick = () => open(false);
    const ask = q => { if (!q.trim()) return; const log = document.getElementById("askLog");
      log.insertAdjacentHTML("beforeend", `<div class="ask-msg me">${q.replace(/</g, "&lt;")}</div><div class="ask-msg bot">${askAnswer(q)}</div>`);
      log.scrollTop = log.scrollHeight; };
    document.getElementById("askForm").onsubmit = e => { e.preventDefault(); const i = document.getElementById("askIn"); ask(i.value); i.value = ""; };
    document.querySelectorAll(".ask-s").forEach(b => b.onclick = () => ask(b.textContent));
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

  function showLeverTip(row, L) {
    const I = (S.leverInfo || {})[L.key]; if (!I) return;
    let tip = document.getElementById("levTip");
    if (!tip) { tip = document.createElement("div"); tip.id = "levTip"; document.body.appendChild(tip); }
    const d0 = S.defaults, now = state.d[L.key], was = d0[L.key];
    let live = "";
    if (now !== was) {
      const one = Object.assign({}, d0, { [L.key]: now }), r1 = model(one), r0 = model(d0);
      const dq = r1.sc.map((v, i) => v - r0.sc[i]);
      const parts = dq.map((v, i) => Math.abs(v) >= 0.01 ? `${Q[i]} ${v > 0 ? "+" : ""}${v.toFixed(2)}` : "").filter(Boolean);
      live = `<div class="lt-live"><b>Your change:</b> ${was} → ${now}. Model: ${parts.length ? parts.join(", ") + "; " : ""}market value ${r1.mv - r0.mv >= 0 ? "+" : "−"}$${Math.abs(r1.mv - r0.mv).toFixed(0)}M, net income ${r1.niProj - r0.niProj >= 0 ? "+" : "−"}$${Math.abs(r1.niProj - r0.niProj).toFixed(1)}M</div>`;
    }
    const col = { High: "#1a7f37", Medium: "#9a6700", Low: "#b42318" }[I.conf];
    tip.innerHTML = `<div class="lt-h">${L.label} <span style="color:${col};border-color:${col}">${I.conf} confidence</span></div>
      <div class="lt-s">${I.status}</div>
      <div class="lt-plain">${I.plain || ""}</div>
      <div><b>What it changes:</b> ${I.effect}</div>
      ${I.data ? `<div class="lt-data"><b>From the game data</b><ul>${I.data.slice(0, 2).map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
      ${I.hypothesis ? `<div><b>Our hypothesis:</b> ${I.hypothesis}</div>` : ""}
      ${live}
      <div class="lt-lt"><b>Our recommendation:</b> ${I.longTerm}.<br><span><b>Why:</b> ${I.why}</span></div>`;
    const r = row.getBoundingClientRect();
    tip.style.display = "block";
    if (r.right + 14 + 430 <= window.innerWidth) {          // room on the right: sit beside the slider
      tip.style.left = (r.right + 14) + "px";
      tip.style.top = Math.max(10, Math.min(r.top, window.innerHeight - tip.offsetHeight - 10)) + "px";
    } else {                                                 // narrow screen: sit below (or above) so it never covers the slider
      tip.style.left = Math.max(10, Math.min(r.left, window.innerWidth - 430)) + "px";
      const below = r.bottom + 8, above = r.top - tip.offsetHeight - 8;
      tip.style.top = (below + tip.offsetHeight < window.innerHeight || above < 10 ? below : above) + "px";
    }
  }
  function hideLeverTip() { const t = document.getElementById("levTip"); if (t) t.style.display = "none"; }

  function syncLevers(except) {
    document.querySelectorAll("#levers input").forEach(inp => {
      if (inp === except) return;
      inp.value = state.d[inp.dataset.k];
    });
  }

  function openCockpit(fromAI) {
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

  function update() {
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
    $("#checks").innerHTML = checks.map(([ok, t, s]) => `<li class="${ok ? "ok" : "no"}"><span class="ic">${ok ? "✓" : "!"}</span><span class="ct">${t}</span><span class="cs">${s}</span></li>`).join("");
    renderStory(r);
    state.last = r;
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
      `<div style="flex-basis:${v / total * 100}%;background:${QCOL[q]}" title="${n} $${v}M">${v / total > 0.13 ? n + " $" + Math.round(v) + "M" : ""}</div>`).join("");
    $("#moneyTxt").textContent = fmtM(r.spend) + " of " + fmtM(S.base.budget);

    const moves = LEVERS.map(L => ({ L, dv: d[L.key] - S.defaults[L.key] }))
      .filter(m => Math.abs(m.dv) > 1e-6)
      .sort((a, b) => Math.abs(b.dv) / (b.L.max - b.L.min) - Math.abs(a.dv) / (a.L.max - a.L.min)).slice(0, 5);
    const fmtV = (L, v) => L.unit === "$M" ? "$" + (+v.toFixed(1)) + "M" : (+v.toFixed(1)) + (L.unit || "");
    $("#moves").innerHTML = moves.length ? moves.map(m => `<li class="${m.dv > 0 ? "upm" : "dnm"}"><span class="ar">${m.dv > 0 ? "▲" : "▼"}</span>
      <span>${m.L.label}</span><b>${fmtV(m.L, S.defaults[m.L.key])} → ${fmtV(m.L, d[m.L.key])}</b></li>`).join("")
      : `<li><span></span><span style="color:var(--muted)">Same as last round</span></li>`;
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
    loadSaved(); calibrate(); buildLevers(); $("#teamName").value = state.team; renderStanding(); renderLandscape(); renderEdges(); renderPlans(); renderImpacts(); renderTimeline(); renderStart(); renderLearn(); initAsk();
    $("#goBtn").onclick = runCopilot;
    
    $("#resetBtn").onclick = () => { state.d = Object.assign({}, S.defaults); syncLevers(); update(); $("#aiBadge").style.display = "none"; };
    document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => show(b.dataset.go));
    $("#dataBtn").onclick = openData;
    $("#dataClose").onclick = () => $("#dataPanel").classList.remove("open");
    $("#dataSave").onclick = saveData;
    $("#exportBtn").onclick = exportPlan;
    $("#manualBtn").onclick = () => { state.team = $("#teamName").value.trim() || "Team 4"; state.d = Object.assign({}, S.defaults); openCockpit(false); };
  });

  window.__copilot = { askAnswer, calibrate, model, optimize, targetQuads, get scale() { return SCALE; } };
})();
