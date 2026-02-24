import { useState, useEffect, useCallback } from 'react';
import { inventoryApi, userApi } from '../../services/api';
import ExpiryBadge from '../../components/ExpiryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatKg, QUALITY_COLORS, isFutureDate, isExpiringSoon } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['Grains', 'Dairy', 'Proteins', 'Vegetables', 'Fruits', 'Beverages', 'Canned Goods', 'Bakery', 'Other'];
const QUALITY_OPTIONS = ['FRESH', 'PARTIAL', 'SPOILED'];

const EMPTY_FORM = {
    name: '', category: 'Grains', quantity: '', expiryDate: '',
    donorId: '', qualityStatus: 'FRESH', imageUrl: '',
};

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);   // add/edit modal
    const [editing, setEditing] = useState(null);     // null = add, item = edit
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [invRes, donRes] = await Promise.all([inventoryApi.getAll(), userApi.getDonors()]);
            setItems(invRes.data ?? []);
            setDonors(donRes.data ?? []);
        } catch {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    function openAdd() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModal(true);
    }

    function openEdit(item) {
        setEditing(item);
        setForm({
            name: item.name, category: item.category, quantity: item.quantity,
            expiryDate: item.expiryDate?.slice(0, 10) ?? '',
            donorId: item.donorId ?? '', qualityStatus: item.qualityStatus ?? 'FRESH', imageUrl: item.imageUrl ?? '',
        });
        setModal(true);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.quantity || !form.expiryDate) {
            toast.error('Name, quantity, and expiry date are required.');
            return;
        }
        if (!isFutureDate(form.expiryDate)) {
            toast.error('Expiry date must be in the future.');
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await inventoryApi.update(editing.id, form);
                toast.success('Item updated successfully');
            } else {
                await inventoryApi.create(form);
                toast.success('Item added to inventory');
            }
            setModal(false);
            load();
        } catch {
            toast.error('Failed to save item');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this item?')) return;
        try {
            await inventoryApi.remove(id);
            toast.success('Item deleted');
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch {
            toast.error('Failed to delete item');
        }
    }

    async function handleMarkDistributed(id) {
        toast.success('Item marked as distributed');
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    const filtered = items.filter((i) =>
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📦 Inventory Management</h1>
                <button onClick={openAdd} className="btn-primary">+ Add Item</button>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input
                    type="text" className="input-field max-w-sm"
                    placeholder="🔍 Search by name or category…"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">📭</div>
                    <p>No inventory items found.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th><th>Category</th><th>Quantity</th>
                                <th>Expiry Date</th><th>Quality</th><th>Expiry Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => {
                                const q = QUALITY_COLORS[item.qualityStatus] ?? QUALITY_COLORS.FRESH;
                                const row = isExpiringSoon(item.expiryDate) ? 'bg-red-50' : '';
                                return (
                                    <tr key={item.id} className={row}>
                                        <td className="font-medium">{item.name}</td>
                                        <td><span className="badge badge-blue">{item.category}</span></td>
                                        <td>{formatKg(item.quantity)}</td>
                                        <td>{formatDate(item.expiryDate)}</td>
                                        <td><span className={`badge ${q.bg} ${q.text}`}>{q.label}</span></td>
                                        <td><ExpiryBadge expiryDate={item.expiryDate} /></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(item)} className="btn-ghost text-xs py-1 px-2">✏️ Edit</button>
                                                <button onClick={() => handleMarkDistributed(item.id)} className="btn-ghost text-xs py-1 px-2 text-green-700">✓ Done</button>
                                                <button onClick={() => handleDelete(item.id)} className="btn-danger text-xs py-1 px-2">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-backdrop">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Item' : 'Add Food Item'}</h2>
                                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="label">Item Name *</label>
                                        <input name="name" className="input-field" placeholder="e.g., Rice" value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Quantity (kg) *</label>
                                        <input name="quantity" type="number" min="0.1" step="0.1" className="input-field" value={form.quantity} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Expiry Date *</label>
                                        <input name="expiryDate" type="date" className="input-field" value={form.expiryDate} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Donor</label>
                                        <select name="donorId" className="input-field" value={form.donorId} onChange={handleChange}>
                                            <option value="">— Select donor —</option>
                                            {donors.map((d) => (
                                                <option key={d.id} value={d.id}>{d.organizationName || d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Quality Status</label>
                                        <select name="qualityStatus" className="input-field" value={form.qualityStatus} onChange={handleChange}>
                                            {QUALITY_OPTIONS.map((q) => <option key={q}>{q}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Image Upload (for AI assessment)</label>
                                    <input
                                        type="file" accept="image/*" className="input-field py-2 text-sm cursor-pointer"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                                    <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                        {submitting ? 'Saving…' : editing ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
