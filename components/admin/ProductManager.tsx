import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import {
    Plus, Edit2, Trash2, Search, Eye, X, Image as ImageIcon, Ruler, Palette,
    FileText, CheckCircle2, ChevronRight, Tag, Package, Layers, Star,
    TrendingUp, AlertCircle, Grid, List, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import AdminModal from './AdminModal';
import { supabase } from '../../services/supabase';

const CATEGORIES = ['Sarees', 'Blouses', 'Ethnic Wear', 'Luxe Collection'];

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const badgeFor = (prod: Product) => {
    if (prod.isTrending) return { label: 'Trending', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (prod.isNewArrival) return { label: 'New', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (prod.isBestSeller) return { label: 'Best Seller', color: 'bg-violet-50 text-violet-700 border-violet-200' };
    return null;
};

const totalStock = (prod: Product) =>
    Object.values(prod.stock || {}).reduce((a: number, b: number) => a + b, 0);

/* ─── drawer steps ─────────────────────────────────────────────────────────── */
const STEPS = ['Identity', 'Media', 'Valuation', 'Details', 'Badges'];

/* ─── COMPONENT ────────────────────────────────────────────────────────────── */
const ProductManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerStep, setDrawerStep] = useState(0);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Detail modal
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const emptyForm: Partial<Product> = {
        name: '', brand: 'GS Heritage', category: 'Sarees', subcategory: '',
        price: 0, originalPrice: 0, description: '',
        images: [''], sizes: ['Onesize'], colors: [''],
        stock: { Onesize: 0 }, sku: '', fabric: '',
        materialAndCare: [''], specifications: [''],
        isTrending: false, isNewArrival: false, isBestSeller: false,
    };
    const [form, setForm] = useState<Partial<Product>>(emptyForm);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data) setProducts(data);
        setLoading(false);
    };

    const openAdd = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setDrawerStep(0);
        setDrawerOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setForm(p);
        setDrawerStep(0);
        setDrawerOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseFloat(value) : (e.target as HTMLInputElement).checked ?? value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleListChange = (index: number, value: string, field: 'images' | 'materialAndCare' | 'specifications' | 'colors') => {
        const newList = [...(form[field] || [])];
        newList[index] = value;
        setForm(prev => ({ ...prev, [field]: newList }));
    };

    const addListItem = (field: 'images' | 'materialAndCare' | 'specifications' | 'colors') =>
        setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));

    const removeListItem = (index: number, field: 'images' | 'materialAndCare' | 'specifications' | 'colors') =>
        setForm(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));

    const handleStockChange = (size: string, quantity: number) =>
        setForm(prev => ({ ...prev, stock: { ...prev.stock, [size]: quantity } }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log('Submitting Product:', form);
        setDrawerOpen(false);
        setLoading(false);
    };

    /* filtered + sorted products */
    const displayed = [...products]
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'stock') return totalStock(b) - totalStock(a);
            return a.name.localeCompare(b.name);
        });

    /* ─── DRAWER CONTENT per step ─────────────────────────────────────────── */
    const renderStep = () => {
        switch (drawerStep) {
            /* Step 0: Identity */
            case 0:
                return (
                    <div className="space-y-5">
                        <DrawerField label="Garment Name" required>
                            <input name="name" value={form.name} onChange={handleFormChange} required
                                placeholder="e.g. Handwoven Banarasi Silk Saree"
                                className="drawer-input" />
                        </DrawerField>
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Brand">
                                <input name="brand" value={form.brand} onChange={handleFormChange}
                                    placeholder="GS Heritage" className="drawer-input" />
                            </DrawerField>
                            <DrawerField label="SKU Code">
                                <input name="sku" value={form.sku} onChange={handleFormChange}
                                    placeholder="GS-SR-001" className="drawer-input font-mono" />
                            </DrawerField>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Category">
                                <select name="category" value={form.category} onChange={handleFormChange} className="drawer-input">
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </DrawerField>
                            <DrawerField label="Sub-Category">
                                <input name="subcategory" value={form.subcategory} onChange={handleFormChange}
                                    placeholder="e.g. Traditional" className="drawer-input" />
                            </DrawerField>
                        </div>
                        <DrawerField label="Description">
                            <textarea name="description" value={form.description} onChange={handleFormChange}
                                rows={4} placeholder="Describe the piece in detail…"
                                className="drawer-input resize-none" />
                        </DrawerField>
                    </div>
                );

            /* Step 1: Media */
            case 1:
                return (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Add image URLs (first is the cover)</p>
                        {form.images?.map((img, idx) => (
                            <div key={idx} className="flex gap-3 items-center group">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {img ? <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <ImageIcon size={14} className="text-gray-300" />}
                                </div>
                                <input type="url" value={img} onChange={(e) => handleListChange(idx, e.target.value, 'images')}
                                    placeholder={`Image ${idx + 1} URL`} className="drawer-input flex-1" />
                                {idx > 0 && (
                                    <button type="button" onClick={() => removeListItem(idx, 'images')}
                                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('images')}
                            className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:gap-3 transition-all">
                            <Plus size={14} strokeWidth={3} /> Add Another Angle
                        </button>
                    </div>
                );

            /* Step 2: Valuation & Inventory */
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <DrawerField label="Selling Price (₹)" required>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/40 font-serif">₹</span>
                                    <input type="number" name="price" value={form.price} onChange={handleFormChange}
                                        className="drawer-input pl-8" />
                                </div>
                            </DrawerField>
                            <DrawerField label="MRP / Original (₹)">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/30 font-serif">₹</span>
                                    <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleFormChange}
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
                        <div className="border-t border-gray-50 pt-5">
                            <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-4">Stock by Size</p>
                            <div className="space-y-3">
                                {Object.entries(form.stock || {}).map(([size, qty]) => (
                                    <div key={size} className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black w-20">{size}</span>
                                        <input type="number" value={qty} onChange={(e) => handleStockChange(size, parseInt(e.target.value) || 0)}
                                            className="w-20 p-2 bg-white border border-gray-200 rounded-xl text-sm text-center font-black outline-none focus:ring-4 focus:ring-black/5 focus:border-black" />
                                        <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${(qty as number) > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                            {(qty as number) > 0 ? 'In Stock' : 'Out'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            /* Step 3: Fabric & Care */
            case 3:
                return (
                    <div className="space-y-5">
                        <DrawerField label="Fabric Composition">
                            <input name="fabric" value={form.fabric} onChange={handleFormChange}
                                placeholder="e.g. 100% Pure Silk with Gold Zari" className="drawer-input" />
                        </DrawerField>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-3">Care Instructions</p>
                            {form.materialAndCare?.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center mb-3">
                                    <input type="text" value={item} onChange={(e) => handleListChange(idx, e.target.value, 'materialAndCare')}
                                        placeholder="e.g. Dry Clean Only" className="drawer-input flex-1" />
                                    <button type="button" onClick={() => removeListItem(idx, 'materialAndCare')}
                                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem('materialAndCare')}
                                className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:gap-3 transition-all">
                                <Plus size={14} strokeWidth={3} /> Add Instruction
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
                            { key: 'isTrending', label: 'Trending Now', desc: 'Show in trending section', icon: <TrendingUp size={18} /> },
                            { key: 'isNewArrival', label: 'New Arrival', desc: 'Feature in new arrivals', icon: <Star size={18} /> },
                            { key: 'isBestSeller', label: 'Best Seller', desc: 'Mark as top performer', icon: <Package size={18} /> },
                        ].map(({ key, label, desc, icon }) => {
                            const active = !!(form as any)[key];
                            return (
                                <label key={key} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${active ? 'bg-black border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" name={key} checked={active} onChange={handleFormChange} className="hidden" />
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

    /* ─── JSX ──────────────────────────────────────────────────────────────── */
    return (
        <>
            {/* ── global style injected once ── */}
            <style>{`.drawer-input{width:100%;padding:.75rem 1rem;background:#f9fafb;border:1px solid #f3f4f6;border-radius:.875rem;font-size:.75rem;font-weight:700;color:#111;outline:none;transition:all .2s;}.drawer-input:focus{ring:4px;border-color:#000;box-shadow:0 0 0 4px rgba(0,0,0,.05);}textarea.drawer-input{padding:.875rem 1rem;}`}</style>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Inventory Repository</h1>
                        <p className="text-black text-sm font-medium mt-1">
                            {products.length} products across {CATEGORIES.length} categories
                        </p>
                    </div>
                    <button onClick={openAdd} className="btn-premium btn-black self-start md:self-auto">
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add New Product</span>
                    </button>
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full group">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, SKU or category…"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ArrowUpDown size={14} className="text-black/40" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all cursor-pointer appearance-none">
                            <option value="name">Name A–Z</option>
                            <option value="price">Price ↑</option>
                            <option value="stock">Stock ↓</option>
                        </select>
                    </div>

                    {/* View toggle */}
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
                            return (
                                <div key={prod.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group relative">
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                                        <img
                                            src={prod.images?.[0] || 'https://via.placeholder.com/300x400'}
                                            alt={prod.name}
                                            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        />
                                        {badge && (
                                            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        )}
                                        {/* Hover Actions */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent pt-8">
                                            <button onClick={() => { setViewingProduct(prod); setIsDetailOpen(true); }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest text-black hover:bg-white transition-colors">
                                                <Eye size={12} /> View
                                            </button>
                                            <button onClick={() => openEdit(prod)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-black/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors">
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <p className="font-black text-gray-900 text-sm tracking-tight line-clamp-1">{prod.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-base text-gray-900 italic font-serif">₹{prod.price?.toLocaleString('en-IN')}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${stock > 0 ? 'bg-gray-50 text-black border-gray-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                {stock > 0 ? `${stock} left` : 'Out'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span className="px-2.5 py-0.5 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest">{prod.category}</span>
                                            {prod.sku && <span className="text-[8px] text-black/30 font-mono font-black uppercase">{prod.sku}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List view */
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
                                    return (
                                        <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        <img src={prod.images?.[0] || 'https://via.placeholder.com/80'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm tracking-tight line-clamp-1">{prod.name}</p>
                                                        <p className="text-[9px] text-black/40 font-mono font-black uppercase mt-0.5">{prod.sku || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest">{prod.category}</span>
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
                                                    <button onClick={() => { setViewingProduct(prod); setIsDetailOpen(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-lg shadow-sm transition-all">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button onClick={() => openEdit(prod)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-lg shadow-sm transition-all">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg shadow-sm transition-all">
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
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SLIDE-IN DRAWER for Add / Edit                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

                    {/* Panel */}
                    <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
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

                        {/* Drawer Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="px-8 py-6">
                                {renderStep()}
                            </div>
                        </form>

                        {/* Drawer Footer */}
                        <div className="px-8 py-6 border-t border-gray-50 flex gap-3">
                            {drawerStep > 0 && (
                                <button type="button" onClick={() => setDrawerStep(s => s - 1)}
                                    className="btn-premium btn-white flex-1">
                                    Back
                                </button>
                            )}
                            {drawerStep < STEPS.length - 1 ? (
                                <button type="button" onClick={() => setDrawerStep(s => s + 1)}
                                    className="btn-premium btn-black flex-[2] group">
                                    Continue <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button type="submit" onClick={handleSubmit} disabled={loading}
                                    className="btn-premium btn-black flex-[2]">
                                    {loading ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* DETAIL VIEW MODAL                                               */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <AdminModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Product Details">
                {viewingProduct && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Images */}
                        <div className="space-y-3">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                <img src={viewingProduct.images?.[0]} alt={viewingProduct.name} className="w-full h-full object-cover" />
                            </div>
                            {viewingProduct.images && viewingProduct.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {viewingProduct.images.slice(1, 5).map((img, i) => (
                                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter font-serif italic">{viewingProduct.name}</h2>
                                <p className="text-[10px] text-black font-black uppercase tracking-[0.3em] mt-1">{viewingProduct.brand} • {viewingProduct.category}</p>
                            </div>

                            <div className="flex items-end gap-4 py-4 border-y border-gray-50">
                                <div>
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">Selling Price</p>
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter italic font-serif">₹{viewingProduct.price?.toLocaleString('en-IN')}</p>
                                </div>
                                {viewingProduct.originalPrice && (
                                    <div>
                                        <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">MRP</p>
                                        <p className="text-lg font-black text-black/30 line-through font-serif">₹{viewingProduct.originalPrice.toLocaleString('en-IN')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">SKU</p>
                                    <p className="text-xs font-mono font-black text-black">{viewingProduct.sku || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-1">Fabric</p>
                                    <p className="text-xs font-black text-black">{viewingProduct.fabric || '—'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-2">Stock Availability</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(viewingProduct.stock || {}).map(([size, qty]) => (
                                        <div key={size} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-[10px] font-black uppercase text-black">{size}</span>
                                            <span className={`font-black text-sm ${(qty as number) > 0 ? 'text-black' : 'text-rose-500'}`}>{qty as number}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {viewingProduct.description && (
                                <div>
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest mb-2">Description</p>
                                    <p className="text-sm text-gray-600 leading-relaxed font-serif italic">{viewingProduct.description}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setIsDetailOpen(false); openEdit(viewingProduct); }}
                                    className="btn-premium btn-black flex-1">
                                    <Edit2 size={14} /> Edit Product
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </>
    );
};

/* ─── Small helper wrapper ─────────────────────────────────────────────────── */
const DrawerField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1 flex items-center gap-1">
            {label}{required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
);

export default ProductManager;
