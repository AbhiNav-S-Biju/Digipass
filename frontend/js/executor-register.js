const API_URL = 'https://digipass-production.up.railway.app/api';

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `show ${type}`;
}

function getTokenFromQuery() {
  return new URLSearchParams(window.location.search).get('token');
}

async function validateToken(token) {
  const response = await fetch(`${API_URL}/executors/verify?token=${encodeURIComponent(token)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Verification link is invalid or expired');
  }

  return data.data;
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = getTokenFromQuery();
  const inviteInfo = document.getElementById('executorInviteInfo');
  const form = document.getElementById('executorRegisterForm');

  if (!token) {
    form.style.display = 'none';
    showMessage('Verification token is missing.', 'error');
    return;
  }

  try {
    const executor = await validateToken(token);
    inviteInfo.textContent = `Invitation for ${executor.executor_name} (${executor.executor_email})`;
  } catch (error) {
    form.style.display = 'none';
    showMessage(error.message, 'error');
  }
});

document.getElementById('executorRegisterForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = getTokenFromQuery();
  const password = document.getElementById('executorRegisterPassword').value;
  const confirmPassword = document.getElementById('executorRegisterConfirmPassword').value;
  const button = document.querySelector('.btn-primary');

  if (!token || !password || !confirmPassword) {
    showMessage('All fields are required.', 'error');
    return;
  }

  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/executor/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        password,
        confirm_password: confirmPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Executor registration failed', 'error');
      button.disabled = false;
      return;
    }

    showMessage('Executor registration completed. You can now log in once access is granted.', 'success');
    setTimeout(() => {
      window.location.href = 'executor-login.html';
    }, 1500);
  } catch (error) {
    console.error('Executor registration error:', error);
    showMessage('Network error. Please try again.', 'error');
    button.disabled = false;
  }
});
