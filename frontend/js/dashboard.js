let assetsState = {
  items: [],
  loaded: false
};

let executorsState = {
  items: [],
  loaded: false
};

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
  // Get all navigation items
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = item.dataset.page;
      
      // Remove active class from all
      navItems.forEach(i => i.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      // Add active class to clicked item and corresponding page
      item.classList.add('active');
      document.getElementById(`${pageName}Page`).classList.add('active');

      // Load page data
      loadPageData(pageName);
    });
  });
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
    document.getElementById('switchStatus').textContent = 'Inactive';
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

  // Assets Section
  content += '<div class="will-section">';
  content += '<h4>📋 Digital Assets (' + assets.length + ')</h4>';
  
  if (assets.length === 0) {
    content += '<p><em>No assets added yet. Add assets from the Digital Assets tab.</em></p>';
  } else {
    assets.forEach(asset => {
      content += '<div class="will-item">';
      content += '<div class="will-item-name">' + escapeHtml(asset.asset_name) + '</div>';
      content += '<div class="will-item-meta">Type: ' + formatAssetType(asset.asset_type) + '</div>';
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

    if (response.success && response.data && response.data.file_path) {
      // Download the PDF
      const link = document.createElement('a');
      link.href = response.data.file_path;
      link.download = 'digital-will.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Digital will generated successfully!', 'success');
      willStatus.textContent = 'Generated';
      willStatus.style.color = '#10b981';
    } else {
      throw new Error(response.message || 'Failed to generate will');
    }
  } catch (error) {
    willStatus.textContent = 'Error generating';
    willStatus.style.color = '#ef4444';
    showNotification(error.message || 'Failed to generate will', 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Digital Will (PDF)';
  }
}

// Load switch data (placeholder)
function loadSwitchData() {
  // To be implemented in Step 5
}

function bindAssetActions() {
  const assetForm = document.getElementById('assetForm');
  const refreshAssetsBtn = document.getElementById('refreshAssetsBtn');

  assetForm.addEventListener('submit', handleAssetSubmit);
  refreshAssetsBtn.addEventListener('click', () => {
    loadAssetsData();
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
  const assetName = document.getElementById('assetName').value.trim();
  const assetType = document.getElementById('assetType').value;
  const assetDataInput = document.getElementById('assetData').value.trim();

  if (!assetName || !assetType || !assetDataInput) {
    showNotification('Please fill in all asset fields.', 'error');
    return;
  }

  let assetData;
  try {
    assetData = JSON.parse(assetDataInput);
  } catch (error) {
    showNotification('Asset data must be valid JSON.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    const response = await apiCall('/assets', 'POST', {
      asset_name: assetName,
      asset_type: assetType,
      asset_data: assetData
    });

    assetsState.items.unshift(response.data);
    assetsState.loaded = true;
    renderAssets();
    updateAssetCount();

    event.target.reset();
    showNotification('Asset added successfully.', 'success');
  } catch (error) {
    showNotification(error.message || 'Failed to add asset', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Asset';
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
  assetsList.innerHTML = assetsState.items.map((asset) => `
    <article class="asset-card">
      <div class="asset-card-header">
        <div>
          <h4>${escapeHtml(asset.asset_name)}</h4>
          <p class="asset-type">${formatAssetType(asset.asset_type)}</p>
        </div>
        <button type="button" class="danger-btn" data-delete-id="${asset.asset_id}">Delete</button>
      </div>
      <p class="asset-date">Added ${formatAssetDate(asset.created_at)}</p>
    </article>
  `).join('');
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

  // Show modal
  modal.style.display = 'flex';
}

function closeQRModal() {
  const modal = document.getElementById('qrModal');
  modal.style.display = 'none';
}

function copyVerificationLink() {
  const linkInput = document.getElementById('qrModalLink');
  const copyBtn = event.target;

  linkInput.select();
  document.execCommand('copy');

  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  copyBtn.style.background = '#10b981';

  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = '#667eea';
  }, 2000);
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
