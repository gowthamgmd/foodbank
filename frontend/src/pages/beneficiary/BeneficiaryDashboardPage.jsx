import { useState, useEffect, useCallback } from 'react';
import { beneficiaryApi, parcelApi, feedbackApi, userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FeedbackStars from '../../components/FeedbackStars';
import { formatDate, extractErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DIETARY_OPTIONS = ['Diabetic', 'Gluten-Free', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Nut-Free', 'Lactose-Free'];

const DEMO_PARCELS = [
    { id: 1, createdAt: '2026-02-15', items: [{ name: 'Rice', quantity: 5 }, { name: 'Lentils', quantity: 2 }], feedbackGiven: false },
    { id: 2, createdAt: '2026-02-01', items: [{ name: 'Vegetables', quantity: 3 }, { name: 'Bread', quantity: 2 }], feedbackGiven: true },
];

const DEMO_RECS = [
    { id: 1, name: 'Rice', category: 'Grains', quantity: 15, expiryDate: '2026-03-10', qualityStatus: 'FRESH' },
    { id: 2, name: 'Milk', category: 'Dairy', quantity: 8, expiryDate: '2026-02-25', qualityStatus: 'FRESH' },
    { id: 3, name: 'Bread', category: 'Bakery', quantity: 10, expiryDate: '2026-02-22', qualityStatus: 'PARTIAL' },
];

export default function BeneficiaryDashboardPage() {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('parcels');
    const [recs, setRecs] = useState([]);
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);

    // Feedback
    const [fbParcel, setFbParcel] = useState(null);
    const [fbRating, setFbRating] = useState(0);
    const [fbComment, setFbComment] = useState('');
    const [fbLoading, setFbLoading] = useState(false);

    // Profile
    const [profileForm, setProfileForm] = useState({
        familySize: user?.familySize ?? 1,
        dietaryRestrictions: user?.dietaryRestrictions ?? [],
        address: user?.address ?? '',
        phone: user?.phone ?? '',
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [recRes, parcelRes] = await Promise.all([
                beneficiaryApi.getRecommendations(user?.id),
                parcelApi.getMyParcels(user?.id),
            ]);
            setRecs(recRes.data ?? []);
            setParcels(parcelRes.data ?? []);
        } catch {
            setRecs(DEMO_RECS);
            setParcels(DEMO_PARCELS);
        } finally { setLoading(false); }
    }, [user?.id]);

    useEffect(() => { load(); }, [load]);

    async function requestParcel(item) {
        setRequesting(item.id);
        try {
            await parcelApi.create({ beneficiaryId: user?.id, items: [{ name: item.name, quantity: item.quantity }] });
            toast.success(`✅ Parcel requested for ${item.name}!`);
            load();
        } catch {
            toast.error('Failed to request parcel');
        } finally { setRequesting(null); }
    }

    async function submitFeedback(parcelId) {
        if (!fbRating) { toast.error('Please select a rating.'); return; }
        setFbLoading(true);
        try {
            await feedbackApi.submit({ parcelId, rating: fbRating, comment: fbComment });
            toast.success('Thank you for your feedback!');
            setParcels((prev) => prev.map((p) => p.id === parcelId ? { ...p, feedbackGiven: true } : p));
            setFbParcel(null); setFbRating(0); setFbComment('');
        } catch {
            toast.error('Failed to submit feedback');
        } finally { setFbLoading(false); }
    }

    function toggleDietary(opt) {
        setProfileForm((f) => ({
            ...f,
            dietaryRestrictions: f.dietaryRestrictions.includes(opt)
                ? f.dietaryRestrictions.filter((d) => d !== opt)
                : [...f.dietaryRestrictions, opt],
        }));
    }

    async function saveProfile(e) {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await userApi.updateProfile(profileForm);
            updateUser(profileForm);
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        } finally { setSavingProfile(false); }
    }

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🏠 Beneficiary Dashboard</h1>
                <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1 mb-6 w-fit">
                {[['parcels', '🍱 Parcel Suggestions'], ['history', '📦 My Parcels'], ['profile', '👤 My Profile']].map(([k, label]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === k ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Parcel Suggestions ───────────────────────────────────── */}
            {tab === 'parcels' && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">
                        Personalized food recommendations based on your family size ({user?.familySize ?? profileForm.familySize})
                        and dietary needs ({(user?.dietaryRestrictions ?? profileForm.dietaryRestrictions).join(', ') || 'None specified'}).
                    </p>
                    {recs.length === 0 ? (
                        <div className="card p-12 text-center text-gray-400">
                            <div className="text-5xl mb-3">🥗</div>
                            <p>No available items matching your preferences right now. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recs.map((item) => (
                                <div key={item.id} className="card-hover p-5 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <span className="badge badge-blue text-xs">{item.category}</span>
                                        </div>
                                        <span className={`badge text-xs ${item.qualityStatus === 'FRESH' ? 'badge-green' : 'badge-yellow'}`}>
                                            {item.qualityStatus === 'FRESH' ? '✅ Fresh' : '⚠️ Use soon'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1 mb-4 flex-1">
                                        <p>Quantity: <strong>{item.quantity} kg</strong></p>
                                        <p>Expires: <strong>{formatDate(item.expiryDate)}</strong></p>
                                    </div>
                                    <button
                                        onClick={() => requestParcel(item)}
                                        disabled={requesting === item.id}
                                        className="btn-primary w-full text-sm py-2"
                                    >
                                        {requesting === item.id ? 'Requesting…' : '📩 Request Parcel'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── My Parcels ───────────────────────────────────────────── */}
            {tab === 'history' && (
                <div className="space-y-4">
                    {parcels.length === 0 ? (
                        <div className="card p-12 text-center text-gray-400">
                            <div className="text-5xl mb-3">📭</div>
                            <p>No parcels received yet.</p>
                        </div>
                    ) : (
                        parcels.map((p) => (
                            <div key={p.id} className="card p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Parcel #{p.id}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.createdAt)}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(p.items ?? []).map((i, idx) => (
                                                <span key={idx} className="badge badge-blue">{i.name} {i.quantity}kg</span>
                                            ))}
                                        </div>
                                    </div>
                                    {!p.feedbackGiven ? (
                                        <button
                                            onClick={() => { setFbParcel(p.id); setFbRating(0); setFbComment(''); }}
                                            className="btn-secondary text-sm py-1.5 px-3 shrink-0"
                                        >
                                            ⭐ Feedback
                                        </button>
                                    ) : (
                                        <span className="badge badge-green">Feedback given</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── Profile ──────────────────────────────────────────────── */}
            {tab === 'profile' && (
                <div className="max-w-lg">
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 mb-5">Edit Profile</h2>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Family Size</label>
                                    <input type="number" min="1" max="20" className="input-field"
                                        value={profileForm.familySize}
                                        onChange={(e) => setProfileForm((f) => ({ ...f, familySize: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Phone</label>
                                    <input type="tel" className="input-field" placeholder="9876543210"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Address</label>
                                <input type="text" className="input-field" placeholder="Your address"
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="label">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {DIETARY_OPTIONS.map((opt) => (
                                        <button key={opt} type="button" onClick={() => toggleDietary(opt)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${profileForm.dietaryRestrictions.includes(opt)
                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                    : 'border-gray-300 text-gray-600 hover:border-primary-400'
                                                }`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={savingProfile} className="btn-primary w-full py-3">
                                {savingProfile ? 'Saving…' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Feedback Modal ───────────────────────────────────────── */}
            {fbParcel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-backdrop">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md modal-content p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-gray-900">Rate Your Experience</h2>
                            <button onClick={() => setFbParcel(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="label mb-2">Rating *</p>
                                <FeedbackStars value={fbRating} onChange={setFbRating} />
                            </div>
                            <div className="form-group">
                                <label className="label">Comment (optional)</label>
                                <textarea
                                    className="input-field resize-none" rows={3}
                                    placeholder="Share your experience…"
                                    value={fbComment}
                                    onChange={(e) => setFbComment(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setFbParcel(null)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={() => submitFeedback(fbParcel)} disabled={fbLoading} className="btn-primary flex-1">
                                    {fbLoading ? 'Submitting…' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
