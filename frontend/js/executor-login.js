const API_URL = 'https://digipass-production.up.railway.app/api';

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `show ${type}`;

  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 4000);
}

document.getElementById('executorLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const executorEmail = document.getElementById('executorEmail').value.trim();
  const executorPassword = document.getElementById('executorPassword').value;
  const button = document.querySelector('.btn-primary');

  if (!executorEmail || !executorPassword) {
    showMessage('Executor email and password are required.', 'error');
    return;
  }

  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/executors/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        executor_email: executorEmail,
        password: executorPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Executor login failed', 'error');
      button.disabled = false;
      return;
    }

    localStorage.setItem('executorToken', data.data.token);
    localStorage.setItem('executorProfile', JSON.stringify(data.data.executor));

    showMessage('Executor access granted. Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'executor-dashboard.html';
    }, 1200);
  } catch (error) {
    console.error('Executor login error:', error);
    showMessage('Network error. Please try again.', 'error');
    button.disabled = false;
  }
});
