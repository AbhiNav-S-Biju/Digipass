// Utility functions for protected pages

const API_URL = (window.DIGIPASS_API_ORIGIN || '') + '/api';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Check if user is authenticated
function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Make API call with authentication
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = getToken();
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    // Error pages from a proxy / cold-starting host are often HTML, not JSON.
    // Parse defensively so the real status is handled instead of a parse error.
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        logout();
      }
      if (response.status === 429) {
        throw new Error(data.message || 'Too many requests. Please wait a moment and try again.');
      }
      throw new Error(data.message || `API Error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Logout user
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Get user data from localStorage
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}
