import axios from 'axios';

// In production (Vercel), use same-origin /api and let rewrites forward to backend.
// In development, use VITE_API_URL if provided, otherwise localhost backend.
const API_BASE_URL = import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_URL || 'http://localhost:8080');

// Pure axios instance — no side effects at module level
const api = axios.create({
    baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token from localStorage lazily (on each request)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fb_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fb_token');
            localStorage.removeItem('fb_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (role, data) => api.post(`/auth/register/${role}`, data),
};

// ─── Inventory ───────────────────────────────────────────────
export const inventoryApi = {
    getAll: () => api.get('/inventory'),
    getExpiring: () => api.get('/inventory/expiring'),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    remove: (id) => api.delete(`/inventory/${id}`),
    uploadImage: (formData) => api.post('/inventory/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Donations ───────────────────────────────────────────────
export const donationApi = {
    getMyDonations: () => api.get('/donations'),
    getAll: () => api.get('/donations/all'),
    getAvailable: () => api.get('/donations/available'),
    getById: (id) => api.get(`/donations/${id}`),
    create: (data) => api.post('/donations', data),
    updateStatus: (id, status) => api.patch(`/donations/${id}/status`, { status }),
    uploadImage: (formData) => api.post('/donations/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    aiAssess: (id, assessment) => api.post(`/donations/${id}/ai-assess`, { assessment }),
};

// ─── Beneficiaries ───────────────────────────────────────────
export const beneficiaryApi = {
    getAll: () => api.get('/beneficiaries'),
    getById: (id) => api.get(`/beneficiaries/${id}`),
    getRecommendations: (id) => api.get(`/beneficiaries/${id}/recommendations`),
};

// ─── Parcels ─────────────────────────────────────────────────
export const parcelApi = {
    create: (data) => api.post('/parcels', data),
    getMyParcels: (id) => api.get(`/parcels/beneficiary/${id}`),
    getAll: () => api.get('/parcels'),
};

// ─── Feedback ────────────────────────────────────────────────
export const feedbackApi = {
    submit: (data) => api.post('/feedback', data),
};

// ─── Users / Profile ─────────────────────────────────────────
export const userApi = {
    updateProfile: (data) => api.put('/users/profile', data),
    getDonors: () => api.get('/users/donors'),
    getBeneficiaries: () => api.get('/users/beneficiaries'),
};

// ─── Pickups ─────────────────────────────────────────────────
export const pickupApi = {
    getAll: () => api.get('/pickups'),
    getById: (id) => api.get(`/pickups/${id}`),
    create: (data) => api.post('/pickups', data),
    update: (id, data) => api.patch(`/pickups/${id}`, data),
    updateStatus: (id, status) => api.patch(`/pickups/${id}/status`, { status }),
    remove: (id) => api.delete(`/pickups/${id}`),
};

// ─── AI Module ───────────────────────────────────────────────
export const aiApi = {
    forecast: (data) => api.post('/ai/forecast', data),
    assessImage: (formData) => api.post('/ai/assess-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    demandForecast: () => api.get('/ai/demand-forecast'),
};

// ─── Food Requests ───────────────────────────────────────────
export const foodRequestApi = {
    create: (data) => api.post('/food-requests', data),
    getAll: () => api.get('/food-requests'),
    getById: (id) => api.get(`/food-requests/${id}`),
    updateStatus: (id, status) => api.patch(`/food-requests/${id}/status`, { status }),
    delete: (id) => api.delete(`/food-requests/${id}`),
};

export default api;
