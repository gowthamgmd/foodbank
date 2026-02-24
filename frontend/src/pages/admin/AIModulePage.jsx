import { useState } from 'react';
import { aiApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SENTIMENT_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell,
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

const DEMO_MATCHES = [
    {
        id: 1, donation: 'Rice 30kg – FreshMart', beneficiaries: [
            { name: 'Priya Kumar (4)', score: 94, dietary: 'Vegetarian' },
            { name: 'Geeta Sharma (3)', score: 81, dietary: 'Diabetic' },
            { name: 'Ravi Nair (5)', score: 72, dietary: 'None' },
        ]
    },
    {
        id: 2, donation: 'Bread 50 loaves – City Bakery', beneficiaries: [
            { name: 'Mohammed Ali (6)', score: 90, dietary: 'Halal' },
            { name: 'Susan D (2)', score: 78, dietary: 'None' },
            { name: 'Kumar HH (4)', score: 65, dietary: 'Vegan' },
        ]
    },
];

const DEMO_SENTIMENT = [
    { id: 1, comment: 'The food quality was excellent!', sentiment: 'POSITIVE', date: '2026-02-18' },
    { id: 2, comment: 'Received items were fresh and well packed.', sentiment: 'POSITIVE', date: '2026-02-17' },
    { id: 3, comment: 'Some vegetables were wilted.', sentiment: 'NEGATIVE', date: '2026-02-16' },
    { id: 4, comment: 'Overall fine, delivery was on time.', sentiment: 'NEUTRAL', date: '2026-02-15' },
    { id: 5, comment: 'Very grateful, thank you!', sentiment: 'POSITIVE', date: '2026-02-14' },
];

const PIE_COLORS = { POSITIVE: '#16a34a', NEUTRAL: '#94a3b8', NEGATIVE: '#dc2626' };

const TABS = ['📈 Forecast', '🍎 Quality Assessment', '🤖 Matching', '💬 Sentiment'];

export default function AIModulePage() {
    const [tab, setTab] = useState(0);
    const [forecastData, setForecastData] = useState(null);
    const [forecasting, setForecasting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [assessResult, setAssessResult] = useState(null);
    const [assessing, setAssessing] = useState(false);
    const [matches, setMatches] = useState(DEMO_MATCHES);
    const [sentiment, setSentiment] = useState(DEMO_SENTIMENT);

    // Forecast
    async function runForecast() {
        setForecasting(true);
        try {
            const { data } = await aiApi.forecast({ historicalWeeks: 4 });
            setForecastData(data);
            toast.success('Forecast generated successfully!');
        } catch {
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

    // Matching — assign
    function handleAssign(donationId, beneficiaryName) {
        toast.success(`Assigned: Parcel created for ${beneficiaryName}`);
        setMatches((prev) => prev.filter((m) => m.id !== donationId));
    }

    // Sentiment pie data
    const sentimentCounts = DEMO_SENTIMENT.reduce((acc, f) => {
        acc[f.sentiment] = (acc[f.sentiment] ?? 0) + 1; return acc;
    }, {});
    const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));

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
                <div className="max-w-xl space-y-5">
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900">🍎 Food Quality Assessment</h2>
                        <p className="text-sm text-gray-500">Upload a food image to get AI-based freshness classification.</p>

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

                        {assessResult && (
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
                                <button className="btn-secondary mt-3 text-sm py-1.5">💾 Save to Inventory</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab 2: Donation–Beneficiary Matching ────────────────── */}
            {tab === 2 && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Showing unmatched donations with top-3 recommended beneficiaries (match score %).</p>
                    {matches.length === 0 ? (
                        <div className="card p-12 text-center text-gray-400">
                            <div className="text-5xl mb-3">🎉</div>
                            <p>All donations have been matched!</p>
                        </div>
                    ) : (
                        matches.map((m) => (
                            <div key={m.id} className="card p-5">
                                <p className="font-semibold text-gray-900 mb-3">🍱 {m.donation}</p>
                                <div className="space-y-2">
                                    {m.beneficiaries.map((b, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="text-sm font-medium">{b.name}</p>
                                                <p className="text-xs text-gray-400">Dietary: {b.dietary}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`badge ${b.score >= 90 ? 'badge-green' : b.score >= 75 ? 'badge-yellow' : 'badge-red'}`}>
                                                    {b.score}%
                                                </span>
                                                <button
                                                    onClick={() => handleAssign(m.id, b.name)}
                                                    className="btn-primary text-xs py-1 px-3"
                                                >
                                                    Assign →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── Tab 3: Sentiment Analysis ───────────────────────────── */}
            {tab === 3 && (
                <div className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Pie chart */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {pieData.map((entry) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Feedback list */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Recent Feedback</h3>
                            <div className="space-y-3 overflow-y-auto max-h-60">
                                {sentiment.map((f) => {
                                    const s = SENTIMENT_COLORS[f.sentiment];
                                    return (
                                        <div key={f.id} className="flex gap-3 items-start">
                                            <span className={`badge ${s.bg} ${s.text} shrink-0 mt-0.5`}>{s.label}</span>
                                            <div>
                                                <p className="text-sm text-gray-800">"{f.comment}"</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{f.date}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
