const API_URL = 'https://digipass-3l63.onrender.com/api';

// UI helper functions (embedded for client-side use)
function setButtonLoading(button, isLoading, loadingText = 'Logging in...') {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Login';
    button.classList.remove('loading');
  }
}

function showError(container, message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.innerHTML = `<div class="error-content"><strong>Error:</strong> ${escapeHtml(message)}</div>
    <button class="error-dismiss" aria-label="Close error message">&times;</button>`;
  
  container.innerHTML = '';
  container.appendChild(errorDiv);
  
  errorDiv.querySelector('.error-dismiss').addEventListener('click', () => {
    errorDiv.remove();
  });
}

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
}

function showFieldErrors(form, errors) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  
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

function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

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

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const messageDiv = document.getElementById('message');
  const btn = document.querySelector('.btn-primary');

  // Clear previous errors
  clearFormErrors(form);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  const errors = {};
  if (!email || !email.includes('@')) {
    errors.email = 'Valid email address is required';
  }
  if (!password || password.length < 1) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    showFieldErrors(form, errors);
    return;
  }

  setButtonLoading(btn, true);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(messageDiv, data.message || 'Login failed. Please check your credentials.');
      setButtonLoading(btn, false);
      return;
    }

    // Save token and user data
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify({
      userId: data.data.userId,
      fullName: data.data.fullName,
      email: data.data.email
    }));

    showSuccess(messageDiv, 'Login successful! Redirecting to dashboard...');
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);

  } catch (error) {
    console.error('Login error:', error);
    showError(messageDiv, error.message || 'Network error. Please check your connection and try again.');
    setButtonLoading(btn, false);
  }
});
