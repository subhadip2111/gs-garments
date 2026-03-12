import React, { useState, useEffect } from 'react';
import { Plus, Tag, Calendar, BadgePercent, CheckCircle, XCircle, Search, Edit, Trash2 } from 'lucide-react';
import AdminModal from './AdminModal';
import { addNewPromocode, getAllPromocodes, getPromocodeStats, updatePromocode, deletePromocode } from '@/api/auth/promoCode.Api';
import { formatDate } from '@/api/auth/utils/dateFormatter';
import { useToast } from '../Toast';
import Pagination from './Pagination';




const CuponsManager: React.FC = () => {
    const [promocodes, setPromocodes] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [stats, setStats] = useState<any>({});
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(4);
    const [totalPages, setTotalPages] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { showToast } = useToast();
    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true,
        userType: 'newUser'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                await updatePromocode({ ...formData },editingId);
                showToast("Promocode updated successfully", "success");
            } else {
                await addNewPromocode(formData);
                showToast("Promocode created successfully", "success");
            }
            fetchPromocodes();
            fetchPromostats();
            setIsFormOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error submitting promocode:", error);
            showToast("Failed to save promocode", "error");
        }
    };

    const resetForm = () => {
        setFormData({
            code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
            userType: 'newUser',
            maxDiscountAmount: '', startDate: '', endDate: '', usageLimit: '', isActive: true
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEdit = (promo: any) => {
        setFormData({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minOrderAmount: promo.minOrderAmount,
            maxDiscountAmount: promo.maxDiscountAmount,
            startDate: promo.startDate?.includes('T') ? promo.startDate.split('T')[0] : promo.startDate,
            endDate: promo.endDate?.includes('T') ? promo.endDate.split('T')[0] : promo.endDate,
            usageLimit: promo.usageLimit,
            isActive: promo.isActive,
            userType: promo.userType || 'newUser'
        });
        setEditingId(promo.id || promo._id);
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const toggleStatus = async (promo: any) => {
        try {
            await updatePromocode({ ...promo, isActive: !promo.isActive },promo.id || promo._id);
            showToast(`Promocode ${!promo.isActive ? 'activated' : 'deactivated'}`, "success");
            fetchPromocodes();
            fetchPromostats();
        } catch (error) {
            console.error("Error toggling status:", error);
            showToast("Failed to update status", "error");
        }
    };

    const deletePromo = (id: string) => {
        setDeleteId(id);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deletePromocode({ id: deleteId });
            showToast("Promocode deleted successfully", "success");
            fetchPromocodes();
            fetchPromostats();
            setIsDeleteConfirmOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error("Error deleting promocode:", error);
            showToast("Failed to delete promocode", "error");
        }
    };

    const fetchPromostats = async () => {
        const statsResult = await getPromocodeStats()
        setStats(statsResult)

    }

    useEffect(() => {
        fetchPromostats()
    }, [])


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const fetchPromocodes = async () => {
        const promocodesResult = await getAllPromocodes(debouncedSearch, page, limit)
        setPromocodes(promocodesResult?.results)
        setTotalPages(promocodesResult?.totalPages || 0)
    }
    useEffect(() => {

        fetchPromocodes()
    }, [debouncedSearch, page, limit])
    console.log("promocodes", promocodes)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Promocodes</h1>
                    <p className="text-black text-sm font-medium">Manage discount codes and promotional offers</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl active:scale-95"
                >
                    <Plus size={14} /> Create Promocode
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <BadgePercent size={24} className="text-black mb-3 z-10" />
                    <span className="text-3xl font-black text-black z-10">{stats?.totalPromoCodes
                    }</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-1 z-10">Total Codes</span>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <CheckCircle size={24} className="text-emerald-500 mb-3 z-10" />
                    <span className="text-3xl font-black text-emerald-600 z-10">{stats?.activePromoCodes}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-1 z-10">Active Codes</span>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <Tag size={24} className="text-red-500 mb-3 z-10" />
                    <span className="text-3xl font-black text-red-600 z-10">{stats?.totalUsed}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-1 z-10">Total Uses</span>
                </div>
            </div>

            {/* Main Area */}
            <div className="bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5">Code</th>
                                <th className="px-6 py-5">Discount</th>
                                <th className="px-6 py-5">Constraints</th>
                                <th className="px-6 py-5">Dates</th>
                                <th className="px-6 py-5">Usage</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {promocodes?.map(promo => (
                                <tr key={promo.id} className="hover:bg-zinc-50/80 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-black tracking-widest font-mono">
                                            {promo.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-black text-lg font-serif">
                                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                                        </div>
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                                            {promo.discountType} off
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-600">
                                            Min: ₹{promo.minOrderAmount}
                                        </div>
                                        {promo.discountType === 'percentage' && (
                                            <div className="text-[10px] font-bold text-gray-600">
                                                Max Off: ₹{promo.maxDiscountAmount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                                            <Calendar size={10} /> {  formatDate(promo.startDate)}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Calendar size={10} /> {  formatDate(promo.endDate)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                                                <div
                                                    className="h-full bg-black rounded-full"
                                                    style={{ width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest">{promo.usedCount}/{promo.usageLimit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() => toggleStatus(promo)}
                                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${promo.isActive
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                                                } transition-colors`}
                                        >
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(promo)}
                                            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deletePromo(promo?.id)}
                                            className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promocodes?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center text-zinc-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <BadgePercent size={32} className="opacity-20" />
                                            <p className="text-[10px] uppercase font-black tracking-widest">No promocodes found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={(newPage) => setPage(newPage)} 
                />
            </div>

            {/* Create/Edit Modal */}
            <AdminModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); resetForm(); }} title={isEditing ? "Edit Promocode" : "Create New Promocode"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Promocode *</label>
                            <input required name="code" value={formData.code} onChange={handleInputChange} type="text" placeholder="e.g. SUMMER50" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Type *</label>
                            <select required name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all appearance-none cursor-pointer">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">User Type *</label>
                            <select required name="userType" value={formData.userType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all appearance-none cursor-pointer">
                                <option value="" disabled>Select User Type</option>
                                <option value="all">All Users</option>
                                <option value="newUser">New User</option>
                                <option value="regular_user">Regular User</option>
                                <option value="frequent_user">Frequent User</option>
                                <option value="prime_user">Prime User</option>
                                <option value="inactive_user">Inactive User</option>
                            </select>
                        </div>


                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Value *</label>
                            <input required name="discountValue" value={formData.discountValue} onChange={handleInputChange} type="number" min="0" step="any" placeholder="e.g. 50" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Usage Limit *</label>
                            <input required name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} type="number" min="1" placeholder="e.g. 1000" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        </div>
                    </div>

                    <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-100/50 pb-2">Constraints</h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Min Order Amount *</label>
                                <input required name="minOrderAmount" value={formData.minOrderAmount} onChange={handleInputChange} type="number" min="0" placeholder="e.g. 1000" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Discount Amount *</label>
                                <input required name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleInputChange} type="number" min="0" placeholder="e.g. 500" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Date *</label>
                            <input required name="startDate" value={formData.startDate} onChange={handleInputChange} type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] uppercase font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Date *</label>
                            <input required name="endDate" value={formData.endDate} onChange={handleInputChange} type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] uppercase font-black tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleInputChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-gray-900">Is Active</span>
                        </label>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-50">
                        <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                            {isEditing ? "Update Code" : "Create Code"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminModal isOpen={isDeleteConfirmOpen} onClose={() => { setIsDeleteConfirmOpen(false); setDeleteId(null); }} title="Confirm Deletion">
                <div className="space-y-6">
                    <p className="text-sm font-medium text-gray-600">
                        Are you sure you want to delete this promocode? This action cannot be undone and will affect customers using this code.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button 
                            type="button" 
                            onClick={() => { setIsDeleteConfirmOpen(false); setDeleteId(null); }} 
                            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleConfirmDelete}
                            className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 active:scale-95"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </AdminModal>

        </div>
    );
};

export default CuponsManager;
