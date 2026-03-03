const investmentValuationForm = document.getElementById('investmentValuationForm');
const valuationQueryInput = document.getElementById('valuationQuery');
const valuationSearchDropdown = document.getElementById('valuationSearchDropdown');
const valuationDateInput = document.getElementById('valuationDate');
const valuationStatus = document.getElementById('valuationStatus');
const valuationResult = document.getElementById('valuationResult');
let valuationSearchResults = [];
let valuationSearchIndex = -1;
let valuationSearchTimer = null;
let valuationSelectedSymbol = '';
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
    // Primary: official valuation resolver
    data = await tryResolve('/api/valuation/resolve', { query: raw });
  } catch (_error) {
    // Fallback: simulation resolver (same behavior users already expect)
    data = await tryResolve('/api/assets/resolve', { query: raw, preferBond: false });
  }

  const list = [];
  if (data?.best?.symbol) list.push(data.best);
  for (const m of data?.matches || []) {
    if (!list.some((x) => x.symbol === m.symbol)) list.push(m);
  }
  list.sort((a, b) => {
    const sa = searchScore(queryUpper, a);
    const sb = searchScore(queryUpper, b);
    if (sb !== sa) return sb - sa;
    const pa = popularityRank(a.symbol);
    const pb = popularityRank(b.symbol);
    if (pa !== pb) return pa - pb;
    const au = isUsExchange(a.exchange) ? 1 : 0;
    const bu = isUsExchange(b.exchange) ? 1 : 0;
    if (bu !== au) return bu - au;
    return String(a.symbol || '').localeCompare(String(b.symbol || ''));
  });
  return list.slice(0, 8);
}

function hideValuationSearchDropdown() {
  valuationSearchDropdown?.classList.add('hidden');
  valuationSearchResults = [];
  valuationSearchIndex = -1;
}

function applyValuationSearchSelection(option) {
  if (!option || !valuationQueryInput) return;
  valuationQueryInput.value = option.symbol || '';
  valuationSelectedSymbol = String(option.symbol || '').trim().toUpperCase();
  hideValuationSearchDropdown();
}

async function requireValuationDropdownSelection(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return null;
  const norm = raw.toUpperCase();
  const local = valuationSearchResults.find((x) => String(x?.symbol || '').toUpperCase() === norm);
  if (local) return local;
  const fetched = await searchSymbolOptions(raw);
  return fetched.find((x) => String(x?.symbol || '').toUpperCase() === norm) || null;
}

function renderValuationSearchDropdown() {
  if (!valuationSearchDropdown) return;
  if (!valuationSearchResults.length) {
    hideValuationSearchDropdown();
    return;
  }

  valuationSearchDropdown.classList.remove('hidden');
  valuationSearchDropdown.innerHTML = valuationSearchResults
    .map((opt, i) => {
      const name = opt.longname || opt.shortname || opt.symbol;
      const sub = [opt.symbol, opt.exchange, opt.quoteType].filter(Boolean).join(' | ');
      return `<button type="button" class="search-option ${i === valuationSearchIndex ? 'active' : ''}" data-search-index="${i}">
        <div class="search-option-title">${escapeHtml(name)}</div>
        <div class="search-option-sub">${escapeHtml(sub)}</div>
      </button>`;
    })
    .join('');
}

function shiftIsoDate(isoDate, daysBack) {
  const ts = new Date(`${isoDate}T00:00:00Z`).getTime() - daysBack * 24 * 60 * 60 * 1000;
  return new Date(ts).toISOString().slice(0, 10);
}

function filterPriceHistoryByPeriod(points, periodKey) {
  const rows = Array.isArray(points) ? points : [];
  if (!rows.length || periodKey === 'MAX') return rows;
  const daysMap = { '1M': 30, '3M': 90, '6M': 183, '1Y': 365, '2Y': 730, '3Y': 1095 };
  const lookbackDays = daysMap[periodKey] || 183;
  const endDate = rows[rows.length - 1].date;
  const cutoff = shiftIsoDate(endDate, lookbackDays);
  return rows.filter((r) => r.date >= cutoff);
}

function renderPriceChart(rows, periodKey = '6M') {
  const points = Array.isArray(rows)
    ? rows
        .map((row) => ({ date: String(row?.date || ''), close: Number(row?.close || 0) }))
        .filter((row) => row.date && row.close > 0)
    : [];
  const filtered = filterPriceHistoryByPeriod(points, periodKey);

  if (filtered.length < 2) {
    return '<p class="asset-help">Not enough historical price points for this period.</p>';
  }

  const width = 900;
  const height = 260;
  const padX = 42;
  const padY = 20;
  const min = Math.min(...filtered.map((p) => p.close));
  const max = Math.max(...filtered.map((p) => p.close));
  const span = Math.max(max - min, max * 0.02, 1e-9);
  const xStep = (width - padX * 2) / Math.max(filtered.length - 1, 1);

  const coords = filtered.map((p, i) => {
    const x = padX + i * xStep;
    const y = padY + (height - padY * 2) * (1 - (p.close - min) / span);
    return { x, y };
  });

  const line = coords.map((c) => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
  const first = filtered[0];
  const last = filtered[filtered.length - 1];
  const up = last.close >= first.close;
  const tone = up ? '#059669' : '#dc2626';

  return `
    <div class="price-chart-wrap">
      <div class="price-chart-meta">
        <span>Start ${escapeHtml(first.date)}: <strong>${fmtMoney(first.close)}</strong></span>
        <span>End ${escapeHtml(last.date)}: <strong>${fmtMoney(last.close)}</strong></span>
        <span>6M Change: <strong class="${up ? 'tone-up' : 'tone-down'}">${fmtPct(last.close / first.close - 1)}</strong></span>
      </div>
      <svg class="price-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Past 6 months closing price chart">
        <defs>
          <linearGradient id="valuationPriceArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${tone}" stop-opacity="0.24"></stop>
            <stop offset="100%" stop-color="${tone}" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
        <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" stroke="#cbd5e1" stroke-width="1"></line>
        <polygon points="${line} ${coords[coords.length - 1].x.toFixed(2)},${(height - padY).toFixed(2)} ${coords[0].x.toFixed(2)},${(height - padY).toFixed(2)}" fill="url(#valuationPriceArea)"></polygon>
        <polyline points="${line}" fill="none" stroke="${tone}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
      <div class="price-chart-axis">
        <span>${escapeHtml(first.date)}</span>
        <span>${escapeHtml(last.date)}</span>
      </div>
    </div>
  `;
}

function mountPriceChart(rows) {
  const controls = valuationResult.querySelector('#priceChartControls');
  const body = valuationResult.querySelector('#priceChartBody');
  if (!controls || !body) return;
  let activePeriod = '6M';

  const render = () => {
    body.innerHTML = renderPriceChart(rows, activePeriod);
    [...controls.querySelectorAll('button[data-chart-period]')].forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.chartPeriod === activePeriod);
    });
  };

  controls.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-chart-period]');
    if (!btn) return;
    const next = String(btn.dataset.chartPeriod || '6M').toUpperCase();
    if (next === activePeriod) return;
    activePeriod = next;
    render();
  });

  render();
}

function renderInvestmentResult(investment) {
  const market = investment?.market || {};
  const signals = investment?.signals || {};
  const valuation = investment?.valuation || {};
  const recommendation = valuation?.recommendation || {};
  const buyerFit = valuation?.buyerFit || {};
  const priceHistory = Array.isArray(market.priceHistory) && market.priceHistory.length
    ? market.priceHistory
    : Array.isArray(market.priceHistory6M)
    ? market.priceHistory6M
    : [];
  const headlines = Array.isArray(signals.headlines) ? signals.headlines : [];
  const summary3 = Array.isArray(valuation.summary3) ? valuation.summary3 : [];
  const recAction = String(recommendation.action || 'HOLD').toUpperCase();
  const recTone = recAction === 'BUY' ? 'buy' : recAction === 'SELL' ? 'sell' : 'hold';

  valuationResult.innerHTML = `
    <section class="valuation-hero ${recTone}">
      <div class="valuation-hero-main">
        <p class="valuation-kicker">${escapeHtml(investment.symbol || '')}</p>
        <h3>${escapeHtml(investment.displayName || investment.symbol)}</h3>
        <p>This score is based on price trend, news, and sentiment.</p>
      </div>
      <div class="valuation-rec-card ${recTone}">
        <span>Recommendation</span>
        <strong>${escapeHtml(recAction)}</strong>
        <small>Confidence ${fmtPct(recommendation.confidence)}</small>
      </div>
    </section>

    <div class="valuation-kpis">
      <article class="kpi-card"><span>Composite Score</span><strong>${fmtNum(valuation.compositeScore, 0)}/100</strong><small>${escapeHtml(valuation.label || '')}</small></article>
      <article class="kpi-card"><span>Price</span><strong>${fmtMoney(market.price)}</strong><small>As of ${escapeHtml(market.priceDate || investment.asOfDate || '')}</small></article>
      <article class="kpi-card"><span>Volatility (1Y)</span><strong>${fmtPct(market.annualizedVolatility)}</strong><small>Max drawdown ${fmtPct(market.maxDrawdown1Y)}</small></article>
      <article class="kpi-card"><span>Sentiment Confidence</span><strong>${fmtPct(signals.sentimentConfidence)}</strong><small>${escapeHtml(signals.source || 'Signal blend')}</small></article>
    </div>

    <section class="chart-card">
      <h4>Price Chart</h4>
      <div id="priceChartControls" class="price-chart-controls">
        <button type="button" data-chart-period="1M">1M</button>
        <button type="button" data-chart-period="3M">3M</button>
        <button type="button" data-chart-period="6M" class="active">6M</button>
        <button type="button" data-chart-period="1Y">1Y</button>
        <button type="button" data-chart-period="2Y">2Y</button>
        <button type="button" data-chart-period="3Y">3Y</button>
        <button type="button" data-chart-period="MAX">MAX</button>
      </div>
      <div id="priceChartBody"></div>
    </section>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Signal Dashboard</h4>
        <ul class="investor-list">
          <li>30D return: ${fmtPct(market.trailingReturns?.d30)}</li>
          <li>90D return: ${fmtPct(market.trailingReturns?.d90)}</li>
          <li>252D return: ${fmtPct(market.trailingReturns?.d252)}</li>
          <li>News sentiment: ${fmtPct(signals.newsSentiment)}</li>
          <li>Social sentiment: ${fmtPct(signals.socialSentiment)}</li>
          <li>Next earnings date: ${escapeHtml(signals.earningsDate || 'N/A')}</li>
        </ul>
      </section>

      <section class="chart-card">
        <h4>AI Summary</h4>
        <ul class="investor-list">
          ${summary3.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
        </ul>
      </section>
    </div>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Buy/Sell Rationale</h4>
        <ul class="investor-list">
          ${(Array.isArray(recommendation.rationale) ? recommendation.rationale : [])
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join('')}
        </ul>
      </section>

      <section class="chart-card">
        <h4>Recommended Investor Type</h4>
        <div class="buyer-fit-head">
          <strong>${escapeHtml(buyerFit.type || 'N/A')}</strong>
          <span>${escapeHtml(buyerFit.code || '-')}</span>
        </div>
        <div class="buyer-fit-chips">
          <span>Risk: ${escapeHtml(buyerFit.axes?.risk || 'N/A')}</span>
          <span>Control: ${escapeHtml(buyerFit.axes?.control || 'N/A')}</span>
          <span>Reactivity: ${escapeHtml(buyerFit.axes?.reactivity || 'N/A')}</span>
        </div>
        <ul class="investor-list">
          ${(Array.isArray(buyerFit.why) ? buyerFit.why : [])
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join('')}
        </ul>
      </section>
    </div>

    <section class="chart-card">
      <h4>Latest Headlines</h4>
      <ul class="investor-list valuation-headlines">
        ${headlines.length
          ? headlines.map((h) => `<li><strong>${escapeHtml(h.title)}</strong><span>${escapeHtml(h.publisher || 'Unknown')} ${h.date ? `| ${escapeHtml(h.date)}` : ''}</span></li>`).join('')
          : '<li>No headlines found.</li>'}
      </ul>
    </section>
  `;

  valuationResult.classList.remove('hidden');
  mountPriceChart(priceHistory);
}

investmentValuationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const query = String(valuationQueryInput?.value || '').trim();
  const asOfDate = String(valuationDateInput?.value || '').trim();
  if (!query) {
    valuationStatus.textContent = 'Enter an investment query.';
    return;
  }
  const selected = await requireValuationDropdownSelection(query);
  if (!selected || String(selected.symbol || '').toUpperCase() !== String(valuationSelectedSymbol || '').toUpperCase()) {
    valuationStatus.textContent = 'Select an investment from the dropdown list.';
    return;
  }

  valuationStatus.textContent = 'Running valuation...';
  valuationResult.classList.add('hidden');

  try {
    const response = await fetch('/api/valuation/investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: selected.symbol, asOfDate })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Valuation request failed');
    }

    renderInvestmentResult(data.investment);
    valuationStatus.textContent = `Valuation completed for ${data?.investment?.symbol || query}.`;
  } catch (error) {
    valuationStatus.textContent = error.message || 'Failed to run valuation.';
    valuationResult.classList.add('hidden');
  }
});

if (valuationDateInput) valuationDateInput.value = todayIso();

valuationQueryInput?.addEventListener('input', () => {
  const q = valuationQueryInput.value.trim();
  valuationSelectedSymbol = '';
  if (valuationSearchTimer) clearTimeout(valuationSearchTimer);
  if (!q || q.length < 2) {
    hideValuationSearchDropdown();
    return;
  }

  valuationSearchTimer = setTimeout(async () => {
    try {
      valuationSearchResults = await searchSymbolOptions(q);
      valuationSearchIndex = valuationSearchResults.length ? 0 : -1;
      renderValuationSearchDropdown();
    } catch (_error) {
      hideValuationSearchDropdown();
    }
  }, 220);
});

valuationQueryInput?.addEventListener('keydown', (e) => {
  if (!valuationSearchResults.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    valuationSearchIndex = Math.min(valuationSearchResults.length - 1, valuationSearchIndex + 1);
    renderValuationSearchDropdown();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    valuationSearchIndex = Math.max(0, valuationSearchIndex - 1);
    renderValuationSearchDropdown();
  } else if (e.key === 'Enter') {
    if (valuationSearchIndex >= 0 && valuationSearchIndex < valuationSearchResults.length) {
      e.preventDefault();
      applyValuationSearchSelection(valuationSearchResults[valuationSearchIndex]);
    }
  } else if (e.key === 'Escape') {
    hideValuationSearchDropdown();
  }
});

valuationQueryInput?.addEventListener('blur', () => {
  setTimeout(() => hideValuationSearchDropdown(), 140);
});

valuationSearchDropdown?.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('button[data-search-index]');
  if (!btn) return;
  const idx = Number(btn.dataset.searchIndex);
  if (Number.isFinite(idx)) applyValuationSearchSelection(valuationSearchResults[idx]);
});

