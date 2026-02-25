import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Edit2, Trash2, Search, Eye, X, Upload, Ruler, Palette,
    CheckCircle2, ChevronRight, ChevronLeft, Tag, Package, Star,
    TrendingUp, Grid, List, ArrowUpDown, Image as ImageIcon
} from 'lucide-react';
import AdminModal from './AdminModal';
import { useToast } from '../Toast';
import { getAllProducts, addProduct, updateProduct, deleteProduct, uploadsBulkImages } from '@/api/auth/ProductApi';
import { getAllCategories } from '@/api/auth/categoryApi';
import { getAllSubCategories } from '@/api/auth/subcategory.Api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    setAdminProducts, setAdminProductsLoading, setAdminProductsPagination,
    removeAdminProduct, type AdminProduct
} from '@/store/adminProductSlice';

/* ── form defaults ── */
const EMPTY_FORM = {
    sku: '',
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    price: 0,
    originalPrice: 0,
    description: '',
    images: [] as string[],
    variants: [] as { color: { name: string; hex: string }; sizes: { size: string; quantity: number }[] }[],
    fabric: '',
    specifications: [] as string[],
    materialAndCare: [] as string[],
    isTrending: false,
    isNewArrival: false,
};

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Onesize', 'Free Size'];

/* ── helpers ── */
const badgeFor = (prod: AdminProduct) => {
    if (prod.isTrending) return { label: 'Trending', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (prod.isNewArrival) return { label: 'New', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    return null;
};

const totalStock = (prod: AdminProduct) =>
    (prod.variants || []).reduce((total, v) => total + v.sizes.reduce((s, vs) => s + vs.quantity, 0), 0);

/* ── drawer steps ── */
const STEPS = ['Identity', 'Media', 'Pricing & Stock', 'Details', 'Badges'];

/* ══════════════════════════════════════════════════════════════════════════ */
const ProductManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const { products, isLoading: reduxLoading, totalPages, totalResults, currentPage } = useAppSelector(s => s.adminProducts);
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerStep, setDrawerStep] = useState(0);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Detail modal
    const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Form
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    // Categories & Subcategories
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    /* ── fetch categories / subcategories ── */
    useEffect(() => {
        (async () => {
            try {
                const catData = await getAllCategories(1, 100);
                setCategories(Array.isArray(catData) ? catData : (catData.results ?? []));
            } catch { /* ignore */ }
            try {
                const subData = await getAllSubCategories(1, 100);
                setSubcategories(Array.isArray(subData) ? subData : (subData.results ?? []));
            } catch { /* ignore */ }
        })();
    }, []);

    /* ── fetch products ── */
    const fetchProducts = async (pageNum = 1) => {
        setLoading(true);
        dispatch(setAdminProductsLoading(true));
        try {
            const data = await getAllProducts(pageNum, limit);
            const results = Array.isArray(data) ? data : (data.results ?? []);
            dispatch(setAdminProducts(results));
            dispatch(setAdminProductsPagination({
                totalPages: data.totalPages ?? 1,
                totalResults: data.totalResults ?? results.length,
                currentPage: pageNum,
            }));
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to load products', 'error');
        } finally {
            setLoading(false);
            dispatch(setAdminProductsLoading(false));
        }
    };

    useEffect(() => { fetchProducts(page); }, [page]);

    /* ── image handling ── */
    const handleImageFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const oversized = files.find(f => f.size > 5 * 1024 * 1024);
        if (oversized) { showToast('Each image must be under 5MB', 'error'); return; }

        setImageFiles(prev => [...prev, ...files]);

        // Generate local previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (idx: number) => {
        // Check if it's a new file or existing URL
        const existingUrlCount = form.images.length;
        if (idx < existingUrlCount) {
            // Remove from existing URLs
            setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
            setImagePreviews(prev => prev.filter((_, i) => i !== idx));
        } else {
            // Remove from new files
            const fileIdx = idx - existingUrlCount;
            setImageFiles(prev => prev.filter((_, i) => i !== fileIdx));
            setImagePreviews(prev => prev.filter((_, i) => i !== idx));
        }
    };

    const clearAllImages = () => {
        setImageFiles([]);
        setImagePreviews([]);
        setForm(prev => ({ ...prev, images: [] }));
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    /* ── variants ── */
    const addVariant = () => setForm(prev => ({
        ...prev, variants: [...prev.variants, { color: { name: '', hex: '#a02828ff' }, sizes: [] }]
    }));
    const removeVariant = (idx: number) => setForm(prev => ({
        ...prev, variants: prev.variants.filter((_, i) => i !== idx)
    }));
    const updateVariantColorName = (idx: number, name: string) => setForm(prev => ({
        ...prev, variants: prev.variants.map((v, i) => i === idx ? { ...v, color: { ...v.color, name } } : v)
    }));
    const updateVariantColorHex = (idx: number, hex: string) => setForm(prev => ({
        ...prev, variants: prev.variants.map((v, i) => i === idx ? { ...v, color: { ...v.color, hex } } : v)
    }));
    const toggleVariantSize = (variantIdx: number, size: string) => setForm(prev => ({
        ...prev, variants: prev.variants.map((v, i) => {
            if (i !== variantIdx) return v;
            const has = v.sizes.find(s => s.size === size);
            return { ...v, sizes: has ? v.sizes.filter(s => s.size !== size) : [...v.sizes, { size, quantity: 0 }] };
        })
    }));
    const updateVariantStock = (variantIdx: number, size: string, quantity: number) => setForm(prev => ({
        ...prev, variants: prev.variants.map((v, i) => {
            if (i !== variantIdx) return v;
            return { ...v, sizes: v.sizes.map(s => s.size === size ? { ...s, quantity } : s) };
        })
    }));

    /* ── specifications ── */
    const addSpec = () => setForm(prev => ({ ...prev, specifications: [...prev.specifications, ''] }));
    const updateSpec = (idx: number, val: string) => setForm(prev => ({
        ...prev, specifications: prev.specifications.map((s, i) => i === idx ? val : s)
    }));
    const removeSpec = (idx: number) => setForm(prev => ({
        ...prev, specifications: prev.specifications.filter((_, i) => i !== idx)
    }));

    /* ── materialAndCare ── */
    const addCareItem = () => setForm(prev => ({ ...prev, materialAndCare: [...prev.materialAndCare, ''] }));
    const updateCareItem = (idx: number, val: string) => setForm(prev => ({
        ...prev, materialAndCare: prev.materialAndCare.map((s, i) => i === idx ? val : s)
    }));
    const removeCareItem = (idx: number) => setForm(prev => ({
        ...prev, materialAndCare: prev.materialAndCare.filter((_, i) => i !== idx)
    }));

    /* ── stock ── */
    const handleStockChange = (size: string, quantity: number) =>
        setForm(prev => ({ ...prev, stock: { ...prev.stock, [size]: quantity } }));

    /* ── open modals ── */
    const openAdd = () => {
        setEditingProduct(null);
        setForm({ ...EMPTY_FORM });
        setImageFiles([]);
        setImagePreviews([]);
        setDrawerStep(0);
        setDrawerOpen(true);
    };

    const openEdit = (p: AdminProduct) => {
        setEditingProduct(p);
        const catId = typeof p.category === 'object' ? (p.category?._id || p.category?.id) : p.category;
        const subId = typeof p.subcategory === 'object' ? (p.subcategory?._id || p.subcategory?.id) : p.subcategory;
        setForm({
            sku: p.sku || '',
            name: p.name || '',
            brand: p.brand || '',
            category: catId || '',
            subcategory: subId || '',
            price: p.price || 0,
            originalPrice: p.originalPrice || 0,
            description: p.description || '',
            images: p.images || [],
            variants: (p as any).variants || [],
            fabric: p.fabric || '',
            specifications: p.specifications || [],
            materialAndCare: (p as any).materialAndCare || [],
            isTrending: p.isTrending || false,
            isNewArrival: p.isNewArrival || false,
        });
        setImageFiles([]);
        setImagePreviews([...(p.images || [])]);
        setDrawerStep(0);
        setDrawerOpen(true);
    };
    /* ── submit ── */
    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast('Product name is required', 'error'); return; }
        if (!form.sku.trim()) { showToast('SKU is required', 'error'); return; }
        if (!form.category) { showToast('Category is required', 'error'); return; }
        if (!form.subcategory) { showToast('Subcategory is required', 'error'); return; }
        if (!form.price || form.price <= 0) { showToast('Price must be greater than 0', 'error'); return; }
        if (!form.description.trim()) { showToast('Description is required', 'error'); return; }

        setSubmitting(true);
        try {
            let imageUrls = [...form.images]; // existing URLs

            // Bulk upload new image files
            if (imageFiles.length > 0) {
                showToast(`Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}…`, 'info');
                const result = await uploadsBulkImages(imageFiles);
                const newUrls: string[] = result.urls ?? result;
                imageUrls = [...imageUrls, ...newUrls];
            }

            // Build variants — keep all that have sizes, default color name to hex if blank
            const cleanedVariants = form.variants
                .filter(v => v.sizes.length > 0)
                .map(v => ({
                    color: { name: v.color?.name?.trim() || v.color?.hex || 'Unnamed', hex: v.color?.hex || '#000000' },
                    sizes: v.sizes.map(s => ({ size: s.size, quantity: s.quantity })),
                }));

            const payload = {
                sku: form.sku,
                name: form.name,
                brand: form.brand,
                category: form.category,
                subcategory: form.subcategory,
                price: form.price,
                originalPrice: form.originalPrice || undefined,
                description: form.description,
                images: imageUrls,
                variants: cleanedVariants,
                fabric: form.fabric || undefined,
                specifications: form.specifications.filter(s => s.trim()),
                materialAndCare: form.materialAndCare.filter(s => s.trim()),
                isTrending: form.isTrending,
                isNewArrival: form.isNewArrival,
            };



            if (editingProduct) {
                await updateProduct(editingProduct.id || (editingProduct as any)._id, payload);
                showToast('Product updated successfully', 'success');
            } else {
                await addProduct(payload);
                showToast('Product created successfully', 'success');
            }
            setDrawerOpen(false);
            fetchProducts(page);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this product? This cannot be undone.')) return;
        try {
            await deleteProduct(id);
            dispatch(removeAdminProduct(id));
            showToast('Product deleted', 'success');
            if (products.length === 1 && page > 1) setPage(p => p - 1);
            else fetchProducts(page);
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    /* ── filtered+sorted ── */
    const displayed = [...products]
        .filter(p =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
            (typeof p.category === 'string' ? p.category : (p.category?.name || '')).toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'stock') return totalStock(b) - totalStock(a);
            return (a.name || '').localeCompare(b.name || '');
        });

    /* ── get category/subcategory name helpers ── */
    const getCategoryName = (cat: any) => {
        if (!cat) return '—';
        if (typeof cat === 'string') {
            const found = categories.find(c => (c.id || c._id) === cat);
            return found?.name || cat;
        }
        return cat.name || '—';
    };
    const getSubcategoryName = (sub: any) => {
        if (!sub) return '—';
        if (typeof sub === 'string') {
            const found = subcategories.find(s => (s.id || s._id) === sub);
            return found?.name || sub;
        }
        return sub.name || '—';
    };

    /* ── filter subcategories by selected category ── */
    const filteredSubcategories = form.category
        ? subcategories.filter(s => {
            const sCat = typeof s.category === 'object' ? (s.category?._id || s.category?.id) : s.category;
            return sCat === form.category;
        })
        : subcategories;

    /* ═══════ DRAWER STEP CONTENT ═══════ */
    const renderStep = () => {
        switch (drawerStep) {
            /* Step 0: Identity */
            case 0:
                return (
                    <div className="space-y-5">
                        <DrawerField label="Product Name" required>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                placeholder="e.g. Handwoven Banarasi Silk Saree" className="drawer-input" />
                        </DrawerField>
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Brand" required>
                                <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                                    placeholder="e.g. GS Heritage" className="drawer-input" />
                            </DrawerField>
                            <DrawerField label="SKU Code" required>
                                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                                    placeholder="GS-SR-001" className="drawer-input font-mono" />
                            </DrawerField>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Category" required>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })} className="drawer-input">
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </DrawerField>
                            <DrawerField label="Subcategory" required>
                                <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} className="drawer-input" disabled={!form.category}>
                                    <option value="">Select Subcategory</option>
                                    {filteredSubcategories.map(s => (
                                        <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </DrawerField>
                        </div>
                        <DrawerField label="Description" required>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={4} placeholder="Describe the piece in detail…"
                                className="drawer-input resize-none" />
                        </DrawerField>
                    </div>
                );

            /* Step 1: Media */
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                                Product Images ({imagePreviews.length})
                            </p>
                            {imagePreviews.length > 0 && (
                                <button type="button" onClick={clearAllImages}
                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors">
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Preview grid */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group/img bg-gray-50">
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(idx)}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                            <X size={10} />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                                                Cover
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload zone */}
                        <div onClick={() => imageInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 hover:border-black/30 rounded-2xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-gray-50/50">
                            <div className="w-12 h-12 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-3 transition-all">
                                <Upload size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-gray-500">Click to upload images</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP · max 5MB each · multiple allowed</p>
                        </div>

                        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple
                            onChange={handleImageFilesSelect} className="hidden" />

                        <p className="text-[9px] text-gray-400 font-medium">
                            Images are uploaded in bulk when you save. The first image becomes the cover.
                        </p>
                    </div>
                );

            /* Step 2: Pricing & Stock */
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Selling Price (₹) " required>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 font-black text-black/40 font-serif">₹</span>
                                    <input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                        className="drawer-input pl-8" />
                                </div>
                            </DrawerField>
                            <DrawerField label="MRP / Original (₹)">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/30 font-serif">₹</span>
                                    <input type="number" value={form.originalPrice || ''} onChange={e => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
                                        className="drawer-input pl-8" />
                                </div>
                            </DrawerField>
                        </div>
                        {form.price && form.originalPrice && form.originalPrice > form.price ? (
                            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                <TrendingUp size={12} strokeWidth={3} />
                                {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% discount applied
                            </div>
                        ) : null}

                        {/* Variants (Color → Sizes → Stock) */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-4 flex items-center gap-1.5">
                                <Palette size={12} /> Color Variants
                            </p>
                            <div className="space-y-6">
                                {form.variants.map((variant, vIdx) => {
                                    const totalStock = variant.sizes.reduce((s, v) => s + v.quantity, 0);
                                    return (
                                        <div key={vIdx} className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-5">
                                            {/* Color header */}
                                            <div className="flex gap-3 items-center">
                                                <input type="color" value={variant.color.hex}
                                                    onChange={(e) => updateVariantColorHex(vIdx, e.target.value)}
                                                    className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer p-0.5" />
                                                <input type="text" value={variant.color.name}
                                                    onChange={(e) => updateVariantColorName(vIdx, e.target.value)}
                                                    placeholder="e.g. Royal Red" className="drawer-input flex-1" />
                                                <input type="text" value={variant.color.hex}
                                                    onChange={(e) => updateVariantColorHex(vIdx, e.target.value)}
                                                    placeholder="#FF0000" className="drawer-input w-24 font-mono text-xs" />
                                                <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border whitespace-nowrap ${totalStock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                    {totalStock} pcs
                                                </div>
                                                <button type="button" onClick={() => removeVariant(vIdx)}
                                                    className="w-9 h-9 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Sizes toggle */}
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2 flex items-center gap-1">
                                                    <Ruler size={10} /> Sizes for this colour
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {COMMON_SIZES.map(size => {
                                                        const active = variant.sizes.some(s => s.size === size);
                                                        return (
                                                            <button key={size} type="button" onClick={() => toggleVariantSize(vIdx, size)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${active
                                                                    ? 'bg-black text-white border-black' : 'bg-white text-black/40 border-gray-200 hover:border-black/30'}`}>
                                                                {size}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Stock per size */}
                                            {variant.sizes.length > 0 && (
                                                <div className="border-t border-gray-100 pt-4">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-3">Stock by size</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {variant.sizes.map(vs => (
                                                            <div key={vs.size} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-black w-14">{vs.size}</span>
                                                                <input type="number" min={0} value={vs.quantity || ''}
                                                                    onChange={(e) => updateVariantStock(vIdx, vs.size, parseInt(e.target.value) || 0)}
                                                                    className="w-16 p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center font-black outline-none focus:ring-2 focus:ring-black/5 focus:border-black" />
                                                                <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${vs.quantity > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-400 border-rose-100'}`}>
                                                                    {vs.quantity > 0 ? 'In Stock' : 'Out'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button type="button" onClick={addVariant}
                                className="mt-4 flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:gap-3 transition-all">
                                <Plus size={14} strokeWidth={3} /> Add Color Variant
                            </button>
                        </div>
                    </div>
                );

            /* Step 3: Details */
            case 3:
                return (
                    <div className="space-y-5">
                        <DrawerField label="Fabric Composition">
                            <input value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })}
                                placeholder="e.g. 100% Pure Silk with Gold Zari" className="drawer-input" />
                        </DrawerField>


                        {/* Specifications */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-3 flex items-center gap-1.5">
                                <Tag size={12} /> Specifications
                            </p>
                            {form.specifications.map((spec, idx) => (
                                <div key={idx} className="flex gap-3 items-center mb-3">
                                    <input type="text" value={spec} onChange={(e) => updateSpec(idx, e.target.value)}
                                        placeholder="e.g. Weight: 650g" className="drawer-input flex-1" />
                                    <button type="button" onClick={() => removeSpec(idx)}
                                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addSpec}
                                className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:gap-3 transition-all">
                                <Plus size={14} strokeWidth={3} /> Add Specification
                            </button>
                        </div>

                        {/* Material & Care */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-3 flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> Material & Care
                            </p>
                            {form.materialAndCare.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center mb-3">
                                    <input type="text" value={item} onChange={(e) => updateCareItem(idx, e.target.value)}
                                        placeholder="e.g. Dry Clean Only" className="drawer-input flex-1" />
                                    <button type="button" onClick={() => removeCareItem(idx)}
                                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addCareItem}
                                className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:gap-3 transition-all">
                                <Plus size={14} strokeWidth={3} /> Add Care Instruction
                            </button>
                        </div>
                    </div>
                );

            /* Step 4: Badges */
            case 4:
                return (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Assign collection badges for discovery</p>
                        {[
                            { key: 'isTrending' as const, label: 'Trending Now', desc: 'Show in trending section', icon: <TrendingUp size={18} /> },
                            { key: 'isNewArrival' as const, label: 'New Arrival', desc: 'Feature in new arrivals', icon: <Star size={18} /> },
                        ].map(({ key, label, desc, icon }) => {
                            const active = form[key];
                            return (
                                <label key={key} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${active ? 'bg-black border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" checked={active} onChange={() => setForm(prev => ({ ...prev, [key]: !prev[key] }))} className="hidden" />
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-white/10 text-white' : 'bg-gray-50 text-black/40'}`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-black'}`}>{label}</p>
                                        <p className={`text-[10px] font-bold mt-0.5 ${active ? 'text-white/50' : 'text-black/40'}`}>{desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-white border-white' : 'border-gray-200'}`}>
                                        {active && <CheckCircle2 size={12} className="text-black" strokeWidth={3} />}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                );
            default: return null;
        }
    };

    /* ═══════ JSX ═══════ */
    return (
        <>
            <style>{`.drawer-input{width:100%;padding:.75rem 1rem;background:#f9fafb;border:1px solid #f3f4f6;border-radius:.875rem;font-size:.75rem;font-weight:700;color:#111;outline:none;transition:all .2s;}.drawer-input:focus{ring:4px;border-color:#000;box-shadow:0 0 0 4px rgba(0,0,0,.05);}textarea.drawer-input{padding:.875rem 1rem;}`}</style>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Inventory Management</h1>
                        <p className="text-black text-sm font-medium mt-1">
                            {totalResults} products · Page {page} of {totalPages}
                        </p>
                    </div>
                    <button onClick={openAdd} className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl">
                        <span className="text-slate-300/85">add new product</span>
                    </button>
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, SKU or category…"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ArrowUpDown size={14} className="text-black/40" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all cursor-pointer appearance-none">
                            <option value="name">Name A–Z</option>
                            <option value="price">Price ↑</option>
                            <option value="stock">Stock ↓</option>
                        </select>
                    </div>
                    <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
                        {(['grid', 'list'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                className={`w-9 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === v ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:text-black'}`}>
                                {v === 'grid' ? <Grid size={14} /> : <List size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Product Grid / List ── */}
                {loading && products.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white/60 rounded-3xl border border-gray-50 h-72 animate-pulse" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center mb-6">
                            <Package size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">No Products Found</h3>
                        <p className="text-sm text-black/40 font-medium mt-1 mb-6">
                            {search ? `No results for "${search}"` : 'Begin by adding your first product.'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {displayed.map(prod => {
                            const badge = badgeFor(prod);
                            const stock = totalStock(prod);
                            const pid = prod.id || (prod as any)._id;
                            return (
                                <div key={pid} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group relative">
                                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                                        {prod.images?.[0] ? (
                                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={32} className="text-gray-200" />
                                            </div>
                                        )}
                                        {badge && (
                                            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent pt-8">
                                            <button onClick={() => { setViewingProduct(prod); setSelectedImageIdx(0); setIsDetailOpen(true); }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest text-black hover:bg-white transition-colors">
                                                <Eye size={12} /> View
                                            </button>
                                            <button onClick={() => openEdit(prod)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-black/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors">
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <p className="font-black text-gray-900 text-sm tracking-tight line-clamp-1">{prod.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-base text-gray-900 italic font-serif">₹{prod.price?.toLocaleString('en-IN')}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${stock > 0 ? 'bg-gray-50 text-black border-gray-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                {stock > 0 ? `${stock} left` : 'Out'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span className="px-2.5 py-0.5 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest">{getCategoryName(prod.category)}</span>
                                            {prod.sku && <span className="text-[8px] text-black/30 font-mono font-black uppercase">{prod.sku}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/70 border-b border-gray-100">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-black">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayed.map(prod => {
                                    const stock = totalStock(prod);
                                    const pid = prod.id || (prod as any)._id;
                                    return (
                                        <tr key={pid} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        {prod.images?.[0] ? <img src={prod.images[0]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="m-auto text-gray-200 mt-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm tracking-tight line-clamp-1">{prod.name}</p>
                                                        <p className="text-[9px] text-black/40 font-mono font-black uppercase mt-0.5">{prod.sku || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest">{getCategoryName(prod.category)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-900 font-serif italic">₹{prod.price?.toLocaleString('en-IN')}</p>
                                                {prod.originalPrice && <p className="text-[9px] text-black/30 line-through font-bold tracking-widest">₹{prod.originalPrice.toLocaleString('en-IN')}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${stock > 0 ? 'bg-gray-50 text-black border-gray-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                    {stock > 0 ? `${stock} units` : 'Out of stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => { setViewingProduct(prod); setSelectedImageIdx(0); setIsDetailOpen(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-lg shadow-sm transition-all">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button onClick={() => openEdit(prod)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-lg shadow-sm transition-all">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button onClick={() => handleDelete(pid)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg shadow-sm transition-all">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ── */}
                {!loading && (totalPages > 1 || products.length > 0) && (
                    <div className="px-6 py-4 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                            Page {page} of {totalPages || 1} · {totalResults} total
                        </p>
                        <div className="flex items-center gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black border transition-all shadow-sm ${p === page ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-gray-300'}`}>
                                    {p}
                                </button>
                            ))}
                            <button disabled={page >= (totalPages || 1)} onClick={() => setPage(p => p + 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════ SLIDE-IN DRAWER ═══════ */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40">
                                    {editingProduct ? 'Editing Product' : 'New Product'}
                                </p>
                                <h2 className="text-xl font-black text-black tracking-tight mt-0.5">
                                    {STEPS[drawerStep]}
                                </h2>
                            </div>
                            <button onClick={() => setDrawerOpen(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-black/40 hover:text-black transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="px-8 py-5 border-b border-gray-50">
                            <div className="flex items-center gap-1">
                                {STEPS.map((step, idx) => (
                                    <React.Fragment key={step}>
                                        <button onClick={() => idx < drawerStep && setDrawerStep(idx)}
                                            className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all px-2 py-1 rounded-lg ${idx === drawerStep ? 'text-black bg-gray-50' : idx < drawerStep ? 'text-black/60 hover:text-black cursor-pointer' : 'text-black/20 cursor-default'}`}>
                                            <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black transition-all ${idx < drawerStep ? 'bg-black text-white' : idx === drawerStep ? 'bg-black text-white' : 'bg-gray-100 text-black/30'}`}>
                                                {idx < drawerStep ? '✓' : idx + 1}
                                            </span>
                                            <span className="hidden sm:block">{step}</span>
                                        </button>
                                        {idx < STEPS.length - 1 && <div className={`flex-1 h-px ${idx < drawerStep ? 'bg-black' : 'bg-gray-100'} transition-colors`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="px-8 py-6">
                                {renderStep()}
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-gray-50 flex gap-3">
                            {drawerStep > 0 && (
                                <button type="button" onClick={() => setDrawerStep(s => s - 1)} className="btn-premium btn-white flex-1">
                                    Back
                                </button>
                            )}
                            {drawerStep < STEPS.length - 1 ? (
                                <button type="button" onClick={() => setDrawerStep(s => s + 1)}
                                    className="btn-premium btn-black flex-[2] group">
                                    Continue <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={submitting}
                                    className="btn-premium btn-black flex-[2]">
                                    {submitting ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ DETAIL MODAL ═══════ */}
            <AdminModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Product Details">
                {viewingProduct && (() => {
                    const vp = viewingProduct;
                    const stock = totalStock(vp);
                    const discount = vp.originalPrice && vp.originalPrice > vp.price
                        ? Math.round(((vp.originalPrice - vp.price) / vp.originalPrice) * 100)
                        : 0;
                    return (
                        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                            {/* ── Header ── */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{vp.name}</h2>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">{vp.brand}</span>
                                        <span className="text-black/20">·</span>
                                        <span className="text-[10px] font-bold text-black/40">{getCategoryName(vp.category)}</span>
                                        <span className="text-black/20">›</span>
                                        <span className="text-[10px] font-bold text-black/40">{getSubcategoryName(vp.subcategory)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    {vp.isTrending && (
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp size={10} /> Trending
                                        </span>
                                    )}
                                    {vp.isNewArrival && (
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Star size={10} /> New
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Image Gallery ── */}
                            {vp.images && vp.images.length > 0 && (
                                <div className="space-y-2">
                                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer" onClick={() => window.open(vp.images[selectedImageIdx >= vp.images.length ? 0 : selectedImageIdx], '_blank')}>
                                        <img src={vp.images[selectedImageIdx >= vp.images.length ? 0 : selectedImageIdx]} alt={vp.name} className="w-full h-full object-cover transition-all duration-300" />
                                    </div>
                                    {vp.images.length > 1 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {vp.images.slice(0, 5).map((img, i) => (
                                                <div key={i}
                                                    onClick={() => setSelectedImageIdx(i)}
                                                    className={`aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 cursor-pointer transition-all duration-200 hover:opacity-80 ${(selectedImageIdx >= vp.images.length ? 0 : selectedImageIdx) === i
                                                        ? 'border-black shadow-md scale-[1.03]'
                                                        : 'border-gray-100 opacity-70 hover:opacity-100'
                                                        }`}>
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Price & Quick Stats ── */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-4 bg-black rounded-xl col-span-2 md:col-span-1">
                                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Price</p>
                                    <p className="text-2xl font-black text-white tracking-tight font-serif italic">₹{vp.price?.toLocaleString('en-IN')}</p>
                                    {vp.originalPrice && vp.originalPrice > vp.price && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-white/30 line-through font-serif">₹{vp.originalPrice.toLocaleString('en-IN')}</span>
                                            <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-black">{discount}% OFF</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">SKU</p>
                                    <p className="text-sm font-mono font-black text-black">{vp.sku || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">Fabric</p>
                                    <p className="text-sm font-black text-black">{vp.fabric || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">Total Stock</p>
                                    <p className={`text-2xl font-black tracking-tight ${stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{stock}</p>
                                    <p className="text-[9px] text-black/30 font-bold mt-0.5">{(vp as any).variants?.length || 0} color variant{((vp as any).variants?.length || 0) !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* ── Variants & Stock Breakdown ── */}
                            {((vp as any).variants || []).length > 0 && (
                                <div>
                                    <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-3 flex items-center gap-1.5">
                                        <Palette size={12} /> Variants & Stock Breakdown
                                    </p>
                                    <div className="space-y-3">
                                        {((vp as any).variants || []).map((variant: any, vIdx: number) => {
                                            const variantStock = (variant.sizes || []).reduce((s: number, v: any) => s + (v.quantity || 0), 0);
                                            return (
                                                <div key={vIdx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                                                style={{ backgroundColor: variant.color?.hex || '#ccc' }} />
                                                            <div>
                                                                <span className="text-xs font-black text-black block">{variant.color?.name || 'Unnamed'}</span>
                                                                <span className="text-[9px] font-mono text-black/30">{variant.color?.hex}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${variantStock > 0
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                            {variantStock} pcs
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                        {(variant.sizes || []).map((vs: any) => (
                                                            <div key={vs.size} className="bg-white p-2.5 rounded-lg border border-gray-100 text-center">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-black block">{vs.size}</span>
                                                                <span className={`text-lg font-black block mt-0.5 ${vs.quantity > 0 ? 'text-black' : 'text-rose-400'}`}>
                                                                    {vs.quantity}
                                                                </span>
                                                                <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                                                                    <div className={`h-1 rounded-full transition-all ${vs.quantity > 10 ? 'bg-emerald-500' : vs.quantity > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                                                        style={{ width: `${Math.min(100, (vs.quantity / 50) * 100)}%` }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Description ── */}
                            {vp.description && (
                                <div className="p-4 bg-stone-50/60 rounded-xl border border-stone-100">
                                    <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-2">Description</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{vp.description}</p>
                                </div>
                            )}

                            {/* ── Specifications ── */}
                            {vp.specifications && vp.specifications.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-2">Specifications</p>
                                    <div className="flex flex-wrap gap-2">
                                        {vp.specifications.map((spec, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Material & Care ── */}
                            {(vp as any).materialAndCare && (vp as any).materialAndCare.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-2">Material & Care</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(vp as any).materialAndCare.map((item: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Actions ── */}
                            <div className="flex gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                                <button onClick={() => { setIsDetailOpen(false); openEdit(vp); }}
                                    className="btn-premium btn-black flex-1 flex items-center justify-center gap-2">
                                    <Edit2 size={14} /> Edit Product
                                </button>
                                <button onClick={() => { handleDelete(vp.id || (vp as any)._id); setIsDetailOpen(false); }}
                                    className="btn-premium btn-white flex-shrink-0 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 hover:border-rose-200">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </AdminModal>
        </>
    );
};

/* ── DrawerField helper ── */
const DrawerField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1 flex items-center gap-1">
            {label}{required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
);

export default ProductManager;
