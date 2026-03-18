const tailoredNewsForm = document.getElementById('tailoredNewsForm');
const tailoredTypeSelect = document.getElementById('tailoredTypeSelect');
const tailoredNewsDateLabel = document.getElementById('tailoredNewsDateLabel');
const tailoredNewsResult = document.getElementById('tailoredNewsResult');

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

let activeTypeKey = String(tailoredTypeSelect?.value || 'passive_rational_allocator');

async function loadTailoredNews(typeKey) {
  activeTypeKey = String(typeKey || 'passive_rational_allocator');
  const hadContent = Boolean(String(tailoredNewsResult?.innerHTML || '').trim());
  try {
    setLoadingLabel(tailoredNewsDateLabel, 'Loading tailored feed');
    const data = await readJsonWithFallback(
      `./api/news/tailored?type=${encodeURIComponent(activeTypeKey)}`,
      './data/news-tailored.json',
      'Failed to load tailored news.'
    );

    setLabel(tailoredNewsDateLabel, `Date: ${esc(data?.asOfDate || '')} | Profile: ${esc(data?.profile || '')}`);
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
    setLabel(tailoredNewsDateLabel, hadContent ? 'Live update delayed.' : 'Unable to load tailored news.');
    if (!hadContent) {
      tailoredNewsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
    }
  }
}

tailoredNewsForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await loadTailoredNews(String(tailoredTypeSelect?.value || 'passive_rational_allocator'));
});

loadTailoredNews(activeTypeKey);
window.setInterval(() => {
  if (!document.hidden) loadTailoredNews(activeTypeKey);
}, 120000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadTailoredNews(activeTypeKey);
});
