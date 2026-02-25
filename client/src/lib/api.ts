import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// ─── Build base URL ─────────────────────────────────────────────────────────
let baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

// ─── Validate at startup ─────────────────────────────────────────────────────
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
    console.warn('[API] NEXT_PUBLIC_API_URL is not set — falling back to /api (local dev only)');
}

// ─── Axios instance ──────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 90000, // 90s — enough for Render free tier cold start
});

// ─── Attach auth token ────────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor — auto-logout on 401 ───────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                localStorage.removeItem('token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Retry with exponential backoff ──────────────────────────────────────────
// Retries on network errors or 5xx server errors (not 4xx — those are user errors)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    baseDelay = 3000
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            const isNetworkError = !err.response;
            const isServerError = err.response?.status >= 500;
            const isLastAttempt = attempt === retries;

            if (isLastAttempt || (!isNetworkError && !isServerError)) {
                throw err;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1); // 3s, 6s, 12s
            console.warn(`[API] Attempt ${attempt}/${retries} failed. Retrying in ${delay / 1000}s...`);
            await sleep(delay);
        }
    }
    throw new Error('Max retries exceeded');
}

// ─── Health check helper ─────────────────────────────────────────────────────
export async function checkServerHealth(): Promise<boolean> {
    try {
        await api.get('/health', { timeout: 10000 });
        return true;
    } catch {
        return false;
    }
}

export default api;
