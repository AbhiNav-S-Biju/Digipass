const API_URL = 'https://digipass-production.up.railway.app:8080/api';

// Show message
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `show ${type}`;
  
  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 4000);
}

// Register form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    showMessage('All fields are required', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  const btn = document.querySelector('.btn-primary');
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Registration failed', 'error');
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

    showMessage('Registration successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);

  } catch (error) {
    console.error('Register error:', error);
    showMessage('Network error. Please try again.', 'error');
    btn.disabled = false;
  }
});
