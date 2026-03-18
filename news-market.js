const marketNewsDateLabel = document.getElementById('marketNewsDateLabel');
const marketNewsResult = document.getElementById('marketNewsResult');

function setLoadingLabel(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.add('loading-ellipsis');
}

function setLabel(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('loading-ellipsis');
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
    const snippet = String(raw || '').trim().slice(0, 180);
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
              return `<li>${titleHtml}<span>${esc(h.symbol || '')}${h.symbol ? ' | ' : ''}${esc(
                h.publisher || 'Unknown'
              )}${h.date ? ` | ${esc(h.date)}` : ''}</span></li>`;
            })
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
  const hadContent = Boolean(String(marketNewsResult?.innerHTML || '').trim());
  try {
    setLoadingLabel(marketNewsDateLabel, 'Loading market feed');
    const data = await readJsonWithFallback('./api/news/market', './data/news-market.json', 'Failed to load market news.');

    setLabel(marketNewsDateLabel, `Date: ${esc(data?.asOfDate || '')}`);
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
    setLabel(marketNewsDateLabel, hadContent ? 'Live update delayed.' : 'Unable to load market news.');
    if (!hadContent) {
      marketNewsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
    }
  }
}

loadMarketNews();
window.setInterval(() => {
  if (!document.hidden) loadMarketNews();
}, 120000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadMarketNews();
});
