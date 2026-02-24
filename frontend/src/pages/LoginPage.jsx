import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Mock users for offline demo mode ─────────────────────────
const MOCK_USERS = {
    'admin@foodbank.com': {
        id: 1, name: 'Admin User', email: 'admin@foodbank.com',
        role: 'ADMIN', password: 'admin123',
    },
    'donor@foodbank.com': {
        id: 2, organizationName: 'FreshMart Superstore', contactPerson: 'Ramesh Kumar',
        email: 'donor@foodbank.com', role: 'DONOR', password: 'donor123',
    },
    'ben@foodbank.com': {
        id: 3, name: 'Priya Kumar', email: 'ben@foodbank.com',
        role: 'BENEFICIARY', familySize: 4, password: 'ben123',
    },
};

export default function LoginPage() {
    const { login, mockLogin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name || user.organizationName || user.contactPerson}!`);
            const paths = { ADMIN: '/admin/dashboard', DONOR: '/donor/dashboard', BENEFICIARY: '/beneficiary/dashboard' };
            navigate(paths[user.role] ?? '/', { replace: true });
        } catch (err) {
            // ── Demo / offline fallback ──────────────────────
            const mock = MOCK_USERS[form.email];
            if (mock && mock.password === form.password) {
                const { password: _, ...userData } = mock;
                const fakeToken = 'demo_token_' + userData.role;
                localStorage.setItem('fb_token', fakeToken);
                localStorage.setItem('fb_user', JSON.stringify(userData));
                mockLogin(userData, fakeToken);

                toast.success(`Welcome back, ${userData.name || userData.organizationName}! (Demo mode)`);
                const paths = { ADMIN: '/admin/dashboard', DONOR: '/donor/dashboard', BENEFICIARY: '/beneficiary/dashboard' };
                navigate(paths[userData.role] ?? '/', { replace: true });
            } else {
                setError(extractErrorMessage(err) || 'Invalid email or password.');
            }
        } finally {
            setLoading(false);
        }
    }

    function fillDemo(email, password) {
        setForm({ email, password });
        setError('');
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-3">🌿</div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your Smart Food Bank account</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="label" htmlFor="email">Email address</label>
                            <input
                                id="email" name="email" type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="password">Password</label>
                            <input
                                id="password" name="password" type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Demo credentials */}
                <div className="mt-4 card p-4 bg-amber-50 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-800 mb-2">🧪 Demo Credentials (works offline)</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Admin', email: 'admin@foodbank.com', pass: 'admin123' },
                            { label: 'Donor', email: 'donor@foodbank.com', pass: 'donor123' },
                            { label: 'Beneficiary', email: 'ben@foodbank.com', pass: 'ben123' },
                        ].map((d) => (
                            <button
                                key={d.label}
                                type="button"
                                onClick={() => fillDemo(d.email, d.pass)}
                                className="text-xs py-1.5 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition-colors"
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-amber-700 mt-2 text-center">
                        Backend offline? Demo mode will still log you in ✓
                    </p>
                </div>
            </div>
        </div>
    );
}
