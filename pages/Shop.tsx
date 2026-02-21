
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, NAV_ITEMS_STRUCTURE, NavStructure } from '../constants';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useAppSelector } from '../store';
import { Product } from '../types';

const Shop: React.FC = () => {
  const products = useAppSelector((state) => state.products.items);
  const isLoadingProducts = useAppSelector((state) => state.products.isLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSections, setOpenSections] = useState<string[]>(['category']);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('category') || 'All';
  const activeSubcategory = searchParams.get('subcategory') || 'All';
  const activeItem = searchParams.get('item') || 'All';

  // Automatically expand active filter branches
  React.useEffect(() => {
    if (activeCategory !== 'All') {
      const navItem = NAV_ITEMS_STRUCTURE.find(n => n.id === activeCategory);
      if (navItem && !expandedCategories.includes(navItem.name)) {
        setExpandedCategories(prev => [...prev, navItem.name]);
      }
    }
    if (activeSubcategory !== 'All' && !expandedSubcategories.includes(activeSubcategory)) {
      setExpandedSubcategories(prev => [...prev, activeSubcategory]);
    }
  }, [activeCategory, activeSubcategory]);

  const activeSort = searchParams.get('sort') || 'newest';
  const activePriceMax = parseInt(searchParams.get('maxPrice') || '15000');
  const activeBrand = searchParams.get('brand') || 'All';

  const brands = useMemo<string[]>(() => {
    const allBrands = products.map((p: Product) => p.name.split(' ')[0]);
    return Array.from(new Set(allBrands));
  }, [products]);

  const subcategories = useMemo<string[]>(() => {
    let pool = products;
    if (activeCategory !== 'All') pool = pool.filter(p => p.category === activeCategory);
    const allSubcats = pool.map((p: Product) => p.subcategory);
    return Array.from(new Set(allSubcats));
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== 'All') result = result.filter(p => p.category === activeCategory);
    if (activeSubcategory !== 'All') result = result.filter(p => p.subcategory === activeSubcategory);
    // If specific item is selected, we might need to filter by name matching or subcategory matching
    if (activeItem !== 'All') {
      result = result.filter(p =>
        p.subcategory === activeItem ||
        p.name.toLowerCase().includes(activeItem.toLowerCase())
      );
    }
    if (activeBrand !== 'All') result = result.filter(p => p.name.toLowerCase().includes(activeBrand.toLowerCase()));
    result = result.filter(p => p.price <= activePriceMax);

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeSort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (activeSort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (activeSort === 'popular') result.sort((a, b) => b.rating - a.rating);
    if (activeSort === 'newest') result.reverse();
    return result;
  }, [products, activeCategory, activeSubcategory, activeItem, activeSort, activePriceMax, activeBrand, searchQuery]);

  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) newParams.delete(key);
    else newParams.set(key, value);

    // Reset lower levels when upper level changes
    if (key === 'category') {
      newParams.delete('subcategory');
      newParams.delete('item');
    } else if (key === 'subcategory') {
      newParams.delete('item');
    }

    setSearchParams(newParams);
  };

  const clearAllFilters = () => setSearchParams({});

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleExpandedCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleExpandedSubcategory = (sub: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const FilterSection = ({ title, id, isActive, children }: { title: string, id: string, isActive?: boolean, children?: React.ReactNode }) => (
    <div className="border-b border-zinc-100 py-6 last:border-0 group/section">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex justify-between items-center group/btn"
      >
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${openSections.includes(id) ? 'text-black' : 'text-zinc-400 group-hover/section:text-zinc-900'}`}>
            {title}
          </span>
          {isActive && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-pulse"></div>}
        </div>
        <div className={`transition-transform duration-500 text-[10px] text-zinc-300 group-hover/btn:text-black ${openSections.includes(id) ? 'rotate-180' : ''}`}>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${openSections.includes(id) ? 'max-h-[800px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="pb-10 mb-2 border-b border-zinc-100">
        <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-300 uppercase mb-2">Refine Collection</h3>
        <p className="text-[24px] font-serif font-bold italic text-black tracking-tight">{filteredProducts.length} <span className="text-zinc-300 text-[14px] not-italic font-sans uppercase tracking-[0.2em] ml-2 font-black">Pieces</span></p>
      </div>

      <FilterSection title="Categories" id="category" isActive={activeCategory !== 'All'}>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => updateParams('category', 'All')}
            className={`w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${activeCategory === 'All' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
          >
            All Archive
          </button>

          {NAV_ITEMS_STRUCTURE.map(cat => (
            <div key={cat.id} className="pt-1">
              <div className="flex items-center justify-between group/cat py-1.5 px-3 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer" onClick={() => updateParams('category', cat.id)}>
                <span className={`text-[13px] font-medium transition-all ${activeCategory === cat.id ? 'text-black font-bold' : 'text-zinc-500 group-hover/cat:text-zinc-900'}`}>
                  {cat.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandedCategory(cat.name);
                  }}
                  className={`p-1.5 text-[9px] transition-all hover:bg-zinc-100 rounded ${expandedCategories.includes(cat.name) ? 'rotate-180 text-black' : 'text-zinc-300 hover:text-black'}`}
                >
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
              </div>

              <div className={`overflow-hidden transition-all duration-500 ${expandedCategories.includes(cat.name) ? 'max-h-[500px] opacity-100 ml-4 border-l border-zinc-100 mt-2' : 'max-h-0 opacity-0'}`}>
                {cat.subcategories.map(sub => (
                  <div key={sub.name} className="py-1">
                    <div className="flex items-center justify-between group/sub px-4 py-1.5 cursor-pointer rounded-r-lg hover:bg-zinc-50/80 transition-all" onClick={() => updateParams('subcategory', sub.name)}>
                      <span className={`text-[12px] font-medium transition-all ${activeSubcategory === sub.name ? 'text-zinc-950 font-black' : 'text-zinc-400 group-hover/sub:text-zinc-700'}`}>
                        {sub.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandedSubcategory(sub.name);
                        }}
                        className={`p-1 text-[8px] transition-all ${expandedSubcategories.includes(sub.name) ? 'rotate-180 text-black' : 'text-zinc-200 hover:text-black'}`}
                      >
                        <i className="fa-solid fa-chevron-down"></i>
                      </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ${expandedSubcategories.includes(sub.name) ? 'max-h-96 opacity-100 ml-4 mt-1 border-l border-zinc-100/50' : 'max-h-0 opacity-0'}`}>
                      {sub.items.map(item => (
                        <button
                          key={item}
                          onClick={() => updateParams('item', item)}
                          className={`w-full text-left px-4 py-1.5 text-[11px] font-medium transition-all ${activeItem === item ? 'text-black font-black bg-zinc-50 rounded-r-md border-l-2 border-black -ml-[1px]' : 'text-zinc-400 hover:text-zinc-700 hover:translate-x-1'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range" id="price" isActive={activePriceMax < 15000}>
        <div className="grid grid-cols-2 gap-2">
          {[2000, 5000, 8000, 12000, 15000].map(price => (
            <button
              key={price}
              onClick={() => updateParams('maxPrice', price.toString())}
              className={`flex items-center justify-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePriceMax === price ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
            >
              {price === 15000 ? 'No Limit' : `Under ₹${price / 1000}k`}
            </button>
          ))}
        </div>
      </FilterSection>

      <div className="pt-10">
        <button
          onClick={clearAllFilters}
          className="w-full py-5 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-black border-b border-zinc-100 hover:border-black transition-all duration-700"
        >
          Reset All
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-24">
        {/* Superior Header */}
        <div className="pt-32 pb-16 lg:pt-40 lg:pb-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-zinc-100 pb-16">
            <div className="space-y-8 max-w-2xl">
              <nav className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">
                <Link to="/" className="hover:text-black transition-colors">Atelier</Link>
                <i className="fa-solid fa-circle text-[4px] opacity-20"></i>
                <span className="text-black">Collections</span>
              </nav>
              <h1 className="text-7xl md:text-9xl font-serif font-black tracking-tighter leading-[0.8] text-zinc-900">
                {activeCategory === 'All' ? 'The \n Archive.' : activeCategory === 'Luxe Collection' ? 'Elite \n Archive.' : activeCategory + '.'}
              </h1>
              <p className="text-zinc-400 font-medium tracking-wide text-lg max-w-md">
                A meticulously curated selection of exceptional pieces, where traditional craftsmanship meets contemporary vision.
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="flex items-center gap-4">
                <div className="relative group w-full lg:w-96">
                  <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 text-sm transition-colors group-focus-within:text-black"></i>
                  <input
                    type="text"
                    placeholder="Search the archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-[2rem] py-5 pl-14 pr-8 text-[13px] font-medium outline-none focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <select
                    value={activeSort}
                    onChange={(e) => updateParams('sort', e.target.value)}
                    className="appearance-none bg-black text-white rounded-[2rem] py-5 pl-8 pr-14 text-[11px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-zinc-800 transition-all shadow-2xl"
                  >
                    <option value="newest">Recent</option>
                    <option value="popular">Curated</option>
                    <option value="price-low">Inexpensive</option>
                    <option value="price-high">Prestige</option>
                  </select>
                  <i className="fa-solid fa-arrow-down-wide-short absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none"></i>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000 || activeSubcategory !== 'All' || activeItem !== 'All') && (
                <div className="flex flex-wrap items-center gap-3 animate-in slide-in-from-right duration-700">
                  <button onClick={clearAllFilters} className="text-[9px] font-black text-zinc-300 hover:text-black uppercase tracking-[0.3em] transition-colors pr-2 border-r border-zinc-100">Clear All</button>
                  {activeCategory !== 'All' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span>{activeCategory}</span>
                      <button onClick={() => updateParams('category', 'All')}><i className="fa-solid fa-xmark text-[9px] hover:scale-125 transition-transform"></i></button>
                    </div>
                  )}
                  {activeSubcategory !== 'All' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span>{activeSubcategory}</span>
                      <button onClick={() => updateParams('subcategory', 'All')}><i className="fa-solid fa-xmark text-[9px] text-zinc-400 hover:text-black"></i></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-24 lg:gap-32 pb-40">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-40">
              <SidebarContent />
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-grow">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
                {filteredProducts.map(product => (
                  <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${filteredProducts.indexOf(product) * 50}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-60 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
                <div className="w-40 h-40 bg-zinc-50 flex items-center justify-center rounded-full mb-12 border border-zinc-100 shadow-inner">
                  <i className="fa-solid fa-shimmer text-4xl text-zinc-100"></i>
                </div>
                <h3 className="text-4xl font-serif font-black italic text-zinc-900 mb-6 uppercase tracking-tighter">Nothing Found.</h3>
                <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-12 max-w-xs leading-relaxed">Consider a different perspective or reset your refinery.</p>
                <button onClick={clearAllFilters} className="bg-black text-white px-20 py-7 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-zinc-800 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-full active:scale-95">Reset View</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Mobile Bottom Menu */}
      <div className="fixed lg:hidden bottom-8 left-1/2 -translate-x-1/2 w-[90%] bg-zinc-950/90 backdrop-blur-2xl rounded-[3rem] z-[60] flex items-center h-20 shadow-2xl border border-white/10 px-4 group">
        <button
          onClick={() => setIsMobileSortOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-4 text-white hover:bg-white/5 rounded-l-[3rem] transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <i className="fa-solid fa-sort text-xs"></i>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sort</span>
        </button>
        <div className="w-[1px] h-8 bg-white/10"></div>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-4 text-white hover:bg-white/5 rounded-r-[3rem] transition-all group/fbtn"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative overflow-hidden">
            <i className="fa-solid fa-filter text-xs"></i>
            {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000 || activeSubcategory !== 'All') && (
              <div className="absolute inset-0 bg-zinc-500/20 animate-pulse"></div>
            )}
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Refine</span>
          {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000 || activeSubcategory !== 'All') && (
            <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]"></div>
          )}
        </button>
      </div>

      {/* Premium Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-500 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full animate-in slide-in-from-right duration-700 shadow-2xl flex flex-col pt-12">
            <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-100">
              <div className="space-y-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Archive refinery</h2>
                <div className="text-3xl font-serif font-black italic">Settings.</div>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors border border-zinc-100"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-10 py-10 no-scrollbar">
              <SidebarContent />
            </div>

            <div className="p-10 border-t border-zinc-100 bg-white/80 backdrop-blur-xl flex gap-6">
              <button
                onClick={() => { clearAllFilters(); setIsMobileFiltersOpen(false); }}
                className="flex-1 py-7 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-black transition-all"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-[2] py-7 px-10 text-[10px] font-black uppercase tracking-[0.5em] bg-black text-white rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:bg-zinc-800 transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Sort Modal */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsMobileSortOpen(false)}></div>
          <div className="relative w-full bg-white rounded-t-[4rem] animate-in slide-in-from-bottom duration-700 p-12 shadow-2xl border-t border-white/20">
            <div className="w-16 h-1.5 bg-zinc-100 rounded-full mx-auto mb-12"></div>
            <div className="space-y-4">
              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2">Display Mode</h3>
                <div className="text-4xl font-serif font-black italic">Sort Pieces.</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'newest', label: "What's New", icon: 'fa-sparkles' },
                  { id: 'popular', label: "Aesthetic Preference", icon: 'fa-heart' },
                  { id: 'price-low', label: "Price: Low to High", icon: 'fa-arrow-down-short-wide' },
                  { id: 'price-high', label: "Price: High to Low", icon: 'fa-arrow-up-wide-short' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { updateParams('sort', opt.id); setIsMobileSortOpen(false); }}
                    className={`w-full flex items-center justify-between p-8 rounded-[2rem] transition-all group ${activeSort === opt.id ? 'bg-black text-white shadow-2xl' : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeSort === opt.id ? 'bg-white/10' : 'bg-white group-hover:scale-110'}`}>
                        <i className={`fa-solid ${opt.icon} text-lg`}></i>
                      </div>
                      <span className="text-[14px] font-bold uppercase tracking-tight">{opt.label}</span>
                    </div>
                    {activeSort === opt.id && <i className="fa-solid fa-circle-check text-xl text-vogue-500"></i>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
