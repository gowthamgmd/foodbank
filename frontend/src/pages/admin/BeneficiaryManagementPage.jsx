import { useState, useEffect, useCallback } from 'react';
import { userApi, parcelApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DEMO_BENS = [
    { id: 1, name: 'Priya Kumar', email: 'priya@email.com', familySize: 4, dietaryRestrictions: ['Vegetarian'], address: 'Koramangala, Bengaluru', phone: '9876543210', createdAt: '2024-01-20' },
    { id: 2, name: 'Mohammed Ali', email: 'ali@email.com', familySize: 6, dietaryRestrictions: ['Halal'], address: 'Shivajinagar, Bengaluru', phone: '9123456789', createdAt: '2024-02-05' },
    { id: 3, name: 'Geeta Sharma', email: 'geeta@email.com', familySize: 3, dietaryRestrictions: ['Diabetic', 'Gluten-Free'], address: 'Jayanagar, Bengaluru', phone: '9900112233', createdAt: '2024-02-10' },
];

export default function BeneficiaryManagementPage() {
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await userApi.getBeneficiaries();
            setBens(data ?? []);
        } catch {
            setBens(DEMO_BENS);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = bens.filter((b) =>
        (b.name + b.email).toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">👨‍👩‍👧‍👦 Beneficiary Management</h1>
            </div>

            <input
                type="text" className="input-field max-w-sm mb-6"
                placeholder="🔍 Search beneficiaries…"
                value={search} onChange={(e) => setSearch(e.target.value)}
            />

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Family Size</th><th>Dietary Needs</th><th>Address</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map((b) => (
                            <tr key={b.id}>
                                <td className="font-medium">{b.name}</td>
                                <td className="text-gray-500 text-xs">{b.email}</td>
                                <td className="text-center">{b.familySize} 👥</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {(b.dietaryRestrictions ?? []).map((d) => (
                                            <span key={d} className="badge badge-yellow text-xs">{d}</span>
                                        ))}
                                        {(!b.dietaryRestrictions || b.dietaryRestrictions.length === 0) && (
                                            <span className="text-gray-400 text-xs">None</span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-sm text-gray-500 max-w-[150px] truncate">{b.address}</td>
                                <td className="text-sm text-gray-400">{formatDate(b.createdAt)}</td>
                                <td>
                                    <button
                                        onClick={() => setSelected(b)}
                                        className="btn-ghost text-xs py-1 px-2"
                                    >
                                        📋 Parcel History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Parcel History Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-backdrop">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900">Parcel History — {selected.name}</h2>
                                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                            <div className="mb-4 p-4 bg-primary-50 rounded-xl text-sm space-y-1">
                                <p><span className="font-medium">Family Size:</span> {selected.familySize}</p>
                                <p><span className="font-medium">Dietary:</span> {(selected.dietaryRestrictions ?? []).join(', ') || 'None'}</p>
                                <p><span className="font-medium">Phone:</span> {selected.phone}</p>
                                <p><span className="font-medium">Address:</span> {selected.address}</p>
                            </div>
                            <div className="text-center py-8 text-gray-400">
                                <div className="text-4xl mb-2">📦</div>
                                <p className="text-sm">Parcel history will be shown here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
