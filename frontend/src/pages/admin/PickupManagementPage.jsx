import { useState, useEffect, useCallback } from 'react';
import { pickupApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DEMO_PICKUPS = [
    { id: 1, donor: 'FreshMart Superstore', items: 'Rice 30kg, Lentils 10kg', pickupAddress: 'MG Road', pickupTime: '2026-02-21T10:00:00', status: 'PENDING' },
    { id: 2, donor: 'City Bakery', items: 'Bread 50 loaves', pickupAddress: 'Jayanagar', pickupTime: '2026-02-21T14:00:00', status: 'PENDING' },
    { id: 3, donor: 'ABC Corporation', items: 'Canned goods 20 units', pickupAddress: 'HSR Layout', pickupTime: '2026-02-20T09:00:00', status: 'PICKED' },
];

export default function PickupManagementPage() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await pickupApi.getAll();
            setPickups(data ?? []);
        } catch {
            setPickups(DEMO_PICKUPS);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function changeStatus(id, status) {
        try {
            await pickupApi.updateStatus(id, status);
        } catch { /* offline */ }
        setPickups((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
        toast.success(`Pickup marked as ${status.toLowerCase()}`);
        console.log(`[Notification] Pickup #${id} status changed to ${status}`);
    }

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🚚 Pickup Management</h1>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr><th>Donor</th><th>Items</th><th>Pickup Address</th><th>Pickup Time</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {pickups.map((p) => {
                            const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.PENDING;
                            return (
                                <tr key={p.id}>
                                    <td className="font-medium">{p.donor}</td>
                                    <td className="text-sm text-gray-600 max-w-[200px]">{p.items}</td>
                                    <td className="text-sm text-gray-500">{p.pickupAddress}</td>
                                    <td className="text-sm">{formatDateTime(p.pickupTime)}</td>
                                    <td><span className={`badge ${s.bg} ${s.text}`}>{s.label}</span></td>
                                    <td>
                                        {p.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => changeStatus(p.id, 'PICKED')} className="btn-primary text-xs py-1 px-3">
                                                    ✓ Mark Picked Up
                                                </button>
                                                <button onClick={() => changeStatus(p.id, 'RESCHEDULED')} className="btn-ghost text-xs py-1 px-2">
                                                    ↺ Reschedule
                                                </button>
                                            </div>
                                        )}
                                        {p.status !== 'PENDING' && (
                                            <span className="text-gray-400 text-xs italic">No action needed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
