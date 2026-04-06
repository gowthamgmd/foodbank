import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage, validateEmail, validatePhone, isFutureDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const INITIAL_BENEFICIARY = {
    name: '',  // Organization name
    email: '', 
    password: '', 
    confirmPassword: '',
    organizationName: '',
    organizationDetails: '',
    peopleSupported: 0,
    address: '', 
    phone: '',
};
const INITIAL_DONOR = {
    organizationName: '', contactPerson: '', email: '', password: '', confirmPassword: '',
    address: '', phone: '', typicalDonationItems: '',
};

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('BENEFICIARY'); // 'BENEFICIARY' | 'DONOR'
    const [benForm, setBenForm] = useState(INITIAL_BENEFICIARY);
    const [donForm, setDonForm] = useState(INITIAL_DONOR);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleBenChange(e) {
        const { name, value } = e.target;
        setBenForm((f) => ({ ...f, [name]: value }));
        setError('');
    }


    function handleDonChange(e) {
        const { name, value } = e.target;
        setDonForm((f) => ({ ...f, [name]: value }));
        setError('');
    }

    function validateBeneficiary() {
        if (!benForm.name || !benForm.email || !benForm.password || !benForm.peopleSupported) return 'All required fields must be filled.';
        if (!validateEmail(benForm.email)) return 'Invalid email address.';
        if (benForm.password.length < 6) return 'Password must be at least 6 characters.';
        if (benForm.password !== benForm.confirmPassword) return 'Passwords do not match.';
        if (benForm.phone && !validatePhone(benForm.phone)) return 'Invalid Indian phone number (10 digits, starts 6-9).';
        return null;
    }

    function validateDonor() {
        if (!donForm.organizationName || !donForm.email || !donForm.password) return 'All required fields must be filled.';
        if (!validateEmail(donForm.email)) return 'Invalid email address.';
        if (donForm.password.length < 6) return 'Password must be at least 6 characters.';
        if (donForm.password !== donForm.confirmPassword) return 'Passwords do not match.';
        if (donForm.phone && !validatePhone(donForm.phone)) return 'Invalid Indian phone number.';
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationError = tab === 'BENEFICIARY' ? validateBeneficiary() : validateDonor();
        if (validationError) { setError(validationError); return; }

        const payload = tab === 'BENEFICIARY'
            ? { 
                name: benForm.name,
                email: benForm.email,
                password: benForm.password,
                confirmPassword: benForm.confirmPassword,
                organizationName: benForm.name,
                organizationDetails: benForm.organizationDetails,
                peopleSupported: benForm.peopleSupported,
                address: benForm.address,
                phone: benForm.phone,
                role: 'BENEFICIARY' 
            }
            : { 
                name: donForm.organizationName, // Map organizationName to name for backend
                email: donForm.email,
                password: donForm.password,
                confirmPassword: donForm.confirmPassword,
                phone: donForm.phone,
                address: donForm.address,
                contactPerson: donForm.contactPerson,
                typicalDonationItems: donForm.typicalDonationItems,
                role: 'DONOR' 
            };

        setLoading(true);
        try {
            const user = await register(tab, payload);
            toast.success(`Welcome, ${user.name}! Account created.`);
            const paths = { DONOR: '/donor/dashboard', BENEFICIARY: '/beneficiary/dashboard' };
            navigate(paths[tab], { replace: true });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl">
                <div className="card p-8">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-3">🌿</div>
                        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join Smart Food Bank — select your role to get started</p>
                    </div>

                    {/* Tab selector */}
                    <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
                        {['BENEFICIARY', 'DONOR'].map((t) => (
                            <button
                                key={t} type="button"
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t === 'BENEFICIARY' ? '🏠 Beneficiary' : '🤝 Donor / Organization'}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'BENEFICIARY' ? (
                            <>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="label">Organization Name *</label>
                                        <input name="name" type="text" className="input-field" placeholder="Hope Foundation"
                                            value={benForm.name} onChange={handleBenChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Email *</label>
                                        <input name="email" type="email" className="input-field" placeholder="org@email.com"
                                            value={benForm.email} onChange={handleBenChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Password *</label>
                                        <input name="password" type="password" className="input-field" placeholder="Min 6 chars"
                                            value={benForm.password} onChange={handleBenChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Confirm Password *</label>
                                        <input name="confirmPassword" type="password" className="input-field" placeholder="Repeat password"
                                            value={benForm.confirmPassword} onChange={handleBenChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">People Supported *</label>
                                        <input name="peopleSupported" type="number" min="1" className="input-field" placeholder="e.g., 50"
                                            value={benForm.peopleSupported} onChange={handleBenChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Phone</label>
                                        <input name="phone" type="tel" className="input-field" placeholder="9876543210"
                                            value={benForm.phone} onChange={handleBenChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Organization Details</label>
                                    <textarea name="organizationDetails" rows="3" className="input-field" 
                                        placeholder="Brief description of your organization's mission and the community you serve..."
                                        value={benForm.organizationDetails} onChange={handleBenChange} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Address</label>
                                    <input name="address" type="text" className="input-field" placeholder="123 Main Street, City"
                                        value={benForm.address} onChange={handleBenChange} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="label">Organization Name *</label>
                                        <input name="organizationName" type="text" className="input-field" placeholder="ABC Corp"
                                            value={donForm.organizationName} onChange={handleDonChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Contact Person</label>
                                        <input name="contactPerson" type="text" className="input-field" placeholder="John Smith"
                                            value={donForm.contactPerson} onChange={handleDonChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Email *</label>
                                        <input name="email" type="email" className="input-field" placeholder="org@email.com"
                                            value={donForm.email} onChange={handleDonChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Phone</label>
                                        <input name="phone" type="tel" className="input-field" placeholder="9876543210"
                                            value={donForm.phone} onChange={handleDonChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Password *</label>
                                        <input name="password" type="password" className="input-field" placeholder="Min 6 chars"
                                            value={donForm.password} onChange={handleDonChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Confirm Password *</label>
                                        <input name="confirmPassword" type="password" className="input-field" placeholder="Repeat"
                                            value={donForm.confirmPassword} onChange={handleDonChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Address</label>
                                    <input name="address" type="text" className="input-field" placeholder="Office address"
                                        value={donForm.address} onChange={handleDonChange} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Typical Donation Items (optional)</label>
                                    <input name="typicalDonationItems" type="text" className="input-field"
                                        placeholder="e.g., Rice, Lentils, Canned goods"
                                        value={donForm.typicalDonationItems} onChange={handleDonChange} />
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
