import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminModal from './AdminModal';
import { getAllcategoryList } from '@/api/auth/categoryApi';
import { useToast } from '../Toast';
import { addSubCategory, deleteSubCategory, getAllSubCategories, getAllSubCategoryList, updateSubCategory } from '@/api/auth/subcategory.Api';

interface Subcategory {
    id: string;
    name: string;
    parent_category: string;
}

const SubcategoryManager: React.FC = () => {
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
    const [form, setForm] = useState({ name: '', categoryId: '' });
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();
    const fetchAllCategoryList = async () => {
        try {
            const res = await getAllcategoryList();
            setCategoryList(res.results ?? []);
        } catch {
            showToast('Failed to load categories', 'error');
        }
    };

    useEffect(() => {
        fetchAllCategoryList();
    }, []);

    /* ── open modals ── */
    const openAddModal = () => {
        setEditingSub(null);
        setForm({ name: '', categoryId: categoryList[0]?.id ?? '' });
        setIsModalOpen(true);
    };

    const handleEdit = (sub: Subcategory) => {
        setEditingSub(sub);
        const matchedCat = categoryList.find((c: any) => c.name === sub.parent_category);
        setForm({ name: sub.name, categoryId: matchedCat?.id ?? '' });
        setIsModalOpen(true);
    };
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;
    /* ── create / update (dummy, local state) ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast('Subcategory name is required', 'error'); return; }

        setSubmitting(true);

        const parentName = categoryList.find((c: any) => c.id === form.categoryId)?.name ?? 'Unknown';
        console.log("parentName", parentName)
        const selectedCategory = categoryList.find((c: any) => c.id === form.categoryId);
        console.log("selectedCategory", selectedCategory)
        if (editingSub) {
            // Update existing
            setSubcategories(prev =>
                prev.map(s => s.id === editingSub.id ? { ...s, name: form.name, parent_category: parentName } : s)
            );
            console.log("editingSub", editingSub)

            const updatedSub = {
                name: form.name,
                category: selectedCategory.id,
                id: editingSub.id,
            };
            console.log("updatedSub", updatedSub)
            const res = await updateSubCategory(editingSub?.id, form.name, selectedCategory.id);
            console.log("res", res)
            showToast('Subcategory updated successfully', 'success');
        } else {
            const newSub = {
                name: form.name,
                category: selectedCategory.id,
            };
            console.log("newSub", newSub)
            const res = await addSubCategory(newSub);
            console.log("res", res)
            setSubcategories(prev => [newSub, ...prev]);
            showToast('Subcategory created successfully', 'success');
        }

        setSubmitting(false);
        setIsModalOpen(false);
    };

    /* ── delete ── */
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this subcategory?')) return;
        const res = await deleteSubCategory(id);
        console.log("res", res)
        setSubcategories(prev => prev.filter(s => s.id !== id));
        showToast('Subcategory deleted successfully', 'success');
    };
    const fetchSubCategoriesList = async () => {
        try {
            const res = await getAllSubCategories(page, limit);
            setSubcategories(res.results ?? []);
            setTotalPages(res.totalPages);
            setTotalResults(res.totalResults);
        } catch {
            showToast('Failed to load subcategories', 'error');
        }
    };
    useEffect(() => {
        fetchSubCategoriesList();
    }, [page]);


console.log("subcategories", subcategories)
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Subcategory Management</h1>
                    <p className="text-black text-sm font-medium">Fine-tune the architectural hierarchy of your heritage pieces</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl"
                >
                    <span className="text-slate-300/85">add new subcategory</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-[0.3em] border-b border-gray-50">
                        <tr>
                            <th className="px-8 py-4">#</th>
                            <th className="px-6 py-4">Subcategory Name</th>
                            <th className="px-6 py-4">Parent Category name </th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {subcategories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-20 text-center">
                                    <p className="text-gray-400 font-medium italic text-lg">No subcategories yet.</p>
                                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-2">Click "add new subcategory" to get started.</p>
                                </td>
                            </tr>
                        ) : (
                            subcategories?.map((sub, idx) => (
                                <tr key={sub.id} className="hover:bg-zinc-50 transition-all duration-300 group">
                                    <td className="px-8 py-4 w-12">
                                        <span className="text-[10px] font-black text-black/30 tabular-nums">{(page - 1) * limit + idx + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                                {sub?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-black text-gray-900 tracking-tight text-sm">{sub.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">{sub.category.name}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(sub)}
                                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-black rounded-lg shadow-sm transition-all active:scale-95"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
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

                {/* ── Pagination Bar ── */}
                {(totalPages > 1 || subcategories.length > 0) && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                            Page {page} of {totalPages || 1} &nbsp;·&nbsp; {totalResults || subcategories.length} total
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
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
                title={editingSub ? 'Edit Subcategory' : 'Add New Subcategory'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. T-Shirts, Blouses"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                        <select
                            value={form.categoryId}
                            onChange={e => setForm({ ...form, categoryId: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white font-medium"
                        >
                            <option value="" disabled>Select a category</option>
                            {categoryList?.map((category: any) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-premium btn-white flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-premium btn-black flex-[2]"
                        >
                            {submitting ? 'Saving…' : editingSub ? 'Update Subcategory' : 'Save Subcategory'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default SubcategoryManager;
