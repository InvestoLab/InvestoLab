const newsDateLabel = document.getElementById('newsDateLabel');
const newsResult = document.getElementById('newsResult');
const marketNewsDateLabel = document.getElementById('marketNewsDateLabel');
const marketNewsResult = document.getElementById('marketNewsResult');
const tailoredNewsForm = document.getElementById('tailoredNewsForm');
const tailoredTypeSelect = document.getElementById('tailoredTypeSelect');
const tailoredNewsDateLabel = document.getElementById('tailoredNewsDateLabel');
const tailoredNewsResult = document.getElementById('tailoredNewsResult');

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

function renderHeadlineList(headlines, emptyText = 'No headlines available.') {
  const list = Array.isArray(headlines) ? headlines : [];
  return `
    <ul class="investor-list valuation-headlines">
      ${list.length
        ? list
            .map(
              (h) =>
                `<li><strong>${esc(h.title)}</strong><span>${esc(h.symbol || '')}${h.symbol ? ' | ' : ''}${esc(
                  h.publisher || 'Unknown'
                )}${h.date ? ` | ${esc(h.date)}` : ''}</span></li>`
            )
            .join('')
        : `<li>${esc(emptyText)}</li>`}
    </ul>
  `;
}

function renderNewsSignalCards(sentiment) {
  const s = sentiment || {};
  return `
    <div class="valuation-kpis">
      <article class="kpi-card"><span>News Sentiment</span><strong>${fmtPct(s.news)}</strong><small>Aggregate headline tone</small></article>
      <article class="kpi-card"><span>Social Sentiment</span><strong>${fmtPct(s.social)}</strong><small>Social-like source tone</small></article>
      <article class="kpi-card"><span>Signal Confidence</span><strong>${fmtPct(s.confidence)}</strong><small>Coverage quality indicator</small></article>
    </div>
  `;
}

async function readJsonWithFallback(primaryUrl, fallbackUrl, failMessage) {
  const response = await fetch(primaryUrl);
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || failMessage);
    return data;
  }
  if (fallbackUrl) {
    const fb = await fetch(fallbackUrl);
    const fbData = await fb.json();
    if (!fb.ok) throw new Error(fbData?.error || failMessage);
    return fbData;
  }
  throw new Error(`${failMessage} (response was not valid JSON).`);
}

async function loadMarketNews() {
  try {
    const data = await readJsonWithFallback('./api/news/market', './data/news-market.json', 'Failed to load market news.');

    marketNewsDateLabel.textContent = `Date: ${esc(data?.asOfDate || '')}`;
    marketNewsResult.innerHTML = `
      ${renderNewsSignalCards(data.sentiment)}
      <section class="chart-card">
        <h4>Market Universe</h4>
        <p>${Array.isArray(data?.universe) ? data.universe.map(esc).join(', ') : ''}</p>
      </section>
      <section class="chart-card">
        <h4>Latest Market Headlines</h4>
        ${renderHeadlineList(data?.headlines, 'No market headlines available.')}
      </section>
    `;
  } catch (error) {
    marketNewsDateLabel.textContent = 'Unable to load market news.';
    marketNewsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
  }
}

async function loadTailoredNews(typeKey) {
  try {
    tailoredNewsDateLabel.textContent = 'Loading tailored feed...';
    const data = await readJsonWithFallback(
      `./api/news/tailored?type=${encodeURIComponent(typeKey || '')}`,
      './data/news-tailored.json',
      'Failed to load tailored news.'
    );

    tailoredNewsDateLabel.textContent = `Date: ${esc(data?.asOfDate || '')} | Profile: ${esc(data?.profile || '')}`;
    tailoredNewsResult.innerHTML = `
      ${renderNewsSignalCards(data.sentiment)}
      <section class="chart-card">
        <h4>Tailored Watchlist</h4>
        <p>${Array.isArray(data?.watchlist) ? data.watchlist.map(esc).join(', ') : ''}</p>
      </section>
      <section class="chart-card">
        <h4>Tailored Headlines</h4>
        ${renderHeadlineList(data?.headlines, 'No tailored headlines available.')}
      </section>
    `;
  } catch (error) {
    tailoredNewsDateLabel.textContent = 'Unable to load tailored news.';
    tailoredNewsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
  }
}

async function loadInvestmentOfDay() {
  try {
    const data = await readJsonWithFallback(
      './api/news/investment-of-day',
      './data/news-investment-day.json',
      'Failed to load investment of the day.'
    );

    const investment = data?.investment || {};
    const valuation = investment?.valuation || {};
    const market = investment?.market || {};
    const rec = valuation?.recommendation || {};
    const headlines = Array.isArray(investment?.signals?.headlines) ? investment.signals.headlines : [];
    const summary3 = Array.isArray(valuation?.summary3) ? valuation.summary3 : [];
    const alternatives = Array.isArray(data?.alternatives) ? data.alternatives : [];

    newsDateLabel.textContent = `Date: ${esc(data?.asOfDate || '')}`;

    newsResult.innerHTML = `
      <section class="valuation-hero ${String(rec.action || 'HOLD').toLowerCase()}">
        <div class="valuation-hero-main">
          <p class="valuation-kicker">${esc(investment.symbol || data.symbol || '')}</p>
          <h3><strong>${esc(investment.displayName || investment.symbol || data.symbol || '')}</strong></h3>
          <p>Recommendation: <strong>${esc(rec.action || 'HOLD')}</strong> | Confidence ${fmtPct(rec.confidence)}</p>
        </div>
        <div class="valuation-rec-card ${String(rec.action || 'HOLD').toLowerCase()}">
          <span>Price</span>
          <strong>${fmtMoney(market.price)}</strong>
          <small>${esc(market.priceDate || data.asOfDate || '')}</small>
        </div>
      </section>

      <div class="valuation-grid-2">
        <section class="chart-card">
          <h4>Daily Snapshot</h4>
          <ul class="investor-list">
            <li>Composite score: ${Number(valuation.compositeScore || 0).toFixed(0)}/100 (${esc(valuation.label || '')})</li>
            <li>30D return: ${fmtPct(market.trailingReturns?.d30)}</li>
            <li>90D return: ${fmtPct(market.trailingReturns?.d90)}</li>
            <li>252D return: ${fmtPct(market.trailingReturns?.d252)}</li>
            <li>Volatility: ${fmtPct(market.annualizedVolatility)}</li>
          </ul>
        </section>

        <section class="chart-card">
          <h4>Why This Pick</h4>
          <ul class="investor-list">
            ${summary3.map((line) => `<li>${esc(line)}</li>`).join('')}
            ${(Array.isArray(rec.rationale) ? rec.rationale : []).map((line) => `<li>${esc(line)}</li>`).join('')}
          </ul>
        </section>
      </div>

      <section class="chart-card">
        <h4>Headlines</h4>
        ${renderHeadlineList(headlines)}
      </section>

      <section class="chart-card">
        <h4>Next In Watchlist</h4>
        <p>${alternatives.length ? alternatives.map(esc).join(', ') : 'N/A'}</p>
      </section>
    `;
  } catch (error) {
    newsDateLabel.textContent = "Unable to load today's pick.";
    newsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
  }
}

tailoredNewsForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const typeKey = String(tailoredTypeSelect?.value || 'passive_rational_allocator');
  await loadTailoredNews(typeKey);
});

Promise.all([
  loadMarketNews(),
  loadTailoredNews(String(tailoredTypeSelect?.value || 'passive_rational_allocator')),
  loadInvestmentOfDay()
]);




