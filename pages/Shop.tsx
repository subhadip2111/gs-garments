
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, NAV_ITEMS_STRUCTURE, NavStructure } from '../constants';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useApp } from '../App';
import { Product } from '../types';

const Shop: React.FC = () => {
  const { products, isLoadingProducts } = useApp();
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
  const activeColor = searchParams.get('color') || 'All';

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
    if (activeColor !== 'All') result = result.filter(p => p.colors?.includes(activeColor));
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
  }, [products, activeCategory, activeSubcategory, activeItem, activeSort, activePriceMax, activeBrand, activeColor, searchQuery]);

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
    <div className="border-b border-gray-100 py-8 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex justify-between items-center group"
      >
        <div className="flex items-center gap-4">
          <span className={`text-[12px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${openSections.includes(id) ? 'text-black translate-x-1' : 'text-zinc-400 group-hover:text-black'}`}>
            {title}
          </span>
          {isActive && <div className="w-1.5 h-1.5 bg-vogue-500 rounded-full"></div>}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-all duration-500">
          <i className={`fa-solid fa-plus text-[10px] transition-transform duration-500 ${openSections.includes(id) ? 'rotate-45' : ''}`}></i>
        </div>
      </button>
      <div className={`mt-8 space-y-4 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${openSections.includes(id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="space-y-4">
      <div className="pb-8 border-b border-zinc-100">
        <h3 className="text-[14px] font-serif font-bold italic text-black/90 tracking-wider">FILTERS</h3>
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Refining {filteredProducts.length} Results</p>
      </div>

      <FilterSection title="Categories" id="category" isActive={activeCategory !== 'All'}>
        <div className="flex flex-col gap-2">
          {/* All Categories Option */}
          <button
            onClick={() => updateParams('category', 'All')}
            className={`flex items-center py-2 text-[14px] transition-all ${activeCategory === 'All' ? 'text-black font-bold' : 'text-zinc-400 hover:text-black'}`}
          >
            All Products
          </button>

          {NAV_ITEMS_STRUCTURE.map(cat => (
            <div key={cat.id} className="flex flex-col">
              <div className="flex items-center justify-between group">
                <button
                  onClick={() => updateParams('category', cat.id)}
                  className={`flex-grow text-left py-2 text-[14px] transition-all ${activeCategory === cat.id ? 'text-black font-bold' : 'text-zinc-400 hover:text-black'}`}
                >
                  {cat.name}
                </button>
                <button
                  onClick={() => toggleExpandedCategory(cat.name)}
                  className={`p-2 text-[10px] transition-all ${expandedCategories.includes(cat.name) ? 'rotate-180 text-black' : 'text-zinc-300 hover:text-black'}`}
                >
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
              </div>

              {/* Subcategories */}
              <div className={`pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-500 ${expandedCategories.includes(cat.name) ? 'max-h-96 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                {cat.subcategories.map(sub => (
                  <div key={sub.name} className="flex flex-col">
                    <div className="flex items-center justify-between group">
                      <button
                        onClick={() => updateParams('subcategory', sub.name)}
                        className={`flex-grow text-left py-1.5 text-[13px] transition-all ${activeSubcategory === sub.name ? 'text-black font-bold' : 'text-zinc-500 hover:text-black'}`}
                      >
                        {sub.name}
                      </button>
                      <button
                        onClick={() => toggleExpandedSubcategory(sub.name)}
                        className={`p-2 text-[9px] transition-all ${expandedSubcategories.includes(sub.name) ? 'rotate-180 text-black' : 'text-zinc-300 hover:text-black'}`}
                      >
                        <i className="fa-solid fa-chevron-down"></i>
                      </button>
                    </div>

                    {/* Items */}
                    <div className={`pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${expandedSubcategories.includes(sub.name) ? 'max-h-48 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {sub.items.map(item => (
                        <button
                          key={item}
                          onClick={() => updateParams('item', item)}
                          className={`text-left py-1 text-[12px] transition-all ${activeItem === item ? 'text-vogue-600 font-bold' : 'text-zinc-400 hover:text-vogue-600'}`}
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
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative font-sans">
      {/* Header Section */}
      <div className="flex flex-col mb-12 lg:mb-20 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100/50">
          <div className="flex flex-col gap-4">
            <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
              <Link to="/" className="hover:text-black transition-colors">Studio</Link>
              <i className="fa-solid fa-chevron-right text-[6px] opacity-30"></i>
              <span className="text-black">Archive</span>
            </nav>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              {activeCategory === 'All' ? 'Curations' : activeCategory === 'Accessories' ? 'Essentials' : activeCategory}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-grow lg:justify-end">
            {/* Page Specific Search */}
            <div className="relative group w-full lg:w-72">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs transition-colors group-focus-within:text-vogue-600"></i>
              <input
                type="text"
                placeholder="Search in curations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-[12px] font-medium outline-none focus:border-vogue-600 focus:ring-4 focus:ring-vogue-50 shadow-sm transition-all"
              />
            </div>

            {/* Brand Filter Dropdown */}
            <div className="relative group min-w-[160px]">
              <select
                value={activeBrand}
                onChange={(e) => updateParams('brand', e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-vogue-600 transition-all appearance-none pr-10 shadow-sm"
              >
                <option value="All">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
            </div>

            {/* Price Filter Dropdown */}
            <div className="relative group min-w-[160px]">
              <select
                value={activePriceMax.toString()}
                onChange={(e) => updateParams('maxPrice', e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-vogue-600 transition-all appearance-none pr-10 shadow-sm"
              >
                <option value="15000">Any Price</option>
                <option value="2000">Under ₹2,000</option>
                <option value="5000">Under ₹5,000</option>
                <option value="8000">Under ₹8,000</option>
                <option value="12000">Under ₹12,000</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
            </div>

            {/* Sort Dropdown */}
            <div className="relative group min-w-[160px]">
              <select
                value={activeSort}
                onChange={(e) => updateParams('sort', e.target.value)}
                className="w-full bg-zinc-900 text-white border-none rounded-xl py-3 px-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-black transition-all appearance-none pr-10 shadow-xl"
              >
                <option value="newest">What's New</option>
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
              </select>
              <i className="fa-solid fa-arrow-down-wide-short absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000 || activeColor !== 'All' || activeSubcategory !== 'All' || activeItem !== 'All') && (
          <div className="flex flex-wrap items-center gap-3 py-6 border-y border-zinc-100 animate-in slide-in-from-left duration-700">
            <span className="text-[12px] font-bold text-gray-500 mr-2 uppercase tracking-tight">Active Filters:</span>
            {activeCategory !== 'All' && (
              <button
                onClick={() => updateParams('category', 'All')}
                className="group flex items-center gap-2 px-4 py-1.5 bg-vogue-600 text-white rounded-full text-[11px] font-medium transition-all hover:bg-black"
              >
                <span>{NAV_ITEMS_STRUCTURE.find(n => n.id === activeCategory)?.name || activeCategory}</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            {activeSubcategory !== 'All' && (
              <button onClick={() => updateParams('subcategory', 'All')} className="group flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all hover:bg-gray-200">
                <span>{activeSubcategory}</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            {activeItem !== 'All' && (
              <button onClick={() => updateParams('item', 'All')} className="group flex items-center gap-2 px-4 py-1.5 bg-zinc-800 text-white rounded-full text-[11px] font-medium transition-all hover:bg-black">
                <span>{activeItem}</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            {activeBrand !== 'All' && (
              <button onClick={() => updateParams('brand', 'All')} className="group flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all hover:bg-gray-200">
                <span>{activeBrand}</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            {activeColor !== 'All' && (
              <button onClick={() => updateParams('color', 'All')} className="group flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all hover:bg-gray-200">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: activeColor.toLowerCase() }}></div>
                  {activeColor}
                </span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            {activePriceMax < 15000 && (
              <button onClick={() => updateParams('maxPrice', '15000')} className="group flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all hover:bg-gray-200">
                <span>Under ₹{activePriceMax}</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-vogue-600 hover:text-black transition-colors ml-4 uppercase tracking-tighter"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-24">
        {/* Elite Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-32">
            <SidebarContent />
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24 mb-40">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-60 text-center animate-in fade-in duration-1000">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-12 transform hover:scale-110 transition-transform duration-700">
                <i className="fa-solid fa-wind text-2xl text-zinc-200"></i>
              </div>
              <h3 className="text-4xl font-serif font-bold tracking-tight mb-6 italic text-zinc-200 uppercase">The Archive is Silent.</h3>
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-12 max-w-xs mx-auto leading-relaxed">Adjust your refining parameters to reveal hidden curated gems.</p>
              <button onClick={clearAllFilters} className="bg-black text-white px-16 py-6 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all shadow-2xl rounded-full">Explore All Collections</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation (Sort & Filter) - Myntra Style */}
      <div className="fixed lg:hidden bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[60] flex items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setIsMobileSortOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-3 border-r border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <i className="fa-solid fa-arrow-down-wide-short text-gray-500"></i>
          <span className="text-[13px] font-bold uppercase tracking-wider text-[#282c3f]">Sort</span>
        </button>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <i className="fa-solid fa-filter text-gray-500"></i>
          <span className="text-[13px] font-bold uppercase tracking-wider text-[#282c3f]">Filter</span>
          {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000 || activeColor !== 'All' || activeSubcategory !== 'All') && (
            <div className="w-2 h-2 bg-vogue-600 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[16px] font-bold uppercase tracking-widest">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="w-10 h-10 flex items-center justify-center">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto px-6 py-4 no-scrollbar">
            <SidebarContent />
          </div>
          <div className="p-4 border-t border-gray-100 bg-white flex gap-4">
            <button
              onClick={() => { clearAllFilters(); setIsMobileFiltersOpen(false); }}
              className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest text-vogue-600 border border-vogue-600 rounded-md"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest bg-vogue-600 text-white rounded-md shadow-lg"
            >
              Apply Refined
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sort Bottom Sheet */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileSortOpen(false)}></div>
          <div className="relative w-full bg-white rounded-t-[32px] animate-in slide-in-from-bottom duration-300 p-8">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Sort Selection</h3>
            <div className="space-y-2">
              {[
                { id: 'newest', label: "What's New" },
                { id: 'popular', label: "Popularity" },
                { id: 'price-low', label: "Price: Low to High" },
                { id: 'price-high', label: "Price: High to Low" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateParams('sort', opt.id); setIsMobileSortOpen(false); }}
                  className={`w-full flex items-center justify-between py-5 border-b border-gray-50 last:border-0 ${activeSort === opt.id ? 'text-vogue-600' : 'text-[#282c3f]'}`}
                >
                  <span className="text-[14px] font-bold">{opt.label}</span>
                  {activeSort === opt.id && <i className="fa-solid fa-circle-check"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
