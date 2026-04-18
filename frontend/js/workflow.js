// Workflow State Management
const workflowState = {
    isOpen: false,
    currentStepIndex: 0,
    assetId: null,
    steps: [],
    asset: null,
    completedSteps: new Set()
};

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

    const popup = document.getElementById('workflowPopup');
    
    if (!popup) {
        console.error('Workflow popup not found in DOM');
        alert('Error: Workflow popup not loaded. Please refresh the page.');
        return;
    }

    const contentDiv = popup.querySelector('#stepContainer');
    
    if (!contentDiv) {
        console.error('Step container not found in workflow popup');
        alert('Error: Workflow interface not fully loaded. Please refresh the page.');
        return;
    }

    // Show loading state
    popup.style.display = 'block';
    contentDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p style="margin-top: 10px; color: #555;">Loading workflow...</p>
        </div>
    `;

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
            contentDiv.innerHTML = `<div style="color: red; padding: 16px;">Error: ${data.message}</div>`;
            return;
        }

        // Store asset and steps
        workflowState.asset = data.data.asset;
        workflowState.steps = data.data.instructions.steps || [];

        // Load saved progress from localStorage
        loadWorkflowProgress(assetId);

        // Render the first step
        renderWorkflowStep();

        workflowState.isOpen = true;
    } catch (error) {
        console.error('Error loading workflow:', error);
        contentDiv.innerHTML = `<div style="color: red; padding: 16px;">Failed to load workflow. Please try again.</div>`;
    }
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

    // Ensure all required elements exist
    const requiredElements = [
        'workflowTitle',
        'workflowAccount',
        'progressBar',
        'progressText',
        'stepNumber',
        'stepTitle',
        'stepDescription',
        'stepAction',
        'stepLinks',
        'stepCompleteCheck',
        'prevBtn',
        'nextBtn'
    ];

    for (const id of requiredElements) {
        if (!document.getElementById(id)) {
            console.error(`Required element #${id} not found in DOM`);
            return;
        }
    }

    const step = workflowState.steps[workflowState.currentStepIndex];
    if (!step) {
        // No more steps - show completion state
        showCompletionState();
        return;
    }

    // Update title and account
    document.getElementById('workflowTitle').textContent = workflowState.asset.platform_name;
    document.getElementById('workflowAccount').textContent = `Account: ${escapeHtml(workflowState.asset.account_identifier)}`;

    // Update progress
    const totalSteps = workflowState.steps.length;
    const progress = ((workflowState.currentStepIndex + 1) / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Step ${workflowState.currentStepIndex + 1} of ${totalSteps}`;

    // Update step content
    document.getElementById('stepNumber').textContent = step.step;
    document.getElementById('stepTitle').textContent = escapeHtml(step.title);
    document.getElementById('stepDescription').textContent = escapeHtml(step.description);
    document.getElementById('stepAction').innerHTML = `<strong>Action:</strong> ${escapeHtml(step.action)}`;

    // Add step links
    const linksContainer = document.getElementById('stepLinks');
    linksContainer.innerHTML = '';
    if (step.link) {
        const link = document.createElement('a');
        link.href = step.link;
        link.target = '_blank';
        link.innerHTML = `<i class="fas fa-external-link-alt"></i> Open ${escapeHtml(workflowState.asset.platform_name)}`;
        linksContainer.appendChild(link);
    }

    // Update checkbox state
    const checkbox = document.getElementById('stepCompleteCheck');
    checkbox.checked = workflowState.completedSteps.has(workflowState.currentStepIndex);

    // Update button states
    updateNavigationButtons();

    // Update complete button visibility
    const completeBtn = document.getElementById('completeBtn');
    if (workflowState.currentStepIndex === totalSteps - 1) {
        completeBtn.style.display = 'flex';
    } else {
        completeBtn.style.display = 'none';
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

    if (!prevBtn || !nextBtn) {
        console.warn('Navigation buttons not found in DOM');
        return;
    }

    prevBtn.disabled = workflowState.currentStepIndex === 0;
    nextBtn.disabled = workflowState.currentStepIndex === totalSteps - 1;
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
