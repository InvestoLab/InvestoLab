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

async function loadTailoredNews(typeKey) {
  try {
    setLoadingLabel(tailoredNewsDateLabel, 'Loading tailored feed');
    const readJsonWithFallback = async (primaryUrl, fallbackUrl) => {
      const readJson = async (url) => {
        const response = await fetch(url);
        const contentType = String(response.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('application/json')) {
          throw new Error('Tailored news response was not valid JSON.');
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Failed to load tailored news.');
        return data;
      };
      try {
        return await readJson(primaryUrl);
      } catch (primaryError) {
        if (window.__INVESTOLAB_DISABLE_STATIC) {
          throw primaryError;
        }
        if (!fallbackUrl) throw primaryError;
        return readJson(fallbackUrl);
      }
    };
    const data = await readJsonWithFallback(
      `./api/news/tailored?type=${encodeURIComponent(typeKey || '')}`,
      './data/news-tailored.json'
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
    setLabel(tailoredNewsDateLabel, 'Unable to load tailored news.');
    tailoredNewsResult.innerHTML = `<section class="chart-card"><p>${esc(error.message || 'Unknown error')}</p></section>`;
  }
}

tailoredNewsForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const typeKey = String(tailoredTypeSelect?.value || 'passive_rational_allocator');
  await loadTailoredNews(typeKey);
});

loadTailoredNews(String(tailoredTypeSelect?.value || 'passive_rational_allocator'));




