let lastDrawerTrigger = null;

function setDrawerState(open, restoreFocus = true) {
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-backdrop');
  const btn = document.getElementById('nav-menu-btn');
  if (!drawer || !backdrop || !btn) return;

  if (open) {
    lastDrawerTrigger = btn;
    drawer.hidden = false;
    backdrop.hidden = false;
  }

  drawer.classList.toggle('open', open);
  btn.classList.toggle('open', open);
  backdrop.style.display = open ? 'block' : 'none';
  btn.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
  backdrop.setAttribute('aria-hidden', String(!open));

  if (open) {
    const firstLink = drawer.querySelector('.nav-drawer-links a');
    requestAnimationFrame(() => firstLink?.focus());
    return;
  }

  drawer.hidden = true;
  backdrop.hidden = true;
  if (restoreFocus) lastDrawerTrigger?.focus();
}

// Apply saved theme immediately (before paint) to prevent flash
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateToggleIcon(next);
}

function updateToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.innerHTML = isDark ? `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>` : `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
}

// ── MOBILE DRAWER ──────────────────────────────────────────────
function toggleDrawer() {
  const drawer = document.getElementById('nav-drawer');
  if (!drawer) return;
  setDrawerState(!drawer.classList.contains('open'));
}

function closeDrawer(restoreFocus = true) {
  const drawer = document.getElementById('nav-drawer');
  if (!drawer) return;
  setDrawerState(false, restoreFocus);
}

// ── DOMContentLoaded: icons + close drawer on nav link click ──
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme icon
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  updateToggleIcon(current);

  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-backdrop');
  const btn = document.getElementById('nav-menu-btn');

  if (drawer && backdrop && btn) {
    drawer.hidden = true;
    backdrop.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-drawer');
  }

  // Close drawer when any drawer link is tapped
  document.querySelectorAll('.nav-drawer-links a').forEach(link => {
    link.addEventListener('click', () => closeDrawer(false));
  });

  // ── SCROLL ANIMATIONS ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});

// Close drawer on Escape key
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const drawer = document.getElementById('nav-drawer');
  if (drawer?.classList.contains('open')) closeDrawer();
});
