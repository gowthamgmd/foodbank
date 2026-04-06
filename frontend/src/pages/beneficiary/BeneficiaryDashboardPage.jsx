import { useState, useEffect, useCallback } from 'react';
import { beneficiaryApi, parcelApi, feedbackApi, userApi, foodRequestApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FeedbackStars from '../../components/FeedbackStars';
import { formatDate, extractErrorMessage, formatFoodAge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FOOD_CATEGORIES = ['Grains', 'Dairy', 'Proteins', 'Vegetables', 'Fruits', 'Beverages', 'Canned Goods', 'Bakery', 'Other'];

const DEMO_PARCELS = [
    { id: 1, createdAt: '2026-02-15', items: [{ name: 'Rice', quantity: 5 }, { name: 'Lentils', quantity: 2 }], feedbackGiven: false },
    { id: 2, createdAt: '2026-02-01', items: [{ name: 'Vegetables', quantity: 3 }, { name: 'Bread', quantity: 2 }], feedbackGiven: true },
];

const now = new Date();
const DEMO_RECS = [
    { id: 1, name: 'Rice', category: 'Grains', quantity: 15, foodPreparedTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), qualityStatus: 'FRESH' },
    { id: 2, name: 'Milk', category: 'Dairy', quantity: 8, foodPreparedTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), qualityStatus: 'FRESH' },
    { id: 3, name: 'Bread', category: 'Bakery', quantity: 10, foodPreparedTime: new Date(now.getTime() - 3 * 60 * 60 * 1000), qualityStatus: 'PARTIAL' },
];

export default function BeneficiaryDashboardPage() {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('request');
    const [recs, setRecs] = useState([]);
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);

    // Food Request Form
    const [requestForm, setRequestForm] = useState({
        quantityRequired: '',
        totalMembers: '',
        numberOfKids: '',
        numberOfElderly: '',
        preferredFoodCategories: [],
        urgencyLevel: 'MEDIUM',
    });
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // Feedback
    const [fbParcel, setFbParcel] = useState(null);
    const [fbRating, setFbRating] = useState(0);
    const [fbComment, setFbComment] = useState('');
    const [fbLoading, setFbLoading] = useState(false);

    // Profile
    const [profileForm, setProfileForm] = useState({
        organizationName: user?.organizationName ?? '',
        organizationDetails: user?.organizationDetails ?? '',
        peopleSupported: user?.peopleSupported ?? 0,
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

    async function submitFoodRequest(e) {
        e.preventDefault();
        if (!requestForm.quantityRequired || !requestForm.totalMembers) {
            toast.error('Please fill all required fields.'); return;
        }
        setSubmittingRequest(true);
        try {
            await foodRequestApi.create(requestForm);
            toast.success('✅ Food request submitted successfully!');
            setRequestForm({
                quantityRequired: '',
                totalMembers: '',
                numberOfKids: '',
                numberOfElderly: '',
                preferredFoodCategories: [],
                urgencyLevel: 'MEDIUM',
            });
        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally { setSubmittingRequest(false); }
    }

    function toggleFoodCategory(category) {
        setRequestForm((f) => ({
            ...f,
            preferredFoodCategories: f.preferredFoodCategories.includes(category)
                ? f.preferredFoodCategories.filter((c) => c !== category)
                : [...f.preferredFoodCategories, category],
        }));
    }

    function handleRequestFormChange(e) {
        const { name, value } = e.target;
        setRequestForm((f) => ({ ...f, [name]: value }));
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
                <span className="text-sm text-gray-500">Welcome, {user?.organizationName || user?.name}</span>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1 mb-6 w-fit">
                {[['request', '📝 Request Food'], ['parcels', '🍱 Available Food'], ['history', '📦 My Parcels'], ['profile', '👤 Profile']].map(([k, label]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === k ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Request Food ─────────────────────────────────────────── */}
            {tab === 'request' && (
                <div className="max-w-2xl">
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 mb-5">Submit Food Request</h2>
                        <form onSubmit={submitFoodRequest} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Quantity Required (kg) *</label>
                                    <input name="quantityRequired" type="number" min="1" step="0.5" className="input-field" 
                                        placeholder="e.g., 50" value={requestForm.quantityRequired} 
                                        onChange={handleRequestFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Total Number of Members *</label>
                                    <input name="totalMembers" type="number" min="1" className="input-field" 
                                        placeholder="e.g., 30" value={requestForm.totalMembers} 
                                        onChange={handleRequestFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Number of Kids</label>
                                    <input name="numberOfKids" type="number" min="0" className="input-field" 
                                        placeholder="0" value={requestForm.numberOfKids} 
                                        onChange={handleRequestFormChange} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Number of Elderly People</label>
                                    <input name="numberOfElderly" type="number" min="0" className="input-field" 
                                        placeholder="0" value={requestForm.numberOfElderly} 
                                        onChange={handleRequestFormChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Urgency Level *</label>
                                <select name="urgencyLevel" className="input-field" 
                                    value={requestForm.urgencyLevel} onChange={handleRequestFormChange}>
                                    <option value="LOW">Low - Can wait 3-5 days</option>
                                    <option value="MEDIUM">Medium - Needed within 2-3 days</option>
                                    <option value="HIGH">High - Urgent, needed within 24 hours</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Preferred Food Categories (Optional)</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {FOOD_CATEGORIES.map((cat) => (
                                        <button key={cat} type="button" onClick={() => toggleFoodCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                                requestForm.preferredFoodCategories.includes(cat)
                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                    : 'border-gray-300 text-gray-600 hover:border-primary-400'
                                            }`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={submittingRequest} className="btn-primary w-full py-3">
                                {submittingRequest ? 'Submitting…' : '📩 Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Parcel Suggestions ───────────────────────────────────── */}
            {tab === 'parcels' && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">
                        Available food donations from donors. Browse and request items that match your organization's needs.
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
                                        <p>Prepared: <strong>{formatFoodAge(item.foodPreparedTime)}</strong></p>
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
                        <h2 className="font-semibold text-gray-900 mb-5">Organization Profile</h2>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <div className="form-group">
                                <label className="label">Organization Name</label>
                                <input type="text" className="input-field" placeholder="Hope Foundation"
                                    value={profileForm.organizationName}
                                    onChange={(e) => setProfileForm((f) => ({ ...f, organizationName: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="label">Organization Details</label>
                                <textarea rows="3" className="input-field" 
                                    placeholder="Brief description of your organization..."
                                    value={profileForm.organizationDetails}
                                    onChange={(e) => setProfileForm((f) => ({ ...f, organizationDetails: e.target.value }))} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">People Supported</label>
                                    <input type="number" min="0" className="input-field"
                                        value={profileForm.peopleSupported}
                                        onChange={(e) => setProfileForm((f) => ({ ...f, peopleSupported: e.target.value }))} />
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
                                <input type="text" className="input-field" placeholder="Organization address"
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} />
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
