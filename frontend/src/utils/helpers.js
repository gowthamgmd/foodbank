// ─── Date helpers ─────────────────────────────────────────────
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function daysUntilExpiry(expiryDate) {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
}

export function isExpiringSoon(expiryDate, thresholdDays = 3) {
    return daysUntilExpiry(expiryDate) <= thresholdDays;
}

export function isExpired(expiryDate) {
    return daysUntilExpiry(expiryDate) < 0;
}

// ─── String helpers ───────────────────────────────────────────
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (w) =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
}

// ─── Number helpers ───────────────────────────────────────────
export function formatKg(n) {
    if (n === null || n === undefined) return '—';
    return n >= 1000 ? `${(n / 1000).toFixed(1)} t` : `${n} kg`;
}

export function formatNumber(n) {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en-IN').format(n);
}

// ─── Quality status helpers ───────────────────────────────────
export const QUALITY_COLORS = {
    FRESH: { text: 'text-green-700', bg: 'bg-green-100', label: 'Fresh' },
    PARTIAL: { text: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Partially Spoiled' },
    SPOILED: { text: 'text-red-700', bg: 'bg-red-100', label: 'Spoiled' },
};

export const STATUS_COLORS = {
    PENDING: { text: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Pending' },
    PICKED: { text: 'text-blue-700', bg: 'bg-blue-100', label: 'Picked Up' },
    RECEIVED: { text: 'text-green-700', bg: 'bg-green-100', label: 'Received' },
    DISTRIBUTED: { text: 'text-purple-700', bg: 'bg-purple-100', label: 'Distributed' },
    RESCHEDULED: { text: 'text-gray-600', bg: 'bg-gray-100', label: 'Rescheduled' },
};

export const SENTIMENT_COLORS = {
    POSITIVE: { text: 'text-green-700', bg: 'bg-green-100', label: 'Positive' },
    NEUTRAL: { text: 'text-gray-600', bg: 'bg-gray-100', label: 'Neutral' },
    NEGATIVE: { text: 'text-red-700', bg: 'bg-red-100', label: 'Negative' },
};

// ─── Form validation ─────────────────────────────────────────
export function isFutureDate(dateStr) {
    return new Date(dateStr) > new Date();
}

export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// ─── Misc ─────────────────────────────────────────────────────
export function getInitials(name = '') {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function extractErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong'
    );
}
