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

  window.DigipassShell = { initSidebar, initMenu, fillProfile };

  // Pages call togglePanel(false) after navigation; the old slide-in panel is gone.
  if (typeof window.togglePanel !== 'function') window.togglePanel = function () {};
})();
