// Shared app shell: collapsible glass sidebar, profile menus, mobile dock state.
// Used by dashboard.html and executor-dashboard.html.
(function () {
  const COLLAPSE_KEY = 'digipass-sidebar-collapsed';

  function readCollapsed() {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) { return false; }
  }
  function writeCollapsed(value) {
    try { localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0'); } catch (e) { /* storage unavailable */ }
  }

  function initSidebar() {
    const app = document.getElementById('app');
    const toggle = document.getElementById('sbToggle');
    if (!app || !toggle) return;

    const apply = (collapsed) => {
      app.classList.toggle('sb-collapsed', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? 'Expand menu' : 'Collapse menu');
    };
    apply(readCollapsed());
    toggle.addEventListener('click', () => {
      const collapsed = !app.classList.contains('sb-collapsed');
      apply(collapsed);
      writeCollapsed(collapsed);
    });
  }

  // A popover menu; `fixed` places it beside the trigger so the scrolling sidebar can't clip it.
  function initMenu(triggerId, popId, fixed) {
    const trigger = document.getElementById(triggerId);
    const pop = document.getElementById(popId);
    if (!trigger || !pop) return;

    const close = () => {
      pop.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !pop.classList.contains('open');
      document.querySelectorAll('.profile-pop.open').forEach(p => p.classList.remove('open'));
      if (open && fixed) {
        const r = trigger.getBoundingClientRect();
        pop.style.left = `${Math.round(r.right + 12)}px`;
        pop.style.bottom = `${Math.round(window.innerHeight - r.bottom)}px`;
      }
      pop.classList.toggle('open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!pop.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', close);
  }

  // Fill every name/email/initials slot in the shell
  function fillProfile(name, email) {
    const initials = String(name || 'U').trim().split(/\s+/).filter(Boolean)
      .map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    document.querySelectorAll('.js-name').forEach(el => { el.textContent = name || 'User'; });
    document.querySelectorAll('.js-email').forEach(el => { el.textContent = email || ''; });
    document.querySelectorAll('.js-initials').forEach(el => { el.textContent = initials; });
  }

  // Slide the sidebar highlight and the dock's bump to whichever item is active.
  // Pages only toggle the .active class; a MutationObserver keeps these in step.
  function initIndicators() {
    const nav = document.querySelector('.sb-nav');
    const dock = document.querySelector('.dock');
    let indicator = null;
    let bump = null;

    if (nav) {
      indicator = document.createElement('span');
      indicator.className = 'sb-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      nav.prepend(indicator);
    }
    if (dock) {
      bump = document.createElement('span');
      bump.className = 'dock-bump';
      bump.setAttribute('aria-hidden', 'true');
      dock.prepend(bump);
    }

    const sync = () => {
      if (nav && indicator) {
        const active = nav.querySelector('.sb-item.active');
        if (active) {
          indicator.style.top = `${active.offsetTop}px`;
          indicator.style.height = `${active.offsetHeight}px`;
        }
        // Only touch the class when it actually changes: classList writes count as
        // mutations and would re-trigger the observer below forever.
        const want = Boolean(active);
        if (indicator.classList.contains('ready') !== want) indicator.classList.toggle('ready', want);
      }
      if (dock && bump) {
        const active = dock.querySelector('.dock-item.active');
        if (active) {
          bump.style.left = `${active.offsetLeft + active.offsetWidth / 2}px`;
          bump.style.opacity = '1';
        } else {
          bump.style.opacity = '0';
        }
      }
    };

    // React only to the nav items' own class changes, never to the indicator/bump
    const observer = new MutationObserver((records) => {
      if (records.some(r => r.target !== indicator && r.target !== bump)) sync();
    });
    [nav, dock].forEach(el => el && observer.observe(el, { subtree: true, attributes: true, attributeFilter: ['class'] }));
    window.addEventListener('resize', sync);
    // Collapsing the sidebar changes item sizes; resync after the width transition
    const app = document.getElementById('app');
    if (app) app.addEventListener('transitionend', sync);
    requestAnimationFrame(sync);
  }

  window.DigipassShell = { initSidebar, initMenu, fillProfile, initIndicators };

  // Pages call togglePanel(false) after navigation; the old slide-in panel is gone.
  if (typeof window.togglePanel !== 'function') window.togglePanel = function () {};
})();
