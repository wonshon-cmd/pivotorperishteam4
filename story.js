// Getchells story player: animated scenes (what we changed → what happened → lesson). Opens from "▶ Watch our story".
// Recording mode: open the page with #story-rec → plays once, full screen, no controls; window.__storyDone = true at the end.
(function () {
  const S = window.SIM, T = S && S.story; if (!T) return;
  const Q = ["Brand", "Experience", "Low Price", "Frictionless"], BLUE = "#2E5BFF", GREY = "#9aa0ad", ORANGE = "#D9822B";
  const m = v => "$" + (v >= 1000 ? (v / 1000).toFixed(2) + "B" : Math.round(v) + "M");
  const status = (us, rv) => { const L = Math.max(us, rv); return us >= rv ? ["LEAD", "#1a7f37"] : us >= 0.75 * L ? ["FAIR", "#9a6700"] : ["GAP", "#b42318"]; };

  function quadBars(q, rv) {
    return `<div class="st-quads">${Q.map((n, i) => { const L = Math.max(q[i], rv[i]), [st, col] = status(q[i], rv[i]);
      return `<div class="st-qrow"><div class="st-qn">${n}<em style="color:${col};border-color:${col}">${st}</em></div>
        <div class="st-qbar"><i class="us" style="--w:${q[i] / 9 * 100}%"></i><i class="rv" style="--w:${rv[i] / 9 * 100}%"></i><b class="fair" style="left:${0.75 * L / 9 * 100}%"></b></div>
        <div class="st-qv"><b style="color:${BLUE}">${q[i].toFixed(1)}</b> <span>vs ${rv[i].toFixed(1)}</span></div></div>`; }).join("")}
      <div class="st-key"><i style="background:${BLUE}"></i>us <i style="background:${GREY}"></i>best rival <i class="k-fair"></i>fair value (75% of leader)</div></div>`;
  }
  function mvBars(k) {   // bars for every round so far (k = index into rounds; -1 = start only)
    const pts = [["Start", T.start.mv, false]].concat(T.rounds.slice(0, k + 1).filter((r, i) => !r.undo || i === k).map(r => [r.r.replace("Round ", "R").replace(" · final", "").replace(" · try 1", " try"), r.mv, !!r.undo]));
    const max = 1700;
    return `<div class="st-mv">${pts.map(([l, v, u], i) => `<div class="st-mvc ${i === pts.length - 1 ? "st-cur" : ""} ${u ? "undo" : ""}"><span class="st-mvv">${i === pts.length - 1 ? m(v) : ""}</span><i style="--h:${Math.max(2, v / max * 100)}%"></i><small>${l}</small></div>`).join("")}</div>`;
  }
  function lineChart(series, opt) {   // series: [{v:[...], c, dash, w}], x = 0..8
    const W = 520, H = opt.H || 230, P = 34, n = 9, lo = opt.lo, hi = opt.hi, x = i => P + i * (W - 2 * P) / (n - 1), y = v => H - 28 - (v - lo) / (hi - lo) * (H - 50);
    let g = `<svg viewBox="0 0 ${W} ${H}" class="st-svg">`;
    for (let i = 0; i < n; i++) g += `<text x="${x(i)}" y="${H - 8}" class="st-ax">R${i}</text>`;
    series.forEach((s, si) => { const d = s.v.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
      g += `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="${s.w || 3}" ${s.dash ? `stroke-dasharray="7 6"` : `pathLength="1" class="st-draw" style="animation-delay:${0.2 + si * 0.3}s"`}/>`;
      if (s.label) g += `<text x="${x(8) + 4}" y="${y(s.v[8]) + 4}" class="st-lab" fill="${s.c}">${s.label}</text>`; });
    if (opt.fmt) { const v0 = series[0].v[0], v8 = series[0].v[8]; g += `<text x="${x(0)}" y="${y(v0) + 26}" class="st-vl" text-anchor="start">${opt.fmt(v0)}</text><text x="${x(8)}" y="${y(v8) - 14}" class="st-vl" text-anchor="end">${opt.fmt(v8)}</text>`; }
    (opt.marks || []).forEach(([i, t], k) => { const v = series[0].v[i], left = i < 4; g += `<circle cx="${x(i)}" cy="${y(v)}" r="6" fill="#fff" stroke="${BLUE}" stroke-width="3" class="st-pop" style="animation-delay:${1.6 + k * 0.5}s"/><text x="${x(i) + (left ? 12 : -12)}" y="${y(v) + (left ? -12 : 5)}" text-anchor="${left ? "start" : "end"}" class="st-mk st-pop" style="animation-delay:${1.6 + k * 0.5}s">${t}</text>`; });
    return g + "</svg>";
  }

  const scenes = [], dur = t => Math.max(6, Math.round((t || '').split(/\s+/).length / 2.4 + 2));
  const SAY = T.say || {};
  scenes.push({ d: dur(SAY.title), say: SAY.title, h: () => `<div class="st-title"><div class="st-kick">Team 4 · Pivot or Perish</div><h1>${T.title}</h1><p>${T.sub}</p>
    <div class="st-big st-pop" style="animation-delay:.6s"><span>$93.2M</span><b>→</b><span class="blue">$1,633.5M</span></div></div>` });
  scenes.push({ d: dur(SAY.start), say: SAY.start, h: () => `<div class="st-head"><div class="st-pill">Round 0 · where we started</div><h2>The problem</h2></div>
    <div class="st-grid2"><div><div class="st-facts">${T.start.facts.map(([k, v], i) => `<div class="st-pop" style="animation-delay:${0.2 + i * 0.25}s"><small>${k}</small><b>${v}</b></div>`).join("")}</div><p class="st-note">${T.start.note}</p></div>
    <div><div class="st-sub">Kahn Retail Success Matrix</div>${quadBars(T.start.q, T.start.rv)}</div></div>` });
  scenes.push({ d: dur(SAY.plan), say: SAY.plan, h: () => `<div class="st-head"><div class="st-pill">The plan</div><h2>${T.plan.t}</h2></div>
    <div class="st-plan">${T.plan.pts.map(([a, b], i) => `<div class="st-pop" style="animation-delay:${0.2 + i * 0.4}s"><span>${i + 1}</span><div><b>${a}</b><p>${b}</p></div></div>`).join("")}</div>` });
  T.rounds.forEach((r, k) => scenes.push({ d: dur(r.say), say: r.say, h: () => `<div class="st-head"><div class="st-pill ${r.undo ? "warn" : ""}">${r.r}</div><h2>${r.t}</h2></div>
    ${r.why ? `<div class="st-why st-pop" style="animation-delay:.1s"><b>Why we did it</b> ${r.why}</div>` : ""}
    <div class="st-grid3">
      <div><div class="st-sub">What we changed</div><div class="st-ch">${r.ch.map(([l, a, b], i) => `<div class="st-pop" style="animation-delay:${0.2 + i * 0.25}s"><small>${l}</small><b>${a} <i>→</i> ${b}</b></div>`).join("")}</div></div>
      <div><div class="st-sub">Market value</div>${mvBars(k)}<div class="st-chg st-pop" style="animation-delay:1.2s">${m(r.mv)} <span class="${r.undo ? "neg" : ""}">${r.chg}${r.undo ? " (undone)" : ""}</span></div><div class="st-kpi">${r.kpi}</div></div>
      <div><div class="st-sub">Quadrants vs best rival</div>${quadBars(r.q, r.rv)}</div>
    </div><div class="st-lesson st-pop" style="animation-delay:3s"><b>What we found out</b> ${r.found || r.lesson}</div>` }));
  scenes.push({ d: dur(SAY.whole), say: SAY.whole, h: () => `<div class="st-head"><div class="st-pill">The whole game</div><h2>The whole game, round by round</h2></div>
    <div class="st-grid2 st-charts"><div><div class="st-sub">Market value ($M)</div>${lineChart([{ v: T.mvLine.map(p => p[1]), c: BLUE, w: 4 }], { lo: 0, hi: 1800, marks: T.marks, H: 470, fmt: m })}</div>
    <div><div class="st-sub">Experience: us vs Zephara</div>${lineChart([{ v: T.expLine.us, c: BLUE, label: "us" }, { v: T.expLine.zeph, c: GREY, label: "Zephara" }], { lo: 5, hi: 8.5 })}
    <div class="st-sub">Frictionless: us vs fair value</div>${lineChart([{ v: T.fricLine.us, c: BLUE, label: "us" }, { v: T.fricLine.fair, c: ORANGE, dash: true, label: "fair" }], { lo: 3, hi: 6.2 })}</div></div>` });
  scenes.push({ d: dur(SAY.take), say: SAY.take, h: () => `<div class="st-head"><div class="st-pill">What we learned</div><h2>Five takeaways</h2></div>
    <div class="st-take">${T.takeaways.map(([a, b], i) => `<div class="st-pop" style="animation-delay:${0.2 + i * 0.6}s"><span>${i + 1}</span><div><b>${a}</b><p>${b}</p></div></div>`).join("")}</div>` });
  scenes.push({ d: dur(SAY.end), say: SAY.end, h: () => `<div class="st-title"><h1>Final: <span class="blue">$1,633.5M</span></h1><p>Brand #1 · Experience #1 · Low Price and Frictionless at fair value · #2 in revenue</p><div class="st-kick">17.5× where we started</div></div>` });

  let idx = 0, timer = null, playing = false, rec = false;
  function el() { let o = document.getElementById("storyOv"); if (o) return o;
    document.body.insertAdjacentHTML("beforeend", `<div id="storyOv"><div class="st-wrap"><div class="st-stage" id="stStage"></div></div>
      <div class="st-ctrl"><button id="stPrev" aria-label="Previous">◀</button><button id="stPlay" aria-label="Play or pause">❚❚</button><button id="stNext" aria-label="Next">▶</button>
      <div class="st-prog" id="stProg"></div><button id="stClose" aria-label="Close">✕ Close</button></div></div>`);
    o = document.getElementById("storyOv");
    document.getElementById("stPrev").onclick = () => go(idx - 1, true); document.getElementById("stNext").onclick = () => go(idx + 1, true);
    document.getElementById("stPlay").onclick = () => { playing = !playing; document.getElementById("stPlay").textContent = playing ? "❚❚" : "▶ Play"; if (playing) go(idx, false); else clearTimeout(timer); };
    document.getElementById("stClose").onclick = close;
    window.addEventListener("resize", fit); document.addEventListener("keydown", e => { if (!o.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(idx + 1, true); if (e.key === "ArrowLeft") go(idx - 1, true); });
    return o; }
  function fit() { const st = document.getElementById("stStage"); if (!st) return; const w = window.innerWidth, h = window.innerHeight - (rec ? 0 : 64), s = Math.min(w / 1280, h / 720);
    st.style.transform = `scale(${s})`; st.parentElement.style.width = 1280 * s + "px"; st.parentElement.style.height = 720 * s + "px"; }
  function go(i, manual) {
    if (i < 0) i = 0; if (i >= scenes.length) { if (rec) { window.__storyDone = true; return; } i = scenes.length - 1; playing = false; document.getElementById("stPlay").textContent = "▶ Play"; }
    idx = i; clearTimeout(timer);
    const st = document.getElementById("stStage"); st.classList.remove("go"); st.innerHTML = `<div class="st-scene">${scenes[i].h()}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => st.classList.add("go")));
    const p = document.getElementById("stProg"); if (p) p.innerHTML = scenes.map((s, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}" data-k="${k}"></i>`).join("");
    if (p) p.querySelectorAll("i").forEach(d => d.onclick = () => go(+d.dataset.k, true));
    if (playing) timer = setTimeout(() => go(i + 1, false), scenes[i].d * 1000);
  }
  function open(recMode) { rec = !!recMode; const o = el(); o.classList.toggle("rec", rec); o.classList.add("open"); document.body.style.overflow = "hidden"; fit(); playing = true; document.getElementById("stPlay").textContent = "❚❚"; go(0, false); }
  function close() { clearTimeout(timer); playing = false; const o = document.getElementById("storyOv"); if (o) o.classList.remove("open"); document.body.style.overflow = ""; }
  window.openStory = open;
  document.addEventListener("click", e => { if (e.target.closest("[data-story]")) open(false); });
  if (location.hash === "#story-rec") window.addEventListener("load", () => setTimeout(() => open(true), 300));
  window.__storyLength = scenes.reduce((s, x) => s + x.d, 0);
  window.__storyScenes = () => scenes.map(x => ({ d: x.d, say: x.say || '' }));
  window.__storyDur = ds => ds.forEach((d, i) => { if (scenes[i] && d) scenes[i].d = d; });
})();
