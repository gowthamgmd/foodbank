import { useState, useEffect, useCallback } from 'react';
import { userApi, donationApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DonorManagementPage() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null); // donor for history modal

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await userApi.getDonors();
            setDonors(data ?? []);
        } catch {
            // Demo data
            setDonors([
                { id: 1, organizationName: 'FreshMart Superstore', contactPerson: 'Ramesh K', email: 'fresh@mart.com', phone: '9876543210', address: 'MG Road, Bengaluru', createdAt: '2024-01-15' },
                { id: 2, organizationName: 'ABC Corporation', contactPerson: 'Priya M', email: 'priya@abc.com', phone: '9123456789', address: 'HSR Layout, Bengaluru', createdAt: '2024-02-01' },
                { id: 3, organizationName: 'City Bakery', contactPerson: 'Ahmed S', email: 'ahmed@bakery.com', phone: '9988776655', address: 'Jayanagar, Bengaluru', createdAt: '2024-02-20' },
            ]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = donors.filter((d) =>
        (d.organizationName + d.contactPerson + d.email).toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🤝 Donor Management</h1>
            </div>

            <input
                type="text" className="input-field max-w-sm mb-6"
                placeholder="🔍 Search donors…"
                value={search} onChange={(e) => setSearch(e.target.value)}
            />

            {filtered.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">🤝</div>
                    <p>No donors found.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((d) => (
                        <div key={d.id} className="card-hover p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
                                    {(d.organizationName?.[0] ?? 'D').toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{d.organizationName}</p>
                                    <p className="text-sm text-gray-500 truncate">{d.contactPerson}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{d.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-1.5"><span>📞</span>{d.phone ?? '—'}</div>
                                <div className="flex items-center gap-1.5"><span>📍</span><span className="truncate">{d.address ?? '—'}</span></div>
                                <div className="flex items-center gap-1.5"><span>📅</span>Joined {formatDate(d.createdAt)}</div>
                            </div>
                            <button
                                onClick={() => setSelected(d)}
                                className="btn-secondary w-full mt-4 text-sm"
                            >
                                View Donation History
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Donation History Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-backdrop">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-gray-900">Donation History — {selected.organizationName}</h2>
                                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                            <div className="text-center py-10 text-gray-400">
                                <div className="text-4xl mb-2">📋</div>
                                <p className="text-sm">Donation history will appear here once donations are recorded.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
