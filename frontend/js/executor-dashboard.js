const API_URL = 'https://digipass-3l63.onrender.com/api';

function getExecutorToken() {
  return localStorage.getItem('executorToken');
}

function getExecutorProfile() {
  const raw = localStorage.getItem('executorProfile');
  return raw ? JSON.parse(raw) : null;
}

function logoutExecutor() {
  localStorage.removeItem('executorToken');
  localStorage.removeItem('executorProfile');
  window.location.href = 'executor-login.html';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char];
  });
}

function formatAssetType(type) {
  return String(type)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'recently';
}

async function loadExecutorAssets() {
  const token = getExecutorToken();
  const status = document.getElementById('executorAssetsStatus');
  const list = document.getElementById('executorAssetsList');

  console.log('[Executor Dashboard] loadExecutorAssets called');
  console.log('[Executor Dashboard] Token exists:', !!token);
  console.log('[Executor Dashboard] Token value:', token ? token.substring(0, 50) + '...' : 'none');

  if (!token) {
    console.log('[Executor Dashboard] No token found, logging out');
    logoutExecutor();
    return;
  }

  try {
    console.log('[Executor Dashboard] Fetching assets from API...');
    const response = await fetch(`${API_URL}/executor/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[Executor Dashboard] API response status:', response.status);
    console.log('[Executor Dashboard] API response ok:', response.ok);

    const data = await response.json();
    
    console.log('[Executor Dashboard] API response data:', data);

    if (!response.ok) {
      console.log('[Executor Dashboard] API response not ok');
      if (response.status === 401 || response.status === 403) {
        console.log('[Executor Dashboard] Unauthorized/Forbidden, logging out');
        logoutExecutor();
        return;
      }

      throw new Error(data.message || 'Failed to load executor assets');
    }

    console.log('[Executor Dashboard] Assets loaded successfully');
    document.getElementById('ownerName').textContent = `${data.data.owner.full_name} (${data.data.owner.email})`;
    status.textContent = `${data.data.count} asset(s) available to this executor`;

    if (!data.data.assets.length) {
      list.innerHTML = '';
      status.textContent = 'No accessible digital assets were found.';
      return;
    }

    list.innerHTML = data.data.assets.map((asset) => `
      <article class="asset-card">
        <div class="asset-card-header">
          <div>
            <h4>${escapeHtml(asset.asset_name)}</h4>
            <p class="asset-type">${escapeHtml(formatAssetType(asset.asset_type))}</p>
          </div>
          <button class="asset-action-btn" onclick="openWorkflow('${asset.asset_id}', '${token}')">
            <i class="fas fa-play-circle"></i> Start
          </button>
        </div>
        <p class="asset-date">Added ${formatDate(asset.created_at)}</p>
      </article>
    `).join('');
  } catch (error) {
    console.error('[Executor Dashboard] Assets error:', error);
    status.textContent = 'Unable to load executor assets right now.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const profile = getExecutorProfile();
  const token = getExecutorToken();
  
  console.log('[Executor Dashboard] DOMContentLoaded');
  console.log('[Executor Dashboard] Profile exists:', !!profile);
  console.log('[Executor Dashboard] Token exists:', !!token);
  
  if (!profile || !token) {
    console.log('[Executor Dashboard] Missing profile or token, redirecting to login');
    logoutExecutor();
    return;
  }

  console.log('[Executor Dashboard] Loading dashboard for:', profile.executor_name);
  document.getElementById('executorName').textContent = `${profile.executor_name} (${profile.executor_email})`;
  document.getElementById('executorLogoutBtn').addEventListener('click', logoutExecutor);
  loadExecutorAssets();
});
