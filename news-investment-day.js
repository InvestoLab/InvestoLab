const newsDateLabel = document.getElementById('newsDateLabel');
const newsResult = document.getElementById('newsResult');
const investmentPeriodTitle = document.getElementById('investmentPeriodTitle');
const newsPeriodToggle = document.getElementById('newsPeriodToggle');
let selectedPeriod = 'day';

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
                `<li><strong>${esc(h.title)}</strong><span>${esc(h.publisher || 'Unknown')}${h.date ? ` | ${esc(
                  h.date
                )}` : ''}</span></li>`
            )
            .join('')
        : `<li>${esc(emptyText)}</li>`}
    </ul>
  `;
}

function setActivePeriodButton() {
  if (!newsPeriodToggle) return;
  [...newsPeriodToggle.querySelectorAll('button[data-period]')].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.period === selectedPeriod);
  });
}

async function loadInvestmentOfDay() {
  try {
    const fallbackPathByPeriod = {
      day: './data/news-investment-day.json',
      week: './data/news-investment-week.json',
      month: './data/news-investment-month.json',
      year: './data/news-investment-year.json'
    };
    const readJsonWithFallback = async (primaryUrl, fallbackUrl) => {
      const response = await fetch(primaryUrl);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Failed to load investment of the day.');
        return data;
      }
      if (fallbackUrl) {
        const fb = await fetch(fallbackUrl);
        const fbData = await fb.json();
        if (!fb.ok) throw new Error(fbData?.error || 'Failed to load investment of the day.');
        return fbData;
      }
      throw new Error('Investment response was not valid JSON.');
    };
    const data = await readJsonWithFallback(
      `./api/news/investment-of-day?period=${encodeURIComponent(selectedPeriod)}`,
      fallbackPathByPeriod[selectedPeriod] || fallbackPathByPeriod.day
    );

    const investment = data?.investment || {};
    const valuation = investment?.valuation || {};
    const market = investment?.market || {};
    const rec = valuation?.recommendation || {};
    const headlines = Array.isArray(investment?.signals?.headlines) ? investment.signals.headlines : [];
    const summary3 = Array.isArray(valuation?.summary3) ? valuation.summary3 : [];
    const alternatives = Array.isArray(data?.alternatives) ? data.alternatives : [];

    const periodLabel = String(data?.period || selectedPeriod || 'day');
    if (investmentPeriodTitle) {
      investmentPeriodTitle.textContent = String(data?.title || 'Investment Of The Day');
    }
    newsDateLabel.textContent = `Date: ${esc(data?.asOfDate || '')} | Period: ${esc(periodLabel.toUpperCase())}`;

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

newsPeriodToggle?.addEventListener('click', async (event) => {
  const btn = event.target.closest('button[data-period]');
  if (!btn) return;
  const next = String(btn.dataset.period || 'day').toLowerCase();
  if (!['day', 'week', 'month', 'year'].includes(next)) return;
  if (next === selectedPeriod) return;
  selectedPeriod = next;
  setActivePeriodButton();
  await loadInvestmentOfDay();
});

setActivePeriodButton();
loadInvestmentOfDay();




