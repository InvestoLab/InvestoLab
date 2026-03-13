const scorePreview = document.querySelector('.score-preview');
const periodPreview = document.querySelector('.period-preview');
const portfolioPreview = document.querySelector('.portfolio-preview');

const fmtPct = (v, digits = 1) => `${(Number(v || 0) * 100).toFixed(digits)}%`;
const clampPct = (v) => Math.max(8, Math.min(92, Number(v || 0)));

async function fetchInvestment(symbol) {
  const response = await fetch('/api/valuation/investment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: symbol })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load valuation.');
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
    if (scoreValue) scoreValue.textContent = Number.isFinite(score) ? String(score) : '—';
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
    // keep static
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
        const res = await fetch(`/api/news/investment-of-day?period=${encodeURIComponent(period)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) return;
        const sym = String(data?.symbol || '').toUpperCase();
        if (labels[idx] && sym) labels[idx].textContent = sym;
      } catch (_error) {
        // keep static
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
  for (let i = 0; i < symbols.length; i += 1) {
    try {
      const investment = await fetchInvestment(symbols[i]);
      const d90 = Number(investment?.market?.trailingReturns?.d90 || 0);
      const pct = d90 * 100;
      if (chips[i]) chips[i].textContent = `${symbols[i]} ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      if (bars[i]) bars[i].style.setProperty('--h', `${clampPct(35 + Math.abs(pct) * 1.2)}%`);
    } catch (_error) {
      // keep static
    }
  }
}

updateScorePreview();
updatePeriodPreview();
updatePortfolioPreview();

window.setInterval(updateScorePreview, 300000);
window.setInterval(updatePeriodPreview, 600000);
window.setInterval(updatePortfolioPreview, 600000);
