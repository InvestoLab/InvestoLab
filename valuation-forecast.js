const forecastForm = document.getElementById('forecastForm');
const forecastQueryInput = document.getElementById('forecastQuery');
const forecastSearchDropdown = document.getElementById('forecastSearchDropdown');
const forecastSelectionState = document.getElementById('forecastSelectionState');
const forecastStep2Error = document.getElementById('forecastStep2Error');
const forecastStatus = document.getElementById('forecastStatus');
const forecastResult = document.getElementById('forecastResult');
const forecastYearsInput = document.getElementById('forecastYears');
const forecastIntervalSelect = document.getElementById('forecastInterval');
const forecastHorizonHelp = document.getElementById('forecastHorizonHelp');
const forecastPathsInput = document.getElementById('forecastPaths');
const forecastDriftInput = document.getElementById('forecastDrift');
const forecastVolInput = document.getElementById('forecastVolatility');
const forecastNewsInput = document.getElementById('forecastNewsIndex');
const forecastMacroInput = document.getElementById('forecastMacroIndex');
const forecastMeanRevInput = document.getElementById('forecastMeanReversion');
const forecastYearsRange = document.getElementById('forecastYearsRange');
const forecastPathsRange = document.getElementById('forecastPathsRange');
const forecastDriftRange = document.getElementById('forecastDriftRange');
const forecastVolRange = document.getElementById('forecastVolatilityRange');
const forecastNewsRange = document.getElementById('forecastNewsIndexRange');
const forecastMacroRange = document.getElementById('forecastMacroIndexRange');
const forecastMeanRevRange = document.getElementById('forecastMeanReversionRange');
const forecastQuickSummary = document.getElementById('forecastQuickSummary');
const aiAutoBtn = document.getElementById('aiAutoBtn');
const aiConservativeBtn = document.getElementById('aiConservativeBtn');
const aiBalancedBtn = document.getElementById('aiBalancedBtn');
const aiAggressiveBtn = document.getElementById('aiAggressiveBtn');

let forecastSearchResults = [];
let forecastSearchIndex = -1;
let forecastSearchTimer = null;
let forecastSelectedSymbol = '';
let currentBaseline = null;

function setStep2Error(message) {
  if (!forecastStep2Error) return;
  const msg = String(message || '').trim();
  if (!msg) {
    forecastStep2Error.textContent = '';
    forecastStep2Error.classList.add('hidden');
    return;
  }
  forecastStep2Error.textContent = msg;
  forecastStep2Error.classList.remove('hidden');
}

function fmtMoney(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(v, digits = 2) {
  if (!Number.isFinite(Number(v))) return 'N/A';
  return `${(Number(v) * 100).toFixed(digits)}%`;
}

function fmtNum(v, digits = 2) {
  if (!Number.isFinite(Number(v))) return 'N/A';
  return Number(v).toFixed(digits);
}

function esc(raw) {
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

function getIntervalMeta(intervalRaw) {
  const interval = String(intervalRaw || 'monthly').toLowerCase();
  if (interval === 'daily') {
    return { key: 'daily', periodsPerYear: 252, unitLabel: 'Day', titleLabel: 'Daily' };
  }
  if (interval === 'weekly') {
    return { key: 'weekly', periodsPerYear: 52, unitLabel: 'Week', titleLabel: 'Weekly' };
  }
  return { key: 'monthly', periodsPerYear: 12, unitLabel: 'Month', titleLabel: 'Monthly' };
}

function getHorizonBounds(intervalMeta) {
  const perYear = Number(intervalMeta?.periodsPerYear || 12);
  const minUnits = intervalMeta?.key === 'monthly' ? perYear : 1;
  return {
    min: minUnits,
    max: perYear * 10,
    step: 1
  };
}

function getCurrentHorizonYears() {
  const prevInterval = String(forecastYearsInput?.dataset.intervalKey || 'monthly');
  const prevMeta = getIntervalMeta(prevInterval);
  const bounds = getHorizonBounds(prevMeta);
  const units = Number(forecastYearsInput?.value || 0);
  return clamp(units / prevMeta.periodsPerYear, bounds.min / prevMeta.periodsPerYear, 10);
}

function applyHorizonConfig(intervalRaw, preserveYears = true) {
  if (!forecastYearsInput || !forecastYearsRange) return;
  const intervalMeta = getIntervalMeta(intervalRaw);
  const bounds = getHorizonBounds(intervalMeta);
  const minYears = bounds.min / intervalMeta.periodsPerYear;
  const years = preserveYears ? getCurrentHorizonYears() : 3;
  const units = Math.round(clamp(years, minYears, 10) * intervalMeta.periodsPerYear);

  forecastYearsInput.min = String(bounds.min);
  forecastYearsInput.max = String(bounds.max);
  forecastYearsInput.step = String(bounds.step);
  forecastYearsRange.min = String(bounds.min);
  forecastYearsRange.max = String(bounds.max);
  forecastYearsRange.step = String(bounds.step);
  forecastYearsInput.dataset.intervalKey = intervalMeta.key;
  setControlValue(forecastYearsInput, forecastYearsRange, units);

  if (forecastHorizonHelp) {
    forecastHorizonHelp.textContent = `${intervalMeta.unitLabel}s to project (${bounds.min} to ${bounds.max} ${intervalMeta.unitLabel.toLowerCase()}s).`;
  }
}

function roundByStep(value, step) {
  const s = Number(step || 1);
  if (!Number.isFinite(s) || s <= 0) return value;
  return Math.round(Number(value) / s) * s;
}

function setControlValue(numberInput, rangeInput, value) {
  if (!numberInput) return;
  const min = Number(numberInput.min || (rangeInput ? rangeInput.min : -Infinity));
  const max = Number(numberInput.max || (rangeInput ? rangeInput.max : Infinity));
  const step = Number(numberInput.step || (rangeInput ? rangeInput.step : 1)) || 1;
  const next = clamp(roundByStep(Number(value), step), min, max);
  const digits = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
  const out = Number(next).toFixed(digits);
  numberInput.value = out;
  if (rangeInput) rangeInput.value = out;
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * clamp(p, 0, 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}

function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function annualStatsFromHistory(rows) {
  const clean = Array.isArray(rows)
    ? rows.map((r) => Number(r?.close || 0)).filter((n) => Number.isFinite(n) && n > 0)
    : [];
  // Use a recent window so regimes can flip bearish/bullish faster.
  const recent = clean.slice(-Math.min(clean.length, 252));
  if (recent.length < 3) return { drift: 0.07, vol: 0.22 };
  const logs = [];
  for (let i = 1; i < recent.length; i += 1) {
    logs.push(Math.log(recent[i] / recent[i - 1]));
  }
  const mean = logs.reduce((s, x) => s + x, 0) / Math.max(1, logs.length);
  const variance = logs.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, logs.length - 1);
  return {
    drift: mean * 252,
    vol: Math.sqrt(Math.max(variance, 0)) * Math.sqrt(252)
  };
}

function deriveNewsBias(headlines, fallbackSentiment) {
  const list = Array.isArray(headlines) ? headlines : [];
  const pos = ['beat', 'growth', 'upgrade', 'strong', 'surge', 'rally', 'record', 'profit', 'bull'];
  const neg = ['miss', 'downgrade', 'weak', 'drop', 'fall', 'risk', 'lawsuit', 'loss', 'bear'];
  if (!list.length) {
    return clamp((Number(fallbackSentiment || 0.5) - 0.5) * 0.8, -0.4, 0.4);
  }
  let score = 0;
  list.slice(0, 12).forEach((h) => {
    const t = String(h?.title || '').toLowerCase();
    pos.forEach((w) => {
      if (t.includes(w)) score += 1;
    });
    neg.forEach((w) => {
      if (t.includes(w)) score -= 1;
    });
  });
  return clamp(score / Math.max(4, list.length * 2), -0.4, 0.4);
}

function renderSearchDropdown() {
  if (!forecastSearchDropdown) return;
  if (!forecastSearchResults.length) {
    forecastSearchDropdown.classList.add('hidden');
    forecastSearchDropdown.innerHTML = '';
    forecastSearchIndex = -1;
    return;
  }

  forecastSearchDropdown.classList.remove('hidden');
  forecastSearchDropdown.innerHTML = forecastSearchResults
    .map((opt, i) => {
      const name = opt.longname || opt.shortname || opt.symbol;
      const sub = [opt.symbol, opt.exchange, opt.quoteType].filter(Boolean).join(' | ');
      return `<button type="button" class="search-option ${i === forecastSearchIndex ? 'active' : ''}" data-search-index="${i}">
        <div class="search-option-title">${esc(name)}</div>
        <div class="search-option-sub">${esc(sub)}</div>
      </button>`;
    })
    .join('');
}

function hideSearchDropdown() {
  forecastSearchDropdown?.classList.add('hidden');
  forecastSearchResults = [];
  forecastSearchIndex = -1;
}

function setSelectionState(symbol, name) {
  if (!forecastSelectionState) return;
  const sym = String(symbol || '').trim().toUpperCase();
  if (!sym) {
    forecastSelectionState.textContent = '';
    forecastSelectionState.classList.add('hidden');
    return;
  }
  const label = String(name || '').trim();
  forecastSelectionState.textContent = label ? `Selected: ${sym} (${label})` : `Selected: ${sym}`;
  forecastSelectionState.classList.remove('hidden');
}

function applySearchSelection(option) {
  if (!option || !forecastQueryInput) return;
  forecastQueryInput.value = option.symbol || '';
  forecastSelectedSymbol = String(option.symbol || '').trim().toUpperCase();
  const display = option.longname || option.shortname || '';
  setSelectionState(forecastSelectedSymbol, display);
  hideSearchDropdown();
}

async function searchSymbolOptions(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return [];
  async function tryResolve(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Search failed');
    return data;
  }
  let data = null;
  try {
    data = await tryResolve('/api/valuation/resolve', { query: raw });
  } catch (_error) {
    data = await tryResolve('/api/assets/resolve', { query: raw, preferBond: false });
  }
  const list = [];
  if (data?.best?.symbol) list.push(data.best);
  for (const m of data?.matches || []) {
    if (!list.some((x) => x.symbol === m.symbol)) list.push(m);
  }
  return list.slice(0, 10);
}

function renderHistoryChart(rows) {
  const points = Array.isArray(rows)
    ? rows.map((r) => ({ date: String(r?.date || ''), close: Number(r?.close || 0) })).filter((r) => r.date && r.close > 0)
    : [];
  if (points.length < 2) return '<p class="asset-help">Not enough historical points.</p>';
  const sliced = points.slice(-180);
  const width = 900;
  const height = 240;
  const padX = 40;
  const padY = 20;
  const min = Math.min(...sliced.map((p) => p.close));
  const max = Math.max(...sliced.map((p) => p.close));
  const span = Math.max(1e-9, max - min);
  const xStep = (width - padX * 2) / Math.max(1, sliced.length - 1);
  const coords = sliced.map((p, i) => {
    const x = padX + i * xStep;
    const y = padY + (height - padY * 2) * (1 - (p.close - min) / span);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `
    <svg class="price-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Historical price chart">
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
      <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
      <polyline points="${coords.join(' ')}" fill="none" stroke="#0ea5e9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
    <div class="price-chart-axis">
      <span>${esc(sliced[0].date)}</span>
      <span>${esc(sliced[sliced.length - 1].date)}</span>
    </div>
  `;
}

function renderFanChart(fan, samplePaths, intervalMeta) {
  if (!fan?.length) return '<p class="asset-help">No simulation output.</p>';
  const width = 900;
  const height = 270;
  const padX = 46;
  const padY = 20;
  const all = fan.flatMap((m) => [m.p10, m.p50, m.p90]).filter((n) => Number.isFinite(n) && n > 0);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = Math.max(1e-9, max - min);
  const xStep = (width - padX * 2) / Math.max(1, fan.length - 1);
  const xy = (v, i) => {
    const x = padX + i * xStep;
    const y = padY + (height - padY * 2) * (1 - (v - min) / span);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };
  const p10 = fan.map((m, i) => xy(m.p10, i)).join(' ');
  const p90 = fan.map((m, i) => xy(m.p90, i)).join(' ');
  const p50 = fan.map((m, i) => xy(m.p50, i)).join(' ');
  const area = `${p90} ${fan
    .map((m, i) => xy(m.p10, fan.length - 1 - i))
    .join(' ')}`;
  const samples = (Array.isArray(samplePaths) ? samplePaths : []).map((path) => {
    const pts = path.map((v, i) => xy(v, i)).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="rgba(14,165,233,0.22)" stroke-width="1.2"></polyline>`;
  });
  return `
    <svg class="price-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Forecast fan chart">
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
      <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
      <polygon points="${area}" fill="rgba(14,165,233,0.18)"></polygon>
      ${samples.join('')}
      <polyline points="${p50}" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
    <div class="price-chart-axis">
      <span>${esc(intervalMeta?.unitLabel || 'Step')} 0</span>
      <span>${esc(intervalMeta?.unitLabel || 'Step')} ${fan.length - 1}</span>
    </div>
  `;
}

function updateQuickSummary() {
  if (!forecastQuickSummary) return;
  const intervalMeta = getIntervalMeta(forecastIntervalSelect?.value);
  const horizonUnits = Number(forecastYearsInput?.value || intervalMeta.periodsPerYear * 3);
  const years = horizonUnits / intervalMeta.periodsPerYear;
  const paths = Number(forecastPathsInput?.value || 500);
  const drift = Number(forecastDriftInput?.value || 8);
  const vol = Number(forecastVolInput?.value || 25);
  const news = Number(forecastNewsInput?.value || 0);
  const macro = Number(forecastMacroInput?.value || 0);
  forecastQuickSummary.textContent = `Preview: ${Math.round(horizonUnits)} ${intervalMeta.unitLabel.toLowerCase()}s (~${years.toFixed(
    1
  )}Y), ${paths} paths, drift ${drift.toFixed(
    1
  )}%, volatility ${vol.toFixed(1)}%, news ${news.toFixed(0)}, macro ${macro.toFixed(0)}, ${intervalMeta.titleLabel.toLowerCase()} steps.`;
}

function bindNumberRange(numberInput, rangeInput, options = {}) {
  if (!numberInput || !rangeInput) return;
  const userSet = options.userSet;
  const sync = (fromRange) => {
    const source = fromRange ? rangeInput : numberInput;
    setControlValue(numberInput, rangeInput, source.value);
    if (userSet) numberInput.dataset.userSet = '1';
    updateQuickSummary();
  };
  rangeInput.addEventListener('input', () => sync(true));
  numberInput.addEventListener('input', () => sync(false));
  sync(false);
}

function applyAiPreset(preset) {
  if (!currentBaseline) {
    setStep2Error('Enter an investment first.');
    return;
  }
  setStep2Error('');
  const drift = currentBaseline.annualDrift;
  const vol = currentBaseline.annualVol;
  const score = Number(currentBaseline.compositeScore || 50);
  const news = currentBaseline.newsBias;

  let years = 3;
  let paths = 600;
  let mu = drift;
  let sigma = vol;
  let newsIdx = news;
  let macroIdx = 0;
  let meanRev = 0.25;

  if (preset === 'conservative') {
    years = 2;
    paths = 700;
    mu = drift * 0.72 + news * 0.06 - 0.01;
    sigma = vol * 0.82;
    newsIdx = news * 0.55;
    macroIdx = -0.2;
    meanRev = 0.45;
  } else if (preset === 'balanced') {
    years = 3;
    paths = 900;
    mu = drift * 0.96 + news * 0.1;
    sigma = vol * 1.02;
    newsIdx = news * 0.8;
    macroIdx = 0;
    meanRev = 0.3;
  } else if (preset === 'aggressive') {
    years = 4;
    paths = 1200;
    mu = drift * 1.2 + news * 0.14 + 0.01;
    sigma = vol * 1.28;
    newsIdx = news * 1.25;
    macroIdx = 0.2;
    meanRev = 0.18;
  } else {
    const tilt = clamp((score - 50) / 50, -1, 1);
    years = tilt >= 0 ? 4 : 3;
    paths = 1000;
    mu = drift + tilt * 0.02 + news * 0.1;
    sigma = vol * (1 + Math.abs(tilt) * 0.28);
    newsIdx = news * (1 + Math.abs(tilt) * 0.2);
    macroIdx = tilt * 0.2;
    meanRev = 0.25 - tilt * 0.08;
  }

  const intervalMeta = getIntervalMeta(forecastIntervalSelect?.value);
  const horizonBounds = getHorizonBounds(intervalMeta);
  setControlValue(
    forecastYearsInput,
    forecastYearsRange,
    Math.round(clamp(years, horizonBounds.min / intervalMeta.periodsPerYear, 10) * intervalMeta.periodsPerYear)
  );
  setControlValue(forecastPathsInput, forecastPathsRange, Math.round(clamp(paths, 100, 3000)));
  setControlValue(forecastDriftInput, forecastDriftRange, clamp(mu, -0.3, 0.4) * 100);
  setControlValue(forecastVolInput, forecastVolRange, clamp(sigma, 0.05, 1.5) * 100);
  setControlValue(forecastNewsInput, forecastNewsRange, Math.round(clamp(newsIdx * 100, -100, 100)));
  setControlValue(forecastMacroInput, forecastMacroRange, Math.round(clamp(macroIdx * 100, -100, 100)));
  setControlValue(forecastMeanRevInput, forecastMeanRevRange, Math.round(clamp(meanRev * 100, 0, 100)));
  updateQuickSummary();
  forecastStatus.textContent = `AI ${preset === 'auto' ? 'Auto' : preset} assumptions applied.`;
}

async function fetchBaseline(symbol) {
  const response = await fetch('/api/valuation/investment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: symbol })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load investment baseline.');
  const inv = data?.investment || {};
  const market = inv?.market || {};
  const signals = inv?.signals || {};
  const valuation = inv?.valuation || {};
  const history = Array.isArray(market.priceHistory) ? market.priceHistory : [];
  const stats = annualStatsFromHistory(history);
  let headlines = Array.isArray(signals.headlines) ? signals.headlines : [];
  if (!headlines.length) {
    try {
      const newsRes = await fetch('./api/news/market');
      const newsData = await newsRes.json();
      const marketHeadlines = Array.isArray(newsData?.headlines) ? newsData.headlines : [];
      const filtered = marketHeadlines.filter(
        (h) => String(h?.symbol || '').toUpperCase() === String(inv.symbol || symbol).toUpperCase()
      );
      headlines = (filtered.length ? filtered : marketHeadlines).slice(0, 8);
    } catch (_error) {
      headlines = [];
    }
  }
  const newsBias = deriveNewsBias(headlines, signals.newsSentiment);
  return {
    symbol: inv.symbol || symbol,
    displayName: inv.displayName || inv.symbol || symbol,
    price: Number(market.price || (history[history.length - 1] || {}).close || 0),
    priceDate: market.priceDate || data?.asOfDate || '',
    history,
    headlines,
    newsSentiment: Number(signals.newsSentiment || 0.5),
    compositeScore: Number(valuation.compositeScore || 50),
    annualDrift: clamp(stats.drift, -0.3, 0.4),
    annualVol: clamp(stats.vol, 0.05, 1.5),
    newsBias
  };
}

async function ensureBaselineLoaded() {
  const query = String(forecastQueryInput?.value || '').trim();
  if (!query) {
    throw new Error('Enter an investment first.');
  }
  const requestedSymbol = (forecastSelectedSymbol || query).toUpperCase();
  if (currentBaseline?.symbol && String(currentBaseline.symbol).toUpperCase() === requestedSymbol) {
    return currentBaseline;
  }
  const symbol = requestedSymbol;
  forecastStatus.textContent = `Loading baseline data for ${symbol}...`;
  currentBaseline = await fetchBaseline(symbol);
  forecastSelectedSymbol = currentBaseline.symbol;
  if (forecastQueryInput) forecastQueryInput.value = currentBaseline.symbol;
  return currentBaseline;
}

async function handlePresetClick(preset) {
  setStep2Error('Loading baseline data...');
  try {
    await ensureBaselineLoaded();
    applyAiPreset(preset);
  } catch (error) {
    setStep2Error(error?.message || 'Unable to apply AI preset.');
  }
}

function runSimulation(base, settings) {
  const intervalMeta = getIntervalMeta(settings.interval);
  const horizonBounds = getHorizonBounds(intervalMeta);
  const horizonUnits = Math.round(clamp(settings.horizonUnits, horizonBounds.min, horizonBounds.max));
  const years = horizonUnits / intervalMeta.periodsPerYear;
  const steps = horizonUnits;
  const requestedPaths = Math.round(clamp(settings.paths, 100, 3000));
  const maxCells = 1200000;
  const paths = Math.max(80, Math.min(requestedPaths, Math.floor(maxCells / Math.max(steps + 1, 1))));
  const dt = 1 / intervalMeta.periodsPerYear;
  const muInput = clamp(settings.driftPct / 100, -0.3, 0.4);
  const volInput = clamp(settings.volPct / 100, 0.05, 1.5);
  const newsIdx = clamp(settings.newsIndex / 100, -1, 1);
  const macroIdx = clamp(settings.macroIndex / 100, -1, 1);
  const meanRev = clamp(settings.meanReversionPct / 100, 0, 1);

  const mu = muInput + newsIdx * 0.06 + macroIdx * 0.04;
  const sigma = clamp(volInput * (1 + Math.max(0, -macroIdx) * 0.2 + Math.abs(newsIdx) * 0.15), 0.05, 1.6);
  const start = Math.max(0.01, Number(base.price || 0.01));
  const longRun = Math.max(0.01, start * Math.exp(mu * years * 0.45));

  const monthly = Array.from({ length: steps + 1 }, () => []);
  const samplePaths = [];
  let upCount = 0;
  let doubleCount = 0;
  let drop20Count = 0;

  for (let p = 0; p < paths; p += 1) {
    const path = [start];
    let price = start;
    for (let i = 1; i <= steps; i += 1) {
      const z = randomNormal();
      const tYears = i / intervalMeta.periodsPerYear;
      const cycle = Math.sin(tYears * Math.PI * 2) * macroIdx * 0.012;
      const sentimentDrift = newsIdx * Math.exp(-tYears / 1.5) * 0.02;
      const rev = meanRev * (Math.log(longRun) - Math.log(Math.max(0.01, price))) * dt;
      const step = (mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z + cycle + sentimentDrift + rev;
      price = Math.max(0.01, price * Math.exp(step));
      path.push(price);
    }
    const final = path[path.length - 1];
    if (final > start) upCount += 1;
    if (final >= start * 2) doubleCount += 1;
    if (final <= start * 0.8) drop20Count += 1;
    for (let i = 0; i <= steps; i += 1) monthly[i].push(path[i]);
    if (samplePaths.length < 14) samplePaths.push(path);
  }

  const fan = monthly.map((arr, i) => {
    const s = arr.slice().sort((a, b) => a - b);
    return {
      step: i,
      p10: percentile(s, 0.1),
      p50: percentile(s, 0.5),
      p90: percentile(s, 0.9),
      mean: s.reduce((sum, v) => sum + v, 0) / Math.max(1, s.length)
    };
  });

  const first = fan[0];
  const last = fan[fan.length - 1];
  const medianCagr = Math.pow(Math.max(0.0001, last.p50 / Math.max(0.0001, first.p50)), 1 / years) - 1;
  const meanCagr = Math.pow(Math.max(0.0001, last.mean / Math.max(0.0001, first.mean)), 1 / years) - 1;

  return {
    fan,
    samplePaths,
    intervalMeta,
    effectiveDrift: mu,
    effectiveVol: sigma,
    actualPaths: paths,
    requestedPaths,
    metrics: {
      probGain: upCount / paths,
      probDouble: doubleCount / paths,
      probDrawdown20: drop20Count / paths,
      medianFinal: last.p50,
      p10Final: last.p10,
      p90Final: last.p90,
      medianCagr,
      meanCagr
    }
  };
}

function renderResult(base, simulation) {
  const headlines = Array.isArray(base.headlines) ? base.headlines.slice(0, 6) : [];
  const metrics = simulation.metrics;
  forecastResult.innerHTML = `
    <section class="valuation-hero hold">
      <div class="valuation-hero-main">
        <p class="valuation-kicker">${esc(base.symbol)}</p>
        <h3>${esc(base.displayName)}</h3>
        <p>Current price ${fmtMoney(base.price)} (${esc(base.priceDate)})</p>
      </div>
      <div class="valuation-rec-card hold">
        <span>Median Final</span>
        <strong>${fmtMoney(metrics.medianFinal)}</strong>
        <small>Median CAGR ${fmtPct(metrics.medianCagr)}</small>
      </div>
    </section>

    <div class="valuation-kpis">
      <article class="kpi-card"><span>Chance of Gain</span><strong>${fmtPct(metrics.probGain)}</strong><small>Final value above today's price</small></article>
      <article class="kpi-card"><span>Chance to 2x</span><strong>${fmtPct(metrics.probDouble)}</strong><small>Final value at least double</small></article>
      <article class="kpi-card"><span>Chance of -20%+</span><strong>${fmtPct(metrics.probDrawdown20)}</strong><small>Final value below 80% of start</small></article>
      <article class="kpi-card"><span>P10-P90 Final Range</span><strong>${fmtMoney(metrics.p10Final)} - ${fmtMoney(metrics.p90Final)}</strong><small>80% confidence range</small></article>
    </div>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Historical Price Snapshot (Last ~180 Days)</h4>
        ${renderHistoryChart(base.history)}
      </section>
      <section class="chart-card">
        <h4>AI Future Paths (Monte Carlo, ${esc(simulation.intervalMeta?.titleLabel || 'Monthly')})</h4>
        ${renderFanChart(simulation.fan, simulation.samplePaths, simulation.intervalMeta)}
      </section>
    </div>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Assumption Summary</h4>
        <ul class="investor-list">
          <li>Time interval: ${esc(simulation.intervalMeta?.titleLabel || 'Monthly')}</li>
          <li>Simulation paths used: ${fmtNum(simulation.actualPaths || 0, 0)}${simulation.actualPaths < simulation.requestedPaths ? ` (reduced from ${fmtNum(simulation.requestedPaths, 0)} for performance)` : ''}</li>
          <li>Effective drift used: ${fmtPct(simulation.effectiveDrift)}</li>
          <li>Effective volatility used: ${fmtPct(simulation.effectiveVol)}</li>
          <li>Historical drift baseline: ${fmtPct(base.annualDrift)}</li>
          <li>Historical volatility baseline: ${fmtPct(base.annualVol)}</li>
          <li>News-derived tilt: ${fmtNum(base.newsBias * 100, 1)} points</li>
          <li>Valuation composite score: ${fmtNum(base.compositeScore, 0)}/100</li>
        </ul>
      </section>
      <section class="chart-card">
        <h4>How AI Chose Inputs</h4>
        <ul class="investor-list">
          <li>Historical return and volatility are estimated from recent daily closes.</li>
          <li>Headline tone modifies drift and risk through the News Impact Index.</li>
          <li>Macro Regime Index shifts cyclic pressure and baseline growth.</li>
          <li>Mean reversion controls how strongly paths pull toward long-run trend.</li>
          <li>Run multiple presets to compare optimistic vs defensive outcomes.</li>
        </ul>
      </section>
    </div>

    <section class="chart-card">
      <h4>Recent Headlines Used For Context</h4>
      <ul class="investor-list valuation-headlines">
        ${headlines.length
          ? headlines
              .map(
                (h) =>
                  `<li><strong>${esc(h.title)}</strong><span>${esc(h.publisher || 'Unknown')}${h.date ? ` | ${esc(h.date)}` : ''}</span></li>`
              )
              .join('')
          : '<li>No headlines available from current feed. Using sentiment fallback.</li>'}
      </ul>
    </section>
  `;
  forecastResult.classList.remove('hidden');
}

forecastQueryInput?.addEventListener('input', () => {
  const raw = String(forecastQueryInput.value || '');
  forecastSelectedSymbol = '';
  currentBaseline = null;
  setSelectionState('', '');
  if (forecastSearchTimer) clearTimeout(forecastSearchTimer);
  if (!raw.trim()) {
    hideSearchDropdown();
    return;
  }
  forecastSearchTimer = setTimeout(async () => {
    try {
      forecastSearchResults = await searchSymbolOptions(raw);
      forecastSearchIndex = -1;
      renderSearchDropdown();
    } catch (_error) {
      hideSearchDropdown();
    }
  }, 120);
});

forecastQueryInput?.addEventListener('keydown', (event) => {
  if (!forecastSearchResults.length) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    forecastSearchIndex = Math.min(forecastSearchResults.length - 1, forecastSearchIndex + 1);
    renderSearchDropdown();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    forecastSearchIndex = Math.max(0, forecastSearchIndex - 1);
    renderSearchDropdown();
  } else if (event.key === 'Enter' && forecastSearchIndex >= 0) {
    event.preventDefault();
    applySearchSelection(forecastSearchResults[forecastSearchIndex]);
  }
});

forecastSearchDropdown?.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-search-index]');
  if (!btn) return;
  const idx = Number(btn.dataset.searchIndex || -1);
  if (idx < 0 || idx >= forecastSearchResults.length) return;
  applySearchSelection(forecastSearchResults[idx]);
});

document.addEventListener('click', (event) => {
  if (!forecastSearchDropdown || !forecastQueryInput) return;
  if (forecastSearchDropdown.contains(event.target) || forecastQueryInput.contains(event.target)) return;
  hideSearchDropdown();
});

aiAutoBtn?.addEventListener('click', async () => handlePresetClick('auto'));
aiConservativeBtn?.addEventListener('click', async () => handlePresetClick('conservative'));
aiBalancedBtn?.addEventListener('click', async () => handlePresetClick('balanced'));
aiAggressiveBtn?.addEventListener('click', async () => handlePresetClick('aggressive'));

forecastForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = String(forecastQueryInput?.value || '').trim();
  if (!query) {
    forecastStatus.textContent = 'Enter an investment.';
    return;
  }
  forecastStatus.textContent = 'Loading historical data and news signals...';
  forecastResult.classList.add('hidden');

  try {
    currentBaseline = await ensureBaselineLoaded();

    if (!forecastDriftInput.dataset.userSet) {
      setControlValue(forecastDriftInput, forecastDriftRange, currentBaseline.annualDrift * 100);
    }
    if (!forecastVolInput.dataset.userSet) {
      setControlValue(forecastVolInput, forecastVolRange, currentBaseline.annualVol * 100);
    }
    if (!forecastNewsInput.dataset.userSet) {
      setControlValue(forecastNewsInput, forecastNewsRange, Math.round(currentBaseline.newsBias * 100));
    }
    updateQuickSummary();

    forecastStatus.textContent = 'Running AI simulation paths...';
    const simulation = runSimulation(currentBaseline, {
      horizonUnits: Number(forecastYearsInput?.value || 36),
      interval: String(forecastIntervalSelect?.value || 'monthly'),
      paths: Number(forecastPathsInput?.value || 500),
      driftPct: Number(forecastDriftInput?.value || 8),
      volPct: Number(forecastVolInput?.value || 25),
      newsIndex: Number(forecastNewsInput?.value || 0),
      macroIndex: Number(forecastMacroInput?.value || 0),
      meanReversionPct: Number(forecastMeanRevInput?.value || 25)
    });
    renderResult(currentBaseline, simulation);
    forecastStatus.textContent = `Simulation complete for ${currentBaseline.symbol}.`;
  } catch (error) {
    forecastStatus.textContent = `Unable to run simulation: ${error?.message || 'Unknown error'}`;
    forecastResult.classList.add('hidden');
  }
});

forecastIntervalSelect?.addEventListener('change', () => {
  applyHorizonConfig(forecastIntervalSelect.value, true);
  updateQuickSummary();
});

applyHorizonConfig(forecastIntervalSelect?.value || 'monthly', false);
bindNumberRange(forecastYearsInput, forecastYearsRange);
bindNumberRange(forecastPathsInput, forecastPathsRange);
bindNumberRange(forecastDriftInput, forecastDriftRange, { userSet: true });
bindNumberRange(forecastVolInput, forecastVolRange, { userSet: true });
bindNumberRange(forecastNewsInput, forecastNewsRange, { userSet: true });
bindNumberRange(forecastMacroInput, forecastMacroRange, { userSet: true });
bindNumberRange(forecastMeanRevInput, forecastMeanRevRange, { userSet: true });
updateQuickSummary();
