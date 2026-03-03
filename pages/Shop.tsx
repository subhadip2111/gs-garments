import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useAppSelector, useAppDispatch } from '../store';
import { Product } from '../types';
import { useCategoryData } from '../hooks/useCategoryData';
import { getAllProducts } from '../api/auth/ProductApi';
import { setProducts, setLoadingProducts, setProductsError } from '../store/productSlice';

const FilterSection = ({ title, children, showClear, onClear }: { title: string, children: React.ReactNode, showClear?: boolean, onClear?: () => void }) => (
  <div className="border-b border-zinc-100 py-6 last:border-0">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900">{title}</h4>
      {showClear && (
        <button onClick={onClear} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase">Clear</button>
      )}
    </div>
    <div className="space-y-2.5">
      {children}
    </div>
  </div>
);

const CheckboxOption = ({ label, count, isChecked, onChange }: { label: string, count?: number, isChecked: boolean, onChange: () => void, key?: React.Key }) => (
  <label className="flex items-center group cursor-pointer">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-[3px] checked:bg-emerald-500 checked:border-emerald-500 transition-all"
      />
      <i className="fa-solid fa-check absolute text-[10px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none"></i>
    </div>
    <span className={`ml-3 text-[14px] transition-colors ${isChecked ? 'text-zinc-900 font-medium' : 'text-zinc-500 lg:text-zinc-600 group-hover:text-zinc-900'}`}>
      {label}
    </span>
    {count !== undefined && (
      <span className="ml-auto text-[12px] text-zinc-300 font-medium">({count})</span>
    )}
  </label>
);

const Shop: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const isLoadingProducts = useAppSelector((state) => state.products.isLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSections, setOpenSections] = useState<string[]>(['category']);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { categories, subcategories: allSubcategories, getSubcategoriesForCategory, getCategoryName, getSubcategoryName } = useCategoryData();

  const activeCategory = searchParams.get('category') || 'All';
  const activeSubcategory = searchParams.get('subcategory') || 'All';
  const activeItem = searchParams.get('item') || 'All';

  const activeSort = searchParams.get('sort') || 'newest';
  const activePriceMax = parseInt(searchParams.get('maxPrice') || '15000');
  const activeBrand = searchParams.get('brand') || 'All';

  // Fetch products from API when params change
  React.useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoadingProducts(true));
      try {
        const filters: any = {};
        if (activeCategory !== 'All') filters.category = activeCategory;
        if (activeSubcategory !== 'All') filters.subcategory = activeSubcategory;
        if (searchQuery) filters.search = searchQuery;

        const data = await getAllProducts(filters);
        // Assuming data is the array or has a results field
        dispatch(setProducts(data.results || data));
      } catch (err: any) {
        dispatch(setProductsError(err.message || 'Failed to fetch products'));
      }
    };
    fetchProducts();
  }, [dispatch, activeCategory, activeSubcategory, searchQuery]);

  // Subcategories for the active category
  const filteredSubcategories = useMemo(() => {
    if (activeCategory === 'All') return [];
    return getSubcategoriesForCategory(activeCategory);
  }, [activeCategory, allSubcategories]);

  const brands = useMemo<string[]>(() => {
    const allBrands = products.map((p: Product) => {
      if (typeof p.brand === 'object' && p.brand) return p.brand.name;
      return p.brand || p.name.split(' ')[0];
    }).filter(Boolean);
    return Array.from(new Set(allBrands));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== 'All') {
      result = result.filter(p => {
        const catId = (p.category && typeof p.category === 'object') ? (p.category._id || p.category.id) : p.category;
        return catId === activeCategory;
      });
    }
    if (activeSubcategory !== 'All') {
      result = result.filter(p => {
        const subId = (p.subcategory && typeof p.subcategory === 'object') ? (p.subcategory._id || p.subcategory.id) : p.subcategory;
        return subId === activeSubcategory;
      });
    }
    if (activeItem !== 'All') {
      result = result.filter(p => {
        const subName = (p.subcategory && typeof p.subcategory === 'object') ? (p.subcategory as any).name : p.subcategory;
        return subName === activeItem || p.name.toLowerCase().includes(activeItem.toLowerCase());
      });
    }
    if (activeBrand !== 'All') {
      result = result.filter(p => {
        const brandName = (p.brand && typeof p.brand === 'object') ? (p.brand as any).name : p.brand;
        return (brandName || p.name).toLowerCase().includes(activeBrand.toLowerCase());
      });
    }
    result = result.filter(p => p.price <= activePriceMax);

    if (searchQuery) {
      result = result.filter(p => {
        const bName = (p.brand && typeof p.brand === 'object') ? (p.brand as any).name : p.brand;
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (bName || '').toLowerCase().includes(searchQuery.toLowerCase());
      });
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

    if (key === 'category') {
      newParams.delete('subcategory');
      newParams.delete('item');
    } else if (key === 'subcategory') {
      newParams.delete('item');
    }

    setSearchParams(newParams);
  };

  const clearAllFilters = () => setSearchParams({});

  // Compute counts
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const catId = (p.category && typeof p.category === 'object') ? (p.category._id || p.category.id) : p.category;
      const subId = (p.subcategory && typeof p.subcategory === 'object') ? (p.subcategory._id || p.subcategory.id) : p.subcategory;
      if (catId) counts[`cat:${catId}`] = (counts[`cat:${catId}`] || 0) + 1;
      if (subId) counts[`sub:${subId}`] = (counts[`sub:${subId}`] || 0) + 1;

      const brand = typeof p.brand === 'object' ? p.brand?.name : (p.brand || p.name.split(' ')[0]);
      if (brand) counts[`brand:${brand}`] = (counts[`brand:${brand}`] || 0) + 1;
    });
    return counts;
  }, [products]);

  const activeCategoryName = activeCategory === 'All' ? 'All Pieces' : getCategoryName(activeCategory);

  const SidebarContent = () => (
    <div className="flex flex-col">
      <FilterSection title="Categories">
        <CheckboxOption
          label="All Collections"
          isChecked={activeCategory === 'All'}
          onChange={() => updateParams('category', 'All')}
        />
        {categories.map(cat => {
          const catId = cat._id || cat.id;
          return (
            <CheckboxOption
              key={catId}
              label={cat.name}
              count={filterCounts[`cat:${catId}`]}
              isChecked={activeCategory === catId}
              onChange={() => updateParams('category', activeCategory === catId ? 'All' : catId)}
            />
          );
        })}
      </FilterSection>

      {activeCategory !== 'All' && filteredSubcategories.length > 0 && (
        <FilterSection title="Subcategories" showClear={activeSubcategory !== 'All'} onClear={() => updateParams('subcategory', 'All')}>
          {filteredSubcategories.map(sub => {
            const subId = sub._id || sub.id;
            return (
              <CheckboxOption
                key={subId}
                label={sub.name}
                count={filterCounts[`sub:${subId}`]}
                isChecked={activeSubcategory === subId}
                onChange={() => updateParams('subcategory', activeSubcategory === subId ? 'All' : subId)}
              />
            );
          })}
        </FilterSection>
      )}

      <FilterSection title="Brand" showClear={activeBrand !== 'All'} onClear={() => updateParams('brand', 'All')}>
        {brands.map(brand => (
          <CheckboxOption
            key={brand}
            label={brand}
            count={filterCounts[`brand:${brand}`]}
            isChecked={activeBrand === brand}
            onChange={() => updateParams('brand', activeBrand === brand ? 'All' : brand)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        <div className="space-y-3">
          {[299, 499, 999, 1499, 1999, 2499, 2999].map(price => (
            <label key={price} className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={activePriceMax === price}
                onChange={() => updateParams('maxPrice', price.toString())}
                className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-full checked:border-4 checked:border-emerald-500 transition-all"
              />
              <span className={`ml-3 text-[14px] transition-colors ${activePriceMax === price ? 'text-zinc-900 font-medium' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                {price === 15000 ? 'No Limit' : `Under ₹${price}`}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  const [activeMobileFilterTab, setActiveMobileFilterTab] = useState('category');

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-12 lg:px-20">
        {/* Standard E-commerce Header */}
        <div className="pt-24 pb-8 lg:pt-32">
          <nav className="flex items-center gap-2 text-[12px] text-zinc-400 mb-8">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
            <span className="text-zinc-900 font-medium">Clothing</span>
            {activeCategory !== 'All' && (
              <>
                <i className="fa-solid fa-chevron-right text-[8px]"></i>
                <span className="text-zinc-900 font-medium">{activeCategoryName}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-baseline gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {activeCategoryName}
              </h1>
              <span className="text-zinc-400 text-sm font-medium"> - {filteredProducts.length} items</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="relative group w-full md:w-80">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-md py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="hidden lg:block relative group border border-zinc-200 rounded-md px-4 py-2 hover:border-zinc-400 transition-all">
                <select
                  value={activeSort}
                  onChange={(e) => updateParams('sort', e.target.value)}
                  className="appearance-none bg-transparent text-[13px] font-bold text-zinc-700 outline-none cursor-pointer pr-8"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="popular">Sort by: Popular</option>
                  <option value="price-low">Sort by: Price Low-High</option>
                  <option value="price-high">Sort by: Price High-Low</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 pb-20 mt-4">
          {/* Myntra-style Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-zinc-100 pr-8 sticky top-32 self-start max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[14px] font-bold uppercase tracking-widest">Filters</span>
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase"
              >
                Clear All
              </button>
            </div>
            <SidebarContent />
          </aside>

          {/* Grid Area */}
          <div className="flex-grow">
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-40 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-zinc-50 flex items-center justify-center rounded-full mb-8">
                  <i className="fa-solid fa-search text-3xl text-zinc-200"></i>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">We couldn't find any items</h3>
                <p className="text-zinc-500 text-sm mb-8">Try adjusting your filters to find what you're looking for.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Mobile Bottom Actions */}
      <div className="fixed lg:hidden bottom-0 left-0 w-full h-14 bg-white border-t border-zinc-100 flex items-center z-[70]">
        <button
          onClick={() => setIsMobileSortOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-2 text-zinc-900 font-bold text-[13px] border-r border-zinc-100"
        >
          <i className="fa-solid fa-sort text-zinc-400"></i>
          SORT
        </button>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 h-full flex items-center justify-center gap-2 text-zinc-900 font-bold text-[13px]"
        >
          <i className="fa-solid fa-filter text-zinc-400"></i>
          FILTER
        </button>
      </div>

      {/* Dual-Pane Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 h-14">
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-zinc-900">Filters</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-zinc-400"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex-grow flex overflow-hidden">
            {/* Left Pane: Categories */}
            <div className="w-1/3 bg-zinc-50 border-r border-zinc-100 overflow-y-auto no-scrollbar">
              {[
                { id: 'category', label: 'Categories' },
                { id: 'subcategory', label: 'Subcategory' },
                { id: 'brand', label: 'Brand' },
                { id: 'price', label: 'Price' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMobileFilterTab(tab.id)}
                  className={`w-full text-left px-4 py-5 text-[13px] font-bold border-l-4 transition-all ${activeMobileFilterTab === tab.id ? 'bg-white border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-600'}`}
                >
                  {tab.label}
                  {((tab.id === 'category' && activeCategory !== 'All') ||
                    (tab.id === 'subcategory' && activeSubcategory !== 'All') ||
                    (tab.id === 'brand' && activeBrand !== 'All') ||
                    (tab.id === 'price' && activePriceMax < 15000)) && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1"></div>
                    )}
                </button>
              ))}
            </div>

            {/* Right Pane: Options */}
            <div className="w-2/3 bg-white px-6 py-6 overflow-y-auto no-scrollbar">
              {activeMobileFilterTab === 'category' && (
                <div className="space-y-6">
                  {categories.map(cat => {
                    const catId = cat._id || cat.id;
                    return (
                      <CheckboxOption
                        key={catId}
                        label={cat.name}
                        count={filterCounts[`cat:${catId}`]}
                        isChecked={activeCategory === catId}
                        onChange={() => updateParams('category', catId)}
                      />
                    );
                  })}
                </div>
              )}
              {activeMobileFilterTab === 'subcategory' && (
                <div className="space-y-6">
                  {filteredSubcategories.map(sub => {
                    const subId = sub._id || sub.id;
                    return (
                      <CheckboxOption
                        key={subId}
                        label={sub.name}
                        count={filterCounts[`sub:${subId}`]}
                        isChecked={activeSubcategory === subId}
                        onChange={() => updateParams('subcategory', subId)}
                      />
                    );
                  })}
                  {filteredSubcategories.length === 0 && (
                    <p className="text-sm text-zinc-400">Select a category first</p>
                  )}
                </div>
              )}
              {activeMobileFilterTab === 'brand' && (
                <div className="space-y-6">
                  {brands.map(brand => (
                    <CheckboxOption
                      key={brand}
                      label={brand}
                      count={filterCounts[`brand:${brand}`]}
                      isChecked={activeBrand === brand}
                      onChange={() => updateParams('brand', brand)}
                    />
                  ))}
                </div>
              )}
              {activeMobileFilterTab === 'price' && (
                <div className="space-y-6">
                  {[2000, 5000, 8000, 12000, 15000].map(price => (
                    <label key={price} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="price-mobile"
                        checked={activePriceMax === price}
                        onChange={() => updateParams('maxPrice', price.toString())}
                        className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-full checked:border-4 checked:border-emerald-500 transition-all"
                      />
                      <span className={`ml-3 text-[14px] transition-colors ${activePriceMax === price ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                        {price === 15000 ? 'No Limit' : `Under ₹${price}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-16 border-t border-zinc-100 flex items-center px-4 gap-4 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => { clearAllFilters(); setIsMobileFiltersOpen(false); }}
              className="flex-1 py-3 text-[13px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 rounded-md"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="flex-[1.5] py-3 text-[13px] font-bold text-white bg-emerald-500 uppercase tracking-widest rounded-md shadow-lg shadow-emerald-500/20"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileSortOpen(false)}></div>
          <div className="relative w-full bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-500 p-6">
            <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 mb-6 px-2">Sort by</h3>
            <div className="space-y-1">
              {[
                { id: 'newest', label: "Newest" },
                { id: 'popular', label: "Popular" },
                { id: 'price-low', label: "Price: Low to High" },
                { id: 'price-high', label: "Price: High to Low" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateParams('sort', opt.id); setIsMobileSortOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${activeSort === opt.id ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'}`}
                >
                  <span className="text-[15px]">{opt.label}</span>
                  {activeSort === opt.id && <i className="fa-solid fa-check text-emerald-500"></i>}
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
