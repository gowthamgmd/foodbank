import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Navbar loaded eagerly (always visible)
import Navbar from './components/Navbar';

// ── Lazy-loaded pages ──────────────────────────────────────────
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/DashboardPage'));
const AdminInventory = React.lazy(() => import('./pages/admin/InventoryPage'));
const AdminDonorMgmt = React.lazy(() => import('./pages/admin/DonorManagementPage'));
const AdminBeneficiaryMgmt = React.lazy(() => import('./pages/admin/BeneficiaryManagementPage'));
const AdminPickupMgmt = React.lazy(() => import('./pages/admin/PickupManagementPage'));
const AdminAI = React.lazy(() => import('./pages/admin/AIModulePage'));
const DonorDashboard = React.lazy(() => import('./pages/donor/DonorDashboardPage'));
const BeneficiaryDashboard = React.lazy(() => import('./pages/beneficiary/BeneficiaryDashboardPage'));

// ── Guard components ─────────────────────────────────────────
function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role) return <Navigate to="/" replace />;
    return children;
}

// ── App ──────────────────────────────────────────────────────
function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Admin */}
                        <Route path="/admin/dashboard" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
                        <Route path="/admin/inventory" element={<RequireRole role="ADMIN"><AdminInventory /></RequireRole>} />
                        <Route path="/admin/donors" element={<RequireRole role="ADMIN"><AdminDonorMgmt /></RequireRole>} />
                        <Route path="/admin/beneficiaries" element={<RequireRole role="ADMIN"><AdminBeneficiaryMgmt /></RequireRole>} />
                        <Route path="/admin/pickups" element={<RequireRole role="ADMIN"><AdminPickupMgmt /></RequireRole>} />
                        <Route path="/admin/ai" element={<RequireRole role="ADMIN"><AdminAI /></RequireRole>} />

                        {/* Donor */}
                        <Route path="/donor/dashboard" element={<RequireRole role="DONOR"><DonorDashboard /></RequireRole>} />

                        {/* Beneficiary */}
                        <Route path="/beneficiary/dashboard" element={<RequireRole role="BENEFICIARY"><BeneficiaryDashboard /></RequireRole>} />

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}

export default App;
