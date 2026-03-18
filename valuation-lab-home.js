const scorePreview = document.querySelector('.score-preview');
const periodPreview = document.querySelector('.period-preview');
const portfolioPreview = document.querySelector('.portfolio-preview');

const fmtPct = (v, digits = 1) => `${(Number(v || 0) * 100).toFixed(digits)}%`;
const clampPct = (v) => Math.max(8, Math.min(92, Number(v || 0)));

function withLiveStamp(url) {
  const stamp = `t=${Date.now()}`;
  return String(url || '').includes('?') ? `${url}&${stamp}` : `${url}?${stamp}`;
}

async function readJson(url, init) {
  const response = await fetch(withLiveStamp(url), { cache: 'no-store', ...(init || {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load live data.');
  return data;
}

async function fetchInvestment(symbol) {
  const data = await readJson('/api/valuation/investment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: symbol })
  });
  return data?.investment || {};
}

async function updateScorePreview() {
  if (!scorePreview) return;
  try {
    const investment = await fetchInvestment('SPY');
    const score = Math.round(Number(investment?.valuation?.compositeScore || 0));
    const label = String(investment?.valuation?.label || 'Neutral');
    const d90 = Number(investment?.market?.trailingReturns?.d90 || 0);
    const news = Number(investment?.signals?.newsSentiment || 0);
    const vol = Number(investment?.market?.annualizedVolatility || 0);

    const scoreValue = scorePreview.querySelector('.score-value');
    const scoreLabel = scorePreview.querySelector('.score-label');
    if (scoreValue) scoreValue.textContent = Number.isFinite(score) ? String(score) : '--';
    if (scoreLabel) scoreLabel.textContent = label;

    scorePreview.querySelectorAll('.score-card').forEach((card) => {
      const labelEl = card.querySelector('span');
      const valueEl = card.querySelector('strong');
      if (!labelEl || !valueEl) return;
      const key = String(labelEl.textContent || '').toLowerCase();
      if (key.includes('trend')) valueEl.textContent = `${d90 >= 0 ? '+' : ''}${fmtPct(d90, 1)}`;
      else if (key.includes('sentiment')) valueEl.textContent = `${news >= 0 ? '+' : ''}${fmtPct(news, 0)}`;
      else if (key.includes('risk')) valueEl.textContent = fmtPct(vol, 1);
    });
  } catch (_error) {
    // Keep the designed fallback state if live data is unavailable.
  }
}

async function updatePeriodPreview() {
  if (!periodPreview) return;
  const labels = Array.from(periodPreview.querySelectorAll('.period-card-mini'));
  if (!labels.length) return;
  const periods = ['day', 'week', 'month', 'year'];

  await Promise.all(
    periods.map(async (period, idx) => {
      try {
        const data = await readJson(`/api/news/investment-of-day?period=${encodeURIComponent(period)}`);
        const symbol = String(data?.symbol || '').toUpperCase();
        if (labels[idx] && symbol) labels[idx].textContent = symbol;
      } catch (_error) {
        // Keep the designed fallback state if live data is unavailable.
      }
    })
  );
}

async function updatePortfolioPreview() {
  if (!portfolioPreview) return;
  const chips = Array.from(portfolioPreview.querySelectorAll('.alloc-chip'));
  const bars = Array.from(portfolioPreview.querySelectorAll('.alloc-bars span'));
  if (!chips.length || !bars.length) return;

  const symbols = ['XLK', 'XLV', 'XLP', 'SHV'];
  const investments = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return { symbol, investment: await fetchInvestment(symbol) };
      } catch (_error) {
        return { symbol, investment: null };
      }
    })
  );

  investments.forEach(({ symbol, investment }, idx) => {
    if (!investment) return;
    const d90 = Number(investment?.market?.trailingReturns?.d90 || 0);
    const pct = d90 * 100;
    if (chips[idx]) chips[idx].textContent = `${symbol} ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    if (bars[idx]) bars[idx].style.setProperty('--h', `${clampPct(35 + Math.abs(pct) * 1.2)}%`);
  });
}

async function refreshValuationLabHome() {
  await Promise.allSettled([updateScorePreview(), updatePeriodPreview(), updatePortfolioPreview()]);
}

refreshValuationLabHome();
window.setInterval(refreshValuationLabHome, 120000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshValuationLabHome();
});
