const marketNewsDateLabel = document.getElementById('marketNewsDateLabel');
const marketNewsResult = document.getElementById('marketNewsResult');

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

async function loadMarketNews() {
  try {
    const readJsonWithFallback = async (primaryUrl, fallbackUrl) => {
      const response = await fetch(primaryUrl);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Failed to load market news.');
        return data;
      }
      if (fallbackUrl) {
        const fb = await fetch(fallbackUrl);
        const fbData = await fb.json();
        if (!fb.ok) throw new Error(fbData?.error || 'Failed to load market news.');
        return fbData;
      }
      throw new Error('Market news response was not valid JSON.');
    };
    const data = await readJsonWithFallback('./api/news/market', './data/news-market.json');

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

loadMarketNews();




