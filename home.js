const homeAxisStage = document.getElementById('homeAxis3dStage');
const homeAxisCanvas = document.getElementById('homeAxis3dCanvas');
const homeAxisHoverTip = document.getElementById('homeAxis3dHoverTip');
const homeTypeLabel = document.getElementById('homeInvestotypeName');
const homeTypeLabelAlt = document.getElementById('homeInvestotypeNameAlt');
const homeAxisValues = document.getElementById('homeInvestotypeAxis');

if (homeAxisStage && homeAxisCanvas) {
  const axisTypes = [
    { label: 'Portfolio Manager', glow: [56, 189, 248, 0.24], scores: { aggressive: 82, internal: 74, emotional: 72 } },
    { label: 'The Quant', glow: [99, 102, 241, 0.22], scores: { aggressive: 74, internal: 76, emotional: 30 } },
    { label: 'Technical Analyst', glow: [14, 165, 233, 0.22], scores: { aggressive: 78, internal: 36, emotional: 32 } },
    { label: 'Day Trader', glow: [248, 113, 113, 0.22], scores: { aggressive: 86, internal: 34, emotional: 78 } },
    { label: 'Research Analyst', glow: [34, 197, 94, 0.2], scores: { aggressive: 26, internal: 74, emotional: 26 } },
    { label: 'Risk Manager', glow: [59, 130, 246, 0.2], scores: { aggressive: 28, internal: 72, emotional: 74 } },
    { label: 'Index Strategist', glow: [148, 163, 184, 0.22], scores: { aggressive: 24, internal: 30, emotional: 24 } },
    { label: 'Wealth Advisor', glow: [251, 146, 60, 0.22], scores: { aggressive: 22, internal: 28, emotional: 72 } }
  ];

  const state = {
    rotX: 22,
    rotY: -28,
    dragging: false,
    startX: 0,
    startY: 0,
    baseRotX: 22,
    baseRotY: -28,
    projectedCorners: [],
    scores: { ...axisTypes[0].scores },
    fromScores: { ...axisTypes[0].scores },
    toScores: { ...axisTypes[0].scores },
    idx: 0,
    lastSwap: 0,
    transitionStart: 0,
    transitionMs: 1200,
    glow: [...axisTypes[0].glow],
    fromGlow: [...axisTypes[0].glow],
    toGlow: [...axisTypes[0].glow]
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v || 0)));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  const rgbaString = (g) => `rgba(${Math.round(g[0])}, ${Math.round(g[1])}, ${Math.round(g[2])}, ${g[3].toFixed(3)})`;

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
    const rect = homeAxisStage.getBoundingClientRect();
    const cssW = Math.max(220, Math.floor(rect.width - 10));
    const cssH = Math.max(180, Math.floor(rect.height - 10));
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const targetW = Math.floor(cssW * dpr);
    const targetH = Math.floor(cssH * dpr);
    if (homeAxisCanvas.width !== targetW || homeAxisCanvas.height !== targetH) {
      homeAxisCanvas.width = targetW;
      homeAxisCanvas.height = targetH;
    }
    return { w: targetW, h: targetH };
  };

  const setHover = (content, x, y) => {
    if (!homeAxisHoverTip) return;
    homeAxisHoverTip.innerHTML = content;
    homeAxisHoverTip.classList.remove('hidden');
    homeAxisHoverTip.style.left = `${x}px`;
    homeAxisHoverTip.style.top = `${y}px`;
  };

  const hideHover = () => {
    homeAxisHoverTip?.classList.add('hidden');
  };

  const cornerMetaFromPoint = (p) => {
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
  };

  const updateHover = (clientX, clientY) => {
    if (!homeAxisCanvas || !homeAxisStage || !state.projectedCorners.length) return;
    const rect = homeAxisCanvas.getBoundingClientRect();
    const dpr = homeAxisCanvas.width / Math.max(1, rect.width);
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
    const stageRect = homeAxisStage.getBoundingClientRect();
    setHover(`<strong>${best.explanation}</strong>`, clientX - stageRect.left, clientY - stageRect.top);
  };

  let nameSwapToggle = false;
  const updateLabels = (animate = false) => {
    const current = axisTypes[state.idx];
    if (homeTypeLabel && homeTypeLabelAlt) {
      if (animate) {
        const incoming = nameSwapToggle ? homeTypeLabelAlt : homeTypeLabel;
        const outgoing = nameSwapToggle ? homeTypeLabel : homeTypeLabelAlt;
        nameSwapToggle = !nameSwapToggle;
        incoming.textContent = current.label;
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
      } else {
        homeTypeLabel.textContent = current.label;
        homeTypeLabelAlt.textContent = current.label;
        homeTypeLabel.classList.add('is-active');
        homeTypeLabelAlt.classList.remove('is-active');
      }
    } else if (homeTypeLabel) {
      homeTypeLabel.textContent = current.label;
    }
    if (homeAxisValues) {
      homeAxisValues.textContent = `Risk ${Math.round(state.scores.aggressive)} | Control ${Math.round(
        state.scores.internal
      )} | Reactivity ${Math.round(state.scores.emotional)}`;
    }
    if (homeAxisStage) {
      homeAxisStage.style.setProperty('--home-axis-glow', rgbaString(state.glow));
    }
  };

  const render = () => {
    const { w, h } = ensureCanvasSize();
    if (w <= 0 || h <= 0) return;
    const ctx = homeAxisCanvas.getContext('2d');
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
    const drawPillLabel = (text, p, fg, bg = 'rgba(255,255,255,0.92)', border = 'rgba(148,163,184,0.45)') => {
      const padX = 6;
      const padY = 4;
      ctx.save();
      ctx.font = `${Math.max(8, Math.floor(w * 0.012))}px ui-sans-serif, system-ui`;
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

    // No background fill to avoid glow/box effect on the home widget.

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
      const za = rotate3D(cubePts[a], state.rotX, state.rotY).z;
      const zb = rotate3D(cubePts[b], state.rotX, state.rotY).z;
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
    endpointLabels.forEach((item) =>
      drawPillLabel(item.t, transform(item.p), item.c, 'rgba(255,255,255,0.9)', 'rgba(203,213,225,0.8)')
    );


    state.projectedCorners = cubePts.map((c) => {
      const p = transform(c);
      const meta = cornerMetaFromPoint(c);
      return { x: p.x, y: p.y, code: meta.code, explanation: meta.explanation, z: p.z };
    });

    state.projectedCorners.sort((a, b) => a.z - b.z).forEach((c) => {
      const radius = Math.max(2.4, Math.min(5.5, w * 0.0065 + c.z * 0.9));
      ctx.fillStyle = `rgba(100,116,139,${0.4 + (c.z + 1) * 0.15})`;
      ctx.strokeStyle = 'rgba(255,255,255,0.78)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    const scores = state.scores;
    const pr = { x: scores.aggressive / 50 - 1, y: 0, z: 0 };
    const pc = { x: 0, y: scores.internal / 50 - 1, z: 0 };
    const pe = { x: 0, y: 0, z: scores.emotional / 50 - 1 };
    const rr = transform(pr);
    const rc = transform(pc);
    const re = transform(pe);

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
    ctx.beginPath();
    ctx.moveTo(rr.x, rr.y);
    ctx.lineTo(rc.x, rc.y);
    ctx.lineTo(re.x, re.y);
    ctx.closePath();
    ctx.stroke();

    [rr, rc, re].forEach((p) => {
      ctx.strokeStyle = 'rgba(148,163,184,0.36)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    [
      { p: rr, c: '#2563eb' },
      { p: rc, c: '#0f766e' },
      { p: re, c: '#dc2626' }
    ].forEach((n) => {
      ctx.save();
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.p.x, n.p.y, Math.max(4.5, Math.min(7.2, w * 0.0092)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const tick = (t) => {
    const now = Number(t || 0);
    if (!state.dragging) {
      state.rotY += 0.16;
      state.rotX = 20 + Math.sin(now / 2100) * 6;
    }
    if (!state.lastSwap) state.lastSwap = now;
    if (now - state.lastSwap > 3800) {
      state.idx = (state.idx + 1) % axisTypes.length;
      state.fromScores = { ...state.scores };
      state.toScores = { ...axisTypes[state.idx].scores };
      state.fromGlow = [...state.glow];
      state.toGlow = [...axisTypes[state.idx].glow];
      state.transitionStart = now;
      updateLabels(true);
      state.lastSwap = now;
    }
    if (state.transitionStart) {
      const tNorm = Math.min(1, (now - state.transitionStart) / state.transitionMs);
      const eased = easeInOut(tNorm);
      state.scores = {
        aggressive: lerp(state.fromScores.aggressive, state.toScores.aggressive, eased),
        internal: lerp(state.fromScores.internal, state.toScores.internal, eased),
        emotional: lerp(state.fromScores.emotional, state.toScores.emotional, eased)
      };
      state.glow = [
        lerp(state.fromGlow[0], state.toGlow[0], eased),
        lerp(state.fromGlow[1], state.toGlow[1], eased),
        lerp(state.fromGlow[2], state.toGlow[2], eased),
        lerp(state.fromGlow[3], state.toGlow[3], eased)
      ];
      if (tNorm >= 1) {
        state.transitionStart = 0;
        state.scores = { ...state.toScores };
        state.glow = [...state.toGlow];
      }
    }
    updateLabels(false);
    render();
    window.requestAnimationFrame(tick);
  };

  // Intentionally non-interactive on the overview page.
  hideHover();
  updateLabels(false);
  render();
  window.requestAnimationFrame(tick);
  window.addEventListener('resize', render, { passive: true });
}

const previewCards = Array.from(document.querySelectorAll('.valuation-preview-card'));
if (previewCards.length) {
  const portfolios = [
    [
      { symbol: 'SPY', price: '$678.27', change: '+0.89%', tone: 'up' },
      { symbol: 'NVDA', price: '$182.65', change: '+2.62%', tone: 'up' },
      { symbol: 'VTI', price: '$334.28', change: '+0.89%', tone: 'up' }
    ],
    [
      { symbol: 'TLT', price: '$96', change: '-0.4%', tone: 'down' },
      { symbol: 'QQQ', price: '$402', change: '+1.9%', tone: 'up' },
      { symbol: 'GLD', price: '$184', change: '+0.2%', tone: 'up' }
    ],
    [
      { symbol: 'AAPL', price: '$188', change: '+0.5%', tone: 'up' },
      { symbol: 'XLF', price: '$41', change: '-0.3%', tone: 'down' },
      { symbol: 'BND', price: '$72', change: '+0.1%', tone: 'up' }
    ],
    [
      { symbol: 'MSFT', price: '$421', change: '+1.1%', tone: 'up' },
      { symbol: 'AMZN', price: '$176', change: '+0.7%', tone: 'up' },
      { symbol: 'VNQ', price: '$85', change: '-0.2%', tone: 'down' }
    ]
  ];
  let portfolioIndex = 0;

  const applyPortfolio = () => {
    previewCards.forEach((card, idx) => {
      const data = portfolios[portfolioIndex][idx % portfolios[portfolioIndex].length];
      const sym = card.querySelector('.vp-symbol');
      const price = card.querySelector('.vp-price');
      const change = card.querySelector('.vp-change');
      if (!sym || !price || !change) return;
      sym.textContent = data.symbol;
      price.textContent = data.price;
      change.textContent = data.change;
      change.style.color = data.tone === 'down' ? '#dc2626' : '#0f766e';
    });
  };

  const swapPortfolio = () => {
    previewCards.forEach((card) => card.classList.add('is-swapping'));
    window.setTimeout(() => {
      portfolioIndex = (portfolioIndex + 1) % portfolios.length;
      applyPortfolio();
      previewCards.forEach((card) => card.classList.remove('is-swapping'));
    }, 260);
  };

  applyPortfolio();
  window.setInterval(swapPortfolio, 3200);
}

const newsCards = Array.from(document.querySelectorAll('.news-preview-card'));
if (newsCards.length) {
  let newsIndex = 0;
  let newsItems = newsCards.map((card) => ({
    tag: card.querySelector('.news-tag')?.textContent || 'Market',
    title: card.querySelector('strong')?.textContent || '',
    meta: card.querySelector('em')?.textContent || ''
  }));

  const applyNews = () => {
    if (!newsItems.length) return;
    newsCards.forEach((card, idx) => {
      const item = newsItems[(newsIndex + idx) % newsItems.length];
      const tagEl = card.querySelector('.news-tag');
      const titleEl = card.querySelector('strong');
      const metaEl = card.querySelector('em');
      if (tagEl) tagEl.textContent = item.tag || 'Market';
      if (titleEl) titleEl.textContent = item.title || '';
      if (metaEl) metaEl.textContent = item.meta || '';
    });
  };

  const swapNews = () => {
    newsCards.forEach((card) => card.classList.add('is-swapping'));
    window.setTimeout(() => {
      newsIndex = (newsIndex + 1) % Math.max(1, newsItems.length);
      applyNews();
      newsCards.forEach((card) => card.classList.remove('is-swapping'));
    }, 240);
  };

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news/market', { cache: 'no-store' });
      const data = await res.json();
      const rows = Array.isArray(data?.headlines) ? data.headlines : [];
      const mapped = rows
        .filter((h) => h && h.title)
        .slice(0, 12)
        .map((h) => ({
          tag: (h.symbol || 'Market').toUpperCase(),
          title: String(h.title || '').trim(),
          meta: String(h.publisher || h.date || '').trim()
        }))
        .filter((h) => h.title);
      if (mapped.length) {
        newsItems = mapped;
        newsIndex = 0;
        applyNews();
      }
    } catch (_error) {
      // keep existing headlines
    }
  };

  applyNews();
  fetchNews();
  window.setInterval(swapNews, 3600);
  window.setInterval(fetchNews, 180000);
}

const revealTargets = Array.from(document.querySelectorAll('.scroll-reveal'));
if (revealTargets.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealTargets.forEach((el, idx) => {
    el.style.transitionDelay = `${Math.min(idx * 90, 240)}ms`;
    revealObserver.observe(el);
  });
} else {
  revealTargets.forEach((el) => el.classList.add('is-inview'));
}

if (revealTargets.length && 'IntersectionObserver' in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealTargets.forEach((el) => el.classList.remove('is-active'));
          entry.target.classList.add('is-active');
        }
      });
    },
    { threshold: 0.6 }
  );
  revealTargets.forEach((el) => activeObserver.observe(el));
}
