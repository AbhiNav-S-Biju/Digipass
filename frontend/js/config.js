// Resolves where the DIGIPASS API lives, so every page talks to the right backend.
//
// The API only runs on the Node server (server.js). That server also serves this
// frontend on Render and on localhost:3000, where the API is same-origin.
// Everywhere else (Vercel, Netlify, file://, a dev static server) serves the
// frontend only, so API calls must go to the Render backend (or the local server).
// Vercel serves static files only: /api there returns a plain-text 404.
(function () {
  var RENDER_BACKEND = 'https://digipass-3l63.onrender.com';
  var LOCAL_BACKEND = 'http://localhost:3000';
  var loc = window.location;
  var host = loc.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  var origin;

  if (loc.origin === RENDER_BACKEND) {
    origin = '';                       // served by the Render API server itself
  } else if (isLocal && loc.port === '3000') {
    origin = '';                       // local Node server (npm start)
  } else if (isLocal) {
    origin = LOCAL_BACKEND;            // local static server (Live Server, etc.)
  } else {
    origin = RENDER_BACKEND;           // Vercel, Netlify, file://, anything else
  }

  // Allow an explicit override set before this script loads.
  if (typeof window.DIGIPASS_API_ORIGIN !== 'string') {
    window.DIGIPASS_API_ORIGIN = origin;
  }
})();
