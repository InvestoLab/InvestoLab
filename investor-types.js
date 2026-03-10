const riskRange = document.getElementById('typesRiskRange');
const controlRange = document.getElementById('typesControlRange');
const reactRange = document.getElementById('typesReactRange');
const riskValue = document.getElementById('typesRiskValue');
const controlValue = document.getElementById('typesControlValue');
const reactValue = document.getElementById('typesReactValue');
const cubeCode = document.getElementById('typesCubeCode');
const stage = document.getElementById('typesAxis3dStage');
const canvas = document.getElementById('typesAxis3dCanvas');
const hoverTip = document.getElementById('typesAxis3dHoverTip');

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
    aggressive: 50,
    internal: 50,
    emotional: 50
  }
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, Number(v || 0)));
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

function ensureCanvasSize() {
  if (!stage || !canvas) return { w: 0, h: 0 };
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
}

function setHover(content, x, y) {
  if (!hoverTip) return;
  hoverTip.innerHTML = content;
  hoverTip.classList.remove('hidden');
  hoverTip.style.left = `${x}px`;
  hoverTip.style.top = `${y}px`;
}

function hideHover() {
  hoverTip?.classList.add('hidden');
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

function draw() {
  if (!canvas) return;
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

  const pr = transform({ x: state.scores.aggressive / 50 - 1, y: 0, z: 0 });
  const pc = transform({ x: 0, y: state.scores.internal / 50 - 1, z: 0 });
  const pe = transform({ x: 0, y: 0, z: state.scores.emotional / 50 - 1 });
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
}

function updateCodeLabel() {
  const r = state.scores.aggressive >= 50 ? 'A' : 'C';
  const c = state.scores.internal >= 50 ? 'I' : 'E';
  const e = state.scores.emotional >= 50 ? 'E' : 'R';
  const code = `${r}-${c}-${e}`;
  const typeLabel = {
    'A-I-R': 'The Quant',
    'A-I-E': 'Portfolio Manager',
    'A-E-R': 'Technical Analyst',
    'A-E-E': 'Day Trader',
    'C-I-R': 'Research Analyst',
    'C-I-E': 'Risk Manager',
    'C-E-R': 'Index Strategist',
    'C-E-E': 'Wealth Advisor'
  }[code] || 'Investor Type';
  if (cubeCode) cubeCode.textContent = typeLabel;
}

function syncFromRanges() {
  state.scores.aggressive = clamp(riskRange?.value, 0, 100);
  state.scores.internal = clamp(controlRange?.value, 0, 100);
  state.scores.emotional = clamp(reactRange?.value, 0, 100);
  if (riskValue) riskValue.textContent = String(Math.round(state.scores.aggressive));
  if (controlValue) controlValue.textContent = String(Math.round(state.scores.internal));
  if (reactValue) reactValue.textContent = String(Math.round(state.scores.emotional));
  updateCodeLabel();
  draw();
}

function updateHover(clientX, clientY) {
  if (!canvas || !stage) return;
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
  setHover(`<strong>${best.label}</strong>`, clientX - stageRect.left, clientY - stageRect.top);
}

function init() {
  if (!stage || !canvas) return;

  [riskRange, controlRange, reactRange].forEach((el) => {
    el?.addEventListener('input', syncFromRanges);
  });

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

  syncFromRanges();
}

init();



