/**
 * DIGIPASS Workflow Engine
 * Handles step navigation, credential display, and video preview
 */

class WorkflowEngine {
  constructor() {
    this.currentWorkflow = null;
    this.currentStepIndex = 0;
    this.completedSteps = new Set();
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    const closeBtn = document.querySelector('.workflow-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeWorkflow());
    }

    // Next/Previous buttons
    const nextBtn = document.querySelector('.workflow-btn-next');
    const prevBtn = document.querySelector('.workflow-btn-prev');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToNextStep());
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPreviousStep());
    }

    // Step item clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.step-item')) {
        const stepNum = parseInt(e.target.closest('.step-item').dataset.step) - 1;
        this.goToStep(stepNum);
      }
    });

    // Copy credential buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.credential-copy-btn')) {
        const btn = e.target.closest('.credential-copy-btn');
        const fieldId = btn.dataset.field;
        this.copyCredentialToClipboard(fieldId, btn);
      }
    });

    // Toggle password visibility
    document.addEventListener('click', (e) => {
      if (e.target.closest('.credential-toggle-btn')) {
        const btn = e.target.closest('.credential-toggle-btn');
        const fieldId = btn.dataset.field;
        this.togglePasswordVisibility(fieldId, btn);
      }
    });
  }

  /**
   * Open workflow for a specific asset with action type
   */
  openWorkflow(assetId, platformName, accountIdentifier, credentials = {}, actionType = null) {
    // Get workflow with action type support
    this.currentWorkflow = getWorkflow(platformName, actionType);
    
    if (!this.currentWorkflow) {
      console.error(`Workflow not found for ${platformName} with action ${actionType}`);
      return;
    }

    this.currentStepIndex = 0;
    this.completedSteps.clear();

    // Store credentials and metadata
    this.credentials = credentials;
    this.accountIdentifier = accountIdentifier;
    this.platformName = platformName;
    this.actionType = actionType;
    this.assetId = assetId;

    // Show workflow panel
    const panel = document.getElementById('workflowPanel');
    if (panel) {
      panel.classList.add('workflow-panel-visible');
      panel.classList.remove('workflow-panel-hidden');
    }

    // Render workflow
    this.renderWorkflow();
  }

  /**
   * Close workflow
   */
  closeWorkflow() {
    const panel = document.getElementById('workflowPanel');
    if (panel) {
      panel.classList.remove('workflow-panel-visible');
      panel.classList.add('workflow-panel-hidden');
    }

    // Save progress
    this.saveProgress();
  }

  /**
   * Render the entire workflow
   */
  renderWorkflow() {
    this.renderStepsList();
    this.renderCurrentStep();
    this.updateProgressBar();
  }

  /**
   * Render steps list (left panel)
   */
  renderStepsList() {
    const stepsList = document.getElementById('stepsList');
    if (!stepsList) return;

    const stepsHtml = this.currentWorkflow.steps.map((step, index) => {
      const isCompleted = this.completedSteps.has(index);
      const isActive = index === this.currentStepIndex;

      return `
        <div class="step-item ${isActive ? 'step-item-active' : ''} ${isCompleted ? 'step-item-completed' : ''}" data-step="${step.stepNumber}">
          <div class="step-item-number">
            ${isCompleted ? '<i class="fas fa-check"></i>' : step.stepNumber}
          </div>
          <div class="step-item-content">
            <h5>${step.title}</h5>
            <p>${step.description}</p>
          </div>
        </div>
      `;
    }).join('');

    stepsList.innerHTML = stepsHtml;
  }

  /**
   * Get credential value by type (handles combined types like 'username/email')
   */
  getCredentialValue(credType) {
    // If exact match exists, use it
    if (this.credentials[credType]) {
      return this.credentials[credType];
    }
    
    // Handle combined credential types (e.g., 'username/email', 'email/phone')
    if (credType.includes('/')) {
      const options = credType.split('/').map(opt => opt.trim());
      for (const option of options) {
        if (this.credentials[option]) {
          return this.credentials[option];
        }
      }
    }
    
    return 'Not available';
  }

  /**
   * Render current step (right panel)
   */
  renderCurrentStep() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const step = this.currentWorkflow.steps[this.currentStepIndex];

    let credentialsHtml = '';
    if (step.credentials && step.credentials.length > 0) {
      credentialsHtml = `
        <div class="credentials-section">
          <div class="credentials-header">
            <i class="fas fa-key"></i> Login Credentials
          </div>
          <div class="credentials-body">
            ${step.credentials.map(credType => {
              const credValue = this.getCredentialValue(credType);
              const isPassword = credType.includes('password') || credType.includes('pass');
              const fieldId = `cred-${credType}-${this.currentStepIndex}`;

              return `
                <div class="credential-item">
                  <div class="credential-label">${this.formatCredentialLabel(credType)}</div>
                  <div class="credential-value-wrapper">
                    <input 
                      type="${isPassword ? 'password' : 'text'}" 
                      id="${fieldId}" 
                      class="credential-value" 
                      value="${credValue}" 
                      readonly
                    />
                    <button class="credential-toggle-btn" data-field="${fieldId}" title="Show/hide">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="credential-copy-btn" data-field="${fieldId}" title="Copy to clipboard">
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    const tipsHtml = step.tips ? `
      <div class="step-tips">
        <h6><i class="fas fa-lightbulb"></i> Tips</h6>
        <ul>
          ${step.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    // Display farewell message for last_message action
    let messageHtml = '';
    if (this.actionType === 'last_message' && this.lastMessage) {
      messageHtml = `
        <div class="farewell-message-box">
          <div class="farewell-message-header">
            <i class="fas fa-envelope"></i> User's Farewell Message
          </div>
          <div class="farewell-message-body">
            <p>${this.lastMessage}</p>
            <button class="credential-copy-btn" onclick="navigator.clipboard.writeText('${this.lastMessage.replace(/'/g, "\\'")}'); alert('✓ Message copied to clipboard!');">
              <i class="fas fa-copy"></i> Copy Message
            </button>
          </div>
        </div>
      `;
    }

    // Video/Image container (optional - only if URL provided)
    let mediaHtml = '';
    if (step.videoUrl) {
      mediaHtml = `
        <div class="video-container" id="videoContainer-${this.currentStepIndex}">
          <iframe 
            class="youtube-video"
            src="https://www.youtube.com/embed/${step.videoUrl}?autoplay=1&mute=1&controls=1"
            title="${step.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else if (step.imageUrl) {
      mediaHtml = `
        <div class="image-container" id="imageContainer-${this.currentStepIndex}">
          <img src="${step.imageUrl}" alt="${step.title}" title="${step.title}" />
        </div>
      `;
    }

    const content = `
      <div class="step-preview-container">
        <div class="step-preview-header">
          <h3>${this.currentWorkflow.appName}${this.currentWorkflow.title ? ` - ${this.currentWorkflow.title}` : ''}</h3>
          <span class="step-badge">${this.currentStepIndex + 1} of ${this.currentWorkflow.steps.length}</span>
        </div>

        ${mediaHtml}

        <div class="step-details">
          <h4>${step.title}</h4>
          <p class="step-action"><strong>Action:</strong> ${step.action}</p>
          ${messageHtml}
          ${credentialsHtml}
          ${tipsHtml}
        </div>

        <div class="step-navigation">
          <button class="workflow-btn workflow-btn-prev" ${this.currentStepIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
          </button>
          <button class="workflow-btn workflow-btn-complete" onclick="workflowEngine.markStepComplete()">
            <i class="fas fa-check-circle"></i> Mark as Complete
          </button>
          <button class="workflow-btn workflow-btn-next" ${this.currentStepIndex === this.currentWorkflow.steps.length - 1 ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    previewContent.innerHTML = content;

    // Re-setup event listeners
    this.setupEventListeners();
  }

  /**
   * Update progress bar
   */
  updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar) {
      const percentage = ((this.currentStepIndex + 1) / this.currentWorkflow.steps.length) * 100;
      progressBar.style.width = percentage + '%';
    }

    if (progressText) {
      progressText.textContent = `Step ${this.currentStepIndex + 1} of ${this.currentWorkflow.steps.length}`;
    }
  }

  /**
   * Navigate to next step
   */
  goToNextStep() {
    if (this.currentStepIndex < this.currentWorkflow.steps.length - 1) {
      this.currentStepIndex++;
      this.renderWorkflow();
      this.scrollToTop();
    }
  }

  /**
   * Navigate to previous step
   */
  goToPreviousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderWorkflow();
      this.scrollToTop();
    }
  }

  /**
   * Go to specific step
   */
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.currentWorkflow.steps.length) {
      this.currentStepIndex = stepIndex;
      this.renderWorkflow();
      this.scrollToTop();
    }
  }

  /**
   * Mark current step as complete
   */
  markStepComplete() {
    this.completedSteps.add(this.currentStepIndex);
    this.renderStepsList();

    // Show toast notification
    this.showToast(`✓ Step ${this.currentStepIndex + 1} completed!`);

    // Auto-advance to next step
    setTimeout(() => {
      if (this.currentStepIndex < this.currentWorkflow.steps.length - 1) {
        this.goToNextStep();
      }
    }, 800);
  }

  /**
   * Copy credential to clipboard
   */
  copyCredentialToClipboard(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const value = field.value;
    navigator.clipboard.writeText(value).then(() => {
      const originalHtml = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i>';
      this.showToast('✓ Copied to clipboard!');

      setTimeout(() => {
        button.innerHTML = originalHtml;
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      field.select();
      document.execCommand('copy');
      this.showToast('✓ Copied to clipboard!');
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const isPassword = field.type === 'password';
    field.type = isPassword ? 'text' : 'password';

    button.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  }

  /**
   * Format credential label
   */
  formatCredentialLabel(credType) {
    // Handle combined credential types (e.g., 'username/email' → 'Username or Email')
    if (credType.includes('/')) {
      const options = credType.split('/').map(opt => 
        opt.trim().charAt(0).toUpperCase() + opt.trim().slice(1)
      );
      return options.join(' or ');
    }
    
    // Handle underscore-separated labels
    return credType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Show toast notification
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'workflow-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('workflow-toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('workflow-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /**
   * Scroll to top of preview panel
   */
  scrollToTop() {
    const previewPanel = document.querySelector('.workflow-preview-panel');
    if (previewPanel) {
      previewPanel.scrollTop = 0;
    }
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    if (this.currentWorkflow) {
      const progress = {
        currentStep: this.currentStepIndex,
        completedSteps: Array.from(this.completedSteps)
      };
      localStorage.setItem(
        `workflow-progress-${this.currentWorkflow.appName}`,
        JSON.stringify(progress)
      );
    }
  }

  /**
   * Load saved progress
   */
  loadProgress(platformName) {
    const saved = localStorage.getItem(`workflow-progress-${platformName}`);
    if (saved) {
      const progress = JSON.parse(saved);
      this.currentStepIndex = progress.currentStep || 0;
      this.completedSteps = new Set(progress.completedSteps || []);
    }
  }
}

// Global instance
let workflowEngine = new WorkflowEngine();

/**
 * Open workflow from asset card button click
 */
function openWorkflow(assetId, token, platformName, accountIdentifier) {
  // Get platform and account from button
  const btn = event?.target.closest('.btn-view-instructions');
  if (!btn) return;
  
  const platform = btn.dataset.platform || platformName || 'Gmail';
  const account = btn.dataset.account || accountIdentifier || 'user@example.com';
  
  // Get available actions for this platform
  const availableActions = getAvailableActions(platform);
  
  if (!availableActions || availableActions.length === 0) {
    console.error(`No actions available for platform: ${platform}`);
    return;
  }
  
  // If only one action available, open it directly
  if (availableActions.length === 1) {
    openWorkflowWithAction(assetId, platform, account, availableActions[0]);
    return;
  }
  
  // Show action selection modal
  showActionSelector(platform, availableActions, (selectedAction) => {
    openWorkflowWithAction(assetId, platform, account, selectedAction);
  });
}

/**
 * Open workflow with selected action
 */
function openWorkflowWithAction(assetId, platformName, accountIdentifier, actionType) {
  const mockCredentials = {
    email: accountIdentifier,
    password: '••••••••••',
    username: accountIdentifier.split('@')[0],
    apple_id: accountIdentifier
  };
  
  workflowEngine.openWorkflow(assetId, platformName, accountIdentifier, mockCredentials, actionType);
}

  /**
   * Open workflow directly with action type (no action selector - for executor side)
   * This is used when the user has already chosen the action
   */
  openWorkflowWithMessage(assetId, platformName, accountIdentifier, actionType, lastMessage = null) {
    if (!actionType) {
      console.error('Action type is required for openWorkflowWithMessage');
      return;
    }
    
    const credentials = {
      email: accountIdentifier,
      password: '••••••••••',
      username: accountIdentifier.split('@')[0],
      apple_id: accountIdentifier
    };
    
    // Store the message for last_message action
    this.lastMessage = lastMessage;
    
    workflowEngine.openWorkflow(assetId, platformName, accountIdentifier, credentials, actionType);
  }

/**
 * Open workflow directly with action type (no action selector - for executor side)
 * This is used when the user has already chosen the action
 */
function openWorkflowDirect(assetId, platformName, accountIdentifier, actionType, lastMessage = null) {
  if (!actionType) {
    console.error('Action type is required for openWorkflowDirect');
    return;
  }
  
  const mockCredentials = {
    email: accountIdentifier,
    password: '••••••••••',
    username: accountIdentifier.split('@')[0],
    apple_id: accountIdentifier
  };
  
  // Store the message for last_message action
  workflowEngine.lastMessage = lastMessage;
  
  workflowEngine.openWorkflow(assetId, platformName, accountIdentifier, mockCredentials, actionType);
}

/**
 * Show action selector modal
 */
function showActionSelector(platformName, actions, callback) {
  // Create modal HTML
  const actionLabels = {
    'delete': '🗑️ Delete Account',
    'pass': '📋 Pass to Executor',
    'last_message': '💬 Send Last Message'
  };
  
  const modalHtml = `
    <div class="action-selector-modal" id="actionSelectorModal">
      <div class="action-selector-content">
        <div class="action-selector-header">
          <h3>Select Action for ${platformName}</h3>
          <button class="action-selector-close" onclick="document.getElementById('actionSelectorModal').remove()">×</button>
        </div>
        <div class="action-selector-body">
          <p>Choose what you want to do with this account:</p>
          <div class="action-buttons">
            ${actions.map(action => `
              <button class="action-btn" onclick="
                document.getElementById('actionSelectorModal').remove();
                (${callback.toString()}('${action}'));
              ">
                ${actionLabels[action] || action}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to DOM
  const modal = document.createElement('div');
  modal.innerHTML = modalHtml;
  document.body.appendChild(modal.firstElementChild);
}

