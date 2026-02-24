import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const NAV_LINKS = {
    ADMIN: [
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Inventory', to: '/admin/inventory' },
        { label: 'Donors', to: '/admin/donors' },
        { label: 'Beneficiaries', to: '/admin/beneficiaries' },
        { label: 'Pickups', to: '/admin/pickups' },
        { label: '🤖 AI Module', to: '/admin/ai' },
    ],
    DONOR: [
        { label: 'Dashboard', to: '/donor/dashboard' },
    ],
    BENEFICIARY: [
        { label: 'Dashboard', to: '/beneficiary/dashboard' },
    ],
};

export default function Navbar() {
    const { isAuthenticated, user, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const links = role ? (NAV_LINKS[role] ?? []) : [];

    function handleLogout() {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
        setOpen(false);
    }

    function isActive(to) {
        return location.pathname.startsWith(to);
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-primary-700 hover:text-primary-800 transition-colors">
                        <span className="text-2xl">🌿</span>
                        <span className="hidden sm:block">Smart Food Bank</span>
                    </Link>

                    {/* Desktop nav links */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center gap-1">
                            {links.map((l) => (
                                <Link
                                    key={l.to}
                                    to={l.to}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive(l.to)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Avatar + Name */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                        {getInitials(user?.name || user?.organizationName || 'U')}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                        {user?.name || user?.organizationName}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            onClick={() => setOpen((o) => !o)}
                            aria-label="Toggle menu"
                        >
                            {open ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {isAuthenticated && links.map((l) => (
                        <Link
                            key={l.to}
                            to={l.to}
                            onClick={() => setOpen(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(l.to)
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {l.label}
                        </Link>
                    ))}
                    {!isAuthenticated && (
                        <>
                            <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Log In</Link>
                            <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
