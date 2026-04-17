const API_URL = 'https://digipass-production.up.railway.app:8080/api';

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

  if (!token) {
    logoutExecutor();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/executor/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logoutExecutor();
        return;
      }

      throw new Error(data.message || 'Failed to load executor assets');
    }

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
        </div>
        <p class="asset-date">Added ${formatDate(asset.created_at)}</p>
      </article>
    `).join('');
  } catch (error) {
    console.error('Executor assets error:', error);
    status.textContent = 'Unable to load executor assets right now.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const profile = getExecutorProfile();
  if (!profile || !getExecutorToken()) {
    logoutExecutor();
    return;
  }

  document.getElementById('executorName').textContent = `${profile.executor_name} (${profile.executor_email})`;
  document.getElementById('executorLogoutBtn').addEventListener('click', logoutExecutor);
  loadExecutorAssets();
});
