const API_URL = 'https://digipass-production.up.railway.app/api';

// Show message
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `show ${type}`;
  
  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 4000);
}

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!email || !password) {
    showMessage('Email and password are required', 'error');
    return;
  }

  const btn = document.querySelector('.btn-primary');
  btn.disabled = true;

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
      showMessage(data.message || 'Login failed', 'error');
      btn.disabled = false;
      return;
    }

    // Save token and user data
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify({
      userId: data.data.userId,
      fullName: data.data.fullName,
      email: data.data.email
    }));

    showMessage('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);

  } catch (error) {
    console.error('Login error:', error);
    showMessage('Network error. Please try again.', 'error');
    btn.disabled = false;
  }
});
