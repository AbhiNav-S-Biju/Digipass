// Workflow State Management
const workflowState = {
    isOpen: false,
    currentStepIndex: 0,
    assetId: null,
    steps: [],
    asset: null,
    completedSteps: new Set()
};

// Drag state
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

/**
 * Initialize drag functionality for popup
 */
function initializeDragHandling() {
    const popup = document.getElementById('workflowPopup');
    const header = popup?.querySelector('.workflow-header');
    
    if (!header) return;
    
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', dragPopup);
    document.addEventListener('mouseup', stopDrag);
}

function startDrag(e) {
    if (e.target.closest('.workflow-close-btn')) return; // Don't drag if clicking close button
    
    isDragging = true;
    const popup = document.getElementById('workflowPopup');
    const rect = popup.getBoundingClientRect();
    
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
}

function dragPopup(e) {
    if (!isDragging) return;
    
    const popup = document.getElementById('workflowPopup');
    const newX = e.clientX - dragOffsetX;
    const newY = e.clientY - dragOffsetY;
    
    // Keep popup within viewport
    const maxX = window.innerWidth - popup.offsetWidth;
    const maxY = window.innerHeight - popup.offsetHeight;
    
    popup.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
    popup.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    popup.style.right = 'auto';
    
    // Save position to localStorage
    const assetId = workflowState.assetId;
    if (assetId) {
        localStorage.setItem(`workflowPopupPosition_${assetId}`, JSON.stringify({
            left: popup.style.left,
            top: popup.style.top
        }));
    }
}

function stopDrag() {
    isDragging = false;
}

/**
 * Load saved popup position from localStorage
 */
function loadPopupPosition(assetId) {
    const saved = localStorage.getItem(`workflowPopupPosition_${assetId}`);
    if (saved) {
        try {
            const pos = JSON.parse(saved);
            const popup = document.getElementById('workflowPopup');
            popup.style.left = pos.left;
            popup.style.top = pos.top;
            popup.style.right = 'auto';
        } catch (e) {
            console.warn('Failed to restore popup position:', e);
        }
    }
}

// Ensure DOM is ready before initializing
function initializeWorkflow() {
    const popup = document.getElementById('workflowPopup');
    if (!popup) {
        // Retry in a moment if popup not found
        console.warn('Workflow popup not yet in DOM, retrying...');
        setTimeout(initializeWorkflow, 100);
        return;
    }
    console.log('✓ Workflow popup initialized successfully');
}

/**
 * Open the workflow popup and load steps
 */
async function openWorkflow(assetId, token) {
    workflowState.assetId = assetId;
    workflowState.currentStepIndex = 0;
    workflowState.steps = [];
    workflowState.completedSteps = new Set();

    // Wait for popup to be ready
    const popup = await waitForElement('workflowPopup', 500);
    
    if (!popup) {
        console.error('Workflow popup not found in DOM after waiting');
        alert('Error: Workflow popup not loaded. Please refresh the page.');
        return;
    }

    // Show the popup (don't replace content yet)
    popup.style.display = 'block';
    
    // Restore saved position and initialize drag handling
    loadPopupPosition(assetId);
    initializeDragHandling();

    try {
        // Fetch instructions from backend
        const response = await fetch(`${API_URL}/api/executor/asset-instructions/${assetId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            location.href = 'executor-login.html';
            return;
        }

        const data = await response.json();

        if (!data.success) {
            const contentDiv = popup.querySelector('#stepContainer');
            if (contentDiv) {
                contentDiv.innerHTML = `<div style="color: red; padding: 16px;">Error: ${data.message}</div>`;
            }
            return;
        }

        // Store asset and steps
        workflowState.asset = data.data.asset;
        workflowState.steps = data.data.instructions.steps || [];

        if (workflowState.steps.length === 0) {
            console.warn('No steps found in instructions');
            const contentDiv = popup.querySelector('#stepContainer');
            if (contentDiv) {
                contentDiv.innerHTML = `<div style="color: orange; padding: 16px;">No steps available for this asset</div>`;
            }
            return;
        }

        // Load saved progress from localStorage
        loadWorkflowProgress(assetId);

        // Render the first step
        renderWorkflowStep();

        workflowState.isOpen = true;
    } catch (error) {
        console.error('Error loading workflow:', error);
        const contentDiv = popup.querySelector('#stepContainer');
        if (contentDiv) {
            contentDiv.innerHTML = `<div style="color: red; padding: 16px;">Failed to load workflow. ${error.message}</div>`;
        }
    }
}

/**
 * Wait for a single element to appear in DOM
 */
function waitForElement(elementId, timeout = 1000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.getElementById(elementId);
            if (element) {
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                console.warn(`Element #${elementId} not found after ${timeout}ms`);
                resolve(null);
                return;
            }
            
            setTimeout(checkElement, 50);
        };
        
        checkElement();
    });
}

/**
 * Render the current step in the popup
 */
function renderWorkflowStep() {
    const popup = document.getElementById('workflowPopup');
    if (!popup) {
        console.error('Workflow popup element not found in DOM');
        return;
    }

    const step = workflowState.steps[workflowState.currentStepIndex];
    if (!step) {
        console.warn('No step at index', workflowState.currentStepIndex);
        showCompletionState();
        return;
    }

    // Safely update each element - skip if not found
    try {
        const titleEl = document.getElementById('workflowTitle');
        if (titleEl) titleEl.textContent = workflowState.asset?.platform_name || 'Asset';
        
        const accountEl = document.getElementById('workflowAccount');
        if (accountEl) accountEl.textContent = `Account: ${escapeHtml(workflowState.asset?.account_identifier || '')}`;

        // Update progress
        const totalSteps = workflowState.steps.length;
        const progress = ((workflowState.currentStepIndex + 1) / totalSteps) * 100;
        const progressBar = document.getElementById('progressBar');
        if (progressBar) progressBar.style.width = progress + '%';
        
        const progressText = document.getElementById('progressText');
        if (progressText) progressText.textContent = `Step ${workflowState.currentStepIndex + 1} of ${totalSteps}`;

        // Update step content
        const stepNumber = document.getElementById('stepNumber');
        if (stepNumber) stepNumber.textContent = step.step || (workflowState.currentStepIndex + 1);
        
        const stepTitle = document.getElementById('stepTitle');
        if (stepTitle) stepTitle.textContent = escapeHtml(step.title || 'Step');
        
        const stepDesc = document.getElementById('stepDescription');
        if (stepDesc) stepDesc.textContent = escapeHtml(step.description || '');
        
        const stepAction = document.getElementById('stepAction');
        if (stepAction) stepAction.innerHTML = `<strong>Action:</strong> ${escapeHtml(step.action || 'Complete this step')}`;

        // Add step links (opens platform + floating popup window)
        const stepLinks = document.getElementById('stepLinks');
        if (stepLinks) {
            stepLinks.innerHTML = '';
            if (step.link) {
                const link = document.createElement('a');
                link.href = '#';
                link.onclick = (e) => {
                    e.preventDefault();
                    openPlatformWithFloatingPopup(step.link, workflowState.asset?.platform_name || 'Platform');
                };
                link.innerHTML = `<i class="fas fa-external-link-alt"></i> Open ${escapeHtml(workflowState.asset?.platform_name || 'Platform')}`;
                stepLinks.appendChild(link);
            }
        }

        // Show credentials section if available
        const credSection = document.getElementById('credentialsSection');
        if (credSection) {
            if (workflowState.asset?.account_password) {
                credSection.style.display = 'block';
                const usernameInput = document.getElementById('credUsername');
                const passwordInput = document.getElementById('credPassword');
                if (usernameInput) usernameInput.value = workflowState.asset?.account_identifier || '';
                if (passwordInput) passwordInput.value = workflowState.asset?.account_password || '';
            } else {
                credSection.style.display = 'none';
            }
        }

        // Update checkbox state
        const checkbox = document.getElementById('stepCompleteCheck');
        if (checkbox) checkbox.checked = workflowState.completedSteps.has(workflowState.currentStepIndex);

        // Update button states
        updateNavigationButtons();

        // Update complete button visibility
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.style.display = (workflowState.currentStepIndex === totalSteps - 1) ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error rendering workflow step:', error);
    }
}

/**
 * Show completion state
 */
function showCompletionState() {
    const stepContainer = document.getElementById('stepContainer');
    if (!stepContainer) return;
    
    stepContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">
                <i class="fas fa-check-circle" style="color: #102c26;"></i>
            </div>
            <h6 style="color: #102c26; font-weight: bold;">Workflow Complete!</h6>
            <p style="color: #555; font-size: 0.9rem;">All steps have been completed for this asset.</p>
        </div>
    `;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
}

/**
 * Navigate to next step
 */
function nextStep() {
    if (workflowState.currentStepIndex < workflowState.steps.length - 1) {
        workflowState.currentStepIndex++;
        renderWorkflowStep();
        saveWorkflowProgress();
    }
}

/**
 * Navigate to previous step
 */
function prevStep() {
    if (workflowState.currentStepIndex > 0) {
        workflowState.currentStepIndex--;
        renderWorkflowStep();
        saveWorkflowProgress();
    }
}

/**
 * Mark current step as complete
 */
function markStepComplete() {
    const checkbox = document.getElementById('stepCompleteCheck');
    if (checkbox.checked) {
        workflowState.completedSteps.add(workflowState.currentStepIndex);
    } else {
        workflowState.completedSteps.delete(workflowState.currentStepIndex);
    }
    saveWorkflowProgress();
}

/**
 * Complete the entire workflow
 */
async function completeWorkflow() {
    if (!confirm('Mark this task as complete? You can always reopen it later.')) {
        return;
    }

    try {
        // Optional: Update backend if needed
        // await fetch(`${API_URL}/api/executor/tasks/${workflowState.assetId}/complete`, {
        //     method: 'PUT',
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ status: 'completed' })
        // });

        // Clear workflow progress
        localStorage.removeItem(`workflow-${workflowState.assetId}`);
        closeWorkflow();

        // Show success message
        showNotification('Task marked as complete!', 'success');
    } catch (error) {
        console.error('Error completing workflow:', error);
        showNotification('Failed to complete task', 'error');
    }
}

/**
 * Close the workflow popup
 */
function closeWorkflow() {
    const popup = document.getElementById('workflowPopup');
    if (popup) {
        popup.style.display = 'none';
    }
    workflowState.isOpen = false;
    saveWorkflowProgress();
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    const totalSteps = workflowState.steps.length;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.disabled = workflowState.currentStepIndex === 0;
    if (nextBtn) nextBtn.disabled = workflowState.currentStepIndex === totalSteps - 1;
}

/**
 * Save workflow progress to localStorage
 */
function saveWorkflowProgress() {
    if (!workflowState.assetId) return;

    const progress = {
        currentStepIndex: workflowState.currentStepIndex,
        completedSteps: Array.from(workflowState.completedSteps),
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(`workflow-${workflowState.assetId}`, JSON.stringify(progress));
}

/**
 * Load workflow progress from localStorage
 */
function loadWorkflowProgress(assetId) {
    const saved = localStorage.getItem(`workflow-${assetId}`);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            workflowState.currentStepIndex = progress.currentStepIndex || 0;
            workflowState.completedSteps = new Set(progress.completedSteps || []);
        } catch (error) {
            console.warn('Failed to load workflow progress:', error);
        }
    }
}

/**
 * Show notification (helper)
 */
function showNotification(message, type = 'info') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; left: 20px; z-index: 10000; max-width: 400px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertHTML);
}

/**
 * Copy credential to clipboard
 */
function copyCredential(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return;

    const text = element.value;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('button');
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.backgroundColor = 'rgba(16, 44, 38, 0.3)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.backgroundColor = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return;

    const btn = event.target.closest('button');
    if (!btn) return;

    if (element.type === 'password') {
        element.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        element.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

/**
 * Open platform link + floating popup window with instructions
 */
function openPlatformWithFloatingPopup(platformUrl, platformName) {
    // 1. Open the platform in a new tab
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    
    // 2. Open a floating window with the popup instructions
    const popupWindow = window.open(
        '',
        'digipass_popup',
        'width=450,height=800,left=100,top=100,resizable=yes,scrollbars=yes'
    );
    
    if (!popupWindow) {
        alert('Popup window blocked. Please allow popups for this site.');
        return;
    }
    
    // 3. Pass data to the popup window
    sessionStorage.setItem('digipass_asset_id', workflowState.assetId);
    sessionStorage.setItem('digipass_token', localStorage.getItem('executorToken'));
    
    // 4. Write HTML to the popup window
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DIGIPASS - ${escapeHtml(platformName)}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: #f7e7ce;
            margin: 0;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .popup-container {
            background-color: #f7e7ce;
            color: #102c26;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 16px;
        }
        .popup-header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid #102c26;
            padding-bottom: 12px;
        }
        .popup-header h5 {
            margin: 0;
            color: #102c26;
            font-weight: 600;
        }
        .popup-content {
            flex: 1;
            overflow-y: auto;
            padding-right: 8px;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #102c26;
        }
        .error-msg {
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 4px;
            margin: 12px 0;
        }
    </style>
</head>
<body>
    <div class="popup-container">
        <div class="popup-header">
            <h5><i class="fas fa-tasks"></i> ${escapeHtml(platformName)} Instructions</h5>
        </div>
        <div class="popup-content" id="content">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading instructions...
            </div>
        </div>
    </div>
    
    <script>
        const API_URL = '${API_URL}';
        
        async function loadInstructions() {
            try {
                const assetId = sessionStorage.getItem('digipass_asset_id');
                const token = sessionStorage.getItem('digipass_token');
                
                if (!assetId || !token) {
                    document.getElementById('content').innerHTML = '<div class="error-msg">Error: Missing asset or token. Please close this window and try again.</div>';
                    return;
                }
                
                const response = await fetch(\`\${API_URL}/api/executor/asset-instructions/\${assetId}\`, {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load instructions');
                }
                
                const data = await response.json();
                const asset = data.data.asset;
                const instructions = data.data.instructions;
                
                let html = '<div style="padding: 8px;">';
                
                // Add credentials if available
                if (asset.account_password) {
                    html += \`
                        <div style="background-color: rgba(16, 44, 38, 0.08); border: 1px solid #102c26; border-radius: 4px; padding: 12px; margin-bottom: 16px;">
                            <div style="font-weight: bold; color: #102c26; margin-bottom: 8px;">
                                <i class="fas fa-key"></i> Login Credentials
                            </div>
                            <div style="font-size: 0.9rem; margin-bottom: 8px;">
                                <strong>Username:</strong><br>
                                <code style="background: white; padding: 4px; border-radius: 3px; display: block; margin-top: 4px;">\${asset.account_identifier}</code>
                            </div>
                            <div style="font-size: 0.9rem;">
                                <strong>Password:</strong><br>
                                <code style="background: white; padding: 4px; border-radius: 3px; display: block; margin-top: 4px;">\${asset.account_password}</code>
                            </div>
                        </div>
                    \`;
                }
                
                // Add instructions
                html += '<div style="margin-top: 12px;"><strong style="color: #102c26;">Steps to Follow:</strong></div>';
                instructions.forEach((step, i) => {
                    html += \`
                        <div style="background: white; border: 1px solid #e0d4c0; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
                            <div style="font-weight: 600; color: #102c26; margin-bottom: 6px;">
                                <span style="background: #102c26; color: #f7e7ce; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.8rem;">\${i + 1}</span>
                                \${step.title}
                            </div>
                            <p style="margin: 6px 0; font-size: 0.9rem; color: #555;">\${step.description}</p>
                            <div style="font-size: 0.85rem; color: #102c26; background: #f9f6f1; padding: 6px; border-radius: 3px;">
                                <strong>Action:</strong> \${step.action}
                            </div>
                        </div>
                    \`;
                });
                
                html += '</div>';
                document.getElementById('content').innerHTML = html;
                
            } catch (e) {
                console.error('Error:', e);
                document.getElementById('content').innerHTML = \`<div class="error-msg">Error loading instructions: \${e.message}</div>\`;
            }
        }
        
        // Load when page opens
        setTimeout(loadInstructions, 500);
    </script>
</body>
</html>
    `;
    
    popupWindow.document.write(htmlContent);
    popupWindow.document.close();
    
    // Focus the floating window
    popupWindow.focus();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize workflow when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWorkflow();
});

// Also initialize immediately (in case DOMContentLoaded already fired)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeWorkflow();
    });
} else {
    initializeWorkflow();
}
