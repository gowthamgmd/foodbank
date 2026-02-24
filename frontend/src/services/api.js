import axios from 'axios';

// Pure axios instance — no side effects at module level
const api = axios.create({
    baseURL: '/api',
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
    create: (data) => api.post('/donations', data),
    updateStatus: (id, status) => api.patch(`/donations/${id}/status`, { status }),
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
    getSentimentAll: () => api.get('/feedback/sentiment'),
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
    updateStatus: (id, status) => api.patch(`/pickups/${id}/status`, { status }),
};

// ─── AI Module ───────────────────────────────────────────────
export const aiApi = {
    forecast: (data) => api.post('/ai/forecast', data),
    assessImage: (formData) => api.post('/ai/assess-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    matchDonations: () => api.get('/ai/match-donations'),
    analyzeSentiment: () => api.get('/ai/sentiment'),
};

export default api;
