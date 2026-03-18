(() => {
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const taskbars = document.querySelectorAll('.taskbar');
  let lastScrollY = window.scrollY || 0;
  const mainEl = document.querySelector('main');
  const body = document.body;

  if (mainEl) {
    if (!mainEl.id) {
      mainEl.id = 'main-content';
    }
    if (!mainEl.hasAttribute('tabindex')) {
      mainEl.setAttribute('tabindex', '-1');
    }
  }

  if (body && mainEl && !document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = `#${mainEl.id}`;
    skipLink.textContent = 'Skip to content';
    skipLink.addEventListener('click', () => {
      window.setTimeout(() => {
        mainEl.focus({ preventScroll: true });
      }, 0);
    });
    body.insertBefore(skipLink, body.firstChild);
  }

  let progressBar = document.querySelector('.page-progress-bar');
  if (!progressBar && body) {
    const progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<div class="page-progress-bar"></div>';
    body.appendChild(progress);
    progressBar = progress.querySelector('.page-progress-bar');
  }

  let backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn && body) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.type = 'button';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.textContent = 'Top';
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    body.appendChild(backToTopBtn);
  }

  let connectionBanner = document.querySelector('.connection-banner');
  if (!connectionBanner && body) {
    connectionBanner = document.createElement('div');
    connectionBanner.className = 'connection-banner hidden';
    connectionBanner.setAttribute('role', 'status');
    connectionBanner.setAttribute('aria-live', 'polite');
    connectionBanner.textContent = 'Offline mode: live prices and headlines may be stale.';
    body.appendChild(connectionBanner);
  }

  const updateReadingProgress = () => {
    if (!progressBar || !mainEl) return;
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  };

  const updateBackToTopVisibility = () => {
    if (!backToTopBtn) return;
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    backToTopBtn.classList.toggle('is-visible', scrollTop > 420);
  };

  const updateConnectionBanner = () => {
    if (!connectionBanner) return;
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    connectionBanner.classList.toggle('hidden', !isOffline);
    connectionBanner.classList.toggle('is-visible', isOffline);
  };

  updateReadingProgress();
  updateBackToTopVisibility();
  updateConnectionBanner();

  window.addEventListener(
    'scroll',
    () => {
      updateReadingProgress();
      updateBackToTopVisibility();
    },
    { passive: true }
  );
  window.addEventListener('resize', updateReadingProgress, { passive: true });
  window.addEventListener('online', updateConnectionBanner);
  window.addEventListener('offline', updateConnectionBanner);

  taskbars.forEach((taskbar, index) => {
    const taskLinks = taskbar.querySelector('.task-links');
    if (!taskLinks) return;
    taskbar.classList.add('taskbar-mobile-flat');

    if (!taskLinks.id) {
      taskLinks.id = `task-links-${index + 1}`;
    }

    const menuButton = document.createElement('button');
    menuButton.className = 'taskbar-menu-toggle';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-controls', taskLinks.id);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Toggle navigation menu');
    menuButton.innerHTML = '<span class="burger-icon" aria-hidden="true"></span>';
    taskbar.insertBefore(menuButton, taskLinks);
    menuButton.hidden = true;
    menuButton.style.display = 'none';

    const navDropdowns = [...taskLinks.querySelectorAll('.nav-dropdown')];

    const mobilePrimaryLinks = document.createElement('div');
    mobilePrimaryLinks.className = 'mobile-primary-links';
    taskbar.insertBefore(mobilePrimaryLinks, taskLinks);

    const buildMobileFlatLinks = () => {
      const seen = new Set();
      const links = [];
      const pushLink = (href, label, active = false) => {
        const h = String(href || '').trim();
        const t = String(label || '').trim();
        if (!h || !t || seen.has(h)) return;
        seen.add(h);
        links.push({ href: h, label: t, active: !!active });
      };

      [...taskLinks.children].forEach((node) => {
        if (node.matches && node.matches('a')) {
          pushLink(
            node.getAttribute('href'),
            node.textContent,
            node.classList.contains('active') || node.getAttribute('aria-current') === 'page'
          );
          return;
        }
        if (!(node.classList && node.classList.contains('nav-dropdown'))) return;
        const top = node.querySelector('.nav-dropdown-toggle');
        if (top) {
          pushLink(
            top.getAttribute('href'),
            top.textContent,
            top.classList.contains('active') || top.getAttribute('aria-current') === 'page'
          );
        }
      });

      mobilePrimaryLinks.innerHTML = links
        .map(
          (item) =>
            `<a href="${item.href}"${item.active ? ' class="active" aria-current="page"' : ''}>${item.label}</a>`
        )
        .join('');
    };
    buildMobileFlatLinks();

    const closeDropdowns = () => {
      navDropdowns.forEach((dd) => dd.classList.remove('open'));
    };

    const closeMenu = () => {
      taskbar.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    };

    const toggleMenu = () => {
      if (!mobileQuery.matches) return;
      const isOpen = taskbar.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (!isOpen) closeDropdowns();
    };

    const syncViewportState = () => {
      if (mobileQuery.matches) {
        menuButton.hidden = false;
        menuButton.style.display = 'inline-flex';
      } else {
        closeMenu();
        taskbar.classList.remove('taskbar-hidden-mobile');
        lastScrollY = window.scrollY || 0;
        menuButton.hidden = true;
        menuButton.style.display = 'none';
      }
    };

    menuButton.addEventListener('click', toggleMenu);

    taskLinks.addEventListener('click', (event) => {
      const clickedLink = event.target.closest('a');
      if (!clickedLink || !mobileQuery.matches) return;
      closeMenu();
    });

    mobilePrimaryLinks.addEventListener('click', (event) => {
      const clickedLink = event.target.closest('a');
      if (!clickedLink || !mobileQuery.matches) return;
      closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!mobileQuery.matches || !taskbar.classList.contains('menu-open')) return;
      if (taskbar.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    mobileQuery.addEventListener('change', syncViewportState);
    syncViewportState();

    window.addEventListener(
      'scroll',
      () => {
        if (!mobileQuery.matches) return;
        if (taskbar.classList.contains('menu-open')) {
          taskbar.classList.remove('taskbar-hidden-mobile');
          lastScrollY = window.scrollY || 0;
          return;
        }
        const currentY = window.scrollY || 0;
        const delta = currentY - lastScrollY;
        const nearTop = currentY <= 8;
        if (nearTop || delta < -2) {
          taskbar.classList.remove('taskbar-hidden-mobile');
        } else if (delta > 2) {
          taskbar.classList.add('taskbar-hidden-mobile');
        }
        lastScrollY = currentY;
      },
      { passive: true }
    );
  });
})();
