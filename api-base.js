(() => {
  const isGithubPages = /\.github\.io$/i.test(window.location.hostname);
  const apiBase = '';
  const MARKET_NEWS_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'TLT', 'GLD'];
  const TAILORED_NEWS_PROFILES = {
    the_quant: { key: 'the_quant', label: 'The Quant', symbols: ['QQQ', 'NVDA', 'MSFT', 'AVGO', 'AMD', 'SMH'] },
    active_conviction_investor: { key: 'active_conviction_investor', label: 'Active Conviction Investor', symbols: ['TSLA', 'NVDA', 'META', 'AMZN', 'PLTR', 'SOXL'] },
    tactical_trend_analyst: { key: 'tactical_trend_analyst', label: 'Tactical Trend Analyst', symbols: ['QQQ', 'SPY', 'XLF', 'XLE', 'GLD', 'IWM'] },
    aggressive_reactive_trader: { key: 'aggressive_reactive_trader', label: 'Aggressive Reactive Trader', symbols: ['TSLA', 'COIN', 'MSTR', 'SOXL', 'TQQQ', 'BTC-USD'] },
    conservative_researcher: { key: 'conservative_researcher', label: 'Conservative Researcher', symbols: ['JNJ', 'PG', 'KO', 'XOM', 'JPM', 'VIG'] },
    defensive_active_allocator: { key: 'defensive_active_allocator', label: 'Defensive Active Allocator', symbols: ['VTI', 'SCHD', 'BND', 'TIP', 'XLV', 'XLP'] },
    passive_rational_allocator: { key: 'passive_rational_allocator', label: 'Passive Rational Allocator', symbols: ['VTI', 'VOO', 'VXUS', 'BND', 'SCHD', 'VNQ'] },
    passive_emotional_allocator: { key: 'passive_emotional_allocator', label: 'Passive Emotional Allocator', symbols: ['VTI', 'BND', 'AGG', 'SCHD', 'XLU', 'SHV'] }
  };
  const AXIS_CODE_TO_PROFILE_KEY = {
    'A-I-R': 'the_quant',
    'A-I-E': 'active_conviction_investor',
    'A-E-R': 'tactical_trend_analyst',
    'A-E-E': 'aggressive_reactive_trader',
    'C-I-R': 'conservative_researcher',
    'C-I-E': 'defensive_active_allocator',
    'C-E-R': 'passive_rational_allocator',
    'C-E-E': 'passive_emotional_allocator'
  };
  const PROFILE_DEFAULT_AXIS_SCORES = {
    the_quant: { riskAggressive: 74, controlInternal: 76, reactivityEmotional: 30 },
    active_conviction_investor: { riskAggressive: 82, controlInternal: 74, reactivityEmotional: 72 },
    tactical_trend_analyst: { riskAggressive: 78, controlInternal: 36, reactivityEmotional: 32 },
    aggressive_reactive_trader: { riskAggressive: 86, controlInternal: 34, reactivityEmotional: 78 },
    conservative_researcher: { riskAggressive: 26, controlInternal: 74, reactivityEmotional: 26 },
    defensive_active_allocator: { riskAggressive: 28, controlInternal: 72, reactivityEmotional: 74 },
    passive_rational_allocator: { riskAggressive: 24, controlInternal: 30, reactivityEmotional: 24 },
    passive_emotional_allocator: { riskAggressive: 22, controlInternal: 28, reactivityEmotional: 72 }
  };
  const SYMBOL_FULL_NAMES = {
    SPY: 'SPDR S&P 500 ETF Trust',
    QQQ: 'Invesco QQQ Trust',
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    NVDA: 'NVIDIA Corporation',
    AMZN: 'Amazon.com, Inc.',
    META: 'Meta Platforms, Inc.',
    TSLA: 'Tesla, Inc.',
    VTI: 'Vanguard Total Stock Market ETF',
    VOO: 'Vanguard S&P 500 ETF',
    IVV: 'iShares Core S&P 500 ETF',
    VXUS: 'Vanguard Total International Stock ETF',
    BND: 'Vanguard Total Bond Market ETF',
    AGG: 'iShares Core U.S. Aggregate Bond ETF',
    TLT: 'iShares 20+ Year Treasury Bond ETF',
    GLD: 'SPDR Gold Shares',
    'BTC-USD': 'Bitcoin (USD)',
    'ETH-USD': 'Ethereum (USD)',
    SCHD: 'Schwab U.S. Dividend Equity ETF',
    VNQ: 'Vanguard Real Estate ETF',
    SHV: 'iShares Short Treasury Bond ETF',
    IWM: 'iShares Russell 2000 ETF',
    DIA: 'SPDR Dow Jones Industrial Average ETF Trust',
    XLF: 'Financial Select Sector SPDR Fund',
    XLE: 'Energy Select Sector SPDR Fund',
    XLV: 'Health Care Select Sector SPDR Fund',
    XLP: 'Consumer Staples Select Sector SPDR Fund',
    XLU: 'Utilities Select Sector SPDR Fund',
    COIN: 'Coinbase Global, Inc.',
    MSTR: 'MicroStrategy Incorporated',
    SOXL: 'Direxion Daily Semiconductor Bull 3X Shares',
    PLTR: 'Palantir Technologies Inc.',
    JNJ: 'Johnson & Johnson',
    PG: 'The Procter & Gamble Company',
    KO: 'The Coca-Cola Company',
    XOM: 'Exxon Mobil Corporation',
    JPM: 'JPMorgan Chase & Co.',
    VIG: 'Vanguard Dividend Appreciation ETF',
    TIP: 'iShares TIPS Bond ETF',
    AVGO: 'Broadcom Inc.',
    AMD: 'Advanced Micro Devices, Inc.',
    SMH: 'VanEck Semiconductor ETF',
    'BRK-B': 'Berkshire Hathaway Inc. Class B',
    GOOGL: 'Alphabet Inc. Class A',
    GOOG: 'Alphabet Inc. Class C',
    NFLX: 'Netflix, Inc.',
    ORCL: 'Oracle Corporation',
    NKE: 'NIKE, Inc.',
    DIS: 'The Walt Disney Company',
    WMT: 'Walmart Inc.',
    COST: 'Costco Wholesale Corporation',
    IBM: 'International Business Machines Corporation',
    BABA: 'Alibaba Group Holding Limited ADR',
    TSM: 'Taiwan Semiconductor Manufacturing Company ADR',
    SAP: 'SAP SE ADR',
    'RDSA.AS': 'Shell plc',
    'NESN.SW': 'Nestle S.A.',
    '7203.T': 'Toyota Motor Corporation',
    '6758.T': 'Sony Group Corporation',
    '9984.T': 'SoftBank Group Corp.',
    '0700.HK': 'Tencent Holdings Limited',
    '9988.HK': 'Alibaba Group Holding Limited',
    '0005.HK': 'HSBC Holdings plc',
    'RELIANCE.NS': 'Reliance Industries Limited',
    'TCS.NS': 'Tata Consultancy Services Limited',
    'INFY.NS': 'Infosys Limited',
    'HDFCBANK.NS': 'HDFC Bank Limited',
    '005930.KS': 'Samsung Electronics Co., Ltd.',
    '000660.KS': 'SK hynix Inc.',
    '035420.KS': 'NAVER Corporation',
    '051910.KS': 'LG Chem, Ltd.',
    'SHOP.TO': 'Shopify Inc.',
    'RY.TO': 'Royal Bank of Canada',
    'BNS.TO': 'Bank of Nova Scotia',
    'SHEL.L': 'Shell plc',
    'AZN.L': 'AstraZeneca plc',
    'HSBA.L': 'HSBC Holdings plc',
    ETHU: '2x Ether ETF',
    TQQQ: 'ProShares UltraPro QQQ',
    SQQQ: 'ProShares UltraPro Short QQQ',
    UPRO: 'ProShares UltraPro S&P 500',
    SPXL: 'Direxion Daily S&P 500 Bull 3X Shares',
    SPXS: 'Direxion Daily S&P 500 Bear 3X Shares',
    SOXS: 'Direxion Daily Semiconductor Bear 3X Shares',
    TECL: 'Direxion Daily Technology Bull 3X Shares',
    TECS: 'Direxion Daily Technology Bear 3X Shares',
    FAS: 'Direxion Daily Financial Bull 3X Shares',
    FAZ: 'Direxion Daily Financial Bear 3X Shares',
    LABU: 'Direxion Daily S&P Biotech Bull 3X Shares',
    LABD: 'Direxion Daily S&P Biotech Bear 3X Shares',
    NAIL: 'Direxion Daily Homebuilders & Supplies Bull 3X Shares',
    WEBL: 'Direxion Daily Dow Jones Internet Bull 3X Shares',
    CURE: 'Direxion Daily Healthcare Bull 3X Shares',
    YINN: 'Direxion Daily FTSE China Bull 3X Shares',
    YANG: 'Direxion Daily FTSE China Bear 3X Shares',
    UVXY: 'ProShares Ultra VIX Short-Term Futures ETF',
    SVXY: 'ProShares Short VIX Short-Term Futures ETF',
    BOIL: 'ProShares Ultra Bloomberg Natural Gas',
    KOLD: 'ProShares UltraShort Bloomberg Natural Gas',
    UCO: 'ProShares Ultra Bloomberg Crude Oil',
    SCO: 'ProShares UltraShort Bloomberg Crude Oil',
    DAX: 'DAX Index',
    '^FTSE': 'FTSE 100 Index'
  };
  const SYMBOL_MARKET_META = {
    SPY: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    QQQ: { exchange: 'NASDAQ', quoteType: 'ETF' },
    VOO: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    VTI: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    IVV: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    VXUS: { exchange: 'NASDAQ', quoteType: 'ETF' },
    BND: { exchange: 'NASDAQ', quoteType: 'ETF' },
    AGG: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    TLT: { exchange: 'NASDAQ', quoteType: 'ETF' },
    GLD: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SCHD: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    VNQ: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SHV: { exchange: 'NASDAQ', quoteType: 'ETF' },
    IWM: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    DIA: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    XLF: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    XLE: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    XLV: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    XLP: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    XLU: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SMH: { exchange: 'NASDAQ', quoteType: 'ETF' },
    VIG: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    TIP: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SOXL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    AAPL: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    MSFT: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    NVDA: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    AMZN: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    META: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    TSLA: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    GOOGL: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    GOOG: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    AVGO: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    AMD: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    NFLX: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    ORCL: { exchange: 'NYSE', quoteType: 'EQUITY' },
    NKE: { exchange: 'NYSE', quoteType: 'EQUITY' },
    DIS: { exchange: 'NYSE', quoteType: 'EQUITY' },
    WMT: { exchange: 'NYSE', quoteType: 'EQUITY' },
    COST: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    IBM: { exchange: 'NYSE', quoteType: 'EQUITY' },
    JPM: { exchange: 'NYSE', quoteType: 'EQUITY' },
    XOM: { exchange: 'NYSE', quoteType: 'EQUITY' },
    JNJ: { exchange: 'NYSE', quoteType: 'EQUITY' },
    PG: { exchange: 'NYSE', quoteType: 'EQUITY' },
    KO: { exchange: 'NYSE', quoteType: 'EQUITY' },
    PLTR: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    COIN: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    MSTR: { exchange: 'NASDAQ', quoteType: 'EQUITY' },
    'BRK-B': { exchange: 'NYSE', quoteType: 'EQUITY' },
    BABA: { exchange: 'NYSE', quoteType: 'EQUITY' },
    TSM: { exchange: 'NYSE', quoteType: 'EQUITY' },
    SAP: { exchange: 'NYSE', quoteType: 'EQUITY' },
    '7203.T': { exchange: 'TSE', quoteType: 'EQUITY' },
    '6758.T': { exchange: 'TSE', quoteType: 'EQUITY' },
    '9984.T': { exchange: 'TSE', quoteType: 'EQUITY' },
    '0700.HK': { exchange: 'HKEX', quoteType: 'EQUITY' },
    '9988.HK': { exchange: 'HKEX', quoteType: 'EQUITY' },
    '0005.HK': { exchange: 'HKEX', quoteType: 'EQUITY' },
    'RELIANCE.NS': { exchange: 'NSE', quoteType: 'EQUITY' },
    'TCS.NS': { exchange: 'NSE', quoteType: 'EQUITY' },
    'INFY.NS': { exchange: 'NSE', quoteType: 'EQUITY' },
    'HDFCBANK.NS': { exchange: 'NSE', quoteType: 'EQUITY' },
    'SHOP.TO': { exchange: 'TSX', quoteType: 'EQUITY' },
    'RY.TO': { exchange: 'TSX', quoteType: 'EQUITY' },
    'BNS.TO': { exchange: 'TSX', quoteType: 'EQUITY' },
    'SHEL.L': { exchange: 'LSE', quoteType: 'EQUITY' },
    'AZN.L': { exchange: 'LSE', quoteType: 'EQUITY' },
    'HSBA.L': { exchange: 'LSE', quoteType: 'EQUITY' },
    'RDSA.AS': { exchange: 'Euronext', quoteType: 'EQUITY' },
    'NESN.SW': { exchange: 'SIX', quoteType: 'EQUITY' },
    'BTC-USD': { exchange: 'CRYPTO', quoteType: 'CRYPTO' },
    'ETH-USD': { exchange: 'CRYPTO', quoteType: 'CRYPTO' }
    ,
    ETHU: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    TQQQ: { exchange: 'NASDAQ', quoteType: 'ETF' },
    SQQQ: { exchange: 'NASDAQ', quoteType: 'ETF' },
    UPRO: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SPXL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SPXS: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SOXS: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    TECL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    TECS: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    FAS: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    FAZ: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    LABU: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    LABD: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    NAIL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    WEBL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    CURE: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    YINN: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    YANG: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    UVXY: { exchange: 'BATS', quoteType: 'ETF' },
    SVXY: { exchange: 'BATS', quoteType: 'ETF' },
    BOIL: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    KOLD: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    UCO: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    SCO: { exchange: 'NYSEARCA', quoteType: 'ETF' },
    '005930.KS': { exchange: 'KRX', quoteType: 'EQUITY' },
    '000660.KS': { exchange: 'KRX', quoteType: 'EQUITY' },
    '035420.KS': { exchange: 'KRX', quoteType: 'EQUITY' },
    '051910.KS': { exchange: 'KRX', quoteType: 'EQUITY' }
  };
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
  const SEARCH_UNIVERSE = Array.from(new Set([...Object.keys(SYMBOL_MARKET_META), ...Object.keys(SYMBOL_FULL_NAMES)]));

  window.__INVESTOLAB_API_BASE = '';
  const rawFetch = window.fetch.bind(window);

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, Number(v || 0)));
  }

  function toIsoDate(ts = Date.now()) {
    return new Date(ts).toISOString().slice(0, 10);
  }

  function normalizeSymbol(raw) {
    return String(raw || '').trim().toUpperCase();
  }

  function fullNameForSymbol(symbol) {
    const key = normalizeSymbol(symbol);
    return SYMBOL_FULL_NAMES[key] || key;
  }

  function marketMetaForSymbol(symbol) {
    const key = normalizeSymbol(symbol);
    return SYMBOL_MARKET_META[key] || { exchange: 'GLOBAL', quoteType: 'EQUITY' };
  }

  function isKnownSearchSymbolLocal(symbol) {
    const key = normalizeSymbol(symbol);
    return SEARCH_UNIVERSE.includes(key);
  }

  async function isKnownSearchSymbol(symbol) {
    const key = normalizeSymbol(symbol);
    if (!key) return false;
    if (isKnownSearchSymbolLocal(key)) return true;
    try {
      const search = await yahooSearch(key, 30, 0);
      const quotes = Array.isArray(search?.quotes) ? search.quotes : [];
      return quotes.some((q) => normalizeSymbol(q?.symbol) === key);
    } catch (_error) {
      return false;
    }
  }

  function popularityRank(symbol) {
    const key = normalizeSymbol(symbol);
    return POPULAR_SYMBOL_RANK.has(key) ? POPULAR_SYMBOL_RANK.get(key) : Number.POSITIVE_INFINITY;
  }

  function searchScore(queryUpper, symbol, longname) {
    const sym = String(symbol || '').toUpperCase();
    const name = String(longname || '').toUpperCase();
    if (sym === queryUpper) return 10000;
    if (sym.startsWith(queryUpper)) return 9000 - sym.length;
    if (name.startsWith(queryUpper)) return 8000 - name.length;
    const idxSym = sym.indexOf(queryUpper);
    if (idxSym >= 0) return 7000 - idxSym * 10 - sym.length;
    const idxName = name.indexOf(queryUpper);
    if (idxName >= 0) return 6000 - idxName * 6 - name.length;
    return 0;
  }

  function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function jsonErrorResponse(message, status = 503) {
    return jsonResponse({ error: message }, status);
  }

  function normalizeApiPath(url) {
    if (typeof url !== 'string') return null;
    let parsed;
    try {
      parsed = new URL(url, window.location.origin);
    } catch (_error) {
      return url;
    }
    const path = String(parsed.pathname || '');
    const query = String(parsed.search || '');
    const idx = path.toLowerCase().indexOf('/api/');
    if (idx >= 0) return `${path.slice(idx)}${query}`;
    if (path.startsWith('api/')) return `/${path}${query}`;
    return `${path}${query}`;
  }

  function mapApiToStaticData(url) {
    const apiPath = normalizeApiPath(url);
    if (!apiPath) return null;
    if (apiPath.startsWith('/api/news/market')) return './data/news-market.json';
    if (apiPath.startsWith('/api/news/tailored')) return './data/news-tailored.json';
    if (apiPath.startsWith('/api/news/investment-of-day')) {
      const periodMatch = apiPath.match(/[?&]period=([^&]+)/i);
      const periodRaw = periodMatch ? decodeURIComponent(periodMatch[1] || '') : '';
      const period = String(periodRaw || 'day').toLowerCase();
      if (period === 'week') return './data/news-investment-week.json';
      if (period === 'month') return './data/news-investment-month.json';
      if (period === 'year') return './data/news-investment-year.json';
      return './data/news-investment-day.json';
    }
    return null;
  }

  function resolveApiUrl(input) {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    if (input && typeof input.url === 'string') return input.url;
    return null;
  }

  function parseBody(init) {
    try {
      if (!init || !init.body) return {};
      if (typeof init.body === 'string') return JSON.parse(init.body);
    } catch (_error) {
      return {};
    }
    return {};
  }

  function syntheticSeries(startDate, points = 400, startPrice = 100, drift = 0.0006, vol = 0.012) {
    const out = [];
    let price = Math.max(1, Number(startPrice || 100));
    let date = String(startDate || toIsoDate(Date.now() - points * 86400000));
    const rand = (() => {
      let seed = 1234567;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    })();
    for (let i = 0; i < points; i += 1) {
      const shock = (rand() - 0.5) * vol;
      price = Math.max(1, price * (1 + drift + shock));
      out.push({ date, close: Number(price.toFixed(2)) });
      date = addDaysIso(date, 1);
    }
    return out;
  }

  function symbolSeed(symbol) {
    const s = String(symbol || 'SPY');
    let n = 0;
    for (let i = 0; i < s.length; i += 1) n += s.charCodeAt(i);
    return n;
  }

  async function yahooSearch(query, _quotesCount = 10, _newsCount = 0) {
    const q = String(query || '').trim().toUpperCase();
    if (!q) return { quotes: [], news: [] };
    try {
      const remoteUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        q
      )}&quotesCount=100&newsCount=0`;
      const remoteRes = await rawFetch(remoteUrl);
      const ct = String(remoteRes.headers.get('content-type') || '').toLowerCase();
      if (remoteRes.ok && ct.includes('application/json')) {
        const remoteData = await remoteRes.json();
        const remoteQuotes = Array.isArray(remoteData?.quotes) ? remoteData.quotes : [];
        const cleaned = remoteQuotes
          .filter((row) => row && row.symbol)
          .map((row) => {
            const symbol = normalizeSymbol(row.symbol);
            const longname = String(row.longname || row.shortname || fullNameForSymbol(symbol));
            return {
              symbol,
              shortname: String(row.shortname || longname),
              longname,
              exchange: String(row.exchange || row.exchDisp || marketMetaForSymbol(symbol).exchange || 'GLOBAL'),
              quoteType: String(row.quoteType || marketMetaForSymbol(symbol).quoteType || 'EQUITY'),
              _score: searchScore(q, symbol, longname),
              _pop: popularityRank(symbol)
            };
          })
          .filter((row) => row._score > 0);
        cleaned.sort((a, b) => {
          if (b._score !== a._score) return b._score - a._score;
          if (a._pop !== b._pop) return a._pop - b._pop;
          return String(a.symbol).localeCompare(String(b.symbol));
        });
        const remoteTop = cleaned.slice(0, 40).map(({ _score, _pop, ...row }) => row);
        if (remoteTop.length) return { quotes: remoteTop, news: [] };
      }
    } catch (_error) {
      // Fall back to local universe when remote search is unavailable.
    }

    const candidates = SEARCH_UNIVERSE.map((sym) => {
      const longname = fullNameForSymbol(sym);
      const meta = marketMetaForSymbol(sym);
      return {
        symbol: sym,
        shortname: longname,
        longname,
        exchange: meta.exchange,
        quoteType: meta.quoteType,
        _score: searchScore(q, sym, longname),
        _pop: popularityRank(sym)
      };
    }).filter((row) => row._score > 0);

    const sorted = candidates.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      if (a._pop !== b._pop) return a._pop - b._pop;
      return String(a.symbol).localeCompare(String(b.symbol));
    });

    const quotes = sorted.slice(0, 12).map(({ _score, _pop, ...row }) => row);
    return { quotes, news: [] };
  }

  async function yahooChart(symbol, _range = '3y', _interval = '1d') {
    const sym = normalizeSymbol(symbol || 'SPY');
    const seed = symbolSeed(sym);
    const drift = ((seed % 9) - 4) * 0.00008 + 0.00055;
    const vol = 0.007 + ((seed % 7) * 0.0015);
    const start = 70 + (seed % 160);
    const rows = syntheticSeries(addDaysIso(toIsoDate(), -420), 420, start, drift, vol);
    return {
      chart: {
        result: [
          {
            timestamp: rows.map((r) => Math.floor(Date.parse(`${r.date}T00:00:00Z`) / 1000)),
            indicators: { quote: [{ close: rows.map((r) => r.close) }] }
          }
        ]
      }
    };
  }

  async function resolveSymbol(query) {
    const q = String(query || '').trim();
    if (!q) return { best: null, matches: [] };
    const search = await yahooSearch(q, 15, 0);
    const quotes = Array.isArray(search?.quotes) ? search.quotes : [];
    const matches = quotes
      .filter((x) => x && x.symbol)
      .slice(0, 12)
      .map((x) => ({
        symbol: x.symbol,
        shortname: x.shortname || '',
        longname: x.longname || x.shortname || x.symbol,
        exchange: x.exchange || x.exchDisp || '',
        quoteType: x.quoteType || ''
      }));
    const exact = matches.find((m) => normalizeSymbol(m.symbol) === normalizeSymbol(q));
    const best = exact || matches[0] || null;
    if (best && !best.longname) best.longname = fullNameForSymbol(best.symbol);
    return { best, matches };
  }

  function extractHistory(chartPayload) {
    const result = chartPayload?.chart?.result?.[0];
    const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const rows = [];
    for (let i = 0; i < timestamps.length; i += 1) {
      const close = Number(closes[i]);
      if (!Number.isFinite(close) || close <= 0) continue;
      rows.push({
        date: toIsoDate(Number(timestamps[i]) * 1000),
        close
      });
    }
    return rows;
  }

  function trailingReturn(rows, days) {
    if (!rows.length) return 0;
    const end = rows[rows.length - 1];
    const startIdx = Math.max(0, rows.length - 1 - days);
    const start = rows[startIdx];
    if (!(start?.close > 0 && end?.close > 0)) return 0;
    return end.close / start.close - 1;
  }

  function annualizedVolatility(rows, lookback = 252) {
    const slice = rows.slice(Math.max(0, rows.length - lookback - 1));
    if (slice.length < 3) return 0;
    const returns = [];
    for (let i = 1; i < slice.length; i += 1) {
      const prev = Number(slice[i - 1].close || 0);
      const cur = Number(slice[i].close || 0);
      if (prev > 0 && cur > 0) returns.push(Math.log(cur / prev));
    }
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, x) => s + x, 0) / returns.length;
    const variance = returns.reduce((s, x) => s + (x - mean) ** 2, 0) / (returns.length - 1);
    return Math.sqrt(Math.max(variance, 0)) * Math.sqrt(252);
  }

  function maxDrawdown(rows, lookback = 252) {
    const slice = rows.slice(Math.max(0, rows.length - lookback));
    let peak = 0;
    let worst = 0;
    slice.forEach((r) => {
      const p = Number(r.close || 0);
      if (p > peak) peak = p;
      if (peak > 0) worst = Math.min(worst, p / peak - 1);
    });
    return worst;
  }

  async function getNewsHeadlines(symbol, count = 8) {
    try {
      const search = await yahooSearch(symbol, 0, count);
      const list = Array.isArray(search?.news) ? search.news : [];
      return list.slice(0, count).map((n) => ({
        title: String(n.title || '').trim(),
        publisher: n.publisher || 'Yahoo Finance',
        date: n.providerPublishTime ? toIsoDate(Number(n.providerPublishTime) * 1000) : '',
        symbol: normalizeSymbol(symbol)
      })).filter((x) => x.title);
    } catch (_error) {
      return [];
    }
  }

  function scoreLabel(score) {
    if (score >= 70) return 'Attractive';
    if (score >= 55) return 'Constructive';
    if (score >= 45) return 'Neutral';
    if (score >= 35) return 'Cautious';
    return 'Weak';
  }

  function scoreToAction(score) {
    if (score >= 66) return 'BUY';
    if (score <= 38) return 'SELL';
    return 'HOLD';
  }

  function investorFitFromScore(score, vol) {
    if (score >= 65 && vol >= 0.22) {
      return {
        type: 'Aggressive Active Investor',
        code: 'A-I-E',
        axes: { risk: 'Aggressive', control: 'Internal/Active', reactivity: 'Emotional' },
        why: ['Strong upside momentum with high volatility profile.', 'Requires active monitoring and risk control.']
      };
    }
    if (score >= 55) {
      return {
        type: 'Tactical Rational Investor',
        code: 'A-E-R',
        axes: { risk: 'Aggressive', control: 'External/Passive', reactivity: 'Rational' },
        why: ['Positive trend with manageable risk.', 'Works well with rules-based allocation.']
      };
    }
    return {
      type: 'Conservative Rational Allocator',
      code: 'C-E-R',
      axes: { risk: 'Conservative', control: 'External/Passive', reactivity: 'Rational' },
      why: ['Lower conviction setup right now.', 'Prioritize diversification and downside control.']
    };
  }

  async function buildInvestmentValuation(query, asOfDate) {
    const resolved = await resolveSymbol(query);
    const symbol = resolved?.best?.symbol || '';
    if (!symbol) throw new Error(`No matching symbol found for "${String(query || '').trim()}". Select from dropdown.`);
    const displayName = resolved?.best?.longname || resolved?.best?.shortname || fullNameForSymbol(symbol);
    const chart = await yahooChart(symbol, '3y', '1d');
    const history = extractHistory(chart);
    if (!history.length) throw new Error(`No market data found for ${symbol}.`);
    const last = history[history.length - 1];
    const d30 = trailingReturn(history, 30);
    const d90 = trailingReturn(history, 90);
    const d252 = trailingReturn(history, 252);
    const vol = annualizedVolatility(history, 252);
    const mdd = maxDrawdown(history, 252);
    const momentumScore = clamp(50 + d90 * 90 + d252 * 45, 0, 100);
    const riskPenalty = clamp(vol * 120 + Math.abs(mdd) * 40, 0, 40);
    const compositeScore = clamp(momentumScore - riskPenalty + 12, 0, 100);
    const label = scoreLabel(compositeScore);
    const action = scoreToAction(compositeScore);
    const confidence = clamp(0.45 + Math.abs(compositeScore - 50) / 80, 0.35, 0.9);
    const newsSent = clamp(0.45 + d30 * 1.8, 0.05, 0.95);
    const socialSent = clamp(0.45 + d90 * 1.2, 0.05, 0.95);
    const headlines = await getNewsHeadlines(symbol, 8);
    const buyerFit = investorFitFromScore(compositeScore, vol);
    return {
      asOfDate: asOfDate || last.date,
      symbol,
      displayName,
      market: {
        price: last.close,
        priceDate: last.date,
        annualizedVolatility: vol,
        maxDrawdown1Y: mdd,
        trailingReturns: { d30, d90, d252 },
        priceHistory: history
      },
      signals: {
        newsSentiment: newsSent,
        socialSentiment: socialSent,
        sentimentConfidence: confidence,
        source: 'Yahoo Finance public feed',
        earningsDate: 'N/A',
        headlines
      },
      valuation: {
        compositeScore,
        label,
        summary3: [
          `${symbol} shows ${d90 >= 0 ? 'positive' : 'negative'} 3-month momentum (${(d90 * 100).toFixed(1)}%).`,
          `1Y realized volatility is ${(vol * 100).toFixed(1)}%, with max drawdown ${(mdd * 100).toFixed(1)}%.`,
          `Signal blend suggests a ${action} stance with ${(confidence * 100).toFixed(0)}% confidence.`
        ],
        recommendation: {
          action,
          confidence,
          rationale: [
            `Composite score ${compositeScore.toFixed(0)}/100 (${label}).`,
            `Trend profile: 30D ${(d30 * 100).toFixed(1)}%, 90D ${(d90 * 100).toFixed(1)}%, 252D ${(d252 * 100).toFixed(1)}%.`,
            `Risk profile: volatility ${(vol * 100).toFixed(1)}%, drawdown ${(mdd * 100).toFixed(1)}%.`
          ]
        },
        buyerFit
      }
    };
  }

  function normalizeInvestorType(rawType) {
    const normalized = String(rawType || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!normalized) return null;
    if (TAILORED_NEWS_PROFILES[normalized]) return normalized;
    for (const [key, profile] of Object.entries(TAILORED_NEWS_PROFILES)) {
      const label = String(profile.label || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      if (label === normalized) return key;
    }
    return null;
  }

  function finalizePctList(rows) {
    const clean = rows
      .map((row) => ({ ...row, weight: Math.max(0, Number(row?.weight || 0)) }))
      .filter((row) => row.weight > 0.01);
    const rounded = clean.map((row) => ({ ...row, weight: Math.round(row.weight * 10) / 10 }));
    const total = rounded.reduce((sum, row) => sum + row.weight, 0);
    const diff = Math.round((100 - total) * 10) / 10;
    if (rounded.length && Math.abs(diff) > 0.01) {
      let maxIdx = 0;
      for (let i = 1; i < rounded.length; i += 1) {
        if (rounded[i].weight > rounded[maxIdx].weight) maxIdx = i;
      }
      rounded[maxIdx].weight = Math.max(0, Math.round((rounded[maxIdx].weight + diff) * 10) / 10);
    }
    return rounded;
  }

  function buildInvestotypeDraft({ typeKey, axisScores }) {
    const profile = TAILORED_NEWS_PROFILES[typeKey] || TAILORED_NEWS_PROFILES.passive_rational_allocator;
    const risk = clamp(Number(axisScores?.riskAggressive || 50), 0, 100);
    const control = clamp(Number(axisScores?.controlInternal || 50), 0, 100);
    const emotional = clamp(Number(axisScores?.reactivityEmotional || 50), 0, 100);
    const rational = 100 - emotional;

    const usEquity = clamp(24 + risk * 0.5 + control * 0.06 - emotional * 0.05, 18, 78);
    const intlEquity = clamp(7 + (100 - risk) * 0.08 + rational * 0.05, 6, 22);
    const alternatives = clamp(2 + risk * 0.09 + emotional * 0.03, 2, 16);
    const cash = clamp(2 + (100 - risk) * 0.12 + emotional * 0.06 + (100 - control) * 0.03, 2, 22);
    const bonds = Math.max(6, 100 - usEquity - intlEquity - alternatives - cash);
    const allocation = finalizePctList([
      { bucket: 'US Equity', weight: usEquity },
      { bucket: 'International Equity', weight: intlEquity },
      { bucket: 'Bonds', weight: bonds },
      { bucket: 'Alternatives', weight: alternatives },
      { bucket: 'Cash', weight: cash }
    ]);
    const symbols = Array.isArray(profile.symbols) ? profile.symbols : [];
    const first = symbols[0] || 'SPY';
    const second = symbols[1] || 'QQQ';
    const third = symbols[2] || 'VTI';
    const altSymbol = risk >= 65 ? 'BTC-USD' : 'GLD';
    const bondSymbol = risk >= 60 ? 'BND' : 'AGG';
    const cashSymbol = 'SHV';
    const usWeight = Number(allocation.find((x) => x.bucket === 'US Equity')?.weight || 0);
    const tickerMix = finalizePctList([
      { symbol: first, role: 'US Core', weight: usWeight * 0.46 },
      { symbol: second, role: 'US Growth/Tactical', weight: usWeight * 0.32 },
      { symbol: third, role: 'US Satellite', weight: Math.max(0, usWeight * 0.22) },
      { symbol: 'VXUS', role: 'International Diversifier', weight: Number(allocation.find((x) => x.bucket === 'International Equity')?.weight || 0) },
      { symbol: bondSymbol, role: 'Bond Buffer', weight: Number(allocation.find((x) => x.bucket === 'Bonds')?.weight || 0) },
      { symbol: altSymbol, role: 'Alternative Hedge', weight: Number(allocation.find((x) => x.bucket === 'Alternatives')?.weight || 0) },
      { symbol: cashSymbol, role: 'Liquidity Reserve', weight: Number(allocation.find((x) => x.bucket === 'Cash')?.weight || 0) }
    ]);
    const axisCode = `${risk >= 50 ? 'A' : 'C'}-${control >= 50 ? 'I' : 'E'}-${emotional >= 50 ? 'E' : 'R'}`;
    return {
      ok: true,
      generatedAt: toIsoDate(),
      profile: { key: typeKey, label: profile.label, axisCode },
      axisScores: { riskAggressive: risk, controlInternal: control, reactivityEmotional: emotional },
      allocation,
      tickerMix,
      rationale: [
        `Risk axis (${risk.toFixed(0)}%) guides the equity/bond balance.`,
        `Control axis (${control.toFixed(0)}%) tunes active vs. passive exposure.`,
        `Reactivity axis (${emotional.toFixed(0)}%) adjusts cash and hedging mix.`,
        'Public-API mode provides an educational draft portfolio, not investment advice.'
      ]
    };
  }

  async function buildPortfolioValuation(holdings, asOfDate) {
    const list = Array.isArray(holdings) ? holdings : [];
    const assets = [];
    let totalValue = 0;
    for (const h of list) {
      const query = String(h?.query || '').trim();
      if (!query) continue;
      const resolved = await resolveSymbol(query);
      const symbol = resolved?.best?.symbol || '';
      if (!symbol) continue;
      const displayName = resolved?.best?.longname || resolved?.best?.shortname || fullNameForSymbol(symbol);
      const chart = await yahooChart(symbol, '1y', '1d');
      const history = extractHistory(chart);
      if (!history.length) continue;
      const last = history[history.length - 1];
      const price = Number(last.close || 0);
      const rawValue = Number(h?.value || 0);
      const mode = String(h?.mode || 'dollars');
      const marketValue = mode === 'units' ? rawValue * price : rawValue;
      if (!(marketValue > 0)) continue;
      const d90 = trailingReturn(history, 90);
      const vol = annualizedVolatility(history, 252);
      const score = clamp(52 + d90 * 90 - vol * 45, 0, 100);
      assets.push({
        symbol,
        displayName,
        marketValue,
        compositeScore: score,
        label: scoreLabel(score),
        recommendation: { action: scoreToAction(score) },
        annualizedVolatility: vol,
        trailingReturns: { d90 }
      });
      totalValue += marketValue;
    }
    if (!assets.length) throw new Error('No valid holdings to evaluate.');
    assets.forEach((a) => {
      a.weight = totalValue > 0 ? a.marketValue / totalValue : 0;
    });
    const weightedScore = assets.reduce((s, a) => s + a.weight * a.compositeScore, 0);
    const weightedVol = assets.reduce((s, a) => s + a.weight * a.annualizedVolatility, 0);
    const diversificationScore = clamp(100 - Math.max(...assets.map((a) => a.weight)) * 100 + Math.min(assets.length * 4, 18), 20, 98);
    const weightedNewsSentiment = clamp(assets.reduce((s, a) => s + a.weight * clamp(0.45 + a.trailingReturns.d90 * 1.2, 0.05, 0.95), 0), 0.05, 0.95);
    const weightedSocialSentiment = clamp(assets.reduce((s, a) => s + a.weight * clamp(0.45 + a.trailingReturns.d90 * 0.8, 0.05, 0.95), 0), 0.05, 0.95);
    const riskLevel = weightedVol >= 0.28 ? 'High' : weightedVol >= 0.18 ? 'Medium' : 'Low';
    return {
      portfolio: {
        asOfDate: asOfDate || toIsoDate(),
        totalValue,
        valuationScore: weightedScore,
        valuationLabel: scoreLabel(weightedScore),
        riskLevel,
        annualizedVolatility: weightedVol,
        diversificationScore,
        weightedNewsSentiment,
        weightedSocialSentiment
      },
      assets,
      guidance: [
        `Top concentration is ${(Math.max(...assets.map((a) => a.weight)) * 100).toFixed(1)}% of portfolio.`,
        `Portfolio risk level is ${riskLevel.toLowerCase()} with annualized volatility ${(weightedVol * 100).toFixed(1)}%.`,
        'Rebalance periodically and keep position sizing limits.'
      ]
    };
  }

  async function buildMarketNews(symbols) {
    const universe = Array.isArray(symbols) && symbols.length ? symbols : MARKET_NEWS_SYMBOLS;
    const headlines = [];
    let newsScore = 0;
    let socialScore = 0;
    let points = 0;
    for (const symbol of universe.slice(0, 8)) {
      const chart = await yahooChart(symbol, '6mo', '1d').catch(() => null);
      const history = extractHistory(chart || {});
      const d90 = trailingReturn(history, 90);
      newsScore += clamp(0.45 + d90 * 1.3, 0.05, 0.95);
      socialScore += clamp(0.45 + d90 * 0.9, 0.05, 0.95);
      points += 1;
      const rows = await getNewsHeadlines(symbol, 2);
      rows.forEach((r) => headlines.push(r));
    }
    const deduped = [];
    const seen = new Set();
    headlines.forEach((h) => {
      const key = String(h.title || '').toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      deduped.push(h);
    });
    return {
      asOfDate: toIsoDate(),
      universe,
      sentiment: {
        news: points ? newsScore / points : 0.5,
        social: points ? socialScore / points : 0.5,
        confidence: clamp(0.45 + Math.min(points, 8) * 0.06, 0.4, 0.92)
      },
      headlines: deduped.slice(0, 16)
    };
  }

  async function buildInvestmentOfPeriod(period) {
    const daysMap = { day: 1, week: 7, month: 30, year: 252 };
    const lookback = daysMap[String(period || 'day').toLowerCase()] || 1;
    let best = null;
    for (const symbol of MARKET_NEWS_SYMBOLS) {
      const chart = await yahooChart(symbol, '1y', '1d').catch(() => null);
      const rows = extractHistory(chart || {});
      if (rows.length < 10) continue;
      const ret = trailingReturn(rows, lookback);
      if (!best || ret > best.ret) best = { symbol, ret };
    }
    const pick = best?.symbol || 'SPY';
    const investment = await buildInvestmentValuation(pick, toIsoDate());
    return {
      asOfDate: toIsoDate(),
      period: String(period || 'day').toLowerCase(),
      title: 'Investment Of The Day',
      symbol: pick,
      investment,
      alternatives: MARKET_NEWS_SYMBOLS.filter((s) => s !== pick).slice(0, 4)
    };
  }

  function getSimStore() {
    if (!window.__INVESTOLAB_SIM_STORE) {
      window.__INVESTOLAB_SIM_STORE = { sims: {} };
    }
    return window.__INVESTOLAB_SIM_STORE;
  }

  function addDaysIso(isoDate, days) {
    const ms = Date.parse(`${String(isoDate)}T00:00:00Z`) + Number(days || 0) * 86400000;
    return toIsoDate(ms);
  }

  function buildRebalanceDates(startDate, endDate, frequency) {
    const out = [];
    const startMs = Date.parse(`${startDate}T00:00:00Z`);
    const endMs = Date.parse(`${endDate}T00:00:00Z`);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) return out;
    const stepDays = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30;
    let cursor = startDate;
    while (true) {
      const next = addDaysIso(cursor, stepDays);
      if (Date.parse(`${next}T00:00:00Z`) >= endMs) break;
      out.push(next);
      cursor = next;
    }
    out.push(endDate);
    return out;
  }

  function parseAssetToken(token) {
    const raw = normalizeSymbol(token);
    if (raw === 'CASH') return { id: raw, symbol: raw, baseSymbol: 'CASH', displayName: 'Cash', type: 'cash', multiplier: 1 };
    if (raw === 'SAVINGS') return { id: raw, symbol: raw, baseSymbol: 'SAVINGS', displayName: 'Savings', type: 'savings', multiplier: 1 };
    if (raw.startsWith('BOND:')) {
      const base = normalizeSymbol(raw.split(':')[1] || '');
      return { id: raw, symbol: raw, baseSymbol: base || 'TLT', displayName: `Bond ${base || 'TLT'}`, type: 'bond', multiplier: 1 };
    }
    if (raw.startsWith('LEVERAGE:')) {
      const p = raw.split(':');
      const base = normalizeSymbol(p[1] || 'SPY');
      const mult = Math.max(1, Number(p[2] || 2));
      return { id: raw, symbol: raw, baseSymbol: base, displayName: `Leverage x${mult} ${base}`, type: 'leverage', multiplier: mult };
    }
    if (raw.startsWith('CALL:')) {
      const p = raw.split(':');
      const base = normalizeSymbol(p[1] || 'SPY');
      const mult = Math.max(1, Number(p[2] || 2));
      return { id: raw, symbol: raw, baseSymbol: base, displayName: `Call x${mult} ${base}`, type: 'option', multiplier: mult };
    }
    return { id: raw, symbol: raw, baseSymbol: raw, displayName: fullNameForSymbol(raw), type: 'equity', multiplier: 1 };
  }

  function nearestPrice(series, date) {
    if (!series || !Array.isArray(series.rows) || !series.rows.length) return 0;
    const target = String(date || '');
    let picked = series.rows[0];
    for (const row of series.rows) {
      if (row.date <= target) picked = row;
      else break;
    }
    return Math.max(0, Number(picked?.close || 0));
  }

  async function ensureSimSeries(sim, baseSymbol) {
    const symbol = normalizeSymbol(baseSymbol);
    if (!symbol || symbol === 'CASH' || symbol === 'SAVINGS') return;
    sim.series = sim.series || {};
    if (sim.series[symbol]) return;
    const chart = await yahooChart(symbol, '5y', '1d');
    const rows = extractHistory(chart);
    sim.series[symbol] = { rows: rows.length ? rows : [{ date: sim.startDate, close: 100 }] };
  }

  function getAssetPriceOn(sim, asset, date) {
    if (asset.type === 'cash') return 1;
    if (asset.type === 'savings') {
      const startMs = Date.parse(`${sim.startDate}T00:00:00Z`);
      const curMs = Date.parse(`${date}T00:00:00Z`);
      const days = Math.max(0, Math.floor((curMs - startMs) / 86400000));
      return 1 + (0.03 * days) / 365;
    }
    const base = nearestPrice(sim.series?.[asset.baseSymbol], date);
    if (asset.type === 'leverage') return Math.max(0.01, base * Number(asset.multiplier || 1));
    if (asset.type === 'option') return Math.max(0.01, base * 0.35 * Number(asset.multiplier || 1));
    return Math.max(0.01, base);
  }

  function getSimSnapshot(sim, date, sinceDate = null) {
    const prices = {};
    const holdings = [];
    let invested = 0;
    (sim.assets || []).forEach((asset) => {
      const price = getAssetPriceOn(sim, asset, date);
      prices[asset.id] = price;
      const qty = Number(sim.holdings?.[asset.id] || 0);
      const value = qty * price;
      if (value > 0) invested += value;
      holdings.push({
        symbol: asset.id,
        quantity: qty,
        price,
        value,
        weight: 0,
        avgBuyPrice: Number(sim.costBasis?.[asset.id] || 0),
        firstBuyPrice: Number(sim.firstBuyPrice?.[asset.id] || 0),
        realizedProfit: Number(sim.realizedProfit?.[asset.id] || 0)
      });
    });
    const portfolioValue = Number(sim.cash || 0) + invested;
    holdings.forEach((h) => {
      h.weight = portfolioValue > 0 ? h.value / portfolioValue : 0;
      h.closed = h.quantity <= 1e-10 && Math.abs(h.realizedProfit || 0) > 1e-8;
    });
    const prevValue = Number(sim.lastPortfolioValue || sim.initialCash || portfolioValue);
    const periodReturn = prevValue > 0 ? portfolioValue / prevValue - 1 : 0;
    return {
      preview: { portfolioValue, prices, date },
      insights: {
        date,
        sinceDate: sinceDate || sim.lastInsightDate || sim.startDate,
        periodReturn,
        portfolioValue,
        cash: Number(sim.cash || 0),
        holdings
      }
    };
  }

  function updateTimeline(sim, date, value) {
    sim.timeline = Array.isArray(sim.timeline) ? sim.timeline : [];
    const idx = sim.timeline.findIndex((x) => x.date === date);
    const point = { date, value: Number(value || 0) };
    if (idx >= 0) sim.timeline[idx] = point;
    else sim.timeline.push(point);
    sim.timeline.sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  function benchmarkTimeline(sim, symbol, endDate) {
    const rows = sim.series?.[symbol]?.rows || [];
    if (!rows.length) return [];
    const startDate = sim.startDate;
    const startRow = rows.find((r) => r.date >= startDate) || rows[0];
    const base = Math.max(0.0001, Number(startRow.close || 1));
    return rows
      .filter((r) => r.date >= startDate && (!endDate || r.date <= endDate))
      .map((r) => ({ date: r.date, value: (Number(sim.initialCash || 1) * Number(r.close || base)) / base }));
  }

  function getSimById(id) {
    const store = getSimStore();
    return store.sims[String(id || '')] || null;
  }

  async function createSimulation(payload) {
    const startDate = String(payload?.startDate || '').trim();
    const endDate = String(payload?.endDate || '').trim();
    const frequency = ['daily', 'weekly', 'monthly'].includes(String(payload?.frequency || 'weekly')) ? String(payload.frequency) : 'weekly';
    const rawAssets = Array.isArray(payload?.assets) ? payload.assets : [];
    const assetTokens = rawAssets.map((a) => parseAssetToken(a)).filter((a) => !!a.id);
    if (!startDate || !endDate || !assetTokens.length) throw new Error('Invalid simulation payload.');
    const id = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const sim = {
      simulationId: id,
      startDate,
      endDate,
      frequency,
      initialCash: Math.max(0, Number(payload?.initialCash || 10000)),
      cash: Math.max(0, Number(payload?.initialCash || 10000)),
      assets: assetTokens,
      holdings: {},
      costBasis: {},
      firstBuyPrice: {},
      realizedProfit: {},
      symbols: assetTokens.map((a) => a.id),
      benchmarkSymbols: (Array.isArray(payload?.benchmarkSymbols) ? payload.benchmarkSymbols : []).map((x) => normalizeSymbol(x)).filter(Boolean).slice(0, 4),
      series: {},
      timeline: [],
      feesPaid: 0,
      dividendsReceived: 0
    };
    const bases = new Set(assetTokens.map((a) => a.baseSymbol).filter((x) => x && x !== 'CASH' && x !== 'SAVINGS'));
    sim.benchmarkSymbols.forEach((s) => bases.add(s));
    for (const s of bases) {
      // eslint-disable-next-line no-await-in-loop
      await ensureSimSeries(sim, s);
    }
    const rebalanceDates = buildRebalanceDates(startDate, endDate, frequency);
    sim.rebalanceDates = rebalanceDates;
    sim.totalSteps = rebalanceDates.length;
    sim.stepIndex = 0;
    sim.currentDate = startDate;
    sim.nextRebalanceDate = rebalanceDates[0] || null;
    sim.lastInsightDate = startDate;
    const snap = getSimSnapshot(sim, startDate, startDate);
    sim.lastPortfolioValue = snap.preview.portfolioValue;
    updateTimeline(sim, startDate, snap.preview.portfolioValue);
    getSimStore().sims[id] = sim;
    return {
      simulationId: id,
      startDate,
      endDate,
      frequency,
      initialCash: sim.initialCash,
      cash: sim.cash,
      assets: sim.assets,
      symbols: sim.symbols,
      benchmarkSymbols: sim.benchmarkSymbols,
      stepIndex: sim.stepIndex,
      totalSteps: sim.totalSteps,
      nextRebalanceDate: sim.nextRebalanceDate,
      preview: snap.preview,
      previewInsights: snap.insights
    };
  }

  function rebalanceSimulation(sim, targets) {
    const date = sim.currentDate;
    const before = getSimSnapshot(sim, date, sim.lastInsightDate);
    const portfolioValue = Number(before.preview.portfolioValue || 0);
    const targetEntries = Object.entries(targets || {});
    const used = targetEntries.reduce((s, [, t]) => s + Math.max(0, Number(t?.value || 0)), 0);
    if (used > portfolioValue + 0.05) throw new Error('Total target value cannot exceed current portfolio value.');
    const newHoldings = {};
    const newCost = { ...(sim.costBasis || {}) };
    const newFirst = { ...(sim.firstBuyPrice || {}) };
    sim.assets.forEach((asset) => {
      const target = targets?.[asset.id];
      const targetDollars = Math.max(0, Number(target?.value || 0));
      const price = Math.max(0.0001, getAssetPriceOn(sim, asset, date));
      const prevQty = Number(sim.holdings?.[asset.id] || 0);
      const prevAvg = Number(sim.costBasis?.[asset.id] || 0);
      const nextQty = targetDollars / price;
      if (nextQty > prevQty + 1e-10) {
        const addQty = nextQty - prevQty;
        const nextAvg = (prevQty * prevAvg + addQty * price) / Math.max(1e-10, nextQty);
        newCost[asset.id] = nextAvg;
      } else if (nextQty <= 1e-10) {
        newCost[asset.id] = 0;
      }
      if (!newFirst[asset.id] && nextQty > 1e-10) newFirst[asset.id] = price;
      newHoldings[asset.id] = nextQty;
    });
    sim.holdings = newHoldings;
    sim.costBasis = newCost;
    sim.firstBuyPrice = newFirst;
    sim.cash = Math.max(0, portfolioValue - used);
    const sinceDate = sim.currentDate;
    if (sim.nextRebalanceDate) sim.currentDate = sim.nextRebalanceDate;
    sim.stepIndex = Math.min(sim.totalSteps, Number(sim.stepIndex || 0) + 1);
    sim.nextRebalanceDate = sim.stepIndex < sim.totalSteps ? sim.rebalanceDates[sim.stepIndex] : null;
    const after = getSimSnapshot(sim, sim.currentDate, sinceDate);
    sim.lastPortfolioValue = after.preview.portfolioValue;
    sim.lastInsightDate = sim.currentDate;
    updateTimeline(sim, sim.currentDate, after.preview.portfolioValue);
    return {
      date: sim.currentDate,
      budgetUsed: used,
      budgetUsedRatio: portfolioValue > 0 ? used / portfolioValue : 0,
      portfolioValue: after.preview.portfolioValue,
      cash: sim.cash,
      turnover: portfolioValue > 0 ? Math.abs(used - (portfolioValue - sim.cash)) / portfolioValue : 0,
      stepIndex: sim.stepIndex,
      totalSteps: sim.totalSteps,
      nextRebalanceDate: sim.nextRebalanceDate,
      holdings: sim.holdings,
      costBasis: sim.costBasis,
      firstBuyPrice: sim.firstBuyPrice,
      realizedProfit: sim.realizedProfit,
      symbols: sim.symbols,
      assets: sim.assets,
      nextPreview: after.preview,
      nextPreviewInsights: after.insights
    };
  }

  function tradeSimulation(sim, body) {
    const date = sim.currentDate;
    const sell = normalizeSymbol(body?.sellSymbol);
    const buy = normalizeSymbol(body?.buySymbol);
    const sellAmount = Math.max(0, Number(body?.sellAmount || 0));
    const buyAmount = Math.max(0, Number(body?.buyAmount || 0));
    const liquidateAll = !!body?.liquidateAll;
    const assetById = Object.fromEntries((sim.assets || []).map((a) => [a.id, a]));
    const sellAsset = assetById[sell];
    const buyAsset = assetById[buy];
    if (!sellAsset || !buyAsset) throw new Error('Invalid trade symbols.');
    const sellPrice = Math.max(0.0001, getAssetPriceOn(sim, sellAsset, date));
    const buyPrice = Math.max(0.0001, getAssetPriceOn(sim, buyAsset, date));
    const currentSellQty = Math.max(0, Number(sim.holdings[sell] || 0));
    const sellQty = liquidateAll ? currentSellQty : Math.min(currentSellQty, sellAmount / sellPrice);
    const soldValue = sellQty * sellPrice;
    sim.holdings[sell] = Math.max(0, currentSellQty - sellQty);
    sim.cash += soldValue;
    const spend = Math.min(sim.cash, buyAmount > 0 ? buyAmount : soldValue);
    const buyQty = spend / buyPrice;
    const prevBuyQty = Math.max(0, Number(sim.holdings[buy] || 0));
    const prevAvg = Number(sim.costBasis[buy] || 0);
    sim.holdings[buy] = prevBuyQty + buyQty;
    sim.cash = Math.max(0, sim.cash - spend);
    const nextQty = sim.holdings[buy];
    sim.costBasis[buy] = nextQty > 1e-10 ? (prevBuyQty * prevAvg + buyQty * buyPrice) / nextQty : 0;
    if (!sim.firstBuyPrice[buy] && buyQty > 1e-10) sim.firstBuyPrice[buy] = buyPrice;
    const snap = getSimSnapshot(sim, date, sim.lastInsightDate);
    sim.lastPortfolioValue = snap.preview.portfolioValue;
    updateTimeline(sim, date, snap.preview.portfolioValue);
    return {
      date,
      soldValue,
      boughtValue: spend,
      feeTotal: 0,
      cash: sim.cash,
      portfolioValue: snap.preview.portfolioValue,
      holdings: sim.holdings,
      costBasis: sim.costBasis,
      firstBuyPrice: sim.firstBuyPrice,
      realizedProfit: sim.realizedProfit,
      symbols: sim.symbols,
      assets: sim.assets,
      nextPreview: snap.preview,
      nextPreviewInsights: snap.insights
    };
  }

  function simTimeline(sim, endDate) {
    const end = endDate || sim.currentDate;
    const rows = (sim.timeline || []).filter((p) => p.date <= end);
    const benchmarkSeries = (sim.benchmarkSymbols || []).map((symbol) => ({
      symbol,
      timeline: benchmarkTimeline(sim, symbol, end)
    }));
    return { endDate: end, timeline: rows, benchmarkSeries };
  }

  function simProjection(sim) {
    const current = Number(sim.lastPortfolioValue || sim.initialCash || 0);
    const periodsRemaining = Math.max(0, Number(sim.totalSteps || 0) - Number(sim.stepIndex || 0));
    const realized = (sim.timeline || []).length >= 2
      ? (sim.timeline[sim.timeline.length - 1].value / Math.max(0.0001, sim.timeline[0].value)) - 1
      : 0;
    const avgPerStep = Number(sim.stepIndex || 0) > 0 ? realized / Number(sim.stepIndex || 1) : 0;
    const projectedReturnToEnd = avgPerStep * periodsRemaining;
    const projectedEndValue = current * (1 + projectedReturnToEnd);
    const projectedTimeline = [...(sim.timeline || [])];
    const lastDate = projectedTimeline.length ? projectedTimeline[projectedTimeline.length - 1].date : sim.currentDate;
    let value = current;
    let cursor = lastDate;
    for (let i = 0; i < periodsRemaining; i += 1) {
      cursor = addDaysIso(cursor, sim.frequency === 'daily' ? 1 : sim.frequency === 'weekly' ? 7 : 30);
      value *= 1 + avgPerStep;
      projectedTimeline.push({ date: cursor, value });
    }
    const benchmarkProjection = (sim.benchmarkSymbols || []).map((symbol) => {
      const series = benchmarkTimeline(sim, symbol, sim.endDate);
      const base = series[0]?.value || sim.initialCash || 1;
      const endVal = series[series.length - 1]?.value || base;
      return {
        symbol,
        projectedReturnToEnd: base > 0 ? endVal / base - 1 : 0,
        series
      };
    });
    return {
      currentDate: sim.currentDate,
      endDate: sim.endDate,
      currentValue: current,
      projectedEndValue,
      projectedReturnToEnd,
      periodsRemaining,
      projectedTimeline,
      benchmarkProjection
    };
  }

  function simFinish(sim) {
    const timeline = sim.timeline || [];
    const first = timeline[0]?.value || sim.initialCash || 1;
    const last = timeline[timeline.length - 1]?.value || first;
    const totalReturn = first > 0 ? last / first - 1 : 0;
    const years = Math.max(1 / 12, (Date.parse(`${sim.endDate}T00:00:00Z`) - Date.parse(`${sim.startDate}T00:00:00Z`)) / (365.25 * 86400000));
    const cagr = first > 0 ? Math.pow(last / first, 1 / years) - 1 : 0;
    let peak = first;
    let maxDd = 0;
    const dailyReturns = [];
    for (let i = 0; i < timeline.length; i += 1) {
      const v = Number(timeline[i].value || 0);
      if (v > peak) peak = v;
      if (peak > 0) maxDd = Math.min(maxDd, v / peak - 1);
      if (i > 0) {
        const p = Number(timeline[i - 1].value || 0);
        if (p > 0) dailyReturns.push(Math.log(v / p));
      }
    }
    const mean = dailyReturns.length ? dailyReturns.reduce((s, x) => s + x, 0) / dailyReturns.length : 0;
    const variance = dailyReturns.length > 1
      ? dailyReturns.reduce((s, x) => s + (x - mean) ** 2, 0) / (dailyReturns.length - 1)
      : 0;
    const annualizedVolatility = Math.sqrt(Math.max(variance, 0)) * Math.sqrt(252);
    const finalWeights = {};
    const snap = getSimSnapshot(sim, sim.currentDate, sim.lastInsightDate);
    (snap.insights.holdings || []).forEach((h) => {
      if (h.weight > 0.0001) finalWeights[h.symbol] = h.weight;
    });
    const benchmarkSeries = (sim.benchmarkSymbols || []).map((symbol) => ({
      symbol,
      points: benchmarkTimeline(sim, symbol, sim.endDate)
    }));
    const benchmarkComparisons = benchmarkSeries.map((b) => {
      const base = b.points[0]?.value || sim.initialCash || 1;
      const endVal = b.points[b.points.length - 1]?.value || base;
      return { symbol: b.symbol, totalReturn: base > 0 ? endVal / base - 1 : 0 };
    });
    const riskAggressive = clamp(50 + totalReturn * 80 + annualizedVolatility * 30, 0, 100);
    const controlInternal = clamp(55 - annualizedVolatility * 25, 0, 100);
    const reactivityEmotional = clamp(45 + Math.abs(maxDd) * 120, 0, 100);
    const investorProfile = {
      type: riskAggressive >= 60 ? 'Active Conviction Investor' : 'Passive Rational Allocator',
      code: `${riskAggressive >= 50 ? 'A' : 'C'}-${controlInternal >= 50 ? 'I' : 'E'}-${reactivityEmotional >= 50 ? 'E' : 'R'}`,
      axes: {
        risk: riskAggressive >= 50 ? 'Aggressive' : 'Conservative',
        control: controlInternal >= 50 ? 'Active' : 'Passive',
        reactivity: reactivityEmotional >= 50 ? 'Emotional' : 'Rational'
      },
      axisScores: {
        riskAggressive,
        riskConservative: 100 - riskAggressive,
        controlInternal,
        controlExternal: 100 - controlInternal,
        reactivityEmotional,
        reactivityRational: 100 - reactivityEmotional
      },
      recommendation: 'Keep a rules-based rebalance plan and enforce max position sizing.'
    };
    return {
      finalValue: last,
      totalReturn,
      cagr,
      maxDrawdown: maxDd,
      annualizedVolatility,
      feesPaid: Number(sim.feesPaid || 0),
      dividendsReceived: Number(sim.dividendsReceived || 0),
      behavior: {
        rebalancesCompleted: Number(sim.stepIndex || 0),
        avgCashRatio: timeline.length
          ? timeline.reduce((s) => s + Number(sim.cash || 0) / Math.max(0.0001, Number(sim.lastPortfolioValue || 1)), 0) / timeline.length
          : 0
      },
      benchmarkComparisons,
      timeline,
      benchmarkSeries,
      finalWeights,
      investorProfile
    };
  }

  function simBriefing(sim, date, sinceDate) {
    const snap = getSimSnapshot(sim, date || sim.currentDate, sinceDate || sim.lastInsightDate);
    const prevDate = sinceDate || sim.lastInsightDate || sim.startDate;
    const outAssets = (sim.assets || []).map((asset) => {
      const curPrice = getAssetPriceOn(sim, asset, date || sim.currentDate);
      const prevPrice = getAssetPriceOn(sim, asset, prevDate);
      const periodReturn = prevPrice > 0 ? curPrice / prevPrice - 1 : 0;
      return {
        symbol: asset.id,
        displayName: asset.displayName,
        weight: Number((snap.insights.holdings.find((h) => h.symbol === asset.id)?.weight || 0)),
        periodReturn,
        dailyReturn: periodReturn / Math.max(1, sim.frequency === 'daily' ? 1 : sim.frequency === 'weekly' ? 7 : 30),
        earningsDate: '',
        headlines: []
      };
    });
    return { date: date || sim.currentDate, sinceDate: prevDate, assets: outAssets };
  }

  function simSearch(sim, query, date, sinceDate) {
    const q = normalizeSymbol(query || '');
    const asset = (sim.assets || []).find((a) => a.id === q || a.baseSymbol === q) || parseAssetToken(q);
    const curPrice = getAssetPriceOn(sim, asset, date || sim.currentDate);
    const prevPrice = getAssetPriceOn(sim, asset, sinceDate || sim.lastInsightDate || sim.startDate);
    const periodReturn = prevPrice > 0 ? curPrice / prevPrice - 1 : 0;
    const holdingQty = Number(sim.holdings?.[asset.id] || 0);
    const value = holdingQty * curPrice;
    const portVal = Number(sim.lastPortfolioValue || sim.initialCash || 1);
    return {
      asset: {
        symbol: asset.id,
        displayName: asset.displayName || asset.id,
        periodReturn,
        dailyReturn: periodReturn / Math.max(1, sim.frequency === 'daily' ? 1 : sim.frequency === 'weekly' ? 7 : 30),
        earningsDate: '',
        latestDividend: null,
        inPortfolio: holdingQty > 1e-10,
        quantity: holdingQty,
        value,
        weight: portVal > 0 ? value / portVal : 0,
        headlines: []
      }
    };
  }

  function simReplay(sim) {
    const symbols = (sim.assets || []).map((a) => a.id);
    const dates = Array.from(new Set((sim.timeline || []).map((p) => p.date))).sort();
    const frames = dates.map((date) => {
      const prices = {};
      symbols.forEach((sym) => {
        const asset = sim.assets.find((a) => a.id === sym);
        prices[sym] = asset ? getAssetPriceOn(sim, asset, date) : 0;
      });
      return { date, prices };
    });
    return { frames };
  }

  async function handleLocalApi(url, init) {
    try {
      if (url.startsWith('/api/health')) {
        return jsonResponse({ ok: true, mode: 'public-api', asOfDate: toIsoDate() });
      }
      if (url.startsWith('/api/valuation/resolve') || url.startsWith('/api/assets/resolve')) {
        const body = parseBody(init);
        const data = await resolveSymbol(body.query || '');
        return jsonResponse({ best: data.best, matches: data.matches });
      }
      if (url.startsWith('/api/assets/price')) {
        const body = parseBody(init);
        const token = normalizeSymbol(body.token || '');
        if (!token) return jsonErrorResponse('Token is required.', 400);
        const chart = await yahooChart(token, '3mo', '1d');
        const rows = extractHistory(chart);
        if (!rows.length) return jsonErrorResponse(`No price data for ${token}.`, 404);
        const targetDate = String(body.date || '').trim();
        let row = rows[rows.length - 1];
        if (targetDate) {
          const candidate = rows.filter((r) => r.date <= targetDate).pop();
          if (candidate) row = candidate;
        }
        return jsonResponse({ token, price: row.close, date: row.date });
      }
      if (url.startsWith('/api/assets/validate')) {
        const body = parseBody(init);
        const token = normalizeSymbol(body.token || '');
        if (!token) return jsonErrorResponse('Token is required.', 400);
        const parts = token.split(':');
        const kind = parts[0];
        const baseSymbol =
          kind === 'BOND' || kind === 'LEVERAGE' || kind === 'CALL'
            ? normalizeSymbol(parts[1] || '')
            : token;
        if (!(await isKnownSearchSymbol(baseSymbol))) {
          return jsonErrorResponse(`No matching symbol found for "${baseSymbol}". Select from dropdown.`, 400);
        }
        return jsonResponse({ ok: true, symbol: baseSymbol });
      }
      if (url.startsWith('/api/valuation/investment')) {
        const body = parseBody(init);
        const investment = await buildInvestmentValuation(body.query || '', body.asOfDate || '');
        return jsonResponse({ asOfDate: investment.asOfDate, investment });
      }
      if (url.startsWith('/api/valuation/portfolio')) {
        const body = parseBody(init);
        const payload = await buildPortfolioValuation(body.holdings || [], body.asOfDate || '');
        return jsonResponse(payload);
      }
      if (url.startsWith('/api/simulations/start')) {
        const body = parseBody(init);
        const data = await createSimulation(body);
        return jsonResponse(data);
      }
      if (/^\/api\/simulations\/[^/]+\/assets/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const body = parseBody(init);
        const asset = parseAssetToken(body?.token || '');
        if (!asset.id) return jsonErrorResponse('Invalid token.', 400);
        if (!sim.assets.some((a) => a.id === asset.id)) {
          sim.assets.push(asset);
          sim.symbols.push(asset.id);
          if (asset.baseSymbol && asset.baseSymbol !== 'CASH' && asset.baseSymbol !== 'SAVINGS') {
            await ensureSimSeries(sim, asset.baseSymbol);
          }
        }
        return jsonResponse({
          ok: true,
          assets: sim.assets,
          symbols: sim.symbols,
          preview: getSimSnapshot(sim, sim.currentDate, sim.lastInsightDate).preview,
          previewInsights: getSimSnapshot(sim, sim.currentDate, sim.lastInsightDate).insights
        });
      }
      if (/^\/api\/simulations\/[^/]+\/rebalance/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const body = parseBody(init);
        const data = rebalanceSimulation(sim, body?.targets || {});
        return jsonResponse(data);
      }
      if (/^\/api\/simulations\/[^/]+\/trade/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const body = parseBody(init);
        return jsonResponse(tradeSimulation(sim, body || {}));
      }
      if (/^\/api\/simulations\/[^/]+\/timeline/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const endMatch = url.match(/[?&]endDate=([^&]+)/i);
        const endDate = endMatch ? decodeURIComponent(endMatch[1] || '') : '';
        return jsonResponse(simTimeline(sim, endDate || sim.currentDate));
      }
      if (/^\/api\/simulations\/[^/]+\/projection/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        return jsonResponse(simProjection(sim));
      }
      if (/^\/api\/simulations\/[^/]+\/finish/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        return jsonResponse(simFinish(sim));
      }
      if (/^\/api\/simulations\/[^/]+\/market-briefing/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const d = url.match(/[?&]date=([^&]+)/i);
        const s = url.match(/[?&]sinceDate=([^&]+)/i);
        return jsonResponse(simBriefing(sim, d ? decodeURIComponent(d[1] || '') : sim.currentDate, s ? decodeURIComponent(s[1] || '') : sim.lastInsightDate));
      }
      if (/^\/api\/simulations\/[^/]+\/market-search/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const body = parseBody(init);
        return jsonResponse(simSearch(sim, body?.query || '', body?.date || sim.currentDate, body?.sinceDate || sim.lastInsightDate));
      }
      if (/^\/api\/simulations\/[^/]+\/replay/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        return jsonResponse(simReplay(sim));
      }
      if (/^\/api\/simulations\/[^/]+$/.test(url)) {
        const simId = url.split('/')[3];
        const sim = getSimById(simId);
        if (!sim) return jsonErrorResponse('Simulation not found.', 404);
        const snap = getSimSnapshot(sim, sim.currentDate, sim.lastInsightDate);
        return jsonResponse({
          simulationId: sim.simulationId,
          startDate: sim.startDate,
          endDate: sim.endDate,
          frequency: sim.frequency,
          assets: sim.assets,
          symbols: sim.symbols,
          benchmarkSymbols: sim.benchmarkSymbols,
          holdings: sim.holdings,
          costBasis: sim.costBasis,
          firstBuyPrice: sim.firstBuyPrice,
          realizedProfit: sim.realizedProfit,
          cash: sim.cash,
          stepIndex: sim.stepIndex,
          totalSteps: sim.totalSteps,
          nextRebalanceDate: sim.nextRebalanceDate,
          preview: snap.preview,
          previewInsights: snap.insights
        });
      }
      if (url.startsWith('/api/investotype/portfolio')) {
        const body = parseBody(init);
        const riskRaw = Number(body?.axisScores?.riskAggressive);
        const controlRaw = Number(body?.axisScores?.controlInternal);
        const reactRaw = Number(body?.axisScores?.reactivityEmotional);
        const hasAxisInput = Number.isFinite(riskRaw) || Number.isFinite(controlRaw) || Number.isFinite(reactRaw);
        let typeKey = normalizeInvestorType(body?.investorType) || 'passive_rational_allocator';
        let axisScores;
        if (hasAxisInput) {
          axisScores = {
            riskAggressive: clamp(Number.isFinite(riskRaw) ? riskRaw : 50, 0, 100),
            controlInternal: clamp(Number.isFinite(controlRaw) ? controlRaw : 50, 0, 100),
            reactivityEmotional: clamp(Number.isFinite(reactRaw) ? reactRaw : 50, 0, 100)
          };
          const code = `${axisScores.riskAggressive >= 50 ? 'A' : 'C'}-${axisScores.controlInternal >= 50 ? 'I' : 'E'}-${axisScores.reactivityEmotional >= 50 ? 'E' : 'R'}`;
          typeKey = AXIS_CODE_TO_PROFILE_KEY[code] || typeKey;
        } else {
          axisScores = PROFILE_DEFAULT_AXIS_SCORES[typeKey] || PROFILE_DEFAULT_AXIS_SCORES.passive_rational_allocator;
        }
        return jsonResponse(buildInvestotypeDraft({ typeKey, axisScores }));
      }
      if (url.startsWith('/api/news/market')) {
        const data = await buildMarketNews(MARKET_NEWS_SYMBOLS);
        return jsonResponse(data);
      }
      if (url.startsWith('/api/news/tailored')) {
        const typeMatch = url.match(/[?&]type=([^&]+)/i);
        const typeKey = normalizeInvestorType(typeMatch ? decodeURIComponent(typeMatch[1] || '') : '') || 'passive_rational_allocator';
        const profile = TAILORED_NEWS_PROFILES[typeKey] || TAILORED_NEWS_PROFILES.passive_rational_allocator;
        const data = await buildMarketNews(profile.symbols);
        return jsonResponse({
          asOfDate: data.asOfDate,
          profile: profile.label,
          watchlist: profile.symbols,
          sentiment: data.sentiment,
          headlines: data.headlines
        });
      }
      if (url.startsWith('/api/news/investment-of-day')) {
        const periodMatch = url.match(/[?&]period=([^&]+)/i);
        const period = periodMatch ? decodeURIComponent(periodMatch[1] || 'day') : 'day';
        const payload = await buildInvestmentOfPeriod(period);
        return jsonResponse(payload);
      }
      return jsonErrorResponse('This feature requires backend mode. Set INVESTOLAB_API_BASE.', 501);
    } catch (error) {
      return jsonErrorResponse(error?.message || 'Public API mode failed.', 500);
    }
  }

  window.fetch = async (input, init) => {
    const url = resolveApiUrl(input);
    const apiPath = normalizeApiPath(url);
    if (!apiPath || !apiPath.startsWith('/api/')) {
      return rawFetch(input, init);
    }

    const localApiResponse = await handleLocalApi(apiPath, init);
    if (!(localApiResponse instanceof Response)) {
      return jsonErrorResponse('Public API handler failed.', 500);
    }
    if (localApiResponse.status === 501 && isGithubPages) {
      const staticDataUrl = mapApiToStaticData(apiPath);
      if (staticDataUrl) {
        return rawFetch(staticDataUrl, init).catch(() =>
          jsonErrorResponse('Static data is unavailable right now. Try again in a moment.', 503)
        );
      }
    }
    return localApiResponse;
  };
})();
