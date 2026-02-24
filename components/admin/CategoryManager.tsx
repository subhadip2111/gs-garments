import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminModal from './AdminModal';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../../api/auth/categoryApi';
import { useToast } from '../Toast';
import { setCategoriesList } from '@/store/categorySlice';
import { useDispatch } from 'react-redux';

interface Category {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    created_at: string;
}

const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '' });
    const { showToast } = useToast();

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchCategories(page);
    }, [page]);

    const fetchCategories = async (pageNum = 1) => {
        setLoading(true);
        try {
            const data = await getAllCategories(pageNum, limit);
            // API returns: { results, page, limit, totalPages, totalResults }
            const results = Array.isArray(data) ? data : (data.results ?? []);
            setCategories(results);
            setTotalPages(data.totalPages ?? 1);
            setTotalResults(data.totalResults ?? results.length);
            dispatch(setCategoriesList(results));
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast('Category name is required', 'error'); return; }
        setSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory({ name: form.name, id: editingCategory.id });
                showToast('Category updated successfully', 'success');
            } else {
                await addCategory(form);
                showToast('Category created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchCategories(page);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Operation failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setForm({ name: category.name, description: category.description || '', image_url: category.image_url || '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this category? This cannot be undone.')) return;
        try {
            await deleteCategory(id);
            showToast('Category deleted successfully', 'success');
            // If the page is now empty after delete, go back one page
            fetchCategories(categories.length === 1 && page > 1 ? page - 1 : page);
            if (categories.length === 1 && page > 1) setPage(p => p - 1);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to delete category', 'error');
        }
    };

    const openAddModal = (e: React.MouseEvent) => {
        e.preventDefault();
        setEditingCategory(null);
        setForm({
            name: ""
        })
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Catalogue Architecture</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage and organize your product taxonomies</p>
                </div>
                

                <button
                    onClick={openAddModal}
                    className="inline-block  cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl"
                >
                    <span className="text-slate-300/85"> add new category</span>
                </button>

            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <div className="relative w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-black transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Filter categories..."
                            className="w-full pl-11 pr-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black">Total</span>
                        <span className="text-sm font-black text-black">{totalResults || categories.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-4">#</th>
                                <th className="px-6 py-4">Category Name</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={3} className="px-8 py-4">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-10 py-20 text-center">
                                        <p className="text-gray-400 font-medium italic text-lg">No categories yet.</p>
                                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-2">Click "Add New Category" to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat, idx) => (
                                    <tr key={cat.id} className="hover:bg-zinc-50 transition-all duration-300 group">
                                        {/* Row number */}
                                        <td className="px-8 py-4 w-12">
                                            <span className="text-[10px] font-black text-black/30 tabular-nums">
                                                {(page - 1) * limit + idx + 1}
                                            </span>
                                        </td>
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                                    {cat.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-gray-900 text-sm tracking-tight group-hover:text-black transition-colors">
                                                    {cat.name}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-black rounded-lg shadow-sm transition-all active:scale-95"
                                                >
                                                    <Edit2 size={14} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-black rounded-lg shadow-sm transition-all active:scale-95"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination Bar ── */}
                {!loading && (totalPages > 1 || categories.length > 0) && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                            Page {page} of {totalPages || 1} &nbsp;·&nbsp; {totalResults || categories.length} total
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            {/* Page number pills */}
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black border transition-all shadow-sm ${p === page
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-100 hover:border-gray-300'
                                        }`}>
                                    {p}
                                </button>
                            ))}
                            <button
                                disabled={page >= (totalPages || 1)}
                                onClick={() => setPage(p => p + 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>


            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Menswear, Home Decor"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>


                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-premium btn-white flex-1"
                        >
                            Decline
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-premium btn-black flex-[2]"
                        >
                            {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default CategoryManager;
