
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useApp } from '../App';
import { Product } from '../types';
import ComparisonModal from '../components/ComparisonModal';

const Shop: React.FC = () => {
  const { products, isLoadingProducts, comparisonList, clearComparison, toggleComparison } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSections, setOpenSections] = useState<string[]>(['category', 'brand', 'price']);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';
  const activeSubcategory = searchParams.get('subcategory') || 'All';
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
    if (activeBrand !== 'All') result = result.filter(p => p.name.toLowerCase().includes(activeBrand.toLowerCase()));
    result = result.filter(p => p.price <= activePriceMax);

    if (activeSort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (activeSort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (activeSort === 'popular') result.sort((a, b) => b.rating - a.rating);
    if (activeSort === 'newest') result.reverse();
    return result;
  }, [products, activeCategory, activeSubcategory, activeSort, activePriceMax, activeBrand]);

  const comparedProducts = useMemo(() => {
    return products.filter(p => comparisonList.includes(p.id));
  }, [products, comparisonList]);

  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => setSearchParams({});

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
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
      <div className={`mt-8 space-y-4 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${openSections.includes(id) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      {/* Header Section */}
      <div className="flex flex-col mb-20 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6">
            <nav className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
              <Link to="/" className="hover:text-black transition-colors">Studio</Link>
              <i className="fa-solid fa-chevron-right text-[7px] opacity-30"></i>
              <span className="text-black">Archive</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-none">
              {activeCategory === 'All' ? 'Curations' : activeCategory}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group min-w-[200px]">
              <span className="absolute -top-6 left-0 text-[8px] font-bold uppercase tracking-[0.5em] text-zinc-400 px-1">Sequence</span>
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={(e) => updateParams('sort', e.target.value)}
                  className="w-full bg-white border-b-2 border-zinc-100 py-3 text-[11px] font-bold uppercase tracking-[0.2em] outline-none cursor-pointer hover:border-black transition-all appearance-none pr-10"
                >
                  <option value="newest">Recent Additions</option>
                  <option value="popular">Curation Rating</option>
                  <option value="price-low">Value: Low-High</option>
                  <option value="price-high">Value: High-Low</option>
                </select>
                <i className="fa-solid fa-sort absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-300 pointer-events-none"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        {(activeCategory !== 'All' || activeBrand !== 'All' || activePriceMax < 15000) && (
          <div className="flex flex-wrap items-center gap-4 py-8 border-y border-zinc-50 animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-vogue-500 whitespace-nowrap">Active Refining</span>
            </div>
            {activeCategory !== 'All' && (
              <button onClick={() => updateParams('category', 'All')} className="group flex items-center gap-4 px-6 py-3 bg-[#F5F5F7] hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-sm">
                <span>Category: {activeCategory}</span>
                <i className="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
              </button>
            )}
            {activeSubcategory !== 'All' && (
              <button onClick={() => updateParams('subcategory', 'All')} className="group flex items-center gap-4 px-6 py-3 bg-vogue-500 text-black hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-sm">
                <span>Sub: {activeSubcategory}</span>
                <i className="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
              </button>
            )}
            {activeBrand !== 'All' && (
              <button onClick={() => updateParams('brand', 'All')} className="group flex items-center gap-4 px-6 py-3 bg-[#F5F5F7] hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-sm">
                <span>Heritage: {activeBrand}</span>
                <i className="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
              </button>
            )}
            {activePriceMax < 15000 && (
              <button onClick={() => updateParams('maxPrice', '15000')} className="group flex items-center gap-4 px-6 py-3 bg-[#F5F5F7] hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-sm">
                <span>Value Ceiling: ₹{activePriceMax.toLocaleString()}</span>
                <i className="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline underline-offset-8 ml-4 px-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-24">
        {/* Elite Sidebar Filters */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-32 space-y-4">
            <div className="pb-8 border-b border-zinc-100">
              <h3 className="text-[14px] font-serif font-bold italic text-black/90">Filter Engine</h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Refining {filteredProducts.length} Results</p>
            </div>

            <FilterSection title="Categories" id="category" isActive={activeCategory !== 'All'}>
              <div className="flex flex-col gap-2">
                {['All', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateParams('category', cat)}
                    className={`group flex items-center justify-between py-3 transition-all duration-300 ${activeCategory === cat ? 'text-black font-bold' : 'text-zinc-400 hover:text-black'}`}
                  >
                    <span className="text-[14px] transition-colors">{cat}</span>
                    <span className={`text-[10px] transition-opacity ${activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                      {products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Sub categories" id="subcategory" isActive={activeSubcategory !== 'All'}>
              <div className="flex flex-wrap gap-2">
                {['All', ...subcategories].map(sub => (
                  <button
                    key={sub}
                    onClick={() => updateParams('subcategory', sub)}
                    className={`text-[12px] transition-all duration-300 ${activeSubcategory === sub ? 'text-black font-bold border-b border-black' : 'text-zinc-400 hover:text-black'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Heritage Brands" id="brand" isActive={activeBrand !== 'All'}>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-2">
                {['All', ...brands].map(brand => (
                  <button
                    key={brand}
                    onClick={() => updateParams('brand', brand)}
                    className={`flex items-center py-2 text-[13px] transition-all duration-300 ${activeBrand === brand ? 'text-black font-bold' : 'text-zinc-400 hover:text-black'}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Value Sensitivity" id="price" isActive={activePriceMax < 15000}>
              <div className="px-1 pt-2 space-y-8">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-zinc-300 tracking-[0.3em] uppercase">Threshold</span>
                  <span className="text-2xl font-serif font-bold tracking-tighter">₹{activePriceMax.toLocaleString()}</span>
                </div>
                <div className="relative h-1 bg-zinc-100 rounded-full">
                  <div
                    className="absolute h-full bg-black rounded-full"
                    style={{ width: `${(activePriceMax / 15000) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min="0" max="15000" step="500"
                    value={activePriceMax}
                    onChange={(e) => updateParams('maxPrice', e.target.value)}
                    className="absolute -top-2 w-full h-5 bg-transparent appearance-none cursor-pointer accent-black outline-none"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                  <span>Min</span>
                  <span>Premium Limit</span>
                </div>
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24 mb-40">
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
      </div >

      {/* Comparison Overlay Bar */}
      {
        comparisonList.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full z-50 animate-in slide-in-from-bottom duration-700">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-zinc-100 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)]"></div>
            <div className="relative max-w-[1600px] mx-auto px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex flex-wrap items-center gap-10">
                <div className="hidden lg:block">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Curated Stack</h4>
                  <p className="text-[10px] font-serif italic text-zinc-400 mt-1">{comparisonList.length} of 4 select pieces</p>
                </div>
                <div className="flex gap-4">
                  {comparedProducts.map(product => (
                    <div key={product.id} className="relative group w-16 h-20 bg-gray-50 rounded-lg overflow-hidden border border-zinc-100 shadow-xl transition-all duration-500 hover:scale-110">
                      <img src={product.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={product.name} />
                      <button
                        onClick={() => toggleComparison(product.id)}
                        className="absolute inset-0 bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </div>
                  ))}
                  {comparisonList.length < 4 && (
                    <div className="w-16 h-20 border-2 border-dashed border-zinc-100 rounded-lg flex items-center justify-center text-zinc-200 hover:border-black hover:text-black transition-all cursor-pointer">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-10 w-full md:w-auto">
                <button
                  onClick={clearComparison}
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 hover:text-black transition-all"
                >
                  Clear Stack
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  disabled={comparisonList.length < 2}
                  className="flex-grow md:flex-none bg-black text-white px-16 py-6 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-vogue-500 transition-all shadow-3xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-4 rounded-full"
                >
                  <span>Final Analysis</span>
                  <i className="fa-solid fa-bolt-lightning text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        isCompareModalOpen && (
          <ComparisonModal
            products={comparedProducts}
            onClose={() => setIsCompareModalOpen(false)}
          />
        )
      }
    </div >
  );
};

export default Shop;
