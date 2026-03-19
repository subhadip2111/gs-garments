import React, { useEffect, useState, useRef } from 'react';
import { Edit2, Trash2, Image, Upload, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AdminModal from './AdminModal';
import { useToast } from '../Toast';
import OptimizedImage from '../OptimizedImage';
import { getALlBanners, addBanner, updateBanner, deleteBanner, uploadBannerImage, uploadsBulkImages } from '@/api/auth/Banner.api';
import { getAllcategoryList } from '@/api/auth/categoryApi';

/* ── types ── */
type BannerType = 'banner' | 'slider' | 'brands';

interface BrandEntry {
    name: string;
    imageUrl: string;
    description: string;
    link: string;
    tagline: string;
}

interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    description?: string;
    subtitle?: string;
    badge?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    type?: BannerType;
    brands?: BrandEntry[];
    status: 'active' | 'inactive';
}

const EMPTY_BRAND: BrandEntry = { name: '', imageUrl: '', description: '', link: '', tagline: '' };

const INITIAL_FORM = {
    type: 'banner' as BannerType,
    title: '',
    subtitle: '',
    description: '',
    badge: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    status: 'active' as 'active' | 'inactive',
};

const BannerManager: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const brandFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [brands, setBrandsForm] = useState<BrandEntry[]>([{ ...EMPTY_BRAND }]);
    const [brandImageFiles, setBrandImageFiles] = useState<{ [key: number]: File }>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;

    /* ── fetch ── */
    const fetchBanners = async (pageNum = 1) => {
        setLoading(true);
        try {
            const data = await getALlBanners(pageNum, limit);
            const results = Array.isArray(data) ? data : (data.results ?? []);
            setBanners(results);
            setTotalPages(data.totalPages ?? 1);
            setTotalResults(data.totalResults ?? results.length);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to load banners', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllcategoryList();
            setCategories(Array.isArray(data) ? data : (data.results ?? []));
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    useEffect(() => {
        fetchBanners(page);
        fetchCategories();
    }, [page]);

    /* ── main image handling ── */
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        const { url } = await uploadBannerImage(file);
        if (url) {
            setForm(prev => ({ ...prev, imageUrl: url }));
            setImagePreview(url);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── brand image handling (store file locally, upload in bulk on submit) ── */
    const handleBrandImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
        // Store the file for later bulk upload
        setBrandImageFiles(prev => ({ ...prev, [index]: file }));
        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => updateBrandField(index, 'imageUrl', reader.result as string);
        reader.readAsDataURL(file);
    };

    const clearBrandImage = (index: number) => {
        updateBrandField(index, 'imageUrl', '');
        setBrandImageFiles(prev => { const next = { ...prev }; delete next[index]; return next; });
    };

    /* ── brands array helpers ── */
    const addBrandEntry = () => setBrandsForm(prev => [...prev, { ...EMPTY_BRAND }]);
    const removeBrandEntry = (idx: number) => {
        if (brands.length <= 1) { showToast('At least one brand is required', 'error'); return; }
        setBrandsForm(prev => prev.filter((_, i) => i !== idx));
        // Re-index brand image files
        setBrandImageFiles(prev => {
            const next: { [key: number]: File } = {};
            Object.entries(prev).forEach(([k, v]) => {
                const i = Number(k);
                const file = v as File;
                if (i < idx) next[i] = file;
                else if (i > idx) next[i - 1] = file;
                // skip the removed index
            });
            return next;
        });
    };
    const updateBrandField = (idx: number, field: keyof BrandEntry, value: string) => {
        setBrandsForm(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
    };

    /* ── open modals ── */
    const openAddModal = () => {
        setEditingBanner(null);
        setForm({ ...INITIAL_FORM });
        setBrandsForm([{ ...EMPTY_BRAND }]);
        setBrandImageFiles({});
        clearImage();
        setIsModalOpen(true);
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setForm({
            type: (banner.type as BannerType) ?? 'banner',
            title: banner.title ?? '',
            subtitle: (banner as any).subtitle ?? '',
            description: banner.description ?? '',
            badge: (banner as any).badge ?? '',
            ctaText: (banner as any).ctaText ?? '',
            ctaLink: (banner as any).ctaLink ?? '',
            secondaryCtaText: (banner as any).secondaryCtaText ?? '',
            secondaryCtaLink: (banner as any).secondaryCtaLink ?? '',
            status: banner.status ?? 'active',
            imageUrl: banner.imageUrl || '',
        });
        if (banner.type === 'brands' && banner.brands?.length) {
            setBrandsForm(banner.brands.map(b => ({ ...EMPTY_BRAND, ...b })));
        } else {
            setBrandsForm([{ ...EMPTY_BRAND }]);
        }
        setBrandImageFiles({});
        setImagePreview(banner.imageUrl || null);
        setImageFile(null);
        setIsModalOpen(true);
    };

    /* ── submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
        if (form.type === 'brands') {
            const hasEmpty = brands.some(b => !b.name.trim());
            if (hasEmpty) { showToast('All brand entries must have a name', 'error'); return; }
        }

        setSubmitting(true);
        try {
            // Build the correct payload based on type
            const payload: any = {
                type: form.type,
                title: form.title,
                subtitle: form.subtitle,
                status: form.status,
            };

            if (form.type === 'brands') {
                // Step 1: Bulk upload any pending brand image files
                let finalBrands = [...brands];
                const pendingFiles = Object.entries(brandImageFiles);

                if (pendingFiles.length > 0) {
                    const filesToUpload: File[] = pendingFiles.map(([, file]) => file as File);
                    const indexMap = pendingFiles.map(([idx]) => Number(idx));

                    showToast(`Uploading ${filesToUpload.length} brand image${filesToUpload.length > 1 ? 's' : ''}…`, 'info');
                    const result = await uploadsBulkImages(filesToUpload);
                    const urls: string[] = result.urls ?? result;

                    // Map returned URLs back to the correct brand indices
                    urls.forEach((url: string, i: number) => {
                        const brandIdx = indexMap[i];
                        if (brandIdx !== undefined && finalBrands[brandIdx]) {
                            finalBrands[brandIdx] = { ...finalBrands[brandIdx], imageUrl: url };
                        }
                    });
                }

                payload.brands = finalBrands;
            } else {
                // Banner / Slider type payload
                payload.description = form.description;
                payload.badge = form.badge;
                payload.ctaText = form.ctaText;
                payload.ctaLink = form.ctaLink;
                payload.secondaryCtaText = form.secondaryCtaText;
                payload.secondaryCtaLink = form.secondaryCtaLink;
                payload.imageUrl = form.imageUrl;
            }

            console.log('Submitting payload:', payload);

            if (editingBanner) {
                await updateBanner(editingBanner.id, payload);
                showToast('Updated successfully', 'success');
            } else {
                await addBanner(payload);
                showToast('Created successfully', 'success');
            }
            setIsModalOpen(false);
            setBrandImageFiles({});
            fetchBanners(page);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this banner? This cannot be undone.')) return;
        try {
            await deleteBanner(id);
            showToast('Banner deleted successfully', 'success');
            fetchBanners(banners.length === 1 && page > 1 ? page - 1 : page);
            if (banners.length === 1 && page > 1) setPage(p => p - 1);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to delete banner', 'error');
        }
    };

    /* ── helpers ── */
    const inputCls = "w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-sm";
    const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
    const sectionTitle = (text: string) => (
        <div className="flex items-center gap-2 pt-2 pb-1">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-300">{text}</span>
            <div className="h-px flex-1 bg-gray-100" />
        </div>
    );

    const isBrandsType = form.type === 'brands';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* ── Header ── */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Visual Campaigns</h1>
                    <p className="text-gray-500 text-sm font-medium">Control the digital narrative of your heritage collection</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl"
                >
                    <span className="text-slate-300/85">add new banner</span>
                </button>
            </div>

            {/* ── Banner Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-56 animate-pulse">
                            <div className="h-40 bg-gray-100" />
                            <div className="p-4"><div className="h-4 bg-gray-100 rounded w-2/3" /></div>
                        </div>
                    ))
                ) : banners.length === 0 ? (
                    <div className="col-span-2 py-20 text-center">
                        <Image size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium italic text-lg">No banners yet.</p>
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-2">Click "add new banner" to get started.</p>
                    </div>
                ) : (
                    banners?.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                            <div className="h-44 relative overflow-hidden">
                                {banner.imageUrl ? (
                                    <OptimizedImage 
                                        src={banner.imageUrl} 
                                        alt={banner.title} 
                                        className="group-hover:scale-105 transition-transform duration-500" 
                                        aspectRatio="aspect-video"
                                    />
                                ) : banner.type === 'brands' && banner.brands?.length ? (
                                    <div className="w-full h-full bg-gray-50 grid grid-cols-3 gap-0.5 p-1">
                                        {banner.brands.slice(0, 3).map((b, i) => (
                                            <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                                                {b.imageUrl ? (
                                                    <OptimizedImage 
                                                        src={b.imageUrl} 
                                                        alt={b.name} 
                                                        aspectRatio="aspect-square"
                                                        showShimmer={false}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-gray-300">{b.name?.[0]}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <Image size={32} className="text-gray-200" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    {(banner as any).badge && (
                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow">{(banner as any).badge}</span>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full shadow ${banner.type === 'slider' ? 'bg-indigo-600 text-white' :
                                        banner.type === 'brands' ? 'bg-violet-600 text-white' :
                                            'bg-white/90 text-black'
                                        }`}>
                                        {banner.type ?? 'banner'}
                                    </span>
                                    <span className={`px-2 py-0.5 ${banner.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'} text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow`}>
                                        {banner.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="min-w-0">
                                    <h3 className="font-black text-gray-900 tracking-tight text-sm truncate">{banner.title}</h3>
                                    {banner.type === 'brands' && banner.brands?.length ? (
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{banner.brands.length} brand{banner.brands.length > 1 ? 's' : ''}</p>
                                    ) : banner.description && (
                                        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{banner.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0 ml-3">
                                    <button onClick={() => handleEdit(banner)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-black rounded-lg shadow-sm transition-all active:scale-95"><Edit2 size={13} /></button>
                                    <button onClick={() => handleDelete(banner.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-black rounded-lg shadow-sm transition-all active:scale-95"><Trash2 size={13} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            {!loading && (totalPages > 1 || banners.length > 0) && (
                <div className="px-6 py-4 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                        Page {page} of {totalPages || 1} &nbsp;·&nbsp; {totalResults || banners.length} total
                    </p>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft size={16} /></button>
                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black border transition-all shadow-sm ${p === page ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-gray-300'}`}>{p}</button>
                        ))}
                        <button disabled={page >= (totalPages || 1)} onClick={() => setPage(p => p + 1)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* ══════════ Modal Form ══════════ */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    editingBanner
                        ? `Edit ${form.type === 'brands' ? 'Brand Showcase' : form.type === 'slider' ? 'Slider' : 'Banner'}`
                        : `Create New ${form.type === 'brands' ? 'Brand Showcase' : form.type === 'slider' ? 'Slider' : 'Banner'}`
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── Type & Status Row ── */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Type</label>
                            <div className="flex rounded-xl overflow-hidden border border-gray-200">
                                {(['banner', 'slider', 'brands'] as const).map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${form.type === t
                                            ? t === 'brands' ? 'bg-violet-600 text-white' : 'bg-black text-white'
                                            : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Status</label>
                            <div className="flex rounded-xl overflow-hidden border border-gray-200">
                                {(['active', 'inactive'] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm({ ...form, status: s })}
                                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${form.status === s
                                            ? s === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                                            : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ══════ BANNER / SLIDER Fields ══════ */}
                    {!isBrandsType && (
                        <>
                            {/* Image Upload */}
                            <div>
                                <label className={labelCls}>Banner Image</label>
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                                        <OptimizedImage 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            aspectRatio="aspect-video"
                                            showShimmer={false}
                                        />
                                        <button type="button" onClick={clearImage} className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><X size={12} /></button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                            <p className="text-white text-[10px] font-bold truncate">{imageFile ? imageFile.name : 'Current image'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 hover:border-black/30 rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-gray-50/50">
                                        <div className="w-11 h-11 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-2 transition-all">
                                            <Upload size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <p className="text-xs font-semibold text-gray-500">Click to upload</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP · max 5MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageSelect} className="hidden" />
                            </div>

                            {sectionTitle('Content')}

                            <div>
                                <label className={labelCls}>Title <span className="text-rose-400">*</span></label>
                                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer Collection 2024" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Subtitle</label>
                                <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Up to 50% off on selected items" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief campaign description" className={`${inputCls} resize-none`} />
                            </div>
                            <div>
                                <label className={labelCls}>Badge Label</label>
                                <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. NEW, SALE, LIMITED" className={inputCls} />
                                <p className="text-[10px] text-gray-400 mt-1">Displayed as a tag overlay on the banner image</p>
                            </div>

                            {sectionTitle('Call to Action')}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>CTA Text</label>
                                    <input type="text" value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} placeholder="e.g. Shop Now" className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>CTA Link & Category</label>
                                    <select
                                        className={inputCls}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setForm({ ...form, ctaLink: `${process.env.VITE_GSAREES_URL}/?category=${e.target.value}` });
                                            }
                                        }}
                                        value=""
                                    >
                                        <option value="">Select Category for Link</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input type="text" value={form.ctaLink} onChange={e => setForm({ ...form, ctaLink: e.target.value })} placeholder="https://..." className={inputCls} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Secondary CTA Text</label>
                                    <input type="text" value={form.secondaryCtaText} onChange={e => setForm({ ...form, secondaryCtaText: e.target.value })} placeholder="e.g. Learn More" className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Secondary CTA Link & Category</label>
                                    <select
                                        className={inputCls}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setForm({ ...form, secondaryCtaLink: `${process.env.VITE_GSAREES_URL}/?category=${e.target.value}` });
                                            }
                                        }}
                                        value=""
                                    >
                                        <option value="">Select Category for Link</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input type="text" value={form.secondaryCtaLink} onChange={e => setForm({ ...form, secondaryCtaLink: e.target.value })} placeholder="https://..." className={inputCls} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══════ BRANDS Fields ══════ */}
                    {isBrandsType && (
                        <>
                            {sectionTitle('Brands Header')}

                            <div>
                                <label className={labelCls}>Section Title <span className="text-rose-400">*</span></label>
                                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Curated Labels." className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Section Subtitle</label>
                                <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Excellence in Every Thread" className={inputCls} />
                            </div>

                            {sectionTitle(`Brand Entries (${brands.length})`)}

                            <div className="space-y-4">
                                {brands.map((brand, idx) => (
                                    <div key={idx} className="relative bg-gray-50/80 rounded-2xl border border-gray-100 p-4 space-y-3 group">
                                        {/* Brand number & remove */}
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Brand {idx + 1}</span>
                                            {brands.length > 1 && (
                                                <button type="button" onClick={() => removeBrandEntry(idx)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Image upload for this brand */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-shrink-0">
                                                {brand.imageUrl ? (
                                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group/img">
                                                        <img src={brand.imageUrl} alt={brand.name || 'Brand'} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => clearBrandImage(idx)}
                                                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/img:opacity-100 transition-all"
                                                        >
                                                            <X size={8} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => brandFileRefs.current[idx]?.click()}
                                                        className="w-20 h-20 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white"
                                                    >
                                                        <Upload size={14} className="text-gray-300 mb-1" />
                                                        <span className="text-[8px] font-bold text-gray-400">Image</span>
                                                    </div>
                                                )}
                                                <input
                                                    ref={el => { brandFileRefs.current[idx] = el; }}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={e => handleBrandImageSelect(idx, e)}
                                                    className="hidden"
                                                />
                                            </div>

                                            {/* Name + Tagline */}
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={brand.name}
                                                    onChange={e => updateBrandField(idx, 'name', e.target.value)}
                                                    placeholder="Brand Name *"
                                                    className={`${inputCls} text-sm font-bold`}
                                                />
                                                <input
                                                    type="text"
                                                    value={brand.tagline}
                                                    onChange={e => updateBrandField(idx, 'tagline', e.target.value)}
                                                    placeholder="Tagline (e.g. Timeless Silks)"
                                                    className={`${inputCls} !text-xs`}
                                                />
                                            </div>
                                        </div>

                                        {/* Description + Link */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                                                <input
                                                    type="text"
                                                    value={brand.description}
                                                    onChange={e => updateBrandField(idx, 'description', e.target.value)}
                                                    placeholder="e.g. Designer Ethnic"
                                                    className={`${inputCls} !text-xs`}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Category Link</label>
                                                <select
                                                    className={`${inputCls} !text-xs mb-2`}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            updateBrandField(idx, 'link', `${process.env.VITE_GSAREES_URL}/?category=${e.target.value}`);
                                                        }
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map((cat: any) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={brand.link}
                                                    onChange={e => updateBrandField(idx, 'link', e.target.value)}
                                                    placeholder="/shop?brand=..."
                                                    className={`${inputCls} !text-xs`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add brand button */}
                                <button
                                    type="button"
                                    onClick={addBrandEntry}
                                    className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-violet-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-violet-600 hover:bg-violet-50/30 transition-all"
                                >
                                    <Plus size={14} />
                                    Add Another Brand
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Actions ── */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-premium btn-white flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-premium btn-black flex-[2]">
                            {submitting ? 'Saving…' : editingBanner ? 'Update Banner' : 'Create Banner'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default BannerManager;
