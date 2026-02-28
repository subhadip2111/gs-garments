import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminModal from './AdminModal';
import { useToast } from '../Toast';
import { getAllBrands, createBrand as apiCreateBrand, updateBrand as apiUpdateBrand, deleteBrand as apiDeleteBrand } from '@/api/auth/brandApi';

interface Brand {
    id: string;
    _id?: string;
    name: string;
    createdAt?: string;
}

const BrandManager: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '' });

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const data = await getAllBrands(page, 10);
            setBrands(data.results || data);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            showToast('Failed to fetch brands', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [page]);

    const openAddModal = () => {
        setEditingBrand(null);
        setForm({ name: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setForm({ name: brand.name });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast('Brand name is required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            if (editingBrand) {
                await apiUpdateBrand(editingBrand.id || editingBrand._id!, form.name);
                showToast('Brand updated successfully', 'success');
            } else {
                await apiCreateBrand(form);
                showToast('Brand created successfully', 'success');
            }
            fetchBrands();
            setIsModalOpen(false);
        } catch (error) {
            showToast('Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this brand? This will affect products linked to it.')) return;
        try {
            await apiDeleteBrand(id);
            showToast('Brand deleted successfully', 'success');
            fetchBrands();
        } catch (error) {
            showToast('Failed to delete brand', 'error');
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Brand Ecosystem</h1>
                    <p className="text-black text-sm font-medium">Curate your partnership network and designer houses</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl shrink-0"
                >
                    <span className="text-slate-300/85">add new brand</span>
                </button>
            </div>

            {/* ── Toolbar ── */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by brand name…"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Brand Listing ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-black/40 border-b border-gray-100">Brand Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-black/40 border-b border-gray-100 whitespace-nowrap">Created At</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-black/40 border-b border-gray-100">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-black/40 border-b border-gray-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-8">
                                        <div className="h-4 bg-gray-50 rounded-full w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredBrands.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <p className="text-gray-400 font-medium italic">No brands found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredBrands.map((brand) => (
                                <tr key={brand.id || brand._id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-sm">
                                                {brand.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 tracking-tight">{brand.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                                            {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Active</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-black hover:border-black hover:shadow-md transition-all active:scale-95 shadow-sm"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id || brand._id!)}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md transition-all active:scale-95 shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-black disabled:opacity-30 hover:border-black transition-all shadow-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${page === i + 1 ? 'bg-black text-white shadow-lg scale-110' : 'bg-white border border-gray-100 text-black hover:border-black'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-black disabled:opacity-30 hover:border-black transition-all shadow-sm"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* ── Modal ── */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBrand ? 'Edit Designer House' : 'Add New Brand'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-black/60 mb-2 px-1">Brand Identity Name <span className="text-rose-500">*</span></label>
                            <input
                                required
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. GS Heritage, Royal Silk House"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest text-black/40 hover:text-black hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] py-3 px-6 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-zinc-800 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Authenticating…' : editingBrand ? 'Update Portfolio' : 'Authorize Brand'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default BrandManager;
