const SCENARIO_BANK = [
  {
    title: 'Gap Down Open',
    stress: 0.78,
    context: 'Your biggest stock drops 11% at open after bad company news.',
    choices: [
      {
        label: 'Sell half now and keep the rest with a stop.',
        outcome: 'This cuts risk fast, but you could miss a quick rebound.',
        risk: 0.24,
        control: 0.9,
        react: 0.66,
        quality: 0.8
      },
      {
        label: 'Hold and wait until market close.',
        outcome: 'You avoid panic trading, but you keep full risk for now.',
        risk: 0.66,
        control: 0.46,
        react: 0.28,
        quality: 0.62
      },
      {
        label: 'Buy more right away to lower average price.',
        outcome: 'This can boost upside, but risk gets much higher.',
        risk: 0.9,
        control: 0.58,
        react: 0.86,
        quality: 0.34
      }
    ]
  },
  {
    title: 'Parabolic Rally',
    stress: 0.64,
    context: 'One holding is up 34% in two weeks and everyone is talking about it.',
    choices: [
      {
        label: 'Take some profit and rebalance.',
        outcome: 'You lock gains and lower concentration risk.',
        risk: 0.28,
        control: 0.92,
        react: 0.26,
        quality: 0.84
      },
      {
        label: 'Do nothing and let it keep running.',
        outcome: 'You keep upside, but your plan can drift.',
        risk: 0.78,
        control: 0.4,
        react: 0.46,
        quality: 0.54
      },
      {
        label: 'Buy more now before it goes even higher.',
        outcome: 'You may gain more, but you might be buying near the top.',
        risk: 0.92,
        control: 0.56,
        react: 0.88,
        quality: 0.3
      }
    ]
  },
  {
    title: 'Macro Shock Headline',
    stress: 0.82,
    context: 'Surprise rate news hits. The market drops about 4% today.',
    choices: [
      {
        label: 'Sell some risky positions and hold more cash.',
        outcome: 'This reduces damage now, but may miss a quick bounce.',
        risk: 0.22,
        control: 0.86,
        react: 0.62,
        quality: 0.74
      },
      {
        label: 'Stick to your plan and rebalance on schedule.',
        outcome: 'This keeps discipline and avoids reacting to noise.',
        risk: 0.58,
        control: 0.62,
        react: 0.18,
        quality: 0.82
      },
      {
        label: 'Move quickly into defensive assets.',
        outcome: 'Could help if drop continues, but timing is risky.',
        risk: 0.4,
        control: 0.78,
        react: 0.8,
        quality: 0.46
      }
    ]
  },
  {
    title: 'Earnings Coin Flip',
    stress: 0.58,
    context: 'A key stock reports earnings tomorrow and could move a lot.',
    choices: [
      {
        label: 'Reduce position size before earnings.',
        outcome: 'You lower event risk while keeping some upside.',
        risk: 0.26,
        control: 0.84,
        react: 0.34,
        quality: 0.86
      },
      {
        label: 'Keep full size and accept the result.',
        outcome: 'You keep full upside, but risk stays high.',
        risk: 0.72,
        control: 0.44,
        react: 0.34,
        quality: 0.58
      },
      {
        label: 'Buy more before earnings.',
        outcome: 'Potential return rises, but downside risk rises too.',
        risk: 0.94,
        control: 0.56,
        react: 0.82,
        quality: 0.28
      }
    ]
  },
  {
    title: 'Peer Outperformance Pressure',
    stress: 0.68,
    context: 'Friends are sharing big gains in assets you do not own.',
    choices: [
      {
        label: 'Ignore it and keep your current plan.',
        outcome: 'You avoid FOMO and stay consistent.',
        risk: 0.44,
        control: 0.74,
        react: 0.12,
        quality: 0.88
      },
      {
        label: 'Open a small test position.',
        outcome: 'You adapt slowly while keeping risk small.',
        risk: 0.62,
        control: 0.8,
        react: 0.5,
        quality: 0.72
      },
      {
        label: 'Shift a lot of money now to catch up.',
        outcome: 'You may catch up fast, but this is high-FOMO risk.',
        risk: 0.9,
        control: 0.58,
        react: 0.94,
        quality: 0.22
      }
    ]
  },
  {
    title: 'Slow Drawdown Grind',
    stress: 0.74,
    context: 'Your portfolio has drifted down for six weeks.',
    choices: [
      {
        label: 'Cut weaker positions and tighten rules.',
        outcome: 'This improves risk control and can slow losses.',
        risk: 0.24,
        control: 0.9,
        react: 0.36,
        quality: 0.86
      },
      {
        label: 'Stay invested and wait for clear recovery signs.',
        outcome: 'You avoid overtrading and keep long-term exposure.',
        risk: 0.62,
        control: 0.54,
        react: 0.24,
        quality: 0.72
      },
      {
        label: 'Buy much more to lower average price quickly.',
        outcome: 'Could bounce hard, but risk and concentration jump.',
        risk: 0.9,
        control: 0.66,
        react: 0.74,
        quality: 0.3
      }
    ]
  },
  {
    title: 'Liquidity Need',
    stress: 0.56,
    context: 'You will need part of this money in three months.',
    choices: [
      {
        label: 'Raise cash now and lower risk.',
        outcome: 'You improve safety and reduce forced selling later.',
        risk: 0.14,
        control: 0.86,
        react: 0.2,
        quality: 0.9
      },
      {
        label: 'Adjust slowly and keep your core plan.',
        outcome: 'You keep upside, but cash certainty is only moderate.',
        risk: 0.52,
        control: 0.58,
        react: 0.32,
        quality: 0.68
      },
      {
        label: 'Stay fully invested to chase return.',
        outcome: 'Return chance stays high, but cash-need risk rises.',
        risk: 0.88,
        control: 0.42,
        react: 0.6,
        quality: 0.26
      }
    ]
  },
  {
    title: 'After a Big Win',
    stress: 0.62,
    context: 'You just made a big winning trade and feel very confident.',
    choices: [
      {
        label: 'Take notes, reset size, and follow your process.',
        outcome: 'You keep discipline and avoid overconfidence.',
        risk: 0.3,
        control: 0.92,
        react: 0.16,
        quality: 0.92
      },
      {
        label: 'Only take trades that were already planned.',
        outcome: 'You stay active while keeping risk mostly controlled.',
        risk: 0.6,
        control: 0.72,
        react: 0.3,
        quality: 0.76
      },
      {
        label: 'Increase trade size because momentum feels strong.',
        outcome: 'Could increase gains, but emotion risk is high.',
        risk: 0.92,
        control: 0.6,
        react: 0.9,
        quality: 0.24
      }
    ]
  }
];

const ROUND_SECONDS = 20;

const arenaIntro = document.getElementById('arenaIntro');
const arenaGame = document.getElementById('arenaGame');
const arenaResult = document.getElementById('arenaResult');
const arenaStartBtn = document.getElementById('arenaStartBtn');
const arenaRestartBtn = document.getElementById('arenaRestartBtn');
const arenaNextBtn = document.getElementById('arenaNextBtn');
const arenaProgress = document.getElementById('arenaProgress');
const arenaTimer = document.getElementById('arenaTimer');
const arenaStreak = document.getElementById('arenaStreak');
const arenaTempo = document.getElementById('arenaTempo');
const arenaScenarioTitle = document.getElementById('arenaScenarioTitle');
const arenaScenarioContext = document.getElementById('arenaScenarioContext');
const arenaChoices = document.getElementById('arenaChoices');
const arenaConfidence = document.getElementById('arenaConfidence');
const arenaConfidenceValue = document.getElementById('arenaConfidenceValue');
const arenaFeedback = document.getElementById('arenaFeedback');
const arenaFeedbackTitle = document.getElementById('arenaFeedbackTitle');
const arenaFeedbackText = document.getElementById('arenaFeedbackText');
const arenaTypeLabel = document.getElementById('arenaTypeLabel');
const arenaTypeSummary = document.getElementById('arenaTypeSummary');
const arenaAxisSummary = document.getElementById('arenaAxisSummary');
const arenaAxisBars = document.getElementById('arenaAxisBars');
const arenaAxis3dCanvas = document.getElementById('arenaAxis3dCanvas');
const arenaAxis3dStage = document.getElementById('arenaAxis3dStage');
const arenaAxis3dHover = document.getElementById('arenaAxis3dHover');
const arenaAxis3dLabels = document.getElementById('arenaAxis3dLabels');
const arenaInsights = document.getElementById('arenaInsights');
const arenaBehaviorList = document.getElementById('arenaBehaviorList');
const arenaStrengthList = document.getElementById('arenaStrengthList');
const arenaRiskList = document.getElementById('arenaRiskList');
const arenaPlanList = document.getElementById('arenaPlanList');
const arenaRoundLog = document.getElementById('arenaRoundLog');
const ROUND_SWAP_MS = 220;
const START_TRANSITION_MS = 280;

let roundIndex = 0;
let roundSelected = null;
let roundSecondsLeft = ROUND_SECONDS;
let timerId = null;
let roundStartedAtMs = 0;
let awaitingContinue = false;
let disciplineStreak = 0;
const picks = [];
const arenaAxis3dState = {
  rotX: -22,
  rotY: 28,
  dragging: false,
  startX: 0,
  startY: 0,
  baseRotX: -22,
  baseRotY: 28,
  scores: { aggressive: 50, internal: 50, emotional: 50 },
  projectedCorners: []
};
let arenaLastScores = null;
let currentScenarios = [];

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v || 0)));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle(list = []) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildScenarioSet() {
  // Randomize round order, choice order, and stress slightly each run.
  return shuffle(SCENARIO_BANK).map((scenario) => {
    const stressJitter = (Math.random() - 0.5) * 0.1; // +/- 0.05
    return {
      ...scenario,
      stress: clamp01(Number(scenario.stress || 0.5) + stressJitter),
      choices: shuffle((scenario.choices || []).map((choice) => ({ ...choice })))
    };
  });
}

function stdDev(values = []) {
  const nums = values.map((v) => Number(v || 0)).filter((v) => Number.isFinite(v));
  if (!nums.length) return 0;
  const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
  const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function ensureArenaAxis3dCanvasSize() {
  if (!arenaAxis3dCanvas || !arenaAxis3dStage) return { w: 0, h: 0 };
  const rect = arenaAxis3dStage.getBoundingClientRect();
  const cssW = Math.max(220, Math.floor(rect.width - 10));
  const cssH = Math.max(180, Math.floor(rect.height - 10));
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const targetW = Math.floor(cssW * dpr);
  const targetH = Math.floor(cssH * dpr);
  if (arenaAxis3dCanvas.width !== targetW || arenaAxis3dCanvas.height !== targetH) {
    arenaAxis3dCanvas.width = targetW;
    arenaAxis3dCanvas.height = targetH;
  }
  return { w: targetW, h: targetH };
}

function setArenaAxis3dHover(content, x, y) {
  if (!arenaAxis3dHover || !arenaAxis3dStage) return;
  arenaAxis3dHover.innerHTML = content;
  arenaAxis3dHover.classList.remove('hidden');
  arenaAxis3dHover.style.left = `${x}px`;
  arenaAxis3dHover.style.top = `${y}px`;
}

function hideArenaAxis3dHover() {
  if (!arenaAxis3dHover) return;
  arenaAxis3dHover.classList.add('hidden');
}

function cornerMetaFromPoint(p) {
  const risk = p.x >= 0 ? 'A' : 'C';
  const control = p.y >= 0 ? 'I' : 'E';
  const react = p.z >= 0 ? 'E' : 'R';
  const code = `${risk}-${control}-${react}`;
  const explanation = {
    'A-I-R': 'Aggressive, Active, Rational',
    'A-I-E': 'Aggressive, Active, Emotional',
    'A-E-R': 'Aggressive, Passive, Rational',
    'A-E-E': 'Aggressive, Passive, Emotional',
    'C-I-R': 'Conservative, Active, Rational',
    'C-I-E': 'Conservative, Active, Emotional',
    'C-E-R': 'Conservative, Passive, Rational',
    'C-E-E': 'Conservative, Passive, Emotional'
  }[code];
  return { code, explanation: explanation || 'Unclassified profile' };
}

function updateArenaAxis3dHover(clientX, clientY) {
  if (!arenaAxis3dCanvas || !arenaAxis3dStage || !arenaAxis3dState.projectedCorners.length) return;
  const rect = arenaAxis3dCanvas.getBoundingClientRect();
  const dpr = arenaAxis3dCanvas.width / Math.max(1, rect.width);
  const x = (clientX - rect.left) * dpr;
  const y = (clientY - rect.top) * dpr;
  let best = null;
  let bestD2 = Infinity;
  arenaAxis3dState.projectedCorners.forEach((c) => {
    const dx = c.x - x;
    const dy = c.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = c;
    }
  });
  if (!best || bestD2 > (16 * dpr) ** 2) {
    hideArenaAxis3dHover();
    return;
  }
  const stageRect = arenaAxis3dStage.getBoundingClientRect();
  const localX = clientX - stageRect.left;
  const localY = clientY - stageRect.top;
  setArenaAxis3dHover(`<strong>${best.explanation}</strong>`, localX, localY);
}

function renderArenaAxis3dGraph() {
  if (!arenaAxis3dCanvas) return;
  const { w, h } = ensureArenaAxis3dCanvasSize();
  if (w <= 0 || h <= 0) return;
  const ctx = arenaAxis3dCanvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) * 0.23;
  const perspective = unit * 3.4;
  const transform = (p) => {
    const r = rotate3D(p, arenaAxis3dState.rotX, arenaAxis3dState.rotY);
    const s = perspective / (perspective + r.z * unit);
    return { x: cx + r.x * unit * s, y: cy - r.y * unit * s, z: r.z };
  };
  const drawSegment = (a, b, color, width = 1, alpha = 1, dash = null, glow = 0) => {
    const p1 = transform(a);
    const p2 = transform(b);
    ctx.save();
    if (dash) ctx.setLineDash(dash);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (glow > 0) {
      ctx.shadowBlur = glow;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
    return { p1, p2 };
  };
  const drawArrow = (from, to, color) => {
    const seg = drawSegment(from, to, color, 2.5, 0.92, null, 8);
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
  const drawPillLabel = (text, p, fg = '#0f172a', bg = 'rgba(255,255,255,0.92)', border = 'rgba(148,163,184,0.45)') => {
    const padX = 6;
    const padY = 4;
    ctx.save();
    ctx.font = `${Math.max(9, Math.floor(w * 0.014))}px ui-sans-serif, system-ui`;
    const tw = ctx.measureText(text).width;
    const x = p.x + (p.x >= cx ? 6 : -(tw + padX * 2 + 6));
    const y = p.y - 9;
    const bw = tw + padX * 2;
    const bh = 17 + padY * 0.6;
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
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

  for (let i = 0; i < 32; i += 1) {
    const sx = ((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const sy = ((Math.sin((i + 1) * 78.233) * 12345.6789) % 1 + 1) % 1;
    const r = 0.5 + ((Math.sin((i + 1) * 4.17) + 1) * 0.5) * 1.4;
    ctx.fillStyle = 'rgba(148,163,184,0.22)';
    ctx.beginPath();
    ctx.arc(sx * w, sy * h, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const t of [-0.6, -0.3, 0, 0.3, 0.6]) {
    drawSegment({ x: -1, y: t, z: -1 }, { x: 1, y: t, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
    drawSegment({ x: t, y: -1, z: -1 }, { x: t, y: 1, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
    drawSegment({ x: -1, y: -1, z: t }, { x: 1, y: -1, z: t }, '#cbd5e1', 1, 0.18, [2, 5]);
  }

  const cubePts = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
  ];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  edges.forEach(([a, b]) => {
    const za = rotate3D(cubePts[a], arenaAxis3dState.rotX, arenaAxis3dState.rotY).z;
    const zb = rotate3D(cubePts[b], arenaAxis3dState.rotX, arenaAxis3dState.rotY).z;
    const depthAlpha = 0.24 + ((za + zb + 2) / 4) * 0.32;
    drawSegment(cubePts[a], cubePts[b], '#64748b', 1.2, depthAlpha);
  });

  drawArrow({ x: -1.22, y: 0, z: 0 }, { x: 1.22, y: 0, z: 0 }, '#2563eb');
  drawArrow({ x: 0, y: -1.22, z: 0 }, { x: 0, y: 1.22, z: 0 }, '#0f766e');
  drawArrow({ x: 0, y: 0, z: -1.22 }, { x: 0, y: 0, z: 1.22 }, '#dc2626');

  const endpointLabels = [
    { p: { x: 1.29, y: 0, z: 0 }, t: 'Aggressive', c: '#1d4ed8' },
    { p: { x: -1.29, y: 0, z: 0 }, t: 'Conservative', c: '#1d4ed8' },
    { p: { x: 0, y: 1.29, z: 0 }, t: 'Active', c: '#0f766e' },
    { p: { x: 0, y: -1.29, z: 0 }, t: 'Passive', c: '#0f766e' },
    { p: { x: 0, y: 0, z: 1.29 }, t: 'Emotional', c: '#dc2626' },
    { p: { x: 0, y: 0, z: -1.29 }, t: 'Rational', c: '#dc2626' }
  ];
  endpointLabels.forEach((item) => {
    drawPillLabel(item.t, transform(item.p), item.c, 'rgba(255,255,255,0.9)', 'rgba(203,213,225,0.8)');
  });

  arenaAxis3dState.projectedCorners = cubePts.map((c) => {
    const p = transform(c);
    const meta = cornerMetaFromPoint(c);
    return { x: p.x, y: p.y, code: meta.code, explanation: meta.explanation, z: p.z };
  });

  arenaAxis3dState.projectedCorners.sort((a, b) => a.z - b.z).forEach((c) => {
    const radius = Math.max(2.4, Math.min(5.5, w * 0.0065 + c.z * 0.9));
    ctx.fillStyle = `rgba(100,116,139,${0.4 + (c.z + 1) * 0.15})`;
    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  const scores = arenaAxis3dState.scores;
  const pr = { x: scores.aggressive / 50 - 1, y: 0, z: 0 };
  const pc = { x: 0, y: scores.internal / 50 - 1, z: 0 };
  const pe = { x: 0, y: 0, z: scores.emotional / 50 - 1 };
  const rr = transform(pr);
  const rc = transform(pc);
  const re = transform(pe);

  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, unit * 1.2);
  glow.addColorStop(0, 'rgba(56,189,248,0.2)');
  glow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y);
  ctx.lineTo(rc.x, rc.y);
  ctx.lineTo(re.x, re.y);
  ctx.closePath();
  ctx.fill();

  const profileFill = ctx.createLinearGradient(rr.x, rr.y, re.x, re.y);
  profileFill.addColorStop(0, 'rgba(37,99,235,0.24)');
  profileFill.addColorStop(0.5, 'rgba(15,118,110,0.18)');
  profileFill.addColorStop(1, 'rgba(220,38,38,0.24)');
  ctx.fillStyle = profileFill;
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y);
  ctx.lineTo(rc.x, rc.y);
  ctx.lineTo(re.x, re.y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(30,64,175,0.9)';
  ctx.lineWidth = 2.2;
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(59,130,246,0.34)';
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y);
  ctx.lineTo(rc.x, rc.y);
  ctx.lineTo(re.x, re.y);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  [rr, rc, re].forEach((p) => {
    ctx.strokeStyle = 'rgba(148,163,184,0.36)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  [
    { p: rr, c: '#2563eb', t: `Aggressive ${Math.round(scores.aggressive)}%` },
    { p: rc, c: '#0f766e', t: `Active ${Math.round(scores.internal)}%` },
    { p: re, c: '#dc2626', t: `Emotional ${Math.round(scores.emotional)}%` }
  ].forEach((n) => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = n.c;
    ctx.fillStyle = n.c;
    ctx.beginPath();
    ctx.arc(n.p.x, n.p.y, Math.max(4.5, Math.min(7.2, w * 0.0092)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawPillLabel(n.t, n.p, '#0f172a', 'rgba(255,255,255,0.95)', 'rgba(148,163,184,0.65)');
  });
}

function initArenaAxis3dInteractivity() {
  if (!arenaAxis3dStage || arenaAxis3dStage.dataset.bound === '1') return;
  arenaAxis3dStage.dataset.bound = '1';

  arenaAxis3dStage.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    arenaAxis3dState.dragging = true;
    arenaAxis3dState.startX = event.clientX;
    arenaAxis3dState.startY = event.clientY;
    arenaAxis3dState.baseRotX = arenaAxis3dState.rotX;
    arenaAxis3dState.baseRotY = arenaAxis3dState.rotY;
    arenaAxis3dStage.classList.add('dragging');
    arenaAxis3dStage.setPointerCapture?.(event.pointerId);
  });
  arenaAxis3dStage.addEventListener('pointermove', (event) => {
    if (arenaAxis3dState.dragging) {
      event.preventDefault();
      const dx = event.clientX - arenaAxis3dState.startX;
      const dy = event.clientY - arenaAxis3dState.startY;
      arenaAxis3dState.rotY = arenaAxis3dState.baseRotY + dx * 0.34;
      arenaAxis3dState.rotX = Math.max(-80, Math.min(80, arenaAxis3dState.baseRotX - dy * 0.28));
      renderArenaAxis3dGraph();
      hideArenaAxis3dHover();
      return;
    }
    updateArenaAxis3dHover(event.clientX, event.clientY);
  });
  const stop = () => {
    arenaAxis3dState.dragging = false;
    arenaAxis3dStage.classList.remove('dragging');
  };
  arenaAxis3dStage.addEventListener('pointerup', stop);
  arenaAxis3dStage.addEventListener('pointercancel', stop);
  arenaAxis3dStage.addEventListener('mouseleave', () => {
    stop();
    hideArenaAxis3dHover();
  });
}

function setArenaAxis3dScores(scores = {}) {
  const aggressive = Math.round(clamp01(scores.risk) * 100);
  const internal = Math.round(clamp01(scores.control) * 100);
  const emotional = Math.round(clamp01(scores.react) * 100);
  arenaAxis3dState.scores = { aggressive, internal, emotional };
  if (arenaAxis3dLabels) {
    arenaAxis3dLabels.innerHTML = '';
  }
  renderArenaAxis3dGraph();
}

function showView(mode) {
  arenaIntro?.classList.toggle('hidden', mode !== 'intro');
  arenaGame?.classList.toggle('hidden', mode !== 'game');
  arenaResult?.classList.toggle('hidden', mode !== 'result');
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateConfidenceLabel() {
  if (!arenaConfidenceValue || !arenaConfidence) return;
  arenaConfidenceValue.textContent = `${arenaConfidence.value}/5`;
}

function speedToTempo(speed) {
  if (speed >= 0.72) return 'Very Fast';
  if (speed >= 0.52) return 'Fast';
  if (speed >= 0.32) return 'Balanced';
  return 'Deliberate';
}

function updateLiveSignals(speed = null) {
  if (arenaStreak) arenaStreak.textContent = `Discipline Streak: ${disciplineStreak}`;
  if (arenaTempo) arenaTempo.textContent = `Tempo: ${speed == null ? 'Balanced' : speedToTempo(speed)}`;
}

function selectChoice(index) {
  roundSelected = Number(index);
  const buttons = [...arenaChoices.querySelectorAll('button[data-choice-index]')];
  buttons.forEach((button) => {
    const active = Number(button.dataset.choiceIndex) === roundSelected;
    button.classList.toggle('active', active);
  });
  if (arenaNextBtn && !awaitingContinue) {
    arenaNextBtn.disabled = false;
    arenaNextBtn.textContent = 'Lock Decision';
  }
}

function renderRound() {
  const round = currentScenarios[roundIndex];
  roundSelected = null;
  awaitingContinue = false;
  arenaFeedback?.classList.add('hidden');

  if (arenaNextBtn) {
    arenaNextBtn.disabled = true;
    arenaNextBtn.textContent = 'Lock Decision';
  }
  if (arenaProgress) arenaProgress.textContent = `Round ${roundIndex + 1} / ${currentScenarios.length}`;
  if (arenaScenarioTitle) arenaScenarioTitle.textContent = round.title;
  if (arenaScenarioContext) arenaScenarioContext.textContent = round.context;

  if (arenaChoices) {
    arenaChoices.innerHTML = round.choices
      .map((choice, idx) => `<button type="button" data-choice-index="${idx}">${escapeHtml(choice.label)}</button>`)
      .join('');
  }

  [...arenaChoices.querySelectorAll('button[data-choice-index]')].forEach((button) => {
    button.addEventListener('click', () => selectChoice(button.dataset.choiceIndex));
  });

  roundSecondsLeft = ROUND_SECONDS;
  roundStartedAtMs = Date.now();
  if (arenaTimer) arenaTimer.textContent = `${roundSecondsLeft}s`;
  stopTimer();
  timerId = setInterval(() => {
    roundSecondsLeft -= 1;
    if (arenaTimer) arenaTimer.textContent = `${Math.max(0, roundSecondsLeft)}s`;
    if (roundSecondsLeft <= 0) {
      if (roundSelected == null) selectChoice(0);
      commitRound(true);
    }
  }, 1000);
}

async function playRoundTransition(nextRoundFn) {
  if (!arenaGame) {
    nextRoundFn();
    return;
  }
  arenaGame.classList.add('decision-arena-round-out');
  await wait(ROUND_SWAP_MS);
  nextRoundFn();
  arenaGame.classList.remove('decision-arena-round-out');
  arenaGame.classList.add('decision-arena-round-in');
  setTimeout(() => {
    arenaGame.classList.remove('decision-arena-round-in');
  }, 280);
}

function roundFeedbackTone(pick) {
  if (pick.quality >= 0.8 && pick.react <= 0.5) return { title: 'Strong Process Signal', cls: 'good' };
  if (pick.react >= 0.75 && pick.speed >= 0.72) return { title: 'High Emotion Signal', cls: 'warn' };
  return { title: 'Balanced Decision Signal', cls: 'neutral' };
}

function buildPick(round, choice, confidence, elapsedSec, speed) {
  const stress = clamp01(round.stress || 0.5);
  const quality = clamp01(choice.quality || 0.5);
  const confidenceScale = 0.75 + (confidence - 1) * 0.125;
  const stressLift = 1 + stress * 0.2;

  const risk = clamp01(choice.risk * confidenceScale * stressLift);
  const control = clamp01(choice.control * (0.72 + quality * 0.42));
  const react = clamp01(choice.react * confidenceScale + speed * (0.1 + stress * 0.14) + (1 - quality) * 0.11);

  return {
    scenario: round.title,
    choice: choice.label,
    outcome: choice.outcome,
    risk,
    control,
    react,
    quality,
    stress,
    speed,
    confidence,
    elapsedSec
  };
}

function commitRound(fromTimer = false) {
  if (awaitingContinue && !fromTimer) {
    goNextRound();
    return;
  }

  stopTimer();
  const round = currentScenarios[roundIndex];
  const selectedChoice = round.choices[Math.max(0, Number(roundSelected || 0))];
  const confidence = Number(arenaConfidence?.value || 3);
  const elapsedSec = Math.max(0.1, (Date.now() - roundStartedAtMs) / 1000);
  const speed = clamp01(1 - elapsedSec / ROUND_SECONDS);
  const pick = buildPick(round, selectedChoice, confidence, elapsedSec, speed);
  picks.push(pick);

  const disciplinedRound = pick.quality >= 0.7 && pick.react < 0.62;
  disciplineStreak = disciplinedRound ? disciplineStreak + 1 : 0;
  updateLiveSignals(speed);

  if (!fromTimer) {
    const tone = roundFeedbackTone(pick);
    if (arenaFeedbackTitle) arenaFeedbackTitle.textContent = tone.title;
    if (arenaFeedbackText) {
      arenaFeedbackText.textContent = `${selectedChoice.outcome} | Tempo: ${speedToTempo(speed)} | Confidence: ${confidence}/5`;
    }
    if (arenaFeedback) {
      arenaFeedback.classList.remove('hidden', 'good', 'warn', 'neutral');
      arenaFeedback.classList.add(tone.cls);
    }

    awaitingContinue = true;
    if (arenaNextBtn) {
      arenaNextBtn.disabled = false;
      arenaNextBtn.textContent = roundIndex + 1 >= currentScenarios.length ? 'See Results' : 'Next Round';
    }
    return;
  }

  goNextRound();
}

function axisRow(label, score, lowLabel, highLabel) {
  const pct = Math.round(clamp01(score) * 100);
  const pctPos = Math.max(0, Math.min(100, pct));
  return `
    <div class="investor-axis-chip">
      <strong>${escapeHtml(label)}: ${pct}%</strong>
      <div class="axis-chip-bar">
        <span>${escapeHtml(lowLabel)}</span>
        <div class="axis-chip-track">
          <div class="axis-chip-dot" style="left:${pctPos}%"></div>
          <div class="axis-chip-you" style="left:${pctPos}%">YOU</div>
        </div>
        <span>${escapeHtml(highLabel)}</span>
      </div>
    </div>
  `;
}

function getProfile(scores, markers) {
  const riskHigh = scores.risk >= 0.58;
  const controlHigh = scores.control >= 0.58;
  const reactHigh = scores.react >= 0.58;

  if (riskHigh && controlHigh && !reactHigh) {
    return {
      label: 'Strategic Aggressor',
      summary: 'You take bold chances, but usually with a clear plan.'
    };
  }
  if (!riskHigh && controlHigh && !reactHigh) {
    return {
      label: 'Disciplined Defender',
      summary: 'You focus on protecting losses and making structured choices.'
    };
  }
  if (riskHigh && !controlHigh && reactHigh) {
    return {
      label: 'Momentum Chaser',
      summary: 'You move fast for upside, but pressure can reduce discipline.'
    };
  }
  if (!riskHigh && !controlHigh && !reactHigh) {
    return {
      label: 'Passive Stabilizer',
      summary: 'You prefer steady investing and fewer changes.'
    };
  }

  if (markers.consistency >= 0.72 && markers.impulseRate <= 0.2) {
    return {
      label: 'Adaptive Balancer (Disciplined)',
      summary: 'You adapt to market changes while staying disciplined.'
    };
  }

  return {
    label: 'Adaptive Balancer',
    summary: 'You change style by situation. Clearer risk rules can improve consistency.'
  };
}

function listHtml(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildBehaviorNarrative(scores, markers) {
  const behavior = [];
  behavior.push(
    scores.risk >= 0.62
      ? 'You are comfortable taking bigger risks for bigger upside.'
      : scores.risk <= 0.38
      ? 'You focus on safety and limiting losses.'
      : 'You keep a middle-ground risk style.'
  );
  behavior.push(
    scores.control >= 0.62
      ? 'You like making active decisions on size and timing.'
      : scores.control <= 0.38
      ? 'You are comfortable with a simpler, more hands-off approach.'
      : 'You mix hands-on and hands-off decisions.'
  );
  behavior.push(
    scores.react >= 0.62
      ? 'Under stress, emotions and speed affect your decisions more.'
      : scores.react <= 0.38
      ? 'You usually stay calm and avoid impulse moves.'
      : 'You are mostly balanced, with occasional emotional decisions.'
  );
  behavior.push(
    markers.consistency >= 0.72
      ? 'Your decisions were consistent across different situations.'
      : 'Your decisions changed a lot across situations.'
  );
  return behavior;
}

function buildStrengthSignals(scores, markers) {
  const strengths = [];
  if (scores.control >= 0.58) strengths.push('Strong ownership over position sizing and risk structure.');
  if (markers.disciplineRate >= 0.65) strengths.push('You often chose actions that matched good decision habits.');
  if (markers.impulseRate <= 0.2) strengths.push('You rarely made rushed, high-confidence decisions.');
  if (scores.react <= 0.42) strengths.push('You stayed calm in stressful rounds.');
  if (scores.risk >= 0.58 && scores.control >= 0.58) strengths.push('You took risk but still used control.');
  if (!strengths.length) strengths.push('You have a balanced base with room to sharpen your rules.');
  return strengths.slice(0, 4);
}

function buildRiskSignals(scores, markers) {
  const risks = [];
  if (scores.react >= 0.62) risks.push('Emotion may be affecting your decisions too much in stress.');
  if (markers.impulseRate >= 0.35) risks.push('You sometimes decide too fast with high confidence.');
  if (scores.risk >= 0.75) risks.push('Your risk level may create bigger drawdowns.');
  if (scores.control <= 0.4) risks.push('A hands-off style may let risk drift from your plan.');
  if (markers.consistency <= 0.5) risks.push('Your style changed a lot between rounds.');
  if (!risks.length) risks.push('No major warning signs detected in this run.');
  return risks.slice(0, 4);
}

function buildActionPlan(profile, scores, markers) {
  const plan = [];
  plan.push('Set a clear max position size and max loss limit before you invest.');
  if (scores.react >= 0.58 || markers.impulseRate >= 0.3) {
    plan.push('Use a 10-minute pause rule before unplanned trades.');
  }
  if (scores.risk >= 0.7) {
    plan.push('Trim oversized winners regularly to avoid too much concentration.');
  } else if (scores.risk <= 0.35) {
    plan.push('Keep a small "opportunity" bucket so you do not get too defensive.');
  }
  if (scores.control <= 0.45) {
    plan.push('Use a short checklist for entry and exit so your plan stays on track.');
  } else {
    plan.push('Write one sentence after each trade: why you did it and what would prove it wrong.');
  }
  if (String(profile.label || '').includes('Momentum')) {
    plan.push('Set stop rules before adding to hot positions.');
  }
  return plan.slice(0, 5);
}

function renderResult() {
  const weights = picks.map((p) => 0.8 + p.stress * 0.5);
  const totalWeight = weights.reduce((s, v) => s + v, 0) || 1;

  const weighted = picks.reduce(
    (acc, pick, idx) => {
      const w = weights[idx];
      acc.risk += pick.risk * w;
      acc.control += pick.control * w;
      acc.react += pick.react * w;
      return acc;
    },
    { risk: 0, control: 0, react: 0 }
  );

  const scores = {
    risk: weighted.risk / totalWeight,
    control: weighted.control / totalWeight,
    react: weighted.react / totalWeight
  };

  const avgSpeed = picks.reduce((s, p) => s + p.speed, 0) / Math.max(1, picks.length);
  const avgConfidence = picks.reduce((s, p) => s + p.confidence, 0) / Math.max(1, picks.length);
  const disciplineRate = picks.filter((p) => p.quality >= 0.7).length / Math.max(1, picks.length);
  const impulseRate = picks.filter((p) => p.speed >= 0.72 && p.confidence >= 4).length / Math.max(1, picks.length);
  const consistency = clamp01(1 - ((stdDev(picks.map((p) => p.risk)) + stdDev(picks.map((p) => p.control)) + stdDev(picks.map((p) => p.react))) / 3) * 2.2);

  const markers = { avgSpeed, avgConfidence, disciplineRate, impulseRate, consistency };
  const profile = getProfile(scores, markers);
  arenaLastScores = scores;
  const behaviorItems = buildBehaviorNarrative(scores, markers);
  const strengthItems = buildStrengthSignals(scores, markers);
  const riskItems = buildRiskSignals(scores, markers);
  const planItems = buildActionPlan(profile, scores, markers);

  if (arenaTypeLabel) arenaTypeLabel.textContent = profile.label;
  if (arenaTypeSummary) arenaTypeSummary.textContent = profile.summary;
  if (arenaAxisSummary) {
    arenaAxisSummary.textContent = `Risk ${Math.round(scores.risk * 100)}, Control ${Math.round(
      scores.control * 100
    )}, Reactivity ${Math.round(scores.react * 100)}. Drag the 3D widget to inspect your position.`;
  }

  if (arenaAxisBars) {
    arenaAxisBars.innerHTML = [
      axisRow('Risk Appetite', scores.risk, 'Conservative', 'Aggressive'),
      axisRow('Control Preference', scores.control, 'Delegated', 'Hands-on'),
      axisRow('Emotional Reactivity', scores.react, 'Composed', 'Reactive')
    ].join('');
  }
  setArenaAxis3dScores(scores);

  if (arenaInsights) {
    arenaInsights.innerHTML = `
      <div class="decision-arena-insight-grid">
        <div class="decision-arena-insight-card"><small>Consistency</small><strong>${Math.round(consistency * 100)}%</strong></div>
        <div class="decision-arena-insight-card"><small>Discipline Rate</small><strong>${Math.round(disciplineRate * 100)}%</strong></div>
        <div class="decision-arena-insight-card"><small>Impulse Rate</small><strong>${Math.round(impulseRate * 100)}%</strong></div>
        <div class="decision-arena-insight-card"><small>Avg Confidence</small><strong>${avgConfidence.toFixed(1)}/5</strong></div>
        <div class="decision-arena-insight-card"><small>Decision Tempo</small><strong>${speedToTempo(avgSpeed)}</strong></div>
      </div>
    `;
  }

  if (arenaBehaviorList) arenaBehaviorList.innerHTML = listHtml(behaviorItems);
  if (arenaStrengthList) arenaStrengthList.innerHTML = listHtml(strengthItems);
  if (arenaRiskList) arenaRiskList.innerHTML = listHtml(riskItems);
  if (arenaPlanList) arenaPlanList.innerHTML = listHtml(planItems);

  if (arenaRoundLog) {
    arenaRoundLog.innerHTML = `
      <h4>Round Replay</h4>
      <div class="decision-arena-log-list">
        ${picks
          .map(
            (pick, idx) => `
              <div class="decision-arena-log-item">
                <strong>R${idx + 1}: ${escapeHtml(pick.scenario)}</strong>
                <span>${escapeHtml(pick.choice)}</span>
                <small>Tempo ${escapeHtml(speedToTempo(pick.speed))} | Confidence ${pick.confidence}/5</small>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  showView('result');
}

async function goNextRound() {
  roundIndex += 1;
  if (roundIndex >= currentScenarios.length) {
    renderResult();
    return;
  }
  await playRoundTransition(renderRound);
}

async function resetArena(withStartTransition = false) {
  stopTimer();
  currentScenarios = buildScenarioSet();
  arenaLastScores = null;
  arenaAxis3dState.rotX = -22;
  arenaAxis3dState.rotY = 28;
  hideArenaAxis3dHover();
  renderArenaAxis3dGraph();
  roundIndex = 0;
  roundSelected = null;
  awaitingContinue = false;
  disciplineStreak = 0;
  picks.length = 0;

  if (arenaConfidence) arenaConfidence.value = '3';
  updateConfidenceLabel();
  updateLiveSignals(0.4);
  if (withStartTransition && arenaIntro && arenaGame) {
    showView('intro');
    arenaIntro.classList.add('decision-arena-intro-exit');
    await wait(START_TRANSITION_MS);
    showView('game');
    renderRound();
    arenaGame.classList.add('decision-arena-game-enter');
    setTimeout(() => {
      arenaGame.classList.remove('decision-arena-game-enter');
      arenaIntro.classList.remove('decision-arena-intro-exit');
    }, 360);
    return;
  }
  showView('game');
  renderRound();
}

arenaConfidence?.addEventListener('input', updateConfidenceLabel);
arenaStartBtn?.addEventListener('click', () => resetArena(true));
arenaRestartBtn?.addEventListener('click', () => resetArena(false));
arenaNextBtn?.addEventListener('click', () => commitRound(false));

window.addEventListener('keydown', (event) => {
  if (arenaGame?.classList.contains('hidden')) return;
  const key = String(event.key || '').toLowerCase();
  if (key === '1' || key === '2' || key === '3') {
    const idx = Number(key) - 1;
    if (idx >= 0) selectChoice(idx);
  }
  if (key === 'enter' && !arenaNextBtn?.disabled) {
    event.preventDefault();
    commitRound(false);
  }
});

showView('intro');
updateConfidenceLabel();
updateLiveSignals(0.4);
initArenaAxis3dInteractivity();
renderArenaAxis3dGraph();
window.addEventListener('resize', () => {
  renderArenaAxis3dGraph();
});
