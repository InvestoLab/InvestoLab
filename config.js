(() => {
  // Set this once to your deployed backend URL (no trailing slash).
  // Example: https://investolab-api.onrender.com
  window.INVESTOLAB_API_BASE = window.INVESTOLAB_API_BASE || window.localStorage?.getItem('INVESTOLAB_API_BASE') || '';

  // Dev-only: bust stylesheet cache on localhost so changes show immediately.
  const host = String(window.location.hostname || '');
  if (host === 'localhost' || host === '127.0.0.1') {
    const link = document.querySelector('link[href^="styles.css"]');
    if (link) {
      link.href = `styles.css?v=${Date.now()}`;
    }
  }
})();
