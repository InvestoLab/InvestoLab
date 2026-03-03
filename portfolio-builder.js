const portfolioForm = document.getElementById('portfolioForm');
const portfolioRows = document.getElementById('portfolioRows');
const addPortfolioRowBtn = document.getElementById('addPortfolioRowBtn');
const evaluatePortfolioBtn = document.getElementById('evaluatePortfolioBtn');
const portfolioStatus = document.getElementById('portfolioStatus');
const portfolioBriefSummary = document.getElementById('portfolioBriefSummary');

const portfolioAddQueryInput = document.getElementById('portfolioAddQuery');
const portfolioAddDropdown = document.getElementById('portfolioAddDropdown');

let addSearchResults = [];
let addSearchIndex = -1;
let addSearchTimer = null;
let addHoldingModal = null;
let addSelectedSymbol = '';

const POPULAR_SYMBOL_RANK = new Map(
  [
    'SPY',
    'QQQ',
    'VOO',
    'VTI',
    'IVV',
    'AAPL',
    'MSFT',
    'NVDA',
    'AMZN',
    'GOOGL',
    'META',
    'TSLA',
    'BRK-B',
    'JPM',
    'XOM',
    'BND',
    'TLT',
    'GLD',
    'BTC-USD',
    'ETH-USD'
  ].map((symbol, idx) => [symbol, idx])
);

function fmtMoney(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(v, digits = 2) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return `${(Number(v) * 100).toFixed(digits)}%`;
}

function fmtNum(v, digits = 2) {
  if (v == null || Number.isNaN(Number(v))) return 'N/A';
  return Number(v).toFixed(digits);
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isUsExchange(exchange) {
  const ex = String(exchange || '').toUpperCase();
  return ['NASDAQ', 'NMS', 'NYQ', 'NYSE', 'ASE', 'AMEX', 'BATS', 'ARCX'].some((x) => ex.includes(x));
}

function normalizeSymbolForRank(symbol) {
  return String(symbol || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace('_', '-');
}

function popularityRank(symbol) {
  const normalized = normalizeSymbolForRank(symbol);
  return POPULAR_SYMBOL_RANK.has(normalized) ? POPULAR_SYMBOL_RANK.get(normalized) : Number.POSITIVE_INFINITY;
}

function searchScore(queryUpper, option) {
  const sym = String(option?.symbol || '').toUpperCase();
  const name = String(option?.longname || option?.shortname || '').toUpperCase();
  if (!queryUpper) return 0;
  if (sym === queryUpper) return 10000;
  if (sym.startsWith(queryUpper)) return 9000 - sym.length;
  if (name.startsWith(queryUpper)) return 8000 - name.length;
  const idxSym = sym.indexOf(queryUpper);
  if (idxSym >= 0) return 7000 - idxSym * 10 - sym.length;
  const idxName = name.indexOf(queryUpper);
  if (idxName >= 0) return 6000 - idxName * 6 - name.length;
  return 0;
}

async function searchSymbolOptions(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return [];
  const queryUpper = raw.toUpperCase();

  async function tryResolve(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Search failed');
    return data;
  }

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
    const sa = searchScore(queryUpper, a);
    const sb = searchScore(queryUpper, b);
    if (sb !== sa) return sb - sa;
    const pa = popularityRank(a.symbol);
    const pb = popularityRank(b.symbol);
    if (pa !== pb) return pa - pb;
    const au = isUsExchange(a.exchange) ? 1 : 0;
    const bu = isUsExchange(b.exchange) ? 1 : 0;
    if (bu !== au) return bu - au;
    return String(a.symbol || '').localeCompare(String(b.symbol || ''));
  });
  return list.slice(0, 8);
}

function collectHoldings() {
  const rows = [...(portfolioRows?.querySelectorAll('.portfolio-added-item') || [])];
  return rows
    .map((row) => ({
      query: String(row.dataset.query || '').trim(),
      mode: String(row.dataset.mode || 'dollars'),
      value: Number(row.dataset.value || 0)
    }))
    .filter((h) => h.query && Number.isFinite(h.value) && h.value > 0);
}

function renderBriefSummary() {
  if (!portfolioBriefSummary) return;
  const holdings = collectHoldings();
  if (evaluatePortfolioBtn) evaluatePortfolioBtn.disabled = holdings.length === 0;

  if (!holdings.length) {
    portfolioBriefSummary.innerHTML = '<h4>Summary</h4><p>Add at least one holding to see summary.</p>';
    return;
  }

  const totalInput = holdings.reduce((sum, h) => sum + Number(h.value || 0), 0);
  const modeMix = holdings.reduce(
    (acc, h) => {
      acc[h.mode] = (acc[h.mode] || 0) + 1;
      return acc;
    },
    { dollars: 0, units: 0 }
  );

  portfolioBriefSummary.innerHTML = `
    <h4>Summary</h4>
    <p>Holdings: ${holdings.length} | Input Total: ${fmtMoney(totalInput)}</p>
    <p>Dollars entries: ${modeMix.dollars || 0} | Units entries: ${modeMix.units || 0}</p>
  `;
}

function parseCardValue(card) {
  return Math.max(0, Number(card?.dataset?.value || 0));
}

function parseCardUnitPrice(card) {
  return Math.max(0, Number(card?.dataset?.unitPrice || 0));
}

function refreshHoldingCardView(card) {
  if (!card) return;
  const mode = String(card.dataset.mode || 'dollars');
  const value = parseCardValue(card);
  const unitPrice = parseCardUnitPrice(card);
  const dollarValue = mode === 'units' ? (unitPrice > 0 ? value * unitPrice : null) : value;
  const unitValue = mode === 'units' ? value : unitPrice > 0 ? value / unitPrice : null;

  const dollarEl = card.querySelector('[data-card-dollar]');
  const unitEl = card.querySelector('[data-card-unit]');
  if (dollarEl) dollarEl.textContent = `Dollar Value: ${dollarValue == null ? 'N/A' : fmtMoney(dollarValue)}`;
  if (unitEl) unitEl.textContent = `Unit Value: ${unitValue == null ? 'N/A' : fmtNum(unitValue, 2)} units`;
}

function renderAddedHoldingCard(seed) {
  const query = String(seed.query || '').trim();
  const fullName = String(seed.fullName || '').trim();
  const mode = String(seed.mode || 'dollars');
  const value = Number(seed.value || 0);
  const unitPrice = Number(seed.unitPrice || 0);

  const card = document.createElement('div');
  card.className = 'portfolio-added-item';
  card.dataset.query = query;
  card.dataset.fullName = fullName;
  card.dataset.mode = mode;
  card.dataset.value = String(value);
  card.dataset.unitPrice = String(unitPrice > 0 ? unitPrice : 0);

  card.innerHTML = `
    <div class="portfolio-added-main">
      <div class="portfolio-added-details">
        <strong class="portfolio-added-name" data-card-name>${escapeHtml(fullName || query)}</strong>
        <div class="portfolio-added-meta" data-card-symbol>${escapeHtml(query)}</div>
        <div class="portfolio-added-meta" data-card-dollar>Dollar Value: -</div>
        <div class="portfolio-added-meta" data-card-unit>Unit Value: -</div>
      </div>
      <div class="portfolio-added-actions setup-alloc-inputs">
        <div class="setup-stepper">
          <button type="button" class="ghost setup-step-btn" data-card-minus aria-label="Decrease amount">-</button>
          <button type="button" class="ghost setup-step-btn" data-card-plus aria-label="Increase amount">+</button>
        </div>
        <button type="button" class="ghost setup-adjust-btn" data-card-adjust>Adjust</button>
        <button type="button" class="ghost setup-remove-btn portfolio-added-remove">Remove</button>
      </div>
    </div>
  `;

  const changeValue = (direction) => {
    const current = parseCardValue(card);
    const unitPrice = parseCardUnitPrice(card);
    const step = card.dataset.mode === 'units' ? 1 : unitPrice > 0 ? unitPrice : 1;
    const next = Math.max(0, current + direction * step);
    card.dataset.value = String(next);
    refreshHoldingCardView(card);
    renderBriefSummary();
  };

  card.querySelector('[data-card-minus]')?.addEventListener('click', () => changeValue(-1));
  card.querySelector('[data-card-plus]')?.addEventListener('click', () => changeValue(1));
  card.querySelector('[data-card-adjust]')?.addEventListener('click', () => {
    ensureAddHoldingModal().open({
      symbol: card.dataset.query,
      fullName: card.dataset.fullName,
      unitPrice: parseCardUnitPrice(card),
      initialMode: card.dataset.mode || 'dollars',
      initialValue: parseCardValue(card),
      editCard: card
    });
  });

  card.querySelector('.portfolio-added-remove')?.addEventListener('click', () => {
    card.remove();
    renderBriefSummary();
  });

  refreshHoldingCardView(card);
  return card;
}

function hideAddSearchDropdown() {
  portfolioAddDropdown?.classList.add('hidden');
  if (portfolioAddDropdown) portfolioAddDropdown.innerHTML = '';
  addSearchResults = [];
  addSearchIndex = -1;
}

function applyAddSearchSelection(option) {
  if (!option || !portfolioAddQueryInput) return;
  const symbol = String(option.symbol || '').trim();
  portfolioAddQueryInput.value = symbol;
  addSelectedSymbol = symbol.toUpperCase();
  hideAddSearchDropdown();
}

async function requireAddDropdownSelection(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return null;
  const norm = raw.toUpperCase();
  const local = addSearchResults.find((x) => String(x?.symbol || '').toUpperCase() === norm);
  if (local) return local;
  const fetched = await searchSymbolOptions(raw);
  return fetched.find((x) => String(x?.symbol || '').toUpperCase() === norm) || null;
}

function renderAddSearchDropdown() {
  if (!portfolioAddDropdown) return;
  if (!addSearchResults.length) {
    hideAddSearchDropdown();
    return;
  }
  portfolioAddDropdown.classList.remove('hidden');
  portfolioAddDropdown.innerHTML = addSearchResults
    .map((opt, i) => {
      const name = escapeHtml(opt.longname || opt.shortname || opt.symbol);
      const sub = escapeHtml([opt.symbol, opt.exchange, opt.quoteType].filter(Boolean).join(' | '));
      return `<button type="button" class="search-option ${i === addSearchIndex ? 'active' : ''}" data-add-search-index="${i}">
        <div class="search-option-title">${name}</div>
        <div class="search-option-sub">${sub}</div>
      </button>`;
    })
    .join('');
}

async function resolveSymbolForAdd(query) {
  const q = String(query || '').trim();
  if (!q) return null;
  const options = await searchSymbolOptions(q);
  const top = options?.[0] || null;
  if (!top) {
    return {
      symbol: q,
      fullName: q
    };
  }
  return {
    symbol: String(top.symbol || q).trim(),
    fullName: String(top.longname || top.shortname || top.symbol || q).trim()
  };
}

async function fetchUnitPrice(symbol, date) {
  const sym = String(symbol || '').trim();
  const asOfDate = String(date || todayIso()).trim();
  if (!sym) return null;

  try {
    const response = await fetch('/api/assets/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sym, date: asOfDate })
    });
    const data = await response.json();
    if (!response.ok) return null;
    const p = Number(data?.price || data?.asset?.price || 0);
    return p > 0 ? p : null;
  } catch (_error) {
    return null;
  }
}

function getCurrentValueForSymbol(symbol, unitPrice = null, excludeCard = null) {
  const rows = [...(portfolioRows?.querySelectorAll('.portfolio-added-item') || [])].filter((row) => {
    if (excludeCard && row === excludeCard) return false;
    return String(row.dataset.query || '').toUpperCase() === String(symbol).toUpperCase();
  });
  let total = 0;
  for (const row of rows) {
    const rowMode = String(row.dataset.mode || 'dollars');
    const rowValue = Number(row.dataset.value || 0);
    if (rowMode === 'dollars') total += rowValue;
    else if (unitPrice && unitPrice > 0) total += rowValue * unitPrice;
  }
  return total;
}

function ensureAddHoldingModal() {
  if (addHoldingModal) return addHoldingModal;

  const backdrop = document.createElement('div');
  backdrop.className = 'trade-modal-backdrop hidden';
  backdrop.innerHTML = `
    <div class="trade-modal" role="dialog" aria-modal="true" aria-labelledby="portfolioAddModalTitle">
      <h4 id="portfolioAddModalTitle">Add Investment</h4>
      <div class="trade-modal-metrics portfolio-trade-modal-metrics">
        <div class="trade-metric">
          <span>Current Value</span>
          <strong data-add-current>$0.00</strong>
        </div>
        <div class="trade-metric">
          <span>New Value</span>
          <strong data-add-planned>$0.00</strong>
        </div>
      </div>
      <label>
        Amount
        <div class="trade-amount-row">
          <div class="trade-amount-stepper">
            <input data-add-amount type="number" min="0" step="0.01" value="0" />
            <div class="trade-amount-stepper-actions">
              <button type="button" class="ghost setup-step-btn" data-add-minus aria-label="Decrease amount">-</button>
              <button type="button" class="ghost setup-step-btn" data-add-plus aria-label="Increase amount">+</button>
            </div>
          </div>
          <select data-add-mode aria-label="Amount mode">
            <option value="dollars" selected>USD</option>
            <option value="units">Units</option>
          </select>
        </div>
        <div class="trade-unit-inline" data-add-unit>Unit Price: -</div>
      </label>
      <div class="trade-modal-actions">
        <button type="button" class="ghost" data-add-cancel>Cancel</button>
        <button type="button" data-add-confirm>Add</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const titleEl = backdrop.querySelector('#portfolioAddModalTitle');
  const currentEl = backdrop.querySelector('[data-add-current]');
  const plannedEl = backdrop.querySelector('[data-add-planned]');
  const amountInput = backdrop.querySelector('[data-add-amount]');
  const modeSelect = backdrop.querySelector('[data-add-mode]');
  const unitInline = backdrop.querySelector('[data-add-unit]');
  const minusBtn = backdrop.querySelector('[data-add-minus]');
  const plusBtn = backdrop.querySelector('[data-add-plus]');
  const cancelBtn = backdrop.querySelector('[data-add-cancel]');
  const confirmBtn = backdrop.querySelector('[data-add-confirm]');

  const state = {
    symbol: '',
    fullName: '',
    unitPrice: null,
    currentValue: 0,
    editCard: null
  };

  const getAmountAsDollars = () => {
    const amount = Math.max(0, Number(amountInput?.value || 0));
    const mode = String(modeSelect?.value || 'dollars');
    if (mode === 'units') {
      if (!(state.unitPrice > 0)) return 0;
      return amount * state.unitPrice;
    }
    return amount;
  };

  const getStepSize = () => {
    const mode = String(modeSelect?.value || 'dollars');
    if (mode === 'units') return 1;
    if (state.unitPrice > 0) return Math.max(0.01, Number(state.unitPrice.toFixed(2)));
    return 0.01;
  };

  const syncInputStep = () => {
    if (!amountInput) return;
    amountInput.step = String(getStepSize());
  };

  const stepAmount = (direction) => {
    if (!amountInput) return;
    const raw = Number(amountInput.value || 0);
    const base = Number.isFinite(raw) ? raw : 0;
    const next = Math.max(0, Number((base + direction * getStepSize()).toFixed(2)));
    amountInput.value = next.toFixed(2);
    updatePlanned();
  };

  const updatePlanned = () => {
    if (!plannedEl) return;
    plannedEl.textContent = fmtMoney(state.currentValue + getAmountAsDollars());
  };

  const open = ({ symbol, fullName, unitPrice, initialMode = 'dollars', initialValue = null, editCard = null }) => {
    state.symbol = String(symbol || '').trim();
    state.fullName = String(fullName || symbol || '').trim();
    state.unitPrice = Number.isFinite(Number(unitPrice)) && Number(unitPrice) > 0 ? Number(unitPrice) : null;
    state.editCard = editCard || null;
    state.currentValue = getCurrentValueForSymbol(state.symbol, state.unitPrice, state.editCard);

    if (titleEl) titleEl.textContent = `Add ${state.symbol} to portfolio`;
    if (currentEl) currentEl.textContent = fmtMoney(state.currentValue);
    if (unitInline) {
      unitInline.textContent = state.unitPrice ? `Unit Price: ${fmtMoney(state.unitPrice)} / unit` : 'Unit Price: -';
    }
    if (modeSelect) {
      const unitsOption = modeSelect.querySelector('option[value="units"]');
      if (unitsOption) unitsOption.disabled = !(state.unitPrice > 0);
      modeSelect.value = initialMode === 'units' && state.unitPrice > 0 ? 'units' : 'dollars';
    }
    if (amountInput) {
      const seed = Number(initialValue);
      const fallback = state.unitPrice ? Number(state.unitPrice) : 100;
      const initial = Number.isFinite(seed) && seed > 0 ? seed : fallback;
      amountInput.value = Number(initial).toFixed(2);
    }

    syncInputStep();
    updatePlanned();
    backdrop.classList.remove('hidden');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      amountInput?.focus();
      amountInput?.select?.();
    }, 0);
  };

  const close = () => {
    backdrop.classList.add('hidden');
    document.body.classList.remove('modal-open');
  };

  const confirm = () => {
    const amount = Math.max(0, Number(Number(amountInput?.value || 0).toFixed(2)));
    const mode = String(modeSelect?.value || 'dollars');
    if (!(amount > 0) || !state.symbol) {
      portfolioStatus.textContent = 'Enter a valid amount.';
      return;
    }
    if (state.editCard) {
      state.editCard.dataset.query = state.symbol;
      state.editCard.dataset.fullName = state.fullName;
      state.editCard.dataset.mode = mode;
      state.editCard.dataset.value = String(amount);
      state.editCard.dataset.unitPrice = String(state.unitPrice || 0);
      const title = state.editCard.querySelector('[data-card-name]');
      const symbolLine = state.editCard.querySelector('[data-card-symbol]');
      if (title) title.textContent = state.fullName || state.symbol;
      if (symbolLine) symbolLine.textContent = state.symbol;
      refreshHoldingCardView(state.editCard);
      portfolioStatus.textContent = 'Investment adjusted.';
    } else {
      portfolioRows?.appendChild(
        renderAddedHoldingCard({
          query: state.symbol,
          fullName: state.fullName,
          mode,
          value: amount,
          unitPrice: state.unitPrice || 0
        })
      );
      portfolioStatus.textContent = 'Investment added.';
    }
    renderBriefSummary();
    close();
  };

  amountInput?.addEventListener('input', updatePlanned);
  amountInput?.addEventListener('blur', () => {
    const amount = Math.max(0, Number(amountInput?.value || 0));
    amountInput.value = Number(amount).toFixed(2);
    updatePlanned();
  });
  modeSelect?.addEventListener('change', () => {
    syncInputStep();
    updatePlanned();
  });
  minusBtn?.addEventListener('click', () => stepAmount(-1));
  plusBtn?.addEventListener('click', () => stepAmount(1));
  cancelBtn?.addEventListener('click', close);
  confirmBtn?.addEventListener('click', confirm);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener('keydown', (event) => {
    if (!backdrop.classList.contains('hidden') && event.key === 'Escape') close();
  });

  addHoldingModal = { open, close };
  return addHoldingModal;
}

async function addHoldingFromSearch() {
  const rawQuery = String(portfolioAddQueryInput?.value || '').trim();
  if (!rawQuery) {
    portfolioStatus.textContent = 'Search and select an investment first.';
    return;
  }
  const selected = await requireAddDropdownSelection(rawQuery);
  if (!selected || String(selected.symbol || '').toUpperCase() !== String(addSelectedSymbol || '').toUpperCase()) {
    portfolioStatus.textContent = 'Select an investment from the dropdown list.';
    return;
  }

  portfolioStatus.textContent = 'Adding investment...';
  hideAddSearchDropdown();

  try {
    const resolved = await resolveSymbolForAdd(selected.symbol);
    const symbol = String(resolved?.symbol || '').trim();
    const fullName = String(resolved?.fullName || symbol).trim();
    if (!symbol) throw new Error('No symbol found.');
    const asOfDate = todayIso();
    const unitPrice = await fetchUnitPrice(symbol, asOfDate);
    if (portfolioAddQueryInput) portfolioAddQueryInput.value = symbol;
    ensureAddHoldingModal().open({ symbol, fullName, unitPrice });
    portfolioStatus.textContent = 'Set mode and amount in popup.';
  } catch (error) {
    portfolioStatus.textContent = error.message || 'Failed to add investment.';
  }
}

portfolioForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const asOfDate = todayIso();

  const holdings = collectHoldings();
  if (!holdings.length) {
    portfolioStatus.textContent = 'Add at least one valid holding.';
    return;
  }

  portfolioStatus.textContent = 'Evaluating portfolio...';

  try {
    const response = await fetch('/api/valuation/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: 'balanced',
        asOfDate,
        holdings
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Portfolio valuation failed');

    sessionStorage.setItem(
      'investolab.portfolioResult',
      JSON.stringify({
        payload: data,
        asOfDate,
        holdings
      })
    );
    window.location.href = 'portfolio-result.html';
  } catch (error) {
    portfolioStatus.textContent = error.message || 'Failed to evaluate portfolio.';
  }
});

addPortfolioRowBtn?.addEventListener('click', addHoldingFromSearch);

portfolioAddQueryInput?.addEventListener('input', () => {
  const q = String(portfolioAddQueryInput.value || '').trim();
  addSelectedSymbol = '';
  if (addSearchTimer) clearTimeout(addSearchTimer);
  if (!q || q.length < 2) {
    hideAddSearchDropdown();
    return;
  }

  addSearchTimer = setTimeout(async () => {
    try {
      addSearchResults = await searchSymbolOptions(q);
      addSearchIndex = addSearchResults.length ? 0 : -1;
      renderAddSearchDropdown();
    } catch (_error) {
      hideAddSearchDropdown();
    }
  }, 220);
});

portfolioAddQueryInput?.addEventListener('keydown', (event) => {
  if (!addSearchResults.length) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addHoldingFromSearch();
    }
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    addSearchIndex = (addSearchIndex + 1 + addSearchResults.length) % addSearchResults.length;
    renderAddSearchDropdown();
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    addSearchIndex = (addSearchIndex - 1 + addSearchResults.length) % addSearchResults.length;
    renderAddSearchDropdown();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    const candidate = addSearchResults[addSearchIndex] || addSearchResults[0];
    if (candidate) applyAddSearchSelection(candidate);
    else addHoldingFromSearch();
    return;
  }

  if (event.key === 'Escape') hideAddSearchDropdown();
});

portfolioAddDropdown?.addEventListener('mousedown', (event) => {
  event.preventDefault();
  const btn = event.target.closest('button[data-add-search-index]');
  if (!btn) return;
  const idx = Number(btn.dataset.addSearchIndex);
  applyAddSearchSelection(addSearchResults[idx]);
});

portfolioAddQueryInput?.addEventListener('blur', () => {
  setTimeout(hideAddSearchDropdown, 120);
});

renderBriefSummary();

