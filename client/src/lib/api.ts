import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30s timeout to prevent hanging requests
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Auto-logout on 401
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
