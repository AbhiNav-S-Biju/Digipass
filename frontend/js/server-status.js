// Server wake-up indicator.
//
// The API runs on Render's free plan, which puts the server to sleep after ~15
// minutes without traffic; the first request then waits 30-60 seconds while it
// starts. This script pings /api/health as soon as any page loads (which also
// starts waking the server early) and, if the answer is slow, shows a small
// "Starting the server" bar until it responds.
//
// Pages can wait for it before calling the API:
//   await DigipassServer.whenReady();
// Load after js/config.js.
(function () {
  const ORIGIN = (window.DIGIPASS_API_ORIGIN || '');
  const HEALTH_URL = `${ORIGIN}/api/health`;
  const SHOW_AFTER_MS = 1200;   // fast answers never show the bar
  const RETRY_EVERY_MS = 3000;
  const WARM_KEY = 'digipass-server-warm-at';
  const WARM_FOR_MS = 5 * 60 * 1000; // a recent success means it's very likely still awake

  let ready = false;
  let resolveReady;
  const readyPromise = new Promise(r => { resolveReady = r; });
  let bar = null;
  let startedAt = Date.now();
  let tick = null;

  function markReady() {
    if (ready) return;
    ready = true;
    try { sessionStorage.setItem(WARM_KEY, String(Date.now())); } catch (e) { /* storage unavailable */ }
    resolveReady();
    window.dispatchEvent(new CustomEvent('digipass:server-ready'));
    if (bar) {
      clearInterval(tick);
      bar.dataset.state = 'ready';
      bar.querySelector('[data-t]').textContent = 'Server is ready.';
      bar.querySelector('small').textContent = "You're good to go.";
      bar.querySelector('[data-s]').textContent = '';
      setTimeout(() => { bar && bar.classList.add('dp-srv-hide'); }, 1600);
      setTimeout(() => { bar && bar.remove(); bar = null; }, 2100);
    }
  }

  function injectStyles() {
    if (document.getElementById('dp-srv-style')) return;
    const css = `
      .dp-srv { position: fixed; z-index: 3000; left: 50%; top: 14px; transform: translateX(-50%);
        display: flex; align-items: center; gap: 12px; width: max-content; max-width: min(560px, calc(100vw - 24px));
        padding: 12px 16px 12px 14px; border-radius: 16px;
        background: #1b3a2d; color: #fdf6ec; border: 1px solid rgba(212,234,216,.35); font: 500 14px/1.4 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
        box-shadow: 0 4px 10px rgba(27,58,45,.18), 0 18px 40px -16px rgba(27,58,45,.55);
        animation: dpSrvIn .35s cubic-bezier(.16,1,.3,1); transition: opacity .4s, transform .4s; }
      .dp-srv.dp-srv-hide { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      .dp-srv .dp-dot { flex: none; width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid rgba(253,246,236,.25); border-top-color: #8cbf9c; animation: dpSrvSpin .9s linear infinite; }
      .dp-srv[data-state="ready"] .dp-dot { animation: none; border-color: #8cbf9c; background: #8cbf9c; }
      .dp-srv b { font-weight: 700; }
      .dp-srv small { display: block; color: rgba(253,246,236,.78); font-size: 12.5px; font-weight: 400; }
      .dp-srv [data-s] { margin-left: auto; padding-left: 8px; font-variant-numeric: tabular-nums; color: rgba(253,246,236,.85); font-size: 13px; }
      @keyframes dpSrvIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%); } }
      @keyframes dpSrvSpin { to { transform: rotate(360deg); } }
      @media (max-width: 767px) {
        .dp-srv { left: 12px; right: 12px; top: calc(10px + env(safe-area-inset-top)); width: auto; max-width: none; transform: none; animation-name: dpSrvInM; }
        .dp-srv.dp-srv-hide { transform: translateY(-10px); }
      }
      @keyframes dpSrvInM { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .dp-srv, .dp-srv .dp-dot { animation: none; } }`;
    const style = document.createElement('style');
    style.id = 'dp-srv-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showBar() {
    if (ready || bar || !document.body) return;
    injectStyles();
    bar = document.createElement('div');
    bar.className = 'dp-srv';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML = `<span class="dp-dot" aria-hidden="true"></span>
      <span><b data-t>Starting the DIGIPASS server…</b>
      <small>It sleeps when nobody has used it for a while. This usually takes under a minute; you can keep reading.</small></span>
      <span data-s></span>`;
    document.body.appendChild(bar);
    tick = setInterval(() => {
      const s = Math.round((Date.now() - startedAt) / 1000);
      const el = bar && bar.querySelector('[data-s]');
      if (el) el.textContent = `${s}s`;
      if (s >= 90 && bar) {
        bar.querySelector('small').textContent = 'Taking longer than usual. If this keeps going, refresh the page.';
      }
    }, 1000);
  }

  async function ping() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(`${HEALTH_URL}?t=${Date.now()}`, { signal: ctrl.signal, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.success !== false) return true;
      }
    } catch (e) { /* asleep, starting, or offline: try again */ }
    finally { clearTimeout(timer); }
    return false;
  }

  async function check() {
    startedAt = Date.now();
    let warmRecently = false;
    try { warmRecently = Date.now() - Number(sessionStorage.getItem(WARM_KEY) || 0) < WARM_FOR_MS; } catch (e) { /* ignore */ }

    // Only show the bar if the first answer is slow (never for a server that's awake)
    const showTimer = setTimeout(showBar, warmRecently ? SHOW_AFTER_MS * 2 : SHOW_AFTER_MS);
    while (!ready) {
      if (await ping()) { clearTimeout(showTimer); markReady(); break; }
      showBar();
      await new Promise(r => setTimeout(r, RETRY_EVERY_MS));
    }
  }

  window.DigipassServer = {
    // Resolves once the API has answered; shows the bar while it waits.
    whenReady() {
      if (ready) return Promise.resolve();
      showBar();
      return readyPromise;
    },
    isReady: () => ready
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
  else check();
})();
