const portfolioResultStatus = document.getElementById('portfolioResultStatus');
const portfolioResultMeta = document.getElementById('portfolioResultMeta');
const portfolioResult = document.getElementById('portfolioResult');

function setLoadingLabel(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.add('loading-ellipsis');
}

function setLabel(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('loading-ellipsis');
}

function fmtMoney(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(v, digits = 2) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return `${(Number(v) * 100).toFixed(digits)}%`;
}

function fmtNum(v, digits = 2) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return Number(v).toFixed(digits);
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, Number(v || 0)));
}

function getNebulaLabel(code) {
  const table = {
    'A-I-R': 'Nebula Core',
    'A-I-E': 'Nebula Flare',
    'A-E-R': 'Nebula Drift',
    'A-E-E': 'Nebula Storm',
    'C-I-R': 'Nebula Anchor',
    'C-I-E': 'Nebula Shield',
    'C-E-R': 'Nebula Orbit',
    'C-E-E': 'Nebula Mist'
  };
  return table[code] || 'Nebula Orbit';
}

function derivePortfolioAxis(payload) {
  const p = payload?.portfolio || {};
  const assets = Array.isArray(payload?.assets) ? payload.assets : [];
  const weightedRet90 = assets.reduce((s, a) => s + Number(a?.trailingReturns?.d90 || 0) * Number(a?.weight || 0), 0);
  const vol = Number(p?.annualizedVolatility || 0);
  const score = Number(p?.valuationScore || 0);
  const news = Number(p?.weightedNewsSentiment || 0);
  const social = Number(p?.weightedSocialSentiment || 0);

  const aggressive = clamp(46 + weightedRet90 * 130 + vol * 40 + (score - 50) * 0.22, 0, 100);
  const internal = clamp(40 + Math.abs(score - 50) * 0.8 + Math.abs(news - social) * 14 + (1 - vol) * 10, 0, 100);
  const emotional = clamp(32 + Math.abs(news + social) * 38 + vol * 32, 0, 100);

  const riskCode = aggressive >= 50 ? 'A' : 'C';
  const controlCode = internal >= 50 ? 'I' : 'E';
  const reactCode = emotional >= 50 ? 'E' : 'R';
  const code = `${riskCode}-${controlCode}-${reactCode}`;

  return {
    code,
    nebula: getNebulaLabel(code),
    axes: {
      risk: riskCode === 'A' ? 'Aggressive' : 'Conservative',
      control: controlCode === 'I' ? 'Internal/Active' : 'External/Passive',
      reactivity: reactCode === 'E' ? 'Emotional' : 'Rational'
    },
    scores: {
      riskAggressive: aggressive,
      controlInternal: internal,
      reactivityEmotional: emotional
    }
  };
}

function renderAxisChip(title, leftLabel, rightLabel, scorePct) {
  const pct = clamp(scorePct, 0, 100);
  return `
    <article class="investor-axis-chip">
      <strong>${escapeHtml(title)}: ${fmtNum(pct, 0)}%</strong>
      <div class="axis-chip-bar">
        <span>${escapeHtml(leftLabel)}</span>
        <div class="axis-chip-track">
          <span class="axis-chip-you" style="left:${pct}%;">YOU</span>
          <span class="axis-chip-dot" style="left:${pct}%;"></span>
        </div>
        <span>${escapeHtml(rightLabel)}</span>
      </div>
    </article>
  `;
}

function initPortfolioAxis3d(scores = {}) {
  const stage = document.getElementById('portfolioAxis3dStage');
  const canvas = document.getElementById('portfolioAxis3dCanvas');
  const hoverTip = document.getElementById('portfolioAxis3dHoverTip');
  if (!stage || !canvas) return;

  const state = {
    rotX: 22,
    rotY: -28,
    dragging: false,
    startX: 0,
    startY: 0,
    baseRotX: 22,
    baseRotY: -28,
    projectedCorners: [],
    scores: {
      aggressive: clamp(scores?.riskAggressive, 0, 100),
      internal: clamp(scores?.controlInternal, 0, 100),
      emotional: clamp(scores?.reactivityEmotional, 0, 100)
    }
  };

  const rotate3D = (point, rxDeg, ryDeg) => {
    const rx = (rxDeg * Math.PI) / 180;
    const ry = (ryDeg * Math.PI) / 180;
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x2 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    return { x: x2, y: y1, z: z2 };
  };

  const ensureCanvasSize = () => {
    const rect = stage.getBoundingClientRect();
    const cssW = Math.max(220, Math.floor(rect.width - 10));
    const cssH = Math.max(180, Math.floor(rect.height - 10));
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const targetW = Math.floor(cssW * dpr);
    const targetH = Math.floor(cssH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    return { w: targetW, h: targetH };
  };

  const setHover = (content, x, y) => {
    if (!hoverTip) return;
    hoverTip.innerHTML = content;
    hoverTip.classList.remove('hidden');
    hoverTip.style.left = `${x}px`;
    hoverTip.style.top = `${y}px`;
  };

  const hideHover = () => {
    if (hoverTip) hoverTip.classList.add('hidden');
  };

  const cornerMetaFromPoint = (p) => {
    const risk = p.x >= 0 ? 'A' : 'C';
    const control = p.y >= 0 ? 'I' : 'E';
    const react = p.z >= 0 ? 'E' : 'R';
    const code = `${risk}-${control}-${react}`;
    const label = {
      'A-I-R': 'Aggressive, Active, Rational',
      'A-I-E': 'Aggressive, Active, Emotional',
      'A-E-R': 'Aggressive, Passive, Rational',
      'A-E-E': 'Aggressive, Passive, Emotional',
      'C-I-R': 'Conservative, Active, Rational',
      'C-I-E': 'Conservative, Active, Emotional',
      'C-E-R': 'Conservative, Passive, Rational',
      'C-E-E': 'Conservative, Passive, Emotional'
    }[code] || 'Profile corner';
    return { code, label };
  };

  const draw = () => {
    const { w, h } = ensureCanvasSize();
    if (!(w > 0 && h > 0)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const unit = Math.min(w, h) * 0.23;
    const perspective = unit * 3.4;
    const transform = (p) => {
      const r = rotate3D(p, state.rotX, state.rotY);
      const s = perspective / (perspective + r.z * unit);
      return { x: cx + r.x * unit * s, y: cy - r.y * unit * s, z: r.z };
    };
    const drawSegment = (a, b, color, width = 1, alpha = 1, dash = null) => {
      const p1 = transform(a);
      const p2 = transform(b);
      ctx.save();
      if (dash) ctx.setLineDash(dash);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
      return { p1, p2 };
    };
    const drawArrow = (from, to, color) => {
      const seg = drawSegment(from, to, color, 2.2, 0.92);
      const a = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x);
      const len = Math.max(6, Math.min(11, w * 0.015));
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(seg.p2.x, seg.p2.y);
      ctx.lineTo(seg.p2.x - len * Math.cos(a - 0.35), seg.p2.y - len * Math.sin(a - 0.35));
      ctx.lineTo(seg.p2.x - len * Math.cos(a + 0.35), seg.p2.y - len * Math.sin(a + 0.35));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const drawPillLabel = (text, p, fg = '#0f172a') => {
      const padX = 6;
      const padY = 4;
      ctx.save();
      ctx.font = `${Math.max(9, Math.floor(w * 0.014))}px ui-sans-serif, system-ui`;
      const tw = ctx.measureText(text).width;
      const x = p.x + (p.x >= cx ? 6 : -(tw + padX * 2 + 6));
      const y = p.y - 9;
      const bw = tw + padX * 2;
      const bh = 18;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = 'rgba(148,163,184,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = fg;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + padX, y + bh / 2 + 0.5);
      ctx.restore();
    };

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#f8fbff');
    bg.addColorStop(1, '#edf3ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const nebula = ctx.createRadialGradient(cx - unit * 0.35, cy - unit * 0.42, 12, cx, cy, unit * 2);
    nebula.addColorStop(0, 'rgba(59,130,246,0.18)');
    nebula.addColorStop(0.5, 'rgba(14,165,233,0.08)');
    nebula.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, w, h);

    for (const t of [-0.6, -0.3, 0, 0.3, 0.6]) {
      drawSegment({ x: -1, y: t, z: -1 }, { x: 1, y: t, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
      drawSegment({ x: t, y: -1, z: -1 }, { x: t, y: 1, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
      drawSegment({ x: -1, y: t, z: 1 }, { x: 1, y: t, z: 1 }, '#c7d2fe', 1, 0.16, [3, 4]);
      drawSegment({ x: t, y: -1, z: 1 }, { x: t, y: 1, z: 1 }, '#c7d2fe', 1, 0.16, [3, 4]);
      drawSegment({ x: -1, y: -1, z: t }, { x: 1, y: -1, z: t }, '#cbd5e1', 1, 0.18, [2, 5]);
      drawSegment({ x: -1, y: 1, z: t }, { x: 1, y: 1, z: t }, '#cbd5e1', 1, 0.18, [2, 5]);
    }

    const cubePts = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
    ];
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    edges.forEach(([a, b]) => {
      const za = rotate3D(cubePts[a], state.rotX, state.rotY).z;
      const zb = rotate3D(cubePts[b], state.rotX, state.rotY).z;
      const depthAlpha = 0.24 + ((za + zb + 2) / 4) * 0.32;
      drawSegment(cubePts[a], cubePts[b], '#64748b', 1.2, depthAlpha);
    });

    drawArrow({ x: -1.22, y: 0, z: 0 }, { x: 1.22, y: 0, z: 0 }, '#2563eb');
    drawArrow({ x: 0, y: -1.22, z: 0 }, { x: 0, y: 1.22, z: 0 }, '#0f766e');
    drawArrow({ x: 0, y: 0, z: -1.22 }, { x: 0, y: 0, z: 1.22 }, '#dc2626');
    [
      { p: { x: 1.29, y: 0, z: 0 }, t: 'Aggressive', c: '#1d4ed8' },
      { p: { x: -1.29, y: 0, z: 0 }, t: 'Conservative', c: '#1d4ed8' },
      { p: { x: 0, y: 1.29, z: 0 }, t: 'Active', c: '#0f766e' },
      { p: { x: 0, y: -1.29, z: 0 }, t: 'Passive', c: '#0f766e' },
      { p: { x: 0, y: 0, z: 1.29 }, t: 'Emotional', c: '#dc2626' },
      { p: { x: 0, y: 0, z: -1.29 }, t: 'Rational', c: '#dc2626' }
    ].forEach((item) => drawPillLabel(item.t, transform(item.p), item.c));

    const scores = state.scores;
    const pr = transform({ x: scores.aggressive / 50 - 1, y: 0, z: 0 });
    const pc = transform({ x: 0, y: scores.internal / 50 - 1, z: 0 });
    const pe = transform({ x: 0, y: 0, z: scores.emotional / 50 - 1 });

    ctx.fillStyle = 'rgba(37,99,235,0.18)';
    ctx.beginPath();
    ctx.moveTo(pr.x, pr.y);
    ctx.lineTo(pc.x, pc.y);
    ctx.lineTo(pe.x, pe.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,64,175,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    [
      { p: pr, c: '#2563eb' },
      { p: pc, c: '#0f766e' },
      { p: pe, c: '#dc2626' }
    ].forEach((node) => {
      ctx.fillStyle = node.c;
      ctx.beginPath();
      ctx.arc(node.p.x, node.p.y, Math.max(4.5, Math.min(7.2, w * 0.0092)), 0, Math.PI * 2);
      ctx.fill();
    });

    state.projectedCorners = cubePts.map((c) => {
      const p = transform(c);
      const meta = cornerMetaFromPoint(c);
      return { x: p.x, y: p.y, z: p.z, label: meta.label };
    });
    state.projectedCorners.forEach((c) => {
      ctx.fillStyle = 'rgba(100,116,139,0.55)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const updateHover = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / Math.max(1, rect.width);
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    let best = null;
    let bestD2 = Infinity;
    state.projectedCorners.forEach((c) => {
      const dx = c.x - x;
      const dy = c.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = c;
      }
    });
    if (!best || bestD2 > (16 * dpr) ** 2) {
      hideHover();
      return;
    }
    const stageRect = stage.getBoundingClientRect();
    setHover(`<strong>${escapeHtml(best.label)}</strong>`, clientX - stageRect.left, clientY - stageRect.top);
  };

  stage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    state.dragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.baseRotX = state.rotX;
    state.baseRotY = state.rotY;
    stage.classList.add('dragging');
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (state.dragging) {
      e.preventDefault();
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      state.rotY = state.baseRotY + dx * 0.34;
      state.rotX = Math.max(-80, Math.min(80, state.baseRotX - dy * 0.28));
      draw();
      hideHover();
      return;
    }
    updateHover(e.clientX, e.clientY);
  });
  const stop = () => {
    state.dragging = false;
    stage.classList.remove('dragging');
  };
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  stage.addEventListener('mouseleave', () => {
    stop();
    hideHover();
  });
  window.addEventListener('resize', draw, { passive: true });
  draw();
}

function renderPortfolioResult(payload) {
  const p = payload?.portfolio || {};
  const assets = Array.isArray(payload?.assets) ? payload.assets : [];
  const guidance = Array.isArray(payload?.guidance) ? payload.guidance : [];
  const axis = derivePortfolioAxis(payload);

  portfolioResult.innerHTML = `
    <div class="valuation-kpis">
      <article class="kpi-card"><span>Total Value</span><strong>${fmtMoney(p.totalValue)}</strong><small>Portfolio total</small></article>
      <article class="kpi-card"><span>Portfolio Score</span><strong>${fmtNum(p.valuationScore, 0)}/100</strong><small>${escapeHtml(p.valuationLabel || '')}</small></article>
      <article class="kpi-card"><span>Risk</span><strong>${escapeHtml(p.riskLevel || 'N/A')}</strong><small>Volatility ${fmtPct(p.annualizedVolatility)}</small></article>
      <article class="kpi-card"><span>Diversification</span><strong>${fmtNum(p.diversificationScore, 0)}/100</strong><small>${assets.length} assets</small></article>
    </div>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Portfolio Signals</h4>
        <ul class="investor-list">
          <li>Weighted news sentiment: ${fmtPct(p.weightedNewsSentiment)}</li>
          <li>Weighted social sentiment: ${fmtPct(p.weightedSocialSentiment)}</li>
          <li>Asset count: ${assets.length}</li>
        </ul>
      </section>

      <section class="chart-card">
        <h4>Guidance</h4>
        <ul class="investor-list">
          ${guidance.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
        </ul>
      </section>
    </div>

    <section class="chart-card">
      <h4>Asset Breakdown</h4>
      <div class="valuation-table-wrap">
        <table class="valuation-table">
          <thead>
            <tr>
              <th>Investment</th>
              <th>Weight</th>
              <th>Value</th>
              <th>Composite</th>
              <th>Rec</th>
              <th>Risk (Vol)</th>
              <th>3M Return</th>
            </tr>
          </thead>
          <tbody>
            ${assets
              .map(
                (a) => `
                  <tr>
                    <td>
                      <strong>${escapeHtml(a.displayName || a.symbol)}</strong>
                      <div class="valuation-table-sub">${escapeHtml(a.symbol || '')}</div>
                    </td>
                    <td>${fmtPct(a.weight)}</td>
                    <td>${fmtMoney(a.marketValue)}</td>
                    <td>${fmtNum(a.compositeScore, 0)} (${escapeHtml(a.label || '')})</td>
                    <td>${escapeHtml(a.recommendation?.action || 'HOLD')}</td>
                    <td>${fmtPct(a.annualizedVolatility)}</td>
                    <td>${fmtPct(a.trailingReturns?.d90)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="chart-card investor-axis-combined">
      <h4>3-Axis Profile</h4>
      <p class="investor-axis-summary">Drag the 3D chart to rotate and inspect your portfolio behavior profile.</p>
      <div class="investor-axis-layout">
        <div class="investor-axis-left">
          <div class="investor-axis-chips">
            ${renderAxisChip('Risk Axis', 'Conservative', 'Aggressive', axis.scores.riskAggressive)}
            ${renderAxisChip('Control Axis', 'External', 'Internal', axis.scores.controlInternal)}
            ${renderAxisChip('Reactivity Axis', 'Rational', 'Emotional', axis.scores.reactivityEmotional)}
          </div>
        </div>
        <div class="investor-axis-right investor-cube-card">
          <div class="investor-cube-head">
            <h4>Interactive 3D View</h4>
          </div>
          <p class="investor-cube-hint">Rotate with mouse drag. Hover cube corners to see profile combinations.</p>
          <div id="portfolioAxis3dStage" class="axis-3d-stage">
            <canvas id="portfolioAxis3dCanvas" width="560" height="360"></canvas>
            <div id="portfolioAxis3dHoverTip" class="axis-3d-hover hidden"></div>
          </div>
          <div class="axis-score-list">
            <div class="axis-score-item">Risk (Aggressive): ${fmtNum(axis.scores.riskAggressive, 0)}%</div>
            <div class="axis-score-item">Control (Internal): ${fmtNum(axis.scores.controlInternal, 0)}%</div>
            <div class="axis-score-item">Reactivity (Emotional): ${fmtNum(axis.scores.reactivityEmotional, 0)}%</div>
          </div>
        </div>
      </div>
      <div class="axis-cta-row">
        <p>If you want a clearer investor-type read, we recommend visiting InvestoType.</p>
        <div class="axis-cta-buttons">
          <button type="button" data-axis-go="investotype.html">Go To InvestoType</button>
        </div>
      </div>
    </section>
  `;
  portfolioResult.querySelectorAll('button[data-axis-go]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const href = String(btn.getAttribute('data-axis-go') || '').trim();
      if (href) window.location.href = href;
    });
  });
  initPortfolioAxis3d(axis.scores);
  portfolioResult.classList.remove('hidden');
}

function loadPortfolioResult() {
  try {
    const raw = sessionStorage.getItem('investolab.portfolioResult');
    if (!raw) throw new Error('No portfolio result found.');
    const parsed = JSON.parse(raw);
    const holdings = Array.isArray(parsed?.holdings) ? parsed.holdings : [];
    const asOfDate = String(parsed?.asOfDate || '');

    if (portfolioResultMeta) {
      portfolioResultMeta.textContent = `As of ${asOfDate || '-'} | Holdings: ${holdings.length}`;
    }
    renderPortfolioResult(parsed?.payload || {});
    setLabel(portfolioResultStatus, 'Portfolio valuation completed.');
  } catch (_error) {
    setLabel(portfolioResultStatus, 'No portfolio results found. Run an evaluation first.');
    if (portfolioResultMeta) {
      portfolioResultMeta.textContent = 'Run valuation from Portfolio Valuation page.';
    }
    portfolioResult.classList.add('hidden');
  }
}

loadPortfolioResult();

