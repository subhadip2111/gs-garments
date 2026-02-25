import React, { useState, useRef } from 'react';
import { Edit2, Trash2, Star, Upload, X } from 'lucide-react';
import AdminModal from './AdminModal';
import { useToast } from '../Toast';

interface Brand {
    id: string;
    name: string;
    logo_url: string;
    description?: string;
    featured: boolean;
}

const BrandManager: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([
        { id: '1', name: 'GS Heritage', logo_url: '', description: 'Premium traditional silk and bridal wear house', featured: true },
        { id: '2', name: 'GS Modern', logo_url: '', description: 'Contemporary fusion and party-wear line', featured: true },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form
    const [form, setForm] = useState({ name: '', description: '', featured: false });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    /* ── image handling ── */
    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('Logo must be under 2MB', 'error');
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── open modals ── */
    const openAddModal = () => {
        setEditingBrand(null);
        setForm({ name: '', description: '', featured: false });
        clearLogo();
        setIsModalOpen(true);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setForm({ name: brand.name, description: brand.description ?? '', featured: brand.featured });
        setLogoPreview(brand.logo_url || null);
        setLogoFile(null);
        setIsModalOpen(true);
    };

    /* ── submit (dummy local state) ── */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast('Brand name is required', 'error'); return; }

        setSubmitting(true);

        if (editingBrand) {
            setBrands(prev =>
                prev.map(b => b.id === editingBrand.id
                    ? { ...b, name: form.name, description: form.description, featured: form.featured, logo_url: logoPreview || b.logo_url }
                    : b
                )
            );
            showToast('Brand updated successfully', 'success');
        } else {
            const newBrand: Brand = {
                id: `brand-${Date.now()}`,
                name: form.name,
                description: form.description,
                logo_url: logoPreview || '',
                featured: form.featured,
            };
            setBrands(prev => [newBrand, ...prev]);
            showToast('Brand created successfully', 'success');
        }

        setSubmitting(false);
        setIsModalOpen(false);
    };

    /* ── delete ── */
    const handleDelete = (id: string) => {
        if (!window.confirm('Delete this brand?')) return;
        setBrands(prev => prev.filter(b => b.id !== id));
        showToast('Brand deleted successfully', 'success');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* ── Header ── */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Brand Ecosystem</h1>
                    <p className="text-black text-sm font-medium">Curate your partnership network and designer houses</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl"
                >
                    <span className="text-slate-300/85">add new brand</span>
                </button>
            </div>

            {/* ── Brand Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.length === 0 ? (
                    <div className="col-span-4 py-20 text-center">
                        <p className="text-gray-400 font-medium italic text-lg">No brands yet.</p>
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-2">Click "add new brand" to get started.</p>
                    </div>
                ) : (
                    brands.map((brand) => (
                        <div key={brand.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center group relative hover:shadow-lg transition-all">
                            {/* Logo */}
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-xl font-black text-black">
                                        {brand.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <h3 className="font-black text-gray-900 tracking-tight text-sm text-center">{brand.name}</h3>
                            {brand.description && (
                                <p className="text-[10px] text-gray-400 font-medium text-center mt-1 line-clamp-2">{brand.description}</p>
                            )}

                            {/* Featured badge */}
                            {brand.featured && (
                                <span className="absolute top-3 left-3 text-amber-500">
                                    <Star size={12} fill="currentColor" strokeWidth={3} />
                                </span>
                            )}

                            {/* Actions */}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                                <button
                                    onClick={() => handleEdit(brand)}
                                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-black rounded-md shadow-sm transition-all active:scale-95"
                                >
                                    <Edit2 size={11} />
                                </button>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-black rounded-md shadow-sm transition-all active:scale-95"
                                >
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Modal ── */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name <span className="text-rose-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. GS Heritage, GS Modern"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of the brand"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
                        {logoPreview ? (
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group mx-auto">
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-white" />
                                <button
                                    type="button"
                                    onClick={clearLogo}
                                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-gray-50/50"
                            >
                                <div className="w-10 h-10 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-2 transition-all">
                                    <Upload size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-xs font-medium text-gray-500">Upload logo</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG up to 2MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleLogoSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, featured: !form.featured })}
                            className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${form.featured ? 'bg-black' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${form.featured ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-sm text-gray-600 font-medium">Mark as Featured Brand</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
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
                            {submitting ? 'Saving…' : editingBrand ? 'Update Brand' : 'Save Brand'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default BrandManager;
