import { showToast } from './utils';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

// Helper for API requests
const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const url = `${API_URL}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle unauthenticated or expired token
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }

        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('API Error:', text);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        if (!response.ok) {
            const msg = data.message || 'Something went wrong';
            showToast(msg, 'error');
            throw new Error(msg);
        }

        return data;
    } catch (err) {
        console.error('API Error:', err.message);
        if (err.message.includes('Failed to fetch')) {
            showToast('Network Error: Unable to connect to server.', 'error');
        }
        throw err;
    }
};

export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
