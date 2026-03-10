const form = document.getElementById('investotypePortfolioForm');
const inputMode = document.getElementById('investotypeInputMode');
const typeWrap = document.getElementById('investotypeTypeWrap');
const typeSelect = document.getElementById('investotypeTypeSelect');
const axisWrap = document.getElementById('investotypeAxisWrap');
const statusEl = document.getElementById('investotypeBuilderStatus');
const resultEl = document.getElementById('investotypeBuilderResult');

const riskRange = document.getElementById('builderRiskRange');
const controlRange = document.getElementById('builderControlRange');
const reactRange = document.getElementById('builderReactRange');
const riskValue = document.getElementById('builderRiskValue');
const controlValue = document.getElementById('builderControlValue');
const reactValue = document.getElementById('builderReactValue');

const typeTitle = document.getElementById('builderTypeTitle');
const typeMeta = document.getElementById('builderTypeMeta');
const axisCode = document.getElementById('builderAxisCode');
const allocationList = document.getElementById('builderAllocationList');
const tickerList = document.getElementById('builderTickerList');
const tickerTableBody = document.getElementById('builderTickerTableBody');
const rationaleList = document.getElementById('builderRationaleList');
const builderCubeCode = document.getElementById('builderCubeCode');
const cubeStage = document.getElementById('builderAxis3dStage');
const cubeCanvas = document.getElementById('builderAxis3dCanvas');
const cubeHoverTip = document.getElementById('builderAxis3dHoverTip');

const SYMBOL_FULL_NAMES = {
  'QQQ': 'Invesco QQQ Trust',
  'NVDA': 'NVIDIA Corporation',
  'MSFT': 'Microsoft Corporation',
  'TSLA': 'Tesla, Inc.',
  'COIN': 'Coinbase Global, Inc.',
  'MSTR': 'MicroStrategy Incorporated',
  'VXUS': 'Vanguard Total International Stock ETF',
  'BND': 'Vanguard Total Bond Market ETF',
  'AGG': 'iShares Core U.S. Aggregate Bond ETF',
  'GLD': 'SPDR Gold Shares',
  'BTC-USD': 'Bitcoin (USD)',
  'SHV': 'iShares Short Treasury Bond ETF',
  'VTI': 'Vanguard Total Stock Market ETF',
  'VOO': 'Vanguard S&P 500 ETF',
  'SCHD': 'Schwab U.S. Dividend Equity ETF',
  'VNQ': 'Vanguard Real Estate ETF'
};

const TYPE_AXIS_PRESETS = {
  the_quant: { riskAggressive: 74, controlInternal: 76, reactivityEmotional: 30 },
  active_conviction_investor: { riskAggressive: 82, controlInternal: 74, reactivityEmotional: 72 },
  tactical_trend_analyst: { riskAggressive: 78, controlInternal: 36, reactivityEmotional: 32 },
  aggressive_reactive_trader: { riskAggressive: 86, controlInternal: 34, reactivityEmotional: 78 },
  conservative_researcher: { riskAggressive: 26, controlInternal: 74, reactivityEmotional: 26 },
  defensive_active_allocator: { riskAggressive: 28, controlInternal: 72, reactivityEmotional: 74 },
  passive_rational_allocator: { riskAggressive: 24, controlInternal: 30, reactivityEmotional: 24 },
  passive_emotional_allocator: { riskAggressive: 22, controlInternal: 28, reactivityEmotional: 72 }
};

const cubeState = {
  rotX: 22,
  rotY: -28,
  dragging: false,
  startX: 0,
  startY: 0,
  baseRotX: 22,
  baseRotY: -28,
  projectedCorners: [],
  scores: {
    aggressive: 50,
    internal: 50,
    emotional: 50
  }
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, Number(v || 0)));
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setModeView() {
  const mode = String(inputMode?.value || 'type');
  const axisMode = mode === 'axis';
  typeWrap?.classList.toggle('hidden', axisMode);
  axisWrap?.classList.toggle('hidden', !axisMode);
}

function setAxisValues(risk, control, react) {
  if (riskRange) riskRange.value = String(Math.round(clamp(risk, 0, 100)));
  if (controlRange) controlRange.value = String(Math.round(clamp(control, 0, 100)));
  if (reactRange) reactRange.value = String(Math.round(clamp(react, 0, 100)));
  syncAxisLabels();
}

function applyTypePreset(typeKey) {
  const preset = TYPE_AXIS_PRESETS[String(typeKey || '').trim()] || TYPE_AXIS_PRESETS.passive_rational_allocator;
  setAxisValues(preset.riskAggressive, preset.controlInternal, preset.reactivityEmotional);
}

function syncAxisLabels() {
  cubeState.scores.aggressive = clamp(riskRange?.value, 0, 100);
  cubeState.scores.internal = clamp(controlRange?.value, 0, 100);
  cubeState.scores.emotional = clamp(reactRange?.value, 0, 100);
  if (riskValue) riskValue.textContent = String(Math.round(cubeState.scores.aggressive));
  if (controlValue) controlValue.textContent = String(Math.round(cubeState.scores.internal));
  if (reactValue) reactValue.textContent = String(Math.round(cubeState.scores.emotional));
  updateCubeCode();
  drawCube();
}

function renderList(target, rows) {
  if (!target) return;
  const list = Array.isArray(rows) ? rows : [];
  target.innerHTML = list.map((line) => `<li>${line}</li>`).join('');
}

function renderResult(payload) {
  if (!payload) return;
  if (typeTitle) typeTitle.textContent = String(payload?.profile?.label || 'Portfolio Profile');
  if (typeMeta) {
    const risk = Number(payload?.axisScores?.riskAggressive || 0).toFixed(1);
    const control = Number(payload?.axisScores?.controlInternal || 0).toFixed(1);
    const react = Number(payload?.axisScores?.reactivityEmotional || 0).toFixed(1);
    typeMeta.textContent = `Risk ${risk}% | Control ${control}% | Reactivity ${react}%`;
  }
  if (axisCode) axisCode.textContent = '';

  const allocationRows = (payload?.allocation || []).map((row) => `${row.bucket}: ${Number(row.weight || 0).toFixed(1)}%`);
  const tickerRows = Array.isArray(payload?.tickerMix) ? payload.tickerMix : [];
  const rationaleRows = payload?.rationale || [];

  renderList(allocationList, allocationRows);
  if (tickerTableBody) {
    tickerTableBody.innerHTML = tickerRows
      .map((row) => {
        const symbol = escapeHtml(row?.symbol || '-');
        const fullName = escapeHtml(SYMBOL_FULL_NAMES[String(row?.symbol || '').toUpperCase()] || 'Name unavailable');
        const role = escapeHtml(row?.role || 'Role');
        const weight = `${Number(row?.weight || 0).toFixed(1)}%`;
        return `<tr><td>${symbol}</td><td>${fullName}</td><td>${role}</td><td>${weight}</td></tr>`;
      })
      .join('');
  } else {
    const fallbackRows = tickerRows.map((row) => `${row.symbol}: ${Number(row.weight || 0).toFixed(1)}% (${row.role || 'Role'})`);
    renderList(tickerList, fallbackRows);
  }
  renderList(rationaleList, rationaleRows);
  resultEl?.classList.remove('hidden');
}

function resetAxisBarsFromPayload(payload) {
  const risk = Number(payload?.axisScores?.riskAggressive);
  const control = Number(payload?.axisScores?.controlInternal);
  const react = Number(payload?.axisScores?.reactivityEmotional);
  if (!Number.isFinite(risk) || !Number.isFinite(control) || !Number.isFinite(react)) return;
  setAxisValues(risk, control, react);
}

function rotate3D(point, rxDeg, ryDeg) {
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
}

function ensureCubeCanvasSize() {
  if (!cubeStage || !cubeCanvas) return { w: 0, h: 0 };
  const rect = cubeStage.getBoundingClientRect();
  const cssW = Math.max(220, Math.floor(rect.width));
  const cssH = Math.max(180, Math.floor(rect.height));
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const targetW = Math.floor(cssW * dpr);
  const targetH = Math.floor(cssH * dpr);
  if (cubeCanvas.width !== targetW || cubeCanvas.height !== targetH) {
    cubeCanvas.width = targetW;
    cubeCanvas.height = targetH;
  }
  return { w: targetW, h: targetH };
}

function setCubeHover(content, x, y) {
  if (!cubeHoverTip) return;
  cubeHoverTip.innerHTML = content;
  cubeHoverTip.classList.remove('hidden');
  cubeHoverTip.style.left = `${x}px`;
  cubeHoverTip.style.top = `${y}px`;
}

function hideCubeHover() {
  cubeHoverTip?.classList.add('hidden');
}

function cornerMetaFromPoint(p) {
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
}

function drawCube() {
  if (!cubeCanvas || !cubeStage) return;
  const { w, h } = ensureCubeCanvasSize();
  if (!(w > 0 && h > 0)) return;
  const ctx = cubeCanvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) * 0.23;
  const perspective = unit * 3.4;
  const transform = (p) => {
    const r = rotate3D(p, cubeState.rotX, cubeState.rotY);
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
    const za = rotate3D(cubePts[a], cubeState.rotX, cubeState.rotY).z;
    const zb = rotate3D(cubePts[b], cubeState.rotX, cubeState.rotY).z;
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

  const pr = transform({ x: cubeState.scores.aggressive / 50 - 1, y: 0, z: 0 });
  const pc = transform({ x: 0, y: cubeState.scores.internal / 50 - 1, z: 0 });
  const pe = transform({ x: 0, y: 0, z: cubeState.scores.emotional / 50 - 1 });
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

  cubeState.projectedCorners = cubePts.map((c) => {
    const p = transform(c);
    const meta = cornerMetaFromPoint(c);
    return { x: p.x, y: p.y, label: meta.label };
  });
  cubeState.projectedCorners.forEach((c) => {
    ctx.fillStyle = 'rgba(100,116,139,0.55)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateCubeCode() {
  const r = cubeState.scores.aggressive >= 50 ? 'A' : 'C';
  const c = cubeState.scores.internal >= 50 ? 'I' : 'E';
  const e = cubeState.scores.emotional >= 50 ? 'E' : 'R';
  if (builderCubeCode) builderCubeCode.textContent = '';
}

function updateCubeHover(clientX, clientY) {
  if (!cubeCanvas || !cubeStage) return;
  const rect = cubeCanvas.getBoundingClientRect();
  const dpr = cubeCanvas.width / Math.max(1, rect.width);
  const x = (clientX - rect.left) * dpr;
  const y = (clientY - rect.top) * dpr;
  let best = null;
  let bestD2 = Infinity;
  cubeState.projectedCorners.forEach((c) => {
    const dx = c.x - x;
    const dy = c.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = c;
    }
  });
  if (!best || bestD2 > (16 * dpr) ** 2) {
    hideCubeHover();
    return;
  }
  const stageRect = cubeStage.getBoundingClientRect();
  setCubeHover(`<strong>${best.label}</strong>`, clientX - stageRect.left, clientY - stageRect.top);
}

async function submitBuild(event) {
  event.preventDefault();
  const mode = String(inputMode?.value || 'type');
  const body = {};
  if (mode === 'axis') {
    body.axisScores = {
      riskAggressive: Number(riskRange?.value || 50),
      controlInternal: Number(controlRange?.value || 50),
      reactivityEmotional: Number(reactRange?.value || 50)
    };
  } else {
    body.investorType = String(typeSelect?.value || '').trim();
  }

  statusEl?.classList.remove('hidden');
  if (statusEl) statusEl.textContent = 'Generating AI portfolio...';
  try {
    const res = await fetch('/api/investotype/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to generate portfolio.');
    if (mode === 'type') {
      resetAxisBarsFromPayload(data);
    }
    renderResult(data);
    if (statusEl) statusEl.textContent = 'AI portfolio generated.';
  } catch (error) {
    if (statusEl) statusEl.textContent = error.message || 'Failed to generate AI portfolio.';
  }
}

inputMode?.addEventListener('change', setModeView);
typeSelect?.addEventListener('change', () => {
  applyTypePreset(typeSelect.value);
});
[riskRange, controlRange, reactRange].forEach((el) =>
  el?.addEventListener('input', () => {
    if (inputMode) inputMode.value = 'axis';
    setModeView();
    syncAxisLabels();
  })
);
form?.addEventListener('submit', submitBuild);

if (cubeStage && cubeCanvas) {
  cubeStage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    cubeState.dragging = true;
    cubeState.startX = e.clientX;
    cubeState.startY = e.clientY;
    cubeState.baseRotX = cubeState.rotX;
    cubeState.baseRotY = cubeState.rotY;
    cubeStage.classList.add('dragging');
    cubeStage.setPointerCapture?.(e.pointerId);
  });
  cubeStage.addEventListener('pointermove', (e) => {
    if (cubeState.dragging) {
      e.preventDefault();
      const dx = e.clientX - cubeState.startX;
      const dy = e.clientY - cubeState.startY;
      cubeState.rotY = cubeState.baseRotY + dx * 0.34;
      cubeState.rotX = Math.max(-80, Math.min(80, cubeState.baseRotX - dy * 0.28));
      drawCube();
      hideCubeHover();
      return;
    }
    updateCubeHover(e.clientX, e.clientY);
  });
  const stopDrag = () => {
    cubeState.dragging = false;
    cubeStage.classList.remove('dragging');
  };
  cubeStage.addEventListener('pointerup', stopDrag);
  cubeStage.addEventListener('pointercancel', stopDrag);
  cubeStage.addEventListener('mouseleave', () => {
    stopDrag();
    hideCubeHover();
  });
  window.addEventListener('resize', drawCube, { passive: true });
}

setModeView();
applyTypePreset(typeSelect?.value || 'passive_rational_allocator');
statusEl?.classList.add('hidden');
resultEl?.classList.add('hidden');
