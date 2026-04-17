const API_BASE_URL = 'https://digipass-production.up.railway.app/api';
let executorData = null;

async function verifyToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    showStatus('No verification token provided', 'error');
    return;
  }

  try {
    showStatus('Verifying your identity...', 'loading');

    const response = await fetch(`${API_BASE_URL}/executors/verify?token=${token}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      executorData = result.data;
      showPasswordSetup();
    } else {
      showStatus('❌ ' + (result.message || 'Verification failed'), 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus('Verification error: ' + error.message, 'error');
  }
}

function showPasswordSetup() {
  document.getElementById('qrContent').style.display = 'none';
  document.getElementById('verificationStatus').innerHTML = '';
  
  const passwordSetup = document.getElementById('passwordSetupContent');
  passwordSetup.style.display = 'block';
  
  const heading = document.querySelector('.qr-container h1');
  heading.textContent = `Welcome, ${executorData.executor_name}`;
  
  const form = document.getElementById('passwordForm');
  form.addEventListener('submit', handlePasswordSetup);
}

async function handlePasswordSetup(event) {
  event.preventDefault();

  const password = document.getElementById('executorPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('passwordError');

  // Validation
  if (password.length < 8) {
    showPasswordError('Password must be at least 8 characters');
    return;
  }

  if (password !== confirmPassword) {
    showPasswordError('Passwords do not match');
    return;
  }

  // Check password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    showPasswordError('Password must include uppercase, lowercase, number, and symbol (@$!%*?&)');
    return;
  }

  try {
    errorDiv.style.display = 'none';
    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Setting up...';

    const response = await fetch(`${API_BASE_URL}/executors/setup-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: new URLSearchParams(window.location.search).get('token'),
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      showStatus('✅ Password set successfully! Redirecting to login...', 'success');
      
      // Store executor token if provided (for auto-login)
      if (result.data && result.data.token) {
        localStorage.setItem('executorToken', result.data.token);
      }

      setTimeout(() => {
        window.location.href = '/executor-login.html';
      }, 2000);
    } else {
      showPasswordError(result.message || 'Failed to set password');
      button.disabled = false;
      button.textContent = 'Set Password & Login';
    }
  } catch (error) {
    console.error('Error:', error);
    showPasswordError('Setup error: ' + error.message);
    button.disabled = false;
    button.textContent = 'Set Password & Login';
  }
}

function showPasswordError(message) {
  const errorDiv = document.getElementById('passwordError');
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('verificationStatus');
  statusDiv.innerHTML = `<div class="verify-status ${type}">${message}</div>`;
}

function openLink() {
  const link = document.getElementById('verificationLink').textContent;
  if (link) {
    window.location.href = link;
  }
}

function goBack() {
  window.location.href = '/dashboard.html';
}

// Auto-verify if token is in URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    verifyToken();
  }
});
