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
let arenaAxis3dPoint = null;
let arenaAxisYaw = -0.78;
let arenaAxisPitch = 0.5;
let arenaAxisDragging = false;
let arenaAxisDragX = 0;
let arenaAxisDragY = 0;
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

function project3d(point, yaw, pitch, scale, cx, cy) {
  const cosy = Math.cos(yaw);
  const siny = Math.sin(yaw);
  const cosp = Math.cos(pitch);
  const sinp = Math.sin(pitch);

  const x1 = point.x * cosy - point.z * siny;
  const z1 = point.x * siny + point.z * cosy;
  const y1 = point.y * cosp - z1 * sinp;
  const z2 = point.y * sinp + z1 * cosp;
  const perspective = 1 / (1 + z2 * 0.55);
  return {
    x: cx + x1 * scale * perspective,
    y: cy - y1 * scale * perspective
  };
}

function drawArenaAxis3d(scores) {
  if (!arenaAxis3dCanvas) return;
  const ctx = arenaAxis3dCanvas.getContext('2d');
  if (!ctx) return;
  const w = arenaAxis3dCanvas.width;
  const h = arenaAxis3dCanvas.height;
  const cx = w / 2;
  const cy = h / 2 + 8;
  const scale = Math.min(w, h) * 0.28;
  const yaw = arenaAxisYaw;
  const pitch = arenaAxisPitch;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, w, h);

  const cube = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];
  const p2 = cube.map((p) => project3d(p, yaw, pitch, scale, cx, cy));
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.4;
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(p2[a].x, p2[a].y);
    ctx.lineTo(p2[b].x, p2[b].y);
    ctx.stroke();
  });

  const risk = clamp01(scores.risk);
  const control = clamp01(scores.control);
  const react = clamp01(scores.react);
  const point = {
    x: control * 2 - 1,
    y: risk * 2 - 1,
    z: react * 2 - 1
  };
  const pp = project3d(point, yaw, pitch, scale, cx, cy);
  arenaAxis3dPoint = { x: pp.x, y: pp.y, risk, control, react };

  const origin = project3d({ x: 0, y: 0, z: 0 }, yaw, pitch, scale, cx, cy);
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(pp.x, pp.y);
  ctx.stroke();

  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI';
  const riskLabel = project3d({ x: -1.05, y: 1.05, z: -1.05 }, yaw, pitch, scale, cx, cy);
  const controlLabel = project3d({ x: 1.05, y: -1.05, z: -1.05 }, yaw, pitch, scale, cx, cy);
  const reactLabel = project3d({ x: 1.05, y: 1.05, z: 1.05 }, yaw, pitch, scale, cx, cy);
  ctx.fillText('Risk', riskLabel.x, riskLabel.y);
  ctx.fillText('Control', controlLabel.x, controlLabel.y);
  ctx.fillText('Reactivity', reactLabel.x, reactLabel.y);

  if (arenaAxis3dLabels) {
    arenaAxis3dLabels.innerHTML = [
      `Risk ${Math.round(risk * 100)}`,
      `Control ${Math.round(control * 100)}`,
      `Reactivity ${Math.round(react * 100)}`
    ]
      .map((label) => `<div class="axis-score-item">${escapeHtml(label)}</div>`)
      .join('');
  }
}

function bindArenaAxis3dHover() {
  if (!arenaAxis3dStage || !arenaAxis3dHover || !arenaAxis3dCanvas) return;
  arenaAxis3dStage.addEventListener('mousemove', (event) => {
    if (!arenaAxis3dPoint) return;
    const rect = arenaAxis3dCanvas.getBoundingClientRect();
    const sx = ((event.clientX - rect.left) * arenaAxis3dCanvas.width) / Math.max(1, rect.width);
    const sy = ((event.clientY - rect.top) * arenaAxis3dCanvas.height) / Math.max(1, rect.height);
    const dist = Math.hypot(sx - arenaAxis3dPoint.x, sy - arenaAxis3dPoint.y);
    if (dist > 24) {
      arenaAxis3dHover.classList.add('hidden');
      return;
    }
    arenaAxis3dHover.innerHTML = `Risk ${Math.round(arenaAxis3dPoint.risk * 100)} | Control ${Math.round(
      arenaAxis3dPoint.control * 100
    )} | React ${Math.round(arenaAxis3dPoint.react * 100)}`;
    arenaAxis3dHover.classList.remove('hidden');
    arenaAxis3dHover.style.left = `${event.clientX - rect.left + 14}px`;
    arenaAxis3dHover.style.top = `${event.clientY - rect.top + 10}px`;
  });
  arenaAxis3dStage.addEventListener('mouseleave', () => arenaAxis3dHover.classList.add('hidden'));

  arenaAxis3dStage.addEventListener('mousedown', (event) => {
    arenaAxisDragging = true;
    arenaAxis3dStage.classList.add('dragging');
    arenaAxisDragX = event.clientX;
    arenaAxisDragY = event.clientY;
  });
  arenaAxis3dStage.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      arenaAxisDragging = true;
      arenaAxis3dStage.classList.add('dragging');
      arenaAxisDragX = touch.clientX;
      arenaAxisDragY = touch.clientY;
    },
    { passive: true }
  );
  window.addEventListener('mouseup', () => {
    arenaAxisDragging = false;
    arenaAxis3dStage?.classList.remove('dragging');
  });
  window.addEventListener('touchend', () => {
    arenaAxisDragging = false;
    arenaAxis3dStage?.classList.remove('dragging');
  });
  window.addEventListener('mousemove', (event) => {
    if (!arenaAxisDragging) return;
    const dx = event.clientX - arenaAxisDragX;
    const dy = event.clientY - arenaAxisDragY;
    arenaAxisDragX = event.clientX;
    arenaAxisDragY = event.clientY;
    arenaAxisYaw += dx * 0.008;
    arenaAxisPitch = Math.max(-1.05, Math.min(1.05, arenaAxisPitch + dy * 0.006));
    if (arenaLastScores) drawArenaAxis3d(arenaLastScores);
  });
  window.addEventListener(
    'touchmove',
    (event) => {
      if (!arenaAxisDragging) return;
      const touch = event.touches?.[0];
      if (!touch) return;
      const dx = touch.clientX - arenaAxisDragX;
      const dy = touch.clientY - arenaAxisDragY;
      arenaAxisDragX = touch.clientX;
      arenaAxisDragY = touch.clientY;
      arenaAxisYaw += dx * 0.008;
      arenaAxisPitch = Math.max(-1.05, Math.min(1.05, arenaAxisPitch + dy * 0.006));
      if (arenaLastScores) drawArenaAxis3d(arenaLastScores);
    },
    { passive: true }
  );
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
  drawArenaAxis3d(scores);

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
  arenaAxisYaw = -0.78;
  arenaAxisPitch = 0.5;
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
bindArenaAxis3dHover();
