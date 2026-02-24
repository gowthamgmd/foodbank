import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: '📦', title: 'Smart Inventory', desc: 'Track food items with real-time expiry alerts and quality status.' },
    { icon: '🤝', title: 'Donor Matching', desc: 'AI-powered matching connects donations to the right beneficiaries.' },
    { icon: '📊', title: 'Demand Forecasting', desc: 'Predict food demand using historical data to reduce waste.' },
    { icon: '🔍', title: 'Quality Assessment', desc: 'Upload food images for AI-based freshness classification.' },
    { icon: '🌱', title: 'Zero Waste Goal', desc: 'Minimize spoilage with proactive expiry management.' },
    { icon: '💬', title: 'Feedback Loop', desc: 'Sentiment analysis on beneficiary feedback to improve service.' },
];

const stats = [
    { value: '12,000+', label: 'Meals Distributed' },
    { value: '340+', label: 'Active Donors' },
    { value: '1,800+', label: 'Beneficiaries' },
    { value: '8%', label: 'Food Waste Rate' },
];

export default function HomePage() {
    const { isAuthenticated, role } = useAuth();

    const dashboardPath =
        role === 'ADMIN' ? '/admin/dashboard' :
            role === 'DONOR' ? '/donor/dashboard' :
                role === 'BENEFICIARY' ? '/beneficiary/dashboard' : '/login';

    return (
        <div className="flex flex-col">

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-green-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                        🌿 Powered by AI • Built for communities
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
                        Smart Food Bank
                        <span className="block text-accent-light">Management System</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto mb-10">
                        Intelligently connecting donors, food resources, and beneficiaries — reducing waste while maximizing community impact.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <Link to={dashboardPath} className="btn-primary bg-white !text-primary-700 hover:bg-green-50 border-0 text-base px-8 py-3">
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary bg-white !text-primary-700 hover:bg-green-50 border-0 text-base px-8 py-3">
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn-secondary border-white/30 !text-white hover:bg-white/10 text-base px-8 py-3">
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                        {stats.map((s) => (
                            <div key={s.label}>
                                <div className="text-3xl font-extrabold text-primary-700">{s.value}</div>
                                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Everything you need to run a modern food bank</h2>
                    <p className="text-gray-500 mt-3 max-w-xl mx-auto">From donation intake to beneficiary delivery — managed intelligently in one platform.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="card-hover p-6">
                            <div className="text-4xl mb-3">{f.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
                            <p className="text-gray-500 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary-50 border-t border-primary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-primary-900 mb-4">Ready to make a difference?</h2>
                    <p className="text-primary-700 mb-8">Join our community of donors and volunteers helping families in need.</p>
                    {!isAuthenticated && (
                        <Link to="/register" className="btn-primary text-base px-10 py-3">
                            Register Today →
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Smart Food Bank. Built with ♥ for communities.
            </footer>
        </div>
    );
}
