let assetsState = {
  items: [],
  loaded: false
};

let executorsState = {
  items: [],
  loaded: false
};

const DASHBOARD_DEBUG = false;
function dashboardDebug(...args) {
  if (DASHBOARD_DEBUG) {
    console.log(...args);
  }
}

// Platform icon mapping
const PLATFORM_ICONS = {
  'Instagram': 'fab fa-instagram',
  'Facebook': 'fab fa-facebook',
  'Twitter': 'fab fa-twitter',
  'LinkedIn': 'fab fa-linkedin',
  'Gmail': 'fas fa-envelope',
  'Outlook': 'fas fa-envelope',
  'PayPal': 'fab fa-paypal',
  'Google Pay': 'fab fa-google',
  'Google Drive': 'fab fa-google-drive',
  'Netflix': 'fas fa-tv',
  'Disney+': 'fas fa-play-circle'
};

// App-specific action mapping
const APP_ACTIONS = {
  'Instagram': ['delete', 'pass', 'last_message'],
  'Facebook': ['delete', 'pass', 'last_message'],
  'Twitter': ['delete', 'pass', 'last_message'],
  'LinkedIn': ['delete', 'pass', 'last_message'],
  'Gmail': ['delete', 'pass', 'last_message'],
  'Outlook': ['delete', 'pass', 'last_message'],
  'PayPal': ['delete', 'pass'],
  'Google Pay': ['delete', 'pass'],
  'Google Drive': ['delete', 'pass'],
  'Netflix': ['delete', 'pass'],
  'Disney+': ['delete', 'pass']
};

function getPlatformIcon(platformName) {
  return PLATFORM_ICONS[platformName] || 'fas fa-lock';
}

// Board columns for the owner's assets: one per after-death action
const ACTION_META = {
  pass: { label: 'Pass on', column: 'Pass on to executor', hint: 'Your executor takes these over.', icon: 'fa-hand-holding-heart', tagClass: 'tag-pass', dot: 'var(--forest-light)' },
  delete: { label: 'Delete', column: 'Delete account', hint: 'Closed for good.', icon: 'fa-trash-can', tagClass: 'tag-delete', dot: 'var(--sand-deep)' },
  last_message: { label: 'Last message', column: 'Leave a last message', hint: 'A final post, then closed.', icon: 'fa-feather', tagClass: 'tag-message', dot: 'var(--forest-deep)' }
};

const CATEGORY_LABELS = {
  social: 'Social', email: 'Email', finance: 'Finance', storage: 'Storage', entertainment: 'Entertainment', other: 'Other'
};

const assetView = { mode: 'board', query: '', category: '' };

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;

  const user = getUser();
  if (user) {
    const firstName = (user.fullName || '').trim().split(/\s+/)[0];
    document.getElementById('userName').textContent = firstName || user.email;
  }

  // Initialize dashboard
  initDashboard();
  bindAssetActions();
  bindEditAssetHandlers();
  bindExecutorActions();
  bindWillActions();
  loadDashboardData();
});

// Initialize dashboard page navigation
function initDashboard() {
  // Get all navigation links with data-page attribute
  // One delegated listener covers the rail, the side panel and any link rendered
  // later inside cards (e.g. the overview checklist).
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (!link) return;
    e.preventDefault();
    const pageName = link.dataset.page;
    dashboardDebug('[Link Click] Navigating to:', pageName);
    if (window.location.hash !== `#${pageName}`) {
      history.replaceState(null, '', `#${pageName}`);
    }
    navigateToPage(pageName);
  });

  // Close any open "..." menu when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.more')) closeMoreMenus();
  });

  // Also listen for hash changes (for anchor links and back button)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    dashboardDebug('[Hash Change] New hash:', hash);
    if (hash) {
      navigateToPage(hash);
    }
  });

  // Load initial page from hash on page load
  const initialHash = window.location.hash.slice(1);
  dashboardDebug('[Dashboard Init] Initial hash:', initialHash);
  if (initialHash) {
    navigateToPage(initialHash);
  }
}

// Navigate to a specific page
function navigateToPage(pageName) {
  dashboardDebug('[navigateToPage]', pageName);
  
  const targetPage = document.getElementById(`${pageName}Page`);
  if (!targetPage) {
    dashboardDebug('[navigateToPage] NO PAGE FOUND for:', pageName);
    return;
  }

  // Sidebar (desktop) and dock (phone) both carry links for each page; keep them in sync.
  document.querySelectorAll('.sb-item[data-page], .dock-item[data-page]').forEach(l => {
    const isActive = l.dataset.page === pageName;
    l.classList.toggle('active', isActive);
    if (isActive) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
  });
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p === targetPage));

  // On phones the whole page scrolls; start each section at the top
  if (window.matchMedia('(max-width: 767px)').matches) window.scrollTo(0, 0);

  // Load page data
  dashboardDebug('[navigateToPage] Loading data for:', pageName);
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

// Load dashboard data. Concurrent callers share one in-flight load instead of
// each firing their own set of requests.
let dashboardLoadPromise = null;
function loadDashboardData() {
  if (!dashboardLoadPromise) {
    dashboardLoadPromise = loadDashboardDataOnce().finally(() => {
      dashboardLoadPromise = null;
    });
  }
  return dashboardLoadPromise;
}

async function loadDashboardDataOnce() {
  let willExists = false;
  let switchActive = false;
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

    // Load will data
    try {
      const willRes = await apiCall('/will', 'GET');
      if (willRes && willRes.data && willRes.data.will_id) {
        willExists = true;
      }
    } catch (err) {
      willExists = false;
    }
    document.getElementById('willCount').textContent = willExists ? 'ready' : 'not yet';
    setText('navCountWill', willExists ? 'PDF' : '–');
    
    // Load dead man's switch status
    try {
      const statusRes = await apiCall('/dead-mans-switch/status', 'GET');
      if (statusRes && statusRes.success) {
        switchActive = statusRes.data.status === 'active';
        const status = switchActive ? 'on' : 'triggered';
        document.getElementById('switchStatus').textContent = status;
        setText('navCountSwitch', switchActive ? `${statusRes.data.daysUntilTrigger}d` : '!');
        updatePromo(statusRes.data);
      } else {
        document.getElementById('switchStatus').textContent = 'off';
        setText('navCountSwitch', 'off');
        updatePromo(null);
      }
    } catch (err) {
      document.getElementById('switchStatus').textContent = 'off';
      updatePromo(null);
    }

    // Refresh dashboard widgets with what we just fetched (they re-use assets/
    // executors state, so this adds only the activity-feed request).
    // updateDashboardWidgets must never call back into loadDashboardData.
    if (window.updateDashboardWidgets) {
      window.updateDashboardWidgets({ willExists, switchActive });
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// ---------- Shell helpers ----------
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Sidebar check-in card, driven by the Dead Man's Switch status
function updatePromo(status) {
  window.__switchStatus = status || null;
  const text = document.getElementById('promoText');
  const meter = document.getElementById('promoMeter');
  if (!text || !meter) return;

  if (!status) {
    text.textContent = 'Your executors are only told if you stop checking in.';
    meter.style.width = '0%';
    return;
  }

  const interval = Number(status.check_interval_days) || 30;
  const daysLeft = Math.max(0, Number(status.daysUntilTrigger) || 0);
  if (status.status !== 'active') {
    text.textContent = 'Your switch has been triggered and executors were notified.';
    meter.style.width = '0%';
    return;
  }
  text.textContent = `${daysLeft} of ${interval} days left before your executors are told.`;
  meter.style.width = `${Math.round((daysLeft / interval) * 100)}%`;
}

function getInitials(name) {
  return String(name || '?').trim().split(/\s+/).filter(Boolean)
    .map(part => part[0]).join('').substring(0, 2).toUpperCase() || '?';
}

// Stable 1-5 tone per name so a person keeps the same avatar colour
function avatarTone(name) {
  let hash = 0;
  for (const ch of String(name || '')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash % 5) + 1;
}

function closeMoreMenus(except) {
  document.querySelectorAll('.more-menu.open').forEach(menu => {
    if (menu === except) return;
    menu.classList.remove('open');
    const btn = menu.parentElement && menu.parentElement.querySelector('[aria-expanded]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function toggleMoreMenu(button) {
  const menu = button.parentElement.querySelector('.more-menu');
  if (!menu) return;
  const open = !menu.classList.contains('open');
  closeMoreMenus(menu);
  menu.classList.toggle('open', open);
  button.setAttribute('aria-expanded', String(open));
}

function hideDrawer(id) {
  const el = document.getElementById(id);
  if (el && window.bootstrap) {
    const inst = bootstrap.Offcanvas.getInstance(el);
    if (inst) inst.hide();
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
    bindEditAssetHandlers();
  } catch (error) {
    assetsStatus.textContent = 'Unable to load assets right now.';
    document.getElementById('assetsList').innerHTML = statePanel('fa-plug-circle-exclamation',
      'Your accounts could not be loaded', 'Check your connection, then use Refresh to try again.');
    showNotification(error.message || 'Failed to load assets', 'error');
  }
}

function statePanel(icon, title, body) {
  return `<div class="state-panel"><div class="state-icon"><i class="fas ${icon}"></i></div><h2>${title}</h2><p>${body}</p></div>`;
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
    document.getElementById('executorsList').innerHTML = statePanel('fa-plug-circle-exclamation',
      'Your executors could not be loaded', 'Check your connection, then use Refresh to try again.');
    const people = document.getElementById('panelPeople');
    if (people) people.innerHTML = '<li class="people-empty">Could not load executors.</li>';
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

  // Bind will buttons. Assign (not addEventListener) because this function runs
  // on every visit to the Will page; stacking listeners made one click fire the
  // request several times.
  const generateBtn = document.getElementById('generateWillBtn');
  if (generateBtn) generateBtn.onclick = handleGenerateWill;

  const refreshBtn = document.getElementById('refreshWillBtn');
  if (refreshBtn) refreshBtn.onclick = loadWillData;
}

function renderWillContent(assets, executors) {
  const assetsCol = document.getElementById('willAssetsCol');
  const executorsCol = document.getElementById('willExecutorsCol');

  // Grouped by action, like the will's own table of contents
  assetsCol.innerHTML = assets.length
    ? Object.entries(ACTION_META).map(([key, action]) => {
        const group = assets.filter(a => (a.action_type || 'pass') === key);
        if (!group.length) return '';
        return `
          <article class="bcard">
            <div class="tags"><span class="tag ${action.tagClass}"><i class="fas ${action.icon}"></i>${action.column}</span><span class="tag tag-neutral">${group.length}</span></div>
            <ul class="row-list">
              ${group.map(asset => `
                <li>
                  <span class="plat"><i class="${getPlatformIcon(asset.platform_name)}"></i></span>
                  <div class="row-main"><div class="row-title">${escapeHtml(asset.platform_name || 'Account')}</div><div class="row-sub">${escapeHtml(asset.account_identifier || '')}</div></div>
                </li>`).join('')}
            </ul>
          </article>`;
      }).join('')
    : `<div class="column-empty">No accounts yet. <a href="#assets" data-page="assets">Add your first account</a>.</div>`;

  executorsCol.innerHTML = executors.length
    ? executors.map(executor => {
        const granted = executor.access_granted === true || executor.access_granted === 'true';
        return `
          <article class="bcard">
            <div class="tags">
              <span class="tag ${granted ? 'tag-forest' : 'tag-neutral'}">${granted ? 'Has access' : 'No access yet'}</span>
              ${executor.relationship ? `<span class="tag tag-delete">${escapeHtml(executor.relationship)}</span>` : ''}
            </div>
            <div class="bcard-title"><span class="avatar sm" data-tone="${avatarTone(executor.executor_name)}">${getInitials(executor.executor_name)}</span>${escapeHtml(executor.executor_name)}</div>
            <p class="bcard-desc">${escapeHtml(executor.executor_email)}</p>
          </article>`;
      }).join('')
    : `<div class="column-empty">No executors yet. <a href="#executors" data-page="executors">Invite someone you trust</a>.</div>`;
}

async function handleGenerateWill() {
  const generateBtn = document.getElementById('generateWillBtn');
  const willStatus = document.getElementById('willStatus');
  const willStatusBar = document.getElementById('willStatusBar');
  const willStatusFill = document.getElementById('willStatusFill');
  const willStatusText = document.getElementById('willStatusText');

  const generateLabel = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Generating…';
  willStatus.textContent = 'Generating';
  willStatusBar.hidden = false;
  willStatusText.textContent = '0%';
  willStatusFill.style.width = '0%';

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 30;
    progress = Math.min(progress, 90); // Cap at 90% until complete
    willStatusFill.style.width = progress + '%';
    willStatusText.textContent = Math.round(progress) + '%';
  }, 300);

  try {
    const response = await apiCall('/generate-will', 'GET');

    if (response.success && response.data) {
      // Update progress to 95%
      clearInterval(progressInterval);
      willStatusFill.style.width = '95%';
      willStatusText.textContent = '95%';
      
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

        // Complete progress
        willStatusFill.style.width = '100%';
        willStatusText.textContent = '100%';
        showNotification('Your digital will has been generated and downloaded.', 'success');
        willStatus.textContent = 'Downloaded';

        // Update dashboard widgets and data to reflect the new will
        // loadDashboardData refreshes the overview counts and the widgets.
        setTimeout(() => loadDashboardData(), 1000);

        // Hide progress bar after 2 seconds
        setTimeout(() => {
          willStatusBar.hidden = true;
          willStatusText.textContent = '0%';
        }, 2000);
      } else {
        throw new Error('No download URL provided');
      }
    } else {
      throw new Error(response.message || 'Failed to generate will');
    }
  } catch (error) {
    console.error('Will generation error:', error);
    clearInterval(progressInterval);
    willStatusBar.hidden = true;
    willStatus.textContent = 'Not generated';
    showNotification(error.message || 'Your will could not be generated. Please try again.', 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = generateLabel;
  }
}

async function openEditWillModal() {
  try {
    // Load existing will content
    const response = await apiCall('/will-content', 'GET');
    
    if (response.success && response.data && response.data.custom_content) {
      document.getElementById('editWillContent').value = response.data.custom_content;
    } else {
      document.getElementById('editWillContent').value = '';
    }
    
    // Show modal
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editWillModal')).show();
  } catch (error) {
    console.error('Error loading will content:', error);
    showNotification('Failed to load will content', 'error');
  }
}

async function handleEditWillSubmit() {
  const submitBtn = document.getElementById('editWillSubmitBtn');
  const willContent = document.getElementById('editWillContent').value.trim();
  
  if (!willContent) {
    showNotification('Will content cannot be empty', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  
  try {
    const response = await apiCall('/will-content', 'POST', {
      custom_content: willContent
    });
    
    if (response.success) {
      showNotification('Will content saved successfully!', 'success');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editWillModal'));
      modal.hide();
      
      // Refresh will data
      loadWillData();
    } else {
      showNotification(response.message || 'Failed to save will content', 'error');
    }
  } catch (error) {
    console.error('Error saving will content:', error);
    showNotification(error.message || 'Failed to save will content', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

function bindWillActions() {
  const editWillBtn = document.getElementById('editWillBtn');
  if (editWillBtn) {
    // Modal trigger is already set via data-bs-toggle
    // Just bind the submit button
    const editWillSubmitBtn = document.getElementById('editWillSubmitBtn');
    if (editWillSubmitBtn) {
      editWillSubmitBtn.removeEventListener('click', handleEditWillSubmit);
      editWillSubmitBtn.addEventListener('click', handleEditWillSubmit);
    }
  }
}

function bindAssetActions() {
  const assetForm = document.getElementById('assetForm');
  const refreshAssetsBtn = document.getElementById('refreshAssetsBtn');
  const messageContainer = document.getElementById('messageContainer');
  const actionTypeRadios = document.querySelectorAll('input[name="actionType"]');
  const platformSelect = document.getElementById('platformName');

  assetForm.addEventListener('submit', handleAssetSubmit);
  refreshAssetsBtn.addEventListener('click', () => {
    loadAssetsData();
  });

  // Initialize custom platform dropdown
  initCustomPlatformDropdown();

  // Update available actions when platform changes
  platformSelect.addEventListener('change', (e) => {
    const selectedPlatform = e.target.value;
    updateAvailableActions(selectedPlatform);
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

  // Use event delegation for asset list actions (edit and delete)
  const assetsList = document.getElementById('assetsList');
  assetsList.addEventListener('click', handleAssetListClick);

  bindAssetToolbar();
}

// Update available action buttons based on selected platform
function updateAvailableActions(platformName) {
  const availableActions = APP_ACTIONS[platformName] || [];
  const actionButtons = {
    'pass': document.getElementById('actionPass'),
    'delete': document.getElementById('actionDelete'),
    'last_message': document.getElementById('actionMessage')
  };

  // Show/hide action buttons based on what's available for this platform
  Object.keys(actionButtons).forEach(actionKey => {
    const button = actionButtons[actionKey];
    const label = button ? button.nextElementSibling : null;
    
    if (availableActions.includes(actionKey)) {
      // Show button
      if (button) {
        button.style.display = '';
        button.disabled = false;
      }
      if (label) {
        label.style.display = '';
        label.classList.remove('d-none');
      }
    } else {
      // Hide button
      if (button) {
        button.style.display = 'none';
        button.disabled = true;
        button.checked = false; // Uncheck if hidden
      }
      if (label) {
        label.style.display = 'none';
        label.classList.add('d-none');
      }
    }
  });

  // If the currently selected action is no longer available, clear the selection
  const checkedRadio = document.querySelector('input[name="actionType"]:checked');
  if (checkedRadio && !availableActions.includes(checkedRadio.value)) {
    checkedRadio.checked = false;
    messageContainer.style.display = 'none';
  }

  // Automatically select first available action
  if (!document.querySelector('input[name="actionType"]:checked') && availableActions.length > 0) {
    const firstAvailableButton = actionButtons[availableActions[0]];
    if (firstAvailableButton) {
      firstAvailableButton.checked = true;
      if (availableActions[0] === 'last_message') {
        messageContainer.style.display = 'block';
      }
    }
  }
}

// Initialize custom platform dropdown
function initCustomPlatformDropdown() {
  const trigger = document.getElementById('platformDropdownTrigger');
  const menu = document.getElementById('platformDropdownMenu');
  const platformSelect = document.getElementById('platformName');
  const options = document.querySelectorAll('.platform-option');
  const displayIcon = document.querySelector('.platform-icon-display');
  const displayText = document.querySelector('.platform-text-display');

  if (!trigger || !menu) return;

  // Toggle dropdown menu
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = menu.classList.contains('show');
    menu.classList.toggle('show', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen);
  });

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const value = option.getAttribute('data-value');
      const icon = option.getAttribute('data-icon');
      const text = option.querySelector('span').textContent;

      // Update hidden select
      platformSelect.value = value;

      // Update display
      if (displayIcon) {
        displayIcon.innerHTML = `<i class="${icon}"></i>`;
      }
      if (displayText) {
        displayText.textContent = text;
      }

      // Close menu
      menu.classList.remove('show');
      trigger.setAttribute('aria-expanded', 'false');

      // Trigger change event for validation
      platformSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('show');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

function bindExecutorActions() {
  const executorForm = document.getElementById('executorForm');
  const refreshExecutorsBtn = document.getElementById('refreshExecutorsBtn');

  executorForm.addEventListener('submit', handleExecutorSubmit);
  refreshExecutorsBtn.addEventListener('click', () => {
    loadExecutorsData();
  });

  const search = document.getElementById('executorSearch');
  if (search) {
    search.addEventListener('input', () => {
      executorView.query = search.value;
      renderExecutors();
    });
  }
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
      'Gmail': 'email', 'Outlook': 'email',
      'PayPal': 'finance', 'Google Pay': 'finance',
      'Google Drive': 'storage',
      'Netflix': 'entertainment', 'Disney+': 'entertainment'
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
    const iconDisplay = document.querySelector('.platform-icon-display');
    const textDisplay = document.querySelector('.platform-text-display');
    if (iconDisplay) iconDisplay.innerHTML = '<i class="fas fa-layer-group"></i>';
    if (textDisplay) textDisplay.textContent = 'Choose a platform…';
    hideDrawer('assetDrawer');
    showNotification(`${platformName} added.`, 'success');

    // Update dashboard widgets to reflect the new asset
    if (window.updateDashboardWidgets) {
      setTimeout(() => {
        window.updateDashboardWidgets();
      }, 500);
    }
  } catch (error) {
    showNotification(error.message || 'Failed to add asset', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Add Asset';
  }
}

async function handleAssetListClick(event) {
  const moreButton = event.target.closest('[data-more]');
  if (moreButton) {
    event.stopPropagation();
    toggleMoreMenu(moreButton);
    return;
  }

  const addButton = event.target.closest('[data-add-action]');
  if (addButton) {
    openAssetDrawer(addButton.dataset.addAction);
    return;
  }

  // Handle edit button click
  const editButton = event.target.closest('[data-edit-id]');
  if (editButton) {
    event.preventDefault();
    closeMoreMenus();
    openEditAssetModal(editButton.dataset.editId);
    return;
  }

  // Handle delete button click
  const deleteButton = event.target.closest('[data-delete-id]');
  if (deleteButton) {
    const assetId = deleteButton.dataset.deleteId;
    const asset = assetsState.items.find(a => String(a.asset_id) === String(assetId));
    closeMoreMenus();
    if (!confirm(`Remove ${asset ? asset.platform_name : 'this account'} from DIGIPASS? Your executors will no longer see it.`)) {
      return;
    }
    deleteButton.disabled = true;

    try {
      await apiCall(`/assets/${assetId}`, 'DELETE');

      assetsState.items = assetsState.items.filter((a) => String(a.asset_id) !== String(assetId));
      renderAssets();
      updateAssetCount();
      showNotification('Account removed.', 'success');
      if (window.updateDashboardWidgets) window.updateDashboardWidgets();
    } catch (error) {
      deleteButton.disabled = false;
      showNotification(error.message || 'Failed to remove account', 'error');
    }
  }
}

function bindAssetToolbar() {
  const search = document.getElementById('assetSearch');
  if (search) {
    search.addEventListener('input', () => {
      assetView.query = search.value;
      renderAssets();
    });
  }

  document.querySelectorAll('[data-asset-view]').forEach(tab => {
    tab.addEventListener('click', () => {
      assetView.mode = tab.dataset.assetView;
      document.querySelectorAll('[data-asset-view]').forEach(t =>
        t.setAttribute('aria-selected', String(t === tab)));
      renderAssets();
    });
  });

  const catBtn = document.getElementById('assetCategoryBtn');
  const catMenu = document.getElementById('assetCategoryMenu');
  if (catBtn && catMenu) {
    catBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoreMenu(catBtn);
    });
    catMenu.addEventListener('click', (e) => {
      const option = e.target.closest('[data-category]');
      if (!option) return;
      assetView.category = option.dataset.category;
      setText('assetCategoryLabel', assetView.category ? CATEGORY_LABELS[assetView.category] : 'All categories');
      catBtn.setAttribute('aria-pressed', String(Boolean(assetView.category)));
      closeMoreMenus();
      renderAssets();
    });
  }
}

function filteredAssets() {
  const q = assetView.query.trim().toLowerCase();
  return assetsState.items.filter(asset => {
    if (assetView.category && (asset.category || 'other') !== assetView.category) return false;
    if (!q) return true;
    return [asset.platform_name, asset.account_identifier, asset.category]
      .some(v => String(v || '').toLowerCase().includes(q));
  });
}

function assetMenu(asset) {
  return `
    <div class="more">
      <button type="button" class="more-btn" data-more aria-haspopup="true" aria-expanded="false" aria-label="Options for ${escapeHtml(asset.platform_name)}"><i class="fas fa-ellipsis"></i></button>
      <div class="more-menu" role="menu">
        <button type="button" role="menuitem" data-edit-id="${asset.asset_id}"><i class="fas fa-pen"></i>Edit account</button>
        <hr>
        <button type="button" role="menuitem" class="danger" data-delete-id="${asset.asset_id}"><i class="fas fa-trash-can"></i>Remove from DIGIPASS</button>
      </div>
    </div>`;
}

function assetCard(asset) {
  const action = ACTION_META[asset.action_type] || ACTION_META.pass;
  const category = asset.category || 'other';
  const message = asset.last_message
    ? `<p class="bcard-quote"><i class="fas fa-quote-left"></i>${escapeHtml(asset.last_message.substring(0, 110))}${asset.last_message.length > 110 ? '…' : ''}</p>`
    : '';
  return `
    <article class="bcard" data-asset-id="${asset.asset_id}">
      <div class="bcard-top">
        <div class="tags">
          <span class="tag ${action.tagClass}"><i class="fas ${action.icon}"></i>${action.label}</span>
          <span class="tag tag-neutral">${CATEGORY_LABELS[category] || escapeHtml(category)}</span>
        </div>
        ${assetMenu(asset)}
      </div>
      <div class="bcard-title"><span class="plat"><i class="${getPlatformIcon(asset.platform_name)}"></i></span>${escapeHtml(asset.platform_name)}</div>
      <p class="bcard-desc">${escapeHtml(asset.account_identifier)}</p>
      ${message}
      <div class="bcard-foot">
        <span class="meta"><i class="fas fa-key"></i>${asset.has_password ? 'Password saved' : 'No password'}</span>
        <span class="meta push"><i class="far fa-calendar"></i>${formatShortDate(asset.created_at)}</span>
      </div>
    </article>`;
}


function renderAssets() {
  const assetsList = document.getElementById('assetsList');
  const assetsStatus = document.getElementById('assetsStatus');
  const total = assetsState.items.length;
  const items = filteredAssets();
  const filtering = Boolean(assetView.query || assetView.category);

  assetsStatus.textContent = total ? `${items.length} of ${total} accounts shown` : 'No accounts added yet.';

  if (!total) {
    assetsList.innerHTML = `
      <div class="state-panel">
        <div class="state-icon"><i class="fas fa-key"></i></div>
        <h2>No accounts yet</h2>
        <p>Add the accounts someone would need to deal with, and choose what should happen to each.</p>
        <button type="button" class="pill pill-primary" style="margin-top:16px" onclick="openAssetDrawer()"><i class="fas fa-plus"></i>Add your first account</button>
      </div>`;
    return;
  }

  if (assetView.mode === 'list') {
    assetsList.innerHTML = items.length ? `
      <div class="list" role="table" aria-label="Accounts">
        <div class="list-row list-head" role="row"><span>Account</span><span class="hide-sm">Sign-in</span><span class="hide-sm">After you</span><span class="hide-sm">Added</span><span></span></div>
        ${items.map(asset => {
          const action = ACTION_META[asset.action_type] || ACTION_META.pass;
          return `
            <div class="list-row" role="row">
              <span class="bcard-title"><span class="plat"><i class="${getPlatformIcon(asset.platform_name)}"></i></span>${escapeHtml(asset.platform_name)}</span>
              <span class="cell-muted hide-sm">${escapeHtml(asset.account_identifier)}</span>
              <span class="hide-sm"><span class="tag ${action.tagClass}"><i class="fas ${action.icon}"></i>${action.label}</span></span>
              <span class="cell-muted hide-sm">${formatShortDate(asset.created_at)}</span>
              ${assetMenu(asset)}
            </div>`;
        }).join('')}
      </div>` : statePanel('fa-magnifying-glass', 'No matching accounts', 'Try a different search or category.');
    return;
  }

  assetsList.innerHTML = `
    <div class="board" style="--cols:3">
      ${Object.entries(ACTION_META).map(([key, meta]) => {
        const colItems = items.filter(a => (a.action_type || 'pass') === key);
        return `
          <section class="column" aria-label="${meta.column}">
            <div class="column-head"><span class="dot" style="--dot:${meta.dot}"></span><h2>${meta.column}</h2><span class="col-count">${colItems.length}</span></div>
            <p class="column-hint">${meta.hint}</p>
            <div class="column-body">
              ${colItems.length ? colItems.map(assetCard).join('') : `<div class="column-empty">${filtering ? 'Nothing matches here.' : 'No accounts here yet.'}</div>`}
            </div>
            <button type="button" class="column-add" data-add-action="${key}"><i class="fas fa-plus"></i>Add account</button>
          </section>`;
      }).join('')}
    </div>`;
}

function formatShortDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateAssetCount() {
  document.getElementById('assetCount').textContent = String(assetsState.items.length);
  setText('navCountAssets', String(assetsState.items.length));
}

function openEditAssetModal(assetId) {
  const asset = assetsState.items.find(a => String(a.asset_id) === String(assetId));
  if (!asset) {
    showNotification('Asset not found.', 'error');
    return;
  }

  // Populate form with asset data
  document.getElementById('editAssetId').value = asset.asset_id;
  document.getElementById('editPlatformName').value = asset.platform_name;
  document.getElementById('editAccountIdentifier').value = asset.account_identifier;
  // The stored password is never sent to the browser; leave blank to keep it
  const editPwd = document.getElementById('editAccountPassword');
  editPwd.value = '';
  editPwd.placeholder = asset.has_password ? 'Saved. Type a new one to replace it' : 'No password saved yet';
  
  // Set action type
  document.querySelector(`input[name="editActionType"][value="${asset.action_type}"]`).checked = true;
  
  // Set last message if applicable
  document.getElementById('editLastMessage').value = asset.last_message || '';
  
  // Show/hide message container based on action type
  const messageContainer = document.getElementById('editMessageContainer');
  if (asset.action_type === 'last_message') {
    messageContainer.style.display = 'block';
  } else {
    messageContainer.style.display = 'none';
  }

  // Show modal
  bootstrap.Modal.getOrCreateInstance(document.getElementById('editAssetModal')).show();
}

let editAssetHandlersBound = false;
function bindEditAssetHandlers() {
  // Called after every assets load; bind only once or each Save click sends
  // one PUT per previous load.
  if (editAssetHandlersBound) return;
  editAssetHandlersBound = true;

  // Handle action type radio button changes
  const actionRadios = document.querySelectorAll('.edit-action-radio');
  actionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const messageContainer = document.getElementById('editMessageContainer');
      if (e.target.value === 'last_message') {
        messageContainer.style.display = 'block';
        document.getElementById('editLastMessage').required = true;
      } else {
        messageContainer.style.display = 'none';
        document.getElementById('editLastMessage').required = false;
      }
    });
  });

  // Handle form submission
  const editAssetSubmitBtn = document.getElementById('editAssetSubmitBtn');
  editAssetSubmitBtn.addEventListener('click', handleEditAssetSubmit);
}

async function handleEditAssetSubmit() {
  const submitButton = document.getElementById('editAssetSubmitBtn');
  const assetId = document.getElementById('editAssetId').value;
  const platformName = document.getElementById('editPlatformName').value.trim();
  const accountIdentifier = document.getElementById('editAccountIdentifier').value.trim();
  const accountPassword = document.getElementById('editAccountPassword').value.trim();
  const actionType = document.querySelector('input[name="editActionType"]:checked')?.value;
  const lastMessage = document.getElementById('editLastMessage').value.trim();

  // Password is optional here: blank keeps the one already stored
  if (!platformName || !accountIdentifier || !actionType) {
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
      'Instagram': 'social', 'Facebook': 'social', 'Twitter': 'social', 'LinkedIn': 'social', 'TikTok': 'social', 'Snapchat': 'social', 'Discord': 'social',
      'Gmail': 'email', 'Outlook': 'email', 'Yahoo Mail': 'email', 'ProtonMail': 'email', 'Apple Mail': 'email',
      'PayPal': 'finance', 'Amazon': 'finance', 'Banking App': 'finance', 'Stripe': 'finance', 'Square': 'finance',
      'Google Drive': 'storage', 'Dropbox': 'storage', 'OneDrive': 'storage', 'iCloud': 'storage',
      'Netflix': 'entertainment', 'Spotify': 'entertainment', 'Disney+': 'entertainment', 'Hulu': 'entertainment'
    };

    const category = categoryMap[platformName] || 'other';

    const response = await apiCall(`/assets/${assetId}`, 'PATCH', {
      platform_name: platformName,
      category: category,
      account_identifier: accountIdentifier,
      account_password: accountPassword,
      action_type: actionType,
      last_message: actionType === 'last_message' ? lastMessage : null
    });

    // Update asset in local state
    const assetIndex = assetsState.items.findIndex(a => String(a.asset_id) === String(assetId));
    if (assetIndex !== -1) {
      assetsState.items[assetIndex] = response.data;
    }

    renderAssets();
    updateAssetCount();
    showNotification('Asset updated successfully.', 'success');

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('editAssetModal')).hide();

    // Update dashboard widgets to reflect the updated asset
    if (window.updateDashboardWidgets) {
      setTimeout(() => {
        window.updateDashboardWidgets();
      }, 500);
    }
  } catch (error) {
    showNotification(error.message || 'Failed to update asset', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Changes';
  }
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
    hideDrawer('executorDrawer');
    if (response.data.verification_email_sent) {
      showNotification(`Executor added. Verification email sent to ${response.data.executor_email}.`, 'success');
    } else {
      // Email providers can run out of credits; the invite still works as a link/QR.
      showNotification('Executor added. The email could not be sent, so share the invite link instead.', 'success', 6000);
      openInviteShare(response.data.executor_id, response.data.executor_name, response.data.email_delivery?.reason);
    }
    
    // Update dashboard widgets to reflect the new executor
    if (window.updateDashboardWidgets) {
      setTimeout(() => {
        window.updateDashboardWidgets();
      }, 500);
    }
  } catch (error) {
    showNotification(error.message || 'Failed to add executor', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Executor';
  }
}

const EXECUTOR_COLUMNS = [
  { key: 'Invited', title: 'Invited', hint: 'Waiting for them to verify their email.', dot: 'var(--sand-deep)' },
  { key: 'Verified', title: 'Verified', hint: 'Ready. Grant access when you choose.', dot: 'var(--forest-light)' },
  { key: 'Active', title: 'Has access', hint: 'Can see your accounts once the switch triggers.', dot: 'var(--forest-deep)' }
];

const executorView = { query: '' };

function executorCard(executor) {
  const status = getExecutorStatus(executor);
  const tone = avatarTone(executor.executor_name);
  return `
    <article class="bcard" data-executor-id="${executor.executor_id}">
      <div class="bcard-top">
        <div class="tags">
          ${executor.relationship ? `<span class="tag tag-delete">${escapeHtml(executor.relationship)}</span>` : '<span class="tag tag-neutral">Executor</span>'}
          ${status === 'Active' ? '<span class="tag tag-forest"><i class="fas fa-lock-open"></i>Has access</span>' : ''}
        </div>
        <div class="more">
          <button type="button" class="more-btn" data-more aria-haspopup="true" aria-expanded="false" aria-label="Options for ${escapeHtml(executor.executor_name)}"><i class="fas fa-ellipsis"></i></button>
          <div class="more-menu" role="menu">
            ${status === 'Invited' ? `<button type="button" role="menuitem" data-share-id="${executor.executor_id}" data-share-name="${escapeHtml(executor.executor_name)}"><i class="fas fa-qrcode"></i>Share invite link</button><hr>` : ''}
            ${status === 'Active' ? `<button type="button" role="menuitem" data-revoke-id="${executor.executor_id}"><i class="fas fa-lock"></i>Revoke access</button><hr>` : ''}
            <button type="button" role="menuitem" class="danger" data-delete-id="${executor.executor_id}"><i class="fas fa-user-minus"></i>Remove executor</button>
          </div>
        </div>
      </div>
      <div class="bcard-title"><span class="avatar" data-tone="${tone}">${getInitials(executor.executor_name)}</span>${escapeHtml(executor.executor_name)}</div>
      <p class="bcard-desc">${escapeHtml(executor.executor_email)}${executor.executor_phone ? ` · ${escapeHtml(executor.executor_phone)}` : ''}</p>
      ${getExecutorActionButtons(executor)}
      <div class="bcard-foot"><span class="meta"><i class="far fa-calendar"></i>Added ${formatShortDate(executor.created_at)}</span></div>
    </article>`;
}

function renderExecutors() {
  const executorsList = document.getElementById('executorsList');
  const executorsStatus = document.getElementById('executorsStatus');
  const total = executorsState.items.length;

  renderPanelPeople();
  updateExecutorCount();
  executorsStatus.textContent = total ? `${total} executors` : 'No executors added yet.';

  if (!total) {
    executorsList.innerHTML = `
      <div class="state-panel">
        <div class="state-icon"><i class="fas fa-user-shield"></i></div>
        <h2>No executors yet</h2>
        <p>Invite someone you trust. They verify by email, and you decide when they get access.</p>
        <button type="button" class="pill pill-primary" style="margin-top:16px" onclick="openExecutorDrawer()"><i class="fas fa-user-plus"></i>Invite an executor</button>
      </div>`;
    bindExecutorButtons();
    return;
  }

  const q = executorView.query.trim().toLowerCase();
  const items = executorsState.items.filter(e => !q ||
    [e.executor_name, e.executor_email, e.relationship].some(v => String(v || '').toLowerCase().includes(q)));

  executorsList.innerHTML = `
    <div class="board" style="--cols:3">
      ${EXECUTOR_COLUMNS.map(col => {
        const colItems = items.filter(e => getExecutorStatus(e) === col.key);
        return `
          <section class="column" aria-label="${col.title}">
            <div class="column-head"><span class="dot" style="--dot:${col.dot}"></span><h2>${col.title}</h2><span class="col-count">${colItems.length}</span></div>
            <p class="column-hint">${col.hint}</p>
            <div class="column-body">
              ${colItems.length ? colItems.map(executorCard).join('') : `<div class="column-empty">${q ? 'Nobody matches here.' : 'Nobody here yet.'}</div>`}
            </div>
            ${col.key === 'Invited' ? '<button type="button" class="column-add" onclick="openExecutorDrawer()"><i class="fas fa-plus"></i>Invite executor</button>' : ''}
          </section>`;
      }).join('')}
    </div>`;

  // Bind action buttons
  bindExecutorButtons();
}

// Sidebar "Executors" list, like the members list in a project tool
function renderPanelPeople() {
  const list = document.getElementById('panelPeople');
  if (!list) return;
  const people = executorsState.items;
  if (!people.length) {
    list.innerHTML = '<li class="people-empty">No executors yet. <a href="#executors" data-page="executors">Invite one</a>.</li>';
    return;
  }
  list.innerHTML = people.slice(0, 4).map(executor => {
    const status = getExecutorStatus(executor);
    const role = executor.relationship ? `${executor.relationship} · ${status === 'Active' ? 'has access' : status.toLowerCase()}` : (status === 'Active' ? 'Has access' : status);
    return `
      <li class="person">
        <span class="avatar" data-tone="${avatarTone(executor.executor_name)}">${getInitials(executor.executor_name)}<span class="presence ${status === 'Active' ? 'on' : status === 'Invited' ? 'pending' : ''}"></span></span>
        <div style="min-width:0">
          <div class="person-name">${escapeHtml(executor.executor_name)}</div>
          <div class="person-role">${escapeHtml(role)}</div>
        </div>
      </li>`;
  }).join('') + (people.length > 4 ? `<li class="people-empty">+${people.length - 4} more</li>` : '');
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
  if (executor.verification_status !== 'verified') {
    return '<p class="bcard-quote"><i class="far fa-envelope"></i>Verification email sent. Waiting for them to confirm.</p>';
  }

  const accessGranted = executor.access_granted === true || executor.access_granted === 'true';
  if (accessGranted) {
    return '';
  }

  return `
    <div class="bcard-actions">
      <button type="button" class="btn-forest" data-grant-id="${executor.executor_id}"><i class="fas fa-key"></i>Grant access</button>
    </div>`;
}

async function executorClickHandler(e) {
  const moreButton = e.target.closest('[data-more]');
  if (moreButton) {
    e.stopPropagation();
    toggleMoreMenu(moreButton);
    return;
  }
  if (e.target.closest('.more-menu')) closeMoreMenus();

  const shareButton = e.target.closest('[data-share-id]');
  if (shareButton) {
    openInviteShare(shareButton.dataset.shareId, shareButton.dataset.shareName);
    return;
  }

  const grantButton = e.target.closest('[data-grant-id]');
  if (grantButton) {
    await handleGrantAccess(grantButton);
    return;
  }

  const revokeButton = e.target.closest('[data-revoke-id]');
  if (revokeButton) {
    await handleRevokeAccess(revokeButton);
    return;
  }

  const deleteButton = e.target.closest('[data-delete-id]');
  if (deleteButton) {
    await handleDeleteExecutor(deleteButton);
  }
}

// Fresh invite link + QR for an executor who hasn't verified yet. Works without
// any email provider, so invitations aren't blocked when email credits run out.
async function openInviteShare(executorId, executorName, emailFailure) {
  const modalEl = document.getElementById('inviteShareModal');
  const loading = document.getElementById('inviteShareLoading');
  const body = document.getElementById('inviteShareBody');
  const linkInput = document.getElementById('inviteLink');
  const copyBtn = document.getElementById('inviteCopyBtn');
  const nativeBtn = document.getElementById('inviteNativeShare');

  setText('inviteShareTitle', executorName ? `Share ${executorName}'s invite` : 'Share the invite');
  // Say why no email went out, so a misconfigured or exhausted provider is visible
  setText('inviteShareSub', emailFailure
    ? `The invitation email couldn't be sent (${emailFailure}). Send this link yourself, or let them scan the code.`
    : 'Send this link to your executor, or let them scan the code.');
  loading.hidden = false;
  body.hidden = true;
  nativeBtn.hidden = true;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();

  try {
    const response = await apiCall(`/executors/${executorId}/resend-verification`, 'POST');
    const link = response.data.verification_link;
    linkInput.value = link;
    const qr = document.getElementById('inviteQr');
    if (response.data.verification_qr_code) {
      qr.src = response.data.verification_qr_code;
      qr.hidden = false;
    } else {
      qr.hidden = true;
    }
    loading.hidden = true;
    body.hidden = false;

    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(link);
      } catch (e) {
        linkInput.select();
        document.execCommand('copy');
      }
      copyBtn.innerHTML = '<i class="fas fa-check"></i>Copied';
      setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i>Copy'; }, 2000);
    };

    if (navigator.share) {
      nativeBtn.hidden = false;
      nativeBtn.onclick = () => navigator.share({
        title: 'DIGIPASS executor invite',
        text: 'You have been named as an executor on DIGIPASS. Use this link to verify and set your password:',
        url: link
      }).catch(() => {});
    }
  } catch (error) {
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    showNotification(error.message || 'Could not create an invite link. Please try again.', 'error');
  }
}

function bindExecutorButtons() {
  const executorsList = document.getElementById('executorsList');
  
  // Remove old listener to prevent duplicate triggers
  executorsList.removeEventListener('click', executorClickHandler);
  
  // Add fresh listener
  executorsList.addEventListener('click', executorClickHandler);
}

async function handleGrantAccess(button) {
  const executorId = button.dataset.grantId;
  button.disabled = true;
  button.textContent = 'Granting...';

  try {
    const response = await apiCall(`/executors/${executorId}/grant-access`, 'PATCH');

    dashboardDebug('[Dashboard] Grant Access Response:', response);
    dashboardDebug('[Dashboard] Response data:', response.data);
    dashboardDebug('[Dashboard] Access granted:', response.data?.access_granted);

    // Update state
    const executorIndex = executorsState.items.findIndex(
      (e) => String(e.executor_id) === String(executorId)
    );
    if (executorIndex !== -1) {
      executorsState.items[executorIndex] = response.data;
      dashboardDebug('[Dashboard] Updated executor in state:', executorsState.items[executorIndex]);
    }

    renderExecutors();
    showNotification('Access granted successfully!', 'success');
  } catch (error) {
    console.error('[Dashboard] Grant access error:', error);
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-key"></i>Grant access';
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

async function handleDeleteExecutor(button) {
  const executorId = button.dataset.deleteId;
  
  if (!confirm('Are you sure you want to remove this executor? This action cannot be undone.')) {
    return;
  }

  button.disabled = true;
  button.textContent = 'Removing...';

  try {
    await apiCall(`/executors/${executorId}`, 'DELETE');

    // Remove from state
    executorsState.items = executorsState.items.filter(
      (e) => String(e.executor_id) !== String(executorId)
    );

    renderExecutors();
    showNotification('Executor removed successfully!', 'success');
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Remove';
    showNotification(error.message || 'Failed to remove executor', 'error');
  }
}

function updateExecutorCount() {
  document.getElementById('executorCount').textContent = String(executorsState.items.length);
  setText('navCountExecutors', String(executorsState.items.length));
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
      const active = data.status === 'active';
      const interval = Number(data.check_interval_days) || 30;
      const daysLeft = Math.max(0, Number(data.daysUntilTrigger) || 0);
      const pct = Math.round((daysLeft / interval) * 100);
      const dmsStatus = document.getElementById('dmsStatus');
      dmsStatus.innerHTML = active ? '<i class="fas fa-circle-check"></i>On, watching for check-ins' : '<i class="fas fa-bell"></i>Triggered';
      dmsStatus.className = `tag ${active ? 'tag-pass' : 'tag-danger'}`;
      document.getElementById('dmsInterval').textContent = interval;
      document.getElementById('alertDays').textContent = interval;
      document.getElementById('dmsDaysUntil').textContent = daysLeft;
      document.getElementById('dmsDaysLeftPct').textContent = `${daysLeft} of ${interval} days`;
      document.getElementById('dmsMeter').style.width = `${pct}%`;
      document.getElementById('intervalDays').value = interval;
      updatePromo(data);
      setText('navCountSwitch', active ? `${daysLeft}d` : '!');
      
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
          <li class="person">
            <span class="avatar" data-tone="${avatarTone(executor.full_name)}">${getInitials(executor.full_name)}<span class="presence ${executor.access_granted ? 'on' : ''}"></span></span>
            <div style="min-width:0">
              <div class="person-name">${escapeHtml(executor.full_name)}</div>
              <div class="person-role">${escapeHtml(executor.executor_email)} · ${executor.access_granted ? 'has access' : 'waiting'}</div>
            </div>
          </li>
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
// Used by the switch page button and the sidebar check-in card
async function manualCheckIn(button) {
  const checkInBtn = button || document.getElementById('checkInBtn');
  checkInBtn.disabled = true;
  const originalHtml = checkInBtn.innerHTML;
  checkInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking in…';

  try {
    const response = await apiCall('/dead-mans-switch/check-in', 'POST');

    if (response.success) {
      showNotification('Checked in. Your timer has been reset.', 'success');
      await loadSwitchData();
    } else {
      throw new Error(response.message || 'Check-in failed');
    }
  } catch (error) {
    console.error('Check-in error:', error);
    showNotification(error.message || 'Could not check in. Please try again.', 'error');
  } finally {
    checkInBtn.disabled = false;
    checkInBtn.innerHTML = originalHtml;
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
      showNotification(`Check-in interval set to ${interval} days.`, 'success');
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
