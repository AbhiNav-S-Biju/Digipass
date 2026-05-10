const API_URL = 'https://digipass-3l63.onrender.com/api';

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
    const response = await fetch(`${API_URL}/executor/login`, {
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

    console.log('[Executor Login] Login response:', {
      status: response.status,
      success: data.success,
      has_data: !!data.data,
      has_token: !!data.data?.token,
      token_type: typeof data.data?.token,
      token_value: data.data?.token,
      has_executor: !!data.data?.executor,
      full_response: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('[Executor Login] Response not OK:', data);
      showMessage(data.message || 'Executor login failed', 'error');
      button.disabled = false;
      return;
    }

    if (!data.data || !data.data.token) {
      console.error('[Executor Login] Token missing from response:', {
        data_exists: !!data.data,
        token: data.data?.token,
        executor: data.data?.executor
      });
      showMessage('Login failed: No token received from server', 'error');
      button.disabled = false;
      return;
    }

    sessionStorage.setItem('executorToken', data.data.token);
    sessionStorage.setItem('executor', JSON.stringify(data.data.executor));
    
    console.log('[Executor Login] Stored in sessionStorage:',  {
      token: sessionStorage.getItem('executorToken'),
      executor: sessionStorage.getItem('executor')
    });

    showMessage('Executor access granted. Redirecting...', 'success');
    
    // Give user time to see logs before redirect
    setTimeout(() => {
      console.log('[Executor Login] Redirecting to dashboard');
      window.location.href = 'executor-dashboard.html';
    }, 3000);
  } catch (error) {
    console.error('Executor login error:', error);
    showMessage('Network error. Please try again.', 'error');
    button.disabled = false;
  }
});
