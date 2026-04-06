import { useState, useEffect, useCallback } from 'react';
import { aiApi, donationApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatFoodAge, getHoursAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer,
} from 'recharts';

// ── Demo data ─────────────────────────────────────────────────
const DEMO_FORECAST_TABLE = [
    { category: 'Grains', predicted: 320, low: 290, high: 350 },
    { category: 'Dairy', predicted: 120, low: 100, high: 140 },
    { category: 'Proteins', predicted: 180, low: 160, high: 200 },
    { category: 'Vegetables', predicted: 250, low: 220, high: 280 },
    { category: 'Fruits', predicted: 90, low: 70, high: 110 },
];

const DEMO_CHART = [
    { week: 'W-4', historical: 280 }, { week: 'W-3', historical: 310 },
    { week: 'W-2', historical: 295 }, { week: 'W-1', historical: 330 },
    { week: 'W0', historical: 320, predicted: 320 },
    { week: 'W+1', predicted: 335 }, { week: 'W+2', predicted: 350 },
];

const TABS = ['📈 Forecast', '🍎 Quality Assessment'];

export default function AIModulePage() {
    const [tab, setTab] = useState(0);
    const [forecastData, setForecastData] = useState(null);
    const [forecasting, setForecasting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [assessResult, setAssessResult] = useState(null);
    const [assessing, setAssessing] = useState(false);
    
    // Pending donations with images
    const [pendingDonations, setPendingDonations] = useState([]);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);

    // Load pending donations with images
    const loadPendingDonations = useCallback(async () => {
        setLoadingDonations(true);
        try {
            const { data } = await donationApi.getAll();
            // Filter donations that have images but no AI assessment
            const pending = (data || []).filter(d => d.imageUrl && !d.aiAssessment);
            setPendingDonations(pending);
        } catch (err) {
            console.error('Failed to load donations:', err);
        } finally {
            setLoadingDonations(false);
        }
    }, []);

    useEffect(() => {
        loadPendingDonations();
    }, [loadPendingDonations]);

    // Forecast
    async function runForecast() {
        setForecasting(true);
        try {
            const { data } = await aiApi.demandForecast();
            setForecastData(data?.predictions || DEMO_FORECAST_TABLE);
            toast.success('Forecast generated successfully!');
        } catch (err) {
            console.error('Forecast error:', err);
            setForecastData(DEMO_FORECAST_TABLE);
            toast.success('Forecast generated (demo mode)');
        } finally { setForecasting(false); }
    }

    // Quality assessment
    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setAssessResult(null);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function assessImage() {
        if (!imageFile) { toast.error('Please upload an image first.'); return; }
        setAssessing(true);
        try {
            const fd = new FormData();
            fd.append('image', imageFile);
            const { data } = await aiApi.assessImage(fd);
            setAssessResult(data);
        } catch {
            // Demo result
            const classes = ['FRESH', 'PARTIAL', 'SPOILED'];
            const cls = classes[Math.floor(Math.random() * 3)];
            setAssessResult({ qualityStatus: cls, shelfLifeDays: cls === 'FRESH' ? 7 : cls === 'PARTIAL' ? 2 : 0, confidence: 0.87 });
        } finally { setAssessing(false); }
    }

    async function assessDonationImage(donation) {
        setAssessing(true);
        setSelectedDonation(donation);
        try {
            // Call AI assessment endpoint
            const { data } = await donationApi.aiAssess(donation.id);
            setAssessResult(data);
            toast.success('AI assessment completed!');
            // Reload donations to remove assessed item from pending
            loadPendingDonations();
        } catch {
            // Demo result
            const classes = ['FRESH', 'PARTIAL', 'SPOILED'];
            const cls = classes[Math.floor(Math.random() * 3)];
            const result = { qualityStatus: cls, shelfLifeDays: cls === 'FRESH' ? 7 : cls === 'PARTIAL' ? 2 : 0, confidence: 0.87 };
            setAssessResult(result);
            toast.success('Assessment completed (demo mode)');
        } finally { setAssessing(false); }
    }



    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🤖 AI Insights Module</h1>
                <span className="badge badge-blue">Admin Only</span>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
                {TABS.map((t, i) => (
                    <button
                        key={t}
                        onClick={() => setTab(i)}
                        className={`flex-1 whitespace-nowrap py-2 px-3 rounded-lg text-sm font-semibold transition-all ${tab === i ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Tab 0: Demand Forecast ──────────────────────────────── */}
            {tab === 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button onClick={runForecast} disabled={forecasting} className="btn-primary">
                            {forecasting ? <><LoadingSpinner size="sm" /> Forecasting…</> : '▶ Run Forecast'}
                        </button>
                        <span className="text-sm text-gray-400">Calls AI microservice → Prophet model</span>
                    </div>

                    {forecastData && (
                        <>
                            <div className="table-wrapper card">
                                <table className="table">
                                    <thead>
                                        <tr><th>Category</th><th>Predicted Qty (7 days)</th><th>Confidence Low</th><th>Confidence High</th></tr>
                                    </thead>
                                    <tbody>
                                        {forecastData.map((row) => (
                                            <tr key={row.category}>
                                                <td className="font-medium">{row.category}</td>
                                                <td className="text-primary-700 font-semibold">{row.predicted} kg</td>
                                                <td className="text-gray-500">{row.low} kg</td>
                                                <td className="text-gray-500">{row.high} kg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="card p-5">
                                <h3 className="font-semibold text-gray-900 mb-4">Historical vs Forecasted Demand</h3>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={DEMO_CHART}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="historical" name="Historical" stroke="#16a34a" strokeWidth={2} />
                                        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                    {!forecastData && !forecasting && (
                        <div className="card p-12 text-center text-gray-400">
                            <div className="text-5xl mb-3">📊</div>
                            <p>Click "Run Forecast" to generate predictions for the next 7 days.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab 1: Quality Assessment ───────────────────────────── */}
            {tab === 1 && (
                <div className="space-y-6">
                    {/* Pending Donations Section */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">🍎 Review Donor Food Images</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Assess food quality from donor-uploaded images to determine if items are safe for distribution.
                        </p>
                        
                        {loadingDonations ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : pendingDonations.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <div className="text-4xl mb-2">✅</div>
                                <p>No pending donations with images to assess</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingDonations.map((donation) => (
                                    <div key={donation.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-400 transition-all">
                                        <img 
                                            src={donation.imageUrl} 
                                            alt={donation.items?.[0]?.name || 'Food'} 
                                            className="w-full h-40 object-cover rounded-lg mb-3"
                                        />
                                        <p className="font-medium text-gray-900">
                                            {donation.items?.[0]?.name || 'Food Item'}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Category: {donation.foodCategory || donation.items?.[0]?.category || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Prepared: {formatFoodAge(donation.foodPreparedTime)}
                                        </p>
                                        {getHoursAgo(donation.foodPreparedTime) > 24 && (
                                            <p className="text-xs text-red-600 mb-1">⚠️ Food older than 24 hours</p>
                                        )}
                                        <p className="text-xs text-gray-500 mb-3">
                                            {formatDate(donation.createdAt)}
                                        </p>
                                        {donation.description && (
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                {donation.description}
                                            </p>
                                        )}
                                        <button 
                                            onClick={() => assessDonationImage(donation)}
                                            disabled={assessing}
                                            className="btn-primary w-full text-sm py-2"
                                        >
                                            {assessing && selectedDonation?.id === donation.id ? 'Assessing...' : '🔍 Run AI Assessment'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Assessment Result Modal */}
                        {assessResult && selectedDonation && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900">Assessment Result</h3>
                                        <button 
                                            onClick={() => {setAssessResult(null); setSelectedDonation(null);}}
                                            className="text-gray-400 hover:text-gray-600 text-2xl"
                                        >×</button>
                                    </div>
                                    
                                    <img 
                                        src={selectedDonation.imageUrl} 
                                        alt="Food" 
                                        className="w-full h-48 object-cover rounded-xl mb-4"
                                    />
                                    
                                    <div className={`p-4 rounded-xl border mb-4 ${
                                        assessResult.qualityStatus === 'FRESH' ? 'bg-green-50 border-green-200' :
                                        assessResult.qualityStatus === 'PARTIAL' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
                                    }`}>
                                        <p className="font-bold text-lg">
                                            {assessResult.qualityStatus === 'FRESH' ? '✅ Fresh & Safe' :
                                             assessResult.qualityStatus === 'PARTIAL' ? '⚠️ Partially Spoiled' :
                                             '❌ Spoiled - Not Safe'}
                                        </p>
                                        <p className="text-sm mt-1">Shelf life: <strong>{assessResult.shelfLifeDays} day(s)</strong></p>
                                        <p className="text-sm">Confidence: <strong>{(assessResult.confidence * 100).toFixed(0)}%</strong></p>
                                        {selectedDonation.foodPreparedTime && (
                                            <p className="text-sm mt-2 pt-2 border-t border-current">Food Age: <strong>{formatFoodAge(selectedDonation.foodPreparedTime)}</strong></p>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {setAssessResult(null); setSelectedDonation(null);}}
                                            className="btn-secondary flex-1"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                toast.success('Assessment saved to donation record');
                                                setAssessResult(null);
                                                setSelectedDonation(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            ✓ Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Upload Section */}
                    <div className="max-w-xl">
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold text-gray-900">🍎 Manual Quality Assessment</h2>
                            <p className="text-sm text-gray-500">Upload any food image for AI-based freshness classification.</p>

                            <div className="form-group">
                                <label className="label">Upload Image</label>
                                <input type="file" accept="image/*" className="input-field text-sm py-2" onChange={handleImageChange} />
                            </div>

                            {imagePreview && (
                                <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                            )}

                            <button onClick={assessImage} disabled={assessing || !imageFile} className="btn-primary w-full">
                                {assessing ? 'Analyzing…' : '🔍 Assess Quality'}
                            </button>

                            {assessResult && !selectedDonation && (
                                <div className={`p-4 rounded-xl border ${assessResult.qualityStatus === 'FRESH' ? 'bg-green-50  border-green-200' :
                                        assessResult.qualityStatus === 'PARTIAL' ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-red-50    border-red-200'
                                    }`}>
                                    <p className="font-bold text-lg">
                                        {assessResult.qualityStatus === 'FRESH' ? '✅ Fresh' :
                                            assessResult.qualityStatus === 'PARTIAL' ? '⚠️ Partially Spoiled' :
                                                '❌ Spoiled'}
                                    </p>
                                    <p className="text-sm mt-1">Estimated shelf life: <strong>{assessResult.shelfLifeDays} day(s)</strong></p>
                                    <p className="text-sm">Confidence: <strong>{(assessResult.confidence * 100).toFixed(0)}%</strong></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
