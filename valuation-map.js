const investmentMapForm = document.getElementById('investmentMapForm');
const investmentMapQueryInput = document.getElementById('investmentMapQuery');
const investmentMapSearchDropdown = document.getElementById('investmentMapSearchDropdown');
const investmentMapDateInput = document.getElementById('investmentMapDate');
const investmentMapStatus = document.getElementById('investmentMapStatus');
const investmentMapResult = document.getElementById('investmentMapResult');
const investmentMapPicks = document.querySelector('.investment-map-picks');

let investmentMapSearchResults = [];
let investmentMapSearchIndex = -1;
let investmentMapSearchTimer = null;
let investmentMapSelectedSymbol = '';
let investmentMapRunId = 0;

const valuationMapCache = new Map();

const POPULAR_SYMBOL_RANK = new Map(
  [
    'SPY',
    'QQQ',
    'VOO',
    'VTI',
    'IVV',
    'AAPL',
    'MSFT',
    'NVDA',
    'AMZN',
    'GOOGL',
    'META',
    'TSLA',
    'BRK-B',
    'JPM',
    'XOM',
    'BND',
    'TLT',
    'GLD',
    'BTC-USD',
    'ETH-USD'
  ].map((symbol, idx) => [symbol, idx])
);

const MAP_LIBRARY = {
  SPY: { kind: 'etf', family: 'broad-market', themes: ['us-equity', 'benchmark'], peers: ['VOO', 'VTI', 'QQQ'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD', 'BND'] },
  VOO: { kind: 'etf', family: 'broad-market', themes: ['us-equity', 'benchmark'], peers: ['SPY', 'VTI', 'QQQ'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD', 'BND'] },
  VTI: { kind: 'etf', family: 'broad-market', themes: ['us-equity', 'benchmark', 'total-market'], peers: ['SPY', 'VOO', 'QQQ'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD', 'BND'] },
  QQQ: { kind: 'etf', family: 'growth-tech', themes: ['technology', 'growth', 'benchmark'], peers: ['SPY', 'XLK', 'SMH'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD', 'VIG'] },
  XLK: { kind: 'etf', family: 'growth-tech', themes: ['technology', 'growth', 'sector'], peers: ['QQQ', 'SMH', 'SPY'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD', 'VIG'] },
  SMH: { kind: 'etf', family: 'semiconductors', themes: ['technology', 'semiconductors', 'growth'], peers: ['QQQ', 'XLK', 'SOXL'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  SOXL: { kind: 'leveraged', family: 'semiconductors', themes: ['technology', 'semiconductors', 'leveraged'], peers: ['SMH', 'QQQ', 'NVDA'], hedges: ['SHV', 'TLT'], complements: ['GLD'] },
  TQQQ: { kind: 'leveraged', family: 'growth-tech', themes: ['technology', 'growth', 'leveraged'], peers: ['QQQ', 'SOXL', 'NVDA'], hedges: ['SHV', 'TLT'], complements: ['GLD'] },
  AAPL: { kind: 'equity', family: 'mega-cap-tech', themes: ['technology', 'consumer-tech', 'mega-cap'], peers: ['MSFT', 'GOOGL', 'AMZN'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['VIG', 'SCHD'] },
  MSFT: { kind: 'equity', family: 'mega-cap-tech', themes: ['technology', 'software', 'mega-cap'], peers: ['AAPL', 'NVDA', 'GOOGL'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['VIG', 'SCHD'] },
  NVDA: { kind: 'equity', family: 'semiconductors', themes: ['technology', 'semiconductors', 'ai'], peers: ['AMD', 'MSFT', 'AVGO'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  AMD: { kind: 'equity', family: 'semiconductors', themes: ['technology', 'semiconductors', 'ai'], peers: ['NVDA', 'AVGO', 'SMH'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  AVGO: { kind: 'equity', family: 'semiconductors', themes: ['technology', 'semiconductors', 'infrastructure'], peers: ['NVDA', 'AMD', 'SMH'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  GOOGL: { kind: 'equity', family: 'mega-cap-tech', themes: ['technology', 'internet', 'mega-cap'], peers: ['META', 'AMZN', 'AAPL'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['VIG', 'SCHD'] },
  META: { kind: 'equity', family: 'mega-cap-tech', themes: ['technology', 'internet', 'advertising'], peers: ['GOOGL', 'AMZN', 'AAPL'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  AMZN: { kind: 'equity', family: 'mega-cap-tech', themes: ['technology', 'consumer', 'cloud'], peers: ['META', 'GOOGL', 'AAPL'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['SCHD'] },
  TSLA: { kind: 'equity', family: 'high-beta', themes: ['consumer', 'innovation', 'high-beta'], peers: ['QQQ', 'NVDA', 'AMZN'], hedges: ['SHV', 'TLT'], complements: ['SCHD', 'BND'] },
  SCHD: { kind: 'etf', family: 'quality-income', themes: ['quality', 'income', 'dividend'], peers: ['VIG', 'XLP', 'SPY'], hedges: ['BND', 'TLT', 'SHV'], complements: ['GLD', 'VNQ'] },
  VIG: { kind: 'etf', family: 'quality-income', themes: ['quality', 'income', 'dividend'], peers: ['SCHD', 'XLP', 'SPY'], hedges: ['BND', 'TLT', 'SHV'], complements: ['GLD', 'VNQ'] },
  XLP: { kind: 'etf', family: 'defensive-equity', themes: ['defensive', 'consumer-staples', 'sector'], peers: ['XLV', 'SCHD', 'VIG'], hedges: ['BND', 'TLT', 'SHV'], complements: ['GLD'] },
  XLV: { kind: 'etf', family: 'defensive-equity', themes: ['defensive', 'healthcare', 'sector'], peers: ['XLP', 'SCHD', 'VIG'], hedges: ['BND', 'TLT', 'SHV'], complements: ['GLD'] },
  BND: { kind: 'bond', family: 'core-bonds', themes: ['bonds', 'defensive', 'income'], peers: ['TLT', 'SHV', 'TIP'], hedges: [], complements: ['SPY', 'QQQ', 'SCHD'] },
  TLT: { kind: 'bond', family: 'duration-bonds', themes: ['bonds', 'defensive', 'duration'], peers: ['BND', 'TIP', 'SHV'], hedges: [], complements: ['SPY', 'QQQ', 'BTC-USD'] },
  SHV: { kind: 'cashlike', family: 'cashlike', themes: ['defensive', 'liquidity', 'cashlike'], peers: ['BND', 'TLT', 'TIP'], hedges: [], complements: ['SPY', 'QQQ', 'BTC-USD'] },
  TIP: { kind: 'bond', family: 'inflation-bonds', themes: ['bonds', 'defensive', 'inflation'], peers: ['TLT', 'BND', 'GLD'], hedges: [], complements: ['SPY', 'QQQ', 'VNQ'] },
  GLD: { kind: 'commodity', family: 'real-assets', themes: ['gold', 'defensive', 'real-assets', 'inflation'], peers: ['TIP', 'VNQ', 'TLT'], hedges: [], complements: ['SPY', 'BTC-USD', 'XLE'] },
  VNQ: { kind: 'etf', family: 'real-assets', themes: ['real-estate', 'income', 'real-assets'], peers: ['GLD', 'SCHD', 'BND'], hedges: ['TLT', 'SHV'], complements: ['TIP'] },
  XOM: { kind: 'equity', family: 'energy', themes: ['energy', 'commodities', 'cash-flow'], peers: ['XLE', 'GLD', 'SPY'], hedges: ['TLT', 'SHV'], complements: ['BND'] },
  XLE: { kind: 'etf', family: 'energy', themes: ['energy', 'commodities', 'sector'], peers: ['XOM', 'GLD', 'SPY'], hedges: ['TLT', 'SHV'], complements: ['BND'] },
  'BRK-B': { kind: 'equity', family: 'quality-value', themes: ['quality', 'value', 'conglomerate'], peers: ['JPM', 'SCHD', 'SPY'], hedges: ['TLT', 'SHV'], complements: ['GLD', 'BND'] },
  JPM: { kind: 'equity', family: 'financials', themes: ['financials', 'quality', 'cyclical'], peers: ['BRK-B', 'SPY', 'SCHD'], hedges: ['TLT', 'GLD', 'SHV'], complements: ['BND'] },
  'BTC-USD': { kind: 'crypto', family: 'crypto', themes: ['crypto', 'alternative', 'high-beta'], peers: ['ETH-USD', 'COIN', 'MSTR'], hedges: ['SHV', 'TLT'], complements: ['GLD'] },
  'ETH-USD': { kind: 'crypto', family: 'crypto', themes: ['crypto', 'alternative', 'high-beta'], peers: ['BTC-USD', 'COIN', 'MSTR'], hedges: ['SHV', 'TLT'], complements: ['GLD'] },
  COIN: { kind: 'equity', family: 'crypto', themes: ['crypto', 'exchange', 'high-beta'], peers: ['MSTR', 'BTC-USD', 'ETH-USD'], hedges: ['SHV', 'TLT'], complements: ['GLD'] },
  MSTR: { kind: 'equity', family: 'crypto', themes: ['crypto', 'software', 'high-beta'], peers: ['COIN', 'BTC-USD', 'ETH-USD'], hedges: ['SHV', 'TLT'], complements: ['GLD'] }
};

const RELATION_META = {
  theme: { label: 'Theme Peer', tone: 'theme', description: 'Same market story or exposure cluster.' },
  momentum: { label: 'Momentum Peer', tone: 'momentum', description: 'Recent trend is moving in a similar way.' },
  risk: { label: 'Risk Twin', tone: 'risk', description: 'Volatility and sentiment profile are close.' },
  hedge: { label: 'Hedge', tone: 'hedge', description: 'Offsets the base idea with a more defensive angle.' },
  anchor: { label: 'Anchor', tone: 'anchor', description: 'Acts as a broad benchmark for the trade.' },
  amplifier: { label: 'Amplifier', tone: 'amplifier', description: 'Pushes the same view with more beta.' },
  diversifier: { label: 'Diversifier', tone: 'diversifier', description: 'Adds a different return driver to the mix.' },
  comparable: { label: 'Comparable', tone: 'comparable', description: 'Useful as a general comparison point.' }
};

const RELATION_ORDER = ['hedge', 'amplifier', 'anchor', 'theme', 'momentum', 'risk', 'diversifier', 'comparable'];

const MAP_BOARD_SLOTS = [
  { area: 'top-center', x1: 50, y1: 36, x2: 50, y2: 29 },
  { area: 'top-right', x1: 58, y1: 42, x2: 64, y2: 36 },
  { area: 'middle-right', x1: 61, y1: 50, x2: 69, y2: 50 },
  { area: 'bottom-right', x1: 58, y1: 58, x2: 64, y2: 64 },
  { area: 'bottom-center', x1: 50, y1: 64, x2: 50, y2: 71 },
  { area: 'bottom-left', x1: 42, y1: 58, x2: 36, y2: 64 },
  { area: 'middle-left', x1: 39, y1: 50, x2: 31, y2: 50 },
  { area: 'top-left', x1: 42, y1: 42, x2: 36, y2: 36 }
];
const MAP_BOARD_SLOT_BY_AREA = new Map(MAP_BOARD_SLOTS.map((slot) => [slot.area, slot]));
const MAP_BOARD_PATTERNS = {
  1: ['top-center'],
  2: ['middle-left', 'middle-right'],
  3: ['top-center', 'middle-left', 'middle-right'],
  4: ['top-left', 'bottom-left', 'top-right', 'bottom-right'],
  5: ['top-left', 'bottom-left', 'top-center', 'top-right', 'bottom-right'],
  6: ['top-left', 'middle-left', 'bottom-left', 'top-right', 'middle-right', 'bottom-right'],
  7: ['top-left', 'middle-left', 'bottom-left', 'top-center', 'top-right', 'middle-right', 'bottom-right'],
  8: ['top-left', 'middle-left', 'bottom-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center']
};

function fmtMoney(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(v, digits = 1) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return `${(Number(v) * 100).toFixed(digits)}%`;
}

function fmtNum(v, digits = 0) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return Number(v).toFixed(digits);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, Number(v || 0)));
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isUsExchange(exchange) {
  const ex = String(exchange || '').toUpperCase();
  return ['NASDAQ', 'NMS', 'NYQ', 'NYSE', 'ASE', 'AMEX', 'BATS', 'ARCX'].some((x) => ex.includes(x));
}

function normalizeSymbolForRank(symbol) {
  return String(symbol || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace('_', '-');
}

function popularityRank(symbol) {
  const normalized = normalizeSymbolForRank(symbol);
  return POPULAR_SYMBOL_RANK.has(normalized) ? POPULAR_SYMBOL_RANK.get(normalized) : Number.POSITIVE_INFINITY;
}

function searchScore(queryUpper, option) {
  const sym = String(option?.symbol || '').toUpperCase();
  const name = String(option?.longname || option?.shortname || '').toUpperCase();
  if (!queryUpper) return 0;
  if (sym === queryUpper) return 10000;
  if (sym.startsWith(queryUpper)) return 9000 - sym.length;
  if (name.startsWith(queryUpper)) return 8000 - name.length;
  const idxSym = sym.indexOf(queryUpper);
  if (idxSym >= 0) return 7000 - idxSym * 10 - sym.length;
  const idxName = name.indexOf(queryUpper);
  if (idxName >= 0) return 6000 - idxName * 6 - name.length;
  return 0;
}

function searchMatchTier(queryUpper, option) {
  const sym = String(option?.symbol || '').toUpperCase();
  const name = String(option?.longname || option?.shortname || '').toUpperCase();
  if (!queryUpper) return 5;
  if (sym === queryUpper) return 0;
  if (sym.startsWith(queryUpper)) return 1;
  if (name.startsWith(queryUpper)) return 2;
  if (sym.includes(queryUpper)) return 3;
  if (name.includes(queryUpper)) return 4;
  return 5;
}

async function searchSymbolOptions(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return [];
  const queryUpper = raw.toUpperCase();

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
  for (const match of data?.matches || []) {
    if (!list.some((x) => x.symbol === match.symbol)) list.push(match);
  }

  list.sort((a, b) => {
    const ta = searchMatchTier(queryUpper, a);
    const tb = searchMatchTier(queryUpper, b);
    if (ta !== tb) return ta - tb;

    const pa = popularityRank(a.symbol);
    const pb = popularityRank(b.symbol);
    if (pa !== pb) return pa - pb;

    const sa = searchScore(queryUpper, a);
    const sb = searchScore(queryUpper, b);
    if (sb !== sa) return sb - sa;

    const au = isUsExchange(a.exchange) ? 1 : 0;
    const bu = isUsExchange(b.exchange) ? 1 : 0;
    if (bu !== au) return bu - au;
    return String(a.symbol || '').localeCompare(String(b.symbol || ''));
  });

  return list.slice(0, 8);
}

function hideInvestmentMapSearchDropdown() {
  investmentMapSearchDropdown?.classList.add('hidden');
  if (investmentMapSearchDropdown) investmentMapSearchDropdown.innerHTML = '';
  investmentMapSearchResults = [];
  investmentMapSearchIndex = -1;
}

function applyInvestmentMapSearchSelection(option) {
  if (!option || !investmentMapQueryInput) return;
  investmentMapQueryInput.value = option.symbol || '';
  investmentMapSelectedSymbol = String(option.symbol || '').trim().toUpperCase();
  hideInvestmentMapSearchDropdown();
}

async function requireInvestmentMapDropdownSelection(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return null;
  const norm = raw.toUpperCase();
  const local = investmentMapSearchResults.find((x) => String(x?.symbol || '').toUpperCase() === norm);
  if (local) return local;
  const fetched = await searchSymbolOptions(raw);
  return fetched.find((x) => String(x?.symbol || '').toUpperCase() === norm) || null;
}

function renderInvestmentMapSearchDropdown() {
  if (!investmentMapSearchDropdown) return;
  if (!investmentMapSearchResults.length) {
    hideInvestmentMapSearchDropdown();
    return;
  }

  investmentMapSearchDropdown.classList.remove('hidden');
  investmentMapSearchDropdown.innerHTML = investmentMapSearchResults
    .map((opt, i) => {
      const name = opt.longname || opt.shortname || opt.symbol;
      const sub = [opt.symbol, opt.exchange, opt.quoteType].filter(Boolean).join(' | ');
      return `<button type="button" class="search-option ${i === investmentMapSearchIndex ? 'active' : ''}" data-map-search-index="${i}">
        <div class="search-option-title">${escapeHtml(name)}</div>
        <div class="search-option-sub">${escapeHtml(sub)}</div>
      </button>`;
    })
    .join('');
}

async function fetchInvestment(symbol, asOfDate = '') {
  const resolvedDate = String(asOfDate || investmentMapDateInput?.value || todayIso()).trim();
  const key = `${String(symbol || '').toUpperCase()}|${resolvedDate}`;
  if (valuationMapCache.has(key)) return valuationMapCache.get(key);

  const pending = (async () => {
    const response = await fetch('/api/valuation/investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: symbol, asOfDate: resolvedDate })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `Failed to load ${symbol}.`);
    return data?.investment || {};
  })();

  valuationMapCache.set(key, pending);
  try {
    return await pending;
  } catch (error) {
    valuationMapCache.delete(key);
    throw error;
  }
}

function uniq(list) {
  return [...new Set((Array.isArray(list) ? list : []).filter(Boolean))];
}

function intersection(a, b) {
  const right = new Set(Array.isArray(b) ? b : []);
  return uniq(Array.isArray(a) ? a.filter((item) => right.has(item)) : []);
}

function inferThemesFromName(name) {
  const text = String(name || '').toLowerCase();
  const themes = new Set();
  if (/tech|software|cloud|internet|semiconductor|chip|ai/.test(text)) themes.add('technology');
  if (/semiconductor|chip/.test(text)) themes.add('semiconductors');
  if (/bond|treasury|income|aggregate/.test(text)) themes.add('bonds');
  if (/gold/.test(text)) themes.add('gold');
  if (/real estate|reit/.test(text)) themes.add('real-estate');
  if (/health|pharma|medical/.test(text)) themes.add('healthcare');
  if (/consumer|staples/.test(text)) themes.add('consumer-staples');
  if (/financial|bank/.test(text)) themes.add('financials');
  if (/energy|oil|gas/.test(text)) themes.add('energy');
  if (/crypto|bitcoin|ethereum/.test(text)) themes.add('crypto');
  return [...themes];
}

function inferKind(symbol, option, investment, seedKind = '') {
  if (seedKind) return seedKind;
  const quoteType = String(option?.quoteType || '').toUpperCase();
  const symbolUpper = String(symbol || '').toUpperCase();
  if (symbolUpper.endsWith('-USD') || quoteType.includes('CRYPTO')) return 'crypto';
  if (quoteType.includes('ETF')) return 'etf';
  if (['BND', 'TLT', 'SHV', 'TIP'].includes(symbolUpper)) return 'bond';
  if (symbolUpper === 'GLD') return 'commodity';
  const vol = Number(investment?.market?.annualizedVolatility || 0);
  if (vol > 0.42) return 'high-beta';
  return 'equity';
}

function inferRiskBand(vol) {
  const n = Number(vol || 0);
  if (n < 0.12) return 'low';
  if (n < 0.22) return 'moderate';
  if (n < 0.34) return 'high';
  return 'very-high';
}

function inferMomentumBand(ret90) {
  const n = Number(ret90 || 0);
  if (n > 0.18) return 'surging';
  if (n > 0.06) return 'positive';
  if (n < -0.12) return 'weak';
  if (n < -0.03) return 'soft';
  return 'flat';
}

function buildProfile(symbol, investment, option = null) {
  const symbolUpper = String(symbol || '').trim().toUpperCase();
  const seed = MAP_LIBRARY[symbolUpper] || {};
  const displayName = String(investment?.displayName || option?.longname || option?.shortname || symbolUpper).trim();
  const kind = inferKind(symbolUpper, option, investment, seed.kind);
  const themes = uniq([
    ...(seed.themes || []),
    ...inferThemesFromName(displayName),
    ...(kind === 'crypto' ? ['crypto', 'alternative', 'high-beta'] : []),
    ...(kind === 'bond' ? ['bonds', 'defensive'] : []),
    ...(kind === 'commodity' ? ['gold', 'defensive', 'real-assets'] : []),
    ...(kind === 'leveraged' ? ['leveraged', 'high-beta'] : [])
  ]);

  return {
    symbol: symbolUpper,
    displayName,
    kind,
    family: seed.family || kind,
    themes,
    peers: uniq(seed.peers || []),
    hedges: uniq(seed.hedges || []),
    complements: uniq(seed.complements || []),
    riskBand: inferRiskBand(investment?.market?.annualizedVolatility),
    momentumBand: inferMomentumBand(investment?.market?.trailingReturns?.d90),
    quoteType: String(option?.quoteType || '').trim()
  };
}

function isDefensiveProfile(profile) {
  const kind = String(profile?.kind || '');
  if (['bond', 'cashlike', 'commodity'].includes(kind)) return true;
  return (profile?.themes || []).some((theme) => ['defensive', 'bonds', 'gold', 'income'].includes(theme));
}

function isAggressiveProfile(profile) {
  const kind = String(profile?.kind || '');
  if (['leveraged', 'crypto', 'high-beta'].includes(kind)) return true;
  return (profile?.themes || []).some((theme) => ['high-beta', 'leveraged', 'crypto', 'ai', 'semiconductors'].includes(theme));
}

function isAnchorSymbol(symbol) {
  return ['SPY', 'QQQ', 'VOO', 'VTI', 'BND', 'TLT', 'GLD', 'SHV', 'BTC-USD'].includes(String(symbol || '').toUpperCase());
}

function buildCandidateSymbols(rootProfile, rootInvestment) {
  const symbols = [];
  const pushMany = (...items) => items.flat().forEach((item) => symbols.push(String(item || '').toUpperCase()));

  pushMany(rootProfile.peers, rootProfile.hedges, rootProfile.complements);

  Object.entries(MAP_LIBRARY).forEach(([symbol, meta]) => {
    if (symbol === rootProfile.symbol) return;
    if (meta.family === rootProfile.family || intersection(rootProfile.themes, meta.themes || []).length) {
      pushMany(symbol);
    }
  });

  if (rootProfile.kind === 'crypto') pushMany(['BTC-USD', 'ETH-USD', 'COIN', 'MSTR', 'QQQ', 'GLD', 'SHV']);
  else if (rootProfile.kind === 'bond' || rootProfile.kind === 'cashlike') pushMany(['BND', 'TLT', 'SHV', 'TIP', 'GLD', 'SPY']);
  else if (rootProfile.kind === 'commodity') pushMany(['TIP', 'VNQ', 'TLT', 'SPY', 'XLE']);
  else if (isAggressiveProfile(rootProfile)) pushMany(['QQQ', 'SMH', 'SOXL', 'TQQQ', 'GLD', 'SHV', 'TLT']);
  else if (isDefensiveProfile(rootProfile)) pushMany(['BND', 'TLT', 'SHV', 'GLD', 'SCHD', 'VIG']);
  else pushMany(['SPY', 'QQQ', 'SCHD', 'VIG', 'GLD', 'TLT', 'BND']);

  const ret90 = Number(rootInvestment?.market?.trailingReturns?.d90 || 0);
  const vol = Number(rootInvestment?.market?.annualizedVolatility || 0);
  if (ret90 > 0.12 || vol > 0.32) pushMany(['NVDA', 'SMH', 'SOXL', 'QQQ']);
  if (ret90 < -0.06 || vol < 0.14) pushMany(['SCHD', 'VIG', 'BND', 'TLT', 'XLP', 'XLV']);

  return uniq(symbols).filter((symbol) => symbol && symbol !== rootProfile.symbol).slice(0, 16);
}

function sentenceCaseLabel(text) {
  return String(text || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function relationTone(relationKey) {
  return RELATION_META[relationKey]?.tone || 'comparable';
}

function describeConnection(rootInvestment, candidateInvestment, rootProfile, candidateProfile) {
  const sharedThemes = intersection(rootProfile.themes, candidateProfile.themes);
  const sameFamily = rootProfile.family && rootProfile.family === candidateProfile.family;
  const rootRet90 = Number(rootInvestment?.market?.trailingReturns?.d90 || 0);
  const candidateRet90 = Number(candidateInvestment?.market?.trailingReturns?.d90 || 0);
  const rootVol = Number(rootInvestment?.market?.annualizedVolatility || 0);
  const candidateVol = Number(candidateInvestment?.market?.annualizedVolatility || 0);
  const rootSentiment = Number(rootInvestment?.signals?.newsSentiment || 0);
  const candidateSentiment = Number(candidateInvestment?.signals?.newsSentiment || 0);
  const rootScore = Number(rootInvestment?.valuation?.compositeScore || 0);
  const candidateScore = Number(candidateInvestment?.valuation?.compositeScore || 0);

  const momentumGap = Math.abs(rootRet90 - candidateRet90);
  const volGap = Math.abs(rootVol - candidateVol);
  const sentimentGap = Math.abs(rootSentiment - candidateSentiment);
  const scoreGap = Math.abs(rootScore - candidateScore) / 100;

  const explicitHedge =
    rootProfile.hedges.includes(candidateProfile.symbol) ||
    candidateProfile.hedges.includes(rootProfile.symbol) ||
    (isAggressiveProfile(rootProfile) && isDefensiveProfile(candidateProfile));
  const amplifier =
    candidateProfile.kind === 'leveraged' ||
    (isAggressiveProfile(candidateProfile) && sameFamily && candidateVol > rootVol * 1.15);
  const anchor = isAnchorSymbol(candidateProfile.symbol);
  const diversifier =
    rootProfile.complements.includes(candidateProfile.symbol) ||
    candidateProfile.complements.includes(rootProfile.symbol) ||
    (isDefensiveProfile(candidateProfile) && !explicitHedge && !sameFamily);

  let score = 8;
  if (sameFamily) score += 28;
  score += sharedThemes.length * 12;
  if (explicitHedge) score += 28;
  if (amplifier) score += 18;
  if (anchor) score += 14;
  if (diversifier) score += 12;
  score += Math.max(0, 18 - momentumGap * 85);
  score += Math.max(0, 14 - volGap * 70);
  score += Math.max(0, 10 - sentimentGap * 26);
  score += Math.max(0, 8 - scoreGap * 28);
  if (String(rootInvestment?.valuation?.recommendation?.action || '') === String(candidateInvestment?.valuation?.recommendation?.action || '')) {
    score += 5;
  }

  let relationKey = 'comparable';
  if (explicitHedge) relationKey = 'hedge';
  else if (amplifier) relationKey = 'amplifier';
  else if (sameFamily || sharedThemes.length >= 2) relationKey = 'theme';
  else if (anchor) relationKey = 'anchor';
  else if (diversifier) relationKey = 'diversifier';
  else if (momentumGap < 0.07) relationKey = 'momentum';
  else if (volGap < 0.05 && sentimentGap < 0.22) relationKey = 'risk';

  const reasonBits = [];
  if (sharedThemes.length) {
    reasonBits.push(`${sentenceCaseLabel(sharedThemes[0])}${sharedThemes.length > 1 ? ` +${sharedThemes.length - 1}` : ''} overlap`);
  }
  if (relationKey === 'hedge') {
    if (candidateProfile.kind === 'bond' || candidateProfile.kind === 'cashlike') reasonBits.push('defensive ballast');
    else if (candidateProfile.kind === 'commodity') reasonBits.push('real-asset cushion');
    else reasonBits.push('risk offset');
  }
  if (relationKey === 'amplifier') reasonBits.push('higher-beta expression');
  if (relationKey === 'anchor') reasonBits.push('benchmark reference');
  if (relationKey === 'diversifier') reasonBits.push('different return driver');
  if (momentumGap < 0.09) reasonBits.push(`90D gap ${fmtPct(momentumGap, 1)}`);
  if (volGap < 0.07) reasonBits.push(`vol gap ${fmtPct(volGap, 1)}`);
  if (sentimentGap < 0.22) reasonBits.push('similar news tone');

  const relationLabel = RELATION_META[relationKey]?.label || 'Comparable';
  const summaryText = reasonBits.slice(0, 3).join(' | ') || 'Useful comparison point';

  return {
    symbol: candidateProfile.symbol,
    relationKey,
    relationLabel,
    relationTone: relationTone(relationKey),
    score: clamp(score, 0, 100),
    summary: reasonBits.slice(0, 3).join(' • ') || 'Useful comparison point',
    metrics: {
      return90: candidateRet90,
      vol: candidateVol,
      sentiment: candidateSentiment,
      compositeScore: candidateScore
    },
    summary: summaryText,
    investment: candidateInvestment,
    profile: candidateProfile
  };
}

function pickTopConnections(connections) {
  const sorted = [...connections].sort((a, b) => b.score - a.score);
  const selected = [];

  const addFirst = (predicate) => {
    const row = sorted.find((item) => !selected.includes(item) && predicate(item));
    if (row) selected.push(row);
  };

  RELATION_ORDER.forEach((key) => addFirst((item) => item.relationKey === key));

  for (const row of sorted) {
    if (selected.length >= 8) break;
    if (selected.includes(row)) continue;
    const familyCount = selected.filter((x) => x.profile.family && x.profile.family === row.profile.family).length;
    if (familyCount >= 2 && row.relationKey === 'theme') continue;
    selected.push(row);
  }

  return selected.slice(0, 8);
}

function buildMapInsights(rootInvestment, rootProfile, connections) {
  const bestPeer = connections.find((item) => ['theme', 'momentum', 'risk'].includes(item.relationKey)) || connections[0] || null;
  const hedge = connections.find((item) => item.relationKey === 'hedge' || item.relationKey === 'diversifier') || null;
  const anchor = connections.find((item) => item.relationKey === 'anchor') || null;
  const bullets = [];
  if (bestPeer) bullets.push(`${bestPeer.symbol} is the tightest comparison point in this cluster.`);
  if (hedge) bullets.push(`${hedge.symbol} is the cleanest offset if you want balance instead of more of the same trade.`);
  if (anchor) bullets.push(`${anchor.symbol} gives you a broader market yardstick for the idea.`);
  if (!bullets.length) bullets.push('This map is mostly a comparison set rather than a strong hedge cluster.');
  return { bestPeer, hedge, anchor, bullets, riskBand: rootProfile.riskBand, momentumBand: rootProfile.momentumBand };
}

function groupConnectionsByRelation(connections) {
  return RELATION_ORDER
    .map((key) => ({
      key,
      meta: RELATION_META[key] || { label: sentenceCaseLabel(key), tone: 'comparable', description: 'Related comparison point.' },
      items: (Array.isArray(connections) ? connections : [])
        .filter((item) => item.relationKey === key)
        .sort((a, b) => b.score - a.score)
    }))
    .filter((group) => group.items.length);
}

function layoutConnectionGroups(groups) {
  const list = Array.isArray(groups) ? groups : [];
  const pattern = MAP_BOARD_PATTERNS[list.length] || [];

  if (pattern.length === list.length) {
    return list.map((group, idx) => ({
      ...group,
      slot: MAP_BOARD_SLOT_BY_AREA.get(pattern[idx]) || MAP_BOARD_SLOTS[idx] || MAP_BOARD_SLOTS[0]
    }));
  }

  const total = Math.max(list.length, 1);
  return list.map((group, idx) => {
    let slotIndex = Math.round((idx * MAP_BOARD_SLOTS.length) / total) % MAP_BOARD_SLOTS.length;
    while (list.slice(0, idx).some((_, usedIdx) => {
      const usedSlot = Math.round((usedIdx * MAP_BOARD_SLOTS.length) / total) % MAP_BOARD_SLOTS.length;
      return usedSlot === slotIndex;
    })) {
      slotIndex = (slotIndex + 1) % MAP_BOARD_SLOTS.length;
    }
    const slot = MAP_BOARD_SLOTS[slotIndex] || MAP_BOARD_SLOTS[0];
    return { ...group, slot };
  });
}

function renderMapResult(rootInvestment, rootProfile, connections, insights) {
  const rootAction = String(rootInvestment?.valuation?.recommendation?.action || 'HOLD').toUpperCase();
  const rootScore = fmtNum(rootInvestment?.valuation?.compositeScore, 0);
  const rootLabel = escapeHtml(rootInvestment?.valuation?.label || 'Signal Score');
  const groups = layoutConnectionGroups(groupConnectionsByRelation(connections));
  const groupCountClass = `count-${Math.max(1, Math.min(groups.length || 1, 8))}`;

  const insightCards = [
    { label: 'Closest Peer', value: insights.bestPeer?.symbol || 'None', tone: 'theme', detail: insights.bestPeer?.summary || 'No clear operating peer surfaced.' },
    { label: 'Best Hedge', value: insights.hedge?.symbol || 'None', tone: 'hedge', detail: insights.hedge?.summary || 'No strong hedge signal in this run.' },
    { label: 'Market Anchor', value: insights.anchor?.symbol || 'None', tone: 'anchor', detail: insights.anchor?.summary || 'This run is leaning more peer-to-peer.' }
  ];

  investmentMapResult.innerHTML = `
    <section class="investment-map-visual-shell">
      <section class="investment-map-stage-card fresh-map-stage">
        <div class="investment-map-stage-head fresh-map-head">
          <div class="investment-map-stage-copy">
            <p class="valuation-kicker">Investment Map</p>
            <h3>${escapeHtml(rootInvestment.displayName || rootProfile.displayName)}</h3>
            <p>The center card is your current idea. Follow the dotted lines to grouped peers, hedges, anchors, and other nearby comparisons around ${escapeHtml(rootInvestment.symbol || rootProfile.symbol)}.</p>
          </div>
          <div class="investment-map-stage-score fresh-map-score">
            <span>${escapeHtml(rootAction)}</span>
            <strong>${rootScore}</strong>
            <small>${rootLabel}</small>
          </div>
        </div>

        <div class="investment-map-main-layout">
          <div class="investment-map-board refined-board ${groupCountClass}" aria-label="Investment connection map">
            <svg class="investment-map-board-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${groups
                .map(
                  (group) => `
                    <line class="investment-map-link" x1="${escapeHtml(String(group.slot.x1))}" y1="${escapeHtml(String(group.slot.y1))}" x2="${escapeHtml(String(group.slot.x2))}" y2="${escapeHtml(String(group.slot.y2))}"></line>
                    <circle class="investment-map-link-dot" cx="${escapeHtml(String(group.slot.x1))}" cy="${escapeHtml(String(group.slot.y1))}" r="0.7"></circle>
                    <circle class="investment-map-link-dot" cx="${escapeHtml(String(group.slot.x2))}" cy="${escapeHtml(String(group.slot.y2))}" r="0.9"></circle>
                  `
                )
                .join('')}
            </svg>

            <div class="investment-map-board-grid editorial-map compact-map ${groupCountClass}">
              <article class="investment-map-focus-card" style="grid-area:center;" aria-label="${escapeHtml(rootInvestment.symbol || rootProfile.symbol)} center node">
                <div class="investment-map-focus-top">
                  <span class="investment-map-focus-symbol">${escapeHtml(rootInvestment.symbol || rootProfile.symbol)}</span>
                  <span class="investment-map-focus-action">${escapeHtml(rootAction)}</span>
                </div>
                <div class="investment-map-focus-copy">
                  <p class="valuation-kicker">Center Investment</p>
                  <h4>${escapeHtml(rootInvestment.displayName || rootProfile.displayName)}</h4>
                  <p>This is the idea everything else is being compared against in this map.</p>
                </div>
                <div class="investment-map-focus-stat-grid">
                  <div class="investment-map-focus-stat">
                    <span>Price</span>
                    <strong>${fmtMoney(rootInvestment?.market?.price)}</strong>
                  </div>
                  <div class="investment-map-focus-stat">
                    <span>90D</span>
                    <strong>${fmtPct(rootInvestment?.market?.trailingReturns?.d90)}</strong>
                  </div>
                  <div class="investment-map-focus-stat">
                    <span>Volatility</span>
                    <strong>${fmtPct(rootInvestment?.market?.annualizedVolatility)}</strong>
                  </div>
                  <div class="investment-map-focus-stat">
                    <span>Sentiment</span>
                    <strong>${fmtPct(rootInvestment?.signals?.newsSentiment)}</strong>
                  </div>
                </div>
                <div class="investment-map-focus-meta">
                  <span>${rootScore}/100</span>
                  <span>${escapeHtml(sentenceCaseLabel(insights.riskBand || 'moderate'))} risk</span>
                  <span>${escapeHtml(sentenceCaseLabel(insights.momentumBand || 'flat'))} momentum</span>
                  <span>${escapeHtml(rootProfile.kind || 'equity')}</span>
                </div>
              </article>

              ${groups
                .map(
                  (group) => `
                    <article class="investment-map-group-card slot-${escapeHtml(group.slot.area)} tone-${escapeHtml(group.meta.tone)}" style="grid-area:${escapeHtml(group.slot.area)};">
                      <div class="investment-map-group-top">
                        <span class="investment-map-group-pill">${escapeHtml(group.meta.label)}</span>
                        <span class="investment-map-group-total">${escapeHtml(String(group.items.length))}</span>
                      </div>
                      <div class="investment-map-group-list">
                        ${group.items
                          .map(
                            (item) => `
                              <button type="button" class="investment-map-group-link tone-${item.relationTone}" data-map-center-symbol="${escapeHtml(item.symbol)}">
                                <span class="investment-map-group-main">
                                  <strong>${escapeHtml(item.symbol)}</strong>
                                  <small>${escapeHtml(item.investment?.displayName || item.profile.displayName || item.symbol)}</small>
                                </span>
                                <span class="investment-map-group-score">${fmtNum(item.score, 0)}</span>
                              </button>
                            `
                          )
                          .join('')}
                      </div>
                    </article>
                  `
                )
                .join('')}
            </div>
          </div>

          <aside class="investment-map-side-rail">
            ${insightCards
              .map(
                (card) => `
                  <article class="investment-map-summary-card tone-${escapeHtml(card.tone)}">
                    <span>${escapeHtml(card.label)}</span>
                    <strong>${escapeHtml(card.value)}</strong>
                    <p>${escapeHtml(card.detail)}</p>
                  </article>
                `
              )
              .join('')}
            <article class="investment-map-quickread-card compact-read">
              <div class="investment-map-support-head">
                <div>
                  <p class="valuation-kicker">Quick Read</p>
                  <h4>How this map is reading</h4>
                </div>
                <span>${groups.length} groups</span>
              </div>
              <ul class="investor-list">
                ${insights.bullets.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
              </ul>
              <p class="investment-map-support-note">Each outer card gathers one relationship type together so the visual stays clean and readable.</p>
            </article>
          </aside>
        </div>
      </section>
    </section>
  `;

  investmentMapResult.classList.remove('hidden');

  investmentMapResult.querySelectorAll('[data-map-center-symbol]').forEach((button) => {
    button.addEventListener('click', () => {
      const symbol = String(button.getAttribute('data-map-center-symbol') || '').trim().toUpperCase();
      if (!symbol) return;
      investmentMapSelectedSymbol = symbol;
      if (investmentMapQueryInput) investmentMapQueryInput.value = symbol;
      buildInvestmentMap(symbol, investmentMapDateInput?.value || todayIso());
    });
  });
}

async function buildInvestmentMap(symbol, asOfDate = '', option = null) {
  const runId = ++investmentMapRunId;
  const query = String(symbol || '').trim().toUpperCase();
  const resolvedDate = String(asOfDate || investmentMapDateInput?.value || todayIso()).trim();
  if (!query) return;

  investmentMapStatus.textContent = `Building connection map for ${query}...`;
  investmentMapResult.classList.add('hidden');

  try {
    const rootInvestment = await fetchInvestment(query, resolvedDate);
    if (runId !== investmentMapRunId) return;

    const rootProfile = buildProfile(query, rootInvestment, option);
    const candidateSymbols = buildCandidateSymbols(rootProfile, rootInvestment);
    const candidateSettled = await Promise.allSettled(candidateSymbols.map((candidate) => fetchInvestment(candidate, resolvedDate)));
    if (runId !== investmentMapRunId) return;

    const candidateConnections = candidateSettled
      .map((result, idx) => ({ result, symbol: candidateSymbols[idx] }))
      .filter((row) => row.result.status === 'fulfilled' && row.result.value?.symbol)
      .map((row) => {
        const candidateInvestment = row.result.value;
        const candidateProfile = buildProfile(row.symbol, candidateInvestment, null);
        return describeConnection(rootInvestment, candidateInvestment, rootProfile, candidateProfile);
      })
      .filter((row) => row.symbol !== query);

    const topConnections = pickTopConnections(candidateConnections);
    const insights = buildMapInsights(rootInvestment, rootProfile, topConnections);

    renderMapResult(rootInvestment, rootProfile, topConnections, insights);
    investmentMapStatus.textContent = `Connection map ready for ${rootInvestment?.symbol || query}. Related investments are grouped by role below.`;
  } catch (error) {
    if (runId !== investmentMapRunId) return;
    investmentMapStatus.textContent = error.message || 'Failed to build investment map.';
    investmentMapResult.classList.add('hidden');
  }
}

investmentMapForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = String(investmentMapQueryInput?.value || '').trim();
  if (!query) {
    investmentMapStatus.textContent = 'Enter an investment query.';
    return;
  }

  const normalizedQuery = query.toUpperCase();
  const selected =
    normalizedQuery === String(investmentMapSelectedSymbol || '').toUpperCase()
      ? await requireInvestmentMapDropdownSelection(query)
      : null;

  hideInvestmentMapSearchDropdown();
  buildInvestmentMap(selected?.symbol || query, investmentMapDateInput?.value || todayIso(), selected || null);
});

if (investmentMapDateInput) investmentMapDateInput.value = todayIso();

investmentMapQueryInput?.addEventListener('input', () => {
  const q = String(investmentMapQueryInput.value || '').trim();
  investmentMapSelectedSymbol = '';
  if (investmentMapSearchTimer) clearTimeout(investmentMapSearchTimer);
  if (!q || q.length < 2) {
    hideInvestmentMapSearchDropdown();
    return;
  }

  investmentMapSearchTimer = setTimeout(async () => {
    try {
      investmentMapSearchResults = await searchSymbolOptions(q);
      investmentMapSearchIndex = investmentMapSearchResults.length ? 0 : -1;
      renderInvestmentMapSearchDropdown();
    } catch (_error) {
      hideInvestmentMapSearchDropdown();
    }
  }, 220);
});

investmentMapQueryInput?.addEventListener('keydown', (event) => {
  if (!investmentMapSearchResults.length) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    investmentMapSearchIndex = Math.min(investmentMapSearchResults.length - 1, investmentMapSearchIndex + 1);
    renderInvestmentMapSearchDropdown();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    investmentMapSearchIndex = Math.max(0, investmentMapSearchIndex - 1);
    renderInvestmentMapSearchDropdown();
  } else if (event.key === 'Enter') {
    if (investmentMapSearchIndex >= 0 && investmentMapSearchIndex < investmentMapSearchResults.length) {
      event.preventDefault();
      applyInvestmentMapSearchSelection(investmentMapSearchResults[investmentMapSearchIndex]);
    }
  } else if (event.key === 'Escape') {
    hideInvestmentMapSearchDropdown();
  }
});

investmentMapQueryInput?.addEventListener('blur', () => {
  setTimeout(() => hideInvestmentMapSearchDropdown(), 140);
});

investmentMapSearchDropdown?.addEventListener('mousedown', (event) => {
  const button = event.target.closest('button[data-map-search-index]');
  if (!button) return;
  const idx = Number(button.dataset.mapSearchIndex);
  if (Number.isFinite(idx)) applyInvestmentMapSearchSelection(investmentMapSearchResults[idx]);
});

investmentMapPicks?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-map-pick]');
  if (!button) return;
  const symbol = String(button.getAttribute('data-map-pick') || '').trim().toUpperCase();
  if (!symbol) return;
  investmentMapSelectedSymbol = symbol;
  if (investmentMapQueryInput) investmentMapQueryInput.value = symbol;
  hideInvestmentMapSearchDropdown();
  buildInvestmentMap(symbol, investmentMapDateInput?.value || todayIso());
});
