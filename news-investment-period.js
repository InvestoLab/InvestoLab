const newsDateLabel = document.getElementById('newsDateLabel');
const newsResult = document.getElementById('newsResult');
const investmentPeriodTitle = document.getElementById('investmentPeriodTitle');
const pagePeriod = String(document.body?.dataset?.newsPeriod || 'day').toLowerCase();

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

async function readJson(url, failMessage) {
  const response = await fetch(withLiveStamp(url), { cache: 'no-store' });
  const responseClone = response.clone();
  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    let raw = '';
    try {
      raw = await responseClone.text();
    } catch (_textError) {
      raw = '';
    }
    const snippet = String(raw || '').trim().slice(0, 220);
    throw new Error(snippet ? `${failMessage} ${snippet}` : failMessage);
  }
  if (!response.ok) throw new Error(data?.error || failMessage);
  return data;
}

async function readJsonWithFallback(primaryUrl, fallbackUrl, failMessage) {
  try {
    return await readJson(primaryUrl, failMessage);
  } catch (primaryError) {
    if (window.__INVESTOLAB_DISABLE_STATIC || !fallbackUrl) throw primaryError;
    return readJson(fallbackUrl, failMessage);
  }
}

function renderHeadlineList(headlines, emptyText = 'No headlines available.') {
  const list = Array.isArray(headlines) ? headlines : [];
  return `
    <ul class="investor-list valuation-headlines">
      ${list.length
        ? list
            .map((h) => {
              const href = String(h?.url || h?.link || '').trim();
              const titleHtml = href
                ? `<a class="news-headline-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(h.title)}</a>`
                : `<strong>${esc(h.title)}</strong>`;
              return `<li>${titleHtml}<span>${esc(h.publisher || 'Unknown')}${h.date ? ` | ${esc(h.date)}` : ''}</span></li>`;
            })
            .join('')
        : `<li>${esc(emptyText)}</li>`}
    </ul>
  `;
}

async function loadInvestmentOfPeriod() {
  const hadContent = Boolean(String(newsResult?.innerHTML || '').trim());
  try {
    newsDateLabel?.classList.add('loading-ellipsis');
    if (newsDateLabel) newsDateLabel.textContent = 'Loading investment pick';

    const fallbackPathByPeriod = {
      day: './data/news-investment-day.json',
      week: './data/news-investment-week.json',
      month: './data/news-investment-month.json',
      year: './data/news-investment-year.json'
    };

    const data = await readJsonWithFallback(
      `./api/news/investment-of-day?period=${encodeURIComponent(pagePeriod)}`,
      fallbackPathByPeriod[pagePeriod] || fallbackPathByPeriod.day,
      'Unable to load investment pick.'
    );

    const investment = data?.investment || {};
    const valuation = investment?.valuation || {};
    const market = investment?.market || {};
    const rec = valuation?.recommendation || {};
    const headlines = Array.isArray(investment?.signals?.headlines) ? investment.signals.headlines : [];
    const summary3 = Array.isArray(valuation?.summary3) ? valuation.summary3 : [];
    const alternatives = Array.isArray(data?.alternatives) ? data.alternatives : [];
    const periodLabel = String(data?.period || pagePeriod || 'day');

    if (investmentPeriodTitle) {
      investmentPeriodTitle.textContent = String(data?.title || `Investment Of The ${periodLabel}`);
    }
    newsDateLabel?.classList.remove('loading-ellipsis');
    if (newsDateLabel) {
      newsDateLabel.textContent = `Date: ${esc(data?.asOfDate || '')} | Period: ${esc(periodLabel.toUpperCase())}`;
    }

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
          <h4>Snapshot</h4>
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
    newsDateLabel?.classList.remove('loading-ellipsis');
    if (newsDateLabel) newsDateLabel.textContent = hadContent ? 'Live update delayed.' : 'Unable to load investment pick.';
    if (!hadContent) {
      newsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
    }
  }
}

loadInvestmentOfPeriod();
window.setInterval(() => {
  if (!document.hidden) loadInvestmentOfPeriod();
}, 120000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadInvestmentOfPeriod();
});
