/* ═══════════════════════════════════════════════════════════════
   theme.js — theme toggle · mobile drawer · scroll reveal
   + refined motion (magnetic · spotlight · count-up)
═══════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(pointer: fine)').matches;

/* ── THEME (apply before paint to avoid flash) ──────────────── */
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>` : `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
}

/* ── MOBILE DRAWER ──────────────────────────────────────────── */
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

/* ── SCROLL REVEAL (staggered, progressive enhancement) ─────── */
function initReveal() {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;

  // Reduced motion or no IntersectionObserver: leave content in its default visible state.
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  // Prime the animation system so CSS can hide pre-reveal items.
  document.documentElement.setAttribute('data-anim-ready', '');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ── MAGNETIC BUTTONS (transform only, outside render cycle) ── */
function initMagnetic() {
  if (reduceMotion || !finePointer) return;
  const STRENGTH = 0.28;
  const MAX = 10;

  document.querySelectorAll('.magnetic').forEach(el => {
    let frame = null;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      const tx = Math.max(-MAX, Math.min(MAX, x * STRENGTH));
      const ty = Math.max(-MAX, Math.min(MAX, y * STRENGTH));
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { el.style.transform = `translate(${tx}px, ${ty}px)`; });
    };
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
  });
}

/* ── SPOTLIGHT CARDS (cursor-tracked CSS vars) ──────────────── */
function initSpotlight() {
  if (reduceMotion || !finePointer) return;
  document.querySelectorAll('.spotlight').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* ── COUNT-UP STATS ─────────────────────────────────────────── */
function initCountUp() {
  const nums = document.querySelectorAll('.stat-val[data-count]');
  if (!nums.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  nums.forEach(el => observer.observe(el));
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateToggleIcon(document.documentElement.getAttribute('data-theme') || 'dark');

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

  document.querySelectorAll('.nav-drawer-links a').forEach(link => {
    link.addEventListener('click', () => closeDrawer(false));
  });

  initReveal();
  initMagnetic();
  initSpotlight();
  initCountUp();
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const drawer = document.getElementById('nav-drawer');
  if (drawer?.classList.contains('open')) closeDrawer();
});
