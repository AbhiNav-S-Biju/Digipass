// Resolves where the DIGIPASS API lives, so every page talks to the right backend.
//
// The Node server (server.js) serves this frontend AND the /api routes, so when the
// page comes from that server (localhost:3000, Render, Vercel) the API is same-origin.
// Only when the frontend is hosted separately do we need an absolute backend URL.
(function () {
  var RENDER_BACKEND = 'https://digipass-3l63.onrender.com';
  var LOCAL_BACKEND = 'http://localhost:3000';
  var loc = window.location;
  var origin = '';

  if (loc.protocol === 'file:' || loc.hostname.endsWith('netlify.app')) {
    // Static-only hosting: no backend on this origin.
    origin = RENDER_BACKEND;
  } else if ((loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') && loc.port !== '3000') {
    // Frontend served by a dev static server (e.g. Live Server on :5500 / :8080).
    origin = LOCAL_BACKEND;
  }

  // Allow an explicit override set before this script loads.
  if (typeof window.DIGIPASS_API_ORIGIN !== 'string') {
    window.DIGIPASS_API_ORIGIN = origin;
  }
})();
