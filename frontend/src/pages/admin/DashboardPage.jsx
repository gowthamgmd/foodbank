import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import ExpiryBadge from '../../components/ExpiryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { inventoryApi, beneficiaryApi, donationApi, foodRequestApi } from '../../services/api';
import { formatDate, formatKg, formatFoodAge, QUALITY_COLORS, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer,
} from 'recharts';

// ── Mock demand forecast data ─────────────────────────────────
const DEMO_FORECAST = [
    { day: 'Mon', actual: 120, predicted: 115 },
    { day: 'Tue', actual: 98, predicted: 105 },
    { day: 'Wed', actual: 140, predicted: 132 },
    { day: 'Thu', actual: 155, predicted: 148 },
    { day: 'Fri', actual: 170, predicted: 168 },
    { day: 'Sat', actual: 200, predicted: 195 },
    { day: 'Sun', actual: null, predicted: 182 },
];

// ── Mock matching suggestions ─────────────────────────────────
const DEMO_MATCHES = [
    { id: 1, donation: 'Rice 30kg – FreshMart', beneficiary: 'Kumar Family (4)', score: 94, dietary: 'Vegetarian' },
    { id: 2, donation: 'Lentils 20kg – ABC Corp', beneficiary: 'Ali Household (6)', score: 88, dietary: 'Halal' },
    { id: 3, donation: 'Bread 50 loaves – Bakery', beneficiary: 'Sharma Family (3)', score: 76, dietary: 'None' },
];

export default function AdminDashboardPage() {
    const [inventory, setInventory] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [foodRequests, setFoodRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            inventoryApi.getAll(), 
            inventoryApi.getExpiring(),
            foodRequestApi.getAll()
        ])
            .then(([invRes, expRes, reqRes]) => {
                setInventory(invRes.data ?? []);
                setExpiring(expRes.data ?? []);
                setFoodRequests(reqRes.data ?? []);
            })
            .catch(() => {
                // Use demo data when backend not available
                setInventory([]);
                setExpiring([]);
                setFoodRequests([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner fullScreen />;

    const totalKg = inventory.reduce((s, i) => s + (i.quantity ?? 0), 0);
    const donors = new Set(inventory.map((i) => i.donorId)).size;
    const bens = 0; // would come from API
    const wastePct = 8;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <span className="text-sm text-gray-400">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Inventory" value={formatKg(totalKg || 2400)} icon="📦" color="green" trend={12} />
                <StatCard title="Active Donors" value={donors || 32} icon="🤝" color="blue" trend={5} />
                <StatCard title="Beneficiaries" value={bens || 148} icon="👨‍👩‍👧‍👦" color="purple" />
                <StatCard title="Food Waste" value={`${wastePct}%`} icon="♻️" color="amber" trend={-3} subtitle="↓ improving" />
            </div>

            {/* Expiry Alerts */}
            {expiring.length > 0 && (
                <div className="card p-5 mb-6 border-l-4 border-red-400 bg-red-50">
                    <h2 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        ⚠️ Expiring Soon ({expiring.length} items)
                    </h2>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Item</th><th>Category</th><th>Qty</th><th>Expiry</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {expiring.slice(0, 5).map((item) => (
                                    <tr key={item.id} className="bg-red-50/50">
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.category}</td>
                                        <td>{formatKg(item.quantity)}</td>
                                        <td>{formatDate(item.expiryDate)}</td>
                                        <td><ExpiryBadge expiryDate={item.expiryDate} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Food Requests from Beneficiaries */}
            {foodRequests.length > 0 && (
                <div className="card p-5 mb-6 border-l-4 border-primary-400 bg-primary-50">
                    <h2 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                        📝 Food Requests from Organizations ({foodRequests.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {foodRequests.slice(0, 6).map((req) => (
                            <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {req.beneficiary?.organizationName || req.beneficiary?.name || 'Organization'}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(req.createdAt)}</p>
                                    </div>
                                    <span className={`badge text-xs ${
                                        req.urgencyLevel === 'HIGH' ? 'badge-red' :
                                        req.urgencyLevel === 'MEDIUM' ? 'badge-yellow' :
                                        'badge-blue'
                                    }`}>
                                        {req.urgencyLevel}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    <div className="flex justify-between">
                                        <span>Quantity:</span>
                                        <strong>{req.quantityRequired} kg</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Members:</span>
                                        <strong>{req.totalMembers}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className={`badge text-xs ${
                                            req.status === 'FULFILLED' ? 'badge-green' :
                                            req.status === 'PENDING' ? 'badge-yellow' :
                                            'badge-blue'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                {req.preferredFoodCategories && req.preferredFoodCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {req.preferredFoodCategories.slice(0, 3).map((cat, idx) => (
                                            <span key={idx} className="badge badge-blue text-xs">{cat}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Demand Forecast Chart */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">📈 Demand Forecast (7 days)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={DEMO_FORECAST}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="actual" name="Actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Matching Suggestions */}
                <div className="card p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">🤖 AI Matching Suggestions</h2>
                    <div className="space-y-3">
                        {DEMO_MATCHES.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{m.donation}</p>
                                    <p className="text-xs text-gray-500">→ {m.beneficiary} · {m.dietary}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                    <span className={`badge ${m.score >= 90 ? 'badge-green' : m.score >= 75 ? 'badge-yellow' : 'badge-red'}`}>
                                        {m.score}%
                                    </span>
                                    <button
                                        className="btn-primary text-xs py-1 px-3"
                                        onClick={() => toast.success(`Assigned: ${m.donation}`)}
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Inventory */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">📦 Recent Inventory</h2>
                    <a href="/admin/inventory" className="text-sm text-primary-600 hover:underline">View all →</a>
                </div>
                {inventory.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <div className="text-4xl mb-2">📭</div>
                        <p>No inventory items yet. <a href="/admin/inventory" className="text-primary-600 hover:underline">Add items →</a></p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Name</th><th>Category</th><th>Quantity</th><th>Food Ready (Hours Ago)</th><th>Quality</th></tr>
                            </thead>
                            <tbody>
                                {inventory.slice(0, 8).map((item) => {
                                    const q = QUALITY_COLORS[item.qualityStatus] ?? QUALITY_COLORS.FRESH;
                                    return (
                                        <tr key={item.id}>
                                            <td className="font-medium">{item.name}</td>
                                            <td>{item.category}</td>
                                            <td>{formatKg(item.quantity)}</td>
                                            <td>{formatFoodAge(item.foodPreparedTime)}</td>
                                            <td>
                                                <span className={`badge ${q.bg} ${q.text}`}>{q.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
