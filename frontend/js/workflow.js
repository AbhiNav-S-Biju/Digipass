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

    // Wait for popup to be ready
    const popup = await waitForElement('workflowPopup', 500);
    
    if (!popup) {
        console.error('Workflow popup not found in DOM after waiting');
        alert('Error: Workflow popup not loaded. Please refresh the page.');
        return;
    }

    // Show the popup (don't replace content yet)
    popup.style.display = 'block';

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

        // Add step links
        const stepLinks = document.getElementById('stepLinks');
        if (stepLinks) {
            stepLinks.innerHTML = '';
            if (step.link) {
                const link = document.createElement('a');
                link.href = step.link;
                link.target = '_blank';
                link.innerHTML = `<i class="fas fa-external-link-alt"></i> Open ${escapeHtml(workflowState.asset?.platform_name || 'Platform')}`;
                stepLinks.appendChild(link);
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
