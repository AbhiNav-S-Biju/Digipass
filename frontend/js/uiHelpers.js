// Frontend UI and form handling utilities

/**
 * Show loading state on a button
 * @param {HTMLElement} button
 * @param {boolean} isLoading
 * @param {string} loadingText
 */
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
    button.classList.remove('loading');
  }
}

/**
 * Show error message in a container
 * @param {HTMLElement} container
 * @param {string} message
 * @param {boolean} dismissible
 */
function showError(container, message, dismissible = true) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.setAttribute('role', 'alert');
  
  let html = `<div class="error-content"><strong>Error:</strong> ${escapeHtml(message)}</div>`;
  
  if (dismissible) {
    html += '<button class="error-dismiss" aria-label="Close error message">&times;</button>';
  }
  
  errorDiv.innerHTML = html;
  container.innerHTML = '';
  container.appendChild(errorDiv);
  
  if (dismissible) {
    errorDiv.querySelector('.error-dismiss').addEventListener('click', () => {
      errorDiv.remove();
    });
  }
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 10000);
}

/**
 * Show success message
 * @param {HTMLElement} container
 * @param {string} message
 */
function showSuccess(container, message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.setAttribute('role', 'status');
  successDiv.innerHTML = `<div class="success-content"><strong>Success:</strong> ${escapeHtml(message)}</div>
    <button class="success-dismiss" aria-label="Close success message">&times;</button>`;
  
  container.innerHTML = '';
  container.appendChild(successDiv);
  
  successDiv.querySelector('.success-dismiss').addEventListener('click', () => {
    successDiv.remove();
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.remove();
    }
  }, 5000);
}

/**
 * Show validation errors for form fields
 * @param {HTMLElement} form
 * @param {Object} errors - Object with field names as keys and error messages as values
 */
function showFieldErrors(form, errors) {
  // Clear previous errors
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  
  // Show new errors
  Object.entries(errors).forEach(([fieldName, message]) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('input-error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = message;
      field.parentNode.appendChild(errorDiv);
    }
  });
}

/**
 * Clear all form errors
 * @param {HTMLElement} form
 */
function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Parse API error response
 * @param {Response|Error} response
 */
async function parseApiError(response) {
  if (response instanceof Error) {
    return response.message || 'An unexpected error occurred';
  }
  
  try {
    const data = await response.json();
    return data.message || 'An error occurred';
  } catch (e) {
    return response.statusText || 'An error occurred';
  }
}

/**
 * Format password strength feedback
 * @param {string} password
 */
function getPasswordStrengthFeedback(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@$!%*?&]/.test(password)
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  const messages = [];
  
  if (!checks.length) messages.push('At least 8 characters');
  if (!checks.uppercase) messages.push('One uppercase letter');
  if (!checks.lowercase) messages.push('One lowercase letter');
  if (!checks.number) messages.push('One number');
  if (!checks.symbol) messages.push('One symbol (@$!%*?&)');
  
  return {
    strength,
    missing: messages,
    isValid: strength === 5
  };
}

/**
 * Setup auto-save indicator for forms
 * @param {HTMLElement} form
 */
function setupAutoSaveIndicator(form) {
  const indicator = document.createElement('div');
  indicator.className = 'auto-save-indicator';
  indicator.innerHTML = '<span class="spinner-small"></span> Saving...';
  form.appendChild(indicator);
  
  return {
    show: () => indicator.classList.add('visible'),
    hide: () => indicator.classList.remove('visible'),
    showSuccess: () => {
      indicator.innerHTML = '✓ Saved';
      indicator.classList.add('visible', 'success');
      setTimeout(() => indicator.classList.remove('visible', 'success'), 2000);
    }
  };
}

/**
 * Create a modal for confirmations
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function showConfirmModal(title, message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'confirm-modal-overlay';
  modal.innerHTML = `
    <div class="confirm-modal">
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        <button class="btn btn-primary" data-action="confirm">Confirm</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const close = () => modal.remove();
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    onConfirm();
    close();
  });
  modal.querySelector('.modal-close').addEventListener('click', close);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

module.exports = {
  setButtonLoading,
  showError,
  showSuccess,
  showFieldErrors,
  clearFormErrors,
  escapeHtml,
  parseApiError,
  getPasswordStrengthFeedback,
  setupAutoSaveIndicator,
  showConfirmModal
};
