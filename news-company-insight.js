const companyInsightForm = document.getElementById('companyInsightForm');
const companyInsightQuery = document.getElementById('companyInsightQuery');
const companyInsightDropdown = document.getElementById('companyInsightDropdown');
const companyInsightStatus = document.getElementById('companyInsightStatus');
const companyInsightResult = document.getElementById('companyInsightResult');
let companySearchResults = [];
let companySearchIndex = -1;
let companySearchTimer = null;
let companySelectedSymbol = '';
let activeInsightQuery = '';

function fmtMoney(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(v, digits = 2) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return `${(Number(v) * 100).toFixed(digits)}%`;
}

function esc(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function withLiveStamp(url) {
  const stamp = `t=${Date.now()}`;
  return String(url || '').includes('?') ? `${url}&${stamp}` : `${url}?${stamp}`;
}

function hideCompanyDropdown() {
  companyInsightDropdown?.classList.add('hidden');
  if (companyInsightDropdown) companyInsightDropdown.innerHTML = '';
  companySearchResults = [];
  companySearchIndex = -1;
}

function applyCompanySearchSelection(option) {
  if (!option || !companyInsightQuery) return;
  const symbol = String(option.symbol || '').trim();
  companyInsightQuery.value = symbol;
  companySelectedSymbol = symbol.toUpperCase();
  hideCompanyDropdown();
}

function renderCompanySearchDropdown() {
  if (!companyInsightDropdown) return;
  if (!companySearchResults.length) {
    hideCompanyDropdown();
    return;
  }
  companyInsightDropdown.classList.remove('hidden');
  companyInsightDropdown.innerHTML = companySearchResults
    .map((opt, i) => {
      const name = esc(opt.longname || opt.shortname || opt.symbol);
      const sub = esc([opt.symbol, opt.exchange, opt.quoteType].filter(Boolean).join(' | '));
      return `<button type="button" class="search-option ${i === companySearchIndex ? 'active' : ''}" data-company-search-index="${i}">
        <div class="search-option-title">${name}</div>
        <div class="search-option-sub">${sub}</div>
      </button>`;
    })
    .join('');
}

async function searchCompanySymbolOptions(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return [];
  const queryUpper = raw.toUpperCase();

  const tryResolve = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Search failed');
    return data;
  };

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
  list.sort((a, b) => {
    const as = String(a?.symbol || '').toUpperCase();
    const bs = String(b?.symbol || '').toUpperCase();
    const an = String(a?.longname || a?.shortname || '').toUpperCase();
    const bn = String(b?.longname || b?.shortname || '').toUpperCase();
    const aExact = as === queryUpper ? 1 : 0;
    const bExact = bs === queryUpper ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    const aStarts = as.startsWith(queryUpper) ? 1 : 0;
    const bStarts = bs.startsWith(queryUpper) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    const anStarts = an.startsWith(queryUpper) ? 1 : 0;
    const bnStarts = bn.startsWith(queryUpper) ? 1 : 0;
    if (anStarts !== bnStarts) return bnStarts - anStarts;
    return as.localeCompare(bs);
  });
  return list.slice(0, 8);
}

function renderHeadlines(headlines) {
  const list = Array.isArray(headlines) ? headlines : [];
  if (!list.length) return '<p>No related headlines found.</p>';
  return `
    <ul class="investor-list valuation-headlines">
      ${list
        .map((h) => {
          const href = String(h?.url || h?.link || '').trim();
          const title = esc(h?.title || '');
          const source = esc(h?.publisher || 'Unknown');
          const date = esc(h?.date || '');
          const sym = esc(h?.symbol || '');
          const head = href
            ? `<a class="news-headline-link" href="${href}" target="_blank" rel="noopener noreferrer">${title}</a>`
            : `<strong>${title}</strong>`;
          return `<li>${head}<span>${sym}${sym ? ' | ' : ''}${source}${date ? ` | ${date}` : ''}</span></li>`;
        })
        .join('')}
    </ul>
  `;
}

function renderSources(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return '<p>No article URLs were available from providers for this query/date.</p>';
  return `
    <ul class="investor-list valuation-headlines">
      ${list
        .map((s) => {
          const href = String(s?.url || '').trim();
          const title = esc(s?.title || '');
          const source = esc(s?.publisher || s?.provider || 'Unknown');
          const date = esc(s?.date || '');
          const line = href
            ? `<a class="news-headline-link" href="${href}" target="_blank" rel="noopener noreferrer">${title}</a>`
            : `<strong>${title}</strong>`;
          return `<li>${line}<span>${source}${date ? ` | ${date}` : ''}</span></li>`;
        })
        .join('')}
    </ul>
  `;
}

function renderBenchmarkRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return '<p>No benchmark data.</p>';
  return `
    <ul class="investor-list">
      ${list
        .map(
          (r) =>
            `<li>${esc(r.symbol)}: 30D ${fmtPct(r.d30)} | 90D ${fmtPct(r.d90)} | 1Y ${fmtPct(r.d252)}</li>`
        )
        .join('')}
    </ul>
  `;
}

function renderInsight(payload) {
  const company = payload?.company || {};
  const market = payload?.market || {};
  const signals = payload?.signals || {};
  const valuation = payload?.valuation || {};
  const summary = payload?.summary || {};
  const rec = valuation?.recommendation || {};
  const headlines = Array.isArray(payload?.headlines) && payload.headlines.length ? payload.headlines : signals?.headlines || [];
  const sourcesUsed = Array.isArray(payload?.sourcesUsed) ? payload.sourcesUsed : [];

  companyInsightResult.innerHTML = `
    <section class="valuation-hero ${String(rec.action || 'hold').toLowerCase()}">
      <div class="valuation-hero-main">
        <p class="valuation-kicker">${esc(company.symbol || '')}</p>
        <h3><strong>${esc(company.displayName || company.symbol || '')}</strong></h3>
        <p>${esc(summary.overview || '')}</p>
      </div>
      <div class="valuation-rec-card ${String(rec.action || 'hold').toLowerCase()}">
        <span>Tendency</span>
        <strong>${esc(summary.tendency || 'N/A')}</strong>
        <small>${esc(payload?.asOfDate || '')}</small>
      </div>
    </section>

    <div class="valuation-grid-2">
      <section class="chart-card">
        <h4>Price + Sentiment Snapshot</h4>
        <ul class="investor-list">
          <li>Price: ${fmtMoney(market?.price)} (${esc(market?.priceDate || payload?.asOfDate || '')})</li>
          <li>30D / 90D / 1Y: ${fmtPct(market?.trailingReturns?.d30)} / ${fmtPct(market?.trailingReturns?.d90)} / ${fmtPct(
    market?.trailingReturns?.d252
  )}</li>
          <li>Volatility: ${fmtPct(market?.annualizedVolatility)} | Max drawdown: ${fmtPct(market?.maxDrawdown1Y)}</li>
          <li>News sentiment: ${fmtPct(signals?.newsSentiment)} | Social sentiment: ${fmtPct(signals?.socialSentiment)}</li>
          <li>Sentiment confidence: ${fmtPct(signals?.sentimentConfidence)}</li>
        </ul>
      </section>

      <section class="chart-card">
        <h4>Why The Price Is Moving</h4>
        <ul class="investor-list">
          ${(Array.isArray(summary?.reasons) ? summary.reasons : []).map((line) => `<li>${esc(line)}</li>`).join('')}
        </ul>
      </section>
    </div>

    <section class="chart-card">
      <h4>Index Comparison</h4>
      ${renderBenchmarkRows(payload?.benchmark)}
    </section>

    <section class="chart-card">
      <h4>Related Headlines</h4>
      ${renderHeadlines(headlines)}
    </section>

    <section class="chart-card">
      <h4>Sources Used</h4>
      ${renderSources(sourcesUsed)}
    </section>
  `;
}

async function requestCompanyInsight(query) {
  const url = withLiveStamp(`./api/news/company-insight?query=${encodeURIComponent(query)}`);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load company insight.');
  return data;
}

companyInsightForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = String(companyInsightQuery?.value || '').trim();
  if (!query) {
    companyInsightStatus.textContent = 'Enter a company name or ticker.';
    return;
  }
  companyInsightStatus.textContent = 'Analyzing company...';
  if (companyInsightResult) companyInsightResult.innerHTML = '';
  try {
    const payload = await requestCompanyInsight(query);
    activeInsightQuery = String(payload?.company?.symbol || query).trim();
    renderInsight(payload);
    companyInsightStatus.textContent = `Analysis ready for ${payload?.company?.symbol || query}.`;
  } catch (error) {
    companyInsightStatus.textContent = error.message || 'Failed to analyze company.';
  }
});

companyInsightQuery?.addEventListener('input', () => {
  const q = String(companyInsightQuery.value || '').trim();
  companySelectedSymbol = '';
  activeInsightQuery = '';
  if (companySearchTimer) clearTimeout(companySearchTimer);
  if (!q || q.length < 2) {
    hideCompanyDropdown();
    return;
  }
  companySearchTimer = setTimeout(async () => {
    try {
      companySearchResults = await searchCompanySymbolOptions(q);
      companySearchIndex = companySearchResults.length ? 0 : -1;
      renderCompanySearchDropdown();
    } catch (_error) {
      hideCompanyDropdown();
    }
  }, 220);
});

companyInsightQuery?.addEventListener('keydown', (event) => {
  if (!companySearchResults.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    companySearchIndex = (companySearchIndex + 1 + companySearchResults.length) % companySearchResults.length;
    renderCompanySearchDropdown();
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    companySearchIndex = (companySearchIndex - 1 + companySearchResults.length) % companySearchResults.length;
    renderCompanySearchDropdown();
    return;
  }
  if (event.key === 'Enter') {
    const candidate = companySearchResults[companySearchIndex] || companySearchResults[0];
    if (candidate) {
      event.preventDefault();
      applyCompanySearchSelection(candidate);
      companyInsightForm?.requestSubmit?.();
    }
    return;
  }
  if (event.key === 'Escape') hideCompanyDropdown();
});

companyInsightDropdown?.addEventListener('mousedown', (event) => {
  event.preventDefault();
  const btn = event.target.closest('button[data-company-search-index]');
  if (!btn) return;
  const idx = Number(btn.dataset.companySearchIndex);
  applyCompanySearchSelection(companySearchResults[idx]);
});

companyInsightQuery?.addEventListener('blur', () => {
  setTimeout(hideCompanyDropdown, 120);
});

async function refreshActiveInsight() {
  if (!activeInsightQuery || document.hidden) return;
  try {
    const payload = await requestCompanyInsight(activeInsightQuery);
    renderInsight(payload);
    companyInsightStatus.textContent = `Analysis refreshed for ${payload?.company?.symbol || activeInsightQuery}.`;
  } catch (_error) {
    // Keep the current rendered insight if a refresh fails.
  }
}

window.setInterval(refreshActiveInsight, 120000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshActiveInsight();
});
