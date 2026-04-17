// API configuration - works on both localhost and production
const API_BASE_URL = 'https://digipass-3l63.onrender.com/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('dashboardBtn').style.display = 'inline';
        document.getElementById('dashboardBtn').href = 'dashboard.html';
        document.getElementById('logoutBtn').style.display = 'inline';
    } else {
        document.getElementById('loginBtn').style.display = 'inline';
        document.getElementById('registerBtn').style.display = 'inline';
        document.getElementById('dashboardBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuth();
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.form-container') || document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 4000);
    }
}

// Call API
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Add logout button listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
