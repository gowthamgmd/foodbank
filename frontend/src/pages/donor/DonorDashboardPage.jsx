import { useState, useEffect, useCallback } from 'react';
import { donationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime, STATUS_COLORS, isFutureDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['Grains', 'Dairy', 'Proteins', 'Vegetables', 'Fruits', 'Beverages', 'Canned Goods', 'Bakery', 'Other'];
const TIME_SLOTS = ['09:00 – 11:00', '11:00 – 13:00', '14:00 – 16:00', '16:00 – 18:00'];
const EMPTY_FORM = { itemName: '', category: 'Grains', quantity: '', expiryDate: '', pickupAddress: '', pickupTimeSlot: TIME_SLOTS[0] };

export default function DonorDashboardPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('donate');
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await donationApi.getMyDonations();
            setDonations(data ?? []);
        } catch {
            setDonations([
                { id: 1, items: [{ name: 'Rice', category: 'Grains', quantity: 25 }], pickupAddress: 'MG Road', pickupTimeSlot: '09:00 – 11:00', status: 'RECEIVED', createdAt: '2026-02-10' },
                { id: 2, items: [{ name: 'Lentils', category: 'Proteins', quantity: 10 }], pickupAddress: 'MG Road', pickupTimeSlot: '14:00 – 16:00', status: 'PICKED', createdAt: '2026-02-15' },
            ]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.itemName || !form.quantity || !form.expiryDate || !form.pickupAddress) {
            toast.error('Please fill all required fields.'); return;
        }
        if (!isFutureDate(form.expiryDate)) {
            toast.error('Expiry date must be in the future.'); return;
        }
        setSubmitting(true);
        try {
            await donationApi.create({ ...form, items: [{ name: form.itemName, category: form.category, quantity: Number(form.quantity) }] });
            toast.success('🎉 Donation scheduled successfully! Thank you!');
            setForm(EMPTY_FORM);
            setTab('history');
            load();
        } catch {
            toast.error('Failed to schedule donation');
        } finally { setSubmitting(false); }
    }

    const receivedCount = donations.filter((d) => d.status === 'RECEIVED').length;
    const mealsProvided = receivedCount * 15; // ~15 meals per donation (approx)

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🤝 Donor Dashboard</h1>
                <span className="text-sm text-gray-500">Welcome, {user?.organizationName || user?.name}</span>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 mb-6 w-fit">
                {[['donate', '📦 Schedule Donation'], ['history', '📋 My Donations'], ['impact', '🌟 Impact Report']].map(([k, label]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === k ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Donate Tab ──────────────────────────────────────────── */}
            {tab === 'donate' && (
                <div className="max-w-xl">
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 mb-5">Schedule a Pickup</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Item Name *</label>
                                    <input name="itemName" className="input-field" placeholder="e.g., Rice" value={form.itemName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Category</label>
                                    <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Quantity (kg) *</label>
                                    <input name="quantity" type="number" min="0.5" step="0.5" className="input-field" value={form.quantity} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Expiry Date *</label>
                                    <input name="expiryDate" type="date" className="input-field" value={form.expiryDate} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Pickup Address *</label>
                                <input name="pickupAddress" className="input-field" placeholder="Full pickup address" value={form.pickupAddress} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Preferred Pickup Time Slot</label>
                                <select name="pickupTimeSlot" className="input-field" value={form.pickupTimeSlot} onChange={handleChange}>
                                    {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Optional Photo</label>
                                <input type="file" accept="image/*" className="input-field text-sm py-2" onChange={(e) => setImageFile(e.target.files[0])} />
                            </div>
                            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                                {submitting ? 'Scheduling…' : '🚚 Schedule Pickup'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── History Tab ──────────────────────────────────────────── */}
            {tab === 'history' && (
                donations.length === 0 ? (
                    <div className="card p-12 text-center text-gray-400">
                        <div className="text-5xl mb-3">📭</div>
                        <p>No donations yet. <button onClick={() => setTab('donate')} className="text-primary-600 hover:underline">Schedule your first pickup →</button></p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Items</th><th>Pickup Address</th><th>Time Slot</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {donations.map((d) => {
                                    const s = STATUS_COLORS[d.status] ?? STATUS_COLORS.PENDING;
                                    const items = Array.isArray(d.items) ? d.items : [];
                                    return (
                                        <tr key={d.id}>
                                            <td className="font-medium">{items.map((i) => `${i.name} ${i.quantity}kg`).join(', ') || '—'}</td>
                                            <td className="text-sm text-gray-500">{d.pickupAddress}</td>
                                            <td className="text-sm">{d.pickupTimeSlot}</td>
                                            <td><span className={`badge ${s.bg} ${s.text}`}>{s.label}</span></td>
                                            <td className="text-sm text-gray-400">{formatDate(d.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ── Impact Tab ───────────────────────────────────────────── */}
            {tab === 'impact' && (
                <div className="max-w-2xl space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="card p-5 text-center bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                            <div className="text-4xl font-extrabold text-primary-600">{mealsProvided}</div>
                            <div className="text-sm text-green-700 mt-1 font-medium">Meals Provided</div>
                        </div>
                        <div className="card p-5 text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            <div className="text-4xl font-extrabold text-blue-600">{donations.length}</div>
                            <div className="text-sm text-blue-700 mt-1 font-medium">Total Donations</div>
                        </div>
                        <div className="card p-5 text-center bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                            <div className="text-4xl font-extrabold text-amber-600">
                                {donations.reduce((s, d) => s + ((d.items ?? []).reduce((a, i) => a + Number(i.quantity ?? 0), 0)), 0)} kg
                            </div>
                            <div className="text-sm text-amber-700 mt-1 font-medium">Food Donated</div>
                        </div>
                    </div>
                    <div className="card p-6 text-center bg-primary-50 border border-primary-100">
                        <div className="text-4xl mb-3">💚</div>
                        <h3 className="text-xl font-bold text-primary-800">Thank you for making a difference!</h3>
                        <p className="text-primary-600 text-sm mt-2">Your contributions have helped families in need across the community.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
