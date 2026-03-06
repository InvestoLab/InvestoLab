(() => {
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const taskbars = document.querySelectorAll('.taskbar');
  let lastScrollY = window.scrollY || 0;

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
        const topLabel = String(top?.textContent || '').trim();
        if (top) {
          pushLink(
            top.getAttribute('href'),
            top.textContent,
            top.classList.contains('active') || top.getAttribute('aria-current') === 'page'
          );
        }
        const subLinks = [...node.querySelectorAll('.nav-dropdown-menu a')];
        subLinks.forEach((a) => {
          const subLabel = String(a.textContent || '').trim();
          const label = topLabel ? `${topLabel}: ${subLabel}` : subLabel;
          pushLink(
            a.getAttribute('href'),
            label,
            a.classList.contains('active') || a.getAttribute('aria-current') === 'page'
          );
        });
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
