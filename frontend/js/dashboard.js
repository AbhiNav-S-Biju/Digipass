let assetsState = {
  items: [],
  loaded: false
};

let executorsState = {
  items: [],
  loaded: false
};

// Platform icon mapping
const PLATFORM_ICONS = {
  'Instagram': 'fab fa-instagram',
  'Facebook': 'fab fa-facebook',
  'Twitter': 'fab fa-twitter',
  'LinkedIn': 'fab fa-linkedin',
  'TikTok': 'fab fa-tiktok',
  'Snapchat': 'fab fa-snapchat',
  'Discord': 'fab fa-discord',
  'Gmail': 'fas fa-envelope',
  'Outlook': 'fas fa-envelope',
  'Yahoo Mail': 'fas fa-envelope',
  'ProtonMail': 'fas fa-envelope',
  'Apple Mail': 'fas fa-envelope',
  'PayPal': 'fab fa-paypal',
  'Amazon': 'fab fa-amazon',
  'Banking App': 'fas fa-university',
  'Stripe': 'fab fa-stripe-s',
  'Square': 'fas fa-square',
  'Google Drive': 'fab fa-google-drive',
  'Dropbox': 'fab fa-dropbox',
  'OneDrive': 'fas fa-cloud',
  'iCloud': 'fas fa-cloud',
  'Netflix': 'fas fa-tv',
  'Spotify': 'fab fa-spotify',
  'Disney+': 'fas fa-play-circle',
  'Hulu': 'fas fa-play-circle',
  'Other': 'fas fa-lock'
};

function getPlatformIcon(platformName) {
  return PLATFORM_ICONS[platformName] || 'fas fa-lock';
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;

  const user = getUser();
  if (user) {
    document.getElementById('userName').textContent = user.fullName || user.email;
  }

  // Initialize dashboard
  initDashboard();
  bindAssetActions();
  bindExecutorActions();
  loadDashboardData();
});

// Initialize dashboard page navigation
function initDashboard() {
  // Get all navigation links with data-page attribute
  const navLinks = document.querySelectorAll('a[data-page]');
  const pages = document.querySelectorAll('.page');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = link.dataset.page;
      navigateToPage(pageName);
    });
  });

  // Also listen for hash changes (for anchor links and back button)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
      navigateToPage(hash);
    }
  });

  // Load initial page from hash on page load
  const initialHash = window.location.hash.slice(1);
  if (initialHash) {
    navigateToPage(initialHash);
  }
}

// Navigate to a specific page
function navigateToPage(pageName) {
  const navLinks = document.querySelectorAll('a[data-page]');
  const pages = document.querySelectorAll('.page');

  // Remove active class from all links and pages
  navLinks.forEach(l => l.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));

  // Find and activate the link and page for this pageName
  const activeLink = document.querySelector(`a[data-page="${pageName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  const targetPage = document.getElementById(`${pageName}Page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Close navbar menu on mobile using Bootstrap method
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarNav');
  
  // Check if navbar is shown (mobile view) and close it
  if (navbarToggler && navbarCollapse && navbarCollapse.classList.contains('show')) {
    // Click the toggler to close the menu
    navbarToggler.click();
  }

  // Load page data
  loadPageData(pageName);
}

// Load page data
function loadPageData(pageName) {
  switch(pageName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'assets':
      loadAssetsData();
      break;
    case 'executors':
      loadExecutorsData();
      break;
    case 'will':
      loadWillData();
      break;
    case 'switch':
      loadSwitchData();
      break;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    if (!assetsState.loaded) {
      await loadAssetsData();
    } else {
      updateAssetCount();
    }

    if (!executorsState.loaded) {
      await loadExecutorsData();
    } else {
      updateExecutorCount();
    }

    document.getElementById('willCount').textContent = '0';
    
    // Load dead man's switch status
    try {
      const statusRes = await apiCall('/dead-mans-switch/status', 'GET');
      if (statusRes && statusRes.success) {
        const status = statusRes.data.status === 'active' ? 'Active' : 'Triggered';
        document.getElementById('switchStatus').textContent = status;
      } else {
        document.getElementById('switchStatus').textContent = 'Inactive';
      }
    } catch (err) {
      document.getElementById('switchStatus').textContent = 'Inactive';
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadAssetsData() {
  const assetsStatus = document.getElementById('assetsStatus');

  try {
    assetsStatus.textContent = 'Loading assets...';

    const response = await apiCall('/assets', 'GET');
    assetsState.items = Array.isArray(response.data) ? response.data : [];
    assetsState.loaded = true;

    renderAssets();
    updateAssetCount();
  } catch (error) {
    assetsStatus.textContent = 'Unable to load assets right now.';
    showNotification(error.message || 'Failed to load assets', 'error');
  }
}

async function loadExecutorsData() {
  const executorsStatus = document.getElementById('executorsStatus');

  try {
    executorsStatus.textContent = 'Loading executors...';

    const response = await apiCall('/executors', 'GET');
    executorsState.items = Array.isArray(response.data) ? response.data : [];
    executorsState.loaded = true;

    renderExecutors();
    updateExecutorCount();
  } catch (error) {
    executorsStatus.textContent = 'Unable to load executors right now.';
    showNotification(error.message || 'Failed to load executors', 'error');
  }
}

// Load will data
async function loadWillData() {
  const willDetails = document.getElementById('willDetails');
  const willContent = document.getElementById('willContent');

  try {
    willDetails.textContent = 'Loading will information...';
    
    // Load assets and executors data
    const [assetsData, executorsData] = await Promise.all([
      apiCall('/assets', 'GET').catch(() => ({ data: [] })),
      apiCall('/executors', 'GET').catch(() => ({ data: [] }))
    ]);

    const assets = Array.isArray(assetsData.data) ? assetsData.data : [];
    const executors = Array.isArray(executorsData.data) ? executorsData.data : [];

    // Update counts
    document.getElementById('willAssetCount').textContent = assets.length;
    document.getElementById('willExecutorCount').textContent = executors.length;

    // Build will content display
    renderWillContent(assets, executors);
    willDetails.textContent = 'Your will summary:';
  } catch (error) {
    willDetails.textContent = 'Unable to load will information.';
    console.error('Error loading will data:', error);
  }

  // Bind will generation button
  const generateBtn = document.getElementById('generateWillBtn');
  generateBtn.addEventListener('click', handleGenerateWill);
  
  const refreshBtn = document.getElementById('refreshWillBtn');
  refreshBtn.addEventListener('click', loadWillData);
}

function renderWillContent(assets, executors) {
  const willContent = document.getElementById('willContent');
  let content = '';

  const actionLabels = {
    'pass': 'Pass to Executor',
    'delete': 'Delete Account',
    'last_message': 'Final Message'
  };

  // Assets Section
  content += '<div class="will-section">';
  content += '<h4>📋 Digital Assets (' + assets.length + ')</h4>';
  
  if (assets.length === 0) {
    content += '<p><em>No assets added yet. Add assets from the Digital Assets tab.</em></p>';
  } else {
    assets.forEach(asset => {
      content += '<div class="will-item">';
      content += '<div class="will-item-name">' + escapeHtml(asset.platform_name || 'Unknown') + '</div>';
      content += '<div class="will-item-meta">Account: ' + escapeHtml(asset.account_identifier || 'N/A') + '</div>';
      content += '<div class="will-item-meta">Action: ' + (actionLabels[asset.action_type] || asset.action_type) + '</div>';
      if (asset.last_message) {
        content += '<div class="will-item-meta small">Message: ' + escapeHtml(asset.last_message.substring(0, 75)) + (asset.last_message.length > 75 ? '...' : '') + '</div>';
      }
      content += '<div class="will-item-meta">Added: ' + formatAssetDate(asset.created_at) + '</div>';
      content += '</div>';
    });
  }
  content += '</div>';

  // Executors Section
  content += '<div class="will-section">';
  content += '<h4>👥 Executors (' + executors.length + ')</h4>';
  
  if (executors.length === 0) {
    content += '<p><em>No executors assigned yet. Add executors from the Executors tab.</em></p>';
  } else {
    executors.forEach(executor => {
      content += '<div class="will-item">';
      content += '<div class="will-item-name">' + escapeHtml(executor.executor_name) + '</div>';
      content += '<div class="will-item-meta">Email: ' + escapeHtml(executor.executor_email) + '</div>';
      content += '<div class="will-item-meta">Status: ' + escapeHtml(executor.verification_status) + '</div>';
      content += '<div class="will-item-meta">Access: ' + (executor.access_granted ? '✓ Granted' : '✗ Not Granted') + '</div>';
      if (executor.relationship) {
        content += '<div class="will-item-meta">Relationship: ' + escapeHtml(executor.relationship) + '</div>';
      }
      content += '</div>';
    });
  }
  content += '</div>';

  // Instructions Section
  content += '<div class="will-section">';
  content += '<h4>📝 Instructions</h4>';
  content += '<p>Your digital will automatically includes:</p>';
  content += '<ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #6b7280;">';
  content += '<li>All registered digital assets</li>';
  content += '<li>All assigned executors and their status</li>';
  content += '<li>Your personal information</li>';
  content += '<li>Asset type categorization</li>';
  content += '</ul>';
  content += '<p style="margin-top: 1rem; font-size: 0.9rem; color: #999;">Click "Generate Digital Will (PDF)" to create an official PDF document.</p>';
  content += '</div>';

  willContent.innerHTML = content;
}

async function handleGenerateWill() {
  const generateBtn = document.getElementById('generateWillBtn');
  const willStatus = document.getElementById('willStatus');

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  willStatus.textContent = 'Generating PDF...';
  willStatus.style.color = '#f59e0b';

  try {
    const response = await apiCall('/generate-will', 'GET');

    if (response.success && response.data) {
      // Use download URL from response
      const downloadUrl = response.data.download_url;
      
      if (downloadUrl) {
        // Download via the proper API endpoint
        const token = localStorage.getItem('token');
        
        const downloadResponse = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!downloadResponse.ok) {
          throw new Error('Failed to download PDF');
        }

        // Create blob from response and download
        const blob = await downloadResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `digital-will-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        showNotification('Digital will generated and downloaded successfully!', 'success');
        willStatus.textContent = '✓ Generated';
        willStatus.style.color = '#10b981';
      } else {
        throw new Error('No download URL provided');
      }
    } else {
      throw new Error(response.message || 'Failed to generate will');
    }
  } catch (error) {
    console.error('Will generation error:', error);
    willStatus.textContent = '✗ Error';
    willStatus.style.color = '#ef4444';
    showNotification(error.message || 'Failed to generate digital will', 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Digital Will (PDF)';
  }
}

function bindAssetActions() {
  const assetForm = document.getElementById('assetForm');
  const refreshAssetsBtn = document.getElementById('refreshAssetsBtn');
  const messageContainer = document.getElementById('messageContainer');
  const actionTypeRadios = document.querySelectorAll('input[name="actionType"]');

  assetForm.addEventListener('submit', handleAssetSubmit);
  refreshAssetsBtn.addEventListener('click', () => {
    loadAssetsData();
  });

  // Show/hide message field based on action type selection
  actionTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'last_message') {
        messageContainer.style.display = 'block';
      } else {
        messageContainer.style.display = 'none';
      }
    });
  });

  document.getElementById('assetsList').addEventListener('click', handleAssetDelete);
}

function bindExecutorActions() {
  const executorForm = document.getElementById('executorForm');
  const refreshExecutorsBtn = document.getElementById('refreshExecutorsBtn');

  executorForm.addEventListener('submit', handleExecutorSubmit);
  refreshExecutorsBtn.addEventListener('click', () => {
    loadExecutorsData();
  });
}

async function handleAssetSubmit(event) {
  event.preventDefault();

  const submitButton = document.getElementById('assetSubmitBtn');
  const platformName = document.getElementById('platformName').value.trim();
  const accountIdentifier = document.getElementById('accountIdentifier').value.trim();
  const accountPassword = document.getElementById('accountPassword').value.trim();
  const actionType = document.querySelector('input[name="actionType"]:checked')?.value;
  const lastMessage = document.getElementById('lastMessage').value.trim();

  if (!platformName || !accountIdentifier || !accountPassword || !actionType) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }

  if (actionType === 'last_message' && !lastMessage) {
    showNotification('Please write your final message.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    // Determine category based on platform
    const categoryMap = {
      'Instagram': 'social', 'Facebook': 'social', 'Twitter': 'social', 'LinkedIn': 'social',
      'TikTok': 'social', 'Snapchat': 'social', 'Discord': 'social',
      'Gmail': 'email', 'Outlook': 'email', 'Yahoo Mail': 'email', 'ProtonMail': 'email', 'Apple Mail': 'email',
      'PayPal': 'finance', 'Amazon': 'finance', 'Banking App': 'finance', 'Stripe': 'finance', 'Square': 'finance',
      'Google Drive': 'storage', 'Dropbox': 'storage', 'OneDrive': 'storage', 'iCloud': 'storage',
      'Netflix': 'entertainment', 'Spotify': 'entertainment', 'Disney+': 'entertainment', 'Hulu': 'entertainment',
      'Other': 'other'
    };

    const category = categoryMap[platformName] || 'other';

    const response = await apiCall('/assets', 'POST', {
      platform_name: platformName,
      category: category,
      account_identifier: accountIdentifier,
      account_password: accountPassword,
      action_type: actionType,
      last_message: actionType === 'last_message' ? lastMessage : null
    });

    assetsState.items.unshift(response.data);
    assetsState.loaded = true;
    renderAssets();
    updateAssetCount();

    event.target.reset();
    document.getElementById('messageContainer').style.display = 'none';
    showNotification('Asset added successfully.', 'success');
  } catch (error) {
    showNotification(error.message || 'Failed to add asset', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Add Asset';
  }
}

async function handleAssetDelete(event) {
  const deleteButton = event.target.closest('[data-delete-id]');
  if (!deleteButton) {
    return;
  }

  const assetId = deleteButton.dataset.deleteId;
  deleteButton.disabled = true;
  deleteButton.textContent = 'Deleting...';

  try {
    await apiCall(`/assets/${assetId}`, 'DELETE');

    assetsState.items = assetsState.items.filter((asset) => String(asset.asset_id) !== String(assetId));
    renderAssets();
    updateAssetCount();
    showNotification('Asset deleted successfully.', 'success');
  } catch (error) {
    deleteButton.disabled = false;
    deleteButton.textContent = 'Delete';
    showNotification(error.message || 'Failed to delete asset', 'error');
  }
}

function renderAssets() {
  const assetsList = document.getElementById('assetsList');
  const assetsStatus = document.getElementById('assetsStatus');

  if (!assetsState.items.length) {
    assetsList.innerHTML = '';
    assetsStatus.textContent = 'No assets added yet.';
    return;
  }

  assetsStatus.textContent = `${assetsState.items.length} asset(s) saved`;
  
  const actionEmojis = {
    'pass': '📤',
    'delete': '🗑️',
    'last_message': '💬'
  };

  assetsList.innerHTML = assetsState.items.map((asset) => {
    const actionLabel = {
      'pass': 'Pass to Executor',
      'delete': 'Delete Account',
      'last_message': 'Final Message'
    }[asset.action_type] || asset.action_type;

    const platformIcon = getPlatformIcon(asset.platform_name);

    return `
    <article class="asset-card mb-3">
      <div class="asset-card-header d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div style="font-size: 1.5rem; color: #102c26; width: 40px; text-align: center;">
            <i class="${platformIcon}"></i>
          </div>
          <div>
            <h4 class="mb-1">${escapeHtml(asset.platform_name)}</h4>
            <p class="text-muted small mb-2">${escapeHtml(asset.account_identifier)}</p>
            <span class="badge bg-secondary">${asset.category}</span>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger" data-delete-id="${asset.asset_id}">Delete</button>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2">
        <span>${actionEmojis[asset.action_type] || '📋'}</span>
        <span class="fw-500">${actionLabel}</span>
      </div>
      ${asset.last_message ? `<div class="alert alert-info small mt-2 mb-0"><strong>Message:</strong> ${escapeHtml(asset.last_message.substring(0, 100))}${asset.last_message.length > 100 ? '...' : ''}</div>` : ''}
      <p class="small text-muted mt-2 mb-0">Added ${formatAssetDate(asset.created_at)}</p>
    </article>
    `;
  }).join('');
}

function updateAssetCount() {
  document.getElementById('assetCount').textContent = String(assetsState.items.length);
}

async function handleExecutorSubmit(event) {
  event.preventDefault();

  const submitButton = document.getElementById('executorSubmitBtn');
  const executorName = document.getElementById('executorName').value.trim();
  const executorEmail = document.getElementById('executorEmail').value.trim();
  const executorPhone = document.getElementById('executorPhone').value.trim();
  const executorRelationship = document.getElementById('executorRelationship').value.trim();

  if (!executorName || !executorEmail) {
    showNotification('Executor name and email are required.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    const response = await apiCall('/executors', 'POST', {
      executor_name: executorName,
      executor_email: executorEmail,
      executor_phone: executorPhone || null,
      relationship: executorRelationship || null
    });

    executorsState.items.unshift(response.data);
    executorsState.loaded = true;
    renderExecutors();
    updateExecutorCount();

    event.target.reset();
    showNotification('Executor added successfully.', 'success');
    
    // Show QR code modal
    showQRModal(response.data);
  } catch (error) {
    showNotification(error.message || 'Failed to add executor', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Executor';
  }
}

function renderExecutors() {
  const executorsList = document.getElementById('executorsList');
  const executorsStatus = document.getElementById('executorsStatus');

  if (!executorsState.items.length) {
    executorsList.innerHTML = '';
    executorsStatus.textContent = 'No executors added yet.';
    return;
  }

  executorsStatus.textContent = `${executorsState.items.length} executor(s) saved`;
  executorsList.innerHTML = executorsState.items.map((executor) => {
    const executorStatus = getExecutorStatus(executor);
    const statusBadgeClass = getExecutorStatusBadgeClass(executor);
    const actionButtons = getExecutorActionButtons(executor);

    return `
      <article class="asset-card">
        <div class="asset-card-header">
          <div>
            <h4>${escapeHtml(executor.executor_name)}</h4>
            <p class="asset-type">${escapeHtml(executor.executor_email)}</p>
          </div>
          <span class="executor-status-badge ${statusBadgeClass}">${escapeHtml(executorStatus)}</span>
        </div>
        <p class="executor-meta">${executor.executor_phone ? `Phone: ${escapeHtml(executor.executor_phone)}` : 'Phone: Not provided'}</p>
        <p class="executor-meta">${executor.relationship ? `Relationship: ${escapeHtml(executor.relationship)}` : 'Relationship: Not provided'}</p>
        ${actionButtons}
        <p class="asset-date">Added ${formatAssetDate(executor.created_at)}</p>
      </article>
    `;
  }).join('');

  // Bind action buttons
  bindExecutorButtons();
}

function getExecutorStatus(executor) {
  // Handle both boolean and string values
  const accessGranted = executor.access_granted === true || executor.access_granted === 'true';
  
  if (accessGranted) {
    return 'Active';
  }
  if (executor.verification_status === 'verified') {
    return 'Verified';
  }
  return 'Invited';
}

function getExecutorStatusBadgeClass(executor) {
  // Handle both boolean and string values
  const accessGranted = executor.access_granted === true || executor.access_granted === 'true';
  
  if (accessGranted) {
    return 'status-active';
  }
  if (executor.verification_status === 'verified') {
    return 'status-verified';
  }
  return 'status-invited';
}

function getExecutorActionButtons(executor) {
  // Only show buttons if executor is verified
  if (executor.verification_status !== 'verified') {
    return '<p class="executor-meta"><em>Waiting for verification...</em></p>';
  }

  // Ensure access_granted is treated as boolean
  const accessGranted = executor.access_granted === true || executor.access_granted === 'true';
  
  if (accessGranted) {
    return `
      <div class="executor-actions">
        <button class="success-btn" disabled>✓ Access Granted</button>
        <button class="revoke-btn" data-revoke-id="${executor.executor_id}">Revoke Access</button>
      </div>
    `;
  }

  return `
    <div class="executor-actions">
      <button class="access-btn" data-grant-id="${executor.executor_id}">Grant Access</button>
    </div>
  `;
}

function bindExecutorButtons() {
  const executorsList = document.getElementById('executorsList');

  // Grant access buttons
  executorsList.addEventListener('click', async (e) => {
    const grantButton = e.target.closest('[data-grant-id]');
    if (grantButton) {
      await handleGrantAccess(grantButton);
      return;
    }

    const revokeButton = e.target.closest('[data-revoke-id]');
    if (revokeButton) {
      await handleRevokeAccess(revokeButton);
    }
  });
}

async function handleGrantAccess(button) {
  const executorId = button.dataset.grantId;
  button.disabled = true;
  button.textContent = 'Granting...';

  try {
    const response = await apiCall(`/executors/${executorId}/grant-access`, 'PATCH');

    console.log('[Dashboard] Grant Access Response:', response);
    console.log('[Dashboard] Response data:', response.data);
    console.log('[Dashboard] Access granted:', response.data?.access_granted);

    // Update state
    const executorIndex = executorsState.items.findIndex(
      (e) => String(e.executor_id) === String(executorId)
    );
    if (executorIndex !== -1) {
      executorsState.items[executorIndex] = response.data;
      console.log('[Dashboard] Updated executor in state:', executorsState.items[executorIndex]);
    }

    renderExecutors();
    showNotification('Access granted successfully!', 'success');
  } catch (error) {
    console.error('[Dashboard] Grant access error:', error);
    button.disabled = false;
    button.textContent = 'Grant Access';
    showNotification(error.message || 'Failed to grant access', 'error');
  }
}

async function handleRevokeAccess(button) {
  const executorId = button.dataset.revokeId;
  
  if (!confirm('Are you sure you want to revoke access for this executor?')) {
    return;
  }

  button.disabled = true;
  button.textContent = 'Revoking...';

  try {
    const response = await apiCall(`/executors/${executorId}/revoke-access`, 'PATCH');

    // Update state
    const executorIndex = executorsState.items.findIndex(
      (e) => String(e.executor_id) === String(executorId)
    );
    if (executorIndex !== -1) {
      executorsState.items[executorIndex] = response.data;
    }

    renderExecutors();
    showNotification('Access revoked successfully!', 'success');
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Revoke Access';
    showNotification(error.message || 'Failed to revoke access', 'error');
  }
}

function updateExecutorCount() {
  document.getElementById('executorCount').textContent = String(executorsState.items.length);
}

function formatAssetType(type) {
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatAssetDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return date.toLocaleString();
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

function getStatusClass(status) {
  switch (status) {
    case 'verified':
      return 'status-success';
    case 'rejected':
      return 'status-error';
    default:
      return 'status-pending';
  }
}

// QR Code Modal Functions
function showQRModal(executorData) {
  const modal = document.getElementById('qrModal');
  const qrText = document.getElementById('qrModalText');
  const qrImage = document.getElementById('qrModalImage');
  const qrLink = document.getElementById('qrModalLink');

  // Set modal content
  qrText.textContent = `Verification QR Code for ${escapeHtml(executorData.executor_name)}`;

  if (executorData.verification_qr_code) {
    qrImage.src = executorData.verification_qr_code;
    qrImage.style.display = 'block';
  } else {
    qrImage.style.display = 'none';
  }

  if (executorData.verification_link) {
    qrLink.value = executorData.verification_link;
  }

  // Show modal using Bootstrap
  const bootstrapModal = new bootstrap.Modal(modal, { backdrop: 'static', keyboard: false });
  bootstrapModal.show();
}

function closeQRModal() {
  const modal = document.getElementById('qrModal');
  const bootstrapModal = bootstrap.Modal.getInstance(modal);
  if (bootstrapModal) {
    bootstrapModal.hide();
  }
}

function copyVerificationLink() {
  const linkInput = document.getElementById('qrModalLink');
  const copyBtn = event.target;

  // Use modern Clipboard API
  navigator.clipboard.writeText(linkInput.value).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#10b981';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  }).catch(() => {
    // Fallback: select and copy
    linkInput.select();
    document.execCommand('copy');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#10b981';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  });
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  const modal = document.getElementById('qrModal');
  if (event.target === modal) {
    closeQRModal();
  }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', logout);

// ========== Dead Man's Switch Functions ==========

// Load dead man's switch data
async function loadSwitchData() {
  try {
    const statusLoading = document.getElementById('switchStatusLoading');
    const statusContent = document.getElementById('switchStatusContent');
    const executorLoading = document.getElementById('executorListLoading');
    const executorContent = document.getElementById('executorListContent');

    // Show loading states
    statusLoading.style.display = 'block';
    statusContent.style.display = 'none';
    executorLoading.style.display = 'block';
    executorContent.style.display = 'none';

    // Fetch DMS status and executor data in parallel
    const [statusRes, executorsRes] = await Promise.all([
      apiCall('/dead-mans-switch/status', 'GET').catch(err => {
        console.error('Error fetching DMS status:', err);
        return null;
      }),
      apiCall('/dead-mans-switch/executor-notifications', 'GET').catch(err => {
        console.error('Error fetching executor notifications:', err);
        return null;
      })
    ]);

    // Update switch status
    if (statusRes && statusRes.success) {
      const data = statusRes.data;
      document.getElementById('dmsStatus').textContent = data.status === 'active' ? 'Active' : 'Triggered';
      document.getElementById('dmsStatus').className = `badge ${data.status === 'active' ? 'bg-success' : 'bg-danger'}`;
      document.getElementById('dmsInterval').textContent = data.check_interval_days;
      document.getElementById('alertDays').textContent = data.check_interval_days;
      document.getElementById('dmsDaysUntil').textContent = data.daysUntilTrigger;
      document.getElementById('intervalDays').value = data.check_interval_days;
      
      // Format last check-in date
      const lastCheckinDate = new Date(data.last_checkin);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      document.getElementById('dmsLastCheckin').textContent = lastCheckinDate.toLocaleDateString('en-US', options);

      statusLoading.style.display = 'none';
      statusContent.style.display = 'block';
    } else {
      statusLoading.innerHTML = '<p class="text-danger">Error loading status</p>';
    }

    // Update executor list
    if (executorsRes && executorsRes.success) {
      const executors = executorsRes.data.executors || [];
      const executorList = document.getElementById('executorList');
      const noExecutors = document.getElementById('noExecutors');

      if (executors.length === 0) {
        executorList.innerHTML = '';
        noExecutors.style.display = 'block';
      } else {
        noExecutors.style.display = 'none';
        executorList.innerHTML = executors.map(executor => `
          <div class="executor-notification-item mb-3 pb-3 border-bottom">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h6 class="mb-0">${escapeHtml(executor.full_name)}</h6>
              <span class="badge ${executor.access_granted ? 'bg-danger' : 'bg-secondary'}">
                ${executor.access_granted ? 'Access Granted' : 'Waiting'}
              </span>
            </div>
            <p class="text-muted small mb-1">${escapeHtml(executor.executor_email)}</p>
            <p class="text-muted small mb-0">Added ${formatAssetDate(executor.created_at)}</p>
          </div>
        `).join('');
      }

      executorLoading.style.display = 'none';
      executorContent.style.display = 'block';
    } else {
      executorLoading.innerHTML = '<p class="text-danger">Error loading executors</p>';
    }
  } catch (error) {
    console.error('Error loading switch data:', error);
    showNotification('Error loading dead man switch data', 'error');
  }
}

// Manual check-in function
async function manualCheckIn() {
  const checkInBtn = document.getElementById('checkInBtn');
  checkInBtn.disabled = true;
  const originalText = checkInBtn.textContent;
  checkInBtn.textContent = 'Checking in...';

  try {
    const response = await apiCall('/dead-mans-switch/check-in', 'POST');

    if (response.success) {
      showNotification('✓ Check-in successful! Your timer has been reset.', 'success');
      // Reload the data
      await loadSwitchData();
    } else {
      throw new Error(response.message || 'Check-in failed');
    }
  } catch (error) {
    console.error('Check-in error:', error);
    showNotification(error.message || 'Failed to check in', 'error');
  } finally {
    checkInBtn.disabled = false;
    checkInBtn.textContent = originalText;
  }
}

// Update check interval function
async function updateCheckInterval(event) {
  event.preventDefault();
  
  const intervalInput = document.getElementById('intervalDays');
  const interval = parseInt(intervalInput.value);
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (isNaN(interval) || interval < 7 || interval > 365) {
    showNotification('Interval must be between 7 and 365 days', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const response = await apiCall('/dead-mans-switch/interval', 'PUT', {
      check_interval_days: interval
    });

    if (response.success) {
      showNotification('✓ Check interval updated successfully!', 'success');
      // Reload the data
      await loadSwitchData();
    } else {
      throw new Error(response.message || 'Update failed');
    }
  } catch (error) {
    console.error('Update interval error:', error);
    showNotification(error.message || 'Failed to update interval', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

